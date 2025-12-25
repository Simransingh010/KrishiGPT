"use client";

import Header from "@/components/Header";
import { WeatherHero } from "@/components/dashboard/WeatherHero";
import { StatusChips } from "@/components/dashboard/StatusChips";
import { PriceList } from "@/components/dashboard/PriceList";
import { TimelineFeed } from "@/components/dashboard/TimelineFeed";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { useDashboard } from "@/hooks/useDashboard";
import { motion } from "framer-motion";
import { BarChart2, Leaf, Calendar, RefreshCw } from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <div className="animate-pulse">
        <div className="h-64 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-slate-800 dark:to-slate-900" />
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
            <div className="lg:col-span-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Header />
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, status, error, refresh } = useDashboard();

  if (status === "loading" || status === "idle") {
    return <DashboardSkeleton />;
  }

  if (status === "error" || !data) {
    return <DashboardError error={error || "Unknown error"} onRetry={refresh} />;
  }

  // Transform status chips for component
  const statusChipsData = data.statusChips.map((chip) => ({
    id: chip.id,
    label: chip.label,
    value: chip.value,
    status: chip.status,
    icon: chip.icon,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <Header />

      {/* Weather Hero Section */}
      <WeatherHero data={data.weather} />

      {/* Status Chips Row */}
      <StatusChips chips={statusChipsData} />

      {/* Main Content */}
      <div className="p-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
          {/* Left Column: Prices */}
          <div className="lg:col-span-7 border-b lg:border-b-0 lg:border-r border-slate-100 dark:border-slate-800/50">
            <PriceList items={data.prices} title="Today's MSP Rates" />

            {/* Insight Cards */}
            <div className="px-4 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.insights.map((insight, idx) => (
                <InsightCard
                  key={idx}
                  title={insight.title}
                  subtitle={insight.subtitle}
                  value={insight.value}
                  unit={insight.unit}
                  trend={insight.trend}
                  gradient={insight.gradient}
                />
              ))}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="px-4 pb-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {data.quickStats.hectares}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Hectares</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {data.quickStats.activeCrops}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Crops</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {data.quickStats.harvestsSoon}
                  </p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Harvests Soon</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Timeline Feed */}
          <div className="lg:col-span-5">
            <TimelineFeed items={data.timeline} title="Updates & Insights" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="h-20 bg-gradient-to-t from-white dark:from-slate-950 to-transparent" />
    </div>
  );
}
