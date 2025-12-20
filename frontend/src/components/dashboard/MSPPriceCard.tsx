"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MSPData {
  id: string;
  name: string;
  icon: string;
  currentPrice: number;
  previousPrice: number;
  marketPrice: number;
  unit: string;
  trend: number[];
  lastUpdated: string;
}

interface MSPPriceCardProps {
  data: MSPData;
  delay?: number;
  className?: string;
  onClick?: () => void;
}

function SparkLine({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 80;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <motion.polyline
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        points={points}
        fill="none"
        stroke={isPositive ? "#10B981" : "#EF4444"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MSPPriceCard({ data, delay = 0, className, onClick }: MSPPriceCardProps) {
  const priceChange = data.currentPrice - data.previousPrice;
  const percentChange = ((priceChange / data.previousPrice) * 100).toFixed(1);
  const isPositive = priceChange >= 0;
  const profitMargin = data.marketPrice - data.currentPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-200/80 dark:border-slate-700 cursor-pointer hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{data.icon}</span>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{data.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">MSP {data.unit}</p>
          </div>
        </div>
        <SparkLine data={data.trend} isPositive={isPositive} />
      </div>

      {/* Price */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
            className="text-2xl font-bold text-slate-800 dark:text-slate-100"
          >
            ₹{data.currentPrice.toLocaleString("en-IN")}
          </motion.p>
        </div>
        <div className={cn(
          "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
          isPositive 
            ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
            : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {isPositive ? "+" : ""}{percentChange}%
        </div>
      </div>

      {/* Market Price Comparison */}
      <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
        <div className="text-xs">
          <span className="text-slate-500 dark:text-slate-400">Market: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">₹{data.marketPrice.toLocaleString("en-IN")}</span>
        </div>
        <div className={cn(
          "text-xs font-semibold",
          profitMargin > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {profitMargin > 0 ? "+" : ""}₹{profitMargin.toLocaleString("en-IN")}
        </div>
      </div>

      {/* Last Updated */}
      <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mt-2">
        <Clock className="w-3 h-3" />
        <span>{data.lastUpdated}</span>
      </div>
    </motion.div>
  );
}

export default MSPPriceCard;
