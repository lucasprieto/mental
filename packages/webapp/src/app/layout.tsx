import type { Metadata } from "next";
import "./globals.css";
import { AuthButton } from "@/components/AuthButton";

export const metadata: Metadata = {
  title: "Mental - Mind Centralization",
  description: "Track your thoughts, never lose context",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {/* Auth header - positioned at top right */}
        <header className="fixed top-0 right-0 z-50 p-4 md:right-4">
          <AuthButton />
        </header>
        {/* Main content with left margin to account for fixed sidebar (desktop only) */}
        <main className="md:ml-64">
          <div className="px-4 py-4 md:px-6 md:py-8 pt-16">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
