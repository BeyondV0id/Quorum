import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-green-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-500",
  "bg-sky-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
];

function AvatarFallback({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const charCode = name.charCodeAt(0) || 0;
  const colorIndex = charCode % AVATAR_COLORS.length;
  const colorClass = AVATAR_COLORS[colorIndex];
  const initials = getInitials(name);
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-medium text-xs select-none",
        colorClass,
        className,
      )}
    >
      {initials}
    </div>
  );
}

function AvatarImage({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return <AvatarFallback name={name} className={className} />;
  }

  return (
    <img
      src={src}
      alt={name}
      className={cn("rounded-full object-cover", className)}
      onError={() => setImgError(true)}
    />
  );
}

export function UserAvatar({
  src,
  name,
  className,
}: {
  src?: string | null;
  name: string;
  className?: string;
}) {
  if (!src) {
    return <AvatarFallback name={name} className={className} />;
  }

  return (
    <AvatarImage
      key={src}
      src={src}
      name={name}
      className={className}
    />
  );
}
