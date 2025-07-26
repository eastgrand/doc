# Competitive Analysis: Query-to-Visualization Flow

## Overview

This document provides a detailed explanation of how competitive analysis queries flow from user input to final visualization, including the 1-10 scale competitive advantage scoring system and dual-variable visualization rendering.

## Table of Contents

1. [User Query Input](#user-query-input)
2. [Query Analysis & Endpoint Selection](#query-analysis--endpoint-selection)
3. [Data Loading from Cache](#data-loading-from-cache)
4. [Competitive Data Processing](#competitive-data-processing)
5. [Visualization Creation](#visualization-creation)
6. [Map Rendering](#map-rendering)
7. [Narrative Generation](#narrative-generation)
8. [Complete Flow Example](#complete-flow-example)

---

## User Query Input

### Step 1: Query Detection

**Location**: `components/geospatial-chat-interface.tsx` → `handleSubmit()`

**Process**:

1. User enters query (e.g., "Compare Nike vs Adidas market performance")
2. Query is analyzed for competitive keywords
3. System detects competitive analysis intent

**Keywords that trigger competitive analysis**:

- "compete", "competition", "competitive"
- "vs", "versus", "compare"
- "brand", "brands", "market share"
- "nike", "adidas", "jordan"
- "advantage", "positioning", "landscape"

**Code Flow**:

```typescript
const analysisOptions: AnalysisOptions = {
  sampleSize: sampleSizeValue || 5000,
  targetVariable: currentTarget,
  forceRefresh: false,
  endpoint: selectedEndpoint !== 'auto' ? selectedEndpoint : undefined
};

const analysisResult: AnalysisResult = await executeAnalysis(query, analysisOptions);
```

---

## Query Analysis & Endpoint Selection

### Step 2: Endpoint Routing

**Location**: `lib/analysis/CachedEndpointRouter.ts` → `selectEndpoint()`

**Process**:

1. Query is analyzed for competitive keywords
2. System selects `/competitive-analysis` endpoint
3. Endpoint selection is logged for debugging

**Code Flow**:

```typescript
async selectEndpoint(query: string, options?: AnalysisOptions): Promise<string> {
  // If endpoint is explicitly specified, use it
  if (options?.endpoint) {
    return options.endpoint;
  }

  // Use standard single endpoint suggestion
  const selectedEndpoint = this.suggestSingleEndpoint(query);
  return selectedEndpoint; // Returns '/competitive-analysis'
}
```

**Endpoint Selection Logic**:

- Competitive keywords → `/competitive-analysis`
- Spatial clustering keywords → `/spatial-clusters`
- Demographic keywords → `/demographic-insights`
- Default → `/analyze`

---

## Data Loading from Cache

### Step 3: Cached Data Retrieval

**Location**: `lib/analysis/CachedEndpointRouter.ts` → `callEndpoint()`

**Process**:

1. System loads cached data from `/public/data/endpoints/competitive-analysis.json`
2. Data contains 3,983 records with raw market share values
3. Each record contains brand-specific fields and demographic data

**Data Structure**:

```json
{
  "success": true,
  "results": [
    {
      "ID": 10001,
      "area_name": "Manhattan, NY",
      "value_MP30034A_B_P": 22.6,  // Nike market share (%)
      "value_MP30029A_B_P": 18.3,  // Adidas market share (%)
      "value_MP30032A_B_P": 12.1,  // Jordan market share (%)
      "value_TOTPOP_CY": 31940,     // Total population
      "value_WLTHINDXCY": 85,       // Wealth index
      "value_AVGHINC_CY": 75000,    // Average household income
      "value_MEDAGE_CY": 32,        // Median age
      "shap_MP30034A_B_P": 0.15,    // Nike SHAP importance
      "shap_MP30029A_B_P": 0.12     // Adidas SHAP importance
    }
  ],
  "feature_importance": [...]
}
```

**Code Flow**:

```typescript
async callEndpoint(endpoint: string, query: string, options?: AnalysisOptions): Promise<RawAnalysisResult> {
  // Load the cached dataset for this endpoint
  const cachedData = await this.loadCachedDataset(endpoint);
  
  // Process the cached data based on query and options
  const processedResult = this.processCachedData(cachedData, query, options);
  
  return processedResult;
}
```

---

## Competitive Data Processing

### Step 4: CompetitiveDataProcessor Application

**Location**: `lib/analysis/DataProcessor.ts` → `processResults()`

**Process**:

1. System selects `CompetitiveDataProcessor` for `/competitive-analysis` endpoint
2. Raw market share data is processed through competitive advantage formula
3. Scores are converted from 0-100 scale to 1-10 scale
4. Additional competitive metrics are calculated

**Processor Selection**:

```typescript
private getProcessorForEndpoint(endpoint: string): DataProcessorStrategy {
  // Try to get specific processor for endpoint
  if (this.processors.has(endpoint)) {
    return this.processors.get(endpoint)!; // Returns CompetitiveDataProcessor
  }
  
  // Fallback to default processor
  return this.processors.get('default')!;
}
```

### Step 5: Competitive Advantage Calculation

**Location**: `lib/analysis/strategies/processors/CompetitiveDataProcessor.ts` → `extractCompetitiveScore()`

**Formula Components**:

#### 1. Market Position Advantage (0-40 points)

```typescript
// Share advantage: Nike vs Adidas market share difference
const shareAdvantage = Math.max(-20, Math.min(20, nikeShare - adidasShare));

// SHAP advantage: Statistical importance difference
const shapDifference = nikeShap - adidasShap;
const normalizedShapDiff = shapDifference / (1 + Math.abs(shapDifference * 0.1));
const shapAdvantage = Math.max(-10, Math.min(10, normalizedShapDiff * 10));

// Market presence bonus
const marketPresence = Math.min(10, nikeShare * 0.25);

const positionAdvantage = 20 + shareAdvantage + shapAdvantage + marketPresence;
```

#### 2. Market Fit (0-35 points)

```typescript
// Income advantage: Nike's sweet spot ($35K-$150K)
let incomeAdvantage;
if (avgIncome < 35000) {
  incomeAdvantage = Math.max(0, (avgIncome - 25000) / 10000 * 3);
} else if (avgIncome <= 100000) {
  incomeAdvantage = 8 + ((avgIncome - 35000) / 65000 * 7);
} else if (avgIncome <= 150000) {
  incomeAdvantage = 15;
} else {
  incomeAdvantage = 15 - ((avgIncome - 150000) / 100000 * 5);
}

// Age advantage: Nike's core demographics (16-35 peak, 36-50 secondary)
let ageAdvantage;
if (medianAge >= 16 && medianAge <= 35) {
  ageAdvantage = 12 - Math.abs(medianAge - 25) * 0.1;
} else if (medianAge >= 36 && medianAge <= 50) {
  ageAdvantage = 8 - (medianAge - 36) * 0.2;
} else if (medianAge >= 13 && medianAge <= 15) {
  ageAdvantage = 6;
} else if (medianAge >= 51 && medianAge <= 65) {
  ageAdvantage = Math.max(2, 6 - (medianAge - 51) * 0.2);
} else {
  ageAdvantage = 1;
}

const scaleAdvantage = Math.min(8, (totalPop / 20000) * 8);
const marketFit = incomeAdvantage + ageAdvantage + scaleAdvantage;
```

#### 3. Competitive Environment (0-25 points)

```typescript
// Market fragmentation: Less saturated markets favor strong brands
const fragmentation = Math.min(10, (100 - nikeShare - adidasShare) * 0.1);

// Competitor weakness: Nike vs average competitor
const competitorWeakness = Math.min(8, Math.max(0, (nikeShare - totalCompetitors/4) * 0.2));

// Market structure: Income and age-based favorability
let marketStructure = 0;
if (avgIncome >= 35000 && avgIncome <= 150000) {
  marketStructure += 3; // Nike's income sweet spot
} else if (avgIncome > 150000) {
  marketStructure += 2; // Premium market
} else if (avgIncome >= 25000) {
  marketStructure += 1; // Some potential
}

if (medianAge >= 16 && medianAge <= 50) {
  marketStructure += 2; // Nike's core age range
} else if (medianAge >= 13 && medianAge <= 65) {
  marketStructure += 1; // Extended potential
}

const competitiveEnvironment = fragmentation + competitorWeakness + marketStructure;
```

#### 4. Final Score Calculation (1-10 scale)

```typescript
// FINAL COMPETITIVE ADVANTAGE SCORE (1-10 scale)
const competitiveAdvantage = Math.min(10, Math.max(1,
  (positionAdvantage + marketFit + competitiveEnvironment) / 10
));

return Math.max(1, Math.min(10, competitiveAdvantage));
```

### Step 6: Processed Data Structure

**Output Structure**:

```typescript
{
  type: 'competitive_analysis',
  records: [
    {
      area_id: "10001",
      area_name: "Manhattan, NY",
      value: 7.7, // 1-10 competitive advantage score
      properties: {
        competitive_advantage_score: 7.7,
        market_share: 0.226, // 0-1 range
        nike_market_share: 22.6, // Percentage
        adidas_market_share: 18.3, // Percentage
        jordan_market_share: 12.1, // Percentage
        competitive_position: "strong_advantage",
        brand_strength: 0,
        market_penetration: 0,
        brand_awareness: 0,
        price_competitiveness: 0
      }
    }
  ],
  summary: "Competitive analysis of 3,983 locations with 1-10 scale scoring",
  targetVariable: 'expansion_opportunity_score'
}
```

---

## Visualization Creation

### Step 7: VisualizationRenderer Selection

**Location**: `lib/analysis/VisualizationRenderer.ts` → `createVisualization()`

**Process**:

1. System selects `CompetitiveRenderer` for competitive analysis
2. Renderer creates dual-variable visualization (size + color)
3. Firefly effects and custom legend are applied

**Renderer Selection**:

```typescript
createVisualization(data: ProcessedAnalysisData, endpoint: string): VisualizationResult {
  // Select appropriate renderer based on endpoint
  const renderer = this.getRendererForEndpoint(endpoint);
  
  // Create visualization using selected renderer
  return renderer.createVisualization(data);
}
```

### Step 8: CompetitiveRenderer Processing

**Location**: `lib/analysis/strategies/renderers/CompetitiveRenderer.ts` → `createVisualization()`

**Process**:

1. Detects market share and competitive advantage data
2. Creates dual-variable renderer with size (market share) and color (competitive advantage)
3. Applies firefly effects for enhanced visualization
4. Generates custom dual-variable legend

**Dual-Variable Configuration**:

```typescript
const dualConfig = {
  sizeField: 'nike_market_share',     // Size based on Nike market share
  colorField: 'value',                // Color based on competitive advantage (1-10)
  sizeTitle: 'Nike Market Share (%) - Quintiles',
  colorTitle: 'Competitive Advantage (1-10 Scale) - Quintiles',
  isQuintileBased: true
};
```

**Firefly Effects**:

```typescript
// Apply firefly effects for enhanced visualization
const fireflyConfig = {
  enabled: true,
  intensity: 0.8,
  color: '#FFD700',
  pulseSpeed: 2,
  glowRadius: 3
};
```

---

## Map Rendering

### Step 9: Frontend Visualization Application

**Location**: `components/geospatial-chat-interface.tsx` → `applyAnalysisEngineVisualization()`

**Process**:

1. Frontend receives processed data and visualization configuration
2. ArcGIS FeatureLayer is created with dual-variable renderer
3. Firefly effects are applied via CSS
4. Custom legend is displayed

**FeatureLayer Creation**:

```typescript
const featureLayer = new FeatureLayer({
  source: features,
  renderer: visualization.renderer,
  popupTemplate: visualization.popupTemplate,
  title: 'Competitive Analysis'
});
```

**Firefly CSS Effects**:

```css
.firefly-point {
  filter: drop-shadow(0 0 8px var(--firefly-color));
  animation: fireflyPulse 2s ease-in-out infinite;
  mix-blend-mode: screen;
}

@keyframes fireflyPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}
```

### Step 10: Legend Generation

**Location**: `lib/analysis/strategies/renderers/CompetitiveRenderer.ts` → `createMarketShareBrandLegend()`

**Process**:

1. Creates quintile-based ranges for both variables
2. Generates size legend for Nike market share
3. Generates color legend for competitive advantage (1-10 scale)
4. Combines into dual-variable legend

**Legend Structure**:

```typescript
{
  title: 'Competitive Analysis (Quintiles)',
  type: 'dual-variable',
  components: [
    {
      title: 'Nike Market Share (%) - Quintiles',
      type: 'size',
      items: [
        { label: '≤ 15.2% (Quintile 1)', size: 'small', value: 15.2 },
        { label: '15.2% - 18.7% (Q2)', size: 'small-medium', value: 18.7 },
        { label: '18.7% - 22.1% (Q3)', size: 'medium', value: 22.1 },
        { label: '22.1% - 26.8% (Q4)', size: 'medium-large', value: 26.8 },
        { label: '> 26.8% (Quintile 5)', size: 'large', value: 26.8 }
      ]
    },
    {
      title: 'Competitive Advantage (1-10 Scale) - Quintiles',
      type: 'color',
      items: [
        { label: '≤ 4.0/10 (Quintile 1)', color: '#FF6B6B', value: 4.0 },
        { label: '4.0-5.2/10 (Q2)', color: '#FFB347', value: 5.2 },
        { label: '5.2-6.1/10 (Q3)', color: '#FFD700', value: 6.1 },
        { label: '6.1-7.3/10 (Q4)', color: '#90EE90', value: 7.3 },
        { label: '> 7.3/10 (Quintile 5)', color: '#00FF7F', value: 7.3 }
      ]
    }
  ]
}
```

---

## Narrative Generation

### Step 11: Claude API Integration

**Location**: `app/api/claude/generate-response/route.ts`

**Process**:

1. Processed data is sent to Claude API with competitive analysis context
2. System prompt includes 1-10 scale instructions
3. Claude generates narrative analysis with specific location examples
4. Analysis includes expansion opportunity insights

**System Prompt Context**:

```typescript
const competitiveAnalysisPrompt = `
Competitive Analysis: ⚠️ EXPANSION OPPORTUNITY ANALYSIS - NOT Current Nike Dominance ⚠️
* CRITICAL: Scores measure EXPANSION OPPORTUNITY, not existing Nike strength!
* HIGH scores (7.0+) = UNDERSERVED markets with growth potential
* LOW scores (1.0-3.0) = Markets where Nike already has high share OR poor demographics
* Organize by EXPANSION OPPORTUNITY: Premium Expansion Targets (8.0+), Strong Targets (6.0-8.0), Emerging Markets (4.0-6.0)
`;
```

**Narrative Structure**:

1. **Market Overview** - Total markets analyzed, overall competitive landscape
2. **Top Performers** (5-8 locations) - Highest scoring areas with competitive scores and market shares
3. **Emerging Markets** (3-5 locations) - Mid-tier performers with growth potential
4. **Growth Opportunities** (3-5 locations) - Underperforming areas with expansion potential
5. **Strategic Insights** - What drives performance differences, key success factors
6. **Actionable Recommendations** - Specific next steps for each tier

---

## Complete Flow Example

### Example Query: "Compare Nike vs Adidas market performance across major cities"

**Step-by-Step Flow**:

1. **Query Input**: User enters competitive analysis query
2. **Endpoint Selection**: System detects competitive keywords → selects `/competitive-analysis`
3. **Data Loading**: Loads cached data from `competitive-analysis.json` (3,983 records)
4. **Data Processing**:
   - Raw data: `value_MP30034A_B_P: 22.6` (Nike market share)
   - Processed: `competitive_advantage_score: 7.7` (1-10 scale)
5. **Visualization Creation**:
   - Size: Nike market share percentage
   - Color: Competitive advantage (1-10 scale)
   - Firefly effects applied
6. **Map Rendering**:
   - Dual-variable circles displayed on map
   - Custom legend shows both variables
7. **Narrative Generation**:
   - Claude generates analysis with 1-10 scale references
   - Includes specific location examples and expansion opportunities

**Final Output**:

- **Map**: Dual-variable visualization with firefly effects
- **Legend**: Custom dual-variable legend with 1-10 scale
- **Narrative**: Analysis text with 1-10 scale competitive advantage scores
- **Data**: Processed records with competitive advantage scores and market shares

---

## Key Technical Components

### Data Flow Summary

```
User Query → Endpoint Selection → Cached Data Load → CompetitiveDataProcessor → 
CompetitiveRenderer → Frontend Visualization → Claude Narrative → Complete Analysis
```

### Scale Conversion

- **Input**: Raw market share percentages (0-100%)
- **Processing**: Complex competitive advantage formula (0-100 points)
- **Output**: 1-10 scale competitive advantage scores
- **Visualization**: Dual-variable rendering with size and color

### Performance Optimizations

1. **Cached Data**: 3,983 pre-processed records for fast loading
2. **Processor Caching**: Specialized processors cached in memory
3. **Firefly Effects**: CSS-based animations for smooth performance
4. **Quintile Calculation**: Efficient data distribution for legend generation

### Error Handling

1. **Processor Fallback**: Default processor if competitive processor fails
2. **Data Validation**: Comprehensive validation of raw data structure
3. **Visualization Fallback**: Simple renderer if dual-variable rendering fails
4. **API Error Handling**: Graceful degradation if Claude API fails

---

## Troubleshooting

### Common Issues

1. **Scores Not Showing 1-10 Scale**: Check if `CompetitiveDataProcessor` is being called
2. **Legend Not Displaying**: Verify dual-variable legend configuration
3. **Firefly Effects Missing**: Check CSS imports and browser compatibility
4. **Narrative Scale Mismatch**: Ensure system prompt includes 1-10 scale instructions

### Debug Logging

Enable debug mode to see detailed flow:

```typescript
const analysisOptions: AnalysisOptions = {
  debugMode: true,
  endpoint: '/competitive-analysis'
};
```

### Verification Steps

1. Check browser console for processor selection logs
2. Verify processed data contains 1-10 scale values
3. Confirm visualization renderer is `CompetitiveRenderer`
4. Validate legend shows both size and color components
5. Ensure narrative references 1-10 scale thresholds

---

## Conclusion

The competitive analysis query-to-visualization flow is a sophisticated system that transforms raw market share data into meaningful competitive advantage insights. The 1-10 scale scoring system provides clear, actionable intelligence for market expansion decisions, while the dual-variable visualization offers rich, interactive exploration of competitive landscapes.

The system's modular architecture ensures maintainability and extensibility, while the cached data approach provides excellent performance for real-time analysis.
