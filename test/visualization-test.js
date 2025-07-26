/**
 * Visualization Test Script
 * 
 * This script tests all visualization types implemented in the dynamic layer system
 * to ensure they work correctly and are properly recognized by the AI.
 */

import { DynamicVisualizationFactory, mapAnalysisTypeToVisualization } from '../lib/DynamicVisualizationFactory';
import { VisualizationType, visualizationTypesConfig } from '../config/dynamic-layers';
import { queryClassifier, classifyQuery } from '../lib/query-classifier';

// Sample test data for visualizations
const sampleTestData = {
  polygonData: {
    features: [
      // Sample polygon features would go here
    ],
    layerName: "Test Polygon Layer",
    layerConfig: {
      fields: [
        { name: "population", label: "Population", type: "double" },
        { name: "income", label: "Median Income", type: "double" },
        { name: "education", label: "Education Level", type: "double" }
      ]
    }
  },
  pointData: {
    features: [
      // Sample point features would go here
    ],
    layerName: "Test Point Layer",
    layerConfig: {
      fields: [
        { name: "name", label: "Name", type: "string" },
        { name: "value", label: "Value", type: "double" },
        { name: "category", label: "Category", type: "string" }
      ]
    }
  }
};

// Test queries for each visualization type
const testQueries = {
  [VisualizationType.CHOROPLETH]: [
    "Show me income distribution across neighborhoods",
    "Map population by county"
  ],
  [VisualizationType.HEATMAP]: [
    "Show density of restaurants",
    "Heat map of crime incidents"
  ],
  [VisualizationType.SCATTER]: [
    "Plot all store locations",
    "Show individual data points"
  ],
  [VisualizationType.CLUSTER]: [
    "Cluster the coffee shops",
    "Group points by location"
  ],
  [VisualizationType.CATEGORICAL]: [
    "Show different categories of land use",
    "Categorize neighborhoods by dominant industry"
  ],
  [VisualizationType.TRENDS]: [
    "Show trends in home prices over time",
    "How has population changed over the last decade"
  ],
  [VisualizationType.CORRELATION]: [
    "Show correlation between income and education",
    "Compare housing prices and crime rates"
  ],
  [VisualizationType.JOINT_HIGH]: [
    "Find areas with both high income and good schools",
    "Show regions where both crime and poverty are high"
  ],
  [VisualizationType.PROPORTIONAL_SYMBOL]: [
    "Show cities with symbol size based on population",
    "Use proportional symbols to show earthquake magnitude"
  ],
  [VisualizationType.TOP_N]: [
    "Show top 10 counties by income",
    "Highlight the 5 neighborhoods with highest property values"
  ],
  [VisualizationType.HEXBIN]: [
    "Create a hexbin map of customer locations",
    "Show data aggregated in hexagonal bins"
  ],
  [VisualizationType.BIVARIATE]: [
    "Show a bivariate map of income and education",
    "Create a color matrix of population and housing density"
  ],
  [VisualizationType.BUFFER]: [
    "Show 5 mile buffer around hospitals",
    "Create a 10km radius around schools"
  ],
  [VisualizationType.HOTSPOT]: [
    "Find hotspots of crime incidents",
    "Show statistically significant clusters of high income"
  ],
  [VisualizationType.NETWORK]: [
    "Show transportation connections between cities",
    "Create a network diagram of trade between countries"
  ],
  [VisualizationType.MULTIVARIATE]: [
    "Compare population, income, and education levels",
    "Show a multivariate analysis of demographic factors"
  ]
};

/**
 * Test query classification for all visualization types
 */
async function testQueryClassification() {
  console.log("\n=== TESTING QUERY CLASSIFICATION ===\n");
  
  for (const [type, queries] of Object.entries(testQueries)) {
    console.log(`\nTesting ${type} queries:`);
    
    for (const query of queries) {
      const result = await classifyQuery(query);
      console.log(`  Query: "${query}"`);
      console.log(`  Result: ${result}`);
      console.log(`  Match: ${result === type ? '✅' : '❌'}`);
    }
  }
}

/**
 * Test visualization creation for all types
 */
async function testVisualizationCreation(mapView) {
  console.log("\n=== TESTING VISUALIZATION CREATION ===\n");
  
  const factory = new DynamicVisualizationFactory(mapView);
  await factory.initialize(mapView);
  
  for (const type of Object.values(VisualizationType)) {
    console.log(`\nTesting visualization: ${type}`);
    
    try {
      // Determine which test data to use based on visualization type metadata
      const metadata = visualizationTypesConfig[type];
      const usePointData = metadata.supportsGeometryTypes.includes('Point');
      const testData = usePointData ? sampleTestData.pointData : sampleTestData.polygonData;
      
      // Create visualization options based on type
      const options = {
        fields: testData.layerConfig.fields.slice(0, metadata.requiresFields).map(f => f.name)
      };
      
      console.log(`  Creating ${type} with options:`, options);
      
      // Create the visualization
      const result = await factory.createVisualization(type, "testLayer", options);
      
      // Log results
      console.log(`  Result: ${result.layer ? '✅ Layer created' : '❌ No layer'}`);
      console.log(`  Extent: ${result.extent ? '✅ Valid extent' : '❌ No extent'}`);
      
    } catch (error) {
      console.error(`  ❌ Error creating ${type}:`, error.message);
    }
  }
}

/**
 * Test that analysis types map to correct visualization types
 */
function testAnalysisTypeMapping() {
  console.log("\n=== TESTING ANALYSIS TYPE MAPPING ===\n");
  
  const testMappings = {
    'correlation': VisualizationType.CORRELATION,
    'distribution': VisualizationType.CHOROPLETH,
    'thematic': VisualizationType.CHOROPLETH,
    'cluster': VisualizationType.CLUSTER,
    'joint_high': VisualizationType.JOINT_HIGH,
    'trends': VisualizationType.TRENDS,
    'categorical': VisualizationType.CATEGORICAL,
    'heatmap': VisualizationType.HEATMAP,
    'point_scatter': VisualizationType.SCATTER,
    'top_n': VisualizationType.TOP_N,
    'hexbin': VisualizationType.HEXBIN,
    'bivariate': VisualizationType.BIVARIATE,
    'buffer': VisualizationType.BUFFER,
    'hotspot': VisualizationType.HOTSPOT,
    'network': VisualizationType.NETWORK,
    'multivariate': VisualizationType.MULTIVARIATE
  };
  
  for (const [analysisType, expectedVizType] of Object.entries(testMappings)) {
    const result = mapAnalysisTypeToVisualization(analysisType);
    console.log(`  Analysis type: "${analysisType}"`);
    console.log(`  Maps to: ${result}`);
    console.log(`  Expected: ${expectedVizType}`);
    console.log(`  Match: ${result === expectedVizType ? '✅' : '❌'}\n`);
  }
}

/**
 * Main test runner
 */
async function runTests(mapView) {
  console.log("=== VISUALIZATION SYSTEM TEST ===");
  console.log(`Testing ${Object.keys(VisualizationType).length} visualization types`);
  
  // Test that query classifier recognizes all visualization types
  await testQueryClassification();
  
  // Test that analysis types map to correct visualization types
  testAnalysisTypeMapping();
  
  // Test creation of each visualization type
  if (mapView) {
    await testVisualizationCreation(mapView);
  } else {
    console.log("\n⚠️ Skipping visualization creation tests - no MapView provided");
  }
  
  console.log("\n=== TESTS COMPLETE ===");
}

// Export the test runner
export default runTests; 