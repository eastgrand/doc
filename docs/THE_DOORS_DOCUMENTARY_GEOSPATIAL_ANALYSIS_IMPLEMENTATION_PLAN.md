
# The Doors Documentary Geospatial Analysis - Implementation Plan

> **Project Type**: Entertainment & Cultural Analysis  
> **Analysis Framework**: Hexagonal Grid (2-Mile Radius)  
> **Target Audience**: Classic Rock Demographics (Age 45-70)  
> **Implementation Status**: Planning Phase  

---

## 📋 Table of Contents

- [1. Executive Summary](#1-executive-summary)
- [2. Technical Architecture Integration](#2-technical-architecture-integration)
- [3. Data Requirements & Field Mapping](#3-data-requirements--field-mapping)
- [4. Composite Scoring Algorithm Design](#4-composite-scoring-algorithm-design)
- [5. Geographic Framework Implementation](#5-geographic-framework-implementation)
- [6. Analysis Engine Configuration](#6-analysis-engine-configuration)
- [7. Visualization & UI Components](#7-visualization--ui-components)
- [8. Implementation Timeline](#8-implementation-timeline)
- [9. Technical Specifications](#9-technical-specifications)
- [10. Success Metrics & Validation](#10-success-metrics--validation)

---

## 1. Executive Summary

### 1.1 Project Overview

The Doors Documentary Geospatial Analysis leverages the existing MPIQ AI Chat platform to create a specialized entertainment industry analysis tool. This implementation will identify optimal locations for presenting The Doors music documentary using advanced geospatial analytics, demographic profiling, and cultural engagement metrics.

### 1.2 Core Innovation

**H3 Resolution 6 Hexagonal Grid Analysis**: Unlike traditional ZIP code or census tract analysis, this project employs H3 Resolution 6 hexagonal geographic units (approximately 2-mile radius) that better capture realistic market catchment areas for entertainment venues. This standardized hexagonal grid system ensures consistent geographic analysis units and enables efficient spatial operations.

### 1.3 Integration with Existing Platform

This project extends the current MPIQ architecture by:
- Adding a new **Entertainment** project type configuration
- Implementing specialized scoring algorithms for cultural engagement
- Creating custom visualizations for entertainment venue analysis
- Integrating music industry data sources with existing demographic data
- **Implementing Federated Layer Architecture**: Combining multiple state-specific ArcGIS Feature Services into unified layers for seamless multi-state analysis

---

## 2. Technical Architecture Integration

### 2.1 BaseProcessor Architecture Extension

**File**: `/lib/analysis/strategies/processors/EntertainmentAnalysisProcessor.ts`

```typescript
export class EntertainmentAnalysisProcessor extends BaseProcessor {
  protected configManager: AnalysisConfigurationManager;
  
  async process(rawData: RawAnalysisResult): Promise<ProcessedAnalysisData> {
    // Leverage existing configuration-driven architecture
    const config = this.configManager.getProjectConfig('entertainment');
    
    // Apply entertainment-specific field mappings
    const musicAffinityScore = await this.calculateMusicAffinityScore(rawData);
    const culturalEngagementScore = await this.calculateCulturalEngagementScore(rawData);
    const spendingCapacityScore = await this.calculateSpendingCapacityScore(rawData);
    const marketAccessibilityScore = await this.calculateMarketAccessibilityScore(rawData);
    
    return this.generateCompositeScore({
      musicAffinity: musicAffinityScore,
      culturalEngagement: culturalEngagementScore,
      spendingCapacity: spendingCapacityScore,
      marketAccessibility: marketAccessibilityScore
    });
  }
}
```

### 2.2 Configuration-Driven Project Type

**File**: `/scripts/automation/project_types/entertainment.json`

```json
{
  "project_type": "entertainment",
  "analysis_focus": "cultural_engagement_and_music_preferences",
  "geographic_unit": "hexagonal_2mile_radius",
  "target_demographics": {
    "primary_age_range": [45, 70],
    "cultural_interests": ["classic_rock", "documentaries", "live_music"],
    "spending_patterns": ["premium_entertainment", "cultural_events"]
  },
  "scoring_weights": {
    "music_affinity": 0.40,
    "cultural_engagement": 0.25,
    "spending_capacity": 0.20,
    "market_accessibility": 0.15
  },
  "field_mappings": {
    "classic_rock_preference": {
      "semantic_name": "music_genre_preference_rock",
      "data_sources": ["nielsen_audio", "spotify_analytics", "music_streaming_data"],
      "normalization": "percentile_rank"
    },
    "documentary_consumption": {
      "semantic_name": "documentary_viewing_frequency",
      "data_sources": ["netflix_analytics", "hulu_data", "theater_attendance"],
      "normalization": "z_score"
    }
  }
}
```

### 2.3 Semantic Field Resolution Integration

The existing semantic field resolver will be extended to handle entertainment-specific data:

**File**: `/scripts/automation/semantic_field_resolver.py`

```python
class EntertainmentFieldResolver(SemanticFieldResolver):
    def __init__(self):
        super().__init__()
        self.entertainment_mappings = {
            'music_listening_habits_by_genre': ['classic_rock_preference', 'rock_listening_frequency'],
            'concert_attendance_by_genre': ['live_music_attendance', 'concert_frequency'],
            'documentary_movie_rentals': ['documentary_consumption', 'educational_content_preference'],
            'entertainment_spending_patterns': ['discretionary_entertainment_spend', 'cultural_event_spending']
        }
    
    def resolve_entertainment_field(self, semantic_name: str, data_context: dict) -> str:
        """Resolve entertainment-specific field mappings"""
        if semantic_name in self.entertainment_mappings:
            return self.apply_contextual_mapping(semantic_name, data_context)
        return super().resolve_field(semantic_name, data_context)
```

---

## 3. Data Requirements & Field Mapping

### 3.1 Available Data Sources (Pre-Aggregated)

#### 3.1.1 Core Consumer Behavior Metrics
| Data Category | Available Fields | Field Mapping | Priority |
|---------------|-----------------|---------------|----------|
| **Music Listening by Genre** | Pre-aggregated genre preferences | `music_listening_habits_by_genre.classic_rock` | High |
| **Music Listening by Source** | Platform usage patterns | `music_listening_habits_by_source` (Apple Music, Spotify, Amazon Music, etc.) | High |
| **Concert Attendance by Genre** | Live music engagement | `concert_attendance_by_genre.classic_rock` | High |
| **Documentary Consumption** | Recent viewing behavior | `documentary_movies_rented_purchased_30days` | High |
| **Radio Listening by Format** | Format-specific listening data | `radio_listening_by_format.classic_rock_format` | High |
| **Physical Music Spending** | Music purchase behavior | `physical_music_spending` | Medium |
| **Digital Music Engagement** | Downloads and streaming purchases | `digital_music_downloads`, `streaming_service_music_purchases` | Medium |

#### 3.1.2 Cultural Engagement Metrics
| Data Category | Available Fields | Field Mapping | Priority |
|---------------|-----------------|---------------|----------|
| **Biography Genre Movies** | Theater attendance data | `biography_genre_theater_attendance_6months` | High |
| **TV Entertainment Specials** | Viewership patterns | `tv_entertainment_specials_viewership` | High |
| **Theater/Opera/Concert Spending** | Cultural event expenditure | `theater_opera_concert_ticket_spending` | High |
| **Entertainment Research** | Online information seeking | `internet_entertainment_research_30days` | Medium |
| **Social Media Music Engagement** | Artist following behavior | `social_media_music_artist_following` | Medium |
| **Music CD Purchases** | Physical media buying | `music_cd_purchases` | Low |

#### 3.1.3 Demographics & Infrastructure (Available)
| Data Category | Available Fields | Field Mapping | Priority |
|---------------|-----------------|---------------|----------|
| **Target Age Demographics** | Age cohort concentration | `age_demographics.age_45_54`, `age_55_64`, `age_65_74` | High |
| **Tapestry Demographic Modes** | Target segments (see section 3.3) | `tapestry_demographic_modes` | High |
| **Entertainment Spending Patterns** | Budget allocation data | `entertainment_spending_patterns` | High |

### 3.3 Target ESRI Tapestry Segments for Doors Documentary Analysis (2025)

**5 Actual 2025 ESRI Tapestry Segments for Midwest Classic Rock Demographics (Age 45-70)**

| Segment Code | Segment Name | LifeMode Group | Target Age | Relevance for Doors Documentary |
|--------------|--------------|----------------|------------|--------------------------------|
| **K1** | **Established Suburbanites** | Group K: Suburban Shine | 45+ | Middle-tier income, suburban Midwest, manufacturing/healthcare workers |
| **K2** | **Mature Suburban Families** | Group K: Suburban Shine | 45+ | Single-family homes built before 2000, commute by car, established neighborhoods |
| **I1** | **Rural Established** | Group I: Countryscapes | 55+ | Rural/small towns, manufacturing/agriculture, long commutes, seasonal housing |
| **J1** | **Active Seniors** | Group J: Mature Reflections | 55+ | Single-family homes, social security/retirement income, mature lifestyle |
| **L1** | **Savvy Suburbanites** | Group L: Premier Estates | 45-64 | High income, work from home/management, newly constructed homes, advanced education |

**2025 Tapestry System Overview:**
- **Real ESRI segment codes** from June 2025 system overhaul (first update in 10 years)
- **Alpha-numeric format**: Groups A-L with numbered segments (e.g., K1, I1, J1, L1)
- **60 distinct segments** across 13 LifeMode groups
- **Verified segments**: L1 "Savvy Suburbanites" confirmed as persistent from prior system

**Weighting Strategy:**
- Initial equal weighting (1.0) for all 5 segments
- SHAP analysis will determine data-driven weights after feature service integration
- Field names will be verified when ArcGIS Feature Service URLs are provided

#### 3.3.4 Required Fields for Feature Services

**A. Tapestry Segment Population Fields (Required for Scoring)**
These fields are needed in the feature services to calculate the weighted Tapestry alignment score:

```typescript
// Feature Service Fields - 5 Actual 2025 ESRI Tapestry Segments
interface RequiredTapestryFields {
  // All 5 segments have equal initial weighting (1.0)
  // SHAP analysis will determine data-driven weights
  TAPESTRY_K1_PCT: number; // Established Suburbanites percentage
  TAPESTRY_K2_PCT: number; // Mature Suburban Families percentage  
  TAPESTRY_I1_PCT: number; // Rural Established percentage
  TAPESTRY_J1_PCT: number; // Active Seniors percentage
  TAPESTRY_L1_PCT: number; // Savvy Suburbanites percentage
  
  // Calculated Composite Field (derived from above using SHAP weights)
  TAPESTRY_COMPOSITE_WEIGHT: number; // Population-weighted composite score (0-100)
}
```

**B. Separated Data Interfaces**

```typescript
// Pure Tapestry Segment Reference (configuration only, not in feature service)
interface TapestrySegmentConfig {
  segment_code: string; // "K1", "K2", "I1", "J1", "L1"
  segment_name: string; // "Established Suburbanites", "Mature Suburban Families", etc.
  lifemode_group: string; // "Suburban Shine", "Countryscapes", "Mature Reflections", "Premier Estates"
  target_age: string; // "45+", "55+", "45-64"
  doors_relevance_weight: number; // Initial 1.0 for all, SHAP will determine actual weights
  geographic_focus: string; // "suburban Midwest", "rural/small towns", "high income suburban", etc.
  system_version: string; // "2025 ESRI Tapestry (June 2025 release)"
}

// Entertainment Behavior Data (separate from Tapestry, already in feature services)
interface EntertainmentBehaviorFields {
  classic_rock_listening_hours: number;
  concert_attendance_frequency: number;
  documentary_consumption_rate: number;
  entertainment_spending_annual: number;
  // ... other entertainment fields already discussed
}

// H3 Hexagon with all data combined
interface H3HexagonWithAnalysisData {
  // Geographic
  h3_index: string;
  geometry: Polygon;
  
  // Tapestry percentages (from feature service)
  tapestry: RequiredTapestryFields;
  
  // Entertainment behavior (from feature service)
  entertainment: EntertainmentBehaviorFields;
  
  // Analysis results (calculated)
  scores: {
    music_affinity_score: number;
    cultural_engagement_score: number;
    spending_capacity_score: number;
    market_accessibility_score: number;
    composite_doors_score: number;
  };
}
```
| **Theater Infrastructure** | Theater locations and capacity | `theater_locations.theater_density_2mile_radius` | High |
| **Radio Station Coverage** | Market share data (Nielsen Audio, RAB, FCC) | `radio_station_coverage.classic_rock_format_market_share` | Medium |

### 3.2 Field Integration with Existing MPIQ Data

#### 3.2.1 Leveraging Existing Demographics
```typescript
// Existing MPIQ fields that support entertainment analysis
const existingFields = {
  age_demographics: 'AGE_45_54', 'AGE_55_64', 'AGE_65_74',
  income_levels: 'MEDIAN_HOUSEHOLD_INCOME', 'DISPOSABLE_INCOME',
  education: 'BACHELOR_DEGREE_PLUS', 'GRADUATE_DEGREE',
  lifestyle_segments: 'TAPESTRY_SEGMENT_CODE'
};

// New entertainment-specific fields to add
const newFields = {
  music_behavior: [
    'CLASSIC_ROCK_LISTENING_HOURS',
    'CONCERT_ATTENDANCE_ANNUAL',
    'MUSIC_STREAMING_SUBSCRIPTIONS',
    'VINYL_RECORD_PURCHASES'
  ],
  cultural_engagement: [
    'DOCUMENTARY_VIEWING_FREQUENCY',
    'BIOGRAPHY_MOVIE_ATTENDANCE',
    'CULTURAL_EVENT_PARTICIPATION',
    'ARTS_ENTERTAINMENT_SPENDING'
  ],
  venue_infrastructure: [
    'MUSIC_VENUE_COUNT_2MILE',
    'THEATER_CAPACITY_TOTAL',
    'RADIO_STATION_REACH_CLASSIC_ROCK'
  ]
};
```

---

## 4. Composite Scoring Algorithm Design

### 4.1 Music Affinity Score (40% Weight)

**Algorithm**: Weighted composite of music engagement metrics

```typescript
class MusicAffinityCalculator {
  calculateMusicAffinityScore(data: HexagonData): number {
    const weights = {
      classic_rock_preference: 0.25,
      concert_attendance: 0.20,
      radio_listening_classic_rock: 0.15,
      physical_music_spending: 0.10,
      music_cd_purchases: 0.10,
      music_venue_density: 0.10,
      social_media_music_following: 0.10
    };
    
    let compositeScore = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      const normalizedValue = this.normalizeMetric(data[metric]);
      compositeScore += normalizedValue * weight;
    }
    
    return Math.min(Math.max(compositeScore * 100, 0), 100);
  }
  
  private normalizeMetric(value: number): number {
    // Convert to z-score and scale to 0-1 range
    return (value - this.mean) / this.standardDeviation;
  }
}
```

### 4.2 Cultural Engagement Score (25% Weight)

**Algorithm**: Documentary and cultural content consumption analysis

```typescript
class CulturalEngagementCalculator {
  calculateCulturalEngagementScore(data: HexagonData): number {
    const components = {
      documentary_consumption: {
        value: data.documentary_rentals_30days,
        weight: 0.30,
        transform: 'log_normalize'
      },
      biography_movie_attendance: {
        value: data.biography_theater_6months,
        weight: 0.25,
        transform: 'percentile_rank'
      },
      tv_entertainment_specials: {
        value: data.entertainment_specials_viewership,
        weight: 0.20,
        transform: 'z_score'
      },
      cultural_event_spending: {
        value: data.theater_opera_concert_spending,
        weight: 0.15,
        transform: 'income_adjusted'
      },
      entertainment_research: {
        value: data.entertainment_info_internet_usage,
        weight: 0.10,
        transform: 'frequency_based'
      }
    };
    
    return this.calculateWeightedComposite(components);
  }
}
```

### 4.3 Premium Spending Capacity Score (20% Weight)

**Algorithm**: Entertainment expenditure analysis with income adjustment

```typescript
class SpendingCapacityCalculator {
  calculateSpendingCapacityScore(data: HexagonData): number {
    // Income-adjusted entertainment spending analysis
    const baseSpending = data.entertainment_spending_annual;
    const incomeLevel = data.median_household_income;
    const spendingRatio = baseSpending / incomeLevel;
    
    const components = {
      entertainment_spending_patterns: {
        value: spendingRatio,
        weight: 0.35,
        benchmark: 0.08 // 8% of income on entertainment
      },
      premium_event_spending: {
        value: data.theater_concert_spending,
        weight: 0.25,
        income_adjustment: true
      },
      music_purchase_behavior: {
        value: data.physical_digital_music_spending,
        weight: 0.30,
        trend_analysis: true
      }
    };
    
    return this.calculateIncomeAdjustedScore(components);
  }
}
```

### 4.4 Market Accessibility Score (15% Weight)

**Algorithm**: Infrastructure and demographic alignment analysis with Tapestry segment weighting

```typescript
class MarketAccessibilityCalculator {
  // Tapestry segment relevance weights
  private tapestryWeights = {
    // Primary Target Segments (High Relevance Weight: 1.0)
    '1A': 1.0, // Top Tier
    '1D': 1.0, // Savvy Suburbanites
    '9A': 1.0, // Silver & Gold
    '9B': 1.0, // Golden Years
    
    // Secondary Target Segments (Medium Relevance Weight: 0.75)
    '1E': 0.75, // Exurbanites
    '5A': 0.75, // Comfortable Empty Nesters
    '5B': 0.75, // In Style
    
    // Tertiary Target Segments (Lower Relevance Weight: 0.5)
    '2B': 0.5, // Urban Chic
    '3B': 0.5, // Metro Renters
    '9D': 0.5, // Senior Escapes
    
    // Default weight for other segments
    'other': 0.1
  };

  calculateMarketAccessibilityScore(data: HexagonData): number {
    // Target demographic concentration analysis
    const targetAgeConcentration = this.calculateAgeConcentration(data, 45, 70);
    const theaterAccessibility = this.calculateTheaterAccessibility(data);
    const radioCoverage = this.calculateRadioCoverage(data);
    const tapestryAlignment = this.calculateWeightedTapestryAlignment(data);
    
    return this.weightedComposite({
      age_demographics: { value: targetAgeConcentration, weight: 0.30 },
      theater_infrastructure: { value: theaterAccessibility, weight: 0.25 },
      radio_coverage: { value: radioCoverage, weight: 0.20 },
      tapestry_alignment: { value: tapestryAlignment, weight: 0.25 }
    });
  }
  
  private calculateWeightedTapestryAlignment(data: HexagonData): number {
    // Use the percentage fields from feature service to calculate weighted score
    // NOTE: Initial equal weighting (1.0) - SHAP analysis will determine optimal weights
    // Based on actual 2025 ESRI Tapestry segment codes
    const tapestryScore = 
      (data.TAPESTRY_K1_PCT * 1.0) +  // Established Suburbanites (Group K: Suburban Shine)
      (data.TAPESTRY_K2_PCT * 1.0) +  // Mature Suburban Families (Group K: Suburban Shine)
      (data.TAPESTRY_I1_PCT * 1.0) +  // Rural Established (Group I: Countryscapes)
      (data.TAPESTRY_J1_PCT * 1.0) +  // Active Seniors (Group J: Mature Reflections)
      (data.TAPESTRY_L1_PCT * 1.0);   // Savvy Suburbanites (Group L: Premier Estates)
    
    // Return weighted composite score (0-100 scale)
    // This could also be pre-calculated as TAPESTRY_COMPOSITE_WEIGHT field
    return Math.min(tapestryScore, 100);
  }
  
  private calculateTheaterAccessibility(data: HexagonData): number {
    // Calculate theater market strength based on multiple factors
    const theaterDensity = data.theater_density_2mile_radius || 0;
    const totalCapacity = data.total_theater_capacity_sqft || 0;
    const salesVolume = data.total_annual_sales_volume || 0;
    const employeeCount = data.total_employees || 0;
    
    // Normalize each component (0-100 scale)
    const densityScore = Math.min(theaterDensity * 10, 100); // 10+ theaters = max score
    const capacityScore = Math.min(totalCapacity / 1000, 100); // 100,000 sq ft = max score
    const salesScore = Math.min(salesVolume / 10000000, 100); // $10M annual = max score
    const employmentScore = Math.min(employeeCount / 100, 100); // 100+ employees = max score
    
    // Weighted composite of theater infrastructure factors
    return (densityScore * 0.4) + (capacityScore * 0.3) + (salesScore * 0.2) + (employmentScore * 0.1);
  }
  
  private calculateAgeConcentration(data: HexagonData, minAge: number, maxAge: number): number {
    const totalPopulation = data.total_population;
    const targetPopulation = data.age_45_54 + data.age_55_64 + data.age_65_74;
    return (targetPopulation / totalPopulation) * 100;
  }
}
```

---

## 5. Geographic Framework Implementation

### 5.1 Federated Layer Architecture for Multi-State Analysis

**Critical Requirement**: The analysis spans multiple states with separate ArcGIS Feature Services for each state. We need to efficiently combine these services to enable seamless static layer display, analyses, and visualizations as if they were a single unified dataset.

#### 5.1.1 Federated Layer Service Implementation

**File**: `/lib/services/FederatedLayerService.ts`

```typescript
export class FederatedLayerService {
  async createFederatedLayer(
    serviceConfigs: Array<{
      url: string;
      state: string;
      layerIndex?: number;
    }>,
    layerName: string
  ): Promise<FeatureLayer> {
    
    // Step 1: Create individual feature layers for each state
    const sourceLayers = await Promise.all(
      serviceConfigs.map(async (config, index) => {
        const layer = new FeatureLayer({
          url: `${config.url}/${config.layerIndex || 0}`,
          outFields: ['*'],
          id: `${layerName}_${config.state}_${index}`
        });
        
        await layer.load();
        return { layer, state: config.state };
      })
    );

    // Step 2: Query all features from all state services
    const allFeatures = await Promise.all(
      sourceLayers.map(async ({ layer, state }) => {
        const query = layer.createQuery();
        query.where = '1=1';
        query.returnGeometry = true;
        query.outFields = ['*'];
        
        const featureSet = await layer.queryFeatures(query);
        
        // Add state identifier to each feature for tracking
        return featureSet.features.map(feature => {
          feature.attributes.SOURCE_STATE = state;
          feature.attributes.FEDERATED_ID = `${state}_${feature.attributes.OBJECTID}`;
          return feature;
        });
      })
    );

    // Step 3: Create unified client-side layer combining all states
    const combinedFeatures = allFeatures.flat();
    
    const federatedLayer = new FeatureLayer({
      source: combinedFeatures,
      fields: this.createUnifiedFields(sourceLayers[0].layer),
      objectIdField: 'FEDERATED_ID',
      geometryType: sourceLayers[0].layer.geometryType,
      spatialReference: sourceLayers[0].layer.spatialReference,
      title: layerName,
      id: `federated_${layerName}`,
      renderer: this.createUnifiedRenderer(),
      popupTemplate: this.createUnifiedPopupTemplate()
    });

    return federatedLayer;
  }
}
```

#### 5.1.2 Configuration for Multi-State Services

**File**: `/config/entertainment-federated-layers.ts`

```typescript
export interface FederatedLayerConfig extends LayerConfig {
  federationType: 'multi-service';
  services: Array<{
    url: string;
    identifier: string; // state code
    layerIndex?: number;
    filter?: string; // optional WHERE clause for state-specific filtering
  }>;
  unificationField: string;
}

export const doorsDocumentaryFederatedLayers: FederatedLayerConfig[] = [
  {
    id: 'doors_entertainment_h3_hexagons',
    name: 'Doors Documentary Analysis - Multi-State',
    type: 'composite',
    federationType: 'multi-service',
    services: [
      {
        url: 'https://services.arcgis.com/.../California_Entertainment_H3',
        identifier: 'CA',
        layerIndex: 0
      },
      {
        url: 'https://services.arcgis.com/.../Nevada_Entertainment_H3',
        identifier: 'NV',
        layerIndex: 0
      },
      {
        url: 'https://services.arcgis.com/.../Arizona_Entertainment_H3',
        identifier: 'AZ',
        layerIndex: 0
      },
      {
        url: 'https://services.arcgis.com/.../Oregon_Entertainment_H3',
        identifier: 'OR',
        layerIndex: 0
      },
      {
        url: 'https://services.arcgis.com/.../Washington_Entertainment_H3',
        identifier: 'WA',
        layerIndex: 0
      }
    ],
    unificationField: 'STATE_CODE',
    fields: [
      'h3_index',
      'composite_doors_score',
      'music_affinity_score',
      'cultural_engagement_score',
      'spending_capacity_score',
      'market_accessibility_score'
    ]
  }
];
```

#### 5.1.3 Performance Optimization with Caching

**File**: `/lib/services/FederatedLayerCache.ts`

```typescript
export class FederatedLayerCache {
  private cache = new Map<string, {
    layer: FeatureLayer;
    lastUpdated: Date;
    ttl: number;
  }>();

  async getCachedFederatedLayer(
    layerConfig: FederatedLayerConfig,
    maxAge: number = 3600000 // 1 hour default
  ): Promise<FeatureLayer> {
    
    const cacheKey = this.generateCacheKey(layerConfig);
    const cached = this.cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.lastUpdated.getTime()) < maxAge) {
      console.log(`[FederatedLayerCache] Returning cached layer: ${layerConfig.id}`);
      return cached.layer;
    }

    // Create new federated layer
    const federatedService = new FederatedLayerService();
    const layer = await federatedService.createFederatedLayer(
      layerConfig.services,
      layerConfig.id
    );

    // Cache for future use
    this.cache.set(cacheKey, {
      layer,
      lastUpdated: new Date(),
      ttl: maxAge
    });

    return layer;
  }
}
```

### 5.2 H3 Resolution 6 Hexagonal Grid Generation

**File**: `/scripts/entertainment/generate-h3-hexagonal-grid.js`

```javascript
const h3 = require('h3-js');
const turf = require('@turf/turf');

class H3HexagonalGridGenerator {
  generateEntertainmentGrid(boundingBox, resolution = 6) {
    // H3 Resolution 6 provides approximately 2-mile radius hexagons
    // Perfect for entertainment venue catchment area analysis
    
    // Get all H3 hexagons at resolution 6 within bounding box
    const hexagons = h3.polyfill(boundingBox, resolution, true);
    
    // Convert H3 indices to GeoJSON features
    const hexGrid = {
      type: 'FeatureCollection',
      features: hexagons.map(hexId => {
        const hexBoundary = h3.h3ToGeoBoundary(hexId, true);
        const center = h3.h3ToGeo(hexId);
        
        return {
          type: 'Feature',
          properties: {
            hex_id: `DOORS_H3_${hexId}`,
            h3_index: hexId,
            h3_resolution: resolution,
            analysis_type: 'entertainment',
            center_lat: center[0],
            center_lon: center[1],
            catchment_area_sqmi: h3.hexArea(resolution, h3.UNITS.km2) * 0.386102, // Convert to sq miles
            approximate_radius_miles: Math.sqrt(h3.hexArea(resolution, h3.UNITS.km2) * 0.386102 / Math.PI)
          },
          geometry: {
            type: 'Polygon',
            coordinates: [hexBoundary.concat([hexBoundary[0]])] // Close the polygon
          }
        };
      })
    };
    
    return hexGrid;
  }
  
  calculateCatchmentMetrics(hexagon, theaterData, radioStationData) {
    const center = [hexagon.properties.center_lat, hexagon.properties.center_lon];
    const hexRadius = hexagon.properties.approximate_radius_miles;
    
    // Find theaters within hexagon
    const nearbyTheaters = theaterData.filter(theater => {
      const distance = turf.distance(center, theater.location, { units: 'miles' });
      return distance <= hexRadius;
    });
    
    // Calculate radio station coverage within hexagon
    const radioCoverage = this.calculateRadioCoverage(hexagon, radioStationData);
    
    return {
      theater_count: nearbyTheaters.length,
      total_capacity_sqft: nearbyTheaters.reduce((sum, t) => sum + t.capacity_sqft, 0),
      total_sales_volume: nearbyTheaters.reduce((sum, t) => sum + t.annual_sales_volume, 0),
      total_employees: nearbyTheaters.reduce((sum, t) => sum + t.employee_count, 0),
      radio_coverage: radioCoverage
    };
  }
  
  calculateRadioCoverage(hexagon, radioStationData) {
    const hexCenter = [hexagon.properties.center_lat, hexagon.properties.center_lon];
    let totalCoverage = 0;
    let classicRockCoverage = 0;
    
    radioStationData.forEach(station => {
      const distance = turf.distance(hexCenter, station.location, { units: 'miles' });
      if (distance <= station.broadcast_radius_miles) {
        const coverageStrength = Math.max(0, 1 - (distance / station.broadcast_radius_miles));
        totalCoverage += coverageStrength * station.signal_strength;
        
        if (station.format === 'classic_rock') {
          classicRockCoverage += coverageStrength * station.signal_strength;
        }
      }
    });
    
    return {
      total_radio_coverage: totalCoverage,
      classic_rock_coverage: classicRockCoverage,
      coverage_ratio: totalCoverage > 0 ? classicRockCoverage / totalCoverage : 0
    };
  }
}
```

### 5.2 Data Aggregation at Hexagon Level

**File**: `/lib/services/HexagonDataAggregator.ts`

```typescript
export class HexagonDataAggregator {
  async aggregateDataToHexagons(hexGrid: FeatureCollection, sourceData: any[]): Promise<EnrichiedHexagonGrid> {
    const enrichedHexagons = await Promise.all(
      hexGrid.features.map(async (hexagon) => {
        // Spatial intersection with source data
        const intersectingData = this.findIntersectingData(hexagon, sourceData);
        
        // Calculate population-weighted averages
        const aggregatedMetrics = this.calculatePopulationWeightedAverages(intersectingData);
        
        // Add entertainment-specific calculations including theater infrastructure
        const entertainmentMetrics = await this.calculateEntertainmentMetrics(hexagon, intersectingData);
        
        return {
          ...hexagon,
          properties: {
            ...hexagon.properties,
            ...aggregatedMetrics,
            ...entertainmentMetrics,
            data_quality_score: this.assessDataQuality(intersectingData)
          }
        };
      })
    );
    
    return {
      type: 'FeatureCollection',
      features: enrichedHexagons
    };
  }
  
  private async calculateEntertainmentMetrics(hexagon: Feature, data: any[]): Promise<EntertainmentMetrics> {
    return {
      music_affinity_score: await this.musicAffinityCalculator.calculate(data),
      cultural_engagement_score: await this.culturalEngagementCalculator.calculate(data),
      spending_capacity_score: await this.spendingCapacityCalculator.calculate(data),
      market_accessibility_score: await this.marketAccessibilityCalculator.calculate(hexagon, data),
      composite_doors_score: 0 // Calculated after individual scores
    };
  }
}
```

---

## 6. Analysis Engine Configuration

### 6.1 Entertainment Analysis Endpoint

**File**: `/config/entertainment-endpoints.ts`

```typescript
export const doorsDocumentaryEndpoints: AnalysisEndpoint[] = [
  {
    id: 'doors_market_opportunity',
    name: 'Doors Documentary Market Opportunity',
    description: 'Comprehensive market analysis for The Doors documentary distribution',
    category: 'entertainment',
    subcategory: 'music_documentary',
    processor: 'EntertainmentAnalysisProcessor',
    visualization: 'composite_hexagon_heatmap',
    fields: {
      primary_score: 'composite_doors_score',
      breakdown_scores: [
        'music_affinity_score',
        'cultural_engagement_score', 
        'spending_capacity_score',
        'market_accessibility_score'
      ],
      supporting_metrics: [
        'classic_rock_listening_hours',
        'documentary_consumption_rate',
        'entertainment_spending_annual',
        'target_age_concentration'
      ]
    },
    styling: {
      color_scheme: 'doors_brand_colors',
      opacity_range: [0.3, 0.8],
      border_style: 'hexagon_classic',
      legend_position: 'bottom_right'
    }
  },
  {
    id: 'venue_optimization',
    name: 'Optimal Venue Analysis',
    description: 'Identify best venue types and locations for documentary screenings',
    category: 'entertainment',
    subcategory: 'venue_planning',
    processor: 'VenueOptimizationProcessor',
    visualization: 'venue_overlay_map',
    fields: {
      venue_types: ['theater', 'music_hall', 'cultural_center', 'outdoor_venue'],
      capacity_recommendations: 'optimal_venue_capacity',
      accessibility_score: 'venue_accessibility_rating'
    }
  }
];
```

### 6.2 Microservice Integration with Tapestry Segments

**File**: `/lib/services/DoorsDocumentaryMicroservice.ts`

```typescript
export class DoorsDocumentaryMicroservice {
  // Initial equal weights - SHAP analysis will determine actual weights
  private tapestrySegments = {
    '5A': 1.0, // Senior Security - Midwest suburban/rural, age 62
    '5B': 1.0, // Golden Years - Midwest metro, age 52
    '6B': 1.0, // Salt of the Earth - blue-collar classic rock, age 44
    '6F': 1.0, // Heartland Communities - rural Midwest, age 42
    '9B': 1.0  // The Elders - retirement communities, age 72
  };
  
  // Weights will be updated after SHAP analysis
  private shapDerivedWeights = {};

  async analyzeDoorsPotential(selectedAreas: SelectedArea[]): Promise<DoorsAnalysisResult> {
    const microservicePayload = {
      areas: selectedAreas,
      analysis_type: 'doors_documentary',
      tapestry_segments: {
        target_segments: Object.keys(this.tapestryWeights),
        segment_weights: this.tapestryWeights,
        composite_calculation: 'weighted_population_average'
      },
      scoring_components: {
        music_affinity: {
          weight: 0.40,
          fields: ['classic_rock_listening_hours', 'concert_attendance_frequency', 'music_streaming_engagement']
        },
        cultural_engagement: {
          weight: 0.25,
          fields: ['documentary_consumption_rate', 'biography_theater_attendance', 'cultural_event_participation']
        },
        spending_capacity: {
          weight: 0.20,
          fields: ['entertainment_discretionary_spend', 'theater_concert_spending', 'premium_entertainment_propensity']
        },
        market_accessibility: {
          weight: 0.15,
          fields: ['tapestry_composite_weight', 'theater_density_2mile', 'radio_classic_rock_coverage']
        }
      }
    };

    const response = await fetch(`${this.microserviceUrl}/analyze/doors-documentary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(microservicePayload)
    });

    return await response.json();
  }

  private calculateTapestryCompositeWeight(hexagonData: HexagonAnalysisData): number {
    let totalWeightedPopulation = 0;
    let totalPopulation = 0;

    // Calculate weighted population based on Tapestry segment distribution
    Object.entries(hexagonData.tapestry_segments).forEach(([segmentCode, populationPct]) => {
      const weight = this.tapestryWeights[segmentCode] || 0.1;
      const segmentPopulation = (populationPct / 100) * hexagonData.total_population;
      
      totalWeightedPopulation += segmentPopulation * weight;
      totalPopulation += segmentPopulation;
    });

    return totalPopulation > 0 ? (totalWeightedPopulation / totalPopulation) * 100 : 0;
  }
}
```

### 6.3 Federated Analysis Processing

**File**: `/lib/analysis/strategies/processors/FederatedEntertainmentProcessor.ts`

```typescript
export class FederatedEntertainmentProcessor extends BaseProcessor {
  async process(query: string, selectedAreas: SelectedArea[]): Promise<ProcessedAnalysisData> {
    
    // Group selected areas by state for efficient querying
    const areasByState = this.groupAreasByState(selectedAreas);
    
    // Process each state's data separately from its service
    const stateResults = await Promise.all(
      Object.entries(areasByState).map(async ([state, areas]) => {
        const stateLayer = await this.getStateLayer(state);
        const stateData = await this.queryStateData(stateLayer, areas);
        return { state, data: stateData };
      })
    );

    // Combine and normalize results across states
    return this.combineStateResults(stateResults);
  }

  private combineStateResults(stateResults: Array<{state: string, data: any}>): ProcessedAnalysisData {
    // Aggregate data across states using population weighting
    const combinedMetrics = this.aggregateAcrossStates(stateResults);
    
    return {
      processedData: combinedMetrics,
      visualization: this.createFederatedVisualization(stateResults),
      metadata: {
        sourceStates: stateResults.map(r => r.state),
        totalFeatures: stateResults.reduce((sum, r) => sum + r.data.features.length, 0),
        federationType: 'multi-state'
      }
    };
  }
}
```

### 6.3 Query Classification for Entertainment

**File**: `/lib/query-classifier-entertainment.ts`

```typescript
export class EntertainmentQueryClassifier extends QueryClassifier {
  private entertainmentPatterns = {
    doors_specific: [
      /doors\s+documentary/i,
      /jim\s+morrison/i,
      /classic\s+rock\s+documentary/i,
      /60s\s+music\s+film/i
    ],
    music_documentary: [
      /music\s+documentary/i,
      /band\s+documentary/i,
      /musician\s+film/i,
      /rock\s+documentary/i
    ],
    venue_analysis: [
      /venue\s+analysis/i,
      /where\s+to\s+screen/i,
      /theater\s+locations/i,
      /screening\s+locations/i
    ],
    audience_analysis: [
      /target\s+audience/i,
      /classic\s+rock\s+fans/i,
      /documentary\s+viewers/i,
      /music\s+lovers/i
    ]
  };
  
  classifyEntertainmentQuery(query: string): EntertainmentQueryType {
    for (const [category, patterns] of Object.entries(this.entertainmentPatterns)) {
      if (patterns.some(pattern => pattern.test(query))) {
        return {
          category: category as EntertainmentCategory,
          confidence: this.calculateConfidence(query, patterns),
          suggestedEndpoint: this.mapCategoryToEndpoint(category),
          parameters: this.extractParameters(query)
        };
      }
    }
    
    return this.fallbackClassification(query);
  }
}
```

---

## 7. Visualization & UI Components

### 7.1 Radio Station Coverage Visualization

**File**: `/components/EntertainmentVisualization/RadioStationLayer.tsx`

```typescript
import React from 'react';
import { FeatureLayer, GraphicsLayer } from '@arcgis/core/layers';
import { SimpleMarkerSymbol, SimpleFillSymbol } from '@arcgis/core/symbols';

export class RadioStationVisualization {
  createRadioStationLayer(radioStationData: RadioStationData[]): FeatureLayer {
    // Create point features for radio station locations
    const stationFeatures = radioStationData.map(station => ({
      geometry: {
        type: 'point',
        latitude: station.location.coordinates[1],
        longitude: station.location.coordinates[0]
      },
      attributes: {
        station_id: station.id,
        call_sign: station.call_sign,
        frequency: station.frequency,
        format: station.format,
        power_watts: station.power_watts,
        broadcast_radius_miles: station.broadcast_radius_miles,
        market_share: station.market_share,
        target_demographic_45_70: station.target_demographic_45_70
      }
    }));

    // Create coverage radius circles
    const coverageFeatures = radioStationData.map(station => {
      const coverageCircle = this.createCoverageCircle(
        station.location.coordinates,
        station.broadcast_radius_miles
      );
      
      return {
        geometry: coverageCircle,
        attributes: {
          station_id: station.id,
          coverage_type: 'broadcast_radius',
          format: station.format,
          signal_strength: station.signal_strength
        }
      };
    });

    return new FeatureLayer({
      source: [...stationFeatures, ...coverageFeatures],
      objectIdField: 'station_id',
      fields: this.defineRadioStationFields(),
      renderer: this.createRadioStationRenderer(),
      popupTemplate: this.createRadioStationPopup()
    });
  }

  private createRadioStationRenderer() {
    return {
      type: 'unique-value',
      field: 'coverage_type',
      uniqueValueInfos: [
        {
          value: null, // Station points
          symbol: new SimpleMarkerSymbol({
            style: 'circle',
            color: [255, 165, 0, 0.8], // Orange for radio towers
            size: '12px',
            outline: {
              color: [255, 255, 255, 0.8],
              width: 2
            }
          })
        },
        {
          value: 'broadcast_radius', // Coverage circles
          symbol: new SimpleFillSymbol({
            style: 'none',
            outline: {
              color: [255, 165, 0, 0.4],
              width: 2,
              style: 'dash'
            }
          })
        }
      ],
      visualVariables: [
        {
          type: 'size',
          field: 'market_share',
          minDataValue: 0,
          maxDataValue: 30,
          minSize: 8,
          maxSize: 20
        },
        {
          type: 'color',
          field: 'format',
          stops: [
            { value: 'classic_rock', color: [139, 69, 19] },      // Brown for classic rock
            { value: 'contemporary_rock', color: [255, 140, 0] }, // Dark orange
            { value: 'news_talk', color: [128, 128, 128] },       // Gray
            { value: 'country', color: [34, 139, 34] },           // Forest green
            { value: 'other', color: [211, 211, 211] }            // Light gray
          ]
        }
      ]
    };
  }

  private createRadioStationPopup() {
    return {
      title: 'Radio Station: {call_sign}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            { fieldName: 'frequency', label: 'Frequency' },
            { fieldName: 'format', label: 'Format' },
            { fieldName: 'broadcast_radius_miles', label: 'Coverage Radius (miles)' },
            { fieldName: 'market_share', label: 'Market Share %' },
            { fieldName: 'target_demographic_45_70', label: 'Target Demo 45-70%' }
          ]
        }
      ]
    };
  }

  private createCoverageCircle(center: [number, number], radiusMiles: number) {
    // Convert miles to meters for geodesic calculations
    const radiusMeters = radiusMiles * 1609.34;
    
    // Create geodesic circle for accurate coverage representation
    return {
      type: 'polygon',
      rings: this.generateCircleCoordinates(center, radiusMeters)
    };
  }
}
```

### 7.2 Tapestry Segment Layer Widget Configuration

**File**: `/config/entertainment-tapestry-layers.ts`

```typescript
export const tapestrySegmentLayers: LayerConfig[] = [
  {
    id: 'doors_tapestry_2025_segments',
    name: 'Actual 2025 ESRI Tapestry Segments',
    description: 'Real 2025 Tapestry segments for Midwest classic rock audience (Age 45+)',
    type: 'percentage',
    category: 'demographic',
    subcategory: 'tapestry_lifestyle',
    fields: ['K1_ESTABLISHED_SUBURBANITES_PCT', 'K2_MATURE_SUBURBAN_FAMILIES_PCT', 'I1_RURAL_ESTABLISHED_PCT', 'J1_ACTIVE_SENIORS_PCT', 'L1_SAVVY_SUBURBANITES_PCT'],
    styling: {
      color_scheme: 'doors_2025_tapestry_segments',
      method: 'class_breaks',
      breaks: [0, 5, 15, 30, 50],
      colors: ['#FFF5EB', '#FEC79E', '#FD8D3C', '#E6550D', '#A63603']
    },
    popupTemplate: {
      title: '2025 Tapestry Demographics - {GEOID}',
      content: [
        {
          type: 'fields',
          fieldInfos: [
            { fieldName: 'K1_ESTABLISHED_SUBURBANITES_PCT', label: 'K1: Established Suburbanites %', format: { places: 1 } },
            { fieldName: 'K2_MATURE_SUBURBAN_FAMILIES_PCT', label: 'K2: Mature Suburban Families %', format: { places: 1 } },
            { fieldName: 'I1_RURAL_ESTABLISHED_PCT', label: 'I1: Rural Established %', format: { places: 1 } },
            { fieldName: 'J1_ACTIVE_SENIORS_PCT', label: 'J1: Active Seniors %', format: { places: 1 } },
            { fieldName: 'L1_SAVVY_SUBURBANITES_PCT', label: 'L1: Savvy Suburbanites %', format: { places: 1 } }
          ]
        }
      ]
    }
  },
  {
    id: 'doors_tapestry_composite_weight',
    name: 'Tapestry Composite Weight',
    description: 'Weighted composite score of all target Tapestry segments',
    type: 'index',
    category: 'analysis',
    subcategory: 'composite_scoring',
    fields: ['TAPESTRY_COMPOSITE_WEIGHT'],
    styling: {
      color_scheme: 'doors_composite',
      method: 'quantile',
      classes: 5,
      colors: ['#FEEDDE', '#FDBE85', '#FD8D3C', '#E6550D', '#A63603']
    },
    analysis: {
      calculation_method: 'weighted_population_sum',
      weights: {
        '1A': 1.0, '1D': 1.0, '9A': 1.0, '9B': 1.0,
        '1E': 0.75, '5A': 0.75, '5B': 0.75,
        '2B': 0.5, '3B': 0.5, '9D': 0.5
      }
    }
  }
];
```

### 7.3 Static Layer Widget Integration

**File**: `/components/LayerController/TapestrySegmentWidget.tsx`

```typescript
export const TapestrySegmentWidget: React.FC<TapestryWidgetProps> = ({ 
  map, 
  segments = tapestrySegmentLayers 
}) => {
  const [selectedSegmentGroup, setSelectedSegmentGroup] = useState<'classic_rock_segments' | 'composite'>('classic_rock_segments');
  const [activeLayer, setActiveLayer] = useState<FeatureLayer | null>(null);

  const segmentGroups = {
    classic_rock_segments: {
      title: '2025 Actual ESRI Tapestry Segments (Equal Weight: 1.0)',
      segments: ['K1', 'K2', 'I1', 'J1', 'L1'],
      description: 'Midwest classic rock audience segments (Age 45+)',
      details: {
        'K1': 'Established Suburbanites (Group K: Suburban Shine)',
        'K2': 'Mature Suburban Families (Group K: Suburban Shine)', 
        'I1': 'Rural Established (Group I: Countryscapes)',
        'J1': 'Active Seniors (Group J: Mature Reflections)',
        'L1': 'Savvy Suburbanites (Group L: Premier Estates)'
      }
    },
    composite: {
      title: 'SHAP-Weighted Composite Score',
      segments: ['COMPOSITE'],
      description: 'Data-driven combination of 5 segments using SHAP feature importance'
    }
  };

  const createTapestryVisualization = useCallback(async (groupType: string) => {
    const layer = await createFederatedLayer(
      doorsDocumentaryFederatedLayers.find(l => l.id === 'doors_entertainment_h3_hexagons'),
      `tapestry_${groupType}`
    );

    // Apply group-specific renderer
    layer.renderer = createTapestryGroupRenderer(groupType, segmentGroups[groupType]);
    
    return layer;
  }, []);

  return (
    <div className="tapestry-segment-widget">
      <div className="widget-header">
        <h3>Target Audience Segments</h3>
        <p>ESRI Tapestry lifestyle segmentation for Doors documentary analysis</p>
      </div>
      
      <div className="segment-group-selector">
        {Object.entries(segmentGroups).map(([key, group]) => (
          <button
            key={key}
            className={`segment-group-btn ${selectedSegmentGroup === key ? 'active' : ''}`}
            onClick={() => setSelectedSegmentGroup(key as any)}
          >
            {group.title}
          </button>
        ))}
      </div>
      
      <div className="segment-details">
        <h4>{segmentGroups[selectedSegmentGroup].title}</h4>
        <p>{segmentGroups[selectedSegmentGroup].description}</p>
        
        <div className="segment-list">
          {segmentGroups[selectedSegmentGroup].segments.map(segmentCode => (
            <TapestrySegmentCard 
              key={segmentCode}
              segmentCode={segmentCode}
              weight={getTapestryWeight(segmentCode)}
              onVisualize={() => createTapestryVisualization(selectedSegmentGroup)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 7.4 H3 Hexagonal Heatmap Visualization

**File**: `/components/EntertainmentVisualization/DoorsHexagonMap.tsx`

```typescript
import React from 'react';
import { ArcGISMap } from '@arcgis/core';

export const DoorsHexagonMap: React.FC<DoorsMapProps> = ({ 
  hexagonData, 
  scoringDimension = 'composite' 
}) => {
  const [mapView, setMapView] = useState<MapView | null>(null);
  const [activeLayer, setActiveLayer] = useState<FeatureLayer | null>(null);

  const hexagonRenderer = useMemo(() => {
    return new SimpleRenderer({
      symbol: new SimpleFillSymbol({
        style: 'solid',
        outline: new SimpleLineSymbol({
          color: [255, 255, 255, 0.5],
          width: 1
        })
      }),
      visualVariables: [{
        type: 'color',
        field: `${scoringDimension}_score`,
        stops: [
          { value: 0, color: [255, 245, 235, 0.3] },    // Light orange
          { value: 25, color: [254, 196, 79, 0.5] },     // Doors yellow
          { value: 50, color: [254, 153, 41, 0.7] },     // Orange
          { value: 75, color: [217, 95, 14, 0.8] },      // Deep orange
          { value: 100, color: [153, 52, 4, 0.9] }       // Dark red-orange
        ]
      }, {
        type: 'size',
        field: 'data_quality_score',
        minSize: 8,
        maxSize: 16
      }]
    });
  }, [scoringDimension]);

  const popupTemplate = new PopupTemplate({
    title: 'Market Opportunity: {hex_id}',
    content: [{
      type: 'fields',
      fieldInfos: [
        { fieldName: 'composite_doors_score', label: 'Overall Score' },
        { fieldName: 'music_affinity_score', label: 'Music Affinity' },
        { fieldName: 'cultural_engagement_score', label: 'Cultural Engagement' },
        { fieldName: 'spending_capacity_score', label: 'Spending Capacity' },
        { fieldName: 'market_accessibility_score', label: 'Market Access' }
      ]
    }],
    actions: [{
      title: 'View Detailed Analysis',
      id: 'detailed-analysis',
      image: 'https://developers.arcgis.com/javascript/latest/sample-code/popup-actions/live/popup-action.png'
    }]
  });

  return (
    <div className="doors-hexagon-map">
      <div className="map-controls">
        <ScoringDimensionSelector 
          value={scoringDimension}
          onChange={setScoringDimension}
          options={[
            { value: 'composite', label: 'Overall Market Score' },
            { value: 'music_affinity', label: 'Music Affinity' },
            { value: 'cultural_engagement', label: 'Cultural Engagement' },
            { value: 'spending_capacity', label: 'Spending Capacity' },
            { value: 'market_accessibility', label: 'Market Access' }
          ]}
        />
      </div>
      
      <div ref={mapContainerRef} className="map-container">
        {/* ArcGIS Map will be rendered here */}
      </div>
      
      <DoorsMapLegend 
        scoringDimension={scoringDimension}
        colorScheme="doors_brand"
      />
    </div>
  );
};
```

### 7.2 Interactive Dashboard Components

**File**: `/components/EntertainmentVisualization/DoorsAnalyticsDashboard.tsx`

```typescript
export const DoorsAnalyticsDashboard: React.FC = () => {
  const [selectedHexagon, setSelectedHexagon] = useState<HexagonData | null>(null);
  const [analysisMode, setAnalysisMode] = useState<'overview' | 'detailed'>('overview');

  return (
    <div className="doors-analytics-dashboard">
      <DashboardHeader 
        title="The Doors Documentary - Market Analysis"
        subtitle="Optimal Distribution Strategy Analysis"
      />
      
      <div className="dashboard-grid">
        <div className="map-section">
          <DoorsHexagonMap 
            onHexagonSelect={setSelectedHexagon}
            analysisMode={analysisMode}
          />
        </div>
        
        <div className="analysis-panel">
          {selectedHexagon ? (
            <HexagonDetailView 
              hexagon={selectedHexagon}
              onVenueAnalysis={() => setAnalysisMode('detailed')}
            />
          ) : (
            <OverallMarketSummary />
          )}
        </div>
        
        <div className="insights-section">
          <MarketInsightsPanel />
          <VenueRecommendations />
          <AudienceSegmentAnalysis />
        </div>
      </div>
    </div>
  );
};
```

---

## 8. Implementation Timeline

### 8.1 Phase 1: Foundation & Data Integration (Weeks 1-4)

**Week 1-2: Architecture Setup**
- [ ] Create entertainment project type configuration
- [ ] Extend BaseProcessor for entertainment analysis
- [ ] Implement Federated Layer Architecture for multi-state services
- [ ] Set up H3 hexagonal grid generation system
- [ ] Configure semantic field resolver for entertainment data

**Week 3-4: Data Integration**
- [ ] Process pre-aggregated consumer behavior data for H3 hexagons
- [ ] **Add 5 Tapestry fields to feature services** (2025 segments):
  - `TAPESTRY_5A_PCT` - Senior Security
  - `TAPESTRY_5B_PCT` - Golden Years  
  - `TAPESTRY_6B_PCT` - Salt of the Earth
  - `TAPESTRY_6F_PCT` - Heartland Communities
  - `TAPESTRY_9B_PCT` - The Elders
- [ ] Create radio station location points with broadcast radius coverage
- [ ] Implement theater location data aggregation within H3 hexagons (size, sales volume, employees)
- [ ] Set up radio coverage mapping with visible radius visualization
- [ ] Use existing H3 hexagons from feature services (not generated)
- [ ] Initial equal weighting (1.0) for all segments pending SHAP analysis

### 8.2 Phase 2: Scoring Algorithm Implementation (Weeks 5-7)

**Week 5: Core Scoring Engines**
- [ ] Implement Music Affinity Calculator
- [ ] Build Cultural Engagement Calculator
- [ ] Create Spending Capacity Calculator
- [ ] Develop Market Accessibility Calculator

**Week 6-7: Composite Scoring & Validation**
- [ ] Integrate weighted composite scoring
- [ ] Implement data quality assessment
- [ ] Build validation framework
- [ ] Performance optimization

### 8.3 Phase 3: Visualization & UI (Weeks 8-10)

**Week 8: Map Components**
- [ ] Build hexagonal heatmap visualization
- [ ] Create interactive popup templates
- [ ] Implement multi-dimensional color schemes
- [ ] Add venue overlay capabilities

**Week 9-10: Dashboard & Analytics**
- [ ] Develop comprehensive analytics dashboard
- [ ] Build market insights panels with Tapestry segment breakdowns
- [ ] Create venue recommendation system
- [ ] Implement Tapestry segment static layer widget
- [ ] Configure microservice integration with segment weighting
- [ ] Implement export capabilities

### 8.4 Phase 4: Testing & Refinement (Weeks 11-13)

**Week 11-12: Comprehensive Testing**
- [ ] End-to-end analysis pipeline testing
- [ ] Performance benchmarking
- [ ] Accuracy validation with known markets
- [ ] User acceptance testing

**Week 13: Documentation & Deployment**
- [ ] Complete technical documentation
- [ ] Create user guides and tutorials
- [ ] Prepare production deployment
- [ ] Final system validation

---

## 9. Technical Specifications

### 9.1 Data Storage & Performance

#### 9.1.1 H3 Hexagon Data Structure
```typescript
interface H3HexagonData {
  // H3 Geographic Properties
  hex_id: string;
  h3_index: string;
  h3_resolution: 6;
  geometry: Polygon;
  center_coordinates: [number, number];
  area_square_miles: number;
  approximate_radius_miles: number;
  
  // Demographic Data
  total_population: number;
  age_45_70_population: number;
  median_household_income: number;
  education_levels: EducationBreakdown;
  
  // Entertainment Metrics
  music_affinity_score: number;
  cultural_engagement_score: number;
  spending_capacity_score: number;
  market_accessibility_score: number;
  composite_doors_score: number;
  
  // Supporting Data
  venue_infrastructure: VenueData;
  radio_coverage: RadioCoverageData;
  data_quality_metrics: DataQualityAssessment;
}

interface RadioStationData {
  // Station Identity
  station_id: string;
  call_sign: string;
  frequency: number;
  format: 'classic_rock' | 'contemporary_rock' | 'news_talk' | 'country' | 'other';
  
  // Geographic Properties
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  broadcast_radius_miles: number;
  coverage_area_square_miles: number;
  
  // Technical Specifications
  power_watts: number;
  signal_strength: number;
  broadcast_hours: number;
  
  // Market Data (from Nielsen Audio, RAB, FCC)
  market_share: number;
  listening_hours_weekly: number;
  target_demographic_45_70: number;
  demographic_breakdown: {
    age_25_34: number;
    age_35_44: number;
    age_45_54: number;
    age_55_64: number;
    age_65_plus: number;
  };
  
  // Coverage Visualization Properties
  coverage_circle: {
    center: [number, number];
    radius_miles: number;
    opacity: number;
    stroke_color: string;
    fill_color: string;
  };
}
```

#### 9.1.2 Performance Optimization
- **Spatial Indexing**: R-tree indexing for hexagon lookups
- **Data Caching**: Redis caching for frequently accessed hexagons
- **Lazy Loading**: Progressive loading of detailed analytics
- **Aggregation**: Pre-calculated summary statistics

### 9.2 Available Data Sources & Integration Architecture

#### 9.2.1 Core Consumer Behavior Data Sources
**Available Entertainment Metrics** (Pre-aggregated at Geographic Level):

```typescript
interface EntertainmentBehaviorData {
  // Music Consumption Patterns
  music_listening_habits_by_genre: {
    classic_rock: number;
    rock: number;
    pop: number;
    country: number;
    other_genres: number;
  };
  
  music_listening_habits_by_source: {
    apple_music: number;
    spotify: number;
    amazon_music: number;
    pandora: number;
    sirius_xm: number;
    terrestrial_radio: number;
  };
  
  // Live Entertainment Engagement
  concert_attendance_by_genre: {
    classic_rock: number;
    contemporary_rock: number;
    pop: number;
    country: number;
    jazz_blues: number;
  };
  
  // Documentary & Cultural Content
  documentary_movies_rented_purchased_30days: number;
  biography_genre_theater_attendance_6months: number;
  tv_entertainment_specials_viewership: number;
  
  // Radio Consumption
  radio_listening_by_format: {
    classic_rock_format: number;
    contemporary_rock: number;
    news_talk: number;
    country: number;
    listening_hours_weekly: number;
  };
  
  // Spending Patterns
  entertainment_spending_patterns: {
    annual_entertainment_budget: number;
    discretionary_entertainment_percent: number;
  };
  physical_music_spending: number;
  theater_opera_concert_ticket_spending: number;
  music_cd_purchases: number;
  digital_music_downloads: number;
  streaming_service_music_purchases: number;
  
  // Digital Engagement
  internet_entertainment_research_30days: number;
  social_media_music_artist_following: number;
}
```

#### 9.2.2 Supporting Infrastructure & Demographic Data
**Available Supporting Metrics**:

```typescript
interface SupportingDemographicsData {
  // Target Demographics
  age_demographics: {
    age_45_54: number;
    age_55_64: number;
    age_65_74: number;
    total_target_cohort_45_70: number;
  };
  
  // Lifestyle Segmentation
  tapestry_demographic_modes: {
    segment_codes: string[];
    cultural_engagement_index: number;
    entertainment_propensity: number;
  };
  
  // Infrastructure Metrics (Pre-calculated)
  theater_locations: {
    theater_density_2mile_radius: number;
    total_theater_capacity_sqft: number;
    total_annual_sales_volume: number;
    total_employees: number;
    theater_count: number;
  };
  
  // Radio Market Data (From Nielsen Audio, Radio Advertising Bureau, FCC Database)
  radio_station_coverage: {
    classic_rock_format_market_share: number;
    total_listening_hours: number;
    demographic_breakdown_45_70: number;
    broadcast_area_coverage: number;
  };
}
```

### 9.3 Calculation Engine Architecture

#### 9.3.1 Scoring Algorithm Framework
```typescript
export abstract class EntertainmentScoreCalculator {
  protected weights: Record<string, number>;
  protected normalizationMethod: 'z_score' | 'percentile' | 'min_max';
  
  abstract calculate(data: HexagonData): Promise<number>;
  
  protected normalizeValue(value: number, metric: string): number {
    switch (this.normalizationMethod) {
      case 'z_score':
        return this.calculateZScore(value, metric);
      case 'percentile':
        return this.calculatePercentileRank(value, metric);
      case 'min_max':
        return this.calculateMinMaxNormalization(value, metric);
      default:
        throw new Error(`Unknown normalization method: ${this.normalizationMethod}`);
    }
  }
  
  protected calculateWeightedComposite(components: Record<string, ComponentScore>): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [component, data] of Object.entries(components)) {
      if (data.value !== null && data.value !== undefined) {
        const normalizedValue = this.normalizeValue(data.value, component);
        totalScore += normalizedValue * data.weight;
        totalWeight += data.weight;
      }
    }
    
    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  }
}
```

---

## 10. Success Metrics & Validation

### 10.1 Model Performance Indicators

#### 10.1.1 Predictive Accuracy Metrics
```typescript
export class ModelValidationService {
  async validateModelAccuracy(): Promise<ValidationResults> {
    return {
      overall_accuracy: await this.calculateOverallAccuracy(),
      precision_by_score_range: await this.calculatePrecisionByRange(),
      recall_metrics: await this.calculateRecallMetrics(),
      geographic_coverage: await this.assessGeographicCoverage(),
      demographic_alignment: await this.validateDemographicAlignment()
    };
  }
  
  private async calculateOverallAccuracy(): Promise<number> {
    // Compare predictions against known successful music documentary launches
    const testCases = await this.getHistoricalTestCases();
    const predictions = await this.generatePredictions(testCases);
    
    return this.calculateAccuracyScore(predictions, testCases);
  }
}
```

#### 10.1.2 Business Impact Metrics
- **Market Coverage**: Geographic diversity in top-scoring hexagons
- **Audience Reach**: Total population within high-scoring areas
- **Revenue Potential**: Estimated box office/streaming revenue by region
- **ROI Optimization**: Marketing spend efficiency by market tier

### 10.2 Implementation Tracking

#### 10.2.1 Real-Time Performance Monitoring
```typescript
export class PerformanceMonitor {
  private metrics = {
    query_response_time: new Histogram(),
    hexagon_calculation_time: new Histogram(),
    data_quality_score: new Gauge(),
    user_satisfaction: new Counter()
  };
  
  trackAnalysisPerformance(analysisId: string, metrics: AnalysisMetrics): void {
    this.metrics.query_response_time.observe(metrics.responseTime);
    this.metrics.hexagon_calculation_time.observe(metrics.calculationTime);
    this.metrics.data_quality_score.set(metrics.dataQuality);
  }
}
```

#### 10.2.2 Business Validation Framework
```typescript
export class BusinessValidationService {
  async validateMarketPredictions(timeframe: string): Promise<ValidationReport> {
    return {
      actual_vs_predicted_engagement: await this.compareEngagementRates(timeframe),
      revenue_correlation: await this.analyzeRevenueCorrelation(timeframe),
      word_of_mouth_propagation: await this.trackSocialMediaEngagement(timeframe),
      market_penetration_rates: await this.calculatePenetrationRates(timeframe)
    };
  }
}
```

---

## 11. Future Enhancements & Roadmap

### 11.1 Advanced Analytics Features

#### 11.1.1 Machine Learning Integration
- **Predictive Modeling**: XGBoost models for market success prediction
- **Clustering Analysis**: K-means clustering for market segmentation
- **Time Series Forecasting**: Seasonal analysis for optimal release timing
- **Sentiment Analysis**: Social media sentiment tracking for The Doors

#### 11.1.2 Real-Time Data Integration
- **Streaming Analytics**: Real-time social media monitoring
- **Dynamic Scoring**: Live updates based on current events/trends
- **Competitive Intelligence**: Monitoring of competing entertainment releases
- **Weather Integration**: Climate impact on venue attendance patterns

### 11.2 Platform Extensions

#### 11.2.1 Multi-Documentary Support
- **Template System**: Configurable analysis for different music documentaries
- **Comparative Analysis**: Side-by-side comparison of multiple releases
- **Genre Specialization**: Specialized algorithms for different music genres
- **Historical Analysis**: Trend analysis across multiple documentary releases

#### 11.2.2 Industry Integration
- **Distribution Partner APIs**: Direct integration with streaming platforms
- **Venue Booking Systems**: API connections for direct venue booking
- **Marketing Automation**: Automated campaign creation for high-scoring markets
- **Revenue Optimization**: Dynamic pricing recommendations by market tier

---

## 12. Conclusion

This implementation plan provides a comprehensive framework for extending the MPIQ AI Chat platform to support specialized entertainment industry analysis. By leveraging the existing configuration-driven architecture and adding entertainment-specific components, we can create a powerful tool for optimizing The Doors documentary distribution strategy.

The hexagonal grid approach, combined with sophisticated composite scoring algorithms, will provide unprecedented insights into market opportunities for music documentaries. The integration with existing MPIQ capabilities ensures scalability and maintainability while delivering actionable business intelligence for entertainment industry decision-making.

**Next Steps:**
1. Review and approve implementation plan
2. Begin Phase 1 development with architecture setup
3. Establish data partnerships with music industry providers
4. Initiate testing framework development

**Contact Information:**
- Technical Lead: [To be assigned]
- Project Manager: [To be assigned]  
- Data Science Lead: [To be assigned]

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Status: Planning Phase - Awaiting Approval*