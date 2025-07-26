const fs = require('fs');

console.log('🔬 COMPREHENSIVE ANALYSIS PIPELINE DIAGNOSTIC');
console.log('=' * 80);

// Test 1: Data Files Availability
console.log('\n📁 1. TESTING DATA FILE AVAILABILITY');
const dataFiles = [
  'public/data/endpoints/competitive-analysis.json',
  'public/data/boundaries/zip_boundaries.json'
];

let dataOK = true;
dataFiles.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`✅ ${file}: ${data.results?.length || data.features?.length || Object.keys(data).length} records`);
  } catch (error) {
    console.log(`❌ ${file}: ${error.message}`);
    dataOK = false;
  }
});

if (!dataOK) {
  console.log('🛑 CRITICAL: Data files missing or corrupted');
  process.exit(1);
}

// Test 2: Analysis Engine Components
console.log('\n🧩 2. TESTING ANALYSIS ENGINE COMPONENTS');

// Check if core files exist
const coreFiles = [
  'lib/analysis/AnalysisEngine.ts',
  'lib/analysis/VisualizationRenderer.ts', 
  'lib/analysis/DataProcessor.ts',
  'lib/analysis/strategies/renderers/CompetitiveRenderer.ts',
  'lib/analysis/strategies/processors/CompetitiveDataProcessor.ts'
];

coreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}: exists`);
  } else {
    console.log(`❌ ${file}: missing`);
    dataOK = false;
  }
});

// Test 3: Data Structure Validation
console.log('\n📊 3. TESTING DATA STRUCTURE COMPATIBILITY');

const competitiveData = JSON.parse(fs.readFileSync('public/data/endpoints/competitive-analysis.json', 'utf8'));
const boundaryData = JSON.parse(fs.readFileSync('public/data/boundaries/zip_boundaries.json', 'utf8'));

// Test analysis data structure
console.log('Analysis Data Structure:');
const sampleAnalysis = competitiveData.results[0];
console.log('- Sample record keys:', Object.keys(sampleAnalysis).slice(0, 10));
console.log('- Has ID field:', 'ID' in sampleAnalysis);
console.log('- Has value field:', 'value' in sampleAnalysis || 'score' in sampleAnalysis);
console.log('- Sample ID:', sampleAnalysis.ID);
console.log('- Sample value:', sampleAnalysis.value || sampleAnalysis.score || 'no value');

// Test boundary data structure  
console.log('\nBoundary Data Structure:');
const sampleBoundary = boundaryData.features[0];
console.log('- Feature count:', boundaryData.features.length);
console.log('- Sample properties keys:', Object.keys(sampleBoundary.properties).slice(0, 10));
console.log('- Has ID field:', 'ID' in sampleBoundary.properties);
console.log('- Has centroid:', 'centroid' in sampleBoundary.properties);
console.log('- Sample boundary ID:', sampleBoundary.properties.ID);
console.log('- Geometry type:', sampleBoundary.geometry.type);

// Test 4: Join Compatibility
console.log('\n🔗 4. TESTING JOIN COMPATIBILITY');

// Test ID matching
let matchCount = 0;
const testAnalysisRecords = competitiveData.results.slice(0, 100);

testAnalysisRecords.forEach(record => {
  const recordId = String(record.ID);
  const boundaryMatch = boundaryData.features.find(f => 
    f.properties && String(f.properties.ID) === recordId
  );
  if (boundaryMatch) matchCount++;
});

console.log(`- Join test: ${matchCount}/${testAnalysisRecords.length} records matched`);
console.log(`- Join rate: ${Math.round((matchCount/testAnalysisRecords.length)*100)}%`);

if (matchCount === 0) {
  console.log('🛑 CRITICAL: No records can be joined - ID mismatch issue');
  
  // Debug ID formats
  console.log('\nID Format Analysis:');
  console.log('- Analysis IDs (first 5):', competitiveData.results.slice(0,5).map(r => `${r.ID} (${typeof r.ID})`));
  console.log('- Boundary IDs (first 5):', boundaryData.features.slice(0,5).map(f => `${f.properties.ID} (${typeof f.properties.ID})`));
}

// Test 5: Centroid Availability
console.log('\n🎯 5. TESTING CENTROID AVAILABILITY');

let centroidCount = 0;
boundaryData.features.slice(0, 100).forEach(feature => {
  if (feature.properties.centroid && feature.properties.centroid.coordinates) {
    centroidCount++;
  }
});

console.log(`- Centroids available: ${centroidCount}/100 tested features`);
console.log(`- Centroid rate: ${centroidCount}%`);

if (centroidCount === 0) {
  console.log('🛑 CRITICAL: No centroids available - competitive analysis will fail');
}

// Test 6: Field Mapping Validation
console.log('\n🏷️ 6. TESTING FIELD MAPPING');

const requiredFields = ['ID', 'value', 'area_name'];
const availableAnalysisFields = Object.keys(sampleAnalysis);
const availableBoundaryFields = Object.keys(sampleBoundary.properties);

console.log('Required fields check:');
requiredFields.forEach(field => {
  const inAnalysis = availableAnalysisFields.includes(field) || 
                     availableAnalysisFields.includes(field.toLowerCase()) ||
                     (field === 'value' && (availableAnalysisFields.includes('score') || availableAnalysisFields.includes('value')));
  const inBoundary = availableBoundaryFields.includes(field);
  console.log(`- ${field}: Analysis=${inAnalysis}, Boundary=${inBoundary}`);
});

console.log('\n📋 DIAGNOSIS SUMMARY:');
console.log('Data files:', dataOK ? '✅ Available' : '❌ Missing');
console.log('Join compatibility:', matchCount > 0 ? '✅ Working' : '❌ Broken');
console.log('Centroid support:', centroidCount > 0 ? '✅ Available' : '❌ Missing');

if (dataOK && matchCount > 50 && centroidCount > 50) {
  console.log('\n🎉 PIPELINE STATUS: Data layer looks good - issue is likely in frontend code');
} else {
  console.log('\n🛑 PIPELINE STATUS: Critical data issues found - fix these first');
}
