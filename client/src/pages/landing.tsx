import { Link } from "react-router";
import { authClient } from "@/lib/auth-client";
import { CLIENT_URL } from "@/config";
import { PixelHeading } from "@/components/ui/pixel-heading-word";

const HATCH = {
  backgroundImage:
    "repeating-linear-gradient(315deg, var(--border) 0, var(--border) 1px, transparent 0, transparent 50%)",
  backgroundSize: "10px 10px",
  backgroundAttachment: "fixed",
} as const;

const features = [
  "Ask questions inside focused communities called Spaces",
  "Upvote the best answers, pin the most useful ones",
  "Mention teammates, get notified when someone replies",
  "Invite-free — open to anyone who wants to learn",
];

export default function Landing() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground sm:px-0 sm:grid sm:grid-cols-[1fr_2.5rem_auto_2.5rem_1fr] sm:grid-rows-[1fr_1px_auto_1px_1fr]">

      {/* Hatched side columns — desktop only */}
      <div className="relative col-start-2 row-span-full hidden border-x border-border sm:block" style={HATCH} />
      <div className="relative col-start-4 row-span-full hidden border-x border-border sm:block" style={HATCH} />

      {/* Horizontal border lines — desktop only */}
      <div className="col-span-full row-start-2 hidden h-px bg-border sm:block" />
      <div className="col-span-full row-start-4 hidden h-px bg-border sm:block" />

      {/* Main content card */}
      <div className="w-full sm:col-start-3 sm:row-start-3 sm:flex sm:w-[680px] sm:flex-col bg-muted p-2">
        <div className="rounded-md bg-card p-6 sm:p-12 text-card-foreground shadow-xs">

          {/* Brand — animated pixel word */}
          <div className="mb-8 flex flex-col items-center gap-6 text-center">
            <div className="flex items-center justify-center p-4 sm:p-6">
              <PixelHeading
                as="h1"
                className="text-5xl sm:text-7xl tracking-tight text-foreground leading-none"
              >
                Quorum
              </PixelHeading>
            </div>
          </div>

          <div className="space-y-5 text-sm/7">
            <PixelHeading
              as="h2"
              className="text-sm text-foreground"
            >
              A community Q&amp;A platform built for real conversations.
            </PixelHeading>

            <ul className="space-y-3">
              {features.map((f) => (
                <li key={f} className="flex gap-3">
                  <svg className="mt-1 size-4 shrink-0 text-foreground" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="11" className="fill-accent" />
                    <circle cx="11" cy="11" r="10.5" className="stroke-border" />
                    <path d="M8 11.5L10.5 14L14 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="font-pixel-square text-xs text-muted-foreground">{f}</p>
                </li>
              ))}
            </ul>

            <p className="font-pixel-square text-xs text-muted-foreground">
              No algorithms. No noise. Just focused communities and honest answers.
            </p>
          </div>

          <hr className="my-8 border-border" />

          <div className="flex flex-col gap-3">
            <Link
              to="/auth"
              className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-foreground px-4 text-xs font-medium text-background transition hover:opacity-80"
            >
              Get started →
            </Link>

            <button
              onClick={() =>
                authClient.signIn.social({ provider: "github", callbackURL: `${CLIENT_URL}/home` })
              }
              className="inline-flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-xs font-medium text-card-foreground transition hover:bg-muted hover:opacity-90 active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>

            <p className="text-center text-[11px] text-muted-foreground">
              Already have an account?{" "}
              <Link to="/auth" className="underline underline-offset-2 hover:text-foreground">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
