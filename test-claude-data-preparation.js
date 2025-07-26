#!/usr/bin/env node

// Test what happens in the Claude data preparation step
console.log('🔍 Testing Claude Data Preparation Issue...');
console.log('='.repeat(60));

// Simulate what the CompetitiveDataProcessor produces (from our previous test)
const competitiveProcessorOutput = {
  type: 'competitive_analysis',
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value: 8.6, // ← Competitive advantage score
      rank: 2,
      category: 'competitive',
      coordinates: [0, 0],
      properties: {
        competitive_advantage_score: 8.6,
        market_share: 0.285,
        nike_market_share: 28.5, // ← Market share percentage
        adidas_market_share: 18.2,
        jordan_market_share: 12.1,
        nike_shap: 0.15,
        adidas_shap: -0.08,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 28.5,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 18.2,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: 0.15,   // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: -0.08   // Adidas SHAP - RAW DATA
      }
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
        nike_market_share: 31.2, // ← Market share percentage
        adidas_market_share: 15.8,
        jordan_market_share: 14.5,
        nike_shap: 0.22,
        adidas_shap: -0.15,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 31.2,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 15.8,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: 0.22,   // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: -0.15   // Adidas SHAP - RAW DATA
      }
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
        nike_market_share: 22.1, // ← Market share percentage
        adidas_market_share: 25.3,
        jordan_market_share: 8.7,
        nike_shap: -0.05,
        adidas_shap: 0.12,
        // Raw SHAP data fields that might still be present
        value_MP30034A_B_P: 22.1,  // Nike market share - RAW DATA
        value_MP30029A_B_P: 25.3,  // Adidas market share - RAW DATA
        shap_MP30034A_B_P: -0.05,  // Nike SHAP - RAW DATA
        shap_MP30029A_B_P: 0.12    // Adidas SHAP - RAW DATA
      }
    }
  ],
  targetVariable: 'expansion_opportunity_score'
};

// Simulate the variables from the actual code
const currentTarget = 'MP30034A_B_P'; // Nike market share field (from line 647)
const targetPretty = 'Nike Expansion Opportunity';

console.log('📊 STEP 1: Enhanced Analysis Result (from CompetitiveDataProcessor)');
console.log('Records:', competitiveProcessorOutput.records.length);
console.log('Top record competitive score:', competitiveProcessorOutput.records[0].value);
console.log('');

console.log('⚙️  STEP 2: Claude Data Preparation Logic Simulation');
console.log('currentTarget field:', currentTarget);
console.log('');

// Simulate the problematic code from lines 2482-2524
const claudeFeatures = competitiveProcessorOutput.records.slice(0, 20).map((result, index) => {
  console.log(`Processing record ${index + 1}: ${result.area_name}`);
  
  // Extract brand market shares (lines 2498-2500)
  const nikeShare = result.properties?.value_MP30034A_B_P || result.value_MP30034A_B_P || 0;
  const adidasShare = result.properties?.value_MP30029A_B_P || result.value_MP30029A_B_P || 0;
  const jordanShare = result.properties?.value_MP30032A_B_P || result.value_MP30032A_B_P || 0;
  
  console.log(`  Raw market shares: Nike ${nikeShare}%, Adidas ${adidasShare}%`);
  
  // THE CRITICAL LINE (2524): target_value calculation
  const target_value = result.value || result[currentTarget] || 0;
  
  console.log(`  🔍 TARGET VALUE LOGIC:`);
  console.log(`    result.value: ${result.value} (competitive score)`);
  console.log(`    result[currentTarget]: ${result[currentTarget]} (${currentTarget})`);
  console.log(`    result.properties[currentTarget]: ${result.properties ? result.properties[currentTarget] : 'undefined'}`);
  console.log(`    → target_value: ${target_value}`);
  
  // Check if result has the currentTarget field directly
  if (result[currentTarget] !== undefined) {
    console.log(`  ❌ PROBLEM: result[${currentTarget}] exists = ${result[currentTarget]}`);
    console.log(`  This will be used instead of competitive score!`);
  } else {
    console.log(`  ✅ GOOD: result[${currentTarget}] is undefined, using result.value`);
  }
  
  const claudeFeature = {
    properties: {
      area_name: result.area_name || result.area_id || 'Unknown Area',
      area_id: result.area_id,
      target_value: target_value,
      target_field: targetPretty,
      rank: result.rank || 0,
      
      // Brand market shares
      nike_market_share: nikeShare,
      adidas_market_share: adidasShare, 
      jordan_market_share: jordanShare
    }
  };
  
  console.log(`  → Final target_value sent to Claude: ${claudeFeature.properties.target_value}`);
  console.log('');
  
  return claudeFeature;
});

console.log('🎯 STEP 3: Final Verification');
console.log('='.repeat(40));
console.log('Claude will receive these values:');
claudeFeatures.forEach((feature, index) => {
  console.log(`${index + 1}. ${feature.properties.area_name}: ${feature.properties.target_value}`);
});

console.log('');
console.log('✅ EXPECTED: Claude should get competitive scores (5.9, 8.6, 8.8)');
console.log('❌ PROBLEM: If Claude gets market share % (22.1, 28.5, 31.2), the issue is found!');

const firstValue = claudeFeatures[0].properties.target_value;
if (firstValue > 20) {
  console.log('');
  console.log('🚨 ISSUE IDENTIFIED:');
  console.log(`  Claude is receiving ${firstValue} instead of competitive score`);
  console.log(`  This looks like Nike market share % instead of competitive advantage`);
  console.log('');
  console.log('💡 ROOT CAUSE:');
  console.log('  The target_value logic: result.value || result[currentTarget] || 0');
  console.log('  is falling back to result[currentTarget] which contains market share data');
  console.log('');
  console.log('🔧 SOLUTION:');
  console.log('  Ensure result.value contains the competitive score from CompetitiveDataProcessor');
  console.log('  or modify the fallback logic to not use market share fields');
} else {
  console.log('');
  console.log('✅ System working correctly - Claude receives competitive scores');
}