import { useState, useEffect, useCallback } from "react";
import { globalSearch } from "@/api/search";
import type { SearchResponse } from "@/types";
import { useStore } from "@/context/StoreContext";

const EMPTY_SEARCH_RESPONSE: SearchResponse = {
  spaces: [],
  questions: [],
  replies: [],
  users: [],
};

export function useGlobalSearch(query: string) {
  const { getRefreshCount } = useStore();
  const [data, setData] = useState<SearchResponse>(EMPTY_SEARCH_RESPONSE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!query) {
      setData(EMPTY_SEARCH_RESPONSE);
      return;
    }
    const hasData = data.questions.length > 0 || data.spaces.length > 0 || data.users.length > 0 || data.replies.length > 0;
    if (!hasData) setIsLoading(true);
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
  }, [fetch, getRefreshCount("questions")]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
