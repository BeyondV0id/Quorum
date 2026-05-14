import { useState, useEffect, useCallback } from "react";
import { searchUsers } from "@/api/users";

export function useMentionUsers(query: string) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!query) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchUsers(query);
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
