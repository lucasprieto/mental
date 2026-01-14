import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, asc, pg, createId } from "@mental/db";
import { getDb } from "../db.js";

const followupsRoute = new Hono()
  // POST / - Create a follow-up
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        itemId: z.string(),
        content: z.string().min(1),
      })
    ),
    async (c) => {
      const { itemId, content } = c.req.valid("json");
      const db = getDb();

      // Check item exists
      const item = await db
        .select()
        .from(pg.mentalItems)
        .where(eq(pg.mentalItems.id, itemId))
        .limit(1);

      if (item.length === 0) {
        return c.json({ error: "Item not found" }, 404);
      }

      // Can't add follow-ups to resolved items
      if (item[0].status === "resolved") {
        return c.json({ error: "Cannot add follow-up to resolved item" }, 400);
      }

      const id = createId();
      const now = new Date();

      await db.insert(pg.followUps).values({
        id,
        itemId,
        content,
        createdAt: now,
      });

      return c.json({ id, itemId, content, createdAt: now }, 201);
    }
  )
  // GET /item/:itemId - Get all follow-ups for an item
  .get("/item/:itemId", async (c) => {
    const itemId = c.req.param("itemId");
    const db = getDb();

    const results = await db
      .select()
      .from(pg.followUps)
      .where(eq(pg.followUps.itemId, itemId))
      .orderBy(asc(pg.followUps.createdAt));

    return c.json(results);
  });

export default followupsRoute;
export type FollowupsRoute = typeof followupsRoute;
