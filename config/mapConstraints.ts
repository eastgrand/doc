// Map Constraints Configuration
// Auto-generated on 2025-08-13T14:54:02.245Z
// This file defines geographic constraints to prevent panning outside project area

export interface MapConstraintsConfig {
  geometry: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
    };
  };
  minZoom?: number;
  maxZoom?: number;
  snapToZoom?: boolean;
  rotationEnabled?: boolean;
}

// Project extent with 10% buffer to prevent panning outside data area
export const MAP_CONSTRAINTS: MapConstraintsConfig = {
  geometry: {
    xmin: -9840080,
    ymin: 2735437,
    xmax: -8824400,
    ymax: 3714457,
    spatialReference: {
      wkid: 102100
    }
  },
  // No zoom restrictions - users can zoom in/out freely
  minZoom: undefined,
  maxZoom: undefined,
  snapToZoom: false,
  rotationEnabled: false // Typically disabled for data analysis applications
};

// Original data extent (without buffer) for reference
export const DATA_EXTENT = {
  xmin: -9755440,
  ymin: 2817022,
  xmax: -8909040,
  ymax: 3632872,
  spatialReference: {
    wkid: 102100
  }
};

// Helper function to apply constraints to a MapView
export function applyMapConstraints(view: __esri.MapView): void {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return;
  }
  
  view.constraints = {
    geometry: MAP_CONSTRAINTS.geometry,
    minZoom: MAP_CONSTRAINTS.minZoom,
    maxZoom: MAP_CONSTRAINTS.maxZoom,
    snapToZoom: MAP_CONSTRAINTS.snapToZoom,
    rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
  };
  
  console.log('[MapConstraints] Applied geographic constraints to MapView', {
    extent: MAP_CONSTRAINTS.geometry,
    rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
  });
}

// Helper function to zoom to data extent
export function zoomToDataExtent(view: __esri.MapView, options?: __esri.MapViewGoToOptions): Promise<any> {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return Promise.resolve();
  }
  
  return view.goTo(DATA_EXTENT, {
    duration: 1000,
    easing: 'ease-in-out',
    ...options
  });
}
