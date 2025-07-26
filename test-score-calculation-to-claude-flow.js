#!/usr/bin/env node

// Trace the specific flow: Raw data → Competitive score calculation → Claude data preparation
console.log('🔍 TRACING: Competitive Score Calculation → Claude Flow');
console.log('='.repeat(70));

// CRITICAL INSIGHT: The competitive score is CALCULATED, not in the dataset
// We need to trace exactly how this calculated score gets to Claude

console.log('📊 STEP 1: Raw Dataset (what actually exists in competitive-analysis.json)');
const rawDataset = {
  area_id: '10996',
  area_name: 'New York 10996',
  // Raw market share data (this is ALL that exists in the cache)
  value_MP30034A_B_P: 27.0,  // Nike market share % ← This is what Claude is receiving!
  value_MP30029A_B_P: 18.5,  // Adidas market share %
  value_MP30032A_B_P: 12.1,  // Jordan market share %
  shap_MP30034A_B_P: 0.22,   // Nike SHAP
  shap_MP30029A_B_P: -0.15,  // Adidas SHAP
  // Demographics for calculation
  value_TOTPOP_CY: 45000,
  value_WLTHINDXCY: 125,
  value_AVGHINC_CY: 68000,
  value_MEDAGE_CY: 29
};

console.log('Raw data structure:', {
  area_name: rawDataset.area_name,
  nike_market_share: rawDataset.value_MP30034A_B_P + '%',
  has_competitive_score: rawDataset.competitive_advantage_score !== undefined,
  has_thematic_value: rawDataset.thematic_value !== undefined
});
console.log('❗ KEY INSIGHT: competitive_advantage_score does NOT exist in raw data');
console.log('');

// STEP 2: CompetitiveDataProcessor should calculate the score
console.log('⚙️  STEP 2: CompetitiveDataProcessor Calculation');

function calculateCompetitiveScore(record) {
  console.log(`🔥 [CALCULATING] Competitive score for ${record.area_name}:`);
  
  const nikeShare = Number(record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const jordanShare = Number(record.value_MP30032A_B_P) || 0;
  const nikeShap = Number(record.shap_MP30034A_B_P) || 0;
  const adidasShap = Number(record.shap_MP30029A_B_P) || 0;
  const avgIncome = Number(record.value_AVGHINC_CY) || 50000;
  const medianAge = Number(record.value_MEDAGE_CY) || 35;
  const totalPop = Number(record.value_TOTPOP_CY) || 30000;

  console.log(`  Input: Nike ${nikeShare}% vs Adidas ${adidasShare}%, SHAP: ${nikeShap} vs ${adidasShap}`);

  // Simplified competitive scoring (matches the actual algorithm structure)
  const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
  const shapDiff = nikeShap - adidasShap;
  const shapAdvantage = Math.max(-10, Math.min(10, shapDiff * 10));
  const marketPresence = Math.min(10, nikeShare * 0.25);
  const positionAdvantage = Math.min(40, 20 + shareAdvantage + shapAdvantage + marketPresence);

  // Market fit scoring
  let incomeScore = 8;
  if (avgIncome >= 35000 && avgIncome <= 150000) {
    incomeScore = 8 + ((avgIncome - 35000) / 65000 * 7);
  }
  const ageScore = (medianAge >= 16 && medianAge <= 35) ? 12 - Math.abs(medianAge - 25) * 0.1 : 8;
  const scaleScore = Math.min(8, (totalPop / 20000) * 8);
  const marketFit = Math.min(35, incomeScore + ageScore + scaleScore);

  // Competitive environment
  const fragmentation = Math.min(10, (100 - nikeShare - adidasShare) * 0.1);
  const competitorWeakness = Math.min(8, Math.max(0, nikeShare * 0.2));
  const competitiveEnvironment = Math.min(25, fragmentation + competitorWeakness + 5);

  const totalScore = positionAdvantage + marketFit + competitiveEnvironment;
  const competitiveScore = Math.max(1.0, Math.min(10.0, totalScore / 10));
  const finalScore = Math.round(competitiveScore * 10) / 10;

  console.log(`  Calculation: Position(${positionAdvantage.toFixed(1)}) + Fit(${marketFit.toFixed(1)}) + Env(${competitiveEnvironment.toFixed(1)}) = ${totalScore.toFixed(1)}`);
  console.log(`  🎯 CALCULATED competitive score: ${finalScore} (1-10 scale)`);
  
  return finalScore;
}

const calculatedScore = calculateCompetitiveScore(rawDataset);
console.log('');

// STEP 3: CompetitiveDataProcessor should create processed record with calculated score
console.log('🔄 STEP 3: Processed Record Creation');

const processedRecord = {
  area_id: rawDataset.area_id,
  area_name: rawDataset.area_name,
  value: calculatedScore, // ← CRITICAL: This should be the competitive score, NOT market share
  rank: 1,
  category: 'competitive',
  coordinates: [0, 0],
  properties: {
    competitive_advantage_score: calculatedScore, // ← Backup location
    nike_market_share: rawDataset.value_MP30034A_B_P, // ← Context only
    adidas_market_share: rawDataset.value_MP30029A_B_P,
    jordan_market_share: rawDataset.value_MP30032A_B_P,
    nike_shap: rawDataset.shap_MP30034A_B_P,
    adidas_shap: rawDataset.shap_MP30029A_B_P
    // NOTE: thematic_value is NOT set here - it's calculated later in the frontend
  }
};

console.log('Processed record structure:', {
  area_name: processedRecord.area_name,
  value: processedRecord.value, // ← Should be competitive score
  nike_market_share: processedRecord.properties.nike_market_share + '%', // ← Context data
  competitive_advantage_score: processedRecord.properties.competitive_advantage_score
});

console.log('✅ VERIFICATION: record.value contains competitive score, not market share');
console.log('');

// STEP 4: Frontend thematic_value assignment
console.log('🎯 STEP 4: Frontend Thematic Value Assignment');

console.log('Frontend receives analysisResult.data:', {
  type: 'competitive_analysis',
  records: [processedRecord]
});

// Simulate the thematic_value assignment logic (lines 1618-1640)
const data = { type: 'competitive_analysis' };
const record = processedRecord;

console.log(`🔍 [THEMATIC DEBUG] ${record.area_name}:`);
console.log(`   data.type: "${data.type}"`);
console.log(`   record.value: ${record.value} (${typeof record.value}) ← Should be competitive score`);
console.log(`   record.properties?.thematic_value: ${record.properties?.thematic_value} (${typeof record.properties?.thematic_value})`);

const condition1 = data.type === 'competitive_analysis';
const condition2 = typeof record.value === 'number';
console.log(`   Condition 1 (data.type === 'competitive_analysis'): ${condition1}`);
console.log(`   Condition 2 (typeof record.value === 'number'): ${condition2}`);
console.log(`   Both conditions true: ${condition1 && condition2}`);

const rawValue = data.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                 typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                 typeof record.value === 'number' ? record.value : 0;

console.log(`   → rawValue selected: ${rawValue} ← Should be competitive score`);

let thematicValue = rawValue;
if (rawValue > 10.0) {
  thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
  console.log(`   🔧 CAPPED: ${rawValue} → ${thematicValue.toFixed(1)}`);
} else {
  console.log(`   ✅ NO CAPPING: ${rawValue} (already ≤10)`);
}

console.log(`   → Final thematic_value: ${thematicValue} ← Should be competitive score`);
console.log('');

// STEP 5: Geographic join (shouldn't affect the score if fix is working)
console.log('🗺️  STEP 5: Geographic Join');

const zipBoundary = {
  properties: {
    ID: '10996',
    DESCRIPTION: '10996 (New York)',
    // PROBLEMATIC: If ZIP boundary has this, it could overwrite
    thematic_value: 27.0, // ← Market share that could overwrite competitive score
    value_MP30034A_B_P: 27.0 // ← Raw market share
  }
};

console.log('ZIP boundary properties:', zipBoundary.properties);
console.log('ZIP has conflicting thematic_value:', zipBoundary.properties.thematic_value);

// Simulate the fixed join logic
const isCompetitiveAnalysis = true;
const competitiveFields = ['value', 'competitive_advantage_score', 'thematic_value'];
const preservedProps = { thematic_value: thematicValue };
const zipProps = { ...zipBoundary.properties };

console.log('Before conflict removal:', { preservedProps, zipProps });

if (isCompetitiveAnalysis) {
  competitiveFields.forEach(field => {
    if (preservedProps[field] !== undefined && zipProps[field] !== undefined) {
      console.log(`🔧 Removing conflicting ${field}: ${zipProps[field]} → deleted`);
      delete zipProps[field];
    }
  });
}

const finalProps = { ...preservedProps, ...zipProps };
console.log('After join:', { finalThematicValue: finalProps.thematic_value });
console.log('');

// STEP 6: Claude data preparation
console.log('📤 STEP 6: Claude Data Preparation');

const feature = {
  properties: {
    DESCRIPTION: '10996 (New York)',
    thematic_value: finalProps.thematic_value,
    nike_market_share: rawDataset.value_MP30034A_B_P
  }
};

console.log('Feature going to Claude prep:', feature.properties);

const originalThematic = feature.properties.thematic_value;
let cappedThematic = originalThematic;

console.log(`🔍 [CAPPING DEBUG] ${feature.properties.DESCRIPTION}:`);
console.log(`   originalThematic: ${originalThematic}`);

if (originalThematic > 10) {
  cappedThematic = Math.max(1.0, Math.min(10.0, originalThematic / 10));
  console.log(`🔧 [CAPPING APPLIED] ${originalThematic} → ${cappedThematic.toFixed(1)}`);
} else {
  console.log(`✅ [NO CAPPING NEEDED] ${originalThematic} (already ≤10)`);
}

const claudeData = {
  description: feature.properties.DESCRIPTION,
  competitive_advantage_score: cappedThematic, // ← This goes to Claude
  nike_market_share: feature.properties.nike_market_share
};

console.log('');
console.log('🎯 FINAL ANALYSIS:');
console.log('='.repeat(50));
console.log('Data sent to Claude API:', claudeData);

if (claudeData.competitive_advantage_score > 20) {
  console.log('❌ PROBLEM CONFIRMED: Claude receives market share percentage');
  console.log(`   Score: ${claudeData.competitive_advantage_score} (looks like market share %)`);
  console.log('');
  console.log('🔍 ROOT CAUSE ANALYSIS:');
  console.log('   The calculated competitive score is being lost somewhere in the pipeline');
  console.log('   and replaced with raw market share data');
} else if (claudeData.competitive_advantage_score >= 1 && claudeData.competitive_advantage_score <= 10) {
  console.log('✅ SUCCESS: Claude receives competitive advantage score');
  console.log(`   Score: ${claudeData.competitive_advantage_score} (1-10 scale)`);
} else {
  console.log('⚠️  UNEXPECTED: Claude receives unexpected value');
  console.log(`   Score: ${claudeData.competitive_advantage_score}`);
}

console.log('');
console.log('💡 KEY INSIGHT:');
console.log('   If this test shows success but real Claude gets market share %,');
console.log('   then either:');
console.log('   1. CompetitiveDataProcessor is not being called (wrong endpoint)');
console.log('   2. CompetitiveDataProcessor is failing and fallback data is used');
console.log('   3. There\'s a different code path that bypasses the processor');
console.log('   4. Caching is serving old unprocessed data');