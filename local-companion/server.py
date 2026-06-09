import os
import uuid
import json
import requests
from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel

app = FastAPI(title="Distill Local Companion")

# Configure CORS for local browser access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "base")

# Load Whisper lazily or globally
whisper_model = None

def get_whisper():
    global whisper_model
    if whisper_model is None:
        print(f"Loading Whisper model '{WHISPER_MODEL}'...")
        whisper_model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return whisper_model

def get_prompt_for_schema(schema: str) -> str:
    if schema == "retro":
        return """You are an expert AI extraction system. Read the audio transcript of a sprint retrospective.
If the transcript is too vague to confidently create action items, you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user.
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
IMPORTANT: If the transcript contains no actionable feedback, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate items."""
    else:
        return """You are an expert AI extraction system. Read the audio transcript of a daily standup and extract tasks, bugs, and blockers. 
If the transcript is too vague to confidently create tickets, you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user.
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
      "timestamp_start": 0,
      "timestamp_end": 0,
      "labels": ["standup", "auto-generated"]
    }
  ]
}
IMPORTANT: If the transcript contains no actionable tasks, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate tickets."""

def normalize_retro(data: dict) -> dict:
    return {
        "requires_clarification": bool(data.get("requires_clarification", False)),
        "clarification_questions": data.get("clarification_questions", []),
        "sprint_id": data.get("sprint_id", ""),
        "date": data.get("date", ""),
        "retro_categories": {
            "went_well": data.get("retro_categories", {}).get("went_well", []),
            "needs_improvement": data.get("retro_categories", {}).get("needs_improvement", []),
            "action_items": data.get("retro_categories", {}).get("action_items", [])
        }
    }

def normalize_standup(data: dict) -> dict:
    return {
        "requires_clarification": bool(data.get("requires_clarification", False)),
        "clarification_questions": data.get("clarification_questions", []),
        "sprint_id": data.get("sprint_id", ""),
        "date": data.get("date", ""),
        "participants": data.get("participants", []),
        "updates": data.get("updates", []),
        "extracted_tickets": data.get("extracted_tickets", [])
    }

@app.options("/{path:path}")
async def options_handler(request):
    return {}

@app.middleware("http")
async def add_private_network_header(request, call_next):
    response = await call_next(request)
    if "Origin" in request.headers:
        response.headers["Access-Control-Allow-Private-Network"] = "true"
    return response

@app.get("/health")
def health_check():
    return {
        "ok": True,
        "provider": "local",
        "asr": "faster-whisper",
        "llm": "ollama",
        "ollama_url": OLLAMA_BASE_URL
    }

@app.post("/extract")
async def extract_audio(file: UploadFile = File(None), schema: str = Form("standup"), transcript: str = Form(None), answers: str = Form(None)):
    if file is None and transcript is None:
        return {"error": "Missing audio file or transcript."}

    # 1. Transcribe Audio
    final_transcript = transcript
    if not final_transcript and file:
        file_bytes = await file.read()
        file_path = f"temp_{uuid.uuid4().hex}_{file.filename}"
        with open(file_path, "wb") as f:
            f.write(file_bytes)
        
        try:
            model = get_whisper()
            segments, info = model.transcribe(file_path, beam_size=5)
            text_segments = [s.text for s in segments]
            final_transcript = " ".join(text_segments).strip()
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            return {"error": f"Transcription failed: {str(e)}"}
        
        if os.path.exists(file_path):
            os.remove(file_path)

    if not final_transcript:
        final_transcript = "No speech detected."

    # 2. Extract with Ollama
    system_prompt = get_prompt_for_schema(schema)
    user_prompt = final_transcript
    if answers:
        user_prompt += f"\n\n[USER CLARIFICATIONS PROVIDED]:\n{answers}\n\nPlease generate the final tickets incorporating these clarifications. Ensure 'requires_clarification' is false if enough context is now provided."

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "format": "json",
        "stream": False
    }

    try:
        ollama_res = requests.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
        if ollama_res.status_code != 200:
            if "model" in ollama_res.text and "not found" in ollama_res.text:
                return {"error": f"Ollama model '{OLLAMA_MODEL}' not found. Please run `ollama pull {OLLAMA_MODEL}`"}
            return {"error": f"Ollama extraction failed: {ollama_res.text}"}
        
        response_json = ollama_res.json()
        content = response_json.get("message", {}).get("content", "{}")
        
        try:
            entities = json.loads(content)
            if schema == "retro":
                entities = normalize_retro(entities)
            else:
                entities = normalize_standup(entities)
        except Exception as e:
            return {"error": "Failed to parse JSON from Ollama"}

        # 3. Return Payload
        return {
            "id": f"ext_local_{uuid.uuid4().hex[:8]}",
            "status": "completed",
            "metadata": {
                "source": file.filename if file else "Clarification Submission",
                "size_bytes": 0,
                "duration_seconds": 0,
                "model": "local",
                "schema_applied": schema
            },
            "transcript": final_transcript,
            "entities": entities
        }

    except requests.exceptions.ConnectionError:
        return {"error": f"Could not connect to Ollama at {OLLAMA_BASE_URL}. Is Ollama running?"}
    except Exception as e:
        return {"error": f"Local extraction failed: {str(e)}"}
