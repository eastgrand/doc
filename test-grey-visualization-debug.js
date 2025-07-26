#!/usr/bin/env node

/**
 * Debug Grey Visualization Issue
 * Comprehensive test to identify why visualization is still grey
 */

console.log('🎨 DEBUGGING GREY VISUALIZATION ISSUE');
console.log('=' + '='.repeat(60));

// Test 1: Simulate the complete data flow
function simulateCompleteDataFlow() {
  console.log('\n📊 SIMULATING COMPLETE DATA FLOW');
  
  // 1. AnalysisEngine record (what comes from processor)
  const analysisRecord = {
    area_id: '08837',
    area_name: 'Edison',
    value: 79.34,
    strategic_value_score: 79.34,
    properties: {
      thematic_value: 26.14
    }
  };
  
  console.log('1. AnalysisEngine Record:', analysisRecord);
  
  // 2. Join with ZIP boundary (our fixed logic)
  const targetVariable = 'strategic_value_score';
  const joinedRecord = {
    ...analysisRecord,
    area_id: '08837',
    area_name: '08837 (Edison)',
    geometry: { type: 'Polygon', coordinates: [] },
    properties: {
      ...analysisRecord.properties,
      ID: '08837',
      DESCRIPTION: '08837 (Edison)',
      zip_code: '08837',
      city_name: 'Edison',
      // Our fixes
      [targetVariable]: analysisRecord[targetVariable] || analysisRecord.value || 0,
      value: analysisRecord.value || analysisRecord[targetVariable] || 0
    }
  };
  
  console.log('2. After JOIN (our fix):', {
    value: joinedRecord.value,
    strategic_value_score: joinedRecord.strategic_value_score,
    properties_value: joinedRecord.properties.value,
    properties_strategic_value_score: joinedRecord.properties.strategic_value_score,
    properties_thematic_value: joinedRecord.properties.thematic_value
  });
  
  // 3. Thematic value logic (what happens in the UI)
  const data = { type: 'strategic_analysis' };
  const rawValue = data.type === 'strategic_analysis' && typeof joinedRecord.value === 'number' ? joinedRecord.value :
                   typeof joinedRecord.properties?.thematic_value === 'number' ? joinedRecord.properties.thematic_value : 
                   typeof joinedRecord.value === 'number' ? joinedRecord.value : 0;
  
  let thematicValue = rawValue;
  if (rawValue > 10.0 && data.type !== 'strategic_analysis') {
    thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
  }
  
  console.log('3. Thematic Value Logic:', {
    rawValue,
    thematicValue,
    shouldBeCapped: data.type !== 'strategic_analysis',
    finalValueForVisualization: thematicValue
  });
  
  // 4. Create ArcGIS feature (what renderer sees)
  const arcgisFeature = {
    attributes: {
      OBJECTID: 1,
      area_id: joinedRecord.area_id,
      area_name: joinedRecord.area_name,
      value: thematicValue, // This is what renderer uses!
      strategic_value_score: joinedRecord.properties.strategic_value_score,
      thematic_value: thematicValue,
      zip_code: joinedRecord.properties.zip_code,
      city_name: joinedRecord.properties.city_name
    },
    geometry: joinedRecord.geometry
  };
  
  console.log('4. ArcGIS Feature (what renderer sees):', {
    'attributes.value': arcgisFeature.attributes.value,
    'attributes.strategic_value_score': arcgisFeature.attributes.strategic_value_score,
    'attributes.thematic_value': arcgisFeature.attributes.thematic_value
  });
  
  // 5. Renderer check
  const rendererField = 'value'; // ChoroplethRenderer uses config.valueField || 'value'
  const rendererValue = arcgisFeature.attributes[rendererField];
  
  console.log('5. Renderer Check:', {
    rendererField,
    rendererValue,
    isValidForVisualization: typeof rendererValue === 'number' && rendererValue > 0,
    willShowGrey: !(typeof rendererValue === 'number' && rendererValue > 0)
  });
  
  // 6. Final verdict
  if (typeof rendererValue === 'number' && rendererValue > 0) {
    console.log('✅ SHOULD WORK: Renderer has valid numeric value');
    return true;
  } else {
    console.log('❌ WILL BE GREY: Renderer value is invalid');
    console.log('   Debug info:', {
      typeof_rendererValue: typeof rendererValue,
      rendererValue_gt_0: rendererValue > 0,
      raw_rendererValue: rendererValue
    });
    return false;
  }
}

// Test 2: Check potential issues
function checkPotentialIssues() {
  console.log('\n\n🔍 CHECKING POTENTIAL ISSUES');
  
  const issues = [];
  
  // Issue 1: Value becomes 0 or null somewhere
  console.log('\n🔍 Issue 1: Value becomes 0 or null');
  const testValues = [79.34, 0, null, undefined, NaN, '79.34'];
  testValues.forEach(val => {
    const isValid = typeof val === 'number' && val > 0;
    console.log(`  ${val} (${typeof val}): ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    if (!isValid && val !== 0) {
      issues.push(`Value ${val} of type ${typeof val} would cause grey visualization`);
    }
  });
  
  // Issue 2: Field name mismatch
  console.log('\n🔍 Issue 2: Field name mismatch');
  const mockFeature = {
    strategic_value_score: 79.34,
    value: 79.34,
    thematic_value: 26.14
  };
  
  const possibleRendererFields = ['value', 'strategic_value_score', 'thematic_value', 'score'];
  possibleRendererFields.forEach(field => {
    const hasField = mockFeature.hasOwnProperty(field);
    const fieldValue = mockFeature[field];
    console.log(`  Renderer looking for '${field}': ${hasField ? '✅ Found' : '❌ Missing'} (value: ${fieldValue})`);
    if (!hasField) {
      issues.push(`Renderer field '${field}' not found in feature`);
    }
  });
  
  // Issue 3: Geometry missing
  console.log('\n🔍 Issue 3: Geometry issues');
  const geometryTests = [
    { geo: null, desc: 'null geometry' },
    { geo: undefined, desc: 'undefined geometry' },
    { geo: {}, desc: 'empty geometry object' },
    { geo: { type: 'Polygon', coordinates: [] }, desc: 'valid but empty coordinates' },
    { geo: { type: 'Polygon', coordinates: [[[1,1],[2,2],[1,2],[1,1]]] }, desc: 'valid geometry' }
  ];
  
  geometryTests.forEach(test => {
    const isValid = test.geo && test.geo.type && test.geo.coordinates && test.geo.coordinates.length > 0;
    console.log(`  ${test.desc}: ${isValid ? '✅ Valid' : '❌ Invalid (will not render)'}`);
    if (!isValid) {
      issues.push(`${test.desc} would prevent rendering`);
    }
  });
  
  console.log('\n📋 SUMMARY OF POTENTIAL ISSUES:');
  if (issues.length === 0) {
    console.log('✅ No obvious issues found');
  } else {
    issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
  }
  
  return issues.length === 0;
}

// Run all tests
const dataFlowOk = simulateCompleteDataFlow();
const noIssuesFound = checkPotentialIssues();

console.log('\n' + '='.repeat(60));
console.log('🎨 GREY VISUALIZATION DEBUG COMPLETE');
console.log(`Data Flow: ${dataFlowOk ? '✅ Should work' : '❌ Has issues'}`);
console.log(`Issue Check: ${noIssuesFound ? '✅ No issues found' : '❌ Issues detected'}`);

if (!dataFlowOk || !noIssuesFound) {
  console.log('\n💡 RECOMMENDATION: Check the actual browser console logs to see what values are being passed to the renderer');
}