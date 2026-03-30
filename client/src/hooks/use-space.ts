import {
  createSpace,
  listSpaces,
  joinSpace,
  leaveSpace,
  updateSpace,
} from "@/api/spaces";
import type { Space } from "@/types";
import { useMutation, useQuery, useQueryClient } from "./use-simple";

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
    queryKey: ["spaces", query]
  });
}

export function useJoinSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => joinSpace(uid),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
}

export function useLeaveSpace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => leaveSpace(uid),
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
