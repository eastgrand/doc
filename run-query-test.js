#!/usr/bin/env node

/**
 * Query System Test Runner
 * 
 * This script runs the comprehensive query system test and opens the results
 * in the dashboard for easy analysis.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function runQueryTest() {
  console.log('🚀 Starting Query System Test...');
  console.log('=' .repeat(60));
  
  try {
    // Check if TypeScript files exist
    const testFile = path.join(__dirname, 'test-query-system-comprehensive.ts');
    if (!fs.existsSync(testFile)) {
      console.error('❌ Test file not found:', testFile);
      process.exit(1);
    }
    
    console.log('📦 Compiling and running TypeScript test...');
    
    // Run the test using ts-node or tsx
    let command;
    try {
      // Try tsx first (faster)
      execSync('which tsx', { stdio: 'ignore' });
      command = 'tsx test-query-system-comprehensive.ts';
    } catch {
      try {
        // Fall back to ts-node
        execSync('which ts-node', { stdio: 'ignore' });
        command = 'ts-node test-query-system-comprehensive.ts';
      } catch {
        console.error('❌ Neither tsx nor ts-node found. Please install one of them:');
        console.error('   npm install -g tsx');
        console.error('   or npm install -g ts-node');
        process.exit(1);
      }
    }
    
    console.log(`🔧 Running: ${command}`);
    
    // Execute the test
    const result = execSync(command, { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large output
    });
    
    console.log(result);
    
    // Find the generated results file
    const files = fs.readdirSync(__dirname);
    const resultsFile = files.find(file => 
      file.startsWith('query-system-test-results-') && file.endsWith('.json')
    );
    
    if (!resultsFile) {
      console.error('❌ Results file not found. Test may have failed.');
      process.exit(1);
    }
    
    console.log(`✅ Test completed! Results saved to: ${resultsFile}`);
    
    // Try to open the dashboard
    const dashboardPath = path.join(__dirname, 'query-test-dashboard.html');
    if (fs.existsSync(dashboardPath)) {
      console.log('🌐 Opening test dashboard...');
      
      // Try to open the dashboard in the default browser
      const open = (url) => {
        switch (process.platform) {
          case 'darwin':
            execSync(`open "${url}"`);
            break;
          case 'win32':
            execSync(`start "${url}"`);
            break;
          default:
            execSync(`xdg-open "${url}"`);
        }
      };
      
      try {
        open(dashboardPath);
        console.log('📊 Dashboard opened in your default browser');
        console.log(`📁 Load the file: ${resultsFile}`);
      } catch (error) {
        console.log('⚠️  Could not auto-open dashboard');
        console.log(`📊 Manually open: ${dashboardPath}`);
        console.log(`📁 Then load: ${resultsFile}`);
      }
    }
    
    // Show quick summary
    try {
      const resultsData = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      const stats = resultsData.overallStats;
      
      console.log('\n' + '='.repeat(60));
      console.log('📈 QUICK SUMMARY');
      console.log('='.repeat(60));
      console.log(`📊 Total Queries: ${stats.totalQueries}`);
      console.log(`✅ Success Rate: ${stats.successRate.toFixed(1)}%`);
      console.log(`🎯 Average Score: ${stats.averageScore.toFixed(1)}/100`);
      console.log(`⚡ Average Time: ${stats.averageTime.toFixed(1)}ms`);
      
      if (resultsData.commonIssues && resultsData.commonIssues.length > 0) {
        console.log('\n❌ Top Issues:');
        resultsData.commonIssues.slice(0, 3).forEach(([issue, count]) => {
          console.log(`   • ${issue} (${count}x)`);
        });
      }
      
      console.log('\n💡 Use the dashboard for detailed analysis!');
      
    } catch (error) {
      console.log('⚠️  Could not parse results for quick summary');
    }
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    
    // Try to show partial results if they exist
    const files = fs.readdirSync(__dirname);
    const partialResults = files.find(file => 
      file.startsWith('query-system-test-results-') && file.endsWith('.json')
    );
    
    if (partialResults) {
      console.log(`⚠️  Partial results may be available in: ${partialResults}`);
    }
    
    process.exit(1);
  }
}

// Add command line options
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Query System Test Runner

Usage: node run-query-test.js [options]

Options:
  --help, -h     Show this help message
  --dashboard    Open dashboard only (don't run test)
  --clean        Clean up old result files

Examples:
  node run-query-test.js              Run full test and open dashboard
  node run-query-test.js --dashboard  Open dashboard with existing results
  node run-query-test.js --clean      Clean up old test files
`);
  process.exit(0);
}

if (args.includes('--clean')) {
  console.log('🧹 Cleaning up old test files...');
  const files = fs.readdirSync(__dirname);
  let cleaned = 0;
  
  files.forEach(file => {
    if (file.startsWith('query-system-test-results-') || 
        file.startsWith('query-system-test-summary-')) {
      fs.unlinkSync(path.join(__dirname, file));
      cleaned++;
    }
  });
  
  console.log(`✅ Cleaned up ${cleaned} old test files`);
  process.exit(0);
}

if (args.includes('--dashboard')) {
  console.log('🌐 Opening dashboard...');
  const dashboardPath = path.join(__dirname, 'query-test-dashboard.html');
  
  if (!fs.existsSync(dashboardPath)) {
    console.error('❌ Dashboard file not found:', dashboardPath);
    process.exit(1);
  }
  
  try {
    const open = (url) => {
      switch (process.platform) {
        case 'darwin':
          execSync(`open "${url}"`);
          break;
        case 'win32':
          execSync(`start "${url}"`);
          break;
        default:
          execSync(`xdg-open "${url}"`);
      }
    };
    
    open(dashboardPath);
    console.log('📊 Dashboard opened in your default browser');
  } catch (error) {
    console.error('❌ Could not open dashboard:', error.message);
    console.log(`📊 Manually open: ${dashboardPath}`);
  }
  
  process.exit(0);
}

// Run the main test
runQueryTest().catch(console.error);