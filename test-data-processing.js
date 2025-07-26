const fs = require('fs');

console.log('🔬 TESTING DATA PROCESSING LAYER');
console.log('=' * 50);

// Load the actual competitive analysis data
const rawData = JSON.parse(fs.readFileSync('public/data/endpoints/competitive-analysis.json', 'utf8'));

console.log('📊 RAW DATA ANALYSIS:');
console.log('- Total records:', rawData.results.length);
console.log('- Has success field:', rawData.success);

const sampleRecord = rawData.results[0];
console.log('- Sample record keys:', Object.keys(sampleRecord).slice(0, 15));

// Look for value-like fields
const possibleValueFields = Object.keys(sampleRecord).filter(key => 
  key.includes('value') || 
  key.includes('score') || 
  key.includes('MP30034A_B_P') ||  // Nike market share
  key.includes('MP30029A_B_P') ||  // Adidas market share
  key.includes('shap')
);

console.log('- Possible value fields:', possibleValueFields);

// Test Nike/Adidas brand fields specifically
const nikeField = Object.keys(sampleRecord).find(k => k.includes('MP30034A_B_P'));
const adidasField = Object.keys(sampleRecord).find(k => k.includes('MP30029A_B_P'));

console.log('- Nike field found:', nikeField);
console.log('- Adidas field found:', adidasField);

if (nikeField) {
  console.log('- Nike sample value:', sampleRecord[nikeField]);
}
if (adidasField) {
  console.log('- Adidas sample value:', sampleRecord[adidasField]);
}

// Simulate CompetitiveDataProcessor processing
console.log('\n🧮 SIMULATING COMPETITIVE DATA PROCESSOR:');

// Test the data processing logic
function simulateCompetitiveProcessing(rawData) {
  console.log('1. Validating raw data...');
  
  // Check validation logic
  const hasCompetitiveFields = rawData.results.some(record => 
    record && (
      record.value_MP30034A_B_P !== undefined ||
      record.value_MP30029A_B_P !== undefined ||
      record.MP30034A_B_P !== undefined ||
      record.MP30029A_B_P !== undefined ||
      record.shap_MP30034A_B_P !== undefined
    )
  );
  
  console.log('- Has competitive fields:', hasCompetitiveFields);
  
  if (!hasCompetitiveFields) {
    console.log('❌ VALIDATION FAILED: No competitive fields found');
    return null;
  }
  
  console.log('2. Processing records...');
  
  // Process first few records
  const processedRecords = rawData.results.slice(0, 5).map((record, index) => {
    const area_id = record.ID || `area_${index}`;
    const area_name = record.area_name || record.DESCRIPTION || `Area ${area_id}`;
    
    // Extract competitive score (this is the key issue!)
    let competitiveScore = 0;
    
    // Try different value extraction methods
    if (record.value !== undefined) {
      competitiveScore = record.value;
    } else if (record.score !== undefined) {
      competitiveScore = record.score;
    } else if (record.MP30034A_B_P !== undefined) {
      competitiveScore = record.MP30034A_B_P; // Nike market share
    } else if (record.value_MP30034A_B_P !== undefined) {
      competitiveScore = record.value_MP30034A_B_P;
    } else {
      // Calculate from available data
      const nikeShare = record.MP30034A_B_P || record.value_MP30034A_B_P || 0;
      const adidasShare = record.MP30029A_B_P || record.value_MP30029A_B_P || 0;
      competitiveScore = nikeShare - adidasShare; // Competitive advantage
    }
    
    console.log(`   Record ${index}: ID=${area_id}, value=${competitiveScore}, name=${area_name}`);
    
    return {
      area_id,
      area_name,
      value: competitiveScore,
      rank: index + 1,
      category: competitiveScore > 0 ? 'advantaged' : 'neutral',
      properties: record
    };
  });
  
  console.log('3. Processing complete');
  console.log('- Records processed:', processedRecords.length);
  console.log('- Sample values:', processedRecords.map(r => r.value));
  
  return {
    type: 'competitive_analysis',
    records: processedRecords,
    summary: `Competitive analysis of ${processedRecords.length} areas`,
    targetVariable: 'competitive_advantage'
  };
}

const processed = simulateCompetitiveProcessing(rawData);

if (processed) {
  console.log('\n✅ DATA PROCESSING: Success');
  console.log('- Output type:', processed.type);
  console.log('- Record count:', processed.records.length);
  console.log('- Target variable:', processed.targetVariable);
  console.log('- Sample output record:', JSON.stringify(processed.records[0], null, 2));
} else {
  console.log('\n❌ DATA PROCESSING: Failed');
}

// Test what the current processor might be doing wrong
console.log('\n🐛 DEBUGGING CURRENT PROCESSOR:');

// Check if the actual processor file has the right logic
const processorPath = 'lib/analysis/strategies/processors/CompetitiveDataProcessor.ts';
if (fs.existsSync(processorPath)) {
  const processorCode = fs.readFileSync(processorPath, 'utf8');
  
  console.log('- Processor file exists');
  console.log('- Has extractCompetitiveScore method:', processorCode.includes('extractCompetitiveScore'));
  console.log('- Has value extraction logic:', processorCode.includes('extractValue'));
  console.log('- Mentions MP30034A_B_P:', processorCode.includes('MP30034A_B_P'));
  
} else {
  console.log('❌ Processor file missing');
}

console.log('\n📋 DATA PROCESSING DIAGNOSIS:');
if (processed && processed.records.length > 0 && processed.records[0].value !== 0) {
  console.log('✅ Data processing should work - issue is elsewhere');
} else {
  console.log('❌ Data processing is broken - values not extracted correctly');
}
