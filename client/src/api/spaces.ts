import { API_URL } from "@/config";
import type { Space } from "@/types";

export async function createSpace(space: Space): Promise<Space> {
  const res = await fetch(`${API_URL}/spaces`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(space),
  });
  if (!res.ok) throw new Error("failed to create space");
  return res.json();
}

export async function listSpaces(query?: string): Promise<Space[]> {
  const url = query
    ? `${API_URL}/spaces?q=${encodeURIComponent(query)}`
    : `${API_URL}/spaces`;
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("failed to list spaces");
  return res.json();
}

export async function joinSpace(uid: string): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${uid}/join`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("failed to join space");
}

export async function leaveSpace(uid: string): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${uid}/leave`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("failed to leave space");
}

export async function updateSpace(uid: string, space: Space): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${uid}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(space),
  });
  if (!res.ok) throw new Error("failed to update space");
}

export async function deleteSpace(uid: string): Promise<void> {
  const res = await fetch(`${API_URL}/spaces/${uid}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("failed to delete space");
}
