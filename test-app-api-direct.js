/**
 * Direct API test call to test all queries via App Router
 */

const http = require('http');

console.log('🚀 Testing all ANALYSIS_CATEGORIES queries via App Router API...\n');

const postData = JSON.stringify({});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-queries',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('=====================');
        console.log(`Total Queries: ${result.totalQueries}`);
        console.log(`Successful: ${result.successfulQueries} (${(result.successfulQueries/result.totalQueries*100).toFixed(1)}%)`);
        console.log(`Failed: ${result.failedQueries} (${(result.failedQueries/result.totalQueries*100).toFixed(1)}%)`);
        console.log(`Average Time: ${result.averageExecutionTime.toFixed(0)}ms`);
        
        console.log('\n📋 CATEGORY BREAKDOWN:');
        Object.entries(result.categorySummary).forEach(([category, stats]) => {
          const rate = (stats.successful / stats.total * 100).toFixed(1);
          console.log(`  ${category}: ${stats.successful}/${stats.total} (${rate}%)`);
        });

        console.log('\n🎯 COMPETITIVE ANALYSIS VALIDATION:');
        console.log(`  Quintile Test: ${result.competitiveAnalysisResults.quintileTest ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  Size/Color Variation: ${result.competitiveAnalysisResults.sizeColorVariation ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`  Legend Accuracy: ${result.competitiveAnalysisResults.legendAccuracy ? '✅ PASSED' : '❌ FAILED'}`);
        
        // Show sample successful results
        const successfulResults = result.results.filter(r => r.success);
        if (successfulResults.length > 0) {
          console.log('\n🏆 SUCCESSFUL QUERY SAMPLES:');
          successfulResults.slice(0, 5).forEach((r, index) => {
            console.log(`  ${index + 1}. [${r.category}] "${r.query.substring(0, 50)}..."`);
            console.log(`     📍 Endpoint: ${r.endpoint}`);
            console.log(`     📊 Data: ${r.dataPoints} points`);
            console.log(`     🎨 Visualization: ${r.visualizationType}`);
            console.log(`     ⏱️ Time: ${r.executionTime}ms`);
            if (r.competitiveAdvantageRange) {
              console.log(`     🎯 Competitive: ${r.competitiveAdvantageRange}`);
              console.log(`     📈 Market Share: ${r.marketShareRange}`);
            }
            console.log('');
          });
        }
        
        // Show sample competitive analysis results
        const competitiveResults = result.results.filter(r => r.success && r.endpoint === '/competitive-analysis');
        if (competitiveResults.length > 0) {
          console.log('🎯 COMPETITIVE ANALYSIS DETAILS:');
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
        const failedQueries = result.results.filter(r => !r.success);
        if (failedQueries.length > 0) {
          console.log('\n❌ FAILED QUERIES:');
          failedQueries.slice(0, 3).forEach((r, index) => {
            console.log(`  ${index + 1}. [${r.category}] "${r.query.substring(0, 50)}..."`);
            console.log(`     Error: ${r.error}`);
          });
          if (failedQueries.length > 3) {
            console.log(`     ... and ${failedQueries.length - 3} more failed queries`);
          }
        }

        console.log('\n' + '='.repeat(60));
        if (result.successfulQueries / result.totalQueries >= 0.8) {
          console.log('🎉 EXCELLENT: >80% queries successful');
        } else if (result.successfulQueries / result.totalQueries >= 0.6) {
          console.log('✅ GOOD: >60% queries successful');  
        } else {
          console.log('⚠️ NEEDS ATTENTION: <60% queries successful');
        }
        
      } else {
        console.error('❌ API Error:', result.error || 'Unknown error');
        console.error('Details:', result.details || 'No details available');
      }
      
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data.substring(0, 1000));
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure the development server is running:');
  console.log('   npm run dev');
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

// Set timeout to 5 minutes for comprehensive testing
req.setTimeout(300000);

req.write(postData);
req.end();