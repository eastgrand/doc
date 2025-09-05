# VisualizationManager — Testing, Fixes, and Outcomes

This document captures the investigation, design, implementation, tests, and follow-up actions completed while fixing duplicate visualization layers and stabilizing related analysis processors.

## Goal

- Stop duplicate `FeatureLayer` creation caused by concurrent visualization requests.
- Implement a deterministic, per-map `VisualizationManager` to dedupe in-flight visualization creation.
- Run the full test-suite, triage regressions surfaced by the change, and apply targeted fixes.

## High-level plan executed

1. Design a per-map `VisualizationManager` using deterministic signatures and in-flight promise join semantics.
2. Implement `VisualizationManager` with TTL and cleanup to avoid stuck promises / Jest open handles.
3. Instrument callers to use `applyAnalysisEngineVisualization(map, layerSpec, options)` and pass `callerId` where appropriate.
4. Run full Jest suite, triage failures, and apply fixes to processors/postprocess code where tests exposed mismatches.
5. Add unit tests for the `VisualizationManager` and dataset-specific heuristics (last-numeric-field detection).

## Summary of root cause and fix

- Root cause: multiple callers were creating the same visualization concurrently; each caller created a separate `FeatureLayer` object, yielding duplicate layers.
- Fix: Implement a per-map `VisualizationManager` that computes a deterministic signature for a visualization request (renderer field, target variable, record count, sample IDs, etc.). When a request is in-flight, other callers join the same promise rather than creating a new layer. A TTL (default 15s) and explicit cleanup ensure no stuck promise or timer remains.

Key implementation file:

- `lib/analysis/utils/apply-analysis-visualization.ts` — contains `attachVisualizationManager(map)`, `computeSignature(...)`, `waitForLayer(signature, timeoutMs)`, `forceReplaceLayer(...)`, and TTL/cleanup logic.

Documentation created/updated:

- `docs/IMPLEMENTATION/VisualizationManager.md` — design and usage guidance (callers should pass `options.callerId` into `applyAnalysisEngineVisualization`).

## Tests added/updated

- Unit tests for `VisualizationManager`:
  - `lib/analysis/__tests__/VisualizationManager.helpers.test.ts` (helpers + signature determinism)
  - `lib/analysis/__tests__/VisualizationManager.cleanup.test.ts` (TTL/cleanup semantics)

- Postprocess tests:
  - `lib/analysis/postprocess/__tests__/lastNumericFieldDetection.test.ts` (verifies last-numeric-field heuristic used by `topStrategicMarkets`)

- Processor tests updated/validated (Strategic, Competitive, Demographic, Correlation, Comparative, etc.).

## Notable code changes (delta)

- Visualization dedupe
  - `lib/analysis/utils/apply-analysis-visualization.ts` — VisualizationManager implementation; in-flight promise map keyed by deterministic signature.

- Field mapping and processor robustness
  - `lib/analysis/strategies/processors/HardcodedFieldDefs.ts` — mapping of analysis types -> primary (legacy) score field names (e.g., `competitive_score`, `demographic_score`) to preserve deterministic behavior and test expectations.
  - `lib/analysis/strategies/processors/CompetitiveDataProcessor.ts` — prefer hardcoded primary field when present in incoming data; canonical fallback only when primary absent; renderer uses the resolved field.
  - `lib/analysis/strategies/processors/DemographicDataProcessor.ts` — same preference/fallback rule as Competitive.
  - `lib/analysis/strategies/processors/ComparativeAnalysisProcessor.ts` — broadened validation and improved brand metric extraction for `value_{CODE}_P` patterns.
  - `lib/analysis/strategies/processors/CorrelationAnalysisProcessor.ts` — relaxed validate() to accept legacy aliases or numeric fallback.
  - `lib/analysis/postprocess/topStrategicMarkets.ts` — added detection for last-numeric-field convention and prefer that for ranking/stats.

- Misc
  - Small fixes to `BrandNameResolver` usage (use `metricName` when appropriate).
  - Added defensive logging in processors for troubleshooting.

## Test runs and outcomes (representative)

- Ran full test suite: `npm test -- --runInBand`.
  - Iterative runs surfaced multiple regressions initially (field-name mismatches, processor validation strictness) after the first VisualizationManager implementation.
  - After targeted fixes, most tests pass. A small ordering/side-effect appeared in one full-run involving `HardcodedFieldAlignment` (two expectations flipped), which passed when run in isolation — likely an inter-test shared-state effect; investigation in progress.

### How to reproduce the standard test runs

- Full suite (local):

```bash
# from repo root (zsh)
npm test -- --runInBand
```

- Run a single failing suite in isolation (faster debugging):

```bash
npx jest lib/analysis/strategies/processors/__tests__/HardcodedFieldAlignment.e2e.test.ts -i -t "All processors use hardcoded primary fields correctly"
```

- Run a single focused test:

```bash
npx jest lib/analysis/strategies/processors/__tests__/CompetitiveAnalysis.e2e.test.ts -i -t "emits competitive_analysis_score as targetVariable and sorts descending"
```

## Observations during triage

- Tests exposed divergence between canonical (`*_analysis_score`, `*_insights_score`) and legacy (`*_score`) naming. Processors historically used legacy names; some newer expectations use canonical names.
- I adopted a conservative rule: prefer the hardcoded/legacy primary field when present in the incoming data; only use canonical `*_analysis_score` / `*_insights_score` if the hardcoded field is absent but canonical is present. This preserves deterministic behavior across datasets and tests while allowing modern canonical fields when needed.
- One intermittent failing full-run points to a shared-state/test-order problem; processors were made more defensive about deriving primary fields from local `rawData` where possible.




## Quality & safety notes

- Timers and in-flight promise cleanup are implemented and exercised by unit tests to avoid Jest open handles.

- Changes were kept minimal and localized to lower-risk areas (per-processor normalization and postprocess heuristics).

- Additional repository-wide instrumentation is recommended to ensure all callers pass `callerId` into visualization APIs.
- Timers and in-flight promise cleanup are implemented and exercised by unit tests to avoid Jest open handles.
- Changes were kept minimal and localized to lower-risk areas (per-processor normalization and postprocess heuristics).
- Additional repository-wide instrumentation is recommended to ensure all callers pass `callerId` into visualization APIs.

## Next steps / recommended follow-ups

- Run a deterministic test-order bisect to find the test(s) that affect `HardcodedFieldAlignment` only under the full suite. Approach:
  - Run group-bisect on test groups to find the previous test that causes state change.
  - Instrument or make processors' primary-field resolution purely local to the `process` invocation where possible.

- Repo sweep for caller instrumentation:
  - Search for all call sites of `applyAnalysisEngineVisualization` and ensure `options.callerId` is passed.

- CI: after local full-suite green, run CI with visualization integration tests enabled:

```bash
# in CI environment
RUN_VIS_INTEGRATION=1 npm test -- --runInBand
```

- Optional forensic git-bisect to find the commit that introduced the duplicate-layer race (requires a reproducible test that deterministically creates duplicate layers). I can run this if you want.




## Files to review (quick list)

- `lib/analysis/utils/apply-analysis-visualization.ts` (VisualizationManager)

- `docs/IMPLEMENTATION/VisualizationManager.md` (design + usage)

- `lib/analysis/strategies/processors/HardcodedFieldDefs.ts` (primary field mapping)

- `lib/analysis/strategies/processors/CompetitiveDataProcessor.ts` (field resolution + renderer)

- `lib/analysis/strategies/processors/DemographicDataProcessor.ts` (field resolution)

- `lib/analysis/postprocess/topStrategicMarkets.ts` (last numeric field heuristic)

- Tests:
  - `lib/analysis/__tests__/VisualizationManager.*`
  - `lib/analysis/postprocess/__tests__/lastNumericFieldDetection.test.ts`
  - `lib/analysis/strategies/processors/__tests__/*` (various)
- `lib/analysis/utils/apply-analysis-visualization.ts` (VisualizationManager)
- `docs/IMPLEMENTATION/VisualizationManager.md` (design + usage)
- `lib/analysis/strategies/processors/HardcodedFieldDefs.ts` (primary field mapping)
- `lib/analysis/strategies/processors/CompetitiveDataProcessor.ts` (field resolution + renderer)
- `lib/analysis/strategies/processors/DemographicDataProcessor.ts` (field resolution)
- `lib/analysis/postprocess/topStrategicMarkets.ts` (last numeric field heuristic)
- Tests:
  - `lib/analysis/__tests__/VisualizationManager.*`
  - `lib/analysis/postprocess/__tests__/lastNumericFieldDetection.test.ts`
  - `lib/analysis/strategies/processors/__tests__/*` (various)




## Quick completion summary

- Implemented a per-map `VisualizationManager` to dedupe concurrent visualizations, added TTL/cleanup, documented usage, and instrumented major callers.

- Ran the full test suite, iteratively fixed processor field-name mismatches and postprocess heuristics revealed by tests.

- Most tests are green; a small full-suite ordering/side-effect remains to be resolved (investigating). I recommend running a focused test-order bisect next.

If you'd like, I will now:

- Run the deterministic test-order bisect and fix the shared-state issue that flips `HardcodedFieldAlignment` only under the full-suite, or

- Perform a repo sweep to ensure all `applyAnalysisEngineVisualization(...)` call-sites pass `callerId`.

Pick one and I will proceed.
