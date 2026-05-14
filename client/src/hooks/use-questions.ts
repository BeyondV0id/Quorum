import { useState, useEffect, useCallback } from "react";
import {
  fetchQuestion,
  fetchQuestions,
  createQuestion,
  deleteQuestion,
  updateQuestion,
  fetchUserQuestions,
  searchQuestions,
  pinQuestion,
  unpinQuestion,
} from "@/api/questions";
import type { QuestionItem } from "@/types";

export function useQuestionQuery(questionId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!!questionId);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!questionId) return;
    setIsLoading(true);
    try {
      const res = await fetchQuestion(questionId);
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

export function useQuestionsQuery(
  sort?: "votes" | "time_created",
  filter?: "joined",
  spaceId?: string,
  author?: string
) {
  const [data, setData] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchQuestions(sort, filter, spaceId, author);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sort, filter, spaceId, author]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useUserQuestionsQuery() {
  const [data, setData] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchUserQuestions();
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useTrendingQuestions() {
  return useQuestionsQuery("votes");
}

export function useCreateQuestion() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    args: { content: string; spaceUid: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await createQuestion(args);
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

export function useDeleteQuestion() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await deleteQuestion(questionId);
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

export function useUpdateQuestion() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { questionId, content }: { questionId: string; content: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await updateQuestion(questionId, content);
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

export function usePinQuestion() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await pinQuestion(questionId);
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

export function useUnpinQuestion() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await unpinQuestion(questionId);
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

export function useSearchQuestions(query: string) {
  const [data, setData] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!query) {
      setData([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await searchQuestions(query);
      setData(res);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
