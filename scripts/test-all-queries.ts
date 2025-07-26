#!/usr/bin/env ts-node
/**
 * Standalone Query Test Script
 * 
 * Usage: npm run test-queries
 * or: npx ts-node scripts/test-all-queries.ts
 * 
 * Tests all predefined queries and generates comprehensive report
 */

import { AutomatedQueryTestRunner } from '../__tests__/automated-query-test-runner';
import * as fs from 'fs';
import * as path from 'path';

interface TestOptions {
  categories?: string[];         // Specific categories to test
  includePerformance?: boolean; // Include performance benchmarking
  exportResults?: boolean;      // Export detailed results to JSON
  verbose?: boolean;           // Verbose logging
  parallel?: boolean;          // Run tests in parallel (when supported)
}

class QueryTestCLI {
  private options: TestOptions;

  constructor(options: TestOptions = {}) {
    this.options = {
      includePerformance: true,
      exportResults: true,
      verbose: false,
      parallel: false,
      ...options
    };
  }

  async run(): Promise<void> {
    console.log('🔧 MPIQ AI Chat - Automated Query Testing');
    console.log('=========================================\n');

    const runner = new AutomatedQueryTestRunner();
    
    try {
      // Run the tests
      console.log('⏳ Running comprehensive query tests...\n');
      const summary = await runner.runAllQueryTests();
      
      // Print the report
      runner.printDetailedReport(summary);
      
      // Export results if requested
      if (this.options.exportResults) {
        await this.exportTestResults(runner, summary);
      }
      
      // Performance recommendations
      if (this.options.includePerformance) {
        this.generatePerformanceRecommendations(summary);
      }
      
      // Success/failure summary
      this.printFinalSummary(summary);
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    }
  }

  private async exportTestResults(runner: AutomatedQueryTestRunner, summary: any): Promise<void> {
    try {
      const resultsDir = path.join(process.cwd(), 'test-results');
      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // Export detailed JSON results
      const jsonFile = path.join(resultsDir, `query-test-results-${timestamp}.json`);
      fs.writeFileSync(jsonFile, runner.exportResults(summary));
      
      // Export summary CSV for analysis
      const csvFile = path.join(resultsDir, `query-test-summary-${timestamp}.csv`);
      this.exportSummaryCSV(summary, csvFile);
      
      // Export markdown report
      const mdFile = path.join(resultsDir, `query-test-report-${timestamp}.md`);
      this.exportMarkdownReport(summary, mdFile);
      
      console.log(`\n📁 EXPORTED RESULTS:`);
      console.log(`   JSON: ${jsonFile}`);
      console.log(`   CSV:  ${csvFile}`);
      console.log(`   MD:   ${mdFile}`);
      
    } catch (error) {
      console.error('⚠️  Failed to export results:', error);
    }
  }

  private exportSummaryCSV(summary: any, filepath: string): void {
    const csvLines = [
      'Category,Total,Successful,Success Rate,Avg Execution Time',
      ...Object.entries(summary.categorySummary).map(([category, stats]: [string, any]) => 
        `"${category}",${stats.total},${stats.successful},${(stats.successful/stats.total*100).toFixed(1)}%,${summary.averageExecutionTime.toFixed(0)}ms`
      )
    ];
    
    fs.writeFileSync(filepath, csvLines.join('\n'));
  }

  private exportMarkdownReport(summary: any, filepath: string): void {
    const report = `# Automated Query Test Report

## Overview
- **Total Queries:** ${summary.totalQueries}
- **Successful:** ${summary.successfulQueries} (${(summary.successfulQueries/summary.totalQueries*100).toFixed(1)}%)
- **Failed:** ${summary.failedQueries} (${(summary.failedQueries/summary.totalQueries*100).toFixed(1)}%)
- **Average Execution Time:** ${summary.averageExecutionTime.toFixed(0)}ms

## Category Performance
| Category | Success Rate | Queries |
|----------|-------------|---------|
${Object.entries(summary.categorySummary).map(([cat, stats]: [string, any]) => 
  `| ${cat} | ${(stats.successful/stats.total*100).toFixed(1)}% | ${stats.successful}/${stats.total} |`
).join('\n')}

## Endpoint Utilization
${Object.entries(summary.endpointUsage).map(([endpoint, count]) => 
  `- **${endpoint}:** ${count} queries`
).join('\n')}

## Visualization Types
${Object.entries(summary.visualizationTypeBreakdown).map(([type, count]) => 
  `- **${type}:** ${count} visualizations`
).join('\n')}

## Effects Integration
- **Queries with Effects:** ${summary.effectsTestResults.totalWithEffects}
- **Effects Working:** ${summary.effectsTestResults.effectsWorking}/${summary.effectsTestResults.totalWithEffects}
- **Effect Types:** ${Object.keys(summary.effectsTestResults.effectTypes).join(', ')}

## Performance Metrics
- **Fastest Query:** ${summary.performance.fastest.time}ms
- **Slowest Query:** ${summary.performance.slowest.time}ms  
- **Average Data Points:** ${summary.performance.averageDataPoints.toFixed(0)}

${summary.errors.length > 0 ? `## Errors Found
${summary.errors.map((error: any) => `- **${error.category}:** ${error.error}`).join('\n')}` : '## ✅ No Errors Found'}

---
*Report generated on ${new Date().toISOString()}*
`;

    fs.writeFileSync(filepath, report);
  }

  private generatePerformanceRecommendations(summary: any): void {
    console.log('\n🔍 PERFORMANCE ANALYSIS & RECOMMENDATIONS:');
    
    // Execution time analysis
    if (summary.averageExecutionTime > 5000) {
      console.log('   ⚠️  Average execution time is high (>5s). Consider:');
      console.log('      • Optimizing database queries');
      console.log('      • Implementing result caching');
      console.log('      • Reducing data processing complexity');
    } else {
      console.log('   ✅ Execution times are within acceptable range');
    }
    
    // Success rate analysis
    const successRate = summary.successfulQueries / summary.totalQueries;
    if (successRate < 0.8) {
      console.log('   ⚠️  Success rate is below 80%. Priority areas:');
      
      // Identify problematic categories
      const problematicCategories = Object.entries(summary.categorySummary)
        .filter(([_, stats]: [string, any]) => stats.successful / stats.total < 0.7);
      
      if (problematicCategories.length > 0) {
        console.log('      • Focus on categories with low success rates:');
        problematicCategories.forEach(([cat, stats]: [string, any]) => {
          console.log(`        - ${cat}: ${(stats.successful/stats.total*100).toFixed(1)}%`);
        });
      }
    }
    
    // Effects integration analysis
    if (summary.effectsTestResults.totalWithEffects > 0) {
      const effectsRate = summary.effectsTestResults.effectsWorking / summary.effectsTestResults.totalWithEffects;
      if (effectsRate < 0.9) {
        console.log('   ⚠️  Effects integration needs attention:');
        console.log(`      • Effects success rate: ${(effectsRate*100).toFixed(1)}%`);
      } else {
        console.log('   ✅ Effects integration is working well');
      }
    }
    
    // Data volume analysis
    if (summary.performance.averageDataPoints < 10) {
      console.log('   ⚠️  Low average data points may indicate:');
      console.log('      • Data quality issues');
      console.log('      • Overly restrictive filters');
      console.log('      • API response limitations');
    }
  }

  private printFinalSummary(summary: any): void {
    const successRate = summary.successfulQueries / summary.totalQueries;
    const effectsRate = summary.effectsTestResults.totalWithEffects > 0 
      ? summary.effectsTestResults.effectsWorking / summary.effectsTestResults.totalWithEffects 
      : 1;

    console.log('\n' + '🎯 FINAL TEST SUMMARY'.padEnd(50, '='));
    
    if (successRate >= 0.9) {
      console.log('✅ EXCELLENT: >90% queries successful');
    } else if (successRate >= 0.8) {
      console.log('✅ GOOD: >80% queries successful');
    } else if (successRate >= 0.7) {
      console.log('⚠️  ACCEPTABLE: >70% queries successful');
    } else {
      console.log('❌ NEEDS ATTENTION: <70% queries successful');
    }

    if (effectsRate >= 0.9) {
      console.log('✨ EFFECTS: Working excellently');
    } else if (effectsRate >= 0.8) {
      console.log('✨ EFFECTS: Working well');  
    } else {
      console.log('⚠️  EFFECTS: Need improvement');
    }

    if (summary.averageExecutionTime < 3000) {
      console.log('⚡ PERFORMANCE: Fast response times');
    } else if (summary.averageExecutionTime < 6000) {
      console.log('⚡ PERFORMANCE: Acceptable response times');
    } else {
      console.log('⚠️  PERFORMANCE: Slow response times');
    }

    console.log('='.repeat(50));
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const options: TestOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--no-export':
        options.exportResults = false;
        break;
      case '--no-performance':
        options.includePerformance = false;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--categories':
        if (args[i + 1]) {
          options.categories = args[i + 1].split(',');
          i++; // Skip next argument
        }
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: npm run test-queries [options]

Options:
  --no-export        Skip exporting results to files
  --no-performance   Skip performance analysis
  --verbose, -v      Verbose logging
  --parallel         Run tests in parallel (experimental)
  --categories       Comma-separated list of categories to test
  --help, -h         Show this help message

Examples:
  npm run test-queries
  npm run test-queries --verbose --no-export
  npm run test-queries --categories ranking,comparison
        `);
        process.exit(0);
    }
  }

  const cli = new QueryTestCLI(options);
  await cli.run();
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export { QueryTestCLI };