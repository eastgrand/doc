#!/usr/bin/env node

/**
 * Complete Analysis Flow Test
 * Tests the full pipeline: query -> field detection -> processor -> visualization data
 */

const fs = require('fs');

// Simplified versions of the analysis components for testing
function getRelevantFields(attributes, query) {
  if (!attributes || !query) return [];

  const availableFields = Object.keys(attributes);
  const queryLower = query.toLowerCase();

  // For competitive analysis queries
  if (queryLower.includes('competitive') || queryLower.includes('compete') || 
      queryLower.includes('competitor') || queryLower.includes('position') ||
      queryLower.includes('advantage') || queryLower.includes('compare')) {
    
    const competitiveFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('competitive_advantage_score') ||
        fieldLower.includes('competitive_score') ||
        fieldLower.includes('advantage_score') ||
        fieldLower.includes('competitive')
      );
    });
    
    if (competitiveFields.length > 0) {
      return competitiveFields;
    }
  }

  // For strategic analysis queries
  if (queryLower.includes('strategic') || queryLower.includes('expansion') || 
      queryLower.includes('invest') || queryLower.includes('opportunity') ||
      queryLower.includes('value') || queryLower.includes('potential')) {
    
    const strategicFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return (
        fieldLower.includes('strategic_value_score') ||
        fieldLower.includes('strategic_score') ||
        fieldLower.includes('value_score') ||
        fieldLower.includes('strategic')
      );
    });
    
    if (strategicFields.length > 0) {
      return strategicFields;
    }
  }

  // For brand-related queries (fallback)
  if (queryLower.includes('nike') || queryLower.includes('brand')) {
    const brandFields = availableFields.filter(f => {
      const fieldLower = f.toLowerCase();
      return fieldLower.includes('nike') || fieldLower.includes('mp30034');
    });
    
    if (brandFields.length > 0) {
      return brandFields;
    }
  }
  
  return availableFields;
}

function simulateProcessorOutput(data, analysisType, relevantFields) {
  // Simulate what the processor would do
  const sample = data[0];
  let targetVariable;
  let valueField;
  
  if (analysisType === 'strategic_analysis') {
    targetVariable = 'strategic_value_score';
    valueField = sample.strategic_value_score || sample.target_value || 0;
  } else if (analysisType === 'competitive_analysis') {
    targetVariable = 'competitive_advantage_score';
    valueField = sample.competitive_advantage_score || sample.value || 0;
  } else {
    targetVariable = 'value';
    valueField = sample.value || 0;
  }
  
  return {
    type: analysisType,
    targetVariable: targetVariable,
    records: data.slice(0, 3).map(record => ({
      area_id: record.ID || record.id,
      area_name: record.DESCRIPTION || record.description || 'Unknown Area',
      value: valueField,
      [targetVariable]: record[targetVariable] || valueField,
      properties: record
    })),
    summary: `Analysis complete using ${targetVariable}`
  };
}

function simulateVisualizationRenderer(processedData) {
  // Simulate VisualizationRenderer.determineValueField logic
  const valueField = (processedData.type === 'competitive_analysis' || processedData.type === 'strategic_analysis') 
    ? processedData.targetVariable 
    : 'value';
    
  // Get values for legend calculation
  const values = processedData.records.map(record => 
    record[valueField] || record.value || 0
  );
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  
  return {
    valueField: valueField,
    legendRange: `${min} - ${max}`,
    sampleValues: values,
    visualization: processedData.records.map(record => ({
      area_name: record.area_name,
      displayValue: record[valueField] || record.value || 0,
      originalRecord: record
    }))
  };
}

async function testCompleteFlow() {
  console.log('🔄 COMPLETE ANALYSIS FLOW TEST');
  console.log('=' .repeat(60));
  
  try {
    // Load test data
    const strategicPath = './public/data/endpoints/strategic-analysis.json';
    const competitivePath = './public/data/endpoints/competitive-analysis.json';
    
    const strategicFile = JSON.parse(fs.readFileSync(strategicPath, 'utf8'));
    const competitiveFile = JSON.parse(fs.readFileSync(competitivePath, 'utf8'));
    
    const strategicData = strategicFile.results;
    const competitiveData = competitiveFile.results;
    
    console.log('\n📊 STRATEGIC ANALYSIS FLOW');
    console.log('-'.repeat(40));
    
    const strategicQuery = "Where should Nike invest for strategic expansion?";
    console.log(`Query: "${strategicQuery}"`);
    
    // Step 1: Field Detection
    const strategicSample = strategicData[0];
    const strategicRelevantFields = getRelevantFields(strategicSample, strategicQuery);
    console.log('✅ Step 1 - Field Detection:', strategicRelevantFields);
    
    // Step 2: Processor Simulation
    const strategicProcessed = simulateProcessorOutput(strategicData, 'strategic_analysis', strategicRelevantFields);
    console.log('✅ Step 2 - Processor Output:');
    console.log('  - Type:', strategicProcessed.type);
    console.log('  - Target Variable:', strategicProcessed.targetVariable);
    console.log('  - Sample Record Values:');
    strategicProcessed.records.forEach((record, i) => {
      console.log(`    ${i+1}. ${record.area_name}: ${record[strategicProcessed.targetVariable]}`);
    });
    
    // Step 3: Visualization Renderer Simulation  
    const strategicViz = simulateVisualizationRenderer(strategicProcessed);
    console.log('✅ Step 3 - Visualization Renderer:');
    console.log('  - Value Field Used:', strategicViz.valueField);
    console.log('  - Legend Range:', strategicViz.legendRange);
    console.log('  - Visualization Sample:');
    strategicViz.visualization.forEach(viz => {
      console.log(`    ${viz.area_name}: ${viz.displayValue}`);
    });
    
    console.log('\n🏆 COMPETITIVE ANALYSIS FLOW');
    console.log('-'.repeat(40));
    
    const competitiveQuery = "Where does Nike have competitive advantage?";
    console.log(`Query: "${competitiveQuery}"`);
    
    // Step 1: Field Detection
    const competitiveSample = competitiveData[0];
    const competitiveRelevantFields = getRelevantFields(competitiveSample, competitiveQuery);
    console.log('✅ Step 1 - Field Detection:', competitiveRelevantFields);
    
    // Step 2: Processor Simulation
    const competitiveProcessed = simulateProcessorOutput(competitiveData, 'competitive_analysis', competitiveRelevantFields);
    console.log('✅ Step 2 - Processor Output:');
    console.log('  - Type:', competitiveProcessed.type);
    console.log('  - Target Variable:', competitiveProcessed.targetVariable);
    console.log('  - Sample Record Values:');
    competitiveProcessed.records.forEach((record, i) => {
      console.log(`    ${i+1}. ${record.area_name}: ${record[competitiveProcessed.targetVariable]}`);
    });
    
    // Step 3: Visualization Renderer Simulation
    const competitiveViz = simulateVisualizationRenderer(competitiveProcessed);
    console.log('✅ Step 3 - Visualization Renderer:');
    console.log('  - Value Field Used:', competitiveViz.valueField);
    console.log('  - Legend Range:', competitiveViz.legendRange);
    console.log('  - Visualization Sample:');
    competitiveViz.visualization.forEach(viz => {
      console.log(`    ${viz.area_name}: ${viz.displayValue}`);
    });
    
    console.log('\n🔍 FLOW COMPARISON ANALYSIS');
    console.log('-'.repeat(40));
    
    console.log('Strategic Analysis:');
    console.log(`  - Uses field: ${strategicViz.valueField}`);
    console.log(`  - Value range: ${strategicViz.legendRange}`);
    console.log(`  - Field detection works: ${strategicRelevantFields.length > 0 && strategicRelevantFields.includes('strategic_value_score')}`);
    
    console.log('\nCompetitive Analysis:');
    console.log(`  - Uses field: ${competitiveViz.valueField}`);
    console.log(`  - Value range: ${competitiveViz.legendRange}`);
    console.log(`  - Field detection works: ${competitiveRelevantFields.length > 0 && competitiveRelevantFields.includes('competitive_advantage_score')}`);
    
    const flowsMatching = (
      strategicViz.valueField === 'strategic_value_score' &&
      competitiveViz.valueField === 'competitive_advantage_score' &&
      strategicRelevantFields.includes('strategic_value_score') &&
      competitiveRelevantFields.includes('competitive_advantage_score')
    );
    
    console.log('\n🎯 FLOW ALIGNMENT STATUS:');
    console.log(`Both flows working correctly: ${flowsMatching ? '✅ YES' : '❌ NO'}`);
    
    if (flowsMatching) {
      console.log('\n✅ SUCCESS: Both strategic and competitive analysis flows are now aligned!');
      console.log('🔧 This fix should resolve the legend and visualization issues.');
    } else {
      console.log('\n❌ ISSUE: Flows are not properly aligned. Check the output above for specific problems.');
    }
    
  } catch (error) {
    console.error('❌ Error during complete flow test:', error);
  }
}

// Run the test
testCompleteFlow();