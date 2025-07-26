#!/usr/bin/env node

// Test the data overwrite issue in geographic joining
console.log('🔍 Testing Data Overwrite Issue in Geographic Joining...');
console.log('='.repeat(60));

// Simulate the problematic join logic from lines 2257-2268
const simulateDataJoin = (record, zipFeature) => {
  console.log('📊 BEFORE JOIN:');
  console.log('Original record:', {
    area_name: record.area_name,
    value: record.value,
    properties: record.properties
  });
  
  console.log('ZIP boundary feature:', {
    properties: zipFeature.properties
  });
  
  // The problematic join logic
  const joinedRecord = {
    ...record,              // Original data (has competitive scores)
    area_id: '12345',
    area_name: 'New Area Name',
    geometry: zipFeature.geometry,
    properties: {
      ...record.properties,          // Original properties 
      ...(zipFeature.properties || {}), // ← ZIP boundary properties can overwrite!
      zip_code: '12345',
      city_name: 'Test City'
    }
  };
  
  console.log('📊 AFTER JOIN:');
  console.log('Joined record:', {
    area_name: joinedRecord.area_name,
    value: joinedRecord.value,
    properties: joinedRecord.properties
  });
  
  // Check for overwrites
  console.log('🔍 OVERWRITE ANALYSIS:');
  const originalProps = record.properties || {};
  const zipProps = zipFeature.properties || {};
  const joinedProps = joinedRecord.properties || {};
  
  // Check specific fields that might be overwritten
  const criticalFields = ['value', 'competitive_advantage_score', 'nike_market_share', 'thematic_value'];
  
  criticalFields.forEach(field => {
    const originalValue = originalProps[field];
    const zipValue = zipProps[field];
    const finalValue = joinedProps[field];
    
    if (originalValue !== undefined && zipValue !== undefined && originalValue !== zipValue) {
      console.log(`❌ OVERWRITE DETECTED: ${field}`);
      console.log(`   Original: ${originalValue} → ZIP: ${zipValue} → Final: ${finalValue}`);
    } else if (originalValue !== finalValue) {
      console.log(`⚠️  VALUE CHANGED: ${field}`);
      console.log(`   Original: ${originalValue} → Final: ${finalValue}`);
    } else if (originalValue !== undefined) {
      console.log(`✅ PRESERVED: ${field} = ${originalValue}`);
    }
  });
  
  return joinedRecord;
};

// Test case 1: Clean ZIP boundary (no conflicting data)
console.log('🧪 TEST CASE 1: Clean ZIP boundary data');
const cleanRecord = {
  area_name: 'Manhattan 10001',
  value: 8.6, // Competitive score
  properties: {
    competitive_advantage_score: 8.6,
    nike_market_share: 28.5,
    thematic_value: 8.6 // Should be competitive score
  }
};

const cleanZipFeature = {
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    ID: '10001',
    DESCRIPTION: '10001 (Manhattan)',
    OBJECTID: 1
    // No conflicting competitive data
  }
};

const result1 = simulateDataJoin(cleanRecord, cleanZipFeature);
console.log('');

// Test case 2: Problematic ZIP boundary (has conflicting market share data)
console.log('🧪 TEST CASE 2: ZIP boundary with conflicting market share data');
const problematicRecord = {
  area_name: 'Manhattan 10001',
  value: 8.6, // Competitive score
  properties: {
    competitive_advantage_score: 8.6,
    nike_market_share: 28.5,
    thematic_value: 8.6 // Should be competitive score
  }
};

const problematicZipFeature = {
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    ID: '10001',
    DESCRIPTION: '10001 (Manhattan)',
    OBJECTID: 1,
    // PROBLEMATIC: ZIP boundary has raw market share data that overwrites!
    value_MP30034A_B_P: 28.5,  // Nike market share
    nike_market_share: 28.5,   // Duplicate field
    thematic_value: 28.5       // ← This overwrites the competitive score!
  }
};

const result2 = simulateDataJoin(problematicRecord, problematicZipFeature);
console.log('');

console.log('🎯 CONCLUSION:');
console.log('='.repeat(40));

if (result1.properties?.thematic_value === 8.6) {
  console.log('✅ TEST 1: Clean ZIP boundary preserves competitive scores');
} else {
  console.log('❌ TEST 1: Even clean ZIP boundary corrupts data');
}

if (result2.properties?.thematic_value !== 8.6) {
  console.log('❌ TEST 2: Problematic ZIP boundary overwrites competitive scores');
  console.log(`   thematic_value changed from 8.6 to ${result2.properties?.thematic_value}`);
  console.log('');
  console.log('🔧 FIX NEEDED:');
  console.log('   The join logic should preserve competitive analysis data');
  console.log('   and not let ZIP boundary properties overwrite processed scores.');
} else {
  console.log('✅ TEST 2: ZIP boundary with conflicting data handled correctly');
}

console.log('');
console.log('💡 INSIGHT:');
console.log('   If the ZIP boundary cache contains market share data that overwrites');
console.log('   the competitive advantage scores, this would explain why Claude');
console.log('   receives market share percentages instead of competitive scores.');