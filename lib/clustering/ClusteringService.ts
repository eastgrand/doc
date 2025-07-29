/**
 * Clustering Service
 * 
 * Integrates clustering functionality with the existing AnalysisEngine pipeline.
 * Provides analysis-driven territory clustering for campaign planning.
 */

import { 
  ClusterConfig, 
  ClusteringResult, 
  ClusteringError, 
  CLUSTERING_ERROR_CODES,
  DEFAULT_CLUSTER_CONFIG 
} from './types';
import { GeographicKMeans } from './algorithms/geographic-kmeans';
import { extractClusteringFeatures, AnalysisData } from './utils/feature-extraction';
import { validateClusters } from './utils/cluster-validation';
import { ProcessedAnalysisData, AnalysisResult } from '../analysis/types';

/**
 * Main clustering service that connects to AnalysisEngine
 */
export class ClusteringService {
  private static instance: ClusteringService | null = null;
  private currentConfig: ClusterConfig = DEFAULT_CLUSTER_CONFIG;
  
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ClusteringService {
    if (!ClusteringService.instance) {
      ClusteringService.instance = new ClusteringService();
    }
    return ClusteringService.instance;
  }

  /**
   * Set clustering configuration
   */
  public setConfig(config: Partial<ClusterConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ClusterConfig {
    return { ...this.currentConfig };
  }

  /**
   * Check if clustering is enabled
   */
  public isEnabled(): boolean {
    return this.currentConfig.enabled;
  }

  /**
   * Apply clustering to analysis results
   */
  public async applyClusteringToAnalysis(
    analysisResult: AnalysisResult,
    config?: Partial<ClusterConfig>
  ): Promise<AnalysisResult> {
    
    const clusterConfig = config ? { ...this.currentConfig, ...config } : this.currentConfig;
    
    // Skip clustering if disabled
    if (!clusterConfig.enabled) {
      return analysisResult;
    }

    try {
      console.log('[ClusteringService] Applying clustering to analysis result');
      
      // Convert AnalysisResult to clustering format
      const analysisData = this.convertAnalysisToClusteringData(analysisResult.data);
      
      // Extract features for clustering
      const features = extractClusteringFeatures(analysisData, clusterConfig.method);
      
      if (features.length === 0) {
        console.warn('[ClusteringService] No valid features for clustering, returning original result');
        return analysisResult;
      }
      
      // Execute clustering
      const clusteringResult = await this.executeClusteringAlgorithm(features, clusterConfig);
      
      if (!clusteringResult.success || clusteringResult.clusters.length === 0) {
        console.warn('[ClusteringService] Clustering failed or produced no valid clusters');
        return analysisResult;
      }
      
      // Enhance analysis result with clustering data
      const enhancedResult = this.enhanceAnalysisWithClusters(analysisResult, clusteringResult);
      
      console.log('[ClusteringService] Successfully applied clustering:', {
        originalZipCodes: analysisResult.data.records?.length || 0,
        clustersCreated: clusteringResult.clusters.length,
        clusteredZipCodes: clusteringResult.clusteredZipCodes,
        unclusteredZipCodes: clusteringResult.unclustered.length
      });
      
      return enhancedResult;
      
    } catch (error) {
      console.error('[ClusteringService] Error applying clustering:', error);
      
      // Return original result on error to prevent breaking the analysis
      return analysisResult;
    }
  }

  /**
   * Preview clustering without modifying analysis result
   */
  public async previewClustering(
    analysisData: ProcessedAnalysisData,
    config?: Partial<ClusterConfig>
  ): Promise<ClusteringResult> {
    
    const clusterConfig = config ? { ...this.currentConfig, ...config } : this.currentConfig;
    
    if (!clusterConfig.enabled) {
      throw new ClusteringError(
        'Clustering is disabled',
        CLUSTERING_ERROR_CODES.INVALID_PARAMETERS
      );
    }

    try {
      // Convert to clustering format
      const clusteringData = this.convertAnalysisToClusteringData(analysisData);
      
      // Extract features
      const features = extractClusteringFeatures(clusteringData, clusterConfig.method);
      
      if (features.length === 0) {
        throw new ClusteringError(
          'No valid features found for clustering',
          CLUSTERING_ERROR_CODES.INSUFFICIENT_DATA
        );
      }
      
      // Execute clustering
      return await this.executeClusteringAlgorithm(features, clusterConfig);
      
    } catch (error) {
      if (error instanceof ClusteringError) {
        throw error;
      }
      
      throw new ClusteringError(
        `Clustering preview failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        CLUSTERING_ERROR_CODES.FEATURE_EXTRACTION_FAILED,
        { originalError: error }
      );
    }
  }

  /**
   * Get dataset information for configuration validation
   */
  public getDatasetInfo(analysisData: ProcessedAnalysisData): {
    totalZipCodes: number;
    totalPopulation: number;
    geographicSpread: { minDistance: number; maxDistance: number };
  } {
    const records = analysisData.records || [];
    
    if (records.length === 0) {
      return {
        totalZipCodes: 0,
        totalPopulation: 0,
        geographicSpread: { minDistance: 0, maxDistance: 0 }
      };
    }

    // Calculate total population
    const totalPopulation = records.reduce((sum, record) => {
      const population = this.extractPopulation(record.properties || {});
      return sum + population;
    }, 0);

    // Calculate geographic spread (simplified - would need actual lat/lng for real calculation)
    const geographicSpread = {
      minDistance: 0, // Would calculate minimum distance between zip codes
      maxDistance: 100 // Would calculate maximum distance between zip codes
    };

    return {
      totalZipCodes: records.length,
      totalPopulation,
      geographicSpread
    };
  }

  /**
   * Convert ProcessedAnalysisData to clustering AnalysisData format
   */
  private convertAnalysisToClusteringData(data: ProcessedAnalysisData): AnalysisData {
    const features = (data.records || []).map(record => ({
      properties: {
        // Include all original properties
        ...record.properties,
        
        // Add standardized fields for clustering
        geo_id: record.properties?.geo_id || record.properties?.zip_code || record.area_name,
        zip_code: record.properties?.zip_code || record.properties?.geo_id || record.area_name,
        
        // Add analysis-specific scores
        strategic_value_score: record.value || record.properties?.strategic_value_score || 0,
        demographic_opportunity_score: record.properties?.demographic_opportunity_score || record.value || 0,
        competitive_advantage_score: record.properties?.competitive_advantage_score || record.value || 0,
        
        // Nike/Adidas market shares for competitive analysis
        nike_market_share: record.properties?.nike_market_share || record.properties?.mp30034a_b_p || record.properties?.value_mp30034a_b_p || 0,
        adidas_market_share: record.properties?.adidas_market_share || record.properties?.mp30029a_b_p || record.properties?.value_mp30029a_b_p || 0,
        
        // Demographics
        total_population: record.properties?.total_population || record.properties?.totpop_cy || record.properties?.value_totpop_cy || 1000,
        median_income: record.properties?.median_income || record.properties?.avghinc_cy || record.properties?.value_avghinc_cy || 50000,
        median_age: record.properties?.median_age || record.properties?.medage_cy || record.properties?.value_medage_cy || 35
      },
      geometry: {
        // Try to extract coordinates from various possible locations
        centroid: this.extractCentroid(record),
        coordinates: record.geometry?.coordinates || record.geometry?.centroid
      }
    }));

    return {
      type: data.type || 'analysis',
      features
    };
  }

  /**
   * Extract centroid coordinates from record
   */
  private extractCentroid(record: any): [number, number] | undefined {
    // Try geometry centroid first
    if (record.geometry?.centroid && Array.isArray(record.geometry.centroid)) {
      return [record.geometry.centroid[0], record.geometry.centroid[1]]; // [lng, lat]
    }
    
    // Try geometry coordinates
    if (record.geometry?.coordinates && Array.isArray(record.geometry.coordinates)) {
      return [record.geometry.coordinates[0], record.geometry.coordinates[1]]; // [lng, lat]
    }
    
    // Try properties
    if (record.properties?.longitude && record.properties?.latitude) {
      return [Number(record.properties.longitude), Number(record.properties.latitude)];
    }
    
    if (record.properties?.lng && record.properties?.lat) {
      return [Number(record.properties.lng), Number(record.properties.lat)];
    }
    
    // Default coordinates (center of US) if nothing found
    return [-98.5795, 39.8283]; // [lng, lat]
  }

  /**
   * Extract population from properties with fallbacks
   */
  private extractPopulation(properties: Record<string, any>): number {
    const populationFields = [
      'total_population',
      'population',
      'totpop_cy',
      'value_totpop_cy',
      'TOTPOP_CY'
    ];
    
    for (const field of populationFields) {
      const value = Number(properties[field]);
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
    
    return 1000; // Default population
  }

  /**
   * Execute the clustering algorithm
   */
  private async executeClusteringAlgorithm(
    features: any[],
    config: ClusterConfig
  ): Promise<ClusteringResult> {
    
    const algorithm = new GeographicKMeans(config);
    
    try {
      const result = await algorithm.cluster(features);
      return result;
      
    } catch (error) {
      if (error instanceof ClusteringError) {
        throw error;
      }
      
      throw new ClusteringError(
        `Clustering algorithm failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        CLUSTERING_ERROR_CODES.FEATURE_EXTRACTION_FAILED,
        { originalError: error, config }
      );
    }
  }

  /**
   * Enhance analysis result with clustering data
   */
  private enhanceAnalysisWithClusters(
    originalResult: AnalysisResult,
    clusteringResult: ClusteringResult
  ): AnalysisResult {
    
    // Add clustering metadata to the analysis result
    const enhancedMetadata = {
      ...originalResult.metadata,
      clustering: {
        enabled: true,
        algorithm: clusteringResult.algorithm,
        totalClusters: clusteringResult.clusters.length,
        validClusters: clusteringResult.validClusters,
        clusteredZipCodes: clusteringResult.clusteredZipCodes,
        unclustered: clusteringResult.unclustered.length,
        processingTime: clusteringResult.processingTimeMs,
        parameters: clusteringResult.parameters
      }
    };

    // Add cluster assignments to records
    const enhancedRecords = (originalResult.data.records || []).map(record => {
      // Find which cluster this zip code belongs to
      const zipCode = record.properties?.geo_id || record.properties?.zip_code || record.area_name;
      const cluster = clusteringResult.clusters.find(c => c.zipCodes.includes(zipCode));
      
      return {
        ...record,
        cluster: cluster ? {
          clusterId: cluster.clusterId,
          clusterName: cluster.name,
          isValid: cluster.isValid
        } : null
      };
    });

    // Enhanced data with clustering information
    const enhancedData = {
      ...originalResult.data,
      records: enhancedRecords,
      clusters: clusteringResult.clusters,
      clusteringSummary: this.generateClusteringSummary(clusteringResult)
    };

    // Enhanced visualization (would need to be updated to show clusters)
    const enhancedVisualization = {
      ...originalResult.visualization,
      clustering: {
        enabled: true,
        clusters: clusteringResult.clusters.map(cluster => ({
          id: cluster.clusterId,
          name: cluster.name,
          centroid: cluster.centroid,
          boundary: cluster.boundary,
          zipCodes: cluster.zipCodes,
          isValid: cluster.isValid
        }))
      }
    };

    return {
      ...originalResult,
      data: enhancedData,
      visualization: enhancedVisualization,
      metadata: enhancedMetadata
    };
  }

  /**
   * Generate clustering summary for display
   */
  private generateClusteringSummary(result: ClusteringResult): string {
    if (!result.success || result.clusters.length === 0) {
      return 'Clustering could not be applied to this analysis.';
    }

    const validClusters = result.clusters.filter(c => c.isValid);
    const totalPopulation = validClusters.reduce((sum, c) => sum + c.totalPopulation, 0);
    const avgPopulation = validClusters.length > 0 ? totalPopulation / validClusters.length : 0;
    const avgZipCodes = validClusters.length > 0 ? 
      validClusters.reduce((sum, c) => sum + c.zipCodes.length, 0) / validClusters.length : 0;

    let summary = `Created ${validClusters.length} campaign territories from ${result.totalZipCodes} zip codes. `;
    summary += `Average territory size: ${Math.round(avgZipCodes)} zip codes, ${Math.round(avgPopulation).toLocaleString()} population. `;
    
    if (result.unclustered.length > 0) {
      summary += `${result.unclustered.length} zip codes could not be clustered due to size or distance constraints.`;
    }

    return summary;
  }
}