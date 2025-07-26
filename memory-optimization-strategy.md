# SHAP Microservice Memory Optimization Strategy

## Problem Statement
Current SHAP microservice runs out of memory when processing full datasets in production, limiting functionality to small sample sizes and preventing real-world usage.

## Root Causes
1. **SHAP Memory Intensity**: TreeExplainer with XGBoost requires ~10-50MB per sample for complex models
2. **Full Dataset Loading**: Loading entire dataset into memory simultaneously
3. **Batch Processing**: Processing all samples at once instead of streaming
4. **No Caching**: Recalculating SHAP values for repeated requests
5. **Memory Leaks**: Not properly releasing memory between requests

## Production Solutions

### 1. Streaming SHAP Processing (Immediate Fix)
**Implementation**: Process samples in small batches instead of all at once
```python
def calculate_shap_streaming(model, data, batch_size=50):
    total_samples = len(data)
    shap_values = []
    
    for i in range(0, total_samples, batch_size):
        batch = data[i:i+batch_size]
        batch_shap = explainer.shap_values(batch)
        shap_values.extend(batch_shap)
        
        # Force garbage collection
        gc.collect()
        
    return np.array(shap_values)
```

### 2. SHAP Value Pre-computation (Long-term Solution)
**Strategy**: Pre-calculate and cache SHAP values for all samples
- **Storage**: Use compressed pickle files or HDF5 format
- **Loading**: Load only relevant SHAP values for specific queries
- **Update**: Recalculate only when model changes

### 3. Memory-Optimized Explainer
**TreeExplainer Optimizations**:
```python
# Use feature_perturbation='tree_path_dependent' for lower memory
explainer = shap.TreeExplainer(
    model, 
    feature_perturbation='tree_path_dependent',
    check_additivity=False  # Skip expensive additivity checks
)
```

### 4. Intelligent Sampling Strategy
**Adaptive Sample Sizes**:
- Outlier detection: 100-200 samples sufficient
- Feature interactions: 500-1000 samples needed  
- Scenario analysis: 50-100 samples adequate
- Spatial clustering: 200-500 samples needed

### 5. Background Processing with Redis
**Architecture**:
- Accept request → Queue job in Redis
- Background worker processes SHAP calculations
- Return job ID → Client polls for results
- Cache results for 24 hours

## Implementation Priority

### Phase 1: Immediate Memory Fixes (1-2 days)
1. **Streaming batch processing** for all endpoints
2. **Adaptive sample sizes** based on endpoint type
3. **Explicit garbage collection** after each batch
4. **Memory monitoring** and limits per request

### Phase 2: Caching Infrastructure (3-5 days)
1. **Pre-compute SHAP values** for most common queries
2. **Redis caching** for intermediate results
3. **Compressed storage** of SHAP matrices
4. **Background job processing** for heavy operations

### Phase 3: Architecture Optimization (1-2 weeks)
1. **Separate SHAP service** with dedicated high-memory instances
2. **Model serving optimization** with ONNX or TensorRT
3. **Distributed processing** across multiple workers
4. **Smart feature selection** to reduce dimensionality

## Immediate Code Changes Needed

### 1. Add Memory Management Utilities
```python
import gc
import psutil
import numpy as np

def get_memory_usage():
    """Get current memory usage in MB"""
    process = psutil.Process()
    return process.memory_info().rss / 1024 / 1024

def batch_shap_calculation(explainer, X, batch_size=50, max_memory_mb=1000):
    """Calculate SHAP values in memory-safe batches"""
    results = []
    
    for i in range(0, len(X), batch_size):
        # Check memory before processing
        if get_memory_usage() > max_memory_mb:
            gc.collect()
            
        batch = X[i:i+batch_size]
        batch_shap = explainer.shap_values(batch)
        results.append(batch_shap)
        
        # Clean up after each batch
        del batch_shap
        gc.collect()
    
    return np.concatenate(results, axis=0)
```

### 2. Endpoint-Specific Memory Limits
```python
ENDPOINT_CONFIGS = {
    '/outlier-detection': {'max_samples': 200, 'batch_size': 50},
    '/scenario-analysis': {'max_samples': 100, 'batch_size': 25},
    '/spatial-clusters': {'max_samples': 300, 'batch_size': 75},
    '/segment-profiling': {'max_samples': 150, 'batch_size': 50},
    '/comparative-analysis': {'max_samples': 200, 'batch_size': 50},
}
```

### 3. Pre-computed SHAP Cache
```python
import joblib
from pathlib import Path

class SHAPCache:
    def __init__(self, cache_dir='shap_cache'):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
    
    def get_cached_shap(self, target_field, sample_hash):
        cache_file = self.cache_dir / f"{target_field}_{sample_hash}.pkl"
        if cache_file.exists():
            return joblib.load(cache_file)
        return None
    
    def cache_shap_values(self, target_field, sample_hash, shap_values):
        cache_file = self.cache_dir / f"{target_field}_{sample_hash}.pkl"
        joblib.dump(shap_values, cache_file, compress=3)
```

## Resource Requirements

### Current Render Limitations
- **Memory**: 512MB-1GB available
- **Processing**: Single worker process
- **Storage**: Limited disk space

### Recommended Infrastructure
- **Memory**: 4-8GB dedicated SHAP service
- **Processing**: 2-4 worker processes
- **Storage**: 10-20GB for SHAP value cache
- **Alternative**: AWS Lambda with 10GB memory limits

## Success Metrics
1. **Memory Usage**: Stay under 1GB for any single request
2. **Response Time**: < 30 seconds for production queries
3. **Reliability**: 99% success rate for all endpoints
4. **Cache Hit Rate**: > 80% for repeated queries

## Next Steps
1. Implement Phase 1 memory fixes immediately
2. Test with progressively larger sample sizes
3. Monitor memory usage patterns
4. Plan infrastructure upgrade for Phase 2

This strategy will enable production use with full datasets while maintaining reasonable response times and memory usage. 