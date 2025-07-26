# Grouped Variables Extension Guide

**Date**: January 2025  
**System**: MPIQ AI Chat - Query Classification & Concept Mapping  
**Purpose**: Guide for extending the grouped variable detection system for new projects

## 🎯 Overview

The grouped variable detection system allows users to use natural language terms like "all major brands", "athletic shoes", or "premium categories" which automatically expand to include all relevant field codes from your dataset. This guide shows how to configure this system for new projects and datasets.

## 🔧 System Architecture

### **Core Components**
1. **`lib/concept-mapping.ts`** - Main grouped variable detection logic
2. **`lib/query-analyzer.ts`** - Query pattern analysis and field prioritization
3. **Configuration Objects** - Easily modifiable patterns and field mappings

### **How It Works**
1. User enters natural language query (e.g., "Compare all major athletic brands")
2. System detects grouped variable patterns using regex
3. Automatically expands to include all relevant field codes
4. Provides appropriate layers and confidence scores
5. Query analyzer prioritizes fields and selects visualization strategy

---

## 📋 Step-by-Step Extension Process

### **Step 1: Update Grouped Variable Patterns**

**File**: `lib/concept-mapping.ts`  
**Section**: `GROUPED_VARIABLE_PATTERNS`

Add new regex patterns for your domain:

```typescript
const GROUPED_VARIABLE_PATTERNS = {
  // EXISTING: Athletic shoe patterns
  allMajorBrands: /\b(all\s+major\s+(athletic\s+)?brands?|...)\b/i,
  
  // NEW: Real estate example
  luxuryProperties: /\b(luxury\s+properties?|high.end\s+homes?|premium\s+real\s+estate)\b/i,
  affordableHousing: /\b(affordable\s+housing|budget\s+homes?|low.income\s+housing)\b/i,
  
  // NEW: Retail example  
  bigBoxStores: /\b(big\s+box\s+stores?|major\s+retailers?|chain\s+stores?)\b/i,
  localBusiness: /\b(local\s+business|small\s+business|independent\s+stores?)\b/i,
  
  // NEW: Healthcare example
  medicalFacilities: /\b(medical\s+facilities?|healthcare\s+centers?|hospitals?)\b/i,
  specialtyCare: /\b(specialty\s+care|specialized\s+medical|specialist\s+clinics?)\b/i,
} as const;
```

**Pattern Design Tips:**
- Use `\b` for word boundaries to avoid partial matches
- Include singular and plural forms (`brand?` = brand or brands)
- Account for spacing variations (`\s+` = one or more spaces)
- Use optional groups `(...)` for variations
- Test patterns with actual user queries

---

### **Step 2: Define Field Mappings**

**File**: `lib/concept-mapping.ts`  
**Section**: `GROUPED_VARIABLE_FIELDS`

Map each pattern to relevant field codes:

```typescript
const GROUPED_VARIABLE_FIELDS = {
  // EXISTING: Athletic brands
  allMajorBrands: ['MP30034A_B_P', 'MP30029A_B_P', ...],
  
  // NEW: Real estate fields
  luxuryProperties: [
    'LUXURY_HOME_SALES_PCT',
    'HIGH_END_CONDO_PCT', 
    'MANSION_PURCHASES_PCT',
    'PREMIUM_REAL_ESTATE_PCT'
  ],
  
  affordableHousing: [
    'AFFORDABLE_HOUSING_PCT',
    'LOW_INCOME_HOUSING_PCT',
    'SUBSIDIZED_HOUSING_PCT'
  ],
  
  // NEW: Retail fields
  bigBoxStores: [
    'WALMART_SHOPPERS_PCT',
    'TARGET_SHOPPERS_PCT',
    'COSTCO_MEMBERS_PCT',
    'HOME_DEPOT_SHOPPERS_PCT'
  ],
  
  // NEW: Healthcare fields
  medicalFacilities: [
    'HOSPITAL_ACCESS_PCT',
    'CLINIC_DENSITY_INDEX',
    'MEDICAL_CENTERS_COUNT'
  ],
} as const;
```

**Field Code Guidelines:**
- Use your actual dataset field codes
- Include percentage fields when available (better for visualization)
- Group logically related fields together
- Document field meanings with comments

---

### **Step 3: Associate with Layers**

**File**: `lib/concept-mapping.ts`  
**Section**: `GROUPED_VARIABLE_LAYERS`

Define which map layers should be activated:

```typescript
const GROUPED_VARIABLE_LAYERS = {
  // EXISTING: Athletic brands -> athletic shoe layer
  allMajorBrands: ['athleticShoePurchases'],
  
  // NEW: Real estate -> real estate layers
  luxuryProperties: ['realEstate', 'housingMarket'],
  affordableHousing: ['housingAffordability', 'demographics'],
  
  // NEW: Retail -> retail and economic layers
  bigBoxStores: ['retailMarket', 'economicActivity'],
  localBusiness: ['smallBusiness', 'localEconomy'],
  
  // NEW: Healthcare -> healthcare and accessibility layers
  medicalFacilities: ['healthcare', 'publicServices'],
  specialtyCare: ['healthcare', 'demographics'],
} as const;
```

---

### **Step 4: Set Confidence Scores**

**File**: `lib/concept-mapping.ts`  
**Section**: `GROUPED_VARIABLE_SCORES`

Define confidence levels for each pattern:

```typescript
const GROUPED_VARIABLE_SCORES = {
  // EXISTING: Athletic brands
  allMajorBrands: 90,
  premiumBrands: 95,
  
  // NEW: Confidence scores for new patterns
  luxuryProperties: 95,    // High confidence - specific luxury terms
  affordableHousing: 90,   // High confidence - clear category
  bigBoxStores: 85,        // Good confidence - well-defined category  
  localBusiness: 80,       // Medium confidence - broader category
  medicalFacilities: 90,   // High confidence - specific domain
  specialtyCare: 85,       // Good confidence - specific but varied
} as const;
```

**Scoring Guidelines:**
- **95-100**: Very specific, unambiguous patterns
- **85-94**: Clear patterns with good specificity
- **75-84**: Moderately specific patterns
- **65-74**: Broader, more general patterns
- **Below 65**: Use with caution, may need refinement

---

### **Step 5: Update Direct Brand/Entity Mapping**

**File**: `lib/concept-mapping.ts`  
**Section**: `BRAND_FIELD_MAP`

Add specific entity mappings for your domain:

```typescript
// FOR ATHLETIC SHOES (current):
const BRAND_FIELD_MAP = {
  'nike': 'MP30034A_B_P',
  'adidas': 'MP30029A_B_P', 
  // ... existing brands
} as const;

// FOR REAL ESTATE (example):
const PROPERTY_TYPE_MAP = {
  'condos': 'CONDO_SALES_PCT',
  'single family': 'SINGLE_FAMILY_PCT',
  'townhouses': 'TOWNHOUSE_PCT',
  'apartments': 'APARTMENT_RENTAL_PCT',
} as const;

// FOR RETAIL (example):
const RETAILER_MAP = {
  'walmart': 'WALMART_SHOPPERS_PCT',
  'target': 'TARGET_SHOPPERS_PCT',
  'amazon': 'AMAZON_USAGE_PCT',
  'costco': 'COSTCO_MEMBERS_PCT',
} as const;
```

---

### **Step 6: Update Query Analysis Patterns**

**File**: `lib/query-analyzer.ts`  
**Section**: `QUERY_TYPE_PATTERNS`

Add domain-specific query patterns:

```typescript
const QUERY_TYPE_PATTERNS = {
  // EXISTING: General patterns
  hotspot: /\b(hotspot|cluster|geographic.*cluster)\b/i,
  topN: /\b(top|bottom|highest|lowest|best|worst)\b/i,
  
  // NEW: Domain-specific patterns
  realEstateMarket: /\b(real\s+estate\s+market|property\s+market|housing\s+market)\b/i,
  affordabilityAnalysis: /\b(affordability|affordable|budget|low.income)\b/i,
  retailAnalysis: /\b(shopping\s+patterns?|retail\s+market|consumer\s+behavior)\b/i,
  healthcareAccess: /\b(healthcare\s+access|medical\s+access|health\s+services?)\b/i,
} as const;
```

---

### **Step 7: Update Field Categories**

**File**: `lib/query-analyzer.ts`  
**Section**: Domain-specific field categories

Replace athletic shoe fields with your domain fields:

```typescript
// FOR ATHLETIC SHOES (current):
const BRAND_FIELD_CODES: Record<string, string> = {
  'nike': 'MP30034A_B',
  'adidas': 'MP30029A_B',
  // ... existing brands
} as const;

// FOR REAL ESTATE (example):
const PROPERTY_FIELD_CODES: Record<string, string> = {
  'luxury_homes': 'LUXURY_HOME_SALES',
  'condos': 'CONDO_SALES',
  'single_family': 'SINGLE_FAMILY_SALES',
  'townhouses': 'TOWNHOUSE_SALES',
} as const;

// Update demographic fields for your context
const demographicFields = [
  // Real estate context
  'median_home_value',
  'property_tax_rate', 
  'homeownership_rate',
  'rental_vacancy_rate'
];
```

---

## 🧪 Testing Your Extensions

### **1. Create Test Queries**

Create sample queries for your domain:

```javascript
// Real estate examples
const testQueries = [
  "Compare all luxury property types",
  "Show affordable housing distribution", 
  "Find hotspots of high-end real estate",
  "Which areas have the most expensive homes?",
  "How do condo sales compare to single family homes?"
];

// Retail examples  
const retailTestQueries = [
  "Compare all major retailers",
  "Show big box store penetration",
  "Find areas with high local business activity",
  "Which regions shop at premium stores most?"
];
```

### **2. Validation Test**

Create a validation test similar to the existing one:

```typescript
// Add to __tests__/ directory
describe('New Domain Query Classification', () => {
  const testCases = [
    {
      query: "Compare all luxury property types",
      expectedType: "multivariate",
      expectedFields: ["LUXURY_HOME_SALES_PCT", "HIGH_END_CONDO_PCT"]
    },
    // ... more test cases
  ];
  
  test.each(testCases)('should classify "$query" correctly', async ({ query, expectedType, expectedFields }) => {
    const conceptMap = await conceptMapping(query);
    const analysisResult = await analyzeQuery(query, conceptMap);
    
    expect(analysisResult.queryType).toBe(expectedType);
    expect(conceptMap.matchedFields).toEqual(expect.arrayContaining(expectedFields));
  });
});
```

### **3. Console Debugging**

Monitor console output for grouped variable detection:

```
[ConceptMapping] Grouped variable detected: luxuryProperties -> 4 fields, 2 layers
[QueryAnalyzer] Confirmed multivariate: 4 fields detected
[QueryAnalyzer] Analysis complete: Query Type: multivariate
```

---

## 📚 Real-World Examples

### **Example 1: Real Estate Project**

```typescript
// Step 1: Patterns
luxuryProperties: /\b(luxury\s+properties?|high.end\s+homes?|premium\s+real\s+estate|executive\s+homes?)\b/i,

// Step 2: Fields  
luxuryProperties: [
  'LUXURY_HOME_SALES_PCT',
  'MILLION_DOLLAR_HOMES_PCT', 
  'EXECUTIVE_HOUSING_PCT',
  'PREMIUM_CONDOS_PCT'
],

// Step 3: Layers
luxuryProperties: ['realEstate', 'luxuryMarket'],

// Step 4: Score
luxuryProperties: 95,

// Step 5: Direct mapping
'luxury_homes': 'LUXURY_HOME_SALES_PCT',
'executive_homes': 'EXECUTIVE_HOUSING_PCT',
```

**Test Query**: "Compare luxury properties across different neighborhoods"
**Expected Result**: Detects `luxuryProperties` pattern, expands to 4 fields, classifies as `multivariate`

### **Example 2: Healthcare Project**

```typescript
// Comprehensive healthcare facility grouping
medicalFacilities: /\b(medical\s+facilities?|healthcare\s+(centers?|facilities?)|hospitals?|clinics?|health\s+services?)\b/i,

medicalFacilities: [
  'HOSPITAL_ACCESS_PCT',
  'CLINIC_DENSITY_INDEX',
  'MEDICAL_CENTER_COUNT',
  'SPECIALIST_ACCESS_PCT',
  'EMERGENCY_SERVICES_PCT'
],

medicalFacilities: ['healthcare', 'publicServices', 'accessibility'],

// Direct mappings
'hospitals': 'HOSPITAL_ACCESS_PCT',
'clinics': 'CLINIC_DENSITY_INDEX',
'specialists': 'SPECIALIST_ACCESS_PCT',
```

**Test Query**: "Find areas with good access to medical facilities"
**Expected Result**: Detects `medicalFacilities` pattern, expands to 5 fields, maps to healthcare layers

### **Example 3: Educational Project**

```typescript
// Educational institutions grouping
educationalInstitutions: /\b(schools?|educational\s+institutions?|academic\s+facilities?|learning\s+centers?)\b/i,

educationalInstitutions: [
  'ELEMENTARY_SCHOOL_ACCESS',
  'HIGH_SCHOOL_QUALITY_INDEX', 
  'COLLEGE_ENROLLMENT_PCT',
  'PRIVATE_SCHOOL_PCT',
  'UNIVERSITY_PROXIMITY'
],

educationalInstitutions: ['education', 'publicServices'],

// Performance levels
highPerformingSchools: /\b(high.performing\s+schools?|top\s+schools?|excellent\s+schools?)\b/i,
```

---

## 🔧 Advanced Configuration

### **Conditional Logic**

Add conditional logic for complex scenarios:

```typescript
function processGroupedVariables(/* ... */) {
  for (const [groupName, pattern] of Object.entries(GROUPED_VARIABLE_PATTERNS)) {
    if (pattern.test(lowerQuery)) {
      // Custom logic for specific patterns
      if (groupName === 'luxuryProperties') {
        // Only include luxury fields if query mentions luxury indicators
        if (/\b(luxury|premium|high.end|expensive)\b/i.test(lowerQuery)) {
          // Standard processing
        } else {
          // Skip this pattern
          continue;
        }
      }
      
      // Standard processing...
    }
  }
}
```

### **Dynamic Field Selection**

Select fields based on query context:

```typescript
// Dynamic field selection based on geographic context
if (lowerQuery.includes('urban')) {
  fields = fields.filter(field => field.includes('URBAN'));
} else if (lowerQuery.includes('rural')) {
  fields = fields.filter(field => field.includes('RURAL'));
}
```

### **Hierarchical Grouping**

Create nested groupings:

```typescript
const HIERARCHICAL_GROUPS = {
  'retail': {
    'bigBox': ['WALMART_PCT', 'TARGET_PCT', 'COSTCO_PCT'],
    'luxury': ['NORDSTROM_PCT', 'SAKS_PCT', 'TIFFANY_PCT'],
    'discount': ['DOLLAR_STORE_PCT', 'DISCOUNT_RETAIL_PCT']
  }
};
```

---

## 🚀 Best Practices

### **1. Pattern Design**
- Start with specific patterns, add general ones later
- Test patterns with real user queries
- Use word boundaries to avoid false matches
- Include common variations and synonyms

### **2. Field Organization**
- Group logically related fields
- Prefer percentage fields for better visualization
- Document field meanings and sources
- Keep field lists maintainable (5-10 fields per group)

### **3. Performance Optimization**
- Order patterns by specificity (most specific first)
- Cache field mappings when possible
- Use efficient regex patterns
- Monitor performance with large field sets

### **4. Error Handling**
- Validate field codes exist in dataset
- Provide fallbacks for empty results
- Log pattern matches for debugging
- Handle edge cases gracefully

### **5. Documentation**
- Document all patterns and their purposes
- Provide examples for each grouped variable
- Maintain test cases for validation
- Update documentation when adding new patterns

---

## 📊 Monitoring and Debugging

### **Console Logging**
Monitor grouped variable detection:
```
[ConceptMapping] Grouped variable detected: luxuryProperties -> 4 fields, 2 layers
[ConceptMapping] Direct brand match: luxury_homes -> LUXURY_HOME_SALES_PCT
[QueryAnalyzer] Confirmed multivariate: 4 fields detected
```

### **Validation Dashboard**
Create a validation dashboard to test patterns:
```typescript
function validatePatterns(testQueries: string[]) {
  testQueries.forEach(query => {
    const conceptMap = conceptMapping(query);
    console.log(`Query: "${query}"`);
    console.log(`  Fields: ${conceptMap.matchedFields.length}`);
    console.log(`  Layers: ${conceptMap.matchedLayers.length}`);
    console.log(`  Confidence: ${conceptMap.confidence}`);
  });
}
```

### **Performance Metrics**
Track pattern matching performance:
- Pattern match frequency
- Field expansion rates  
- Query classification accuracy
- Response times

---

## 🎯 Summary

The grouped variable detection system provides a powerful, extensible way to handle natural language queries that refer to categories of data. By following this guide, you can:

1. **Easily extend** the system for new domains and datasets
2. **Maintain** clear, documented configurations
3. **Test** thoroughly with domain-specific queries
4. **Monitor** performance and accuracy
5. **Scale** to handle complex, multi-field analyses

The modular design ensures that changes are isolated and easy to implement, while the comprehensive logging helps with debugging and validation.

**Key Benefits:**
- ✅ Users can ask natural questions like "compare all luxury properties"
- ✅ System automatically expands to relevant field codes
- ✅ Easy to configure for new projects and domains
- ✅ Maintains high accuracy with proper testing
- ✅ Scales to handle complex multi-variable analyses

This system transforms complex dataset queries into intuitive natural language interactions, making data analysis accessible to non-technical users while maintaining the flexibility needed for sophisticated analysis. 