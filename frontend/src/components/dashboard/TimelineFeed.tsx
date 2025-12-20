"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TimelineItem {
  id: string;
  type: "opportunity" | "weather" | "insight" | "warning" | "harvest";
  title: string;
  message: string;
  time: string;
  actionable?: boolean;
}

interface TimelineFeedProps {
  items: TimelineItem[];
  title?: string;
}

const typeStyles = {
  opportunity: {
    accent: "bg-emerald-500",
    bg: "bg-emerald-50/50 dark:bg-emerald-500/5",
    border: "border-l-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  weather: {
    accent: "bg-blue-500",
    bg: "bg-blue-50/50 dark:bg-blue-500/5",
    border: "border-l-blue-500",
    text: "text-blue-700 dark:text-blue-400",
  },
  insight: {
    accent: "bg-indigo-500",
    bg: "bg-indigo-50/50 dark:bg-indigo-500/5",
    border: "border-l-indigo-500",
    text: "text-indigo-700 dark:text-indigo-400",
  },
  warning: {
    accent: "bg-amber-500",
    bg: "bg-amber-50/50 dark:bg-amber-500/5",
    border: "border-l-amber-500",
    text: "text-amber-700 dark:text-amber-400",
  },
  harvest: {
    accent: "bg-orange-500",
    bg: "bg-orange-50/50 dark:bg-orange-500/5",
    border: "border-l-orange-500",
    text: "text-orange-700 dark:text-orange-400",
  },
};

export function TimelineFeed({ items, title = "Today's Updates" }: TimelineFeedProps) {
  return (
    <section className="py-6">
      {title && (
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {title}
          </h2>
        </div>
      )}

      <div className="space-y-3 px-4 sm:px-6 lg:px-8">
        {items.map((item, index) => {
          const styles = typeStyles[item.type];
          const isFirst = index === 0;
          
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "relative rounded-xl border-l-2 p-4 transition-all",
                styles.border,
                isFirst ? styles.bg : "bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/30",
                item.actionable && "cursor-pointer"
              )}
            >
              {/* Time */}
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1.5">
                {item.time}
              </p>

              {/* Title - Natural Language */}
              <h3 className={cn(
                "text-sm font-bold mb-1.5",
                isFirst ? styles.text : "text-slate-800 dark:text-slate-100"
              )}>
                {item.title}
              </h3>

              {/* Message */}
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {item.message}
              </p>

              {/* Actionable Indicator */}
              {item.actionable && (
                <div className="mt-3">
                  <span className={cn(
                    "text-xs font-bold",
                    styles.text
                  )}>
                    Tap to take action →
                  </span>
                </div>
              )}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}

export default TimelineFeed;

