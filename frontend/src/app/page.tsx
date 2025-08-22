"use client";

import { useState } from "react";

interface ChatMessage {
  question: string;
  answer: string;
  source: string;
  timestamp: Date;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  const askQuestion = async () => {
    if (!question.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      const newMessage: ChatMessage = {
        question: question.trim(),
        answer: data.answer,
        source: data.source,
        timestamp: new Date(),
      };

      setChatHistory((prev: ChatMessage[]) => [newMessage, ...prev]);
      setQuestion("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            🌾 KrishiGPT
          </h1>
          <p className="text-lg text-green-600">
            AI Assistant for Farmers - Ask farming questions and get instant AI tips
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          {/* Input Section */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a farming question... (e.g., How to improve wheat yield?)"
                className="w-full p-4 border-2 border-green-200 rounded-xl resize-none focus:border-green-500 focus:outline-none transition-colors"
                rows={3}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={askQuestion}
              disabled={isLoading || !question.trim()}
              className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Thinking...
                </>
              ) : (
                "Ask 🌱"
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          {/* Chat History */}
          <div className="space-y-4">
            {chatHistory.map((message, index) => (
              <div key={index} className="space-y-3">
                {/* Question */}
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      👤
                    </div>
                    <div className="flex-1">
                      <p className="text-blue-900 font-medium">Your Question</p>
                      <p className="text-blue-800">{message.question}</p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      🌾
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-green-900 font-medium">KrishiGPT</p>
                        <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                          {message.source}
                        </span>
                      </div>
                      <p className="text-green-800 leading-relaxed">{message.answer}</p>
                      <p className="text-xs text-green-600 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {chatHistory.length === 0 && !isLoading && (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🌱</div>
                <p className="text-lg mb-2">Ready to help with farming questions!</p>
                <p className="text-sm">Ask about crops, soil, irrigation, pest management, and more.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-green-600">
          <p>Powered by Google Gemini AI • Built for farmers worldwide</p>
        </div>
      </div>
    </div>
  );
}
