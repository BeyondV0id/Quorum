import type { QuestionDraft, QuestionItem } from "@/types";
import { authFetch } from "@/config";

export async function fetchQuestion(questionId: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json() as Promise<QuestionItem>;
}

export async function fetchQuestions(
  sort?: "votes" | "time_created",
  filter?: "joined",
  spaceId?: string,
  author?: string,
) {
  const params = new URLSearchParams({
    ...(sort ? { sort } : {}),
    ...(filter ? { filter } : {}),
    ...(spaceId ? { space_uid: spaceId } : {}),
    ...(author ? { author } : {}),
  });
  const res = await authFetch(`/api/questions?${params}`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function fetchUserQuestions() {
  const res = await authFetch(`/api/users/me/questions`);
  if (!res.ok) throw new Error("Failed to fetch user questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function createQuestion(draft: QuestionDraft) {
  const res = await authFetch(`/api/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error("Failed to create question");
}

export async function deleteQuestion(questionId: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function searchQuestions(query: string) {
  const params = new URLSearchParams({ q: query });
  const res = await authFetch(`/api/questions/search?${params}`);
  if (!res.ok) throw new Error("Failed to search questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function updateVotes(qid: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(qid)}/votes`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("Failed to update votes");
}

export async function updateQuestion(questionId: string, content: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error("Failed to update question");
}

export async function pinQuestion(questionId: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}/pin`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("Failed to pin question");
}

export async function unpinQuestion(questionId: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}/pin`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to unpin question");
}
