/**
 * Integrate Competitive Advantage Scores into Main Dataset
 * 
 * Takes the corrected competitive scores and integrates them properly
 * into the main microservice-export.json dataset
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Integrating Competitive Advantage Scores...');

// Load the main dataset
const mainDataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const mainData = JSON.parse(fs.readFileSync(mainDataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = mainData.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found in main data');
  process.exit(1);
}

console.log(`📊 Main dataset has ${correlationData.results.length} records`);

// Generate competitive advantage scores directly in the main dataset
function calculateCompetitiveScore(record) {
  // Extract relevant metrics for competitive analysis
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  
  // Extract competitor shares
  const adidasShare = Number(record.mp30029a_b_p) || 0;
  const jordanShare = Number(record.mp30032a_b_p) || 0;
  const converseShare = Number(record.mp30031a_b_p) || 0;
  const pumaShare = Number(record.mp30035a_b_p) || 0;
  const newBalanceShare = Number(record.mp30033a_b_p) || 0;
  const asicsShare = Number(record.mp30030a_b_p) || 0;
  const skechersShare = Number(record.mp30037a_b_p) || 0;
  const reebokShare = Number(record.mp30036a_b_p) || 0;
  
  const competitors = [adidasShare, jordanShare, converseShare, pumaShare, 
                      newBalanceShare, asicsShare, skechersShare, reebokShare];
  const totalCompetitorShare = competitors.reduce((sum, share) => sum + share, 0);
  const strongestCompetitor = Math.max(...competitors);
  
  let competitiveScore = 0;
  
  // 1. Market Dominance (40% - 4 points max)
  if (nikeShare > 0) {
    let dominanceScore = 0;
    if (nikeShare >= 35) dominanceScore = 4.0; // Dominant position
    else if (nikeShare >= 25) dominanceScore = 3.5; // Strong position
    else if (nikeShare >= 20) dominanceScore = 3.0; // Good position
    else if (nikeShare >= 15) dominanceScore = 2.5; // Moderate position
    else if (nikeShare >= 10) dominanceScore = 2.0; // Weak position
    else dominanceScore = 1.0; // Very weak position
    
    competitiveScore += dominanceScore;
  } else {
    competitiveScore += 1.0; // Minimum score if no Nike presence
  }
  
  // 2. Demographic Alignment (25% - 2.5 points max)
  if (demographicScore > 0) {
    const demographicAdvantage = (demographicScore / 100) * 2.5;
    competitiveScore += demographicAdvantage;
  }
  
  // 3. Competitive Pressure Assessment (25% - 2.5 points max)
  if (totalCompetitorShare > 0) {
    // Lower competitive pressure = higher score
    const competitivePressure = Math.min(totalCompetitorShare / 80, 1); // Normalize to 80% baseline
    const pressureScore = (1 - competitivePressure) * 2.5;
    competitiveScore += Math.max(pressureScore, 0.5); // Minimum 0.5 points
  } else {
    competitiveScore += 2.5; // Maximum if no competitor data
  }
  
  // 4. Strategic Market Strength (10% - 1 point max)
  if (strategicScore > 0) {
    const strategicAdvantage = (strategicScore / 100) * 1.0;
    competitiveScore += strategicAdvantage;
  }
  
  // Ensure score is in 1-10 range (competitive scores traditionally use 1-10 scale)
  return Math.max(1, Math.min(10, Math.round(competitiveScore * 100) / 100));
}

// Calculate competitive scores for all records
let processedCount = 0;
const scoreStats = {
  min: 10,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating competitive advantage scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateCompetitiveScore(record);
  record.competitive_advantage_score = score;
  
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

console.log('🎯 Competitive Advantage Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Dominant Advantage (8-10)': scoreStats.scores.filter(s => s >= 8).length,
  'Strong Advantage (6-7)': scoreStats.scores.filter(s => s >= 6 && s < 8).length,
  'Moderate Advantage (4-5)': scoreStats.scores.filter(s => s >= 4 && s < 6).length,
  'Limited Advantage (2-3)': scoreStats.scores.filter(s => s >= 2 && s < 4).length,
  'Weak Position (1-2)': scoreStats.scores.filter(s => s < 2).length
};

console.log('📊 Competitive Advantage Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 competitive advantage markets
const topCompetitive = correlationData.results
  .sort((a, b) => b.competitive_advantage_score - a.competitive_advantage_score)
  .slice(0, 15);

console.log('🏆 Top 15 Competitive Advantage Markets:');
topCompetitive.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const adidasShare = Number(record.mp30029a_b_p) || 0;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.competitive_advantage_score.toFixed(1)} competitive score`);
  console.log(`      🎯 Nike: ${nikeShare.toFixed(1)}%, Adidas: ${adidasShare.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Demo: ${demographic.toFixed(1)}`);
});

// Add competitive advantage metadata
correlationData.competitive_advantage_metadata = {
  scoring_methodology: {
    market_dominance: '40% - Nike market share and position strength vs competitors',
    demographic_alignment: '25% - Demographic opportunity score supporting competitive position',
    competitive_pressure: '25% - Competitive pressure from other brands (lower pressure = higher score)',
    strategic_market_strength: '10% - Strategic value score supporting competitive advantage'
  },
  competitive_baselines: {
    avg_nike_share: (correlationData.results.reduce((sum, r) => sum + (Number(r.mp30034a_b_p) || 0), 0) / correlationData.results.length).toFixed(2) + '%',
    avg_strategic_score: (correlationData.results.reduce((sum, r) => sum + (Number(r.strategic_value_score) || 0), 0) / correlationData.results.length).toFixed(2),
    avg_demographic_score: (correlationData.results.reduce((sum, r) => sum + (Number(r.demographic_opportunity_score) || 0), 0) / correlationData.results.length).toFixed(2)
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_competitive_markets: topCompetitive.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    competitive_score: record.competitive_advantage_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    strategic_score: record.strategic_value_score || 0,
    demographic_score: record.demographic_opportunity_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset with competitive advantage scores...');
fs.writeFileSync(mainDataPath, JSON.stringify(mainData, null, 2));

console.log('✅ Competitive advantage scores integrated successfully!');
console.log(`📄 Updated main dataset: ${mainDataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include competitive_advantage_score field`);

console.log('\n📋 Integration Summary:');
console.log('   1. ✅ Added competitive_advantage_score to all records in main dataset');
console.log('   2. ✅ Used 1-10 scale consistent with competitive analysis standards');
console.log('   3. ✅ Integrated Nike vs competitor market share analysis');
console.log('   4. ✅ Added comprehensive metadata for competitive analysis');
console.log('   5. ✅ Ready for competitive analysis endpoint testing');

console.log('\n🔄 Next Step: Re-run analysis accuracy test to verify integration');