import { authFetch } from "@/config";
import type { Space } from "@/types";

export async function createSpace(space: Space): Promise<Space> {
  const res = await authFetch(`/api/spaces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(space),
  });
  if (!res.ok) throw new Error("failed to create space");
  return res.json();
}

export async function listSpaces(query?: string): Promise<Space[]> {
  const url = query
    ? `/api/spaces?q=${encodeURIComponent(query)}`
    : `/api/spaces`;
  const res = await authFetch(url);
  if (!res.ok) throw new Error("failed to list spaces");
  return res.json();
}

export async function joinSpace(uid: string): Promise<void> {
  const res = await authFetch(`/api/spaces/${uid}/join`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("failed to join space");
}

export async function leaveSpace(uid: string): Promise<void> {
  const res = await authFetch(`/api/spaces/${uid}/leave`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("failed to leave space");
}

export async function updateSpace(uid: string, space: Space): Promise<void> {
  const res = await authFetch(`/api/spaces/${uid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(space),
  });
  if (!res.ok) throw new Error("failed to update space");
}

export async function deleteSpace(uid: string): Promise<void> {
  const res = await authFetch(`/api/spaces/${uid}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("failed to delete space");
}
