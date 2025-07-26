# Redis Diagnostic Tools - Deployment Instructions

This directory contains tools to diagnose Redis connectivity issues with the ML Analytics API. Below are options for deploying and using these tools.

## Option 1: Run Diagnostic Scripts Directly in Render Shell

The simplest approach is to use the inline scripts that can be pasted directly into the Render service shell.

### Javascript Version (inline_redis_test.js)

1. Go to your Render dashboard
2. Open the ML Analytics service shell
3. Paste the entire content of `inline_redis_test.js` into the shell and press Enter
4. The script will automatically test Redis connectivity and report detailed results

### Python Version (inline_redis_test.py)

1. Go to your Render dashboard
2. Open the ML Analytics service shell
3. Paste the entire content of `inline_redis_test.py` into the shell and press Enter
4. The script will automatically test Redis connectivity and report detailed results

## Option 2: Deploy a Standalone Redis Diagnostic Service

For more persistent diagnostics, you can deploy a standalone diagnostic service:

1. Create a new Web Service on Render
2. Point it to this repository directory
3. Set the following environment variables:
   - `REDIS_URL`: Copy this from your ML Analytics service
   - `PORT`: Set to 10000 (or any available port)
   - `NODE_ENV`: production

### Deployment Steps

```bash
# 1. Create a new directory for the diagnostic service
mkdir redis-diagnostic-service
cd redis-diagnostic-service

# 2. Copy the required files
cp ../redis-diagnostic-api.js .
cp ../local-redis-test.js .

# 3. Create package.json
cat > package.json << 'EOL'
{
  "name": "redis-diagnostic-service",
  "version": "1.0.0",
  "description": "Redis connectivity diagnostic service",
  "main": "redis-diagnostic-api.js",
  "scripts": {
    "start": "node redis-diagnostic-api.js",
    "test": "node local-redis-test.js"
  },
  "dependencies": {
    "express": "^4.17.1",
    "redis": "^4.6.0"
  }
}
EOL

# 4. Create a simple README for the service
cat > README.md << 'EOL'
# Redis Diagnostic Service

This service provides diagnostic endpoints for Redis connectivity testing.

## Endpoints

- `/health`: Basic health check
- `/test-redis`: Run Redis connection tests
- `/env`: View environment variables (sensitive values are redacted)

## Usage

To run locally:
```
npm install
npm start
```
EOL

# 5. Create a simple start script
cat > start.sh << 'EOL'
#!/bin/bash
npm install
node redis-diagnostic-api.js
EOL
chmod +x start.sh

# 6. Create a Dockerfile
cat > Dockerfile << 'EOL'
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "redis-diagnostic-api.js"]
EOL
```

## Option 3: Run Local Tests Against Remote Redis

You can test Redis connectivity from your local machine:

1. Install the dependencies:
```bash
npm install redis
```

2. Run the diagnostic script with your Redis URL:
```bash
node local-redis-test.js redis://username:password@host:port
```

3. For more detailed diagnostics:
```bash
node local-redis-test.js redis://username:password@host:port --diagnose --verbose
```

## Troubleshooting Common Issues

### Connection Timeouts

If you're experiencing connection timeouts:
- Check network connectivity between Render and Upstash
- Verify firewall settings are not blocking connections
- Try increasing the `REDIS_TIMEOUT` value

### Authentication Failures

If authentication is failing:
- Double-check the Redis URL format
- Verify the password is correct
- Ensure you're using the correct username (if applicable)

### Slow Connections

If connections are slow:
- Check the network latency between Render and Upstash
- Look for high load on the Redis server
- Consider connection pooling configuration

### "Cannot connect to Redis" Errors

If the service can't connect:
- Verify Redis is running and accessible
- Check if you've reached connection limits
- Try a direct connection test to isolate the issue 