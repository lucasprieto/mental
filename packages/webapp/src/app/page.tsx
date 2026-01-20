import { getItemsClient, searchItems } from "@/lib/api";
import { ItemList } from "@/components/ItemList";
import { ItemCard } from "@/components/ItemCard";
import { Sidebar } from "@/components/Sidebar";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { DashboardActions } from "@/components/DashboardActions";
import { SearchBar } from "@/components/SearchBar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ status?: string; theme?: string; q?: string }>;
}

export default async function Dashboard({ searchParams }: PageProps) {
  const params = await searchParams;
  const client = getItemsClient();

  // Parse filter params
  const statusFilter: "all" | "open" | "resolved" =
    params.status === "open" || params.status === "resolved"
      ? params.status
      : "all";
  const themeFilter = params.theme || null;
  const searchQuery = params.q?.trim() || null;

  // Fetch items - use search endpoint if query present
  let allItems;
  if (searchQuery) {
    allItems = await searchItems(searchQuery);
  } else {
    const res = await client.index.$get({ query: { status: "all", limit: "100" } });
    allItems = await res.json();
  }

  // Separate open and resolved items
  const allOpenItems = allItems
    .filter((item) => item.status === "open")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const allResolvedItems = allItems
    .filter((item) => item.status === "resolved")
    .sort((a, b) => {
      const aTime = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
      const bTime = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 10);

  // Get unique themes from all items
  // Always include the active theme so users can deactivate it even if no results match
  const themesFromItems = [...new Set(allItems.map(i => i.theme).filter((t): t is string => Boolean(t)))];
  const themes = themeFilter && !themesFromItems.includes(themeFilter)
    ? [themeFilter, ...themesFromItems]
    : themesFromItems;

  // Apply filters for display
  let filteredOpenItems = allOpenItems;
  let filteredResolvedItems = allResolvedItems;

  // Status filter
  if (statusFilter === "open") {
    filteredResolvedItems = [];
  } else if (statusFilter === "resolved") {
    filteredOpenItems = [];
  }

  // Theme filter
  if (themeFilter) {
    filteredOpenItems = filteredOpenItems.filter(item => item.theme === themeFilter);
    filteredResolvedItems = filteredResolvedItems.filter(item => item.theme === themeFilter);
  }

  return (
    <>
      {/* Sidebar with filters */}
      <Suspense fallback={null}>
        <Sidebar
          themes={themes}
          activeStatus={statusFilter}
          activeTheme={themeFilter}
        />
      </Suspense>

      <div>
        {/* Stats row - unfiltered counts */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-3xl font-bold text-blue-600">{allOpenItems.length}</p>
            <p className="text-gray-600">Open</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-3xl font-bold text-green-600">{allResolvedItems.length}</p>
            <p className="text-gray-600">Recently Resolved</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-3xl font-bold text-purple-600">{themes.length}</p>
            <p className="text-gray-600">Active Themes</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <Suspense fallback={<div className="h-10" />}>
            <SearchBar defaultValue={searchQuery || ""} />
          </Suspense>
        </div>

        {/* Search results message */}
        {searchQuery && allItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No results found for "{searchQuery}"
          </div>
        )}

        {/* Open items - filtered */}
        {(statusFilter === "all" || statusFilter === "open") && (
          <ItemList
            title={searchQuery ? `Search Results (${filteredOpenItems.length})` : "Open Items"}
            items={filteredOpenItems}
            emptyMessage={searchQuery ? "" : (themeFilter ? "No items match filters" : "No open items. Capture some thoughts via Claude Code!")}
          />
        )}

        {/* Recently resolved - filtered, collapsible */}
        {(statusFilter === "all" || statusFilter === "resolved") && filteredResolvedItems.length > 0 && (
          <CollapsibleSection
            key={`resolved-${statusFilter}`}
            title="Recently Resolved"
            count={filteredResolvedItems.length}
            defaultOpen={statusFilter === "resolved"}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResolvedItems.map(item => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Floating action button for quick capture */}
        <DashboardActions />
      </div>
    </>
  );
}
