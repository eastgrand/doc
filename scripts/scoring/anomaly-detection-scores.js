/**
 * Anomaly Detection Scoring Script
 * 
 * Creates anomaly detection scores for the anomaly detection endpoint by identifying
 * statistical outliers and unusual patterns across geographic markets.
 * 
 * Formula: Statistical Deviation (40%) + Pattern Anomaly (30%) + Performance Outlier (20%) + Context Anomaly (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Anomaly Detection Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for anomaly detection scoring...`);

// First pass: Calculate statistical baselines for anomaly detection
const statisticalBaselines = calculateStatisticalBaselines(correlationData.results);

// Anomaly detection scoring formula considers:
// 1. Statistical Deviation (40%) - How far values deviate from statistical norms
// 2. Pattern Anomaly (30%) - Unusual patterns in score relationships  
// 3. Performance Outlier (20%) - Extreme performance vs market averages
// 4. Context Anomaly (10%) - Inconsistent data patterns within context

function calculateAnomalyScore(record, baselines) {
  // Extract relevant metrics for anomaly detection
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let anomalyScore = 0;
  
  // 1. STATISTICAL DEVIATION COMPONENT (40 points)
  // How far each metric deviates from population mean/std
  let statisticalDeviation = 0;
  
  // Nike share deviation
  const nikeZScore = baselines.nikeShare.std > 0 ? 
    Math.abs(nikeShare - baselines.nikeShare.mean) / baselines.nikeShare.std : 0;
  const nikeDeviation = Math.min(nikeZScore / 3, 1) * 8; // 8 points max, normalize to 3-sigma
  statisticalDeviation += nikeDeviation;
  
  // Strategic score deviation
  const strategicZScore = baselines.strategicScore.std > 0 ? 
    Math.abs(strategicScore - baselines.strategicScore.mean) / baselines.strategicScore.std : 0;
  const strategicDeviation = Math.min(strategicZScore / 3, 1) * 8; // 8 points max
  statisticalDeviation += strategicDeviation;
  
  // Population deviation (log scale for population data)
  if (totalPop > 0 && baselines.totalPop.std > 0) {
    const logPop = Math.log(totalPop);
    const logPopBaseline = Math.log(baselines.totalPop.mean || 1);
    const popZScore = Math.abs(logPop - logPopBaseline) / (baselines.totalPop.std / baselines.totalPop.mean);
    const popDeviation = Math.min(popZScore / 2, 1) * 8; // 8 points max
    statisticalDeviation += popDeviation;
  }
  
  // Income deviation
  if (medianIncome > 0 && baselines.medianIncome.std > 0) {
    const incomeZScore = Math.abs(medianIncome - baselines.medianIncome.mean) / baselines.medianIncome.std;
    const incomeDeviation = Math.min(incomeZScore / 3, 1) * 8; // 8 points max
    statisticalDeviation += incomeDeviation;
  }
  
  // Competitive score deviation
  if (competitiveScore > 0 && baselines.competitiveScore.std > 0) {
    const compZScore = Math.abs(competitiveScore - baselines.competitiveScore.mean) / baselines.competitiveScore.std;
    const compDeviation = Math.min(compZScore / 3, 1) * 8; // 8 points max
    statisticalDeviation += compDeviation;
  }
  
  anomalyScore += statisticalDeviation;
  
  // 2. PATTERN ANOMALY COMPONENT (30 points)
  // Unusual relationships between different scores
  let patternAnomaly = 0;
  
  // Strategic vs competitive score relationship anomaly
  if (strategicScore > 0 && competitiveScore > 0) {
    const expectedCompetitive = (strategicScore / 100) * 8; // Expected competitive based on strategic
    const competitiveGap = Math.abs(competitiveScore - expectedCompetitive);
    const competitiveAnom = Math.min(competitiveGap / 5, 1) * 10; // 10 points max
    patternAnomaly += competitiveAnom;
  }
  
  // Nike share vs demographic score relationship anomaly
  if (nikeShare > 0 && demographicScore > 0) {
    // High demographic should correlate with higher Nike share potential
    const expectedNikeFromDemo = (demographicScore / 100) * 40; // Expected Nike share
    const nikeGap = Math.abs(nikeShare - expectedNikeFromDemo);
    const nikeAnom = Math.min(nikeGap / 20, 1) * 10; // 10 points max
    patternAnomaly += nikeAnom;
  }
  
  // Trend vs strategic relationship anomaly
  if (trendScore > 0 && strategicScore > 0) {
    const expectedTrend = (strategicScore / 100) * 60; // Expected trend from strategic
    const trendGap = Math.abs(trendScore - expectedTrend);
    const trendAnom = Math.min(trendGap / 20, 1) * 10; // 10 points max
    patternAnomaly += trendAnom;
  }
  
  anomalyScore += patternAnomaly;
  
  // 3. PERFORMANCE OUTLIER COMPONENT (20 points)
  // Extreme performance compared to market averages
  let performanceOutlier = 0;
  
  // Extreme high or low strategic performance
  if (strategicScore > 0) {
    const strategicPercentile = getPercentile(strategicScore, baselines.strategicScore.sorted);
    if (strategicPercentile <= 0.05 || strategicPercentile >= 0.95) { // Bottom 5% or top 5%
      performanceOutlier += 8; // 8 points for extreme strategic performance
    } else if (strategicPercentile <= 0.10 || strategicPercentile >= 0.90) { // Bottom/top 10%
      performanceOutlier += 5; // 5 points for notable performance
    }
  }
  
  // Extreme Nike market share
  if (nikeShare > 0) {
    const nikePercentile = getPercentile(nikeShare, baselines.nikeShare.sorted);
    if (nikePercentile <= 0.05 || nikePercentile >= 0.95) {
      performanceOutlier += 6; // 6 points for extreme Nike share
    }
  }
  
  // Extreme population size
  if (totalPop > 0) {
    const popPercentile = getPercentile(totalPop, baselines.totalPop.sorted);
    if (popPercentile <= 0.02 || popPercentile >= 0.98) { // Very extreme population
      performanceOutlier += 6; // 6 points for extreme population
    }
  }
  
  anomalyScore += performanceOutlier;
  
  // 4. CONTEXT ANOMALY COMPONENT (10 points)
  // Inconsistent data patterns within geographic/economic context
  let contextAnomaly = 0;
  
  // Income vs population inconsistency (rural vs urban patterns)
  if (medianIncome > 0 && totalPop > 0) {
    const incomePerPop = medianIncome / Math.log(totalPop + 1);
    const incomePopPercentile = getPercentile(incomePerPop, baselines.incomePerPop.sorted);
    if (incomePopPercentile <= 0.10 || incomePopPercentile >= 0.90) {
      contextAnomaly += 5; // Unusual income/population relationship
    }
  }
  
  // All scores being zero (data completeness anomaly)
  const scoreCount = [strategicScore, competitiveScore, demographicScore, trendScore].filter(s => s > 0).length;
  if (scoreCount <= 1 && (nikeShare > 0 || totalPop > 0)) {
    contextAnomaly += 5; // Missing scores but has basic data
  }
  
  anomalyScore += contextAnomaly;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(anomalyScore * 100) / 100));
}

// Helper function to calculate statistical baselines
function calculateStatisticalBaselines(records) {
  const metrics = {
    nikeShare: [],
    strategicScore: [],
    competitiveScore: [],
    demographicScore: [],
    trendScore: [],
    totalPop: [],
    medianIncome: [],
    incomePerPop: []
  };
  
  // Extract all values for statistical analysis
  records.forEach(record => {
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const competitiveScore = Number(record.competitive_advantage_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const totalPop = Number(record.total_population) || 0;
    const medianIncome = Number(record.median_income) || 0;
    
    if (nikeShare > 0) metrics.nikeShare.push(nikeShare);
    if (strategicScore > 0) metrics.strategicScore.push(strategicScore);
    if (competitiveScore > 0) metrics.competitiveScore.push(competitiveScore);
    if (demographicScore > 0) metrics.demographicScore.push(demographicScore);
    if (trendScore > 0) metrics.trendScore.push(trendScore);
    if (totalPop > 0) metrics.totalPop.push(totalPop);
    if (medianIncome > 0) metrics.medianIncome.push(medianIncome);
    
    // Calculate derived metrics
    if (medianIncome > 0 && totalPop > 0) {
      metrics.incomePerPop.push(medianIncome / Math.log(totalPop + 1));
    }
  });
  
  // Calculate mean, std, and sorted arrays for each metric
  const baselines = {};
  
  Object.keys(metrics).forEach(key => {
    const values = metrics[key];
    if (values.length > 0) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      const sorted = [...values].sort((a, b) => a - b);
      
      baselines[key] = { mean, std, sorted };
    } else {
      baselines[key] = { mean: 0, std: 0, sorted: [] };
    }
  });
  
  return baselines;
}

// Helper function to get percentile rank
function getPercentile(value, sortedArray) {
  if (sortedArray.length === 0) return 0.5;
  
  let rank = 0;
  for (let i = 0; i < sortedArray.length; i++) {
    if (sortedArray[i] <= value) rank = i + 1;
    else break;
  }
  
  return rank / sortedArray.length;
}

// Calculate anomaly scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating anomaly detection scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateAnomalyScore(record, statisticalBaselines);
  record.anomaly_detection_score = score;
  
  // Track statistics
  scoreStats.min = Math.min(scoreStats.min, score);
  scoreStats.max = Math.max(scoreStats.max, score);
  scoreStats.sum += score;
  scoreStats.scores.push(score);
  
  processedCount++;
  
  if (processedCount % 500 === 0) {
    console.log(`   Processed ${processedCount}/${correlationData.results.length} records...`);
  }
});

// Calculate final statistics
const avgScore = scoreStats.sum / processedCount;
scoreStats.scores.sort((a, b) => a - b);
const medianScore = scoreStats.scores[Math.floor(scoreStats.scores.length / 2)];

console.log('🔍 Anomaly Detection Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Extreme Anomalies (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'High Anomalies (60-79)': scoreStats.scores.filter(s => s >= 60 && s < 80).length,
  'Moderate Anomalies (40-59)': scoreStats.scores.filter(s => s >= 40 && s < 60).length,
  'Low Anomalies (20-39)': scoreStats.scores.filter(s => s >= 20 && s < 40).length,
  'Normal Patterns (0-19)': scoreStats.scores.filter(s => s < 20).length
};

console.log('📊 Anomaly Detection Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 most anomalous areas
const topAnomalies = correlationData.results
  .sort((a, b) => b.anomaly_detection_score - a.anomaly_detection_score)
  .slice(0, 15);

console.log('🚨 Top 15 Most Anomalous Areas:');
topAnomalies.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const competitive = Number(record.competitive_advantage_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const trend = Number(record.trend_strength_score) || 0;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.anomaly_detection_score.toFixed(1)} anomaly score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Comp: ${competitive.toFixed(1)}, Demo: ${demographic.toFixed(1)}, Trend: ${trend.toFixed(1)}`);
});

// Add anomaly detection metadata
correlationData.anomaly_detection_metadata = {
  scoring_methodology: {
    statistical_deviation: '40% - Statistical deviation from population norms (Z-scores)',
    pattern_anomaly: '30% - Unusual relationships between different metrics',
    performance_outlier: '20% - Extreme performance vs market averages (percentiles)', 
    context_anomaly: '10% - Inconsistent data patterns within geographic/economic context'
  },
  statistical_baselines: {
    nike_share: { mean: statisticalBaselines.nikeShare.mean.toFixed(2), std: statisticalBaselines.nikeShare.std.toFixed(2) },
    strategic_score: { mean: statisticalBaselines.strategicScore.mean.toFixed(2), std: statisticalBaselines.strategicScore.std.toFixed(2) },
    competitive_score: { mean: statisticalBaselines.competitiveScore.mean.toFixed(2), std: statisticalBaselines.competitiveScore.std.toFixed(2) }
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_anomalous_markets: topAnomalies.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    anomaly_score: record.anomaly_detection_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    strategic_score: record.strategic_value_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Anomaly detection scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🔍 All ${processedCount.toLocaleString()} records now include anomaly_detection_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created anomaly_detection_score for all records');
console.log('   2. ✅ Added anomaly detection metadata with statistical baselines');
console.log('   3. 🔄 Create AnomalyDetectionProcessor');
console.log('   4. 🔄 Test anomaly detection endpoint');