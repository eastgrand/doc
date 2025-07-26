#!/usr/bin/env node

// Test the thematic_value assignment logic (line 1618-1626)
console.log('🔍 Testing Thematic Value Assignment Logic...');
console.log('='.repeat(60));

// Simulate the scenario from line 1618-1626
const simulateThematicValueAssignment = (data, record) => {
  console.log(`🔍 [THEMATIC DEBUG] ${record.area_name}:`);
  console.log(`   data.type: "${data.type}"`);
  console.log(`   record.value: ${record.value} (${typeof record.value})`);
  console.log(`   record.properties?.thematic_value: ${record.properties?.thematic_value} (${typeof record.properties?.thematic_value})`);
  
  const rawValue = data.type === 'competitive_analysis' && typeof record.value === 'number' ? record.value : 
                   typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 
                   typeof record.value === 'number' ? record.value : 0;
  
  console.log(`   → rawValue selected: ${rawValue}`);
  
  // Check which condition was triggered
  if (data.type === 'competitive_analysis' && typeof record.value === 'number') {
    console.log(`   ✅ CORRECT PATH: Used record.value (competitive score)`);
  } else if (typeof record.properties?.thematic_value === 'number') {
    console.log(`   ⚠️  FALLBACK PATH 1: Used record.properties.thematic_value`);
  } else if (typeof record.value === 'number') {
    console.log(`   ⚠️  FALLBACK PATH 2: Used record.value (fallback)`);
  } else {
    console.log(`   ❌ DEFAULT PATH: Used 0`);
  }
  
  return rawValue;
};

// Test scenarios
console.log('📊 SCENARIO 1: Correct competitive analysis data');
const correctData = {
  type: 'competitive_analysis',
  records: [
    {
      area_name: 'Manhattan 10001',
      value: 8.6, // ← Competitive advantage score
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        // This field should NOT exist or affect the logic
        thematic_value: undefined
      }
    }
  ]
};

const result1 = simulateThematicValueAssignment(correctData, correctData.records[0]);
console.log(`   Final thematic_value: ${result1}`);
console.log('');

console.log('📊 SCENARIO 2: Missing record.value (the problem scenario)');
const problematicData = {
  type: 'competitive_analysis',
  records: [
    {
      area_name: 'Manhattan 10001',
      value: undefined, // ← MISSING! This is the problem
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        thematic_value: 28.5 // ← This would be used as fallback (market share!)
      }
    }
  ]
};

const result2 = simulateThematicValueAssignment(problematicData, problematicData.records[0]);
console.log(`   Final thematic_value: ${result2}`);
console.log('');

console.log('📊 SCENARIO 3: Wrong data.type');
const wrongTypeData = {
  type: 'demographic_analysis', // ← Not competitive_analysis
  records: [
    {
      area_name: 'Manhattan 10001',
      value: 8.6, // ← Competitive score available but wrong type
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        thematic_value: 28.5 // ← This would be used (market share!)
      }
    }
  ]
};

const result3 = simulateThematicValueAssignment(wrongTypeData, wrongTypeData.records[0]);
console.log(`   Final thematic_value: ${result3}`);
console.log('');

console.log('📊 SCENARIO 4: record.value is not a number');
const nonNumberData = {
  type: 'competitive_analysis',
  records: [
    {
      area_name: 'Manhattan 10001',
      value: '8.6', // ← String instead of number
      properties: {
        competitive_advantage_score: 8.6,
        nike_market_share: 28.5,
        thematic_value: 28.5 // ← This would be used (market share!)
      }
    }
  ]
};

const result4 = simulateThematicValueAssignment(nonNumberData, nonNumberData.records[0]);
console.log(`   Final thematic_value: ${result4}`);
console.log('');

console.log('🎯 ANALYSIS:');
console.log('='.repeat(40));

if (result1 > 0 && result1 <= 10) {
  console.log('✅ SCENARIO 1: Working correctly - competitive scores used');
} else {
  console.log('❌ SCENARIO 1: Failed - not using competitive scores');
}

if (result2 > 20) {
  console.log('❌ SCENARIO 2: Problem confirmed - missing record.value causes market share fallback');
  console.log(`   thematic_value = ${result2} (looks like market share %)`);
} else {
  console.log('✅ SCENARIO 2: No issue with missing record.value');
}

if (result3 > 20) {
  console.log('❌ SCENARIO 3: Problem confirmed - wrong data.type causes market share fallback');
  console.log(`   thematic_value = ${result3} (looks like market share %)`);
} else {
  console.log('✅ SCENARIO 3: No issue with data.type');
}

if (result4 > 20) {
  console.log('❌ SCENARIO 4: Problem confirmed - non-number record.value causes market share fallback');
  console.log(`   thematic_value = ${result4} (looks like market share %)`);
} else {
  console.log('✅ SCENARIO 4: No issue with record.value type');
}

console.log('');
console.log('💡 ROOT CAUSE IDENTIFICATION:');
console.log('   If your analysis shows market share % instead of competitive scores,');
console.log('   one of these scenarios (2, 3, or 4) is happening in the real data flow.');
console.log('');
console.log('🔧 DEBUGGING STEPS:');
console.log('   1. Check if data.type === "competitive_analysis" in browser console');
console.log('   2. Check if record.value is a number and contains competitive scores');
console.log('   3. Check if record.properties.thematic_value contains market share data');
console.log('   4. Look for the [THEMATIC DEBUG] messages in browser console');