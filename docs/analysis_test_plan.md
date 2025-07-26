# Comprehensive Test Plan – Additional Analysis Types

> **Purpose**  
> Provide a fast, repeatable, **code-driven** checklist for validating that all other analysis / visualization modes work after the micro-service redeploy.  Each test can be executed locally (no browser refresh / map reset) via small Node scripts similar to `test_correlation_debug.js`.

---

## 0. Pre-Requisites

1. **Micro-service updated & redeployed** (the correlation fix must be live).
2. **Local workspace synced** (`git pull` on both repos).
3. **Environment variables** – `API_BASE_URL`, optional `X-API-KEY` exported.
4. **ArcGIS layer cache** loaded (script `scripts/cache-fsa-layer.js` exists).

---

## 1. Distribution / Choropleth

| Item | Details |
|------|---------|
| **Sample queries** | • *“Show athletic shoe purchase patterns by geographic region”*<br/>• *“Map athletic shoe brand preferences across different ZIP codes”* |
| **Expected `analysis_type`** | `distribution` *(legacy)* or `choropleth` *(new)* |
| **Expected visualization** | Choropleth layer using `rendererField = thematic_value` |
| **Key JSON fields** | `results[].value`, `results[].thematic_value`, optional brand codes |
| **Test script** | `test_distribution_debug.js` (to be created) |
| **Pass criteria** | 1. ≥ 90 % of features have non-null `thematic_value`  
2. Factory picks `choropleth` visualization  
3. Legend shows 5-class color ramp |

### Test Steps (pseudo-code)
```js
const query = "Show athletic shoe purchase patterns by geographic region";
// 1. POST to micro-service → confirm analysis_type
// 2. Merge geo features → confirm >90 % coverage
// 3. Feed to VisualizationFactory → check layer.type === 'choropleth'
```

---

## 2. Filtering / Spatial Query

| Item | Details |
|------|---------|
| **Sample queries** | • *“Find high-performing Nike markets in high-income areas”*<br/>• *“Find areas where premium athletic shoes outperform budget options”* |
| **Expected `analysis_type`** | `filtering` or `spatial_query` |
| **Expected visualization** | Highlighted subset layer (boolean filter) |
| **Key JSON fields** | `results[].is_match` _(boolean)_ plus metric fields |
| **Test script** | `test_spatial_filter_debug.js` |
| **Pass criteria** | 1. At least one feature returns `is_match = true`  
2. VisualizationFactory chooses `point-layer` **or** `single-layer` with filter  
3. Legend title contains *“Filtered Results”* |

---

## 3. Threshold Analysis

| Item | Details |
|------|---------|
| **Sample query** | *“Analyze income thresholds for premium athletic shoe purchases”* |
| **Expected `analysis_type`** | `threshold_analysis` |
| **Expected visualization** | Bivariate or stepped choropleth (≥ &lt; colors) |
| **Key JSON fields** | `threshold_value`, `above_threshold` (boolean) |
| **Test script** | `test_threshold_debug.js` |
| **Pass criteria** | 1. Response includes `threshold_value`  
2. ≥ 2 classes rendered (above / below)  
3. Tooltip displays threshold info |

---

## 4. Market / Trend Analysis

| Item | Details |
|------|---------|
| **Sample queries** | • *“Identify emerging markets for premium athletic footwear”*<br/>• *“Identify markets with potential for premium athletic brand expansion”* |
| **Expected `analysis_type`** | `trend_analysis` or `market_insight` |
| **Expected visualization** | Trend arrows / line chart overlay (time-series) |
| **Key JSON fields** | `trend_score`, `growth_rate`, `time_series[]` |
| **Test script** | `test_trend_debug.js` |
| **Pass criteria** | 1. Trend direction (`growth_rate`) computed  
2. VisualizationFactory picks `trends` or `trends-correlation`  
3. Legend shows rising / falling icons |

---

## 5. Automation Plan

1. **Create Node debug scripts** (one per table entry) in `mpiq-config/test/` following the structure of `test_correlation_debug.js`.
2. **Add `npm run test-analysis`** script that executes all debug scripts sequentially and prints ✅ / ❌.
3. **CI hook** – GitHub Action runs the suite on each PR touching:
   - `enhanced_analysis_worker.py`
   - `VisualizationFactory`
   - `geospatial-chat-interface.tsx`

---

## 6. Roll-out Checklist

- [ ] Merge micro-service fix → deploy to Render
- [ ] Run `npm run test-analysis` locally → all green
- [ ] Smoke test in browser (one query per type)
- [ ] Tag release `vX.Y-correlation-fix`

---

*Document generated: {{date}}*
