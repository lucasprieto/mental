import { notFound } from "next/navigation";
import { ItemDetailClient, Item, FollowUp } from "@/components/ItemDetailClient";

export const dynamic = "force-dynamic";

const API_URL = process.env.MENTAL_API_URL || "http://localhost:3000";

interface PageProps {
  params: Promise<{ id: string }>;
}

// API response types
type ItemResponse = Item | { error: string };

export default async function ItemDetail({ params }: PageProps) {
  const { id } = await params;

  // Fetch item directly with fetch (avoids Hono client type issues in Vercel)
  const itemRes = await fetch(`${API_URL}/items/${id}`, { cache: "no-store" });

  if (!itemRes.ok) {
    notFound();
  }

  const itemData = await itemRes.json() as ItemResponse;

  // Handle error response (API returns { error: string } on 404)
  if ("error" in itemData) {
    notFound();
  }

  // Fetch follow-ups for this item
  const followupsRes = await fetch(`${API_URL}/followups/item/${id}`, { cache: "no-store" });
  const followups: FollowUp[] = followupsRes.ok ? await followupsRes.json() : [];

  return <ItemDetailClient item={itemData} followups={followups} />;
}
