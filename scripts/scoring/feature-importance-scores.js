/**
 * Feature Importance Scoring Script
 * 
 * Creates feature importance scores for the feature-importance-ranking endpoint by
 * aggregating SHAP values to identify which market factors most strongly contribute
 * to Nike's success.
 * 
 * Formula: Absolute SHAP Impact (40%) + Positive Contribution (30%) + Feature Diversity (20%) + Consistency (10%)
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Starting Feature Importance Scoring...');

// Load the feature importance data directly
const dataPath = path.join(__dirname, '../../public/data/endpoints/feature-importance-ranking.json');
const featureData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!featureData || !featureData.results) {
  console.error('❌ feature-importance-ranking data not found');
  process.exit(1);
}

console.log(`📊 Processing ${featureData.results.length} records for feature importance scoring...`);

// Get the top feature importances for reference
const topFeatures = featureData.feature_importance
  .slice(0, 10)
  .map(f => ({
    feature: f.feature,
    importance: f.importance,
    normalized: f.importance / featureData.feature_importance[0].importance
  }));

console.log('🎯 Top 10 Important Features:');
topFeatures.forEach((f, i) => {
  console.log(`   ${i + 1}. ${f.feature}: ${f.importance.toFixed(2)} (${(f.normalized * 100).toFixed(1)}%)`);
});

// Calculate feature importance scores for each record
function calculateFeatureImportanceScore(record) {
  let totalShapImpact = 0;
  let positiveContribution = 0;
  let featureCount = 0;
  let maxShapValue = 0;
  
  // Analyze all SHAP values in the record
  Object.entries(record).forEach(([key, value]) => {
    if (key.startsWith('shap_') && typeof value === 'number') {
      featureCount++;
      const absValue = Math.abs(value);
      totalShapImpact += absValue;
      maxShapValue = Math.max(maxShapValue, absValue);
      
      // Track positive contributions (factors that increase Nike success)
      if (value > 0) {
        positiveContribution += value;
      }
    }
  });
  
  // Normalize values
  const avgShapImpact = featureCount > 0 ? totalShapImpact / featureCount : 0;
  const diversityScore = featureCount > 0 ? (1 - (maxShapValue / totalShapImpact)) : 0;
  
  // Calculate component scores
  
  // 1. ABSOLUTE SHAP IMPACT (40 points)
  // Areas with high overall feature importance - adjusted scale for better differentiation
  const impactScore = Math.min(40, (totalShapImpact / 1000) * 40);
  
  // 2. POSITIVE CONTRIBUTION (30 points)
  // Areas where features positively contribute to Nike success
  const contributionScore = Math.min(30, (positiveContribution / 500) * 30);
  
  // 3. FEATURE DIVERSITY (20 points)
  // Areas where multiple features contribute (not dominated by single factor)
  const diversityPoints = diversityScore * 20;
  
  // 4. CONSISTENCY (10 points)
  // Bonus for areas with balanced positive/negative contributions
  const balanceRatio = totalShapImpact > 0 ? Math.abs(positiveContribution) / totalShapImpact : 0;
  const consistencyScore = (1 - Math.abs(0.5 - balanceRatio) * 2) * 10;
  
  // Calculate total score
  const totalScore = impactScore + contributionScore + diversityPoints + consistencyScore;
  
  return {
    feature_importance_score: Math.round(totalScore * 10) / 10,
    components: {
      impact: Math.round(impactScore * 10) / 10,
      contribution: Math.round(contributionScore * 10) / 10,
      diversity: Math.round(diversityPoints * 10) / 10,
      consistency: Math.round(consistencyScore * 10) / 10
    },
    metrics: {
      total_shap_impact: Math.round(totalShapImpact * 100) / 100,
      positive_contribution: Math.round(positiveContribution * 100) / 100,
      feature_count: featureCount,
      avg_shap_impact: Math.round(avgShapImpact * 100) / 100
    }
  };
}

// Process all records
let totalScore = 0;
let minScore = 100;
let maxScore = 0;
let microserviceScoreCount = 0;

const scoredResults = featureData.results.map(record => {
  // Check if microservice already provided location-specific feature_importance_score
  if (record.feature_importance_score && typeof record.feature_importance_score === 'number') {
    microserviceScoreCount++;
    
    // Use microservice score but still calculate our detailed metrics for analysis
    const clientSideScoring = calculateFeatureImportanceScore(record);
    
    totalScore += record.feature_importance_score;
    minScore = Math.min(minScore, record.feature_importance_score);
    maxScore = Math.max(maxScore, record.feature_importance_score);
    
    return {
      ...record,
      // Keep microservice score
      feature_importance_score: record.feature_importance_score,
      // Add our detailed breakdown for debugging/analysis
      client_side_components: clientSideScoring.components,
      client_side_metrics: clientSideScoring.metrics,
      score_source: 'microservice_location_specific'
    };
  } else {
    // Fallback to client-side calculation
    const scoring = calculateFeatureImportanceScore(record);
    
    totalScore += scoring.feature_importance_score;
    minScore = Math.min(minScore, scoring.feature_importance_score);
    maxScore = Math.max(maxScore, scoring.feature_importance_score);
    
    return {
      ...record,
      ...scoring,
      score_source: 'client_side_calculation'
    };
  }
});

// Calculate statistics
const avgScore = totalScore / scoredResults.length;

console.log('\n📊 Feature Importance Score Statistics:');
console.log(`   Average Score: ${avgScore.toFixed(1)}`);
console.log(`   Min Score: ${minScore.toFixed(1)}`);
console.log(`   Max Score: ${maxScore.toFixed(1)}`);
console.log(`   Score Range: ${(maxScore - minScore).toFixed(1)}`);

// Show score distribution
const distribution = {
  '0-20': 0,
  '20-40': 0,
  '40-60': 0,
  '60-80': 0,
  '80-100': 0
};

scoredResults.forEach(record => {
  const score = record.feature_importance_score;
  if (score < 20) distribution['0-20']++;
  else if (score < 40) distribution['20-40']++;
  else if (score < 60) distribution['40-60']++;
  else if (score < 80) distribution['60-80']++;
  else distribution['80-100']++;
});

console.log('\n📊 Score Distribution:');
Object.entries(distribution).forEach(([range, count]) => {
  const percentage = (count / scoredResults.length * 100).toFixed(1);
  console.log(`   ${range}: ${count} records (${percentage}%)`);
});

// Find top scoring areas
const topAreas = scoredResults
  .sort((a, b) => b.feature_importance_score - a.feature_importance_score)
  .slice(0, 10);

console.log('\n🏆 Top 10 Areas by Feature Importance Score:');
topAreas.forEach((area, index) => {
  console.log(`   ${index + 1}. ${area.ID} - Score: ${area.feature_importance_score.toFixed(1)} (${area.score_source || 'unknown'})`);
  
  // Show components if available (client-side calculation)
  if (area.components) {
    console.log(`      Impact: ${area.components.impact}, Contribution: ${area.components.contribution}, Diversity: ${area.components.diversity}`);
  } else if (area.client_side_components) {
    console.log(`      Client components: Impact: ${area.client_side_components.impact}, Contribution: ${area.client_side_components.contribution}`);
  } else {
    console.log(`      Microservice calculation - detailed components not available`);
  }
});

// Update the original data with scores
const updatedData = {
  ...featureData,
  results: scoredResults,
  scoring_metadata: {
    generated_at: new Date().toISOString(),
    script: 'feature-importance-scores.js',
    formula: 'Absolute SHAP Impact (40%) + Positive Contribution (30%) + Feature Diversity (20%) + Consistency (10%)',
    statistics: {
      average_score: avgScore,
      min_score: minScore,
      max_score: maxScore,
      score_distribution: distribution
    }
  }
};

// Write the updated data back
fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));

// Report scoring method used
if (microserviceScoreCount > 0) {
  console.log(`\n🔥 Location-specific scoring results:`);
  console.log(`   🎯 Microservice location-specific scores: ${microserviceScoreCount}/${scoredResults.length} records`);
  console.log(`   📊 Client-side fallback scores: ${scoredResults.length - microserviceScoreCount}/${scoredResults.length} records`);
  if (microserviceScoreCount === scoredResults.length) {
    console.log(`   ✅ All records using microservice location-specific feature importance!`);
  }
} else {
  console.log(`\n📊 Using client-side scoring for all ${scoredResults.length} records`);
}

console.log('\n✅ Feature importance scoring complete!');
console.log(`   Updated ${scoredResults.length} records with feature_importance_score`);