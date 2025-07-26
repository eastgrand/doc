// Test the complete data flow from endpoint to Claude API
const fs = require('fs');

console.log('=== Testing Complete Data Flow ===\n');

// 1. Test what data the AnalysisEngine would actually process
function simulateAnalysisEngine() {
  console.log('1. AnalysisEngine Processing:');
  
  // Load strategic analysis data
  const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  
  // Simulate what StrategicAnalysisProcessor would do
  const processedRecords = data.results.slice(0, 5).map((record, index) => {
    const primaryScore = Number(record.strategic_value_score);
    
    return {
      area_id: record.ID,
      area_name: record.DESCRIPTION,
      value: Math.round(primaryScore * 100) / 100,  // This is what processor does
      rank: index + 1,
      properties: {
        ...record,
        strategic_value_score: primaryScore,
        score_source: 'strategic_value_score'
      }
    };
  });
  
  console.log('Processed records (what would be sent to Claude):');
  processedRecords.forEach((record, i) => {
    console.log(`${i+1}. ${record.area_name}: value=${record.value}, properties.strategic_value_score=${record.properties.strategic_value_score}`);
  });
  
  return processedRecords;
}

// 2. Test what would be in the Claude API request
function simulateClaudeRequest(processedRecords) {
  console.log('\n2. Claude API Request Data:');
  
  // This simulates what gets sent to Claude in the featureData
  const featureData = {
    type: 'strategic_analysis',
    records: processedRecords,
    summary: 'Strategic analysis summary...',
    targetVariable: 'strategic_value_score'
  };
  
  console.log('Data structure sent to Claude:');
  console.log('- Type:', featureData.type);
  console.log('- Records count:', featureData.records.length);
  console.log('- Target variable:', featureData.targetVariable);
  
  console.log('\nFirst 3 records in Claude request:');
  featureData.records.slice(0, 3).forEach((record, i) => {
    console.log(`${i+1}. ${record.area_name}: value=${record.value}`);
  });
  
  return featureData;
}

// 3. Check if there are any data transformation issues
function checkDataTransformations() {
  console.log('\n3. Data Transformation Check:');
  
  const rawData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  const firstRecord = rawData.results[0];
  
  console.log('Raw data:', firstRecord.strategic_value_score);
  console.log('After Number():', Number(firstRecord.strategic_value_score));
  console.log('After Math.round(x * 100) / 100:', Math.round(Number(firstRecord.strategic_value_score) * 100) / 100);
  
  // Check if there's precision loss
  const originalValues = rawData.results.slice(0, 5).map(r => r.strategic_value_score);
  const processedValues = originalValues.map(v => Math.round(Number(v) * 100) / 100);
  
  console.log('\nPrecision comparison:');
  originalValues.forEach((orig, i) => {
    const processed = processedValues[i];
    const changed = orig !== processed;
    console.log(`${i+1}. ${orig} -> ${processed} ${changed ? '⚠️ CHANGED' : '✅'}`);
  });
}

// 4. Test if the issue is in how Claude interprets the data
function testClaudeDataInterpretation(featureData) {
  console.log('\n4. Claude Data Interpretation Test:');
  
  // Simulate what Claude might see when processing the data
  const claudeDataString = JSON.stringify(featureData, null, 2);
  
  console.log('Size of data sent to Claude:', claudeDataString.length, 'characters');
  
  // Check if all values look the same to Claude
  const valuesInString = featureData.records.map(r => r.value.toString());
  const uniqueStringValues = [...new Set(valuesInString)];
  
  console.log('Unique values as strings:', uniqueStringValues.slice(0, 10));
  
  if (uniqueStringValues.length === 1) {
    console.log('🚨 PROBLEM: All values appear identical as strings to Claude');
  } else {
    console.log('✅ Values are distinct as strings');
  }
}

// Run all tests
const processedRecords = simulateAnalysisEngine();
const featureData = simulateClaudeRequest(processedRecords);
checkDataTransformations();
testClaudeDataInterpretation(featureData);

console.log('\n=== Summary ===');
console.log('If values are distinct in steps 1-3 but Claude still shows 79.3,');
console.log('the issue is likely in:');
console.log('- Claude prompt interpretation');
console.log('- Data caching in the UI');
console.log('- Wrong processor being used despite routing');