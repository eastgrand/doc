export interface LayerResult {
  layerId: string;
  layerName: string;
  layerType: string;
  layer: any;
  features: any[];
  extent: any;
  esriLayer?: any;
}

export interface AnalysisResult {
  queryType: 'simple' | 'factor' | 'interaction' | 'outlier' | 'scenario' | 'threshold' | 'segment' | 'comparative' | 
             'unknown' | 'correlation' | 'distribution' | 'topN' | 'jointHigh' | 'comparison' | 'simple_display' | 'choropleth' | 'difference' | 'bivariate' | 'hotspot' | 'multivariate';
  visualizationStrategy?: string;
  targetVariable?: string;
  targetField?: string;
  entities: string[];
  intent: 'unknown' | 'trends' | 'correlation' | 'distribution' | 'information' | 'visualization_request' | 'ranking' | 'comparison' | 'location';
  confidence: number;
  layers: Array<{
    layerId: string;
    relevance: number;
    matchMethod: string;
    confidence: number;
    reasons: string[];
  }>;
  timeframe: string;
  searchType: 'web' | 'images' | 'news' | 'youtube' | 'shopping';
  relevantLayers: string[];
  explanation: string;
  relevantFields?: string[];
  comparisonParty?: string;
  topN?: number;
  isCrossGeography?: boolean;
  originalQueryType?: string;
  originalQuery?: string;
  trendsKeyword?: string;
  populationLookup?: Map<string, number>;
  reasoning?: string;
  metrics?: { r: number; pValue?: number };
  correlationMetrics?: { r: number; pValue?: number };
  thresholds?: Record<string, number>;
  category?: string;
  demographic_filters?: { field: string; condition: string }[];

  // Optional fields from data analysis service
  summary?: string;
  feature_importance?: { feature: string; importance: number }[];
  results?: any[];
  error?: string;
  suggestions?: string[];
}

export interface AnalysisContext {
  previousMessages: Array<{
    role: 'user' | 'assistant';
    content: string;
    metadata?: {
      analysisResult?: any;
      context?: string;
    };
  }>;
  currentContext?: string;
}

export interface LayerDataOptions {
  query: string;
  spatialFilter?: any;
  targetFields?: string[];
  sqlWhere?: string;
  minApplications?: number;
  context?: string;
}

export interface AnalysisServiceRequest {
  analysis_type: string;
  query: string;
  minApplications: number;
  target_variable: string;
  conversationContext?: string;
  previousAnalysis?: any[];
  relevantLayers?: string[];
  matchedFields?: string[];
  demographic_filters: any[];
  matched_fields?: string[];
  relevant_layers?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    analysisResult?: any;
    context?: string;
    totalFeatures?: number;
    visualizationResult?: any;
    debugInfo?: any;
  };
}

export interface ConceptMap {
  matchedLayers: string[];
  matchedFields: string[];
  confidence: number;
  keywords: string[];
  layerScores: Record<string, number>;
  fieldScores: Record<string, number>;
}

export interface GeoProcessingStep {
  id?: string;
  name?: string;
  status: 'pending' | 'processing' | 'complete' | 'error' | 'warning' | 'in-progress';
  message?: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface DebugInfo {
  query?: string;
  timestamp?: string;
  logs?: { step: string; data?: any; timestamp: string }[];
  layerMatches?: string[];
  sqlQuery?: string;
  features?: GeospatialFeature[];
  timing?: Record<string, any>;
  totalFeatures?: number;
  context?: string;
  error?: Error;
}

export interface ChatVisualizationResult {
  layer?: any;
  type?: string;
  data?: any;
  legendInfo?: {
    title: string;
    type: string;
    items: Array<{
      id?: string;
      label: string;
      color: string;
      value?: string | number | boolean | null;
      type?: string;
    }>;
  };
}

export interface GeospatialFeature {
  id?: string;
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: Record<string, any>;
  weight?: number;
  
  // Additional fields added during processing
  area_name?: string;        // Area name like "11368 (Corona)" or "Brooklyn" 
  cluster_id?: number;       // Cluster ID for clustered analyses (0, 1, 2, etc.)
  cluster_name?: string;     // Cluster name like "Corona Territory"
}

export interface AnalysisServiceResponse {
  summary: string;
  results: any[];
  visualizationData?: any[];
  error?: string;
  popupConfig?: any;
}

export interface JobStatusResponse {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AnalysisServiceResponse;
  error?: string;
}