// Test UI query functionality
const axios = require('axios');

async function testUIQuery() {
  console.log('=== Testing UI Query Functionality ===\n');
  
  const queries = [
    "Show me the top strategic markets for Nike expansion",
    "analyze nike markets",
    "competitive analysis of nike and adidas",
    "identify spatial clusters for nike"
  ];
  
  for (const query of queries) {
    console.log(`\nTesting query: "${query}"`);
    
    try {
      const response = await axios.post('http://localhost:3002/api/claude/generate-response', {
        messages: [{
          role: 'user',
          content: query
        }],
        context: {
          mapBounds: { north: 40.9, south: 40.4, east: -73.7, west: -74.3 }
        }
      });
      
      console.log(`✅ Query successful!`);
      console.log(`- Response type: ${response.data.type}`);
      console.log(`- Endpoint used: ${response.data.endpoint || 'unknown'}`);
      
      if (response.data.visualization) {
        console.log(`- Visualization: ${response.data.visualization.type}`);
        console.log(`- Data points: ${response.data.visualization.data?.length || 0}`);
      }
      
      if (response.data.analysis) {
        const preview = response.data.analysis.substring(0, 100) + '...';
        console.log(`- Analysis preview: ${preview}`);
      }
      
    } catch (error) {
      console.log(`❌ Query failed: ${error.response?.data?.error || error.message}`);
      if (error.response?.data?.details) {
        console.log(`- Details: ${error.response.data.details}`);
      }
    }
  }
}

testUIQuery().catch(console.error);