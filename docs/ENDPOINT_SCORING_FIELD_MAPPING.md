# Endpoint Scoring Field Mapping

This document provides the definitive mapping between endpoint files and their corresponding scoring fields that processors should use.

Important for current project (Energy dataset): The scoring field is dynamically detected as the last numeric field in each record. This accommodates datasets where the canonical name (e.g., strategic_analysis_score) may appear as strategic_score or similar but remains the last numeric property. Dynamic-only is enforced: if a scoring field cannot be detected, processing fails fast with an explicit error (no canonical fallbacks).

## Key Finding: All Scoring Scripts Exist

**Answer to the question "Are endpoints missing because there is no scoring script?"**: **NO**

All endpoints have corresponding scoring scripts in `/scripts/scoring/`. The endpoints marked as "Missing Processors" are missing because the **processor classes** don't exist in the codebase, NOT because the scoring scripts are missing. The scoring infrastructure is complete.

## Endpoint to Scoring Field Mapping

| Endpoint File | Processor Name | Canonical Score (legacy docs) | Claude API Field | Status |
|---------------|----------------|---------------|------------------|---------|
| strategic-analysis.json | StrategicAnalysisProcessor | `strategic_analysis_score` | `strategic_analysis_score` | ✅ |
| competitive-analysis.json | CompetitiveDataProcessor | `competitive_analysis_score` | `competitive_analysis_score` | ✅ |
| demographic-insights.json | DemographicDataProcessor | `demographic_insights_score` | `demographic_insights_score` | ✅ |
| correlation-analysis.json | CorrelationAnalysisProcessor | `correlation_analysis_score` | `correlation_analysis_score` | ✅ |
| brand-difference.json | BrandDifferenceProcessor | `brand_difference_score` | `brand_difference_score` | ✅ |
| brand-analysis.json | BrandAnalysisProcessor | `brand_analysis_score` | `brand_analysis_score` | ✅ |
| comparative-analysis.json | ComparativeAnalysisProcessor | `comparison_score` | `comparison_score` | ✅ |
| customer-profile.json | CustomerProfileProcessor | `customer_profile_score` | `customer_profile_score` | ✅ |
| trend-analysis.json | TrendAnalysisProcessor | `trend_analysis_score` | `trend_analysis_score` | ✅ |
| segment-profiling.json | SegmentProfilingProcessor | `segment_profiling_score` | `segment_profiling_score` | ✅ |
| anomaly-detection.json | AnomalyDetectionProcessor | `anomaly_detection_score` | `anomaly_detection_score` | ✅ |
| predictive-modeling.json | PredictiveModelingProcessor | `predictive_modeling_score` | `predictive_modeling_score` | ✅ |
| feature-interactions.json | FeatureInteractionProcessor | `feature_interactions_score` | `feature_interactions_score` | ✅ |
| outlier-detection.json | OutlierDetectionProcessor | `outlier_detection_score` | `outlier_detection_score` | ✅ |
| scenario-analysis.json | ScenarioAnalysisProcessor | `scenario_analysis_score` | `scenario_analysis_score` | ✅ |
| sensitivity-analysis.json | SensitivityAnalysisProcessor | `sensitivity_analysis_score` | `sensitivity_analysis_score` | ✅ |
| model-performance.json | ModelPerformanceProcessor | `model_performance_score` | `model_performance_score` | ✅ |
| model-selection.json | ModelSelectionProcessor | `algorithm_category` | `algorithm_category` | ✅ |
| ensemble-analysis.json | EnsembleAnalysisProcessor | `ensemble_analysis_score` | `ensemble_analysis_score` | ✅ |
| feature-importance-ranking.json | FeatureImportanceRankingProcessor | `feature_importance_ranking_score` | `feature_importance_ranking_score` | ✅ |
| dimensionality-insights.json | DimensionalityInsightsProcessor | `dimensionality_insights_score` | `dimensionality_insights_score` | ✅ |
| spatial-clusters.json | SpatialClustersProcessor | `spatial_clusters_score` | `spatial_clusters_score` | ✅ |
| consensus-analysis.json | ConsensusAnalysisProcessor | `consensus_analysis_score` | `consensus_analysis_score` | ✅ |
| algorithm-comparison.json | AlgorithmComparisonProcessor | `algorithm_comparison_score` | `algorithm_comparison_score` | ✅ |
| analyze.json | AnalyzeProcessor | `analysis_score` | `analysis_score` | ✅ |

### Project Overrides (Energy Dataset)

Dynamic-only policy is enforced. For the current energy dataset, the runtime system detects the scoring field dynamically as the last numeric field per record.

Observed examples:

- strategic-analysis: last numeric field often appears as `strategic_score` (renderer.field and targetVariable will be set to that key). For compatibility, processors may mirror the detected value into canonical-named fields in the output object/properties.
- Other endpoints follow the same “last numeric field wins” rule. If no numeric field can be detected, processors throw an explicit error. No canonical fallbacks are used.

Runtime behavior summary:

- Ranking, renderer.field, legend, and targetVariable all reference the dynamically detected field.
- Processor output may also include the canonical score name for downstream compatibility, but it is not used to select the scoring field.

## Key Findings

 
### Standard Pattern

Most endpoints follow the pattern: `{endpoint_name}_score` as the final field. For the energy dataset, we enforce “last numeric field wins,” which typically corresponds to that pattern (e.g., `strategic_score` as last field).

 
### Special Cases
 
- **model-selection.json**: Uses `algorithm_category` as the last field (not a score)
- **customer-profile.json**: The primary score is `customer_profile_score`. Older datasets may include `purchase_propensity`; processors treat it as a fallback only.

### Field Mapping Alignment Status

 
#### ✅ All Processors and Claude API Fields Now Aligned

All processors and Claude API field mappings have been systematically verified and aligned:

- Strategic analysis now correctly uses `strategic_analysis_score` (legacy datasets may include `strategic_value_score`; processors normalize to `strategic_analysis_score`)
- Comparative analysis now correctly uses `comparison_score` (was using `comparative_analysis_score`)
- All other processors verified to match between processor output and Claude API expectations

#### ✅ All Processors Completed

All processors have been created and are now fully functional:
 
- SensitivityAnalysisProcessor ✅ (script: `sensitivity_analysis-scores.js`)
- ModelPerformanceProcessor ✅ (script: `model_performance-scores.js`)
- ModelSelectionProcessor ✅ (script: `model_selection-scores.js`) - *Special case: handles categorical algorithm_category field*
- EnsembleAnalysisProcessor ✅ (script: `ensemble_analysis-scores.js`)
- FeatureImportanceRankingProcessor ✅ (script: `feature_importance_ranking-scores.js`)
- DimensionalityInsightsProcessor ✅ (script: `dimensionality_insights-scores.js`)
- SpatialClustersProcessor ✅ (script: `spatial_clusters-scores.js`)
- ConsensusAnalysisProcessor ✅ (script: `consensus_analysis-scores.js`)
- AlgorithmComparisonProcessor ✅ (script: `algorithm_comparison-scores.js`)
- AnalyzeProcessor ✅ (script: `analyze-scores.js`)

**✅ Complete**: All 24 endpoints now have dedicated processors with proper scoring field integration.

## Implementation Guidelines

 
### For Existing Processors

- Set `targetVariable` to the dynamically detected field (last numeric field).
- Set `renderer.field` to the same detected field.
- Optionally mirror the detected value into the canonical field name in the output for compatibility.
- If detection fails, throw an explicit error; do not fallback to canonical names.

 
### For Score Extraction

Prefer reading the value from the detected dynamic field. You may also copy that value into canonical-named fields for consumers that expect them, but field selection itself must be dynamic-only. If the detected field isn’t present or isn’t numeric, throw an error.

 
### Field Validation

Validation should confirm basic shape (success flag and array of results). Don’t require canonical score fields. Rely on runtime dynamic detection to determine the score field; if none can be found, throw an explicit error in processing.

## Critical Rules

1. Detect the scoring field as the **last numeric field** in each record (energy dataset convention), dynamic-only.
2. If detection fails, **throw an explicit error**; do not fallback to canonical fields.
3. Ensure `renderer.field === targetVariable === detectedField` for every processor.
4. Optionally mirror values into canonical names for compatibility, but never to select the scoring field.

## Endpoint Selection Tie-breakers (routing overview)

While this document focuses on score field selection, endpoint selection is governed by a small set of deterministic tie-breakers. These ensure correct routing when multiple endpoints could apply:

- Competitive vs Strategic: Prefer Competitive when the query contains explicit comparison intents (e.g., competitive positioning, stack up) or comparative operators (vs, versus) without broad strategic expansion phrasing.
- Brand-difference vs Competitive: When two brand/company tokens are detected with vs/versus or clear brand-comparison phrasing, prefer Brand Difference. Explicit vs/versus gets a stronger targeted bonus for Brand Difference and a stronger penalty for Competitive. Additionally, a small cap/floor normalization is applied (cap Competitive near <1.0 and floor Brand Difference slightly higher) to avoid 1.0 vs 1.0 ties.
- Strategic hijack guard: Generic strategic terms are down-weighted when a more specific domain signal (demographic, competitive, brand-difference) is present, preventing over-selection of Strategic.
- Confidence handling: Low-confidence in-scope queries are still routed with a warning; malformed/out-of-scope queries are rejected.

These tie-breakers live in the routing layer and don’t affect score field detection, which remains dynamic-only per this doc.

Note: Base intent signals include “market positioning” as competitive context even without the exact word “competitive”, ensuring Layer 1 confidence clears thresholds for common phrasing like “Market positioning analysis”.

## Brand-vs handling (routing specifics)

When queries mention two brands with explicit comparison language:

- Boost Brand Difference with brand-count-sensitive weighting (stronger when vs/versus is present).
- Apply a targeted penalty to Competitive so Brand Difference wins; also apply a cap (Competitive) and floor (Brand Difference) to prevent ties in explicit brand-vs-brand cases.
- Avoidance rules consider both reasoning and original query to prevent accidental fallback to unrelated endpoints.

## Spatial Filtering (server-side)

 When `metadata.spatialFilterIds` is provided, the API route enforces server-side filtering of features unless the scope is `project`.
 ID extraction sources (in order):

 1) `ID`, `id`, `area_id`, `areaID`, `geoid`, `GEOID`
 2) Extract ZIP-like token from `DESCRIPTION` or `area_name` (supports formats like `11234 (Brooklyn)`, `ZIP 08544 - Princeton`)
 3) Otherwise, feature is excluded from spatial filtering
 A small utility `lib/analysis/utils/spatialFilter.ts` implements this logic with tests.

## Post-process: Top Strategic Markets injection

When a strategic analysis response is generated, a post-process step injects a ranked list titled “Top Strategic Markets”:

- The list is capped at 10 entries: `slice(0, Math.min(10, results.length))`.
- Always includes a “Study Area Summary” footer entry.
- Respects `metadata.spatialFilterIds` unless `analysisScope === 'project'` (in which case the full dataset is considered).
- Sorting is performed by the same dynamically detected score field used for `renderer.field` and `targetVariable`.

 
## Last Updated

Generated: 2025-08-31
Based on: Systematic audit of all endpoint JSON files in `/public/data/endpoints/`

## Appendix: Implemented optional improvements

- Avoidance filters enhanced to consider both the generated reasoning and the original user query text.
- Narrowed generic strategic boosts to reduce hijacking in mixed-intent queries.
- Added explicit comparative action recognition (e.g., “stack up”, “vs/versus”) to support correct endpoint selection.

## Legacy Precision Note (Strategic)

- Processors may mirror values into `strategic_analysis_score` for compatibility, but selection is dynamic-only (last numeric field). No canonical fallbacks are used for field selection.

## Quick Verification Checklist

- Renderer field equals `targetVariable` and both equal the detected dynamic field.
- Top 5/Top Markets in UI are sorted by the same dynamic field as the renderer.
- Claude API route never calls microservices; ranking uses the detected dynamic field; no legacy fallbacks.
- FieldMappingConfig.getPrimaryScoreField (if present) must align with the detected dynamic field.
- ScoreTerminology scoreFieldName remains consistent for narratives, but does not influence field selection.
