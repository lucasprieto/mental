import { getDb, type DbClient } from "@mental/db";
import path from "path";

// Use same database as MCP server
// Default: packages/mcp-server/mental.db (relative to monorepo root)
const DB_PATH = process.env.MENTAL_DB_PATH ||
  path.join(process.cwd(), "..", "mcp-server", "mental.db");

let db: DbClient | null = null;

export function getDatabase(): DbClient {
  if (!db) {
    db = getDb(DB_PATH);
  }
  return db;
}
