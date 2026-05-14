import { useState, useEffect, useCallback } from "react";
import { globalSearch } from "@/api/search";
import type { SearchResponse } from "@/types";

const EMPTY_SEARCH_RESPONSE: SearchResponse = {
  spaces: [],
  questions: [],
  replies: [],
  users: [],
};

export function useGlobalSearch(query: string) {
  const [data, setData] = useState<SearchResponse>(EMPTY_SEARCH_RESPONSE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!query) {
      setData(EMPTY_SEARCH_RESPONSE);
      return;
    }
    setIsLoading(true);
    try {
      const res = await globalSearch(query);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
