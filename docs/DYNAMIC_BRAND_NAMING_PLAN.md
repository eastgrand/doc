# Dynamic Brand Naming Implementation Plan

## Overview

This document outlines the plan to implement dynamic brand naming across analysis processors, replacing generic "Brand A", "Brand B" terminology with actual brand names sourced from field-aliases configuration.

## Current State

### Analysis Prompts ✅ COMPLETED
- All analysis prompts have been made generic and brand-agnostic
- No hardcoded Nike/Adidas references in prompt templates
- Prompts use generic terminology like "brand performance", "competitive positioning"

### Processors 🔄 IN PROGRESS
- `ComparativeAnalysisProcessor` currently uses generic "Brand A/B" in output
- Other brand-related processors likely have similar generic or hardcoded references
- Field detection is dynamic but naming is still generic

## Goal

Transform processor outputs from:
```
• Brand Performance Gap (35% weight): Brand A vs competitors performance differential
• Market dominance: 15 Brand A-dominant markets (18.3%), 42 balanced markets (51.2%)
```

To:
```
• Brand Performance Gap (35% weight): Nike vs competitors performance differential  
• Market dominance: 15 Nike-dominant markets (18.3%), 42 balanced markets (51.2%)
```

## Technical Approach

### Phase 1: Field-Aliases Integration Utility

Create a shared utility class for brand name resolution:

```typescript
class BrandNameResolver {
  constructor(fieldAliases?: Record<string, string>) {
    this.fieldAliases = fieldAliases || {};
  }

  /**
   * Extract brand name from field alias
   * Example: "Nike Market Share (%)" → "Nike"
   */
  extractBrandName(fieldName: string): string | null {
    const alias = this.fieldAliases[fieldName];
    if (!alias) return null;
    
    // Parse brand name from aliases like:
    // "Nike Market Share (%)" → "Nike"
    // "Adidas Purchase Intent" → "Adidas" 
    // "Jordan Brand Affinity" → "Jordan"
    
    return this.parseBrandFromAlias(alias);
  }

  /**
   * Get branded terminology for analysis output
   */
  getBrandedTerm(genericTerm: string, brandName: string): string {
    return genericTerm.replace(/Brand A|Brand B/g, brandName);
  }
}
```

### Phase 2: Processor Integration

Update processors to use actual brand names:

#### 2.1 ComparativeAnalysisProcessor (FIRST)
- Integrate `BrandNameResolver` 
- Update `extractBrandMetric()` to return both value and brand name
- Modify summary generation to use actual brand names
- Fallback to "Brand A/B" when names unavailable

#### 2.2 Other Priority Processors
1. **BrandAnalysisProcessor** - Direct brand strength analysis
2. **BrandDifferenceProcessor** - Brand vs brand comparisons  
3. **CompetitiveDataProcessor** - Competitive landscape
4. **CorrelationAnalysisProcessor** - Brand correlation analysis
5. **CustomerProfileProcessor** - Brand affinity segments

## Implementation Details

### Field-Aliases Integration Points

#### Data Source
```typescript
interface ProcessorInput {
  rawData: RawAnalysisResult;
  fieldAliases?: Record<string, string>; // NEW: Pass field-aliases to processor
  // ... other existing fields
}
```

#### Brand Detection Enhancement
```typescript
private extractBrandMetric(record: any, brandType: 'brand_a' | 'brand_b'): BrandMetric {
  const brandFields = this.findBrandFields(record);
  const fieldName = brandFields[brandType === 'brand_a' ? 0 : 1];
  
  return {
    value: Number(record[fieldName]) || 0,
    fieldName: fieldName,
    brandName: this.brandNameResolver.extractBrandName(fieldName) || `Brand ${brandType === 'brand_a' ? 'A' : 'B'}`
  };
}
```

#### Summary Generation Update
```typescript
private generateComparativeSummary(records: GeographicDataPoint[], brandAName: string, brandBName: string): string {
  let summary = `**⚖️ Comparative Analysis Formula (0-100 scale):**
• **Brand Performance Gap (35% weight):** ${brandAName} vs competitors performance differential
• **Market Position Strength (30% weight):** Relative market positioning and dominance
• **Competitive Dynamics (25% weight):** Competitive pressure and market share dynamics
• **Growth Differential (10% weight):** Relative growth potential and trend momentum

Higher scores indicate stronger competitive advantages and superior market positioning.
`;

  // ... rest of summary using brandAName/brandBName throughout
}
```

### Fallback Strategy

1. **Primary**: Use field-aliases to extract brand names
2. **Secondary**: Attempt to parse brand names from field names (mp30034a_b → "Nike" via lookup table)
3. **Fallback**: Use generic "Brand A", "Brand B" terminology

### Brand Name Parsing Logic

Common field alias patterns to handle:
- "Nike Market Share (%)" → "Nike"
- "Adidas Purchase Frequency" → "Adidas"  
- "Jordan Brand Loyalty Score" → "Jordan"
- "Brand Affinity - Nike" → "Nike"
- "Market Share: Adidas" → "Adidas"

Parsing rules:
1. Look for known brand names at start of alias
2. Look for brand names after common separators (-, :, |)
3. Use word boundary detection for brand extraction

## Benefits

### User Experience
- **Clarity**: "Nike dominates with 67% market share" vs "Brand A dominates with 67% market share"
- **Actionability**: Users immediately understand which brands are being analyzed
- **Professional**: Analysis looks more polished and context-aware

### Technical Benefits
- **Maintainability**: Prompts remain generic and reusable
- **Flexibility**: Same processor works across different brand datasets
- **Consistency**: All processors use same brand naming approach

### Business Benefits
- **Faster Insights**: No mental translation from "Brand A" to actual brand
- **Better Reports**: Analysis can be shared directly with stakeholders
- **Scalability**: System works with any brand set without prompt changes

## Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Create `BrandNameResolver` utility class
- [ ] Design field-aliases integration pattern
- [ ] Create unit tests for brand name extraction

### Phase 2: Proof of Concept (Week 1-2) 
- [ ] Update `ComparativeAnalysisProcessor` to use dynamic brand names
- [ ] Test with existing Nike/Adidas data
- [ ] Test with other brand datasets
- [ ] Verify fallback behavior

### Phase 3: Rollout (Week 2-3)
- [ ] Update `BrandAnalysisProcessor`
- [ ] Update `BrandDifferenceProcessor` 
- [ ] Update `CompetitiveDataProcessor`
- [ ] Update `CorrelationAnalysisProcessor`
- [ ] Update `CustomerProfileProcessor`

### Phase 4: Validation (Week 3-4)
- [ ] End-to-end testing across all processors
- [ ] Performance impact assessment
- [ ] Documentation updates
- [ ] User acceptance testing

## Testing Strategy

### Unit Tests
- Brand name extraction from various alias formats
- Fallback behavior when aliases unavailable
- Edge cases (empty aliases, malformed field names)

### Integration Tests  
- Full processor pipeline with field-aliases
- Multiple brand scenarios (2 brands, 3+ brands, no brands)
- Cross-processor consistency

### User Acceptance Tests
- Real-world datasets with actual field-aliases
- Comparison of before/after analysis readability
- Performance benchmarking

## Risk Mitigation

### Performance Impact
- **Risk**: Field-aliases lookup adds processing overhead
- **Mitigation**: Cache brand name resolutions, benchmark performance

### Data Quality
- **Risk**: Inconsistent field-aliases across projects
- **Mitigation**: Robust fallback strategy, validation utilities

### Backward Compatibility  
- **Risk**: Breaking existing analysis outputs
- **Mitigation**: Gradual rollout, feature flags, thorough testing

## Success Metrics

### Technical Metrics
- [ ] All brand-related processors support dynamic naming
- [ ] <5ms overhead for brand name resolution
- [ ] >95% test coverage for brand naming logic

### User Experience Metrics
- [ ] Analysis outputs show actual brand names when available
- [ ] Graceful fallback to generic names when needed
- [ ] Consistent brand naming across all analysis types

### Business Metrics
- [ ] Reduced time for users to interpret analysis results
- [ ] Increased analysis sharing and stakeholder engagement
- [ ] Positive feedback on analysis clarity and professionalism

## Future Enhancements

### Advanced Brand Recognition
- Machine learning-based brand name extraction
- Industry-specific brand databases
- Multi-language brand name support

### Configuration Management
- UI for managing field-aliases mappings
- Project-specific brand configuration
- Brand taxonomy management

### Analytics Integration
- Track most commonly analyzed brands
- Brand performance benchmarking across projects
- Competitive landscape insights