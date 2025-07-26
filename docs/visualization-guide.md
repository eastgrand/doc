# Visualization Troubleshooting Guide

## Common Issues and Solutions

### 1. Data Consistency Between Analysis and Visualization

#### Problem: Analysis Results Don't Match Visualization
This occurs when different components use different data sources or fields for the same visualization.

**Example:**
- Analysis shows: ZIP code 92352 with $90,561
- Visualization shows: ZIP code 95141 with $200,001

#### Solution Steps:
1. Check Field Sources:
   ```typescript
   // Check layer configuration
   const layerConfig = layers[layer.layerId];
   const primaryField = layerConfig.rendererField;  // e.g., 'MEDDI_CY'
   ```

2. Verify Data Access Methods:
   ```typescript
   // Incorrect: Inconsistent field access
   const value1 = feature.properties?.rendererField;  // Analysis
   const value2 = feature.attributes[primaryField];   // Visualization

   // Correct: Consistent field access
   const value = feature.properties[layerConfig.rendererField];
   ```

3. Ensure Sorting Consistency:
   ```typescript
   // Sort using the same field and order in both places
   const sortedFeatures = features.sort((a, b) => 
     b.properties[primaryField] - a.properties[primaryField]  // Descending
   );
   ```

### 2. Data Format Validation

#### Problem: Missing or Invalid Values
Features might be filtered out due to invalid data or missing fields.

#### Solution Steps:
1. Add Validation Logging:
   ```typescript
   console.log('Feature validation:', {
     totalFeatures: features.length,
     field: primaryField,
     sampleFeature: {
       properties: features[0]?.properties,
       attributes: features[0]?.attributes,
       sampleValue: features[0]?.properties?.[primaryField]
     }
   });
   ```

2. Implement Robust Validation:
   ```typescript
   const validFeatures = features.filter(feature => {
     const value = feature.properties?.[primaryField];
     const isValid = typeof value === 'number' && isFinite(value);
     if (!isValid) {
       console.log('Invalid feature:', {
         value,
         type: typeof value,
         properties: feature.properties
       });
     }
     return isValid;
   });
   ```

### 3. Geometry Processing

#### Problem: Features Missing from Map
Features might not appear due to invalid geometry or conversion issues.

#### Solution Steps:
1. Validate Geometry:
   ```typescript
   const validateGeometry = (feature) => {
     const g = feature.geometry;
     if (!g || !g.coordinates || !Array.isArray(g.coordinates)) {
       console.warn('Invalid geometry');
       return false;
     }
     return true;
   };
   ```

2. Handle Different Geometry Types:
   ```typescript
   const processGeometry = (geometry) => {
     let rings = [];
     if (Array.isArray(geometry.coordinates[0][0])) {
       rings = geometry.coordinates[0];
     } else if (Array.isArray(geometry.coordinates[0])) {
       rings = [geometry.coordinates];
     }
     return rings;
   };
   ```

### 4. Data Flow Tracing

#### Problem: Unclear Where Data Transformation Occurs
Multiple components might modify data, making it hard to track changes.

#### Solution Steps:
1. Add Stage Logging:
   ```typescript
   console.log('=== Analysis Sorting ===', {
     stage: 'pre-sort',
     features: features.slice(0, 3).map(f => ({
       value: f.properties[primaryField],
       description: f.properties.DESCRIPTION
     }))
   });
   ```

2. Track Data Through Pipeline:
   ```typescript
   // 1. Initial data
   console.log('Input features:', /* ... */);
   
   // 2. After validation
   console.log('Valid features:', /* ... */);
   
   // 3. After sorting
   console.log('Sorted features:', /* ... */);
   
   // 4. Final visualization data
   console.log('Created Graphics:', /* ... */);
   ```

### 5. Configuration Management

#### Problem: Inconsistent Layer Configuration
Different components might use different layer configurations.

#### Solution Steps:
1. Centralize Configuration:
   ```typescript
   // config/layers.ts
   export const layers = {
     disposableIncome: {
       id: 'disposableIncome',
       rendererField: 'MEDDI_CY',
       fields: [/* ... */]
     }
   };
   ```

2. Use Configuration Consistently:
   ```typescript
   // Always get configuration from central source
   const { layers } = exportLayerConfig();
   const layerConfig = layers[layerId];
   ```

## Best Practices

1. **Data Consistency**
   - Always use layer configuration for field names
   - Maintain consistent data access patterns
   - Use the same sorting logic across components

2. **Validation**
   - Validate both data and geometry
   - Log invalid features for debugging
   - Include sample values in logs

3. **Logging**
   - Log at each major transformation stage
   - Include sample data in logs
   - Track feature counts through the pipeline

4. **Error Handling**
   - Provide clear error messages
   - Include context in error logs
   - Fail gracefully with invalid data

5. **Testing**
   - Test with various data formats
   - Verify sorting consistency
   - Validate geometry processing

## Common Visualization Types

### TopN Visualization
- Uses consistent field from layer configuration
- Sorts features in descending order
- Preserves rank information in graphics

### Bivariate Visualization (formerly Correlation)
- Shows relationships between two dependent variables
- Uses 3x3 color matrix (low/med/high for each variable)
- Replaces problematic normalized difference calculation
- No microservice dependency

### Difference Visualization
- Shows normalized difference between two compatible variables
- Uses red/blue diverging color scheme
- Handles brand comparison queries (Nike vs Adidas)
- Calculates meaningful differences for similar units

### Distribution Visualization
- Shows patterns across all features
- Uses classification breaks
- Handles continuous data

### Correlation Visualization
- Compares two or more fields
- Calculates relationships
- Shows patterns between variables

## Debugging Checklist

1. [ ] Verify layer configuration is correct
2. [ ] Check field access methods are consistent
3. [ ] Validate feature data and geometry
4. [ ] Confirm sorting logic is consistent
5. [ ] Review logs at each transformation stage
6. [ ] Test with sample data
7. [ ] Verify final visualization output 