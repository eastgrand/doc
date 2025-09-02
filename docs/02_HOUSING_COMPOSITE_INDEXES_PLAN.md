# Housing Market Composite Indexes Implementation Plan

This document outlines the implementation plan for three composite indexes that will enhance the housing market analysis capabilities of the MPIQ AI Chat system.

## Overview

### Three Composite Indexes

1. **Hot Growth Markets Index** - Identifies areas with significant housing tenure shifts
2. **New Home Owner Index** - Targets young renters with growing incomes as potential homebuyers
3. **Housing Affordability Index** - Assesses housing affordability based on debt-to-income ratios

## Index 1: Hot Growth Markets Index

### Purpose
Identify markets experiencing significant shifts from renting to ownership, indicating growth and development opportunities.

### Methodology
Calculate percentage changes in housing tenure, income, and demographics between 2023, 2028, and 2033 projections.

### Required Fields
```
# 2023 Baseline
ECYTENHHD    - 2023 Tenure: Total HHs
ECYTENOWN    - 2023 Tenure: Owned  
ECYTENRENT   - 2023 Tenure: Rented

# 2028 Projections
P5YTENHHD    - 2028 Tenure: Total HHs
P5YTENOWN    - 2028 Tenure: Owned
P5YTENRENT   - 2028 Tenure: Rented

# 2033 Projections  
P0YTENHHD    - 2033 Tenure: Total HHs
P0YTENOWN    - 2033 Tenure: Owned
P0YTENRENT   - 2033 Tenure: Rented

# Income Data (for additional context)
ECYHRIAGG    - 2023 HH Inc: Aggregate Cons$
ECYHRIAVG    - 2023 HH Inc: Average Cons$
ECYHRIMED    - 2023 HH Inc: Median Cons$
ECYHNIAGG    - 2023 HH Inc: Aggregate Curr$
ECYHNIAVG    - 2023 HH Inc: Average Curr$
ECYHNIMED    - 2023 HH Inc: Median Curr$

P5YHRIAGG    - 2028 HH Inc: Aggregate Cons$
P5YHRIAVG    - 2028 HH Inc: Average Cons$
P5YHRIMED    - 2028 HH Inc: Median Cons$
P5YHNIAGG    - 2028 HH Inc: Aggregate Curr$
P5YHNIAVG    - 2028 HH Inc: Average Curr$
P5YHNIMED    - 2028 HH Inc: Median Curr$

# Demographics
ECYMTN1524   - 2023 Maintainers - 15 to 24
ECYMTN2534   - 2023 Maintainers - 25 to 34
ECYPTAPOP    - 2023 Total Population

# Condo Status (for context, not index calculation)
ECYCDOCO     - 2023 Condo Stat-In Condo
ECYCDOOWCO   - 2023 Condo Stat-In Condo: Owned
ECYCDORECO   - 2023 Condo Stat-In Condo: Rented
```

### Calculation Formula
```javascript
// Calculate baseline percentages
const ownership_2023 = ECYTENOWN / ECYTENHHD * 100;
const ownership_2028 = P5YTENOWN / P5YTENHHD * 100;
const ownership_2033 = P0YTENOWN / P0YTENHHD * 100;

const rental_2023 = ECYTENRENT / ECYTENHHD * 100;
const rental_2028 = P5YTENRENT / P5YTENHHD * 100;
const rental_2033 = P0YTENRENT / P0YTENHHD * 100;

const total_2023 = ECYTENHHD;
const total_2028 = P5YTENHHD;
const total_2033 = P0YTENHHD;

// Calculate delta fields (percentage point changes)
const OWNERSHIP_DELTA_23_28 = ownership_2028 - ownership_2023;    // 2023→2028 ownership change
const OWNERSHIP_DELTA_28_33 = ownership_2033 - ownership_2028;    // 2028→2033 ownership change  
const OWNERSHIP_DELTA_23_33 = ownership_2033 - ownership_2023;    // 2023→2033 ownership change

const RENTAL_DELTA_23_28 = rental_2028 - rental_2023;            // 2023→2028 rental change
const RENTAL_DELTA_28_33 = rental_2033 - rental_2028;            // 2028→2033 rental change
const RENTAL_DELTA_23_33 = rental_2033 - rental_2023;            // 2023→2033 rental change

const TOTAL_HH_DELTA_23_28 = ((total_2028 - total_2023) / total_2023) * 100;  // Household growth rate
const TOTAL_HH_DELTA_28_33 = ((total_2033 - total_2028) / total_2028) * 100;  
const TOTAL_HH_DELTA_23_33 = ((total_2033 - total_2023) / total_2023) * 100;

// Calculate income delta fields (both constant and current dollar)
const INCOME_AVG_CONS_DELTA_23_28 = ((P5YHRIAVG - ECYHRIAVG) / ECYHRIAVG) * 100;
const INCOME_MED_CONS_DELTA_23_28 = ((P5YHRIMED - ECYHRIMED) / ECYHRIMED) * 100;
const INCOME_AGG_CONS_DELTA_23_28 = ((P5YHRIAGG - ECYHRIAGG) / ECYHRIAGG) * 100;

const INCOME_AVG_CURR_DELTA_23_28 = ((P5YHNIAVG - ECYHNIAVG) / ECYHNIAVG) * 100;
const INCOME_MED_CURR_DELTA_23_28 = ((P5YHNIMED - ECYHNIMED) / ECYHNIMED) * 100;
const INCOME_AGG_CURR_DELTA_23_28 = ((P5YHNIAGG - ECYHNIAGG) / ECYHNIAGG) * 100;

// Composite Hot Growth Score using delta fields
const hot_growth_index = (
  (OWNERSHIP_DELTA_23_28 * 0.3) +      // 30% weight on 5-year ownership shift
  (OWNERSHIP_DELTA_28_33 * 0.2) +      // 20% weight on next 5-year ownership shift
  (OWNERSHIP_DELTA_23_33 * 0.2) +      // 20% weight on total 10-year ownership shift
  (-RENTAL_DELTA_23_28 * 0.15) +       // 15% weight on rental decline (negative = good)
  (TOTAL_HH_DELTA_23_28 * 0.15)        // 15% weight on household growth
) * 5; // Scale to reasonable range

// Normalize to 0-100 scale
const HOT_GROWTH_INDEX = Math.max(0, Math.min(100, hot_growth_index + 50));
```

### Output
- `HOT_GROWTH_INDEX` (0-100 scale)
- `OWNERSHIP_DELTA_23_28` (percentage point change 2023→2028)
- `OWNERSHIP_DELTA_28_33` (percentage point change 2028→2033)
- `OWNERSHIP_DELTA_23_33` (percentage point change 2023→2033)
- `RENTAL_DELTA_23_28` (percentage point change 2023→2028)
- `RENTAL_DELTA_28_33` (percentage point change 2028→2033)
- `RENTAL_DELTA_23_33` (percentage point change 2023→2033)
- `TOTAL_HH_DELTA_23_28` (household growth rate 2023→2028)
- `TOTAL_HH_DELTA_28_33` (household growth rate 2028→2033)
- `TOTAL_HH_DELTA_23_33` (household growth rate 2023→2033)
- `INCOME_AVG_CONS_DELTA_23_28` (average constant income growth 2023→2028)
- `INCOME_MED_CONS_DELTA_23_28` (median constant income growth 2023→2028)
- `INCOME_AGG_CONS_DELTA_23_28` (aggregate constant income growth 2023→2028)
- `INCOME_AVG_CURR_DELTA_23_28` (average current income growth 2023→2028)
- `INCOME_MED_CURR_DELTA_23_28` (median current income growth 2023→2028)
- `INCOME_AGG_CURR_DELTA_23_28` (aggregate current income growth 2023→2028)

## Index 2: New Home Owner Index

### Purpose
Identify areas with high concentrations of young renters experiencing income growth, representing potential new homebuyer markets.

### Required Fields
```
# Current Housing Status
ECYTENRENT   - 2023 Tenure: Rented

# Age Demographics (Target Market)
ECYMTN1524   - 2023 Maintainers - 15 to 24
ECYMTN2534   - 2023 Maintainers - 25 to 34

# Income Analysis (2023 vs 2028) - All Available Income Fields
ECYHRIAVG    - 2023 HH Inc: Average Cons$
ECYHRIMED    - 2023 HH Inc: Median Cons$
ECYHRIAGG    - 2023 HH Inc: Aggregate Cons$
ECYHNIAVG    - 2023 HH Inc: Average Curr$
ECYHNIMED    - 2023 HH Inc: Median Curr$
ECYHNIAGG    - 2023 HH Inc: Aggregate Curr$

P5YHRIAVG    - 2028 HH Inc: Average Cons$
P5YHRIMED    - 2028 HH Inc: Median Cons$
P5YHRIAGG    - 2028 HH Inc: Aggregate Cons$
P5YHNIAVG    - 2028 HH Inc: Average Curr$
P5YHNIMED    - 2028 HH Inc: Median Curr$
P5YHNIAGG    - 2028 HH Inc: Aggregate Curr$
```

### Calculation Formula
```javascript
// Calculate young maintainer concentration
const total_households = ECYTENHHD;
const young_maintainers_pct = (ECYMTN1524 + ECYMTN2534) / total_households * 100;

// Calculate rental market size
const rental_pct = ECYTENRENT / total_households * 100;

// Calculate income growth (2023 to 2028)
const income_growth_avg = ((P5YHNIAVG - ECYHRIAVG) / ECYHRIAVG) * 100;
const income_growth_med = ((P5YHNIMED - ECYHRIMED) / ECYHRIMED) * 100;

// Calculate income delta fields for enhanced analysis
const INCOME_AVG_CONS_DELTA_23_28 = ((P5YHRIAVG - ECYHRIAVG) / ECYHRIAVG) * 100;
const INCOME_MED_CONS_DELTA_23_28 = ((P5YHRIMED - ECYHRIMED) / ECYHRIMED) * 100;
const INCOME_AGG_CONS_DELTA_23_28 = ((P5YHRIAGG - ECYHRIAGG) / ECYHRIAGG) * 100;
const INCOME_AVG_CURR_DELTA_23_28 = ((P5YHNIAVG - ECYHNIAVG) / ECYHNIAVG) * 100;
const INCOME_MED_CURR_DELTA_23_28 = ((P5YHNIMED - ECYHNIMED) / ECYHNIMED) * 100;
const INCOME_AGG_CURR_DELTA_23_28 = ((P5YHNIAGG - ECYHNIAGG) / ECYHNIAGG) * 100;

// Composite New Home Owner Score using delta fields
const new_homeowner_index = (
  (young_maintainers_pct * 0.3) +           // 30% weight on young demographics
  (rental_pct * 0.2) +                      // 20% weight on rental market size
  (INCOME_AVG_CONS_DELTA_23_28 * 0.2) +    // 20% weight on real income growth
  (INCOME_MED_CONS_DELTA_23_28 * 0.15) +   // 15% weight on median real income growth
  (INCOME_AVG_CURR_DELTA_23_28 * 0.15)     // 15% weight on nominal income growth
);

// Normalize to 0-100 scale
const NEW_HOMEOWNER_INDEX = Math.max(0, Math.min(100, new_homeowner_index));
```

### Output
- `NEW_HOMEOWNER_INDEX` (0-100 scale)
- `YOUNG_MAINTAINERS_PCT` (percentage)
- `INCOME_AVG_CONS_DELTA_23_28` (real average income growth 2023→2028)
- `INCOME_MED_CONS_DELTA_23_28` (real median income growth 2023→2028)
- `INCOME_AGG_CONS_DELTA_23_28` (real aggregate income growth 2023→2028)
- `INCOME_AVG_CURR_DELTA_23_28` (nominal average income growth 2023→2028)
- `INCOME_MED_CURR_DELTA_23_28` (nominal median income growth 2023→2028)
- `INCOME_AGG_CURR_DELTA_23_28` (nominal aggregate income growth 2023→2028)

## Index 3: Housing Affordability Index

### Purpose
Assess housing affordability using Canadian mortgage stress test criteria: Gross Debt Ratio ≤39%, Total Debt Service Ratio ≤44%.

### Required Fields
```
# Housing Costs
HSSH001S     - 2023 HHs Exp: Shelter
HSSH002      - 2023 Principal Accommodation (Shelter)
HSSH053      - 2023 Rent (Shelter)

# Income Data
HSBASHHD     - 2023 Base Total Households Spending
HSHNIAGG     - 2023 HHs Aggregate Income
HSAGDISPIN   - 2023 HHs Aggr Disposable Inc
HSAGDISCIN   - 2023 HHs Aggr Discretionary Inc

# Household Counts for Averages
ECYTENHHD    - 2023 Tenure: Total HHs
ECYTENOWN    - 2023 Tenure: Owned
ECYTENRENT   - 2023 Tenure: Rented
```

### Calculation Formula
```javascript
// Calculate average household metrics
const avg_household_income = HSHNIAGG / HSBASHHD;
const avg_shelter_cost = HSSH001S / HSBASHHD;
const avg_rent_cost = HSSH053 / HSBASHHD;
const avg_principal_accom = HSSH002 / HSBASHHD;

// Calculate Gross Debt Ratio (GDR)
// Housing costs as percentage of gross income
const gross_debt_ratio = (avg_shelter_cost / avg_household_income) * 100;

// Calculate Total Debt Service Ratio (TDSR) estimate
// Using disposable vs discretionary income difference as proxy for total debt
const estimated_total_debt = HSAGDISPIN - HSAGDISCIN;
const avg_total_debt = estimated_total_debt / HSBASHHD;
const total_debt_service_ratio = ((avg_shelter_cost + avg_total_debt) / avg_household_income) * 100;

// Affordability Score (0-100, higher = more affordable)
// Based on Canadian mortgage stress test criteria
const gdr_score = Math.max(0, 100 - ((gross_debt_ratio - 39) * 5)); // Penalty after 39%
const tdsr_score = Math.max(0, 100 - ((total_debt_service_ratio - 44) * 3)); // Penalty after 44%

const housing_affordability_index = (gdr_score * 0.6) + (tdsr_score * 0.4);
```

### Output
- `HOUSING_AFFORDABILITY_INDEX` (0-100 scale, higher = more affordable)
- `GROSS_DEBT_RATIO` (percentage)
- `TOTAL_DEBT_SERVICE_RATIO` (percentage)
- `AVG_HOUSEHOLD_INCOME` (dollars)
- `AVG_SHELTER_COST` (dollars)

## Implementation Strategy

### Phase 1: Data Validation
1. Verify all required fields exist in the housing dataset
2. Check data quality and completeness for each field
3. Identify any missing or problematic fields

### Phase 2: Index Calculation Scripts
1. Create Python script to calculate composite indexes
2. Implement validation and error handling
3. Generate summary statistics and distributions

### Phase 3: Integration with Training Pipeline
1. Update model training to include composite indexes as features
2. Modify field mapping to include new calculated fields
3. Update microservice configuration

### Phase 4: Scoring and Analysis
1. Update scoring algorithms to leverage composite indexes
2. Create specialized analysis endpoints for index-based insights
3. Generate visualization configurations

## Technical Implementation

### File Structure
```
scripts/housing/
├── calculate_composite_indexes.py     # Main calculation script
├── validate_housing_fields.py         # Field validation
├── index_formulas.py                  # Index calculation formulas
└── housing_index_tests.py             # Unit tests
```

### Integration Points
- **Training Data**: Add indexes as features in `training_data.csv`
- **Field Mappings**: Update `field_mappings.json` with new calculated fields
- **Scoring**: Enhance scoring algorithms to use composite indexes
- **Microservice**: Update target variable and feature lists

## Next Steps

1. **Create calculation scripts** in `scripts/housing/`
2. **Validate field availability** in current housing dataset
3. **Calculate composite indexes** and add to training data
4. **Update microservice configuration** with enhanced features
5. **Deploy updated microservice** to Render
6. **Test analysis endpoints** with composite index insights

## Benefits

### Hot Growth Markets Index
- Identifies emerging markets before they peak
- Helps target areas with increasing homeownership demand
- Supports investment and development planning

### New Home Owner Index  
- Targets prime demographic for first-time homebuyers
- Balances rental market size with income growth potential
- Supports marketing and product development strategies

### Housing Affordability Index
- Uses Canadian mortgage qualification standards
- Provides realistic affordability assessment
- Supports policy and lending decisions

---

**Status**: Ready for Implementation  
**Estimated Development Time**: 1-2 days  
**Impact**: Enhanced targeting and market analysis capabilities