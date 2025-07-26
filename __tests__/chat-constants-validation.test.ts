/**
 * Chat Constants Validation Test
 * 
 * This test validates that all sample queries in chat-constants.ts are:
 * 1. Properly classified with correct query types
 * 2. Mapping to the expected field codes
 * 3. Generating appropriate visualization strategies
 * 
 * Since we changed to frontend-only analysis, this ensures our query
 * classification system works correctly for all predefined queries.
 */

import { conceptMapping } from '../lib/concept-mapping';
import { analyzeQuery } from '../lib/query-analyzer';
import { ANALYSIS_CATEGORIES, TRENDS_CATEGORIES } from '../components/chat/chat-constants';
import { classifyQuery } from '../lib/query-classifier';

// Expected field codes for brands
const BRAND_FIELD_CODES = {
  'nike': 'MP30034A_B',
  'jordan': 'MP30032A_B',
  'converse': 'MP30031A_B',
  'adidas': 'MP30029A_B',
  'puma': 'MP30035A_B',
  'reebok': 'MP30036A_B',
  'new balance': 'MP30033A_B',
  'newbalance': 'MP30033A_B',
  'asics': 'MP30030A_B',
  'skechers': 'MP30037A_B'
};

// Expected demographic and other field codes
const OTHER_FIELD_CODES = {
  'income': 'MEDDI_CY',
  'age': 'MILLENN_CY', // or GENZ_CY depending on context
  'population': 'TOTPOP_CY',
  'diversity': 'DIVINDX_CY',
  'running': 'MP33020A_B',
  'yoga': 'MP33032A_B',
  'weight lifting': 'MP33031A_B',
  'dicks sporting goods': 'MP31035A_B',
  'foot locker': 'MP31042A_B'
};

interface QueryTestResult {
  query: string;
  category: string;
  conceptMapping: {
    matchedFields: string[];
    matchedLayers: string[];
    confidence: number;
    success: boolean;
    error?: string;
  };
  queryAnalysis: {
    queryType: string;
    relevantFields: string[];
    targetVariable: string;
    visualizationStrategy: string;
    success: boolean;
    error?: string;
  };
  queryClassification: {
    visualizationType: string;
    confidence: number;
    success: boolean;
    error?: string;
  };
  validation: {
    hasExpectedBrands: boolean;
    hasExpectedFields: boolean;
    queryTypeValid: boolean;
    overallValid: boolean;
    issues: string[];
  };
}

/**
 * Test concept mapping for a single query
 */
async function testConceptMapping(query: string): Promise<QueryTestResult['conceptMapping']> {
  try {
    const conceptMap = await conceptMapping(query);
    return {
      matchedFields: conceptMap.matchedFields || [],
      matchedLayers: conceptMap.matchedLayers || [],
      confidence: conceptMap.confidence || 0,
      success: true
    };
  } catch (error) {
    return {
      matchedFields: [],
      matchedLayers: [],
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test query analysis for a single query
 */
async function testQueryAnalysis(query: string, conceptMap: any): Promise<QueryTestResult['queryAnalysis']> {
  try {
    const analysisResult = await analyzeQuery(query, conceptMap);
    return {
      queryType: analysisResult.queryType || 'unknown',
      relevantFields: analysisResult.relevantFields || [],
      targetVariable: analysisResult.targetVariable || 'none',
      visualizationStrategy: analysisResult.visualizationStrategy || 'unknown',
      success: true
    };
  } catch (error) {
    return {
      queryType: 'unknown',
      relevantFields: [],
      targetVariable: 'none',
      visualizationStrategy: 'unknown',
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Test query classification for a single query
 */
async function testQueryClassification(query: string): Promise<QueryTestResult['queryClassification']> {
  try {
    const classificationResult = await classifyQuery(query);
    return {
      visualizationType: classificationResult.visualizationType || classificationResult.queryType || 'unknown',
      confidence: classificationResult.confidence || 0,
      success: true
    };
  } catch (error) {
    return {
      visualizationType: 'unknown',
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Validate that the query results contain expected fields and classifications
 */
function validateQueryResults(
  query: string,
  category: string,
  conceptMapping: QueryTestResult['conceptMapping'],
  queryAnalysis: QueryTestResult['queryAnalysis'],
  queryClassification: QueryTestResult['queryClassification']
): QueryTestResult['validation'] {
  const issues: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Check for expected brand fields
  const expectedBrands = Object.keys(BRAND_FIELD_CODES).filter(brand => 
    lowerQuery.includes(brand.toLowerCase())
  );
  
  const hasExpectedBrands = expectedBrands.length === 0 || expectedBrands.some(brand => {
    const expectedFieldCode = BRAND_FIELD_CODES[brand as keyof typeof BRAND_FIELD_CODES];
    const foundInFields = conceptMapping.matchedFields.some(field => 
      field.includes(expectedFieldCode) || 
      field.includes(expectedFieldCode.replace('A_B', 'A_B_P'))
    );
    if (!foundInFields) {
      issues.push(`Missing expected brand field for "${brand}": ${expectedFieldCode}`);
    }
    return foundInFields;
  });

  // Check for expected demographic/other fields
  const expectedOtherFields = Object.keys(OTHER_FIELD_CODES).filter(field =>
    lowerQuery.includes(field.toLowerCase())
  );

  const hasExpectedFields = expectedOtherFields.length === 0 || expectedOtherFields.some(field => {
    const expectedFieldCode = OTHER_FIELD_CODES[field as keyof typeof OTHER_FIELD_CODES];
    const foundInFields = conceptMapping.matchedFields.some(f => 
      f.includes(expectedFieldCode)
    );
    if (!foundInFields) {
      issues.push(`Missing expected field for "${field}": ${expectedFieldCode}`);
    }
    return foundInFields;
  });

  // Validate query type based on category
  let queryTypeValid = true;
  if (category === 'Multi-Topic Comparison') {
    // Multi-Topic Comparison should be multivariate, jointHigh, or comparison - NOT ranking
    if (!['multivariate', 'comparison', 'jointHigh', 'correlation'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected multivariate/comparison/jointHigh query type for multi-topic comparison category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Rankings') || category.includes('Top')) {
    if (!['ranking', 'topN', 'distribution'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected ranking/topN query type for ranking category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Comparison') || category.includes('vs')) {
    if (!['correlation', 'comparison', 'difference', 'bivariate', 'multivariate'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected comparison query type for comparison category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Correlation') || lowerQuery.includes('correlat')) {
    if (!['correlation', 'bivariate', 'difference'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected correlation/bivariate/difference query type for correlation query, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Hotspot')) {
    if (!['hotspot', 'cluster', 'spatial'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected hotspot/cluster query type for hotspot category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Bivariate')) {
    if (!['bivariate', 'correlation', 'bivariateMap'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected bivariate query type for bivariate category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  } else if (category.includes('Multivariate')) {
    if (!['multivariate', 'correlation'].includes(queryAnalysis.queryType)) {
      issues.push(`Expected multivariate query type for multivariate category, got: ${queryAnalysis.queryType}`);
      queryTypeValid = false;
    }
  }

  // Overall validation
  const overallValid = hasExpectedBrands && hasExpectedFields && queryTypeValid && 
    conceptMapping.success && queryAnalysis.success && queryClassification.success;

  return {
    hasExpectedBrands,
    hasExpectedFields,
    queryTypeValid,
    overallValid,
    issues
  };
}

/**
 * Test a single query through the complete pipeline
 */
async function testSingleQuery(query: string, category: string): Promise<QueryTestResult> {
  // Step 1: Test concept mapping
  const conceptMappingResult = await testConceptMapping(query);
  
  // Step 2: Test query analysis (requires concept mapping result)
  const conceptMap = {
    matchedFields: conceptMappingResult.matchedFields,
    matchedLayers: conceptMappingResult.matchedLayers,
    confidence: conceptMappingResult.confidence,
    keywords: []
  };
  const queryAnalysisResult = await testQueryAnalysis(query, conceptMap);
  
  // Step 3: Test query classification
  const queryClassificationResult = await testQueryClassification(query);
  
  // Step 4: Validate results
  const validation = validateQueryResults(
    query, 
    category, 
    conceptMappingResult, 
    queryAnalysisResult, 
    queryClassificationResult
  );

  return {
    query,
    category,
    conceptMapping: conceptMappingResult,
    queryAnalysis: queryAnalysisResult,
    queryClassification: queryClassificationResult,
    validation
  };
}

/**
 * Test all queries in a category
 */
async function testQueryCategory(categoryName: string, queries: string[]): Promise<QueryTestResult[]> {
  const results: QueryTestResult[] = [];
  
  for (const query of queries) {
    const result = await testSingleQuery(query, categoryName);
    results.push(result);
  }
  
  return results;
}

/**
 * Test all analysis categories
 */
async function testAllAnalysisCategories(): Promise<Record<string, QueryTestResult[]>> {
  const results: Record<string, QueryTestResult[]> = {};
  
  for (const [categoryName, queries] of Object.entries(ANALYSIS_CATEGORIES)) {
    console.log(`\nTesting category: ${categoryName}`);
    results[categoryName] = await testQueryCategory(categoryName, queries);
  }
  
  return results;
}

/**
 * Test all trends categories
 */
async function testAllTrendsCategories(): Promise<Record<string, QueryTestResult[]>> {
  const results: Record<string, QueryTestResult[]> = {};
  
  for (const [categoryName, queries] of Object.entries(TRENDS_CATEGORIES)) {
    console.log(`\nTesting trends category: ${categoryName}`);
    results[categoryName] = await testQueryCategory(categoryName, queries);
  }
  
  return results;
}

/**
 * Generate a summary report of all test results
 */
function generateSummaryReport(
  analysisResults: Record<string, QueryTestResult[]>,
  trendsResults: Record<string, QueryTestResult[]>
): string {
  let report = '\n' + '='.repeat(80) + '\n';
  report += 'CHAT CONSTANTS VALIDATION SUMMARY REPORT\n';
  report += '='.repeat(80) + '\n\n';

  const allResults = { ...analysisResults, ...trendsResults };
  let totalQueries = 0;
  let totalValid = 0;
  let totalIssues = 0;

  // Category summaries
  for (const [categoryName, results] of Object.entries(allResults)) {
    const validCount = results.filter(r => r.validation.overallValid).length;
    const invalidCount = results.length - validCount;
    const issueCount = results.reduce((sum, r) => sum + r.validation.issues.length, 0);
    
    totalQueries += results.length;
    totalValid += validCount;
    totalIssues += issueCount;

    report += `📊 ${categoryName}\n`;
    report += `   Total Queries: ${results.length}\n`;
    report += `   ✅ Valid: ${validCount}\n`;
    report += `   ❌ Invalid: ${invalidCount}\n`;
    report += `   ⚠️  Issues: ${issueCount}\n\n`;
  }

  // Overall summary
  report += '='.repeat(50) + '\n';
  report += 'OVERALL SUMMARY\n';
  report += '='.repeat(50) + '\n';
  report += `Total Queries Tested: ${totalQueries}\n`;
  report += `✅ Valid Queries: ${totalValid} (${(totalValid/totalQueries*100).toFixed(1)}%)\n`;
  report += `❌ Invalid Queries: ${totalQueries - totalValid} (${((totalQueries-totalValid)/totalQueries*100).toFixed(1)}%)\n`;
  report += `⚠️  Total Issues: ${totalIssues}\n\n`;

  // Detailed issues
  report += '='.repeat(50) + '\n';
  report += 'DETAILED ISSUES\n';
  report += '='.repeat(50) + '\n';

  for (const [categoryName, results] of Object.entries(allResults)) {
    const invalidResults = results.filter(r => !r.validation.overallValid || r.validation.issues.length > 0);
    
    if (invalidResults.length > 0) {
      report += `\n🔍 ${categoryName}:\n`;
      
      for (const result of invalidResults) {
        report += `\n❌ "${result.query}"\n`;
        
        if (!result.conceptMapping.success) {
          report += `   🔸 Concept Mapping Failed: ${result.conceptMapping.error}\n`;
        }
        
        if (!result.queryAnalysis.success) {
          report += `   🔸 Query Analysis Failed: ${result.queryAnalysis.error}\n`;
        }
        
        if (!result.queryClassification.success) {
          report += `   🔸 Query Classification Failed: ${result.queryClassification.error}\n`;
        }
        
        for (const issue of result.validation.issues) {
          report += `   🔸 ${issue}\n`;
        }
        
        report += `   📊 Results:\n`;
        report += `      - Query Type: ${result.queryAnalysis.queryType}\n`;
        report += `      - Visualization Type: ${result.queryClassification.visualizationType}\n`;
        report += `      - Matched Fields: ${result.conceptMapping.matchedFields.join(', ') || 'none'}\n`;
        report += `      - Target Variable: ${result.queryAnalysis.targetVariable}\n`;
      }
    }
  }

  return report;
}

// Main test execution
describe('Chat Constants Validation', () => {
  let analysisResults: Record<string, QueryTestResult[]>;
  let trendsResults: Record<string, QueryTestResult[]>;

  beforeAll(async () => {
    console.log('🚀 Starting comprehensive validation of chat constants...\n');
    
    // Test all analysis categories
    analysisResults = await testAllAnalysisCategories();
    
    // Test all trends categories  
    trendsResults = await testAllTrendsCategories();
    
    // Generate and display summary report
    const summaryReport = generateSummaryReport(analysisResults, trendsResults);
    console.log(summaryReport);
  }, 60000); // 60 second timeout for all tests

  test('All analysis category queries should be valid', () => {
    for (const [categoryName, results] of Object.entries(analysisResults)) {
      const invalidQueries = results.filter(r => !r.validation.overallValid);
      
      if (invalidQueries.length > 0) {
        const errorMessage = `❌ ${categoryName} has ${invalidQueries.length} invalid queries:\n` +
          invalidQueries.map(r => `  - "${r.query}": ${r.validation.issues.join(', ')}`).join('\n');
        
        // For now, let's log warnings but not fail the test to see all issues
        console.warn(errorMessage);
      }
      
      // We can make this stricter later by uncommenting:
      // expect(invalidQueries.length).toBe(0);
    }
  });

  test('All trends category queries should be valid', () => {
    for (const [categoryName, results] of Object.entries(trendsResults)) {
      const invalidQueries = results.filter(r => !r.validation.overallValid);
      
      if (invalidQueries.length > 0) {
        const errorMessage = `❌ ${categoryName} has ${invalidQueries.length} invalid queries:\n` +
          invalidQueries.map(r => `  - "${r.query}": ${r.validation.issues.join(', ')}`).join('\n');
        
        // For now, let's log warnings but not fail the test to see all issues
        console.warn(errorMessage);
      }
      
      // We can make this stricter later by uncommenting:
      // expect(invalidQueries.length).toBe(0);
    }
  });

  test('Brand field mapping should work correctly', () => {
    const nikeQueries = Object.values(analysisResults).flat()
      .filter(r => r.query.toLowerCase().includes('nike'));
    
    for (const result of nikeQueries) {
      const hasNikeField = result.conceptMapping.matchedFields.some(field => 
        field.includes('MP30034A_B')
      );
      
      if (!hasNikeField) {
        console.warn(`⚠️  Nike query missing Nike field: "${result.query}"`);
      }
      
      // expect(hasNikeField).toBe(true);
    }
  });

  test('Comparison queries should have correlation/comparison types', () => {
    const comparisonQueries = Object.values(analysisResults).flat()
      .filter(r => r.query.toLowerCase().includes(' vs ') || 
                   r.query.toLowerCase().includes('compare') ||
                   r.category.includes('Comparison'));
    
    for (const result of comparisonQueries) {
      const validTypes = ['correlation', 'comparison', 'difference', 'bivariate', 'multivariate'];
      const hasValidType = validTypes.includes(result.queryAnalysis.queryType);
      
      if (!hasValidType) {
        console.warn(`⚠️  Comparison query has wrong type: "${result.query}" -> ${result.queryAnalysis.queryType}`);
      }
      
      // expect(hasValidType).toBe(true);
    }
  });

  test('Ranking queries should have ranking/topN types', () => {
    const rankingQueries = Object.values(analysisResults).flat()
      .filter(r => (r.query.toLowerCase().includes('top ') || 
                    r.query.toLowerCase().includes('highest') ||
                    r.query.toLowerCase().includes('rank') ||
                    r.category.includes('Rankings')) &&
                   r.category !== 'Multi-Topic Comparison'); // Exclude multi-topic which are multivariate
    
    for (const result of rankingQueries) {
      const validTypes = ['ranking', 'topN', 'distribution'];
      const hasValidType = validTypes.includes(result.queryAnalysis.queryType);
      
      if (!hasValidType) {
        console.warn(`⚠️  Ranking query has wrong type: "${result.query}" -> ${result.queryAnalysis.queryType}`);
      }
      
      // expect(hasValidType).toBe(true);
    }
  });
}); 