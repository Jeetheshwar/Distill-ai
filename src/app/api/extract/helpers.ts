import { z } from "zod";
import { SchemaMode } from "./types";

export function extractAuthToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.substring(7).trim();
  if (token === "sk_mock_pro_key_9281") return token;
  if (token.startsWith("gsk_")) return token;
  return null;
}

export function validateSchemaMode(schema: string | null): SchemaMode {
  if (schema === "retro") return "retro";
  return "standup";
}

export function validateAudioFile(file: File | null): string | null {
  if (!file) return null;
  if (file.size > 100 * 1024 * 1024) return "File size exceeds 100MB limit.";
  
  const isAudio = file.type.startsWith("audio/");
  const isText = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt") || file.name.toLowerCase().endsWith(".md");
  
  if (!isAudio && !isText) {
    return "Invalid file type. Only audio, .txt, or .md files are supported.";
  }
  return null;
}

export function safeJsonParse(jsonString: string): any | { error: string } {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    return { error: "Failed to parse JSON from inference provider." };
  }
}

export const ZodRetroSchema = z.object({
  requires_clarification: z.boolean().describe("Set to true if the transcript is too vague to confidently create action items"),
  clarification_questions: z.array(z.string()).describe("List of questions to ask the user if clarification is needed"),
  sprint_id: z.string().describe("Optional sprint identifier"),
  date: z.string().describe("ISO date of the retrospective"),
  retro_categories: z.object({
    went_well: z.array(z.string()),
    needs_improvement: z.array(z.string()),
    action_items: z.array(z.object({
      title: z.string().describe("Short title for the action item"),
      owner: z.string().describe("Assignee or owner"),
      due_date: z.string().describe("ISO date or descriptive timeline"),
      ticket_type: z.enum(["Improvement", "Task"])
    }))
  })
});

export const ZodStandupSchema = z.object({
  requires_clarification: z.boolean().describe("Set to true if the transcript is too vague to confidently create tickets"),
  clarification_questions: z.array(z.string()).describe("List of questions to ask the user if clarification is needed"),
  sprint_id: z.string().optional().describe("Optional sprint identifier"),
  date: z.string().describe("ISO date of the standup"),
  participants: z.array(z.string()).describe("List of people in the standup"),
  updates: z.array(z.object({
    speaker: z.string(),
    yesterday: z.string(),
    today: z.string(),
    blockers: z.array(z.string()),
    confidence_score: z.number().min(0).max(1)
  })),
  extracted_tickets: z.array(z.object({
    title: z.string().describe("Short clear title"),
    description: z.string().describe("Detailed context"),
    type: z.enum(["Task", "Bug", "Story", "Blocker", "Other"]),
    priority: z.enum(["Low", "Medium", "High", "Critical"]),
    assignee: z.string(),
    timestamp_start: z.number().optional(),
    timestamp_end: z.number().optional(),
    labels: z.array(z.string())
  }))
});

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
  return mode === "retro" ? defaultRetroPrompt : defaultStandupPrompt;
}
