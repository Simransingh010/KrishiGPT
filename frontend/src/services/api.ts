/**
 * API Service
 * Rule 26: No API calls in JSX files. Services fetch.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";

export interface StreamChunk {
  chunk?: string;
  done?: boolean;
  full_text?: string;
  error?: string;
}

export class ApiService {
  /**
   * Stream AI response for a question
   */
  static async askQuestion(
    question: string,
    signal: AbortSignal,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    await apiClient.stream(
      API_ENDPOINTS.ASK,
      { question },
      { onChunk, onComplete, onError },
      { signal }
    );
  }
}

