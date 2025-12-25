"use client";

import React, { useRef, useEffect, useState } from "react";
import { useChatContext, Message } from "@/context/ChatContext";
import { useKrishiChat } from "@/hooks/useKrishiChat";
import { KrishiUserMessage, KrishiAIMessage, KrishiLoadingMessage } from "./KrishiMessage";
import type { KrishiMessage } from "@/types/krishi";

export default function KrishiChatWindow() {
    const {
        currentConversation,
        messages: contextMessages,
        loading: contextLoading,
        error: contextError,
        createConversation,
        userId
    } = useChatContext();

    const conversationId = currentConversation?.id || "";

    const {
        messages: krishiMessages,
        status,
        isLoading,
        error: krishiError,
        sendMessage,
        setMessages,
        clearMessages,
    } = useKrishiChat({ conversationId, userId });

    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Sync context messages when conversation changes
    useEffect(() => {
        if (currentConversation?.id) {
            if (contextMessages.length > 0) {
                const converted: KrishiMessage[] = contextMessages.map((m: Message) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    createdAt: m.createdAt,
                }));
                setMessages(converted);
            } else {
                clearMessages();
            }
        }
    }, [currentConversation?.id, contextMessages, setMessages, clearMessages]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, [krishiMessages, status]);

    useEffect(() => {
        if (!isLoading) inputRef.current?.focus();
    }, [isLoading]);

    const handleSubmit = async (value: string) => {
        if (!value.trim() || isLoading) return;

        let convId = conversationId;

        // Create conversation if needed and get the ID
        if (!currentConversation) {
            const conv = await createConversation();
            if (!conv) return;
            convId = conv.id;
        }

        // Send with the correct conversation ID
        await sendMessage(value, convId);
    };

    const displayMessages = krishiMessages.length > 0 ? krishiMessages : contextMessages.map((m: Message) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
    }));
    const displayError = krishiError || contextError;

    if (!currentConversation && displayMessages.length === 0) {
        return <EmptyState onStart={() => createConversation()} error={displayError} />;
    }

    return (
        <div className="flex-1 flex flex-col bg-[#fafafa] dark:bg-slate-950 overflow-hidden">
            {currentConversation && (
                <div className="flex-shrink-0 px-6 py-3 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
                    <h2 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{currentConversation.title}</h2>
                </div>
            )}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                    {displayMessages.map((msg, idx) => (
                        <div key={msg.id || idx}>
                            {msg.role === "user" ? (
                                <KrishiUserMessage message={msg as KrishiMessage} />
                            ) : (
                                <KrishiAIMessage message={msg as KrishiMessage} isStreaming={status === "streaming" && idx === displayMessages.length - 1} />
                            )}
                        </div>
                    ))}
                    {isLoading && displayMessages[displayMessages.length - 1]?.role === "user" && <KrishiLoadingMessage />}
                    {displayError && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                            <p className="text-sm text-red-700 dark:text-red-400">{displayError}</p>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>
            <ChatInputFooter onSubmit={handleSubmit} isLoading={isLoading || contextLoading} inputRef={inputRef} />
        </div>
    );
}

function EmptyState({ onStart, error }: { onStart: () => void; error?: string | null }) {
    return (
        <div className="flex-1 flex flex-col bg-[#fafafa] dark:bg-slate-950">
            <div className="flex-1 flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🌾</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Welcome to KrishiGPT</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">
                        Ask anything about farming - crops, weather, pests, soil. Just type your question!
                    </p>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg max-w-md mx-auto">
                            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                        </div>
                    )}
                    <button onClick={onStart} className="px-6 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors">
                        Start Chat
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChatInputFooter({ onSubmit, isLoading, inputRef }: {
    onSubmit: (value: string) => void;
    isLoading: boolean;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
    const [value, setValue] = useState("");

    const handleSubmit = () => {
        if (value.trim() && !isLoading) {
            onSubmit(value);
            setValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <footer className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-4 py-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-full px-4 py-2 border border-gray-200 dark:border-slate-700">
                    <textarea
                        ref={inputRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about farming, crops, weather..."
                        className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 py-1"
                        rows={1}
                        disabled={isLoading}
                        style={{ minHeight: "24px", maxHeight: "120px" }}
                    />
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !value.trim()}
                        className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </footer>
    );
}
