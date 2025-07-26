# ML Analytics Service Troubleshooting Guide

## Summary of Issues

The ML Analytics Service hosted at `nesto-mortgage-analytics.onrender.com` is experiencing intermittent connection issues, primarily related to:

1. **502 Bad Gateway errors** - Indicating Redis connection problems on the server side
2. **Connection timeouts** - Due to the service sleeping on Render's free tier
3. **Redis connectivity** - Intermittent Redis connectivity failures

## Root Causes

Our investigation has identified several underlying causes:

1. **Render Free Tier Limitations**:
   - Services are put to sleep after periods of inactivity
   - Cold starts can take up to 30-60 seconds
   - Limited resources and connection limits

2. **Redis Connection Issues**:
   - The service requires a connection to Redis for job queuing
   - Redis connections may time out or be limited by the provider (Upstash)
   - 502 Bad Gateway errors indicate Redis connectivity problems

3. **Network Timeouts**:
   - Default request timeouts may be too short for cold starts
   - Connection pooling issues can occur with many simultaneous requests

## Implemented Solutions

We've made the following improvements to handle these issues gracefully:

1. **Enhanced Error Detection**:
   - Added specific Redis error detection (including 502 responses)
   - Implemented friendly error messages for specific failure types

2. **Robust Service Client**:
   - Added exponential backoff retry logic (2^retry * 1000ms)
   - Implemented memory optimization for large datasets
   - Created a service wake-up sequence that sends multiple pings 
   - Added job status caching and stalled job detection

3. **Fallback Strategies**:
   - Implemented local fallback data generation when service is unavailable
   - Added caching of successful responses to reduce API calls
   - Use of mock data when the service is completely down

## Monitoring Tools

We've created several diagnostic tools that can help identify and troubleshoot issues:

1. **connection_diagnostics.js** - Tests DNS resolution, connectivity, and timeout issues
2. **check_redis_connection.js** - Specifically tests Redis connectivity 
3. **wake_service.js** - Attempts to wake up the sleeping service with multiple pings
4. **continuous_monitor.js** - Runs ongoing monitoring to identify patterns in service availability

## Common Issues and Solutions

### 1. Service Returns 502 Bad Gateway

**Cause**: Redis connection issues on the server.

**Solutions**:
- Run `node wake_service.js` to attempt multiple wake-up pings
- Wait 1-2 minutes for the service to fully initialize
- Check if Redis database (Upstash) is experiencing issues
- Use the fallback strategy in the client

### 2. Requests Time Out

**Cause**: Service is likely asleep on Render's free tier.

**Solutions**:
- Increase request timeouts (we've implemented up to 45s timeouts)
- Run `node wake_service.js` to ping the service and wake it up
- Consider using a paid tier on Render to avoid sleep mode
- Check service health directly: `node check_redis_connection.js`

### 3. Authentication Failures

**Cause**: Service is up but authentication or header processing is failing.

**Solutions**:
- Verify the API key is correct (currently using: `HFqkccbN3LV5CaB`)
- Check for proper headers in requests
- Try a direct ping first, then authenticated requests
- Check the service logs on Render's dashboard

## Long-term Recommendations

For a more stable solution, consider:

1. **Upgrade to Paid Tier**: 
   - Render's paid tier ($7/month) would keep the service always active
   - Would eliminate most cold start issues

2. **Alternative Redis Provider**:
   - Test with a different Redis provider besides Upstash
   - Consider self-hosted Redis with more resources

3. **Monitoring**:
   - Use the `continuous_monitor.js` script to track service stability over time
   - Set up alerts for sustained downtime

4. **Client-side Improvements**:
   - Continue to enhance our client-side fallback mechanisms
   - Consider adding more sophisticated caching strategies

## How to Use the Diagnostic Tools

```bash
# Network diagnostics and connectivity tests
node connection_diagnostics.js

# Try to wake up the sleeping service
node wake_service.js

# Test Redis connection specifically
node check_redis_connection.js

# Start continuous monitoring
node continuous_monitor.js
```

## Conclusion

The ML Analytics Service issues are primarily related to the limitations of free-tier cloud hosting and Redis connectivity problems. While we've implemented robust error handling and fallback strategies, the most reliable solution would be upgrading to paid tiers for both Render and Redis services.

Until then, our enhanced client code provides graceful fallbacks and clear error messaging to ensure the application remains functional even when the service is unavailable. 