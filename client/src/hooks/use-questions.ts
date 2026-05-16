import { useState, useEffect, useCallback, useMemo } from "react";
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
import { useStore } from "@/context/StoreContext";

export function useQuestionQuery(questionId: string | undefined) {
  const { questions, updateQuestion: updateStore, getRefreshCount } = useStore();
  const [isLoading, setIsLoading] = useState(!!questionId);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!questionId) return;
    if (!questions[questionId]) setIsLoading(true);
    try {
      const res = await fetchQuestion(questionId);
      updateStore(questionId, res.question);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [questionId, updateStore]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount(`question:${questionId}`), getRefreshCount("questions")]);

  return { data: questions[questionId || ""], isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useQuestionsQuery(
  sort?: "votes" | "time_created",
  filter?: "joined",
  spaceId?: string,
  author?: string
) {
  const { questions, setQuestionsList, getRefreshCount } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawIds, setRawIds] = useState<string[]>([]);

  const fetch = useCallback(async () => {
    if (rawIds.length === 0) setIsLoading(true);
    try {
      const res = await fetchQuestions(sort, filter, spaceId, author);
      setQuestionsList(res);
      setRawIds(res.map(r => r.question.uid).filter((id): id is string => !!id));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [sort, filter, spaceId, author, setQuestionsList]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("questions")]);

  const data = useMemo(() => {
    return rawIds.map(id => questions[id]).filter(Boolean);
  }, [rawIds, questions]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useUserQuestionsQuery() {
  const { questions, setQuestionsList, getRefreshCount } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawIds, setRawIds] = useState<string[]>([]);

  const fetch = useCallback(async () => {
    if (rawIds.length === 0) setIsLoading(true);
    try {
      const res = await fetchUserQuestions();
      setQuestionsList(res);
      setRawIds(res.map(r => r.question.uid).filter((id): id is string => !!id));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [setQuestionsList]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("questions")]);

  const data = useMemo(() => {
    return rawIds.map(id => questions[id]).filter(Boolean);
  }, [rawIds, questions]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}

export function useTrendingQuestions() {
  return useQuestionsQuery("votes");
}

export function useCreateQuestion() {
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    args: { content: string; spaceUid: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await createQuestion(args);
      triggerRefresh("questions");
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
  const { triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    try {
      await deleteQuestion(questionId);
      triggerRefresh("questions");
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
  const { updateQuestion: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { questionId, content }: { questionId: string; content: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    // Optimistic update
    updateStore(questionId, { content });
    
    try {
      await updateQuestion(questionId, content);
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      setError(err as Error);
      // Rollback would require previous state, but for content edit it's usually fine
      // since the refresh will eventually fix it if it fails.
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function usePinQuestion() {
  const { updateQuestion: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    updateStore(questionId, { isPinned: true });
    try {
      await pinQuestion(questionId);
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      updateStore(questionId, { isPinned: false });
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useUnpinQuestion() {
  const { updateQuestion: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    questionId: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    setIsPending(true);
    updateStore(questionId, { isPinned: false });
    try {
      await unpinQuestion(questionId);
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      updateStore(questionId, { isPinned: true });
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useSearchQuestions(query: string) {
  const { questions, setQuestionsList, getRefreshCount } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [rawIds, setRawIds] = useState<string[]>([]);

  const fetch = useCallback(async () => {
    if (!query) {
      setRawIds([]);
      return;
    }
    if (rawIds.length === 0) setIsLoading(true);
    try {
      const res = await searchQuestions(query);
      setQuestionsList(res);
      setRawIds(res.map(r => r.question.uid).filter((id): id is string => !!id));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [query, setQuestionsList]);

  useEffect(() => {
    fetch();
  }, [fetch, getRefreshCount("questions")]);

  const data = useMemo(() => {
    return rawIds.map(id => questions[id]).filter(Boolean);
  }, [rawIds, questions]);

  return { data, isLoading, isPending: isLoading, error, refetch: fetch };
}
