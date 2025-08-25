// Map Constraints Configuration
// Updated on 2025-08-25 for Red Bull Energy Drinks California project
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

// California project extent with 10% buffer to prevent panning outside data area
export const MAP_CONSTRAINTS: MapConstraintsConfig = {
  geometry: {
    xmin: -14080000,  // California west bound with buffer
    ymin: 3750000,    // California south bound with buffer  
    xmax: -12500000,  // California east bound with buffer
    ymax: 5280000,    // California north bound with buffer
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

// California data extent (without buffer) for reference
export const DATA_EXTENT = {
  xmin: -13880000,  // California west bound (~-124.7°)
  ymin: 3850000,    // California south bound (~32.5°)
  xmax: -12700000,  // California east bound (~-114.1°) 
  ymax: 5160000,    // California north bound (~42.0°)
  spatialReference: {
    wkid: 102100
  }
};

// Helper function to apply constraints to a MapView
// Note: No constraints applied - allows unlimited panning and zooming
export function applyMapConstraints(view: __esri.MapView): void {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return;
  }
  
  // Remove all constraints to allow unlimited panning and zooming
  view.constraints = null;
  
  console.log('[MapConstraints] Removed all map constraints - unlimited panning and zoom enabled');
}

// Helper function to zoom to data extent
export function zoomToDataExtent(view: __esri.MapView, options?: any): Promise<any> {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return Promise.resolve();
  }
  
  // Create proper Extent object for zoom
  const dataExtent = {
    type: "extent" as const,
    xmin: DATA_EXTENT.xmin,
    ymin: DATA_EXTENT.ymin,
    xmax: DATA_EXTENT.xmax,
    ymax: DATA_EXTENT.ymax,
    spatialReference: DATA_EXTENT.spatialReference
  };
  
  return view.goTo(dataExtent, {
    duration: 1000,
    easing: 'ease-in-out',
    ...options
  });
}
