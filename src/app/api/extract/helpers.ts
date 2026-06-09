import { SchemaMode, StandupEntities, RetroEntities } from "./types";

export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  if (token === "sk_mock_pro_key_9281") return token;
  if (token.startsWith("gsk_")) return token;
  return null;
}

export function validateSchemaMode(schema: string | null): SchemaMode | null {
  if (!schema) return "standup";
  if (schema === "retro") return "retro";
  if (schema === "standup") return "standup";
  return null;
}

export function validateAudioFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > 100 * 1024 * 1024) return "File size exceeds 100MB limit.";
  
  const isAudio = file.type.startsWith("audio/");
  if (!isAudio) {
    return "Invalid file type. Only audio files are supported.";
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeJsonParse(jsonString: string): any | { error: string } {
  try {
    return JSON.parse(jsonString);
  } catch (_error) {
    return { error: "Failed to parse JSON from inference provider." };
  }
}

export const defaultRetroPrompt = `You are an expert technical project manager and AI extraction system. Read the audio transcript of a sprint retrospective.
If the transcript is too vague to confidently create action items, you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user. DO NOT guess if it's vague.
IMPORTANT: If the transcript contains no actionable feedback, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate items.`;

export const defaultStandupPrompt = `You are an expert technical project manager and AI extraction system. Read the audio transcript of a daily standup and extract tasks, bugs, and blockers. 
If the transcript is too vague to confidently create tickets, you MUST return "requires_clarification": true and a list of "clarification_questions" to ask the user. DO NOT guess the task if it's vague.
IMPORTANT: If the transcript contains no actionable tasks, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate tickets.`;

export const defaultRetroSchema = `You are an expert AI extraction system. Read the audio transcript of a sprint retrospective.
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

export const defaultStandupSchema = `You are an expert AI extraction system. Read the audio transcript of a daily standup and extract tasks, bugs, and blockers. 
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
      "timestamp_start": 0,
      "timestamp_end": 0,
      "labels": ["standup", "auto-generated"]
    }
  ]
}
IMPORTANT: If the transcript contains no actionable tasks, or says 'No speech detected', return empty arrays. DO NOT invent or hallucinate tickets.`;

export function getSystemPrompt(mode: SchemaMode, customPrompt?: string | null): string {
  if (customPrompt && customPrompt.trim() !== "") {
    return customPrompt;
  }
  return mode === "retro" ? defaultRetroSchema : defaultStandupSchema;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeStandupEntities(input: any): StandupEntities {
  return {
    requires_clarification: Boolean(input?.requires_clarification),
    clarification_questions: Array.isArray(input?.clarification_questions) ? input.clarification_questions : [],
    sprint_id: input?.sprint_id || undefined,
    date: input?.date || new Date().toISOString(),
    participants: Array.isArray(input?.participants) ? input.participants : [],
    updates: Array.isArray(input?.updates) ? input.updates : [],
    extracted_tickets: Array.isArray(input?.extracted_tickets) ? input.extracted_tickets : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeRetroEntities(input: any): RetroEntities {
  return {
    requires_clarification: Boolean(input?.requires_clarification),
    clarification_questions: Array.isArray(input?.clarification_questions) ? input.clarification_questions : [],
    sprint_id: input?.sprint_id || undefined,
    date: input?.date || new Date().toISOString(),
    retro_categories: {
      went_well: Array.isArray(input?.retro_categories?.went_well) ? input.retro_categories.went_well : [],
      needs_improvement: Array.isArray(input?.retro_categories?.needs_improvement) ? input.retro_categories.needs_improvement : [],
      action_items: Array.isArray(input?.retro_categories?.action_items) ? input.retro_categories.action_items : []
    }
  };
}
