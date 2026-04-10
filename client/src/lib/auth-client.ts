import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "../../../server/src/lib/auth";
import { API_URL } from "@/config";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});


export type Session = typeof authClient.$Infer.Session;
export type AuthUser = typeof authClient.$Infer.Session.user;
