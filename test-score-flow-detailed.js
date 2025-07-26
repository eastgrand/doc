// Detailed test of the score flow from data to UI
const fs = require('fs');
const path = require('path');

// Mock the StrategicAnalysisProcessor more accurately
class MockStrategicAnalysisProcessor {
  process(rawData) {
    console.log('📊 [PROCESSOR] Processing strategic analysis data...');
    
    const processedRecords = rawData.results.slice(0, 5).map((record, index) => {
      const primaryScore = Number(record.strategic_value_score);
      const processedValue = Math.round(primaryScore * 100) / 100;
      
      const result = {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: processedValue,  // This is the key field
        rank: index + 1,
        properties: {
          ...record,
          strategic_value_score: primaryScore
        }
      };
      
      console.log(`   Record ${index + 1}: area_id=${result.area_id}, value=${result.value}, properties.strategic_value_score=${result.properties.strategic_value_score}`);
      return result;
    });
    
    return {
      type: 'strategic_analysis',  // Fixed type
      records: processedRecords
    };
  }
}

// Mock the UI logic that determines targetValue
function getTargetValue(result, analysisType) {
  console.log(`\n🎯 [UI LOGIC] Getting target value for ${result.area_name}:`);
  console.log(`   analysisType: ${analysisType}`);
  console.log(`   result.value: ${result.value}`);
  console.log(`   result.properties?.strategic_value_score: ${result.properties?.strategic_value_score}`);
  
  let targetValue;
  
  if (analysisType === 'strategic_analysis') {
    // This is the UI logic from line 2707-2710
    targetValue = result.properties?.strategic_value_score || 
                 result.strategic_value_score || 
                 result.value || 
                 0;
    console.log(`   ✅ Using strategic_value_score: ${targetValue}`);
  } else {
    targetValue = result.value || 0;
    console.log(`   Using result.value: ${targetValue}`);
  }
  
  return targetValue;
}

async function testDetailedScoreFlow() {
  console.log('=== DETAILED SCORE FLOW TEST ===\n');
  
  // 1. Load raw data
  const rawData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/endpoints/strategic-analysis.json'), 'utf8'));
  console.log('1. RAW DATA loaded:', rawData.results.slice(0, 5).map(r => ({
    ID: r.ID,
    strategic_value_score: r.strategic_value_score
  })));
  
  // 2. Process through StrategicAnalysisProcessor
  const processor = new MockStrategicAnalysisProcessor();
  const processedData = processor.process(rawData);
  console.log(`\n2. PROCESSED DATA type: ${processedData.type}`);
  
  // 3. Simulate UI logic
  console.log('\n3. UI TARGET VALUE CALCULATION:');
  processedData.records.forEach(result => {
    const targetValue = getTargetValue(result, processedData.type);
    console.log(`   Final targetValue for ${result.area_name}: ${targetValue}`);
  });
  
  // 4. Check if there's any field that has 79.3 value
  console.log('\n4. CHECKING FOR 79.3 VALUES IN DATA:');
  const firstRecord = rawData.results[0];
  Object.keys(firstRecord).forEach(key => {
    const value = firstRecord[key];
    if (typeof value === 'number' && Math.abs(value - 79.3) < 0.1) {
      console.log(`   🚨 FOUND 79.3 in field: ${key} = ${value}`);
    }
  });
  
  console.log('\n5. CONCLUSION:');
  console.log('   If all targetValues are different but UI shows 79.3,');
  console.log('   the bug must be in Claude AI interpretation or display formatting.');
}

testDetailedScoreFlow();