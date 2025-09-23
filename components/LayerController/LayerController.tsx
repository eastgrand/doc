/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { useState, useEffect, useCallback, forwardRef, useRef, useMemo } from 'react';
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
import { FederatedLayerService } from '@/lib/services/FederatedLayerService';
import { FEDERATED_LAYERS_CONFIG, FEDERATED_LAYER_GROUPS, POINT_LOCATION_LAYERS } from '@/config/federated-layers-config';
import { createEnhancedPointLayer } from './createPointLayers';
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
}): JSX.Element => {
  // Log to debug
  console.log('Switch state:', { checked, disabled });
  return (
    <div 
      style={{
        display: 'inline-block',
        position: 'relative',
        width: '36px',
        height: '20px'
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => {
          console.log('Switch clicked, current checked:', checked, 'disabled:', disabled);
          if (!disabled) {
            onCheckedChange(!checked);
          } else {
            console.warn('Switch click ignored - component is disabled (likely loading)');
          }
        }}
        disabled={disabled}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '10px',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          background: disabled 
            ? 'linear-gradient(to right, #f3f4f6, #f3f4f6)' // Gray when loading
            : checked 
              ? 'linear-gradient(to right, #21c55d, #21c55d)' 
              : 'linear-gradient(to right, #e0e0e0, #e0e0e0)',
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
          transition: 'background 200ms ease-in-out, opacity 200ms ease-in-out',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '2px',
            left: disabled ? '9px' : checked ? '18px' : '2px', // Center when disabled
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: disabled
              ? 'linear-gradient(to bottom, #d1d5db, #9ca3af)' // Gray when loading
              : 'linear-gradient(to bottom, #ffffff, #f9fafb)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            transition: 'left 200ms ease-in-out, background 200ms ease-in-out',
            pointerEvents: 'none'
          }}
        />
      </button>
    </div>
  );
};
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
              onCheckedChange={() => onToggle()}
              disabled={isLoading}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex-1 cursor-default select-none min-w-0">
                    <span className="text-xs font-medium block leading-tight line-clamp-2">
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
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        if (layer) { 
                          onShowLegend(layer, e.currentTarget as HTMLElement);
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
        ${isDragging ? 'z-50 theme-bg-primary shadow-lg rounded-lg p-4' : ''}
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
                className="flex-1 text-xs font-medium cursor-pointer flex items-center gap-2 select-none" 
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
// @ts-expect-error forwardRef type complexity - functionality preserved
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
  // Initialize collapsed groups from config
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => {
    // Default all groups to collapsed for doors documentary project
    const allGroupIds = FEDERATED_LAYER_GROUPS.map(group => group.id);
    return new Set(allGroupIds);
  });
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
    console.log('handleLayerStatesChange called, isMounted:', isMountedRef.current);
    if (!isMountedRef.current) return;
    console.log('Setting new layer states');
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
    console.log('[LayerController] initializeLayers called', {
      initializationInProgress: initializationInProgress.current,
      hasView: !!view,
      hasConfig: !!config,
      isInitialized,
      hasInitialized: hasInitialized.current
    });
    
    if (initializationInProgress.current || !view || !config || isInitialized || hasInitialized.current === 'completed') {
      console.log('[LayerController] Skipping initialization - already in progress or initialized');
      return;
    }
    
    // Mark that initialization is in progress
    initializationInProgress.current = true;
    console.log('[LayerController] Starting layer initialization for federated layers');
    try {
      // Use federated layers for doors documentary project
      const totalLayers = FEDERATED_LAYERS_CONFIG.length + POINT_LOCATION_LAYERS.length;
      setLoadingState((prev: any) => ({
        ...prev,
        total: totalLayers,
        status: 'loading'
      }));
      
      console.log(`[LayerController] 🎯 Initializing ${totalLayers} federated layers for doors documentary`);
      const newLayerStates: LayerStatesMap = {};
      const federatedService = new FederatedLayerService();
      
      // Initialize federated service
      await federatedService.initializeWithSingleService();
      
      let loadedCount = 0;
      
      // Create federated layers in small batches to prevent overwhelming services
      const BATCH_SIZE = 3; // Only create 3 layers at a time
      console.log(`[LayerController] Creating ${FEDERATED_LAYERS_CONFIG.length} federated layers in batches of ${BATCH_SIZE}...`);
      
      for (let i = 0; i < FEDERATED_LAYERS_CONFIG.length; i += BATCH_SIZE) {
        const batch = FEDERATED_LAYERS_CONFIG.slice(i, i + BATCH_SIZE);
        console.log(`[LayerController] 📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(FEDERATED_LAYERS_CONFIG.length/BATCH_SIZE)} (${batch.length} layers)`);
        
        // Process batch sequentially
        for (const federatedConfig of batch) {
          console.log(`[LayerController] 🔄 Creating federated layer: ${federatedConfig.layerName}`);
          
          try {
            const federatedLayer = await federatedService.createFederatedLayer(federatedConfig);
          
          // Check if layer already exists in map
          const existingLayer = view.map.layers.find((l: any) => l.title === federatedLayer.title);
          if (existingLayer) {
            console.warn(`[LayerController] ⚠️ Layer already exists in map: ${federatedLayer.title}`, {
              existingId: existingLayer.id,
              newId: federatedLayer.id,
              mapLayerCount: view.map.layers.length
            });
            // Use the existing layer instead of creating a duplicate
            federatedLayer.destroy();
            continue;
          }
          
          // Add to map
          console.log(`[LayerController] Adding federated layer to map: ${federatedLayer.title} with ID: ${federatedLayer.id}`);
          view.map.add(federatedLayer);
          
          // Configure layer properties
          federatedLayer.visible = false; // Start hidden
          federatedLayer.opacity = 0.7;
          federatedLayer.minScale = 0; // Visible at all zoom levels
          federatedLayer.maxScale = 0; // Visible at all zoom levels
          
          // Add deferred renderer configuration for quartile visualization
          (federatedLayer as any)._deferredRendererConfig = {
            type: 'quartile',
            field: 'thematic_value',
            colors: ['#f7fcb9', '#addd8e', '#41ab5d', '#006837'] // Green color scheme
          };
          
          // Set up visibility watcher for deferred renderer application
          federatedLayer.watch('visible', async (visible: boolean) => {
            if (visible && (federatedLayer as any)._deferredRendererConfig) {
              console.log(`[LayerController] 🎯 Federated layer became visible, applying deferred renderer: ${federatedLayer.id}`);
              const { applyDeferredRenderer } = await import('./utils');
              await applyDeferredRenderer(federatedLayer);
            }
          });
          
          // Find the appropriate group for this layer
          const layerGroup = FEDERATED_LAYER_GROUPS.find(group => 
            group.layers.includes(federatedConfig.layerName)
          );
          
          if (!layerGroup) {
            console.warn(`[LayerController] ⚠️ Layer "${federatedConfig.layerName}" not found in any group, using 'general'`);
          }
          
          const layerId = federatedConfig.layerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
          
          newLayerStates[layerId] = {
            id: layerId,
            name: federatedConfig.layerName,
            layer: federatedLayer,
            visible: false,
            opacity: 0.7,
            order: loadedCount,
            group: layerGroup?.id || 'general',
            loading: false,
            filters: [],
            isVirtual: false,
            active: false
          };
          
          loadedCount++;
          handleInitializationProgress({
            total: totalLayers,
            loaded: loadedCount,
            currentLayer: federatedConfig.layerName,
            status: 'loading'
          });
          
          console.log(`[LayerController] ✅ Created federated layer: ${federatedConfig.layerName}`);
          
        } catch (error) {
          console.error(`[LayerController] ❌ Failed to create federated layer: ${federatedConfig.layerName}`, error);
        }
      }
      
      // Small delay between batches to prevent overwhelming services
      if (i + BATCH_SIZE < FEDERATED_LAYERS_CONFIG.length) {
        console.log(`[LayerController] ⏳ Waiting 1 second before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
      
      // Create point location layers with enhanced symbols (theaters and radio stations)
      for (const pointLayerConfig of POINT_LOCATION_LAYERS) {
        console.log(`[LayerController] 📍 Creating enhanced point location layer: ${pointLayerConfig.name}`);
        
        try {
          // Use enhanced point layer creation for special symbols and coverage
          const layer = await createEnhancedPointLayer(pointLayerConfig, view);
          
          if (layer) {
            view.map.add(layer);
            
            newLayerStates[pointLayerConfig.id] = {
              id: pointLayerConfig.id,
              name: pointLayerConfig.name,
              layer,
              visible: false,
              opacity: 1.0,
              order: loadedCount,
              group: pointLayerConfig.group, // This will be 'ungrouped'
              loading: false,
              filters: [],
              isVirtual: false,
              active: false
            };
            
            loadedCount++;
            handleInitializationProgress({
              total: totalLayers,
              loaded: loadedCount,
              currentLayer: pointLayerConfig.name,
              status: 'loading'
            });
            
            console.log(`[LayerController] ✅ Created enhanced point layer: ${pointLayerConfig.name}`);
          } else {
            console.error(`[LayerController] ❌ Failed to create enhanced point layer: ${pointLayerConfig.name}`);
          }
        } catch (error) {
          console.error(`[LayerController] ❌ Error creating point layer: ${pointLayerConfig.name}`, error);
        }
      }
      // Set states atomically to prevent race conditions
      layerStatesRef.current = newLayerStates;
      setLayerStates(newLayerStates);
      
      // Log summary of created layers
      const layersByGroup: { [key: string]: string[] } = {};
      Object.values(newLayerStates).forEach(state => {
        const group = state.group || 'ungrouped';
        if (!layersByGroup[group]) layersByGroup[group] = [];
        layersByGroup[group].push(state.name);
      });
      console.log('[LayerController] ✅ Created layers by group:', layersByGroup);
      
      onLayerStatesChange?.(newLayerStates);
      // NEW: Provide created layers for CustomPopupManager
      const createdLayers = Object.values(newLayerStates)
        .map(state => state.layer)
        .filter((layer): layer is __esri.FeatureLayer => layer !== null);
      onLayersCreated?.(createdLayers);
      if (view?.map) {
        reorderLayers(view.map.layers);
      }
      setLoadingState((prev: any) => ({
        ...prev,
        status: 'complete', 
        loaded: Object.keys(newLayerStates).length 
      }));
      // Call onInitializationComplete before setting isInitialized
      onInitializationComplete?.();
      // Set initialized state last
      hasInitialized.current = 'completed'; // Mark as completed to prevent re-initialization
      setIsInitialized(true);
    } catch (error) {
      setLoadingState({
        total: (config.groups || []).reduce((total: number, group: any) => total + ((group.layers || []).length), 0),
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
  // Initialize layers when view and config are ready
  useEffect(() => {
    if (!view || !config) return;
    
    // Update collapsed groups when config changes
    // Always start with all groups collapsed for doors documentary project
    const allGroupIds = FEDERATED_LAYER_GROUPS.map(group => group.id);
    setCollapsedGroups(new Set(allGroupIds));
    
    initializeLayers();
  }, [view, config, initializeLayers]);
  // Set mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  // Cleanup effect - only on true unmount
  useEffect(() => {
    return () => {
      // Check if this is a theme switch using multiple methods
      const isThemeSwitch = document.documentElement.hasAttribute('data-theme-switching') || 
                           window.__themeTransitioning === true;
      // Only cleanup layers when component truly unmounts, not during theme switches
      if (!isMountedRef.current && view && !isThemeSwitch) {
        console.log('[LayerController] Component unmounting - removing layers');
        Object.values(layerStatesRef.current).forEach(state => {
          if (state.layer && view.map && view.map.layers.includes(state.layer)) {
            view.map.remove(state.layer);
          }
        });
      } else if (isThemeSwitch) {
        console.log('[LayerController] Theme switching detected - preserving all layers');
      }
    };
  }, [view]);
  // Handle theme changes for LayerController - minimal intervention
  useEffect(() => {
    const handleThemeChange = () => {
      console.log('[LayerController] Theme changed');
      // CSS variables will handle most of the transition
      // Just trigger a repaint for smooth transition
      const container = document.querySelector('.layer-controller');
      if (container) {
        container.classList.add('theme-transitioning');
        requestAnimationFrame(() => {
          container.classList.remove('theme-transitioning');
        });
      }
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);
  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
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
    const handleToggleLayer = async (layerId: string) => {
      console.log('[LayerController] handleToggleLayer called for:', layerId);
      const newStates = { ...layerStatesRef.current };
      if (newStates[layerId]) {
        const oldVisible = newStates[layerId].visible;
        newStates[layerId].visible = !oldVisible;
        console.log(`[LayerController] Toggling layer ${layerId} visibility from ${oldVisible} to ${newStates[layerId].visible}`, {
          hasLayer: !!newStates[layerId].layer,
          hasDeferredRenderer: !!(newStates[layerId].layer as any)?._deferredRendererConfig,
          layerName: newStates[layerId].name,
          currentRenderer: newStates[layerId].layer?.renderer?.type
        });
        // LAZY LOADING: Create layer if it doesn't exist and is being turned on
        if (newStates[layerId].visible && !newStates[layerId].layer) {
          console.log(`[LayerController] Creating layer on demand: ${layerId}`);
          newStates[layerId].loading = true;
          handleLayerStatesChange(newStates); // Update UI to show loading state
          // Timeout safety mechanism - clear loading state after 45 seconds
          const timeoutId = setTimeout(() => {
            console.error(`[LayerController] ⏰ Layer creation timeout for ${layerId} - clearing loading state`);
            const timeoutStates = { ...layerStatesRef.current };
            timeoutStates[layerId].loading = false;
            timeoutStates[layerId].visible = false;
            handleLayerStatesChange(timeoutStates);
          }, 45000);
          // Find the layer config
          const layerConfig = config?.groups?.find((g: any) => g.layers?.find((l: any) => l.id === layerId))?.layers?.find((l: any) => l.id === layerId);
          if (layerConfig) {
            try {
              const [layer, errors] = await createLayer(layerConfig, config!, view, layerStatesRef);
              // Clear timeout since we got a response
              clearTimeout(timeoutId);
              // Get fresh state to avoid stale closures
              const currentStates = { ...layerStatesRef.current };
              if (layer) {
                view.map.add(layer);
                
                // Set up visibility watcher for deferred renderer application
                if ((layer as any)._deferredRendererConfig) {
                  console.log(`[LayerController] ⏰ Setting up visibility watcher for lazy-loaded deferred renderer: ${layer.id}`);
                  layer.watch('visible', async (visible: boolean) => {
                    if (visible && (layer as any)._deferredRendererConfig) {
                      console.log(`[LayerController] 🎯 Lazy-loaded layer became visible, applying deferred renderer: ${layer.id}`);
                      const { applyDeferredRenderer } = await import('./utils');
                      await applyDeferredRenderer(layer);
                    }
                  });
                }
                
                layer.visible = true;
                
                // Apply deferred renderer immediately for lazy-loaded layers since they become visible right away
                if ((layer as any)._deferredRendererConfig) {
                  console.log(`[LayerController] 🎯 Lazy-loaded layer visible immediately, applying deferred renderer: ${layer.id}`);
                  const { applyDeferredRenderer } = await import('./utils');
                  await applyDeferredRenderer(layer);
                }
                const layerOpacity = layerConfig.name?.toLowerCase().includes('locations') ? layer.opacity : 0.6;
                layer.opacity = layerOpacity;
                currentStates[layerId].layer = layer;
                currentStates[layerId].opacity = layerOpacity;
                currentStates[layerId].loading = false;
                currentStates[layerId].visible = true;
                console.log(`[LayerController] ✅ Successfully created layer on demand: ${layerConfig.name}`);
                handleLayerStatesChange(currentStates);
              } else {
                console.error(`[LayerController] ❌ Failed to create layer: ${layerConfig.name}`, errors);
                currentStates[layerId].visible = false;
                currentStates[layerId].loading = false;
                handleLayerStatesChange(currentStates);
              }
            } catch (error) {
              console.error(`[LayerController] ❌ Error creating layer: ${layerConfig.name}`, error);
              // Clear timeout on error
              clearTimeout(timeoutId);
              // Get fresh state for error handling
              const currentStates = { ...layerStatesRef.current };
              currentStates[layerId].visible = false;
              currentStates[layerId].loading = false;
              handleLayerStatesChange(currentStates);
            }
          } else {
            console.error(`[LayerController] ❌ Layer config not found for: ${layerId}`);
            // Clear timeout on config error
            clearTimeout(timeoutId);
            // Get fresh state for config error
            const currentStates = { ...layerStatesRef.current };
            currentStates[layerId].visible = false;
            currentStates[layerId].loading = false;
            handleLayerStatesChange(currentStates);
          }
          // Early return to prevent further execution with potentially stale state
          return;
        }
        // Special debugging for Google Pay layer
        if (layerStates[layerId]?.name?.includes('Google Pay')) {
          console.log('🔍 [GOOGLE PAY] Layer toggle debug:', {
            layerId,
            newVisibility: newStates[layerId].visible,
            layerName: layerStates[layerId]?.name,
            hasRenderer: !!layerStates[layerId]?.layer?.renderer,
            rendererType: layerStates[layerId]?.layer?.renderer?.type,
            rendererField: (layerStates[layerId]?.layer?.renderer as any)?.field,
            layerOpacity: layerStates[layerId]?.layer?.opacity,
            layerLoaded: layerStates[layerId]?.layer?.loaded,
            currentlyVisible: layerStates[layerId]?.layer?.visible
          });
          // Deep dive into renderer when toggling on
          if (newStates[layerId].visible && layerStates[layerId]?.layer?.renderer) {
            const renderer = layerStates[layerId]?.layer?.renderer as any;
            console.log('🔍 [GOOGLE PAY] DEEP RENDERER ANALYSIS when toggling ON:', {
              rendererType: renderer.type,
              field: renderer.field,
              classBreakInfos: renderer.classBreakInfos?.length || 0,
              classBreaks: renderer.classBreakInfos?.map((cb: any, i: number) => ({
                index: i,
                minValue: cb.minValue,
                maxValue: cb.maxValue,
                range: cb.maxValue - cb.minValue,
                label: cb.label,
                symbolType: cb.symbol?.type,
                symbolColor: cb.symbol?.color?.toArray ? cb.symbol.color.toArray() : cb.symbol?.color,
                symbolOutline: cb.symbol && 'outline' in cb.symbol ? cb.symbol.outline : undefined
              })),
              defaultSymbol: {
                type: renderer.defaultSymbol?.type,
                color: renderer.defaultSymbol?.color?.toArray ? renderer.defaultSymbol.color.toArray() : renderer.defaultSymbol?.color
              }
            });
            // Also query some actual feature data to see what values we're working with
            if (layerStates[layerId]?.layer?.loaded) {
              const layer = layerStates[layerId]?.layer;
              const query = layer.createQuery();
              query.outFields = [renderer.field];
              query.returnGeometry = false;
              query.num = 10; // Get 10 sample features
              layer.queryFeatures(query).then((featureSet: any) => {
                const values = featureSet.features.map((f: any) => f.attributes[renderer.field]);
                console.log('🔍 [GOOGLE PAY] Sample data values:', {
                  field: renderer.field,
                  sampleValues: values,
                  min: Math.min(...values),
                  max: Math.max(...values),
                  range: Math.max(...values) - Math.min(...values),
                  mean: values.reduce((a: number, b: number) => a + b, 0) / values.length
                });
              }).catch((error: any) => {
                console.error('🔍 [GOOGLE PAY] Error querying sample data:', error);
              });
            }
          }
        }
        if (newStates[layerId].layer) {
          newStates[layerId].layer.visible = newStates[layerId].visible;
          
          // Apply deferred renderer immediately when toggling layer to visible
          if (newStates[layerId].visible && newStates[layerId].layer && (newStates[layerId].layer as any)._deferredRendererConfig) {
            console.log(`[LayerController] 🎯 Layer toggled visible, applying deferred renderer immediately: ${layerId}`);
            const layer = newStates[layerId].layer;
            import('./utils').then(async ({ applyDeferredRenderer }) => {
              await applyDeferredRenderer(layer);
            }).catch(error => {
              console.error(`[LayerController] ❌ Error applying deferred renderer for ${layerId}:`, error);
            });
          }
          
          // Additional debugging for location layers
          if (newStates[layerId].name?.toLowerCase().includes('locations')) {
            console.log(`🔍 Location layer ${layerId} debug info:`, {
              visible: newStates[layerId].layer.visible,
              opacity: newStates[layerId].layer.opacity,
              renderer: newStates[layerId].layer.renderer,
              geometryType: newStates[layerId].layer.geometryType,
              loaded: newStates[layerId].layer.loaded,
              url: newStates[layerId].layer.url
            });
          }
        }
        handleLayerStatesChange(newStates);
      }
    };
    const handleToggleGroup = (groupId: string) => {
      setCollapsedGroups((prev: Set<string>) => {
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
    // Group layers by their group property using federated layer groups
    const groupedLayers = FEDERATED_LAYER_GROUPS
      .map((group) => ({
        id: group.id,
        name: group.name,
        description: group.description,
        priority: group.priority,
        layerStates: Object.values(layerStates).filter(state => state.group === group.id)
      }))
      .filter((group) => group.layerStates.length > 0) // Only show groups that have layers
      .sort((a, b) => a.priority - b.priority); // Sort by priority
    
    // Get ungrouped layers (for Movie Theaters and Radio stations)
    const ungroupedLayers = Object.values(layerStates).filter(state => state.group === 'ungrouped');
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
          {/* Ungrouped Layers First */}
          {ungroupedLayers.length > 0 && (
            <div className="mb-4">
              {ungroupedLayers.map((layerState: any) => (
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
            </div>
          )}
          
          {/* Layer Groups */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={Object.keys(layerStates)} strategy={verticalListSortingStrategy}>
              {groupedLayers.map((group: any) => (
                <DraggableGroup
                  key={group.id}
                  id={group.id}
                  title={group.name}
                  description={group.description}
                  isCollapsed={collapsedGroups.has(group.id)}
                  onToggleCollapse={() => handleToggleGroup(group.id)}
                >
                  {group.layerStates.map((layerState: any) => (
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
                <p className="text-xs mt-2">No layer groups configured</p>
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