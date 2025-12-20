"use client";

import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { cn } from "@/lib/utils";

interface AirQualityData {
  aqi: number;
  status: string;
  pollutants: Array<{
    name: string;
    value: number;
    max: number;
  }>;
}

interface AirQualityCardProps {
  data: AirQualityData;
  delay?: number;
  className?: string;
}

function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-500";
  if (aqi <= 100) return "text-yellow-500";
  if (aqi <= 150) return "text-orange-500";
  if (aqi <= 200) return "text-red-500";
  return "text-purple-500";
}

function getAQIBgColor(aqi: number): string {
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  return "bg-purple-500";
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "good":
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400";
    case "moderate":
      return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400";
    case "unhealthy":
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400";
    case "very unhealthy":
      return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  }
}

export function AirQualityCard({ data, delay = 0, className }: AirQualityCardProps) {
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
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
          <Wind className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Air Quality</h3>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getStatusColor(data.status))}>
            {data.status}
          </span>
        </div>
      </div>

      {/* AQI Score */}
      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.2 }}
          className={cn("text-4xl font-bold", getAQIColor(data.aqi))}
        >
          {data.aqi}
        </motion.div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AQI Score</p>
      </div>

      {/* Pollutant Bars */}
      <div className="space-y-3">
        {data.pollutants.map((pollutant, index) => (
          <div key={pollutant.name}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600 dark:text-slate-300 font-medium">{pollutant.name}</span>
              <span className="text-slate-500 dark:text-slate-400">{pollutant.value}/{pollutant.max}</span>
            </div>
            <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(pollutant.value / pollutant.max) * 100}%` }}
                transition={{ duration: 0.8, delay: delay + 0.3 + index * 0.1, ease: "easeOut" }}
                className={cn("h-full rounded-full", getAQIBgColor((pollutant.value / pollutant.max) * 200))}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default AirQualityCard;
