import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // 1. Verify BYOK Auth
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid Bring-Your-Own-Key Bearer token." },
        { status: 401 }
      );
    }
    const apiKey = authHeader.split("Bearer ")[1].trim();

    // 2. Parse Multipart FormData
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const schema = formData.get("schema");
    const providedTranscript = formData.get("transcript") as string | null;
    const answers = formData.get("answers") as string | null;

    if (!file && !providedTranscript) {
      return NextResponse.json(
        { error: "Bad Request. Audio file binary or transcript missing from payload." },
        { status: 400 }
      );
    }
    // 3. Live Groq Transcription (whisper-large-v3-turbo)
    const { default: Groq } = await import("groq-sdk");
    
    let transcript = providedTranscript || "Mocked local transcription: The team discussed migrating the main database to PostgreSQL 16. Sarah will lead the migration effort because of her prior experience with PgBouncer. It is a high priority task.";
    let durationSeconds = 45;
    let extractedEntities: any = [];

    if (apiKey && apiKey !== "sk_mock_pro_key_9281" && apiKey.startsWith("gsk_")) {
      const groq = new Groq({ apiKey: apiKey });
      
      if (!providedTranscript && file) {
        const transcription = await groq.audio.transcriptions.create({
          file: file,
          model: "whisper-large-v3-turbo",
        });

        transcript = transcription.text?.trim() || "No speech detected.";
        console.log("Transcribed text:", transcript);
      } else {
        console.log("Using provided transcript:", transcript);
      }

      // Short-circuit if no speech or common Whisper hallucinations for silence
      const lowerTranscript = transcript.toLowerCase();
      if (
        transcript === "No speech detected." || 
        transcript.length < 5 ||
        lowerTranscript.includes("thank you.") ||
        lowerTranscript.includes("thanks for watching") ||
        lowerTranscript.includes("amara.org")
      ) {
        extractedEntities = {};
      } else {

      // 4. Live JSON Extraction (llama3-8b-8192)
      try {
        let systemPrompt = "";
        if (schema === "standup") {
          systemPrompt = `You are an expert AI extraction system. Read the audio transcript of a daily standup and extract tasks, bugs, and blockers. 
If the transcript is too vague to confidently create tickets (e.g. missing what the task actually is, or who is doing it), you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user. DO NOT guess the task if it's vague.
You MUST respond with a valid JSON object matching this schema:
{
  "requires_clarification": boolean,
  "clarification_questions": ["array of strings (questions to ask the user)"],
  "sprint_id": "string (optional)",
  "date": "ISO date",
  "participants": ["array of names"],
  "updates": [
    {
      "speaker": "string",
      "yesterday": "string",
      "today": "string", 
      "blockers": ["array of strings"],
      "confidence_score": 0.0-1.0
    }
  ],
  "extracted_tickets": [
    {
      "title": "string",
      "description": "string",
      "type": "Task | Bug | Story | Blocker",
      "priority": "Low | Medium | High | Critical",
      "assignee": "string",
      "timestamp_start": "milliseconds",
      "timestamp_end": "milliseconds",
      "labels": ["standup", "auto-generated"]
}
IMPORTANT: If the transcript contains no actionable tasks, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate tickets.`;
        } else {
          // Retro mode
          systemPrompt = `You are an expert AI extraction system. Read the audio transcript of a sprint retrospective.
If the transcript is too vague to confidently create action items (e.g. missing details on what needs to be improved), you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user. DO NOT guess if it's vague.
You MUST respond with a valid JSON object matching this schema:
{
  "requires_clarification": boolean,
  "clarification_questions": ["array of strings (questions to ask the user)"],
  "sprint_id": "string",
  "date": "ISO date",
  "retro_categories": {
    "went_well": ["array of strings"],
    "needs_improvement": ["array of strings"],
    "action_items": [
      {
        "title": "string",
        "owner": "string",
        "due_date": "ISO date",
        "ticket_type": "Improvement | Task"
      }
    ]
  }
}
IMPORTANT: If the transcript contains no actionable feedback, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate items.`;
        }

        let userPrompt = transcript;
        if (answers) {
          userPrompt += `\n\n[USER CLARIFICATIONS PROVIDED]:\n${answers}\n\nPlease generate the final tickets incorporating these clarifications. Ensure "requires_clarification" is false if enough context is now provided.`;
        }

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          model: "llama-3.1-8b-instant",
          response_format: { type: "json_object" },
        });

        const jsonPayload = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
        extractedEntities = jsonPayload;
      } catch (llmError) {
        console.error("LLM Extraction failed:", llmError);
        extractedEntities = { error: "JSON Extraction failed." };
      }
      } // Close the if (!hallucination) block
    } else {
      // Mocked extraction for local testing and open source deployments without keys
      extractedEntities = [
        {
          "type": "ticket",
          "summary": "Migrate database to PostgreSQL 16",
          "priority": "high",
          "assignee_context": "Sarah"
        }
      ];
    }

    // 5. Database Persistence (Phase 13)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from("extractions").insert({
        user_id: user.id,
        source_name: file ? file.name : "Clarification Submission",
        duration_seconds: durationSeconds,
        model_used: "whisper-large-v3-turbo",
        schema_applied: schema || "linear_feature_request",
        status: "completed"
      });
    }

    // 6. Build Response Payload
    const responsePayload = {
      id: `ext_${Math.random().toString(36).substring(2, 9)}`,
      status: "completed",
      metadata: {
        source: file ? file.name : "Clarification Submission",
        size_bytes: file ? file.size : Buffer.from(transcript).length,
        duration_seconds: durationSeconds,
        model: "whisper-large-v3-turbo",
        schema_applied: schema || "linear_feature_request"
      },
      transcript: transcript,
      entities: extractedEntities
    };

    // 7. Webhook routing moved to the client side for preview modal.
    // We just return the extracted data here.

    // 8. Return Live Artifacts
    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Extraction Pipeline Error:", error);
    
    // Extract actual error message from API failures (like Groq Cloudflare blocks)
    const errorMessage = error?.error?.error?.message || error?.message || "Internal Server Error during extraction sequence.";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
