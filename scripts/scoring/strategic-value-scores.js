/**
 * Strategic Value Scoring Script - Following Documentation Specification
 * 
 * Creates comprehensive strategic value scores for the strategic analysis endpoint
 * following the exact formula documented in endpoint-scoring-documentation.md
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Strategic Value Scoring (Documentation-Compliant)...');

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

// Strategic value scoring formula following documented specification:
// Strategic Value Score = (
//   0.35 × Market Opportunity +
//   0.30 × Competitive Position +
//   0.20 × Data Reliability +
//   0.15 × Market Scale
// )
//
// where:
// - Market Opportunity = (0.60 × Demographic Score) + (0.40 × Market Gap)
// - Competitive Position = (0.67 × Competitive Advantage) + (0.33 × Brand Positioning)
// - Data Reliability = (0.75 × Correlation Strength) + (0.25 × Cluster Consistency)
// - Market Scale = (0.60 × Population Scale) + (0.40 × Economic Scale)

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
  
  // 1. MARKET OPPORTUNITY (35% weight)
  // Market Opportunity = (0.60 × Demographic Score) + (0.40 × Market Gap)
  let marketOpportunity = 0;
  
  // Demographic component (60% of market opportunity)
  const demographicComponent = demographicScore; // Already 0-100 scale
  
  // Market gap component (40% of market opportunity) 
  const marketGap = Math.max(0, 100 - nikeShare); // Untapped market potential
  const marketGapComponent = marketGap; // Already 0-100 scale
  
  marketOpportunity = (0.60 * demographicComponent) + (0.40 * marketGapComponent);
  
  // 2. COMPETITIVE POSITION (30% weight)
  // Competitive Position = (0.67 × Competitive Advantage) + (0.33 × Brand Positioning)
  let competitivePosition = 0;
  
  // Competitive advantage component (67% of competitive position)
  // Competitive score is already on 0-100 scale
  const competitiveAdvantage = competitiveScore; // Already 0-100 scale
  
  // Brand positioning component (33% of competitive position)
  // Scale Nike market share to 0-100 where 50% share = 100 points
  const brandPositioning = Math.min((nikeShare / 50) * 100, 100);
  
  competitivePosition = (0.67 * competitiveAdvantage) + (0.33 * brandPositioning);
  
  // 3. DATA RELIABILITY (20% weight)
  // Data Reliability = (0.75 × Correlation Strength) + (0.25 × Cluster Consistency)
  let dataReliability = 0;
  
  // Correlation strength component (75% of data reliability)
  const correlationComponent = correlationScore; // Already 0-100 scale
  
  // Cluster consistency component (25% of data reliability)
  let clusterConsistency = 0;
  if (clusterScore > 0) {
    clusterConsistency = clusterScore; // Already 0-100 scale
  } else if (targetValue > 0) {
    // Use target value consistency as proxy (normalize to 0-100)
    clusterConsistency = Math.min((targetValue / 50) * 100, 100);
  } else {
    clusterConsistency = 50; // Default moderate consistency
  }
  
  dataReliability = (0.75 * correlationComponent) + (0.25 * clusterConsistency);
  
  // 4. MARKET SCALE (15% weight)
  // Market Scale = (0.60 × Population Scale) + (0.40 × Economic Scale)
  let marketScale = 0;
  
  // Population scale component (60% of market scale)
  // Normalize population to 0-100 where 100k = 100 points
  const populationScale = totalPopulation > 0 ? Math.min((totalPopulation / 100000) * 100, 100) : 0;
  
  // Economic scale component (40% of market scale)  
  // Normalize income to 0-100 where $150k = 100 points
  const economicScale = medianIncome > 0 ? Math.min((medianIncome / 150000) * 100, 100) : 0;
  
  marketScale = (0.60 * populationScale) + (0.40 * economicScale);
  
  // FINAL STRATEGIC VALUE SCORE
  const strategicScore = (0.35 * marketOpportunity) + 
                        (0.30 * competitivePosition) + 
                        (0.20 * dataReliability) + 
                        (0.15 * marketScale);
  
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
    market_opportunity: '35% - (0.60 × Demographic Score) + (0.40 × Market Gap)',
    competitive_position: '30% - (0.67 × Competitive Advantage) + (0.33 × Brand Positioning)', 
    data_reliability: '20% - (0.75 × Correlation Strength) + (0.25 × Cluster Consistency)',
    market_scale: '15% - (0.60 × Population Scale) + (0.40 × Economic Scale)'
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
console.log('   4. 🔄 Test strategic analysis endpoint');