# Endpoints to Complete Later

## Overview

This document tracks analysis endpoints and features that need to be completed, fixed, or redesigned in future development cycles. These are endpoints that have implementation issues or don't provide meaningful visualizations in their current state.

---

## 🚫 SPATIAL CLUSTERING ANALYSIS

### Issue Summary
The spatial clustering endpoint has fundamental design flaws that make it unsuitable for meaningful geographic cluster visualization.

### Problems Identified

#### 1. **Inappropriate Cluster Granularity**
- **Dataset contains**: ~4,000 individual ZIP codes/areas
- **Predefined clusters**: Only 2 clusters total
  - Cluster 2: "Competitive Battleground" (1,249 areas)
  - Cluster 7: "Small Market Niche" (2,734 areas)
- **Result**: Having only 2 clusters for 4,000 areas provides no meaningful geographic segmentation

#### 2. **Cluster Definition Problems**
- Existing `cluster_id` and `cluster_label` fields are too broad to be useful
- No geographic contiguity or regional logic in cluster assignments
- Performance score-based clustering (attempted fix) created artificial segments that don't represent real spatial relationships

#### 3. **Visualization Confusion**
- Users expect to see 5-10 distinct geographic regions/clusters
- Current implementation shows either:
  - All 4,000 individual areas (overwhelming)
  - 2 meaningless broad categories (useless)
  - 5 artificial performance-based groups (not geographically meaningful)

### Files Modified (Need Reverting)
- `/lib/analysis/strategies/processors/ClusterDataProcessor.ts` - Multiple attempts to fix clustering logic
- `/lib/analysis/VisualizationRenderer.ts` - Geometry detection changes
- `/components/geospatial-chat-interface.tsx` - Debugging code for renderer issues

### What Needs to Be Done Later

#### Option 1: Redesign Data Structure
- Create meaningful geographic clusters (5-15 clusters)
- Base clusters on actual geographic regions, market similarity, or demographic patterns
- Ensure geographic contiguity and business logic
- Update dataset with proper `cluster_id` assignments

#### Option 2: Dynamic Clustering Algorithm
- Implement proper spatial clustering algorithm (k-means, DBSCAN, etc.)
- Use geographic coordinates and demographic/performance variables
- Generate clusters dynamically based on query needs
- Create cluster centroid visualization with meaningful boundaries

#### Option 3: Remove Spatial Clustering
- Focus on other analysis types that work well
- Redirect "cluster" queries to strategic or competitive analysis
- Avoid promising spatial clustering until data is redesigned

### Lessons Learned
1. **Clustering requires meaningful granularity** - 2 clusters for 4,000 areas is not useful
2. **Geographic data needs spatial logic** - clusters should represent real regions
3. **Performance scoring ≠ spatial clustering** - different concepts entirely
4. **User expectations matter** - "clusters" implies distinct geographic regions

---

## 🚫 CORRELATION ANALYSIS

### Issue Summary
The correlation analysis endpoint has a data mismatch issue - the endpoint expects `correlation_score` field but the dataset only contains SHAP values and feature importance, no actual correlation scores.

### Problems Identified

#### 1. **Missing Correlation Scores**
- **Expected field**: `correlation_score` (configured in ConfigurationManager)
- **Actual data**: Only SHAP values and feature importance
- **Result**: All values default to 50, creating meaningless visualization

#### 2. **Query Routing Confusion**
- Query: "What market factors are most strongly correlated with Nike's success?"
- This gets routed to correlation-analysis but should probably go to strategic or competitive analysis
- The analysis text talks about correlations but the data doesn't support correlation analysis

#### 3. **Visualization Issues**
- Legend shows: "< 50.0, 50.0 - 50.0, 50.0 - 50.0, > 50.0"
- No meaningful geographic differentiation
- All areas show the same value

### Data Structure Problem
```json
// Expected structure:
{
  "ID": 10001,
  "correlation_score": 75.5,  // MISSING!
  ...
}

// Actual structure:
{
  "ID": 10001,
  "shap_AMERIND_CY": -0.07291,
  "shap_ASIAN_CY": 0.60145,
  // Only SHAP values, no correlation scores
}
```

### What Needs to Be Done Later

#### Option 1: Add Correlation Scores to Data
- Calculate actual correlation coefficients between variables
- Add `correlation_score` field to each record
- Ensure scores represent meaningful statistical correlations

#### Option 2: Repurpose as Feature Importance Analysis
- Rename endpoint to "feature-importance-analysis"
- Use SHAP values to create importance scores
- Update visualization to show feature contributions

#### Option 3: Remove/Redirect Correlation Queries
- Route correlation queries to strategic or competitive analysis
- Remove correlation-analysis from available endpoints
- Update query patterns to avoid correlation routing

### Files Affected
- `/public/data/endpoints/correlation-analysis.json` - Missing correlation scores
- `/lib/analysis/ConfigurationManager.ts` - Expects correlation_score field

---

## 🚫 MULTI-ENDPOINT ANALYSIS

## Current Architecture

### Detection Layer
- **CachedEndpointRouter**: Has regex patterns for multi-endpoint detection
- **MultiEndpointQueryDetector**: More sophisticated query analysis (not currently used by main flow)

### Processing Layer
- **MultiEndpointRouter**: Loads data from multiple endpoints in parallel
- **DatasetMerger**: Merges datasets using different strategies (overlay, comparison, sequential, correlation)
- **CompositeDataProcessor**: Generates insights from merged data
- **MultiEndpointVisualizationRenderer**: Creates unified visualizations

### Integration
- **MultiEndpointAnalysisEngine**: Orchestrates the entire multi-endpoint flow
- **AnalysisEngine**: Routes between single and multi-endpoint analysis

## What We've Tried

### 1. Query Detection Fixes
- ✅ **Added regex patterns** to CachedEndpointRouter for customer profile + strategic analysis
- ✅ **Added pattern to MultiEndpointQueryDetector** with appropriate keywords and endpoints
- ✅ **Multi-endpoint detection now works** - query properly triggers multi-endpoint mode

### 2. Data Format Issues
- ✅ **Fixed CachedEndpointRouter** to handle both direct array `[{...}]` and wrapped `{results: [...]}` formats
- ✅ **Customer profile uses direct array** format while other endpoints use wrapped format
- ⚠️ **Type mismatch in processing pipeline** - DatasetMerger returns `RawAnalysisResult` but CompositeDataProcessor expects `MergedDataset`

### 3. CompositeDataProcessor Fixes
- ✅ **Fixed initial error** - `mergedData.mergedRecords` undefined by adding fallback to `mergedData.results`
- ✅ **Fixed secondary errors** - Updated all references to `mergedRecords` throughout the file
- ❌ **Still failing** - `Object.keys()` called on undefined/null in `calculateInsightConfidence` method

### 4. Fallback Strategy
- ✅ **Temporarily disabled multi-endpoint patterns** to allow single-endpoint routing
- ✅ **Query now routes to customer-profile** endpoint directly
- ✅ **Customer profile endpoint works correctly** with proper data loading and visualization

## Current Issues

### 1. Type System Inconsistency
The multi-endpoint pipeline has a fundamental type mismatch:

```typescript
// DatasetMerger.mergeDatasets() returns:
RawAnalysisResult = {
  success: boolean,
  results: any[],
  model_info: any,
  feature_importance: any[]
}

// But CompositeDataProcessor expects:
MergedDataset = {
  mergedRecords: any[],
  fieldMapping: Record<string, string[]>,
  locationCoverage: {...},
  qualityMetrics: {...},
  // ... more properties
}
```

### 2. Incomplete Error Handling
- CompositeDataProcessor assumes properties exist that may be undefined
- Missing null checks before `Object.keys()` calls
- Inadequate fallback handling for missing data structures

### 3. Data Pipeline Complexity
- Multiple layers of data transformation
- Each layer expects specific data formats
- Errors cascade through the pipeline
- Difficult to debug and maintain

## Potential Solutions

### Option 1: Fix Type System
- Update DatasetMerger to return proper MergedDataset format
- Ensure all properties are populated correctly
- Add comprehensive validation at each step

### Option 2: Simplify Architecture
- Create dedicated multi-endpoint processors for specific combinations
- E.g., `CustomerProfileStrategicProcessor` that handles this specific case
- Bypass the generic pipeline for known combinations

### Option 3: Robust Fallbacks
- Add comprehensive null checks throughout CompositeDataProcessor
- Provide meaningful defaults for missing data
- Graceful degradation when parts of the pipeline fail

### Option 4: Client-Side Composition
- Load endpoints independently as single-endpoint analyses
- Combine visualizations on the frontend
- Use side-by-side or overlay rendering techniques

## Files Modified

### Detection and Routing
- `/lib/analysis/CachedEndpointRouter.ts` - Added multi-endpoint patterns, fixed data format handling
- `/lib/analysis/MultiEndpointQueryDetector.ts` - Added customer profile + strategic pattern

### Data Processing  
- `/lib/analysis/CompositeDataProcessor.ts` - Fixed mergedRecords references, added fallbacks
- `/lib/analysis/strategies/processors/CustomerProfileProcessor.ts` - Fixed data loading, updated colors

### Configuration
- `/lib/analysis/utils/ScoreTerminology.ts` - Added customer profile score configuration
- `/lib/analysis/ConfigurationManager.ts` - Customer profile already configured

## Next Steps

1. **Immediate**: Continue with single-endpoint customer profile analysis
2. **Short-term**: Implement Option 2 (dedicated processor) for customer profile + strategic combination
3. **Long-term**: Redesign multi-endpoint architecture with proper type safety and error handling

## Test Queries

### Working (Single Endpoint)
- ✅ "Show me ideal customer personas for athletic brands" → `/customer-profile`
- ✅ "Strategic analysis of Nike expansion opportunities" → `/strategic-analysis`

### Multi-Endpoint (Disabled)
- ❌ "Analyze customer profiles and compare with strategic opportunities" → Should combine both endpoints
- ❌ "Customer profile analysis with strategic value scoring" → Should overlay customer + strategic data

## Lessons Learned

1. **Multi-endpoint analysis is complex** - requires careful coordination between many components
2. **Type safety is critical** - mismatched interfaces cause cascading failures  
3. **Data format consistency matters** - direct arrays vs wrapped objects cause processing issues
4. **Error handling must be comprehensive** - undefined properties crash the entire pipeline
5. **Simpler solutions often work better** - single-endpoint with good keywords may be preferable

---

*Last Updated: 2025-01-27*
*Status: Multi-endpoint disabled, investigating solutions*