// Test the actual unified analysis workflow to reproduce and verify 413 fix
const testUnifiedAnalysisWorkflow = async () => {
  console.log('🎯 Testing ACTUAL Unified Analysis Workflow\n');
  console.log('===========================================\n');
  
  // Create a realistic analysis result with large dataset (like what causes 413s)
  const analysisResult = {
    endpoint: '/strategic-analysis',
    data: {
      records: Array.from({ length: 984 }, (_, i) => ({
        area_id: `${30000 + i}`,
        area_name: `Area ${i + 1}`,
        value: Math.random() * 100,
        strategic_analysis_score: Math.random() * 100,
        brand_a_share: Math.random() * 50,
        brand_b_share: Math.random() * 50,
        properties: {
          ID: `${30000 + i}`,
          DESCRIPTION: `Analysis Area ${i + 1}`,
          strategic_score: Math.random() * 100,
          value_TOTPOP_CY: Math.floor(Math.random() * 100000),
          value_AVGHINC_CY: Math.floor(Math.random() * 100000 + 30000),
          mp30034a_b_p: Math.random() * 30,
          mp30029a_b_p: Math.random() * 25,
          // Add many more fields to increase payload size
          demographic_field_1: Math.random() * 100,
          demographic_field_2: Math.random() * 100,
          demographic_field_3: Math.random() * 100,
          demographic_field_4: Math.random() * 100,
          demographic_field_5: Math.random() * 100,
          market_data_1: Math.random() * 1000000,
          market_data_2: Math.random() * 1000000,
          market_data_3: Math.random() * 1000000,
          competitive_metric_1: Math.random() * 100,
          competitive_metric_2: Math.random() * 100,
          competitive_metric_3: Math.random() * 100
        }
      })),
      isClustered: false
    }
  };
  
  // This mimics the payload that UnifiedAnalysisChat.tsx would send
  const requestPayload = {
    messages: [{
      role: 'user',
      content: 'Provide a comprehensive analysis of the strategic analysis results'
    }],
    metadata: {
      query: 'Analyze the strategic analysis results',
      analysisType: 'strategic_analysis',
      relevantLayers: ['unified_analysis'],
      isClustered: false,
      isContextualChat: false,
      // CRITICAL: These flags should prevent 413 errors
      enableOptimization: true, 
      forceOptimization: true
    },
    featureData: [{
      layerId: 'unified_analysis',
      layerName: 'Analysis Results',
      layerType: 'polygon',
      features: analysisResult.data.records
    }],
    persona: 'strategist'
  };
  
  console.log(`📊 Test Data Summary:`);
  console.log(`   - Analysis Type: ${analysisResult.endpoint}`);
  console.log(`   - Records: ${analysisResult.data.records.length}`);
  console.log(`   - Fields per record: ${Object.keys(analysisResult.data.records[0].properties).length}`);
  console.log(`   - Estimated payload size: ${(JSON.stringify(requestPayload).length / 1024).toFixed(1)} KB`);
  console.log(`   - enableOptimization: ${requestPayload.metadata.enableOptimization}`);
  console.log(`   - forceOptimization: ${requestPayload.metadata.forceOptimization}\n`);
  
  try {
    console.log('🚀 Sending realistic analysis request...\n');
    
    const response = await fetch('http://localhost:3000/api/claude/generate-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    
    console.log(`📡 Response Status: ${response.status}`);
    console.log(`   - Status Text: ${response.statusText}`);
    
    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log(`   - Content-Length: ${headers['content-length'] || 'N/A'} bytes\n`);
    
    if (response.status === 413) {
      console.error('❌ CRITICAL: 413 Request Entity Too Large');
      console.error('   THE 413 ERROR IS NOT FIXED - optimization failed!');
      console.error('   This is exactly what happens in production.\n');
      
      try {
        const errorText = await response.text();
        console.error(`   Error details: ${errorText.substring(0, 300)}...\n`);
      } catch (e) {
        console.error('   Could not read error response\n');
      }
      return false;
    }
    
    if (!response.ok) {
      console.error(`❌ ERROR: HTTP ${response.status}`);
      const errorText = await response.text();
      console.error(`   Error: ${errorText.substring(0, 300)}...\n`);
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ SUCCESS: 413 Error PREVENTED!\n');
    console.log('📈 Analysis Results:');
    console.log(`   - Response received: ${!!data.content}`);
    console.log(`   - Response length: ${JSON.stringify(data).length} chars`);
    
    if (data.content) {
      const preview = data.content.substring(0, 200).replace(/\n/g, ' ');
      console.log(`   - AI response preview: "${preview}..."`);
    }
    
    console.log('\n🎉 TEST PASSED - 413 errors successfully prevented!');
    console.log('   The optimization system is working correctly.');
    return true;
    
  } catch (error) {
    if (error.message.includes('413')) {
      console.error('❌ CRITICAL: 413 error caught in fetch');
      console.error('   The optimization system is NOT working\n');
      return false;
    }
    
    console.error('❌ ERROR: Request failed');
    console.error(`   Error: ${error.message}`);
    return false;
  }
};

// Run the test
console.log('Starting unified analysis test...\n');
setTimeout(async () => {
  const success = await testUnifiedAnalysisWorkflow();
  console.log('\n===========================================');
  console.log(success ? '✅ 413 ERRORS FIXED!' : '❌ 413 ERRORS STILL PRESENT');
  console.log(success ? 'The optimization system is working.' : 'The optimization system needs more fixes.');
  process.exit(success ? 0 : 1);
}, 1000);