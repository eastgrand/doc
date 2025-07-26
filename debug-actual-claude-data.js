// Debug what's actually being sent to Claude in the real application
const axios = require('axios');

async function debugActualClaudeData() {
  console.log('=== Debugging Actual Claude Data ===\n');
  
  try {
    // Make a real request to the application (not the API directly)
    // This will go through the full AnalysisEngine flow
    
    console.log('Making request to trigger full analysis flow...');
    
    // We need to simulate what the UI does - make a request that triggers the analysis
    // The easiest way is to call the Claude API but look at the server logs
    
    console.log('Check the server logs in /tmp/next-restart.log for the actual data being sent to Claude');
    console.log('Look for lines that show:');
    console.log('  - "target_value:"');  
    console.log('  - "strategic_value_score:"');
    console.log('  - The actual values being passed');
    
    // Let's examine what happens in a real strategic analysis
    const testResponse = await axios.post('http://localhost:3000/api/claude/generate-response', {
      messages: [{
        role: 'user', 
        content: 'Show me the top strategic markets for Nike expansion'
      }],
      featureData: [{
        features: [
          // Simulate what the UI would send based on our analysis
          {
            properties: {
              area_name: "11234 (Brooklyn)",
              area_id: "11234", 
              target_value: 79.34,  // This should be different for each
              strategic_value_score: 79.34,
              analysis_endpoint: "/strategic-analysis"
            }
          },
          {
            properties: {
              area_name: "11385 (Ridgewood)",
              area_id: "11385",
              target_value: 79.17,  // This should be different 
              strategic_value_score: 79.17,
              analysis_endpoint: "/strategic-analysis"
            }
          },
          {
            properties: {
              area_name: "10314 (Staten Island)", 
              area_id: "10314",
              target_value: 79.12,  // This should be different
              strategic_value_score: 79.12,
              analysis_endpoint: "/strategic-analysis"
            }
          }
        ],
        fields: ['strategic_value_score'],
        geometryType: 'polygon'
      }]
    });
    
    if (testResponse.data.content) {
      console.log('\nResponse received. Checking for score mentions...');
      
      const content = testResponse.data.content;
      
      // Extract all numeric values that look like scores
      const allNumbers = content.match(/\b\d+\.?\d*\b/g);
      if (allNumbers) {
        console.log('All numbers found in response:', allNumbers);
        
        // Look specifically for scores around 79
        const scoresNear79 = allNumbers.filter(num => {
          const val = parseFloat(num);
          return val >= 78 && val <= 80;
        });
        
        console.log('Scores near 79:', scoresNear79);
        
        if (scoresNear79.length > 0) {
          const uniqueScores = [...new Set(scoresNear79)];
          if (uniqueScores.length === 1) {
            console.log(`\n🚨 PROBLEM CONFIRMED: All scores show as ${uniqueScores[0]}`);
            console.log('This means the SAME VALUE is being sent for all records');
          } else {
            console.log(`\n✅ Different scores detected: ${uniqueScores.join(', ')}`);
          }
        }
      }
      
      console.log('\nFirst 300 chars of response:');
      console.log(content.substring(0, 300));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugActualClaudeData();