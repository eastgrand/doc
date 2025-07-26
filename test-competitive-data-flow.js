#!/usr/bin/env node

// Test the complete data flow from raw data to final output
console.log('🧪 Testing Complete Competitive Data Flow...');
console.log('='.repeat(60));

// Sample raw data that matches actual SHAP structure (3 records like your 3983)
const rawAnalysisData = {
  success: true,
  results: [
    {
      area_id: '10001',
      area_name: 'Manhattan 10001',
      value_MP30034A_B_P: 28.5,  // Nike market share %
      value_MP30029A_B_P: 18.2,  // Adidas market share %
      value_MP30032A_B_P: 12.1,  // Jordan market share %
      value_MP30030A_B_P: 8.4,   // Under Armour market share %
      value_MP30031A_B_P: 5.8,   // Puma market share %
      shap_MP30034A_B_P: 0.15,   // Nike SHAP value
      shap_MP30029A_B_P: -0.08,  // Adidas SHAP value
      value_TOTPOP_CY: 45000,    // Total population
      value_WLTHINDXCY: 120,     // Wealth index
      value_AVGHINC_CY: 65000,   // Average income
      value_MEDAGE_CY: 32        // Median age
    },
    {
      area_id: '10002', 
      area_name: 'Brooklyn 10002',
      value_MP30034A_B_P: 22.1,  // Nike market share %
      value_MP30029A_B_P: 25.3,  // Adidas market share %
      value_MP30032A_B_P: 8.7,   // Jordan market share %
      value_MP30030A_B_P: 11.2,  // Under Armour market share %
      value_MP30031A_B_P: 7.1,   // Puma market share %
      shap_MP30034A_B_P: -0.05,  // Nike SHAP value
      shap_MP30029A_B_P: 0.12,   // Adidas SHAP value
      value_TOTPOP_CY: 38000,    // Total population
      value_WLTHINDXCY: 95,      // Wealth index
      value_AVGHINC_CY: 48000,   // Average income
      value_MEDAGE_CY: 41        // Median age
    },
    {
      area_id: '10003',
      area_name: 'Queens 10003', 
      value_MP30034A_B_P: 31.2,  // Nike market share %
      value_MP30029A_B_P: 15.8,  // Adidas market share %
      value_MP30032A_B_P: 14.5,  // Jordan market share %
      value_MP30030A_B_P: 6.9,   // Under Armour market share %
      value_MP30031A_B_P: 4.2,   // Puma market share %
      shap_MP30034A_B_P: 0.22,   // Nike SHAP value
      shap_MP30029A_B_P: -0.15,  // Adidas SHAP value
      value_TOTPOP_CY: 52000,    // Total population
      value_WLTHINDXCY: 140,     // Wealth index
      value_AVGHINC_CY: 78000,   // Average income
      value_MEDAGE_CY: 28        // Median age
    }
  ],
  feature_importance: [],
  model_info: {}
};

// Simulate the competitive scoring function (from CompetitiveDataProcessor)
function extractCompetitiveScore(record) {
  console.log('[CompetitiveDataProcessor] Extracting competitive score for:', record.area_name || 'Unknown');
  
  try {
    // Get brand market shares (safe extraction)
    const nikeShare = Number(record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    const jordanShare = Number(record.value_MP30032A_B_P) || 0;
    const underArmourShare = Number(record.value_MP30030A_B_P) || 0;
    const pumaShare = Number(record.value_MP30031A_B_P) || 0;
    
    // Get SHAP values (feature importance for Nike performance)
    const nikeShap = Number(record.shap_MP30034A_B_P) || 0;
    const adidasShap = Number(record.shap_MP30029A_B_P) || 0;
    
    // Get demographics that favor Nike's target market
    const totalPop = Number(record.value_TOTPOP_CY) || 1;
    const wealthIndex = Number(record.value_WLTHINDXCY) || 100;
    const avgIncome = Number(record.value_AVGHINC_CY) || (wealthIndex * 500);
    const medianAge = Number(record.value_MEDAGE_CY) || 35;
    
    console.log(`[CompetitiveDataProcessor] INPUT for ${record.area_name || 'Unknown'}: Nike ${nikeShare}% vs Adidas ${adidasShare}%, SHAP: Nike ${nikeShap.toFixed(2)} vs Adidas ${adidasShap.toFixed(2)}`);
    
    // COMPETITIVE ADVANTAGE FORMULA (0-100 scale)
    
    // 1. Market Position Advantage (0-40 points)
    const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
    const shapDifference = nikeShap - adidasShap;
    const normalizedShapDiff = shapDifference / (1 + Math.abs(shapDifference * 0.1));
    const shapAdvantage = Math.max(-10, Math.min(10, normalizedShapDiff * 10));
    const totalCompetitors = adidasShare + jordanShare + underArmourShare + pumaShare;
    const marketPresence = Math.min(10, nikeShare * 0.25);
    const positionAdvantage = Math.min(40, 20 + shareAdvantage + shapAdvantage + marketPresence);
    
    // 2. Market Attractiveness for Nike (0-35 points)
    let incomeAdvantage;
    if (avgIncome < 35000) {
      incomeAdvantage = Math.max(0, (avgIncome - 25000) / 10000 * 3);
    } else if (avgIncome <= 100000) {
      incomeAdvantage = 8 + ((avgIncome - 35000) / 65000 * 7);
    } else if (avgIncome <= 150000) {
      incomeAdvantage = 15;
    } else {
      incomeAdvantage = 15 - ((avgIncome - 150000) / 100000 * 5);
    }
    incomeAdvantage = Math.max(0, Math.min(15, incomeAdvantage));
    
    let ageAdvantage;
    if (medianAge >= 16 && medianAge <= 35) {
      ageAdvantage = 12 - Math.abs(medianAge - 25) * 0.1;
    } else if (medianAge >= 36 && medianAge <= 50) {
      ageAdvantage = 8 - (medianAge - 36) * 0.2;
    } else if (medianAge >= 13 && medianAge <= 15) {
      ageAdvantage = 6;
    } else if (medianAge >= 51 && medianAge <= 65) {
      ageAdvantage = Math.max(2, 6 - (medianAge - 51) * 0.2);
    } else {
      ageAdvantage = 1;
    }
    ageAdvantage = Math.max(0, Math.min(12, ageAdvantage));
    
    const scaleAdvantage = Math.min(8, (totalPop / 20000) * 8);
    const marketFit = Math.min(35, incomeAdvantage + ageAdvantage + scaleAdvantage);
    
    // 3. Competitive Environment (0-25 points)
    const fragmentation = Math.min(10, (100 - nikeShare - adidasShare) * 0.1);
    const competitorWeakness = Math.min(8, Math.max(0, (nikeShare - totalCompetitors/4) * 0.2));
    
    let marketStructure = 0;
    if (avgIncome >= 35000 && avgIncome <= 150000) {
      marketStructure += 3;
    } else if (avgIncome > 150000) {
      marketStructure += 2;
    } else if (avgIncome >= 25000) {
      marketStructure += 1;
    }
    
    if (medianAge >= 16 && medianAge <= 50) {
      marketStructure += 2;
    } else if (medianAge >= 13 && medianAge <= 65) {
      marketStructure += 1;
    }
    
    const competitionIntensity = nikeShare + adidasShare + Math.max(jordanShare, underArmourShare, pumaShare);
    if (competitionIntensity < 60) {
      marketStructure += 2;
    } else if (competitionIntensity < 80) {
      marketStructure += 1;
    }
    
    marketStructure = Math.min(7, marketStructure);
    const competitiveEnvironment = Math.min(25, fragmentation + competitorWeakness + marketStructure);
    
    // Add small location-specific variation to avoid exact duplicates
    const locationHash = (record.area_name || record.area_id || '').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const locationVariation = (Math.abs(locationHash) % 100) / 1000;
    
    // FINAL COMPETITIVE ADVANTAGE SCORE (1-10 scale)
    const totalScore = positionAdvantage + marketFit + competitiveEnvironment + locationVariation;
    const rawScore = totalScore / 10;
    const competitiveAdvantage = Math.max(1.0, Math.min(10.0, rawScore));
    
    console.log(`[CompetitiveDataProcessor] ${record.area_name || 'Unknown'} DETAILED: TotalScore=${totalScore.toFixed(1)}, RawScore=${rawScore.toFixed(2)}, Final=${competitiveAdvantage.toFixed(1)} (Position: ${positionAdvantage.toFixed(1)}, Market Fit: ${marketFit.toFixed(1)}, Environment: ${competitiveEnvironment.toFixed(1)})`);
    
    const finalScore = Math.round(competitiveAdvantage * 10) / 10;
    
    console.log(`[CompetitiveDataProcessor] OUTPUT for ${record.area_name || 'Unknown'}: FINAL competitive score = ${finalScore.toFixed(2)} (from Nike ${nikeShare}%)`);
    
    return finalScore;
    
  } catch (error) {
    console.error(`[CompetitiveDataProcessor] Error calculating competitive advantage for ${record.area_name}:`, error);
    return 0;
  }
}

// Simulate processCompetitiveRecords function
function processCompetitiveRecords(rawRecords) {
  return rawRecords.map((record, index) => {
    const area_id = record.area_id || record.id || record.GEOID || `area_${index}`;
    const area_name = record.area_name || record.name || record.NAME || `Area ${index + 1}`;
    
    // Extract competitive metrics
    const competitiveScore = extractCompetitiveScore(record);
    const marketShare = (Number(record.value_MP30034A_B_P) || 0) / 100; // Convert to 0-1 range
    
    // Use competitive score as the primary value
    const value = competitiveScore;
    
    // Extract Nike market share for visualization sizing
    const nikeMarketShare = Number(record.value_MP30034A_B_P) || 0;
    
    // Extract competitive-specific properties
    const properties = {
      competitive_advantage_score: competitiveScore,
      market_share: marketShare,
      nike_market_share: nikeMarketShare,
      adidas_market_share: Number(record.value_MP30029A_B_P) || 0,
      jordan_market_share: Number(record.value_MP30032A_B_P) || 0,
      nike_shap: Number(record.shap_MP30034A_B_P) || 0,
      adidas_shap: Number(record.shap_MP30029A_B_P) || 0,
      brand_strength: record.brand_strength || 0,
      competitive_position: competitiveScore >= 8.5 ? 'dominant_advantage' : 
                           competitiveScore >= 7.0 ? 'strong_advantage' : 
                           competitiveScore >= 5.5 ? 'competitive_advantage' : 
                           competitiveScore >= 4.0 ? 'moderate_position' : 
                           competitiveScore >= 2.5 ? 'weak_position' : 'disadvantaged'
    };
    
    // Category based on competitive position
    const category = competitiveScore >= 75 ? 'dominant' :
                    competitiveScore >= 50 ? 'competitive' :
                    competitiveScore >= 25 ? 'challenged' : 'underperforming';

    return {
      area_id,
      area_name,
      value, // THIS IS THE KEY - should be competitive score, not market share
      rank: 0, // Will be calculated in ranking
      category,
      coordinates: record.coordinates || [0, 0],
      properties
    };
  }).sort((a, b) => b.value - a.value) // Sort by competitive score
    .map((record, index) => ({ ...record, rank: index + 1 })); // Assign ranks
}

// Run the simulation
console.log('📊 STEP 1: Raw Analysis Data');
console.log('Raw records:', rawAnalysisData.results.length);
console.log('Sample raw record:', {
  area_name: rawAnalysisData.results[0].area_name,
  nike_share: rawAnalysisData.results[0].value_MP30034A_B_P + '%',
  adidas_share: rawAnalysisData.results[0].value_MP30029A_B_P + '%'
});
console.log('');

console.log('⚙️  STEP 2: CompetitiveDataProcessor Processing');
console.log('[CompetitiveDataProcessor] Process method called with', rawAnalysisData.results.length, 'records');

const processedRecords = processCompetitiveRecords(rawAnalysisData.results);

console.log('');
console.log('📈 STEP 3: Processed Results Analysis');
console.log(`[CompetitiveDataProcessor] Processed ${processedRecords.length} records`);
console.log(`[CompetitiveDataProcessor] Sample processed record:`, {
  area_name: processedRecords[0]?.area_name,
  value: processedRecords[0]?.value,
  nike_market_share: processedRecords[0]?.properties?.nike_market_share,
  competitive_advantage_score: processedRecords[0]?.properties?.competitive_advantage_score
});

console.log('');
console.log(`[CompetitiveDataProcessor] Final result summary:`, {
  type: 'competitive_analysis',
  recordCount: processedRecords.length,
  targetVariable: 'expansion_opportunity_score',
  topRecord: processedRecords[0] ? {
    area_name: processedRecords[0].area_name,
    value: processedRecords[0].value,
    rank: processedRecords[0].rank
  } : 'No records'
});

console.log('');
console.log('🎯 STEP 4: AnalysisEngine Data Check');
console.log(`[AnalysisEngine] Processed data returned:`, {
  type: 'competitive_analysis',
  recordCount: processedRecords.length,
  targetVariable: 'expansion_opportunity_score',
  firstRecord: processedRecords[0] ? {
    area_name: processedRecords[0].area_name,
    value: processedRecords[0].value,
    rank: processedRecords[0].rank,
    nike_market_share: processedRecords[0].properties?.nike_market_share
  } : 'No records'
});

console.log('');
console.log('🔍 STEP 5: Value Verification');
console.log('='.repeat(60));
console.log('TOP 3 RANKED RESULTS:');
processedRecords.slice(0, 3).forEach((record, index) => {
  console.log(`${index + 1}. ${record.area_name}:`);
  console.log(`   Competitive Score: ${record.value.toFixed(2)} (1-10 scale) ← MAIN RANKING VALUE`);
  console.log(`   Nike Market Share: ${record.properties.nike_market_share.toFixed(1)}% ← REFERENCE DATA`);
  console.log(`   Rank: #${record.rank}`);
  console.log('');
});

console.log('');
console.log('✅ CRITICAL VERIFICATION:');
const firstValue = processedRecords[0].value;
const firstNikeShare = processedRecords[0].properties.nike_market_share;

if (firstValue > 20) {
  console.log(`❌ ERROR: Top record value is ${firstValue.toFixed(2)} - looks like market share % instead of competitive score!`);
  console.log(`   Expected: 1-10 competitive advantage score`);
  console.log(`   Got: ${firstValue.toFixed(2)} (possibly ${firstNikeShare.toFixed(1)}% Nike market share)`);
} else {
  console.log(`✅ SUCCESS: Top record value is ${firstValue.toFixed(2)} - appears to be competitive advantage score`);
  console.log(`   Nike market share (${firstNikeShare.toFixed(1)}%) is correctly stored in properties`);
  console.log(`   System is using competitive scores (1-10) for ranking, not market share percentages`);
}

console.log('');
console.log('📊 Summary: If the system is working correctly, the "value" field should be');
console.log('   competitive advantage scores (1-10), not market share percentages (20-30%)');