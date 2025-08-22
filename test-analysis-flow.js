// Test the complete analysis flow with optimization
const testAnalysisFlow = async () => {
  console.log('🧪 Testing Analysis Flow with Optimization\n');
  console.log('==========================================\n');
  
  // Test dataset that should trigger optimization
  const testData = {
    messages: [
      { role: 'user', content: 'Analyze competitive landscape for our brand' }
    ],
    featureData: [
      {
        layerId: 'test-analysis-layer',
        features: Array.from({ length: 250 }, (_, i) => ({
          id: `area_${i + 1}`,
          properties: {
            ID: `${32000 + i}`,
            DESCRIPTION: `Test Area ${i + 1}`,
            competitive_score: Math.random() * 100,
            brand_a_share: Math.random() * 50,
            brand_b_share: Math.random() * 50,
            value_TOTPOP_CY: Math.floor(Math.random() * 100000),
            value_AVGHINC_CY: Math.floor(Math.random() * 100000 + 30000)
          }
        }))
      }
    ],
    metadata: {
      enableOptimization: true,
      forceOptimization: true,
      analysisType: 'competitive-analysis'
    }
  };
  
  console.log(`📊 Test Data Summary:`);
  console.log(`   - Features: ${testData.featureData[0].features.length}`);
  console.log(`   - Should trigger optimization: YES (>=200 features)`);
  console.log(`   - Analysis type: ${testData.metadata.analysisType}`);
  console.log(`   - Force optimization: ${testData.metadata.forceOptimization}\n`);
  
  try {
    console.log('🚀 Sending request to API...\n');
    
    const response = await fetch('http://localhost:3000/api/claude/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`   - Status Text: ${response.statusText}`);
    
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`   - Content-Length: ${headers['content-length'] || 'N/A'} bytes`);
    console.log(`   - Content-Type: ${headers['content-type'] || 'N/A'}\n`);
    
    if (response.status === 413) {
      console.error('❌ ERROR: 413 Request Entity Too Large');
      console.error('   Optimization FAILED - payload still too large\n');
      return false;
    }
    
    if (!response.ok) {
      console.error(`❌ ERROR: HTTP ${response.status}`);
      const errorText = await response.text();
      console.error(`   Error details: ${errorText.substring(0, 200)}...\n`);
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ SUCCESS: Response received\n');
    console.log('📈 Analysis Results:');
    console.log(`   - Analysis complete: ${data.success || false}`);
    console.log(`   - Response length: ${JSON.stringify(data).length} chars`);
    
    if (data.content) {
      console.log(`   - AI response preview: "${data.content.substring(0, 100)}..."`);
    }
    
    if (data.metadata) {
      console.log(`\n📊 Metadata:`);
      console.log(`   - Processing time: ${data.metadata.processingTime || 'N/A'}`);
      console.log(`   - Optimization used: ${data.metadata.optimizationUsed || 'N/A'}`);
      console.log(`   - Payload reduction: ${data.metadata.payloadReduction || 'N/A'}`);
    }
    
    console.log('\n✅ Test PASSED - Analysis flow working correctly');
    return true;
    
  } catch (error) {
    console.error('❌ ERROR: Request failed');
    console.error(`   Error: ${error.message}`);
    console.error(`   Stack: ${error.stack?.substring(0, 200)}...\n`);
    return false;
  }
};

// Run the test
console.log('Starting test in 2 seconds...\n');
setTimeout(async () => {
  const success = await testAnalysisFlow();
  console.log('\n==========================================');
  console.log(success ? '✅ ALL TESTS PASSED' : '❌ TESTS FAILED');
  process.exit(success ? 0 : 1);
}, 2000);