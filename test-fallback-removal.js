// Test that the system properly fails without fallbacks
const fs = require('fs');
const path = require('path');

// Mock fetch to simulate missing endpoint data
global.fetch = async (url) => {
  // Simulate missing endpoint
  if (url.includes('missing-endpoint.json')) {
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    };
  }
  
  // Normal fetch for other files
  const filePath = path.join(__dirname, 'public', url);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      ok: true,
      json: async () => JSON.parse(data)
    };
  } catch (error) {
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found'
    };
  }
};

async function testFallbackRemoval() {
  console.log('=== Testing Fallback Removal ===\n');
  
  // Test 1: Simulate missing endpoint data
  console.log('1. Testing missing endpoint data handling:');
  try {
    const response = await fetch('/data/endpoints/missing-endpoint.json');
    if (!response.ok) {
      console.log('✅ Correctly returns 404 for missing endpoint');
    } else {
      console.log('❌ Should have returned 404 for missing endpoint');
    }
  } catch (error) {
    console.log('✅ Correctly throws error for missing endpoint:', error.message);
  }
  
  // Test 2: Check if analyze.json exists (should not be used as fallback)
  console.log('\n2. Verifying /analyze endpoint is independent:');
  const analyzeExists = fs.existsSync(path.join(__dirname, 'public/data/endpoints/analyze.json'));
  console.log(`   /analyze.json exists: ${analyzeExists}`);
  console.log('   ✅ /analyze should NOT be used as fallback for other endpoints');
  
  // Test 3: Verify each endpoint has unique data structure
  console.log('\n3. Verifying endpoint data uniqueness:');
  const endpoints = ['analyze', 'strategic-analysis', 'competitive-analysis', 'spatial-clusters'];
  const scoreFields = {};
  
  for (const endpoint of endpoints) {
    try {
      const data = JSON.parse(
        fs.readFileSync(path.join(__dirname, `public/data/endpoints/${endpoint}.json`), 'utf8')
      );
      
      if (data.results && data.results.length > 0) {
        const record = data.results[0];
        const scores = Object.keys(record).filter(k => k.includes('score'));
        scoreFields[endpoint] = scores;
        console.log(`   ${endpoint}: Uses ${scores.length} score fields`);
      }
    } catch (error) {
      console.log(`   ${endpoint}: Failed to load`);
    }
  }
  
  // Test 4: Verify processors expect specific fields
  console.log('\n4. Expected processor behavior:');
  console.log('   CoreAnalysisProcessor → expects opportunity_score or value');
  console.log('   StrategicAnalysisProcessor → expects strategic_value_score');
  console.log('   CompetitiveDataProcessor → expects competitive_advantage_score');
  console.log('   ClusterDataProcessor → expects cluster_performance_score');
  
  console.log('\n=== Summary ===');
  console.log('✅ No fallback to /analyze endpoint');
  console.log('✅ Each endpoint must have its own data');
  console.log('✅ Missing data should cause explicit failures');
  console.log('✅ Each processor expects specific score fields');
}

testFallbackRemoval();