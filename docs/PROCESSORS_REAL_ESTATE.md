# PROCESSORS_REAL_ESTATE.md - Real Estate Investment Analysis Guide

This document provides comprehensive information about all analysis processors in the MPIQ AI Chat system from a real estate investment perspective, including their scoring formulas, methodologies, and specific relevance to real estate market analysis and property investment decisions.

## Overview

The system contains **35 total processors** optimized for real estate analysis:
- **22 Successfully Migrated Processors** (adapted for real estate using BaseProcessor architecture)
- **9 Generic/Technical Processors** (ML utilities applicable to real estate data)
- **2 Retired Processors** (retail-specific, not applicable to real estate)
- **2 Utility Files** (BaseProcessor architecture, support infrastructure)

All processors have been adapted to work with Quebec housing market data fields (ECYPTAPOP, ECYHRIAVG, etc.) and real estate-specific terminology.

---

## Core Real Estate Analysis Processors

### AlgorithmComparisonProcessor
**Score Field**: `algorithm_comparison_score` (0-100 scale)

**Scoring Formula**: 
- **Model Performance Weight (40%)**: Cross-validation accuracy for real estate predictions
- **Efficiency Weight (30%)**: Processing speed for large property datasets
- **Robustness Weight (20%)**: Stability across different housing markets
- **Interpretability Weight (10%)**: Explainability for investment decisions

**Analysis Description**: Compares multiple machine learning algorithms to identify the best-performing model for real estate market predictions and property valuation.

**Real Estate Relevance**: **High** - Essential for selecting optimal prediction models for property value forecasting, market trend analysis, and investment risk assessment. Helps real estate professionals choose the most accurate analytical approach for different market conditions.

---

### AnalyzeProcessor
**Score Field**: `analysis_score` (0-100 scale)

**Scoring Formula**: Uses pre-calculated `analysis_score` with real estate fallback calculation:
- **Base Score**: Primary housing market metric
- **Population Density**: `Math.min(population / 100000, 1) * 15` (market size factor)
- **Income Adjustment**: `(household_income - 30000) / 70000 * 20` (affordability factor)
- **Housing Market Gap**: `(100 - homeowner_rate - rental_rate) * 0.4` (market opportunity)

**Analysis Description**: General real estate analysis processor providing comprehensive housing market insights across geographic areas with standardized scoring for investment opportunities.

**Real Estate Relevance**: **Maximum** - Core processor for real estate investment analysis. Directly applicable to property location analysis, market penetration assessment, and housing market opportunity identification. Essential for property developers and real estate investors.

---

### ComparativeAnalysisProcessor  
**Score Field**: `comparative_score` (0-100 scale)

**Scoring Formula**: 
- **Property Value Performance (40%)**: Comparative property value trends
- **Market Activity Impact (30%)**: Relative transaction volume and speed
- **Neighborhood Growth (20%)**: Comparative development and appreciation
- **Investment Advantage (10%)**: Unique property/location benefits

**Analysis Description**: Compares housing market performance metrics across different geographic areas or property types to identify relative investment strengths and opportunities.

**Real Estate Relevance**: **Maximum** - Essential for comparative market analysis (CMA) in real estate. Helps identify markets with superior property appreciation, optimal investment locations, and areas with competitive advantages for development or acquisition.

---

### ConsensusAnalysisProcessor
**Score Field**: `consensus_score` (0-100 scale)

**Scoring Formula**:
- **Model Agreement Weight (50%)**: Consensus between multiple property valuation models
- **Market Confidence Intervals (25%)**: Statistical confidence in housing market predictions
- **Historical Validation (15%)**: Past accuracy of property value forecasts
- **Expert Validation (10%)**: Real estate professional review alignment

**Analysis Description**: Aggregates insights from multiple real estate analysis methods to provide consensus-driven investment recommendations with confidence metrics.

**Real Estate Relevance**: **Maximum** - Critical for reducing investment risk in real estate decisions. Provides validated insights from multiple analytical approaches, essential for major property acquisitions, development projects, and portfolio investments.

---

### CoreAnalysisProcessor
**Score Field**: `strategic_value_score` (0-10 scale, converted to 0-100)

**Scoring Formula** (Real Estate Strategic Value - 5 components):
1. **Market Opportunity (0-3 points)**: `Math.min(3, (housing_market_gap / 100) * 3)`
   - Untapped housing demand and development potential
2. **Economic Attractiveness (0-2 points)**:
   - Income factor: `Math.max(0, (median_income - 30000) / 70000)` (affordability)
   - Population factor: `Math.min(population / 100000, 1)` (market size)
3. **Competitive Position (0-2 points)**:
   - Market strength: `Math.max(0, property_values / regional_average)`
   - Location advantage: `Math.max(0, (accessibility_score - competitor_score) / 25)`
4. **Growth Potential (0-2 points)**:
   - Development bonus: `undeveloped_land > 30% ? 1 : undeveloped_land / 30`
   - Income growth bonus: `income_growth > 3% ? 1 : 0`
5. **Strategic Fit (0-1 points)**: `Math.min(1, urban_density > 2500 ? 1 : urban_density / 2500)`

**Analysis Description**: Most comprehensive real estate processor providing strategic investment value assessment through multi-dimensional analysis of housing market opportunity, economics, location, and growth potential.

**Real Estate Relevance**: **Maximum** - The gold standard for real estate investment analysis. Provides actionable strategic value scores considering all critical factors: housing demand, affordability, location competitiveness, development potential, and urban growth patterns.

---

### EnsembleAnalysisProcessor
**Score Field**: `ensemble_score` (0-100 scale)

**Scoring Formula**:
- **Weighted Model Average (60%)**: Multiple property valuation models weighted by accuracy
- **Variance Penalty (20%)**: Reduces score for high prediction disagreement
- **Market Confidence Boost (15%)**: Increases score for high-confidence housing predictions  
- **Outlier Detection (5%)**: Flags and adjusts for unusual property characteristics

**Analysis Description**: Combines multiple real estate machine learning models using ensemble methods to improve property valuation accuracy and market prediction reliability.

**Real Estate Relevance**: **Very High** - Provides more robust property valuations and market predictions by combining multiple analytical approaches. Particularly valuable for accurate property pricing, market timing, and investment risk assessment.

---

### SpatialClustersProcessor
**Score Field**: `cluster_performance_score` (0-100 scale)

**Scoring Formula**:
- **Geographic Cohesion (40%)**: How tightly grouped similar housing markets are
- **Market Differentiation (30%)**: How distinct different housing submarkets are
- **Neighborhood Continuity (20%)**: Spatial proximity of similar property types
- **Investment Relevance (10%)**: Alignment with real estate investment objectives

**Analysis Description**: Identifies geographic clusters of similar housing market characteristics and property performance patterns for targeted real estate investment and development strategies.

**Real Estate Relevance**: **Maximum** - Essential for real estate portfolio expansion and development planning. Identifies similar housing markets for investment strategies, helps understand neighborhood patterns, and optimizes property acquisition and development efforts across markets.

---

## Specialized Real Estate Processors

### HousingMarketCorrelationProcessor
**Score Field**: `housing_correlation_score` (0-100 scale)

**Scoring Formula**:
- **Income-Housing Value Correlation (35%)**: Relationship between household income and property values
- **Population Density Impact (25%)**: Effect of population density on housing demand
- **Age Demographics Housing (20%)**: Age group correlation with housing preferences
- **Economic Housing Indicators (20%)**: Employment and stability effects on housing market

**Analysis Description**: Analyzes correlations between demographic factors and housing market performance to identify key drivers of real estate value and investment potential.

**Real Estate Relevance**: **Maximum** - Core real estate analysis processor. Directly measures relationships between demographic factors and housing market performance. Critical for understanding what drives property values, housing demand, and market appreciation in different areas.

---

### MarketSizingProcessor
**Score Field**: `market_sizing_score` (0-100 scale)

**Scoring Formula**:
- **Housing Revenue Potential**: `Math.sqrt((households / 20000) * (median_income / 80000))`
- **Housing Market Categories**:
  - Mega Housing Market: `households >= 60K && income >= 80K`
  - Large Housing Market: `households >= 40K && income >= 60K`  
  - Medium Housing Market: `households >= 30K || income >= 100K`
- **Development Opportunity**: Based on available land and zoning capacity

**Analysis Description**: Evaluates total addressable housing market size, development potential, and investment revenue opportunities across geographic real estate markets.

**Real Estate Relevance**: **Maximum** - Critical for real estate development and investment planning. Directly measures housing market size, development revenue potential, and investment opportunity scale. Essential for prioritizing development projects, property acquisitions, and market entry decisions.

---

### RealEstateAnalysisProcessor
**Score Field**: `real_estate_score` (0-100 scale)

**Scoring Formula**: 
- **Property Value Trends (30%)**: Historical and projected property appreciation
- **Market Liquidity (25%)**: Housing transaction volume and days on market
- **Development Potential (25%)**: Zoning capacity, permits, and growth opportunity
- **Location Quality (20%)**: Transportation, amenities, and neighborhood infrastructure

**Analysis Description**: Comprehensive real estate market analysis focusing on property values, development opportunities, market liquidity, and location quality for investment decisions.

**Real Estate Relevance**: **Maximum** - Primary real estate investment processor. Directly analyzes property value trends, market activity, development potential, and location advantages. Core tool for property investors, developers, and real estate professionals.

---

### RiskDataProcessor
**Score Field**: `risk_adjusted_score` (0-100 scale)

**Scoring Formula** (Real Estate Risk Assessment):
- **Base Property Value**: Starting investment opportunity score
- **Market Volatility Penalty**: `-market_volatility * 20` (0-20 point reduction)
- **Economic Uncertainty Penalty**: `-economic_uncertainty * 15` (0-15 point reduction)  
- **Market Stability Bonus**: `+housing_market_stability * 10` (0-10 point addition)
- **Final Score**: `Math.max(0, Math.min(100, base_value - volatility_penalty - uncertainty_penalty + stability_bonus))`

**Analysis Description**: Provides risk-adjusted real estate investment scores by penalizing market volatility and economic uncertainty while rewarding housing market stability and predictability.

**Real Estate Relevance**: **Maximum** - Critical for real estate investment risk management. Helps identify stable housing markets vs. high-risk investment opportunities. Essential for portfolio management, risk assessment, and prudent real estate investment decisions.

---

### StrategicAnalysisProcessor
**Score Field**: `strategic_analysis_score` (0-100 scale)

**Scoring Formula** (Real Estate Strategic Planning):
- **Market Position (30%)**: Current competitive standing in housing market
- **Growth Trajectory (25%)**: Historical and projected real estate market growth
- **Strategic Fit (25%)**: Alignment with real estate investment objectives
- **Resource Requirements (20%)**: Development investment needs vs. expected returns

**Analysis Description**: High-level strategic real estate analysis combining market position, growth potential, and resource allocation for long-term property investment planning.

**Real Estate Relevance**: **Maximum** - Perfect for strategic real estate portfolio planning. Evaluates long-term housing market potential, competitive positioning, and resource allocation priorities for sustainable real estate investment growth.

---

## Demographic and Market Analysis for Real Estate

### CorrelationAnalysisProcessor
**Score Field**: `correlation_strength_score` (0-100 scale)

**Scoring Formula** (Housing Market Correlations):
- **Statistical Significance (40%)**: P-values for housing market relationships
- **Correlation Strength (35%)**: Correlation coefficients for property factors  
- **Real Estate Relevance (15%)**: Practical significance for property investment
- **Data Quality (10%)**: Housing market data completeness and reliability

**Analysis Description**: Identifies and quantifies relationships between demographic, economic, and housing market variables to understand key drivers of real estate performance.

**Real Estate Relevance**: **Very High** - Helps real estate investors understand what demographic and market factors drive property values and housing demand. Critical for location selection, market timing, and investment optimization.

---

### CustomerProfileProcessor  
**Score Field**: `customer_profile_score` (0-100 scale) → **Homebuyer Profile Score**

**Scoring Formula** (Real Estate Buyer Analysis):
- **Demographic Match (40%)**: Alignment with target homebuyer demographics
- **Financial Indicators (30%)**: Income, credit, and purchasing power analysis
- **Housing Preferences (20%)**: Property type and location preferences
- **Market Timing (10%)**: Likelihood to purchase within investment timeframe

**Analysis Description**: Analyzes homebuyer demographics, financial capacity, and housing preferences to create detailed buyer profiles and identify high-value market segments for real estate development.

**Real Estate Relevance**: **Very High** - Essential for understanding the homebuyer market. Critical for targeted property development, pricing strategies, marketing approaches, and identifying optimal customer segments for different housing products.

---

### DemographicDataProcessor
**Score Field**: `demographic_score` (0-100 scale) → **Housing Market Demographic Score**

**Scoring Formula** (Real Estate Demographic Fit - 4 components):
1. **Household Income Component (40% weight)**: `Math.min((household_income / 100000) * 40, 40)`
   - Higher income indicates stronger housing market and affordability
2. **Population Market Size (25% weight)**: `Math.min((population / 50000) * 25, 25)`
   - Larger population provides more housing demand and market opportunity
3. **Housing Market Activity (20% weight)**: `Math.min((total_housing_units / 10000) * 20, 20)`
   - More housing stock indicates active, developed market
4. **Target Demographics (15% weight)**: `Math.min((prime_homebuying_age_pop / total_pop) * 100 * 15, 15)`
   - Higher concentration of prime homebuying demographics (25-45 years)

**Analysis Description**: Analyzes demographic characteristics specifically for housing market potential, including income levels, population size, housing stock, and homebuying demographics to assess real estate investment opportunity.

**Real Estate Relevance**: **Maximum** - Core demographic processor for real estate analysis. Directly measures housing market demographic fit, buying power, market size, and homebuyer concentration. Essential for real estate market assessment and development planning.

---

### PredictiveModelingProcessor
**Score Field**: `prediction_confidence_score` (0-100 scale)

**Scoring Formula** (Real Estate Forecasting):
- **Property Value Accuracy (50%)**: Historical accuracy of property value predictions
- **Market Trend Importance (25%)**: Strength of real estate trend predictive variables
- **Housing Data Quality (15%)**: Completeness of property and market data
- **Model Validation (10%)**: Cross-validation performance on housing market data

**Analysis Description**: Builds and evaluates predictive models specifically for real estate forecasting including property values, housing market trends, and investment performance.

**Real Estate Relevance**: **Maximum** - Critical for property value forecasting, market timing, and investment planning. Helps real estate professionals anticipate market changes, optimize acquisition timing, and predict property appreciation.

---

### ScenarioAnalysisProcessor
**Score Field**: `scenario_score` (0-100 scale)

**Scoring Formula** (Real Estate Scenario Planning):
- **Base Case Housing Performance (40%)**: Expected real estate outcomes under normal conditions
- **Market Upside Potential (25%)**: Best-case housing market scenarios
- **Economic Downside Risk (20%)**: Worst-case impact on real estate values
- **Probability Weighting (15%)**: Likelihood of different housing market conditions

**Analysis Description**: Evaluates multiple real estate market scenarios to assess potential property investment outcomes, housing market risks, and opportunities under different economic conditions.

**Real Estate Relevance**: **Very High** - Valuable for real estate investment planning and risk assessment. Helps property investors prepare for different market conditions, economic cycles, and optimize decision-making for housing market uncertainty.

---

### SegmentProfilingProcessor
**Score Field**: `segment_performance_score` (0-100 scale) → **Housing Market Segment Score**

**Scoring Formula** (Real Estate Market Segmentation):
- **Segment Size (30%)**: Housing market segment size and household count
- **Property Value Potential (30%)**: Revenue and appreciation potential per segment
- **Market Accessibility (25%)**: Ease of serving different housing segments
- **Growth Potential (15%)**: Housing segment expansion and development opportunities

**Analysis Description**: Analyzes different housing market segments to identify characteristics, preferences, and investment profitability of distinct homebuyer and property groups.

**Real Estate Relevance**: **Maximum** - Core real estate capability for housing market segmentation. Essential for targeted property development, pricing strategies, and understanding different homebuyer segments (first-time buyers, luxury market, investment properties, etc.).

---

### TrendAnalysisProcessor
**Score Field**: `trend_strength_score` (0-100 scale)

**Scoring Formula** (Real Estate Market Trends):
- **Housing Trend Direction (40%)**: Positive vs. negative real estate trend identification
- **Market Trend Magnitude (30%)**: Strength and rate of property value changes
- **Trend Persistence (20%)**: Historical consistency of housing market trends
- **Leading Indicators (10%)**: Early signals for real estate market trend changes

**Analysis Description**: Identifies and analyzes housing market trends, seasonal patterns, and emerging shifts in real estate demand, property values, and market dynamics.

**Real Estate Relevance**: **Maximum** - Essential for staying ahead of housing market changes. Helps real estate investors and developers adapt strategies, timing, and property types to emerging market trends and buyer preferences.

---

### TrendDataProcessor
**Score Field**: `trend_data_score` (0-100 scale)

**Scoring Formula** (Housing Market Data Analysis):
- **Housing Data Quality (35%)**: Completeness and accuracy of real estate data
- **Market Trend Clarity (30%)**: Statistical significance of housing market trends
- **Investment Actionability (20%)**: Practical implications for real estate decisions
- **Predictive Value (15%)**: Forward-looking insights for property investment

**Analysis Description**: Processes and analyzes real estate trend data to extract meaningful insights about housing market direction, property value momentum, and investment timing.

**Real Estate Relevance**: **Very High** - Supports data-driven real estate analysis and decision-making. Provides foundation for understanding housing market momentum, property appreciation trends, and directional market changes.

---

## Technical/ML Processors for Real Estate Data

### AnomalyDetectionProcessor
**Score Field**: `anomaly_score` (0-100 scale, higher = more anomalous)

**Analysis Description**: Detects unusual patterns in real estate data that may indicate market opportunities, data errors, or exceptional property characteristics.

**Real Estate Relevance**: **High** - Valuable for identifying unusual property pricing, exceptional market conditions, or unique investment opportunities. Helps detect undervalued properties or emerging market hotspots.

---

### ClusterDataProcessor
**Score Field**: `cluster_quality_score` (0-100 scale)

**Analysis Description**: Groups similar properties, markets, or demographic areas into clusters for real estate pattern recognition and market segmentation.

**Real Estate Relevance**: **Very High** - Essential for property classification, market segmentation, and identifying similar investment opportunities. Helps group properties by characteristics, neighborhoods by potential, and markets by performance.

---

### DimensionalityInsightsProcessor
**Score Field**: `dimensionality_score` (0-100 scale)

**Analysis Description**: Analyzes complex real estate datasets to identify key components and reduce complexity while preserving important property and market insights.

**Real Estate Relevance**: **Medium** - Technical processor for optimizing real estate data analysis. Helps manage complex property datasets but limited direct investment application.

---

### FeatureImportanceRankingProcessor
**Score Field**: `feature_importance_score` (0-100 scale)

**Analysis Description**: Ranks the importance of different variables in predicting real estate outcomes, property values, and housing market performance.

**Real Estate Relevance**: **Very High** - Crucial for understanding which factors most influence property values, housing demand, and market performance. Helps prioritize investment criteria and market analysis factors.

---

### FeatureInteractionProcessor
**Score Field**: `interaction_strength_score` (0-100 scale)

**Analysis Description**: Identifies interactions between different real estate variables that may have combined effects on property values or housing market performance.

**Real Estate Relevance**: **High** - Useful for understanding complex relationships between location, demographics, economic factors, and property performance. Helps identify synergistic investment opportunities.

---

### ModelPerformanceProcessor
**Score Field**: `model_performance_score` (0-100 scale)

**Analysis Description**: Evaluates and compares the performance of different real estate analytical models and property valuation approaches.

**Real Estate Relevance**: **High** - Ensures quality of real estate analysis and model accuracy for property valuation and market prediction. Important for maintaining analytical reliability.

---

### ModelSelectionProcessor
**Score Field**: `model_selection_score` (0-100 scale)

**Analysis Description**: Selects optimal analytical models for specific real estate tasks such as property valuation, market analysis, or investment forecasting.

**Real Estate Relevance**: **High** - Technical processor for optimizing real estate analytical approaches. Ensures use of best-performing models for different property analysis tasks.

---

### OutlierDetectionProcessor  
**Score Field**: `outlier_score` (0-100 scale, higher = more outlier-like)

**Analysis Description**: Identifies properties, markets, or data points that significantly deviate from expected real estate patterns.

**Real Estate Relevance**: **Very High** - Valuable for finding exceptional properties, unusual market conditions, undervalued assets, or data quality issues. Helps identify unique investment opportunities or market anomalies.

---

### SensitivityAnalysisProcessor
**Score Field**: `sensitivity_score` (0-100 scale)

**Analysis Description**: Analyzes how changes in economic, demographic, or market variables affect real estate outcomes and property investment results.

**Real Estate Relevance**: **Very High** - Critical for understanding real estate investment risk and market sensitivity. Helps assess how economic changes, interest rates, or demographic shifts impact property values and investment returns.

---

## Retired Processors (Not Applicable to Real Estate)

### BrandDifferenceProcessor ❌ **RETIRED**
**Status**: Retired - Retail brand analysis not applicable to real estate markets
**Previous Score Field**: `brand_difference_score`

**Retirement Reason**: Focused on brand competition which doesn't translate to real estate market analysis where competition is location and property-based rather than brand-based.

---

### CompetitiveDataProcessor ❌ **RETIRED** 
**Status**: Retired - Brand-focused competitive analysis not relevant to real estate
**Previous Score Field**: `competitive_analysis_score`

**Retirement Reason**: Retail brand competitive analysis doesn't apply to real estate where competition is based on location, property characteristics, and market dynamics rather than brand positioning.

---

## Summary by Real Estate Investment Relevance

### **Maximum Relevance** (Essential for Real Estate Investment):
- **AnalyzeProcessor** - Core real estate market analysis
- **ComparativeAnalysisProcessor** - Comparative market analysis (CMA)
- **ConsensusAnalysisProcessor** - Validated investment insights
- **CoreAnalysisProcessor** - Strategic real estate value assessment
- **SpatialClustersProcessor** - Geographic market clustering
- **HousingMarketCorrelationProcessor** - Housing market correlations
- **MarketSizingProcessor** - Housing market opportunity sizing
- **RealEstateAnalysisProcessor** - Comprehensive property analysis
- **RiskDataProcessor** - Real estate investment risk assessment
- **StrategicAnalysisProcessor** - Strategic real estate planning
- **DemographicDataProcessor** - Housing market demographic analysis
- **PredictiveModelingProcessor** - Property value forecasting
- **SegmentProfilingProcessor** - Housing market segmentation
- **TrendAnalysisProcessor** - Real estate trend identification

### **Very High Relevance** (Critical for Real Estate Operations):
- **EnsembleAnalysisProcessor** - Robust property valuations
- **CorrelationAnalysisProcessor** - Market factor relationships
- **CustomerProfileProcessor** - Homebuyer analysis
- **ScenarioAnalysisProcessor** - Real estate scenario planning
- **TrendDataProcessor** - Housing market data analysis
- **ClusterDataProcessor** - Property classification
- **FeatureImportanceRankingProcessor** - Investment factor prioritization
- **OutlierDetectionProcessor** - Exceptional property identification
- **SensitivityAnalysisProcessor** - Economic impact analysis

### **High Relevance** (Important Supporting Analysis):
- **AlgorithmComparisonProcessor** - Model optimization for real estate
- **AnomalyDetectionProcessor** - Market opportunity detection
- **FeatureInteractionProcessor** - Complex real estate relationships
- **ModelPerformanceProcessor** - Analytical quality assurance
- **ModelSelectionProcessor** - Real estate model optimization

### **Medium Relevance** (Technical Utility):
- **DimensionalityInsightsProcessor** - Data complexity management

### **Not Applicable** (Retired for Real Estate):
- **BrandDifferenceProcessor** - Retail-specific, retired
- **CompetitiveDataProcessor** - Brand-focused, retired

---

## Real Estate Configuration Integration

All processors have been migrated to use the **BaseProcessor** architecture with real estate-specific configuration:

### Quebec Housing Market Data Fields:
- **ECYPTAPOP**: Population data for market sizing
- **ECYHRIAVG**: Household income for affordability analysis  
- **ECYTENOWN**: Home ownership rates for market maturity
- **ECYTENRENT**: Rental market for investment opportunities
- **ECYMTN2534**: Target homebuying demographics (25-34 age group)

### Real Estate Terminology:
- **Market Opportunity** → Housing market gaps and development potential
- **Customer** → Homebuyer/Property investor segments
- **Competition** → Location-based market competition
- **Revenue** → Property values and rental income potential
- **Performance** → Property appreciation and market growth

### Real Estate Score Interpretations:
- **80-100**: Premium real estate investment opportunity
- **60-79**: Strong housing market with good potential  
- **40-59**: Moderate real estate opportunity requiring analysis
- **20-39**: Developing market with long-term potential
- **0-19**: Limited real estate investment appeal

---

*This document provides comprehensive coverage of all processors specifically tailored for real estate investment analysis, property valuation, and housing market assessment.*