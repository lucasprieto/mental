import { createMiddleware } from "hono/factory";
import { createHash } from "crypto";
import { eq, apiKeys } from "@mental/db";
import { getDb } from "../db.js";
import { jwtAuth, getUserIdFromJwt } from "./jwt.js";

/**
 * Combined auth middleware - accepts either:
 * 1. Authorization: Bearer {jwt} - for webapp (validated via JWKS)
 * 2. X-API-Key: {key} - for MCP server (validated via database)
 *
 * Sets context variables for downstream handlers:
 * - userId: string (Auth0 sub claim or user ID from API key)
 * - authMethod: "jwt" | "api_key"
 * - apiKeyId: string (only when authenticated via API key)
 *
 * Usage:
 *   app.use("/protected/*", auth);
 *   app.get("/protected/data", (c) => {
 *     const userId = c.get("userId");
 *     const method = c.get("authMethod");
 *     // ...
 *   });
 */
export const auth = createMiddleware<{
  Variables: {
    userId: string;
    authMethod: "jwt" | "api_key";
    apiKeyId?: string;
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = c.req.header("X-API-Key");

  // Try JWT first (webapp)
  if (authHeader?.startsWith("Bearer ")) {
    try {
      // Run JWK middleware manually to validate the token
      await jwtAuth(c, async () => {});
      const userId = getUserIdFromJwt(c);
      if (userId) {
        c.set("userId", userId);
        c.set("authMethod", "jwt");
        return next();
      }
    } catch {
      // JWT validation failed, try API key next
    }
  }

  // Try API key (MCP server)
  if (apiKey) {
    const keyHash = createHash("sha256").update(apiKey).digest("hex");
    const db = getDb();

    const [record] = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (record) {
      // Update last used (fire and forget)
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, record.id))
        .execute();

      c.set("userId", record.userId);
      c.set("authMethod", "api_key");
      c.set("apiKeyId", record.id);
      return next();
    }
  }

  // No valid authentication
  return c.json({ error: "Authentication required" }, 401);
});
