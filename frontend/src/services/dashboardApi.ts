/**
 * Dashboard API Service
 * Rule 26: No API calls in JSX files. Services fetch.
 */

import { API_ENDPOINTS } from "@/lib/constants";
import { apiClient } from "@/lib/api-client";
import type {
    DashboardData,
    WeatherData,
    PriceItem,
    Location
} from "@/types/api";

// Re-export types for convenience
export type {
    DashboardData,
    WeatherData,
    PriceItem,
    Location,
    ForecastDay,
    StatusChip,
    TimelineItem,
    InsightData,
    QuickStats,
} from "@/types/api";

export const DashboardApiService = {
    /**
     * Get complete dashboard data
     */
    async getDashboard(lat?: number, lon?: number, location?: string): Promise<DashboardData> {
        const params: Record<string, string> = {};
        if (lat !== undefined) params.lat = lat.toString();
        if (lon !== undefined) params.lon = lon.toString();
        if (location) params.location = location;

        return apiClient.get<DashboardData>(API_ENDPOINTS.DASHBOARD, { params });
    },

    /**
     * Get weather data for a location
     */
    async getWeather(lat: number, lon: number, location: string): Promise<WeatherData> {
        return apiClient.get<WeatherData>(API_ENDPOINTS.WEATHER, {
            params: {
                lat: lat.toString(),
                lon: lon.toString(),
                location,
            },
        });
    },

    /**
     * Get crop prices
     */
    async getPrices(crops?: string[]): Promise<PriceItem[]> {
        const params = crops?.length ? { crops: crops.join(",") } : undefined;
        return apiClient.get<PriceItem[]>(API_ENDPOINTS.PRICES, { params });
    },

    /**
     * Search for locations
     */
    async searchLocations(query: string): Promise<Location[]> {
        return apiClient.get<Location[]>(API_ENDPOINTS.LOCATIONS, {
            params: { q: query },
        });
    },

    /**
     * Get location name from coordinates
     */
    async reverseGeocode(lat: number, lon: number): Promise<string> {
        const data = await apiClient.get<{ name: string }>(API_ENDPOINTS.REVERSE_GEOCODE, {
            params: {
                lat: lat.toString(),
                lon: lon.toString(),
            },
        });
        return data.name;
    },
};
