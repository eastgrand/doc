// Debug the actual data being sent to Claude
const fs = require('fs');

console.log('=== Debugging Actual Data Flow ===\n');

// Step 1: Check what the AnalysisEngine would actually send
console.log('1. Testing AnalysisEngine data preparation:');

// Load the real strategic analysis data
const rawData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));

// Simulate what StrategicAnalysisProcessor.process() actually does
console.log('Raw data first 5 records:');
rawData.results.slice(0, 5).forEach((record, i) => {
  console.log(`${i+1}. ${record.DESCRIPTION}: strategic_value_score=${record.strategic_value_score}`);
});

// Process exactly like StrategicAnalysisProcessor
const processedRecords = rawData.results.slice(0, 5).map((record, index) => {
  const primaryScore = Number(record.strategic_value_score);
  
  return {
    area_id: record.ID || record.id || record.area_id || `area_${index + 1}`,
    area_name: record.DESCRIPTION || record.area_name || record.NAME || record.name || 'Unknown Area',
    value: Math.round(primaryScore * 100) / 100,
    rank: 0,
    properties: {
      ...record,
      strategic_value_score: primaryScore,
      score_source: 'strategic_value_score'
    }
  };
});

// Rank by value
const rankedRecords = processedRecords.sort((a, b) => b.value - a.value)
  .map((record, index) => ({ ...record, rank: index + 1 }));

console.log('\nProcessed and ranked records:');
rankedRecords.forEach((record, i) => {
  console.log(`${i+1}. ${record.area_name}: value=${record.value}`);
});

// Step 2: Check what gets formatted for Claude
console.log('\n2. Data formatted for Claude API:');

const analysisData = {
  type: 'strategic_analysis',
  records: rankedRecords,
  targetVariable: 'strategic_value_score'
};

console.log('Analysis data structure:');
console.log(`- type: ${analysisData.type}`);
console.log(`- records count: ${analysisData.records.length}`);
console.log(`- first record value: ${analysisData.records[0].value}`);

// Step 3: Check if the issue is in how this gets converted to text
console.log('\n3. Text summary that would be sent to Claude:');

let dataSummary = `STRATEGIC ANALYSIS DATA SUMMARY:\n`;
dataSummary += `Analysis Type: ${analysisData.type}\n`;
dataSummary += `Target Variable: ${analysisData.targetVariable}\n`;
dataSummary += `Total Records: ${analysisData.records.length}\n\n`;

dataSummary += `TOP STRATEGIC MARKETS:\n`;
analysisData.records.forEach((record, index) => {
  dataSummary += `${index + 1}. ${record.area_name}: ${record.value}\n`;
});

console.log(dataSummary);

// Step 4: Check if there's a data corruption in the summarization
console.log('\n4. Checking for data corruption points:');

// Check if all values are actually the same in memory
const values = analysisData.records.map(r => r.value);
const uniqueValues = [...new Set(values)];

console.log(`Unique values in processed data: ${uniqueValues.length}`);
console.log(`Values: ${values}`);

if (uniqueValues.length === 1) {
  console.log('🚨 PROBLEM FOUND: All processed values are identical!');
  console.log('This means the issue is in the data processing, not Claude');
} else {
  console.log('✅ Processed values are distinct');
  console.log('Issue must be in how data is converted to text or sent to Claude');
}

// Step 5: Check if the issue is in the raw data itself
console.log('\n5. Double-checking raw data for corruption:');
const rawValues = rawData.results.slice(0, 5).map(r => r.strategic_value_score);
const uniqueRawValues = [...new Set(rawValues)];

console.log(`Raw unique values: ${uniqueRawValues.length}`);
console.log(`Raw values: ${rawValues}`);

if (uniqueRawValues.length === 1) {
  console.log('🚨 ISSUE IN RAW DATA: All raw strategic_value_score values are identical!');
} else {
  console.log('✅ Raw data has distinct values');
}