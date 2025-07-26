# Understanding Visualization vs. SHAP Explanations

> **Context:** In our geospatial-analytics UI every natural-language question triggers **two parallel processes**:
>
> 1. A **visualization track** (map, bar chart, scatter plot …)
> 2. A **SHAP-explanation track** (model prediction + per-feature attributions)
>
> Grasping how they interact is essential for interpreting results and debugging strange behaviour.

---

## 1  The Two Parallel Tracks

|                             | Visualization track | SHAP-explanation track |
|-----------------------------|---------------------|------------------------|
| **Purpose**                | Show patterns/relationships the user asked for (choropleth, ranking, correlation, etc.) | Explain *why* a **single** numeric metric (the *target variable*) is high or low in each geography |
| **Number of variables**    | One or more (often 2 for correlations) | Exactly **one** (`target_variable`) |
| **Executed**               | Client-side (browser) | Server-side (XGBoost model + SHAP) |
| **Data source**            | Raw columns fetched from API | Model predictions on the same dataset |
| **Output**                 | Styled map / chart | SHAP bar chart & tables per polygon |

---

## 2  How a Query Flows Through the System

1. **User asks a question** → e.g. "Find high-performing Nike markets in high-income areas".
2. **`query-analyzer.ts`** parses text, identifies:
   * intent (`topN`, `correlation`, …)
   * list of mentioned field keywords
   * **target_variable** (one field name)
3. **Front-end request** to microservice includes `target_variable` and optional `demographic_filters`.
4. **Microservice** predicts that target field, returns predictions + SHAP values.
5. **UI** simultaneously computes the requested visualization using any additional variables mentioned in the query.

---

## 3  Example Scenarios

### A. Nike-centric Query

*Query:* "Show top 10 ZIPs where Nike performs best among high-income households".

Track behaviour:

* **Visualization** – colours map by *Nike performance* (ranked), filtered to polygons where `MEDDI_CY` is high.
* **SHAP** – explains why *Nike performance* is high/low (income, age, diversity, etc.).
* **Aligned** – both tracks talk about the same metric.

### B. Correlation Without Nike Metric

*Query:* "Correlate running participation with running shoe purchases".

If analyzer keeps **`target_variable = NikePerformance`** (left from a previous choice):

* **Visualization** – scatter plot of *running participation* vs. *running shoe purchases*.
* **SHAP** – explains *Nike performance* (unrelated to the plotted correlation).
* **Mismatched** – user sees two valid but conceptually different outputs.

### C. Proper Correlation Handling

If analyzer instead sets `target_variable` to one of the axes (e.g. `running_shoe_purchases`):

* **Visualization** – still shows correlation.
* **SHAP** – explains *running shoe purchases*, tying both tracks together.

---

## 4  Key Takeaways

* `target_variable` **defines what the model predicts and SHAP explains.**
* The visualization layer can involve **multiple** fields; SHAP always explains **one**.
* For coherent stories the analyzer must pick a target variable **mentioned in the question** (or at least conceptually aligned).
* When you see 400-errors like _"Unknown metric conversion_rate"_ the mis-alignment is between
  * the analyzer's chosen `target_variable`, and
  * the actual columns available in the dataset/config.
* Fixes usually involve **updating field mappings** or **adding the missing metric** to the dataset, not changing the config-generation engine.

---

## 5  Troubleshooting Checklist

1. **Does `target_variable` exist** in `NESTO_FIELD_MAPPING.md` / the microservice CSV? If not, update mappings or dataset.
2. **Does the query mention the metric you care about?** If not, rephrase or enhance keyword mapping in `query-analyzer.ts`.
3. **Are SHAP bars describing something unexpected?** Compare `target_variable` in the API payload to the variables used in the visualization.

---

*Last updated: 2025-06-20* 