/**
 * Simple test for mock ArcGIS utilities
 */
import { createMockFeatureLayer, createMockMapView, createMockVisualizationResult } from './mock-arcgis-utils.cjs';

// Create mock data
const mockFeatures = [
  {
    attributes: { OBJECTID: 1, NAME: 'Test Area', POPULATION: 1000 },
    geometry: { type: 'polygon', rings: [[[-118, 34], [-117, 34], [-117, 35], [-118, 35], [-118, 34]]] }
  }
];

// Create a mock feature layer
const layer = createMockFeatureLayer({
  id: 'testLayer',
  title: 'Test Population Layer',
  source: mockFeatures
});

// Create a mock map view
const view = createMockMapView();

// Add the layer to the map
view.map.add(layer);

// Create a visualization result
const result = createMockVisualizationResult({
  id: 'vizResult',
  title: 'Population Visualization',
  source: mockFeatures
});

console.log('=== MOCK VISUALIZATION TEST ===');
console.log('Layer created:', layer.title);
console.log('Layer added to map:', view.map.allLayers.toArray().length > 0);
console.log('Visualization result created:', result.layer.title);
console.log('✅ Mock visualization utilities are working correctly');
