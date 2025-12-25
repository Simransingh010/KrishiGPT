"use client";

import { useAdminStats } from "@/hooks/useAdmin";
import { Wheat, TrendingUp, Lightbulb, CheckCircle } from "lucide-react";

export function AdminDashboard() {
    const { data: stats, status } = useAdminStats();

    if (status === "loading") {
        return (
            <div className="p-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    const statCards = [
        {
            label: "Total Crops",
            value: stats?.total_crops || 0,
            icon: Wheat,
            color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
        },
        {
            label: "Price Entries",
            value: stats?.total_prices || 0,
            icon: TrendingUp,
            color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
        },
        {
            label: "Total Insights",
            value: stats?.total_insights || 0,
            icon: Lightbulb,
            color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30",
        },
        {
            label: "Published",
            value: stats?.published_insights || 0,
            icon: CheckCircle,
            color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg ${stat.color}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stat.value}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {stat.label}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">
                    Quick Actions
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                    Use the tabs above to manage crops, add daily prices, and create insights
                    that will appear on the farmer dashboard.
                </p>
            </div>
        </div>
    );
}
