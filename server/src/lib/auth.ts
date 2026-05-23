import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "../db/index.js";

const clientURL = (process.env.CLIENT_URL ?? "https://quorum-io.vercel.app").replace(/\/$/, "");
const authBaseURL = process.env.NODE_ENV === "production"
  ? clientURL
  : (process.env.BETTER_AUTH_URL ?? "http://localhost:3000");

export const auth = betterAuth({
  baseURL: authBaseURL,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  trustedOrigins: [
    "https://quorum-io.vercel.app",
    "https://quorum-io-git-*-vercel.app",
  ],

  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" || authBaseURL.startsWith("https://"),
      httpOnly: true,
    },
  },

  account: {
    skipStateCookieCheck: true,
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset for ${user.email}: ${url}`);
    },
  },

  socialProviders: {
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID as string,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    // },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      mapProfileToUser: (profile) => ({
        username: profile.login,
        displayUsername: profile.login,
      }),
    },
  },

  user: {
    deleteUser: { enabled: true },
    changeEmail: { enabled: true },
    additionalFields: {
      username: {
        type: "string",
        required: false,
        input: true,
      },
      displayUsername: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        defaultValue: "Wanderer",
        required: false,
        input: true,
      },
      avatar: {
        type: "string",
        required: false,
        input: true,
      },
      links: {
        type: "string",
        required: false,
        input: true,
      },
      posted: {
        type: "number",
        defaultValue: 0,
        required: false,
        input: false,
      },
      answered: {
        type: "number",
        defaultValue: 0,
        required: false,
        input: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session; 
export type User = typeof auth.$Infer.Session.user;
