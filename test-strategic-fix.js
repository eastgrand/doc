// Test if the strategic analysis type fix is working
const axios = require('axios');

async function testStrategicAnalysisFix() {
  console.log('=== Testing Strategic Analysis Type Fix ===\n');
  
  try {
    // Test the strategic markets query
    const query = "Show me the top strategic markets for Nike expansion";
    console.log(`Testing query: "${query}"`);
    
    const response = await axios.post('http://localhost:3000/api/claude/generate-response', {
      messages: [{
        role: 'user',
        content: query
      }],
      featureData: [{
        features: [
          {
            properties: {
              area_name: "Test Area 1",
              area_id: "11234",
              target_value: 79.34,
              strategic_value_score: 79.34,
              analysis_endpoint: "/strategic-analysis"
            }
          },
          {
            properties: {
              area_name: "Test Area 2", 
              area_id: "11385",
              target_value: 79.17,
              strategic_value_score: 79.17,
              analysis_endpoint: "/strategic-analysis"
            }
          }
        ],
        fields: ['strategic_value_score'],
        geometryType: 'polygon'
      }],
      context: {
        mapBounds: { north: 40.9, south: 40.4, east: -73.7, west: -74.3 }
      }
    });
    
    if (response.data.content) {
      console.log('✅ Response received from Claude');
      
      // Check if the response contains different score values
      const content = response.data.content;
      
      // Look for score patterns
      const scoreMatches = content.match(/analysis score of (\d+\.?\d*)/gi);
      if (scoreMatches) {
        console.log('\n📊 Found score mentions:');
        scoreMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. ${match}`);
        });
        
        // Check if scores are unique
        const uniqueScores = [...new Set(scoreMatches)];
        if (uniqueScores.length > 1) {
          console.log('\n✅ SUCCESS: Different scores detected!');
          console.log(`   Found ${uniqueScores.length} unique scores: ${uniqueScores.join(', ')}`);
        } else {
          console.log('\n❌ STILL BROKEN: All scores are the same');
          console.log(`   All scores show as: ${uniqueScores[0]}`);
        }
      } else {
        console.log('\n⚠️  No score patterns found in response');
      }
      
      // Show first part of response
      console.log('\n📝 Response preview:');
      console.log(content.substring(0, 500) + '...');
      
    } else {
      console.log('❌ No content in response');
      console.log('Response:', response.data);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.error || error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

testStrategicAnalysisFix();