import React, { createContext, useContext, useState, useCallback } from "react";
import type { QuestionItem } from "@/types";

interface StoreContextType {
  questions: Record<string, QuestionItem>;
  replies: Record<string, any[]>;
  setQuestionsList: (list: QuestionItem[]) => void;
  updateQuestion: (id: string, patch: Partial<QuestionItem["question"]>) => void;
  setRepliesList: (qid: string, list: any[]) => void;
  updateReply: (qid: string, rid: string, patch: any) => void;
  triggerRefresh: (key: string) => void;
  getRefreshCount: (key: string) => number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Record<string, QuestionItem>>({});
  const [replies, setReplies] = useState<Record<string, any[]>>({});
  const [refreshStates, setRefreshStates] = useState<Record<string, number>>({});

  const setQuestionsList = useCallback((list: QuestionItem[]) => {
    setQuestions(prev => {
      const next = { ...prev };
      list.forEach(item => {
        next[item.question.uid] = item;
      });
      return next;
    });
  }, []);

  const updateQuestion = useCallback((id: string, patch: Partial<QuestionItem["question"]>) => {
    setQuestions(prev => {
      if (!prev[id]) return prev;
      return {
        ...prev,
        [id]: {
          ...prev[id],
          question: { ...prev[id].question, ...patch }
        }
      };
    });
  }, []);

  const setRepliesList = useCallback((qid: string, list: any[]) => {
    setReplies(prev => ({ ...prev, [qid]: list }));
  }, []);

  const updateReply = useCallback((qid: string, rid: string, patch: any) => {
      setReplies(prev => {
          const list = prev[qid];
          if (!list) return prev;
          return {
              ...prev,
              [qid]: list.map(r => r.answer.uid === rid ? { ...r, answer: { ...r.answer, ...patch } } : r)
          };
      });
  }, []);

  const triggerRefresh = useCallback((key: string) => {
    setRefreshStates((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }));
  }, []);

  const getRefreshCount = useCallback((key: string) => {
    return refreshStates[key] || 0;
  }, [refreshStates]);

  return (
    <StoreContext.Provider value={{ 
        questions, 
        replies, 
        setQuestionsList, 
        updateQuestion, 
        setRepliesList, 
        updateReply,
        triggerRefresh, 
        getRefreshCount 
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
