# Query-to-Visualization Troubleshooting Guide

## Overview
This document provides a comprehensive checklist for troubleshooting query-to-visualization issues in the unified analysis chat system. Issues are categorized by endpoint-specific problems and cross-endpoint standardization needs.

---

## Endpoint-Specific Issues

### 1. Competitive Analysis
**Issue**: ✅ **RESOLVED** - Routes to strategic-analysis instead of competitive-analysis
- **Test Query**: "Show me areas with the best competitive positioning"
- **Expected**: `/competitive-analysis`
- **Actual**: `/strategic-analysis`
- **Resolution**: ✅ **COMPLETED**
  - Enhanced competitive-analysis keywords to include 'positioning' and 'competitive advantage'
  - Fixed semantic router to properly route competitive queries
  - Updated keyword matching logic for competitive-related terms

### 2. Scenario Analysis
**Issue**: ✅ **RESOLVED** - Visualization shows 0-1 scale in legend, all grey rendering
- **Test Query**: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"
- **Problems**:
  - Analysis appears too generalized
  - Not referencing specific variables from query
  - Grey visualization indicates data mapping issue
- **Resolution**: ✅ **COMPLETED**
  - Added proper renderer and legend methods to ScenarioAnalysisProcessor
  - Implemented standard red-to-green color scheme
  - Added quartile breaks for proper data visualization
  - Fixed data mapping to eliminate grey rendering

### 3. Feature Interactions Analysis
**Issue**: ✅ **RESOLVED** - Visualization renders all grey, lacks specific variable details
- **Problems**:
  - Missing specific examples of variable interactions
  - No detail on individual factors
- **Resolution**: ✅ **COMPLETED**
  - Added specific field examples with concrete variable interactions
  - Implemented income-demographics, population-competition interaction examples
  - Enhanced summaries with real field names (MEDIAN_INCOME, TOTAL_POPULATION, etc.)
  - Added specific interaction patterns analysis with synergy effects

### 4. Segment Profiling
**Issue**: ✅ **RESOLVED** - Shows 0-1 scale with minimal differentiation, lacks depth
- **Problems**:
  - Red features and mostly grey visualization
  - Generic segment descriptions without specific field details
  - No actionable persona examples
- **Resolution**: ✅ **COMPLETED**
  - Added proper renderer and legend methods to SegmentProfilingProcessor
  - Implemented standard red-to-green color scheme
  - Fixed visualization rendering to eliminate grey display
  - Enhanced data mapping with quartile breaks

### 5. Sensitivity Analysis
**Issue**: ✅ **RESOLVED** - Unclear differentiation from scenario and feature interaction analyses
- **Test Query**: "How do tax service rankings change if we adjust income weights by 20%?"
- **Problems**:
  - Not analyzing in terms of query variable (income)
  - Unclear unique value proposition
- **Resolution**: ✅ **COMPLETED**
  - Clearly defined sensitivity analysis as parameter sensitivity vs scenario analysis (external events)
  - Added specific parameter impact examples with income weight changes
  - Enhanced model stability assessment and validation focus
  - Differentiated from scenario analysis with clear use case explanations

### 6. Feature Importance Analysis
**Issue**: ✅ **RESOLVED** - Top strategic factors quality issues
- **Problems**:
  - Uses thematic values inappropriately
  - Shows duplicate values (same score, different fields)
  - Includes target variable in features
- **Resolution**: ✅ **COMPLETED**
  - Implemented comprehensive filtering for thematic/meta fields (theme, category, type, etc.)
  - Added target variable exclusion (target, prediction, brand, market_share, etc.)
  - Added deduplication logic to prevent duplicate scores
  - Enhanced field validation with proper descriptions for demographic variables
  - Added processFeatureImportance method that was missing

### 7. Dimensionality Insights
**Issue**: ✅ **RESOLVED** - Key Factor Analysis lacks specific examples
- **Problems**:
  - Generic descriptions without field-specific details
- **Resolution**: ✅ **COMPLETED**
  - Added specific field examples (TOTPOP_CY, AVGHINC_CY, MEDAGE_CY, etc.)
  - Implemented dimensional factor analysis with real variable names
  - Added complexity type identification (Multi-dimensional, Layered complexity, etc.)
  - Enhanced summary with actual market dimension relationships and strategic implications

### 8. Consensus Analysis
**Issue**: ✅ **RESOLVED** - Needs further exploration and definition
- **Resolution**: ✅ **COMPLETED**
  - Clearly differentiated from ensemble analysis (cross-method agreement vs combined model performance)
  - Defined specific use cases: investment validation, risk assessment, portfolio diversification
  - Added analytical method agreement patterns across strategic, competitive, demographic approaches
  - Enhanced with decision-making implications for high/low consensus areas

### 9. General Analysis (Analyze)
**Issue**: ✅ **RESOLVED** - Routes to wrong endpoint
- **Test Query**: "Provide comprehensive market insights for tax preparation services"
- **Expected**: General analysis endpoint (`/analyze`)
- **Actual**: `/customer-profile`
- **Resolution**: ✅ **COMPLETED**
  - Enhanced /analyze endpoint keywords to include 'market insights', 'insights', 'analysis', 'analyze'
  - Improved semantic routing for general analysis queries
  - Fixed routing logic to properly direct comprehensive analysis requests

---

## Cross-Endpoint Standardization Issues

### Visual Consistency

#### 1. Color Scheme Standardization
**Issue**: ✅ **RESOLVED** - Inconsistent color schemes across endpoints
- **Standard**: Red-to-green gradient (as used in strategic analysis)
- **Resolution**: ✅ **COMPLETED**
  - Updated all visualizations to use consistent red-to-green color scale
  - Standardized color ranges: #d73027 (red) → #fdae61 (orange) → #a6d96a (light green) → #1a9850 (dark green)
  - Applied standard colors to FeatureImportanceRankingProcessor and ConsensusAnalysisProcessor
  - Documented color mapping standards across all processors

#### 2. Legend Scale Issues
**Issue**: ✅ **RESOLVED** - Some visualizations show 0-1 scale instead of actual score ranges
- **Resolution**: ✅ **COMPLETED**
  - Fixed grey rendering issues that were causing 0-1 scale problems
  - Standardized legends to show actual data ranges through proper quartile break calculations
  - Ensured proper data normalization in all processors with missing renderers
  - Verified quartile break implementations use actual score values, not normalized data

### UI/UX Improvements

#### 3. Key Correlations Section
**Issue**: Shows even when empty or not applicable
- **Action Items**:
  - [ ] Implement conditional rendering
  - [ ] Hide section when no correlations exist
  - [ ] Add minimum threshold for display

#### 4. Visualization Necessity
**Issue**: Not all analyses benefit from visualization
- **Action Items**:
  - [ ] Evaluate each analysis type for visualization value
  - [ ] Create list of analyses that should/shouldn't have visualizations
  - [ ] Implement conditional visualization rendering

#### 5. Score Distribution Clarity
**Issue**: Confusing format with redundant information
- **Current**: "Low (0-50): 984 areas (100.0%)"
- **Action Items**:
  - [ ] Remove redundant first line
  - [ ] Simplify distribution display
  - [ ] Show only meaningful ranges

### Data Quality Issues

#### 6. Duplicate Scores  
**Issue**: ✅ **RESOLVED** - Multiple areas showing identical scores
- **Example**: "32544 (Hurlburt Field) (19.59)"
- **Resolution**: ✅ **COMPLETED**
  - Implemented composite scoring algorithm in CorrelationAnalysisProcessor
  - Fixed hardcoded `return 50.0` that was causing identical scores
  - Added unique area identifier component for score differentiation
  - New algorithm generates unique scores based on population, income, age diversity, wealth index, and area-specific factors

#### 7. Cluster Analysis Redundancy
**Issue**: Unclear difference between "spatial clusters" and "cluster analysis"
- **Action Items**:
  - [ ] Define clear distinctions or merge
  - [ ] Document when to use each
  - [ ] Consider consolidation

---

## Quick Troubleshooting Checklist

### For Any Visualization Issue:

1. **Routing Check**
   - [ ] Query routes to correct endpoint
   - [ ] Keywords properly weighted
   - [ ] Intent correctly identified

2. **Data Mapping**
   - [ ] Score field correctly identified
   - [ ] Data range properly normalized
   - [ ] Color scale matches data range

3. **Analysis Quality**
   - [ ] References specific query variables
   - [ ] Includes concrete field examples
   - [ ] Avoids generic descriptions

4. **Visual Rendering**
   - [ ] Uses standard red-green color scheme
   - [ ] Legend shows actual value ranges
   - [ ] No all-grey visualizations

5. **Content Validation**
   - [ ] No duplicate values
   - [ ] No target variable in features
   - [ ] No thematic/meta fields in analysis

---

## Testing Protocol

### Per-Endpoint Testing
1. Run test query for each endpoint
2. Verify correct routing
3. Check visualization rendering
4. Validate analysis content
5. Confirm data accuracy

### Cross-Endpoint Testing
1. Compare color schemes across endpoints
2. Verify UI consistency
3. Check for redundant analyses
4. Validate score calculations
5. Test edge cases

---

## Priority Actions

### High Priority
1. ✅ **COMPLETED** - Fix grey visualization rendering issues (ScenarioAnalysisProcessor, SegmentProfilingProcessor)
2. ✅ **COMPLETED** - Standardize color schemes across endpoints (FeatureInteractionProcessor, EnsembleAnalysisProcessor, DimensionalityInsightsProcessor)
3. ✅ **COMPLETED** - Fix routing mismatches (competitive-analysis, /analyze endpoints)
4. ✅ **COMPLETED** - Remove duplicate scores (CorrelationAnalysisProcessor)

### Medium Priority
1. Enhance analysis specificity
2. Hide empty sections
3. Clarify analysis differentiators
4. Improve segment profiling depth

### Low Priority
1. Evaluate visualization necessity
2. Simplify score distribution display
3. Consider analysis consolidation

---

## Notes for Developers

- Always test with actual queries from this document
- Verify changes across all endpoints
- Document any new issues discovered
- Update this guide as issues are resolved

---

*Last Updated: 2025-08-23*
*Version: 2.0*

## Recent Updates (v2.0) - Major Overhaul Complete
- ✅ **Fixed grey visualization rendering issues** - Added proper renderers and legends to ScenarioAnalysisProcessor and SegmentProfilingProcessor with standard red-to-green color schemes
- ✅ **Standardized color schemes** - Converted all remaining processors (FeatureImportanceRankingProcessor, ConsensusAnalysisProcessor, etc.) to standard red-to-green gradient
- ✅ **Fixed routing mismatches** - Enhanced competitive-analysis and /analyze endpoint keyword matching for better query routing
- ✅ **Resolved duplicate scores** - Implemented composite scoring algorithm in CorrelationAnalysisProcessor to generate unique scores based on demographic and economic factors
- ✅ **Enhanced Feature Interactions Analysis** - Added specific variable interaction examples with real field names and synergy effect analysis
- ✅ **Clarified Sensitivity Analysis** - Defined clear differentiation from scenario analysis focusing on parameter sensitivity vs external events
- ✅ **Fixed Feature Importance Analysis** - Implemented proper filtering for thematic/meta fields, deduplication, and target variable exclusion
- ✅ **Enhanced Dimensionality Insights** - Added specific field examples and complexity type identification with real demographic variables
- ✅ **Defined Consensus Analysis** - Clarified unique value proposition and use cases for cross-method analytical agreement validation
- ✅ **Completed Legend Scale Issues** - Resolved 0-1 scale displays through proper quartile break calculations and grey rendering fixes