/**
 * Simulate ZIP code zoom functionality testing
 * Based on the logs and code analysis
 */

// Simulate the normalizeId function from the actual code
function normalizeId(id) {
  if (!id) return '';
  // For ZIP codes, take first 5 characters and uppercase
  if (/^\d{5}/.test(id)) {
    return id.substring(0, 5).toUpperCase();
  }
  // For other IDs, just uppercase and trim
  return id.toString().toUpperCase().trim();
}

// Simulate clustered feature data based on what we see in logs
const simulatedClusteredFeatures = [
  // Cluster 0 - Corona Territory (lots of NYC ZIP codes)
  {
    area_name: "11368 (Corona)",
    cluster_id: 0,
    cluster_name: "Corona Territory",
    properties: {
      zip_code: "11368",
      FSA_ID: "11368"
    },
    geometry: { type: "Polygon", coordinates: [[[-73.8, 40.7], [-73.7, 40.7], [-73.7, 40.8], [-73.8, 40.8], [-73.8, 40.7]]] }
  },
  {
    area_name: "11369 (East Elmhurst)",
    cluster_id: 0,
    cluster_name: "Corona Territory", 
    properties: {
      zip_code: "11369"
    },
    geometry: { type: "Polygon", coordinates: [[[-73.8, 40.7], [-73.7, 40.7], [-73.7, 40.8], [-73.8, 40.8], [-73.8, 40.7]]] }
  },
  
  // Cluster 1 - West Chester Territory  
  {
    area_name: "19380 (West Chester)",
    cluster_id: 1,
    cluster_name: "West Chester Territory",
    properties: {
      zip_code: "19380"
    },
    geometry: { type: "Polygon", coordinates: [[[-75.6, 39.9], [-75.5, 39.9], [-75.5, 40.0], [-75.6, 40.0], [-75.6, 39.9]]] }
  },
  {
    area_name: "19382 (West Chester)",
    cluster_id: 1,
    cluster_name: "West Chester Territory",
    properties: {
      zip_code: "19382"
    },
    geometry: { type: "Polygon", coordinates: [[[-75.6, 39.9], [-75.5, 39.9], [-75.5, 40.0], [-75.6, 40.0], [-75.6, 39.9]]] }
  },
  
  // Cluster 2 - Philadelphia Territory
  {
    area_name: "19111 (Philadelphia)",
    cluster_id: 2,
    cluster_name: "Philadelphia Territory",
    properties: {
      zip_code: "19111"
    },
    geometry: { type: "Polygon", coordinates: [[[-75.1, 40.0], [-75.0, 40.0], [-75.0, 40.1], [-75.1, 40.1], [-75.1, 40.0]]] }
  },
  
  // Cluster 3 - Lakewood Territory (should exist if ZIP matching is fixed)
  {
    area_name: "08701 (Lakewood)",
    cluster_id: 3,
    cluster_name: "Lakewood Territory",
    properties: {
      zip_code: "08701"
    },
    geometry: { type: "Polygon", coordinates: [[[-74.2, 40.0], [-74.1, 40.0], [-74.1, 40.1], [-74.2, 40.1], [-74.2, 40.0]]] }
  },
  
  // Cluster 4 - Egg Harbor Territory
  {
    area_name: "08234 (Egg Harbor Township)",
    cluster_id: 4,
    cluster_name: "Egg Harbor Territory",
    properties: {
      zip_code: "08234"
    },
    geometry: { type: "Polygon", coordinates: [[[-74.6, 39.4], [-74.5, 39.4], [-74.5, 39.5], [-74.6, 39.5], [-74.6, 39.4]]] }
  }
];

// Simulate non-clustered feature data
const simulatedNonClusteredFeatures = [
  {
    area_name: "Brooklyn",
    properties: {
      ID: "Brooklyn",
      FSA_ID: "Brooklyn"
    },
    geometry: { type: "Polygon", coordinates: [[[-74.0, 40.6], [-73.9, 40.6], [-73.9, 40.7], [-74.0, 40.7], [-74.0, 40.6]]] }
  },
  {
    area_name: "Manhattan", 
    properties: {
      ID: "Manhattan",
      FSA_ID: "Manhattan"
    },
    geometry: { type: "Polygon", coordinates: [[[-74.0, 40.7], [-73.9, 40.7], [-73.9, 40.8], [-74.0, 40.8], [-74.0, 40.7]]] }
  }
];

// Simulate the feature search logic
function simulateFeatureSearch(features, featureId) {
  const targetId = normalizeId(featureId);
  console.log(`🔍 Searching for: "${featureId}" → normalized: "${targetId}"`);
  
  const matches = features.filter(feature => {
    // Try multiple possible ID fields
    let featureIdValue = feature.properties?.FSA_ID || 
                     feature.properties?.ID || 
                     feature.properties?.OBJECTID ||
                     feature.properties?.id ||
                     feature.properties?.area_id ||
                     feature.properties?.zip_code ||
                     feature.properties?.ZIPCODE ||
                     feature.properties?.ZIP;
    
    // For clustered data, extract ZIP from area_name like "08701 (Lakewood)"
    if (!featureIdValue && feature.area_name) {
      const zipMatch = feature.area_name.match(/^\d{5}/);
      if (zipMatch) {
        featureIdValue = zipMatch[0];
      }
    }
    
    // Also try area_name directly for non-clustered cases
    if (!featureIdValue && feature.area_name) {
      featureIdValue = feature.area_name;
    }
    
    if (!featureIdValue) return false;
    
    const normalizedFeatureId = normalizeId(featureIdValue.toString());
    const match = normalizedFeatureId === targetId;
    
    if (match) {
      console.log(`✅ MATCH FOUND:`, {
        area_name: feature.area_name,
        cluster_id: feature.cluster_id,
        featureIdValue,
        normalizedFeatureId,
        hasGeometry: !!feature.geometry
      });
    }
    
    return match;
  });
  
  console.log(`📊 Results: ${matches.length} matches found out of ${features.length} features`);
  return matches;
}

// Run tests
console.log('🧪 SIMULATED ZIP CODE ZOOM TESTS\n');

console.log('=== Testing Clustered Data ===');
const testZipsFromAnalysis = ['11368', '08701', '19380', '19111', '08234'];

testZipsFromAnalysis.forEach(zip => {
  console.log(`\n--- Testing ${zip} ---`);
  const matches = simulateFeatureSearch(simulatedClusteredFeatures, zip);
  
  if (matches.length === 0) {
    console.log(`❌ No matches found for ${zip}`);
    console.log(`Available ZIPs in data:`, simulatedClusteredFeatures.map(f => {
      const zipMatch = f.area_name?.match(/^\d{5}/);
      return zipMatch ? zipMatch[0] : f.area_name;
    }));
  }
});

console.log('\n=== Testing Non-Clustered Data ===');
const testAreas = ['Brooklyn', 'Manhattan'];

testAreas.forEach(area => {
  console.log(`\n--- Testing ${area} ---`);
  const matches = simulateFeatureSearch(simulatedNonClusteredFeatures, area);
  
  if (matches.length === 0) {
    console.log(`❌ No matches found for ${area}`);
  }
});

console.log('\n=== Analysis Summary ===');
console.log(`Clustered features: ${simulatedClusteredFeatures.length}`);
console.log(`Non-clustered features: ${simulatedNonClusteredFeatures.length}`);
console.log(`Expected behavior: All test ZIPs should be found in clustered data`);

// Test potential issues
console.log('\n=== Potential Issues Analysis ===');

// Issue 1: Check if area_name format is consistent
console.log('Area name formats in clustered data:');
simulatedClusteredFeatures.forEach(f => {
  const zipMatch = f.area_name?.match(/^\d{5}/);
  console.log(`  "${f.area_name}" → ZIP: ${zipMatch ? zipMatch[0] : 'none'}`);
});

// Issue 2: Check normalization
console.log('\nNormalization test:');
['11368', '08701', 'Brooklyn', 'MANHATTAN'].forEach(test => {
  console.log(`  "${test}" → "${normalizeId(test)}"`);
});

console.log('\n🎯 Expected fixes needed if tests fail in browser:');
console.log('1. Check if clustered features actually have area_name field');
console.log('2. Verify ZIP extraction regex works with actual data format');
console.log('3. Ensure features array contains individual ZIP records, not just cluster summaries');
console.log('4. Check if geometry is properly preserved for zooming');