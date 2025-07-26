// Test to check if strategic_value_score is properly available in feature attributes
const fs = require('fs');

console.log('=== FEATURE ATTRIBUTES DEBUG ===\n');

// 1. Load strategic analysis data
const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
console.log('1. Loaded strategic data with', strategicData.results.length, 'records');

// 2. Simulate the StrategicAnalysisProcessor output
const processedRecord = {
  area_id: strategicData.results[0].ID,
  area_name: strategicData.results[0].DESCRIPTION,
  value: strategicData.results[0].strategic_value_score,
  strategic_value_score: strategicData.results[0].strategic_value_score, // Added at top level
  properties: strategicData.results[0]
};

console.log('2. Processed record structure:');
console.log('   - Has strategic_value_score at top level:', 'strategic_value_score' in processedRecord);
console.log('   - Value:', processedRecord.strategic_value_score);

// 3. Simulate the UI component feature mapping (geospatial-chat-interface.tsx:1675)
const mappedFeature = {
  type: 'Feature',
  geometry: { type: 'Polygon', coordinates: [[[-74, 40.7], [-74, 40.8], [-73.9, 40.8], [-73.9, 40.7], [-74, 40.7]]] },
  properties: {
    ID: processedRecord.area_id,
    DESCRIPTION: processedRecord.area_name,
    value: processedRecord.value,
    // This is the critical mapping from line 1675
    strategic_value_score: typeof processedRecord.strategic_value_score === 'number' ? 
      processedRecord.strategic_value_score : 
      (typeof processedRecord.properties?.strategic_value_score === 'number' ? 
        processedRecord.properties.strategic_value_score : 
        (typeof processedRecord.value === 'number' ? processedRecord.value : 0))
  }
};

console.log('3. Mapped feature for ArcGIS:');
console.log('   - Feature type:', mappedFeature.type);
console.log('   - Has geometry:', !!mappedFeature.geometry);
console.log('   - Properties keys:', Object.keys(mappedFeature.properties));
console.log('   - strategic_value_score in properties:', 'strategic_value_score' in mappedFeature.properties);
console.log('   - strategic_value_score value:', mappedFeature.properties.strategic_value_score);

// 4. Test what the ChoroplethRenderer would try to access
const rendererConfig = { valueField: 'strategic_value_score' };
const fieldToUse = rendererConfig.valueField || 'value';

console.log('4. Renderer access simulation:');
console.log('   - Renderer trying to access field:', fieldToUse);
console.log('   - Field exists in properties:', fieldToUse in mappedFeature.properties);
console.log('   - Field value:', mappedFeature.properties[fieldToUse]);

// 5. Check if there are any issues
console.log('5. Issue analysis:');
if (mappedFeature.properties[fieldToUse] === undefined) {
  console.log('   ❌ CRITICAL: Field', fieldToUse, 'is undefined in feature properties!');
  console.log('   Available fields:', Object.keys(mappedFeature.properties));
} else if (isNaN(mappedFeature.properties[fieldToUse])) {
  console.log('   ❌ CRITICAL: Field', fieldToUse, 'is not a number:', mappedFeature.properties[fieldToUse]);
} else {
  console.log('   ✅ Field access should work correctly');
  console.log('   Field value type:', typeof mappedFeature.properties[fieldToUse]);
  console.log('   Field value:', mappedFeature.properties[fieldToUse]);
}

// 6. Test multiple features to check for consistency
console.log('6. Testing multiple features:');
const sampleRecords = strategicData.results.slice(0, 5);
const issues = [];

sampleRecords.forEach((record, index) => {
  const processed = {
    strategic_value_score: record.strategic_value_score,
    properties: record
  };
  
  const mapped = typeof processed.strategic_value_score === 'number' ? 
    processed.strategic_value_score : 
    (typeof processed.properties?.strategic_value_score === 'number' ? 
      processed.properties.strategic_value_score : 0);
  
  if (mapped === 0 || mapped === undefined || isNaN(mapped)) {
    issues.push(`Record ${index + 1} (${record.ID}): mapped value is ${mapped}`);
  }
});

if (issues.length > 0) {
  console.log('   ❌ Issues found:');
  issues.forEach(issue => console.log('   ', issue));
} else {
  console.log('   ✅ All sample features have valid strategic_value_score values');
}