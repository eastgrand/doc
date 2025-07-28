/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { EndpointConfiguration, VisualizationType, AnalysisEngineConfig } from './types';
import { RankingDetector, RankingRequest } from './utils/RankingDetector';

/**
 * Enhanced ConfigurationManager - Advanced configuration management (Singleton)
 * 
 * Provides centralized configuration management for all 16 endpoints
 * with validation, caching, hot-reloading, and environment-specific configs.
 * 
 * Singleton pattern prevents multiple instances and redundant configuration loading.
 */
export class ConfigurationManager {
  private static instance: ConfigurationManager | null = null;
  
  private endpointConfigs: Map<string, EndpointConfiguration> = new Map();
  private visualizationConfigs: Map<string, VisualizationConfiguration> = new Map();
  private environmentConfigs: Map<string, any> = new Map();
  private configCache: Map<string, any> = new Map();
  private initialized: boolean = false;
  private lastLoadTime: number = 0;
  private configValidators: Map<string, ConfigValidator> = new Map();

  private constructor() {
    this.initializeValidators();
  }

  /**
   * Get the singleton instance of ConfigurationManager
   * Ensures only one instance exists and configurations are loaded once
   */
  public static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      console.log('[ConfigurationManager] Creating singleton instance...');
      ConfigurationManager.instance = new ConfigurationManager();
      ConfigurationManager.instance.loadConfiguration();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes only)
   */
  public static resetInstance(): void {
    ConfigurationManager.instance = null;
  }

  /**
   * Load all configurations with validation (singleton ensures this runs only once)
   */
  loadConfiguration(): void {
    if (this.initialized) {
      console.log('[ConfigurationManager] Configurations already loaded, skipping...');
      return;
    }
    
    try {
      console.log('[ConfigurationManager] Loading configurations...');
      
      this.loadEndpointConfigurations();
      this.loadVisualizationConfigurations();
      this.loadEnvironmentConfigurations();
      this.validateAllConfigurations();
      
      this.initialized = true;
      this.lastLoadTime = Date.now();
      
      console.log(`[ConfigurationManager] ✅ Singleton loaded configurations for ${this.endpointConfigs.size} endpoints`);
    } catch (error) {
      console.error('[ConfigurationManager] Failed to load configurations:', error);
      throw new Error(`Configuration loading failed: ${error}`);
    }
  }

  /**
   * Get endpoint configuration by ID with validation
   */
  getEndpointConfig(endpointId: string): EndpointConfiguration | null {
    const config = this.endpointConfigs.get(endpointId);
    
    if (!config) {
      console.warn(`[ConfigurationManager] No configuration found for endpoint: ${endpointId}`);
      return null;
    }
    
    // Validate configuration before returning
    if (!this.validateEndpointConfig(config)) {
      console.error(`[ConfigurationManager] Invalid configuration for endpoint: ${endpointId}`);
      return null;
    }
    
    return config;
  }

  /**
   * Get all endpoint configurations
   */
  getEndpointConfigurations(): EndpointConfiguration[] {
    return Array.from(this.endpointConfigs.values())
      .filter(config => this.validateEndpointConfig(config));
  }

  /**
   * Get endpoints by category with caching
   */
  getEndpointsByCategory(category: string): EndpointConfiguration[] {
    const cacheKey = `category_${category}`;
    
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }
    
    const endpoints = this.getEndpointConfigurations()
      .filter(config => config.category === category);
    
    this.configCache.set(cacheKey, endpoints);
    return endpoints;
  }

  /**
   * Get visualization configuration for an endpoint
   */
  getVisualizationConfig(endpointId: string): VisualizationConfiguration | null {
    const endpointConfig = this.getEndpointConfig(endpointId);
    if (!endpointConfig) return null;
    
    return this.visualizationConfigs.get(endpointConfig.defaultVisualization) || null;
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig(key: string): any {
    return this.environmentConfigs.get(key);
  }

  /**
   * Update endpoint configuration (for dynamic updates)
   */
  updateEndpointConfig(endpointId: string, updates: Partial<EndpointConfiguration>): boolean {
    const existing = this.endpointConfigs.get(endpointId);
    if (!existing) {
      console.error(`[ConfigurationManager] Cannot update non-existent endpoint: ${endpointId}`);
      return false;
    }
    
    const updated = { ...existing, ...updates };
    
    if (!this.validateEndpointConfig(updated)) {
      console.error(`[ConfigurationManager] Updated configuration is invalid for: ${endpointId}`);
      return false;
    }
    
    this.endpointConfigs.set(endpointId, updated);
    this.clearCache(); // Clear cache after update
    
    console.log(`[ConfigurationManager] Updated configuration for: ${endpointId}`);
    return true;
  }

  /**
   * Get score configuration for an endpoint
   */
  getScoreConfig(endpointId: string): { targetVariable: string; scoreFieldName: string } | null {
    const config = this.getEndpointConfig(endpointId);
    if (!config || !config.targetVariable || !config.scoreFieldName) {
      console.warn(`[ConfigurationManager] No score configuration found for endpoint: ${endpointId}`);
      return null;
    }
    
    return {
      targetVariable: config.targetVariable,
      scoreFieldName: config.scoreFieldName
    };
  }

  /**
   * Get configuration health status
   */
  getConfigurationHealth(): ConfigurationHealth {
    const totalEndpoints = this.endpointConfigs.size;
    const validEndpoints = this.getEndpointConfigurations().length;
    const invalidEndpoints = totalEndpoints - validEndpoints;
    
    return {
      totalEndpoints,
      validEndpoints,
      invalidEndpoints,
      isHealthy: invalidEndpoints === 0,
      lastLoadTime: this.lastLoadTime,
      cacheSize: this.configCache.size,
      issues: this.getConfigurationIssues()
    };
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeValidators(): void {
    // Register validators for different configuration types
    this.configValidators.set('endpoint', new EndpointConfigValidator());
    this.configValidators.set('visualization', new VisualizationConfigValidator());
    this.configValidators.set('environment', new EnvironmentConfigValidator());
  }

  private loadEndpointConfigurations(): void {
    // Enhanced endpoint configurations with additional metadata
    const configs: EndpointConfiguration[] = [
      {
        id: '/analyze',
        name: 'General Analysis',
        description: 'Comprehensive analysis with rankings and insights',
        category: 'core',
        url: '/analyze',
        defaultVisualization: 'choropleth',
        payloadTemplate: {
          target_variable: '',
          sample_size: 5000,
          analysis_depth: 'standard'
        },
        responseProcessor: 'CoreAnalysisProcessor',
        keywords: ['analyze', 'general', 'overview', 'summary', 'insights'],
        targetVariable: 'opportunity_score',
        scoreFieldName: 'opportunity_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'analysis_depth'],
        expectedResponseTime: 15000, // 15 seconds
        cacheable: true,
        rateLimit: { requests: 100, window: 3600000 }, // 100 requests per hour
        validationRules: {
          maxSampleSize: 10000,
          minSampleSize: 100
        },
        mockResponses: false
      },
      {
        id: '/strategic-analysis',
        name: 'Strategic Market Analysis',
        description: 'Strategic market analysis with comprehensive strategic value scoring for brand expansion',
        category: 'strategic',
        url: '/strategic-analysis',
        defaultVisualization: 'choropleth',
        payloadTemplate: {
          target_variable: 'MP30034A_B_P',
          sample_size: 5000,
          analysis_depth: 'comprehensive'
        },
        responseProcessor: 'CoreAnalysisProcessor',
        keywords: ['strategic', 'strategy', 'expansion', 'invest', 'investment', 'growth', 'opportunity', 'top markets', 'best markets', 'strategic markets', 'nike expansion', 'market expansion', 'strategic value', 'strategic opportunities'],
        targetVariable: 'strategic_value_score',
        scoreFieldName: 'strategic_value_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'analysis_depth'],
        expectedResponseTime: 20000, // 20 seconds for comprehensive analysis
        cacheable: true,
        rateLimit: { requests: 50, window: 3600000 }, // 50 requests per hour
        validationRules: {
          maxSampleSize: 10000,
          minSampleSize: 100
        },
        mockResponses: false
      },
      {
        id: '/spatial-clusters',
        name: 'Geographic Clustering',
        description: 'Find areas with similar characteristics using advanced clustering algorithms',
        category: 'geographic',
        url: '/spatial-clusters',
        defaultVisualization: 'cluster',
        payloadTemplate: {
          target_variable: '',
          sample_size: 5000,
          cluster_count: 5,
          clustering_method: 'kmeans'
        },
        responseProcessor: 'ClusterDataProcessor',
        keywords: ['cluster', 'similar', 'groups', 'geographic', 'spatial', 'segmentation'],
        targetVariable: 'cluster_performance_score',
        scoreFieldName: 'cluster_performance_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'cluster_count', 'clustering_method'],
        expectedResponseTime: 20000,
        cacheable: true,
        rateLimit: { requests: 50, window: 3600000 },
        validationRules: {
          maxClusterCount: 20,
          minClusterCount: 2,
          maxSampleSize: 8000
        },
        mockResponses: false
      },
      {
        id: '/competitive-analysis',
        name: 'Brand Competition Analysis',
        description: 'Compare brand performance and competitive positioning across geographic markets',
        category: 'competitive',
        url: '/competitive-analysis',
        defaultVisualization: 'multi-symbol',
        payloadTemplate: {
          target_variable: '',
          sample_size: 5000,
          comparison_brands: [],
          analysis_type: 'market_share'
        },
        responseProcessor: 'CompetitiveDataProcessor',
        keywords: ['compete', 'competition', 'competitive', 'vs', 'versus', 'brand comparison', 'market share', 'nike vs adidas', 'competitive advantage', 'competitive positioning', 'competitive landscape', 'brand dominance'],
        targetVariable: 'competitive_advantage_score',
        scoreFieldName: 'competitive_advantage_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'comparison_brands', 'analysis_type'],
        expectedResponseTime: 25000,
        cacheable: true,
        rateLimit: { requests: 30, window: 3600000 },
        validationRules: {
          maxBrands: 10,
          analysisTypes: ['market_share', 'brand_strength', 'competitive_position']
        },
        mockResponses: false
      },
      {
        id: '/brand-difference',
        name: 'Brand Market Share Difference',
        description: 'Calculate and visualize percent difference in market share between any two brands',
        category: 'competitive',
        url: '/brand-difference',
        defaultVisualization: 'choropleth',
        payloadTemplate: {
          brand1: 'nike',
          brand2: 'adidas',
          sample_size: 5000,
          analysis_type: 'percent_difference'
        },
        responseProcessor: 'BrandDifferenceProcessor',
        keywords: ['difference', 'brand difference', 'market share difference', 'percent difference', 'nike vs adidas difference', 'compare brands', 'brand comparison difference', 'share difference', 'vs', 'versus', 'nike adidas difference'],
        targetVariable: 'brand_difference_score',
        scoreFieldName: 'brand_difference_score',
        requiredFields: ['brand1', 'brand2'],
        optionalFields: ['sample_size', 'analysis_type'],
        expectedResponseTime: 20000,
        cacheable: true,
        rateLimit: { requests: 40, window: 3600000 },
        validationRules: {
          supportedBrands: ['nike', 'adidas', 'jordan'],
          analysisTypes: ['percent_difference', 'absolute_difference']
        },
        mockResponses: false
      },
      // Add remaining 13 endpoints with similar enhanced configurations...
      {
        id: '/correlation-analysis',
        name: 'Correlation Analysis',
        description: 'Analyze statistical relationships between variables',
        category: 'core',
        url: '/correlation-analysis',
        defaultVisualization: 'bivariate',
        payloadTemplate: { target_variable: '', sample_size: 5000 },
        responseProcessor: 'CorrelationAnalysisProcessor',
        keywords: ['correlation', 'relationship', 'related', 'association'],
        targetVariable: 'correlation_score',
        scoreFieldName: 'correlation_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size'],
        expectedResponseTime: 12000,
        cacheable: true,
        rateLimit: { requests: 80, window: 3600000 },
        mockResponses: false
      },
      {
        id: '/demographic-insights',
        name: 'Demographic Analysis',
        description: 'Deep demographic and population analysis',
        category: 'demographic',
        url: '/demographic-insights',
        defaultVisualization: 'choropleth',
        payloadTemplate: { target_variable: '', sample_size: 5000 },
        responseProcessor: 'DemographicDataProcessor', // Demographic data processor
        keywords: ['demographic', 'demographics', 'population', 'age', 'income', 'lifestyle', 'demographic opportunity', 'demographic score', 'demographic insights'],
        targetVariable: 'demographic_score',
        scoreFieldName: 'demographic_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size'],
        expectedResponseTime: 18000,
        cacheable: true,
        rateLimit: { requests: 60, window: 3600000 },
        mockResponses: false
      },
      {
        id: '/trend-analysis',
        name: 'Trend Analysis',
        description: 'Identify patterns, trends, and temporal changes in geographic data',
        category: 'temporal',
        url: '/trend-analysis',
        defaultVisualization: 'choropleth',
        payloadTemplate: { target_variable: '', sample_size: 5000, trend_period: '12_months' },
        responseProcessor: 'TrendAnalysisProcessor',
        keywords: ['trend', 'trending', 'change', 'growth', 'decline', 'pattern', 'temporal', 'time', 'evolution'],
        targetVariable: 'trend_score',
        scoreFieldName: 'trend_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'trend_period'],
        expectedResponseTime: 18000,
        cacheable: true,
        rateLimit: { requests: 60, window: 3600000 },
        validationRules: { trendPeriods: ['3_months', '6_months', '12_months', '24_months'] },
        mockResponses: false
      },
      {
        id: '/anomaly-detection',
        name: 'Anomaly Detection',
        description: 'Identify statistical outliers and unusual patterns in geographic data',
        category: 'detection',
        url: '/anomaly-detection',
        defaultVisualization: 'multi-symbol',
        payloadTemplate: { target_variable: '', sample_size: 5000, anomaly_threshold: 2.0 },
        responseProcessor: 'AnomalyDetectionProcessor',
        keywords: ['anomaly', 'anomalies', 'outlier', 'outliers', 'unusual', 'abnormal', 'detect', 'exception'],
        targetVariable: 'anomaly_score',
        scoreFieldName: 'anomaly_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'anomaly_threshold'],
        expectedResponseTime: 22000,
        cacheable: false, // Anomalies change frequently
        rateLimit: { requests: 40, window: 3600000 },
        validationRules: { maxThreshold: 5.0, minThreshold: 1.0 },
        mockResponses: false
      },
      {
        id: '/feature-interactions',
        name: 'Feature Interaction Analysis',
        description: 'Analyze complex interactions between multiple variables and their combined effects',
        category: 'advanced',
        url: '/feature-interactions',
        defaultVisualization: 'bivariate',
        payloadTemplate: { primary_variable: '', secondary_variable: '', sample_size: 5000 },
        responseProcessor: 'FeatureInteractionProcessor',
        keywords: ['interaction', 'combined', 'relationship', 'correlation', 'dependency', 'synergy', 'effect'],
        targetVariable: 'interaction_score',
        scoreFieldName: 'interaction_score',
        requiredFields: ['primary_variable', 'secondary_variable'],
        optionalFields: ['sample_size'],
        expectedResponseTime: 25000,
        cacheable: true,
        rateLimit: { requests: 30, window: 3600000 },
        validationRules: { maxVariables: 5 },
        mockResponses: false
      },
      {
        id: '/outlier-detection',
        name: 'Outlier Detection',
        description: 'Identify geographic areas with exceptional performance or characteristics',
        category: 'detection',
        url: '/outlier-detection',
        defaultVisualization: 'multi-symbol',
        payloadTemplate: { target_variable: '', sample_size: 5000, outlier_method: 'iqr' },
        responseProcessor: 'OutlierDetectionProcessor',
        keywords: ['outlier', 'outliers', 'exceptional', 'extreme', 'unusual', 'standout', 'deviant'],
        targetVariable: 'outlier_score',
        scoreFieldName: 'outlier_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'outlier_method'],
        expectedResponseTime: 15000,
        cacheable: true,
        rateLimit: { requests: 50, window: 3600000 },
        validationRules: { outlierMethods: ['iqr', 'zscore', 'isolation_forest'] },
        mockResponses: false
      },
      {
        id: '/comparative-analysis',
        name: 'Comparative Analysis',
        description: 'Compare performance between different brands, regions, or time periods',
        category: 'comparative',
        url: '/comparative-analysis',
        defaultVisualization: 'bivariate',
        payloadTemplate: { primary_variable: '', comparison_variable: '', sample_size: 5000 },
        responseProcessor: 'ComparativeAnalysisProcessor',
        keywords: ['compare', 'comparison', 'versus', 'vs', 'difference', 'gap', 'benchmark', 'relative'],
        targetVariable: 'comparison_score',
        scoreFieldName: 'comparison_score',
        requiredFields: ['primary_variable', 'comparison_variable'],
        optionalFields: ['sample_size'],
        expectedResponseTime: 20000,
        cacheable: true,
        rateLimit: { requests: 45, window: 3600000 },
        validationRules: { maxComparisons: 10 },
        mockResponses: false
      },
      {
        id: '/predictive-modeling',
        name: 'Predictive Modeling',
        description: 'Generate forecasts and predictions based on historical patterns and trends',
        category: 'predictive',
        url: '/predictive-modeling',
        defaultVisualization: 'choropleth',
        payloadTemplate: { target_variable: '', sample_size: 5000, prediction_horizon: '6_months' },
        responseProcessor: 'PredictiveModelingProcessor',
        keywords: ['predict', 'prediction', 'forecast', 'future', 'model', 'projection', 'estimate'],
        targetVariable: 'prediction_score',
        scoreFieldName: 'prediction_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'prediction_horizon'],
        expectedResponseTime: 30000,
        cacheable: true,
        rateLimit: { requests: 25, window: 3600000 },
        validationRules: { horizons: ['3_months', '6_months', '12_months'] },
        mockResponses: false
      },
      {
        id: '/segment-profiling',
        name: 'Market Segmentation',
        description: 'Profile and analyze distinct market segments based on behavioral and demographic patterns',
        category: 'segmentation',
        url: '/segment-profiling',
        defaultVisualization: 'cluster',
        payloadTemplate: { target_variable: '', sample_size: 5000, segment_count: 4 },
        responseProcessor: 'SegmentProfilingProcessor',
        keywords: ['segment', 'segmentation', 'market segments', 'customer segments', 'group', 'category', 'type', 'segment profiling'],
        targetVariable: 'segment_score',
        scoreFieldName: 'segment_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'segment_count'],
        expectedResponseTime: 22000,
        cacheable: true,
        rateLimit: { requests: 35, window: 3600000 },
        validationRules: { maxSegments: 10, minSegments: 2 },
        mockResponses: false
      },
      {
        id: '/scenario-analysis',
        name: 'Scenario Analysis',
        description: 'Evaluate different business scenarios and their potential geographic impact',
        category: 'strategic',
        url: '/scenario-analysis',
        defaultVisualization: 'choropleth',
        payloadTemplate: { base_scenario: '', alternative_scenario: '', sample_size: 5000 },
        responseProcessor: 'ScenarioAnalysisProcessor',
        keywords: ['scenario', 'what-if', 'simulation', 'alternative', 'impact', 'sensitivity', 'scenario planning', 'scenario analysis', 'business scenario'],
        targetVariable: 'scenario_score',
        scoreFieldName: 'scenario_score',
        requiredFields: ['base_scenario'],
        optionalFields: ['alternative_scenario', 'sample_size'],
        expectedResponseTime: 25000,
        cacheable: false, // Scenarios are dynamic
        rateLimit: { requests: 20, window: 3600000 },
        validationRules: { maxScenarios: 5 },
        mockResponses: false
      },
      {
        id: '/customer-profile',
        name: 'Customer Profile Analysis',
        description: 'Analyze customer profiles and personas across geographic markets with demographic, psychographic, and behavioral characteristics',
        category: 'segmentation',
        url: '/customer-profile',
        defaultVisualization: 'cluster',
        payloadTemplate: {
          target_variable: '',
          sample_size: 5000,
          profile_depth: 'comprehensive',
          segment_focus: 'all',
          include_psychographics: true
        },
        responseProcessor: 'CustomerProfileProcessor',
        keywords: ['customer profile', 'customer persona', 'ideal customer', 'target customer', 'customer characteristics', 'customer fit', 'persona analysis', 'buyer profile', 'customer behavior', 'lifestyle patterns', 'customer demographics', 'target demographics', 'demographic fit', 'lifestyle analysis', 'customer values', 'psychographics', 'customer personas', 'ideal customer personas'],
        targetVariable: 'customer_profile_score',
        scoreFieldName: 'customer_profile_score',
        requiredFields: ['target_variable'],
        optionalFields: ['sample_size', 'profile_depth', 'segment_focus', 'include_psychographics'],
        expectedResponseTime: 25000,
        cacheable: true,
        rateLimit: { requests: 40, window: 3600000 },
        validationRules: {
          profileDepths: ['basic', 'standard', 'comprehensive'],
          segmentFocus: ['all', 'primary', 'secondary', 'emerging'],
          maxSampleSize: 8000,
          minSampleSize: 500
        },
        mockResponses: false
      }
    ];

    // Store configurations with validation
    configs.forEach(config => {
      if (this.validateEndpointConfig(config)) {
        this.endpointConfigs.set(config.id, config);
      } else {
        console.error(`[ConfigurationManager] Invalid endpoint configuration: ${config.id}`);
      }
    });
  }

  private loadVisualizationConfigurations(): void {
    const visualizationConfigs: VisualizationConfiguration[] = [
      {
        type: 'choropleth',
        name: 'Choropleth Map',
        description: 'Color-coded areas based on data values',
        defaultColorScheme: 'blue-to-red',
        supportedClassificationMethods: ['natural-breaks', 'equal-interval', 'quantile'],
        requiredFields: ['valueField', 'labelField'],
        optionalFields: ['opacity', 'strokeWidth'],
        performance: { maxRecords: 10000, avgRenderTime: 500 }
      },
      {
        type: 'cluster',
        name: 'Cluster Visualization',
        description: 'Areas grouped by similarity with distinct colors',
        defaultColorScheme: 'categorical',
        supportedClassificationMethods: ['categorical'],
        requiredFields: ['clusterField', 'labelField'],
        optionalFields: ['opacity', 'strokeWidth'],
        performance: { maxRecords: 8000, avgRenderTime: 800 }
      },
      {
        type: 'multi-symbol',
        name: 'Multi-Symbol Map',
        description: 'Multiple symbols representing different data dimensions',
        defaultColorScheme: 'categorical',
        supportedClassificationMethods: ['categorical', 'graduated'],
        requiredFields: ['valueField', 'symbolField'],
        optionalFields: ['symbolSize', 'opacity'],
        performance: { maxRecords: 5000, avgRenderTime: 1200 }
      }
    ];

    visualizationConfigs.forEach(config => {
      this.visualizationConfigs.set(config.type, config);
    });
  }

  private loadEnvironmentConfigurations(): void {
    // Load environment-specific configurations
    const environment = process.env.NODE_ENV || 'development';
    
    const envConfigs = {
      development: {
        apiTimeout: 30000,
        debugMode: true,
        cacheEnabled: false,
        mockResponses: false
      },
      production: {
        apiTimeout: 15000,
        debugMode: false,
        cacheEnabled: true,
        mockResponses: false
      },
      test: {
        apiTimeout: 5000,
        debugMode: true,
        cacheEnabled: false,
        mockResponses: false
      }
    };

    const config = envConfigs[environment as keyof typeof envConfigs] || envConfigs.development;
    
    Object.entries(config).forEach(([key, value]) => {
      this.environmentConfigs.set(key, value);
    });
  }

  private validateAllConfigurations(): void {
    let validationErrors = 0;
    
    // Validate endpoint configurations
    this.endpointConfigs.forEach((config, id) => {
      if (!this.validateEndpointConfig(config)) {
        console.error(`[ConfigurationManager] Validation failed for endpoint: ${id}`);
        validationErrors++;
      }
    });
    
    if (validationErrors > 0) {
      console.warn(`[ConfigurationManager] ${validationErrors} configuration validation errors found`);
    }
  }

  private validateEndpointConfig(config: EndpointConfiguration): boolean {
    const validator = this.configValidators.get('endpoint');
    return validator ? validator.validate(config) : true;
  }

  private getConfigurationIssues(): string[] {
    const issues: string[] = [];
    
    // Check for missing processors
    this.endpointConfigs.forEach((config, id) => {
      if (!config.responseProcessor) {
        issues.push(`Missing response processor for endpoint: ${id}`);
      }
    });
    
    // Check for invalid visualization types
    this.endpointConfigs.forEach((config, id) => {
      if (!this.visualizationConfigs.has(config.defaultVisualization)) {
        issues.push(`Invalid visualization type for endpoint: ${id}`);
      }
    });
    
    return issues;
  }

  private clearCache(): void {
    this.configCache.clear();
  }
  
  /**
   * Analyze query for ranking requests
   */
  detectRanking(query: string): RankingRequest {
    return RankingDetector.detectRanking(query);
  }
  
  /**
   * Prepare features with ranking emphasis
   */
  prepareRankedFeatures(
    features: any[], 
    ranking: RankingRequest, 
    valueField: string = 'value'
  ) {
    return RankingDetector.prepareRankedFeatures(features, ranking, valueField);
  }
}

// ============================================================================
// CONFIGURATION INTERFACES AND VALIDATORS
// ============================================================================

interface VisualizationConfiguration {
  type: VisualizationType;
  name: string;
  description: string;
  defaultColorScheme: string;
  supportedClassificationMethods: string[];
  requiredFields: string[];
  optionalFields: string[];
  performance: {
    maxRecords: number;
    avgRenderTime: number;
  };
}

interface ConfigurationHealth {
  totalEndpoints: number;
  validEndpoints: number;
  invalidEndpoints: number;
  isHealthy: boolean;
  lastLoadTime: number;
  cacheSize: number;
  issues: string[];
}

interface ConfigValidator {
  validate(config: any): boolean;
}

class EndpointConfigValidator implements ConfigValidator {
  validate(config: EndpointConfiguration): boolean {
    // Required fields validation
    if (!config.id || !config.name || !config.url) return false;
    if (!config.category || !config.defaultVisualization) return false;
    if (!Array.isArray(config.keywords)) return false;
    
    // URL format validation
    if (!config.url.startsWith('/')) return false;
    
    // Keywords validation
    if (config.keywords.length === 0) return false;
    
    return true;
  }
}

class VisualizationConfigValidator implements ConfigValidator {
  validate(config: VisualizationConfiguration): boolean {
    if (!config.type || !config.name) return false;
    if (!Array.isArray(config.requiredFields)) return false;
    if (!config.performance?.maxRecords) return false;
    
    return true;
  }
}

class EnvironmentConfigValidator implements ConfigValidator {
  validate(config: any): boolean {
    return config && typeof config === 'object';
  }
}

// Extend the existing types
declare module './types' {
  interface EndpointConfiguration {
    targetVariable?: string;
    scoreFieldName?: string;
    requiredFields?: string[];
    optionalFields?: string[];
    expectedResponseTime?: number;
    cacheable?: boolean;
    rateLimit?: {
      requests: number;
      window: number;
    };
    validationRules?: Record<string, any>;
    mockResponses?: boolean; // Add mockResponses to the interface
  }
} 