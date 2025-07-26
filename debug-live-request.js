// Debug what's actually happening in a live request
const fs = require('fs');

console.log('=== Debugging Live Request Issue ===\n');

console.log('The data processing is correct, but Claude still sees 79.3 for all values.');
console.log('This means there\'s a disconnect between our test and the actual UI request.\n');

console.log('POSSIBLE CAUSES:');
console.log('1. ❌ Browser cache - UI using old cached analysis results');
console.log('2. ❌ Server cache - API returning cached response');
console.log('3. ❌ Wrong endpoint - UI requesting /analyze instead of /strategic-analysis');
console.log('4. ❌ Wrong processor - DataProcessor using wrong processor despite routing');
console.log('5. ❌ Data corruption in AnalysisEngine flow');
console.log('6. ❌ featureData not being updated with new processor results');

console.log('\nDEBUGGING STEPS NEEDED:');
console.log('1. Check browser console logs for actual API requests');
console.log('2. Check what endpoint the UI is actually calling');
console.log('3. Check server logs for DataProcessor debug output');
console.log('4. Verify AnalysisEngine is using correct processor');
console.log('5. Check if there\'s response caching');

console.log('\nEXPECTED vs ACTUAL:');
console.log('Expected: Different ZIP codes should have different scores');
console.log('Actual: All ZIP codes showing 79.3 - THIS IS IMPOSSIBLE');

console.log('\nThe fact that different ZIP codes have identical scores proves');
console.log('the data being sent to Claude is corrupted or cached.');

console.log('\n=== IMMEDIATE ACTION NEEDED ===');
console.log('1. Clear all caches (browser + server)');
console.log('2. Check actual network requests in browser dev tools');
console.log('3. Add more debugging to see what data reaches Claude API');
console.log('4. Verify the UI is calling the right endpoint');

// Let's create a simple test to check what endpoint is being called
console.log('\n=== Quick Endpoint Check ===');
function testEndpointRouting() {
  const query = "Show me the top strategic markets for Nike expansion";
  
  // This is the same logic used in the app
  const keywords = {
    '/analyze': ['analyze', 'analysis', 'show', 'find', 'identify', 'display'],
    '/strategic-analysis': ['strategic', 'strategy', 'expansion', 'opportunity', 'potential', 'growth'],
    '/competitive-analysis': ['competitive', 'competition', 'compete', 'brand', 'nike', 'adidas'],
    '/spatial-clusters': ['cluster', 'clustering', 'similar', 'spatial', 'geographic']
  };
  
  const lowerQuery = query.toLowerCase();
  let bestMatch = { endpoint: '/analyze', score: 0 };
  
  for (const [endpoint, keywordList] of Object.entries(keywords)) {
    let score = 0;
    for (const keyword of keywordList) {
      if (lowerQuery.includes(keyword)) score++;
    }
    if (score > bestMatch.score) {
      bestMatch = { endpoint, score };
    }
  }
  
  console.log(`Query: "${query}"`);
  console.log(`Should route to: ${bestMatch.endpoint}`);
  console.log(`Route score: ${bestMatch.score}`);
  
  return bestMatch.endpoint;
}

const expectedEndpoint = testEndpointRouting();
console.log(`\nIf UI is calling ${expectedEndpoint}, that's correct.`);
console.log('If UI is calling something else, that\'s the problem.');