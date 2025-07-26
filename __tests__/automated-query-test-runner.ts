/**
 * Automated Query Test Runner
 * 
 * Tests all predefined queries from components/chat/chat-constants.ts
 * through the complete pipeline: submission → analysis → visualization
 */

import { AnalysisEngine } from '../lib/analysis/AnalysisEngine';
import { ConfigurationManager } from '../lib/analysis/ConfigurationManager';
import { VisualizationRenderer } from '../lib/analysis/VisualizationRenderer';
import { ANALYSIS_CATEGORIES, TRENDS_CATEGORIES } from '../components/chat/chat-constants';

interface QueryTestResult {
  query: string;
  category: string;
  success: boolean;
  executionTime: number;
  endpoint?: string;
  analysisSuccess: boolean;
  visualizationSuccess: boolean;
  effectsEnabled: boolean;
  dataPointCount: number;
  error?: string;
  visualizationType?: string;
  hasEffectFlags?: boolean;
  renderingStrategy?: string;
  performanceStats?: any;
}

interface TestRunSummary {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  averageExecutionTime: number;
  categorySummary: { [key: string]: { total: number; successful: number } };
  endpointUsage: { [key: string]: number };
  visualizationTypeBreakdown: { [key: string]: number };
  effectsTestResults: {
    totalWithEffects: number;
    effectsWorking: number;
    effectTypes: { [key: string]: number };
  };
  errors: { query: string; error: string; category: string }[];
  performance: {
    fastest: { query: string; time: number };
    slowest: { query: string; time: number };
    averageDataPoints: number;
  };
}

export class AutomatedQueryTestRunner {
  private analysisEngine: AnalysisEngine;
  private configManager: ConfigurationManager;
  private visualizationRenderer: VisualizationRenderer;
  private results: QueryTestResult[] = [];

  constructor() {
    this.configManager = ConfigurationManager.getInstance();
    this.analysisEngine = AnalysisEngine.getInstance(this.configManager as any);
    this.visualizationRenderer = new VisualizationRenderer(this.configManager);
    
    console.log('[AutomatedQueryTestRunner] Initialized test runner');
  }

  /**
   * Run all predefined queries through the complete pipeline
   */
  async runAllQueryTests(): Promise<TestRunSummary> {
    console.log('🚀 Starting automated testing of all predefined queries...');
    
    const startTime = Date.now();
    this.results = [];

    // Test ANALYSIS_CATEGORIES
    for (const [category, queries] of Object.entries(ANALYSIS_CATEGORIES)) {
      console.log(`\n📋 Testing category: ${category}`);
      for (const query of queries) {
        await this.testSingleQuery(query, category, 'ANALYSIS_CATEGORIES');
      }
    }

    // Test TRENDS_CATEGORIES  
    for (const [category, queries] of Object.entries(TRENDS_CATEGORIES)) {
      console.log(`\n📈 Testing category: ${category}`);
      for (const query of queries) {
        await this.testSingleQuery(query, category, 'TRENDS_CATEGORIES');
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`\n✅ Completed all query tests in ${(totalTime / 1000).toFixed(2)}s`);

    return this.generateSummary();
  }

  /**
   * Test a single query through the complete pipeline
   */
  private async testSingleQuery(query: string, category: string, source: string): Promise<void> {
    const result: QueryTestResult = {
      query,
      category: `${source}:${category}`,
      success: false,
      executionTime: 0,
      analysisSuccess: false,
      visualizationSuccess: false,
      effectsEnabled: false,
      dataPointCount: 0
    };

    const startTime = Date.now();
    
    try {
      console.log(`  🔍 Testing: "${query.substring(0, 60)}..."`);

      // Step 1: Analysis Engine Processing
      const analysisResult = await (this.analysisEngine as any).analyzeQuery(query);
      result.analysisSuccess = analysisResult.success;
      result.endpoint = analysisResult.endpoint;
      result.dataPointCount = analysisResult.data?.records?.length || 0;
      
      if (!analysisResult.success) {
        result.error = analysisResult.error || 'Analysis failed';
        result.executionTime = Date.now() - startTime;
        this.results.push(result);
        console.log(`    ❌ Analysis failed: ${result.error}`);
        return;
      }

      // Step 2: Visualization Generation
      try {
        const visualization = this.visualizationRenderer.createVisualization(
          analysisResult.data, 
          analysisResult.endpoint
        );
        
        result.visualizationSuccess = true;
        result.visualizationType = visualization.type;
        
        // Step 3: Check for Effects Integration
        result.hasEffectFlags = this.checkForEffectFlags(visualization.renderer);
        result.effectsEnabled = !!visualization._pendingEffects?.enabled;
        result.renderingStrategy = (visualization.renderer as any)?._renderingStrategy;
        
        // Step 4: Effects Performance Test (if applicable)
        if (result.effectsEnabled) {
          result.performanceStats = this.simulateEffectsPerformance(visualization);
        }

        result.success = true;
        console.log(`    ✅ Success: ${visualization.type} visualization with ${result.dataPointCount} points${result.effectsEnabled ? ' + effects' : ''}`);
        
      } catch (vizError) {
        result.error = `Visualization failed: ${vizError}`;
        console.log(`    ❌ Visualization failed: ${vizError}`);
      }

    } catch (error) {
      result.error = `Pipeline error: ${error}`;
      console.log(`    ❌ Pipeline error: ${error}`);
    }

    result.executionTime = Date.now() - startTime;
    this.results.push(result);
  }

  /**
   * Check if renderer has effect flags set
   */
  private checkForEffectFlags(renderer: any): boolean {
    if (!renderer || typeof renderer !== 'object') return false;
    
    return !!(
      renderer._fireflyMode ||
      renderer._visualEffects ||
      renderer._dualVariable ||
      renderer._useCentroids ||
      renderer._enhancedEffects
    );
  }

  /**
   * Simulate effects performance testing
   */
  private simulateEffectsPerformance(visualization: any): any {
    const stats = {
      effectTypes: [],
      estimatedParticles: 0,
      performanceImpact: 'unknown'
    };

    const renderer = visualization.renderer;
    if (renderer?._fireflyMode) {
      (stats.effectTypes as any).push('firefly');
      stats.estimatedParticles += Math.min(visualization._pendingEffects?.visualizationData?.records?.length || 0, 50);
    }
    
    if (renderer?._visualEffects?.hover) {
      (stats.effectTypes as any).push('hover');
    }
    
    if (renderer?._visualEffects?.gradient) {
      (stats.effectTypes as any).push('gradient');
    }

    // Estimate performance impact
    if (stats.estimatedParticles > 100) {
      stats.performanceImpact = 'high';
    } else if (stats.estimatedParticles > 30) {
      stats.performanceImpact = 'medium';
    } else {
      stats.performanceImpact = 'low';
    }

    return stats;
  }

  /**
   * Generate comprehensive test summary
   */
  private generateSummary(): TestRunSummary {
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    const summary: TestRunSummary = {
      totalQueries: this.results.length,
      successfulQueries: successful.length,
      failedQueries: failed.length,
      averageExecutionTime: this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length,
      categorySummary: {},
      endpointUsage: {},
      visualizationTypeBreakdown: {},
      effectsTestResults: {
        totalWithEffects: 0,
        effectsWorking: 0,
        effectTypes: {}
      },
      errors: failed.map(r => ({ query: r.query, error: r.error || 'Unknown error', category: r.category })),
      performance: {
        fastest: { query: '', time: Infinity },
        slowest: { query: '', time: 0 },
        averageDataPoints: 0
      }
    };

    // Calculate category summary
    for (const result of this.results) {
      const category = result.category;
      if (!summary.categorySummary[category]) {
        summary.categorySummary[category] = { total: 0, successful: 0 };
      }
      summary.categorySummary[category].total++;
      if (result.success) {
        summary.categorySummary[category].successful++;
      }
    }

    // Calculate endpoint usage
    for (const result of successful) {
      if (result.endpoint) {
        summary.endpointUsage[result.endpoint] = (summary.endpointUsage[result.endpoint] || 0) + 1;
      }
    }

    // Calculate visualization type breakdown
    for (const result of successful) {
      if (result.visualizationType) {
        summary.visualizationTypeBreakdown[result.visualizationType] = 
          (summary.visualizationTypeBreakdown[result.visualizationType] || 0) + 1;
      }
    }

    // Calculate effects statistics
    const withEffects = this.results.filter(r => r.effectsEnabled);
    summary.effectsTestResults.totalWithEffects = withEffects.length;
    summary.effectsTestResults.effectsWorking = withEffects.filter(r => r.success).length;

    for (const result of withEffects) {
      if (result.performanceStats?.effectTypes) {
        for (const effectType of result.performanceStats.effectTypes) {
          summary.effectsTestResults.effectTypes[effectType] = 
            (summary.effectsTestResults.effectTypes[effectType] || 0) + 1;
        }
      }
    }

    // Calculate performance metrics
    for (const result of this.results) {
      if (result.executionTime < summary.performance.fastest.time) {
        summary.performance.fastest = { query: result.query, time: result.executionTime };
      }
      if (result.executionTime > summary.performance.slowest.time) {
        summary.performance.slowest = { query: result.query, time: result.executionTime };
      }
    }
    
    summary.performance.averageDataPoints = 
      successful.reduce((sum, r) => sum + r.dataPointCount, 0) / successful.length || 0;

    return summary;
  }

  /**
   * Print detailed test report
   */
  printDetailedReport(summary: TestRunSummary): void {
    console.log('\n' + '='.repeat(80));
    console.log('📊 AUTOMATED QUERY TEST REPORT');
    console.log('='.repeat(80));

    // Overview
    console.log(`\n🔍 OVERVIEW:`);
    console.log(`   Total Queries Tested: ${summary.totalQueries}`);
    console.log(`   Successful: ${summary.successfulQueries} (${(summary.successfulQueries/summary.totalQueries*100).toFixed(1)}%)`);
    console.log(`   Failed: ${summary.failedQueries} (${(summary.failedQueries/summary.totalQueries*100).toFixed(1)}%)`);
    console.log(`   Average Execution Time: ${summary.averageExecutionTime.toFixed(0)}ms`);

    // Category Breakdown
    console.log(`\n📋 CATEGORY PERFORMANCE:`);
    for (const [category, stats] of Object.entries(summary.categorySummary)) {
      const successRate = (stats.successful / stats.total * 100).toFixed(1);
      console.log(`   ${category}: ${stats.successful}/${stats.total} (${successRate}%)`);
    }

    // Endpoint Usage
    console.log(`\n🎯 ENDPOINT UTILIZATION:`);
    for (const [endpoint, count] of Object.entries(summary.endpointUsage)) {
      console.log(`   ${endpoint}: ${count} queries`);
    }

    // Visualization Types
    console.log(`\n🎨 VISUALIZATION TYPE DISTRIBUTION:`);
    for (const [type, count] of Object.entries(summary.visualizationTypeBreakdown)) {
      console.log(`   ${type}: ${count} visualizations`);
    }

    // Effects Testing
    console.log(`\n✨ EFFECTS INTEGRATION TESTING:`);
    console.log(`   Queries with Effects: ${summary.effectsTestResults.totalWithEffects}`);
    console.log(`   Effects Working: ${summary.effectsTestResults.effectsWorking}/${summary.effectsTestResults.totalWithEffects}`);
    if (Object.keys(summary.effectsTestResults.effectTypes).length > 0) {
      console.log(`   Effect Types Tested:`);
      for (const [type, count] of Object.entries(summary.effectsTestResults.effectTypes)) {
        console.log(`     ${type}: ${count} instances`);
      }
    }

    // Performance Metrics
    console.log(`\n⚡ PERFORMANCE METRICS:`);
    console.log(`   Fastest Query: ${summary.performance.fastest.time}ms`);
    console.log(`     "${summary.performance.fastest.query.substring(0, 50)}..."`);
    console.log(`   Slowest Query: ${summary.performance.slowest.time}ms`);
    console.log(`     "${summary.performance.slowest.query.substring(0, 50)}..."`);
    console.log(`   Average Data Points: ${summary.performance.averageDataPoints.toFixed(0)}`);

    // Errors
    if (summary.errors.length > 0) {
      console.log(`\n❌ ERROR ANALYSIS:`);
      const errorGroups: { [key: string]: string[] } = {};
      for (const error of summary.errors) {
        const errorType = error.error.split(':')[0];
        if (!errorGroups[errorType]) errorGroups[errorType] = [];
        errorGroups[errorType].push(`${error.category}: ${error.query.substring(0, 40)}...`);
      }
      
      for (const [errorType, queries] of Object.entries(errorGroups)) {
        console.log(`   ${errorType} (${queries.length} occurrences):`);
        queries.slice(0, 3).forEach(q => console.log(`     • ${q}`));
        if (queries.length > 3) console.log(`     ... and ${queries.length - 3} more`);
      }
    }

    console.log('\n' + '='.repeat(80));
  }

  /**
   * Export results to JSON for further analysis
   */
  exportResults(summary: TestRunSummary): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      summary,
      detailedResults: this.results
    };
    
    return JSON.stringify(exportData, null, 2);
  }
}