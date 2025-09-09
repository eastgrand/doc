/**
 * Script to debug potential boundary duplicates that could cause stacked features
 */

async function debugBoundaryDuplicates() {
  try {
    console.log('🔄 Analyzing boundary data for duplicates that could cause stacked features...');
    
    const response = await fetch('https://tao6dvjnrqq6hwa0.public.blob.vercel-storage.com/real/boundaries/fsa_boundaries_wgs84.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No features found in boundary data');
    }
    
    console.log(`📊 Boundary data loaded: ${data.features.length} features`);
    
    // Check for duplicates in each ID field that the joining logic uses
    const idFields = ['ID', 'FSA_ID', 'POSTAL_CODE', 'ZIP', 'ZIPCODE'];
    
    for (const field of idFields) {
      const values = [];
      const duplicates = {};
      
      data.features.forEach((feature, index) => {
        const value = feature.properties?.[field];
        if (value) {
          const normalizedValue = String(value).toUpperCase().trim();
          values.push({ index, value: normalizedValue, originalValue: value });
          
          if (!duplicates[normalizedValue]) {
            duplicates[normalizedValue] = [];
          }
          duplicates[normalizedValue].push({ index, originalValue: value });
        }
      });
      
      const duplicateEntries = Object.entries(duplicates).filter(([_, items]) => items.length > 1);
      
      console.log(`🔍 Field '${field}':`, {
        totalValues: values.length,
        uniqueValues: Object.keys(duplicates).length,
        duplicateGroups: duplicateEntries.length
      });
      
      if (duplicateEntries.length > 0) {
        console.log(`⚠️  DUPLICATE ${field} values found:`, duplicateEntries.slice(0, 5));
        duplicateEntries.forEach(([value, items]) => {
          if (items.length > 1) {
            console.log(`   ${value}: appears in features ${items.map(i => i.index).join(', ')}`);
          }
        });
      }
    }
    
    // Special check for FSA codes that could match multiple patterns
    const fsaMatches = {};
    data.features.forEach((feature, index) => {
      const props = feature.properties || {};
      
      // Check all the ways an FSA could be identified (matching the join logic)
      const possibleIds = [
        props.ID,
        props.FSA_ID,
        props.POSTAL_CODE,
        props.DESCRIPTION?.match(/^([A-Z]\d[A-Z])/i)?.[1]
      ].filter(id => id).map(id => String(id).toUpperCase().trim());
      
      possibleIds.forEach(id => {
        if (!fsaMatches[id]) {
          fsaMatches[id] = [];
        }
        fsaMatches[id].push({ index, feature: props });
      });
    });
    
    const fsaDuplicates = Object.entries(fsaMatches).filter(([_, items]) => items.length > 1);
    
    console.log(`🎯 FSA matching analysis:`, {
      totalUniqueIds: Object.keys(fsaMatches).length,
      potentialDuplicateMatches: fsaDuplicates.length
    });
    
    if (fsaDuplicates.length > 0) {
      console.log(`🚨 FOUND ${fsaDuplicates.length} FSA codes that could match multiple boundaries:`);
      fsaDuplicates.slice(0, 10).forEach(([fsaCode, matches]) => {
        console.log(`   FSA ${fsaCode}: ${matches.length} boundary features`);
        matches.forEach(match => {
          console.log(`     - Feature ${match.index}: ID=${match.feature.ID}, DESCRIPTION=${match.feature.DESCRIPTION}`);
        });
      });
    } else {
      console.log(`✅ No FSA duplicate matches found - boundary data is clean for joining`);
    }
    
    return {
      success: true,
      totalFeatures: data.features.length,
      potentialDuplicateMatches: fsaDuplicates.length,
      duplicateDetails: fsaDuplicates.slice(0, 5)
    };
    
  } catch (error) {
    console.error('❌ Error analyzing boundary duplicates:', error.message);
    throw error;
  }
}

// Run the script
if (require.main === module) {
  debugBoundaryDuplicates()
    .then(result => {
      console.log('\n🎉 Analysis completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = { debugBoundaryDuplicates };