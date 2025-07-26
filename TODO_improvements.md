# 🛠️ Project TODOs & Improvements

> Consolidated list of follow-up items identified on 2025-06-29

- [x] **Legend & Popup Labels** – ✅ **COMPLETED** - Fixed field mapping to handle all field name variations:
  - ✅ **FIXED CORE ISSUE**: Updated normalization logic to handle field names with spaces (e.g., `Mp30034 A B P`)
  - ✅ **ADDED PERCENTAGE MAPPINGS**: Added all percentage field versions (e.g., `MP30034ABP` → "Nike Athletic Shoes (%)")
  - ✅ **IMPROVED FALLBACK**: Enhanced `prettifyFieldName()` to handle " A B P" suffixes
  - ✅ **COMPREHENSIVE COVERAGE**: All visualization paths now use `FieldMappingHelper.getFriendlyFieldName()`
  - **Result**: Field codes like `Mp30034 A B P` now display as "Nike Athletic Shoes (%)" instead of raw codes

- [x] **Multi-layer Visualisation Rendering** – ✅ **COMPLETED** - Fixed multi-layer visualization logic:
  - ✅ **FIXED VISUALIZATION ROUTING**: 3+ layer queries now properly route to `MultivariateVisualization` instead of `CorrelationVisualization`
  - ✅ **RESTORED TRENDS-CORRELATION**: Re-enabled `TrendsCorrelationVisualization` for combining trends data with demographics (2-layer specific)
  - ✅ **CLARIFIED JOINT-HIGH USAGE**: Joint-high is specifically for 2 variables where both have high values, not for 3+ variables
  - ✅ **ADDED MULTIVARIATE SUPPORT**: 3+ variables now use proper `MultivariateVisualization` for complex multi-variable analysis
  - ✅ **IMPROVED FIELD EXTRACTION**: Enhanced field detection to extract numeric fields from actual feature data when renderer fields are insufficient
  - ✅ **ENHANCED DATA VALIDATION**: Added comprehensive geometry and attribute validation to ensure only valid features are processed
  - ✅ **IMPROVED ERROR HANDLING**: Added fallback to joint-high visualization if multivariate processing fails
  - ✅ **IMPROVED TYPE DETECTION**: Added proper logic to distinguish between correlation (2 variables), joint-high (2 high variables), multivariate (3+ variables), and trends-correlation (trends + demographics)
  - ✅ **FIXED ROUTING PRIORITY**: Fixed critical bug where correlation keywords were overriding numeric field count logic, ensuring 3+ variable queries correctly use multivariate visualization even when containing "vs" or "compare" keywords
  - **Result**: Multi-layer queries now use mathematically appropriate visualization types with robust data validation and fallback handling. The routing logic now correctly prioritizes variable count over keyword detection.

- [ ] **Percentage-Aware AI Narratives** – When analysis fields represent percentages (e.g., *_P, *_PCT), the generated narrative should express values as “%” rather than “units” or “purchases”. Extend the narrative generation post-processor to inspect field suffixes or metadata.

- [ ] **Cluster Filter UI** – Dormant code currently filters visualisation results by DBSCAN clusters. Surface this as a user-controlled filter: a toggle or dropdown in the map/legend panel. Audit commented-out `clusterFilterDialog` components and resurrect / modernise as needed.

- [ ] **Infographics Action in Popups** – Hook the “Infographics” button so it:
  1. Opens the infographics sidebar/panel.
  2. Passes the clicked feature's geometry/OBJECTID.
  3. Skips straight to the report-selection step.

- [ ] **IQBuilder UI/UX Polish** – Brainstorm and prototype improvements for the query + chat flow. Ideas so far:
  * Sticky header with quick-action chips (common queries, saved queries).
  * Progressive disclosure: collapse advanced options until needed.
  * Inline loading states & optimistic UI for chat responses.
  * Dark-mode colour palette parity. 