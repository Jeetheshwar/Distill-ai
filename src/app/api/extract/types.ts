export type SchemaMode = "standup" | "retro";

export interface ExtractionMetadata {
  source: string;
  size_bytes: number;
  duration_seconds: number;
  model: string;
  schema_applied: SchemaMode;
}

export interface StandupEntities {
  requires_clarification: boolean;
  clarification_questions: string[];
  sprint_id?: string;
  date?: string;
  participants: string[];
  updates: Array<{
    speaker: string;
    yesterday?: string;
    today?: string;
    blockers: string[];
    confidence_score?: number;
  }>;
  extracted_tickets: Array<{
    title: string;
    description: string;
    type: "Task" | "Bug" | "Story" | "Blocker";
    priority: "Low" | "Medium" | "High" | "Critical";
    assignee?: string;
    timestamp_start?: number;
    timestamp_end?: number;
    labels: string[];
  }>;
}

export interface RetroEntities {
  requires_clarification: boolean;
  clarification_questions: string[];
  sprint_id?: string;
  date?: string;
  retro_categories: {
    went_well: string[];
    needs_improvement: string[];
    action_items: Array<{
      title: string;
      owner?: string;
      due_date?: string;
      ticket_type: "Improvement" | "Task";
    }>;
  };
}

export interface NormalizedExtractionResponse {
  id: string;
  status: "completed" | "failed";
  metadata: ExtractionMetadata;
  transcript: string;
  entities: StandupEntities | RetroEntities | { error: string };
}
