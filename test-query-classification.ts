import { conceptMapping } from './lib/concept-mapping';
import { analyzeQuery } from './lib/query-analyzer';
import { ANALYSIS_CATEGORIES } from './components/chat/chat-constants';
import fs from 'fs';

// Focused test set: 1-2 queries per distinct query type
// Note: Consolidating 'bivariate' and 'bivariateMap' into single 'bivariate' category
const FOCUSED_TEST_QUERIES: { [query: string]: string } = {
  // Ranking queries
  'Show me the top 10 areas with highest Nike athletic shoe purchases': 'ranking',
  'Which areas have the highest overall athletic shoe purchases?': 'ranking',
  
  // Comparison queries  
  'Compare Nike vs Adidas athletic shoe purchases across regions': 'comparison',
  'What are the key differences between Nike and Adidas purchase patterns?': 'comparison',
  
  // Bivariate/Correlation queries (consolidating bivariate and bivariateMap)
  'What is the relationship between income and Nike athletic shoe purchases?': 'bivariate',
  'Correlate running participation with running shoe purchases': 'bivariate',
  
  // Multivariate queries
  'Analyze multiple factors affecting athletic shoe purchases (age, income, activity)': 'multivariate',
  
  // Simple visualization
  'Show Nike athletic shoe purchases': 'simple',
  
  // Distribution queries
  'Show distribution of Nike athletic shoe purchases across all areas': 'distribution',
  
  // Hotspot queries
  'Find statistically significant clusters of Nike athletic shoe purchases': 'hotspot',
  
  // Proximity queries
  'Show athletic shoe purchases within 5 miles of fitness centers': 'proximity',
  
  // Temporal queries
  'Show athletic shoe purchase trends over time': 'temporal',
  
  // Cluster queries
  'Cluster areas by athletic shoe purchase patterns': 'cluster',
  
  // Difference queries
  'Show differences in athletic shoe preferences by age group': 'difference'
};

interface TestResult {
  query: string;
  expected: string;
  actual: string;
  correct: boolean;
  conceptMap?: any;
  error?: string;
}

async function testQueryClassification(): Promise<void> {
  console.log('🧪 Starting Focused Query Classification Test');
  console.log(`📊 Testing ${Object.keys(FOCUSED_TEST_QUERIES).length} queries across distinct query types\n`);
  
  const results: TestResult[] = [];
  let correctCount = 0;
  
  for (const [query, expectedType] of Object.entries(FOCUSED_TEST_QUERIES)) {
    try {
      console.log(`\n🔍 Testing: "${query}"`);
      console.log(`   Expected: ${expectedType}`);
      
      // Step 1: Test concept mapping
      const conceptMap = await conceptMapping(query);
      
      // Step 2: Test query analysis  
      const context = "Test context for classification";
      const analysisResult = await analyzeQuery(query, conceptMap, context);
      
      const actualType = analysisResult.queryType;
      const isCorrect = actualType === expectedType;
      
      console.log(`   Actual: ${actualType} ${isCorrect ? '✅' : '❌'}`);
      
      if (isCorrect) {
        correctCount++;
      } else {
        console.log(`   🔄 Classification mismatch!`);
      }
      
      results.push({
        query,
        expected: expectedType,
        actual: actualType,
        correct: isCorrect,
        conceptMap
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`   ❌ Error: ${errorMessage}`);
      results.push({
        query,
        expected: expectedType,
        actual: 'ERROR',
        correct: false,
        error: errorMessage
      });
    }
  }
  
  // Calculate and display results
  const accuracy = (correctCount / Object.keys(FOCUSED_TEST_QUERIES).length) * 100;
  
  console.log('\n' + '='.repeat(80));
  console.log('📈 FOCUSED TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Correct Classifications: ${correctCount}`);
  console.log(`❌ Incorrect Classifications: ${Object.keys(FOCUSED_TEST_QUERIES).length - correctCount}`);
  console.log(`📊 Accuracy: ${accuracy.toFixed(1)}%`);
  
  // Group results by actual query type to identify patterns
  console.log('\n📋 Classification Breakdown:');
  const typeGroups: { [type: string]: TestResult[] } = {};
  
  results.forEach(result => {
    const actualType = result.actual;
    if (!typeGroups[actualType]) {
      typeGroups[actualType] = [];
    }
    typeGroups[actualType].push(result);
  });
  
  Object.entries(typeGroups).forEach(([actualType, typeResults]) => {
    console.log(`\n🏷️  ${actualType} (${typeResults.length} queries):`);
    typeResults.forEach(result => {
      const status = result.correct ? '✅' : '❌';
      const expectedNote = result.correct ? '' : ` (expected: ${result.expected})`;
      console.log(`   ${status} "${result.query}"${expectedNote}`);
    });
  });
  
  // Identify specific issues with bivariate consolidation
  const bivariateCombined = results.filter(r => 
    r.expected === 'bivariate' || r.actual === 'bivariate' || r.actual === 'bivariateMap'
  );
  
  if (bivariateCombined.length > 0) {
    console.log('\n🔄 Bivariate Type Consolidation Analysis:');
    bivariateCombined.forEach(result => {
      console.log(`   Query: "${result.query}"`);
      console.log(`   Expected: ${result.expected}, Actual: ${result.actual}`);
      if (result.actual === 'bivariateMap') {
        console.log(`   ⚠️  Still returning 'bivariateMap' - needs consolidation in query-analyzer.ts`);
      }
    });
  }
  
  // Save detailed results
  const outputData = {
    testType: 'focused-query-classification',
    timestamp: new Date().toISOString(),
    totalQueries: Object.keys(FOCUSED_TEST_QUERIES).length,
    correctCount,
    accuracy: accuracy,
    consolidationNote: 'bivariate and bivariateMap should be consolidated to single bivariate type',
    results
  };
  
  fs.writeFileSync('focused-classification-results.json', JSON.stringify(outputData, null, 2));
  console.log('\n💾 Detailed results saved to: focused-classification-results.json');
}

// Run the test
testQueryClassification().catch(console.error); 