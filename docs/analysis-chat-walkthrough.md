## End-to-End Walk-Through: Analysis + Chat

Scenario used in this guide:

1. **Initial analysis query**  
   `Compare Nike vs Adidas athletic shoe purchases across regions`
2. **Follow-up chat question**  
   `Do Nike and Adidas have different top drivers for sales? Compare the top 5 drivers between brands.`

---
### 1  Front-end (Next JS) – query entry → concept → analysis plan
| Step | File/Module | What Happens |
| --- | --- | --- |
| a | `components/geospatial-chat-interface.tsx` | User types the query. |
| b | `lib/concept-mapping.ts` → `conceptMapping()` | N-gram matching against `utils/field-aliases.ts` resolves to canonical dataset codes:<br>  • `MP30034A_B_P` – Nike %<br>  • `MP30029A_B_P` – Adidas % |
| c | `lib/query-analyzer.ts` → `analyzeQuery()` | Classifies intent → `queryType = correlation`.<br>Adds both codes to `relevantFields`. |
| d | `lib/build-microservice-request.ts` | Wraps the plan + query + persona into JSON for the Python SHAP micro-service. |

---
### 2  Next.js API proxy → Python SHAP micro-service
| Step | Layer | Details |
| --- | --- | --- |
| e | `/api/analyze-proxy` | Forwards JSON to the FastAPI container. |
| f-1 | Data slice | Reads master parquet, keeps brand % columns + ~150 predictors. |
| f-2 | Descriptive stats | Pearson *r*, Spearman ρ, divergence score per region. |
| f-3 | Modelling | Two XGBoost regressors (one per brand). |
| f-4 | SHAP | Calculates SHAP, aggregates `mean(|value|)` per feature. |
| f-5 | Payload | Returns `results[]`, `feature_importance{}`, `model_info` (see sample in main answer). |

---
### 3  Front-end – merge, map, visualise
| Step | What Happens |
| --- | --- |
| g | Load FSA polygons from ArcGIS. |
| h | Join micro-service rows → polygon features. |
| i | `VisualizationFactory` selects correlation-scatter template. |
| j | Layer + legend rendered on the map. |

---
### 4  Narrative generation (assistant reply #1)
| Step | Layer | Details |
| --- | --- | --- |
| k | Prompt build | Simplified feature table + complete SHAP lists are embedded. |
| l | `/api/claude/generate-response` | Sends prompt + data to Claude. |
| m | Claude reply | Streams narrative back; conversation context is updated. |

---
### 5  Follow-up chat turn (LLM-only)
| Step | Layer | Details |
| --- | --- | --- |
| n | User asks follow-up. |
| o | `sendChatMessage()` | No micro-service call.<br>Packages current features **and** SHAP arrays. |
| p | Prompt scaffold | Field-alias map + SHAP arrays + context summary. |
| q | Claude reasoning | Sorts SHAP, compares top 5 per brand, crafts answer. |
| r | Assistant reply streamed to UI. |

---
### 6  Maths performed
* Correlation (Pearson, Spearman) on the two % columns.
* Two XGBoost regressors (100 trees, depth 5, lr 0.05).
* SHAP value matrix → `mean(|shap|)` importance list.
* **No new modelling** during follow-up chat – purely LLM reasoning.

---
### 7  Key files to explore
```
components/geospatial-chat-interface.tsx   // micro-service call + prompt build
app/api/claude/generate-response/route.ts  // Claude prompt + data marshalling
shap-microservice/query_processing/…       // Python stats & SHAP pipeline
```

---
### 8  Take-aways
* First query triggers the heavy compute (models + SHAP).
* Subsequent chat turns reuse cached SHAP + features – zero extra micro-service cost.
* Asking about "drivers" leverages the SHAP importance lists already in memory.
* A fresh micro-service run only occurs if new fields/layers are requested. 