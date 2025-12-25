"use client";

import { useState } from "react";
import { usePrices, usePriceMutations, useCrops } from "@/hooks/useAdmin";
import { DataTable } from "@/components/admin/DataTable";
import { PriceFormModal } from "@/components/admin/PriceFormModal";
import { Button, Select } from "@/components/admin/FormFields";
import { CropPrice, PriceCreate } from "@/services/adminApi";
import { Plus, Trash2 } from "lucide-react";

export function PricesTab() {
    const [selectedCropId, setSelectedCropId] = useState<string>("");
    const { data: prices, status, refetch } = usePrices(selectedCropId || undefined);
    const { data: crops } = useCrops(true);
    const mutations = usePriceMutations(refetch);

    const [modalOpen, setModalOpen] = useState(false);

    const handleSubmit = async (data: PriceCreate) => {
        await mutations.create(data);
    };

    const handleDelete = async (price: CropPrice) => {
        if (confirm("Delete this price entry?")) {
            await mutations.remove(price.id);
        }
    };

    const cropOptions = (crops || []).map((c) => ({
        value: c.id,
        label: `${c.icon} ${c.name}`,
    }));

    const columns = [
        {
            key: "crop",
            header: "Crop",
            render: (price: CropPrice) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{price.crop?.icon || "🌾"}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {price.crop?.name || "Unknown"}
                    </span>
                </div>
            ),
        },
        {
            key: "price",
            header: "Price",
            render: (price: CropPrice) => (
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{price.price.toLocaleString()}
                </span>
            ),
        },
        {
            key: "price_type",
            header: "Type",
            render: (price: CropPrice) => (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 capitalize">
                    {price.price_type}
                </span>
            ),
        },
        {
            key: "market_name",
            header: "Market",
            render: (price: CropPrice) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {price.market_name || "—"}
                </span>
            ),
        },
        {
            key: "state",
            header: "State",
            render: (price: CropPrice) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {price.state || "—"}
                </span>
            ),
        },
        {
            key: "recorded_at",
            header: "Date",
            render: (price: CropPrice) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {new Date(price.recorded_at).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-12",
            render: (price: CropPrice) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(price);
                    }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Price History
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Track daily market prices for crops
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="w-48">
                        <Select
                            label=""
                            value={selectedCropId}
                            onChange={(e) => setSelectedCropId(e.target.value)}
                            options={[{ value: "", label: "All Crops" }, ...cropOptions]}
                        />
                    </div>
                    <Button onClick={() => setModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Price
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={prices || []}
                keyExtractor={(price) => price.id}
                isLoading={status === "loading"}
                emptyMessage="No price entries found. Add daily prices to track market trends."
            />

            <PriceFormModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSubmit}
                crops={crops || []}
                preselectedCropId={selectedCropId}
            />
        </div>
    );
}
