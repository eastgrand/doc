/**
 * Browser Console Debug Script
 * Paste this into the browser console to debug the issue
 */

console.log('🔍 BROWSER DEBUG TEST');
console.log('=' .repeat(60));

// Test 1: Check if getRelevantFields is available
console.log('\n1️⃣ CHECK IMPORTS');
if (typeof window !== 'undefined') {
  console.log('Running in browser context');
  
  // Check for the function in the global scope or modules
  console.log('TODO: Check if getRelevantFields is imported correctly in the compiled bundle');
}

// Test 2: Check localStorage/sessionStorage for cached data
console.log('\n2️⃣ CHECK STORAGE');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('sessionStorage keys:', Object.keys(sessionStorage));

// Test 3: Check if there are any service workers
console.log('\n3️⃣ CHECK SERVICE WORKERS');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('Service workers:', registrations.length);
    registrations.forEach((reg, i) => {
      console.log(`  ${i+1}. ${reg.scope} - ${reg.active?.state}`);
    });
  });
}

// Test 4: Clear Next.js cache
console.log('\n4️⃣ CACHE CLEARING INSTRUCTIONS');
console.log('To clear Next.js cache:');
console.log('1. Stop the dev server');
console.log('2. Run: rm -rf .next');
console.log('3. Run: npm run dev');
console.log('4. Hard refresh browser: Cmd+Shift+R');

// Test 5: Manual field detection test
console.log('\n5️⃣ MANUAL FIELD DETECTION TEST');
const testData = {
  strategic_value_score: 79.34,
  competitive_advantage_score: 5.1,
  value_MP30034A_B_P: 17.7,
  DESCRIPTION: 'Test Area'
};

const testQueries = [
  'Show me the top strategic markets for Nike expansion',
  "Compare Nike's market position against competitors"
];

testQueries.forEach(query => {
  console.log(`\nQuery: "${query}"`);
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('strategic')) {
    console.log('✓ Matches strategic criteria');
    const fields = Object.keys(testData).filter(f => 
      f.toLowerCase().includes('strategic')
    );
    console.log('Strategic fields found:', fields);
  } else if (queryLower.includes('competitive') || queryLower.includes('compare')) {
    console.log('✓ Matches competitive criteria');
    const fields = Object.keys(testData).filter(f => 
      f.toLowerCase().includes('competitive')
    );
    console.log('Competitive fields found:', fields);
  }
});

console.log('\n✅ Browser debug test complete');
console.log('Check the Network tab for API calls to /api/claude/generate-response');
console.log('Look for the request payload to see what fields are being sent');