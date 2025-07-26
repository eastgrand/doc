# Field Mapping Overview

This document outlines where field‐name mappings occur in the codebase, why they exist, and several ideas for simplifying the architecture.

---

## 1  Current Mapping Locations

| # | File / Module | Purpose | Example |
|---|------------------------------|---------------------------------------------------------|-------------------------------------------|
| 1 | `utils/field-aliases.ts` | Front-end map from human-readable names → dataset codes | `"2024 bought nike athletic shoes last 12 mo" → "MP30034A_B"` |
| 2 | `shap-microservice/enhanced_analysis_worker.py` | Back-end map from dataset codes → physical column names in precalculated data | `"MP30034A_B" → "value_MP30034A_B"` |
| 3a | `components/geospatial-chat-interface.tsx` — *target variable mapping* | Converts `analysisResult.targetVariable` to snake-case or alias | `const snakeTarget = FIELD_ALIASES[ tv ] || toSnake(tv)` |
| 3b | `components/geospatial-chat-interface.tsx` — *data harmonization* | Picks renderer metric & mirrors to multiple field names | `record[snakeTarget] = record.value` |
| 3c | `components/geospatial-chat-interface.tsx` — *geographic ID mapping* | Normalises ZIP / ID values for look-ups | `ZIP_CODE` / `ID` → 5-digit upper-case key |
| 4 | `lib/build-microservice-request.ts` | Translates analysis results into microservice request payload | Injects alias / snake-case field names |
| 5 | `TARGET_OPTIONS` constant (same TSX file) | UI list that couples human labels to dataset codes | `{ label: "Nike", value: "MP30034A_B" }` |

---

## 2  Why These Mappings Exist

1. **Schema Inconsistency** – Human labels, front-end codes, back-end column names, and database columns all differ.
2. **Legacy Data Sources** – Historical projects used different naming schemes (e.g. conversion rate, FSAs).
3. **User Experience** – Allows natural-language queries while keeping internal names opaque.
4. **API Compatibility** – Front-end & microservice expose different field conventions.

---

## 3  Ideas to Simplify / Consolidate

### Option 1 – Centralised Field Registry
* Single JSON / TS file acts as source-of-truth.
* Record includes: humanLabel, frontendCode, backendColumn, dataType, category.
* Both front-end and microservice import the same registry.

### Option 2 – Runtime Field Discovery
* Query dataset schema at startup.
* Auto-generate `value_` prefixes or snake-case variants.
* Falls back to hard-coded overrides only for edge cases.

### Option 3 – Unified Naming Convention
* Standardise on **one** field name across storage, API, and UI.
* Removes majority of mapping logic but requires coordinated refactor.

### Option 4 – Smart Field Resolver Class
* Pattern-matching & fuzzy search to resolve unknown fields.
* Returns best match plus confidence score.

---

## 4  Recommended Path

| Phase | Scope | Impact | Risk |
|-------|-------|--------|------|
| **Immediate** | Consolidate the two alias dictionaries into a shared `field-mappings.json`. Both front-end & back-end import it. | Low dev time, removes duplication. | Very Low |
| **Mid-Term** | Implement central registry + runtime discovery for new fields. | 60-70 % fewer hard-coded entries. | Moderate |
| **Long-Term** | Migrate all systems to unified naming + smart resolver. | Simplest mental model; least long-term maintenance. | High (cross-team coordination) |

---

*Last updated:* {{DATE}} 