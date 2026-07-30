"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const sampleQuestions = [
  {
    hi: "गेहूं की फसल में पीला रतुआ रोग का इलाज?",
    en: "Treatment for wheat yellow rust?",
    category: "pest",
  },
  {
    hi: "इस महीने MSP दरें क्या हैं?",
    en: "What are this month's MSP rates?",
    category: "price",
  },
  {
    hi: "बारिश के बाद धान की बुवाई कब करें?",
    en: "When to sow paddy after monsoon?",
    category: "timing",
  },
  {
    hi: "मिट्टी की जांच कैसे करें?",
    en: "How to test soil quality?",
    category: "soil",
  },
  {
    hi: "जैविक खाद बनाने की विधि",
    en: "How to make organic compost?",
    category: "practice",
  },
];

export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleAsk = (q: string) => {
    if (q.trim()) {
      router.push(`/chat?q=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div className="min-h-screen bg-rice-white">
      {/* Header */}
      <header className="border-b border-earth-base/10 bg-rice-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-wheat-gold rounded-sm flex items-center justify-center font-mono text-earth-base text-sm font-bold">
              क
            </div>
            <span className="font-serif text-xl text-earth-base tracking-tight">
              KrishiGPT
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-earth-base/70 hover:text-earth-base transition-colors"
            >
              Login
            </Link>
            <button className="text-sm text-earth-base/70 hover:text-earth-base transition-colors font-medium">
              हिंदी
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Hero */}
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-earth-base leading-[1.1] mb-8">
            Ask your field
            <br />a question
          </h1>

          {/* Search Input */}
          <div className="mb-12">
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAsk(question)}
                placeholder="Type your farming question in Hindi or English..."
                className="w-full px-6 py-4 text-lg bg-white border-2 border-earth-base/20 rounded-none focus:border-wheat-gold focus:outline-none text-earth-base placeholder:text-earth-base/40 transition-colors"
              />
              <button
                onClick={() => handleAsk(question)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-terracotta text-rice-white font-medium hover:bg-terracotta/90 transition-colors"
              >
                Ask
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-earth-base/60">Try:</span>
              {["wheat rust", "MSP prices", "monsoon timing"].map((example) => (
                <button
                  key={example}
                  onClick={() => setQuestion(example)}
                  className="text-sm text-monsoon-sky hover:text-earth-base transition-colors underline underline-offset-2"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Recent Questions */}
          <div className="mb-16">
            <div className="flex items-baseline gap-3 mb-6">
              <div className="text-earth-base text-2xl">↓</div>
              <div>
                <h2 className="font-serif text-2xl text-earth-base">
                  Recent from farmers
                </h2>
                <p className="text-sm text-earth-base/60 mt-1">
                  Live questions answered today
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {sampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q.en)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="w-full text-left p-4 border border-earth-base/10 hover:border-wheat-gold bg-white hover:bg-wheat-gold/5 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-1 h-1 rounded-full bg-leaf-sage mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-earth-base font-medium mb-1 group-hover:text-terracotta transition-colors">
                        {q.hi}
                      </p>
                      <p className="text-earth-base/60 text-sm">{q.en}</p>
                      {hoveredIndex === idx && (
                        <p className="text-xs text-monsoon-sky mt-2 font-mono uppercase tracking-wide">
                          Click to see answer →
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-xs font-mono text-earth-base/40 uppercase">
                      {q.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Utility Bar */}
        <div className="border-t border-earth-base/20 pt-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/chat?topic=weather"
              className="p-6 border border-earth-base/10 hover:border-monsoon-sky bg-white hover:bg-monsoon-sky/5 transition-all group"
            >
              <div className="text-xs font-mono text-earth-base/60 mb-2 uppercase tracking-wide">
                Live Data
              </div>
              <div className="font-serif text-xl text-earth-base mb-1 group-hover:text-monsoon-sky transition-colors">
                Weather
              </div>
              <div className="text-sm text-earth-base/70">
                7-day forecast · Rainfall alerts
              </div>
            </Link>

            <Link
              href="/chat?topic=msp"
              className="p-6 border border-earth-base/10 hover:border-wheat-gold bg-white hover:bg-wheat-gold/5 transition-all group"
            >
              <div className="text-xs font-mono text-earth-base/60 mb-2 uppercase tracking-wide">
                Prices
              </div>
              <div className="font-serif text-xl text-earth-base mb-1 group-hover:text-wheat-gold transition-colors">
                MSP Rates
              </div>
              <div className="text-sm text-earth-base/70">
                Current minimum support prices
              </div>
            </Link>

            <Link
              href="/chat?topic=crops"
              className="p-6 border border-earth-base/10 hover:border-leaf-sage bg-white hover:bg-leaf-sage/5 transition-all group"
            >
              <div className="text-xs font-mono text-earth-base/60 mb-2 uppercase tracking-wide">
                Knowledge
              </div>
              <div className="font-serif text-xl text-earth-base mb-1 group-hover:text-leaf-sage transition-colors">
                Crop Guide
              </div>
              <div className="text-sm text-earth-base/70">
                Varieties · Timing · Best practices
              </div>
            </Link>
          </div>
        </div>

        {/* Footer Context */}
        <div className="mt-16 pt-8 border-t border-earth-base/10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-earth-base/60">
            <p>AI-powered farming advisor for Indian agriculture</p>
            <div className="flex gap-4">
              <Link
                href="/about"
                className="hover:text-earth-base transition-colors"
              >
                About
              </Link>
              <Link
                href="/signup"
                className="hover:text-earth-base transition-colors"
              >
                Sign up free
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
