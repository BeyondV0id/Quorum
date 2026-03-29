import { API_URL } from "@/config";
import type { User } from "@/types";

export async function fetchProfile(): Promise<User> {
  const res = await fetch(`${API_URL}/users/me`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json() as Promise<User>;
}

export async function updateProfile(user: User): Promise<void> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to update profile");
}

export async function fetchPublicProfile(username: string): Promise<User> {
  const res = await fetch(`${API_URL}/users/${username}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json() as Promise<User>;
}
