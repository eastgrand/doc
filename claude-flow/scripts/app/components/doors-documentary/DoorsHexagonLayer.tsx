
import React from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

interface DoorsHexagonLayerProps {
  mapView: __esri.MapView;
  visible?: boolean;
}

export const DoorsHexagonLayer: React.FC<DoorsHexagonLayerProps> = ({ mapView, visible = true }) => {
  React.useEffect(() => {
    const layer = new FeatureLayer({
      title: 'DoorsHexagonLayer',
      visible,
      // Layer configuration for Doors Documentary analysis
    });
    
    mapView.map.add(layer);
    
    return () => {
      mapView.map.remove(layer);
    };
  }, [mapView, visible]);
  
  return null; // This is a map layer component
};
