"use client";

import { ChatProvider } from "@/context/ChatContext";
import Header from "@/components/Header/Header";
import ConversationList from "@/components/ConversationList/ConversationList";
import ChatWindow from "@/components/ChatWindow/ChatWindow";

export default function ChatPage() {
  return (
    <ChatProvider>
      <div className="h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex overflow-hidden">
          <ConversationList />
          <ChatWindow />
        </div>
      </div>
    </ChatProvider>
  );
}
