#!/usr/bin/env node

/**
 * Full Analysis Debug Test
 * Tests the complete analysis flow after server restart
 */

const fs = require('fs');
const path = require('path');

// Load the actual TypeScript module content to verify changes
function checkFieldAnalysisModule() {
  console.log('📁 CHECKING FIELD-ANALYSIS.TS MODULE');
  console.log('=' .repeat(60));
  
  const filePath = './app/utils/field-analysis.ts';
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if strategic detection is present
  const hasStrategicDetection = content.includes('For strategic analysis queries');
  const strategicKeywords = content.match(/queryLower\.includes\('strategic'\)/g);
  
  console.log(`✓ Has strategic analysis detection: ${hasStrategicDetection}`);
  console.log(`✓ Strategic keyword checks found: ${strategicKeywords ? strategicKeywords.length : 0}`);
  
  // Extract the strategic detection logic
  const strategicSection = content.match(/\/\/ For strategic analysis queries[\s\S]*?return strategicFields;[\s\S]*?\}/);
  if (strategicSection) {
    console.log('\n📋 Strategic detection logic found:');
    console.log(strategicSection[0].substring(0, 200) + '...');
  }
}

// Test the field detection logic
function testFieldDetection() {
  console.log('\n\n🔍 FIELD DETECTION TEST');
  console.log('=' .repeat(60));
  
  // Load sample data
  const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
  const competitiveData = JSON.parse(fs.readFileSync('./public/data/endpoints/competitive-analysis.json', 'utf8'));
  
  const strategicSample = strategicData.results?.[0] || {};
  const competitiveSample = competitiveData.results?.[0] || {};
  
  console.log('\n📊 Strategic data sample:');
  console.log(`- Has strategic_value_score: ${!!strategicSample.strategic_value_score}`);
  console.log(`- strategic_value_score value: ${strategicSample.strategic_value_score}`);
  console.log(`- Available fields: ${Object.keys(strategicSample).length}`);
  
  console.log('\n🏆 Competitive data sample:');
  console.log(`- Has competitive_advantage_score: ${!!competitiveSample.competitive_advantage_score}`);
  console.log(`- competitive_advantage_score value: ${competitiveSample.competitive_advantage_score}`);
  console.log(`- Available fields: ${Object.keys(competitiveSample).length}`);
}

// Test AnalysisEngine configuration
function checkAnalysisEngine() {
  console.log('\n\n⚙️ ANALYSIS ENGINE CHECK');
  console.log('=' .repeat(60));
  
  const enginePath = './lib/analysis/AnalysisEngine.ts';
  const content = fs.readFileSync(enginePath, 'utf8');
  
  // Check for debug logging
  const hasStrategicDebug = content.includes('[STRATEGIC DEBUG]');
  const hasTargetVariable = content.includes('targetVariable');
  
  console.log(`✓ Has strategic debug logging: ${hasStrategicDebug}`);
  console.log(`✓ Uses targetVariable: ${hasTargetVariable}`);
}

// Check processor configurations
function checkProcessors() {
  console.log('\n\n🔧 PROCESSOR CONFIGURATION CHECK');
  console.log('=' .repeat(60));
  
  // Check StrategicAnalysisProcessor
  const strategicProcessorPath = './lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts';
  if (fs.existsSync(strategicProcessorPath)) {
    const content = fs.readFileSync(strategicProcessorPath, 'utf8');
    const hasTargetVariable = content.includes("targetVariable: 'strategic_value_score'");
    const addsTopLevel = content.includes('strategic_value_score: Math.round');
    console.log('\n📊 StrategicAnalysisProcessor:');
    console.log(`- Sets targetVariable: ${hasTargetVariable}`);
    console.log(`- Adds score at top level: ${addsTopLevel}`);
  }
  
  // Check CompetitiveDataProcessor
  const competitiveProcessorPath = './lib/analysis/strategies/processors/CompetitiveDataProcessor.ts';
  if (fs.existsSync(competitiveProcessorPath)) {
    const content = fs.readFileSync(competitiveProcessorPath, 'utf8');
    const hasTargetVariable = content.includes("targetVariable: 'competitive_advantage_score'");
    const addsTopLevel = content.includes('competitive_advantage_score: competitiveScore');
    console.log('\n🏆 CompetitiveDataProcessor:');
    console.log(`- Sets targetVariable: ${hasTargetVariable}`);
    console.log(`- Adds score at top level: ${addsTopLevel}`);
  }
}

// Check visualization renderer
function checkVisualizationRenderer() {
  console.log('\n\n🎨 VISUALIZATION RENDERER CHECK');
  console.log('=' .repeat(60));
  
  const rendererPath = './lib/analysis/VisualizationRenderer.ts';
  const content = fs.readFileSync(rendererPath, 'utf8');
  
  // Check determineValueField logic
  const hasCompetitiveCheck = content.includes("data.type === 'competitive_analysis'");
  const hasStrategicCheck = content.includes("data.type === 'strategic_analysis'");
  const usesTargetVariable = content.includes('return data.targetVariable');
  
  console.log(`✓ Handles competitive_analysis: ${hasCompetitiveCheck}`);
  console.log(`✓ Handles strategic_analysis: ${hasStrategicCheck}`);
  console.log(`✓ Uses targetVariable: ${usesTargetVariable}`);
}

// Check API route configuration
function checkAPIRoute() {
  console.log('\n\n🌐 API ROUTE CHECK');
  console.log('=' .repeat(60));
  
  const routePath = './app/api/claude/generate-response/route.ts';
  const content = fs.readFileSync(routePath, 'utf8');
  
  // Check import
  const hasImport = content.includes("import { getRelevantFields } from '@/app/utils/field-analysis'");
  console.log(`✓ Imports getRelevantFields: ${hasImport}`);
  
  // Check usage
  const usesGetRelevantFields = content.includes('getRelevantFields(firstFeatureProps');
  console.log(`✓ Uses getRelevantFields: ${usesGetRelevantFields}`);
  
  // Check enhanced metrics
  const hasCompetitiveMetrics = content.includes("case 'competitive_analysis':");
  const hasStrategicMetrics = content.includes("case 'strategic_analysis':");
  console.log(`✓ Has competitive metrics handling: ${hasCompetitiveMetrics}`);
  console.log(`✓ Has strategic metrics handling: ${hasStrategicMetrics}`);
}

// Simulate a complete analysis flow
async function simulateAnalysisFlow() {
  console.log('\n\n🔄 SIMULATING ANALYSIS FLOW');
  console.log('=' .repeat(60));
  
  // Test queries
  const queries = [
    { type: 'strategic', query: 'Show me the top strategic markets for Nike expansion' },
    { type: 'competitive', query: "Compare Nike's market position against competitors" }
  ];
  
  for (const test of queries) {
    console.log(`\n📊 Testing ${test.type} analysis:`);
    console.log(`Query: "${test.query}"`);
    
    // Check if query would match detection logic
    const queryLower = test.query.toLowerCase();
    
    if (test.type === 'strategic') {
      const wouldMatch = queryLower.includes('strategic') || 
                        queryLower.includes('expansion') || 
                        queryLower.includes('invest');
      console.log(`- Would match strategic detection: ${wouldMatch}`);
    } else if (test.type === 'competitive') {
      const wouldMatch = queryLower.includes('competitive') || 
                        queryLower.includes('compete') || 
                        queryLower.includes('position') ||
                        queryLower.includes('compare');
      console.log(`- Would match competitive detection: ${wouldMatch}`);
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 FULL ANALYSIS DEBUG TEST - POST RESTART');
  console.log('=' .repeat(60));
  console.log('Testing after Next.js server restart...\n');
  
  checkFieldAnalysisModule();
  testFieldDetection();
  checkAnalysisEngine();
  checkProcessors();
  checkVisualizationRenderer();
  checkAPIRoute();
  await simulateAnalysisFlow();
  
  console.log('\n\n📋 SUMMARY');
  console.log('=' .repeat(60));
  console.log('All component checks completed.');
  console.log('If all checks pass but the issue persists, the problem may be:');
  console.log('1. Build/compilation issue - check Next.js console for errors');
  console.log('2. Browser cache - try hard refresh (Cmd+Shift+R)');
  console.log('3. Module resolution - check if TypeScript is compiling correctly');
  console.log('4. Runtime override - something else setting the field after our logic');
}

// Run all tests
runAllTests().catch(console.error);