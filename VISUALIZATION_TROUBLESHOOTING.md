# Visualization Troubleshooting Guide

## Issue: Queries run analysis but don't show visualization on map

Based on code analysis of the query-to-visualization flow, here are the key debugging steps:

## 1. Check Browser Console for Critical Errors

### Key Log Patterns to Look For:

```
🔥 [CachedEndpointRouter] ENDPOINT DECISION: [endpoint] for query: "[query]"
⚖️ [COMPARATIVE ANALYSIS PROCESSOR] CALLED WITH [N] RECORDS ⚖️
[UnifiedWorkflow] ✅ ZIP Code boundaries loaded: count: [N]
[UnifiedWorkflow] ✅ Geometry join complete: totalRecords: [N], recordsWithGeometry: [N]
[applyAnalysisEngineVisualization] Starting with: ...
```

### Critical Error Patterns:

```
❌ [applyAnalysisEngineVisualization] ❌ No visualization object provided
❌ [applyAnalysisEngineVisualization] ❌ No renderer in visualization object
❌ [applyAnalysisEngineVisualization] ❌ NO RECORDS PROVIDED TO VISUALIZATION
❌ [applyAnalysisEngineVisualization] No records with valid geometry found
```

## 2. Step-by-Step Debugging

### Step 1: Verify Endpoint Routing
1. Run a query like "Compare income in Miami"
2. Look for: `🔥 [CachedEndpointRouter] ENDPOINT DECISION`
3. **Expected**: Should route to `/comparative-analysis` or similar
4. **Problem**: If routing to wrong endpoint or failing

### Step 2: Verify Data Processing
1. Look for: `⚖️ [COMPARATIVE ANALYSIS PROCESSOR] CALLED WITH [N] RECORDS`
2. **Expected**: Should show records > 0
3. **Problem**: If 0 records or processor not called

### Step 3: Verify Geometry Join
1. Look for: `[UnifiedWorkflow] ✅ ZIP Code boundaries loaded`
2. Look for: `[UnifiedWorkflow] ✅ Geometry join complete`
3. **Expected**: recordsWithGeometry should equal totalRecords
4. **Problem**: If geometry join fails or no geometries found

### Step 4: Verify Visualization Creation
1. Look for: `[applyAnalysisEngineVisualization] Starting with:`
2. Check the logged object for:
   - `hasRenderer: true`
   - `recordCount > 0`
   - `sampleRecord.hasGeometry: true`
3. **Problem**: If any of these are false

### Step 5: Verify Layer Application
1. Look for: `[UnifiedWorkflow] ✅ Visualization applied successfully`
2. **Expected**: Should see successful layer creation
3. **Problem**: If layer creation fails

## 3. Common Issues and Fixes

### Issue A: No Records from Endpoint
**Symptoms**: Processor called with 0 records
**Debug**: Check endpoint response in Network tab
**Fix**: Verify endpoint is running and returning data

### Issue B: Geometry Join Failure
**Symptoms**: `recordsWithGeometry: 0`
**Debug**: Check if ZIP codes in data match boundary data
**Fix**: Verify ZIP code format consistency

### Issue C: Missing Renderer
**Symptoms**: `hasRenderer: false` in applyAnalysisEngineVisualization
**Debug**: Check if processor is creating renderer properly
**Fix**: Verify processor.createComparativeRenderer() is called

### Issue D: Layer Not Added to Map
**Symptoms**: No visualization appears but no errors
**Debug**: Check if `onVisualizationLayerCreated` is called
**Fix**: Verify map view is available and layer management is working

## 4. Quick Test Commands

Run these in browser console during a query:

```javascript
// Check if analysis result has required data
console.log('Analysis result:', window.lastAnalysisResult);

// Check current visualization layer
console.log('Current viz layer:', window.currentVisualizationLayer);

// Check map view
console.log('Map view:', window.mapView);
```

## 5. Specific Code Areas to Check

1. **Line 4294**: `if (analysisResult.visualization && analysisResult.data && initialMapView)`
   - Ensure all three conditions are true

2. **Line 4299**: `applyAnalysisEngineVisualization` call
   - Check if this function is reached

3. **Line 4310**: `onVisualizationLayerCreated` call
   - Verify this callback is executed

4. **Processor lines 265**: `renderer: this.createComparativeRenderer(rankedRecords)`
   - Ensure renderer is created in processor

## 6. Expected Working Flow

1. ✅ Query submitted
2. ✅ Semantic/keyword routing selects endpoint  
3. ✅ Endpoint returns data with records
4. ✅ Processor creates visualization object with renderer
5. ✅ Geometry join adds map polygons to records  
6. ✅ `applyAnalysisEngineVisualization` creates layer
7. ✅ Layer added to map via `onVisualizationLayerCreated`
8. ✅ Map shows colored polygons

## 7. If All Else Fails

Check these potential edge cases:
- Map view not fully initialized when visualization applied
- Theme switching interfering with layer rendering
- ArcGIS modules not loaded properly
- Memory/performance issues with large datasets
- Caching issues with previous layers

Run a simple test with a known working query like:
"Show income patterns in Miami"

This should trigger the full visualization pipeline and help identify where it breaks.