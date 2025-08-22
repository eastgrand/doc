// Chat service to handle API requests outside of React component context
// This prevents Fast Refresh issues with fetch operations

export interface ChatRequest {
  messages: any[];
  metadata: any;
  featureData: any[];
  persona: string;
}

export interface ChatResponse {
  content: string;
}

export async function sendChatMessage(request: ChatRequest, options?: { signal?: AbortSignal }): Promise<ChatResponse> {
  console.log('[ChatService] Sending chat message to API using JSON format with all required data');
  
  // Chat needs the full context (analysis data, messages, dataset, persona) so we use JSON format
  // This ensures all parameters including persona are properly passed
  const response = await fetch('/api/claude/generate-response', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: request.messages,
      metadata: { 
        ...request.metadata, 
        isContextualChat: true, // Enable fast-path processing
        enableOptimization: true, // Enable payload optimization
        forceOptimization: true // Force optimization to prevent 413 errors
      },
      featureData: request.featureData && request.featureData.length > 0 
        ? request.featureData 
        : [{ // Provide minimal data structure if empty
            layerId: 'chat_context',
            layerName: 'Chat Context',
            layerType: 'polygon',
            features: [{
              properties: { area_name: 'Chat Session', context: 'interactive' },
              geometry: { type: 'Point', coordinates: [0, 0] }
            }]
          }],
      persona: request.persona
    }),
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