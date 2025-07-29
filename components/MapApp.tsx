'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import { Search, Layers, Home as HomeIcon, 
  Table as TableIcon, FolderOutput, Folder, Filter, Type as TypeOutline, Combine, 
  Bookmark, Map as MapIcon } from 'lucide-react';
import '@/components/widget-styles.css';
import MapLogo from './MapLogo';
import '@/components/popup-styles.css';
import LayerController from './LayerController/LayerController';
import esriConfig from "@arcgis/core/config";
import MapClient from '@/components/map/MapClient';
import MapContainer from '@/components/MapContainer';
import GraphicsManager from './GraphicsManager';
import { createProjectConfig } from '@/adapters/layerConfigAdapter';
import { enhanceExistingLayerPopups, applyLayerLabels } from '../utils/popupEnhancer';
import { layers } from '@/config/layers';
import CustomPopupManager from './popup/CustomPopupManager';
import type { LayerState as AIToolsLayerState } from '@/types/aitools';
import type { ProjectLayerConfig, LayerConfig } from '@/types/layers';
import type { GeospatialFeature } from '@/types/geospatial-ai-types';
import type { AILayerState } from '@/types/ai-layers';
import type { LayerState } from '@/components/types';
import AITab from '@/components/tabs/AITab';
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import { TextContent, FieldsContent } from "@arcgis/core/popup/content";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import Home from '@arcgis/core/widgets/Home';
import FeatureSet from "@arcgis/core/FeatureSet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import CustomZoom from './CustomZoom';
import { CorrelationAnalysis } from './CorrelationAnalysis';
import { LegendItem } from '@/components/MapLegend';
import { StandardizedLegendData, LegendType } from '@/types/legend';
import { colorToRgba, getSymbolShape, getSymbolSize } from '@/utils/symbol-utils';
import { VisualizationResult as ChatVisualizationResult } from '@/types/geospatial-chat';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Color from '@arcgis/core/Color';
import { LoadingModal } from '@/components/LoadingModal';

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
const WIDGET_BUTTONS = [
  { id: 'search', Icon: Search, label: 'Search', color: '#4285f4' },
  { id: 'bookmarks', Icon: Bookmark, label: 'Bookmarks', color: '#33a852' },
  { id: 'layerList', Icon: Layers, label: 'Layers', color: '#33a852' },
  { id: 'basemapGallery', Icon: MapIcon, label: 'Basemaps', color: '#666666' },
  { id: 'filter', Icon: Filter, label: 'Filter', color: '#33a852' },
  { id: 'print', Icon: FolderOutput, label: 'Export', color: '#3269a8' },
  { id: 'index', Icon: Combine, label: 'Create Index', color: '#4285f4' },
  { id: 'table', Icon: TableIcon, label: 'Attribute Table', color: '#33a852' },
  { id: 'projects', Icon: Folder, label: 'Study Areas', color: '#a83269' }
] as const;

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

// Use AnalysisEngine instead of deleted managers
import { useAnalysisEngine } from '@/lib/analysis';

// Type aliases for backward compatibility
interface FilterConfig {
  field: string;
  operator: string;
  value: any;
}

export const MapApp: React.FC = memo(() => {
  const [mapView, setMapView] = useState<__esri.MapView | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState<__esri.FeatureLayer | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
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

  // Loading state management
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStages, setLoadingStages] = useState({
    mounted: false,
    mapInitialized: false,
    layersLoaded: false,
    analysisToolsReady: false,
    widgetsReady: false
  });

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

  // Track loading progress based on stages
  useEffect(() => {
    const stages = Object.values(loadingStages);
    const completedStages = stages.filter(Boolean).length;
    const totalStages = stages.length;
    const progress = Math.round((completedStages / totalStages) * 100);
    
    setLoadingProgress(progress);
    
    // Hide loading when all stages complete
    if (progress === 100) {
      setTimeout(() => setShowLoading(false), 500);
    }
  }, [loadingStages]);

  useEffect(() => {
    setMounted(true);
    setLoadingStages(prev => ({ ...prev, mounted: true }));
  }, []);

  // Simple handlers
  const handleMapLoad = useCallback((view: __esri.MapView) => {
    console.log('[MapApp] handleMapLoad called with view:', view);
    setMapView(view);
    setLoadingStages(prev => ({ ...prev, mapInitialized: true }));
    
    // Track when layers are loaded
    if (view.map) {
      view.map.allLayers.on('change', () => {
        setLoadingStages(prev => ({ ...prev, layersLoaded: true }));
      });
      
      // Mark layers as loaded if already present
      if (view.map.allLayers.length > 0) {
        setLoadingStages(prev => ({ ...prev, layersLoaded: true }));
      }
    }
    
    console.log('[MapApp] mapView state set');
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
      setLoadingStages(prev => ({ ...prev, analysisToolsReady: true }));
    }
  }, [mapView]);

  // Mark widgets as ready when they're rendered
  useEffect(() => {
    if (mapView && mounted) {
      setTimeout(() => {
        setLoadingStages(prev => ({ ...prev, widgetsReady: true }));
      }, 1000);
    }
  }, [mapView, mounted]);

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
      {/* Loading Modal - blocks all interaction until everything loads */}
      <LoadingModal progress={loadingProgress} show={showLoading} />
      
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
              onLayerStatesChange={handleLayerStatesChange}
              onCorrelationAnalysis={handleCorrelationAnalysis}
              visibleWidgets={memoizedVisibleWidgets}
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
            defaultWidth={400}
            minWidth={300}
            maxWidth={600}
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