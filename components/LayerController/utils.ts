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

const createLayer = async (
  layerConfig: LayerConfig,
  config: ProjectLayerConfig,
  view: __esri.MapView,
  layerStatesRef: React.MutableRefObject<LayerStatesMap>
): Promise<[FeatureLayer | null, any[]]> => {
  try {
    console.log('[LC createLayer] Starting layer creation for:', layerConfig.id);
    
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
      popupEnabled: true,
      popupTemplate: {
        title: layerConfig.name,
        content: [
          {
            type: 'fields',
            fieldInfos: (layerConfig as any).popupFields?.map((field: any) => ({
              fieldName: field.name,
              label: field.label,
              visible: true
            })) || []
          }
        ]
      }
    });

    // Race between layer load and timeout
    try {
      await Promise.race([layer.load(), timeoutPromise]);
      console.log(`[LC createLayer] Layer loaded: ${layerConfig.id}`);
    } catch (loadError) {
      console.error(`[LC createLayer] Layer ${layerConfig.id} failed to load:`, loadError);
      return [null, [loadError instanceof Error ? loadError.message : 'Unknown load error']];
    }
    
    if (layer.fields) {
      console.log(`[LC createLayer] Available fields for ${layerConfig.id}:`, layer.fields.map(f => f.name));
    }

    // Check for renderer field existence
    if (layerConfig.rendererField && !layer.fields?.find(f => f.name === layerConfig.rendererField)) {
      console.error(`[LC createLayer] Renderer field '${layerConfig.rendererField}' not found in layer '${layerConfig.id}'. Available fields:`, layer.fields?.map(f => f.name));
      return [null, [`Renderer field '${layerConfig.rendererField}' not found`]];
    }

    // **NEW: Apply quartile renderer for layers with rendererField**
    if (layerConfig.rendererField) {
      console.log(`[LC createLayer] ✨ Applying quartile renderer to layer: ${layerConfig.id}, field: ${layerConfig.rendererField}`);
      
      try {
        const { createQuartileRenderer } = await import('@/utils/createQuartileRenderer');
        const rendererResult = await createQuartileRenderer({
          layer: layer,
          field: layerConfig.rendererField,
          isCurrency: layerConfig.type === 'amount',
          isCompositeIndex: layerConfig.type === 'index',
          opacity: STANDARD_OPACITY,
          outlineWidth: 0.5,
          outlineColor: [128, 128, 128]
        });
        
        if (rendererResult?.renderer) {
          layer.renderer = rendererResult.renderer;
          console.log(`✅ Successfully applied quartile renderer to layer: ${layerConfig.id}`);
        } else {
          console.warn(`⚠️ No renderer returned for layer: ${layerConfig.id}, using default styling`);
        }
      } catch (rendererError) {
        console.error(`❌ Error creating quartile renderer for layer ${layerConfig.id}:`, rendererError);
        // Layer will use default renderer
      }
    } else {
      console.log(`[LC createLayer] No rendererField specified for layer: ${layerConfig.id}, using default styling`);
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

export { createLayer };
// Do not export LocalLayerState or LocalLayerStatesMap from this file 