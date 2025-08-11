# Field Mapping Automation

This document explains the automated field mapping system that keeps `field-aliases.ts` and `field-mapping-helper.ts` synchronized with actual project data.

## Overview

The field mapping system consists of two main files:

1. **`utils/field-aliases.ts`** - Maps natural language terms to technical field codes for query processing
2. **`utils/visualizations/field-mapping-helper.ts`** - Maps technical field codes to human-readable display names for UI

Both files are **auto-generated** from actual endpoint data to ensure they stay current with the project.

## Data Sources

### Primary Source: Endpoint Data Files
- Location: `/public/data/endpoints/*.json`
- Contains actual analysis results with real field names
- 25+ endpoint files covering all analysis types
- 132 unique fields discovered across 24,600+ records

### Secondary Source: Layer Configuration
- Location: `/config/layers.ts` 
- Used for additional context and display preferences
- Not the primary source of field definitions

## Automation Scripts

### 1. Field Extraction Script
**File:** `scripts/extract-all-fields.js`

**Purpose:** Discovers ALL unique fields from ALL endpoint data files

**Usage:**
```bash
node scripts/extract-all-fields.js
```

**Output:**
- Creates `/public/data/all-fields-analysis.json`
- Comprehensive catalog of all fields with metadata
- Categorizes fields by type (system, analysis_scores, mp_codes, etc.)

### 2. Field Mapping Generator
**File:** `scripts/generate-field-mappings.js`

**Purpose:** Generates both mapping files from the field analysis

**Usage:**
```bash
node scripts/generate-field-mappings.js
```

**Output:**
- Regenerates `utils/field-aliases.ts`
- Regenerates `utils/visualizations/field-mapping-helper.ts`
- Includes all discovered fields with appropriate mappings

## Field Categories

The system automatically categorizes fields into:

### System Fields
- `OBJECTID`, `ID`, `DESCRIPTION`
- `Shape__Area`, `Shape__Length`
- `CreationDate`, `Creator`, `EditDate`, `Editor`
- `thematic_value`

### Analysis Score Fields (45 types)
- All fields ending in `_score`
- Examples: `strategic_value_score`, `correlation_score`, `anomaly_detection_score`
- These maintain consistent naming across projects

### MP Codes (Current Project)
- Format: `MP10XXXa_b` and `MP10XXXa_b_p`
- Examples: `MP10104A_B`, `MP10104A_B_P`
- Project-specific data fields

### X Codes (Economic/Spending Data)  
- Format: `X14XXX_x` and `X14XXX_x_a`
- Examples: `X14058_X`, `X14058_X_A`
- Economic indicator fields

### Generation Demographics
- `GENALPHACY`, `GENALPHACY_P` (Generation Alpha)
- `GENZ_CY`, `GENZ_CY_P` (Generation Z)

### Location Fields
- `LATITUDE`, `LONGITUDE`, `address`, `region`, etc.
- Geographic and address information

## Maintenance Process

### When to Regenerate
1. **New endpoints added** to `/public/data/endpoints/`
2. **Field names change** in backend data
3. **New analysis types** introduce new fields
4. **Project data structure updates**

### Regeneration Steps
1. **Extract fields:**
   ```bash
   node scripts/extract-all-fields.js
   ```

2. **Generate mappings:**
   ```bash
   node scripts/generate-field-mappings.js
   ```

3. **Verify results:**
   - Check generated files for accuracy
   - Test field name resolution in UI
   - Validate popup and legend displays

### Adding to Automation Pipeline
Add to your deployment/update scripts:

```bash
#!/bin/bash
echo "🔄 Updating field mappings..."

# Extract all fields from current endpoint data
node scripts/extract-all-fields.js

# Regenerate mapping files
node scripts/generate-field-mappings.js

echo "✅ Field mappings updated"
```

## Custom Field Names

### System-Generated Names
The automation creates display names using these rules:

1. **Score Fields:** `strategic_value_score` → "Strategic Value Score"
2. **MP Codes:** `MP10104A_B_P` → "MP10104 Percentage"  
3. **X Codes:** `X14058_X_A` → "X14058 Average Spending"
4. **Demographics:** `GENALPHACY_P` → "Generation Alpha Percentage"

### Manual Overrides
To customize display names, edit the `createDisplayName()` function in `scripts/generate-field-mappings.js`:

```javascript
// Add custom mappings
const customMappings = {
  'MP10104A_B': 'Custom Field Name',
  'X14058_X': 'Specific Spending Category'
};

if (customMappings[fieldName]) {
  return customMappings[fieldName];
}
```

## Field Usage Patterns

### Natural Language Aliases
The system creates multiple aliases for each field:

```javascript
// MP10104A_B gets aliases:
"mp10104a_b": "MP10104A_B",
"mp10104": "MP10104A_B",

// strategic_value_score gets aliases:  
"strategic value score": "strategic_value_score",
"strategic value": "strategic_value_score",
"strategic score": "strategic_value_score"
```

### Query Processing Flow
1. User types: "show me strategic value"
2. `FIELD_ALIASES` maps: "strategic value" → "strategic_value_score"
3. `FieldMappingHelper` displays: "Strategic Value Score"

## Troubleshooting

### Missing Fields
If fields don't appear in the UI:
1. Check if they exist in endpoint data: `public/data/endpoints/*.json`
2. Regenerate mappings: `node scripts/generate-field-mappings.js`
3. Verify field name spelling and case sensitivity

### Incorrect Display Names
1. Check `FIELD_CODE_TO_DISPLAY_NAME` in generated helper file
2. Add custom mapping in generator script
3. Regenerate files

### Performance Issues
- Field mappings are cached for performance
- 132 fields across 25 endpoints should not cause issues
- If needed, optimize lookup algorithms in `FieldMappingHelper`

## Integration Points

### Processors
All analysis processors should use fields from the comprehensive mapping:
```typescript
// In processor files
private getTopContributingFields(record: any): Record<string, number> {
  const fieldDefinitions = [
    { field: 'strategic_value_score', source: 'strategic_value_score', importance: 30 },
    { field: 'MP10104A_B_P', source: 'MP10104A_B_P', importance: 25 }
    // Use actual field names from endpoint data
  ];
}
```

### Popups and Legends
All UI components automatically use the comprehensive mapping:
```typescript
// Automatically gets "Strategic Value Score"
const displayName = FieldMappingHelper.getFriendlyFieldName('strategic_value_score');
```

## Benefits

1. **Always Current:** Mappings reflect actual project data
2. **Comprehensive:** Covers all 132+ fields across all endpoints  
3. **Consistent:** Same field always displays the same way
4. **Maintainable:** Single source of truth, automated updates
5. **Project-Agnostic:** Works for any dataset structure

## Future Enhancements

1. **Semantic Analysis:** Auto-detect field meanings from data patterns
2. **Business Context:** Integration with data dictionary/metadata
3. **Multilingual Support:** Generate mappings in multiple languages
4. **Field Relationships:** Map related fields (count vs percentage pairs)
5. **Validation:** Ensure all referenced fields actually exist in data