"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Sprout, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsData {
  totalArea: number;
  activeCrops: number;
  upcomingHarvests: number;
}

interface QuickStatsCardProps {
  data: StatsData;
  delay?: number;
  className?: string;
}

function StatItem({ value, unit, label, icon: Icon, color, delay }: {
  value: number | string;
  unit?: string;
  label: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="text-center py-3"
    >
      <div className={cn("w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
        {value}<span className="text-sm font-normal text-slate-500 dark:text-slate-400">{unit}</span>
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </motion.div>
  );
}

export function QuickStatsCard({ data, delay = 0, className }: QuickStatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-md border border-slate-200/80 dark:border-slate-700 h-full transition-colors duration-300",
        className
      )}
    >
      {/* Header */}
      <div className="text-center mb-2">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Quick Stats</h3>
      </div>

      {/* Stats */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        <StatItem
          value={data.totalArea}
          unit=" ha"
          label="Total Area"
          icon={LayoutGrid}
          color="bg-blue-500"
          delay={delay + 0.1}
        />
        
        <StatItem
          value={data.activeCrops}
          label="Active Crops"
          icon={Sprout}
          color="bg-emerald-500"
          delay={delay + 0.2}
        />
        
        <StatItem
          value={data.upcomingHarvests}
          label="Harvests Soon"
          icon={Calendar}
          color="bg-amber-500"
          delay={delay + 0.3}
        />
      </div>
    </motion.div>
  );
}

export default QuickStatsCard;
