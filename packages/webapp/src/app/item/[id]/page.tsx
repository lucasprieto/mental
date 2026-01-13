import { getDatabase } from "@/lib/db";
import { mentalItems, eq } from "@mental/db";
import { notFound } from "next/navigation";
import { ItemDetailClient } from "@/components/ItemDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetail({ params }: PageProps) {
  const { id } = await params;
  const db = getDatabase();

  const items = await db.select()
    .from(mentalItems)
    .where(eq(mentalItems.id, id))
    .limit(1);

  if (items.length === 0) {
    notFound();
  }

  const item = items[0];

  return <ItemDetailClient item={item} />;
}
