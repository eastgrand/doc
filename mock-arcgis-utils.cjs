/**
 * Mock ArcGIS Utilities
 * 
 * This file provides mock implementations of ArcGIS objects for testing
 * visualization types without requiring an actual ArcGIS instance.
 */

/**
 * Create a mock feature layer
 * @param {Object} options - Layer configuration options
 * @returns {Object} Mock feature layer object
 */
function createMockFeatureLayer(options = {}) {
  return {
    id: options.id || 'mockLayer',
    title: options.title || 'Mock Layer',
    opacity: options.opacity !== undefined ? options.opacity : 0.8,
    visible: options.visible !== undefined ? options.visible : true,
    source: options.source || [],
    renderer: options.renderer || null,
    definitionExpression: options.definitionExpression || null,
    spatialReference: options.spatialReference || { wkid: 102100 },
    fields: options.fields || [],
    objectIdField: options.objectIdField || 'OBJECTID',
    geometryType: options.geometryType || 'polygon',
    featureReduction: options.featureReduction || null,
    popupTemplate: options.popupTemplate || null,
    elevationInfo: options.elevationInfo || null,
    
    // Mock methods
    queryFeatures: async () => {
      return { features: options.source || [] };
    },
    
    when: async () => {
      return Promise.resolve();
    }
  };
}

/**
 * Create a mock map view
 * @returns {Object} Mock map view object
 */
function createMockMapView() {
  const layers = [];
  
  return {
    map: {
      add: (layer) => {
        layers.push(layer);
        return layer;
      },
      remove: (layer) => {
        const index = layers.indexOf(layer);
        if (index !== -1) {
          layers.splice(index, 1);
        }
      },
      allLayers: {
        toArray: () => [...layers]
      },
      basemap: {
        title: 'mock-basemap'
      },
      ground: {
        surfaceColor: [0, 0, 0, 0]
      }
    },
    
    center: [0, 0],
    zoom: 10,
    scale: 50000,
    extent: {
      xmin: -180,
      ymin: -90,
      xmax: 180,
      ymax: 90,
      spatialReference: { wkid: 4326 },
      clone: function() { return {...this}; }
    },
    spatialReference: { wkid: 4326 },
    ui: { components: [] },
    
    graphics: {
      add: () => {},
      remove: () => {},
      removeAll: () => {}
    },
    
    goTo: async () => Promise.resolve(),
    hitTest: async () => Promise.resolve({ results: [] }),
    toMap: (screenPoint) => ({ x: screenPoint.x, y: screenPoint.y }),
    toScreen: (mapPoint) => ({ x: mapPoint.x, y: mapPoint.y })
  };
}

/**
 * Create a mock renderer (various types)
 * @param {string} type - Renderer type
 * @param {Object} options - Renderer options
 * @returns {Object} Mock renderer object
 */
function createMockRenderer(type, options = {}) {
  switch (type) {
    case 'simple':
      return {
        type: 'simple',
        symbol: options.symbol || {
          type: 'simple-fill',
          color: options.color || [0, 120, 255, 0.5],
          outline: options.outline || {
            color: [0, 0, 0, 0.5],
            width: 1
          }
        }
      };
      
    case 'class-breaks':
      return {
        type: 'class-breaks',
        field: options.field || 'value',
        classBreakInfos: options.classBreakInfos || [
          {
            minValue: 0,
            maxValue: 25,
            symbol: {
              type: 'simple-fill',
              color: [240, 240, 240, 0.5]
            }
          },
          {
            minValue: 25,
            maxValue: 50,
            symbol: {
              type: 'simple-fill',
              color: [190, 190, 240, 0.5]
            }
          },
          {
            minValue: 50,
            maxValue: 75,
            symbol: {
              type: 'simple-fill',
              color: [140, 140, 240, 0.5]
            }
          },
          {
            minValue: 75,
            maxValue: 100,
            symbol: {
              type: 'simple-fill',
              color: [80, 80, 240, 0.5]
            }
          }
        ]
      };
      
    case 'unique-value':
      return {
        type: 'unique-value',
        field: options.field || 'category',
        uniqueValueInfos: options.uniqueValueInfos || [
          {
            value: 'A',
            symbol: {
              type: 'simple-fill',
              color: [240, 100, 100, 0.5]
            }
          },
          {
            value: 'B',
            symbol: {
              type: 'simple-fill',
              color: [100, 240, 100, 0.5]
            }
          },
          {
            value: 'C',
            symbol: {
              type: 'simple-fill',
              color: [100, 100, 240, 0.5]
            }
          }
        ]
      };
      
    case 'heatmap':
      return {
        type: 'heatmap',
        field: options.field || 'value',
        blurRadius: options.blurRadius || 10,
        maxPixelIntensity: options.maxPixelIntensity || 100,
        minPixelIntensity: options.minPixelIntensity || 0
      };
      
    default:
      return {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [0, 120, 255, 0.5]
        }
      };
  }
}

/**
 * Create mock visualization result
 * @param {Object} options - Visualization result options
 * @returns {Object} Mock visualization result
 */
function createMockVisualizationResult(options = {}) {
  const layer = createMockFeatureLayer({
    id: options.id || 'mockLayer',
    title: options.title || 'Mock Visualization',
    renderer: options.renderer || createMockRenderer('simple'),
    source: options.source || [],
    definitionExpression: options.definitionExpression || null,
    featureReduction: options.featureReduction || null,
    popupTemplate: options.popupTemplate || null,
    visible: options.visible !== undefined ? options.visible : true,
    opacity: options.opacity || 0.8
  });
  
  return {
    layer,
    extent: options.extent || {
      xmin: -180, ymin: -90, xmax: 180, ymax: 90,
      spatialReference: { wkid: 4326 }
    },
    legendInfo: options.legendInfo || {
      title: options.title || 'Mock Visualization',
      type: options.legendType || 'default',
      items: options.legendItems || [
        { label: 'Label 1', color: [255, 0, 0, 0.5], shape: 'square' },
        { label: 'Label 2', color: [0, 255, 0, 0.5], shape: 'square' },
        { label: 'Label 3', color: [0, 0, 255, 0.5], shape: 'square' }
      ]
    },
    additionalLayers: options.additionalLayers || []
  };
}

// Export the mock utilities
module.exports = {
  createMockFeatureLayer,
  createMockMapView,
  createMockRenderer,
  createMockVisualizationResult
}; 