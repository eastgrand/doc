// Comprehensive Query Pipeline Testing Framework
// Tests all predefined queries from chat-constants.ts through the complete analysis pipeline

import { conceptMapping } from '../lib/concept-mapping';
import { analyzeQuery } from '../lib/query-analyzer';
import { buildMicroserviceRequest } from '../lib/build-microservice-request';
import { ANALYSIS_CATEGORIES } from '../components/chat/chat-constants';
import { AnalysisResult, ConceptMap } from '../lib/analytics/types';

// Test result interfaces
interface QueryTestResult {
  query: string;
  category: string;
  
  // Step 1: Concept Mapping
  conceptMapping: {
    matchedLayers: string[];
    matchedFields: string[];
    keywords: string[];
    confidence: number;
    success: boolean;
    error?: string;
  };
  
  // Step 2: Query Analysis  
  queryAnalysis: {
    queryType: string;
    targetVariable: string;
    relevantFields: string[];
    relevantLayers: string[];
    visualizationStrategy: string;
    confidence: number;
    success: boolean;
    error?: string;
  };
  
  // Step 3: Microservice Request
  microserviceRequest: {
    query: string;
    analysis_type: string;
    target_variable: string;
    matched_fields: string[];
    relevant_layers: string[];
    top_n?: number;
    metrics?: string[];
    success: boolean;
    error?: string;
  };
  
  // Step 4: Expected vs Actual Validation
  validation: {
    expectedAnalysisType: string;
    actualAnalysisType: string;
    analysisTypeMatch: boolean;
    
    expectedTargetVariable: string;
    actualTargetVariable: string;
    targetVariableMatch: boolean;
    
    expectedVisualization: string;
    actualVisualization: string;
    visualizationMatch: boolean;
    
    expectedFieldsPresent: string[];
    actualFieldsPresent: string[];
    fieldsMatch: boolean;
    
    overallSuccess: boolean;
    issues: string[];
  };
  
  // Step 5: Performance Metrics
  performance: {
    conceptMappingTime: number;
    queryAnalysisTime: number;
    microserviceRequestTime: number;
    totalTime: number;
  };
}

// Expected results by query category
const EXPECTED_RESULTS = {
  'Athletic Shoes Rankings': {
    analysisType: ['ranking', 'topN', 'choropleth'],
    visualizationStrategy: ['choropleth', 'ranking'],
    targetVariable: ['MP30034A_B', 'MP30029A_B', 'MP30032A_B'], // Nike, Adidas, Jordan
    hasTopN: true,
    minFields: 1
  },
  'Brand Performance Comparisons': {
    analysisType: ['correlation', 'comparison'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B', 'MP30029A_B', 'MP30032A_B', 'MP30031A_B'], // Any brand
    multipleFields: true,
    minFields: 2
  },
  'Demographics vs Athletic Shoe Purchases': {
    analysisType: ['correlation'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B'], // Default Nike
    hasDemographicFields: true,
    hasBrandFields: true,
    minFields: 2
  },
  'Geographic Athletic Market Analysis': {
    analysisType: ['choropleth', 'jointHigh', 'correlation'],
    visualizationStrategy: ['choropleth', 'correlation'],
    targetVariable: ['MP30034A_B'], // Default Nike
    hasGeographicFields: true,
    minFields: 1
  },
  'Sports Participation vs Shoe Purchases': {
    analysisType: ['correlation'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B'], // Default Nike
    hasSportsFields: true,
    hasBrandFields: true,
    minFields: 2
  },
  'Retail Channel Analysis': {
    analysisType: ['correlation'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B'], // Default Nike
    hasRetailFields: true,
    hasBrandFields: true,
    minFields: 2
  },
  'Generational Athletic Preferences': {
    analysisType: ['correlation', 'comparison'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B'], // Default Nike
    hasAgeFields: true,
    hasBrandFields: true,
    minFields: 2
  },
  'Premium vs Budget Athletic Market': {
    analysisType: ['correlation', 'jointHigh'],
    visualizationStrategy: ['correlation'],
    targetVariable: ['MP30034A_B', 'MP30032A_B'], // Nike, Jordan (premium)
    hasIncomeFields: true,
    hasBrandFields: true,
    minFields: 2
  }
};

// Brand field codes for validation
const BRAND_FIELD_CODES = {
  'nike': 'MP30034A_B',
  'jordan': 'MP30032A_B', 
  'converse': 'MP30031A_B',
  'adidas': 'MP30029A_B',
  'puma': 'MP30035A_B',
  'reebok': 'MP30036A_B',
  'new balance': 'MP30033A_B',
  'newbalance': 'MP30033A_B',
  'asics': 'MP30030A_B'
};

// Demographic field patterns for validation
const DEMOGRAPHIC_FIELDS = [
  'TOTPOP_CY', 'MEDDI_CY', 'DIVINDX_CY', 'ASIAN_CY', 'BLACK_CY', 'WHITE_CY', 'HISPWHT_CY'
];

const SPORTS_FIELDS = [
  'running', 'basketball', 'yoga', 'fitness', 'gym'
];

const RETAIL_FIELDS = [
  'dicks', 'foot_locker', 'sporting_goods', 'retail'
];

const AGE_FIELDS = [
  'millennial', 'gen_z', 'boomer', 'age', 'generation'
];

const INCOME_FIELDS = [
  'MEDDI_CY', 'income', 'disposable_income', 'household_income'
];

// Test execution functions
async function testConceptMapping(query: string): Promise<QueryTestResult['conceptMapping']> {
  const startTime = performance.now();
  
  try {
    const conceptMap = await conceptMapping(query);
    const endTime = performance.now();
    
    return {
      matchedLayers: conceptMap.matchedLayers || [],
      matchedFields: conceptMap.matchedFields || [],
      keywords: conceptMap.keywords || [],
      confidence: conceptMap.confidence || 0,
      success: true
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      matchedLayers: [],
      matchedFields: [],
      keywords: [],
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testQueryAnalysis(query: string, conceptMap: ConceptMap): Promise<QueryTestResult['queryAnalysis']> {
  const startTime = performance.now();
  
  try {
    const analysisResult = await analyzeQuery(query, conceptMap, '');
    const endTime = performance.now();
    
    return {
      queryType: analysisResult.queryType,
      targetVariable: analysisResult.targetVariable || '',
      relevantFields: analysisResult.relevantFields || [],
      relevantLayers: analysisResult.relevantLayers || [],
      visualizationStrategy: analysisResult.visualizationStrategy || '',
      confidence: analysisResult.confidence || 0,
      success: true
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      queryType: 'unknown',
      targetVariable: '',
      relevantFields: [],
      relevantLayers: [],
      visualizationStrategy: '',
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

async function testMicroserviceRequest(query: string, analysisResult: AnalysisResult): Promise<QueryTestResult['microserviceRequest']> {
  const startTime = performance.now();
  
  try {
    const request = buildMicroserviceRequest(analysisResult, query, analysisResult.targetVariable, '');
    const endTime = performance.now();
    
    return {
      query: request.query,
      analysis_type: request.analysis_type,
      target_variable: request.target_variable,
      matched_fields: request.matched_fields || [],
      relevant_layers: request.relevant_layers || [],
      top_n: (request as any).top_n,
      metrics: (request as any).metrics,
      success: true
    };
  } catch (error) {
    const endTime = performance.now();
    
    return {
      query: '',
      analysis_type: '',
      target_variable: '',
      matched_fields: [],
      relevant_layers: [],
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function validateResults(
  query: string, 
  category: string, 
  conceptResult: QueryTestResult['conceptMapping'],
  analysisResult: QueryTestResult['queryAnalysis'],
  requestResult: QueryTestResult['microserviceRequest']
): QueryTestResult['validation'] {
  const expected = EXPECTED_RESULTS[category as keyof typeof EXPECTED_RESULTS];
  const issues: string[] = [];
  
  // Validate analysis type
  const analysisTypeMatch = expected.analysisType.includes(analysisResult.queryType);
  if (!analysisTypeMatch) {
    issues.push(`Expected analysis type: ${expected.analysisType.join(' or ')}, got: ${analysisResult.queryType}`);
  }
  
  // Validate target variable (case-insensitive)
  const targetVariableMatch = expected.targetVariable.some(expectedVar => 
    expectedVar.toLowerCase() === analysisResult.targetVariable?.toLowerCase()
  );
  if (!targetVariableMatch) {
    issues.push(`Expected target variable: ${expected.targetVariable.join(' or ')}, got: ${analysisResult.targetVariable}`);
  }
  
  // Validate visualization strategy
  const visualizationMatch = expected.visualizationStrategy.includes(analysisResult.visualizationStrategy);
  if (!visualizationMatch) {
    issues.push(`Expected visualization: ${expected.visualizationStrategy.join(' or ')}, got: ${analysisResult.visualizationStrategy}`);
  }
  
  // Validate field count
  const actualFieldCount = analysisResult.relevantFields.length;
  const fieldsMatch = actualFieldCount >= expected.minFields;
  if (!fieldsMatch) {
    issues.push(`Expected minimum ${expected.minFields} fields, got: ${actualFieldCount}`);
  }
  
  // Category-specific validations with proper type checking
  let categorySpecificMatch = true;
  
  if ('multipleFields' in expected && expected.multipleFields && actualFieldCount < 2) {
    issues.push('Expected multiple fields for comparison query');
    categorySpecificMatch = false;
  }
  
  if ('hasDemographicFields' in expected && expected.hasDemographicFields) {
    const DEMOGRAPHIC_FIELDS = ['TOTPOP_CY', 'MEDDI_CY', 'DIVINDX_CY', 'ASIAN_CY', 'BLACK_CY', 'WHITE_CY', 'HISPWHT_CY'];
    const hasDemographic = analysisResult.relevantFields.some(field => 
      DEMOGRAPHIC_FIELDS.some(demo => 
        field.toLowerCase().includes(demo.toLowerCase()) || 
        demo.toLowerCase().includes(field.toLowerCase())
      )
    );
    if (!hasDemographic) {
      issues.push('Expected demographic fields not found');
      categorySpecificMatch = false;
    }
  }
  
  if ('hasBrandFields' in expected && expected.hasBrandFields) {
    const BRAND_FIELD_CODES = {
      'nike': 'MP30034A_B',
      'jordan': 'MP30032A_B', 
      'converse': 'MP30031A_B',
      'adidas': 'MP30029A_B',
      'puma': 'MP30035A_B',
      'reebok': 'MP30036A_B',
      'new balance': 'MP30033A_B',
      'newbalance': 'MP30033A_B',
      'asics': 'MP30030A_B'
    };
    const hasBrand = analysisResult.relevantFields.some(field => 
      Object.values(BRAND_FIELD_CODES).some(brandField => 
        brandField.toLowerCase() === field.toLowerCase()
      )
    );
    if (!hasBrand) {
      issues.push('Expected brand fields not found');
      categorySpecificMatch = false;
    }
  }
  
  const overallSuccess = analysisTypeMatch && targetVariableMatch && visualizationMatch && fieldsMatch && categorySpecificMatch;
  
  return {
    expectedAnalysisType: expected.analysisType.join(' or '),
    actualAnalysisType: analysisResult.queryType,
    analysisTypeMatch,
    
    expectedTargetVariable: expected.targetVariable.join(' or '),
    actualTargetVariable: analysisResult.targetVariable,
    targetVariableMatch,
    
    expectedVisualization: expected.visualizationStrategy.join(' or '),
    actualVisualization: analysisResult.visualizationStrategy,
    visualizationMatch,
    
    expectedFieldsPresent: expected.targetVariable,
    actualFieldsPresent: analysisResult.relevantFields,
    fieldsMatch,
    
    overallSuccess,
    issues
  };
}

// Main test function
async function testSingleQuery(query: string, category: string): Promise<QueryTestResult> {
  const totalStartTime = performance.now();
  
  console.log(`\n🧪 Testing Query: "${query}"`);
  console.log(`📂 Category: ${category}`);
  
  // Step 1: Concept Mapping
  console.log('📍 Step 1: Concept Mapping...');
  const conceptStartTime = performance.now();
  const conceptResult = await testConceptMapping(query);
  const conceptEndTime = performance.now();
  
  console.log('   ✓ Matched Layers:', conceptResult.matchedLayers);
  console.log('   ✓ Matched Fields:', conceptResult.matchedFields);
  console.log('   ✓ Keywords:', conceptResult.keywords);
  console.log('   ✓ Success:', conceptResult.success);
  if (conceptResult.error) console.log('   ❌ Error:', conceptResult.error);
  
  // Step 2: Query Analysis
  console.log('🔍 Step 2: Query Analysis...');
  const analysisStartTime = performance.now();
  
  // Create concept map object for analysis
  const conceptMap: ConceptMap = {
    matchedLayers: conceptResult.matchedLayers,
    matchedFields: conceptResult.matchedFields,
    keywords: conceptResult.keywords,
    confidence: conceptResult.confidence,
    layerScores: {},
    fieldScores: {}
  };
  
  const analysisResult = await testQueryAnalysis(query, conceptMap);
  const analysisEndTime = performance.now();
  
  console.log('   ✓ Query Type:', analysisResult.queryType);
  console.log('   ✓ Target Variable:', analysisResult.targetVariable);
  console.log('   ✓ Relevant Fields:', analysisResult.relevantFields);
  console.log('   ✓ Visualization Strategy:', analysisResult.visualizationStrategy);
  console.log('   ✓ Success:', analysisResult.success);
  if (analysisResult.error) console.log('   ❌ Error:', analysisResult.error);
  
  // Step 3: Microservice Request
  console.log('🚀 Step 3: Microservice Request...');
  const requestStartTime = performance.now();
  
  // Create analysis result object for request building
  const fullAnalysisResult: AnalysisResult = {
    queryType: analysisResult.queryType as any,
    targetVariable: analysisResult.targetVariable,
    relevantFields: analysisResult.relevantFields,
    relevantLayers: analysisResult.relevantLayers,
    visualizationStrategy: analysisResult.visualizationStrategy,
    entities: [],
    intent: 'ranking',
    confidence: analysisResult.confidence,
    layers: [],
    timeframe: '',
    searchType: 'web',
    explanation: ''
  };
  
  const requestResult = await testMicroserviceRequest(query, fullAnalysisResult);
  const requestEndTime = performance.now();
  
  console.log('   ✓ Analysis Type:', requestResult.analysis_type);
  console.log('   ✓ Target Variable:', requestResult.target_variable);
  console.log('   ✓ Matched Fields:', requestResult.matched_fields);
  console.log('   ✓ Top N:', requestResult.top_n);
  console.log('   ✓ Success:', requestResult.success);
  if (requestResult.error) console.log('   ❌ Error:', requestResult.error);
  
  // Step 4: Validation
  console.log('✅ Step 4: Validation...');
  const validation = validateResults(query, category, conceptResult, analysisResult, requestResult);
  
  console.log('   ✓ Analysis Type Match:', validation.analysisTypeMatch);
  console.log('   ✓ Target Variable Match:', validation.targetVariableMatch);
  console.log('   ✓ Visualization Match:', validation.visualizationMatch);
  console.log('   ✓ Fields Match:', validation.fieldsMatch);
  console.log('   ✓ Overall Success:', validation.overallSuccess);
  
  if (validation.issues.length > 0) {
    console.log('   ❌ Issues:');
    validation.issues.forEach(issue => console.log(`      - ${issue}`));
  }
  
  const totalEndTime = performance.now();
  
  const result: QueryTestResult = {
    query,
    category,
    conceptMapping: conceptResult,
    queryAnalysis: analysisResult,
    microserviceRequest: requestResult,
    validation,
    performance: {
      conceptMappingTime: conceptEndTime - conceptStartTime,
      queryAnalysisTime: analysisEndTime - analysisStartTime,
      microserviceRequestTime: requestEndTime - requestStartTime,
      totalTime: totalEndTime - totalStartTime
    }
  };
  
  return result;
}

// Test suite
describe('Comprehensive Query Pipeline Testing', () => {
  let allResults: QueryTestResult[] = [];
  
  // Test all categories
  Object.entries(ANALYSIS_CATEGORIES).forEach(([categoryName, queries]) => {
    describe(categoryName, () => {
      queries.forEach((query, index) => {
        it(`should process query ${index + 1}: "${query}"`, async () => {
          const result = await testSingleQuery(query, categoryName);
          allResults.push(result);
          
          // Basic assertion that the pipeline completed
          expect(result.conceptMapping.success).toBe(true);
          expect(result.queryAnalysis.success).toBe(true);
          expect(result.microserviceRequest.success).toBe(true);
          
          // Log detailed results for troubleshooting
          if (!result.validation.overallSuccess) {
            console.log(`\n❌ FAILED: ${query}`);
            console.log('Issues:', result.validation.issues);
          } else {
            console.log(`\n✅ PASSED: ${query}`);
          }
        }, 10000); // 10s timeout per query
      });
    });
  });
  
  // Summary test that runs after all individual tests
  afterAll(() => {
    console.log('\n📊 COMPREHENSIVE TEST SUMMARY');
    console.log('═'.repeat(80));
    
    const totalQueries = allResults.length;
    const successfulQueries = allResults.filter(r => r.validation.overallSuccess).length;
    const successRate = totalQueries > 0 ? (successfulQueries / totalQueries * 100).toFixed(1) : '0';
    
    console.log(`\n📈 Overall Statistics:`);
    console.log(`   • Total Queries Tested: ${successfulQueries}/${totalQueries}`);
    console.log(`   • Success Rate: ${successRate}%`);
    
    // Category breakdown
    console.log(`\n📂 Category Breakdown:`);
    Object.keys(ANALYSIS_CATEGORIES).forEach(categoryName => {
      const categoryResults = allResults.filter(r => r.category === categoryName);
      const categorySuccesses = categoryResults.filter(r => r.validation.overallSuccess).length;
      const categoryRate = categoryResults.length > 0 ? (categorySuccesses / categoryResults.length * 100).toFixed(1) : '0';
      console.log(`   • ${categoryName}: ${categorySuccesses}/${categoryResults.length} (${categoryRate}%)`);
    });
    
    // Performance metrics
    const avgTotalTime = allResults.reduce((sum, r) => sum + r.performance.totalTime, 0) / allResults.length;
    console.log(`\n⚡ Performance:`);
    console.log(`   • Average Total Time: ${avgTotalTime.toFixed(2)}ms`);
    
    // Common issues
    const allIssues = allResults.flatMap(r => r.validation.issues);
    const issueFrequency = allIssues.reduce((acc, issue) => {
      acc[issue] = (acc[issue] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    if (Object.keys(issueFrequency).length > 0) {
      console.log(`\n❌ Most Common Issues:`);
      Object.entries(issueFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([issue, count]) => {
          console.log(`   • ${issue} (${count} times)`);
        });
    }
    
    console.log('\n' + '═'.repeat(80));
  });
}); 