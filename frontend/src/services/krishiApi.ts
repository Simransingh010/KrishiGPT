/**
 * KrishiGPT API Service
 * Handles communication with KrishiGPT backend endpoints.
 */

import type {
    FarmContext,
    FormSchema,
    KrishiMessageResponse,
    KrishiStreamChunk,
    ToolResult,
} from "@/types/krishi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SendMessageParams {
    conversationId: string;
    userMessage: string;
    userId: string;
    context?: FarmContext;
    formData?: Record<string, unknown>;
}

/**
 * KrishiGPT API client.
 * Separates API calls from components (Rule 26: No API calls in JSX files).
 */
export const KrishiApiService = {
    /**
     * Send a message to KrishiGPT (non-streaming).
     */
    async sendMessage(params: SendMessageParams): Promise<KrishiMessageResponse> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: params.conversationId,
                userMessage: params.userMessage,
                userId: params.userId,
                context: params.context,
                formData: params.formData,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Send a message with streaming response.
     */
    async sendMessageStream(
        params: SendMessageParams,
        onChunk: (chunk: string) => void,
        onComplete: (result: { fullText: string; confidence?: string; intent?: string }) => void,
        onFormRequest: (form: FormSchema, message: string) => void,
        onError: (error: string) => void,
        signal?: AbortSignal
    ): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/send/stream`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: params.conversationId,
                userMessage: params.userMessage,
                userId: params.userId,
                context: params.context,
                formData: params.formData,
            }),
            signal,
        });

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        if (!response.body) {
            throw new Error("Response body is null");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = "";
        let completed = false;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data: KrishiStreamChunk = JSON.parse(line.slice(6));

                            // Handle error
                            if (data.error) {
                                onError(data.error);
                                completed = true;
                                return;
                            }

                            // Handle chunk
                            if (data.chunk) {
                                accumulatedText += data.chunk;
                                onChunk(data.chunk);
                            }

                            // Handle completion
                            if (data.done) {
                                completed = true;
                                onComplete({
                                    fullText: data.full_text || accumulatedText,
                                    confidence: data.confidence,
                                    intent: data.intent,
                                });
                                return;
                            }
                        } catch {
                            // Ignore parse errors for incomplete chunks
                        }
                    }
                }
            }

            // If stream ended without done flag, complete with accumulated text
            if (!completed && accumulatedText) {
                onComplete({ fullText: accumulatedText });
            }
        } finally {
            reader.releaseLock();
        }
    },

    /**
     * Get all available forms.
     */
    async getForms(): Promise<Record<string, FormSchema>> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/forms`);
        if (!response.ok) {
            throw new Error("Failed to fetch forms");
        }
        const data = await response.json();
        return data.forms;
    },

    /**
     * Get a specific form by ID.
     */
    async getForm(formId: string): Promise<FormSchema> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/forms/${formId}`);
        if (!response.ok) {
            throw new Error(`Form not found: ${formId}`);
        }
        return response.json();
    },

    /**
     * Execute a KrishiMCP tool.
     */
    async executeTool(
        toolName: string,
        context: FarmContext,
        params: Record<string, unknown> = {}
    ): Promise<ToolResult> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/tools/execute`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                toolName,
                context,
                params,
            }),
        });

        if (!response.ok) {
            throw new Error(`Tool execution failed: ${response.statusText}`);
        }

        return response.json();
    },

    /**
     * Get list of available tools.
     */
    async getAvailableTools(): Promise<string[]> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/tools`);
        if (!response.ok) {
            throw new Error("Failed to fetch tools");
        }
        const data = await response.json();
        return data.tools;
    },

    /**
     * Update conversation context.
     */
    async updateContext(
        conversationId: string,
        userId: string,
        context: FarmContext
    ): Promise<{ success: boolean; context: FarmContext }> {
        const response = await fetch(`${API_BASE_URL}/api/krishi/context/update`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId,
                userId,
                context,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to update context");
        }

        return response.json();
    },
};
