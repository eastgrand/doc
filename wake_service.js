/**
 * Service Wake-Up Utility
 * This script attempts to wake up the sleeping service on Render
 */

const API_URL = 'https://nesto-mortgage-analytics.onrender.com';
const PING_URL = `${API_URL}/ping`;
const MAX_ATTEMPTS = 10;
const PING_INTERVAL = 5000; // 5 seconds between pings
const TIMEOUT = 30000; // 30 second timeout per request

// Helper function to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Ping function with timeout
async function pingWithTimeout() {
  console.log(`📡 Pinging ${PING_URL} (timeout: ${TIMEOUT/1000}s)...`);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
  
  const startTime = Date.now();
  try {
    const response = await fetch(PING_URL, { 
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Service-Wakeup/1.0',
        'Cache-Control': 'no-cache'
      }
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`✅ Response received in ${elapsed}ms with status ${response.status}`);
    
    try {
      const data = await response.json();
      console.log('📋 Response:', data);
    } catch (e) {
      console.log('⚠️ Could not parse JSON response');
    }
    
    return true;
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Error after ${elapsed}ms: ${error.message}`);
    
    if (error.cause) {
      console.error(`🔍 Underlying cause: ${error.cause.code || error.cause}`);
    }
    
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Main wake-up function
async function wakeService() {
  console.log(`🔄 Attempting to wake up service at ${API_URL}`);
  console.log(`Will try ${MAX_ATTEMPTS} times with ${PING_INTERVAL/1000}s intervals`);
  
  let successCount = 0;
  
  for (let i = 1; i <= MAX_ATTEMPTS; i++) {
    console.log(`\n▶️ Attempt ${i}/${MAX_ATTEMPTS}`);
    
    const success = await pingWithTimeout();
    
    if (success) {
      successCount++;
      console.log(`🎉 Success! (${successCount}/${MAX_ATTEMPTS} successful pings)`);
      
      // After 3 successful pings, we consider the service fully awake
      if (successCount >= 3) {
        console.log('\n✅ SERVICE IS AWAKE AND RESPONDING CONSISTENTLY');
        return true;
      }
    } else {
      // Reset success count on failure
      if (successCount > 0) {
        console.log(`⚠️ Progress lost - resetting success counter`);
      }
      successCount = 0;
    }
    
    if (i < MAX_ATTEMPTS) {
      console.log(`⏳ Waiting ${PING_INTERVAL/1000}s before next attempt...`);
      await delay(PING_INTERVAL);
    }
  }
  
  console.log('\n❌ FAILED TO WAKE UP SERVICE AFTER MULTIPLE ATTEMPTS');
  return false;
}

// Open the service in a browser if possible
function openServiceInBrowser() {
  console.log('\n🌐 Attempting to open service URL in browser...');
  
  try {
    const open = require('open');
    open(API_URL);
    console.log('✅ Browser opened with service URL');
    return true;
  } catch (error) {
    console.error('❌ Could not open browser automatically:', error.message);
    console.log(`Please manually visit: ${API_URL}`);
    return false;
  }
}

// Run the wake-up sequence
async function run() {
  console.log('🚀 Starting service wake-up sequence');
  
  // First try programmatic pings
  const awake = await wakeService();
  
  // If programmatic pings didn't work, try browser approach
  if (!awake) {
    console.log('\n⚠️ Service did not respond to programmatic pings');
    console.log('Trying to open in browser - sometimes this helps wake Render services');
    
    openServiceInBrowser();
    
    console.log('\n🔍 TROUBLESHOOTING RECOMMENDATIONS:');
    console.log('1. Visit the service URL directly in your browser');
    console.log('2. Check the Render dashboard for service status');
    console.log('3. Restart the service from the Render dashboard');
    console.log('4. Consider upgrading from the free tier to avoid cold starts');
    console.log('5. Check Redis connection configuration on the server');
  }
  
  return awake;
}

// Run the script
run()
  .then(success => {
    console.log(`\n🏁 Wake-up sequence completed with ${success ? 'SUCCESS' : 'FAILURE'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  }); 