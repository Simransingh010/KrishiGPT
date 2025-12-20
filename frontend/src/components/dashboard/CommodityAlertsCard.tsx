"use client";

import { motion } from "framer-motion";
import { Bell, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface Alert {
  commodity: string;
  message: string;
  type: "opportunity" | "warning" | "info";
}

interface CommodityAlertsCardProps {
  alerts: Alert[];
  delay?: number;
  className?: string;
}

function getAlertConfig(type: Alert["type"]) {
  switch (type) {
    case "opportunity":
      return {
        icon: TrendingUp,
        bg: "bg-green-50 dark:bg-green-900/30",
        border: "border-green-200 dark:border-green-800",
        iconColor: "text-green-600 dark:text-green-400",
        textColor: "text-green-700 dark:text-green-400",
      };
    case "warning":
      return {
        icon: AlertTriangle,
        bg: "bg-amber-50 dark:bg-amber-900/30",
        border: "border-amber-200 dark:border-amber-800",
        iconColor: "text-amber-600 dark:text-amber-400",
        textColor: "text-amber-700 dark:text-amber-400",
      };
    case "info":
    default:
      return {
        icon: Info,
        bg: "bg-blue-50 dark:bg-blue-900/30",
        border: "border-blue-200 dark:border-blue-800",
        iconColor: "text-blue-600 dark:text-blue-400",
        textColor: "text-blue-700 dark:text-blue-400",
      };
  }
}

export function CommodityAlertsCard({ alerts, delay = 0, className }: CommodityAlertsCardProps) {
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
        <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/30 flex items-center justify-center">
          <Bell className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Price Alerts</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{alerts.length} active alerts</p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-2">
        {alerts.map((alert, index) => {
          const config = getAlertConfig(alert.type);
          const Icon = config.icon;
          
          return (
            <motion.div
              key={`${alert.commodity}-${index}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.2 + index * 0.1 }}
              className={cn(
                "p-3 rounded-lg border",
                config.bg,
                config.border
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", config.iconColor)} />
                <div>
                  <p className={cn("text-xs font-semibold", config.textColor)}>
                    {alert.commodity}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{alert.message}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default CommodityAlertsCard;
