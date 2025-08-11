import { FIELD_ALIASES } from '../field-aliases';
import { layers } from '../../config/layers';
import type { LayerConfig } from '../../types/layers';

/**
 * A definitive mapping from field codes to their desired human-readable display name.
 * Auto-generated from actual endpoint data fields.
 * Generated: 2025-08-11T19:47:59.201Z
 * Total fields: 132 from 25 endpoints
 */
const FIELD_CODE_TO_DISPLAY_NAME: Record<string, string> = {
    // === SYSTEM FIELDS ===
    "CreationDate": "Creation Date",
    "Creator": "Creator", 
    "DESCRIPTION": "Area Description",
    "EditDate": "Edit Date", 
    "Editor": "Editor",
    "ID": "Area ID",
    "OBJECTID": "Object ID",
    "Shape__Area": "Geographic Area",
    "Shape__Length": "Geographic Perimeter",
    "thematic_value": "Thematic Value",

    // === ANALYSIS SCORE FIELDS ===
    "algorithm_agreement_score": "Algorithm Agreement Score",
    "algorithm_performance_score": "Algorithm Performance Score", 
    "analysis_score": "Analysis Score",
    "anomaly_detection_score": "Anomaly Detection Score",
    "anomaly_insight_score": "Anomaly Insight Score",
    "anomaly_performance_score": "Anomaly Performance Score", 
    "anomaly_score": "Anomaly Score",
    "brand_difference_score": "Brand Difference Score",
    "cluster_performance_score": "Cluster Performance Score",
    "cluster_score": "Cluster Score",
    "comparative_score": "Comparative Score", 
    "comparison_score": "Comparison Score",
    "competitive_advantage_score": "Competitive Advantage Score",
    "competitive_score": "Competitive Score",
    "consensus_performance_score": "Consensus Performance Score",
    "consensus_score": "Consensus Score",
    "correlation_score": "Correlation Score",
    "correlation_strength_score": "Correlation Strength Score", 
    "customer_profile_score": "Customer Profile Score",
    "demographic_opportunity_score": "Demographic Opportunity Score",
    "demographic_score": "Demographic Score",
    "dimensionality_performance_score": "Dimensionality Performance Score",
    "dimensionality_score": "Dimensionality Score",
    "ensemble_performance_score": "Ensemble Performance Score",
    "ensemble_strength_score": "Ensemble Strength Score",
    "feature_importance_score": "Feature Importance Score",
    "feature_interaction_score": "Feature Interaction Score",
    "importance_score": "Importance Score", 
    "interaction_score": "Interaction Score",
    "model_selection_performance_score": "Model Selection Performance Score",
    "model_selection_score": "Model Selection Score",
    "outlier_detection_score": "Outlier Detection Score",
    "outlier_score": "Outlier Score",
    "performance_score": "Performance Score",
    "predictive_modeling_score": "Predictive Modeling Score", 
    "predictive_score": "Predictive Score",
    "scenario_analysis_score": "Scenario Analysis Score",
    "scenario_score": "Scenario Score",
    "segment_profiling_score": "Segment Profiling Score",
    "segment_score": "Segment Score", 
    "sensitivity_score": "Sensitivity Score",
    "strategic_score": "Strategic Score",
    "strategic_value_score": "Strategic Value Score",
    "trend_score": "Trend Score",
    "trend_strength_score": "Trend Strength Score",
    "value": "Value",

    // === MP CODES (Current Project Data Fields) ===
    "MP10002A_B": "MP10002 Count",
    "MP10002A_B_P": "MP10002 Percentage",
    "MP10020A_B": "MP10020 Count", 
    "MP10020A_B_P": "MP10020 Percentage",
    "MP10028A_B": "MP10028 Count",
    "MP10028A_B_P": "MP10028 Percentage",
    "MP10104A_B": "MP10104 Count",
    "MP10104A_B_P": "MP10104 Percentage", 
    "MP10110A_B": "MP10110 Count",
    "MP10110A_B_P": "MP10110 Percentage",
    "MP10116A_B": "MP10116 Count",
    "MP10116A_B_P": "MP10116 Percentage",
    "MP10120A_B": "MP10120 Count",
    "MP10120A_B_P": "MP10120 Percentage",
    "MP10128A_B": "MP10128 Count",
    "MP10128A_B_P": "MP10128 Percentage",
    "MP10138A_B": "MP10138 Count", 
    "MP10138A_B_P": "MP10138 Percentage",

    // === X CODES (Spending/Economic Data) ===
    "X14058_X": "X14058 Spending",
    "X14058_X_A": "X14058 Average Spending", 
    "X14060_X": "X14060 Spending",
    "X14060_X_A": "X14060 Average Spending",
    "X14068_X": "X14068 Spending",
    "X14068_X_A": "X14068 Average Spending",

    // === GENERATION DEMOGRAPHICS ===
    "GENALPHACY": "Generation Alpha Population",
    "GENALPHACY_P": "Generation Alpha Percentage", 
    "GENZ_CY": "Generation Z Population",
    "GENZ_CY_P": "Generation Z Percentage",

    // === LOCATION FIELDS ===
    "LATITUDE": "Latitude",
    "LONGITUDE": "Longitude",
    "address": "Address",
    "country": "Country", 
    "locality": "Locality",
    "name": "Name",
    "postcode": "Postal Code",
    "region": "Region",

    // === OTHER ANALYSIS FIELDS ===
    "DESC_": "Description",
    "INDUSTRY_DESC": "Industry Description",
    "algorithm_agreement": "Algorithm Agreement",
    "algorithm_predictions": "Algorithm Predictions",
    "alternative_algorithms": "Alternative Algorithms",
    "anomaly_explanation": "Anomaly Explanation",
    "anomaly_type": "Anomaly Type",
    "best_algorithm": "Best Algorithm",
    "cluster_id": "Cluster ID",
    "cluster_label": "Cluster Label",
    "correlation_explanation": "Correlation Explanation",
    "esri_pid": "ESRI PID",
    "feature_influence": "Feature Influence",
    "fsq_category": "Foursquare Category",
    "fsq_category_all": "All Foursquare Categories",
    "interaction_explanation": "Interaction Explanation",
    "interaction_type": "Interaction Type",
    "model_confidence": "Model Confidence",
    "model_explanation": "Model Explanation",
    "outlier_explanation": "Outlier Explanation",
    "outlier_threshold": "Outlier Threshold",
    "outlier_type": "Outlier Type",
    "pointCount": "Point Count",
    "prediction_confidence": "Prediction Confidence",
    "relative_importance": "Relative Importance",
    "scenario_impact": "Scenario Impact",
    "segment_characteristics": "Segment Characteristics",
    "source": "Data Source",
    "trend_direction": "Trend Direction",
    "trend_explanation": "Trend Explanation",
    "confidence_level": "Confidence Level",
    "prediction_interval": "Prediction Interval",
    "sensitivity_explanation": "Sensitivity Explanation",
    "outlier_impact": "Outlier Impact",
    "feature_rank": "Feature Rank",
    "scenario_probability": "Scenario Probability",
    "trend_magnitude": "Trend Magnitude",
    "cluster_center": "Cluster Center",
    "cluster_distance": "Cluster Distance",

    // === CALCULATED/DERIVED FIELDS ===
    "total_population": "Total Population",
    "median_income": "Median Income", 
    "market_gap": "Market Gap Opportunity",
    "diversity_index": "Diversity Index",
    "nike_market_share": "Nike Market Share",
    "population": "Population"
};

/**
 * Centralized field mapping helper for consistent human-readable field names
 * across all visualizations (popups, legends, analysis)
 */
export class FieldMappingHelper {
  
  // Create reverse lookup once for performance
  private static reverseMapping: Record<string, string> | null = null;
  
  /**
   * Build a simple reverse mapping from field codes to the first-found alias.
   * NOTE: This is for general-purpose lookup and may not be the "clean" display name.
   * For display purposes, use getFriendlyFieldName.
   */
  private static buildReverseMapping(): Record<string, string> {
    if (this.reverseMapping) return this.reverseMapping;
    
    const fieldCodeToName: Record<string, string> = {};
    
    // Build a basic reverse mapping.
    // Since multiple aliases map to one code, this is not guaranteed to be the "display" name.
    Object.entries(FIELD_ALIASES).forEach(([humanName, fieldCode]) => {
      if (!fieldCodeToName[fieldCode]) {
        fieldCodeToName[fieldCode] = humanName;
      }
    });
    
    this.reverseMapping = fieldCodeToName;
    return fieldCodeToName;
  }
  
  /**
   * Get human-readable field name with consistent processing.
   * This is the primary method for getting UI-friendly names.
   * @param fieldName - Raw field name (e.g., "MP10104A_B_P", "strategic_value_score")
   * @param layerId - Optional layer ID for additional context
   * @returns Human-readable field name (e.g., "MP10104 Percentage")
   */
  static getFriendlyFieldName(fieldName: string, layerId?: string): string {
    // First check the exact field name in our comprehensive mapping
    if (FIELD_CODE_TO_DISPLAY_NAME[fieldName]) {
      return FIELD_CODE_TO_DISPLAY_NAME[fieldName];
    }
    
    // Then try without any prefixes
    let actualFieldName = (fieldName.split('.').pop() || fieldName).replace(/^value_/, '');
    if (FIELD_CODE_TO_DISPLAY_NAME[actualFieldName]) {
      return FIELD_CODE_TO_DISPLAY_NAME[actualFieldName];
    }
    
    // Strip any 'value_' prefix or other artifacts and normalize
    const lookupKey = actualFieldName
      .toUpperCase()
      .replace(/[_\s]/g, ''); // Remove both underscores and spaces

    // Check our definitive display name map with normalized key
    if (FIELD_CODE_TO_DISPLAY_NAME[lookupKey]) {
      return FIELD_CODE_TO_DISPLAY_NAME[lookupKey];
    }

    // Handle special correlation format
    if (actualFieldName.includes('_vs_') && actualFieldName.includes('_correlation')) {
      const parts = actualFieldName.replace('_correlation', '').split('_vs_');
      if (parts.length === 2) {
        const field1Name = this.getFriendlyFieldName(parts[0]);
        const field2Name = this.getFriendlyFieldName(parts[1]);
        return `${field1Name} vs. ${field2Name} Correlation`;
      }
    }
    
    // Check layer configuration for an alias
    if (layerId) {
      const layer = this.getLayerConfigById(layerId);
      const field = layer?.fields?.find(f => f.name.toUpperCase() === actualFieldName.toUpperCase());
      if (field?.alias && field.alias.toLowerCase() !== 'internal') {
        return this.cleanFieldLabel(field.alias);
      }
    }

    // Try the general-purpose reverse mapping from FIELD_ALIASES
    const reverseMap = this.buildReverseMapping();
    if (reverseMap[actualFieldName]) {
        const cleaned = this.cleanFieldLabel(reverseMap[actualFieldName]);
        return cleaned || this.prettifyFieldName(actualFieldName);
    }
    if (reverseMap[actualFieldName.toUpperCase()]) {
        const cleaned = this.cleanFieldLabel(reverseMap[actualFieldName.toUpperCase()]);
        return cleaned || this.prettifyFieldName(actualFieldName);
    }

    // As a last resort, prettify the raw field name
    return this.prettifyFieldName(actualFieldName);
  }

  /**
   * Clean field labels by removing common qualifiers and formatting
   * @param label - Raw field label
   * @returns Cleaned field label
   */
  static cleanFieldLabel(label: string): string {
    if (!label || typeof label !== 'string') {
      return label;
    }
    
    // Skip if it's "Internal" - return empty string to hide it
    if (label.toLowerCase().trim() === 'internal') {
      return '';
    }
    
    let cleaned = label;
    
    // Remove (esri), (Esri), (ESRI) and similar patterns first
    cleaned = cleaned.replace(/\s*\([Ee][Ss][Rr][Ii]\s*\d*\)/g, '');
    
    // Remove other common parenthetical qualifiers
    cleaned = cleaned.replace(/\s*\([^)]*\)/g, '');
    
    // Remove percentage symbols
    cleaned = cleaned.replace(/\s*%\s*/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  /**
   * Convert raw field names to human-readable format as a fallback.
   * @param fieldName - Raw field name
   * @returns Prettified field name
   */
  static prettifyFieldName(fieldName: string): string {
    // Avoid mangling known correlation formats
    if (fieldName.includes('_vs_') && fieldName.includes('_correlation')) {
        return fieldName;
    }
    
    return fieldName
      .replace(/_/g, ' ')
      .replace(/\sA\sB(\sP)?$/, '') // Remove " A B" or " A B P" suffix from codes
      .split(' ')
      .map(word => {
        // Don't change case if it looks like a field code
        return word.match(/^[A-Z]{2,}\d+/) ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join(' ');
  }

  /**
   * Get multiple friendly field names at once
   * @param fields - Array of field names or field objects
   * @param layerId - Optional layer ID
   * @returns Array of human-readable field names
   */
  static getFriendlyFieldNames(
    fields: (string | { name: string; layerId?: string })[],
    defaultLayerId?: string
  ): string[] {
    return fields.map(field => {
      if (typeof field === 'string') {
        return this.getFriendlyFieldName(field, defaultLayerId);
      }
      return this.getFriendlyFieldName(field.name, field.layerId || defaultLayerId);
    });
  }

  /**
   * Create field mapping for popup templates
   * @param fields - Fields to map
   * @param layerId - Optional layer ID
   * @returns Object mapping raw field names to friendly names
   */
  static createPopupFieldMapping(
    fields: string[],
    layerId?: string
  ): Record<string, string> {
    const mapping: Record<string, string> = {};
    fields.forEach(field => {
      mapping[field] = this.getFriendlyFieldName(field, layerId);
    });
    return mapping;
  }

  /**
   * Create legend title from field names
   * @param primaryField - Primary field name
   * @param comparisonField - Optional comparison field name
   * @param layerId - Optional layer ID
   * @returns Formatted legend title
   */
  static createLegendTitle(
    primaryField: string,
    comparisonField?: string,
    layerId?: string
  ): string {
    const primaryName = this.getFriendlyFieldName(primaryField, layerId);
    
    if (comparisonField) {
      const comparisonName = this.getFriendlyFieldName(comparisonField, layerId);
      return `${primaryName} vs ${comparisonName}`;
    }
    
    return primaryName;
  }

  /**
   * Helper to get layer config by ID
   */
  private static getLayerConfigById(layerId: string): LayerConfig | undefined {
    if (!Array.isArray(layers)) return undefined;
    return layers.find((l: LayerConfig) => l.id === layerId);
  }
}

/**
 * Convenience functions for backward compatibility
 */
export const getFriendlyFieldName = FieldMappingHelper.getFriendlyFieldName.bind(FieldMappingHelper);
export const cleanFieldLabel = FieldMappingHelper.cleanFieldLabel.bind(FieldMappingHelper);
export const prettifyFieldName = FieldMappingHelper.prettifyFieldName.bind(FieldMappingHelper);
export const createLegendTitle = FieldMappingHelper.createLegendTitle.bind(FieldMappingHelper);