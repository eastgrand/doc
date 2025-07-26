#!/bin/bash
# Test script for visualization implementations

echo "=================================================="
echo "TESTING VISUALIZATION IMPLEMENTATIONS"
echo "=================================================="

# Create a test script file
cat > visualization-test.js << 'EOF'
/**
 * Test script for visualization implementations
 * 
 * This script tests the functionality of our visualization classes
 */

import { SingleLayerVisualization, VisualizationType } from './utils/visualizations/single-layer-visualization.js';
import { JointHighVisualization } from './utils/visualizations/joint-visualization.js';
import { OverlayVisualization } from './utils/visualizations/overlay-visualization.js';
import { SpiderVisualization } from './utils/visualizations/spider-visualization.js';
import { TrendsCorrelationVisualization } from './utils/visualizations/trends-correlation-visualization.js';

console.log('================================================');
console.log('TESTING VISUALIZATION IMPLEMENTATIONS');
console.log('================================================');

// Mock features for testing
const mockFeatures = [
  {
    attributes: {
      OBJECTID: 1,
      NAME: 'Area A',
      EXERCISE_INDEX: 85,
      POPULATION: 15000
    },
    geometry: {
      type: 'polygon',
      rings: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    }
  },
  {
    attributes: {
      OBJECTID: 2,
      NAME: 'Area B',
      EXERCISE_INDEX: 72,
      POPULATION: 12000
    },
    geometry: {
      type: 'polygon',
      rings: [[[1, 0], [1, 1], [2, 1], [2, 0], [1, 0]]]
    }
  },
  {
    attributes: {
      OBJECTID: 3,
      NAME: 'Area C',
      EXERCISE_INDEX: 45,
      POPULATION: 9000
    },
    geometry: {
      type: 'polygon',
      rings: [[[0, 1], [0, 2], [1, 2], [1, 1], [0, 1]]]
    }
  }
];

// Mock center point for spider visualization
const mockCenterPoint = { x: 1, y: 1 };

// Test results
const testResults = {
  singleLayer: false,
  jointHigh: false,
  overlay: false,
  spider: false,
  trendsCorrelation: false
};

/**
 * Test single layer visualization
 */
async function testSingleLayerVisualization() {
  console.log('=== Testing Single Layer Visualization ===');
  try {
    const viz = new SingleLayerVisualization();
    
    // Test creating renderers for different visualization types
    for (const type of Object.values(VisualizationType)) {
      console.log(`Testing ${type} visualization...`);
      const renderer = viz.createRenderer({
        type,
        features: mockFeatures,
        field: 'EXERCISE_INDEX'
      });
      
      console.log(`✅ ${type} renderer created successfully`);
      console.log(`Renderer type: ${renderer.type}`);
    }
    
    // Test renderer optimization
    const renderer = viz.createRenderer({
      type: VisualizationType.CHOROPLETH,
      features: mockFeatures,
      field: 'EXERCISE_INDEX'
    });
    
    const optimizedRenderer = viz.optimizeRenderer(renderer, 15000);
    console.log('✅ Renderer optimization successful');
    if (optimizedRenderer.featureReduction) {
      console.log(`Feature reduction applied: ${optimizedRenderer.featureReduction.type}`);
    }
    
    testResults.singleLayer = true;
    console.log('✅ SingleLayerVisualization tests passed');
  } catch (error) {
    console.log(`❌ SingleLayerVisualization error: ${error}`);
    console.error(error);
  }
}

/**
 * Test joint high visualization
 */
async function testJointVisualization() {
  console.log('=== Testing Joint High Visualization ===');
  try {
    const viz = new JointHighVisualization();
    
    // Test creating renderer
    const renderer = viz.createRenderer({
      features: mockFeatures,
      primaryField: 'EXERCISE_INDEX',
      secondaryField: 'POPULATION'
    });
    
    console.log('✅ Joint visualization renderer created successfully');
    console.log(`Renderer type: ${renderer.type}`);
    
    // Test correlation calculation
    const correlation = viz.calculateCorrelation(
      mockFeatures, 
      'EXERCISE_INDEX', 
      'POPULATION'
    );
    
    console.log(`✅ Correlation calculated: ${correlation.toFixed(2)}`);
    
    testResults.jointHigh = true;
    console.log('✅ JointHighVisualization tests passed');
  } catch (error) {
    console.log(`❌ JointHighVisualization error: ${error}`);
    console.error(error);
  }
}

/**
 * Test overlay visualization
 */
async function testOverlayVisualization() {
  console.log('=== Testing Overlay Visualization ===');
  try {
    const viz = new OverlayVisualization();
    
    // Test creating renderer
    const renderer = viz.createRenderer({
      features: mockFeatures,
      field: 'EXERCISE_INDEX',
      overlayOptions: {
        opacity: 0.7
      }
    });
    
    console.log('✅ Overlay visualization renderer created successfully');
    console.log(`Renderer type: ${renderer.type}`);
    
    // Test combined renderer
    const renderers = [
      renderer,
      {
        type: 'simple',
        symbol: { type: 'simple-marker', color: 'red' }
      }
    ];
    
    const combinedRenderer = viz.createCombinedRenderer(renderers);
    console.log('✅ Combined renderer created successfully');
    
    testResults.overlay = true;
    console.log('✅ OverlayVisualization tests passed');
  } catch (error) {
    console.log(`❌ OverlayVisualization error: ${error}`);
    console.error(error);
  }
}

/**
 * Test spider visualization
 */
async function testSpiderVisualization() {
  console.log('=== Testing Spider Visualization ===');
  try {
    const viz = new SpiderVisualization();
    
    // Test creating renderer
    const renderer = viz.createRenderer({
      features: mockFeatures,
      centerPoint: mockCenterPoint,
      field: 'EXERCISE_INDEX'
    });
    
    console.log('✅ Spider visualization renderer created successfully');
    console.log(`Renderer type: ${renderer.type}`);
    
    // Test creating spider lines
    const spiderLines = viz.createSpiderLines(
      mockCenterPoint,
      mockFeatures.map(f => ({
        ...f,
        geometry: { x: f.geometry.rings[0][0][0], y: f.geometry.rings[0][0][1] }
      }))
    );
    
    console.log(`✅ Spider lines created: ${spiderLines.length}`);
    
    testResults.spider = true;
    console.log('✅ SpiderVisualization tests passed');
  } catch (error) {
    console.log(`❌ SpiderVisualization error: ${error}`);
    console.error(error);
  }
}

/**
 * Test trends correlation visualization
 */
async function testTrendsCorrelationVisualization() {
  console.log('=== Testing Trends Correlation Visualization ===');
  try {
    const viz = new TrendsCorrelationVisualization();
    
    // Add time field to features for trends analysis
    const featuresWithTime = mockFeatures.map((f, i) => ({
      ...f,
      attributes: {
        ...f.attributes,
        TIME_PERIOD: 2020 + i
      }
    }));
    
    // Test creating trends renderer
    const trendsRenderer = viz.createTrendsRenderer({
      features: featuresWithTime,
      field: 'EXERCISE_INDEX',
      timeField: 'TIME_PERIOD'
    });
    
    console.log('✅ Trends visualization renderer created successfully');
    console.log(`Renderer type: ${trendsRenderer.type}`);
    
    // Test creating correlation renderer
    const correlationRenderer = viz.createCorrelationRenderer({
      features: mockFeatures,
      field1: 'EXERCISE_INDEX',
      field2: 'POPULATION'
    });
    
    console.log('✅ Correlation visualization renderer created successfully');
    console.log(`Renderer type: ${correlationRenderer.type}`);
    
    // Test trends analysis
    const trendsAnalysis = viz.analyzeTrends(
      featuresWithTime,
      'EXERCISE_INDEX',
      'TIME_PERIOD'
    );
    
    console.log('✅ Trends analysis completed');
    console.log(`Time periods analyzed: ${trendsAnalysis.timeStats.length}`);
    
    testResults.trendsCorrelation = true;
    console.log('✅ TrendsCorrelationVisualization tests passed');
  } catch (error) {
    console.log(`❌ TrendsCorrelationVisualization error: ${error}`);
    console.error(error);
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  await testSingleLayerVisualization();
  await testJointVisualization();
  await testOverlayVisualization();
  await testSpiderVisualization();
  await testTrendsCorrelationVisualization();
  
  console.log('\n================================================');
  console.log('TEST SUMMARY');
  console.log('================================================');
  console.log(`singleLayer: ${testResults.singleLayer ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`jointHigh: ${testResults.jointHigh ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`overlay: ${testResults.overlay ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`spider: ${testResults.spider ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`trendsCorrelation: ${testResults.trendsCorrelation ? '✅ PASS' : '❌ FAIL'}`);
  console.log('------------------------------------------------');
  
  const passedCount = Object.values(testResults).filter(r => r).length;
  const totalCount = Object.values(testResults).length;
  
  console.log(`Total Tests: ${totalCount}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${totalCount - passedCount}`);
  console.log('================================================');
  
  if (passedCount === totalCount) {
    console.log('✅ ALL TESTS PASSED - Ready for production use');
  } else {
    console.log('❌ SOME TESTS FAILED - Fix issues before live testing');
  }
}

// Run the tests
runAllTests();
EOF

# Run the test script
echo "Running visualization implementation tests..."
node visualization-test.js

# Check if the test was successful
if [ $? -eq 0 ]; then
  echo "✅ Visualization implementation tests completed successfully"
else
  echo "❌ Visualization implementation tests failed"
fi
