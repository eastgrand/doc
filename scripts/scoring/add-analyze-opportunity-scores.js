/**
 * Add Opportunity Scores to analyze.json
 * 
 * This script adds the missing opportunity_score field to the analyze.json endpoint file
 * by using the existing competitive_advantage_score as a base and calculating a strategic
 * opportunity score from available data.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Opportunity Score Addition for analyze.json...');

// Load the analyze endpoint data
const analyzeDataPath = path.join(__dirname, '../../public/data/endpoints/analyze.json');
const analyzeData = JSON.parse(fs.readFileSync(analyzeDataPath, 'utf8'));

if (!analyzeData || !analyzeData.results) {
  console.error('❌ analyze.json not found or invalid format');
  process.exit(1);
}

console.log(`📊 Processing ${analyzeData.results.length} records...`);

// Calculate opportunity score based on available data
function calculateOpportunityScore(record) {
  // Get existing scores
  const competitiveScore = Number(record.competitive_advantage_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const clusterScore = Number(record.cluster_performance_score) || 0;
  
  // Get market data
  const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const totalPop = Number(record.total_population || record.value_TOTPOP_CY) || 0;
  const medianIncome = Number(record.median_income || record.value_AVGHINC_CY) || 0;
  
  // Calculate opportunity score (0-10 scale matching CoreAnalysisProcessor)
  let opportunityScore = 0;
  
  // 1. Market Opportunity (0-3 points): Based on untapped market potential
  const marketGap = Math.max(0, 100 - nikeShare - adidasShare);
  const marketOpportunity = Math.min(3, (marketGap / 100) * 3);
  
  // 2. Economic Attractiveness (0-2 points): Income-adjusted population
  const economicScore = Math.min(2, 
    (Math.max(0, (medianIncome - 30000) / 70000) * 1) + // Income factor (0-1)
    (Math.min(totalPop / 100000, 1) * 1)                // Population factor (0-1)
  );
  
  // 3. Competitive Position (0-2 points): Nike's current standing
  const competitivePosition = Math.min(2,
    (Math.max(0, nikeShare / 50) * 1) +           // Nike strength (0-1)
    (Math.max(0, (nikeShare - adidasShare) / 25) * 1) // Relative advantage (0-1)
  );
  
  // 4. Growth Potential (0-2 points): Based on market dynamics
  const growthPotential = Math.min(2,
    (marketGap > 80 ? 1 : marketGap / 80) +      // High untapped market (0-1)
    (medianIncome > 60000 ? 1 : 0)               // High-income bonus (0-1)
  );
  
  // 5. Strategic Fit (0-1 points): Urban/suburban preference
  const strategicFit = Math.min(1, 
    totalPop > 25000 ? 1 : totalPop / 25000      // Urban density preference
  );
  
  // Composite opportunity score (0-10 scale)
  opportunityScore = Math.min(10, 
    marketOpportunity + economicScore + competitivePosition + growthPotential + strategicFit
  );
  
  return Math.round(opportunityScore * 100) / 100;
}

// Process each record
let processedCount = 0;
let nullValueCount = 0;
let fixedCount = 0;
const scoreStats = {
  min: 10,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Adding opportunity scores...');

analyzeData.results.forEach((record, index) => {
  // Check if value field is null
  if (record.value === null || record.value === undefined) {
    nullValueCount++;
  }
  
  // Calculate and add opportunity score
  const opportunityScore = calculateOpportunityScore(record);
  record.opportunity_score = opportunityScore;
  
  // Also set the value field to the opportunity score
  if (record.value === null || record.value === undefined) {
    record.value = opportunityScore;
    fixedCount++;
  }
  
  // Track statistics
  scoreStats.min = Math.min(scoreStats.min, opportunityScore);
  scoreStats.max = Math.max(scoreStats.max, opportunityScore);
  scoreStats.sum += opportunityScore;
  scoreStats.scores.push(opportunityScore);
  
  processedCount++;
  
  if (processedCount % 1000 === 0) {
    console.log(`   Processed ${processedCount}/${analyzeData.results.length} records...`);
  }
  
  // Log first few records for debugging
  if (index < 5) {
    console.log(`   Sample ${index + 1}: ${record.DESCRIPTION || record.ID} - opportunity_score: ${opportunityScore.toFixed(2)}, value: ${record.value}`);
  }
});

// Calculate final statistics
const avgScore = scoreStats.sum / processedCount;
scoreStats.scores.sort((a, b) => a - b);
const medianScore = scoreStats.scores[Math.floor(scoreStats.scores.length / 2)];

console.log('\n📈 Opportunity Score Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Null values found: ${nullValueCount.toLocaleString()}`);
console.log(`   📊 Values fixed: ${fixedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(2)} - ${scoreStats.max.toFixed(2)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(2)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(2)}`);

// Show score distribution
const scoreRanges = {
  'High Opportunity (8-10)': scoreStats.scores.filter(s => s >= 8).length,
  'Good Opportunity (6-8)': scoreStats.scores.filter(s => s >= 6 && s < 8).length,
  'Moderate Opportunity (4-6)': scoreStats.scores.filter(s => s >= 4 && s < 6).length,
  'Low Opportunity (2-4)': scoreStats.scores.filter(s => s >= 2 && s < 4).length,
  'Minimal Opportunity (0-2)': scoreStats.scores.filter(s => s < 2).length
};

console.log('\n📊 Opportunity Score Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 10 opportunities
const topOpportunities = analyzeData.results
  .sort((a, b) => b.opportunity_score - a.opportunity_score)
  .slice(0, 10);

console.log('\n🏆 Top 10 Opportunity Areas:');
topOpportunities.forEach((record, index) => {
  const nike = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
  const adidas = Number(record.value_MP30029A_B_P) || 0;
  const marketGap = Math.max(0, 100 - nike - adidas);
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.opportunity_score.toFixed(2)} score`);
  console.log(`      📊 Nike: ${nike.toFixed(1)}%, Adidas: ${adidas.toFixed(1)}%, Market Gap: ${marketGap.toFixed(1)}%`);
});

// Save updated data
console.log('\n💾 Saving updated analyze.json...');
fs.writeFileSync(analyzeDataPath, JSON.stringify(analyzeData, null, 2));

console.log('✅ Opportunity scoring complete!');
console.log(`📄 Updated file saved to: ${analyzeDataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include opportunity_score field`);
console.log(`🔧 Fixed ${fixedCount.toLocaleString()} null value fields`);