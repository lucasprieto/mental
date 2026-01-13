import { getDatabase } from "@/lib/db";
import { mentalItems } from "@mental/db";

export const dynamic = "force-dynamic"; // Don't cache this page

export default async function Home() {
  const db = getDatabase();

  // Get counts for verification
  const allItems = await db.select().from(mentalItems);
  const openItems = allItems.filter(item => item.status === "open");
  const resolvedItems = allItems.filter(item => item.status === "resolved");

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold">{allItems.length}</p>
          <p className="text-gray-600">Total Items</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-blue-600">{openItems.length}</p>
          <p className="text-gray-600">Open</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-3xl font-bold text-green-600">{resolvedItems.length}</p>
          <p className="text-gray-600">Resolved</p>
        </div>
      </div>

      <p className="text-gray-500 text-sm">
        Database connected successfully. Full dashboard coming in 05-02.
      </p>
    </div>
  );
}
