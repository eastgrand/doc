#!/usr/bin/env node
/**
 * Detailed Target Variable Analysis Script
 * 
 * Analyzes processors to identify exactly where target variables are missing
 * from the top level of returned records.
 */

const fs = require('fs');
const path = require('path');

const PROCESSORS_DIR = path.join(process.cwd(), 'lib/analysis/strategies/processors');

// Key processors to focus on and their expected target variables
const FOCUS_PROCESSORS = {
  'CorrelationAnalysisProcessor': 'correlation_strength_score',
  'TrendAnalysisProcessor': 'trend_strength_score',
  'DemographicDataProcessor': 'demographic_opportunity_score',
  'AnomalyDetectionProcessor': 'anomaly_detection_score',
  'OutlierDetectionProcessor': 'outlier_detection_score',
  'FeatureInteractionProcessor': 'feature_interaction_score'
};

/**
 * Analyze a specific processor file in detail
 */
function analyzeProcessorDetailed(filePath) {
  const fileName = path.basename(filePath, '.ts');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const expectedTarget = FOCUS_PROCESSORS[fileName];
  
  if (!expectedTarget) {
    return null; // Not a focus processor
  }
  
  console.log(`\n🔍 Analyzing ${fileName}`);
  console.log('='.repeat(50));
  
  // 1. Check target variable in return statement
  const targetVariableMatch = fileContent.match(/targetVariable:\s*['"`]([^'"`]+)['"`]/);
  const declaredTarget = targetVariableMatch ? targetVariableMatch[1] : null;
  
  console.log(`📋 Declared targetVariable: ${declaredTarget || 'NOT FOUND'}`);
  console.log(`📋 Expected targetVariable: ${expectedTarget}`);
  
  if (declaredTarget !== expectedTarget) {
    console.log(`❌ Target variable mismatch!`);
  } else {
    console.log(`✅ Target variable correctly declared`);
  }
  
  // 2. Find the score extraction method
  const scoreExtractionMatch = fileContent.match(new RegExp(`private\\s+extract\\w*Score\\([^)]*\\):\\s*number\\s*\\{([\\s\\S]*?)(?=private|\\}\\s*(?:private|\\}\\s*$))`, 'i'));
  
  if (scoreExtractionMatch) {
    const extractionMethod = scoreExtractionMatch[1];
    console.log(`\n📊 Score extraction method found`);
    
    // Check what field it prioritizes
    const priorityFieldMatch = extractionMethod.match(/record\.(\w+)\s*!==\s*undefined/);
    if (priorityFieldMatch) {
      console.log(`   Prioritizes field: ${priorityFieldMatch[1]}`);
    }
    
    // Check if it uses the expected field name
    if (extractionMethod.includes(expectedTarget)) {
      console.log(`   ✅ Uses expected field name: ${expectedTarget}`);
    } else {
      console.log(`   ❌ Does not check for expected field: ${expectedTarget}`);
    }
  }
  
  // 3. Find the record object creation
  const recordProcessingMatch = fileContent.match(/private\s+process\w*Records?\([^)]*\)[\s\S]*?return\s+([\s\S]*?)\.sort/);
  
  if (recordProcessingMatch) {
    const recordProcessing = recordProcessingMatch[1];
    console.log(`\n🏗️  Record object creation found`);
    
    // Find the record object structure
    const recordObjectMatch = recordProcessing.match(/\{[\s\S]*?area_id[\s\S]*?properties[\s\S]*?\}/);
    
    if (recordObjectMatch) {
      const recordObject = recordObjectMatch[0];
      console.log(`\n📝 Record object structure (first 300 chars):`);
      console.log(recordObject.substring(0, 300) + '...');
      
      // Check if target variable is at top level
      const topLevelPattern = new RegExp(`\\b${expectedTarget}:\\s*\\w+`, 'i');
      const hasTopLevel = topLevelPattern.test(recordObject);
      
      console.log(`\n🎯 Target variable at top level: ${hasTopLevel ? 'YES ✅' : 'NO ❌'}`);
      
      // Check if it's in properties
      const propertiesPattern = new RegExp(`properties:\\s*\\{[\\s\\S]*?${expectedTarget}:`, 'i');
      const inProperties = propertiesPattern.test(recordObject);
      
      console.log(`📁 Target variable in properties: ${inProperties ? 'YES' : 'NO'}`);
      
      // Check if score is used as value
      const scoreVariableMatch = recordProcessing.match(new RegExp(`(\\w*Score)\\s*=\\s*this\\.extract`, 'i'));
      if (scoreVariableMatch) {
        const scoreVariable = scoreVariableMatch[1];
        const usedAsValue = recordObject.includes(`value: ${scoreVariable}`);
        console.log(`📊 Score variable '${scoreVariable}' used as value: ${usedAsValue ? 'YES' : 'NO'}`);
      }
      
      // Summary for this processor
      console.log(`\n📊 SUMMARY:`);
      if (!hasTopLevel && inProperties) {
        console.log(`❌ ISSUE: ${expectedTarget} is only in properties, missing from top level`);
        console.log(`💡 FIX NEEDED: Add ${expectedTarget} field at top level of record object`);
      } else if (!hasTopLevel && !inProperties) {
        console.log(`❌ ISSUE: ${expectedTarget} not found anywhere in record`);
        console.log(`💡 FIX NEEDED: Add ${expectedTarget} field to record object`);
      } else if (hasTopLevel) {
        console.log(`✅ OK: ${expectedTarget} found at top level`);
      }
      
      return {
        processor: fileName,
        hasTopLevel,
        inProperties,
        needsFix: !hasTopLevel
      };
    } else {
      console.log(`❌ Could not find record object structure`);
    }
  } else {
    console.log(`❌ Could not find record processing method`);
  }
  
  return {
    processor: fileName,
    hasTopLevel: false,
    inProperties: false,
    needsFix: true
  };
}

/**
 * Main analysis function
 */
function main() {
  console.log('🔍 DETAILED TARGET VARIABLE ANALYSIS');
  console.log('=====================================');
  
  const results = [];
  
  // Analyze each focus processor
  for (const [processorName, targetVariable] of Object.entries(FOCUS_PROCESSORS)) {
    const filePath = path.join(PROCESSORS_DIR, `${processorName}.ts`);
    
    if (fs.existsSync(filePath)) {
      const result = analyzeProcessorDetailed(filePath);
      if (result) {
        results.push(result);
      }
    } else {
      console.log(`❌ File not found: ${processorName}.ts`);
    }
  }
  
  // Overall summary
  console.log('\n\n📋 OVERALL SUMMARY');
  console.log('==================');
  
  const needingFixes = results.filter(r => r.needsFix);
  const workingCorrectly = results.filter(r => !r.needsFix);
  
  if (needingFixes.length === 0) {
    console.log('✅ All processors correctly implement target variables at top level!');
  } else {
    console.log(`❌ ${needingFixes.length} processors need fixes:`);
    needingFixes.forEach(r => {
      console.log(`   - ${r.processor}: Missing ${FOCUS_PROCESSORS[r.processor]} at top level`);
    });
    
    console.log(`\n✅ ${workingCorrectly.length} processors working correctly:`);
    workingCorrectly.forEach(r => {
      console.log(`   - ${r.processor}: Has ${FOCUS_PROCESSORS[r.processor]} at top level`);
    });
  }
  
  console.log('\n🎯 PRIORITY FIXES NEEDED:');
  console.log('-------------------------');
  needingFixes.forEach(r => {
    const targetVar = FOCUS_PROCESSORS[r.processor];
    console.log(`\n${r.processor}:`);
    console.log(`  Add this field at top level of record object:`);
    console.log(`  ${targetVar}: extractedScoreValue,`);
    console.log(`  \n  Example:`);
    console.log(`  return {`);
    console.log(`    area_id,`);
    console.log(`    area_name,`);
    console.log(`    value,`);
    console.log(`    ${targetVar}: extractedScoreValue, // <-- ADD THIS`);
    console.log(`    rank,`);
    console.log(`    category,`);
    console.log(`    coordinates,`);
    console.log(`    properties,`);
    console.log(`    shapValues`);
    console.log(`  };`);
  });
}

// Run the analysis
if (require.main === module) {
  main();
}