import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/config";

export const authClient = createAuthClient({
  baseURL: API_URL,
});


export type Session = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;
