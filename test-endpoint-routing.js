// Test which endpoints the enabled chat-constants queries route to
const { EnhancedQueryAnalyzer } = require('./lib/analysis/EnhancedQueryAnalyzer.ts');

const ENABLED_QUERIES = {
  'Strategic Analysis': 'Show me the top strategic markets for H&R Block tax service expansion',
  'Comparative Analysis': 'Compare H&R Block usage between Alachua County and Miami-Dade County', 
  'Competitive Analysis': 'Show me the market share difference between H&R Block and TurboTax',
  'Demographic Insights': 'Which areas have the best customer demographics for tax preparation services?'
};

const analyzer = new EnhancedQueryAnalyzer();

console.log('=== Testing Endpoint Routing for Enabled Chat Constants ===\n');

for (const [categoryName, query] of Object.entries(ENABLED_QUERIES)) {
  console.log(`Category: ${categoryName}`);
  console.log(`Query: "${query}"`);
  
  try {
    const bestEndpoint = analyzer.getBestEndpoint(query);
    const scores = analyzer.analyzeQuery(query);
    
    console.log(`Best Endpoint: ${bestEndpoint}`);
    console.log(`Top 3 Scored Endpoints:`);
    scores.slice(0, 3).forEach((score, index) => {
      console.log(`  ${index + 1}. ${score.endpoint} (${score.score.toFixed(2)}) - ${score.reasons.join(', ')}`);
    });
    
    // Check if corresponding JSON file exists
    const endpointKey = bestEndpoint.replace('/', '');
    const filePath = `/Users/voldeck/code/mpiq-ai-chat/public/data/endpoints/${endpointKey}.json`;
    const fs = require('fs');
    const fileExists = fs.existsSync(filePath);
    console.log(`JSON file exists: ${fileExists ? '✅' : '❌'} (${filePath})`);
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('---\n');
}