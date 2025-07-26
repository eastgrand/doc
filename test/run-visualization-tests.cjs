/**
 * Visualization Test Runner
 * 
 * This script runs tests on all visualization types to ensure they
 * work correctly and are properly recognized by the AI.
 */

import runTests from './visualization-test.js';
import { generateAllSampleData } from './sample-data-generator.js';
import { initializeLayerRegistry } from '../config/dynamic-layers';
import { layerRegistry } from '../config/dynamic-layers';

/**
 * Initialize a mock MapView for testing
 */
function createMockMapView() {
  // Create layers collection for the mock map
  const allLayers = {
    items: [],
    filter: function(callback) {
      return this.items.filter(callback);
    }
  };

  // Create a mock map
  const mockMap = {
    add: function(layer) {
      allLayers.items.push(layer);
    },
    remove: function(layer) {
      const index = allLayers.items.indexOf(layer);
      if (index >= 0) {
        allLayers.items.splice(index, 1);
      }
    },
    allLayers,
    findLayerById: function(id) {
      return allLayers.items.find(layer => layer.id === id) || null;
    }
  };

  // Create a mock MapView
  const mockView = {
    map: mockMap,
    ready: true,
    graphics: {
      add: function() {},
      remove: function() {},
      removeAll: function() {}
    },
    goTo: function() {
      return Promise.resolve();
    },
    popup: {
      open: function() {},
      close: function() {}
    }
  };

  return mockView;
}

/**
 * Setup the test environment
 */
async function setupTestEnvironment() {
  console.log("Setting up test environment...");
  
  // Generate sample data
  const sampleData = generateAllSampleData();
  
  // Create mock map view
  const mockMapView = createMockMapView();
  
  // Create test layer configs
  const testLayerConfigs = {
    "testPolygonLayer": {
      id: "testPolygonLayer",
      name: "Test Polygon Layer",
      description: "A test polygon layer for visualization testing",
      type: "virtual",
      geometryType: "Polygon",
      fields: sampleData.polygons.layerConfig.fields
    },
    "testPointLayer": {
      id: "testPointLayer",
      name: "Test Point Layer",
      description: "A test point layer for visualization testing",
      type: "virtual",
      geometryType: "Point",
      fields: sampleData.points.layerConfig.fields
    },
    "testNetworkLayer": {
      id: "testNetworkLayer",
      name: "Test Network Layer",
      description: "A test network layer for visualization testing",
      type: "virtual",
      geometryType: "Line",
      fields: sampleData.network.connections.layerConfig.fields
    }
  };
  
  // Initialize layer registry with test configs
  await initializeLayerRegistry(testLayerConfigs);
  
  // Register test data provider
  const testDataProvider = {
    getTestData: function(type) {
      switch(type) {
        case 'polygon':
          return sampleData.polygons;
        case 'point':
          return sampleData.points;
        case 'network':
          return {
            nodes: sampleData.network.nodes,
            connections: sampleData.network.connections
          };
        default:
          return sampleData.polygons;
      }
    }
  };
  
  // Return the setup environment
  return {
    mapView: mockMapView,
    sampleData,
    testDataProvider
  };
}

/**
 * Main function to run all tests
 */
async function main() {
  try {
    console.log("=== VISUALIZATION TESTING SUITE ===");
    console.log("Initializing test environment...");
    
    const env = await setupTestEnvironment();
    
    console.log("Running tests...");
    await runTests(env.mapView);
    
    console.log("\n=== TEST SUITE COMPLETED ===");
  } catch (error) {
    console.error("Error running test suite:", error);
  }
}

// Run the tests
main();

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = { main, setupTestEnvironment };
} 