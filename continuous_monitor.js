/**
 * Continuous Health Monitor for ML Analytics Service
 * Monitors service health continuously to identify patterns in availability
 */

const API_URL = 'https://nesto-mortgage-analytics.onrender.com';
const API_KEY = 'HFqkccbN3LV5CaB';
const PING_INTERVAL = 60000; // 1 minute between checks
const HEALTH_INTERVAL = 300000; // 5 minutes between authenticated checks
const TIMEOUT = 20000; // 20 second timeout
const LOG_FILE = 'service_monitoring.log';
const fs = require('fs');

// Store results for reporting
const results = {
  totalPings: 0,
  successfulPings: 0,
  totalHealthChecks: 0,
  successfulHealthChecks: 0,
  redisConnected: false,
  lastSuccessTime: null,
  statusCodes: {},
  errors: {}
};

// Helper function for fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = TIMEOUT) {
  const controller = new AbortController();
  const { signal } = controller;
  
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const startTime = Date.now();
  try {
    const response = await fetch(url, { ...options, signal });
    const elapsed = Date.now() - startTime;
    
    return { response, elapsed, error: null };
  } catch (error) {
    const elapsed = Date.now() - startTime;
    return { response: null, elapsed, error };
  } finally {
    clearTimeout(timeoutId);
  }
}

// Format timestamp for logs
function getTimestamp() {
  return new Date().toISOString();
}

// Log to console and file
function log(message) {
  const timestamp = getTimestamp();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Check if the service responds to basic ping
async function checkPing() {
  log('📡 Checking ping endpoint');
  results.totalPings++;
  
  const result = await fetchWithTimeout(`${API_URL}/ping`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'User-Agent': 'ServiceMonitor/1.0'
    }
  });
  
  if (result.error) {
    log(`❌ Ping failed: ${result.error.message}`);
    results.errors[result.error.message] = (results.errors[result.error.message] || 0) + 1;
    return false;
  }
  
  const status = result.response.status;
  results.statusCodes[status] = (results.statusCodes[status] || 0) + 1;
  
  if (result.response.ok) {
    log(`✅ Ping success in ${result.elapsed}ms (status: ${status})`);
    results.successfulPings++;
    results.lastSuccessTime = new Date();
    return true;
  } else if (status === 502) {
    log(`⚠️ Ping returned 502 Bad Gateway in ${result.elapsed}ms`);
    // 502 means the service is responding but Redis is likely down
    return true;
  } else {
    log(`⚠️ Ping failed with status ${status} in ${result.elapsed}ms`);
    return false;
  }
}

// Check authenticated health endpoint
async function checkHealth() {
  log('🔍 Checking health endpoint with authentication');
  results.totalHealthChecks++;
  
  const result = await fetchWithTimeout(`${API_URL}/health`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      'User-Agent': 'ServiceMonitor/1.0',
      'x-api-key': API_KEY
    }
  });
  
  if (result.error) {
    log(`❌ Health check failed: ${result.error.message}`);
    results.errors[result.error.message] = (results.errors[result.error.message] || 0) + 1;
    return false;
  }
  
  const status = result.response.status;
  results.statusCodes[status] = (results.statusCodes[status] || 0) + 1;
  
  if (result.response.ok) {
    log(`✅ Health check success in ${result.elapsed}ms (status: ${status})`);
    results.successfulHealthChecks++;
    
    try {
      const data = await result.response.json();
      results.redisConnected = data.redis_connected === true;
      log(`📊 Redis connected: ${results.redisConnected ? 'YES' : 'NO'}`);
      
      return true;
    } catch (e) {
      log(`⚠️ Could not parse health response: ${e.message}`);
      return true;
    }
  } else {
    log(`⚠️ Health check failed with status ${status} in ${result.elapsed}ms`);
    return false;
  }
}

// Print summary statistics
function printSummary() {
  log('');
  log('📊 MONITORING SUMMARY:');
  log(`Total runtime: ${formatDuration(Date.now() - startTime)}`);
  log(`Ping success rate: ${results.successfulPings}/${results.totalPings} (${Math.round(results.successfulPings/results.totalPings*100 || 0)}%)`);
  log(`Health check success rate: ${results.successfulHealthChecks}/${results.totalHealthChecks} (${Math.round(results.successfulHealthChecks/results.totalHealthChecks*100 || 0)}%)`);
  log(`Redis connected: ${results.redisConnected ? 'YES' : 'NO'}`);
  
  if (results.lastSuccessTime) {
    log(`Last successful ping: ${results.lastSuccessTime.toISOString()}`);
    log(`Time since last success: ${formatDuration(Date.now() - results.lastSuccessTime.getTime())}`);
  } else {
    log('No successful connections yet');
  }
  
  log('');
  log('Status code distribution:');
  Object.entries(results.statusCodes)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .forEach(([code, count]) => {
      log(`  ${code}: ${count}`);
    });
  
  log('');
  log('Error distribution:');
  Object.entries(results.errors)
    .sort(([, a], [, b]) => b - a)
    .forEach(([message, count]) => {
      log(`  ${message}: ${count}`);
    });
}

// Format duration in a human-readable way
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Setup timers for continuous monitoring
let pingTimer = null;
let healthTimer = null;
const startTime = Date.now();

// Start monitoring loop
async function startMonitoring() {
  log('🚀 Starting continuous service monitoring');
  log(`Service URL: ${API_URL}`);
  log(`Ping interval: ${PING_INTERVAL/1000}s, Health interval: ${HEALTH_INTERVAL/1000}s`);
  log('======================================================');
  
  // Initial checks
  await checkPing();
  await checkHealth();
  
  // Setup regular checks
  pingTimer = setInterval(async () => {
    try {
      await checkPing();
      printSummary();
    } catch (e) {
      log(`Error in ping check: ${e.message}`);
    }
  }, PING_INTERVAL);
  
  healthTimer = setInterval(async () => {
    try {
      await checkHealth();
    } catch (e) {
      log(`Error in health check: ${e.message}`);
    }
  }, HEALTH_INTERVAL);
}

// Handle ctrl+c to stop monitoring
process.on('SIGINT', () => {
  log('🛑 Stopping monitoring');
  clearInterval(pingTimer);
  clearInterval(healthTimer);
  printSummary();
  process.exit(0);
});

// Start the monitoring
startMonitoring().catch(error => {
  log(`❌ Error starting monitoring: ${error.message}`);
  process.exit(1);
}); 