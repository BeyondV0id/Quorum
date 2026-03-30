import { useState } from "react";
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
import { useCreateSpace } from "@/hooks/use-space";
import { SPACE_COLORS } from "@/components/spaces/consts";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router";
import { toast } from "@/lib/toast";

interface CreateSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSpaceDialog({
  open,
  onOpenChange,
}: CreateSpaceDialogProps) {
  const navigate = useNavigate();
  const { mutate: createSpace, isPending } = useCreateSpace();
  const [space, setSpace] = useState<Space>({
    name: "",
    description: "",
    colorIndex: 0,
  });

  const updateSpace = (fields: Partial<Space>) => {
    return setSpace((prev) => {
      return { ...prev, ...fields };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending || !space.name.trim() || !space.description.trim()) return;
    createSpace(space, {
      onSuccess: (newSpace) => {
        onOpenChange(false);
        if (newSpace?.uid) {
          navigate(`/space/${newSpace.uid}`);
          toast.success("Space created successfully");
        }
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Failed to create space");
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Create a Space</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <form className="space-y-4" onSubmit={(e) => handleSubmit(e)}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Name
              </label>
              <Input
                placeholder="e.g. Photography Enthusiasts"
                onChange={(e) => updateSpace({ name: e.target.value })}
                className="rounded-xl mt-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <Textarea
                placeholder="What is this space about?"
                onChange={(e) => updateSpace({ description: e.target.value })}
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
                    onClick={() => updateSpace({ colorIndex: index })}
                    className={cn(
                      "size-6 rounded-full transition-all ring-2 ring-offset-2 ring-transparent ring-offset-transparent",
                      color,
                      {
                        "ring-neutral-900 dark:ring-neutral-100 ring-offset-white dark:ring-offset-neutral-900":
                          space.colorIndex === index,
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
              <Button type="submit" disabled={!space.name.trim() || !space.description.trim()}>Create Space</Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
