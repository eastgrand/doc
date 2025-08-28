# Data Migration Guide for New Projects

This guide provides comprehensive instructions for updating the MPIQ AI Chat system with new data sources for different projects. The system is designed to be data-agnostic, allowing for complete replacement of datasets while maintaining all analytical and visualization capabilities.

## Table of Contents

1. [Data Architecture Overview](#data-architecture-overview)
2. [Current Data Sources](#current-data-sources)
3. [Active vs Obsolete Files](#active-vs-obsolete-files)
4. [Migration Process](#migration-process)
5. [Field Configuration](#field-configuration)
6. [Geographic Data](#geographic-data)
7. [All Data Dependencies](#all-data-dependencies)
8. [Testing and Validation](#testing-and-validation)
9. [Future Improvements](#future-improvements)

## Data Architecture Overview

The system uses a three-tier data architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raw Data      │───▶│  Processed      │───▶│  Visualization  │
│   Sources       │    │  Endpoints      │    │  & Analysis     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                      │                      │
├─ CSV Files           ├─ JSON Endpoints     ├─ ChoroplethRenderer
├─ Microservice       ├─ Blob Storage       ├─ Data Processors
└─ Field Mappings     └─ Field Config       └─ Geographic Engine
```

### Data Flow

1. **Raw Data** → Microservice processing → **Endpoint JSON files**
2. **Endpoint Files** → Blob storage (for large files) → **Runtime loading**
3. **Runtime Data** → Processors → **Visualization**

## Current Data Sources

### Primary Data Files (ACTIVE - IN USE)

#### 1. Endpoint Data (Production)
**Location**: `public/data/blob-urls.json` + Vercel Blob Storage
**Usage**: Primary data source for all analysis
**Files**:
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

#### 2. Field Configuration (ACTIVE)
**Location**: `public/data/microservice-all-fields.json`
**Usage**: Defines available data fields and mappings
**Contains**: 548 fields from cleaned_data.csv

#### 3. Geographic Data (ACTIVE)
**Location**: `lib/geo/GeoDataManager.ts` (hardcoded)
**Usage**: City/ZIP code mappings for geo-awareness
**Contains**: 
- Tri-state area cities (NY, NJ, PA)
- ZIP code to city mappings
- Geographic hierarchies

### Local Endpoint Backups (BACKUP ONLY)
**Location**: `public/data/endpoints/`
**Status**: Fallback when blob storage fails
**Note**: May be outdated compared to blob storage

### Obsolete Files (UNUSED)
**Location**: Various
**Status**: Can be deleted safely
```
public/data/endpoints-original/     # Original unprocessed data
public/data/endpoints-deduplicated/ # Intermediate processing step
public/data/endpoints-nike-optimized/ # Brand-specific optimization
public/data/boundaries/             # Unused boundary files
public/data/locations/              # Empty directories
```

## Migration Process

### Phase 1: Data Preparation (CRITICAL)

#### Step 1.1: Prepare Raw Data
1. **Format Requirements**:
   - CSV format with consistent headers
   - Geographic identifier field (ZIP codes, FSA codes, or area IDs)
   - Numeric fields for analysis
   - At least 100-500 records for meaningful analysis

2. **Required Fields**:
   ```
   ID or GEOID          # Geographic identifier
   DESCRIPTION          # Human-readable area name
   [Analysis Fields]    # Numeric fields for analysis
   [Geographic Data]    # Optional: lat/lng, boundaries
   ```

#### Step 1.2: Generate Field Mappings
1. **Update field configuration**:
   ```bash
   # Update this file with your CSV headers
   public/data/microservice-all-fields.json
   ```

2. **Field structure**:
   ```json
   {
     "total_fields": 548,
     "source": "your_data.csv header",
     "extraction_date": "2025-01-15",
     "fields": [
       "ID",
       "DESCRIPTION", 
       "YOUR_FIELD_1",
       "YOUR_FIELD_2",
       // ... all your fields
     ]
   }
   ```

#### Step 1.3: Process Data into Endpoints
1. **Convert to endpoint format**:
   ```javascript
   {
     "success": true,
     "total_records": 1000,
     "results": [
       {
         "ID": "12345",           // Geographic identifier
         "DESCRIPTION": "Area Name",
         "field_1": 100.5,       // Your analysis fields
         "field_2": 75.2,
         // ... all your fields
       }
     ],
     "summary": "Analysis description",
     "feature_importance": [
       {"feature": "field_1", "importance": 0.85},
       {"feature": "field_2", "importance": 0.76}
     ]
   }
   ```

### Phase 2: Endpoint Configuration (REQUIRED)

#### Step 2.1: Update Endpoint Configurations
**Location**: `lib/analysis/ConfigurationManager.ts`

Each endpoint needs configuration:
```typescript
'/your-endpoint': {
  targetVariable: 'your_score_field',      // Main analysis field
  scoreFieldName: 'your_score_field',      // Same as targetVariable
  requiredFields: ['your_score_field'],    // Required for validation
  description: 'Your analysis description'
}
```

#### Step 2.2: Create Endpoint JSON Files
1. **Create one JSON file per analysis type**:
   - Strategic analysis (`strategic-analysis.json`)
   - Competitive analysis (`competitive-analysis.json`)
   - Demographics (`demographic-insights.json`)
   - Etc.

2. **Use the same data structure** but potentially different:
   - Field selections
   - Calculated scores
   - Feature importance rankings

### Phase 3: Data Upload (REQUIRED)

#### Step 3.1: Upload to Blob Storage
```bash
# Use the upload script for large files (>10MB)
npm run upload-endpoint -- strategic-analysis
npm run upload-endpoint -- competitive-analysis
# ... for each endpoint
```

#### Step 3.2: Update Blob URLs
**Location**: `public/data/blob-urls.json`
```json
{
  "strategic-analysis": "https://your-blob-url.com/strategic-analysis.json",
  "competitive-analysis": "https://your-blob-url.com/competitive-analysis.json"
  // ... all your endpoints
}
```

#### Step 3.3: Local Fallbacks
**Location**: `public/data/endpoints/`
1. Copy all endpoint JSON files here as fallbacks
2. Ensure filenames match exactly (e.g., `strategic-analysis.json`)

### Phase 4: Geographic Configuration (OPTIONAL)

#### If Your Data Uses Different Geographic Areas:

#### Step 4.1: Update GeoDataManager
**Location**: `lib/geo/GeoDataManager.ts`

1. **Replace city definitions**:
   ```typescript
   private loadYourRegionMetros(): void {
     const metros = [
       {
         name: 'Your City',
         aliases: ['City Alias', 'Short Name'],
         zipCodes: ['12345', '12346', '12347'] // Specific codes
       }
     ];
   }
   ```

2. **Update geographic hierarchy**:
   ```typescript
   private initializeDatabase(): void {
     this.loadStates();           // Update for your region
     this.loadYourRegionMetros(); // Your cities
     this.loadYourPointsOfInterest(); // Optional
   }
   ```

#### Step 4.2: Test Geographic Queries
1. Test city name recognition: "Show data for [Your City]"
2. Test ZIP code filtering: "Compare [City A] and [City B]"
3. Verify geographic boundaries in visualizations

## All Data Dependencies

⚠️ **IMPORTANT**: The main query-to-visualization pipeline is only ONE part of the system's data usage. 

### Complete Data Dependency List

The system uses data in many other places:

1. **Layer List Widget**: 50+ ArcGIS Feature Service URLs in `config/layers.ts`
2. **Map Components**: Hardcoded default layer URLs in various components
3. **Analysis Widgets**: Endpoint configurations and category mappings
4. **Geographic Services**: City/ZIP mappings, field name priorities
5. **External APIs**: Google Trends integration, ArcGIS services
6. **Component Configuration**: Hardcoded constants, concept mappings, chat prompts

**📖 For Complete Documentation**: See [MIGRATION_03_DATA_SOURCES.md](./MIGRATION_03_DATA_SOURCES.md)

This additional document catalogs ALL data sources including:
- 50+ ArcGIS layer configurations
- Widget data dependencies  
- External service integrations
- Hardcoded configurations in components
- Complete migration impact matrix

### Phase 5: Field Mappings (CRITICAL)

#### Step 5.1: Update Data Processors
**Location**: `lib/analysis/strategies/processors/`

Each processor may need field mapping updates:

```typescript
// In StrategicAnalysisProcessor.ts (example)
private extractStrategicScore(record: any): number {
  // Update field names to match your data
  return Number(record.your_strategic_field) || 
         Number(record.your_score_field) || 
         0;
}

private extractMetrics(record: any): any {
  return {
    population: Number(record.your_population_field) || 0,
    income: Number(record.your_income_field) || 0,
    // Map your fields here
  };
}
```

#### Step 5.2: Update Field Priorities
**Location**: `lib/geo/GeoAwarenessEngine.ts`
```typescript
private fieldPriorities = {
  zipCode: ['ID', 'GEOID', 'your_geo_field'],        // Your geo identifiers
  description: ['DESCRIPTION', 'your_name_field'],    // Area names
  // Update based on your field structure
};
```

## Field Configuration Details

### Current Nike-Specific Fields
The system currently uses Nike-specific market share fields:
- `mp30034a_b_p` - Nike market share
- `value_MP30029A_B_P` - Adidas market share
- `strategic_value_score` - Strategic scoring
- `competitive_advantage_score` - Competition metrics

### Generic Field Patterns
For new projects, use these naming patterns:
- `*_score` - Analysis scores (0-100)
- `*_value` - Raw values
- `*_percentage` - Percentage values (0-100)
- `*_rank` - Rankings (1-N)
- `*_index` - Index values

### Field Mapping Strategy
1. **Consistent naming**: Use consistent field naming across endpoints
2. **Score normalization**: Ensure scores are 0-100 scale
3. **Null handling**: Provide default values for missing data
4. **Data types**: Ensure numeric fields are properly typed

## Testing and Validation

### Step 1: Basic Data Loading
```bash
# Test endpoint loading
curl http://localhost:3000/api/test-endpoint/strategic-analysis
```

### Step 2: Query Testing
Test these query types:
1. **Basic analysis**: "Show me strategic analysis"
2. **Geographic**: "Compare [City A] and [City B]"
3. **Clustering**: "Show clusters in [Region]"
4. **Competitive**: "Where should we compete?"

### Step 3: Visualization Testing
1. **Choropleth maps**: Should show your geographic areas
2. **Color scales**: Should reflect your data ranges
3. **Tooltips**: Should show correct field values
4. **Legends**: Should match your data

### Step 4: End-to-End Testing
1. **Query processing**: From natural language to results
2. **Data filtering**: Geographic and attribute filtering
3. **Visualization rendering**: Maps, charts, summaries
4. **Analysis accuracy**: Verify calculations

## Migration Checklist

### Pre-Migration (Data Prep)
- [ ] Raw data in CSV format with consistent headers
- [ ] Geographic identifiers (ZIP codes, area IDs)
- [ ] At least 100+ records for analysis
- [ ] Numeric fields for scoring/analysis

### Data Configuration
- [ ] Updated `microservice-all-fields.json`
- [ ] Created endpoint JSON files (17 endpoints)
- [ ] Updated `ConfigurationManager.ts` endpoint configs
- [ ] Set up field mappings in processors

### Geographic Setup (if needed)
- [ ] Updated `GeoDataManager.ts` with your regions
- [ ] Updated `GeoAwarenessEngine.ts` field priorities
- [ ] Tested geographic query recognition

### Data Upload
- [ ] Uploaded large files to Vercel Blob Storage
- [ ] Updated `blob-urls.json` with new URLs
- [ ] Copied files to `public/data/endpoints/` as fallbacks
- [ ] Verified file accessibility

### Beyond Main Pipeline (See COMPREHENSIVE_DATA_SOURCES.md)
- [ ] Updated 50+ ArcGIS layer URLs in `config/layers.ts`
- [ ] Updated default layer URL in `components/tabs/AITab.tsx`
- [ ] Updated concept mappings for new domain terms
- [ ] Updated endpoint selector categories and descriptions
- [ ] Updated hardcoded component configurations
- [ ] Updated field priority mappings in `GeoAwarenessEngine.ts`
- [ ] Tested external service integrations (Google Trends, ArcGIS)

### Testing
- [ ] Basic query processing works
- [ ] Geographic filtering works
- [ ] Visualizations render correctly
- [ ] Analysis calculations are accurate
- [ ] **Layer list widget displays correctly**
- [ ] **Map layers load and render properly**
- [ ] **Analysis endpoint selector works**
- [ ] **Clustering configuration panel functions**
- [ ] **Geographic city/ZIP recognition works**
- [ ] Error handling works for missing data

## Future Improvements

### 1. Data Upload UI
**Recommended**: Build a web interface for data uploads
- File upload form with validation
- Automatic field mapping detection
- Blob storage integration
- Progress tracking

### 2. Configuration Generator
**Recommended**: Automated configuration generation
- CSV analysis to detect field types
- Automatic endpoint configuration
- Geographic data detection
- Field mapping suggestions

### 3. Data Validation Pipeline
**Recommended**: Automated data quality checks
- Field type validation
- Geographic identifier verification
- Score range validation
- Missing data detection

### 4. Version Management
**Recommended**: Data versioning system
- Track data updates
- Rollback capabilities
- A/B testing support
- Change impact analysis

## Troubleshooting

### Common Issues

#### 1. "No data found" errors
- Check blob URLs are accessible
- Verify local fallback files exist
- Check endpoint naming consistency

#### 2. Geographic queries not working
- Verify ZIP codes in `GeoDataManager.ts`
- Check field priorities in `GeoAwarenessEngine.ts`
- Test city name recognition

#### 3. Visualization rendering issues
- Check data field types (numbers vs strings)
- Verify geographic identifiers match boundary data
- Check color scale ranges

#### 4. Analysis errors
- Verify required fields exist in data
- Check field mappings in processors
- Ensure score fields are numeric

### Support Files

#### Log Files
- Check browser console for client-side errors
- Check server logs for data loading errors
- Monitor network requests for failed blob fetches

#### Debug Mode
Enable debug logging in:
- `CachedEndpointRouter.ts`
- `GeoAwarenessEngine.ts`
- Data processors

## Contact and Support

For technical issues during migration:
1. Check the troubleshooting section above
2. Review console logs for specific errors
3. Verify data format matches expected structure
4. Test with small data samples first

---

**Last Updated**: January 2025  
**Version**: 2.0  
**Compatibility**: Next.js 14, TypeScript 5+