#!/usr/bin/env node

// Test the target_value assignment logic that sends data to Claude
console.log('🔍 Testing Target Value Assignment Logic...');
console.log('='.repeat(60));

// Simulate what CompetitiveDataProcessor produces
const competitiveProcessorOutput = {
  type: 'competitive_analysis',
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value: 8.6, // ← Competitive advantage score from processor
      rank: 2,
      category: 'competitive',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 8.6,
        market_share: 0.285,
        nike_market_share: 28.5,
        adidas_market_share: 18.2,
        jordan_market_share: 12.1,
        nike_shap: 0.15,
        adidas_shap: -0.08,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 28.5,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 18.2,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: 0.15,   // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: -0.08   // Adidas SHAP - RAW DATA
      },
      // CRITICAL: Check if these fields exist at the top level
      MP30034A_B_P: 28.5,  // ← This could be the problem!
      MP30029A_B_P: 18.2,
      value_MP30034A_B_P: 28.5,
      value_MP30029A_B_P: 18.2
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003',
      value: 8.8, // ← Competitive advantage score (TOP RANKED)
      rank: 1,
      category: 'competitive',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 8.8,
        market_share: 0.312,
        nike_market_share: 31.2,
        adidas_market_share: 15.8,
        jordan_market_share: 14.5,
        nike_shap: 0.22,
        adidas_shap: -0.15,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 31.2,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 15.8,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: 0.22,   // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: -0.15   // Adidas SHAP - RAW DATA
      },
      // CRITICAL: Check if these fields exist at the top level
      MP30034A_B_P: 31.2,  // ← This could be the problem!
      MP30029A_B_P: 15.8,
      value_MP30034A_B_P: 31.2,
      value_MP30029A_B_P: 15.8
    },
    {
      area_id: '10002',
      area_name: 'Brooklyn 10002',
      value: 5.9, // ← Competitive advantage score
      rank: 3,
      category: 'challenged',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 5.9,
        market_share: 0.221,
        nike_market_share: 22.1,
        adidas_market_share: 25.3,
        jordan_market_share: 8.7,
        nike_shap: -0.05,
        adidas_shap: 0.12,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 22.1,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 25.3,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: -0.05,  // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: 0.12    // Adidas SHAP - RAW DATA
      },
      // CRITICAL: Check if these fields exist at the top level
      MP30034A_B_P: 22.1,  // ← This could be the problem!
      MP30029A_B_P: 25.3,
      value_MP30034A_B_P: 22.1,
      value_MP30029A_B_P: 25.3
    }
  ],
  targetVariable: 'expansion_opportunity_score'
};

// Simulate the variables from the actual code
const currentTarget = 'MP30034A_B_P'; // Corrected Nike market share field
const targetPretty = 'Nike Expansion Opportunity';

console.log('📊 STEP 1: Testing Target Value Logic');
console.log('currentTarget field:', currentTarget);
console.log('');

// Simulate the problematic code from line 2545
const claudeFeatures = competitiveProcessorOutput.records.slice(0, 20).map((result, index) => {
  console.log(`🔍 [CLAUDE TARGET DEBUG] ${result.area_name || result.area_id}:`);
  console.log(`  result.value: ${result.value} (${typeof result.value})`);
  console.log(`  currentTarget: "${currentTarget}"`);
  console.log(`  result[currentTarget]: ${result[currentTarget]} (${typeof result[currentTarget]})`);
  console.log(`  result.properties?.[currentTarget]: ${result.properties?.[currentTarget]} (${typeof result.properties?.[currentTarget]})`);
  
  const targetValue = result.value || result[currentTarget] || 0;
  console.log(`  → FINAL target_value: ${targetValue}`);
  
  if (targetValue > 20) {
    console.log(`  ❌ PROBLEM: target_value ${targetValue} looks like market share % instead of competitive score!`);
    console.log(`    This happens because result[${currentTarget}] = ${result[currentTarget]} exists and overrides result.value = ${result.value}`);
  } else if (targetValue > 0 && targetValue <= 10) {
    console.log(`  ✅ GOOD: target_value ${targetValue} appears to be competitive advantage score`);
  }
  
  console.log('');
  
  return {
    area_name: result.area_name,
    target_value: targetValue,
    result_value: result.value,
    result_currentTarget: result[currentTarget]
  };
});

console.log('🎯 STEP 2: Final Analysis');
console.log('='.repeat(40));
console.log('Claude will receive these target_values:');
claudeFeatures.forEach((feature, index) => {
  console.log(`${index + 1}. ${feature.area_name}: ${feature.target_value}`);
  if (feature.target_value !== feature.result_value) {
    console.log(`   ⚠️  MISMATCH: result.value was ${feature.result_value} but target_value is ${feature.target_value}`);
    console.log(`   This means result[${currentTarget}] = ${feature.result_currentTarget} overrode the competitive score`);
  }
});

console.log('');
console.log('💡 ROOT CAUSE ANALYSIS:');
console.log('');

const firstFeature = claudeFeatures[0];
if (firstFeature.target_value > 20) {
  console.log('❌ CONFIRMED ISSUE:');
  console.log(`   Claude receives market share percentages instead of competitive scores`);
  console.log(`   The logic: result.value || result[currentTarget] || 0`);
  console.log(`   Falls back to result[${currentTarget}] which contains market share data`);
  console.log('');
  console.log('🔧 SOLUTION OPTIONS:');
  console.log('   1. Remove the result[currentTarget] fallback for competitive analysis');
  console.log('   2. Ensure competitive analysis records don\'t have raw market share fields at top level');
  console.log('   3. Check data.type === "competitive_analysis" before using fallback logic');
} else {
  console.log('✅ NO ISSUE DETECTED:');
  console.log('   Claude would receive competitive advantage scores correctly');
}

console.log('');
console.log('🔍 KEY INSIGHT:');
console.log('   If result[MP30034A_B_P] exists and contains market share data,');
console.log('   it will override result.value even when result.value contains the correct competitive score.');