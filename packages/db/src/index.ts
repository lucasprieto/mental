// Schema exports (SQLite - for MCP server local use)
export { mentalItems } from "./schema";
export type { MentalItemRow, NewMentalItemRow } from "./schema";

// Postgres schema exports (for API server)
export * as pg from "./schema-pg";
export type {
  MentalItemRowPg,
  NewMentalItemRowPg,
  FollowUpRowPg,
  NewFollowUpRowPg,
  UserRowPg,
  NewUserRowPg,
  ApiKeyRowPg,
  NewApiKeyRowPg,
} from "./schema-pg";

// Direct exports for common tables (convenience)
export { users, apiKeys } from "./schema-pg";

// Client exports (SQLite)
export { getDb } from "./client";
export type { DbClient } from "./client";

// Client exports (Postgres)
export { getDbPg } from "./client-pg";
export type { DbClientPg } from "./client-pg";

// Re-export drizzle-orm utilities to avoid version conflicts in consumers
export { asc, desc, eq, sql } from "drizzle-orm";

// Re-export cuid2 for ID generation
export { createId } from "@paralleldrive/cuid2";
