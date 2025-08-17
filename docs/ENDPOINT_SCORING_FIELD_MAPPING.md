# Endpoint Scoring Field Mapping

This document provides the definitive mapping between endpoint files and their corresponding scoring fields that processors should use. The scoring field is always the **last field** in each data object.

## Key Finding: All Scoring Scripts Exist

**Answer to the question "Are endpoints missing because there is no scoring script?"**: **NO**

All endpoints have corresponding scoring scripts in `/scripts/scoring/`. The endpoints marked as "Missing Processors" are missing because the **processor classes** don't exist in the codebase, NOT because the scoring scripts are missing. The scoring infrastructure is complete.

## Endpoint to Scoring Field Mapping

| Endpoint File | Processor Name | Scoring Field | Status |
|---------------|----------------|---------------|---------|
| strategic-analysis.json | StrategicAnalysisProcessor | `strategic_analysis_score` | ✅ |
| competitive-analysis.json | CompetitiveDataProcessor | `competitive_analysis_score` | ✅ |
| demographic-insights.json | DemographicDataProcessor | `demographic_insights_score` | ✅ |
| correlation-analysis.json | CorrelationAnalysisProcessor | `correlation_analysis_score` | ✅ |
| brand-difference.json | BrandDifferenceProcessor | `brand_difference_score` | ✅ |
| comparative-analysis.json | ComparativeAnalysisProcessor | `comparative_analysis_score` | ✅ |
| customer-profile.json | CustomerProfileProcessor | `customer_profile_score` | ✅ |
| trend-analysis.json | TrendAnalysisProcessor | `trend_analysis_score` | ✅ |
| segment-profiling.json | SegmentProfilingProcessor | `segment_profiling_score` | ✅ |
| anomaly-detection.json | AnomalyDetectionProcessor | `anomaly_detection_score` | ✅ |
| predictive-modeling.json | PredictiveModelingProcessor | `predictive_modeling_score` | ✅ |
| feature-interactions.json | FeatureInteractionProcessor | `feature_interactions_score` | ✅ |
| outlier-detection.json | OutlierDetectionProcessor | `outlier_detection_score` | ✅ |
| scenario-analysis.json | ScenarioAnalysisProcessor | `scenario_analysis_score` | ✅ |
| sensitivity-analysis.json | SensitivityAnalysisProcessor | `sensitivity_analysis_score` | ⚠️ Missing |
| model-performance.json | ModelPerformanceProcessor | `model_performance_score` | ⚠️ Missing |
| model-selection.json | ModelSelectionProcessor | `algorithm_category` | ⚠️ Missing |
| ensemble-analysis.json | EnsembleAnalysisProcessor | `ensemble_analysis_score` | ⚠️ Missing |
| feature-importance-ranking.json | FeatureImportanceProcessor | `feature_importance_ranking_score` | ⚠️ Missing |
| dimensionality-insights.json | DimensionalityInsightsProcessor | `dimensionality_insights_score` | ⚠️ Missing |
| spatial-clusters.json | SpatialClustersProcessor | `spatial_clusters_score` | ⚠️ Missing |
| consensus-analysis.json | ConsensusAnalysisProcessor | `consensus_analysis_score` | ⚠️ Missing |
| algorithm-comparison.json | AlgorithmComparisonProcessor | `algorithm_comparison_score` | ⚠️ Missing |
| analyze.json | AnalyzeProcessor | `analyze_score` | ⚠️ Missing |

## Key Findings

### Standard Pattern
Most endpoints follow the pattern: `{endpoint_name}_score` as the final field.

### Special Cases
- **model-selection.json**: Uses `algorithm_category` as the last field (not a score)
- **customer-profile.json**: Has different structure but follows standard pattern

### Processors That Need Updates

#### ❌ Immediate Fixes Required:
1. **CompetitiveAnalysisProcessor** - Currently uses `competitive_analysis_score` ✅ (correct)
2. **CorrelationAnalysisProcessor** - Currently uses `correlation_score`, should use `correlation_analysis_score`

#### ⚠️ Missing Processors:
The following processors don't exist in the codebase but have both endpoint data AND scoring scripts:
- SensitivityAnalysisProcessor (script: `sensitivity_analysis-scores.js`)
- ModelPerformanceProcessor (script: `model_performance-scores.js`)
- ModelSelectionProcessor (script: `model_selection-scores.js`)
- EnsembleAnalysisProcessor (script: `ensemble_analysis-scores.js`)
- FeatureImportanceProcessor (script: `feature_importance_ranking-scores.js`)
- DimensionalityInsightsProcessor (script: `dimensionality_insights-scores.js`)
- SpatialClustersProcessor (script: `spatial_clusters-scores.js`)
- ConsensusAnalysisProcessor (script: `consensus_analysis-scores.js`)
- AlgorithmComparisonProcessor (script: `algorithm_comparison-scores.js`)
- AnalyzeProcessor (script: `analyze-scores.js`)

**Note**: All scoring scripts exist and generate the appropriate scoring fields. The processors need to be created to handle these endpoints.

## Implementation Guidelines

### For Existing Processors
Update the `targetVariable` property to use the exact scoring field name from this mapping.

Example:
```typescript
return {
  // ... other properties
  targetVariable: 'strategic_analysis_score', // Use exact field name
  // ... rest of return object
};
```

### For Score Extraction
Update score extraction methods to prioritize the correct scoring field:

```typescript
private extractScore(record: any): number {
  // Check for the correct scoring field first
  if (record.strategic_analysis_score !== undefined && record.strategic_analysis_score !== null) {
    return Number(record.strategic_analysis_score);
  }
  
  // Fallback to legacy fields for backward compatibility
  // ... fallback logic
}
```

### Field Validation
Update validation methods to check for the correct scoring field:

```typescript
validate(rawData: RawAnalysisResult): boolean {
  // ... existing validation
  
  const hasCorrectScoringField = rawData.results.some(record => 
    record.strategic_analysis_score !== undefined // Use correct field
  );
  
  return hasCorrectScoringField;
}
```

## Critical Rules

1. **Always use the last field** from the endpoint JSON objects
2. **Maintain backward compatibility** by checking legacy fields as fallbacks
3. **Use exact field names** - no approximations or variations
4. **Prioritize the current scoring field** over legacy alternatives

## Last Updated
Generated: 2025-08-17
Based on: Systematic audit of all endpoint JSON files in `/public/data/endpoints/`