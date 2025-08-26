/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared utility for applying AnalysisEngine visualization to the map
// This function is used by both geospatial-chat-interface and MapApp

import { VisualizationResult, ProcessedAnalysisData } from '@/lib/analysis/types';
import { resolveAreaName as resolveSharedAreaName } from '@/lib/shared/AreaName';

export const applyAnalysisEngineVisualization = async (
  visualization: VisualizationResult,
  data: ProcessedAnalysisData,
  mapView: __esri.MapView | null,
  setFormattedLegendData?: React.Dispatch<React.SetStateAction<any>>,
  onVisualizationLayerCreated?: (layer: __esri.FeatureLayer | null, shouldReplace?: boolean) => void
): Promise<__esri.FeatureLayer | null> => {
  try {
    // Validate inputs first
    if (!visualization) {
      console.error('[applyAnalysisEngineVisualization] ❌ No visualization object provided');
      return null;
    }
    
    if (!data) {
      console.error('[applyAnalysisEngineVisualization] ❌ No data object provided');
      return null;
    }
    
    if (!mapView) {
      console.error('[applyAnalysisEngineVisualization] ❌ No map view provided');
      return null;
    }
    
    console.log('[applyAnalysisEngineVisualization] Starting with:', {
      visualizationType: visualization?.type,
      hasRenderer: !!visualization?.renderer,
  rendererType: (visualization?.renderer as any)?.type,
  rendererKeys: visualization?.renderer ? Object.keys(visualization.renderer as any) : [],
      recordCount: data?.records?.length,
      sampleRecord: data?.records?.[0] ? {
        hasGeometry: !!(data.records[0] as any).geometry,
        geometryType: (data.records[0] as any).geometry?.type,
        hasAreaId: !!(data.records[0] as any).area_id,
        hasProperties: !!(data.records[0] as any).properties,
        allKeys: Object.keys(data.records[0]),
        sampleGeometry: (data.records[0] as any).geometry ? {
          type: (data.records[0] as any).geometry.type,
          hasCoordinates: !!(data.records[0] as any).geometry.coordinates,
          coordinatesLength: (data.records[0] as any).geometry.coordinates?.length,
          firstCoordinate: (data.records[0] as any).geometry.coordinates?.[0]?.[0]
        } : null,
        sampleAreaId: (data.records[0] as any).area_id,
        sampleAreaName: (data.records[0] as any).area_name,
        sampleValue: (data.records[0] as any).value
      } : 'No records'
    });

    // CRITICAL DEBUG: Check if we have ANY records at all
    if (!data.records || data.records.length === 0) {
      console.error('[applyAnalysisEngineVisualization] ❌ NO RECORDS PROVIDED TO VISUALIZATION');
      console.error('[applyAnalysisEngineVisualization] Data structure:', data);
      return null;
    }

    console.log('[applyAnalysisEngineVisualization] ✅ Records found, checking geometry...');

    // Check if records have geometry
  const recordsWithGeometry = (data.records as any[]).filter((record: any) => record.geometry && (record.geometry as any).coordinates);
    console.log('[applyAnalysisEngineVisualization] Geometry check:', {
      totalRecords: data.records.length,
      recordsWithGeometry: recordsWithGeometry.length,
      geometryTypes: [...new Set(recordsWithGeometry.map((r: any) => (r.geometry as any)?.type))],
      sampleGeometry: recordsWithGeometry[0]?.geometry ? {
        type: (recordsWithGeometry[0].geometry as any).type,
        hasCoordinates: !!(recordsWithGeometry[0].geometry as any).coordinates,
        coordinatesLength: (recordsWithGeometry[0].geometry as any).coordinates?.length
      } : 'No geometry found',
      isClustered: data.isClustered
    });

    if (recordsWithGeometry.length === 0) {
      console.error('[applyAnalysisEngineVisualization] No records with valid geometry found');
      return null;
    }
    
    // Validate renderer configuration
    if (!visualization.renderer) {
      console.error('[applyAnalysisEngineVisualization] ❌ No renderer in visualization object');
      console.error('[applyAnalysisEngineVisualization] Visualization object:', visualization);
      return null;
    }

    // Import ArcGIS modules
    let FeatureLayer, Graphic;
    try {
      [FeatureLayer, Graphic] = await Promise.all([
        import('@arcgis/core/layers/FeatureLayer').then(m => m.default),
        import('@arcgis/core/Graphic').then(m => m.default)
      ]);
      
      console.log('[applyAnalysisEngineVisualization] ✅ ArcGIS modules imported successfully');
    } catch (importError) {
      console.error('[applyAnalysisEngineVisualization] ❌ Failed to import ArcGIS modules:', importError);
      return null;
    }

    // Convert AnalysisEngine data to ArcGIS features
    const arcgisFeatures = data.records.map((record: any, index: number) => {
      // Only create features with valid geometry
  if (!record.geometry || !(record.geometry as any).coordinates) {
        console.warn(`[applyAnalysisEngineVisualization] ❌ Skipping record ${index} - no valid geometry`);
        return null;
      }

      // Convert GeoJSON geometry to ArcGIS geometry format
      let arcgisGeometry: any = null;
      
      try {
  if ((record.geometry as any).type === 'Polygon') {
          // Check if visualization renderer wants to use centroids
          const useCentroids = (visualization.renderer as any)?._useCentroids;
          
          if (useCentroids) {
            // Use centroid from boundary properties if available, otherwise calculate it
            const centroidGeometry = (record.properties as any)?.centroid;
            if (centroidGeometry && centroidGeometry.coordinates) {
              arcgisGeometry = {
                type: 'point',
                x: centroidGeometry.coordinates[0],
                y: centroidGeometry.coordinates[1],
                spatialReference: { wkid: 4326 }
              };
            } else {
              // Calculate centroid from polygon coordinates
              const coordinates = (record.geometry as any).coordinates[0]; // First ring
              let sumX = 0, sumY = 0;
              let validCoords = 0;
              
              coordinates.forEach((coord: number[]) => {
                if (coord && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
                  sumX += coord[0];
                  sumY += coord[1];
                  validCoords++;
                }
              });
              
              if (validCoords === 0) {
                console.warn(`[applyAnalysisEngineVisualization] No valid coordinates for ${record.area_name}`);
                return null;
              }
              
              const centroidX = sumX / validCoords;
              const centroidY = sumY / validCoords;
              
              if (isNaN(centroidX) || isNaN(centroidY)) {
                console.warn(`[applyAnalysisEngineVisualization] Invalid centroid calculated for ${record.area_name}`);
                return null;
              }
              
              arcgisGeometry = {
                type: 'point',
                x: centroidX,
                y: centroidY,
                spatialReference: { wkid: 4326 }
              };
            }
          } else {
            // GeoJSON Polygon to ArcGIS Polygon for other visualizations
            arcgisGeometry = {
              type: 'polygon',
              rings: (record.geometry as any).coordinates,
              spatialReference: { wkid: 4326 }
            };
          }
        } else if ((record.geometry as any).type === 'Point') {
          // GeoJSON Point to ArcGIS Point
          arcgisGeometry = {
            type: 'point',
            x: (record.geometry as any).coordinates[0],
            y: (record.geometry as any).coordinates[1],
            spatialReference: { wkid: 4326 }
          };
        } else {
          console.warn(`[applyAnalysisEngineVisualization] Unsupported geometry type: ${(record.geometry as any).type}`);
          return null;
        }
      } catch (geoError) {
        console.error(`[applyAnalysisEngineVisualization] Geometry conversion error for record ${index}:`, geoError);
        return null;
      }

      // Create essential attributes for visualization
      const resolvedName = (() => {
        try {
          return resolveSharedAreaName(record, { mode: 'zipCity', neutralFallback: '' }) || '';
        } catch { return ''; }
      })();

        // Create essential attributes for visualization (minimal fields + single score)
        const essentialAttributes: any = {
        OBJECTID: index + 1,
        area_name: resolvedName || record.area_name || record.properties?.DESCRIPTION || record.area_id || `Area ${index + 1}`,
        ID: String(record.properties?.ID || record.area_id || ''),
        DESCRIPTION: record.properties?.DESCRIPTION || resolvedName || record.area_name || `Area ${record.area_id ?? index + 1}`,
        
        // Target variable field (dynamic based on analysis type) - prioritize record[targetVariable] for proper field mapping
        [data.targetVariable]: typeof record[data.targetVariable] === 'number' ? record[data.targetVariable] :
                               typeof record.value === 'number' ? record.value : 
                               typeof record.properties?.[data.targetVariable] === 'number' ? record.properties[data.targetVariable] : 0
      };

        // Also set a generic 'value' equal to the target variable for legacy compatibility
        if (data.targetVariable && typeof essentialAttributes[data.targetVariable] === 'number') {
          essentialAttributes.value = essentialAttributes[data.targetVariable];
        } else if (typeof record.value === 'number') {
          essentialAttributes.value = record.value;
        } else {
          essentialAttributes.value = 0;
        }

        // Ensure any fields referenced by the renderer exist on the feature (minimal set)
        const rendererFields = new Set<string>();
        if ((visualization as any)?.renderer?.field) {
          rendererFields.add((visualization as any).renderer.field as string);
        }
        const vvs = (visualization as any)?.renderer?.visualVariables as Array<{ field?: string }> | undefined;
        if (Array.isArray(vvs)) {
          vvs.forEach(vv => { if (vv?.field) rendererFields.add(vv.field); });
        }
        rendererFields.forEach(fieldName => {
          if (!fieldName) return;
          const val = (record as any)[fieldName] ?? (record as any).properties?.[fieldName];
          if (val !== undefined) {
            (essentialAttributes as Record<string, unknown>)[fieldName] = val as unknown;
          }
        });

  // Note: Do NOT add demographic or other numeric attributes here to keep popups minimal.

      const graphic = new Graphic({
        geometry: arcgisGeometry,
        attributes: essentialAttributes
      });
      
      return graphic;
    }).filter(feature => feature !== null); // Remove null features

    console.log('[applyAnalysisEngineVisualization] Created features:', {
      totalFeatures: arcgisFeatures.length,
      skippedFeatures: data.records.length - arcgisFeatures.length,
      geometryType: arcgisFeatures[0]?.geometry?.type
    });

    if (arcgisFeatures.length === 0) {
      console.error('[applyAnalysisEngineVisualization] 🔥 NO VALID ARCGIS FEATURES CREATED - LAYER WILL BE EMPTY');
      throw new Error('No valid features with geometry to visualize');
    }

    // Determine the actual geometry type being used
  const useCentroids = (visualization.renderer as any)?._useCentroids;
    const actualGeometryType = useCentroids ? 'point' : 'polygon';

    // Generate field definitions based on what attributes actually exist
    const essentialFields: __esri.FieldProperties[] = [
      { name: 'OBJECTID', type: 'oid' },
      { name: 'area_name', type: 'string' },
      { name: 'value', type: 'double' },
      { name: 'ID', type: 'string' },
      { name: data.targetVariable || 'value', type: 'double' }
    ];

    // Do NOT auto-add other numeric/demographic fields to keep popups minimal.

    // Create feature layer
    let featureLayer;
    try {
      const layerId = `analysis-layer-${Date.now()}`;
      console.log('[applyAnalysisEngineVisualization] ✨ Creating analysis layer with ID:', layerId);
      
      featureLayer = new FeatureLayer({
        id: layerId,
        source: arcgisFeatures,
        fields: essentialFields,
        objectIdField: 'OBJECTID',
        geometryType: actualGeometryType,
        spatialReference: { wkid: 4326 },
  renderer: (data.renderer as any) || (visualization.renderer as any),
        popupEnabled: false,
        title: `AnalysisEngine - ${data.targetVariable || 'Analysis'}`,
        visible: true,
        opacity: 0.8
      });

      console.log('[applyAnalysisEngineVisualization] FeatureLayer created successfully:', {
        layerId: featureLayer.id,
        layerType: featureLayer.type,
        layerTitle: featureLayer.title
      });
      
    } catch (featureLayerError) {
      console.error('[applyAnalysisEngineVisualization] Failed to create FeatureLayer:', featureLayerError);
      throw new Error(`FeatureLayer creation failed: ${featureLayerError}`);
    }

    // Remove any existing analysis layers
    const existingLayers = mapView.map.layers.filter((layer) => {
      const title = (layer as __esri.Layer).title as string | undefined;
      return Boolean(title && (title.includes('Analysis') || title.includes('AnalysisEngine')));
    });
    
    if (existingLayers.length > 0) {
      console.log('[applyAnalysisEngineVisualization] 🗑️ REMOVING EXISTING ANALYSIS LAYERS:', {
        layerCount: existingLayers.length,
        reason: 'Adding new visualization layer'
      });
    }
    
    mapView.map.removeMany(existingLayers.toArray());

    // Add the new layer to map
    console.log('[applyAnalysisEngineVisualization] 🎯 Adding analysis layer to map');
    mapView.map.add(featureLayer);
    
    // Store metadata for theme switch protection
  // Tag metadata in a type-safe way
  (featureLayer as unknown as { __isAnalysisLayer?: boolean }).__isAnalysisLayer = true;
  (featureLayer as unknown as { __createdAt?: number }).__createdAt = Date.now();
    console.log('[applyAnalysisEngineVisualization] ✅ Analysis layer added with protection metadata');

    // Create legend data from the renderer if setFormattedLegendData is provided
    if (setFormattedLegendData) {
      try {
        const { formatLegendDataFromRenderer } = await import('@/utils/legend-formatter');
        const renderer = featureLayer.renderer;
        
        if (renderer) {
          console.log('[applyAnalysisEngineVisualization] 🎯 Creating legend from renderer');
          
          const legendItems = formatLegendDataFromRenderer(renderer);
          
          if (legendItems && legendItems.length > 0) {
            const legendTitle = data.targetVariable ? 
              data.targetVariable.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
              'Analysis Result';
            
            const legendData = {
              title: legendTitle,
              items: legendItems.map(item => ({
                label: item.label,
                color: item.color,
                value: item.minValue
              }))
            };
            
            console.log('[applyAnalysisEngineVisualization] 🎯 Setting legend data from renderer');
            setFormattedLegendData(legendData);
          }
        }
      } catch (legendError) {
        console.error('[applyAnalysisEngineVisualization] 🚨 Failed to create legend from renderer:', legendError);
      }
    }

    // Notify parent component that visualization layer was created (for CustomPopupManager integration)
    if (onVisualizationLayerCreated) {
      console.log('[applyAnalysisEngineVisualization] 🎯 Calling onVisualizationLayerCreated for CustomPopupManager integration');
      onVisualizationLayerCreated(featureLayer, true);
    }

    // Final step: Zoom and center to the feature extent (works for polygons, points, clusters, buffers)
    try {
      console.log('[applyAnalysisEngineVisualization] 🎯 Preparing to zoom to new layer extent...');

      // Compute extent from the created graphics (robust for client-side layers)
      const computeExtentFromGraphics = async (graphics: __esri.Graphic[]): Promise<__esri.Extent | null> => {
        let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
        let hasValid = false;

        const updateBounds = (x: number, y: number) => {
          if (Number.isFinite(x) && Number.isFinite(y)) {
            xmin = Math.min(xmin, x);
            ymin = Math.min(ymin, y);
            xmax = Math.max(xmax, x);
            ymax = Math.max(ymax, y);
            hasValid = true;
          }
        };

        for (const g of graphics) {
          const geom = g?.geometry as __esri.Geometry | null;
          if (!geom) continue;
          if (geom.type === 'point') {
            const pt = geom as __esri.Point;
            if (Number.isFinite(pt.x) && Number.isFinite(pt.y)) {
              updateBounds(pt.x, pt.y);
            }
          } else if (geom.type === 'polygon') {
            const poly = geom as __esri.Polygon;
            const rings = poly.rings as unknown as number[][][];
            if (Array.isArray(rings)) {
              for (const ring of rings) {
                for (const coord of ring) {
                  const x = coord?.[0];
                  const y = coord?.[1];
                  updateBounds(x, y);
                }
              }
            }
          }
        }

        if (!hasValid) return null;

        const Extent = (await import('@arcgis/core/geometry/Extent')).default;
        return new Extent({ xmin, ymin, xmax, ymax, spatialReference: { wkid: 4326 } });
      };

      const extent = await computeExtentFromGraphics((featureLayer.source as unknown as __esri.Graphic[]) || []);

      // Fallbacks: try layer.fullExtent after load, or center on first graphic
      let finalTarget: __esri.Extent | { center: [number, number]; scale: number } | null = extent;
      if (!finalTarget) {
        try {
          await featureLayer.load();
          finalTarget = featureLayer.fullExtent ?? null;
        } catch {
          // ignore
        }
      }
      if (!finalTarget) {
        const first = (featureLayer.source as unknown as __esri.Graphic[])?.[0];
        const geom = first?.geometry as __esri.Geometry | undefined;
        if (geom?.type === 'point') {
          const pt = geom as __esri.Point;
          finalTarget = { center: [pt.x, pt.y], scale: 120000 };
        }
      }

      if (finalTarget) {
        try {
          // Expand a bit for nice padding when using extent
          if ('xmin' in (finalTarget as object)) {
            // It's an extent
            finalTarget = (finalTarget as __esri.Extent).expand(1.15);
          }
          console.log('[applyAnalysisEngineVisualization] 🔭 goTo target prepared, executing view.goTo...');
          await mapView.goTo(finalTarget, { duration: 800 });
          console.log('[applyAnalysisEngineVisualization] ✅ View centered and zoomed to new layer extent');
        } catch (goToErr) {
          console.warn('[applyAnalysisEngineVisualization] ⚠️ view.goTo failed, continuing without zoom:', goToErr);
        }
      } else {
        console.warn('[applyAnalysisEngineVisualization] ⚠️ Could not determine extent to zoom to');
      }
    } catch (zoomErr) {
      console.warn('[applyAnalysisEngineVisualization] ⚠️ Zoom-to-extent step failed:', zoomErr);
    }

    console.log('[applyAnalysisEngineVisualization] ✅ Visualization applied successfully');
    return featureLayer;

  } catch (error) {
    console.error('[applyAnalysisEngineVisualization] Failed to apply visualization:', error);
    return null;
  }
};