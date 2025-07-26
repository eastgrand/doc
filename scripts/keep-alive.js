#!/usr/bin/env node

const axios = require('axios');
require('dotenv').config();

const API_ENDPOINT = 'https://nesto-mortgage-analytics.onrender.com';
const API_KEY = process.env.API_KEY || process.env.NEXT_PUBLIC_SHAP_API_KEY || 'HFqkccbN3LV5CaB';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds
const TIMEOUT_MS = 30000; // 30 seconds timeout (longer for initial wake-up)

// Log timestamp helper
function logWithTimestamp(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

async function pingService() {
  logWithTimestamp('Pinging SHAP service to keep it alive...');
  
  try {
    // First try the health endpoint
    const response = await axios.get(`${API_ENDPOINT}/health`, {
      headers: { 'X-API-KEY': API_KEY },
      timeout: TIMEOUT_MS
    });
    
    logWithTimestamp(`Service is alive! Response: ${response.status}`);
    return true;
  } catch (error) {
    if (error.response) {
      // The service responded with a status code outside the 2xx range
      logWithTimestamp(`Service responded with status ${error.response.status}`);
      
      // If we get a 401, the service is up but the API key might be wrong
      if (error.response.status === 401) {
        logWithTimestamp('Service is awake but authentication failed. Check your API key.');
      }
      
      // Even with an error response, the service is still "alive"
      return true;
    } else if (error.code === 'ECONNABORTED') {
      logWithTimestamp('Request timed out. The service may be starting up or overloaded.');
      return false;
    } else {
      logWithTimestamp(`Error connecting to service: ${error.message}`);
      return false;
    }
  }
}

async function keepAlive() {
  let successCount = 0;
  let failureCount = 0;
  
  logWithTimestamp('Starting SHAP service keep-alive script');
  logWithTimestamp(`API Endpoint: ${API_ENDPOINT}`);
  logWithTimestamp(`API Key: ${API_KEY.substring(0, 3)}...${API_KEY.substring(API_KEY.length - 3)}`);
  logWithTimestamp(`Ping interval: ${PING_INTERVAL / 1000 / 60} minutes`);
  
  // Initial ping
  const success = await pingService();
  if (success) {
    successCount++;
  } else {
    failureCount++;
  }
  
  // Set up interval for regular pings
  setInterval(async () => {
    const success = await pingService();
    if (success) {
      successCount++;
      logWithTimestamp(`Success count: ${successCount}, Failure count: ${failureCount}`);
    } else {
      failureCount++;
      logWithTimestamp(`Success count: ${successCount}, Failure count: ${failureCount}`);
    }
  }, PING_INTERVAL);
}

// Start the keep-alive process
keepAlive().catch(error => {
  logWithTimestamp(`Unhandled error in keep-alive script: ${error}`);
  process.exit(1);
}); 