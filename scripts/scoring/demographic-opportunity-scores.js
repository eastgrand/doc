/**
 * Demographic Opportunity Scoring Script
 * 
 * Calculates demographic opportunity scores (0-100 scale) for athletic brand targeting
 * based on population characteristics, income levels, diversity, and market potential.
 * Updates the correlation_analysis dataset with demographic_opportunity_score field.
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Starting Demographic Opportunity Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset (which contains demographic data)
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for demographic opportunity scoring...`);

// Demographic scoring formula based on athletic brand research:
// - Target Age: 16-50 (peak 25-40) - athletic engagement highest in this range
// - Target Income: $35K-$150K (peak $50K-$100K) - athletic spending sweet spot  
// - Population Size: Balanced (not too small/large) - market efficiency
// - Diversity: Moderate diversity creates broader appeal

function calculateDemographicOpportunityScore(record) {
  let score = 0;
  
  // Extract demographic data
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  const whitePop = Number(record.white_population) || 0;
  const asianPop = Number(record.asian_population) || 0;
  const blackPop = Number(record.black_population) || 0;
  
  // Calculate population percentages for diversity
  const whitePercent = totalPop > 0 ? (whitePop / totalPop) * 100 : 0;
  const asianPercent = totalPop > 0 ? (asianPop / totalPop) * 100 : 0;
  const blackPercent = totalPop > 0 ? (blackPop / totalPop) * 100 : 0;
  const otherPercent = Math.max(0, 100 - whitePercent - asianPercent - blackPercent);
  
  // 1. INCOME COMPONENT (0-35 points) - Athletic spending capability
  // Peak at $50K-$100K, good range $35K-$150K
  if (medianIncome > 0) {
    if (medianIncome >= 50000 && medianIncome <= 100000) {
      // Peak athletic spending range
      score += 35;
    } else if (medianIncome >= 35000 && medianIncome <= 150000) {
      // Good athletic spending range - scale based on distance from peak
      const distanceFromPeak = Math.min(
        Math.abs(medianIncome - 50000),
        Math.abs(medianIncome - 100000)
      );
      score += Math.max(20, 35 - (distanceFromPeak / 15000) * 15);
    } else if (medianIncome >= 25000 && medianIncome < 35000) {
      // Lower but viable income
      score += 10 + ((medianIncome - 25000) / 10000) * 10;
    } else if (medianIncome > 150000 && medianIncome <= 200000) {
      // High income - still good but may be over-premium focused
      score += 25;
    } else if (medianIncome > 200000) {
      // Very high income - niche luxury market
      score += 15;
    }
    // Below $25K gets 0 points (limited athletic spending)
  }
  
  // 2. POPULATION SIZE COMPONENT (0-25 points) - Market efficiency
  // Optimal range: 15K-80K people (efficient market size)
  if (totalPop > 0) {
    if (totalPop >= 15000 && totalPop <= 80000) {
      // Optimal market size - efficient penetration
      score += 25;
    } else if (totalPop >= 5000 && totalPop < 15000) {
      // Smaller market - scale up
      score += 10 + ((totalPop - 5000) / 10000) * 15;
    } else if (totalPop > 80000 && totalPop <= 200000) {
      // Large market - scale down slightly (harder penetration)
      score += 20;
    } else if (totalPop > 200000) {
      // Very large market - competitive but harder to penetrate
      score += 15;
    } else if (totalPop >= 1000 && totalPop < 5000) {
      // Small market - limited potential
      score += 5;
    }
    // Below 1K gets 0 points
  }
  
  // 3. DIVERSITY COMPONENT (0-20 points) - Market appeal breadth
  // Moderate diversity creates broader athletic brand appeal
  const diversityScore = calculateDiversityScore(whitePercent, asianPercent, blackPercent, otherPercent);
  score += diversityScore * 20;
  
  // 4. MARKET DENSITY COMPONENT (0-20 points) - Athletic infrastructure potential
  // Based on population density and income interaction
  if (totalPop > 0 && medianIncome > 0) {
    // Athletic brands perform well in suburban/urban areas with good income
    const densityIncomeInteraction = calculateDensityIncomeScore(totalPop, medianIncome);
    score += densityIncomeInteraction * 20;
  }
  
  // Ensure score is in 0-100 range
  return Math.max(0, Math.min(100, Math.round(score * 100) / 100));
}

function calculateDiversityScore(whitePercent, asianPercent, blackPercent, otherPercent) {
  // Calculate Herfindahl-Hirschman Index for diversity
  // More diverse = better for athletic brands (broader appeal)
  const hhi = Math.pow(whitePercent/100, 2) + Math.pow(asianPercent/100, 2) + 
              Math.pow(blackPercent/100, 2) + Math.pow(otherPercent/100, 2);
  
  // Convert to diversity score (1 - HHI), normalized
  const diversityIndex = 1 - hhi;
  
  // Athletic brands benefit from moderate to high diversity
  // Peak diversity gives full points, very low diversity gets fewer points
  if (diversityIndex >= 0.4) {
    return 1.0; // High diversity - full points
  } else if (diversityIndex >= 0.2) {
    return 0.5 + (diversityIndex - 0.2) / 0.2 * 0.5; // Moderate diversity
  } else {
    return diversityIndex / 0.2 * 0.5; // Low diversity
  }
}

function calculateDensityIncomeScore(population, income) {
  // Athletic brands perform well in areas with good income and reasonable density
  // Suburban sweet spot: not too rural, not too urban
  
  let densityScore = 0;
  
  // Population-based density proxy
  if (population >= 20000 && population <= 100000) {
    densityScore = 1.0; // Optimal suburban/small city
  } else if (population >= 10000 && population < 20000) {
    densityScore = 0.8; // Good suburban
  } else if (population > 100000 && population <= 300000) {
    densityScore = 0.9; // Good urban
  } else if (population > 300000) {
    densityScore = 0.7; // Large urban (competitive)
  } else if (population >= 5000 && population < 10000) {
    densityScore = 0.6; // Small town
  } else {
    densityScore = 0.3; // Very rural or very dense
  }
  
  // Income multiplier
  let incomeMultiplier = 1.0;
  if (income >= 60000 && income <= 120000) {
    incomeMultiplier = 1.0; // Perfect income range
  } else if (income >= 40000 && income < 60000) {
    incomeMultiplier = 0.9; // Good income
  } else if (income > 120000 && income <= 180000) {
    incomeMultiplier = 0.95; // High income
  } else if (income >= 25000 && income < 40000) {
    incomeMultiplier = 0.7; // Lower income
  } else {
    incomeMultiplier = 0.5; // Very low or very high income
  }
  
  return densityScore * incomeMultiplier;
}

// Calculate scores for all records
let processedCount = 0;
let scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

console.log('🔄 Calculating demographic opportunity scores...');

correlationData.results.forEach((record, index) => {
  const score = calculateDemographicOpportunityScore(record);
  record.demographic_opportunity_score = score;
  
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

console.log('📈 Demographic Opportunity Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Excellent (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Good (60-79)': scoreStats.scores.filter(s => s >= 60 && s < 80).length,
  'Moderate (40-59)': scoreStats.scores.filter(s => s >= 40 && s < 60).length,
  'Fair (20-39)': scoreStats.scores.filter(s => s >= 20 && s < 40).length,
  'Poor (0-19)': scoreStats.scores.filter(s => s < 20).length
};

console.log('📊 Score Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 10 demographic opportunities
const topOpportunities = correlationData.results
  .sort((a, b) => b.demographic_opportunity_score - a.demographic_opportunity_score)
  .slice(0, 10);

console.log('🏆 Top 10 Demographic Opportunities:');
topOpportunities.forEach((record, index) => {
  const income = Number(record.median_income) || 0;
  const population = Number(record.total_population) || 0;
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.demographic_opportunity_score.toFixed(1)} score ($${(income/1000).toFixed(0)}K income, ${(population/1000).toFixed(0)}K pop)`);
});

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Demographic opportunity scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🎯 All ${processedCount.toLocaleString()} records now include demographic_opportunity_score field`);

// Update completion status
console.log('\n📋 Next steps:');
console.log('   1. ✅ Created demographic_opportunity_score for all records');
console.log('   2. 🔄 Update DemographicDataProcessor to use pre-calculated scores');
console.log('   3. 🔄 Verify target variable consistency');
console.log('   4. 🔄 Test demographic analysis endpoint');