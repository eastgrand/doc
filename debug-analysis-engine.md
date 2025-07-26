# Debug Analysis Engine - Complete Test Plan

## Current Status
- Added comprehensive debugging to AnalysisEngine.ts 
- Added debugging to CachedEndpointRouter.ts
- Added debugging to UI component (geospatial-chat-interface.tsx)
- Created test file at `/public/test-strategic-flow.html`

## Debug Logs Added

### AnalysisEngine.ts
- `🚨🚨🚨 [ANALYSIS ENGINE] Constructor called!` - Shows when AnalysisEngine is created
- `🚨🚨🚨 [ANALYSIS ENGINE DEBUG] executeAnalysis called with query:` - Shows when executeAnalysis is called
- `🚨 [ANALYSIS ENGINE DEBUG] About to call endpointRouter.selectEndpoint` - Before endpoint selection
- `🚨 [ANALYSIS ENGINE DEBUG] Selected endpoint:` - Shows selected endpoint
- `🚨 [ANALYSIS ENGINE DEBUG] About to call endpointRouter.callEndpoint` - Before data loading
- `🚨 [ANALYSIS ENGINE DEBUG] callEndpoint returned data:` - Shows loaded data stats
- `🚨🚨🚨 [STRATEGIC DEBUG] AnalysisEngine processed data:` - Shows processed strategic values
- `🚨🚨🚨 [ANALYSIS ENGINE ERROR] Cache-based analysis failed:` - Shows any errors

### CachedEndpointRouter.ts
- `🔥 [CachedEndpointRouter] selectEndpoint called with query:` - Shows endpoint selection
- `[CachedEndpointRouter] Loading cached data for endpoint` - Shows data loading

### UI Component
- `🚨🚨🚨 [STRATEGIC DEBUG] Processing ${result.area_name}:` - Shows strategic data processing
- `🚨   → FINAL targetValue:` - Shows final values sent to Claude

## Expected Debug Flow for Strategic Analysis

When running "Show me the top strategic markets for Nike expansion":

1. `🚨🚨🚨 [ANALYSIS ENGINE] Constructor called!` - AnalysisEngine created
2. `🚨🚨🚨 [ANALYSIS ENGINE DEBUG] executeAnalysis called with query: "Show me..."`
3. `🚨 [ANALYSIS ENGINE DEBUG] About to call endpointRouter.selectEndpoint`
4. `🔥 [CachedEndpointRouter] selectEndpoint called with query:`
5. `🚨 [ANALYSIS ENGINE DEBUG] Selected endpoint: /strategic-analysis`
6. `🚨 [ANALYSIS ENGINE DEBUG] About to call endpointRouter.callEndpoint`
7. `[CachedEndpointRouter] Loading cached data for /strategic-analysis`
8. `🚨 [ANALYSIS ENGINE DEBUG] callEndpoint returned data: success: true, recordCount: 3983`
9. `🚨🚨🚨 [STRATEGIC DEBUG] AnalysisEngine processed data:`
10. Should show distinct values like 79.34, 79.17, 79.12

## Test Plan

### 1. Direct Test (http://localhost:3000/test-strategic-flow.html)
- Tests data file directly
- Tests Claude API with correct data
- Shows if precision is preserved

### 2. UI Test (Main Application)
- Run strategic analysis query
- Check browser console for debug logs
- Verify if AnalysisEngine is being called

### 3. Expected Outcomes

**If AnalysisEngine is working:**
- Debug logs will appear in order
- Strategic values will be distinct (79.34, 79.17, etc.)
- Claude will receive correct data

**If AnalysisEngine is failing:**
- Debug logs will stop at error point
- `🚨🚨🚨 [ANALYSIS ENGINE ERROR]` will show the issue
- UI will fall back to old approach

## Key Fixes Implemented

1. **Enhanced Error Handling**: Comprehensive error logging in AnalysisEngine
2. **Strategic Analysis Prompt**: Added dedicated prompt with precision requirements
3. **Analysis Type Mapping**: Fixed strategic -> strategic_analysis mapping
4. **Analysis Type Derivation**: Added logic to derive type from featureData
5. **Debug Logging**: Added step-by-step debugging throughout the pipeline

## Next Steps

1. Run the test and check console logs
2. Identify where the flow breaks (if it does)
3. Fix the specific issue that prevents AnalysisEngine from working
4. Verify all endpoints use AnalysisEngine properly