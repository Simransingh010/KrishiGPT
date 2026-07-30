"use client";

import { ChatProvider } from "@/context/ChatContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/Header";
import ConversationList from "@/components/ConversationList";
import KrishiChatWindow from "@/components/KrishiChatWindow";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q");
  const topic = searchParams.get("topic");

  // Store initial question in sessionStorage for the chat to pick up
  useEffect(() => {
    if (initialQuestion) {
      sessionStorage.setItem("pendingQuestion", initialQuestion);
    } else if (topic) {
      const topicQuestions: Record<string, string> = {
        weather: "What's the weather forecast for the next 7 days?",
        msp: "What are the current MSP rates for major crops?",
        crops: "Tell me about the best crops to grow this season",
      };
      sessionStorage.setItem("pendingQuestion", topicQuestions[topic] || "");
    }
  }, [initialQuestion, topic]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <ConversationList />
        <KrishiChatWindow />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatProvider>
        <Suspense
          fallback={
            <div className="h-screen flex items-center justify-center">
              Loading...
            </div>
          }
        >
          <ChatPageContent />
        </Suspense>
      </ChatProvider>
    </AuthGuard>
  );
}
