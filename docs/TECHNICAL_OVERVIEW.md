# Technical Summary

## Stack & Infrastructure
* **Frontend**: Next.js 14 (React, App-Router)
* **Mapping**: ArcGIS JS 4.x for map and layer rendering
* **Backend**: Node/Edge API routes (TypeScript) + Python SHAP/XGBoost micro-service
* **Data Stores**: Redis (cache), Postgres (config), Vercel Blob / S3 (feature blobs)
* **CI / Tests**: Jest + ts-jest with ArcGIS mocks; target ≥ 85 % coverage

## AI Personas System
* Prompt modules live in `app/api/claude/prompts/`
* `personaRegistry` + `getPersona()` load persona config at runtime; default is **strategist**
* `/api/claude/generate-response` injects persona-specific `systemPrompt`
* Unit & integration tests mock Anthropic SDK to validate prompt selection

## Two-Pass Query → Visualization Pipeline
| Pass | Engine | Key Actions |
|------|--------|------------|
| **1 Statistical** | SHAP micro-service | Filters data, computes SHAP, returns features + terse summary |
| **2 Narrative** | Claude route | Converts same features into streamed prose (persona voice) |

`DynamicVisualizationFactory` then styles and renders the returned features; `VisualizationTypeIndicator` reflects the chosen viz type.

## Testing & Observability
* **Classifier Suite**: Jest tests iterate over `ANALYSIS_CATEGORIES` to ensure correct `queryType` and confidence.
* **Smoke Tests**: `scripts/smoke-test-personas.ts` posts a sample query for every persona after deployment.
* **Anthropic Mock**: `__mocks__/@anthropic-ai/sdk.ts` captures SDK calls offline.

## Critical Backend Fixes
* **NaN JSON**: `safe_float` + `safe_jsonify` convert invalid `NaN` to `null`.
* **Ranking Limit**: Feature cap now applied only to ranking queries.
* **Concept Mapping**: Deep client-side mapping prevents "no features found" errors.

## Repositories / Key Paths
* `components/` – React UI, map, chat
* `app/api/claude/` – AI routes & persona prompts
* `lib/` – Query classifier, visualization factory
* `shap-microservice/` – Python analysis service

---
_Last updated: 2025-06-21_ 