// CORRECTED Browser Console Test Commands
// Copy and paste these one at a time into the browser console

// 1. Check if debug function is available
console.log('Debug function available:', typeof window.debugZipSearch);

// 2. Test specific ZIP code that's failing
if (window.debugZipSearch) {
  window.debugZipSearch('11368');
} else {
  console.log('debugZipSearch not available - make sure clustering analysis is loaded');
}

// 3. Test another ZIP from the analysis
if (window.debugZipSearch) {
  window.debugZipSearch('08701');
}

// 4. Check what test functions are available
console.log('Available test functions:', Object.keys(window).filter(key => key.includes('test') || key.includes('debug')));

// 5. Load the full test suite (paste this entire block)
window.testZipZoom = {
  testClusteredZips: function() {
    console.log('Testing clustered ZIP codes...');
    const testZips = ['11368', '08701', '19380', '19111', '08234'];
    
    testZips.forEach(zip => {
      console.log(`Testing ${zip}:`);
      if (window.debugZipSearch) {
        window.debugZipSearch(zip);
      } else {
        console.log('debugZipSearch not available');
      }
    });
  },
  
  checkAvailableData: function() {
    console.log('Checking available data...');
    console.log('Window debug functions:', Object.keys(window).filter(k => k.includes('debug')));
    console.log('Window test functions:', Object.keys(window).filter(k => k.includes('test')));
  }
};

// 6. Run the tests
console.log('Test suite loaded. Run: window.testZipZoom.testClusteredZips()');