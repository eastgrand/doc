#!/usr/bin/env node
/**
 * Final Verification Script - Target Variables
 * 
 * This script provides a definitive check of which processors are missing
 * their targetVariable fields at the top level of records.
 */

const fs = require('fs');
const path = require('path');

const PROCESSORS_DIR = path.join(process.cwd(), 'lib/analysis/strategies/processors');

// Key processors and their expected target variables
const FOCUS_PROCESSORS = {
  'CorrelationAnalysisProcessor': 'correlation_strength_score',
  'TrendAnalysisProcessor': 'trend_strength_score',
  'DemographicDataProcessor': 'demographic_opportunity_score',
  'AnomalyDetectionProcessor': 'anomaly_detection_score',
  'OutlierDetectionProcessor': 'outlier_detection_score',
  'FeatureInteractionProcessor': 'feature_interaction_score'
};

/**
 * Check if target variable exists at top level of record object
 */
function checkTopLevelField(fileContent, targetVariable) {
  // Find the record object creation within processRecords method
  const recordObjectPattern = /return\s*\{[\s\S]*?area_id[\s\S]*?value[\s\S]*?properties[\s\S]*?\}/;
  const recordObjectMatch = fileContent.match(recordObjectPattern);
  
  if (!recordObjectMatch) {
    return { found: false, details: 'Could not find record object structure' };
  }
  
  const recordObject = recordObjectMatch[0];
  
  // Check if target variable is explicitly defined at top level (not in properties)
  const beforeProperties = recordObject.split('properties')[0];
  const topLevelPattern = new RegExp(`\\b${targetVariable}:\\s*\\w+`, 'i');
  
  const hasTopLevelField = topLevelPattern.test(beforeProperties);
  
  // Check if it's in properties
  const propertiesSection = recordObject.split('properties')[1] || '';
  const inProperties = propertiesSection.includes(targetVariable);
  
  return {
    found: hasTopLevelField,
    inProperties,
    recordObject: recordObject.substring(0, 400) + '...',
    details: hasTopLevelField ? 'Found at top level' : (inProperties ? 'Only in properties' : 'Not found')
  };
}

/**
 * Main verification
 */
function main() {
  console.log('🔍 FINAL TARGET VARIABLE VERIFICATION');
  console.log('=====================================\n');
  
  const results = [];
  
  Object.entries(FOCUS_PROCESSORS).forEach(([processorName, targetVariable]) => {
    const filePath = path.join(PROCESSORS_DIR, `${processorName}.ts`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${processorName}: File not found`);
      return;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const topLevelCheck = checkTopLevelField(fileContent, targetVariable);
    
    const status = topLevelCheck.found ? '✅' : '❌';
    const issue = topLevelCheck.found ? 'OK' : 'MISSING FROM TOP LEVEL';
    
    console.log(`${status} ${processorName}`);
    console.log(`   Target Variable: ${targetVariable}`);
    console.log(`   Status: ${issue}`);
    console.log(`   Details: ${topLevelCheck.details}`);
    
    if (!topLevelCheck.found && topLevelCheck.inProperties) {
      console.log(`   🔧 Fix: Add "${targetVariable}: extractedScore," at top level`);
    }
    
    console.log('');
    
    results.push({
      processor: processorName,
      targetVariable,
      hasTopLevel: topLevelCheck.found,
      inProperties: topLevelCheck.inProperties,
      needsFix: !topLevelCheck.found
    });
  });
  
  // Summary
  const needingFixes = results.filter(r => r.needsFix);
  const working = results.filter(r => !r.needsFix);
  
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`✅ Working correctly: ${working.length}`);
  console.log(`❌ Need fixes: ${needingFixes.length}`);
  
  if (needingFixes.length > 0) {
    console.log('\n🔧 PROCESSORS NEEDING FIXES:');
    needingFixes.forEach(r => {
      console.log(`   - ${r.processor}: Add ${r.targetVariable} at top level`);
    });
    
    console.log('\n💡 RECOMMENDED ACTION:');
    console.log('Add the target variable field at the top level of each record object,');
    console.log('alongside area_id, area_name, value, etc. This ensures consistent');
    console.log('data structure and proper field accessibility.');
  } else {
    console.log('\n🎉 All processors correctly implement top-level target variables!');
  }
}

if (require.main === module) {
  main();
}