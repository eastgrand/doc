# Comprehensive Query Testing Plan & Results

## Overview

This document outlines the comprehensive testing strategy for all predefined queries from `chat-constants.ts` to ensure the complete pipeline from query analysis to visualization works correctly. The testing framework validates every step of the analysis pipeline against the expected flow outlined in `main-reference.md`.

## Testing Objectives

1. **Query Classification Accuracy**: Verify each query is classified with the correct analysis type
2. **Field Detection**: Ensure relevant fields are properly identified and mapped
3. **Target Variable Selection**: Validate the correct target variable is selected for each query
4. **Microservice Request Structure**: Verify the request payload sent to the SHAP microservice is correct
5. **Visualization Strategy**: Confirm the appropriate visualization type is selected
6. **End-to-End Pipeline**: Test the complete flow from query input to map visualization
7. **Error Handling**: Validate graceful handling of edge cases and failures

## Testing Architecture

### Test Categories

#### 1. Athletic Shoes Rankings (8 queries)
- **Expected Analysis Type**: `ranking` or `topN`
- **Expected Visualization**: `choropleth` with ranking visualization
- **Expected Fields**: Brand-specific fields (Nike: `MP30034A_B`, Adidas: `MP30029A_B`, etc.)
- **Expected Layers**: Primary demographic/purchase layer

#### 2. Brand Performance Comparisons (4 queries) 
- **Expected Analysis Type**: `correlation`
- **Expected Visualization**: `correlation`
- **Expected Fields**: Multiple brand fields for comparison
- **Expected Layers**: Primary demographic/purchase layer

#### 3. Demographics vs Athletic Shoe Purchases (4 queries)
- **Expected Analysis Type**: `correlation`
- **Expected Visualization**: `correlation` 
- **Expected Fields**: Demographic fields + brand fields
- **Expected Layers**: Primary demographic/purchase layer

#### 4. Geographic Athletic Market Analysis (4 queries)
- **Expected Analysis Type**: `choropleth` or `jointHigh`
- **Expected Visualization**: `choropleth`
- **Expected Fields**: Brand fields + geographic/demographic fields
- **Expected Layers**: Primary demographic/purchase layer

#### 5. Sports Participation vs Shoe Purchases (4 queries)
- **Expected Analysis Type**: `correlation`
- **Expected Visualization**: `correlation`
- **Expected Fields**: Sports participation fields + brand fields
- **Expected Layers**: Primary demographic/purchase layer

#### 6. Retail Channel Analysis (4 queries)
- **Expected Analysis Type**: `correlation`
- **Expected Visualization**: `correlation`
- **Expected Fields**: Retail shopping fields + brand fields
- **Expected Layers**: Primary demographic/purchase layer

#### 7. Generational Athletic Preferences (4 queries)
- **Expected Analysis Type**: `correlation` or `comparison`
- **Expected Visualization**: `correlation`
- **Expected Fields**: Age demographic fields + brand fields
- **Expected Layers**: Primary demographic/purchase layer

#### 8. Premium vs Budget Athletic Market (4 queries)
- **Expected Analysis Type**: `correlation` or `jointHigh`
- **Expected Visualization**: `correlation`
- **Expected Fields**: Income fields + premium brand fields
- **Expected Layers**: Primary demographic/purchase layer

## Testing Framework Structure

### Test Pipeline Steps

1. **Query Input**: Feed predefined query to analysis pipeline
2. **Concept Mapping**: Validate `conceptMapping()` results
3. **Query Analysis**: Validate `analyzeQuery()` results
4. **Microservice Request**: Validate `buildMicroserviceRequest()` output
5. **Mock Microservice Response**: Simulate SHAP microservice response
6. **Visualization Creation**: Test visualization factory with mock data
7. **Results Validation**: Verify expected outputs at each step

### Test Data Structure

```typescript
interface QueryTestResult {
  query: string;
  category: string;
  
  // Step 1: Concept Mapping
  conceptMapping: {
    matchedLayers: string[];
    matchedFields: string[];
    keywords: string[];
    confidence: number;
  };
  
  // Step 2: Query Analysis  
  queryAnalysis: {
    queryType: string;
    targetVariable: string;
    relevantFields: string[];
    relevantLayers: string[];
    visualizationStrategy: string;
    confidence: number;
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
  };
  
  // Step 4: Expected vs Actual
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
    totalTime: number;
  };
}
```

## Expected Results by Query Category

### Athletic Shoes Rankings
```typescript
const expectedRankingResults = {
  analysisType: 'ranking',
  visualizationStrategy: 'choropleth',
  targetVariable: 'MP30034A_B', // Nike by default
  hasTopN: true,
  topNValue: 25
};
```

### Brand Performance Comparisons  
```typescript
const expectedComparisonResults = {
  analysisType: 'correlation',
  visualizationStrategy: 'correlation',
  targetVariable: 'MP30034A_B', // First mentioned brand
  multipleFields: true,
  fieldCount: 2 // At least 2 brand fields
};
```

### Demographics vs Athletic Shoe Purchases
```typescript
const expectedDemographicResults = {
  analysisType: 'correlation',
  visualizationStrategy: 'correlation',
  targetVariable: 'MP30034A_B', // Default Nike
  hasDemographicFields: true,
  hasBrandFields: true
};
```

## Test Execution Plan

### Phase 1: Unit Testing (Individual Components)
- Test `conceptMapping()` with each query
- Test `analyzeQuery()` with each query  
- Test `buildMicroserviceRequest()` with each analysis result
- Test visualization factory with mock data

### Phase 2: Integration Testing (Pipeline Flow)
- Test complete flow from query to microservice request
- Test with mock microservice responses
- Test visualization creation with real data structures

### Phase 3: End-to-End Testing (Full Pipeline)
- Test with actual microservice calls (if available in test environment)
- Test complete UI flow with real map visualization
- Test error handling and edge cases

## Success Criteria

### Individual Query Success
- ✅ Query classified correctly (analysis type matches expected)
- ✅ Target variable identified correctly
- ✅ Relevant fields detected (minimum required fields present)
- ✅ Microservice request structure valid
- ✅ Visualization strategy appropriate
- ✅ No critical errors in pipeline

### Category Success
- ✅ 80%+ of queries in category pass individual tests
- ✅ Consistent behavior within category
- ✅ Performance within acceptable limits (< 2s per query)

### Overall Success  
- ✅ 90%+ of all queries pass individual tests
- ✅ All 8 categories meet category success criteria
- ✅ No critical pipeline failures
- ✅ Documentation updated with any discovered issues

## Test Results Summary

*Last updated: 2025-01-19T04:26:00.000Z*

✅ **Test execution completed successfully!**

### Overall Statistics
- **Total Queries Tested**: 32/32 (100%)
- **Pipeline Completions**: 32/32 (100%) - All queries completed without errors
- **Successful Classifications**: 4/32 (12.5%) - Only 4 queries met all validation criteria
- **Performance**: Average processing time 11.52ms per query

### Category Breakdown
- **Athletic Shoes Rankings**: 0/4 (0%) - All failed validation
- **Brand Performance Comparisons**: 4/4 (100%) - All passed validation ✅
- **Demographics vs Athletic Shoe Purchases**: 0/4 (0%) - All failed validation
- **Geographic Athletic Market Analysis**: 0/4 (0%) - All failed validation
- **Sports Participation vs Shoe Purchases**: 0/4 (0%) - All failed validation
- **Retail Channel Analysis**: 0/4 (0%) - All failed validation
- **Generational Athletic Preferences**: 0/4 (0%) - All failed validation
- **Premium vs Budget Athletic Market**: 0/4 (0%) - All failed validation

### Critical Issues Identified

#### 1. **Brand Field Detection Issues** (20 occurrences)
- **Problem**: System not recognizing brand fields in analysis results
- **Root Cause**: Case sensitivity mismatch between expected (`MP30034A_B`) and actual (`mp30034a_b`) field codes
- **Impact**: Affects all brand-related queries

#### 2. **Analysis Type Misclassification** (Multiple categories)
- **Problem**: Queries expected to be `correlation` are being classified as `unknown` or `choropleth`
- **Examples**: 
  - "Compare purchasing patterns..." → Expected: `correlation`, Got: `unknown`
  - "Analyze income thresholds..." → Expected: `correlation`, Got: `choropleth`
- **Impact**: 9 queries affected

#### 3. **Insufficient Field Detection** (9 occurrences)
- **Problem**: Queries expecting multiple fields (minimum 2) are returning 0 fields
- **Root Cause**: Concept mapping not detecting relevant demographic/income fields
- **Impact**: Prevents proper correlation analysis

#### 4. **Demographic Field Recognition** (4 occurrences)
- **Problem**: System not identifying demographic fields in queries about demographics
- **Examples**: Queries about "age demographics" and "population diversity" not detecting demographic fields

#### 5. **Visualization Strategy Mismatch** (9 occurrences)
- **Problem**: Expected `correlation` visualization, got `choropleth`
- **Root Cause**: Tied to analysis type misclassification

### Success Story: Brand Performance Comparisons ✅

The **Brand Performance Comparisons** category achieved 100% success rate, demonstrating that:
- Direct brand comparison queries work correctly
- Multi-brand field detection functions properly
- Correlation analysis type is correctly identified for explicit comparisons

**Working Examples**:
- "Compare Nike vs Adidas athletic shoe purchases across regions"
- "How do Jordan sales compare to Converse sales?"
- "Compare athletic shoe purchases between Nike, Puma, and New Balance"

### Recommendations

#### Immediate Fixes Required

1. **Fix Case Sensitivity in Field Validation**
   ```typescript
   // Current issue: mp30034a_b !== MP30034A_B
   // Solution: Normalize case in validation logic
   const normalizedField = field.toUpperCase();
   ```

2. **Improve Query Classification Patterns**
   - Add patterns for demographic correlation queries
   - Enhance detection of income/demographic relationship queries
   - Add patterns for geographic market analysis

3. **Enhance Concept Mapping**
   - Improve demographic field detection for terms like "age", "income", "diversity"
   - Add better mapping for sports participation fields
   - Enhance retail channel field recognition

4. **Update Expected Results**
   - Review and adjust expected analysis types based on actual query intent
   - Consider if some queries should be `choropleth` rather than `correlation`

#### Priority Order
1. **High Priority**: Fix case sensitivity (affects 20 queries)
2. **High Priority**: Improve query classification (affects 13 queries)  
3. **Medium Priority**: Enhance concept mapping (affects 9 queries)
4. **Low Priority**: Review and adjust test expectations

## Test Execution Commands

```bash
# Run comprehensive query testing
npm run test:comprehensive-queries

# Run specific category tests
npm run test:queries:rankings
npm run test:queries:comparisons
npm run test:queries:demographics

# Run with detailed logging
npm run test:queries:verbose

# Generate test report
npm run test:queries:report
```

## Next Steps

1. **Implement Test Framework**: Create the comprehensive testing utilities
2. **Execute Tests**: Run all predefined queries through the pipeline
3. **Analyze Results**: Identify patterns and issues
4. **Fix Issues**: Address any discovered problems
5. **Validate Fixes**: Re-run tests to confirm fixes
6. **Update Documentation**: Document final results and recommendations 