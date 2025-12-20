"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatusChip {
  id: string;
  label: string;
  value: string;
  status: "good" | "moderate" | "warning" | "critical";
  sublabel?: string;
}

interface StatusChipsProps {
  chips: StatusChip[];
}

const statusColors = {
  good: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
  moderate: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20",
  warning: "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20",
};

const statusDot = {
  good: "bg-emerald-500",
  moderate: "bg-amber-500",
  warning: "bg-orange-500",
  critical: "bg-red-500",
};

export function StatusChips({ chips }: StatusChipsProps) {
  return (
    <section className="bg-white dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 py-4 overflow-x-auto no-scrollbar">
          {chips.map((chip, index) => (
            <motion.div
              key={chip.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-full border",
                statusColors[chip.status]
              )}
            >
              <div className={cn("w-2.5 h-2.5 rounded-full", statusDot[chip.status])} />
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-bold">{chip.value}</span>
                <span className="text-xs font-medium opacity-80">{chip.label}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Helper to generate chips from data
export function generateStatusChips(data: {
  aqi: number;
  soilMoisture: number;
  soilPh: number;
  rainProbability: number;
  marketSentiment: "bullish" | "bearish" | "neutral";
}): StatusChip[] {
  const getAqiStatus = (aqi: number): StatusChip["status"] => {
    if (aqi <= 50) return "good";
    if (aqi <= 100) return "moderate";
    if (aqi <= 150) return "warning";
    return "critical";
  };

  const getMoistureStatus = (m: number): StatusChip["status"] => {
    if (m >= 60 && m <= 80) return "good";
    if (m >= 40 && m < 60) return "moderate";
    return "warning";
  };

  const getPhStatus = (ph: number): StatusChip["status"] => {
    if (ph >= 6 && ph <= 7.5) return "good";
    if (ph >= 5.5 && ph < 6) return "moderate";
    return "warning";
  };

  const getRainStatus = (r: number): StatusChip["status"] => {
    if (r <= 20) return "good";
    if (r <= 50) return "moderate";
    return "warning";
  };

  const getMarketStatus = (s: string): StatusChip["status"] => {
    if (s === "bullish") return "good";
    if (s === "neutral") return "moderate";
    return "warning";
  };

  return [
    {
      id: "aqi",
      label: "AQI",
      value: data.aqi.toString(),
      status: getAqiStatus(data.aqi),
    },
    {
      id: "soil",
      label: "soil moisture",
      value: `${data.soilMoisture}%`,
      status: getMoistureStatus(data.soilMoisture),
    },
    {
      id: "ph",
      label: "pH",
      value: data.soilPh.toFixed(1),
      status: getPhStatus(data.soilPh),
    },
    {
      id: "rain",
      label: "rain today",
      value: `${data.rainProbability}%`,
      status: getRainStatus(data.rainProbability),
    },
    {
      id: "market",
      label: "markets",
      value: data.marketSentiment,
      status: getMarketStatus(data.marketSentiment),
    },
  ];
}

export default StatusChips;

