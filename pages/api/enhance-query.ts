import type { NextApiRequest, NextApiResponse } from 'next';
import { ClaudeAIAnalysisService } from '@/lib/server/claude-service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt, context } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!prompt || !context || !apiKey) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const claudeService = new ClaudeAIAnalysisService(apiKey);
    const analysis = await claudeService.analyze({ prompt, context });
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error in enhance-query API route:', error);
    res.status(500).json({ error: 'Failed to enhance query' });
  }
} 