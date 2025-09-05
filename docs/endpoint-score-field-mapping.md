# Endpoint Score Field Mapping

## Overview

This document maps each analysis endpoint to its correct primary score field based on actual data examination. This prevents field naming mismatches that can cause visualization issues.

## Complete Score Field Mappings

| Endpoint | Primary Score Field | Secondary Score Field | Status | Notes |
|----------|-------------------|----------------------|---------|-------|
| **strategic-analysis** | `strategic_score` | - | ✅ **FIXED** | Fixed in processor - no more strategic_analysis_score |
| **competitive-analysis** | `competitive_score` | `competitive_advantage_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **demographic-insights** | `demographic_score` | `demographic_opportunity_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **trend-analysis** | `trend_score` | `trend_strength_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **spatial-clusters** | `cluster_score` | `cluster_performance_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **brand-difference** | `brand_difference_score` | - | ❓ **NEEDS REVIEW** | Single score field |
| **predictive-modeling** | `prediction_score` | `predictive_modeling_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **correlation-analysis** | `correlation_score` | `correlation_strength_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **anomaly-detection** | `anomaly_score` | `anomaly_detection_score` | ❓ **NEEDS REVIEW** | Two score fields + is_anomaly |
| **algorithm-comparison** | `algorithm_performance_score` | `algorithm_agreement_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **analyze** | `analysis_score` | - | ❓ **NEEDS REVIEW** | Single score field |
| **anomaly-insights** | `anomaly_performance_score` | `anomaly_score`, `anomaly_insight_score` | ❓ **NEEDS REVIEW** | Three score fields available |
| **comparative-analysis** | `comparison_score` | `comparative_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **consensus-analysis** | `consensus_performance_score` | `consensus_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **customer-profile** | `customer_profile_score` | - | ❓ **NEEDS REVIEW** | Single score field |
| **dimensionality-insights** | `dimensionality_performance_score` | `dimensionality_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **ensemble-analysis** | `ensemble_performance_score` | `ensemble_strength_score` | ❓ **NEEDS REVIEW** | Two score fields + prediction confidence |
| **feature-importance-ranking** | `importance_score` | `feature_importance_score` | ❓ **NEEDS REVIEW** | Two score fields + importance_value |
| **feature-interactions** | `interaction_score` | `feature_interaction_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **model-performance** | `performance_score` | `r2_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **model-selection** | `model_selection_performance_score` | `model_selection_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **outlier-detection** | `outlier_score` | `outlier_detection_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **scenario-analysis** | `scenario_score` | `scenario_analysis_score` | ⚠️ **POTENTIAL ISSUE** | Similar pattern to strategic_analysis_score issue! |
| **segment-profiling** | `segment_score` | `segment_profiling_score` | ❓ **NEEDS REVIEW** | Two score fields available |
| **sensitivity-analysis** | `sensitivity_score` | - | ❓ **NEEDS REVIEW** | Single score field |
| **similarity-analysis** | `similarity_performance_score` | - | ❓ **NEEDS REVIEW** | Single score field |
| **speed-optimized-analysis** | `speed_optimized_score` | - | ❓ **NEEDS REVIEW** | Single score field |

## Endpoints Not Yet Examined

The following endpoints still need data examination to identify their score fields:

- `feature-selection-analysis` 
- `interpretability-analysis`
- `neural-network-analysis`
- `nonlinear-analysis`

## Critical Findings

### 🚨 POTENTIAL ISSUE FOUND
**scenario-analysis**: Has `scenario_score` and `scenario_analysis_score` - this follows the SAME PATTERN as the strategic-analysis bug we just fixed! The processor might be using `scenario_analysis_score` instead of the actual `scenario_score` field.

### 📊 Score Field Patterns

1. **Single Score Field (8 endpoints)**:
   - `analyze`: `analysis_score`
   - `brand-difference`: `brand_difference_score`
   - `customer-profile`: `customer_profile_score`
   - `sensitivity-analysis`: `sensitivity_score`
   - `similarity-analysis`: `similarity_performance_score`
   - `speed-optimized-analysis`: `speed_optimized_score`
   - `strategic-analysis`: `strategic_score` ✅

2. **Two Score Fields (16+ endpoints)**:
   - Most follow pattern: `primary_score` + `primary_analysis_score`
   - Or: `performance_score` + `specific_score`

3. **Three+ Score Fields (1 endpoint)**:
   - `anomaly-insights`: `anomaly_performance_score`, `anomaly_score`, `anomaly_insight_score`

## Current HardcodedFieldDefs.ts Mappings

Based on the current code, these are the expected mappings:

```typescript
const mapping: Record<string, string> = {
  strategic_analysis: 'strategic_score', // ✅ CONFIRMED CORRECT
  competitive_analysis: 'competitive_score', // ❓ NEEDS VERIFICATION
  demographic_insights: 'demographic_score', // ❓ NEEDS VERIFICATION  
  trend_analysis: 'trend_score', // ❓ NEEDS VERIFICATION
  spatial_clusters: 'cluster_score', // ❓ NEEDS VERIFICATION
  brand_difference: 'brand_difference_score', // ❓ NEEDS VERIFICATION
  predictive_modeling: 'prediction_score', // ❓ NEEDS VERIFICATION
  correlation_analysis: 'correlation_score', // ❓ NEEDS VERIFICATION
  anomaly_detection: 'anomaly_score', // ❓ NEEDS VERIFICATION
  // ... others need to be mapped
};
```

## Issues to Address

### 1. Multiple Score Fields
Many endpoints have both a primary score and a secondary score field:
- **competitive-analysis**: `competitive_score` vs `competitive_advantage_score` 
- **demographic-insights**: `demographic_score` vs `demographic_opportunity_score`
- **trend-analysis**: `trend_score` vs `trend_strength_score`
- etc.

**Action Required**: Determine which should be the primary visualization field.

### 2. Processor Consistency
Each processor should:
- Use only ONE primary score field consistently
- Remove references to unused score field variants  
- Ensure renderer, targetVariable, and records all use the same field

### 3. Validation
Need to verify that:
- HardcodedFieldDefs.ts mappings match actual data
- Processors use the correct field names
- No strategic_analysis_score-style mismatches exist

## Next Steps

1. **Examine remaining datasets** to complete the mapping
2. **Validate each processor** uses the correct score field
3. **Update HardcodedFieldDefs.ts** with verified mappings  
4. **Test each analysis type** to ensure no visualization issues
5. **Document any endpoints with multiple valid score fields**

## Strategic Analysis Fix (Completed)

✅ **FIXED**: strategic-analysis now consistently uses `strategic_score`
- Removed all `strategic_analysis_score` references
- Removed all `strategic_value_score` references  
- Processor, renderer, and targetVariable all use `strategic_score`
- No more field naming mismatches