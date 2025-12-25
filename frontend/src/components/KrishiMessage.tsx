"use client";

import type { KrishiMessage as KrishiMessageType } from "@/types/krishi";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface KrishiMessageProps {
    message: KrishiMessageType;
    isStreaming?: boolean;
}

export function KrishiUserMessage({ message }: KrishiMessageProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex-shrink-0 flex items-center justify-center">
                <span className="text-sm">👤</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">You</p>
                <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed">
                    {message.content}
                </p>
            </div>
        </div>
    );
}

export function KrishiAIMessage({ message, isStreaming = false }: KrishiMessageProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🌾</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KrishiGPT</p>
                <div className="text-gray-700 dark:text-gray-200 text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-200">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-gray-800 dark:text-gray-100">{children}</strong>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="text-gray-700 dark:text-gray-200">{children}</li>,
                            h2: ({ children }) => <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 mt-2 first:mt-0">{children}</h3>,
                        }}
                    >
                        {message.content}
                    </ReactMarkdown>
                    {isStreaming && <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse" />}
                </div>
            </div>
        </div>
    );
}

export function KrishiLoadingMessage() {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <span className="text-lg">🌾</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">KrishiGPT</p>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}
