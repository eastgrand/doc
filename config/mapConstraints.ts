// Map Constraints Configuration
// Auto-generated on 2025-08-13T15:05:19.029Z
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
// Note: This only constrains panning boundaries, does not change initial map center
export function applyMapConstraints(view: __esri.MapView): void {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return;
  }
  
  try {
    console.log('[MapConstraints] Applying feature service extent constraints...');
    
    // Use proper ArcGIS constraint format with spatial reference
    view.constraints = {
      geometry: {
        type: "extent",
        xmin: MAP_CONSTRAINTS.geometry.xmin,
        ymin: MAP_CONSTRAINTS.geometry.ymin,
        xmax: MAP_CONSTRAINTS.geometry.xmax,
        ymax: MAP_CONSTRAINTS.geometry.ymax,
        spatialReference: {
          wkid: MAP_CONSTRAINTS.geometry.spatialReference.wkid
        }
      },
      rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
    };
    
    console.log('[MapConstraints] Applied constraints to feature service extents:', {
      extent: MAP_CONSTRAINTS.geometry,
      rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
    });
    
  } catch (error) {
    console.error('[MapConstraints] Failed to apply constraints:', error);
  }
}

// Helper function to zoom to data extent
export async function zoomToDataExtent(view: __esri.MapView, options?: any): Promise<any> {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return Promise.resolve();
  }
  
  try {
    // Dynamically import ArcGIS classes
    const { loadArcGISModules } = await import('@/lib/arcgis-imports');
    const { Extent, SpatialReference } = await loadArcGISModules();
    
    // Create proper SpatialReference object
    const spatialRef = new SpatialReference({
      wkid: DATA_EXTENT.spatialReference.wkid
    });
    
    // Create proper ArcGIS Extent object for zoom
    const dataExtent = new Extent({
      xmin: DATA_EXTENT.xmin,
      ymin: DATA_EXTENT.ymin,
      xmax: DATA_EXTENT.xmax,
      ymax: DATA_EXTENT.ymax,
      spatialReference: spatialRef
    });
    
    return view.goTo(dataExtent, {
      duration: 1000,
      easing: 'ease-in-out',
      ...options
    });
  } catch (error) {
    console.error('[MapConstraints] Failed to zoom to data extent:', error);
    return Promise.resolve();
  }
}
