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
    const file = formData.get("file") as File;
    const schema = formData.get("schema");

    if (!file) {
      return NextResponse.json(
        { error: "Bad Request. Audio file binary missing from payload." },
        { status: 400 }
      );
    }
    // 3. Live Groq Transcription (whisper-large-v3-turbo)
    const { default: Groq } = await import("groq-sdk");
    
    let transcript = "Mocked local transcription: The team discussed migrating the main database to PostgreSQL 16. Sarah will lead the migration effort because of her prior experience with PgBouncer. It is a high priority task.";
    let durationSeconds = 45;
    let extractedEntities: any = [];

    if (apiKey && apiKey !== "sk_mock_pro_key_9281" && apiKey.startsWith("gsk_")) {
      const groq = new Groq({ apiKey: apiKey });
      
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3-turbo",
      });

      transcript = transcription.text || "No speech detected.";

      // 4. Live JSON Extraction (llama3-8b-8192)
      try {
        let systemPrompt = "";
        if (schema === "standup") {
          systemPrompt = `You are an expert AI extraction system. Read the audio transcript of a daily standup and extract tasks, bugs, and blockers. 
You MUST respond with a valid JSON object matching this schema:
{
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
  ]
}`;
        } else {
          // Retro mode
          systemPrompt = `You are an expert AI extraction system. Read the audio transcript of a sprint retrospective.
You MUST respond with a valid JSON object matching this schema:
{
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
}`;
        }

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: transcript }
          ],
          model: "llama3-8b-8192",
          response_format: { type: "json_object" },
        });

        const jsonPayload = JSON.parse(chatCompletion.choices[0]?.message?.content || '{}');
        extractedEntities = jsonPayload;
      } catch (llmError) {
        console.error("LLM Extraction failed:", llmError);
        extractedEntities = { error: "JSON Extraction failed." };
      }
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
        source_name: file.name,
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
        source: file.name,
        size_bytes: file.size,
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error during extraction sequence." },
      { status: 500 }
    );
  }
}
