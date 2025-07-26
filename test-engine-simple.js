// Simple test to check if AnalysisEngine can be imported and used
const fs = require('fs');

// Test by simulating what should happen in the strategic analysis flow
async function testStrategicFlow() {
  console.log('=== Testing Strategic Analysis Flow ===\n');

  // 1. Test data file
  console.log('1. Testing data file:');
  try {
    const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
    console.log(`   ✅ Data loaded: ${data.results.length} records`);
    
    const first3 = data.results.slice(0, 3);
    console.log('   First 3 strategic_value_scores:');
    first3.forEach((record, i) => {
      console.log(`   ${i+1}. ${record.DESCRIPTION}: ${record.strategic_value_score}`);
    });
    
    // Check for the issue
    const values = first3.map(r => r.strategic_value_score);
    const uniqueValues = [...new Set(values)];
    
    if (uniqueValues.length === 1) {
      console.log('   🚨 PROBLEM: All values identical in data file');
    } else {
      console.log('   ✅ Data file has distinct values');
    }
    
  } catch (error) {
    console.log('   ❌ Data file test failed:', error.message);
  }

  // 2. Test what StrategicAnalysisProcessor should do
  console.log('\n2. Testing StrategicAnalysisProcessor logic:');
  try {
    const data = JSON.parse(fs.readFileSync('./public/data/endpoints/strategic-analysis.json', 'utf8'));
    
    // Simulate StrategicAnalysisProcessor.process()
    const processedRecords = data.results.slice(0, 5).map((record, index) => {
      const primaryScore = Number(record.strategic_value_score);
      
      return {
        area_id: record.ID,
        area_name: record.DESCRIPTION,
        value: Math.round(primaryScore * 100) / 100,
        rank: index + 1,
        properties: {
          strategic_value_score: primaryScore,
          score_source: 'strategic_value_score'
        }
      };
    });
    
    // Sort by value descending 
    const ranked = processedRecords.sort((a, b) => b.value - a.value)
      .map((record, index) => ({ ...record, rank: index + 1 }));
    
    console.log('   Processed records (what AnalysisEngine should return):');
    ranked.forEach((record, i) => {
      console.log(`   ${i+1}. ${record.area_name}: value=${record.value}`);
    });
    
    // Check if all processed values are the same
    const processedValues = ranked.map(r => r.value);
    const uniqueProcessed = [...new Set(processedValues)];
    
    if (uniqueProcessed.length === 1) {
      console.log('   🚨 PROBLEM: All processed values identical');
    } else {
      console.log('   ✅ Processed values are distinct');
    }
    
  } catch (error) {
    console.log('   ❌ Processing test failed:', error.message);
  }

  // 3. Test what should be sent to Claude
  console.log('\n3. Testing Claude data format:');
  try {
    const testData = {
      type: 'strategic_analysis',
      records: [
        { area_name: '11234 (Brooklyn)', value: 79.34, properties: { strategic_value_score: 79.34 } },
        { area_name: '11385 (Ridgewood)', value: 79.17, properties: { strategic_value_score: 79.17 } },
        { area_name: '10314 (Staten Island)', value: 79.12, properties: { strategic_value_score: 79.12 } }
      ],
      targetVariable: 'strategic_value_score'
    };
    
    console.log('   Claude should receive:');
    console.log(`   - type: ${testData.type}`);
    console.log(`   - targetVariable: ${testData.targetVariable}`);
    console.log('   - records:');
    testData.records.forEach((record, i) => {
      console.log(`     ${i+1}. ${record.area_name}: value=${record.value}`);
    });
    
    // Check what analysisType would be derived
    const derivedType = testData.type.replace(/_/g, '-'); // strategic_analysis -> strategic-analysis
    console.log(`   - derivedAnalysisType: ${derivedType}`);
    
    // Test mapping
    const typeMapping = {
      'strategic': 'strategic_analysis',
      'strategy': 'strategic_analysis'
    };
    const normalizedType = derivedType.toLowerCase().replace(/-/g, '_');
    const mappedType = typeMapping[normalizedType.split('_')[0]] || normalizedType;
    
    console.log(`   - normalizedType: ${normalizedType}`);
    console.log(`   - mappedType: ${mappedType}`);
    console.log(`   - Should use strategic_analysis prompt: ${mappedType === 'strategic_analysis' ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('   ❌ Claude data test failed:', error.message);
  }
}

testStrategicFlow();