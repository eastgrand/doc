# End-to-End Query → Visualization Hardening Plan

_Last updated: 2025-06-13_

This document is a living blueprint for eliminating hard-coded assumptions and guaranteeing that the front-end and the SHAP microservice stay perfectly in sync.

---

## 0. Quick Audit (gatekeeper)
* Recursively scan both repos for residual hard-coded layer IDs, column names, geographic filters, or SQL snippets.  Fail CI if any are found.

## 1. Front-End – Request Formation
1. Ensure `concept-mapping.ts` and `query-analyzer.ts` always output a payload of the exact shape:
   ```ts
   interface AnalysisRequest {
     targetVariable: string;   // canonical snake_case
     metrics: string[];        // ≥1 canonical fields
     analysisType: 'jointHigh' | 'correlation' | 'ranking' | 'distribution' | 'trends';
     filters?: string;         // SQL or Feature-Layer where clause
   }
   ```
2. On app start, fetch `/schema` (see step 3) from the microservice and store the column list in React context for validation & autocomplete.

## 2. API Contract Hardening
* Publish a single source-of-truth JSON schema (`openapi.yaml` or TypeBox) for `/analyze` requests and responses.
* Front-end validates before POST; back-end validates on receive.

## 3. Microservice – Dynamic Schema Layer
1. On startup, load the cleaned CSV once and derive `available_columns: Set[str]`.
2. Expose `GET /schema` that returns that set as JSON.
3. In every analysis route: intersect requested columns with `available_columns`; if any are missing → `success:false` with a helpful message (no silent fallbacks).

## 4. Microservice – Pure Data-Driven Analysis ✔️ _done_
* Analysis logic no longer references `FREQUENCY`, `CONVERSION_RATE`, or any baked-in column names.
* `calculate_feature_importance()` and summary generation work for whatever `target_variable`/metrics arrive in the request.
* Thresholds (e.g. 75-percentile in joint-high) are computed dynamically from the live data.

## 5. End-to-End Golden-Query Tests ✔️ _done_
* `golden-queries.json` (repo root) stores a minimal regression suite.
* `tests/test_golden_queries.py` runs each query through `analysis_worker` and asserts success + non-empty results.
* Ready to be invoked by CI (`pytest -q`).

## 6. Observability & Traceability
* Front-end generates a `X-Request-ID` UUID; microservice echoes it.
* Structured JSON logs: `{id, query, metrics, rowCount, durationMs}`.

## 7. Deployment Safety Nets
1. GitHub Actions workflow:
   * Lint + unit tests on both repos.
   * Build Docker images; run golden-query suite.
   * Push to Render only if all green.
2. Render health checks hit `/ping` and `/schema`.

---

### Workflow for Updates
1. Propose a change → update this file with the intended edit (PR review will fail if the plan isn't updated).
2. Implement the change in code.
3. Ensure CI passes (including golden-query tests).
4. Deploy.

---

_This plan replaces ad-hoc patches with a transparent, repeatable process.  Keep it current!_

### 🔄  Changing / Updating the Dataset

1. **Replace CSV**  
   – Drop the new file into `shap-microservice/data/` as `nesto_merge_0.csv` (or update the path in `TRAINING_DATASET_PATH`).  
   – If you regenerate a cleaned version, name it `cleaned_data.csv` (preferred) so the microservice picks it up first.

2. **Re-run locally**  
   – Start the microservice once; it will load the new file, rebuild `AVAILABLE_COLUMNS`, and expose them via `/schema`.

3. **Front-end sync**  
   – The UI fetches `/schema` on boot; simply reload the browser to pull the new column list.  No code changes unless you need new alias mappings in `concept-mapping.ts`.

4. **Golden queries maintenance**  
   – If column names changed, update `golden-queries.json` accordingly.  
   – Run `pytest`; ensure all tests still pass or adjust expectations.

5. **CI/CD**  
   – Commit the updated CSV + any query fixes.  The GitHub Action will run the golden suite; deployment proceeds only if it stays green. 