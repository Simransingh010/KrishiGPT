"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  change: number;
  changePercent: number;
  trend: number[];
}

interface PriceListProps {
  items: PriceItem[];
  title?: string;
}

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 20;
  const width = 48;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? "#10B981" : "#EF4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-60"
      />
    </svg>
  );
}

export function PriceList({ items, title = "MSP Prices" }: PriceListProps) {
  return (
    <section className="py-6">
      {title && (
        <div className="px-4 sm:px-6 lg:px-8 mb-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {title}
          </h2>
        </div>
      )}
      
      <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
        {items.map((item, index) => {
          const isPositive = item.change >= 0;
          const isNeutral = item.change === 0;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
            >
              {/* Left: Icon & Name */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {item.name}
                </span>
              </div>

              {/* Center: Sparkline (hidden on mobile) */}
              <div className="hidden sm:block mx-4">
                <MiniSparkline data={item.trend} isPositive={isPositive} />
              </div>

              {/* Right: Price & Change */}
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
                
                <div className={cn(
                  "flex items-center gap-1 min-w-[70px] justify-end",
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400",
                  isNeutral && "text-slate-400 dark:text-slate-500"
                )}>
                  {isNeutral ? (
                    <Minus className="w-3.5 h-3.5" />
                  ) : isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span className="text-sm font-bold tabular-nums">
                    {isPositive && !isNeutral ? "+" : ""}{item.changePercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export default PriceList;

