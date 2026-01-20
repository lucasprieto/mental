import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, theme, status, resolution } = body;

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

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
    }

    if (resolution !== undefined) {
      updates.resolution = resolution?.trim() || null;
    }

    const res = await fetch(`${API_URL}/items/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
