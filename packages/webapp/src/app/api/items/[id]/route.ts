import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { mentalItems, eq } from "@mental/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, tags, theme, status, resolution } = body;

    const db = getDatabase();

    // Find existing item
    const existing = await db.select()
      .from(mentalItems)
      .where(eq(mentalItems.id, id))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    }

    const item = existing[0];
    const now = new Date();

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: now,
    };

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim() === "") {
        return NextResponse.json(
          { error: "Title must be non-empty" },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (content !== undefined) {
      if (typeof content !== "string" || content.trim() === "") {
        return NextResponse.json(
          { error: "Content must be non-empty" },
          { status: 400 }
        );
      }
      updates.content = content.trim();
    }

    if (tags !== undefined) {
      const tagsArray = Array.isArray(tags) ? tags : [];
      updates.tags = JSON.stringify(tagsArray);
    }

    if (theme !== undefined) {
      updates.theme = theme?.trim() || null;
    }

    if (status !== undefined) {
      if (status !== "open" && status !== "resolved") {
        return NextResponse.json(
          { error: "Status must be 'open' or 'resolved'" },
          { status: 400 }
        );
      }
      updates.status = status;

      // If changing to resolved, set resolvedAt
      if (status === "resolved" && item.status !== "resolved") {
        updates.resolvedAt = now;
      }
      // Note: If changing to open, keep resolvedAt for history tracking (per 04-01 decision)
    }

    if (resolution !== undefined) {
      updates.resolution = resolution?.trim() || null;
    }

    // Apply updates
    await db.update(mentalItems)
      .set(updates)
      .where(eq(mentalItems.id, id));

    // Fetch and return updated item
    const updated = await db.select()
      .from(mentalItems)
      .where(eq(mentalItems.id, id))
      .limit(1);

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
