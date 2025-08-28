# Build Fixes Tracker

## Critical Errors (Must Fix)

### Syntax and Parsing Errors
- [x] `components/errors-MapApp.js`: Parsing error: ';' expected (removed - error log file)
- [x] `components/geospatial-chat-interface-older.ts`: Parsing error: '>' expected (removed - reference file)
- [x] `components/geospatial-chat-interface-ref.ts`: Parsing error: '>' expected (removed - reference file)
- [x] `components/geospatial/visualization-handler.ts`: Duplicate case label

### Case Block Declaration Errors
- [x] `pages/api/ml-analytics.ts`: Unexpected lexical declaration in case block (lines 197, 265) (fixed by adding block scoping)
- [x] `lib/DynamicVisualizationFactory.ts`: Multiple unexpected lexical declarations in case blocks (lines 166-305) (fixed by adding block scoping)

### React Component Issues
- [x] `components/MapContainer.tsx`: Component definition is missing display name (fixed by adding displayName)
- [x] `pages/ml-test.tsx`: Unescaped entities in JSX (lines 30, 34) (fixed by escaping entities)

### JavaScript/TypeScript Best Practices
- [x] `lib/config/dynamic-layers.js`: 
  - Unexpected aliasing of 'this' to local variable (line 538) (fixed by using arrow function)
  - Expected a 'break' statement before 'case' (line 566) (fixed by adding break statement)
- [x] `lib/lib/ml-query-classifier.js`:
  - Expected a 'break' statement before 'case' (line 77) (fixed by adding break statement)
  - Unexpected comma in middle of array (line 78) (fixed by using Array.from and destructuring)
- [x] `lib/lib/query-classifier.js`:
  - Multiple 'pattern' redefinitions (lines 568, 587, 600, 609, 691) (fixed by renaming variables to avoid conflicts)
  - require() style imports forbidden (lines 42, 43) (fixed by using ES6 imports)
  - Expected a 'break' statement before 'case' (line 717) (fixed by adding break statement)

## Warnings (Should Fix)

### React Hook Dependencies
- [x] `components/LayerController/LayerComparison.tsx`: useEffect missing 'compareLayers' dependency
- [x] `components/LayerController/LayerStatistics.tsx`: useEffect missing 'errorHandler' dependency
- [x] `components/LayerController/LayerStats.tsx`: useEffect missing 'loadLayerStats' dependency
- [x] `components/LoadingModal.tsx`: useEffect missing 'internalProgress' dependency
- [x] `components/MapContainer.tsx`: 
  - useEffect missing 'view' dependency
  - useCallback has unnecessary 'createFeatureLayerMap' dependency
- [x] `components/MapWidgets.tsx`: 
  - Ref value 'widgetCleanupHandles.current' may change before cleanup
  - Ref value 'layerListActionHandleRef.current' may change before cleanup
- [x] `components/QueryHistory/QueryHistoryPanel.tsx`: useEffect missing 'loadQueries' dependency
- [x] `components/Visualization/ExportPanel.tsx`: useEffect missing 'loadTemplates' dependency

## Progress Tracking
- Total Issues: 25
- Critical Issues: 13
- Warnings: 12
- Fixed: 25
- Remaining: 0

## Notes
- Focus on fixing critical errors first, particularly syntax and parsing errors
- React Hook warnings can be addressed after the build succeeds
- Some fixes may require refactoring larger sections of code
- Consider adding ESLint configuration to prevent similar issues in the future 