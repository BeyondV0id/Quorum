import { useState, useEffect, useCallback } from "react";
import { listNotifications } from "@/api/notifications";
import { useStore } from "@/context/StoreContext";

export function useNotificationsQuery() {
  const { getRefreshCount } = useStore();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listNotifications();
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("notifications")]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
