#!/usr/bin/env node

/**
 * Debug VisualizationRenderer
 * Test what the VisualizationRenderer actually produces
 */

const fs = require('fs');
const path = require('path');

console.log('🎨 Testing VisualizationRenderer...\n');

// Simulate the data that would be passed to VisualizationRenderer.render()
const mockStrategicData = {
  type: 'strategic_analysis',
  records: [
    {
      area_id: '11234',
      area_name: '11234 (Brooklyn)',
      value: 79.34,
      strategic_analysis_score: 79.34,
      rank: 1,
      properties: {
        ID: '11234',
        DESCRIPTION: '11234 (Brooklyn)',
        strategic_analysis_score: 79.34
      }
    },
    {
      area_id: '10025',
      area_name: '10025 (New York)',
      value: 78.93,
      strategic_analysis_score: 78.93,
      rank: 2,
      properties: {
        ID: '10025',
        DESCRIPTION: '10025 (New York)',
        strategic_analysis_score: 78.93
      }
    }
  ],
  targetVariable: 'strategic_analysis_score',
  summary: 'Strategic analysis complete',
  statistics: {},
  featureImportance: []
};

console.log('1️⃣ Mock data for VisualizationRenderer:', {
  type: mockStrategicData.type,
  targetVariable: mockStrategicData.targetVariable,
  recordCount: mockStrategicData.records.length,
  sampleValue: mockStrategicData.records[0].value,
  sampleStrategicScore: mockStrategicData.records[0].strategic_analysis_score
});

// Test the determineVisualizationType logic
console.log('\n2️⃣ Testing determineVisualizationType...');
if (mockStrategicData.type === 'strategic_analysis') {
  console.log('✅ Strategic analysis → choropleth visualization');
} else {
  console.log('❌ Wrong visualization type determined');
}

// Test the determineValueField logic
console.log('\n3️⃣ Testing determineValueField...');
let valueField = 'value'; // Default
if (mockStrategicData.type === 'strategic_analysis' && mockStrategicData.targetVariable) {
  valueField = mockStrategicData.targetVariable; // Should be 'strategic_analysis_score'
  console.log(`✅ Strategic analysis → using targetVariable: ${valueField}`);
} else {
  console.log('❌ Wrong value field determined');
}

// Test the renderer creation (simulate ChoroplethRenderer logic)
console.log('\n4️⃣ Testing Renderer Creation...');
console.log('ChoroplethRenderer would use:', {
  field: valueField,
  dataType: mockStrategicData.type,
  recordCount: mockStrategicData.records.length,
  sampleFieldValue: mockStrategicData.records[0][valueField]
});

// Check if the field exists on records
const fieldExists = mockStrategicData.records.every(record => 
  record[valueField] !== undefined && typeof record[valueField] === 'number'
);

console.log('Field validation:', {
  field: valueField,
  existsOnAllRecords: fieldExists ? '✅' : '❌',
  sampleValues: mockStrategicData.records.map(r => r[valueField])
});

// Test what breaks could be calculated
console.log('\n5️⃣ Testing Quartile Break Calculation...');
const values = mockStrategicData.records.map(r => r[valueField]).filter(v => v !== undefined && !isNaN(v));
if (values.length > 0) {
  values.sort((a, b) => a - b);
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  console.log('Value analysis:', {
    valueCount: values.length,
    min: min,
    max: max,
    range: max - min,
    allValues: values
  });
  
  if (max > min) {
    console.log('✅ Sufficient value range for quartile breaks');
  } else {
    console.log('❌ All values are the same - no quartile breaks possible');
  }
} else {
  console.log('❌ No valid numeric values found');
}

// Test what the actual VisualizationRenderer files would do
console.log('\n6️⃣ Testing Actual Renderer Files...');

// Check ChoroplethRenderer
const choroplethPath = path.join(__dirname, 'lib/analysis/strategies/renderers/ChoroplethRenderer.ts');
if (fs.existsSync(choroplethPath)) {
  console.log('✅ ChoroplethRenderer.ts exists');
  
  // Look for key methods
  const choroplethContent = fs.readFileSync(choroplethPath, 'utf8');
  const hasRenderMethod = choroplethContent.includes('render(');
  const hasCreateRenderer = choroplethContent.includes('createRenderer') || choroplethContent.includes('SimpleRenderer') || choroplethContent.includes('ClassBreaksRenderer');
  
  console.log('ChoroplethRenderer analysis:', {
    hasRenderMethod: hasRenderMethod ? '✅' : '❌',
    hasCreateRenderer: hasCreateRenderer ? '✅' : '❌'
  });
} else {
  console.log('❌ ChoroplethRenderer.ts not found');
}

console.log('\n🎯 DIAGNOSIS:');
console.log('=============');
console.log('If tests 1-5 show ✅, the VisualizationRenderer logic should work.');
console.log('If test 6 shows issues, the ChoroplethRenderer implementation is broken.');
console.log('\nMost likely issue: The ChoroplethRenderer is not creating proper class breaks or colors.');
console.log('Next step: Check the actual ChoroplethRenderer.render() method implementation.');