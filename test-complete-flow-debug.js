#!/usr/bin/env node

// Test the complete flow from CompetitiveDataProcessor to Claude
console.log('🔍 Testing Complete Flow: CompetitiveDataProcessor → Claude');
console.log('='.repeat(70));

// STEP 1: CompetitiveDataProcessor output (confirmed working)
const competitiveProcessorData = {
  type: 'competitive_analysis', // ← CRITICAL: This should trigger the correct logic
  records: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value: 8.6, // ← Competitive advantage score
      rank: 2,
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        value_MP30034A_B_P: 28.5,  // Raw Nike market share - POTENTIAL PROBLEM
        value_MP30029A_B_P: 18.2   // Raw Adidas market share
      }
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003', 
      value: 8.8, // ← Competitive advantage score (TOP RANKED)
      rank: 1,
      properties: {
        competitive_advantage_score: 8.8,
        nike_market_share: 31.2,
        value_MP30034A_B_P: 31.2,  // Raw Nike market share - POTENTIAL PROBLEM
        value_MP30029A_B_P: 15.8   // Raw Adidas market share
      }
    }
  ],
  targetVariable: 'expansion_opportunity_score'
};

console.log('📊 STEP 1: CompetitiveDataProcessor Output');
console.log('Type:', competitiveProcessorData.type);
console.log('Records:', competitiveProcessorData.records.length);
console.log('Top record value:', competitiveProcessorData.records[1].value); // Queens is rank 1
console.log('');

// STEP 2: Simulate visualization creation (line 1618-1621 logic)
console.log('⚙️  STEP 2: Thematic Value Assignment (lines 1618-1621)');

const visualizationFeatures = competitiveProcessorData.records.map((record, index) => {
  console.log(`Processing ${record.area_name}:`);
  console.log(`  data.type: '${competitiveProcessorData.type}'`);
  console.log(`  record.value: ${record.value} (${typeof record.value})`);
  console.log(`  record.properties.thematic_value: ${record.properties.thematic_value} (${typeof record.properties.thematic_value})`);
  
  // Simulate the thematic_value logic from lines 1618-1621
  const thematic_value = (() => {
    const rawValue = competitiveProcessorData.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                     typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                     typeof record.value === 'number' ? record.value : 0;
    
    console.log(`  → rawValue calculation result: ${rawValue}`);
    
    // AGGRESSIVE CAPPING logic (lines 1623+)
    let thematicValue = rawValue;
    if (rawValue > 10) {
      // This should NOT happen if competitive scores are 1-10
      thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
      console.log(`  🔧 CAPPED: ${rawValue} → ${thematicValue} (divided by 10)`);
    } else {
      console.log(`  ✅ NO CAPPING: ${rawValue} (already ≤10)`);
    }
    
    return thematicValue;
  })();
  
  const feature = {
    properties: {
      ID: record.area_id,
      DESCRIPTION: record.area_name,
      area_name: record.area_name,
      value: record.value,
      thematic_value: thematic_value, // ← This is what gets used later
      // Raw market share data that could cause problems
      value_MP30034A_B_P: record.properties.value_MP30034A_B_P,
      value_MP30029A_B_P: record.properties.value_MP30029A_B_P
    }
  };
  
  console.log(`  → Final thematic_value: ${feature.properties.thematic_value}`);
  console.log('');
  
  return feature;
});

console.log('🎯 STEP 3: Feature Filtering & Sorting (lines 2772-2791)');

// Filter features with thematic_value (line 2772)
const filteredFeatures = visualizationFeatures.filter(f => f.properties?.thematic_value != null);
console.log('Features after filtering:', filteredFeatures.length);

// Sort by thematic value with capping logic (lines 2778-2791)  
const sortedByThematic = filteredFeatures.map(f => {
  const originalThematic = f.properties?.thematic_value || 0;
  let cappedThematic = originalThematic;
  
  console.log(`${f.properties?.DESCRIPTION}: originalThematic=${originalThematic}`);
  
  // Capping logic for competitive analysis (lines 2782-2787)
  if (originalThematic > 10) {
    cappedThematic = Math.max(1.0, Math.min(10.0, originalThematic / 10));
    console.log(`  🔧 CAPPING: ${originalThematic} → ${cappedThematic.toFixed(1)}`);
  } else {
    console.log(`  ✅ NO CAPPING: ${originalThematic} (already ≤10)`);
  }
  
  return {
    ...f,
    originalThematic,
    cappedThematic
  };
}).sort((a, b) => (b.cappedThematic || 0) - (a.cappedThematic || 0));

console.log('');
console.log('📈 STEP 4: Top Performers Creation (lines 2793-2824)');

const topPerformers = sortedByThematic.slice(0, 20).map(f => {
  const competitiveScore = f.cappedThematic; // ← This becomes competitive_advantage_score
  
  const performerData = {
    description: f.properties?.DESCRIPTION,
    competitive_advantage_score: competitiveScore, // ← Sent to Claude
    // Market share context data
    value_MP30034A_B_P: f.properties?.value_MP30034A_B_P, // Nike market share %
    value_MP30029A_B_P: f.properties?.value_MP30029A_B_P  // Adidas market share %
  };
  
  console.log(`${performerData.description}:`);
  console.log(`  competitive_advantage_score: ${performerData.competitive_advantage_score} ← TO CLAUDE`);
  console.log(`  Nike market share context: ${performerData.value_MP30034A_B_P}% ← CONTEXT ONLY`);
  
  return performerData;
});

console.log('');
console.log('🎯 FINAL VERIFICATION:');
console.log('='.repeat(50));
console.log('Data being sent to Claude API:');
topPerformers.forEach((performer, index) => {
  console.log(`${index + 1}. ${performer.description}: competitive_advantage_score = ${performer.competitive_advantage_score}`);
});

console.log('');
const firstScore = topPerformers[0].competitive_advantage_score;
if (firstScore > 20) {
  console.log('❌ PROBLEM FOUND: Claude is receiving market share percentages instead of competitive scores!');
  console.log(`   First score: ${firstScore} (looks like market share %)`);
  console.log('   Expected: 1-10 competitive advantage score');
  console.log('');
  console.log('🔍 ROOT CAUSE ANALYSIS:');
  console.log('   1. Check if data.type === "competitive_analysis" is correctly set'); 
  console.log('   2. Check if record.value contains the competitive scores from CompetitiveDataProcessor');
  console.log('   3. Check if raw market share data is overwriting competitive scores somewhere');
} else {
  console.log('✅ SUCCESS: Claude should receive competitive advantage scores (1-10 scale)');
  console.log(`   First score: ${firstScore} - appears to be a competitive advantage score`);
}

console.log('');
console.log('💡 KEY INSIGHT: If this test shows correct values but Claude still gets market share,');
console.log('   the issue is in the actual data flow, not the logic.');