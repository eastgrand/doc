#!/usr/bin/env node

// Verify if CompetitiveDataProcessor is actually being called vs bypassed
console.log('🔍 TESTING: Is CompetitiveDataProcessor Actually Being Called?');
console.log('='.repeat(70));

// Test what happens if different processors are used
console.log('📊 SCENARIO 1: CompetitiveDataProcessor is called (what should happen)');

const rawData = {
  success: true,
  results: [
    {
      area_id: '10996',
      area_name: 'New York 10996',
      value_MP30034A_B_P: 27.0,  // Nike market share
      value_MP30029A_B_P: 18.5,  // Adidas market share
      value_MP30032A_B_P: 12.1,  // Jordan market share
      shap_MP30034A_B_P: 0.22,
      shap_MP30029A_B_P: -0.15,
      value_TOTPOP_CY: 45000,
      value_AVGHINC_CY: 68000,
      value_MEDAGE_CY: 29
    }
  ]
};

// Simulate CompetitiveDataProcessor
function competitiveProcessor(data) {
  console.log('🔥 [CompetitiveDataProcessor] Processing...');
  
  const record = data.results[0];
  
  // Calculate competitive score (simplified)
  const nikeShare = record.value_MP30034A_B_P;
  const adidasShare = record.value_MP30029A_B_P;
  const competitiveScore = Math.min(10, Math.max(1, 5 + (nikeShare - adidasShare) * 0.2));
  
  console.log(`  Nike ${nikeShare}% vs Adidas ${adidasShare}% → Score: ${competitiveScore.toFixed(1)}`);
  
  return {
    type: 'competitive_analysis',
    records: [{
      area_id: record.area_id,
      area_name: record.area_name,
      value: competitiveScore, // ← CALCULATED competitive score
      properties: {
        competitive_advantage_score: competitiveScore,
        nike_market_share: nikeShare,
        adidas_market_share: adidasShare
      }
    }]
  };
}

const competitiveResult = competitiveProcessor(rawData);
console.log('Result from CompetitiveDataProcessor:', {
  recordValue: competitiveResult.records[0].value,
  competitiveScore: competitiveResult.records[0].properties.competitive_advantage_score
});
console.log('');

// SCENARIO 2: What if CoreAnalysisProcessor is called instead?
console.log('📊 SCENARIO 2: CoreAnalysisProcessor is called (WRONG - would cause the bug)');

function coreAnalysisProcessor(data) {
  console.log('🔄 [CoreAnalysisProcessor] Processing...');
  
  const record = data.results[0];
  
  // CoreAnalysisProcessor doesn't calculate competitive scores!
  // It would just pass through raw market share data
  console.log(`  No competitive calculation - using raw market share: ${record.value_MP30034A_B_P}%`);
  
  return {
    type: 'analysis', // ← NOT 'competitive_analysis'
    records: [{
      area_id: record.area_id,
      area_name: record.area_name,
      value: record.value_MP30034A_B_P, // ← RAW MARKET SHARE (the bug!)
      properties: {
        // No competitive_advantage_score calculated
        nike_market_share: record.value_MP30034A_B_P,
        adidas_market_share: record.value_MP30029A_B_P,
        // Might have thematic_value set to market share
        thematic_value: record.value_MP30034A_B_P
      }
    }]
  };
}

const coreResult = coreAnalysisProcessor(rawData);
console.log('Result from CoreAnalysisProcessor:', {
  dataType: coreResult.type,
  recordValue: coreResult.records[0].value,
  hasCompetitiveScore: coreResult.records[0].properties.competitive_advantage_score !== undefined,
  thematicValue: coreResult.records[0].properties.thematic_value
});
console.log('');

// SCENARIO 3: Simulate what would happen in thematic_value assignment
console.log('🎯 SCENARIO 3: Thematic Value Assignment Comparison');

function simulateThematicAssignment(analysisResult) {
  const data = analysisResult;
  const record = analysisResult.records[0];
  
  console.log(`Data type: "${data.type}"`);
  console.log(`Record value: ${record.value}`);
  console.log(`Has competitive_advantage_score: ${record.properties.competitive_advantage_score !== undefined}`);
  
  // The critical logic from lines 1618-1640
  const rawValue = data.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                   typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                   typeof record.value === 'number' ? record.value : 0;
  
  console.log(`Thematic value logic result: ${rawValue}`);
  
  return rawValue;
}

console.log('A. With CompetitiveDataProcessor result:');
const thematic1 = simulateThematicAssignment(competitiveResult);
console.log(`  → thematic_value: ${thematic1} (should be competitive score)`);
console.log('');

console.log('B. With CoreAnalysisProcessor result:');
const thematic2 = simulateThematicAssignment(coreResult);
console.log(`  → thematic_value: ${thematic2} (would be market share!)`);
console.log('');

// SCENARIO 4: What would Claude receive?
console.log('📤 SCENARIO 4: What Claude Would Receive');

function simulateClaudePrep(thematicValue) {
  let cappedValue = thematicValue;
  if (thematicValue > 10) {
    cappedValue = Math.max(1.0, Math.min(10.0, thematicValue / 10));
    console.log(`  Capping applied: ${thematicValue} → ${cappedValue.toFixed(1)}`);
  } else {
    console.log(`  No capping needed: ${thematicValue}`);
  }
  
  return {
    description: 'New York 10996',
    competitive_advantage_score: cappedValue
  };
}

console.log('A. If CompetitiveDataProcessor was used:');
const claude1 = simulateClaudePrep(thematic1);
console.log(`  Claude receives: ${claude1.competitive_advantage_score}`);
console.log('');

console.log('B. If CoreAnalysisProcessor was used:');
const claude2 = simulateClaudePrep(thematic2);
console.log(`  Claude receives: ${claude2.competitive_advantage_score}`);
console.log('');

console.log('🎯 DIAGNOSTIC CONCLUSION:');
console.log('='.repeat(50));

if (claude1.competitive_advantage_score >= 1 && claude1.competitive_advantage_score <= 10) {
  console.log('✅ CORRECT PATH: CompetitiveDataProcessor → Competitive scores (1-10)');
  console.log(`   Claude would receive: ${claude1.competitive_advantage_score}`);
} else {
  console.log('❌ WRONG PATH: CompetitiveDataProcessor → Unexpected result');
}

if (claude2.competitive_advantage_score > 10) {
  console.log('❌ BUG PATH: CoreAnalysisProcessor → Market share percentages');
  console.log(`   Claude would receive: ${claude2.competitive_advantage_score} (looks like market share!)`);
  console.log('');
  console.log('🔍 ROOT CAUSE IDENTIFIED:');
  console.log('   If your actual Claude response shows market share percentages,');
  console.log('   then CoreAnalysisProcessor (or similar) is being used instead of');
  console.log('   CompetitiveDataProcessor, bypassing competitive score calculation.');
} else {
  console.log('✅ FALLBACK PATH: CoreAnalysisProcessor → Acceptable result');
}

console.log('');
console.log('💡 NEXT DEBUGGING STEPS:');
console.log('1. Check browser console for "🔥🔥🔥 [COMPETITIVE PROCESSOR] CALLED"');
console.log('2. If missing, CompetitiveDataProcessor is not being used');
console.log('3. Check endpoint selection and processor registration');
console.log('4. Verify no caching is serving old unprocessed data');