"use client";

import { useChat } from "@/hooks/useChat";
import Header from "@/components/Header/Header";
import ChatInterface from "@/components/ChatInterface/ChatInterface";

export default function Home() {
  const { messages, isLoading, error, askQuestion } = useChat();

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header />
      <ChatInterface
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={askQuestion}
      />
    </div>
  );
}
