/**
 * Add Segment Profiling Scores to segment-profiling.json
 * 
 * Creates segment profiling scores by analyzing market segmentation potential,
 * demographic clustering strength, and behavioral grouping indicators.
 * 
 * Formula: Demographic Distinctiveness (35%) + Behavioral Clustering (30%) + Market Segment Strength (25%) + Profiling Clarity (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Segment Profiling Scoring...');

// Load the segment-profiling data
const dataPath = path.join(__dirname, '../../public/data/endpoints/segment-profiling.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data || !data.results) {
  console.error('❌ segment-profiling.json not found or invalid');
  process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for segment profiling scoring...`);

// First pass: Calculate baselines
let totalNikeShare = 0;
let totalIncome = 0;
let validIncomeCount = 0;

data.results.forEach(record => {
  const nikeShare = Number(record.mp30034a_b_p) || Number(record.MP30034A_B_P) || 0;
  totalNikeShare += nikeShare;
  
  const income = Number(record.median_income) || Number(record.MEDDI_CY) || 0;
  if (income > 0) {
    totalIncome += income;
    validIncomeCount++;
  }
});

const avgNikeShare = totalNikeShare / data.results.length;
const avgIncome = validIncomeCount > 0 ? totalIncome / validIncomeCount : 50000;

console.log(`📊 Baselines - Avg Nike Share: ${avgNikeShare.toFixed(1)}%, Avg Income: $${avgIncome.toFixed(0)}`);

// Calculate segment profiling score for each record
function calculateSegmentScore(record) {
  // Extract relevant metrics
  const nikeShare = Number(record.mp30034a_b_p) || Number(record.MP30034A_B_P) || 0;
  const adidasShare = Number(record.mp30029a_b_p) || Number(record.MP30029A_B_P) || 0;
  const totalPop = Number(record.total_population) || Number(record.TOTPOP_CY) || 0;
  const medianIncome = Number(record.median_income) || Number(record.MEDDI_CY) || 0;
  
  let segmentScore = 0;
  
  // 1. Demographic Distinctiveness (35%) - How distinct demographics are for segmentation
  let demographicDistinctiveness = 0;
  
  // Income variance from average
  if (medianIncome > 0) {
    const incomeRatio = medianIncome / avgIncome;
    if (incomeRatio > 1.5 || incomeRatio < 0.5) {
      demographicDistinctiveness += 15; // High income distinction
    } else if (incomeRatio > 1.2 || incomeRatio < 0.8) {
      demographicDistinctiveness += 10; // Moderate distinction
    } else {
      demographicDistinctiveness += 5; // Low distinction
    }
  }
  
  // Brand preference patterns
  const brandDiversity = Math.abs(nikeShare - adidasShare);
  if (brandDiversity > 5) {
    demographicDistinctiveness += 20; // Strong brand preference
  } else if (brandDiversity > 2) {
    demographicDistinctiveness += 15; // Moderate preference
  } else {
    demographicDistinctiveness += 10; // Balanced preferences
  }
  
  // 2. Behavioral Clustering (30%) - Strength of behavioral patterns
  let behavioralClustering = 0;
  
  // Nike share deviation from average
  const nikeDeviation = Math.abs(nikeShare - avgNikeShare);
  if (nikeDeviation > 5) {
    behavioralClustering += 20; // Strong behavioral pattern
  } else if (nikeDeviation > 2) {
    behavioralClustering += 15; // Moderate pattern
  } else {
    behavioralClustering += 10; // Average pattern
  }
  
  // Market size influence
  if (totalPop > 50000) {
    behavioralClustering += 10; // Large market bonus
  } else if (totalPop > 20000) {
    behavioralClustering += 7; // Medium market
  } else {
    behavioralClustering += 5; // Small market
  }
  
  // 3. Market Segment Strength (25%) - Natural market segments
  let marketSegmentStrength = 0;
  
  // Income-based segmentation potential
  if (medianIncome > 80000) {
    marketSegmentStrength += 15; // High-income segment
  } else if (medianIncome > 60000) {
    marketSegmentStrength += 12; // Upper-middle segment
  } else if (medianIncome > 40000) {
    marketSegmentStrength += 10; // Middle segment
  } else {
    marketSegmentStrength += 8; // Lower segment
  }
  
  // Brand loyalty indicator
  if (nikeShare > 15 || adidasShare > 12) {
    marketSegmentStrength += 10; // Strong brand loyalty
  } else {
    marketSegmentStrength += 5; // Average loyalty
  }
  
  // 4. Profiling Clarity (10%) - Data quality and reliability
  let profilingClarity = 5; // Base clarity
  
  // Bonus for complete data
  if (totalPop > 0 && medianIncome > 0) {
    profilingClarity += 5;
  }
  
  segmentScore = demographicDistinctiveness + behavioralClustering + marketSegmentStrength + profilingClarity;
  
  // Add noise for realistic distribution
  const noise = (Math.random() - 0.5) * 4;
  segmentScore = Math.max(0, Math.min(100, segmentScore + noise));
  
  return segmentScore;
}

// Process all records
let totalScore = 0;
let minScore = 100;
let maxScore = 0;

data.results.forEach(record => {
  const score = calculateSegmentScore(record);
  record.segment_profiling_score = Number(score.toFixed(1));
  
  totalScore += score;
  minScore = Math.min(minScore, score);
  maxScore = Math.max(maxScore, score);
});

// Save updated data
const outputPath = path.join(__dirname, '../../public/data/endpoints/segment-profiling.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

const avgScore = totalScore / data.results.length;
console.log('\n✅ Segment Profiling Scoring Complete!');
console.log(`📊 Score Statistics:`);
console.log(`   - Average: ${avgScore.toFixed(1)}`);
console.log(`   - Range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
console.log(`   - Total Records: ${data.results.length}`);
console.log(`💾 Updated file saved to: ${outputPath}`);