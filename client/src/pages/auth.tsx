import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, Loading03Icon } from "@hugeicons/core-free-icons";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address").refine(e => e.endsWith("@gmail.com"), "Only Gmail accounts are currently supported"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthMode = "signin" | "signup" | "forgot" | "forgot-success";
type FormMode = "signin" | "signup" | "forgot";

const HATCH = {
  backgroundImage:
    "repeating-linear-gradient(315deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)",
  backgroundSize: "10px 10px",
  backgroundAttachment: "fixed",
} as const;

const MODE_COPY: Record<FormMode, { title: string; description: string; submitLabel: string }> = {
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const formMode: FormMode =
    mode === "signin" || mode === "signup" || mode === "forgot" ? mode : "signin";

  const copy = MODE_COPY[formMode];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAuthError(null);

    const trimmedEmail = email.trim();

    // Validate
    try {
      if (formMode !== "forgot") {
        authSchema.parse({ email: trimmedEmail, password });
      } else {
        z.string()
          .email("Please enter a valid email")
          .refine(e => e.endsWith("@gmail.com"), "Only Gmail accounts are currently supported")
          .parse(trimmedEmail);
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setAuthError(err.issues[0].message);
        return;
      }
    }

    setIsPending(true);

    try {
      if (formMode === "forgot") {
        const { error } = await authClient.requestPasswordReset({
          email: trimmedEmail,
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw new Error(error.message ?? "Failed to send reset link");
        setMode("forgot-success");
        return;
      }

      if (formMode === "signup") {
        const base = trimmedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") || "user";
        const { error } = await authClient.signUp.email({
          email: trimmedEmail,
          password,
          name: base,
          username: `${base}_${Math.random().toString(36).slice(2, 6)}`,
        } as Parameters<typeof authClient.signUp.email>[0]);
        if (error) throw new Error(error.message ?? "Sign up failed");
        navigate("/home");
        return;
      }

      // signin
      const { error } = await authClient.signIn.email({
        email: trimmedEmail,
        password,
      });
      if (error) throw new Error(error.message ?? "Sign in failed");
      navigate("/home");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsPending(false);
    }
  }

  if (mode === "forgot-success") {
    return (
      <AuthSuccessCard
        icon="📧"
        iconClassName="bg-blue-100"
        title="Check your email"
        description={
          <>
            If an account exists for <strong>{email}</strong>, we've sent
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
            {authError && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                <HugeiconsIcon icon={Alert02Icon} size={14} />
                <span>{authError}</span>
              </div>
            )}

            <Input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              className="h-9 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode !== "forgot" && (
              <Input
                name="password"
                type="password"
                placeholder={mode === "signup" ? "Create Password" : "Password"}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                className="h-9 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <Button className="h-9 w-full text-xs" type="submit" disabled={isPending}>
              {isPending ? (
                <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
              ) : (
                copy.submitLabel
              )}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                authClient.signIn.social({ provider: "github", callbackURL: `${window.location.origin}/home` })
              }
              className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-medium text-card-foreground transition hover:bg-muted hover:opacity-90 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

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
