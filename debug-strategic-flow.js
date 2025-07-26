#!/usr/bin/env node

/**
 * Debug Strategic Analysis Flow
 * Simulate the complete strategic analysis flow to find where it breaks
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Strategic Analysis Flow...\n');

// Step 1: Test field detection (getRelevantFields simulation)
console.log('1️⃣ Testing Field Detection...');
const query = "Show me strategic markets for Nike expansion";
const queryLower = query.toLowerCase();

// Simulate getRelevantFields logic
let detectedFields = [];
if (queryLower.includes('strategic') || queryLower.includes('expansion') || 
    queryLower.includes('invest') || queryLower.includes('opportunity')) {
  // This should find strategic fields
  detectedFields = ['strategic_value_score']; // Simulate finding the field
  console.log('✅ Field detection would find:', detectedFields);
} else {
  console.log('❌ Field detection would miss strategic keywords');
}

// Step 2: Test strategic analysis data loading
console.log('\n2️⃣ Testing Strategic Analysis Data...');
const strategicDataPath = path.join(__dirname, 'public/data/endpoints/strategic-analysis.json');
let strategicData;
try {
  strategicData = JSON.parse(fs.readFileSync(strategicDataPath, 'utf8'));
  console.log('✅ Strategic data loaded:', {
    success: strategicData.success,
    analysis_type: strategicData.analysis_type,
    results_count: strategicData.results?.length || 0
  });
  
  if (strategicData.results && strategicData.results.length > 0) {
    const sample = strategicData.results[0];
    console.log('✅ Sample record:', {
      ID: sample.ID,
      DESCRIPTION: sample.DESCRIPTION,
      has_strategic_value_score: sample.strategic_value_score !== undefined,
      strategic_value_score: sample.strategic_value_score
    });
  }
} catch (error) {
  console.log('❌ Failed to load strategic data:', error.message);
}

// Step 3: Test StrategicAnalysisProcessor expectations
console.log('\n3️⃣ Testing StrategicAnalysisProcessor Requirements...');
if (strategicData && strategicData.results) {
  // Simulate what StrategicAnalysisProcessor.validate() checks
  const hasSuccess = strategicData.success === true;
  const hasResultsArray = Array.isArray(strategicData.results);
  const hasStrategicFields = strategicData.results.length === 0 || 
    strategicData.results.some(record => 
      record && 
      (record.area_id || record.id || record.ID) &&
      record.strategic_value_score !== undefined
    );
  
  console.log('Processor validation checks:', {
    hasSuccess: hasSuccess ? '✅' : '❌',
    hasResultsArray: hasResultsArray ? '✅' : '❌', 
    hasStrategicFields: hasStrategicFields ? '✅' : '❌'
  });
  
  if (hasSuccess && hasResultsArray && hasStrategicFields) {
    console.log('✅ StrategicAnalysisProcessor would accept this data');
  } else {
    console.log('❌ StrategicAnalysisProcessor would reject this data');
  }
}

// Step 4: Simulate processor output format
console.log('\n4️⃣ Testing Processor Output Format...');
if (strategicData && strategicData.results && strategicData.results.length > 0) {
  const sampleRecord = strategicData.results[0];
  
  // Simulate what StrategicAnalysisProcessor.processStrategicRecords() produces
  const processedRecord = {
    area_id: sampleRecord.ID || sampleRecord.id,
    area_name: sampleRecord.DESCRIPTION || sampleRecord.description || 'Unknown Area',
    value: sampleRecord.strategic_value_score, // This should be the score
    strategic_value_score: sampleRecord.strategic_value_score, // Also at top level
    rank: 1,
    properties: {
      ...sampleRecord,
      strategic_value_score: sampleRecord.strategic_value_score
    }
  };
  
  console.log('✅ Simulated processor output:', {
    area_name: processedRecord.area_name,
    value: processedRecord.value,
    strategic_value_score: processedRecord.strategic_value_score,
    has_properties: !!processedRecord.properties,
    properties_has_score: processedRecord.properties.strategic_value_score !== undefined
  });
  
  // Step 5: Simulate feature attribute creation
  console.log('\n5️⃣ Testing Feature Attribute Creation...');
  const featureAttributes = {
    OBJECTID: 1,
    area_name: processedRecord.area_name || 'Unknown Area',
    value: typeof processedRecord.value === 'number' ? processedRecord.value : 0,
    // The critical part - strategic_value_score in attributes
    strategic_value_score: typeof processedRecord.strategic_value_score === 'number' ? 
      processedRecord.strategic_value_score : 
      (typeof processedRecord.properties?.strategic_value_score === 'number' ? 
        processedRecord.properties.strategic_value_score : 
        (typeof processedRecord.value === 'number' ? processedRecord.value : 0))
  };
  
  console.log('✅ Simulated feature attributes:', {
    area_name: featureAttributes.area_name,
    value: featureAttributes.value,
    strategic_value_score: featureAttributes.strategic_value_score,
    value_type: typeof featureAttributes.value,
    strategic_score_type: typeof featureAttributes.strategic_value_score
  });
  
  // Step 6: Test quartile renderer requirements
  console.log('\n6️⃣ Testing Quartile Renderer Requirements...');
  const rendererField = 'strategic_value_score';
  const fieldValue = featureAttributes[rendererField];
  
  console.log('Quartile renderer check:', {
    rendererField: rendererField,
    fieldExists: fieldValue !== undefined,
    fieldValue: fieldValue,
    isNumber: typeof fieldValue === 'number',
    isValidNumber: typeof fieldValue === 'number' && !isNaN(fieldValue)
  });
  
  if (typeof fieldValue === 'number' && !isNaN(fieldValue)) {
    console.log('✅ Quartile renderer should work with this data');
  } else {
    console.log('❌ Quartile renderer will fail - field missing or not a number');
  }
}

console.log('\n🎯 SUMMARY:');
console.log('===========');
console.log('If all checks above show ✅, then strategic analysis should work.');
console.log('If any show ❌, that\'s where the issue is.');
console.log('\nMost likely issues:');
console.log('1. Field detection not finding strategic_value_score');
console.log('2. Processor not putting strategic_value_score at record top level');
console.log('3. Feature attributes missing strategic_value_score field');
console.log('4. Quartile renderer not finding the field in feature.attributes[]');