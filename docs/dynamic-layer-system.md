# Dynamic Layer System

## Overview

The Dynamic Layer System provides a flexible, decoupled approach to handling geospatial data visualization. It separates layer configuration from visualization logic and introduces a registry system that allows for dynamic query-to-visualization mapping.

## Key Components

### 1. Configuration (`config/dynamic-layers.ts`)

This defines the core system interfaces and enums:

- **VisualizationType Enum**: Defines all supported visualization types
- **Layer Provider Interfaces**: Standardized interfaces for all layer providers
- **Layer Registry**: Central registry for managing layer metadata and visualization capabilities

```typescript
// Example: Visualization Type Enum
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

### 2. Visualization Factory (`lib/DynamicVisualizationFactory.ts`)

The factory is responsible for:

- Creating visualizations based on analysis types and layer data
- Mapping analysis types to appropriate visualization types
- Initializing with map view and managing visualization lifecycle

```typescript
// Example: Creating a visualization
const result = await factory.createVisualization(
  analysisType,
  layerId,
  vizOptions
);
```

### 3. Query Classifier (`lib/query-classifier.ts`)

This component:

- Classifies arbitrary user queries into appropriate visualization types
- Uses pattern matching and keyword detection
- Enhances analysis results with visualization-specific information

```typescript
// Example: Classifying a query
const visualizationType = classifyQuery("Show correlation between income and education");
// Returns VisualizationType.CORRELATION
```

### 4. Visualization Handler (`components/geospatial/visualization-handler.ts`)

The handler:

- Coordinates the visualization creation process
- Prepares visualization options from analysis results
- Manages visualization layer display on the map

### 5. Enhanced Types (`components/geospatial/enhanced-analysis-types.ts`)

Provides type definitions that extend core types with visualization-specific properties.

## Integration

The system is integrated with the main geospatial chat interface via:

1. **Factory Initialization**: The factory is initialized with the map view when the component mounts
2. **Layer Registry**: The registry is populated with existing layer configurations
3. **Visualization Handler**: The handler function replaces direct visualization creation
4. **Query Classification**: Queries are classified to determine the appropriate visualization type

## Benefits

- **Adaptability**: The system adapts to queries rather than forcing queries to fit predefined patterns
- **Modularity**: Components are loosely coupled, making the system more maintainable
- **Extensibility**: New visualization types can be added without modifying existing code
- **Discoverability**: Layer capabilities are registered and discoverable at runtime

## Usage Examples

### 1. Classifying a Query

```typescript
import { classifyQuery } from '../lib/query-classifier';

const query = "Show me areas with high income";
const visualizationType = classifyQuery(query);
// Returns VisualizationType.CHOROPLETH
```

### 2. Creating a Visualization

```typescript
import { VisualizationType } from '../config/dynamic-layers';

// Create visualization options
const vizOptions = {
  type: VisualizationType.CHOROPLETH,
  fields: ['income'],
  query: "Show me areas with high income"
};

// Create visualization
const result = await factory.createVisualization(
  VisualizationType.CHOROPLETH,
  'incomeLayer',
  vizOptions
);

// Access result
const { layer, extent } = result;
```

### 3. Enhancing Analysis Results

```typescript
import { enhanceAnalysisWithVisualization } from '../lib/query-classifier';

const analysisResult = {
  intent: 'Show correlation',
  relevantLayers: ['incomeLayer', 'educationLayer'],
  relevantFields: ['income', 'education'],
  queryType: 'correlation',
  confidence: 0.9,
  explanation: 'Found correlation intent'
};

const enhanced = enhanceAnalysisWithVisualization(analysisResult);
// enhanced.visualizationType will be VisualizationType.CORRELATION
```

## Next Steps

1. **Additional Visualization Types**: Add more visualization types as needed
2. **Improved Pattern Matching**: Enhance query classification accuracy
3. **Caching and Performance**: Add caching for frequently used visualizations
4. **User Feedback**: Incorporate user feedback to improve visualization selection
5. **Documentation**: Maintain comprehensive documentation as the system evolves 