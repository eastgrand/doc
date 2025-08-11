#!/usr/bin/env node
/**
 * Generate field-aliases.ts and field-mapping-helper.ts from endpoint data
 * This ensures both files stay in sync with actual project fields
 */

const fs = require('fs');
const path = require('path');

// Read the field analysis data
const analysisPath = path.join(__dirname, '../public/data/all-fields-analysis.json');
if (!fs.existsSync(analysisPath)) {
  console.error('❌ Field analysis data not found. Run extract-all-fields.js first.');
  process.exit(1);
}

const fieldData = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
const allFields = fieldData.all_fields_sorted;
const categories = fieldData.field_categories;

console.log('🔧 Generating field mapping files...\n');
console.log(`📊 Processing ${allFields.length} unique fields from ${fieldData.files_processed} endpoints`);

// Function to create natural language aliases
function createNaturalLanguageAliases(fieldName) {
  const aliases = [];
  
  // Create lowercase version
  aliases.push(fieldName.toLowerCase());
  
  // Create space-separated version
  const spaced = fieldName.replace(/([A-Z])/g, ' $1').replace(/[_]/g, ' ').trim().toLowerCase();
  if (spaced !== fieldName.toLowerCase()) {
    aliases.push(spaced);
  }
  
  // For score fields, add "score" variations
  if (fieldName.includes('_score')) {
    const withoutScore = fieldName.replace('_score', '').replace(/[_]/g, ' ');
    aliases.push(withoutScore.toLowerCase());
    aliases.push(`${withoutScore.toLowerCase()} score`);
  }
  
  // For MP codes, add simpler variations
  if (fieldName.startsWith('MP')) {
    const code = fieldName.split('A_B')[0].toLowerCase();
    aliases.push(code);
  }
  
  return aliases;
}

// Function to create human-readable display name
function createDisplayName(fieldName) {
  // Handle system fields
  const systemMappings = {
    'CreationDate': 'Creation Date',
    'Creator': 'Creator',
    'DESCRIPTION': 'Area Description',
    'EditDate': 'Edit Date',
    'Editor': 'Editor',
    'ID': 'Area ID',
    'OBJECTID': 'Object ID',
    'Shape__Area': 'Geographic Area',
    'Shape__Length': 'Geographic Perimeter',
    'thematic_value': 'Thematic Value'
  };
  
  if (systemMappings[fieldName]) {
    return systemMappings[fieldName];
  }
  
  // Handle score fields
  if (fieldName.includes('_score')) {
    return fieldName.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
  
  // Handle MP codes
  if (fieldName.startsWith('MP') && fieldName.includes('A_B')) {
    const code = fieldName.split('A_B')[0];
    if (fieldName.includes('_P')) {
      return `${code} Percentage`;
    } else {
      return `${code} Count`;
    }
  }
  
  // Handle X codes
  if (fieldName.startsWith('X') && fieldName.includes('_X')) {
    const code = fieldName.split('_X')[0];
    if (fieldName.includes('_A')) {
      return `${code} Average Spending`;
    } else {
      return `${code} Spending`;
    }
  }
  
  // Handle generation fields
  if (fieldName === 'GENALPHACY') return 'Generation Alpha Population';
  if (fieldName === 'GENALPHACY_P') return 'Generation Alpha Percentage';
  if (fieldName === 'GENZ_CY') return 'Generation Z Population';
  if (fieldName === 'GENZ_CY_P') return 'Generation Z Percentage';
  
  // Handle location fields
  const locationMappings = {
    'LATITUDE': 'Latitude',
    'LONGITUDE': 'Longitude',
    'address': 'Address',
    'country': 'Country',
    'locality': 'Locality',
    'name': 'Name',
    'postcode': 'Postal Code',
    'region': 'Region'
  };
  
  if (locationMappings[fieldName]) {
    return locationMappings[fieldName];
  }
  
  // Default: convert snake_case to Title Case
  return fieldName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Generate field-aliases.ts
function generateFieldAliases() {
  let content = `// Field aliases for enhanced query processing
// Auto-generated from actual endpoint data fields
// Generated: ${new Date().toISOString()}
// Total fields: ${allFields.length} from ${fieldData.files_processed} endpoints
export const FIELD_ALIASES: Record<string, string> = {
  // === SYSTEM FIELDS ===\n`;

  // Add system field aliases
  categories.system.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === ANALYSIS SCORE FIELDS ===\n';
  
  // Add score field aliases
  categories.analysis_scores.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === MP CODES (Current Project Data Fields) ===\n';
  
  // Add MP code aliases
  categories.mp_codes.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === X CODES (Spending/Economic Data) ===\n';
  
  // Add X code aliases
  categories.x_codes.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === GENERATION DEMOGRAPHICS ===\n';
  
  // Add generation field aliases
  categories.generation.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    // Add specific aliases for generation fields
    if (field.includes('GENALPHA')) {
      aliases.push('generation alpha', 'gen alpha');
    }
    if (field.includes('GENZ')) {
      aliases.push('generation z', 'gen z', 'genz');
    }
    
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === LOCATION FIELDS ===\n';
  
  // Add location field aliases
  categories.location.forEach(field => {
    const aliases = createNaturalLanguageAliases(field);
    if (field === 'postcode') aliases.push('postal code');
    
    aliases.forEach(alias => {
      if (alias !== field) {
        content += `  "${alias}": "${field}",\n`;
      }
    });
  });

  content += '\n  // === NATURAL LANGUAGE ALIASES ===\n';
  content += '  "population": "GENALPHACY", // Default to gen alpha as primary demographic\n';
  content += '  "people": "GENALPHACY",\n';
  content += '  "residents": "GENALPHACY",\n';
  content += '  "demographics": "GENALPHACY",\n';
  content += '  "young": "GENZ_CY_P",\n';
  content += '  "younger": "GENZ_CY_P",\n';
  content += '  "youth": "GENZ_CY_P",\n';
  content += '  "location": "DESCRIPTION"\n';

  content += '};\n\nexport const fieldAliases = FIELD_ALIASES;';

  return content;
}

// Generate field-mapping-helper.ts
function generateFieldMappingHelper() {
  let content = `import { FIELD_ALIASES } from '../field-aliases';
import { layers } from '../../config/layers';
import type { LayerConfig } from '../../types/layers';

/**
 * A definitive mapping from field codes to their desired human-readable display name.
 * Auto-generated from actual endpoint data fields.
 * Generated: ${new Date().toISOString()}
 * Total fields: ${allFields.length} from ${fieldData.files_processed} endpoints
 */
const FIELD_CODE_TO_DISPLAY_NAME: Record<string, string> = {\n`;

  // Add all field mappings by category
  Object.entries(categories).forEach(([categoryName, fields]) => {
    content += `    // === ${categoryName.toUpperCase().replace('_', ' ')} ===\n`;
    fields.forEach(field => {
      const displayName = createDisplayName(field);
      content += `    "${field}": "${displayName}",\n`;
    });
    content += '\n';
  });

  // Add calculated/derived fields
  content += `    // === CALCULATED/DERIVED FIELDS ===\n`;
  content += `    "total_population": "Total Population",\n`;
  content += `    "median_income": "Median Income",\n`;
  content += `    "market_gap": "Market Gap Opportunity",\n`;
  content += `    "diversity_index": "Diversity Index",\n`;
  content += `    "nike_market_share": "Nike Market Share",\n`;
  content += `    "population": "Population"\n`;

  content += '};\n\n';

  // Add the rest of the FieldMappingHelper class (keeping existing logic)
  content += `/**
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
   * @param fieldName - Raw field name from endpoint data
   * @param layerId - Optional layer ID for additional context
   * @returns Human-readable field name
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
      .replace(/[_\\s]/g, ''); // Remove both underscores and spaces

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
        return \`\${field1Name} vs. \${field2Name} Correlation\`;
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
    cleaned = cleaned.replace(/\\s*\\([Ee][Ss][Rr][Ii]\\s*\\d*\\)/g, '');
    
    // Remove other common parenthetical qualifiers
    cleaned = cleaned.replace(/\\s*\\([^)]*\\)/g, '');
    
    // Remove percentage symbols
    cleaned = cleaned.replace(/\\s*%\\s*/g, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\\s+/g, ' ').trim();
    
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
      .replace(/\\sA\\sB(\\sP)?$/, '') // Remove " A B" or " A B P" suffix from codes
      .split(' ')
      .map(word => {
        // Don't change case if it looks like a field code
        return word.match(/^[A-Z]{2,}\\d+/) ? word : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
      return \`\${primaryName} vs \${comparisonName}\`;
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
export const createLegendTitle = FieldMappingHelper.createLegendTitle.bind(FieldMappingHelper);`;

  return content;
}

// Write the generated files
console.log('\n📝 Writing field-aliases.ts...');
const aliasesContent = generateFieldAliases();
fs.writeFileSync(path.join(__dirname, '../utils/field-aliases.ts'), aliasesContent);

console.log('📝 Writing field-mapping-helper.ts...');
const helperContent = generateFieldMappingHelper();
fs.writeFileSync(path.join(__dirname, '../utils/visualizations/field-mapping-helper.ts'), helperContent);

console.log('\n✅ Field mapping files generated successfully!');
console.log(`   📄 field-aliases.ts: ${Object.keys(fieldData.field_categories).reduce((sum, cat) => sum + fieldData.field_categories[cat].length, 0)} field mappings`);
console.log(`   📄 field-mapping-helper.ts: ${allFields.length} display name mappings`);
console.log('\n💡 To regenerate these files in the future:');
console.log('   1. Run: node scripts/extract-all-fields.js');
console.log('   2. Run: node scripts/generate-field-mappings.js');