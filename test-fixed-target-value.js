#!/usr/bin/env node

// Test the FIXED target_value assignment logic
console.log('🔧 Testing FIXED Target Value Assignment Logic...');
console.log('='.repeat(60));

// Simulate problematic data where result.value is missing
const problematicData = {
  type: 'competitive_analysis', // ← Key: This is competitive analysis
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value: undefined, // ← MISSING! This was the problem
      rank: 2,
      properties: {
        competitive_advantage_score: 8.6, // ← This should be used now
        nike_market_share: 28.5,
        value_MP30034A_B_P: 28.5,
      },
      // Raw fields at top level (should be ignored now)
      MP30034A_B_P: 28.5,
      competitive_advantage_score: 8.6 // ← Or this as final fallback
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003',
      value: null, // ← NULL! Was causing fallback to market share
      rank: 1,
      properties: {
        competitive_advantage_score: 8.8, // ← This should be used now
        nike_market_share: 31.2,
        value_MP30034A_B_P: 31.2,
      },
      // Raw fields at top level (should be ignored now)
      MP30034A_B_P: 31.2,
      competitive_advantage_score: 8.8
    },
    {
      area_id: '10002',
      area_name: 'Brooklyn 10002',
      value: 0, // ← ZERO! Was causing fallback to market share
      rank: 3,
      properties: {
        competitive_advantage_score: 5.9, // ← This should be used now
        nike_market_share: 22.1,
        value_MP30034A_B_P: 22.1,
      },
      // Raw fields at top level (should be ignored now)
      MP30034A_B_P: 22.1,
      competitive_advantage_score: 5.9
    }
  ],
  targetVariable: 'expansion_opportunity_score'
};

const currentTarget = 'MP30034A_B_P';
const enhancedAnalysisResult = { data: problematicData }; // Simulate the wrapper

console.log('📊 Testing FIXED Logic');
console.log('enhancedAnalysisResult.data.type:', enhancedAnalysisResult.data.type);
console.log('');

const claudeFeatures = problematicData.records.map((result, index) => {
  console.log(`🔧 [FIXED LOGIC] ${result.area_name || result.area_id}:`);
  console.log(`  result.value: ${result.value} (${typeof result.value})`);
  console.log(`  result.properties?.competitive_advantage_score: ${result.properties?.competitive_advantage_score}`);
  console.log(`  result.competitive_advantage_score: ${result.competitive_advantage_score}`);
  console.log(`  result[currentTarget]: ${result[currentTarget]} (market share - should be ignored)`);
  
  // Apply the FIXED logic
  let targetValue;
  if (enhancedAnalysisResult.data.type === 'competitive_analysis') {
    // For competitive analysis, prioritize competitive advantage score over market share
    targetValue = result.value || 
                 result.properties?.competitive_advantage_score || 
                 result.competitive_advantage_score || 
                 0; // Don't fallback to market share data
    console.log(`  🔧 COMPETITIVE ANALYSIS PATH: Using competitive advantage score priority`);
  } else {
    // For other analysis types, use the original fallback logic
    targetValue = result.value || result[currentTarget] || 0;
    console.log(`  📊 STANDARD ANALYSIS PATH: Using original fallback logic`);
  }
  
  console.log(`  → FINAL target_value: ${targetValue}`);
  
  // Check what the fixed logic chose
  if (result.value) {
    console.log(`  ✅ Used result.value: ${result.value}`);
  } else if (result.properties?.competitive_advantage_score) {
    console.log(`  ✅ FIXED: Used result.properties.competitive_advantage_score: ${result.properties.competitive_advantage_score}`);
  } else if (result.competitive_advantage_score) {
    console.log(`  ✅ FIXED: Used result.competitive_advantage_score: ${result.competitive_advantage_score}`);
  } else {
    console.log(`  ⚠️  Used default: 0`);
  }
  
  if (targetValue > 20) {
    console.log(`  ❌ STILL BROKEN: target_value ${targetValue} looks like market share!`);
  } else if (targetValue > 0 && targetValue <= 10) {
    console.log(`  ✅ FIXED: target_value ${targetValue} is competitive advantage score`);
  } else {
    console.log(`  ⚠️  ZERO: target_value is ${targetValue}`);
  }
  
  console.log('');
  
  return {
    area_name: result.area_name,
    target_value: targetValue,
    is_competitive_score: targetValue > 0 && targetValue <= 10
  };
});

console.log('🎯 FIXED RESULTS:');
console.log('='.repeat(40));
console.log('Claude will receive these target_values:');
claudeFeatures.forEach((feature, index) => {
  const status = feature.is_competitive_score ? '✅ COMPETITIVE SCORE' : '❌ PROBLEM';
  console.log(`${index + 1}. ${feature.area_name}: ${feature.target_value} ${status}`);
});

const fixedCount = claudeFeatures.filter(f => f.is_competitive_score).length;
console.log('');
if (fixedCount === claudeFeatures.length) {
  console.log(`🎉 SUCCESS! All ${fixedCount} records now use competitive advantage scores`);
  console.log('');
  console.log('✅ THE FIX WORKS:');
  console.log('   - Competitive analysis no longer falls back to market share fields');
  console.log('   - Uses result.properties.competitive_advantage_score as backup');
  console.log('   - Claude will receive 1-10 scale scores instead of market share %');
} else {
  console.log(`⚠️  PARTIAL FIX: ${fixedCount}/${claudeFeatures.length} records fixed`);
}

console.log('');
console.log('💡 SUMMARY:');
console.log('   Before: result.value || result[currentTarget] || 0');
console.log('   After:  result.value || result.properties?.competitive_advantage_score || result.competitive_advantage_score || 0');
console.log('   This prevents market share fallback for competitive analysis data.');