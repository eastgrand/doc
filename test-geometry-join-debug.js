#!/usr/bin/env node

/**
 * Debug Geometry Join Issue
 * Test why ZIP boundary join might be failing
 */

console.log('🗺️ DEBUGGING GEOMETRY JOIN ISSUE');
console.log('=' + '='.repeat(60));

// Test 1: Simulate ZIP boundary join logic
function simulateZipBoundaryJoin() {
  console.log('\n📍 SIMULATING ZIP BOUNDARY JOIN');
  
  // Mock analysis record (what comes from AnalysisEngine)
  const analysisRecord = {
    area_id: '08837',
    area_name: 'Edison',
    value: 79.34,
    strategic_value_score: 79.34,
    properties: {
      ID: '08837',
      thematic_value: 26.14
    }
  };
  
  // Mock ZIP boundary features (what should exist in geographicFeatures)
  const mockZipFeatures = [
    {
      properties: {
        ID: '08837',
        DESCRIPTION: '08837 (Edison)',
        ZIP: '08837',
        ZIPCODE: '08837'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[1,1],[2,2],[1,2],[1,1]]]
      }
    },
    {
      properties: {
        ID: '07001',
        DESCRIPTION: '07001 (Newark)',
        ZIP: '07001'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[[3,3],[4,4],[3,4],[3,3]]]
      }
    }
  ];
  
  console.log('Analysis Record:', {
    area_id: analysisRecord.area_id,
    properties_ID: analysisRecord.properties?.ID
  });
  
  console.log('Available ZIP Features:', 
    mockZipFeatures.map(f => ({
      ID: f.properties.ID,
      DESCRIPTION: f.properties.DESCRIPTION,
      hasGeometry: !!f.geometry
    }))
  );
  
  // Simulate the join logic
  const recordAreaId = analysisRecord.area_id;
  const recordPropertiesID = analysisRecord.properties?.ID;
  const primaryId = recordPropertiesID || recordAreaId;
  const rawZip = String(primaryId || 'area_0');
  const recordZip = rawZip.padStart(5, '0');
  
  console.log('Join Logic:', {
    recordAreaId,
    recordPropertiesID,
    primaryId,
    rawZip,
    recordZip
  });
  
  // Find matching ZIP feature
  const zipFeature = mockZipFeatures.find(f => 
    f?.properties && (
      String(f.properties.ID).padStart(5, '0') === recordZip ||
      String(f.properties.ZIP).padStart(5, '0') === recordZip ||
      String(f.properties.ZIPCODE).padStart(5, '0') === recordZip ||
      f.properties.DESCRIPTION?.match(/^(\d{5})/)?.[1] === recordZip
    )
  );
  
  console.log('Match Result:', {
    found: !!zipFeature,
    matchedBy: zipFeature ? Object.keys(zipFeature.properties).find(key => 
      String(zipFeature.properties[key]).padStart(5, '0') === recordZip
    ) : null,
    hasGeometry: zipFeature?.geometry ? true : false
  });
  
  if (zipFeature) {
    console.log('✅ SUCCESS: Found matching ZIP boundary with geometry');
    return true;
  } else {
    console.log('❌ FAILURE: No matching ZIP boundary found - will have null geometry');
    return false;
  }
}

// Test 2: Common join failure scenarios
function testJoinFailureScenarios() {
  console.log('\n\n❌ TESTING JOIN FAILURE SCENARIOS');
  
  const scenarios = [
    {
      name: 'Missing area_id',
      record: { properties: {} },
      description: 'Record has no area_id or properties.ID'
    },
    {
      name: 'Non-numeric area_id',
      record: { area_id: 'area_123', properties: {} },
      description: 'area_id is not a ZIP code format'
    },
    {
      name: 'Wrong ZIP format',
      record: { area_id: '8837', properties: {} },
      description: 'ZIP code missing leading zero'
    },
    {
      name: 'ID in wrong field',
      record: { some_other_field: '08837', properties: {} },
      description: 'ZIP code in unexpected field'
    }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n🔍 Scenario: ${scenario.name}`);
    console.log(`   Description: ${scenario.description}`);
    
    const recordAreaId = scenario.record.area_id;
    const recordPropertiesID = scenario.record.properties?.ID;
    const primaryId = recordPropertiesID || recordAreaId;
    const rawZip = String(primaryId || 'area_0');
    const recordZip = rawZip.padStart(5, '0');
    
    console.log(`   Extracted ZIP: "${recordZip}"`);
    
    if (recordZip.startsWith('area_') || recordZip === '00000') {
      console.log(`   ❌ WILL FAIL: Invalid ZIP format`);
    } else {
      console.log(`   ✅ MIGHT WORK: Valid ZIP format`);
    }
  });
}

// Test 3: Suggest fixes
function suggestFixes() {
  console.log('\n\n💡 SUGGESTED FIXES FOR GEOMETRY JOIN ISSUES');
  
  const fixes = [
    '1. Check if geographic features (ZIP boundaries) are actually loaded',
    '2. Verify that analysis records have proper area_id or properties.ID fields',
    '3. Check console logs for "No boundary match" warnings',
    '4. Ensure ZIP boundary data contains ID/ZIP/ZIPCODE fields',
    '5. Verify ZIP codes are 5-digit format (with leading zeros)',
    '6. Check if geometry is valid (not null/empty coordinates)'
  ];
  
  fixes.forEach(fix => console.log(`   ${fix}`));
  
  console.log('\n🔧 IMMEDIATE DEBUGGING STEPS:');
  console.log('   1. Look for "❌ [JOIN] No boundary match" warnings in browser console');
  console.log('   2. Check "JOIN RESULTS DEBUG" logs for recordsWithGeometry count');
  console.log('   3. If recordsWithGeometry = 0, the geometry join is completely failing');
  console.log('   4. Check if geographicFeatures array is empty or malformed');
}

// Run tests
const joinWorks = simulateZipBoundaryJoin();
testJoinFailureScenarios();
suggestFixes();

console.log('\n' + '='.repeat(60));
console.log('🗺️ GEOMETRY JOIN DEBUG COMPLETE');
console.log(`Join Test Result: ${joinWorks ? '✅ Should work' : '❌ Will fail'}`);
console.log('Check browser console for actual join results!');