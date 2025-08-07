# Comprehensive Data Sources Documentation

This document catalogs ALL data sources used throughout the MPIQ AI Chat system, including widgets, components, services, and configurations beyond the main query-to-visualization flow.

## Table of Contents

1. [Primary Analysis Data](#primary-analysis-data)
2. [Layer Configuration Data](#layer-configuration-data)
3. [Widget Data Sources](#widget-data-sources)
4. [External Service Integration](#external-service-integration)
5. [Component Configuration Data](#component-configuration-data)
6. [Hardcoded Data and Constants](#hardcoded-data-and-constants)
7. [Migration Impact Matrix](#migration-impact-matrix)

## Primary Analysis Data

### Endpoint Data (Main Analysis Pipeline)
**Source**: Vercel Blob Storage + Local Fallbacks
**Configuration**: `public/data/blob-urls.json`
**Local Fallbacks**: `public/data/endpoints/*.json`

**Files (19 endpoints)**:
- `strategic-analysis.json` - Strategic market analysis
- `competitive-analysis.json` - Brand competition data
- `comparative-analysis.json` - Geographic comparisons
- `demographic-insights.json` - Population demographics
- `correlation-analysis.json` - Statistical correlations
- `trend-analysis.json` - Temporal trends
- `spatial-clusters.json` - Geographic clustering
- `anomaly-detection.json` - Statistical outliers
- `predictive-modeling.json` - Forecasting data
- `scenario-analysis.json` - What-if scenarios
- `segment-profiling.json` - Market segments
- `sensitivity-analysis.json` - Parameter sensitivity
- `feature-interactions.json` - Variable interactions
- `feature-importance-ranking.json` - Feature rankings
- `model-performance.json` - ML model metrics
- `outlier-detection.json` - Data outliers
- `analyze.json` - General analysis
- `brand-difference.json` - Brand differential analysis

### Field Metadata
**Source**: `public/data/microservice-all-fields.json`
**Purpose**: Defines available fields for analysis (548 fields)
**Used By**: DataProcessors, ConfigurationManager, Field validation

## Layer Configuration Data

### ArcGIS Feature Services (Map Layers)
**Source**: `config/layers.ts`
**Count**: 50+ layer definitions
**Base URL Pattern**: `https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/{layerId}`

**Layer Categories**:
- **Population Data**: Demographics, age, household data
- **Economic Data**: Income, disposable income, spending patterns
- **Brand Data**: Nike, Adidas, sports brand market share
- **Geographic Data**: ZIP codes, boundaries, regions
- **Behavioral Data**: Consumer patterns, brand preferences

**Key Layers**:
```typescript
{
  id: 'Synapse54_Vetements_layers_layer_8',
  name: '2024 Total Population Zips',
  url: 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/8'
}
```

### Default Map Layer
**Source**: `components/tabs/AITab.tsx`
**Default Service**: 
```
https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Vetements_layers/FeatureServer/39
```

## Widget Data Sources

### Layer List Widget
**Component**: `components/LayerController/LayerController.tsx`
**Data Sources**:
- Layer configurations from `config/layers.ts`
- Dynamic layer states from map view
- Legend data from layer renderers
- Layer metadata and field information

**Dependencies**:
- `types/layers.ts` - Layer type definitions
- ArcGIS Feature Services for layer data
- Project configuration for layer groups

### Analysis Endpoint Selector Widget
**Component**: `components/analysis/AnalysisEndpointSelector.tsx`
**Data Sources**:
- Hardcoded endpoint categories and descriptions
- Endpoint complexity mappings
- Icon mappings for different analysis types

**Hardcoded Configurations**:
```typescript
const COMPLEXITY_MAPPING = {
  '/competitive-analysis': 'moderate',
  '/demographic-insights': 'moderate',
  '/strategic-analysis': 'advanced'
};
```

### Clustering Configuration Panel
**Component**: `components/clustering/ClusterConfigPanel.tsx`
**Data Sources**:
- Supported clustering endpoints list
- Clustering algorithm parameters
- Geographic constraint data

### Project Configuration Widgets
**Components**: 
- `components/ProjectConfigManager/ProjectPreview.tsx`
- `components/ProjectConfigManager/LayerConfigurationEditor.tsx`
- `components/ProjectConfigManager/ConceptMappingEditor.tsx`

**Data Sources**:
- Layer configurations
- Concept mapping definitions
- Microservice field mappings

## External Service Integration

### Google Trends Service
**Component**: `utils/services/google-trends-service.ts`
**Purpose**: Integrates Google search trend data with geographic analysis
**Data Sources**:
- Google Trends API (external)
- Layer configuration for trend correlation
- Cached trend data (1-hour TTL)

**Used By**:
- Trend analysis processors
- Competitive analysis features
- Consumer interest mapping

### ArcGIS Services
**Purpose**: Map rendering, geocoding, routing
**Services Used**:
- Feature Services (data layers)
- Map Services (basemaps)
- Geocoding Service (address search)
- Routing Service (service areas, drive times)

**Locations**:
- `components/tabs/InfographicsTab.tsx`: Route analysis, service areas
- `components/tabs/ReportsTab.tsx`: Geographic analysis
- Multiple layer configurations in `config/layers.ts`

## Component Configuration Data

### Geospatial Chat Interface
**Component**: `components/geospatial-chat-interface.tsx`
**Hardcoded Data**:
- Endpoint display names mapping
- Clustering-supported endpoints list
- Default feature importance weights by endpoint
- Analysis type categorization

```typescript
const endpointDisplayNames = {
  '/competitive-analysis': 'Brand Competition',
  '/demographic-insights': 'Demographic Analysis',
  '/strategic-analysis': 'Strategic Analysis'
};

const defaultFeatureImportance = {
  'strategic-analysis': [
    { feature: 'nike_market_share', importance: 0.85 },
    { feature: 'adidas_market_share', importance: 0.76 }
  ]
};
```

### Concept Mapping
**Source**: `config/layers.ts`
**Purpose**: Maps natural language terms to data concepts
**Data**: Term weights and categories for query understanding

```typescript
const concepts = {
  brands: {
    terms: ['Nike', 'Adidas', 'Jordan', 'Converse'],
    weight: 25
  },
  sports: {
    terms: ['sports', 'athletic', 'NBA', 'NFL'],
    weight: 20
  }
};
```

### Analysis Configuration
**Source**: `lib/analysis/ConfigurationManager.ts`
**Purpose**: Maps endpoints to target variables and scoring fields
**Critical Data**:
- Target variable mappings per endpoint
- Required fields for validation
- Score calculation configurations

## Hardcoded Data and Constants

### Field Priority Mappings
**Location**: `lib/geo/GeoAwarenessEngine.ts`
```typescript
private fieldPriorities = {
  zipCode: ['ZIP_CODE', 'FSA_ID', 'ID', 'geo_id'],
  description: ['DESCRIPTION', 'area_name', 'name'],
  city: ['city', 'admin2_name', 'admin4_name']
};
```

### Geographic Data
**Location**: `lib/geo/GeoDataManager.ts`
**Data**: Hardcoded city/ZIP code mappings for tri-state area
- 50+ cities with specific ZIP codes
- State abbreviation mappings
- Geographic hierarchies
- Metro area definitions

### Visualization Mappings
**Location**: `config/visualization-mapping.ts`
**Purpose**: Maps analysis types to visualization renderers
**Data**: Renderer configurations, color schemes, legend formats

### Chat Constants
**Locations**: `components/chat/chat-constants.ts`
**Data**: System prompts, response templates, analysis instructions

## Migration Impact Matrix

### High Impact (Critical - Must Update)

| Component | Data Source | Migration Requirement | Risk Level |
|-----------|------------|----------------------|------------|
| Endpoint Data | `blob-urls.json` + endpoints/*.json | Replace all 19 endpoint files | **Critical** |
| Field Mappings | `microservice-all-fields.json` | Update field definitions | **Critical** |
| Layer Configuration | `config/layers.ts` | Update 50+ ArcGIS service URLs | **Critical** |
| Geographic Data | `lib/geo/GeoDataManager.ts` | Update city/ZIP mappings | **High** |
| Analysis Config | `ConfigurationManager.ts` | Update endpoint configurations | **High** |

### Medium Impact (Important - Should Update)

| Component | Data Source | Migration Requirement | Risk Level |
|-----------|------------|----------------------|------------|
| Concept Mapping | `config/layers.ts` | Update brand/term mappings | **Medium** |
| Default Layer | `AITab.tsx` | Update default service URL | **Medium** |
| Endpoint Selector | `AnalysisEndpointSelector.tsx` | Update endpoint categories | **Medium** |
| Chat Constants | `chat-constants.ts` | Update prompts/instructions | **Medium** |
| Field Priorities | `GeoAwarenessEngine.ts` | Update field name mappings | **Medium** |

### Low Impact (Optional - Context-Dependent)

| Component | Data Source | Migration Requirement | Risk Level |
|-----------|------------|----------------------|------------|
| Google Trends | External API | Update if using trends | **Low** |
| Visualization Config | `visualization-mapping.ts` | Update color schemes | **Low** |
| Feature Importance | `geospatial-chat-interface.tsx` | Update default weights | **Low** |
| Clustering Config | `ClusterConfigPanel.tsx` | Update if clustering changes | **Low** |

## Migration Checklist - All Data Sources

### Phase 1: Core Data (Must Complete)
- [ ] Replace 19 endpoint JSON files with new data
- [ ] Update `microservice-all-fields.json` with new field list
- [ ] Update `config/layers.ts` with new ArcGIS service URLs (50+ layers)
- [ ] Update `lib/geo/GeoDataManager.ts` with new geographic regions
- [ ] Update `ConfigurationManager.ts` endpoint configurations
- [ ] Update `blob-urls.json` with new Vercel Blob URLs

### Phase 2: Component Configuration (Recommended)
- [ ] Update concept mappings in `config/layers.ts`
- [ ] Update default layer URL in `components/tabs/AITab.tsx`
- [ ] Update endpoint categories in `AnalysisEndpointSelector.tsx`
- [ ] Update field priorities in `GeoAwarenessEngine.ts`
- [ ] Update chat prompts in `chat-constants.ts`
- [ ] Update hardcoded endpoint names in `geospatial-chat-interface.tsx`

### Phase 3: External Services (Context-Dependent)
- [ ] Update Google Trends integration if using trend data
- [ ] Update ArcGIS service URLs in `InfographicsTab.tsx`
- [ ] Update routing service URLs in `ReportsTab.tsx`
- [ ] Update visualization color schemes if needed
- [ ] Update feature importance defaults if field names change

### Phase 4: Testing All Components
- [ ] Test main query-to-visualization flow
- [ ] Test layer list widget functionality
- [ ] Test clustering configuration panel
- [ ] Test endpoint selector widget
- [ ] Test geographic filtering and city recognition
- [ ] Test infographics and reporting features
- [ ] Test external service integrations

## Data Update Scripts Needed

### Additional Scripts to Create

1. **Layer URL Updater**
```bash
# Script to update all ArcGIS service URLs in config/layers.ts
npm run update-layer-urls
```

2. **Concept Mapping Updater**
```bash
# Update concept mappings for new domain/brands
npm run update-concepts
```

3. **Component Configuration Validator**
```bash
# Validate all hardcoded configurations match new data
npm run validate-component-config
```

4. **External Service Tester**
```bash
# Test all external service integrations
npm run test-external-services
```

---

This comprehensive documentation ensures no data dependency is missed during migration, covering everything from the main analysis pipeline to individual widget configurations and external service integrations.