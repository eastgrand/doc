/**
 * Script to analyze both strategic analysis and boundary data for potential duplicates
 */

async function compareDataSources() {
  try {
    console.log('🔄 Fetching both data sources...');
    
    // Fetch strategic analysis data
    const strategicResponse = await fetch('https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/real/strategic-analysis-KrF0kTCHcILqimN8EKXEZ5yUvTlHUY.json');
    if (!strategicResponse.ok) {
      throw new Error(`Strategic analysis fetch failed: ${strategicResponse.status}`);
    }
    const strategicData = await strategicResponse.json();
    
    // Fetch boundary data
    const boundaryResponse = await fetch('https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/real/boundaries/fsa_boundaries_wgs84.json');
    if (!boundaryResponse.ok) {
      throw new Error(`Boundary data fetch failed: ${boundaryResponse.status}`);
    }
    const boundaryData = await boundaryResponse.json();
    
    console.log('📊 Data loaded:', {
      strategicRecords: strategicData?.length || 'Not an array',
      boundaryFeatures: boundaryData?.features?.length || 'No features'
    });
    
    // Analyze strategic analysis data
    if (Array.isArray(strategicData)) {
      const strategicIds = strategicData.map(record => record.ID || record.id).filter(id => id);
      const uniqueStrategicIds = [...new Set(strategicIds)];
      
      console.log('🎯 Strategic Analysis Data:', {
        totalRecords: strategicData.length,
        recordsWithId: strategicIds.length,
        uniqueIds: uniqueStrategicIds.length,
        duplicates: strategicIds.length - uniqueStrategicIds.length
      });
      
      if (strategicIds.length !== uniqueStrategicIds.length) {
        const duplicates = strategicIds.filter((id, index) => strategicIds.indexOf(id) !== index);
        console.log('🚨 Strategic analysis duplicates:', [...new Set(duplicates)]);
      }
      
      // Show sample strategic IDs
      console.log('📋 Sample strategic IDs:', uniqueStrategicIds.slice(0, 10));
    } else {
      console.warn('⚠️  Strategic data is not an array');
    }
    
    // Analyze boundary data
    if (boundaryData?.features && Array.isArray(boundaryData.features)) {
      const boundaryIds = boundaryData.features.map(feature => 
        feature.properties?.ID || feature.properties?.FSA
      ).filter(id => id);
      const uniqueBoundaryIds = [...new Set(boundaryIds)];
      
      console.log('🗺️  Boundary Data:', {
        totalFeatures: boundaryData.features.length,
        featuresWithId: boundaryIds.length,
        uniqueIds: uniqueBoundaryIds.length,
        duplicates: boundaryIds.length - uniqueBoundaryIds.length
      });
      
      if (boundaryIds.length !== uniqueBoundaryIds.length) {
        const duplicates = boundaryIds.filter((id, index) => boundaryIds.indexOf(id) !== index);
        console.log('🚨 Boundary duplicates:', [...new Set(duplicates)]);
      }
      
      // Show sample boundary IDs
      console.log('📋 Sample boundary IDs:', uniqueBoundaryIds.slice(0, 10));
      
      // Check for matching IDs between datasets
      if (Array.isArray(strategicData)) {
        const strategicIds = strategicData.map(r => r.ID || r.id).filter(id => id);
        const intersection = uniqueBoundaryIds.filter(id => strategicIds.includes(id));
        const strategicOnly = strategicIds.filter(id => !uniqueBoundaryIds.includes(id));
        const boundaryOnly = uniqueBoundaryIds.filter(id => !strategicIds.includes(id));
        
        console.log('🔗 Data Matching Analysis:', {
          strategicIds: strategicIds.length,
          boundaryIds: uniqueBoundaryIds.length,
          matchingIds: intersection.length,
          strategicOnlyIds: strategicOnly.length,
          boundaryOnlyIds: boundaryOnly.length
        });
        
        if (strategicOnly.length > 0) {
          console.log('📍 Strategic-only IDs (no boundary):', strategicOnly.slice(0, 5));
        }
        if (boundaryOnly.length > 0) {
          console.log('📍 Boundary-only IDs (no strategic data):', boundaryOnly.slice(0, 5));
        }
      }
    } else {
      console.warn('⚠️  Boundary data has no features array');
    }
    
    return {
      success: true,
      strategic: Array.isArray(strategicData) ? {
        total: strategicData.length,
        unique: [...new Set(strategicData.map(r => r.ID || r.id).filter(id => id))].length
      } : null,
      boundary: boundaryData?.features ? {
        total: boundaryData.features.length,
        unique: [...new Set(boundaryData.features.map(f => f.properties?.ID || f.properties?.FSA).filter(id => id))].length
      } : null
    };
    
  } catch (error) {
    console.error('❌ Error comparing data sources:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  compareDataSources()
    .then(result => {
      console.log('\n🎉 Comparison completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Comparison failed:', error);
      process.exit(1);
    });
}

module.exports = { compareDataSources };