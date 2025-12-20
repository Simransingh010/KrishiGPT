"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  type: "recommendation" | "alert" | "info";
  text: string;
  priority: "high" | "medium" | "low";
}

interface QuickInsightsCardProps {
  insights: Insight[];
  delay?: number;
  className?: string;
}

function getInsightConfig(type: Insight["type"], priority: Insight["priority"]) {
  const configs = {
    recommendation: {
      dotColor: "bg-emerald-500",
    },
    alert: {
      dotColor: priority === "high" ? "bg-red-500" : "bg-amber-500",
    },
    info: {
      dotColor: "bg-blue-500",
    },
  };

  return configs[type];
}

export function QuickInsightsCard({ insights, delay = 0, className }: QuickInsightsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md border border-slate-200/80 dark:border-slate-700 transition-colors duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quick Insights</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Today's recommendations</p>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const config = getInsightConfig(insight.type, insight.priority);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.2 + index * 0.1 }}
              className="flex items-start gap-3 py-2 border-b border-slate-50 dark:border-slate-700 last:border-0"
            >
              <motion.div
                animate={insight.priority === "high" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", config.dotColor)}
              />
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{insight.text}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default QuickInsightsCard;
