// Direct test of strategic analysis to capture debug output
const fs = require('fs');

async function testStrategicAnalysisFlow() {
  console.log('=== LIVE STRATEGIC ANALYSIS TEST ===\n');
  
  try {
    // Import the actual processors and renderers
    const { StrategicAnalysisProcessor } = await import('./lib/analysis/strategies/processors/StrategicAnalysisProcessor.ts');
    const { VisualizationRenderer } = await import('./lib/analysis/VisualizationRenderer.ts');
    
    console.log('1. ✅ Imported processors and renderers');
    
    // Load real data
    const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
    console.log('2. ✅ Loaded strategic data:', strategicData.results.length, 'records');
    
    // Create processor instance and process data
    const processor = new StrategicAnalysisProcessor();
    const processedData = processor.process(strategicData);
    
    console.log('3. ✅ Processed data:');
    console.log('   - Type:', processedData.type);
    console.log('   - TargetVariable:', processedData.targetVariable);
    console.log('   - Record count:', processedData.records.length);
    console.log('   - Sample record:', {
      area_name: processedData.records[0].area_name,
      value: processedData.records[0].value,
      strategic_value_score: processedData.records[0].strategic_value_score
    });
    
    // Create visualization renderer and render
    const visualizationRenderer = new VisualizationRenderer();
    const visualization = visualizationRenderer.createVisualization(processedData, '/strategic-analysis');
    
    console.log('4. ✅ Created visualization:');
    console.log('   - Type:', visualization.type);
    console.log('   - Has renderer:', !!visualization.renderer);
    console.log('   - Renderer type:', visualization.renderer?.type);
    console.log('   - Renderer field:', visualization.renderer?.field);
    
    // Check if the renderer has the correct field
    if (visualization.renderer?.field === 'strategic_value_score') {
      console.log('✅ SUCCESS: Renderer is using correct field "strategic_value_score"');
    } else {
      console.log('❌ ISSUE: Renderer field is', visualization.renderer?.field, 'instead of "strategic_value_score"');
    }
    
    // Check class breaks
    if (visualization.renderer?.classBreakInfos) {
      console.log('   - Class breaks:', visualization.renderer.classBreakInfos.length);
      console.log('   - First break:', visualization.renderer.classBreakInfos[0]);
    }
    
    console.log('\n=== ANALYSIS COMPLETE ===');
    console.log('If renderer field is "strategic_value_score" and class breaks exist,');
    console.log('the issue is likely in the ArcGIS feature attribute mapping.');
    
  } catch (error) {
    console.error('❌ Error in live test:', error.message);
    console.log('\n=== FALLBACK: Static Analysis ===');
    
    // Fallback to static analysis if imports fail
    const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
    
    // Simulate the processor output
    const mockProcessedData = {
      type: 'strategic_analysis',
      targetVariable: 'strategic_value_score',
      records: strategicData.results.slice(0, 100).map((record, index) => ({
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: record.strategic_value_score,
        strategic_value_score: record.strategic_value_score,
        rank: index + 1,
        properties: record
      }))
    };
    
    console.log('📋 Mock processed data ready for testing');
    console.log('   - Records:', mockProcessedData.records.length);
    console.log('   - TargetVariable:', mockProcessedData.targetVariable);
    console.log('   - Sample values:', mockProcessedData.records.slice(0, 3).map(r => r.strategic_value_score));
    
    // Test value extraction like ChoroplethRenderer would do
    const fieldToUse = mockProcessedData.targetVariable;
    const values = mockProcessedData.records.map(r => r[fieldToUse]).filter(v => v !== undefined && !isNaN(v));
    
    console.log('🔍 Value extraction test:');
    console.log('   - Field to use:', fieldToUse);
    console.log('   - Values extracted:', values.length);
    console.log('   - Value range:', Math.min(...values), 'to', Math.max(...values));
    
    if (values.length === mockProcessedData.records.length) {
      console.log('✅ All records have valid strategic_value_score');
    } else {
      console.log('❌ Some records missing strategic_value_score');
    }
  }
}

// Run the test
testStrategicAnalysisFlow();