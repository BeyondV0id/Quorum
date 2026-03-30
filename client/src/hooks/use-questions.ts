
import { useQuery, useMutation, useQueryClient } from "./use-simple";
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

export function useQuestionQuery(questionId: string | undefined) {
  return useQuery({
    queryKey: ["question", questionId],
    queryFn: () => fetchQuestion(questionId!),
    enabled: !!questionId,
  });
}

export function useQuestionsQuery(
  sort?: "votes" | "time_created",
  filter?: "joined",
  spaceId?: string,
  author?: string
) {
  return useQuery({
    queryKey: ["questions", sort, filter, spaceId, author],
    queryFn: () => fetchQuestions(sort, filter, spaceId, author),
  });
}

export function useUserQuestionsQuery() {
  return useQuery({
    queryKey: ["user-questions"],
    queryFn: () => fetchUserQuestions(),
  });
}

export function useTrendingQuestions() {
  return useQuery({
    queryKey: ["questions", "votes"],
    queryFn: () => fetchQuestions("votes"),
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ questionId, content }: { questionId: string; content: string }) =>
      updateQuestion(questionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
    },
  });
}

export function usePinQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => pinQuestion(questionId),
    onSuccess: (_data, questionId) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
      queryClient.invalidateQueries({ queryKey: ["search-questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    },
  });
}

export function useUnpinQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (questionId: string) => unpinQuestion(questionId),
    onSuccess: (_data, questionId) => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["user-questions"] });
      queryClient.invalidateQueries({ queryKey: ["search-questions"] });
      queryClient.invalidateQueries({ queryKey: ["question", questionId] });
    },
  });
}

export function useSearchQuestions(query: string) {
  return useQuery({
    queryKey: ["search-questions", query],
    queryFn: () => searchQuestions(query),
    enabled: query.length > 0,
  });
}
