/**
 * Comprehensive test script for all analysis query flows
 * Tests from query input to final visualization
 */

const queries = [
  {
    name: 'Strategic Analysis',
    query: 'Show me the top strategic markets for Nike expansion',
    expectedEndpoint: '/strategic-analysis',
    expectedType: 'strategic_analysis',
    expectedTargetVariable: 'strategic_value_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Competitive Analysis', 
    query: 'Compare Nike\'s market position against competitors',
    expectedEndpoint: '/competitive-analysis',
    expectedType: 'competitive_analysis',
    expectedTargetVariable: 'competitive_advantage_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Demographic Analysis',
    query: 'Which markets have the best demographic fit for Nike\'s target customer profile?',
    expectedEndpoint: '/demographic-insights',
    expectedType: 'demographic_analysis',
    expectedTargetVariable: 'demographic_opportunity_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Spatial Clusters',
    query: 'Show me geographic clusters of similar markets',
    expectedEndpoint: '/spatial-clusters',
    expectedType: 'spatial_clustering',
    expectedTargetVariable: 'cluster_score',
    expectedRenderer: 'cluster'
  },
  {
    name: 'Feature Interactions',
    query: 'What market factors are most strongly correlated with Nike\'s success?',
    expectedEndpoint: '/feature-interactions',
    expectedType: 'feature_interaction',
    expectedTargetVariable: 'interaction_strength_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Sensitivity Analysis',
    query: 'Which markets are most adaptable to different strategic scenarios?',
    expectedEndpoint: '/sensitivity-analysis',
    expectedType: 'sensitivity_analysis',
    expectedTargetVariable: 'sensitivity_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Outlier Detection',
    query: 'Show me markets that have outliers with unique characteristics',
    expectedEndpoint: '/outlier-detection',
    expectedType: 'outlier_detection',
    expectedTargetVariable: 'outlier_score',
    expectedRenderer: 'choropleth'
  },
  {
    name: 'Brand Analysis',
    query: 'Which markets have the strongest Nike brand positioning?',
    expectedEndpoint: '/brand-analysis',
    expectedType: 'brand_analysis',
    expectedTargetVariable: 'brand_analysis_score',
    expectedRenderer: 'choropleth'
  }
];

async function testQueryFlow(testCase) {
  console.log(`\n🧪 TESTING: ${testCase.name}`);
  console.log(`Query: "${testCase.query}"`);
  console.log(`Expected endpoint: ${testCase.expectedEndpoint}`);
  
  try {
    // Step 1: Test endpoint detection
    const { CachedEndpointRouter } = await import('./lib/analysis/CachedEndpointRouter.ts');
    const router = new CachedEndpointRouter();
    const detectedEndpoint = router.routeQuery(testCase.query);
    
    console.log(`✅ Step 1 - Endpoint Detection: ${detectedEndpoint}`);
    if (detectedEndpoint !== testCase.expectedEndpoint) {
      console.log(`❌ MISMATCH: Expected ${testCase.expectedEndpoint}, got ${detectedEndpoint}`);
    }
    
    // Step 2: Test data loading
    const fs = await import('fs/promises');
    const dataPath = `./public/data/endpoints${detectedEndpoint}.json`;
    
    let rawData;
    try {
      const dataContent = await fs.readFile(dataPath, 'utf8');
      rawData = JSON.parse(dataContent);
      console.log(`✅ Step 2 - Data Loading: ${rawData.results?.length || 0} records loaded`);
    } catch (error) {
      console.log(`❌ Step 2 - Data Loading Failed: ${error.message}`);
      return;
    }
    
    // Step 3: Test data processing
    const { DataProcessor } = await import('./lib/analysis/DataProcessor.ts');
    const processor = new DataProcessor();
    
    const processedData = processor.processEndpointData(rawData, detectedEndpoint);
    console.log(`✅ Step 3 - Data Processing:`);
    console.log(`  - Type: ${processedData.type} (expected: ${testCase.expectedType})`);
    console.log(`  - Target Variable: ${processedData.targetVariable} (expected: ${testCase.expectedTargetVariable})`);
    console.log(`  - Records: ${processedData.records.length}`);
    
    if (processedData.type !== testCase.expectedType) {
      console.log(`❌ TYPE MISMATCH: Expected ${testCase.expectedType}, got ${processedData.type}`);
    }
    
    if (processedData.targetVariable !== testCase.expectedTargetVariable) {
      console.log(`❌ TARGET VARIABLE MISMATCH: Expected ${testCase.expectedTargetVariable}, got ${processedData.targetVariable}`);
    }
    
    // Step 4: Test visualization type determination
    const { VisualizationRenderer } = await import('./lib/analysis/VisualizationRenderer.ts');
    const { ConfigurationManager } = await import('./lib/analysis/ConfigurationManager.ts');
    
    const configManager = new ConfigurationManager();
    const renderer = new VisualizationRenderer(configManager);
    
    // Get endpoint config to determine expected visualization type
    const endpointConfig = configManager.getEndpointConfig(detectedEndpoint);
    const determinedVisualizationType = renderer.determineVisualizationType(
      processedData, 
      endpointConfig.defaultVisualization
    );
    
    console.log(`✅ Step 4 - Visualization Type: ${determinedVisualizationType} (expected: ${testCase.expectedRenderer})`);
    
    if (determinedVisualizationType !== testCase.expectedRenderer) {
      console.log(`❌ RENDERER MISMATCH: Expected ${testCase.expectedRenderer}, got ${determinedVisualizationType}`);
    }
    
    // Step 5: Test actual rendering
    try {
      const visualizationResult = renderer.createVisualization(processedData, detectedEndpoint);
      console.log(`✅ Step 5 - Visualization Creation:`);
      console.log(`  - Type: ${visualizationResult.type}`);
      console.log(`  - Has Renderer: ${!!visualizationResult.renderer}`);
      console.log(`  - Renderer Type: ${visualizationResult.renderer?.type}`);
      console.log(`  - Has Legend: ${!!visualizationResult.legend}`);
      
      // Check for quartile colors in choropleth renderers
      if (testCase.expectedRenderer === 'choropleth' && visualizationResult.renderer) {
        const rendererConfig = visualizationResult.renderer;
        if (rendererConfig.type === 'class-breaks' && rendererConfig.classBreakInfos) {
          console.log(`  - Color Classes: ${rendererConfig.classBreakInfos.length}`);
          const colors = rendererConfig.classBreakInfos.map(info => info.symbol?.color);
          console.log(`  - Colors Used: ${colors.map(c => c ? `[${c.join(',')}]` : 'undefined').join(', ')}`);
          
          // Check if using quartile colors (4 classes)
          if (rendererConfig.classBreakInfos.length !== 4) {
            console.log(`❌ COLOR CLASS MISMATCH: Expected 4 quartile classes, got ${rendererConfig.classBreakInfos.length}`);
          }
        }
      }
      
    } catch (error) {
      console.log(`❌ Step 5 - Visualization Creation Failed: ${error.message}`);
    }
    
    // Step 6: Test sample record structure
    const sampleRecord = processedData.records[0];
    if (sampleRecord) {
      console.log(`✅ Step 6 - Sample Record Structure:`);
      console.log(`  - Area ID: ${sampleRecord.area_id}`);
      console.log(`  - Area Name: ${sampleRecord.area_name}`);
      console.log(`  - Value: ${sampleRecord.value}`);
      console.log(`  - Rank: ${sampleRecord.rank}`);
      console.log(`  - Has Properties: ${!!sampleRecord.properties}`);
      
      if (sampleRecord.properties) {
        const targetField = sampleRecord.properties[testCase.expectedTargetVariable];
        console.log(`  - Target Field (${testCase.expectedTargetVariable}): ${targetField}`);
        
        if (targetField === undefined) {
          console.log(`❌ TARGET FIELD MISSING: ${testCase.expectedTargetVariable} not found in properties`);
        }
      }
    }
    
    console.log(`🎉 ${testCase.name} test completed!`);
    
  } catch (error) {
    console.log(`💥 ${testCase.name} test failed with error: ${error.message}`);
    console.log(error.stack);
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive query flow testing...\n');
  
  for (const testCase of queries) {
    await testQueryFlow(testCase);
    
    // Add delay between tests to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✨ All tests completed!');
}

// Run tests
runAllTests().catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});