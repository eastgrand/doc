/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useRef, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCenter
} from '@dnd-kit/core';
import { 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2, ChevronDown, ChevronRight, Info, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from "@/components/ui/progress";
import {
  LayerGroup,
  ProjectLayerConfig,
  LayerConfig
} from '@/types/layers';
import { StandardizedLegendData, LegendType } from '@/types/legend';
import { colorToRgba, getSymbolShape, getSymbolSize } from '@/utils/symbol-utils';
import { LegendItem } from '@/components/MapLegend';
import LegendPopover from '../LegendPopover';
import { VisualizationControls } from './VisualizationControls';
import type { BlendMode } from '@/utils/visualizations/base-visualization';
import { createLayer } from './utils';
import type { LayerStatesMap } from './types';

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

interface LayerControllerProps {
  view: __esri.MapView;
  config: ProjectLayerConfig;
  onLayerStatesChange?: (states: LayerStatesMap) => void;
  onLayerInitializationProgress?: (progress: { loaded: number; total: number }) => void;
  onInitializationComplete?: () => void;
  onLayersCreated?: (layers: __esri.FeatureLayer[]) => void; // NEW: Callback for CustomPopupManager
  visible?: boolean;
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
                    <span className="text-sm font-medium block leading-tight line-clamp-2">
                      {title}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{title}</p>
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
  id,
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

// Utility function to convert layer renderer to StandardizedLegendData
const convertLayerToLegendData = (layer: __esri.FeatureLayer): StandardizedLegendData | null => {
  if (!layer || !layer.renderer) {
    return null;
  }

  const renderer = layer.renderer;
  
  const legendItems: LegendItem[] = [];
  let legendType: LegendType = 'simple';

  // Handle ClassBreaksRenderer
  if (renderer.type === 'class-breaks') {
    legendType = 'class-breaks';
    const classRenderer = renderer as __esri.ClassBreaksRenderer;
    
    classRenderer.classBreakInfos
      ?.filter(breakInfo => 
        breakInfo.minValue !== 88888888 && 
        breakInfo.maxValue !== 88888888 && 
        breakInfo.label !== "No Data"
      )
      .forEach((breakInfo, index) => {
        const symbol = breakInfo.symbol as __esri.SimpleMarkerSymbol | __esri.SimpleFillSymbol;
        if (!symbol?.color) {
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
        legendItems.push(legendItem);
      });
  }
  // Handle UniqueValueRenderer
  else if (renderer.type === 'unique-value') {
    legendType = 'unique-value';
    const uniqueRenderer = renderer as __esri.UniqueValueRenderer;
    
    (uniqueRenderer.uniqueValueInfos ?? []).forEach((info, index) => {
      const symbol = info.symbol as __esri.SimpleMarkerSymbol | __esri.SimpleFillSymbol;
      if (!symbol?.color) {
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
      legendItems.push(legendItem);
    });
  }
  // Handle SimpleRenderer
  else if (renderer.type === 'simple') {
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
      legendItems.push(legendItem);
    }
  }

  if (legendItems.length === 0) {
    return null;
  }

  const result = {
    title: layer.title || 'Legend',
    type: legendType,
    items: legendItems
  };
  
  return result;
};

// Main Component
const LayerController = forwardRef<LayerControllerRef, LayerControllerProps>(({
  view,
  config,
  onLayerStatesChange,
  onLayerInitializationProgress,
  onInitializationComplete,
  onLayersCreated,
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
  const [currentLegendData, setCurrentLegendData] = useState<StandardizedLegendData | null>(null);
  const [popoverAnchorElement, setPopoverAnchorElement] = useState<HTMLElement | null>(null);
  const [isLegendPopoverOpen, setIsLegendPopoverOpen] = useState(false);

  // Refs
  const layerStatesRef = useRef<LayerStatesMap>({});
  const initializationInProgress = useRef(false);
  const isMountedRef = useRef(true);
  const hasInitialized = useRef<string | null>(null);

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
    if (initializationInProgress.current || !view || !config || isInitialized) {
      return;
    }

    initializationInProgress.current = true;

    try {
      const totalLayers = (config.groups || []).reduce((sum, group) => sum + ((group.layers || []).length), 0);
      
      setLoadingState(prev => ({
        ...prev,
        total: totalLayers,
        status: 'loading'
      }));

      const newLayerStates: LayerStatesMap = {};

      for (const group of (config.groups || [])) {
        if (group.layers) {
          for (const layerConfig of group.layers) {
            const [layer, errors] = await createLayer(layerConfig, config, view, layerStatesRef);
            if (layer) {
              const shouldBeVisible = config.defaultVisibility?.[layerConfig.id] || false;
              // Add ALL layers to the map so they appear in LayerList widget
              view.map.add(layer);
              layer.visible = shouldBeVisible;
              layer.opacity = 0.6;
              
              newLayerStates[layerConfig.id] = {
                id: layerConfig.id,
                name: layerConfig.name,
                layer,
                visible: shouldBeVisible,
                opacity: 0.6,
                order: 0,
                group: group.id,
                loading: false,
                filters: [],
                isVirtual: false,
                active: false
              };
            }

            const loadedCount = Object.keys(newLayerStates).length;
            
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

      // Set states atomically to prevent race conditions
      layerStatesRef.current = newLayerStates;
      setLayerStates(newLayerStates);
      
      onLayerStatesChange?.(newLayerStates);
      
      // NEW: Provide created layers for CustomPopupManager
      const createdLayers = Object.values(newLayerStates)
        .map(state => state.layer)
        .filter((layer): layer is __esri.FeatureLayer => layer !== null);
      onLayersCreated?.(createdLayers);
      
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

    } catch (error) {
      setLoadingState({
        total: (config.groups || []).reduce((total, group) => total + ((group.layers || []).length), 0),
        loaded: 0,
        status: 'error',
        currentLayer: 'Initialization failed'
      });
      setIsInitialized(false);
      onInitializationComplete?.();
    } finally {
      initializationInProgress.current = false;
    }
  }, [
    view, 
    config, 
    isInitialized, 
    onLayerStatesChange, 
    onLayerInitializationProgress, 
    onInitializationComplete
  ]);

  // Reset guard when view/config changes
  useEffect(() => {
    // Reset initialization state when view or config changes
    console.log('[LayerController] View or config changed, resetting initialization state');
    hasInitialized.current = null;
    setIsInitialized(false);
  }, [view, config]);

  // Only initialize if not already initialized
  useEffect(() => {
    if (!view || !config || isInitialized || initializationInProgress.current || hasInitialized.current !== null) return;
    
    // Create unique identifier for this view+config combination to prevent duplicates
    const viewId = view.container ? view.container.id : 'default';
    const configHash = JSON.stringify(config.groups?.map(g => g.id).sort());
    const initId = `${viewId}-${configHash}`;
    
    // Check if we've already initialized this exact combination
    if (hasInitialized.current === initId) {
      console.log('[LayerController] Already initialized this view+config combination, skipping');
      return;
    }
    
    console.log('[LayerController] Starting initialization for:', initId);
    hasInitialized.current = initId;
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
      const legendData = convertLayerToLegendData(layer);
      
      if (legendData) {
        setCurrentLegendData(legendData);
        setPopoverAnchorElement(anchorEl);
        setIsLegendPopoverOpen(true);
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
    const groupedLayers = (config.groups || []).map(group => ({
      ...group,
      layerStates: Object.values(layerStates).filter(state => state.group === group.id)
    }));

    return (
      <div className="layer-controller h-full overflow-y-auto">
        <div className="p-4">
          
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
                      key={`${group.id}-${layerState.id}`}
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
              {(config.groups || []).length === 0 && (
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