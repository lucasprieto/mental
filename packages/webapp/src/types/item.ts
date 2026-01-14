/**
 * Item type matching what the API returns.
 * This mirrors the database schema structure.
 */
export interface MentalItem {
  id: string;
  title: string;
  content: string;
  tags: string; // JSON string array
  theme: string | null;
  status: string;
  resolution: string | null;
  sessionId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  resolvedAt: Date | string | null;
}
