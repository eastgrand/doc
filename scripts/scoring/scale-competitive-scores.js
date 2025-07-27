/**
 * Scale Competitive Analysis Scores Script
 * 
 * Multiplies all competitive_advantage_score values by 10 to convert from 0-10 scale to 0-100 scale
 * to match the scale used by other analysis endpoints.
 */

const fs = require('fs');
const path = require('path');

console.log('🔢 Starting Competitive Score Scaling...');

// Load the microservice data
const dataPath = path.join(__dirname, '../../public/data/microservice-export.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Access correlation_analysis dataset
const correlationData = data.datasets.correlation_analysis;
if (!correlationData || !correlationData.results) {
  console.error('❌ correlation_analysis dataset not found');
  process.exit(1);
}

console.log(`📊 Processing ${correlationData.results.length} records for competitive score scaling...`);

// Track statistics
let processedCount = 0;
const scoreStats = {
  originalMin: 100,
  originalMax: 0,
  scaledMin: 100,
  scaledMax: 0,
  originalScores: [],
  scaledScores: []
};

// Scale all competitive_advantage_score values
correlationData.results.forEach((record, index) => {
  const originalScore = record.competitive_advantage_score;
  
  if (originalScore !== null && originalScore !== undefined) {
    // Scale from 0-10 to 0-100
    const scaledScore = Math.round(originalScore * 10 * 100) / 100; // Round to 2 decimal places
    record.competitive_advantage_score = scaledScore;
    
    // Track statistics
    scoreStats.originalMin = Math.min(scoreStats.originalMin, originalScore);
    scoreStats.originalMax = Math.max(scoreStats.originalMax, originalScore);
    scoreStats.scaledMin = Math.min(scoreStats.scaledMin, scaledScore);
    scoreStats.scaledMax = Math.max(scoreStats.scaledMax, scaledScore);
    scoreStats.originalScores.push(originalScore);
    scoreStats.scaledScores.push(scaledScore);
    
    processedCount++;
  }
  
  if ((index + 1) % 500 === 0) {
    console.log(`   Processed ${index + 1}/${correlationData.results.length} records...`);
  }
});

// Calculate final statistics
const originalAvg = scoreStats.originalScores.reduce((a, b) => a + b, 0) / scoreStats.originalScores.length;
const scaledAvg = scoreStats.scaledScores.reduce((a, b) => a + b, 0) / scoreStats.scaledScores.length;

console.log('🔢 Competitive Score Scaling Statistics:');
console.log(`   📊 Records processed: ${processedCount.toLocaleString()}`);
console.log(`   📊 Original range: ${scoreStats.originalMin.toFixed(2)} - ${scoreStats.originalMax.toFixed(2)}`);
console.log(`   📊 Scaled range: ${scoreStats.scaledMin.toFixed(1)} - ${scoreStats.scaledMax.toFixed(1)}`);
console.log(`   📊 Original average: ${originalAvg.toFixed(2)}`);
console.log(`   📊 Scaled average: ${scaledAvg.toFixed(1)}`);

// Show sample conversions
console.log('📊 Sample Score Conversions:');
for (let i = 0; i < Math.min(5, scoreStats.originalScores.length); i++) {
  console.log(`   ${scoreStats.originalScores[i].toFixed(2)} → ${scoreStats.scaledScores[i].toFixed(1)}`);
}

// Show scaled score distribution
const scaledRanges = {
  'Exceptional Competitive Advantage (80-100)': scoreStats.scaledScores.filter(s => s >= 80).length,
  'Strong Competitive Position (65-79)': scoreStats.scaledScores.filter(s => s >= 65 && s < 80).length,
  'Good Competitive Performance (50-64)': scoreStats.scaledScores.filter(s => s >= 50 && s < 65).length,
  'Moderate Competitive Standing (35-49)': scoreStats.scaledScores.filter(s => s >= 35 && s < 50).length,
  'Weak Competitive Position (0-34)': scoreStats.scaledScores.filter(s => s < 35).length
};

console.log('📊 Scaled Score Distribution:');
Object.entries(scaledRanges).forEach(([range, count]) => {
  const percentage = (count / processedCount * 100).toFixed(1);
  console.log(`   ${range}: ${count.toLocaleString()} (${percentage}%)`);
});

// Update metadata if it exists
if (data.datasets.correlation_analysis.competitive_analysis_metadata) {
  const metadata = data.datasets.correlation_analysis.competitive_analysis_metadata;
  metadata.score_scaling = {
    original_scale: '0-10',
    scaled_scale: '0-100',
    scaling_factor: 10,
    scaling_timestamp: new Date().toISOString()
  };
  
  // Update score statistics
  if (metadata.score_statistics) {
    metadata.score_statistics.original_stats = {
      mean: originalAvg,
      min: scoreStats.originalMin,
      max: scoreStats.originalMax
    };
    metadata.score_statistics.mean = scaledAvg;
    metadata.score_statistics.min = scoreStats.scaledMin;
    metadata.score_statistics.max = scoreStats.scaledMax;
  }
}

// Save updated data
console.log('💾 Saving updated dataset...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Competitive score scaling complete!');
console.log(`📄 Updated dataset saved to: ${dataPath}`);
console.log(`🔢 All ${processedCount.toLocaleString()} competitive_advantage_score values scaled from 0-10 to 0-100`);

console.log('\n📋 Summary:');
console.log(`   ✅ Scaled ${processedCount} competitive_advantage_score values`);
console.log(`   ✅ New scale: 0-100 (was 0-10)`);
console.log(`   ✅ Updated metadata with scaling information`);
console.log('   🔄 Competitive analysis now uses same scale as other endpoints');