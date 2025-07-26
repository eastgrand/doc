#!/usr/bin/env node

/**
 * Debug script to trace the exact competitive analysis flow
 * and find where the 0-10 score is being lost
 */

console.log('🔍 DEBUGGING COMPETITIVE ANALYSIS DATA FLOW');
console.log('============================================\n');

const fs = require('fs');
const path = require('path');

// Step 1: Check raw cached data
console.log('📁 STEP 1: RAW CACHED DATA');
console.log('-------------------------');

const dataPath = './public/data/endpoints/competitive-analysis.json';
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log('Raw data structure:');
console.log('  Total records:', rawData.results?.length || 0);
console.log('  Has value field:', rawData.results?.[0]?.value !== undefined);
console.log('  Sample Nike share:', rawData.results?.[0]?.value_MP30034A_B_P);
console.log('  Sample record keys (first 10):', Object.keys(rawData.results?.[0] || {}).slice(0, 10));

// Step 2: Simulate CompetitiveDataProcessor logic
console.log('\n⚙️  STEP 2: SIMULATED COMPETITIVE PROCESSOR');
console.log('------------------------------------------');

function calculateCompetitiveAdvantageScore(record) {
  // Simplified version of the calculation
  const nikeShare = Number(record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const avgIncome = Number(record.value_AVGHINC_CY) || 50000;
  const totalPop = Number(record.value_TOTPOP_CY) || 1000;
  
  // Start with neutral competitive score (5.0)
  let competitiveScore = 5.0;
  
  // Market position advantage (-2 to +2 points)
  const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
  competitiveScore += shareAdvantage * 0.1;
  
  // Demographic fit advantage
  if (avgIncome >= 35000 && avgIncome <= 150000) {
    const distanceFromOptimal = Math.abs(avgIncome - 75000) / 40000;
    competitiveScore += Math.max(0, 1.5 * (1 - distanceFromOptimal));
  }
  
  // Market scale factor
  const scaleBonus = Math.min(0.5, totalPop / 50000);
  competitiveScore += scaleBonus;
  
  // Final score bounds (0.0 - 10.0 range)
  return Math.max(0.0, Math.min(10.0, competitiveScore));
}

// Test the calculation on first 5 records
const sampleRecords = rawData.results?.slice(0, 5) || [];
console.log('Testing competitive advantage calculation:');

sampleRecords.forEach((record, index) => {
  const calculatedScore = calculateCompetitiveAdvantageScore(record);
  console.log(`  Record ${index + 1} (${record.ID || 'Unknown'}):`, {
    nikeShare: record.value_MP30034A_B_P,
    calculatedScore: calculatedScore.toFixed(2),
    rawValue: record.value,
    inCorrectRange: calculatedScore >= 0 && calculatedScore <= 10 ? '✅ YES' : '❌ NO'
  });
});

// Step 3: Check what the visualization system should receive
console.log('\n🎨 STEP 3: EXPECTED VISUALIZATION INPUT');
console.log('-------------------------------------');

console.log('After CompetitiveDataProcessor, each record should have:');
console.log('  - value: [0-10 competitive advantage score]');
console.log('  - nike_market_share: [Nike share percentage for sizing]');
console.log('  - properties.competitive_advantage_score: [same as value]');
console.log('  - properties.nike_market_share: [for sizing]');

// Step 4: Check renderer field mapping
console.log('\n🔧 STEP 4: RENDERER FIELD MAPPING');
console.log('-------------------------------');

console.log('CompetitiveRenderer should use:');
console.log('  - Color field: "value" (0-10 competitive advantage)');
console.log('  - Size field: "properties.nike_market_share" (Nike %)');
console.log('  - Quintile classification for both dimensions');

// Step 5: Identify potential issues
console.log('\n⚠️  STEP 5: POTENTIAL ISSUES');
console.log('---------------------------');

const issues = [];

if (!rawData.results?.[0]?.value) {
  issues.push('✅ Raw data has no "value" field - CompetitiveDataProcessor should calculate it');
} else {
  issues.push('❌ Raw data has "value" field - might override calculated score');
}

if (rawData.results?.[0]?.value_MP30034A_B_P > 10) {
  issues.push('✅ Nike market share is >10 (percentage format) - correct');
} else {
  issues.push('❌ Nike market share might be in wrong format');
}

if (!issues.length) {
  issues.push('No obvious data issues found');
}

console.log('Analysis:');
issues.forEach(issue => console.log(`  ${issue}`));

console.log('\n🎯 CONCLUSION');
console.log('-------------');
console.log('The issue is likely in one of these places:');
console.log('1. CompetitiveDataProcessor not being called for /competitive-analysis');
console.log('2. Data joining process overwriting calculated values with raw values');
console.log('3. Renderer using wrong field for color mapping');
console.log('4. Frontend receiving raw data instead of processed data');

console.log('\n🔧 NEXT STEPS:');
console.log('1. Add debug logging to verify CompetitiveDataProcessor is called');
console.log('2. Check data joining process preserves calculated values');
console.log('3. Verify renderer field mappings are correct');
console.log('4. Test end-to-end flow with console logs');