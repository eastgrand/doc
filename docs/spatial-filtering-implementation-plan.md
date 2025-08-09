# Spatial Filtering Implementation Plan
## Feature ID-Based Geographic Constraint System

**Created**: December 2024  
**Status**: Planning Phase  
**Approach**: Option B - Direct Layer Query

---

## Executive Summary

This document outlines the implementation plan for adding spatial filtering capabilities to the unified analysis workflow. When users select specific areas or apply buffers, the system will constrain analysis and visualization to only the features within the selected geometry.

## Problem Statement

Currently, when users:
- Select specific areas using drawing tools
- Apply buffers (radius, drive-time, walk-time) to points
- Choose specific geographic regions

The analysis still processes the **entire dataset** instead of being constrained to the selected geography. This leads to:
- Incorrect analysis results that don't reflect the user's area of interest
- Misleading visualizations showing data outside the selected area
- Clustering that includes features beyond the selection boundary
- Performance issues processing unnecessary data

## Solution Overview

### Approach: Direct Layer Query (Option B)

We will leverage the existing ArcGIS spatial query infrastructure to:
1. Query feature IDs within the selected geometry using existing feature layers
2. Pass these IDs through the analysis pipeline
3. Filter the cached dataset to only include matching features
4. Apply clustering and visualization to the filtered dataset

### Why Option B?

- **Uses proven infrastructure**: ArcGIS spatial queries are battle-tested
- **Efficient**: Only queries feature IDs, not full geometry/attributes
- **Compatible**: Works with existing layer configuration in `layers.ts`
- **Scalable**: Handles large geometries and datasets well

## Technical Architecture

### Data Flow

```
User Selection → Geometry → Spatial Query → Feature IDs → 
→ Analysis Filter → Clustering → Visualization
```

### Key Components

1. **SpatialFilterService** (New)
   - Executes spatial queries against feature layers
   - Returns feature IDs within geometry
   - Handles different spatial relationships (intersects/contains)

2. **UnifiedAnalysisWrapper** (Modified)
   - Captures view and layer ID from workflow
   - Calls SpatialFilterService before analysis
   - Passes feature IDs to AnalysisEngine

3. **AnalysisEngine** (Modified)
   - Accepts spatialFilterIds in options
   - Passes to DataProcessor

4. **DataProcessor** (Modified)
   - Filters raw results by feature IDs
   - Applies before any other processing

## Configuration Strategy

### Dynamic Layer Selection

The system uses a flexible approach to identify the reference layer for spatial queries:

1. **Explicit Configuration** (Recommended)
   - Add `SPATIAL_REFERENCE_LAYER_ID` constant to `layers.ts`
   - Or use `layerMetadata.spatialReferenceLayer`

2. **Layer Metadata Approach**
   - Add `isSpatialReference: true` to the appropriate layer config
   - System automatically finds marked layer

3. **Automatic Detection**
   - System can use first available feature layer
   - Logs warning to encourage explicit configuration

### Example Configuration

```typescript
// In layers.ts - Option 1: Simple constant
export const SPATIAL_REFERENCE_LAYER_ID = 'Unknown_Service_layer_0';

// Option 2: Metadata object
export const layerMetadata = {
  spatialReferenceLayer: 'Unknown_Service_layer_0',
  primaryDataLayer: 'Unknown_Service_layer_0',
};

// Option 3: Layer property
const baseLayerConfigs = [
  {
    id: 'Unknown_Service_layer_0',
    // ... other config
    isSpatialReference: true,  // Mark this as the reference layer
    hasCompleteGeometry: true,  // Has all ZIP codes/areas
  },
  // ... other layers
];
```

## Implementation Details

### Phase 1: Create Spatial Filter Service

**File**: `/lib/spatial/SpatialFilterService.ts`

```typescript
import Query from "@arcgis/core/rest/support/Query";

export interface SpatialFilterOptions {
  spatialRelationship?: "intersects" | "contains" | "within";
  useCache?: boolean;
  includeAttributes?: string[];
}

export class SpatialFilterService {
  private static cache = new Map<string, string[]>();

  /**
   * Query feature IDs within a given geometry
   */
  static async queryFeaturesByGeometry(
    view: __esri.MapView,
    geometry: __esri.Geometry,
    layerId: string,
    options: SpatialFilterOptions = {}
  ): Promise<string[]> {
    const {
      spatialRelationship = "intersects",
      useCache = true,
      includeAttributes = []
    } = options;

    // Check cache
    const cacheKey = `${layerId}-${JSON.stringify(geometry.toJSON())}-${spatialRelationship}`;
    if (useCache && this.cache.has(cacheKey)) {
      console.log('[SpatialFilter] Using cached results');
      return this.cache.get(cacheKey)!;
    }

    // Find the layer - try multiple strategies
    let layer = view.map.layers.find(l => l.id === layerId) as __esri.FeatureLayer;
    
    if (!layer) {
      // Strategy 1: Check if it's in the layers config
      const layerConfig = Object.values(layers).find(l => l.id === layerId);
      if (!layerConfig) {
        console.warn(`[SpatialFilter] Layer ${layerId} not found in map or config`);
        throw new Error(`Layer ${layerId} not found`);
      }
      
      // Strategy 2: Create a temporary feature layer for the query
      console.log('[SpatialFilter] Creating temporary layer for spatial query:', layerId);
      const FeatureLayer = (await import("@arcgis/core/layers/FeatureLayer")).default;
      layer = new FeatureLayer({
        url: layerConfig.url,
        outFields: ["*"]
      });
      
      // Wait for layer to load
      await layer.load();
    }

    // Create spatial query
    const query = layer.createQuery();
    query.geometry = geometry;
    query.spatialRelationship = spatialRelationship as any;
    query.outFields = [layer.objectIdField, ...includeAttributes];
    query.returnGeometry = false;
    query.maxRecordCount = 5000; // Handle large selections

    console.log('[SpatialFilter] Executing spatial query:', {
      layerId,
      geometryType: geometry.type,
      spatialRelationship,
      outFields: query.outFields
    });

    // Execute query
    const result = await layer.queryFeatures(query);
    const featureIds = result.features.map(f => 
      String(f.attributes[layer.objectIdField] || f.attributes.ID || f.attributes.id)
    );

    console.log(`[SpatialFilter] Found ${featureIds.length} features`);

    // Cache results
    if (useCache) {
      this.cache.set(cacheKey, featureIds);
    }

    return featureIds;
  }

  /**
   * Clear the cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size;
  }
}
```

### Phase 2: Update Type Definitions

**File**: `/lib/analysis/types.ts`

Add to `AnalysisOptions` interface:

```typescript
export interface AnalysisOptions {
  endpoint?: string;
  targetVariable?: string;
  sampleSize?: number;
  forceRefresh?: boolean;
  visualizationType?: string;
  
  // Clustering options
  clusterConfig?: ClusterConfig;
  
  // Spatial filtering options (NEW)
  spatialFilterIds?: string[];      // Feature IDs to include
  spatialFilterGeometry?: any;      // Original geometry for reference
  spatialFilterMethod?: string;     // How geometry was selected
  
  // Multi-endpoint options
  endpoints?: string[];
  // ... rest of existing fields
}
```

### Phase 3: Update UnifiedAnalysisWrapper

**File**: `/components/unified-analysis/UnifiedAnalysisWrapper.tsx`

```typescript
import { SpatialFilterService } from '@/lib/spatial/SpatialFilterService';

export interface UnifiedAnalysisRequest {
  // ... existing fields
  view?: __esri.MapView;           // NEW: Need view for spatial queries
  dataSourceLayerId?: string;      // NEW: Layer ID for spatial queries
}

export class UnifiedAnalysisWrapper {
  private async processQueryAnalysis(request: UnifiedAnalysisRequest): Promise<AnalysisResult> {
    if (!request.query) {
      throw new Error('Query is required for query analysis');
    }
    
    // NEW: Get feature IDs within geometry if geometry is provided
    let spatialFilterIds: string[] | undefined;
    
    if (request.geometry && request.view && request.dataSourceLayerId) {
      try {
        console.log('[UnifiedAnalysisWrapper] Applying spatial filter');
        
        // Determine spatial relationship based on geometry type
        const spatialRelationship = request.geometry.type === 'point' 
          ? 'intersects'  // Points use intersects
          : 'contains';   // Polygons use contains (stricter)
        
        spatialFilterIds = await SpatialFilterService.queryFeaturesByGeometry(
          request.view,
          request.geometry,
          request.dataSourceLayerId,
          { spatialRelationship }
        );
        
        console.log(`[UnifiedAnalysisWrapper] Spatial filter found ${spatialFilterIds.length} features`);
        
        // If no features found in selection, warn user
        if (spatialFilterIds.length === 0) {
          console.warn('[UnifiedAnalysisWrapper] No features found in selected area');
          // Could throw error or return empty result
        }
      } catch (error) {
        console.error('[UnifiedAnalysisWrapper] Spatial filter failed:', error);
        // Continue without spatial filter on error
      }
    }
    
    const options: AnalysisOptions = {
      endpoint: request.endpoint,
      clusterConfig: request.clusterConfig,
      spatialFilterIds,                          // Pass feature IDs
      spatialFilterGeometry: request.geometry,   // Pass geometry for reference
      spatialFilterMethod: request.geometryMethod // Track how it was selected
    };
    
    return await this.analysisEngine.executeAnalysis(request.query, options);
  }
  
  // Similar updates for processInfographicAnalysis and processComprehensiveAnalysis
}
```

### Phase 4: Configure Reference Layer

**File**: `/config/layers.ts`

Add a designated reference layer configuration:

```typescript
// Add to the top of layers.ts
export const SPATIAL_REFERENCE_LAYER_ID = 'Unknown_Service_layer_0'; // Or whichever has all features

// Alternative: Add metadata to layer configs
export const layerMetadata = {
  spatialReferenceLayer: 'Unknown_Service_layer_0', // The layer with complete geometry coverage
  primaryDataLayer: 'Unknown_Service_layer_0',      // The main data layer
};

// Or add to each layer config
export interface LayerConfig {
  // ... existing fields
  isSpatialReference?: boolean;  // Mark which layer to use for spatial queries
  hasCompleteGeometry?: boolean; // Indicates if this layer has all geographic features
}
```

**File**: `/lib/spatial/SpatialFilterConfig.ts`

Create a configuration module for spatial filtering:

```typescript
import { layers, layerMetadata } from '@/config/layers';

export class SpatialFilterConfig {
  /**
   * Get the reference layer ID for spatial queries
   * This layer should contain all geographic features (ZIP codes, areas, etc.)
   */
  static getReferenceLayerId(): string {
    // Option 1: Use configured metadata
    if (layerMetadata?.spatialReferenceLayer) {
      return layerMetadata.spatialReferenceLayer;
    }
    
    // Option 2: Find layer marked as spatial reference
    const referenceLayer = Object.values(layers).find(layer => 
      layer.isSpatialReference || layer.hasCompleteGeometry
    );
    if (referenceLayer) {
      return referenceLayer.id;
    }
    
    // Option 3: Use first available layer as fallback
    const firstLayer = Object.values(layers)[0];
    if (firstLayer) {
      console.warn('[SpatialFilterConfig] No reference layer configured, using first available:', firstLayer.id);
      return firstLayer.id;
    }
    
    throw new Error('No spatial reference layer available');
  }
  
  /**
   * Get the layer configuration for spatial queries
   */
  static getReferenceLayerConfig(): LayerConfig | null {
    const layerId = this.getReferenceLayerId();
    return layers[layerId] || null;
  }
  
  /**
   * Validate that a layer can be used for spatial queries
   */
  static validateReferenceLayer(layerId: string): boolean {
    const layer = layers[layerId];
    if (!layer) return false;
    
    // Check if layer has required properties
    return !!(layer.url && layer.type === 'feature');
  }
}
```

### Phase 5: Update UnifiedAnalysisWorkflow

**File**: `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`

```typescript
import { SpatialFilterConfig } from '@/lib/spatial/SpatialFilterConfig';

// In handleAnalysisTypeSelected function
const handleAnalysisTypeSelected = useCallback(async (type: 'query' | 'infographic' | 'comprehensive') => {
  if (!workflowState.areaSelection) {
    setWorkflowState(prev => ({
      ...prev,
      error: 'Please select an area first'
    }));
    return;
  }

  setWorkflowState(prev => ({
    ...prev,
    analysisType: type,
    isProcessing: true,
    error: undefined
  }));

  try {
    // Dynamically get the reference layer ID
    const dataSourceLayerId = SpatialFilterConfig.getReferenceLayerId();
    
    // Log the configuration for debugging
    console.log('[UnifiedWorkflow] Using spatial reference layer:', {
      layerId: dataSourceLayerId,
      geometryType: workflowState.areaSelection.geometry?.type,
      method: workflowState.areaSelection.method
    });
    
    // Skip spatial filtering for project-wide analysis
    const shouldApplySpatialFilter = workflowState.areaSelection.method !== 'project-area';
    
    // Prepare analysis request with view and layer ID
    const request: UnifiedAnalysisRequest = {
      geometry: shouldApplySpatialFilter ? workflowState.areaSelection.geometry : undefined,
      geometryMethod: workflowState.areaSelection.method,
      analysisType: type,
      query: type === 'query' ? selectedQuery : undefined,
      endpoint: type === 'query' ? selectedEndpoint : undefined,
      infographicType: type === 'infographic' ? selectedInfographicType : undefined,
      includeChat: enableChat,
      clusterConfig: type === 'query' && clusterConfig.enabled ? clusterConfig : undefined,
      view: view,                          // NEW: Pass the map view
      dataSourceLayerId: dataSourceLayerId // NEW: Pass the layer ID
    };

    console.log('[UnifiedWorkflow] Starting analysis with spatial context:', {
      hasGeometry: !!request.geometry,
      geometryType: request.geometry?.type,
      hasView: !!request.view,
      layerId: request.dataSourceLayerId
    });

    // Execute analysis
    const result = await analysisWrapper.processUnifiedRequest(request);
    
    // ... rest of existing code
  } catch (error) {
    // ... error handling
  }
}, [/* ... dependencies ... */]);
```

### Phase 5: Update AnalysisEngine

**File**: `/lib/analysis/AnalysisEngine.ts`

```typescript
async executeAnalysis(query: string, options: AnalysisOptions = {}): Promise<AnalysisResult> {
  // ... existing code ...
  
  // Pass spatial filter IDs to data processor
  const processedData = await this.dataProcessor.processResultsWithGeographicAnalysis(
    analysisData, 
    selectedEndpoint, 
    query,
    options.spatialFilterIds  // NEW: Pass spatial filter IDs
  );
  
  // Log spatial filtering impact
  if (options.spatialFilterIds) {
    console.log('[AnalysisEngine] Spatial filtering applied:', {
      requestedFeatures: options.spatialFilterIds.length,
      resultFeatures: processedData.records?.length || 0,
      filterRate: `${((processedData.records?.length || 0) / options.spatialFilterIds.length * 100).toFixed(1)}%`
    });
  }
  
  // ... rest of existing code ...
}
```

### Phase 6: Create ID Field Mapper

**File**: `/lib/spatial/IDFieldMapper.ts`

```typescript
/**
 * Maps between different ID field naming conventions
 * Different layers and datasets may use different field names for the same ID
 */
export class IDFieldMapper {
  // Common ID field names in order of preference
  private static readonly ID_FIELD_NAMES = [
    'OBJECTID',
    'ObjectId', 
    'objectid',
    'ID',
    'id',
    'FID',
    'fid',
    'feature_id',
    'zip_code',
    'ZIP',
    'GEOID'
  ];

  /**
   * Extract ID from a record using various field name conventions
   */
  static extractId(record: any): string | null {
    if (!record) return null;
    
    // Try each possible field name
    for (const fieldName of this.ID_FIELD_NAMES) {
      if (record[fieldName] !== undefined && record[fieldName] !== null) {
        return String(record[fieldName]);
      }
    }
    
    // Log warning if no ID found
    console.warn('[IDFieldMapper] No ID field found in record:', Object.keys(record).slice(0, 10));
    return null;
  }

  /**
   * Find the ID field name used in a layer
   */
  static findIdFieldName(sampleRecord: any): string | null {
    if (!sampleRecord) return null;
    
    for (const fieldName of this.ID_FIELD_NAMES) {
      if (fieldName in sampleRecord) {
        return fieldName;
      }
    }
    
    return null;
  }

  /**
   * Create a mapping between spatial query IDs and dataset IDs
   * This handles cases where the reference layer uses different IDs than the analysis dataset
   */
  static async createIdMapping(
    spatialIds: string[],
    datasetRecords: any[]
  ): Promise<Map<string, string>> {
    const mapping = new Map<string, string>();
    
    // If IDs match directly, use them
    const spatialIdSet = new Set(spatialIds);
    
    for (const record of datasetRecords) {
      const recordId = this.extractId(record);
      if (recordId && spatialIdSet.has(recordId)) {
        mapping.set(recordId, recordId);
      }
    }
    
    // If we found matches, return the mapping
    if (mapping.size > 0) {
      console.log(`[IDFieldMapper] Direct ID mapping: ${mapping.size}/${spatialIds.length} matches`);
      return mapping;
    }
    
    // If no direct matches, try alternative matching strategies
    // For example, matching by ZIP code or geographic attributes
    console.warn('[IDFieldMapper] No direct ID matches found, may need alternative matching strategy');
    
    return mapping;
  }
}
```

### Phase 7: Update DataProcessor

**File**: `/lib/analysis/DataProcessor.ts`

```typescript
import { IDFieldMapper } from '@/lib/spatial/IDFieldMapper';

async processResultsWithGeographicAnalysis(
  rawResults: RawAnalysisResult, 
  endpoint: string, 
  query: string = '',
  spatialFilterIds?: string[]  // NEW parameter
): Promise<ProcessedAnalysisData & { geoAnalysis?: any }> {
  
  let filteredRawResults = rawResults;
  let spatialFilterApplied = false;
  
  // Apply spatial filtering FIRST if feature IDs provided
  if (spatialFilterIds && spatialFilterIds.length > 0) {
    console.log(`[DataProcessor] Applying spatial filter: ${spatialFilterIds.length} allowed features`);
    
    const idSet = new Set(spatialFilterIds.map(id => String(id)));
    const originalCount = rawResults.results?.length || 0;
    
    // Use IDFieldMapper for flexible ID extraction
    filteredRawResults = {
      ...rawResults,
      results: rawResults.results?.filter(record => {
        const recordId = IDFieldMapper.extractId(record);
        if (!recordId) {
          console.warn('[DataProcessor] Record has no identifiable ID:', record);
          return false;
        }
        return idSet.has(recordId);
      }) || []
    };
    
    const filteredCount = filteredRawResults.results?.length || 0;
    spatialFilterApplied = true;
    
    console.log(`[DataProcessor] Spatial filter applied:`, {
      originalRecords: originalCount,
      filteredRecords: filteredCount,
      retainedPercentage: originalCount > 0 ? `${(filteredCount / originalCount * 100).toFixed(1)}%` : '0%',
      matchedIds: filteredCount
    });
    
    // Warn if very few matches
    if (filteredCount === 0) {
      console.error('[DataProcessor] No records matched spatial filter!');
    } else if (filteredCount < spatialFilterIds.length * 0.5) {
      console.warn(`[DataProcessor] Low match rate: ${filteredCount}/${spatialFilterIds.length} IDs matched`);
    }
  }
  
  // Continue with existing geographic analysis on filtered data
  let geoResult: any = null;
  
  // For comparative analysis with geographic queries, filter BEFORE processing
  if (endpoint === '/comparative-analysis' && this.isGeographicComparativeQuery(query, endpoint)) {
    // ... existing geo-awareness code ...
    // This now operates on already spatially-filtered data
  }
  
  // ... rest of existing processing ...
  
  // Add spatial filter metadata to result
  const processedData = this.processResults(filteredRawResults, endpoint);
  
  if (spatialFilterApplied) {
    processedData.metadata = {
      ...processedData.metadata,
      spatialFilterApplied: true,
      spatialFilterCount: spatialFilterIds?.length || 0
    };
  }
  
  return {
    ...processedData,
    geoAnalysis: geoResult
  };
}
```

## Testing Strategy

### Unit Tests

1. **SpatialFilterService Tests**
   - Test spatial query with point geometry
   - Test spatial query with polygon geometry
   - Test cache functionality
   - Test error handling for missing layers

2. **DataProcessor Tests**
   - Test filtering with valid IDs
   - Test filtering with no matches
   - Test filtering with mixed ID formats

### Integration Tests

1. **End-to-End Workflow**
   - Draw polygon → Execute analysis → Verify filtered results
   - Create buffer → Execute analysis → Verify buffer constraint
   - Select multiple features → Execute analysis → Verify union

2. **Performance Tests**
   - Large geometry selection (1000+ features)
   - Complex polygon with many vertices
   - Multiple sequential analyses with same geometry

### Manual Testing Checklist

- [ ] Draw rectangle and verify analysis only includes contained features
- [ ] Draw polygon and verify correct spatial filtering
- [ ] Create point with radius buffer and verify circular constraint
- [ ] Select "Entire Project Area" and verify no filtering applied
- [ ] Test with each analysis type (query, infographic, comprehensive)
- [ ] Verify clustering only operates on filtered features
- [ ] Verify visualization extent focuses on selected area
- [ ] Test performance with large selections

## Performance Considerations

### Optimizations

1. **Query Optimization**
   - Only request object IDs, not full attributes
   - Set `returnGeometry: false` for ID queries
   - Use `maxRecordCount` to handle large results

2. **Caching Strategy**
   - Cache spatial query results by geometry + layer
   - Clear cache on significant data updates
   - Consider TTL for cache entries

3. **Progressive Loading**
   - For very large selections (>1000 features), consider chunking
   - Show progress indicator during spatial query

### Performance Targets

- Spatial query: < 500ms for typical polygon
- Feature filtering: < 100ms for 1000 features
- Total overhead: < 1 second for typical workflow

## Rollout Plan

### Phase 1: Core Implementation (Week 1)
- Implement SpatialFilterService
- Update type definitions
- Basic integration with UnifiedAnalysisWrapper

### Phase 2: Pipeline Integration (Week 1-2)
- Update AnalysisEngine
- Update DataProcessor
- Test with query analysis

### Phase 3: Full Integration (Week 2)
- Update all analysis types
- Integrate with clustering
- Update visualizations

### Phase 4: Testing & Refinement (Week 2-3)
- Comprehensive testing
- Performance optimization
- Bug fixes

### Phase 5: Documentation & Deployment (Week 3)
- Update user documentation
- Create developer guides
- Production deployment

## Success Metrics

1. **Functional Success**
   - ✅ All analysis types respect spatial constraints
   - ✅ Clustering only includes filtered features
   - ✅ Visualizations show correct geographic extent

2. **Performance Success**
   - ✅ < 1 second overhead for spatial filtering
   - ✅ Handles selections up to 5000 features
   - ✅ No memory leaks from caching

3. **User Experience Success**
   - ✅ Clear feedback on number of features selected
   - ✅ Intuitive behavior matching user expectations
   - ✅ No confusion about what data is being analyzed

## Risk Mitigation

### Risk 1: Layer ID Mismatch
**Mitigation**: Implement fallback to search layers by URL pattern

### Risk 2: Large Geometry Performance
**Mitigation**: Implement result pagination and progress indicators

### Risk 3: ID Field Variations
**Mitigation**: Check multiple common ID field names (ID, OBJECTID, id, etc.)

### Risk 4: Cache Memory Growth
**Mitigation**: Implement cache size limits and TTL

## Future Enhancements

1. **Advanced Spatial Relationships**
   - Support for "within distance" queries
   - Custom spatial relationships
   - Multiple geometry selection

2. **Performance Improvements**
   - Server-side spatial indexing
   - Geometry simplification for complex shapes
   - Parallel spatial queries

3. **User Experience**
   - Visual preview of selected features
   - Selection statistics before analysis
   - Undo/redo for selections

## Appendix

### Related Files
- `/components/unified-analysis/UnifiedAnalysisWorkflow.tsx`
- `/components/unified-analysis/UnifiedAnalysisWrapper.tsx`
- `/lib/analysis/AnalysisEngine.ts`
- `/lib/analysis/DataProcessor.ts`
- `/lib/analysis/types.ts`
- `/config/layers.ts`

### References
- [ArcGIS Spatial Queries Documentation](https://developers.arcgis.com/javascript/latest/api-reference/esri-rest-support-Query.html)
- [Feature Layer Query Methods](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-FeatureLayer.html#queryFeatures)
- Existing implementation: `/components/SpatialQuery/SpatialQueryTools.tsx`

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Development Team  
**Status**: Ready for Implementation