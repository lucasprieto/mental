import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold">Mental</h1>
        </header>
        <main className="container mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
