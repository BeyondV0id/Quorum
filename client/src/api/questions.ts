import type { QuestionDraft, QuestionItem } from "@/types";
import { API_URL } from "@/config";

export async function fetchQuestion(questionId: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(questionId)}`,
    { credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to fetch question");
  return res.json() as Promise<QuestionItem>;
}

export async function fetchQuestions(
  sort?: "votes" | "time_created",
  filter?: "joined",
  chamberId?: string,
  author?: string,
) {
  const params = new URLSearchParams({
    ...(sort ? { sort } : {}),
    ...(filter ? { filter } : {}),
    ...(chamberId ? { chamber_uid: chamberId } : {}),
    ...(author ? { author } : {}),
  });
  const res = await fetch(`${API_URL}/questions?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function fetchUserQuestions() {
  const res = await fetch(`${API_URL}/users/me/questions`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch user questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function createQuestion(draft: QuestionDraft) {
  const res = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(draft),
  });
  if (!res.ok) throw new Error("Failed to create question");
}

export async function deleteQuestion(questionId: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(questionId)}`,
    { method: "DELETE", credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to delete question");
}

export async function searchQuestions(query: string) {
  const params = new URLSearchParams({ q: query });
  const res = await fetch(`${API_URL}/questions/search?${params}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to search questions");
  return res.json() as Promise<QuestionItem[]>;
}

export async function updateVotes(qid: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(qid)}/votes`,
    { method: "POST", credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to update votes");
}

export async function updateQuestion(questionId: string, content: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(questionId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error("Failed to update question");
}

export async function pinQuestion(questionId: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(questionId)}/pin`,
    { method: "POST", credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to pin question");
}

export async function unpinQuestion(questionId: string) {
  const res = await fetch(
    `${API_URL}/questions/${encodeURIComponent(questionId)}/pin`,
    { method: "DELETE", credentials: "include" },
  );
  if (!res.ok) throw new Error("Failed to unpin question");
}
