// Test AnalysisEngine directly without going through Claude API
const axios = require('axios');

async function testAnalysisDirectly() {
  console.log('=== Testing AnalysisEngine Directly ===\n');
  
  const queries = [
    "Show me the top strategic markets for Nike expansion",
    "analyze nike markets",
    "competitive analysis of nike and adidas",
    "identify spatial clusters for nike"
  ];
  
  for (const query of queries) {
    console.log(`\nTesting query: "${query}"`);
    
    try {
      // Call the analysis endpoint directly
      const response = await axios.post('http://localhost:3002/api/analyze', {
        query: query,
        bounds: { north: 40.9, south: 40.4, east: -73.7, west: -74.3 }
      });
      
      console.log(`✅ Analysis successful!`);
      console.log(`- Endpoint: ${response.data.endpoint}`);
      console.log(`- Type: ${response.data.type}`);
      console.log(`- Records: ${response.data.data?.records?.length || 0}`);
      
      if (response.data.data?.records?.length > 0) {
        const topRecords = response.data.data.records.slice(0, 3);
        console.log(`- Top 3 areas:`);
        topRecords.forEach((record, idx) => {
          console.log(`  ${idx + 1}. ${record.area_name}: ${record.value.toFixed(2)}`);
        });
      }
      
      if (response.data.data?.summary) {
        const preview = response.data.data.summary.substring(0, 150) + '...';
        console.log(`- Summary: ${preview}`);
      }
      
    } catch (error) {
      console.log(`❌ Analysis failed: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log(`- Details: ${JSON.stringify(error.response.data.details)}`);
      }
    }
  }
}

testAnalysisDirectly().catch(console.error);