import { useState, useEffect, useCallback } from "react";
import {
  createSpace,
  listSpaces,
  joinSpace,
  leaveSpace,
  updateSpace,
} from "@/api/spaces";
import type { Space } from "@/types";
import { useStore } from "@/context/StoreContext";

export function useCreateSpace() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    space: Space,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await createSpace(space);
      triggerRefresh("spaces");
      options?.onSuccess?.();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useListSpaces(query?: string) {
  const { getRefreshCount } = useStore();
  const [data, setData] = useState<Space[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (data.length === 0) setIsLoading(true);
    try {
      const res = await listSpaces(query);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("spaces")]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useJoinSpace() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    uid: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await joinSpace(uid);
      triggerRefresh("spaces");
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useLeaveSpace() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    uid: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await leaveSpace(uid);
      triggerRefresh("spaces");
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useUpdateSpace() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { uid, space }: { uid: string; space: Space },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await updateSpace(uid, space);
      triggerRefresh("spaces");
      options?.onSuccess?.();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}
