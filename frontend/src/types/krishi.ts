/**
 * KrishiGPT Type Definitions
 * Types for forms, context, and responses.
 */

// === Confidence & Enums ===
export type ConfidenceLevel = "Low" | "Medium" | "High";

export type CropStage = "sowing" | "germination" | "vegetative" | "flowering" | "fruiting" | "harvest";

export type Season = "kharif" | "rabi" | "zaid";

export type SoilType = "alluvial" | "black" | "red" | "laterite" | "sandy" | "clay" | "loamy";

// === Farm Context ===
export interface FarmContext {
    location?: string;
    crop?: string;
    crop_stage?: CropStage;
    season?: Season;
    soil_type?: SoilType;
    land_size_acres?: number;
    irrigation_method?: string;
    weather_summary?: string;
}

// === Form Types ===
export interface FormFieldOption {
    value: string;
    label: string;
    label_hi?: string;
}

export interface FormField {
    name: string;
    type: "select" | "radio" | "checkbox" | "slider" | "text" | "number";
    label: string;
    label_hi?: string;
    options?: FormFieldOption[];
    min_value?: number;
    max_value?: number;
    step?: number;
    required: boolean;
    placeholder?: string;
}

export interface FormSchema {
    id: string;
    title: string;
    title_hi?: string;
    description?: string;
    fields: FormField[];
    submit_action: string;
    submit_label: string;
    submit_label_hi?: string;
}

// === Response Types ===
export type KrishiResponseType = "response" | "form_request" | "error";

export interface KrishiMessageResponse {
    type: KrishiResponseType;
    userMessageId?: string;
    aiMessageId?: string;
    aiResponse?: string;
    confidence?: ConfidenceLevel;
    intent?: string;
    timestamp?: string;
    form?: FormSchema;
    message?: string;
}

export interface KrishiStreamChunk {
    chunk?: string;
    done?: boolean;
    full_text?: string;
    confidence?: ConfidenceLevel;
    intent?: string;
    error?: string;
    type?: "form_request";
    form?: FormSchema;
    message?: string;
}

// === Message with KrishiGPT metadata ===
export interface KrishiMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    confidence?: ConfidenceLevel;
    intent?: string;
    formData?: Record<string, unknown>;
}

// === Tool Types ===
export interface ToolResult {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    confidence?: ConfidenceLevel;
    disclaimer?: string;
    requires_form?: boolean;
    form?: FormSchema;
}
