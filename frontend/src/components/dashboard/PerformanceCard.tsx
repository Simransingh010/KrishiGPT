"use client";

import { motion } from "framer-motion";
import { Target, TrendingUp, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceData {
  expectedYield: number;
  yieldUnit: string;
  cropHealth: number;
  regionalAverage: number;
}

interface PerformanceCardProps {
  data: PerformanceData;
  delay?: number;
  className?: string;
}

function AnimatedStat({ value, suffix, label, icon: Icon, color, delay }: {
  value: number;
  suffix?: string;
  label: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
    >
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {value}{suffix}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </motion.div>
  );
}

export function PerformanceCard({ data, delay = 0, className }: PerformanceCardProps) {
  const aboveAverage = data.expectedYield > data.regionalAverage;
  const percentDiff = (((data.expectedYield - data.regionalAverage) / data.regionalAverage) * 100).toFixed(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-md border border-slate-200/80 dark:border-slate-700 h-full transition-colors duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
          <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Your Performance</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Forecast & metrics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3">
        <AnimatedStat
          value={data.expectedYield}
          suffix={` ${data.yieldUnit.split("/")[0]}`}
          label="Expected Yield"
          icon={TrendingUp}
          color="bg-emerald-500"
          delay={delay + 0.2}
        />
        
        <AnimatedStat
          value={data.cropHealth}
          suffix="%"
          label="Crop Health"
          icon={Leaf}
          color="bg-green-500"
          delay={delay + 0.3}
        />
      </div>

      {/* Comparison */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">vs Regional Avg</span>
          <span className={cn(
            "text-sm font-bold",
            aboveAverage ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {aboveAverage ? "+" : ""}{percentDiff}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: delay + 0.4 }}
            className="h-full rounded-full relative"
          >
            <div 
              className="absolute h-full bg-slate-300 dark:bg-slate-600 rounded-full"
              style={{ width: `${(data.regionalAverage / Math.max(data.expectedYield, data.regionalAverage)) * 100}%` }}
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(data.expectedYield / Math.max(data.expectedYield, data.regionalAverage)) * 100}%` }}
              transition={{ duration: 1, delay: delay + 0.6 }}
              className="absolute h-full bg-emerald-500 rounded-full"
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>Regional: {data.regionalAverage}</span>
          <span>You: {data.expectedYield}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default PerformanceCard;
