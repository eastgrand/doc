# Nesto AI Flow Migration Plan

This document outlines the changes needed to align the AI flow in the Nesto project with the more refined implementation from the Popups project.

## Key Files Requiring Changes

1. `/components/geospatial-chat-interface.tsx`
2. `/lib/analytics/query-analysis.ts`
3. `/utils/visualization-factory.ts`
4. `/utils/feature-optimization.ts`
5. `/utils/visualization-handler.ts`
6. `/lib/query-classifier.ts`
7. `/lib/ml-query-classifier.ts`
8. `/lib/chat-query-handler.ts`

## Migration Tasks

### 1. Query Processing Pipeline

**Change Required**: Implement standardized processing steps and error handling.

**Implementation Details**:
```typescript
// Add to geospatial-chat-interface.tsx
const initialSteps: GeoProcessingStep[] = [
  { id: 'analyzing_query', message: 'Analyzing Query', status: 'pending' },
  { id: 'fetching_data', message: 'Fetching Data', status: 'pending' },
  { id: 'processing_data', message: 'Processing Data', status: 'pending' },
  { id: 'creating_visualization', message: 'Creating Visualization', status: 'pending' },
  { id: 'generating_analysis', message: 'Generating Analysis', status: 'pending' }
];

// Add processing step update helper
const updateProcessingStep = (stepId: string, status: ProcessingStepStatus, message?: string) => {
  setProcessingSteps(prev => prev.map(step => 
    step.id === stepId 
      ? { ...step, status, message: message || step.message } 
      : step
  ));
};
```

### 2. Query Classification and ML Analysis

**Change Required**: Implement ML-enhanced query classification system.

**Implementation Details**:
```typescript
// Add to lib/query-classifier.ts
export class QueryClassifier {
  private mlClassifier: MLQueryClassifier | null = null;

  async initializeML(enable: boolean, config?: MLClassifierConfig) {
    if (enable) {
      this.mlClassifier = new MLQueryClassifier(config);
    }
  }

  async classifyQuery(query: string): Promise<ClassificationResult> {
    // Try ML classification first
    if (this.shouldUseML()) {
      const mlResult = await this.mlClassifier?.classifyQuery(query);
      if (mlResult && this.isConfident(mlResult)) {
        return mlResult;
      }
    }
    
    // Fallback to pattern-based classification
    return this.classifyWithPatterns(query);
  }
}

// Add to lib/ml-query-classifier.ts
export class MLQueryClassifier {
  async classifyQuery(query: string): Promise<MLPrediction> {
    // ML-based classification implementation
  }
}
```

### 3. ConceptMap Implementation

**Change Required**: Update how concept maps are created and utilized in query analysis.

**Implementation Details**:
```typescript
// Add to lib/analytics/concept-map-utils.ts
export interface ConceptMap {
  [key: string]: {
    concept: string;
    canonical: string;
    subtype?: string;
    synonyms?: string[];
    layers?: string[];
  };
}

// Modify the geospatial-chat-interface.tsx handleSubmit function
const conceptMap: ConceptMap = Object.entries(layers).reduce((acc, [key, config]) => {
  if (!config) return acc;
  acc[key] = {
    concept: config.name || key,
    canonical: key,
    subtype: config.type,
    synonyms: config.metadata?.tags?.map(tag => tag.toLowerCase()) || [],
    layers: [key]
  };
  return acc;
}, {} as ConceptMap);
```

### 4. Layer Provider System

**Change Required**: Implement standardized layer provider system.

**Implementation Details**:
```typescript
// Add to utils/layer-providers/standard-layer-provider.ts
export class StandardLayerProvider {
  async createLayer(
    config: LayerConfig,
    query: string,
    options: { mapView: __esri.MapView | null }
  ): Promise<__esri.FeatureLayer> {
    // Implementation for creating and configuring layers
  }
}
```

### 5. Visualization Factory System

**Change Required**: Implement dynamic visualization factory.

**Implementation Details**:
```typescript
// Add to utils/visualization-factory.ts
export class DynamicVisualizationFactory {
  createVisualization(
    processedResults: ProcessedLayerResult[],
    analysis: AnalysisResult,
    options: VisualizationOptions
  ): Promise<VisualizationResult> {
    // Implementation for creating visualizations
  }
}
```

### 6. Feature Optimization

**Change Required**: Add feature optimization for analysis.

**Implementation Details**:
```typescript
// Add to utils/feature-optimization.ts
export async function optimizeAnalysisFeatures(
  features: any[],
  layerConfig: LayerConfig,
  context: AnalysisContext
): Promise<OptimizedFeatureResult> {
  // Implementation for optimizing features for analysis
}
```

### 7. Analysis Generation

**Change Required**: Implement standardized analysis generation.

**Implementation Details**:
```typescript
// Add to utils/analysis-generator.ts
export function generateAnalysisContent(
  visualizationResult: VisualizationResult,
  analysis: AnalysisResult,
  optimizedFeatures: OptimizedFeatureResult
): string {
  // Implementation for generating analysis content
}
```

## Implementation Strategy

1. Start with the query processing pipeline to establish the basic flow
2. Implement the ML-enhanced query classification system
3. Add the ConceptMap system for better query analysis
4. Implement the layer provider system for standardized layer creation
5. Add the visualization factory for dynamic visualizations
6. Implement feature optimization for better analysis
7. Add the analysis generation system

## Notes

- The migration focuses on maintaining the existing functionality while adopting the more refined architecture
- Each component is designed to be modular and replaceable
- Error handling and progress tracking are built into each step
- The system maintains backward compatibility with existing layer configurations
- Performance optimizations are included at each step of the process
- ML-based query classification is used as the primary classification method with pattern-based classification as fallback
- The system integrates with external ML services for enhanced query understanding 