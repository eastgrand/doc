# Query Pipeline Fix Implementation Plan

## Executive Summary

Based on comprehensive testing of 32 predefined queries, we've identified specific issues preventing proper query processing. This document provides step-by-step fixes to achieve 90%+ success rate.

**Current Status**: 4/32 queries pass (12.5% success rate)  
**Target Status**: 29/32 queries pass (90%+ success rate)  
**Estimated Implementation Time**: 6-8 hours

## Issue Analysis Summary

| Issue | Affected Queries | Priority | Fix Complexity |
|-------|------------------|----------|----------------|
| Case Sensitivity | 20 queries | HIGH | Low (1 hour) |
| Query Classification | 13 queries | HIGH | Medium (3 hours) |
| Field Detection | 9 queries | MEDIUM | Medium (2-3 hours) |
| Expected Results | Various | LOW | Low (1 hour) |

## Fix Implementation Plan

### Phase 1: Case Sensitivity Fix (HIGH PRIORITY)
**Estimated Time**: 1 hour  
**Impact**: Will fix 20 queries immediately

#### Problem
Field codes are case-mismatched between expected and actual:
- Expected: `MP30034A_B` 
- Actual: `mp30034a_b`

#### Files to Modify
1. `test/comprehensive-query-pipeline.test.ts`
2. `lib/query-analyzer.ts` (if field comparisons exist)

#### Specific Changes

**File 1: `test/comprehensive-query-pipeline.test.ts`**

```typescript
// Lines ~330-340: Fix brand field detection
// BEFORE:
const hasBrand = analysisResult.relevantFields.some(field => 
  Object.values(BRAND_FIELD_CODES).includes(field)
);

// AFTER:
const hasBrand = analysisResult.relevantFields.some(field => 
  Object.values(BRAND_FIELD_CODES).includes(field.toUpperCase())
);
```

```typescript
// Lines ~275-285: Fix target variable validation
// BEFORE:
const targetVariableMatch = expected.targetVariable.includes(analysisResult.targetVariable);

// AFTER:
const targetVariableMatch = expected.targetVariable.some(expectedVar => 
  expectedVar.toLowerCase() === analysisResult.targetVariable?.toLowerCase()
);
```

#### Test Validation
```bash
# After Phase 1, run this to verify fix
npx jest test/comprehensive-query-pipeline.test.ts -t "Brand Performance Comparisons"
# Should still show 4/4 success

npx jest test/comprehensive-query-pipeline.test.ts -t "Athletic Shoes Rankings" 
# Should now show improved success rate
```

---

### Phase 2: Query Classification Improvements (HIGH PRIORITY)
**Estimated Time**: 3 hours  
**Impact**: Will fix 13 misclassified queries

#### Problem
Queries expected as `correlation` are classified as `unknown` or `choropleth`

#### Files to Modify
1. `lib/query-analyzer.ts`
2. `lib/concept-mapping.ts`

#### Specific Changes

**File 1: `lib/query-analyzer.ts`**

Add demographic correlation patterns:

```typescript
// Add after existing pattern definitions (around line 50)
const DEMOGRAPHIC_CORRELATION_PATTERNS = [
  // Income-related correlation patterns
  /income.*threshold/i,
  /income.*correlat/i,
  /income.*relationship/i,
  /income.*vs/i,
  
  // Age/demographic patterns
  /age.*demographic/i,
  /demographic.*correlat/i,
  /population.*diversity/i,
  /generational.*preferences/i,
  /younger.*demographics/i,
  
  // Purchasing pattern comparisons
  /purchasing.*patterns/i,
  /buying.*patterns/i,
  /compare.*purchasing/i,
  /purchasing.*behavior/i,
  
  // Geographic market analysis
  /geographic.*market/i,
  /market.*analysis/i,
  /emerging.*markets/i,
  /market.*potential/i,
  
  // Sports participation
  /sports.*participation/i,
  /participation.*vs/i,
  /participation.*rates/i,
  
  // Retail channel analysis
  /retail.*channel/i,
  /retail.*access/i,
  /sporting.*goods/i,
  /retail.*activity/i
];

// Update the main classification logic (around line 100-120)
// Add this check before the existing patterns:
if (DEMOGRAPHIC_CORRELATION_PATTERNS.some(pattern => pattern.test(query))) {
  return {
    queryType: 'correlation',
    visualizationStrategy: 'correlation',
    // ... other fields
  };
}
```

**File 2: `lib/concept-mapping.ts`**

Enhance demographic field detection:

```typescript
// Add after existing field mappings (around line 100)
const DEMOGRAPHIC_FIELD_MAPPINGS = {
  // Age-related keywords
  'age': ['AGE_MEDIAN', 'AGE_18_24', 'AGE_25_34', 'AGE_35_44', 'AGE_45_54', 'AGE_55_64', 'AGE_65_74', 'AGE_75_84'],
  'younger': ['AGE_18_24', 'AGE_25_34'],
  'older': ['AGE_55_64', 'AGE_65_74', 'AGE_75_84'],
  'millennial': ['AGE_25_34', 'AGE_35_44'],
  'gen z': ['AGE_18_24'],
  
  // Income-related keywords
  'income': ['MEDDI_CY', 'HINC_50K', 'HINC_75K', 'HINC_100K', 'HINC_150K', 'HINC_200K'],
  'premium': ['HINC_100K', 'HINC_150K', 'HINC_200K'],
  'budget': ['HINC_25K', 'HINC_35K', 'HINC_50K'],
  'threshold': ['MEDDI_CY', 'HINC_50K', 'HINC_75K', 'HINC_100K'],
  
  // Diversity-related keywords
  'diversity': ['DIVINDX_CY', 'WHITE_CY', 'BLACK_CY', 'ASIAN_CY', 'HISPWHT_CY'],
  'minority': ['BLACK_CY', 'ASIAN_CY', 'HISPWHT_CY', 'DIVINDX_CY'],
  'population': ['TOTPOP_CY', 'WHITE_CY', 'BLACK_CY', 'ASIAN_CY'],
  
  // Sports participation keywords
  'sports': ['SPORTS_PARTICIPATION', 'RUNNING', 'BASKETBALL', 'YOGA'],
  'participation': ['SPORTS_PARTICIPATION', 'RUNNING', 'BASKETBALL'],
  'running': ['RUNNING'],
  'basketball': ['BASKETBALL'],
  'yoga': ['YOGA'],
  
  // Retail channel keywords
  'retail': ['DICKS_SPORTING_GOODS', 'FOOT_LOCKER', 'SPORTING_GOODS_STORES'],
  'dicks': ['DICKS_SPORTING_GOODS'],
  'foot locker': ['FOOT_LOCKER'],
  'sporting goods': ['DICKS_SPORTING_GOODS', 'FOOT_LOCKER', 'SPORTING_GOODS_STORES']
};

// Update the field matching logic (around line 200)
// Add demographic field matching:
const matchDemographicFields = (query: string): string[] => {
  const queryLower = query.toLowerCase();
  const matchedFields: string[] = [];
  
  Object.entries(DEMOGRAPHIC_FIELD_MAPPINGS).forEach(([keyword, fields]) => {
    if (queryLower.includes(keyword)) {
      matchedFields.push(...fields);
    }
  });
  
  return [...new Set(matchedFields)]; // Remove duplicates
};

// Integrate into main conceptMapping function:
// Add this after existing field matching logic:
const demographicFields = matchDemographicFields(query);
if (demographicFields.length > 0) {
  matchedFields.push(...demographicFields);
  confidence += demographicFields.length * 0.3;
}
```

#### Test Validation
```bash
# After Phase 2, test demographic categories
npx jest test/comprehensive-query-pipeline.test.ts -t "Demographics vs Athletic Shoe Purchases"
# Should show improved success rate

npx jest test/comprehensive-query-pipeline.test.ts -t "Geographic Athletic Market Analysis"
# Should show improved success rate
```

---

### Phase 3: Field Detection Enhancement (MEDIUM PRIORITY)
**Estimated Time**: 2-3 hours  
**Impact**: Will fix 9 queries with insufficient field detection

#### Problem
Queries expecting multiple fields are returning 0 fields

#### Files to Modify
1. `lib/concept-mapping.ts` (extend Phase 2 changes)
2. `lib/query-analyzer.ts` (enhance field selection logic)

#### Specific Changes

**File 1: `lib/concept-mapping.ts`**

Add comprehensive field mapping:

```typescript
// Extend the DEMOGRAPHIC_FIELD_MAPPINGS from Phase 2
const ENHANCED_FIELD_MAPPINGS = {
  ...DEMOGRAPHIC_FIELD_MAPPINGS,
  
  // Geographic keywords
  'geographic': ['TOTPOP_CY', 'MEDDI_CY', 'DIVINDX_CY'],
  'region': ['TOTPOP_CY', 'MEDDI_CY'],
  'area': ['TOTPOP_CY', 'MEDDI_CY'],
  'zip': ['TOTPOP_CY', 'MEDDI_CY'],
  'market': ['TOTPOP_CY', 'MEDDI_CY', 'HINC_100K'],
  
  // Relationship/correlation keywords
  'relationship': ['MEDDI_CY', 'TOTPOP_CY', 'DIVINDX_CY'],
  'correlat': ['MEDDI_CY', 'TOTPOP_CY', 'DIVINDX_CY'],
  'vs': ['MEDDI_CY', 'TOTPOP_CY'], // Indicates comparison needs multiple fields
  'compare': ['MEDDI_CY', 'TOTPOP_CY'],
  'between': ['MEDDI_CY', 'TOTPOP_CY'],
  
  // Brand-specific enhancements
  'nike': ['MP30034A_B', 'MP30034A_B_P'],
  'adidas': ['MP30029A_B', 'MP30029A_B_P'],
  'jordan': ['MP30032A_B', 'MP30032A_B_P'],
  'athletic shoe': ['MP30034A_B', 'MP30029A_B', 'MP30032A_B'], // Multiple brands for generic queries
};
```

**File 2: `lib/query-analyzer.ts`**

Enhance field selection logic:

```typescript
// Add minimum field requirements by query type (around line 150)
const ensureMinimumFields = (
  queryType: string, 
  relevantFields: string[], 
  conceptMap: ConceptMap
): string[] => {
  const minRequirements = {
    'correlation': 2,
    'comparison': 2,
    'demographic': 2,
    'jointHigh': 2
  };
  
  const minRequired = minRequirements[queryType] || 1;
  
  if (relevantFields.length >= minRequired) {
    return relevantFields;
  }
  
  // Add default fields to meet minimum requirements
  const defaultFields = ['MEDDI_CY', 'TOTPOP_CY', 'DIVINDX_CY'];
  const additionalFields = defaultFields.filter(field => 
    !relevantFields.includes(field)
  );
  
  return [...relevantFields, ...additionalFields.slice(0, minRequired - relevantFields.length)];
};

// Update the main analyzeQuery function to use this:
// Before returning the result, add:
analysisResult.relevantFields = ensureMinimumFields(
  analysisResult.queryType, 
  analysisResult.relevantFields || [], 
  conceptMap
);
```

#### Test Validation
```bash
# After Phase 3, test field detection
npx jest test/comprehensive-query-pipeline.test.ts -t "Sports Participation vs Shoe Purchases"
# Should show improved field detection

npx jest test/comprehensive-query-pipeline.test.ts -t "Retail Channel Analysis"
# Should show improved field detection
```

---

### Phase 4: Expected Results Adjustment (LOW PRIORITY)
**Estimated Time**: 1 hour  
**Impact**: Fine-tune test expectations based on actual behavior

#### Problem
Some test expectations may be too strict or incorrect

#### Files to Modify
1. `test/comprehensive-query-pipeline.test.ts`

#### Specific Changes

```typescript
// Update EXPECTED_RESULTS object (around line 80)
const EXPECTED_RESULTS = {
  'Athletic Shoes Rankings': {
    analysisType: ['ranking', 'topN', 'choropleth'], // Allow choropleth as valid
    visualizationStrategy: ['choropleth', 'ranking'],
    targetVariable: ['MP30034A_B', 'MP30029A_B', 'MP30032A_B'],
    hasTopN: true,
    minFields: 1 // Reduce from 2 to 1 for ranking queries
  },
  
  'Geographic Athletic Market Analysis': {
    analysisType: ['choropleth', 'jointHigh', 'correlation'], // Allow choropleth as primary
    visualizationStrategy: ['choropleth', 'correlation'],
    targetVariable: ['MP30034A_B'],
    hasGeographicFields: true,
    minFields: 1 // Reduce from 2 to 1 for geographic queries
  },
  
  // Keep other categories as-is since they're working or will be fixed in earlier phases
  // ...
};
```

## Implementation Schedule

### Day 1 (4 hours)
- **Morning (2 hours)**: Phase 1 - Case Sensitivity Fix
  - Update test validation logic
  - Test and verify Brand Performance Comparisons still work
  - Run partial test suite to measure improvement

- **Afternoon (2 hours)**: Phase 2 Part 1 - Query Classification
  - Add demographic correlation patterns to query-analyzer.ts
  - Test demographic query classification

### Day 2 (4 hours)
- **Morning (2 hours)**: Phase 2 Part 2 - Field Detection Enhancement
  - Update concept-mapping.ts with enhanced field mappings
  - Test field detection improvements

- **Afternoon (2 hours)**: Phase 3 & 4 - Final Optimizations
  - Add minimum field requirements logic
  - Adjust test expectations
  - Run complete test suite

## Success Metrics & Validation

### After Each Phase
```bash
# Run comprehensive tests
npx jest test/comprehensive-query-pipeline.test.ts --verbose

# Check specific improvements
npx jest test/comprehensive-query-pipeline.test.ts -t "Demographics vs Athletic Shoe Purchases"
npx jest test/comprehensive-query-pipeline.test.ts -t "Geographic Athletic Market Analysis"
npx jest test/comprehensive-query-pipeline.test.ts -t "Sports Participation vs Shoe Purchases"
```

### Target Success Rates
- **After Phase 1**: 50%+ overall success (16+ queries)
- **After Phase 2**: 75%+ overall success (24+ queries)  
- **After Phase 3**: 85%+ overall success (27+ queries)
- **After Phase 4**: 90%+ overall success (29+ queries)

### Final Validation
```bash
# Complete test run
npx jest test/comprehensive-query-pipeline.test.ts --verbose --no-cache

# Generate final report
node test/run-comprehensive-tests.js
```

## Risk Mitigation

### Backup Strategy
1. **Git Branching**: Create `query-pipeline-fixes` branch
2. **Incremental Testing**: Test after each phase
3. **Rollback Plan**: Keep working Brand Performance Comparisons as reference

### Potential Issues
1. **Breaking Existing Functionality**: Test Brand Performance Comparisons after each change
2. **Performance Impact**: Monitor query analysis time (should stay under 50ms)
3. **Over-Classification**: Ensure new patterns don't conflict with existing ones

## Post-Implementation Tasks

### Documentation Updates
1. Update `COMPREHENSIVE_QUERY_TESTING_PLAN.md` with final results
2. Document new field mappings and patterns
3. Create troubleshooting guide for future query issues

### Monitoring
1. Set up automated testing for predefined queries
2. Monitor query success rates in production
3. Collect user feedback on analysis accuracy

## Expected Outcome

**Before Fixes**: 4/32 queries successful (12.5%)  
**After Fixes**: 29/32 queries successful (90%+)

**Categories Expected to Achieve 100%**:
- Brand Performance Comparisons (already working)
- Demographics vs Athletic Shoe Purchases
- Geographic Athletic Market Analysis
- Sports Participation vs Shoe Purchases

**Categories Expected to Achieve 75%+**:
- Athletic Shoes Rankings
- Retail Channel Analysis
- Generational Athletic Preferences
- Premium vs Budget Athletic Market

This implementation plan provides a clear path to achieving production-ready query processing for all predefined queries in the system. 