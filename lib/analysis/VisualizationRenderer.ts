/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ProcessedAnalysisData, VisualizationResult, VisualizationRendererStrategy, VisualizationType } from './types';
import { ConfigurationManager } from './ConfigurationManager';
import { getQuintileColorScheme, calculateEqualCountQuintiles } from './utils/QuintileUtils';

// Import specialized renderers
import { ChoroplethRenderer } from './strategies/renderers/ChoroplethRenderer';
import { ClusterRenderer } from './strategies/renderers/ClusterRenderer';
import { CompetitiveRenderer } from './strategies/renderers/CompetitiveRenderer';

// Import enhanced effects system
import { EffectsManager, EffectsManagerConfig } from './strategies/renderers/effects/EffectsManager';

// Import ArcGIS types
import type MapView from '@arcgis/core/views/MapView';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';

/**
 * Enhanced VisualizationRenderer - Creates dynamic visualizations using specialized renderers
 * 
 * Now uses the Strategy pattern with specialized renderers for each visualization type,
 * providing enhanced rendering capabilities tailored to specific analysis requirements.
 */
export class VisualizationRenderer {
  private configManager: ConfigurationManager;
  private renderers: Map<string, VisualizationRendererStrategy>;
  private effectsManager: EffectsManager | null = null;
  private mapView: MapView | null = null;

  constructor(configManager: ConfigurationManager) {
    this.configManager = configManager;
    this.renderers = new Map();
    this.initializeRenderers();
    this.initializeEffectsManager();
  }

  /**
   * Initialize the map view and effects system
   */
  async initializeMapView(mapView: MapView): Promise<void> {
    this.mapView = mapView;
    
    if (this.effectsManager) {
      try {
        await this.effectsManager.initialize(mapView);
        console.log('[VisualizationRenderer] Effects system initialized successfully');
      } catch (error) {
        console.error('[VisualizationRenderer] Failed to initialize effects system:', error);
      }
    }
  }

  /**
   * Initialize the effects management system
   */
  private initializeEffectsManager(): void {
    const effectsConfig: Partial<EffectsManagerConfig> = {
      enabled: true,
      performance: 'auto',
      fireflies: {
        enabled: true,
        intensity: 0.8,
        color: '#FFD700'
      },
      gradients: true,
      hover: {
        enabled: true,
        scale: 1.2,
        glow: {
          enabled: true,
          color: '#FFFFFF',
          size: 2,
          intensity: 0.8
        },
        ripple: {
          enabled: true,
          color: '#FFFFFF',
          maxRadius: 20,
          duration: 1000,
          opacity: 0.6
        }
      },
      ambient: {
        enabled: true,
        density: 0.4,
        opacity: 0.6
      },
      coordinateEffects: true
    };
    
    this.effectsManager = new EffectsManager(effectsConfig);
  }

  /**
   * Create visualization using appropriate specialized renderer
   */
  createVisualization(data: ProcessedAnalysisData, endpoint: string): VisualizationResult {
    try {
      console.log(`[VisualizationRenderer] Creating visualization for ${endpoint} with ${data.records.length} records`);
      console.log(`[VisualizationRenderer] Data type: ${data.type}, target variable: ${data.targetVariable}`);
      console.log(`[VisualizationRenderer] Is clustered data:`, data.isClustered);
      console.log(`[VisualizationRenderer] Sample record:`, data.records[0] ? {
        area_id: data.records[0].area_id,
        area_name: data.records[0].area_name,
        value: data.records[0].value,
        hasProperties: !!data.records[0].properties,
        propertyKeys: data.records[0].properties ? Object.keys(data.records[0].properties).slice(0, 5) : [],
        isCluster: data.records[0].properties?.is_cluster,
        clusterZipCodes: data.records[0].properties?.zip_codes?.length
      } : 'No records');
      
      // Get endpoint configuration
      const endpointConfig = this.configManager.getEndpointConfig(endpoint);
      if (!endpointConfig) {
        throw new Error(`No configuration found for endpoint: ${endpoint}`);
      }

      // Determine visualization type
      const visualizationType = this.determineVisualizationType(data, endpointConfig.defaultVisualization);
      
      // Get appropriate renderer
      const renderer = this.getRendererForType(visualizationType);
      
      // Create visualization configuration
      const visualizationConfig = this.createVisualizationConfig(data, endpointConfig, visualizationType);
      
      // Check for direct rendering (bypasses complex chain)
      // CRITICAL: Always skip direct rendering for clustered data to ensure ClusterRenderer is used
      // CRITICAL: Never use direct rendering for clustered data - always use cluster renderer
      if (data.renderer && data.legend && !data.isClustered) {
        console.log(`[VisualizationRenderer] 🎯 Using DIRECT RENDERING from processor`);
        const result = {
          type: visualizationType,
          config: visualizationConfig,
          renderer: data.renderer,
          popupTemplate: this.createMinimalPopupTemplate(),
          legend: data.legend,
          extent: data.extent || null,
          shouldZoom: data.shouldZoom || false
        };
        console.log(`[VisualizationRenderer] Direct renderer result:`, {
          type: result?.type,
          hasRenderer: !!result?.renderer,
          rendererType: result?.renderer?.type,
          hasPopupTemplate: !!result?.popupTemplate,
          hasLegend: !!result?.legend,
          legendItems: result?.legend?.items?.length
        });
        return result;
      }
      
      // For clustered data, always use the full rendering pipeline
      if (data.isClustered) {
        console.log(`[VisualizationRenderer] 🎯 Clustered data detected - using full rendering pipeline`);
        console.log(`[VisualizationRenderer] 🎯 Cluster details:`, {
          clusterCount: data.clusters?.length || 0,
          sampledClusterIds: data.records.slice(0, 3).map(r => ({ area: r.area_name, clusterId: r.cluster_id }))
        });
      }
      
      // Fallback to complex rendering chain
      console.log(`[VisualizationRenderer] About to call renderer.render() for type: ${visualizationType}`);
      const result = renderer.render(data, visualizationConfig);
      console.log(`[VisualizationRenderer] Renderer returned:`, {
        type: result?.type,
        hasRenderer: !!result?.renderer,
        rendererType: result?.renderer?.type,
        hasPopupTemplate: !!result?.popupTemplate,
        hasLegend: !!result?.legend
      });
      
      console.log(`[VisualizationRenderer] Successfully created ${visualizationType} visualization`);
      return result;
      
    } catch (error) {
      console.error(`[VisualizationRenderer] Error creating visualization for ${endpoint}:`, error);
      
      // Return fallback visualization
      return this.createFallbackVisualization(data, endpoint);
    }
  }

  /**
   * Apply effects to a layer after it's been added to the map
   * This should be called by the map integration code after layer creation
   */
  async applyVisualizationEffects(layer: FeatureLayer, visualizationResult: VisualizationResult): Promise<void> {
    if (!this.effectsManager || !this.mapView || !visualizationResult._pendingEffects) {
      return;
    }
    
    try {
      console.log('[VisualizationRenderer] Applying effects to layer:', layer.title);
      await this.effectsManager.applyEffectsToLayer(layer, visualizationResult);
      
      // Clear pending effects after application
      delete visualizationResult._pendingEffects;
      
    } catch (error) {
      console.error('[VisualizationRenderer] Error applying effects to layer:', error);
    }
  }

  /**
   * Clear all visual effects
   */
  clearEffects(): void {
    if (this.effectsManager) {
      this.effectsManager.clearEffects();
    }
  }

  /**
   * Update effects configuration
   */
  updateEffectsConfig(newConfig: Partial<EffectsManagerConfig>): void {
    if (this.effectsManager) {
      this.effectsManager.updateConfig(newConfig);
    }
  }

  /**
   * Get effects performance statistics
   */
  getEffectsStats(): any {
    return this.effectsManager?.getPerformanceStats() || null;
  }

  /**
   * Destroy effects manager and cleanup resources
   */
  destroy(): void {
    if (this.effectsManager) {
      this.effectsManager.destroy();
      this.effectsManager = null;
    }
    this.mapView = null;
  }

  /**
   * Get available visualization types
   */
  getAvailableVisualizationTypes(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * Check if a renderer exists for a visualization type
   */
  hasRendererForType(type: VisualizationType): boolean {
    return this.renderers.has(type) || this.renderers.has('default');
  }

  /**
   * Update visualization with new data or configuration
   */
  updateVisualization(
    currentVisualization: VisualizationResult, 
    newData: ProcessedAnalysisData, 
    endpoint: string
  ): VisualizationResult {
    try {
      // Use same visualization type as current
      const renderer = this.getRendererForType(currentVisualization.type);
      
      // Update configuration while preserving user customizations
      const updatedConfig = {
        ...currentVisualization.config,
        // Refresh data-dependent properties
        valueField: this.determineValueField(newData),
        labelField: this.determineLabelField(newData)
      };
      
      return renderer.render(newData, updatedConfig);
      
    } catch (error) {
      console.error(`[VisualizationRenderer] Error updating visualization:`, error);
      
      // Fall back to creating new visualization
      return this.createVisualization(newData, endpoint);
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeRenderers(): void {
    // Register specialized renderers
    this.renderers.set('choropleth', new ChoroplethRenderer());
    this.renderers.set('cluster', new ClusterRenderer());
    this.renderers.set('multi-symbol', new CompetitiveRenderer());
    this.renderers.set('competitive', new CompetitiveRenderer());
    
    // Register additional renderers for other visualization types
    // this.renderers.set('symbol', new SymbolRenderer());
    // this.renderers.set('heatmap', new HeatmapRenderer());
    // this.renderers.set('categorical', new CategoricalRenderer());
    // this.renderers.set('network', new NetworkRenderer());
    // this.renderers.set('bivariate', new BivariateRenderer());
    // this.renderers.set('graduated-symbols', new GraduatedSymbolRenderer());
    // this.renderers.set('risk-gradient', new RiskGradientRenderer());
    
    // Default renderer for unspecified types
    this.renderers.set('default', new DefaultVisualizationRenderer());
    
    console.log(`[VisualizationRenderer] Initialized ${this.renderers.size} specialized renderers`);
  }

  private determineVisualizationType(data: ProcessedAnalysisData, defaultType: VisualizationType): VisualizationType {
    // Use data characteristics to optimize visualization type selection
    
    // For clustered data (new approach: ZIP codes with cluster assignments), always use cluster renderer
    if (data.isClustered) {
      console.log('[VisualizationRenderer] 🎯 Using CLUSTER renderer for clustered data (ZIP codes with cluster assignments)');
      return 'cluster';
    }
    
    // For cluster analysis, always use cluster renderer (legacy spatial clustering)
    if (data.type === 'spatial_clustering' || data.clusterAnalysis) {
      console.log('[VisualizationRenderer] 🎯 Using CLUSTER renderer for spatial clustering');
      return 'cluster';
    }
    
    // For competitive analysis, use choropleth renderer (same as strategic analysis)
    if (data.type === 'competitive_analysis' || data.competitiveAnalysis) {
      console.log('[VisualizationRenderer] 🎯 Using CHOROPLETH renderer for competitive analysis (same as strategic)');
      return 'choropleth';
    }
    
    // For strategic analysis, use choropleth renderer
    if (data.type === 'strategic_analysis') {
      console.log('[VisualizationRenderer] 🎯 Using CHOROPLETH renderer for strategic analysis');
      return 'choropleth';
    }
    
    // For categorical data with few unique values, consider categorical renderer
    if (this.isCategoricalData(data)) {
      return 'categorical';
    }
    
    // For continuous numeric data, use choropleth by default
    if (this.isContinuousData(data)) {
      return 'choropleth';
    }
    
    // Fall back to configured default
    return defaultType;
  }

  private getRendererForType(type: VisualizationType): VisualizationRendererStrategy {
    console.log(`[VisualizationRenderer] 🎯 Getting renderer for type: ${type}`);
    
    // Try to get specific renderer for type
    const renderer = this.renderers.get(type);
    if (renderer && renderer.supportsType(type)) {
      console.log(`[VisualizationRenderer] ✅ Found specific renderer for ${type}:`, renderer.constructor.name);
      return renderer;
    }
    
    // Fall back to default renderer
    console.log(`[VisualizationRenderer] ⚠️ Using default renderer for ${type}`);
    return this.renderers.get('default')!;
  }

  private createVisualizationConfig(
    data: ProcessedAnalysisData, 
    endpointConfig: any, 
    visualizationType: VisualizationType
  ): any {
    // Get visualization-specific configuration
    const vizConfig = this.configManager.getVisualizationConfig(endpointConfig.id);
    
    // Detect geometry type from data records
    // For spatial clustering, check if we have cluster centroids (point data) or individual areas (polygon data)
    const hasClusterCentroids = data.records.some(r => r.properties?.is_cluster_centroid === true);
    const geometryType = data.type === 'spatial_clustering' && !hasClusterCentroids 
      ? 'polygon' 
      : this.detectGeometryType(data);
    
    return {
      // Base configuration
      colorScheme: this.determineColorScheme(data, visualizationType),
      opacity: 0.8,
      strokeWidth: 1,
      
      // Data field mappings
      valueField: this.determineValueField(data),
      labelField: this.determineLabelField(data),
      popupFields: this.determinePopupFields(data),
      
      // Classification settings
      classificationMethod: this.determineClassificationMethod(data, visualizationType),
      
      // Geometry information for renderer selection
      geometryType: geometryType,
      
      // Visualization-specific settings
      ...this.getTypeSpecificConfig(visualizationType),
      
      // Override with any configured settings
      ...vizConfig,
      
      // Performance optimizations
      maxRecords: vizConfig?.performance?.maxRecords || 10000
    };
  }

  private detectGeometryType(data: ProcessedAnalysisData): 'point' | 'polygon' | 'line' | 'unknown' {
    if (!data.records || data.records.length === 0) {
      return 'unknown';
    }
    
    // Check first few records for geometry type
    for (let i = 0; i < Math.min(5, data.records.length); i++) {
      const record = data.records[i];
      // Check in properties for geometry info, or infer from coordinates
      const geometry = record.properties?.geometry;
      if (geometry?.type) {
        switch (geometry.type.toLowerCase()) {
          case 'point':
          case 'multipoint':
            return 'point';
          case 'polygon':
          case 'multipolygon':
            return 'polygon';
          case 'linestring':
          case 'multilinestring':
            return 'line';
        }
      }
      
      // If no explicit geometry, infer from coordinates
      if (record.coordinates && Array.isArray(record.coordinates)) {
        // Simple coordinates array suggests point data
        return 'point';
      }
    }
    
    // Default to polygon for geographic analysis
    return 'polygon';
  }

  private determineColorScheme(data: ProcessedAnalysisData, type: VisualizationType): string {
    switch (type) {
      case 'cluster':
        return 'categorical';
      case 'multi-symbol':
      case 'competitive':
        return 'competitive';
      case 'risk-gradient':
        return 'red-to-green';
      case 'choropleth':
      default:
        return this.isPositiveMetric(data) ? 'green-to-red' : 'blue-to-red';
    }
  }

  private determineValueField(data: ProcessedAnalysisData): string {
    // For all analysis types that have a targetVariable, use it instead of 'value'
    // This ensures choropleth renderers use the correct field for all analysis types
    if (data.targetVariable) {
      console.log(`[VisualizationRenderer] Using targetVariable for ${data.type}: ${data.targetVariable}`);
      return data.targetVariable;
    }
    
    // Fallback to 'value' for legacy data or unspecified types
    return 'value';
  }

  private determineLabelField(data: ProcessedAnalysisData): string {
    // Primary label field is 'area_name'
    return 'area_name';
  }

  private determinePopupFields(data: ProcessedAnalysisData): string[] {
    const baseFields = ['area_name', 'value', 'rank', 'category'];
    
    if (data.records.length === 0) return baseFields;
    
    // Add important property fields
    const sampleRecord = data.records[0];
    const propertyKeys = Object.keys(sampleRecord.properties || {});
    
    const importantFields = propertyKeys
      .filter(key => 
        !key.includes('_raw') && 
        !key.includes('_internal') && 
        typeof sampleRecord.properties[key] !== 'object'
      )
      .slice(0, 5); // Limit to 5 additional fields
    
    return [...baseFields, ...importantFields];
  }

  private determineClassificationMethod(data: ProcessedAnalysisData, type: VisualizationType): string {
    // Use type-specific classification methods
    switch (type) {
      case 'cluster':
        return 'categorical';
      case 'multi-symbol':
        return 'graduated';
      case 'choropleth':
      default:
        return this.hasOutliers(data) ? 'quantile' : 'natural-breaks';
    }
  }

  private getTypeSpecificConfig(type: VisualizationType): any {
    const configs: Record<string, any> = {
      'choropleth': {
        symbolSize: undefined
      },
      'cluster': {
        symbolSize: 12,
        strokeWidth: 1.5
      },
      'multi-symbol': {
        symbolSize: 16,
        strokeWidth: 1
      },
      'competitive': {
        symbolSize: 16,
        strokeWidth: 1
      },
      'symbol': {
        symbolSize: 10
      },
      'heatmap': {
        opacity: 0.6,
        blurRadius: 15
      },
      'categorical': {
        strokeWidth: 1
      },
      'network': {
        nodeSize: 8,
        linkWidth: 2
      },
      'bivariate': {
        opacity: 0.7
      },
      'graduated-symbols': {
        symbolSize: 14
      },
      'risk-gradient': {
        opacity: 0.8,
        strokeWidth: 0.5
      }
    };
    
    return configs[type] || {};
  }

  private createFallbackVisualization(data: ProcessedAnalysisData, endpoint: string): VisualizationResult {
    // Create minimal valid visualization when specialized rendering fails
    const defaultRenderer = this.renderers.get('default')!;
    
    const fallbackConfig: any = {
      colorScheme: 'blue-to-red',
      opacity: 0.7,
      strokeWidth: 1,
      valueField: 'value',
      labelField: 'area_name',
      popupFields: ['area_name', 'value'],
      classificationMethod: 'equal-interval' as const
    };
    
    try {
      return defaultRenderer.render(data, fallbackConfig);
    } catch (error) {
      console.error(`[VisualizationRenderer] Fallback rendering also failed:`, error);
      
      // Return absolute minimal visualization
      return {
        type: 'choropleth',
        config: fallbackConfig,
        renderer: this.createMinimalRenderer(),
        popupTemplate: this.createMinimalPopupTemplate(),
        legend: this.createMinimalLegend(data)
      };
    }
  }

  private createMinimalRenderer(): any {
    return {
      type: 'simple',
      symbol: {
        type: 'simple-fill',
        color: [100, 150, 200, 0.5],
        outline: {
          color: '#FFFFFF',
          width: 1
        }
      }
    };
  }

  private createMinimalPopupTemplate(): any {
    return {
      title: '{area_name}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            { fieldName: 'area_name', label: 'Area' },
            { fieldName: 'value', label: 'Value' }
          ]
        }
      ]
    };
  }

  private createMinimalLegend(data: ProcessedAnalysisData): any {
    return {
      title: data.targetVariable || 'Analysis Result',
      items: [
        {
          label: 'Data',
          color: 'rgb(100, 150, 200)',
          value: 1
        }
      ],
      position: 'bottom-right'
    };
  }

  // ============================================================================
  // DATA ANALYSIS UTILITIES
  // ============================================================================

  private isCategoricalData(data: ProcessedAnalysisData): boolean {
    if (data.records.length === 0) return false;
    
    const uniqueValues = new Set(data.records.map(r => r.value));
    return uniqueValues.size <= 10 && data.records.length > uniqueValues.size * 3;
  }

  private isContinuousData(data: ProcessedAnalysisData): boolean {
    if (data.records.length === 0) return false;
    
    const values = data.records.map(r => r.value).filter(v => typeof v === 'number' && !isNaN(v));
    const uniqueValues = new Set(values);
    
    return uniqueValues.size > 10 || uniqueValues.size === values.length;
  }

  private hasOutliers(data: ProcessedAnalysisData): boolean {
    const values = data.records.map(r => r.value).filter(v => typeof v === 'number' && !isNaN(v));
    
    if (values.length < 4) return false;
    
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return values.some(v => v < lowerBound || v > upperBound);
  }

  private isPositiveMetric(data: ProcessedAnalysisData): boolean {
    // Determine if higher values are "better" based on target variable name
    const targetVar = data.targetVariable?.toLowerCase() || '';
    
    const positiveIndicators = [
      'performance', 'score', 'rating', 'quality', 'satisfaction',
      'success', 'efficiency', 'productivity', 'growth'
    ];
    
    const negativeIndicators = [
      'risk', 'error', 'failure', 'cost', 'problem', 'issue'
    ];
    
    const hasPositive = positiveIndicators.some(indicator => targetVar.includes(indicator));
    const hasNegative = negativeIndicators.some(indicator => targetVar.includes(indicator));
    
    return hasPositive && !hasNegative;
  }
}


/**
 * Default visualization renderer - handles basic rendering when no specialized renderer is available
 * Now uses proper quintile classification with equal feature distribution
 */
class DefaultVisualizationRenderer implements VisualizationRendererStrategy {
  supportsType(type: VisualizationType): boolean {
    return true; // Supports all types as fallback
  }

  render(data: ProcessedAnalysisData, config: any): VisualizationResult {
    console.log('[DefaultVisualizationRenderer] Using quintile-based rendering for bivariate endpoints');
    
    // Create quintile-based choropleth-style visualization
    const values = data.records.map(r => r.value).filter(v => !isNaN(v));
    
    if (values.length === 0) {
      throw new Error('No valid numeric data available for visualization');
    }

    // Calculate proper quintiles with equal feature distribution
    const quintileResult = calculateEqualCountQuintiles(values);
    const quintileBreaks = quintileResult.quintiles;
    
    const classBreakInfos = [];
    const colors = getQuintileColorScheme(); // Use standardized quintile colors
    
    // Create class breaks using quintile boundaries
    for (let i = 0; i < quintileBreaks.length - 1; i++) {
      const minValue = i === 0 ? Math.min(...values) : quintileBreaks[i];
      const maxValue = quintileBreaks[i + 1];
      
      classBreakInfos.push({
        minValue,
        maxValue,
        symbol: {
          type: 'simple-fill',
          color: colors[i],
          outline: {
            color: '#FFFFFF',
            width: config.strokeWidth || 0.5
          }
        },
        label: `${minValue.toFixed(1)} - ${maxValue.toFixed(1)}`
      });
    }

    const renderer = {
      type: 'class-breaks',
      field: config.valueField || 'value',
      classBreakInfos,
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.3],
        outline: {
          color: '#CCCCCC',
          width: 0.5
        }
      }
    };

    const popupTemplate = {
      title: '{' + (config.labelField || 'area_name') + '}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            { fieldName: config.labelField || 'area_name', label: 'Area' },
            { fieldName: config.valueField || 'value', label: 'Value' }
          ]
        }
      ]
    };

    const legend = {
      title: data.targetVariable || 'Analysis Result',
      items: classBreakInfos.map(item => ({
        label: item.label,
        color: item.symbol.color,
        value: item.minValue
      })),
      position: 'bottom-right'
    };

    return {
      type: 'choropleth',
      config,
      renderer,
      popupTemplate,
      legend
    };
  }

  // ============================================================================
  // EFFECTS INTEGRATION METHODS
  // ============================================================================

  /**
   * Check if effects should be applied to this visualization
   */
  private shouldApplyEffects(result: VisualizationResult): boolean {
    if (!result.renderer || typeof result.renderer !== 'object') {
      return false;
    }
    
    // Check for effect flags in renderer
    const renderer = result.renderer as any;
    return !!(renderer._fireflyMode || renderer._visualEffects || renderer._dualVariable || result._enhancedEffects);
  }

  /**
   * Extract effect flags from renderer for later processing
   */
  private extractRendererFlags(renderer: any): any {
    if (!renderer || typeof renderer !== 'object') {
      return {};
    }
    
    return {
      fireflyMode: renderer._fireflyMode || false,
      visualEffects: renderer._visualEffects || {},
      dualVariable: renderer._dualVariable || false,
      useCentroids: renderer._useCentroids || false,
      enhancedEffects: renderer._enhancedEffects || {}
    };
  }

} 