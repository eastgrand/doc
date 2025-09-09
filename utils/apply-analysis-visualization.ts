/* eslint-disable @typescript-eslint/no-explicit-any */
// Shared utility for applying AnalysisEngine visualization to the map
// This function is used by both geospatial-chat-interface and MapApp

import { VisualizationResult, ProcessedAnalysisData } from '@/lib/analysis/types';
import { resolveAreaName as resolveSharedAreaName } from '@/lib/shared/AreaName';

// Default TTL for an in-flight visualization creation (ms). Can be tuned.
const DEFAULT_INFLIGHT_TTL = 15000;

// Exported helper to attach or retrieve a per-map VisualizationManager.
export const attachVisualizationManager = (m: any) => {
  if (!m) return null;
  if (!m.__visualizationManager) {
    const createManager = () => {
      const vm: any = { inFlight: null, lastSignature: null, lastLayerId: null, resolve: null, reject: null, cleanup: null };

      // Cleanup helper: clear timers, reject in-flight, and remove manager reference
      vm.cleanup = () => {
        try {
          if (vm.__inFlightTimer) {
            try { clearTimeout(vm.__inFlightTimer); } catch { /* ignore */ }
            vm.__inFlightTimer = null;
          }
        } catch { /* ignore */ }
        try {
          if (vm.inFlight && typeof vm.reject === 'function') {
            try { vm.reject(new Error('VisualizationManager: map destroyed - aborting in-flight creation')); } catch { /* ignore */ }
          }
        } catch { /* ignore */ }
        try { delete m.__visualizationManager; } catch { /* ignore */ }
      };

      // Return currently applied analysis layer (if any) using stored lastLayerId, or fallback to first analysis layer
      vm.getCurrentLayer = () => {
        try {
          const lid = vm.lastLayerId || m.__lastAnalysisLayerId;
          if (lid) {
            const found = m.layers.find((l: any) => l.id === lid);
            if (found) return found;
          }
          const fallback = m.layers.find((layer: any) => (layer as any)?.__isAnalysisLayer);
          return fallback || null;
        } catch { return null; }
      };

      // Wait for a layer with the provided signature to appear (polling + optional in-flight join)
      vm.waitForLayer = async (signature: string | null, timeoutMs = 5000) => {
        const start = Date.now();
        // Fast-path: if signature matches and layer exists, return it
        try {
          if (signature && (m.__lastAnalysisSignature === signature || vm.lastSignature === signature)) {
            const cur = vm.getCurrentLayer();
            if (cur) return cur;
          }
        } catch { /* ignore */ }

        // If an in-flight creation is present and will resolve to our signature, await it
        if (vm.inFlight) {
          try {
            const res = await Promise.race([vm.inFlight, new Promise(res => setTimeout(() => res(null), timeoutMs))]);
            if (res) return res;
          } catch { /* ignore */ }
        }

        // Poll the map for the expected layer up to timeout
        while (Date.now() - start < timeoutMs) {
          try {
            const cur = vm.getCurrentLayer();
            if (cur) return cur;
          } catch { /* ignore */ }
          // eslint-disable-next-line no-await-in-loop
          await new Promise(res => setTimeout(res, 100));
        }
        return null;
      };

      // Force-replace current analysis layer(s) with a provided layer instance
      vm.forceReplaceLayer = async (newLayer: any, signature?: string) => {
        try {
          const existing = m.layers.filter((layer: any) => (layer as any)?.__isAnalysisLayer);
          if (existing && existing.length > 0) {
            try { m.removeMany(existing.toArray()); } catch { /* ignore */ }
          }
          try { m.add(newLayer); } catch (addErr) { throw addErr; }
          try { newLayer.__isAnalysisLayer = true; newLayer.__createdAt = Date.now(); } catch { /* ignore */ }
          if (signature) {
            vm.lastSignature = signature;
            vm.lastLayerId = newLayer.id;
            try { m.__lastAnalysisSignature = signature; m.__lastAnalysisSignatureAt = Date.now(); m.__lastAnalysisLayerId = newLayer.id; } catch { /* ignore */ }
          }
          return newLayer;
        } catch (err) {
          throw err;
        }
      };

      return vm;
    };

    m.__visualizationManager = createManager();
  }
  return m.__visualizationManager as any;
};

export const applyAnalysisEngineVisualization = async (
  visualization: VisualizationResult,
  data: ProcessedAnalysisData,
  mapView: __esri.MapView | null,
  setFormattedLegendData?: React.Dispatch<React.SetStateAction<any>>,
  onVisualizationLayerCreated?: (layer: __esri.FeatureLayer | null, shouldReplace?: boolean) => void,
  options?: { callerId?: string; forceCreate?: boolean; inflightTTLMs?: number }
): Promise<__esri.FeatureLayer | null> => {
  try {
    // Quick guard: compute a lightweight signature for this visualization+data to avoid duplicates
    const computeSignature = (vis: any, d: any) => {
      try {
        const keys = {
          rendererField: vis?.renderer?.field,
          rendererType: vis?.renderer?.type,
          targetVariable: d?.targetVariable,
          recordCount: Array.isArray(d?.records) ? d.records.length : 0,
          sampleIds: Array.isArray(d?.records) ? d.records.slice(0, 5).map((r: any) => r.area_id ?? r.ID ?? r.properties?.ID ?? r.area_name ?? '').join('|') : ''
        };
        return JSON.stringify(keys);
      } catch {
        return String(Date.now());
      }
    };

  const signature = computeSignature(visualization, data);
  const callerId = options?.callerId ?? 'unknown-caller';
  const inflightTTL = typeof options?.inflightTTLMs === 'number' ? options!.inflightTTLMs : DEFAULT_INFLIGHT_TTL;

  console.log('[applyAnalysisEngineVisualization] caller:', callerId, 'signature:', signature, 'inflightTTL:', inflightTTL);

    // VisualizationManager: central in-flight promise and metadata stored on the map object
    const getVisualizationManager = (m: any) => {
      if (!m) return null;
      if (!m.__visualizationManager) {
        // Basic structure plus a cleanup helper that callers or lifecycle hooks can call
        m.__visualizationManager = { inFlight: null, lastSignature: null, lastLayerId: null, resolve: null, reject: null, cleanup: null };

        // Attach a cleanup implementation bound to this map instance
        (m.__visualizationManager as any).cleanup = () => {
          try {
            const vm = m.__visualizationManager as any;
            if (vm) {
              try {
                if (vm.__inFlightTimer) {
                  try { clearTimeout(vm.__inFlightTimer); } catch { /* ignore */ }
                  vm.__inFlightTimer = null;
                }
              } catch { /* ignore */ }
              if (vm.inFlight && typeof vm.reject === 'function') {
                try { vm.reject(new Error('VisualizationManager: map destroyed - aborting in-flight creation')); } catch { /* ignore */ }
              }
            }
          } finally {
            try { delete m.__visualizationManager; } catch { /* ignore */ }
          }
        };
      }
      return m.__visualizationManager as any;
    };

    const awaitPromiseWithTimeout = async (p: Promise<any> | null, timeoutMs = 2000) => {
      if (!p) return null;
      // Create a timeout that can be cleared if the main promise resolves first
      let timeoutId: any = null;
      const timeoutPromise = new Promise((res) => { timeoutId = setTimeout(() => res(null), timeoutMs); });
      try {
        const result = await Promise.race([p, timeoutPromise]);
        return result;
      } finally {
        if (typeof timeoutId === 'number' || typeof timeoutId === 'object') {
          try { clearTimeout(timeoutId); } catch { /* ignore */ }
        }
      }
    };

    // If the map already recently applied this same signature, skip creating a duplicate
    // Also, establish ownership of a visualization manager in-flight promise so concurrent callers
    // await the same creation. We set `isManagerOwner` true for the caller that creates the promise.
    let mapObjForManager: any = null;
    let vmanOwner: any = null;
    let isManagerOwner = false;
    try {
      mapObjForManager = (mapView as any)?.map;
      const vman = getVisualizationManager(mapObjForManager);

      // If map supports eventing, attach cleanup on destroy to avoid leaks (idempotent)
      try {
        if (mapObjForManager && vman && !vman.__cleanupAttached && typeof mapObjForManager.on === 'function') {
          // Some mapping libs emit 'destroy' or 'before-destroy' — try common names
          const handler = () => {
            try { if (typeof vman.cleanup === 'function') vman.cleanup(); } catch { /* ignore */ }
          };
          try { mapObjForManager.on('destroy', handler); } catch { /* ignore */ }
          try { mapObjForManager.on('before-destroy', handler); } catch { /* ignore */ }
          vman.__cleanupAttached = true;
        }
      } catch {
        // non-fatal
      }
      vmanOwner = vman;

      if (vman && vman.inFlight) {
        // If an identical signature is already in-flight, await and return its result
        if (vman.lastSignature === signature) {
          console.log('[applyAnalysisEngineVisualization] Awaiting existing in-flight visualization for same signature');
          const existing = await awaitPromiseWithTimeout(vman.inFlight, 5000);
          if (existing) return existing as __esri.FeatureLayer;
          // If in-flight resolved to null (timeout), continue and attempt creation
        } else {
          // A different visualization is in-flight — wait briefly for it to finish to avoid overlapping removals/adds
          console.log('[applyAnalysisEngineVisualization] Waiting for different in-flight visualization to complete');
          await awaitPromiseWithTimeout(vman.inFlight, 2000);
        }
      }

      // Quick-time duplicate guard: if the same signature was applied very recently, return stored layer
      if (mapObjForManager) {
        const lastSig = (mapObjForManager as any).__lastAnalysisSignature;
        const lastAppliedAt = (mapObjForManager as any).__lastAnalysisSignatureAt || 0;
        const now = Date.now();
        if (lastSig === signature && now - lastAppliedAt < 5000) {
          console.log('[applyAnalysisEngineVisualization] Duplicate visualization detected (recent signature match). Returning existing analysis layer');
          const existingLayerId = (mapObjForManager as any).__lastAnalysisLayerId as string | undefined;
          if (existingLayerId) {
            const existing = mapObjForManager.layers.find((l: any) => l.id === existingLayerId);
            if (existing) return existing as __esri.FeatureLayer;
          }
          const found = mapObjForManager.layers.find((layer: any) => (layer as any)?.__isAnalysisLayer);
          if (found) return found as __esri.FeatureLayer;
        }
      }

      // If no in-flight exists, the first caller becomes the owner and creates the inFlight promise
      if (vman && !vman.inFlight) {
        isManagerOwner = true;
        vman.inFlight = new Promise((resolve, reject) => {
          vman.resolve = resolve;
          vman.reject = reject;
        });
        try {
          // Start a per-call TTL that will reject the in-flight creation if it takes too long
          try { if (vman.__inFlightTimer) { clearTimeout(vman.__inFlightTimer); } } catch { }
          vman.__inFlightTimer = setTimeout(() => {
            try {
              if (vman && typeof vman.reject === 'function') {
                vman.reject(new Error('VisualizationManager: in-flight creation timed out'));
              }
            } catch { /* ignore */ }
            try { vman.inFlight = null; } catch { /* ignore */ }
          }, inflightTTL);
        } catch { /* ignore */ }
      }
    } catch (guardErr) {
      console.warn('[applyAnalysisEngineVisualization] Signature/vman guard failed:', guardErr);
    }
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
    const initialFeatures = data.records.map((record: any, index: number) => {
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

    // DEDUPLICATION: Remove duplicate features with the same geometry
    // Keep only the first occurrence of each unique geometry
    const seenGeometries = new Set<string>();
    const dedupedFeatures = initialFeatures.filter((feature, index) => {
      const geom = feature.geometry;
      if (!geom) return false;
      
      // Create a geometry fingerprint
      let fingerprint = '';
      if (geom.type === 'point') {
        fingerprint = `${(geom as any).x},${(geom as any).y}`;
      } else if (geom.type === 'polygon' && (geom as any).rings) {
        const firstRing = (geom as any).rings[0];
        if (firstRing && firstRing.length > 2) {
          // Use first 3 coordinate pairs as fingerprint
          fingerprint = JSON.stringify(firstRing.slice(0, 3));
        }
      }
      
      if (!fingerprint || seenGeometries.has(fingerprint)) {
        console.warn(`[applyAnalysisEngineVisualization] Removing duplicate geometry at index ${index}:`, {
          ID: feature.getAttribute('ID'),
          area_name: feature.getAttribute('area_name'),
          value: feature.getAttribute(data.targetVariable)
        });
        return false; // Skip duplicate
      }
      
      seenGeometries.add(fingerprint);
      return true; // Keep first occurrence
    });
    
    console.log(`[applyAnalysisEngineVisualization] Deduplication complete:`, {
      originalCount: initialFeatures.length,
      dedupedCount: dedupedFeatures.length,
      removedCount: initialFeatures.length - dedupedFeatures.length
    });
    
  // Use deduplicated features from here on
  let arcgisFeatures = dedupedFeatures;

    // Check for duplicate area IDs using the ID field (ZIP code or FSA)
    const areaIds = arcgisFeatures.map(f => f.getAttribute('ID')).filter(id => id);
    const uniqueAreaIds = [...new Set(areaIds)];
    const duplicateCount = areaIds.length - uniqueAreaIds.length;
    
    // Check for duplicate or overlapping geometries with more robust geometry access
    const geometryFingerprints = arcgisFeatures.map((f, index) => {
      try {
        const geom = f.geometry;
        console.log(`[DEBUG] Feature ${index} geometry type:`, geom?.type, 'rings available:', !!(geom as any)?.rings);
        
        if (geom && geom.type === 'polygon' && (geom as any).rings && (geom as any).rings.length > 0) {
          // Create a simple fingerprint from first few coordinates of the first ring
          const firstRing = (geom as any).rings[0];
          if (firstRing && Array.isArray(firstRing) && firstRing.length > 2) {
            const coords = firstRing.slice(0, Math.min(3, firstRing.length)); // First 3 coordinate pairs
            const fingerprint = JSON.stringify(coords);
            console.log(`[DEBUG] Feature ${index} fingerprint created:`, fingerprint.substring(0, 50) + '...');
            return fingerprint;
          } else {
            console.log(`[DEBUG] Feature ${index} invalid first ring:`, firstRing?.length);
          }
        } else {
          console.log(`[DEBUG] Feature ${index} invalid geometry:`, { type: geom?.type, hasRings: !!(geom as any)?.rings });
        }
      } catch (err) {
        console.warn(`[DEBUG] Error processing geometry for feature ${index}:`, err);
      }
      return null;
    }).filter(fp => fp);
    
    console.log(`[DEBUG] Geometry fingerprinting: ${geometryFingerprints.length} fingerprints created from ${arcgisFeatures.length} features`);
    
    const uniqueGeometries = [...new Set(geometryFingerprints)];
    const duplicateGeometryCount = geometryFingerprints.length - uniqueGeometries.length;
    
    console.log(`[DEBUG] Geometry analysis: ${uniqueGeometries.length} unique geometries, ${duplicateGeometryCount} duplicates`);
    
    console.log('[applyAnalysisEngineVisualization] Created features:', {
      totalFeatures: arcgisFeatures.length,
      skippedFeatures: data.records.length - arcgisFeatures.length,
      geometryType: arcgisFeatures[0]?.geometry?.type,
      areaIdsFound: areaIds.length,
      uniqueAreaIds: uniqueAreaIds.length,
      duplicateFeatures: duplicateCount,
      geometriesFound: geometryFingerprints.length,
      uniqueGeometries: uniqueGeometries.length,
      duplicateGeometries: duplicateGeometryCount
    });
    
      if (duplicateCount > 0) {
      console.warn(`[applyAnalysisEngineVisualization] ⚠️  FOUND ${duplicateCount} DUPLICATE IDs`);
      const idCounts: Record<string, number> = {};
      areaIds.forEach(id => { idCounts[id] = (idCounts[id] || 0) + 1; });
      const duplicates = Object.entries(idCounts).filter(([, count]) => (count as number) > 1);
      console.warn('[applyAnalysisEngineVisualization] Duplicate IDs:', duplicates.slice(0, 5));
    }
    
  if (duplicateGeometryCount > 0) {
      console.warn(`[applyAnalysisEngineVisualization] ⚠️  FOUND ${duplicateGeometryCount} DUPLICATE GEOMETRIES - this causes overlapping colors!`);
      
      // Find which features have duplicate geometries and their different scores
      const geometryMap: Record<string, any[]> = {};
      arcgisFeatures.forEach(f => {
        const geom = f.geometry;
        if (geom && geom.type === 'polygon' && (geom as any).rings) {
          const firstRing = (geom as any).rings[0];
          if (firstRing && firstRing.length > 2) {
            const coords = firstRing.slice(0, 3);
            const fingerprint = JSON.stringify(coords);
            if (!geometryMap[fingerprint]) geometryMap[fingerprint] = [];
            geometryMap[fingerprint].push({
              ID: f.getAttribute('ID'),
              score: f.getAttribute(data.targetVariable),
              areaName: f.getAttribute('area_name')
            });
          }
        }
      });
      
      // Log examples of overlapping geometries with different scores
      Object.entries(geometryMap).filter(([, features]) => features.length > 1).slice(0, 3).forEach(([fingerprint, features]) => {
        console.warn(`[applyAnalysisEngineVisualization] Same geometry (${fingerprint.substring(0, 50)}...) has ${features.length} features:`, features);
      });

      // Coalesce overlapping geometries to a single feature to prevent overlapping colors.
      // Strategy: for each fingerprint keep the feature with the highest numeric score (fall back to first).
      try {
        const fingerprintToChosenID: Record<string, string> = {};
        Object.entries(geometryMap).forEach(([fingerprint, features]) => {
          if (!features || features.length === 0) return;
          // Pick feature with max score (score may be undefined/null)
          let chosen = features[0];
          for (const f of features) {
            const cur = typeof f.score === 'number' ? f.score : Number.NaN;
            const best = typeof chosen.score === 'number' ? chosen.score : Number.NaN;
            if (!Number.isNaN(cur) && (Number.isNaN(best) || cur > best)) chosen = f;
          }
          fingerprintToChosenID[fingerprint] = String(chosen.ID);
        });

        // Filter arcgisFeatures to only keep chosen IDs for polygon fingerprints
        arcgisFeatures = arcgisFeatures.filter((f) => {
          try {
            const geom = f.geometry;
            if (geom && geom.type === 'polygon' && (geom as any).rings) {
              const firstRing = (geom as any).rings[0];
              if (firstRing && Array.isArray(firstRing)) {
                const fp = JSON.stringify(firstRing.slice(0, Math.min(3, firstRing.length)));
                const keepId = fingerprintToChosenID[fp];
                if (keepId !== undefined) {
                  return String(f.getAttribute('ID')) === String(keepId);
                }
              }
            }
          } catch {
              // If anything fails, keep the feature so we don't accidentally drop valid data
              return true;
            }
          return true;
        });

        console.log('[applyAnalysisEngineVisualization] Coalesced overlapping geometries to prevent color mixing:', { newCount: arcgisFeatures.length });
      } catch (coalesceErr) {
        console.warn('[applyAnalysisEngineVisualization] Failed to coalesce overlapping geometries, continuing with original features:', coalesceErr);
      }
    }

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
      
      // Prefer the renderer produced by VisualizationRenderer (it may have applied diagnostics/fallbacks)
      const rendererFromVisualization = (visualization as any)?.renderer;
      const rendererFromData = (data as any)?.renderer;
      const chosenRenderer = rendererFromVisualization || rendererFromData;

      // Ensure the renderer field exists in our field definitions (ArcGIS requires declared fields)
      const rendererField: string | undefined = (chosenRenderer as any)?.field;
      if (rendererField && !essentialFields.some(f => f.name === rendererField)) {
        console.log('[applyAnalysisEngineVisualization] 🧩 Adding renderer field to layer schema:', rendererField);
        essentialFields.push({ name: rendererField, type: 'double' });
      }

      // Log which renderer we will use
      console.log('[applyAnalysisEngineVisualization] Renderer selection:', {
        used: rendererFromVisualization ? 'visualization' : (rendererFromData ? 'data' : 'none'),
        field: (chosenRenderer as any)?.field,
        type: (chosenRenderer as any)?.type
      });

      featureLayer = new FeatureLayer({
        id: layerId,
        source: arcgisFeatures,
        fields: essentialFields,
        objectIdField: 'OBJECTID',
        geometryType: actualGeometryType,
        spatialReference: { wkid: 4326 },
        renderer: chosenRenderer as any,
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

  // Add the new layer to map with a lightweight map-level async lock to avoid
  // near-simultaneous duplicate creations from concurrent callers.
  console.log('[applyAnalysisEngineVisualization] 🎯 Adding analysis layer to map (acquiring lock)');

  // visualization manager (if present) is accessed via getVisualizationManager earlier

    // Helper: wait for the analysis lock to clear with a short timeout
    const waitForUnlock = async (m: any, timeoutMs = 2000) => {
      const start = Date.now();
      while (m.__analysisLock && Date.now() - start < timeoutMs) {
        // small sleep
        // eslint-disable-next-line no-await-in-loop
        await new Promise((res) => setTimeout(res, 100));
      }
      return !m.__analysisLock;
    };

    try {
      if (mapObjForManager) {
        // If a lock is already set, wait briefly for it to clear (up to 2s)
        if (mapObjForManager.__analysisLock) {
          console.log('[applyAnalysisEngineVisualization] Waiting for existing analysis lock');
          await waitForUnlock(mapObjForManager, 2000);
        }

        // Acquire lock
        mapObjForManager.__analysisLock = true;
      }

      // Remove any existing analysis layers INSIDE THE LOCK (check both title and __isAnalysisLayer property)
      const existingLayers = mapView.map.layers.filter((layer) => {
        const title = (layer as __esri.Layer).title as string | undefined;
        const isAnalysisLayer = (layer as any).__isAnalysisLayer === true;
        const hasAnalysisTitle = Boolean(title && (title.includes('Analysis') || title.includes('AnalysisEngine')));
        return isAnalysisLayer || hasAnalysisTitle;
      });
      
      if (existingLayers.length > 0) {
        console.log('[applyAnalysisEngineVisualization] 🗑️ REMOVING EXISTING ANALYSIS LAYERS:', {
          layerCount: existingLayers.length,
          reason: 'Adding new visualization layer (inside lock)'
        });
      }
      
      mapView.map.removeMany(existingLayers.toArray());
      
      // ALSO remove SampleAreasPanel graphics that might overlap with analysis
      // These are graphics with zipCode attribute added by SampleAreasPanel
      const sampleAreaGraphics = mapView.graphics.toArray().filter((graphic: any) => 
        graphic.attributes && graphic.attributes.zipCode
      );
      
      if (sampleAreaGraphics.length > 0) {
        console.log('[applyAnalysisEngineVisualization] 🗑️ REMOVING SAMPLE AREA GRAPHICS:', {
          graphicCount: sampleAreaGraphics.length,
          reason: 'Preventing overlap with analysis visualization'
        });
        mapView.graphics.removeMany(sampleAreaGraphics);
      }

      // Perform the add while lock is held
      mapView.map.add(featureLayer);

      // Store metadata for theme switch protection
      // Tag metadata in a type-safe way
      (featureLayer as unknown as { __isAnalysisLayer?: boolean }).__isAnalysisLayer = true;
      (featureLayer as unknown as { __createdAt?: number }).__createdAt = Date.now();

      // Also store last-applied signature and layer id for the duplicate-guard
      try {
        if (mapObjForManager) {
          mapObjForManager.__lastAnalysisSignature = signature;
          mapObjForManager.__lastAnalysisSignatureAt = Date.now();
          mapObjForManager.__lastAnalysisLayerId = featureLayer.id;
          // If a visualization manager exists, resolve its in-flight promise
          if (vmanOwner) {
            vmanOwner.lastSignature = signature;
            vmanOwner.lastLayerId = featureLayer.id;
            if (typeof vmanOwner.resolve === 'function') {
              try { vmanOwner.resolve(featureLayer); } catch { /* ignore */ }
            }
          }
        }
      } catch (metaErr) {
        console.warn('[applyAnalysisEngineVisualization] Failed to write map metadata:', metaErr);
      }

      console.log('[applyAnalysisEngineVisualization] ✅ Analysis layer added with protection metadata');
    } catch (addErr) {
      // If we are the manager owner, reject the in-flight promise so awaiters fail fast
      try {
        if (isManagerOwner && vmanOwner && typeof vmanOwner.reject === 'function') {
          vmanOwner.reject(addErr);
        }
      } catch {
        // ignore
      }
      throw addErr;
    } finally {
      // Always release lock
      try {
        if (mapObjForManager) mapObjForManager.__analysisLock = false;
      } catch (releaseErr) {
        console.warn('[applyAnalysisEngineVisualization] Failed to clear analysis lock:', releaseErr);
      }

      // Cleanup visualization manager in-flight state if we own it
      try {
        if (isManagerOwner && vmanOwner) {
          try { if (vmanOwner.__inFlightTimer) { clearTimeout(vmanOwner.__inFlightTimer); vmanOwner.__inFlightTimer = null; } } catch { /* ignore */ }
          vmanOwner.inFlight = null;
          vmanOwner.resolve = null;
          vmanOwner.reject = null;
        }
      } catch {
        // ignore
      }
    }

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