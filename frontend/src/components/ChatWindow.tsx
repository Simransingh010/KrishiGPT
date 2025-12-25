"use client";

import { useRef, useEffect, useState } from "react";
import { useChatContext } from "@/context/ChatContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string }) {
    if (role === "user") {
        return (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex-shrink-0 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">You</p>
                    <p className="text-gray-800 text-[15px] leading-relaxed">{content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 mb-2">Krishi AI</p>
                <div className="text-gray-700 text-[15px] leading-relaxed prose prose-sm max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700">{children}</li>,
                            h2: ({ children }) => <h2 className="text-base font-semibold text-gray-800 mb-2 mt-3">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 mb-1 mt-2">{children}</h3>,
                            a: ({ href, children }) => (
                                <a href={href} className="text-green-600 hover:text-green-700 underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}

function LoadingIndicator() {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-2">Krishi AI</p>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}

export default function ChatWindow() {
    const { currentConversation, messages, loading, error, sendMessage, createConversation } = useChatContext();
    const [inputValue, setInputValue] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (!loading) inputRef.current?.focus();
    }, [loading]);

    const handleSubmit = async () => {
        if (!inputValue.trim() || loading) return;
        if (!currentConversation) {
            const conv = await createConversation();
            if (!conv) return;
        }
        const message = inputValue;
        setInputValue("");
        await sendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    if (!currentConversation && messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col bg-[#fafafa]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center px-4">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-2xl">🌾</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Krishi AI</h2>
                        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                            Your intelligent farming assistant. Ask me anything about crops, soil health, pest management, or agricultural best practices.
                        </p>
                        <button
                            onClick={() => createConversation()}
                            className="px-6 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                        >
                            Start New Conversation
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#fafafa] overflow-hidden">
            {currentConversation && (
                <div className="flex-shrink-0 px-6 py-3 bg-white border-b border-gray-200">
                    <h2 className="text-sm font-medium text-gray-800 truncate">{currentConversation.title}</h2>
                </div>
            )}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
                    {messages.map((msg) => (
                        <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
                    ))}
                    {loading && <LoadingIndicator />}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </main>
            <footer className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                        <textarea
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about farming, crops, soil..."
                            className="flex-1 bg-transparent resize-none focus:outline-none text-sm text-gray-800 placeholder-gray-400 py-1"
                            rows={1}
                            disabled={loading}
                            style={{ minHeight: "24px", maxHeight: "120px" }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !inputValue.trim()}
                            className="w-9 h-9 flex items-center justify-center bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                        >
                            {loading ? (
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
