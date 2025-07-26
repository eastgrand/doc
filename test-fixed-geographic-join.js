#!/usr/bin/env node

// Test the FIXED geographic join logic
console.log('🔧 Testing FIXED Geographic Join Logic...');
console.log('='.repeat(60));

// Simulate the FIXED join logic with competitive field preservation
const simulateFixedDataJoin = (record, zipFeature, analysisType) => {
  console.log('📊 BEFORE JOIN:');
  console.log('Original record:', {
    area_name: record.area_name,
    value: record.value,
    properties: record.properties
  });
  
  console.log('ZIP boundary feature:', {
    properties: zipFeature.properties
  });
  
  console.log('Analysis type:', analysisType);
  
  // The FIXED join logic
  const isCompetitiveAnalysis = analysisType === 'competitive_analysis';
  const competitiveFields = ['value', 'competitive_advantage_score', 'thematic_value'];
  
  // Preserve original competitive data
  const preservedProps = { ...record.properties };
  const zipProps = { ...(zipFeature.properties || {}) };
  
  // For competitive analysis, don't let ZIP boundary overwrite competitive fields
  if (isCompetitiveAnalysis) {
    console.log('🔧 COMPETITIVE ANALYSIS: Preserving competitive fields');
    competitiveFields.forEach(field => {
      if (preservedProps[field] !== undefined) {
        console.log(`   Removing conflicting ${field} from ZIP boundary: ${zipProps[field]} → deleted`);
        delete zipProps[field]; // Remove conflicting field from ZIP boundary
      }
    });
  } else {
    console.log('📊 NON-COMPETITIVE ANALYSIS: Using standard join logic');
  }
  
  const joinedRecord = {
    ...record,
    area_id: '12345',
    area_name: 'New Area Name',
    geometry: zipFeature.geometry,
    properties: {
      ...preservedProps,  // Original competitive data first
      ...zipProps,        // ZIP boundary data (without conflicts)
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
  
  // Check for preservation
  console.log('🔍 PRESERVATION ANALYSIS:');
  const originalProps = record.properties || {};
  const finalProps = joinedRecord.properties || {};
  
  competitiveFields.forEach(field => {
    const originalValue = originalProps[field];
    const finalValue = finalProps[field];
    
    if (originalValue !== undefined) {
      if (originalValue === finalValue) {
        console.log(`✅ PRESERVED: ${field} = ${originalValue}`);
      } else {
        console.log(`❌ CORRUPTED: ${field} changed from ${originalValue} to ${finalValue}`);
      }
    }
  });
  
  return joinedRecord;
};

// Test case 1: Competitive analysis with conflicting ZIP boundary data
console.log('🧪 TEST CASE 1: Competitive analysis with conflicting ZIP boundary');
const competitiveRecord = {
  area_name: 'Manhattan 10001',
  value: 8.6, // Competitive score
  properties: {
    competitive_advantage_score: 8.6,
    nike_market_share: 28.5,
    thematic_value: 8.6 // Should be competitive score
  }
};

const conflictingZipFeature = {
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    ID: '10001',
    DESCRIPTION: '10001 (Manhattan)',
    OBJECTID: 1,
    // CONFLICTING DATA that should be ignored for competitive analysis:
    value_MP30034A_B_P: 28.5,  // Nike market share
    competitive_advantage_score: 2.5,  // Wrong score
    thematic_value: 28.5       // Market share that would overwrite competitive score
  }
};

const result1 = simulateFixedDataJoin(competitiveRecord, conflictingZipFeature, 'competitive_analysis');
console.log('');

// Test case 2: Non-competitive analysis (should use original logic)
console.log('🧪 TEST CASE 2: Non-competitive analysis (standard behavior)');
const demographicRecord = {
  area_name: 'Manhattan 10001',
  value: 45000, // Population
  properties: {
    population: 45000,
    income: 65000,
    thematic_value: 45000
  }
};

const demographicZipFeature = {
  geometry: { type: 'Polygon', coordinates: [] },
  properties: {
    ID: '10001',
    DESCRIPTION: '10001 (Manhattan)',
    OBJECTID: 1,
    // This should be merged normally for non-competitive analysis:
    population: 50000,  // Different population value
    thematic_value: 50000
  }
};

const result2 = simulateFixedDataJoin(demographicRecord, demographicZipFeature, 'demographic_analysis');
console.log('');

console.log('🎯 RESULTS:');
console.log('='.repeat(40));

if (result1.properties?.thematic_value === 8.6) {
  console.log('✅ COMPETITIVE ANALYSIS: Competitive scores preserved correctly');
  console.log(`   thematic_value = ${result1.properties.thematic_value} (competitive score)`);
} else {
  console.log('❌ COMPETITIVE ANALYSIS: Failed to preserve competitive scores');
  console.log(`   thematic_value = ${result1.properties?.thematic_value} (should be 8.6)`);
}

if (result2.properties?.thematic_value === 50000) {
  console.log('✅ NON-COMPETITIVE ANALYSIS: ZIP boundary data merged correctly');
  console.log(`   thematic_value = ${result2.properties.thematic_value} (from ZIP boundary)`);
} else {
  console.log('❌ NON-COMPETITIVE ANALYSIS: Failed to merge ZIP boundary data');
  console.log(`   thematic_value = ${result2.properties?.thematic_value} (should be 50000)`);
}

console.log('');
console.log('💡 SUMMARY:');
console.log('   The fix preserves competitive analysis data while allowing');
console.log('   normal ZIP boundary merging for other analysis types.');
console.log('   This should resolve the market share percentage issue in Claude responses.');