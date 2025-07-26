import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type QueryClassification = 'follow-up' | 'new-analysis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<QueryClassification | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { query, conversationHistory } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const systemPrompt = `You are a query classification expert. Your task is to determine if a user's query is a "follow-up" question about the most recent analysis or a request for a "new-analysis".

Consider these rules:
- A "follow-up" asks for clarification, detail, or a different perspective on the *existing* results (e.g., "why is that?", "what about in the east?", "is that a positive or negative correlation?").
- A "new-analysis" introduces new metrics, new locations, or a completely different topic (e.g., "show me income levels", "now correlate that with education", "what about trends for Nike?").
- If the conversation history is empty, it is always a "new-analysis".
- If the user's query is ambiguous, err on the side of "new-analysis".

Respond with ONLY "follow-up" or "new-analysis". Do not add any other text or explanation.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Conversation History:\n${conversationHistory || ''}\n\nUser Query: "${query}"`,
        },
      ],
      temperature: 0,
    });
    
    const textContent = response.content.find(block => block.type === 'text');
    const classification = textContent ? textContent.text.trim() : 'new-analysis';

    if (classification === 'follow-up') {
      res.status(200).json('follow-up');
    } else {
      res.status(200).json('new-analysis');
    }

  } catch (error) {
    console.error('Error classifying query:', error);
    res.status(500).json({ error: 'Error classifying query' });
  }
} 