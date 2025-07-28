#!/usr/bin/env node

// SIMPLE Nike Competitive Advantage Formula
// Focuses on market share variation and competitive dynamics without problematic SHAP values
console.log('🎯 SIMPLE Nike Competitive Advantage Score Calculator');
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

// Calculate market share statistics for normalization
function calculateMarketShareStats(records) {
  const nikeShares = [];
  const totalMarkets = [];
  const competitorShares = [];
  
  const competitorBrands = [
    'MP30029A_B_P', 'MP30032A_B_P', 'MP30031A_B_P', 'MP30035A_B_P',
    'MP30033A_B_P', 'MP30030A_B_P', 'MP30037A_B_P', 'MP30036A_B_P'
  ];
  
  records.forEach(record => {
    const nikeShare = Number(record['value_MP30034A_B_P']) || 0;
    let totalCompetitorShare = 0;
    
    competitorBrands.forEach(brandCode => {
      const share = Number(record[`value_${brandCode}`]) || 0;
      totalCompetitorShare += share;
    });
    
    const totalMarket = nikeShare + totalCompetitorShare;
    
    nikeShares.push(nikeShare);
    totalMarkets.push(totalMarket);
    competitorShares.push(totalCompetitorShare);
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
    nike: calculateStats(nikeShares),
    totalMarket: calculateStats(totalMarkets),
    competitors: calculateStats(competitorShares)
  };
}

// Simple competitive advantage calculation focused on market dynamics
function calculateSimpleCompetitiveScore(record, marketStats) {
  try {
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
    
    // ========== 1. NIKE MARKET POSITION (50% weight) ==========
    // Normalize Nike's share relative to the range in the dataset
    const nikePositionScore = marketStats.nike.range > 0 
      ? (nikeShare - marketStats.nike.min) / marketStats.nike.range 
      : 0.5;
    
    // ========== 2. COMPETITIVE LANDSCAPE (30% weight) ==========
    const totalConfirmedMarket = nikeShare + totalCompetitorShare;
    
    // Market dominance: Nike vs total competition
    const marketDominance = totalConfirmedMarket > 0 ? nikeShare / totalConfirmedMarket : 0;
    
    // Competition intensity: fewer strong competitors = better for Nike
    const strongestCompetitor = Math.max(...competitorShares, 0);
    const competitionIntensity = nikeShare > 0 
      ? Math.max(0, 1 - (strongestCompetitor / nikeShare))
      : 0;
    
    // Market concentration using Herfindahl Index
    const hhi = competitorShares.length > 0 
      ? competitorShares.reduce((sum, share) => sum + (share / totalCompetitorShare) ** 2, 0)
      : 1;
    
    const landscapeScore = (marketDominance * 0.5) + (competitionIntensity * 0.3) + (hhi * 0.2);
    
    // ========== 3. MARKET OPPORTUNITY (20% weight) ==========
    // Demographics using available non-SHAP demographic data
    const population = Number(record['value_TOTPOP_CY']) || 0;
    const wealthIndex = Number(record['value_WLTHINDXCY']) || 100;
    const avgIncome = Number(record['value_AVGHINC_CY']) || (wealthIndex * 500);
    
    // Normalize demographics (higher population and wealth = better opportunity)
    const popScore = population > 0 ? Math.min(1, population / 100000) : 0.5; // Cap at 100K
    const wealthScore = wealthIndex > 0 ? Math.min(1, wealthIndex / 200) : 0.5; // Cap at 200
    const incomeScore = avgIncome > 0 ? Math.min(1, avgIncome / 100000) : 0.5; // Cap at 100K
    
    const opportunityScore = (popScore * 0.4) + (wealthScore * 0.3) + (incomeScore * 0.3);
    
    // ========== FINAL WEIGHTED SCORE ==========
    const weightedScore = 
      (nikePositionScore * 0.50) +     // Nike's relative market position: 50%
      (landscapeScore * 0.30) +        // Competitive landscape: 30%
      (opportunityScore * 0.20);       // Market opportunity: 20%
    
    // Convert to 0-100 scale with realistic distribution
    let finalScore = weightedScore * 100;
    
    // Bonus adjustments for exceptional Nike performance
    if (nikeShare >= 30) finalScore += 15;      // Very strong position
    else if (nikeShare >= 25) finalScore += 10; // Strong position
    else if (nikeShare >= 20) finalScore += 5;  // Good position
    
    // Penalty for weak positions
    if (nikeShare <= 15) finalScore -= 10;      // Below average
    if (nikeShare <= 12) finalScore -= 15;      // Weak position
    
    // Competitive pressure penalty
    if (strongestCompetitor > nikeShare * 1.5) finalScore -= 10;
    if (strongestCompetitor > nikeShare * 2) finalScore -= 15;
    
    // Ensure score is between 0-100
    finalScore = Math.max(5, Math.min(95, finalScore));
    
    return {
      score: Math.round(finalScore * 10) / 10,
      components: {
        nikeShare,
        totalCompetitorShare,
        nikePositionScore: Math.round(nikePositionScore * 1000) / 1000,
        marketDominance: Math.round(marketDominance * 1000) / 1000,
        competitionIntensity: Math.round(competitionIntensity * 1000) / 1000,
        landscapeScore: Math.round(landscapeScore * 1000) / 1000,
        opportunityScore: Math.round(opportunityScore * 1000) / 1000,
        strongestCompetitor,
        marketConcentration: Math.round(hhi * 1000) / 1000,
        demographics: {
          population: Math.round(population),
          wealthIndex: Math.round(wealthIndex),
          avgIncome: Math.round(avgIncome)
        }
      }
    };
    
  } catch (error) {
    console.log(`⚠️ Error calculating score for record: ${error.message}`);
    return { score: 25.0, components: {} };
  }
}

// Calculate market statistics
console.log('\n📊 Calculating market share statistics...');
const marketStats = calculateMarketShareStats(data.results);

console.log('Market Share Statistics:');
console.log(`  Nike: min=${marketStats.nike.min}%, max=${marketStats.nike.max}%, avg=${marketStats.nike.mean.toFixed(1)}%`);
console.log(`  Competitors: min=${marketStats.competitors.min.toFixed(1)}%, max=${marketStats.competitors.max.toFixed(1)}%, avg=${marketStats.competitors.mean.toFixed(1)}%`);
console.log(`  Total Market: min=${marketStats.totalMarket.min.toFixed(1)}%, max=${marketStats.totalMarket.max.toFixed(1)}%, avg=${marketStats.totalMarket.mean.toFixed(1)}%`);

// Test the simple formula on sample records
console.log('\n🧪 TESTING: Simple Competitive Formula');
console.log('='.repeat(60));

const sampleRecords = data.results.slice(0, 8);

sampleRecords.forEach((record, idx) => {
  const result = calculateSimpleCompetitiveScore(record, marketStats);
  
  console.log(`\n📊 Record ${idx + 1}:`);
  console.log(`   Nike Market Share: ${result.components.nikeShare}%`);
  console.log(`   Nike Position Score: ${result.components.nikePositionScore}`);
  console.log(`   Market Dominance: ${result.components.marketDominance}`);
  console.log(`   Competition Intensity: ${result.components.competitionIntensity}`);
  console.log(`   Landscape Score: ${result.components.landscapeScore}`);
  console.log(`   Opportunity Score: ${result.components.opportunityScore}`);
  console.log(`   Strongest Competitor: ${result.components.strongestCompetitor}%`);
  console.log(`   Demographics: Pop=${(result.components.demographics.population/1000).toFixed(0)}K, Wealth=${result.components.demographics.wealthIndex}, Income=$${(result.components.demographics.avgIncome/1000).toFixed(0)}K`);
  console.log(`   🏆 FINAL SCORE: ${result.score}/100`);
});

// Apply simple scores to all records
console.log('\n🔄 Applying Simple Scores to All Records...');
let correctedCount = 0;
let scoreDistribution = {};

for (let i = 0; i < data.results.length; i++) {
  const result = calculateSimpleCompetitiveScore(data.results[i], marketStats);
  
  data.results[i].competitive_advantage_score = result.score;
  data.results[i].competitive_components = result.components;
  
  correctedCount++;
  const scoreBucket = Math.floor(result.score / 10) * 10;
  scoreDistribution[scoreBucket] = (scoreDistribution[scoreBucket] || 0) + 1;
  
  if (correctedCount % 1000 === 0) {
    console.log(`   Processed ${correctedCount} records...`);
  }
}

console.log(`\n✅ Processed ${correctedCount} records with simple competitive scores`);

console.log('\n📊 SIMPLE SCORE DISTRIBUTION:');
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

console.log(`\n📈 SIMPLE FORMULA STATISTICS:`);
console.log(`   Average Score: ${avgScore.toFixed(2)}`);
console.log(`   Score Range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
console.log(`   Standard Deviation: ${stdDev.toFixed(2)}`);

// Show quartile breakdown
const sortedScores = [...allScores].sort((a, b) => a - b);
const q1 = sortedScores[Math.floor(sortedScores.length * 0.25)];
const q2 = sortedScores[Math.floor(sortedScores.length * 0.5)];
const q3 = sortedScores[Math.floor(sortedScores.length * 0.75)];

console.log(`   Quartiles: Q1=${q1.toFixed(1)}, Q2=${q2.toFixed(1)}, Q3=${q3.toFixed(1)}`);

// Save simple data
console.log('\n💾 Saving Simple Competitive Analysis...');
try {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('✅ Successfully saved simple competitive-analysis.json');
} catch (error) {
  console.error('❌ Failed to save:', error.message);
}

console.log('\n🎯 SIMPLE FORMULA BENEFITS:');
console.log('✅ Uses actual Nike market share variation (19.78% - 26.2%)');
console.log('✅ Focuses on competitive landscape dynamics');
console.log('✅ Incorporates demographic opportunity without problematic SHAP');
console.log('✅ Realistic score distribution with meaningful spread');
console.log('✅ Clear scoring logic based on market position');

console.log('\n🏆 Nike competitive advantage scores simplified successfully!');