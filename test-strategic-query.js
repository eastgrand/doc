/**
 * Test script to validate strategic query fixes
 * Tests the query: "Show me the top strategic markets for Nike expansion"
 */

// Test 1: Verify quintile color scheme has all 5 colors including green
function testQuintileColors() {
  const { getQuintileColorScheme } = require('./lib/analysis/utils/QuintileUtils');
  const colors = getQuintileColorScheme();
  
  console.log('=== QUINTILE COLOR TEST ===');
  console.log('Colors returned:', colors);
  console.log('Number of colors:', colors.length);
  console.log('Has green color (#00DD44):', colors.includes('#00DD44'));
  console.log('All colors present:', colors.length === 5);
  
  return colors.length === 5 && colors.includes('#00DD44');
}

// Test 2: Verify ChoroplethRenderer forces quintile classification
function testChoroplethRenderer() {
  console.log('\n=== CHOROPLETH RENDERER TEST ===');
  
  // Mock data for testing
  const mockData = {
    records: [
      { value: 10, area_name: 'Test1' },
      { value: 20, area_name: 'Test2' },
      { value: 30, area_name: 'Test3' },
      { value: 40, area_name: 'Test4' },
      { value: 50, area_name: 'Test5' }
    ],
    type: 'strategic_analysis',
    targetVariable: 'strategic_value_score'
  };
  
  const mockConfig = {
    colorScheme: 'custom',
    opacity: 0.8
  };
  
  try {
    const { ChoroplethRenderer } = require('./lib/analysis/strategies/renderers/ChoroplethRenderer');
    const renderer = new ChoroplethRenderer();
    
    // Test classification method determination
    const classificationMethod = renderer.determineClassificationMethod(mockData, mockConfig);
    console.log('Classification method:', classificationMethod);
    console.log('Forces quintiles:', classificationMethod === 'quintiles');
    
    return classificationMethod === 'quintiles';
  } catch (error) {
    console.error('Error testing ChoroplethRenderer:', error.message);
    return false;
  }
}

// Test 3: Verify endpoint routing for strategic query
async function testEndpointRouting() {
  console.log('\n=== ENDPOINT ROUTING TEST ===');
  
  const query = "Show me the top strategic markets for Nike expansion";
  
  try {
    const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager');
    const configManager = new ConfigurationManager();
    configManager.loadConfiguration();
    
    const { CachedEndpointRouter } = require('./lib/analysis/CachedEndpointRouter');
    const router = new CachedEndpointRouter(configManager);
    
    const selectedEndpoint = await router.selectEndpoint(query, {});
    console.log('Selected endpoint:', selectedEndpoint);
    console.log('Routes to analyze endpoint:', selectedEndpoint === '/analyze');
    console.log('Does NOT route to competitive-analysis:', selectedEndpoint !== '/competitive-analysis');
    
    return selectedEndpoint === '/analyze';
  } catch (error) {
    console.error('Error testing endpoint routing:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🧪 TESTING STRATEGIC QUERY FIXES\n');
  
  const test1 = testQuintileColors();
  const test2 = testChoroplethRenderer();
  const test3 = await testEndpointRouting();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('✅ Quintile colors (including green):', test1 ? 'PASS' : 'FAIL');
  console.log('✅ Forces quintile classification:', test2 ? 'PASS' : 'FAIL');
  console.log('✅ Routes to analyze endpoint:', test3 ? 'PASS' : 'FAIL');
  
  const allPassed = test1 && test2 && test3;
  console.log('\n🎯 OVERALL RESULT:', allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED');
  
  if (allPassed) {
    console.log('\n✨ Strategic query fixes are working correctly!');
    console.log('The query should now:');
    console.log('- Use quintile visualization with all 5 colors including green');
    console.log('- Route to /analyze endpoint for strategic analysis');
    console.log('- Reference "strategic value scores" instead of "competitive advantage scores"');
  }
  
  return allPassed;
}

// Execute tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });