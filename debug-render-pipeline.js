#!/usr/bin/env node

/**
 * Debug Rendering Pipeline
 * Test the key functions that handle strategic analysis rendering
 */

const path = require('path');

// Mock the field mapping functions
const ENDPOINT_FIELD_MAPPINGS = {
  'strategic_analysis': {
    primaryScoreField: 'strategic_value_score',
    displayName: 'Strategic Value Score',
    expectedRange: { min: 0, max: 100 }
  },
  'competitive_analysis': {
    primaryScoreField: 'competitive_advantage_score',
    displayName: 'Competitive Advantage Score', 
    expectedRange: { min: 1, max: 10 }
  }
};

function getFieldMapping(analysisType) {
  return ENDPOINT_FIELD_MAPPINGS[analysisType] || {
    primaryScoreField: 'value',
    displayName: 'Value'
  };
}

function getPrimaryScoreField(analysisType, targetVariable) {
  if (targetVariable) {
    return targetVariable;
  }
  
  const mapping = getFieldMapping(analysisType);
  return mapping.primaryScoreField;
}

function extractScoreValue(record, analysisType, targetVariable) {
  const fieldMapping = getFieldMapping(analysisType);
  const primaryField = getPrimaryScoreField(analysisType, targetVariable);
  
  return record[primaryField] || record.value || 0;
}

console.log('🧪 Testing Rendering Pipeline Functions...');

// Test 1: Strategic Analysis
console.log('\n1️⃣ Strategic Analysis:');
const strategicType = 'strategic_analysis';
const strategicTarget = 'strategic_value_score';

const strategicField = getPrimaryScoreField(strategicType, strategicTarget);
console.log(`   getPrimaryScoreField(${strategicType}, ${strategicTarget}) = ${strategicField}`);

const strategicRecord = { strategic_value_score: 75.5, value: 20, other_field: 10 };
const strategicValue = extractScoreValue(strategicRecord, strategicType, strategicTarget);
console.log(`   extractScoreValue for record with strategic_value_score=75.5 = ${strategicValue}`);

// Test 2: Competitive Analysis
console.log('\n2️⃣ Competitive Analysis:');
const competitiveType = 'competitive_analysis';
const competitiveTarget = 'competitive_advantage_score';

const competitiveField = getPrimaryScoreField(competitiveType, competitiveTarget);
console.log(`   getPrimaryScoreField(${competitiveType}, ${competitiveTarget}) = ${competitiveField}`);

const competitiveRecord = { competitive_advantage_score: 8.5, value: 20, other_field: 10 };
const competitiveValue = extractScoreValue(competitiveRecord, competitiveType, competitiveTarget);
console.log(`   extractScoreValue for record with competitive_advantage_score=8.5 = ${competitiveValue}`);

console.log('\n✅ Pipeline Functions Test Results:');
console.log(`   Strategic: ${strategicField} → ${strategicValue} (expected: strategic_value_score → 75.5)`);
console.log(`   Competitive: ${competitiveField} → ${competitiveValue} (expected: competitive_advantage_score → 8.5)`);

console.log('\n🔍 If these are correct but visualization is still grey:');
console.log('   1. Check if quartile renderer is getting the right field name');
console.log('   2. Check if the actual records in the UI have the expected scores');
console.log('   3. Check browser console for renderer errors');
console.log('   4. Verify the layer is using the correct field for styling');

console.log('\n🚨 Most likely issue:');
console.log('   The quartile renderer (createQuartileRenderer) may not be finding');
console.log('   the score fields on the actual feature attributes, causing grey/no legend');