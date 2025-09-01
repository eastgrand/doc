# Code-level comparison: strategic-analysis (baseline vs current)

This note maps the previously failing “baseline” behavior to the current, working code paths with exact file touchpoints and invariants. Focus: strategic-analysis routing, processing, visualization, dynamic field detection, and post-process.


## Scope and key files

- app/api/claude/generate-response/route.ts
  - resolvePrimaryScoreField(): bans id/geometry/numeric-only/aggregate-like fields; requires variance; supports nested props; typed defaults per analysis.
  - Respects metadata.spatialFilterIds; safe id extraction (props.ID | props.id | props.area_id); DESCRIPTION usage for names.
  - Integrates Top Strategic Markets injection and Study Area Summary.
- lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts
  - process(): canonical-first score selection; mirrors chosen score to targetVariable; requires variance; excludes aggregates; builds synchronized renderer + legend.
  - createStrategicRenderer()/createStrategicLegend(): quartile breaks; standardized RGBA arrays; renderer.field = selected score.
  - calculateCompositeStrategicScore(): fallback when value looks like share/small.
- lib/analysis/VisualizationRenderer.ts
  - Prefers processor-provided renderer/legend; validates renderer.field numeric; safe fallbacks to avoid grey maps.
- utils/apply-analysis-visualization.ts
  - Injects renderer.field into FeatureLayer schema; ensures targetVariable exists; extent/legend wiring.
- lib/analysis/strategies/processors/DynamicFieldDetector.ts
  - Pattern-driven detection; excludes numeric-only names; conservative unmatched promotion.
- lib/analysis/postprocess/topStrategicMarkets.ts
  - Ranked/capped list; respects spatialFilterIds unless project scope; dedupe; Study Area Summary.


## Baseline defects (what used to go wrong)

- “Last numeric wins” picked constants/ids (e.g., 1804), causing flat maps and bad ranks.
- renderer.field mismatched or absent → grey maps; schema missing field.
- No variance guard → constant field selected.
- Top Strategic Markets ignored spatialFilterIds or lacked cap/dedupe.


## Current implementation (how it’s fixed)

- route.ts: resolvePrimaryScoreField bans ids/geometry/numeric-only/aggregates and requires variance over a sample; supports nested properties; typed defaults by analysis. Spatial filters honored via metadata.spatialFilterIds; robust id/name extraction.
- StrategicAnalysisProcessor: canonical-first selection; sanitizes and mirrors to targetVariable; builds synchronized class-breaks renderer and legend with quartiles and RGBA arrays; composite fallback if score < 20.
- VisualizationRenderer + apply-analysis-visualization: use direct renderer/legend; validate numerics; inject renderer.field into schema; safe fallback paths prevent grey maps.
- DynamicFieldDetector: excludes numeric-only names; domain patterns stabilize field detection across datasets.
- Top Strategic Markets: ranks/caps, respects spatialFilterIds (unless project scope), dedupes, adds Study Area Summary.


## Invariants to rely on

- renderer.field == result.targetVariable for numeric choropleths.
- Selected score field must have variance (no constants) and must not be id/geometry/aggregate/numeric-only.
- Legend and renderer class breaks/colors stay synchronized; colors are RGBA arrays.
- FeatureLayer schema includes renderer.field; attributes carry targetVariable values.
- Spatial scoping: spatialFilterIds constrain candidates unless analysisScope=project.


## Validation cues (quick checks)

- Tests passing:
  - lib/analysis/strategies/processors/__tests__/StrategicAnalysisProcessor.*.test.ts (field selection, renderer/legend sync, composite fallback).
  - lib/analysis/strategies/processors/__tests__/DynamicFieldAlignment.e2e.test.ts (renderer/targetVariable alignment and fallbacks).
  - lib/analysis/postprocess/__tests__/topStrategicMarkets.test.ts (cap, scoping, summary).
- Route smokes:
  - metadata.spatialFilterIds filtering present; Top Strategic Markets injection present.


## Delta summary

- From heuristic “last numeric” to constrained, variance-guarded, canonical-first selection shared by server and processor.
- From renderer/field mismatches to strict renderer.field == targetVariable with schema injection and numeric validation.
- From grey maps to stable quartile class-breaks and synchronized legend with array colors.
- From unscoped/uncapped Top Markets to scoped, capped, deduped lists with Study Area Summary.
