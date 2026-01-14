"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface SidebarProps {
  themes: string[];
  activeStatus: "all" | "open" | "resolved";
  activeTheme: string | null;
}

export function Sidebar({ themes, activeStatus, activeTheme }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: "status" | "theme", value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (key === "status") {
        if (value === "all" || value === null) {
          params.delete("status");
        } else {
          params.set("status", value);
        }
      } else if (key === "theme") {
        if (value === null) {
          params.delete("theme");
        } else {
          params.set("theme", value);
        }
      }

      const queryString = params.toString();
      router.push(queryString ? `/?${queryString}` : "/");
    },
    [router, searchParams]
  );

  const toggleTheme = (theme: string) => {
    updateFilter("theme", activeTheme === theme ? null : theme);
  };

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen overflow-y-auto border-r border-gray-200 bg-white z-40">
      {/* Branding */}
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-lg font-semibold">Mental</h1>
      </div>

      {/* Filter sections */}
      <nav className="p-4 space-y-6">
        {/* Status filter */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Status
          </h3>
          <div className="space-y-1">
            {(["all", "open", "resolved"] as const).map((status) => (
              <button
                key={status}
                onClick={() => updateFilter("status", status)}
                className={`
                  w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                  ${
                    activeStatus === status
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Theme filter */}
        {themes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Theme
            </h3>
            <div className="space-y-1">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => toggleTheme(theme)}
                  className={`
                    w-full px-3 py-1.5 text-sm text-left rounded-md transition-colors
                    ${
                      activeTheme === theme
                        ? "bg-purple-100 text-purple-900 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
