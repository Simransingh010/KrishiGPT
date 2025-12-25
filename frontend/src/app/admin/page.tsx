"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { AdminDashboard } from "./AdminDashboard";
import { CropsTab } from "./CropsTab";
import { PricesTab } from "./PricesTab";
import { InsightsTab } from "./InsightsTab";
import { LayoutDashboard, Wheat, TrendingUp, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "dashboard" | "crops" | "prices" | "insights";

const TABS = [
    { id: "dashboard" as Tab, label: "Dashboard", icon: LayoutDashboard },
    { id: "crops" as Tab, label: "Crops", icon: Wheat },
    { id: "prices" as Tab, label: "Prices", icon: TrendingUp },
    { id: "insights" as Tab, label: "Insights", icon: Lightbulb },
];

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<Tab>("dashboard");

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Admin Panel
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Manage crops, prices, and insights for the dashboard
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap",
                                    activeTab === tab.id
                                        ? "bg-green-600 text-white"
                                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    {activeTab === "dashboard" && <AdminDashboard />}
                    {activeTab === "crops" && <CropsTab />}
                    {activeTab === "prices" && <PricesTab />}
                    {activeTab === "insights" && <InsightsTab />}
                </div>
            </div>
        </div>
    );
}
