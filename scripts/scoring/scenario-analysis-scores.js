/**
 * Scenario Analysis Scoring Script
 * 
 * Creates scenario analysis scores for the scenario analysis endpoint by analyzing
 * market adaptability, scenario resilience, strategic flexibility, and planning
 * readiness to identify markets best suited for different strategic scenarios.
 * 
 * Formula: Scenario Adaptability (35%) + Market Resilience (30%) + Strategic Flexibility (25%) + Planning Readiness (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎭 Starting Scenario Analysis Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for scenario analysis scoring...`);

// First pass: Calculate scenario baselines for adaptability assessment
const scenarioBaselines = calculateScenarioBaselines(correlationData.results);

// Scenario analysis scoring formula considers:
// 1. Scenario Adaptability (35%) - How well markets can adapt to different strategic scenarios
// 2. Market Resilience (30%) - Resilience and stability across various market conditions
// 3. Strategic Flexibility (25%) - Flexibility to pivot strategies based on scenarios
// 4. Planning Readiness (10%) - Data quality and reliability for scenario planning

function calculateScenarioScore(record, baselines) {
  // Extract relevant metrics for scenario analysis
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let scenarioScore = 0;
  
  // 1. SCENARIO ADAPTABILITY COMPONENT (35 points)
  // How well markets can adapt to different strategic scenarios
  let scenarioAdaptability = 0;
  
  // Strategic adaptability from strategic score
  if (strategicScore > 0) {
    const strategicAdaptability = (strategicScore / 100) * 12; // 12 points max
    scenarioAdaptability += strategicAdaptability;
  }
  
  // Demographic adaptability (diverse demographics = more scenario options)
  if (demographicScore > 0) {
    const demographicAdaptability = (demographicScore / 100) * 10; // 10 points max
    scenarioAdaptability += demographicAdaptability;
  }
  
  // Market size adaptability (larger markets can support more scenarios)
  if (totalPop > 0) {
    let sizeAdaptability = 0;
    if (totalPop >= 100000) sizeAdaptability = 8; // Large market flexibility
    else if (totalPop >= 50000) sizeAdaptability = 6; // Medium market flexibility
    else if (totalPop >= 25000) sizeAdaptability = 4; // Small-medium flexibility
    else if (totalPop >= 10000) sizeAdaptability = 3; // Limited flexibility
    else sizeAdaptability = 2; // Minimal flexibility
    
    scenarioAdaptability += sizeAdaptability; // 8 points max
  }
  
  // Income-based scenario adaptability
  if (medianIncome > 0) {
    // Mid-range income provides most scenario flexibility
    const incomeFlexibility = medianIncome >= 60000 && medianIncome <= 120000 ? 1 : 
                             medianIncome >= 40000 && medianIncome <= 150000 ? 0.7 : 0.4;
    const incomeAdaptability = incomeFlexibility * 5; // 5 points max
    scenarioAdaptability += incomeAdaptability;
  }
  
  scenarioScore += scenarioAdaptability;
  
  // 2. MARKET RESILIENCE COMPONENT (30 points)
  // Resilience and stability across various market conditions and scenarios
  let marketResilience = 0;
  
  // Trend-based resilience (stable trends = scenario resilience)
  if (trendScore > 0) {
    const trendResilience = (trendScore / 100) * 10; // 10 points max
    marketResilience += trendResilience;
  }
  
  // Correlation-based resilience (strong correlations = predictable scenarios)
  if (correlationScore > 0) {
    const correlationResilience = (correlationScore / 100) * 8; // 8 points max
    marketResilience += correlationResilience;
  }
  
  // Competitive resilience (balanced competition = market stability)
  if (competitiveScore > 0) {
    // Moderate competition provides best resilience
    const competitiveResilience = competitiveScore >= 4 && competitiveScore <= 8 ? 
      Math.min(competitiveScore / 10, 1) * 6 : Math.min(competitiveScore / 10, 1) * 4;
    marketResilience += competitiveResilience; // 6 points max
  }
  
  // Nike share resilience (moderate share indicates stability)
  if (nikeShare > 0) {
    let shareResilience = 0;
    if (nikeShare >= 10 && nikeShare <= 30) shareResilience = 6; // Stable range
    else if (nikeShare >= 5 && nikeShare <= 40) shareResilience = 4; // Acceptable range
    else shareResilience = 2; // Extreme ranges less resilient
    
    marketResilience += shareResilience; // 6 points max
  }
  
  scenarioScore += marketResilience;
  
  // 3. STRATEGIC FLEXIBILITY COMPONENT (25 points)
  // Flexibility to pivot strategies based on different scenarios
  let strategicFlexibility = 0;
  
  // Multi-dimensional flexibility (balanced scores = flexibility)
  const activeScores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
  if (activeScores.length >= 3) {
    const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
    const balance = activeScores.every(s => Math.abs(s - mean) <= 30) ? 1 : 0.6;
    const multiFlex = balance * 8; // 8 points max for balanced capabilities
    strategicFlexibility += multiFlex;
  }
  
  // Income-population flexibility matrix
  if (medianIncome > 0 && totalPop > 0) {
    // Assess market segment flexibility
    const incomeLevel = medianIncome >= 80000 ? 'high' : 
                       medianIncome >= 50000 ? 'medium' : 'low';
    const popLevel = totalPop >= 50000 ? 'large' : 
                    totalPop >= 20000 ? 'medium' : 'small';
    
    let segmentFlex = 0;
    if (incomeLevel === 'medium' && popLevel !== 'small') segmentFlex = 6; // Most flexible
    else if (incomeLevel === 'high' && popLevel === 'large') segmentFlex = 5; // High potential
    else if (incomeLevel !== 'low' || popLevel !== 'small') segmentFlex = 4; // Some flexibility
    else segmentFlex = 2; // Limited flexibility
    
    strategicFlexibility += segmentFlex; // 6 points max
  }
  
  // Market positioning flexibility
  if (strategicScore > 0 && competitiveScore > 0) {
    const positionFlex = Math.min(
      (strategicScore / 100) + (competitiveScore / 20), 1.5
    ) * 7; // 7 points max (can exceed 1.0 for exceptional flexibility)
    strategicFlexibility += Math.min(positionFlex, 7);
  }
  
  // Nike brand flexibility (moderate share allows multiple strategies)
  if (nikeShare > 0) {
    let brandFlex = 0;
    if (nikeShare >= 12 && nikeShare <= 25) brandFlex = 4; // Optimal flexibility range
    else if (nikeShare >= 8 && nikeShare <= 35) brandFlex = 3; // Good flexibility
    else if (nikeShare >= 5) brandFlex = 2; // Some flexibility
    else brandFlex = 1; // Limited flexibility
    
    strategicFlexibility += brandFlex; // 4 points max
  }
  
  scenarioScore += strategicFlexibility;
  
  // 4. PLANNING READINESS COMPONENT (10 points)
  // Data quality and reliability for effective scenario planning
  let planningReadiness = 0;
  
  // Data completeness for scenario planning
  const totalFields = 8; // Total possible fields for planning
  const availableFields = [nikeShare, strategicScore, competitiveScore, demographicScore, 
                          trendScore, correlationScore, totalPop, medianIncome]
    .filter(v => v > 0).length;
  
  const completenessReadiness = (availableFields / totalFields) * 5; // 5 points max
  planningReadiness += completenessReadiness;
  
  // Strategic-demographic alignment readiness
  if (strategicScore > 0 && demographicScore > 0) {
    const alignment = 1 - Math.abs(strategicScore - demographicScore) / 100;
    const alignmentReadiness = alignment >= 0.7 ? 3 : alignment >= 0.5 ? 2 : 1;
    planningReadiness += alignmentReadiness; // 3 points max
  }
  
  // Market size planning reliability
  if (totalPop > 0) {
    const sizeReliability = totalPop >= 25000 ? 2 : totalPop >= 10000 ? 1.5 : 1;  
    planningReadiness += sizeReliability; // 2 points max
  }
  
  scenarioScore += planningReadiness;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(scenarioScore * 100) / 100));
}

// Helper function to calculate scenario baselines
function calculateScenarioBaselines(records) {
  const metrics = {
    strategicScores: [],
    demographicScores: [],
    trendScores: [],
    correlationScores: [],
    nikeShares: [],
    medianIncomes: [],
    populations: []
  };
  
  // Extract values for baseline calculation
  records.forEach(record => {
    const strategicScore = Number(record.strategic_value_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const correlationScore = Number(record.correlation_strength_score) || 0;
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const medianIncome = Number(record.median_income) || 0;
    const totalPop = Number(record.total_population) || 0;
    
    if (strategicScore > 0) metrics.strategicScores.push(strategicScore);
    if (demographicScore > 0) metrics.demographicScores.push(demographicScore);
    if (trendScore > 0) metrics.trendScores.push(trendScore);
    if (correlationScore > 0) metrics.correlationScores.push(correlationScore);
    if (nikeShare > 0) metrics.nikeShares.push(nikeShare);
    if (medianIncome > 0) metrics.medianIncomes.push(medianIncome);
    if (totalPop > 0) metrics.populations.push(totalPop);
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

// Calculate scenario analysis scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating scenario analysis scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateScenarioScore(record, scenarioBaselines);
  record.scenario_analysis_score = score;
  
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

console.log('🎭 Scenario Analysis Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Excellent Scenario Readiness (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Good Scenario Potential (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Moderate Scenario Capability (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Limited Scenario Value (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Poor Scenario Suitability (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Scenario Analysis Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 most scenario-ready areas
const topScenarioReady = correlationData.results
  .sort((a, b) => b.scenario_analysis_score - a.scenario_analysis_score)
  .slice(0, 15);

console.log('🎭 Top 15 Most Scenario-Ready Areas:');
topScenarioReady.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const trend = Number(record.trend_strength_score) || 0;
  const correlation = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  // Determine scenario readiness type
  let scenarioType = 'Balanced';
  if (strategic >= 70 && demographic >= 70) scenarioType = 'High-Potential';
  else if (trend >= 70 && correlation >= 60) scenarioType = 'Trend-Resilient';
  else if (totalPop >= 50000 && medianIncome >= 70000) scenarioType = 'Market-Stable';
  else if (nikeShare >= 15 && strategic >= 60) scenarioType = 'Brand-Strategic';
  else if (demographic >= 80) scenarioType = 'Demographic-Strong';
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.scenario_analysis_score.toFixed(1)} scenario score`);
  console.log(`      🎭 Type: ${scenarioType}, Strategic: ${strategic.toFixed(1)}, Demo: ${demographic.toFixed(1)}, Trend: ${trend.toFixed(1)}, Nike: ${nikeShare.toFixed(1)}%`);
});

// Add scenario analysis metadata
correlationData.scenario_analysis_metadata = {
  scoring_methodology: {
    scenario_adaptability: '35% - How well markets can adapt to different strategic scenarios',
    market_resilience: '30% - Resilience and stability across various market conditions',
    strategic_flexibility: '25% - Flexibility to pivot strategies based on scenarios', 
    planning_readiness: '10% - Data quality and reliability for scenario planning'
  },
  scenario_baselines: {
    avg_strategic_score: scenarioBaselines.strategicScores.avg.toFixed(2),
    avg_demographic_score: scenarioBaselines.demographicScores.avg.toFixed(2),
    avg_trend_score: scenarioBaselines.trendScores.avg.toFixed(2),
    avg_correlation_score: scenarioBaselines.correlationScores.avg.toFixed(2),
    avg_nike_share: scenarioBaselines.nikeShares.avg.toFixed(2) + '%',
    avg_median_income: scenarioBaselines.medianIncomes.avg.toFixed(0),
    avg_population: scenarioBaselines.populations.avg.toFixed(0)
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_scenario_markets: topScenarioReady.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    scenario_score: record.scenario_analysis_score,
    strategic_score: record.strategic_value_score || 0,
    demographic_score: record.demographic_opportunity_score || 0,
    trend_score: record.trend_strength_score || 0,
    nike_share: Number(record.mp30034a_b_p) || 0,
    population: record.total_population || 0,
    median_income: record.median_income || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Scenario analysis scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🎭 All ${processedCount.toLocaleString()} records now include scenario_analysis_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created scenario_analysis_score for all records');
console.log('   2. ✅ Added scenario analysis metadata with adaptability baselines');
console.log('   3. 🔄 Create ScenarioAnalysisProcessor');
console.log('   4. 🔄 Test scenario analysis endpoint');