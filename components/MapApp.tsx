/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import '@/components/widget-styles.css';
import '@/components/popup-styles.css';
import esriConfig from "@arcgis/core/config";
import MapClient from '@/components/map/MapClient';
import MapContainer from '@/components/MapContainer';
import CustomPopupManager from './popup/CustomPopupManager';
import CustomZoom from './CustomZoom';
import { LegendItem } from '@/components/MapLegend';
import { LegendType } from '@/types/legend';

console.log('[MAP_APP] MapApp component function body executing');

// Configure ArcGIS assets path
esriConfig.assetsPath = "/assets";

// Dynamic imports
const ResizableSidebar = dynamic(() => import('@/components/ResizableSidebar'), { 
  ssr: false 
});

const DynamicAITab = dynamic(() => import('@/components/tabs/AITab'), { 
  ssr: false 
});

const DynamicMapWidgets = dynamic(() => import('@/components/MapWidgets'), {
  ssr: false
});

// Define widget buttons and visible widgets

const VISIBLE_WIDGETS = ['search', 'bookmarks', 'layerList', 'print', 'basemapGallery'];

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
  const [sidebarWidth, setSidebarWidth] = useState(640); // Increased by 40px
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
  }, []);

  // Simple handlers
  const handleMapLoad = useCallback((view: __esri.MapView) => {
    setMapView(view);
  }, []);

  const handleMapError = useCallback((error: Error) => {
    console.error('[MapApp] Map error:', error);
    // Map error handled silently unless debugging
  }, []);

  const handleToggleWidget = useCallback((widgetName: string) => {
    setActiveWidget(prev => prev === widgetName ? null : widgetName);
  }, []);

  const handleCloseWidget = useCallback(() => {
    setActiveWidget(null);
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
      setFeatureLayers(currentFeatureLayers);
    }
  }, [mapView]);

  const handleCorrelationAnalysis = useCallback((layer: __esri.FeatureLayer, primaryField: string, comparisonField: string) => {
    // Handle correlation analysis
    console.log('Correlation analysis requested:', { layer, primaryField, comparisonField });
  }, []);

  // Memoize static configurations
  const memoizedVisibleWidgets = useMemo(() => VISIBLE_WIDGETS, []);

  console.log('[MapApp] Render state:', { mounted, mapView: !!mapView, activeWidget });

  if (!mounted) {
    return <div />;
  }

  return (
    <>      
      <div className="fixed inset-0 flex">
        {/* Left Toolbar */}
        <div className="w-16 bg-gray-100 flex flex-col z-[9999]">
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
            />
          )}
        </div>

        {/* Main Map Container */}
        <div className="flex-1 relative">
          <MapClient
            key="main-map-client"
            onMapLoad={handleMapLoad}
            onError={handleMapError}
            sidebarWidth={sidebarWidth}
            showLabels={showLabels}
            legend={mapLegend}
          />
          
          {/* Layer Controller and Management */}
          {mapView && (
            <MapContainer
              view={mapView}
              analysisConfig={{ layers: {} }}
            />
          )}
          
          {/* Custom popup handler for each feature layer */}
          {mapView && mapView.map && featureLayers.map(layer => (
            <CustomPopupManager
              key={layer.id}
              mapView={mapView}
              layer={layer}
            />
          ))}
          
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
              <DynamicAITab
                key="main-ai-tab"
                view={mapView}
                layerStates={layerStates}
                onLayerStateChange={handleLayerStateChange}
                setFormattedLegendData={setFormattedLegendData}
                setVisualizationResult={setVisualizationResult}
                mapViewRefValue={mapView}
                onVisualizationCreated={handleVisualizationCreated}
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