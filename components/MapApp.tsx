/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import '@/components/widget-styles.css';
import '@/components/popup-styles.css';
import esriConfig from "@arcgis/core/config";
import * as intl from "@arcgis/core/intl";
import MapClient from '@/components/map/MapClient';
import MapContainer from '@/components/MapContainer';
import CustomPopupManager from './popup/CustomPopupManager';
import CustomZoom from './CustomZoom';
import { LegendItem } from '@/components/MapLegend';
import { LegendType } from '@/types/legend';
import { SampleHotspot } from '@/components/map/SampleHotspots';
import { LoadingModal } from '@/components/LoadingModal';
import SampleAreasPanel from '@/components/map/SampleAreasPanel';
import CompositeIndexLayerManager from '@/components/map/CompositeIndexLayerManager';

console.log('[MAP_APP] MapApp component function body executing');

// Configure ArcGIS assets path and locale
esriConfig.assetsPath = "/assets";
// Set locale to ensure t9n files load properly
intl.setLocale("en");

// Dynamic imports
const ResizableSidebar = dynamic(() => import('@/components/ResizableSidebar'), { 
  ssr: false 
});

const DynamicGeospatialChat = dynamic(() => import('@/components/geospatial-chat-interface').then(mod => ({ default: mod.EnhancedGeospatialChat })), { 
  ssr: false 
});

const DynamicMapWidgets = dynamic(() => import('@/components/MapWidgets'), {
  ssr: false
});

const DynamicUnifiedAnalysis = dynamic(() => import('@/components/unified-analysis/UnifiedAnalysisWorkflow'), {
  ssr: false
});

// Define widget buttons and visible widgets

const VISIBLE_WIDGETS = ['search', 'bookmarks', 'layerList', 'print', 'basemapGallery', 'quickStats'];

interface MapLegendState {
  title: string;
  type: LegendType;
  items?: LegendItem[];
  visible: boolean;
  ternaryData?: Array<{
    values: [number, number, number];
    label?: string;
    color?: string;
  }>;
  labels?: [string, string, string];
  components?: Array<{
    title: string;
    type: 'size' | 'color';
    items: LegendItem[];
  }>;
}


export const MapApp: React.FC = memo(() => {
  const [mapView, setMapView] = useState<__esri.MapView | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<__esri.FeatureLayer | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(640);
  const [showLabels, setShowLabels] = useState(false);
  const [featureLayers, setFeatureLayers] = useState<__esri.FeatureLayer[]>([]);
  const [mapLegend, setMapLegend] = useState<MapLegendState>({
    title: '',
    type: 'simple',
    items: [],
    visible: false
  });
  const [layerStates, setLayerStates] = useState<{[key: string]: any}>({});
  const [formattedLegendData, setFormattedLegendData] = useState<any>(null);
  const [visualizationResult, setVisualizationResult] = useState<any>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<SampleHotspot | null>(null);
  const [mapContainerReady, setMapContainerReady] = useState(false);
  const [showSampleAreasPanel, setShowSampleAreasPanel] = useState(true);


  // Sync formattedLegendData with mapLegend state
  useEffect(() => {
    if (formattedLegendData) {
      console.log('[MapApp] Setting map legend from formattedLegendData:', {
        title: formattedLegendData.title,
        type: formattedLegendData.type,
        itemCount: formattedLegendData.items?.length || 0,
        componentCount: formattedLegendData.components?.length || 0,
        isDualVariable: formattedLegendData.type === 'dual-variable',
        sampleItems: formattedLegendData.items?.slice(0, 3)?.map((item: any) => ({
          label: item.label,
          color: item.color,
          size: item.size,
          shape: item.shape
        }))
      });
      
      setMapLegend({
        title: formattedLegendData.title || '',
        type: formattedLegendData.type || 'standard',
        items: formattedLegendData.items,
        visible: true,
        ternaryData: formattedLegendData.ternaryData,
        labels: formattedLegendData.labels,
        components: formattedLegendData.components
      });
    } else {
      setMapLegend({
        title: '',
        type: 'simple',
        items: [],
        visible: false
      });
    }
  }, [formattedLegendData]);

  // Load ArcGIS CSS dynamically to avoid webpack issues
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://js.arcgis.com/4.32/esri/themes/light/main.css';
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    
    // Cleanup layer protection on unmount
    return () => {
      if ((window as any).mapView) {
        import('../utils/layer-protection').then(({ deactivateLayerProtection }) => {
          deactivateLayerProtection((window as any).mapView);
        });
      }
    };
  }, []);

  // Simple handlers
  const handleMapLoad = useCallback((view: __esri.MapView) => {
    setMapView(view);
    // Store global reference for theme switch debugging
    (window as any).mapView = view;
    
    // Activate layer protection system
    import('../utils/layer-protection').then(({ activateLayerProtection }) => {
      activateLayerProtection(view);
    });
  }, []);

  const handleMapError = useCallback((error: Error) => {
    console.error('[MapApp] Map error:', error);
    // Map error handled silently unless debugging
  }, []);

  const handleToggleWidget = useCallback((widgetName: string) => {
    if (widgetName === 'quickStats') {
      setShowSampleAreasPanel(prev => !prev);
      setActiveWidget(null); // Close any other active widgets
    } else {
      setActiveWidget(prev => prev === widgetName ? null : widgetName);
      setShowSampleAreasPanel(false); // Close Sample Areas Panel when other widgets open
    }
  }, []);

  const handleCloseWidget = useCallback(() => {
    setActiveWidget(null);
    setShowSampleAreasPanel(false);
  }, []);

  const handleLayerSelect = useCallback((layer: __esri.FeatureLayer) => {
    setSelectedLayer(layer);
  }, []);

  const handleLayerStatesChange = useCallback((states: { [key: string]: any }) => {
    setLayerStates(states);
  }, []);

  // NEW: Handle LayerController layers for CustomPopupManager
  const handleLayersCreated = useCallback((layers: __esri.FeatureLayer[]) => {
    console.log('[MapApp] LayerController layers created for CustomPopupManager:', layers.length);
    setFeatureLayers(prevLayers => {
      // Remove any existing LayerController layers and add new ones
      const nonLayerControllerLayers = prevLayers.filter(layer => 
        !layer.id.includes('layer-controller') && 
        !layers.some(newLayer => newLayer.id === layer.id)
      );
      return [...nonLayerControllerLayers, ...layers];
    });
  }, []);

  // NEW: Handle SampleAreasPanel layers for CustomPopupManager
  const handleSampleAreasLayersCreated = useCallback((layers: __esri.FeatureLayer[]) => {
    console.log('[MapApp] SampleAreasPanel layers created for CustomPopupManager:', layers.length);
    setFeatureLayers(prevLayers => {
      // Remove any existing sample area layers and add new ones
      const nonSampleAreaLayers = prevLayers.filter(layer => 
        !layer.title?.includes('ZIP Codes') && 
        !layers.some(newLayer => newLayer.id === layer.id)
      );
      return [...nonSampleAreaLayers, ...layers];
    });
  }, []);

  // Memoize layer state update handler for AITab
  const handleLayerStateChange = useCallback((layerId: string, state: any) => {
    setLayerStates(prev => ({ ...prev, [layerId]: state }));
  }, []);

  // Memoize visualization handlers
  const handleVisualizationCreated = useCallback(() => {
    if (mapView?.map) {
      const currentFeatureLayers = mapView.map.allLayers
        .filter(layer => layer.type === 'feature')
        .toArray() as __esri.FeatureLayer[];
      
      console.log('[MapApp] Updating featureLayers for CustomPopupManager:', {
        totalLayers: currentFeatureLayers.length,
        layerIds: currentFeatureLayers.map(l => l.id),
        layerTitles: currentFeatureLayers.map(l => l.title)
      });
      
      setFeatureLayers(currentFeatureLayers);
    }
  }, [mapView]);

  // Handle analysis start - close sample panel to show visualization
  const handleAnalysisStart = useCallback(() => {
    console.log('[MapApp] Analysis starting - closing sample areas panel');
    setShowSampleAreasPanel(false);
  }, []);

  // Handle visualization layer creation for CustomPopupManager integration
  const handleVisualizationLayerCreated = useCallback((layer: __esri.FeatureLayer | null, shouldReplace?: boolean) => {
    console.log('[MapApp] ★★★ handleVisualizationLayerCreated CALLED ★★★', {
      hasLayer: !!layer,
      layerId: layer?.id,
      layerTitle: layer?.title,
      shouldReplace
    });
    
    if (layer) {
      setFeatureLayers(prevLayers => {
        // Remove any existing analysis layers if shouldReplace is true
        const filteredLayers = shouldReplace 
          ? prevLayers.filter(l => !l.title?.includes('AnalysisEngine') && !l.title?.includes('Analysis'))
          : prevLayers;
        
        // Add the new layer if it's not already in the list
        const layerExists = filteredLayers.some(l => l.id === layer.id);
        if (!layerExists) {
          console.log('[MapApp] Adding visualization layer to featureLayers for CustomPopupManager:', layer.id);
          return [...filteredLayers, layer];
        }
        
        return filteredLayers;
      });
    } else if (shouldReplace) {
      // Remove all analysis layers
      setFeatureLayers(prevLayers => 
        prevLayers.filter(l => !l.title?.includes('AnalysisEngine') && !l.title?.includes('Analysis'))
      );
    }
  }, []);

  // Handle unified workflow completion
  const handleUnifiedAnalysisComplete = useCallback(async (_result: any) => {
    console.log('[MapApp] ★★★ handleUnifiedAnalysisComplete CALLED ★★★');
    console.log('[MapApp] Analysis complete - UnifiedAnalysisWorkflow handles visualization now');
    
    // No need to handle visualization here anymore since UnifiedAnalysisWorkflow does it
    // This callback is kept for any future needs like additional processing
  }, []);

  const handleCorrelationAnalysis = useCallback((layer: __esri.FeatureLayer, primaryField: string, comparisonField: string) => {
    // Handle correlation analysis
    console.log('Correlation analysis requested:', { layer, primaryField, comparisonField });
  }, []);

  // Handle sample hotspot clicks
  const handleSampleHotspotClick = useCallback((hotspot: SampleHotspot) => {
    console.log('[MapApp] Sample hotspot selected:', hotspot);
    setSelectedHotspot(hotspot);
  }, []);

  // Handle MapContainer ready state
  const handleMapContainerReady = useCallback(() => {
    setMapContainerReady(true);
  }, []);

  // Memoize static configurations
  const memoizedVisibleWidgets = useMemo(() => VISIBLE_WIDGETS, []);

  console.log('[MapApp] Render state:', { mounted, mapView: !!mapView, activeWidget });

  if (!mounted) {
    return <LoadingModal progress={0} show={true} />;
  }

  return (
    <>
      {/* Show LoadingModal until MapContainer takes over */}
      {(!mapView || !mapContainerReady) && <LoadingModal progress={0} show={true} />}
      
      <div className="fixed inset-0 flex">
        {/* Left Toolbar */}
        <div className="w-16 flex flex-col z-[9999]" style={{ 
          backgroundColor: 'var(--theme-bg-secondary)',
          borderRight: '1px solid var(--theme-border)'
        }}>
          {/* Home button hidden */}
          
          {/* Widget Icons */}
          {mapView && (
            <DynamicMapWidgets
              view={mapView}
              activeWidget={activeWidget}
              onClose={handleCloseWidget}
              onLayerSelect={handleLayerSelect}
              onToggleWidget={handleToggleWidget}
              onCorrelationAnalysis={handleCorrelationAnalysis}
              visibleWidgets={memoizedVisibleWidgets}
              onLayerStatesChange={handleLayerStatesChange}
              onLayersCreated={handleLayersCreated}
              showQuickStatsPanel={showSampleAreasPanel}
            />
          )}
        </div>

        {/* Main Map Container */}
        <div 
          className="flex-1 relative" 
          style={{
            marginRight: `${Math.max(0, (sidebarWidth - 64) / 2)}px`,
            transition: 'margin-right 0.2s ease'
          }}
        >
          <MapClient
            key="main-map-client"
            onMapLoad={handleMapLoad}
            onError={handleMapError}
            sidebarWidth={sidebarWidth}
            showLabels={showLabels}
            legend={mapLegend}
            onSampleHotspotClick={handleSampleHotspotClick}
            showSampleHotspots={false}
          />
          

          {/* Sample Areas Panel */}
          {/* {mapView && (
            <SampleAreasPanel
              view={mapView}
              onClose={() => setShowSampleAreasPanel(false)}
              visible={showSampleAreasPanel}
            />
          )} */}
          
          {/* Composite Index Layer Manager */}
          {mapView && featureLayers.length > 0 && (
            <CompositeIndexLayerManager
              view={mapView}
              visible={true}
              baseHousingLayer={featureLayers.find(layer => layer.title?.includes('Tenure')) || featureLayers[0]}
            />
          )}
          
          {/* Layer Controller and Management */}
          {mapView && (
            <MapContainer
              view={mapView}
              analysisConfig={{ layers: {} }}
              onReady={handleMapContainerReady}
            />
          )}
          
          {/* Custom popup handler for each feature layer */}
          {mapView && mapView.map && featureLayers.map(layer => {
            console.log('[MapApp] Creating CustomPopupManager for layer:', {
              layerId: layer.id,
              layerTitle: layer.title,
              layerType: layer.type,
              popupEnabled: layer.popupEnabled
            });
            return (
              <CustomPopupManager
                key={layer.id}
                mapView={mapView}
                layer={layer}
              />
            );
          })}
          
          {/* Custom zoom controls */}
          {mapView && (
            <CustomZoom
              view={mapView}
              sidebarWidth={sidebarWidth}
            />
          )}
        </div>

        {/* Right Sidebar */}
        <ResizableSidebar
          key="main-sidebar"
          view={mapView}
          layerStates={layerStates}
          defaultWidth={sidebarWidth}
          minWidth={300}
          maxWidth={800}
          onWidthChange={setSidebarWidth}
          onLayerStatesChange={setLayerStates}
          chatInterface={
            mapView ? (
              <DynamicUnifiedAnalysis
                key="main-unified-analysis"
                view={mapView}
                setFormattedLegendData={setFormattedLegendData}
                enableChat={true}
                defaultAnalysisType="comprehensive"
                selectedHotspot={selectedHotspot}
                onHotspotProcessed={() => setSelectedHotspot(null)}
                onAnalysisStart={handleAnalysisStart}
                onAnalysisComplete={handleUnifiedAnalysisComplete}
                onVisualizationLayerCreated={handleVisualizationLayerCreated}
              />
            ) : null
          }
        />
      </div>
    </>
  );
});

MapApp.displayName = 'MapApp';

export default MapApp;