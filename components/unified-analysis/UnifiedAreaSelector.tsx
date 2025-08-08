/* eslint-disable @typescript-eslint/no-unused-vars */
// UnifiedAreaSelector.tsx
// Combines all area selection methods into a single unified interface
// Uses existing components: DrawingTools, useDrawing hook, and LocationSearch

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin, 
  Pencil, 
  Search,
  Car,
  FootprintsIcon as Walk,
  CircleIcon,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

// Import existing components
import DrawingTools from '@/components/tabs/DrawingTools';
import { LocationSearch, LocationResult } from '@/components/location-search';
import { useDrawing } from '@/hooks/useDrawing';

// Import ArcGIS modules for service area generation
import Circle from "@arcgis/core/geometry/Circle";
import Graphic from "@arcgis/core/Graphic";
import * as serviceArea from "@arcgis/core/rest/serviceArea";
import ServiceAreaParameters from "@arcgis/core/rest/support/ServiceAreaParameters";
import FeatureSet from "@arcgis/core/rest/support/FeatureSet";
import Point from "@arcgis/core/geometry/Point";

export interface AreaSelection {
  geometry: __esri.Geometry;
  method: 'draw' | 'search' | 'service-area';
  displayName: string;
  metadata: {
    area?: number;
    centroid?: __esri.Point;
    source: string;
    bufferType?: 'radius' | 'drivetime' | 'walktime';
    bufferValue?: number;
    bufferUnit?: string;
  };
}

interface UnifiedAreaSelectorProps {
  view: __esri.MapView;
  onAreaSelected: (area: AreaSelection) => void;
  onSelectionStarted?: () => void;
  onSelectionCanceled?: () => void;
  defaultMethod?: 'draw' | 'search' | 'buffer';
  allowMultipleSelection?: boolean;
}

export default function UnifiedAreaSelector({
  view,
  onAreaSelected,
  onSelectionStarted,
  onSelectionCanceled,
  defaultMethod = 'draw',
  allowMultipleSelection = false
}: UnifiedAreaSelectorProps) {
  // State management
  const [selectionMethod, setSelectionMethod] = useState<'draw' | 'search' | 'buffer'>(defaultMethod);
  const [drawMode, setDrawMode] = useState<'point' | 'polygon' | 'click' | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<AreaSelection[]>([]);
  
  // Buffer-specific state
  const [bufferType, setBufferType] = useState<'radius' | 'drivetime' | 'walktime'>('radius');
  const [bufferValue, setBufferValue] = useState('1');
  const [bufferUnit, setBufferUnit] = useState<'miles' | 'kilometers' | 'minutes'>('miles');
  const [bufferCenter, setBufferCenter] = useState<__esri.Point | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Use existing drawing hook
  const {
    startDrawing,
    cancelDrawing,
    completeSelection,
    hasSelectedFeatures,
    selectedFeatureCount
  } = useDrawing({
    view,
    onGeometryCreated: (geometry) => {
      handleGeometryCreated(geometry, 'draw');
    },
    onDrawingStarted: () => {
      setIsSelecting(true);
      onSelectionStarted?.();
    },
    onDrawingCanceled: () => {
      setIsSelecting(false);
      onSelectionCanceled?.();
    }
  });

  // Handle geometry creation from any source
  const handleGeometryCreated = useCallback((geometry: __esri.Geometry, source: 'draw' | 'search' | 'service-area') => {
    // If it's a point from drawing, also set it as buffer center
    if (source === 'draw' && geometry.type === 'point') {
      setBufferCenter(geometry as __esri.Point);
    }

    const area: AreaSelection = {
      geometry,
      method: source,
      displayName: getDisplayName(geometry, source),
      metadata: {
        area: calculateArea(geometry),
        centroid: getCentroid(geometry),
        source,
        bufferType: source === 'service-area' ? bufferType : undefined,
        bufferValue: source === 'service-area' ? parseFloat(bufferValue) : undefined,
        bufferUnit: source === 'service-area' ? bufferUnit : undefined
      }
    };

    if (allowMultipleSelection) {
      setSelectedAreas(prev => [...prev, area]);
    } else {
      setSelectedAreas([area]);
    }

    onAreaSelected(area);
    setIsSelecting(false);
  }, [bufferType, bufferValue, bufferUnit, allowMultipleSelection, onAreaSelected]);

  // Handle drawing button click
  const handleDrawButtonClick = useCallback((mode: 'point' | 'polygon' | 'click') => {
    setDrawMode(mode);
    setIsSelecting(true);
    startDrawing(mode);
  }, [startDrawing]);

  // Handle map click for buffer center
  const handleMapClickForBuffer = useCallback((event: any) => {
    if (selectionMethod === 'buffer' && !bufferCenter && event.mapPoint) {
      setBufferCenter(event.mapPoint);
    }
  }, [selectionMethod, bufferCenter]);

  // Set up map click handler for buffer center selection
  useEffect(() => {
    if (view && selectionMethod === 'buffer' && !bufferCenter) {
      const handle = view.on('click', handleMapClickForBuffer);
      return () => handle.remove();
    }
  }, [view, selectionMethod, bufferCenter, handleMapClickForBuffer]);

  // Handle location search selection
  const handleLocationSelected = useCallback(async (location: LocationResult) => {
    try {
      setIsSelecting(true);
      
      // Create point or polygon based on location type
      let geometry: __esri.Geometry;
      
      if (location.bbox) {
        // Create polygon from bounding box
        const [minX, minY, maxX, maxY] = location.bbox;
        geometry = {
          type: 'polygon',
          rings: [[
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
            [minX, minY]
          ]],
          spatialReference: { wkid: 4326 }
        } as __esri.Polygon;
      } else {
        // Create point
        geometry = new Point({
          longitude: location.longitude,
          latitude: location.latitude,
          spatialReference: { wkid: 4326 }
        });
        // Set buffer center for point locations and add visual indicator
        setBufferCenter(geometry as __esri.Point);
        
        // Add a graphic to show the point on the map
        if (view) {
          const pointGraphic = new Graphic({
            geometry,
            symbol: {
              type: "simple-marker",
              color: "red",
              outline: {
                color: "white",
                width: 2
              },
              size: "12px"
            }
          });
          view.graphics.add(pointGraphic);
        }
      }

      // Zoom to location
      if (view) {
        await view.goTo({
          target: geometry,
          zoom: location.type === 'address' ? 16 : 
                location.type === 'city' ? 12 : 
                location.type === 'region' ? 8 : 6
        });
      }

      handleGeometryCreated(geometry, 'search');
    } catch (err) {
      console.error('Error handling location selection:', err);
      setError('Failed to process location');
    } finally {
      setIsSelecting(false);
    }
  }, [view, handleGeometryCreated]);

  // Generate service area (drive time or walk time)
  const generateServiceArea = useCallback(async () => {
    if (!bufferCenter || !view) return;

    try {
      setIsSelecting(true);
      setError(null);

      if (bufferType === 'radius') {
        // Create simple radius buffer
        const radiusInMeters = bufferUnit === 'miles' 
          ? parseFloat(bufferValue) * 1609.34
          : parseFloat(bufferValue) * 1000;

        const circle = new Circle({
          center: bufferCenter,
          radius: radiusInMeters,
          radiusUnit: "meters",
          spatialReference: view.spatialReference
        });

        handleGeometryCreated(circle, 'service-area');
      } else {
        // Generate drive time or walk time service area
        const serviceAreaUrl = "https://route-api.arcgis.com/arcgis/rest/services/World/ServiceAreas/NAServer/ServiceArea_World/solveServiceArea";
        
        const featureSet = new FeatureSet({
          features: [new Graphic({ geometry: bufferCenter })]
        });

        const timeInMinutes = parseFloat(bufferValue);

        const params = new ServiceAreaParameters({
          facilities: featureSet,
          defaultBreaks: [timeInMinutes],
          travelDirection: "from-facility",
          outSpatialReference: view.spatialReference,
          trimOuterPolygon: true
        });

        const response = await serviceArea.solve(serviceAreaUrl, params);
        
        if (response.serviceAreaPolygons?.features && response.serviceAreaPolygons.features.length > 0) {
          const serviceAreaGeometry = response.serviceAreaPolygons.features[0].geometry;
          handleGeometryCreated(serviceAreaGeometry, 'service-area');
        } else {
          throw new Error('No service area generated');
        }
      }
    } catch (err) {
      console.error('Error generating service area:', err);
      setError('Failed to generate service area. Please try a radius buffer instead.');
    } finally {
      setIsSelecting(false);
    }
  }, [bufferCenter, bufferType, bufferValue, bufferUnit, view, handleGeometryCreated]);

  // Helper functions
  const getDisplayName = (geometry: __esri.Geometry, source: string): string => {
    if (source === 'search') return 'Search Area';
    if (source === 'service-area') {
      if (bufferType === 'radius') return `${bufferValue} ${bufferUnit} radius`;
      if (bufferType === 'drivetime') return `${bufferValue} minute drive`;
      return `${bufferValue} minute walk`;
    }
    return geometry.type === 'point' ? 'Selected Point' : 'Drawn Area';
  };

  const calculateArea = (_geometry: __esri.Geometry): number | undefined => {
    // This would use geometryEngine to calculate actual area
    // Placeholder for now
    return undefined;
  };

  const getCentroid = (_geometry: __esri.Geometry): __esri.Point | undefined => {
    // This would use geometryEngine to get centroid
    // Placeholder for now
    return undefined;
  };

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedAreas([]);
    cancelDrawing();
    setBufferCenter(null);
    setError(null);
    
    // Clear graphics from map view
    if (view?.graphics) {
      view.graphics.removeAll();
    }
  }, [cancelDrawing, view]);

  // Clear current drawing/selection only
  const clearCurrentDrawing = useCallback(() => {
    cancelDrawing();
    setDrawMode(null);
    setError(null);
    
    // Clear graphics from map view
    if (view?.graphics) {
      view.graphics.removeAll();
    }
  }, [cancelDrawing, view]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Select Area for Analysis</span>
          {selectedAreas.length > 0 && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={clearSelection}
            >
              Clear Selection
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={selectionMethod} onValueChange={(v) => setSelectionMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draw" className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Draw
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger 
              value="buffer" 
              className="flex items-center gap-2" 
              disabled={selectedAreas.length === 0 && !bufferCenter}
            >
              <CircleIcon className="h-4 w-4" />
              Buffer {bufferCenter && <span className="text-xs">(Point Set)</span>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-4">
            <div className="space-y-4">
              <DrawingTools
                drawMode={drawMode}
                handleDrawButtonClick={handleDrawButtonClick}
                isDrawing={isSelecting}
                isSelectionMode={drawMode === 'click'}
                onSelectionComplete={completeSelection}
                hasSelectedFeature={hasSelectedFeatures}
                selectedCount={selectedFeatureCount}
                shouldShowNext={false}
              />
              {(isSelecting || drawMode) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCurrentDrawing}
                  className="w-full"
                >
                  Clear Drawing
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <LocationSearch
              onLocationSelected={handleLocationSelected}
              placeholder="Enter address, city, or place..."
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Search for a location to analyze. Cities and regions will create area boundaries. Point locations will enable buffer options.
            </p>
          </TabsContent>

          <TabsContent value="buffer" className="space-y-4">
            {selectedAreas.length === 0 && !bufferCenter ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please first select an area using Draw or Search, or click on the map to set a buffer center point.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>Buffer Type</Label>
                  <Select value={bufferType} onValueChange={(v: any) => setBufferType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radius">
                        <div className="flex items-center gap-2">
                          <CircleIcon className="h-4 w-4" />
                          Radius
                        </div>
                      </SelectItem>
                      <SelectItem value="drivetime">
                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4" />
                          Drive Time
                        </div>
                      </SelectItem>
                      <SelectItem value="walktime">
                        <div className="flex items-center gap-2">
                          <Walk className="h-4 w-4" />
                          Walk Time
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Value</Label>
                    <Input
                      type="number"
                      value={bufferValue}
                      onChange={(e) => setBufferValue(e.target.value)}
                      min="0.1"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select 
                      value={bufferUnit} 
                      onValueChange={(v: any) => setBufferUnit(v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bufferType === 'radius' ? (
                          <>
                            <SelectItem value="miles">Miles</SelectItem>
                            <SelectItem value="kilometers">Kilometers</SelectItem>
                          </>
                        ) : (
                          <SelectItem value="minutes">Minutes</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {!bufferCenter ? (
                  <Alert>
                    <MapPin className="h-4 w-4" />
                    <AlertDescription>
                      Click on the map to set the buffer center point, or use Draw/Search to create a point first.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Buffer center point is set. Generate your buffer area below.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      onClick={generateServiceArea} 
                      className="w-full"
                      disabled={isSelecting}
                    >
                      {isSelecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Generate {bufferType === 'radius' ? 'Buffer' : 'Service Area'}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedAreas.length > 0 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-medium">
              {allowMultipleSelection 
                ? `${selectedAreas.length} areas selected`
                : `Area selected: ${selectedAreas[0].displayName}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}