/**
 * Strategic Value Scoring Script
 * 
 * Creates comprehensive strategic value scores for the general analysis endpoint
 * by combining multiple analytical dimensions: competitive advantage, demographic opportunity,
 * correlation strength, and market fundamentals into a unified strategic ranking.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Strategic Value Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for strategic value scoring...`);

// Strategic value scoring formula incorporates multiple analytical dimensions:
// 1. Market Opportunity (35%) - Demographics + Market fundamentals  
// 2. Competitive Position (30%) - Competitive advantage + Brand positioning
// 3. Data Reliability (20%) - Correlation strength + Data consistency
// 4. Market Scale (15%) - Population size + Economic scale

function calculateStrategicValueScore(record) {
  // Extract all available scores and metrics
  const competitiveScore = Number(record.competitive_advantage_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const clusterScore = Number(record.cluster_performance_score) || 0;
  
  // Market fundamentals
  const targetValue = Number(record.target_value) || 0;
  const medianIncome = Number(record.median_income) || 0;
  const totalPopulation = Number(record.total_population) || 0;
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  
  let strategicScore = 0;
  
  // 1. MARKET OPPORTUNITY COMPONENT (35 points)
  // Combines demographic opportunity with market fundamentals
  let marketOpportunity = 0;
  
  // Demographic opportunity (60% of market opportunity)
  if (demographicScore > 0) {
    marketOpportunity += (demographicScore / 100) * 21; // 21 points max
  } else {
    // Fallback demographic calculation if no pre-calculated score
    const incomeScore = medianIncome > 0 ? Math.min((medianIncome / 100000) * 10, 10) : 5;
    const popScore = totalPopulation > 0 ? Math.min((totalPopulation / 50000) * 11, 11) : 5;
    marketOpportunity += incomeScore + popScore;
  }
  
  // Market fundamentals (40% of market opportunity) 
  const marketGap = Math.max(0, 100 - nikeShare); // Untapped market potential
  const marketGapScore = (marketGap / 100) * 14; // 14 points max
  marketOpportunity += marketGapScore;
  
  strategicScore += marketOpportunity;
  
  // 2. COMPETITIVE POSITION COMPONENT (30 points)
  // Competitive advantage + brand positioning strength
  let competitivePosition = 0;
  
  if (competitiveScore > 0) {
    // Use pre-calculated competitive advantage score (1-10 scale)
    competitivePosition += (competitiveScore / 10) * 20; // 20 points max
  } else {
    // Fallback competitive calculation
    const competitiveAdvantage = Math.max(0, nikeShare - 10); // Above 10% considered advantage
    competitivePosition += Math.min(competitiveAdvantage / 2, 20);
  }
  
  // Brand positioning (Nike market share strength)
  const brandPositioning = nikeShare > 0 ? Math.min((nikeShare / 50) * 10, 10) : 0; // 10 points max
  competitivePosition += brandPositioning;
  
  strategicScore += competitivePosition;
  
  // 3. DATA RELIABILITY COMPONENT (20 points)
  // How reliable/predictable is this market based on data patterns
  let dataReliability = 0;
  
  if (correlationScore > 0) {
    // Use correlation strength as reliability indicator
    dataReliability += (correlationScore / 100) * 15; // 15 points max
  } else {
    // Default moderate reliability
    dataReliability += 10;
  }
  
  // Cluster consistency (if clustered)
  if (clusterScore > 0) {
    dataReliability += (clusterScore / 100) * 5; // 5 points max
  } else if (targetValue > 0) {
    // Use target value consistency as proxy
    const targetConsistency = Math.min(targetValue / 20, 1) * 5;
    dataReliability += targetConsistency;
  }
  
  strategicScore += dataReliability;
  
  // 4. MARKET SCALE COMPONENT (15 points)
  // Population size + economic scale
  let marketScale = 0;
  
  // Population scale (60% of market scale)
  if (totalPopulation > 0) {
    const popScale = Math.min((totalPopulation / 100000) * 9, 9); // 9 points max
    marketScale += popScale;
  } else {
    marketScale += 5; // Default moderate scale
  }
  
  // Economic scale (40% of market scale)
  if (medianIncome > 0) {
    const economicScale = Math.min((medianIncome / 150000) * 6, 6); // 6 points max
    marketScale += economicScale;
  } else {
    marketScale += 3; // Default moderate economic scale
  }
  
  strategicScore += marketScale;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(strategicScore * 100) / 100));
}

// Calculate strategic value score for each record
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating strategic value scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateStrategicValueScore(record);
  record.strategic_value_score = score;
  
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

console.log('📈 Strategic Value Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Exceptional Strategic Value (90-100)': scoreStats.scores.filter(s => s >= 90).length,
  'High Strategic Value (75-89)': scoreStats.scores.filter(s => s >= 75 && s < 90).length,
  'Good Strategic Value (60-74)': scoreStats.scores.filter(s => s >= 60 && s < 75).length,
  'Moderate Strategic Value (45-59)': scoreStats.scores.filter(s => s >= 45 && s < 60).length,
  'Limited Strategic Value (0-44)': scoreStats.scores.filter(s => s < 45).length
};

console.log('📊 Strategic Value Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 strategic opportunities
const topStrategic = correlationData.results
  .sort((a, b) => b.strategic_value_score - a.strategic_value_score)
  .slice(0, 15);

console.log('🏆 Top 15 Strategic Value Opportunities:');
topStrategic.forEach((record, index) => {
  const income = Number(record.median_income) || 0;
  const population = Number(record.total_population) || 0;
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const competitive = Number(record.competitive_advantage_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.strategic_value_score.toFixed(1)} strategic score`);
  console.log(`      📊 Competitive: ${competitive.toFixed(1)}, Demo: ${demographic.toFixed(1)}, Nike: ${nikeShare.toFixed(1)}%, $${(income/1000).toFixed(0)}K, ${(population/1000).toFixed(0)}K pop`);
});

// Add strategic scoring metadata
correlationData.strategic_scoring_metadata = {
  scoring_methodology: {
    market_opportunity: '35% - Demographics + Market fundamentals',
    competitive_position: '30% - Competitive advantage + Brand positioning', 
    data_reliability: '20% - Correlation strength + Data consistency',
    market_scale: '15% - Population size + Economic scale'
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_strategic_markets: topStrategic.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    strategic_score: record.strategic_value_score,
    competitive_score: record.competitive_advantage_score || 0,
    demographic_score: record.demographic_opportunity_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Strategic value scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include strategic_value_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created strategic_value_score for all records');
console.log('   2. ✅ Added strategic scoring metadata');
console.log('   3. 🔄 Update CoreAnalysisProcessor to use strategic scores');
console.log('   4. 🔄 Test general analysis endpoint');