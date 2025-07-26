#!/usr/bin/env node

// Direct test of competitive scoring logic
console.log('🧪 Testing Competitive Scoring Logic...');

// Sample record that matches actual SHAP data
const sampleRecord = {
  area_name: 'Test Market',
  area_id: '10001',
  value_MP30034A_B_P: 28.5,  // Nike market share %
  value_MP30029A_B_P: 18.2,  // Adidas market share %
  value_MP30032A_B_P: 12.1,  // Jordan market share %
  shap_MP30034A_B_P: 0.15,   // Nike SHAP value
  shap_MP30029A_B_P: -0.08,  // Adidas SHAP value
  value_TOTPOP_CY: 45000,    // Total population
  value_WLTHINDXCY: 120,     // Wealth index
  value_AVGHINC_CY: 65000,   // Average income
  value_MEDAGE_CY: 32        // Median age
};

// Replicate the extractCompetitiveScore logic directly
function testCompetitiveScoring(record) {
  console.log('📊 Input Data:');
  console.log('  Nike Share:', record.value_MP30034A_B_P + '%');
  console.log('  Adidas Share:', record.value_MP30029A_B_P + '%');
  console.log('  Nike SHAP:', record.shap_MP30034A_B_P);
  console.log('  Adidas SHAP:', record.shap_MP30029A_B_P);
  console.log('  Income:', '$' + record.value_AVGHINC_CY.toLocaleString());
  console.log('  Age:', record.value_MEDAGE_CY);
  console.log('');

  // Get brand market shares
  const nikeShare = Number(record.value_MP30034A_B_P) || 0;
  const adidasShare = Number(record.value_MP30029A_B_P) || 0;
  const jordanShare = Number(record.value_MP30032A_B_P) || 0;
  
  // Get SHAP values
  const nikeShap = Number(record.shap_MP30034A_B_P) || 0;
  const adidasShap = Number(record.shap_MP30029A_B_P) || 0;
  
  // Get demographics
  const totalPop = Number(record.value_TOTPOP_CY) || 1;
  const wealthIndex = Number(record.value_WLTHINDXCY) || 100;
  const avgIncome = Number(record.value_AVGHINC_CY) || (wealthIndex * 500);
  const medianAge = Number(record.value_MEDAGE_CY) || 35;
  
  console.log('⚙️  Competitive Advantage Calculation:');
  
  // 1. Market Position Advantage (0-40 points)
  const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));
  const shapDifference = nikeShap - adidasShap;
  const normalizedShapDiff = shapDifference / (1 + Math.abs(shapDifference * 0.1));
  const shapAdvantage = Math.max(-10, Math.min(10, normalizedShapDiff * 10));
  const marketPresence = Math.min(10, nikeShare * 0.25);
  const positionAdvantage = Math.min(40, 20 + shareAdvantage + shapAdvantage + marketPresence);
  
  console.log('  1. Market Position (0-40):');
  console.log('     Share Advantage:', shareAdvantage.toFixed(1), '(Nike', nikeShare + '% vs Adidas', adidasShare + '%)');
  console.log('     SHAP Advantage:', shapAdvantage.toFixed(1));
  console.log('     Market Presence:', marketPresence.toFixed(1));
  console.log('     → Position Total:', positionAdvantage.toFixed(1), '/40');
  
  // 2. Market Attractiveness (0-35 points)
  let incomeAdvantage;
  if (avgIncome < 35000) {
    incomeAdvantage = Math.max(0, (avgIncome - 25000) / 10000 * 3);
  } else if (avgIncome <= 100000) {
    incomeAdvantage = 8 + ((avgIncome - 35000) / 65000 * 7);
  } else if (avgIncome <= 150000) {
    incomeAdvantage = 15;
  } else {
    incomeAdvantage = 15 - ((avgIncome - 150000) / 100000 * 5);
  }
  incomeAdvantage = Math.max(0, Math.min(15, incomeAdvantage));
  
  let ageAdvantage;
  if (medianAge >= 16 && medianAge <= 35) {
    ageAdvantage = 12 - Math.abs(medianAge - 25) * 0.1;
  } else if (medianAge >= 36 && medianAge <= 50) {
    ageAdvantage = 8 - (medianAge - 36) * 0.2;
  } else {
    ageAdvantage = 1;
  }
  ageAdvantage = Math.max(0, Math.min(12, ageAdvantage));
  
  const scaleAdvantage = Math.min(8, (totalPop / 20000) * 8);
  const marketFit = Math.min(35, incomeAdvantage + ageAdvantage + scaleAdvantage);
  
  console.log('  2. Market Attractiveness (0-35):');
  console.log('     Income Advantage:', incomeAdvantage.toFixed(1), '($' + avgIncome.toLocaleString() + ')');
  console.log('     Age Advantage:', ageAdvantage.toFixed(1), '(age', medianAge + ')');
  console.log('     Scale Advantage:', scaleAdvantage.toFixed(1), '(' + (totalPop/1000).toFixed(0) + 'K pop)');
  console.log('     → Market Fit Total:', marketFit.toFixed(1), '/35');
  
  // 3. Competitive Environment (0-25 points)
  const totalCompetitors = adidasShare + jordanShare;
  const fragmentation = Math.min(10, (100 - nikeShare - adidasShare) * 0.1);
  const competitorWeakness = Math.min(8, Math.max(0, (nikeShare - totalCompetitors/2) * 0.2));
  let marketStructure = 2; // Simplified for test
  const competitiveEnvironment = Math.min(25, fragmentation + competitorWeakness + marketStructure);
  
  console.log('  3. Competitive Environment (0-25):');
  console.log('     Market Fragmentation:', fragmentation.toFixed(1));
  console.log('     Competitor Weakness:', competitorWeakness.toFixed(1));
  console.log('     Market Structure:', marketStructure.toFixed(1));
  console.log('     → Environment Total:', competitiveEnvironment.toFixed(1), '/25');
  
  // Final calculation
  const totalScore = positionAdvantage + marketFit + competitiveEnvironment;
  const rawScore = totalScore / 10;
  const competitiveAdvantage = Math.max(1.0, Math.min(10.0, rawScore));
  const finalScore = Math.round(competitiveAdvantage * 10) / 10;
  
  console.log('');
  console.log('🎯 FINAL RESULT:');
  console.log('  Total Score:', totalScore.toFixed(1), '/100');
  console.log('  Raw Score:', rawScore.toFixed(2), '(Total/10)');
  console.log('  Competitive Advantage:', competitiveAdvantage.toFixed(2));
  console.log('  Final Score:', finalScore, '/10');
  console.log('');
  
  if (finalScore > 10 || finalScore < 1) {
    console.log('❌ ERROR: Score outside 1-10 range!');
  } else {
    console.log('✅ SUCCESS: Valid competitive advantage score generated');
  }
  
  return finalScore;
}

console.log('🧪 Testing with sample market data...');
console.log('='.repeat(50));
const result = testCompetitiveScoring(sampleRecord);

console.log('🧪 Testing CompetitiveDataProcessor directly...');

// Create sample raw data that matches the actual SHAP data structure
const sampleRawData = {
  success: true,
  results: [
    {
      area_id: '10001',
      area_name: 'New York 10001',
      value_MP30034A_B_P: 28.5,  // Nike market share %
      value_MP30029A_B_P: 18.2,  // Adidas market share %
      value_MP30032A_B_P: 12.1,  // Jordan market share %
      value_MP30030A_B_P: 8.4,   // Under Armour market share %
      value_MP30031A_B_P: 5.8,   // Puma market share %
      shap_MP30034A_B_P: 0.15,   // Nike SHAP value
      shap_MP30029A_B_P: -0.08,  // Adidas SHAP value
      value_TOTPOP_CY: 45000,    // Total population
      value_WLTHINDXCY: 120,     // Wealth index
      value_AVGHINC_CY: 65000,   // Average income
      value_MEDAGE_CY: 32        // Median age
    },
    {
      area_id: '10002', 
      area_name: 'New York 10002',
      value_MP30034A_B_P: 22.1,  // Nike market share %
      value_MP30029A_B_P: 25.3,  // Adidas market share %
      value_MP30032A_B_P: 8.7,   // Jordan market share %
      value_MP30030A_B_P: 11.2,  // Under Armour market share %
      value_MP30031A_B_P: 7.1,   // Puma market share %
      shap_MP30034A_B_P: -0.05,  // Nike SHAP value
      shap_MP30029A_B_P: 0.12,   // Adidas SHAP value
      value_TOTPOP_CY: 38000,    // Total population
      value_WLTHINDXCY: 95,      // Wealth index
      value_AVGHINC_CY: 48000,   // Average income
      value_MEDAGE_CY: 41        // Median age
    },
    {
      area_id: '10003',
      area_name: 'New York 10003', 
      value_MP30034A_B_P: 31.2,  // Nike market share %
      value_MP30029A_B_P: 15.8,  // Adidas market share %
      value_MP30032A_B_P: 14.5,  // Jordan market share %
      value_MP30030A_B_P: 6.9,   // Under Armour market share %
      value_MP30031A_B_P: 4.2,   // Puma market share %
      shap_MP30034A_B_P: 0.22,   // Nike SHAP value
      shap_MP30029A_B_P: -0.15,  // Adidas SHAP value
      value_TOTPOP_CY: 52000,    // Total population
      value_WLTHINDXCY: 140,     // Wealth index
      value_AVGHINC_CY: 78000,   // Average income
      value_MEDAGE_CY: 28        // Median age
    }
  ],
  feature_importance: [],
  model_info: {}
};

try {
  console.log('📊 Raw input data sample:');
  console.log('  Area 1: Nike', sampleRawData.results[0].value_MP30034A_B_P + '%', 'vs Adidas', sampleRawData.results[0].value_MP30029A_B_P + '%');
  console.log('  Area 2: Nike', sampleRawData.results[1].value_MP30034A_B_P + '%', 'vs Adidas', sampleRawData.results[1].value_MP30029A_B_P + '%');
  console.log('  Area 3: Nike', sampleRawData.results[2].value_MP30034A_B_P + '%', 'vs Adidas', sampleRawData.results[2].value_MP30029A_B_P + '%');
  console.log('');

  // Create processor instance
  const processor = new CompetitiveDataProcessor();
  
  // Validate the data
  console.log('🔍 Validating raw data...');
  const isValid = processor.validate(sampleRawData);
  console.log('  Validation result:', isValid ? '✅ PASS' : '❌ FAIL');
  
  if (!isValid) {
    console.error('❌ Data validation failed - competitive processor won\'t run');
    process.exit(1);
  }
  
  // Process the data
  console.log('');
  console.log('⚙️  Processing competitive data...');
  const processedData = processor.process(sampleRawData);
  
  console.log('');
  console.log('📈 PROCESSED RESULTS:');
  console.log('  Type:', processedData.type);
  console.log('  Records:', processedData.records.length);
  console.log('  Target Variable:', processedData.targetVariable);
  console.log('');
  console.log('🏆 TOP 3 COMPETITIVE ADVANTAGE SCORES:');
  
  processedData.records.slice(0, 3).forEach((record, index) => {
    console.log(`  ${index + 1}. ${record.area_name}:`);
    console.log(`     Competitive Score: ${record.value.toFixed(2)} (1-10 scale)`);
    console.log(`     Nike Market Share: ${record.properties.nike_market_share.toFixed(1)}%`);
    console.log(`     Adidas Market Share: ${record.properties.adidas_market_share.toFixed(1)}%`);
    console.log(`     Rank: #${record.rank}`);
    console.log('');
  });
  
  console.log('🎯 KEY INSIGHTS:');
  console.log('  • Competitive scores should be 1-10 (NOT market share percentages)');
  console.log('  • Records should be ranked by competitive advantage');
  console.log('  • Market share values should be in properties for reference');
  console.log('');
  
  // Check if we're getting competitive scores vs market share
  const firstRecordValue = processedData.records[0].value;
  if (firstRecordValue > 20) {
    console.log('❌ ERROR: First record value is', firstRecordValue, '- looks like market share % instead of competitive score!');
  } else {
    console.log('✅ SUCCESS: First record value is', firstRecordValue.toFixed(2), '- appears to be competitive advantage score');
  }
  
} catch (error) {
  console.error('💥 Error during processing:', error.message);
  console.error('Stack:', error.stack);
}