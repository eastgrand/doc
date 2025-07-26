// Test the complete data flow
const fs = require('fs');
const path = require('path');

async function simulateDataFlow() {
  console.log('=== Testing Complete Data Flow ===\n');
  
  // Step 1: Check endpoint files exist
  console.log('1. Checking endpoint files...');
  const endpointDir = path.join(__dirname, 'public/data/endpoints');
  const endpoints = ['analyze', 'competitive-analysis', 'spatial-clusters', 'strategic-analysis'];
  
  for (const endpoint of endpoints) {
    const filePath = path.join(endpointDir, `${endpoint}.json`);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`✅ ${endpoint}.json: ${(stats.size / 1024 / 1024).toFixed(2)}MB, ${data.results?.length || 0} records, success: ${data.success}`);
    } else {
      console.log(`❌ ${endpoint}.json: NOT FOUND`);
    }
  }
  
  // Step 2: Simulate what CachedEndpointRouter does
  console.log('\n2. Simulating CachedEndpointRouter...');
  const analyzeData = JSON.parse(fs.readFileSync(path.join(endpointDir, 'analyze.json'), 'utf8'));
  console.log(`- Loaded analyze.json`);
  console.log(`- Success: ${analyzeData.success}`);
  console.log(`- Results: ${analyzeData.results?.length || 0}`);
  console.log(`- Top-level keys: ${Object.keys(analyzeData).join(', ')}`);
  
  // Step 3: Check what CoreAnalysisProcessor expects
  console.log('\n3. Checking data structure for CoreAnalysisProcessor...');
  if (analyzeData.results && analyzeData.results.length > 0) {
    const firstRecord = analyzeData.results[0];
    console.log('First record keys:', Object.keys(firstRecord).slice(0, 10).join(', '), '...');
    
    // Check for required fields
    const hasAreaId = !!(firstRecord.area_id || firstRecord.id || firstRecord.ID);
    const hasValue = !!(firstRecord.value || firstRecord.score || firstRecord.opportunity_score);
    console.log(`- Has area ID: ${hasAreaId}`);
    console.log(`- Has value/score: ${hasValue}`);
    
    // Check what scores are available
    const scoreFields = Object.keys(firstRecord).filter(k => k.includes('score'));
    console.log(`- Score fields: ${scoreFields.join(', ')}`);
  }
  
  // Step 4: Simulate processing
  console.log('\n4. Simulating data processing...');
  if (analyzeData.results && analyzeData.results.length > 0) {
    const record = analyzeData.results[0];
    const processedRecord = {
      area_id: record.area_id || record.id || record.ID || 'unknown',
      area_name: record.area_name || record.DESCRIPTION || 'Unknown',
      value: record.opportunity_score || record.competitive_advantage_score || record.strategic_value_score || 0,
      rank: 1,
      properties: {}
    };
    console.log('Processed record:', processedRecord);
  }
  
  // Step 5: Check the actual file being loaded in browser
  console.log('\n5. Testing HTTP access...');
  const http = require('http');
  
  const testUrl = 'http://localhost:3000/data/endpoints/analyze.json';
  http.get(testUrl, (res) => {
    console.log(`- HTTP Status: ${res.statusCode}`);
    console.log(`- Content-Type: ${res.headers['content-type']}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log(`- HTTP Response: ${json.results?.length || 0} records, success: ${json.success}`);
      } catch (e) {
        console.log(`- HTTP Response parse error: ${e.message}`);
        console.log(`- Response preview: ${data.substring(0, 100)}...`);
      }
    });
  }).on('error', (err) => {
    console.log(`- HTTP Error: ${err.message}`);
  });
}

simulateDataFlow().catch(console.error);