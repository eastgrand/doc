# Comprehensive Endpoints Guide
**26 AI-Powered Analytics Endpoints with 17-Model Architecture**

## Overview

This guide provides comprehensive documentation for all 26 analytics endpoints powered by our advanced 17-model machine learning architecture. The system combines 6 specialized models, 8 algorithm variants, and 3 unsupervised learning models to deliver outstanding performance with an ensemble R² = 0.879 (87.9% variance explained).

## System Architecture

### Model Categories
- **🎯 Specialized Analysis Models (6)**: Strategic, competitive, demographic, correlation, predictive, ensemble
- **🤖 Algorithm Diversity Models (8)**: XGBoost, SVR, Random Forest, Linear Regression, KNN, Neural Network, Ridge, Lasso  
- **🧠 Unsupervised Learning Models (3)**: Clustering, anomaly detection, dimensionality reduction

### Performance Metrics
- **Ensemble Model**: R² = 0.879 (Outstanding Performance)
- **XGBoost**: R² = 0.608 (Strong Performance) 
- **SVR**: R² = 0.609 (Strong Performance)
- **Random Forest**: R² = 0.513 (Good Performance)

---

## Standard Endpoints (19)

### 1. Strategic Analysis
**Endpoint**: `/api/strategic-analysis`
**Purpose**: Strategic market analysis with investment scoring
**Primary Model**: Strategic Analysis Model

**Example Queries**:
```javascript
// Find top investment opportunities
GET /api/strategic-analysis?limit=10&sort=strategic_score

// Strategic analysis for specific regions
GET /api/strategic-analysis?state=FL&strategic_score_min=75

// Investment prioritization
GET /api/strategic-analysis?fields=strategic_score,investment_priority,market_potential
```

**Key Metrics**:
- `strategic_score` (0-100): Overall strategic value
- `investment_priority`: High/Medium/Low priority classification
- `market_potential`: Growth opportunity assessment
- `shap_values`: Feature importance explanations

### 2. Competitive Analysis
**Endpoint**: `/api/competitive-analysis`
**Purpose**: Brand competition analysis and market share insights
**Primary Model**: Competitive Analysis Model

**Example Queries**:
```javascript
// Market competition landscape
GET /api/competitive-analysis?limit=20&sort=competitive_score

// Brand performance analysis
GET /api/competitive-analysis?brand_presence=high&competitive_advantage_min=70

// Market share opportunities
GET /api/competitive-analysis?fields=competitive_score,market_share,brand_strength
```

**Key Metrics**:
- `competitive_score` (0-100): Competitive positioning strength
- `market_share`: Estimated market share percentage
- `brand_strength`: Brand presence evaluation
- `competitive_advantage`: Unique positioning score

### 3. Demographic Insights
**Endpoint**: `/api/demographic-insights`
**Purpose**: Demographic analysis and population insights
**Primary Model**: Demographic Analysis Model

**Example Queries**:
```javascript
// Population demographics analysis
GET /api/demographic-insights?sort=demographic_score&limit=15

// Target demographic identification
GET /api/demographic-insights?age_group=25-45&income_level=high

// Market segmentation by demographics
GET /api/demographic-insights?fields=demographic_score,population_density,age_distribution
```

**Key Metrics**:
- `demographic_score` (0-100): Demographic favorability
- `population_density`: People per square mile
- `age_distribution`: Age group breakdown
- `income_levels`: Income distribution analysis

### 4. Correlation Analysis
**Endpoint**: `/api/correlation-analysis`
**Purpose**: Statistical correlations and variable relationships
**Primary Model**: Correlation Analysis Model

**Example Queries**:
```javascript
// Strong correlations discovery
GET /api/correlation-analysis?correlation_strength_min=0.7

// Variable relationship analysis
GET /api/correlation-analysis?target_variable=MP10128A_B_P&fields=correlation_score,relationship_type

// Feature interaction patterns
GET /api/correlation-analysis?sort=correlation_score&statistical_significance=high
```

**Key Metrics**:
- `correlation_score` (0-100): Relationship strength
- `correlation_coefficient`: Statistical correlation value
- `relationship_type`: Positive/Negative/Neutral
- `statistical_significance`: P-value based significance

### 5. Predictive Modeling
**Endpoint**: `/api/predictive-modeling`
**Purpose**: Advanced forecasting and predictive analysis
**Primary Model**: Predictive Modeling

**Example Queries**:
```javascript
// Future trend predictions
GET /api/predictive-modeling?prediction_confidence_min=0.8

// Forecast accuracy analysis
GET /api/predictive-modeling?sort=predictive_score&fields=prediction,confidence_interval

// Scenario-based predictions
GET /api/predictive-modeling?scenario=growth&prediction_horizon=12_months
```

**Key Metrics**:
- `predictive_score` (0-100): Prediction reliability
- `prediction`: Forecasted value
- `confidence_interval`: Prediction uncertainty range
- `prediction_horizon`: Time frame for prediction

### 6. Trend Analysis
**Endpoint**: `/api/trend-analysis`
**Purpose**: Temporal patterns and trend identification
**Primary Model**: XGBoost

**Example Queries**:
```javascript
// Trending patterns identification
GET /api/trend-analysis?trend_strength=strong&sort=trend_score

// Temporal analysis
GET /api/trend-analysis?time_period=last_12_months&trend_direction=upward

// Pattern recognition
GET /api/trend-analysis?fields=trend_score,pattern_type,seasonality
```

**Key Metrics**:
- `trend_score` (0-100): Trend strength and reliability
- `trend_direction`: Upward/Downward/Stable
- `pattern_type`: Linear/Exponential/Cyclical
- `seasonality`: Seasonal pattern detection

### 7. Spatial Clusters
**Endpoint**: `/api/spatial-clusters`
**Purpose**: Geographic clustering and spatial patterns
**Primary Model**: Clustering (Unsupervised)

**Example Queries**:
```javascript
// Geographic cluster analysis
GET /api/spatial-clusters?cluster_quality=high&sort=cluster_score

// Spatial pattern discovery
GET /api/spatial-clusters?geographic_region=southeast&cluster_size_min=50

// Location-based segmentation
GET /api/spatial-clusters?fields=cluster_id,centroid_distance,spatial_density
```

**Key Metrics**:
- `cluster_score` (0-100): Cluster quality and cohesion
- `cluster_id`: Geographic cluster identifier
- `centroid_distance`: Distance from cluster center
- `spatial_density`: Geographic concentration measure

### 8. Anomaly Detection
**Endpoint**: `/api/anomaly-detection`
**Purpose**: Statistical outliers and anomaly identification
**Primary Model**: Anomaly Detection (Unsupervised)

**Example Queries**:
```javascript
// Outlier identification
GET /api/anomaly-detection?is_outlier=true&sort=anomaly_score

// Statistical deviation analysis
GET /api/anomaly-detection?anomaly_severity=high&confidence_min=0.9

// Pattern deviation detection
GET /api/anomaly-detection?fields=anomaly_score,deviation_type,statistical_significance
```

**Key Metrics**:
- `anomaly_score` (0-100): Anomaly strength
- `is_outlier`: Boolean outlier classification
- `deviation_type`: Statistical/Behavioral/Temporal
- `confidence`: Detection confidence level

### 9-19. Additional Standard Endpoints

**Other endpoints follow similar patterns**:
- **Scenario Analysis**: What-if scenarios and sensitivity analysis
- **Segment Profiling**: Market segmentation and customer profiling
- **Sensitivity Analysis**: Parameter sensitivity and impact analysis
- **Feature Interactions**: Variable interactions and feature combinations
- **Feature Importance Ranking**: Feature importance rankings and contributions
- **Model Performance**: ML model metrics and performance evaluation
- **Outlier Detection**: Data outliers and exceptional cases
- **Analyze**: General comprehensive analysis
- **Comparative Analysis**: Geographic and demographic comparisons
- **Brand Difference**: Brand differential analysis and positioning
- **Customer Profile**: Customer profiling and segmentation analysis

---

## 🆕 Comprehensive Model Endpoints (7)

### 20. Algorithm Comparison
**Endpoint**: `/api/algorithm-comparison`
**Purpose**: Performance comparison across 8 supervised algorithms
**Primary Model**: Ensemble + All Algorithm Models

**Example Queries**:
```javascript
// Algorithm performance benchmarking
GET /api/algorithm-comparison?best_algorithm=ensemble&sort=algorithm_performance_score

// Model reliability analysis
GET /api/algorithm-comparison?model_agreement_min=0.8&consensus_quality=high

// Performance comparison matrix
GET /api/algorithm-comparison?fields=algorithm_predictions,performance_metrics,reliability_scores
```

**Key Metrics**:
- `algorithm_performance_score` (0-100): Overall algorithm performance
- `algorithm_predictions`: Predictions from each of 8 algorithms
- `best_algorithm`: Top-performing algorithm for this data point
- `consensus_prediction`: Weighted average prediction
- `model_agreement_score`: Inter-algorithm agreement level
- `performance_metrics`: R² scores for each algorithm

**Unique Features**:
- Real-time algorithm benchmarking
- Performance confidence intervals
- Algorithm-specific reliability scores

### 21. Ensemble Analysis
**Endpoint**: `/api/ensemble-analysis`  
**Purpose**: Deep analysis with outstanding ensemble model (R² = 0.879)
**Primary Model**: Ensemble Model

**Example Queries**:
```javascript
// High-confidence ensemble predictions
GET /api/ensemble-analysis?ensemble_confidence_min=0.9&sort=ensemble_performance_score

// Component contribution analysis
GET /api/ensemble-analysis?component_analysis=detailed&prediction_interval=true

// Outstanding performance areas
GET /api/ensemble-analysis?performance_tier=outstanding&fields=ensemble_prediction,component_contributions
```

**Key Metrics**:
- `ensemble_performance_score` (0-100): Ensemble model performance
- `ensemble_prediction`: Best available prediction (R² = 0.879)
- `prediction_confidence`: Ensemble confidence level
- `component_contributions`: Individual model contributions
- `prediction_interval`: Upper and lower prediction bounds
- `ensemble_advantage`: Performance gain vs single models

**Unique Features**:
- 87.9% variance explanation capability
- Component-level analysis
- Uncertainty quantification

### 22. Model Selection
**Endpoint**: `/api/model-selection`
**Purpose**: Dynamic algorithm recommendations per geographic area
**Primary Model**: Ensemble + Performance Analysis

**Example Queries**:
```javascript
// Algorithm recommendations
GET /api/model-selection?recommendation_confidence=high&sort=model_selection_performance_score

// Geographic algorithm optimization
GET /api/model-selection?geographic_optimization=true&data_characteristics=analyzed

// Performance-based selection
GET /api/model-selection?expected_performance_min=0.6&interpretability=required
```

**Key Metrics**:
- `model_selection_performance_score` (0-100): Selection quality
- `recommended_algorithm`: Optimal algorithm for this area
- `alternative_algorithms`: Secondary algorithm options
- `selection_reasoning`: Why this algorithm was chosen
- `expected_performance`: Predicted R² for recommended algorithm
- `interpretability_score`: Algorithm explainability rating

**Unique Features**:
- Data-driven algorithm selection
- Geographic optimization
- Performance predictions

### 23. Cluster Analysis
**Endpoint**: `/api/cluster-analysis`
**Purpose**: Advanced market segmentation (8 clusters identified)
**Primary Model**: Clustering (Enhanced)

**Example Queries**:
```javascript
// Market segmentation analysis
GET /api/cluster-analysis?cluster_quality=high&sort=cluster_performance_score

// Segment profiling
GET /api/cluster-analysis?cluster_name=Urban_Professionals&profile_detail=comprehensive

// Cluster characteristics
GET /api/cluster-analysis?fields=cluster_profile,distance_to_centroid,segment_opportunities
```

**Key Metrics**:
- `cluster_performance_score` (0-100): Clustering quality
- `cluster_id`: Market segment identifier (0-7)
- `cluster_name`: Descriptive cluster name
- `cluster_profile`: Detailed segment characteristics
- `distance_to_centroid`: Fit within cluster
- `segment_size`: Number of areas in this cluster

**Identified Clusters**:
1. **Suburban Families**: Family-oriented suburban markets
2. **Urban Professionals**: High-income urban areas
3. **Rural Communities**: Traditional rural markets
4. **College Towns**: University-centered areas
5. **Retirement Areas**: Senior-focused communities
6. **High-Income Urban**: Premium urban markets
7. **Mixed Demographics**: Diverse population areas
8. **Emerging Markets**: Growth opportunity areas

### 24. Anomaly Insights
**Endpoint**: `/api/anomaly-insights`
**Purpose**: Enhanced anomaly detection (99 anomalies identified)
**Primary Model**: Anomaly Detection (Enhanced)

**Example Queries**:
```javascript
// High-opportunity anomalies
GET /api/anomaly-insights?opportunity_rating=high&sort=anomaly_performance_score

// Market deviation analysis
GET /api/anomaly-insights?anomaly_type=positive&investigation_priority=high

// Outlier opportunities
GET /api/anomaly-insights?strong_outlier=true&fields=opportunity_detection_score,market_value
```

**Key Metrics**:
- `anomaly_performance_score` (0-100): Overall anomaly analysis quality
- `anomaly_significance_score`: Statistical significance of deviation
- `opportunity_detection_score`: Business opportunity potential
- `anomaly_type`: Positive/Negative market deviation
- `opportunity_rating`: High/Medium/Low opportunity classification
- `investigation_priority_score`: Urgency of investigation needed

**Anomaly Categories**:
- **High-Opportunity Outlier**: Exceptional positive market signals
- **Positive Anomaly**: Above-expected performance areas
- **Market Deviation**: Unusual patterns requiring analysis
- **Normal Pattern**: Standard market behavior

### 25. Dimensionality Insights
**Endpoint**: `/api/dimensionality-insights`
**Purpose**: Feature space analysis (91.7% variance explained)
**Primary Model**: Dimensionality Reduction (PCA)

**Example Queries**:
```javascript
// Feature compression analysis
GET /api/dimensionality-insights?compression_efficiency=high&sort=dimensionality_performance_score

// Principal component analysis
GET /api/dimensionality-insights?component_significance=high&variance_explained_min=0.8

// Feature relationship analysis
GET /api/dimensionality-insights?relationship_strength=strong&fields=component_weights,feature_loadings
```

**Key Metrics**:
- `dimensionality_performance_score` (0-100): Overall dimensionality analysis
- `feature_compression_score`: Data compression efficiency
- `component_significance_score`: Principal component importance
- `component_weights`: PCA component contributions
- `feature_loadings`: Variable importance in components
- `variance_explained`: Total variance captured (up to 91.7%)

**Component Interpretations**:
- **Component 0**: Demographic-Economic Profile
- **Component 1**: Geographic-Market Factors
- **Component 2**: Consumer Behavior Patterns
- **Component 3**: Infrastructure-Accessibility
- **Component 4**: Cultural-Social Dynamics

### 26. Consensus Analysis
**Endpoint**: `/api/consensus-analysis`
**Purpose**: Multi-model consensus with uncertainty quantification
**Primary Model**: Ensemble + Multiple Algorithm Consensus

**Example Queries**:
```javascript
// High-consensus predictions
GET /api/consensus-analysis?model_agreement=high&sort=consensus_performance_score

// Multi-model analysis
GET /api/consensus-analysis?voting_consensus=strong&uncertainty=low

// Prediction reliability
GET /api/consensus-analysis?ensemble_included=true&fields=model_contributions,voting_results
```

**Key Metrics**:
- `consensus_performance_score` (0-100): Overall consensus quality
- `model_agreement_score`: Inter-model prediction agreement
- `consensus_confidence_score`: Confidence in consensus prediction
- `model_predictions`: Individual predictions from each model
- `voting_results`: Model voting outcomes
- `uncertainty_measures`: Statistical uncertainty quantification
- `consensus_quality`: Excellent/Good/Fair consensus classification

---

## Usage Examples by Business Use Case

### 🎯 Market Expansion Strategy
```javascript
// 1. Find high-opportunity markets
GET /api/strategic-analysis?strategic_score_min=80&investment_priority=high

// 2. Analyze competition in target areas
GET /api/competitive-analysis?competitive_advantage_min=70

// 3. Validate with ensemble model
GET /api/ensemble-analysis?ensemble_confidence_min=0.85
```

### 📊 Performance Benchmarking
```javascript
// 1. Algorithm performance comparison
GET /api/algorithm-comparison?performance_analysis=comprehensive

// 2. Model selection for different regions
GET /api/model-selection?geographic_optimization=true

// 3. Consensus validation
GET /api/consensus-analysis?model_agreement_min=0.8
```

### 🔍 Anomaly Investigation
```javascript
// 1. Identify high-opportunity anomalies
GET /api/anomaly-insights?opportunity_rating=high&anomaly_type=positive

// 2. Investigate market deviations
GET /api/anomaly-detection?is_outlier=true&confidence_min=0.9

// 3. Cluster analysis for context
GET /api/cluster-analysis?investigation_priority=high
```

### 📈 Predictive Planning
```javascript
// 1. Trend analysis for forecasting
GET /api/trend-analysis?trend_strength=strong&prediction_horizon=12_months

// 2. Predictive modeling validation
GET /api/predictive-modeling?prediction_confidence_min=0.8

// 3. Ensemble prediction confirmation
GET /api/ensemble-analysis?prediction_interval=true
```

---

## Advanced Query Parameters

### Common Parameters (All Endpoints)
- `limit`: Number of results to return (default: 100)
- `offset`: Results pagination offset
- `sort`: Sort field (usually the primary score field)
- `fields`: Comma-separated list of fields to return
- `format`: Response format (json, csv, geojson)

### Score-Based Filtering
- `[score_field]_min`: Minimum score threshold
- `[score_field]_max`: Maximum score threshold
- `performance_tier`: excellent/good/fair/poor

### Geographic Filtering
- `state`: State abbreviation (FL, CA, TX, etc.)
- `county`: County name
- `latitude_range`: Lat range for geographic bounds
- `longitude_range`: Lng range for geographic bounds
- `geographic_region`: northeast/southeast/midwest/southwest/west

### Model-Specific Filtering
- `algorithm`: Specific algorithm to analyze
- `model_type`: supervised/unsupervised/ensemble
- `confidence_min`: Minimum prediction confidence
- `ensemble_included`: Include ensemble model results

---

## Response Format

### Standard Response Structure
```json
{
  "success": true,
  "endpoint_name": "strategic-analysis",
  "endpoint_type": "standard",
  "analysis_type": "strategic",
  "model_architecture": "17-model-comprehensive",
  "generated_timestamp": "2024-01-15T10:30:00Z",
  "total_records": 979,
  "record_count": 50,
  "metadata": {
    "primary_model": "strategic_analysis",
    "include_shap": true,
    "sort_by": "strategic_score",
    "score_range": [0, 100]
  },
  "results": [
    {
      "ID": "12001",
      "DESCRIPTION": "Alachua County, FL",
      "strategic_score": 87.5,
      "investment_priority": "High",
      "market_potential": 92.3,
      "shap_values": {...},
      // Additional endpoint-specific fields
    }
  ],
  "scoring_summary": {
    "processed_records": 979,
    "average_score": 67.8,
    "high_performers": 145,
    "scoring_timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Comprehensive Endpoint Enhancements
Comprehensive endpoints include additional metadata:
```json
{
  "metadata": {
    "comprehensive_features": ["algorithm_predictions", "best_algorithm", "consensus_prediction"],
    "secondary_models": ["xgboost", "svr", "random_forest"],
    "model_architecture": "17-model-comprehensive"
  }
}
```

---

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

// Strategic analysis with filtering
const strategicAnalysis = await axios.get('/api/strategic-analysis', {
  params: {
    strategic_score_min: 75,
    state: 'FL',
    limit: 20,
    fields: 'strategic_score,investment_priority,shap_values'
  }
});

// Algorithm comparison for model selection
const algorithmComparison = await axios.get('/api/algorithm-comparison', {
  params: {
    performance_analysis: 'comprehensive',
    sort: 'algorithm_performance_score'
  }
});
```

### Python
```python
import requests

# Ensemble analysis for high-confidence predictions
response = requests.get('/api/ensemble-analysis', {
    'ensemble_confidence_min': 0.9,
    'sort': 'ensemble_performance_score',
    'limit': 10
})

data = response.json()
high_confidence_areas = data['results']
```

### curl
```bash
# Anomaly detection with opportunity focus
curl -X GET "/api/anomaly-insights?opportunity_rating=high&anomaly_type=positive&limit=5"

# Multi-model consensus analysis
curl -X GET "/api/consensus-analysis?model_agreement_min=0.8&ensemble_included=true"
```

---

## Best Practices

### 1. **Performance Optimization**
- Use `fields` parameter to limit response size
- Implement pagination with `limit` and `offset`
- Cache frequently accessed results
- Use appropriate score thresholds for filtering

### 2. **Model Selection Strategy**
- Start with `ensemble-analysis` for highest accuracy (R² = 0.879)
- Use `algorithm-comparison` to understand model performance variations
- Apply `model-selection` for geographic optimization
- Validate with `consensus-analysis` for critical decisions

### 3. **Business Intelligence Workflow**
```
1. Strategic Analysis → Identify opportunities
2. Competitive Analysis → Assess market position
3. Ensemble Analysis → Validate with best model
4. Anomaly Insights → Find exceptional cases
5. Consensus Analysis → Final validation
```

### 4. **Data Quality Assurance**
- Monitor `scoring_summary` for data quality metrics
- Use `confidence_min` parameters for high-stakes decisions
- Cross-validate important findings across multiple endpoints
- Review `shap_values` for model interpretability

---

## Troubleshooting

### Common Issues
1. **Empty Results**: Check score thresholds aren't too restrictive
2. **Timeout Errors**: Reduce `limit` parameter or add more specific filters
3. **Missing Fields**: Verify field names match endpoint documentation
4. **Low Confidence**: Consider using ensemble or consensus endpoints

### Performance Monitoring
- Monitor response times for optimization opportunities
- Track score distributions for data quality
- Review model agreement scores for reliability
- Use comprehensive endpoints for critical business decisions

---

## Conclusion

This comprehensive endpoint system provides unprecedented analytical capabilities through the integration of 17 specialized models. The combination of traditional analytics with cutting-edge ensemble methods (87.9% accuracy) and advanced features like consensus analysis and algorithm selection makes this system ideal for sophisticated business intelligence applications.

For support or additional customization, refer to the model training documentation or contact the development team.

**System Status**: Production Ready ✅  
**Model Performance**: Outstanding (R² = 0.879) ⭐  
**Endpoints Available**: 26 (19 Standard + 7 Comprehensive) 🚀

---

## Endpoint Reference Table

| Endpoint Name | Primary Model | Score Calculation Method | Example Business Question |
|---------------|---------------|--------------------------|---------------------------|
| **strategic-analysis** | Strategic Analysis Model | Investment potential weighted by market factors, growth indicators, and competitive positioning | "Which markets offer the highest ROI for expansion investment?" |
| **competitive-analysis** | Competitive Analysis Model | Market share potential × brand positioning strength × competitive advantage factors | "Where do we have the strongest competitive advantage against major rivals?" |
| **demographic-insights** | Demographic Analysis Model | Population favorability score based on target demographic alignment and density | "Which areas have the ideal demographic profile for our tax preparation services?" |
| **correlation-analysis** | Correlation Analysis Model | Statistical correlation strength weighted by significance and business relevance | "What demographic and economic factors most strongly predict tax service usage?" |
| **predictive-modeling** | Predictive Modeling | Future trend probability × prediction confidence × model accuracy (ensemble weighted) | "What will tax service demand look like in these markets over the next 2 years?" |
| **trend-analysis** | XGBoost Model | Temporal pattern strength × trend consistency × directional confidence | "Which markets show the strongest growth trends for online tax preparation?" |
| **spatial-clusters** | Clustering Model (K-Means) | Cluster cohesion score × geographic density × within-cluster similarity | "How should we segment markets for targeted marketing campaigns?" |
| **anomaly-detection** | Anomaly Detection Model | Statistical deviation magnitude × outlier significance × detection confidence | "Which markets are performing unexpectedly well or poorly compared to predictions?" |
| **scenario-analysis** | Ensemble Model | Scenario probability × impact magnitude × model consensus across conditions | "How would different economic scenarios affect performance in each market?" |
| **segment-profiling** | Clustering Model | Segment distinctiveness × profile clarity × business value potential | "What are the key characteristics of our most profitable customer segments?" |
| **sensitivity-analysis** | Random Forest Model | Parameter impact magnitude × sensitivity coefficient × business criticality | "Which factors have the biggest impact on tax service adoption rates?" |
| **feature-interactions** | XGBoost Model | Interaction effect strength × statistical significance × business interpretability | "How do income level and age interact to influence online tax service usage?" |
| **feature-importance-ranking** | Ensemble Model | SHAP value magnitude × model consensus × business relevance weighting | "What are the most important factors for predicting tax preparation success?" |
| **model-performance** | Ensemble Model | R² score × prediction accuracy × cross-validation performance × model stability | "How reliable are our predictions for each market segment?" |
| **outlier-detection** | Anomaly Detection Model | Outlier strength score × statistical significance × business opportunity potential | "Which markets are statistical outliers that deserve special investigation?" |
| **analyze** | Ensemble Model | Comprehensive analysis score combining multiple model outputs with business weights | "Give me a complete analytical overview of market opportunities and risks." |
| **comparative-analysis** | Ensemble Model | Relative performance scoring × comparative advantage × market positioning strength | "How do different geographic markets compare across all key performance metrics?" |
| **brand-difference** | Competitive Analysis Model | Brand differentiation score × market positioning × competitive gap analysis | "What makes our brand different from competitors in each market?" |
| **customer-profile** | Demographic Analysis Model | Customer fit score × profile match strength × lifetime value potential | "Which areas have customers that best match our ideal customer profile?" |
| **🆕 algorithm-comparison** | Ensemble + All 8 Algorithms | Algorithm performance weighted average × consensus strength × prediction reliability | "Which ML algorithm gives the most accurate predictions for each specific market?" |
| **🆕 ensemble-analysis** | Ensemble Model (R² = 0.879) | Ensemble confidence × component model agreement × prediction interval accuracy | "What are our highest-confidence predictions with the best available model?" |
| **🆕 model-selection** | Ensemble + Performance Analysis | Algorithm suitability × expected performance × interpretability × data characteristics | "What's the optimal ML algorithm to use for predictions in each geographic area?" |
| **🆕 cluster-analysis** | Enhanced Clustering (8 Clusters) | Cluster quality × segment distinctiveness × business value × market opportunity | "How should we segment markets into distinct customer groups for targeted strategies?" |
| **🆕 anomaly-insights** | Enhanced Anomaly Detection | Anomaly significance × opportunity potential × investigation priority × market value | "Which unusual market patterns represent the biggest business opportunities?" |
| **🆕 dimensionality-insights** | PCA (91.7% Variance Explained) | Feature compression efficiency × component significance × variance explanation × complexity reduction | "Which factors explain most of the variation in market performance?" |
| **🆕 consensus-analysis** | Multi-Model Consensus | Model agreement score × consensus confidence × uncertainty quantification × prediction reliability | "Where do all our models agree, and how confident should we be in those predictions?" |