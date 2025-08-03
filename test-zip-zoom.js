/**
 * Test script for ZIP code zoom functionality
 * 
 * Instructions:
 * 1. Open browser developer console
 * 2. Paste this script and run it
 * 3. Or use the individual test functions
 */

// Test functions available in browser console
window.testZipZoom = {
  
  // Test clustered data ZIP codes
  testClusteredZips: function() {
    console.log('🧪 Testing clustered ZIP codes...');
    const testZips = ['11368', '08701', '19380', '19111', '08234'];
    
    testZips.forEach(zip => {
      console.log(`\n--- Testing ${zip} ---`);
      if (window.debugZipSearch) {
        window.debugZipSearch(zip);
      } else {
        console.warn('debugZipSearch not available - make sure clustering analysis is loaded');
      }
    });
  },
  
  // Test non-clustered data
  testNonClusteredAreas: function() {
    console.log('🧪 Testing non-clustered area names...');
    const testAreas = ['Brooklyn', 'Manhattan', 'Queens', 'Philadelphia'];
    
    testAreas.forEach(area => {
      console.log(`\n--- Testing ${area} ---`);
      if (window.debugZipSearch) {
        window.debugZipSearch(area);
      } else {
        console.warn('debugZipSearch not available - make sure analysis is loaded');
      }
    });
  },
  
  // Check current data structure
  checkDataStructure: function() {
    console.log('🔍 Checking current data structure...');
    
    // Try to access the features array from the React component
    // This is a bit hacky but useful for debugging
    const reactFiber = document.querySelector('[data-testid="geospatial-chat"]')?._reactFiber ||
                       document.querySelector('#__next')?._reactInternalInstance;
    
    if (reactFiber) {
      console.log('Found React instance - data structure analysis would go here');
    } else {
      console.log('Could not access React data directly');
    }
    
    console.log('Available debug functions:', Object.keys(window).filter(key => key.includes('debug')));
  },
  
  // Quick test of normalizeId function
  testNormalization: function() {
    console.log('🧪 Testing ID normalization...');
    
    const testCases = [
      '11368',
      '08701', 
      '11368 (Corona)',
      '08701 (Lakewood)',
      'Brooklyn',
      'MANHATTAN'
    ];
    
    testCases.forEach(testCase => {
      // Replicate the normalizeId logic
      const normalizeId = (id) => {
        if (!id) return '';
        if (/^\d{5}/.test(id)) {
          return id.substring(0, 5).toUpperCase();
        }
        return id.toString().toUpperCase().trim();
      };
      
      console.log(`"${testCase}" → "${normalizeId(testCase)}"`);
    });
  }
};

console.log(`
🧪 ZIP Zoom Test Suite Loaded!

Available commands:
- window.testZipZoom.testClusteredZips()     // Test ZIP codes from clustering analysis  
- window.testZipZoom.testNonClusteredAreas() // Test area names from regular analysis
- window.testZipZoom.checkDataStructure()   // Check current data structure
- window.testZipZoom.testNormalization()    // Test ID normalization logic

Direct debugging:
- window.debugZipSearch('11368')            // Test specific ZIP code search

Make sure to run clustering analysis first, then try these tests!
`);