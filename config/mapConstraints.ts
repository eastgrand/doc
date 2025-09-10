// Map Constraints Configuration
// Updated for Quebec Housing Market project
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

// Quebec project extent with buffer to prevent panning outside data area
export const MAP_CONSTRAINTS: MapConstraintsConfig = {
  geometry: {
    xmin: -8700000,   // Quebec west bound with buffer (~-78°)
    ymin: 5800000,    // Quebec south bound with buffer (~45.5°)  
    xmax: -7400000,   // Quebec east bound with buffer (~-66.5°)
    ymax: 6700000,    // Quebec north bound with buffer (~54.5°)
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

// Quebec data extent (without buffer) for reference
export const DATA_EXTENT = {
  xmin: -8600000,   // Quebec west bound (~-77.2°)
  ymin: 5900000,    // Quebec south bound (~45.8°)
  xmax: -7500000,   // Quebec east bound (~-67.4°) 
  ymax: 6600000,    // Quebec north bound (~54.2°)
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
  view.constraints = {
    // Empty constraints object allows unlimited panning and zooming
  };
  
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
