// Test the analysis system using Node.js
const fs = require('fs');
const path = require('path');

// Mock the browser fetch API
global.fetch = async (url) => {
  const filePath = path.join(__dirname, 'public', url);
  console.log(`[Mock Fetch] Loading ${filePath}`);
  
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

async function testAnalysisSystem() {
  console.log('=== Testing Analysis System ===\n');
  
  try {
    // Test 1: Load analyze.json directly
    console.log('1. Testing direct file load...');
    const analyzeData = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'public/data/endpoints/analyze.json'), 'utf8')
    );
    console.log(`✅ Loaded analyze.json: ${analyzeData.results?.length || 0} records`);
    console.log(`   Success flag: ${analyzeData.success}`);
    
    // Test 2: Check first record structure
    if (analyzeData.results && analyzeData.results.length > 0) {
      const firstRecord = analyzeData.results[0];
      console.log('\n2. First record structure:');
      console.log(`   ID: ${firstRecord.ID}`);
      console.log(`   Description: ${firstRecord.DESCRIPTION}`);
      console.log(`   opportunity_score: ${firstRecord.opportunity_score}`);
      console.log(`   value: ${firstRecord.value}`);
      console.log(`   competitive_advantage_score: ${firstRecord.competitive_advantage_score}`);
      
      // Check for null values
      const hasNullValue = firstRecord.value === null || firstRecord.value === undefined;
      const hasNullOpportunity = firstRecord.opportunity_score === null || firstRecord.opportunity_score === undefined;
      
      if (hasNullValue || hasNullOpportunity) {
        console.log(`   ❌ NULL VALUES DETECTED!`);
        console.log(`      value is null: ${hasNullValue}`);
        console.log(`      opportunity_score is null: ${hasNullOpportunity}`);
      } else {
        console.log(`   ✅ No null values in critical fields`);
      }
    }
    
    // Test 3: Check data distribution
    console.log('\n3. Data distribution check:');
    const values = analyzeData.results.map(r => r.value).filter(v => v !== null && v !== undefined);
    const opportunityScores = analyzeData.results.map(r => r.opportunity_score).filter(v => v !== null && v !== undefined);
    
    console.log(`   Valid values: ${values.length}/${analyzeData.results.length}`);
    console.log(`   Valid opportunity_scores: ${opportunityScores.length}/${analyzeData.results.length}`);
    
    if (values.length > 0) {
      const minValue = Math.min(...values);
      const maxValue = Math.max(...values);
      const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
      console.log(`   Value range: ${minValue.toFixed(2)} - ${maxValue.toFixed(2)}, avg: ${avgValue.toFixed(2)}`);
    }
    
    // Test 4: Check other endpoint files
    console.log('\n4. Checking other endpoints:');
    const endpoints = ['competitive-analysis', 'strategic-analysis', 'spatial-clusters'];
    
    for (const endpoint of endpoints) {
      try {
        const endpointData = JSON.parse(
          fs.readFileSync(path.join(__dirname, `public/data/endpoints/${endpoint}.json`), 'utf8')
        );
        console.log(`   ✅ ${endpoint}.json: ${endpointData.results?.length || 0} records, success: ${endpointData.success}`);
      } catch (error) {
        console.log(`   ❌ ${endpoint}.json: Failed to load`);
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAnalysisSystem();