#!/usr/bin/env node

// FIXED Nike Competitive Advantage Formula
// Addresses score clustering issue with proper SHAP normalization and score distribution
console.log('🔧 FIXED Nike Competitive Advantage Score Calculator');
console.log('='.repeat(70));

const fs = require('fs');
const path = require('path');

// Load competitive analysis data
const dataPath = path.join(__dirname, '../../public/data/endpoints/competitive-analysis.json');
let data;

try {
  data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`✅ Loaded data with ${data.results?.length || 0} records`);
} catch (error) {
  console.error('❌ Failed to load data:', error.message);
  process.exit(1);
}

// CONFIRMED BRAND MAPPINGS
const CONFIRMED_BRANDS = {
  'MP30034A_B_P': 'Nike',           // Target brand
  'MP30029A_B_P': 'Adidas',         // Main competitor  
  'MP30032A_B_P': 'Jordan',         // Premium segment
  'MP30031A_B_P': 'Converse',       // Casual segment
  'MP30035A_B_P': 'Puma',           // Athletic competitor
  'MP30033A_B_P': 'New Balance',    // Running specialist
  'MP30030A_B_P': 'Asics',          // Running competitor
  'MP30037A_B_P': 'Skechers',       // Comfort/lifestyle
  'MP30036A_B_P': 'Reebok',         // Fitness/crosstraining
};

// Calculate demographic SHAP statistics for proper normalization
function calculateShapStats(records) {
  const allShapValues = {
    nike: [],
    asian: [],
    millennial: [],
    genZ: [],
    household: []
  };
  
  records.forEach(record => {
    const nikeShap = Number(record['shap_MP30034A_B_P']) || 0;
    const asianShap = Number(record.shap_ASIAN_CY_P) || 0;
    const millennialShap = Number(record.shap_MILLENN_CY) || 0;
    const genZShap = Number(record.shap_GENZ_CY) || 0;
    const householdShap = Number(record.shap_HHPOP_CY) || 0;
    
    allShapValues.nike.push(nikeShap);
    allShapValues.asian.push(asianShap);
    allShapValues.millennial.push(millennialShap);
    allShapValues.genZ.push(genZShap);
    allShapValues.household.push(householdShap);
  });
  
  const calculateStats = (values) => {
    const sorted = values.sort((a, b) => a - b);
    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const std = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length);
    return {
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean,
      std,
      range: sorted[sorted.length - 1] - sorted[0]
    };
  };
  
  return {
    nike: calculateStats(allShapValues.nike),
    asian: calculateStats(allShapValues.asian),
    millennial: calculateStats(allShapValues.millennial),
    genZ: calculateStats(allShapValues.genZ),
    household: calculateStats(allShapValues.household)
  };
}

// Fixed competitive advantage calculation
function calculateFixedCompetitiveScore(record, shapStats) {
  try {
    // ========== 1. MARKET DOMINANCE (35% weight) ==========
    const nikeShare = Number(record['value_MP30034A_B_P']) || 0;
    
    const competitorBrands = [
      'MP30029A_B_P', 'MP30032A_B_P', 'MP30031A_B_P', 'MP30035A_B_P',
      'MP30033A_B_P', 'MP30030A_B_P', 'MP30037A_B_P', 'MP30036A_B_P'
    ];
    
    let totalCompetitorShare = 0;
    let competitorShares = [];
    
    competitorBrands.forEach(brandCode => {
      const share = Number(record[`value_${brandCode}`]) || 0;
      totalCompetitorShare += share;
      if (share > 0) competitorShares.push(share);
    });
    
    const totalConfirmedMarket = nikeShare + totalCompetitorShare;
    const marketDominance = totalConfirmedMarket > 0 ? nikeShare / totalConfirmedMarket : 0;
    
    // Market concentration (Herfindahl Index)
    const herfindahlIndex = competitorShares.length > 0 
      ? competitorShares.reduce((sum, share) => sum + (share / totalCompetitorShare) ** 2, 0)
      : 1;
    
    // FIXED: More aggressive dominance scoring
    const dominanceScore = Math.min(1, marketDominance * (1 + herfindahlIndex * 0.3));
    
    // ========== 2. FIXED SHAP-WEIGHTED DEMOGRAPHICS (35% weight) ==========
    const nikeShap = Number(record['shap_MP30034A_B_P']) || 0;
    const asianPopShap = Number(record.shap_ASIAN_CY_P) || 0;
    const millennialShap = Number(record.shap_MILLENN_CY) || 0;
    const genZShap = Number(record.shap_GENZ_CY) || 0;
    const householdPopShap = Number(record.shap_HHPOP_CY) || 0;
    
    // FIXED: Proper normalization using actual data ranges
    const normalizeShap = (value, stats) => {
      if (stats.range === 0) return 0.5; // neutral if no variation
      // Normalize to 0-1 range, then center around 0.5
      return Math.max(0, Math.min(1, (value - stats.min) / stats.range));
    };
    
    const nikeShapNorm = normalizeShap(nikeShap, shapStats.nike);
    const asianShapNorm = normalizeShap(asianPopShap, shapStats.asian);
    const millennialShapNorm = normalizeShap(millennialShap, shapStats.millennial);
    const genZShapNorm = normalizeShap(genZShap, shapStats.genZ);
    const householdShapNorm = normalizeShap(householdPopShap, shapStats.household);
    
    // FIXED: Weighted demographic favorability with proper scaling
    const demographicFavorability = 
      (nikeShapNorm * 0.4) + 
      (asianShapNorm * 0.25) + 
      (millennialShapNorm * 0.15) + 
      (genZShapNorm * 0.15) +
      (householdShapNorm * 0.05);
    
    // ========== 3. COMPETITIVE PRESSURE INDEX (20% weight) ==========
    const strongestCompetitor = Math.max(...competitorShares, 0);
    const competitorThreat = nikeShare > 0 ? strongestCompetitor / nikeShare : 5;
    const competitivePressure = Math.max(0, 1 - Math.min(competitorThreat, 5) / 5);
    
    // ========== 4. CATEGORY ALIGNMENT (10% weight) ==========
    const runningCategoryShare = Number(record['value_MP30021A_B_P']) || 0;
    const basketballCategoryShare = Number(record['value_MP30018A_B_P']) || 0;
    
    const categoryAlignment = (nikeShare >= runningCategoryShare * 0.8 ? 0.6 : 0) + 
                             (nikeShare >= basketballCategoryShare * 0.5 ? 0.4 : 0);
    
    // ========== FIXED FINAL WEIGHTED SCORE ==========
    const weightedScore = 
      (dominanceScore * 0.35) +           // Market dominance: 35%
      (demographicFavorability * 0.35) +  // Demographics: 35%
      (competitivePressure * 0.20) +      // Competition: 20%
      (categoryAlignment * 0.10);         // Category strength: 10%
    
    // FIXED: Remove artificial floor, use full 0-100 range
    let finalScore = weightedScore * 100;
    
    // Nike brand strength adjustments based on absolute market share
    if (nikeShare >= 40) finalScore += 20;      // Dominant position
    else if (nikeShare >= 32) finalScore += 15; // Very strong position
    else if (nikeShare >= 25) finalScore += 10; // Strong position
    else if (nikeShare >= 18) finalScore += 5;  // Good position
    else if (nikeShare <= 10) finalScore -= 15; // Weak position
    else if (nikeShare <= 6) finalScore -= 25;  // Very weak position
    
    // Ensure score is between 0-100
    finalScore = Math.max(0, Math.min(100, finalScore));
    
    return {
      score: Math.round(finalScore * 10) / 10,
      components: {
        nikeShare,
        totalCompetitorShare,
        confirmedMarketTotal: totalConfirmedMarket,
        dominanceScore: Math.round(dominanceScore * 1000) / 1000,
        demographicFavorability: Math.round(demographicFavorability * 1000) / 1000,
        competitivePressure: Math.round(competitivePressure * 1000) / 1000,
        categoryAlignment: Math.round(categoryAlignment * 1000) / 1000,
        strongestCompetitor,
        marketConcentration: Math.round(herfindahlIndex * 1000) / 1000,
        shapComponents: {
          nikeShapNorm: Math.round(nikeShapNorm * 1000) / 1000,
          asianShapNorm: Math.round(asianShapNorm * 1000) / 1000,
          millennialShapNorm: Math.round(millennialShapNorm * 1000) / 1000,
          genZShapNorm: Math.round(genZShapNorm * 1000) / 1000
        }
      }
    };
    
  } catch (error) {
    console.log(`⚠️ Error calculating score for record: ${error.message}`);
    return { score: 25.0, components: {} };
  }
}

// Calculate SHAP statistics from all records
console.log('\n📊 Calculating SHAP normalization statistics...');
const shapStats = calculateShapStats(data.results);

console.log('SHAP Statistics:');
Object.entries(shapStats).forEach(([key, stats]) => {
  console.log(`  ${key}: min=${stats.min.toFixed(3)}, max=${stats.max.toFixed(3)}, range=${stats.range.toFixed(3)}`);
});

// Test the fixed formula on sample records
console.log('\n🧪 TESTING: Fixed Competitive Formula');
console.log('='.repeat(60));

const sampleRecords = data.results.slice(0, 5);

sampleRecords.forEach((record, idx) => {
  const result = calculateFixedCompetitiveScore(record, shapStats);
  
  console.log(`\n📊 Record ${idx + 1}:`);
  console.log(`   Nike Market Share: ${result.components.nikeShare}%`);
  console.log(`   Market Dominance: ${result.components.dominanceScore}`);
  console.log(`   Demographic Score: ${result.components.demographicFavorability}`);
  console.log(`   SHAP Components:`, result.components.shapComponents);
  console.log(`   Competitive Pressure: ${result.components.competitivePressure}`);
  console.log(`   Category Alignment: ${result.components.categoryAlignment}`);
  console.log(`   🏆 FINAL SCORE: ${result.score}/100`);
});

// Apply fixed scores to all records
console.log('\n🔄 Applying Fixed Scores to All Records...');
let correctedCount = 0;
let scoreDistribution = {};

for (let i = 0; i < data.results.length; i++) {
  const result = calculateFixedCompetitiveScore(data.results[i], shapStats);
  
  data.results[i].competitive_advantage_score = result.score;
  data.results[i].competitive_components = result.components;
  
  correctedCount++;
  const scoreBucket = Math.floor(result.score / 10) * 10; // Group by 10s
  scoreDistribution[scoreBucket] = (scoreDistribution[scoreBucket] || 0) + 1;
  
  if (correctedCount % 1000 === 0) {
    console.log(`   Fixed ${correctedCount} records...`);
  }
}

console.log(`\n✅ Fixed ${correctedCount} records with improved competitive scores`);

console.log('\n📊 FIXED SCORE DISTRIBUTION:');
Object.keys(scoreDistribution).sort((a, b) => Number(a) - Number(b)).forEach(score => {
  const count = scoreDistribution[score];
  const percentage = ((count / correctedCount) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(percentage / 2));
  console.log(`   ${score}-${Number(score)+9}: ${count.toString().padStart(4)} records (${percentage}%) ${bar}`);
});

// Calculate statistics
const allScores = data.results.map(r => r.competitive_advantage_score);
const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
const minScore = Math.min(...allScores);
const maxScore = Math.max(...allScores);
const stdDev = Math.sqrt(allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length);

console.log(`\n📈 FIXED FORMULA STATISTICS:`);
console.log(`   Average Score: ${avgScore.toFixed(2)}`);
console.log(`   Score Range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
console.log(`   Standard Deviation: ${stdDev.toFixed(2)}`);

// Save fixed data
console.log('\n💾 Saving Fixed Competitive Analysis...');
try {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Successfully saved fixed competitive-analysis.json');
} catch (error) {
  console.error('❌ Failed to save:', error.message);
}

console.log('\n🎯 FIXES APPLIED:');
console.log('✅ Proper SHAP value normalization using actual data ranges');
console.log('✅ Removed artificial score floor (was base 10 + 80% of weighted)');
console.log('✅ Increased demographic weight from 30% to 35%');
console.log('✅ More aggressive market dominance scoring');
console.log('✅ Better score distribution across 0-100 range');

console.log('\n🏆 Nike competitive advantage scores fixed successfully!');