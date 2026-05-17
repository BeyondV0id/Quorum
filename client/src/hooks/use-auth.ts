import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { AuthPayload } from "@/api/auth";

import type { AuthUser } from "@/lib/auth-client";

export function useAuth() {
  const { data, isPending, error } = authClient.useSession();
  
  return {
    data: (data?.user as AuthUser) ?? null,
    isPending,
    isLoading: isPending,
    isSuccess: !!data?.session,
    isError: !!error,
    error,
  };
}

// Helper to create a unified async mutation hook
function useAsyncMutation<TArgs, TRet>(
  fetcher: (args: TArgs) => Promise<{ data?: TRet | null; error?: { message?: string } | null }>
) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (args: TArgs) => {
    setIsPending(true);
    setError(null);
    try {
      const { data, error: authErr } = await fetcher(args);
      if (authErr) {
        throw new Error(authErr.message || "An error occurred");
      }
      return data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { mutateAsync, isPending, error };
}

export function useSignin() {
  return useAsyncMutation<AuthPayload, any>(async (payload) => {
    return authClient.signIn.email({
      email: payload.email,
      password: payload.password,
    });
  });
}

export function useSignup() {
  return useAsyncMutation<AuthPayload, any>(async (payload) => {
    const baseUsername = payload.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const defaultUsername = `${baseUsername}_${randomSuffix}`;
    
    return authClient.signUp.email({
      email: payload.email,
      password: payload.password,
      name: baseUsername,
      username: defaultUsername,
    } as any);
  });
}

export function useSignout() {
  const [isPending, setIsPending] = useState(false);
  const mutate = async () => {
    setIsPending(true);
    await authClient.signOut();
    localStorage.removeItem("bearer_token");
    setIsPending(false);
    // Force a reload to clear all states nicely
    window.location.href = "/";
  };
  return { mutate, isPending };
}

export function useDeleteAccount() {
  return useAsyncMutation<void, any>(async () => {
    return authClient.deleteUser();
  });
}

export function useResendVerification() {
  return useAsyncMutation<string, any>(async (email) => {
    return authClient.sendVerificationEmail({ email });
  });
}

export function useVerifyEmail() {
  return useAsyncMutation<string, any>(async (token) => {
    return authClient.verifyEmail({ query: { token } } as any);
  });
}

export function useRequestPasswordReset() {
  return useAsyncMutation<string, any>(async (email) => {
    return (authClient as any).forgetPassword({ email });
  });
}

export function useResetPassword() {
  return useAsyncMutation<{ token: string; newPassword: string }, any>(
    async ({ newPassword }) => {
      // better-auth uses the URL token inherently if it's in the link
      return authClient.resetPassword({ newPassword });
    }
  );
}
