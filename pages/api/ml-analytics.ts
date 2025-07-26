import { NextApiRequest, NextApiResponse } from 'next';
import { MLAnalyticsService } from '../../services/ml-analytics-service';

// This endpoint proxy serves as a middleware to communicate with the SHAP/XGBoost service
// Use this to avoid CORS issues and provide better error handling
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure CORS headers are properly set
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Create the ML Analytics service
  const mlService = new MLAnalyticsService();
  
  // Log request details
  console.log(`ML Analytics API Request:`, {
    method: req.method,
    url: req.url,
    query: req.query,
    timestamp: new Date().toISOString()
  });
  
  try {
    // Route based on the endpoint path
    const { endpoint } = req.query;
    
    console.log(`Processing ${req.method} request to /api/ml-analytics/${endpoint}`);
    
    switch (endpoint) {
      case 'ping':
        // Direct ping test
        try {
          const startTime = Date.now();
          console.log('Testing direct ping to service...');
          
          const pingResponse = await fetch('https://shap-demographic-analytics-v3.onrender.com/ping', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Nesto-API-Proxy/1.0'
            }
          });
          
          const elapsed = Date.now() - startTime;
          console.log(`Ping response received in ${elapsed}ms with status ${pingResponse.status}`);
          
          if (pingResponse.ok) {
            const pingData = await pingResponse.json();
            return res.status(200).json({
              ...pingData,
              _debug: {
                responseTime: elapsed,
                status: pingResponse.status,
                timestamp: new Date().toISOString()
              }
            });
          } else {
            // Even if ping fails, return some useful info
            return res.status(pingResponse.status).json({
              error: 'Ping failed',
              status: pingResponse.status,
              statusText: pingResponse.statusText,
              _debug: {
                responseTime: elapsed,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (error: any) {
          console.error('Ping error:', error);
          return res.status(500).json({
            error: 'Failed to ping service',
            message: error.message,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      
      case 'health':
        // Test health endpoint
        try {
          console.log('Checking ML service health...');
          const startTime = Date.now();
          
          const health = await mlService.checkHealth();
          const elapsed = Date.now() - startTime;
          
          console.log(`Health check completed in ${elapsed}ms`);
          return res.status(200).json({
            ...health,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Health check error:', error);
          
          // Check for Redis connection errors
          const isRedisError = 
            (error?.message?.includes('Redis') && error?.message?.includes('connection')) ||
            error?.message?.includes('connection_pool') ||
            error?.message?.includes('ConnectionError');
          
          return res.status(500).json({
            error: 'Health check failed',
            message: error.message,
            isRedisError: isRedisError,
            errorType: error.name || 'Unknown',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            timestamp: new Date().toISOString()
          });
        }
        
      case 'metadata': {
        // Get metadata
        try {
          console.log('Fetching ML service metadata...');
          const startTime = Date.now();
          
          const metadata = await mlService.getMetadata();
          const elapsed = Date.now() - startTime;
          
          console.log(`Metadata fetch completed in ${elapsed}ms`);
          return res.status(200).json({
            ...metadata,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Metadata error:', error);
          
          // Check for Redis connection errors
          const isRedisError = 
            (error?.message?.includes('Redis') && error?.message?.includes('connection')) ||
            error?.message?.includes('connection_pool') ||
            error?.message?.includes('ConnectionError');
          
          return res.status(500).json({
            error: 'Failed to retrieve metadata',
            message: error.message,
            isRedisError: isRedisError,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
        
      case 'analyze': {
        // Submit an analysis job
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Method not allowed' });
        }
        
        try {
          console.log('Submitting ML analysis job...');
          const startTime = Date.now();
          
          const result = await mlService.submitAnalysis(req.body);
          const elapsed = Date.now() - startTime;
          
          console.log(`Analysis job submitted in ${elapsed}ms, job ID: ${result.job_id}`);
          return res.status(200).json({
            ...result,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Analysis submission error:', error);
          
          // Check for Redis connection errors
          const isRedisError = 
            (error?.message?.includes('Redis') && error?.message?.includes('connection')) ||
            error?.message?.includes('connection_pool') ||
            error?.message?.includes('ConnectionError') ||
            error?.message?.includes('job queue system');
          
          return res.status(500).json({
            error: 'Failed to submit analysis',
            message: error.message,
            isRedisError: isRedisError,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
        
      case 'job_status': {
        // Check job status
        const { jobId } = req.query;
        if (!jobId) {
          return res.status(400).json({ error: 'Job ID is required' });
        }
        
        try {
          console.log(`Checking status for job ID: ${jobId}...`);
          const startTime = Date.now();
          
          const status = await mlService.checkJobStatus(jobId as string);
          const elapsed = Date.now() - startTime;
          
          console.log(`Job status check completed in ${elapsed}ms: ${status.status}`);
          return res.status(200).json({
            ...status,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Job status check error:', error);
          
          // Check for Redis connection errors
          const isRedisError = 
            (error?.message?.includes('Redis') && error?.message?.includes('connection')) ||
            error?.message?.includes('connection_pool') ||
            error?.message?.includes('ConnectionError') ||
            error?.message?.includes('job queue system');
          
          return res.status(500).json({
            error: 'Failed to check job status',
            message: error.message,
            isRedisError: isRedisError,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
        
      case 'service_health': {
        // Get comprehensive service health status
        try {
          console.log('Checking comprehensive service health...');
          const startTime = Date.now();
          
          const healthStatus = await mlService.getServiceHealth();
          const elapsed = Date.now() - startTime;
          
          console.log(`Service health check completed in ${elapsed}ms`);
          return res.status(200).json({
            ...healthStatus,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Service health check error:', error);
          return res.status(500).json({
            error: 'Failed to check service health',
            message: error.message,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
        
      case 'resume_job': {
        // Resume a previously started job
        const { resumeJobId, forceComplete } = req.query;
        if (!resumeJobId) {
          return res.status(400).json({ error: 'Job ID is required for resuming' });
        }
        
        try {
          console.log(`Resuming job ID: ${resumeJobId}...`);
          const startTime = Date.now();
          
          const result = await mlService.resumeAnalysis(
            resumeJobId as string, 
            { forceComplete: forceComplete === 'true' }
          );
          
          const elapsed = Date.now() - startTime;
          console.log(`Job resume completed in ${elapsed}ms`);
          
          return res.status(200).json({
            ...result,
            _debug: {
              responseTime: elapsed,
              timestamp: new Date().toISOString()
            }
          });
        } catch (error: any) {
          console.error('Job resume error:', error);
          return res.status(500).json({
            error: 'Failed to resume job',
            message: error.message,
            errorType: error.name || 'Unknown',
            timestamp: new Date().toISOString()
          });
        }
      }
        
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('API route error:', error);
    return res.status(500).json({
      error: 'Unexpected error',
      message: error.message,
      errorType: error.name || 'Unknown',
      timestamp: new Date().toISOString()
    });
  }
} 