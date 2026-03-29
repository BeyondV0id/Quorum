import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthPayload } from "@/api/auth";
import {
  useSignin,
  useSignup,
  useRequestPasswordReset,
  useResendVerification,
} from "@/hooks/use-auth";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons";

type AuthMode =
  | "signin"
  | "signup"
  | "forgot"
  | "signup-success"
  | "forgot-success";

type FormMode = "signin" | "signup" | "forgot";
const HATCH = {
  backgroundImage:
    "repeating-linear-gradient(315deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)",
  backgroundSize: "10px 10px",
  backgroundAttachment: "fixed",
} as const;

const MODE_COPY: Record<
  FormMode,
  { title: string; description: string; submitLabel: string }
> = {
  signin: {
    title: "Welcome back",
    description: "Sign in to your Quorum account.",
    submitLabel: "Sign in",
  },
  signup: {
    title: "Create an account",
    description: "Join Quorum and start asking questions.",
    submitLabel: "Create Account",
  },
  forgot: {
    title: "Reset Password",
    description: "Enter your email to receive password reset instructions.",
    submitLabel: "Send Reset Link",
  },
};

function AuthSuccessCard({
  icon,
  iconClassName,
  title,
  description,
  children,
}: {
  icon: string;
  iconClassName: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative grid min-h-screen grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-background text-foreground">
      <div className="col-start-2 row-span-full border-x border-border" style={HATCH} />
      <div className="col-start-4 row-span-full border-x border-border" style={HATCH} />
      <div className="col-span-full row-start-2 h-px bg-border" />
      <div className="col-span-full row-start-4 h-px bg-border" />
      <div className="col-start-3 row-start-3 flex max-w-sm flex-col bg-muted p-2">
        <div className="rounded-xl bg-card p-10 text-center shadow-xs">
          <div className={`mx-auto size-12 rounded-full flex items-center justify-center mb-4 ${iconClassName}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          <h2 className="mb-2 text-base font-semibold text-foreground">{title}</h2>
          <p className="mb-6 text-xs text-muted-foreground">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}


export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("signup");
  const navigate = useNavigate();
  const [form, setForm] = useState<AuthPayload>({
    email: "",
    password: "",
  });

  const formMode =
    mode === "signin" || mode === "signup" || mode === "forgot"
      ? mode
      : "signin";

  const updateForm = (fields: Partial<AuthPayload>) => {
    setForm((prev) => ({ ...prev, ...fields }));
  };

  const {
    mutateAsync: signIn,
    isPending: isInPending,
    error: signInError,
  } = useSignin();
  const {
    mutateAsync: signUp,
    isPending: isUpPending,
    error: signUpError,
  } = useSignup();
  const {
    mutateAsync: requestReset,
    isPending: isResetPending,
    error: resetError,
  } = useRequestPasswordReset();
  const { mutateAsync: resendVerification, isPending: isResendPending } =
    useResendVerification();



  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const payload: AuthPayload = {
      email: form.email.trim(),
      password: form.password,
    };

    if (formMode === "forgot") {
      if (!payload.email) return;
      await requestReset(payload.email);
      setMode("forgot-success");
      return;
    }

    if (formMode === "signup") {
      if (!payload.email || !payload.password) return;
      await signUp(payload);
      setMode("signup-success");
      return;
    }

    if (!payload.email || !payload.password) return;
    await signIn(payload);
    navigate("/home");
  }

  // Google OAuth temporarily disabled
  // async function handleSigninWithGoogle() {
  //   await authClient.signIn.social({
  //     provider: "google",
  //     callbackURL: "/home",
  //   });
  // }
  const error =
    formMode === "forgot"
      ? resetError
      : formMode === "signup"
        ? signUpError
        : formMode === "signin"
          ? signInError
          : null;
  const isLoading = isInPending || isUpPending || isResetPending;
  const copy = MODE_COPY[formMode];

  if (mode === "forgot-success") {
    return (
      <AuthSuccessCard
        icon="📧"
        iconClassName="bg-blue-100"
        title="Check your email"
        description={
          <>
            If an account exists for <strong>{form.email}</strong>, we've sent
            instructions to reset your password.
          </>
        }
      >
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setMode("signin")}
        >
          Back to Sign In
        </Button>
      </AuthSuccessCard>
    );
  }

  if (mode === "signup-success") {
    return (
      <AuthSuccessCard
        icon="✉️"
        iconClassName="bg-green-100"
        title="Check your email"
        description={
          <>
            We've sent a verification link to <strong>{form.email}</strong>.
            Please click the link to verify your account before signing in.
          </>
        }
      >
        <Button
          variant="outline"
          className="w-full mb-2"
          onClick={() => setMode("signin")}
        >
          Back to Sign In
        </Button>
        <Button
          variant="ghost"
          className="w-full text-xs text-muted-foreground"
          disabled={isResendPending}
          onClick={async () => {
            if (!form.email) return;
            try {
              await resendVerification(form.email);
              alert("Verification email resent!");
            } catch {
              alert("Failed to resend email. Please try again.");
            }
          }}
        >
          {isResendPending ? "Sending..." : "Resend Validation Email"}
        </Button>
      </AuthSuccessCard>
    );
  }

  return (
    <div className="relative grid min-h-screen grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] grid-rows-[1fr_1px_auto_1px_1fr] bg-background text-foreground">

      {/* Hatched side columns */}
      <div className="col-start-2 row-span-full border-x border-border" style={HATCH} />
      <div className="col-start-4 row-span-full border-x border-border" style={HATCH} />

      {/* Horizontal border lines */}
      <div className="col-span-full row-start-2 h-px bg-border" />
      <div className="col-span-full row-start-4 h-px bg-border" />

      {/* Auth card */}
      <div className="col-start-3 row-start-3 flex w-full max-w-sm flex-col bg-muted p-2">
        <div className="rounded-md bg-card p-8 text-sm text-card-foreground shadow-xs">

          {/* Logo */}
          <div className="mb-8 flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background">
              <span className="text-xs font-bold">Q</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Quorum</span>
          </div>

          <h1 className="mb-1 text-base font-semibold text-foreground">{copy.title}</h1>
          <p className="mb-6 text-xs text-muted-foreground">{copy.description}</p>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <HugeiconsIcon icon={Alert02Icon} size={14} />
                <span>{error.message}</span>
              </div>
            )}

            {(mode === "signup" || mode === "forgot" || mode === "signin") && (
              <Input
                name="email"
                type="email"
                placeholder="Email"
                autoComplete="email"
                required
                className="h-9 text-sm"
                value={form.email}
                onChange={(e) => updateForm({ email: e.target.value })}
              />
            )}

            {mode !== "forgot" && (
              <Input
                name="password"
                type="password"
                placeholder={mode === "signup" ? "Create Password" : "Password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                className="h-9 text-sm"
                value={form.password}
                onChange={(e) => updateForm({ password: e.target.value })}
              />
            )}

            <Button className="h-9 w-full text-xs" type="submit" disabled={isLoading}>
              {isLoading ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              ) : (
                copy.submitLabel
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-3">
            {mode === "signin" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot your password?
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (mode === "forgot") setMode("signin");
                else if (mode === "signup") setMode("signin");
                else setMode("signup");
              }}
              className="block w-full text-center text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {mode === "forgot"
                ? "Back to Sign In"
                : mode === "signup"
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
