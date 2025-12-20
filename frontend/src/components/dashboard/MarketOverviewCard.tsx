"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface MarketData {
  month: string;
  wheat: number;
  rice: number;
  cotton: number;
  soybean: number;
}

interface MarketOverviewCardProps {
  data: MarketData[];
  delay?: number;
  className?: string;
}

const commodityColors: Record<string, string> = {
  wheat: "#F59E0B",
  rice: "#10B981",
  cotton: "#3B82F6",
  soybean: "#8B5CF6",
};

export function MarketOverviewCard({ data, delay = 0, className }: MarketOverviewCardProps) {
  const { isDark } = useTheme();

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Market Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Commodity price trends (6 months)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(commodityColors).map(([name, color]) => (
            <div key={name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-slate-600 dark:text-slate-300 capitalize">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
              axisLine={{ stroke: isDark ? "#475569" : "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
              axisLine={{ stroke: isDark ? "#475569" : "#e2e8f0" }}
              tickLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
              domain={['dataMin - 200', 'dataMax + 200']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#fff",
                border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: isDark ? "#f1f5f9" : "#1f2937",
              }}
              formatter={(value: number, name: string) => [`₹${value.toLocaleString("en-IN")}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Line 
              type="monotone" 
              dataKey="wheat" 
              stroke={commodityColors.wheat} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="rice" 
              stroke={commodityColors.rice} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={200}
            />
            <Line 
              type="monotone" 
              dataKey="cotton" 
              stroke={commodityColors.cotton} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={400}
            />
            <Line 
              type="monotone" 
              dataKey="soybean" 
              stroke={commodityColors.soybean} 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              animationDuration={1500}
              animationBegin={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default MarketOverviewCard;
