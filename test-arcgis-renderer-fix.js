// Test the exact field mapping that should work for ArcGIS renderer
console.log('=== ARCGIS RENDERER FIELD MAPPING TEST ===\n');

// This simulates exactly what should happen for strategic analysis:

console.log('1. PROCESSOR OUTPUT:');
const processedRecord = {
  area_id: '11234',
  area_name: '11234 (Brooklyn)',
  value: 79.34, // This is strategic_value_score
  strategic_value_score: 79.34, // CRITICAL: This field at top level
  properties: {
    ID: '11234',
    DESCRIPTION: '11234 (Brooklyn)',
    strategic_value_score: 79.34 // Also in properties
  }
};
console.log('   Processed record fields:', Object.keys(processedRecord));
console.log('   strategic_value_score:', processedRecord.strategic_value_score);

console.log('\\n2. VISUALIZATION CONFIG:');
const config = {
  valueField: 'strategic_value_score', // From VisualizationRenderer.determineValueField()
  type: 'choropleth'
};
console.log('   config.valueField:', config.valueField);

console.log('\\n3. ARCGIS FEATURE ATTRIBUTES:');
const arcgisFeatureAttributes = {
  OBJECTID: 1,
  area_name: processedRecord.area_name,
  value: processedRecord.value,
  strategic_value_score: processedRecord.strategic_value_score, // CRITICAL: This field for renderer
  // ... other fields
};
console.log('   ArcGIS feature attributes:');
Object.entries(arcgisFeatureAttributes).forEach(([key, value]) => {
  console.log(`     ${key}: ${value} (${typeof value})`);
});

console.log('\\n4. ARCGIS RENDERER DEFINITION:');
const rendererField = config.valueField || 'value';
console.log('   Renderer field:', rendererField);
console.log('   Field exists in attributes:', rendererField in arcgisFeatureAttributes);
console.log('   Field value:', arcgisFeatureAttributes[rendererField]);

console.log('\\n5. CLASS BREAKS SIMULATION:');
// Simulate multiple features
const multipleFeatures = [
  { strategic_value_score: 79.34 },
  { strategic_value_score: 79.17 }, 
  { strategic_value_score: 78.93 },
  { strategic_value_score: 76.45 },
  { strategic_value_score: 74.70 }
];

const values = multipleFeatures.map(f => f[rendererField]).filter(v => v !== undefined && !isNaN(v));
console.log('   Extracted values:', values);

if (values.length === 0) {
  console.log('   ❌ PROBLEM: No values extracted - would cause grey visualization');
} else {
  const sorted = values.sort((a, b) => a - b);
  const breaks = [
    sorted[0],
    sorted[Math.floor(sorted.length * 0.25)],
    sorted[Math.floor(sorted.length * 0.5)],
    sorted[Math.floor(sorted.length * 0.75)],
    sorted[sorted.length - 1]
  ];
  console.log('   Class breaks:', breaks);
  console.log('   ✅ Should create proper color visualization');
}

console.log('\\n6. EXPECTED ARCGIS RENDERER:');
const expectedRenderer = {
  type: 'class-breaks',
  field: rendererField, // This MUST match feature attribute field name exactly
  classBreakInfos: [
    {
      minValue: 74.70,
      maxValue: 76.00,
      symbol: { type: 'simple-fill', color: [255, 245, 240, 0.8] }
    },
    {
      minValue: 76.00,
      maxValue: 78.00,
      symbol: { type: 'simple-fill', color: [252, 187, 161, 0.8] }
    },
    {
      minValue: 78.00,
      maxValue: 79.00,
      symbol: { type: 'simple-fill', color: [239, 101, 72, 0.8] }
    },
    {
      minValue: 79.00,
      maxValue: 79.34,
      symbol: { type: 'simple-fill', color: [153, 52, 4, 0.8] }
    }
  ]
};

console.log('   Renderer type:', expectedRenderer.type);
console.log('   Renderer field:', expectedRenderer.field);
console.log('   Number of classes:', expectedRenderer.classBreakInfos.length);

console.log('\\n=== DIAGNOSIS ===');
console.log('If strategic analysis is showing grey, the issue is:');
console.log('1. Field name mismatch between renderer.field and feature attributes');
console.log('2. ArcGIS not finding the strategic_value_score field in features');
console.log('3. Possible case sensitivity or undefined field issues');