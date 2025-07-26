/**
 * Redis Connection Health Check
 * This script tests connectivity to the Redis server used by the ML Analytics service
 */

const API_URL = 'https://nesto-mortgage-analytics.onrender.com';
const API_KEY = 'HFqkccbN3LV5CaB';
const TIMEOUT = 45000; // 45 second timeout 

// Helper function for fetch with detailed logging
async function fetchWithLogging(url, options = {}, timeoutMs = TIMEOUT) {
  console.log(`📡 Requesting ${url}...`);
  console.log(`📝 Headers: ${JSON.stringify(options.headers || {})}`);
  
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const startTime = Date.now();
  try {
    console.log(`⏳ Waiting for response (timeout: ${timeoutMs/1000}s)...`);
    const response = await fetch(url, { ...options, signal });
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ Response received in ${elapsed}ms with status ${response.status}`);
    console.log(`📝 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        const data = await response.json();
        console.log('📋 Response body:', JSON.stringify(data, null, 2));
        return { response, data, elapsed };
      } catch (e) {
        console.log('⚠️ Could not parse JSON response');
        const text = await response.text();
        console.log('📋 Raw response:', text);
        return { response, text, elapsed };
      }
    } else {
      const text = await response.text();
      console.log('📋 Response body:', text);
      return { response, text, elapsed };
    }
  } catch (error) {
    const elapsed = Date.now() - startTime;
    console.error(`❌ Request failed after ${elapsed}ms: ${error.message}`);
    
    if (error.cause) {
      console.error(`🔍 Underlying cause: ${error.cause.code || error.cause}`);
    }
    
    return { error, elapsed };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Check the service health endpoint which reports Redis status
async function checkServiceHealth() {
  console.log('\n🔍 CHECKING SERVICE HEALTH (includes Redis status)');
  
  const result = await fetchWithLogging(`${API_URL}/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Redis-Diagnostics/1.0',
      'x-api-key': API_KEY
    }
  });
  
  if (result.error) {
    console.log('❌ HEALTH CHECK FAILED - Could not retrieve Redis status');
    return false;
  }
  
  if (!result.response.ok) {
    console.log(`❌ HEALTH CHECK FAILED - Received ${result.response.status} status code`);
    return false;
  }
  
  // Check Redis status
  const data = result.data;
  if (data) {
    console.log('\n📊 REDIS STATUS SUMMARY:');
    console.log(`Redis Connected: ${data.redis_connected === true ? '✅ YES' : '❌ NO'}`);
    console.log(`Queue Active: ${data.queue_active === true ? '✅ YES' : '❌ NO'}`);
    console.log(`Active Workers: ${data.active_workers || 'Unknown'}`);
    
    return data.redis_connected === true;
  }
  
  return false;
}

// Check the Redis configuration by submitting a job test
async function testRedisJobSubmission() {
  console.log('\n🔍 TESTING REDIS JOB QUEUE WITH SAMPLE ANALYSIS');
  
  // Test data for minimal analysis
  const testData = {
    analysis_type: "correlation",
    target_variable: "test",
    data: [
      { test: 1, value: 10 },
      { test: 2, value: 20 }
    ],
    accept_partial_results: true,
    memory_optimized: true
  };
  
  const result = await fetchWithLogging(`${API_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'Redis-Diagnostics/1.0',
      'x-api-key': API_KEY
    },
    body: JSON.stringify(testData)
  });
  
  if (result.error) {
    console.log('❌ ANALYSIS SUBMISSION FAILED - Could not test Redis job queue');
    return { success: false };
  }
  
  if (!result.response.ok) {
    console.log(`❌ ANALYSIS SUBMISSION FAILED - Received ${result.response.status} status code`);
    
    // Check for specific Redis error messages in the response
    const responseData = result.data || {};
    if (responseData.error && responseData.error.includes('Redis')) {
      console.log('🔍 DETECTED REDIS-SPECIFIC ERROR IN RESPONSE:');
      console.log(`📋 ${responseData.error}`);
    }
    
    return { success: false, error: responseData.error };
  }
  
  // Successfully submitted job
  if (result.data && result.data.job_id) {
    console.log(`✅ Successfully submitted job with ID: ${result.data.job_id}`);
    return { 
      success: true, 
      jobId: result.data.job_id 
    };
  }
  
  return { success: false };
}

// Run manual ping checks
async function testServiceBasics() {
  console.log('\n🔍 TESTING BASIC SERVICE CONNECTIVITY');
  
  const result = await fetchWithLogging(`${API_URL}/ping`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Redis-Diagnostics/1.0'
    }
  });
  
  if (result.error) {
    console.log('❌ PING FAILED - Service may be completely down');
    return false;
  }
  
  // 502 responses mean the service is up but having backend issues
  if (result.response.status === 502) {
    console.log('⚠️ Service is responding with 502 Bad Gateway');
    console.log('This typically indicates Redis connection problems');
    return true;
  }
  
  // 200 responses are good
  if (result.response.ok) {
    console.log('✅ Service is responding normally');
    return true;
  }
  
  console.log(`⚠️ Service responded with unusual status: ${result.response.status}`);
  return false;
}

// Run diagnostics
async function runRedisDiagnostics() {
  console.log('🚀 Starting Redis connection diagnostics');
  
  // First check if the service is even responding
  const serviceUp = await testServiceBasics();
  
  if (!serviceUp) {
    console.log('\n❌ CANNOT PROCEED - Service is completely unresponsive');
    console.log('Try running the wake_service.js script first to wake up the service');
    return { serviceUp: false };
  }
  
  // Now check the health endpoint for Redis status
  const redisConnected = await checkServiceHealth();
  
  // Finally, test job submission which uses Redis
  const jobTest = await testRedisJobSubmission();
  
  // Compile results
  const results = {
    serviceUp,
    redisConnected,
    jobSubmission: jobTest.success
  };
  
  // Print summary
  console.log('\n📋 REDIS DIAGNOSTICS SUMMARY:');
  console.log(`Service Responding: ${results.serviceUp ? '✅ YES' : '❌ NO'}`);
  console.log(`Redis Connected: ${results.redisConnected ? '✅ YES' : '❌ NO'}`);
  console.log(`Job Submission: ${results.jobSubmission ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Provide recommendations based on findings
  console.log('\n🔧 RECOMMENDATIONS:');
  
  if (!results.redisConnected || !results.jobSubmission) {
    console.log('1. The Redis connection is not working properly.');
    console.log('2. Check the Render.com environment variables for the Redis connection string.');
    console.log('3. Verify that the Upstash Redis service is operational.');
    console.log('4. Check the service logs in Render.com dashboard for Redis-specific errors.');
    console.log('5. Consider restarting the service from the Render.com dashboard.');
    console.log('6. Check if the Redis DB is over capacity or has exhausted connection limits.');
    console.log('7. Verify that the Redis connection string includes the correct password and SSL settings.');
  } else {
    console.log('✅ Redis connection appears to be working properly!');
  }
  
  return results;
}

// Run the diagnostics
runRedisDiagnostics()
  .then(results => {
    console.log('\n🏁 Redis diagnostics completed');
    process.exit(results.redisConnected && results.jobSubmission ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error in diagnostics:', error);
    process.exit(1);
  }); 