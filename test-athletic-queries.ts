import { ANALYSIS_CATEGORIES } from './components/chat/chat-constants';

// Define expected outcomes for each query type
interface ExpectedOutcome {
  query: string;
  expectedQueryType: string;
  expectedVisualizationType: string;
  expectedVariables: string[];
  expectedBrands?: string[];
  expectedDemographics?: string[];
  expectedFilters?: string[];
}

// Test data mapping our queries to expected outcomes
const expectedOutcomes: ExpectedOutcome[] = [
  // Athletic Shoes Rankings
  {
    query: 'Show me the top 10 areas with highest Nike athletic shoe purchases',
    expectedQueryType: 'ranking',
    expectedVisualizationType: 'TOP_N',
    expectedVariables: ['MP30034A_B', 'MP30034A_B_P'], // Nike athletic shoes fields
    expectedBrands: ['Nike'],
    expectedFilters: ['limit:10']
  },
  {
    query: 'Which areas have the highest overall athletic shoe purchases?',
    expectedQueryType: 'ranking',
    expectedVisualizationType: 'TOP_N',
    expectedVariables: ['MP30016A_B', 'MP30016A_B_P'], // Overall athletic shoes
    expectedBrands: ['Athletic Shoes'],
    expectedFilters: ['limit:10']
  },
  {
    query: 'Rank areas by Adidas athletic shoe sales',
    expectedQueryType: 'ranking',
    expectedVisualizationType: 'TOP_N',
    expectedVariables: ['MP30029A_B', 'MP30029A_B_P'], // Adidas athletic shoes
    expectedBrands: ['Adidas']
  },
  {
    query: 'Show top 15 regions for Jordan athletic shoe purchases',
    expectedQueryType: 'ranking',
    expectedVisualizationType: 'TOP_N',
    expectedVariables: ['MP30032A_B', 'MP30032A_B_P'], // Jordan athletic shoes
    expectedBrands: ['Jordan'],
    expectedFilters: ['limit:15']
  },

  // Brand Performance Comparisons
  {
    query: 'Compare Nike vs Adidas athletic shoe purchases across regions',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'BIVARIATE',
    expectedVariables: ['MP30034A_B', 'MP30029A_B'], // Nike vs Adidas
    expectedBrands: ['Nike', 'Adidas']
  },
  {
    query: 'How do Jordan sales compare to Converse sales?',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'BIVARIATE',
    expectedVariables: ['MP30032A_B', 'MP30031A_B'], // Jordan vs Converse
    expectedBrands: ['Jordan', 'Converse']
  },
  {
    query: 'Compare athletic shoe purchases between Nike, Puma, and New Balance',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'MULTIVARIATE',
    expectedVariables: ['MP30034A_B', 'MP30035A_B', 'MP30033A_B'], // Nike, Puma, New Balance
    expectedBrands: ['Nike', 'Puma', 'New Balance']
  },

  // Demographics vs Athletic Shoe Purchases
  {
    query: 'What is the relationship between income and Nike athletic shoe purchases?',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MEDDI_CY', 'MP30034A_B'], // Median disposable income vs Nike
    expectedBrands: ['Nike'],
    expectedDemographics: ['income']
  },
  {
    query: 'How does age demographics correlate with athletic shoe buying patterns?',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MEDAGE_CY', 'MP30016A_B'], // Median age vs athletic shoes
    expectedDemographics: ['age', 'athletic_shoes']
  },
  {
    query: 'What factors influence athletic shoe purchasing behavior?',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'MULTIVARIATE',
    expectedVariables: ['MP30016A_B'], // Athletic shoes as target
    expectedDemographics: ['income', 'age', 'population']
  },

  // Geographic Athletic Market Analysis
  {
    query: 'Find high-performing Nike markets in high-income areas',
    expectedQueryType: 'geographic',
    expectedVisualizationType: 'JOINT_HIGH',
    expectedVariables: ['MP30034A_B', 'MEDDI_CY'], // Nike sales + income
    expectedBrands: ['Nike'],
    expectedFilters: ['income:high']
  },
  {
    query: 'Show athletic shoe purchase patterns by geographic region',
    expectedQueryType: 'geographic',
    expectedVisualizationType: 'CHOROPLETH',
    expectedVariables: ['MP30016A_B'], // Athletic shoes
    expectedFilters: ['geographic:region']
  },

  // Sports Participation vs Shoe Purchases
  {
    query: 'Correlate running participation with running shoe purchases',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MP30045A_B', 'MP30033A_B'], // Running participation vs running shoes
    expectedDemographics: ['sports_participation']
  },
  {
    query: 'How do basketball participation rates affect Jordan shoe sales?',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MP30031A_B', 'MP30032A_B'], // Basketball shoes vs Jordan
    expectedBrands: ['Jordan'],
    expectedDemographics: ['sports_participation']
  },

  // Retail Channel Analysis
  {
    query: 'Correlate Dick\'s Sporting Goods shopping with Nike purchases',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MP30043A_B', 'MP30034A_B'], // Dick's vs Nike
    expectedBrands: ['Nike'],
    expectedDemographics: ['retail']
  },
  {
    query: 'How do Foot Locker shopping patterns relate to athletic shoe purchases?',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MP30044A_B', 'MP30016A_B'], // Foot Locker vs athletic shoes
    expectedDemographics: ['retail', 'athletic_shoes']
  },

  // Generational Athletic Preferences
  {
    query: 'How do Millennial areas differ in athletic shoe preferences vs Gen Z areas?',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'BIVARIATE',
    expectedVariables: ['MILLENNIAL_POP', 'GENZ_POP', 'MP30016A_B'], // Millennial vs Gen Z vs athletic shoes
    expectedDemographics: ['age', 'generation']
  },
  {
    query: 'Compare athletic shoe purchasing between different age demographics',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'MULTIVARIATE',
    expectedVariables: ['MP30016A_B'], // Athletic shoes
    expectedDemographics: ['age', 'demographics']
  },

  // Premium vs Budget Athletic Market
  {
    query: 'Find areas where premium athletic shoes (Nike, Jordan) outperform budget options',
    expectedQueryType: 'comparison',
    expectedVisualizationType: 'JOINT_HIGH',
    expectedVariables: ['MP30034A_B', 'MP30032A_B', 'MP30037A_B'], // Nike, Jordan vs Skechers
    expectedBrands: ['Nike', 'Jordan', 'Skechers'],
    expectedFilters: ['premium:high']
  },
  {
    query: 'Analyze income thresholds for premium athletic shoe purchases',
    expectedQueryType: 'correlation',
    expectedVisualizationType: 'CORRELATION',
    expectedVariables: ['MEDDI_CY', 'MP30034A_B', 'MP30032A_B'], // Income vs premium brands
    expectedBrands: ['Nike', 'Jordan'],
    expectedDemographics: ['income']
  }
];

// Test runner function
async function testAthleticQueries() {
  console.log('🏃‍♂️ TESTING ATHLETIC SHOE QUERIES 🏃‍♂️');
  console.log('='.repeat(60));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  const results: Array<{
    query: string;
    expected: ExpectedOutcome;
    actual: any;
    passed: boolean;
    issues: string[];
  }> = [];

  for (const expected of expectedOutcomes) {
    totalTests++;
    console.log(`\n📝 Testing Query ${totalTests}:`);
    console.log(`"${expected.query}"`);
    console.log('-'.repeat(50));
    
    try {
      // Test query classification
      const classificationResult = await testQueryClassification(expected.query);
      
      // Test variable extraction
      const variableResult = await testVariableExtraction(expected.query);
      
      // Compare results
      const issues: string[] = [];
      
      // Check query type
      if (classificationResult.queryType !== expected.expectedQueryType) {
        issues.push(`❌ Query Type: Expected "${expected.expectedQueryType}", got "${classificationResult.queryType}"`);
      } else {
        console.log(`✅ Query Type: ${classificationResult.queryType}`);
      }
      
      // Check visualization type
      if (classificationResult.visualizationType !== expected.expectedVisualizationType) {
        issues.push(`❌ Visualization Type: Expected "${expected.expectedVisualizationType}", got "${classificationResult.visualizationType}"`);
      } else {
        console.log(`✅ Visualization Type: ${classificationResult.visualizationType}`);
      }
      
      // Check variables
      const foundAllVariables = expected.expectedVariables.every(variable => 
        variableResult.extractedVariables.includes(variable)
      );
      
      if (!foundAllVariables) {
        issues.push(`❌ Variables: Expected ${expected.expectedVariables.join(', ')}, got ${variableResult.extractedVariables.join(', ')}`);
      } else {
        console.log(`✅ Variables: ${variableResult.extractedVariables.join(', ')}`);
      }
      
      // Check brands if expected
      if (expected.expectedBrands) {
        const foundAllBrands = expected.expectedBrands.every(brand => 
          variableResult.extractedBrands.includes(brand)
        );
        
        if (!foundAllBrands) {
          issues.push(`❌ Brands: Expected ${expected.expectedBrands.join(', ')}, got ${variableResult.extractedBrands.join(', ')}`);
        } else {
          console.log(`✅ Brands: ${variableResult.extractedBrands.join(', ')}`);
        }
      }
      
      const testPassed = issues.length === 0;
      if (testPassed) {
        passedTests++;
        console.log('🎉 TEST PASSED');
      } else {
        failedTests++;
        console.log('🚨 TEST FAILED');
        issues.forEach(issue => console.log(`   ${issue}`));
      }
      
      results.push({
        query: expected.query,
        expected,
        actual: { classificationResult, variableResult },
        passed: testPassed,
        issues
      });
      
    } catch (error) {
      failedTests++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log(`🚨 TEST ERROR: ${errorMessage}`);
      
      results.push({
        query: expected.query,
        expected,
        actual: { error: errorMessage },
        passed: false,
        issues: [`Error: ${errorMessage}`]
      });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  // Detailed failure analysis
  if (failedTests > 0) {
    console.log('\n🔍 FAILURE ANALYSIS:');
    console.log('-'.repeat(40));
    
    const failuresByType = {
      queryType: 0,
      visualizationType: 0,
      variables: 0,
      brands: 0,
      error: 0
    };
    
    results.filter(r => !r.passed).forEach(result => {
      result.issues.forEach(issue => {
        if (issue.includes('Query Type')) failuresByType.queryType++;
        if (issue.includes('Visualization Type')) failuresByType.visualizationType++;
        if (issue.includes('Variables')) failuresByType.variables++;
        if (issue.includes('Brands')) failuresByType.brands++;
        if (issue.includes('Error')) failuresByType.error++;
      });
    });
    
    console.log(`Query Type Mismatches: ${failuresByType.queryType}`);
    console.log(`Visualization Type Mismatches: ${failuresByType.visualizationType}`);
    console.log(`Variable Extraction Issues: ${failuresByType.variables}`);
    console.log(`Brand Detection Issues: ${failuresByType.brands}`);
    console.log(`System Errors: ${failuresByType.error}`);
  }
  
  return results;
}

// Mock functions for testing (replace with actual API calls)
async function testQueryClassification(query: string) {
  // This would call your actual query classification API
  // For now, returning mock data
  try {
    const response = await fetch('/api/classify-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error classifying query:', error);
    // Return mock classification for testing
    return {
      queryType: 'unknown',
      visualizationType: 'CHOROPLETH',
      confidence: 0.5
    };
  }
}

async function testVariableExtraction(query: string) {
  // This would call your actual variable extraction logic
  // For now, returning mock data based on query content
  const extractedVariables: string[] = [];
  const extractedBrands: string[] = [];
  
  // Simple pattern matching for testing
  if (query.toLowerCase().includes('nike')) {
    extractedVariables.push('MP30034A_B', 'MP30034A_B_P');
    extractedBrands.push('Nike');
  }
  if (query.toLowerCase().includes('adidas')) {
    extractedVariables.push('MP30029A_B', 'MP30029A_B_P');
    extractedBrands.push('Adidas');
  }
  if (query.toLowerCase().includes('jordan')) {
    extractedVariables.push('MP30032A_B', 'MP30032A_B_P');
    extractedBrands.push('Jordan');
  }
  if (query.toLowerCase().includes('athletic shoe') && !query.toLowerCase().includes('nike') && !query.toLowerCase().includes('adidas')) {
    extractedVariables.push('MP30016A_B', 'MP30016A_B_P');
    extractedBrands.push('Athletic Shoes');
  }
  if (query.toLowerCase().includes('income')) {
    extractedVariables.push('MEDDI_CY');
  }
  
  return {
    extractedVariables,
    extractedBrands,
    extractedDemographics: [],
    extractedFilters: []
  };
}

// Export for use in other test files
export { testAthleticQueries, expectedOutcomes };

// Run tests if this file is executed directly
if (require.main === module) {
  testAthleticQueries().then(results => {
    console.log('\n✨ Testing complete!');
    process.exit(results.every(r => r.passed) ? 0 : 1);
  }).catch(error => {
    console.error('Testing failed:', error);
    process.exit(1);
  });
} 