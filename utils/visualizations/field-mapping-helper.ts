import { FIELD_ALIASES } from '../field-aliases';
import { layers } from '../../config/layers';
import type { LayerConfig } from '../../types/layers';

/**
 * A definitive mapping from field codes to their desired human-readable display name.
 * This serves as the single source of truth for UI components like legends and popups.
 */
const FIELD_CODE_TO_DISPLAY_NAME: Record<string, string> = {
    // Brand fields
    "MP30029AB": "Adidas Athletic Shoes",
    "MP30030AB": "ASICS Athletic Shoes",
    "MP30031AB": "Converse Athletic Shoes",
    "MP30032AB": "Jordan Athletic Shoes",
    "MP30033AB": "New Balance Athletic Shoes",
    "MP30034AB": "Nike Athletic Shoes",
    "MP30035AB": "Puma Athletic Shoes",
    "MP30036AB": "Reebok Athletic Shoes",
    "MP30037AB": "Skechers Athletic Shoes",

    // Brand fields (percentage versions)
    "MP30029ABP": "Adidas Athletic Shoes (%)",
    "MP30030ABP": "ASICS Athletic Shoes (%)",
    "MP30031ABP": "Converse Athletic Shoes (%)",
    "MP30032ABP": "Jordan Athletic Shoes (%)",
    "MP30033ABP": "New Balance Athletic Shoes (%)",
    "MP30034ABP": "Nike Athletic Shoes (%)",
    "MP30035ABP": "Puma Athletic Shoes (%)",
    "MP30036ABP": "Reebok Athletic Shoes (%)",
    "MP30037ABP": "Skechers Athletic Shoes (%)",

    // Demographic fields
    "TOTPOPCY": "Total Population",
    "MEDDICY": "Median Disposable Income",
    "DIVINDXCY": "Diversity Index",
    "WHITECY": "White Population",
    "BLACKCY": "Black Population",
    "ASIANCY": "Asian Population",
    "HISPWHTCY": "Hispanic White Population",
    "GENZCY": "Gen Z Population",
    "MILLENNCY": "Millennial Population",
    
    // Demographic fields (percentage versions)
    "WHITECYP": "White Population (%)",
    "BLACKCYP": "Black Population (%)",
    "ASIANCYP": "Asian Population (%)",
    "HISPWHTCYP": "Hispanic White Population (%)",
    "GENZCYP": "Gen Z Population (%)",
    "MILLENNCYP": "Millennial Population (%)",

    // Sports participation
    "MP33020AB": "Jogging/Running Participation",
    "MP33032AB": "Yoga Participation",
    "MP33031AB": "Weight Lifting Participation",
    
    // Sports participation (percentage versions)
    "MP33020ABP": "Jogging/Running Participation (%)",
    "MP33032ABP": "Yoga Participation (%)",
    "MP33031ABP": "Weight Lifting Participation (%)",

    // Sports fandom
    "MP33104AB": "MLB Super Fan",
    "MP33105AB": "NASCAR Super Fan",
    "MP33106AB": "NBA Super Fan",
    "MP33107AB": "NFL Super Fan",
    "MP33108AB": "NHL Super Fan",
    "MP33119AB": "International Soccer Super Fan",
    "MP33120AB": "MLS Soccer Super Fan",
    
    // Sports fandom (percentage versions)
    "MP33104ABP": "MLB Super Fan (%)",
    "MP33105ABP": "NASCAR Super Fan (%)",
    "MP33106ABP": "NBA Super Fan (%)",
    "MP33107ABP": "NFL Super Fan (%)",
    "MP33108ABP": "NHL Super Fan (%)",
    "MP33119ABP": "International Soccer Super Fan (%)",
    "MP33120ABP": "MLS Soccer Super Fan (%)",

    // Store shopping
    "MP31035AB": "Dick's Sporting Goods Shopping",
    "MP31042AB": "Foot Locker Shopping",
    
    // Store shopping (percentage versions)
    "MP31035ABP": "Dick's Sporting Goods Shopping (%)",
    "MP31042ABP": "Foot Locker Shopping (%)",
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
   * @param fieldName - Raw field name (e.g., "MP30034A_B", "value_MP30029A_B")
   * @param layerId - Optional layer ID for additional context
   * @returns Human-readable field name (e.g., "Nike Purchases")
   */
  static getFriendlyFieldName(fieldName: string, layerId?: string): string {
    // Strip any 'value_' prefix or other artifacts and normalize
    const lookupKey = (fieldName.split('.').pop() || fieldName)
      .replace(/^value_/, '')
      .toUpperCase()
      .replace(/[_\s]/g, ''); // Remove both underscores and spaces

    // 1. Check our definitive display name map
    if (FIELD_CODE_TO_DISPLAY_NAME[lookupKey]) {
      return FIELD_CODE_TO_DISPLAY_NAME[lookupKey];
    }
    
    let actualFieldName = (fieldName.split('.').pop() || fieldName).replace(/^value_/, '');

    // 2. Handle special correlation format
    if (actualFieldName.includes('_vs_') && actualFieldName.includes('_correlation')) {
      const parts = actualFieldName.replace('_correlation', '').split('_vs_');
      if (parts.length === 2) {
        const field1Name = this.getFriendlyFieldName(parts[0]);
        const field2Name = this.getFriendlyFieldName(parts[1]);
        return `${field1Name} vs. ${field2Name} Correlation`;
      }
    }
    
    // 3. Check layer configuration for an alias
    if (layerId) {
      const layer = this.getLayerConfigById(layerId);
      const field = layer?.fields?.find(f => f.name.toUpperCase() === actualFieldName.toUpperCase());
      if (field?.alias && field.alias !== 'Internal') {
        return field.alias;
      }
    }

    // 4. Try the general-purpose reverse mapping from FIELD_ALIASES
    const reverseMap = this.buildReverseMapping();
    if (reverseMap[actualFieldName]) {
        return reverseMap[actualFieldName];
    }
    if (reverseMap[actualFieldName.toUpperCase()]) {
        return reverseMap[actualFieldName.toUpperCase()];
    }

    // 5. As a last resort, prettify the raw field name
    return this.prettifyFieldName(actualFieldName);
  }

  /**
   * Clean field labels by removing common qualifiers and formatting
   * @param label - Raw field label
   * @returns Cleaned field label
   */
  static cleanFieldLabel(label: string): string {
    // This function is now just a pass-through to avoid breaking dependencies.
    // The core logic is now in getFriendlyFieldName.
    return label;
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