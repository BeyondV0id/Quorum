import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  Add01Icon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import { cn, getInitials } from "@/lib/utils";
import { Link } from "react-router";
import type { Space } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { EditSpaceDialog } from "@/components/spaces/edit-space-dialog";
function formatMemberCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}
interface SpaceCardProps {
  space: Space;
  compact?: boolean;
}
import { useJoinSpace, useLeaveSpace } from "@/hooks/use-space";
import { SPACE_COLORS } from "./consts";
export function SpaceCard({ space, compact = false }: SpaceCardProps) {
  const { data: user } = useAuth();
  const joinMutation = useJoinSpace();
  const leaveMutation = useLeaveSpace();
  const isPending = joinMutation.isPending || leaveMutation.isPending;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const colorClass =
    SPACE_COLORS[(space.colorIndex ?? 0) % SPACE_COLORS.length];
  const canEdit = !!user?.username && user.username === space.creatorUsername;
  const handleToggleJoin = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!space.uid || isPending) return;
    if (space.isJoined) {
      leaveMutation.mutate(space.uid);
    } else {
      joinMutation.mutate(space.uid);
    }
  };
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-[#0f1112] border border-neutral-200 dark:border-neutral-800 transition-colors hover:border-neutral-300 dark:hover:border-neutral-700",
        compact && "p-2",
      )}
    >
      <Link
        to={`/space/${space.uid}`}
        className="flex items-center gap-3 flex-1 min-w-0 group"
      >
        <div
          className={cn(
            "size-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 transition-opacity group-hover:opacity-90",
            colorClass,
          )}
        >
          {getInitials(space.name)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 truncate">
            {space.name}
          </h3>
          <div className="flex items-center gap-1.5 text-neutral-500 mt-0.5">
            <HugeiconsIcon icon={UserMultiple02Icon} className="size-3" />
            <span className="text-xs font-medium">
              {formatMemberCount(space.memberCount || 0)} members
            </span>
          </div>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        {canEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            onClick={(e) => {
              e.preventDefault();
              setIsEditOpen(true);
            }}
            aria-label="Edit space"
          >
            <HugeiconsIcon icon={PencilEdit02Icon} className="size-4" />
          </Button>
        )}
        <Button
          variant={space.isJoined ? "secondary" : "default"}
          size="sm"
          className={cn(
            "rounded-full h-7 px-3 text-xs font-medium transition-all shadow-none",
            !space.isJoined &&
            "bg-orange-600 hover:bg-orange-700 text-white border-transparent",
            space.isJoined &&
            "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
          )}
          onClick={handleToggleJoin}
        >
          {space.isJoined ? "Joined" : "Join"}
        </Button>
      </div>
      {canEdit && space.uid && (
        <EditSpaceDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          space={space}
        />
      )}
    </div>
  );
}
interface SpaceListProps {
  spaces: Space[];
  limit?: number;
}
import { DashedEmptyState } from "@/components/ui/dashed-empty-state";
import { Search01Icon } from "@hugeicons/core-free-icons";

export function SpaceList({ spaces, limit }: SpaceListProps) {
  const displaySpaces = limit ? spaces.slice(0, limit) : spaces;
  if (displaySpaces.length === 0) {
    return (
      <DashedEmptyState
        title="No spaces found"
        description="Try searching for something else or create a new one."
        icon={<HugeiconsIcon icon={Search01Icon} className="size-8 opacity-50" />}
      />
    );
  }
  return (
    <div className="space-y-2">
      {displaySpaces.map((space, i) => (
        <SpaceCard
          key={space.uid || i}
          space={{ ...space, colorIndex: space.colorIndex ?? i }}
        />
      ))}
    </div>
  );
}
interface CreateSpaceButtonProps {
  onClick?: () => void;
  className?: string;
}
export function CreateSpaceButton({
  onClick,
  className,
}: CreateSpaceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group w-full flex items-center gap-3 p-3 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all",
        className,
      )}
    >
      <div className="size-10 rounded-xl flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 text-neutral-500 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100">
        <HugeiconsIcon icon={Add01Icon} className="size-5" />
      </div>
      <span className="text-sm font-medium">Create a new Space</span>
    </button>
  );
}
