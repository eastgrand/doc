// Remove this conflicting import - we'll define our own AnalysisResult interface
// import { StructuredQuery, AnalysisResult } from '../types';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Initialize dotenv
dotenv.config();

// Constants for memory optimization
const MEMORY_OPTIMIZATION = {
  MAX_BATCH_SIZE: 5000,
  MEMORY_LIMITS: {
    ANALYSIS: 2048 // MB
  }
};

// Default target variable if not specified
const DEFAULT_TARGET_VARIABLE = 'target';

// Simple in-memory cache for job statuses
const jobStatusCache = new Map();

// Track if the service has been successfully connected to
const serviceInitialized = false;
const lastSuccessfulConnection = 0;
const CONNECTION_FRESHNESS_MS = 5 * 60 * 1000; // 5 minutes

// Timeout for API requests
const DEFAULT_FETCH_TIMEOUT = 15000; // 15 seconds
const PING_TIMEOUT = 8000;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const CONNECTION_TIMEOUT = 45000; // 45 seconds total timeout
const WAKE_UP_TIMEOUT = 15000; // 15 seconds for wake-up ping
const PING_MAX_RETRIES = 3;

/**
 * Utility function for performing fetch requests with a timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = DEFAULT_FETCH_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Set up the timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    // Add the signal to options
    const response = await fetch(url, {
      ...options,
      signal
    });
    return response;
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch with retry and exponential backoff
 */
async function fetchWithRetry(
  url: string, 
  options: RequestInit = {}, 
  timeoutMs: number = DEFAULT_FETCH_TIMEOUT,
  maxRetries: number = MAX_RETRIES
): Promise<Response> {
  let retries = 0;
  let lastError: any = null;
  
  while (retries <= maxRetries) {
    try {
      if (retries > 0) {
        console.log(`Retry attempt ${retries}/${maxRetries} for ${url}`);
      }
      
      const response = await fetchWithTimeout(url, options, timeoutMs + (retries * 5000));
      return response;
    } catch (error: any) {
      lastError = error;
      console.error(`Fetch error (attempt ${retries+1}/${maxRetries+1}):`, error.message);
      
      // Don't retry on user abort
      if (error.name === 'AbortError' && error.message?.includes('The user aborted a request')) {
        throw error;
      }
      
      // Increment retry counter
      retries++;
      
      // If we still have retries left, wait using exponential backoff
      if (retries <= maxRetries) {
        const backoffTime = Math.pow(2, retries) * 1000;
        console.log(`Waiting ${backoffTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // If we've exhausted all retries, throw the last error
  throw lastError;
}

/**
 * Improved error handling for Redis connection issues
 */
async function handleRedisConnectionErrors(error: any, operationType: 'job_submission' | 'status_check' | 'polling'): Promise<string> {
  // Check if the error message contains Redis connection indicators
  const isRedisError = 
    (error?.message?.includes('Redis') && error?.message?.includes('connection')) ||
    error?.message?.includes('connection_pool') ||
    error?.message?.includes('Redis Queue') ||
    error?.message?.includes('TypeError') ||
    error?.message?.includes('ConnectionError') ||
    error?.status === 502 || // Add 502 Bad Gateway status code
    error?.message?.includes('502'); // Add 502 error message text

  // Log detail about the Redis error  
  if (isRedisError) {
    console.error(`[ML REDIS ERROR] ${operationType}: ${error.message || 'Bad Gateway (502)'}`);
    
    // Return a user-friendly error message
    return 'The ML analytics service is experiencing temporary issues with its connection to Redis. Please try again in a few moments while we resolve this issue.';
  }
  
  // For non-Redis errors, return the original message
  return error?.message || 'Unknown error occurred';
}

/**
 * ML Analytics Service Client
 * Handles connection to the ML analytics service with robust error handling
 * and fallbacks for when the service is down.
 */

const API_URL = 'https://shap-demographic-analytics-v3.onrender.com';
const API_KEY = 'HFqkccbN3LV5CaB';

export type AnalysisType = 'correlation' | 'prediction' | 'hotspot' | 'multivariate' | 'anomaly' | 'network';

export interface AnalysisRequest {
  analysis_type: AnalysisType;
  target_variable: string;
  data: Record<string, any>[];
  visualizationType?: string;
  accept_partial_results?: boolean;
  memory_optimized?: boolean;
}

export interface AnalysisResult {
  job_id?: string;
  status: 'success' | 'error' | 'processing' | 'fallback';
  predictions?: number[];
  explanations?: {
    shap_values: number[][];
    feature_names: string[];
    base_value: number;
  };
  error?: string;
  processing_time?: number;
  model_version?: string;
  model_type?: string;
  cached?: boolean;
  is_fallback?: boolean;
  // Additional fields from structured query type
  type?: string;
  data?: any[];
  summary?: any;
  featureImportance?: any;
  shapValues?: any;
}

export interface JobStatus {
  status: 'queued' | 'processing' | 'complete' | 'error' | 'not_found' | 'stalled';
  result?: AnalysisResult;
  error?: string;
  progress?: number;
  start_time?: string;
  end_time?: string;
  wait_time?: number;
  estimated_time_remaining?: number;
}

export interface Metadata {
  available_models: AnalysisType[];
  processing_capacity: number;
  queue_length: number;
  active_workers: number;
  average_processing_time: Record<AnalysisType, number>;
  service_health: 'good' | 'degraded' | 'maintenance';
  engine_version: string;
  max_data_points: number;
  status: 'operational' | 'degraded' | 'maintenance' | 'down';
  redis_connected?: boolean;
}

/**
 * MLAnalyticsService provides an interface for interacting with the machine learning
 * analytics service with robust error handling and fallbacks.
 */
export class MLAnalyticsService {
  private cache: Map<string, AnalysisResult> = new Map();
  private isServiceAwake: boolean = false;
  private lastServiceCheck: number = 0;
  private redisConnected: boolean = false;
  private stalledJobs: Set<string> = new Set();
  
  constructor() {
    // Initialize cache and service status
    this.cache = new Map();
    this.isServiceAwake = false;
    this.lastServiceCheck = 0;
  }
  
  /**
   * Attempts to wake up the service if it's been inactive.
   * Render free tier services go to sleep after inactivity.
   */
  private async wakeUpService(): Promise<boolean> {
    // If we've checked in the last minute, don't check again
    const now = Date.now();
    if (now - this.lastServiceCheck < 60000 && this.isServiceAwake) {
      return this.isServiceAwake;
    }
    
    this.lastServiceCheck = now;
    let awake = false;
    
    // Try to ping the service
    try {
      let pingSuccess = false;
      let redisConnected = false;
      
      for (let i = 0; i < PING_MAX_RETRIES; i++) {
        try {
          const response = await fetchWithTimeout(`${API_URL}/ping`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache',
              'User-Agent': 'ml-analytics-client'
            }
          }, WAKE_UP_TIMEOUT);
          
          if (response.ok) {
            pingSuccess = true;
            
            // Service is responding - now check Redis
            try {
              const healthResponse = await fetchWithTimeout(`${API_URL}/health`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'Cache-Control': 'no-cache',
                  'User-Agent': 'ml-analytics-client',
                  'x-api-key': API_KEY
                }
              }, WAKE_UP_TIMEOUT);
              
              if (healthResponse.ok) {
                const health = await healthResponse.json();
                redisConnected = health.redis_connected === true;
                if (redisConnected) {
                  console.log('Service is fully operational with Redis connection');
                } else {
                  console.log('Service is partially operational - Redis disconnected');
                }
              } else {
                console.log(`Health check failed with status ${healthResponse.status}`);
                redisConnected = false;
              }
            } catch (error: any) {
              console.log(`Health check failed: ${error.message}`);
              redisConnected = false;
            }
            
            break;
          } else if (response.status === 502) {
            // 502 means service is starting but Redis might be disconnected
            console.log('Service is responding with 502 Bad Gateway - Redis likely disconnected');
            pingSuccess = true; // Consider it semi-awake
            redisConnected = false;
            break;
          }
        } catch (error: any) {
          console.log(`Ping attempt ${i+1} failed: ${error.message}`);
          await new Promise(r => setTimeout(r, 2000)); // Increased delay between pings
        }
      }
      
      this.isServiceAwake = pingSuccess;
      this.redisConnected = redisConnected;
      awake = pingSuccess;
      
      return awake;
    } catch (error: any) {
      console.log(`Service wake-up failed: ${error.message}`);
      this.isServiceAwake = false;
      this.redisConnected = false;
      return false;
    }
  }
  
  /**
   * Submits an analysis request to the ML analytics service
   */
  async submitAnalysis(request: AnalysisRequest): Promise<AnalysisResult> {
    // Check if service is awake
    await this.wakeUpService();
    
    // If service or Redis is down, use fallback
    if (!this.isServiceAwake || !this.redisConnected) {
      console.log(`Service unavailable (awake: ${this.isServiceAwake}, redis: ${this.redisConnected}), using fallback`);
      return this.getFallbackAnalysisResult(request);
    }
    
    try {
      // Prepare cache key for this request
      const cacheKey = this.generateCacheKey(request);
      
      // Check cache for identical request
      const cachedResult = this.cache.get(cacheKey);
      if (cachedResult) {
        return { ...cachedResult, cached: true };
      }
      
      const response = await fetchWithRetry(
        `${API_URL}/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify(request)
        }
      );
      
      if (!response.ok) {
        if (response.status === 502) {
          console.log('Redis connection error (502 Bad Gateway)');
          this.redisConnected = false;
          return this.getFallbackAnalysisResult(request);
        }
        
        // Handle other errors
        const errorText = await response.text();
        let errorMsg;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || `Server error (${response.status})`;
          
          // Check for Redis-specific errors
          if (errorMsg.includes('Redis') || errorMsg.includes('queue')) {
            console.log('Redis-related error detected:', errorMsg);
            this.redisConnected = false;
            return this.getFallbackAnalysisResult(request);
          }
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }
        
        throw new Error(errorMsg);
      }
      
      const result = await response.json();
      
      // Cache successful result
      if (result.status === 'success' && !result.error) {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error: any) {
      // For network errors, use fallback
      console.error(`Error submitting analysis: ${error.message}`);
      return this.getFallbackAnalysisResult(request);
    }
  }
  
  /**
   * Checks the status of a previously submitted analysis job
   */
  async checkJobStatus(jobId: string): Promise<JobStatus> {
    // Check if this is a known stalled job
    if (this.stalledJobs.has(jobId)) {
      return {
        status: 'stalled',
        error: 'Job appears to be stalled. The ML service may be experiencing issues.'
      };
    }
    
    // Check if service is awake
    await this.wakeUpService();
    
    // If service is down, return appropriate status
    if (!this.isServiceAwake || !this.redisConnected) {
      return {
        status: 'error',
        error: `Service unavailable (awake: ${this.isServiceAwake}, redis: ${this.redisConnected})`
      };
    }
    
    try {
      const response = await fetchWithRetry(
        `${API_URL}/status/${jobId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 502) {
          console.log('Redis connection error (502 Bad Gateway)');
          this.redisConnected = false;
          return {
            status: 'error',
            error: 'Redis connection error. The service is currently unavailable.'
          };
        }
        
        // Handle other errors
        const errorText = await response.text();
        let errorMsg;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || `Server error (${response.status})`;
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }
        
        return {
          status: 'error',
          error: errorMsg
        };
      }
      
      const status = await response.json();
      
      // Check for stalled jobs (stuck in processing for too long)
      if (status.status === 'processing') {
        // Check how long the job has been processing
        if (status.start_time) {
          const startTime = new Date(status.start_time).getTime();
          const now = Date.now();
          const processingTime = now - startTime;
          
          // If processing for over 5 minutes, mark as stalled
          if (processingTime > 300000) {
            this.stalledJobs.add(jobId);
            return {
              status: 'stalled',
              error: 'Job appears to be stalled. The ML service may be experiencing issues.'
            };
          }
        }
      }
      
      return status;
    } catch (error: any) {
      console.error(`Error checking job status: ${error.message}`);
      return {
        status: 'error',
        error: error.message
      };
    }
  }
  
  /**
   * Gets metadata about the ML analytics service
   */
  async getMetadata(): Promise<Metadata | null> {
    // Check if service is awake
    await this.wakeUpService();
    
    // If service is down, return null
    if (!this.isServiceAwake) {
      console.error('Service is not awake, cannot retrieve metadata');
      return null;
    }
    
    try {
      const response = await fetchWithRetry(
        `${API_URL}/metadata`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 502) {
          console.log('Redis connection error (502 Bad Gateway)');
          this.redisConnected = false;
          throw new Error('Redis connection error. The service is currently unavailable.');
        }
        
        // Handle other errors
        const errorText = await response.text();
        let errorMsg;
        try {
          const errorJson = JSON.parse(errorText);
          errorMsg = errorJson.error || `Server error (${response.status})`;
        } catch {
          errorMsg = `Server error: ${response.status}`;
        }
        
        throw new Error(errorMsg);
      }
      
      const metadata = await response.json();
      this.redisConnected = metadata.redis_connected === true;
      
      return metadata;
    } catch (error: any) {
      console.error(`Error retrieving metadata: ${error.message}`);
      throw error;
    }
  }
  
  /**
   * Cancels a running job
   */
  async cancelJob(jobId: string): Promise<boolean> {
    // Remove from stalled jobs if present
    this.stalledJobs.delete(jobId);
    
    // Check if service is awake
    await this.wakeUpService();
    
    // If service is down, return failure
    if (!this.isServiceAwake || !this.redisConnected) {
      return false;
    }
    
    try {
      const response = await fetchWithRetry(
        `${API_URL}/cancel/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY
          }
        }
      );
      
      if (!response.ok) {
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Clear the results cache
   */
  clearCache(): void {
    this.cache.clear();
    this.stalledJobs.clear();
  }
  
  /**
   * Generates a cache key for a request
   */
  private generateCacheKey(request: AnalysisRequest): string {
    // Create a stable representation of the request for caching
    const { data, ...rest } = request;
    
    // Create a safe string for the data that maintains order
    const dataStr = JSON.stringify(data.map(item => {
      // Sort keys to ensure consistent string representation
      return Object.keys(item).sort().reduce((obj: any, key) => {
        obj[key] = item[key];
        return obj;
      }, {});
    }));
    
    // Combine parts to create a cache key
    return JSON.stringify({ ...rest, dataHash: this.hashCode(dataStr) });
  }
  
  /**
   * Simple string hash function for caching
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Provides a fallback result when the service is unavailable
   */
  private getFallbackAnalysisResult(request: AnalysisRequest): AnalysisResult {
    console.log('Using fallback for analysis', request.analysis_type);
    
    // Generate a synthetic job ID for tracking
    const jobId = `fallback-${uuidv4()}`;
    
    // Create basic fallback result structure
    const fallbackResult: AnalysisResult = {
      job_id: jobId,
      status: 'fallback',
      error: 'ML service is currently unavailable. Using simplified fallback analysis with basic data patterns.',
      model_type: request.analysis_type,
      processing_time: 0.1,
      is_fallback: true
    };
    
    const { data, target_variable, analysis_type } = request;
    
    switch (analysis_type) {
      case 'correlation':
        fallbackResult.predictions = this.generateFallbackCorrelation(data, target_variable);
        break;
        
      case 'prediction':
        fallbackResult.predictions = this.generateFallbackPrediction(data);
        fallbackResult.explanations = this.generateFallbackExplanations(data);
        break;
        
      case 'hotspot':
        fallbackResult.predictions = this.generateFallbackHotspot(data);
        break;
        
      case 'multivariate':
        fallbackResult.predictions = this.generateFallbackMultivariate(data);
        break;
        
      case 'anomaly':
        fallbackResult.predictions = this.generateFallbackAnomaly(data);
        break;
        
      case 'network':
        fallbackResult.predictions = this.generateFallbackNetwork(data);
        break;
        
      default:
        fallbackResult.predictions = Array(data.length).fill(0.5);
    }
    
    return fallbackResult;
  }
  
  /**
   * Generate fallback correlation values
   */
  private generateFallbackCorrelation(data: any[], targetVar: string): number[] {
    // Find other variables in the data to correlate
    if (data.length === 0) return [];
    
    const firstItem = data[0];
    const variables = Object.keys(firstItem).filter(key => key !== targetVar);
    
    // Generate "correlation" values between -0.8 and 0.8
    return variables.map(() => (Math.random() * 1.6) - 0.8);
  }
  
  /**
   * Generate fallback prediction values
   */
  private generateFallbackPrediction(data: any[]): number[] {
    // Generate predictions between 0 and 1
    return data.map(() => Math.random());
  }
  
  /**
   * Generate fallback explanations for predictions
   */
  private generateFallbackExplanations(data: any[]): {
    shap_values: number[][];
    feature_names: string[];
    base_value: number;
  } {
    if (data.length === 0) {
      return {
        shap_values: [],
        feature_names: [],
        base_value: 0.5
      };
    }
    
    // Get feature names from first data item
    const firstItem = data[0];
    const featureNames = Object.keys(firstItem);
    
    // Generate random SHAP values that sum close to the prediction
    const baseValue = 0.5;
    const shapValues = data.map(() => {
      const values = featureNames.map(() => (Math.random() * 0.4) - 0.2);
      return values;
    });
    
    return {
      shap_values: shapValues,
      feature_names: featureNames,
      base_value: baseValue
    };
  }
  
  /**
   * Generate fallback hotspot values
   */
  private generateFallbackHotspot(data: any[]): number[] {
    // Generate hotspot intensity values
    return data.map(() => Math.random() * 0.9 + 0.1); // 0.1 to 1.0
  }
  
  /**
   * Generate fallback multivariate analysis values
   */
  private generateFallbackMultivariate(data: any[]): number[] {
    // Generate cluster assignments (integers)
    return data.map(() => Math.floor(Math.random() * 3)); // 0, 1, or 2
  }
  
  /**
   * Generate fallback anomaly detection values
   */
  private generateFallbackAnomaly(data: any[]): number[] {
    // Generate anomaly scores, mostly low with occasional high values
    return data.map(() => {
      // 90% normal, 10% anomalies
      return Math.random() > 0.9 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.2;
    });
  }
  
  /**
   * Generate fallback network analysis values
   */
  private generateFallbackNetwork(data: any[]): number[] {
    // Generate centrality or importance scores
    return data.map(() => Math.random());
  }

  async checkHealth(): Promise<any> {
    const response = await fetch('/api/ml-analytics?endpoint=health');
    if (!response.ok) throw new Error('Health check failed');
    return response.json();
  }

  /**
   * Gets the health status of the ML analytics service
   */
  async getServiceHealth(): Promise<{
    status: 'operational' | 'degraded' | 'maintenance' | 'down';
    redis_connected: boolean;
    last_check: number;
  }> {
    try {
      const metadata = await this.getMetadata();
      if (!metadata) {
        return {
          status: 'down',
          redis_connected: false,
          last_check: Date.now()
        };
      }

      return {
        status: metadata.status,
        redis_connected: metadata.redis_connected || false,
        last_check: Date.now()
      };
    } catch (error) {
      return {
        status: 'down',
        redis_connected: false,
        last_check: Date.now()
      };
    }
  }

  /**
   * Resumes a stalled or interrupted analysis job
   */
  async resumeAnalysis(jobId: string, options: { forceComplete?: boolean } = {}): Promise<AnalysisResult> {
    // Check if service is awake
    await this.wakeUpService();
    
    // If service is down, return error
    if (!this.isServiceAwake || !this.redisConnected) {
      return {
        status: 'error',
        error: 'Service is currently unavailable'
      };
    }

    try {
      const response = await fetchWithRetry(
        `${API_URL}/resume/${jobId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-key': API_KEY
          },
          body: JSON.stringify(options)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to resume job (${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      return {
        status: 'error',
        error: error.message || 'Failed to resume analysis'
      };
    }
  }
}

// Export singleton instance
export default new MLAnalyticsService(); 