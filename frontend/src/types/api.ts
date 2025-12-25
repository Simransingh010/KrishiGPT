/**
 * API Types
 * Rule 27: Types first, implementation second.
 */

// Generic API Response wrapper
export interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}

export interface PaginationParams {
    page?: number;
    pageSize?: number;
    offset?: number;
    limit?: number;
}

// Error types
export interface ApiErrorResponse {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

// Request status FSM (Rule 7)
export type RequestStatus = "idle" | "loading" | "success" | "error";

// Conversation types
export interface Conversation {
    id: string;
    title: string;
    createdAt: string;
    updatedAt?: string;
    lastMessage?: string;
    lastMessageRole?: "user" | "assistant";
    messageCount: number;
}

export interface CreateConversationRequest {
    userId: string;
    title?: string;
}

export interface UpdateConversationRequest {
    title: string;
    userId: string;
}

// Message types
export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: string;
    tokensUsed?: number;
}

export interface SendMessageRequest {
    conversationId: string;
    userMessage: string;
    userId: string;
}

export interface SendMessageResponse {
    userMessageId: string;
    aiMessageId: string;
    aiResponse: string;
    timestamp: string;
    tokensUsed?: number;
}

// Stream chunk types
export interface StreamChunk {
    chunk?: string;
    done?: boolean;
    full_text?: string;
    error?: string;
    confidence?: string;
    intent?: string;
}

// Dashboard types
export interface ForecastDay {
    day: string;
    temp: number;
    icon: string;
}

export interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    uvIndex: number;
    rainProbability: number;
    forecast: ForecastDay[];
}

export interface PriceItem {
    id: string;
    name: string;
    icon: string;
    price: number;
    change: number;
    changePercent: number;
    trend: number[];
}

export interface StatusChip {
    id: string;
    label: string;
    value: string;
    status: "good" | "warning" | "danger";
    icon: string;
}

export interface TimelineItem {
    id: string;
    type: "opportunity" | "weather" | "insight" | "warning" | "harvest";
    title: string;
    message: string;
    time: string;
    actionable?: boolean;
}

export interface InsightData {
    title: string;
    subtitle: string;
    value: string;
    unit: string;
    trend?: { value: number; isPositive: boolean };
    gradient: string;
}

export interface QuickStats {
    hectares: number;
    activeCrops: number;
    harvestsSoon: number;
}

export interface DashboardData {
    weather: WeatherData;
    prices: PriceItem[];
    statusChips: StatusChip[];
    timeline: TimelineItem[];
    insights: InsightData[];
    quickStats: QuickStats;
}

export interface Location {
    name: string;
    lat: number;
    lon: number;
}

// Admin types
export interface Crop {
    id: string;
    category_id?: string;
    name: string;
    name_hindi?: string;
    icon: string;
    unit: string;
    msp_price?: number;
    msp_year?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    category?: { name: string; icon?: string };
}

export interface CropPrice {
    id: string;
    crop_id: string;
    price: number;
    price_type: string;
    market_name?: string;
    state?: string;
    district?: string;
    recorded_at: string;
    source: string;
    created_at: string;
    crop?: { name: string; icon: string };
}

export interface Insight {
    id: string;
    type_id?: string;
    title: string;
    message: string;
    is_actionable: boolean;
    action_url?: string;
    priority: number;
    target_states?: string[];
    target_crops?: string[];
    publish_at?: string;
    expires_at?: string;
    is_published: boolean;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    insight_type?: { name: string; icon?: string; color?: string };
}

export interface AdminStats {
    total_crops: number;
    total_prices: number;
    total_insights: number;
    published_insights: number;
}
