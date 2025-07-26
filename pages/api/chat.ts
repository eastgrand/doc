import type { NextApiRequest, NextApiResponse } from 'next';
import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from '@/lib/analytics/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ChatRequest {
  question: string;
  previousAnalysis: AnalysisResult;
  conversationHistory: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<string | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, previousAnalysis, conversationHistory }: ChatRequest = req.body;

  if (!question || !previousAnalysis) {
    return res.status(400).json({ error: 'A question and previous analysis are required.' });
  }

  try {
    const systemPrompt = `You are an expert data analyst AI. Your role is to answer follow-up questions about a previous analysis. You will be given the user's question, the full JSON data from the previous analysis (including summary, feature importance, and results), and the recent conversation history.

**Your Task:**
1.  **Answer the User's Question:** Directly address the user's follow-up question using the provided data.
2.  **Stay Focused:** Base your analysis STRICTLY on the variables from the user's original query, which can be inferred from the conversation history. If the previous analysis mentioned a related but un-requested variable, gently guide the conversation back to the core query.
3.  **Be Quantitative:** Use the 'feature_importance' data to answer questions about correlation and impact. For example, an importance score of > 0.15 on a variable suggests a notable positive influence.
4.  **Provide Data-Driven Answers:** Do not just repeat the summary. Synthesize information from the 'summary', 'feature_importance', and 'results' to provide a comprehensive, data-driven response.
5.  **Be Concise:** Keep your answers clear and to the point.

**Example Interaction:**
-   *Initial Query Context:* "Which areas have highest diversity and conversion rate?"
-   *Previous Analysis Summary:* "Areas with high Filipino population (importance: 0.25) have high conversion rates."
-   *User's Follow-up Question:* "is there a positive or negative correlation?"
-   *Your Ideal Response:* "Yes, there is a strong positive correlation. The feature importance score for the Filipino population is 0.25, indicating that as this population increases, so does the mortgage conversion rate in the analyzed areas."

**DATA PAYLOAD:**
-   **Conversation History:** ${conversationHistory}
-   **Previous Analysis JSON:** ${JSON.stringify(previousAnalysis, null, 2)}
`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620', // Using the most advanced model
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
      temperature: 0.1, // Lower temperature for more focused, factual answers
    });

    const answer = response.content[0].type === 'text' ? response.content[0].text : "I couldn't generate a response based on the previous analysis.";
    res.status(200).send(answer);

  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'Failed to generate chat response.' });
  }
} 