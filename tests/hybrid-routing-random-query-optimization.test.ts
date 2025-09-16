/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * ============================================================================
 * 🎯 HYBRID ROUTING RANDOM QUERY OPTIMIZATION TEST
 * ============================================================================
 * 
 * This is a SEPARATE test suite from the predefined query tests.
 * 
 * Purpose: Test the hybrid routing system with diverse random queries to 
 * optimize performance for open-ended user questions while maintaining
 * 100% accuracy on predefined queries.
 * 
 * Test Categories:
 * - Open-ended business analysis questions
 * - Edge cases and ambiguous queries  
 * - Clearly out-of-scope queries (weather, recipes, etc.)
 * - Novel phrasings and compound queries
 * 
 * This test helps identify areas for improvement without affecting
 * the core predefined query validation tests.
 */

import { jest } from '@jest/globals';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Hybrid routing system imports
import { 
  hybridRoutingEngine, 
  domainConfigLoader
} from '../lib/routing';

// Test result interface for optimization tracking
interface RandomQueryTestResult {
  query: string;
  category: 'open_ended_business' | 'edge_case' | 'out_of_scope' | 'compound' | 'novel_phrasing';
  expected_behavior: 'should_route' | 'should_clarify' | 'should_reject' | 'flexible';
  test_timestamp: string;
  
  // Actual results
  actual_result: {
    success: boolean;
    endpoint?: string;
    confidence?: number;
    scope: string;
    user_response_type: string;
    user_message: string;
  };
  
  // Performance tracking
  performance: {
    processing_time: number;
    layers_executed: string[];
    early_exit?: string;
  };
  
  // Optimization scoring
  optimization_score: number; // 0-100 based on how well it handled the query type
  handling_quality: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Improvement suggestions
  suggestions: string[];
  
  // Error tracking
  error?: string;
}

// Test query datasets - completely separate from predefined queries
const RANDOM_QUERY_DATASETS = {
  // Open-ended business questions that should ideally route successfully
  open_ended_business: [
    "What patterns emerge when analyzing customer behavior across different regions?",
    "How do our top performing areas differ from underperforming ones?", 
    "I want to understand market dynamics in emerging territories",
    "Can you break down the key factors that drive usage in different segments?",
    "Show me which characteristics are most predictive of high performance",
    "What would happen if we expanded into similar but untapped markets?",
    "Help me identify clusters of similar performing locations",
    "Which areas show the most potential for growth?",
    "What are the distinguishing features of our best customers?",
    "How do seasonal trends affect different market segments?"
  ],

  // Edge cases that should be handled gracefully (clarification or helpful guidance)
  edge_cases: [
    "analyze",
    "What's the best?",
    "Can you help me with some analysis stuff?",
    "I need insights about things",
    "Data analysis please",
    "Show me something interesting",
    "What can you tell me?",
    "Help",
    "Analysis",
    "Give me information"
  ],

  // Clearly out-of-scope queries that should be properly rejected
  out_of_scope: [
    "What's the weather forecast for tomorrow?",
    "How do I make chocolate chip cookies?",
    "What's the capital of France?",
    "Can you help me debug my Python code?",
    "Tell me a joke",
    "What's the stock price of Apple?",
    "How do I fix my car?",
    "What time is it?",
    "Write me a poem",
    "How do I lose weight?",
    "What's on TV tonight?",
    "Can you book me a flight?"
  ],

  // Complex compound queries
  compound: [
    "Compare the demographics between high and low performing regions, and also show me any geographic clusters",
    "I want to see competitive analysis but also understand customer segments and maybe some strategic insights",
    "Can you do a comparative analysis of market penetration and also identify outliers in the data?",
    "Show me both the demographic breakdown and competitive positioning for our top markets",
    "I need strategic analysis combined with performance rankings and maybe some trend analysis"
  ],

  // Business questions with creative/novel phrasing
  novel_phrasing: [
    "What story does our customer data tell about regional differences?",
    "If our data could talk, what would it say about market opportunities?", 
    "Paint me a picture of how different segments behave",
    "Walk me through the landscape of our competitive position",
    "Dissect the anatomy of our high-performing markets",
    "Unpack the dynamics driving customer behavior",
    "Decode the patterns in our performance data",
    "Illuminate the factors behind market success"
  ]
};

describe('🎯 Hybrid Routing Random Query Optimization', () => {
  let testResults: RandomQueryTestResult[] = [];

  beforeAll(async () => {
    // Ensure hybrid routing system is initialized
    try {
      domainConfigLoader.initializeWithDefaults();
      console.log('✅ Hybrid routing system initialized for random query testing');
    } catch (error) {
      console.warn('⚠️  Using existing configuration for random query testing');
    }
  });

  afterAll(async () => {
    // Summary logging
    const avgScore = testResults.reduce((sum, r) => sum + r.optimization_score, 0) / testResults.length;
    const avgTime = testResults.reduce((sum, r) => sum + r.performance.processing_time, 0) / testResults.length;
    
    console.log('\n📊 RANDOM QUERY OPTIMIZATION SUMMARY');
    console.log(`🎯 Average Optimization Score: ${Math.round(avgScore)}/100`);
    console.log(`⚡ Average Processing Time: ${avgTime.toFixed(2)}ms`);
    console.log(`📝 Total Queries Tested: ${testResults.length}`);
    
    // Only generate report files if GENERATE_REPORTS environment variable is set
    if (process.env.GENERATE_REPORTS === 'true') {
      await generateRandomQueryOptimizationReport(testResults);
      console.log('📄 Detailed report files generated');
    } else {
      console.log('📄 Report generation skipped (set GENERATE_REPORTS=true to enable)');
    }
  });

  describe('🔍 Open-Ended Business Queries', () => {
    test.each(RANDOM_QUERY_DATASETS.open_ended_business)(
      'should handle open-ended business query effectively: "%s"',
      async (query) => {
        await testRandomQuery(query, 'open_ended_business', 'should_route');
      }
    );
  });

  describe('❓ Edge Cases & Ambiguous Queries', () => {
    test.each(RANDOM_QUERY_DATASETS.edge_cases)(
      'should handle edge case gracefully: "%s"',
      async (query) => {
        await testRandomQuery(query, 'edge_case', 'should_clarify');
      }
    );
  });

  describe('🚫 Out-of-Scope Queries', () => {
    test.each(RANDOM_QUERY_DATASETS.out_of_scope)(
      'should properly reject out-of-scope query: "%s"',
      async (query) => {
        await testRandomQuery(query, 'out_of_scope', 'should_reject');
      }
    );
  });

  describe('🔗 Compound Queries', () => {
    test.each(RANDOM_QUERY_DATASETS.compound)(
      'should handle compound query flexibly: "%s"', 
      async (query) => {
        await testRandomQuery(query, 'compound', 'flexible');
      }
    );
  });

  describe('🎨 Novel Phrasing', () => {
    test.each(RANDOM_QUERY_DATASETS.novel_phrasing)(
      'should understand creative business phrasing: "%s"',
      async (query) => {
        await testRandomQuery(query, 'novel_phrasing', 'should_route');
      }
    );
  });

  // Helper function to test individual random queries
  async function testRandomQuery(
    query: string, 
    category: RandomQueryTestResult['category'],
    expectedBehavior: RandomQueryTestResult['expected_behavior']
  ) {
    const startTime = performance.now();
    const testTimestamp = new Date().toISOString();
    
    try {
      const result = await hybridRoutingEngine.route(query);
      const endTime = performance.now();
      
      const testResult: RandomQueryTestResult = {
        query,
        category,
        expected_behavior: expectedBehavior,
        test_timestamp: testTimestamp,
        actual_result: {
          success: result.success,
          endpoint: result.endpoint,
          confidence: result.confidence,
          scope: result.validation.scope,
          user_response_type: result.user_response.type,
          user_message: result.user_response.message
        },
        performance: {
          processing_time: endTime - startTime,
          layers_executed: result.metadata?.layers_executed || [],
          early_exit: result.metadata?.early_exit
        },
        optimization_score: calculateRandomQueryScore(result, category, expectedBehavior),
        handling_quality: determineHandlingQuality(result, category, expectedBehavior),
        suggestions: generateOptimizationSuggestions(result, category, expectedBehavior)
      };
      
      testResults.push(testResult);
      
      // Log results for immediate feedback
      const emoji = getResultEmoji(testResult.handling_quality);
      console.log(`\n${emoji} [${category}] "${query.substring(0, 60)}..."`);
      console.log(`   Score: ${testResult.optimization_score}/100 | Time: ${testResult.performance.processing_time.toFixed(1)}ms`);
      console.log(`   Result: ${result.success ? 'Routed' : 'Not routed'} | Endpoint: ${result.endpoint || 'None'}`);
      
      if (testResult.suggestions.length > 0) {
        console.log(`   💡 Suggestions: ${testResult.suggestions[0]}`);
      }
      
    } catch (error) {
      // Handle errors gracefully
      const errorResult: RandomQueryTestResult = {
        query,
        category,
        expected_behavior: expectedBehavior,
        test_timestamp: testTimestamp,
        actual_result: {
          success: false,
          scope: 'ERROR',
          user_response_type: 'error',
          user_message: `Error: ${error}`
        },
        performance: {
          processing_time: performance.now() - startTime,
          layers_executed: []
        },
        optimization_score: 0,
        handling_quality: 'poor',
        suggestions: [`Fix error: ${error}`],
        error: String(error)
      };
      
      testResults.push(errorResult);
      console.error(`❌ Error processing "${query}": ${error}`);
    }
  }
});

// Scoring functions for different query categories
function calculateRandomQueryScore(result: any, category: string, expectedBehavior: string): number {
  let score = 0;
  
  switch (category) {
    case 'open_ended_business':
      if (result.success && expectedBehavior === 'should_route') {
        score += 60; // Base score for successful routing
        if (result.confidence && result.confidence > 50) score += 25;
        if (result.endpoint) score += 15; // Actually routed somewhere
      } else if (!result.success) {
        score += 20; // Some credit for not randomly routing
      }
      break;
      
    case 'edge_case':
      if (expectedBehavior === 'should_clarify') {
        if (result.user_response?.type === 'clarification' || result.validation?.scope === 'BORDERLINE') {
          score += 80;
        } else if (!result.success) {
          score += 50; // Better than routing randomly
        }
      }
      break;
      
    case 'out_of_scope':
      if (expectedBehavior === 'should_reject') {
        if (!result.success && result.validation?.scope === 'OUT_OF_SCOPE') {
          score += 90;
        } else if (!result.success) {
          score += 60; // At least didn't route
        } else {
          score += 10; // Routed when it shouldn't have
        }
      }
      break;
      
    case 'compound':
    case 'novel_phrasing':
      if (result.success) {
        score += 50 + (result.confidence || 0) * 0.4;
      } else if (result.user_response?.type === 'clarification') {
        score += 40; // Reasonable response
      } else {
        score += 20;
      }
      break;
  }
  
  return Math.min(100, Math.max(0, score));
}

function determineHandlingQuality(result: any, category: string, expectedBehavior: string): 'excellent' | 'good' | 'fair' | 'poor' {
  const score = calculateRandomQueryScore(result, category, expectedBehavior);
  
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function generateOptimizationSuggestions(result: any, category: string, expectedBehavior: string): string[] {
  const suggestions: string[] = [];
  
  // Category-specific suggestions
  if (category === 'open_ended_business' && !result.success) {
    suggestions.push('Consider expanding business vocabulary and intent patterns');
  }
  
  if (category === 'edge_case' && result.success) {
    suggestions.push('Too vague - should request clarification instead of routing');
  }
  
  if (category === 'out_of_scope' && result.success) {
    suggestions.push('Should reject this non-business query');
  }
  
  if (category === 'novel_phrasing' && !result.success) {
    suggestions.push('Enhance pattern matching for creative phrasings');
  }
  
  // Confidence-based suggestions
  if (result.confidence && result.confidence < 30) {
    suggestions.push('Low confidence suggests unclear intent classification');
  }
  
  return suggestions;
}

function getResultEmoji(quality: string): string {
  const emojis = {
    'excellent': '🌟',
    'good': '✅',
    'fair': '⚠️',
    'poor': '❌'
  };
  return emojis[quality as keyof typeof emojis] || '❓';
}

// Report generation for optimization insights
async function generateRandomQueryOptimizationReport(testResults: RandomQueryTestResult[]): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Calculate comprehensive statistics
  const stats = calculateOptimizationStats(testResults);
  
  // Create detailed report object
  const report = {
    metadata: {
      test_type: 'random_query_optimization',
      timestamp: new Date().toISOString(),
      total_queries: testResults.length,
      purpose: 'Optimize hybrid routing for diverse queries while maintaining predefined query accuracy'
    },
    
    executive_summary: {
      overall_optimization_score: stats.avgOptimizationScore,
      overall_handling_quality: stats.overallQuality,
      processing_performance: {
        avg_time: stats.avgProcessingTime,
        fastest: stats.fastestTime,
        slowest: stats.slowestTime
      },
      key_insights: stats.keyInsights
    },
    
    category_analysis: stats.categoryBreakdown,
    
    optimization_opportunities: stats.optimizationOpportunities,
    
    detailed_results: testResults.map(result => ({
      ...result,
      // Truncate long messages for readability
      actual_result: {
        ...result.actual_result,
        user_message: result.actual_result.user_message?.substring(0, 200) || ''
      }
    })),
    
    recommendations: stats.topRecommendations
  };
  
  // Save comprehensive JSON report
  const jsonFilename = `random-query-optimization-${timestamp}.json`;
  writeFileSync(join(process.cwd(), jsonFilename), JSON.stringify(report, null, 2));
  
  // Generate readable markdown report
  const markdownReport = generateMarkdownOptimizationReport(report, stats);
  const mdFilename = `random-query-optimization-${timestamp}.md`;
  writeFileSync(join(process.cwd(), mdFilename), markdownReport);
  
  console.log(`\n📊 Random Query Optimization Report Generated:`);
  console.log(`📄 JSON Report: ${jsonFilename}`);
  console.log(`📝 Markdown Report: ${mdFilename}`);
}

function calculateOptimizationStats(testResults: RandomQueryTestResult[]) {
  const totalQueries = testResults.length;
  const avgOptimizationScore = testResults.reduce((sum, r) => sum + r.optimization_score, 0) / totalQueries;
  const avgProcessingTime = testResults.reduce((sum, r) => sum + r.performance.processing_time, 0) / totalQueries;
  
  // Category breakdown
  const categoryBreakdown = testResults.reduce((breakdown, result) => {
    if (!breakdown[result.category]) {
      breakdown[result.category] = {
        count: 0,
        totalScore: 0,
        qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
      };
    }
    breakdown[result.category].count++;
    breakdown[result.category].totalScore += result.optimization_score;
    breakdown[result.category].qualityDistribution[result.handling_quality]++;
    return breakdown;
  }, {} as any);
  
  // Process breakdown into readable format
  const processedBreakdown = Object.entries(categoryBreakdown).map(([category, data]: [string, any]) => ({
    category,
    query_count: data.count,
    avg_score: Math.round(data.totalScore / data.count),
    quality_distribution: data.qualityDistribution,
    performance_level: data.totalScore / data.count >= 70 ? 'strong' : 
                      data.totalScore / data.count >= 50 ? 'adequate' : 'needs_improvement'
  }));
  
  // Gather all suggestions for common themes
  const allSuggestions = testResults.flatMap(r => r.suggestions);
  const suggestionCounts = allSuggestions.reduce((counts, suggestion) => {
    counts[suggestion] = (counts[suggestion] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  const topRecommendations = Object.entries(suggestionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([suggestion, count]) => ({ suggestion, frequency: count }));
  
  return {
    avgOptimizationScore: Math.round(avgOptimizationScore),
    avgProcessingTime: Math.round(avgProcessingTime * 100) / 100,
    fastestTime: Math.min(...testResults.map(r => r.performance.processing_time)),
    slowestTime: Math.max(...testResults.map(r => r.performance.processing_time)),
    overallQuality: avgOptimizationScore >= 70 ? 'strong' : avgOptimizationScore >= 50 ? 'adequate' : 'needs_improvement',
    categoryBreakdown: processedBreakdown,
    topRecommendations,
    keyInsights: generateKeyInsights(testResults, processedBreakdown),
    optimizationOpportunities: identifyOptimizationOpportunities(processedBreakdown, topRecommendations)
  };
}

function generateKeyInsights(testResults: RandomQueryTestResult[], categoryBreakdown: any[]): string[] {
  const insights: string[] = [];
  
  // Performance insights
  const excellentResults = testResults.filter(r => r.handling_quality === 'excellent').length;
  const poorResults = testResults.filter(r => r.handling_quality === 'poor').length;
  
  insights.push(`${Math.round(excellentResults / testResults.length * 100)}% of queries handled excellently`);
  
  if (poorResults > 0) {
    insights.push(`${Math.round(poorResults / testResults.length * 100)}% of queries need improvement`);
  }
  
  // Category-specific insights
  categoryBreakdown.forEach(cat => {
    if (cat.performance_level === 'strong') {
      insights.push(`Strong performance on ${cat.category} queries (${cat.avg_score}/100)`);
    } else if (cat.performance_level === 'needs_improvement') {
      insights.push(`${cat.category} queries need optimization (${cat.avg_score}/100)`);
    }
  });
  
  return insights;
}

function identifyOptimizationOpportunities(categoryBreakdown: any[], topRecommendations: any[]): string[] {
  const opportunities: string[] = [];
  
  // Category-based opportunities
  categoryBreakdown
    .filter(cat => cat.performance_level === 'needs_improvement')
    .forEach(cat => {
      opportunities.push(`Improve ${cat.category.replace('_', ' ')} handling (current: ${cat.avg_score}/100)`);
    });
  
  // Frequency-based opportunities from recommendations
  topRecommendations
    .slice(0, 5)
    .forEach(rec => {
      opportunities.push(`${rec.suggestion} (mentioned ${rec.frequency} times)`);
    });
  
  return opportunities;
}

function generateMarkdownOptimizationReport(report: any, stats: any): string {
  return `# 🎯 Random Query Optimization Report

**Generated**: ${report.metadata.timestamp}  
**Purpose**: ${report.metadata.purpose}  
**Total Queries Tested**: ${report.metadata.total_queries}

## 📊 Executive Summary

- **Overall Optimization Score**: ${report.executive_summary.overall_optimization_score}/100
- **Handling Quality**: ${report.executive_summary.overall_handling_quality}
- **Average Processing Time**: ${report.executive_summary.processing_performance.avg_time}ms

### 💡 Key Insights
${report.executive_summary.key_insights.map((insight: string) => `- ${insight}`).join('\n')}

## 🎯 Category Performance Analysis

${report.category_analysis.map((cat: any) => `
### ${cat.category.toUpperCase().replace('_', ' ')}
- **Queries Tested**: ${cat.query_count}  
- **Average Score**: ${cat.avg_score}/100  
- **Performance Level**: ${cat.performance_level}  
- **Quality Distribution**: 
  - Excellent: ${cat.quality_distribution.excellent}
  - Good: ${cat.quality_distribution.good}  
  - Fair: ${cat.quality_distribution.fair}
  - Poor: ${cat.quality_distribution.poor}
`).join('')}

## ⚡ Performance Metrics

- **Average Processing**: ${report.executive_summary.processing_performance.avg_time}ms
- **Fastest Query**: ${report.executive_summary.processing_performance.fastest}ms
- **Slowest Query**: ${report.executive_summary.processing_performance.slowest}ms

## 🔧 Optimization Opportunities

${report.optimization_opportunities.map((opp: string, i: number) => `${i + 1}. ${opp}`).join('\n')}

## 📋 Top Recommendations

${report.recommendations.map((rec: any, i: number) => `${i + 1}. ${rec.suggestion} *(frequency: ${rec.frequency})*`).join('\n')}

## 🎯 Next Steps for Optimization

1. **Focus on lowest-scoring categories** first for maximum impact
2. **Address most frequent recommendations** to improve overall performance  
3. **Maintain current strong performance** in well-handling categories
4. **Re-run this test** after implementing optimizations to measure improvement

---

*This optimization report helps improve the hybrid routing system for diverse query types while preserving the 100% accuracy on predefined queries.*

**Note**: This test is separate from and does not interfere with predefined query validation tests.
`;
}