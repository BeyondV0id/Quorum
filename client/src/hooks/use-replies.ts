import { useQuery, useMutation, useQueryClient } from "./use-simple";
import {
  fetchReplies,
  createReply,
  deleteReply,
  updateReply,
  acceptReply,
  unacceptReply,
} from "@/api/replies";

export function useRepliesQuery(questionId: string | undefined) {
  return useQuery({
    queryKey: ["replies", questionId],
    queryFn: () => fetchReplies(questionId!),
    enabled: !!questionId,
  });
}

export function useCreateReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      content,
    }: {
      questionId: string;
      content: string;
    }) => createReply(questionId, { content }),
    onSettled: (_, __, { questionId }) => {
      queryClient.invalidateQueries({
        queryKey: ["replies", questionId],
      });
    },
  });
}

export function useDeleteReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      replyId,
    }: {
      questionId: string;
      replyId: string;
    }) => deleteReply(questionId, replyId),
    onSettled: (_, __, { questionId }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", questionId] });
    },
  });
}

export function useUpdateReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ qid, rid, content }: { qid: string; rid: string; content: string }) =>
      updateReply(qid, rid, content),
    onSuccess: (_, { qid }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", qid] });
    },
  });
}

export function useAcceptReply() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      qid,
      rid,
      accept,
    }: {
      qid: string;
      rid: string;
      accept: boolean;
    }) => (accept ? acceptReply(qid, rid) : unacceptReply(qid, rid)),
    onSuccess: (_data, { qid }) => {
      queryClient.invalidateQueries({ queryKey: ["replies", qid] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", qid] });
    },
  });
}
