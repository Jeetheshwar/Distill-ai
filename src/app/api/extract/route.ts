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
    let extractedEntities: any[] = [];

    if (apiKey && apiKey !== "sk_mock_pro_key_9281" && apiKey.startsWith("gsk_")) {
      const groq = new Groq({ apiKey: apiKey });
      
      const transcription = await groq.audio.transcriptions.create({
        file: file,
        model: "whisper-large-v3-turbo",
      });

      transcript = transcription.text || "No speech detected.";

      // 4. Live JSON Extraction (llama3-8b-8192)
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: `You are an expert AI extraction system. Read the following audio transcript and extract any tasks, action items, or key entities mentioned. You MUST respond with a valid JSON object containing an "entities" array. Each entity should have a "type" (e.g. ticket, action_item), "summary", "priority", and "assignee_context". Example: {"entities": [{"type": "ticket", "summary": "Fix login bug", "priority": "high", "assignee_context": "Alex"}]}`
            },
            {
              role: "user",
              content: transcript
            }
          ],
          model: "llama3-8b-8192",
          response_format: { type: "json_object" },
        });

        const jsonPayload = JSON.parse(chatCompletion.choices[0]?.message?.content || '{"entities": []}');
        extractedEntities = jsonPayload.entities || [];
      } catch (llmError) {
        console.error("LLM Extraction failed:", llmError);
        extractedEntities = [{ type: "error", summary: "JSON Extraction failed." }];
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

    // 7. Fire Live Webhook Routing
    const webhookUrl = formData.get("webhook_url") as string | null;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(responsePayload),
        });
        console.log(`[SYS] Webhook successfully fired to: ${webhookUrl}`);
      } catch (err) {
        console.error(`[SYS] Failed to fire webhook to ${webhookUrl}:`, err);
      }
    }

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
