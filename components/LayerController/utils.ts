import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import type { LayerConfig, ProjectLayerConfig } from '@/types/layers';
import type { LayerState, LayerStatesMap } from './types';
import { STANDARD_OPACITY } from '@/utils/renderer-standardization';

// Use the local types from LayerController
export interface LocalLayerState {
  layer: __esri.FeatureLayer | null;
  visible: boolean;
  loading: boolean;
  group: string;
  error?: string;
  filters: any[];
  name?: string;
  subGroup?: string;
  queryResults?: {
    features: any[];
    fields: any[];
  };
  active: boolean;
  isVirtual?: boolean;
  sourceLayerId?: string;
  rendererField?: string;
}

type LocalLayerStatesMap = { [key: string]: LocalLayerState };

interface PopupField {
  name: string;
  label: string;
}

/**
 * Apply deferred quartile renderer to a layer when it becomes visible
 */
const applyDeferredRenderer = async (layer: FeatureLayer): Promise<void> => {
  const deferredConfig = (layer as any)._deferredRendererConfig;
  if (!deferredConfig) {
    return; // No deferred renderer to apply
  }

  console.log(`[LC applyDeferredRenderer] ✨ Applying deferred quartile renderer to layer: ${layer.id}`);
  
  try {
    const { createQuartileRenderer } = await import('@/utils/createQuartileRenderer');
    const rendererResult = await createQuartileRenderer({
      layer: layer,
      field: deferredConfig.field,
      isCurrency: deferredConfig.isCurrency,
      isCompositeIndex: deferredConfig.isCompositeIndex,
      opacity: deferredConfig.opacity,
      outlineWidth: deferredConfig.outlineWidth,
      outlineColor: deferredConfig.outlineColor
    });
    
    if (rendererResult?.renderer) {
      layer.renderer = rendererResult.renderer;
      console.log(`✅ Successfully applied deferred quartile renderer to layer: ${layer.id}`);
      
      // Clear the deferred config since it's been applied
      delete (layer as any)._deferredRendererConfig;
    } else {
      console.warn(`⚠️ No renderer returned for deferred layer: ${layer.id}`);
    }
  } catch (error) {
    console.error(`❌ Error applying deferred renderer for layer ${layer.id}:`, error);
  }
};

const createLayer = async (
  layerConfig: LayerConfig,
  config: ProjectLayerConfig,
  view: __esri.MapView,
  layerStatesRef: React.MutableRefObject<LayerStatesMap>
): Promise<[FeatureLayer | null, any[]]> => {
  try {
    console.log('[LC createLayer] Starting layer creation for:', layerConfig.id);
    
    // Handle composite index layers specially
    if (layerConfig.type === 'client-side-composite') {
      console.log('[LC createLayer] Creating composite index layer:', layerConfig.id);
      
      try {
        // Import the CompositeIndexLayerService
        const { CompositeIndexLayerService } = await import('@/lib/services/CompositeIndexLayerService');
        
        // Get a reference housing layer for geometry (first available housing layer)
        const housingLayer = view.map.layers.find((l: any) => 
          l.title?.includes('Tenure') || l.title?.includes('Housing')
        ) as __esri.FeatureLayer;
        
        if (!housingLayer) {
          console.error('[LC createLayer] No base housing layer found for composite index');
          return [null, ['No base housing layer available for composite index']];
        }
        
        // Create the service and generate the layer
        const service = new CompositeIndexLayerService(housingLayer);
        let compositeLayer: __esri.FeatureLayer | null = null;
        
        // Create specific composite index based on URL
        if (layerConfig.url.includes('HOT_GROWTH_INDEX')) {
          compositeLayer = await service.createCompositeIndexLayer('HOT_GROWTH_INDEX', 'Hot Growth Index');
        } else if (layerConfig.url.includes('NEW_HOMEOWNER_INDEX')) {
          compositeLayer = await service.createCompositeIndexLayer('NEW_HOMEOWNER_INDEX', 'New Homeowner Index');
        } else if (layerConfig.url.includes('HOUSING_AFFORDABILITY_INDEX')) {
          compositeLayer = await service.createCompositeIndexLayer('HOUSING_AFFORDABILITY_INDEX', 'Affordability Index');
        }
        
        if (compositeLayer) {
          // Configure layer properties
          compositeLayer.title = layerConfig.name;
          compositeLayer.id = layerConfig.id;
          compositeLayer.visible = false;
          compositeLayer.popupEnabled = false;
          
          // Set scale visibility to ensure composite layers are visible at all zoom levels
          compositeLayer.minScale = 0; // Visible at all zoom levels
          compositeLayer.maxScale = 0; // Visible at all zoom levels
          
          // Apply skipLayerList property for composite layers
          if (layerConfig.skipLayerList) {
            (compositeLayer as any).listMode = "hide";
            console.log(`Composite layer ${layerConfig.name} will be hidden from layer list`);
          }
          
          console.log(`✅ Composite index layer created: ${layerConfig.id}`);
          return [compositeLayer, []];
        } else {
          return [null, ['Failed to create composite index layer']];
        }
      } catch (error) {
        console.error('[LC createLayer] Error creating composite index layer:', error);
        return [null, [error instanceof Error ? error.message : 'Composite index creation failed']];
      }
    }
    
    // Regular feature service layer creation
    // Add timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Layer load timeout')), 30000); // 30 second timeout
    });

    const layer = new FeatureLayer({
      url: layerConfig.url,
      outFields: ['*'],
      title: layerConfig.name,
      id: layerConfig.id,
      visible: false,
      popupEnabled: false // Disable ArcGIS popups so CustomPopupManager can handle them
    });

    // Race between layer load and timeout
    try {
      await Promise.race([layer.load(), timeoutPromise]);
      console.log(`[LC createLayer] Layer loaded: ${layerConfig.id}`);
    } catch (loadError) {
      console.error(`[LC createLayer] Layer ${layerConfig.id} failed to load:`, loadError);
      return [null, [loadError instanceof Error ? loadError.message : 'Unknown load error']];
    }

    // Apply skipLayerList property to hide layers from the layer list widget if specified
    if (layerConfig.skipLayerList) {
      (layer as any).listMode = "hide";
      console.log(`Layer ${layerConfig.name} will be hidden from layer list`);
    }
    
    // Set scale visibility to ensure layers are visible at all zoom levels
    layer.minScale = 0; // Visible at all zoom levels
    layer.maxScale = 0; // Visible at all zoom levels
    console.log(`[LC createLayer] Set scale visibility for all zoom levels: ${layerConfig.id}`);
    
    // Note: Popups will be handled by CustomPopupManager component (green popup style)
    console.log(`✅ Layer created for CustomPopupManager handling: ${layerConfig.id}`);
    
    if (layer.fields) {
      console.log(`[LC createLayer] Available fields for ${layerConfig.id}:`, layer.fields.map(f => f.name));
    }

    // Check for renderer field existence
    if (layerConfig.rendererField && !layer.fields?.find(f => f.name === layerConfig.rendererField)) {
      console.error(`[LC createLayer] Renderer field '${layerConfig.rendererField}' not found in layer '${layerConfig.id}'. Available fields:`, layer.fields?.map(f => f.name));
      return [null, [`Renderer field '${layerConfig.rendererField}' not found`]];
    }

    // **DEFERRED: Skip quartile renderer creation during initial load for performance**
    // Renderers will be applied when layers become visible
    if (layerConfig.rendererField) {
      console.log(`[LC createLayer] ⏳ Deferring quartile renderer for layer: ${layerConfig.id}, field: ${layerConfig.rendererField} (will apply when visible)`);
      
      // Store renderer configuration for later application
      (layer as any)._deferredRendererConfig = {
        field: layerConfig.rendererField,
        isCurrency: layerConfig.type === 'amount',
        isCompositeIndex: layerConfig.type === 'index',
        opacity: STANDARD_OPACITY,
        outlineWidth: 0.5,
        outlineColor: [128, 128, 128]
      };
      
      console.log(`⚡ Layer ${layerConfig.id} loaded without renderer - will apply on visibility change`);
    } else {
      console.log(`[LC createLayer] No rendererField specified for layer: ${layerConfig.id}, using default styling`);
      
      // Special handling for point location layers to ensure they're visible
      if (layerConfig.name?.toLowerCase().includes('locations') || 
          layerConfig.name?.toLowerCase().includes('points')) {
        console.log(`[LC createLayer] 📍 Setting up simple renderer for location layer: ${layerConfig.id}`);
        
        try {
          if (layer.geometryType === 'point') {
            // Import renderer classes
            const SimpleMarkerSymbol = await import('@arcgis/core/symbols/SimpleMarkerSymbol');
            const SimpleRenderer = await import('@arcgis/core/renderers/SimpleRenderer');
            
            const symbol = new SimpleMarkerSymbol.default({
              style: 'square', // Changed to square
              color: [0, 172, 78, 1], // Green color #00AC4E
              size: 10, // Good visibility size
              outline: {
                color: [255, 255, 255, 1], // White border
                width: 1
              }
            });
            
            layer.renderer = new SimpleRenderer.default({
              symbol: symbol
            });
            
            // Set full opacity and remove any scale dependencies
            layer.opacity = 1.0;
            layer.minScale = 0; // Visible at all zoom levels
            layer.maxScale = 0; // Visible at all zoom levels
            
            console.log(`✅ Applied green square renderer to location layer: ${layerConfig.id}`, {
              geometryType: layer.geometryType,
              renderer: layer.renderer,
              opacity: layer.opacity,
              minScale: layer.minScale,
              maxScale: layer.maxScale,
              featureCount: await layer.queryFeatureCount()
            });
          } else {
            console.warn(`⚠️ Location layer ${layerConfig.id} is not a point layer, geometry type: ${layer.geometryType}`);
          }
        } catch (rendererError) {
          console.error(`❌ Error setting up location renderer for ${layerConfig.id}:`, rendererError);
        }
      }
    }

    return [layer, []];
  } catch (error) {
    console.error('[LC createLayer] Error creating/loading layer:', layerConfig.id, error);
    // Clean up any partially loaded layer
    if (error instanceof Error && error.message === 'Layer load timeout') {
      console.error(`[LC createLayer] Layer ${layerConfig.id} failed to load within timeout period`);
    }
    return [null, [error instanceof Error ? error.message : 'Unknown error']];
  }
};

export { createLayer, applyDeferredRenderer };
// Do not export LocalLayerState or LocalLayerStatesMap from this file 