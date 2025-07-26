#!/usr/bin/env node

/**
 * Comprehensive Query Pipeline Test Runner
 * 
 * This script runs the comprehensive test suite for all predefined queries
 * from chat-constants.ts and generates a detailed report.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Query Pipeline Tests...\n');

try {
  // Run the Jest test with verbose output
  const testCommand = 'npx jest test/comprehensive-query-pipeline.test.ts --verbose --no-cache';
  
  console.log(`Running: ${testCommand}\n`);
  
  const output = execSync(testCommand, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log(output);
  
  // Generate report file
  const reportPath = path.join(__dirname, '../COMPREHENSIVE_QUERY_TESTING_PLAN.md');
  
  if (fs.existsSync(reportPath)) {
    const timestamp = new Date().toISOString();
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    
    // Update the test results section with timestamp
    const updatedContent = reportContent.replace(
      '*This section will be populated as tests are executed*',
      `*Last updated: ${timestamp}*\n\nTest execution completed successfully. See console output above for detailed results.`
    );
    
    fs.writeFileSync(reportPath, updatedContent);
    console.log(`\n📊 Report updated: ${reportPath}`);
  }
  
  console.log('\n✅ Comprehensive tests completed successfully!');
  
} catch (error) {
  console.error('\n❌ Test execution failed:');
  console.error(error.stdout || error.message);
  
  // Still update report with failure info
  const reportPath = path.join(__dirname, '../COMPREHENSIVE_QUERY_TESTING_PLAN.md');
  if (fs.existsSync(reportPath)) {
    const timestamp = new Date().toISOString();
    const reportContent = fs.readFileSync(reportPath, 'utf8');
    
    const updatedContent = reportContent.replace(
      '*This section will be populated as tests are executed*',
      `*Last updated: ${timestamp}*\n\n❌ Test execution failed. See error details above.`
    );
    
    fs.writeFileSync(reportPath, updatedContent);
  }
  
  process.exit(1);
} 