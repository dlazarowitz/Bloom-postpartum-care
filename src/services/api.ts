/**
 * API service for communicating with the Bloom backend server.
 *
 * The backend proxies requests to Claude AI — the API key never
 * touches the mobile client.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context?: string;
}

export interface ChatResponse {
  message: string;
  usage?: { input_tokens: number; output_tokens: number };
}

/**
 * Send a chat message and receive a streamed response.
 *
 * Uses Server-Sent Events (SSE) to stream the response token by token
 * for responsive UX.
 */
export async function streamChat(
  request: ChatRequest,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      onError(errorData?.error || `Server error (${response.status})`);
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError('Streaming not supported');
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let doneReceived = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) {
              doneReceived = true;
              onDone();
            } else if (data.text) {
              onToken(data.text);
            }
          } catch {
            // Skip malformed SSE data
          }
        }
      }
    }

    if (!doneReceived) {
      onDone();
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Connection error');
  }
}

/**
 * Send a chat message and receive a complete (non-streamed) response.
 * Simpler but less responsive. Good for quick queries.
 */
export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat/simple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || `Server error (${response.status})`);
  }

  return response.json();
}

/**
 * Generate a grocery list for selected recipes at a specific store.
 */
export async function generateGroceryList(
  recipeIds: string[],
  storeId: string,
  servingsMultiplier?: number,
): Promise<{ storeId: string; generatedAt: string }> {
  const response = await fetch(`${API_BASE}/api/grocery/generate-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeIds, storeId, servingsMultiplier }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate grocery list');
  }

  return response.json();
}

/**
 * Get the store's online ordering URL for deep-linking.
 */
export async function getStoreLink(storeId: string): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE}/api/grocery/store-link/${storeId}`);

  if (!response.ok) {
    throw new Error('Failed to get store link');
  }

  return response.json();
}
