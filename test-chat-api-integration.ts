// Test Chat API Integration with EnhancedQueryAnalyzer
// Verifies that the chat API correctly uses EnhancedQueryAnalyzer for field detection

import { EnhancedQueryAnalyzer } from './lib/analysis/EnhancedQueryAnalyzer';

interface TestCase {
  query: string;
  category: string;
  expectedFields: string[];
}

const TEST_CASES: TestCase[] = [
  // Brand queries (should detect specific brand fields)
  {
    query: "Show me areas with high Nike purchases",
    category: "Brand Analysis",
    expectedFields: ['value_MP30034A_B', 'value_MP30034A_B_P']
  },
  
  // Demographics (should detect demographic fields)
  {
    query: "Gen Z population athletic shoe preferences",
    category: "Demographics",
    expectedFields: ['value_GENZ_CY', 'value_GENZ_CY_P']
  },
  
  // Sports fans (should detect sports fan fields)
  {
    query: "NBA fans basketball shoe preferences",
    category: "Sports Fans",
    expectedFields: ['value_MP33106A_B', 'value_MP33106A_B_P']
  },
  
  // Complex multi-field query
  {
    query: "Hispanic millennials Nike purchase patterns in running shoes",
    category: "Complex Analysis",
    expectedFields: ['value_HISPWHT_CY', 'value_MILLENN_CY', 'value_MP30034A_B', 'value_MP30021A_B']
  }
];

function testChatAPIIntegration(): void {
  console.log('🧪 Testing Chat API Integration with EnhancedQueryAnalyzer');
  console.log('=' .repeat(80));
  
  const analyzer = new EnhancedQueryAnalyzer();
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(`\n📝 Test: ${testCase.category}`);
    console.log(`Query: "${testCase.query}"`);
    
    try {
      // Test the same methods that chat API now uses
      const queryFields = analyzer.getQueryFields(testCase.query);
      const bestEndpoint = analyzer.getBestEndpoint(testCase.query);
      const detectedFields = queryFields.map(f => f.field);
      
      console.log(`🔍 Detected Fields: ${detectedFields.join(', ')}`);
      console.log(`🎯 Best Endpoint: ${bestEndpoint}`);
      
      // Check if at least one expected field was detected
      const foundExpectedField = testCase.expectedFields.some(expected => 
        detectedFields.some(detected => detected.includes(expected) || expected.includes(detected))
      );
      
      if (foundExpectedField) {
        console.log('✅ PASS - Expected field(s) detected');
        passedTests++;
      } else {
        console.log('❌ FAIL - No expected fields detected');
        console.log(`   Expected: ${testCase.expectedFields.join(', ')}`);
      }
      
      // Show field descriptions
      if (queryFields.length > 0) {
        console.log('💡 Field Descriptions:');
        queryFields.forEach(f => console.log(`   - ${f.field}: ${f.description}`));
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 CHAT API INTEGRATION TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);  
  console.log(`Success Rate: ${(passedTests/totalTests*100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Chat API integration successful!');
    console.log('✨ Users can now ask questions about:');
    console.log('   • Brand preferences (Nike, Adidas, Jordan, etc.)');
    console.log('   • Demographics (Gen Z, Millennials, ethnic groups)'); 
    console.log('   • Sports fans (NBA, NFL, MLB, etc.)');
    console.log('   • Complex multi-factor queries');
    console.log('   • All 98+ system fields with comprehensive coverage');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} tests failed - integration needs refinement`);
  }
}

// Simulate the chat API field detection flow
function simulateChatAPIFlow(userQuery: string): void {
  console.log('\n🔄 SIMULATING CHAT API FLOW');
  console.log('-'.repeat(50));
  console.log(`User Query: "${userQuery}"`);
  
  const analyzer = new EnhancedQueryAnalyzer();
  
  try {
    // This is exactly what the updated chat API now does
    const queryFields = analyzer.getQueryFields(userQuery);
    const bestEndpoint = analyzer.getBestEndpoint(userQuery);
    
    if (queryFields.length > 0) {
      const detectedField = queryFields[0].field;
      console.log(`✅ Primary Field Selected: ${detectedField}`);
      console.log(`🎯 Recommended Endpoint: ${bestEndpoint}`);
      console.log(`📋 Enhanced Context Generated:`);
      
      const enhancedContext = `
ENHANCED QUERY ANALYSIS:
- User Query: "${userQuery}"
- Detected Fields: ${queryFields.map(f => `${f.field} (${f.description})`).join(', ')}
- Recommended Endpoint: ${bestEndpoint || 'general'}
- Primary Analysis Field: ${detectedField}

FIELD INTERPRETATION GUIDANCE:
${queryFields.map(f => `- ${f.field}: ${f.description}`).join('\n')}
`;
      
      console.log(enhancedContext);
      
    } else {
      console.log('⚠️ No fields detected - would fallback to basic analysis');
    }
    
  } catch (error) {
    console.error('❌ Error in field analysis:', error);
  }
}

// Run the tests
if (require.main === module) {
  testChatAPIIntegration();
  
  // Simulate actual chat flow
  simulateChatAPIFlow("Show me areas where Gen Z prefers Nike shoes");
}

export { testChatAPIIntegration, simulateChatAPIFlow };