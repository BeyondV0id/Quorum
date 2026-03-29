import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";

import { db } from "../db/index.js";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM ?? "Echo <noreply@yourdomain.com>";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),

  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:5173"],
  


  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Reset your Echo password",
        html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void resend.emails.send({
        from: FROM,
        to: user.email,
        subject: "Verify your Echo account",
        html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to verify your email. Link expires in 24 hours.</p>`,
      });
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

  plugins: [
    bearer(),
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
