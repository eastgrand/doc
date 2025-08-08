/* eslint-disable @typescript-eslint/no-unused-vars */
// UnifiedAnalysisWrapper.tsx
// A wrapper around the existing AnalysisEngine that adds unified workflow capabilities
// without breaking existing functionality

import { AnalysisEngine } from '@/lib/analysis/AnalysisEngine';
import { 
  AnalysisOptions, 
  AnalysisResult,
  ProcessedAnalysisData,
  VisualizationResult 
} from '@/lib/analysis/types';

export interface UnifiedAnalysisRequest {
  // Area selection from UnifiedAreaSelector
  geometry?: __esri.Geometry;
  geometryMethod?: 'draw' | 'search' | 'service-area';
  
  // Analysis type selection
  analysisType: 'query' | 'infographic' | 'comprehensive';
  
  // Query-specific options
  query?: string;
  endpoint?: string;
  
  // Infographic-specific options
  infographicType?: 'strategic' | 'competitive' | 'demographic';
  
  // Common options
  exportFormat?: 'pdf' | 'csv' | 'json';
  includeChat?: boolean;
}

export interface UnifiedAnalysisResponse {
  // Original analysis result
  analysisResult: AnalysisResult;
  
  // Additional unified workflow metadata
  metadata: {
    geometry?: __esri.Geometry;
    analysisType: string;
    timestamp: Date;
    processingTime: number;
  };
  
  // Export options
  exportOptions: {
    formats: string[];
    exportReady: boolean;
  };
}

/**
 * UnifiedAnalysisWrapper
 * Wraps the existing AnalysisEngine to provide unified workflow capabilities
 * while maintaining backward compatibility
 */
export class UnifiedAnalysisWrapper {
  private analysisEngine: AnalysisEngine;
  private currentRequest: UnifiedAnalysisRequest | null = null;
  
  constructor() {
    // Use existing singleton AnalysisEngine
    this.analysisEngine = AnalysisEngine.getInstance();
  }
  
  /**
   * Process a unified analysis request
   * Routes to appropriate analysis method based on request type
   */
  async processUnifiedRequest(request: UnifiedAnalysisRequest): Promise<UnifiedAnalysisResponse> {
    const startTime = Date.now();
    this.currentRequest = request;
    
    console.log('[UnifiedAnalysisWrapper] Processing request:', {
      analysisType: request.analysisType,
      hasGeometry: !!request.geometry,
      query: request.query?.substring(0, 50)
    });
    
    let analysisResult: AnalysisResult;
    
    try {
      // Route based on analysis type
      switch (request.analysisType) {
        case 'query':
          analysisResult = await this.processQueryAnalysis(request);
          break;
          
        case 'infographic':
          analysisResult = await this.processInfographicAnalysis(request);
          break;
          
        case 'comprehensive':
          analysisResult = await this.processComprehensiveAnalysis(request);
          break;
          
        default:
          throw new Error(`Unknown analysis type: ${request.analysisType}`);
      }
      
      // Prepare unified response
      const response: UnifiedAnalysisResponse = {
        analysisResult,
        metadata: {
          geometry: request.geometry,
          analysisType: request.analysisType,
          timestamp: new Date(),
          processingTime: Date.now() - startTime
        },
        exportOptions: {
          formats: this.getAvailableExportFormats(analysisResult),
          exportReady: true
        }
      };
      
      console.log('[UnifiedAnalysisWrapper] Request completed:', {
        processingTime: response.metadata.processingTime,
        hasResults: !!analysisResult.data
      });
      
      return response;
      
    } catch (error) {
      console.error('[UnifiedAnalysisWrapper] Error processing request:', error);
      throw error;
    }
  }
  
  /**
   * Process query-based analysis
   * Uses existing AnalysisEngine.analyze method
   */
  private async processQueryAnalysis(request: UnifiedAnalysisRequest): Promise<AnalysisResult> {
    if (!request.query) {
      throw new Error('Query is required for query analysis');
    }
    
    const options: AnalysisOptions = {
      query: request.query,
      endpoint: request.endpoint,
      spatialFilter: request.geometry ? {
        geometry: request.geometry,
        spatialRelationship: 'intersects'
      } : undefined,
      includeVisualization: true,
      includeInsights: true
    };
    
    return await this.analysisEngine.analyze(options);
  }
  
  /**
   * Process infographic-based analysis
   * Focuses on score-based visualizations
   */
  private async processInfographicAnalysis(request: UnifiedAnalysisRequest): Promise<AnalysisResult> {
    // Determine endpoint based on infographic type
    const endpointMap = {
      'strategic': 'strategic-analysis',
      'competitive': 'competitive-analysis',
      'demographic': 'demographic-insights'
    };
    
    const endpoint = request.infographicType 
      ? endpointMap[request.infographicType] 
      : 'strategic-analysis';
    
    const options: AnalysisOptions = {
      query: `Generate ${request.infographicType || 'strategic'} analysis`,
      endpoint,
      spatialFilter: request.geometry ? {
        geometry: request.geometry,
        spatialRelationship: 'intersects'
      } : undefined,
      includeVisualization: true,
      includeInsights: true,
      visualizationType: 'scorecard' // Focus on scorecard visualization for infographics
    };
    
    return await this.analysisEngine.analyze(options);
  }
  
  /**
   * Process comprehensive analysis
   * Runs multiple endpoints and combines results
   */
  private async processComprehensiveAnalysis(request: UnifiedAnalysisRequest): Promise<AnalysisResult> {
    // Use multi-endpoint capabilities of AnalysisEngine
    const options: AnalysisOptions = {
      query: request.query || 'Comprehensive area analysis',
      endpoint: 'multi', // Triggers multi-endpoint analysis
      spatialFilter: request.geometry ? {
        geometry: request.geometry,
        spatialRelationship: 'intersects'
      } : undefined,
      includeVisualization: true,
      includeInsights: true,
      includeAllEndpoints: true
    };
    
    return await this.analysisEngine.analyze(options);
  }
  
  /**
   * Get available export formats based on analysis result
   */
  private getAvailableExportFormats(result: AnalysisResult): string[] {
    const formats = ['json']; // Always available
    
    if (result.visualization) {
      formats.push('pdf', 'png');
    }
    
    if (result.data?.features?.length > 0) {
      formats.push('csv', 'geojson');
    }
    
    return formats;
  }
  
  /**
   * Export analysis results in specified format
   */
  async exportResults(format: string): Promise<Blob> {
    if (!this.currentRequest) {
      throw new Error('No analysis results to export');
    }
    
    // Implementation would handle different export formats
    // This is a placeholder
    const data = JSON.stringify(this.currentRequest);
    return new Blob([data], { type: 'application/json' });
  }
  
  /**
   * Get current analysis state
   */
  getCurrentState() {
    return this.analysisEngine.getState();
  }
  
  /**
   * Subscribe to analysis state changes
   */
  subscribe(callback: (state: any) => void) {
    return this.analysisEngine.subscribe(callback);
  }
}