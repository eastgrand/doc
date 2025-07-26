#!/usr/bin/env node

/**
 * Test Strategic Analysis Current State
 * Quick test to see what's broken with strategic analysis
 */

const fs = require('fs');

console.log('🧪 Testing Strategic Analysis Current State...');

// Check strategic analysis data
const strategicPath = './public/data/endpoints/strategic-analysis.json';
const strategicData = JSON.parse(fs.readFileSync(strategicPath, 'utf8'));

console.log('📊 Strategic Analysis Data:');
console.log(`   - success: ${strategicData.success}`);  
console.log(`   - analysis_type: ${strategicData.analysis_type}`);
console.log(`   - results count: ${strategicData.results?.length || 0}`);

if (strategicData.results && strategicData.results.length > 0) {
  const sample = strategicData.results[0];
  console.log(`   - sample record has strategic_value_score: ${sample.strategic_value_score !== undefined ? 'YES ✅' : 'NO ❌'}`);
  console.log(`   - sample score value: ${sample.strategic_value_score}`);
  
  // Check if field detection should work
  const hasTargetField = strategicData.results.some(r => r.strategic_value_score !== undefined);
  console.log(`   - records have strategic_value_score: ${hasTargetField ? 'YES ✅' : 'NO ❌'}`);
  
  if (hasTargetField) {
    const scores = strategicData.results
      .map(r => r.strategic_value_score)
      .filter(s => s !== undefined && !isNaN(s));
    
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    console.log(`   - score range: ${min.toFixed(1)} - ${max.toFixed(1)}`);
  }
}

console.log('\n🔍 Expected Flow:');
console.log('1. Query "strategic analysis" → getRelevantFields finds strategic_value_score');
console.log('2. StrategicAnalysisProcessor processes data with targetVariable: strategic_value_score');  
console.log('3. VisualizationRenderer uses strategic_value_score for legend');
console.log('4. Should show colored map with score range in legend');

console.log('\n🚨 If strategic analysis is showing grey/broken:');
console.log('- Check browser console for JavaScript errors');
console.log('- Verify getRelevantFields returns strategic_value_score');
console.log('- Check if processor sets correct targetVariable');
console.log('- Check if renderer uses correct field for legend');