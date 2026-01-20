import { createMiddleware } from "hono/factory";
import { createHash } from "crypto";
import { eq, apiKeys } from "@mental/db";
import { getDb } from "../db.js";

/**
 * API Key authentication middleware
 * Validates X-API-Key header against hashed keys in database
 * Sets userId and apiKeyId in context for downstream handlers
 */
export const apiKeyAuth = createMiddleware<{
  Variables: {
    userId: string;
    apiKeyId: string;
  };
}>(async (c, next) => {
  const key = c.req.header("X-API-Key");

  if (!key) {
    return c.json({ error: "X-API-Key header required" }, 401);
  }

  const keyHash = createHash("sha256").update(key).digest("hex");
  const db = getDb();

  const [record] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, keyHash))
    .limit(1);

  if (!record) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  // Update last used (fire and forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, record.id))
    .execute();

  c.set("userId", record.userId);
  c.set("apiKeyId", record.id);

  await next();
});
