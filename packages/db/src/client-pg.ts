import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema-pg";

/**
 * Create a Postgres database client using Neon serverless driver.
 * Requires DATABASE_URL environment variable to be set.
 */
export function getDbPg() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const sql = neon(databaseUrl) as NeonQueryFunction<boolean, boolean>;
  return drizzle(sql, { schema });
}

export type DbClientPg = ReturnType<typeof getDbPg>;
