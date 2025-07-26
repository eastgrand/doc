# Field-Agnostic System Refactor Plan

## Overview
The current system has a two-tier field support structure where athletic shoe brands receive special hardcoded treatment while other field categories (yoga, demographics, sports participation, retail, etc.) rely on less robust generic matching. This creates inconsistent behavior where some correlations work perfectly (Nike vs Adidas) while others fail (Yoga vs Athletic Shoes).

## Problem Analysis

### Current Two-Tier System
- **Tier 1 (Privileged)**: Athletic shoe brands (Nike, Adidas, Jordan, etc.)
  - Hardcoded field mappings in multiple files
  - Special detection logic in query analyzer
  - Dedicated handling in concept mapping
  - Robust correlation support in microservice
  
- **Tier 2 (Generic)**: All other fields (yoga, demographics, sports participation, retail)
  - Relies on keyword matching
  - Less robust field resolution
  - Limited correlation support
  - Inconsistent naming patterns

### Identified Issues
1. **Query Analyzer**: Hardcoded `BRAND_FIELD_CODES` only includes athletic shoe brands
2. **Concept Mapping**: Special `brandFieldMap` for athletic shoes only
3. **Microservice Request Builder**: Brand-specific correlation detection
4. **Microservice**: Hardcoded field aliases in bivariate correlation handler
5. **Visualization Factory**: Brand-focused field resolution patterns

## Refactor Plan

### Phase 1: Microservice Generalization

#### 1.1 Enhanced Analysis Worker (`shap-microservice/enhanced_analysis_worker.py`)
**Current Issue**: Hardcoded field aliases in `handle_bivariate_correlation()`

**Changes**:
- ✅ **COMPLETED**: Replace hardcoded `field_aliases` with dynamic column detection
- ✅ **COMPLETED**: Use `get_human_readable_field_name()` for consistent naming
- **Result**: Any two fields can now use bivariate correlation pathway

#### 1.2 Field Name Mapping (`shap-microservice/enhanced_analysis_worker.py`)
**Current Issue**: `get_human_readable_field_name()` may have gaps

**Changes**:
- Audit existing field mappings for completeness
- Ensure all field categories have proper human-readable names
- Add any missing field mappings (yoga, sports participation, demographics, retail)

### Phase 2: Frontend Query Processing

#### 2.1 Query Analyzer Refactor (`lib/query-analyzer.ts`)
**Current Issue**: Hardcoded `BRAND_FIELD_CODES` creates brand bias

**Changes**:
- **Remove**: Hardcoded `BRAND_FIELD_CODES` mapping
- **Replace with**: Dynamic field detection using `FIELD_ALIASES`
- **Implement**: Category-agnostic field matching logic
- **Update**: Brand comparison detection to work with any field categories
- **Add**: Support for cross-category correlations (e.g., yoga vs brands, demographics vs retail)

**New Logic**:
```typescript
// Instead of hardcoded brands, use dynamic field detection
const detectFieldsFromQuery = (query: string) => {
  const detectedFields: string[] = [];
  
  // Use existing FIELD_ALIASES for comprehensive field detection
  Object.entries(FIELD_ALIASES).forEach(([alias, fieldCode]) => {
    if (queryContainsField(query, alias)) {
      detectedFields.push(fieldCode);
    }
  });
  
  return detectedFields;
};
```

#### 2.2 Concept Mapping Refactor (`lib/concept-mapping.ts`)
**Current Issue**: Special `brandFieldMap` creates inconsistent field treatment

**Changes**:
- **Remove**: Hardcoded `brandFieldMap` for athletic shoes
- **Enhance**: Generic field keyword matching to be more robust
- **Implement**: Consistent scoring across all field categories
- **Add**: Support for field aliases and variations
- **Ensure**: All field types get equal priority in matching

**New Approach**:
```typescript
// Replace brand-specific logic with category-agnostic field detection
const detectFieldsFromKeywords = (query: string) => {
  const fieldMatches: Record<string, number> = {};
  
  // Use FIELD_KEYWORDS for all field types equally
  Object.entries(FIELD_KEYWORDS).forEach(([fieldCode, keywords]) => {
    const score = calculateFieldScore(query, keywords);
    if (score > 0) {
      fieldMatches[fieldCode] = score;
    }
  });
  
  return fieldMatches;
};
```

#### 2.3 Microservice Request Builder (`lib/build-microservice-request.ts`)
**Current Issue**: Brand-specific correlation detection

**Changes**:
- **Remove**: Hardcoded brand detection logic
- **Replace with**: Generic multi-field correlation detection
- **Implement**: Support for any field combination in correlations
- **Update**: Request building to handle any field categories equally

**New Logic**:
```typescript
// Instead of brand-specific detection
const isCorrelationQuery = (query: string, fields: string[]) => {
  const hasCorrelationKeywords = /\b(vs|versus|compare|correlation|relationship|between)\b/i.test(query);
  const hasMultipleFields = fields.length >= 2;
  
  return hasCorrelationKeywords && hasMultipleFields;
};
```

### Phase 3: Visualization System

#### 3.1 Visualization Factory (`utils/visualization-factory.ts`)
**Current Issue**: Brand-focused field resolution patterns

**Changes**:
- **Review**: `ensureCandidateFields` logic for any brand bias
- **Enhance**: Field resolution to work consistently across all categories
- **Implement**: Robust multi-layer correlation support
- **Test**: Cross-category correlations (yoga vs brands, demographics vs retail)

#### 3.2 Field Mapping Helper (`utils/visualizations/field-mapping-helper.ts`)
**Current Issue**: Potential gaps in field name mappings

**Changes**:
- **Audit**: `FIELD_CODE_TO_DISPLAY_NAME` for completeness
- **Add**: Any missing field categories
- **Ensure**: Consistent naming patterns across all field types
- **Test**: Field name resolution for all categories

### Phase 4: Testing and Validation

#### 4.1 Cross-Category Correlation Tests
**Test Cases to Implement**:
- Yoga vs Athletic Shoes (current failing case)
- Demographics vs Brands (e.g., Income vs Nike)
- Sports Participation vs Retail (e.g., Running vs Dick's Sporting Goods)
- Fandom vs Brands (e.g., NBA Super Fan vs Jordan)
- Demographics vs Demographics (e.g., Age vs Income)
- Mixed category correlations

#### 4.2 Regression Testing
**Ensure Existing Functionality**:
- Nike vs Adidas still works
- Single brand queries still work
- Ranking queries still work
- All existing test cases pass

#### 4.3 Integration Testing
**End-to-End Validation**:
- Query → Field Detection → Microservice → Visualization
- Test with various field combinations
- Validate field name display consistency
- Check correlation calculation accuracy

### Phase 5: Documentation and Cleanup

#### 5.1 Code Cleanup
- Remove unused hardcoded mappings
- Clean up comments referencing brand-specific logic
- Update variable names to be category-agnostic
- Remove deprecated code paths

#### 5.2 Documentation Updates
- Update API documentation
- Add examples of cross-category correlations
- Document new field detection logic
- Update troubleshooting guides

## Implementation Order

### Priority 1 (Critical Path)
1. **Microservice field detection** (✅ COMPLETED)
2. **Query analyzer refactor** - Removes brand bias in field detection
3. **Concept mapping refactor** - Ensures consistent field treatment
4. **Test yoga vs athletic shoes** - Validates the fix

### Priority 2 (Robustness)
1. **Microservice request builder** - Handles any field combinations
2. **Visualization factory review** - Ensures consistent rendering
3. **Field mapping completeness** - Covers all field categories

### Priority 3 (Quality Assurance)
1. **Comprehensive testing** - All cross-category combinations
2. **Regression testing** - Existing functionality preserved
3. **Documentation** - Updated guides and examples

## Expected Outcomes

### Immediate Benefits
- Yoga vs Athletic Shoes correlation will work
- Any two fields can be correlated regardless of category
- Consistent field detection across all categories
- Uniform visualization quality for all field types

### Long-term Benefits
- Easy addition of new field categories
- No hardcoded limitations for future fields
- Consistent user experience across all queries
- Simplified maintenance and debugging

## Risk Mitigation

### Potential Risks
1. **Breaking existing functionality** - Extensive regression testing required
2. **Performance impact** - Dynamic detection may be slower than hardcoded
3. **Field naming inconsistencies** - Comprehensive field mapping audit needed

### Mitigation Strategies
1. **Phased rollout** - Implement and test each component separately
2. **Comprehensive testing** - Both new functionality and regression tests
3. **Fallback mechanisms** - Graceful degradation if field detection fails
4. **Monitoring** - Track query success rates before and after changes

## Success Criteria

### Technical Metrics
- Yoga vs Athletic Shoes query produces correct correlation visualization
- All existing brand correlation queries continue to work
- Field detection accuracy maintains >95% for all categories
- Visualization rendering time remains under 3 seconds

### User Experience
- Consistent correlation visualization quality across all field types
- Accurate field names displayed in legends and tooltips
- No difference in user experience between brand and non-brand fields
- Support for any meaningful field combination users might request

## Files to Modify

### Phase 1 (Microservice)
- ✅ `shap-microservice/enhanced_analysis_worker.py` (COMPLETED)

### Phase 2 (Frontend Core)
- `lib/query-analyzer.ts`
- `lib/concept-mapping.ts`
- `lib/build-microservice-request.ts`

### Phase 3 (Visualization)
- `utils/visualization-factory.ts`
- `utils/visualizations/field-mapping-helper.ts`

### Phase 4 (Testing)
- New test files for cross-category correlations
- Updated existing test files
- Integration test suites

This refactor will transform the system from having hardcoded field biases to being truly field-agnostic, supporting any meaningful correlation between any available fields in the dataset. 