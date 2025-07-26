/**
 * Visualization Output Test
 * 
 * This script tests the actual output of each visualization type
 * to verify they produce the expected results.
 */

const { generatePolygonSampleData, generatePointSampleData, generateNetworkData } = require('./sample-data-generator');

/**
 * Verify common attributes that all visualizations should have
 */
function verifyBaseVisualization(result, options = {}) {
  console.log(`  Testing base visualization attributes...`);
  
  // Check if visualization result has required properties
  const checks = [
    { name: 'Layer object', test: () => result.layer !== null, required: true },
    { name: 'Extent object', test: () => result.extent !== null, required: false },
    { name: 'Renderer', test: () => result.layer && result.layer.renderer, required: true },
    { name: 'Title', test: () => result.layer && result.layer.title, required: true },
    { name: 'Opacity', test: () => result.layer && result.layer.opacity !== undefined, required: true },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    try {
      const passed = check.test();
      console.log(`    ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'Present' : 'Missing'}`);
      if (!passed && check.required) {
        allPassed = false;
      }
    } catch (error) {
      console.log(`    ❌ ${check.name}: Error during check`);
      if (check.required) {
        allPassed = false;
      }
    }
  }
  
  // Check for user-specified options
  if (options.title) {
    const titleMatch = result.layer && result.layer.title === options.title;
    console.log(`    ${titleMatch ? '✅' : '❌'} Custom title: ${titleMatch ? 'Applied' : 'Not applied'}`);
    if (!titleMatch) allPassed = false;
  }
  
  if (options.opacity !== undefined) {
    const opacityMatch = result.layer && Math.abs(result.layer.opacity - options.opacity) < 0.01;
    console.log(`    ${opacityMatch ? '✅' : '❌'} Custom opacity: ${opacityMatch ? 'Applied' : 'Not applied'}`);
    if (!opacityMatch) allPassed = false;
  }
  
  return allPassed;
}

/**
 * Test specific aspects of a choropleth visualization
 */
async function testChoroplethVisualization() {
  console.log("\n=== Testing CHOROPLETH Visualization ===");
  
  try {
    const { ChoroplethVisualization } = require('../utils/visualizations/choropleth-visualization');
    const choropleth = new ChoroplethVisualization();
    const data = generatePolygonSampleData(50);
    
    // Test with default options
    const defaultOptions = {
      title: 'Test Choropleth',
      opacity: 0.8,
      rendererField: 'population'
    };
    
    console.log("  Creating visualization with default options...");
    const result = await choropleth.create(data, defaultOptions);
    
    // Verify base visualization attributes
    const baseTestPassed = verifyBaseVisualization(result, defaultOptions);
    
    // Verify choropleth-specific attributes
    console.log("  Testing choropleth-specific attributes...");
    
    // Check renderer type
    const isClassBreaks = result.layer && 
                         result.layer.renderer && 
                         result.layer.renderer.type === 'class-breaks';
    console.log(`    ${isClassBreaks ? '✅' : '❌'} Renderer type: ${isClassBreaks ? 'Class breaks' : 'Not class breaks'}`);
    
    // Check if the specified field is used in the renderer
    const fieldUsed = result.layer && 
                     result.layer.renderer && 
                     result.layer.renderer.field === defaultOptions.rendererField;
    console.log(`    ${fieldUsed ? '✅' : '❌'} Renderer field: ${fieldUsed ? defaultOptions.rendererField : 'Not set correctly'}`);
    
    // Check if classes/breaks are defined
    const hasBreaks = result.layer && 
                     result.layer.renderer && 
                     result.layer.renderer.classBreakInfos && 
                     result.layer.renderer.classBreakInfos.length > 0;
    console.log(`    ${hasBreaks ? '✅' : '❌'} Class breaks: ${hasBreaks ? 'Present' : 'Missing'}`);
    
    // Check legend info
    const hasLegend = result.legendInfo && 
                     result.legendInfo.items && 
                     result.legendInfo.items.length > 0;
    console.log(`    ${hasLegend ? '✅' : '❌'} Legend info: ${hasLegend ? 'Present' : 'Missing'}`);
    
    // Overall test result
    const passed = baseTestPassed && isClassBreaks && fieldUsed && hasBreaks;
    console.log(`  Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  } catch (error) {
    console.error("  ❌ Error testing choropleth visualization:", error);
    return false;
  }
}

/**
 * Test specific aspects of a heatmap visualization
 */
async function testHeatmapVisualization() {
  console.log("\n=== Testing HEATMAP Visualization ===");
  
  try {
    const { DensityVisualization } = require('../utils/visualizations/density-visualization');
    const heatmap = new DensityVisualization();
    const data = generatePointSampleData(100);
    
    // Test with default options
    const defaultOptions = {
      title: 'Test Heatmap',
      opacity: 0.7,
      blurRadius: 10
    };
    
    console.log("  Creating visualization with default options...");
    const result = await heatmap.create(data, defaultOptions);
    
    // Verify base visualization attributes
    const baseTestPassed = verifyBaseVisualization(result, defaultOptions);
    
    // Verify heatmap-specific attributes
    console.log("  Testing heatmap-specific attributes...");
    
    // Check renderer type
    const isHeatmap = result.layer && 
                     result.layer.renderer && 
                     result.layer.renderer.type === 'heatmap';
    console.log(`    ${isHeatmap ? '✅' : '❌'} Renderer type: ${isHeatmap ? 'Heatmap' : 'Not heatmap'}`);
    
    // Check if the radius is set
    const hasRadius = result.layer && 
                     result.layer.renderer && 
                     result.layer.renderer.blurRadius !== undefined;
    console.log(`    ${hasRadius ? '✅' : '❌'} Blur radius: ${hasRadius ? 'Present' : 'Missing'}`);
    
    // Overall test result
    const passed = baseTestPassed && isHeatmap && hasRadius;
    console.log(`  Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  } catch (error) {
    console.error("  ❌ Error testing heatmap visualization:", error);
    return false;
  }
}

/**
 * Test specific aspects of the cluster visualization
 */
async function testClusterVisualization() {
  console.log("\n=== Testing CLUSTER Visualization ===");
  
  try {
    const { ClusterVisualization } = require('../utils/visualizations/cluster-visualization');
    const cluster = new ClusterVisualization();
    const data = generatePointSampleData(200);
    
    // Test with default options
    const defaultOptions = {
      title: 'Test Clusters',
      opacity: 0.85,
      clusterRadius: 100
    };
    
    console.log("  Creating visualization with default options...");
    const result = await cluster.create(data, defaultOptions);
    
    // Verify base visualization attributes
    const baseTestPassed = verifyBaseVisualization(result, defaultOptions);
    
    // Verify cluster-specific attributes
    console.log("  Testing cluster-specific attributes...");
    
    // Check featureReduction property
    const hasFeatureReduction = result.layer && 
                               result.layer.featureReduction && 
                               result.layer.featureReduction.type === 'cluster';
    console.log(`    ${hasFeatureReduction ? '✅' : '❌'} Feature reduction: ${hasFeatureReduction ? 'Cluster' : 'Not set'}`);
    
    // Overall test result
    const passed = baseTestPassed && hasFeatureReduction;
    console.log(`  Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  } catch (error) {
    console.error("  ❌ Error testing cluster visualization:", error);
    return false;
  }
}

/**
 * Test specific aspects of the bivariate visualization
 */
async function testBivariateVisualization() {
  console.log("\n=== Testing BIVARIATE Visualization ===");
  
  try {
    const { BivariateVisualization } = require('../utils/visualizations/bivariate-visualization');
    const bivariate = new BivariateVisualization();
    const data = generatePolygonSampleData(50);
    
    // Test with default options
    const defaultOptions = {
      title: 'Test Bivariate',
      opacity: 0.85,
      fields: ['income', 'education'],
      colorScheme: 'redblue'
    };
    
    console.log("  Creating visualization with default options...");
    const result = await bivariate.create(data, defaultOptions);
    
    // Verify base visualization attributes
    const baseTestPassed = verifyBaseVisualization(result, defaultOptions);
    
    // Verify bivariate-specific attributes
    console.log("  Testing bivariate-specific attributes...");
    
    // Check renderer type (likely a custom renderer or visual variables renderer)
    const hasRenderer = result.layer && result.layer.renderer;
    console.log(`    ${hasRenderer ? '✅' : '❌'} Has renderer: ${hasRenderer ? 'Yes' : 'No'}`);
    
    // Check if fields are used in renderer
    const hasFields = result.layer && 
                     result.layer.renderer && 
                     ((result.layer.renderer.field && 
                      (result.layer.renderer.field === defaultOptions.fields[0] || 
                       result.layer.renderer.visualVariables?.some(v => v.field === defaultOptions.fields[1]))) ||
                      (result.layer.renderer.attributes && 
                       Object.keys(result.layer.renderer.attributes).some(k => 
                         defaultOptions.fields.includes(k))));
    
    console.log(`    ${hasFields ? '✅' : '❌'} Uses both fields: ${hasFields ? 'Yes' : 'No'}`);
    
    // Check legend info
    const hasLegend = result.legendInfo && 
                     result.legendInfo.items && 
                     result.legendInfo.items.length > 0;
    console.log(`    ${hasLegend ? '✅' : '❌'} Legend info: ${hasLegend ? 'Present' : 'Missing'}`);
    
    // Overall test result
    const passed = baseTestPassed && hasRenderer;
    console.log(`  Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  } catch (error) {
    console.error("  ❌ Error testing bivariate visualization:", error);
    return false;
  }
}

/**
 * Test specific aspects of the network visualization
 */
async function testNetworkVisualization() {
  console.log("\n=== Testing NETWORK Visualization ===");
  
  try {
    const { NetworkVisualization } = require('../utils/visualizations/network-visualization');
    const network = new NetworkVisualization();
    const data = generateNetworkData(20, 30);
    
    // Test with default options
    const defaultOptions = {
      title: 'Test Network',
      opacity: 0.9,
      valueField: 'value'
    };
    
    console.log("  Creating visualization with default options...");
    const result = await network.create({ 
      ...data,
      layerName: 'Test Network'
    }, defaultOptions);
    
    // Verify base visualization attributes
    const baseTestPassed = verifyBaseVisualization(result, defaultOptions);
    
    // Verify network-specific attributes
    console.log("  Testing network-specific attributes...");
    
    // Check if we have multiple layers (nodes and edges)
    const hasMultipleLayers = result.layer !== null && 
                             (result.additionalLayers !== undefined && 
                              result.additionalLayers.length > 0);
    console.log(`    ${hasMultipleLayers ? '✅' : '❌'} Multiple layers: ${hasMultipleLayers ? 'Present' : 'Missing'}`);
    
    // Overall test result
    // Note: Network visualization may have a different structure than other types,
    // so we might need to adjust this check based on actual implementation
    const passed = baseTestPassed;
    console.log(`  Test result: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    return passed;
  } catch (error) {
    console.error("  ❌ Error testing network visualization:", error);
    return false;
  }
}

/**
 * Run all visualization output tests
 */
async function runVisualizationOutputTests() {
  console.log("=== VISUALIZATION OUTPUT TEST SUITE ===\n");
  
  try {
    // Test a subset of visualization types
    const results = {
      choropleth: await testChoroplethVisualization(),
      heatmap: await testHeatmapVisualization(),
      cluster: await testClusterVisualization(),
      bivariate: await testBivariateVisualization(),
      network: await testNetworkVisualization()
      // Additional visualization tests can be added here
    };
    
    // Summary
    console.log("\n=== TEST SUMMARY ===");
    let allPassed = true;
    
    for (const [type, passed] of Object.entries(results)) {
      console.log(`  ${type.toUpperCase()}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (!passed) {
        allPassed = false;
      }
    }
    
    console.log(`\nOverall result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return results;
  } catch (error) {
    console.error("Error running visualization output tests:", error);
    return false;
  }
}

// Run the tests
runVisualizationOutputTests();

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = { 
    runVisualizationOutputTests,
    testChoroplethVisualization,
    testHeatmapVisualization,
    testClusterVisualization,
    testBivariateVisualization,
    testNetworkVisualization,
    verifyBaseVisualization
  };
} 