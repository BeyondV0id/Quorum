import { useState, useEffect, useCallback } from "react";
import {
  fetchReplies,
  createReply,
  deleteReply,
  updateReply,
  acceptReply,
  unacceptReply,
} from "@/api/replies";

export function useRepliesQuery(questionId: string | undefined) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!!questionId);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!questionId) return;
    setIsLoading(true);
    try {
      const res = await fetchReplies(questionId);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useCreateReply() {
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
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { qid, rid, content }: { qid: string; rid: string; content: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await updateReply(qid, rid, content);
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
    try {
      if (accept) {
        await acceptReply(qid, rid);
      } else {
        await unacceptReply(qid, rid);
      }
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
