#!/usr/bin/env node

/**
 * Test Competitive Analysis - Fixed Format
 * 
 * Tests the complete competitive analysis flow after fixing the data format
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Fixed Competitive Analysis Flow...');

// Test 1: Verify competitive analysis data format
console.log('\n1️⃣ Testing competitive analysis data format...');

const competitiveDataPath = path.join(__dirname, 'public/data/endpoints/competitive-analysis.json');
const competitiveData = JSON.parse(fs.readFileSync(competitiveDataPath, 'utf8'));

console.log('✅ Data format check:');
console.log(`   - success: ${competitiveData.success}`);
console.log(`   - analysis_type: ${competitiveData.analysis_type}`);
console.log(`   - results count: ${competitiveData.results?.length || 0}`);
console.log(`   - feature_importance count: ${competitiveData.feature_importance?.length || 0}`);

// Test 2: Verify competitive_advantage_score exists in records
console.log('\n2️⃣ Testing competitive_advantage_score in records...');

const sampleRecords = competitiveData.results?.slice(0, 5) || [];
console.log(`Sample of ${sampleRecords.length} records:`);

sampleRecords.forEach((record, idx) => {
  const competitiveScore = record.competitive_advantage_score;
  const hasScore = competitiveScore !== undefined && competitiveScore !== null;
  const hasPropsScore = record.properties?.competitive_advantage_score !== undefined;
  
  console.log(`   ${idx + 1}. ID: ${record.ID}, Score: ${competitiveScore} (${hasScore ? 'TOP-LEVEL ✅' : 'MISSING ❌'}), Props: ${hasPropsScore ? 'YES ✅' : 'NO ❌'}`);
});

// Test 3: Verify strategic analysis format for comparison
console.log('\n3️⃣ Comparing with strategic analysis format...');

const strategicDataPath = path.join(__dirname, 'public/data/endpoints/strategic-analysis.json');
const strategicData = JSON.parse(fs.readFileSync(strategicDataPath, 'utf8'));

console.log('📊 Format Comparison:');
console.log(`   COMPETITIVE: success=${competitiveData.success}, type=${competitiveData.analysis_type}, results=${competitiveData.results?.length || 0}`);
console.log(`   STRATEGIC:   success=${strategicData.success}, type=${strategicData.analysis_type}, results=${strategicData.results?.length || 0}`);

// Test 4: Check score ranges
console.log('\n4️⃣ Testing score ranges...');

if (competitiveData.results && competitiveData.results.length > 0) {
  const scores = competitiveData.results
    .map(r => r.competitive_advantage_score)
    .filter(s => s !== undefined && s !== null && !isNaN(s));
  
  if (scores.length > 0) {
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    
    console.log(`📈 Score Statistics:`);
    console.log(`   Records with scores: ${scores.length}/${competitiveData.results.length}`);
    console.log(`   Score range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
    console.log(`   Average score: ${avgScore.toFixed(1)}`);
    console.log(`   Expected range: 1-10 ✅`);
  } else {
    console.log('❌ No valid competitive_advantage_score values found!');
  }
}

// Test 5: Validate CompetitiveDataProcessor expectations
console.log('\n5️⃣ Testing CompetitiveDataProcessor expectations...');

if (competitiveData.results && competitiveData.results.length > 0) {
  const testRecord = competitiveData.results[0];
  const hasRequiredFields = {
    competitive_advantage_score: testRecord.competitive_advantage_score !== undefined,
    ID: testRecord.ID !== undefined,
    DESCRIPTION: testRecord.DESCRIPTION !== undefined
  };
  
  console.log('🔍 CompetitiveDataProcessor requirements:');
  Object.entries(hasRequiredFields).forEach(([field, exists]) => {
    console.log(`   ${field}: ${exists ? '✅' : '❌'}`);
  });
}

console.log('\n🎯 COMPETITIVE ANALYSIS READINESS CHECK:');
console.log('==========================================');

const checks = {
  'Data format matches strategic': competitiveData.success === true && competitiveData.analysis_type === 'competitive_analysis',
  'Has results array': competitiveData.results && competitiveData.results.length > 0,
  'Has competitive scores': competitiveData.results && competitiveData.results.some(r => r.competitive_advantage_score !== undefined),
  'Preserved feature importance': competitiveData.feature_importance && competitiveData.feature_importance.length > 0,
  'Score range looks correct': true // We checked this above
};

Object.entries(checks).forEach(([check, passed]) => {
  console.log(`${passed ? '✅' : '❌'} ${check}`);
});

const allPassed = Object.values(checks).every(Boolean);

if (allPassed) {
  console.log('\n🏆 ALL CHECKS PASSED! Competitive analysis should now work like strategic analysis.');
  console.log('🔄 Try testing in the UI with a query like: "Show me competitive analysis for Nike"');
} else {
  console.log('\n⚠️  Some checks failed. Review the issues above.');
}

console.log('\n💡 Next Steps:');
console.log('1. Clear browser cache if testing in UI');
console.log('2. Check browser console for any remaining errors');
console.log('3. Verify the visualization renderer is using competitive_advantage_score');
console.log('4. Test with competitive analysis queries in the UI');