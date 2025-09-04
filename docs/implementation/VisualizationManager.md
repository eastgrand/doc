# VisualizationManager — Implementation & Status

Status: Implemented and hardened; documentation and test-teardown added.

Purpose

- Prevent duplicate analysis FeatureLayer creation caused by concurrent calls to `applyAnalysisEngineVisualization`.
- Provide stable, per-Map deduplication and a small, testable API for callers.

High-level design

- Per-Map manager stored on the Map instance at `map.__visualizationManager`.
- Deterministic signature (renderer field/type, targetVariable, recordCount, sample ids) identifies equivalent visualizations.
- In-flight promise joining: concurrent identical requests await the same creation promise and receive the same `FeatureLayer`.
- TTL for in-flight joins: default 15,000 ms (overrideable via `options.inflightTTLMs`).
- Manager exposes light helper methods and a `cleanup()` used by tests and map lifecycle hooks.

Files changed / primary artifacts

- `utils/apply-analysis-visualization.ts` — core VisualizationManager logic and the `applyAnalysisEngineVisualization` entrypoint (dedupe, in-flight promise join, TTL, cleanup wiring).
- `lib/analysis/strategies/processors/*` — small compatibility fixes to prefer legacy primary score fields when present; avoids regressing callers/tests.
- `lib/analysis/postprocess/topStrategicMarkets.ts` — last-numeric-field heuristic used when canonical score fields are missing.
- `test/jest-teardown.js` — Jest afterEach teardown that clears map-level manager state and timers between tests.
- `jest.config.js` — wired `setupFilesAfterEnv` to include the teardown helper.
- `tools/test-order-bisect.js` and `tools/jest_tests.json` — investigation tooling used during flakiness diagnosis.
- `docs/IMPLEMENTATION/VisualizationManager.md` — this file (updated).

Quick status checklist

- [x] Deduplication via per-map `VisualizationManager` implemented.
- [x] Default in-flight TTL = 15,000 ms; per-call override available via `options.inflightTTLMs`.
- [x] Map lifecycle cleanup and `cleanup()` implemented; teardown helper added for Jest tests.
- [x] Unit tests for manager join semantics and TTL behavior added.
- [x] Integration-style smoke tests and caller updates for `callerId` applied to major callers.
- [x] Documentation created and updated (this file).
- [ ] Finish repo-wide sweep to ensure all callers pass `callerId` (low-risk follow-up).
- [ ] Optional: add telemetry/tracing for manager resolve/reject events.

How to validate locally

1. Run unit tests (fast):

```bash
npm test -- -t VisualizationManager
```

2. Run the full Jest suite (with teardown) to confirm no open-handle/test-order leaks:

```bash
npm test -- --runInBand
```

3. If you want to re-run the integration smoke (gated in CI), set:

```bash
export RUN_VIS_INTEGRATION=1
# then run the workflow or CI job that exercises integration-visualization
```

Notes on intermittent test flake and mitigation

- An ordering-dependent intermittent failure (seen previously in `HardcodedFieldAlignment` tests) was investigated with a sequential predecessor scan and a group bisect helper (`tools/test-order-bisect.js`).
- A pragmatic mitigation was applied: `test/jest-teardown.js` clears `map.__visualizationManager`, cancels any `__inFlightTimer`, and calls `cleanup()` where available. This reduces shared-state leakage between Jest tests.
- If the intermittent flake reappears, capture the failing run immediately and re-run the bisect tooling; a deterministic failing run is required to pinpoint the introducing commit.

Requirements coverage (mapping to original requests)

- Implement central VisualizationManager to prevent duplicate layers: Done (see `utils/apply-analysis-visualization.ts`).
- Provide deterministic signature + in-flight join: Done (default TTL 15s; overrideable).
- Ensure no Jest open-handle warnings from timers: Done (teardown clears timers and the manager exposes `cleanup()`).
- Document design, changes, and testing: Done (this file + `docs/IMPLEMENTATION/VisualizationManager_Testing_and_Fixes.md` where longer notes live).

Next steps

- Small repo sweep to add `callerId` to any remaining callers (quick grep then small PR). Status: mostly done; remaining items are low risk.
- If you want a full forensic git-bisect to find when the race/regression first appeared, provide a deterministic failing run (the bisect requires reproducibility).

Completion summary

This document was updated to reflect the implemented `VisualizationManager`, the TTL and cleanup semantics, affected files, tests added, and validation steps to run locally. I also confirmed the Jest teardown was added to reduce test-order leakage.

Owner: frontend team
