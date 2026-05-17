import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { dash } from "@better-auth/infra";

import { db } from "../db/index.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  trustedOrigins: [(process.env.CLIENT_URL ?? "http://localhost:5173").replace(/\/$/, "")],
  


  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
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

  plugins: [
    bearer(),
    dash(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
