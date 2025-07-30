// Core Analysis Engine Types and Interfaces
// Enhanced with Multi-Endpoint Analysis Support

import { ClusterConfig } from '@/lib/clustering/types';

// ============================================================================
// ANALYSIS ENGINE CORE TYPES
// ============================================================================

export interface AnalysisOptions {
  endpoint?: string;
  targetVariable?: string;
  sampleSize?: number;
  forceRefresh?: boolean;
  visualizationType?: string;
  
  // Clustering options
  clusterConfig?: ClusterConfig;
  
  // Multi-endpoint options
  endpoints?: string[];
  combinationStrategy?: 'overlay' | 'comparison' | 'sequential' | 'correlation';
  forceMultiEndpoint?: boolean;
  disableMultiEndpoint?: boolean;
  maxEndpoints?: number;
  multiEndpointThreshold?: number; // Confidence threshold for auto-detection
  mergeOptions?: {
    locationField?: string;
    includePartialRecords?: boolean;
    fieldPrefixes?: boolean;
    qualityThreshold?: number;
  };
}

export interface AnalysisResult {
  endpoint: string;
  data: ProcessedAnalysisData;
  visualization?: VisualizationResult;
  success: boolean;
  error?: string;
  metadata?: AnalysisMetadata;
}

export interface AnalysisMetadata {
  executionTime: number;
  dataPointCount: number;
  confidenceScore?: number;
  timestamp: string;
  errorMessage?: string;
  
  // Multi-endpoint metadata
  isMultiEndpoint?: boolean;
  endpointsUsed?: string[];
  mergeStrategy?: string;
  strategicInsights?: any;
  performanceMetrics?: {
    totalAnalysisTime: number;
    dataLoadingTime: number;
    processingTime: number;
    visualizationTime: number;
    endpointLoadTimes: Record<string, number>;
  };
  qualityMetrics?: {
    dataCompleteness: number;
    analysisConfidence: number;
    spatialCoverage: number;
  };
}

// ============================================================================
// RAW DATA TYPES (from microservice)
// ============================================================================

export interface RawAnalysisResult {
  success: boolean;
  results: any[];
  feature_importance?: Array<{
    feature: string;
    importance: number;
  }>;
  model_info?: {
    target_variable: string;
    feature_count: number;
    accuracy?: number;
  };
  summary?: string;
  error?: string;
  total_records?: number;
  progressive_processed?: boolean;
  final_memory_mb?: number;
  correlation_metadata?: any;
}

// ============================================================================
// PROCESSED DATA TYPES (standardized format)
// ============================================================================

export interface ProcessedAnalysisData {
  type: string;
  records: GeographicDataPoint[];
  totalRecords?: number;
  summary: string;
  featureImportance?: FeatureImportance[];
  statistics: AnalysisStatistics;
  targetVariable: string;
  renderer?: any; // Optional direct renderer (bypasses complex rendering chain)
  legend?: any; // Optional direct legend (bypasses complex legend generation)
  extent?: __esri.Extent | null; // Optional extent for map zooming
  shouldZoom?: boolean; // Whether to zoom to features extent
  clusterAnalysis?: ClusterAnalysisMetadata; // Optional cluster-specific metadata
  competitiveAnalysis?: CompetitiveAnalysisMetadata; // Optional competitive-specific metadata
  demographicAnalysis?: any; // Optional demographic-specific metadata
  trendAnalysis?: any; // Optional trend-specific metadata
  correlationMatrix?: any; // Optional correlation-specific metadata
  riskAssessment?: any; // Optional risk-specific metadata
  customerProfileAnalysis?: any; // Optional customer profile-specific metadata
  correlationAnalysis?: any; // Optional correlation-specific metadata
  brandAnalysis?: any; // Optional brand comparison-specific metadata
  brandComparison?: any; // Optional brand comparison data
  // Clustering-related fields
  isClustered?: boolean; // Whether this data has been processed by clustering
  clusters?: any[]; // Array of cluster information when available
}

export interface GeographicDataPoint {
  area_id: string;
  area_name: string;
  value: number;
  rank?: number;
  category?: string;
  coordinates?: [number, number];
  properties: Record<string, any>;
  shapValues?: Record<string, number>;
  geometry?: any; // GeoJSON geometry (Point, Polygon, etc.)
  // Clustering-related fields
  cluster_id?: number; // Cluster assignment when data is clustered
  cluster_name?: string; // Human-readable cluster name
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  description?: string;
}

export interface AnalysisStatistics {
  total: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  // Optional extended statistics for different analysis types
  percentile25?: number;
  percentile75?: number;
  iqr?: number;
  outlierCount?: number;
  clusterCount?: number;
  avgClusterSize?: number;
  avgSimilarity?: number;
  // Competitive analysis specific fields
  marketConcentration?: number;
  competitiveIntensity?: number;
  avgMarketShare?: number;
  // Quintile information for proper classification
  quintiles?: {
    competitive?: number[];
    marketShare?: number[];
  };
  // Correlation-specific
  correlationStrength?: number;
  significanceLevel?: number;
  // Risk-specific
  riskLevel?: 'low' | 'medium' | 'high';
  confidenceInterval?: [number, number];
  // Demographic-specific
  avgIncome?: number;
  medianAge?: number;
  diversityIndex?: number;
  // Trend-specific
  avgGrowthRate?: number;
  avgMomentum?: number;
  trendVolatility?: number;
  // Risk-specific
  avgVolatility?: number;
  avgUncertainty?: number;
  // Customer Profile specific
  avgDemographicAlignment?: number;
  avgLifestyleScore?: number;
  avgBehavioralScore?: number;
  avgTargetConfidence?: number;
  strongCorrelations?: number;
  correlationMatrix?: any;
}

// ============================================================================
// VISUALIZATION TYPES
// ============================================================================

export interface VisualizationResult {
  type: VisualizationType;
  config: VisualizationConfig;
  renderer: any; // ArcGIS renderer object
  popupTemplate: any; // ArcGIS popup template
  legend: LegendConfig;
  
  // Enhanced effects integration
  _pendingEffects?: {
    enabled: boolean;
    rendererFlags: any;
    visualizationData: ProcessedAnalysisData;
    config: VisualizationConfig;
  };
  _enhancedEffects?: any; // Effects metadata from renderers
}

export type VisualizationType = 
  | 'choropleth'
  | 'cluster' 
  | 'symbol'
  | 'heatmap'
  | 'categorical'
  | 'network'
  | 'multi-symbol'
  | 'bivariate'
  | 'graduated-symbols'
  | 'risk-gradient'
  | 'competitive'
  | 'multi_endpoint_overlay'
  | 'multi_endpoint_comparison'
  | 'multi_endpoint_sequential'
  | 'multi_endpoint_correlation';

export interface VisualizationConfig {
  colorScheme: string;
  opacity: number;
  strokeWidth: number;
  symbolSize?: number;
  valueField: string;
  labelField: string;
  popupFields: string[];
  classificationMethod?: 'natural-breaks' | 'equal-interval' | 'quantile' | 'manual' | 'categorical' | 'graduated' | string;
  classBreaks?: number[];
  // Allow additional properties for specialized renderers
  [key: string]: any;
}

export interface LegendConfig {
  title: string;
  items: LegendItem[];
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | string;
}

export interface LegendItem {
  label: string;
  color: string;
  value?: number;
  symbol?: string;
}

// ============================================================================
// ENDPOINT CONFIGURATION
// ============================================================================

export interface EndpointConfiguration {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'geographic' | 'demographic' | 'economic' | 'competitive' | 'temporal' | 'strategic' | 'detection' | 'advanced' | 'comparative' | 'predictive' | 'segmentation';
  url: string;
  defaultVisualization: VisualizationType;
  payloadTemplate: Record<string, any>;
  responseProcessor: string; // processor class name
  keywords: string[];
}

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

export type ProcessingStep = 
  | 'analyzing_query'
  | 'calling-endpoint' 
  | 'processing-data'
  | 'creating-visualization'
  | 'updating-state'
  | 'error'
  | null;

export type ProcessingStepKey = keyof ProcessingStep | string;

export interface ErrorState {
  hasError?: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export interface AnalysisState {
  // Analysis data
  currentAnalysis: ProcessedAnalysisData | null;
  currentVisualization: VisualizationResult | null;
  
  // UI state
  processingStatus: {
    isProcessing: boolean;
    currentStep: ProcessingStep | null;
    progress: number;
  };
  errorState: ErrorState | null;
  
  // Query and endpoint state
  lastQuery: string | null;
  selectedEndpoint?: string;
  lastAnalysisMetadata?: any;
  
  // History
  history: AnalysisHistoryItem[];
}

export interface AnalysisHistoryItem {
  id: string;
  query: string;
  endpoint: string;
  timestamp: string;
  success: boolean;
  executionTime: number;
  dataPointCount?: number;
}

// ============================================================================
// STRATEGY PATTERN INTERFACES
// ============================================================================

export interface DataProcessorStrategy {
  process(rawData: RawAnalysisResult): ProcessedAnalysisData;
  validate(rawData: RawAnalysisResult): boolean;
}

export interface VisualizationRendererStrategy {
  render(data: ProcessedAnalysisData, config: VisualizationConfig): VisualizationResult;
  supportsType(type: VisualizationType): boolean;
}

// ============================================================================
// QUERY ANALYSIS (for endpoint suggestion)
// ============================================================================

export interface QueryAnalysis {
  suggestedEndpoint: string;
  confidence: number;
  keywords: string[];
  intent: QueryIntent;
  extractedParameters: Record<string, any>;
}

export type QueryIntent = 
  | 'analysis'
  | 'comparison'
  | 'clustering'
  | 'trends'
  | 'risk-assessment'
  | 'optimization'
  | 'correlation'
  | 'outlier-detection';

// ============================================================================
// EVENT SYSTEM
// ============================================================================

export type StateSubscriber = (state: AnalysisState) => void;

export interface AnalysisEvent {
  type: AnalysisEventType;
  payload: any;
  timestamp: string;
}

export type AnalysisEventType = 
  | 'analysis-started' 
  | 'analysis-complete' 
  | 'analysis-error'
  | 'endpoint-selected'
  | 'data-processed'
  | 'visualization-created'
  | 'analysis-completed'
  | 'analysis-failed'
  | 'endpoint-changed';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ============================================================================
// ANALYSIS ENGINE CONFIGURATION
// ============================================================================

export interface AnalysisEngineConfig {
  // Additional configuration options
  apiUrl?: string;
  cacheEnabled?: boolean;
  apiKey?: string;

  debugMode: boolean;
  enableCaching: boolean;
  maxConcurrentRequests: number;
  defaultTimeout: number;
  retryAttempts: number;
  
  // Multi-endpoint configuration
  enableMultiEndpoint?: boolean;
  defaultMultiEndpointThreshold?: number;
  maxEndpointsPerQuery?: number;
  preferredMergeStrategy?: 'overlay' | 'comparison' | 'sequential' | 'correlation';
  multiEndpointVisualizationConfig?: {
    enableInteractivity?: boolean;
    dashboardLayout?: 'map_focused' | 'split_view' | 'tabbed' | 'carousel';
    showPerformanceMetrics?: boolean;
  };
}

export interface EndpointConfig {
  url: string;
  timeout?: number;
  retryAttempts?: number;
  payloadTransformer?: (data: any) => any;
  responseTransformer?: (data: any) => any;
} 

// Additional metadata interfaces
export interface ClusterAnalysisMetadata {
  clusters: Array<{
    id: number;
    label: string;
    size: number;
    avgSimilarity: number;
    centroid: Record<string, number>;
    representativeAreas: string[];
  }>;
  totalClusters: number;
  silhouetteScore: number;
}

export interface CompetitiveAnalysisMetadata {
  categories: Array<{
    category: string;
    size: number;
    percentage: number;
    avgCompetitiveScore: number;
    avgMarketShare: number;
    topAreas: Array<{
      name: string;
      score: number;
      marketShare: number;
    }>;
  }>;
  marketLeaders: Array<{
    area: string;
    score: number;
    marketShare: number;
    position: string;
  }>;
  growthOpportunities: Array<{
    area: string;
    currentShare: number;
    brandAwareness: number;
    opportunity: string;
  }>;
  competitiveBalance: string;
} 