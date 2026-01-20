import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import itemsRoute from "./routes/items.js";
import sessionsRoute from "./routes/sessions.js";
import followupsRoute from "./routes/followups.js";
import apiKeysRoute from "./routes/api-keys.js";

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
app.route("/followups", followupsRoute);
app.route("/api-keys", apiKeysRoute);

// Export type for RPC client
export type AppType = typeof app;

// Re-export route types for granular typing
export type { ItemsRoute } from "./routes/items.js";
export type { SessionsRoute } from "./routes/sessions.js";
export type { FollowupsRoute } from "./routes/followups.js";
export type { ApiKeysRoute } from "./routes/api-keys.js";

// Start server
const port = parseInt(process.env.PORT || "3000");
console.log(`Starting Mental API server on port ${port}`);
serve({ fetch: app.fetch, port });
