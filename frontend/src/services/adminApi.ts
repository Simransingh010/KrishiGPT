/**
 * Admin API Service
 * CRUD operations for crops, prices, and insights
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// === Types ===

export interface CropCategory {
    id: string;
    name: string;
    icon: string | null;
    display_order: number;
    created_at: string;
}

export interface Crop {
    id: string;
    category_id: string | null;
    name: string;
    name_hindi: string | null;
    icon: string;
    unit: string;
    msp_price: number | null;
    msp_year: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: { name: string; icon: string } | null;
}

export interface CropCreate {
    category_id?: string;
    name: string;
    name_hindi?: string;
    icon?: string;
    unit?: string;
    msp_price?: number;
    msp_year?: string;
    is_active?: boolean;
}

export interface CropPrice {
    id: string;
    crop_id: string;
    price: number;
    price_type: string;
    market_name: string | null;
    state: string | null;
    district: string | null;
    recorded_at: string;
    source: string;
    created_at: string;
    crop?: { name: string; icon: string } | null;
}

export interface PriceCreate {
    crop_id: string;
    price: number;
    price_type?: string;
    market_name?: string;
    state?: string;
    district?: string;
    recorded_at?: string;
    source?: string;
}

export interface InsightType {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    display_order: number;
}

export interface Insight {
    id: string;
    type_id: string | null;
    title: string;
    message: string;
    is_actionable: boolean;
    action_url: string | null;
    priority: number;
    target_states: string[] | null;
    target_crops: string[] | null;
    publish_at: string | null;
    expires_at: string | null;
    is_published: boolean;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    insight_type?: { name: string; icon: string; color: string } | null;
}

export interface InsightCreate {
    type_id?: string;
    title: string;
    message: string;
    is_actionable?: boolean;
    action_url?: string;
    priority?: number;
    target_states?: string[];
    target_crops?: string[];
    publish_at?: string;
    expires_at?: string;
    is_published?: boolean;
    is_pinned?: boolean;
}

export interface AdminStats {
    total_crops: number;
    total_prices: number;
    total_insights: number;
    published_insights: number;
}

// === API Functions ===

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { "Content-Type": "application/json", ...options?.headers },
        ...options,
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || "Request failed");
    }
    return response.json();
}

export const AdminApiService = {
    // Stats
    getStats: () => fetchApi<AdminStats>("/api/admin/stats"),

    // Categories
    getCategories: () => fetchApi<CropCategory[]>("/api/admin/categories"),
    createCategory: (data: { name: string; icon?: string; display_order?: number }) =>
        fetchApi<CropCategory>("/api/admin/categories", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Crops
    getCrops: (activeOnly = false) =>
        fetchApi<Crop[]>(`/api/admin/crops?active_only=${activeOnly}`),
    getCrop: (id: string) => fetchApi<Crop>(`/api/admin/crops/${id}`),
    createCrop: (data: CropCreate) =>
        fetchApi<Crop>("/api/admin/crops", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateCrop: (id: string, data: Partial<CropCreate>) =>
        fetchApi<Crop>(`/api/admin/crops/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
    deleteCrop: (id: string) =>
        fetchApi<{ message: string }>(`/api/admin/crops/${id}`, { method: "DELETE" }),

    // Prices
    getPrices: (cropId?: string, limit = 100) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (cropId) params.append("crop_id", cropId);
        return fetchApi<CropPrice[]>(`/api/admin/prices?${params}`);
    },
    createPrice: (data: PriceCreate) =>
        fetchApi<CropPrice>("/api/admin/prices", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    bulkCreatePrices: (prices: PriceCreate[]) =>
        fetchApi<{ inserted: number }>("/api/admin/prices/bulk", {
            method: "POST",
            body: JSON.stringify(prices),
        }),
    deletePrice: (id: string) =>
        fetchApi<{ message: string }>(`/api/admin/prices/${id}`, { method: "DELETE" }),

    // Insight Types
    getInsightTypes: () => fetchApi<InsightType[]>("/api/admin/insight-types"),

    // Insights
    getInsights: (publishedOnly = false, limit = 50) =>
        fetchApi<Insight[]>(`/api/admin/insights?published_only=${publishedOnly}&limit=${limit}`),
    getInsight: (id: string) => fetchApi<Insight>(`/api/admin/insights/${id}`),
    createInsight: (data: InsightCreate) =>
        fetchApi<Insight>("/api/admin/insights", {
            method: "POST",
            body: JSON.stringify(data),
        }),
    updateInsight: (id: string, data: Partial<InsightCreate>) =>
        fetchApi<Insight>(`/api/admin/insights/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        }),
    deleteInsight: (id: string) =>
        fetchApi<{ message: string }>(`/api/admin/insights/${id}`, { method: "DELETE" }),
    publishInsight: (id: string) =>
        fetchApi<{ message: string }>(`/api/admin/insights/${id}/publish`, { method: "POST" }),
    unpublishInsight: (id: string) =>
        fetchApi<{ message: string }>(`/api/admin/insights/${id}/unpublish`, { method: "POST" }),
};
