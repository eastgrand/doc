const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

/**
 * Redis Connection Test
 * 
 * Performs detailed testing of Redis connectivity
 */
async function testRedisConnection() {
  const log = [];
  const addLog = (msg) => {
    const timestamp = new Date().toISOString();
    log.push(`[${timestamp}] ${msg}`);
    console.log(`[${timestamp}] ${msg}`);
  };

  addLog('Starting Redis connection test...');

  try {
    // Check if Redis environment variables are set
    addLog('Checking Redis environment variables...');
    const redisUrl = process.env.REDIS_URL;
    const redisTimeout = process.env.REDIS_TIMEOUT || '5';
    const redisSocketKeepAlive = process.env.REDIS_SOCKET_KEEPALIVE || 'true';
    const redisConnectionPoolSize = process.env.REDIS_CONNECTION_POOL_SIZE || '10';
    const redisHealthCheckInterval = process.env.REDIS_HEALTH_CHECK_INTERVAL || '30';

    // Log masked Redis URL
    const maskedUrl = redisUrl ? 
      redisUrl.replace(/(rediss?:\/\/[^:]+:)([^@]+)(@.+)/, '$1***$3') : 
      'Not set';
      
    addLog(`REDIS_URL: ${maskedUrl}`);
    addLog(`REDIS_TIMEOUT: ${redisTimeout}`);
    addLog(`REDIS_SOCKET_KEEPALIVE: ${redisSocketKeepAlive}`);
    addLog(`REDIS_CONNECTION_POOL_SIZE: ${redisConnectionPoolSize}`);
    addLog(`REDIS_HEALTH_CHECK_INTERVAL: ${redisHealthCheckInterval}`);
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }
    
    // Redis setup
    const redis = require('redis');
    addLog('Redis module loaded successfully.');
    
    // Create Redis client with timeout handling
    addLog('Creating Redis client...');
    const client = redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: parseInt(redisTimeout, 10) * 1000,
        keepAlive: redisSocketKeepAlive === 'true',
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            addLog('Maximum Redis reconnection attempts reached');
            return new Error('Maximum reconnection attempts reached');
          }
          const delay = Math.min(Math.pow(2, retries) * 1000, 30000);
          addLog(`Reconnecting in ${delay}ms...`);
          return delay;
        }
      }
    });
    
    // Set up event handlers
    client.on('connect', () => addLog('Redis client connected'));
    client.on('ready', () => addLog('Redis client ready'));
    client.on('error', (err) => addLog(`Redis client error: ${err.message}`));
    client.on('reconnecting', () => addLog('Redis client reconnecting...'));
    
    // Connect with timeout
    addLog('Attempting to connect to Redis...');
    await client.connect();
    addLog('Connected to Redis successfully!');
    
    // Test SET operation
    addLog('Testing SET operation...');
    const startSet = Date.now();
    await client.set('connection_test', 'Connection successful at ' + new Date().toISOString());
    const setTime = Date.now() - startSet;
    addLog(`SET operation completed in ${setTime}ms`);
    
    // Test GET operation
    addLog('Testing GET operation...');
    const startGet = Date.now();
    const value = await client.get('connection_test');
    const getTime = Date.now() - startGet;
    addLog(`GET operation completed in ${getTime}ms. Value: ${value}`);
    
    // Test PING operation
    addLog('Testing PING operation...');
    const startPing = Date.now();
    const pingResult = await client.ping();
    const pingTime = Date.now() - startPing;
    addLog(`PING operation completed in ${pingTime}ms. Result: ${pingResult}`);
    
    // Test multiple rapid operations for stability
    addLog('Testing 5 rapid PING operations...');
    for (let i = 0; i < 5; i++) {
      const start = Date.now();
      await client.ping();
      addLog(`PING ${i+1}/5 completed in ${Date.now() - start}ms`);
    }
    
    // Get Redis server info
    addLog('Getting Redis server info...');
    const info = await client.info();
    const infoLines = info.split('\n').filter(line => 
      line.includes('connected_clients') || 
      line.includes('used_memory_human') ||
      line.includes('redis_version')
    );
    addLog('Redis server info:');
    infoLines.forEach(line => addLog(`  ${line}`));
    
    // Close the connection
    addLog('Closing Redis connection...');
    await client.quit();
    addLog('Redis connection closed successfully');
    
    // Final summary
    addLog('✅ ALL TESTS PASSED: Redis connection is working properly');
    
    return {
      success: true,
      log,
      summary: {
        setTime,
        getTime,
        pingTime,
        redisVersion: infoLines.find(line => line.includes('redis_version'))?.split(':')[1]?.trim() || 'unknown'
      }
    };
    
  } catch (error) {
    addLog(`❌ ERROR: ${error.message}`);
    addLog('Redis connection test failed');
    
    return {
      success: false,
      log,
      error: error.message
    };
  }
}

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      REDIS_URL: process.env.REDIS_URL ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV || 'Not set'
    }
  });
});

// Redis test endpoint
app.get('/test-redis', async (req, res) => {
  try {
    const result = await testRedisConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all environment variables (exclude sensitive ones)
app.get('/env', (req, res) => {
  const env = { ...process.env };
  
  // Remove sensitive variables
  ['REDIS_URL', 'API_KEY', 'PASSWORD', 'SECRET'].forEach(key => {
    if (env[key]) {
      env[key] = 'REDACTED';
    }
  });
  
  res.json({
    env
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Redis diagnostic API listening at http://localhost:${port}`);
}); 