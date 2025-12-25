/**
 * Admin Hooks
 * Data fetching and mutations for admin panel
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
    AdminApiService,
    Crop,
    CropCreate,
    CropCategory,
    CropPrice,
    PriceCreate,
    Insight,
    InsightCreate,
    InsightType,
    AdminStats,
} from "@/services/adminApi";

type Status = "idle" | "loading" | "success" | "error";

// === Generic fetch hook ===
function useFetch<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);
    const fetcherRef = useRef(fetcher);

    // Keep fetcher ref updated without triggering re-renders
    fetcherRef.current = fetcher;

    const refetch = useCallback(async () => {
        setStatus("loading");
        setError(null);
        try {
            const result = await fetcherRef.current();
            setData(result);
            setStatus("success");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch");
            setStatus("error");
        }
    }, []);

    useEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, status, error, refetch };
}

// === Admin Stats ===
export function useAdminStats() {
    return useFetch<AdminStats>(() => AdminApiService.getStats(), []);
}

// === Categories ===
export function useCategories() {
    return useFetch<CropCategory[]>(() => AdminApiService.getCategories(), []);
}

// === Crops ===
export function useCrops(activeOnly = false) {
    const fetchCrops = useCallback(() => AdminApiService.getCrops(activeOnly), [activeOnly]);
    return useFetch<Crop[]>(fetchCrops, [activeOnly]);
}

export function useCropMutations(onSuccess?: () => void) {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);

    const create = async (data: CropCreate) => {
        setStatus("loading");
        try {
            await AdminApiService.createCrop(data);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create");
            setStatus("error");
            throw err;
        }
    };

    const update = async (id: string, data: Partial<CropCreate>) => {
        setStatus("loading");
        try {
            await AdminApiService.updateCrop(id, data);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update");
            setStatus("error");
            throw err;
        }
    };

    const remove = async (id: string) => {
        setStatus("loading");
        try {
            await AdminApiService.deleteCrop(id);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
            setStatus("error");
            throw err;
        }
    };

    return { create, update, remove, status, error };
}

// === Prices ===
export function usePrices(cropId?: string) {
    const fetchPrices = useCallback(() => AdminApiService.getPrices(cropId), [cropId]);
    return useFetch<CropPrice[]>(fetchPrices, [cropId]);
}

export function usePriceMutations(onSuccess?: () => void) {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);

    const create = async (data: PriceCreate) => {
        setStatus("loading");
        try {
            await AdminApiService.createPrice(data);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create");
            setStatus("error");
            throw err;
        }
    };

    const bulkCreate = async (prices: PriceCreate[]) => {
        setStatus("loading");
        try {
            const result = await AdminApiService.bulkCreatePrices(prices);
            setStatus("success");
            onSuccess?.();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to bulk create");
            setStatus("error");
            throw err;
        }
    };

    const remove = async (id: string) => {
        setStatus("loading");
        try {
            await AdminApiService.deletePrice(id);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
            setStatus("error");
            throw err;
        }
    };

    return { create, bulkCreate, remove, status, error };
}

// === Insight Types ===
export function useInsightTypes() {
    return useFetch<InsightType[]>(() => AdminApiService.getInsightTypes(), []);
}

// === Insights ===
export function useInsights(publishedOnly = false) {
    const fetchInsights = useCallback(
        () => AdminApiService.getInsights(publishedOnly),
        [publishedOnly]
    );
    return useFetch<Insight[]>(fetchInsights, [publishedOnly]);
}

export function useInsightMutations(onSuccess?: () => void) {
    const [status, setStatus] = useState<Status>("idle");
    const [error, setError] = useState<string | null>(null);

    const create = async (data: InsightCreate) => {
        setStatus("loading");
        try {
            const result = await AdminApiService.createInsight(data);
            setStatus("success");
            onSuccess?.();
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create");
            setStatus("error");
            throw err;
        }
    };

    const update = async (id: string, data: Partial<InsightCreate>) => {
        setStatus("loading");
        try {
            await AdminApiService.updateInsight(id, data);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update");
            setStatus("error");
            throw err;
        }
    };

    const remove = async (id: string) => {
        setStatus("loading");
        try {
            await AdminApiService.deleteInsight(id);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
            setStatus("error");
            throw err;
        }
    };

    const publish = async (id: string) => {
        setStatus("loading");
        try {
            await AdminApiService.publishInsight(id);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to publish");
            setStatus("error");
            throw err;
        }
    };

    const unpublish = async (id: string) => {
        setStatus("loading");
        try {
            await AdminApiService.unpublishInsight(id);
            setStatus("success");
            onSuccess?.();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to unpublish");
            setStatus("error");
            throw err;
        }
    };

    return { create, update, remove, publish, unpublish, status, error };
}
