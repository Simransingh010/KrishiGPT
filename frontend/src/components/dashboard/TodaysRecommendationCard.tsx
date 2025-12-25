"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, ArrowRight, CheckCircle } from "lucide-react";

interface Recommendation {
  type: "sell" | "hold" | "buy" | "warning";
  commodity: string;
  title: string;
  description: string;
  action: string;
  marketPrice: number;
  mspPrice: number;
  difference: number;
  urgency: "high" | "medium" | "low";
}

interface TodaysRecommendationCardProps {
  recommendation: Recommendation;
  delay?: number;
}

const recommendationConfig = {
  sell: {
    icon: TrendingUp,
    bg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    text: "text-white",
    badge: "bg-emerald-600/20 text-emerald-100",
    actionBg: "bg-white/20 hover:bg-white/30 text-white",
  },
  buy: {
    icon: TrendingDown,
    bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    text: "text-white",
    badge: "bg-blue-600/20 text-blue-100",
    actionBg: "bg-white/20 hover:bg-white/30 text-white",
  },
  hold: {
    icon: CheckCircle,
    bg: "bg-gradient-to-br from-amber-500 to-orange-600",
    text: "text-white",
    badge: "bg-amber-600/20 text-amber-100",
    actionBg: "bg-white/20 hover:bg-white/30 text-white",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-gradient-to-br from-red-500 to-rose-600",
    text: "text-white",
    badge: "bg-red-600/20 text-red-100",
    actionBg: "bg-white/20 hover:bg-white/30 text-white",
  },
};

export function TodaysRecommendationCard({
  recommendation,
  delay = 0,
}: TodaysRecommendationCardProps) {
  const config = recommendationConfig[recommendation.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`${config.bg} rounded-3xl shadow-2xl p-8 sm:p-10 lg:p-12 border-2 border-white/20`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wider ${config.badge} px-3 py-1 rounded-full inline-block mb-2`}>
              Today&apos;s Recommendation
            </p>
            <h2 className={`text-2xl sm:text-3xl font-bold ${config.text} mb-1`}>
              {recommendation.title}
            </h2>
            <p className={`text-base ${config.text} opacity-90`}>
              {recommendation.commodity}
            </p>
          </div>
        </div>
      </div>

      <p className={`text-lg ${config.text} mb-6 leading-relaxed opacity-95`}>
        {recommendation.description}
      </p>

      {/* Price Difference Highlight */}
      <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm ${config.text} opacity-80 mb-2`}>Market vs MSP</p>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl font-bold ${config.text}`}>
                ₹{recommendation.marketPrice.toLocaleString("en-IN")}
              </span>
              <span className={`text-xl ${config.text} opacity-75`}>
                vs ₹{recommendation.mspPrice.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm ${config.text} opacity-80 mb-1`}>Difference</p>
            <p className={`text-3xl font-bold ${config.text}`}>
              {recommendation.difference > 0 ? "+" : ""}₹{Math.abs(recommendation.difference).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full ${config.actionBg} rounded-xl px-6 py-4 font-semibold text-lg transition-all flex items-center justify-center gap-2`}
      >
        {recommendation.action}
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}

export default TodaysRecommendationCard;

