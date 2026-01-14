import type { MentalItem } from "@/types/item";
import { ItemCard } from "./ItemCard";

interface ItemListProps {
  title: string;
  items: MentalItem[];
  emptyMessage?: string;
}

export function ItemList({ title, items, emptyMessage = "No items" }: ItemListProps) {
  return (
    <section className="mb-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({items.length})
        </span>
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-500 italic">{emptyMessage}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}
