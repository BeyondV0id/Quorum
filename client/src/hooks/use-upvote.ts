import { useMutation, useQueryClient } from "./use-simple";
import { updateVotes } from "@/api/questions";
import { updateReplyVotes } from "@/api/replies";

export function useUpdateVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qid: string) => updateVotes(qid),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
      queryClient.invalidateQueries({ queryKey: ["search-questions"] });
    },
  });
}

export function useReplyUpdateVote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qid, rid }: { qid: string; rid: string }) =>
      updateReplyVotes(qid, rid),
    onSettled: (_, __, { qid }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", qid] });
    },
  });
}
