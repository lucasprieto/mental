import { getDb, type DbClient } from "@mental/db";
import path from "path";

// Use same database as MCP server
// MENTAL_DB_PATH env var or default to sibling mcp-server package
function getDbPath(): string {
  if (process.env.MENTAL_DB_PATH) {
    return process.env.MENTAL_DB_PATH;
  }
  // From packages/webapp, go to packages/mcp-server/mental.db
  // process.cwd() in Next.js is the webapp package root
  return path.join(process.cwd(), "..", "mcp-server", "mental.db");
}

let db: DbClient | null = null;

export function getDatabase(): DbClient {
  if (!db) {
    const dbPath = getDbPath();
    db = getDb(dbPath);
  }
  return db;
}
