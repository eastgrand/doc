/**
 * Centralized Field Mapping Configuration
 * 
 * This configuration defines how each analysis endpoint maps its data fields
 * to the standard visualization fields. This eliminates the need for multiple
 * if statements throughout the codebase.
 * 
 * To add a new endpoint:
 * 1. Add an entry with the endpoint name or analysis type
 * 2. Specify the primaryScoreField (the main metric to visualize)
 * 3. Optionally add any fallback fields
 * 4. That's it! No other code changes needed.
 */

export interface EndpointFieldMapping {
  // The primary field containing the main score/metric for this analysis
  primaryScoreField: string;
  
  // Optional fallback fields if primary is not found
  fallbackFields?: string[];
  
  // Optional display name for the field in legends/popups
  displayName?: string;
  
  // Optional value range for validation
  expectedRange?: {
    min: number;
    max: number;
  };
  
  // Optional flag to indicate if values should be treated as percentages
  isPercentage?: boolean;
  
  // Optional custom formatter for display
  formatter?: (value: number) => string;
}

// Centralized configuration for all endpoint field mappings
export const ENDPOINT_FIELD_MAPPINGS: Record<string, EndpointFieldMapping> = {
  // Strategic Analysis
  'strategic_analysis': {
    primaryScoreField: 'strategic_value_score',
    displayName: 'Strategic Value Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Competitive Analysis
  'competitive_analysis': {
    primaryScoreField: 'competitive_advantage_score',
    displayName: 'Competitive Advantage Score',
    expectedRange: { min: 1, max: 10 },
    formatter: (value) => value.toFixed(1)
  },
  
  // Demographic Analysis
  'demographic_analysis': {
    primaryScoreField: 'demographic_score',
    displayName: 'Demographic Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Market Sizing
  'market_sizing': {
    primaryScoreField: 'market_size_score',
    displayName: 'Market Size Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Trend Analysis
  'trend_analysis': {
    primaryScoreField: 'trend_score',
    displayName: 'Trend Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Correlation Analysis
  'correlation_analysis': {
    primaryScoreField: 'correlation_score',
    displayName: 'Correlation Score',
    expectedRange: { min: -1, max: 1 },
    formatter: (value) => value.toFixed(3)
  },
  
  // Anomaly Detection
  'anomaly_detection': {
    primaryScoreField: 'anomaly_score',
    displayName: 'Anomaly Score',
    expectedRange: { min: 0, max: 1 },
    formatter: (value) => (value * 100).toFixed(1) + '%'
  },
  
  // Predictive Analysis
  'predictive_analysis': {
    primaryScoreField: 'prediction_score',
    displayName: 'Prediction Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Risk Analysis
  'risk_analysis': {
    primaryScoreField: 'risk_score',
    displayName: 'Risk Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Spatial Clustering
  'spatial_clustering': {
    primaryScoreField: 'cluster_performance_score',
    fallbackFields: ['cluster_score'],
    displayName: 'Cluster Performance Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Expansion Analysis
  'expansion_analysis': {
    primaryScoreField: 'expansion_opportunity_score',
    displayName: 'Expansion Opportunity Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Brand Analysis
  'brand_analysis': {
    primaryScoreField: 'brand_score',
    displayName: 'Brand Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Segment Profiling
  'segment_profiling': {
    primaryScoreField: 'segment_score',
    displayName: 'Segment Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Real Estate Analysis
  'real_estate_analysis': {
    primaryScoreField: 'real_estate_score',
    displayName: 'Real Estate Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Scenario Analysis
  'scenario_analysis': {
    primaryScoreField: 'scenario_score',
    displayName: 'Scenario Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Comparative Analysis
  'comparative_analysis': {
    primaryScoreField: 'comparative_score',
    displayName: 'Comparative Score',
    expectedRange: { min: 0, max: 100 }
  },
  
  // Default fallback for unknown analysis types
  'default': {
    primaryScoreField: 'value',
    fallbackFields: ['score', 'analysis_score', 'thematic_value'],
    displayName: 'Analysis Score'
  }
};

/**
 * Get the field mapping for a specific analysis type or endpoint
 */
export function getFieldMapping(analysisType: string): EndpointFieldMapping {
  // Try exact match first
  if (ENDPOINT_FIELD_MAPPINGS[analysisType]) {
    return ENDPOINT_FIELD_MAPPINGS[analysisType];
  }
  
  // Try with underscores replaced by hyphens (for endpoint names)
  const hyphenated = analysisType.replace(/_/g, '-');
  if (ENDPOINT_FIELD_MAPPINGS[hyphenated]) {
    return ENDPOINT_FIELD_MAPPINGS[hyphenated];
  }
  
  // Try removing 'analysis' suffix
  const withoutAnalysis = analysisType.replace(/_analysis$/, '');
  if (ENDPOINT_FIELD_MAPPINGS[withoutAnalysis]) {
    return ENDPOINT_FIELD_MAPPINGS[withoutAnalysis];
  }
  
  // Return default mapping
  return ENDPOINT_FIELD_MAPPINGS['default'];
}

/**
 * Get the primary score field for a specific analysis type
 */
export function getPrimaryScoreField(analysisType: string, targetVariable?: string): string {
  // If targetVariable is explicitly provided, use it
  if (targetVariable) {
    return targetVariable;
  }
  
  const mapping = getFieldMapping(analysisType);
  return mapping.primaryScoreField;
}

/**
 * Extract the score value from a record using the field mapping
 */
export function extractScoreValue(
  record: any, 
  analysisType: string, 
  targetVariable?: string
): number {
  const mapping = getFieldMapping(analysisType);
  
  // Try primary field first
  const primaryField = targetVariable || mapping.primaryScoreField;
  if (record[primaryField] !== undefined && record[primaryField] !== null) {
    return Number(record[primaryField]);
  }
  
  // Try properties
  if (record.properties?.[primaryField] !== undefined) {
    return Number(record.properties[primaryField]);
  }
  
  // Try fallback fields
  if (mapping.fallbackFields) {
    for (const field of mapping.fallbackFields) {
      if (record[field] !== undefined && record[field] !== null) {
        return Number(record[field]);
      }
      if (record.properties?.[field] !== undefined) {
        return Number(record.properties[field]);
      }
    }
  }
  
  // Last resort - try 'value' field
  if (record.value !== undefined && record.value !== null) {
    return Number(record.value);
  }
  
  return 0;
}

/**
 * Format a score value for display
 */
export function formatScoreValue(
  value: number, 
  analysisType: string
): string {
  const mapping = getFieldMapping(analysisType);
  
  if (mapping.formatter) {
    return mapping.formatter(value);
  }
  
  if (mapping.isPercentage) {
    return `${value.toFixed(1)}%`;
  }
  
  // Default formatting
  if (value % 1 === 0) {
    return value.toString();
  }
  return value.toFixed(2);
}

/**
 * Validate if a score value is within expected range
 */
export function isValidScoreValue(
  value: number, 
  analysisType: string
): boolean {
  const mapping = getFieldMapping(analysisType);
  
  if (!mapping.expectedRange) {
    return !isNaN(value);
  }
  
  return value >= mapping.expectedRange.min && value <= mapping.expectedRange.max;
}