"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input, Select, Button } from "./FormFields";
import { Crop, PriceCreate } from "@/services/adminApi";

interface PriceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PriceCreate) => Promise<void>;
    crops: Crop[];
    preselectedCropId?: string;
}

const PRICE_TYPES = [
    { value: "market", label: "Market Price" },
    { value: "msp", label: "MSP" },
    { value: "modal", label: "Modal Price" },
    { value: "min", label: "Minimum" },
    { value: "max", label: "Maximum" },
];

const INDIAN_STATES = [
    "Andhra Pradesh", "Bihar", "Gujarat", "Haryana", "Karnataka",
    "Madhya Pradesh", "Maharashtra", "Punjab", "Rajasthan", "Tamil Nadu",
    "Telangana", "Uttar Pradesh", "West Bengal",
].map((s) => ({ value: s, label: s }));

export function PriceFormModal({
    isOpen,
    onClose,
    onSubmit,
    crops,
    preselectedCropId,
}: PriceFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<PriceCreate>({
        crop_id: preselectedCropId || "",
        price: 0,
        price_type: "market",
        market_name: "",
        state: "",
        district: "",
        recorded_at: new Date().toISOString().split("T")[0],
        source: "manual",
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                crop_id: preselectedCropId || "",
                price: 0,
                price_type: "market",
                market_name: "",
                state: "",
                district: "",
                recorded_at: new Date().toISOString().split("T")[0],
                source: "manual",
            });
        }
    }, [isOpen, preselectedCropId]);

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

    const cropOptions = crops.map((c) => ({
        value: c.id,
        label: `${c.icon} ${c.name}`,
    }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Price Entry" size="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                        label="Crop"
                        value={formData.crop_id}
                        onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                        options={cropOptions}
                        required
                    />
                    <Select
                        label="Price Type"
                        value={formData.price_type || "market"}
                        onChange={(e) => setFormData({ ...formData, price_type: e.target.value })}
                        options={PRICE_TYPES}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                        label="Price (₹)"
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="e.g., 2350"
                        required
                    />
                    <Input
                        label="Date"
                        type="date"
                        value={formData.recorded_at || ""}
                        onChange={(e) => setFormData({ ...formData, recorded_at: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <Input
                        label="Market Name"
                        value={formData.market_name || ""}
                        onChange={(e) => setFormData({ ...formData, market_name: e.target.value })}
                        placeholder="e.g., Azadpur Mandi"
                    />
                    <Select
                        label="State"
                        value={formData.state || ""}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        options={INDIAN_STATES}
                    />
                    <Input
                        label="District"
                        value={formData.district || ""}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="e.g., North Delhi"
                    />
                </div>

                <Input
                    label="Source"
                    value={formData.source || "manual"}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., agmarknet, manual"
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Add Price
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
