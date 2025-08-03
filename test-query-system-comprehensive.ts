// Comprehensive Query System Test Suite - PRODUCTION SYSTEM
// Tests ACTUAL production query processing pipeline using AnalysisEngine + EnhancedQueryAnalyzer
// 
// MAJOR UPDATE: Fixed critical test vs production discrepancy
// - Previously tested OUTDATED components (concept-mapping.ts, query-analyzer.ts) 
// - Now tests ACTUAL production flow: EnhancedQueryAnalyzer → AnalysisEngine → blob data
// - Fixed missing field mappings in production system for Hispanic demographics and spending
// - Updated field expectations to use value_ prefix that production actually uses
//
// Key Production Fixes Applied:
// 1. Added Hispanic demographic mappings to EnhancedQueryAnalyzer
// 2. Added missing spending fields MP07111 (athletic wear) and MP07109 (sports clothing)
// 3. Test now validates actual production endpoints and data flow
//
// This test suite now provides ACCURATE assessment of production system performance

import { AnalysisEngine } from './lib/analysis/AnalysisEngine';
import { EnhancedQueryAnalyzer } from './lib/analysis/EnhancedQueryAnalyzer';
import fs from 'fs';

// Production test result interface - tests actual AnalysisEngine flow
interface QuerySystemTestResult {
  query: string;
  category: string;
  
  // Step 1: EnhancedQueryAnalyzer
  queryAnalysis: {
    bestEndpoint: string;
    endpointScores: Array<{endpoint: string, score: number, reasons: string[]}>;
    mentionedFields: string[];
    success: boolean;
    error?: string;
    processingTime: number;
  };
  
  // Step 2: AnalysisEngine Execution
  analysisExecution: {
    selectedEndpoint: string;
    success: boolean;
    dataRecords: number;
    executionTime: number;
    hasVisualization: boolean;
    error?: string;
    processingTime: number;
  };
  
  // Step 3: Validation & Analysis
  analysis: {
    hasExpectedFields: boolean;
    hasValidEndpoint: boolean;
    mentionedFieldCount: number;
    expectedFieldsFound: string[];
    missingExpectedFields: string[];
    overallScore: number;
    issues: string[];
    recommendations: string[];
  };
  
  // Performance metrics
  performance: {
    totalTime: number;
    averageStepTime: number;
    bottleneckStep: string;
  };
}

// Comprehensive test queries covering all major scenarios
const COMPREHENSIVE_TEST_QUERIES = {
  // Brand Analysis Queries
  'Brand Rankings': [
    'Show me the top 10 areas with highest Nike purchases',
    'Which areas have the most Adidas buyers?',
    'Rank areas by Jordan athletic shoe purchases',
    'Top performing regions for New Balance shoes',
    'Best areas for Puma athletic shoe sales'
  ],
  
  // Brand Comparisons
  'Brand Comparisons': [
    'Compare Nike vs Adidas purchases across regions',
    'Nike vs Jordan performance comparison',
    'Adidas vs Puma market share analysis', 
    'Compare all athletic shoe brands performance',
    'Brand preference differences between areas'
  ],
  
  // Demographic Analysis
  'Demographics vs Purchases': [
    'Relationship between age and Nike purchases',
    'Income correlation with athletic shoe buying',
    'Asian population vs athletic shoe preferences',
    'Millennial generation athletic shoe trends',
    'High income areas and premium shoe brands'
  ],
  
  // Geographic Analysis
  'Geographic Patterns': [
    'Athletic shoe purchase clusters on the map',
    'Regional patterns in sports participation',
    'Geographic distribution of Nike buyers',
    'Spatial analysis of athletic retail stores',
    'Hot spots for athletic shoe purchases'
  ],
  
  // Sports & Activities
  'Sports Participation': [
    'Running participation vs running shoe purchases',
    'Basketball players vs basketball shoe sales',
    'Yoga participation and athletic shoe preferences',
    'Gym membership correlation with shoe purchases',
    'Sports fan demographics and shoe preferences'
  ],
  
  // Retail & Market Analysis
  'Retail Analysis': [
    "Dick's Sporting Goods shoppers vs Nike purchases",
    'Foot Locker customers and brand preferences',
    'Retail channel analysis for athletic shoes',
    'Shopping behavior vs athletic shoe purchases',
    'Market penetration analysis for brands'
  ],
  
  // Complex Multi-factor Analysis
  'Multi-factor Analysis': [
    'Age, income, and sports participation vs Nike purchases',
    'Multiple demographic factors affecting shoe choices',
    'Brand preferences by age, income, and activity level',
    'Complex market segmentation analysis',
    'Multi-variable athletic market modeling'
  ],
  
  // Difference & Comparison Analysis
  'Difference Analysis': [
    'Difference in Nike vs Adidas market share',
    'Brand performance gap analysis',
    'Market share differences between regions',
    'Premium vs budget shoe preference differences',
    'Age group differences in brand preferences'
  ],
  
  // Clustering & Segmentation
  'Market Segmentation': [
    'Cluster areas by athletic shoe purchase patterns',
    'Market segments for athletic footwear',
    'Customer segmentation by purchase behavior',
    'Geographic clustering of sports enthusiasts',
    'Behavioral segments in athletic market'
  ],
  
  // Trend & Temporal Analysis
  'Trends & Patterns': [
    'Athletic shoe purchase trends over time',
    'Seasonal patterns in shoe purchases',
    'Brand popularity trends by region',
    'Emerging markets for athletic footwear',
    'Growth patterns in athletic participation'
  ],

  // Hispanic Demographics (Previously Missing - 23 fields uncovered)
  'Hispanic Demographics': [
    'Hispanic population athletic shoe preferences',
    'Latino community brand preferences analysis',
    'Hispanic demographic correlation with athletic purchases',
    'Hispanic white population vs shoe purchases',
    'Latino millennials athletic footwear trends',
    'Hispanic black population athletic shoe analysis',
    'Hispanic American Indian athletic preferences',
    'Hispanic Pacific Islander shoe purchasing patterns'
  ],

  // Specific Shoe Types (Previously Missing - 6 fields)
  'Shoe Type Analysis': [
    'Basketball shoes purchase patterns by region',
    'Cross-training shoes vs fitness participation',
    'Running shoes correlation with jogging activity',
    'Basketball shoe brands regional preferences',
    'Cross-training footwear market analysis',
    'Running shoe purchase demographics by age',
    'Basketball vs running shoe preference differences',
    'Cross-training shoes vs other athletic categories'
  ],

  // Spending & Economic Patterns (Previously Missing - 7 fields)
  'Spending Analysis': [
    'Sports clothing spending correlation with shoe purchases',
    'Athletic wear spending vs brand preferences',
    'High sports equipment spenders shoe buying patterns',
    'Sports clothing budget correlation with footwear choices',
    'Equipment investment vs athletic shoe preferences',
    'Premium sports spending demographic analysis',
    'Sports gear spending patterns by region',
    'High athletic wear spenders brand loyalty'
  ],

  // Specialty Demographics & Edge Cases
  'Specialty Demographics': [
    'American Indian population athletic shoe preferences',
    'Pacific Islander demographics and shoe trends',
    'Multi-racial population athletic footwear analysis',
    'Other race populations and brand preferences',
    'NASCAR fans athletic shoe preferences',
    'NHL fans and athletic footwear trends',
    'International soccer fans shoe purchasing patterns',
    'MLS soccer fans brand preferences'
  ]
};

// Expected field mappings for validation - PRODUCTION SYSTEM with value_ prefix
const EXPECTED_FIELD_MAPPINGS = {
  // Athletic Shoe Brands - Production uses value_ prefix
  'nike': ['value_MP30034A_B', 'value_MP30034A_B_P'],
  'adidas': ['value_MP30029A_B', 'value_MP30029A_B_P'],
  'jordan': ['value_MP30032A_B', 'value_MP30032A_B_P'],
  'puma': ['value_MP30035A_B', 'value_MP30035A_B_P'],
  'new balance': ['value_MP30033A_B', 'value_MP30033A_B_P'],
  'asics': ['value_MP30030A_B', 'value_MP30030A_B_P'],
  'converse': ['value_MP30031A_B', 'value_MP30031A_B_P'],
  'reebok': ['value_MP30036A_B', 'value_MP30036A_B_P'],
  'skechers': ['value_MP30037A_B', 'value_MP30037A_B_P'],
  'athletic shoes': ['value_MP30016A_B', 'value_MP30016A_B_P'],
  
  // Specific Shoe Types - Production uses value_ prefix
  'basketball shoes': ['value_MP30018A_B', 'value_MP30018A_B_P'],
  'running shoes': ['value_MP30021A_B', 'value_MP30021A_B_P'],
  'cross training': ['value_MP30019A_B', 'value_MP30019A_B_P'],
  'basketball': ['value_MP30018A_B', 'value_MP30018A_B_P'],
  'running': ['value_MP30021A_B', 'value_MP30021A_B_P', 'value_MP33020A_B', 'value_MP33020A_B_P'],
  'jogging': ['value_MP30021A_B', 'value_MP30021A_B_P', 'value_MP33020A_B', 'value_MP33020A_B_P'],
  
  // Hispanic Demographics - Production uses value_ prefix
  'hispanic': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'latino': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'latina': ['value_HISPWHT_CY', 'value_HISPWHT_CY_P', 'value_HISPBLK_CY', 'value_HISPBLK_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  
  // Spending Patterns - CRITICAL FIELDS NOW INCLUDED - Production uses value_ prefix
  'sports clothing': ['value_MP07109A_B', 'value_MP07109A_B_P'],
  'athletic wear': ['value_MP07111A_B', 'value_MP07111A_B_P'],
  'sports equipment': ['value_X9051_X', 'value_X9051_X_A'],
  'equipment': ['value_X9051_X', 'value_X9051_X_A'],
  'spending': ['value_MP07109A_B', 'value_MP07109A_B_P', 'value_MP07111A_B', 'value_MP07111A_B_P', 'value_PSIV7UMKVALM'],
  'spent': ['value_MP07109A_B', 'value_MP07109A_B_P', 'value_MP07111A_B', 'value_MP07111A_B_P', 'value_PSIV7UMKVALM'],
  
  // Sports Fans (Specialty) - Production uses value_ prefix
  'nascar': ['value_MP33105A_B', 'value_MP33105A_B_P'],
  'nhl': ['value_MP33108A_B', 'value_MP33108A_B_P'],
  'international soccer': ['value_MP33119A_B', 'value_MP33119A_B_P'],
  'mls': ['value_MP33120A_B', 'value_MP33120A_B_P'],
  'soccer': ['value_MP33119A_B', 'value_MP33119A_B_P', 'value_MP33120A_B', 'value_MP33120A_B_P'],
  
  // Demographics (Specialty) - Production uses value_ prefix
  'american indian': ['value_AMERIND_CY', 'value_AMERIND_CY_P', 'value_HISPAI_CY', 'value_HISPAI_CY_P'],
  'pacific islander': ['value_PACIFIC_CY', 'value_PACIFIC_CY_P', 'value_HISPPI_CY', 'value_HISPPI_CY_P'],
  'multi-racial': ['value_RACE2UP_CY', 'value_RACE2UP_CY_P'],
  'other race': ['value_OTHRACE_CY', 'value_OTHRACE_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  
  // Core Demographics - Production uses value_ prefix
  'mlb': ['value_MP33104A_B', 'value_MP33104A_B_P'],
  'nba': ['value_MP33106A_B', 'value_MP33106A_B_P'],
  'nfl': ['value_MP33107A_B', 'value_MP33107A_B_P'],
  'asian': ['value_ASIAN_CY', 'value_ASIAN_CY_P'],
  'millennial': ['value_MILLENN_CY', 'value_MILLENN_CY_P'],
  'gen z': ['value_GENZ_CY', 'value_GENZ_CY_P'],
  'income': ['value_MEDDI_CY'],
  'wealth': ['value_WLTHINDXCY'],
  'diversity': ['value_DIVINDX_CY'],
  'population': ['TOTPOP_CY', 'value_HHPOP_CY', 'value_FAMPOP_CY'],
  // Don't match 'population' for race-specific queries - they should use race fields
  'other race populations': ['value_OTHRACE_CY', 'value_OTHRACE_CY_P', 'value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
  'dicks': ['value_MP31035A_B', 'value_MP31035A_B_P'],
  'foot locker': ['value_MP31042A_B', 'value_MP31042A_B_P'],
  'yoga': ['value_MP33032A_B', 'value_MP33032A_B_P'],
  'weight lifting': ['value_MP33031A_B', 'value_MP33031A_B_P']
};

// Expected endpoints for different query types - PRODUCTION SYSTEM ENDPOINTS
const EXPECTED_ENDPOINTS = {
  'ranking': '/strategic-analysis',
  'comparison': '/comparative-analysis', 
  'correlation': '/demographic-insights',
  'demographic': '/demographic-insights',
  'geographic': '/strategic-analysis',
  'difference': '/brand-difference',
  'clustering': '/strategic-analysis',
  'trend': '/trend-analysis',
  'multivariate': '/demographic-insights'
};

/**
 * PRODUCTION SYSTEM ARCHITECTURE OVERVIEW
 * 
 * Query Flow:
 * 1. User Query → EnhancedQueryAnalyzer.analyzeQuery() 
 * 2. EnhancedQueryAnalyzer.getBestEndpoint() → selects endpoint
 * 3. AnalysisEngine.executeAnalysis() → loads cached blob data
 * 4. CachedEndpointRouter → loads from Vercel Blob storage
 * 5. DataProcessor → processes and visualizes results
 * 
 * Key Differences from Test System:
 * - Uses value_ prefixed fields (value_MP30034A_B vs MP30034A_B)
 * - No microservice calls - uses cached blob data
 * - EnhancedQueryAnalyzer for routing vs concept-mapping.ts
 * - Different endpoint names (/strategic-analysis vs competitive-analysis)
 * 
 * Critical Fields Added:
 * - Hispanic Demographics: value_HISPWHT_CY, value_HISPBLK_CY, etc.
 * - Spending Analysis: value_MP07111A_B (athletic wear), value_MP07109A_B (sports clothing)
 */

// PRODUCTION SYSTEM TEST FUNCTIONS - Tests actual AnalysisEngine flow

async function testEnhancedQueryAnalyzer(query: string): Promise<QuerySystemTestResult['queryAnalysis']> {
  const startTime = performance.now();
  
  try {
    const analyzer = new EnhancedQueryAnalyzer();
    const endpointScores = analyzer.analyzeQuery(query);
    const bestEndpoint = analyzer.getBestEndpoint(query);
    const queryFields = analyzer.getQueryFields(query);
    
    const endTime = performance.now();
    
    return {
      bestEndpoint,
      endpointScores,
      mentionedFields: queryFields.map(f => f.field),
      success: true,
      processingTime: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      bestEndpoint: '',
      endpointScores: [],
      mentionedFields: [],
      success: false,
      error: error instanceof Error ? error.message : String(error),
      processingTime: endTime - startTime
    };
  }
}

async function testAnalysisEngineExecution(query: string, endpoint: string): Promise<QuerySystemTestResult['analysisExecution']> {
  const startTime = performance.now();
  
  try {
    // Test actual AnalysisEngine execution
    const analysisEngine = AnalysisEngine.getInstance();
    const analysisOptions = { endpoint };
    
    // This is the REAL production call that users make
    const result = await analysisEngine.executeAnalysis(query, analysisOptions);
    
    const endTime = performance.now();
    
    return {
      selectedEndpoint: result.endpoint,
      success: result.success,
      dataRecords: result.data?.records?.length || 0,
      executionTime: result.metadata?.executionTime || 0,
      hasVisualization: !!result.visualization,
      processingTime: endTime - startTime
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      selectedEndpoint: endpoint,
      success: false,
      dataRecords: 0,
      executionTime: 0,
      hasVisualization: false,
      error: error instanceof Error ? error.message : String(error),
      processingTime: endTime - startTime
    };
  }
}

// PRODUCTION SYSTEM ANALYSIS FUNCTION
function analyzeProductionResults(
  query: string,
  queryResult: QuerySystemTestResult['queryAnalysis'],
  executionResult: QuerySystemTestResult['analysisExecution']
): QuerySystemTestResult['analysis'] {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check for expected fields based on query content
  const queryLower = query.toLowerCase();
  const expectedFields: string[] = [];
  const actualFields = queryResult.mentionedFields;
  
  // Find expected brand fields - with smart matching for production system
  Object.entries(EXPECTED_FIELD_MAPPINGS).forEach(([keyword, fields]) => {
    if (queryLower.includes(keyword)) {
      // Special case: don't expect generic 'population' fields for race-specific queries
      if (keyword === 'population' && 
          (queryLower.includes('race') || queryLower.includes('hispanic') || 
           queryLower.includes('asian') || queryLower.includes('black') || 
           queryLower.includes('white') || queryLower.includes('american indian') || 
           queryLower.includes('pacific islander'))) {
        // Skip generic population fields for race-specific queries
        return;
      }
      expectedFields.push(...fields);
    }
  });
  
  // Find matching fields between expected and actual
  const expectedFieldsFound = expectedFields.filter(expected => 
    actualFields.some(actual => actual.toLowerCase().includes(expected.toLowerCase()))
  );
  
  const missingFields = expectedFields.filter(expected => 
    !actualFields.some(actual => actual.toLowerCase().includes(expected.toLowerCase()))
  );
  
  // Check endpoint selection and execution
  const hasValidEndpoint = !!queryResult.bestEndpoint;
  const executionSuccessful = executionResult.success;
  
  // Generate issues and recommendations
  if (missingFields.length > 0) {
    issues.push(`Missing expected fields: ${missingFields.join(', ')}`);
    recommendations.push('Add missing field mappings to EnhancedQueryAnalyzer');
  }
  
  if (!hasValidEndpoint) {
    issues.push('No valid endpoint selected by EnhancedQueryAnalyzer');
    recommendations.push('Review endpoint scoring logic');
  }
  
  if (!executionSuccessful) {
    issues.push('AnalysisEngine execution failed');
    recommendations.push('Check AnalysisEngine and data loading');
  }
  
  if (actualFields.length === 0) {
    issues.push('No fields detected by EnhancedQueryAnalyzer');
    recommendations.push('Improve field mapping keywords');
  }
  
  // Calculate overall score based on production system performance
  let score = 100;
  score -= missingFields.length * 15; // Higher penalty for missing fields
  if (!hasValidEndpoint) score -= 25;
  if (!executionSuccessful) score -= 30;
  if (actualFields.length === 0) score -= 20;
  
  return {
    hasExpectedFields: missingFields.length === 0,
    hasValidEndpoint,
    mentionedFieldCount: actualFields.length,
    expectedFieldsFound,
    missingExpectedFields: missingFields,
    overallScore: Math.max(0, score),
    issues,
    recommendations
  };
}

// PRODUCTION SYSTEM MAIN TEST FUNCTION - Tests actual AnalysisEngine flow
async function testSingleQuery(query: string, category: string): Promise<QuerySystemTestResult> {
  const totalStartTime = performance.now();
  
  console.log(`\n🧪 Testing PRODUCTION SYSTEM: "${query}"`);
  console.log(`📂 Category: ${category}`);
  
  // Step 1: EnhancedQueryAnalyzer (actual production component)
  const queryResult = await testEnhancedQueryAnalyzer(query);
  console.log(`   🔍 Best Endpoint: ${queryResult.bestEndpoint} | Fields Detected: ${queryResult.mentionedFields.length} | Success: ${queryResult.success}`);
  
  // Step 2: AnalysisEngine Execution (actual production execution)
  const executionResult = await testAnalysisEngineExecution(query, queryResult.bestEndpoint);
  console.log(`   🚀 Execution: ${executionResult.success ? 'SUCCESS' : 'FAILED'} | Records: ${executionResult.dataRecords} | Visualization: ${executionResult.hasVisualization ? 'YES' : 'NO'}`);
  
  // Step 3: Production System Analysis
  const analysis = analyzeProductionResults(query, queryResult, executionResult);
  console.log(`   ✅ Score: ${analysis.overallScore}/100 | Issues: ${analysis.issues.length} | Expected Fields Found: ${analysis.expectedFieldsFound.length}`);
  
  const totalEndTime = performance.now();
  const totalTime = totalEndTime - totalStartTime;
  
  // Find bottleneck step in production system
  const stepTimes = {
    'EnhancedQueryAnalyzer': queryResult.processingTime,
    'AnalysisEngine Execution': executionResult.processingTime
  };
  
  const bottleneckStep = Object.entries(stepTimes).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  
  return {
    query,
    category,
    queryAnalysis: queryResult,
    analysisExecution: executionResult,
    analysis,
    performance: {
      totalTime,
      averageStepTime: totalTime / 2, // Only 2 steps in production system
      bottleneckStep
    }
  };
}

// Main test execution - PRODUCTION SYSTEM TEST
async function runComprehensiveQueryTest(): Promise<void> {
  console.log('🚀 Starting PRODUCTION SYSTEM Comprehensive Query Test');
  console.log('🎯 Testing actual AnalysisEngine + EnhancedQueryAnalyzer flow');
  console.log('=' .repeat(80));
  
  const allResults: QuerySystemTestResult[] = [];
  let totalQueries = 0;
  
  // Count total queries
  Object.values(COMPREHENSIVE_TEST_QUERIES).forEach(queries => {
    totalQueries += queries.length;
  });
  
  console.log(`📊 Testing ${totalQueries} queries across ${Object.keys(COMPREHENSIVE_TEST_QUERIES).length} categories\n`);
  
  let currentQuery = 0;
  
  // Run tests for each category
  for (const [category, queries] of Object.entries(COMPREHENSIVE_TEST_QUERIES)) {
    console.log(`\n🏷️  Category: ${category} (${queries.length} queries)`);
    console.log('-'.repeat(60));
    
    for (const query of queries) {
      currentQuery++;
      console.log(`\n[${currentQuery}/${totalQueries}] Testing...`);
      
      try {
        const result = await testSingleQuery(query, category);
        allResults.push(result);
      } catch (error) {
        console.error(`❌ Failed to test query: "${query}"`, error);
      }
    }
  }
  
  // Generate comprehensive report
  await generateTestReport(allResults);
}

async function generateTestReport(results: QuerySystemTestResult[]): Promise<void> {
  console.log('\n' + '='.repeat(80));
  console.log('📈 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(80));
  
  // Overall statistics
  const totalQueries = results.length;
  const successfulQueries = results.filter(r => r.analysis.overallScore >= 70).length;
  const averageScore = results.reduce((sum, r) => sum + r.analysis.overallScore, 0) / totalQueries;
  const averageTime = results.reduce((sum, r) => sum + r.performance.totalTime, 0) / totalQueries;
  
  console.log(`\n📊 Overall Statistics:`);
  console.log(`   • Total Queries: ${totalQueries}`);
  console.log(`   • Successful Queries (Score ≥70): ${successfulQueries} (${(successfulQueries/totalQueries*100).toFixed(1)}%)`);
  console.log(`   • Average Score: ${averageScore.toFixed(1)}/100`);
  console.log(`   • Average Processing Time: ${averageTime.toFixed(2)}ms`);
  
  // Category breakdown
  console.log(`\n📂 Category Performance:`);
  const categoryStats: Record<string, any> = {};
  
  Object.keys(COMPREHENSIVE_TEST_QUERIES).forEach(category => {
    const categoryResults = results.filter(r => r.category === category);
    const avgScore = categoryResults.reduce((sum, r) => sum + r.analysis.overallScore, 0) / categoryResults.length;
    const avgTime = categoryResults.reduce((sum, r) => sum + r.performance.totalTime, 0) / categoryResults.length;
    
    categoryStats[category] = {
      count: categoryResults.length,
      averageScore: avgScore,
      averageTime: avgTime,
      successRate: categoryResults.filter(r => r.analysis.overallScore >= 70).length / categoryResults.length * 100
    };
    
    console.log(`   • ${category}: ${avgScore.toFixed(1)}/100 (${categoryStats[category].successRate.toFixed(1)}% success, ${avgTime.toFixed(1)}ms avg)`);
  });
  
  // Common issues
  const allIssues = results.flatMap(r => r.analysis.issues);
  const issueFrequency = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n❌ Most Common Issues:`);
  Object.entries(issueFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .forEach(([issue, count]) => {
      console.log(`   • ${issue} (${count} occurrences)`);
    });
  
  // Performance analysis
  const bottlenecks = results.reduce((acc, r) => {
    acc[r.performance.bottleneckStep] = (acc[r.performance.bottleneckStep] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n⚡ Performance Bottlenecks:`);
  Object.entries(bottlenecks)
    .sort(([,a], [,b]) => b - a)
    .forEach(([step, count]) => {
      console.log(`   • ${step}: ${count} queries (${(count/totalQueries*100).toFixed(1)}%)`);
    });
  
  // Export detailed results
  const reportData = {
    testMetadata: {
      timestamp: new Date().toISOString(),
      totalQueries,
      successfulQueries,
      averageScore,
      averageTime,
      testVersion: '1.0.0'
    },
    overallStats: {
      totalQueries,
      successfulQueries,
      successRate: successfulQueries / totalQueries * 100,
      averageScore,
      averageTime
    },
    categoryStats,
    commonIssues: Object.entries(issueFrequency).sort(([,a], [,b]) => b - a),
    performanceBottlenecks: Object.entries(bottlenecks).sort(([,a], [,b]) => b - a),
    detailedResults: results
  };
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `query-system-test-results-${timestamp}.json`;
  
  fs.writeFileSync(filename, JSON.stringify(reportData, null, 2));
  console.log(`\n💾 Detailed results exported to: ${filename}`);
  
  // Generate CSV summary for easy analysis - Updated for production system
  const csvData = results.map(r => ({
    Query: r.query.replace(/"/g, '""'),
    Category: r.category,
    Score: r.analysis.overallScore,
    BestEndpoint: r.queryAnalysis.bestEndpoint,
    FieldsDetected: r.queryAnalysis.mentionedFields.length,
    ExecutionSuccess: r.analysisExecution.success,
    DataRecords: r.analysisExecution.dataRecords,
    ProcessingTime: r.performance.totalTime.toFixed(2),
    Issues: r.analysis.issues.length,
    Success: r.analysis.overallScore >= 70
  }));
  
  const csvContent = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).map(val => 
      typeof val === 'string' ? `"${val}"` : val
    ).join(','))
  ].join('\n');
  
  const csvFilename = `query-system-test-summary-${timestamp}.csv`;
  fs.writeFileSync(csvFilename, csvContent);
  console.log(`📊 CSV summary exported to: ${csvFilename}`);
  
  console.log('\n' + '='.repeat(80));
}

// Run the test
if (require.main === module) {
  runComprehensiveQueryTest().catch(console.error);
}

export type { QuerySystemTestResult };
export { runComprehensiveQueryTest, COMPREHENSIVE_TEST_QUERIES };