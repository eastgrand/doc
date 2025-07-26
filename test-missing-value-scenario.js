#!/usr/bin/env node

// Test what happens when result.value is missing/undefined
console.log('🔍 Testing Missing result.value Scenario...');
console.log('='.repeat(60));

// Simulate data where CompetitiveDataProcessor failed to set result.value properly
const problematicData = {
  type: 'competitive_analysis',
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      // value: undefined, // ← MISSING! This is the problem
      rank: 2,
      category: 'competitive',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        value_MP30034A_B_P: 28.5,
      },
      // Raw fields at top level (from original SHAP data)
      MP30034A_B_P: 28.5,  // ← This will be used as fallback!
      MP30029A_B_P: 18.2,
      value_MP30034A_B_P: 28.5,
      value_MP30029A_B_P: 18.2
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003',
      // value: null, // ← NULL! Another problem scenario
      value: null,
      rank: 1,
      category: 'competitive',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 8.8,
        nike_market_share: 31.2,
        value_MP30034A_B_P: 31.2,
      },
      // Raw fields at top level (from original SHAP data)
      MP30034A_B_P: 31.2,  // ← This will be used as fallback!
      MP30029A_B_P: 15.8,
      value_MP30034A_B_P: 31.2,
      value_MP30029A_B_P: 15.8
    },
    {
      area_id: '10002',
      area_name: 'Brooklyn 10002',
      value: 0, // ← ZERO! Falsy value scenario
      rank: 3,
      category: 'challenged',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 5.9,
        nike_market_share: 22.1,
        value_MP30034A_B_P: 22.1,
      },
      // Raw fields at top level (from original SHAP data)
      MP30034A_B_P: 22.1,  // ← This will be used as fallback!
      MP30029A_B_P: 25.3,
      value_MP30034A_B_P: 22.1,
      value_MP30029A_B_P: 25.3
    }
  ],
  targetVariable: 'expansion_opportunity_score'
};

const currentTarget = 'MP30034A_B_P';

console.log('📊 Testing Fallback Logic: result.value || result[currentTarget] || 0');
console.log('');

const claudeFeatures = problematicData.records.map((result, index) => {
  console.log(`🔍 [CLAUDE TARGET DEBUG] ${result.area_name || result.area_id}:`);
  console.log(`  result.value: ${result.value} (${typeof result.value})`);
  console.log(`  currentTarget: "${currentTarget}"`);
  console.log(`  result[currentTarget]: ${result[currentTarget]} (${typeof result[currentTarget]})`);
  
  const targetValue = result.value || result[currentTarget] || 0;
  console.log(`  → FINAL target_value: ${targetValue}`);
  
  // Check what the fallback logic chose
  if (result.value) {
    console.log(`  ✅ Used result.value: ${result.value}`);
  } else if (result[currentTarget]) {
    console.log(`  ❌ FALLBACK: Used result[${currentTarget}]: ${result[currentTarget]} (market share!)`);
  } else {
    console.log(`  ⚠️  Used default: 0`);
  }
  
  if (targetValue > 20) {
    console.log(`  🚨 BUG: target_value ${targetValue} looks like market share % instead of competitive score!`);
  } else if (targetValue > 0 && targetValue <= 10) {
    console.log(`  ✅ GOOD: target_value ${targetValue} appears to be competitive advantage score`);
  } else {
    console.log(`  ⚠️  ZERO: target_value is ${targetValue}`);
  }
  
  console.log('');
  
  return {
    area_name: result.area_name,
    target_value: targetValue,
    used_fallback: !result.value && result[currentTarget]
  };
});

console.log('🎯 FINAL ANALYSIS:');
console.log('='.repeat(40));
console.log('Claude will receive these target_values:');
claudeFeatures.forEach((feature, index) => {
  const status = feature.used_fallback ? '❌ MARKET SHARE' : '✅ OK';
  console.log(`${index + 1}. ${feature.area_name}: ${feature.target_value} ${status}`);
});

const problemCount = claudeFeatures.filter(f => f.used_fallback).length;
console.log('');
if (problemCount > 0) {
  console.log(`🚨 FOUND THE BUG!`);
  console.log(`   ${problemCount} records are using market share fallback instead of competitive scores`);
  console.log('');
  console.log('💡 ROOT CAUSE:');
  console.log('   CompetitiveDataProcessor is not properly setting result.value');
  console.log('   OR the competitive scores are being lost somewhere in the data flow');
  console.log('');
  console.log('🔧 SOLUTION:');
  console.log('   1. Check why CompetitiveDataProcessor.value assignment is failing');
  console.log('   2. Add data.type === "competitive_analysis" check to avoid fallback');
  console.log('   3. Use result.properties.competitive_advantage_score as backup');
} else {
  console.log('✅ No fallback issues detected in this test');
}

console.log('');
console.log('💡 KEY INSIGHT:');
console.log('   The OR operator || will use result[currentTarget] if result.value is:');
console.log('   - undefined, null, 0, false, "", NaN');
console.log('   This is why market share data appears instead of competitive scores.');