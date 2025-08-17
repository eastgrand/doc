# Field Selection Optimization Analysis

Based on endpoints.csv, here are the optimization opportunities for better analysis-specific field selection:

## Current Issues
- All endpoints currently use similar fields (MP10104A_B_P, thematic_value, GENALPHACY_P, etc.)
- No differentiation based on business purpose
- Missing focus on endpoint-specific requirements

## Optimization Opportunities by Endpoint Type

### 1. **Strategic Analysis** 
**Purpose**: Investment potential, market factors, growth indicators
**Current Fields**: General MP fields
**Should Focus On**: 
- Market size indicators (X14060_X - population)
- Economic indicators (X14068_X - income data)
- Market penetration gaps (low MP values = opportunity)
- Growth potential fields

### 2. **Competitive Analysis vs Brand Difference**
**Key Insight**: CSV shows these are different!
- **Competitive Analysis**: "Market share potential × brand positioning × competitive advantage"
- **Brand Difference**: "Brand differentiation score × market positioning × competitive gap"
**Optimization**: 
- Competitive: Focus on market share fields (all MP fields for comparison)
- Brand Difference: Focus on differentiation (specific brand vs competitor ratios)

### 3. **Demographic Insights**
**Purpose**: "Population favorability based on target demographic alignment"
**Current**: Uses general fields
**Should Focus On**:
- GENALPHACY_P (generational data)
- Age-related demographic fields
- Population density fields (X14060_X series)
- Income alignment fields (X14068_X series)

### 4. **Spatial Clusters**
**Purpose**: "Geographic density × within-cluster similarity"
**Current**: Uses market penetration fields
**Should Focus On**:
- Geographic fields (Shape__Area, Shape__Length)
- Coordinate fields if available (LATITUDE, LONGITUDE)
- Density-related fields
- Spatial relationship indicators

### 5. **Time-Series Dependent Endpoints**
**Issue**: Several endpoints need time-series data but we're using static data:
- correlation-analysis: "needs time-series data"
- predictive-modeling: "needs time-series data" 
- trend-analysis: "needs time-series data"
**Current Problem**: These are using static demographic/market data
**Optimization**: Use trend-indicating static fields or mark as data-limited

### 6. **Anomaly vs Outlier Detection**
**Different Purposes**:
- anomaly-detection: "performing unexpectedly well or poorly"
- outlier-detection: "statistical outliers that deserve investigation"
**Optimization**: Different field selection patterns for different anomaly types

### 7. **Customer Profile**
**Purpose**: "Customer fit score × profile match × lifetime value"
**Should Focus On**: Customer-relevant demographics, not market penetration

## Specific Field Selection Improvements

### Market-Focused Endpoints
Should prioritize MP (market penetration) fields:
- strategic-analysis, competitive-analysis, brand-difference

### Demographic-Focused Endpoints  
Should prioritize demographic fields:
- demographic-insights, customer-profile, segment-profiling
- Fields: GENALPHACY_P, X14xxx series, age/income related

### Spatial-Focused Endpoints
Should prioritize geographic fields:
- spatial-clusters, cluster-analysis
- Fields: Shape fields, coordinate fields, area measurements

### Statistical-Focused Endpoints
Should prioritize high-variance fields:
- feature-importance-ranking, model-performance, ensemble-analysis
- Fields: Most statistically significant fields regardless of type

## Implementation Strategy

1. **Create endpoint-specific field selection rules**
2. **Weight fields by relevance to business purpose**
3. **Handle time-series limitations appropriately**
4. **Differentiate similar-sounding but different endpoints**