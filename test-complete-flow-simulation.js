#!/usr/bin/env node

// Complete flow simulation: Raw data → Competitive scoring → Geographic join → Claude prep
console.log('🔄 Testing Complete Competitive Analysis Flow...');
console.log('='.repeat(70));

// STEP 1: Raw data from competitive-analysis.json (what CompetitiveDataProcessor receives)
console.log('📊 STEP 1: Raw Data from competitive-analysis.json');
const rawData = {
  success: true,
  results: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      // Raw market share data (this is what exists in the cache)
      value_MP30034A_B_P: 28.5,  // Nike market share %
      value_MP30029A_B_P: 18.2,  // Adidas market share %
      value_MP30032A_B_P: 12.1,  // Jordan market share %
      shap_MP30034A_B_P: 0.15,   // Nike SHAP
      shap_MP30029A_B_P: -0.08,  // Adidas SHAP
      value_TOTPOP_CY: 45000,    // Demographics
      value_WLTHINDXCY: 120,
      value_AVGHINC_CY: 65000,
      value_MEDAGE_CY: 32
    },
    {
      area_id: '10002',
      area_name: 'Brooklyn 10002',
      value_MP30034A_B_P: 22.1,
      value_MP30029A_B_P: 25.3,
      value_MP30032A_B_P: 8.7,
      shap_MP30034A_B_P: -0.05,
      shap_MP30029A_B_P: 0.12,
      value_TOTPOP_CY: 38000,
      value_WLTHINDXCY: 95,
      value_AVGHINC_CY: 48000,
      value_MEDAGE_CY: 41
    }
  ]
};

console.log('Raw data sample:', {
  totalRecords: rawData.results.length,
  firstRecord: {
    area_name: rawData.results[0].area_name,
    nike_share: rawData.results[0].value_MP30034A_B_P + '%',
    adidas_share: rawData.results[0].value_MP30029A_B_P + '%',
    hasCompetitiveScore: rawData.results[0].competitive_advantage_score !== undefined
  }
});
console.log('');

// STEP 2: CompetitiveDataProcessor calculation (this is what should happen)
console.log('⚙️  STEP 2: CompetitiveDataProcessor - Calculate Competitive Scores');

function simulateCompetitiveScoring(record) {
  const nikeShare = Number(record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const jordanShare = Number(record.value_MP30032A_B_P) || 0;
  const nikeShap = Number(record.shap_MP30034A_B_P) || 0;
  const adidasShap = Number(record.shap_MP30029A_B_P) || 0;
  const avgIncome = Number(record.value_AVGHINC_CY) || 50000;
  const medianAge = Number(record.value_MEDAGE_CY) || 35;
  const totalPop = Number(record.value_TOTPOP_CY) || 30000;

  // Simplified competitive advantage calculation (1-10 scale)
  const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
  const shapAdvantage = Math.max(-10, Math.min(10, (nikeShap - adidasShap) * 10));
  const marketPresence = Math.min(10, nikeShare * 0.25);
  const positionAdvantage = Math.min(40, 20 + shareAdvantage + shapAdvantage + marketPresence);

  const incomeScore = avgIncome >= 35000 && avgIncome <= 150000 ? 15 : 8;
  const ageScore = medianAge >= 16 && medianAge <= 50 ? 12 : 6;
  const scaleScore = Math.min(8, (totalPop / 20000) * 8);
  const marketFit = Math.min(35, incomeScore + ageScore + scaleScore);

  const fragmentation = Math.min(10, (100 - nikeShare - adidasShare) * 0.1);
  const competitorWeakness = Math.min(8, Math.max(0, nikeShare * 0.2));
  const competitiveEnvironment = Math.min(25, fragmentation + competitorWeakness + 5);

  const totalScore = positionAdvantage + marketFit + competitiveEnvironment;
  const competitiveScore = Math.max(1.0, Math.min(10.0, totalScore / 10));

  console.log(`[CompetitiveDataProcessor] ${record.area_name}:`);
  console.log(`  Nike ${nikeShare}% vs Adidas ${adidasShare}% → Competitive Score: ${competitiveScore.toFixed(1)}`);

  return Math.round(competitiveScore * 10) / 10;
}

const processedRecords = rawData.results.map((record, index) => {
  const competitiveScore = simulateCompetitiveScoring(record);
  
  return {
    area_id: record.area_id,
    area_name: record.area_name,
    value: competitiveScore, // ← KEY: This should be the competitive score
    rank: index + 1,
    category: 'competitive',
    coordinates: [0, 0],
    properties: {
      competitive_advantage_score: competitiveScore,
      nike_market_share: Number(record.value_MP30034A_B_P),
      adidas_market_share: Number(record.value_MP30029A_B_P),
      jordan_market_share: Number(record.value_MP30032A_B_P),
      nike_shap: Number(record.shap_MP30034A_B_P),
      adidas_shap: Number(record.shap_MP30029A_B_P),
      // NOTE: No thematic_value here - it gets calculated later
    }
  };
}).sort((a, b) => b.value - a.value);

console.log('Processed records:', {
  totalRecords: processedRecords.length,
  topRecord: {
    area_name: processedRecords[0].area_name,
    competitiveScore: processedRecords[0].value,
    nikeShare: processedRecords[0].properties.nike_market_share + '%'
  }
});
console.log('');

// STEP 3: AnalysisEngine result structure
console.log('🔧 STEP 3: AnalysisEngine Result Structure');
const analysisResult = {
  success: true,
  endpoint: '/competitive-analysis',
  data: {
    type: 'competitive_analysis',
    records: processedRecords,
    targetVariable: 'expansion_opportunity_score'
  }
};

console.log('Analysis result:', {
  dataType: analysisResult.data.type,
  recordCount: analysisResult.data.records.length,
  firstRecordValue: analysisResult.data.records[0].value,
  firstRecordHasThematicValue: analysisResult.data.records[0].properties.thematic_value !== undefined
});
console.log('');

// STEP 4: Thematic value assignment (lines 1618-1640)
console.log('🎯 STEP 4: Thematic Value Assignment (Frontend Lines 1618-1640)');

const features = analysisResult.data.records.map((record, index) => {
  console.log(`🔍 [THEMATIC DEBUG] ${record.area_name}:`);
  console.log(`   data.type: "${analysisResult.data.type}"`);
  console.log(`   record.value: ${record.value} (${typeof record.value})`);
  console.log(`   record.properties?.thematic_value: ${record.properties?.thematic_value} (${typeof record.properties?.thematic_value})`);
  console.log(`   record.properties?.competitive_advantage_score: ${record.properties?.competitive_advantage_score} (${typeof record.properties?.competitive_advantage_score})`);
  
  // Check the condition step by step
  const condition1 = analysisResult.data.type === 'competitive_analysis';
  const condition2 = typeof record.value === 'number';
  console.log(`   Condition 1 (data.type === 'competitive_analysis'): ${condition1}`);
  console.log(`   Condition 2 (typeof record.value === 'number'): ${condition2}`);
  console.log(`   Both conditions true: ${condition1 && condition2}`);
  
  const rawValue = analysisResult.data.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                   typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                   typeof record.value === 'number' ? record.value : 0;
  
  console.log(`   → rawValue selected: ${rawValue}`);
  
  // AGGRESSIVE CAPPING: Cap any value >10 to 1-10 scale for competitive analysis
  let thematicValue = rawValue;
  if (rawValue > 10.0) {
    thematicValue = Math.max(1.0, Math.min(10.0, rawValue / 10));
    console.log(`   🔧 CAPPED: ${rawValue} → ${thematicValue.toFixed(1)} (divided by 10)`);
  } else {
    console.log(`   ✅ NO CAPPING: ${rawValue} (already ≤10)`);
  }
  
  console.log(`   → Final thematic_value: ${thematicValue}`);
  console.log('');

  return {
    properties: {
      ID: record.area_id,
      DESCRIPTION: `${record.area_id} (${record.area_name})`,
      area_name: record.area_name,
      value: record.value,
      thematic_value: thematicValue,
      // Market share context
      nike_market_share: record.properties.nike_market_share,
      adidas_market_share: record.properties.adidas_market_share,
      competitive_advantage_score: record.properties.competitive_advantage_score
    }
  };
});

console.log('Features created:', {
  totalFeatures: features.length,
  firstFeatureThematic: features[0].properties.thematic_value,
  firstFeatureNikeShare: features[0].properties.nike_market_share
});
console.log('');

// STEP 5: Geographic Join Simulation (ZIP boundary has conflicting data)
console.log('🗺️  STEP 5: Geographic Join Simulation');

const zipBoundaryFeature = {
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    ID: '10001',
    DESCRIPTION: '10001 (Manhattan)',
    OBJECTID: 1,
    // PROBLEMATIC: ZIP boundary cache contains market share data!
    value_MP30034A_B_P: 28.5,  // Nike market share (conflicts!)
    thematic_value: 28.5       // Market share that would overwrite competitive score!
  }
};

const simulateJoin = (record, zipFeature, analysisType) => {
  console.log(`🔧 [JOIN DEBUG] Record 0 (${record.properties.area_name}):`);
  console.log(`   isCompetitiveAnalysis: ${analysisType === 'competitive_analysis'}`);
  console.log(`   record thematic_value BEFORE join: ${record.properties.thematic_value}`);
  
  const isCompetitiveAnalysis = analysisType === 'competitive_analysis';
  const competitiveFields = ['value', 'competitive_advantage_score', 'thematic_value'];
  
  const preservedProps = { ...record.properties };
  const zipProps = { ...(zipFeature.properties || {}) };
  
  console.log(`   ZIP boundary conflicting fields:`, 
    competitiveFields.filter(field => zipProps[field] !== undefined)
      .map(field => `${field}=${zipProps[field]}`));
  
  if (isCompetitiveAnalysis) {
    competitiveFields.forEach(field => {
      if (preservedProps[field] !== undefined && zipProps[field] !== undefined) {
        console.log(`   🔧 Removing conflicting ${field}: ${zipProps[field]} → deleted`);
        delete zipProps[field];
      }
    });
  }
  
  const joinedRecord = {
    properties: {
      ...preservedProps,
      ...zipProps,
      zip_code: '10001',
      city_name: 'Manhattan'
    }
  };
  
  console.log(`   🔧 AFTER join - properties.thematic_value: ${joinedRecord.properties?.thematic_value}`);
  return joinedRecord;
};

const joinedFeatures = features.map(feature => 
  simulateJoin(feature, zipBoundaryFeature, analysisResult.data.type)
);

console.log('');

// STEP 6: Claude Data Preparation
console.log('📤 STEP 6: Claude Data Preparation');

const sortedByThematic = joinedFeatures
  .filter(f => f.properties?.thematic_value != null)
  .map(f => {
    console.log(`🔍 [DEBUG] ${f.properties?.DESCRIPTION}: thematic_value=${f.properties?.thematic_value}`);
    
    let originalThematic = f.properties?.thematic_value || 0;
    let cappedThematic = originalThematic;
    
    console.log(`🔍 [CAPPING DEBUG] ${f.properties?.DESCRIPTION}:`);
    console.log(`   originalThematic: ${originalThematic}`);
    
    if (originalThematic > 10) {
      cappedThematic = Math.max(1.0, Math.min(10.0, originalThematic / 10));
      console.log(`🔧 [CAPPING APPLIED] ${originalThematic} → ${cappedThematic.toFixed(1)}`);
    } else {
      console.log(`✅ [NO CAPPING NEEDED] ${originalThematic} (already ≤10)`);
    }
    
    return { ...f, cappedThematic, originalThematic };
  })
  .sort((a, b) => (b.cappedThematic || 0) - (a.cappedThematic || 0));

const topPerformers = sortedByThematic.slice(0, 5).map(f => {
  const competitiveScore = f.cappedThematic;
  console.log(`🚨 [CLAUDE PREP] Creating performer for: ${f.properties?.DESCRIPTION} with competitiveScore: ${competitiveScore}`);
  
  return {
    description: f.properties?.DESCRIPTION,
    competitive_advantage_score: competitiveScore,
    nike_market_share: f.properties?.nike_market_share
  };
});

console.log('');
console.log('🎯 FINAL ANALYSIS:');
console.log('='.repeat(50));
console.log('Data that would be sent to Claude:');
topPerformers.forEach((performer, index) => {
  console.log(`${index + 1}. ${performer.description}: ${performer.competitive_advantage_score}`);
  
  if (performer.competitive_advantage_score > 20) {
    console.log(`   ❌ PROBLEM: ${performer.competitive_advantage_score} looks like market share %`);
  } else if (performer.competitive_advantage_score >= 1 && performer.competitive_advantage_score <= 10) {
    console.log(`   ✅ CORRECT: ${performer.competitive_advantage_score} is competitive advantage score`);
  }
});

console.log('');
const firstScore = topPerformers[0]?.competitive_advantage_score;
if (firstScore > 20) {
  console.log('🚨 ROOT CAUSE CONFIRMED:');
  console.log(`   Claude receives ${firstScore} instead of competitive scores`);
  console.log('   This explains why the analysis shows market share percentages');
} else {
  console.log('✅ SYSTEM WORKING CORRECTLY:');
  console.log(`   Claude receives competitive scores (${firstScore})`);
}