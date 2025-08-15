# Query to Visualization Flow Documentation

## Overview

This document provides a comprehensive explanation of how a user query flows through the system from initial input to final visualization on the map. The system uses a sophisticated pipeline involving natural language processing, endpoint routing, data processing, and geographic visualization.

## Architecture Components

### Core Components:
1. **EnhancedQueryAnalyzer** - Natural language query understanding
2. **GeoAwarenessEngine** - Geographic entity recognition and filtering
3. **Endpoint Router** - Determines which analysis endpoint to call
4. **Data Processors** - Transform raw endpoint data for visualization
5. **ArcGIS Renderer** - Visualizes processed data on the map

## Complete Flow Diagram

```
User Query
    ↓
[EnhancedQueryAnalyzer]
    ├── Intent Detection
    ├── Brand Recognition
    └── Analysis Type Classification
    ↓
[GeoAwarenessEngine]
    ├── Geographic Entity Extraction
    ├── ZIP Code Mapping (Phase 1)
    └── Spatial Filtering
    ↓
[Endpoint Router]
    ├── Endpoint Selection
    └── Query Parameter Building
    ↓
[Microservice API Call]
    ├── /comparative-analysis
    ├── /strategic-analysis
    ├── /demographic-analysis
    └── /correlation-analysis
    ↓
[Data Processor Strategy]
    ├── Validation
    ├── Score Extraction
    ├── Field Mapping
    └── Geographic Integration
    ↓
[Processed Data]
    ├── Records with scores
    ├── Statistics
    └── Renderer configuration
    ↓
[ArcGIS Visualization]
    ├── Feature Layer
    ├── Choropleth Map
    └── Interactive Popups
```

## Detailed Step-by-Step Flow

### Step 1: Query Analysis

**Component**: `lib/analysis/EnhancedQueryAnalyzer.ts`

When a user enters a query like *"Compare Alachua County and Miami-Dade County"*, the analyzer:

```typescript
// 1. Detect query intent
const intent = this.detectIntent(query);
// Returns: 'comparative_analysis'

// 2. Identify brands (if mentioned)
const brands = this.identifyBrands(query);
// Returns: [] (no brands in this query)

// 3. Extract key terms
const keyTerms = this.extractKeyTerms(query);
// Returns: ['compare', 'alachua', 'county', 'miami-dade']

// 4. Determine analysis type
const analysisType = this.determineAnalysisType(intent, keyTerms);
// Returns: 'comparative'
```

### Step 2: Geographic Processing

**Component**: `lib/geo/GeoAwarenessEngine.ts`

The geo-awareness system processes geographic entities:

```typescript
// 1. Parse geographic query
const geoQuery = await this.parseGeographicQuery(query);
// Identifies: "Alachua County" and "Miami-Dade County"

// 2. Find matching entities in database
const entities = this.findDirectMatches(query);
// Returns: [
//   { name: 'Alachua County', type: 'county', zipCodes: [...] },
//   { name: 'Miami-Dade County', type: 'county', zipCodes: [...] }
// ]

// 3. Use Phase 1 multi-level ZIP mapping
const targetZipCodes = new Set();
for (const entity of entities) {
  if (entity.type === 'county') {
    // Get all ZIP codes for the county
    for (const [zip, county] of this.zipCodeToCounty) {
      if (county === entity.name.toLowerCase()) {
        targetZipCodes.add(zip);
      }
    }
  }
}
// Results in ZIP codes: ['32601', '32602', ...] for Alachua
//                       ['33101', '33102', ...] for Miami-Dade
```

### Step 3: Endpoint Routing

**Component**: Query routing logic

Based on the analysis type, the system selects the appropriate endpoint:

```typescript
const endpointConfig = {
  'comparative': {
    url: '/comparative-analysis',
    processor: ComparativeAnalysisProcessor
  },
  'strategic': {
    url: '/strategic-analysis', 
    processor: StrategicAnalysisProcessor
  },
  'demographic': {
    url: '/demographic-analysis',
    processor: DemographicDataProcessor
  }
};

// For our example: /comparative-analysis is selected
```

### Step 4: API Call to Microservice

**Request Structure**:
```json
{
  "query": "Compare Alachua County and Miami-Dade County",
  "filters": {
    "geographic": {
      "zipCodes": ["32601", "32602", "33101", "33102", ...],
      "entities": ["alachua county", "miami-dade county"]
    }
  },
  "analysisType": "comparative"
}
```

**Response Structure** (from endpoint):
```json
{
  "success": true,
  "results": [
    {
      "ID": "32601",
      "comparative_score": 75.5,
      "thematic_value": 75.5,
      "value_DESCRIPTION": "Gainesville",
      "mp30034a_b_p": 24.5,
      "value_TOTPOP_CY": 15420,
      "value_AVGHINC_CY": 52000
    },
    // ... more records
  ],
  "feature_importance": [...],
  "summary": "Analysis complete"
}
```

### Step 5: Data Processing

**Component**: `lib/analysis/strategies/processors/ComparativeAnalysisProcessor.ts`

The processor transforms raw endpoint data:

```typescript
process(rawData: RawAnalysisResult): ProcessedAnalysisData {
  // 1. Validate data with flexible field checking
  if (!this.validate(rawData)) {
    throw new Error('Invalid data format');
  }

  // 2. Process each record
  const processedRecords = rawData.results.map(record => {
    // Extract score with fallback hierarchy
    const comparativeScore = this.extractComparativeScore(record);
    // Tries: comparative_score → thematic_value → value → fallback
    
    // Generate area name with multiple sources
    const areaName = this.generateAreaName(record);
    // Tries: DESCRIPTION → value_DESCRIPTION → area_name → ID+city
    
    // Get city from ZIP code
    const city = this.extractCityFromRecord(record);
    // Uses GeoDataManager: "32601" → "Gainesville"
    
    return {
      area_id: record.ID || record.id,
      area_name: areaName,
      value: comparativeScore,
      comparison_score: comparativeScore, // CRITICAL: Field at top level
      rank: 0,
      properties: {
        ...record, // Include ALL original fields
        competitive_advantage_score: comparativeScore,
        city: city,
        // ... calculated metrics
      }
    };
  });

  // 3. Create renderer configuration
  const renderer = this.createComparativeRenderer(processedRecords);
  
  return {
    type: 'competitive_analysis',
    records: rankedRecords,
    targetVariable: 'comparison_score', // Must match field name
    renderer: renderer,
    legend: legend,
    statistics: statistics
  };
}
```

### Step 6: Renderer Configuration

**Generated Renderer Structure**:
```typescript
{
  type: 'class-breaks',
  field: 'comparison_score', // CRITICAL: Must match field in records
  classBreakInfos: [
    {
      minValue: 0,
      maxValue: 25,
      symbol: {
        type: 'simple-fill',
        color: [215, 48, 39, 0.6], // Red (low score)
        outline: { color: [0, 0, 0, 0], width: 0 }
      },
      label: '< 25'
    },
    // ... more quartile breaks
    {
      minValue: 75,
      maxValue: 100,
      symbol: {
        type: 'simple-fill',
        color: [26, 152, 80, 0.6], // Green (high score)
        outline: { color: [0, 0, 0, 0], width: 0 }
      },
      label: '> 75'
    }
  ]
}
```

### Step 7: ArcGIS Visualization

**Component**: Frontend map visualization

The processed data is rendered on the map:

```typescript
// 1. Create feature layer from processed records
const features = processedData.records.map(record => ({
  geometry: getGeometryForZipCode(record.area_id),
  attributes: {
    ...record,
    comparison_score: record.comparison_score // Field for renderer
  }
}));

// 2. Apply renderer to layer
featureLayer.renderer = processedData.renderer;

// 3. Add interactive popups
featureLayer.popupTemplate = {
  title: "{area_name}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        { fieldName: "comparison_score", label: "Score" },
        { fieldName: "city", label: "City" },
        { fieldName: "properties.mp30034a_b_p", label: "Nike Share %" }
      ]
    }
  ]
};

// 4. Add layer to map
map.add(featureLayer);
```

## Critical Field Mappings

### Endpoint Field Names → Processed Field Names

| Endpoint Field | Processed Field | Usage |
|---------------|-----------------|-------|
| `ID` or `id` or `area_id` | `area_id` | Geographic identifier |
| `value_DESCRIPTION` or `DESCRIPTION` | `area_name` | Display name |
| `comparative_score` or `thematic_value` | `comparison_score` | Primary score for visualization |
| `mp30034a_b_p` or `value_MP30034A_B_P` | `nike_market_share` | Nike market share percentage |
| `value_TOTPOP_CY` | `total_population` | Population data |
| `value_AVGHINC_CY` | `median_income` | Income data |

## Geographic Integration Points

### 1. ZIP Code to City Mapping
```typescript
// GeoDataManager provides ZIP → City mapping
database.zipCodeToCity.get("33101") // → "miami"
database.zipCodeToCounty.get("33101") // → "miami-dade county"
database.zipCodeToMetro.get("33101") // → "miami metro"
```

### 2. Multi-Level Geographic Filtering
```typescript
// Phase 1 implementation enables:
- City queries: "Miami" → Miami ZIP codes only
- County queries: "Miami-Dade County" → All county ZIP codes
- Metro queries: "Miami Metro" → Miami-Dade + Broward + Palm Beach ZIPs
- State queries: "Florida" → All Florida ZIP codes
```

### 3. Area Name Enhancement
```typescript
// Combines ID with geographic context
"33101" → "33101 (Miami)"
"32601" → "32601 (Gainesville)"
```

## Error Handling & Fallbacks

### Validation Fallbacks
1. **Missing ID**: Generate from index (`area_1`, `area_2`)
2. **Missing Score**: Try multiple field names, then use default (50)
3. **Missing Name**: Use ID with city context
4. **Missing City**: Return "Unknown"

### Processing Safeguards
```typescript
// Empty results are valid
if (rawData.results.length === 0) {
  return { records: [], statistics: defaultStats };
}

// Sample-based validation (check first 5 records)
const sampleSize = Math.min(5, rawData.results.length);
for (let i = 0; i < sampleSize; i++) {
  // Validate sample records
}
```

## Performance Optimizations

### 1. Geographic Filtering
- **Before Phase 1**: Process all 984 areas
- **After Phase 1**: Process only relevant ZIP codes
- **Impact**: 80-95% reduction in data processing

### 2. Lazy Loading
```typescript
// Geographic data loaded on first use
if (this.geographicHierarchy.size === 0) {
  this.initializeGeographicData();
}
```

### 3. Caching
- ZIP code mappings cached in memory
- Geographic entities cached after first lookup
- Renderer configurations reused when possible

## Common Issues & Solutions

### Issue 1: Field Name Mismatch
**Problem**: Renderer can't find field in data
**Solution**: Ensure `targetVariable` and `renderer.field` match the actual field name in records

### Issue 2: Missing Geographic Context
**Problem**: Area names show as "Unknown Area"
**Solution**: Implement `extractCityFromRecord` using GeoDataManager

### Issue 3: Score Extraction Fails
**Problem**: Expected score field not in endpoint response
**Solution**: Use fallback hierarchy (specific → thematic_value → value → any numeric)

### Issue 4: Validation Too Strict
**Problem**: Valid data rejected due to rigid field requirements
**Solution**: Implement flexible validation with multiple field name options

## Testing the Flow

### 1. Test Query Analysis
```bash
# Check if query intent is correctly identified
console.log(analyzer.analyzeQuery("Compare Miami and Tampa"))
# Should return: { intent: 'comparative_analysis', ... }
```

### 2. Test Geographic Processing
```bash
# Verify geographic entities are recognized
console.log(geoEngine.parseGeographicQuery("Alachua County"))
# Should return: { entities: [{ name: 'Alachua County', type: 'county', ... }] }
```

### 3. Test Data Processing
```bash
# Ensure processor handles endpoint data correctly
console.log(processor.validate(endpointResponse))
# Should return: true
```

### 4. Test Visualization
```bash
# Check browser console for renderer application
# Should see: "Applying renderer with field: comparison_score"
# Map should show colored polygons with legend
```

## Summary

The query-to-visualization flow involves:
1. **Natural language understanding** to determine intent
2. **Geographic awareness** to identify and filter locations
3. **Intelligent routing** to appropriate analysis endpoints
4. **Flexible data processing** with fallbacks and validation
5. **Field mapping** to ensure consistency
6. **Renderer generation** for visualization
7. **ArcGIS integration** for interactive maps

The system is designed to be robust, with multiple fallback mechanisms and flexible field handling to accommodate various data formats from different endpoints.