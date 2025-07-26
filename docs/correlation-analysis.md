# Correlation Analysis Documentation

## Overview
The correlation analysis system provides tools for analyzing relationships between variables across geographic areas. It supports multiple correlation methods, spatial statistics, and visualization types.

## Features

### Correlation Methods
- **Pearson's r**: Standard linear correlation coefficient
- **Spearman's rho**: Non-parametric rank correlation
- **Kendall's tau**: Non-parametric rank correlation with better handling of ties
- **Spatial Statistics**: Moran's I and Getis-Ord G* for spatial autocorrelation

### Visualization Types
1. **Combined**: Shows overall correlation strength
   - Red: Strong negative correlation
   - White: No correlation
   - Green: Strong positive correlation

2. **Primary Variable**: Shows values of the primary variable
   - Color gradient based on value distribution

3. **Comparison Variable**: Shows values of the comparison variable
   - Color gradient based on value distribution

4. **Local Correlation**: Shows correlation strength at each location
   - Considers neighboring features
   - Useful for identifying local patterns

5. **Hot/Cold Spots**: Identifies statistically significant clusters
   - Red: Hot spots (high values)
   - Blue: Cold spots (low values)
   - White: No significant clustering

6. **Outliers**: Identifies spatial outliers
   - Purple: Outliers
   - White: Normal values

## Performance Optimizations
- **Caching**: Results are cached to avoid redundant calculations
- **Batch Processing**: Large datasets are processed in chunks
- **Spatial Indexing**: Uses spatial indices for efficient neighbor queries

## API Reference

### CorrelationService
```typescript
class CorrelationService {
  // Calculate correlation between two fields
  static calculateCorrelation(
    layer: FeatureLayer,
    primaryField: string,
    comparisonField: string,
    options?: CorrelationOptions
  ): Promise<CorrelationResult>

  // Update layer visualization
  static updateLayerRenderer(
    layer: FeatureLayer,
    visualizationType: VisualizationType,
    primaryField: string,
    comparisonField: string
  ): Promise<void>

  // Cache management
  static clearCache(): void
  static removeFromCache(
    layer: FeatureLayer,
    primaryField?: string,
    comparisonField?: string
  ): void
}
```

### Types
```typescript
interface CorrelationResult {
  pearson: number;
  spearman?: number;
  kendall?: number;
  moransI?: number;
  getisOrdG?: number;
  pValue: number;
  confidenceInterval: [number, number];
  sampleSize: number;
  spatialStatistics?: {
    hotSpots: number;
    coldSpots: number;
    outliers: number;
  };
}

type VisualizationType = 
  | 'combined'
  | 'primary'
  | 'comparison'
  | 'local'
  | 'hotspots'
  | 'outliers';
```

## Usage Examples

### Basic Correlation Analysis
```typescript
const result = await CorrelationService.calculateCorrelation(
  layer,
  'population',
  'income'
);
```

### Advanced Analysis with Options
```typescript
const result = await CorrelationService.calculateCorrelation(
  layer,
  'population',
  'income',
  {
    method: 'all',
    includeSpatialStats: true,
    confidenceLevel: 0.95
  }
);
```

### Updating Visualization
```typescript
await CorrelationService.updateLayerRenderer(
  layer,
  'hotspots',
  'population',
  'income'
);
```

## Best Practices
1. Use appropriate correlation method based on data characteristics
2. Consider spatial autocorrelation when interpreting results
3. Use caching for repeated analyses
4. Clear cache when underlying data changes
5. Use appropriate visualization type for the analysis goal 