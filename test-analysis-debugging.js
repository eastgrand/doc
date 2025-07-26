#!/usr/bin/env node

/**
 * Local Analysis Debugging Script
 * Tests both strategic and competitive analysis to identify common issues
 */

const fs = require('fs');
const path = require('path');

// Import the key analysis components
const { AnalysisEngine } = require('./lib/analysis/AnalysisEngine.ts');
const { getRelevantFields } = require('./app/utils/field-analysis.ts');

console.log('🔍 ANALYSIS DEBUGGING - Testing Strategic vs Competitive');
console.log('=' .repeat(60));

async function testAnalysisFlow() {
  try {
    // Test data paths
    const strategicPath = './public/data/endpoints/strategic-analysis.json';
    const competitivePath = './public/data/endpoints/competitive_analysis.json';
    
    console.log('\n📁 Loading test data...');
    
    // Load strategic data
    let strategicData = null;
    if (fs.existsSync(strategicPath)) {
      strategicData = JSON.parse(fs.readFileSync(strategicPath, 'utf8'));
      console.log(`✅ Strategic data loaded: ${strategicData.length} records`);
    } else {
      console.log(`❌ Strategic data not found at: ${strategicPath}`);
    }
    
    // Load competitive data
    let competitiveData = null;
    if (fs.existsSync(competitivePath)) {
      competitiveData = JSON.parse(fs.readFileSync(competitivePath, 'utf8'));
      console.log(`✅ Competitive data loaded: ${competitiveData.length} records`);
    } else {
      console.log(`❌ Competitive data not found at: ${competitivePath}`);
    }
    
    if (!strategicData || !competitiveData) {
      console.log('❌ Cannot proceed without both datasets');
      return;
    }
    
    console.log('\n🔍 TESTING FIELD DETECTION');
    console.log('-'.repeat(40));
    
    // Test strategic field detection
    console.log('\n📊 STRATEGIC ANALYSIS FIELDS:');
    const strategicSample = strategicData[0];
    const strategicAvailableFields = Object.keys(strategicSample);
    console.log('Available fields:', strategicAvailableFields.slice(0, 10), '...');
    
    const strategicQuery = "Where should Nike invest for strategic expansion?";
    const strategicRelevantFields = getRelevantFields(strategicSample, strategicQuery);
    console.log('Query:', strategicQuery);
    console.log('Relevant fields returned:', strategicRelevantFields);
    
    // Check for strategic score fields
    const strategicScoreFields = strategicAvailableFields.filter(f => 
      f.includes('strategic') || f.includes('score') || f.includes('value')
    );
    console.log('Strategic-related fields found:', strategicScoreFields);
    
    // Test competitive field detection
    console.log('\n🏆 COMPETITIVE ANALYSIS FIELDS:');
    const competitiveSample = competitiveData[0];
    const competitiveAvailableFields = Object.keys(competitiveSample);
    console.log('Available fields:', competitiveAvailableFields.slice(0, 10), '...');
    
    const competitiveQuery = "Where does Nike have competitive advantage?";
    const competitiveRelevantFields = getRelevantFields(competitiveSample, competitiveQuery);
    console.log('Query:', competitiveQuery);
    console.log('Relevant fields returned:', competitiveRelevantFields);
    
    // Check for competitive score fields
    const competitiveScoreFields = competitiveAvailableFields.filter(f => 
      f.includes('competitive') || f.includes('advantage') || f.includes('score')
    );
    console.log('Competitive-related fields found:', competitiveScoreFields);
    
    console.log('\n🎯 TARGET SCORE FIELD ANALYSIS');
    console.log('-'.repeat(40));
    
    // Check strategic target fields
    console.log('\n📊 Strategic data sample values:');
    console.log('- strategic_value_score:', strategicSample.strategic_value_score);
    console.log('- value:', strategicSample.value);
    console.log('- STRATEGIC_VALUE_SCORE:', strategicSample.STRATEGIC_VALUE_SCORE);
    
    // Check competitive target fields
    console.log('\n🏆 Competitive data sample values:');
    console.log('- competitive_advantage_score:', competitiveSample.competitive_advantage_score);
    console.log('- value:', competitiveSample.value);
    console.log('- value_MP30034A_B_P:', competitiveSample.value_MP30034A_B_P);
    
    console.log('\n📋 FIELD COMPARISON SUMMARY');
    console.log('-'.repeat(40));
    
    console.log('\nStrategic Analysis:');
    console.log('- Has strategic_value_score:', !!strategicSample.strategic_value_score);
    console.log('- Has STRATEGIC_VALUE_SCORE:', !!strategicSample.STRATEGIC_VALUE_SCORE);
    console.log('- getRelevantFields result count:', strategicRelevantFields.length);
    console.log('- Contains strategic fields:', strategicRelevantFields.some(f => f.includes('strategic')));
    
    console.log('\nCompetitive Analysis:');
    console.log('- Has competitive_advantage_score:', !!competitiveSample.competitive_advantage_score);
    console.log('- Has value_MP30034A_B_P:', !!competitiveSample.value_MP30034A_B_P);
    console.log('- getRelevantFields result count:', competitiveRelevantFields.length);
    console.log('- Contains competitive fields:', competitiveRelevantFields.some(f => f.includes('competitive')));
    
    // Test with exact queries that are failing
    console.log('\n🚨 EXACT FAILING QUERIES TEST');
    console.log('-'.repeat(40));
    
    const exactStrategicQuery = "strategic analysis";
    const exactCompetitiveQuery = "competitive analysis";
    
    console.log('\nTesting exact strategic query:', exactStrategicQuery);
    const exactStrategicFields = getRelevantFields(strategicSample, exactStrategicQuery);
    console.log('Result:', exactStrategicFields);
    
    console.log('\nTesting exact competitive query:', exactCompetitiveQuery);
    const exactCompetitiveFields = getRelevantFields(competitiveSample, exactCompetitiveQuery);
    console.log('Result:', exactCompetitiveFields);
    
    console.log('\n✅ Analysis complete - check results above for field detection issues');
    
  } catch (error) {
    console.error('❌ Error during analysis testing:', error);
  }
}

// Run the test
testAnalysisFlow();