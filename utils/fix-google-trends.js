/**
 * Simple Google Trends Virtual Layer Fix
 * Run this in your browser console to fix the Google Trends virtual layers
 */

(function() {
  console.log('=== GOOGLE TRENDS VIRTUAL LAYER FIX ===');
  
  // Get the map view
  const view = window.mapView || window.sceneView;
  if (!view || !view.map) {
    console.error('Map view not found. Please make sure the map is loaded.');
    return;
  }
  
  console.log('Found map view');
  
  // Get all layers
  const allLayers = view.map.allLayers.toArray();
  
  // Find the Google Trends base layer
  const baseTrendsLayer = allLayers.find(layer => layer.id === 'googleTrends');
  if (!baseTrendsLayer) {
    console.error('Google Trends base layer not found');
    return;
  }
  
  console.log('Found Google Trends base layer');
  
  // Find all virtual Google Trends layers
  const virtualLayers = allLayers.filter(l => l.id && l.id.startsWith('googleTrends-'));
  console.log(`Found ${virtualLayers.length} virtual Google Trends layers`);
  
  // Get the layer states from any component that might store them
  let layerStatesRef = null;
  
  // Try to find the LayerController component to access its layerStates
  const findLayerStatesRef = () => {
    // Look for a global reference first (might be exposed for debugging)
    if (window.__layerStatesRef) {
      return window.__layerStatesRef;
    }
    
    // Look for components that might have it
    const possibleElements = document.querySelectorAll('[data-layer-controller]');
    if (possibleElements && possibleElements.length > 0) {
      // Found potential elements
      return null; // We can't access React component state directly
    }
    
    return null;
  };
  
  layerStatesRef = findLayerStatesRef();
  
  // STEP 1: Ensure base layer is properly configured
  if (baseTrendsLayer.type === 'feature') {
    // Ensure no restrictive definition expression
    if (baseTrendsLayer.definitionExpression === '1=0') {
      console.log('Fixing base layer definition expression');
      baseTrendsLayer.definitionExpression = '';
    }
    
    // Keep base layer invisible
    baseTrendsLayer.visible = false;
    baseTrendsLayer.opacity = 0.01;
    
    console.log('Base layer configured');
  }
  
  // STEP 2: Create or fix all virtual layers
  const fixedLayers = {};
  
  // Query the base layer to get field information
  const query = baseTrendsLayer.createQuery();
  query.where = "1=1";
  query.returnGeometry = true;
  query.outFields = ["*"];
  query.num = 1;
  
  baseTrendsLayer.queryFeatures(query).then(result => {
    if (result.features.length === 0) {
      console.error('Base layer has no features. Cannot create virtual layers.');
      return;
    }
    
    console.log('Retrieved sample feature from base layer');
    const sampleFeature = result.features[0];
    
    // Get all numeric fields that could be trend fields
    const trendFields = [];
    for (const key in sampleFeature.attributes) {
      if (typeof sampleFeature.attributes[key] === 'number' && 
          !['OBJECTID', 'FID', 'OID', 'ID'].includes(key) &&
          !key.includes('_ID') &&
          !key.includes('SHAPE')) {
        trendFields.push(key);
      }
    }
    
    console.log(`Found ${trendFields.length} potential trend fields:`, trendFields.join(', '));
    
    // Process virtual layers
    virtualLayers.forEach(layer => {
      const fieldName = layer.id.replace('googleTrends-', '');
      console.log(`\nProcessing virtual layer: ${layer.id} (Field: ${fieldName})`);
      
      // Check if this field exists in the base layer
      if (!trendFields.includes(fieldName)) {
        console.warn(`⚠️ Field "${fieldName}" not found in base layer attributes`);
      }
      
      // Add the layer to the map and make it visible
      if (!view.map.findLayerById(layer.id)) {
        console.log(`Layer ${layer.id} not in map, adding it`);
        view.map.add(layer);
      }
      
      // THE KEY FIX: Re-create proper class breaks renderer specifically for this field
      const renderer = {
        type: 'class-breaks',
        field: fieldName,
        defaultSymbol: {
          type: 'simple-fill',
          color: [200, 200, 200, 0.5],
          outline: { color: [150, 150, 150, 0.5], width: 0.5 }
        },
        classBreakInfos: [
          {
            minValue: 0,
            maxValue: 25,
            symbol: {
              type: 'simple-fill',
              color: [255, 255, 178, 0.7],
              outline: { color: [128, 128, 128, 0.5], width: 0.5 }
            }
          },
          {
            minValue: 25,
            maxValue: 50,
            symbol: {
              type: 'simple-fill',
              color: [254, 204, 92, 0.7],
              outline: { color: [128, 128, 128, 0.5], width: 0.5 }
            }
          },
          {
            minValue: 50, 
            maxValue: 75,
            symbol: {
              type: 'simple-fill',
              color: [253, 141, 60, 0.7],
              outline: { color: [128, 128, 128, 0.5], width: 0.5 }
            }
          },
          {
            minValue: 75,
            maxValue: 100,
            symbol: {
              type: 'simple-fill',
              color: [240, 59, 32, 0.7],
              outline: { color: [128, 128, 128, 0.5], width: 0.5 }
            }
          }
        ]
      };
      
      console.log(`Applying new renderer for field: ${fieldName}`);
      layer.renderer = renderer;
      
      // Make sure the layer is visible and has no restrictive definition expression
      layer.visible = true;
      layer.opacity = 1.0;
      layer.definitionExpression = '';
      
      console.log(`Refreshing layer: ${layer.id}`);
      if (typeof layer.refresh === 'function') {
        layer.refresh();
      }
      
      // Create a watch to monitor visibility changes and ensure renderer is maintained
      layer.watch('visible', (newValue) => {
        console.log(`Layer ${layer.id} visibility changed to ${newValue}`);
        
        // If becoming visible, ensure renderer is still properly set
        if (newValue === true) {
          if (!layer.renderer || layer.renderer.field !== fieldName) {
            console.log(`Reapplying renderer for ${layer.id}`);
            layer.renderer = renderer;
            
            if (typeof layer.refresh === 'function') {
              layer.refresh();
            }
          }
        }
      });
      
      fixedLayers[layer.id] = true;
    });
    
    // STEP 3: Create any missing virtual layers if needed
    for (const field of trendFields) {
      const expectedLayerId = `googleTrends-${field}`;
      
      // Check if we already processed this layer
      if (fixedLayers[expectedLayerId]) {
        continue;
      }
      
      // Check if the layer exists but wasn't in our initial list
      const existingLayer = view.map.findLayerById(expectedLayerId);
      if (existingLayer) {
        console.log(`Found additional layer ${expectedLayerId} that wasn't in initial list, fixing it`);
        
        // Apply the same fixes as above
        const renderer = {
          type: 'class-breaks',
          field: field,
          defaultSymbol: {
            type: 'simple-fill',
            color: [200, 200, 200, 0.5],
            outline: { color: [150, 150, 150, 0.5], width: 0.5 }
          },
          classBreakInfos: [
            {
              minValue: 0,
              maxValue: 25,
              symbol: {
                type: 'simple-fill',
                color: [255, 255, 178, 0.7],
                outline: { color: [128, 128, 128, 0.5], width: 0.5 }
              }
            },
            {
              minValue: 25,
              maxValue: 50,
              symbol: {
                type: 'simple-fill',
                color: [254, 204, 92, 0.7],
                outline: { color: [128, 128, 128, 0.5], width: 0.5 }
              }
            },
            {
              minValue: 50, 
              maxValue: 75,
              symbol: {
                type: 'simple-fill',
                color: [253, 141, 60, 0.7],
                outline: { color: [128, 128, 128, 0.5], width: 0.5 }
              }
            },
            {
              minValue: 75,
              maxValue: 100,
              symbol: {
                type: 'simple-fill',
                color: [240, 59, 32, 0.7],
                outline: { color: [128, 128, 128, 0.5], width: 0.5 }
              }
            }
          ]
        };
        
        existingLayer.renderer = renderer;
        existingLayer.visible = true;
        existingLayer.opacity = 1.0;
        existingLayer.definitionExpression = '';
        
        if (typeof existingLayer.refresh === 'function') {
          existingLayer.refresh();
        }
      }
    }
    
    console.log('\n✅ Google Trends Virtual Layer Fix Complete');
    console.log('The virtual layers should now display properly when toggled.');
    console.log('If you still experience issues, try refreshing the page and running this script again.');
  }).catch(error => {
    console.error('Error fixing Google Trends layers:', error);
  });
})();
