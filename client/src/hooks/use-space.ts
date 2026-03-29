import {
  createSpace,
  listSpaces,
  joinSpace,
  leaveSpace,
  updateSpace,
} from "@/api/spaces";
import type { Space } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useCreateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (space: Space) => createSpace(space),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["spaces"] }),
  });
}

export function useListSpaces(query?: string) {
  return useQuery({
    queryFn: () => listSpaces(query),
    queryKey: ["spaces", query],
    staleTime: 2 * 60 * 1000,
  });
}

export function useJoinSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => joinSpace(uid),
    onMutate: async (uid) => {
      await queryClient.cancelQueries({ queryKey: ["spaces"] });
      const chambersCache = queryClient.getQueryCache();
      const matchingQueries = chambersCache.findAll({
        predicate: (query) => query.queryKey[0] === "spaces",
      });

      const previousData = matchingQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data as Space[] | undefined,
      }));

      matchingQueries.forEach((query) => {
        const data = query.state.data as Space[] | undefined;
        if (!data) return;
        const updated = data.map((space) =>
          space.uid === uid
            ? {
              ...space,
              isJoined: true,
              memberCount: (space.memberCount || 0) + 1,
            }
            : space
        );
        queryClient.setQueryData(query.queryKey, updated);
      });

      return { previousData };
    },
    onError: (_err, _uid, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useLeaveSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => leaveSpace(uid),
    onMutate: async (uid) => {
      await queryClient.cancelQueries({ queryKey: ["spaces"] });
      const chambersCache = queryClient.getQueryCache();
      const matchingQueries = chambersCache.findAll({
        predicate: (query) => query.queryKey[0] === "spaces",
      });

      const previousData = matchingQueries.map((query) => ({
        queryKey: query.queryKey,
        data: query.state.data as Space[] | undefined,
      }));

      matchingQueries.forEach((query) => {
        const data = query.state.data as Space[] | undefined;
        if (!data) return;
        const updated = data.map((space) =>
          space.uid === uid
            ? {
              ...space,
              isJoined: false,
              memberCount: Math.max(0, (space.memberCount || 1) - 1),
            }
            : space
        );
        queryClient.setQueryData(query.queryKey, updated);
      });

      return { previousData };
    },
    onError: (_err, _uid, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKey, data }) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useUpdateSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, space }: { uid: string; space: Space }) =>
      updateSpace(uid, space),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}
