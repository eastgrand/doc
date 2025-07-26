// Test direct API call to see what's actually being sent to Claude
const fs = require('fs');

// Simulate what the Claude API would receive
console.log('=== Testing Direct API Data ===\n');

// 1. Load strategic analysis data (what CachedEndpointRouter loads)
const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));

// 2. Process it through StrategicAnalysisProcessor logic
const processedRecords = data.results.slice(0, 10).map((record, index) => {
  const primaryScore = Number(record.strategic_value_score);
  
  return {
    area_id: record.ID || record.id || record.area_id || `area_${index + 1}`,
    area_name: record.DESCRIPTION || record.area_name || record.NAME || record.name || 'Unknown Area',
    value: Math.round(primaryScore * 100) / 100,
    rank: index + 1,
    properties: {
      ...record,
      strategic_value_score: primaryScore,
      score_source: 'strategic_value_score',
      nike_market_share: Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0,
      market_gap: Math.max(0, 100 - (Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0)),
      total_population: Number(record.total_population || record.value_TOTPOP_CY) || 0,
      median_income: Number(record.median_income || record.value_AVGHINC_CY) || 0
    }
  };
});

// Sort by value descending and assign ranks
const rankedRecords = processedRecords.sort((a, b) => b.value - a.value)
  .map((record, index) => ({ ...record, rank: index + 1 }));

// 3. Create the analysis data that would be sent to Claude
const analysisData = {
  type: 'strategic_analysis',
  records: rankedRecords,
  targetVariable: 'strategic_value_score',
  summary: 'Strategic analysis summary...',
};

console.log('Data that would be sent to Claude API:');
console.log('Type:', analysisData.type);
console.log('Target variable:', analysisData.targetVariable);
console.log('Records count:', analysisData.records.length);

console.log('\nTop 10 records in Claude request:');
analysisData.records.slice(0, 10).forEach((record, i) => {
  console.log(`${i+1}. ${record.area_name}: value=${record.value} (source: ${record.properties.score_source})`);
});

// 4. Create the exact format that would be in the featureData
const featureDataForClaude = {
  datasetOverview: {
    type: 'strategic_analysis',
    recordCount: rankedRecords.length,
    targetVariable: 'strategic_value_score'
  },
  records: rankedRecords
};

console.log('\n=== Exact featureData structure for Claude ===');
console.log(JSON.stringify({
  type: featureDataForClaude.datasetOverview.type,
  recordCount: featureDataForClaude.datasetOverview.recordCount,
  topRecords: featureDataForClaude.records.slice(0, 5).map(r => ({
    area_name: r.area_name,
    value: r.value,
    strategic_value_score: r.properties.strategic_value_score
  }))
}, null, 2));

console.log('\n=== Testing for Data Corruption ===');
// Check if any values got corrupted to 79.3
const has793 = rankedRecords.some(r => r.value === 79.3);
const allSame = rankedRecords.every(r => r.value === rankedRecords[0].value);

console.log('Any records with exactly 79.3:', has793);
console.log('All records have same value:', allSame);

if (allSame) {
  console.log('🚨 PROBLEM: All processed values are the same:', rankedRecords[0].value);
} else {
  console.log('✅ Processed values are different - issue must be elsewhere');
}