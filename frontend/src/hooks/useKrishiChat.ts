/**
 * useKrishiChat Hook - Simple chat
 */

import { useRef, useCallback, useReducer } from "react";
import type { KrishiMessage, ConfidenceLevel } from "@/types/krishi";
import { KrishiApiService } from "@/services/krishiApi";

type ChatStatus = "idle" | "streaming" | "error";

interface ChatState {
    status: ChatStatus;
    messages: KrishiMessage[];
    error: string | null;
}

type ChatAction =
    | { type: "START_STREAM" }
    | { type: "ADD_USER_MESSAGE"; payload: { id: string; content: string } }
    | { type: "UPDATE_STREAMING"; payload: string }
    | { type: "COMPLETE_STREAM"; payload: { content: string; confidence?: ConfidenceLevel } }
    | { type: "SET_ERROR"; payload: string }
    | { type: "CLEAR_ERROR" }
    | { type: "SET_MESSAGES"; payload: KrishiMessage[] }
    | { type: "CLEAR_MESSAGES" }
    | { type: "RESET_STATUS" };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "START_STREAM":
            return { ...state, status: "streaming", error: null };

        case "ADD_USER_MESSAGE":
            return {
                ...state,
                messages: [
                    ...state.messages,
                    {
                        id: action.payload.id,
                        role: "user",
                        content: action.payload.content,
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

        case "UPDATE_STREAMING": {
            const messages = [...state.messages];
            const lastMsg = messages[messages.length - 1];

            if (lastMsg?.role === "assistant") {
                messages[messages.length - 1] = { ...lastMsg, content: lastMsg.content + action.payload };
            } else {
                messages.push({
                    id: `ai-${Date.now()}`,
                    role: "assistant",
                    content: action.payload,
                    createdAt: new Date().toISOString(),
                });
            }
            return { ...state, messages };
        }

        case "COMPLETE_STREAM": {
            const messages = [...state.messages];
            const lastMsg = messages[messages.length - 1];
            if (lastMsg?.role === "assistant") {
                messages[messages.length - 1] = {
                    ...lastMsg,
                    content: action.payload.content || lastMsg.content,
                    confidence: action.payload.confidence,
                };
            }
            return { ...state, status: "idle", messages };
        }

        case "SET_ERROR":
            return { ...state, status: "idle", error: action.payload };

        case "CLEAR_ERROR":
            return { ...state, error: null };

        case "SET_MESSAGES":
            return { ...state, messages: action.payload, status: "idle" };

        case "CLEAR_MESSAGES":
            return { ...state, messages: [], status: "idle" };

        case "RESET_STATUS":
            return { ...state, status: "idle" };

        default:
            return state;
    }
}

const initialState: ChatState = {
    status: "idle",
    messages: [],
    error: null,
};

interface UseKrishiChatParams {
    conversationId: string;
    userId: string;
}

export function useKrishiChat({ conversationId, userId }: UseKrishiChatParams) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isStreamingRef = useRef(false);

    const isLoading = state.status === "streaming";

    const sendMessage = useCallback(
        async (content: string, overrideConversationId?: string) => {
            if (!content.trim()) return;

            // Prevent double-send while streaming
            if (isStreamingRef.current) {
                return;
            }

            const targetConvId = overrideConversationId || conversationId;
            if (!targetConvId) {
                dispatch({ type: "SET_ERROR", payload: "No conversation selected" });
                return;
            }

            // Cancel previous request
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            isStreamingRef.current = true;
            dispatch({ type: "START_STREAM" });
            dispatch({ type: "ADD_USER_MESSAGE", payload: { id: `user-${Date.now()}`, content } });

            try {
                await KrishiApiService.sendMessageStream(
                    { conversationId: targetConvId, userMessage: content, userId },
                    (chunk) => dispatch({ type: "UPDATE_STREAMING", payload: chunk }),
                    (result) => {
                        dispatch({
                            type: "COMPLETE_STREAM",
                            payload: { content: result.fullText, confidence: result.confidence as ConfidenceLevel },
                        });
                        isStreamingRef.current = false;
                    },
                    () => {
                        // Form request - just complete the stream
                        dispatch({ type: "RESET_STATUS" });
                        isStreamingRef.current = false;
                    },
                    (error) => {
                        dispatch({ type: "SET_ERROR", payload: error });
                        isStreamingRef.current = false;
                    },
                    abortControllerRef.current.signal
                );
            } catch (err) {
                isStreamingRef.current = false;
                if (err instanceof Error && err.name !== "AbortError") {
                    dispatch({ type: "SET_ERROR", payload: err.message });
                } else {
                    dispatch({ type: "RESET_STATUS" });
                }
            }
        },
        [conversationId, userId]
    );

    const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);
    const setMessages = useCallback((messages: KrishiMessage[]) => dispatch({ type: "SET_MESSAGES", payload: messages }), []);
    const clearMessages = useCallback(() => dispatch({ type: "CLEAR_MESSAGES" }), []);

    return {
        messages: state.messages,
        status: state.status,
        isLoading,
        error: state.error,
        sendMessage,
        clearError,
        setMessages,
        clearMessages,
    };
}
