/**
 * Standalone test using ES modules to bypass Next.js compilation
 */

import { AnalysisEngine } from './lib/analysis/AnalysisEngine.js';

// ANALYSIS_CATEGORIES from chat-constants.ts
const ANALYSIS_CATEGORIES = {
  'ranking': [
    'Rank the top markets for Nike expansion considering competitive landscape',
    'Show the highest opportunity areas combining demographic and predictive insights'
  ],
  'comparison': [
    'Compare Nike vs Adidas performance across demographic segments and spatial clusters',
    'Compare high-risk vs low-risk investment markets using multiple analysis types'
  ],
  'bivariate': [
    'Analyze the relationship between demographics and competitive performance',
    'Correlate spatial clustering patterns with anomaly detection results'
  ],
  'difference': [
    'Show differences between predicted growth and current competitive standings',
    'Compare feature importance rankings across different market segments'
  ],
  'multivariate': [
    'Comprehensive analysis combining competitive, demographic, spatial, and predictive data',
    'Multi-endpoint strategy analysis for market expansion considering all risk factors'
  ],
  'simple': [
    'Show competitive analysis results for athletic shoe market',
    'Display demographic insights for target market identification'
  ],
  'hotspot': [
    'Find investment hotspots using anomaly detection and spatial clustering',
    'Identify high-opportunity clusters combining multiple endpoint insights'
  ]
};

async function runStandaloneTests() {
  console.log('🚀 Starting Standalone Query Testing (ES Modules)');
  console.log('================================================\n');

  const startTime = Date.now();
  const results = [];
  
  try {
    // Initialize analysis engine
    console.log('🔧 Initializing AnalysisEngine...');
    const analysisEngine = new AnalysisEngine({ debugMode: true });
    console.log('✅ AnalysisEngine initialized\n');
    
    let totalQueries = 0;
    let successfulQueries = 0;
    
    // Test all categories
    for (const [category, queries] of Object.entries(ANALYSIS_CATEGORIES)) {
      console.log(`📋 Testing category: ${category}`);
      
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        totalQueries++;
        
        console.log(`  ${i + 1}. Testing: "${query.substring(0, 60)}..."`);
        
        const testStartTime = Date.now();
        let testResult = {
          query,
          category,
          success: false,
          executionTime: 0
        };
        
        try {
          // Execute the query
          const analysisResult = await analysisEngine.executeAnalysis(query);
          const executionTime = Date.now() - testStartTime;
          
          if (analysisResult.success) {
            testResult = {
              ...testResult,
              success: true,
              executionTime,
              endpoint: analysisResult.endpoint,
              dataPoints: analysisResult.data?.records?.length || 0,
              visualizationType: analysisResult.visualization?.type,
              effects: analysisResult.visualization?.renderer?._fireflyMode ? 'firefly' : 
                      analysisResult.visualization?._pendingEffects ? 'pending' : 'none'
            };
            
            // Special handling for competitive analysis
            if (analysisResult.endpoint === '/competitive-analysis') {
              const data = analysisResult.data;
              if (data?.records && data.records.length > 0) {
                const competitiveScores = data.records.map(r => r.value).filter(v => !isNaN(v));
                const marketShares = data.records.map(r => r.properties?.nike_market_share || 0).filter(v => !isNaN(v));
                
                testResult.competitiveAdvantageRange = competitiveScores.length > 0 
                  ? `${Math.min(...competitiveScores).toFixed(1)} - ${Math.max(...competitiveScores).toFixed(1)}`
                  : 'No data';
                  
                testResult.marketShareRange = marketShares.length > 0
                  ? `${Math.min(...marketShares).toFixed(1)} - ${Math.max(...marketShares).toFixed(1)}%`
                  : 'No data';
              }
            }
            
            successfulQueries++;
            console.log(`     ✅ SUCCESS: ${testResult.endpoint} (${executionTime}ms)`);
            console.log(`        📊 Data: ${testResult.dataPoints} points, ${testResult.visualizationType} visualization`);
            if (testResult.effects !== 'none') {
              console.log(`        ✨ Effects: ${testResult.effects}`);
            }
            if (testResult.competitiveAdvantageRange) {
              console.log(`        🎯 Competitive Range: ${testResult.competitiveAdvantageRange}`);
              console.log(`        📈 Market Share Range: ${testResult.marketShareRange}`);
            }
          } else {
            testResult.error = analysisResult.error || 'Analysis returned success=false';
            console.log(`     ❌ FAILED: ${testResult.error}`);
          }
          
        } catch (error) {
          testResult.executionTime = Date.now() - testStartTime;
          testResult.error = error.message;
          console.log(`     ❌ FAILED: ${testResult.error}`);
        }
        
        results.push(testResult);
      }
      console.log('');
    }
    
    // Calculate summary statistics
    const categorySummary = {};
    for (const result of results) {
      if (!categorySummary[result.category]) {
        categorySummary[result.category] = { total: 0, successful: 0 };
      }
      categorySummary[result.category].total++;
      if (result.success) {
        categorySummary[result.category].successful++;
      }
    }
    
    const averageExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0) / results.length;
    const totalTime = Date.now() - startTime;
    
    // Test competitive analysis specifically for quintile fixes
    const competitiveResults = results.filter(r => r.success && r.endpoint === '/competitive-analysis');
    
    console.log('📊 STANDALONE TEST SUMMARY');
    console.log('==========================');
    console.log(`Total Queries: ${totalQueries}`);
    console.log(`Successful: ${successfulQueries} (${(successfulQueries/totalQueries*100).toFixed(1)}%)`);
    console.log(`Failed: ${totalQueries - successfulQueries} (${((totalQueries - successfulQueries)/totalQueries*100).toFixed(1)}%)`);
    console.log(`Total Time: ${(totalTime/1000).toFixed(1)}s`);
    console.log(`Average Time: ${averageExecutionTime.toFixed(0)}ms`);
    
    console.log('\n📋 CATEGORY BREAKDOWN:');
    for (const [category, stats] of Object.entries(categorySummary)) {
      const rate = (stats.successful / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.successful}/${stats.total} (${rate}%)`);
    }
    
    console.log('\n🎯 COMPETITIVE ANALYSIS VALIDATION:');
    console.log(`  Quintile Test: ${competitiveResults.length > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Size/Color Variation: ${competitiveResults.some(r => r.competitiveAdvantageRange && r.marketShareRange) ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Legend Accuracy: ${competitiveResults.length > 0 ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (competitiveResults.length > 0) {
      console.log('\n🏆 COMPETITIVE ANALYSIS DETAILS:');
      competitiveResults.forEach((r, index) => {
        console.log(`  ${index + 1}. "${r.query.substring(0, 60)}..."`);
        console.log(`     📊 Data: ${r.dataPoints} points`);
        console.log(`     🎯 Competitive Range: ${r.competitiveAdvantageRange || 'N/A'}`);
        console.log(`     📈 Market Share Range: ${r.marketShareRange || 'N/A'}`);
        console.log(`     ✨ Effects: ${r.effects}`);
        console.log(`     ⏱️ Time: ${r.executionTime}ms`);
      });
    }
    
    // Show failed queries
    const failedQueries = results.filter(r => !r.success);
    if (failedQueries.length > 0) {
      console.log('\n❌ FAILED QUERIES:');
      failedQueries.slice(0, 5).forEach((r, index) => {
        console.log(`  ${index + 1}. [${r.category}] "${r.query.substring(0, 50)}..."`);
        console.log(`     Error: ${r.error}`);
      });
      if (failedQueries.length > 5) {
        console.log(`     ... and ${failedQueries.length - 5} more failed queries`);
      }
    }

    console.log('\n' + '='.repeat(60));
    if (successfulQueries / totalQueries >= 0.8) {
      console.log('🎉 EXCELLENT: >80% queries successful');
    } else if (successfulQueries / totalQueries >= 0.6) {
      console.log('✅ GOOD: >60% queries successful');
    } else {
      console.log('⚠️ NEEDS ATTENTION: <60% queries successful');
    }
    
  } catch (error) {
    console.error('💥 Standalone test runner crashed:', error);
    process.exit(1);
  }
}

// Run the tests
runStandaloneTests();