import { createAuthClient } from "better-auth/react";
import { API_URL } from "@/config";
import { sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    sentinelClient(),
    {
      id: "custom-fields",
      $Infer: {
        Session: {
          user: {} as {
            username: string;
            bio: string | null;
            avatar: string | null;
            links: string | null;
            posted: number;
            answered: number;
          }
        }
      }
    } as any
  ],
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
