/**
 * New Visualization Types Test
 * 
 * This script specifically tests the new visualization types
 * that were recently added to the system.
 */

const { generatePolygonSampleData, generatePointSampleData, generateNetworkData } = require('./sample-data-generator');

/**
 * Test the TopN visualization type
 */
async function testTopNVisualization() {
  console.log("\n=== Testing TOP_N Visualization ===");
  
  try {
    const { TopNVisualization } = require('../utils/visualizations/top-n-visualization');
    const topN = new TopNVisualization();
    const data = generatePolygonSampleData(100);
    
    // Test with default options
    const options = {
      n: 10,
      field: 'income',
      title: 'Top 10 Regions by Income',
      opacity: 0.8
    };
    
    console.log("  Creating visualization with options:", options);
    const result = await topN.create(data, options);
    
    // Check basic result properties
    console.log("  Checking result properties...");
    console.log(`    Layer: ${result.layer ? '✅ Present' : '❌ Missing'}`);
    console.log(`    Extent: ${result.extent ? '✅ Present' : '❌ Missing'}`);
    
    // Check top N specific properties
    if (result.layer && result.layer.definitionExpression) {
      console.log(`    Definition Expression: ✅ Present`);
    } else {
      console.log(`    Definition Expression: ❌ Missing`);
    }
    
    // Check renderer
    if (result.layer && result.layer.renderer) {
      console.log(`    Renderer: ✅ Present`);
    } else {
      console.log(`    Renderer: ❌ Missing`);
    }
    
    // Check legend
    if (result.legendInfo && result.legendInfo.items && result.legendInfo.items.length > 0) {
      console.log(`    Legend: ✅ Present`);
    } else {
      console.log(`    Legend: ❌ Missing`);
    }
    
    return result.layer !== null;
  } catch (error) {
    console.error(`  ❌ Error testing TOP_N visualization:`, error);
    return false;
  }
}

/**
 * Test the HexBin visualization type
 */
async function testHexbinVisualization() {
  console.log("\n=== Testing HEXBIN Visualization ===");
  
  try {
    const { HexbinVisualization } = require('../utils/visualizations/hexbin-visualization');
    const hexbin = new HexbinVisualization();
    const data = generatePointSampleData(300);
    
    // Test with default options
    const options = {
      cellSize: 10000,
      valueField: 'value',
      title: 'Point Density Hexbins',
      opacity: 0.8
    };
    
    console.log("  Creating visualization with options:", options);
    const result = await hexbin.create(data, options);
    
    // Check basic result properties
    console.log("  Checking result properties...");
    console.log(`    Layer: ${result.layer ? '✅ Present' : '❌ Missing'}`);
    console.log(`    Extent: ${result.extent ? '✅ Present' : '❌ Missing'}`);
    
    // Check hexbin specific properties - should have hexagon geometries
    const hasHexagons = result.layer && 
                       result.layer.source && 
                       result.layer.source.length > 0 && 
                       result.layer.source[0].geometry && 
                       (result.layer.source[0].geometry.type === 'polygon' || 
                        result.layer.source[0].geometry.rings);
    
    console.log(`    Hexagon geometries: ${hasHexagons ? '✅ Present' : '❌ Missing or wrong type'}`);
    
    // Check renderer
    if (result.layer && result.layer.renderer) {
      console.log(`    Renderer: ✅ Present`);
    } else {
      console.log(`    Renderer: ❌ Missing`);
    }
    
    return result.layer !== null;
  } catch (error) {
    console.error(`  ❌ Error testing HEXBIN visualization:`, error);
    return false;
  }
}

/**
 * Test the Buffer visualization type
 */
async function testBufferVisualization() {
  console.log("\n=== Testing BUFFER Visualization ===");
  
  try {
    const { BufferVisualization } = require('../utils/visualizations/buffer-visualization');
    const buffer = new BufferVisualization();
    const data = generatePointSampleData(50);
    
    // Test with default options
    const options = {
      distance: 5000, // 5km
      unit: 'meters',
      title: 'Buffer Zones',
      opacity: 0.6
    };
    
    console.log("  Creating visualization with options:", options);
    const result = await buffer.create(data, options);
    
    // Check basic result properties
    console.log("  Checking result properties...");
    console.log(`    Layer: ${result.layer ? '✅ Present' : '❌ Missing'}`);
    console.log(`    Extent: ${result.extent ? '✅ Present' : '❌ Missing'}`);
    
    // Buffer should create polygon geometries
    const hasPolygons = result.layer && 
                       result.layer.source && 
                       result.layer.source.length > 0 && 
                       result.layer.source[0].geometry && 
                       (result.layer.source[0].geometry.type === 'polygon' || 
                        result.layer.source[0].geometry.rings);
    
    console.log(`    Buffer polygons: ${hasPolygons ? '✅ Present' : '❌ Missing or wrong type'}`);
    
    return result.layer !== null;
  } catch (error) {
    console.error(`  ❌ Error testing BUFFER visualization:`, error);
    return false;
  }
}

/**
 * Test the Hotspot visualization type
 */
async function testHotspotVisualization() {
  console.log("\n=== Testing HOTSPOT Visualization ===");
  
  try {
    const { HotspotVisualization } = require('../utils/visualizations/hotspot-visualization');
    const hotspot = new HotspotVisualization();
    const data = generatePolygonSampleData(75);
    
    // Test with default options
    const options = {
      field: 'population',
      title: 'Population Hotspots',
      opacity: 0.85
    };
    
    console.log("  Creating visualization with options:", options);
    const result = await hotspot.create(data, options);
    
    // Check basic result properties
    console.log("  Checking result properties...");
    console.log(`    Layer: ${result.layer ? '✅ Present' : '❌ Missing'}`);
    console.log(`    Extent: ${result.extent ? '✅ Present' : '❌ Missing'}`);
    
    // Check renderer - should have special classification for hotspots
    const hasHotspotRenderer = result.layer && 
                              result.layer.renderer && 
                              (result.layer.renderer.type === 'class-breaks' || 
                               result.layer.renderer.field === options.field);
    
    console.log(`    Hotspot renderer: ${hasHotspotRenderer ? '✅ Present' : '❌ Missing or wrong type'}`);
    
    // Check legend - should have categories for hot/cold spots
    const hasLegend = result.legendInfo && 
                      result.legendInfo.items && 
                      result.legendInfo.items.length > 0;
    
    console.log(`    Legend: ${hasLegend ? '✅ Present' : '❌ Missing'}`);
    
    return result.layer !== null;
  } catch (error) {
    console.error(`  ❌ Error testing HOTSPOT visualization:`, error);
    return false;
  }
}

/**
 * Run tests for all new visualization types
 */
async function testNewVisualizationTypes() {
  console.log("=== TESTING NEW VISUALIZATION TYPES ===\n");
  
  try {
    // Run tests for each new visualization type
    const results = {
      topN: await testTopNVisualization(),
      hexbin: await testHexbinVisualization(),
      buffer: await testBufferVisualization(),
      hotspot: await testHotspotVisualization()
    };
    
    // Print summary
    console.log("\n=== NEW VISUALIZATION TYPES TEST SUMMARY ===");
    let allPassed = true;
    
    for (const [type, passed] of Object.entries(results)) {
      console.log(`  ${type}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (!passed) {
        allPassed = false;
      }
    }
    
    console.log(`\nOverall result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
  } catch (error) {
    console.error("Error running new visualization types tests:", error);
    return false;
  }
}

// Run the tests
testNewVisualizationTypes();

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = { 
    testNewVisualizationTypes,
    testTopNVisualization,
    testHexbinVisualization,
    testBufferVisualization,
    testHotspotVisualization
  };
} 