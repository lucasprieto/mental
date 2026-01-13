import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import itemsRoute from "./routes/items.js";
import sessionsRoute from "./routes/sessions.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Routes
app.route("/items", itemsRoute);
app.route("/sessions", sessionsRoute);

// Export type for RPC client
export type AppType = typeof app;

// Re-export route types for granular typing
export type { ItemsRoute } from "./routes/items.js";
export type { SessionsRoute } from "./routes/sessions.js";

// Start server
const port = parseInt(process.env.PORT || "3000");
console.log(`Starting Mental API server on port ${port}`);
serve({ fetch: app.fetch, port });
