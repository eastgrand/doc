# Composite Index Formulas

This document defines the calculation methods for the three composite indices used in market analysis.

## Data Structure

Each FSA record contains demographic and housing data with the following key fields:
- Population and household counts (2024, 2029, 2034 projections)
- Income metrics (average, median, aggregate)
- Housing tenure data (owned/rented percentages)
- Delta calculations for growth trends
- Age group data for maintainers

## 1. Hot Growth Index (0-100 scale)

Measures market momentum and development speed across multiple dimensions.

### Formula
```
Hot Growth = (40% × HH_Growth_Score) + (25% × Income_Growth_Score) + (20% × Ownership_Growth_Score) + (15% × Population_Density_Score)
```

### Components

**HH Growth Score** (40% weight)
- Formula: `(TOTAL_HH_DELTA_2024_2034.percent / max_hh_growth_across_all_fsas) × 100`
- Measures: Household formation rate over 10-year period
- Rationale: Primary indicator of market expansion

**Income Growth Score** (25% weight)  
- Formula: `(HH_INCOME_MEDIAN_DELTA_2024_2029.percent / max_income_growth_across_all_fsas) × 100`
- Measures: Economic prosperity growth
- Rationale: Income growth drives purchasing power

**Ownership Growth Score** (20% weight)
- Formula: `(OWNED_DELTA_2024_2034.percent / max_owned_growth_across_all_fsas) × 100`
- Measures: Growth in owned housing units
- Rationale: Indicates market development and investment

**Population Density Score** (15% weight)
- Formula: `(POPULATION_2024 / max_population_2024_across_all_fsas) × 100`
- Measures: Market size and urban development
- Rationale: Larger markets tend to have more momentum
- Note: Uses POPULATION_2024 field from data

## 2. New Homeowner Index (0-100 scale)

Identifies areas most attractive to first-time homebuyers and young families.

### Formula
```
New Homeowner = (35% × Affordability_Score) + (30% × Young_Maintainer_Score) + (25% × Rental_to_Own_Transition_Score) + (10% × Growth_Stability_Score)
```

### Components

**Affordability Score** (35% weight)
- Formula: `100 - ((HOUSING_VALUE_2024 / HH_INCOME_MEDIAN_2024) × 25)`
- Range: Capped at 100, minimum 0
- Measures: Price-to-income ratio (lower is better for buyers)
- Rationale: Most critical factor for first-time buyers

**Young Maintainer Score** (30% weight)
- Formula: `((MAINTAINERS_25_34_2024 / TOTAL_HH_2024) × 1000)`
- Range: Normalized to 0-100
- Measures: Concentration of 25-34 age household maintainers
- Rationale: Primary demographic for first-time home purchases

**Rental to Own Transition Score** (25% weight)
- Formula: `((OWNED_PERCENT_2029 - OWNED_PERCENT_2024) + 5) × 10`
- Range: Normalized to 0-100
- Measures: Shift from rental to ownership market
- Rationale: Indicates opportunities for renters to become owners

**Growth Stability Score** (10% weight)
- Formula: `100 - (abs(TOTAL_HH_DELTA_2024_2029.percent - TOTAL_HH_DELTA_2029_2034.percent) × 5)`
- Range: 0-100
- Measures: Consistency of growth between periods
- Rationale: Stable markets are less risky for new buyers

## 3. Housing Affordability Index (0-100 scale)

Measures overall housing accessibility based on Canadian lending standards and market conditions.

### Formula
```
Housing Affordability = (50% × Debt_Service_Ratio_Score) + (25% × Rental_Market_Score) + (15% × Income_Growth_Score) + (10% × Housing_Supply_Score)
```

### Components

**Debt Service Ratio Score** (50% weight)
- Formula: `(GDS_Score × 0.6) + (TDS_Score × 0.4)`
- Range: 0-100
- Measures: Compliance with Canadian lending standards
- Rationale: Core affordability based on regulatory guidelines

  - **GDS Score** (Gross Debt Service - 60% of DSR score):
    - `GDS_Ratio = (HOUSING_VALUE_2024 × 0.05) / (HH_INCOME_MEDIAN_2024 / 12)` (assumes 5% annual housing costs)
    - `GDS_Score = max(0, 100 - ((GDS_Ratio / 0.39) × 100))` (39% threshold)
  
  - **TDS Score** (Total Debt Service - 40% of DSR score):
    - `TDS_Ratio = GDS_Ratio × 1.15` (assumes 15% additional debt load)
    - `TDS_Score = max(0, 100 - ((TDS_Ratio / 0.44) × 100))` (44% threshold)

**Rental Market Score** (25% weight)
- Formula: `(RENTED_PERCENT_2024 / max_rental_percent_across_all_fsas) × 100`
- Range: 0-100
- Measures: Availability of rental options
- Rationale: Rental options provide housing flexibility

**Income Growth Score** (15% weight)
- Formula: `(HH_INCOME_MEDIAN_DELTA_2024_2029.percent / max_income_growth_across_all_fsas) × 100`
- Range: 0-100
- Measures: Improving earning potential
- Rationale: Rising incomes improve affordability over time

**Housing Supply Score** (10% weight)
- Formula: `(TOTAL_HH_DELTA_2024_2034.percent / max_hh_growth_across_all_fsas) × 100`
- Range: 0-100
- Measures: Housing supply expansion
- Rationale: More supply generally improves affordability

## Implementation Guidelines

### Normalization Process
1. Calculate maximum values across all FSAs for each component
2. Apply component formulas using these maximums for scaling
3. Clamp all scores to 0-100 range
4. Apply weighted averages for final index scores

### Data Handling
- **Missing Data**: Default to 0 or use median value where appropriate
- **Zero Values**: Handle division by zero with conditional logic
- **Outliers**: Consider capping extreme values at 95th percentile

### Validation
- Ensure all indices range 0-100
- Verify component weights sum to 100%
- Test with sample data for reasonable distributions
- Compare results against known market conditions

## Usage Notes

- Higher scores indicate "better" conditions for each index type
- Indices are relative rankings within the dataset
- Regular recalibration recommended as new data becomes available
- Consider market-specific adjustments for regional variations