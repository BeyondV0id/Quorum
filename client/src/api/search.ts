import { API_URL } from "@/config";
import type { SearchResponse } from "@/types";

export async function globalSearch(query: string): Promise<SearchResponse> {
  const res = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("failed to search");
  return res.json();
}
