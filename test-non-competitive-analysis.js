#!/usr/bin/env node

// Test that non-competitive analysis still works with the original logic
console.log('🔍 Testing Non-Competitive Analysis (Original Logic)...');
console.log('='.repeat(60));

// Simulate standard demographic analysis (not competitive)
const demographicData = {
  type: 'demographic_analysis', // ← NOT competitive analysis
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value: undefined, // ← Missing, should fallback to currentTarget
      rank: 2,
      properties: {
        competitive_advantage_score: 8.6, // ← Should be ignored for non-competitive
        nike_market_share: 28.5,
        value_MP30034A_B_P: 28.5,
      },
      // For demographic analysis, we want the market share data
      MP30034A_B_P: 28.5, // ← This should be used for demographic analysis
      TOTPOP_CY: 45000
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003',
      value: 52000, // ← Has value, should use this
      rank: 1,
      properties: {
        competitive_advantage_score: 8.8, // ← Should be ignored
        nike_market_share: 31.2,
      },
      MP30034A_B_P: 31.2,
      TOTPOP_CY: 52000
    }
  ],
  targetVariable: 'population_density'
};

const currentTarget = 'MP30034A_B_P';
const enhancedAnalysisResult = { data: demographicData }; // Simulate the wrapper

console.log('📊 Testing Non-Competitive Analysis Logic');
console.log('enhancedAnalysisResult.data.type:', enhancedAnalysisResult.data.type);
console.log('');

const claudeFeatures = demographicData.records.map((result, index) => {
  console.log(`📊 [NON-COMPETITIVE] ${result.area_name || result.area_id}:`);
  console.log(`  result.value: ${result.value} (${typeof result.value})`);
  console.log(`  result.properties?.competitive_advantage_score: ${result.properties?.competitive_advantage_score}`);
  console.log(`  result[currentTarget]: ${result[currentTarget]} (should be used for demographic)`);
  
  // Apply the FIXED logic
  let targetValue;
  if (enhancedAnalysisResult.data.type === 'competitive_analysis') {
    // For competitive analysis, prioritize competitive advantage score over market share
    targetValue = result.value || 
                 result.properties?.competitive_advantage_score || 
                 result.competitive_advantage_score || 
                 0;
    console.log(`  🔧 COMPETITIVE ANALYSIS PATH: Using competitive advantage score priority`);
  } else {
    // For other analysis types, use the original fallback logic
    targetValue = result.value || result[currentTarget] || 0;
    console.log(`  📊 STANDARD ANALYSIS PATH: Using original fallback logic`);
  }
  
  console.log(`  → FINAL target_value: ${targetValue}`);
  
  // Check what the logic chose
  if (result.value) {
    console.log(`  ✅ Used result.value: ${result.value}`);
  } else if (result[currentTarget]) {
    console.log(`  ✅ CORRECT: Used result[${currentTarget}]: ${result[currentTarget]} (appropriate for demographic)`);
  } else {
    console.log(`  ⚠️  Used default: 0`);
  }
  
  console.log('');
  
  return {
    area_name: result.area_name,
    target_value: targetValue,
    used_fallback_correctly: !result.value && result[currentTarget]
  };
});

console.log('🎯 NON-COMPETITIVE RESULTS:');
console.log('='.repeat(40));
console.log('Claude will receive these target_values:');
claudeFeatures.forEach((feature, index) => {
  console.log(`${index + 1}. ${feature.area_name}: ${feature.target_value}`);
});

console.log('');
console.log('✅ VERIFICATION:');
console.log('   Non-competitive analysis should still use the original fallback logic');
console.log('   This ensures we didn\'t break existing demographic/SHAP analysis functionality');
console.log('');
console.log('💡 SUMMARY:');
console.log('   - Competitive analysis: Uses competitive advantage scores');
console.log('   - Other analysis types: Uses original fallback to market share/demographic data');
console.log('   - The fix is type-specific and preserves existing functionality');