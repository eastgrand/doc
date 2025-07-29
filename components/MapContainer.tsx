import React, { useRef, useState, useEffect, useCallback } from 'react';
import LayerController, { type LayerControllerRef } from './LayerController/LayerController';
import type { LayerStatesMap } from './LayerController/types';
import { LoadingModal } from './LoadingModal';
import { createProjectConfig } from '@/adapters/layerConfigAdapter';
//import { AIAnalysisManager } from './AIAnalysisManager';
import type { LayerState, ProjectLayerConfig } from '@/types/layers';

interface AnalysisConfig {
  layers: {
    [key: string]: {
      url?: string;
      title?: string;
    };
  };
}

interface MapContainerProps {
  view: __esri.MapView;
  analysisConfig: AnalysisConfig;
}

const MapContainer = React.memo(({ view, analysisConfig }: MapContainerProps) => {
  const layerControllerRef = useRef<LayerControllerRef>(null);
  const [layerConfig, setLayerConfig] = useState<ProjectLayerConfig | null>(null);
  
  // State for loading modal
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 0 });
  const [showLoadingModal, setShowLoadingModal] = useState(true);
  const [layerControllerInitialized, setLayerControllerInitialized] = useState(false);
  const [allLayersFullyLoaded, setAllLayersFullyLoaded] = useState(false);

  // Use refs to track initialization state and prevent loops
  const initializationCompleted = useRef(false);
  const lastViewId = useRef<string | null>(null);

  // Stable callbacks using useCallback with minimal dependencies
  const handleLayerInitializationProgress = useCallback(({ loaded, total }: { loaded: number; total: number; }) => {
    setLoadingProgress({ loaded, total });
    
    // Check if all layers are fully loaded
    if (loaded === total && total > 0) {
      // Add a small delay to ensure all renderers are applied
      setTimeout(() => {
        setAllLayersFullyLoaded(true);
      }, 1000); // Give 1 second for all quartile renderers to complete
    }
  }, []);

  const handleLayerInitializationComplete = useCallback(() => {
    setLayerControllerInitialized(true);
    initializationCompleted.current = true; // Mark as completed
    
    // BACKUP: Force loading modal to disappear after 3 seconds if it's still hanging
    setTimeout(() => {
      console.log('[MapContainer] INITIALIZATION COMPLETE TIMEOUT: Forcing loading modal to close after 3 seconds');
      setShowLoadingModal(false);
      setAllLayersFullyLoaded(true);
    }, 3000);
  }, []);

  // Initialize layer config - only run once per unique view
  useEffect(() => {
    if (!view || !view.map) return;
    
    // Create a unique ID for this view using the container element
    const viewId = view.container ? `view-${view.container.id || 'default'}` : 'default';
    
    // Only initialize if we haven't completed initialization or this is truly a new view
    if (initializationCompleted.current && lastViewId.current === viewId) {
      return;
    }
    
    lastViewId.current = viewId;
    
    try {
      const config = createProjectConfig();
      setLayerConfig(config);
      
      // Only reset state if we haven't completed initialization yet
      if (!initializationCompleted.current) {
        setLayerControllerInitialized(false);
        setShowLoadingModal(true);
        setAllLayersFullyLoaded(false);
        setLoadingProgress({ loaded: 0, total: 0 });
        
        // ADDITIONAL BACKUP: Force close loading modal after 8 seconds regardless
        setTimeout(() => {
          console.log('[MapContainer] BACKUP TIMEOUT: Forcing loading modal to close after 8 seconds');
          setShowLoadingModal(false);
          setAllLayersFullyLoaded(true);
          setLayerControllerInitialized(true);
        }, 8000);
      }
    } catch (error) {
      setShowLoadingModal(false);
    }
  }, [view]); // Add view as a dependency

  // Hide modal only when ALL layers are fully loaded AND initialization is complete
  useEffect(() => {
    if (layerControllerInitialized && allLayersFullyLoaded && showLoadingModal) {
      setShowLoadingModal(false);
    }
  }, [layerControllerInitialized, allLayersFullyLoaded, showLoadingModal]);
  
  // EMERGENCY: If view exists and we're still loading after 5 seconds, force close
  useEffect(() => {
    if (view && showLoadingModal) {
      const emergencyTimeout = setTimeout(() => {
        console.log('[MapContainer] EMERGENCY TIMEOUT: View exists but loading modal still showing after 5 seconds - forcing close');
        setShowLoadingModal(false);
        setAllLayersFullyLoaded(true);
        setLayerControllerInitialized(true);
      }, 5000);
      
      return () => clearTimeout(emergencyTimeout);
    }
  }, [view, showLoadingModal]);

  // Create feature layer map for analysis manager
  const createFeatureLayerMap = useCallback((
    currentView: __esri.MapView | null, 
    config: AnalysisConfig
  ): Record<string, __esri.FeatureLayer> => {
    const layerMap: Record<string, __esri.FeatureLayer> = {};
  
    if (!currentView) {
      console.warn('View is null, cannot create layer map');
      return {};
    }
  
   /* console.log('Creating Layer Map:', {
      totalLayers: currentView.map.layers.length
    });*/
  
    currentView.map.layers.forEach((layer, index) => {
      if (layer.type !== 'feature') {
      //  console.log(`Skipping non-feature layer: ${layer.id}`);
        return;
      }
  
      const featureLayer = layer as __esri.FeatureLayer;
      
     /* console.log(`Processing layer ${index}:`, {
        id: featureLayer.id,
        title: featureLayer.title,
        url: featureLayer.url
      });*/
      
      // Find matching configuration
      const matchingKey = Object.keys(config.layers).find(key => {
        const layerConfig = config.layers[key];
        
        if (layerConfig?.url && featureLayer.url) {
          const configUrl = layerConfig.url.toLowerCase();
          const layerUrl = featureLayer.url.toLowerCase();
          if (layerUrl === configUrl) return true;
        }
        
        if (layerConfig?.title && featureLayer.title) {
          const configTitle = layerConfig.title.toLowerCase();
          const layerTitle = featureLayer.title.toLowerCase();
          if (layerTitle === configTitle) return true;
        }
        
        return false;
      });
  
      if (matchingKey) {
      //  console.log(`Mapped layer: ${featureLayer.title} to config key: ${matchingKey}`);
        layerMap[matchingKey] = featureLayer;
      } else {
        console.warn(`Could not map layer: ${featureLayer.title || featureLayer.id}`);
      }
    });
  
   /* console.log('Final Layer Map:', {
      mappedLayers: Object.keys(layerMap),
      totalConfigured: Object.keys(config.layers).length
    });*/
  
    return layerMap;
  }, []);

  // Handle layer state changes
  const handleLayerStatesChange = useCallback((newStates: LayerStatesMap) => {
    if (!view) return;
    try {
      // const featureLayers = createFeatureLayerMap(view, analysisConfig);
    } catch (error) {
      console.error('Error handling layer states:', error);
    }
  }, [view]); // Remove createFeatureLayerMap from dependencies since it's not used

  const calculatedProgress = loadingProgress.total > 0 ? (loadingProgress.loaded / loadingProgress.total) * 100 : 0;

 /* console.log('[MC] Render:', { 
    hasLayerConfig: !!layerConfig, 
    showLoadingModal, 
    calculatedProgress,
    willRenderModal: !!layerConfig 
  });*/

  if (layerConfig) {
   // console.log('[MC] About to render LoadingModal with:', { progress: calculatedProgress, show: showLoadingModal });
  }

  return (
    <div className="relative w-full h-full">
      {layerConfig && <LoadingModal progress={calculatedProgress} show={showLoadingModal} />}

      {view && layerConfig && (
        <div className="absolute top-4 right-4 w-80">
          <LayerController
            ref={layerControllerRef}
            view={view}
            config={layerConfig}
            onLayerStatesChange={handleLayerStatesChange}
            onLayerInitializationProgress={handleLayerInitializationProgress}
            onInitializationComplete={handleLayerInitializationComplete}
            visible={true}
          />
        </div>
      )}
    </div>
  );
});

MapContainer.displayName = 'MapContainer';

export default MapContainer;