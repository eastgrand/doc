# Memory Leak Fix Guide for Second Query Crash

## Problem Description
The app works fine for the first query but crashes on the second query after clearing.

## Identified Issues

### 1. **Singleton Instances Not Being Cleaned Up**
The AnalysisEngine and ConfigurationManager use singleton patterns but:
- They accumulate state over time
- No proper cleanup between queries
- Event listeners might not be removed

### 2. **Layer Management Issues**
In `geospatial-chat-interface.tsx`:
- `currentVisualizationLayer.current` is stored but may not be fully cleaned
- Multiple references to the same layer could prevent garbage collection

### 3. **Large Dataset Accumulation**
- The `features` state array could be holding large amounts of data
- Customer profile dataset alone is 10.76 MB
- Multiple endpoint calls could accumulate in memory

### 4. **Effects System Not Cleaned**
The VisualizationRenderer has an effects system that:
- Creates canvas elements for animations
- Has `animationId` that might not be canceled
- The `destroy()` method exists but might not be called

## Immediate Fixes

### Fix 1: Add Cleanup to clearVisualization
```typescript
// In geospatial-chat-interface.tsx, enhance clearVisualization:
const clearVisualization = () => {
  setIsAnalyzing(false);
  setProcessingError(null);
  setFeatures([]); // Clear feature data
  setFormattedLegendData({ items: [] });
  
  // Clear existing visualization layer
  if (currentVisualizationLayer.current) {
    console.log('[AnalysisEngine] 🗑️ REMOVING EXISTING LAYER');
    if (currentMapView) {
      currentMapView.map.remove(currentVisualizationLayer.current);
      // IMPORTANT: Destroy the layer to free memory
      if (typeof (currentVisualizationLayer.current as any).destroy === 'function') {
        (currentVisualizationLayer.current as any).destroy();
      }
    }
    currentVisualizationLayer.current = null;
  }
  
  // Clear any graphics
  if (currentMapView) {
    currentMapView.graphics.removeAll();
  }
  
  // Force garbage collection hint (browser will decide when to actually run)
  if (window.gc) {
    window.gc();
  }
  
  onVisualizationLayerCreated(null, true);
  setCurrentProcessingStep('query_analysis');
  setDebugInfo({
    endpoint: null,
    query: null,
    processingTime: null,
    recordCount: null,
    visualizationType: null,
    error: null
  });
};
```

### Fix 2: Add Component Cleanup on Unmount
```typescript
// Add useEffect for cleanup on component unmount
useEffect(() => {
  return () => {
    // Cleanup on unmount
    if (currentVisualizationLayer.current && currentMapView) {
      currentMapView.map.remove(currentVisualizationLayer.current);
      if (typeof (currentVisualizationLayer.current as any).destroy === 'function') {
        (currentVisualizationLayer.current as any).destroy();
      }
    }
    
    // Clear references
    currentVisualizationLayer.current = null;
    
    // Clear any pending timeouts/intervals
    // (Add any timeout/interval IDs that need clearing)
  };
}, [currentMapView]);
```

### Fix 3: Reset Analysis Engine State
```typescript
// Before starting a new analysis, reset state:
const handleAnalyze = async (query: string) => {
  try {
    // Clear previous results first
    clearVisualization();
    
    // Get fresh instance or clear cache
    const analysisEngine = AnalysisEngine.getInstance();
    
    // Clear any cached data
    if (typeof (analysisEngine as any).clearCache === 'function') {
      (analysisEngine as any).clearCache();
    }
    
    // Proceed with analysis...
  } catch (error) {
    // Handle error
  }
};
```

### Fix 4: Limit Feature Array Size
```typescript
// When setting features, limit the array size:
const MAX_FEATURES = 10000; // Adjust based on your needs

// In your feature processing:
if (geographicFeatures.length > MAX_FEATURES) {
  console.warn(`Limiting features from ${geographicFeatures.length} to ${MAX_FEATURES}`);
  geographicFeatures = geographicFeatures.slice(0, MAX_FEATURES);
}
setFeatures(geographicFeatures);
```

## Long-term Solutions

### 1. **Implement Proper Cleanup Methods**
Add cleanup methods to AnalysisEngine:
```typescript
public cleanup(): void {
  // Clear state
  this.stateManager.clearState();
  
  // Clear caches
  this.endpointRouter.clearCache();
  
  // Destroy visualization renderer
  this.visualizationRenderer.destroy();
  
  // Clear event listeners
  this.eventListeners.clear();
}
```

### 2. **Use WeakMap for Layer References**
Instead of direct references, use WeakMap to allow garbage collection:
```typescript
const layerReferences = new WeakMap();
```

### 3. **Implement Memory Monitoring**
Add memory usage monitoring:
```typescript
const checkMemoryUsage = () => {
  if (performance.memory) {
    const used = performance.memory.usedJSHeapSize / 1048576; // MB
    const total = performance.memory.totalJSHeapSize / 1048576; // MB
    console.log(`Memory: ${used.toFixed(2)}MB / ${total.toFixed(2)}MB`);
    
    if (used / total > 0.9) {
      console.warn('High memory usage detected!');
    }
  }
};
```

### 4. **Paginate Large Datasets**
For large result sets, implement pagination or streaming:
```typescript
// Instead of loading all data at once
const CHUNK_SIZE = 1000;
const loadDataInChunks = async (endpoint: string, query: string) => {
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const chunk = await loadChunk(endpoint, query, offset, CHUNK_SIZE);
    processChunk(chunk);
    offset += CHUNK_SIZE;
    hasMore = chunk.length === CHUNK_SIZE;
  }
};
```

## Testing the Fix

1. Apply the immediate fixes
2. Test with this sequence:
   - Run first query
   - Clear visualization
   - Run second query with different endpoint
   - Check browser memory usage in DevTools

3. Monitor for:
   - Memory usage growth
   - Console errors
   - Network requests not completing
   - Layers not being removed properly

## Browser-Specific Considerations

### Chrome
- Use Chrome Task Manager to monitor tab memory
- Enable precise memory info: `--enable-precise-memory-info`
- Use Memory Profiler in DevTools

### Firefox
- Use `about:memory` to analyze memory usage
- Look for "ghost windows" or detached DOM nodes

### Safari
- Use Web Inspector's Timelines tab
- Check for retained objects in heap snapshots

## Emergency Workaround

If the issue persists, add a "full refresh" option:
```typescript
const performFullRefresh = () => {
  // Save any necessary state
  const savedQuery = currentQuery;
  
  // Clear everything
  clearVisualization();
  
  // Reset singletons
  AnalysisEngine.resetInstance();
  ConfigurationManager.resetInstance();
  
  // Optionally reload the page
  if (confirm('Perform full page refresh to clear memory?')) {
    window.location.reload();
  }
};
```

This should help identify and fix the memory leak causing the second query crash.