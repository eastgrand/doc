/**
 * Direct API endpoint testing for query flows
 * Tests the actual API endpoints that would be called by the UI
 */

const queries = [
  {
    name: 'Strategic Analysis',
    query: 'Show me the top strategic markets for Nike expansion',
    expectedEndpoint: '/strategic-analysis',
    expectedType: 'strategic_analysis',
    expectedTargetVariable: 'strategic_value_score'
  },
  {
    name: 'Competitive Analysis', 
    query: 'Compare Nike\'s market position against competitors',
    expectedEndpoint: '/competitive-analysis',
    expectedType: 'competitive_analysis', 
    expectedTargetVariable: 'competitive_advantage_score'
  },
  {
    name: 'Demographic Analysis',
    query: 'Which markets have the best demographic fit for Nike\'s target customer profile?',
    expectedEndpoint: '/demographic-insights',
    expectedType: 'demographic_analysis',
    expectedTargetVariable: 'demographic_opportunity_score'
  },
  {
    name: 'Spatial Clusters',
    query: 'Show me geographic clusters of similar markets',
    expectedEndpoint: '/spatial-clusters',
    expectedType: 'spatial_clustering',
    expectedTargetVariable: 'cluster_score'
  }
];

async function testAPIEndpoint(testCase, port = 3001) {
  console.log(`\n🧪 TESTING: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`Expected endpoint: ${testCase.expectedEndpoint}`);
  
  try {
    // Test the Claude API endpoint that processes the query
    const response = await fetch(`http://localhost:${port}/api/claude/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: testCase.query,
        conversation: []
      })
    });
    
    if (!response.ok) {
      console.log(`❌ API Request Failed: ${response.status} ${response.statusText}`);
      return;
    }
    
    const result = await response.text();
    console.log(`✅ Step 1 - API Response Received: ${result.length} characters`);
    
    // Parse the response to check for expected content
    if (result.includes(testCase.expectedEndpoint)) {
      console.log(`✅ Step 2 - Correct Endpoint Detected: ${testCase.expectedEndpoint}`);
    } else {
      console.log(`❌ Step 2 - Expected endpoint ${testCase.expectedEndpoint} not found in response`);
    }
    
    // Check for analysis completion
    if (result.includes('Analysis Complete')) {
      console.log(`✅ Step 3 - Analysis Completed Successfully`);
    } else {
      console.log(`❌ Step 3 - Analysis may not have completed`);
    }
    
    // Check for expected field mentions
    if (result.includes(testCase.expectedTargetVariable)) {
      console.log(`✅ Step 4 - Target Variable Found: ${testCase.expectedTargetVariable}`);
    } else {
      console.log(`⚠️ Step 4 - Target variable ${testCase.expectedTargetVariable} not mentioned (may be using alternate field)`);
    }
    
    // Check for scoring/ranking information
    if (result.includes('score') || result.includes('rank') || result.includes('top')) {
      console.log(`✅ Step 5 - Scoring Information Present`);
    } else {
      console.log(`❌ Step 5 - No scoring information detected`);
    }
    
    console.log(`🎉 ${testCase.name} API test completed!`);
    
  } catch (error) {
    console.log(`💥 ${testCase.name} API test failed: ${error.message}`);
  }
}

async function testDataEndpoint(testCase, port = 3001) {
  console.log(`\n📊 DATA TEST: ${testCase.name}`);
  
  try {
    // Test if the data endpoint exists and returns proper data
    const dataResponse = await fetch(`http://localhost:${port}/data/endpoints${testCase.expectedEndpoint}.json`);
    
    if (!dataResponse.ok) {
      console.log(`❌ Data Endpoint Failed: ${dataResponse.status}`);
      return;
    }
    
    const data = await dataResponse.json(); 
    console.log(`✅ Data Endpoint Success: ${data.results?.length || 0} records`);
    
    if (data.results && data.results.length > 0) {
      const sampleRecord = data.results[0];
      console.log(`📋 Sample Record Keys: ${Object.keys(sampleRecord).slice(0, 10).join(', ')}...`);
      
      // Check for expected target variable
      if (sampleRecord[testCase.expectedTargetVariable] !== undefined) {
        console.log(`✅ Target Variable Present: ${testCase.expectedTargetVariable} = ${sampleRecord[testCase.expectedTargetVariable]}`);
      } else {
        console.log(`❌ Target Variable Missing: ${testCase.expectedTargetVariable}`);
        
        // Look for similar fields
        const similarFields = Object.keys(sampleRecord).filter(key => 
          key.includes('score') || key.includes('value') || key.includes('analysis')
        );
        console.log(`🔍 Available Score Fields: ${similarFields.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.log(`💥 Data test failed: ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting API endpoint testing...\n');
  console.log('Note: Make sure the development server is running on port 3001\n');
  
  // Test data endpoints first
  console.log('📊 TESTING DATA ENDPOINTS');
  console.log('='.repeat(50));
  
  for (const testCase of queries) {
    await testDataEndpoint(testCase);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test API endpoints
  console.log('\n🌐 TESTING API ENDPOINTS');
  console.log('='.repeat(50));
  
  for (const testCase of queries) {
    await testAPIEndpoint(testCase);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for API calls
  }
  
  console.log('\n✨ All API tests completed!');
  console.log('\n📋 SUMMARY:');
  console.log('- Strategic Analysis should use strategic_value_score with choropleth renderer');
  console.log('- Competitive Analysis should use competitive_advantage_score with choropleth renderer');
  console.log('- Demographic Analysis should use demographic_opportunity_score with choropleth renderer');  
  console.log('- Spatial Clusters should use cluster_score with cluster renderer');
  console.log('- All choropleth renderers should use 4 quartile classes with red-to-green colors');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});