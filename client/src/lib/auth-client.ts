import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/config";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : API_URL,
  fetchOptions: {
    credentials: "include",
  },
});

export type Session = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user & {
  username: string;
  bio: string;
  avatar: string;
  links: string;
  posted: number;
  answered: number;
};
