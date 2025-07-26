# Visualization Types Implementation Plan

## Overview

This document outlines the plan to expand the supported visualization types in the geospatial chat interface by integrating additional visualization classes from the `utils/visualizations` directory. The implementation will enhance the system's ability to respond to a wider range of query types with appropriate visualizations.

## Current State

The system currently has several visualization types defined in `config/dynamic-layers.ts`:

```typescript
export enum VisualizationType {
  CHOROPLETH = 'choropleth',
  HEATMAP = 'heatmap',
  SCATTER = 'scatter',
  CLUSTER = 'cluster',
  CATEGORICAL = 'categorical',
  TRENDS = 'trends',
  CORRELATION = 'correlation',
  JOINT_HIGH = 'joint_high',
  PROPORTIONAL_SYMBOL = 'proportional_symbol',
  COMPARISON = 'comparison'
}
```

However, the `DynamicVisualizationFactory` only implements a few of these types in the `createVisualization` method:
- CHOROPLETH (using SingleLayerVisualization)
- HEATMAP (using SingleLayerVisualization as fallback)
- CORRELATION (using CorrelationVisualization)
- JOINT_HIGH (using CorrelationVisualization as fallback)
- TRENDS (using SingleLayerVisualization as fallback)

The `utils/visualizations` directory contains many more specialized visualization types that could be integrated:
- aggregation-visualization.ts
- bivariate-visualization.ts
- buffer-visualization.ts
- choropleth-visualization.ts
- cluster-visualization.ts
- composite-visualization.ts
- density-visualization.ts
- flow-visualization.ts
- hexbin-visualization.ts
- hotspot-visualization.ts
- joint-visualization.ts
- multivariate-visualization.ts
- network-visualization.ts
- overlay-visualization.ts
- point-layer-visualization.ts
- proportional-symbol-visualization.ts
- proximity-visualization.ts
- spider-visualization.ts
- symbol3d-visualization.ts
- top-n-visualization.ts

## Implementation Plan

### Phase 1: Core Visualization Types Integration

#### Step 1: Add Direct Imports for Essential Visualization Classes

Update `DynamicVisualizationFactory.ts` to properly import and utilize more specialized visualization classes:

```typescript
async createVisualization(
  vizType: string, 
  layerId: string, 
  options: any = {}
): Promise<{ layer: __esri.FeatureLayer | null, extent: __esri.Extent | null }> {
  // Existing code...
  
  switch (visualizationType) {
    case VisualizationType.CHOROPLETH:
      const { ChoroplethVisualization } = await import("../utils/visualizations/choropleth-visualization");
      const viz = new ChoroplethVisualization();
      result = await viz.create(vizOptions);
      break;
      
    case VisualizationType.HEATMAP:
      const { DensityVisualization } = await import("../utils/visualizations/density-visualization");
      const heatViz = new DensityVisualization();
      result = await heatViz.create(vizOptions);
      break;
      
    case VisualizationType.SCATTER:
      const { PointLayerVisualization } = await import("../utils/visualizations/point-layer-visualization");
      const scatterViz = new PointLayerVisualization();
      result = await scatterViz.create(vizOptions);
      break;
      
    case VisualizationType.CLUSTER:
      const { ClusterVisualization } = await import("../utils/visualizations/cluster-visualization");
      const clusterViz = new ClusterVisualization();
      result = await clusterViz.create(vizOptions);
      break;
      
    case VisualizationType.PROPORTIONAL_SYMBOL:
      const { ProportionalSymbolVisualization } = await import("../utils/visualizations/proportional-symbol-visualization");
      const propViz = new ProportionalSymbolVisualization();
      result = await propViz.create(vizOptions);
      break;
      
    case VisualizationType.JOINT_HIGH:
      const { JointVisualization } = await import("../utils/visualizations/joint-visualization");
      const jointViz = new JointVisualization();
      result = await jointViz.create(vizOptions);
      break;
    
    // Add additional cases for all supported visualization types
    
    default:
      // Keep existing fallback
  }
  
  // Rest of the method...
}
```

#### Step 2: Add Advanced Visualization Types

Expand the VisualizationType enum in `config/dynamic-layers.ts`:

```typescript
export enum VisualizationType {
  // Existing types...
  BIVARIATE = 'bivariate',
  BUFFER = 'buffer',
  HEXBIN = 'hexbin',
  HOTSPOT = 'hotspot',
  MULTIVARIATE = 'multivariate',
  NETWORK = 'network',
  OVERLAY = 'overlay',
  PROXIMITY = 'proximity',
  SPIDER = 'spider',
  SYMBOL3D = 'symbol3d',
  TOP_N = 'top_n'
}
```

Then add corresponding metadata for each new type:

```typescript
export const visualizationTypesConfig: Record<VisualizationType, VisualizationTypeMetadata> = {
  // Existing types...
  
  [VisualizationType.BIVARIATE]: {
    label: 'Bivariate Map',
    description: 'Shows the relationship between two variables using a color matrix',
    requiresFields: 2,
    supportsGeometryTypes: ['polygon'],
    supportsLayerTypes: ['index', 'percentage', 'amount'],
    defaultSymbology: {
      colorScheme: 'custom',
      classes: 3
    },
    aiQueryPatterns: [
      'Show relationship between {field1} and {field2} using colors',
      'Bivariate map of {field1} and {field2}'
    ]
  },
  
  // Add metadata for each new visualization type...
}
```

#### Step 3: Update Switch Statement in DynamicVisualizationFactory

Enhance the switch statement in the `createVisualization` method to handle all visualization types:

```typescript
case VisualizationType.BIVARIATE:
  const { BivariateVisualization } = await import("../utils/visualizations/bivariate-visualization");
  const bivariateViz = new BivariateVisualization();
  result = await bivariateViz.create(vizOptions);
  break;

case VisualizationType.BUFFER:
  const { BufferVisualization } = await import("../utils/visualizations/buffer-visualization");
  const bufferViz = new BufferVisualization();
  result = await bufferViz.create(vizOptions);
  break;

// Add cases for all new visualization types
```

### Phase 2: Query Classification Enhancement

#### Step 1: Update Pattern Matching in QueryClassifier

Enhance the ML classifier to recognize patterns for all visualization types:

```typescript
// In lib/query-classifier.ts

private initializePatternMatchers(): void {
  // Existing patterns...
  
  this.patternMatchers.set(VisualizationType.BIVARIATE, [
    /bivariate (\w+) and (\w+)/i,
    /two variables (\w+) and (\w+)/i,
    /color matrix of (\w+) and (\w+)/i
  ]);
  
  this.patternMatchers.set(VisualizationType.BUFFER, [
    /buffer (around|near) (\w+)/i,
    /distance from (\w+)/i,
    /within (\d+) (miles|kilometers|meters) of (\w+)/i
  ]);
  
  // Add patterns for other visualization types...
}
```

#### Step 2: Update Keyword Matching in QueryClassifier

```typescript
private extractKeywords(type: VisualizationType): string[] {
  switch (type) {
    // Existing cases...
    
    case VisualizationType.BIVARIATE:
      return ['bivariate', 'two variables', 'color matrix', 'dual', 'color scheme'];
      
    case VisualizationType.BUFFER:
      return ['buffer', 'distance', 'around', 'near', 'within', 'proximity'];
      
    // Add cases for other visualization types...
  }
}
```

### Phase 3: ML/xgboost Integration

While the codebase doesn't currently reference xgboost/shap, we can design an integration plan:

#### Step 1: Create a Microservice Client

```typescript
// In utils/ml-services/xgboost-client.ts

export interface XGBoostRequest {
  features: Record<string, any>[];
  target?: string;
  config?: {
    maxDepth?: number;
    learningRate?: number;
    numRounds?: number;
  };
}

export interface XGBoostResponse {
  predictions: any[];
  shap?: {
    values: number[][];
    baseValue: number;
    featureNames: string[];
  };
  model?: any;
}

export class XGBoostClient {
  private readonly apiUrl: string;
  
  constructor(apiUrl: string = process.env.XGBOOST_API_URL || 'http://localhost:8000') {
    this.apiUrl = apiUrl;
  }
  
  async predict(request: XGBoostRequest): Promise<XGBoostResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling XGBoost service:', error);
      throw error;
    }
  }
  
  async getShapValues(request: XGBoostRequest): Promise<XGBoostResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/shap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error calling XGBoost SHAP service:', error);
      throw error;
    }
  }
}
```

#### Step 2: Create a SHAP Visualization Class

```typescript
// In utils/visualizations/shap-visualization.ts
import { BaseVisualization, BaseVisualizationData, VisualizationOptions, VisualizationResult } from './base-visualization';
import { XGBoostClient } from '../ml-services/xgboost-client';

export interface ShapVisualizationOptions extends VisualizationOptions {
  targetField: string;
  featureFields: string[];
  topFeatures?: number;
}

export interface ShapVisualizationData extends BaseVisualizationData {
  features: any[];
  layerName: string;
}

export class ShapVisualization extends BaseVisualization<ShapVisualizationData> {
  private xgboostClient: XGBoostClient;
  
  constructor(apiUrl?: string) {
    super();
    this.xgboostClient = new XGBoostClient(apiUrl);
  }
  
  async create(data: ShapVisualizationData, options: ShapVisualizationOptions): Promise<VisualizationResult> {
    this.validateData(data);
    
    // Extract features for ML
    const features = data.features.map(f => f.attributes || f.properties);
    
    // Get SHAP values
    const shapResponse = await this.xgboostClient.getShapValues({
      features,
      target: options.targetField,
      config: {
        maxDepth: 6,
        learningRate: 0.1,
        numRounds: 100
      }
    });
    
    // Process SHAP values to create visualization
    // ... implementation details ...
    
    return {
      layer: this.layer,
      extent: this.extent,
      legendInfo: this.getLegendInfo()
    };
  }
  
  getLegendInfo(): StandardizedLegendData {
    // Generate legend based on SHAP values
    // ... implementation details ...
    return {
      title: 'SHAP Feature Importance',
      type: 'categorical',
      items: []
    };
  }
}
```

#### Step 3: Integrate XGBoost with VisualizationType

Add SHAP analysis to the visualization types:

```typescript
export enum VisualizationType {
  // Existing types...
  SHAP = 'shap'
}

// Add metadata
[VisualizationType.SHAP]: {
  label: 'SHAP Analysis',
  description: 'Analyzes feature importance using SHAP values',
  requiresFields: 2, // At least one target and one feature
  supportsGeometryTypes: ['polygon', 'point'],
  supportsLayerTypes: ['index', 'percentage', 'amount'],
  defaultSymbology: {
    colorScheme: 'Blues',
    classes: 5
  },
  aiQueryPatterns: [
    'Analyze importance of factors affecting {target}',
    'Which variables affect {target} the most',
    'SHAP analysis of {target}'
  ]
}
```

### Phase 4: Testing and Integration

1. **Unit Testing**: Create tests for each visualization type to ensure they work correctly
2. **Integration Testing**: Test the visualizations within the geospatial chat interface
3. **Documentation**: Update documentation to include all supported visualization types
4. **User Feedback**: Implement a mechanism to collect feedback on visualization quality

## Implementation Priority

1. **High Priority**:
   - Choropleth (dedicated class)
   - Heatmap/Density (dedicated class)
   - Cluster (dedicated class)
   - Proportional Symbol
   - Top-N

2. **Medium Priority**:
   - Hexbin
   - Bivariate
   - Hotspot
   - Buffer
   - Proximity

3. **Lower Priority**:
   - Network
   - Spider
   - Flow
   - Symbol3D
   - SHAP integration

## Conclusion

This implementation plan provides a roadmap for integrating the rich set of visualization types available in the `utils/visualizations` directory into the dynamic layer system. By following this plan, the geospatial chat interface will gain the ability to respond to a wider range of query types with appropriate, specialized visualizations, improving the user experience and analytical capabilities of the system. 