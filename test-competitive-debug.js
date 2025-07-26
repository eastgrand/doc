// Test script to verify CompetitiveDataProcessor debug logging
const { DataProcessor } = require('./lib/analysis/DataProcessor');
const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager');

// Mock raw data similar to what competitive analysis receives
const mockRawData = {
  success: true,
  results: [
    {
      area_id: "90210",
      area_name: "Beverly Hills",
      nike_market_share: 0.226,
      adidas_market_share: 0.249,
      median_income: 85000,
      population_density: 3500,
      coordinates: [-118.4, 34.1]
    },
    {
      area_id: "10001", 
      area_name: "New York Financial",
      nike_market_share: 0.318,
      adidas_market_share: 0.195,
      median_income: 95000,
      population_density: 8500,
      coordinates: [-74.0, 40.7]
    }
  ],
  model_info: {
    target_variable: "competitive_advantage_score"
  },
  feature_importance: []
};

async function testCompetitiveProcessor() {
  console.log('🧪 Testing CompetitiveDataProcessor debug logging...\n');
  
  try {
    // Initialize DataProcessor
    const configManager = new ConfigurationManager();
    const dataProcessor = new DataProcessor(configManager);
    
    console.log('📊 Processing /competitive-analysis endpoint...');
    
    // This should trigger the CompetitiveDataProcessor with debug logging
    const processedData = dataProcessor.processResults(mockRawData, '/competitive-analysis');
    
    console.log('\n✅ Results:');
    console.log(`- Records processed: ${processedData.records.length}`);
    console.log('- First record competitive score:', processedData.records[0]?.value);
    console.log('- First record raw nike share:', processedData.records[0]?.properties?.nike_market_share);
    console.log('- Target variable:', processedData.targetVariable);
    
    // Verify scores are in 1-10 range
    const scores = processedData.records.map(r => r.value);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    
    console.log(`\n🎯 Score range: ${minScore.toFixed(1)} - ${maxScore.toFixed(1)}`);
    
    if (maxScore <= 10.0 && minScore >= 1.0) {
      console.log('✅ Scores are properly capped to 1-10 range!');
    } else {
      console.log('❌ Scores are NOT in 1-10 range!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCompetitiveProcessor();