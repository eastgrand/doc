// Test that endpoints work independently without fallbacks
const fs = require('fs');
const path = require('path');

async function testEndpointIndependence() {
  console.log('=== Testing Endpoint Independence (No Fallbacks) ===\n');
  
  const endpoints = [
    { name: '/analyze', scoreField: 'opportunity_score' },
    { name: '/strategic-analysis', scoreField: 'strategic_value_score' },
    { name: '/competitive-analysis', scoreField: 'competitive_advantage_score' },
    { name: '/spatial-clusters', scoreField: 'cluster_performance_score' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\nTesting ${endpoint.name}:`);
    
    try {
      // Load the endpoint data
      const filename = endpoint.name.substring(1) + '.json';
      const filepath = path.join(__dirname, 'public/data/endpoints', filename);
      const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      
      console.log(`✅ File loaded: ${data.results?.length || 0} records`);
      console.log(`   Success flag: ${data.success}`);
      
      // Check for the specific score field
      if (data.results && data.results.length > 0) {
        const firstRecord = data.results[0];
        const scoreValue = firstRecord[endpoint.scoreField];
        
        console.log(`   ${endpoint.scoreField}: ${scoreValue}`);
        
        if (scoreValue === null || scoreValue === undefined) {
          console.log(`   ❌ WARNING: Score field is null/undefined!`);
        } else {
          console.log(`   ✅ Score field is populated`);
        }
        
        // Check how many records have the score field
        const recordsWithScore = data.results.filter(r => 
          r[endpoint.scoreField] !== null && r[endpoint.scoreField] !== undefined
        ).length;
        
        console.log(`   Records with ${endpoint.scoreField}: ${recordsWithScore}/${data.results.length}`);
        
        // Show score distribution
        const scores = data.results
          .map(r => r[endpoint.scoreField])
          .filter(s => s !== null && s !== undefined)
          .map(Number);
          
        if (scores.length > 0) {
          const min = Math.min(...scores);
          const max = Math.max(...scores);
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          console.log(`   Score range: ${min.toFixed(2)} - ${max.toFixed(2)}, avg: ${avg.toFixed(2)}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed to load ${endpoint.name}: ${error.message}`);
    }
  }
  
  console.log('\n=== Summary ===');
  console.log('Each endpoint should have its own specific score field populated.');
  console.log('No endpoint should rely on fallback data from /analyze.');
}

testEndpointIndependence();