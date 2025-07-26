/**
 * Network Diagnostics for ML Analytics Service
 * This script performs detailed connectivity checks to help isolate issues
 */

const API_URL = 'https://nesto-mortgage-analytics.onrender.com';
const API_KEY = 'HFqkccbN3LV5CaB';
const NEXT_API_URL = 'http://localhost:3001/api/ml-analytics';
const DNS = require('dns').promises;

// Timeouts to test
const TIMEOUTS = [5000, 10000, 15000, 20000];

// Helper function for fetch with configurable timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  console.log(`📡 Attempting ${options.method || 'GET'} request to ${url} (timeout: ${timeoutMs}ms)`);
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const startTime = Date.now();
  try {
    const response = await fetch(url, { ...options, signal });
    const elapsed = Date.now() - startTime;
    console.log(`✅ Response received in ${elapsed}ms with status ${response.status}`);
    
    return { response, elapsed };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    const errorType = error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK';
    console.error(`❌ ${errorType} error after ${elapsed}ms: ${error.message}`);
    
    if (error.cause) {
      console.error(`🔍 Underlying cause: ${error.cause.code || error.cause}`);
    }
    
    return { error, elapsed, errorType };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Test DNS resolution
async function checkDns() {
  console.log('\n🔎 Checking DNS resolution...');
  try {
    const hostname = new URL(API_URL).hostname;
    console.log(`Looking up ${hostname}...`);
    
    const startTime = Date.now();
    const addresses = await DNS.lookup(hostname, { all: true });
    const elapsed = Date.now() - startTime;
    
    console.log(`✅ DNS resolved in ${elapsed}ms`);
    console.log('📋 IP Addresses:', addresses.map(a => a.address).join(', '));
    return true;
  } catch (error) {
    console.error(`❌ DNS resolution failed: ${error.message}`);
    return false;
  }
}

// Ping with different timeouts
async function testPingWithTimeouts() {
  console.log('\n🔄 Testing ping endpoint with different timeouts...');
  
  const results = [];
  
  for (const timeout of TIMEOUTS) {
    console.log(`\nAttempting ping with ${timeout}ms timeout`);
    const result = await fetchWithTimeout(`${API_URL}/ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Diagnostics-Script/1.0'
      }
    }, timeout);
    
    results.push({
      timeout,
      success: !!result.response,
      elapsed: result.elapsed,
      error: result.error?.message
    });
    
    // If successful, don't need to try longer timeouts
    if (result.response) break;
  }
  
  console.log('\n📊 Ping timeout results:');
  console.table(results);
  
  return results.some(r => r.success);
}

// Test health with different timeouts
async function testHealthWithTimeouts() {
  console.log('\n🔄 Testing health endpoint with different timeouts...');
  
  const results = [];
  
  for (const timeout of TIMEOUTS) {
    console.log(`\nAttempting health check with ${timeout}ms timeout`);
    const result = await fetchWithTimeout(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Diagnostics-Script/1.0',
        'x-api-key': API_KEY
      }
    }, timeout);
    
    results.push({
      timeout,
      success: !!result.response,
      elapsed: result.elapsed,
      error: result.error?.message
    });
    
    // If successful, don't need to try longer timeouts
    if (result.response) break;
  }
  
  console.log('\n📊 Health endpoint timeout results:');
  console.table(results);
  
  return results.some(r => r.success);
}

// Test Next.js API route with different timeouts
async function testNextApiWithTimeouts() {
  console.log('\n🔄 Testing Next.js API route with different timeouts...');
  
  const results = [];
  
  for (const timeout of TIMEOUTS) {
    console.log(`\nAttempting Next.js API ping with ${timeout}ms timeout`);
    const result = await fetchWithTimeout(`${NEXT_API_URL}?endpoint=ping`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Diagnostics-Script/1.0'
      }
    }, timeout);
    
    results.push({
      timeout,
      success: !!result.response,
      elapsed: result.elapsed,
      error: result.error?.message
    });
    
    // If successful, don't need to try longer timeouts
    if (result.response) break;
  }
  
  console.log('\n📊 Next.js API route timeout results:');
  console.table(results);
  
  return results.some(r => r.success);
}

// Run the diagnostics
async function runDiagnostics() {
  console.log('🚀 Starting comprehensive connection diagnostics...');
  console.log(`Direct service URL: ${API_URL}`);
  console.log(`Next.js API URL: ${NEXT_API_URL}`);
  
  // Step 1: Check DNS resolution
  const dnsOk = await checkDns();
  
  // Step 2: Test ping with increasing timeouts
  const pingOk = await testPingWithTimeouts();
  
  // Step 3: Test health with increasing timeouts
  const healthOk = await testHealthWithTimeouts();
  
  // Step 4: Test Next.js API with increasing timeouts
  const nextApiOk = await testNextApiWithTimeouts();
  
  // Summary
  console.log('\n📋 DIAGNOSTICS SUMMARY:');
  console.log(`DNS Resolution: ${dnsOk ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Direct Ping: ${pingOk ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Authenticated Health: ${healthOk ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`Next.js API Route: ${nextApiOk ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  // Recommendations
  console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:');
  
  if (!dnsOk) {
    console.log('❌ DNS resolution failed - check internet connection and DNS settings');
  } else if (pingOk && !healthOk) {
    console.log('⚠️ Service responds to ping but not to authenticated requests');
    console.log('   👉 LIKELY ISSUE: Redis connectivity problems or service authentication issues');
    console.log('   👉 SOLUTION: Check Redis connection string and credentials on the service');
  } else if (pingOk && !nextApiOk) {
    console.log('⚠️ Direct service ping works but Next.js API proxy fails');
    console.log('   👉 LIKELY ISSUE: Next.js API route configuration or networking issue');
    console.log('   👉 SOLUTION: Check Next.js API route implementation and network settings');
  } else if (!pingOk) {
    console.log('❌ Service is not responding to direct requests');
    console.log('   👉 LIKELY ISSUE: Service is down or in sleep mode (Render free tier)');
    console.log('   👉 SOLUTION: Visit the service URL directly to wake it up or upgrade to paid tier');
  }
  
  return {
    dnsOk,
    pingOk,
    healthOk,
    nextApiOk
  };
}

// Run diagnostics
runDiagnostics()
  .then(results => {
    console.log('\n🏁 Diagnostics completed');
    // Only exit in node environment, not in browser
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(results.pingOk && results.healthOk ? 0 : 1);
    }
  })
  .catch(error => {
    console.error('\n💥 Unexpected error in diagnostic script:', error);
    // Only exit in node environment, not in browser
    if (typeof process !== 'undefined' && process.exit) {
      process.exit(1);
    }
  }); 