const { StrategicAnalysisProcessor } = require('./lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts');

// Test with sample data from strategic-analysis.json
const sampleData = {
  success: true,
  results: [
    {
      ID: "06001",
      DESCRIPTION: "Alameda County, CA",
      strategic_value_score: 79.34,
      mp30034a_b_p: 26.14,
      total_population: 1671329,
      median_income: 99406,
      demographic_opportunity_score: 91.2
    },
    {
      ID: "06075",
      DESCRIPTION: "San Francisco County, CA", 
      strategic_value_score: 79.17,
      mp30034a_b_p: 25.83,
      total_population: 873965,
      median_income: 119136,
      demographic_opportunity_score: 94.8
    }
  ]
};

console.log('=== TESTING STRATEGIC ANALYSIS PROCESSOR ===');
const processor = new StrategicAnalysisProcessor();

try {
  const result = processor.process(sampleData);
  
  console.log('\n=== PROCESSED RESULTS ===');
  console.log(`Records processed: ${result.records.length}`);
  
  result.records.slice(0, 2).forEach((record, i) => {
    console.log(`\n${i+1}. ${record.area_name}:`);
    console.log(`   strategic_value_score: ${record.value}`);
    console.log(`   nike_market_share: ${record.properties.nike_market_share}`);
    console.log(`   market_gap: ${record.properties.market_gap}`);
    console.log(`   mp30034a_b_p from raw: ${sampleData.results[i].mp30034a_b_p}`);
    console.log(`   Properties keys:`, Object.keys(record.properties));
  });
  
} catch (error) {
  console.error('Error processing strategic analysis:', error);
}