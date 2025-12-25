"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAuthContext } from "./AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
  lastMessage?: string;
  lastMessageRole?: string;
  messageCount: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  tokensUsed?: number;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  userId: string;
  loadConversations: () => Promise<void>;
  createConversation: (title?: string) => Promise<Conversation | null>;
  loadConversation: (conversationId: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  sendMessage: (content: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  updateConversationTitle: (conversationId: string, title: string) => Promise<void>;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { userId: authUserId } = useAuthContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use authenticated user ID or empty string
  const userId = authUserId || "";

  const loadConversations = useCallback(async () => {
    console.log("[ChatContext] Loading conversations...", { API_BASE_URL, userId });
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/conversations/user/${userId}`;
      console.log("[ChatContext] Fetching:", url);
      const res = await fetch(url);
      console.log("[ChatContext] Response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[ChatContext] Load conversations failed:", res.status, errorText);
        throw new Error(`Failed to load conversations: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      console.log("[ChatContext] Loaded conversations:", data.length);
      setConversations(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load conversations";
      console.error("[ChatContext] Error loading conversations:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const createConversation = useCallback(async (title?: string): Promise<Conversation | null> => {
    console.log("[ChatContext] Creating conversation...", { API_BASE_URL, userId, title });
    try {
      setLoading(true);
      const url = `${API_BASE_URL}/api/conversations`;
      const body = JSON.stringify({ userId, title });
      console.log("[ChatContext] POST:", url, body);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      console.log("[ChatContext] Response status:", res.status);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[ChatContext] Create conversation failed:", res.status, errorText);
        throw new Error(`Failed to create conversation: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      console.log("[ChatContext] Created conversation:", data);

      const newConv: Conversation = {
        id: data.id,
        title: data.title,
        createdAt: data.createdAt,
        messageCount: 0,
      };
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create conversation";
      console.error("[ChatContext] Error creating conversation:", err);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`);
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json();
      setMessages(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load messages";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conversation: Conversation) => {
    setCurrentConversation(conversation);
    loadConversation(conversation.id);
  }, [loadConversation]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) {
      setError("No conversation selected");
      return;
    }

    try {
      setLoading(true);

      // Optimistic update - add user message immediately
      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          userMessage: content,
          userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();

      // Update with real IDs and add AI response
      setMessages((prev) => {
        const updated = prev.filter((m) => m.id !== tempUserMsg.id);
        return [
          ...updated,
          {
            id: data.userMessageId,
            role: "user",
            content,
            createdAt: data.timestamp,
          },
          {
            id: data.aiMessageId,
            role: "assistant",
            content: data.aiResponse,
            createdAt: data.timestamp,
            tokensUsed: data.tokensUsed,
          },
        ];
      });

      // Update conversation in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversation.id
            ? { ...c, lastMessage: data.aiResponse.slice(0, 100), messageCount: c.messageCount + 2 }
            : c
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      setError(message);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
    } finally {
      setLoading(false);
    }
  }, [currentConversation, userId]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to delete conversation");

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete conversation";
      setError(message);
    }
  }, [currentConversation, userId]);

  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, userId }),
      });
      if (!res.ok) throw new Error("Failed to update title");

      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
      );
      if (currentConversation?.id === conversationId) {
        setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update title";
      setError(message);
    }
  }, [currentConversation, userId]);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        loading,
        error,
        userId,
        loadConversations,
        createConversation,
        loadConversation,
        selectConversation,
        sendMessage,
        deleteConversation,
        updateConversationTitle,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
