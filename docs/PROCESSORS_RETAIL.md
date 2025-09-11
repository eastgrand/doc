# PROCESSORS_RETAIL.md - Complete Processor Analysis Guide

This document provides comprehensive information about all analysis processors in the MPIQ AI Chat system, including their scoring formulas, methodologies, and specific relevance to retail market analysis.

## Overview

The system contains **35 total processors** organized into different categories:
- **22 Successfully Migrated Processors** (using BaseProcessor architecture)
- **9 Generic/Technical Processors** (ML utilities, no migration required)
- **2 Retail-Specific Processors** (BrandDifferenceProcessor, CompetitiveDataProcessor - available for retail projects)
- **2 Utility Files** (BaseProcessor, support files)

## Three-Layer Scoring Architecture + Semantic Field Resolution

**🚀 CRITICAL: Understanding the Universal Scoring Process**

The system uses a sophisticated three-layer architecture with semantic field resolution that enables unlimited project type scalability:

### Layer 1: Automation Script Scoring
**File**: `/scripts/automation/automated_score_calculator.py`
- **Input**: Raw microservice data + **pre-calculated SHAP values** from microservice
- **Process**: Combines demographic data, SHAP feature importance, and domain-specific formulas
- **Output**: Processor-specific scores (e.g., `competitive_advantage_score`, `demographic_opportunity_score`)
- **SHAP Usage**: Uses existing SHAP values in weighted calculations for explainable AI scoring

### Layer 2: Processor Visualization Scoring
**File**: `/lib/analysis/strategies/processors/`
- **Input**: **Automation-generated scores** (NOT raw SHAP values)
- **Process**: Transforms automation scores into final visualization-ready data
- **Output**: Map styling, legends, and user-facing scores
- **Purpose**: Focuses on user experience and visualization preparation

### Layer 3: Semantic Field Resolution (NEW)
**Files**: 
- `/scripts/automation/semantic_field_resolver.py` - AI-powered field mapping
- `/scripts/automation/configurable_algorithm_engine.py` - Universal scoring engine
- `/scripts/automation/project_types/` - Modular configuration system

**🚀 REVOLUTIONARY FEATURE**: **Unlimited Project Type Scalability**
- **Input**: Project-specific field mappings and semantic configurations
- **Purpose**: Resolve semantic field names to actual project field names
- **Process**: AI-powered field mapping with comprehensive validation
- **Output**: Unified algorithm interface that works with any data structure

**Universal Compatibility**: All algorithms now work across retail, real estate, healthcare, finance, and any future project types through semantic field resolution.

### Key Points:
1. **SHAP values are PRE-CALCULATED** by the microservice for each endpoint
2. **Semantic layer RESOLVES** field names for unlimited project type compatibility
3. **Automation script USES** SHAP values and semantic fields to generate processor-specific scores  
4. **Processors CONSUME** the automation-generated scores, not raw SHAP values
5. This architecture provides explainable AI rigor, unlimited scalability, AND performance optimization

*All formulas shown in this document represent the automation layer calculations that generate the scores processors consume.*

---

## Core Analysis Processors

### AlgorithmComparisonProcessor
**Score Field**: `algorithm_comparison_score` (0-100 scale)

**Scoring Formula**: 
- **Model Performance Weight (40%)**: Cross-validation accuracy, precision, recall
- **Efficiency Weight (30%)**: Training time, prediction speed, resource usage
- **Robustness Weight (20%)**: Stability across datasets, overfitting resistance
- **Interpretability Weight (10%)**: Model explainability and feature importance

**Analysis Description**: Compares multiple machine learning algorithms to identify the best-performing model for the specific dataset and business problem.

**Retail Relevance**: **Medium** - Helps retailers select optimal prediction models for demand forecasting, customer segmentation, and inventory optimization. Less directly actionable than market-specific processors.

---

### AnalyzeProcessor
**Score Field**: `analysis_score` (0-100 scale)

**Scoring Formula** (SHAP-Based Feature Importance Analysis from automation script):

**Core Formula**: 
```javascript
analysis_score = (0.242 × mp10104a_b_p_normalized) + (0.203 × genalphacy_p_normalized) + 
                (0.191 × mp10116a_b_p_normalized) + (0.183 × mp10120a_b_p_normalized) + 
                (0.181 × x14058_x_a_normalized)
```

**Component Analysis (5 SHAP-Weighted Features)**:
1. **mp10104a_b_p (24.2% weight)**: Core business performance metric - primary retail indicator
2. **genalphacy_p (20.3% weight)**: Generation Alpha demographic (early 2010s born) - emerging consumer market
3. **mp10116a_b_p (19.1% weight)**: Secondary business metric - complementary retail performance
4. **mp10120a_b_p (18.3% weight)**: Tertiary business metric - additional retail context  
5. **x14058_x_a (18.1% weight)**: Economic indicator - market economic foundation

**Normalization Process**:
```javascript
for each component:
  if (raw_value > 0) {
    normalized_value = min((raw_value / 100) * 100, 100)  // Scale to 0-100
    total_score += weight * normalized_value
    component_count++
  }
  
analysis_score = max(0, min(100, total_score))  // Ensure 0-100 range
```

**SHAP Integration**: This algorithm was generated using SHAP (SHapley Additive exPlanations) feature importance analysis on historical retail market data. The weights (0.242, 0.203, etc.) represent the statistically determined importance of each feature in predicting retail market success.

**Data-Driven Methodology**: Unlike heuristic approaches, this scoring uses machine learning-derived feature importance to objectively weight different market factors based on their proven predictive power for retail performance.

**Analysis Description**: Sophisticated data-driven retail analysis processor that combines SHAP-based feature importance with demographic and business metrics to provide scientifically validated market scoring for retail location analysis and competitive assessment.

**Retail Relevance**: **Maximum** - Uses proven statistical methodology (SHAP) to weight retail success factors. Combines core business metrics with emerging demographic trends (Gen Alpha) and economic indicators. Essential for data-driven retail location selection and market opportunity assessment.

---

### ComparativeAnalysisProcessor  
**Score Field**: `comparative_score` (0-100 scale)

**Target Variable Definition**: The `target_value` represents the primary performance metric being analyzed for each geographic area. In retail projects, this is typically:
- **Nike Brand Share**: `MP30034A_B_P` (Nike market penetration percentage per area)
- **Adidas Brand Share**: `MP30029A_B_P` (Adidas market penetration percentage per area)  
- **Other Brand Metrics**: Depending on the specific retail analysis focus

**Scoring Formula** (Percentile-Based Ranking from automation script):
```javascript
// Extract target values from all geographic records
target_values = [record.target_value for each record where target_value > 0]
values_sorted = sorted(target_values)

// Calculate percentile rank for each record
for each record:
  if (record.target_value > 0) {
    // Percentile rank: how many areas have <= this target_value
    percentile = (count of values <= record.target_value) / total_count * 100
    comparative_score = percentile
  } else {
    comparative_score = 0  // No market presence
  }
```

**Percentile Interpretation**:
- **90-100**: Top 10% performing markets (high Nike/brand share)
- **75-89**: Above average performance (strong market presence)
- **50-74**: Average performance (moderate market share)
- **25-49**: Below average performance (low market presence)
- **0-24**: Bottom quartile (minimal/no brand share)

**Fallback**: If no valid target values exist across all areas, assigns neutral score of 50.0 to all records.

**Example Usage**: 
- *Query*: "Compare Nike market share performance across all cities"
- *Result*: Boston scores 85 (Nike has higher share than 85% of other cities)

**Analysis Description**: Compares brand performance metrics across different geographic areas using percentile ranking to identify relative market strengths, competitive positioning, and expansion opportunities.

**Retail Relevance**: **Very High** - Essential for competitive analysis in retail. Provides percentile-based rankings to identify markets where brand outperforms competitors, optimal expansion locations, and areas needing strategic intervention or investment.

---

### ConsensusAnalysisProcessor
**Score Field**: `consensus_score` (0-100 scale)

**Scoring Formula**:
- **Model Agreement Weight (50%)**: Agreement between multiple prediction models
- **Confidence Intervals (25%)**: Statistical confidence in predictions
- **Historical Validation (15%)**: Past performance accuracy
- **Expert Validation (10%)**: Human expert review alignment

**Analysis Description**: Aggregates insights from multiple analysis methods to provide consensus-driven recommendations with confidence metrics.

**Retail Relevance**: **High** - Reduces decision-making risk by providing validated insights from multiple analytical approaches. Critical for major retail investments and strategic decisions.

---

### CoreAnalysisProcessor
**Score Field**: `strategic_value_score` (0-100 scale)

**Scoring Formula** (4-Component Strategic Analysis from automation script):

**Strategic Value Score = (0.35 × Market Opportunity) + (0.30 × Competitive Position) + (0.20 × Data Reliability) + (0.15 × Market Scale)**

**Component Calculations:**
1. **Market Opportunity (35% weight)**:
   ```
   demographic_component = demographic_opportunity_score
   market_gap = max(0, 100 - target_brand_share)
   market_opportunity = (0.60 * demographic_component) + (0.40 * market_gap)
   ```

2. **Competitive Position (30% weight)**:
   ```
   competitive_advantage = competitive_advantage_score
   brand_positioning = min((target_share / 50) * 100, 100)
   competitive_position = (0.67 * competitive_advantage) + (0.33 * brand_positioning)
   ```

3. **Data Reliability (20% weight)**:
   ```
   correlation_component = correlation_strength_score
   cluster_consistency = cluster_performance_score || min((target_value / 50) * 100, 100)
   data_reliability = (0.75 * correlation_component) + (0.25 * cluster_consistency)
   ```

4. **Market Scale (15% weight)**:
   ```
   population_scale = min((total_population / 10000) * 100, 100)
   economic_scale = min((median_income / 100000) * 100, 100)
   market_scale = (0.60 * population_scale) + (0.40 * economic_scale)
   ```

**Analysis Description**: Most comprehensive processor providing strategic value assessment through multi-dimensional analysis of market opportunity, economics, competition, and growth potential.

**Retail Relevance**: **Maximum** - The gold standard for retail location analysis. Provides actionable strategic value scores considering all critical retail factors: market size, competition, demographics, and growth potential.

---

### EnsembleAnalysisProcessor
**Score Field**: `ensemble_score` (0-100 scale)

**Scoring Formula**:
- **Weighted Model Average (60%)**: Multiple model predictions weighted by accuracy
- **Variance Penalty (20%)**: Reduces score for high prediction disagreement
- **Confidence Boost (15%)**: Increases score for high-confidence predictions  
- **Outlier Detection (5%)**: Flags and adjusts for statistical outliers

**Analysis Description**: Combines multiple machine learning models using ensemble methods to improve prediction accuracy and reduce overfitting.

**Retail Relevance**: **High** - Provides more robust predictions for retail metrics by combining multiple analytical approaches. Particularly valuable for demand forecasting and customer behavior prediction.

---

### SpatialClustersProcessor
**Score Field**: `cluster_performance_score` (0-100 scale)

**Scoring Formula** (Percentile-Based Clustering from automation script):

```javascript
// Simple percentile-based clustering
n_clusters = 5
percentiles = [20, 40, 60, 80] // Calculate from valid target values

// For each record:
if (target_value <= percentiles[0]) {
  cluster_id = 0, cluster_label = 'Low Performance', cluster_score = 20
} else if (target_value <= percentiles[1]) {
  cluster_id = 1, cluster_label = 'Below Average', cluster_score = 40
} else if (target_value <= percentiles[2]) {
  cluster_id = 2, cluster_label = 'Average', cluster_score = 60
} else if (target_value <= percentiles[3]) {
  cluster_id = 3, cluster_label = 'Above Average', cluster_score = 80
} else {
  cluster_id = 4, cluster_label = 'High Performance', cluster_score = 100
}
```

**Fallback**: If no valid target values exist, assigns random clusters with neutral 50.0 scores.

**Cluster Labels**:
- **Cluster 0**: Low Performance (Score: 20)
- **Cluster 1**: Below Average (Score: 40) 
- **Cluster 2**: Average (Score: 60)
- **Cluster 3**: Above Average (Score: 80)
- **Cluster 4**: High Performance (Score: 100)

**Analysis Description**: Creates performance-based clusters of retail markets using percentile ranking to identify similar market characteristics and expansion potential across geographic areas.

**Retail Relevance**: **Very High** - Essential for retail chain expansion planning. Groups markets by performance levels, identifies similar expansion opportunities, and optimizes supply chain and marketing efforts across different market tiers.

---

## Real Estate Specific Processors

### HousingMarketCorrelationProcessor
**Score Field**: `housing_correlation_score` (0-100 scale)

**Scoring Formula**:
- **Income Correlation (35%)**: Relationship between income and housing metrics
- **Population Density Impact (25%)**: Population effect on housing market
- **Age Demographics (20%)**: Age group correlation with housing demand
- **Economic Indicators (20%)**: Employment, stability factors

**Analysis Description**: Analyzes correlations between demographic factors and housing market performance to identify key drivers of real estate value.

**Retail Relevance**: **Low** - Primarily focused on real estate metrics. Limited direct application to retail unless analyzing store location factors related to residential density and housing costs.

---

### MarketSizingProcessor
**Score Field**: `market_sizing_score` (0-100 scale)

**Scoring Formula**:
- **Revenue Potential**: `Math.sqrt((population / 50000) * (income / 80000))`
- **Market Categories**:
  - Mega Market: `population >= 150K && income >= 80K`
  - Large Market: `population >= 100K && income >= 60K`  
  - Medium Market: `population >= 75K || income >= 100K`
- **Opportunity Sizing**: Based on score thresholds (70+ = Massive, 60+ = Large, 45+ = Moderate)

**Analysis Description**: Evaluates total addressable market size, growth potential, and revenue opportunities across geographic markets.

**Retail Relevance**: **Maximum** - Critical for retail expansion planning. Directly measures market size, revenue potential, and investment opportunity size. Essential for prioritizing new store locations and market entry decisions.

---

### RealEstateAnalysisProcessor
**Score Field**: `real_estate_score` (0-100 scale)

**Scoring Formula**: 
- **Property Value Trends (30%)**: Historical and projected property values
- **Market Liquidity (25%)**: Transaction volume and speed
- **Development Potential (25%)**: Zoning, permits, growth capacity
- **Location Quality (20%)**: Accessibility, amenities, infrastructure

**Analysis Description**: Comprehensive real estate market analysis focusing on property values, development opportunities, and investment potential.

**Retail Relevance**: **Medium** - Useful for retail real estate decisions (store location costs, property values). Less directly applicable than customer/market-focused processors but valuable for site selection cost analysis.

---

### RiskDataProcessor
**Score Field**: `risk_adjusted_score` (0-100 scale)

**Scoring Formula**:
- **Base Value**: Starting opportunity score
- **Volatility Penalty**: `-volatility * 20` (0-20 point reduction)
- **Uncertainty Penalty**: `-uncertainty * 15` (0-15 point reduction)  
- **Stability Bonus**: `+stability * 10` (0-10 point addition)
- **Final Score**: `Math.max(0, Math.min(100, base_value - volatility_penalty - uncertainty_penalty + stability_bonus))`

**Analysis Description**: Provides risk-adjusted performance scores by penalizing high volatility and uncertainty while rewarding market stability.

**Retail Relevance**: **Very High** - Critical for retail investment decisions. Helps identify stable markets vs. high-risk opportunities, essential for portfolio management and risk mitigation in retail expansion.

---

### StrategicAnalysisProcessor
**Score Field**: `strategic_value_score` (0-100 scale)

**Scoring Formula** (Multi-Factor Strategic Assessment from automation script):

**Core Formula**:
```javascript
strategic_value_score = (
  0.35 × market_opportunity +      // Market potential and demographic fit
  0.30 × competitive_position +    // Competitive advantage and brand strength  
  0.20 × data_reliability +        // Analysis quality and consistency
  0.15 × market_scale              // Population and economic scale
)
```

**Component Calculations:**

**1. Market Opportunity Analysis (35% weight)**
```javascript
// Market opportunity assessment
demographic_component = demographic_opportunity_score  // Pre-calculated demographic score
market_gap = max(0, 100 - nike_share)                 // Untapped market potential

market_opportunity = (0.60 × demographic_component) + (0.40 × market_gap)
```
*Business Logic*: Combines demographic attractiveness with market penetration gaps to identify expansion opportunities.

**2. Competitive Position Assessment (30% weight)**  
```javascript
// Competitive advantage evaluation
competitive_advantage = competitive_advantage_score    // Pre-calculated competitive score
brand_positioning = min((nike_share / 50) × 100, 100) // Brand strength relative to 50% benchmark

competitive_position = (0.67 × competitive_advantage) + (0.33 × brand_positioning)
```
*Business Logic*: Balances overall competitive strength with actual market share performance against industry benchmarks.

**3. Data Reliability Assessment (20% weight)**
```javascript
// Analysis confidence and consistency
correlation_component = correlation_strength_score    // Statistical correlation quality
cluster_consistency = cluster_performance_score ||    // Cluster quality, or fallback calculation:
                     min((target_value / 50) × 100, 100) || 50

data_reliability = (0.75 × correlation_component) + (0.25 × cluster_consistency)
```
*Business Logic*: Ensures strategic decisions are based on reliable, consistent data analysis with statistical validation.

**4. Market Scale Analysis (15% weight)**
```javascript
// Market size and economic potential
population_scale = min((total_population / 10000) × 100, 100)  // Population threshold: 10K
economic_scale = min((median_income / 100000) × 100, 100)      // Income threshold: $100K

market_scale = (0.60 × population_scale) + (0.40 × economic_scale)
```
*Business Logic*: Evaluates market size viability with emphasis on population scale and economic capacity.

**Analysis Description**: Comprehensive strategic analysis combining market opportunity assessment, competitive positioning, data reliability, and market scale evaluation for long-term strategic planning and resource allocation.

**Retail Relevance**: **Maximum** - Essential for strategic retail planning. Provides scientifically rigorous evaluation of long-term market potential, competitive positioning, and investment priorities for sustainable retail growth and market expansion strategies.

---

## Demographic and Trend Processors

### CorrelationAnalysisProcessor
**Score Field**: `correlation_strength_score` (0-100 scale)

**Scoring Formula** (Correlation Analysis from automation script):

```javascript
// Use existing correlation score if available
if ('correlation_score' in record && record.correlation_score != null) {
  correlation_strength_score = safe_float(record.correlation_score)
} else {
  // Calculate based on available metrics
  if (target_value > 0 && median_income > 0) {
    correlation_strength_score = min((target_value * median_income / 1000000), 100)
  } else {
    correlation_strength_score = 0
  }
}
```

**Calculation Logic**:
- **Primary**: Uses pre-calculated `correlation_score` if available
- **Fallback**: Calculates proxy correlation using `(target_value * median_income) / 1,000,000`
- **Default**: Returns 0 if insufficient data

**Analysis Description**: Identifies and quantifies relationships between target performance and economic factors, providing correlation insights for retail market analysis.

**Retail Relevance**: **High** - Helps retailers understand relationships between market performance, income levels, and sales potential. Critical for identifying demographic and economic drivers of retail success.

---

### CustomerProfileProcessor  
**Score Field**: `customer_profile_score` (0-100 scale)

**Scoring Formula** (Customer Profile Analysis from business logic patterns):

**Core Formula**:
```javascript
customer_profile_score = (
  0.40 × demographic_match +         // Target customer demographic alignment
  0.30 × behavioral_indicators +     // Purchase patterns and brand affinity
  0.20 × lifetime_value_potential +  // Economic capacity and loyalty potential  
  0.10 × acquisition_efficiency      // Market accessibility and reach costs
)
```

**Component Calculations:**

**1. Demographic Match Analysis (40% weight)**
```javascript
// Target customer profile alignment
age_alignment = calculate_age_match(median_age, target_age_range)  // Target: 25-45 for retail
income_alignment = min((median_income / target_income) * 100, 100)  // Target: $50K+ retail spending power
lifestyle_fit = calculate_lifestyle_indicators(urbanicity, education, household_composition)

demographic_match = (0.45 × age_alignment) + (0.35 × income_alignment) + (0.20 × lifestyle_fit)
```
*Business Logic*: Evaluates how well the geographic area's demographics match the ideal customer profile for the brand.

**2. Behavioral Indicators Assessment (30% weight)**  
```javascript
// Purchase behavior and brand affinity patterns
brand_affinity = calculate_brand_preference_strength(brand_share, competitive_landscape)
spending_patterns = evaluate_consumption_behavior(retail_spending_data, seasonal_patterns)
loyalty_indicators = assess_customer_retention_potential(demographic_stability, repeat_purchase_likelihood)

behavioral_indicators = (0.50 × brand_affinity) + (0.30 × spending_patterns) + (0.20 × loyalty_indicators)
```
*Business Logic*: Measures behavioral characteristics that indicate strong customer potential and brand loyalty.

**3. Lifetime Value Potential Assessment (20% weight)**
```javascript
// Economic capacity and long-term customer value
disposable_income = calculate_disposable_income(median_income, cost_of_living)
purchase_frequency = estimate_purchase_frequency(demographic_profile, product_category)
retention_likelihood = calculate_retention_probability(market_stability, brand_loyalty_factors)

lifetime_value_potential = (0.40 × disposable_income) + (0.35 × purchase_frequency) + (0.25 × retention_likelihood)
```
*Business Logic*: Estimates the long-term value potential of customers in each market based on economic capacity and loyalty indicators.

**4. Acquisition Efficiency Analysis (10% weight)**
```javascript
// Market accessibility and customer acquisition costs
market_density = calculate_market_density(population_density, retail_infrastructure)
media_reach = assess_marketing_channel_effectiveness(demographic_media_consumption)
competition_intensity = evaluate_acquisition_difficulty(competitive_presence, market_saturation)

acquisition_efficiency = (0.50 × market_density) + (0.30 × media_reach) + (0.20 × (100 - competition_intensity))
```
*Business Logic*: Evaluates how efficiently customers can be acquired in each market through marketing channels and competitive positioning.

**Advanced Customer Segmentation Integration:**
```javascript
// Additional segmentation factors (applied as multipliers)
psychographic_fit = calculate_psychographic_alignment(lifestyle_values, brand_values)
seasonal_affinity = assess_seasonal_purchase_patterns(geographic_climate, product_seasonality)
digital_engagement = evaluate_digital_channel_affinity(age_demographics, digital_adoption_rates)

// Final customer profile score with segmentation adjustments
final_score = base_customer_profile_score × (1 + (psychographic_fit * 0.1)) × (1 + (seasonal_affinity * 0.05)) × (1 + (digital_engagement * 0.05))
```

**Analysis Description**: Comprehensive customer profiling analysis combining demographic alignment, behavioral indicators, lifetime value assessment, and acquisition efficiency to identify and score optimal customer markets for targeted brand strategies.

**Retail Relevance**: **Maximum** - Essential for customer-centric retail strategy. Provides detailed customer profiling to drive targeted marketing, product assortment planning, customer acquisition strategies, and brand positioning decisions based on market-by-market customer characteristics and value potential.

---

### DemographicDataProcessor
**Score Field**: `demographic_opportunity_score` (0-100 scale)

**Scoring Formula** (Retail Demographic Analysis from automation script):

```javascript
// Calculate diversity index
if (total_population > 0) {
  diversity_score = (
    (asian_population / total_population) * 30 +
    (black_population / total_population) * 20 +
    min(median_income / 75000, 1) * 25 +
    max(0, 1 - abs(median_age - 35) / 20) * 15 +
    min(household_size / 3, 1) * 10
  ) * 100
} else {
  diversity_score = 0
}

// Population scale bonus
population_bonus = min(total_population / 10000, 1) * 20

demographic_opportunity_score = min(diversity_score + population_bonus, 100)
```

**Component Breakdown**:
- **Asian Population Factor (30%)**: Key demographic for retail diversity
- **Black Population Factor (20%)**: Additional diversity strength
- **Income Factor (25%)**: Spending power (target: $75K median income)
- **Age Factor (15%)**: Optimal retail age around 35 years
- **Household Size Factor (10%)**: Family unit spending capacity
- **Population Bonus (up to 20 points)**: Market scale advantage

**Analysis Description**: Analyzes demographic characteristics to assess retail market potential, focusing on diversity, spending power, age distribution, and market size for retail customer opportunity.

**Retail Relevance**: **Maximum** - Essential for retail market analysis. Directly measures target demographic alignment, spending power, and retail market opportunity based on population characteristics and diversity factors.

---

### PredictiveModelingProcessor
**Score Field**: `predictive_modeling_score` (0-100 scale)

**Scoring Formula** (Multi-Factor Prediction from automation script):

```javascript
// Weighted prediction combining multiple factors
if (demographic_score > 0 || competitive_score > 0) {
  predictive_score = (
    0.40 * demographic_opportunity_score +
    0.35 * competitive_advantage_score +
    0.25 * min(target_value, 100)
  )
} else {
  // Fallback to target value only
  predictive_score = min(target_value, 100)
}
```

**Component Weights**:
- **Demographic Factor (40%)**: Population and economic characteristics
- **Competitive Factor (35%)**: Market competitive positioning
- **Current Performance (25%)**: Existing target value performance

**Fallback**: If demographic and competitive scores unavailable, uses target_value clamped to 100.

**Analysis Description**: Creates predictive scores by combining demographic opportunity, competitive advantage, and current performance to forecast future retail market potential.

**Retail Relevance**: **Very High** - Critical for demand forecasting, inventory planning, and sales projections. Combines key market factors to predict future performance, essential for retail expansion timing and market entry decisions.

---

### ScenarioAnalysisProcessor
**Score Field**: `scenario_score` (0-100 scale)

**Scoring Formula**:
- **Base Case Performance (40%)**: Expected outcome under normal conditions
- **Upside Potential (25%)**: Best-case scenario benefits
- **Downside Risk (20%)**: Worst-case scenario impact
- **Probability Weighting (15%)**: Likelihood of different scenarios

**Analysis Description**: Evaluates multiple future scenarios to assess potential outcomes, risks, and opportunities under different market conditions.

**Retail Relevance**: **High** - Valuable for strategic planning and risk assessment. Helps retailers prepare for different market conditions and optimize decision-making under uncertainty.

---

### SegmentProfilingProcessor
**Score Field**: `segment_performance_score` (0-100 scale)

**Scoring Formula**:
- **Segment Size (30%)**: Market segment population and reach
- **Profitability (30%)**: Revenue and margin potential per segment
- **Accessibility (25%)**: Ease of reaching and serving segment
- **Growth Potential (15%)**: Segment expansion opportunities

**Analysis Description**: Analyzes different market segments to identify characteristics, preferences, and profitability of distinct customer groups.

**Retail Relevance**: **Maximum** - Core retail capability for market segmentation. Essential for targeted product offerings, pricing strategies, and marketing campaigns.

---

### TrendAnalysisProcessor
**Score Field**: `trend_strength_score` (0-100 scale)

**Scoring Formula** (Simple Baseline Trend Analysis from automation script):

```javascript
// Simple trend based on current vs baseline
baseline = 50  // Assumed baseline for trend analysis
trend_strength_score = max(0, min((target_value / baseline) * 50, 100))
```

**Formula Explanation**:
- Uses target_value compared against a baseline of 50
- Calculates relative performance as percentage of baseline
- Multiplies by 50 to scale to 0-100 range
- Clamps result between 0 and 100

**Analysis Description**: Provides trend analysis by comparing current market values against a baseline to identify relative market strength and directional momentum for retail expansion.

**Retail Relevance**: **Very High** - Essential for understanding retail market momentum and directional changes. Helps retailers identify markets with positive trends and growth potential relative to baseline performance.

---

### TrendDataProcessor
**Score Field**: `trend_data_score` (0-100 scale)

**Scoring Formula**:
- **Data Quality (35%)**: Completeness, accuracy, and timeliness
- **Trend Clarity (30%)**: Statistical significance of identified trends
- **Actionability (20%)**: Practical implications for business decisions
- **Predictive Value (15%)**: Forward-looking trend insights

**Analysis Description**: Processes and analyzes trend data to extract meaningful insights about market direction and momentum.

**Retail Relevance**: **High** - Supports data-driven trend analysis for retail decision-making. Provides foundation for understanding market momentum and directional changes.

---

## Technical/ML Processors (Generic - Universal Analytics)

**🎯 Purpose**: These processors provide advanced analytical capabilities that work universally across all project types (retail, real estate, healthcare, finance, etc.). They focus on data science techniques and pattern recognition rather than domain-specific business logic.

**🎨 Visualization Capabilities**: All technical processors generate rich, interactive visualizations that help users understand complex data patterns through charts, heatmaps, scatter plots, and statistical dashboards.

---

### AnomalyDetectionProcessor
**Score Field**: `anomaly_score` (0-100 scale, higher = more anomalous)

**What It Does**: 
Detects statistically unusual patterns, outliers, and anomalies in datasets using advanced mathematical techniques like Isolation Forest, Z-score analysis, and statistical deviation detection. Identifies data points that deviate significantly from normal patterns.

**Scoring Methodology**: 
```javascript
// Statistical anomaly detection
for each data_point:
  z_score = (data_point - mean) / standard_deviation
  isolation_score = isolation_forest_algorithm(data_point)
  statistical_deviation = calculate_multivariate_deviation(data_point)
  
anomaly_score = combine_detection_methods(z_score, isolation_score, statistical_deviation)
```

**Retail Applications**:
- **Fraud Detection**: Identify unusual transaction patterns or suspicious customer behaviors
- **Inventory Anomalies**: Detect unexpected demand spikes or supply chain disruptions
- **Performance Outliers**: Find locations performing exceptionally well or poorly
- **Market Opportunities**: Identify unexpected demographic or economic patterns

**Visualization Potential**: 
- **🔥 Highly Visual**: Anomaly scatter plots, heatmaps showing deviation intensity, time-series charts with anomaly highlighting
- **Interactive Features**: Click on anomalous points to see detailed breakdown, filter by anomaly severity
- **Dashboard Elements**: Real-time anomaly alerts, statistical distribution charts, outlier ranking tables

**Business Value**: **High** - Critical for risk management, opportunity identification, and quality control across all business functions.

---

### ClusterDataProcessor  
**Score Field**: `cluster_quality_score` (0-100 scale)

**What It Does**:
Groups similar geographic areas, customers, or market segments into meaningful clusters using machine learning algorithms like K-means, hierarchical clustering, and DBSCAN. Evaluates cluster quality using silhouette scores and intra-cluster coherence.

**Scoring Methodology**:
```javascript
// Multi-algorithm clustering with quality assessment
k_means_clusters = k_means_algorithm(data, optimal_k)
hierarchical_clusters = hierarchical_clustering(data)
dbscan_clusters = dbscan_algorithm(data, optimal_eps)

// Quality metrics
silhouette_score = calculate_silhouette_coefficient(clusters)
inertia_score = calculate_within_cluster_sum_squares(clusters)
cohesion_score = measure_cluster_cohesion(clusters)

cluster_quality_score = weighted_average(silhouette_score, inertia_score, cohesion_score)
```

**Retail Applications**:
- **Customer Segmentation**: Group customers by behavior, demographics, and purchasing patterns
- **Market Segmentation**: Identify similar geographic markets for targeted strategies
- **Product Grouping**: Cluster products by performance, seasonality, and consumer preferences
- **Store Performance**: Group retail locations by performance and characteristics

**Visualization Potential**:
- **🎨 Extremely Visual**: Interactive cluster maps, 3D scatter plots, dendrograms for hierarchical clustering
- **Geographic Clustering**: Color-coded maps showing cluster boundaries and characteristics
- **Performance Dashboards**: Cluster comparison tables, centroids visualization, cluster migration tracking
- **Dynamic Features**: Adjustable cluster count, real-time re-clustering, cluster drill-down analysis

**Business Value**: **Very High** - Essential for market segmentation, targeted marketing, and strategic planning.

---

### DimensionalityInsightsProcessor
**Score Field**: `dimensionality_score` (0-100 scale)

**What It Does**:
Analyzes high-dimensional datasets to identify the most important data components and reduce complexity while preserving critical insights. Uses techniques like Principal Component Analysis (PCA), t-SNE, and feature correlation analysis to understand data structure.

**Scoring Methodology**:
```javascript
// Dimensionality reduction and analysis
pca_analysis = principal_component_analysis(data)
variance_explained = calculate_explained_variance_ratio(pca_analysis)
feature_correlations = correlation_matrix(data)
dimensional_complexity = calculate_intrinsic_dimensionality(data)

// Quality of dimensionality reduction
information_preservation = measure_information_retention(original_data, reduced_data)
visualization_quality = evaluate_2d_3d_projections(reduced_data)

dimensionality_score = combine_metrics(variance_explained, information_preservation, visualization_quality)
```

**Retail Applications**:
- **Data Simplification**: Reduce complex customer/market data to key driving factors
- **Feature Selection**: Identify most important variables for business analysis
- **Data Visualization**: Create 2D/3D visualizations of complex multi-dimensional relationships
- **Performance Optimization**: Streamline data analysis by focusing on critical dimensions

**Visualization Potential**:
- **🚀 Advanced Visualizations**: Interactive PCA biplots, t-SNE scatter plots, correlation heatmaps
- **Dimensionality Maps**: 3D projections of high-dimensional data, component loading visualizations
- **Variance Charts**: Scree plots showing explained variance, cumulative variance curves
- **Technical Dashboards**: Component importance rankings, feature correlation networks, dimensionality metrics

**Business Value**: **Medium-High** - Critical for data scientists and analysts, valuable for simplifying complex business decisions.

---

### FeatureImportanceRankingProcessor
**Score Field**: `feature_importance_score` (0-100 scale)

**What It Does**:
Ranks and quantifies the relative importance of different variables (demographics, economics, competition, etc.) in driving business outcomes. Uses SHAP (SHapley Additive exPlanations) values to provide explainable AI insights into which factors most influence target metrics.

**Scoring Formula** (SHAP-Based Feature Importance from automation script):
```javascript
// Comprehensive feature importance analysis
shap_sum = 0
shap_count = 0

// Aggregate absolute SHAP values across all factors
for (key, value) in record.items():
  if key.startswith('shap_') and is_numeric(value):
    shap_sum += abs(float(value))  // Use absolute values for importance magnitude
    shap_count += 1

// Calculate average importance with scaling
if (shap_count > 0) {
  average_importance = shap_sum / shap_count
  feature_importance_score = min(average_importance * 10, 100)  // Scale to 0-100
} else {
  feature_importance_score = 0
}
```

**Retail Applications**:
- **Factor Analysis**: Understand which demographics most influence brand performance
- **Marketing Optimization**: Identify key customer characteristics for targeting
- **Location Analysis**: Determine most important factors for store success
- **Product Strategy**: Understand drivers of product performance across markets

**Visualization Potential**:
- **📊 Rich Visualizations**: SHAP waterfall charts, feature importance bar charts, factor contribution heatmaps
- **Interactive Rankings**: Sortable importance tables, factor comparison sliders, dynamic weight adjustments
- **Explainable AI**: SHAP force plots showing positive/negative contributions, decision tree visualizations
- **Business Dashboards**: Top factor highlights, importance trend tracking, factor correlation networks

**Business Value**: **Very High** - Provides explainable insights essential for data-driven decision making and strategy development.

---

### FeatureInteractionProcessor
**Score Field**: `interaction_strength_score` (0-100 scale)

**Analysis Description**: Identifies interactions between different variables that may have combined effects greater than individual impacts.

**Retail Relevance**: **Medium** - Useful for understanding complex relationships between demographic, market, and performance factors.

---

### ModelPerformanceProcessor
**Score Field**: `model_performance_score` (0-100 scale)

**Analysis Description**: Evaluates and compares the performance of different analytical models.

**Retail Relevance**: **Medium** - Ensures analytical quality but doesn't provide direct business insights. Technical utility processor.

---

### ModelSelectionProcessor
**Score Field**: `model_selection_score` (0-100 scale)

**Analysis Description**: Selects optimal models for specific analytical tasks based on performance criteria.

**Retail Relevance**: **Medium** - Technical processor for optimizing analytical approaches. Indirect retail benefit through improved analysis quality.

---

### OutlierDetectionProcessor  
**Score Field**: `outlier_score` (0-100 scale, higher = more outlier-like)

**Analysis Description**: Identifies data points that significantly deviate from expected patterns.

**Retail Relevance**: **Medium** - Helps identify exceptional markets, unusual customer behavior, or data quality issues.

---

### SensitivityAnalysisProcessor
**Score Field**: `sensitivity_score` (0-100 scale)

**What It Does**:
Analyzes how sensitive business outcomes are to changes in key input variables. Tests "what-if" scenarios by systematically varying important factors and measuring the impact on target metrics. Helps identify critical variables and assess model robustness.

**Scoring Methodology**:
```javascript
// Sensitivity analysis through systematic perturbation
sensitivity_results = []
base_prediction = model.predict(base_scenario)

// Test sensitivity to each important variable
for each important_variable:
  variable_sensitivities = []
  
  // Test different percentage changes
  for change_percent in [-20%, -10%, -5%, +5%, +10%, +20%]:
    modified_scenario = base_scenario.copy()
    modified_scenario[important_variable] *= (1 + change_percent)
    new_prediction = model.predict(modified_scenario)
    
    sensitivity = abs(new_prediction - base_prediction) / abs(base_prediction)
    variable_sensitivities.append(sensitivity)
  
  average_sensitivity = mean(variable_sensitivities)
  sensitivity_results.append({variable: important_variable, sensitivity: average_sensitivity})

// Overall sensitivity score
total_sensitivity = sum(result.sensitivity for result in sensitivity_results)
sensitivity_score = min(total_sensitivity * 25, 100)  // Scale appropriately
```

**Retail Applications**:
- **Risk Assessment**: Understand how vulnerable performance is to market changes
- **Strategic Planning**: Identify which factors require most careful monitoring
- **Investment Decisions**: Assess robustness of business cases under different scenarios
- **Performance Optimization**: Focus improvement efforts on highest-impact variables

**Visualization Potential**:
- **🎯 Interactive Analysis**: Tornado charts showing variable impacts, sensitivity heatmaps, scenario comparison tables
- **Dynamic Modeling**: Real-time sensitivity sliders, "what-if" calculators, impact simulation dashboards
- **Risk Visualization**: Sensitivity risk matrices, robustness confidence intervals, critical factor alerts
- **Strategic Dashboards**: Key sensitivity metrics, monitoring dashboards, scenario planning tools

**Business Value**: **High** - Critical for risk management, strategic planning, and understanding business model vulnerabilities.

---

## Retail-Specific Processors

### BrandDifferenceProcessor ✅ **ACTIVE FOR RETAIL**
**Score Field**: `brand_difference_score` (-100 to +100 scale)

**Scoring Formula** (Brand Comparison Analysis from automation script):
```javascript
// Brand difference score (Nike vs Adidas comparison)
nike_share = safe_float(record.get('value_MP30034A_B_P', 0))
adidas_share = safe_float(record.get('value_MP30029A_B_P', 0))

if (nike_share + adidas_share > 0) {
  brand_difference_score = ((nike_share - adidas_share) / (nike_share + adidas_share)) * 100
} else {
  brand_difference_score = 0
}
```

**Formula Explanation**:
- Calculates competitive advantage between target brand (Nike) and primary competitor (Adidas)
- Positive scores indicate target brand dominance
- Negative scores indicate competitor advantage
- Score range: -100 (competitor dominance) to +100 (target brand dominance)

**Retail Relevance**: **Maximum** - Essential for brand competitive analysis in retail. Directly measures market share advantage, competitive positioning, and identifies markets where brand outperforms or underperforms against primary competitors.

---

### CompetitiveDataProcessor ✅ **ACTIVE FOR RETAIL** 
**Score Field**: `competitive_advantage_score` (0-100 scale)

**Target Variable**: Nike brand share (`MP30034A_B_P`) - the target_value represents Nike's market penetration percentage in each geographic area

**Scoring Formula** (Advanced Competitive Analysis with Semantic Field Resolution):

**✅ Universal Compatibility**: This algorithm works across **all project types** (retail, real estate, healthcare, finance) through semantic field resolution.

**Core Formula**:
```
Competitive Advantage Score = (0.35 × Market Dominance) + (0.35 × Demographic Advantage) + (0.20 × Economic Advantage) + (0.10 × Population Advantage)
```

**Semantic Field Mapping** (Project-Type Adaptive):
```python
# Retail Project (Nike vs competitors)
target_performance -> "brand_share" -> "MP30034A_B_P" (Nike market share)
competitor_brands -> ["MP30029A_B_P", "MP30032A_B_P", ...] (Adidas, Lululemon, etc.)

# Real Estate Project (Developer vs competitors)  
target_performance -> "property_value_index" -> "housing_market_share" 
competitor_brands -> ["dr_horton_share", "lennar_share", ...] (Home builders)

# Healthcare Project (Provider vs competitors)
target_performance -> "patient_satisfaction" -> "hospital_quality_score"
competitor_brands -> ["hospital_network_1", "clinic_chain_2", ...] (Healthcare providers)
```

**Component Calculations:**

### 1. Market Dominance Analysis (35% weight)
**Mathematical Model**: Relative Market Share Index
```python
def calculate_market_dominance(record, engine):
    # Semantic field resolution for any project type
    target_share = engine.extract_field_value(record, 'target_performance')
    competitor_fields = engine.get_competitor_fields()
    
    # Calculate total competitor market share
    total_competitor_share = 0
    for field in competitor_fields:
        competitor_value = engine.extract_field_value(record, field)
        total_competitor_share += competitor_value
    
    # Market dominance calculation
    if total_competitor_share > 0:
        # Relative market strength: target vs all competitors
        market_dominance = min((target_share / total_competitor_share) * 50, 100)
    else:
        # Monopoly scenario: scale target share directly
        market_dominance = min(target_share * 2, 100)
    
    return market_dominance
```

**Business Logic Explanation**:
- **Retail**: Nike 20% share vs Adidas 15% = strong position (dominance = 66.7)
- **Real Estate**: Builder with 30% market share vs 5 competitors averaging 10% each = dominance = 60
- **Healthcare**: Hospital with 40% patient satisfaction vs competitors at 25% average = dominance = 80

### 2. SHAP-based Demographic Advantage (35% weight)
**Mathematical Model**: Explainable AI Feature Importance Aggregation
```python
def calculate_demographic_advantage(record, engine):
    # Extract project-specific SHAP values through semantic resolution
    demographic_fields = engine.get_demographic_shap_fields()
    
    # Get SHAP normalization statistics for the project
    shap_stats = engine.get_shap_statistics()
    
    # Normalize SHAP values using min-max scaling across dataset
    normalized_shap = {}
    for field in demographic_fields:
        raw_shap = engine.extract_field_value(record, f'shap_{field}')
        normalized_shap[field] = normalize_shap(raw_shap, shap_stats[field])
    
    # Project-specific weighting (configurable per industry)
    weights = engine.get_demographic_weights()
    
    # Weighted combination of normalized SHAP importance scores
    demographic_advantage = sum(
        weights[field] * normalized_shap[field] 
        for field in demographic_fields
    )
    
    return demographic_advantage
```

**SHAP Normalization Formula**:
```
normalized_shap = (raw_shap - min_shap) / (max_shap - min_shap) * 100
```

**Project-Specific Demographics**:
- **Retail**: Asian population (0.30), Millennials (0.25), Gen Z (0.20), Households (0.15), Target brand (0.10)
- **Real Estate**: Family households (0.35), Income 75K+ (0.30), Age 30-45 (0.20), Property values (0.15)  
- **Healthcare**: Age 65+ (0.40), Insurance coverage (0.30), Chronic conditions (0.20), Healthcare access (0.10)

### 3. Economic Advantage Analysis (20% weight)
**Mathematical Model**: Multi-Factor Economic Composite
```python
def calculate_economic_advantage(record, engine):
    # Semantic field resolution for economic indicators
    income = engine.extract_field_value(record, 'consumer_income')
    wealth = engine.extract_field_value(record, 'wealth_indicator')
    
    # Project-specific economic thresholds
    income_target = engine.get_business_parameter('demographic_income_target')  # 75K retail, 85K real estate
    wealth_target = engine.get_business_parameter('wealth_threshold', 200)
    
    # Economic advantage calculation (0-100 scale)
    income_component = min((income / income_target) * 50, 50)
    wealth_component = min((wealth / wealth_target) * 50, 50) 
    
    economic_advantage = income_component + wealth_component
    return min(economic_advantage, 100)
```

**Industry-Specific Calibration**:
- **Retail**: $75K income target (consumer spending power)
- **Real Estate**: $85K income target (homebuying capacity)
- **Healthcare**: $65K income target (healthcare affordability)
- **Finance**: $100K income target (investment capacity)

### 4. Population Advantage Analysis (10% weight)
**Mathematical Model**: Market Size Potential Index
```python
def calculate_population_advantage(record, engine):
    # Semantic field resolution for market size
    population = engine.extract_field_value(record, 'market_size')
    
    # Project-specific population thresholds
    pop_threshold = engine.get_business_parameter('market_size_threshold')  # 50K retail, 25K real estate
    
    # Population advantage (logarithmic scaling for large markets)
    population_advantage = min((population / pop_threshold) * 100, 100)
    
    return population_advantage
```

**Market Size Thresholds**:
- **Retail**: 50,000 population (consumer market viability)
- **Real Estate**: 25,000 population (housing market depth) 
- **Healthcare**: 15,000 population (service area coverage)
- **Finance**: 10,000 population (investment market size)

**SHAP Integration**: This processor directly integrates SHAP (SHapley Additive exPlanations) values from the microservice to understand which demographic factors most influence Nike brand performance. SHAP values measure feature importance for machine learning predictions, providing explainable AI insights into brand success drivers.

**Microservice Data Flow**:
1. **Target Variable Assignment**: `nike_target = "MP30034A_B_P"` (Nike brand share)
2. **Data Extraction**: `result['target_value'] = safe_float(row[target_variable])` 
3. **SHAP Analysis**: `/factor-importance` endpoint with `method: "shap"` generates feature importance
4. **Field Mapping**: SHAP values stored as `shap_{field_name}` (e.g., `shap_ASIAN_CY_P`)
5. **Competitive Scoring**: Automation script combines market data with SHAP insights

**Retail Relevance**: **Maximum** - Core competitive analysis for retail brands. Uniquely combines actual market dominance with AI-driven demographic insights via SHAP analysis. Essential for understanding not just what markets Nike dominates, but WHY certain demographics drive brand success.

---

## Summary by Retail Relevance

### **Maximum Relevance** (Essential for Retail Analysis):
- **CoreAnalysisProcessor** - Strategic value assessment
- **MarketSizingProcessor** - Market opportunity sizing
- **CustomerProfileProcessor** - Customer analysis  
- **DemographicDataProcessor** - Target demographic fit
- **SegmentProfilingProcessor** - Market segmentation
- **AnalyzeProcessor** - SHAP-based data-driven market analysis
- **BrandDifferenceProcessor** - Nike vs Adidas competitive analysis
- **CompetitiveDataProcessor** - Advanced competitive analysis with SHAP AI insights

### **Very High Relevance** (Critical for Retail Strategy):
- **ComparativeAnalysisProcessor** - Competitive analysis
- **SpatialClustersProcessor** - Geographic market clustering
- **RiskDataProcessor** - Risk-adjusted opportunity assessment
- **StrategicAnalysisProcessor** - Strategic planning
- **PredictiveModelingProcessor** - Demand forecasting
- **TrendAnalysisProcessor** - Market trend identification

### **High Relevance** (Important for Retail Operations):
- **ConsensusAnalysisProcessor** - Validated insights
- **EnsembleAnalysisProcessor** - Robust predictions
- **CorrelationAnalysisProcessor** - Factor relationships
- **ScenarioAnalysisProcessor** - Strategic planning
- **TrendDataProcessor** - Trend data processing
- **ClusterDataProcessor** - Pattern recognition
- **FeatureImportanceRankingProcessor** - Factor prioritization
- **SensitivityAnalysisProcessor** - Impact analysis

### **Medium Relevance** (Supporting Analysis):
- **AlgorithmComparisonProcessor** - Model optimization
- **RealEstateAnalysisProcessor** - Location cost analysis
- **AnomalyDetectionProcessor** - Pattern detection
- **FeatureInteractionProcessor** - Complex relationships
- **ModelPerformanceProcessor** - Quality assurance
- **ModelSelectionProcessor** - Technical optimization
- **OutlierDetectionProcessor** - Exception identification

### **Low Relevance** (Limited Retail Application):
- **HousingMarketCorrelationProcessor** - Real estate focused
- **DimensionalityInsightsProcessor** - Technical utility

---

## 🎯 Example Queries and Usage Explanations

**Purpose**: This section provides concrete examples of user queries, corresponding endpoint mappings, and expected results to help users understand how to effectively use each analysis type.

**Query Format**: `"[User Question]" → [Endpoint] → [Expected Analysis Type] → [Key Insights Provided]`

---

### Core Business Analysis Examples

#### Strategic Analysis
```
Query: "What are the top strategic markets for Nike expansion?"
Endpoint: /strategic-analysis
Processor: StrategicAnalysisProcessor
Expected Results: 
- Strategic value scores (0-100) for each geographic area
- Top 10 markets ranked by expansion potential
- Multi-factor analysis combining demographics, competition, and market size
- Business opportunity assessment with risk factors

Usage: Strategic planning, market expansion, investment prioritization
```

#### Competitive Analysis  
```
Query: "Show me markets where Nike outperforms Adidas"
Endpoint: /competitive-analysis  
Processor: CompetitiveDataProcessor
Expected Results:
- Competitive advantage scores comparing Nike vs. competitors
- Geographic markets with strong Nike performance
- SHAP-based demographic insights explaining competitive success
- Market dominance analysis with demographic correlations

Usage: Competitive intelligence, market positioning, brand strategy
```

#### Brand Comparison
```
Query: "Nike vs Adidas market share comparison"
Endpoint: /brand-difference
Processor: BrandDifferenceProcessor  
Expected Results:
- Brand difference scores (-100 to +100 scale)
- Direct Nike vs Adidas share comparison
- Markets where each brand dominates
- Competitive positioning insights

Usage: Brand performance analysis, competitive benchmarking
```

---

### Demographic and Market Analysis Examples

#### Demographic Analysis
```
Query: "What demographics drive Nike's success?"
Endpoint: /demographic-insights
Processor: DemographicDataProcessor
Expected Results:
- Demographic opportunity scores (0-100)
- Age, income, ethnicity factor analysis  
- Population diversity scoring
- Target customer profile identification

Usage: Customer segmentation, marketing targeting, demographic strategy
```

#### Customer Profiling
```
Query: "Profile Nike's target customers by market"
Endpoint: /customer-profile  
Processor: CustomerProfileProcessor
Expected Results:
- Customer profile scores by geographic area
- Detailed demographic breakdowns
- Income and lifestyle characteristics
- Market-specific customer insights

Usage: Marketing strategy, product development, customer acquisition
```

#### Segment Analysis
```
Query: "Segment markets by customer characteristics"
Endpoint: /segment-profiling
Processor: SegmentProfilingProcessor
Expected Results:
- Market segmentation scores
- Customer segment classifications
- Behavioral and demographic groupings
- Segment performance metrics

Usage: Market segmentation, targeted campaigns, product positioning
```

---

### Advanced Analytics Examples

#### Predictive Modeling
```
Query: "Predict future Nike performance by market"
Endpoint: /predictive-modeling
Processor: PredictiveModelingProcessor  
Expected Results:
- Predictive scores (0-100) for future performance
- Trend-based forecasting
- Risk-adjusted predictions
- Market potential assessments

Usage: Financial planning, investment decisions, growth forecasting
```

#### Trend Analysis
```
Query: "Analyze Nike market trends over time"
Endpoint: /trend-analysis
Processor: TrendAnalysisProcessor
Expected Results:
- Trend strength scores (0-100)
- Directional trend indicators
- Market momentum analysis
- Temporal performance patterns

Usage: Market timing, seasonal planning, growth trend identification
```

#### Correlation Analysis
```
Query: "What factors correlate with Nike's performance?"
Endpoint: /correlation-analysis  
Processor: CorrelationAnalysisProcessor
Expected Results:
- Correlation strength scores (0-100)
- Factor relationship analysis
- Statistical correlations with demographics
- Predictive factor identification

Usage: Causal analysis, factor optimization, performance drivers
```

---

### Technical and Pattern Recognition Examples

#### Clustering Analysis
```
Query: "Group similar markets for Nike"
Endpoint: /spatial-clusters
Processor: SpatialClustersProcessor
Expected Results:
- Cluster quality scores (0-100)
- Market groupings by performance
- Geographic cluster identification
- Similar market recommendations

Usage: Market grouping, resource allocation, portfolio management
```

#### Anomaly Detection
```
Query: "Find unusual Nike performance patterns"
Endpoint: /anomaly-detection
Processor: AnomalyDetectionProcessor
Expected Results:
- Anomaly scores (0-100, higher = more unusual)
- Outlier market identification  
- Unusual performance patterns
- Opportunity and risk alerts

Usage: Exception analysis, opportunity discovery, risk identification
```

#### Feature Importance
```
Query: "What factors matter most for Nike's success?"
Endpoint: /feature-importance-ranking
Processor: FeatureImportanceRankingProcessor
Expected Results:
- Feature importance scores (0-100)
- SHAP-based factor rankings
- Demographic factor prioritization
- Explainable AI insights

Usage: Factor prioritization, strategy focus, causal understanding
```

---

### Scenario and Risk Analysis Examples

#### Scenario Planning
```
Query: "Analyze different market scenarios for Nike"
Endpoint: /scenario-analysis
Processor: ScenarioAnalysisProcessor
Expected Results:
- Scenario scores for different conditions
- Optimistic/realistic/pessimistic projections
- Risk-adjusted scenario outcomes
- Strategic planning insights

Usage: Strategic planning, risk assessment, decision support
```

#### Sensitivity Analysis  
```
Query: "How sensitive is Nike's performance to demographic changes?"
Endpoint: /sensitivity-analysis
Processor: SensitivityAnalysisProcessor
Expected Results:
- Sensitivity scores (0-100)
- Variable impact measurements
- "What-if" scenario results
- Critical factor identification

Usage: Risk management, scenario testing, variable impact assessment
```

---

### Comparative and Consensus Analysis Examples

#### Comparative Analysis
```
Query: "Compare Nike performance across different markets"
Endpoint: /comparative-analysis
Processor: ComparativeAnalysisProcessor  
Expected Results:
- Comparative scores (percentile rankings 0-100)
- Market performance rankings
- Relative performance analysis
- Benchmark comparisons

Usage: Performance benchmarking, market ranking, competitive analysis
```

#### Consensus Analysis
```
Query: "Get consensus view on Nike market opportunities"
Endpoint: /consensus-analysis
Processor: ConsensusAnalysisProcessor
Expected Results:
- Consensus scores aggregating multiple analyses
- Multi-method validation
- Robust opportunity identification
- High-confidence recommendations

Usage: Decision validation, risk reduction, comprehensive assessment
```

---

### Data Science and Model Analysis Examples

#### Algorithm Comparison
```
Query: "Compare different analytical approaches for Nike data"
Endpoint: /algorithm-comparison
Processor: AlgorithmComparisonProcessor
Expected Results:
- Algorithm performance scores (0-100)
- Model comparison metrics
- Analytical approach recommendations
- Technical optimization insights

Usage: Technical optimization, model selection, analytical quality assurance
```

#### Model Performance
```
Query: "Evaluate Nike analysis model quality"
Endpoint: /model-performance  
Processor: ModelPerformanceProcessor
Expected Results:
- Model performance scores (0-100)
- Quality metrics and validation
- Predictive accuracy assessment
- Model reliability indicators

Usage: Quality assurance, model validation, technical assessment
```

---

### Usage Guidelines and Best Practices

#### Query Formulation Tips
1. **Be Specific**: Include brand names (Nike, Adidas) and analysis type
2. **Use Action Words**: "compare", "analyze", "predict", "show", "identify"
3. **Specify Geography**: "by market", "across regions", "in top cities" 
4. **Include Metrics**: "market share", "performance", "opportunities"

#### Example Query Patterns
```
Strategic: "Show me the best [brand] expansion opportunities"
Competitive: "Compare [brand A] vs [brand B] performance"  
Demographic: "What demographics drive [brand] success?"
Predictive: "Predict future [brand] performance trends"
Clustering: "Group similar markets for [brand] analysis"
```

#### Expected Response Elements
- **Quantitative Scores**: Numerical rankings and assessments
- **Geographic Insights**: Market-specific recommendations
- **Demographic Analysis**: Customer and market characteristics
- **Business Recommendations**: Actionable strategic insights
- **Visual Data**: Map visualizations and performance charts

---

## Data Pipeline and Microservice Integration

### Complete Data Flow Architecture

1. **Target Variable Definition**:
   - Nike Brand Analysis: `target_variable = "MP30034A_B_P"` 
   - Adidas Brand Analysis: `target_variable = "MP30029A_B_P"`
   - Target represents market share percentage in each geographic area

2. **Microservice Data Extraction** (`enhanced_analysis_worker.py`):
   ```python
   # Extract target value from microservice data
   target_val = safe_float(row[target_variable])
   result['target_value'] = target_val  # Used by all processors
   result[clean_field_name] = target_val  # Nike/Adidas specific field
   ```

3. **SHAP Value Generation**:
   - **Endpoint**: `/factor-importance` with `method: "shap"`
   - **Purpose**: Generates explainable AI feature importance for target variable
   - **Format**: SHAP values stored as `shap_{field_name}` (e.g., `shap_ASIAN_CY_P`)
   - **Usage**: Multiple processors use SHAP values for scoring (CompetitiveDataProcessor, FeatureImportanceRankingProcessor)

4. **Field Extraction Pattern**:
   ```python
   # Demographic fields: Population, ethnicity, age distribution
   # Target fields: Project-specific metrics (brand share, property values, etc.)
   # SHAP fields: shap_{field_name} for explainable AI feature importance
   # Economic fields: Income, wealth indices, economic indicators
   ```

5. **Automation Pipeline** (`automated_score_calculator.py`):
   - Processes microservice data through multiple scoring algorithms
   - Integrates SHAP values for explainable scoring
   - Generates processor-specific scores using actual formulas
   - Outputs comprehensive analysis data for visualization

### Microservice Role and Purpose

The **SHAP Demographic Analytics Microservice** serves as the core data intelligence engine:

- **Data Source**: Comprehensive demographic, economic, and brand fields per geographic area
- **AI Processing**: Machine learning models with SHAP explainability
- **Target Analysis**: Configurable target variables based on project requirements
- **Outputs**: Raw data + SHAP feature importance + correlation analysis
- **Integration**: Feeds processed data to analysis processors

The microservice is essential because it provides both the raw market data AND the explainable AI insights that make processor scoring scientifically rigorous rather than just heuristic calculations.

---

*This document provides comprehensive coverage of all processors in the MPIQ AI Chat system with specific focus on scoring methodologies, SHAP integration, and retail market analysis applications.*