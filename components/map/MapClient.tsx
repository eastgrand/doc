// MapClient.tsx
'use client';

import React, { useEffect, useRef, memo, useCallback } from 'react';
import { loadArcGISModules } from '@/lib/arcgis-imports';
import { LegendType } from '@/types/legend';
import { LegendItem } from '@/components/MapLegend';
import { MAP_CONSTRAINTS, DATA_EXTENT, applyMapConstraints } from '@/config/mapConstraints';
import { useTheme } from '@/components/theme/ThemeProvider';

// Legend props interface

interface MapLegendProps {
  title?: string;
  items?: LegendItem[];
  visible?: boolean;
  type?: LegendType;
  ternaryData?: Array<{
    values: [number, number, number];
    label?: string;
    color?: string;
    featureId?: string;
  }>;
  labels?: [string, string, string];
  components?: Array<{
    title: string;
    type: 'size' | 'color';
    items: LegendItem[];
  }>;
  onFeatureClick?: (featureId: string) => void;
  onFeatureHover?: (featureId: string | null) => void;
}

interface MapClientProps {
  onMapLoad: (view: __esri.MapView) => void;
  onError: (error: Error) => void;
  sidebarWidth: number;
  showLabels?: boolean;
  legend?: MapLegendProps;
}

// Simple Legend component
const MapLegend: React.FC<MapLegendProps> = ({ 
  title, 
  items, 
  visible, 
  type = 'standard', 
  ternaryData, 
  labels,
  components,
  onFeatureClick, 
  onFeatureHover 
}) => {
  const isVisible = visible !== false; // default to true when undefined
  
  // Debug logging for legend items
  console.log('[MapClient MapLegend] Rendering legend:', {
    title,
    type,
    visible,
    itemCount: items?.length || 0,
    sampleItems: items?.slice(0, 8)?.map(item => ({
      label: item.label,
      color: item.color,
      size: item.size,
      shape: item.shape
    }))
  });
  
  // Additional debug: check if size property exists
  if (items && items.length > 0) {
    console.log('[MapClient MapLegend] Size values check:', items.map((item, index) => ({
      index,
      label: item.label?.substring(0, 20) + '...',
      size: item.size,
      hasSize: item.size !== undefined,
      actualWidth: `${item.size || 16}px`
    })));
  }

  if (!isVisible) {
    return null;
  }

  // Handle ternary plot legend
  if (type === 'ternary-plot' && ternaryData && labels) {
    // Import TernaryPlot dynamically to avoid SSR issues
    const [TernaryPlot, setTernaryPlot] = React.useState<React.ComponentType<any> | null>(null);
    
    React.useEffect(() => {
      import('@/components/TernaryPlot').then((module) => {
        setTernaryPlot(() => module.default);
      });
    }, []);

    if (!TernaryPlot) return null;

    return (
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '84px',
          zIndex: 15000,
        }}
      >
        <TernaryPlot
          data={ternaryData}
          labels={labels}
          title={title}
          width={220}
          height={220}
          onDotClick={onFeatureClick}
          onDotHover={onFeatureHover}
          collapsible={true}
          defaultCollapsed={false}
        />
      </div>
    );
  }

  // Handle dual-variable legend
  if (type === 'dual-variable' && components && components.length > 0) {
    return (
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '84px',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          zIndex: 15000,
          maxWidth: '300px',
          maxHeight: '400px',
          overflow: 'auto',
        }}
      >
        {title && (
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textAlign: 'center', color: '#333' }}>
            {title}
          </h3>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {components.map((component, componentIndex) => (
            <div key={componentIndex}>
              <h4 style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: '#666', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}>
                {component.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {component.items.map((item, itemIndex) => (
                  <div key={itemIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {component.type === 'size' ? (
                      // Size legend items - show varying circle sizes
                      <div 
                        style={{
                          width: `${item.size || 16}px`,
                          height: `${item.size || 16}px`,
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          flexShrink: 0
                        }}
                      />
                    ) : (
                      // Color legend items - show color swatches
                      <div 
                        style={{
                          width: '16px',
                          height: '16px',
                          backgroundColor: item.color,
                          borderRadius: item.shape === 'circle' ? '50%' : '2px',
                          border: item.outlineColor ? `1px solid ${item.outlineColor}` : '1px solid #e5e7eb',
                          flexShrink: 0
                        }}
                      />
                    )}
                    <span style={{ fontSize: '11px', color: '#555', lineHeight: '1.2' }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle standard legend
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div 
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '84px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 15000,
        maxWidth: '280px',
        maxHeight: '400px',
        overflow: 'auto',
        display: isVisible ? 'block' : 'none',
        visibility: isVisible ? 'visible' : 'hidden',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out'
      }}
      className="custom-legend"
    >
      {title && (
        <div 
          style={{ 
            fontWeight: '600', 
            marginBottom: '8px', 
            fontSize: '13px',
            color: '#333'
          }}
        >
          {title}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, index) => {
          // Handle header items
          if (item.isHeader) {
            return (
              <div 
                key={index} 
                style={{ 
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: '#333',
                  marginTop: index > 0 ? '12px' : '4px',
                  marginBottom: '4px',
                  textAlign: 'center',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '2px'
                }}
              >
                {item.label}
              </div>
            );
          }
          
          // Handle normal legend items
          return (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div 
                style={{ 
                  width: `${item.size || 16}px`, 
                  height: `${item.size || 16}px`, 
                  backgroundColor: item.color,
                  border: item.outlineColor ? `1px solid ${item.outlineColor}` : 'none',
                  borderRadius: item.shape === 'circle' ? '50%' : '2px',
                  flexShrink: 0,
                  minWidth: `${item.size || 16}px`,
                  minHeight: `${item.size || 16}px`,
                  maxWidth: `${item.size || 16}px`,
                  maxHeight: `${item.size || 16}px`,
                  boxSizing: 'border-box'
                }} 
              />
              <div 
                style={{ 
                  fontSize: '12px',
                  color: '#666',
                  lineHeight: '1.2'
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MapClient = memo(({ 
  onMapLoad, 
  onError, 
  sidebarWidth, 
  showLabels = false,
  legend
}: MapClientProps) => {
  // Use light theme as default fallback
  let theme = 'light';
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
  } catch (error) {
    // Silently use default theme if context not available
  }
  
  const mapRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<__esri.MapView | null>(null);
  const isInitialized = useRef(false);
  const highlightRef = useRef<__esri.Handle | null>(null);

  // Feature interaction handlers
  const handleFeatureClick = useCallback(async (featureId: string) => {
    // Temporarily disabled to focus on visual issues
    return;
  }, []);

  const handleFeatureHover = useCallback(async (featureId: string | null) => {
    if (!viewRef.current) return;
    
    if (featureId) {
      // Could add subtle highlight for hover if desired
    } else {
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) return;

    const initializeMap = async () => {
      try {
        console.log('[MapClient] Starting map initialization...');

        const {
          Map,
          MapView,
          VectorTileLayer,
          Basemap,
          esriConfig,
          Color,
          Zoom
        } = await loadArcGISModules();

        console.log('[MapClient] ArcGIS modules loaded successfully');

        // Set API key
        esriConfig.apiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY || '';
        console.log('[MapClient] API key set:', !!esriConfig.apiKey);

        // Create map with theme-appropriate basemap
        const basemapId = theme === 'light' ? "gray-vector" : "dark-gray-vector";
        console.log(`[MapClient] Creating map with ${theme} mode basemap: ${basemapId}`);
        const map = new Map({
          basemap: basemapId
        });
        console.log('[MapClient] Map created successfully with theme-appropriate basemap');

        // Create view
        if (!mapRef.current) {
          console.error('[MapClient] Map container ref is null');
          return;
        }
        
        console.log('[MapClient] Creating MapView...');
        const view = new MapView({
          container: mapRef.current,
          map: map,
          zoom: 10,
          center: [-81.6557, 30.3322], // Jacksonville, FL coordinates
          ui: {
            components: []
          }
        });

        // Apply dynamic map constraints after view is ready
        // This prevents panning outside the project area while preserving zoom functionality
        view.when(() => {
          console.log('[MapClient] View is ready, applying dynamic map constraints...', {
            constraintsExtent: MAP_CONSTRAINTS.geometry,
            dataExtent: DATA_EXTENT,
            rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
          });
          
          // Add a small delay to ensure basemap is loaded
          setTimeout(() => {
            try {
              console.log('[MapClient] Applying feature service extent constraints with spatial reference...');
              applyMapConstraints(view);
              console.log('[MapClient] Map constraints applied successfully');
            } catch (error) {
              console.error('[MapClient] Error applying constraints:', error);
            }
          }, 1000);
        }).catch(error => {
          console.error('[MapClient] MapView failed to initialize:', error);
        });

        console.log('[MapClient] MapView created, waiting for it to be ready...');

        // Set highlight options (using newer API)
        view.when(() => {
          view.highlightOptions = {
            color: new Color([51, 168, 82, 0.3]),
            fillOpacity: 0.3,
            haloColor: new Color([51, 168, 82, 1]),
            haloOpacity: 1
          };
        });

        // Wait for view to be ready
        await view.when();
        console.log('[MapClient] MapView is ready');

        // Store map view reference globally for debugging
        try {
          const { storeMapViewReference } = await import('../LayerController/enhancedLayerCreation');
          storeMapViewReference(view);
        } catch (error) {
          // Could not store map view reference - ignore in production
        }

        viewRef.current = view;
        isInitialized.current = true;
        console.log('[MapClient] Calling onMapLoad...');
        onMapLoad(view);
        console.log('[MapClient] Map initialization complete');

      } catch (error) {
        console.error('[MapClient] Error initializing map:', error);
        onError(error instanceof Error ? error : new Error('Failed to initialize map'));
      }
    };

    initializeMap();

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        isInitialized.current = false;
      }
    };
  }, [onMapLoad, onError, theme]);

  // Handle theme changes for existing map
  useEffect(() => {
    if (!viewRef.current || !isInitialized.current) return;

    const view = viewRef.current;
    const basemapId = theme === 'light' ? "gray-vector" : "dark-gray-vector";
    
    console.log(`[MapClient] Theme changed to ${theme}, updating basemap to: ${basemapId}`);
    
    // Update basemap when theme changes
    view.map.basemap = basemapId;
    
  }, [theme]);

  // Handle sidebar width changes
  useEffect(() => {
    if (!viewRef.current) return;

    const updatePadding = () => {
      if (viewRef.current && !viewRef.current.destroyed) {
        viewRef.current.padding = {
          ...viewRef.current.padding,
          right: sidebarWidth
        };
      }
    };

    updatePadding();
  }, [sidebarWidth]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view?.map?.basemap) return;
    
    const basemap = view.map.basemap as unknown as __esri.Basemap;
    if (!basemap.referenceLayers) return;

    const referenceLayer = basemap.referenceLayers.getItemAt(0);
    if (referenceLayer && referenceLayer.type === "vector-tile") {
      referenceLayer.visible = !showLabels;
    }
  }, [showLabels]);

  // Add useEffect to log legend props when they change
  useEffect(() => {
   /* console.log('MapClient Legend Props:', { 
      title: legend?.title, 
      itemsCount: legend?.items?.length || 0,
      visible: legend?.visible,
      hasLegend: !!legend
    });*/
  }, [legend]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      <MapLegend 
        {...legend} 
        onFeatureClick={handleFeatureClick}
        onFeatureHover={handleFeatureHover}
      />
    </div>
  );
});

MapClient.displayName = 'MapClient';

export default MapClient;