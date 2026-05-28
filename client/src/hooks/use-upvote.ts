import { useState } from "react";
import { updateVotes } from "@/api/questions";
import { updateReplyVotes } from "@/api/replies";
import { useStore } from "@/context/StoreContext";

export function useUpdateVote() {
  const { questions, updateQuestion: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    qid: string,
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    const qItem = questions[qid];
    if (!qItem) return;

    const originalUpvoted = qItem.question.isUpvoted;
    const originalCount = qItem.question.upvotes;

    setIsPending(true);
    
    // OPTIMISTIC UPDATE
    const newUpvoted = !originalUpvoted;
    const newCount = newUpvoted ? originalCount + 1 : Math.max(originalCount - 1, 0);
    
    updateStore(qid, { 
        isUpvoted: newUpvoted, 
        upvotes: newCount 
    });

    try {
      await updateVotes(qid);
      triggerRefresh("questions");
      options?.onSuccess?.();
    } catch (err) {
      updateStore(qid, { 
          isUpvoted: originalUpvoted, 
          upvotes: originalCount 
      });
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}

export function useReplyUpdateVote() {
  const { replies, updateReply: updateStore, triggerRefresh } = useStore();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (
    { qid, rid }: { qid: string; rid: string },
    options?: { onSuccess?: () => void; onSettled?: () => void }
  ) => {
    const rList = replies[qid];
    const rItem = rList?.find(r => r.answer.uid === rid);
    if (!rItem) return;

    const originalUpvoted = rItem.answer.isUpvoted;
    const originalCount = rItem.answer.upvotes;

    setIsPending(true);

    // OPTIMISTIC UPDATE
    const newUpvoted = !originalUpvoted;
    const newCount = newUpvoted ? originalCount + 1 : Math.max(originalCount - 1, 0);

    updateStore(qid, rid, { 
        isUpvoted: newUpvoted, 
        upvotes: newCount 
    });

    try {
      await updateReplyVotes(qid, rid);
      triggerRefresh(`replies:${qid}`);
      options?.onSuccess?.();
    } catch (err) {
      // ROLLBACK
      updateStore(qid, rid, { 
          isUpvoted: originalUpvoted, 
          upvotes: originalCount 
      });
      setError(err as Error);
    } finally {
      setIsPending(false);
      options?.onSettled?.();
    }
  };

  return { mutate, isPending, error };
}
