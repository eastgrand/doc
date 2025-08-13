// Test strategic analysis to debug AI prompt issues
async function testStrategicAnalysis() {
  console.log('🧪 Testing Strategic Analysis Query...\n');
  
  // Simulate the request that would be sent to the API
  const testRequest = {
    messages: [
      {
        role: 'user',
        content: 'Show me strategic expansion opportunities in NYC'
      }
    ],
    metadata: {
      query: 'Show me strategic expansion opportunities in NYC',
      analysisType: 'strategic_analysis',
      relevantLayers: ['unified_data_v3'],
      spatialFilterIds: ['36047', '36061', '36081', '36085', '36005'], // Sample NYC ZIP codes
      filterType: 'selection',
      rankingContext: {
        queryType: 'top',
        requestedCount: 10,
        totalFeatures: 100
      }
    },
    featureData: [
      {
        layerId: 'unified_data_v3',
        layerName: 'Strategic Analysis Results',
        features: [
          {
            properties: {
              geoid: '10001',
              area_name: '10001',
              strategic_value_score: 79.34,
              market_gap: 65.2,
              nike_market_share: 22.6,
              demographic_opportunity_score: 82.1,
              total_population: 21102
            }
          },
          {
            properties: {
              geoid: '10002',
              area_name: '10002',
              strategic_value_score: 79.17,
              market_gap: 68.4,
              nike_market_share: 19.8,
              demographic_opportunity_score: 85.3,
              total_population: 81410
            }
          },
          {
            properties: {
              geoid: '10003',
              area_name: '10003',
              strategic_value_score: 76.89,
              market_gap: 62.1,
              nike_market_share: 25.4,
              demographic_opportunity_score: 79.5,
              total_population: 56024
            }
          }
        ]
      }
    ],
    persona: 'strategist'
  };

  console.log('📦 Request payload structure:');
  console.log('  - Messages:', testRequest.messages.length);
  console.log('  - Analysis type:', testRequest.metadata.analysisType);
  console.log('  - Spatial filter IDs:', testRequest.metadata.spatialFilterIds?.length || 0);
  console.log('  - Features provided:', testRequest.featureData[0].features.length);
  console.log('  - Persona:', testRequest.persona);
  
  console.log('\n📊 Sample data being sent:');
  testRequest.featureData[0].features.forEach(f => {
    console.log(`  - ${f.properties.area_name}: Score=${f.properties.strategic_value_score}, Gap=${f.properties.market_gap}%`);
  });

  console.log('\n🔍 Expected prompt components:');
  console.log('  1. Base system prompt (strategist persona)');
  console.log('  2. Anti-hallucination rules');
  console.log('  3. Field context (field interpretations)');
  console.log('  4. Strategic analysis technical context');
  console.log('  5. Ranking context (top 10 focus)');
  console.log('  6. Decimal precision requirements');
  console.log('  7. Model attribution requirements');

  console.log('\n📝 Expected response format:');
  console.log('  - Strategic opportunities section');
  console.log('  - Market analysis with precise scores (79.34, not 79.3)');
  console.log('  - Geographic focus on provided ZIP codes only');
  console.log('  - Model attribution at end');
  console.log('  - Structured sections, not single paragraph');

  // Make the actual API call
  try {
    console.log('\n🚀 Making API call to /api/claude/generate-response...');
    const response = await fetch('http://localhost:3000/api/claude/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testRequest)
    });

    if (!response.ok) {
      console.error('❌ API call failed:', response.status, response.statusText);
      const error = await response.text();
      console.error('Error details:', error);
      return;
    }

    const result = await response.json();
    console.log('\n✅ Response received!');
    console.log('Response content length:', result.content?.length || 0);
    
    // Analyze the response format
    const content = result.content || '';
    console.log('\n📋 Response format analysis:');
    console.log('  - Has sections:', content.includes('\n\n') ? '✅' : '❌');
    console.log('  - Has headers:', /^[A-Z][A-Z ]+:/m.test(content) ? '✅' : '❌');
    console.log('  - Has model attribution:', content.includes('Model Attribution') ? '✅' : '❌');
    console.log('  - Has bullet points:', (content.includes('•') || content.includes('-')) ? '✅' : '❌');
    console.log('  - Line count:', content.split('\n').length);
    console.log('  - Uses exact scores (79.34):', content.includes('79.34') ? '✅' : '❌');
    console.log('  - Uses rounded scores (79.3):', content.includes('79.3') ? '❌ (bad)' : '✅ (good)');
    
    console.log('\n📄 First 500 characters of response:');
    console.log(content.substring(0, 500));
    
    console.log('\n📄 Last 500 characters of response:');
    console.log(content.substring(content.length - 500));

  } catch (error) {
    console.error('❌ Error making API call:', error);
  }
}

// Run the test
testStrategicAnalysis();