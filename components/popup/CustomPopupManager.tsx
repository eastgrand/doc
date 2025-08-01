/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import MapView from '@arcgis/core/views/MapView';
import PopupTemplate from '@arcgis/core/PopupTemplate';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { CustomContent } from '@arcgis/core/popup/content';
import StatisticDefinition from '@arcgis/core/rest/support/StatisticDefinition';
import { PopupConfig } from '../../types/popup-config';
import { createRoot } from 'react-dom/client';
import { ZoomIn, BarChartBig } from 'lucide-react';
import './popup-styles.css';
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import HitTestOptions from '@arcgis/core/views/HitTestOptions';
import { getLayerConfigById } from '../../config/layers';
import { FIELD_ALIASES } from '../../utils/field-aliases';
import { FieldMappingHelper } from '../../utils/visualizations/field-mapping-helper';
import { determinePopupTitle, createStandardizedPopupTemplate, StandardizedPopupConfig } from '../../utils/popup-utils';
import Graphic from '@arcgis/core/Graphic';
import Handles from '@arcgis/core/core/Handles';

interface CustomPopupManagerProps {
  mapView: __esri.MapView;
  layer: FeatureLayer;
  config?: {
    title?: string | ((feature: __esri.Graphic) => string);
    actions?: Array<{
      label: string;
      onClick: (feature: __esri.Graphic) => void;
    }>;
  };
  onPopupOpen?: (feature: __esri.Graphic) => void;
  onPopupClose?: () => void;
  onFeatureSelect?: (feature: __esri.Graphic) => void;
  zoomToFeature?: (feature: __esri.Graphic) => void;
}

interface PopupPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface HitTestResult {
  type: string;
  graphic?: __esri.Graphic;
  layer?: __esri.Layer;
}

const CustomPopupManager: React.FC<CustomPopupManagerProps> = ({
  mapView,
  layer,
  config,
  onPopupOpen,
  onPopupClose,
  onFeatureSelect,
  zoomToFeature
}) => {
  const clickHandleRef = useRef<__esri.Handle | null>(null);
  const intervalRef = useRef<number | null>(null);
  const popupVisibleRef = useRef<boolean>(false);
  const selectedFeatureRef = useRef<__esri.Graphic | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const viewRef = useRef<__esri.MapView | null>(null);
  const featureLayerRef = useRef<__esri.FeatureLayer | null>(null);
  const initializedRef = useRef<boolean>(false);
  const visibilityHandleRef = useRef<__esri.Handle | null>(null);
  const [handles] = useState(new Handles());
  const popupRef = useRef<HTMLDivElement>(null);

  // **NEW: Apply standardized popup template (same as AI analysis layers)**
  const applyStandardizedPopup = (featureLayer: __esri.FeatureLayer) => {
    if (!featureLayer) return;

    try {
      console.log('[CustomPopupManager] Applying standardized popup to layer:', featureLayer.title);
      
      // Get all numeric fields for bar chart display
      const barChartFields = featureLayer.fields
        ?.filter(field => 
          ['double', 'single', 'integer', 'small-integer'].includes(field.type) &&
          !['OBJECTID', 'FID', 'Shape__Area', 'Shape__Length'].includes(field.name)
        )
        .map(field => field.name)
        .slice(0, 5) || []; // Limit to 5 fields for readability

      // Get all other fields for list display
      const listFields = featureLayer.fields
        ?.filter(field => 
          !['OBJECTID', 'FID', 'Shape__Area', 'Shape__Length'].includes(field.name) &&
          !barChartFields.includes(field.name)
        )
        .map(field => field.name)
        .slice(0, 8) || []; // Limit to 8 additional fields

      const config: StandardizedPopupConfig = {
        titleFields: ['DESCRIPTION', 'ID', 'FSA_ID', 'NAME', 'OBJECTID'],
        barChartFields,
        listFields,
        visualizationType: 'custom-popup-manager'
      };

      const popupTemplate = createStandardizedPopupTemplate(config);
      featureLayer.popupTemplate = popupTemplate;
      
      console.log('[CustomPopupManager] ✅ Successfully applied standardized popup');
    } catch (error) {
      console.error('[CustomPopupManager] ❌ Error applying standardized popup:', error);
      // Layer will use default popup behavior
    }
  };

  // Main initialization effect
  useEffect(() => {
    if (!mapView || !layer) {
      console.warn('[CustomPopupManager] Missing mapView or layer');
      return;
    }

    if (initializedRef.current) {
      return;
    }

    // Wait for map to be ready
    if (!mapView.map) {
      console.warn('[CustomPopupManager] Map not initialized');
      return;
    }

    initializedRef.current = true;
    viewRef.current = mapView;
    
    if (layer.type === 'feature') {
      featureLayerRef.current = layer as __esri.FeatureLayer;
      
      // **NEW: Apply standardized popup template**
      applyStandardizedPopup(featureLayerRef.current);
      
      // Initialize popup only if it exists
      if (mapView.popup) {
        // Disable default popup behavior
        mapView.popup.autoCloseEnabled = false;
        mapView.popup.dockEnabled = false;
        mapView.popup.visible = false;
        mapView.popup.actions = [];

        // Set up popup event handlers using reactiveUtils.watch
        const popupWatchHandle = reactiveUtils.watch(
          () => mapView.popup?.visible,
          (newValue) => {
          if (newValue && mapView.popup?.selectedFeature) {
            onPopupOpen?.(mapView.popup.selectedFeature);
          } else {
            onPopupClose?.();
          }
          }
        );

        // Store the watch handle for cleanup
        clickHandleRef.current = popupWatchHandle;
      }

      // Watch layer visibility
      const visibilityHandle = reactiveUtils.watch(
        () => featureLayerRef.current?.visible ?? false,
        (newValue: boolean) => {
          // Layer visibility changed
        }
      );

      // Store the visibility watch handle for cleanup
      visibilityHandleRef.current = visibilityHandle;

      // Setup popup observer
      const popupRemoverObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type !== 'childList' || !mutation.addedNodes.length) {
            return;
          }

          mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLElement)) {
              return;
            }

            const isPopupElement = popupClassNames.some(className => 
              node.className && node.className.includes(className)
            );

            if (isPopupElement && !hasProtectedParentClass(node)) {
              if (featureLayerRef.current && viewRef.current) {
                const popup = viewRef.current.popup;
                if (popup && popup.visible && popup.selectedFeature) {
                  if (!node.classList.contains('custom-handled')) {
                    node.classList.add('custom-handled');
                    onPopupOpen?.(popup.selectedFeature);
                  }
                }
              }
            }
          });
        });
      });

      const viewRoot = document.querySelector('.esri-view-root');
      if (viewRoot) {
        popupRemoverObserver.observe(viewRoot, {
          childList: true,
          subtree: true
        });
      }

      observerRef.current = popupRemoverObserver;
    }

      // Cleanup function
      return () => {
      if (clickHandleRef.current) {
        clickHandleRef.current.remove();
        clickHandleRef.current = null;
      }
      if (visibilityHandleRef.current) {
        visibilityHandleRef.current.remove();
        visibilityHandleRef.current = null;
        }
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        viewRef.current = null;
        featureLayerRef.current = null;
      initializedRef.current = false;
      };
  }, [mapView, layer, config, onPopupOpen, onPopupClose, onFeatureSelect, zoomToFeature]);

  // 2. Disable popup functionality only for popup-specific properties
  useEffect(() => {
    if (mapView.popup) {
      mapView.popup.autoCloseEnabled = false; 
      mapView.popup.dockEnabled = false;
      mapView.popup.visible = false;
      mapView.popup.actions = [];
      
      // 3. Use a safer approach to override popup methods
      const originalOpen = mapView.popup.open;
      
      mapView.popup.open = function() {
        return null;
      };
    }
  }, [mapView]);
  
  // 4. Disable native popups on all feature layers
  useEffect(() => {
    if (mapView.map) {
      mapView.map.allLayers.forEach(layer => {
        if (layer.type === 'feature') {
          const featureLayer = layer as __esri.FeatureLayer;
          featureLayer.popupEnabled = false;
        }
      });
    }
  }, [mapView]);
  
  // Ensure feature layer visibility can be controlled by application
  useEffect(() => {
    if (mapView.map) {
      mapView.map.allLayers.forEach(layer => {
        if (layer.type === 'feature') {
          const featureLayer = layer as __esri.FeatureLayer;
        }
      });
    }
  }, [mapView]);
  
  // Define classes that should be protected (never modified)
  const protectedClassNames = [
    'layer', 
    'widget', 
    'esri-ui', 
    'esri-component',
    'list',
    'toggle',
    'legend',
    'search',
    'panel',
    'menu',
    'item',
    'button',
    'control'
  ];
  
  // Define classes that are specifically for popups we want to handle
  const popupClassNames = [
    'esri-popup',
    'esri-popup__main-container',
    'esri-popup__content',
    'esri-popup__footer',
    'esri-popup__header'
  ];
  
  // Helper function to check if an element has a protected parent
  const hasProtectedParentClass = (element: Element): boolean => {
    let current = element;
    // Check up to 10 levels of parents to avoid infinite loops
    for (let i = 0; i < 10; i++) {
      if (!current || current === document.body) return false;
      
      // Check if this element has any protected class
      for (const className of protectedClassNames) {
        if (current.className && current.className.includes(className)) {
          console.log(`Protected parent found: ${current.className}`);
          return true;
        }
      }
      
      if (!current.parentElement) return false;
      current = current.parentElement;
    }
    return false;
  };
  
  // Add padding to the top of the map to prevent popup from being cut off
  const currentPadding = mapView.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const topPadding = typeof currentPadding.top === 'number' ? currentPadding.top : 0;
  const rightPadding = typeof currentPadding.right === 'number' ? currentPadding.right : 0;
  const popupWidth = 320; // Width of the custom popup
  const paddingBuffer = 15; // Space between popup and edge/other UI
  
  mapView.padding = {
    ...currentPadding,
    top: Math.max(topPadding, 15), // Reset top padding, docking handles overlap
    right: Math.max(rightPadding, popupWidth + paddingBuffer) // Add right padding for docked popup
  };
  
  // Track clicks on the map which may open popups
  const clickHandler = mapView.on('click', (event: __esri.ViewClickEvent) => {
    // Remove any existing popups first
    const existingPopups = document.querySelectorAll('.custom-popup');
    existingPopups.forEach(el => {
      // Check if the element is still in the DOM before trying to remove it
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });

    // Perform explicit hit test to find features
    mapView.hitTest(event).then(response => {
      // Find the first graphic hit from the layer this manager is responsible for
      const graphicResult = response.results.find(result =>
        result.type === "graphic" &&
        result.graphic &&
        result.graphic.layer &&
        result.graphic.layer.id === layer.id
      ) as __esri.GraphicHit | undefined;

      if (graphicResult) {
        const hitFeature = graphicResult.graphic;
        const targetLayer = hitFeature.layer as FeatureLayer;

        if (targetLayer && hitFeature.attributes) {
          const objectIdField = targetLayer.objectIdField;
          const objectId = hitFeature.attributes[objectIdField];

          // If we have an objectId, query the layer to ensure we have all attributes
          if (objectId !== undefined) {
            targetLayer.queryFeatures({
              objectIds: [objectId],
              outFields: ["*"], // Crucially, get all fields
              returnGeometry: true
            }).then(queryResponse => {
              if (queryResponse.features.length > 0) {
                const fullFeature = queryResponse.features[0];
                createCustomPopup(fullFeature, event.mapPoint);
              }
            }).catch(queryError => {
              console.error('[CustomPopupManager] Failed to query for full feature:', queryError);
              // Fallback to the original hit feature if the query fails for some reason
              createCustomPopup(hitFeature, event.mapPoint);
            });
          } else {
            // If there's no objectId for some reason, just use the hit feature
            createCustomPopup(hitFeature, event.mapPoint);
          }
        }
      }
    }).catch(error => {
      console.error('[CustomPopupManager] Error in hit test:', error);
    });
  });
  
  // Function to create a custom popup for a feature
  const createCustomPopup = (feature: __esri.Graphic, location: __esri.Point) => {
    // Create the popup container
    const popupContainer = document.createElement('div');
    popupContainer.className = 'custom-popup';
    
    // Create the popup header
    const popupHeader = document.createElement('div');
    popupHeader.style.display = 'flex';
    popupHeader.style.justifyContent = 'space-between';
    popupHeader.style.alignItems = 'center';
    popupHeader.style.padding = '12px 16px';
    popupHeader.style.borderBottom = '1px solid rgba(0,0,0,0.05)';
    popupHeader.style.backgroundColor = '#33a852';
    popupHeader.style.color = 'white';
    popupHeader.style.borderTopLeftRadius = '8px';
    popupHeader.style.borderTopRightRadius = '8px';
    
    // Create title
    const title = document.createElement('h3');
    title.style.margin = '0';
    title.style.fontSize = '12px';
    title.style.fontWeight = 'bold';
    title.style.color = 'white';
    
    // Determine title from feature attributes, prioritizing DESCRIPTION field
    let titleText = 'Feature Information';
    if (feature.attributes) {
      const attributes = feature.attributes;
      

      

      
      // Use standardized title determination logic
      titleText = determinePopupTitle(attributes);
    }
    title.textContent = titleText.toString().trim();
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '24px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.color = 'white';
    closeButton.style.width = '24px';
    closeButton.style.height = '24px';
    closeButton.style.display = 'flex';
    closeButton.style.justifyContent = 'center';
    closeButton.style.alignItems = 'center';
    closeButton.style.padding = '0';
    closeButton.style.marginLeft = '8px';
    // Close button handler: remove popup and cleanup listener
    closeButton.onclick = () => {
      // Safely remove popup if still attached
      if (popupContainer.parentNode === mapView.container && mapView.container) {
        mapView.container.removeChild(popupContainer);
      }
      // Remove outside click listener
      document.removeEventListener('click', handleOutsideClick);
      if (onPopupClose) {
        onPopupClose();
      }
    };
    
    // Add title and close button to header
    popupHeader.appendChild(title);
    popupHeader.appendChild(closeButton);
    
    // Create popup content
    const popupContent = document.createElement('div');
    popupContent.style.padding = '16px';
    popupContent.style.maxHeight = '400px';
    popupContent.style.overflow = 'auto';
    
    // Create chart container
    const chartContainer = document.createElement('div');
    // Hide chart until data is loaded to avoid blank overlay
    chartContainer.style.display = 'none';
    chartContainer.style.marginBottom = '16px';
    
    // Add action buttons
    const actionsContainer = document.createElement('div');
    actionsContainer.style.display = 'flex';
    actionsContainer.style.justifyContent = 'space-between';
    actionsContainer.style.alignItems = 'center';
    actionsContainer.style.width = '100%';
    actionsContainer.style.gap = '4px';
    actionsContainer.style.margin = '16px 0';
    
    // Create Zoom to button (green, with icon)
    const zoomButton = document.createElement('button');
    zoomButton.innerHTML = '';
    const zoomIconNode = document.createElement('span');
    const zoomRoot = createRoot(zoomIconNode);
    zoomRoot.render(<ZoomIn size={16} color="white" />);
    zoomIconNode.style.marginRight = '4px';
    zoomButton.appendChild(zoomIconNode);
    zoomButton.appendChild(document.createTextNode('Zoom to'));
    zoomButton.style.flex = '1';
    zoomButton.style.display = 'flex';
    zoomButton.style.alignItems = 'center';
    zoomButton.style.justifyContent = 'center';
    zoomButton.style.color = 'white';
    zoomButton.style.fontSize = '12px';
    zoomButton.style.fontWeight = '500';
    zoomButton.style.cursor = 'pointer';
    zoomButton.style.backgroundColor = '#33a852';
    zoomButton.style.border = 'none';
    zoomButton.style.borderRadius = '4px';
    
    zoomButton.onmouseover = () => {
      zoomButton.style.backgroundColor = '#2a7e42';
    };
    
    zoomButton.onmouseout = () => {
      zoomButton.style.backgroundColor = '#33a852';
    };
    
    zoomButton.onclick = () => {
      // Check if the feature has a geometry
      if (feature.geometry) {
        // For points, center on the point and zoom in
        if (feature.geometry.type === 'point') {
          mapView.goTo({
            target: feature.geometry,
            zoom: 12
          }, { duration: 500 });
        } 
        // For polygons and polylines, go to the extent
        else {
          if (feature.geometry.extent) {
            mapView.goTo(feature.geometry.extent.expand(1.5), { duration: 500 });
          }
        }
      }
      
      // If there's a custom zoom action defined in config, also call that
      if (config?.actions) {
        const zoomAction = config.actions.find(a => a.label === 'Zoom to');
        if (zoomAction) {
          zoomAction.onClick(feature);
        }
      }
    };
    
    // Create Infographics button (with icon)
    const infoButton = document.createElement('button');
    infoButton.innerHTML = '';
    const infoIconNode = document.createElement('span');
    const infoRoot = createRoot(infoIconNode);
    infoRoot.render(<BarChartBig size={16} color="white" />);
    infoIconNode.style.marginRight = '4px';
    infoButton.appendChild(infoIconNode);
    infoButton.appendChild(document.createTextNode('Infographics'));
    infoButton.style.flex = '1';
    infoButton.style.display = 'flex';
    infoButton.style.alignItems = 'center';
    infoButton.style.justifyContent = 'center';
    infoButton.style.color = 'white';
    infoButton.style.fontSize = '12px';
    infoButton.style.fontWeight = '500';
    infoButton.style.cursor = 'pointer';
    infoButton.style.backgroundColor = '#33a852';
    infoButton.style.border = 'none';
    infoButton.style.borderRadius = '4px';
    
    infoButton.onmouseover = () => {
      infoButton.style.backgroundColor = '#2a7e42';
    };
    
    infoButton.onmouseout = () => {
      infoButton.style.backgroundColor = '#33a852';
    };
    
    infoButton.onclick = () => {
      console.log('[CustomPopupManager] Infographics button clicked!');
      const geometry = feature.geometry; // Get geometry first
      console.log('[CustomPopupManager] Geometry object:', geometry);

      if (geometry) {
        console.log('[CustomPopupManager] Geometry type:', geometry.type);
        
        // Store geometry in localStorage for InfographicsTab to pick up
        const geometryData = {
          type: geometry.type,
          rings: geometry.type === 'polygon' ? (geometry as __esri.Polygon).rings : undefined,
          x: geometry.type === 'point' ? (geometry as __esri.Point).x : undefined,
          y: geometry.type === 'point' ? (geometry as __esri.Point).y : undefined,
          spatialReference: geometry.spatialReference.toJSON()
        };
        
        console.log('[CustomPopupManager] Geometry data to store:', geometryData);
        localStorage.setItem('emergencyGeometry', JSON.stringify(geometryData));
        console.log('[CustomPopupManager] Stored geometry in localStorage');
        
        // Verify storage worked
        const stored = localStorage.getItem('emergencyGeometry');
        console.log('[CustomPopupManager] Verification - stored data exists:', !!stored);
      }

      // 1. Dispatch event (Re-enabled)
      const infographicsEvent = new CustomEvent('openInfographics', {
        detail: { geometry: geometry }, // Pass geometry
        bubbles: true,
        composed: true
      });
      document.dispatchEvent(infographicsEvent);
      // console.log('[CustomPopupManager] Event dispatch skipped for testing.'); // Remove testing log

      // 2. Remove delayed call to global function
      // setTimeout(() => {
      //   if (typeof (window as any).forceToStep3 === 'function') {
      //     console.log('[CustomPopupManager] Calling window.forceToStep3 (delayed)...');
      //     try {
      //       const success = (window as any).forceToStep3(geometry);
      //       console.log(`[CustomPopupManager] window.forceToStep3 call returned: ${success}`);
      //     } catch (e) {
      //       console.error('[CustomPopupManager] Error calling window.forceToStep3:', e);
      //     }
      //   } else {
      //     console.warn('[CustomPopupManager] window.forceToStep3 function not found (delayed check).');
      //   }
      // }, 100); // 100ms delay
      
      // 3. Call original configured action if exists
      if (config?.actions) {
        const infoAction = config.actions.find(a => a.label === 'Infographics');
        if (infoAction) {
          infoAction.onClick(feature); 
        }
      }
    };
    
    // Add buttons to actions container
    actionsContainer.appendChild(zoomButton);
    actionsContainer.appendChild(infoButton);
    
    // Add buttons and chart container to content: buttons first, then chart
    // Center and justify buttons
    actionsContainer.style.justifyContent = 'center';
    actionsContainer.style.alignItems = 'center';
    popupContent.appendChild(actionsContainer);
    popupContent.appendChild(chartContainer);
    // Generate bar chart showing all layers
    generateBarChart(feature, chartContainer, mapView);
    
    // ----------------- SHAP FEATURE IMPORTANCE (optional) -----------------
    const shapImportanceData = (layer as any).shapFeatureImportance as Array<{ feature: string; importance: number }> | undefined;
    if (shapImportanceData && shapImportanceData.length > 0) {
      const shapContainer = document.createElement('div');
      shapContainer.style.marginTop = '12px';

      const shapHeader = document.createElement('h4');
      shapHeader.textContent = 'Top Model Drivers';
      shapHeader.style.margin = '0 0 6px 0';
      shapHeader.style.fontSize = '12px';
      shapHeader.style.fontWeight = 'bold';
      shapContainer.appendChild(shapHeader);

      const topItems = [...shapImportanceData]
        .sort((a, b) => Math.abs(b.importance) - Math.abs(a.importance))
        .slice(0, 5);
      const maxVal = Math.max(...topItems.map(i => Math.abs(i.importance)));

      topItems.forEach(item => {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '6px';
        row.style.marginBottom = '4px';

        const label = document.createElement('span');
        label.textContent = FieldMappingHelper.getFriendlyFieldName(item.feature);
        label.style.fontSize = '11px';
        label.style.minWidth = '80px';
        row.appendChild(label);

        const barBg = document.createElement('div');
        barBg.style.flex = '1';
        barBg.style.height = '6px';
        barBg.style.background = '#e0e0e0';
        barBg.style.borderRadius = '3px';
        barBg.style.position = 'relative';

        const barFill = document.createElement('div');
        barFill.style.width = `${(Math.abs(item.importance) / (maxVal || 1)) * 100}%`;
        barFill.style.height = '100%';
        barFill.style.background = '#fbbc04';
        barFill.style.borderRadius = '3px';
        barBg.appendChild(barFill);

        row.appendChild(barBg);
        shapContainer.appendChild(row);
      });

      popupContent.appendChild(shapContainer);
    }
    // ----------------------------------------------------------------------
    
    // Add header and content to container
    popupContainer.appendChild(popupHeader);
    popupContainer.appendChild(popupContent);
    
    // Position the popup on screen
    // Convert map point to screen point
    // const screenPoint = mapView.toScreen(location);
    
    // Position popup slightly above the click point
    popupContainer.style.position = 'absolute';
    // Dock to top-right corner
    popupContainer.style.top = `${paddingBuffer}px`;
    popupContainer.style.right = `${paddingBuffer + (popupWidth / 2) + paddingBuffer}px`; // Shift left by half-width + buffer (15 + 160 + 15 = 190px)
    // Remove left positioning
    // popupContainer.style.left = 'auto'; 
    popupContainer.style.width = `${popupWidth}px`; // Use variable
    popupContainer.style.backgroundColor = 'white';
    // Use CSS-defined border-radius and box-shadow instead of inline styles
    // popupContainer.style.borderRadius = '8px';
    // popupContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.15)';
    popupContainer.style.zIndex = '1000';
    
    // Add the popup to the map view container instead of the document body
    // document.body.appendChild(popupContainer); 
    if (mapView.container) {
        mapView.container.appendChild(popupContainer);
    } else {
      //  console.error("[CustomPopupManager] MapView container not found!");
        return; // Don't proceed if container is missing
    }

    // Add a click event listener to close the popup when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if (!popupContainer.contains(e.target as Node) && e.target !== popupContainer) {
        // Safely remove popup if still attached
        // if (popupContainer.parentNode === document.body) { // Old check
        //  document.body.removeChild(popupContainer);
        // }
        if (popupContainer.parentNode === mapView.container && mapView.container) { // New check
          mapView.container.removeChild(popupContainer);
        }
        // Cleanup listener
        document.removeEventListener('click', handleOutsideClick);
        if (onPopupClose) {
          onPopupClose();
        }
      }
    };

    // Delay adding the event listener to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
    
    // console.log('[CustomPopupManager] Custom popup created and added to DOM');
    
    // Notify about popup open via callback
    if (onPopupOpen) {
      onPopupOpen(feature);
    }
  };
  
  clickHandleRef.current = clickHandler;

  // Removed debug monitoring and repair logic to prevent loading loops

  // Setup event listeners for custom events
  const zoomToFeatureHandler = (e: Event) => {
    const customEvent = e as CustomEvent<__esri.Graphic>;
    if (customEvent.detail && zoomToFeature) {
      zoomToFeature(customEvent.detail);
    }
  };

  // Add event listeners
  window.addEventListener('zoom-to-feature', zoomToFeatureHandler);
  // NOTE: show-infographics handler removed - now handled directly in popup button
  
  const view = mapView; // No casting needed since interface now specifies MapView

  const resizeObserver = new ResizeObserver(() => {
    if (popupRef.current && popupRef.current.style.display !== 'none') {
      const popupRect = popupRef.current.getBoundingClientRect();
      if (view.container) {
        const viewRect = view.container.getBoundingClientRect();
        
        // Adjust padding based on popup position
        // ... (rest of the padding logic)
      }
    }
  });

  const popupNode = popupRef.current;
  if (popupNode) {
    resizeObserver.observe(popupNode);
  }
  
  return null;
};

// Function to apply custom popup templates to all feature layers
const applyCustomPopupTemplates = (view: __esri.MapView, config?: PopupConfig) => {
  if (!view || !view.map) return;
  
  view.map.allLayers.forEach(layer => {
    if (layer.type === 'feature') {
      const featureLayer = layer as __esri.FeatureLayer;
    //  console.log(`[CustomPopupManager] Configuring custom popup for layer: ${featureLayer.title}`);
      
      // Use the provided config title or generate a default one
      const title = config?.title ? 
        (typeof config.title === 'function' ? 
          '{expression/titleExpression}' : 
          config.title) :
        '{expression/defaultTitle}';
        
      // Create a custom popup template with bar chart and action buttons
      const popupTemplate = new PopupTemplate({
        title: title,
        outFields: ["*"],
        expressionInfos: [
          {
            name: "defaultTitle",
            title: "Default Title",
            expression: "IIf(HasKey($feature, 'DESCRIPTION'), $feature.DESCRIPTION, IIf(HasKey($feature, 'NAME'), $feature.NAME, 'Feature ' + $feature.OBJECTID))"
          },
          {
            name: "titleExpression",
            title: "Custom Title",
            expression: "IIf(HasKey($feature, 'DESCRIPTION'), $feature.DESCRIPTION, IIf(HasKey($feature, 'NAME'), $feature.NAME, 'Feature ' + $feature.OBJECTID))"
          }
        ],
        content: [
          new CustomContent({
            outFields: ["*"],
            creator: (event?: { graphic?: __esri.Graphic }) => {
              // Create container element
              const container = document.createElement("div");
              container.className = "custom-popup-container";
              
              // Create chart container
              const chartContainer = document.createElement("div");
              chartContainer.className = "popup-chart-container";
              
              // Create action buttons container
              const actionsContainer = document.createElement("div");
              actionsContainer.className = "popup-actions";
              
              // Create zoom button
              const zoomButton = document.createElement("button");
              zoomButton.textContent = "Zoom to";
              zoomButton.className = "popup-action-button";
              zoomButton.style.backgroundColor = "#4285f4";
              zoomButton.style.color = "white";
              
              // Create infographics button
              const infoButton = document.createElement("button");
              infoButton.textContent = "Infographics";
              infoButton.className = "popup-action-button";
              infoButton.style.backgroundColor = "#33a852";
              infoButton.style.color = "white";
              
              // Get the graphic from the event if available
              const graphic = event?.graphic;
              
              // Add event listeners to buttons
              zoomButton.addEventListener("click", () => {
                if (config?.actions && config.actions.length > 0 && graphic) {
                  const zoomAction = config.actions.find(a => a.label === 'Zoom to');
                  if (zoomAction) {
                    zoomAction.onClick(graphic);
                  }
                }
              });
              
              infoButton.addEventListener("click", () => {
                if (config?.actions && config.actions.length > 1 && graphic) {
                  const infoAction = config.actions.find(a => a.label === 'Infographics');
                  if (infoAction) {
                    infoAction.onClick(graphic);
                  }
                }
              });
              
              // Add buttons to actions container
              actionsContainer.appendChild(zoomButton);
              actionsContainer.appendChild(infoButton);
              
              // Add chart container to main container
              container.appendChild(chartContainer);
              
              // Add actions container to main container
              container.appendChild(actionsContainer);
              
              // Generate the chart for the current feature
              if (graphic) {
                generateBarChart(graphic, chartContainer, view);
              }
              
              return container;
            }
          })
        ]
      });
      
      featureLayer.popupTemplate = popupTemplate;
      featureLayer.popupEnabled = true;
    }
  });
};

// Function to generate a bar chart showing all visible layers in the layer list widget
const generateBarChart = (
  feature: __esri.Graphic, 
  container: HTMLElement, 
  view: __esri.MapView
) => {
  // Define bar colors
  const colors = [
    '#33a852', '#4285f4', '#fbbc05', '#ea4335', 
    '#5f6bfb', '#28b5f5', '#8e44ad', '#16a085',
    '#f39c12', '#2c3e50', '#7f8c8d', '#e74c3c'
  ];
  
  // Helper function to clean layer names for display purposes only
  const cleanLayerNameForDisplay = (name: string): string => {
    let cleanName = name;
    
    // Remove "2024" from the beginning
    cleanName = cleanName.replace(/^2024\s+/, '');
    
    // Convert "()" to "(%)" at the end
    if (cleanName.endsWith(' ( )')) {
      cleanName = cleanName.replace(' ( )', ' (%)');
    }
    
    return cleanName;
  };
  
  // Helper function to clean widget titles for display purposes only
  const cleanWidgetTitleForDisplay = (name: string): string => {
    let cleanName = name;
    
    // Remove "2024" from the beginning
    cleanName = cleanName.replace(/^2024\s+/, '');
    
    // Remove "()" or "(%)" from the end for widget titles
    cleanName = cleanName.replace(/\s+\(\s*%?\s*\)$/, '');
    
    return cleanName;
  };
  
  // Data type for chart
  interface LayerData {
    id: string;
    name: string;
    value: number;
    min: number;
    max: number;
    median: number;
    color: string;
  }

  // Clear the container
  container.innerHTML = "";
  
  // Special case for AI visualization layers
  const isAiVisualizationLayer = feature.layer && 
    (typeof feature.layer.id === 'string' && 
     (feature.layer.id.startsWith('viz_') || feature.layer.id.includes('correlation')));

  if (isAiVisualizationLayer) {
    // Prepare metrics for correlation visualization pop-up
    const attrs = feature.attributes || {};

    // Helper to push metric definition safely
    interface Metric { label: string; value: number; color: string; isPercent?: boolean; }
    const metrics: Metric[] = [];

    // 1) Correlation score (if available)
    if (typeof attrs.correlation_score === 'number') {
      metrics.push({ label: 'Correlation Score', value: Math.abs(attrs.correlation_score), color: '#17a2b8', isPercent: true });
    }

    // Retrieve friendly names for the underlying fields, if stored on the layer
    const layerAny = feature.layer as any;
    const rawPrimaryField = layerAny?.primaryField || 'primary_value';
    const rawComparisonField = layerAny?.comparisonField || 'comparison_value';

    // 2) Primary metric
    if (typeof attrs[rawPrimaryField] === 'number') {
      metrics.push({
        label: FieldMappingHelper.getFriendlyFieldName(rawPrimaryField),
        value: attrs[rawPrimaryField],
        color: '#007bff'
      });
    }

    // 3) Comparison metric
    if (typeof attrs[rawComparisonField] === 'number') {
      metrics.push({
        label: FieldMappingHelper.getFriendlyFieldName(rawComparisonField),
        value: attrs[rawComparisonField],
        color: '#28a745'
      });
    }

    // Render each metric as a bar row
    metrics.forEach(metric => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.marginBottom = '8px';
      row.style.padding = '6px 8px';
      row.style.background = '#f8f9fa';
      row.style.borderRadius = '6px';

      // Label
      const label = document.createElement('div');
      label.textContent = metric.label;
      label.style.width = '120px';
      label.style.textAlign = 'right';
      label.style.fontSize = '12px';
      label.style.fontWeight = '500';
      label.style.whiteSpace = 'normal';
      label.style.wordBreak = 'break-word';

      // Bar wrapper
      const barWrapper = document.createElement('div');
      barWrapper.style.flex = '1';
      barWrapper.style.height = '18px';
      barWrapper.style.backgroundColor = '#e9ecef';
      barWrapper.style.borderRadius = '9px';
      barWrapper.style.margin = '0 12px';

      const barFill = document.createElement('div');
      let widthPercent = 0;
      if (metric.isPercent || metric.value <= 1) {
        widthPercent = Math.min(Math.abs(metric.value) * 100, 100);
      } else {
        // Estimate scale based on value magnitude
        widthPercent = Math.min((metric.value / 100) * 100, 100);
      }
      barFill.style.width = `${Math.max(widthPercent, 5)}%`;
      barFill.style.height = '100%';
      barFill.style.backgroundColor = metric.color;
      barFill.style.borderRadius = '9px';

      // Value text
      const valueText = document.createElement('div');
      valueText.textContent = metric.value.toLocaleString(undefined, { maximumFractionDigits: 3 });
      valueText.style.minWidth = '60px';
      valueText.style.textAlign = 'right';
      valueText.style.fontSize = '12px';
      valueText.style.fontWeight = '600';
      valueText.style.color = '#495057';

      barWrapper.appendChild(barFill);
      row.appendChild(label);
      row.appendChild(barWrapper);
      row.appendChild(valueText);
      container.appendChild(row);
    });

    // Show now
    container.style.display = 'block';
    return;
  }

  // Get visible feature layers
  const visibleLayers = view.map.allLayers
    .filter(layer => layer.type === 'feature' && layer.visible && layer.listMode !== 'hide')
    .toArray() as __esri.FeatureLayer[];
  if (visibleLayers.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">No visible layers to display</div>';
    return;
  }

  // Asynchronously fetch distribution stats and render bars
  (async () => {
    // Clear previous content
    container.innerHTML = '';
    // Show chart once ready
    container.style.display = 'block';
    try {
      type LayerStat = { id: string; name: string; value: number; min: number; max: number; median: number; color: string };
      const stats: LayerStat[] = await Promise.all(
        visibleLayers.map(async (layer, idx) => {
          // Get the application's layer configuration to access custom properties
          const layerConfig = getLayerConfigById(layer.id);

          // Find a numeric field (exclude the object ID field)
          const oidField = (layer as any).objectIdField;
          
          // Prioritize rendererField from the config if it exists
          const rendererField = layerConfig?.rendererField;
          let numericFieldInfo = rendererField ? layer.fields?.find(f => f.name === rendererField) : undefined;

          if (!numericFieldInfo) {
            numericFieldInfo = layer.fields?.find(f =>
              ['small-integer','integer','single','double'].includes(f.type) &&
              f.name !== oidField
            );
          }
          
          if (!numericFieldInfo || !numericFieldInfo.name) {
            return { id: layer.id, name: layer.title || `Layer ${idx+1}`, value: NaN, min: NaN, max: NaN, median: NaN, color: colors[idx % colors.length] };
          }

          const numericField = numericFieldInfo.name;
          const labelText = FieldMappingHelper.getFriendlyFieldName(numericField);
          
          // Query all feature values for numericField to get stats
          const q = layer.createQuery();
          q.where = '1=1';
          q.outFields = [numericField];
          q.returnGeometry = false;
          const result = await layer.queryFeatures(q);
          const values = result.features
            .map(f => f.attributes[numericField])
            .filter(v => typeof v === 'number') as number[];
          const sorted = [...values].sort((a, b) => a - b);
          const min = sorted[0] ?? 0;
          const max = sorted[sorted.length - 1] ?? 0;
          const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0;
          
          // Determine this feature's value using a spatial query on its geometry
          let featureValue = NaN;
          if (feature.geometry) {
            const qVal = layer.createQuery();
            qVal.geometry = feature.geometry;
            qVal.spatialRelationship = 'intersects';
            qVal.outFields = [numericField];
            qVal.returnGeometry = false;
            const valResult = await layer.queryFeatures(qVal);
            if (valResult.features.length > 0) {
              const v = valResult.features[0].attributes[numericField];
              if (typeof v === 'number') {
                featureValue = v;
              }
            }
          }
          return { id: layer.id, name: labelText, value: featureValue, min, max, median, color: colors[idx % colors.length] };
        })
      );
      // Separate selected layer first
      const selId = feature.layer?.id;
      const selStat = stats.find(s => s.id === selId);
      const otherStats = stats.filter(s => s.id !== selId).sort((a, b) => (b.value - b.min) - (a.value - a.min));
      const finalStats = selStat ? [selStat, ...otherStats] : otherStats;
      finalStats.forEach(stat => {
        let displayName = stat.name;
        if (stat.id === 'applications') {
          displayName = 'Applications';
        } else if (stat.id === 'conversions') {
          displayName = 'Conversions';
        } else if (stat.id === 'conversionRate') {
          displayName = 'Conversion Rate';
        }
        
        const barContainer = document.createElement('div');
        barContainer.style.display = 'flex';
        barContainer.style.alignItems = 'center';
        barContainer.style.marginBottom = '8px';
        // Tooltip with formatted values
        barContainer.title = `${stat.name}\nValue: ${stat.value.toLocaleString()}\nRange: ${stat.min.toLocaleString()} – ${stat.max.toLocaleString()}\nMedian: ${stat.median.toLocaleString()}`;
        // Label
        const label = document.createElement('div');
        label.textContent = displayName;
        label.style.fontSize = '12px';
        label.style.width = '120px';
        label.style.whiteSpace = 'normal';
        label.style.wordBreak = 'break-word';
        // Bar wrapper and bar
        const barWrapper = document.createElement('div');
        barWrapper.style.flex = '1';
        barWrapper.style.height = '20px';
        barWrapper.style.backgroundColor = '#f0f0f0';
        barWrapper.style.borderRadius = '4px';
        barWrapper.style.margin = '0 8px';
        const bar = document.createElement('div');
        const range = stat.max - stat.min;
        const percent = range > 0 ? ((stat.value - stat.min) / range) * 100 : 0;
        bar.style.width = `${percent}%`;
        bar.style.height = '100%';
        bar.style.backgroundColor = stat.color;
        bar.style.borderRadius = '4px';
        // Append
        barWrapper.appendChild(bar);
        barContainer.appendChild(label);
        barContainer.appendChild(barWrapper);
        container.appendChild(barContainer);
      });
    } catch (err) {
      console.error('Error generating chart data:', err);
      container.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">Error loading data</div>';
    }
  })();
};

export default CustomPopupManager;
export { applyCustomPopupTemplates };
