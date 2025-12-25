import { useState, useRef, useCallback } from "react";
import { ChatMessage } from "@/types/chat";
import { ApiService } from "@/services/api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const askQuestion = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setIsLoading(true);
    setError(null);

    const newMessage: ChatMessage = {
      question: userQuestion,
      answer: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, newMessage]);
    abortControllerRef.current = new AbortController();

    let accumulatedAnswer = "";

    try {
      await ApiService.askQuestion(
        userQuestion,
        abortControllerRef.current.signal,
        (chunk) => {
          accumulatedAnswer += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg?.isStreaming) {
              updated[updated.length - 1] = { ...lastMsg, answer: accumulatedAnswer };
            }
            return updated;
          });
        },
        (fullText) => {
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg?.isStreaming) {
              updated[updated.length - 1] = {
                ...lastMsg,
                isStreaming: false,
                answer: fullText,
              };
            }
            return updated;
          });
          setIsLoading(false);
        },
        (errorMessage) => {
          setError(errorMessage);
          setMessages((prev) => {
            const updated = [...prev];
            const lastMsg = updated[updated.length - 1];
            if (lastMsg?.isStreaming) {
              updated[updated.length - 1] = {
                ...lastMsg,
                isStreaming: false,
                answer: `Error: ${errorMessage}`,
              };
            }
            return updated;
          });
          setIsLoading(false);
        }
      );
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === "AbortError") {
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setError(error.message || "Something went wrong. Please try again.");
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          if (lastMsg?.isStreaming) {
            updated[updated.length - 1] = {
              ...lastMsg,
              isStreaming: false,
              answer: `Error: ${error.message || "Failed to get response"}`,
            };
          }
          return updated;
        });
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    askQuestion,
    clearError,
  };
}

