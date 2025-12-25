/**
 * API Client
 * Centralized HTTP client with error handling, retries, and request deduplication.
 * Rule 26: No API calls in JSX files. Services fetch.
 */

import { API_BASE_URL, REQUEST_CONFIG } from "./constants";

// Types
export interface ApiError {
    code: string;
    message: string;
    status: number;
    details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
    data: T;
    status: number;
}

export type RequestStatus = "idle" | "loading" | "success" | "error";

// Request deduplication cache
const pendingRequests = new Map<string, Promise<Response>>();

// Error class
export class ApiClientError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = "ApiClientError";
    }

    toJSON(): ApiError {
        return {
            code: this.code,
            message: this.message,
            status: this.status,
            details: this.details,
        };
    }
}

// Generate cache key for request deduplication
function getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || "GET";
    const body = options?.body ? String(options.body) : "";
    return `${method}:${url}:${body}`;
}

// Parse error response
async function parseErrorResponse(response: Response): Promise<ApiClientError> {
    let errorData: Record<string, unknown> = {};

    try {
        const text = await response.text();
        if (text) {
            errorData = JSON.parse(text);
        }
    } catch {
        // Ignore parse errors
    }

    const message = (errorData.detail as string) ||
        (errorData.message as string) ||
        `Request failed with status ${response.status}`;

    const code = (errorData.code as string) || `HTTP_${response.status}`;

    return new ApiClientError(code, message, response.status, errorData);
}

// Sleep utility for retries
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Core fetch function with error handling and retries
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retries = REQUEST_CONFIG.RETRY_ATTEMPTS
): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });

            // Don't retry on client errors (4xx)
            if (response.status >= 400 && response.status < 500) {
                throw await parseErrorResponse(response);
            }

            // Retry on server errors (5xx)
            if (!response.ok) {
                throw await parseErrorResponse(response);
            }

            return response;
        } catch (error) {
            lastError = error as Error;

            // Don't retry on client errors or abort
            if (error instanceof ApiClientError && error.status < 500) {
                throw error;
            }

            if ((error as Error).name === "AbortError") {
                throw error;
            }

            // Wait before retry (exponential backoff)
            if (attempt < retries - 1) {
                await sleep(REQUEST_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
            }
        }
    }

    throw lastError || new Error("Request failed after retries");
}

/**
 * Deduplicated fetch - prevents duplicate concurrent requests
 */
async function deduplicatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    // Only deduplicate GET requests
    if (options.method && options.method !== "GET") {
        return fetchWithRetry(url, options);
    }

    const cacheKey = getCacheKey(url, options);

    // Return existing pending request if available
    const pending = pendingRequests.get(cacheKey);
    if (pending) {
        return pending.then(r => r.clone());
    }

    // Create new request
    const request = fetchWithRetry(url, options);
    pendingRequests.set(cacheKey, request);

    try {
        const response = await request;
        return response;
    } finally {
        pendingRequests.delete(cacheKey);
    }
}

/**
 * API Client with typed methods
 */
export const apiClient = {
    /**
     * GET request
     */
    async get<T>(
        endpoint: string,
        options: { signal?: AbortSignal; params?: Record<string, string> } = {}
    ): Promise<T> {
        let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        if (options.params) {
            const searchParams = new URLSearchParams(options.params);
            url += `?${searchParams.toString()}`;
        }

        const response = await deduplicatedFetch(url, {
            method: "GET",
            signal: options.signal,
        });

        return response.json();
    },

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        data?: unknown,
        options: { signal?: AbortSignal } = {}
    ): Promise<T> {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetchWithRetry(url, {
            method: "POST",
            body: data ? JSON.stringify(data) : undefined,
            signal: options.signal,
        });

        return response.json();
    },

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        data: unknown,
        options: { signal?: AbortSignal } = {}
    ): Promise<T> {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetchWithRetry(url, {
            method: "PATCH",
            body: JSON.stringify(data),
            signal: options.signal,
        });

        return response.json();
    },

    /**
     * DELETE request
     */
    async delete<T>(
        endpoint: string,
        data?: unknown,
        options: { signal?: AbortSignal } = {}
    ): Promise<T> {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetchWithRetry(url, {
            method: "DELETE",
            body: data ? JSON.stringify(data) : undefined,
            signal: options.signal,
        });

        return response.json();
    },

    /**
     * Streaming POST request
     */
    async stream(
        endpoint: string,
        data: unknown,
        callbacks: {
            onChunk: (chunk: string) => void;
            onComplete: (fullText: string) => void;
            onError: (error: string) => void;
        },
        options: { signal?: AbortSignal } = {}
    ): Promise<void> {
        const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            signal: options.signal,
        });

        if (!response.ok) {
            const error = await parseErrorResponse(response);
            callbacks.onError(error.message);
            return;
        }

        if (!response.body) {
            callbacks.onError("Response body is null");
            return;
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            if (data.error) {
                                callbacks.onError(data.error);
                                return;
                            }

                            if (data.chunk) {
                                accumulatedText += data.chunk;
                                callbacks.onChunk(data.chunk);
                            }

                            if (data.done) {
                                callbacks.onComplete(data.full_text || accumulatedText);
                                return;
                            }
                        } catch {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    },
};

export default apiClient;
