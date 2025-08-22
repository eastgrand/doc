# Query-to-Visualization Pipeline Testing Checklist

## Overview

This comprehensive checklist ensures the complete query-to-visualization pipeline works correctly across all 10+ steps from user input to map rendering. Use this to validate system functionality and identify issues systematically.

## Testing Categories

### 🔍 1. Query Analysis & Routing (Steps 1-2)

#### Semantic Router (NEW 2025)
- [ ] **Semantic understanding**: Queries route to correct endpoints with >80% confidence
- [ ] **Performance**: Routing completes within 25-55ms bounds
- [ ] **Natural language**: Conversational queries understood correctly
- [ ] **Synonym detection**: Query variations handled properly
- [ ] **Confidence scoring**: High-confidence results (>0.7) produce accurate routing
- [ ] **Timeout handling**: 100ms timeout prevents UI blocking

#### Enhanced Query Analyzer (Fallback)
- [ ] **Intent detection**: Strategic, competitive, demographic intents recognized
- [ ] **Brand recognition**: Nike, Adidas, TurboTax, H&R Block detected
- [ ] **Geographic entities**: Cities, counties, states extracted correctly
- [ ] **Analysis type classification**: Correct analysis type assigned
- [ ] **Keyword fallback**: Works when semantic routing fails/times out

#### Geographic Processing
- [ ] **Entity extraction**: "Miami-Dade County" → county entity
- [ ] **ZIP code mapping**: Counties mapped to correct ZIP codes
- [ ] **Multi-level filtering**: City, county, metro, state queries handled
- [ ] **Phase 1 implementation**: Geographic filtering reduces data by 80-95%

### ⚙️ 2. Configuration & Brand Management (Steps 3-4)

#### Configuration Manager
- [ ] **Centralized config**: All 25 endpoints configured correctly
- [ ] **Score field mapping**: `targetVariable` matches endpoint response fields
- [ ] **Processor routing**: Correct processor assigned to each endpoint
- [ ] **Field authority**: ConfigurationManager overrides processor settings
- [ ] **Validation**: Required fields validated for each endpoint

#### Brand Name Resolver
- [ ] **Dynamic detection**: Brand fields auto-detected from data
- [ ] **Market gap calculation**: Accurate percentage calculation (competitive space)
- [ ] **Target brand extraction**: Correct target brand identified
- [ ] **Project-agnostic**: Works across different industry projects
- [ ] **Field aliases integration**: Uses project-specific brand mappings

### 🌐 3. Data Processing & Optimization (Steps 5-7)

#### Endpoint Routing
- [ ] **Query mapping**: Queries route to appropriate analysis endpoints
- [ ] **Brand difference routing**: Brand comparison queries → `/brand-difference`
- [ ] **Geographic filtering**: Spatial queries include location context
- [ ] **Fallback handling**: General analysis endpoint used when uncertain

#### API Integration
- [ ] **Request formatting**: Geographic filters, brands, analysis type included
- [ ] **Response validation**: Success status and data structure verified
- [ ] **Error handling**: API failures handled gracefully
- [ ] **Timeout management**: Long-running requests don't block UI

#### Data Processing
- [ ] **Field extraction**: Score fields extracted with fallback hierarchy
- [ ] **Area name generation**: ZIP codes enhanced with city context
- [ ] **Validation flexibility**: Multiple field name options accepted
- [ ] **Empty results**: Zero results handled without errors
- [ ] **Data enrichment**: Additional metrics calculated correctly

#### Claude API Optimization (NEW 2025)
- [ ] **Large dataset detection**: >5000 records trigger optimization
- [ ] **Payload reduction**: 96%+ size reduction achieved
- [ ] **Statistical preservation**: Min, max, mean, quartiles maintained
- [ ] **Top performers**: High/low value areas identified
- [ ] **Geographic patterns**: Spatial clustering detected
- [ ] **Analysis-specific insights**: Tailored summaries per analysis type
- [ ] **Fallback system**: Triple-layer error recovery works

### 🎨 4. Visualization & Rendering (Steps 8-10)

#### Renderer Configuration
- [ ] **Field consistency**: Renderer field matches record fields exactly
- [ ] **Quartile classification**: 4-class breaks used consistently
- [ ] **Standard colors**: ACTIVE_COLOR_SCHEME applied (Red→Orange→Light Green→Green)
- [ ] **Standard opacity**: 0.6 opacity applied across all renderers
- [ ] **Symbol types**: Appropriate symbols for data type (polygons/points)

#### Legend Generation
- [ ] **Class breaks**: Quartile breaks displayed accurately
- [ ] **Color mapping**: Colors match renderer symbols
- [ ] **Value ranges**: Min-max ranges shown correctly
- [ ] **Title formatting**: Analysis-appropriate titles generated
- [ ] **Position**: Bottom-right positioning maintained

#### Popup Templates
- [ ] **Title structure**: `{area_name}` format used
- [ ] **Field selection**: Relevant fields included, irrelevant excluded
- [ ] **Value formatting**: Numbers formatted appropriately
- [ ] **Brand context**: Brand names included when relevant
- [ ] **Analysis context**: Analysis-specific fields prioritized

### 🔄 5. End-to-End Integration Tests

#### Strategic Analysis Pipeline
- [ ] **Query**: "Strategic expansion opportunities in Florida"
- [ ] **Geographic**: Florida entities extracted and ZIP codes mapped
- [ ] **Endpoint**: `/strategic-analysis` selected
- [ ] **Processing**: StrategicAnalysisProcessor used correctly
- [ ] **Field mapping**: `strategic_analysis_score` as targetVariable
- [ ] **Visualization**: Choropleth map with quartile colors
- [ ] **Performance**: Complete pipeline <1 second

#### Competitive Analysis Pipeline  
- [ ] **Query**: "Nike vs Adidas competitive analysis"
- [ ] **Brand detection**: Nike, Adidas brands identified
- [ ] **Endpoint**: `/competitive-analysis` selected  
- [ ] **Processing**: CompetitiveDataProcessor used
- [ ] **Brand resolution**: Actual brand names in summaries
- [ ] **Visualization**: Multi-symbol or choropleth rendering
- [ ] **Legend**: Dual-variable legend when applicable

#### Brand Difference Pipeline
- [ ] **Query**: "TurboTax vs H&R Block market share difference"
- [ ] **Brand mapping**: Correct field codes (MP10104A_B_P, MP10128A_B_P)
- [ ] **Endpoint**: `/brand-difference` selected
- [ ] **Processing**: BrandDifferenceProcessor calculates difference
- [ ] **Enrichment**: `brand_difference_score`, market share fields added
- [ ] **Visualization**: Diverging color scheme (red/green)
- [ ] **Categories**: Brand advantage categories assigned

#### Demographic Analysis Pipeline
- [ ] **Query**: "Demographic patterns in Miami-Dade County"
- [ ] **Geographic**: Miami-Dade ZIP codes filtered
- [ ] **Endpoint**: `/demographic-insights` selected
- [ ] **Processing**: DemographicDataProcessor used
- [ ] **Field relevance**: Age, income, education fields included
- [ ] **Visualization**: Appropriate demographic visualization
- [ ] **Context**: Population characteristics highlighted

### ⚡ 6. Performance & Error Handling

#### Performance Benchmarks
- [ ] **Query routing**: <100ms for semantic analysis
- [ ] **Data processing**: <500ms for typical datasets (1000 records)
- [ ] **Large datasets**: <2s for optimized large datasets (10,000+ records)
- [ ] **Visualization prep**: <200ms for renderer generation
- [ ] **Memory usage**: No memory leaks in repeated operations

#### Error Recovery
- [ ] **Semantic timeout**: Falls back to keyword analysis
- [ ] **API failures**: Graceful error messages, no crashes
- [ ] **Invalid data**: Validation errors handled appropriately
- [ ] **Network issues**: Retry mechanisms and user feedback
- [ ] **Browser compatibility**: Works across major browsers

#### Data Quality Validation
- [ ] **Field validation**: Required fields present or fallbacks used
- [ ] **Score ranges**: Values within expected bounds (0-100, 1-10, etc.)
- [ ] **Geographic coverage**: ZIP codes map to valid locations
- [ ] **Brand consistency**: Brand names consistent across analysis
- [ ] **Statistical validity**: Quartiles, means, distributions make sense

### 🧪 7. Predefined Query Testing (All Active Endpoints)

**Test Implementation**: Tests ALL queries from `ANALYSIS_CATEGORIES` in `chat-constants.ts` - every single query across all analysis categories without exception.

#### Query Categories Tested
- [ ] **Strategic Analysis**: "Show me the top strategic markets for H&R Block tax service expansion"
- [ ] **Competitive Analysis**: "Show me the market share difference between H&R Block and TurboTax"  
- [ ] **Demographic Insights**: "Which areas have the best customer demographics for tax preparation services?"
- [ ] **Brand Difference**: "Which markets have the strongest H&R Block brand positioning vs competitors?"
- [ ] **Customer Profile**: "Show me areas with ideal customer personas for tax preparation services"
- [ ] **Spatial Clusters**: "Show me geographic clusters of similar tax service markets"
- [ ] **City Comparisons**: "Compare H&R Block performance between Jacksonville and Tampa"
- [ ] **Scenario Analysis**: "What if H&R Block changes its pricing strategy - which markets would be most resilient?"
- [ ] **Feature Interactions**: "Which markets have the strongest interactions between demographics and tax service usage?"
- [ ] **Trends Analysis**: "Show me markets with the strongest growth trends for H&R Block online usage"

#### Analysis Quality Validation Implementation
```typescript
// Validates that analysis results make sense
const validateAnalysisQuality = (processedData, query) => {
  // Score reasonableness (0-100 bounds)
  const scores = records.map(r => r.value).filter(v => !isNaN(v));
  expect(minScore).toBeGreaterThanOrEqual(0);
  expect(maxScore).toBeLessThanOrEqual(100);
  
  // Statistical coherence
  const stdDev = Math.sqrt(variance);
  expect(stdDev).toBeGreaterThanOrEqual(0);
  
  // Geographic distribution (no duplicates)
  expect(new Set(areaIds).size).toBe(areaIds.length);
};
```

- [ ] **Score reasonableness**: Values within expected ranges for analysis type (0-100 or 1-10 scale)
- [ ] **Geographic distribution**: Results cover expected geographic areas, no duplicate IDs
- [ ] **Statistical coherence**: Mean, median, quartiles make mathematical sense
- [ ] **Standard deviation**: Reasonable spread, not all identical values
- [ ] **Outlier detection**: Unusual values flagged or explained appropriately
- [ ] **Trend consistency**: Results align with known market patterns

#### Legend Accuracy Validation Implementation  
```typescript
// Ensures legends accurately represent the data
const validateLegendAccuracy = (processedData, query) => {
  // Color mapping consistency
  legend.items.forEach((item, index) => {
    const rendererColor = renderer.classBreakInfos[index].symbol.color;
    expect(ACTIVE_COLOR_SCHEME).toContain(item.color);
  });
  
  // Value range coverage
  expect(legendMin).toBeLessThanOrEqual(dataMin + 1);
  expect(legendMax).toBeGreaterThanOrEqual(dataMax - 1);
};
```

- [ ] **Color-value mapping**: Legend colors exactly match map colors from ACTIVE_COLOR_SCHEME
- [ ] **Range accuracy**: Legend ranges cover actual data min/max values with tolerance
- [ ] **Class distribution**: Quartile breaks contain roughly equal feature counts
- [ ] **Title relevance**: Legend title matches analysis type and context
- [ ] **Unit consistency**: Units match data type (%, scores, indices)
- [ ] **Class count**: Legend items match renderer class breaks exactly

#### Predefined Query Test Results
- [ ] **Success rate**: 80%+ of all predefined queries process without errors
- [ ] **Routing accuracy**: Queries route to expected endpoints (/strategic-analysis, /competitive-analysis, etc.)
- [ ] **Geographic detection**: City/county comparison queries extract entities correctly
- [ ] **Brand routing**: Brand difference queries route to /brand-difference endpoint
- [ ] **Performance**: All queries complete within acceptable timeframes

### 📊 8. Data Validation Checklist

#### Input Data Validation
- [ ] **Required fields**: ID, area names, score fields present
- [ ] **Data types**: Numeric scores, string identifiers
- [ ] **Value ranges**: Scores within expected bounds
- [ ] **Geographic IDs**: Valid ZIP codes or area identifiers
- [ ] **Brand fields**: Proper field codes for brand data

#### Processed Data Validation
- [ ] **Field consistency**: Renderer field exists in all records
- [ ] **Score calculation**: Primary scores calculated correctly
- [ ] **Geographic enhancement**: City names added to area names
- [ ] **Ranking**: Records ranked by score appropriately
- [ ] **Categories**: Categorical data assigned correctly

#### Visualization Data Validation
- [ ] **Color mapping**: Colors match score quartiles
- [ ] **Symbol sizing**: Sizes appropriate for data ranges
- [ ] **Legend accuracy**: Legend matches actual data classes
- [ ] **Popup content**: All popup fields contain valid data
- [ ] **Interactive features**: Click/hover behaviors work correctly

### 🔧 9. Configuration Validation

#### ConfigurationManager Settings
- [ ] **All 25 endpoints**: Each endpoint has complete configuration
- [ ] **Field mapping**: `targetVariable` matches expected API response fields
- [ ] **Processor assignment**: Each endpoint maps to correct processor class
- [ ] **Score field names**: Primary score fields identified correctly
- [ ] **Override authority**: ConfigManager successfully overrides processor defaults

#### BrandNameResolver Settings
- [ ] **Target brand**: Correct primary brand configured
- [ ] **Competitor brands**: All competitor brands included
- [ ] **Field patterns**: Brand field patterns match API data
- [ ] **Industry context**: Configuration appropriate for project domain
- [ ] **Market gap bounds**: Realistic market gap calculations (5-95%)

#### Renderer Standardization
- [ ] **Color scheme**: ACTIVE_COLOR_SCHEME properly applied
- [ ] **Opacity standard**: 0.6 opacity used consistently
- [ ] **Quartile system**: 4-class breaks used across all analyses
- [ ] **Symbol standards**: Consistent symbol types and sizing
- [ ] **Legend formatting**: Standardized legend styles

### 📱 10. User Experience Validation

#### Query Input Experience
- [ ] **Natural language**: Users can type conversational queries
- [ ] **Instant feedback**: Query analysis feedback within 100ms
- [ ] **Error guidance**: Clear guidance when queries can't be processed
- [ ] **Query suggestions**: Helpful suggestions for query improvement
- [ ] **Loading states**: Appropriate loading indicators during processing

#### Analysis Results Experience
- [ ] **Progressive statistics**: Immediate stats while full analysis loads
- [ ] **Interactive tooltips**: Statistical explanations available
- [ ] **Copy functionality**: Easy copying of analysis results
- [ ] **Export options**: Conversation export to markdown
- [ ] **Visual clarity**: Professional, business-appropriate styling

#### Map Interaction Experience
- [ ] **Responsive rendering**: Map renders quickly after analysis
- [ ] **Interactive popups**: Clicking areas shows relevant information
- [ ] **Legend clarity**: Legend clearly explains color/symbol meaning
- [ ] **Zoom/pan**: Smooth map navigation
- [ ] **Mobile compatibility**: Works well on mobile devices

## Testing Tools & Commands

### Manual Testing Commands
```bash
# Run the comprehensive pipeline test with predefined queries
npm test query-to-visualization-pipeline.test.ts

# Test all predefined queries (100+ queries from chat-constants)
npm test query-to-visualization-pipeline.test.ts -- --verbose

# Test specific analysis types with predefined queries
npm test -- --grep "strategic analysis"
npm test -- --grep "brand difference" 
npm test -- --grep "demographic queries"
npm test -- --grep "city comparison"

# Test analysis quality validation
npm test -- --grep "analysis quality"

# Test legend accuracy validation  
npm test -- --grep "legend accuracy"

# Test specific pipeline components
npm test semantic-router.test.ts
npm test geo-awareness.test.ts  
npm test brand-resolver.test.ts
npm test configuration-manager.test.ts

# Test individual processors
npm test strategic-analysis-processor.test.ts
npm test competitive-data-processor.test.ts
npm test brand-difference-processor.test.ts

# Performance testing
npm run test:performance

# Integration testing
npm run test:integration
```

### Predefined Query Testing Commands
```bash
# Test routing accuracy for all query categories
npm test -- --grep "should route.*queries correctly"

# Test analysis quality for all predefined queries
npm test -- --grep "should handle all predefined queries"

# Test specific query categories from chat-constants
npm test -- --grep "Strategic Analysis"
npm test -- --grep "Competitive Analysis" 
npm test -- --grep "Brand Difference"
npm test -- --grep "City.*Regional Comparisons"

# Validate legend accuracy across analysis types
npm test -- --grep "should validate legend accuracy"

# Test geographic entity detection in city queries
npm test -- --grep "city comparison queries"
```

### Browser Testing Checklist
- [ ] **Chrome Desktop**: All functionality works
- [ ] **Safari Desktop**: ONNX.js compatibility verified
- [ ] **Firefox Desktop**: WebAssembly features working
- [ ] **Edge Desktop**: Semantic routing performance acceptable
- [ ] **Chrome Mobile**: Touch interactions responsive
- [ ] **Safari Mobile**: iOS compatibility confirmed

### API Testing Checklist
- [ ] **Development environment**: All endpoints responding
- [ ] **Production environment**: Live API integration working
- [ ] **Error scenarios**: 404, 500, timeout responses handled
- [ ] **Large datasets**: Performance acceptable for big queries
- [ ] **Rate limiting**: API rate limits respected

## Success Criteria

### ✅ Pipeline Completeness
- All 10 pipeline steps execute successfully
- No critical errors in any step
- Fallback mechanisms work when primary methods fail
- Performance meets acceptable thresholds

### ✅ Data Accuracy
- Processed data matches API response data
- Field mappings are consistent across pipeline
- Geographic filtering produces correct subsets
- Brand calculations are mathematically accurate

### ✅ Visualization Quality
- Maps render with correct colors and symbols
- Legends accurately represent data
- Popups contain relevant, correctly formatted information
- User interactions work smoothly

### ✅ User Experience
- Natural language queries understood correctly
- Results appear quickly with progressive loading
- Error states provide helpful guidance
- Overall experience feels professional and responsive

## Common Issues & Solutions

### Issue: Semantic Router Timeout
**Symptoms**: Queries take >100ms, fallback to keyword analysis
**Solution**: Check ONNX.js model loading, verify WebAssembly support
**Test**: Measure routing performance across different query types

### Issue: Field Mapping Mismatch  
**Symptoms**: Renderer can't find field in data, blank visualizations
**Solution**: Verify ConfigurationManager targetVariable matches processor output
**Test**: Validate field consistency across entire pipeline

### Issue: Geographic Filtering Not Working
**Symptoms**: Queries return all data instead of geographic subset
**Solution**: Check GeoAwarenessEngine entity recognition and ZIP mapping
**Test**: Verify specific city/county queries return appropriate data subset

### Issue: Brand Names Show as "Brand A"
**Symptoms**: Generic brand terminology instead of actual brand names
**Solution**: Verify BrandNameResolver configuration and field aliases
**Test**: Check that processed summaries contain actual brand names

### Issue: Color Scheme Inconsistency
**Symptoms**: Maps show different colors than expected standard scheme
**Solution**: Ensure ACTIVE_COLOR_SCHEME applied and standardizeRenderer called
**Test**: Verify all renderers use red→orange→light green→green progression

## Test Implementation Details

### Test File Structure
```
__tests__/query-to-visualization-pipeline.test.ts
├── Pipeline Step 1: Query Analysis (Semantic Router + Fallback)
├── Pipeline Step 2: Geographic Processing  
├── Pipeline Step 3: Configuration Management
├── Pipeline Step 4: Brand Name Resolution
├── Pipeline Step 5: Endpoint Routing
├── Pipeline Step 6-7: API Call and Data Processing
├── Pipeline Step 7.5: Claude API Data Optimization
├── Pipeline Step 8: Renderer Configuration
├── Pipeline Step 9: ArcGIS Visualization Preparation
├── Predefined Query Testing (All Active Endpoints) ← NEW
└── End-to-End Pipeline Integration Tests
```

### Key Test Features

#### Real-World Query Testing
- **Source**: `components/chat/chat-constants.ts`
- **Coverage**: 22+ analysis categories, 100+ queries
- **Categories**: ANALYSIS_CATEGORIES + TRENDS_CATEGORIES
- **Validation**: Analysis quality + legend accuracy for each query

#### Mock Data Integration
```typescript
// Strategic Analysis Mock Response
const mockStrategicResponse = {
  success: true,
  results: [
    { ID: "32601", DESCRIPTION: "Gainesville", strategic_analysis_score: 85.3, ... },
    { ID: "33101", DESCRIPTION: "Miami Downtown", strategic_analysis_score: 92.1, ... }
  ]
};

// Brand Difference Mock Response  
const mockBrandDifferenceResponse = {
  success: true,
  results: [
    { ID: "32601", MP10104A_B_P: 35.2, MP10128A_B_P: 28.7, ... }
  ]
};
```

#### Validation Functions
```typescript
// validateAnalysisQuality(): Checks score ranges, distributions, geographic consistency
// validateLegendAccuracy(): Verifies color mapping, value ranges, class counts
// getAllPredefinedQueries(): Extracts all queries from chat-constants
```

### Test Execution Strategy

#### Phase 1: Component Testing
Run individual pipeline component tests to ensure each step works correctly.

#### Phase 2: Predefined Query Testing  
Test all real-world queries from chat-constants to validate routing and processing.

#### Phase 3: End-to-End Integration
Test complete pipeline flows for different analysis types.

#### Phase 4: Performance & Error Handling
Validate performance benchmarks and error recovery mechanisms.

### Expected Test Results

#### Success Metrics
- **80%+ success rate** across all predefined queries
- **100% accuracy** for routing known query types
- **Zero field mapping errors** between processors and renderers
- **Perfect legend accuracy** for color and value mapping
- **Sub-second performance** for typical pipeline execution

#### Coverage Metrics
- **All 25 endpoints** represented in predefined queries
- **All major analysis types** tested (strategic, competitive, demographic, brand)
- **All geographic query types** tested (city, county, state comparisons)
- **All brand configurations** tested (Nike/Adidas, H&R Block/TurboTax)

## Conclusion

This comprehensive testing checklist ensures the query-to-visualization pipeline works correctly across all components, from semantic understanding through map rendering. The integration of predefined queries from `chat-constants.ts` provides real-world validation that covers all active endpoints with actual user queries.

**Key Benefits**:
- ✅ **Real-world validation** using actual production queries
- ✅ **Comprehensive coverage** of all 22+ analysis types  
- ✅ **Quality assurance** with analysis and legend validation
- ✅ **Performance benchmarks** for production readiness
- ✅ **Error handling** validation for robust user experience

**Priority Testing**: Focus on predefined query testing first (validates entire system), then drill down to component-specific issues. The pipeline is only as strong as its weakest link, so comprehensive validation with real queries is essential for production reliability.