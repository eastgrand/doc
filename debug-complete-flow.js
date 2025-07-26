#!/usr/bin/env node

/**
 * Complete Flow Debug - Trace Strategic and Competitive Analysis End-to-End
 * This will systematically test every step of the pipeline to find where it breaks
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 COMPLETE FLOW DEBUG - Strategic & Competitive Analysis\n');
console.log('='.repeat(70));

// ============================================================================
// STEP 1: Test Data Loading
// ============================================================================

console.log('\n1️⃣ TESTING DATA LOADING');
console.log('-'.repeat(30));

let strategicData, competitiveData;

try {
  strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  console.log('✅ Strategic data loaded:', {
    success: strategicData.success,
    analysis_type: strategicData.analysis_type,
    results_count: strategicData.results?.length || 0
  });
} catch (error) {
  console.log('❌ Strategic data load failed:', error.message);
}

try {
  competitiveData = JSON.parse(fs.readFileSync('./public/data/endpoints/competitive-analysis.json', 'utf8'));
  console.log('✅ Competitive data loaded:', {
    success: competitiveData.success,
    analysis_type: competitiveData.analysis_type,  
    results_count: competitiveData.results?.length || 0
  });
} catch (error) {
  console.log('❌ Competitive data load failed:', error.message);
}

// ============================================================================
// STEP 2: Test Field Detection Simulation
// ============================================================================

console.log('\n2️⃣ TESTING FIELD DETECTION SIMULATION');
console.log('-'.repeat(40));

function simulateGetRelevantFields(sampleRecord, query) {
  const availableFields = Object.keys(sampleRecord);
  const queryLower = query.toLowerCase();
  
  console.log('Available fields:', availableFields.slice(0, 10));
  
  // Strategic analysis detection
  if (queryLower.includes('strategic') || queryLower.includes('expansion') || 
      queryLower.includes('invest') || queryLower.includes('opportunity')) {
    const strategicFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('strategic') ||
        fieldLower.includes('strategic_value_score') ||
        fieldLower.includes('expansion') ||
        fieldLower.includes('opportunity')
      );
    });
    
    if (strategicFields.length > 0) {
      console.log('✅ Strategic fields found:', strategicFields);
      return strategicFields;
    }
  }
  
  // Competitive analysis detection
  if (queryLower.includes('competitive') || queryLower.includes('compete') || 
      queryLower.includes('competitor') || queryLower.includes('advantage')) {
    const competitiveFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('competitive') ||
        fieldLower.includes('competitive_advantage_score') ||
        fieldLower.includes('advantage') ||
        fieldLower.includes('compete')
      );
    });
    
    if (competitiveFields.length > 0) {
      console.log('✅ Competitive fields found:', competitiveFields);
      return competitiveFields;
    }
  }
  
  console.log('⚠️ No specific fields found, would return all fields');
  return availableFields;
}

if (strategicData?.results?.[0]) {
  const strategicFields = simulateGetRelevantFields(strategicData.results[0], "Show me strategic markets for Nike expansion");
  console.log('Strategic field detection result:', strategicFields.length > 0 ? '✅' : '❌');
}

if (competitiveData?.results?.[0]) {
  const competitiveFields = simulateGetRelevantFields(competitiveData.results[0], "Show me competitive advantage analysis");
  console.log('Competitive field detection result:', competitiveFields.length > 0 ? '✅' : '❌');
}

// ============================================================================
// STEP 3: Test Processor Output Simulation
// ============================================================================

console.log('\n3️⃣ TESTING PROCESSOR OUTPUT SIMULATION');
console.log('-'.repeat(40));

function simulateProcessorOutput(rawData, analysisType, targetVariable) {
  if (!rawData?.results || rawData.results.length === 0) {
    console.log(`❌ No results in ${analysisType} data`);
    return null;
  }
  
  const sample = rawData.results[0];
  const scoreValue = sample[targetVariable];
  
  console.log(`${analysisType} sample record:`, {
    ID: sample.ID,
    DESCRIPTION: sample.DESCRIPTION,
    [targetVariable]: scoreValue,
    hasTargetField: scoreValue !== undefined,
    targetFieldType: typeof scoreValue
  });
  
  if (scoreValue === undefined) {
    console.log(`❌ Target field '${targetVariable}' missing in ${analysisType} data`);
    return null;
  }
  
  // Simulate processor output
  const processedRecord = {
    area_id: sample.ID || sample.id,
    area_name: sample.DESCRIPTION || sample.description || 'Unknown Area',
    value: scoreValue, // This is critical!
    [targetVariable]: scoreValue, // Also at top level
    rank: 1,
    properties: {
      ...sample,
      [targetVariable]: scoreValue
    }
  };
  
  const processorOutput = {
    type: analysisType,
    records: [processedRecord], // Simulate with one record
    targetVariable: targetVariable,
    summary: `${analysisType} complete`,
    statistics: {},
    featureImportance: []
  };
  
  console.log(`✅ ${analysisType} processor output:`, {
    type: processorOutput.type,
    targetVariable: processorOutput.targetVariable,
    recordCount: processorOutput.records.length,
    sampleValue: processorOutput.records[0].value,
    sampleTargetField: processorOutput.records[0][targetVariable]
  });
  
  return processorOutput;
}

const strategicProcessed = simulateProcessorOutput(strategicData, 'strategic_analysis', 'strategic_value_score');
const competitiveProcessed = simulateProcessorOutput(competitiveData, 'competitive_analysis', 'competitive_advantage_score');

// ============================================================================
// STEP 4: Test VisualizationRenderer Logic
// ============================================================================

console.log('\n4️⃣ TESTING VISUALIZATIONRENDERER LOGIC');
console.log('-'.repeat(40));

function simulateVisualizationRenderer(processedData) {
  if (!processedData) return null;
  
  console.log(`Testing VisualizationRenderer for ${processedData.type}:`);
  
  // Step 4a: Test determineVisualizationType
  let visualizationType = 'choropleth'; // Default
  if (processedData.type === 'strategic_analysis') {
    visualizationType = 'choropleth';
    console.log('✅ Strategic analysis → choropleth visualization');
  } else if (processedData.type === 'competitive_analysis') {
    visualizationType = 'choropleth';
    console.log('✅ Competitive analysis → choropleth visualization');
  }
  
  // Step 4b: Test determineValueField
  let valueField = 'value'; // Default
  if (processedData.targetVariable) {
    valueField = processedData.targetVariable;
    console.log(`✅ Using targetVariable: ${valueField}`);
  } else {
    console.log('❌ No targetVariable, using fallback "value"');
  }
  
  // Step 4c: Test visualization config
  const config = {
    valueField: valueField,
    labelField: 'area_name',
    colorScheme: 'blue-to-red',
    classificationMethod: 'quartiles'
  };
  
  console.log(`✅ Visualization config:`, config);
  
  return {
    type: visualizationType,
    config: config,
    valueField: valueField
  };
}

const strategicViz = simulateVisualizationRenderer(strategicProcessed);
const competitiveViz = simulateVisualizationRenderer(competitiveProcessed);

// ============================================================================
// STEP 5: Test ChoroplethRenderer Logic
// ============================================================================

console.log('\n5️⃣ TESTING CHOROPLETHRENDERER LOGIC');
console.log('-'.repeat(40));

function simulateChoroplethRenderer(processedData, vizConfig) {
  if (!processedData || !vizConfig) return null;
  
  console.log(`Testing ChoroplethRenderer for ${processedData.type}:`);
  
  // Step 5a: Test field access
  const fieldToUse = vizConfig.valueField || 'value';
  console.log(`Using field for class breaks: ${fieldToUse}`);
  
  // Step 5b: Test value extraction
  const values = processedData.records.map(r => {
    const value = r[fieldToUse];
    console.log(`Record field access: r[${fieldToUse}] = ${value} (type: ${typeof value})`);
    return value;
  }).filter(v => v !== undefined && !isNaN(v));
  
  console.log(`Values extracted: ${values.length} valid values`, values);
  
  if (values.length === 0) {
    console.log('❌ No valid values found - would create grey visualization');
    return null;
  }
  
  // Step 5c: Test class breaks calculation
  const min = Math.min(...values);
  const max = Math.max(...values);
  console.log(`Value range: ${min} to ${max}`);
  
  if (max > min) {
    console.log('✅ Sufficient value range for colored visualization');
    return {
      fieldUsed: fieldToUse,
      valuesFound: values.length,
      valueRange: [min, max],
      canCreateColors: true
    };
  } else {
    console.log('❌ All values are the same - would create grey visualization');
    return null;
  }
}

const strategicRenderer = simulateChoroplethRenderer(strategicProcessed, strategicViz?.config);
const competitiveRenderer = simulateChoroplethRenderer(competitiveProcessed, competitiveViz?.config);

// ============================================================================
// STEP 6: Test Feature Attribute Mapping
// ============================================================================

console.log('\n6️⃣ TESTING FEATURE ATTRIBUTE MAPPING');
console.log('-'.repeat(40));

function simulateFeatureAttributeMapping(processedData) {
  if (!processedData) return null;
  
  console.log(`Testing feature attribute mapping for ${processedData.type}:`);
  
  const record = processedData.records[0];
  const targetVariable = processedData.targetVariable;
  
  // Simulate the feature attribute creation logic
  const featureAttributes = {
    OBJECTID: 1,
    area_name: record.area_name || 'Unknown Area',
    value: typeof record.value === 'number' ? record.value : 0,
    // The critical mapping for target variables
    strategic_value_score: typeof record.strategic_value_score === 'number' ? 
      record.strategic_value_score : 
      (typeof record.properties?.strategic_value_score === 'number' ? 
        record.properties.strategic_value_score : 
        (typeof record.value === 'number' ? record.value : 0)),
    competitive_advantage_score: typeof record.competitive_advantage_score === 'number' ? 
      record.competitive_advantage_score : 
      (typeof record.properties?.competitive_advantage_score === 'number' ? 
        record.properties.competitive_advantage_score : 
        (typeof record.value === 'number' ? record.value : 0))
  };
  
  console.log(`Feature attributes created:`, {
    area_name: featureAttributes.area_name,
    value: featureAttributes.value,
    strategic_value_score: featureAttributes.strategic_value_score,
    competitive_advantage_score: featureAttributes.competitive_advantage_score,
    targetFieldValue: featureAttributes[targetVariable]
  });
  
  // Check if the renderer can find the target field
  const rendererCanAccessField = featureAttributes[targetVariable] !== undefined && 
                                 typeof featureAttributes[targetVariable] === 'number' &&
                                 !isNaN(featureAttributes[targetVariable]);
  
  console.log(`Renderer field access check:`, {
    targetVariable: targetVariable,
    fieldExists: featureAttributes[targetVariable] !== undefined,
    fieldValue: featureAttributes[targetVariable],
    isNumber: typeof featureAttributes[targetVariable] === 'number',
    isValid: rendererCanAccessField
  });
  
  return {
    canAccess: rendererCanAccessField,
    fieldValue: featureAttributes[targetVariable],
    attributes: featureAttributes
  };
}

const strategicFeatures = simulateFeatureAttributeMapping(strategicProcessed);
const competitiveFeatures = simulateFeatureAttributeMapping(competitiveProcessed);

// ============================================================================
// SUMMARY REPORT
// ============================================================================

console.log('\n🎯 COMPLETE FLOW SUMMARY');
console.log('='.repeat(70));

function reportAnalysis(name, data, processed, viz, renderer, features) {
  console.log(`\n${name.toUpperCase()} ANALYSIS:`);
  console.log('✅ Data loaded:', !!data);
  console.log('✅ Processor output:', !!processed);
  console.log('✅ Visualization config:', !!viz?.config);
  console.log('✅ Renderer logic:', !!renderer?.canCreateColors);
  console.log('✅ Feature attributes:', !!features?.canAccess);
  
  if (!data) console.log('❌ ISSUE: Data not loaded');
  if (!processed) console.log('❌ ISSUE: Processor failed');
  if (!viz?.config) console.log('❌ ISSUE: Visualization config failed');
  if (!renderer?.canCreateColors) console.log('❌ ISSUE: Renderer cannot create colors');
  if (!features?.canAccess) console.log('❌ ISSUE: Feature attributes missing target field');
  
  const allGood = data && processed && viz?.config && renderer?.canCreateColors && features?.canAccess;
  console.log(`OVERALL STATUS: ${allGood ? '✅ SHOULD WORK' : '❌ WILL FAIL'}`);
  
  return allGood;
}

const strategicWorks = reportAnalysis('Strategic', strategicData, strategicProcessed, strategicViz, strategicRenderer, strategicFeatures);
const competitiveWorks = reportAnalysis('Competitive', competitiveData, competitiveProcessed, competitiveViz, competitiveRenderer, competitiveFeatures);

console.log('\n🔧 NEXT STEPS:');
if (!strategicWorks || !competitiveWorks) {
  console.log('❌ Issues found in the flow. Check the detailed output above to identify:');
  console.log('   1. Which step is failing');
  console.log('   2. What data is missing or incorrect'); 
  console.log('   3. Where the field mapping breaks down');
} else {
  console.log('✅ Flow simulation suggests both analyses should work');
  console.log('   If still seeing grey, check browser console for actual errors');
}

console.log('\n' + '='.repeat(70));