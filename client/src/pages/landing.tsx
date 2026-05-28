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
          </div>
        </div>
      </div>
    </div>
  );
}
