/**
 * Brand Analysis Scoring Script
 * 
 * Creates brand analysis scores by analyzing Nike brand performance, market positioning,
 * competitive landscape, and brand strength indicators to identify markets with the
 * strongest brand opportunities and challenges.
 * 
 * Formula: Nike Brand Strength (40%) + Market Position Quality (30%) + Competitive Brand Landscape (20%) + Brand Growth Potential (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('🏃 Starting Brand Analysis Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for brand analysis scoring...`);

function calculateBrandScore(record) {
  const nikeShare = Number(record.mp30034a_b_p) || 0;
  const strategicScore = Number(record.strategic_value_score) || 0;
  const competitiveScore = Number(record.competitive_advantage_score) || 0;
  const demographicScore = Number(record.demographic_opportunity_score) || 0;
  const trendScore = Number(record.trend_strength_score) || 0;
  const totalPop = Number(record.total_population) || 0;
  const medianIncome = Number(record.median_income) || 0;
  
  let brandScore = 0;
  
  // 1. Nike Brand Strength (40 points)
  if (nikeShare > 0) {
    let brandStrength = 0;
    if (nikeShare >= 35) brandStrength = 40; // Dominant brand presence
    else if (nikeShare >= 25) brandStrength = 35; // Strong brand presence
    else if (nikeShare >= 20) brandStrength = 30; // Good brand presence
    else if (nikeShare >= 15) brandStrength = 25; // Moderate brand presence
    else if (nikeShare >= 10) brandStrength = 20; // Emerging brand presence
    else if (nikeShare >= 5) brandStrength = 15; // Limited brand presence
    else brandStrength = 10; // Minimal brand presence
    
    brandScore += brandStrength;
  }
  
  // 2. Market Position Quality (30 points)
  const positionQuality = (strategicScore / 100) * 15 + (demographicScore / 100) * 15;
  brandScore += positionQuality;
  
  // 3. Competitive Brand Landscape (20 points)
  const competitiveLandscape = Math.min(competitiveScore / 10, 1) * 20;
  brandScore += competitiveLandscape;
  
  // 4. Brand Growth Potential (10 points)
  const growthPotential = (trendScore / 100) * 10;
  brandScore += growthPotential;
  
  return Math.max(0, Math.min(100, Math.round(brandScore * 100) / 100));
}

// Calculate scores
let processedCount = 0;
const scoreStats = { min: 100, max: 0, sum: 0, scores: [] };

correlationData.results.forEach((record, index) => {
  const score = calculateBrandScore(record);
  record.brand_analysis_score = score;
  
  scoreStats.min = Math.min(scoreStats.min, score);
  scoreStats.max = Math.max(scoreStats.max, score);
  scoreStats.sum += score;
  scoreStats.scores.push(score);
  processedCount++;
});

const avgScore = scoreStats.sum / processedCount;
console.log(`🏃 Brand Analysis Complete: Range ${scoreStats.min.toFixed(1)}-${scoreStats.max.toFixed(1)}, Avg ${avgScore.toFixed(1)}`);

// Save data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`✅ Brand analysis scores added to all ${processedCount.toLocaleString()} records`);