import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export type DbClient = ReturnType<typeof drizzle<typeof schema>>;

/**
 * Create a database client
 * @param dbPath Path to SQLite database file (defaults to ./mental.db)
 * @returns Drizzle database client with typed schema
 */
export function getDb(dbPath: string = "./mental.db"): DbClient {
  // Use require for native module compatibility with bundlers
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}
