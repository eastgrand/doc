// Test the actual data flow that would happen for strategic analysis
const fs = require('fs');

// Simulate what happens when user asks "Show me the top strategic markets for Nike expansion"

console.log('=== Testing Current Strategic Analysis Flow ===\n');

// 1. Query routing
function selectEndpoint(query) {
  const configs = [
    { id: '/analyze', keywords: ['analyze', 'analysis', 'show', 'find', 'identify', 'display'] },
    { id: '/competitive-analysis', keywords: ['competitive', 'competition', 'compete', 'brand', 'nike', 'adidas', 'market share', 'versus', 'vs'] },
    { id: '/strategic-analysis', keywords: ['strategic', 'strategy', 'expansion', 'opportunity', 'potential', 'growth'] },
    { id: '/spatial-clusters', keywords: ['cluster', 'clustering', 'similar', 'spatial', 'geographic', 'region', 'area'] }
  ];
  
  const lowerQuery = query.toLowerCase();
  let bestMatch = { endpoint: '/analyze', score: 0 };
  
  for (const config of configs) {
    let score = 0;
    for (const keyword of config.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { endpoint: config.id, score };
    }
  }
  
  return bestMatch.endpoint;
}

const query = "Show me the top strategic markets for Nike expansion";
const endpoint = selectEndpoint(query);
console.log(`Query: "${query}"`);
console.log(`Selected endpoint: ${endpoint}`);

// 2. Load data from selected endpoint
const filename = endpoint.substring(1) + '.json';
const filepath = `public/data/endpoints/${filename}`;

try {
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  
  console.log(`\nLoaded data from: ${filepath}`);
  console.log(`Records: ${data.results.length}`);
  
  // 3. Check what fields are available for processing
  const firstRecord = data.results[0];
  console.log('\nAvailable fields in first record:');
  console.log('- strategic_value_score:', firstRecord.strategic_value_score);
  console.log('- competitive_advantage_score:', firstRecord.competitive_advantage_score); 
  console.log('- cluster_performance_score:', firstRecord.cluster_performance_score);
  console.log('- opportunity_score:', firstRecord.opportunity_score);
  console.log('- value:', firstRecord.value);
  
  // 4. Show what the processor would return
  console.log('\nTop 5 records after processing:');
  data.results.slice(0, 5).forEach((record, i) => {
    const strategicScore = record.strategic_value_score;
    console.log(`${i+1}. ${record.DESCRIPTION}: strategic_value_score=${strategicScore}`);
  });
  
  // 5. Check if the endpoint has different data than expected
  if (endpoint === '/analyze') {
    console.log('\n🚨 POTENTIAL ISSUE: Query routed to /analyze instead of /strategic-analysis');
    console.log('This might explain why scores are wrong - checking /strategic-analysis data:');
    
    try {
      const strategicData = JSON.parse(fs.readFileSync('public/data/endpoints/strategic-analysis.json', 'utf8'));
      console.log('\nStrategic analysis endpoint data:');
      strategicData.results.slice(0, 3).forEach((record, i) => {
        console.log(`${i+1}. ${record.DESCRIPTION}: strategic_value_score=${record.strategic_value_score}`);
      });
    } catch (e) {
      console.log('Could not load strategic-analysis.json');
    }
  }
  
} catch (error) {
  console.log(`Failed to load ${filepath}: ${error.message}`);
}