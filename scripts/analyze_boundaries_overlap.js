/**
 * Script to analyze FSA boundaries for overlaps and duplicates
 * Fetches from blob storage and checks for geometric overlaps
 */

async function analyzeBoundaryOverlaps() {
  try {
    console.log('🔄 Fetching boundaries from blob storage...');
    
    const response = await fetch('https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/real/boundaries/fsa_boundaries_wgs84.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`📊 Downloaded boundary data:`, {
      type: data.type,
      featuresCount: data.features?.length || 0,
      fileSize: `${(JSON.stringify(data).length / 1024 / 1024).toFixed(2)}MB`
    });
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No features found in boundary data');
    }
    
    // Check for duplicate FSA codes
    const fsaCounts = {};
    const fsaGeometries = {};
    
    data.features.forEach((feature, index) => {
      const fsaCode = feature.properties.FSA || feature.properties.ID;
      
      if (!fsaCode) {
        console.warn(`⚠️ Feature ${index} missing FSA code:`, feature.properties);
        return;
      }
      
      // Count FSA occurrences
      fsaCounts[fsaCode] = (fsaCounts[fsaCode] || 0) + 1;
      
      // Store geometry for overlap analysis
      if (feature.geometry && feature.geometry.coordinates) {
        if (!fsaGeometries[fsaCode]) {
          fsaGeometries[fsaCode] = [];
        }
        fsaGeometries[fsaCode].push({
          featureIndex: index,
          geometry: feature.geometry,
          // Create simple geometry fingerprint
          fingerprint: feature.geometry.coordinates[0]?.slice(0, 3)?.map(coord => 
            coord.map(c => Math.round(c * 1000))
          ).toString()
        });
      }
    });
    
    // Analyze duplicates
    const duplicateFSAs = Object.entries(fsaCounts).filter(([fsa, count]) => count > 1);
    const totalFSAs = Object.keys(fsaCounts).length;
    const totalFeatures = data.features.length;
    
    console.log(`📋 FSA Analysis:`, {
      totalFeatures,
      uniqueFSAs: totalFSAs,
      duplicateFSAs: duplicateFSAs.length,
      duplicateDetails: duplicateFSAs.length > 0 ? Object.fromEntries(duplicateFSAs) : 'none'
    });
    
    // Check for geometric overlaps (same FSA with different geometries)
    let geometricConflicts = 0;
    for (const [fsaCode, geometries] of Object.entries(fsaGeometries)) {
      if (geometries.length > 1) {
        console.log(`🔍 FSA ${fsaCode} has ${geometries.length} geometries:`);
        geometries.forEach((geom, i) => {
          console.log(`  - Feature ${geom.featureIndex}: ${geom.fingerprint}`);
        });
        
        // Check if geometries are actually different
        const uniqueFingerprints = [...new Set(geometries.map(g => g.fingerprint))];
        if (uniqueFingerprints.length > 1) {
          geometricConflicts++;
          console.log(`  ⚠️ CONFLICT: ${uniqueFingerprints.length} different geometries for same FSA`);
        }
      }
    }
    
    console.log(`\n🎯 Summary:`, {
      status: duplicateFSAs.length === 0 && geometricConflicts === 0 ? 'CLEAN' : 'HAS_ISSUES',
      duplicateFSACodes: duplicateFSAs.length,
      geometricConflicts,
      totalFeatures,
      uniqueFSAs: totalFSAs
    });
    
    // Sample some FSA codes for verification
    const sampleFSAs = Object.keys(fsaCounts).sort().slice(0, 10);
    console.log(`🎯 Sample FSAs:`, sampleFSAs);
    
    return {
      success: true,
      totalFeatures,
      uniqueFSAs: totalFSAs,
      duplicateFSAs: duplicateFSAs.length,
      geometricConflicts
    };
    
  } catch (error) {
    console.error('❌ Error analyzing boundaries:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  analyzeBoundaryOverlaps()
    .then(result => {
      console.log('\n🎉 Analysis completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { analyzeBoundaryOverlaps };