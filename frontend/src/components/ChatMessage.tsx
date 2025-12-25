"use client";

import { ChatMessage as ChatMessageType } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
    message: ChatMessageType;
}

export function UserMessage({ message }: ChatMessageProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <span className="text-sm">👤</span>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">You</p>
                <p className="text-gray-800 dark:text-gray-100 text-[15px] leading-relaxed">
                    {message.question}
                </p>
            </div>
        </div>
    );
}

export function AIMessage({ message }: ChatMessageProps) {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Krishi AI</p>
                <div className="text-gray-700 dark:text-gray-200 text-[15px] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }) => (
                                <p className="mb-3 last:mb-0 text-gray-700 dark:text-gray-200">{children}</p>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-gray-800 dark:text-gray-100">{children}</strong>
                            ),
                            em: ({ children }) => (
                                <em className="italic text-gray-600 dark:text-gray-400">{children}</em>
                            ),
                            code: ({ children, className }: unknown) => {
                                const isInline = !className;
                                if (isInline) {
                                    return (
                                        <code className="bg-gray-100 dark:bg-slate-700 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded text-sm font-mono">
                                            {children}
                                        </code>
                                    );
                                }
                                return (
                                    <code className="block bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg text-sm font-mono border border-gray-200 dark:border-slate-700 overflow-x-auto my-2">
                                        {children}
                                    </code>
                                );
                            },
                            ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-200">{children}</ul>
                            ),
                            ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-200">{children}</ol>
                            ),
                            li: ({ children }) => (
                                <li className="text-gray-700 dark:text-gray-200">{children}</li>
                            ),
                            h1: ({ children }) => (
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-4 first:mt-0">{children}</h1>
                            ),
                            h2: ({ children }) => (
                                <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-2 mt-3 first:mt-0">{children}</h2>
                            ),
                            h3: ({ children }) => (
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 mt-2 first:mt-0">{children}</h3>
                            ),
                            blockquote: ({ children }) => (
                                <blockquote className="border-l-3 border-green-400 pl-3 py-1 my-2 text-gray-600 dark:text-gray-400 italic">
                                    {children}
                                </blockquote>
                            ),
                            a: ({ href, children }) => (
                                <a href={href} className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline" target="_blank" rel="noopener noreferrer">
                                    {children}
                                </a>
                            ),
                        }}
                    >
                        {message.answer}
                    </ReactMarkdown>
                    {message.isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-green-500 ml-0.5 animate-pulse" />
                    )}
                </div>

                {/* Action buttons */}
                {!message.isStreaming && message.answer && (
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-slate-700">
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                        </button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                        </button>
                        <div className="flex-1" />
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export function LoadingMessage() {
    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
            </div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Krishi AI</p>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
            </div>
        </div>
    );
}
