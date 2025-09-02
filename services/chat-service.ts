// Chat service to handle API requests outside of React component context
// This prevents Fast Refresh issues with fetch operations

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  // Minimal client-side layer shape to avoid heavy ArcGIS types in the browser
  featureData: Array<{
    layerId: string;
    layerName: string;
    layerType?: string;
    field?: string;
    // Features should be plain objects shaped like { properties: Record<string, any> }
    features: Array<{ properties: Record<string, unknown> }>;
  }>;
  persona: string;
}

export interface ChatResponse {
  content: string;
}

export async function sendChatMessage(request: ChatRequest, options?: { signal?: AbortSignal }): Promise<ChatResponse> {
  console.log('[ChatService] Preparing compact chat payload');
  const { buildClaudePayload } = await import('@/utils/chat/build-claude-payload');
  const payload = buildClaudePayload(request);

  // Detect housing queries and route to housing-specific API
  const lastMessage = request.messages[request.messages.length - 1];
  const query = lastMessage?.content || '';
  const isHousingQuery = /\b(housing|real estate|property|home|residential|mortgage|rent|owner|tenant|dwelling)\b/i.test(query);
  
  const apiEndpoint = isHousingQuery ? '/api/claude/housing-generate-response' : '/api/claude/generate-response';
  console.log(`[ChatService] Routing to ${apiEndpoint} for query: "${query.substring(0, 50)}..."`);

  const response = await fetch(apiEndpoint, {
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