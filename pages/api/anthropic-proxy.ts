// pages/api/anthropic-proxy.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get API key from environment variables
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  
  // Get model from environment or use safe default
  const model = process.env.CLAUDE_MODEL || process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-3-haiku-20240307';

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    // Clean up and validate messages
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    
    if (messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is empty or missing' });
    }

    // Create complete request body for Anthropic API
    const requestBody = {
      model,
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: "You are a JSON-only AI assistant. Always provide responses as valid JSON exactly as specified by the user's request."
        },
        ...messages
      ],
      temperature: 0.2
    };

    // Make the actual request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': apiKey
      },
      body: JSON.stringify(requestBody)
    });

    // Handle API response
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ 
        error: `Anthropic API error: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }

    // Return successful response
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error: any) {
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}