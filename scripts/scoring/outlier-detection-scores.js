/**
 * Outlier Detection Scoring Script
 * 
 * Creates outlier detection scores for the outlier detection endpoint by identifying
 * geographic areas with exceptional performance or characteristics that stand out
 * significantly from typical market patterns.
 * 
 * Formula: Statistical Outlier (40%) + Performance Extremes (30%) + Contextual Uniqueness (20%) + Rarity Score (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Outlier Detection Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for outlier detection scoring...`);

// First pass: Calculate statistical baselines for outlier detection
const outlierBaselines = calculateOutlierBaselines(correlationData.results);

// Outlier detection scoring formula considers:
// 1. Statistical Outlier (40%) - How far values deviate from statistical norms (Z-scores, percentiles)
// 2. Performance Extremes (30%) - Exceptional high or low performance vs market norms
// 3. Contextual Uniqueness (20%) - Unique characteristics within geographic/economic context  
// 4. Rarity Score (10%) - How rare/uncommon the combination of characteristics is

function calculateOutlierScore(record, baselines) {
  // Extract relevant metrics for outlier detection
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let outlierScore = 0;
  
  // 1. STATISTICAL OUTLIER COMPONENT (40 points)
  // How far values deviate from statistical norms using Z-scores and percentiles
  let statisticalOutlier = 0;
  
  // Nike share statistical outlier
  if (nikeShare > 0 && baselines.nikeShare.std > 0) {
    const nikeZScore = Math.abs(nikeShare - baselines.nikeShare.mean) / baselines.nikeShare.std;
    const nikeOutlier = Math.min(nikeZScore / 2.5, 1) * 10; // 10 points max (2.5 sigma = extreme)
    statisticalOutlier += nikeOutlier;
  }
  
  // Strategic score statistical outlier
  if (strategicScore > 0 && baselines.strategicScore.std > 0) {
    const strategicZScore = Math.abs(strategicScore - baselines.strategicScore.mean) / baselines.strategicScore.std;
    const strategicOutlier = Math.min(strategicZScore / 2.5, 1) * 10; // 10 points max
    statisticalOutlier += strategicOutlier;
  }
  
  // Population statistical outlier (log scale)
  if (totalPop > 0 && baselines.totalPop.std > 0) {
    const logPop = Math.log(totalPop + 1);
    const logPopMean = Math.log(baselines.totalPop.mean + 1);
    const logPopStd = baselines.totalPop.std / baselines.totalPop.mean; // Coefficient of variation
    const popZScore = Math.abs(logPop - logPopMean) / logPopStd;
    const popOutlier = Math.min(popZScore / 2, 1) * 8; // 8 points max
    statisticalOutlier += popOutlier;
  }
  
  // Income statistical outlier
  if (medianIncome > 0 && baselines.medianIncome.std > 0) {
    const incomeZScore = Math.abs(medianIncome - baselines.medianIncome.mean) / baselines.medianIncome.std;
    const incomeOutlier = Math.min(incomeZScore / 2.5, 1) * 8; // 8 points max
    statisticalOutlier += incomeOutlier;
  }
  
  // Demographic score statistical outlier
  if (demographicScore > 0 && baselines.demographicScore.std > 0) {
    const demoZScore = Math.abs(demographicScore - baselines.demographicScore.mean) / baselines.demographicScore.std;
    const demoOutlier = Math.min(demoZScore / 2.5, 1) * 4; // 4 points max
    statisticalOutlier += demoOutlier;
  }
  
  outlierScore += statisticalOutlier;
  
  // 2. PERFORMANCE EXTREMES COMPONENT (30 points)
  // Exceptional high or low performance vs market norms
  let performanceExtremes = 0;
  
  // Strategic performance extremes (very high or very low)
  if (strategicScore > 0) {
    const strategicPercentile = getPercentile(strategicScore, baselines.strategicScore.sorted);
    if (strategicPercentile >= 0.95 || strategicPercentile <= 0.05) { // Top/bottom 5%
      performanceExtremes += 12; // 12 points for extreme strategic performance
    } else if (strategicPercentile >= 0.90 || strategicPercentile <= 0.10) { // Top/bottom 10%
      performanceExtremes += 8; // 8 points for notable performance
    }
  }
  
  // Nike market share extremes
  if (nikeShare > 0) {
    const nikePercentile = getPercentile(nikeShare, baselines.nikeShare.sorted);
    if (nikePercentile >= 0.98 || nikePercentile <= 0.02) { // Top/bottom 2%
      performanceExtremes += 10; // 10 points for extreme Nike share
    } else if (nikePercentile >= 0.95 || nikePercentile <= 0.05) { // Top/bottom 5%
      performanceExtremes += 6; // 6 points for notable Nike share
    }
  }
  
  // Population size extremes
  if (totalPop > 0) {
    const popPercentile = getPercentile(totalPop, baselines.totalPop.sorted);
    if (popPercentile >= 0.99 || popPercentile <= 0.01) { // Top/bottom 1%
      performanceExtremes += 8; // 8 points for extreme population
    } else if (popPercentile >= 0.95 || popPercentile <= 0.05) { // Top/bottom 5%
      performanceExtremes += 4; // 4 points for notable population
    }
  }
  
  outlierScore += performanceExtremes;
  
  // 3. CONTEXTUAL UNIQUENESS COMPONENT (20 points)
  // Unique characteristics within geographic/economic context
  let contextualUniqueness = 0;
  
  // Income vs population context uniqueness
  if (medianIncome > 0 && totalPop > 0) {
    const incomePerCapita = medianIncome / Math.log(totalPop + 1);
    const incomeCapitaPercentile = getPercentile(incomePerCapita, baselines.incomePerCapita.sorted);
    if (incomeCapitaPercentile >= 0.95 || incomeCapitaPercentile <= 0.05) {
      contextualUniqueness += 8; // Unusual income/population relationship
    }
  }
  
  // Strategic vs Nike share context uniqueness
  if (strategicScore > 0 && nikeShare > 0) {
    const strategicNikeRatio = strategicScore / (nikeShare + 1); // Avoid division by zero
    const ratioPercentile = getPercentile(strategicNikeRatio, baselines.strategicNikeRatio.sorted);
    if (ratioPercentile >= 0.95 || ratioPercentile <= 0.05) {
      contextualUniqueness += 6; // Unusual strategic vs Nike relationship
    }
  }
  
  // Competitive score context (missing vs present is contextually unique)
  if (strategicScore > 60 && competitiveScore === 0) {
    contextualUniqueness += 4; // High strategic but no competitive data
  } else if (competitiveScore > 0 && strategicScore === 0) {
    contextualUniqueness += 4; // Has competitive but no strategic data
  }
  
  // Multi-score context uniqueness
  const nonZeroScores = [strategicScore, competitiveScore, demographicScore, trendScore, correlationScore]
    .filter(s => s > 0).length;
  if (nonZeroScores >= 5) {
    contextualUniqueness += 2; // Full data availability is contextually unique
  } else if (nonZeroScores <= 1 && (nikeShare > 0 || totalPop > 0)) {
    contextualUniqueness += 2; // Minimal scores but has basic data
  }
  
  outlierScore += contextualUniqueness;
  
  // 4. RARITY SCORE COMPONENT (10 points)
  // How rare/uncommon the combination of characteristics is
  let rarityScore = 0;
  
  // Extreme combinations
  if (strategicScore >= 65 && demographicScore >= 90 && nikeShare >= 25) {
    rarityScore += 5; // Rare triple-high combination
  } else if (strategicScore <= 35 && demographicScore <= 40 && nikeShare <= 15) {
    rarityScore += 5; // Rare triple-low combination
  }
  
  // Contradictory patterns (rare inversions)
  if (demographicScore >= 85 && nikeShare <= 15) {
    rarityScore += 3; // High opportunity but low presence (rare pattern)
  } else if (strategicScore >= 65 && trendScore <= 35) {
    rarityScore += 3; // High strategic but weak trend (rare pattern)
  }
  
  // Population income rarity
  if (totalPop >= 100000 && medianIncome <= 40000) {
    rarityScore += 2; // Large population but low income (rare)
  } else if (totalPop <= 5000 && medianIncome >= 120000) {
    rarityScore += 2; // Small population but high income (rare)
  }
  
  outlierScore += rarityScore;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(outlierScore * 100) / 100));
}

// Helper function to calculate outlier baselines
function calculateOutlierBaselines(records) {
  const metrics = {
    nikeShare: [],
    strategicScore: [],
    competitiveScore: [],
    demographicScore: [],
    trendScore: [],
    correlationScore: [],
    totalPop: [],
    medianIncome: [],
    incomePerCapita: [],
    strategicNikeRatio: []
  };
  
  // Extract all values for statistical analysis
  records.forEach(record => {
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const competitiveScore = Number(record.competitive_advantage_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const correlationScore = Number(record.correlation_strength_score) || 0;
    const totalPop = Number(record.total_population) || 0;
    const medianIncome = Number(record.median_income) || 0;
    
    if (nikeShare > 0) metrics.nikeShare.push(nikeShare);
    if (strategicScore > 0) metrics.strategicScore.push(strategicScore);
    if (competitiveScore > 0) metrics.competitiveScore.push(competitiveScore);
    if (demographicScore > 0) metrics.demographicScore.push(demographicScore);
    if (trendScore > 0) metrics.trendScore.push(trendScore);
    if (correlationScore > 0) metrics.correlationScore.push(correlationScore);
    if (totalPop > 0) metrics.totalPop.push(totalPop);
    if (medianIncome > 0) metrics.medianIncome.push(medianIncome);
    
    // Calculate derived metrics
    if (medianIncome > 0 && totalPop > 0) {
      metrics.incomePerCapita.push(medianIncome / Math.log(totalPop + 1));
    }
    
    if (strategicScore > 0 && nikeShare > 0) {
      metrics.strategicNikeRatio.push(strategicScore / (nikeShare + 1));
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

// Calculate outlier detection scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating outlier detection scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateOutlierScore(record, outlierBaselines);
  record.outlier_detection_score = score;
  
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

console.log('🎯 Outlier Detection Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Extreme Outliers (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Strong Outliers (60-79)': scoreStats.scores.filter(s => s >= 60 && s < 80).length,
  'Moderate Outliers (40-59)': scoreStats.scores.filter(s => s >= 40 && s < 60).length,
  'Mild Outliers (20-39)': scoreStats.scores.filter(s => s >= 20 && s < 40).length,
  'Normal Range (0-19)': scoreStats.scores.filter(s => s < 20).length
};

console.log('📊 Outlier Detection Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 most outlier areas
const topOutliers = correlationData.results
  .sort((a, b) => b.outlier_detection_score - a.outlier_detection_score)
  .slice(0, 15);

console.log('🎯 Top 15 Most Outlier Areas:');
topOutliers.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const competitive = Number(record.competitive_advantage_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.outlier_detection_score.toFixed(1)} outlier score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Demo: ${demographic.toFixed(1)}, Pop: ${(totalPop/1000).toFixed(0)}K, Inc: $${(medianIncome/1000).toFixed(0)}K`);
});

// Add outlier detection metadata
correlationData.outlier_detection_metadata = {
  scoring_methodology: {
    statistical_outlier: '40% - Statistical deviation from norms (Z-scores, percentiles)',
    performance_extremes: '30% - Exceptional high or low performance vs market norms',
    contextual_uniqueness: '20% - Unique characteristics within geographic/economic context',
    rarity_score: '10% - How rare/uncommon the combination of characteristics is'
  },
  statistical_baselines: {
    nike_share: { 
      mean: outlierBaselines.nikeShare.mean.toFixed(2), 
      std: outlierBaselines.nikeShare.std.toFixed(2),
      count: outlierBaselines.nikeShare.sorted.length
    },
    strategic_score: { 
      mean: outlierBaselines.strategicScore.mean.toFixed(2), 
      std: outlierBaselines.strategicScore.std.toFixed(2),
      count: outlierBaselines.strategicScore.sorted.length
    },
    total_population: {
      mean: outlierBaselines.totalPop.mean.toFixed(0),
      std: outlierBaselines.totalPop.std.toFixed(0),
      count: outlierBaselines.totalPop.sorted.length
    }
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_outlier_markets: topOutliers.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    outlier_score: record.outlier_detection_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    strategic_score: record.strategic_value_score || 0,
    total_population: record.total_population || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Outlier detection scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include outlier_detection_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created outlier_detection_score for all records');
console.log('   2. ✅ Added outlier detection metadata with statistical baselines');
console.log('   3. 🔄 Create OutlierDetectionProcessor');
console.log('   4. 🔄 Test outlier detection endpoint');