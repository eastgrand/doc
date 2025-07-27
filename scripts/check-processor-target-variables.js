#!/usr/bin/env node
/**
 * Target Variable Analysis Script
 * 
 * This script analyzes all processors in /lib/analysis/strategies/processors/
 * to check which ones are missing their targetVariable fields at the top level
 * of returned records.
 * 
 * Focus areas:
 * - CorrelationAnalysisProcessor (correlation_strength_score)
 * - TrendAnalysisProcessor (trend_strength_score) 
 * - DemographicDataProcessor (demographic_opportunity_score)
 * - AnomalyDetectionProcessor (anomaly_detection_score)
 * - OutlierDetectionProcessor (outlier_detection_score)
 * - FeatureInteractionProcessor (feature_interaction_score)
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
 * Extract target variable from processor source code
 */
function extractTargetVariable(fileContent, fileName) {
  // Look for targetVariable in return statement
  const targetVariableMatch = fileContent.match(/targetVariable:\s*['"`]([^'"`]+)['"`]/);
  
  if (targetVariableMatch) {
    return targetVariableMatch[1];
  }
  
  // Fallback: look for explicit targetVariable assignment
  const fallbackMatch = fileContent.match(/targetVariable\s*=\s*['"`]([^'"`]+)['"`]/);
  if (fallbackMatch) {
    return fallbackMatch[1];
  }
  
  return null;
}

/**
 * Check if target variable is added at top level in processRecords method
 */
function checkTopLevelFieldAddition(fileContent, targetVariable) {
  if (!targetVariable) return { found: false, details: 'No target variable defined' };
  
  // Look for private method that processes records (common pattern)
  const privateProcessMatch = fileContent.match(/private\s+process\w*Records?\([\s\S]*?\):\s*GeographicDataPoint\[\]\s*\{([\s\S]*?)(?=private|\s*\}[\s\S]*?private)/);
  
  let recordsMapping = '';
  
  if (privateProcessMatch) {
    recordsMapping = privateProcessMatch[1];
  } else {
    // Fallback: look for main process method
    const processMethodMatch = fileContent.match(/process\(.*?\):\s*ProcessedAnalysisData\s*\{([\s\S]*?)return\s*\{/);
    if (processMethodMatch) {
      recordsMapping = processMethodMatch[1];
    } else {
      return { found: false, details: 'Could not find records processing logic' };
    }
  }
  
  // Clean up the mapping logic
  recordsMapping = recordsMapping.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  
  // Look for record object creation patterns
  const recordObjectPatterns = [
    /return\s*\{([\s\S]*?)\}(?:\s*\.(?:sort|map)|\s*;)/g,
    /area_id[^}]*?\}(?:\s*\.(?:sort|map)|\s*;)/g,
    /\{\s*area_id[\s\S]*?\}/g
  ];
  
  let recordObjectContent = '';
  for (const pattern of recordObjectPatterns) {
    const matches = [...recordsMapping.matchAll(pattern)];
    if (matches.length > 0) {
      recordObjectContent = matches[0][1] || matches[0][0];
      break;
    }
  }
  
  if (!recordObjectContent) {
    // Try to find any object with typical record fields
    const objectMatch = recordsMapping.match(/\{[\s\S]*?area_id[\s\S]*?\}/);
    if (objectMatch) {
      recordObjectContent = objectMatch[0];
    } else {
      return { found: false, details: 'Could not find record object structure' };
    }
  }
  
  // Check if target variable is added at top level (not just in properties)
  const topLevelPatterns = [
    // Direct assignment: field_name: value
    new RegExp(`\\b${targetVariable}:\\s*\\w+`, 'i'),
    // Variable assignment at top level
    new RegExp(`\\b${targetVariable}:\\s*[a-zA-Z_][a-zA-Z0-9_]*`, 'i'),
    // Spread with override
    new RegExp(`\\.\\.\\.\\w+,\\s*${targetVariable}:`, 'i')
  ];
  
  const topLevelFound = topLevelPatterns.some(pattern => pattern.test(recordObjectContent));
  
  // Check if it's ONLY in properties (which means it's missing from top level)
  const propertiesOnlyPattern = new RegExp(`properties:\\s*\\{[\\s\\S]*?${targetVariable}:`, 'i');
  const onlyInProperties = propertiesOnlyPattern.test(recordObjectContent) && !topLevelFound;
  
  // Look for specific patterns where target variable is used as 'value'
  const valuePatterns = [
    new RegExp(`value:\\s*\\w*${targetVariable.replace(/_/g, '[_\\s]*')}\\w*`, 'i'),
    new RegExp(`value:\\s*Math\\.round\\(\\w*${targetVariable.replace(/_/g, '[_\\s]*')}\\w*`, 'i'),
    new RegExp(`value:\\s*\\w*Score`, 'i'), // Generic score pattern
    // Check for extraction method usage
    new RegExp(`value:\\s*\\w*extract\\w*Score\\w*`, 'i')
  ];
  
  const usedAsValue = valuePatterns.some(pattern => pattern.test(recordObjectContent));
  
  // Additional check: see if the score is extracted and used as value
  const scoreVariablePattern = new RegExp(`(\\w*${targetVariable.replace(/_/g, '\\w*')}\\w*)\\s*=\\s*this\\.extract`, 'i');
  const scoreVariableMatch = recordsMapping.match(scoreVariablePattern);
  const scoreUsedAsValue = scoreVariableMatch && recordObjectContent.includes(`value: ${scoreVariableMatch[1]}`);
  
  if (topLevelFound) {
    return { 
      found: true, 
      details: 'Target variable found at top level',
      usedAsValue: usedAsValue || scoreUsedAsValue,
      onlyInProperties: false,
      recordObjectContent: recordObjectContent.substring(0, 200) + '...'
    };
  } else if (onlyInProperties) {
    return { 
      found: false, 
      details: 'Target variable only found in properties object, missing from top level',
      usedAsValue: usedAsValue || scoreUsedAsValue,
      onlyInProperties: true,
      recordObjectContent: recordObjectContent.substring(0, 200) + '...'
    };
  } else if (usedAsValue || scoreUsedAsValue) {
    return { 
      found: true, 
      details: 'Target variable appears to be used as the main value field',
      usedAsValue: true,
      onlyInProperties: false,
      recordObjectContent: recordObjectContent.substring(0, 200) + '...'
    };
  } else {
    return { 
      found: false, 
      details: 'Target variable not found at top level or as value',
      usedAsValue: false,
      onlyInProperties: false,
      recordObjectContent: recordObjectContent.substring(0, 200) + '...'
    };
  }
}

/**
 * Extract the score extraction method to see what field it prioritizes
 */
function extractScoreExtractionMethod(fileContent, processorName) {
  const scoreMethodPattern = new RegExp(`private\\s+extract\\w*Score\\(.*?\\):\\s*number\\s*\\{([\\s\\S]*?)(?=private|\\}\\s*$)`, 'g');
  const matches = [...fileContent.matchAll(scoreMethodPattern)];
  
  if (matches.length === 0) {
    return 'No score extraction method found';
  }
  
  const extractMethod = matches[0][1];
  
  // Look for prioritized field
  const priorityPattern = /record\.(\w+)\s*!==\s*undefined.*?pre.*?calculated|PRIORITIZE.*?PRE.*?CALCULATED.*?(\w+)/i;
  const priorityMatch = extractMethod.match(priorityPattern);
  
  if (priorityMatch) {
    const field = priorityMatch[1] || priorityMatch[2];
    return `Prioritizes pre-calculated field: ${field}`;
  }
  
  // Look for fallback calculation
  const fallbackPattern = /console\.log.*?No\s+(\w+).*?found.*?calculating/i;
  const fallbackMatch = extractMethod.match(fallbackPattern);
  
  if (fallbackMatch) {
    return `Falls back when ${fallbackMatch[1]} not found`;
  }
  
  return 'Score extraction method found but pattern unclear';
}

/**
 * Analyze a single processor file
 */
function analyzeProcessor(filePath) {
  const fileName = path.basename(filePath, '.ts');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract basic info
  const targetVariable = extractTargetVariable(fileContent, fileName);
  const expectedTarget = FOCUS_PROCESSORS[fileName];
  
  // Check if it's a focus processor
  const isFocusProcessor = Object.keys(FOCUS_PROCESSORS).includes(fileName);
  
  // Check top-level field addition
  const topLevelCheck = checkTopLevelFieldAddition(fileContent, targetVariable || expectedTarget);
  
  // Extract score method info
  const scoreMethodInfo = extractScoreExtractionMethod(fileContent, fileName);
  
  // Determine status
  let status = 'OK';
  let issues = [];
  
  if (isFocusProcessor) {
    if (!targetVariable) {
      status = 'MISSING_TARGET_VARIABLE';
      issues.push('No targetVariable defined in return statement');
    } else if (targetVariable !== expectedTarget) {
      status = 'WRONG_TARGET_VARIABLE';
      issues.push(`Expected ${expectedTarget}, found ${targetVariable}`);
    }
    
    if (!topLevelCheck.found) {
      status = topLevelCheck.onlyInProperties ? 'MISSING_TOP_LEVEL_FIELD' : 'FIELD_NOT_FOUND';
      issues.push(topLevelCheck.details);
    }
  }
  
  return {
    fileName,
    isFocusProcessor,
    targetVariable,
    expectedTarget,
    topLevelCheck,
    scoreMethodInfo,
    status,
    issues,
    needsFix: status !== 'OK' && isFocusProcessor
  };
}

/**
 * Main analysis function
 */
function main() {
  console.log('🔍 Target Variable Analysis for Data Processors');
  console.log('='.repeat(60));
  console.log();
  
  // Get all processor files
  const files = fs.readdirSync(PROCESSORS_DIR)
    .filter(file => file.endsWith('.ts') && file !== 'index.ts')
    .map(file => path.join(PROCESSORS_DIR, file));
  
  console.log(`📂 Found ${files.length} processor files`);
  console.log();
  
  // Analyze each processor
  const results = files.map(analyzeProcessor);
  
  // Focus on key processors first
  const focusResults = results.filter(r => r.isFocusProcessor);
  const otherResults = results.filter(r => !r.isFocusProcessor);
  
  console.log('🎯 FOCUS PROCESSORS ANALYSIS');
  console.log('-'.repeat(40));
  
  focusResults.forEach(result => {
    const statusEmoji = result.status === 'OK' ? '✅' : 
                       result.status === 'MISSING_TOP_LEVEL_FIELD' ? '⚠️' : '❌';
    
    console.log(`${statusEmoji} ${result.fileName}`);
    console.log(`   Target Variable: ${result.targetVariable || 'NOT DEFINED'}`);
    console.log(`   Expected: ${result.expectedTarget}`);
    console.log(`   Top Level Field: ${result.topLevelCheck.found ? 'YES' : 'NO'}`);
    
    if (result.topLevelCheck.usedAsValue) {
      console.log(`   📊 Used as main value field`);
    }
    
    if (result.issues.length > 0) {
      console.log(`   Issues: ${result.issues.join(', ')}`);
    }
    
    console.log(`   Score Method: ${result.scoreMethodInfo}`);
    console.log();
  });
  
  // Summary of issues
  const processorsNeedingFix = focusResults.filter(r => r.needsFix);
  
  console.log('📋 SUMMARY');
  console.log('-'.repeat(20));
  
  if (processorsNeedingFix.length === 0) {
    console.log('✅ All focus processors are correctly implemented!');
  } else {
    console.log(`❌ ${processorsNeedingFix.length} processors need fixing:`);
    console.log();
    
    processorsNeedingFix.forEach(processor => {
      console.log(`🔧 ${processor.fileName}:`);
      processor.issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
      
      // Provide specific fix recommendations
      if (processor.status === 'MISSING_TOP_LEVEL_FIELD') {
        console.log(`   💡 Fix: Add ${processor.expectedTarget} at top level of record object`);
        console.log(`      Example: { ...record, ${processor.expectedTarget}: scoreValue }`);
      }
      
      if (!processor.targetVariable) {
        console.log(`   💡 Fix: Add targetVariable: '${processor.expectedTarget}' to return statement`);
      }
      
      console.log();
    });
  }
  
  // Other processors summary
  if (otherResults.length > 0) {
    console.log('📄 OTHER PROCESSORS');
    console.log('-'.repeat(20));
    
    otherResults.forEach(result => {
      const hasTarget = result.targetVariable ? '✅' : '❓';
      console.log(`${hasTarget} ${result.fileName}: ${result.targetVariable || 'No target variable'}`);
    });
  }
  
  console.log();
  console.log('✨ Analysis complete!');
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { analyzeProcessor, extractTargetVariable, checkTopLevelFieldAddition };