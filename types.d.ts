declare module '@arcgis/core/*';
declare module '@arcgis/core';

/**
 * Type definitions for ML Analytics service
 */

export interface StructuredQuery {
  analysis_type: string;
  target_variable?: string;
  data?: any[];
  parameters?: Record<string, unknown>;
  memory_optimized?: boolean;
  memory_limit_mb?: number;
  accept_partial_results?: boolean;
  correlation_field?: string;
  ranking_field?: string;
  distribution_field?: string;
  visualization_strategy?: {
    targetVariable: string;
    correlationField?: string;
    rankingField?: string;
    distributionField?: string;
  };
}

export interface AnalysisResult {
  type: string;
  data: Array<{
    id: string | number;
    attributes: Record<string, unknown>;
    geometry?: {
      type: string;
      coordinates: number[];
    };
  }>;
  summary: string;
  featureImportance: Array<{
    feature: string;
    importance: number;
  }>;
  shapValues: Record<string, number[]>;
  isPartialResult?: boolean;
  jobId?: string;
  confidence?: number;
  error?: string;
  metadata?: {
    processingTime?: number;
    modelVersion?: string;
    timestamp?: string;
    visualizationType?: string;
    queryType?: string;
    intent?: string;
  };
}