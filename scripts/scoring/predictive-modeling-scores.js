/**
 * Predictive Modeling Scoring Script
 * 
 * Creates predictive modeling scores for the predictive modeling endpoint by analyzing
 * prediction confidence, forecast accuracy potential, and model reliability indicators
 * to identify markets with the most predictable growth and performance patterns.
 * 
 * Formula: Model Confidence (40%) + Pattern Stability (30%) + Forecast Reliability (20%) + Data Quality (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🔮 Starting Predictive Modeling Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for predictive modeling scoring...`);

// First pass: Calculate predictive baselines for model reliability assessment
const predictiveBaselines = calculatePredictiveBaselines(correlationData.results);

// Predictive modeling scoring formula considers:
// 1. Model Confidence (40%) - How confident predictions can be based on data patterns
// 2. Pattern Stability (30%) - Consistency and stability of historical patterns
// 3. Forecast Reliability (20%) - Reliability of future projections based on trends
// 4. Data Quality (10%) - Completeness and consistency of data for modeling

function calculatePredictiveScore(record, baselines) {
  // Extract relevant metrics for predictive modeling
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let predictiveScore = 0;
  
  // 1. MODEL CONFIDENCE COMPONENT (40 points)
  // How confident predictions can be based on data patterns and relationships
  let modelConfidence = 0;
  
  // Correlation strength as prediction confidence indicator
  if (correlationScore > 0) {
    const confidenceFromCorrelation = (correlationScore / 100) * 15; // 15 points max
    modelConfidence += confidenceFromCorrelation;
  } else {
    // Fallback correlation confidence from strategic-demographic relationship
    if (strategicScore > 0 && demographicScore > 0) {
      const impliedCorrelation = 1 - (Math.abs(strategicScore - demographicScore) / Math.max(strategicScore, demographicScore));
      modelConfidence += impliedCorrelation * 10; // 10 points max
    }
  }
  
  // Multi-variable model confidence (more variables = higher confidence)
  const activeVariables = [nikeShare, strategicScore, competitiveScore, demographicScore, trendScore]
    .filter(v => v > 0).length;
  const variableConfidence = (activeVariables / 5) * 12; // 12 points max for all variables
  modelConfidence += variableConfidence;
  
  // Strategic-market alignment confidence
  if (strategicScore > 0 && totalPop > 0) {
    const marketSizeAlignment = Math.min(Math.log(totalPop) / 12, 1); // Population size factor
    const strategicAlignment = strategicScore / 100;
    const alignmentConfidence = (marketSizeAlignment * strategicAlignment) * 8; // 8 points max
    modelConfidence += alignmentConfidence;
  }
  
  // Income-demographic model confidence
  if (medianIncome > 0 && demographicScore > 0) {
    const incomeConsistency = Math.min(medianIncome / 80000, 1.5); // Income factor
    const demoConsistency = demographicScore / 100;
    const consistencyConfidence = Math.min((incomeConsistency * demoConsistency), 1) * 5; // 5 points max
    modelConfidence += consistencyConfidence;
  }
  
  predictiveScore += modelConfidence;
  
  // 2. PATTERN STABILITY COMPONENT (30 points)
  // Consistency and stability of historical patterns for reliable predictions
  let patternStability = 0;
  
  // Trend stability as pattern indicator
  if (trendScore > 0) {
    const stabilityFromTrend = (trendScore / 100) * 12; // 12 points max
    patternStability += stabilityFromTrend;
  }
  
  // Score consistency stability (less variance = more stable patterns)
  const scores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
  if (scores.length >= 3) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;
    
    // Lower CV = higher stability
    const stabilityFromConsistency = Math.max(0, 1 - coefficientOfVariation) * 10; // 10 points max
    patternStability += stabilityFromConsistency;
  }
  
  // Nike share stability (consistent market presence indicates stable patterns)
  if (nikeShare > 0) {
    const shareStability = Math.min(nikeShare / 30, 1); // Normalize to 30% baseline
    if (shareStability >= 0.5 && shareStability <= 1.2) { // Stable range
      patternStability += 8; // 8 points for stable Nike presence
    } else {
      patternStability += 4; // 4 points for some presence
    }
  }
  
  predictiveScore += patternStability;
  
  // 3. FORECAST RELIABILITY COMPONENT (20 points)
  // Reliability of future projections based on trends and growth indicators
  let forecastReliability = 0;
  
  // Strategic trend reliability
  if (strategicScore > 0) {
    const strategicReliability = strategicScore / 100;
    if (strategicScore >= 60) {
      forecastReliability += 8; // High reliability for strong strategic position
    } else if (strategicScore >= 45) {
      forecastReliability += 6; // Moderate reliability
    } else {
      forecastReliability += 3; // Some reliability
    }
  }
  
  // Demographic forecast reliability
  if (demographicScore > 0) {
    if (demographicScore >= 80) {
      forecastReliability += 6; // High demographic reliability
    } else if (demographicScore >= 60) {
      forecastReliability += 4; // Moderate demographic reliability
    } else {
      forecastReliability += 2; // Some demographic reliability
    }
  }
  
  // Market size forecast reliability (larger markets = more predictable)
  if (totalPop > 0) {
    if (totalPop >= 50000) {
      forecastReliability += 4; // Large market reliability
    } else if (totalPop >= 20000) {
      forecastReliability += 3; // Medium market reliability
    } else if (totalPop >= 5000) {
      forecastReliability += 2; // Small market reliability
    }
  }
  
  // Competitive forecast reliability
  if (competitiveScore > 0) {
    const competitiveReliability = Math.min(competitiveScore / 10, 1) * 2; // 2 points max
    forecastReliability += competitiveReliability;
  }
  
  predictiveScore += forecastReliability;
  
  // 4. DATA QUALITY COMPONENT (10 points)
  // Completeness and consistency of data for reliable modeling
  let dataQuality = 0;
  
  // Data completeness score
  const totalFields = 8; // Total possible fields
  const availableFields = [nikeShare, strategicScore, competitiveScore, demographicScore, 
                          trendScore, correlationScore, totalPop, medianIncome]
    .filter(v => v > 0).length;
  
  const completenessScore = (availableFields / totalFields) * 6; // 6 points max
  dataQuality += completenessScore;
  
  // Data consistency quality
  if (strategicScore > 0 && demographicScore > 0) {
    const consistency = 1 - (Math.abs(strategicScore - demographicScore) / 100);
    if (consistency >= 0.7) {
      dataQuality += 2; // High consistency
    } else if (consistency >= 0.5) {
      dataQuality += 1; // Moderate consistency
    }
  }
  
  // Income-population data consistency
  if (medianIncome > 0 && totalPop > 0) {
    // Check for reasonable income-population relationships
    const incomePerCapitaRatio = medianIncome / Math.log(totalPop + 1);
    if (incomePerCapitaRatio >= 3000 && incomePerCapitaRatio <= 15000) {
      dataQuality += 2; // Consistent income-population relationship
    } else {
      dataQuality += 1; // Some consistency
    }
  }
  
  predictiveScore += dataQuality;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(predictiveScore * 100) / 100));
}

// Helper function to calculate predictive baselines
function calculatePredictiveBaselines(records) {
  const metrics = {
    correlationScores: [],
    trendScores: [],
    strategicScores: [],
    dataCompleteness: []
  };
  
  // Extract values for baseline calculation
  records.forEach(record => {
    const correlationScore = Number(record.correlation_strength_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    
    if (correlationScore > 0) metrics.correlationScores.push(correlationScore);
    if (trendScore > 0) metrics.trendScores.push(trendScore);
    if (strategicScore > 0) metrics.strategicScores.push(strategicScore);
    
    // Calculate data completeness for each record
    const totalFields = 8;
    const availableFields = [
      Number(record.mp30034a_b_p) || 0,
      Number(record.strategic_value_score) || 0,
      Number(record.competitive_advantage_score) || 0,
      Number(record.demographic_opportunity_score) || 0,
      Number(record.trend_strength_score) || 0,
      Number(record.correlation_strength_score) || 0,
      Number(record.total_population) || 0,
      Number(record.median_income) || 0
    ].filter(v => v > 0).length;
    
    metrics.dataCompleteness.push(availableFields / totalFields);
  });
  
  // Calculate baseline statistics
  const baselines = {};
  
  Object.keys(metrics).forEach(key => {
    const values = metrics[key];
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const median = sorted[Math.floor(sorted.length / 2)];
      
      baselines[key] = { avg, median, count: values.length };
    } else {
      baselines[key] = { avg: 0, median: 0, count: 0 };
    }
  });
  
  return baselines;
}

// Calculate predictive modeling scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating predictive modeling scores...');

correlationData.results.forEach((record, index) => {
  const score = calculatePredictiveScore(record, predictiveBaselines);
  record.predictive_modeling_score = score;
  
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

console.log('🔮 Predictive Modeling Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Excellent Predictability (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Good Predictive Potential (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Moderate Predictability (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Limited Predictive Value (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Poor Predictive Reliability (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Predictive Modeling Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 most predictable areas
const topPredictive = correlationData.results
  .sort((a, b) => b.predictive_modeling_score - a.predictive_modeling_score)
  .slice(0, 15);

console.log('🔮 Top 15 Most Predictable Areas:');
topPredictive.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const trend = Number(record.trend_strength_score) || 0;
  const correlation = Number(record.correlation_strength_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  
  // Count available data fields
  const dataFields = [nikeShare, strategic, trend, correlation, demographic].filter(v => v > 0).length;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.predictive_modeling_score.toFixed(1)} predictive score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Trend: ${trend.toFixed(1)}, Corr: ${correlation.toFixed(1)}, Fields: ${dataFields}/5`);
});

// Add predictive modeling metadata
correlationData.predictive_modeling_metadata = {
  scoring_methodology: {
    model_confidence: '40% - Prediction confidence based on data patterns and relationships',
    pattern_stability: '30% - Consistency and stability of historical patterns',
    forecast_reliability: '20% - Reliability of future projections based on trends',
    data_quality: '10% - Completeness and consistency of data for modeling'
  },
  predictive_baselines: {
    avg_correlation_score: predictiveBaselines.correlationScores.avg.toFixed(2),
    avg_trend_score: predictiveBaselines.trendScores.avg.toFixed(2),
    avg_strategic_score: predictiveBaselines.strategicScores.avg.toFixed(2),
    avg_data_completeness: (predictiveBaselines.dataCompleteness.avg * 100).toFixed(1) + '%'
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_predictive_markets: topPredictive.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    predictive_score: record.predictive_modeling_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    strategic_score: record.strategic_value_score || 0,
    trend_score: record.trend_strength_score || 0,
    correlation_score: record.correlation_strength_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Predictive modeling scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🔮 All ${processedCount.toLocaleString()} records now include predictive_modeling_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created predictive_modeling_score for all records');
console.log('   2. ✅ Added predictive modeling metadata with reliability baselines');
console.log('   3. 🔄 Create PredictiveModelingProcessor');
console.log('   4. 🔄 Test predictive modeling endpoint');