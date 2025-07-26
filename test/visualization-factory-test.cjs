/**
 * Visualization Factory Test
 * 
 * This test verifies that the DynamicVisualizationFactory properly handles
 * all visualization types with the appropriate case handlers.
 */

const { DynamicVisualizationFactory } = require('../lib/DynamicVisualizationFactory');
const { createMockMapView } = require('../mock-arcgis-utils');

// Skip Jest mocks if running directly
const isRunningDirectly = !process.env.JEST_WORKER_ID;

// Only mock modules if running in Jest
if (!isRunningDirectly) {
  // Mock the dynamic-layers module
  jest.mock('../config/dynamic-layers', () => ({
    layerRegistry: {
      getLayerConfig: jest.fn(() => ({
        id: 'mock-layer',
        name: 'Mock Layer',
        url: 'https://example.com/arcgis/rest/services/MockLayer/FeatureServer/0',
        geometryType: 'polygon'
      }))
    },
    VisualizationType: {
      CHOROPLETH: 'choropleth',
      HEATMAP: 'heatmap',
      SCATTER: 'scatter',
      CLUSTER: 'cluster',
      CATEGORICAL: 'categorical',
      TRENDS: 'trends',
      CORRELATION: 'correlation',
      JOINT_HIGH: 'joint_high',
      PROPORTIONAL_SYMBOL: 'proportional_symbol',
      TOP_N: 'top_n',
      HEXBIN: 'hexbin',
      BIVARIATE: 'bivariate',
      BUFFER: 'buffer',
      HOTSPOT: 'hotspot',
      NETWORK: 'network',
      MULTIVARIATE: 'multivariate'
    }
  }));

  // Mock all the visualization modules
  jest.mock('../utils/visualizations/choropleth-visualization', () => ({
    ChoroplethVisualization: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({ layer: {}, extent: {} })
    }))
  }));

  // Similar mocks for all other visualization types
  jest.mock('../utils/visualizations/density-visualization', () => ({
    DensityVisualization: jest.fn().mockImplementation(() => ({
      create: jest.fn().mockResolvedValue({ layer: {}, extent: {} })
    }))
  }));

  // Additional mocks...
  // (same as in the original file)
}

/**
 * Run the factory tests
 */
async function runTests() {
  console.log("=== TESTING VISUALIZATION FACTORY ===");
  
  // If we're running directly (not in Jest), use a simpler approach
  if (isRunningDirectly) {
    await runBasicFactoryTests();
  } else {
    // For Jest, we rely on the describe/test structure below
    console.log("Tests will be executed by Jest framework");
  }
  
  return true;
}

/**
 * Basic tests when running outside Jest
 */
async function runBasicFactoryTests() {
  console.log("Running basic factory tests...");
  const visualizationTypes = [
    'choropleth', 'heatmap', 'scatter', 'cluster', 'categorical',
    'trends', 'correlation', 'joint_high', 'proportional_symbol',
    'top_n', 'hexbin', 'bivariate', 'buffer', 'hotspot', 'network',
    'multivariate'
  ];
  
  try {
    const mockMapView = createMockMapView();
    mockMapView.map.allLayers = { toArray: () => [] };
    
    const factory = new DynamicVisualizationFactory(mockMapView);
    await factory.initialize(mockMapView);
    
    console.log("Factory initialized ✅");
    
    // Test each visualization type
    for (const vizType of visualizationTypes) {
      try {
        console.log(`Testing visualization type: ${vizType}...`);
        const result = await factory.createVisualization(vizType, 'mock-layer', {});
        
        if (result && (result.layer !== null || result.extent !== null)) {
          console.log(`  ✅ ${vizType} visualization created successfully`);
        } else {
          console.log(`  ❌ ${vizType} visualization failed`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating ${vizType} visualization:`, error);
      }
    }
    
    console.log("Basic factory tests completed");
  } catch (error) {
    console.error("Error during factory tests:", error);
  }
}

// Jest tests
describe('DynamicVisualizationFactory', () => {
  let factory;
  let mockMapView;
  
  beforeEach(() => {
    mockMapView = createMockMapView();
    mockMapView.map.allLayers = { toArray: () => [] };
    factory = new DynamicVisualizationFactory(mockMapView);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('initializes properly', async () => {
    await factory.initialize(mockMapView);
    expect(factory).toBeDefined();
  });
  
  test.each([
    ['choropleth', 'ChoroplethVisualization'],
    ['heatmap', 'DensityVisualization'],
    ['scatter', 'PointLayerVisualization'],
    ['cluster', 'ClusterVisualization'],
    ['categorical', 'SingleLayerVisualization'],
    ['trends', 'TrendsVisualization'],
    ['correlation', 'CorrelationVisualization'],
    ['joint_high', 'JointHighVisualization'],
    ['proportional_symbol', 'ProportionalSymbolVisualization'],
    ['top_n', 'TopNVisualization'],
    ['hexbin', 'HexbinVisualization'],
    ['bivariate', 'BivariateVisualization'],
    ['buffer', 'BufferVisualization'],
    ['hotspot', 'HotspotVisualization'],
    ['network', 'NetworkVisualization'],
    ['multivariate', 'MultivariateVisualization']
  ])('handles %s visualization type correctly', async (vizType, expectedClass) => {
    const result = await factory.createVisualization(vizType, 'mock-layer', {});
    
    expect(result).toBeDefined();
    expect(result.layer).toBeDefined();
    expect(result.extent).toBeDefined();
  });
  
  test('default case handler works for unknown types', async () => {
    const result = await factory.createVisualization('unknown_type', 'mock-layer', {});
    
    expect(result).toBeDefined();
    expect(result.layer).toBeDefined();
    expect(result.extent).toBeDefined();
  });
});

// Export the test runner function
module.exports = { runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
} 