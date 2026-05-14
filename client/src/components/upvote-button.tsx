import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ThumbsUp } from "@phosphor-icons/react";
import type { UpvoteState } from "@/types";

type UpvoteButtonProps = UpvoteState & {
  onToggle: () => void;
  className?: string;
  count: number;
  isUpvoted: boolean;
  disabled?: boolean;
};

export function UpvoteButton({
  count,
  isUpvoted,
  onToggle,
  className,
  isPending,
}: UpvoteButtonProps & { isPending?: boolean }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        if (isPending) return;
        onToggle();
      }}
      className={cn(
        "gap-1 px-2 h-7 text-neutral-500 hover:bg-transparent hover:text-neutral-900 dark:hover:text-neutral-100 group/upvote transition-all duration-200",
        className,
        isUpvoted &&
          "text-blue-500 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-500",
      )}
    >
      <ThumbsUp
        weight={isUpvoted ? "fill" : "regular"}
        className="size-4 transition-transform group-hover/upvote:-translate-y-0.5"
      />
      <span className="text-xs font-medium">{count}</span>
    </Button>
  );
}
