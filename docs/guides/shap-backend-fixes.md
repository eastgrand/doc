# SHAP Micro-service Backend Fixes

Collection of critical patches applied to the Python micro-service that powers the statistical pass.

## 1. NaN JSON Serialization (Jan 2025) ✅
**Problem** – pandas produced `NaN` which is invalid JSON, causing `SyntaxError: Unexpected token 'N'` in the browser.

### Solution
* Introduced `safe_float()` – converts `NaN` → `None` before `float()` casting.
* Added `safe_jsonify()` wrapper for every Flask endpoint.
* Updated feature & SHAP array generation to use the safe helper.

Result: micro-service now returns `null` for missing values and the UI parses successfully.

---

## 2. Query-Aware Feature Limiting / Mis-classification
**Problem** – Ranking heuristics applied a 25-feature cap to *all* query types due to mis-classification; correlation queries received truncated data.

### Fixes
1. Refined ranking regex (see `query_classifier.py`).  
2. In `enhanced_analysis_worker.py`, `get_query_aware_top_areas()` now checks `query_type == 'ranking'` before slicing.

Outcome: correlation & hotspot queries now process full datasets; ranking queries still limited for performance.

---

## 3. End-to-End Pipeline Hardening
* Added deep concept-mapping + query analysis on client before hitting `/analyze`, ensuring micro-service receives precise `targetVariable`, etc.
* Eliminated "No features found after AI analysis" error.

---

## Where to Look
| File | Purpose |
|------|---------|
| `shap-microservice/enhanced_analysis_worker.py` | safe_float, ranking limit fix |
| `shap-microservice/query_classifier.py`        | refined regex patterns |
| `app/api/claude/generate-response/route.ts`    | two-pass orchestration |

For full historical narrative see `docs/legacy/main-reference.md`. 