// Debug how properties are accessed in the UI
const fs = require('fs');
const path = require('path');

// Simulate the StrategicAnalysisProcessor output
function simulateProcessorOutput() {
  const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/endpoints/strategic-analysis.json'), 'utf8'));
  
  // This is what StrategicAnalysisProcessor.process() does
  const processedRecords = rawData.results.slice(0, 5).map((record, index) => {
    const primaryScore = Number(record.strategic_value_score);
    
    return {
      area_id: record.ID,
      area_name: record.DESCRIPTION,
      value: Math.round(primaryScore * 100) / 100,
      rank: index + 1,
      properties: {
        ...record,  // This spreads ALL the original record fields
        strategic_value_score: primaryScore
      }
    };
  });
  
  return {
    type: 'strategic_analysis',
    records: processedRecords
  };
}

// Simulate UI logic for calculating targetValue
function simulateUITargetValueLogic(result, dataType) {
  console.log(`\n🎯 Processing ${result.area_name}:`);
  console.log(`   dataType: ${dataType}`);
  console.log(`   result.value: ${result.value}`);
  console.log(`   result.properties?.strategic_value_score: ${result.properties?.strategic_value_score}`);
  console.log(`   result.strategic_value_score: ${result.strategic_value_score}`);
  
  let targetValue;
  
  if (dataType === 'strategic_analysis') {
    // This is the exact logic from the UI
    targetValue = result.properties?.strategic_value_score || 
                 result.strategic_value_score || 
                 result.value || 
                 0;
  } else {
    targetValue = result.value || 0;
  }
  
  console.log(`   → Final targetValue: ${targetValue}`);
  return targetValue;
}

console.log('=== Debugging Properties Access ===\n');

// 1. Simulate processor output
const processedData = simulateProcessorOutput();
console.log('1. PROCESSOR OUTPUT:');
processedData.records.forEach(record => {
  console.log(`   ${record.area_name}: value=${record.value}, properties.strategic_value_score=${record.properties.strategic_value_score}`);
});

// 2. Simulate UI logic
console.log('\n2. UI TARGET VALUE CALCULATION:');
const targetValues = processedData.records.map(result => {
  return simulateUITargetValueLogic(result, processedData.type);
});

console.log('\n3. FINAL TARGET VALUES SENT TO CLAUDE:');
targetValues.forEach((targetValue, index) => {
  console.log(`   Record ${index + 1}: ${targetValue}`);
});

// 4. Check if they're all the same
const uniqueValues = [...new Set(targetValues)];
if (uniqueValues.length === 1) {
  console.log(`\n🚨 PROBLEM: All targetValues are the same: ${uniqueValues[0]}`);
  console.log('This explains why Claude sees all scores as the same value!');
} else {
  console.log(`\n✅ SUCCESS: Found ${uniqueValues.length} unique values: ${uniqueValues.join(', ')}`);
}