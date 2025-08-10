# New Endpoints Specification - Comprehensive Model Architecture

## Overview

Based on our 17-model architecture, we can add 7 new powerful endpoints that leverage our algorithm diversity and unsupervised learning capabilities.

## New Endpoints

### 1. `algorithm-comparison.json`
**Purpose**: Compare performance across all 8 supervised algorithms

**Microservice Endpoint**: `POST /algorithm-comparison`

**Payload**:
```json
{
  "query": "Compare algorithm performance across all models",
  "analysis_type": "algorithm-comparison",
  "target_variable": "MP10128A_B_P",
  "include_shap": true,
  "include_confidence": true,
  "algorithms": ["xgboost", "random_forest", "svr", "linear_regression", "knn", "neural_network", "ridge_regression", "lasso_regression"]
}
```

**Expected Response Structure**:
```json
{
  "success": true,
  "analysis_type": "algorithm-comparison",
  "results": [
    {
      "ID": "M3H",
      "algorithm_predictions": {
        "xgboost": {"prediction": 15.2, "confidence": 0.91, "r2_score": 0.608},
        "svr": {"prediction": 15.1, "confidence": 0.89, "r2_score": 0.609},
        "random_forest": {"prediction": 14.8, "confidence": 0.85, "r2_score": 0.513}
      },
      "best_algorithm": "svr",
      "consensus_prediction": 15.0,
      "prediction_variance": 0.2,
      "algorithm_agreement": 0.94
    }
  ]
}
```

### 2. `ensemble-analysis.json`
**Purpose**: Deep analysis using our outstanding ensemble model (R² = 0.879)

**Microservice Endpoint**: `POST /ensemble-analysis`

**Payload**:
```json
{
  "query": "High-accuracy ensemble predictions and analysis",
  "analysis_type": "ensemble-analysis", 
  "target_variable": "MP10128A_B_P",
  "include_shap": true,
  "include_component_weights": true
}
```

**Expected Response Structure**:
```json
{
  "success": true,
  "analysis_type": "ensemble-analysis",
  "ensemble_performance": {"r2_score": 0.879, "rmse": 0.165, "mae": 0.121},
  "results": [
    {
      "ID": "M3H",
      "ensemble_prediction": 15.8,
      "prediction_confidence": 0.96,
      "component_contributions": {
        "xgboost": 0.25,
        "svr": 0.23,
        "random_forest": 0.18
      },
      "prediction_interval": {"lower": 14.2, "upper": 17.4},
      "ensemble_shap_explanation": {...}
    }
  ]
}
```

### 3. `model-selection.json`
**Purpose**: Dynamic algorithm recommendation based on data characteristics

**Microservice Endpoint**: `POST /model-selection`

**Payload**:
```json
{
  "query": "Recommend best algorithms for each geographic area",
  "analysis_type": "model-selection",
  "target_variable": "MP10128A_B_P",
  "include_performance_metrics": true
}
```

### 4. `cluster-analysis.json`
**Purpose**: Advanced clustering insights using our K-means model

**Microservice Endpoint**: `POST /cluster-analysis`

**Payload**:
```json
{
  "query": "Market segmentation through geographic clustering",
  "analysis_type": "cluster-analysis",
  "n_clusters": 8,
  "include_cluster_profiles": true,
  "include_silhouette_scores": true
}
```

**Expected Response Structure**:
```json
{
  "success": true,
  "analysis_type": "cluster-analysis",
  "cluster_summary": {
    "n_clusters": 8,
    "silhouette_score": 0.156,
    "cluster_distribution": {"0": 128, "1": 229, "2": 9}
  },
  "results": [
    {
      "ID": "M3H",
      "cluster_id": 1,
      "cluster_name": "High-Income Urban",
      "distance_to_centroid": 0.23,
      "cluster_profile": {
        "avg_income": 95000,
        "avg_population": 25000,
        "primary_characteristics": ["high_income", "urban", "educated"]
      }
    }
  ]
}
```

### 5. `anomaly-insights.json`
**Purpose**: Enhanced anomaly detection with detailed explanations

**Microservice Endpoint**: `POST /anomaly-insights`

**Payload**:
```json
{
  "query": "Identify market anomalies and opportunity outliers",
  "analysis_type": "anomaly-insights",
  "contamination": 0.1,
  "include_anomaly_explanations": true
}
```

**Expected Response Structure**:
```json
{
  "success": true,
  "analysis_type": "anomaly-insights",
  "anomaly_summary": {
    "total_outliers": 99,
    "outlier_ratio": 0.101,
    "positive_anomalies": 45,
    "negative_anomalies": 54
  },
  "results": [
    {
      "ID": "M3H", 
      "is_anomaly": true,
      "anomaly_score": -0.15,
      "anomaly_type": "positive",
      "anomaly_explanation": "Unusually high performance metrics relative to demographic profile",
      "opportunity_rating": "high"
    }
  ]
}
```

### 6. `dimensionality-insights.json`  
**Purpose**: Feature space analysis using our PCA model

**Microservice Endpoint**: `POST /dimensionality-insights`

**Payload**:
```json
{
  "query": "Analyze feature relationships and reduce dimensionality",
  "analysis_type": "dimensionality-insights", 
  "n_components": 10,
  "include_loadings": true
}
```

### 7. `consensus-analysis.json`
**Purpose**: Multi-model consensus predictions and uncertainty quantification

**Microservice Endpoint**: `POST /consensus-analysis`

**Payload**:
```json
{
  "query": "Multi-model consensus with uncertainty quantification",
  "analysis_type": "consensus-analysis",
  "target_variable": "MP10128A_B_P",
  "models": ["xgboost", "svr", "random_forest", "ensemble"],
  "include_voting": true,
  "include_uncertainty": true
}
```

## Implementation Priority

### High Priority (Immediate Value):
1. **ensemble-analysis.json** - Leverage our best model (R² = 0.879)
2. **cluster-analysis.json** - New segmentation insights
3. **anomaly-insights.json** - Identify opportunities and outliers

### Medium Priority (Algorithm Insights):
4. **algorithm-comparison.json** - Show algorithm diversity benefits  
5. **consensus-analysis.json** - Multi-model reliability

### Lower Priority (Advanced):
6. **model-selection.json** - Dynamic algorithm recommendations
7. **dimensionality-insights.json** - Feature space analysis

## Benefits

1. **Algorithm Diversity**: Shows the power of our 8-algorithm approach
2. **Outstanding Performance**: Highlights our ensemble model's 87.9% accuracy
3. **New Insights**: Unsupervised learning provides clustering and anomaly detection
4. **Uncertainty Quantification**: Multi-model consensus provides confidence measures
5. **Segmentation**: Advanced clustering for market segmentation
6. **Opportunity Detection**: Anomaly detection identifies hidden opportunities

## Total Endpoints After Addition

- **Current**: 19 endpoints
- **New**: 7 endpoints  
- **Total**: **26 comprehensive endpoints**

This represents a **37% increase** in analysis capabilities while leveraging our comprehensive 17-model architecture!