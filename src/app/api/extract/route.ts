import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { NormalizedExtractionResponse, StandupEntities, RetroEntities } from "./types";
import { extractAuthToken, validateSchemaMode, validateAudioFile, safeJsonParse, getSystemPrompt, normalizeStandupEntities, normalizeRetroEntities } from "./helpers";
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
    if (!schema) {
      return NextResponse.json(
        { error: "Bad Request. Invalid schema mode provided." },
        { status: 400 }
      );
    }

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
    const durationSeconds = 45;
    let extractedEntities: StandupEntities | RetroEntities | { error: string };

    if (apiKey !== "sk_mock_pro_key_9281") {
      const groq = new Groq({ apiKey: apiKey });
      
      if (!providedTranscript && file) {
        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3-turbo",
          prompt: "The following is a transcript of a technical meeting, daily standup, or retrospective. It contains software engineering terminology.",
          temperature: 0.0,
        });
        transcript = transcription.text?.trim() || "No speech detected.";
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
        // 4. Live JSON Extraction
        try {
          const customSchema = formData.get("custom_schema") as string | null;
          const systemPrompt = getSystemPrompt(schema, customSchema);
          let userPrompt = transcript;
          if (answers) {
            userPrompt += `\n\n[USER CLARIFICATIONS PROVIDED]:\n${answers}\n\nPlease generate the final tickets incorporating these clarifications. Ensure "requires_clarification" is false if enough context is now provided.`;
          }

          const chatCompletion = await groq.chat.completions.create({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
          });
          
          const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
          const jsonPayload = safeJsonParse(rawContent);

          if (jsonPayload.error) {
             throw new Error(jsonPayload.error);
          }
          
          if (schema === "retro") {
            extractedEntities = normalizeRetroEntities(jsonPayload);
          } else {
            extractedEntities = normalizeStandupEntities(jsonPayload);
          }
        } catch (llmError: unknown) {
          console.error("LLM Extraction failed", llmError);
          return NextResponse.json(
            { error: "JSON Extraction failed or returned malformed structure." },
            { status: 500 }
          );
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
    } catch (_dbError) {
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
  } catch (error: unknown) {
    console.error("Extraction Pipeline Error: Top level failure.");
    
    const err = error as any;
    const errorMessage = err?.error?.error?.message || err?.message || "Internal Server Error during extraction sequence.";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
