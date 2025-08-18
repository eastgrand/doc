// Export all data processor strategies
export { CoreAnalysisProcessor } from './CoreAnalysisProcessor';
export { ClusterDataProcessor } from './ClusterDataProcessor';
export { CompetitiveDataProcessor } from './CompetitiveDataProcessor';
export { DemographicDataProcessor } from './DemographicDataProcessor';
export { CorrelationAnalysisProcessor } from './CorrelationAnalysisProcessor';
export { TrendDataProcessor } from './TrendDataProcessor';
export { RiskDataProcessor } from './RiskDataProcessor';
export { TrendAnalysisProcessor } from './TrendAnalysisProcessor';
export { AnomalyDetectionProcessor } from './AnomalyDetectionProcessor';
export { FeatureInteractionProcessor } from './FeatureInteractionProcessor';
export { OutlierDetectionProcessor } from './OutlierDetectionProcessor';
export { ComparativeAnalysisProcessor } from './ComparativeAnalysisProcessor';
export { PredictiveModelingProcessor } from './PredictiveModelingProcessor';
export { SegmentProfilingProcessor } from './SegmentProfilingProcessor';
export { ScenarioAnalysisProcessor } from './ScenarioAnalysisProcessor';
export { MarketSizingProcessor } from './MarketSizingProcessor';
export { BrandAnalysisProcessor } from './BrandAnalysisProcessor';
export { BrandDifferenceProcessor } from './BrandDifferenceProcessor';
export { RealEstateAnalysisProcessor } from './RealEstateAnalysisProcessor';
export { StrategicAnalysisProcessor } from './StrategicAnalysisProcessor';
export { CustomerProfileProcessor } from './CustomerProfileProcessor';
export { SensitivityAnalysisProcessor } from './SensitivityAnalysisProcessor';
export { ModelPerformanceProcessor } from './ModelPerformanceProcessor';
export { ModelSelectionProcessor } from './ModelSelectionProcessor';
export { EnsembleAnalysisProcessor } from './EnsembleAnalysisProcessor';
export { FeatureImportanceRankingProcessor } from './FeatureImportanceRankingProcessor';
export { DimensionalityInsightsProcessor } from './DimensionalityInsightsProcessor';
export { SpatialClustersProcessor } from './SpatialClustersProcessor';
export { ConsensusAnalysisProcessor } from './ConsensusAnalysisProcessor';
export { AlgorithmComparisonProcessor } from './AlgorithmComparisonProcessor';
export { AnalyzeProcessor } from './AnalyzeProcessor';

// TODO: Export additional processors as they're developed
// export { OptimizationDataProcessor } from './OptimizationDataProcessor';

/**
 * Available processor types for different analysis endpoints
 */
export const PROCESSOR_TYPES = {
  CORE_ANALYSIS: 'core_analysis',
  CLUSTER_ANALYSIS: 'spatial_clustering', 
  COMPETITIVE_ANALYSIS: 'competitive_analysis',
  DEMOGRAPHIC_ANALYSIS: 'demographic_analysis',
  CORRELATION_ANALYSIS: 'correlation_analysis',
  TREND_ANALYSIS: 'trend_analysis',
  RISK_ANALYSIS: 'risk_analysis',
  FEATURE_INTERACTIONS: 'feature_interactions',
  OUTLIER_DETECTION: 'outlier_detection',
  ANOMALY_DETECTION: 'anomaly_detection',
  PREDICTIVE_MODELING: 'predictive_modeling',
  SCENARIO_ANALYSIS: 'scenario_analysis',
  SEGMENT_PROFILING: 'segment_profiling',
  BRAND_DIFFERENCE: 'brand_difference',
  SENSITIVITY_ANALYSIS: 'sensitivity_analysis',
  MODEL_PERFORMANCE: 'model_performance',
  MODEL_SELECTION: 'model_selection',
  ENSEMBLE_ANALYSIS: 'ensemble_analysis',
  FEATURE_IMPORTANCE_RANKING: 'feature_importance_ranking',
  DIMENSIONALITY_INSIGHTS: 'dimensionality_insights',
  SPATIAL_CLUSTERS: 'spatial_clusters',
  CONSENSUS_ANALYSIS: 'consensus_analysis',
  ALGORITHM_COMPARISON: 'algorithm_comparison',
  ANALYZE: 'analyze'
} as const;

/**
 * Processor registry for mapping endpoints to processor types
 */
export const ENDPOINT_PROCESSOR_MAP = {
  '/analyze': PROCESSOR_TYPES.ANALYZE,
  '/spatial-clusters': PROCESSOR_TYPES.SPATIAL_CLUSTERS,
  '/competitive-analysis': PROCESSOR_TYPES.COMPETITIVE_ANALYSIS,
  '/demographic-insights': PROCESSOR_TYPES.DEMOGRAPHIC_ANALYSIS,
  '/trend-analysis': PROCESSOR_TYPES.TREND_ANALYSIS,
  '/risk-analysis': PROCESSOR_TYPES.RISK_ANALYSIS,
  '/correlation-analysis': PROCESSOR_TYPES.CORRELATION_ANALYSIS,
  '/threshold-analysis': PROCESSOR_TYPES.CORE_ANALYSIS,
  // Use specialized processors for endpoints that have them
  '/feature-interactions': PROCESSOR_TYPES.FEATURE_INTERACTIONS,
  '/outlier-detection': PROCESSOR_TYPES.OUTLIER_DETECTION,
  '/anomaly-detection': PROCESSOR_TYPES.ANOMALY_DETECTION,
  '/comparative-analysis': PROCESSOR_TYPES.COMPETITIVE_ANALYSIS,
  '/predictive-modeling': PROCESSOR_TYPES.PREDICTIVE_MODELING,
  '/scenario-analysis': PROCESSOR_TYPES.SCENARIO_ANALYSIS,
  '/segment-profiling': PROCESSOR_TYPES.SEGMENT_PROFILING,
  '/brand-difference': PROCESSOR_TYPES.BRAND_DIFFERENCE,
  // All endpoints now have specialized processors
  '/sensitivity-analysis': PROCESSOR_TYPES.SENSITIVITY_ANALYSIS,
  '/model-performance': PROCESSOR_TYPES.MODEL_PERFORMANCE,
  '/model-selection': PROCESSOR_TYPES.MODEL_SELECTION,
  '/ensemble-analysis': PROCESSOR_TYPES.ENSEMBLE_ANALYSIS,
  '/feature-importance-ranking': PROCESSOR_TYPES.FEATURE_IMPORTANCE_RANKING,
  '/dimensionality-insights': PROCESSOR_TYPES.DIMENSIONALITY_INSIGHTS,
  '/consensus-analysis': PROCESSOR_TYPES.CONSENSUS_ANALYSIS,
  '/algorithm-comparison': PROCESSOR_TYPES.ALGORITHM_COMPARISON
} as const; 