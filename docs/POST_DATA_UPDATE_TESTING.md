# Post-Data-Update Comprehensive Testing Guide

Status: Required after every dataset/endpoint update
Updated: August 31, 2025

## Purpose

Run this checklist immediately after updating data via the automation pipeline to ensure routing, processors, post-processing, and visualization alignment remain correct and performant.

## Prerequisites

- Install dependencies (once): npm ci
- Node 18+ suggested
- Optional debug flags:
  - DEBUG_ROUTING=1 (only when investigating routing; keep off for normal runs)

## Fast Checklist

1. Verify endpoint score mappings

- Command: node check_field_mappings.js
- Pass criteria: All endpoints aligned; detected dynamic score matches renderer/targetVariable

1. Run focused processor suites (strategic)

- Task: Jest: strategic processor quick tests
- Pass criteria: Both tests pass; console shows renderer.field === strategic_analysis_score and quartile breaks

1. Validate Top Strategic Markets post-process

- Task: Jest: topStrategicMarkets tests
- Pass criteria: Max-10 cap, Study Area Summary present, respects spatialFilterIds unless scope=project

1. Validate dynamic field alignment across processors

- Task: Jest: dynamic field alignment tests
- Pass criteria: All pass; renderer.field equals targetVariable (last numeric field)

1. Run hybrid routing comprehensive suite

- Test: __tests__/hybrid-routing-comprehensive.test.ts
- Pass criteria (current baseline):
  - Built-in suite: Overall 100%, In-scope 100%, Out-of-scope 100%
  - Brand-vs sample routes to /brand-difference
  - Avg processing time typically < 1ms on dev hardware

1. Quick node smokes (optional)

- Task: Unit: strategic top markets post-process → expect OK
- Task: Quick node smoke: spatialFilterIds filtering logic → expect hasFilter=true and id extraction true

1. UI/Map smoke (optional)

- Run your normal dev flow; trigger strategic and competitive analyses:
  - Confirm Top Markets sorted by targetVariable
  - Legend mirrors class breaks; renderer.field equals targetVariable
  - Brand-vs queries (e.g., “H&R Block vs TurboTax market positioning”) route to /brand-difference

## Detailed Steps and Scripts

- Mapping audit: node check_field_mappings.js
- Strategic suites: npm run -s test -- lib/analysis/strategies/processors/__tests__/StrategicAnalysisProcessor.name.test.ts lib/analysis/strategies/processors/__tests__/StrategicAnalysis.e2e.test.ts
- Top Markets: npm run -s test -- lib/analysis/postprocess/__tests__/topStrategicMarkets.test.ts
- Dynamic Field Alignment: npm run -s test -- lib/analysis/strategies/processors/__tests__/DynamicFieldAlignment.e2e.test.ts
- Comprehensive routing: npm run -s test -- __tests__/hybrid-routing-comprehensive.test.ts
  - Optional reports: WRITE_TEST_REPORTS=true npm run -s test -- __tests__/hybrid-routing-comprehensive.test.ts

VS Code Tasks (alternative):
- Run Task → “Jest: strategic processor quick tests”
- Run Task → “Jest: topStrategicMarkets tests”
- Run Task → “Jest: dynamic field alignment tests”
- Run Task → “Test geospatial-chat-interface” (echo smoke)

## Current Pass/Fail Expectations (Baseline)

- Routing: 100/100/100% (Overall/In-scope/Out-of-scope) with brand-vs routed to /brand-difference
- Strategic processors: PASS; quartile renderer generated; dynamic field detection active
- Post-process: PASS; Top Markets injected with cap and summary; honors spatialFilterIds

## Troubleshooting

- Competitive vs Brand Difference misroute:
  - Ensure DomainVocabularyAdapter brand-vs tie-breakers are present (targeted bonus/penalty plus cap/floor)
  - Verify two brand/company tokens are detected and “vs/versus” or “compare/between” exists
- Low competitive confidence on “market positioning” phrasing:
  - BaseIntentClassifier should treat “market positioning” as competitive; confirm tests
- Renderer mismatch:
  - Processors must set renderer.field === analysisResult.data.targetVariable (last numeric field)

## When to Run

- After every ArcGIS automation run (scripts/automation/run_complete_automation.sh)
- After manual edits to endpoint JSONs under public/data/endpoints/
- Before any deployment
