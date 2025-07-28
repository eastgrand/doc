import { AnalysisOptions, RawAnalysisResult } from './types';
import { ConfigurationManager } from './ConfigurationManager';

/**
 * CachedEndpointRouter - Enhanced with multi-endpoint detection
 * 
 * Now includes:
 * - Multi-endpoint query detection
 * - Intelligent routing to MultiEndpointRouter when needed
 * - Seamless fallback to single-endpoint processing
 * - Backwards compatibility maintained
 */
export class CachedEndpointRouter {
  private configManager: ConfigurationManager;
  private cachedDatasets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  constructor(configManager: ConfigurationManager) {
    this.configManager = configManager;
    console.log('[CachedEndpointRouter] Initialized with multi-endpoint awareness');
  }

  /**
   * Enhanced endpoint selection that can detect multi-endpoint needs
   */
  async selectEndpoint(query: string, options?: AnalysisOptions): Promise<string> {
    console.log(`🔥 [CachedEndpointRouter] selectEndpoint called with query: "${query}"`);
    console.log(`🔥 [CachedEndpointRouter] Options:`, options);
    
    // If endpoint is explicitly specified, use it
    if (options?.endpoint) {
      console.log(`🔥 [CachedEndpointRouter] Using explicitly specified endpoint: ${options.endpoint}`);
      return options.endpoint;
    }

    // Check if this should be routed to multi-endpoint system
    if (this.shouldRouteToMultiEndpoint(query, options)) {
      // Return a special identifier that the AnalysisEngine can detect
      return 'MULTI_ENDPOINT_DETECTED';
    }

    // Use standard single endpoint suggestion
    const selectedEndpoint = this.suggestSingleEndpoint(query);
    console.log(`[CachedEndpointRouter] Auto-selected endpoint: ${selectedEndpoint} for query: "${query}"`);
    return selectedEndpoint;
  }

  /**
   * Detect if query should use multi-endpoint analysis
   */
  private shouldRouteToMultiEndpoint(query: string, options?: AnalysisOptions): boolean {
    // Quick multi-endpoint detection patterns
    const multiEndpointIndicators = [
      // Market analysis patterns
      /where should.*expand.*consider/i,
      /invest.*consider.*competition.*demographic/i,
      
      // Diagnostic patterns
      /why.*underperform.*root cause/i,
      /diagnose.*consider.*multiple/i,
      
      // Strategic patterns
      /strategy.*competition.*demographic/i,
      /optimize.*across.*endpoint/i,
      
      // Risk-opportunity patterns
      /risk.*opportunity/i,
      /high.*low.*invest/i,
      
      // Comparison patterns
      /compare.*across.*segment/i,
      /versus.*demographic/i,
      
      // Explicit multi-endpoint requests
      /multiple.*analysis/i,
      /comprehensive.*consider/i,
      /competitive.*and.*demographic.*analysis/i,
      /strategic.*and.*competitive.*analysis/i
      // Temporarily disabled customer profile multi-endpoint patterns
      // /customer.*profile.*and.*strategic/i,
      // /customer.*profile.*compare.*strategic/i,
      // /analyze.*customer.*profile.*strategic/i
    ];

    // Check for pattern matches
    const hasMultiPattern = multiEndpointIndicators.some(pattern => pattern.test(query));
    
    // Check for explicit endpoint combinations in query
    const mentionedEndpoints = this.countEndpointMentions(query);
    
    if (true) {
      console.log('[CachedEndpointRouter] Multi-endpoint detection:', {
        query: query.substring(0, 50) + '...',
        hasMultiPattern,
        endpointMentions: mentionedEndpoints,
        shouldRoute: hasMultiPattern || mentionedEndpoints >= 2
      });
    }

    return hasMultiPattern || mentionedEndpoints >= 2;
  }

  /**
   * Count how many different endpoints are mentioned in the query
   */
  private countEndpointMentions(query: string): number {
    const lowerQuery = query.toLowerCase();
    
    // Only count multi-endpoint signals when there are explicit analysis type mentions
    // Don't count generic brand names or simple performance mentions
    const endpointKeywords = {
      competitive: ['competitive analysis', 'competition analysis', 'competitor analysis', 'market share analysis'],
      demographic: ['demographic analysis', 'population analysis', 'income analysis', 'age analysis'],
      spatial: ['cluster analysis', 'spatial analysis', 'location analysis', 'geographic analysis'],
      predictive: ['predictive analysis', 'forecast analysis', 'trend analysis'],
      risk: ['risk analysis', 'anomaly analysis', 'volatile analysis'],
      strategic: ['strategic analysis', 'strategy analysis', 'investment analysis']
    };

    let mentionedEndpoints = 0;
    for (const [endpoint, keywords] of Object.entries(endpointKeywords)) {
      const hasKeyword = keywords.some(keyword => lowerQuery.includes(keyword));
      if (hasKeyword) mentionedEndpoints++;
    }

    return mentionedEndpoints;
  }

  /**
   * Standard single endpoint suggestion (existing logic)
   */
  public suggestSingleEndpoint(query: string): string {
    const lowerQuery = query.toLowerCase();
    const endpoints = this.configManager.getEndpointConfigurations();
    
    let bestMatch = { endpoint: '/analyze', score: 0 };
    
    for (const config of endpoints) {
      let score = 0;
      
      // Check keyword matches with weighted scoring
      for (const keyword of config.keywords) {
        if (lowerQuery.includes(keyword.toLowerCase())) {
          // Give higher weight to more specific endpoint keywords
          if (config.id === '/demographic-insights' && keyword === 'demographic') {
            score += 3; // Strong boost for demographic queries
          } else if (config.id === '/competitive-analysis' && (keyword === 'competitive' || keyword === 'competition')) {
            score += 3; // Strong boost for competitive queries
          } else if (config.id === '/comparative-analysis' && keyword === 'compare') {
            score += 3; // Strong boost for comparative queries
          } else if (config.id === '/strategic-analysis' && keyword === 'strategic') {
            score += 3; // Strong boost for strategic queries
          } else if (keyword.length > 6) {
            score += 1.5; // Moderate boost for longer, more specific keywords
          } else {
            score += 1; // Standard score for generic keywords
          }
        }
      }
      
      // Boost score for exact matches
      if (config.keywords.some(keyword => lowerQuery === keyword.toLowerCase())) {
        score += 2;
      }
      
      // Special handling: demographic queries with "opportunity" should prioritize demographic-insights
      if (config.id === '/demographic-insights' && 
          lowerQuery.includes('demographic') && 
          (lowerQuery.includes('opportunity') || lowerQuery.includes('score'))) {
        score += 5; // Strong boost for demographic opportunity queries
      }
      
      // Special handling: "market factors" queries should go to feature-interactions
      // This is the most semantically appropriate endpoint for factor analysis
      if (config.id === '/feature-interactions' && 
          lowerQuery.includes('market factor') && 
          (lowerQuery.includes('success') || lowerQuery.includes('correlat'))) {
        score += 7; // Strong boost for market factors analysis
      }
      
      if (score > bestMatch.score) {
        bestMatch = { endpoint: config.id, score };
      }
    }
    
    return bestMatch.endpoint;
  }

  /**
   * Enhanced callEndpoint that works with both single and multi-endpoint
   */
  async callEndpoint(endpoint: string, query: string, options?: AnalysisOptions): Promise<RawAnalysisResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[CachedEndpointRouter] Loading cached data for ${endpoint}`);
      console.log(`[CachedEndpointRouter] Called with query: "${query}"`);
      console.log(`[CachedEndpointRouter] Called with options:`, options);
      
      // Load the cached dataset for this endpoint
      const cachedData = await this.loadCachedDataset(endpoint);
      
      if (!cachedData) {
        throw new Error(`No cached data available for endpoint: ${endpoint}`);
      }

      // Process the cached data based on query and options
      const processedResult = this.processCachedData(cachedData, query, options);
      
      const executionTime = Date.now() - startTime;
      console.log(`[CachedEndpointRouter] Loaded ${processedResult.results?.length || 0} records from cache in ${executionTime}ms`);
      
      return processedResult;
      
    } catch (error) {
      console.error(`[CachedEndpointRouter] Error loading cached data for ${endpoint}:`, error);
      
      // No fallback - each endpoint must work independently
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to load cached data for ${endpoint}: ${errorMessage}. Each endpoint must have its own data.`);
    }
  }

  /**
   * Load cached dataset for a specific endpoint
   */
  private async loadCachedDataset(endpoint: string): Promise<any> {
    const endpointKey = this.getEndpointKey(endpoint);
    
    // Check if already cached in memory
    if (this.cachedDatasets.has(endpointKey)) {
      return this.cachedDatasets.get(endpointKey);
    }

    // Check if already loading
    if (this.loadingPromises.has(endpointKey)) {
      return this.loadingPromises.get(endpointKey);
    }

    // Start loading
    const loadingPromise = this.loadDatasetFromFile(endpointKey);
    this.loadingPromises.set(endpointKey, loadingPromise);

    try {
      const data = await loadingPromise;
      this.cachedDatasets.set(endpointKey, data);
      this.loadingPromises.delete(endpointKey);
      return data;
    } catch (error) {
      this.loadingPromises.delete(endpointKey);
      throw error;
    }
  }

  /**
   * Load dataset from JSON file - Updated to use standard file names (now containing optimized data)
   */
  private async loadDatasetFromFile(endpointKey: string): Promise<any> {
    const possiblePaths = [
      `/data/endpoints/${endpointKey}.json`,            // Individual endpoint files (now optimized)
      `/data/endpoints/all_endpoints.json`,             // Combined file (now optimized)
      `/data/microservice-export-all-endpoints.json`,  // Legacy combined file  
      `/data/microservice-export.json`                 // Legacy file
    ];

    console.log(`[CachedEndpointRouter] Looking for dataset with key: "${endpointKey}"`);

    for (const path of possiblePaths) {
      try {
        console.log(`[CachedEndpointRouter] Trying to load ${path}`);
        
        const response = await fetch(path);
        if (!response.ok) {
          continue; // Try next path
        }

        const data = await response.json();
        
        // Handle combined file structure
        if (path.includes('all_endpoints.json') && data[endpointKey]) {
          console.log(`[CachedEndpointRouter] ✅ Loaded data for ${endpointKey} from combined file`);
          return data[endpointKey];
        }
        
        // Handle individual files
        if (path.includes(`${endpointKey}.json`)) {
          console.log(`[CachedEndpointRouter] ✅ Loaded data for ${endpointKey}`);
          return data;
        }

        // Handle legacy combined files
        return this.extractLegacyData(data, endpointKey);
        
      } catch (error) {
        console.warn(`[CachedEndpointRouter] Failed to load ${path}:`, error);
        continue;
      }
    }

    throw new Error(`No cached data found for endpoint: ${endpointKey}. Tried paths: ${possiblePaths.join(', ')}`);
  }

  /**
   * Extract location ID from record for geographic matching
   */
  private extractLocationId(record: any): string {
    // ZIP Code matching - try multiple field variations
    return String(record.ZIP || record.ZIPCODE || record.zip_code || record.ID || record.id || record.area_id || 'unknown');
  }

  /**
   * Convert endpoint path to cache key - FIXED to match actual filenames
   */
  private getEndpointKey(endpoint: string): string {
    const endpointMap: Record<string, string> = {
      '/analyze': 'analyze',
      '/strategic-analysis': 'strategic-analysis',
      '/spatial-clusters': 'spatial-clusters',
      '/competitive-analysis': 'competitive-analysis', 
      '/correlation-analysis': 'correlation-analysis',
      '/demographic-insights': 'demographic-insights',
      '/trend-analysis': 'trend-analysis',
      '/anomaly-detection': 'anomaly-detection',
      '/feature-interactions': 'feature-interactions',
      '/outlier-detection': 'outlier-detection',
      '/comparative-analysis': 'comparative-analysis',
      '/predictive-modeling': 'predictive-modeling',
      '/segment-profiling': 'segment-profiling',
      '/scenario-analysis': 'scenario-analysis',
      '/brand-analysis': 'competitive-analysis',
      '/market-sizing': 'segment-profiling',
      '/real-estate-analysis': 'spatial-clusters'
    };
    
    return endpointMap[endpoint] || endpoint.replace('/', '');
  }

  /**
   * Extract compatible data from legacy cache file
   */
  private extractLegacyData(legacyData: any, endpointKey: string): any {
    // Try to find compatible data in legacy structure
    if (legacyData.datasets) {
      // Look for exact match
      if (legacyData.datasets[endpointKey]) {
        return legacyData.datasets[endpointKey];
      }
      
      // Look for similar analysis types
      if (endpointKey === 'correlation_analysis' && legacyData.datasets.correlation_analysis) {
        return legacyData.datasets.correlation_analysis;
      }
      
      // Fallback to first available dataset
      const firstDataset = Object.values(legacyData.datasets)[0];
      console.warn(`[CachedEndpointRouter] Using fallback dataset for ${endpointKey}`);
      return firstDataset;
    }

    return null;
  }

  /**
   * Process cached data based on query parameters
   */
  private processCachedData(cachedData: any, query: string, options?: AnalysisOptions): RawAnalysisResult {
    try {
      // Handle both direct array format and wrapped object format
      let dataArray: any[] = [];
      
      if (Array.isArray(cachedData)) {
        // Direct array format: [{...}, {...}]
        dataArray = cachedData;
        console.log(`[CachedEndpointRouter] Processing direct array format with ${dataArray.length} records`);
      } else if (cachedData.results && Array.isArray(cachedData.results)) {
        // Wrapped format: {success: true, results: [{...}, {...}]}
        dataArray = cachedData.results;
        console.log(`[CachedEndpointRouter] Processing wrapped format with ${dataArray.length} records`);
      } else {
        console.warn(`[CachedEndpointRouter] No valid data array found in cached data:`, Object.keys(cachedData));
      }

      // Ensure we have a valid structure
      const processedResult: RawAnalysisResult = {
        success: true,
        results: dataArray,
        model_info: cachedData.model_info || {},
        feature_importance: cachedData.feature_importance || [],
      };

      console.log(`[CachedEndpointRouter] Processed ${processedResult.results.length} cached records`);
      return processedResult;
      
    } catch (error) {
      console.error('[CachedEndpointRouter] Error processing cached data:', error);
      
      // Return minimal valid structure
      return {
        success: false,
        error: `Failed to process cached data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results: [],
        
      };
    }
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache(): void {
    this.cachedDatasets.clear();
    this.loadingPromises.clear();
    console.log('[CachedEndpointRouter] Cache cleared');
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { loadedEndpoints: string[], memoryUsage: number } {
    return {
      loadedEndpoints: Array.from(this.cachedDatasets.keys()),
      memoryUsage: this.cachedDatasets.size
    };
  }
} 