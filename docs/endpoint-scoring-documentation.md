# Endpoint Scoring Documentation

This document describes the scoring formulas and fields used for each data analysis endpoint in the MPIQ AI Chat system.

## Table of Contents

1. [Spatial Clusters](#spatial-clusters)
2. [Competitive Analysis](#competitive-analysis)
3. [Correlation Analysis](#correlation-analysis)
4. [Demographic Insights](#demographic-insights)
5. [Trend Analysis](#trend-analysis)
6. [Anomaly Detection](#anomaly-detection)
7. [Feature Interactions](#feature-interactions)
8. [Outlier Detection](#outlier-detection)
9. [Comparative Analysis](#comparative-analysis)
10. [Predictive Modeling](#predictive-modeling)
11. [Segment Profiling](#segment-profiling)
12. [Scenario Analysis](#scenario-analysis)
13. [Feature Importance Ranking](#feature-importance-ranking)
14. [Sensitivity Analysis](#sensitivity-analysis)
15. [Model Performance](#model-performance)
16. [Strategic Analysis](#strategic-analysis)
17. [Customer Profile](#customer-profile)
18. [Multi-Endpoint Analysis](#multi-endpoint-analysis)

---

## 1. Spatial Clusters

**Endpoint**: `/spatial-clusters`  
**Script**: `add-spatial-cluster-scores.js`

### Formula

```
Cluster Performance Score = (
  0.35 × Cluster Cohesion Score +
  0.25 × Market Value Score +
  0.20 × Brand Performance Index +
  0.20 × Size Significance Score
)
```

### Plain Language

The cluster performance score evaluates how well-defined and valuable each geographic cluster is by combining:

- How similar the areas within the cluster are (cohesion)
- The market value of the cluster
- How well brands perform in the cluster
- The significance of the cluster size

### Fields Used

- `cluster_id` - Cluster identifier
- `cluster_size` - Number of areas in cluster
- `cluster_centroid_distance` - Distance from centroid
- `cluster_avg_value` - Average value in cluster
- `total_population` - Total population
- `median_income` - Median income
- Brand fields: `mp30034a_b_p`, `mp30029a_b_p`, etc.

---

## 2. Competitive Analysis

**Endpoint**: `/competitive-analysis`  
**Script**: `corrected-competitive-scores.js`

### Formula

```
Competitive Advantage Score = (
  0.40 × Market Share Lead +
  0.30 × Growth Momentum +
  0.20 × Market Penetration +
  0.10 × Brand Loyalty Index
)
```

### Plain Language

The competitive advantage score measures how well a brand performs against competitors by evaluating:

- How much market share lead they have
- Their growth momentum compared to competitors
- Market penetration depth
- Customer loyalty metrics

### Fields Used

- `mp30034a_b_p` - Nike market share
- `mp30029a_b_p` - Adidas market share
- Other brand fields for competitive comparison
- `total_population` - Market size
- `median_income` - Economic indicator

---

## 3. Correlation Analysis

**Endpoint**: `/correlation-analysis`  
**Script**: `correlation-strength-scores.js`

### Formula

```
Correlation Strength Score = (
  |correlation_coefficient| × 100 × 
  (1 + significance_bonus) × 
  sample_size_factor
)

where:
- significance_bonus = 0.2 if p_value < 0.01
- sample_size_factor = log10(sample_size) / 4
```

### Plain Language

The correlation strength score measures how strongly two variables are related, adjusted for:

- The absolute strength of the correlation
- Statistical significance (lower p-values get bonus)
- Sample size (larger samples are more reliable)

### Fields Used

- `correlation_coefficient` - Correlation value
- `p_value` - Statistical significance
- `sample_size` - Number of data points
- Various demographic and brand fields being correlated

---

## 4. Demographic Insights

**Endpoint**: `/demographic-insights`  
**Script**: `demographic-opportunity-scores.js`

### Formula

```
Demographic Opportunity Score = (
  0.30 × Population Growth Index +
  0.25 × Income Potential Score +
  0.25 × Age Distribution Match +
  0.20 × Diversity Index
)
```

### Plain Language

The demographic opportunity score identifies areas with the best demographic characteristics for business growth based on:

- Population growth trends
- Income levels and potential
- Age distribution alignment with target market
- Demographic diversity

### Fields Used

- `TOTPOP_CY` - Current population
- `MEDDI_CY` - Median income
- Age distribution fields
- Diversity index fields
- Growth projection fields

---

## 5. Trend Analysis

**Endpoint**: `/trend-analysis`  
**Script**: `trend-strength-scores.js`

### Formula

```
Trend Strength Score = (
  0.40 × Trend Direction Score +
  0.30 × Momentum Index +
  0.20 × Consistency Score +
  0.10 × Acceleration Factor
)

where:
- Trend Direction = slope normalized to [-1, 1]
- Momentum = rate of change
- Consistency = 1 - (std_dev / mean)
- Acceleration = second derivative
```

### Plain Language

The trend strength score evaluates how strong and reliable a trend is by measuring:

- The direction and steepness of the trend
- The momentum (speed of change)
- How consistent the trend is over time
- Whether the trend is accelerating or decelerating

### Fields Used

- Time series data for target variables
- Historical values for trend calculation
- Standard deviation and mean calculations

---

## 6. Anomaly Detection

**Endpoint**: `/anomaly-detection`  
**Script**: `anomaly-detection-scores.js`

### Formula

```
Anomaly Score = (
  0.40 × Statistical Deviation +
  0.30 × Isolation Score +
  0.20 × Local Outlier Factor +
  0.10 × Domain-Specific Rules
)

where:
- Statistical Deviation = |z-score| / 3
- Isolation Score from Isolation Forest
- LOF from Local Outlier Factor algorithm
```

### Plain Language

The anomaly score identifies how unusual or anomalous a data point is by combining:

- How many standard deviations from normal
- How isolated the point is from others
- Local density compared to neighbors
- Business rule violations

### Fields Used

- All numeric fields for anomaly detection
- Statistical measures (mean, std dev)
- Nearest neighbor calculations

---

## 7. Feature Interactions

**Endpoint**: `/feature-interactions`  
**Script**: `feature-interaction-scores.js`

### Formula

```
Interaction Strength Score = (
  0.35 × Synergy Effect +
  0.30 × Statistical Significance +
  0.20 × Business Impact +
  0.15 × Consistency
)

where:
- Synergy Effect = |interaction_term| / (|main_effect_1| + |main_effect_2|)
- Statistical Significance = -log10(p_value)
```

### Plain Language

The interaction strength score measures how strongly two features interact to affect the outcome, beyond their individual effects:

- The synergy between features
- Statistical reliability of the interaction
- Business impact magnitude
- Consistency across different conditions

### Fields Used

- Feature pairs being analyzed
- Interaction term coefficients
- Main effect coefficients
- P-values and statistical measures

---

## 8. Outlier Detection

**Endpoint**: `/outlier-detection`  
**Script**: `outlier-detection-scores.js`

### Formula

```
Outlier Score = (
  0.50 × Z-Score Method +
  0.30 × IQR Method +
  0.20 × Domain Rules
)

where:
- Z-Score Method = min(|z-score| / 3, 1)
- IQR Method = distance beyond 1.5×IQR
```

### Plain Language

The outlier score identifies statistical outliers using multiple methods:

- How many standard deviations from mean (z-score)
- Distance from interquartile range boundaries
- Business domain specific rules

### Fields Used

- Target variable being analyzed
- Statistical measures (mean, std dev, quartiles)
- Domain-specific thresholds

---

## 9. Comparative Analysis

**Endpoint**: `/comparative-analysis`  
**Script**: `comparative-analysis-scores.js`

### Formula

```
Comparative Score = (
  0.35 × Relative Performance +
  0.25 × Gap Analysis +
  0.25 × Trend Comparison +
  0.15 × Statistical Significance
)
```

### Plain Language

The comparative score measures how different groups or segments compare:

- Relative performance between groups
- Size and significance of gaps
- Trend differences between groups
- Statistical confidence in differences

### Fields Used

- Group identifiers
- Performance metrics by group
- Statistical test results
- Trend data by group

---

## 10. Predictive Modeling

**Endpoint**: `/predictive-modeling`  
**Script**: `predictive-modeling-scores.js`

### Formula

```
Prediction Confidence Score = (
  0.40 × Model Accuracy (R²) +
  0.30 × Feature Importance +
  0.20 × Cross-Validation Score +
  0.10 × Prediction Interval Width
)
```

### Plain Language

The prediction confidence score evaluates how reliable model predictions are based on:

- Model accuracy (R-squared)
- Importance of features used
- Cross-validation performance
- Width of prediction intervals

### Fields Used

- Model performance metrics (R², RMSE, MAE)
- Feature importance scores
- Cross-validation results
- Prediction intervals

---

## 11. Segment Profiling

**Endpoint**: `/segment-profiling`  
**Script**: `segment-profiling-scores.js`

### Formula

```
Segment Value Score = (
  0.30 × Segment Size Score +
  0.30 × Segment Distinctiveness +
  0.25 × Economic Value +
  0.15 × Growth Potential
)
```

### Plain Language

The segment value score evaluates customer segments based on:

- Size of the segment (number of customers)
- How distinct/unique the segment is
- Economic value (spending power)
- Future growth potential

### Fields Used

- Segment identifiers
- Segment size metrics
- Income and spending data
- Demographic characteristics
- Growth projections

---

## 12. Scenario Analysis

**Endpoint**: `/scenario-analysis`  
**Script**: `scenario-analysis-scores.js`

### Formula

```
Scenario Impact Score = (
  0.35 × Expected Value Change +
  0.30 × Probability Weight +
  0.20 × Risk Assessment +
  0.15 × Sensitivity Factor
)
```

### Plain Language

The scenario impact score evaluates different "what-if" scenarios by measuring:

- Expected change in key metrics
- Probability of scenario occurring
- Risk level assessment
- Sensitivity to input changes

### Fields Used

- Baseline values
- Scenario parameters
- Probability estimates
- Risk factors
- Sensitivity analysis results

---

## 13. Feature Importance Ranking

**Endpoint**: `/feature-importance-ranking`  
**Script**: Not found - needs creation

### Formula

```
Feature Importance Score = (
  0.50 × SHAP Value Magnitude +
  0.30 × Frequency of Impact +
  0.20 × Consistency Across Models
)
```

### Plain Language

The feature importance score ranks which variables most influence outcomes based on:

- SHAP value magnitudes
- How often the feature impacts predictions
- Consistency across different models

### Fields Used

- SHAP values for all features
- Feature occurrence counts
- Model comparison metrics

---

## 14. Sensitivity Analysis

**Endpoint**: `/sensitivity-analysis`  
**Script**: Not found - needs creation

### Formula

```
Sensitivity Score = (
  ∂Output/∂Input × Input_Range × Probability_Weight
)
```

### Plain Language

The sensitivity score measures how sensitive outputs are to input changes:

- Rate of output change per unit input change
- Multiplied by realistic input range
- Weighted by probability of input changes

### Fields Used

- Input variables being tested
- Output variable responses
- Derivative calculations
- Probability distributions

---

## 15. Model Performance

**Endpoint**: `/model-performance`  
**Script**: Not found - needs creation

### Formula

```
Performance Score = (
  0.35 × Accuracy Metrics +
  0.30 × Generalization Score +
  0.20 × Stability Score +
  0.15 × Computational Efficiency
)
```

### Plain Language

The model performance score evaluates ML models based on:

- Accuracy metrics (R², RMSE, etc.)
- How well it generalizes to new data
- Stability across different conditions
- Computational efficiency

### Fields Used

- Model accuracy metrics
- Cross-validation scores
- Training/test performance gaps
- Runtime metrics

---

## 16. Strategic Analysis

**Endpoint**: `/strategic-analysis`  
**Script**: `strategic-value-scores.js` + `create-strategic-analysis.js`

### Formula

```
Strategic Value Score = (
  0.35 × Market Opportunity +
  0.30 × Competitive Position +
  0.20 × Data Reliability +
  0.15 × Market Scale
)

where:
- Market Opportunity = (0.60 × Demographic Score) + (0.40 × Market Gap)
- Competitive Position = (0.67 × Competitive Advantage) + (0.33 × Brand Positioning)
- Data Reliability = (0.75 × Correlation Strength) + (0.25 × Cluster Consistency)
- Market Scale = (0.60 × Population Scale) + (0.40 × Economic Scale)
```

### Plain Language

The strategic value score provides comprehensive expansion insights for Nike by evaluating:

- **Market Opportunity (35%)**: How attractive the demographics and untapped market potential are
- **Competitive Position (30%)**: Nike's competitive advantage and brand strength in the market
- **Data Reliability (20%)**: How predictable and consistent the market patterns are
- **Market Scale (15%)**: The overall size and economic value of the market

This creates a unified 0-100 score identifying the best strategic expansion opportunities.

### Fields Used

- `competitive_advantage_score` - Pre-calculated competitive positioning
- `demographic_opportunity_score` - Pre-calculated demographic favorability
- `correlation_strength_score` - Data pattern reliability
- `cluster_performance_score` - Market consistency indicator
- `mp30034a_b_p` - Nike market share (for market gap calculation)
- `total_population` - Market size
- `median_income` - Economic scale indicator
- `target_value` - Analysis consistency measure

---

## 17. Customer Profile

**Endpoint**: `/customer-profile`  
**Script**: `generate-customer-profile-scores.js`

### Formula

```
Customer Profile Score = (
  0.30 × Demographic Alignment +
  0.25 × Lifestyle Score +
  0.25 × Behavioral Score +
  0.20 × Market Context Score
)

where:
- Demographic Alignment = Age Match + Income Fit + Household Size + Population Density
- Lifestyle Score = Wealth Index + Activity Patterns + Urban/Professional + Health/Fitness
- Behavioral Score = Nike Affinity + Purchase Propensity + Early Adopter + Brand Loyalty
- Market Context = Market Size + Economic Stability + Competitive Context + Growth Potential
```

### Plain Language

The customer profile score identifies how well a geographic area matches Nike's ideal customer profile by evaluating:

- **Demographic Alignment (30%)**: How well the age (16-45, peak 25-35), income ($35K-$150K, sweet spot $50K-$100K), and household characteristics match Nike's target customer
- **Lifestyle Score (25%)**: Activity patterns, wealth indicators, urban/professional lifestyle markers, and health/fitness orientation
- **Behavioral Score (25%)**: Brand affinity (Nike market share), purchase propensity, early adopter characteristics, and brand loyalty indicators
- **Market Context (20%)**: Market size, economic stability, competitive environment, and growth potential

The score also identifies one of 5 customer personas:

- Athletic Enthusiasts
- Fashion-Forward Professionals
- Premium Brand Loyalists
- Emerging Young Adults
- Value-Conscious Families

### Fields Used

- `total_population` / `value_TOTPOP_CY` - Market size
- `median_income` / `value_AVGHINC_CY` - Income demographics
- `median_age` / `value_MEDAGE_CY` - Age demographics (default: 35)
- `household_size` / `value_AVGHHSZ_CY` - Household composition (default: 2.5)
- `wealth_index` / `value_WLTHINDXCY` - Wealth indicators (default: 100)
- `mp30034a_b_p` / `value_MP30034A_B_P` - Nike market share (brand affinity)
- Calculated fields:
  - `demographic_alignment` - Component score
  - `lifestyle_score` - Component score
  - `behavioral_score` - Component score
  - `market_context_score` - Component score
  - `persona_type` - Identified customer persona
  - `target_confidence` - Confidence in profile match

---

## 18. Multi-Endpoint Analysis

**Endpoint**: Multiple endpoints combined  
**Detection**: `MultiEndpointQueryDetector.ts`

### Detection Formula

```
Multi-Endpoint Detection Score = (
  Pattern Match Score × Pattern Weight × Keyword Coverage
)

where:
- Pattern Match Score = (matched_keywords / total_pattern_keywords)
- Pattern Weight = predefined weight for pattern type (0.7-1.0)
- Keyword Coverage = min(1, matched_keywords / 2)

Triggers when:
- Detection Score > 0.4 (threshold)
- At least 2 keywords match from different endpoint patterns
```

### Combination Strategies

1. **Overlay Strategy**: Layers multiple analyses on same geography
   - Shows different scoring dimensions as toggleable layers
   - Preserves individual endpoint scoring

2. **Comparison Strategy**: Side-by-side analysis comparison
   - Split-screen or multi-panel visualization
   - Allows direct comparison of different metrics

3. **Sequential Strategy**: Ordered analysis flow
   - Analyzes with primary endpoint first
   - Uses results to filter/enhance secondary analysis

4. **Correlation Strategy**: Finds relationships between endpoints
   - Combines scores using weighted averages
   - Identifies areas where multiple factors align

### Plain Language

Multi-endpoint analysis automatically detects when a query requires insights from multiple analysis types and combines them intelligently. For example:

- "Customer profiles AND strategic opportunities" → Combines customer-profile + strategic-analysis
- "Demographics WITH competitive positioning" → Combines demographic-insights + competitive-analysis
- "Market trends AND customer segments" → Combines trend-analysis + segment-profiling

The system:

- Detects multi-endpoint needs using keyword patterns
- Runs analyses in parallel for performance
- Merges results based on geographic location
- Presents unified insights with multiple perspectives

### Common Multi-Endpoint Patterns

1. **Customer + Strategic**: Identifies markets with both ideal customers AND expansion opportunities
2. **Demographic + Competitive**: Shows demographic strengths in competitively advantaged markets
3. **Trend + Risk**: Combines growth trends with anomaly/risk detection
4. **Segment + Geographic**: Overlays customer segments on geographic clusters

### Fields Used

- All fields from constituent endpoints
- Location identifiers for merging (ID, ZIP_CODE, FSA_ID, geo_id)
- Scores from each endpoint with prefixed names (e.g., strategic_strategic_value_score)
- Metadata fields for quality and confidence metrics

---

## Notes

1. All scores are typically normalized to a 0-100 scale for consistency
2. Missing data is handled with appropriate defaults or exclusion
3. Scores may be adjusted based on data quality indicators
4. Some endpoints may have multiple scoring variants for different use cases
5. Customer Profile uses defaults for missing demographic data (age: 35, household: 2.5)
6. Multi-endpoint analysis preserves individual endpoint scores while creating combined insights
