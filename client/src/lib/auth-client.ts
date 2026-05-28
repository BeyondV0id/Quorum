import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/config";

export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: {
    credentials: "include",
    // Store token after successful auth
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) {
        localStorage.setItem("bearer_token", token);
      }
    },
    // Send token on every request
    auth: {
      type: "Bearer",
      token: () => localStorage.getItem("bearer_token") || "",
    },
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
