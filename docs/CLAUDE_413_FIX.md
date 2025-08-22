# Claude 413 Request Entity Too Large — Mitigation Plan

Goals:
- Eliminate 413 errors by sending compact, structured payloads to the Claude API.
- Preserve analysis fidelity by summarizing client-side and enriching server prompts.
- Keep clustering and visualization pipelines unchanged.

Checklist:
1) Client-side compact summary
   - Build a browser-safe summarizer that computes: stats, histogram, top/bottom exemplars, and a small sample of properties.
   - Create a payload builder to prefer { summary, featureShadows } and avoid raw features.
   - Wire chat-service to use the payload builder.

2) API guardrails
   - Log payload meta: size, hasSummary, featureDataType, layer counts.
   - Early reject oversized raw feature arrays (>5k features) with 413 and hint.
   - Accept client summaries and convert to synthetic processed layers; skip blob path.

3) Prompt continuity
   - Ensure server still produces consistent analysis using summary exemplars and stats.
   - Maintain persona routing and ranking instructions.

4) Validation
   - Manual: Send typical queries; ensure no 413 responses and that analysis references correct score types.
   - Size sanity: console logs show payload meta and approxBodySize < previous raw requests.

Acceptance criteria:
- No 413 responses on standard queries with real datasets.
- Payloads contain summary and featureShadows; no large feature arrays are sent.
- Claude answers include location exemplars and correct metric naming per persona.
- Clustering flow remains unchanged; rendering and legend unaffected.

Notes:
- If needed, adjust the raw-feature threshold or increase exemplar counts; keep payload < 200KB for safety.
# Claude 413 Fix & Summarization Checklist

Goal: Stop 413 errors by sending compact, high-signal summaries to the Claude API while preserving analysis fidelity. Keep map rendering and clustering unchanged.

Findings (from logs):
- Map renders 984 ZIP polygons with class-breaks legend successfully.
- Chat POST to /api/claude/generate-response returns 413 (FUNCTION_PAYLOAD_TOO_LARGE).
- No geometry in query → statewide dataset → large payloads.
- Semantic router ONNX error is unrelated; fallback to keywords works.

Principle:
- Keep full dataset in-browser for visualization.
- Send only compact summaries to API (stats + exemplars + legend).

---

## 1) Client Payload Slimming (Required)

Stop sending raw features/geometry to API. Send a compact summary:

- Context:
  - query, persona, endpoint (e.g., "/strategic-analysis"), targetVariable, layerTitle
- Core stats for targetVariable:
  - count, min, max, mean, median, stdev
  - quantiles: q10, q25, q50, q75, q90
  - histogram: binEdges + binCounts (10–20 bins)
- Ranks and exemplars:
  - top (≤10): { id, name, value }
  - bottom (≤5): { id, name, value }
  - outliers (≤10): { id, name, value, z }
- Geographic coverage:
  - level ("zip"), totalRegions, uniqueStates, sample of city/county names
- Renderer/legend:
  - title, breaks [{min,max,label}], ramp name (e.g., "green-diverging-4")
- Optional SHAP:
  - features: [{feature, importance}] (≤10)

Guardrail:
- If features.length ≥ 200 or estimated body > 200KB → force summary mode.
- Log: [ChatService] Sending compact summary (features=984, bytes≈1.2KB).

---

## 2) Browser-Safe Summarizer (Required)

Add ClientSummarizer.ts (no Node-only deps):
- Compute mean, stdev, quantiles (quickselect is fine), histogram (12 bins or FD rule).
- Select topN/bottomN and compute z-scores.
- Read legend breaks already produced by processor.
- Use the same targetVariable used by the renderer.

Compatibility:
- No changes to the cluster function; clustering keeps using full in-browser data.

---

## 3) API Route Safeguards (Recommended)

- Assume compact input; reject raw features > 100 items with 400.
- Log: [Claude API] Compact summary received: statsOnly=true, bytes=1.1KB.
- Optional (safety net only): increase limit
  export const config = { api: { bodyParser: { sizeLimit: "2mb" } } }

---

## 4) “Analyze Entire Dataset” Without Sending All Rows

Provide Claude:
- Full stats block + histogram + quantile cutoffs.
- Ranks: top 10 and bottom 5 exemplars.
- Outliers: IQR or |z| > 2, up to 10 exemplars.
- Legend breaks and class semantics (e.g., “Class 4 = 28.3–34.15”).
- Geographic coverage summary (“All FL ZIPs”).

Prompt guidance:
- “Ground statements in provided statistics and exemplars. Do not invent per-ZIP values not listed.”

---

## 5) Clustering Compatibility (As-Is)

- Rendering: unchanged; clusters continue operating on full data in-browser.
- Optional: When clusters are toggled, include cluster summaries in payload:
  - clusterCount, avg value per cluster, top cluster exemplars (name + avg), total members.
  - Use centroids/labels only; do not send member lists.

---

## 6) Optional Cleanups

- Semantic router: use onnxruntime-web in browser or keep keyword fallback.
- Geo defaults: if no geography in query, default to project scope to reduce volume.
- Legend: ensure breaks/colors in summary match renderer output exactly.

---

## 7) Logging & Telemetry

Client:
- Before POST: log summary mode and byte length.
- After POST: log response time and token usage (if available).

Server:
- Log payload size, validation result, summary vs raw.

Avoid PII in logs.

---

## 8) Test Plan

Functional:
- Small dataset (<200): still send summary, no 413.
- Large dataset (~1000): summary sent, no 413, narrative generated.

Fidelity:
- Narrative references stats/quantiles/top entries correctly.
- No fabricated per-ZIP numbers.

Resilience:
- Missing legend/SHAP: prompt degrades gracefully.

Size:
- Assert request body < 100KB in large cases.

---

## 9) Rollout Steps

- Implement ClientSummarizer.ts; switch ChatService payload builder to summary.
- Add API validation to reject large raw arrays.
- Add logs above.
- Deploy and verify:
  - No 413s.
  - Server logs confirm summary path.
  - Narrative grounded in stats/ranks/outliers.
  - Cluster behavior unchanged.

---

## 10) Quick References

Outliers:
- z = (x - mean)/stdev; pick |z| > 2; cap 10.
- IQR: fences = Q1 - 1.5*IQR, Q3 + 1.5*IQR.

Histogram:
- 12 fixed bins or Freedman–Diaconis (2*IQR*n^(-1/3)).

Acceptance:
- 0 occurrences of 413.
- Payloads < 100KB (large datasets).
- Narratives reflect dataset-level stats/exemplars.
- Cluster function unchanged.