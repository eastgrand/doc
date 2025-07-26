/**
 * Market Sizing Scoring Script
 * 
 * Creates market sizing scores for the market sizing endpoint by analyzing
 * market opportunity size, growth potential, addressable market characteristics,
 * and revenue potential to identify markets with the largest strategic value.
 * 
 * Formula: Market Opportunity Size (40%) + Growth Potential (30%) + Addressable Market Quality (20%) + Revenue Potential (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('📏 Starting Market Sizing Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for market sizing scoring...`);

// First pass: Calculate market sizing baselines
const marketSizingBaselines = calculateMarketSizingBaselines(correlationData.results);

// Market sizing scoring formula considers:
// 1. Market Opportunity Size (40%) - Total addressable market size and population scale
// 2. Growth Potential (30%) - Market growth trajectory and expansion opportunity  
// 3. Addressable Market Quality (20%) - Quality and characteristics of addressable market
// 4. Revenue Potential (10%) - Income levels and spending power indicators

function calculateMarketSizingScore(record, baselines) {
  // Extract relevant metrics for market sizing
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const correlationScore = Number(record.correlation_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let marketSizingScore = 0;
  
  // 1. MARKET OPPORTUNITY SIZE COMPONENT (40 points)
  // Total addressable market size based on population and market characteristics
  let marketOpportunitySize = 0;
  
  // Primary population-based market size
  if (totalPop > 0) {
    let populationSize = 0;
    if (totalPop >= 200000) populationSize = 18; // Mega market
    else if (totalPop >= 100000) populationSize = 15; // Large market
    else if (totalPop >= 75000) populationSize = 12; // Medium-large market
    else if (totalPop >= 50000) populationSize = 10; // Medium market
    else if (totalPop >= 25000) populationSize = 8; // Small-medium market
    else if (totalPop >= 15000) populationSize = 6; // Small market
    else if (totalPop >= 10000) populationSize = 4; // Very small market
    else populationSize = 2; // Micro market
    
    marketOpportunitySize += populationSize; // 18 points max
  }
  
  // Strategic market size multiplier
  if (strategicScore > 0 && totalPop > 0) {
    const strategicMultiplier = (strategicScore / 100) * Math.log(totalPop) / 12;
    const strategicSizeBonus = Math.min(strategicMultiplier, 1) * 8; // 8 points max
    marketOpportunitySize += strategicSizeBonus;
  }
  
  // Demographic market expansion factor
  if (demographicScore > 0) {
    const demographicExpansion = (demographicScore / 100) * 7; // 7 points max
    marketOpportunitySize += demographicExpansion;
  }
  
  // Nike market penetration potential size
  if (nikeShare > 0 && totalPop > 0) {
    // Lower Nike share indicates larger untapped market
    const penetrationPotential = Math.max(0, (40 - nikeShare) / 40) * 0.8; // Inverse relationship
    const marketPenetrationSize = penetrationPotential * (totalPop / 50000) * 7; // 7 points max
    marketOpportunitySize += Math.min(marketPenetrationSize, 7);
  }
  
  marketSizingScore += marketOpportunitySize;
  
  // 2. GROWTH POTENTIAL COMPONENT (30 points)
  // Market growth trajectory and expansion opportunity assessment
  let growthPotential = 0;
  
  // Trend-based growth potential
  if (trendScore > 0) {
    const trendGrowth = (trendScore / 100) * 12; // 12 points max
    growthPotential += trendGrowth;
  }
  
  // Strategic growth opportunity
  if (strategicScore > 0) {
    const strategicGrowth = (strategicScore / 100) * 8; // 8 points max
    growthPotential += strategicGrowth;
  }
  
  // Demographic growth momentum
  if (demographicScore > 0) {
    const demographicGrowth = Math.min(demographicScore / 100, 1) * 6; // 6 points max
    growthPotential += demographicGrowth;
  }
  
  // Market expansion potential from low competition
  if (competitiveScore > 0) {
    // Lower competition = higher growth potential
    const competitionGrowthFactor = Math.max(0, (10 - competitiveScore) / 10);
    const competitionGrowth = competitionGrowthFactor * 4; // 4 points max
    growthPotential += competitionGrowth;
  }
  
  marketSizingScore += growthPotential;
  
  // 3. ADDRESSABLE MARKET QUALITY COMPONENT (20 points)
  // Quality and characteristics of the addressable market segment
  let addressableMarketQuality = 0;
  
  // Income-based market quality
  if (medianIncome > 0) {
    let incomeQuality = 0;
    if (medianIncome >= 120000) incomeQuality = 8; // Premium market
    else if (medianIncome >= 100000) incomeQuality = 7; // High-income market
    else if (medianIncome >= 80000) incomeQuality = 6; // Upper-middle market
    else if (medianIncome >= 60000) incomeQuality = 5; // Middle market
    else if (medianIncome >= 45000) incomeQuality = 4; // Lower-middle market
    else if (medianIncome >= 30000) incomeQuality = 3; // Lower market
    else incomeQuality = 2; // Limited income market
    
    addressableMarketQuality += incomeQuality; // 8 points max
  }
  
  // Correlation-based market predictability quality
  if (correlationScore > 0) {
    const correlationQuality = (correlationScore / 100) * 6; // 6 points max
    addressableMarketQuality += correlationQuality;
  }
  
  // Population density and market concentration quality
  if (totalPop > 0) {
    // Higher population density generally indicates better market quality
    const densityQuality = totalPop >= 50000 ? 4 : 
                          totalPop >= 25000 ? 3 :
                          totalPop >= 15000 ? 2 : 1;
    addressableMarketQuality += densityQuality; // 4 points max
  }
  
  // Market balance quality (balanced demographics + strategic alignment)
  if (demographicScore > 0 && strategicScore > 0) {
    const balanceAlignment = 1 - Math.abs(demographicScore - strategicScore) / 100;
    const balanceQuality = balanceAlignment >= 0.8 ? 2 : balanceAlignment >= 0.6 ? 1.5 : 1;
    addressableMarketQuality += balanceQuality; // 2 points max
  }
  
  marketSizingScore += addressableMarketQuality;
  
  // 4. REVENUE POTENTIAL COMPONENT (10 points)
  // Income levels and spending power indicators for revenue estimation
  let revenuePotential = 0;
  
  // Income-population revenue matrix
  if (medianIncome > 0 && totalPop > 0) {
    // Calculate potential market revenue index
    const incomeIndex = Math.min(medianIncome / 80000, 2); // Income factor (cap at 2x)
    const populationIndex = Math.min(totalPop / 50000, 3); // Population factor (cap at 3x)
    const revenueIndex = Math.sqrt(incomeIndex * populationIndex); // Geometric mean for balance
    const revenueScore = Math.min(revenueIndex, 2) * 4; // 4 points max (up to 2x multiplier)
    revenuePotential += revenueScore;
  }
  
  // Nike penetration revenue opportunity
  if (nikeShare > 0 && medianIncome > 0) {
    // Moderate Nike share with good income = revenue opportunity
    const optimalNikeRange = nikeShare >= 10 && nikeShare <= 25;
    const incomeSupport = medianIncome >= 50000;
    const revenueOpportunity = (optimalNikeRange && incomeSupport) ? 3 : 
                              (optimalNikeRange || incomeSupport) ? 2 : 1;
    revenuePotential += revenueOpportunity; // 3 points max
  }
  
  // Strategic revenue alignment
  if (strategicScore > 0 && medianIncome > 0) {
    const strategicRevenue = (strategicScore / 100) * (medianIncome / 100000) * 3; // 3 points max
    revenuePotential += Math.min(strategicRevenue, 3);
  }
  
  marketSizingScore += revenuePotential;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(marketSizingScore * 100) / 100));
}

// Helper function to calculate market sizing baselines
function calculateMarketSizingBaselines(records) {
  const metrics = {
    totalPopulations: [],
    medianIncomes: [],
    strategicScores: [],
    demographicScores: [],
    nikeShares: [],
    trendScores: []
  };
  
  // Extract values for baseline calculation
  records.forEach(record => {
    const totalPop = Number(record.total_population) || 0;
    const medianIncome = Number(record.median_income) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    
    if (totalPop > 0) metrics.totalPopulations.push(totalPop);
    if (medianIncome > 0) metrics.medianIncomes.push(medianIncome);
    if (strategicScore > 0) metrics.strategicScores.push(strategicScore);
    if (demographicScore > 0) metrics.demographicScores.push(demographicScore);
    if (nikeShare > 0) metrics.nikeShares.push(nikeShare);
    if (trendScore > 0) metrics.trendScores.push(trendScore);
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

// Calculate market sizing scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating market sizing scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateMarketSizingScore(record, marketSizingBaselines);
  record.market_sizing_score = score;
  
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

console.log('📏 Market Sizing Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Mega Market Opportunity (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Large Market Potential (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Medium Market Size (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Small Market Opportunity (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Limited Market Size (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Market Sizing Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 largest market opportunities
const topMarketSizing = correlationData.results
  .sort((a, b) => b.market_sizing_score - a.market_sizing_score)
  .slice(0, 15);

console.log('📏 Top 15 Largest Market Opportunities:');
topMarketSizing.forEach((record, index) => {
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  
  // Determine market size category
  let marketCategory = 'Standard';
  if (totalPop >= 150000 && medianIncome >= 80000) marketCategory = 'Mega Market';
  else if (totalPop >= 100000 && medianIncome >= 60000) marketCategory = 'Large Market';
  else if (totalPop >= 75000 || medianIncome >= 100000) marketCategory = 'Medium-Large';
  else if (totalPop >= 50000 || medianIncome >= 80000) marketCategory = 'Medium Market';
  else if (totalPop >= 25000) marketCategory = 'Small-Medium';
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.market_sizing_score.toFixed(1)} market score`);
  console.log(`      📏 ${marketCategory}: Pop ${totalPop.toLocaleString()}, Income $${medianIncome.toLocaleString()}, Strategic ${strategicScore.toFixed(1)}, Nike ${nikeShare.toFixed(1)}%`);
});

// Add market sizing metadata
correlationData.market_sizing_metadata = {
  scoring_methodology: {
    market_opportunity_size: '40% - Total addressable market size based on population and characteristics',
    growth_potential: '30% - Market growth trajectory and expansion opportunity',
    addressable_market_quality: '20% - Quality and characteristics of addressable market segment',
    revenue_potential: '10% - Income levels and spending power indicators'
  },
  market_sizing_baselines: {
    avg_population: marketSizingBaselines.totalPopulations.avg.toFixed(0),
    avg_median_income: marketSizingBaselines.medianIncomes.avg.toFixed(0),
    avg_strategic_score: marketSizingBaselines.strategicScores.avg.toFixed(2),
    avg_demographic_score: marketSizingBaselines.demographicScores.avg.toFixed(2),
    avg_nike_share: marketSizingBaselines.nikeShares.avg.toFixed(2) + '%',
    avg_trend_score: marketSizingBaselines.trendScores.avg.toFixed(2)
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_market_opportunities: topMarketSizing.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    market_sizing_score: record.market_sizing_score,
    population: record.total_population || 0,
    median_income: record.median_income || 0,
    strategic_score: record.strategic_value_score || 0,
    demographic_score: record.demographic_opportunity_score || 0,
    nike_share: Number(record.mp30034a_b_p) || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Market sizing scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`📏 All ${processedCount.toLocaleString()} records now include market_sizing_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created market_sizing_score for all records');
console.log('   2. ✅ Added market sizing metadata with opportunity baselines');
console.log('   3. 🔄 Create MarketSizingProcessor');
console.log('   4. 🔄 Test market sizing endpoint');