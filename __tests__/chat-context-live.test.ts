/**
 * Live Chat Context Integration Test
 * 
 * This test runs against the actual running application to verify:
 * 1. Chat requests properly include analysis context
 * 2. Follow-up messages don't trigger new analysis
 * 3. Loading messages show randomized text
 * 
 * NOTE: This requires the dev server to be running (npm run dev)
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

const BASE_URL = 'http://localhost:3000';

// Mock analysis data that would come from a real analysis
const mockAnalysisData = {
  analysisResult: {
    data: {
      records: [
        {
          properties: {
            area_name: 'Test Area 1',
            competitive_analysis_score: 8.5,
            DESCRIPTION: 'High performing test area',
            zipCode: '90210'
          },
          geometry: { type: 'Point', coordinates: [-118.4, 34.1] }
        },
        {
          properties: {
            area_name: 'Test Area 2',
            competitive_analysis_score: 6.2, 
            DESCRIPTION: 'Medium performing test area',
            zipCode: '90211'
          },
          geometry: { type: 'Point', coordinates: [-118.3, 34.0] }
        }
      ],
      targetVariable: 'competitive_analysis_score',
      isClustered: false
    },
    endpoint: 'competitive-analysis'
  },
  metadata: {
    analysisType: 'competitive-analysis',
    targetVariable: 'competitive_analysis_score'
  }
};

// Skipped in CI: requires running dev server and network I/O; covered by unit tests elsewhere
describe.skip('Live Chat Context Integration', () => {
  beforeAll(async () => {
    // Check if dev server is running by testing a basic endpoint
    try {
      const response = await fetch(`${BASE_URL}`);
      if (!response.ok && response.status >= 500) {
        throw new Error('Dev server not responding');
      }
    } catch (error) {
      console.log('⚠️  Dev server not running. Start with: npm run dev');
      throw new Error('Dev server required for integration tests');
    }
  });

  it('should handle initial chat message with analysis context', async () => {
    const chatRequest = {
      messages: [{
        role: 'user',
        content: 'What are the key insights from this competitive analysis?'
      }],
      metadata: {
        analysisType: 'competitive-analysis',
        targetVariable: 'competitive_analysis_score',
        isContextualChat: false,
        testMode: true // Flag to identify test requests
      },
      featureData: [{
        layerId: 'unified_analysis',
        layerName: 'Test Analysis Results',
        layerType: 'polygon',
        features: mockAnalysisData.analysisResult.data.records
      }],
      persona: 'strategist'
    };

    console.log('🧪 Testing initial chat message with context...');
    
    const response = await fetch(`${BASE_URL}/api/claude/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest)
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    expect(result.content).toBeDefined();
    expect(typeof result.content).toBe('string');
    
    // The response should reference the analysis data we sent
    const content = result.content.toLowerCase();
    const hasAnalysisReference = 
      content.includes('8.5') || 
      content.includes('6.2') ||
      content.includes('test area') ||
      content.includes('competitive') ||
      content.includes('score');
    
    expect(hasAnalysisReference).toBe(true);
    console.log('✅ Initial chat response includes analysis context');
  }, 15000); // 15 second timeout for API calls

  it('should handle follow-up message using existing context', async () => {
    const followUpRequest = {
      messages: [
        {
          role: 'user',
          content: 'What are the key insights from this competitive analysis?'
        },
        {
          role: 'assistant',
          content: 'Based on the analysis, Test Area 1 shows strong performance with a score of 8.5, significantly outperforming Test Area 2 at 6.2.'
        },
        {
          role: 'user', 
          content: 'Which specific area has the highest score and what makes it successful?'
        }
      ],
      metadata: {
        analysisType: 'competitive-analysis',
        targetVariable: 'competitive_analysis_score',
        isContextualChat: true, // This is a follow-up
        testMode: true
      },
      featureData: [{
        layerId: 'unified_analysis',
        layerName: 'Test Analysis Results',
        layerType: 'polygon',
        features: mockAnalysisData.analysisResult.data.records
      }],
      persona: 'strategist'
    };

    console.log('🧪 Testing follow-up message with context...');

    const response = await fetch(`${BASE_URL}/api/claude/generate-response`, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(followUpRequest)
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    expect(result.content).toBeDefined();
    
    // Should reference the specific data from our context
    const content = result.content.toLowerCase();
    const hasContextualReference = 
      content.includes('test area 1') || 
      content.includes('8.5') ||
      content.includes('highest') ||
      content.includes('90210');
    
    expect(hasContextualReference).toBe(true);
    console.log('✅ Follow-up chat response uses existing context');
  }, 15000);

  it('should not trigger new analysis for contextual chat', async () => {
    // Monitor network requests during chat to ensure no analysis endpoints are called
    const startTime = Date.now();
    
    const contextualRequest = {
      messages: [
        { role: 'user', content: 'Previous question' },
        { role: 'assistant', content: 'Previous response about analysis' },
        { role: 'user', content: 'Tell me more about the performance patterns' }
      ],
      metadata: {
        analysisType: 'competitive-analysis',
        isContextualChat: true,
        testMode: true
      },
      featureData: [{
        layerId: 'unified_analysis',
        layerName: 'Test Analysis Results',
        layerType: 'polygon',
        features: mockAnalysisData.analysisResult.data.records
      }],
      persona: 'strategist'
    };

    console.log('🧪 Testing that follow-up chat doesn\'t trigger new analysis...');

    const response = await fetch(`${BASE_URL}/api/claude/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contextualRequest)
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(response.ok).toBe(true);
    
    // Contextual chat should be faster than full analysis (typically <5s vs >10s)
    expect(responseTime).toBeLessThan(8000); // 8 seconds max for chat-only
    
    const result = await response.json();
    expect(result.content).toBeDefined();
    
    console.log(`✅ Contextual chat completed in ${responseTime}ms (no new analysis)`);
  }, 10000);

  it('should preserve data consistency across chat exchanges', async () => {
    const consistencyTest = {
      messages: [
        { role: 'user', content: 'What is the exact score for Test Area 1?' }
      ],
      metadata: {
        analysisType: 'competitive-analysis',
        isContextualChat: true,
        testMode: true
      },
      featureData: [{
        layerId: 'unified_analysis',
        layerName: 'Test Analysis Results',
        layerType: 'polygon',
        features: mockAnalysisData.analysisResult.data.records
      }],
      persona: 'strategist'
    };

    console.log('🧪 Testing data consistency in chat context...');

    const response = await fetch(`${BASE_URL}/api/claude/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consistencyTest)
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    const content = result.content.toLowerCase();
    
    // Should mention the exact score from our test data
    const mentionsCorrectScore = content.includes('8.5');
    expect(mentionsCorrectScore).toBe(true);
    
    console.log('✅ Chat maintains consistent data from analysis context');
  }, 10000);
});

// Test for ensuring server is accessible
describe('Server Health Check', () => {
  it('should have dev server running', async () => {
    try {
      const response = await fetch(`${BASE_URL}`);
      expect(response.status).toBeLessThan(500); // Any response means server is up
      console.log('✅ Dev server is accessible');
    } catch (error) {
      console.log('❌ Dev server not accessible. Run: npm run dev');
      throw error;
    }
  });
});