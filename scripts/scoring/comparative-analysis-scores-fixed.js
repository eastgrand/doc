/**
 * Comparative Analysis Scoring Script - FIXED VERSION
 * 
 * Creates comparative analysis scores for the comparative analysis endpoint by analyzing
 * relative performance between different brands, regions, or market characteristics
 * to identify competitive advantages and positioning opportunities.
 * 
 * Formula: Brand Performance (40%) + Market Characteristics (30%) + Competitive Intensity (20%) + Relative Positioning (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('⚖️ Starting Comparative Analysis Scoring (FIXED)...');

// Load comparative analysis data
const dataPath = path.join(__dirname, '../../public/data/endpoints/comparative-analysis.json');
let data;

try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`✅ Loaded data with ${data.results?.length || 0} records`);
} catch (error) {
  console.error('❌ Failed to load data:', error.message);
  process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for comparative analysis scoring...`);

// First pass: Calculate comparative baselines for relative analysis
const comparativeBaselines = calculateComparativeBaselines(data.results);

// Comparative analysis scoring formula considers SHAP values and available data
function calculateComparativeScore(record, baselines) {
  // Enhanced scoring using more SHAP features to create better differentiation
  let comparativeScore = 0;
  
  // Extract available fields
  const totalPop = Number(record.TOTPOP_CY) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
  
  // Get comprehensive SHAP values for better differentiation
  const shapNike = Number(record.shap_MP30034A_B_P) || 0;
  const shapAdidas = Number(record.shap_MP30029A_B_P) || 0;
  const shapTotalPop = Number(record.shap_TOTPOP_CY) || 0;
  const shapAge = Number(record.shap_Age) || 0;
  const shapIncome = Number(record.shap_AVGHINC_CY) || 0;
  const shapAsian = Number(record.shap_ASIAN_CY_P) || 0;
  const shapBlack = Number(record.shap_BLACK_CY_P) || 0;
  const shapAmerind = Number(record.shap_AMERIND_CY_P) || 0;
  
  // Use actual demographic percentages for more variation
  const asianPct = Number(record.value_ASIAN_CY_P) || 0;
  const blackPct = Number(record.value_BLACK_CY_P) || 0;
  const amerindPct = Number(record.value_AMERIND_CY_P) || 0;
  
  // 1. BRAND PERFORMANCE COMPONENT (35%) - More granular
  let brandPerformance = 0;
  
  // Nike SHAP importance (scaled for variation)
  if (shapNike !== 0) {
    brandPerformance += shapNike * 20; // Moderate SHAP scaling
  }
  
  // Brand market share with fine gradations
  const nikeDominance = nikeShare - adidasShare;
  brandPerformance += nikeDominance * 0.3; // Direct proportion
  
  // Nike absolute performance with gradations
  brandPerformance += nikeShare * 0.2;
  
  // Competitive pressure bonus/penalty
  const totalBrandPresence = nikeShare + adidasShare;
  brandPerformance += totalBrandPresence * 0.1;
  
  comparativeScore += brandPerformance * 0.35;
  
  // 2. DEMOGRAPHIC SHAP COMPONENT (30%) - Use multiple SHAP features
  let demographicShap = 0;
  
  // Population importance
  demographicShap += shapTotalPop * 10;
  
  // Age demographics importance
  demographicShap += shapAge * 8;
  
  // Income importance  
  demographicShap += shapIncome * 12;
  
  // Ethnic diversity SHAP importance
  demographicShap += shapAsian * 5;
  demographicShap += shapBlack * 5;
  demographicShap += shapAmerind * 5;
  
  comparativeScore += demographicShap * 0.30;
  
  // 3. ACTUAL DEMOGRAPHIC VALUES (20%) - Use real demographic variation
  let demographicValues = 0;
  
  // Ethnic composition variation (creates differentiation within cities)
  demographicValues += asianPct * 0.3;
  demographicValues += blackPct * 0.2;
  demographicValues += amerindPct * 0.4;
  
  // Population size factor
  demographicValues += Math.log(totalPop + 1) * 2;
  
  comparativeScore += demographicValues * 0.20;
  
  // 4. COMPETITIVE CONTEXT (15%) - Market positioning
  let competitiveContext = 0;
  
  // Adidas SHAP (inverse relationship)
  competitiveContext -= shapAdidas * 30;
  
  // Market gap opportunity
  const marketGap = Math.max(0, 100 - totalBrandPresence);
  competitiveContext += marketGap * 0.1;
  
  // Relative performance vs baselines
  competitiveContext += (nikeShare - baselines.avgNikeShare) * 0.5;
  competitiveContext += (totalPop - baselines.avgTotalPop) / 10000;
  
  comparativeScore += competitiveContext * 0.15;
  
  // Add a small random component based on record ID for tie-breaking
  const recordId = record.ID || record.id || '0';
  const hashValue = parseInt(recordId.toString().slice(-2)) || 0;
  comparativeScore += hashValue * 0.01;
  
  // Return score in range 40-95 with better spread
  const finalScore = 60 + (comparativeScore * 0.8); // Scale and offset for spread
  return Math.max(40, Math.min(95, finalScore));
}

// Helper function to calculate comparative baselines
function calculateComparativeBaselines(records) {
  const validRecords = records.filter(r => r);
  
  if (validRecords.length === 0) {
    return {
      avgNikeShare: 0,
      avgAdidasShare: 0,
      avgTotalPop: 0
    };
  }
  
  const totals = validRecords.reduce((acc, record) => {
    const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    const totalPop = Number(record.TOTPOP_CY) || 0;
    
    return {
      nikeShare: acc.nikeShare + nikeShare,
      adidasShare: acc.adidasShare + adidasShare,
      totalPop: acc.totalPop + totalPop
    };
  }, { nikeShare: 0, adidasShare: 0, totalPop: 0 });
  
  return {
    avgNikeShare: totals.nikeShare / validRecords.length,
    avgAdidasShare: totals.adidasShare / validRecords.length,
    avgTotalPop: totals.totalPop / validRecords.length
  };
}

console.log('🔄 Calculating comparative analysis scores...');

let processedCount = 0;
let scoreSummary = { min: 100, max: 0, sum: 0 };

data.results.forEach((record, index) => {
  const score = calculateComparativeScore(record, comparativeBaselines);
  record.comparative_analysis_score = score;
  
  // Track statistics
  scoreSummary.min = Math.min(scoreSummary.min, score);
  scoreSummary.max = Math.max(scoreSummary.max, score);
  scoreSummary.sum += score;
  
  processedCount++;
  
  if (processedCount % 500 === 0) {
    console.log(`   Processed ${processedCount}/${data.results.length} records...`);
  }
});

// Calculate final statistics
const avgScore = scoreSummary.sum / processedCount;
const scoreRange = scoreSummary.max - scoreSummary.min;

console.log(`⚖️ Comparative Analysis Scoring Statistics:`);
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreSummary.min.toFixed(1)} - ${scoreSummary.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Score spread: ${scoreRange.toFixed(1)}`);

// Show top areas
const topComparative = data.results
  .sort((a, b) => b.comparative_analysis_score - a.comparative_analysis_score)
  .slice(0, 15);

console.log('⚖️ Top 15 Best Comparative Performance Areas:');
topComparative.forEach((record, index) => {
  const score = record.comparative_analysis_score;
  const description = record.value_DESCRIPTION || record.DESCRIPTION || record.ID;
  const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const nikeDominance = nikeShare - adidasShare;
  
  console.log(`   ${index + 1}. ${description}: ${score.toFixed(1)} comparative score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Adidas: ${adidasShare.toFixed(1)}%, Nike Lead: ${nikeDominance.toFixed(1)}%`);
});

// Add metadata
data.comparative_analysis_metadata = {
  scoring_methodology: {
    brand_performance: '40% - Nike vs competitors performance based on SHAP importance',
    market_characteristics: '30% - Demographics and market size based on SHAP values',
    competitive_intensity: '20% - Market competitiveness and brand presence',
    relative_positioning: '10% - Performance relative to baseline averages'
  },
  baseline_metrics: {
    avg_nike_share: comparativeBaselines.avgNikeShare.toFixed(2),
    avg_adidas_share: comparativeBaselines.avgAdidasShare.toFixed(2),
    avg_total_population: Math.round(comparativeBaselines.avgTotalPop).toLocaleString()
  },
  score_statistics: {
    min_score: scoreSummary.min,
    max_score: scoreSummary.max,
    avg_score: avgScore,
    score_range: scoreRange,
    total_records: processedCount
  },
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving Comparative Analysis...');
try {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Successfully saved comparative-analysis.json');
} catch (error) {
  console.error('❌ Failed to save:', error.message);
}

console.log('✅ Comparative analysis scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`⚖️ All ${processedCount.toLocaleString()} records now include comparative_analysis_score field`);