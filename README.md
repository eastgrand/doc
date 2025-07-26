# MPIQ AI Chat - Geospatial Analysis Platform

> **Major System Upgrade**: Unified AnalysisEngine architecture now provides direct access to all 16 analysis endpoints with intelligent routing and advanced visualizations.

## 🚀 What's New: AnalysisEngine Integration

### System Transformation
We've completely replaced the chaotic collection of 13 different managers with a unified, powerful **AnalysisEngine** that provides:

- **🎯 Direct Endpoint Access**: All 16 microservice endpoints available
- **🧠 Intelligent Routing**: Automatic endpoint selection based on query analysis  
- **🎨 Advanced Visualizations**: Specialized renderers for each analysis type
- **⚡ Performance Optimization**: Caching, batching, and error recovery
- **🔄 Unified State Management**: Single source of truth for all analysis operations

### Before vs After

| Old System | New AnalysisEngine |
|------------|-------------------|
| 13 different managers | Single AnalysisEngine |
| 5 overlapping visualization components | Unified AnalysisVisualization |
| Static data loading | Dynamic endpoint calls |
| 1 analysis endpoint | All 16 endpoints |
| Unreliable query classification | Direct endpoint mapping |

## 🏗️ Architecture

### Core Components
```
AnalysisEngine (Single Entry Point)
├── EndpointRouter          # Smart routing to 16 analysis endpoints
├── VisualizationRenderer   # Specialized renderers (Choropleth, Cluster, Competitive)
├── DataProcessor          # Standardized data processing
├── StateManager           # Centralized state management
└── ConfigurationManager   # Endpoint and visualization configs
```

### Available Analysis Endpoints

#### Core Analysis
- `/analyze` - General analysis with rankings and insights
- `/correlation-analysis` - Statistical relationships between variables
- `/threshold-analysis` - Performance against benchmarks
- `/feature-interactions` - Complex variable interactions

#### Geographic Analysis
- `/spatial-clusters` - Find areas with similar characteristics
- `/anomaly-detection` - Identify unusual geographic patterns

#### Competitive Analysis
- `/competitive-analysis` - Brand comparison and positioning
- `/market-risk` - Risk assessment by area
- `/penetration-optimization` - Growth opportunity identification

#### Demographic Analysis
- `/demographic-insights` - Deep population analysis
- `/segment-profiling` - Customer segmentation by area

#### Temporal Analysis
- `/trend-analysis` - Time-based pattern analysis
- `/scenario-analysis` - What-if scenario modeling

#### Advanced Analysis
- `/predictive-modeling` - Future performance forecasting
- `/outlier-detection` - Statistical outlier identification
- `/comparative-analysis` - Multi-variable comparisons

## 🎨 Visualization System

### Specialized Renderers
- **ChoroplethRenderer**: Color-coded geographic analysis
- **ClusterRenderer**: Categorical cluster visualization
- **CompetitiveRenderer**: Multi-brand comparison maps
- **BivariatRenderer**: Two-variable relationship display
- **RiskGradientRenderer**: Risk assessment visualization

### Features
- **Automatic visualization selection** based on analysis type
- **Intelligent color classification** (Jenks, Quantile, Equal Interval)
- **Dynamic legend generation** with interactive elements
- **Performance optimization** for large datasets
- **Accessibility support** with color-blind friendly palettes

## 🚀 Quick Start

### Basic Usage
```typescript
import { useAnalysisEngine } from '@/lib/analysis';

function MyComponent() {
  const { executeAnalysis, isProcessing, currentAnalysis } = useAnalysisEngine();

  const handleQuery = async (query: string) => {
    const result = await executeAnalysis(query);
    console.log('Analysis result:', result);
  };

  return (
    <button onClick={() => handleQuery('show me clusters')}>
      Analyze Clusters
    </button>
  );
}
```

### Advanced Usage
```typescript
const result = await executeAnalysis('compare nike vs adidas', {
  endpoint: '/competitive-analysis',  // Force specific endpoint
  targetVariable: 'MP30034A_B',      // Override target variable
  sampleSize: 5000                   // Set sample size
});
```

## 🎛️ User Interface

### Intelligent Endpoint Selection
- **Automatic suggestion** based on query keywords
- **Manual endpoint selector** with categories and descriptions
- **Real-time query analysis** for endpoint recommendations
- **Confidence scoring** for suggestion quality

### Query Examples
```
"show me clusters" → /spatial-clusters
"compare nike vs adidas" → /competitive-analysis
"what are the risks" → /market-risk
"demographic trends" → /demographic-insights
```
