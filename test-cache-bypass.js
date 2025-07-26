// Test if the issue is browser caching by simulating a fresh request
const fs = require('fs');
const crypto = require('crypto');

console.log('=== Testing Cache Bypass ===\n');

// Simulate what happens when the UI makes a fresh request
function simulateFreshRequest() {
  console.log('1. Simulating fresh UI request:');
  
  // Load current data
  const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  
  // Check if data has changed recently
  const stats = fs.statSync('./public/data/endpoints/strategic-analysis.json');
  console.log('Data file last modified:', stats.mtime);
  console.log('Data age (minutes):', Math.round((Date.now() - stats.mtime.getTime()) / 1000 / 60));
  
  // Create hash to detect changes
  const dataHash = crypto.createHash('md5').update(JSON.stringify(data.results.slice(0, 10))).digest('hex');
  console.log('Current data hash:', dataHash.substring(0, 8));
  
  return data;
}

// Test if the issue could be in how the analysis engine processes the data
function testAnalysisEngineFlow() {
  console.log('\n2. Testing AnalysisEngine flow:');
  
  const data = simulateFreshRequest();
  
  // Step 1: CachedEndpointRouter loads data
  console.log('CachedEndpointRouter loads strategic-analysis.json');
  console.log('First record strategic_value_score:', data.results[0].strategic_value_score);
  
  // Step 2: DataProcessor.processResults() called with /strategic-analysis
  console.log('DataProcessor.processResults() called with endpoint: "/strategic-analysis"');
  
  // Step 3: StrategicAnalysisProcessor.process() called
  console.log('StrategicAnalysisProcessor.process() processes records');
  const processedRecord = {
    area_id: data.results[0].ID,
    area_name: data.results[0].DESCRIPTION,
    value: Math.round(Number(data.results[0].strategic_value_score) * 100) / 100,
    properties: {
      strategic_value_score: Number(data.results[0].strategic_value_score),
      score_source: 'strategic_value_score'
    }
  };
  console.log('Processed record value:', processedRecord.value);
  
  // Step 4: Data sent to Claude API
  console.log('Data sent to Claude API - record.value:', processedRecord.value);
  
  return processedRecord;
}

// Test what Claude might be doing with the data
function testClaudeInterpretation(processedRecord) {
  console.log('\n3. Testing Claude interpretation:');
  
  // Simulate Claude receiving the data
  const claudeData = {
    records: [processedRecord],
    type: 'strategic_analysis'
  };
  
  console.log('Claude receives data with value:', claudeData.records[0].value);
  console.log('Claude receives data with strategic_value_score:', claudeData.records[0].properties.strategic_value_score);
  
  // Check if Claude might be interpreting this differently
  const valueAsString = claudeData.records[0].value.toString();
  const rounded = Math.round(claudeData.records[0].value * 10) / 10;
  
  console.log('Value as string:', valueAsString);
  console.log('Rounded to 1 decimal:', rounded);
  
  if (rounded === 79.3) {
    console.log('🚨 FOUND ISSUE: Value rounds to 79.3 when rounded to 1 decimal place');
    return true;
  }
  
  return false;
}

// Run tests
const data = simulateFreshRequest();
const processedRecord = testAnalysisEngineFlow();
const isRoundingIssue = testClaudeInterpretation(processedRecord);

console.log('\n=== Conclusion ===');
if (isRoundingIssue) {
  console.log('🎯 ISSUE FOUND: Claude is rounding 79.34 -> 79.3 in its response');
  console.log('This is Claude choosing to round for readability, not a data issue');
  console.log('Solution: Modify the prompt to preserve precision or use different formatting');
} else {
  console.log('Data processing is correct. Issue must be:');
  console.log('- Browser cache not cleared');
  console.log('- UI using stale data');
  console.log('- API endpoint returning cached response');
}