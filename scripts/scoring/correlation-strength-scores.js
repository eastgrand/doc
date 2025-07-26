/**
 * Correlation Strength Scoring Script
 * 
 * Calculates correlation strength scores for the correlation-analysis endpoint
 * by computing Pearson correlation coefficients between key variables and
 * adding correlation_strength_score field to each record.
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Starting Correlation Strength Scoring...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for correlation strength scoring...`);

// Define key variables for correlation analysis
const keyVariables = [
  'target_value',                    // Main target variable
  'demographic_opportunity_score',   // Demographic scoring
  'median_income',                  // Income levels
  'total_population',              // Population size
  'asian_population',              // Demographic segments
  'black_population',              // Demographic segments
  'white_population',              // Demographic segments
  'mp30034a_b_p'                   // Nike market share
];

// Helper function to calculate Pearson correlation coefficient
function calculatePearsonCorrelation(x, y) {
  const n = x.length;
  if (n !== y.length || n === 0) return 0;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// Extract valid numeric values for each variable
console.log('🔄 Extracting numeric data for correlation analysis...');
const variableData = {};

keyVariables.forEach(variable => {
  variableData[variable] = correlationData.results
    .map(record => {
      const value = Number(record[variable]);
      return isNaN(value) ? null : value;
    })
    .filter(value => value !== null);
  
  console.log(`   ${variable}: ${variableData[variable].length} valid values`);
});

// Calculate correlation matrix
console.log('📈 Calculating correlation matrix...');
const correlationMatrix = {};

keyVariables.forEach(var1 => {
  correlationMatrix[var1] = {};
  keyVariables.forEach(var2 => {
    if (var1 === var2) {
      correlationMatrix[var1][var2] = 1.0;
    } else {
      // Find overlapping valid indices
      const validIndices = [];
      correlationData.results.forEach((record, index) => {
        const val1 = Number(record[var1]);
        const val2 = Number(record[var2]);
        if (!isNaN(val1) && !isNaN(val2)) {
          validIndices.push(index);
        }
      });
      
      if (validIndices.length < 10) {
        correlationMatrix[var1][var2] = 0; // Insufficient data
      } else {
        const x = validIndices.map(i => Number(correlationData.results[i][var1]));
        const y = validIndices.map(i => Number(correlationData.results[i][var2]));
        correlationMatrix[var1][var2] = calculatePearsonCorrelation(x, y);
      }
    }
  });
});

// Display correlation matrix
console.log('📊 Correlation Matrix (strongest correlations):');
const strongCorrelations = [];

keyVariables.forEach(var1 => {
  keyVariables.forEach(var2 => {
    if (var1 < var2) { // Avoid duplicates
      const correlation = correlationMatrix[var1][var2];
      const absCorrelation = Math.abs(correlation);
      if (absCorrelation > 0.3) { // Only show meaningful correlations
        strongCorrelations.push({
          var1,
          var2,
          correlation: correlation.toFixed(3),
          strength: absCorrelation
        });
      }
    }
  });
});

strongCorrelations
  .sort((a, b) => b.strength - a.strength)
  .slice(0, 10)
  .forEach(corr => {
    console.log(`   ${corr.var1} ↔ ${corr.var2}: ${corr.correlation}`);
  });

// Calculate correlation strength score for each record
console.log('🔄 Calculating correlation strength scores for each record...');

function calculateCorrelationStrengthScore(record) {
  let totalStrength = 0;
  let correlationCount = 0;
  
  // Calculate how well this record fits the overall correlation patterns
  keyVariables.forEach(var1 => {
    keyVariables.forEach(var2 => {
      if (var1 !== var2) {
        const val1 = Number(record[var1]);
        const val2 = Number(record[var2]);
        
        if (!isNaN(val1) && !isNaN(val2)) {
          const expectedCorrelation = correlationMatrix[var1][var2];
          
          if (Math.abs(expectedCorrelation) > 0.1) { // Only consider meaningful correlations
            // Normalize values to 0-1 range for comparison
            const maxVal1 = Math.max(...variableData[var1]);
            const minVal1 = Math.min(...variableData[var1]);
            const maxVal2 = Math.max(...variableData[var2]);
            const minVal2 = Math.min(...variableData[var2]);
            
            if (maxVal1 !== minVal1 && maxVal2 !== minVal2) {
              const norm1 = (val1 - minVal1) / (maxVal1 - minVal1);
              const norm2 = (val2 - minVal2) / (maxVal2 - minVal2);
              
              // Calculate how well this record follows the expected correlation
              let recordCorrelationFit;
              if (expectedCorrelation > 0) {
                // Positive correlation: both should be high or both low
                recordCorrelationFit = 1 - Math.abs(norm1 - norm2);
              } else {
                // Negative correlation: one high, one low
                recordCorrelationFit = Math.abs(norm1 - norm2);
              }
              
              // Weight by the strength of the expected correlation
              const weight = Math.abs(expectedCorrelation);
              totalStrength += recordCorrelationFit * weight;
              correlationCount += weight;
            }
          }
        }
      }
    });
  });
  
  if (correlationCount === 0) return 50; // Default moderate score
  
  const averageStrength = totalStrength / correlationCount;
  return Math.max(0, Math.min(100, averageStrength * 100));
}

// Apply correlation strength scoring to all records
let processedCount = 0;
const scoreStats = {
  min: 100,
  max: 0,
  sum: 0,
  scores: []
};

correlationData.results.forEach((record, index) => {
  const score = calculateCorrelationStrengthScore(record);
  record.correlation_strength_score = score;
  
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

console.log('📈 Correlation Strength Scoring Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Score range: ${scoreStats.min.toFixed(1)} - ${scoreStats.max.toFixed(1)}`);
console.log(`   📊 Average score: ${avgScore.toFixed(1)}`);
console.log(`   📊 Median score: ${medianScore.toFixed(1)}`);

// Show score distribution
const scoreRanges = {
  'Strong Correlation (80-100)': scoreStats.scores.filter(s => s >= 80).length,
  'Moderate Correlation (60-79)': scoreStats.scores.filter(s => s >= 60 && s < 80).length,
  'Weak Correlation (40-59)': scoreStats.scores.filter(s => s >= 40 && s < 60).length,
  'Poor Correlation (20-39)': scoreStats.scores.filter(s => s >= 20 && s < 40).length,
  'No Correlation (0-19)': scoreStats.scores.filter(s => s < 20).length
};

console.log('📊 Correlation Strength Distribution:');
Object.entries(scoreRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Show top 10 areas with strongest correlation patterns
const topCorrelated = correlationData.results
  .sort((a, b) => b.correlation_strength_score - a.correlation_strength_score)
  .slice(0, 10);

console.log('🏆 Top 10 Areas with Strongest Correlation Patterns:');
topCorrelated.forEach((record, index) => {
  const income = Number(record.median_income) || 0;
  const target = Number(record.target_value) || 0;
  console.log(`   ${index + 1}. ${record.DESCRIPTION || record.ID}: ${record.correlation_strength_score.toFixed(1)} score (Target: ${target.toFixed(1)}, Income: $${(income/1000).toFixed(0)}K)`);
});

// Add correlation metadata to dataset
correlationData.correlation_metadata = {
  correlation_matrix: correlationMatrix,
  strong_correlations: strongCorrelations.slice(0, 5),
  score_statistics: {
    mean: avgScore,
    median: medianScore,
    min: scoreStats.min,
    max: scoreStats.max,
    distribution: scoreRanges
  },
  analysis_timestamp: new Date().toISOString(),
  key_variables: keyVariables
};

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Correlation strength scoring complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`📊 All ${processedCount.toLocaleString()} records now include correlation_strength_score field`);

console.log('\n📋 Next steps:');
console.log('   1. ✅ Created correlation_strength_score for all records');
console.log('   2. ✅ Added correlation matrix and metadata');
console.log('   3. 🔄 Update CoreAnalysisProcessor for correlation analysis');
console.log('   4. 🔄 Test correlation analysis endpoint');