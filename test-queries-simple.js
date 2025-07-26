#!/usr/bin/env node

/**
 * Simple Query Test Runner (JavaScript - no TypeScript issues)
 * Tests the ANALYSIS_CATEGORIES queries directly
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Query categories to test
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

class SimpleQueryTester {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
  }

  async runAllTests() {
    console.log('🚀 Starting ANALYSIS_CATEGORIES Query Tests');
    console.log('==========================================\n');

    let totalQueries = 0;
    let successfulQueries = 0;

    for (const [category, queries] of Object.entries(ANALYSIS_CATEGORIES)) {
      console.log(`📋 Testing category: ${category}`);
      
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i];
        totalQueries++;
        
        console.log(`  ${i + 1}. Testing: "${query.substring(0, 60)}..."`);
        
        const result = await this.testQuery(query, category);
        this.results.push(result);
        
        if (result.success) {
          successfulQueries++;
          console.log(`     ✅ SUCCESS: ${result.endpoint || 'Unknown endpoint'} (${result.executionTime}ms)`);
          if (result.dataPoints) {
            console.log(`        📊 Data: ${result.dataPoints} points, ${result.visualizationType || 'unknown'} visualization`);
          }
          if (result.effects) {
            console.log(`        ✨ Effects: ${result.effects}`);
          }
        } else {
          console.log(`     ❌ FAILED: ${result.error}`);
        }
      }
      console.log('');
    }

    this.printSummary(totalQueries, successfulQueries);
  }

  async testQuery(query, category) {
    const startTime = Date.now();
    const result = {
      query,
      category,
      success: false,
      executionTime: 0,
      error: null,
      endpoint: null,
      dataPoints: 0,
      visualizationType: null,
      effects: null
    };

    try {
      // Test using the actual AnalysisEngine via a simple Node.js script
      const testResult = await this.executeQueryTest(query);
      
      result.executionTime = Date.now() - startTime;
      
      if (testResult.success) {
        result.success = true;
        result.endpoint = testResult.endpoint;
        result.dataPoints = testResult.dataPoints || 0;
        result.visualizationType = testResult.visualizationType;
        result.effects = testResult.effects;
      } else {
        result.error = testResult.error || 'Unknown error';
      }
      
    } catch (error) {
      result.executionTime = Date.now() - startTime;
      result.error = error.message || 'Test execution failed';
    }

    return result;
  }

  async executeQueryTest(query) {
    // Create a simple test script that can be executed
    const testScript = `
const { AnalysisEngine } = require('./lib/analysis/AnalysisEngine');
const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager');

async function testQuery() {
  try {
    const configManager = new ConfigurationManager();
    const analysisEngine = new AnalysisEngine(configManager);
    
    const result = await analysisEngine.executeAnalysis('${query.replace(/'/g, "\\'")}');
    
    console.log(JSON.stringify({
      success: result.success,
      endpoint: result.endpoint,
      dataPoints: result.data?.records?.length || 0,
      visualizationType: result.visualization?.type,
      effects: result.visualization?.renderer?._fireflyMode || result.visualization?._pendingEffects ? 'enabled' : 'none',
      error: result.error
    }));
    
  } catch (error) {
    console.log(JSON.stringify({
      success: false,
      error: error.message
    }));
  }
}

testQuery();
`;

    return new Promise((resolve) => {
      // Write test script to temp file
      const tempFile = path.join(__dirname, 'temp-test-query.js');
      fs.writeFileSync(tempFile, testScript);
      
      // Execute the test script
      const child = spawn('node', [tempFile], {
        cwd: process.cwd(),
        stdio: 'pipe'
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      child.on('close', (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }

        try {
          if (output.trim()) {
            const result = JSON.parse(output.trim());
            resolve(result);
          } else {
            resolve({
              success: false,
              error: errorOutput || 'No output from test script'
            });
          }
        } catch (parseError) {
          resolve({
            success: false,
            error: `Parse error: ${parseError.message}. Output: ${output}`
          });
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        child.kill();
        resolve({
          success: false,
          error: 'Test timeout (30s)'
        });
      }, 30000);
    });
  }

  printSummary(total, successful) {
    const failed = total - successful;
    const successRate = (successful / total * 100).toFixed(1);
    const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(1);

    console.log('📊 TEST SUMMARY');
    console.log('===============');
    console.log(`Total Queries: ${total}`);
    console.log(`Successful: ${successful} (${successRate}%)`);
    console.log(`Failed: ${failed} (${(100 - successRate).toFixed(1)}%)`);
    console.log(`Total Time: ${totalTime}s`);
    console.log(`Average Time: ${(this.results.reduce((sum, r) => sum + r.executionTime, 0) / total).toFixed(0)}ms`);

    // Category breakdown
    const categoryStats = {};
    for (const result of this.results) {
      if (!categoryStats[result.category]) {
        categoryStats[result.category] = { total: 0, successful: 0 };
      }
      categoryStats[result.category].total++;
      if (result.success) {
        categoryStats[result.category].successful++;
      }
    }

    console.log('\n📋 CATEGORY BREAKDOWN:');
    for (const [category, stats] of Object.entries(categoryStats)) {
      const rate = (stats.successful / stats.total * 100).toFixed(1);
      console.log(`  ${category}: ${stats.successful}/${stats.total} (${rate}%)`);
    }

    // Effects summary
    const withEffects = this.results.filter(r => r.effects === 'enabled').length;
    if (withEffects > 0) {
      console.log(`\n✨ EFFECTS: ${withEffects}/${successful} successful queries had effects enabled`);
    }

    // Error summary
    const errors = this.results.filter(r => !r.success);
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      const errorTypes = {};
      errors.forEach(e => {
        const type = e.error.split(':')[0] || 'Unknown';
        errorTypes[type] = (errorTypes[type] || 0) + 1;
      });
      
      for (const [type, count] of Object.entries(errorTypes)) {
        console.log(`  ${type}: ${count} occurrences`);
      }
    }

    console.log('\n' + '='.repeat(50));
    
    if (successRate >= 80) {
      console.log('🎉 EXCELLENT: Pipeline is working well!');
    } else if (successRate >= 60) {
      console.log('✅ GOOD: Most queries are working');
    } else {
      console.log('⚠️  NEEDS ATTENTION: Many queries failing');
    }
  }
}

// Run the tests
async function main() {
  const tester = new SimpleQueryTester();
  await tester.runAllTests();
}

main().catch(error => {
  console.error('💥 Test runner crashed:', error);
  process.exit(1);
});