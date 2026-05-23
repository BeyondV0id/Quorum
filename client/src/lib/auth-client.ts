import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.PROD
    ? "https://quorum-io.vercel.app"
    : "http://localhost:3000",
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
