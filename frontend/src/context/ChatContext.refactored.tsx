"use client";

/**
 * Chat Context - Refactored
 * Rule 7: Status FSM instead of boolean explosion
 * Rule 8: useReducer for state transitions
 * Rule 5: Context for global cross-app state only
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import { useAuthContext } from "./AuthContext";
import { API_ENDPOINTS } from "@/lib/constants";
import type { Conversation, Message, RequestStatus } from "@/types/api";

// State shape with FSM status
interface ChatState {
    status: RequestStatus;
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Message[];
    error: string | null;
    // Separate status for message sending (can be loading while conversations are loaded)
    sendStatus: RequestStatus;
}

// Action types
type ChatAction =
    | { type: "SET_STATUS"; payload: RequestStatus }
    | { type: "SET_SEND_STATUS"; payload: RequestStatus }
    | { type: "SET_CONVERSATIONS"; payload: Conversation[] }
    | { type: "ADD_CONVERSATION"; payload: Conversation }
    | { type: "UPDATE_CONVERSATION"; payload: { id: string; updates: Partial<Conversation> } }
    | { type: "REMOVE_CONVERSATION"; payload: string }
    | { type: "SET_CURRENT_CONVERSATION"; payload: Conversation | null }
    | { type: "SET_MESSAGES"; payload: Message[] }
    | { type: "ADD_MESSAGE"; payload: Message }
    | { type: "UPDATE_MESSAGE"; payload: { id: string; updates: Partial<Message> } }
    | { type: "REMOVE_TEMP_MESSAGES" }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "CLEAR_CHAT" };

// Reducer
function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "SET_STATUS":
            return { ...state, status: action.payload, error: action.payload === "loading" ? null : state.error };

        case "SET_SEND_STATUS":
            return { ...state, sendStatus: action.payload };

        case "SET_CONVERSATIONS":
            return { ...state, conversations: action.payload, status: "success" };

        case "ADD_CONVERSATION":
            return {
                ...state,
                conversations: [action.payload, ...state.conversations],
                currentConversation: action.payload,
                messages: []
            };

        case "UPDATE_CONVERSATION":
            return {
                ...state,
                conversations: state.conversations.map(c =>
                    c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
                ),
                currentConversation: state.currentConversation?.id === action.payload.id
                    ? { ...state.currentConversation, ...action.payload.updates }
                    : state.currentConversation
            };

        case "REMOVE_CONVERSATION":
            return {
                ...state,
                conversations: state.conversations.filter(c => c.id !== action.payload),
                currentConversation: state.currentConversation?.id === action.payload
                    ? null
                    : state.currentConversation,
                messages: state.currentConversation?.id === action.payload ? [] : state.messages
            };

        case "SET_CURRENT_CONVERSATION":
            return { ...state, currentConversation: action.payload };

        case "SET_MESSAGES":
            return { ...state, messages: action.payload };

        case "ADD_MESSAGE":
            return { ...state, messages: [...state.messages, action.payload] };

        case "UPDATE_MESSAGE":
            return {
                ...state,
                messages: state.messages.map(m =>
                    m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
                )
            };

        case "REMOVE_TEMP_MESSAGES":
            return { ...state, messages: state.messages.filter(m => !m.id.startsWith("temp-")) };

        case "SET_ERROR":
            return { ...state, error: action.payload, status: action.payload ? "error" : state.status };

        case "CLEAR_CHAT":
            return { ...state, currentConversation: null, messages: [] };

        default:
            return state;
    }
}

// Initial state
const initialState: ChatState = {
    status: "idle",
    sendStatus: "idle",
    conversations: [],
    currentConversation: null,
    messages: [],
    error: null,
};

// Context type
interface ChatContextType {
    // State
    state: ChatState;
    // Derived (Rule 2: computed, not stored)
    isLoading: boolean;
    isSending: boolean;
    userId: string;
    // Actions
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
    const [state, dispatch] = useReducer(chatReducer, initialState);

    const userId = authUserId || "";

    // Derived state (Rule 2)
    const isLoading = state.status === "loading";
    const isSending = state.sendStatus === "loading";

    const loadConversations = useCallback(async () => {
        if (!userId) return;

        dispatch({ type: "SET_STATUS", payload: "loading" });

        try {
            const res = await fetch(API_ENDPOINTS.USER_CONVERSATIONS(userId));
            if (!res.ok) {
                throw new Error(`Failed to load conversations: ${res.status}`);
            }
            const data = await res.json();
            dispatch({ type: "SET_CONVERSATIONS", payload: data });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load conversations";
            dispatch({ type: "SET_ERROR", payload: message });
        }
    }, [userId]);

    const createConversation = useCallback(async (title?: string): Promise<Conversation | null> => {
        if (!userId) return null;

        dispatch({ type: "SET_STATUS", payload: "loading" });

        try {
            const res = await fetch(API_ENDPOINTS.CONVERSATIONS, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, title }),
            });

            if (!res.ok) {
                throw new Error(`Failed to create conversation: ${res.status}`);
            }

            const data = await res.json();
            const newConv: Conversation = {
                id: data.id,
                title: data.title,
                createdAt: data.createdAt,
                messageCount: 0,
            };

            dispatch({ type: "ADD_CONVERSATION", payload: newConv });
            dispatch({ type: "SET_STATUS", payload: "success" });
            return newConv;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create conversation";
            dispatch({ type: "SET_ERROR", payload: message });
            return null;
        }
    }, [userId]);

    const loadConversation = useCallback(async (conversationId: string) => {
        dispatch({ type: "SET_STATUS", payload: "loading" });

        try {
            const res = await fetch(API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();
            dispatch({ type: "SET_MESSAGES", payload: data });
            dispatch({ type: "SET_STATUS", payload: "success" });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load messages";
            dispatch({ type: "SET_ERROR", payload: message });
        }
    }, []);

    const selectConversation = useCallback((conversation: Conversation) => {
        dispatch({ type: "SET_CURRENT_CONVERSATION", payload: conversation });
        loadConversation(conversation.id);
    }, [loadConversation]);

    const sendMessage = useCallback(async (content: string) => {
        if (!state.currentConversation || !userId) {
            dispatch({ type: "SET_ERROR", payload: "No conversation selected" });
            return;
        }

        dispatch({ type: "SET_SEND_STATUS", payload: "loading" });

        // Optimistic update
        const tempUserMsg: Message = {
            id: `temp-${Date.now()}`,
            role: "user",
            content,
            createdAt: new Date().toISOString(),
        };
        dispatch({ type: "ADD_MESSAGE", payload: tempUserMsg });

        try {
            const res = await fetch(API_ENDPOINTS.SEND_MESSAGE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: state.currentConversation.id,
                    userMessage: content,
                    userId,
                }),
            });

            if (!res.ok) throw new Error("Failed to send message");
            const data = await res.json();

            // Remove temp and add real messages
            dispatch({ type: "REMOVE_TEMP_MESSAGES" });
            dispatch({
                type: "ADD_MESSAGE",
                payload: {
                    id: data.userMessageId,
                    role: "user",
                    content,
                    createdAt: data.timestamp,
                },
            });
            dispatch({
                type: "ADD_MESSAGE",
                payload: {
                    id: data.aiMessageId,
                    role: "assistant",
                    content: data.aiResponse,
                    createdAt: data.timestamp,
                    tokensUsed: data.tokensUsed,
                },
            });

            // Update conversation preview
            dispatch({
                type: "UPDATE_CONVERSATION",
                payload: {
                    id: state.currentConversation.id,
                    updates: {
                        lastMessage: data.aiResponse.slice(0, 100),
                        messageCount: state.currentConversation.messageCount + 2,
                    },
                },
            });

            dispatch({ type: "SET_SEND_STATUS", payload: "success" });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send message";
            dispatch({ type: "SET_ERROR", payload: message });
            dispatch({ type: "REMOVE_TEMP_MESSAGES" });
            dispatch({ type: "SET_SEND_STATUS", payload: "error" });
        }
    }, [state.currentConversation, userId]);

    const deleteConversation = useCallback(async (conversationId: string) => {
        try {
            const res = await fetch(API_ENDPOINTS.CONVERSATION(conversationId), {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (!res.ok) throw new Error("Failed to delete conversation");
            dispatch({ type: "REMOVE_CONVERSATION", payload: conversationId });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete conversation";
            dispatch({ type: "SET_ERROR", payload: message });
        }
    }, [userId]);

    const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
        try {
            const res = await fetch(API_ENDPOINTS.CONVERSATION(conversationId), {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, userId }),
            });
            if (!res.ok) throw new Error("Failed to update title");
            dispatch({
                type: "UPDATE_CONVERSATION",
                payload: { id: conversationId, updates: { title } },
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update title";
            dispatch({ type: "SET_ERROR", payload: message });
        }
    }, [userId]);

    const clearError = useCallback(() => {
        dispatch({ type: "SET_ERROR", payload: null });
    }, []);

    return (
        <ChatContext.Provider
            value={{
                state,
                isLoading,
                isSending,
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

// Convenience selectors (derived state)
export function useChatState() {
    const { state } = useChatContext();
    return state;
}

export function useConversations() {
    const { state } = useChatContext();
    return state.conversations;
}

export function useCurrentConversation() {
    const { state } = useChatContext();
    return state.currentConversation;
}

export function useMessages() {
    const { state } = useChatContext();
    return state.messages;
}
