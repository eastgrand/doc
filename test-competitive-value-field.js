#!/usr/bin/env node

/**
 * Test Competitive Analysis Value Field
 * Debug why competitive visualization might be using market share instead of competitive_advantage_score
 */

const fs = require('fs');

// Load competitive analysis data
const competitiveData = JSON.parse(fs.readFileSync('./public/data/endpoints/competitive-analysis.json', 'utf8'));

console.log('🎯 TESTING COMPETITIVE ANALYSIS VALUE FIELD');
console.log('=' + '='.repeat(60));

// Check the structure of the data
console.log('\n📊 DATA STRUCTURE CHECK:');
console.log('- Total records:', competitiveData.results?.length || 0);

// Check first few records
const sampleRecords = competitiveData.results?.slice(0, 5) || [];

console.log('\n🔍 SAMPLE RECORDS:');
sampleRecords.forEach((record, index) => {
  console.log(`\nRecord ${index + 1}:`);
  console.log('- ID:', record.ID || record.id || record.area_id);
  console.log('- Description:', record.value_DESCRIPTION || record.DESCRIPTION);
  console.log('- competitive_advantage_score:', record.competitive_advantage_score);
  console.log('- Nike market share (value_MP30034A_B_P):', record.value_MP30034A_B_P);
  console.log('- Adidas market share (value_MP30029A_B_P):', record.value_MP30029A_B_P);
});

// Check if competitive_advantage_score exists and has valid values
console.log('\n📈 COMPETITIVE ADVANTAGE SCORE ANALYSIS:');
const scoresPresent = competitiveData.results?.filter(r => r.competitive_advantage_score !== undefined && r.competitive_advantage_score !== null) || [];
const validScores = scoresPresent.filter(r => !isNaN(Number(r.competitive_advantage_score)) && Number(r.competitive_advantage_score) > 0);

console.log('- Records with competitive_advantage_score field:', scoresPresent.length);
console.log('- Records with valid numeric scores:', validScores.length);

if (validScores.length > 0) {
  const scores = validScores.map(r => Number(r.competitive_advantage_score));
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  console.log('- Score range:', min.toFixed(2), '-', max.toFixed(2));
  console.log('- Average score:', avg.toFixed(2));
  
  // Check score distribution
  const scoreRanges = {
    '1-2': scores.filter(s => s >= 1 && s < 2).length,
    '2-3': scores.filter(s => s >= 2 && s < 3).length,
    '3-4': scores.filter(s => s >= 3 && s < 4).length,
    '4-5': scores.filter(s => s >= 4 && s < 5).length,
    '5-6': scores.filter(s => s >= 5 && s < 6).length,
    '6-7': scores.filter(s => s >= 6 && s < 7).length,
    '7-8': scores.filter(s => s >= 7 && s < 8).length,
    '8-9': scores.filter(s => s >= 8 && s < 9).length,
    '9-10': scores.filter(s => s >= 9 && s <= 10).length
  };
  
  console.log('\n📊 SCORE DISTRIBUTION:');
  Object.entries(scoreRanges).forEach(([range, count]) => {
    if (count > 0) {
      console.log(`- ${range}: ${count} records (${(count/scores.length*100).toFixed(1)}%)`);
    }
  });
} else {
  console.log('\n❌ NO VALID COMPETITIVE ADVANTAGE SCORES FOUND!');
  console.log('This explains why visualization might be falling back to market share.');
}

// Check market share values for comparison
console.log('\n📊 NIKE MARKET SHARE ANALYSIS (for comparison):');
const marketShareRecords = competitiveData.results?.filter(r => r.value_MP30034A_B_P !== undefined) || [];
if (marketShareRecords.length > 0) {
  const shares = marketShareRecords.map(r => Number(r.value_MP30034A_B_P));
  const validShares = shares.filter(s => !isNaN(s) && s > 0);
  
  console.log('- Records with Nike market share:', marketShareRecords.length);
  console.log('- Valid market share values:', validShares.length);
  
  if (validShares.length > 0) {
    console.log('- Market share range:', Math.min(...validShares).toFixed(1), '-', Math.max(...validShares).toFixed(1), '%');
    console.log('- Average market share:', (validShares.reduce((a, b) => a + b, 0) / validShares.length).toFixed(1), '%');
  }
}

// Check what fields are available in the data
console.log('\n🔍 AVAILABLE FIELDS IN FIRST RECORD:');
if (competitiveData.results?.length > 0) {
  const firstRecord = competitiveData.results[0];
  const scoreFields = Object.keys(firstRecord).filter(key => 
    key.toLowerCase().includes('score') || 
    key.toLowerCase().includes('advantage') ||
    key.toLowerCase().includes('competitive')
  );
  
  console.log('Score-related fields found:', scoreFields);
  scoreFields.forEach(field => {
    console.log(`- ${field}:`, firstRecord[field]);
  });
}

console.log('\n' + '='.repeat(60));
console.log('🎯 COMPETITIVE VALUE FIELD TEST COMPLETE');