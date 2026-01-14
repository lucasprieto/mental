/**
 * Core mental item type - represents a thought/topic captured from a session
 */
export interface MentalItem {
  /** Unique identifier (cuid) */
  id: string;

  /** Brief title/summary of the thought */
  title: string;

  /** Full content of the captured thought */
  content: string;

  /** Auto-extracted or LLM-provided theme */
  theme: string | null;

  /** Current status of the item */
  status: "open" | "resolved";

  /** Summary of how the item was resolved */
  resolution: string | null;

  /** Links item to a specific session for tracking */
  sessionId: string | null;

  /** When the item was created */
  createdAt: Date;

  /** When the item was last updated */
  updatedAt: Date;

  /** When the item was resolved (if resolved) */
  resolvedAt: Date | null;
}

/**
 * Input for creating a new mental item
 */
export interface CreateMentalItemInput {
  title: string;
  content: string;
  theme?: string | null;
  sessionId?: string | null;
}

/**
 * Input for resolving a mental item
 */
export interface ResolveMentalItemInput {
  id: string;
  resolution: string;
}
