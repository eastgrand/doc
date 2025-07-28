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
**Script**: `competitive-analysis-scores-simple.js` *(Fixed - Previously `corrected-competitive-scores.js`)*

### Formula

```
Competitive Advantage Score = (
  0.50 × Nike Market Position Score +
  0.30 × Competitive Landscape Score +
  0.20 × Market Opportunity Score
)

Scale: 0-100 with realistic distribution (5-95 range)
```

### Sub-Component Formulas

```
Nike Market Position Score = (Nike_Share - Min_Nike_Share) / Nike_Share_Range

Competitive Landscape Score = (
  0.50 × Market Dominance +
  0.30 × Competition Intensity +
  0.20 × Market Concentration (HHI)
)

Market Opportunity Score = (
  0.40 × Population Score +
  0.30 × Wealth Score +
  0.30 × Income Score
)
```

### Plain Language

**FIXED VERSION** - The competitive advantage score (0-100) measures Nike's competitive positioning using market-focused metrics:

- **Nike Market Position (50%)**: Nike's relative market share performance across all markets (uses actual variation: 0-32.76%)
- **Competitive Landscape (30%)**: Market dominance vs competitors, competition intensity, and market concentration (Herfindahl Index)
- **Market Opportunity (20%)**: Demographic opportunity based on population size, wealth index, and income levels

**Key Fix Applied**: Removed dependency on identical SHAP values that were causing score clustering around 38-40. Now uses actual market share variation to create meaningful score distribution.

### Fields Used

**Primary Brand Market Shares:**
- `value_MP30034A_B_P` - Nike market share (target brand) - Range: 0-32.76%
- `value_MP30029A_B_P` - Adidas market share (main competitor)
- `value_MP30032A_B_P` - Jordan market share
- `value_MP30031A_B_P` - Converse market share
- `value_MP30035A_B_P` - Puma market share
- `value_MP30033A_B_P` - New Balance market share
- `value_MP30030A_B_P` - Asics market share
- `value_MP30037A_B_P` - Skechers market share
- `value_MP30036A_B_P` - Reebok market share

**Demographics (No longer using SHAP due to zero variation):**
- `value_TOTPOP_CY` - Total population (for market opportunity)
- `value_WLTHINDXCY` - Wealth index (market opportunity)
- `value_AVGHINC_CY` - Average household income (market opportunity)

**Statistical Measures:**
- Market share statistics calculated across all records
- Herfindahl-Hirschman Index for market concentration
- Competition intensity ratios

### Performance Improvements

**Before Fix:**
- Standard Deviation: 4.44
- Score Range: 38-47 (clustered)
- 75% of scores in 39-41 range

**After Fix:**
- Standard Deviation: 12.33 (2.8x improvement)
- Score Range: 5.0-80.4 (realistic spread)
- Proper quartile distribution: Q1=37.5, Q2=43.0, Q3=48.6

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
**Script**: `comparative-analysis-scores-simple.js`

### Formula

```
Comparative Score = (
  40% × Brand Performance +
  30% × Market Characteristics +
  20% × Geographic Variation +
  10% × Competitive Context
)

where:
- Brand Performance = Nike vs Adidas market share and dominance
- Market Characteristics = Population size and demographic diversity  
- Geographic Variation = ZIP code-based consistent variation
- Competitive Context = Market competitiveness and untapped potential
```

### Plain Language

The comparative score measures how areas compare across multiple dimensions:

- **Brand Performance**: Nike vs Adidas market share differences and Nike dominance levels
- **Market Characteristics**: Population size advantages and demographic diversity (Asian, Black, American Indian percentages)
- **Geographic Variation**: ZIP code-based scoring to ensure meaningful differentiation within cities
- **Competitive Context**: Overall brand presence and market gap opportunities

This approach creates meaningful quartile breaks for city-level comparisons (e.g., Brooklyn vs Philadelphia) by ensuring score variation within filtered datasets.

### Fields Used

- `mp30034a_b_p` / `value_MP30034A_B_P` - Nike market share
- `value_MP30029A_B_P` - Adidas market share  
- `TOTPOP_CY` - Total population
- `value_ASIAN_CY_P` - Asian population percentage
- `value_BLACK_CY_P` - Black population percentage
- `value_AMERIND_CY_P` - American Indian population percentage
- `ID` - ZIP code for geographic variation calculation

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
**Data Source**: Pre-calculated comprehensive customer profile data

### Score Components

The customer profile analysis uses **pre-calculated scores** from the data source, providing comprehensive customer persona insights that combine demographic, behavioral, and lifestyle factors:

```
Primary Score: customer_profile_score (0-100)
```

### Plain Language

The customer profile analysis identifies geographic areas with ideal customer personas for athletic brands by using comprehensive pre-calculated data that combines:

- **Demographics**: Population, income, age distribution, and household characteristics
- **Behavioral Patterns**: Brand affinity (Nike market share), purchasing behavior, and lifestyle preferences  
- **Market Context**: Economic conditions, competitive landscape, and growth potential
- **Lifestyle Alignment**: Activity patterns, wealth indicators, and lifestyle markers

Unlike demographic analysis (which focuses purely on population characteristics), customer profile analysis incorporates actual purchasing behavior, brand preferences, and lifestyle indicators to create a more complete picture of customer fit.

### Customer Personas

The data includes pre-categorized customer personas such as:

- **Athletic Enthusiasts**: High Nike affinity + strong behavioral scores
- **Fashion-Forward Professionals**: High income + lifestyle alignment
- **Premium Brand Loyalists**: Strong brand affinity + economic stability
- **Emerging Young Adults**: Growing income + behavioral potential
- **Value-Conscious Families**: Moderate income + practical focus

### Pre-Calculated Fields Used

**Primary Scores:**
- `customer_profile_score` - Main customer profile fit score (0-100)
- `demographic_opportunity_score` - Demographic component score

**Component Scores:**
- `demographic_alignment` - Age, income, household alignment with target customer
- `lifestyle_score` - Activity patterns, wealth, urban/professional indicators
- `behavioral_score` - Brand affinity, purchase propensity, loyalty indicators  
- `market_context_score` - Market size, economic stability, competitive context

**Profile Attributes:**
- `profile_category` - "Strong Customer Profile Fit", "Moderate Customer Profile Potential", etc.
- `persona_type` - Pre-identified customer persona category
- `target_confidence` - Confidence level in profile match (0-100)
- `brand_loyalty_indicator` - Brand loyalty strength indicator
- `lifestyle_alignment` - Lifestyle pattern alignment score
- `purchase_propensity` - Likelihood of athletic brand purchases

**Supporting Demographics:**
- `total_population` - Market size
- `median_income` - Income level  
- `asian_population`, `black_population`, `white_population` - Population diversity
- `mp30034a_b_p` - Nike market share (behavioral indicator)

### Data Format

Customer profile data uses a **direct array format** `[{...}, {...}]` rather than the wrapped format `{success: true, results: [...]}` used by other endpoints, containing rich pre-calculated customer intelligence.

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
