"use client";

import { useState } from "react";
import { useCrops, useCropMutations, useCategories } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/DataTable";
import { CropFormModal } from "@/components/admin/CropFormModal";
import { Button } from "@/components/admin/FormFields";
import { Crop, CropCreate } from "@/services/adminApi";
import { Plus, Pencil, Trash2 } from "lucide-react";

export function CropsTab() {
    const { data: crops, status, refetch } = useCrops();
    const { data: categories } = useCategories();
    const mutations = useCropMutations(refetch);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState<Crop | null>(null);

    const handleCreate = () => {
        setEditingCrop(null);
        setModalOpen(true);
    };

    const handleEdit = (crop: Crop) => {
        setEditingCrop(crop);
        setModalOpen(true);
    };

    const handleSubmit = async (data: CropCreate) => {
        if (editingCrop) {
            await mutations.update(editingCrop.id, data);
        } else {
            await mutations.create(data);
        }
    };

    const handleDelete = async (crop: Crop) => {
        if (confirm(`Deactivate "${crop.name}"? It will be hidden from the dashboard.`)) {
            await mutations.remove(crop.id);
        }
    };

    const columns = [
        {
            key: "icon",
            header: "",
            className: "w-12",
            render: (crop: Crop) => <span className="text-2xl">{crop.icon}</span>,
        },
        {
            key: "name",
            header: "Name",
            render: (crop: Crop) => (
                <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{crop.name}</p>
                    {crop.name_hindi && (
                        <p className="text-xs text-slate-500">{crop.name_hindi}</p>
                    )}
                </div>
            ),
        },
        {
            key: "category",
            header: "Category",
            render: (crop: Crop) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {crop.category?.name || "—"}
                </span>
            ),
        },
        {
            key: "msp_price",
            header: "MSP",
            render: (crop: Crop) => (
                <span className="font-mono font-semibold">
                    {crop.msp_price ? `₹${crop.msp_price.toLocaleString()}` : "—"}
                </span>
            ),
        },
        {
            key: "is_active",
            header: "Status",
            render: (crop: Crop) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${crop.is_active
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                >
                    {crop.is_active ? "Active" : "Inactive"}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-24",
            render: (crop: Crop) => (
                <div className="flex gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(crop);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(crop);
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
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Crops</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage crop master data and MSP prices
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Crop
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={crops || []}
                keyExtractor={(crop) => crop.id}
                onRowClick={handleEdit}
                isLoading={status === "loading"}
                emptyMessage="No crops found. Add your first crop to get started."
            />

            <CropFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                crop={editingCrop}
                categories={categories || []}
            />
        </div>
    );
}
