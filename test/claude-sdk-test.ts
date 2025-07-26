// Explicitly load .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import Anthropic from '@anthropic-ai/sdk';

// Add logs to confirm script execution and environment setup
console.log('Starting Claude API SDK test script...');
const apiKey = process.env.ANTHROPIC_API_KEY;

console.log('Environment variables:', {
  ANTHROPIC_API_KEY: apiKey ? 'Present' : 'Missing',
});

if (!apiKey) {
  console.error('CRITICAL: ANTHROPIC_API_KEY is not set in environment variables');
  process.exit(1);
}

// Log initialization of the Claude API SDK
console.log('Initializing Claude API SDK with provided API key...');
const anthropic = new Anthropic({
  apiKey,
});

async function testClaudeAPI() {
  const systemPrompt = `You are an expert in geospatial data analysis. Respond in JSON format.`;
  const query = 'Show the distribution of median age across different areas';

  // Add logs before sending the request
  console.log('Preparing to send request to Claude API with query:', query);

  try {
    console.log('Sending request to Claude API...');
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.1,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: query,
        },
      ],
    });

    // Add logs after sending the request
    console.log('Claude API request sent. Awaiting response...');
    console.log('Claude API response:', {
      responseType: typeof response,
      responseKeys: Object.keys(response),
      responseContent: response.content ? response.content.slice(0, 200) : 'No content',
    });
  } catch (error) {
    console.error('Error calling Claude API:', error);
  }
}

testClaudeAPI();
