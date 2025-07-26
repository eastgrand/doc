/**
 * Comparative Analysis Scoring Script
 * 
 * Creates comparative analysis scores for the comparative analysis endpoint by analyzing
 * relative performance between different brands, regions, or market characteristics
 * to identify competitive advantages and positioning opportunities.
 * 
 * Formula: Brand Performance Gap (35%) + Market Position Strength (30%) + Competitive Dynamics (25%) + Growth Differential (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('⚖️ Starting Comparative Analysis Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for comparative analysis scoring...`);

// First pass: Calculate comparative baselines for relative analysis
const comparativeBaselines = calculateComparativeBaselines(correlationData.results);

// Comparative analysis scoring formula considers:
// 1. Brand Performance Gap (35%) - Nike vs competitors performance differential
// 2. Market Position Strength (30%) - Relative market positioning and dominance
// 3. Competitive Dynamics (25%) - Competitive pressure and market share dynamics
// 4. Growth Differential (10%) - Relative growth potential and trend momentum

function calculateComparativeScore(record, baselines) {
  // Extract relevant metrics for comparative analysis
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0; // Adidas market share
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;  
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let comparativeScore = 0;
  
  // 1. BRAND PERFORMANCE GAP COMPONENT (35 points)
  // Nike vs competitors performance differential
  let brandPerformanceGap = 0;
  
  // Nike vs Adidas direct comparison
  if (nikeShare > 0 || adidasShare > 0) {
    const nikeDominance = nikeShare - adidasShare; // Positive = Nike leads, Negative = Adidas leads
    const totalBrandShare = nikeShare + adidasShare;
    
    // Strong Nike advantage
    if (nikeDominance >= 10) {
      brandPerformanceGap += 15; // 15 points for strong Nike lead
    } else if (nikeDominance >= 5) {
      brandPerformanceGap += 12; // 12 points for moderate Nike lead
    } else if (nikeDominance >= 0) {
      brandPerformanceGap += 8; // 8 points for slight Nike lead
    }
    
    // Market share magnitude bonus (higher total share = more competitive market)
    if (totalBrandShare >= 40) {
      brandPerformanceGap += 10; // 10 points for highly competitive market
    } else if (totalBrandShare >= 25) {
      brandPerformanceGap += 6; // 6 points for moderately competitive market
    } else if (totalBrandShare >= 15) {
      brandPerformanceGap += 3; // 3 points for developing market
    }
    
    // Nike market share strength relative to baseline
    const nikePerformanceVsBaseline = nikeShare - baselines.avgNikeShare;
    if (nikePerformanceVsBaseline > 0) {
      brandPerformanceGap += Math.min(nikePerformanceVsBaseline / 2, 10); // Up to 10 points for above-average Nike performance
    }
  }
  
  comparativeScore += brandPerformanceGap;
  
  // 2. MARKET POSITION STRENGTH COMPONENT (30 points)
  // Relative market positioning and dominance
  let marketPositionStrength = 0;
  
  // Strategic positioning relative to market
  if (strategicScore > 0) {
    const strategicRelativeToBaseline = strategicScore - baselines.avgStrategicScore;
    if (strategicRelativeToBaseline > 0) {
      marketPositionStrength += Math.min(strategicRelativeToBaseline / 3, 12); // Up to 12 points for above-average strategic position
    }
  }
  
  // Competitive advantage relative positioning
  if (competitiveScore > 0) {
    const competitiveRelativeToBaseline = competitiveScore - baselines.avgCompetitiveScore;
    if (competitiveRelativeToBaseline > 0) {
      marketPositionStrength += Math.min(competitiveRelativeToBaseline / 2, 8); // Up to 8 points for above-average competitive position
    }
  } else if (strategicScore > baselines.avgStrategicScore) {
    // Strategic advantage without competitive score (untapped potential)
    marketPositionStrength += 5; // 5 points for strategic advantage without competition
  }
  
  // Market size positioning advantage
  if (totalPop > 0) {
    const popRelativeToBaseline = totalPop - baselines.avgTotalPop;
    if (popRelativeToBaseline > 0) {
      const popAdvantage = Math.min(Math.log(popRelativeToBaseline + 1) / 2, 10); // Up to 10 points for market size advantage
      marketPositionStrength += popAdvantage;
    }
  }
  
  comparativeScore += marketPositionStrength;
  
  // 3. COMPETITIVE DYNAMICS COMPONENT (25 points)
  // Competitive pressure and market share dynamics
  let competitiveDynamics = 0;
  
  // Market competitiveness level
  const totalBrandPresence = nikeShare + adidasShare;
  const marketGap = Math.max(0, 100 - totalBrandPresence); // Untapped market potential
  
  // Competitive intensity scoring
  if (totalBrandPresence >= 45) {
    competitiveDynamics += 8; // High competitive intensity market
  } else if (totalBrandPresence >= 30) {
    competitiveDynamics += 12; // Moderate competitive intensity with growth potential
  } else if (totalBrandPresence >= 15) {
    competitiveDynamics += 15; // Developing market with high potential
  } else if (totalBrandPresence > 0) {
    competitiveDynamics += 10; // Early stage market
  }
  
  // Nike's competitive position strength
  if (nikeShare > 0 && adidasShare > 0) {
    const nikeCompetitiveRatio = nikeShare / (nikeShare + adidasShare);
    if (nikeCompetitiveRatio >= 0.65) {
      competitiveDynamics += 8; // Nike dominance
    } else if (nikeCompetitiveRatio >= 0.55) {
      competitiveDynamics += 6; // Nike advantage
    } else if (nikeCompetitiveRatio >= 0.45) {
      competitiveDynamics += 4; // Balanced competition
    } else {
      competitiveDynamics += 2; // Nike disadvantage but present
    }
  } else if (nikeShare > 0) {
    competitiveDynamics += 5; // Nike presence without direct Adidas competition
  }
  
  // Market gap opportunity
  if (marketGap >= 70) {
    competitiveDynamics += 2; // Very high untapped potential
  } else if (marketGap >= 50) {
    competitiveDynamics += 1; // High untapped potential
  }
  
  comparativeScore += competitiveDynamics;
  
  // 4. GROWTH DIFFERENTIAL COMPONENT (10 points)
  // Relative growth potential and trend momentum
  let growthDifferential = 0;
  
  // Trend strength relative to baseline
  if (trendScore > 0) {
    const trendRelativeToBaseline = trendScore - baselines.avgTrendScore;
    if (trendRelativeToBaseline > 0) {
      growthDifferential += Math.min(trendRelativeToBaseline / 5, 5); // Up to 5 points for above-average trend strength
    }
  }
  
  // Demographic growth potential relative to baseline
  if (demographicScore > 0) {
    const demoRelativeToBaseline = demographicScore - baselines.avgDemographicScore;
    if (demoRelativeToBaseline > 0) {
      growthDifferential += Math.min(demoRelativeToBaseline / 10, 3); // Up to 3 points for above-average demographic opportunity
    }
  }
  
  // Income growth indicator
  if (medianIncome > baselines.avgMedianIncome) {
    const incomeAdvantage = (medianIncome - baselines.avgMedianIncome) / baselines.avgMedianIncome;
    growthDifferential += Math.min(incomeAdvantage * 2, 2); // Up to 2 points for income advantage
  }
  
  comparativeScore += growthDifferential;
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(comparativeScore * 100) / 100));
}

// Helper function to calculate comparative baselines
function calculateComparativeBaselines(records) {
  const metrics = {
    nikeShare: [],
    adidasShare: [],
    strategicScore: [],
    competitiveScore: [],
    demographicScore: [],
    trendScore: [],
    totalPop: [],
    medianIncome: []
  };
  
  // Extract all values for baseline calculation
  records.forEach(record => {
    const nikeShare = Number(record.mp30034a_b_p) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const competitiveScore = Number(record.competitive_advantage_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const trendScore = Number(record.trend_strength_score) || 0;
    const totalPop = Number(record.total_population) || 0;
    const medianIncome = Number(record.median_income) || 0;
    
    if (nikeShare > 0) metrics.nikeShare.push(nikeShare);
    if (adidasShare > 0) metrics.adidasShare.push(adidasShare);
    if (strategicScore > 0) metrics.strategicScore.push(strategicScore);
    if (competitiveScore > 0) metrics.competitiveScore.push(competitiveScore);
    if (demographicScore > 0) metrics.demographicScore.push(demographicScore);
    if (trendScore > 0) metrics.trendScore.push(trendScore);
    if (totalPop > 0) metrics.totalPop.push(totalPop);
    if (medianIncome > 0) metrics.medianIncome.push(medianIncome);
  });
  
  // Calculate averages for baseline comparison
  const baselines = {};
  
  Object.keys(metrics).forEach(key => {
    const values = metrics[key];
    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      baselines[`avg${key.charAt(0).toUpperCase() + key.slice(1)}`] = avg;
    } else {
      baselines[`avg${key.charAt(0).toUpperCase() + key.slice(1)}`] = 0;
    }
  });
  
  return baselines;
}

// Calculate comparative analysis scores
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating comparative analysis scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateComparativeScore(record, comparativeBaselines);
  record.comparative_analysis_score = score;
  
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

console.log('⚖️ Comparative Analysis Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Exceptional Comparative Advantage (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Strong Comparative Position (65-79)': scoreStats.scores.filter(s => s >= 65 && s < 80).length,
  'Good Comparative Performance (50-64)': scoreStats.scores.filter(s => s >= 50 && s < 65).length,
  'Moderate Comparative Standing (35-49)': scoreStats.scores.filter(s => s >= 35 && s < 50).length,
  'Weak Comparative Position (0-34)': scoreStats.scores.filter(s => s < 35).length
};

console.log('📊 Comparative Analysis Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 15 best comparative performance areas
const topComparative = correlationData.results
  .sort((a, b) => b.comparative_analysis_score - a.comparative_analysis_score)
  .slice(0, 15);

console.log('⚖️ Top 15 Best Comparative Performance Areas:');
topComparative.forEach((record, index) => {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const strategic = Number(record.strategic_value_score) || 0;
  const competitive = Number(record.competitive_advantage_score) || 0;
  const demographic = Number(record.demographic_opportunity_score) || 0;
  const nikeDominance = nikeShare - adidasShare;
  
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.comparative_analysis_score.toFixed(1)} comparative score`);
  console.log(`      📊 Nike: ${nikeShare.toFixed(1)}%, Adidas: ${adidasShare.toFixed(1)}%, Nike Lead: ${nikeDominance.toFixed(1)}%, Strategic: ${strategic.toFixed(1)}, Demo: ${demographic.toFixed(1)}`);
});

// Add comparative analysis metadata
correlationData.comparative_analysis_metadata = {
  scoring_methodology: {
    brand_performance_gap: '35% - Nike vs competitors performance differential',
    market_position_strength: '30% - Relative market positioning and dominance',
    competitive_dynamics: '25% - Competitive pressure and market share dynamics',
    growth_differential: '10% - Relative growth potential and trend momentum'
  },
  comparative_baselines: {
    avg_nike_share: comparativeBaselines.avgNikeShare.toFixed(2),
    avg_adidas_share: comparativeBaselines.avgAdidasShare.toFixed(2),
    avg_strategic_score: comparativeBaselines.avgStrategicScore.toFixed(2),
    avg_demographic_score: comparativeBaselines.avgDemographicScore.toFixed(2),
    nike_vs_adidas_baseline: (comparativeBaselines.avgNikeShare - comparativeBaselines.avgAdidasShare).toFixed(2)
  },
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  top_comparative_markets: topComparative.slice(0, 10).map(record => ({
    id: record.ID,
    name: record.DESCRIPTION,
    comparative_score: record.comparative_analysis_score,
    nike_share: Number(record.mp30034a_b_p) || 0,
    adidas_share: Number(record.value_MP30029A_B_P) || 0,
    nike_advantage: (Number(record.mp30034a_b_p) || 0) - (Number(record.value_MP30029A_B_P) || 0),
    strategic_score: record.strategic_value_score || 0
  })),
  analysis_timestamp: new Date().toISOString()
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Comparative analysis scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`⚖️ All ${processedCount.toLocaleString()} records now include comparative_analysis_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created comparative_analysis_score for all records');
console.log('   2. ✅ Added comparative analysis metadata with baseline comparisons');
console.log('   3. 🔄 Create ComparativeAnalysisProcessor');
console.log('   4. 🔄 Test comparative analysis endpoint');