// Test what endpoint is actually being selected for strategic queries
const fs = require('fs');

// Mock ConfigurationManager to test endpoint selection
class ConfigurationManager {
  getEndpointConfigurations() {
    return [
      {
        id: '/analyze',
        keywords: ['analyze', 'analysis', 'show', 'find', 'identify', 'display']
      },
      {
        id: '/competitive-analysis', 
        keywords: ['competitive', 'competition', 'compete', 'brand', 'nike', 'adidas', 'market share', 'versus', 'vs']
      },
      {
        id: '/strategic-analysis',
        keywords: ['strategic', 'strategy', 'expansion', 'opportunity', 'potential', 'growth']
      },
      {
        id: '/spatial-clusters',
        keywords: ['cluster', 'clustering', 'similar', 'spatial', 'geographic', 'region', 'area']
      }
    ];
  }
}

// Test endpoint selection logic
function selectEndpoint(query) {
  const configManager = new ConfigurationManager();
  const lowerQuery = query.toLowerCase();
  const endpoints = configManager.getEndpointConfigurations();
  
  let bestMatch = { endpoint: '/analyze', score: 0 };
  
  console.log(`\nTesting query: "${query}"`);
  console.log('Keyword matching:');
  
  for (const config of endpoints) {
    let score = 0;
    const matchedKeywords = [];
    
    for (const keyword of config.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    
    if (config.keywords.some(keyword => lowerQuery === keyword.toLowerCase())) {
      score += 2;
    }
    
    console.log(`  ${config.id}: score=${score} (matched: ${matchedKeywords.join(', ')})`);
    
    if (score > bestMatch.score) {
      bestMatch = { endpoint: config.id, score };
    }
  }
  
  console.log(`→ Selected: ${bestMatch.endpoint}`);
  return bestMatch.endpoint;
}

// Check what data each endpoint actually has
function checkEndpointData(endpoint) {
  const filename = endpoint.substring(1) + '.json';
  const filepath = `public/data/endpoints/${filename}`;
  
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    const firstRecord = data.results[0];
    
    console.log(`\n${endpoint} data check:`);
    console.log(`  Records: ${data.results.length}`);
    console.log(`  First record strategic_value_score: ${firstRecord.strategic_value_score}`);
    console.log(`  First record value: ${firstRecord.value}`);
    console.log(`  First record opportunity_score: ${firstRecord.opportunity_score}`);
    
    // Check if all records have the same strategic_value_score
    const scores = data.results.slice(0, 5).map(r => r.strategic_value_score);
    const uniqueScores = [...new Set(scores)];
    
    if (uniqueScores.length === 1) {
      console.log(`  🚨 PROBLEM: All top 5 records have same strategic_value_score: ${uniqueScores[0]}`);
    } else {
      console.log(`  ✅ Good: Top 5 records have different scores: ${scores.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Failed to load ${filepath}: ${error.message}`);
  }
}

console.log('=== Testing Real Endpoint Routing ===');

// Test the problematic query
const query = "Show me the top strategic markets for Nike expansion";
const selectedEndpoint = selectEndpoint(query);

// Check what data this endpoint actually has
checkEndpointData(selectedEndpoint);

// Also check the strategic-analysis endpoint to see if its data is correct
if (selectedEndpoint !== '/strategic-analysis') {
  console.log('\nAlso checking /strategic-analysis endpoint:');
  checkEndpointData('/strategic-analysis');
}