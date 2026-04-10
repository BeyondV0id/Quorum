import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { applyMention, getMentionContext } from "@/lib/mentions";
import { useMentionUsers } from "@/hooks/use-mentions";
import { UserAvatar } from "@/components/ui/user-avatar";

type MentionFieldProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
  multiline?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  autoFocus?: boolean;
};

export function MentionField({
  value,
  onValueChange,
  placeholder,
  className,
  containerClassName,
  multiline,
  disabled,
  ariaLabel,
  autoFocus,
}: MentionFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState<number | null>(null);
  const [dismissedMentionKey, setDismissedMentionKey] = useState<string | null>(
    null,
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const mentionContext = getMentionContext(value, cursor);
  const query = mentionContext?.query ?? "";
  const mentionKey = mentionContext
    ? `${mentionContext.start}:${mentionContext.end}:${query}`
    : null;
  const { data: suggestions = [], isLoading: isFetching } = useMentionUsers(query);
  const isOpen =
    mentionKey !== null &&
    dismissedMentionKey !== mentionKey &&
    (isFetching || suggestions.length > 0);
  const highlightedIndex =
    activeIndex < suggestions.length ? activeIndex : 0;

  const activeRef = multiline ? textareaRef : inputRef;

  const handleSelect = (username: string) => {
    if (!mentionContext) return;
    const next = applyMention(value, mentionContext, username);
    onValueChange(next.value);
    setDismissedMentionKey(null);
    setActiveIndex(0);
    requestAnimationFrame(() => {
      const node = activeRef.current;
      if (node) {
        node.focus();
        node.setSelectionRange(next.cursor, next.cursor);
      }
    });
  };

  return (
    <div className={cn("relative", containerClassName)}>
      {multiline ? (
        <Textarea
          ref={textareaRef}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
          onChange={(e) => {
            setCursor(e.target.selectionStart);
            setDismissedMentionKey(null);
            setActiveIndex(0);
            onValueChange(e.target.value);
          }}
          onClick={(e) => {
            setCursor(e.currentTarget.selectionStart);
          }}
          onKeyUp={(e) => {
            setCursor(e.currentTarget.selectionStart);
          }}
          onKeyDown={(e) => {
            if (!isOpen || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev === 0 ? suggestions.length - 1 : prev - 1,
              );
            } else if (e.key === "Enter") {
              const selected = suggestions[highlightedIndex];
              if (selected?.username) {
                e.preventDefault();
                handleSelect(selected.username);
              }
            } else if (e.key === "Escape") {
              e.preventDefault();
              setDismissedMentionKey(mentionKey);
            }
          }}
          onBlur={() => {
            const nextDismissedKey = mentionKey;
            setTimeout(() => setDismissedMentionKey(nextDismissedKey), 100);
          }}
        />
      ) : (
        <Input
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
          onChange={(e) => {
            setCursor(e.target.selectionStart);
            setDismissedMentionKey(null);
            setActiveIndex(0);
            onValueChange(e.target.value);
          }}
          onClick={(e) => {
            setCursor(e.currentTarget.selectionStart);
          }}
          onKeyUp={(e) => {
            setCursor(e.currentTarget.selectionStart);
          }}
          onKeyDown={(e) => {
            if (!isOpen || suggestions.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((prev) => (prev + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((prev) =>
                prev === 0 ? suggestions.length - 1 : prev - 1,
              );
            } else if (e.key === "Enter") {
              const selected = suggestions[highlightedIndex];
              if (selected?.username) {
                e.preventDefault();
                handleSelect(selected.username);
              }
            } else if (e.key === "Escape") {
              e.preventDefault();
              setDismissedMentionKey(mentionKey);
            }
          }}
          onBlur={() => {
            const nextDismissedKey = mentionKey;
            setTimeout(() => setDismissedMentionKey(nextDismissedKey), 100);
          }}
        />
      )}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {isFetching && suggestions.length === 0 ? (
            <div className="px-3 py-2 text-xs text-neutral-500">
              Searching...
            </div>
          ) : (
            suggestions.map((user, index) => (
              <button
                type="button"
                key={user.username}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  index === highlightedIndex &&
                    "bg-neutral-100 dark:bg-neutral-800",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(user.username)}
              >
                <UserAvatar
                  src={user.avatar}
                  name={user.username}
                  className="size-6"
                />
                <div className="min-w-0">
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 truncate">
                    {user.username}
                  </p>
                  {user.bio && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                      {user.bio}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
