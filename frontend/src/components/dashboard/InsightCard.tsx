"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  title: string;
  subtitle?: string;
  value: string;
  unit?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export function InsightCard({ 
  title, 
  subtitle, 
  value, 
  unit,
  trend,
  gradient = "from-emerald-500 to-teal-600"
}: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 text-white",
        `bg-gradient-to-br ${gradient}`
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/30 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
      </div>

      <div className="relative">
        <p className="text-xs font-bold text-white/80 uppercase tracking-widest mb-1">
          {title}
        </p>
        {subtitle && (
          <p className="text-xs text-white/60 font-medium mb-3">{subtitle}</p>
        )}
        
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold">{value}</span>
            {unit && <span className="text-sm font-semibold text-white/80">{unit}</span>}
          </div>
          
          {trend && (
            <div className={cn(
              "text-sm font-bold px-2.5 py-1 rounded-full",
              trend.isPositive 
                ? "bg-white/25 text-white" 
                : "bg-red-500/40 text-white"
            )}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default InsightCard;

