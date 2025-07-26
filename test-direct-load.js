// Test loading strategic-analysis.json directly
const fs = require('fs');
const path = require('path');

console.log('Testing direct data load and processing...\n');

// Load the file
const filePath = path.join(__dirname, 'public/data/endpoints/strategic-analysis.json');
const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

console.log('Raw data loaded:');
console.log('- Success:', rawData.success !== false);
console.log('- Results:', rawData.results?.length || 0);
console.log('- Analysis type:', rawData.analysis_type);

// Simulate what CoreAnalysisProcessor would do
if (rawData.results && rawData.results.length > 0) {
  console.log('\nSimulating CoreAnalysisProcessor...');
  
  // Take first 10 records
  const processedRecords = rawData.results.slice(0, 10).map((record, index) => {
    const score = record.strategic_value_score || 0;
    return {
      area_id: record.ID || record.id || `area_${index}`,
      area_name: record.area_name || record.NAME || `Area ${index + 1}`,
      value: score,
      rank: index + 1,
      category: score > 70 ? 'high' : score > 50 ? 'medium' : 'low',
      coordinates: record.coordinates || [0, 0],
      properties: {
        strategic_value_score: score,
        total_population: record.TOTPOP_CY || 0
      }
    };
  });
  
  console.log('\nProcessed records:');
  processedRecords.forEach(rec => {
    console.log(`- ${rec.area_name}: Score ${rec.value}, Rank ${rec.rank}`);
  });
  
  const processedData = {
    type: 'strategic_analysis',
    records: processedRecords,
    summary: 'Strategic analysis complete',
    targetVariable: 'strategic_value_score'
  };
  
  console.log('\nProcessed data structure:');
  console.log('- Type:', processedData.type);
  console.log('- Records:', processedData.records.length);
  console.log('- Target variable:', processedData.targetVariable);
}