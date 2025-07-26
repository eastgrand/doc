const fs = require('fs');

// Mock the entire strategic analysis flow locally
console.log('=== COMPLETE STRATEGIC ANALYSIS DEBUG (LOCAL) ===\n');

// 1. Load real data
const strategicData = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
console.log('1. ✅ Data loaded:', strategicData.results.length, 'records');

// 2. Mock StrategicAnalysisProcessor.process()
function mockStrategicProcessor(rawData) {
  const processedRecords = rawData.results.slice(0, 100).map((record, index) => {
    const primaryScore = Number(record.strategic_value_score);
    
    if (isNaN(primaryScore)) {
      throw new Error(`Strategic analysis record ${record.ID || index} is missing strategic_value_score`);
    }
    
    return {
      area_id: record.ID || `area_${index + 1}`,
      area_name: record.DESCRIPTION || 'Unknown Area',
      value: Math.round(primaryScore * 100) / 100,
      strategic_value_score: Math.round(primaryScore * 100) / 100, // Add at top level for visualization
      rank: 0, // Will be calculated after sorting
      properties: {
        ...record,
        strategic_value_score: primaryScore,
        score_source: 'strategic_value_score'
      }
    };
  });

  // Sort by strategic value (descending)
  const rankedRecords = processedRecords.sort((a, b) => b.strategic_value_score - a.strategic_value_score);
  rankedRecords.forEach((record, index) => {
    record.rank = index + 1;
  });

  return {
    type: 'strategic_analysis',
    records: rankedRecords,
    targetVariable: 'strategic_value_score',
    summary: 'Strategic analysis for Nike expansion',
    statistics: {
      total: rankedRecords.length,
      min: Math.min(...rankedRecords.map(r => r.strategic_value_score)),
      max: Math.max(...rankedRecords.map(r => r.strategic_value_score)),
      avg: rankedRecords.reduce((sum, r) => sum + r.strategic_value_score, 0) / rankedRecords.length
    }
  };
}

// 3. Mock VisualizationRenderer.determineValueField()
function mockDetermineValueField(data) {
  if (data.targetVariable) {
    console.log(`[VisualizationRenderer] Using targetVariable for ${data.type}: ${data.targetVariable}`);
    return data.targetVariable;
  }
  return 'value';
}

// 4. Mock ChoroplethRenderer.calculateClassBreaks() with REAL debug logic
function mockCalculateClassBreaks(data, config) {
  const fieldToUse = config.valueField || 'value';
  console.log(`[ChoroplethRenderer] Using field for class breaks: ${fieldToUse}`);
  console.log(`[ChoroplethRenderer] Data type: ${data.type}`);
  console.log(`[ChoroplethRenderer] Record count: ${data.records.length}`);
  
  // Debug first few records - EXACT same logic as real renderer
  console.log(`[ChoroplethRenderer] First 3 records structure:`);
  data.records.slice(0, 3).forEach((record, i) => {
    console.log(`  Record ${i + 1}:`, {
      area_name: record.area_name,
      value: record.value,
      [fieldToUse]: record[fieldToUse],
      hasTargetField: fieldToUse in record,
      targetFieldType: typeof record[fieldToUse]
    });
  });
  
  const values = data.records.map(r => r[fieldToUse]).filter(v => v !== undefined && !isNaN(v));
  console.log(`[ChoroplethRenderer] Extracted ${values.length} valid values from ${data.records.length} records`);
  
  if (values.length === 0) {
    console.log('❌ CRITICAL: No values extracted - this would cause grey visualization!');
    return [0, 1];
  }
  
  console.log(`[ChoroplethRenderer] Value range: ${Math.min(...values)} to ${Math.max(...values)}`);
  
  // Calculate quartile breaks
  const sorted = values.sort((a, b) => a - b);
  const breaks = [
    sorted[0],
    sorted[Math.floor(sorted.length * 0.25)],
    sorted[Math.floor(sorted.length * 0.5)],
    sorted[Math.floor(sorted.length * 0.75)],
    sorted[sorted.length - 1]
  ];
  
  console.log(`[ChoroplethRenderer] Quartile breaks:`, breaks);
  return breaks;
}

// 5. Mock ArcGIS renderer creation
function mockCreateArcGISRenderer(classBreaks, config) {
  const rendererField = config.valueField || 'value';
  console.log(`[ChoroplethRenderer] 🎯 Creating ArcGIS renderer with field: "${rendererField}"`);
  console.log(`[ChoroplethRenderer] 🎯 Class break count: ${classBreaks.length - 1}`);
  console.log(`[ChoroplethRenderer] 🎯 First class break:`, {
    minValue: classBreaks[0],
    maxValue: classBreaks[1]
  });
  
  const classBreakInfos = [];
  for (let i = 0; i < classBreaks.length - 1; i++) {
    classBreakInfos.push({
      minValue: classBreaks[i],
      maxValue: classBreaks[i + 1],
      symbol: {
        type: 'simple-fill',
        color: [255 - (i * 50), 100 + (i * 40), 50 + (i * 30), 0.8],
        outline: { color: '#FFFFFF', width: 0.5 }
      },
      label: `${classBreaks[i].toFixed(1)} - ${classBreaks[i + 1].toFixed(1)}`
    });
  }
  
  return {
    type: 'class-breaks',
    field: rendererField,
    classBreakInfos,
    defaultSymbol: {
      type: 'simple-fill',
      color: [200, 200, 200, 0.8],
      outline: { color: '#CCCCCC', width: 0.5 }
    }
  };
}

// 6. Mock feature attribute creation (like geospatial-chat-interface.tsx)
function mockCreateFeatureAttributes(record, data) {
  return {
    OBJECTID: record.rank,
    area_name: record.area_name,
    value: record.value,
    // This is the CRITICAL mapping from line 1675 in geospatial-chat-interface.tsx
    strategic_value_score: typeof record.strategic_value_score === 'number' ? 
      record.strategic_value_score : 
      (typeof record.properties?.strategic_value_score === 'number' ? 
        record.properties.strategic_value_score : 
        (typeof record.value === 'number' ? record.value : 0)),
    ID: record.area_id,
    DESCRIPTION: record.area_name
  };
}

// RUN THE COMPLETE TEST
try {
  console.log('2. 🔄 Processing data...');
  const processedData = mockStrategicProcessor(strategicData);
  console.log('   ✅ Processed:', processedData.records.length, 'records');
  console.log('   ✅ Type:', processedData.type);
  console.log('   ✅ TargetVariable:', processedData.targetVariable);
  console.log('   ✅ Score range:', processedData.statistics.min, 'to', processedData.statistics.max);

  console.log('\n3. 🎯 Determining value field...');
  const valueField = mockDetermineValueField(processedData);
  const config = { valueField, type: 'choropleth' };
  console.log('   ✅ Config created:', config);

  console.log('\n4. 📊 Calculating class breaks...');
  const classBreaks = mockCalculateClassBreaks(processedData, config);
  
  console.log('\n5. 🎨 Creating ArcGIS renderer...');
  const renderer = mockCreateArcGISRenderer(classBreaks, config);
  
  console.log('\n6. 🗺️ Testing feature attributes...');
  const sampleFeature = mockCreateFeatureAttributes(processedData.records[0], processedData);
  console.log('   Sample feature attributes:', {
    area_name: sampleFeature.area_name,
    strategic_value_score: sampleFeature.strategic_value_score,
    hasRendererField: renderer.field in sampleFeature,
    rendererFieldValue: sampleFeature[renderer.field]
  });
  
  console.log('\n7. 🔍 Final verification...');
  
  // Check if renderer field matches feature attributes
  const rendererField = renderer.field;
  const featureHasField = rendererField in sampleFeature;
  const fieldValue = sampleFeature[rendererField];
  
  console.log('   - Renderer expects field:', rendererField);
  console.log('   - Feature has field:', featureHasField);
  console.log('   - Field value:', fieldValue);
  console.log('   - Field value type:', typeof fieldValue);
  
  if (!featureHasField) {
    console.log('❌ PROBLEM: Feature missing renderer field');
    console.log('   Available fields:', Object.keys(sampleFeature));
  } else if (fieldValue === undefined || isNaN(fieldValue)) {
    console.log('❌ PROBLEM: Field value is invalid');
  } else {
    // Check if value falls within class breaks
    const inRange = fieldValue >= classBreaks[0] && fieldValue <= classBreaks[classBreaks.length - 1];
    console.log('   - Value in class break range:', inRange);
    
    if (inRange) {
      console.log('✅ SUCCESS: Strategic analysis rendering should work correctly!');
      console.log('   🎨 Features should display with proper colors based on strategic_value_score');
    } else {
      console.log('❌ PROBLEM: Value outside class break range');
    }
  }
  
  console.log('\n=== DIAGNOSIS COMPLETE ===');
  if (featureHasField && !isNaN(fieldValue) && fieldValue >= classBreaks[0] && fieldValue <= classBreaks[classBreaks.length - 1]) {
    console.log('🎯 RESULT: The strategic analysis flow is CORRECT');
    console.log('   If visualization is still grey, the issue is:');
    console.log('   1. ArcGIS runtime/timing issues');
    console.log('   2. JavaScript errors in browser');
    console.log('   3. Layer creation or map rendering problems');
  } else {
    console.log('🎯 RESULT: Found the exact issue in the data flow');
  }

} catch (error) {
  console.error('❌ Error in strategic analysis test:', error);
  console.log('Stack trace:', error.stack);
}