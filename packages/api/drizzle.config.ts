import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "../db/src/schema-pg.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
