#!/usr/bin/env node

/**
 * Test Visualization Grey Issue
 * Check if the visualization renderer can find and use the target field
 */

console.log('🎨 TESTING VISUALIZATION GREY ISSUE');
console.log('=' + '='.repeat(60));

// Simulate the rawValue selection logic
function testRawValueSelection() {
  console.log('\n📊 TESTING RAW VALUE SELECTION');
  
  const testCases = [
    {
      name: 'Strategic Analysis Record',
      data: { type: 'strategic_analysis' },
      record: {
        value: 79.34,
        strategic_value_score: 79.34,
        properties: {
          thematic_value: 26.14,
          strategic_value_score: 79.34
        }
      }
    },
    {
      name: 'Competitive Analysis Record', 
      data: { type: 'competitive_analysis' },
      record: {
        value: 5.1,
        competitive_advantage_score: 5.1,
        properties: {
          thematic_value: 26.14,
          competitive_advantage_score: 5.1
        }
      }
    }
  ];
  
  testCases.forEach(testCase => {
    console.log(`\n${testCase.name}:`);
    console.log('Input:', {
      type: testCase.data.type,
      record_value: testCase.record.value,
      properties_thematic_value: testCase.record.properties?.thematic_value
    });
    
    // Simulate the current rawValue selection logic
    const rawValue = testCase.data.type === 'competitive_analysis' && typeof testCase.record.value === 'number' ? testCase.record.value :
                     testCase.data.type === 'strategic_analysis' && typeof testCase.record.value === 'number' ? testCase.record.value :
                     typeof testCase.record.properties?.thematic_value === 'number' ? testCase.record.properties.thematic_value : 
                     typeof testCase.record.value === 'number' ? testCase.record.value : 0;
    
    // Simulate thematic capping logic
    let thematicValue = rawValue;
    if (rawValue > 10.0 && testCase.data.type !== 'strategic_analysis' && testCase.data.type !== 'competitive_analysis') {
      thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
      console.log(`🔧 [THEMATIC CAPPING] ${rawValue} → ${thematicValue.toFixed(1)}`);
    } else if (testCase.data.type === 'strategic_analysis' || testCase.data.type === 'competitive_analysis') {
      console.log(`✅ [NO CAPPING] ${testCase.data.type} preserving original value: ${rawValue}`);
    }
    
    console.log('Result:', {
      rawValue,
      thematicValue,
      shouldBeVisible: thematicValue > 0
    });
    
    if (thematicValue === 0) {
      console.log('❌ WARNING: Zero value will cause grey visualization!');
    } else {
      console.log('✅ Value should be visible in visualization');
    }
  });
}

// Test renderer field detection
function testRendererFieldDetection() {
  console.log('\n\n🎯 TESTING RENDERER FIELD DETECTION');
  
  const mockFeature = {
    properties: {
      strategic_value_score: 79.34,
      competitive_advantage_score: 5.1,
      thematic_value: 26.14,
      ID: '08837',
      DESCRIPTION: '08837 (Edison)'
    }
  };
  
  const testRenderers = [
    { type: 'strategic_analysis', field: 'strategic_value_score' },
    { type: 'competitive_analysis', field: 'competitive_advantage_score' },
    { type: 'demographic_analysis', field: 'demographic_score' }
  ];
  
  testRenderers.forEach(renderer => {
    console.log(`\n${renderer.type}:`);
    console.log(`Looking for field: ${renderer.field}`);
    
    const fieldExists = mockFeature.properties.hasOwnProperty(renderer.field);
    const fieldValue = mockFeature.properties[renderer.field];
    
    console.log('Result:', {
      fieldExists,
      fieldValue,
      rendererWillWork: fieldExists && typeof fieldValue === 'number' && fieldValue > 0
    });
    
    if (!fieldExists) {
      console.log('❌ FIELD MISSING: Renderer will show grey');
    } else if (typeof fieldValue !== 'number' || fieldValue <= 0) {
      console.log('❌ INVALID VALUE: Renderer will show grey');  
    } else {
      console.log('✅ Renderer should work correctly');
    }
  });
}

// Run tests
testRawValueSelection();
testRendererFieldDetection();

console.log('\n' + '='.repeat(60));
console.log('🎨 VISUALIZATION GREY ISSUE TEST COMPLETE');
console.log('Check for zero values or missing fields that could cause grey visualization');