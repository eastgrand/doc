# PROCESSORS_RETAIL.md - Complete Processor Analysis Guide

This document provides comprehensive information about all analysis processors in the MPIQ AI Chat system, including their scoring formulas, methodologies, and specific relevance to retail market analysis.

## Overview

The system contains **35 total processors** organized into different categories:
- **22 Successfully Migrated Processors** (using BaseProcessor architecture)
- **9 Generic/Technical Processors** (ML utilities, no migration required)
- **2 Retail-Specific Processors** (BrandDifferenceProcessor, CompetitiveDataProcessor - available for retail projects)
- **2 Utility Files** (BaseProcessor, support files)

## Two-Layer Scoring Architecture Summary

**🚀 CRITICAL: Understanding the Scoring Process**

The system uses a sophisticated two-layer architecture that separates AI intelligence from visualization:

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

### Key Points:
1. **SHAP values are PRE-CALCULATED** by the microservice for each endpoint
2. **Automation script USES** these SHAP values to generate processor-specific scores
3. **Processors CONSUME** the automation-generated scores, not raw SHAP values
4. This separation provides both explainable AI rigor AND performance optimization

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

**Scoring Formula**: Uses pre-calculated `analysis_score` field from upstream data source (microservice or automation pipeline). The AnalyzeProcessor itself does not calculate the score but processes the existing field.

**Note**: The `analysis_score` is calculated by the data generation pipeline and represents a general market analysis score optimized for retail market evaluation. The processor validates that this field exists and processes it for visualization and ranking.

**Analysis Description**: General retail analysis processor providing comprehensive market insights across geographic areas with standardized scoring for retail location analysis, market penetration, and competitive assessment.

**Retail Relevance**: **High** - Directly applicable to retail location analysis, market penetration assessment, and competitive positioning. Provides actionable insights for store placement and market entry strategies.

---

### ComparativeAnalysisProcessor  
**Score Field**: `comparative_score` (0-100 scale)

**Scoring Formula** (Percentile-Based Ranking from automation script):
```javascript
// Calculate percentiles for relative comparison
values = [target_value for each record where target_value > 0]
values_sorted = sorted(values)

// For each record:
if (target_value > 0) {
  percentile = (count of values <= target_value) / total_count * 100
} else {
  percentile = 0
}

comparative_score = percentile
```

**Fallback**: If no valid target values exist, assigns neutral score of 50.0 to all records.

**Analysis Description**: Compares performance metrics across different geographic areas or market segments using percentile ranking to identify relative market strengths and competitive opportunities.

**Retail Relevance**: **Very High** - Essential for competitive analysis in retail. Provides percentile-based rankings to identify markets where brand outperforms competitors, optimal expansion locations, and areas needing strategic intervention.

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
**Score Field**: `strategic_analysis_score` (0-100 scale)

**Scoring Formula**:
- **Market Position (30%)**: Current competitive standing
- **Growth Trajectory (25%)**: Historical and projected growth
- **Strategic Fit (25%)**: Alignment with business objectives
- **Resource Requirements (20%)**: Investment needs vs. expected returns

**Analysis Description**: High-level strategic analysis combining market position, growth potential, and resource allocation for long-term planning.

**Retail Relevance**: **Very High** - Perfect for strategic retail planning. Evaluates long-term market potential, competitive positioning, and resource allocation priorities for sustainable growth.

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

**Scoring Formula**:
- **Demographic Match (40%)**: Alignment with target customer profile
- **Behavioral Indicators (30%)**: Purchase patterns and preferences
- **Lifetime Value Potential (20%)**: Projected customer value
- **Acquisition Cost (10%)**: Cost to reach and convert customers

**Analysis Description**: Analyzes customer demographics, behaviors, and characteristics to create detailed customer profiles and identify high-value segments.

**Retail Relevance**: **Maximum** - Core retail processor for understanding customer base. Essential for targeted marketing, product assortment planning, and customer acquisition strategies.

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

## Technical/ML Processors (Generic - No Migration Required)

### AnomalyDetectionProcessor
**Score Field**: `anomaly_score` (0-100 scale, higher = more anomalous)

**Analysis Description**: Detects unusual patterns or outliers in data that may indicate errors, fraud, or exceptional opportunities.

**Retail Relevance**: **Medium** - Useful for identifying unusual sales patterns, potential fraud, or exceptional market opportunities. Generic utility processor.

---

### ClusterDataProcessor
**Score Field**: `cluster_quality_score` (0-100 scale)

**Analysis Description**: Groups similar data points into clusters for pattern recognition and segmentation analysis.

**Retail Relevance**: **High** - Valuable for customer segmentation, market grouping, and pattern identification in retail data.

---

### DimensionalityInsightsProcessor
**Score Field**: `dimensionality_score` (0-100 scale)

**Analysis Description**: Analyzes high-dimensional data to identify key components and reduce complexity while preserving insights.

**Retail Relevance**: **Low** - Technical processor primarily for data science optimization. Limited direct retail application.

---

### FeatureImportanceRankingProcessor
**Score Field**: `feature_importance_score` (0-100 scale)

**Scoring Formula** (SHAP-Based Feature Importance from automation script):
```javascript
// Sum absolute SHAP values across all demographic factors
shap_sum = 0
shap_count = 0

for (key, value) in record.items():
  if key.startswith('shap_') and is_numeric(value):
    shap_sum += abs(float(value))  // Absolute SHAP importance
    shap_count += 1

if (shap_count > 0):
  feature_importance_score = min((shap_sum / shap_count) * 10, 100)
else:
  feature_importance_score = 50  // Default neutral score
```

**SHAP Integration**: Directly processes SHAP values from microservice to rank demographic and brand factors by their predictive importance for the target variable (e.g., Nike brand share).

**Analysis Description**: Ranks the importance of different variables in predicting business outcomes using explainable AI through SHAP values.

**Retail Relevance**: **High** - Helps retailers understand which demographic factors most influence brand performance and sales success using scientifically rigorous feature importance from machine learning models.

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

**Analysis Description**: Analyzes how changes in input variables affect output results and model predictions.

**Retail Relevance**: **High** - Valuable for understanding which factors most impact retail performance and testing scenario robustness.

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

**Scoring Formula** (Advanced Competitive Analysis from automation script):

**Competitive Advantage Score = (0.35 × Market Dominance) + (0.35 × Demographic Advantage) + (0.20 × Economic Advantage) + (0.10 × Population Advantage)**

**Component Calculations:**
1. **Market Dominance (35% weight)**:
   ```javascript
   nike_share = record['value_MP30034A_B_P']  // Target variable
   competitor_brands = ['MP30029A_B_P', 'MP30032A_B_P', 'MP30031A_B_P', 'MP30035A_B_P',
                       'MP30033A_B_P', 'MP30030A_B_P', 'MP30037A_B_P', 'MP30036A_B_P']
   total_competitor_share = sum(record[f'value_{brand}'] for brand in competitor_brands)
   
   if (total_competitor_share > 0) {
     market_dominance = min((nike_share / total_competitor_share) * 50, 100)
   } else {
     market_dominance = nike_share * 2  // No competitors = high dominance
   }
   ```

2. **SHAP-based Demographic Advantage (35% weight)**:
   ```javascript
   // Extract SHAP values from microservice data
   nike_shap = record['shap_MP30034A_B_P']
   asian_shap = record['shap_ASIAN_CY_P'] 
   millennial_shap = record['shap_MILLENN_CY']
   gen_z_shap = record['shap_GENZ_CY']
   household_shap = record['shap_HHPOP_CY']
   
   // Normalize SHAP values using min-max scaling across all records
   normalized_shap = normalize_to_0_100_scale(shap_values, dataset_statistics)
   
   // Weighted combination of normalized SHAP importance scores
   demographic_advantage = (
     0.30 * normalized_shap['asian'] +      // Asian population SHAP importance
     0.25 * normalized_shap['millennial'] + // Millennial generation SHAP importance 
     0.20 * normalized_shap['gen_z'] +      // Gen Z generation SHAP importance
     0.15 * normalized_shap['household'] +  // Household population SHAP importance
     0.10 * normalized_shap['nike']         // Nike brand SHAP self-importance
   )
   ```

3. **Economic Advantage (20% weight)**:
   ```javascript
   median_income = record['median_income']
   wealth_index = record['value_WLTHINDXCY'] 
   economic_advantage = min((median_income / 100000) * 50 + (wealth_index / 200) * 50, 100)
   ```

4. **Population Advantage (10% weight)**:
   ```javascript
   total_population = record['total_population']
   population_advantage = min((total_population / 20000) * 100, 100)
   ```

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

### **Very High Relevance** (Critical for Retail Strategy):
- **ComparativeAnalysisProcessor** - Competitive analysis
- **SpatialClustersProcessor** - Geographic market clustering
- **RiskDataProcessor** - Risk-adjusted opportunity assessment
- **StrategicAnalysisProcessor** - Strategic planning
- **PredictiveModelingProcessor** - Demand forecasting
- **TrendAnalysisProcessor** - Market trend identification

### **High Relevance** (Important for Retail Operations):
- **AnalyzeProcessor** - General market analysis
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