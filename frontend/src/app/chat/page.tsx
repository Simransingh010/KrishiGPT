"use client";

import { ChatProvider } from "@/context/ChatContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Header from "@/components/Header";
import ConversationList from "@/components/ConversationList";
import KrishiChatWindow from "@/components/KrishiChatWindow";

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatProvider>
        <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <ConversationList />
            <KrishiChatWindow />
          </div>
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}
