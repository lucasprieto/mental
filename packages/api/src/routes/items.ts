import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, desc, pg, createId } from "@mental/db";
import { getDb } from "../db.js";

const itemsRoute = new Hono()
  // GET / - List items with optional filters
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        status: z.enum(["open", "resolved", "all"]).optional().default("all"),
        limit: z.coerce.number().min(1).max(100).optional().default(50),
        tags: z.string().optional(),
      })
    ),
    async (c) => {
      const { status, limit, tags } = c.req.valid("query");
      const db = getDb();

      const items = await db
        .select()
        .from(pg.mentalItems)
        .orderBy(desc(pg.mentalItems.createdAt))
        .limit(limit);

      let filtered = items;

      // Filter by status if not "all"
      if (status !== "all") {
        filtered = filtered.filter((item) => item.status === status);
      }

      // Filter by tags if provided (comma-separated, AND logic)
      if (tags) {
        const filterTags = tags.split(",").map((t) => t.trim().toLowerCase());
        filtered = filtered.filter((item) => {
          const itemTags: string[] = JSON.parse(item.tags);
          const lowerTags = itemTags.map((t) => t.toLowerCase());
          return filterTags.every((ft) => lowerTags.includes(ft));
        });
      }

      return c.json(filtered);
    }
  )
  // GET /:id - Get single item by ID
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const db = getDb();

    const items = await db
      .select()
      .from(pg.mentalItems)
      .where(eq(pg.mentalItems.id, id));

    if (items.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json(items[0]);
  })
  // POST / - Create new item
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        title: z.string().min(1),
        content: z.string(),
        tags: z.array(z.string()).optional().default([]),
        theme: z.string().optional(),
        sessionId: z.string().optional(),
        project: z.string().optional(),
      })
    ),
    async (c) => {
      const body = c.req.valid("json");
      const db = getDb();
      const now = new Date();

      const newItem = {
        id: createId(),
        title: body.title,
        content: body.content,
        tags: JSON.stringify(body.tags),
        theme: body.theme ?? null,
        status: "open" as const,
        resolution: null,
        sessionId: body.sessionId ?? null,
        project: body.project ?? null,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
      };

      await db.insert(pg.mentalItems).values(newItem);

      return c.json(newItem, 201);
    }
  )
  // PUT /:id - Update item
  .put(
    "/:id",
    zValidator(
      "json",
      z.object({
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        tags: z.array(z.string()).optional(),
        theme: z.string().nullable().optional(),
        status: z.enum(["open", "resolved"]).optional(),
        resolution: z.string().nullable().optional(),
        project: z.string().nullable().optional(),
      })
    ),
    async (c) => {
      const id = c.req.param("id");
      const body = c.req.valid("json");
      const db = getDb();

      // Check if item exists
      const existing = await db
        .select()
        .from(pg.mentalItems)
        .where(eq(pg.mentalItems.id, id));

      if (existing.length === 0) {
        return c.json({ error: "Item not found" }, 404);
      }

      const now = new Date();
      const updates: Record<string, unknown> = {
        updatedAt: now,
      };

      if (body.title !== undefined) updates.title = body.title;
      if (body.content !== undefined) updates.content = body.content;
      if (body.tags !== undefined) updates.tags = JSON.stringify(body.tags);
      if (body.theme !== undefined) updates.theme = body.theme;
      if (body.resolution !== undefined) updates.resolution = body.resolution;
      if (body.project !== undefined) updates.project = body.project;

      // Handle status change
      if (body.status !== undefined) {
        updates.status = body.status;
        if (body.status === "resolved") {
          updates.resolvedAt = now;
        } else if (body.status === "open") {
          updates.resolvedAt = null;
        }
      }

      await db
        .update(pg.mentalItems)
        .set(updates)
        .where(eq(pg.mentalItems.id, id));

      // Fetch and return updated item
      const updated = await db
        .select()
        .from(pg.mentalItems)
        .where(eq(pg.mentalItems.id, id));

      return c.json(updated[0]);
    }
  )
  // DELETE /:id - Delete item
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const db = getDb();

    // Check if item exists
    const existing = await db
      .select()
      .from(pg.mentalItems)
      .where(eq(pg.mentalItems.id, id));

    if (existing.length === 0) {
      return c.json({ error: "Item not found" }, 404);
    }

    await db.delete(pg.mentalItems).where(eq(pg.mentalItems.id, id));

    return c.body(null, 204);
  });

export default itemsRoute;
export type ItemsRoute = typeof itemsRoute;
