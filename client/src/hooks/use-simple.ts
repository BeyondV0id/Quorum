import { useState, useEffect, useRef, useCallback } from "react";

const listeners = new Map<string, Set<() => void>>();

export const queryClient = {
  invalidateQueries: ({ queryKey }: { queryKey: any[] }) => {
    const targetKey = JSON.stringify(queryKey);
    // Match queries whose key STARTS with the same prefix segments
    // e.g. ["questions"] matches ["questions","votes","joined",null,null]
    // We check by stringifying the prefix key and seeing if the stored key
    // starts with that prefix (minus the closing bracket).
    const prefix = targetKey.slice(0, -1); // remove trailing ]
    listeners.forEach((fns, key) => {
      // exact match OR the stored key starts with our prefix followed by , or ]
      if (key === targetKey || key.startsWith(prefix + ",") || key.startsWith(prefix + "]")) {
        fns.forEach((fn) => fn());
      }
    });
  },
};

export function useQueryClient() {
  return queryClient;
}

export function useQuery<T>(options: {
  queryKey: any[];
  queryFn: () => Promise<T>;
  enabled?: boolean;
  initialData?: T;
}) {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [isLoading, setIsLoading] = useState(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);

  // Keep a ref to always use the latest queryFn without causing re-subscriptions
  const queryFnRef = useRef(options.queryFn);
  queryFnRef.current = options.queryFn;

  const enabledRef = useRef(options.enabled);
  enabledRef.current = options.enabled;

  const keyStr = JSON.stringify(options.queryKey);

  const fetcher = useCallback(() => {
    if (enabledRef.current === false) return;
    setIsLoading(true);
    setError(null);
    queryFnRef
      .current()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyStr]);

  useEffect(() => {
    // Re-fetch when enabled transitions from false → true
    if (enabledRef.current !== false) {
      fetcher();
    }

    if (!listeners.has(keyStr)) {
      listeners.set(keyStr, new Set());
    }
    listeners.get(keyStr)!.add(fetcher);

    return () => {
      listeners.get(keyStr)?.delete(fetcher);
      // Clean up empty sets
      if (listeners.get(keyStr)?.size === 0) {
        listeners.delete(keyStr);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, keyStr]);

  // Re-fetch when enabled flips to true
  const prevEnabled = useRef(options.enabled);
  useEffect(() => {
    if (prevEnabled.current === false && options.enabled !== false) {
      fetcher();
    }
    prevEnabled.current = options.enabled;
  }, [options.enabled, fetcher]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetcher };
}

export function useMutation<TArgs, TRet>(options: {
  mutationFn: (args: TArgs) => Promise<TRet>;
  onSuccess?: (data: TRet, args: TArgs) => void | Promise<void>;
  onError?: (error: Error, args: TArgs) => void | Promise<void>;
  onSettled?: (data: TRet | undefined, error: Error | null, args: TArgs) => void | Promise<void>;
}) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Keep refs so mutate always uses latest callbacks without needing deps
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback(async (
    args: TArgs,
    callOptions?: { onSuccess?: (data: TRet) => void; onError?: (error: Error) => void; onSettled?: () => void },
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await optionsRef.current.mutationFn(args);
      if (optionsRef.current.onSuccess) await optionsRef.current.onSuccess(data, args);
      if (callOptions?.onSuccess) callOptions.onSuccess(data);
      if (optionsRef.current.onSettled) await optionsRef.current.onSettled(data, null, args);
      if (callOptions?.onSettled) callOptions.onSettled();
      return data;
    } catch (err) {
      setError(err as Error);
      if (optionsRef.current.onError) await optionsRef.current.onError(err as Error, args);
      if (callOptions?.onError) callOptions.onError(err as Error);
      if (optionsRef.current.onSettled) await optionsRef.current.onSettled(undefined, err as Error, args);
      if (callOptions?.onSettled) callOptions.onSettled();
    } finally {
      setIsPending(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mutate, isPending, error };
}
