/**
 * useDashboard Hook
 * Fetches and manages dashboard data with geolocation support
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { DashboardApiService, DashboardData, Location } from "@/services/dashboardApi";

type DashboardStatus = "idle" | "loading" | "success" | "error";

interface UseDashboardReturn {
    data: DashboardData | null;
    status: DashboardStatus;
    error: string | null;
    location: Location;
    setLocation: (location: Location) => void;
    refresh: () => void;
}

const DEFAULT_LOCATION: Location = {
    name: "Ludhiana, Punjab",
    lat: 30.9,
    lon: 75.85,
};

async function detectLocation(): Promise<Location> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(DEFAULT_LOCATION);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const name = await DashboardApiService.reverseGeocode(latitude, longitude);
                    resolve({ lat: latitude, lon: longitude, name });
                } catch {
                    resolve({ lat: latitude, lon: longitude, name: "Your Location" });
                }
            },
            () => {
                // Denied or failed - use default
                resolve(DEFAULT_LOCATION);
            },
            { timeout: 8000, enableHighAccuracy: false }
        );
    });
}

export function useDashboard(): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [status, setStatus] = useState<DashboardStatus>("loading");
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<Location>(DEFAULT_LOCATION);
    const initialized = useRef(false);

    // Initialize: detect location then fetch dashboard
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        (async () => {
            setStatus("loading");
            try {
                const detectedLocation = await detectLocation();
                setLocation(detectedLocation);

                const result = await DashboardApiService.getDashboard(
                    detectedLocation.lat,
                    detectedLocation.lon,
                    detectedLocation.name
                );
                setData(result);
                setStatus("success");
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to load dashboard";
                setError(message);
                setStatus("error");
            }
        })();
    }, []);

    const fetchDashboard = useCallback(async (loc: Location) => {
        setStatus("loading");
        setError(null);

        try {
            const result = await DashboardApiService.getDashboard(loc.lat, loc.lon, loc.name);
            setData(result);
            setStatus("success");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load dashboard";
            setError(message);
            setStatus("error");
        }
    }, []);

    // Refetch when location changes (after initial load)
    const handleSetLocation = useCallback((newLocation: Location) => {
        setLocation(newLocation);
        fetchDashboard(newLocation);
    }, [fetchDashboard]);

    const refresh = useCallback(() => {
        fetchDashboard(location);
    }, [fetchDashboard, location]);

    return {
        data,
        status,
        error,
        location,
        setLocation: handleSetLocation,
        refresh,
    };
}
