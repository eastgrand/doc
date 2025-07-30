import { 
  AnalysisOptions, 
  AnalysisResult, 
  AnalysisState, 
  ProcessedAnalysisData,
  VisualizationResult,
  AnalysisEngineConfig,
  StateSubscriber,
  AnalysisEvent,
  AnalysisEventType,
  DeepPartial,
  ProcessingStep
} from './types';

// Switch to CachedEndpointRouter for frontend cache mode
import { CachedEndpointRouter } from './CachedEndpointRouter';
import { VisualizationRenderer } from './VisualizationRenderer';
import { DataProcessor } from './DataProcessor';
import { StateManager } from './StateManager';
import { ConfigurationManager } from './ConfigurationManager';

// Import multi-endpoint system
import { MultiEndpointAnalysisEngine, MultiEndpointAnalysisOptions, MultiEndpointAnalysisResult } from './MultiEndpointAnalysisEngine';
import { MultiEndpointQueryDetector } from './MultiEndpointQueryDetector';

// Import clustering system
import { ClusteringService } from '../clustering/ClusteringService';

/**
 * AnalysisEngine - Unified entry point for all analysis operations (Singleton)
 * 
 * Enhanced with multi-endpoint capabilities:
 * - Automatically detects when multi-endpoint analysis adds value
 * - Seamlessly falls back to single-endpoint for simple queries
 * - Maintains full backwards compatibility
 * 
 * Singleton pattern ensures consistent state and eliminates redundant initialization.
 */
export class AnalysisEngine {
  private static instance: AnalysisEngine | null = null;
  
  private endpointRouter: CachedEndpointRouter;
  private visualizationRenderer: VisualizationRenderer;
  private dataProcessor: DataProcessor;
  private stateManager: StateManager;
  private configManager: ConfigurationManager;
  private config: AnalysisEngineConfig;
  private eventListeners: Map<AnalysisEventType, Array<(event: AnalysisEvent) => void>> = new Map();

  // Multi-endpoint system components (optional)
  private multiEndpointEngine?: MultiEndpointAnalysisEngine;
  private queryDetector?: MultiEndpointQueryDetector;
  private enableMultiEndpoint: boolean;

  // Clustering system components
  private clusteringService: ClusteringService;

  private constructor(config?: DeepPartial<AnalysisEngineConfig>) {
    // Initialize configuration with defaults
    this.config = this.initializeConfig(config);
    
    // Initialize all modules
    this.configManager = ConfigurationManager.getInstance();
    this.endpointRouter = new CachedEndpointRouter(this.configManager);
    this.dataProcessor = new DataProcessor(this.configManager);
    this.visualizationRenderer = new VisualizationRenderer(this.configManager);
    this.stateManager = new StateManager();

    // Initialize multi-endpoint system
    this.enableMultiEndpoint = this.config.enableMultiEndpoint ?? true;
    if (this.enableMultiEndpoint) {
      this.multiEndpointEngine = new MultiEndpointAnalysisEngine(this.config);
      this.queryDetector = new MultiEndpointQueryDetector();
      console.log('[AnalysisEngine] Multi-endpoint system enabled');
    }

    // Initialize clustering system
    this.clusteringService = ClusteringService.getInstance();
    console.log('[AnalysisEngine] Clustering system initialized');

    // Configurations are loaded automatically by singleton

    if (this.config.debugMode) {
      console.log('[AnalysisEngine] Initialized with multi-endpoint support:', {
        multiEndpointEnabled: this.enableMultiEndpoint,
        config: this.config
      });
    }
  }

  /**
   * Get the singleton instance of AnalysisEngine
   * Ensures only one instance exists across the entire application
   */
  public static getInstance(config?: DeepPartial<AnalysisEngineConfig>): AnalysisEngine {
    if (!AnalysisEngine.instance) {
      console.log('[AnalysisEngine] Creating singleton instance...');
      AnalysisEngine.instance = new AnalysisEngine(config);
    }
    return AnalysisEngine.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes only)
   */
  public static resetInstance(): void {
    AnalysisEngine.instance = null;
  }

  /**
   * Execute analysis with options - Updated to use frontend cache as PRIMARY source
   */
  async executeAnalysis(query: string, options: AnalysisOptions = {}): Promise<AnalysisResult> {
    const startTime = Date.now();

    try {
      
      if (this.config.debugMode) {
        console.log(`[AnalysisEngine] Starting analysis: "${query}"`);
      }

      // --- PRIMARY: Use Frontend Cache (Not Microservice) ---
      // According to query-to-visualization flow documentation, 
      // the system uses cached data as PRIMARY source for all visualizations
      console.log('[AnalysisEngine] Using frontend cache as primary data source');
      
      // Use endpoint router to select appropriate endpoint based on query
      const selectedEndpoint = await this.endpointRouter.selectEndpoint(query, options);
      console.log(`[AnalysisEngine] Selected endpoint: ${selectedEndpoint}`);
      
      // NOTE: Clustering is now handled in geospatial-chat-interface.tsx after geometry join
      // This ensures clustering has access to real ZIP code geometries instead of approximations
      
      // Check if this should be routed to multi-endpoint analysis
      if (selectedEndpoint === 'MULTI_ENDPOINT_DETECTED') {
        console.log('[AnalysisEngine] Routing to multi-endpoint analysis');
        
        if (this.enableMultiEndpoint && this.multiEndpointEngine) {
          return await this.executeMultiEndpointAnalysis(query, options, undefined, startTime);
        } else {
          console.warn('[AnalysisEngine] Multi-endpoint detected but system disabled, falling back to single endpoint selection');
          // Do proper single endpoint selection without forcing competitive-analysis
          const fallbackEndpoint = await this.endpointRouter.suggestSingleEndpoint(query);
          console.log(`[AnalysisEngine] Fallback endpoint selected: ${fallbackEndpoint}`);
          const analysisData = await this.endpointRouter.callEndpoint(fallbackEndpoint, query, options);
          const processedData = this.dataProcessor.processResults(analysisData, fallbackEndpoint);
          
          // Continue with visualization creation...
          let visualization: any = null;
          if (this.visualizationRenderer) {
            try {
              visualization = this.visualizationRenderer.createVisualization(processedData, fallbackEndpoint);
            } catch (vizError) {
              console.error('[AnalysisEngine] Visualization creation failed:', vizError);
              visualization = null;
            }
          }

          const result: AnalysisResult = {
            success: true,
            endpoint: fallbackEndpoint,
            data: processedData,
            visualization: visualization || { 
              type: 'choropleth', 
              config: {
                colorScheme: 'viridis',
                opacity: 0.8,
                strokeWidth: 1,
                valueField: 'opportunityScore',
                labelField: 'area_name',
                popupFields: ['area_name']
              },
              renderer: {
                type: 'simple',
                symbol: {
                  type: 'simple-marker',
                  style: 'circle',
                  color: [65, 105, 225, 0.8],
                  size: 12,
                  outline: {
                    color: '#FFFFFF',
                    width: 1
                  }
                },
                _useCentroids: true
              },
              popupTemplate: {
                title: '{area_name}',
                content: [{
                  type: 'fields',
                  fieldInfos: [
                    { fieldName: 'area_name', label: 'Area' },
                    { fieldName: 'value', label: 'Value' }
                  ]
                }]
              },
              legend: { 
                title: 'Analysis',
                items: [{
                  label: 'Analysis Areas',
                  color: '#4169E1',
                  value: 0,
                  symbol: 'circle'
                }]
              }
            },
            metadata: {
              executionTime: Date.now() - startTime,
              dataPointCount: processedData.records?.length || 0,
              timestamp: new Date().toISOString()
            }
          };

          this.updateStateWithResult(result, processedData);
          return result;
        }
      }
      
      // Load data from frontend cache (3,983 records with 102 fields)
      const analysisData = await this.endpointRouter.callEndpoint(selectedEndpoint, query, options);
      
      // Process the cached data using the correct method name
      
      // Use the new geo-awareness system for geographic filtering
      const processedData = await this.dataProcessor.processResultsWithGeographicAnalysis(analysisData, selectedEndpoint, query);
      
      console.log(`[AnalysisEngine] Processed data returned:`, {
        type: processedData.type,
        recordCount: processedData.records?.length || 0,
        targetVariable: processedData.targetVariable,
        firstRecord: processedData.records?.[0] ? {
          area_name: processedData.records[0].area_name,
          value: processedData.records[0].value,
          rank: processedData.records[0].rank,
          nike_market_share: processedData.records[0].properties?.nike_market_share
        } : 'No records'
      });
      
      // 🚨 DEBUG: Strategic analysis value check
      if (selectedEndpoint === '/strategic-analysis' && processedData.records?.length > 0) {
        console.log('🚨🚨🚨 [STRATEGIC DEBUG] AnalysisEngine processed data:');
        console.log('🚨 First 5 processed record values:');
        processedData.records.slice(0, 5).forEach((record, i) => {
          console.log(`🚨   ${i+1}. ${record.area_name}: value=${record.value}`);
        });
        
        const values = processedData.records.slice(0, 5).map(r => r.value);
        const uniqueValues = [...new Set(values)];
        
        if (uniqueValues.length === 1) {
          console.log('🚨🚨🚨 PROBLEM: AnalysisEngine has identical values - issue in DataProcessor!');
        } else {
          console.log('🚨 ✅ AnalysisEngine has distinct values - corruption happens later');
        }
      }
      
      // Create initial result structure (without visualization yet)
      let result: AnalysisResult = {
        success: true,
        endpoint: selectedEndpoint,
        data: processedData,
        // visualization will be added after clustering
        metadata: {
          executionTime: Date.now() - startTime,
          dataPointCount: processedData.records?.length || 0,
          timestamp: new Date().toISOString()
        }
      };

      // NOTE: Clustering moved to geospatial-chat-interface.tsx after geometry join
      // This ensures clustering has access to real ZIP code geometries instead of approximations

      // Create visualization from final data (after clustering if enabled)
      let visualization: any = null;
      if (this.visualizationRenderer) {
        try {
          console.log('[AnalysisEngine] 🎯 About to create visualization (AFTER clustering):', {
            endpoint: selectedEndpoint,
            dataType: result.data.type,
            recordCount: result.data.records?.length,
            isClustered: result.data.isClustered,
            hasGeometry: result.data.records?.[0]?.geometry ? 'YES' : 'NO',
            targetVariable: result.data.targetVariable,
            firstClusterRecord: result.data.isClustered ? {
              area_name: result.data.records?.[0]?.area_name,
              value: result.data.records?.[0]?.value,
              zip_codes: result.data.records?.[0]?.properties?.zip_codes?.length
            } : 'Not clustered'
          });
          
          visualization = this.visualizationRenderer.createVisualization(result.data, selectedEndpoint);
          
          console.log('[AnalysisEngine] 🎯 Visualization created:', {
            success: !!visualization,
            type: visualization?.type,
            hasRenderer: !!visualization?.renderer,
            hasConfig: !!visualization?.config,
            hasLegend: !!visualization?.legend
          });

          // ⭐ If visualization contains competitive analysis data, incorporate it into the summary
          // DISABLED: This was injecting uncapped scores and market share data into Claude's analysis
          // if (visualization && visualization._competitiveAnalysis) {
          //   console.log('[AnalysisEngine] Found competitive analysis data in visualization, updating summary');
          //   result.data.summary = this.incorporateCompetitiveAnalysis(result.data.summary, visualization._competitiveAnalysis);
          // }
        } catch (vizError) {
          console.error('[AnalysisEngine] Visualization creation failed:', vizError);
          visualization = null;
        }
      } else {
        console.warn('[AnalysisEngine] No visualization renderer available');
      }

      // Set final visualization (or fallback)
      result.visualization = visualization || { 
        type: 'choropleth', 
        config: {
          colorScheme: 'viridis',
          opacity: 0.8,
          strokeWidth: 1,
          valueField: 'opportunityScore',
          labelField: 'area_name',
          popupFields: ['area_name']
        },
        renderer: {
          type: 'simple',
          symbol: {
            type: 'simple-marker',
            style: 'circle',
            color: [65, 105, 225, 0.8],
            size: 12,
            outline: {
              color: '#FFFFFF',
              width: 1
            }
          },
          _useCentroids: true
        },
        popupTemplate: {
          title: '{area_name}',
          content: [{
            type: 'fields',
            fieldInfos: [
              { fieldName: 'area_name', label: 'Area' },
              { fieldName: 'value', label: 'Value' }
            ]
          }]
        },
        legend: { 
          title: 'Analysis',
          items: [{
            label: 'Analysis Areas',
            color: '#4169E1',
            value: 0,
            symbol: 'circle'
          }]
        }
      };

      // Update state
      this.updateStateWithResult(result, result.data);

      if (this.config.debugMode) {
        console.log(`[AnalysisEngine] Cache-based analysis complete:`, {
          records: result.data?.records?.length || 0,
          endpoint: result.endpoint,
          executionTime: result.metadata?.executionTime
        });
      }

      return result;

    } catch (error) {
      console.error(`🚨🚨🚨 [ANALYSIS ENGINE ERROR] Cache-based analysis failed:`, error);
      console.error(`🚨 [ANALYSIS ENGINE ERROR] Error details:`, {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        query: query,
        options: options
      });
      
      // Return error result with proper types
      return {
        success: false,
        endpoint: options.endpoint || '/analyze',
        data: { 
          type: 'error',
          records: [], 
          summary: 'Analysis failed',
          statistics: { total: 0, mean: 0, median: 0, stdDev: 0, min: 0, max: 0 },
          targetVariable: 'error'
        },
        visualization: { 
          type: 'choropleth', 
          config: {
            colorScheme: 'viridis',
            opacity: 0.8,
            strokeWidth: 1,
            valueField: 'error',
            labelField: 'error',
            popupFields: []
          },
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-marker',
              style: 'circle',
              color: [255, 0, 0, 0.8],
              size: 12,
              outline: {
                color: '#FFFFFF',
                width: 1
              }
            },
            _useCentroids: true
          },
          popupTemplate: {
            title: 'Error',
            content: [{
              type: 'text',
              text: 'Analysis failed'
            }]
          },
          legend: { 
            title: 'Error', 
            position: 'bottom-right', 
            items: [{
              label: 'Error',
              color: '#FF0000',
              value: 0,
              symbol: 'circle'
            }] 
          }
        },
        metadata: {
          executionTime: Date.now() - startTime,
          dataPointCount: 0,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Execute multi-endpoint analysis
   */
  private async executeMultiEndpointAnalysis(
    query: string, 
    options?: AnalysisOptions,
    analysisId?: string,
    startTime?: number
  ): Promise<AnalysisResult> {

    try {
      // Convert options to multi-endpoint format
      const multiOptions: MultiEndpointAnalysisOptions = {
        ...options,
        forceMultiEndpoint: options?.forceMultiEndpoint,
        maxEndpoints: options?.maxEndpoints || 4,
        combinationStrategy: options?.combinationStrategy || 'overlay'
      };

      // Execute multi-endpoint analysis
      const multiResult = await this.multiEndpointEngine!.executeAnalysis(query, multiOptions);

      // Convert to standard AnalysisResult format for backwards compatibility
      const result: AnalysisResult = {
        endpoint: multiResult.endpointsUsed.join(' + '),
        data: multiResult.compositeData, // Use compositeData instead of data
        visualization: multiResult.visualization,
        success: true,
        metadata: {
          executionTime: multiResult.performanceMetrics.totalAnalysisTime,
          dataPointCount: multiResult.compositeData?.totalRecords || 0,
          timestamp: new Date().toISOString(),
          // Add multi-endpoint specific metadata
          isMultiEndpoint: true,
          endpointsUsed: multiResult.endpointsUsed,
          mergeStrategy: multiResult.mergeStrategy,
          strategicInsights: multiResult.strategicInsights,
          performanceMetrics: multiResult.performanceMetrics
        }
      };

      // Update state with successful multi-endpoint result
      this.updateStateWithResult(result, multiResult.compositeData);

      // Emit success event
      this.emitEvent('analysis-complete', { 
        query, 
        options, 
        analysisId, 
        result: { ...result, isMultiEndpoint: true }
      });

      if (this.config.debugMode) {
        console.log('[AnalysisEngine] Multi-endpoint analysis complete:', {
          endpoints: multiResult.endpointsUsed,
          records: multiResult.compositeData?.totalRecords,
          insights: multiResult.strategicInsights?.topOpportunities?.length,
          executionTime: result.metadata?.executionTime
        });
      }

      return result;

    } catch (error) {
      console.warn(`[AnalysisEngine] Multi-endpoint analysis failed, falling back to single-endpoint:`, error);
      
      // Fallback to single endpoint
      return await this.executeSingleEndpointAnalysis(query, options, analysisId, startTime);
    }
  }

  /**
   * Execute traditional single-endpoint analysis
   */
  private async executeSingleEndpointAnalysis(
    query: string,
    options?: AnalysisOptions,
    analysisId?: string,
    startTime?: number
  ): Promise<AnalysisResult> {

    const analysisStartTime = startTime || Date.now();

    // Step 1: Route to appropriate endpoint
    this.updateProcessingStep('analyzing_query', 10);
    const endpoint = await this.endpointRouter.selectEndpoint(query, options);
    
    if (this.config.debugMode) {
      console.log(`[AnalysisEngine] Selected endpoint: ${endpoint}`);
    }

    // Step 2: Call the endpoint
    this.updateProcessingStep('calling-endpoint', 30);
    const rawResults = await this.endpointRouter.callEndpoint(endpoint, query, options);

    // Step 3: Process the raw data
    this.updateProcessingStep('processing-data', 60);
    const processedData = this.dataProcessor.processResults(rawResults, endpoint);

    // Step 4: Create visualization
    this.updateProcessingStep('creating-visualization', 80);
    const visualization = this.visualizationRenderer.createVisualization(processedData, endpoint);

    // Step 5: Compile final result
    this.updateProcessingStep('updating-state', 90);
    const result: AnalysisResult = {
      endpoint,
      data: processedData,
      visualization,
      success: true,
      metadata: {
        executionTime: Date.now() - analysisStartTime,
        dataPointCount: processedData.records.length,
        timestamp: new Date().toISOString(),
        isMultiEndpoint: false
      }
    };

    // Update state with successful result
    this.updateStateWithResult(result, processedData);

    // Emit success event
    this.emitEvent('analysis-complete', { query, options, analysisId, result });

    return result;
  }

  /**
   * Determine if multi-endpoint analysis should be used
   */
  private shouldUseMultiEndpoint(query: string, options?: AnalysisOptions): boolean {
    // Force multi-endpoint if explicitly requested
    if (options?.forceMultiEndpoint) {
      return true;
    }

    // Skip multi-endpoint if explicitly disabled
    if (options?.disableMultiEndpoint || !this.enableMultiEndpoint) {
      return false;
    }

    // Use query detector to analyze
    const queryAnalysis = this.queryDetector!.analyzeQuery(query);
    
    // Use multi-endpoint if confidence is high enough
    const confidenceThreshold = options?.multiEndpointThreshold || 0.6;
    
    if (this.config.debugMode) {
      console.log('[AnalysisEngine] Multi-endpoint detection:', {
        query: query.substring(0, 60) + '...',
        isMultiEndpoint: queryAnalysis.isMultiEndpoint,
        confidence: queryAnalysis.confidence,
        threshold: confidenceThreshold,
        reasoning: queryAnalysis.reasoning
      });
    }

    return queryAnalysis.isMultiEndpoint && queryAnalysis.confidence >= confidenceThreshold;
  }

  /**
   * Update state with analysis result
   */
  private updateStateWithResult(result: AnalysisResult, processedData: ProcessedAnalysisData): void {
    this.stateManager.updateState({
      currentAnalysis: processedData,
      currentVisualization: result.visualization,
      selectedEndpoint: result.endpoint,
      processingStatus: {
        isProcessing: false,
        currentStep: null,
        progress: 100
      },
      errorState: null,
      lastAnalysisMetadata: result.metadata
    });
  }

  /**
   * Get current analysis state
   */
  getState(): AnalysisState {
    return this.stateManager.getState();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback: StateSubscriber): () => void {
    return this.stateManager.subscribe(callback);
  }

  /**
   * Update visualization settings
   */
  async updateVisualization(updates: Partial<VisualizationResult>): Promise<void> {
    const currentState = this.stateManager.getState();
    if (!currentState.currentAnalysis || !currentState.currentVisualization) {
      throw new Error('No current analysis to update visualization for');
    }

    const updatedVisualization: VisualizationResult = {
      ...currentState.currentVisualization,
      ...updates
    };

    this.stateManager.updateState({
      currentVisualization: updatedVisualization
    });

    this.emitEvent('visualization-created', { 
      visualization: updatedVisualization, 
      endpoint: currentState.selectedEndpoint 
    });
  }

  /**
   * Clear current analysis and reset state
   */
  clearAnalysis(): void {
    // Clear cached datasets to prevent memory leaks
    const cacheStatus = this.endpointRouter.getCacheStatus();
    console.log('[AnalysisEngine] Clearing cache with status:', cacheStatus);
    this.endpointRouter.clearCache();
    
    // Clear visualization effects and resources
    this.visualizationRenderer.clearEffects();
    
    // Log memory usage if available (Chrome only)
    if ((performance as any).memory) {
      const used = Math.round((performance as any).memory.usedJSHeapSize / 1048576);
      const total = Math.round((performance as any).memory.totalJSHeapSize / 1048576);
      console.log(`[AnalysisEngine] Memory after cache clear: ${used}MB / ${total}MB`);
    }
    
    this.stateManager.updateState({
      currentAnalysis: null,
      currentVisualization: null,
      lastQuery: null,
      selectedEndpoint: undefined,
      processingStatus: {
        isProcessing: false,
        currentStep: null,
        progress: 0
      },
      errorState: null
    });
  }

  /**
   * Get available endpoints
   */
  getAvailableEndpoints() {
    return this.configManager.getEndpointConfigurations();
  }

  /**
   * Set preferred endpoint (overrides auto-selection)
   */
  setPreferredEndpoint(endpoint: string): void {
    this.stateManager.updateState({
      selectedEndpoint: endpoint
    });
    this.emitEvent('endpoint-changed', { endpoint });
  }

  /**
   * Get analysis history
   */
  getAnalysisHistory() {
    return this.stateManager.getState().history;
  }

  /**
   * Clear analysis history
   */
  clearHistory(): void {
    this.stateManager.updateState({
      history: []
    });
  }

  /**
   * Event system for external integrations
   */
  addEventListener(eventType: AnalysisEventType, callback: (event: AnalysisEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get clustering service instance
   */
  getClusteringService(): ClusteringService {
    return this.clusteringService;
  }

  /**
   * Set clustering configuration
   */
  setClusteringConfig(config: Partial<import('../clustering/types').ClusterConfig>): void {
    this.clusteringService.setConfig(config);
  }

  /**
   * Preview clustering for current analysis data
   */
  async previewClustering(config?: Partial<import('../clustering/types').ClusterConfig>): Promise<import('../clustering/types').ClusteringResult | null> {
    const currentState = this.getState();
    if (!currentState.currentAnalysis) {
      console.warn('[AnalysisEngine] No current analysis data for clustering preview');
      return null;
    }

    try {
      return await this.clusteringService.previewClustering(currentState.currentAnalysis, config, currentState.selectedEndpoint);
    } catch (error) {
      console.error('[AnalysisEngine] Clustering preview failed:', error);
      return null;
    }
  }

  /**
   * Access individual modules (for advanced usage)
   */
  get modules() {
    return {
      endpointRouter: this.endpointRouter,
      visualizationRenderer: this.visualizationRenderer,
      dataProcessor: this.dataProcessor,
      stateManager: this.stateManager,
      configManager: this.configManager,
      clusteringService: this.clusteringService
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeConfig(userConfig?: DeepPartial<AnalysisEngineConfig>): AnalysisEngineConfig {
    const defaultConfig: AnalysisEngineConfig = {
      apiUrl: process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_URL || 'https://shap-demographic-analytics-v3.onrender.com',
      apiKey: process.env.NEXT_PUBLIC_SHAP_MICROSERVICE_API_KEY || '',
      cacheEnabled: true,
      debugMode: process.env.NODE_ENV === 'development',
      enableCaching: true,
      maxConcurrentRequests: 5,
      defaultTimeout: 30000,
      retryAttempts: 3
    };

    return {
      ...defaultConfig,
      ...userConfig
    };
  }

  private updateProcessingStep(step: ProcessingStep, progress: number): void {
    this.stateManager.updateState({
      processingStatus: {
        isProcessing: true,
        currentStep: step,
        progress
      }
    });
  }

  private generateAnalysisId(): string {
    return `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private emitEvent(type: AnalysisEventType, payload: any): void {
    const event: AnalysisEvent = {
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error(`[AnalysisEngine] Error in event listener for ${type}:`, error);
      }
    });
  }

  /**
   * Incorporate competitive analysis data from visualization into the summary
   */
  private incorporateCompetitiveAnalysis(originalSummary: string, competitiveAnalysis: any): string {
    if (!competitiveAnalysis || (!competitiveAnalysis.topMarkets && !competitiveAnalysis.allMarkets)) {
      return originalSummary;
    }

    let enhancedSummary = originalSummary;

    // Add competitive advantage insights if available
    if (competitiveAnalysis.topMarkets && competitiveAnalysis.topMarkets.length > 0) {
      const topMarket = competitiveAnalysis.topMarkets[0];
      enhancedSummary += ` Competitive Analysis: ${topMarket.area_name} leads with ${topMarket.competitiveAdvantageScore.toFixed(1)}/10 competitive advantage score, driven by ${topMarket.nikeMarketShare.toFixed(1)}% Nike market share vs ${topMarket.adidasMarketShare.toFixed(1)}% Adidas.`;
      
      if (competitiveAnalysis.topMarkets.length > 1) {
        const secondMarket = competitiveAnalysis.topMarkets[1];
        enhancedSummary += ` ${secondMarket.area_name} follows with ${secondMarket.competitiveAdvantageScore.toFixed(1)}/10 advantage score.`;
      }
    }

    // Add market analysis summary
    if (competitiveAnalysis.allMarkets && competitiveAnalysis.allMarkets.length > 0) {
      const avgAdvantageScore = competitiveAnalysis.allMarkets.reduce((sum: number, market: any) => sum + market.competitiveAdvantageScore, 0) / competitiveAnalysis.allMarkets.length;
      const strongMarkets = competitiveAnalysis.allMarkets.filter((market: any) => market.competitiveAdvantageScore >= 6.0).length;
      
      enhancedSummary += ` Overall competitive position: ${avgAdvantageScore.toFixed(1)}/10 average advantage score across ${competitiveAnalysis.allMarkets.length} markets, with ${strongMarkets} markets showing strong competitive positioning (6.0+ score).`;
    }

    return enhancedSummary;
  }
} 