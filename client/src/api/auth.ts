import { authClient } from "@/lib/auth-client";

export type AuthPayload = {
  email: string;
  password: string;
};

export async function signin(payload: AuthPayload) {
  const { data, error } = await authClient.signIn.email({
    email: payload.email,
    password: payload.password,
  });
  if (error) throw new Error(error.message ?? "Sign in failed");
  return data;
}

export async function signup(payload: AuthPayload) {
  const { data, error } = await authClient.signUp.email({
    email: payload.email,
    password: payload.password,
    name: payload.email, // Better Auth requires name; use email as fallback
  });
  if (error) throw new Error(error.message ?? "Signup failed");
  return data;
}


export async function signout() {
  const { error } = await authClient.signOut();
  if (error) throw new Error(error.message ?? "Sign out failed");
}

export async function verifySession() {
  const { data, error } = await authClient.getSession();
  if (error || !data?.session) throw new Error("No active session");
  return data.user;
}

export async function verifyEmail(token: string) {
  const { data, error } = await authClient.verifyEmail({ query: { token } });
  if (error) throw new Error(error.message ?? "Email verification failed");
  return data;
}

export async function requestPasswordReset(email: string) {
  const { data, error } = await authClient.requestPasswordReset({
    email,
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error(error.message ?? "Failed to request password reset");
  return data;
}

export async function resetPassword(token: string, newPassword: string) {
  const { data, error } = await authClient.resetPassword({
    newPassword,
    token,
  });
  if (error) throw new Error(error.message ?? "Failed to reset password");
  return data;
}

export async function deleteAccount() {
  const { data, error } = await authClient.deleteUser();
  if (error) throw new Error(error.message ?? "Failed to delete account");
  return data;
}

export async function resendVerification(email: string) {
  const { data, error } = await authClient.sendVerificationEmail({
    email,
    callbackURL: `${window.location.origin}/verify-email`,
  });
  if (error) throw new Error(error.message ?? "Failed to resend verification email");
  return data;
}
