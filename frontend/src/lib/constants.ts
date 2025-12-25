/**
 * Application Constants
 * Centralized configuration to avoid hardcoded values scattered across the codebase.
 */

// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
    // Conversations
    CONVERSATIONS: `${API_BASE_URL}/api/conversations`,
    USER_CONVERSATIONS: (userId: string) => `${API_BASE_URL}/api/conversations/user/${userId}`,
    CONVERSATION: (id: string) => `${API_BASE_URL}/api/conversations/${id}`,
    CONVERSATION_MESSAGES: (id: string) => `${API_BASE_URL}/api/conversations/${id}/messages`,

    // Messages
    SEND_MESSAGE: `${API_BASE_URL}/api/messages/send`,
    SEND_MESSAGE_STREAM: `${API_BASE_URL}/api/messages/send-stream`,

    // KrishiGPT
    KRISHI_CHAT: `${API_BASE_URL}/api/krishi/chat`,
    KRISHI_CHAT_STREAM: `${API_BASE_URL}/api/krishi/chat-stream`,
    KRISHI_CONTEXT: `${API_BASE_URL}/api/krishi/context`,

    // Dashboard
    DASHBOARD: `${API_BASE_URL}/api/dashboard`,
    WEATHER: `${API_BASE_URL}/api/dashboard/weather`,
    PRICES: `${API_BASE_URL}/api/dashboard/prices`,
    LOCATIONS: `${API_BASE_URL}/api/dashboard/locations`,
    REVERSE_GEOCODE: `${API_BASE_URL}/api/dashboard/reverse-geocode`,

    // Admin
    ADMIN_CROPS: `${API_BASE_URL}/api/admin/crops`,
    ADMIN_PRICES: `${API_BASE_URL}/api/admin/prices`,
    ADMIN_INSIGHTS: `${API_BASE_URL}/api/admin/insights`,
    ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,

    // Legacy
    ASK: `${API_BASE_URL}/ask`,
    HEALTH: `${API_BASE_URL}/health`,
} as const;

// Request Configuration
export const REQUEST_CONFIG = {
    DEFAULT_TIMEOUT: 30000,
    STREAM_TIMEOUT: 60000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    MESSAGES_PER_PAGE: 50,
} as const;

// UI Constants
export const UI = {
    TOAST_DURATION: 5000,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200,
    MAX_MESSAGE_LENGTH: 4000,
    MAX_TITLE_LENGTH: 100,
} as const;

// Feature Flags
export const FEATURES = {
    ENABLE_STREAMING: true,
    ENABLE_VOICE_INPUT: false,
    ENABLE_IMAGE_UPLOAD: false,
    ENABLE_MULTI_LANGUAGE: false,
} as const;
