import { CircleNotch } from "@phosphor-icons/react";

export function LoadingSpinner() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <CircleNotch
        size={32}
        className="animate-spin text-neutral-400"
      />
    </div>
  );
}
