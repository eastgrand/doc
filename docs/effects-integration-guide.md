# Visual Effects Integration Guide

## Overview

The enhanced visualization system now includes integrated visual effects that work with ArcGIS renderers to provide dynamic, animated visualizations including firefly effects, hover animations, and gradient systems.

## Architecture

```
Query → AnalysisEngine → VisualizationRenderer → Enhanced Renderers
                                ↓
                        EffectsManager → Effect Systems
                                ↓
                        Canvas Overlays + ArcGIS Features
```

## How It Works

### 1. Renderer Flag Detection
Enhanced renderers set flags in their output:
```javascript
renderer: {
  type: 'class-breaks',
  // ... standard ArcGIS properties
  _fireflyMode: true,           // Enables firefly particles
  _visualEffects: { glow: true }, // Effect configuration
  _dualVariable: true,          // Dual-variable visualization
  _useCentroids: true          // Use polygon centroids for effects
}
```

### 2. Effect Queueing
When `VisualizationRenderer.createVisualization()` detects effect flags:
```javascript
result._pendingEffects = {
  enabled: true,
  rendererFlags: { fireflyMode: true, visualEffects: {...} },
  visualizationData: data,
  config: visualizationConfig
}
```

### 3. Effect Application
After the ArcGIS layer is created and added to map:
```javascript
await visualizationRenderer.applyVisualizationEffects(layer, visualizationResult);
```

## Integration Steps

### Step 1: Initialize VisualizationRenderer with MapView
```javascript
const visualizationRenderer = new VisualizationRenderer(configManager);

// Initialize with map view to enable effects
await visualizationRenderer.initializeMapView(mapView);
```

### Step 2: Create Visualization (Effects Auto-Detected)
```javascript
const visualizationResult = visualizationRenderer.createVisualization(data, endpoint);

// Check if effects are pending
if (visualizationResult._pendingEffects) {
  console.log('Effects will be applied after layer creation');
}
```

### Step 3: Apply Effects After Layer Creation
```javascript
// Create ArcGIS FeatureLayer from visualization result
const layer = new FeatureLayer({
  source: features,
  renderer: visualizationResult.renderer,
  popupTemplate: visualizationResult.popupTemplate
});

// Add to map
mapView.map.add(layer);

// Apply effects after layer is added
await visualizationRenderer.applyVisualizationEffects(layer, visualizationResult);
```

## Effect Types

### 1. Firefly Effects
- **Trigger**: `renderer._fireflyMode = true`
- **Visual**: Golden glowing particles around high-value features
- **Best for**: Competitive analysis, highlighting opportunities

### 2. Hover Animations  
- **Trigger**: `renderer._visualEffects.hover = true`
- **Visual**: Ripple effects, scaling, color transitions on hover
- **Best for**: Interactive exploration

### 3. Gradient Systems
- **Trigger**: `renderer._visualEffects.gradient = true`
- **Visual**: Enhanced polygon fills with animated borders
- **Best for**: Choropleth maps, area comparisons

### 4. Ambient Particles
- **Trigger**: Always active when effects enabled
- **Visual**: Subtle background particles for atmosphere
- **Best for**: Adding visual interest without distraction

## Performance Management

### Automatic Performance Scaling
```javascript
// Effects manager automatically detects performance and scales effects
const stats = visualizationRenderer.getEffectsStats();
console.log('Performance mode:', stats.performanceMode); // 'high', 'medium', or 'low'
```

### Manual Configuration
```javascript
visualizationRenderer.updateEffectsConfig({
  performance: 'medium',
  fireflies: { intensity: 0.5 },
  ambient: { density: 0.2 }
});
```

### Disable Effects
```javascript
visualizationRenderer.updateEffectsConfig({ enabled: false });
// or clear all effects
visualizationRenderer.clearEffects();
```

## Competitive Analysis Example

The competitive analysis visualization automatically enables effects:

```javascript
// CompetitiveRenderer sets these flags:
const renderer = {
  type: 'simple',
  visualVariables: [
    { type: 'size', field: 'nike_market_share' },    // Circle size
    { type: 'color', field: 'value' }                // Color for advantage score
  ],
  _fireflyMode: true,        // Golden particles for high-advantage areas
  _dualVariable: true,       // Dual-variable legend
  _visualEffects: { glow: true, animation: 'pulse' }
}

// Effects applied automatically after layer creation
```

## Browser Support

- **Canvas Effects**: All modern browsers
- **Blend Modes**: Chrome/Safari (full), Firefox (limited)  
- **Performance**: Automatically scales based on device capabilities
- **Accessibility**: Respects `prefers-reduced-motion` setting

## Troubleshooting

### Effects Not Appearing
1. Check map view is initialized: `await visualizationRenderer.initializeMapView(mapView)`
2. Verify effects are enabled: `visualizationRenderer.getEffectsStats()`
3. Ensure layer is added to map before calling `applyVisualizationEffects()`

### Performance Issues
1. Check performance mode: `getEffectsStats().performanceMode`
2. Reduce effect intensity: `updateEffectsConfig({ fireflies: { intensity: 0.3 } })`
3. Disable on mobile: `updateEffectsConfig({ enabled: false })`

### Integration Points

The effects system needs to be integrated at these locations:
- **Map component**: Initialize VisualizationRenderer with MapView
- **Layer creation**: Call `applyVisualizationEffects()` after adding layers
- **Cleanup**: Call `visualizationRenderer.destroy()` when unmounting