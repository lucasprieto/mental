// Schema exports (SQLite - for MCP server local use)
export { mentalItems } from "./schema";
export type { MentalItemRow, NewMentalItemRow } from "./schema";

// Postgres schema exports (for API server)
export * as pg from "./schema-pg";
export type { MentalItemRowPg, NewMentalItemRowPg } from "./schema-pg";

// Client exports
export { getDb } from "./client";
export type { DbClient } from "./client";

// Re-export drizzle-orm utilities to avoid version conflicts in consumers
export { desc, eq } from "drizzle-orm";

// Re-export cuid2 for ID generation
export { createId } from "@paralleldrive/cuid2";
