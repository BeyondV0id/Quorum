import type { QuestionItem } from "@/types";
import { QuestionItem as QuestionItemComponent } from "./question-item";
import { Accordion } from "@/components/ui/accordion";
import { DashedEmptyState } from "@/components/ui/dashed-empty-state";
import { HugeiconsIcon } from "@hugeicons/react";
import { BubbleChatIcon } from "@hugeicons/core-free-icons";

type QuestionListProps = {
  questions: QuestionItem[];
  onDelete?: (id: string) => void;
  showSpaceName?: boolean;
  canPin?: boolean;
};

export function QuestionList({ questions, onDelete, showSpaceName, canPin }: QuestionListProps) {
  return questions.length > 0 ? (
    <Accordion className="dark:bg-[#0f1112]">
      {questions.map((questionItem, index) => (
        <QuestionItemComponent
          key={questionItem.question.uid ?? index}
          questionItem={questionItem}
          onDelete={onDelete || (() => { })}
          showSpaceName={showSpaceName}
          canPin={canPin}
        />
      ))}
    </Accordion>
  ) : (
    <DashedEmptyState
      title="No questions yet"
      description="Be the first to ask a question in this space."
      icon={<HugeiconsIcon icon={BubbleChatIcon} className="size-8 opacity-50" />}
    />
  );
}
