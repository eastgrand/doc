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
      rendererType: visualization?.renderer?.type,
      rendererKeys: visualization?.renderer ? Object.keys(visualization.renderer) : [],
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
    const recordsWithGeometry = (data.records as any[]).filter((record: any) => record.geometry && record.geometry.coordinates);
    console.log('[applyAnalysisEngineVisualization] Geometry check:', {
      totalRecords: data.records.length,
      recordsWithGeometry: recordsWithGeometry.length,
      geometryTypes: [...new Set(recordsWithGeometry.map((r: any) => r.geometry?.type))],
      sampleGeometry: recordsWithGeometry[0]?.geometry ? {
        type: recordsWithGeometry[0].geometry.type,
        hasCoordinates: !!recordsWithGeometry[0].geometry.coordinates,
        coordinatesLength: recordsWithGeometry[0].geometry.coordinates?.length
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
      if (!record.geometry || !record.geometry.coordinates) {
        console.warn(`[applyAnalysisEngineVisualization] ❌ Skipping record ${index} - no valid geometry`);
        return null;
      }

      // Convert GeoJSON geometry to ArcGIS geometry format
      let arcgisGeometry: any = null;
      
      try {
        if (record.geometry.type === 'Polygon') {
          // Check if visualization renderer wants to use centroids
          const useCentroids = visualization.renderer?._useCentroids;
          
          if (useCentroids) {
            // Use centroid from boundary properties if available, otherwise calculate it
            const centroidGeometry = record.properties?.centroid;
            if (centroidGeometry && centroidGeometry.coordinates) {
              arcgisGeometry = {
                type: 'point',
                x: centroidGeometry.coordinates[0],
                y: centroidGeometry.coordinates[1],
                spatialReference: { wkid: 4326 }
              };
            } else {
              // Calculate centroid from polygon coordinates
              const coordinates = record.geometry.coordinates[0]; // First ring
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
              rings: record.geometry.coordinates,
              spatialReference: { wkid: 4326 }
            };
          }
        } else if (record.geometry.type === 'Point') {
          // GeoJSON Point to ArcGIS Point
          arcgisGeometry = {
            type: 'point',
            x: record.geometry.coordinates[0],
            y: record.geometry.coordinates[1],
            spatialReference: { wkid: 4326 }
          };
        } else {
          console.warn(`[applyAnalysisEngineVisualization] Unsupported geometry type: ${record.geometry.type}`);
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

      const essentialAttributes: any = {
        OBJECTID: index + 1,
        area_name: resolvedName || record.area_name || record.properties?.DESCRIPTION || record.area_id || `Area ${index + 1}`,
        value: typeof record.value === 'number' ? record.value : 0,
        ID: String(record.properties?.ID || record.area_id || ''),
        DESCRIPTION: record.properties?.DESCRIPTION || resolvedName || record.area_name || `Area ${record.area_id ?? index + 1}`,
        
        // Target variable field (dynamic based on analysis type)
        [data.targetVariable]: typeof record.value === 'number' ? record.value : 
                               typeof record.properties?.[data.targetVariable] === 'number' ? record.properties[data.targetVariable] : 0
      };

      // Include renderer fields if they exist in the record
      const rendererFields = new Set<string>();
      
      if (visualization.renderer?.field) {
        rendererFields.add(visualization.renderer.field);
      }
      if (visualization.renderer?.visualVariables) {
        visualization.renderer.visualVariables.forEach((vv: any) => {
          if (vv.field) rendererFields.add(vv.field);
        });
      }
      
      rendererFields.forEach(fieldName => {
        if (fieldName && (record[fieldName] !== undefined || record.properties?.[fieldName] !== undefined)) {
          essentialAttributes[fieldName] = record[fieldName] ?? record.properties?.[fieldName];
        }
      });
      
      // Include common demographic fields for popups if they exist
      const commonDemographicFields = [
        'value_TOTPOP_CY', 'TOTPOP_CY', 
        'value_AVGHINC_CY', 'AVGHINC_CY',
        'value_WLTHINDXCY', 'WLTHINDXCY',
        'nike_market_share', 'adidas_market_share', 'jordan_market_share',
        'rank', 'competitive_advantage_score', 'strategic_value_score',
        'customer_profile_score', 'persona_type'
      ];
      
      commonDemographicFields.forEach(fieldName => {
        const value = record[fieldName] ?? record.properties?.[fieldName];
        if (value !== undefined && value !== null) {
          essentialAttributes[fieldName] = value;
        }
      });

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
    const useCentroids = visualization.renderer?._useCentroids;
    const actualGeometryType = useCentroids ? 'point' : 'polygon';

    // Generate field definitions based on what attributes actually exist
    const essentialFields: __esri.FieldProperties[] = [
      { name: 'OBJECTID', type: 'oid' },
      { name: 'area_name', type: 'string' },
      { name: 'value', type: 'double' },
      { name: 'ID', type: 'string' },
      { name: data.targetVariable || 'value', type: 'double' }
    ];

    // Dynamically discover what fields exist in the graphics and add appropriate schema
    if (arcgisFeatures.length > 0) {
      const sampleAttributes = arcgisFeatures[0].attributes;
      const fieldTypeMap: Record<string, string> = {
        'rank': 'integer',
        'TOTPOP_CY': 'double', 'value_TOTPOP_CY': 'double',
        'AVGHINC_CY': 'double', 'value_AVGHINC_CY': 'double', 
        'WLTHINDXCY': 'double', 'value_WLTHINDXCY': 'double',
        'nike_market_share': 'double', 'adidas_market_share': 'double', 'jordan_market_share': 'double',
        'competitive_advantage_score': 'double', 'strategic_value_score': 'double', 'customer_profile_score': 'double',
        'persona_type': 'string'
      };
      
      Object.keys(sampleAttributes).forEach(fieldName => {
        if (essentialFields.some(f => f.name === fieldName)) return;
        
        const value = sampleAttributes[fieldName];
        let fieldType: __esri.FieldProperties['type'] = 'string';
        
        if (fieldTypeMap[fieldName]) {
          fieldType = fieldTypeMap[fieldName] as __esri.FieldProperties['type'];
        } else if (typeof value === 'number') {
          fieldType = Number.isInteger(value) ? 'integer' : 'double';
        } else if (typeof value === 'string') {
          fieldType = 'string';
        }
        
        essentialFields.push({ name: fieldName, type: fieldType });
      });
    }

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
        renderer: data.renderer || visualization.renderer,
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
    const existingLayers = mapView.map.layers.filter((layer: any) => 
      Boolean(layer.title?.includes('Analysis') || layer.title?.includes('AnalysisEngine'))
    );
    
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
    (featureLayer as any).__isAnalysisLayer = true;
    (featureLayer as any).__createdAt = Date.now();
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

    console.log('[applyAnalysisEngineVisualization] ✅ Visualization applied successfully');
    return featureLayer;

  } catch (error) {
    console.error('[applyAnalysisEngineVisualization] Failed to apply visualization:', error);
    return null;
  }
};