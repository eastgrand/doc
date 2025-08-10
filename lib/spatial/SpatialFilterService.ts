import Query from "@arcgis/core/rest/support/Query";
import { layers } from '@/config/layers';

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

    // Ensure layer is fully loaded and has spatial reference info
    await layer.when();
    
    // Get layer's spatial reference
    const layerSpatialRef = layer.spatialReference || layer.fullExtent?.spatialReference;
    
    console.log('[SpatialFilter] Spatial reference info:', {
      queryGeometrySR: geometry.spatialReference?.wkid,
      layerSR: layerSpatialRef?.wkid,
      viewSR: view.spatialReference?.wkid
    });

    // Transform geometry to layer's spatial reference if needed
    let queryGeometry = geometry;
    if (layerSpatialRef && geometry.spatialReference?.wkid !== layerSpatialRef.wkid) {
      try {
        const projection = await import('@arcgis/core/geometry/projection');
        await projection.default.load();
        
        console.log(`[SpatialFilter] Projecting geometry from WKID ${geometry.spatialReference?.wkid} to ${layerSpatialRef.wkid}`);
        const projectedResult = projection.default.project(geometry as any, layerSpatialRef) as __esri.Geometry;
        
        if (projectedResult) {
          queryGeometry = projectedResult;
        } else {
          console.warn('[SpatialFilter] Geometry projection failed, using original geometry');
        }
      } catch (projectionError) {
        console.warn('[SpatialFilter] Projection error, using original geometry:', projectionError);
      }
    }

    // Create spatial query
    const query = layer.createQuery();
    query.geometry = queryGeometry;
    query.spatialRelationship = spatialRelationship as any;
    query.outFields = [layer.objectIdField, ...includeAttributes];
    query.returnGeometry = false;
    query.num = 5000; // Handle large selections

    console.log('[SpatialFilter] Executing spatial query:', {
      layerId,
      geometryType: queryGeometry.type,
      spatialRelationship,
      outFields: query.outFields,
      geometryExtent: queryGeometry.extent ? {
        xmin: queryGeometry.extent.xmin,
        ymin: queryGeometry.extent.ymin, 
        xmax: queryGeometry.extent.xmax,
        ymax: queryGeometry.extent.ymax
      } : null,
      projectionApplied: queryGeometry !== geometry
    });

    // Execute query
    const result = await layer.queryFeatures(query);
    const featureIds = result.features.map(f => 
      String(f.attributes[layer.objectIdField] || f.attributes.ID || f.attributes.id)
    );

    console.log(`[SpatialFilter] Found ${featureIds.length} features`);
    
    // If no features found, try a broader search for debugging
    if (featureIds.length === 0) {
      console.warn('[SpatialFilter] No features found, attempting diagnostic query...');
      
      try {
        // Try getting all features to check if layer has data
        const allFeaturesQuery = layer.createQuery();
        allFeaturesQuery.where = "1=1";
        allFeaturesQuery.returnGeometry = true; // Get geometry to check extent
        allFeaturesQuery.num = 3;
        const allResult = await layer.queryFeatures(allFeaturesQuery);
        
        console.log(`[SpatialFilter] Layer has ${allResult.features.length} sample features available`);
        
        // Log some sample feature locations for comparison
        if (allResult.features.length > 0) {
          const sampleGeometry = allResult.features[0].geometry;
          if (sampleGeometry?.extent) {
            console.log('[SpatialFilter] Sample feature extent:', {
              xmin: sampleGeometry.extent.xmin,
              ymin: sampleGeometry.extent.ymin,
              xmax: sampleGeometry.extent.xmax,
              ymax: sampleGeometry.extent.ymax
            });
          }
          
          // Get layer's full extent for context
          if (layer.fullExtent) {
            console.log('[SpatialFilter] Layer full extent:', {
              xmin: layer.fullExtent.xmin,
              ymin: layer.fullExtent.ymin,
              xmax: layer.fullExtent.xmax,
              ymax: layer.fullExtent.ymax
            });
          }
        }
        
        // TEST: Try querying with a known good extent within the layer coverage
        console.log('[SpatialFilter] Testing spatial query with known good extent...');
        const testExtent = await import('@arcgis/core/geometry/Extent');
        const testExtentGeometry = new testExtent.default({
          xmin: -9100000, // Within sample feature area
          ymin: 3510000,
          xmax: -9095000,
          ymax: 3520000,
          spatialReference: { wkid: 102100 }
        });
        
        const testQuery = layer.createQuery();
        testQuery.geometry = testExtentGeometry;
        testQuery.spatialRelationship = "intersects";
        testQuery.outFields = [layer.objectIdField];
        testQuery.returnGeometry = false;
        testQuery.num = 10;
        
        const testResult = await layer.queryFeatures(testQuery);
        console.log(`[SpatialFilter] Known good extent test found ${testResult.features.length} features`);
        
        // Try a larger extent query
        if (queryGeometry.extent) {
          console.log('[SpatialFilter] Original query extent:', {
            xmin: queryGeometry.extent.xmin,
            ymin: queryGeometry.extent.ymin,
            xmax: queryGeometry.extent.xmax,
            ymax: queryGeometry.extent.ymax
          });
          
          const expandedExtent = queryGeometry.extent.expand(10); // Expand by 10x
          const expandedQuery = layer.createQuery();
          expandedQuery.geometry = expandedExtent;
          expandedQuery.spatialRelationship = "intersects";
          expandedQuery.outFields = [layer.objectIdField];
          expandedQuery.returnGeometry = false;
          expandedQuery.num = 100;
          
          const expandedResult = await layer.queryFeatures(expandedQuery);
          console.log(`[SpatialFilter] Expanded extent (10x) found ${expandedResult.features.length} features`);
        }
      } catch (diagnosticError) {
        console.error('[SpatialFilter] Diagnostic query failed:', diagnosticError);
      }
    }

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