import { NextApiRequest, NextApiResponse } from 'next';
import { Anthropic } from '@anthropic-ai/sdk';

// Simplified example of a message for context
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Convert messages to Claude format
    const conversationHistory = messages.map((msg: Message) => ({
      role: msg.role === 'system' ? 'assistant' : msg.role,
      content: msg.content
    }));

    // System prompt for Claude to summarize conversation context
    const systemPrompt = `You are an AI assistant that provides concise conversation summaries.

Your task is to summarize the key points and context of this geospatial data conversation in 2-3 sentences. Focus on:
- What type of analysis or data the user is exploring
- Key insights or patterns that were discovered  
- Any specific geographic areas or demographic factors mentioned
- The overall direction of the user's inquiry

Be conversational and capture the essence of what the user is trying to understand about their data.`;

    // Create Claude API request
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 150,
      temperature: 0.3,
      system: systemPrompt,
      messages: conversationHistory
    });

    // Extract the summary from Claude's response
    const summary = claudeResponse.content.find(block => block.type === 'text')?.text?.trim();

    if (!summary) {
      return res.status(500).json({ error: 'Failed to generate summary' });
    }

    return res.status(200).json({ summary });
  } catch (error) {
    console.error('Claude context summarization error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 