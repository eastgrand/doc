#!/usr/bin/env node

/**
 * Test Multi-Record Debug - Test with multiple records to verify class breaks
 */

const fs = require('fs');

console.log('🔍 TESTING WITH MULTIPLE RECORDS\n');

// Load data
const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
const competitiveData = JSON.parse(fs.readFileSync('./public/data/endpoints/competitive-analysis.json', 'utf8'));

console.log('📊 STRATEGIC ANALYSIS - First 5 Records:');
console.log('-'.repeat(50));
for (let i = 0; i < Math.min(5, strategicData.results.length); i++) {
  const record = strategicData.results[i];
  console.log(`${i + 1}. ${record.DESCRIPTION}: strategic_value_score = ${record.strategic_value_score}`);
}

console.log('\n📊 COMPETITIVE ANALYSIS - First 5 Records:');
console.log('-'.repeat(50));
for (let i = 0; i < Math.min(5, competitiveData.results.length); i++) {
  const record = competitiveData.results[i];
  console.log(`${i + 1}. ${record.DESCRIPTION}: competitive_advantage_score = ${record.competitive_advantage_score}`);
}

// Test value distribution
console.log('\n📈 VALUE DISTRIBUTION ANALYSIS:');
console.log('-'.repeat(40));

function analyzeValueDistribution(data, field, name) {
  const values = data.results.map(r => r[field]).filter(v => v !== undefined && !isNaN(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const unique = new Set(values);
  
  console.log(`${name}:`);
  console.log(`  Total records: ${values.length}`);
  console.log(`  Unique values: ${unique.size}`);
  console.log(`  Range: ${min.toFixed(2)} to ${max.toFixed(2)}`);
  console.log(`  Has range: ${max > min ? '✅' : '❌'}`);
  console.log(`  Sample values: [${Array.from(unique).slice(0, 10).map(v => v.toFixed(2)).join(', ')}]`);
  
  return {
    count: values.length,
    unique: unique.size,
    min: min,
    max: max,
    hasRange: max > min,
    values: values
  };
}

const strategicAnalysis = analyzeValueDistribution(strategicData, 'strategic_value_score', 'Strategic Analysis');
const competitiveAnalysis = analyzeValueDistribution(competitiveData, 'competitive_advantage_score', 'Competitive Analysis');

console.log('\n🎯 ROOT CAUSE ANALYSIS:');
console.log('-'.repeat(30));

if (strategicAnalysis.hasRange && competitiveAnalysis.hasRange) {
  console.log('✅ Both datasets have value ranges - should create colored visualizations');
  console.log('❌ BUT: The issue is likely in the actual data processing pipeline');
  console.log('   → Check if processors are returning multiple records');
  console.log('   → Check if the full dataset is being processed, not just samples');
} else {
  if (!strategicAnalysis.hasRange) {
    console.log('❌ Strategic analysis has no value range - all values are the same');
  }
  if (!competitiveAnalysis.hasRange) {
    console.log('❌ Competitive analysis has no value range - all values are the same');
  }
}

console.log('\n🔧 NEXT DEBUGGING STEPS:');
console.log('1. Check if processors are returning full datasets (not just 1 record)');
console.log('2. Verify AnalysisEngine passes all records to VisualizationRenderer');
console.log('3. Check browser console for actual record counts in ChoroplethRenderer');
console.log('4. Verify no data filtering is happening between processor and renderer');