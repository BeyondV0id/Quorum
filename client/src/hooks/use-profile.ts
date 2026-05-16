import { useState, useEffect, useCallback } from "react";
import { fetchProfile, updateProfile, fetchPublicProfile } from "@/api/profile";
import type { User } from "@/types";
import { useStore } from "@/context/StoreContext";

export function useFetchProfile() {
  const { getRefreshCount } = useStore();
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchProfile();
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("profile")]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useUpdateProfile() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    user: User,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await updateProfile(user);
      triggerRefresh("profile");
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

export function useFetchPublicProfile(username?: string) {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(!!username);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const res = await fetchPublicProfile(username);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("profile")]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
