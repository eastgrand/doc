#!/usr/bin/env node

/**
 * Runtime API Test
 * Tests the actual API behavior after restart
 */

async function testAPI() {
  console.log('🌐 RUNTIME API TEST');
  console.log('=' .repeat(60));
  
  const baseUrl = 'http://localhost:3000';
  
  // First, let's check if the server is running
  try {
    const healthCheck = await fetch(baseUrl);
    console.log(`✓ Server is running (status: ${healthCheck.status})`);
  } catch (error) {
    console.log('❌ Server not accessible. Make sure Next.js dev server is running.');
    return;
  }
  
  // Test queries
  const testCases = [
    {
      name: 'Strategic Analysis',
      query: 'Show me the top strategic markets for Nike expansion',
      expectedField: 'strategic_value_score',
      expectedType: 'strategic'
    },
    {
      name: 'Competitive Analysis',
      query: "Compare Nike's market position against competitors",
      expectedField: 'competitive_advantage_score', 
      expectedType: 'competitive'
    }
  ];
  
  for (const testCase of testCases) {
    console.log(`\n\n📊 Testing: ${testCase.name}`);
    console.log('─'.repeat(40));
    console.log(`Query: "${testCase.query}"`);
    
    try {
      const response = await fetch(`${baseUrl}/api/claude/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: testCase.query
            }
          ],
          metadata: {
            query: testCase.query,
            includeDebug: true // Request debug info if available
          }
        })
      });
      
      const responseText = await response.text();
      console.log(`\nResponse status: ${response.status}`);
      
      if (!response.ok) {
        console.log('❌ API Error:');
        console.log(responseText.substring(0, 500));
        continue;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.log('❌ Failed to parse response as JSON');
        console.log('Response preview:', responseText.substring(0, 200));
        continue;
      }
      
      // Analyze the response
      console.log('\n📋 Response Analysis:');
      
      // Check if content exists
      if (!data.content) {
        console.log('❌ No content in response');
        continue;
      }
      
      const content = Array.isArray(data.content) ? data.content[0]?.text || '' : data.content;
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      
      // Check for key indicators
      console.log(`- Response length: ${contentStr.length} characters`);
      
      // Check for field references
      const hasExpectedField = contentStr.includes(testCase.expectedField);
      const hasScoreReferences = contentStr.includes('score') || contentStr.includes('Score');
      const hasMarketShare = contentStr.includes('market share') || contentStr.includes('17.7%');
      
      console.log(`- Contains ${testCase.expectedField}: ${hasExpectedField}`);
      console.log(`- Contains score references: ${hasScoreReferences}`);
      console.log(`- Contains market share references: ${hasMarketShare}`);
      
      // Check for specific issues
      if (testCase.expectedType === 'competitive' && hasMarketShare && !hasExpectedField) {
        console.log('⚠️  WARNING: Using market share instead of competitive scores!');
      }
      
      if (testCase.expectedType === 'strategic') {
        const has79_3 = contentStr.includes('79.3');
        const has79_34 = contentStr.includes('79.34');
        console.log(`- Contains 79.3 (bug indicator): ${has79_3}`);
        console.log(`- Contains 79.34 (correct value): ${has79_34}`);
      }
      
      // Extract any scores mentioned
      const scoreMatches = contentStr.match(/\d+\.\d+/g);
      if (scoreMatches) {
        console.log(`- Numeric values found: ${scoreMatches.slice(0, 10).join(', ')}${scoreMatches.length > 10 ? '...' : ''}`);
      }
      
      // Check metadata if available
      if (data.metadata) {
        console.log('\n📊 Metadata:');
        console.log(`- Analysis type: ${data.metadata.analysisType}`);
        console.log(`- Primary field: ${data.metadata.primaryField}`);
        console.log(`- Endpoint used: ${data.metadata.endpoint}`);
      }
      
      // Check for layer information
      if (data.layersUsed) {
        console.log('\n🗺️ Layers:');
        data.layersUsed.forEach(layer => {
          console.log(`- ${layer.name}: ${layer.featureCount} features`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
      console.log('Stack:', error.stack);
    }
  }
  
  console.log('\n\n✅ Runtime API test complete');
}

// Run the test
testAPI().catch(console.error);