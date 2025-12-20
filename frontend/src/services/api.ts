const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface StreamChunk {
  chunk?: string;
  done?: boolean;
  full_text?: string;
  error?: string;
}

export class ApiService {
  private static async handleStream(
    response: Response,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (!response.body) {
      throw new Error("Response body is null");
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
              const data: StreamChunk = JSON.parse(line.slice(6));

              if (data.error) {
                onError(data.error);
                return;
              }

              if (data.chunk) {
                accumulatedText += data.chunk;
                onChunk(data.chunk);
              }

              if (data.done) {
                onComplete(data.full_text || accumulatedText);
                return;
              }
            } catch (parseError) {
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  static async askQuestion(
    question: string,
    signal: AbortSignal,
    onChunk: (chunk: string) => void,
    onComplete: (fullText: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to get response: ${response.statusText}`);
    }

    await this.handleStream(response, onChunk, onComplete, onError);
  }
}

