
import React from 'react';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

interface TheaterLocationLayerProps {
  mapView: __esri.MapView;
  visible?: boolean;
}

export const TheaterLocationLayer: React.FC<TheaterLocationLayerProps> = ({ mapView, visible = true }) => {
  React.useEffect(() => {
    const layer = new FeatureLayer({
      title: 'TheaterLocationLayer',
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
