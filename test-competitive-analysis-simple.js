#!/usr/bin/env node

/**
 * Simple test to verify competitive analysis is working correctly
 * Tests the complete flow: processor -> renderer -> visualization
 */

const { AnalysisEngine } = require('./lib/analysis/AnalysisEngine.ts');

async function testCompetitiveAnalysis() {
  console.log('🧪 Testing Competitive Analysis Flow...\n');
  
  try {
    // Initialize AnalysisEngine
    const analysisEngine = new AnalysisEngine();
    
    // Test competitive analysis query
    const competitiveQuery = "Show Nike vs Adidas competitive analysis with market share visualization";
    console.log(`📝 Query: "${competitiveQuery}"`);
    
    // Execute analysis
    console.log('\n⚙️  Executing analysis...');
    const result = await analysisEngine.executeAnalysis(competitiveQuery, {
      endpoint: '/competitive-analysis',
      requiresVisualization: true
    });
    
    console.log('\n✅ Analysis completed!');
    console.log('📊 Results:', {
      endpoint: result.endpoint,
      recordCount: result.data?.records?.length || 0,
      hasVisualization: !!result.visualization,
      visualizationType: result.visualization?.type,
      hasRenderer: !!result.visualization?.renderer,
      rendererType: result.visualization?.renderer?.type,
      usesQuintiles: result.visualization?.renderer?._quintileBased,
      usesCentroids: result.visualization?.renderer?._useCentroids,
      isDualVariable: result.visualization?.renderer?._dualVariable
    });
    
    // Check data quality
    if (result.data?.records?.length > 0) {
      const sampleRecord = result.data.records[0];
      console.log('\n📋 Sample Record:', {
        area_name: sampleRecord.area_name,
        competitive_advantage_score: sampleRecord.value,
        nike_market_share: sampleRecord.nike_market_share || sampleRecord.properties?.nike_market_share,
        adidas_market_share: sampleRecord.properties?.adidas_market_share,
        hasGeometry: !!sampleRecord.geometry,
        geometryType: sampleRecord.geometry?.type
      });
      
      // Check top 5 competitive markets
      const top5 = result.data.records.slice(0, 5);
      console.log('\n🏆 Top 5 Competitive Markets:');
      top5.forEach((record, idx) => {
        console.log(`${idx + 1}. ${record.area_name}: ${record.value?.toFixed(2)} competitive advantage`);
      });
    }
    
    // Check visualization renderer details
    if (result.visualization?.renderer) {
      console.log('\n🎨 Renderer Configuration:');
      const renderer = result.visualization.renderer;
      
      if (renderer.visualVariables) {
        console.log('Visual Variables:');
        renderer.visualVariables.forEach((vv, idx) => {
          console.log(`  ${idx + 1}. ${vv.type}: ${vv.field} (${vv.stops?.length || 0} stops)`);
          if (vv.stops && vv.stops.length > 0) {
            console.log(`     Range: ${vv.stops[0].value} to ${vv.stops[vv.stops.length - 1].value}`);
          }
        });
      }
      
      if (renderer._marketShareQuintiles) {
        console.log('Market Share Quintiles:', renderer._marketShareQuintiles.map(q => q.toFixed(2)));
      }
      
      if (renderer._competitiveQuintiles) {
        console.log('Competitive Advantage Quintiles:', renderer._competitiveQuintiles.map(q => q.toFixed(2)));
      }
    }
    
    // Check legend
    if (result.visualization?.legend) {
      console.log('\n🏷️  Legend:', {
        title: result.visualization.legend.title,
        type: result.visualization.legend.type,
        components: result.visualization.legend.components?.length || 0,
        items: result.visualization.legend.items?.length || 0
      });
    }
    
    console.log('\n🎉 Competitive analysis test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testCompetitiveAnalysis().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});