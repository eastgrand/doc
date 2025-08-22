// Chat service to handle API requests outside of React component context
// This prevents Fast Refresh issues with fetch operations

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  featureData: import('@/types/geospatial-chat').ProcessedLayerResult[];
  persona: string;
}

export interface ChatResponse {
  content: string;
}

export async function sendChatMessage(request: ChatRequest, options?: { signal?: AbortSignal }): Promise<ChatResponse> {
  console.log('[ChatService] Preparing compact chat payload');
  const { buildClaudePayload } = await import('@/utils/chat/build-claude-payload');
  const payload = buildClaudePayload(request);

  const response = await fetch('/api/claude/generate-response', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: options?.signal
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[ChatService] API Error Response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log('[ChatService] Chat response received successfully');
  
  return result;
}