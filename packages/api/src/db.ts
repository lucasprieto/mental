import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { pg as schema } from "@mental/db";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
