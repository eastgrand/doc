/**
 * Scale Competitive Analysis Endpoint Scores Script
 * 
 * Multiplies all competitive_advantage_score values by 10 in the competitive-analysis.json 
 * endpoint file to convert from 0-10 scale to 0-100 scale.
 */

const fs = require('fs');
const path = require('path');

console.log('🔢 Starting Competitive Endpoint Score Scaling...');

// Load the competitive analysis endpoint data
const dataPath = path.join(__dirname, '../../public/data/endpoints/competitive-analysis.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!data.results || !Array.isArray(data.results)) {
  console.error('❌ competitive-analysis.json does not have results array');
  process.exit(1);
}

console.log(`📊 Processing ${data.results.length} records for competitive score scaling...`);

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

// Scale all competitive_advantage_score values in results
data.results.forEach((record, index) => {
  // Scale competitive_advantage_score at top level
  if (record.competitive_advantage_score !== null && record.competitive_advantage_score !== undefined) {
    const originalScore = record.competitive_advantage_score;
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
  
  // Scale competitive_advantage_score in properties if it exists
  if (record.properties && record.properties.competitive_advantage_score !== null && record.properties.competitive_advantage_score !== undefined) {
    const originalScore = record.properties.competitive_advantage_score;
    const scaledScore = Math.round(originalScore * 10 * 100) / 100;
    record.properties.competitive_advantage_score = scaledScore;
  }
  
  if ((index + 1) % 100 === 0) {
    console.log(`   Processed ${index + 1}/${data.results.length} records...`);
  }
});

// Calculate final statistics
const originalAvg = scoreStats.originalScores.reduce((a, b) => a + b, 0) / scoreStats.originalScores.length;
const scaledAvg = scoreStats.scaledScores.reduce((a, b) => a + b, 0) / scoreStats.scaledScores.length;

console.log('🔢 Competitive Endpoint Score Scaling Statistics:');
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

// Update methodology if it exists to reflect new scale
if (data.methodology && data.methodology.scoring_methodology) {
  data.methodology.scoring_methodology_note = 'Scores scaled to 0-100 range (previously 0-10)';
  data.methodology.scaling_applied = {
    date: new Date().toISOString(),
    scaling_factor: 10,
    original_range: '0-10',
    new_range: '0-100'
  };
}

// Save updated data
console.log('💾 Saving updated endpoint data...');
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('✅ Competitive endpoint score scaling complete!');
console.log(`📄 Updated file saved to: ${dataPath}`);
console.log(`🔢 All ${processedCount.toLocaleString()} competitive_advantage_score values scaled from 0-10 to 0-100`);

console.log('\n📋 Summary:');
console.log(`   ✅ Scaled ${processedCount} competitive_advantage_score values in endpoint file`);
console.log(`   ✅ New scale: 0-100 (was 0-10)`);
console.log(`   ✅ Updated methodology with scaling information`);
console.log('   🔄 Competitive analysis endpoint now uses same scale as main dataset');