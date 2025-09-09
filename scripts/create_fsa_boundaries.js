/**
 * Script to create complete FSA boundaries JSON from ArcGIS Feature Service
 * This will fetch all 421 FSAs from Unknown_Service_layer_7 to ensure complete coverage
 */

const fs = require('fs');

async function fetchAllFSABoundaries() {
  try {
    console.log('🔄 Fetching FSA boundaries from Unknown_Service_layer_7...');
    
    // ArcGIS Feature Service URL for Unknown_Service_layer_7 (Total Population)
    const baseUrl = 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_BH_QC_layers/FeatureServer/7/query';
    
    // Query parameters to get all features with geometry
    const params = new URLSearchParams({
      where: '1=1', // Get all records
      outFields: 'ID', // Only FSA code needed
      geometryPrecision: 6, // Keep full geometry precision
      returnGeometry: 'true',
      outSR: '4326', // Ensure coordinates are in WGS84 (lat/long) for web maps
      f: 'json'
    });
    
    const url = `${baseUrl}?${params.toString()}`;
    console.log('📡 Request URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log(`📊 Response received:`, {
      totalFeatures: data.features?.length || 0,
      hasError: !!data.error
    });
    
    if (data.error) {
      throw new Error(`ArcGIS API error: ${data.error.message}`);
    }
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No features returned from ArcGIS service');
    }
    
    // Transform the data into the format expected by blob-data-loader
    const transformedFeatures = data.features.map(feature => {
      const fsaCode = feature.attributes.ID;
      const geometry = feature.geometry;
      
      if (!fsaCode) {
        console.warn('⚠️ Feature missing FSA code:', feature.attributes);
        return null;
      }
      
      if (!geometry || !geometry.rings) {
        console.warn('⚠️ Feature missing geometry:', fsaCode);
        return null;
      }
      
      return {
        type: 'Feature',
        properties: {
          ID: fsaCode,
          FSA: fsaCode
        },
        geometry: {
          type: 'Polygon',
          coordinates: geometry.rings
        }
      };
    }).filter(feature => feature !== null);
    
    console.log(`✅ Processed ${transformedFeatures.length} valid FSA boundaries`);
    
    // Create GeoJSON structure
    const geoJsonData = {
      type: 'FeatureCollection',
      features: transformedFeatures
    };
    
    // Get unique FSA codes for validation
    const fsaCodes = transformedFeatures.map(f => f.properties.FSA).sort();
    const uniqueFSAs = [...new Set(fsaCodes)];
    
    console.log(`📋 FSA Statistics:`, {
      totalFeatures: transformedFeatures.length,
      uniqueFSAs: uniqueFSAs.length,
      duplicates: transformedFeatures.length - uniqueFSAs.length
    });
    
    // Check for the missing FSAs that were identified earlier
    const missingFSAs = ['J5N', 'J3Z', 'J3T', 'J0C', 'H0M', 'G0Z'];
    const foundMissing = missingFSAs.filter(fsa => uniqueFSAs.includes(fsa));
    const stillMissing = missingFSAs.filter(fsa => !uniqueFSAs.includes(fsa));
    
    console.log(`🔍 Missing FSA Check:`, {
      previouslyMissing: missingFSAs,
      nowFound: foundMissing,
      stillMissing: stillMissing
    });
    
    // Save to file
    const outputPath = '/Users/voldeck/code/mpiq-ai-chat/fsa_boundaries_wgs84.json';
    fs.writeFileSync(outputPath, JSON.stringify(geoJsonData, null, 2));
    
    console.log(`💾 Optimized FSA boundaries saved to: ${outputPath}`);
    console.log(`📊 Final count: ${uniqueFSAs.length} unique FSA boundaries`);
    
    // Show first few FSA codes for verification
    console.log(`🎯 Sample FSAs:`, uniqueFSAs.slice(0, 10));
    
    return {
      success: true,
      filePath: outputPath,
      totalFSAs: uniqueFSAs.length,
      foundMissing,
      stillMissing
    };
    
  } catch (error) {
    console.error('❌ Error fetching FSA boundaries:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  fetchAllFSABoundaries()
    .then(result => {
      console.log('🎉 Script completed successfully:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fetchAllFSABoundaries };