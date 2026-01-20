import { getItemsClient, getFollowupsClient } from "@/lib/api";
import { notFound } from "next/navigation";
import { ItemDetailClient, Item, FollowUp } from "@/components/ItemDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

// API response types
type ItemResponse = Item | { error: string };
type FollowupsResponse = FollowUp[];

export default async function ItemDetail({ params }: PageProps) {
  const { id } = await params;
  const itemsClient = getItemsClient();
  const followupsClient = getFollowupsClient();

  const res = await itemsClient[":id"].$get({ param: { id } });

  if (!res.ok) {
    notFound();
  }

  const itemData = await res.json() as ItemResponse;

  // Handle error response (API returns { error: string } on 404)
  if ("error" in itemData) {
    notFound();
  }

  // Fetch follow-ups for this item
  const followupsRes = await followupsClient.item[":itemId"].$get({
    param: { itemId: id },
  });

  const followups: FollowUp[] = followupsRes.ok
    ? await followupsRes.json() as FollowupsResponse
    : [];

  return <ItemDetailClient item={itemData} followups={followups} />;
}
