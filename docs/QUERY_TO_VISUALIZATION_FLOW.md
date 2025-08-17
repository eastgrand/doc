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

**For Brand Difference Analysis**:
```json
{
  "query": "TurboTax vs H&R Block market share difference",
  "filters": {
    "geographic": {
      "zipCodes": ["32601", "32602", "33101", "33102", ...],
      "entities": ["nationwide", "all markets"]
    }
  },
  "analysisType": "brand_difference",
  "extractedBrands": ["turbotax", "h&r block"]
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

**For Brand Difference Analysis Response**:
```json
{
  "success": true,
  "results": [
    {
      "ID": "32601",
      "DESCRIPTION": "Gainesville",
      "MP10104A_B_P": 35.2,  // TurboTax market share %
      "MP10128A_B_P": 28.7,  // H&R Block market share %
      "value_TOTPOP_CY": 15420,
      "value_AVGHINC_CY": 52000,
      "value_MILLENN_CY_P": 28.5,  // Millennial percentage
      "value_GENZ_CY_P": 18.2       // Gen Z percentage
    },
    // ... more records
  ],
  "feature_importance": [...],
  "summary": "Brand difference analysis complete"
}
```

**Note**: The raw response contains field codes. The BrandDifferenceProcessor transforms these into enriched data with calculated fields.

### Step 5: Data Processing

**Component**: `lib/analysis/strategies/processors/ComparativeAnalysisProcessor.ts` or `lib/analysis/strategies/processors/BrandDifferenceProcessor.ts`

The processor transforms raw endpoint data:

#### For Brand Difference Analysis

**Component**: `lib/analysis/strategies/processors/BrandDifferenceProcessor.ts`

The BrandDifferenceProcessor specializes in calculating market share differences between brands:

```typescript
// Brand field auto-detection from available data
const availableBrandFields = this.detectAvailableBrandFields(rawData);
// Returns: ['turbotax', 'h&r block'] based on MP10104A_B_P and MP10128A_B_P fields

// Extract brands from query context or use detected brands
let brand1 = extractedBrands[0]?.toLowerCase() || availableBrandFields[0] || 'turbotax';
let brand2 = extractedBrands[1]?.toLowerCase() || availableBrandFields[1] || 'h&r block';

// Calculate brand difference: brand1_share - brand2_share
const brand1Share = record[brand1FieldCode] || 0; // e.g., MP10104A_B_P: 35.2%
const brand2Share = record[brand2FieldCode] || 0; // e.g., MP10128A_B_P: 28.7%
const difference = brand1Share - brand2Share;     // Result: 6.5% (TurboTax advantage)
```

**Brand Field Mappings**:
- TurboTax: `MP10104A_B_P`
- H&R Block: `MP10128A_B_P`
- Athletic brands: `MP30034A_B_P` (Nike), `MP30029A_B_P` (Adidas), etc.

#### For Comparative Analysis

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

### Step 5.5: Dynamic Brand Naming Process

**Component**: `lib/analysis/utils/BrandNameResolver.ts`

For brand-related analysis endpoints (like comparative analysis), the system now dynamically extracts actual brand names instead of using generic "Brand A/B" terminology:

```typescript
// 1. Initialize BrandNameResolver with field aliases
const processor = new ComparativeAnalysisProcessor(fieldAliases);
// fieldAliases = {
//   'mp30034a_b_p': 'Nike Market Share (%)',
//   'brand_satisfaction': 'Acme Corporation Satisfaction Score',
//   'competitor_share': 'GlobalTech Market Penetration'
// }

// 2. Extract brand metrics with dynamic naming
const brandAMetric = this.extractBrandMetric(record, 'brand_a');
const brandBMetric = this.extractBrandMetric(record, 'brand_b');

// Returns BrandMetric objects like:
// {
//   value: 25.5,
//   fieldName: 'mp30034a_b_p', 
//   brandName: 'Nike'  // Extracted from "Nike Market Share (%)"
// }
```

#### Brand Name Extraction Strategies

The `BrandNameResolver` uses multiple strategies to extract brand names:

```typescript
// Strategy 1: Field Alias Parsing
'Nike Market Share (%)' → 'Nike'
'Brand Affinity - Acme' → 'Acme'  
'Market Share: GlobalTech' → 'GlobalTech'
'Starbucks Customer Loyalty Index' → 'Starbucks'

// Strategy 2: Dynamic Brand Detection from Project Data
// Scans all field aliases to identify brand-like words
const brands = this.getKnownBrandNames(); // Extracts from current project only
// Returns: ['Nike', 'Acme', 'GlobalTech', 'Starbucks'] // Project-specific

// Strategy 3: Legacy Pattern Fallback (only when no field aliases)
'mp30034a_b_p' → 'Legacy_Brand_A'
'mp30029a_b_p' → 'Legacy_Brand_B'

// Strategy 4: Ultimate Fallback
'unknown_field' → 'Brand A' / 'Brand B'
```

#### Brand Name Heuristics

The system identifies brand names using intelligent filtering:

```typescript
private looksLikeBrandName(word: string): boolean {
  // Must be capitalized (proper noun)
  if (!/^[A-Z]/.test(word)) return false;
  
  // Skip common market research terms
  const commonTerms = [
    'Market', 'Share', 'Brand', 'Purchase', 'Loyalty', 'Affinity',
    'Overall', 'Satisfaction', 'Performance', 'Strategic', 'Analysis'
  ];
  
  return !commonTerms.includes(word);
}

// Examples:
'Nike' → ✅ Brand name
'Acme' → ✅ Brand name  
'GlobalTech' → ✅ Brand name
'Market' → ❌ Common term
'Overall' → ❌ Common term
'Performance' → ❌ Common term
```

#### Analysis Output Transformation

The processor uses extracted brand names throughout the analysis:

```typescript
// Before (Generic):
let summary = `
• Brand Performance Gap (35% weight): Brand A vs competitors performance differential
• Market dominance: 15 Brand A-dominant markets (18.3%), 42 balanced markets (51.2%)
• Brand A holds average 7.3% market share advantage across analyzed markets
`;

// After (Project-Specific):
let summary = `  
• Brand Performance Gap (35% weight): Nike vs competitors performance differential
• Market dominance: 15 Nike-dominant markets (18.3%), 42 balanced markets (51.2%) 
• Nike holds average 7.3% market share advantage across analyzed markets
`;

// Or for a different project:
let summary = `
• Brand Performance Gap (35% weight): Acme vs competitors performance differential  
• Market dominance: 15 Acme-dominant markets (18.3%), 42 balanced markets (51.2%)
• Acme holds average 7.3% market share advantage across analyzed markets
`;
```

#### Field Aliases Integration

The system integrates with project-specific field-aliases configuration:

```typescript
// Example field-aliases for different projects:

// Athletic Footwear Project:
{
  'mp30034a_b_p': 'Nike Market Share (%)',
  'mp30029a_b_p': 'Adidas Market Share (%)', 
  'mp30032a_b_p': 'Jordan Brand Loyalty Score'
}

// Technology Project:
{
  'tech_share_001': 'Apple Market Penetration',
  'competitor_metric': 'Samsung Brand Preference Score',
  'brand_loyalty_x': 'Google Customer Satisfaction Index'  
}

// Retail Project:
{
  'retail_a': 'Walmart Store Performance',
  'retail_b': 'Target Brand Affinity Score',
  'satisfaction': 'Amazon Customer Experience Rating'
}
```

#### Project-Agnostic Design

Key benefits of this approach:

1. **No Hardcoded Brands**: System works with any industry/project
2. **Dynamic Adaptation**: Automatically uses brands from current project's data
3. **Graceful Fallbacks**: Still works when field-aliases unavailable  
4. **Maintained Compatibility**: Legacy data still processes correctly
5. **Professional Output**: Stakeholder-ready analysis with real brand names

```typescript
// Same processor code works for any project:

// Healthcare Project → "Johnson & Johnson vs competitors"
// Automotive Project → "Toyota vs competitors"  
// Food & Beverage Project → "Coca-Cola vs competitors"
// Technology Project → "Apple vs competitors"

// All without changing a single line of processor code!
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
| `mp30034a_b_p` or `value_MP30034A_B_P` | `brand_a_share` | First brand market share percentage |
| `mp30029a_b_p` or `value_MP30029A_B_P` | `brand_b_share` | Second brand market share percentage |
| `value_TOTPOP_CY` | `total_population` | Population data |
| `value_AVGHINC_CY` | `median_income` | Income data |

### Brand Difference Processor Field Mappings

| Endpoint Field | Brand | Processed Field | Usage |
|---------------|-------|-----------------|-------|
| `MP10104A_B_P` | TurboTax | `turbotax_market_share` | TurboTax market share percentage |
| `MP10128A_B_P` | H&R Block | `h&r block_market_share` | H&R Block market share percentage |
| `MP30034A_B_P` | Nike | `nike_market_share` | Nike market share percentage (Note: Athletic brands use MP300XX codes) |
| `MP30029A_B_P` | Adidas | `adidas_market_share` | Adidas market share percentage |
| `calculated` | N/A | `brand_difference_score` | Primary difference value (brand1 - brand2) |
| `calculated` | N/A | `difference_category` | Categorized advantage level |

**Important Note**: Tax service brands (H&R Block, TurboTax) use `MP101XX` field codes, while athletic brands use `MP300XX` field codes. The EnhancedQueryAnalyzer must map these correctly for proper brand detection and routing to `/brand-difference` endpoint.

### Dynamic Brand Name Fields (New)

| Processed Field | Source | Usage |
|---------------|---------|-------|
| `brand_a_name` | Extracted from field-aliases via `BrandNameResolver` | Actual name of first brand (e.g., "Nike", "Acme") |
| `brand_b_name` | Extracted from field-aliases via `BrandNameResolver` | Actual name of second brand (e.g., "Adidas", "GlobalTech") |
| `brand_dominance` | Calculated: `brand_a_share - brand_b_share` | Brand performance differential |

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

### Issue 5: Brand Difference Analysis Not Working
**Problem**: Brand difference queries not producing enriched data with `brand_difference_score`
**Root Cause**: EnhancedQueryAnalyzer field mappings incorrect for tax service brands
**Solution**: 
1. Ensure EnhancedQueryAnalyzer maps correct field codes:
   - H&R Block: `MP10128A_B_P` (NOT `MP30034A_B_P`)
   - TurboTax: `MP10104A_B_P` (NOT `MP30029A_B_P`)
2. Verify brand detection in `identifyBrands()` method
3. Confirm routing to `/brand-difference` endpoint
4. Check BrandDifferenceProcessor enriches data with:
   - `brand_difference_score`
   - `[brand]_market_share` fields
   - `difference_category`
   - Demographic context

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

### 5. Test Dynamic Brand Naming
```bash
# Test brand name extraction from field aliases
const resolver = new BrandNameResolver({
  'mp30034a_b_p': 'Nike Market Share (%)',
  'brand_satisfaction': 'Acme Corporation Satisfaction'
});

console.log(resolver.extractBrandName('mp30034a_b_p')); 
// Should return: "Nike"

console.log(resolver.extractBrandName('brand_satisfaction'));
// Should return: "Acme"

# Test processor integration
const processor = new ComparativeAnalysisProcessor(fieldAliases);
const result = processor.process(mockData);

console.log(result.records[0].properties.brand_a_name);
// Should return actual brand name, not "Brand A"

console.log(result.summary);
// Should contain actual brand names like "Nike vs competitors" 
# not "Brand A vs competitors"
```

### 6. Test Brand Difference Analysis
```bash
# Test EnhancedQueryAnalyzer brand detection
const analyzer = new EnhancedQueryAnalyzer();
const query = "Compare H&R Block vs TurboTax market share";

console.log(analyzer.identifyBrands(query));
// Should return: ['hrblock', 'turbotax']

console.log(analyzer.getBestEndpoint(query));
// Should return: '/brand-difference'

# Test BrandDifferenceProcessor with TurboTax vs H&R Block
const brandProcessor = new BrandDifferenceProcessor();
const mockBrandData = {
  success: true,
  results: [
    {
      ID: "32601",
      DESCRIPTION: "Gainesville",
      MP10104A_B_P: 35.2,  // TurboTax share (correct field code)
      MP10128A_B_P: 28.7   // H&R Block share (correct field code)
    }
  ]
};

const result = brandProcessor.process(mockBrandData, {
  extractedBrands: ['turbotax', 'h&r block']
});

console.log(result.records[0].properties.brand_difference_score);
// Should return: 6.5 (35.2 - 28.7)

console.log(result.records[0].properties['turbotax_market_share']);
// Should return: 35.2

console.log(result.records[0].properties['h&r block_market_share']);
// Should return: 28.7

console.log(result.records[0].category);
// Should return: "brand1_leading" (TurboTax leading)

console.log(result.renderer.field);
// Should return: "brand_difference_score"

# Test auto-detection when no brands specified
const autoResult = brandProcessor.process(mockBrandData);
console.log(autoResult.brandAnalysis.brandComparison);
// Should return: { brand1: 'turbotax', brand2: 'h&r block' }
```

## Recent Enhancements (2025)

### Progressive Analysis Chat System

**Components**: `components/ChatInterface.tsx`, `components/unified-analysis/UnifiedAnalysisChat.tsx`

The system now features a sophisticated chat interface that provides progressive analysis with immediate feedback:

#### Progressive Statistics Display
```typescript
// Phase 1: Initial analysis message (0.5s)
let messageContent = `${getIconString('analyzing')} Analyzing ${analysisData.length} areas...`;

// Phase 2: Quick Statistics (1s)
const basicStats = calculateBasicStats(analysisData);
messageContent += '\n\n' + formatStatsForChat(basicStats, analysisType);

// Phase 3: Distribution Analysis (2s) 
const distribution = calculateDistribution(analysisData);
messageContent += '\n\n' + formatDistributionForChat(distribution);

// Phase 4: Key Patterns (3s)
const patterns = detectPatterns(analysisData);
messageContent += '\n\n' + formatPatternsForChat(patterns);

// Phase 5: Full AI Analysis (5-10s)
const aiResponse = await sendChatMessage(context, query);
```

#### Statistics with Info Tooltips

**Component**: `components/stats/StatsWithInfo.tsx`

Statistics now include interactive info icons with explanations:

```typescript
// Enhanced stats display with tooltips
const statDefinitions = {
  'Average difference': {
    description: 'The mean difference in market share between brands',
    formula: 'Σ(brand1_share - brand2_share) / n',
    example: '-8.37% means competitor has 8.37% higher average market share'
  },
  'Standard deviation': {
    description: 'Measures spread of values from the mean',
    formula: '√(Σ(x - μ)² / n)',
    example: '1.31% means most values are within ±1.31% of average'
  }
  // ... more definitions
};
```

#### Interactive Message Features

**Copy Functionality**:
- **Top copy button**: Appears on hover in top-right of message
- **Bottom copy button**: Appears on hover in bottom-right of message
- **Visual feedback**: Shows checkmark when copied, reverts after 2 seconds

**Export Conversation**:
```typescript
const handleExportConversation = useCallback(() => {
  const conversationText = messages.map(message => {
    const timestamp = message.timestamp.toLocaleString();
    const role = message.role === 'user' ? 'User' : 'AI Assistant';
    return `## ${role} (${timestamp})\n\n${message.content}\n\n---\n`;
  }).join('\n');

  const fullExport = `# Analysis Conversation Export
Generated on: ${new Date().toLocaleString()}
Analysis Type: ${analysisType}
Total Messages: ${messages.length}

---

${conversationText}

*Exported from MPIQ AI Chat Interface*`;

  // Download as markdown file
  const blob = new Blob([fullExport], { type: 'text/markdown' });
  // ... download logic
}, [messages, analysisResult]);
```

### Modern Icon System

**Component**: `lib/utils/iconMapping.tsx`

Replaced dated emojis with configurable icon system:

#### Icon Configuration Options
```typescript
export type IconType = 'emoji' | 'lucide' | 'modern-emoji';

const iconMappings = {
  analyzing: {
    emoji: '📊',        // Classic
    modernEmoji: '📈',  // Modern
    lucideIcon: BarChart3, // Professional
    ariaLabel: 'Analyzing data'
  },
  statistics: {
    emoji: '📊',
    modernEmoji: '📈', 
    lucideIcon: BarChart3,
    ariaLabel: 'Statistics'
  },
  patterns: {
    emoji: '🎯',
    modernEmoji: '🔍',
    lucideIcon: Target,
    ariaLabel: 'Key patterns'
  }
  // ... more mappings
};

// Easy configuration
export const currentIconType: IconType = 'modern-emoji';
```

#### Icon Usage
```typescript
// In stats calculator
lines.push(`${getIconString('statistics')} **Quick Statistics**`);
lines.push(`${getIconString('distribution')} **Distribution Analysis**`);
lines.push(`${getIconString('patterns')} **Key Patterns**`);

// In chat interfaces
let messageContent = `${getIconString('analyzing')} Analyzing ${analysisData.length} areas...`;
```

#### Settings Component
**Component**: `components/settings/IconStyleSelector.tsx`

Provides UI for users to change icon preferences:
- **Classic Emojis**: Original style (📊📈🎯)
- **Modern Emojis**: Updated selection (📈📊🔍)
- **Lucide Icons**: Professional icon set (matching UI)

### Enhanced User Experience

#### Visual Improvements
- **Grey project area button** in light mode (instead of green)
- **Subtle green glow effects** (reduced intensity by 60-70%)
- **Consistent button styling** across components
- **Professional color palette** for better business appeal

#### Performance Optimizations
- **Removed duplicate badges** (model attribution info now only in message content)
- **Streamlined stats display** with enhanced readability
- **Efficient icon rendering** with configurable system
- **Optimized chat message rendering** for large conversations

#### Accessibility Features
- **ARIA labels** for all icons and interactive elements
- **Keyboard navigation** support for copy buttons
- **High contrast** color schemes for better readability
- **Screen reader friendly** stat explanations

## Summary

The query-to-visualization flow involves:
1. **Natural language understanding** to determine intent
2. **Geographic awareness** to identify and filter locations
3. **Intelligent routing** to appropriate analysis endpoints
4. **Flexible data processing** with fallbacks and validation
5. **Dynamic brand naming** from project-specific field-aliases
6. **Brand difference calculation** for competitive analysis
7. **Field mapping** to ensure consistency
8. **Renderer generation** for visualization
9. **ArcGIS integration** for interactive maps
10. **Progressive chat analysis** with real-time statistics *(New)*
11. **Interactive tooltips and explanations** *(New)*
12. **Conversation export and management** *(New)*
13. **Modern configurable icon system** *(New)*

The system is designed to be robust, with multiple fallback mechanisms and flexible field handling to accommodate various data formats from different endpoints. The new progressive chat system provides immediate feedback while full analysis processes, making the experience more responsive and informative.

**Recent Chat System Features**:
- **Progressive statistics display** with 5-phase loading
- **Interactive info tooltips** explaining statistical concepts and formulas
- **Dual copy buttons** (top and bottom of messages) for easy content copying
- **Conversation export** functionality generating markdown files
- **Modern icon system** with 3 style options (classic, modern, professional)
- **Enhanced UX** with improved visual design and accessibility

**Brand Difference Analysis Features**:
- **Auto-detection** of available brand fields in data (MP10104A_B_P, MP10128A_B_P, etc.)
- **Flexible brand mapping** supporting TurboTax/H&R Block and athletic brands
- **Percentage difference calculation** (Brand1% - Brand2%) with proper categorization
- **Diverging color visualization** (red for Brand2 advantage, green for Brand1 advantage)
- **Contextual analysis** including market dominance patterns and competitive balance
- **Professional reporting** with brand-specific insights and strategic recommendations