/**
 * Quick Endpoint Test Script
 * Tests all 16 processors with sample data
 */

const fs = require('fs');
const path = require('path');

// Import processors (adjust paths as needed)
const { DataProcessor } = require('./lib/analysis/DataProcessor');
const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager');

async function testAllEndpoints() {
  console.log('🧪 Testing All 16 Analysis Endpoints...\n');
  
  // Load sample data
  const dataPath = path.join(__dirname, 'public/data/microservice-export.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const sampleResults = data.datasets.correlation_analysis.results.slice(0, 10); // Use 10 records for testing
  
  const configManager = new ConfigurationManager();
  const dataProcessor = new DataProcessor(configManager);
  
  const endpoints = [
    '/analyze',
    '/competitive-analysis', 
    '/demographic-insights',
    '/spatial-clusters',
    '/correlation-analysis',
    '/trend-analysis',
    '/anomaly-detection',
    '/feature-interactions',
    '/outlier-detection', 
    '/comparative-analysis',
    '/predictive-modeling',
    '/segment-profiling',
    '/scenario-analysis',
    '/market-sizing',
    '/brand-analysis',
    '/real-estate-analysis'
  ];
  
  const testResults = [];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint}...`);
      
      const mockRawData = {
        success: true,
        results: sampleResults,
        summary: `Test summary for ${endpoint}`,
        feature_importance: [],
        model_info: { target_variable: 'test_score' }
      };
      
      const result = dataProcessor.processResults(mockRawData, endpoint);
      
      const status = {
        endpoint,
        status: '✅ PASS',
        recordCount: result.records.length,
        targetVariable: result.targetVariable,
        processorUsed: result.records.length > 0 ? 'Dedicated' : 'Default'
      };
      
      testResults.push(status);
      console.log(`   ✅ ${endpoint}: ${result.records.length} records processed`);
      
    } catch (error) {
      const status = {
        endpoint,
        status: '❌ FAIL',
        error: error.message,
        recordCount: 0
      };
      
      testResults.push(status);
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Test Summary:');
  console.log('================');
  
  const passed = testResults.filter(r => r.status === '✅ PASS').length;
  const failed = testResults.filter(r => r.status === '❌ FAIL').length;
  
  console.log(`✅ Passed: ${passed}/16 endpoints`);  
  console.log(`❌ Failed: ${failed}/16 endpoints`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Endpoints:');
    testResults.filter(r => r.status === '❌ FAIL').forEach(r => {
      console.log(`   ${r.endpoint}: ${r.error}`);
    });
  }
  
  console.log('\n🎯 Next Steps:');
  if (failed === 0) {
    console.log('   All processors working! Ready for live testing.');
  } else {
    console.log('   Fix failed processors before live testing.');
  }
}

// Run the test
testAllEndpoints().catch(console.error);