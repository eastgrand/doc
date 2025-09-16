This repository is a Next.js-based geospatial analysis & chat application that integrates LLMs (Anthropic/Claude) and ArcGIS-sourced layers.

Quick context (what matters most):
- Framework: Next.js (see `package.json` scripts: `dev`, `build`, `start`, `test`). Treat API routes under `app/api/*` as server-side entry points.
- AI integrations: Claude/Anthropic is used via `@anthropic-ai/sdk` inside `app/api/claude/*` (notably `generate-response/route.ts`, `chat/route.ts`). Respect persona/system message patterns.
- Geospatial data: Layer configs live in `config/layers.ts` (auto-generated). Many processors expect fields like `DESCRIPTION`, `ID`, `area_id`, and nested `properties.properties` formats.

What to do when coding as an assistant:
- Preserve Next.js API contract: changes to `app/api/*/route.ts` must keep NextResponse/NextRequest patterns and not break streaming semantics. Check `fetchCache`/`revalidate` flags used in AI routes.
- Be conservative with prompts and hallucination checks: the codebase applies post-generation validation (see `validateClusterResponse` in `generate-response/route.ts`) and expects deterministic persona instructions. Mirror existing prompt structure when updating prompts.
- Field nesting: the system accepts either top-level feature properties or double-nested `properties.properties`. Use provided helpers: `getLocationName`, `getZIPCode`, `extractFeatureId`, and `filterFeaturesBySpatialFilterIds` from `lib/analysis`.

Key patterns and conventions to follow:
- Defensive data handling: many route handlers tolerate missing fields and attempt multiple fallbacks (e.g., `resolveAreaName`). Follow this style: try ordered fallbacks, log useful debug info for first few items, and avoid throwing on missing optional fields.
- Scoring/field fallbacks: analysis code prefers a normalized primary score field (see `getPrimaryScoreField`) with many legacy fallbacks. When adding new scores or fields, update `getPrimaryScoreField` and `config/layers` when appropriate.
- Small, traceable changes: add console logs where strategic (first 1-3 items) and avoid noisy logging for large datasets. Use structured logs for debugging crucial branch behavior.

Build, test, and local debug commands to use:
- Start dev: `npm run dev` (Next.js dev server).
- Build for production: `npm run build` (uses NODE_OPTIONS to enlarge heap).
- Run unit tests: `npm test` or `npm run test:<target>` for specific suites (see `package.json` for many test aliases).
- Quick check for AI route changes: run `node -e "const f=require('./app/api/claude/generate-response/route.ts'); console.log(typeof f)"` or use the Next dev server to exercise endpoints.

Important files to inspect when making changes:
- `app/api/claude/generate-response/route.ts` — core analysis orchestration, validation, and prompt construction.
- `app/api/claude/chat/route.ts` — simple chat wrapper and persona handling.
- `config/layers.ts` — authoritative layer metadata and field definitions.
- `lib/analysis/` — analysis pipeline, helpers such as `analysisLens`, `utils/spatialFilter`, and processors.
- `docs/implementation/README.md` — high-level feature implementation notes.

Integration and external services:
- Anthropic/Claude: configured via `process.env.ANTHROPIC_API_KEY`, models set in routes (check default models in `app/api/claude/*`).
- ArcGIS: layers reference ArcGIS FeatureServer endpoints. Network and CORS considerations matter for local testing.
- Blob storage: some scripts and routes reference `@vercel/blob` and other storage; consult `scripts/` for migration utilities.

When in doubt, prefer minimal, reversible changes and add tests or a short smoke script under `test/` or `scripts/` demonstrating the new behavior.

If you update prompts, add a small unit test or example request to `test/` that asserts presence/format of key sections (e.g., `Top Strategic Markets:`) to avoid regressions.

Ask for clarification when: you need authoritative intent behind a numeric weighting, a field alias mapping, or permission changes to a layer; these are maintained in `config/layers.ts` and `scripts/migration` utilities.

Last updated: 2025-09-13
