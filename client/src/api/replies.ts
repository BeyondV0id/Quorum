import type { AnswerItem, Reply } from "@/types";
import { authFetch } from "@/config";

export async function fetchReplies(questionId: string): Promise<AnswerItem[]> {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}/replies`,
  );
  if (!res.ok) throw new Error("Failed to fetch replies");
  return res.json();
}

export async function createReply(questionId: string, reply: Partial<Reply>) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionId)}/replies`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reply),
    },
  );
  if (!res.ok) throw new Error("Failed to create reply");
}

export async function deleteReply(questionID: string, replyId: string): Promise<void> {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(questionID)}/replies/${encodeURIComponent(replyId)}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("failed to delete reply");
}

export async function updateReplyVotes(qid: string, rid: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(qid)}/replies/${encodeURIComponent(rid)}/votes`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("Failed to update votes");
}

export async function updateReply(qid: string, rid: string, content: string): Promise<void> {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(qid)}/replies/${encodeURIComponent(rid)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    },
  );
  if (!res.ok) throw new Error("failed to update reply");
}

export async function acceptReply(qid: string, rid: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(qid)}/replies/${encodeURIComponent(rid)}/accept`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error("failed to accept reply");
}

export async function unacceptReply(qid: string, rid: string) {
  const res = await authFetch(
    `/api/questions/${encodeURIComponent(qid)}/replies/${encodeURIComponent(rid)}/accept`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("failed to unaccept reply");
}
