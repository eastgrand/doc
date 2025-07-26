const fs = require('fs');

console.log('=== COMPREHENSIVE STRATEGIC RENDERING FLOW TEST ===\n');

// 1. Load and verify data
console.log('1. DATA VERIFICATION:');
const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
console.log(`   ✓ Loaded ${strategicData.results.length} records`);

// Sample a few records to check strategic_value_score values
const samples = strategicData.results.slice(0, 10);
const strategicScores = samples.map(r => r.strategic_value_score).filter(s => s != null);
console.log(`   ✓ Strategic scores sample:`, strategicScores);
console.log(`   ✓ Score range: ${Math.min(...strategicScores)} - ${Math.max(...strategicScores)}`);

// 2. Simulate processor output
console.log('\n2. PROCESSOR SIMULATION:');
const processedRecords = strategicData.results.slice(0, 100).map(record => ({
  area_id: record.ID,
  area_name: record.DESCRIPTION,
  value: record.strategic_value_score,
  strategic_value_score: record.strategic_value_score, // Key field for rendering
  properties: record
}));

console.log(`   ✓ Processed ${processedRecords.length} records`);
console.log(`   ✓ Sample processed record:`, {
  area_id: processedRecords[0].area_id,
  area_name: processedRecords[0].area_name,
  value: processedRecords[0].value,
  strategic_value_score: processedRecords[0].strategic_value_score
});

const processedData = {
  type: 'strategic_analysis',
  records: processedRecords,
  targetVariable: 'strategic_value_score',
  summary: 'Test summary',
  statistics: { min: Math.min(...strategicScores), max: Math.max(...strategicScores) }
};

// 3. Simulate VisualizationRenderer.determineValueField()
console.log('\n3. VALUE FIELD DETERMINATION:');
const targetVariable = processedData.targetVariable;
const valueField = targetVariable || 'value'; // This is what determineValueField does
console.log(`   ✓ targetVariable: ${targetVariable}`);
console.log(`   ✓ Determined valueField: ${valueField}`);

// 4. Simulate config creation
console.log('\n4. CONFIG CREATION:');
const config = {
  valueField: valueField,
  labelField: 'area_name',
  type: 'choropleth'
};
console.log(`   ✓ Config created:`, config);

// 5. Simulate ChoroplethRenderer value extraction
console.log('\n5. VALUE EXTRACTION SIMULATION:');
const fieldToUse = config.valueField || 'value';
console.log(`   ✓ fieldToUse: ${fieldToUse}`);

const extractedValues = processedData.records.map(r => r[fieldToUse]).filter(v => v !== undefined && !isNaN(v));
console.log(`   ✓ Extracted ${extractedValues.length} valid values`);
console.log(`   ✓ Value range: ${Math.min(...extractedValues)} - ${Math.max(...extractedValues)}`);
console.log(`   ✓ Sample values:`, extractedValues.slice(0, 10));

// 6. Simulate class break calculation
console.log('\n6. CLASS BREAK CALCULATION:');
if (extractedValues.length === 0) {
  console.log('   ❌ ERROR: No valid values extracted for class breaks!');
  console.log('   This would cause grey visualization');
} else {
  const sorted = extractedValues.sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q2 = sorted[Math.floor(sorted.length * 0.5)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const breaks = [sorted[0], q1, q2, q3, sorted[sorted.length - 1]];
  
  console.log(`   ✓ Quartile breaks: [${breaks.map(b => b.toFixed(2)).join(', ')}]`);
  console.log(`   ✓ This should create proper color classes`);
}

// 7. Check for common issues
console.log('\n7. ISSUE DETECTION:');
const issues = [];

// Check if records have the target field
const recordsWithTargetField = processedData.records.filter(r => r[fieldToUse] !== undefined);
if (recordsWithTargetField.length !== processedData.records.length) {
  issues.push(`❌ Missing target field: ${processedData.records.length - recordsWithTargetField.length} records missing ${fieldToUse}`);
}

// Check if all values are the same (would cause grey visualization)
const uniqueValues = [...new Set(extractedValues)];
if (uniqueValues.length === 1) {
  issues.push(`❌ All values are identical: ${uniqueValues[0]} (would cause grey visualization)`);
}

// Check for null/undefined values
const nullValues = processedData.records.filter(r => r[fieldToUse] === null || r[fieldToUse] === undefined);
if (nullValues.length > 0) {
  issues.push(`⚠️  ${nullValues.length} records have null/undefined values for ${fieldToUse}`);
}

if (issues.length === 0) {
  console.log('   ✅ No rendering issues detected - visualization should display colors correctly');
} else {
  console.log('   Issues found:');
  issues.forEach(issue => console.log('   ', issue));
}

console.log('\n=== FLOW ANALYSIS COMPLETE ===');