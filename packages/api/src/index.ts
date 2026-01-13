import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Export type for RPC client
export type AppType = typeof app;

// Start server
const port = parseInt(process.env.PORT || "3000");
console.log(`Starting Mental API server on port ${port}`);
serve({ fetch: app.fetch, port });
