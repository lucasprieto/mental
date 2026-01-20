import { getItemsClient, getFollowupsClient } from "@/lib/api";
import { notFound } from "next/navigation";
import { ItemDetailClient } from "@/components/ItemDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetail({ params }: PageProps) {
  const { id } = await params;
  const itemsClient = getItemsClient();
  const followupsClient = getFollowupsClient();

  const res = await itemsClient[":id"].$get({ param: { id } });

  if (!res.ok) {
    notFound();
  }

  const itemData = await res.json();

  // Handle error response (API returns { error: string } on 404)
  if ("error" in itemData) {
    notFound();
  }

  // Fetch follow-ups for this item
  const followupsRes = await followupsClient.item[":itemId"].$get({
    param: { itemId: id },
  });

  const followups = followupsRes.ok ? await followupsRes.json() : [];

  const item = {
    ...itemData,
    status: itemData.status as "open" | "resolved",
  };

  return <ItemDetailClient item={item} followups={followups} />;
}
