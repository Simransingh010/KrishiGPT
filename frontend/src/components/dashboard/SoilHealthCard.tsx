"use client";

import { motion } from "framer-motion";
import { Droplet } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoilData {
  moisture: number;
  ph: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
}

interface SoilHealthCardProps {
  data: SoilData;
  delay?: number;
  className?: string;
}

function CircularProgress({ value, size = 80, strokeWidth = 6, color = "#10B981" }: { 
  value: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-700 dark:text-slate-200">{value}%</span>
      </div>
    </div>
  );
}

function NutrientBar({ name, value, color, delay }: { name: string; value: number; color: string; delay: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 dark:text-slate-300 font-medium">{name}</span>
        <span className="text-slate-500 dark:text-slate-400">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, delay, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function getPHColor(ph: number): string {
  if (ph < 6) return "#EF4444";
  if (ph > 7.5) return "#3B82F6";
  return "#10B981";
}

function getPHStatus(ph: number): string {
  if (ph < 6) return "Acidic";
  if (ph > 7.5) return "Alkaline";
  return "Optimal";
}

export function SoilHealthCard({ data, delay = 0, className }: SoilHealthCardProps) {
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
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <Droplet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Soil Health</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Current conditions</p>
        </div>
      </div>

      {/* Moisture & pH */}
      <div className="flex items-center justify-around mb-4 py-3">
        <div className="text-center">
          <CircularProgress value={data.moisture} color="#3B82F6" />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Moisture</p>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-700 flex flex-col items-center justify-center border-4" style={{ borderColor: getPHColor(data.ph) }}>
            <span className="text-xl font-bold text-slate-700 dark:text-slate-200">{data.ph}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">pH</span>
          </div>
          <p className="text-xs mt-2" style={{ color: getPHColor(data.ph) }}>{getPHStatus(data.ph)}</p>
        </div>
      </div>

      {/* NPK Levels */}
      <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-3">NPK Levels</p>
        <div className="space-y-3">
          <NutrientBar name="Nitrogen (N)" value={data.nutrients.nitrogen} color="#3B82F6" delay={delay + 0.3} />
          <NutrientBar name="Phosphorus (P)" value={data.nutrients.phosphorus} color="#F59E0B" delay={delay + 0.4} />
          <NutrientBar name="Potassium (K)" value={data.nutrients.potassium} color="#10B981" delay={delay + 0.5} />
        </div>
      </div>
    </motion.div>
  );
}

export default SoilHealthCard;
