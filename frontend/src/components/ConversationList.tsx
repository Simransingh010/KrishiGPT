"use client";

import { useEffect, useState } from "react";
import { useChatContext, Conversation } from "@/context/ChatContext";
import { formatTimeAgo } from "@/lib/utils";
import { ConversationSkeleton } from "./Loading";

function ConversationItem({ conversation, isActive, onSelect, onDelete }: {
    conversation: Conversation;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    const [showDelete, setShowDelete] = useState(false);

    return (
        <div
            className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${isActive
                ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                : "hover:bg-gray-50 dark:hover:bg-slate-800"
                }`}
            onClick={onSelect}
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${isActive
                        ? "text-green-700 dark:text-green-400"
                        : "text-gray-800 dark:text-gray-200"
                        }`}>
                        {conversation.title}
                    </h3>
                    {conversation.lastMessage && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {conversation.lastMessage}
                        </p>
                    )}
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                    {formatTimeAgo(conversation.createdAt)}
                </span>
            </div>

            {showDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    aria-label="Delete conversation"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            )}
        </div>
    );
}

export default function ConversationList() {
    const {
        conversations,
        currentConversation,
        loading,
        loadConversations,
        createConversation,
        selectConversation,
        deleteConversation,
    } = useChatContext();

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return (
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-slate-800">
                <button
                    onClick={() => createConversation()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Conversation
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {loading && conversations.length === 0 ? (
                    <div className="space-y-1">
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                        <ConversationSkeleton />
                    </div>
                ) : conversations.length === 0 ? (
                    <EmptyConversations />
                ) : (
                    <div className="space-y-1">
                        {conversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={currentConversation?.id === conv.id}
                                onSelect={() => selectConversation(conv)}
                                onDelete={() => deleteConversation(conv.id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}

function EmptyConversations() {
    return (
        <div className="text-center py-8 px-4">
            <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Start a new conversation to begin</p>
        </div>
    );
}
