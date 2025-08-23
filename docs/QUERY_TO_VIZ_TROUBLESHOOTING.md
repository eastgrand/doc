# Query-to-Visualization Troubleshooting Guide

## Overview
This document provides a comprehensive checklist for troubleshooting query-to-visualization issues in the unified analysis chat system. Issues are categorized by endpoint-specific problems and cross-endpoint standardization needs.

---

## Endpoint-Specific Issues

### 1. Competitive Analysis
**Issue**: Routes to strategic-analysis instead of competitive-insights
- **Test Query**: "Show me areas with the best competitive positioning"
- **Expected**: `/competitive-insights`
- **Actual**: `/strategic-analysis`
- **Resolution**: Review keyword weights and routing logic for competitive-related terms

### 2. Scenario Analysis
**Issue**: Visualization shows 0-1 scale in legend, all grey rendering
- **Test Query**: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"
- **Problems**:
  - Analysis appears too generalized
  - Not referencing specific variables from query
  - Grey visualization indicates data mapping issue
- **Resolution**: 
  - Ensure analysis references the specific scenario variable (pricing strategy)
  - Map data to proper color scale range
  - Include specific market resilience factors

### 3. Feature Interactions Analysis
**Issue**: Visualization renders all grey, lacks specific variable details
- **Problems**:
  - Missing specific examples of variable interactions
  - No detail on individual factors
- **Resolution**:
  - Expand analysis to include specific field names
  - Provide concrete examples of variable interactions (e.g., "income interacts with age to influence tax_score")
  - Show how variables interact with target variable and each other

### 4. Segment Profiling
**Issue**: Shows 0-1 scale with minimal differentiation, lacks depth
- **Problems**:
  - Red features and mostly grey visualization
  - Generic segment descriptions without specific field details
  - No actionable persona examples
- **Resolution**:
  - Include specific field values for each segment
  - Generate example customer personas from actual data
  - Provide detailed explanations of why segments are distinct
  - Example: "Segment A: High-income ($150K+), urban professionals, ages 35-45, preferring digital services"

### 5. Sensitivity Analysis
**Issue**: Unclear differentiation from scenario and feature interaction analyses
- **Test Query**: "How do tax service rankings change if we adjust income weights by 20%?"
- **Problems**:
  - Not analyzing in terms of query variable (income)
  - Unclear unique value proposition
- **Resolution**:
  - Clearly define sensitivity analysis scope
  - Focus on parameter sensitivity (weights, thresholds)
  - Consider merging with or clearly differentiating from scenario analysis

### 6. Feature Importance Analysis
**Issue**: Top strategic factors quality issues
- **Problems**:
  - Uses thematic values inappropriately
  - Shows duplicate values (same score, different fields)
  - Includes target variable in features
- **Resolution**:
  - Filter out thematic/meta fields
  - Deduplicate by score
  - Exclude target variable from feature list
  - Validate field names against actual dataset

### 7. Dimensionality Insights
**Issue**: Key Factor Analysis lacks specific examples
- **Problems**:
  - Generic descriptions without field-specific details
- **Resolution**:
  - Include actual field names and values
  - Provide specific examples from the data
  - Show how dimensions relate to real variables

### 8. Consensus Analysis
**Issue**: Needs further exploration and definition
- **Resolution**:
  - Define clear use cases
  - Determine unique value vs other analyses
  - Consider removal if redundant

### 9. General Analysis (Analyze)
**Issue**: Routes to wrong endpoint
- **Test Query**: "Provide comprehensive market insights for tax preparation services"
- **Expected**: General analysis endpoint
- **Actual**: `/customer-profile`
- **Resolution**: Review routing logic for general analysis queries

---

## Cross-Endpoint Standardization Issues

### Visual Consistency

#### 1. Color Scheme Standardization
**Issue**: Inconsistent color schemes across endpoints
- **Standard**: Red-to-green gradient (as used in strategic analysis)
- **Action Items**:
  - [ ] Update all visualizations to use consistent color scale
  - [ ] Define standard color ranges for score values
  - [ ] Document color mapping standards

#### 2. Legend Scale Issues
**Issue**: Some visualizations show 0-1 scale instead of actual score ranges
- **Action Items**:
  - [ ] Standardize legend to show actual data ranges
  - [ ] Ensure proper data normalization
  - [ ] Fix grey rendering issues

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
**Issue**: Multiple areas showing identical scores
- **Example**: "32544 (Hurlburt Field) (19.59)"
- **Action Items**:
  - [ ] Verify score field calculations
  - [ ] Check for data precision issues
  - [ ] Implement score differentiation logic

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
1. Fix grey visualization rendering issues
2. Standardize color schemes
3. Fix routing mismatches
4. Remove duplicate scores

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
*Version: 1.0*