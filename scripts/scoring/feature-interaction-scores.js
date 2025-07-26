/**
 * Feature Interaction Scoring Script
 * 
 * Creates feature interaction scores for the feature interactions endpoint by analyzing
 * complex relationships and synergistic effects between multiple variables.
 * 
 * Formula: Correlation Strength (35%) + Synergy Effect (30%) + Interaction Complexity (25%) + Non-Linear Patterns (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🔗 Starting Feature Interaction Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for feature interaction scoring...`);

// First pass: Calculate interaction baselines and correlation matrices
const interactionBaselines = calculateInteractionBaselines(correlationData.results);

// Feature interaction scoring formula considers:
// 1. Correlation Strength (35%) - How strongly variables correlate with each other
// 2. Synergy Effect (30%) - Combined effect stronger than individual effects
// 3. Interaction Complexity (25%) - Multiple variables interacting simultaneously  
// 4. Non-Linear Patterns (10%) - Non-linear relationships and threshold effects

function calculateFeatureInteractionScore(record, baselines) {
  // Extract relevant metrics for interaction analysis
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let interactionScore = 0;
  
  // 1. CORRELATION STRENGTH COMPONENT (35 points)
  // How strongly different variables correlate with each other
  let correlationStrength = 0;
  
  // Use pre-calculated correlation score if available
  if (correlationScore > 0) {
    correlationStrength += (correlationScore / 100) * 15; // 15 points max
  }
  
  // Strategic-Demographic correlation
  if (strategicScore > 0 && demographicScore > 0) {
    const expectedCorr = Math.abs(strategicScore - demographicScore) / Math.max(strategicScore, demographicScore);
    const corrStrength = Math.max(0, 1 - expectedCorr) * 8; // 8 points max for high correlation
    correlationStrength += corrStrength;
  }
  
  // Nike-Strategic correlation
  if (nikeShare > 0 && strategicScore > 0) {
    const normalizedNike = nikeShare / 50; // Normalize to 0-2 scale
    const normalizedStrategic = strategicScore / 100;
    const corrStrength = Math.min(Math.abs(normalizedNike - normalizedStrategic), 1) * 6; // 6 points max
    correlationStrength += corrStrength;
  }
  
  // Income-Population interaction
  if (medianIncome > 0 && totalPop > 0) {
    const incomePopRatio = medianIncome / Math.log(totalPop + 1);
    const normalizedRatio = Math.min(incomePopRatio / 10000, 1); // Normalize ratio
    correlationStrength += normalizedRatio * 6; // 6 points max
  }
  
  interactionScore += correlationStrength;
  
  // 2. SYNERGY EFFECT COMPONENT (30 points)
  // Combined effect stronger than individual effects
  let synergyEffect = 0;
  
  // High strategic + high demographic synergy
  if (strategicScore > 50 && demographicScore > 70) {
    const synergy = Math.min((strategicScore * demographicScore) / (100 * 100), 1) * 12; // 12 points max
    synergyEffect += synergy;
  }
  
  // Nike share + trend strength synergy
  if (nikeShare > 20 && trendScore > 45) {
    const trendNikeSynergy = Math.min((nikeShare * trendScore) / (50 * 100), 1) * 10; // 10 points max
    synergyEffect += trendNikeSynergy;
  }
  
  // Triple synergy: strategic + competitive + demographic
  if (strategicScore > 40 && competitiveScore > 0 && demographicScore > 60) {
    const tripleScore = (strategicScore + competitiveScore*10 + demographicScore) / 3;
    const tripleSynergy = Math.min(tripleScore / 80, 1) * 8; // 8 points max
    synergyEffect += tripleSynergy;
  }
  
  interactionScore += synergyEffect;
  
  // 3. INTERACTION COMPLEXITY COMPONENT (25 points)
  // Multiple variables interacting simultaneously
  let interactionComplexity = 0;
  
  // Count how many variables are actively interacting (non-zero)
  const activeVariables = [nikeShare, strategicScore, competitiveScore, demographicScore, trendScore]
    .filter(v => v > 0).length;
  
  // Base complexity from number of active variables
  const baseComplexity = Math.min(activeVariables / 5, 1) * 10; // 10 points max
  interactionComplexity += baseComplexity;
  
  // Score variance complexity (diverse scores indicate complex interactions)
  const scores = [strategicScore, demographicScore, trendScore].filter(s => s > 0);
  if (scores.length >= 2) {
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const complexityFromVariance = Math.min(variance / 500, 1) * 8; // 8 points max
    interactionComplexity += complexityFromVariance;
  }
  
  // Population-income complexity
  if (totalPop > 0 && medianIncome > 0) {
    const popIncomeComplexity = Math.min(Math.log(totalPop) * medianIncome / 1000000, 1) * 7; // 7 points max
    interactionComplexity += popIncomeComplexity;
  }
  
  interactionScore += interactionComplexity;
  
  // 4. NON-LINEAR PATTERNS COMPONENT (10 points)
  // Non-linear relationships and threshold effects
  let nonLinearPatterns = 0;
  
  // Threshold effects in Nike share
  if (nikeShare > 0) {
    // Look for threshold patterns (rapid changes at certain points)
    if (nikeShare >= 30 && strategicScore >= 60) {
      nonLinearPatterns += 4; // High-performance threshold effect
    } else if (nikeShare <= 15 && demographicScore >= 80) {
      nonLinearPatterns += 4; // Untapped potential threshold
    }
  }
  
  // Exponential-like patterns in population effects
  if (totalPop > 50000 && strategicScore > 55) {
    const exponentialEffect = Math.min(Math.log(totalPop / 50000) * strategicScore / 100, 1) * 3; // 3 points max
    nonLinearPatterns += exponentialEffect;
  }
  
  // Sigmoid-like patterns in score relationships
  if (strategicScore > 0 && demographicScore > 0) {
    const scoreDiff = Math.abs(strategicScore - demographicScore);
    if (scoreDiff >= 30) { // Large difference suggests non-linear relationship
      nonLinearPatterns += 3; // 3 points for non-linear pattern
    }
  }
  
  interactionScore += nonLinearPatterns;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(interactionScore * 100) / 100));
}

// Helper function to calculate interaction baselines
function calculateInteractionBaselines(records) {
  const correlations = {
    strategicDemographic: [],
    nikeStrategic: [],
    trendStrategic: [],
    incomePopulation: []
  };
  
  // Calculate correlation patterns for baseline
  records.forEach(record => {
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const totalPop = Number(record.total_population) || 0;
    const medianIncome = Number(record.median_income) || 0;
    
    // Strategic-Demographic correlation
    if (strategicScore > 0 && demographicScore > 0) {
      correlations.strategicDemographic.push({
        strategic: strategicScore,
        demographic: demographicScore,
        correlation: Math.abs(strategicScore - demographicScore) / Math.max(strategicScore, demographicScore)
      });
    }
    
    // Nike-Strategic correlation
    if (nikeShare > 0 && strategicScore > 0) {
      correlations.nikeStrategic.push({
        nike: nikeShare,
        strategic: strategicScore,
        correlation: Math.abs((nikeShare/50) - (strategicScore/100))
      });
    }
    
    // Income-Population patterns
    if (medianIncome > 0 && totalPop > 0) {
      correlations.incomePopulation.push({
        income: medianIncome,
        population: totalPop,
        ratio: medianIncome / Math.log(totalPop + 1)
      });
    }
  });
  
  // Calculate baseline statistics
  const baselines = {};
  
  Object.keys(correlations).forEach(key => {
    const values = correlations[key];
    if (values.length > 0) {
      const correlationValues = values.map(v => v.correlation || v.ratio || 0);
      const mean = correlationValues.reduce((a, b) => a + b, 0) / correlationValues.length;
      const variance = correlationValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / correlationValues.length;
      const std = Math.sqrt(variance);
      
      baselines[key] = { mean, std, count: values.length };
    } else {
      baselines[key] = { mean: 0, std: 0, count: 0 };
    }
  });
  
  return baselines;
}

// Calculate feature interaction scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating feature interaction scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateFeatureInteractionScore(record, interactionBaselines);
  record.feature_interaction_score = score;
  
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

console.log('🔗 Feature Interaction Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Very High Interactions (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'High Interactions (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Moderate Interactions (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Low Interactions (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Minimal Interactions (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Feature Interaction Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 highest interaction areas
const topInteractions = correlationData.results
  .sort((a, b) => b.feature_interaction_score - a.feature_interaction_score)
  .slice(0, 15);

console.log('🔗 Top 15 Highest Feature Interaction Areas:');
topInteractions.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const competitive = Number(record.competitive_advantage_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const trend = Number(record.trend_strength_score) || 0;
  const correlation = Number(record.correlation_strength_score) || 0;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.feature_interaction_score.toFixed(1)} interaction score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Demo: ${demographic.toFixed(1)}, Trend: ${trend.toFixed(1)}, Corr: ${correlation.toFixed(1)}`);
});

// Add feature interaction metadata  
correlationData.feature_interaction_metadata = {
  scoring_methodology: {
    correlation_strength: '35% - How strongly variables correlate with each other',
    synergy_effect: '30% - Combined effect stronger than individual effects',
    interaction_complexity: '25% - Multiple variables interacting simultaneously',
    non_linear_patterns: '10% - Non-linear relationships and threshold effects'
  },
  interaction_baselines: {
    strategic_demographic_correlations: interactionBaselines.strategicDemographic?.count || 0,
    nike_strategic_correlations: interactionBaselines.nikeStrategic?.count || 0,
    income_population_patterns: interactionBaselines.incomePopulation?.count || 0
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_interaction_markets: topInteractions.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    interaction_score: record.feature_interaction_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    strategic_score: record.strategic_value_score || 0,
    demographic_score: record.demographic_opportunity_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Feature interaction scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🔗 All ${processedCount.toLocaleString()} records now include feature_interaction_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created feature_interaction_score for all records');
console.log('   2. ✅ Added feature interaction metadata with correlation baselines');
console.log('   3. 🔄 Create FeatureInteractionProcessor');
console.log('   4. 🔄 Test feature interactions endpoint');