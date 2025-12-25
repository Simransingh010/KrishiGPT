"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input, Select, Checkbox, Button } from "./FormFields";
import { RichTextEditor } from "./RichTextEditor";
import { Insight, InsightCreate, InsightType } from "@/services/adminApi";

interface InsightFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: InsightCreate) => Promise<void>;
    insight?: Insight | null;
    insightTypes: InsightType[];
}

export function InsightFormModal({
    isOpen,
    onClose,
    onSubmit,
    insight,
    insightTypes,
}: InsightFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<InsightCreate>({
        title: "",
        message: "",
        type_id: "",
        is_actionable: false,
        action_url: "",
        priority: 0,
        is_published: false,
        is_pinned: false,
        publish_at: "",
        expires_at: "",
    });

    useEffect(() => {
        if (insight) {
            setFormData({
                title: insight.title,
                message: insight.message,
                type_id: insight.type_id || "",
                is_actionable: insight.is_actionable,
                action_url: insight.action_url || "",
                priority: insight.priority,
                is_published: insight.is_published,
                is_pinned: insight.is_pinned,
                publish_at: insight.publish_at ? insight.publish_at.slice(0, 16) : "",
                expires_at: insight.expires_at ? insight.expires_at.slice(0, 16) : "",
            });
        } else {
            setFormData({
                title: "",
                message: "",
                type_id: "",
                is_actionable: false,
                action_url: "",
                priority: 0,
                is_published: false,
                is_pinned: false,
                publish_at: "",
                expires_at: "",
            });
        }
    }, [insight, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const submitData: InsightCreate = {
                ...formData,
                publish_at: formData.publish_at ? new Date(formData.publish_at).toISOString() : undefined,
                expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined,
            };
            await onSubmit(submitData);
            onClose();
        } catch {
            // Error handled by parent
        } finally {
            setIsSubmitting(false);
        }
    };

    const typeOptions = insightTypes.map((t) => ({
        value: t.id,
        label: `${t.icon || ""} ${t.name}`.trim(),
    }));

    const priorityOptions = [
        { value: "0", label: "Normal" },
        { value: "5", label: "Medium" },
        { value: "10", label: "High" },
        { value: "20", label: "Critical" },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={insight ? "Edit Insight" : "Create New Insight"}
            size="xl"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                    label="Title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Wheat prices favorable this week"
                    required
                />

                <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Message <span className="text-red-500">*</span>
                    </label>
                    <RichTextEditor
                        content={formData.message}
                        onChange={(content) => setFormData({ ...formData, message: content })}
                        placeholder="Write your insight content here... Use formatting for better readability."
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Select
                        label="Type"
                        value={formData.type_id || ""}
                        onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                        options={typeOptions}
                    />
                    <Select
                        label="Priority"
                        value={formData.priority?.toString() || "0"}
                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                        options={priorityOptions}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                        label="Publish At"
                        type="datetime-local"
                        value={formData.publish_at || ""}
                        onChange={(e) => setFormData({ ...formData, publish_at: e.target.value })}
                    />
                    <Input
                        label="Expires At"
                        type="datetime-local"
                        value={formData.expires_at || ""}
                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                </div>

                <div className="space-y-3">
                    <Checkbox
                        label="Actionable (show 'Take Action' button)"
                        checked={formData.is_actionable}
                        onChange={(e) => setFormData({ ...formData, is_actionable: e.target.checked })}
                    />
                    {formData.is_actionable && (
                        <Input
                            label="Action URL"
                            value={formData.action_url || ""}
                            onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                            placeholder="https://..."
                        />
                    )}
                </div>

                <div className="flex gap-6">
                    <Checkbox
                        label="Published"
                        checked={formData.is_published}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    />
                    <Checkbox
                        label="Pinned to top"
                        checked={formData.is_pinned}
                        onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {insight ? "Update Insight" : "Create Insight"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
