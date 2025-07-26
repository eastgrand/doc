#!/usr/bin/env node

/**
 * Test Strategic Analysis Claude API Call
 * Directly test the Claude API to see if it's working
 */

const fetch = require('node-fetch');

async function testStrategicClaudeAPI() {
  console.log('🎯 TESTING STRATEGIC ANALYSIS CLAUDE API');
  console.log('=' + '='.repeat(60));
  
  // Create test payload similar to what the app sends
  const testPayload = {
    messages: [
      {
        role: 'user',
        content: 'Show me the top strategic markets for Nike expansion'
      }
    ],
    metadata: {
      query: 'Show me the top strategic markets for Nike expansion',
      analysisType: 'strategic_analysis',
      relevantLayers: ['analysis-result'],
      primaryField: 'Strategic Value Score',
      endpoint: '/strategic-analysis',
      targetVariable: 'strategic_value_score',
      analysisEndpoint: '/strategic-analysis',
      scoreType: 'strategic_value_score'
    },
    featureData: [
      {
        layerId: 'analysis-result',
        layerName: 'Analysis Results',
        layerType: 'polygon',
        features: [
          {
            properties: {
              area_name: 'Edison, NJ',
              area_id: '08837',
              target_value: 79.34,
              analysis_score: 79.34,
              rank: 1,
              strategic_value_score: 79.34,
              nike_market_share: 17.7
            }
          },
          {
            properties: {
              area_name: 'Newark, NJ', 
              area_id: '07001',
              target_value: 78.5,
              analysis_score: 78.5,
              rank: 2,
              strategic_value_score: 78.5,
              nike_market_share: 15.2
            }
          },
          {
            properties: {
              area_name: 'Jersey City, NJ',
              area_id: '07302', 
              target_value: 77.1,
              analysis_score: 77.1,
              rank: 3,
              strategic_value_score: 77.1,
              nike_market_share: 18.9
            }
          }
        ]
      }
    ]
  };
  
  console.log('\n📤 SENDING TEST PAYLOAD...');
  console.log('URL: http://localhost:3001/api/claude/generate-response');
  console.log('Payload preview:', {
    messageContent: testPayload.messages[0].content,
    analysisType: testPayload.metadata.analysisType,
    featureCount: testPayload.featureData[0].features.length,
    sampleFeature: testPayload.featureData[0].features[0].properties
  });
  
  try {
    const response = await fetch('http://localhost:3001/api/claude/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('\n📡 RESPONSE STATUS:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('\n✅ CLAUDE API SUCCESS:');
      console.log('Response keys:', Object.keys(result));
      
      if (result.content) {
        console.log('Content length:', result.content.length);
        console.log('Content preview (first 200 chars):');
        console.log(result.content.substring(0, 200) + '...');
        
        // Check if it's a canned response
        if (result.content.includes('Analysis Complete:') || 
            result.content.includes('Data Points:') ||
            result.content.includes('cached records analyzed')) {
          console.log('\n❌ DETECTED CANNED RESPONSE!');
          console.log('This looks like the abbreviated summary, not real Claude analysis');
        } else {
          console.log('\n✅ LOOKS LIKE REAL CLAUDE ANALYSIS!');
          console.log('Content appears to be genuine Claude response');
        }
      } else {
        console.log('\n⚠️ NO CONTENT in response');
        console.log('Full response:', result);
      }
    } else {
      console.log('\n❌ CLAUDE API FAILED');
      const errorText = await response.text();
      console.log('Error status:', response.status);
      console.log('Error text:', errorText.substring(0, 500));
    }
  } catch (error) {
    console.log('\n💥 REQUEST FAILED');
    console.error('Error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testStrategicClaudeAPI().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 STRATEGIC CLAUDE API TEST COMPLETE');
  });
}

module.exports = { testStrategicClaudeAPI };