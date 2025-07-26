# Query Classifier Testing System

A lightweight Jest-powered framework that continuously validates our natural-language query classifier against the same examples shown to end-users.

## Motivation
Mis-classification used to send the wrong payload to the SHAP micro-service, resulting in identical or empty visualizations.  Automated tests catch regressions immediately.

## Source of Truth
`components/chat/chat-constants.ts` exports `ANALYSIS_CATEGORIES` – the canonical list of sample queries grouped by analysis type.

## Test Runner
`__tests__/query-classifier.test.ts` (unit) and `__tests__/chat-constants.integration.test.ts` (integration) perform three steps for every sample query:
1. Run `classifyQueryWithLayers()` – live logic, no mocks.  
2. Use `conceptMapping` to pick relevant layers so classification has realistic context.  
3. Assert:
   * `queryType !== 'unknown'`
   * confidence ≥ 0.2 (unit) or response 200 (integration).

At the end a summary table prints to console.

## How to Execute
```bash
npm test -- query-classifier
# or all suites
npm test
```

## Extending the Suite
1. Add a new phrase to the appropriate category in `chat-constants.ts`.  
2. Tests auto-discover it – no code changes required.  
3. If it fails, refine patterns in `lib/query-classifier.ts`.

## Recent Fixes Caught by the Tests (Jan 2025)
* Overly broad ranking regex → narrowed to explicit `top|bottom N` patterns.
* Heatmap "concentration" phrasing added.  
* Joint-high queries more resilient to filler words.

## Further Reading
* [Two-Pass Analysis](two-pass-analysis.md)
* [Comprehensive Testing Guide](COMPREHENSIVE_TESTING_GUIDE.md) 