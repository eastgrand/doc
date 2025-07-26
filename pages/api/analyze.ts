import { NextApiRequest, NextApiResponse } from 'next';
import { createDebugMiddleware } from '@/lib/middleware/debug-middleware';

// Configure body parser options
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb'
    }
  }
};

/**
 * Helper function to safely trim objects by limiting depth and removing circular references
 */
function trimObject(obj: any, maxDepth = 3): any {
  if (maxDepth === 0) return '[MaxDepth]';
  if (!obj || typeof obj !== 'object') return obj;
  
  const newObj: any = Array.isArray(obj) ? [] : {};
  let totalSize = 0;
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    
    // Skip large arrays
    if (Array.isArray(value) && value.length > 1000) {
      newObj[key] = `[Array with ${value.length} items]`;
      continue;
    }
    
    // Process based on type
    if (typeof value === 'object') {
      newObj[key] = trimObject(value, maxDepth - 1);
    } else {
      // Skip very large string values
      if (typeof value === 'string' && value.length > 5000) {
        newObj[key] = value.substring(0, 5000) + '... [truncated]';
        continue;
      }
      newObj[key] = value;
    }
    
    // Check running size
    totalSize += JSON.stringify(newObj[key]).length;
    if (totalSize > 3 * 1024 * 1024) {
      break;
    }
  }
  
  return newObj;
}

/**
 * Main handler function for analyzing fitness and gym-related data
 */
async function analyzeHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
) {
  // Validate request method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract and validate request body
    const { systemPrompt, data } = req.body;

    if (!systemPrompt) {
      return res.status(400).json({ error: 'Missing systemPrompt' });
    }

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Calculate input sizes for debugging
    const inputSize = new TextEncoder().encode(JSON.stringify(req.body)).length;

    // Trim data to prevent circular references and reduce size
    const trimmedData = trimObject(data);
    const trimmedSize = new TextEncoder().encode(JSON.stringify(trimmedData)).length;

    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: [{ 
          type: 'text', 
          text: `${systemPrompt}\n\nData: ${JSON.stringify(trimmedData)}` 
        }]
      }]
    };

    // Check final request size
    const requestSize = new TextEncoder().encode(JSON.stringify(requestBody)).length;
    if (requestSize > 100 * 1024) { // 100KB limit for Anthropic
      return res.status(413).json({ 
        error: 'Request too large for AI processing',
        details: {
          requestSize: Math.round(requestSize / 1024) + 'KB',
          limit: '100KB'
        }
      });
    }
    
    // Make request to Anthropic API
    const apiStartTime = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });
    const apiEndTime = Date.now();

    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: 'API request failed', 
        details: errorText,
        _debug: {
          apiRequestTime: apiEndTime - apiStartTime,
          requestSize: requestSize,
          errorResponseSize: new TextEncoder().encode(errorText).length
        }
      });
    }

    // Parse response
    const result = await response.json();

    // Validate response format
    if (!result.content || !Array.isArray(result.content) || !result.content[0]?.text) {
      return res.status(500).json({ 
        error: 'Invalid response format from AI service',
        _debug: {
          apiRequestTime: apiEndTime - apiStartTime,
          responseFormat: typeof result,
          hasContent: !!result.content,
          contentIsArray: Array.isArray(result.content),
          hasText: !!result.content?.[0]?.text
        }
      });
    }

    // Return successful response
    const responseData = {
      analysis: result.content[0].text,
      _debug: {
        apiRequestTime: apiEndTime - apiStartTime,
        requestSize: requestSize,
        responseSize: new TextEncoder().encode(result.content[0].text).length,
        totalProcessingTime: Date.now() - apiStartTime,
        dataSizes: {
          original: inputSize,
          trimmed: trimmedSize,
          final: requestSize
        }
      }
    };

    // Use the debug-enhanced response
    return (res as any).json(responseData);

  } catch (error) {
    // Log and handle any errors
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error',
      _debug: {
        errorType: error instanceof Error ? error.name : typeof error,
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Create and apply the debug middleware
const debugMiddleware = createDebugMiddleware();

// Export the wrapped handler
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return debugMiddleware(req, res, () => analyzeHandler(req, res, () => Promise.resolve()));
}