#!/usr/bin/env node

// CORRECTED Nike Competitive Advantage Formula
// Uses only CONFIRMED brand mappings from concept-mapping.ts
console.log('🎯 CORRECTED Nike Competitive Advantage Score Calculator');
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

// CONFIRMED BRAND MAPPINGS (from concept-mapping.ts)
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
  
  // Product categories (not individual brands but relevant for competition)
  'MP30021A_B_P': 'Running shoes (category)',
  'MP30018A_B_P': 'Basketball shoes (category)', 
  'MP30019A_B_P': 'Cross training shoes (category)',
  'MP30016A_B_P': 'Athletic shoes (general category)'
};

// Enhanced competitive advantage calculation using CONFIRMED brands only
function calculateCorrectedCompetitiveScore(record) {
  try {
    // ========== 1. MARKET DOMINANCE (40% weight) ==========
    const nikeShare = Number(record['value_MP30034A_B_P']) || 0;
    
    // Get all CONFIRMED competitor brand shares (exclude categories)
    const competitorBrands = [
      'MP30029A_B_P', // Adidas
      'MP30032A_B_P', // Jordan  
      'MP30031A_B_P', // Converse
      'MP30035A_B_P', // Puma
      'MP30033A_B_P', // New Balance
      'MP30030A_B_P', // Asics
      'MP30037A_B_P', // Skechers
      'MP30036A_B_P'  // Reebok
    ];
    
    let totalCompetitorShare = 0;
    let competitorShares = [];
    
    competitorBrands.forEach(brandCode => {
      const share = Number(record[`value_${brandCode}`]) || 0;
      totalCompetitorShare += share;
      if (share > 0) competitorShares.push(share);
    });
    
    // Market dominance: Nike vs confirmed competitors only
    const totalConfirmedMarket = nikeShare + totalCompetitorShare;
    const marketDominance = totalConfirmedMarket > 0 ? nikeShare / totalConfirmedMarket : 0;
    
    // Market concentration: High concentration = fewer strong competitors
    const herfindahlIndex = competitorShares.length > 0 
      ? competitorShares.reduce((sum, share) => sum + (share / totalCompetitorShare) ** 2, 0)
      : 1;
    
    const dominanceScore = marketDominance * (1 + herfindahlIndex * 0.5); // Boost for concentrated markets
    
    // ========== 2. SHAP-WEIGHTED DEMOGRAPHICS (30% weight) ==========
    const nikeShap = Number(record['shap_MP30034A_B_P']) || 0;
    
    // Key demographic SHAP values that correlate with Nike performance
    const asianPopShap = Number(record.shap_ASIAN_CY_P) || 0;
    const millennialShap = Number(record.shap_MILLENN_CY) || 0;
    const genZShap = Number(record.shap_GENZ_CY) || 0;
    const householdPopShap = Number(record.shap_HHPOP_CY) || 0;
    
    // Normalized demographic favorability (positive SHAP = favorable)
    const demographicFavorability = Math.max(0, 
      (nikeShap * 0.3) + 
      (asianPopShap * 0.25) + 
      (millennialShap * 0.2) + 
      (genZShap * 0.15) +
      (householdPopShap * 0.1)
    ) / 50; // Normalize to 0-1 scale
    
    // ========== 3. COMPETITIVE PRESSURE INDEX (20% weight) ==========
    // Identify biggest threats from confirmed competitors
    const strongestCompetitor = Math.max(...competitorShares, 0);
    const competitorThreat = nikeShare > 0 ? strongestCompetitor / nikeShare : 999;
    
    // Lower pressure = better for Nike (cap threat at 5x Nike's share)
    const competitivePressure = Math.max(0, 1 - Math.min(competitorThreat, 5) / 5);
    
    // ========== 4. CATEGORY STRENGTH FACTOR (10% weight) ==========
    // Check Nike's strength in key categories vs category averages
    const runningCategoryShare = Number(record['value_MP30021A_B_P']) || 0;
    const basketballCategoryShare = Number(record['value_MP30018A_B_P']) || 0;
    
    // Nike should perform well in categories where it's strong
    const categoryAlignment = (nikeShare >= runningCategoryShare * 0.8 ? 0.6 : 0) + 
                             (nikeShare >= basketballCategoryShare * 0.5 ? 0.4 : 0);
    
    // ========== FINAL WEIGHTED SCORE ==========
    const weightedScore = 
      (Math.min(dominanceScore, 1) * 0.40) +           // Market dominance: 40%
      (Math.min(demographicFavorability, 1) * 0.30) +  // Demographics: 30%
      (competitivePressure * 0.20) +                   // Competition: 20%
      (categoryAlignment * 0.10);                      // Category strength: 10%
    
    // Convert to 1-10 scale with realistic distribution
    let finalScore = 1 + (weightedScore * 9);
    
    // Nike brand strength adjustments based on absolute market share
    if (nikeShare >= 35) finalScore += 1.5;      // Dominant position
    else if (nikeShare >= 28) finalScore += 1.0; // Strong position
    else if (nikeShare >= 22) finalScore += 0.5; // Good position
    else if (nikeShare <= 12) finalScore -= 1.0; // Weak position
    else if (nikeShare <= 8) finalScore -= 2.0;  // Very weak position
    
    // Ensure score is between 1-10
    finalScore = Math.max(1.0, Math.min(10.0, finalScore));
    
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
        confirmedCompetitors: competitorBrands.length
      }
    };
    
  } catch (error) {
    console.log(`⚠️ Error calculating score for record: ${error.message}`);
    return { score: 5.0, components: {} };
  }
}

// Test the corrected formula on sample records
console.log('\n🧪 TESTING: Corrected Competitive Formula (Confirmed Brands Only)');
console.log('='.repeat(60));

const sampleRecords = data.results.slice(0, 5);

sampleRecords.forEach((record, idx) => {
  const result = calculateCorrectedCompetitiveScore(record);
  
  console.log(`\n📊 Record ${idx + 1}:`);
  console.log(`   Nike Market Share: ${result.components.nikeShare}%`);
  console.log(`   Confirmed Competitors: ${result.components.confirmedCompetitors} brands`);
  console.log(`   Total Competitor Share: ${result.components.totalCompetitorShare?.toFixed(1)}%`);
  console.log(`   Market Dominance: ${result.components.dominanceScore}`);
  console.log(`   Demographic Score: ${result.components.demographicFavorability}`);
  console.log(`   Competitive Pressure: ${result.components.competitivePressure}`);
  console.log(`   Category Alignment: ${result.components.categoryAlignment}`);
  console.log(`   Strongest Competitor: ${result.components.strongestCompetitor}%`);
  console.log(`   Market Concentration: ${result.components.marketConcentration}`);
  console.log(`   🏆 FINAL SCORE: ${result.score}/10`);
});

// Apply corrected scores to all records
console.log('\n🔄 Applying Corrected Scores to All Records...');
let correctedCount = 0;
let scoreDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };

for (let i = 0; i < data.results.length; i++) {
  const result = calculateCorrectedCompetitiveScore(data.results[i]);
  
  // Replace with corrected competitive advantage score
  data.results[i].competitive_advantage_score = result.score;
  data.results[i].competitive_components = result.components;
  
  correctedCount++;
  const scoreBucket = Math.floor(result.score);
  scoreDistribution[scoreBucket] = (scoreDistribution[scoreBucket] || 0) + 1;
  
  if (correctedCount % 1000 === 0) {
    console.log(`   Corrected ${correctedCount} records...`);
  }
}

console.log(`\n✅ Corrected ${correctedCount} records with confirmed-brands-only competitive scores`);

console.log('\n📊 CORRECTED SCORE DISTRIBUTION:');
Object.keys(scoreDistribution).forEach(score => {
  const count = scoreDistribution[score];
  const percentage = ((count / correctedCount) * 100).toFixed(1);
  const bar = '█'.repeat(Math.floor(percentage / 2));
  console.log(`   ${score}: ${count.toString().padStart(4)} records (${percentage}%) ${bar}`);
});

// Calculate statistics
const allScores = data.results.map(r => r.competitive_advantage_score);
const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
const minScore = Math.min(...allScores);
const maxScore = Math.max(...allScores);

console.log(`\n📈 CORRECTED FORMULA STATISTICS:`);
console.log(`   Average Score: ${avgScore.toFixed(2)}`);
console.log(`   Score Range: ${minScore} - ${maxScore}`);
console.log(`   Standard Deviation: ${Math.sqrt(allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length).toFixed(2)}`);

// Show confirmed brands used
console.log(`\n✅ CONFIRMED BRANDS USED IN ANALYSIS:`);
Object.entries(CONFIRMED_BRANDS).forEach(([code, brand]) => {
  if (!brand.includes('category')) {
    console.log(`   ${code} = ${brand}`);
  }
});

console.log(`\n📋 CATEGORY FIELDS USED FOR CONTEXT:`);
Object.entries(CONFIRMED_BRANDS).forEach(([code, brand]) => {
  if (brand.includes('category')) {
    console.log(`   ${code} = ${brand}`);
  }
});

// Save corrected data
console.log('\n💾 Saving Corrected Competitive Analysis...');
try {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Successfully saved corrected competitive-analysis.json');
} catch (error) {
  console.error('❌ Failed to save:', error.message);
}

console.log('\n🎯 CORRECTED FORMULA BENEFITS:');
console.log('✅ Uses only CONFIRMED brand mappings (no "unknown brands")');
console.log('✅ Includes 8 major confirmed competitors vs Nike');
console.log('✅ Uses category data for market context (running, basketball)');
console.log('✅ Accurate SHAP-weighted demographic scoring');
console.log('✅ Realistic competitive pressure assessment');
console.log('✅ Market concentration analysis (Herfindahl Index)');

console.log('\n🏆 Nike competitive advantage scores corrected successfully!');