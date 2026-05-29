import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";

import { db } from "../db/index.js";

const frontendURL = (
  process.env.FRONTEND_URL ?? "https://quorum-io.vercel.app"
).replace(/\/$/, "");

const authURL = frontendURL;
const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
  baseURL: authURL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    frontendURL,
    "https://echo-server-iji0.onrender.com",
  ].filter((url): url is string => Boolean(url)),

  account: {
    skipStateCookieCheck: true,
    storeStateStrategy: "database",
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google"],
    },
  },

  advanced: {
    useSecureCookies: isProd,
    // Required: trust X-Forwarded-* headers from Vercel/Render proxy
    trustedProxyHeaders: true,
    // 'lax' works because Vercel proxies /api/* making auth same-origin.
    // 'none' would signal third-party cookies — exactly what Safari ITP blocks.
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: isProd,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Password reset for ${user.email}: ${url}`);
    },
  },

  plugins: [
    bearer(),
  ],

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
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
