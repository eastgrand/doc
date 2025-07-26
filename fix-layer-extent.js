// Quick fix script to set extent for difference visualization layer
// Run this in browser console if the layer has no extent

console.log('🔧 FIXING LAYER EXTENT...');

const mapView = window.mapView;
if (!mapView) {
  console.error('❌ Map view not found');
} else {
  // Find the difference layer
  const layers = mapView.map.layers.toArray();
  const diffLayer = layers.find(l => 
    l.title?.includes('Compare Nike vs Adidas') ||
    l.renderer?.field === 'difference_value'
  );
  
  if (!diffLayer) {
    console.error('❌ Difference layer not found');
  } else {
    console.log('✅ Found difference layer:', diffLayer.title);
    
    if (diffLayer.source && diffLayer.source.length > 0) {
      console.log('📊 Calculating extent from', diffLayer.source.length, 'features');
      
      let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
      
      // Calculate extent from all features
      diffLayer.source.forEach(graphic => {
        if (graphic.geometry && graphic.geometry.extent) {
          const extent = graphic.geometry.extent;
          xmin = Math.min(xmin, extent.xmin);
          ymin = Math.min(ymin, extent.ymin);
          xmax = Math.max(xmax, extent.xmax);
          ymax = Math.max(ymax, extent.ymax);
        }
      });
      
      if (isFinite(xmin) && isFinite(ymin) && isFinite(xmax) && isFinite(ymax)) {
        // Create extent object
        const extent = {
          xmin, ymin, xmax, ymax,
          spatialReference: { wkid: 102100 }
        };
        
        console.log('📐 Calculated extent:', extent);
        
        // Set the extent on the layer
        diffLayer.set('fullExtent', extent);
        
        console.log('✅ Layer extent set successfully');
        
        // Force refresh
        diffLayer.refresh();
        
        // Zoom to the layer
        mapView.goTo(extent, {
          duration: 2000
        }).then(() => {
          console.log('✅ Zoomed to layer extent');
        }).catch(err => {
          console.error('❌ Failed to zoom:', err);
        });
        
      } else {
        console.error('❌ Could not calculate valid extent');
      }
    } else {
      console.error('❌ No features found in layer');
    }
  }
}

console.log('🔧 EXTENT FIX COMPLETE'); 