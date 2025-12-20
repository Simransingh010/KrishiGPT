"use client";

import React, { useRef, useEffect, useState } from "react";
import { ChatMessage } from "@/types/chat";
import { UserMessage, AIMessage, LoadingMessage } from "../ChatMessage/ChatMessage";
import ChatInput from "../ChatInput/ChatInput";

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  inputPlaceholder?: string;
}

export default function ChatInterface({
  messages,
  isLoading,
  error,
  onSendMessage,
  inputPlaceholder,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const handleSubmit = () => {
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#fafafa] dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-6 px-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌾</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                Welcome to Krishi AI
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
                Your intelligent farming assistant. Ask me anything about crops, soil health, pest management, or agricultural best practices.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((message, index) => (
              <div key={`${message.timestamp.getTime()}-${index}`} className="space-y-4">
                <UserMessage message={message} />
                {message.answer ? (
                  <AIMessage message={message} />
                ) : message.isStreaming ? (
                  <LoadingMessage />
                ) : null}
              </div>
            ))}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div ref={chatEndRef} className="h-4" />
        </div>
      </main>

      {/* Input Area */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        placeholder={inputPlaceholder || "Tell me what do you want?"}
        inputRef={inputRef}
      />
    </div>
  );
}
