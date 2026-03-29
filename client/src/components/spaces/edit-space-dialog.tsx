import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Space } from "@/types";
import { useUpdateSpace } from "@/hooks/use-space";
import { SPACE_COLORS } from "@/components/spaces/consts";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";

type EditSpaceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space;
};

export function EditSpaceDialog({
  open,
  onOpenChange,
  space,
}: EditSpaceDialogProps) {
  const { mutate: updateSpace, isPending } = useUpdateSpace();
  const [draft, setDraft] = useState<Space>(space);

  useEffect(() => {
    setDraft(space);
  }, [space]);

  const updateDraft = (fields: Partial<Space>) => {
    setDraft((prev) => ({ ...prev, ...fields }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.name?.trim() || !draft.description?.trim() || !draft.uid) return;
    updateSpace(
      {
        uid: draft.uid,
        space: {
          name: draft.name.trim(),
          description: draft.description.trim(),
          colorIndex: draft.colorIndex ?? 0,
        },
      },
      {
        onSuccess: () => {
          toast.success("Space updated");
          onOpenChange(false);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update space");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit Space</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Name
              </label>
              <Input
                value={draft.name}
                placeholder="e.g. Photography Enthusiasts"
                onChange={(e) => updateDraft({ name: e.target.value })}
                className="rounded-xl mt-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <Textarea
                value={draft.description}
                placeholder="What is this space about?"
                onChange={(e) => updateDraft({ description: e.target.value })}
                className="resize-none min-h-20 rounded-xl mt-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Theme Color
              </label>
              <div className="flex gap-2 flex-wrap mt-2">
                {SPACE_COLORS.map((color, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => updateDraft({ colorIndex: index })}
                    className={cn(
                      "size-6 rounded-full transition-all ring-2 ring-offset-2 ring-transparent ring-offset-transparent",
                      color,
                      {
                        "ring-neutral-900 dark:ring-neutral-100 ring-offset-white dark:ring-offset-neutral-900":
                          draft.colorIndex === index,
                      },
                    )}
                  />
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!draft.name?.trim() || !draft.description?.trim() || isPending}
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
