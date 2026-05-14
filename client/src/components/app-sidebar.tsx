import { useState } from "react";
import type { User } from "@/types";
import { useNavigate, useLocation } from "react-router";
import { House, MagnifyingGlass, Plus, Bell, CaretDown } from "@phosphor-icons/react";
import { SPACE_COLORS } from "@/components/spaces/consts";
import { useListSpaces } from "@/hooks/use-space";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MentionField } from "@/components/ui/mention-field";
import { Button } from "@/components/ui/button";
import { useCreateQuestion } from "@/hooks/use-questions";
import { validateMentions } from "@/lib/mention-validation";
import { toast } from "@/lib/toast";
interface NavItem {
  icon: typeof House;
  path?: string;
  label: string;
  onClick?: () => void;
  isAction?: boolean;
  hasBadge?: boolean;
}
function NavButton({
  icon: Icon,
  label,
  isActive,
  isAction,
  hasBadge,
  isMobile,
  onClick,
}: {
  icon: typeof House;
  label?: string;
  isActive?: boolean;
  isAction?: boolean;
  hasBadge?: boolean;
  isMobile: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center min-[1200px]:justify-start gap-4 rounded-xl transition-all duration-150 active:scale-95 group/nav",
        isMobile ? "p-2" : "p-3 w-full max-w-[200px]",
        isAction
          ? "bg-primary text-primary-foreground hover:opacity-80 justify-center"
          : isActive
            ? "bg-accent text-foreground font-semibold"
            : "text-muted-foreground hover:bg-accent hover:text-foreground font-medium",
      )}
    >
      <Icon
        size={24}
        weight={isActive ? "fill" : "regular"}
        className="shrink-0"
      />
      {!isMobile && label && (
        <span className="hidden min-[1200px]:block text-base">
          {label}
        </span>
      )}
      {hasBadge && (
        <span
          className={cn(
            "absolute rounded-full bg-red-500 border-2 border-background",
            isMobile ? "top-1 right-1 size-2" : "top-2 left-7 size-2.5",
          )}
        />
      )}
    </button>
  );
}
function ProfileButton({
  user,
  isMobile,
  isActive,
  onClick,
}: {
  user: User | null | undefined;
  isMobile: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center min-[1200px]:justify-start gap-3 rounded-xl transition-all duration-150 active:scale-95",
        isMobile ? "p-2" : "p-2 w-full max-w-[200px]",
        isActive
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <UserAvatar
        src={user?.avatar}
        name={user?.username || "U"}
        className="size-8 shrink-0"
      />
      {!isMobile && (
        <div className="hidden min-[1200px]:block text-left overflow-hidden">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {user?.username || "User"}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            @{user?.username}
          </p>
        </div>
      )}
    </button>
  );
}

function CreateQueryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [content, setContent] = useState("");
  const { mutate: createQuestion, isPending } = useCreateQuestion();
  const [isValidating, setIsValidating] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const { data: allSpaces = [] } = useListSpaces();
  const spaces = allSpaces.filter((c) => c.isJoined);
  const handleSubmit = async () => {
    if (!content.trim() || !selectedSpace || isPending || isValidating) return;
    setIsValidating(true);
    try {
      const result = await validateMentions(content);
      if (result.missing.length > 0) {
        toast.error(`User not found: ${result.missing.join(", ")}`);
        setIsValidating(false);
        return;
      }
      createQuestion(
        { content, spaceUid: selectedSpace },
        {
          onSuccess: () => {
            setContent("");
            setSelectedSpace("");
            onOpenChange(false);
          },
          onSettled: () => {
            setIsValidating(false);
          },
        },
      );
    } catch {
      toast.error("Failed to validate mentions");
      setIsValidating(false);
    }
  };
  const selectedSpaceData = spaces.find((c) => c.uid === selectedSpace);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[500px] overflow-hidden p-0 pb-1"
      >
        <DialogHeader>
          <DialogTitle className="pt-6 px-4">New Query</DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <div className="bg-background transition-colors focus-within:border-neutral-400 dark:focus-within:border-neutral-500">
            <MentionField
              placeholder={
                selectedSpaceData
                  ? `Ask in ${selectedSpaceData.name}...`
                  : "Select a space to ask a question..."
              }
              ariaLabel="Question content"
              className="resize-none h-32 px-4 border-none shadow-none focus-visible:ring-0 bg-transparent text-base"
              value={content}
              onValueChange={setContent}
              multiline
              autoFocus
            />
            <div className="flex items-center justify-between p-2 bg-muted/50 border-t border-border">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg gap-2 h-8 px-2.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition-colors focus:outline-none">
                  {selectedSpaceData ? (
                    <>
                      <div
                        className={cn(
                          "size-2 rounded-full",
                          SPACE_COLORS[
                            (selectedSpaceData.colorIndex || 0) %
                              SPACE_COLORS.length
                          ],
                        )}
                      />
                      {selectedSpaceData.name}
                    </>
                  ) : (
                    <>
                      <CaretDown
                        size={14}
                        className="text-neutral-500"
                      />
                      Select Space
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {spaces.length > 0 ? (
                    spaces.map((space) => (
                      <DropdownMenuItem
                        key={space.uid}
                        onClick={() => setSelectedSpace(space.uid!)}
                        className="gap-2"
                      >
                        <div
                          className={cn(
                            "size-3 rounded-full",
                            SPACE_COLORS[
                              (space.colorIndex || 0) % SPACE_COLORS.length
                            ],
                          )}
                        />
                        {space.name}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-neutral-500">
                      No spaces joined
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                size="default"
                className="font-normal rounded-lg h-9 px-4"
                onClick={handleSubmit}
                disabled={
                  !selectedSpace || !content.trim() || isPending || isValidating
                }
              >
                {isPending ? "Asking..." : "Ask"}
                <Plus
                  size={14}
                  weight="bold"
                  className="ml-1.5"
                />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
export function AppSidebar() {
  const isMobile = useIsMobile();
  const [createOpen, setCreateOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useAuth();
  const navItems: NavItem[] = [
    { icon: House, path: "/home", label: "Home" },
    { icon: MagnifyingGlass, path: "/explore", label: "Explore" },
    {
      icon: Bell,
      path: "/notifications",
      label: "Notifications",
      hasBadge: true,
    },
    { icon: Plus, label: "Ask", isAction: true },
  ];
  const navigateTo = (path: string) => {
    if (path === location.pathname) return;
    navigate(path);
  };
  const handleNavClick = (item: NavItem) => {
    if (item.isAction) {
      setCreateOpen(true);
    } else if (item.path) {
      navigateTo(item.path);
    }
  };
  const isActive = (path?: string) => path === location.pathname;
  if (isMobile) {
    return (
      <>
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background pt-5 pb-10 px-4">
          <div className="flex items-center">
            <div className="flex-1 flex justify-around">
              {navItems.slice(0, 2).map((item) => (
                <NavButton
                  key={item.label}
                  icon={item.icon}
                  isActive={isActive(item.path)}
                  isMobile={true}
                  onClick={() => handleNavClick(item)}
                />
              ))}
            </div>
            <div className="mx-4">
              <NavButton
                icon={navItems[3].icon}
                isAction={true}
                isMobile={true}
                onClick={() => handleNavClick(navItems[3])}
              />
            </div>
            <div className="flex-1 flex justify-around">
              <NavButton
                key="notifications"
                icon={navItems[2].icon}
                isActive={isActive(navItems[2].path)}
                hasBadge={navItems[2].hasBadge}
                isMobile={true}
                onClick={() => handleNavClick(navItems[2])}
              />
              <ProfileButton
                user={user}
                isMobile={true}
                isActive={isActive("/profile")}
                onClick={() => navigateTo("/profile")}
              />
            </div>
          </div>
        </nav>
        <CreateQueryDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    );
  }
  return (
    <>
      <aside className="sticky top-0 h-screen flex flex-col py-8 border-r border-border bg-background z-40 w-[80px] min-[1200px]:w-[250px] items-center min-[1200px]:items-start min-[1200px]:pl-8 shrink-0">
        <div className="flex items-center gap-4 mb-8 min-[1200px]:px-4">
          <div className="flex size-9 items-center justify-center rounded-md border border-border bg-foreground text-background shrink-0">
            <span className="font-pixel-square text-xs font-bold">Q</span>
          </div>
          <span className="font-pixel-square text-xl font-bold hidden min-[1200px]:block tracking-tight text-foreground">
            Quorum
          </span>
        </div>
        <nav className="flex flex-col items-center min-[1200px]:items-stretch gap-4 w-full min-[1200px]:max-w-[200px]">
          {navItems.map((item) => (
            <NavButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              isActive={isActive(item.path)}
              isAction={item.isAction}
              hasBadge={item.hasBadge}
              isMobile={false}
              onClick={() => handleNavClick(item)}
            />
          ))}
        </nav>
        <div className="mt-8 w-full flex justify-center min-[1200px]:justify-start min-[1200px]:max-w-[200px]">
          <ProfileButton
            user={user}
            isMobile={false}
            isActive={isActive("/profile")}
            onClick={() => navigateTo("/profile")}
          />
        </div>
      </aside>
      <CreateQueryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
