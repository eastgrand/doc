#!/usr/bin/env node

/**
 * Test Field Mapping System
 * Validates that the centralized field mapping configuration works correctly
 */

const { 
  getFieldMapping, 
  getPrimaryScoreField, 
  extractScoreValue, 
  formatScoreValue 
} = require('./lib/analysis/utils/FieldMappingConfig.ts');

console.log('🧪 TESTING FIELD MAPPING SYSTEM');
console.log('=' + '='.repeat(50));

// Test data
const testRecord = {
  competitive_advantage_score: 4.2,
  strategic_value_score: 85.3,
  demographic_score: 67.8,
  value: 50,
  properties: {
    fallback_score: 33.5
  }
};

console.log('\n📊 TEST CASES:');

// Test 1: Competitive Analysis
console.log('\n1. Competitive Analysis:');
const competitiveField = getPrimaryScoreField('competitive_analysis');
const competitiveValue = extractScoreValue(testRecord, 'competitive_analysis');
const competitiveFormatted = formatScoreValue(competitiveValue, 'competitive_analysis');

console.log('   - Primary field:', competitiveField);
console.log('   - Extracted value:', competitiveValue);
console.log('   - Formatted value:', competitiveFormatted);

// Test 2: Strategic Analysis
console.log('\n2. Strategic Analysis:');
const strategicField = getPrimaryScoreField('strategic_analysis');
const strategicValue = extractScoreValue(testRecord, 'strategic_analysis');
const strategicFormatted = formatScoreValue(strategicValue, 'strategic_analysis');

console.log('   - Primary field:', strategicField);
console.log('   - Extracted value:', strategicValue);
console.log('   - Formatted value:', strategicFormatted);

// Test 3: Unknown Analysis Type
console.log('\n3. Unknown Analysis Type:');
const unknownField = getPrimaryScoreField('unknown_analysis');
const unknownValue = extractScoreValue(testRecord, 'unknown_analysis');
const unknownFormatted = formatScoreValue(unknownValue, 'unknown_analysis');

console.log('   - Primary field (fallback):', unknownField);
console.log('   - Extracted value:', unknownValue);
console.log('   - Formatted value:', unknownFormatted);

// Test 4: With Target Variable Override
console.log('\n4. With Target Variable Override:');
const overrideField = getPrimaryScoreField('competitive_analysis', 'custom_score_field');
console.log('   - Override field:', overrideField);

// Test 5: All Available Mappings
console.log('\n5. All Available Analysis Types:');
const analysisTypes = [
  'strategic_analysis',
  'competitive_analysis', 
  'demographic_analysis',
  'market_sizing',
  'trend_analysis',
  'correlation_analysis',
  'anomaly_detection',
  'spatial_clustering'
];

analysisTypes.forEach(type => {
  const mapping = getFieldMapping(type);
  console.log(`   - ${type}: ${mapping.primaryScoreField} (${mapping.displayName})`);
});

// Test 6: Validation Results
console.log('\n6. Validation Results:');
const validationTests = [
  { type: 'competitive_analysis', expected: 'competitive_advantage_score', actual: competitiveField },
  { type: 'strategic_analysis', expected: 'strategic_value_score', actual: strategicField },
  { type: 'unknown_analysis', expected: 'value', actual: unknownField }
];

let allPassed = true;
validationTests.forEach(test => {
  const passed = test.expected === test.actual;
  if (!passed) allPassed = false;
  console.log(`   - ${test.type}: ${passed ? '✅ PASS' : '❌ FAIL'} (expected: ${test.expected}, got: ${test.actual})`);
});

console.log('\n' + '='.repeat(60));
console.log(`🧪 FIELD MAPPING SYSTEM TEST ${allPassed ? '✅ PASSED' : '❌ FAILED'}`);

// Test the actual system integration
console.log('\n🔧 TESTING SYSTEM INTEGRATION:');

// Simulate what the geospatial-chat-interface would do
function simulateVisualizationFieldSelection(analysisType, targetVariable, record) {
  console.log(`\n   Simulating field selection for: ${analysisType}`);
  
  // This is what the refactored code does
  const rendererField = getPrimaryScoreField(analysisType, targetVariable);
  const scoreValue = extractScoreValue(record, analysisType, targetVariable);
  
  console.log(`   - Renderer field: ${rendererField}`);
  console.log(`   - Score value: ${scoreValue}`);
  console.log(`   - Record has field: ${record[rendererField] !== undefined}`);
  
  return { rendererField, scoreValue };
}

// Test the integration
simulateVisualizationFieldSelection('competitive_analysis', null, testRecord);
simulateVisualizationFieldSelection('strategic_analysis', null, testRecord);
simulateVisualizationFieldSelection('demographic_analysis', null, testRecord);

console.log('\n✅ System integration test complete!');
console.log('\n💡 To add a new endpoint:');
console.log('   1. Add mapping to ENDPOINT_FIELD_MAPPINGS in FieldMappingConfig.ts');
console.log('   2. That\'s it! No other code changes needed.');

if (require.main === module) {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 FIELD MAPPING SYSTEM TEST COMPLETE');
}