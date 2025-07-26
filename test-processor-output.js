// Test what the StrategicAnalysisProcessor actually outputs
const fs = require('fs');
const path = require('path');

// Simulate the StrategicAnalysisProcessor
function processRecord(record, index) {
  // This mimics what StrategicAnalysisProcessor does
  let primaryScore = 0;
  
  if (record.strategic_value_score !== undefined && record.strategic_value_score !== null) {
    primaryScore = Number(record.strategic_value_score);
  }
  
  const areaName = record.DESCRIPTION || `Area ${record.ID}`;
  const recordId = record.ID || record.id || `area_${index + 1}`;
  
  return {
    area_id: recordId,
    area_name: areaName,
    value: Math.round(primaryScore * 100) / 100,  // <-- This is the key field
    rank: 0,
    properties: {
      ...record,
      strategic_value_score: primaryScore
    }
  };
}

// Load and process data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/endpoints/strategic-analysis.json'), 'utf8'));

console.log('=== Testing StrategicAnalysisProcessor Output ===\n');

console.log('1. What the processor outputs for top 5 records:');
const top5 = data.results.slice(0, 5);
top5.forEach((record, index) => {
  const processed = processRecord(record, index);
  console.log(`   ${processed.area_id}:`);
  console.log(`     - area_name: ${processed.area_name}`);
  console.log(`     - value: ${processed.value} <-- This is what gets used`);
  console.log(`     - properties.strategic_value_score: ${processed.properties.strategic_value_score}`);
});

console.log('\n2. So result.value should be:');
top5.forEach((record, index) => {
  const processed = processRecord(record, index);
  console.log(`   ${processed.area_id}: result.value = ${processed.value}`);
});

console.log('\n3. But the UI shows all as 79.3, which suggests:');
console.log('   - Either result.value is being overwritten somewhere');
console.log('   - Or the wrong field is being used');
console.log('   - Or there\'s a bug in how the data flows from processor to UI');