"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input, Select, Checkbox, Button } from "./FormFields";
import { Crop, CropCreate, CropCategory } from "@/services/adminApi";

interface CropFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CropCreate) => Promise<void>;
    crop?: Crop | null;
    categories: CropCategory[];
}

const CROP_ICONS = ["🌾", "🌽", "🫘", "🌻", "🥜", "🌿", "🎋", "🍚", "🥬", "🍎"];

export function CropFormModal({
    isOpen,
    onClose,
    onSubmit,
    crop,
    categories,
}: CropFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<CropCreate>({
        name: "",
        name_hindi: "",
        icon: "🌾",
        category_id: "",
        unit: "per quintal",
        msp_price: undefined,
        msp_year: "2024-25",
        is_active: true,
    });

    useEffect(() => {
        if (crop) {
            setFormData({
                name: crop.name,
                name_hindi: crop.name_hindi || "",
                icon: crop.icon,
                category_id: crop.category_id || "",
                unit: crop.unit,
                msp_price: crop.msp_price || undefined,
                msp_year: crop.msp_year || "2024-25",
                is_active: crop.is_active,
            });
        } else {
            setFormData({
                name: "",
                name_hindi: "",
                icon: "🌾",
                category_id: "",
                unit: "per quintal",
                msp_price: undefined,
                msp_year: "2024-25",
                is_active: true,
            });
        }
    }, [crop, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: `${c.icon || ""} ${c.name}`.trim(),
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={crop ? "Edit Crop" : "Add New Crop"}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                        label="Crop Name (English)"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Wheat"
                        required
                    />
                    <Input
                        label="Crop Name (Hindi)"
                        value={formData.name_hindi || ""}
                        onChange={(e) => setFormData({ ...formData, name_hindi: e.target.value })}
                        placeholder="e.g., गेहूं"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                        label="Category"
                        value={formData.category_id || ""}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        options={categoryOptions}
                    />
                    <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Icon
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CROP_ICONS.map((icon) => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, icon })}
                                    className={`w-10 h-10 text-xl rounded-lg border-2 transition-colors ${formData.icon === icon
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                        }`}
                                >
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input
                        label="MSP Price (₹)"
                        type="number"
                        value={formData.msp_price || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, msp_price: e.target.value ? Number(e.target.value) : undefined })
                        }
                        placeholder="e.g., 2275"
                    />
                    <Input
                        label="MSP Year"
                        value={formData.msp_year || ""}
                        onChange={(e) => setFormData({ ...formData, msp_year: e.target.value })}
                        placeholder="e.g., 2024-25"
                    />
                    <Input
                        label="Unit"
                        value={formData.unit || ""}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="e.g., per quintal"
                    />
                </div>

                <Checkbox
                    label="Active (visible on dashboard)"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {crop ? "Update Crop" : "Add Crop"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
