"use client";

import { useState } from "react";
import { useInsights, useInsightMutations, useInsightTypes } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/DataTable";
import { InsightFormModal } from "@/components/admin/InsightFormModal";
import { Button } from "@/components/admin/FormFields";
import { Insight, InsightCreate } from "@/services/adminApi";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

export function InsightsTab() {
    const { data: insights, status, refetch } = useInsights();
    const { data: insightTypes } = useInsightTypes();
    const mutations = useInsightMutations(refetch);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingInsight, setEditingInsight] = useState<Insight | null>(null);

    const handleCreate = () => {
        setEditingInsight(null);
        setModalOpen(true);
    };

    const handleEdit = (insight: Insight) => {
        setEditingInsight(insight);
        setModalOpen(true);
    };

    const handleSubmit = async (data: InsightCreate) => {
        if (editingInsight) {
            await mutations.update(editingInsight.id, data);
        } else {
            await mutations.create(data);
        }
    };

    const handleTogglePublish = async (insight: Insight) => {
        if (insight.is_published) {
            await mutations.unpublish(insight.id);
        } else {
            await mutations.publish(insight.id);
        }
    };

    const handleDelete = async (insight: Insight) => {
        if (confirm(`Delete "${insight.title}"? This cannot be undone.`)) {
            await mutations.remove(insight.id);
        }
    };

    const typeColors: Record<string, string> = {
        opportunity: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        weather: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        insight: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        harvest: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };

    const columns = [
        {
            key: "type",
            header: "Type",
            className: "w-32",
            render: (insight: Insight) => {
                const typeName = insight.insight_type?.name || "insight";
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[typeName] || typeColors.insight
                            }`}
                    >
                        {insight.insight_type?.icon} {typeName}
                    </span>
                );
            },
        },
        {
            key: "title",
            header: "Title",
            render: (insight: Insight) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {insight.title}
                    </p>
                    <p
                        className="text-xs text-slate-500 line-clamp-1 mt-0.5"
                        dangerouslySetInnerHTML={{
                            __html: insight.message.replace(/<[^>]*>/g, " ").slice(0, 80),
                        }}
                    />
                </div>
            ),
        },
        {
            key: "priority",
            header: "Priority",
            className: "w-24",
            render: (insight: Insight) => {
                const priorityLabel =
                    insight.priority >= 20
                        ? "Critical"
                        : insight.priority >= 10
                            ? "High"
                            : insight.priority >= 5
                                ? "Medium"
                                : "Normal";
                return (
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                        {priorityLabel}
                    </span>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            className: "w-28",
            render: (insight: Insight) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${insight.is_published
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                >
                    {insight.is_published ? "Published" : "Draft"}
                </span>
            ),
        },
        {
            key: "created_at",
            header: "Created",
            className: "w-28",
            render: (insight: Insight) => (
                <span className="text-sm text-slate-500">
                    {new Date(insight.created_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-32",
            render: (insight: Insight) => (
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePublish(insight);
                        }}
                        title={insight.is_published ? "Unpublish" : "Publish"}
                        className={`p-2 rounded-lg transition-colors ${insight.is_published
                                ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                            }`}
                    >
                        {insight.is_published ? (
                            <Eye className="w-4 h-4" />
                        ) : (
                            <EyeOff className="w-4 h-4" />
                        )}
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(insight);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(insight);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Insights & Updates
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Create and manage updates shown on the farmer dashboard
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Insight
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={insights || []}
                keyExtractor={(insight) => insight.id}
                onRowClick={handleEdit}
                isLoading={status === "loading"}
                emptyMessage="No insights yet. Create your first insight to engage farmers."
            />

            <InsightFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                insight={editingInsight}
                insightTypes={insightTypes || []}
            />
        </div>
    );
}
