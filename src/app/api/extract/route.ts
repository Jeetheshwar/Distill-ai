import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NormalizedExtractionResponse, StandupEntities, RetroEntities } from "./types";
import { extractAuthToken, validateSchemaMode, validateAudioFile, safeJsonParse, getSystemPrompt, ZodStandupSchema, ZodRetroSchema } from "./helpers";
import { zodToJsonSchema } from "zod-to-json-schema";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify BYOK Auth
    const authHeader = request.headers.get("authorization");
    const apiKey = extractAuthToken(authHeader);
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid Bring-Your-Own-Key Bearer token." },
        { status: 401 }
      );
    }

    // 1.5 Verify Free Tier Limits (10/month)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("extractions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startOfMonth.toISOString());

      if (count !== null && count >= 10) {
        return NextResponse.json(
          { error: "Free tier limit reached. You have used 10/10 extractions this month." },
          { status: 403 }
        );
      }
    }

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawSchema = formData.get("schema") as string | null;
    const providedTranscript = formData.get("transcript") as string | null;
    const answers = formData.get("answers") as string | null;

    const schema = validateSchemaMode(rawSchema);

    if (!file && !providedTranscript) {
      return NextResponse.json(
        { error: "Bad Request. Audio file binary or transcript missing from payload." },
        { status: 400 }
      );
    }

    const fileError = validateAudioFile(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    // 3. Live Groq Transcription (whisper-large-v3-turbo)
    const { default: Groq } = await import("groq-sdk");
    
    let transcript = providedTranscript || "Mocked local transcription: The team discussed migrating the main database to PostgreSQL 16. Sarah will lead the migration effort because of her prior experience with PgBouncer. It is a high priority task.";
    let durationSeconds = 45;
    let extractedEntities: StandupEntities | RetroEntities | { error: string };

    if (apiKey !== "sk_mock_pro_key_9281") {
      const groq = new Groq({ apiKey: apiKey });
      
      if (!providedTranscript && file) {
        const isTextFile = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md");
        
        if (isTextFile) {
          transcript = await file.text();
        } else {
          const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3-turbo",
            prompt: "The following is a transcript of a technical meeting, daily standup, or retrospective. It contains software engineering terminology.",
            temperature: 0.0,
          });
  
          transcript = transcription.text?.trim() || "No speech detected.";
        }
      }

      // Short-circuit if no speech or common Whisper hallucinations for silence
      const lowerTranscript = transcript.toLowerCase();
      
      // Whisper often repeats 'thank you' when it hears pure silence/static.
      // We only flag it as a hallucination if the entire text is very short or is ONLY repeating 'thank you'.
      const isHallucination = 
        transcript === "No speech detected." || 
        transcript.length < 5 ||
        (transcript.length < 100 && (
          lowerTranscript.includes("thanks for watching") ||
          lowerTranscript.includes("amara.org") ||
          lowerTranscript.replace(/thank you\.?/g, '').trim().length < 5 // Mostly just 'thank you'
        ));

      if (isHallucination) {
        extractedEntities = schema === "retro" ? {
          requires_clarification: false,
          clarification_questions: [],
          retro_categories: { went_well: [], needs_improvement: [], action_items: [] }
        } : {
          requires_clarification: false,
          clarification_questions: [],
          participants: [],
          updates: [],
          extracted_tickets: []
        };
      } else {
        // 4. Live JSON Extraction (deepseek-r1-distill-llama-70b with Zod Tool Calling)
        try {
          const customSchema = formData.get("custom_schema") as string | null;
          const systemPrompt = getSystemPrompt(schema, customSchema);
          let userPrompt = transcript;
          if (answers) {
            userPrompt += `\n\n[USER CLARIFICATIONS PROVIDED]:\n${answers}\n\nPlease generate the final tickets incorporating these clarifications. Ensure "requires_clarification" is false if enough context is now provided.`;
          }

          let jsonPayload;

          if (customSchema && customSchema.trim() !== "") {
            // Fallback to json_object for completely unstructured custom schemas
            const chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              model: "llama-3.3-70b-versatile",
              response_format: { type: "json_object" },
            });
            jsonPayload = safeJsonParse(chatCompletion.choices[0]?.message?.content || '{}');
          } else {
            // Strict Zod tool calling for base schemas
            const targetSchema = schema === "retro" ? ZodRetroSchema : ZodStandupSchema;
            const chatCompletion = await groq.chat.completions.create({
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ],
              model: "llama-3.3-70b-versatile",
              tools: [{
                type: 'function',
                function: {
                  name: 'extract_structured_data',
                  description: 'Extract actionable data from transcript',
                  parameters: zodToJsonSchema(targetSchema as any) as any,
                }
              }],
              tool_choice: { type: 'function', function: { name: 'extract_structured_data' } }
            });
            
            const toolCallArgs = chatCompletion.choices[0]?.message?.tool_calls?.[0]?.function?.arguments;
            jsonPayload = safeJsonParse(toolCallArgs || '{}');
          }

          if (jsonPayload.error) {
             throw new Error(jsonPayload.error);
          }
          extractedEntities = jsonPayload;
        } catch (llmError: any) {
          console.error("LLM Extraction failed", llmError);
          extractedEntities = { error: "JSON Extraction failed or returned malformed structure." };
        }
      } 
    } else {
      // Mocked extraction matching normalized JSON format
      if (schema === "retro") {
        extractedEntities = {
          requires_clarification: false,
          clarification_questions: [],
          retro_categories: {
            went_well: [],
            needs_improvement: [],
            action_items: [
              {
                title: "Migrate database to PostgreSQL 16",
                owner: "Sarah",
                ticket_type: "Improvement"
              }
            ]
          }
        };
      } else {
        extractedEntities = {
          requires_clarification: false,
          clarification_questions: [],
          participants: ["Sarah"],
          updates: [],
          extracted_tickets: [
            {
              title: "Migrate database to PostgreSQL 16",
              description: "Migrate the main database to PostgreSQL 16.",
              type: "Task",
              priority: "High",
              assignee: "Sarah",
              labels: ["standup", "auto-generated"]
            }
          ]
        };
      }
    }

    // 5. Database Persistence
    try {
      if (user) {
        await supabase.from("extractions").insert({
          user_id: user.id,
          source_name: file ? file.name : "Clarification Submission",
          duration_seconds: durationSeconds,
          model_used: "whisper-large-v3-turbo",
          schema_applied: schema,
          status: "completed"
        });
      }
    } catch (dbError) {
      console.error("Failed to persist extraction metadata to Supabase.");
    }

    // 6. Build Response Payload
    const responsePayload: NormalizedExtractionResponse = {
      id: `ext_${crypto.randomUUID().substring(0, 8)}`,
      status: "completed",
      metadata: {
        source: file ? file.name : "Clarification Submission",
        size_bytes: file ? file.size : Buffer.from(transcript).length,
        duration_seconds: durationSeconds,
        model: "whisper-large-v3-turbo",
        schema_applied: schema
      },
      transcript: transcript,
      entities: extractedEntities
    };

    // 7. Webhook Dispatch is now handled exclusively by the client (Human-in-the-loop)

    // 8. Return Live Artifacts
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Extraction Pipeline Error: Top level failure.");
    
    // Extract actual error message from API failures (like Groq Cloudflare blocks)
    const errorMessage = error?.error?.error?.message || error?.message || "Internal Server Error during extraction sequence.";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
