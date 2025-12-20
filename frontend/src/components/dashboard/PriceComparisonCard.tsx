"use client";

import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTheme } from "@/context/ThemeContext";

interface CommodityData {
  id: string;
  name: string;
  icon: string;
  currentPrice: number;
  marketPrice: number;
}

interface PriceComparisonCardProps {
  commodities: CommodityData[];
  delay?: number;
  className?: string;
}

export function PriceComparisonCard({ commodities, delay = 0, className }: PriceComparisonCardProps) {
  const { isDark } = useTheme();
  
  const chartData = commodities.map(c => ({
    name: c.name,
    "MSP Price": c.currentPrice,
    "Market Price": c.marketPrice,
    icon: c.icon,
  }));

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
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">MSP vs Market Price</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Compare support and market prices</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300">MSP Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-slate-600 dark:text-slate-300">Market Price</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={200}>
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
              axisLine={{ stroke: isDark ? "#475569" : "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
              axisLine={{ stroke: isDark ? "#475569" : "#e2e8f0" }}
              tickLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#fff",
                border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
                borderRadius: "8px",
                fontSize: "12px",
                color: isDark ? "#f1f5f9" : "#1f2937",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, ""]}
            />
            <Bar 
              dataKey="MSP Price" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
            />
            <Bar 
              dataKey="Market Price" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              animationDuration={1000}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        {commodities.map((commodity) => {
          const profit = commodity.marketPrice - commodity.currentPrice;
          const isProfit = profit > 0;
          return (
            <div key={commodity.id} className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{commodity.name}</p>
              <p className={cn(
                "text-sm font-bold",
                isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {isProfit ? "+" : ""}₹{profit.toLocaleString("en-IN")}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">margin</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default PriceComparisonCard;
