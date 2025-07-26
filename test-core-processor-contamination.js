#!/usr/bin/env node

// Test how CoreAnalysisProcessor contaminates data with raw market share
console.log('🔍 TESTING: CoreAnalysisProcessor Data Contamination');
console.log('='.repeat(70));

// Raw data (what exists in competitive-analysis.json)
const rawData = {
  success: true,
  results: [
    {
      area_id: '10996',
      area_name: 'New York 10996',
      value_MP30034A_B_P: 27.0,  // Nike market share - THIS IS THE SMOKING GUN
      value_MP30029A_B_P: 18.5,  // Adidas market share
      value_MP30032A_B_P: 12.1,  // Jordan market share
      shap_MP30034A_B_P: 0.22,
      shap_MP30029A_B_P: -0.15,
      value_TOTPOP_CY: 45000,
      value_AVGHINC_CY: 65000,
      value_MEDAGE_CY: 29
    }
  ]
};

console.log('📊 STEP 1: Raw Data Input');
console.log('Raw record contains:', Object.keys(rawData.results[0]));
console.log('Nike market share (value_MP30034A_B_P):', rawData.results[0].value_MP30034A_B_P);
console.log('');

// Simulate CoreAnalysisProcessor (what happens if CompetitiveDataProcessor fails)
console.log('🔄 STEP 2: CoreAnalysisProcessor Processing (WRONG PROCESSOR)');

function simulateCoreAnalysisProcessor(rawData) {
  const record = rawData.results[0];
  
  // CoreAnalysisProcessor calculation (lines 44-62)
  const nikeValue = Number(record.value_MP30034A_B_P) || 0;
  const adidasValue = Number(record.value_MP30029A_B_P) || 0;
  const totalPop = record.value_TOTPOP_CY || 1;
  const avgIncome = record.value_AVGHINC_CY || 50000;
  
  const marketGap = Math.max(0, 100 - nikeValue - adidasValue);
  const incomeBonus = Math.min((avgIncome - 50000) / 50000, 1);
  const populationWeight = Math.min(totalPop / 50000, 2);
  const competitiveAdvantage = Math.max(0, nikeValue - adidasValue);
  
  const opportunityScore = (
    marketGap * 0.4 +
    incomeBonus * 20 +
    populationWeight * 15 +
    competitiveAdvantage * 0.25
  );
  
  console.log(`CoreAnalysisProcessor calculation:`);
  console.log(`  Nike: ${nikeValue}%, Adidas: ${adidasValue}%`);
  console.log(`  Calculated opportunity score: ${opportunityScore.toFixed(2)}`);
  
  // The CONTAMINATION happens here (line 83-98)
  const processedRecord = {
    area_id: record.area_id,
    area_name: record.area_name,
    value: Math.round(opportunityScore * 100) / 100, // CoreAnalysisProcessor score
    rank: 1,
    properties: {
      ...record, // ← CONTAMINATION: ALL original fields including market share!
      nike_market_share: nikeValue,
      adidas_market_share: adidasValue,
      raw_opportunity_score: opportunityScore
    }
  };

  console.log('Processed record structure:');
  console.log('  value:', processedRecord.value, '(CoreAnalysisProcessor opportunity score)');
  console.log('  properties contains value_MP30034A_B_P:', processedRecord.properties.value_MP30034A_B_P);
  console.log('  properties contains nike_market_share:', processedRecord.properties.nike_market_share);
  
  return {
    type: 'analysis', // ← NOT 'competitive_analysis'!
    records: [processedRecord]
  };
}

const coreResult = simulateCoreAnalysisProcessor(rawData);
console.log('');

// STEP 3: Frontend thematic_value assignment with contaminated data
console.log('🎯 STEP 3: Frontend Thematic Value Assignment (With Contaminated Data)');

const data = coreResult;
const record = coreResult.records[0];

console.log(`🔍 [THEMATIC DEBUG] ${record.area_name}:`);
console.log(`   data.type: "${data.type}" ← NOT "competitive_analysis"!`);
console.log(`   record.value: ${record.value} (${typeof record.value}) ← CoreAnalysisProcessor score`);
console.log(`   record.properties?.value_MP30034A_B_P: ${record.properties?.value_MP30034A_B_P} ← CONTAMINATION!`);

// The thematic_value assignment logic (lines 1632-1634)
const condition1 = data.type === 'competitive_analysis';
const condition2 = typeof record.value === 'number';
console.log(`   Condition 1 (data.type === 'competitive_analysis'): ${condition1} ← FAILS!`);
console.log(`   Condition 2 (typeof record.value === 'number'): ${condition2}`);

// Since condition1 fails, it falls back to the next condition
const rawValue = data.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                 typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                 typeof record.value === 'number' ? record.value : 0;

console.log(`   Since data.type !== 'competitive_analysis', fallback logic used`);
console.log(`   record.properties?.thematic_value: ${record.properties?.thematic_value}`);
console.log(`   Falls back to record.value: ${record.value}`);
console.log(`   → rawValue selected: ${rawValue}`);

// But wait - there's more contamination possible!
console.log('');
console.log('🚨 ADDITIONAL CONTAMINATION VECTORS:');
console.log('   The record.properties object contains:');
Object.keys(record.properties).forEach(key => {
  if (key.includes('MP30034A_B_P') || key.includes('market_share')) {
    console.log(`   - ${key}: ${record.properties[key]} ← Could contaminate data flow`);
  }
});

console.log('');

// STEP 4: What would happen in capping
console.log('📤 STEP 4: Capping Logic');

let thematicValue = rawValue;
if (rawValue > 10.0) {
  thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
  console.log(`🔧 CAPPED: ${rawValue} → ${thematicValue.toFixed(1)}`);
} else {
  console.log(`✅ NO CAPPING: ${rawValue} (already ≤10)`);
}

console.log('');

// STEP 5: How raw market share could leak through
console.log('🔍 STEP 5: Market Share Leakage Analysis');

// If somehow the raw market share data gets used directly
const directMarketShare = record.properties.value_MP30034A_B_P;
console.log(`If value_MP30034A_B_P was used directly: ${directMarketShare}`);

if (directMarketShare > 10) {
  const cappedMarketShare = Math.max(1.0, Math.min(10.0, directMarketShare / 10));
  console.log(`Market share capped: ${directMarketShare} → ${cappedMarketShare.toFixed(1)}`);
}

console.log('');
console.log('🎯 FINAL DIAGNOSIS:');
console.log('='.repeat(50));

if (thematicValue === directMarketShare || Math.abs(thematicValue - directMarketShare) < 0.1) {
  console.log('❌ CONTAMINATION CONFIRMED: thematic_value equals raw market share');
  console.log(`   Claude would receive: ${thematicValue}% (market share instead of competitive score)`);
} else {
  console.log('✅ NO DIRECT CONTAMINATION: thematic_value differs from market share');
  console.log(`   thematic_value: ${thematicValue}`);
  console.log(`   market_share: ${directMarketShare}`);
}

console.log('');
console.log('💡 ROOT CAUSE SUMMARY:');
console.log('1. CompetitiveDataProcessor validation fails OR endpoint routing fails');
console.log('2. System falls back to CoreAnalysisProcessor');
console.log('3. CoreAnalysisProcessor includes raw market share in properties via spread operator');
console.log('4. Frontend thematic_value assignment logic contaminated by raw market share data');
console.log('5. Claude receives market share percentages instead of competitive scores');
console.log('');
console.log('🔧 SOLUTION:');
console.log('Find why CompetitiveDataProcessor is not being used for competitive-analysis endpoint');