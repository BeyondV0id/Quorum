import { authFetch } from "@/config";
import type { SearchResponse } from "@/types";

export async function globalSearch(query: string): Promise<SearchResponse> {
  const res = await authFetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("failed to search");
  return res.json();
}
