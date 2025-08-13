/* eslint-disable react-hooks/exhaustive-deps */
import React, { 
  useEffect, 
  useRef, 
  memo, 
  useCallback, 
  useState,
  useMemo
} from 'react';
import { X, Folder, Table as TableIcon } from 'lucide-react';
import { createPortal } from 'react-dom';
import './widget-styles.css';
// LayerState import removed - not needed without layer management
import { Root } from 'react-dom/client';
// Layer config and loading imports removed - handled by MapContainer

// ArcGIS Imports
import LayerList from '@arcgis/core/widgets/LayerList';
import Search from '@arcgis/core/widgets/Search';
import Print from '@arcgis/core/widgets/Print';
import Bookmarks from '@arcgis/core/widgets/Bookmarks';
import Bookmark from '@arcgis/core/webmap/Bookmark';
import Extent from '@arcgis/core/geometry/Extent';
import Collection from '@arcgis/core/core/Collection';
import LayerController from './LayerController/LayerController';


// Type Definitions
interface WidgetState {
  print: Print | null;
  search: __esri.widgetsSearch | null;
  bookmarks: Bookmarks | null;
  layerList: LayerList | null;
}

interface MapWidgetsProps {
  view: __esri.MapView;
  activeWidget: string | null;
  onClose: () => void;
  onLayerSelect: (layer: __esri.FeatureLayer) => void;
  onToggleWidget: (widgetName: string) => void;
  showLoading?: boolean;
  visibleWidgets?: string[]; // Array of widget names that should be visible
  onCorrelationAnalysis: (layer: __esri.FeatureLayer, primaryField: string, comparisonField: string) => void;
  onLayerStatesChange?: (states: any) => void;
  onLayersCreated?: (layers: __esri.FeatureLayer[]) => void; // NEW: For CustomPopupManager integration
}

// Define Florida City Bookmarks Data (Alphabetical Order)
const CITY_BOOKMARKS_DATA = [
  { name: "Jacksonville", extent: { xmin: -81.9, ymin: 30.1, xmax: -81.4, ymax: 30.5 } },
  { name: "Miami", extent: { xmin: -80.5, ymin: 25.6, xmax: -80.0, ymax: 26.0 } },
  { name: "Orlando", extent: { xmin: -81.6, ymin: 28.3, xmax: -81.1, ymax: 28.7 } },
  { name: "St. Petersburg", extent: { xmin: -82.9, ymin: 27.6, xmax: -82.5, ymax: 28.0 } },
  { name: "Tampa", extent: { xmin: -82.7, ymin: 27.8, xmax: -82.3, ymax: 28.2 } }
];

// +++ REMOVE LEGEND GENERATION LOGIC +++
// const getLegendDataForLayer = (layer: __esri.FeatureLayer): StandardizedLegendData | null => { ... };
// +++ END REMOVED LEGEND GENERATION LOGIC +++


const MapWidgets: React.FC<MapWidgetsProps> = memo(function MapWidgets({ 
  view, 
  activeWidget, 
  onClose,
  onLayerSelect,
  onToggleWidget,
  // legend,
  showLoading = false,
  visibleWidgets = ['search', 'layerList', 'bookmarks', 'print'], // Removed basemapGallery
  onLayerStatesChange,
  onLayersCreated
}: MapWidgetsProps) {


  // Refs
  const widgetsRef = useRef<WidgetState>({
    print: null,
    search: null,
    bookmarks: null,
    layerList: null,
  });
  
  const containersRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isInitialized = useRef(false);
  const mountedRef = useRef(false);
  
  // React roots
  const layerControlRootRef = useRef<Root | null>(null);
  const projectsRootRef = useRef<Root | null>(null);
  const filterRootRef = useRef<Root | null>(null);
  const indexRootRef = useRef<Root | null>(null);
  
  // LayerController ref removed - handled by MapContainer
  
  // State and handlers removed - layer management handled by MapContainer
  const [containersReady, setContainersReady] = useState(false);
  const widgetCleanupHandles = useRef<Map<string, __esri.Handle[]>>(new Map());
  
  // Track which widgets have been initialized (no longer using lazy loading)
  // const [initializedWidgets, setInitializedWidgets] = useState<Set<string>>(new Set());

  const layerListActionHandleRef = useRef<__esri.Handle | null>(null);

  // Layer config removed - handled by MapContainer

  // Create widget container - WRAP IN useCallback
  const createWidgetContainer = useCallback((type: string, color: string): HTMLDivElement => {
    const container = document.createElement('div');
    
    // Basic classes first
    container.className = 'widget-container esri-widget';
    
    // Add widget-specific ESRI classes
    switch(type) {
      case 'layerList':
        container.classList.add('esri-layer-list');
        break;
      case 'print':
        container.classList.add('esri-print');
        break;
      case 'search':
        container.classList.add('esri-search');
        break;
      case 'bookmarks':
        container.classList.add('esri-bookmarks');
        break;
      case 'filter':
        container.classList.add('esri-filter');
        break;
      case 'projects':
        container.classList.add('esri-projects');
        break;
      case 'index':
        container.classList.add('esri-index');
        break;
    }

    // Add our custom class last
    container.classList.add(`widget-${type}`);
    
    // Set other properties
    container.setAttribute('data-widget-type', type);
    container.style.setProperty('--widget-color', color);
    container.style.display = 'none';

   // console.log(`Created widget container for ${type}:`, container.className);
    
    return container;
  }, []); // <-- Empty dependency array ensures stable reference


  // Main cleanup effect
  useEffect(() => {
    mountedRef.current = true;
    
    const widgets = { ...widgetsRef.current }; // Capture ref value
    const cleanupHandles = new Map(widgetCleanupHandles.current); // Capture cleanup handles
    const layerListHandle = layerListActionHandleRef.current; // Capture layer list handle

    return () => {
      mountedRef.current = false;

      // Cleanup roots
      if (layerControlRootRef.current) {
        layerControlRootRef.current.unmount();
        layerControlRootRef.current = null;
      }
      
      if (projectsRootRef.current) {
        projectsRootRef.current.unmount();
        projectsRootRef.current = null;
      }
      
      if (filterRootRef.current) {
        filterRootRef.current.unmount();
        filterRootRef.current = null;
      }
      
      if (indexRootRef.current) {
        indexRootRef.current.unmount();
        indexRootRef.current = null;
      }

      
      // +++ Clean up Watcher Handles +++
      cleanupHandles.forEach((handles: __esri.Handle[], layerId: string) => {
       // console.log(`[MapWidgets Cleanup] Removing ${handles.length} watcher handles for layer ${layerId}`);
        handles.forEach((handle: __esri.Handle) => {
          try {
            handle.remove();
          } catch (removeError) {
            console.warn(`[MapWidgets Cleanup] Error removing handle for layer ${layerId}:`, removeError);
          }
        });
      });
      widgetCleanupHandles.current.clear();
      //console.log('[MapWidgets Cleanup] Watcher handle cleanup complete.');
      // --- End Watcher Cleanup ---

      // Clean up layer list action handle
      if (layerListHandle) {
        layerListHandle.remove();
        layerListActionHandleRef.current = null;
      }

      // Clean up widgets
      Object.values(widgets).forEach(widget => {
        if (widget) {
          widget.destroy();
        }
      });
    };
  }, [view]);

  // Widget visibility effect - SIMPLIFIED
  useEffect(() => {
    if (!view || !activeWidget) {
      // Hide and remove all containers
      containersRef.current.forEach((container) => {
        if (container) {
          container.style.display = 'none';
          if (container.parentElement) {
            view?.ui.remove(container);
          }
        }
      });
      return;
    }

    const currentContainer = containersRef.current.get(activeWidget);
    if (!currentContainer) {
      return;
    }

    // Hide/remove others
    containersRef.current.forEach((container) => {
      if (container !== currentContainer) {
        container.style.display = 'none';
        if (container.parentElement) {
          view.ui.remove(container);
        }
      }
    });
    
    // Show/add the active container
    currentContainer.style.display = 'block';
    if (!currentContainer.parentElement) {
      try {
        view.ui.add({ component: currentContainer, position: "top-left", index: 1 });
      } catch (error) {
        console.error(`MAPWIDGETS_VISIBILITY: Error during view.ui.add for ${activeWidget}:`, error);
      }
    } else {
    }

    return () => {
      if (currentContainer && currentContainer.parentElement) {
        currentContainer.style.display = 'none';
        view.ui.remove(currentContainer);
      }
    };
  }, [activeWidget, view]);

  // Widget initialization function (no longer used - keeping for reference)
  /*
  const initializeWidget = useCallback(async (widgetType: string) => {
    // Removed - widgets are now initialized immediately
  }, []);
  */

  // Main Initialization Effect - Initialize ALL widgets immediately
  useEffect(() => {
    if (!view || !containersReady) {
        return;
      }

    if (isInitialized.current) {
          return;
        }

    console.log('MapWidgets initialization - creating all widgets immediately');
    
    view.when(async () => {
      const containers = containersRef.current;
      const widgets = widgetsRef.current;
      const cleanupHandles = widgetCleanupHandles.current;

      try {
        // Initialize Search widget
        if (!widgets.search && containers.get('search')) {
          const searchWidget = new Search({ view, container: containers.get('search') });
          widgets.search = searchWidget;
          console.log('Search widget initialized');
        }

        // Initialize Print widget
        if (!widgets.print && containers.get('print')) {
          const printWidget = new Print({ 
            view, 
            container: containers.get('print'),
            printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
            templateOptions: {
              title: "Map Export",
              author: "",
              copyright: "",
              format: "pdf",
              layout: "a4-landscape"
            }
          });
          widgets.print = printWidget;
          console.log('Print widget initialized');
        }

        // Initialize Bookmarks widget
        if (!widgets.bookmarks && containers.get('bookmarks')) {
          const bookmarksWidget = new Bookmarks({ view, container: containers.get('bookmarks') });
          
          // Create Bookmark instances from US city data
          const cityBookmarks = new Collection(
            CITY_BOOKMARKS_DATA.map(city => 
              new Bookmark({
                name: city.name,
                viewpoint: {
                  targetGeometry: new Extent({
                    xmin: city.extent.xmin,
                    ymin: city.extent.ymin,
                    xmax: city.extent.xmax,
                    ymax: city.extent.ymax,
                    spatialReference: { wkid: 4326 }
                  })
                }
              })
            )
          );
          
          bookmarksWidget.bookmarks = cityBookmarks;
          widgets.bookmarks = bookmarksWidget;
          console.log('Bookmarks widget initialized');
        }

        // LayerList is handled by React portal, not native widget


        isInitialized.current = true;
        console.log('All widgets initialized successfully');
      } catch (error) {
        console.error('Error initializing widgets:', error);
      }
    }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('Error waiting for view ready:', error);
      }
    });
    
    // Cleanup function
    return () => {
      // Cleanup widgets on unmount
      Object.values(widgetsRef.current).forEach(widget => {
        if (widget && !widget.destroyed) {
          try {
            widget.destroy();
          } catch (e) {
            console.warn('Error destroying widget:', e);
          }
        }
      });
    };
  }, [view, containersReady, onLayerSelect]);

  // Container creation effect
  useEffect(() => {
    if (!view || containersReady) return; // Only run once when view is ready and containers aren't

    const allowedWidgets = visibleWidgets || ['search', 'layerList', 'bookmarks', 'print'];
    const createdContainers = new Map<string, HTMLDivElement>();

    allowedWidgets.forEach(widgetId => {
      // Determine color - default or map based on ID
      let color = '#ccc'; // Default color
      if (widgetId === 'search') color = '#4285f4';
      else if (widgetId === 'layerList') color = '#33a852';
      else if (widgetId === 'print') color = '#33a852';
      // Add other widget colors if needed
      
      const container = createWidgetContainer(widgetId, color);
      createdContainers.set(widgetId, container);
    });

    containersRef.current = createdContainers; // Store the created containers
    setContainersReady(true); // Signal that containers are ready

    // No cleanup needed here as containers are managed by ArcGIS UI later

  }, [view, containersReady, visibleWidgets, createWidgetContainer]); // Dependencies

  // Layer config state - needed for LayerController
  const [layerConfig, setLayerConfig] = useState<any>(null);
  
  // Initialize layer config
  useEffect(() => {
    const initLayerConfig = async () => {
      try {
        const { createProjectConfig } = await import('@/adapters/layerConfigAdapter');
        const config = createProjectConfig();
        setLayerConfig(config);
      } catch (error) {
        console.error('Error creating layer config:', error);
      }
    };
    initLayerConfig();
  }, []);

  // Render logic - LayerController portal for layerList widget
  const layerControllerPortal = useMemo(() => {
    if (!containersReady || !view || !layerConfig) {
      return null;
    }
    const container = containersRef.current?.get('layerList'); 
    if (!container) return null;
    
    return createPortal(
      <LayerController
        view={view}
        config={layerConfig}
        onLayerStatesChange={onLayerStatesChange}
        onLayersCreated={onLayersCreated}
        visible={activeWidget === 'layerList'} 
      />,
      container
    );
  }, [view, layerConfig, onLayerStatesChange, onLayersCreated, containersReady, activeWidget]);

  if (!view) return null;

  return (
    <div className="map-widgets-container">
      {showLoading && (
        <div className="loading-indicator">
          <span>Loading layers...</span>
        </div>
      )}
      {activeWidget && (
        <button
          onClick={onClose}
          className="widget-close-button"
          aria-label="Close widget"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      {/* Widget Icons */}
      <div className="widget-icons-container">
        {visibleWidgets?.includes('search') && (
          <button
            onClick={() => onToggleWidget('search')}
            className={`widget-icon ${activeWidget === 'search' ? 'active' : ''}`}
            title="Search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        )}
        
        {visibleWidgets?.includes('layerList') && (
          <button
            onClick={() => onToggleWidget('layerList')}
            className={`widget-icon ${activeWidget === 'layerList' ? 'active' : ''}`}
            title="Layers"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </button>
        )}
        
        {visibleWidgets?.includes('bookmarks') && (
          <button
            onClick={() => onToggleWidget('bookmarks')}
            className={`widget-icon ${activeWidget === 'bookmarks' ? 'active' : ''}`}
            title="Bookmarks"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        )}
        
        {visibleWidgets?.includes('print') && (
          <button
            onClick={() => onToggleWidget('print')}
            className={`widget-icon ${activeWidget === 'print' ? 'active' : ''}`}
            title="Print"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 6,2 18,2 18,9"/>
              <path d="M6,18H4a2,2,0,0,1-2-2V11a2,2,0,0,1,2-2H20a2,2,0,0,1,2,2v5a2,2,0,0,1-2,2H18"/>
              <polyline points="6,14 6,18 18,18 18,14"/>
            </svg>
          </button>
        )}
        
        {visibleWidgets?.includes('filter') && (
          <button
            onClick={() => onToggleWidget('filter')}
            className={`widget-icon ${activeWidget === 'filter' ? 'active' : ''}`}
            title="Filter"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"/>
            </svg>
          </button>
        )}
        
        {visibleWidgets?.includes('projects') && (
          <button
            onClick={() => onToggleWidget('projects')}
            className={`widget-icon ${activeWidget === 'projects' ? 'active' : ''}`}
            title="Projects"
          >
            <Folder width="16" height="16" />
          </button>
        )}
        
        {visibleWidgets?.includes('index') && (
          <button
            onClick={() => onToggleWidget('index')}
            className={`widget-icon ${activeWidget === 'index' ? 'active' : ''}`}
            title="Index"
          >
            <TableIcon width="16" height="16" />
          </button>
        )}
      </div>

      {/* Portal containers are rendered here when widgets are initialized */}
      {layerControllerPortal}
    </div>
  );
});

export default MapWidgets;
