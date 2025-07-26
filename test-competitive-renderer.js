#!/usr/bin/env node

/**
 * Test Competitive Analysis Renderer
 * Verify that competitive analysis uses the same renderer as strategic analysis
 */

const { ConfigurationManager } = require('./lib/analysis/ConfigurationManager.ts');
const { VisualizationRenderer } = require('./lib/analysis/VisualizationRenderer.ts');

async function testCompetitiveRenderer() {
  console.log('🎯 TESTING COMPETITIVE ANALYSIS RENDERER');
  console.log('=' + '='.repeat(50));
  
  try {
    const configManager = new ConfigurationManager();
    const renderer = new VisualizationRenderer(configManager);
    
    // Test competitive analysis data
    const competitiveData = {
      type: 'competitive_analysis',
      targetVariable: 'competitive_advantage_score',
      records: [
        {
          area_id: '08837',
          area_name: 'Edison, NJ',
          value: 4.2,
          properties: {
            competitive_advantage_score: 4.2,
            nike_market_share: 17.7
          }
        },
        {
          area_id: '07001', 
          area_name: 'Newark, NJ',
          value: 3.8,
          properties: {
            competitive_advantage_score: 3.8,
            nike_market_share: 15.2
          }
        },
        {
          area_id: '07302',
          area_name: 'Jersey City, NJ', 
          value: 5.1,
          properties: {
            competitive_advantage_score: 5.1,
            nike_market_share: 18.9
          }
        }
      ]
    };
    
    // Test strategic analysis data (for comparison)
    const strategicData = {
      type: 'strategic_analysis',
      targetVariable: 'strategic_value_score',
      records: [
        {
          area_id: '08837',
          area_name: 'Edison, NJ',
          value: 79.34,
          properties: {
            strategic_value_score: 79.34,
            nike_market_share: 17.7
          }
        }
      ]
    };
    
    console.log('\n📊 TESTING COMPETITIVE ANALYSIS:');
    console.log('Data type:', competitiveData.type);
    console.log('Target variable:', competitiveData.targetVariable);
    console.log('Records count:', competitiveData.records.length);
    
    const competitiveResult = renderer.createVisualization(competitiveData, '/competitive-analysis');
    
    console.log('\n✅ COMPETITIVE ANALYSIS RESULT:');
    console.log('- Visualization type:', competitiveResult.type);
    console.log('- Renderer type:', competitiveResult.renderer?.type);
    console.log('- Has legend:', !!competitiveResult.legend);
    console.log('- Has popup template:', !!competitiveResult.popupTemplate);
    
    console.log('\n📊 TESTING STRATEGIC ANALYSIS (for comparison):');
    const strategicResult = renderer.createVisualization(strategicData, '/strategic-analysis');
    
    console.log('\n✅ STRATEGIC ANALYSIS RESULT:');
    console.log('- Visualization type:', strategicResult.type);
    console.log('- Renderer type:', strategicResult.renderer?.type);
    console.log('- Has legend:', !!strategicResult.legend);
    console.log('- Has popup template:', !!strategicResult.popupTemplate);
    
    console.log('\n🔍 COMPARISON:');
    const sameVisualizationType = competitiveResult.type === strategicResult.type;
    const sameRendererType = competitiveResult.renderer?.type === strategicResult.renderer?.type;
    
    console.log('- Same visualization type:', sameVisualizationType);
    console.log('- Same renderer type:', sameRendererType);
    
    if (sameVisualizationType && sameRendererType) {
      console.log('\n✅ SUCCESS: Competitive and Strategic analysis use the same renderer!');
      console.log('Both use:', competitiveResult.type, 'visualization with', competitiveResult.renderer?.type, 'renderer');
    } else {
      console.log('\n❌ MISMATCH: Different renderers detected');
      console.log('Competitive:', competitiveResult.type, '/', competitiveResult.renderer?.type);
      console.log('Strategic:', strategicResult.type, '/', strategicResult.renderer?.type);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testCompetitiveRenderer().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 COMPETITIVE RENDERER TEST COMPLETE');
  });
}

module.exports = { testCompetitiveRenderer };