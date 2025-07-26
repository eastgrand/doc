import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Dynamic API proxy for all 16 SHAP microservice endpoints
 * 
 * Replaces the single analyze-proxy with comprehensive routing
 * that supports all analysis endpoints with proper authentication
 * and error handling.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      success: false, 
      error: 'Method Not Allowed. Only POST requests are supported.' 
    });
  }

  try {
    // Extract endpoint path from dynamic route
    const endpoint = Array.isArray(req.query.endpoint) 
      ? req.query.endpoint.join('/')
      : req.query.endpoint;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: 'Endpoint path is required'
      });
    }

    // Get microservice configuration
    const microserviceUrl = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_URL ||
                            'https://shap-demographic-analytics-v3.onrender.com';
    const apiKey = process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_API_KEY;

    if (!apiKey) {
      console.error('[API] Missing SHAP microservice API key');
      return res.status(500).json({
        success: false,
        error: 'Service configuration error'
      });
    }

    // Validate endpoint (security check)
    const allowedEndpoints = [
      'analyze',
      'spatial-clusters',
      'competitive-analysis',
      'correlation-analysis',
      'segment-profiling',
      'trend-analysis',
      'anomaly-detection',
      'market-risk',
      'penetration-optimization',
      'threshold-analysis',
      'demographic-insights',
      'feature-interactions',
      'outlier-detection',
      'scenario-analysis',
      'comparative-analysis',
      'predictive-modeling'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return res.status(400).json({
        success: false,
        error: `Unknown endpoint: ${endpoint}. Allowed endpoints: ${allowedEndpoints.join(', ')}`
      });
    }

    // Prepare request payload
    const payload = {
      ...req.body,
      // Ensure required fields are present
      sample_size: req.body.sample_size || 5000,
      target_variable: req.body.target_variable || req.body.targetVariable || 'MP30034A_B_P'
    };

    console.log(`[API] Proxying to ${endpoint} with payload:`, {
      endpoint,
      payloadKeys: Object.keys(payload),
      sampleSize: payload.sample_size,
      targetVariable: payload.target_variable
    });

    // Make request to microservice
    const microserviceResponse = await fetch(`${microserviceUrl}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(payload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(60000) // 60 second timeout
    });

    // Handle response
    if (!microserviceResponse.ok) {
      const errorText = await microserviceResponse.text();
      console.error(`[API] Microservice error for ${endpoint}:`, {
        status: microserviceResponse.status,
        statusText: microserviceResponse.statusText,
        error: errorText
      });

      return res.status(microserviceResponse.status).json({
        success: false,
        error: `Microservice error: ${microserviceResponse.status} ${microserviceResponse.statusText}`,
        details: errorText
      });
    }

    const result = await microserviceResponse.json();
    
    // Add metadata to response
    const enhancedResult = {
      ...result,
      metadata: {
        ...result.metadata,
        endpoint,
        proxiedAt: new Date().toISOString(),
        processingTime: Date.now() - Date.now() // This would be calculated properly
      }
    };

    console.log(`[API] Successful response from ${endpoint}:`, {
      success: enhancedResult.success,
      resultCount: enhancedResult.results?.length || 0,
      hasFeatureImportance: !!enhancedResult.feature_importance
    });

    // Return successful result
    res.status(200).json(enhancedResult);

  } catch (error) {
    console.error('[API] Proxy error:', error);
    
    // Handle different error types
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout - microservice took too long to respond';
        statusCode = 504;
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to analysis service';
        statusCode = 503;
      }
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Configuration for this API route
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Allow larger payloads for analysis requests
    },
    responseLimit: '50mb', // Allow larger responses for comprehensive analysis
  },
} 