/* eslint-disable @typescript-eslint/no-unused-vars */
// UnifiedAnalysisWorkflow.tsx
// Main orchestrator component that unifies the entire analysis workflow
// Combines area selection, analysis type selection, and results viewing

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  ChevronRight,
  MapPin,
  FileText,
  BarChart3,
  BarChart,
  Download,
  MessageSquare,
  MessageCircle,
  Table,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Car,
  FootprintsIcon as Walk,
  RotateCcw,
  Sparkles,
  UserCog
} from 'lucide-react';
import { PiStrategy, PiLightning, PiLightbulb, PiWrench, PiHeart } from 'react-icons/pi';

// Import unified components
import UnifiedAreaSelector, { AreaSelection } from './UnifiedAreaSelector';
import { UnifiedAnalysisWrapper, UnifiedAnalysisRequest, UnifiedAnalysisResponse } from './UnifiedAnalysisWrapper';
import UnifiedAnalysisChat from './UnifiedAnalysisChat';
import UnifiedDataTable from './UnifiedDataTable';
import UnifiedInsightsChart from './UnifiedInsightsChart';

// Import existing components for analysis
import { QueryInterface } from '@/components/QueryInterface';
import EndpointScoreInfographic from '@/components/EndpointScoreInfographic';

// Import infographics components
import ReportSelectionDialog from '@/components/ReportSelectionDialog';
import Infographics from '@/components/Infographics';

// Import dialog and predefined queries
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import QueryDialog from '@/components/chat/QueryDialog';
import { ANALYSIS_CATEGORIES, DISABLED_ANALYSIS_CATEGORIES } from '@/components/chat/chat-constants';
import { personaMetadata } from '@/app/api/claude/prompts';

// Clustering Components
import { ClusterConfigPanel } from '@/components/clustering/ClusterConfigPanel';
import { ClusterConfig, DEFAULT_CLUSTER_CONFIG } from '@/lib/clustering/types';

// Import chat interface for contextual analysis
import { useChatContext } from '@/components/chat-context-provider';

// Import ArcGIS geometry engine for buffering
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Circle from "@arcgis/core/geometry/Circle";
import Graphic from "@arcgis/core/Graphic";
import { SimpleFillSymbol, SimpleLineSymbol } from '@arcgis/core/symbols';
import Polygon from '@arcgis/core/geometry/Polygon';
import { SpatialFilterService } from '@/lib/spatial/SpatialFilterService';

// Persona icons map
const PERSONA_ICON_MAP: Record<string, React.ComponentType<any>> = {
  'strategist': PiStrategy,
  'tactician': PiLightning,
  'creative': PiLightbulb,
  'product-specialist': PiWrench,
  'customer-advocate': PiHeart
};

export interface UnifiedAnalysisWorkflowProps {
  view: __esri.MapView;
  onAnalysisComplete?: (result: UnifiedAnalysisResponse) => void;
  onExport?: (format: string, data: unknown) => void;
  enableChat?: boolean;
  defaultAnalysisType?: 'query' | 'infographic' | 'comprehensive';
  setFormattedLegendData?: React.Dispatch<React.SetStateAction<any>>;
}

type WorkflowStep = 'area' | 'buffer' | 'analysis' | 'results';

interface WorkflowState {
  currentStep: WorkflowStep;
  areaSelection?: AreaSelection;
  analysisType?: 'query' | 'infographic' | 'comprehensive';
  analysisResult?: UnifiedAnalysisResponse;
  isProcessing: boolean;
  error?: string;
}

export default function UnifiedAnalysisWorkflow({
  view,
  onAnalysisComplete,
  onExport,
  enableChat = true,
  defaultAnalysisType = 'query',
  setFormattedLegendData
}: UnifiedAnalysisWorkflowProps) {
  // State management
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    currentStep: 'area',
    isProcessing: false
  });

  const [selectedQuery, setSelectedQuery] = useState<string>('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');
  const [selectedInfographicType, setSelectedInfographicType] = useState<'strategic' | 'competitive' | 'demographic'>('strategic');
  
  // Buffer configuration
  const [bufferDistance, setBufferDistance] = useState<string>('1');
  const [bufferUnit, setBufferUnit] = useState<'miles' | 'kilometers' | 'minutes'>('miles');
  const [bufferType, setBufferType] = useState<'radius' | 'drivetime' | 'walktime'>('radius');
  
  // Reset counter to force component remount
  const [resetCounter, setResetCounter] = useState(0);
  
  // Abort controller for cancelling ongoing analysis
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Stop analysis function
  const stopAnalysis = useCallback(() => {
    console.log('[UnifiedWorkflow] Stopping analysis...');
    
    // Abort any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    // Reset processing state
    setWorkflowState(prev => ({
      ...prev,
      isProcessing: false,
      error: 'Analysis cancelled by user'
    }));
  }, []);
  
  // QuickstartIQ dialog state
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  
  // Persona state
  const [selectedPersona, setSelectedPersona] = useState<string>('strategist');
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  
  // Results tab state
  const [activeResultsTab, setActiveResultsTab] = useState<string>('analysis');
  
  // Chat state to persist across tab switches
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [hasGeneratedNarrative, setHasGeneratedNarrative] = useState(false);
  
  // Clustering configuration state
  const [clusterConfig, setClusterConfig] = useState<ClusterConfig>({
    ...DEFAULT_CLUSTER_CONFIG,
    minScorePercentile: DEFAULT_CLUSTER_CONFIG.minScorePercentile ?? 70
  });
  const [clusterDialogOpen, setClusterDialogOpen] = useState(false);

  // Initialize analysis wrapper
  const [analysisWrapper] = useState(() => new UnifiedAnalysisWrapper());

  // Chat context for contextual analysis
  const chatContext = useChatContext();

  // Infographics dialog state (independent of workflow)
  const [infographicsDialog, setInfographicsDialog] = useState({
    open: false,
    geometry: null as __esri.Geometry | null,
    selectedReport: null as string | null,
    showInfographics: false
  });

  // State for available reports
  const [infographicsReports, setInfographicsReports] = useState<any[]>([]);

  // Step navigation
  const goToStep = useCallback((step: WorkflowStep) => {
    setWorkflowState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Add event listener for popup infographics
  useEffect(() => {
    const handleOpenInfographics = (event: CustomEvent) => {
      console.log('[UnifiedWorkflow] Infographics popup event received', event.detail);
      
      // Open report selection dialog immediately with popup geometry
      setInfographicsDialog({
        open: true,
        geometry: event.detail?.geometry || null,
        selectedReport: null,
        showInfographics: false
      });
    };

    document.addEventListener('openInfographics', handleOpenInfographics as EventListener);
    return () => {
      document.removeEventListener('openInfographics', handleOpenInfographics as EventListener);
    };
  }, []);

  // Load infographics reports on component mount (same logic as InfographicsTab)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log('[UnifiedWorkflow] Loading infographics reports...');
        
        const reportApiKey = process.env.NEXT_PUBLIC_ARCGIS_API_KEY_2;
        const token = reportApiKey || 'AAPTxy8BH1VEsoebNVZXo8HurEs9TD-3BH9IvorrjVWQR4uGhbHZOyV9S-QJcwJfNyPyN6IDTc6dX1pscXuVgb4-GEQ70Mrk6FUuIcuO2Si45rlSIepAJkP92iyuw5nBPxpTjI0ga_Aau9Cr6xaQ2DJnJfzaCkTor0cB9UU6pcNyFqxJlYt_26boxHYqnnu7vWlqt7SVFcWKmYq6kh8anIAmEi0hXY1ThVhKIupAS_Mure0.AT1_VqzOv0Y5';
        
        const endpointsToTry = [
          {
            name: 'Report Template Search',
            url: `https://www.arcgis.com/sharing/rest/search?q=owner:Synapse54 AND type:"Report Template"&f=pjson&token=${token}&num=100`
          }
        ];

        let allItems: any[] = [];
        
        for (const endpoint of endpointsToTry) {
          try {
            const response = await fetch(endpoint.url);
            if (!response.ok) continue;
            
            const data = await response.json();
            let items: any[] = [];
            
            if (data.results && Array.isArray(data.results)) {
              items = data.results;
            } else if (data.items && Array.isArray(data.items)) {
              items = data.items;
            }
            
            allItems = allItems.concat(items);
            break; // Use first successful endpoint
          } catch (error) {
            console.warn(`[UnifiedWorkflow] ${endpoint.name} failed:`, error);
          }
        }

        // Filter and format reports (same logic as InfographicsTab)
        const exclusionList = [
          '2023 Community Portrait', 'Community Profile 2023', 'Executive Summary 2023',
          'Community Health', 'Health Profile', 'Market Potential for Restaurant',
          'Business Summary', 'Site Analysis', 'Shopping Centers Summary',
          'Demographic and Income Comparison', 'Locator'
        ];

        const finalReports = allItems
          .filter(item => !exclusionList.some(excluded => item.title?.includes(excluded)))
          .map(item => ({
            id: item.id,
            title: item.title || 'Untitled Report',
            description: item.snippet || item.description || '',
            thumbnail: item.thumbnail || '',
            categories: ['Summary Reports'] // Default category
          }));

        console.log('[UnifiedWorkflow] Loaded', finalReports.length, 'infographics reports');
        setInfographicsReports(finalReports);
      } catch (error) {
        console.error('[UnifiedWorkflow] Failed to load infographics reports:', error);
        setInfographicsReports([]);
      }
    };
    
    fetchReports();
  }, []);

  // Handle area selection
  const handleAreaSelected = useCallback((area: AreaSelection) => {
    if (area.geometry.type === 'point') {
      const point = area.geometry as __esri.Point;
      console.log('[UnifiedWorkflow] Point selected at coordinates:', 
        `X: ${point.x}, Y: ${point.y}, WKID: ${point.spatialReference?.wkid}`);
      console.log('[UnifiedWorkflow] Point extent:', point.extent ? 
        `xmin: ${point.extent.xmin}, ymin: ${point.extent.ymin}, xmax: ${point.extent.xmax}, ymax: ${point.extent.ymax}` : 'null');
    } else {
      console.log('[UnifiedWorkflow] Non-point geometry selected:', area.geometry.type);
    }
    const isPoint = area.geometry.type === 'point';
    const isProjectArea = area.method === 'project-area';
    
    setWorkflowState(prev => ({
      ...prev,
      areaSelection: area,
      // Reset analysis type to query if project area is selected and user had infographic/comprehensive
      analysisType: isProjectArea && (prev.analysisType === 'infographic' || prev.analysisType === 'comprehensive') 
        ? undefined 
        : prev.analysisType,
      // Skip buffer step for polygons and project area, go directly to analysis
      currentStep: isPoint && !isProjectArea ? 'buffer' : 'analysis'
    }));
  }, []);

  // Handle analysis type selection and execution
  const handleAnalysisTypeSelected = useCallback(async (type: 'query' | 'infographic' | 'comprehensive') => {
    if (!workflowState.areaSelection) {
      setWorkflowState(prev => ({
        ...prev,
        error: 'Please select an area first'
      }));
      return;
    }

    setWorkflowState(prev => ({
      ...prev,
      analysisType: type,
      isProcessing: true,
      error: undefined
    }));

    // Create new abort controller for this analysis
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      // Dynamically get the reference layer ID
      const { SpatialFilterConfig } = await import('@/lib/spatial/SpatialFilterConfig');
      const dataSourceLayerId = SpatialFilterConfig.getReferenceLayerId();
      
      // Log the configuration for debugging
      console.log('[UnifiedWorkflow] Using spatial reference layer:', {
        layerId: dataSourceLayerId,
        geometryType: workflowState.areaSelection.geometry?.type,
        method: workflowState.areaSelection.method
      });
      
      // Skip spatial filtering for project-wide analysis
      const shouldApplySpatialFilter = workflowState.areaSelection.method !== 'project-area';
      
      console.log('[UnifiedAnalysisWorkflow] Analysis request preparation:', {
        shouldApplySpatialFilter,
        areaSelectionMethod: workflowState.areaSelection.method,
        hasGeometry: !!workflowState.areaSelection.geometry,
        geometryType: workflowState.areaSelection.geometry?.type
      });
      
      // Get spatial filter IDs if applying spatial filtering
      let spatialFilterIds: string[] | undefined;
      if (shouldApplySpatialFilter && workflowState.areaSelection.geometry) {
        try {
          console.log('[UnifiedAnalysisWorkflow] Querying area IDs for spatial filtering...');
          spatialFilterIds = await SpatialFilterService.queryAreaIdsByGeometry(
            workflowState.areaSelection.geometry,
            { spatialRelationship: 'intersects' }
          );
          console.log(`[UnifiedAnalysisWorkflow] Found ${spatialFilterIds.length} area IDs for spatial filter:`, spatialFilterIds.slice(0, 10));
        } catch (error) {
          console.warn('[UnifiedAnalysisWorkflow] Spatial ID lookup failed, proceeding without spatial filter:', error);
          spatialFilterIds = undefined;
        }
      }
      
      // Prepare analysis request with view and layer ID
      const request: UnifiedAnalysisRequest = {
        geometry: shouldApplySpatialFilter ? workflowState.areaSelection.geometry : undefined,
        geometryMethod: workflowState.areaSelection.method,
        analysisType: type,
        query: type === 'query' ? selectedQuery : undefined,
        endpoint: type === 'query' ? selectedEndpoint : undefined,
        infographicType: type === 'infographic' ? selectedInfographicType : undefined,
        includeChat: enableChat,
        clusterConfig: type === 'query' && clusterConfig.enabled ? clusterConfig : undefined,
        view: view,                          // NEW: Pass the map view
        dataSourceLayerId: dataSourceLayerId, // NEW: Pass the layer ID
        spatialFilterIds: spatialFilterIds,   // NEW: Pass the spatial filter IDs
        persona: selectedPersona              // Pass the selected persona
      };

      console.log('[UnifiedWorkflow] Starting analysis with spatial context:', {
        hasGeometry: !!request.geometry,
        geometryType: request.geometry?.type,
        hasView: !!request.view,
        layerId: request.dataSourceLayerId
      });

      // Execute analysis
      const result = await analysisWrapper.processUnifiedRequest(request);

      console.log('[UnifiedWorkflow] Analysis complete:', result);

      // Update state with results
      setWorkflowState(prev => ({
        ...prev,
        analysisResult: result,
        currentStep: 'results',
        isProcessing: false
      }));

      // Notify parent component
      onAnalysisComplete?.(result);

    } catch (error) {
      console.error('[UnifiedWorkflow] Analysis error:', error);
      
      // Check if the error is due to cancellation
      if (signal.aborted || (error as Error)?.name === 'AbortError') {
        console.log('[UnifiedWorkflow] Analysis was cancelled');
        setWorkflowState(prev => ({
          ...prev,
          error: 'Analysis cancelled',
          isProcessing: false
        }));
      } else {
        setWorkflowState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Analysis failed',
          isProcessing: false
        }));
      }
    } finally {
      // Clean up abort controller
      abortControllerRef.current = null;
    }
  }, [workflowState.areaSelection, selectedQuery, selectedEndpoint, selectedInfographicType, enableChat, analysisWrapper, onAnalysisComplete, clusterConfig]);

  // Handle export
  const handleExport = useCallback(async (format: string) => {
    if (!workflowState.analysisResult) return;

    try {
      const blob = await analysisWrapper.exportResults(format);
      onExport?.(format, blob);
    } catch (error) {
      console.error('[UnifiedWorkflow] Export error:', error);
    }
  }, [workflowState.analysisResult, analysisWrapper, onExport]);

  // Handle chart export
  const handleExportChart = useCallback(async () => {
    if (!workflowState.analysisResult?.analysisResult?.data?.featureImportance) {
      console.warn('[UnifiedWorkflow] No feature importance data to export');
      return;
    }

    try {
      // Export the feature importance chart as PNG or PDF
      await handleExport('chart');
    } catch (error) {
      console.error('[UnifiedWorkflow] Chart export error:', error);
    }
  }, [workflowState.analysisResult, handleExport]);

  // Handle ZIP code click to zoom to feature - using the exact same approach as CustomPopupManager
  const handleZipCodeClick = useCallback(async (zipCode: string) => {
    console.log(`[UnifiedAnalysisWorkflow] Zooming to ZIP code: ${zipCode}`);
    
    try {
      // Find the feature with this ZIP code in the current analysis results
      const analysisData = workflowState.analysisResult?.analysisResult?.data?.records;
      if (!analysisData) {
        console.warn('[UnifiedAnalysisWorkflow] No analysis data available for ZIP code zoom');
        return;
      }

      // Find the feature matching this ZIP code
      const targetFeature = analysisData.find((record: any) => 
        record.area_id === zipCode || 
        record.area_name?.includes(zipCode) ||
        record.properties?.geoid === zipCode ||
        record.properties?.area_id === zipCode ||
        record.properties?.area_name?.includes(zipCode)
      );

      if (!targetFeature) {
        console.warn(`[UnifiedAnalysisWorkflow] Feature not found for ZIP code: ${zipCode}`);
        return;
      }

      console.log(`[UnifiedAnalysisWorkflow] Found target feature for ${zipCode}:`, {
        hasGeometry: !!targetFeature.geometry,
        hasProperties: !!targetFeature.properties,
        geometryInProperties: !!targetFeature.properties?.geometry,
        featureKeys: Object.keys(targetFeature),
        propertiesKeys: targetFeature.properties ? Object.keys(targetFeature.properties) : null
      });

      // Get the geometry from the feature
      const geometry = targetFeature.geometry;
      if (!geometry) {
        console.warn(`[UnifiedAnalysisWorkflow] No geometry found for ZIP code: ${zipCode}`);
        return;
      }

      console.log(`[UnifiedAnalysisWorkflow] Geometry details:`, {
        type: geometry.type,
        hasExtent: !!geometry.extent,
        hasCoordinates: !!(geometry as any).coordinates,
        hasRings: !!(geometry as any).rings
      });

      // The geometry from the analysis data is a GeoJSON-style object with coordinates, not rings
      // Convert it to the proper format for ArcGIS view.goTo()
      if (geometry.type === 'point') {
        console.log(`[UnifiedAnalysisWorkflow] Zooming to point geometry`);
        await view.goTo({
          target: geometry,
          zoom: 15
        }, { duration: 1000 });
      } else if (geometry.type === 'Polygon' || geometry.type === 'polygon') {
        // Convert GeoJSON coordinates to ArcGIS rings format for autocast
        const coordinates = (geometry as any).coordinates;
        if (coordinates && coordinates.length > 0) {
          const autocastGeometry = {
            type: 'polygon',
            rings: coordinates, // GeoJSON coordinates are already in rings format
            spatialReference: geometry.spatialReference || view.spatialReference
          };
          
          console.log(`[UnifiedAnalysisWorkflow] Autocast geometry:`, {
            type: autocastGeometry.type,
            ringsCount: autocastGeometry.rings.length,
            firstRingLength: autocastGeometry.rings[0]?.length,
            spatialReference: autocastGeometry.spatialReference?.wkid,
            sampleCoords: autocastGeometry.rings[0]?.slice(0, 2)
          });
          
          console.log(`[UnifiedAnalysisWorkflow] View state before zoom:`, {
            center: view.center ? [view.center.longitude, view.center.latitude] : null,
            zoom: view.zoom,
            scale: view.scale
          });
          
          // Try calculating extent manually and using that instead
          let xmin = Infinity, ymin = Infinity, xmax = -Infinity, ymax = -Infinity;
          coordinates.forEach((ring: number[][]) => {
            ring.forEach((coord: number[]) => {
              xmin = Math.min(xmin, coord[0]);
              ymin = Math.min(ymin, coord[1]);
              xmax = Math.max(xmax, coord[0]);
              ymax = Math.max(ymax, coord[1]);
            });
          });
          
          const calculatedExtent = {
            xmin, ymin, xmax, ymax,
            spatialReference: { wkid: 4326 }
          };
          
          console.log(`[UnifiedAnalysisWorkflow] Calculated extent:`, calculatedExtent);
          console.log(`[UnifiedAnalysisWorkflow] Calling view.goTo() with calculated extent`);
          
          try {
            // Calculate center point of the feature
            const centerX = (xmin + xmax) / 2;
            const centerY = (ymin + ymax) / 2;
            
            // Calculate appropriate zoom level based on extent size
            const extentWidth = Math.abs(xmax - xmin);
            const extentHeight = Math.abs(ymax - ymin);
            const maxExtent = Math.max(extentWidth, extentHeight);
            
            // Determine zoom level based on extent size (rough estimation)
            let targetZoom = 10; // Default
            if (maxExtent < 0.01) targetZoom = 16;      // Very small area
            else if (maxExtent < 0.05) targetZoom = 14; // Small area  
            else if (maxExtent < 0.1) targetZoom = 12;  // Medium area
            else if (maxExtent < 0.2) targetZoom = 11;  // Large area
            
            console.log(`[UnifiedAnalysisWorkflow] Center: [${centerX}, ${centerY}], Target zoom: ${targetZoom}`);
            
            const goToResult = await view.goTo({
              center: [centerX, centerY],
              zoom: targetZoom
            }, { 
              duration: 1500,
              easing: 'ease-in-out'
            });
            console.log(`[UnifiedAnalysisWorkflow] view.goTo() completed successfully, result:`, goToResult);
            
            // Add flash effect after zoom completes
            setTimeout(() => {
              try {
                // Create a Polygon from the coordinates
                const flashPolygon = new Polygon({
                  rings: coordinates,
                  spatialReference: { wkid: 4326 }
                });
                
                const flashGraphic = new Graphic({
                  geometry: flashPolygon,
                  symbol: new SimpleFillSymbol({
                    color: [255, 255, 255, 0.8], // White with transparency
                    outline: {
                      color: [255, 255, 255, 1], // White outline
                      width: 4
                    }
                  })
                });
                
                view.graphics.add(flashGraphic);
                console.log(`[UnifiedAnalysisWorkflow] Flash effect added`);
                
                // Create pulsing effect
                let opacity = 0.8;
                let fadeOut = false;
                const pulseInterval = setInterval(() => {
                  if (!fadeOut) {
                    opacity -= 0.15;
                    if (opacity <= 0.2) fadeOut = true;
                  } else {
                    opacity += 0.15;
                    if (opacity >= 0.8) fadeOut = false;
                  }
                  
                  flashGraphic.symbol = new SimpleFillSymbol({
                    color: [255, 255, 255, opacity],
                    outline: {
                      color: [255, 255, 255, 1],
                      width: 4
                    }
                  });
                }, 200);
                
                // Remove flash after animation
                setTimeout(() => {
                  clearInterval(pulseInterval);
                  view.graphics.remove(flashGraphic);
                  console.log(`[UnifiedAnalysisWorkflow] Flash effect removed`);
                }, 3000);
                
              } catch (flashError) {
                console.error(`[UnifiedAnalysisWorkflow] Flash effect failed:`, flashError);
              }
            }, 1600); // After zoom animation completes
            
            console.log(`[UnifiedAnalysisWorkflow] View state after zoom:`, {
              center: view.center ? [view.center.longitude, view.center.latitude] : null,
              zoom: view.zoom,
              scale: view.scale
            });
            
          } catch (goToError) {
            console.error(`[UnifiedAnalysisWorkflow] view.goTo() failed:`, goToError);
          }
        } else {
          console.warn(`[UnifiedAnalysisWorkflow] No coordinates available for polygon geometry`);
        }
      } else {
        console.warn(`[UnifiedAnalysisWorkflow] Unsupported geometry type: ${geometry.type}`);
      }
      
      console.log(`[UnifiedAnalysisWorkflow] Successfully zoomed to ZIP code: ${zipCode}`);
    } catch (error) {
      console.error(`[UnifiedAnalysisWorkflow] Error zooming to ZIP code ${zipCode}:`, error);
    }
  }, [view, workflowState.analysisResult]);


  // Apply buffer to geometry
  const createBufferedGeometry = useCallback(async (geometry: __esri.Geometry, distance: number, unit: string) => {
    try {
      console.log('[Buffer Creation] Starting buffer creation for geometry type:', geometry.type);
      
      let bufferedGeometry: __esri.Geometry | null = null;
      
      if (bufferType === 'radius') {
        if (geometry.type === 'point') {
          const originalPoint = geometry as __esri.Point;
          console.log('[Buffer Creation] Original point coordinates:', 
            `X: ${originalPoint.x}, Y: ${originalPoint.y}, WKID: ${originalPoint.spatialReference?.wkid}`);
          
          // For points, create a circle
          const distanceInMeters = unit === 'miles' ? distance * 1609.34 : distance * 1000;
          console.log('[Buffer Creation] Distance conversion:', `${distance} ${unit} = ${distanceInMeters} meters`);
          
          // Project the point to the map's spatial reference if needed for proper circle rendering
          let centerPoint = originalPoint;
          console.log('[Buffer Creation] View spatial reference WKID:', view.spatialReference.wkid);
          
          if (centerPoint.spatialReference.wkid !== view.spatialReference.wkid) {
            console.log('[Buffer Creation] Point projection needed from', centerPoint.spatialReference.wkid, 'to', view.spatialReference.wkid);
            const projection = await import('@arcgis/core/geometry/projection');
            await projection.load();
            centerPoint = projection.project(centerPoint, view.spatialReference) as __esri.Point;
            console.log('[Buffer Creation] Point after projection:', 
              `X: ${centerPoint.x}, Y: ${centerPoint.y}, WKID: ${centerPoint.spatialReference?.wkid}`);
          } else {
            console.log('[Buffer Creation] No projection needed - coordinates match');
          }
          
          console.log('[Buffer Creation] Creating Circle with center:', 
            `X: ${centerPoint.x}, Y: ${centerPoint.y}, radius: ${distanceInMeters}m`);
          
          bufferedGeometry = new Circle({
            center: centerPoint,
            radius: distanceInMeters,
            radiusUnit: "meters",
            spatialReference: view.spatialReference
          });
          
          console.log('[Buffer Creation] Circle created with extent:', bufferedGeometry.extent ? 
            `xmin: ${bufferedGeometry.extent.xmin}, ymin: ${bufferedGeometry.extent.ymin}, xmax: ${bufferedGeometry.extent.xmax}, ymax: ${bufferedGeometry.extent.ymax}` : 'null');
        } else {
          // For polygons and other geometries, use geometryEngine.buffer with proper types
          const bufferResult = geometryEngine.buffer(
            geometry as __esri.Polygon | __esri.Polyline, 
            distance, 
            unit as "feet" | "meters" | "kilometers" | "miles"
          );
          bufferedGeometry = Array.isArray(bufferResult) ? bufferResult[0] : bufferResult;
        }
      } else if (bufferType === 'drivetime' || bufferType === 'walktime') {
        // Service area buffering - only works with points
        if (geometry.type === 'point') {
          // This would integrate with service area API
          const travelMode = bufferType === 'drivetime' ? 'driving' : 'walking';
          throw new Error(`${travelMode} time buffering not yet implemented`);
        } else {
          throw new Error('Travel time buffering only works with point geometries');
        }
      }
      
      if (!bufferedGeometry) {
        throw new Error('Failed to create buffered geometry');
      }
      
      return bufferedGeometry;
    } catch (error) {
      console.error('Buffer error:', error);
      throw error;
    }
  }, [bufferType, view]);

  // Handle buffer step completion
  const handleBufferComplete = useCallback(async (applyBuffer: boolean = false) => {
    console.log('[UnifiedWorkflow] Buffer complete, apply:', applyBuffer);
    
    if (applyBuffer && workflowState.areaSelection && workflowState.areaSelection.geometry.type === 'point') {
      const point = workflowState.areaSelection.geometry as __esri.Point;
      console.log('[UnifiedWorkflow] Original point before buffering:', 
        `X: ${point.x}, Y: ${point.y}, WKID: ${point.spatialReference?.wkid}`);
    }
    
    if (applyBuffer && workflowState.areaSelection) {
      try {
        const distance = parseFloat(bufferDistance);
        if (isNaN(distance) || distance <= 0) {
          throw new Error('Invalid buffer distance');
        }
        
        const bufferedGeometry = await createBufferedGeometry(
          workflowState.areaSelection.geometry,
          distance,
          bufferUnit
        );
        
        console.log('[UnifiedWorkflow] Buffer created - Distance:', distance, bufferUnit, 'Type:', bufferType);
        if (bufferedGeometry.extent) {
          console.log('[UnifiedWorkflow] Buffer extent:', 
            `xmin: ${bufferedGeometry.extent.xmin}, ymin: ${bufferedGeometry.extent.ymin}, xmax: ${bufferedGeometry.extent.xmax}, ymax: ${bufferedGeometry.extent.ymax}`);
          console.log('[UnifiedWorkflow] Buffer center coordinates:', 
            `X: ${bufferedGeometry.extent.center.x}, Y: ${bufferedGeometry.extent.center.y}`);
        }
        console.log('[UnifiedWorkflow] Buffer spatial reference:', bufferedGeometry.spatialReference?.wkid);
        
        // Add buffered geometry as a graphic to the map (matching button colors)
        if (view && bufferedGeometry) {
          // Define buffer color to match button icon colors
          const bufferColor = bufferType === 'radius' 
            ? [34, 197, 94] // Green for radius (matches brand green)
            : bufferType === 'drivetime' 
              ? [34, 197, 94] // Green for drive time (matches text-green-500)
              : [249, 115, 22]; // Orange for walk time (matches text-orange-500)
          
          // Create buffer graphic using SimpleFillSymbol (matching existing implementation)
          const bufferGraphic = new Graphic({
            geometry: bufferedGeometry,
            symbol: new SimpleFillSymbol({
              color: [...bufferColor, 0.2], // 20% opacity matching existing
              outline: {
                color: bufferColor,
                width: 2
              }
            })
          });
          
          // Find and preserve any existing point graphic
          const pointGraphic = view.graphics.find(g => g.attributes?.isPoint);
          
          // Clear graphics and re-add in correct order
          view.graphics.removeAll();
          
          // Re-add point graphic if it exists
          if (pointGraphic) {
            view.graphics.add(pointGraphic);
          } else if (workflowState.areaSelection.geometry.type === 'point') {
            // Create new point graphic if needed
            const newPointGraphic = new Graphic({
              geometry: workflowState.areaSelection.geometry,
              symbol: {
                type: "simple-marker",
                color: [255, 0, 0],
                outline: {
                  color: [255, 255, 255],
                  width: 2
                },
                size: 8
              } as unknown as __esri.SimpleMarkerSymbol,
              attributes: { isPoint: true }
            });
            view.graphics.add(newPointGraphic);
          }
          
          // Add buffer graphic
          view.graphics.add(bufferGraphic);
          
          // Zoom to buffered extent (matching existing implementation)
          if (bufferedGeometry?.extent) {
            await view.goTo(bufferedGeometry.extent.expand(1.2));
          }
        }
        
        // Create new area selection with buffered geometry
        const bufferedArea: AreaSelection = {
          ...workflowState.areaSelection,
          geometry: bufferedGeometry,
          displayName: `${workflowState.areaSelection.displayName} (${distance} ${bufferUnit} buffer)`,
          method: 'service-area',
          metadata: {
            ...workflowState.areaSelection.metadata,
            bufferType,
            bufferValue: distance,
            bufferUnit
          }
        };
        
        setWorkflowState(prev => ({
          ...prev,
          areaSelection: bufferedArea,
          currentStep: 'analysis'
        }));
      } catch (error) {
        setWorkflowState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to apply buffer'
        }));
      }
    } else {
      // Skip buffer, proceed with original area
      setWorkflowState(prev => ({
        ...prev,
        currentStep: 'analysis'
      }));
    }
  }, [workflowState.areaSelection, bufferDistance, bufferUnit, bufferType, createBufferedGeometry, view]);

  // Handle predefined query selection
  const handlePredefinedQuerySelect = useCallback((query: string) => {
    setSelectedQuery(query);
    setQuickstartDialogOpen(false);
  }, []);

  // Handle infographics report selection
  const handleInfographicsReportSelect = useCallback((reportId: string) => {
    console.log('[UnifiedWorkflow] Report selected:', reportId);
    
    // Check if this is from the UI workflow (has area selection) or from popup
    const isFromUIWorkflow = workflowState.analysisType === 'infographic' && workflowState.areaSelection;
    
    if (isFromUIWorkflow) {
      // Update dialog state and keep it open for confirmation
      setInfographicsDialog(prev => ({
        ...prev,
        selectedReport: reportId,
        open: false
      }));
    } else {
      // This is from popup - show infographic immediately
      setInfographicsDialog(prev => ({
        ...prev,
        selectedReport: reportId,
        open: false,
        showInfographics: true
      }));
    }
  }, [workflowState.analysisType, workflowState.areaSelection]);

  // Handle infographics dialog close
  const handleInfographicsDialogClose = useCallback(() => {
    setInfographicsDialog(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Handle infographics completion
  const handleInfographicsComplete = useCallback(() => {
    setInfographicsDialog({
      open: false,
      geometry: null,
      selectedReport: null,
      showInfographics: false
    });
  }, []);

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    if (view) {
      // Clear all graphics from the map
      view.graphics.removeAll();
      
      // Clear all dynamically added layers (analysis visualizations)
      // Find and remove any FeatureLayers that were added for analysis results
      const layersToRemove = view.map.layers.filter(layer => {
        // Remove layers that are likely analysis results based on:
        // 1. Layer ID pattern from applyAnalysisEngineVisualization
        // 2. Layer type being 'feature' (FeatureLayer)
        // 3. Client-side layers with source graphics (analysis results)
        const hasAnalysisId = layer.id?.includes('analysis-layer-');
        const isAnalysisLayer = layer.type === 'feature' && 
               (hasAnalysisId || 
                layer.title?.includes('Analysis') || 
                layer.title?.includes('Visualization') ||
                (layer as __esri.FeatureLayer).source?.length > 0); // Client-side layers
        
        return isAnalysisLayer;
      });
      
      layersToRemove.forEach(layer => {
        view.map.remove(layer);
      });
      
      console.log(`[UnifiedWorkflow] Cleared ${layersToRemove.length} analysis layers from map`);
    }
    
    // Clear legend data
    if (setFormattedLegendData) {
      setFormattedLegendData(null);
      console.log('[UnifiedWorkflow] Cleared legend data');
    }
    
    // Reset all state
    setWorkflowState({
      currentStep: 'area',
      isProcessing: false,
      areaSelection: undefined,
      analysisType: undefined,
      analysisResult: undefined,
      error: undefined
    });
    setSelectedQuery('');
    setSelectedEndpoint('');
    setSelectedInfographicType('strategic');
    setBufferDistance('1');
    setBufferUnit('miles');
    setBufferType('radius');
    
    // Reset clustering config
    setClusterConfig({
      ...DEFAULT_CLUSTER_CONFIG,
      minScorePercentile: DEFAULT_CLUSTER_CONFIG.minScorePercentile ?? 70
    });
    
    // Reset chat state
    setChatMessages([]);
    setHasGeneratedNarrative(false);
    
    // Increment reset counter to force component remount
    setResetCounter(prev => prev + 1);
  }, [view, setFormattedLegendData]);

  // Render workflow steps indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'area', label: 'Select Area', icon: MapPin },
      { id: 'buffer', label: 'Buffer', icon: Target },
      { id: 'analysis', label: 'Analysis', icon: BarChart3 },
      { id: 'results', label: 'Results', icon: FileText }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === workflowState.currentStep);

    return (
      <div className="flex items-center mb-3 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === workflowState.currentStep;
          const isCompleted = currentStepIndex > index;
          const isClickable = isCompleted || (index === 0);

          return (
            <div key={step.id} className="flex items-center min-w-0">
              <button
                onClick={() => isClickable && goToStep(step.id as WorkflowStep)}
                disabled={!isClickable}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all whitespace-nowrap ${
                  isActive 
                    ? 'theme-bg-accent theme-text-accent-foreground' 
                    : isCompleted 
                      ? 'theme-bg-success theme-text-success cursor-pointer hover:bg-green-200' 
                      : 'theme-bg-secondary theme-text-secondary'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                <span className="font-medium text-xs">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-2 text-gray-400 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render analysis type selection
  const renderAnalysisTypeSelection = () => {
    const isProjectArea = workflowState.areaSelection?.method === 'project-area';
    
    return (
      <div className="flex-1 flex flex-col space-y-6">
        {/* Performance warning for project area - Removed */}
        
        {/* Analysis Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* quickstartIQ */}
        <Card 
          className={`cursor-pointer transition-all h-32 ${
            workflowState.analysisType === 'query' 
              ? 'border-green-500 bg-green-50 shadow-lg' 
              : 'hover:shadow-lg'
          }`}
          onClick={() => !workflowState.isProcessing && setWorkflowState(prev => ({ ...prev, analysisType: 'query' }))}
        >
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <Image 
                src="/mpiq_pin2.png" 
                alt="quickstartIQ" 
                width={20} 
                height={20}
                className="h-5 w-5" 
              />
              <div className="flex text-sm font-bold">
                <span className="firefly-accent-primary">quickstart</span>
                <span className="theme-text-primary -ml-px">IQ</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-xs text-muted-foreground">
              Natural language queries for custom analysis
            </p>
          </CardContent>
        </Card>

        {/* infographIQ */}
        <Card 
          className={`transition-all h-32 ${
            isProjectArea 
              ? 'opacity-50 cursor-not-allowed theme-bg-secondary' 
              : workflowState.analysisType === 'infographic' 
                ? 'border-green-500 theme-bg-success-light shadow-lg cursor-pointer' 
                : 'hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => !workflowState.isProcessing && !isProjectArea && setWorkflowState(prev => ({ ...prev, analysisType: 'infographic' }))}
        >
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Image 
                  src="/mpiq_pin2.png" 
                  alt="infographIQ" 
                  width={20} 
                  height={20}
                  className="h-5 w-5" 
                />
                <div className="flex text-sm font-bold">
                  <span className="firefly-accent-primary">infograph</span>
                  <span className="theme-text-primary -ml-px">IQ</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className={`text-xs ${isProjectArea ? 'theme-text-secondary' : 'text-muted-foreground'}`}>
              {isProjectArea ? 'Not available for all areas at once. Make a selection first' : 'Pre-configured reports and insights'}
            </p>
          </CardContent>
        </Card>

        {/* reportIQ - Hidden for now */}
        {/* <Card 
          className={`transition-all h-28 ${
            isProjectArea 
              ? 'opacity-50 cursor-not-allowed bg-gray-100' 
              : workflowState.analysisType === 'comprehensive' 
                ? 'border-green-500 bg-green-50 shadow-lg cursor-pointer' 
                : 'hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => !workflowState.isProcessing && !isProjectArea && setWorkflowState(prev => ({ ...prev, analysisType: 'comprehensive' }))}
        >
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Image 
                  src="/mpiq_pin2.png" 
                  alt="reportIQ" 
                  width={20} 
                  height={20}
                  className="h-5 w-5" 
                />
                <div className="flex text-sm font-bold">
                  <span className="text-[#33a852]">report</span>
                  <span className="text-black -ml-px">IQ</span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className={`text-xs ${isProjectArea ? 'theme-text-secondary' : 'text-muted-foreground'}`}>
              {isProjectArea ? 'Not available for all areas at once. Make a selection first' : 'Complete analysis with all available data and visualizations'}
            </p>
          </CardContent>
        </Card> */}
      </div>

      {/* Configuration Section - Only show when analysis type is selected */}
      {workflowState.analysisType && (
        <Card className="flex-1 flex flex-col border-t-2 border-t-gray-200">
          <CardHeader className="flex-shrink-0 py-2">
            <CardTitle className="text-xs">Configure Analysis</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-3 py-3">
            <div className="flex-1">
              {workflowState.analysisType === 'query' && (
                <div className="space-y-3 h-full">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium">Enter your query</label>
                      <div className="flex items-center gap-2">
                        <Dialog open={quickstartDialogOpen} onOpenChange={setQuickstartDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 flex items-center gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              Quick Start
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <QueryDialog
                              onQuestionSelect={handlePredefinedQuerySelect}
                              title="quickstartIQ"
                              description="Choose from predefined demographic and analysis queries to get started quickly."
                              categories={ANALYSIS_CATEGORIES}
                              disabledCategories={DISABLED_ANALYSIS_CATEGORIES}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        {/* Persona Selector */}
                        <Dialog open={isPersonaDialogOpen} onOpenChange={setIsPersonaDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 flex items-center gap-1"
                            >
                              {React.createElement(
                                PERSONA_ICON_MAP[selectedPersona] || UserCog,
                                { className: 'h-3 w-3' }
                              )}
                              <span className="truncate">
                                {personaMetadata.find(p => p.id === selectedPersona)?.name || 'Strategist'}
                              </span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg theme-bg-primary" aria-describedby="persona-dialog-description">
                            <DialogHeader>
                              <DialogTitle>Select AI Persona</DialogTitle>
                              <p id="persona-dialog-description" className="text-xs text-gray-600 mt-2">
                                Choose an analytical perspective that matches your decision-making context.
                              </p>
                            </DialogHeader>
                            <div className="grid grid-cols-1 gap-3 mt-4">
                              {personaMetadata.map((persona) => (
                                <Button
                                  key={persona.id}
                                  variant={selectedPersona === persona.id ? 'default' : 'outline'}
                                  size="sm"
                                  className="flex items-start gap-3 p-4 h-auto text-left justify-start w-full whitespace-normal"
                                  onClick={() => {
                                    setSelectedPersona(persona.id);
                                    setIsPersonaDialogOpen(false);
                                  }}
                                >
                                  {React.createElement(
                                    PERSONA_ICON_MAP[persona.id] || UserCog,
                                    { className: 'h-4 w-4 flex-shrink-0 mt-0.5 text-[#33a852]' }
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-xs">{persona.name}</div>
                                    <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                      {persona.description}
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Dialog open={clusterDialogOpen} onOpenChange={setClusterDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 flex items-center gap-1"
                            >
                              <Target className="h-3 w-3" />
                              {clusterConfig.enabled ? `${clusterConfig.numClusters} Clusters` : 'Clustering'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <ClusterConfigPanel
                              config={clusterConfig}
                              onConfigChange={setClusterConfig}
                              onSave={() => setClusterDialogOpen(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    <textarea
                      placeholder="Enter your natural language query..."
                      className="flex-1 w-full p-3 border rounded-lg text-sm min-h-[120px] resize-none"
                      value={selectedQuery}
                      onChange={(e) => setSelectedQuery(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {workflowState.analysisType === 'infographic' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-2">Select Report Template</label>
                    <Button
                      onClick={() => {
                        // Open report selection dialog when infographIQ is chosen
                        setInfographicsDialog(prev => ({
                          ...prev,
                          open: true,
                          geometry: workflowState.areaSelection?.geometry || null,
                          selectedReport: null,
                          showInfographics: false
                        }));
                      }}
                      className="w-full bg-[#33a852] hover:bg-[#2d8f47] text-white"
                    >
                      Choose a Report Template
                    </Button>
                    {infographicsDialog.selectedReport && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <span className="text-sm">Selected: {infographicsReports.find(r => r.id === infographicsDialog.selectedReport)?.title || 'Unknown'}</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-800 font-medium mb-2">What you&rsquo;ll get:</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• Comprehensive scoring across multiple data points</li>
                      <li>• Visual charts and infographic displays</li>
                      <li>• Competitive benchmarking analysis</li>
                      <li>• Key insights and recommendations</li>
                    </ul>
                  </div>
                </div>
              )}

              {workflowState.analysisType === 'comprehensive' && (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-xs text-green-800 font-medium mb-3">Complete Analysis Includes:</p>
                    <div className="grid grid-cols-2 gap-3 text-xs text-green-700">
                      <div>
                        <p className="font-medium">Demographics</p>
                        <p>Population, age, income distribution</p>
                      </div>
                      <div>
                        <p className="font-medium">Business Intelligence</p>
                        <p>Market analysis, competition data</p>
                      </div>
                      <div>
                        <p className="font-medium">Geographic Insights</p>
                        <p>Location scoring, accessibility</p>
                      </div>
                      <div>
                        <p className="font-medium">Economic Indicators</p>
                        <p>Growth trends, market potential</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0 pt-4">
              <Button 
                onClick={() => {
                  if (workflowState.analysisType === 'infographic' && infographicsDialog.selectedReport) {
                    // Generate the infographic report
                    setInfographicsDialog(prev => ({
                      ...prev,
                      showInfographics: true,
                      geometry: workflowState.areaSelection?.geometry || null
                    }));
                  } else if (workflowState.analysisType !== 'infographic') {
                    handleAnalysisTypeSelected(workflowState.analysisType!);
                  }
                }}
                className="w-full h-12"
                disabled={workflowState.isProcessing || 
                  (workflowState.analysisType === 'query' && !selectedQuery.trim()) ||
                  (workflowState.analysisType === 'infographic' && !infographicsDialog.selectedReport)}
              >
                {workflowState.isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : workflowState.analysisType === 'infographic' ? (
                  infographicsDialog.selectedReport ? 'Generate Report' : 'Select a Report First'
                ) : (
                  <>
                    Start Analysis
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {workflowState.error && (
        <Alert variant="destructive" className="flex-shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{workflowState.error}</AlertDescription>
        </Alert>
      )}
      </div>
    );
  };

  // Render buffer step
  const renderBufferStep = () => {
    if (!workflowState.areaSelection) return null;

    const isPoint = workflowState.areaSelection.geometry.type === 'point';

    return (
      <div className="flex-1 flex flex-col space-y-3">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="flex-shrink-0 py-2">
            <CardTitle className="text-xs">Add Buffer to Selected Area (Optional)</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Expand your analysis area by adding a buffer around the selected {isPoint ? 'point' : 'area'}.
            </p>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between space-y-3 py-3">
            <div className="space-y-3">
              <div className="space-y-4">
                <h4 className="text-xs font-medium">Buffer Type:</h4>
                <div className="grid grid-cols-3 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all p-3 ${
                      bufferType === 'radius' 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setBufferType('radius');
                      setBufferUnit('miles'); // Reset to distance units
                    }}
                  >
                    <div className="text-center">
                      <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-medium">Radius</p>
                      <p className="text-xs text-muted-foreground">Fixed distance</p>
                    </div>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all p-3 ${
                      bufferType === 'drivetime' 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setBufferType('drivetime');
                      setBufferUnit('minutes'); // Switch to time units
                    }}
                  >
                    <div className="text-center">
                      <Car className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-xs font-medium">Drive Time</p>
                      <p className="text-xs text-muted-foreground">Travel by car</p>
                    </div>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all p-3 ${
                      bufferType === 'walktime' 
                        ? 'border-orange-500 bg-orange-50 shadow-md' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setBufferType('walktime');
                      setBufferUnit('minutes'); // Switch to time units
                    }}
                  >
                    <div className="text-center">
                      <Walk className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                      <p className="text-xs font-medium">Walk Time</p>
                      <p className="text-xs text-muted-foreground">Travel on foot</p>
                    </div>
                  </Card>
                </div>

                {/* Buffer Configuration */}
                <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">
                        {bufferType === 'radius' ? 'Distance' : 'Time'}
                      </label>
                      <input
                        type="number"
                        className="w-full px-2 py-1 text-xs border rounded"
                        value={bufferDistance}
                        onChange={(e) => setBufferDistance(e.target.value)}
                        min="0.1"
                        step={bufferType === 'radius' ? '0.1' : '1'}
                        placeholder={bufferType === 'radius' ? '1.0' : '5'}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Unit</label>
                      <select
                        className="w-full px-2 py-1 text-xs border rounded"
                        value={bufferUnit}
                        onChange={(e) => setBufferUnit(e.target.value as 'miles' | 'kilometers' | 'minutes')}
                      >
                        {bufferType === 'radius' ? (
                          <>
                            <option value="miles">Miles</option>
                            <option value="kilometers">Kilometers</option>
                          </>
                        ) : (
                          <option value="minutes">Minutes</option>
                        )}
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    {bufferType === 'radius' && (
                      `Create a ${bufferDistance} ${bufferUnit} radius buffer around your point.`
                    )}
                    {bufferType === 'drivetime' && (
                      `Create a ${bufferDistance} minute driving area from your point.`
                    )}
                    {bufferType === 'walktime' && (
                      `Create a ${bufferDistance} minute walking area from your point.`
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button 
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => handleBufferComplete(false)}
              >
                Skip Buffer
              </Button>
              <Button 
                className="flex-1 text-xs"
                onClick={() => handleBufferComplete(true)}
                disabled={!bufferDistance || parseFloat(bufferDistance) <= 0}
              >
                Apply Buffer
                <ChevronRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render results view
  const renderResults = () => {
    if (!workflowState.analysisResult) return null;

    const { analysisResult, metadata } = workflowState.analysisResult;

    return (
      <div className="flex flex-col h-full">
        {/* Results content with Analysis/Chat, Data Table, and Insights */}
        <div className="flex-1 flex flex-col min-h-0">
          <Tabs value={activeResultsTab} onValueChange={setActiveResultsTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-3 flex-shrink-0 theme-bg-primary border-b mb-2">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <MessageCircle className="h-3 w-3" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="data" className="flex items-center gap-2">
                <Table className="h-3 w-3" />
                Data
              </TabsTrigger>
              <TabsTrigger value="chart" className="flex items-center gap-2">
                <BarChart className="h-3 w-3" />
                Chart
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="flex-1 min-h-0 max-h-[calc(100vh-200px)] overflow-hidden">
              {/* Analysis and Chat Interface */}
              <UnifiedAnalysisChat 
                analysisResult={workflowState.analysisResult}
                onExportChart={handleExportChart}
                onZipCodeClick={handleZipCodeClick}
                persona={selectedPersona}
                messages={chatMessages}
                setMessages={setChatMessages}
                hasGeneratedNarrative={hasGeneratedNarrative}
                setHasGeneratedNarrative={setHasGeneratedNarrative}
              />
            </TabsContent>

            <TabsContent value="data" className="flex-1 min-h-0 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Data Table */}
              <UnifiedDataTable 
                analysisResult={analysisResult}
                onExport={() => handleExport('csv')}
              />
            </TabsContent>

            <TabsContent value="chart" className="flex-1 min-h-0 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Feature Importance Chart */}
              <UnifiedInsightsChart 
                analysisResult={analysisResult}
                onExportChart={handleExportChart}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="flex-shrink-0 py-2">
          <CardTitle className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Image 
                src="/mpiq_pin2.png" 
                alt="IQbuilder" 
                width={16} 
                height={16}
                className="h-4 w-4" 
              />
              <div className="flex text-sm font-bold">
                <span className="text-[#33a852]">IQ</span>
                <span className="theme-text-primary -ml-px">builder</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetWorkflow}
              className="text-xs h-7 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Start Over
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col py-3 min-h-0">
          {/* Step indicator */}
          <div className="flex-shrink-0 mb-3">
            {renderStepIndicator()}
          </div>

          {/* Loading indicator */}
          {workflowState.isProcessing && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <span className="text-sm mb-4 block">Processing analysis...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopAnalysis}
                  className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Stop Analysis
                  </div>
                </Button>
              </div>
            </div>
          )}

          {/* Step content */}
          {!workflowState.isProcessing && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {workflowState.currentStep === 'area' && (
                <div className="flex-1">
                  <UnifiedAreaSelector
                    key={`area-selector-${resetCounter}`}
                    view={view}
                    onAreaSelected={handleAreaSelected}
                    defaultMethod="project"
                  />
                </div>
              )}

              {workflowState.currentStep === 'buffer' && (
                <div className="flex-1 flex flex-col">
                  {renderBufferStep()}
                </div>
              )}

              {workflowState.currentStep === 'analysis' && (
                <div className="flex-1 flex flex-col">
                  {renderAnalysisTypeSelection()}
                </div>
              )}

              {workflowState.currentStep === 'results' && (
                <div className="flex-1 min-h-0">
                  {renderResults()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Infographics Report Selection Dialog */}
      {infographicsDialog.open && (
        <ReportSelectionDialog
          open={infographicsDialog.open}
          reports={infographicsReports}
          onClose={handleInfographicsDialogClose}
          onSelect={handleInfographicsReportSelect as any}
        />
      )}

      {/* Infographics Display */}
      {infographicsDialog.showInfographics && infographicsDialog.geometry && infographicsDialog.selectedReport && (
        <Dialog
          open={infographicsDialog.showInfographics}
          onOpenChange={(open) => {
            if (!open) {
              handleInfographicsComplete();
            }
          }}
        >
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Infographic Report</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              <Infographics
                geometry={infographicsDialog.geometry}
                reportTemplate={infographicsDialog.selectedReport}
                onReportTemplateChange={(template) => {
                  setInfographicsDialog(prev => ({
                    ...prev,
                    selectedReport: template
                  }));
                }}
                view={view}
                layerStates={{}}
                onExportPDF={() => {}}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}