/**
 * Real Estate Analysis Scoring Script
 * 
 * Creates real estate analysis scores by analyzing market factors that affect
 * retail location decisions, property values, foot traffic potential, and
 * demographic alignment for optimal store placement.
 * 
 * Formula: Location Quality (35%) + Demographic Fit (25%) + Market Accessibility (25%) + Growth Trajectory (15%)
 */

const fs = require('fs');
const path = require('path');

console.log('🏠 Starting Real Estate Analysis Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for real estate analysis scoring...`);

function calculateRealEstateScore(record) {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let realEstateScore = 0;
  
  // 1. Location Quality (35 points)
  const populationDensity = totalPop >= 75000 ? 15 : totalPop >= 50000 ? 12 : totalPop >= 25000 ? 9 : 6;
  const locationQuality = populationDensity + (strategicScore / 100) * 20;
  realEstateScore += Math.min(locationQuality, 35);
  
  // 2. Demographic Fit (25 points)
  const demographicFit = (demographicScore / 100) * 25;
  realEstateScore += demographicFit;
  
  // 3. Market Accessibility (25 points)
  const incomeAccessibility = medianIncome >= 50000 ? 15 : medianIncome >= 35000 ? 10 : 5;
  const marketAccessibility = incomeAccessibility + (nikeShare / 40) * 10;
  realEstateScore += Math.min(marketAccessibility, 25);
  
  // 4. Growth Trajectory (15 points)
  const growthTrajectory = (trendScore / 100) * 15;
  realEstateScore += growthTrajectory;
  
  return Math.max(0, Math.min(100, Math.round(realEstateScore * 100) / 100));
}

// Calculate scores
let processedCount = 0;
const scoreStats = { min: 100, max: 0, sum: 0, scores: [] };

correlationData.results.forEach((record, index) => {
  const score = calculateRealEstateScore(record);
  record.real_estate_analysis_score = score;
  
  scoreStats.min = Math.min(scoreStats.min, score);
  scoreStats.max = Math.max(scoreStats.max, score);
  scoreStats.sum += score;
  scoreStats.scores.push(score);
  processedCount++;
});

const avgScore = scoreStats.sum / processedCount;
console.log(`🏠 Real Estate Analysis Complete: Range ${scoreStats.min.toFixed(1)}-${scoreStats.max.toFixed(1)}, Avg ${avgScore.toFixed(1)}`);

// Save data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`✅ Real estate analysis scores added to all ${processedCount.toLocaleString()} records`);