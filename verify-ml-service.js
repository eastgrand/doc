#!/usr/bin/env node
/**
 * ML Service Verification Tool
 * 
 * Tests all endpoints of the ML service and verifies functionality
 * 
 * Usage:
 *   node verify-ml-service.js https://your-service-url [api-key]
 */

const https = require('https');
const { URL } = require('url');

// Parse command line arguments
const args = process.argv.slice(2);
const serviceUrl = args[0] || 'http://localhost:5000';
const apiKey = args[1] || process.env.API_KEY || '';

// Validate service URL
if (!serviceUrl) {
  console.error('❌ ERROR: Service URL is required');
  console.error('Usage: node verify-ml-service.js https://your-service-url [api-key]');
  process.exit(1);
}

// Format URL to ensure it doesn't end with a slash
const baseUrl = serviceUrl.endsWith('/') ? serviceUrl.slice(0, -1) : serviceUrl;

// Test request function
async function makeRequest(path, method = 'GET', data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };
    
    // Add API key if provided
    if (apiKey) {
      options.headers['x-api-key'] = apiKey;
    }
    
    // Create request
    const protocol = url.protocol === 'https:' ? https : require('http');
    const req = protocol.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        let data = body;
        
        try {
          data = JSON.parse(body);
        } catch (e) {
          // Not JSON, keep as string
        }
        
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.abort();
      reject(new Error(`Request timeout after 10 seconds`));
    });
    
    // Send data if provided
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test endpoints
async function testEndpoints() {
  const results = {
    ping: {success: false, data: null, error: null},
    health: {success: false, data: null, error: null},
    predict: {success: false, data: null, error: null},
    diagnostics: {success: false, data: null, error: null},
    redis_reconnect: {success: false, data: null, error: null},
  };
  
  console.log(`\n🔍 ML SERVICE VERIFICATION TOOL`);
  console.log(`=============================`);
  console.log(`Service URL: ${baseUrl}`);
  console.log(`API Key: ${apiKey ? '✅ Provided' : '❌ Not provided'}`);
  console.log(`Test time: ${new Date().toISOString()}`);
  console.log(`=============================\n`);
  
  // Test 1: Ping endpoint
  try {
    console.log('🔄 Testing /ping endpoint...');
    const response = await makeRequest('/ping');
    
    if (response.statusCode === 200 && response.data.status === 'ok') {
      console.log('✅ Ping successful!');
      results.ping.success = true;
      results.ping.data = response.data;
    } else {
      console.error(`❌ Ping failed with status code ${response.statusCode}`);
      results.ping.data = response.data;
    }
  } catch (error) {
    console.error(`❌ Ping request error: ${error.message}`);
    results.ping.error = error.message;
  }
  
  // Test 2: Health endpoint
  try {
    console.log('\n🔄 Testing /api/health endpoint...');
    const response = await makeRequest('/api/health');
    
    if (response.statusCode === 200) {
      console.log('✅ Health check successful!');
      console.log(`📊 Service status: ${response.data.status}`);
      
      if (response.data.components) {
        // New improved health endpoint format
        const components = response.data.components;
        
        if (components.redis) {
          console.log(`📊 Redis status: ${components.redis.status}`);
          if (components.redis.error) {
            console.log(`⚠️ Redis error: ${components.redis.error}`);
          }
        }
        
        if (components.models) {
          console.log(`📊 Models status: ${components.models.status}`);
          console.log(`📊 Loaded models: ${components.models.loaded_models.join(', ')}`);
        }
      } else if (response.data.redis) {
        // Old health endpoint format
        console.log(`📊 Redis status: ${response.data.redis.status}`);
      }
      
      results.health.success = true;
      results.health.data = response.data;
    } else {
      console.error(`❌ Health check failed with status code ${response.statusCode}`);
      results.health.data = response.data;
    }
  } catch (error) {
    console.error(`❌ Health request error: ${error.message}`);
    results.health.error = error.message;
  }
  
  // Test 3: Prediction endpoint (only if API key is provided)
  if (apiKey) {
    try {
      console.log('\n🔄 Testing /api/predict endpoint...');
      
      // Sample prediction request
      const predictionData = {
        query: "predict crime rates for downtown area",
        visualizationType: "HOTSPOT",
        spatialConstraints: {
          "bbox": [-122.4, 37.7, -122.3, 37.8]
        }
      };
      
      const response = await makeRequest('/api/predict', 'POST', predictionData, {'x-api-key': apiKey});
      
      if (response.statusCode === 200 && response.data.predictions) {
        console.log('✅ Prediction successful!');
        console.log(`📊 Model type: ${response.data.model_type}`);
        console.log(`📊 Processing time: ${response.data.processing_time}s`);
        console.log(`📊 Cached: ${response.data.cached ? 'Yes' : 'No'}`);
        
        results.predict.success = true;
        results.predict.data = response.data;
      } else {
        console.error(`❌ Prediction failed with status code ${response.statusCode}`);
        if (response.data && response.data.error) {
          console.error(`❌ Error: ${response.data.error}`);
        }
        results.predict.data = response.data;
      }
    } catch (error) {
      console.error(`❌ Prediction request error: ${error.message}`);
      results.predict.error = error.message;
    }
    
    // Test 4: Diagnostics endpoint
    try {
      console.log('\n🔄 Testing /api/diagnostics endpoint...');
      const response = await makeRequest('/api/diagnostics');
      
      if (response.statusCode === 200) {
        console.log('✅ Diagnostics successful!');
        
        if (response.data.redis) {
          const redisInfo = response.data.redis;
          console.log(`Redis Configuration:`);
          console.log(`  • Configured: ${redisInfo.configured}`);
          console.log(`  • Enabled: ${redisInfo.enabled}`);
          console.log(`  • Connected: ${redisInfo.connected}`);
          if (redisInfo.error) {
            console.log(`  • Last error: ${redisInfo.error}`);
          }
          if (redisInfo.host) {
            console.log(`  • Host: ${redisInfo.host}`);
          }
        }
        
        results.diagnostics.success = true;
        results.diagnostics.data = response.data;
      } else {
        console.error(`❌ Diagnostics failed with status code ${response.statusCode}`);
        results.diagnostics.data = response.data;
      }
    } catch (error) {
      console.error(`❌ Diagnostics request error: ${error.message}`);
      results.diagnostics.error = error.message;
    }
    
    // Test 5: Redis Reconnect
    try {
      console.log('\n🔄 Testing /api/redis/reconnect endpoint...');
      const response = await makeRequest('/api/redis/reconnect', 'POST');
      
      if (response.statusCode === 200) {
        console.log('✅ Redis reconnect successful!');
        console.log(`📊 Status: ${response.data.status}`);
        console.log(`📊 Message: ${response.data.message}`);
        
        results.redis_reconnect.success = true;
        results.redis_reconnect.data = response.data;
      } else {
        console.error(`❌ Redis reconnect failed with status code ${response.statusCode}`);
        results.redis_reconnect.data = response.data;
      }
    } catch (error) {
      console.error(`❌ Redis reconnect request error: ${error.message}`);
      results.redis_reconnect.error = error.message;
    }
  } else {
    console.log('\n⚠️ API key not provided - skipping authenticated endpoints');
  }
  
  // Final summary
  console.log('\n=============================');
  console.log('🔍 TEST RESULTS SUMMARY:');
  console.log('=============================');
  
  console.log(`/ping: ${results.ping.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`/api/health: ${results.health.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  
  if (apiKey) {
    console.log(`/api/predict: ${results.predict.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`/api/diagnostics: ${results.diagnostics.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`/api/redis/reconnect: ${results.redis_reconnect.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  }
  
  // Overall assessment
  const criticalEndpoints = ['ping', 'health'];
  const criticalSuccess = criticalEndpoints.every(endpoint => results[endpoint].success);
  
  console.log('\n=============================');
  if (criticalSuccess) {
    console.log('✅ SERVICE IS OPERATIONAL');
  } else {
    console.log('❌ SERVICE HAS CRITICAL ISSUES');
  }
  console.log('=============================');
}

// Run the tests
testEndpoints().catch(error => {
  console.error(`Unhandled error: ${error}`);
  process.exit(1);
}); 