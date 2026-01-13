// Schema exports
export { mentalItems } from "./schema";
export type { MentalItemRow, NewMentalItemRow } from "./schema";

// Client exports
export { getDb } from "./client";
export type { DbClient } from "./client";

// Re-export drizzle-orm utilities to avoid version conflicts in consumers
export { desc, eq } from "drizzle-orm";

// Re-export cuid2 for ID generation
export { createId } from "@paralleldrive/cuid2";
