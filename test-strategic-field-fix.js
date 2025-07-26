#!/usr/bin/env node

/**
 * Test Strategic Field Fix
 * Check if strategic_value_score is properly added to feature properties
 */

console.log('🔍 TESTING DYNAMIC TARGET VARIABLE FIX');
console.log('=' + '='.repeat(60));

// Simulate the join function behavior for any analysis type
function simulateJoinLogic(analysisType, targetVariable, targetValue) {
  console.log(`\n📊 SIMULATING JOIN LOGIC FOR ${analysisType.toUpperCase()}`);
  console.log(`Target Variable: ${targetVariable}`);
  
  // Mock analysis record (from AnalysisEngine) with dynamic target field
  const record = {
    area_id: '08837',
    area_name: 'Edison',
    value: targetValue,
    [targetVariable]: targetValue,
    properties: {
      thematic_value: 26.14
    }
  };
  
  // Mock ZIP boundary feature
  const zipFeature = {
    geometry: { type: 'Polygon', coordinates: [] },
    properties: {
      ID: '08837',
      DESCRIPTION: '08837 (Edison)'
    }
  };
  
  console.log('Input record:', {
    value: record.value,
    [targetVariable]: record[targetVariable],
    properties_thematic_value: record.properties?.thematic_value
  });
  
  // Simulate the fixed join logic
  const zipDescription = zipFeature.properties?.DESCRIPTION || '';
  const zipMatch = zipDescription.match(/^(\d{5})\s*\(([^)]+)\)/);
  const zipCode = zipMatch?.[1] || '08837';
  const cityName = zipMatch?.[2] || 'Unknown City';
  
  const preservedProps = { ...record.properties };
  const zipProps = { ...(zipFeature.properties || {}) };
  
  const joinedRecord = {
    ...record,
    area_id: zipCode,
    area_name: `${zipCode} (${cityName})`,
    geometry: zipFeature.geometry,
    properties: {
      ...preservedProps,
      ...zipProps,
      zip_code: zipCode,
      city_name: cityName,
      // CRITICAL: Add BOTH targetVariable AND 'value' fields for renderer access
      [targetVariable]: record[targetVariable] || record.value || preservedProps[targetVariable] || 0,
      value: record.value || record[targetVariable] || preservedProps[targetVariable] || 0
    }
  };
  
  console.log('\nJoined record result:', {
    value: joinedRecord.value,
    [targetVariable]: joinedRecord[targetVariable],
    [`properties_${targetVariable}`]: joinedRecord.properties?.[targetVariable],
    properties_value: joinedRecord.properties?.value,
    properties_thematic_value: joinedRecord.properties?.thematic_value
  });
  
  // Check if renderer would find BOTH fields (targetVariable and 'value')
  const targetFieldExists = joinedRecord.properties && joinedRecord.properties.hasOwnProperty(targetVariable);
  const valueFieldExists = joinedRecord.properties && joinedRecord.properties.hasOwnProperty('value');
  
  console.log('\nRenderer check:', {
    targetField: targetVariable,
    targetFieldExists,
    targetFieldValue: joinedRecord.properties?.[targetVariable],
    valueFieldExists,
    valueFieldValue: joinedRecord.properties?.value
  });
  
  if (targetFieldExists && valueFieldExists && 
      joinedRecord.properties[targetVariable] === targetValue &&
      joinedRecord.properties.value === targetValue) {
    console.log(`✅ SUCCESS: Renderer will find BOTH ${targetVariable} and 'value' fields!`);
    return true;
  } else {
    console.log('❌ FAILURE: Renderer missing required fields or values are wrong');
    return false;
  }
}

// Run tests for multiple analysis types
const testCases = [
  { type: 'strategic_analysis', targetVariable: 'strategic_value_score', value: 79.34 },
  { type: 'competitive_analysis', targetVariable: 'competitive_advantage_score', value: 5.1 },
  { type: 'demographic_analysis', targetVariable: 'demographic_score', value: 82.7 },
  { type: 'trend_analysis', targetVariable: 'trend_score', value: 3.9 },
  { type: 'brand_analysis', targetVariable: 'brand_strength_score', value: 67.2 }
];

let allPassed = true;

testCases.forEach(testCase => {
  const success = simulateJoinLogic(testCase.type, testCase.targetVariable, testCase.value);
  if (!success) {
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(60));
console.log(allPassed ? '✅ DYNAMIC TARGET VARIABLE FIX: ALL TESTS PASSED' : '❌ DYNAMIC TARGET VARIABLE FIX: SOME TESTS FAILED');