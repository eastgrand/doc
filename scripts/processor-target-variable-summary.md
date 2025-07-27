# Target Variable Analysis Summary

## Overview

Analysis of key processors in `/lib/analysis/strategies/processors/` to check which ones are missing their `targetVariable` fields at the top level of returned records.

## Key Findings

**ALL 6 focus processors are missing their target variables at the top level of records.**

The pattern found in all processors:
1. ✅ They correctly declare `targetVariable` in their return statement
2. ✅ They extract the appropriate score using dedicated methods
3. ✅ They add the target variable to the `properties` object
4. ❌ **They do NOT add the target variable at the top level of the record object**

## Processor-by-Processor Analysis

### 1. CorrelationAnalysisProcessor ❌
- **Target Variable**: `correlation_strength_score`
- **Issue**: Only in `properties.correlation_strength_score`, missing from top level
- **Current Record Structure**:
  ```typescript
  {
    area_id,
    area_name,
    value,              // Uses correlationScore as value
    rank,
    category,
    coordinates,
    properties: {
      correlation_strength_score: correlationScore,  // Only here!
      // ... other properties
    },
    shapValues
  }
  ```
- **Fix Needed**: Add `correlation_strength_score: correlationScore,` at top level

### 2. TrendAnalysisProcessor ❌
- **Target Variable**: `trend_strength_score`
- **Issue**: Only in `properties.trend_strength_score`, missing from top level
- **Current Pattern**: Same as above - score used as `value`, stored in `properties`, but not at top level
- **Fix Needed**: Add `trend_strength_score: trendScore,` at top level

### 3. DemographicDataProcessor ❌
- **Target Variable**: `demographic_opportunity_score`
- **Issue**: Only in `properties.demographic_opportunity_score`, missing from top level
- **Current Pattern**: Same as above - score used as `value`, stored in `properties`, but not at top level
- **Fix Needed**: Add `demographic_opportunity_score: demographicScore,` at top level

### 4. AnomalyDetectionProcessor ❌
- **Target Variable**: `anomaly_detection_score`
- **Issue**: Only in `properties.anomaly_detection_score`, missing from top level
- **Current Pattern**: Same as above - score used as `value`, stored in `properties`, but not at top level
- **Fix Needed**: Add `anomaly_detection_score: anomalyScore,` at top level

### 5. OutlierDetectionProcessor ❌
- **Target Variable**: `outlier_detection_score`
- **Issue**: Only in `properties.outlier_detection_score`, missing from top level
- **Current Pattern**: Same as above - score used as `value`, stored in `properties`, but not at top level
- **Fix Needed**: Add `outlier_detection_score: outlierScore,` at top level

### 6. FeatureInteractionProcessor ❌
- **Target Variable**: `feature_interaction_score`
- **Issue**: Only in `properties.feature_interaction_score`, missing from top level
- **Current Pattern**: Same as above - score used as `value`, stored in `properties`, but not at top level
- **Fix Needed**: Add `feature_interaction_score: interactionScore,` at top level

## Required Fixes

Each processor needs to add their target variable at the top level of the record object. The pattern should be:

### Current Structure (INCORRECT):
```typescript
return {
  area_id,
  area_name,
  value: extractedScore,
  rank,
  category,
  coordinates,
  properties: {
    target_variable_name: extractedScore,  // ❌ Only here
    // ... other properties
  },
  shapValues
};
```

### Fixed Structure (CORRECT):
```typescript
return {
  area_id,
  area_name,
  value: extractedScore,
  target_variable_name: extractedScore,     // ✅ ADD THIS LINE
  rank,
  category,
  coordinates,
  properties: {
    target_variable_name: extractedScore,   // ✅ Keep this too
    // ... other properties
  },
  shapValues
};
```

## Specific Code Changes Needed

### CorrelationAnalysisProcessor.ts
Line ~119, add after `value,`:
```typescript
correlation_strength_score: correlationScore,
```

### TrendAnalysisProcessor.ts
Line ~74, add after `value: Math.round(trendScore * 100) / 100,`:
```typescript
trend_strength_score: trendScore,
```

### DemographicDataProcessor.ts
Line ~107, add after `value,`:
```typescript
demographic_opportunity_score: demographicScore,
```

### AnomalyDetectionProcessor.ts
Line ~76, add after `value: Math.round(anomalyScore * 100) / 100,`:
```typescript
anomaly_detection_score: anomalyScore,
```

### OutlierDetectionProcessor.ts
Line ~78, add after `value: Math.round(outlierScore * 100) / 100,`:
```typescript
outlier_detection_score: outlierScore,
```

### FeatureInteractionProcessor.ts
Line ~78, add after `value: Math.round(interactionScore * 100) / 100,`:
```typescript
feature_interaction_score: interactionScore,
```

## Impact

Without these fields at the top level:
- ❌ Frontend components can't easily access the target variable values
- ❌ Sorting and filtering by target variables may not work correctly
- ❌ Data serialization may lose important score information
- ❌ API consumers expect consistent field access patterns

With these fixes:
- ✅ Target variables accessible both at top level and in properties
- ✅ Consistent data structure across all processors
- ✅ Better frontend integration and data handling
- ✅ Proper field availability for sorting, filtering, and display

## Priority

**HIGH** - All 6 processors need immediate fixes to ensure consistent data structure and proper field accessibility.