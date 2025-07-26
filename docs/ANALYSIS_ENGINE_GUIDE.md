# AnalysisEngine User Guide

> **Complete System Transformation**: The chaotic collection of 13 different managers has been replaced with a unified, powerful AnalysisEngine that provides direct access to all 16 analysis endpoints.

## 🎯 What Changed?

### Before: Chaotic Multi-Manager System
```
❌ 13 Different Managers: VisualizationManager, AILayerManager, QueryManager, etc.
❌ 5 Overlapping Visualization Components
❌ Static Data Loading from /data/microservice-export.json
❌ Only 1 Analysis Endpoint (/analyze)
❌ Unreliable Query Classification → Visualization Selection
```

### After: Unified AnalysisEngine
```
✅ Single AnalysisEngine with 5 Specialized Modules
✅ One Unified AnalysisVisualization Component
✅ Dynamic Calls to All 16 Microservice Endpoints
✅ Direct Endpoint → Visualization Mapping (100% Reliable)
✅ Intelligent Endpoint Routing Based on Query Analysis
```

## 🚀 Quick Start

### Basic Analysis
```typescript
import { useAnalysisEngine } from '@/lib/analysis';

function MyComponent() {
  const { executeAnalysis, isProcessing, currentAnalysis } = useAnalysisEngine();

  const handleQuery = async (query: string) => {
    const result = await executeAnalysis(query);
    console.log('Analysis result:', result);
  };

  return (
    <div>
      <button onClick={() => handleQuery('show me clusters')}>
        Analyze Clusters
      </button>
      {isProcessing && <div>Processing...</div>}
      {currentAnalysis && <div>Results: {currentAnalysis.records.length} records</div>}
    </div>
  );
}
```

### Advanced Analysis with Endpoint Selection
```typescript
const result = await executeAnalysis('compare nike vs adidas', {
  endpoint: '/competitive-analysis',  // Force specific endpoint
  targetVariable: 'MP30034A_B',      // Override target variable
  sampleSize: 5000                   // Set sample size
});
```

## 📊 Available Analysis Endpoints

### Core Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/analyze` | General analysis with rankings | Need overall performance insights |
| `/correlation-analysis` | Statistical relationships | Want to understand variable relationships |
| `/threshold-analysis` | Performance vs benchmarks | Need to measure against targets |
| `/feature-interactions` | Variable interaction analysis | Understanding complex relationships |

### Geographic Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/spatial-clusters` | Find similar areas | Want to group similar locations |
| `/anomaly-detection` | Identify unusual patterns | Looking for outliers or anomalies |

### Competitive Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/competitive-analysis` | Brand comparison | Comparing brand performance |
| `/market-risk` | Risk assessment | Evaluating market vulnerabilities |
| `/penetration-optimization` | Growth opportunities | Finding expansion opportunities |

### Demographic Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/demographic-insights` | Population analysis | Understanding customer demographics |
| `/segment-profiling` | Customer segmentation | Profiling different customer groups |

### Temporal Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/trend-analysis` | Time-based patterns | Analyzing trends over time |
| `/scenario-analysis` | What-if modeling | Testing different scenarios |

### Advanced Analysis
| Endpoint | Description | Use When |
|----------|-------------|----------|
| `/predictive-modeling` | Future predictions | Forecasting future performance |
| `/outlier-detection` | Statistical outliers | Finding unusual data points |
| `/comparative-analysis` | Multi-variable comparison | Comparing multiple variables |

## 🎛️ Endpoint Selection

### Automatic Endpoint Selection
The system automatically selects the best endpoint based on your query:

```typescript
await executeAnalysis('show me clusters');        // → /spatial-clusters
await executeAnalysis('compare nike vs adidas');  // → /competitive-analysis  
await executeAnalysis('what are the risks');      // → /market-risk
await executeAnalysis('demographic trends');      // → /demographic-insights
```

### Manual Endpoint Selection
Use the endpoint selector in the interface:

1. **Click the gear icon** next to the Analyze button
2. **Browse endpoints by category**:
   - Core: General analysis operations
   - Geographic: Spatial analysis and clustering
   - Competitive: Brand comparison and positioning
   - Demographic: Population and customer analysis
   - Temporal: Time-based analysis
3. **Filter by keywords** or search functionality
4. **View complexity indicators** (Simple/Moderate/Advanced)
5. **See response time estimates**

### Endpoint Selection Tips
- **Start with `/analyze`** for general insights
- **Use `/spatial-clusters`** for location-based grouping
- **Choose `/competitive-analysis`** for brand comparisons
- **Select `/demographic-insights`** for customer analysis
- **Pick `/trend-analysis`** for temporal patterns

## 🎨 Visualization System

### Automatic Visualization Selection
Each endpoint automatically creates the most appropriate visualization:

| Endpoint | Visualization Type | Description |
|----------|-------------------|-------------|
| `/analyze` | Choropleth Map | Color-coded performance by area |
| `/spatial-clusters` | Cluster Map | Distinct colors for each cluster |
| `/competitive-analysis` | Multi-Symbol Map | Different symbols for each brand |
| `/correlation-analysis` | Bivariate Map | Two-variable relationship display |
| `/demographic-insights` | Categorical Map | Segment-based color coding |

### Advanced Visualization Features
- **Intelligent Color Classification**: Jenks, Quantile, or Equal Interval
- **Dynamic Legend Generation**: Automatically created for each analysis
- **Interactive Popups**: Rich information with drill-down capabilities
- **Performance Optimization**: Fast rendering for large datasets
- **Accessibility Support**: Color-blind friendly palettes

## 🔄 State Management

### Accessing Analysis State
```typescript
const {
  isProcessing,      // Boolean: Is analysis running?
  currentStep,       // String: Current processing step
  progress,          // Number: 0-100 completion percentage
  hasError,          // Boolean: Did an error occur?
  errorMessage,      // String: Error description if any
  lastQuery,         // String: Last executed query
  currentAnalysis,   // Object: Current analysis results
  currentVisualization, // Object: Current visualization config
  selectedEndpoint,  // String: Currently selected endpoint
  history           // Array: Analysis history
} = useAnalysisEngine();
```

### Event System
Listen to analysis lifecycle events:

```typescript
const { addEventListener } = useAnalysisEngine();

useEffect(() => {
  const unsubscribe = addEventListener('analysis-completed', (event) => {
    console.log('Analysis completed:', event.payload);
  });
  return unsubscribe;
}, []);
```

Available events:
- `analysis-started`: Analysis begins
- `analysis-completed`: Analysis finishes successfully
- `analysis-failed`: Analysis encounters an error
- `visualization-created`: Visualization is generated
- `state-updated`: Analysis state changes
- `endpoint-changed`: Selected endpoint changes

## ⚡ Performance Features

### Intelligent Caching
- **Automatic caching** of analysis results
- **Cache invalidation** when data changes
- **Configurable cache duration** per endpoint
- **Memory-efficient storage** with compression

### Request Optimization
- **Request batching** for multiple similar queries
- **Deduplication** of identical requests
- **Circuit breaker pattern** for failed endpoints
- **Automatic retry** with exponential backoff

### Error Recovery
- **Graceful degradation** when endpoints fail
- **Fallback strategies** for each analysis type
- **User-friendly error messages** with suggestions
- **Automatic recovery** when services restore

## 🛠️ Migration Guide

### From Old System
If you were using the old managers, here's how to migrate:

#### VisualizationManager → AnalysisEngine
```typescript
// OLD
const vizManager = new VisualizationManager();
const result = await vizManager.createVisualization(data);

// NEW
const { executeAnalysis } = useAnalysisEngine();
const result = await executeAnalysis(query);
// Visualization is automatically created
```

#### QueryManager → EndpointRouter
```typescript
// OLD
const queryManager = new QueryManager();
const endpoint = queryManager.classifyQuery(query);

// NEW
const { executeAnalysis } = useAnalysisEngine();
// Endpoint selection is automatic, or use endpoint option
const result = await executeAnalysis(query, { endpoint: '/specific-endpoint' });
```

#### AILayerManager → AnalysisEngine
```typescript
// OLD
const aiManager = new AILayerManager();
const analysis = await aiManager.processRequest(data);

// NEW
const { executeAnalysis } = useAnalysisEngine();
const result = await executeAnalysis(query);
// All AI processing is handled internally
```

### Component Updates
Update your components to use the new patterns:

```typescript
// OLD Pattern
import { VisualizationManager } from '@/components/VisualizationManager';
import { QueryManager } from '@/components/QueryManager';

// NEW Pattern
import { useAnalysisEngine } from '@/lib/analysis';
import AnalysisEndpointSelector from '@/components/analysis/AnalysisEndpointSelector';
```

## 🔧 Configuration

### Endpoint Configuration
Customize endpoint behavior in your configuration:

```typescript
const analysisEngine = new AnalysisEngine({
  apiUrl: 'https://your-microservice-url.com',
  defaultEndpoint: '/analyze',
  timeout: 30000,
  retryAttempts: 3,
  cacheEnabled: true,
  debugMode: process.env.NODE_ENV === 'development'
});
```

### Visualization Configuration
Customize visualization rendering:

```typescript
const result = await executeAnalysis(query, {
  visualizationType: 'choropleth',
  colorScheme: 'blue-to-red',
  classificationMethod: 'jenks',
  numClasses: 5
});
```

## 🐛 Troubleshooting

### Common Issues

#### Analysis Not Starting
- Check if `isProcessing` is already true
- Verify the query is not empty
- Ensure the selected endpoint is valid

#### Visualization Not Appearing
- Check if the analysis completed successfully
- Verify the map view is properly initialized
- Look for JavaScript console errors

#### Performance Issues
- Enable caching for repeated queries
- Reduce sample size for large datasets
- Use appropriate endpoints for your use case

#### Endpoint Selection Problems
- Use the endpoint selector to manually choose
- Check the query contains relevant keywords
- Verify the endpoint is available and responding

### Debug Mode
Enable debug mode for detailed logging:

```typescript
const { executeAnalysis } = useAnalysisEngine({
  debugMode: true
});
```

This will log:
- Endpoint selection reasoning
- Request/response timing
- Cache hit/miss information
- Visualization rendering steps

## 📈 Best Practices

### Query Writing
- **Be specific**: "Show clusters of similar demographics" vs "clusters"
- **Include context**: "Compare Nike vs Adidas in urban areas"
- **Use keywords**: Include terms like "risk", "trend", "compare", "cluster"

### Performance Optimization
- **Use appropriate sample sizes**: 1000-5000 for exploration, 10000+ for final analysis
- **Enable caching**: Especially for repeated queries
- **Choose specific endpoints**: When you know what analysis you want

### Error Handling
- **Always handle errors**: Check `hasError` and display `errorMessage`
- **Provide fallbacks**: Show cached results when new analysis fails
- **Guide users**: Suggest alternative endpoints or query modifications

## 🎓 Examples

### Example 1: Geographic Clustering
```typescript
const result = await executeAnalysis('find areas with similar demographics', {
  endpoint: '/spatial-clusters',
  sampleSize: 5000
});

// Result includes:
// - Cluster assignments for each area
// - Cluster characteristics and centroids
// - Automatic cluster visualization on map
```

### Example 2: Brand Competition
```typescript
const result = await executeAnalysis('compare Nike vs Adidas market share', {
  endpoint: '/competitive-analysis',
  targetVariable: 'MP30034A_B' // Nike
});

// Result includes:
// - Competitive positioning by area
// - Market share analysis
// - Multi-symbol visualization showing both brands
```

### Example 3: Risk Assessment
```typescript
const result = await executeAnalysis('identify high-risk markets', {
  endpoint: '/market-risk',
  sampleSize: 3000
});

// Result includes:
// - Risk scores by area
// - Risk factors and drivers
// - Risk gradient visualization with alerts
```

## 📚 Additional Resources

- [AnalysisEngine API Reference](./api-reference.md)
- [Visualization Guide](./visualization-guide.md)
- [Performance Optimization](./performance-guide.md)
- [Troubleshooting Guide](./troubleshooting.md)

---

*The AnalysisEngine represents a complete transformation from chaos to order, providing a reliable, scalable, and powerful analysis platform that replaces the previous collection of 13 different managers with a single, unified system.* 