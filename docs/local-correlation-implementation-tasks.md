# Local Correlation Implementation – Task Checklist

## ⚠️ DEPRECATED - December 2024

**This implementation is no longer needed.** The correlation visualization has been replaced with BIVARIATE visualization that uses the existing 3x3 color matrix approach, eliminating the need for microservice-based local correlation analysis.

**See:** [Query Classification Updates Dec 2024](query-classification-updates-dec-2024.md)

---

> Tracks all work required to replace the existing “Correlation” map with a true local correlation (Bivariate LISA) implementation using the existing Python micro-service.

## Phase 1 – Front-end Wiring (Next.js)

- [ ] **Factory Fetch** – In `DynamicVisualizationFactory` `CORRELATION` case, call `/api/ml-analytics/local_corr`, pass layer IDs & field names, forward GeoJSON to the viz class.  
  _File:_ `lib/DynamicVisualizationFactory.ts`
- [ ] **CorrelationVisualization Refactor**  
  _File:_ `utils/visualizations/correlation-visualization.ts`
  - [ ] Remove current `norm1 – norm2` scoring logic.  
  - [ ] Read `local_I`, `p_value`, `cluster` attributes.  
  - [ ] Diverging blue⇽grey⇾red renderer; opacity 0.3 when `p_value > 0.05`.  
  - [ ] Popup template shows local I, p-value, cluster label.
- [ ] **Legend Builder** – Update `getLegendInfo()` to reflect new breaks & significance note.

## Phase 2 – Python Micro-service (XGBoost/SHAP container)

- [ ] **Route** – Add `POST /local_corr` endpoint.  
  - Reads GeoJSON + `field_x`, `field_y`, optional `k`.  
  - Computes Bivariate Moran Local (PySAL, 999 perms).  
  - Returns GeoJSON with `local_I`, `p_value`, `cluster`.
- [ ] **Dependencies** – Add `esda` and `libpysal` to `requirements.txt`.
- [ ] **Unit Tests** – Simple pytest verifying HH / LL clusters on synthetic grid.
- [ ] **Deploy** – Build & redeploy container on Render.

## Phase 3 – API Proxy & Config

- [ ] **Proxy Route** – Add `/api/ml-analytics/local_corr` branch in `pages/api/ml-analytics.ts` (mirrors existing proxy logic).
- [ ] **Environment** – Ensure base URL & API key already apply to new route (no new env vars needed).

## Phase 4 – QA & Documentation

- [ ] **Cypress Test** – Query “income vs Nike purchases” – expect attributes `local_I`, legend title “Local Correlation”.
- [ ] **Prompt Tweak** – In `app/api/claude/analyze-query/route.ts` clarify that correlation queries yield a **local correlation map**.
- [ ] **Docs** – Update `docs/visualization-guide.md` with plain-English description of local correlation, interpretation of cluster types.

---
_Last updated: <!-- keep placeholder for script updates -->_ 