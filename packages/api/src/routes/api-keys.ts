import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { eq, createId, apiKeys } from "@mental/db";
import { getDb } from "../db.js";

const apiKeysRoute = new Hono()
  /**
   * POST / - Create new API key
   * Returns the raw key ONLY ONCE at creation time
   * Note: In production, userId will come from JWT. For now, accept in body.
   */
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        userId: z.string().min(1),
        name: z.string().min(1).max(100).optional().default("Default Key"),
      })
    ),
    async (c) => {
      const { userId, name } = c.req.valid("json");
      const db = getDb();
      const now = new Date();

      // Generate secure random key with prefix
      const rawKey = `mental_${randomBytes(32).toString("hex")}`;

      // Hash for storage (SHA-256)
      const keyHash = createHash("sha256").update(rawKey).digest("hex");

      const newApiKey = {
        id: createId(),
        userId,
        keyHash,
        name,
        lastUsedAt: null,
        createdAt: now,
      };

      await db.insert(apiKeys).values(newApiKey);

      // Return raw key ONLY HERE - will never be shown again
      return c.json(
        {
          id: newApiKey.id,
          key: rawKey,
          name: newApiKey.name,
          createdAt: newApiKey.createdAt,
          message: "Save this key - it won't be shown again",
        },
        201
      );
    }
  )

  /**
   * GET / - List user's API keys
   * Returns metadata only - NO key hash or raw key
   */
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        userId: z.string().min(1),
      })
    ),
    async (c) => {
      const { userId } = c.req.valid("query");
      const db = getDb();

      const keys = await db
        .select({
          id: apiKeys.id,
          name: apiKeys.name,
          lastUsedAt: apiKeys.lastUsedAt,
          createdAt: apiKeys.createdAt,
        })
        .from(apiKeys)
        .where(eq(apiKeys.userId, userId));

      return c.json(keys);
    }
  )

  /**
   * DELETE /:id - Delete an API key
   * Hard delete - key is immediately invalidated
   */
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const db = getDb();

    // Check if key exists
    const existing = await db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));

    if (existing.length === 0) {
      return c.json({ error: "API key not found" }, 404);
    }

    await db.delete(apiKeys).where(eq(apiKeys.id, id));

    return c.json({ success: true });
  });

export default apiKeysRoute;
export type ApiKeysRoute = typeof apiKeysRoute;
