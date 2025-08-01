// Comprehensive Geo-Awareness Testing Suite
// Tests geographic filtering accuracy and identifies issues like Brooklyn/Philadelphia false matches

import { GeoAwarenessEngine, GeoFilterResult, GeographicEntity } from './lib/geo/GeoAwarenessEngine';

interface TestCase {
  query: string;
  category: string;
  expectedLocations: string[];
  shouldExclude: string[];
  expectFiltering: boolean;
  description: string;
}

interface TestResult {
  query: string;
  category: string;
  passed: boolean;
  issues: string[];
  stats: {
    totalRecords: number;
    matchedRecords: number;
    filteredRecords: number;
    filterMethod: string;
    processingTimeMs: number;
  };
  matchedEntities: GeographicEntity[];
  sampleMatches: string[];
  falsePositives: string[];
}

// Mock dataset with realistic area descriptions from tri-state area
const MOCK_DATASET = [
  // Brooklyn areas
  { area_id: 'bk001', area_name: 'Brooklyn Heights', DESCRIPTION: 'Brooklyn Heights, NY', value_MP30034A_B: 25.5 },
  { area_id: 'bk002', area_name: 'Park Slope', DESCRIPTION: 'Park Slope (Brooklyn)', value_MP30034A_B: 30.2 },
  { area_id: 'bk003', area_name: 'Williamsburg', DESCRIPTION: 'Williamsburg, Brooklyn, NY', value_MP30034A_B: 28.1 },
  { area_id: 'bk004', area_name: 'DUMBO', DESCRIPTION: 'DUMBO, Brooklyn, NY', value_MP30034A_B: 35.7 },
  { area_id: 'bk005', area_name: 'Bed-Stuy', DESCRIPTION: 'Bedford-Stuyvesant, Brooklyn', value_MP30034A_B: 22.3 },
  
  // Philadelphia areas
  { area_id: 'phl001', area_name: 'Center City', DESCRIPTION: 'Center City, Philadelphia, PA', value_MP30034A_B: 32.1 },
  { area_id: 'phl002', area_name: 'Old City', DESCRIPTION: 'Old City (Philadelphia)', value_MP30034A_B: 29.5 },
  { area_id: 'phl003', area_name: 'Northern Liberties', DESCRIPTION: 'Northern Liberties, Philadelphia', value_MP30034A_B: 27.8 },
  { area_id: 'phl004', area_name: 'University City', DESCRIPTION: 'University City, Philadelphia, PA', value_MP30034A_B: 31.0 },
  { area_id: 'phl005', area_name: 'Fishtown', DESCRIPTION: 'Fishtown, Philadelphia, PA', value_MP30034A_B: 26.4 },
  
  // Manhattan areas - should NOT be included in Brooklyn/Philadelphia queries
  { area_id: 'mnh001', area_name: 'Midtown', DESCRIPTION: 'Midtown Manhattan, NY', value_MP30034A_B: 45.2 },
  { area_id: 'mnh002', area_name: 'SoHo', DESCRIPTION: 'SoHo, Manhattan, NY', value_MP30034A_B: 42.8 },
  { area_id: 'mnh003', area_name: 'Upper East Side', DESCRIPTION: 'Upper East Side, Manhattan', value_MP30034A_B: 38.9 },
  { area_id: 'mnh004', area_name: 'Greenwich Village', DESCRIPTION: 'Greenwich Village, Manhattan, NY', value_MP30034A_B: 40.1 },
  
  // Other NYC boroughs - should NOT be included in Brooklyn/Philadelphia queries
  { area_id: 'qns001', area_name: 'Astoria', DESCRIPTION: 'Astoria, Queens, NY', value_MP30034A_B: 33.5 },
  { area_id: 'qns002', area_name: 'Long Island City', DESCRIPTION: 'Long Island City, Queens', value_MP30034A_B: 31.7 },
  { area_id: 'brx001', area_name: 'Bronx', DESCRIPTION: 'South Bronx, NY', value_MP30034A_B: 24.6 },
  { area_id: 'si001', area_name: 'Staten Island', DESCRIPTION: 'St. George, Staten Island, NY', value_MP30034A_B: 19.8 },
  
  // New Jersey areas - should NOT be included in Brooklyn/Philadelphia queries
  { area_id: 'nj001', area_name: 'Hoboken', DESCRIPTION: 'Hoboken, NJ', value_MP30034A_B: 36.2 },
  { area_id: 'nj002', area_name: 'Jersey City', DESCRIPTION: 'Jersey City, NJ', value_MP30034A_B: 34.9 },
  { area_id: 'nj003', area_name: 'Newark', DESCRIPTION: 'Newark, NJ', value_MP30034A_B: 28.3 },
  
  // Pennsylvania areas outside Philadelphia - should NOT be included in Philadelphia queries
  { area_id: 'pa001', area_name: 'Pittsburgh', DESCRIPTION: 'Downtown Pittsburgh, PA', value_MP30034A_B: 29.7 },
  { area_id: 'pa002', area_name: 'Allentown', DESCRIPTION: 'Allentown, PA', value_MP30034A_B: 21.5 },
  { area_id: 'pa003', area_name: 'Harrisburg', DESCRIPTION: 'Harrisburg, PA', value_MP30034A_B: 20.1 },
  
  // Ambiguous cases that could cause confusion
  { area_id: 'amb001', area_name: 'Philadelphia Street', DESCRIPTION: 'Philadelphia Street, Saratoga Springs, NY', value_MP30034A_B: 18.5 },
  { area_id: 'amb002', area_name: 'Brooklyn Avenue', DESCRIPTION: 'Brooklyn Avenue, San Antonio, TX', value_MP30034A_B: 22.0 },
  { area_id: 'amb003', area_name: 'New Philadelphia', DESCRIPTION: 'New Philadelphia, OH', value_MP30034A_B: 15.8 },
  
  // Edge cases with similar names
  { area_id: 'edge001', area_name: 'East Brooklyn', DESCRIPTION: 'East Brooklyn, IL', value_MP30034A_B: 17.3 },
  { area_id: 'edge002', area_name: 'Brooklyn Park', DESCRIPTION: 'Brooklyn Park, MN', value_MP30034A_B: 19.1 },
  { area_id: 'edge003', area_name: 'North Philadelphia', DESCRIPTION: 'North Philadelphia, Philadelphia, PA', value_MP30034A_B: 23.8 }
];

const TEST_CASES: TestCase[] = [
  // Single location queries
  {
    query: "Nike performance in Brooklyn",
    category: "Single Location - Brooklyn",
    expectedLocations: ['Brooklyn Heights', 'Park Slope', 'Williamsburg', 'DUMBO', 'Bed-Stuy'],
    shouldExclude: ['Midtown', 'SoHo', 'Center City', 'Old City', 'Hoboken', 'Brooklyn Avenue', 'East Brooklyn', 'Brooklyn Park'],
    expectFiltering: true,
    description: "Should only include areas explicitly in Brooklyn, NY"
  },
  
  {
    query: "Athletic shoe preferences in Philadelphia",
    category: "Single Location - Philadelphia",
    expectedLocations: ['Center City', 'Old City', 'Northern Liberties', 'University City', 'Fishtown', 'North Philadelphia'],
    shouldExclude: ['Downtown Pittsburgh', 'Allentown', 'Brooklyn Heights', 'Midtown', 'Philadelphia Street', 'New Philadelphia'],
    expectFiltering: true,
    description: "Should only include areas in Philadelphia, PA"
  },
  
  // Comparison queries - The problematic case mentioned by user
  {
    query: "Compare Nike performance between Brooklyn and Philadelphia",
    category: "Comparison - Brooklyn vs Philadelphia",
    expectedLocations: ['Brooklyn Heights', 'Park Slope', 'Williamsburg', 'DUMBO', 'Bed-Stuy', 'Center City', 'Old City', 'Northern Liberties', 'University City', 'Fishtown', 'North Philadelphia'],
    shouldExclude: ['Midtown', 'SoHo', 'Astoria', 'Downtown Pittsburgh', 'Hoboken', 'Jersey City', 'Philadelphia Street', 'Brooklyn Avenue', 'East Brooklyn', 'New Philadelphia'],
    expectFiltering: true,
    description: "Should only include areas from Brooklyn, NY and Philadelphia, PA - no other locations"
  },
  
  // State-level queries
  {
    query: "New York athletic shoe trends",
    category: "State Level - New York",
    expectedLocations: ['Brooklyn Heights', 'Midtown', 'SoHo', 'Astoria', 'South Bronx', 'St. George'],
    shouldExclude: ['Center City', 'Downtown Pittsburgh', 'Hoboken', 'Philadelphia Street'],
    expectFiltering: true,
    description: "Should include all NY areas but exclude PA, NJ, and out-of-state locations"
  },
  
  // Regional queries
  {
    query: "Tri-state area brand preferences",
    category: "Regional - Tri-state",
    expectedLocations: [], // Should include most areas
    shouldExclude: ['Brooklyn Avenue', 'East Brooklyn', 'New Philadelphia'], // Out-of-region false matches
    expectFiltering: false,
    description: "Regional query should include NY, NJ, PA but exclude out-of-region false matches"
  },
  
  // Non-geographic queries (should not filter)
  {
    query: "Nike brand analysis nationwide",
    category: "Non-geographic",
    expectedLocations: [],
    shouldExclude: [],
    expectFiltering: false,
    description: "Should not apply geographic filtering"
  },
  
  // Ambiguous cases that test precision
  {
    query: "Philadelphia area demographics",
    category: "Ambiguous - Philadelphia area",
    expectedLocations: ['Center City', 'Old City', 'Northern Liberties', 'University City', 'Fishtown', 'North Philadelphia'],
    shouldExclude: ['Philadelphia Street', 'New Philadelphia', 'Brooklyn Heights', 'Downtown Pittsburgh'],
    expectFiltering: true,
    description: "Should distinguish Philadelphia, PA from streets named Philadelphia or other Philadelphia cities"
  },
  
  // Neighborhood-level precision
  {
    query: "Park Slope Nike purchases",
    category: "Neighborhood Level",
    expectedLocations: ['Park Slope'],
    shouldExclude: ['Brooklyn Heights', 'Williamsburg', 'Center City', 'Midtown'],
    expectFiltering: true,
    description: "Should filter to specific neighborhood only"
  }
];

async function testGeoAwareness(): Promise<void> {
  console.log('🌍 Testing Geo-Awareness System - Comprehensive Location Filtering');
  console.log('=' .repeat(90));
  console.log(`📊 Testing ${TEST_CASES.length} scenarios with ${MOCK_DATASET.length} mock records\n`);
  
  const geoEngine = GeoAwarenessEngine.getInstance();
  const results: TestResult[] = [];
  let totalTests = 0;
  let passedTests = 0;
  
  for (const testCase of TEST_CASES) {
    totalTests++;
    console.log(`\n🧪 Test: ${testCase.category}`);
    console.log(`Query: "${testCase.query}"`);
    console.log(`Expected: ${testCase.expectFiltering ? 'Geographic filtering' : 'No filtering'}`);
    
    try {
      // Run geo-aware processing
      const startTime = Date.now();
      const result: GeoFilterResult = await geoEngine.processGeoQuery(
        testCase.query, 
        MOCK_DATASET
      );
      
      console.log(`🔍 Filter Method: ${result.filterStats.filterMethod}`);
      console.log(`📈 Results: ${result.filteredRecords.length}/${result.filterStats.totalRecords} records`);
      console.log(`🎯 Entities Found: ${result.matchedEntities.map(e => e.name).join(', ')}`);
      
      // Analyze results
      const issues: string[] = [];
      const sampleMatches: string[] = [];
      const falsePositives: string[] = [];
      
      // Check if filtering was applied when expected
      if (testCase.expectFiltering && result.filterStats.filterMethod === 'no_filter') {
        issues.push('Expected geographic filtering but none was applied');
      }
      
      if (!testCase.expectFiltering && result.filterStats.filterMethod !== 'no_filter') {
        issues.push('Applied geographic filtering when none was expected');
      }
      
      // For filtered results, check accuracy
      if (result.filterStats.filterMethod !== 'no_filter') {
        result.filteredRecords.forEach(record => {
          const areaName = record.area_name || record.DESCRIPTION || 'Unknown';
          sampleMatches.push(areaName);
          
          // Check for expected locations
          const isExpected = testCase.expectedLocations.length === 0 || 
                           testCase.expectedLocations.some(expected => 
                             areaName.toLowerCase().includes(expected.toLowerCase()) ||
                             record.DESCRIPTION?.toLowerCase()?.includes(expected.toLowerCase())
                           );
          
          // Check for areas that should be excluded
          const shouldBeExcluded = testCase.shouldExclude.some(excluded => 
            areaName.toLowerCase().includes(excluded.toLowerCase()) ||
            record.DESCRIPTION?.toLowerCase()?.includes(excluded.toLowerCase())
          );
          
          if (shouldBeExcluded) {
            falsePositives.push(areaName);
            issues.push(`False positive: ${areaName} should not be included`);
          }
        });
        
        // Check if expected locations were found
        if (testCase.expectedLocations.length > 0) {
          const foundExpected = testCase.expectedLocations.filter(expected =>
            result.filteredRecords.some(record =>
              record.area_name?.toLowerCase()?.includes(expected.toLowerCase()) ||
              record.DESCRIPTION?.toLowerCase()?.includes(expected.toLowerCase())
            )
          );
          
          const missingExpected = testCase.expectedLocations.filter(expected =>
            !foundExpected.some(found => found.toLowerCase().includes(expected.toLowerCase()))
          );
          
          if (missingExpected.length > 0) {
            issues.push(`Missing expected locations: ${missingExpected.join(', ')}`);
          }
        }
      }
      
      const passed = issues.length === 0;
      if (passed) passedTests++;
      
      console.log(passed ? '✅ PASS' : '❌ FAIL');
      if (issues.length > 0) {
        issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
      }
      
      if (sampleMatches.length > 0) {
        console.log(`📋 Sample Matches: ${sampleMatches.slice(0, 5).join(', ')}${sampleMatches.length > 5 ? '...' : ''}`);
      }
      
      if (falsePositives.length > 0) {
        console.log(`🚨 False Positives: ${falsePositives.join(', ')}`);
      }
      
      results.push({
        query: testCase.query,
        category: testCase.category,
        passed,
        issues,
        stats: {
          totalRecords: result.filterStats.totalRecords,
          matchedRecords: result.filterStats.matchedRecords,
          filteredRecords: result.filteredRecords.length,
          filterMethod: result.filterStats.filterMethod,
          processingTimeMs: result.filterStats.processingTimeMs
        },
        matchedEntities: result.matchedEntities,
        sampleMatches,
        falsePositives
      });
      
    } catch (error) {
      console.log(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
      results.push({
        query: testCase.query,
        category: testCase.category,
        passed: false,
        issues: [`Error: ${error instanceof Error ? error.message : String(error)}`],
        stats: { totalRecords: 0, matchedRecords: 0, filteredRecords: 0, filterMethod: 'error', processingTimeMs: 0 },
        matchedEntities: [],
        sampleMatches: [],
        falsePositives: []
      });
    }
  }
  
  // Generate comprehensive summary
  console.log('\n' + '='.repeat(90));
  console.log('📈 GEO-AWARENESS SYSTEM TEST RESULTS');
  console.log('='.repeat(90));
  
  console.log(`\n📊 Overall Results:`);
  console.log(`   • Total Tests: ${totalTests}`);
  console.log(`   • Passed: ${passedTests} (${(passedTests/totalTests*100).toFixed(1)}%)`);
  console.log(`   • Failed: ${totalTests - passedTests}`);
  
  // Category breakdown
  console.log(`\n📂 Category Performance:`);
  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const categoryPassed = categoryResults.filter(r => r.passed).length;
    console.log(`   • ${category}: ${categoryPassed}/${categoryResults.length} passed`);
  });
  
  // Common issues analysis
  const allIssues = results.flatMap(r => r.issues);
  const issueFrequency = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (Object.keys(issueFrequency).length > 0) {
    console.log(`\n❌ Most Common Issues:`);
    Object.entries(issueFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([issue, count]) => {
        console.log(`   • ${issue} (${count} occurrences)`);
      });
  }
  
  // Filter method analysis
  const filterMethods = results.map(r => r.stats.filterMethod);
  const methodFrequency = filterMethods.reduce((acc, method) => {
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n🔧 Filter Methods Used:`);
  Object.entries(methodFrequency)
    .sort(([,a], [,b]) => b - a)
    .forEach(([method, count]) => {
      console.log(`   • ${method}: ${count} times`);
    });
  
  // Specific issue analysis for Brooklyn/Philadelphia case
  const comparisonTest = results.find(r => r.category === 'Comparison - Brooklyn vs Philadelphia');
  if (comparisonTest) {
    console.log(`\n🚨 BROOKLYN vs PHILADELPHIA ANALYSIS:`);
    console.log(`   Query: "${comparisonTest.query}"`);
    console.log(`   Status: ${comparisonTest.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
    console.log(`   Filter Method: ${comparisonTest.stats.filterMethod}`);
    console.log(`   Records Found: ${comparisonTest.stats.filteredRecords}`);
    console.log(`   False Positives: ${comparisonTest.falsePositives.length}`);
    if (comparisonTest.falsePositives.length > 0) {
      console.log(`   Problem Areas: ${comparisonTest.falsePositives.join(', ')}`);
    }
    comparisonTest.issues.forEach(issue => console.log(`   Issue: ${issue}`));
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED - Geo-awareness system working correctly!');
  } else {
    console.log(`\n⚠️ ${totalTests - passedTests} tests failed - geo-awareness system needs improvement`);
    console.log('\n🔧 RECOMMENDED FIXES:');
    console.log('   1. Improve pattern matching precision for city/borough filtering');
    console.log('   2. Add context-aware disambiguation (Philadelphia, PA vs Philadelphia Street)');
    console.log('   3. Implement stricter boundary checking for comparison queries');
    console.log('   4. Add ZIP code validation for geographic entities');
    console.log('   5. Enhance hierarchical filtering with parent-child relationships');
  }
}

// Run the test
if (require.main === module) {
  testGeoAwareness();
}

export { testGeoAwareness, TEST_CASES, MOCK_DATASET };