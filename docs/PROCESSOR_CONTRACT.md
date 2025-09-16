# Processor Contract — how processors must behave and interact with project config

This file documents the minimal, testable contract every analysis processor must satisfy in this repo. The goal is to make processors data-driven by relying on `AnalysisConfigurationManager` project-type configuration and to remove hard-coded field names or brittle textual assertions.

Principles
- Consult project-type configuration first. The `AnalysisConfigurationManager` exposes `processorConfig` and `fieldMappings` per project type (for example `retail`, `real-estate`).
- Respect runtime `rawData.metadata` provided by upstream pipelines — client requests or orchestrators may include `metadata.variables` or `metadata.targetVariable` that override static config.
- Provide small, deterministic fallbacks. Processors must not throw when optional fields are missing; instead follow an ordered fallback chain.
- Emit structured outputs. Tests should assert structured data shapes (fields present, numeric ranges) instead of exact sentences.

Contract (short)
- Inputs
  - rawData: { features: Array<Record<string, any>>, metadata?: Record<string, any> }
  - Each feature is an object with flat properties (or nested as `properties.properties`) that may contain numeric fields, descriptive fields, and IDs.
- Processor identity
  - `static processorType?: string` — optional static identifier used to look up `processorConfig` (recommended)
  - If not present, the processor should derive its `processorType` from its filename/class name.
- Behavior
  1. Resolve runtime metadata: const metadata = rawData.metadata || {}
  2. Determine processorType and consult config:
     - const cfg = AnalysisConfigurationManager.getInstance();
     - const runtimeCfg = cfg.getProcessorSpecificConfig(processorType) || {}
  3. Resolve target variable(s) using ordered fallbacks (see below)
  4. Process features, use `cfg.extractPrimaryMetric(record)` as a safe numeric fallback for a record
  5. Return an object with at least:
     - type: processorType
     - targetVariable: resolved field name (string) or array of strings
     - processed: Array<{ id: string, name?: string, value: number, raw?: Record<string, any> }>
     - summary: short structured object and optionally a human-friendly text under `summary.text`

Fallback ordering for target variable resolution
1. metadata.variables (array provided in rawData.metadata.variables) — honor the client's explicit request
2. metadata.targetVariable (a single string requested by client)
3. runtimeCfg.targetVariable or runtimeCfg.variables from `getProcessorSpecificConfig(processorType)`
4. AnalysisConfigurationManager.getFieldMapping('primaryMetric') — first entry
5. Numeric-field heuristic — pick first numeric field from the feature record

Error modes and logging
- If no numeric field can be resolved for a record, skip the record and log a single structured warning with sample keys. Avoid throwing.
- Log the resolved `targetVariable` and the fallback reason for the first 1–3 records to aid debugging.

Testing guidance
- Unit tests (fast):
  - Create a small unit test that stubs `AnalysisConfigurationManager` with a simple context and asserts processors choose `runtimeCfg.targetVariable` when present.
  - Assert `processed` items follow the shape above and that `value` is numeric.
- Integration tests (fixture-driven):
  - Provide fixture data with features that include both the desired target field and fallback numeric fields. Validate aggregated ranges and counts.
- Move away from exact summary sentence matching. If consumers need human text, provide tokens in `summary.tokens` and have tests assert tokens or counts instead.

Example code snippet (to include at top of a processor)

```ts
const cfg = AnalysisConfigurationManager.getInstance();
const processorType = (this.constructor as any)?.processorType || 'comparative_analysis';
const runtimeCfg = cfg.getProcessorSpecificConfig(processorType) || {};
const metadata = rawData.metadata || {};
const target = metadata.variables?.length ? metadata.variables : metadata.targetVariable || runtimeCfg.targetVariable || cfg.getFieldMapping('primaryMetric')[0];
```

Migration checklist (recommended rollout)
- Add `processorConfig` entries to all `config/analysis-contexts/*` used in your deployments.
- Update one processor at a time to consult the manager and add unit tests verifying the behavior.
- Run focused Jest suites for processors you changed. Keep changes small and revertible.
- After all processors are migrated and tests updated, remove legacy compatibility fragments in code and `HardcodedFieldDefs.ts`.

Acceptance criteria for processor migration
- Each migrated processor has at least one unit test asserting it respects `getProcessorSpecificConfig(processorType)`.
- The full Jest suite passes (or failing tests are tracked with issues and targeted fixes).

Notes
- `AnalysisConfigurationManager` already provides helpful helpers such as `extractPrimaryMetric`, `extractGeographicId`, `extractDescriptiveName`, and `applyTemplate` — prefer those over ad-hoc implementations.
- Keep console logs structured and sparse; log only for the first few records or when fallback behavior occurs.

Last updated: 2025-09-13
