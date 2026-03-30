import { globalSearch } from "@/api/search";
import type { SearchResponse } from "@/types";
import { useQuery } from "./use-simple";

const EMPTY_SEARCH_RESPONSE: SearchResponse = {
  spaces: [],
  questions: [],
  replies: [],
  users: [],
};

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => globalSearch(query),
    enabled: query.length > 0,
    initialData: EMPTY_SEARCH_RESPONSE,
  });
}
