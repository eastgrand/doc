/**
 * Comprehensive ZIP Code Zoom Test
 * Based on actual logs and data from the clustering system
 */

// The REAL issue: Only 5 features available instead of 575
// From the error: availableFeatures: Array(5)

console.log('🚨 COMPREHENSIVE ZIP CODE ZOOM TEST - REAL ISSUE SIMULATION\n');

// Simulate what the browser actually has (the problem scenario)
const actualBrowserFeatures = [
  // These are likely the 5 CLUSTER SUMMARIES, not individual ZIP codes
  {
    area_name: "Corona Territory",
    cluster_id: 0,
    properties: { cluster_id: 0 },
    geometry: { type: "Polygon", coordinates: [] } // Cluster boundary, not individual ZIP
  },
  {
    area_name: "West Chester Territory", 
    cluster_id: 1,
    properties: { cluster_id: 1 },
    geometry: { type: "Polygon", coordinates: [] }
  },
  {
    area_name: "Philadelphia Territory",
    cluster_id: 2, 
    properties: { cluster_id: 2 },
    geometry: { type: "Polygon", coordinates: [] }
  },
  {
    area_name: "Lakewood Territory",
    cluster_id: 3,
    properties: { cluster_id: 3 },
    geometry: { type: "Polygon", coordinates: [] }
  },
  {
    area_name: "Egg Harbor Territory",
    cluster_id: 4,
    properties: { cluster_id: 4 },
    geometry: { type: "Polygon", coordinates: [] }
  }
];

// What SHOULD be available (the 575 individual ZIP records)
const expectedClusteredZipFeatures = [
  // Corona Territory ZIPs (cluster_id: 0)
  {
    area_name: "11368 (Corona)",
    cluster_id: 0,
    properties: { zip_code: "11368", cluster_id: 0 },
    geometry: { type: "Polygon", coordinates: [[[-73.8, 40.7]]] }
  },
  {
    area_name: "11369 (East Elmhurst)", 
    cluster_id: 0,
    properties: { zip_code: "11369", cluster_id: 0 },
    geometry: { type: "Polygon", coordinates: [[[-73.8, 40.7]]] }
  },
  // West Chester Territory ZIPs (cluster_id: 1)
  {
    area_name: "19380 (West Chester)",
    cluster_id: 1,
    properties: { zip_code: "19380", cluster_id: 1 },
    geometry: { type: "Polygon", coordinates: [[[-75.6, 39.9]]] }
  },
  {
    area_name: "19382 (West Chester)",
    cluster_id: 1, 
    properties: { zip_code: "19382", cluster_id: 1 },
    geometry: { type: "Polygon", coordinates: [[[-75.6, 39.9]]] }
  },
  // Philadelphia Territory ZIPs (cluster_id: 2)
  {
    area_name: "19111 (Philadelphia)",
    cluster_id: 2,
    properties: { zip_code: "19111", cluster_id: 2 },
    geometry: { type: "Polygon", coordinates: [[[-75.1, 40.0]]] }
  },
  // Lakewood Territory ZIPs (cluster_id: 3) 
  {
    area_name: "08701 (Lakewood)",
    cluster_id: 3,
    properties: { zip_code: "08701", cluster_id: 3 },
    geometry: { type: "Polygon", coordinates: [[[-74.2, 40.0]]] }
  },
  // Egg Harbor Territory ZIPs (cluster_id: 4)
  {
    area_name: "08234 (Egg Harbor Township)",
    cluster_id: 4,
    properties: { zip_code: "08234", cluster_id: 4 },
    geometry: { type: "Polygon", coordinates: [[[-74.6, 39.4]]] }
  }
];

// Test function from the actual code
function testZipSearch(features, targetZip) {
  const normalizeId = (id) => {
    if (!id) return '';
    if (/^\d{5}/.test(id)) {
      return id.substring(0, 5).toUpperCase();
    }
    return id.toString().toUpperCase().trim();
  };

  const targetId = normalizeId(targetZip);
  console.log(`🔍 Searching for "${targetZip}" → normalized: "${targetId}"`);
  console.log(`📊 Searching in ${features.length} features`);

  const matches = features.filter(feature => {
    let featureIdValue = feature.properties?.FSA_ID || 
                     feature.properties?.ID || 
                     feature.properties?.OBJECTID ||
                     feature.properties?.id ||
                     feature.properties?.area_id ||
                     feature.properties?.zip_code ||
                     feature.properties?.ZIPCODE ||
                     feature.properties?.ZIP;
    
    // Extract ZIP from area_name like "11368 (Corona)"
    if (!featureIdValue && feature.area_name) {
      const zipMatch = feature.area_name.match(/^\d{5}/);
      if (zipMatch) {
        featureIdValue = zipMatch[0];
      }
    }
    
    // Fallback to area_name directly
    if (!featureIdValue && feature.area_name) {
      featureIdValue = feature.area_name;
    }
    
    if (!featureIdValue) return false;
    
    const normalizedFeatureId = normalizeId(featureIdValue.toString());
    return normalizedFeatureId === targetId;
  });

  console.log(`📋 Available features sample:`, features.slice(0, 3).map(f => ({
    area_name: f.area_name,
    cluster_id: f.cluster_id,
    hasZipInName: /^\d{5}/.test(f.area_name || ''),
    extractedZip: f.area_name?.match(/^\d{5}/)?.[0] || null
  })));

  if (matches.length > 0) {
    console.log(`✅ FOUND ${matches.length} matches:`, matches.map(m => ({
      area_name: m.area_name,
      cluster_id: m.cluster_id,
      hasGeometry: !!m.geometry
    })));
  } else {
    console.log(`❌ NO MATCHES found for "${targetZip}"`);
  }
  
  return matches;
}

// TEST 1: What happens with the ACTUAL browser data (5 cluster summaries)
console.log('=== TEST 1: Current Browser State (BROKEN) ===');
console.log('This simulates what the browser actually has:\n');

const testZips = ['11368', '08701', '19380', '19111', '08234'];

testZips.forEach(zip => {
  console.log(`--- Testing ${zip} with 5 cluster summaries ---`);
  testZipSearch(actualBrowserFeatures, zip);
  console.log('');
});

console.log('\n=== TEST 2: What SHOULD Happen (WORKING) ===');
console.log('This simulates what the browser should have:\n');

testZips.forEach(zip => {
  console.log(`--- Testing ${zip} with individual ZIP records ---`);
  testZipSearch(expectedClusteredZipFeatures, zip);
  console.log('');
});

console.log('\n=== DIAGNOSIS ===');
console.log('🚨 ROOT CAUSE IDENTIFIED:');
console.log('❌ Browser has: 5 cluster territory summaries (no individual ZIP codes)');
console.log('✅ Browser needs: 575 individual ZIP records with cluster_id fields');
console.log('');
console.log('🔧 THE FIX NEEDED:');
console.log('The issue is in the data flow from ClusteringService to the React component.');
console.log('The individual ZIP records (clusteredZipRecords) are not reaching the features state.');
console.log('');
console.log('📍 WHERE TO FIX:');
console.log('1. Check how clustered data flows to the visualization component');
console.log('2. Ensure the 575 individual ZIP records (not just 5 cluster summaries) are passed to features state');
console.log('3. The individual records should have both area_name="11368 (Corona)" AND cluster_id=0');
console.log('');
console.log('🎯 EXPECTED RESULT AFTER FIX:');
console.log('- features.length should be 575, not 5');
console.log('- Each feature should have area_name like "11368 (Corona)"');
console.log('- Each feature should have cluster_id (0, 1, 2, 3, 4)');
console.log('- ZIP code search will then work because individual ZIP geometries are available');