/**
 * Types for SHAP/XGBoost microservice responses
 */

export interface ShapExplanation {
  shap_values: number[][];
  feature_names: string[];
  base_value: number | number[];
}

export interface MicroserviceResponse {
  predictions: number[];
  explanations: ShapExplanation;
  processing_time: number;
  model_version: string;
  model_type: string;
  cached: boolean;
  error?: string;
  error_type?: string;
}

export interface ShapAsyncAnalyzeJobResult {
  success: boolean;
  results: Array<Record<string, any>>;
  summary: string;
  feature_importance: Array<{ feature: string; importance: number }>;
  shap_values: Record<string, number[]>;
  version_info: {
    model_version?: string;
    dataset_version?: string;
  };
  error?: string;
  traceback?: string;
}

/**
 * Validation function for microservice responses
 */
export function isValidMicroserviceResponse(response: any): response is MicroserviceResponse {
  if (!response || typeof response !== 'object') return false;
  
  // Check required fields
  if (!Array.isArray(response.predictions)) return false;
  if (!response.explanations || typeof response.explanations !== 'object') return false;
  if (!Array.isArray(response.explanations.shap_values)) return false;
  if (!Array.isArray(response.explanations.feature_names)) return false;
  if (typeof response.explanations.base_value !== 'number' && !Array.isArray(response.explanations.base_value)) return false;
  if (typeof response.processing_time !== 'number') return false;
  if (typeof response.model_version !== 'string') return false;
  if (typeof response.model_type !== 'string') return false;
  if (typeof response.cached !== 'boolean') return false;
  
  return true;
}

/**
 * Validation function for SHAP job results
 */
export function isValidShapJobResult(result: any): result is ShapAsyncAnalyzeJobResult {
  if (!result || typeof result !== 'object') return false;
  
  // Check required fields
  if (typeof result.success !== 'boolean') return false;
  if (!Array.isArray(result.results)) return false;
  if (typeof result.summary !== 'string') return false;
  if (!Array.isArray(result.feature_importance)) return false;
  if (!result.shap_values || typeof result.shap_values !== 'object') return false;
  
  // Validate feature_importance structure
  for (const item of result.feature_importance) {
    if (typeof item.feature !== 'string' || typeof item.importance !== 'number') {
      return false;
    }
  }
  
  // Validate shap_values structure
  for (const [key, value] of Object.entries(result.shap_values)) {
    if (typeof key !== 'string' || !Array.isArray(value)) {
      return false;
    }
    for (const val of value) {
      if (typeof val !== 'number') return false;
    }
  }
  
  return true;
}

/**
 * Convert microservice response to visualization data
 */
export function convertToVisualizationData(response: MicroserviceResponse) {
  return {
    predictions: response.predictions,
    featureNames: response.explanations.feature_names,
    shapValues: response.explanations.shap_values,
    modelType: response.model_type
  };
}

/**
 * Check if response is a microservice error
 */
export function isMicroserviceError(response: any): boolean {
  return response && 
         typeof response === 'object' && 
         'error' in response && 
         typeof response.error === 'string';
} 