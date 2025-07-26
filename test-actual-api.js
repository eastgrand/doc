#!/usr/bin/env node

/**
 * Direct API Test - Actually call the running server to see what's happening
 */

const fetch = require('node-fetch');

async function testActualAPI() {
  console.log('🔍 TESTING ACTUAL RUNNING API');
  console.log('=' .repeat(60));
  
  try {
    // Test strategic analysis
    console.log('\n📊 TESTING STRATEGIC ANALYSIS');
    const strategicResponse = await fetch('http://localhost:3000/api/claude/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Show me the top strategic markets for Nike expansion'
          }
        ],
        metadata: {
          query: 'Show me the top strategic markets for Nike expansion'
        },
        featureData: [
          {
            layerId: 'test',
            layerName: 'Test Layer',
            features: [
              {
                properties: {
                  area_name: 'Test Area 1',
                  strategic_value_score: 79.34,
                  value_MP30034A_B_P: 17.7,
                  target_value: 79.34
                }
              },
              {
                properties: {
                  area_name: 'Test Area 2', 
                  strategic_value_score: 78.5,
                  value_MP30034A_B_P: 15.2,
                  target_value: 78.5
                }
              }
            ]
          }
        ]
      })
    });
    
    if (!strategicResponse.ok) {
      console.log(`❌ Strategic API Error: ${strategicResponse.status}`);
      const errorText = await strategicResponse.text();
      console.log('Error response:', errorText.substring(0, 500));
    } else {
      const strategicData = await strategicResponse.json();
      console.log('✅ Strategic Response received');
      console.log('Response keys:', Object.keys(strategicData));
      
      if (strategicData.content) {
        const content = strategicData.content;
        console.log('Content length:', content.length);
        
        // Look for strategic scores
        const has79 = content.includes('79');
        const has78 = content.includes('78');
        const hasStrategic = content.includes('strategic');
        const hasMarketShare = content.includes('17.7') || content.includes('market share');
        
        console.log('- Contains 79 values:', has79);
        console.log('- Contains 78 values:', has78);
        console.log('- Contains "strategic":', hasStrategic);
        console.log('- Contains market share refs:', hasMarketShare);
        
        if (hasMarketShare && !has79) {
          console.log('⚠️  WARNING: Still using market share instead of strategic scores!');
        }
        
        // Show first 300 chars
        console.log('\nContent preview:');
        console.log(content.substring(0, 300) + '...');
      }
    }
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
  }
}

// Run the test
if (require.main === module) {
  testActualAPI();
}

module.exports = { testActualAPI };