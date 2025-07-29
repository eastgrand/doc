/* eslint-disable react-hooks/exhaustive-deps */
import React, { 
  useEffect, 
  useRef, 
  memo, 
  useCallback, 
  useState,
  useMemo
} from 'react';
import { X, Map as MapIcon, Folder, Table as TableIcon } from 'lucide-react';
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
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Bookmark from '@arcgis/core/webmap/Bookmark';
import Extent from '@arcgis/core/geometry/Extent';
import Collection from '@arcgis/core/core/Collection';

// LayerController removed - handled by MapContainer to prevent duplicate initialization


// Type Definitions
interface WidgetState {
  print: Print | null;
  search: __esri.widgetsSearch | null;
  bookmarks: Bookmarks | null;
  layerList: LayerList | null;
  basemapGallery: BasemapGallery | null;
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
}

// Define US City Bookmarks Data (Alphabetical Order)
const CITY_BOOKMARKS_DATA = [
  { name: "Albany", extent: { xmin: -74.1, ymin: 42.45, xmax: -73.4, ymax: 42.85 } },
  { name: "Buffalo", extent: { xmin: -79.2, ymin: 42.65, xmax: -78.6, ymax: 43.1 } },
  { name: "New York", extent: { xmin: -74.3, ymin: 40.55, xmax: -73.7, ymax: 40.9 } },
  { name: "Philadelphia", extent: { xmin: -75.4, ymin: 39.8, xmax: -74.9, ymax: 40.1 } },
  { name: "Pittsburgh", extent: { xmin: -80.2, ymin: 40.2, xmax: -79.6, ymax: 40.7 } },
  { name: "Trenton", extent: { xmin: -75.0, ymin: 40.05, xmax: -74.5, ymax: 40.4 } }
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
  visibleWidgets = ['search', 'layerList', 'bookmarks', 'print', 'basemapGallery'], // Added 'basemapGallery' to default
}: MapWidgetsProps) {


  // Refs
  const widgetsRef = useRef<WidgetState>({
    print: null,
    search: null,
    bookmarks: null,
    layerList: null,
    basemapGallery: null
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
  
  // LAZY LOADING: Track which widgets have been initialized
  const [initializedWidgets, setInitializedWidgets] = useState<Set<string>>(new Set());

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
      case 'basemapGallery':
        container.classList.add('esri-basemap-gallery');
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

  // LAZY LOADING: Initialize individual widget on-demand
  const initializeWidget = useCallback(async (widgetType: string) => {
    if (!view || !containersReady || initializedWidgets.has(widgetType)) {
      return;
    }

    console.log(`[LAZY LOADING] Initializing widget on-demand: ${widgetType}`);

    try {
      await view.when();
      const containers = containersRef.current;
      const container = containers.get(widgetType);
      
      if (!container) {
        console.warn(`[LAZY LOADING] No container found for widget: ${widgetType}`);
        return;
      }

      // Check if widget already exists before creating
      const widgets = widgetsRef.current;
      const cleanupHandles = widgetCleanupHandles.current;

      switch (widgetType) {
        case 'search':
          if (!widgets.search) {
            const searchWidget = new Search({ view, container });
            widgets.search = searchWidget;
          }
          break;
          
        case 'print':
          if (!widgets.print) {
            const printWidget = new Print({ 
              view, 
              container,
              printServiceUrl: "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
              templateOptions: {
                title: "Nesto Map Export",
                author: "Nesto Maps",
                copyright: "© 2024 Nesto",
                format: "pdf",
                layout: "a4-landscape"
              }
            });
            widgets.print = printWidget;
          }
          break;
          
        case 'bookmarks':
          if (!widgets.bookmarks) {
            const bookmarksWidget = new Bookmarks({ view, container });
            
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
          }
          break;
          
        case 'layerList':
          if (!widgets.layerList) {
            const layerListWidget = new LayerList({ 
              view, 
              container,
              listItemCreatedFunction: (event) => {
                const item = event.item;
                
                if (item.layer && item.layer.type === 'feature') {
                  item.panel = {
                    content: ["legend"],
                    open: false
                  };
                }
              }
            });
            
            // Set up LayerList action handlers
            const handle = layerListWidget.on("trigger-action", (event) => {
              const id = event.action.id;
              if (id === "information") {
                const target = event.item.layer as __esri.FeatureLayer;
                if (target && typeof onLayerSelect === 'function') {
                  onLayerSelect(target);
                }
              }
            });
            
            // Store handle for cleanup
            const handles = cleanupHandles.get('layerList') || [];
            handles.push(handle);
            cleanupHandles.set('layerList', handles);
            
            widgets.layerList = layerListWidget;
          }
          break;
          
        case 'basemapGallery':
          if (!widgets.basemapGallery) {
            const basemapGalleryWidget = new BasemapGallery({ 
              view, 
              container,
              source: {
                query: {
                  title: "United States Basemaps",
                  owner: "Esri_en"
                }
              }
            });
            widgets.basemapGallery = basemapGalleryWidget;
          }
          break;
      }
      
      setInitializedWidgets(prev => new Set([...prev, widgetType]));
      console.log(`[LAZY LOADING] ✅ Widget initialized: ${widgetType}`);
      
    } catch (error) {
      console.error(`[LAZY LOADING] Failed to initialize widget ${widgetType}:`, error);
    }
  }, [view, containersReady, initializedWidgets, onLayerSelect]);

  // Main Initialization Effect - now only sets up basic structure
  useEffect(() => {
    if (!view || !containersReady) {
        return;
      }

    if (isInitialized.current) {
          return;
        }

    // LAZY LOADING: No widget initialization here - only basic setup
    console.log('[LAZY LOADING] MapWidgets initialization - widgets will be created on-demand');
    
    view.when(async () => {
      // Just mark as initialized - no widget creation
      isInitialized.current = true;
      console.log('[LAZY LOADING] MapWidgets ready for on-demand widget creation');
    }).catch(error => {
      if (error.name !== 'AbortError') {
        console.error('[LAZY LOADING] Error waiting for view ready:', error);
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
  }, [view, containersReady]);

  // LAZY LOADING: Trigger widget initialization when activeWidget changes
  useEffect(() => {
    if (activeWidget && view && containersReady) {
      initializeWidget(activeWidget);
    }
  }, [activeWidget, view, containersReady, initializeWidget]);

  // Container creation effect
  useEffect(() => {
    if (!view || containersReady) return; // Only run once when view is ready and containers aren't

    const allowedWidgets = visibleWidgets || ['search', 'layerList', 'bookmarks', 'print', 'basemapGallery'];
    const createdContainers = new Map<string, HTMLDivElement>();

    allowedWidgets.forEach(widgetId => {
      // Determine color - default or map based on ID
      let color = '#ccc'; // Default color
      if (widgetId === 'search') color = '#4285f4';
      else if (widgetId === 'layerList') color = '#33a852';
      else if (widgetId === 'print') color = '#3269a8';
      else if (widgetId === 'basemapGallery') color = '#666666'; // Dark gray for basemap
      // Add other widget colors if needed
      
      const container = createWidgetContainer(widgetId, color);
      createdContainers.set(widgetId, container);
    });

    containersRef.current = createdContainers; // Store the created containers
    setContainersReady(true); // Signal that containers are ready

    // No cleanup needed here as containers are managed by ArcGIS UI later

  }, [view, containersReady, visibleWidgets, createWidgetContainer]); // Dependencies

  // Render logic - LayerController removed as it's handled by MapContainer
  const layerControllerPortal = useMemo(() => {
    // LayerController is now handled by MapContainer to prevent duplicate initialization
    return null;
  }, []);

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
        
        {visibleWidgets?.includes('basemapGallery') && (
          <button
            onClick={() => onToggleWidget('basemapGallery')}
            className={`widget-icon ${activeWidget === 'basemapGallery' ? 'active' : ''}`}
            title="Basemaps"
          >
            <MapIcon width="16" height="16" />
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
