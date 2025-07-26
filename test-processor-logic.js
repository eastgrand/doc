const fs = require('fs');

console.log('🔬 TESTING ACTUAL PROCESSOR LOGIC');
console.log('=' * 50);

// Load real data
const rawData = JSON.parse(fs.readFileSync('public/data/endpoints/competitive-analysis.json', 'utf8'));

// Simulate the EXACT processor logic
console.log('📊 TESTING PROCESSOR extractCompetitiveScore:');

function extractCompetitiveScore(record) {
  // Get brand market shares from SHAP data
  const nikeShare = record.value_MP30034A_B_P || 0; // Nike market share %
  const adidasShare = record.value_MP30029A_B_P || 0; // Adidas market share %
  const jordanShare = record.value_MP30032A_B_P || 0; // Jordan market share %
  const underArmourShare = record.value_MP30030A_B_P || 0; // Under Armour %
  const pumaShare = record.value_MP30031A_B_P || 0; // Puma %
  const newBalanceShare = record.value_MP30033A_B_P || 0; // New Balance %
  
  console.log(`Record ${record.ID}:`, {
    nike: nikeShare,
    adidas: adidasShare,
    jordan: jordanShare,
    underArmour: underArmourShare,
    puma: pumaShare,
    newBalance: newBalanceShare
  });
  
  // Calculate competitive advantage score
  const totalCompetitorShare = adidasShare + jordanShare + underArmourShare + pumaShare + newBalanceShare;
  const marketGap = Math.max(0, 100 - nikeShare - totalCompetitorShare); // Untapped market
  const competitiveAdvantage = Math.max(0, nikeShare - adidasShare); // Nike vs main competitor
  
  // Composite competitive score (0-100)
  const competitiveScore = (
    nikeShare * 0.4 +           // 40% weight on Nike's current position
    competitiveAdvantage * 0.3 + // 30% weight on advantage over Adidas
    marketGap * 0.3             // 30% weight on growth opportunity
  );
  
  console.log(`Calculated scores:`, {
    totalCompetitor: totalCompetitorShare,
    marketGap: marketGap,
    competitiveAdvantage: competitiveAdvantage,
    finalScore: competitiveScore
  });
  
  return Math.max(0, Math.min(100, competitiveScore));
}

// Test first 3 records
console.log('\nTesting first 3 records:');
rawData.results.slice(0, 3).forEach((record, i) => {
  console.log(`\n--- Record ${i + 1} (ID: ${record.ID}) ---`);
  const score = extractCompetitiveScore(record);
  console.log(`Final competitive score: ${score}`);
});

// Test the area_id and area_name extraction
console.log('\n📋 TESTING AREA ID/NAME EXTRACTION:');

function processRecord(record, index) {
  const area_id = record.area_id || record.id || record.GEOID || `area_${index}`;
  const area_name = record.area_name || record.name || record.NAME || `Area ${index + 1}`;
  
  console.log(`Record ${index}:`, {
    area_id: area_id,
    area_name: area_name,
    hasAreaId: !!record.area_id,
    hasId: !!record.id,
    hasName: !!record.name,
    hasNAME: !!record.NAME,
    ID: record.ID,
    DESCRIPTION: record.value_DESCRIPTION
  });
  
  return { area_id, area_name };
}

rawData.results.slice(0, 3).forEach((record, i) => {
  processRecord(record, i);
});

// Test if records would have valid values and not get filtered out
console.log('\n✅ VALIDATION TEST:');

const testProcessing = rawData.results.slice(0, 10).map((record, index) => {
  const area_id = record.ID || `area_${index}`;
  const area_name = record.value_DESCRIPTION || `Area ${record.ID}`;
  const value = extractCompetitiveScore(record);
  
  return {
    area_id,
    area_name, 
    value,
    isValid: !isNaN(value) && value > 0
  };
});

console.log('Processed test records:');
testProcessing.forEach((r, i) => {
  console.log(`${i + 1}. ${r.area_id} (${r.area_name}): ${r.value} - ${r.isValid ? '✅' : '❌'}`);
});

const validCount = testProcessing.filter(r => r.isValid).length;
console.log(`\nValidation result: ${validCount}/${testProcessing.length} records valid`);

if (validCount === 0) {
  console.log('🛑 CRITICAL: All records invalid - processor logic broken');
} else {
  console.log('✅ SUCCESS: Processor logic working - issue is elsewhere');
}
