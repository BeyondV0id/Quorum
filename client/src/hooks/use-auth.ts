import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  signin,
  signup,
  signout,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  deleteAccount,
  resendVerification,
} from "@/api/auth";

// Wraps authClient.useSession() to provide a compatible shape:
// consumers do `const { data: user } = useAuth()` and access user fields directly.
export function useAuth() {
  const { data, isPending, error } = authClient.useSession();
  return {
    data: data?.user ?? null,
    isPending,
    isLoading: isPending,
    isSuccess: !!data?.session,
    isError: !!error,
    error,
  };
}

// ─── Sign in ────────────────────────────────────────────────────────────────
export function useSignin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// ─── Sign up ────────────────────────────────────────────────────────────────
export function useSignup() {
  return useMutation({
    mutationFn: signup,
  });
}

// ─── Sign out ───────────────────────────────────────────────────────────────
export function useSignout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signout,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["auth"] }),
  });
}

// ─── Account management ─────────────────────────────────────────────────────
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword(token, newPassword),
  });
}
