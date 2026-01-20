import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import itemsRoute from "./routes/items.js";
import sessionsRoute from "./routes/sessions.js";
import followupsRoute from "./routes/followups.js";
import apiKeysRoute from "./routes/api-keys.js";

// Auth middleware (not applied globally yet - routes will opt-in)
// import { auth } from "./middleware/auth.js";
//
// To protect routes, apply middleware to specific paths:
//   app.use("/items/*", auth);
//   app.use("/sessions/*", auth);
//
// Then access user info in handlers:
//   const userId = c.get("userId");
//   const authMethod = c.get("authMethod"); // "jwt" | "api_key"
//
// Note: Auth enforcement will be enabled in Phase 19/20 after:
// 1. Database migration runs (creates users/api_keys tables)
// 2. Auth0 users created on first login
// 3. MCP configured to use API keys

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check (unauthenticated)
app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() })
);

// Routes (currently unauthenticated - auth will be enabled in Phase 19/20)
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
