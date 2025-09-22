/**
 * Base interfaces and types for the analysis configuration system
 */

export type ProjectType = 'retail' | 'real-estate' | 'entertainment' | 'demographics' | 'healthcare' | 'finance';

export interface FieldMappings {
  primaryMetric: string[];        // Priority order for main score
  secondaryMetrics: string[];     // Supporting metrics
  populationField: string[];      // Population/size indicators
  incomeField: string[];         // Income/value indicators
  geographicId: string[];        // Area identifier fields
  descriptiveFields: string[];   // Human-readable descriptions
  
  // Optional domain-specific field categories
  housingFields?: string[];       // Housing tenure and type data
  housingMarketFields?: string[]; // Housing market indicators
  demographicFields?: string[];   // Age, family composition
  brandFields?: string[];         // Brand presence/market share
  competitiveFields?: string[];   // Competitive analysis metrics
  
  // Entertainment industry specific fields
  tapestryFields?: string[];      // ESRI Tapestry lifestyle segments
  musicFields?: string[];         // Music consumption and preference data
  culturalFields?: string[];      // Cultural engagement and entertainment consumption
  theaterFields?: string[];       // Theater infrastructure and accessibility
  radioFields?: string[];         // Radio coverage and classic rock stations
}

export interface Terminology {
  entityType: string;            // "areas", "markets", "regions", "stores"
  metricName: string;           // "performance", "income", "market share"
  scoreDescription: string;     // What the score represents
  comparisonContext: string;    // What we're comparing
}

export interface ScoreRange {
  min: number;
  description: string;
  actionable: string;
}

export interface ScoreRanges {
  excellent: ScoreRange;
  good: ScoreRange;
  moderate: ScoreRange;
  poor: ScoreRange;
}

export interface SummaryTemplates {
  analysisTitle: string;
  methodologyExplanation: string;
  insightPatterns: string[];
  recommendationPatterns: string[];
}

// Processor-specific configuration interfaces
export interface ComparativeConfig {
  comparisonType: 'geographic' | 'temporal' | 'categorical';
  groupingStrategy: 'city' | 'region' | 'store' | 'timeframe' | 'hexagon';
  normalizationMethod: 'global' | 'grouped' | 'percentile';
  entityLabels: { primary: string; secondary: string; };
}

export interface CompetitiveConfig {
  competitionType: 'market_share' | 'performance' | 'quality' | 'entertainment_venues';
  benchmarkStrategy: 'top_performer' | 'industry_average' | 'peer_group' | 'market_saturation';
  competitorIdentification: 'explicit' | 'inferred' | 'geographic' | 'theater_density';
}

export interface DemographicConfig {
  focusMetrics: string[];
  segmentationCriteria: string;
  ageGroupings?: { [key: string]: number[] };
  incomeQuintiles?: number[];
  targetSegments?: string[];
  ageRange?: number[];
}

export interface StrategicConfig {
  priorityFactors: string[];
  weightingScheme: 'equal' | 'weighted' | 'adaptive';
  strategicLenses: string[];
  weights?: { [key: string]: number };
}

export interface TrendConfig {
  timeHorizon: 'short_term' | 'medium_term' | 'long_term' | 'seasonal';
  trendMetrics: string[];
  seasonalityAdjustment: boolean;
}

export interface SpatialConfig {
  clusteringMethod: 'geographic' | 'demographic' | 'performance' | 'hexagonal';
  proximityMetric: 'distance' | 'similarity' | 'connectivity' | 'h3_distance';
  clusterSizePreference: 'small' | 'medium' | 'large' | 'adaptive';
  resolution?: string;
}

export interface EnsembleConfig {
  methodWeights: { [method: string]: number };
  consensusThreshold: number;
  diversityBonus: boolean;
  entertainmentSpecific?: { [key: string]: any } | boolean;
}

export interface ProcessorConfig {
  comparative?: ComparativeConfig;
  competitive?: CompetitiveConfig;
  demographic?: DemographicConfig;
  strategic?: StrategicConfig;
  trend?: TrendConfig;
  spatial?: SpatialConfig;
  ensemble?: EnsembleConfig;
}

export interface AnalysisContext {
  projectType: ProjectType;
  domain: string;
  
  // Field mappings for data extraction
  fieldMappings: FieldMappings;
  
  // Display and messaging
  terminology: Terminology;
  
  // Score interpretation thresholds and meanings
  scoreRanges: ScoreRanges;
  
  // Summary templates with placeholders
  summaryTemplates: SummaryTemplates;
  
  // Processor-specific configurations
  processorConfig: ProcessorConfig;
}