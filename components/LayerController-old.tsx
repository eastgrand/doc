/* eslint-disable no-prototype-builtins */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCenter, 
  DragOverlay,
  DragStartEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2, ChevronDown, ChevronRight, X, Info, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from "@/components/ui/progress";
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import * as renderers from '@arcgis/core/renderers';
import * as symbols from '@arcgis/core/symbols';
import SimpleRenderer from "@arcgis/core/renderers/SimpleRenderer";
import SimpleMarkerSymbol from "@arcgis/core/symbols/SimpleMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import { createQuartileRenderer } from '@/utils/createQuartileRenderer';
import { RendererResult } from '@/utils/types';
import { createGTQuartileRenderer } from '@/utils/createGTQuartileRenderer';
import { createPopupTemplate } from './createPopupTemplate';
import {
  BaseLayerConfig,
  IndexLayerConfig,
  PointLayerConfig,
  LayerGroup,
  ProjectLayerConfig,
  ExtendedLayerConfig,
  LayerType,
  VirtualLayer,
  VirtualLayerConfig,
  LayerConfig
} from '@/types/layers';
import { createEnhancedPopupTemplate } from '../map/enhancedPopupTemplate';
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";
import { Button } from '@/components/ui/button';
import { getDefaultLayerRenderer } from './layerRenderers';
import { 
  createEnhancedLayer,
  enhanceExistingLayer,
  verifyLayerInMap
} from './enhancedLayerCreation';
import ClassBreaksRenderer from '@arcgis/core/renderers/ClassBreaksRenderer';
import { StandardizedLegendData, LegendType } from '@/types/legend';
import { colorToRgba, getSymbolShape, getSymbolSize } from '@/utils/symbol-utils';
import { LegendItem } from '@/components/MapLegend';
import LegendPopover from '../LegendPopover';
import { VisualizationControls } from './VisualizationControls';
import type MapView from '@arcgis/core/views/MapView';
import { createLayer } from './utils';
import type { BlendMode } from '@/utils/visualizations/base-visualization';
import Box from '@mui/material/Box';
import CompareArrows from '@mui/icons-material/CompareArrows';
import BarChart from '@mui/icons-material/BarChart';
import Share from '@mui/icons-material/Share';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { LayerSharing } from './LayerSharing';
import { LayerComparison } from './LayerComparison';
import { LayerStatistics } from './LayerStatistics';
import type { LayerStatesMap } from './types';

// Add after imports
const layerMetadata = new Map<string, any>();

const DEFAULT_ERROR_RECOVERY = {
  retryCount: 3,
  maxRetries: 3,
  backoffMs: 1000,
  timeoutMs: 5000
};

type ExtendedPointLayerConfig = PointLayerConfig & ExtendedLayerConfig;
type ExtendedIndexLayerConfig = IndexLayerConfig & ExtendedLayerConfig;

function isPointLayer(config: LayerConfig): config is ExtendedPointLayerConfig {
  return config.type === 'point';
}

function isIndexLayer(config: LayerConfig): config is ExtendedIndexLayerConfig {
  return config.type === 'index';
}

// Export the types
export interface LayerControllerRef {
  layerStates: LayerStatesMap;
  isInitialized: boolean;
  setVisibleLayers: (layers: string[]) => void;
  setLayerStates: (states: LayerStatesMap) => void;
  resetLayers: () => void;
}

interface LayerInitializationProgress {
  total: number;
  loaded: number;
  currentLayer?: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface DraggableLayerProps {
  id: string;
  title: string;
  description: string;
  isVisible: boolean;
  isLoading?: boolean;
  layer: __esri.FeatureLayer | null;
  onToggle: () => void;
  isDragOverlay?: boolean;
  onShowLegend: (layer: __esri.FeatureLayer, anchorEl: HTMLElement) => void;
}

interface DraggableGroupProps {
  id: string;
  title: string;
  description?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: React.ReactNode;
}

// Switch Component
const Switch = ({ checked, onCheckedChange, disabled }: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}): JSX.Element => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onCheckedChange(!checked)}
    disabled={disabled}
    className={`
      relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
      transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 
      focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
      ${checked ? 'bg-green-500' : 'bg-gray-200'}
      ${disabled ? 'opacity-50 cursor-wait' : ''}
    `}
  >
    <span
      className={`
        pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 
        transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-4' : 'translate-x-0'}
        ${disabled ? 'animate-pulse' : ''}
      `}
    />
  </button>
);

// A specialized component just for virtual layers
const VirtualLayerToggle = ({ 
  id, 
  name, 
  sourceLayerId, 
  rendererField, 
  visible = false,
  layerStatesRef,
  onToggle 
}: {
  id: string;
  name: string;
  sourceLayerId: string;
  rendererField: string;
  visible?: boolean;
  layerStatesRef: React.MutableRefObject<LayerStatesMap>;
  onToggle: (visible: boolean) => void;
}): JSX.Element => {
  // Track local visible state to ensure UI updates immediately 
  const [isVisible, setIsVisible] = useState(visible);
  
  // Effect to sync external state changes with local state
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);
  
  const handleToggle = useCallback(() => {
    const newVisible = !isVisible;
    
    // Update local state immediately for UI
    setIsVisible(newVisible);
    
    // Call the parent onToggle
    onToggle(newVisible);
    
  }, [isVisible, onToggle]);
  
  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded cursor-pointer">
      <div className="flex-shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={isVisible}
          onClick={handleToggle}
          className={`
            relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 
            focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background 
            ${isVisible ? 'bg-green-500' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 
              transition-transform duration-200 ease-in-out
              ${isVisible ? 'translate-x-4' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      <span className="flex-1 text-sm pl-2">
        {name}
      </span>
    </div>
  );
};

// +++ ADD LEGEND HELPERS (Define before DraggableLayer) +++
const generateLegendHtml = (legendData: StandardizedLegendData): string => {
  if (!legendData || !legendData.items || legendData.items.length === 0) {
    return '';
  }

  const itemsHtml = legendData.items.map(item => {
    const shape = item.shape || 'square';
    const size = item.size || 10;
    const borderRadius = shape === 'circle' ? '50%' : '0';
    const border = item.outlineColor ? `1px solid ${item.outlineColor}` : '1px solid rgba(0,0,0,0.1)';
    const symbolStyle = 
      `background-color: ${item.color}; ` +
      `width: ${size}px; ` +
      `height: ${size}px; ` +
      `border-radius: ${borderRadius}; ` +
      `border: ${border}; ` +
      `display: inline-block; margin-right: 6px; vertical-align: middle;`;
    
    // Escape label for safety
    const escapedLabel = item.label.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return (
      `<div style="display: flex; align-items: center; font-size: 12px; color: #4a5568; margin-bottom: 4px;">
         <span style="${symbolStyle}"></span>
         <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapedLabel}">${escapedLabel}</span>
       </div>`
    );
  }).join('');

  const title = legendData.title || 'Legend';
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return (
    `<div style="margin-top: 4px; padding-top: 4px;">
       <h4 style="font-size: 12px; font-weight: 500; color: #718096; margin-bottom: 4px;">${escapedTitle}</h4>
       <div>${itemsHtml}</div>
     </div>`
  );
};
// +++ END LEGEND HELPERS +++

// DraggableLayer Component
const DraggableLayer: React.FC<DraggableLayerProps> = ({ 
  id,
  title,
  description,
  isVisible,
  isLoading = false,
  layer,
  onToggle,
  isDragOverlay = false,
  onShowLegend
}): JSX.Element => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isDragOverlay });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderer = layer?.renderer;
  const canShowLegend = layer && renderer && (
    (renderer.type === 'unique-value' && 
      renderer && 
      typeof (renderer as any).uniqueValueInfos !== 'undefined' && 
      (renderer as any).uniqueValueInfos?.length > 0) ||
    (renderer.type === 'class-breaks' && 
      renderer && 
      typeof (renderer as any).classBreakInfos !== 'undefined' && 
      (renderer as any).classBreakInfos?.length > 0) ||
    (renderer.type === 'simple') // Allow simple renderers too
  );

  const [showControls, setShowControls] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [blendMode, setBlendMode] = useState<BlendMode>('normal');

  useEffect(() => {
    if (layer) {
      setOpacity(layer.opacity);
      setBlendMode(layer.blendMode as BlendMode || 'normal');
    }
  }, [layer]);

  const handleOpacityChange = useCallback((newOpacity: number) => {
    if (layer) {
      layer.opacity = newOpacity;
      setOpacity(newOpacity);
    }
  }, [layer]);

  const handleBlendModeChange = useCallback((newBlendMode: BlendMode) => {
    if (layer) {
      layer.blendMode = newBlendMode;
      setBlendMode(newBlendMode);
    }
  }, [layer]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative space-y-2 border-b border-gray-100 pb-4 last:border-0"
    >
      <div className="flex items-center gap-2">
        <button
          {...listeners}
          {...attributes}
          className="flex-shrink-0 touch-none px-0.5 py-1 hover:bg-gray-50 rounded cursor-grab active:cursor-grabbing"
          type="button"
          aria-label={`Drag ${title}`}
        >
          <GripVertical size={16} className="text-gray-400 group-hover:text-gray-500" />
        </button>
        <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Switch
              checked={isVisible}
              onCheckedChange={onToggle}
              disabled={isLoading}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 cursor-default select-none min-w-0">
                    <span className="text-sm font-medium truncate block" title={title}>
                      {title}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => setShowControls(!showControls)}
              className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Toggle visualization controls"
            >
              <Settings size={16} />
            </button>
            {canShowLegend && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={(e) => {
                        if (layer) { 
                          onShowLegend(layer, e.currentTarget);
                        }
                      }} 
                      className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                      aria-label={`Show legend for ${title}`}
                    >
                      <Info size={16} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Show Legend</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-500 ml-2" />}
          </div>
        </div>
      </div>
      {showControls && layer && (
        <div className="px-2 pb-2">
          <VisualizationControls
            layer={layer}
            opacity={opacity}
            blendMode={blendMode}
            onOpacityChange={handleOpacityChange}
            onBlendModeChange={handleBlendModeChange}
            showBlendMode={false}
          />
        </div>
      )}
    </div>
  );
};

// DraggableGroup Component
const DraggableGroup: React.FC<DraggableGroupProps> = ({ 
  id,             // Restore props destructuring
  title, 
  description,
  isCollapsed, 
  onToggleCollapse, 
  children 
}): JSX.Element => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `group-${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    touchAction: 'none',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`
        layer-group mb-4 
        ${isDragging ? 'z-50 bg-white shadow-lg rounded-lg p-4' : ''}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          {...listeners}
          {...attributes}
          className="touch-none px-0.5 py-1 hover:bg-gray-50 rounded cursor-grab active:cursor-grabbing
                    text-gray-400 hover:text-gray-500 transition-colors duration-200"
        >
          <GripVertical size={16} />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 
                className="flex-1 text-sm font-medium cursor-pointer flex items-center gap-2 select-none" 
                onClick={onToggleCollapse}
              >
                {isCollapsed ? 
                  <ChevronRight size={16} className="flex-shrink-0" /> : 
                  <ChevronDown size={16} className="flex-shrink-0" />
                }
                {title}
              </h3>
            </TooltipTrigger>
            {description && (
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
      {!isCollapsed && (
        <div className="pl-6 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
};

// Layer Management Functions
const reorderLayers = (layers: __esri.Collection<__esri.Layer>): void => {
  try {
    const pointLayers: __esri.Layer[] = [];
    const otherLayers: __esri.Layer[] = [];

    layers.forEach(layer => {
      if (layer.type === 'feature') {
        const featureLayer = layer as __esri.FeatureLayer;
        if (featureLayer.geometryType === 'point') {
          pointLayers.push(layer);
        } else {
          otherLayers.push(layer);
        }
      } else {
        otherLayers.push(layer);
      }
    });

    layers.removeAll();
    otherLayers.forEach(layer => layers.add(layer));
    pointLayers.forEach(layer => layers.add(layer));
  } catch (error) {
    console.error('Error reordering layers:', error);
  }
};

// Update LayerConfig to include group property
interface LocalLayerConfig {
  id: string;
  name: string;
  group?: string; // Added optional group property
}

type LoadingStatus = 'idle' | 'loading' | 'complete' | 'error';

interface InitProgress {
  current: number;
  total: number;
  message: string;
}

interface LayerState {
  visible: boolean;
  loading: boolean;
  error: string | null;
  layer?: FeatureLayer;
  filters: any[];
  name: string;
  active: boolean;
  opacity: number;
  order: number;
}

// Define LayerControllerProps and LayerControllerRef locally
interface LayerControllerProps {
  view: __esri.MapView;
  config: ProjectLayerConfig;
  onLayerStatesChange?: (states: LayerStatesMap) => void;
  onLayerInitializationProgress?: (progress: { loaded: number; total: number }) => void;
  onInitializationComplete?: () => void;
  visible?: boolean;
}

// Add a local stub for isVirtualLayerConfig if not imported
const isVirtualLayerConfig = (config: any): boolean => !!config?.isVirtual;

// Utility function to convert layer renderer to StandardizedLegendData
const convertLayerToLegendData = (layer: __esri.FeatureLayer): StandardizedLegendData | null => {
  console.log('[convertLayerToLegendData] Processing layer:', layer.title, layer.id);
  
  if (!layer || !layer.renderer) {
    console.log('[convertLayerToLegendData] No layer or renderer found');
    return null;
  }

  const renderer = layer.renderer;
  console.log('[convertLayerToLegendData] Renderer type:', renderer.type);
  
  const legendItems: LegendItem[] = [];
  let legendType: LegendType = 'simple';

  // Handle ClassBreaksRenderer
  if (renderer.type === 'class-breaks') {
    console.log('[convertLayerToLegendData] Processing class-breaks renderer');
    legendType = 'class-breaks';
    const classRenderer = renderer as __esri.ClassBreaksRenderer;
    console.log('[convertLayerToLegendData] Class break infos count:', classRenderer.classBreakInfos?.length);
    
    classRenderer.classBreakInfos
      ?.filter(breakInfo => 
        breakInfo.minValue !== 88888888 && 
        breakInfo.maxValue !== 88888888 && 
        breakInfo.label !== "No Data"
      )
      .forEach((breakInfo, index) => {
        console.log('[convertLayerToLegendData] Processing break info:', index, breakInfo.label);
        const symbol = breakInfo.symbol as __esri.SimpleMarkerSymbol | __esri.SimpleFillSymbol;
        if (!symbol?.color) {
          console.log('[convertLayerToLegendData] No symbol color found for break info:', index);
          return;
        }

        const outlineColor = 'outline' in symbol && symbol.outline?.color 
          ? colorToRgba(symbol.outline.color) 
          : undefined;

        const legendItem = {
          label: breakInfo.label || `${breakInfo.minValue} - ${breakInfo.maxValue}`,
          color: colorToRgba(symbol.color),
          outlineColor,
          shape: getSymbolShape(symbol),
          size: getSymbolSize(symbol)
        };
        console.log('[convertLayerToLegendData] Adding legend item:', legendItem);
        legendItems.push(legendItem);
      });
  }
  // Handle UniqueValueRenderer
  else if (renderer.type === 'unique-value') {
    console.log('[convertLayerToLegendData] Processing unique-value renderer');
    legendType = 'unique-value';
    const uniqueRenderer = renderer as __esri.UniqueValueRenderer;
    console.log('[convertLayerToLegendData] Unique value infos count:', uniqueRenderer.uniqueValueInfos?.length);
    
    (uniqueRenderer.uniqueValueInfos ?? []).forEach((info, index) => {
      console.log('[convertLayerToLegendData] Processing unique value info:', index, info.label);
      const symbol = info.symbol as __esri.SimpleMarkerSymbol | __esri.SimpleFillSymbol;
      if (!symbol?.color) {
        console.log('[convertLayerToLegendData] No symbol color found for unique value info:', index);
        return;
      }

      const outlineColor = 'outline' in symbol && symbol.outline?.color 
        ? colorToRgba(symbol.outline.color) 
        : undefined;

      const legendItem = {
        label: info.label || String(info.value),
        color: colorToRgba(symbol.color),
        outlineColor,
        shape: getSymbolShape(symbol),
        size: getSymbolSize(symbol)
      };
      console.log('[convertLayerToLegendData] Adding legend item:', legendItem);
      legendItems.push(legendItem);
    });
  }
  // Handle SimpleRenderer
  else if (renderer.type === 'simple') {
    console.log('[convertLayerToLegendData] Processing simple renderer');
    const simpleRenderer = renderer as __esri.SimpleRenderer;
    const symbol = simpleRenderer.symbol as __esri.SimpleMarkerSymbol | __esri.SimpleFillSymbol;
    if (symbol?.color) {
      const outlineColor = 'outline' in symbol && symbol.outline?.color 
        ? colorToRgba(symbol.outline.color) 
        : undefined;

      const legendItem = {
        label: layer.title || 'Layer',
        color: colorToRgba(symbol.color),
        outlineColor,
        shape: getSymbolShape(symbol),
        size: getSymbolSize(symbol)
      };
      console.log('[convertLayerToLegendData] Adding legend item for simple renderer:', legendItem);
      legendItems.push(legendItem);
    } else {
      console.log('[convertLayerToLegendData] No symbol color found for simple renderer');
    }
  } else {
    console.log('[convertLayerToLegendData] Unsupported renderer type:', renderer.type);
  }

  console.log('[convertLayerToLegendData] Final legend items count:', legendItems.length);

  if (legendItems.length === 0) {
    console.log('[convertLayerToLegendData] No legend items generated');
    return null;
  }

  const result = {
    title: layer.title || 'Legend',
    type: legendType,
    items: legendItems
  };
  
  console.log('[convertLayerToLegendData] Returning legend data:', result);
  return result;
};

// Main Component
const LayerController = forwardRef<LayerControllerRef, LayerControllerProps>(({
  view,
  config,
  onLayerStatesChange,
  onLayerInitializationProgress,
  onInitializationComplete,
  visible = true
}, ref) => {
  // State
  const [layerStates, setLayerStates] = useState<LayerStatesMap>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingState, setLoadingState] = useState<LayerInitializationProgress>({
    total: 0,
    loaded: 0,
    status: 'pending'
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [showSharing, setShowSharing] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [currentLegendData, setCurrentLegendData] = useState<StandardizedLegendData | null>(null);
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLElement | null>(null);
  const [isLegendPopoverOpen, setIsLegendPopoverOpen] = useState(false);

  // Refs
  const layerStatesRef = useRef<LayerStatesMap>({});
  const initializationInProgress = useRef(false);
  const isMountedRef = useRef(true);
  const hasInitialized = useRef(false);

  // Update ref when state changes
  useEffect(() => {
    layerStatesRef.current = layerStates;
  }, [layerStates]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleLayerStatesChange = useCallback((newStates: LayerStatesMap) => {
    if (!isMountedRef.current) return;
    setLayerStates(newStates);
    layerStatesRef.current = newStates;
    onLayerStatesChange?.(newStates);
  }, [onLayerStatesChange]);

  const handleInitializationProgress = useCallback((progress: LayerInitializationProgress) => {
    if (!isMountedRef.current) return;
    setLoadingState(progress);
    onLayerInitializationProgress?.({
      loaded: progress.loaded,
      total: progress.total
    });
  }, [onLayerInitializationProgress]);

  const handleInitializationComplete = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsInitialized(true);
  }, []);

  // Memoize the initialization function
  const initializeLayers = useCallback(async () => {
    console.log('[LC] initializeLayers: Attempting to start.', { 
      hasView: !!view,
      isInitialized, 
      initInProgress: initializationInProgress.current
    });

    if (initializationInProgress.current || !view || !config || isInitialized) {
      console.log('[LC] initializeLayers: Early return conditions met.');
      return;
    }

      initializationInProgress.current = true;
    console.log('[LC] initializeLayers: Starting initialization process.');

    try {
      const totalLayers = config.groups.reduce((sum, group) => sum + (group.layers?.length || 0), 0);
      console.log('[LC] initializeLayers: Calculated totalLayers:', totalLayers);
      
            setLoadingState(prev => ({
              ...prev,
        total: totalLayers,
        status: 'loading'
      }));

      const newLayerStates: LayerStatesMap = {};
      console.log('[LC] initializeLayers: Starting groups loop. Number of groups:', config.groups.length);

      for (const group of config.groups) {
        console.log('[LC] initializeLayers: Processing group:', group.id);
        if (group.layers) {
          for (const layerConfig of group.layers) {
            console.log('[LC] initializeLayers: Processing layer:', layerConfig.id);
            const [layer, errors] = await createLayer(layerConfig, config, view, layerStatesRef);
            if (layer) {
              const shouldBeVisible = config.defaultVisibility?.[layerConfig.id] || false;
              if (shouldBeVisible) {
              view.map.add(layer);
                layer.visible = true;
              } else {
              layer.visible = false;
              }
              
              newLayerStates[layerConfig.id] = {
                id: layerConfig.id,
                name: layerConfig.name,
                layer,
                visible: shouldBeVisible,
                opacity: 1,
                order: 0,
                group: group.id,
                loading: false,
                filters: [],
                isVirtual: false,
                active: false
              };
            }

            const loadedCount = Object.keys(newLayerStates).length;
            console.log('[LC] initializeLayers: Layer processed, loadedCount:', loadedCount, 'totalLayers:', totalLayers);
            
      setLoadingState(prev => ({
        ...prev,
              loaded: loadedCount
            }));
            
            onLayerInitializationProgress?.({
              loaded: loadedCount,
              total: totalLayers
            });
          }
        }
      }

      console.log('[LC] initializeLayers: Finished processing all groups.');

      // Set states atomically to prevent race conditions
      layerStatesRef.current = newLayerStates;
      setLayerStates(newLayerStates);
      
      console.log('[LC] initializeLayers: About to set initialized and call completion callbacks.');
      
      // Call callbacks before setting initialized state
      onLayerInitializationProgress?.({
        loaded: Object.keys(newLayerStates).length,
        total: totalLayers
      });
      
      onLayerStatesChange?.(newLayerStates);
      
      if (view?.map) {
        reorderLayers(view.map.layers);
      }
      
    setLoadingState(prev => ({
      ...prev,
        status: 'complete', 
        loaded: Object.keys(newLayerStates).length 
      }));
      
      // Call onInitializationComplete before setting isInitialized
      onInitializationComplete?.();
      
      // Set initialized state last
      setIsInitialized(true);
      
      console.log('[LC] initializeLayers: Successfully completed initialization.');

    } catch (error) {
      console.error('[LC] initializeLayers: CATCH BLOCK - Error during initialization process:', error);
      setLoadingState({
        total: config.groups.reduce((total, group) => total + (group.layers?.length || 0), 0),
        loaded: 0,
        status: 'error',
        currentLayer: 'Initialization failed'
      });
      setIsInitialized(false);
      onInitializationComplete?.();
    } finally {
      initializationInProgress.current = false;
      console.log('[LC] initializeLayers: FINALLY block executed.');
    }
  }, [
    view, 
    config, 
    isInitialized, 
    onLayerStatesChange, 
    onLayerInitializationProgress, 
    onInitializationComplete,
    setLayerStates,
    setLoadingState,
    setIsInitialized,
    reorderLayers,
    layerStatesRef,
    createLayer
  ]);

  // Reset guard when view/config changes
  useEffect(() => {
    hasInitialized.current = false;
    setIsInitialized(false);
  }, [view, config]);

  // Only initialize if not already initialized
  useEffect(() => {
    if (!view || !config || isInitialized || initializationInProgress.current || hasInitialized.current) return;
    hasInitialized.current = true;
      initializeLayers();
  }, [view, config, isInitialized, initializeLayers]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (view) {
        Object.values(layerStatesRef.current).forEach(state => {
          if (state.layer && view.map) {
            view.map.remove(state.layer);
          }
        });
      }
    };
  }, [view]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    layerStates: layerStatesRef.current,
    isInitialized,
    setVisibleLayers: (layers: string[]) => {
      const newStates = { ...layerStatesRef.current };
      Object.keys(newStates).forEach(layerId => {
        if (newStates[layerId].layer) {
          newStates[layerId].visible = layers.includes(layerId);
          newStates[layerId].layer.visible = layers.includes(layerId);
        }
      });
      handleLayerStatesChange(newStates);
    },
    setLayerStates: handleLayerStatesChange,
    resetLayers: () => {
      const newStates = { ...layerStatesRef.current };
      Object.keys(newStates).forEach(layerId => {
        if (newStates[layerId].layer) {
          newStates[layerId].visible = false;
          newStates[layerId].layer.visible = false;
        }
      });
      handleLayerStatesChange(newStates);
    }
  }), [isInitialized, handleLayerStatesChange]);

  // Define sensors outside of useMemo to avoid hooks violation
  const sensors = useSensors(useSensor(PointerSensor));

  // Memoize the render function
  const renderContent = useMemo(() => {
    if (!visible) return null;

    const handleShowLegend = (layer: __esri.FeatureLayer, anchorEl: HTMLElement) => {
      console.log('[LayerController] handleShowLegend called for layer:', layer.title, layer.id);
      console.log('[LayerController] Layer renderer:', layer.renderer);
      console.log('[LayerController] Layer renderer type:', layer.renderer?.type);
      
      const legendData = convertLayerToLegendData(layer);
      console.log('[LayerController] Generated legend data:', legendData);
      
      if (legendData) {
        setCurrentLegendData(legendData);
    setPopoverAnchorElement(anchorEl);
    setIsLegendPopoverOpen(true);
        console.log('[LayerController] Legend popover should now be open');
      } else {
        console.warn('No legend data available for layer:', layer.title);
      }
    };

    const handleToggleLayer = (layerId: string) => {
      const newStates = { ...layerStatesRef.current };
      if (newStates[layerId]) {
        newStates[layerId].visible = !newStates[layerId].visible;
        if (newStates[layerId].layer) {
          newStates[layerId].layer.visible = newStates[layerId].visible;
          
          // Add/remove from map based on visibility
          if (newStates[layerId].visible && !view.map.layers.includes(newStates[layerId].layer)) {
            view.map.add(newStates[layerId].layer);
          }
        }
        handleLayerStatesChange(newStates);
      }
    };

    const handleToggleGroup = (groupId: string) => {
      setCollapsedGroups(prev => {
        const newSet = new Set(prev);
        if (newSet.has(groupId)) {
          newSet.delete(groupId);
        } else {
          newSet.add(groupId);
        }
        return newSet;
      });
    };

    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
      if (over && active.id !== over.id) {
        console.log('Layer reordering:', { from: active.id, to: over.id });
      }
    };

    // Group layers by their group property
    const groupedLayers = config.groups.map(group => ({
      ...group,
      layerStates: Object.values(layerStates).filter(state => state.group === group.id)
    }));

    return (
      <div className="layer-controller h-full overflow-y-auto">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Layers</h3>
          
          {/* Loading State */}
          {loadingState.status === 'loading' && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Loading layers...</span>
                <span>{loadingState.loaded}/{loadingState.total}</span>
            </div>
              <Progress value={(loadingState.loaded / loadingState.total) * 100} className="h-2" />
          </div>
          )}

          {/* Layer Groups */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={Object.keys(layerStates)} strategy={verticalListSortingStrategy}>
              {groupedLayers.map(group => (
                <DraggableGroup
                  key={group.id}
                  id={group.id}
                  title={group.title}
                  description={group.description}
                  isCollapsed={collapsedGroups.has(group.id)}
                  onToggleCollapse={() => handleToggleGroup(group.id)}
                >
                  {group.layerStates.map(layerState => (
                            <DraggableLayer
                      key={layerState.id}
                      id={layerState.id}
                      title={layerState.name}
                      description={`Layer: ${layerState.name}`}
                      isVisible={layerState.visible}
                      isLoading={layerState.loading}
                      layer={layerState.layer || null}
                      onToggle={() => handleToggleLayer(layerState.id)}
                              onShowLegend={handleShowLegend}
                            />
                  ))}
                  </DraggableGroup>
              ))}
          </SortableContext>
          </DndContext>

          {/* Empty State */}
          {Object.keys(layerStates).length === 0 && loadingState.status !== 'loading' && (
            <div className="text-center py-8 text-gray-500">
              <p>No layers available</p>
              {config.groups.length === 0 && (
                <p className="text-sm mt-2">No layer groups configured</p>
              )}
                </div>
          )}
                </div>

        {/* Legend Popover */}
        {isLegendPopoverOpen && currentLegendData && popoverAnchorElement && (
      <LegendPopover
        open={isLegendPopoverOpen}
            onOpenChange={setIsLegendPopoverOpen}
        anchorEl={popoverAnchorElement}
        legendData={currentLegendData}
      />
      )}
    </div>
  );
  }, [visible, layerStates, collapsedGroups, loadingState, config, view, handleLayerStatesChange, sensors, isLegendPopoverOpen, currentLegendData, popoverAnchorElement]);

  return renderContent;
});

LayerController.displayName = 'LayerController';

export default React.memo(LayerController);