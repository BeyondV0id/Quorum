import { useState } from "react";
import {
  useCreateQuestion,
  useDeleteQuestion,
  useQuestionsQuery,
} from "@/hooks/use-questions";
import { Link } from "react-router";
import { PixelHeading } from "@/components/ui/pixel-heading-word";
import { MentionField } from "@/components/ui/mention-field";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QuestionList } from "@/components/questions/question-list";
import { QuestionListSkeleton } from "@/components/questions/question-skeleton";
import {
  Add01Icon,
  Time02Icon,
  FireIcon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { useListSpaces } from "@/hooks/use-space";
import { SpaceCard } from "@/components/spaces/space-list";
import { SPACE_COLORS } from "@/components/spaces/consts";

import { PageTransition } from "@/components/page-transition";
import { validateMentions } from "@/lib/mention-validation";
import { toast } from "@/lib/toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"recent" | "trending">("recent");
  const [selectedSpace, setSelectedSpace] = useState<string>("");
  const [content, setContent] = useState("");
  const { mutate: submitQuestion, isPending: isCreatePending } =
    useCreateQuestion();
  const [isValidating, setIsValidating] = useState(false);
  const { mutate: deleteQuestion } = useDeleteQuestion();
  const { data: chambersData, isLoading } = useListSpaces();
  const spaces = chambersData || [];
  const JOINED_SPACES = spaces.filter((c) => c.isJoined);
  const { data: questionsData, isLoading: isQuestionsLoading } =
    useQuestionsQuery(
      activeTab === "trending" ? "votes" : "time_created",
      "joined",
    );
  const questions = questionsData || [];
  const selectedSpaceData = JOINED_SPACES.find(
    (c) => c.uid === selectedSpace,
  );
  const handleSubmit = async () => {
    if (
      !content.trim() ||
      !selectedSpace ||
      isCreatePending ||
      isValidating
    )
      return;
    setIsValidating(true);
    try {
      const result = await validateMentions(content);
      if (result.missing.length > 0) {
        toast.error(`User not found: ${result.missing.join(", ")}`);
        setIsValidating(false);
        return;
      }
      submitQuestion(
        { content, chamberUid: selectedSpace },
        {
          onSuccess: () => {
            setContent("");
            setSelectedSpace("");
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
  return (
    <PageTransition className="max-w-[40rem] w-full md:mt-24 mt-16 space-y-4 mb-40 relative px-4 pb-20 md:pb-0">
      <PixelHeading
        as="h1"
        className="text-3xl text-foreground py-0 my-0"
      >
        Quorum
      </PixelHeading>
      <p className="font-pixel-square text-sm text-muted-foreground">An Open QnA platform</p>
      <div className="space-y-3">
        <div
          className="
            border border-dashed
            border-neutral-300 dark:border-neutral-700
            bg-background rounded-2xl
            transition-colors
            focus-within:border-neutral-400
            dark:focus-within:border-neutral-500
            overflow-visible
          "
        >
          <MentionField
            placeholder={
              selectedSpaceData
                ? `Ask in ${selectedSpaceData.name}...`
                : "Select a space to ask a question..."
            }
            ariaLabel="Question content"
            className="resize-none h-20 border-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-3 text-base"
            value={content}
            onValueChange={setContent}
            multiline
          />
          <div className="flex items-center justify-between p-2 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800">
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
                    <HugeiconsIcon
                      icon={ArrowDown01Icon}
                      className="size-3.5 text-neutral-500"
                    />
                    Select Space
                  </>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {JOINED_SPACES.length > 0 ? (
                  JOINED_SPACES.map((space, i) => (
                    <DropdownMenuItem
                      key={space.uid || i}
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
              size="sm"
              className="font-normal rounded-lg h-8 px-4"
              onClick={handleSubmit}
              disabled={
                !selectedSpace ||
                !content.trim() ||
                isValidating ||
                isCreatePending
              }
            >
              Ask
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="ml-1.5 size-3.5"
              />
            </Button>
          </div>
        </div>
      </div>
      <div className="my-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            From your spaces
          </h3>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("recent")}
              className={cn(
                "h-7 rounded-full text-xs px-3 transition-all gap-1.5",
                activeTab === "recent"
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
              )}
            >
              <HugeiconsIcon
                icon={Time02Icon}
                className="size-3.5"
                strokeWidth={2}
              />
              Recent
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("trending")}
              className={cn(
                "h-7 rounded-full text-xs px-3 transition-all gap-1.5",
                activeTab === "trending"
                  ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
              )}
            >
              <HugeiconsIcon
                icon={FireIcon}
                className="size-3.5"
                strokeWidth={2}
              />
              Trending
            </Button>
          </div>
        </div>
        {JOINED_SPACES.length === 0 && !isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
                You haven't joined any spaces yet.
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Join some spaces to see questions in your feed.
              </p>
            </div>
            {spaces.filter((c) => !c.isJoined).length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                  Suggested Spaces
                </h4>
                <div className="space-y-2">
                  {spaces
                    .filter((c) => !c.isJoined)
                    .slice(0, 4)
                    .map((space, i) => (
                      <SpaceCard
                        key={space.uid || i}
                        space={{
                          ...space,
                          colorIndex: space.colorIndex ?? i,
                        }}
                      />
                    ))}
                </div>
                <Link
                  to="/spaces"
                  className="block text-center text-sm text-primary hover:underline pt-2"
                >
                  Show All Spaces
                </Link>
              </div>
            )}
          </div>
        ) : isQuestionsLoading ? (
          <QuestionListSkeleton count={3} />
        ) : questions.length > 0 ? (
          <QuestionList
            questions={questions}
            onDelete={(id) => deleteQuestion(id)}
            showChamberName
          />
        ) : (
          <div className="text-center py-12 text-neutral-500">
            <p className="text-sm">No questions in your feed.</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
