# Visualization Testing Strategy

**Date**: January 2025  
**Status**: Complete Testing Framework  
**Purpose**: Validate end-to-end visualization flow from query classification to working legends and popups

---

## 🎯 Overview

This document outlines a comprehensive testing strategy for the complete MPIQ AI chat visualization pipeline. The system has achieved **100% query classification accuracy**, and now we need to ensure the entire flow through visualization works correctly.

## 🔄 Complete Flow to Test

```
User Query → Concept Mapping → Query Analysis → Visualization Factory → Feature Layer → Legend + Popup → Map Display
```

---

## 🧪 Testing Layers

### **Layer 1: Query Classification Tests** ✅ **COMPLETE**
- **Status**: 100% success rate (69/69 queries)
- **Coverage**: All query types, grouped variables, pattern recognition
- **Test File**: `__tests__/chat-constants-validation.test.ts`

### **Layer 2: Integration Tests** ✅ **IMPLEMENTED**
- **Purpose**: Validate query → analysis pipeline
- **Coverage**: Concept mapping, query analysis, strategy mapping
- **Test File**: `__tests__/visualization-integration.test.ts`
- **Results**: All core functionality working correctly

### **Layer 3: Visualization Component Tests** 📋 **NEXT PRIORITY**
- **Purpose**: Test visualization factory and individual visualization types
- **Coverage**: Layer creation, renderer configuration, legend generation
- **Status**: Needs implementation

### **Layer 4: End-to-End UI Tests** 📋 **FUTURE**
- **Purpose**: Test complete user interaction flow
- **Coverage**: Map display, popup interactions, legend display
- **Status**: Manual testing currently

---

## 🎯 Current Testing Status

### ✅ **Working & Tested**:
1. **Query Classification** - 100% accuracy
2. **Concept Mapping** - All brands and grouped variables working
3. **Query Analysis** - Correct type detection and strategy mapping
4. **Field Mapping** - Brand names correctly map to dataset fields
5. **Grouped Variables** - Athletic shoes, premium brands, demographics expand correctly
6. **Error Handling** - Invalid queries handled gracefully
7. **Performance** - Sub-second processing times

### 📋 **Needs Testing**:
1. **Visualization Factory** - Creating actual ArcGIS layers
2. **Renderer Creation** - Correct symbols, colors, classification
3. **Legend Generation** - Proper legend structure and formatting
4. **Popup Templates** - Field display, formatting, content types
5. **Map Integration** - Layer display, extent calculation, zoom behavior

---

## 🧪 Implemented Tests

### **Integration Test Suite** (`__tests__/visualization-integration.test.ts`)

#### **1. Query Classification Pipeline**
Tests the complete flow from query to visualization strategy:
```typescript
const testQueries = [
  { query: 'Show me the top 10 areas...', expectedType: 'topN', expectedStrategy: 'ranking' },
  { query: 'Compare Nike vs Adidas...', expectedType: 'difference', expectedStrategy: 'difference' },
  { query: 'Find hotspots of athletic shoe purchases', expectedType: 'hotspot', expectedStrategy: 'hotspot' },
  { query: 'Compare Nike, Adidas, Puma, and Jordan together', expectedType: 'multivariate', expectedStrategy: 'multivariate' }
];
```

#### **2. Field Mapping Validation**
Ensures brand names map to correct dataset fields:
```typescript
const brandTests = [
  { query: 'Show Nike purchases', expectedField: 'MP30034A_B' },
  { query: 'Show Adidas purchases', expectedField: 'MP30029A_B' },
  { query: 'Show Jordan purchases', expectedField: 'MP30032A_B' }
];
```

#### **3. Grouped Variable Detection**
Validates that generic terms expand to multiple fields:
```typescript
const groupedTests = [
  { query: 'Find hotspots of athletic shoe purchases', expectedMinFields: 5 },
  { query: 'Identify markets with potential for premium athletic brand expansion', expectedMinFields: 2 },
  { query: 'Do younger regions search differently than older ones?', expectedMinFields: 2 }
];
```

#### **4. Strategy Mapping**
Tests query type → visualization strategy mapping:
```typescript
const strategyTests = [
  { queryType: 'ranking', expectedStrategy: 'ranking' },
  { queryType: 'hotspot', expectedStrategy: 'hotspot' },
  { queryType: 'multivariate', expectedStrategy: 'multivariate' }
];
```

#### **5. Error Handling**
Validates graceful handling of invalid queries:
```typescript
const invalidQueries = [
  'Show me unicorns in rainbow land',
  'Correlate quantum mechanics with breakfast cereals'
];
```

#### **6. Performance Validation**
Ensures reasonable processing times:
```typescript
expect(conceptMappingTime).toBeLessThan(1000); // 1 second
expect(totalTime).toBeLessThan(2000); // 2 seconds total
```

---

## 📋 Next Testing Priorities

### **Priority 1: Visualization Factory Tests**

Create tests for the actual visualization creation:

```typescript
describe('Visualization Factory Tests', () => {
  test('should create feature layers with correct renderers', async () => {
    const factory = new VisualizationFactory({...});
    const result = await factory.createVisualization(layerData, options);
    
    expect(result.layer).toBeDefined();
    expect(result.layer.renderer).toBeDefined();
    expect(result.layer.renderer.type).toBe('class-breaks'); // or appropriate type
  });
  
  test('should generate proper legend information', async () => {
    const result = await factory.createVisualization(layerData, options);
    
    expect(result.legendInfo).toBeDefined();
    expect(result.legendInfo.items.length).toBeGreaterThan(0);
    expect(result.legendInfo.type).toBe('class-breaks');
  });
  
  test('should create functional popup templates', async () => {
    const result = await factory.createVisualization(layerData, options);
    
    expect(result.layer.popupTemplate).toBeDefined();
    expect(result.layer.popupTemplate.content).toBeDefined();
  });
});
```

### **Priority 2: Renderer-Specific Tests**

Test different visualization types:

```typescript
describe('Renderer Type Tests', () => {
  test('ranking visualization should use class breaks renderer', async () => {
    // Test topN/ranking queries
  });
  
  test('multivariate visualization should use unique value renderer', async () => {
    // Test multivariate queries
  });
  
  test('difference visualization should use diverging color scheme', async () => {
    // Test difference queries
  });
  
  test('hotspot visualization should use heatmap renderer', async () => {
    // Test hotspot queries
  });
});
```

### **Priority 3: Legend & Popup Component Tests**

Test specific UI components:

```typescript
describe('Legend Component Tests', () => {
  test('should display correct legend items for each visualization type', () => {
    // Test legend rendering
  });
  
  test('should handle different legend types (class-breaks, unique-value, etc.)', () => {
    // Test legend type handling
  });
});

describe('Popup Component Tests', () => {
  test('should display correct field information', () => {
    // Test popup content
  });
  
  test('should format numeric values correctly', () => {
    // Test value formatting
  });
});
```

---

## 🔧 Manual Testing Checklist

Until automated tests are complete, use this manual testing checklist:

### **Visualization Creation**
- [ ] Query processes without errors
- [ ] Layer appears on map
- [ ] Renderer displays correct colors/symbols
- [ ] Data values are accurately represented

### **Legend Display**
- [ ] Legend appears in UI
- [ ] Legend items match map colors
- [ ] Legend labels are descriptive
- [ ] Legend updates when visualization changes

### **Popup Functionality**
- [ ] Clicking features opens popup
- [ ] Popup displays relevant field information
- [ ] Field values are formatted correctly
- [ ] Popup content matches query intent

### **Map Interaction**
- [ ] Map zooms to feature extent
- [ ] Layer is visible at appropriate zoom levels
- [ ] Multiple layers can be displayed simultaneously
- [ ] Layer can be toggled on/off

---

## 🚀 Testing Tools & Setup

### **Running Current Tests**
```bash
# Run query classification tests
npm test -- __tests__/chat-constants-validation.test.ts

# Run integration tests  
npm test -- __tests__/visualization-integration.test.ts

# Run all tests
npm test
```

### **Manual Testing Environment**
- **Development Server**: `npm run dev`
- **Test Queries**: Use sample queries from `components/chat/chat-constants.ts`
- **Debug Mode**: Enable console logging for detailed pipeline information

### **Mock Data Setup**
For testing, use consistent mock geographic features:
```typescript
const mockFeatures = [
  {
    type: 'Feature',
    properties: {
      FSA_ID: 'V6K',
      MP30034A_B_P: 85.5, // Nike percentage
      MP30029A_B_P: 72.3, // Adidas percentage
      MEDDI_CY: 75000     // Median income
    },
    geometry: { /* valid polygon geometry */ }
  }
];
```

---

## 📊 Success Metrics

### **Quality Gates**
- [ ] **100% Query Classification** ✅ ACHIEVED
- [ ] **95%+ Integration Test Pass Rate** ✅ ACHIEVED
- [ ] **90%+ Visualization Creation Success Rate** 📋 IN PROGRESS
- [ ] **Zero Critical Errors** in production queries
- [ ] **Sub-2 second** end-to-end processing time

### **Coverage Goals**
- [ ] All 17 visualization types tested
- [ ] All 6 query categories covered
- [ ] Edge cases and error conditions handled
- [ ] Performance benchmarks established

---

## 🎯 Summary

The testing strategy provides comprehensive coverage of the visualization pipeline:

1. **✅ Foundation Complete**: Query classification and analysis working perfectly
2. **🔄 Integration Tested**: Full pipeline from query to strategy mapping validated
3. **📋 Next Phase**: Visualization factory and component testing
4. **🚀 Goal**: End-to-end automated testing with manual verification

This layered approach ensures reliability at each stage while building toward complete end-to-end validation of the visualization system. 