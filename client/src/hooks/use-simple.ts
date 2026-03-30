import { useState, useEffect, useCallback } from "react";

const listeners = new Map<string, Set<() => void>>();

export const queryClient = {
  invalidateQueries: ({ queryKey }: { queryKey: any[] }) => {
    const keyPrefix = queryKey[0];
    const prefixStr = `["${keyPrefix}"`;
    listeners.forEach((fns, key) => {
      if (key.startsWith(prefixStr)) {
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

  const fetcher = useCallback(() => {
    if (options.enabled === false) return;
    setIsLoading(true);
    setError(null);
    options
      .queryFn()
      .then((res) => setData(res))
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false));
  }, [JSON.stringify(options.queryKey), options.enabled]);

  useEffect(() => {
    fetcher();

    const keyStr = JSON.stringify(options.queryKey);
    if (!listeners.has(keyStr)) {
      listeners.set(keyStr, new Set());
    }
    listeners.get(keyStr)!.add(fetcher);

    return () => {
      listeners.get(keyStr)?.delete(fetcher);
    };
  }, [fetcher, JSON.stringify(options.queryKey)]);

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

  const mutate = async (
    args: TArgs,
    callOptions?: { onSuccess?: () => void; onSettled?: () => void },
  ) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await options.mutationFn(args);
      if (options.onSuccess) await options.onSuccess(data, args);
      if (callOptions?.onSuccess) callOptions.onSuccess();
      if (options.onSettled) await options.onSettled(data, null, args);
      if (callOptions?.onSettled) callOptions.onSettled();
      return data;
    } catch (err) {
      setError(err as Error);
      if (options.onError) await options.onError(err as Error, args);
      if (options.onSettled) await options.onSettled(undefined, err as Error, args);
      if (callOptions?.onSettled) callOptions.onSettled();
    }
  };

  return { mutate, isPending, error };
}
