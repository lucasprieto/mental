"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export interface FilterState {
  status: "all" | "open" | "resolved";
  theme: string | null;
}

interface FilterBarProps {
  themes: string[];
  activeStatus: "all" | "open" | "resolved";
  activeTheme: string | null;
}

export function FilterBar({
  themes,
  activeStatus,
  activeTheme,
}: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update status
      if (updates.status !== undefined) {
        if (updates.status === "all") {
          params.delete("status");
        } else {
          params.set("status", updates.status);
        }
      }

      // Update theme
      if (updates.theme !== undefined) {
        if (updates.theme === null) {
          params.delete("theme");
        } else {
          params.set("theme", updates.theme);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/");
    },
    [router, searchParams]
  );

  const toggleTheme = (theme: string) => {
    updateFilters({ theme: activeTheme === theme ? null : theme });
  };

  const resetFilters = () => {
    router.push("/");
  };

  const hasActiveFilters = activeStatus !== "all" || activeTheme !== null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Reset
          </button>
        )}
      </div>

      {/* Status filter */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Status</p>
        <div className="flex gap-2">
          {(["all", "open", "resolved"] as const).map((status) => (
            <button
              key={status}
              onClick={() => updateFilters({ status })}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                activeStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Themes filter */}
      {themes.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Themes</p>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => toggleTheme(theme)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeTheme === theme
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
