/**
 * Segment Profiling Scoring Script
 * 
 * Creates segment profiling scores for the segment profiling endpoint by analyzing
 * market segmentation potential, demographic clustering strength, and behavioral
 * grouping indicators to identify markets with distinct segment characteristics.
 * 
 * Formula: Demographic Distinctiveness (35%) + Behavioral Clustering (30%) + Market Segment Strength (25%) + Profiling Clarity (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Segment Profiling Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for segment profiling scoring...`);

// First pass: Calculate segment baselines for profiling assessment
const segmentBaselines = calculateSegmentBaselines(correlationData.results);

// Segment profiling scoring formula considers:
// 1. Demographic Distinctiveness (35%) - How distinct demographic characteristics are for segmentation
// 2. Behavioral Clustering (30%) - Strength of behavioral patterns for grouping
// 3. Market Segment Strength (25%) - Natural market segments and clustering potential
// 4. Profiling Clarity (10%) - Clarity and reliability of segment profiles

function calculateSegmentScore(record, baselines) {
  // Extract relevant metrics for segment profiling
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let segmentScore = 0;
  
  // 1. DEMOGRAPHIC DISTINCTIVENESS COMPONENT (35 points)
  // How distinct demographic characteristics are for effective segmentation
  let demographicDistinctiveness = 0;
  
  // Primary demographic distinctiveness from score
  if (demographicScore > 0) {
    const distinctivenessFromDemographic = (demographicScore / 100) * 15; // 15 points max
    demographicDistinctiveness += distinctivenessFromDemographic;
  }
  
  // Income-based segmentation potential
  if (medianIncome > 0) {
    // Income distinctiveness (deviation from baseline creates segments)
    const incomeDeviation = baselines.medianIncome.avg > 0 ? 
      Math.abs(medianIncome - baselines.medianIncome.avg) / baselines.medianIncome.avg : 0;
    const incomeDistinctiveness = Math.min(incomeDeviation * 2, 1) * 8; // 8 points max
    demographicDistinctiveness += incomeDistinctiveness;
  }
  
  // Population size segmentation potential
  if (totalPop > 0) {
    // Population-based segment identification
    let populationSegment = 0;
    if (totalPop >= 100000) populationSegment = 7; // Large market segment
    else if (totalPop >= 50000) populationSegment = 6; // Medium-large segment
    else if (totalPop >= 25000) populationSegment = 5; // Medium segment
    else if (totalPop >= 10000) populationSegment = 4; // Small-medium segment
    else if (totalPop >= 5000) populationSegment = 3; // Small segment
    else populationSegment = 2; // Micro segment
    
    demographicDistinctiveness += populationSegment; // 7 points max
  }
  
  // Multi-dimensional demographic profile distinctiveness
  if (demographicScore > 0 && medianIncome > 0 && totalPop > 0) {
    // Profile uniqueness based on multi-dimensional characteristics
    const profileUniqueness = Math.min(
      (demographicScore / 100) * (Math.log(totalPop) / 12) * (medianIncome / 80000), 1
    ) * 5; // 5 points max
    demographicDistinctiveness += profileUniqueness;
  }
  
  segmentScore += demographicDistinctiveness;
  
  // 2. BEHAVIORAL CLUSTERING COMPONENT (30 points)
  // Strength of behavioral patterns that enable effective customer grouping
  let behavioralClustering = 0;
  
  // Strategic behavior clustering
  if (strategicScore > 0) {
    const strategicClustering = (strategicScore / 100) * 10; // 10 points max
    behavioralClustering += strategicClustering;
  }
  
  // Competitive behavior patterns
  if (competitiveScore > 0) {
    const competitiveClustering = Math.min(competitiveScore / 10, 1) * 8; // 8 points max
    behavioralClustering += competitiveClustering;
  }
  
  // Nike share behavioral segment indicator
  if (nikeShare > 0) {
    let shareBehavior = 0;
    if (nikeShare >= 40) shareBehavior = 8; // High Nike loyalty segment
    else if (nikeShare >= 25) shareBehavior = 6; // Strong Nike preference segment
    else if (nikeShare >= 15) shareBehavior = 5; // Moderate Nike segment
    else if (nikeShare >= 8) shareBehavior = 4; // Low Nike segment
    else shareBehavior = 2; // Minimal Nike segment
    
    behavioralClustering += shareBehavior; // 8 points max
  }
  
  // Trend-based behavioral clustering
  if (trendScore > 0) {
    const trendClustering = Math.min(trendScore / 100, 1) * 4; // 4 points max
    behavioralClustering += trendClustering;
  }
  
  segmentScore += behavioralClustering;
  
  // 3. MARKET SEGMENT STRENGTH COMPONENT (25 points)
  // Natural market segments and clustering potential strength
  let marketSegmentStrength = 0;
  
  // Correlation-based segment strength
  if (correlationScore > 0) {
    const correlationSegmentStrength = (correlationScore / 100) * 10; // 10 points max
    marketSegmentStrength += correlationSegmentStrength;
  }
  
  // Multi-variable segment coherence
  const activeScores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
  if (activeScores.length >= 3) {
    const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
    const coherence = activeScores.every(s => Math.abs(s - mean) <= 20) ? 1 : 0.5;
    const segmentCoherence = coherence * 8; // 8 points max for coherent segments
    marketSegmentStrength += segmentCoherence;
  }
  
  // Market position segment identification
  if (strategicScore > 0 && competitiveScore > 0) {
    const positionSegment = Math.min(
      (strategicScore / 100) * (competitiveScore / 10), 1
    ) * 7; // 7 points max
    marketSegmentStrength += positionSegment;
  }
  
  segmentScore += marketSegmentStrength;
  
  // 4. PROFILING CLARITY COMPONENT (10 points)
  // Clarity and reliability of segment profiles for actionable insights
  let profilingClarity = 0;
  
  // Data completeness for clear profiling
  const totalFields = 8; // Total possible fields for profiling
  const availableFields = [nikeShare, strategicScore, competitiveScore, demographicScore, 
                          trendScore, correlationScore, totalPop, medianIncome]
    .filter(v => v > 0).length;
  
  const completenessClarity = (availableFields / totalFields) * 5; // 5 points max
  profilingClarity += completenessClarity;
  
  // Profile consistency for clarity
  if (activeScores.length >= 3) {
    const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
    const variance = activeScores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / activeScores.length;
    const consistency = Math.max(0, 1 - (Math.sqrt(variance) / mean)) * 3; // 3 points max
    profilingClarity += consistency;
  }
  
  // Income-demographic profile alignment clarity
  if (medianIncome > 0 && demographicScore > 0) {
    const expectedIncomeAlignment = demographicScore / 100; // Expected alignment
    const actualIncomeLevel = Math.min(medianIncome / 80000, 1.5); // Actual income level
    const alignmentClarity = (1 - Math.abs(expectedIncomeAlignment - actualIncomeLevel)) * 2; // 2 points max
    profilingClarity += Math.max(0, alignmentClarity);
  }
  
  segmentScore += profilingClarity;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(segmentScore * 100) / 100));
}

// Helper function to calculate segment baselines
function calculateSegmentBaselines(records) {
  const metrics = {
    demographicScores: [],
    strategicScores: [],
    medianIncome: [],
    totalPopulation: [],
    nikeShares: []
  };
  
  // Extract values for baseline calculation
  records.forEach(record => {
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const medianIncome = Number(record.median_income) || 0;
    const totalPop = Number(record.total_population) || 0;
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    
    if (demographicScore > 0) metrics.demographicScores.push(demographicScore);
    if (strategicScore > 0) metrics.strategicScores.push(strategicScore);
    if (medianIncome > 0) metrics.medianIncome.push(medianIncome);
    if (totalPop > 0) metrics.totalPopulation.push(totalPop);
    if (nikeShare > 0) metrics.nikeShares.push(nikeShare);
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

// Calculate segment profiling scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating segment profiling scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateSegmentScore(record, segmentBaselines);
  record.segment_profiling_score = score;
  
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

console.log('🎯 Segment Profiling Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Excellent Segmentation (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Good Segment Potential (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Moderate Segmentation (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Limited Segment Value (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Poor Segmentation (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Segment Profiling Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 most segmentable areas
const topSegmentable = correlationData.results
  .sort((a, b) => b.segment_profiling_score - a.segment_profiling_score)
  .slice(0, 15);

console.log('🎯 Top 15 Most Segmentable Areas:');
topSegmentable.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const medianIncome = Number(record.median_income) || 0;
  const totalPop = Number(record.total_population) || 0;
  
  // Determine segment characteristics
  let segmentType = 'Mixed';
  if (nikeShare >= 25 && demographic >= 70) segmentType = 'Premium Nike';
  else if (nikeShare >= 15 && medianIncome >= 60000) segmentType = 'Affluent Nike';
  else if (demographic >= 80) segmentType = 'High Demographic';
  else if (strategic >= 70) segmentType = 'Strategic';
  else if (totalPop >= 50000) segmentType = 'Large Market';
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.segment_profiling_score.toFixed(1)} segment score`);
  console.log(`      🎯 Type: ${segmentType}, Nike: ${nikeShare.toFixed(1)}%, Pop: ${totalPop.toLocaleString()}, Income: $${medianIncome.toLocaleString()}`);
});

// Add segment profiling metadata
correlationData.segment_profiling_metadata = {
  scoring_methodology: {
    demographic_distinctiveness: '35% - How distinct demographic characteristics are for segmentation',
    behavioral_clustering: '30% - Strength of behavioral patterns for customer grouping', 
    market_segment_strength: '25% - Natural market segments and clustering potential',
    profiling_clarity: '10% - Clarity and reliability of segment profiles'
  },
  segment_baselines: {
    avg_demographic_score: segmentBaselines.demographicScores.avg.toFixed(2),
    avg_strategic_score: segmentBaselines.strategicScores.avg.toFixed(2),
    avg_median_income: segmentBaselines.medianIncome.avg.toFixed(0),
    avg_population: segmentBaselines.totalPopulation.avg.toFixed(0),
    avg_nike_share: segmentBaselines.nikeShares.avg.toFixed(2) + '%'
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_segment_markets: topSegmentable.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    segment_score: record.segment_profiling_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    demographic_score: record.demographic_opportunity_score || 0,
    strategic_score: record.strategic_value_score || 0,
    population: record.total_population || 0,
    median_income: record.median_income || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Segment profiling scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include segment_profiling_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created segment_profiling_score for all records');
console.log('   2. ✅ Added segment profiling metadata with segmentation baselines');
console.log('   3. 🔄 Create SegmentProfilingProcessor');
console.log('   4. 🔄 Test segment profiling endpoint');