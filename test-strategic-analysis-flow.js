// Test the complete strategic analysis data flow
const fs = require('fs');
const path = require('path');

// Load the strategic-analysis.json file
const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/endpoints/strategic-analysis.json'), 'utf8'));

console.log('=== Strategic Analysis Data Flow Test ===\n');

// 1. Check raw data
console.log('1. RAW DATA from strategic-analysis.json:');
const top5 = data.results.slice(0, 5);
top5.forEach(record => {
  console.log(`   ${record.ID}: strategic_value_score = ${record.strategic_value_score}`);
});

// 2. Simulate what StrategicAnalysisProcessor does
console.log('\n2. PROCESSOR OUTPUT (simulated):');
top5.forEach(record => {
  // This is what the processor does
  const primaryScore = Number(record.strategic_value_score);
  const processedValue = Math.round(primaryScore * 100) / 100;
  console.log(`   ${record.ID}: primaryScore = ${primaryScore}, processedValue = ${processedValue}`);
});

// 3. Check if there's an issue with the value field
console.log('\n3. OTHER VALUE FIELDS in the data:');
const firstRecord = data.results[0];
const valueFields = Object.keys(firstRecord).filter(k => k.includes('value') || k === 'value');
console.log('   Value-related fields:', valueFields);
valueFields.forEach(field => {
  console.log(`   ${field}: ${firstRecord[field]}`);
});

// 4. Check opportunity_score field
console.log('\n4. OPPORTUNITY SCORE CHECK:');
top5.forEach(record => {
  console.log(`   ${record.ID}: opportunity_score = ${record.opportunity_score}`);
});

// 5. Check for any field that has 79.3 value
console.log('\n5. SEARCHING for 79.3 value:');
const fields79_3 = Object.keys(firstRecord).filter(k => {
  const val = firstRecord[k];
  return val === 79.3 || val === 79.34 || (typeof val === 'number' && Math.abs(val - 79.3) < 0.1);
});
console.log('   Fields with values near 79.3:', fields79_3);
fields79_3.forEach(field => {
  console.log(`   ${field}: ${firstRecord[field]}`);
});

// 6. Check if all records have the same value for some field
console.log('\n6. CHECKING for fields with identical values across top 5:');
const allFields = Object.keys(firstRecord);
allFields.forEach(field => {
  const values = top5.map(r => r[field]);
  const uniqueValues = [...new Set(values)];
  if (uniqueValues.length === 1 && typeof values[0] === 'number') {
    console.log(`   ${field}: ALL HAVE SAME VALUE = ${values[0]}`);
  }
});