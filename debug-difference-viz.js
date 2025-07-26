// Enhanced debug script for difference visualization rendering issues
// Run this in browser console after running a Nike vs Adidas query

console.log('=== DIFFERENCE VISUALIZATION RENDERING DEBUG ===');

// Try multiple ways to find the map view
let mapView = null;

// Method 1: Check window properties
mapView = window.mapView || window.__mapView || window.esriMapView;

// Method 2: Check if there's a React component with map view
if (!mapView) {
  const reactFiberKey = Object.keys(document.querySelector('#__next') || {}).find(key => key.startsWith('__reactFiber'));
  if (reactFiberKey) {
    console.log('Found React fiber, searching for map view...');
    // This is a more complex search through React internals
  }
}

// Method 3: Check Esri view containers
if (!mapView) {
  const esriContainer = document.querySelector('.esri-view');
  if (esriContainer && esriContainer.view) {
    mapView = esriContainer.view;
    console.log('Found map view in Esri container');
  }
}

console.log('Map view search results:', {
  windowMapView: !!window.mapView,
  window__mapView: !!window.__mapView,
  windowEsriMapView: !!window.esriMapView,
  foundMapView: !!mapView,
  esriContainers: document.querySelectorAll('.esri-view').length
});

if (!mapView) {
  console.error('No map view found. Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('map')));
  console.log('Try running this after the map has fully loaded, or check if the map view is stored differently.');
  console.log('Available Esri containers:', document.querySelectorAll('.esri-view'));
} else {
  console.log('✅ Map view found successfully');
  
  // List all layers with detailed information
  const layers = mapView.map.layers.toArray();
  console.log('📊 All layers in map:', layers.length);
  
  layers.forEach((layer, index) => {
    console.log(`Layer ${index}:`, {
      id: layer.id,
      title: layer.title,
      type: layer.type,
      visible: layer.visible,
      opacity: layer.opacity,
      sourceLength: layer.source?.length,
      rendererType: layer.renderer?.type,
      rendererField: layer.renderer?.field,
      extent: layer.fullExtent,
      minScale: layer.minScale,
      maxScale: layer.maxScale
    });
  });
  
  // Find difference visualization layers
  const diffLayers = layers.filter(l => 
    l.title?.includes('Nike') || 
    l.title?.includes('Adidas') || 
    l.title?.includes('Difference') ||
    l.title?.includes('vs') ||
    l.renderer?.field === 'difference_value'
  );
  
  console.log('🎯 Found potential difference layers:', diffLayers.length);
  
  if (diffLayers.length > 0) {
    diffLayers.forEach((layer, index) => {
      console.log(`🔍 Difference Layer ${index}:`, {
        title: layer.title,
        visible: layer.visible,
        opacity: layer.opacity,
        sourceCount: layer.source?.length,
        rendererType: layer.renderer?.type,
        rendererField: layer.renderer?.field
      });
      
      // Check renderer details
      if (layer.renderer?.type === 'class-breaks') {
        const renderer = layer.renderer;
        console.log('📈 Renderer details:', {
          field: renderer.field,
          classBreakInfos: renderer.classBreakInfos?.map(cb => ({
            minValue: cb.minValue,
            maxValue: cb.maxValue,
            label: cb.label,
            symbolColor: cb.symbol?.color
          }))
        });
      }
      
      // Check layer source data
      if (layer.source && layer.source.length > 0) {
        const sampleFeature = layer.source.getItemAt(0);
        console.log('📋 Sample feature:', {
          attributes: sampleFeature?.attributes,
          geometry: sampleFeature?.geometry ? {
            type: sampleFeature.geometry.type,
            hasCoordinates: !!(sampleFeature.geometry.x || sampleFeature.geometry.rings || sampleFeature.geometry.paths)
          } : null
        });
        
        // Check if features have the required fields
        const requiredFields = ['primary_value', 'secondary_value', 'difference_value'];
        const hasRequiredFields = requiredFields.every(field => 
          sampleFeature?.attributes?.hasOwnProperty(field)
        );
        
        console.log('🔧 Field validation:', {
          hasRequiredFields,
          availableFields: Object.keys(sampleFeature?.attributes || {}),
          requiredFields,
          fieldValues: requiredFields.reduce((acc, field) => {
            acc[field] = sampleFeature?.attributes?.[field];
            return acc;
          }, {})
        });
      }
      
      // Check if layer is within map extent
      if (layer.fullExtent && mapView.extent) {
        const layerExtent = layer.fullExtent;
        const mapExtent = mapView.extent;
        
        console.log('📐 Extent comparison:', {
          layerExtent: {
            xmin: layerExtent.xmin,
            ymin: layerExtent.ymin,
            xmax: layerExtent.xmax,
            ymax: layerExtent.ymax
          },
          mapExtent: {
            xmin: mapExtent.xmin,
            ymin: mapExtent.ymin,
            xmax: mapExtent.xmax,
            ymax: mapExtent.ymax
          },
          intersects: layerExtent.intersects(mapExtent)
        });
      }
    });
    
    // Try to fix common rendering issues
    console.log('🔧 Attempting to fix rendering issues...');
    
    diffLayers.forEach((layer, index) => {
      console.log(`Fixing layer ${index}:`, layer.title);
      
      // Force visibility
      if (!layer.visible) {
        layer.visible = true;
        console.log('✅ Set layer to visible');
      }
      
      // Ensure opacity is reasonable
      if (layer.opacity < 0.1) {
        layer.opacity = 0.8;
        console.log('✅ Increased layer opacity to 0.8');
      }
      
      // Clear any definition expression that might hide features
      if (layer.definitionExpression) {
        console.log('🗑️ Clearing definition expression:', layer.definitionExpression);
        layer.definitionExpression = '';
      }
      
      // Force refresh
      layer.refresh();
      console.log('🔄 Layer refreshed');
    });
    
    // Try to zoom to the layer extent
    if (diffLayers[0]?.fullExtent) {
      console.log('🎯 Zooming to layer extent...');
      mapView.goTo(diffLayers[0].fullExtent).then(() => {
        console.log('✅ Zoomed to layer extent');
      }).catch(err => {
        console.error('❌ Failed to zoom to layer extent:', err);
      });
    }
    
  } else {
    console.warn('⚠️ No difference layers found. The layer might not be created yet or might have a different title.');
  }
} 