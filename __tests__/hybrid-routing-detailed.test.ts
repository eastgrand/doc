/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ============================================================================
 * 🚨 HYBRID ROUTING DETAILED TEST WITH COMPREHENSIVE FAILURE ANALYSIS 🚨
 * ============================================================================
 * 
 * Enhanced version with detailed reporting similar to query-to-visualization-pipeline.test.ts
 * This provides actionable insights for debugging and improvement.
 */

import { jest } from '@jest/globals';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Hybrid routing system imports
import { 
  hybridRoutingEngine, 
  hybridRoutingTestSuite,
  domainConfigLoader
} from '../lib/routing';

// Test data from chat constants for real-world validation
import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';

interface DetailedTestResult {
  // Basic info
  query: string;
  category: string;
  timestamp: string;
  success: boolean;
  
  // Expected vs Actual
  expected_endpoint: string;
  actual_endpoint?: string;
  expected_scope: string;
  actual_scope: string;
  routing_accurate: boolean;
  
  // Routing details
  routing_method: 'hybrid' | 'error';
  processing_time: number;
  layers_executed: string[];
  early_exit?: string;
  
  // Layer analysis
  validation_result: {
    scope: string;
    confidence: number;
    reasons?: string[];
  };
  intent_classification: {
    primary_intent: string;
    confidence: number;
    secondary_intents: string[];
    matched_categories: number;
    reasoning: string[];
  };
  domain_adaptation: {
    enhanced_query?: any;
    domain_relevance: number;
    synonym_expansions: number;
    boost_score: number;
    penalty_score: number;
  };
  context_enhancement: {
    field_discoveries: number;
    contextual_boost: number;
    coverage_score: number;
    field_requirements: any;
  };
  confidence_management: {
    final_confidence: number;
    recommended_action: string;
    threshold_met: boolean;
    alternatives_provided: number;
  };
  
  // Response analysis
  user_response: {
    type: string;
    message: string;
    suggestions?: string[];
    alternatives?: any[];
  };
  
  // Detailed reasoning
  reasoning_chain: string[];
  
  // Failure analysis
  failure_points: string[];
  recommendations: string[];
  
  // Error details
  error?: string;
  error_stack?: string;
}

// Enhanced report generation with detailed failure analysis
async function generateDetailedHybridReport(testResults: DetailedTestResult[], summary: any) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const baseFileName = `hybrid-routing-detailed-results-${timestamp}`;
  
  // Generate comprehensive JSON report
  const jsonReport = {
    metadata: {
      testSuite: 'Hybrid Routing System Detailed Analysis',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      architecture: '5-layer hybrid routing',
      totalQueries: summary.totalQueries,
      successCount: summary.successCount,
      errorCount: summary.errorCount,
      successRate: `${((summary.successCount / summary.totalQueries) * 100).toFixed(1)}%`,
      avgProcessingTime: `${summary.avgProcessingTime}ms`,
    },
    summary: {
      categoryBreakdown: summary.categoryBreakdown,
      layerPerformance: summary.layerPerformance,
      failureAnalysis: summary.failureAnalysis,
      recommendations: summary.recommendations
    },
    detailed_results: testResults
  };

  try {
    writeFileSync(
      join(process.cwd(), `${baseFileName}.json`), 
      JSON.stringify(jsonReport, null, 2)
    );

    // Generate detailed markdown report
    const markdown = generateDetailedMarkdownReport(testResults, summary);
    writeFileSync(
      join(process.cwd(), `${baseFileName}.md`), 
      markdown
    );

    console.log(`\n📊 Detailed hybrid routing reports generated:`);
    console.log(`   📋 ${baseFileName}.json - Complete data with failure analysis`);
    console.log(`   📄 ${baseFileName}.md - Detailed troubleshooting guide`);
  } catch (error) {
    console.log('Could not write report files:', error);
  }
}

function generateDetailedMarkdownReport(testResults: DetailedTestResult[], summary: any): string {
  const timestamp = new Date().toISOString();
  
  let markdown = `# Hybrid Routing System Detailed Test Results & Failure Analysis

**Generated**: ${timestamp}  
**Test Suite**: Detailed Routing Analysis with Failure Debugging  
**Architecture**: 5-Layer Hybrid Routing System

## Executive Summary

- **Total Queries Tested**: ${summary.totalQueries}
- **Successful Routes**: ${summary.successCount}
- **Failed Routes**: ${summary.errorCount}
- **Success Rate**: ${((summary.successCount / summary.totalQueries) * 100).toFixed(1)}%
- **Average Processing Time**: ${summary.avgProcessingTime}ms

## Failure Analysis Overview

`;

  // Add failure category breakdown
  const failuresByCategory = {};
  const failuresByLayer = {};
  const failuresByReason = {};

  testResults.forEach(result => {
    if (!result.success) {
      // Category failures
      failuresByCategory[result.category] = (failuresByCategory[result.category] || 0) + 1;
      
      // Layer failures
      result.failure_points.forEach(point => {
        failuresByLayer[point] = (failuresByLayer[point] || 0) + 1;
      });
      
      // Reason failures
      result.failure_points.forEach(point => {
        failuresByReason[point] = (failuresByReason[point] || 0) + 1;
      });
    }
  });

  markdown += `### Failure Distribution by Category
| Category | Failures | Success Rate |
|----------|----------|--------------|
`;

  Object.entries(summary.categoryBreakdown).forEach(([category, stats]: [string, any]) => {
    const failureRate = ((stats.failed / stats.total) * 100).toFixed(1);
    const successRate = ((stats.success / stats.total) * 100).toFixed(1);
    markdown += `| ${category} | ${stats.failed}/${stats.total} | ${successRate}% |\n`;
  });

  markdown += `
### Query Category Results
| Category | Total | Success | Rate | Avg Time |
|----------|-------|---------|------|----------|
`;

  Object.entries(summary.categoryPerformance).forEach(([category, stats]: [string, any]) => {
    const rate = ((stats.success / stats.total) * 100).toFixed(1);
    const avgTime = stats.total > 0 ? (stats.totalTime / stats.total).toFixed(1) : '0.0';
    markdown += `| ${category} | ${stats.total} | ${stats.success} | ${rate}% | ${avgTime}ms |\n`;
  });

  markdown += `
### Top Failure Points
| Issue | Occurrences | Percentage |
|-------|------------|------------|
`;

  Object.entries(failuresByReason)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 5)
    .forEach(([reason, count]) => {
      const percentage = (((count as number) / summary.errorCount) * 100).toFixed(1);
      markdown += `| ${reason} | ${count} | ${percentage}% |\n`;
    });

  markdown += `
## Layer Performance Analysis

### Layer Execution Success Rates
`;

  Object.entries(summary.layerPerformance).forEach(([layer, stats]: [string, any]) => {
    markdown += `
#### ${layer.charAt(0).toUpperCase() + layer.slice(1)} Layer
- **Success Rate**: ${stats.successRate}%
- **Average Processing Time**: ${stats.avgTime}ms
- **Common Issues**: ${stats.commonIssues.join(', ')}
`;
  });

  markdown += `
## Detailed Query Results

### ✅ Successful Queries
`;

  const successfulResults = testResults.filter(r => r.success);
  successfulResults.forEach((result, index) => {
    markdown += `
#### Success ${index + 1}: "${result.query}"
- **Category**: ${result.category}
- **Expected**: \`${result.expected_endpoint}\` | **Actual**: \`${result.actual_endpoint}\`
- **Processing Time**: ${result.processing_time}ms
- **Intent Confidence**: ${(result.intent_classification.confidence * 100).toFixed(1)}%
- **Final Confidence**: ${(result.confidence_management.final_confidence * 100).toFixed(1)}%
- **Layers**: ${result.layers_executed.join(' → ')}
- **Reasoning**: ${result.reasoning_chain.slice(0, 2).join('; ')}
`;
  });

  markdown += `
### ❌ Failed Queries (Detailed Analysis)
`;

  const failedResults = testResults.filter(r => !r.success);
  failedResults.forEach((result, index) => {
    markdown += `
#### Failure ${index + 1}: "${result.query}"

**Basic Info:**
- **Category**: ${result.category}
- **Expected Endpoint**: \`${result.expected_endpoint}\`
- **Actual Result**: ${result.success ? 'SUCCESS' : 'FAILED'}
- **Processing Time**: ${result.processing_time}ms
- **Routing Accurate**: ${result.routing_accurate ? 'YES' : 'NO'}

**Layer Analysis:**
- **Validation Scope**: ${result.validation_result.scope} (${(result.validation_result.confidence * 100).toFixed(1)}% confidence)
- **Intent Classification**: ${result.intent_classification.primary_intent} (${(result.intent_classification.confidence * 100).toFixed(1)}% confidence)
- **Domain Relevance**: ${(result.domain_adaptation.domain_relevance * 100).toFixed(1)}%
- **Final Confidence**: ${(result.confidence_management.final_confidence * 100).toFixed(1)}%
- **Action**: ${result.confidence_management.recommended_action}

**Failure Points:**
${result.failure_points.map(point => `- ❌ ${point}`).join('\n')}

**Detailed Reasoning Chain:**
${result.reasoning_chain.map((reason, i) => `${i + 1}. ${reason}`).join('\n')}

**User Response:**
- **Type**: ${result.user_response.type}
- **Message**: "${result.user_response.message}"
${result.user_response.suggestions ? `- **Suggestions**: ${result.user_response.suggestions.join(', ')}` : ''}

**Recommendations:**
${result.recommendations.map(rec => `- 💡 ${rec}`).join('\n')}

${result.error ? `**Error Details:**
\`\`\`
${result.error}
\`\`\`` : ''}

---
`;
  });

  markdown += `
## Actionable Recommendations

### Immediate Actions (High Priority)
`;

  const highPriorityRecs = summary.recommendations.filter((rec: any) => rec.priority === 'high');
  highPriorityRecs.forEach((rec: any) => {
    markdown += `
#### ${rec.title}
**Issue**: ${rec.issue}  
**Impact**: ${rec.impact}  
**Solution**: ${rec.solution}  
**Estimated Effort**: ${rec.effort}
`;
  });

  markdown += `
### System Improvements (Medium Priority)
`;

  const mediumPriorityRecs = summary.recommendations.filter((rec: any) => rec.priority === 'medium');
  mediumPriorityRecs.forEach((rec: any) => {
    markdown += `
#### ${rec.title}
**Issue**: ${rec.issue}  
**Solution**: ${rec.solution}  
**Estimated Effort**: ${rec.effort}
`;
  });

  markdown += `
## Configuration Tuning Suggestions

Based on the failure analysis, here are specific configuration changes:

### Intent Classification Tuning
\`\`\`typescript
// Suggested intent signature improvements
const improvedSignatures = {
  strategic_analysis: {
    boost_terms: ['strategic', 'expansion', 'opportunities', 'growth'],
    required_confidence: 0.3, // Lower threshold for strategic queries
  },
  demographic_analysis: {
    boost_terms: ['demographic', 'population', 'customer', 'profile'],
    required_confidence: 0.4
  }
};
\`\`\`

### Domain Vocabulary Enhancements  
\`\`\`typescript
// Additional synonyms to improve matching
const synonymExpansions = {
  'strategic': ['expansion', 'growth', 'opportunity', 'market'],
  'competitive': ['competition', 'competitor', 'positioning', 'advantage'],
  'demographic': ['population', 'customer', 'profile', 'segment']
};
\`\`\`

## Summary & Next Steps

**Current State**: ${((summary.successCount / summary.totalQueries) * 100).toFixed(1)}% success rate indicates significant room for improvement.

**Root Causes**: 
${Object.keys(failuresByReason).slice(0, 3).map(reason => `- ${reason}`).join('\n')}

**Immediate Priorities**:
1. Fix intent classification confidence thresholds
2. Improve domain vocabulary matching
3. Enhance reasoning chain logic
4. Add more specific endpoint mappings

**Timeline**: With focused optimization, success rate should reach >80% within 2-3 weeks.
`;

  return markdown;
}

describe('Hybrid Routing System Detailed Analysis', () => {
  beforeAll(async () => {
    // Initialize with detailed logging
    console.log('🔧 Initializing hybrid routing system for detailed analysis...');
    await hybridRoutingEngine.initialize();
  });

  test('should perform comprehensive routing analysis with detailed failure tracking', async () => {
    console.log('🧪 Starting comprehensive hybrid routing analysis...\n');
    
    // Get all queries from ANALYSIS_CATEGORIES for real-world testing
    const testQueries: { query: string, category: string, expected_endpoint: string }[] = [];
    
    // Category to endpoint mapping
    const categoryEndpointMap: Record<string, string> = {
      'Strategic Analysis': '/strategic-analysis',
      'Comparative Analysis': '/comparative-analysis', 
      'Competitive Analysis': '/competitive-analysis',
      'Demographic Insights': '/demographic-insights',
      'Customer Profile': '/customer-profile',
      'Spatial Clusters': '/spatial-clusters',
      'Brand Difference': '/brand-difference',
      'Scenario Analysis': '/scenario-analysis',
      'Feature Interactions': '/feature-interactions',
      'Segment Profiling': '/segment-profiling',
      'Sensitivity Analysis': '/sensitivity-analysis',
      'Feature Importance Ranking': '/feature-importance-ranking',
      'Model Performance': '/model-performance',
      'Algorithm Comparison': '/algorithm-comparison',
      'Ensemble Analysis': '/ensemble-analysis',
      'Model Selection': '/model-selection',
      'Dimensionality Insights': '/dimensionality-insights',
      'Consensus Analysis': '/consensus-analysis',
      'Anomaly Insights': '/anomaly-insights',
      'Cluster Analysis': '/cluster-analysis',
      'Correlation Analysis': '/correlation-analysis',
      'Trend Analysis': '/trend-analysis',
      'Outlier Detection': '/anomaly-insights'  // Fix mapping
    };

    // Sample from each category for comprehensive testing
    Object.entries(ANALYSIS_CATEGORIES).forEach(([category, queries]) => {
      const expectedEndpoint = categoryEndpointMap[category] || '/analyze';
      // Take first 2 queries from each category for detailed analysis
      queries.slice(0, 2).forEach(query => {
        testQueries.push({ query, category, expected_endpoint: expectedEndpoint });
      });
    });

    console.log(`Testing ${testQueries.length} queries across ${Object.keys(ANALYSIS_CATEGORIES).length} categories`);

    const testResults: DetailedTestResult[] = [];
    let successCount = 0;
    let errorCount = 0;
    const categoryStats: Record<string, { total: number, success: number, failed: number, totalTime: number }> = {};

    // Initialize category stats
    Object.keys(ANALYSIS_CATEGORIES).forEach(category => {
      categoryStats[category] = { total: 0, success: 0, failed: 0, totalTime: 0 };
    });

    // Test each query with detailed analysis
    for (const { query, category, expected_endpoint } of testQueries) {
      const startTime = performance.now();
      
      const result: DetailedTestResult = {
        query,
        category,
        timestamp: new Date().toISOString(),
        success: false,
        expected_endpoint,
        expected_scope: 'in_scope',
        actual_scope: 'unknown',
        routing_accurate: false,
        routing_method: 'hybrid',
        processing_time: 0,
        layers_executed: [],
        validation_result: { scope: '', confidence: 0 },
        intent_classification: { primary_intent: '', confidence: 0, secondary_intents: [], matched_categories: 0, reasoning: [] },
        domain_adaptation: { domain_relevance: 0, synonym_expansions: 0, boost_score: 0, penalty_score: 0 },
        context_enhancement: { field_discoveries: 0, contextual_boost: 0, coverage_score: 0, field_requirements: {} },
        confidence_management: { final_confidence: 0, recommended_action: '', threshold_met: false, alternatives_provided: 0 },
        user_response: { type: '', message: '' },
        reasoning_chain: [],
        failure_points: [],
        recommendations: []
      };

      categoryStats[category].total++;

      try {
        console.log(`Testing: [${category}] "${query}"`);
        
        // Route query with detailed analysis
        const routingResult = await hybridRoutingEngine.route(query);
        
        result.processing_time = performance.now() - startTime;
        result.actual_endpoint = routingResult.endpoint;
        result.actual_scope = routingResult.validation.scope;
        result.layers_executed = routingResult.metadata.layers_executed;
        result.early_exit = routingResult.metadata.early_exit;
        
        // Extract detailed layer information
        result.validation_result = {
          scope: routingResult.validation.scope,
          confidence: routingResult.validation.confidence,
          reasons: routingResult.validation.reasons
        };

        if (routingResult.routing_layers.base_intent) {
          result.intent_classification = {
            primary_intent: routingResult.routing_layers.base_intent.primary_intent,
            confidence: routingResult.routing_layers.base_intent.confidence,
            secondary_intents: routingResult.routing_layers.base_intent.secondary_intents?.map(si => si.intent) || [],
            matched_categories: routingResult.routing_layers.base_intent.matched_categories || 0,
            reasoning: routingResult.routing_layers.base_intent.reasoning || []
          };
        }

        if (routingResult.routing_layers.domain_enhancement) {
          result.domain_adaptation = {
            enhanced_query: routingResult.routing_layers.domain_enhancement.enhanced_query,
            domain_relevance: routingResult.routing_layers.domain_enhancement.domain_relevance || 0,
            synonym_expansions: Object.keys(routingResult.routing_layers.domain_enhancement.entity_context || {}).length,
            boost_score: 0, // Would need to extract from actual implementation
            penalty_score: 0
          };
        }

        if (routingResult.routing_layers.final_decision) {
          result.context_enhancement = {
            field_discoveries: routingResult.routing_layers.final_decision.enhancements?.length || 0,
            contextual_boost: routingResult.routing_layers.final_decision.contextual_score || 0,
            coverage_score: routingResult.routing_layers.final_decision.field_requirements?.coverage_score || 0,
            field_requirements: routingResult.routing_layers.final_decision.field_requirements
          };
        }

        result.confidence_management = {
          final_confidence: routingResult.confidence || 0,
          recommended_action: routingResult.user_response.type,
          threshold_met: routingResult.success,
          alternatives_provided: routingResult.alternatives?.length || 0
        };

        result.user_response = {
          type: routingResult.user_response.type,
          message: routingResult.user_response.message,
          suggestions: routingResult.user_response.suggestions,
          alternatives: routingResult.alternatives
        };

        result.reasoning_chain = routingResult.reasoning || [];
        
        // Determine success and routing accuracy
        result.routing_accurate = routingResult.endpoint === expected_endpoint;
        result.success = routingResult.success && result.routing_accurate;
        
        // Analyze failure points
        if (!result.success) {
          if (!routingResult.success) {
            result.failure_points.push('Query was rejected (should have been routed)');
          }
          if (!result.routing_accurate) {
            result.failure_points.push(`Incorrect endpoint: expected ${expected_endpoint}, got ${routingResult.endpoint}`);
          }
          if (result.intent_classification.confidence < 0.4) {
            result.failure_points.push(`Low intent confidence: ${(result.intent_classification.confidence * 100).toFixed(1)}%`);
          }
          if (result.confidence_management.final_confidence < 0.5) {
            result.failure_points.push(`Low final confidence: ${(result.confidence_management.final_confidence * 100).toFixed(1)}%`);
          }
          if (result.domain_adaptation.domain_relevance < 0.3) {
            result.failure_points.push(`Low domain relevance: ${(result.domain_adaptation.domain_relevance * 100).toFixed(1)}%`);
          }
        }

        // Generate recommendations based on failure points
        if (result.failure_points.length > 0) {
          result.recommendations = generateRecommendations(result, query, category);
        }

        if (result.success) {
          successCount++;
          categoryStats[category].success++;
          console.log(`✅ SUCCESS: "${query}" → ${routingResult.endpoint}`);
        } else {
          errorCount++;
          categoryStats[category].failed++;
          console.log(`❌ FAILED: "${query}" → ${result.failure_points.join('; ')}`);
        }

        categoryStats[category].totalTime += result.processing_time;

      } catch (error) {
        result.error = String(error);
        result.error_stack = error instanceof Error ? error.stack : undefined;
        result.processing_time = performance.now() - startTime;
        result.routing_method = 'error';
        result.failure_points.push(`System error: ${String(error)}`);
        result.recommendations.push('Check system logs for technical issues');
        
        errorCount++;
        categoryStats[category].failed++;
        console.log(`❌ ERROR: "${query}" → ${String(error)}`);
      }

      testResults.push(result);
    }

    // Generate comprehensive summary
    const avgProcessingTime = testResults.reduce((sum, r) => sum + r.processing_time, 0) / testResults.length;
    
    const summary = {
      totalQueries: testQueries.length,
      successCount,
      errorCount,
      avgProcessingTime: avgProcessingTime.toFixed(3),
      categoryBreakdown: categoryStats,
      categoryPerformance: categoryStats, // Add this for table compatibility
      layerPerformance: analyzeLayers(testResults),
      failureAnalysis: analyzeFailures(testResults),
      recommendations: generateSystemRecommendations(testResults, successCount, errorCount)
    };

    // Generate detailed report only if requested
    if (process.env.GENERATE_REPORTS === 'true') {
      await generateDetailedHybridReport(testResults, summary);
      console.log(`   📄 Detailed report files generated`);
    } else {
      console.log(`   📄 Report generation skipped (set GENERATE_REPORTS=true to enable)`);
    }

    console.log(`\n🎯 DETAILED HYBRID ROUTING ANALYSIS COMPLETE:`);
    console.log(`   Total queries: ${testQueries.length}`);
    console.log(`   Success rate: ${((successCount / testQueries.length) * 100).toFixed(1)}%`);
    console.log(`   Average time: ${avgProcessingTime.toFixed(3)}ms`);
    console.log(`   Detailed report generated with failure analysis`);

    // Basic assertions for Jest
    expect(testResults.length).toBe(testQueries.length);
    expect(successCount).toBeGreaterThan(0); // At least some should work
    expect(avgProcessingTime).toBeLessThan(10); // Performance should be reasonable
    
    // Log final summary
    const successRate = (successCount / testQueries.length) * 100;
    console.log(`\n📊 Final Analysis: ${successRate.toFixed(1)}% success rate needs improvement`);
    console.log(`🔧 See detailed report for specific failure analysis and recommendations`);
  });
});

// Helper function to generate specific recommendations
function generateRecommendations(result: DetailedTestResult, query: string, category: string): string[] {
  const recommendations: string[] = [];
  
  if (result.intent_classification.confidence < 0.4) {
    recommendations.push(`Improve intent signatures for "${category}" - add more specific boost terms`);
  }
  
  if (result.domain_adaptation.domain_relevance < 0.3) {
    recommendations.push(`Add domain synonyms for key terms in: "${query}"`);
  }
  
  if (result.confidence_management.final_confidence < 0.5) {
    recommendations.push(`Lower confidence threshold for ${category} category`);
  }
  
  if (!result.routing_accurate) {
    recommendations.push(`Review endpoint mapping for ${category} - may need more specific routing rules`);
  }
  
  return recommendations;
}

// Helper function to analyze layer performance
function analyzeLayers(testResults: DetailedTestResult[]): Record<string, any> {
  const layerStats: Record<string, { successes: number, failures: number, totalTime: number, issues: string[] }> = {
    validation: { successes: 0, failures: 0, totalTime: 0, issues: [] },
    base_intent: { successes: 0, failures: 0, totalTime: 0, issues: [] },
    domain_adaptation: { successes: 0, failures: 0, totalTime: 0, issues: [] },
    context_enhancement: { successes: 0, failures: 0, totalTime: 0, issues: [] },
    confidence_management: { successes: 0, failures: 0, totalTime: 0, issues: [] }
  };

  testResults.forEach(result => {
    result.layers_executed.forEach(layer => {
      if (layerStats[layer]) {
        layerStats[layer].totalTime += result.processing_time;
        if (result.success) {
          layerStats[layer].successes++;
        } else {
          layerStats[layer].failures++;
          
          // Collect layer-specific issues
          if (layer === 'base_intent' && result.intent_classification.confidence < 0.4) {
            layerStats[layer].issues.push('Low intent confidence');
          }
          if (layer === 'domain_adaptation' && result.domain_adaptation.domain_relevance < 0.3) {
            layerStats[layer].issues.push('Low domain relevance');
          }
        }
      }
    });
  });

  // Calculate performance metrics
  const performance: Record<string, any> = {};
  Object.entries(layerStats).forEach(([layer, stats]) => {
    const total = stats.successes + stats.failures;
    performance[layer] = {
      successRate: total > 0 ? ((stats.successes / total) * 100).toFixed(1) : '0',
      avgTime: total > 0 ? (stats.totalTime / total).toFixed(3) : '0',
      commonIssues: [...new Set(stats.issues)].slice(0, 3)
    };
  });

  return performance;
}

// Helper function to analyze failures
function analyzeFailures(testResults: DetailedTestResult[]): Record<string, any> {
  const failureReasons: Record<string, number> = {};
  const failedResults = testResults.filter(r => !r.success);
  
  failedResults.forEach(result => {
    result.failure_points.forEach(point => {
      failureReasons[point] = (failureReasons[point] || 0) + 1;
    });
  });

  return {
    totalFailures: failedResults.length,
    topReasons: Object.entries(failureReasons)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count, percentage: ((count as number / failedResults.length) * 100).toFixed(1) }))
  };
}

// Helper function to generate system-wide recommendations
function generateSystemRecommendations(testResults: DetailedTestResult[], successCount: number, errorCount: number): any[] {
  const successRate = (successCount / testResults.length) * 100;
  const recommendations: any[] = [];

  if (successRate < 50) {
    recommendations.push({
      priority: 'high',
      title: 'Critical: Intent Classification Overhaul',
      issue: 'Success rate below 50% indicates fundamental intent classification issues',
      impact: 'System unusable for production',
      solution: 'Retrain intent signatures with more specific patterns and lower thresholds',
      effort: '1-2 weeks'
    });
  }

  if (successRate < 70) {
    recommendations.push({
      priority: 'high', 
      title: 'Domain Vocabulary Enhancement',
      issue: 'Many queries not matching domain vocabulary effectively',
      impact: 'High false negative rate',
      solution: 'Expand synonym dictionaries and add category-specific boost terms',
      effort: '1 week'
    });
  }

  recommendations.push({
    priority: 'medium',
    title: 'Confidence Threshold Optimization',
    issue: 'Current thresholds may be too conservative',
    impact: 'Potentially rejecting valid queries',
    solution: 'A/B test different confidence thresholds per category',
    effort: '3-5 days'
  });

  return recommendations;
}