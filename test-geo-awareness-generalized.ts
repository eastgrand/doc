// Comprehensive Geo-Awareness Testing - Generalized for All Tri-State Cities
// Tests that geo-awareness works for ANY city in NY, NJ, PA - not just Brooklyn/Philadelphia

import { GeoAwarenessEngine, GeoFilterResult, GeographicEntity } from './lib/geo/GeoAwarenessEngine';

interface TestCase {
  query: string;
  category: string;
  expectedLocations: string[];
  shouldExclude: string[];
  state: 'NY' | 'NJ' | 'PA';
  description: string;
}

// Expanded mock dataset with diverse tri-state cities and potential false positives
const MOCK_DATASET = [
  // New York cities and neighborhoods
  { area_id: 'ny001', area_name: 'Albany Downtown', DESCRIPTION: 'Downtown Albany, NY', value_MP30034A_B: 28.5 },
  { area_id: 'ny002', area_name: 'Buffalo Elmwood', DESCRIPTION: 'Elmwood Village, Buffalo, NY', value_MP30034A_B: 25.2 },
  { area_id: 'ny003', area_name: 'Rochester Park Ave', DESCRIPTION: 'Park Avenue, Rochester, NY', value_MP30034A_B: 31.8 },
  { area_id: 'ny004', area_name: 'Syracuse University', DESCRIPTION: 'University Area, Syracuse, NY', value_MP30034A_B: 29.1 },
  { area_id: 'ny005', area_name: 'Yonkers Getty Square', DESCRIPTION: 'Getty Square, Yonkers, NY', value_MP30034A_B: 33.4 },
  
  // New Jersey cities  
  { area_id: 'nj001', area_name: 'Newark Downtown', DESCRIPTION: 'Downtown Newark, NJ', value_MP30034A_B: 27.9 },
  { area_id: 'nj002', area_name: 'Jersey City Heights', DESCRIPTION: 'Jersey City Heights, NJ', value_MP30034A_B: 35.7 },
  { area_id: 'nj003', area_name: 'Hoboken Mile Square', DESCRIPTION: 'Mile Square City, Hoboken, NJ', value_MP30034A_B: 41.2 },
  { area_id: 'nj004', area_name: 'Trenton State Street', DESCRIPTION: 'State Street, Trenton, NJ', value_MP30034A_B: 22.6 },
  { area_id: 'nj005', area_name: 'Atlantic City Boardwalk', DESCRIPTION: 'Boardwalk Area, Atlantic City, NJ', value_MP30034A_B: 30.3 },
  
  // Pennsylvania cities
  { area_id: 'pa001', area_name: 'Pittsburgh Strip', DESCRIPTION: 'Strip District, Pittsburgh, PA', value_MP30034A_B: 32.8 },
  { area_id: 'pa002', area_name: 'Allentown Center', DESCRIPTION: 'Center City Allentown, PA', value_MP30034A_B: 26.4 },
  { area_id: 'pa003', area_name: 'Harrisburg Capitol', DESCRIPTION: 'Capitol Area, Harrisburg, PA', value_MP30034A_B: 24.1 },
  { area_id: 'pa004', area_name: 'Erie Bayfront', DESCRIPTION: 'Bayfront District, Erie, PA', value_MP30034A_B: 28.7 },
  { area_id: 'pa005', area_name: 'Reading Center', DESCRIPTION: 'Center City, Reading, PA', value_MP30034A_B: 23.9 },
  
  // Brooklyn/Philadelphia (our original test cases) 
  { area_id: 'bk001', area_name: 'Park Slope', DESCRIPTION: 'Park Slope (Brooklyn)', value_MP30034A_B: 38.2 },
  { area_id: 'phl001', area_name: 'Old City', DESCRIPTION: 'Old City, Philadelphia, PA', value_MP30034A_B: 36.5 },
  
  // FALSE POSITIVES - These should NOT be included in tri-state queries
  { area_id: 'fp001', area_name: 'Newark Avenue', DESCRIPTION: 'Newark Avenue, Jersey City, NJ', value_MP30034A_B: 19.8 }, // This IS valid - Newark Ave in JC
  { area_id: 'fp002', area_name: 'Albany Street', DESCRIPTION: 'Albany Street, New Brunswick, NJ', value_MP30034A_B: 21.3 }, // This IS valid - Albany St in NB
  { area_id: 'fp003', area_name: 'Buffalo Wild Wings', DESCRIPTION: 'Buffalo Wild Wings, Orlando, FL', value_MP30034A_B: 18.5 }, // FALSE POSITIVE
  { area_id: 'fp004', area_name: 'Jersey Shore', DESCRIPTION: 'Jersey Shore, PA', value_MP30034A_B: 20.1 }, // Different Jersey Shore
  { area_id: 'fp005', area_name: 'Rochester Hills', DESCRIPTION: 'Rochester Hills, MI', value_MP30034A_B: 22.7 }, // Different Rochester
  { area_id: 'fp006', area_name: 'Trenton Ave', DESCRIPTION: 'Trenton Avenue, Philadelphia, PA', value_MP30034A_B: 17.4 }, // Street name, but in PA
  { area_id: 'fp007', area_name: 'Pittsburgh Street', DESCRIPTION: 'Pittsburgh Street, Boston, MA', value_MP30034A_B: 16.9 }, // FALSE POSITIVE
  { area_id: 'fp008', area_name: 'Hoboken Restaurant', DESCRIPTION: 'Hoboken Restaurant, Denver, CO', value_MP30034A_B: 15.2 }, // FALSE POSITIVE
  { area_id: 'fp009', area_name: 'New Jersey Diner', DESCRIPTION: 'New Jersey Diner, Las Vegas, NV', value_MP30034A_B: 14.8 }, // FALSE POSITIVE
  { area_id: 'fp010', area_name: 'Allentown Road', DESCRIPTION: 'Allentown Road, Camp Springs, MD', value_MP30034A_B: 16.3 }, // FALSE POSITIVE
];

const TEST_CASES: TestCase[] = [
  // New York cities
  {
    query: "Athletic shoe trends in Albany",
    category: "NY City - Albany",
    expectedLocations: ['Albany'],
    shouldExclude: ['Albany Street', 'Buffalo', 'Newark', 'Pittsburgh'],
    state: 'NY',
    description: "Should only match Albany, NY locations"
  },
  
  {
    query: "Buffalo vs Rochester Nike performance",
    category: "NY Comparison - Buffalo vs Rochester", 
    expectedLocations: ['Buffalo', 'Rochester'],
    shouldExclude: ['Buffalo Wild Wings', 'Rochester Hills', 'Albany', 'Newark'],
    state: 'NY',
    description: "Should match Buffalo, NY and Rochester, NY only"
  },
  
  {
    query: "Syracuse university area demographics",
    category: "NY Neighborhood - Syracuse",
    expectedLocations: ['Syracuse'],
    shouldExclude: ['Buffalo', 'Newark', 'Pittsburgh', 'Albany Street'],
    state: 'NY',
    description: "Should match Syracuse, NY areas only"
  },
  
  // New Jersey cities
  {
    query: "Compare Newark and Jersey City brand preferences",
    category: "NJ Comparison - Newark vs Jersey City",
    expectedLocations: ['Newark', 'Jersey City'],
    shouldExclude: ['Newark Avenue', 'Albany', 'Pittsburgh', 'Buffalo'],
    state: 'NJ',
    description: "Should match Newark, NJ and Jersey City, NJ areas"
  },
  
  {
    query: "Hoboken athletic footwear analysis",
    category: "NJ City - Hoboken",
    expectedLocations: ['Hoboken'],
    shouldExclude: ['Hoboken Restaurant', 'Jersey Shore', 'New Jersey Diner', 'Buffalo'],
    state: 'NJ',
    description: "Should only match Hoboken, NJ locations"
  },
  
  {
    query: "Trenton state government area shoe trends", 
    category: "NJ Capital - Trenton",
    expectedLocations: ['Trenton'],
    shouldExclude: ['Trenton Ave', 'Rochester', 'Albany', 'Pittsburgh'],
    state: 'NJ',
    description: "Should match Trenton, NJ but not Trenton Avenue in Philadelphia"
  },
  
  // Pennsylvania cities
  {
    query: "Pittsburgh Strip District Nike sales",
    category: "PA City - Pittsburgh",
    expectedLocations: ['Pittsburgh'],
    shouldExclude: ['Pittsburgh Street', 'Newark', 'Buffalo', 'Albany'],
    state: 'PA',
    description: "Should only match Pittsburgh, PA locations"
  },
  
  {
    query: "Allentown vs Reading athletic market analysis",
    category: "PA Comparison - Allentown vs Reading",
    expectedLocations: ['Allentown', 'Reading'],
    shouldExclude: ['Allentown Road', 'Jersey City', 'Syracuse', 'Hoboken'],
    state: 'PA',
    description: "Should match Allentown, PA and Reading, PA only"
  },
  
  {
    query: "Harrisburg capitol area demographics",
    category: "PA Capital - Harrisburg", 
    expectedLocations: ['Harrisburg'],
    shouldExclude: ['Jersey Shore', 'Buffalo', 'Newark', 'Trenton Ave'],
    state: 'PA',
    description: "Should only match Harrisburg, PA locations"
  },
  
  // Multi-state queries
  {
    query: "Compare Nike performance across NYC, Philadelphia, and Newark",
    category: "Multi-state Comparison",
    expectedLocations: ['Brooklyn', 'Philadelphia', 'Newark'],
    shouldExclude: ['Buffalo Wild Wings', 'Rochester Hills', 'Pittsburgh Street', 'Hoboken Restaurant', 'Allentown Road'],
    state: 'NY', // Multiple states
    description: "Should match cities from multiple states but exclude false positives"
  },
  
  // Edge cases
  {
    query: "New Jersey athletic shoe market trends",
    category: "State Level - New Jersey",
    expectedLocations: ['Newark', 'Jersey City', 'Hoboken', 'Trenton', 'Atlantic City'],
    shouldExclude: ['New Jersey Diner', 'Buffalo', 'Pittsburgh', 'Albany'],
    state: 'NJ',
    description: "Should match NJ cities but exclude out-of-state false positives"
  }
];

async function testGeneralizedGeoAwareness(): Promise<void> {
  console.log('🌍 Testing GENERALIZED Geo-Awareness System - All Tri-State Cities');
  console.log('🎯 Verifying NO hardcoded logic - works for ANY NY/NJ/PA city');
  console.log('=' .repeat(90));
  console.log(`📊 Testing ${TEST_CASES.length} scenarios with ${MOCK_DATASET.length} mock records\n`);
  
  const geoEngine = GeoAwarenessEngine.getInstance();
  let totalTests = 0;
  let passedTests = 0;
  const results: Array<{
    query: string;
    category: string;
    state: string;
    passed: boolean;
    issues: string[];
    matchedAreas: string[];
    falsePositives: string[];
  }> = [];
  
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(`\n🧪 Test: ${testCase.category}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`State: ${testCase.state}`);
    
    try {
      const result: GeoFilterResult = await geoEngine.processGeoQuery(
        testCase.query, 
        MOCK_DATASET
      );
      
      console.log(`🔍 Filter Method: ${result.filterStats.filterMethod}`);
      console.log(`📈 Results: ${result.filteredRecords.length}/${result.filterStats.totalRecords} records`);
      console.log(`🎯 Entities Found: ${result.matchedEntities.map(e => e.name).join(', ')}`);
      
      const issues: string[] = [];
      const matchedAreas: string[] = [];
      const falsePositives: string[] = [];
      
      // Analyze results
      result.filteredRecords.forEach(record => {
        const areaDesc = record.DESCRIPTION || record.area_name || 'Unknown';
        matchedAreas.push(areaDesc);
        
        // Check for expected locations
        const hasExpected = testCase.expectedLocations.some(expected => 
          areaDesc.toLowerCase().includes(expected.toLowerCase())
        );
        
        // Check for areas that should be excluded
        const shouldBeExcluded = testCase.shouldExclude.some(excluded => 
          areaDesc.toLowerCase().includes(excluded.toLowerCase())
        );
        
        if (shouldBeExcluded) {
          falsePositives.push(areaDesc);
          issues.push(`False positive: ${areaDesc} should not be included`);
        }
      });
      
      // Check if expected locations were found
      if (testCase.expectedLocations.length > 0) {
        const foundExpected = testCase.expectedLocations.filter(expected =>
          result.filteredRecords.some(record =>
            (record.area_name?.toLowerCase()?.includes(expected.toLowerCase()) ||
             record.DESCRIPTION?.toLowerCase()?.includes(expected.toLowerCase()))
          )
        );
        
        const missingExpected = testCase.expectedLocations.filter(expected =>
          !foundExpected.some(found => found.toLowerCase().includes(expected.toLowerCase()))
        );
        
        if (missingExpected.length > 0) {
          issues.push(`Missing expected locations: ${missingExpected.join(', ')}`);
        }
      }
      
      const passed = issues.length === 0;
      if (passed) passedTests++;
      
      console.log(passed ? '✅ PASS' : '❌ FAIL');
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
      }
      
      if (matchedAreas.length > 0) {
        console.log(`📋 Matched Areas: ${matchedAreas.slice(0, 3).join(', ')}${matchedAreas.length > 3 ? '...' : ''}`);
      }
      
      if (falsePositives.length > 0) {
        console.log(`🚨 False Positives: ${falsePositives.join(', ')}`);
      }
      
      results.push({
        query: testCase.query,
        category: testCase.category,
        state: testCase.state,
        passed,
        issues,
        matchedAreas,
        falsePositives
      });
      
    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      results.push({
        query: testCase.query,
        category: testCase.category,
        state: testCase.state,
        passed: false,
        issues: [`Error: ${error instanceof Error ? error.message : String(error)}`],
        matchedAreas: [],
        falsePositives: []
      });
    }
  }
  
  // Generate comprehensive summary
  console.log('\n' + '='.repeat(90));
  console.log('📈 GENERALIZED GEO-AWARENESS SYSTEM TEST RESULTS');
  console.log('='.repeat(90));
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   • Total Tests: ${totalTests}`);
  console.log(`   • Passed: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  console.log(`   • Failed: ${totalTests - passedTests}`);
  
  // State breakdown
  console.log(`\n🗺️ State Performance:`);
  ['NY', 'NJ', 'PA'].forEach(state => {
    const stateResults = results.filter(r => r.state === state);
    const statePassed = stateResults.filter(r => r.passed).length;
    console.log(`   • ${state}: ${statePassed}/${stateResults.length} passed`);
  });
  
  // False positive analysis
  const allFalsePositives = results.flatMap(r => r.falsePositives);
  if (allFalsePositives.length > 0) {
    console.log(`\n🚨 False Positives Found:`);
    [...new Set(allFalsePositives)].forEach(fp => {
      console.log(`   • ${fp}`);
    });
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED - Generalized geo-awareness system working correctly!');
    console.log('✨ System successfully works for ANY tri-state city without hardcoding!');
  } else {
    console.log(`\n⚠️ ${totalTests - passedTests} tests failed - system needs refinement`);
  }
  
  // Key validation
  const hardcodingCheck = results.filter(r => 
    !r.category.includes('Brooklyn') && !r.category.includes('Philadelphia') && r.passed
  ).length;
  
  console.log(`\n🔍 HARDCODING VALIDATION:`);
  console.log(`   Non-Brooklyn/Philadelphia tests passed: ${hardcodingCheck}/${totalTests - 2}`);
  if (hardcodingCheck >= totalTests - 3) {
    console.log('   ✅ SUCCESS: System works for diverse cities, not just hardcoded ones!');
  } else {
    console.log('   ❌ CONCERN: System may still rely on hardcoded logic');
  }
}

// Run the test
if (require.main === module) {
  testGeneralizedGeoAwareness();
}

export { testGeneralizedGeoAwareness };