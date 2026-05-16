import { useState, useEffect, useCallback } from "react";
import {
  fetchReplies,
  createReply,
  deleteReply,
  updateReply,
  acceptReply,
  unacceptReply,
} from "@/api/replies";
import { useStore } from "@/context/StoreContext";

export function useRepliesQuery(questionId: string | undefined) {
  const { replies, setRepliesList, getRefreshCount } = useStore();
  const [isLoading, setIsLoading] = useState(!!questionId);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!questionId) return;
    if (!replies[questionId]) setIsLoading(true);
    try {
      const res = await fetchReplies(questionId);
      setRepliesList(questionId, res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId, setRepliesList]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount(`replies:${questionId}`)]);

  return { data: replies[questionId || ""], isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useCreateReply() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    {
      questionId,
      content,
    }: {
      questionId: string;
      content: string;
    },
    options?: { onSuccess?: (data: any) => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      const data = await createReply(questionId, { content });
      triggerRefresh(`replies:${questionId}`);
      options?.onSuccess?.(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useDeleteReply() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    {
      questionId,
      replyId,
    }: {
      questionId: string;
      replyId: string;
    },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await deleteReply(questionId, replyId);
      triggerRefresh(`replies:${questionId}`);
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

export function useUpdateReply() {
  const { updateReply: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { qid, rid, content }: { qid: string; rid: string; content: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    updateStore(qid, rid, { content });
    try {
      await updateReply(qid, rid, content);
      triggerRefresh(`replies:${qid}`);
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

export function useAcceptReply() {
  const { updateReply: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    {
      qid,
      rid,
      accept,
    }: {
      qid: string;
      rid: string;
      accept: boolean;
    },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    // Optimistic
    updateStore(qid, rid, { isAccepted: accept });
    
    try {
      if (accept) {
        await acceptReply(qid, rid);
      } else {
        await unacceptReply(qid, rid);
      }
      triggerRefresh(`replies:${qid}`);
      triggerRefresh(`question:${qid}`);
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      updateStore(qid, rid, { isAccepted: !accept });
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}
