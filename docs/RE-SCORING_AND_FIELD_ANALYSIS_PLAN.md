# Re-Scoring and Field-Specific Analysis Implementation Plan

## Overview

This document outlines the plan to re-score data models, re-upload to blob storage, and implement analysis-specific field display methods based on each processor's actual scoring algorithms.

## Problem Statement

Current analysis endpoints show generic demographic fields regardless of what fields actually drive their scoring algorithms. This leads to:
- AI analysis focusing on irrelevant fields
- "Limited demographic data" errors
- Inconsistent analysis quality across different analysis types
- Generic field display instead of algorithm-specific relevance

## Solution Approach

Instead of using universal demographic functions, implement analysis-specific field display based on what fields each processor's scoring algorithm actually uses.

## Implementation Plan

### Phase 1: Analysis of Current Scoring Algorithms

#### Step 1: Audit All Processors
- [ ] Document fields used by each processor's scoring algorithm
- [ ] Identify primary scoring fields vs. supplementary fields
- [ ] Map field importance/weight in each algorithm
- [ ] Create field relevance matrix by analysis type

#### Step 2: Scoring Algorithm Analysis
- [ ] **ComparativeAnalysisProcessor**: Document `calculateBrandPerformanceGap`, `calculateMarketPositionStrength`, `calculateCompetitiveDynamicsLevel` field usage
- [ ] **CorrelationAnalysisProcessor**: Document correlation strength calculation field dependencies  
- [ ] **StrategicAnalysisProcessor**: Document strategic scoring field weights
- [ ] **BrandDifferenceProcessor**: Document brand market share calculation fields
- [ ] **DemographicDataProcessor**: Document comprehensive demographic field sets
- [ ] **MarketSizingProcessor**: Document market opportunity calculation fields
- [ ] **SegmentProfilingProcessor**: Document customer segmentation field usage
- [ ] **TrendAnalysisProcessor**: Document temporal pattern analysis fields
- [ ] **AnomalyDetectionProcessor**: Document anomaly detection algorithm fields
- [ ] **FeatureInteractionProcessor**: Document multi-variable relationship fields
- [ ] **OutlierDetectionProcessor**: Document outlier identification algorithm fields
- [ ] **ScenarioAnalysisProcessor**: Document market adaptability scoring fields
- [ ] **PredictiveModelingProcessor**: Document forecasting model field dependencies

### Phase 2: Re-Scoring Requirements

#### Step 3: Why Re-Scoring is Required

**CRITICAL ISSUE**: All scoring scripts are using **old field names** that don't match current data structure.

**Old Scoring Field Usage** (from scoring scripts):
```javascript
// Strategic Analysis used old field names:
const demographicScore = record.demographic_opportunity_score || 0;
const nikeShare = record.nike_market_share || 0;
const competitiveAdvantage = record.competitive_advantage_score || 0;
const totalPop = record.total_population || 0;
const medianIncome = record.median_income || 0;

// Competitive Analysis used old brand fields:
const nikeShare = record.nike_market_share || 0;
const adidasShare = record.adidas_market_share || 0;
const pumaShare = record.puma_market_share || 0;
const newBalanceShare = record.new_balance_share || 0;

// Demographic Analysis used old demographic fields:
const age25_34 = record.age_25_34_pct || 0;
const age35_44 = record.age_35_44_pct || 0;
const highIncome = record.income_100k_plus_pct || 0;
const universityEd = record.university_educated_pct || 0;
```

**Current Data Structure** (actual field names in data):
```javascript
// Current field names have value_ prefix:
record.value_TOTPOP_CY        // vs old: total_population
record.value_AVGHINC_CY       // vs old: median_income  
record.MP10128A_B_P           // vs old: nike_market_share
record.MP10104A_B_P           // vs old: adidas_market_share
record.value_GENZ_CY_P        // vs old: age_25_34_pct
record.value_MILLENN_CY_P     // vs old: age_35_44_pct
```

**Impact of Old Fields**:
- Scoring algorithms get 0 values for all calculations
- All calculated scores default to fallback values
- Analysis quality is severely degraded
- Field-specific analysis shows generic fields instead of scoring-relevant fields

#### Step 4: Required Scoring Updates
- [ ] **Update Strategic Analysis**: Replace `nike_market_share` → `MP10128A_B_P`, `total_population` → `value_TOTPOP_CY`
- [ ] **Update Competitive Analysis**: Replace all brand fields with current MP field codes
- [ ] **Update Demographic Analysis**: Replace demographic percentage fields with `value_*_P` format
- [ ] **Update All 17 Scoring Scripts**: Map old field names to current data structure
- [ ] **Field Mapping Translation**: Create field mapping dictionary for all scoring scripts

#### Step 4: Re-Scoring Process
- [ ] Update scoring algorithms based on new requirements
- [ ] Re-calculate all analysis scores with updated models
- [ ] Validate scoring consistency across analysis types
- [ ] Performance test new scoring algorithms

#### Step 5: Field Mapping Dictionary

**Complete Field Translation Table**:

| Analysis Type | Old Field Name | Current Field Name | Purpose |
|---------------|----------------|-------------------|---------|
| **Strategic** | `nike_market_share` | `MP10128A_B_P` or `MP10104A_B_P` | Brand market share |
| **Strategic** | `total_population` | `value_TOTPOP_CY` | Population data |
| **Strategic** | `median_income` | `value_AVGHINC_CY` | Income data |
| **Strategic** | `demographic_opportunity_score` | *Calculate from current fields* | Derived score |
| **Strategic** | `competitive_advantage_score` | *Calculate from current fields* | Derived score |
| **Competitive** | `adidas_market_share` | `MP30029A_B_P` | Adidas share |
| **Competitive** | `puma_market_share` | `MP30032A_B_P` | Puma share |
| **Competitive** | `new_balance_share` | `MP30031A_B_P` | New Balance share |
| **Demographic** | `age_25_34_pct` | `value_MILLENN_CY_P` | Millennial percentage |
| **Demographic** | `age_35_44_pct` | `value_GENX_CY_P` | Gen X percentage |
| **Demographic** | `income_100k_plus_pct` | `value_HINC100_CY_P` | High income percentage |
| **Demographic** | `university_educated_pct` | `value_EDUCBACHP` | Bachelor's degree percentage |
| **Correlation** | Various old fields | Current `value_*` format | Statistical analysis |

#### Step 6: Blob Storage Re-Upload Strategy
- [ ] **Backup Current Data**: Create backup before re-scoring
- [ ] **Script Execution Order**: Run 17 scoring scripts in dependency order (5 phases)
- [ ] **Validation**: Verify all scores are in expected 0-100 ranges
- [ ] **Upload Strategy**: Replace current blob data with re-scored data
- [ ] **Rollback Plan**: Keep backup for emergency rollback

### Phase 3: Field-Specific Analysis Implementation

#### Step 6: Create Analysis-Specific Field Functions
- [ ] Replace universal demographic functions with analysis-specific field extraction
- [ ] Create field importance weighting based on scoring algorithms
- [ ] Implement field relevance scoring for each analysis type
- [ ] Add business context explanations for why fields matter to each analysis

#### Step 7: Analysis-Specific Field Implementation Strategy

**Based on Scoring Algorithm Analysis**:

```typescript
// Strategic Analysis Fields (from strategic-value-scores.js):
const addStrategicAnalysisFields = (props: any, metricsSection: string): string => {
  // Fields used by Strategic Analysis scoring algorithm (35% + 30% + 20% + 15%):
  
  // Market Opportunity (35% weight):
  if (props?.demographic_opportunity_score) {
    metricsSection += `   Demographic Opportunity: ${props.demographic_opportunity_score.toFixed(1)}\n`;
  }
  if (props?.MP10128A_B_P || props?.nike_market_share) {
    const marketShare = props?.MP10128A_B_P || props?.nike_market_share || 0;
    const marketGap = Math.max(0, 100 - marketShare);
    metricsSection += `   Market Gap Opportunity: ${marketGap.toFixed(1)}%\n`;
  }
  
  // Competitive Position (30% weight):
  if (props?.competitive_advantage_score) {
    metricsSection += `   Competitive Advantage: ${props.competitive_advantage_score.toFixed(1)}\n`;
  }
  
  // Data Reliability (20% weight):
  if (props?.correlation_strength_score) {
    metricsSection += `   Data Correlation Strength: ${props.correlation_strength_score.toFixed(1)}\n`;
  }
  
  // Market Scale (15% weight):
  if (props?.value_TOTPOP_CY || props?.total_population) {
    const population = props?.value_TOTPOP_CY || props?.total_population || 0;
    metricsSection += `   Market Size: ${(population / 1000).toFixed(1)}K people\n`;
  }
  if (props?.value_AVGHINC_CY || props?.median_income) {
    const income = props?.value_AVGHINC_CY || props?.median_income || 0;
    metricsSection += `   Economic Scale: $${(income / 1000).toFixed(1)}K median income\n`;
  }
  
  return metricsSection;
}

// Competitive Analysis Fields (from competitive-analysis-scores.js):
const addCompetitiveAnalysisFields = (props: any, metricsSection: string): string => {
  // Fields used by Competitive Analysis scoring algorithm:
  
  // Direct competitive advantage (40% weight):
  const nikeShare = props?.MP10128A_B_P || props?.nike_market_share || 0;
  const adidasShare = props?.MP30029A_B_P || props?.adidas_market_share || 0;
  const directAdvantage = nikeShare - adidasShare;
  metricsSection += `   Direct Competitive Advantage: ${directAdvantage.toFixed(1)}% vs Adidas\n`;
  
  // Market dominance (25% weight):
  const pumaShare = props?.MP30032A_B_P || props?.puma_market_share || 0;
  const newBalanceShare = props?.MP30031A_B_P || props?.new_balance_share || 0;
  const totalCompetitors = adidasShare + pumaShare + newBalanceShare;
  const marketDominance = nikeShare - (totalCompetitors / 3);
  metricsSection += `   Market Dominance: ${marketDominance.toFixed(1)}% vs avg competitor\n`;
  
  // Market leadership (20% weight):
  const totalTop4 = nikeShare + adidasShare + pumaShare + newBalanceShare;
  const marketLeadership = totalTop4 > 0 ? (nikeShare / totalTop4) * 100 : 0;
  metricsSection += `   Market Leadership: ${marketLeadership.toFixed(1)}% of top 4 brands\n`;
  
  // Positioning strength (15% weight):
  const positioningStrength = nikeShare > 20 ? 100 : 
                             nikeShare > 15 ? 80 : 
                             nikeShare > 10 ? 60 : 
                             nikeShare > 5 ? 40 : 20;
  metricsSection += `   Positioning Strength: ${positioningStrength}/100\n`;
  
  return metricsSection;
}

// Demographic Analysis Fields (from demographic-opportunity-scores.js):
const addDemographicAnalysisFields = (props: any, metricsSection: string): string => {
  // Fields used by Demographic Analysis scoring algorithm:
  
  // Age demographics (30% weight):
  const millennial = props?.value_MILLENN_CY_P || props?.age_25_34_pct || 0;
  const genX = props?.value_GENX_CY_P || props?.age_35_44_pct || 0;
  metricsSection += `   Target Age Groups: ${millennial.toFixed(1)}% Millennials, ${genX.toFixed(1)}% Gen X\n`;
  
  // Income demographics (25% weight):
  const highIncome = props?.value_HINC100_CY_P || props?.income_100k_plus_pct || 0;
  metricsSection += `   High Income Demographics: ${highIncome.toFixed(1)}% earn $100K+\n`;
  
  // Education demographics (20% weight):
  const education = props?.value_EDUCBACHP || props?.university_educated_pct || 0;
  metricsSection += `   Education Level: ${education.toFixed(1)}% bachelor's degree+\n`;
  
  // Lifestyle demographics (15% weight):
  if (props?.sports_participation_pct) {
    metricsSection += `   Athletic Lifestyle: ${props.sports_participation_pct.toFixed(1)}% sports participation\n`;
  }
  
  // Population density (10% weight):
  if (props?.population_density) {
    metricsSection += `   Market Density: ${props.population_density.toFixed(0)} people/sq mi\n`;
  }
  
  return metricsSection;
}
```

**Key Difference**: Instead of showing generic demographics, each function shows **only the fields that drive that analysis type's scoring algorithm** with their **exact weights** and **business context**.

#### Step 8: API Route Updates  
- [ ] Update `/app/api/claude/generate-response/route.ts` case statements
- [ ] Apply processor-specific field functions to each analysis type
- [ ] Remove generic demographic field displays
- [ ] Add field importance context to AI analysis prompts

### Phase 4: Testing and Validation

#### Step 9: Testing Strategy
- [ ] Test each analysis type with new field-specific display
- [ ] Validate AI analysis quality improvement
- [ ] Verify field relevance matches scoring algorithm
- [ ] Test performance impact of new field extraction

#### Step 10: Quality Assurance
- [ ] Compare before/after AI analysis quality
- [ ] Validate "limited demographic data" errors are resolved
- [ ] Ensure business context explanations are accurate
- [ ] Test edge cases with missing fields

### Phase 5: Documentation and Deployment

#### Step 11: Documentation Updates
- [ ] Update `QUERY_TO_VISUALIZATION_FLOW.md` with new field-specific approach
- [ ] Document field importance by analysis type
- [ ] Create troubleshooting guide for field-specific analysis
- [ ] Update API documentation with new field requirements

#### Step 12: Deployment
- [ ] Deploy re-scored data to blob storage
- [ ] Deploy updated analysis field extraction
- [ ] Monitor analysis quality improvements
- [ ] Create rollback procedure if needed

## Field Mapping Strategy

### Current Universal Approach (To Be Replaced)
```typescript
// Generic demographic function applied to all analyses
addDemographicFields() // Shows same fields regardless of analysis type
```

### New Processor-Specific Approach
```typescript
// Analysis-specific field extraction based on scoring algorithms
switch (analysisType) {
  case 'comparative':
    metricsSection = addComparativeAnalysisFields(props, metricsSection);
    break;
  case 'correlation':
    metricsSection = addCorrelationAnalysisFields(props, metricsSection);
    break;
  // ... specific function for each analysis type
}
```

## Expected Benefits

1. **Improved AI Analysis Quality**: AI focuses on fields that actually drive scoring
2. **Reduced Field Noise**: Eliminates irrelevant demographic information
3. **Better Business Context**: Explains why specific demographics matter to each analysis
4. **Resolved Data Errors**: Fixes "limited demographic data" issues through proper field detection
5. **Consistent Analysis**: Each analysis type gets fields relevant to its scoring algorithm

## Risks and Mitigation

### Risk: Analysis Quality Regression
**Mitigation**: A/B test before/after field extraction quality

### Risk: Performance Impact
**Mitigation**: Performance test field extraction functions

### Risk: Field Mapping Errors  
**Mitigation**: Comprehensive testing with different analysis types

### Risk: Re-Scoring Issues
**Mitigation**: [To be filled based on user requirements]

## Next Steps

1. **User Input Required**: 
   - Why re-scoring is needed
   - What scoring changes are required
   - Blob storage upload strategy
   - New field requirements

2. **Begin Phase 1**: Audit current processor scoring algorithms

3. **Create Field Relevance Matrix**: Map fields to analysis types by importance

---

*This plan will be updated based on user requirements and implementation progress.*