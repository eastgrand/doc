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
  // This should find strategic fields (with fallbacks)
  detectedFields = ['strategic_analysis_score', 'strategic_score', 'strategic_value_score'];
  console.log('✅ Field detection would find (with fallbacks):', detectedFields);
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
      has_strategic_analysis_score: sample.strategic_analysis_score !== undefined,
      has_strategic_score: sample.strategic_score !== undefined,
      has_strategic_value_score: sample.strategic_value_score !== undefined,
      strategic_analysis_score: sample.strategic_analysis_score,
      strategic_score: sample.strategic_score,
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
    strategicData.results.some(record => {
      const id = record && (record.area_id || record.id || record.ID);
      const primary = record && (record.strategic_analysis_score ?? record.strategic_score ?? record.strategic_value_score);
      return id && primary !== undefined;
    });
  
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
  const chosenField = sampleRecord.strategic_analysis_score !== undefined
    ? 'strategic_analysis_score'
    : (sampleRecord.strategic_score !== undefined ? 'strategic_score' : 'strategic_value_score');
  const primaryScore = sampleRecord[chosenField];

  // Simulate what StrategicAnalysisProcessor.processStrategicRecords() produces
  const processedRecord = {
    area_id: sampleRecord.ID || sampleRecord.id,
    area_name: sampleRecord.DESCRIPTION || sampleRecord.description || 'Unknown Area',
    value: typeof primaryScore === 'number' ? primaryScore : 0,
    // Normalize both the chosen field and strategic_analysis_score for renderer
    [chosenField]: typeof primaryScore === 'number' ? primaryScore : undefined,
    strategic_analysis_score: typeof primaryScore === 'number' ? primaryScore : undefined,
    rank: 1,
    properties: {
      ...sampleRecord,
      __chosenScoreField: chosenField
    }
  };
  
  console.log('✅ Simulated processor output:', {
    area_name: processedRecord.area_name,
    value: processedRecord.value,
    chosenField,
    has_properties: !!processedRecord.properties,
    normalized_strategic_analysis_score: processedRecord.strategic_analysis_score,
    properties_chosenField: processedRecord.properties.__chosenScoreField
  });
  
  // Step 5: Simulate feature attribute creation
  console.log('\n5️⃣ Testing Feature Attribute Creation...');
  const featureAttributes = {
    OBJECTID: 1,
    area_name: processedRecord.area_name || 'Unknown Area',
    value: typeof processedRecord.value === 'number' ? processedRecord.value : 0,
    // Normalize renderer field to strategic_analysis_score
    strategic_analysis_score: typeof processedRecord.strategic_analysis_score === 'number'
      ? processedRecord.strategic_analysis_score
      : (typeof processedRecord[chosenField] === 'number'
          ? processedRecord[chosenField]
          : (typeof processedRecord.value === 'number' ? processedRecord.value : 0))
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
  const rendererField = 'strategic_analysis_score';
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
console.log('1. Field detection not considering fallback fields (strategic_analysis_score | strategic_score | strategic_value_score)');
console.log('2. Processor not normalizing targetVariable (strategic_analysis_score)');
console.log('3. Feature attributes missing normalized strategic_analysis_score');
console.log('4. Quartile renderer not finding the normalized field in feature.attributes[]');