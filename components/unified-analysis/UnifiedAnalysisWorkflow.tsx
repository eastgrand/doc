/* eslint-disable @typescript-eslint/no-unused-vars */
// UnifiedAnalysisWorkflow.tsx
// Main orchestrator component that unifies the entire analysis workflow
// Combines area selection, analysis type selection, and results viewing

import React, { useState, useCallback, useEffect } from 'react';
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
  Download,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Target,
  Car,
  FootprintsIcon as Walk,
  RotateCcw,
  Sparkles
} from 'lucide-react';

// Import unified components
import UnifiedAreaSelector, { AreaSelection } from './UnifiedAreaSelector';
import { UnifiedAnalysisWrapper, UnifiedAnalysisRequest, UnifiedAnalysisResponse } from './UnifiedAnalysisWrapper';

// Import existing components for analysis
import { QueryInterface } from '@/components/QueryInterface';
import EndpointScoreInfographic from '@/components/EndpointScoreInfographic';

// Import dialog and predefined queries
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import QueryDialog from '@/components/chat/QueryDialog';
import { ANALYSIS_CATEGORIES, DISABLED_ANALYSIS_CATEGORIES } from '@/components/chat/chat-constants';

// Clustering Components
import { ClusterConfigPanel } from '@/components/clustering/ClusterConfigPanel';
import { ClusterConfig, DEFAULT_CLUSTER_CONFIG } from '@/lib/clustering/types';

// Import chat interface for contextual analysis
import { useChatContext } from '@/components/chat-context-provider';

// Import ArcGIS geometry engine for buffering
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine";
import Circle from "@arcgis/core/geometry/Circle";
import Graphic from "@arcgis/core/Graphic";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

export interface UnifiedAnalysisWorkflowProps {
  view: __esri.MapView;
  onAnalysisComplete?: (result: UnifiedAnalysisResponse) => void;
  onExport?: (format: string, data: unknown) => void;
  enableChat?: boolean;
  defaultAnalysisType?: 'query' | 'infographic' | 'comprehensive';
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
  defaultAnalysisType = 'query'
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
  
  // QuickstartIQ dialog state
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  
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

  // Step navigation
  const goToStep = useCallback((step: WorkflowStep) => {
    setWorkflowState(prev => ({ ...prev, currentStep: step }));
  }, []);

  // Handle area selection
  const handleAreaSelected = useCallback((area: AreaSelection) => {
    console.log('[UnifiedWorkflow] Area selected:', area);
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

    try {
      // Prepare analysis request
      const request: UnifiedAnalysisRequest = {
        geometry: workflowState.areaSelection.geometry,
        geometryMethod: workflowState.areaSelection.method,
        analysisType: type,
        query: type === 'query' ? selectedQuery : undefined,
        endpoint: type === 'query' ? selectedEndpoint : undefined,
        infographicType: type === 'infographic' ? selectedInfographicType : undefined,
        includeChat: enableChat,
        clusterConfig: type === 'query' && clusterConfig.enabled ? clusterConfig : undefined
      };

      console.log('[UnifiedWorkflow] Starting analysis:', request);

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
      setWorkflowState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Analysis failed',
        isProcessing: false
      }));
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

  // Apply buffer to geometry
  const createBufferedGeometry = useCallback(async (geometry: __esri.Geometry, distance: number, unit: string) => {
    try {
      let bufferedGeometry: __esri.Geometry | null = null;
      
      if (bufferType === 'radius') {
        if (geometry.type === 'point') {
          // For points, create a circle
          const distanceInMeters = unit === 'miles' ? distance * 1609.34 : distance * 1000;
          bufferedGeometry = new Circle({
            center: geometry as __esri.Point,
            radius: distanceInMeters,
            radiusUnit: "meters",
            spatialReference: view.spatialReference
          });
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

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    // Clear all graphics from the map
    if (view?.graphics) {
      view.graphics.removeAll();
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
    
    // Increment reset counter to force component remount
    setResetCounter(prev => prev + 1);
  }, [view]);

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
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400'
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
        {/* Performance warning for project area */}
        {isProjectArea && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-xs text-orange-800">
              <strong>Project Area Analysis:</strong> Analyzing the entire project area with potentially thousands of data points. 
              Infographic and comprehensive analysis are disabled for performance reasons. Use query analysis for best results.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Analysis Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* quickstartIQ */}
        <Card 
          className={`cursor-pointer transition-all h-28 ${
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
                width={16} 
                height={16}
                className="h-4 w-4" 
              />
              <div className="flex text-xs font-bold">
                <span className="text-[#33a852]">quickstart</span>
                <span className="text-black -ml-px">IQ</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-xs text-muted-foreground">
              Natural language or SQL queries for custom analysis
            </p>
          </CardContent>
        </Card>

        {/* infographIQ */}
        <Card 
          className={`transition-all h-28 ${
            isProjectArea 
              ? 'opacity-50 cursor-not-allowed bg-gray-100' 
              : workflowState.analysisType === 'infographic' 
                ? 'border-green-500 bg-green-50 shadow-lg cursor-pointer' 
                : 'hover:shadow-lg cursor-pointer'
          }`}
          onClick={() => !workflowState.isProcessing && !isProjectArea && setWorkflowState(prev => ({ ...prev, analysisType: 'infographic' }))}
        >
          <CardHeader className="py-2">
            <CardTitle className="flex items-center gap-2 text-xs">
              <Image 
                src="/mpiq_pin2.png" 
                alt="infographIQ" 
                width={16} 
                height={16}
                className="h-4 w-4" 
              />
              <div className="flex text-xs font-bold">
                <span className="text-[#33a852]">infograph</span>
                <span className="text-black -ml-px">IQ</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className={`text-xs ${isProjectArea ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {isProjectArea ? 'Disabled for large datasets (performance)' : 'Pre-configured score-based reports and insights'}
            </p>
          </CardContent>
        </Card>

        {/* reportIQ */}
        <Card 
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
              <Image 
                src="/mpiq_pin2.png" 
                alt="reportIQ" 
                width={16} 
                height={16}
                className="h-4 w-4" 
              />
              <div className="flex text-xs font-bold">
                <span className="text-[#33a852]">report</span>
                <span className="text-black -ml-px">IQ</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className={`text-xs ${isProjectArea ? 'text-gray-400' : 'text-muted-foreground'}`}>
              {isProjectArea ? 'Disabled for large datasets (performance)' : 'Complete analysis with all available data and visualizations'}
            </p>
          </CardContent>
        </Card>
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
                      </div>
                    </div>
                    <textarea
                      placeholder="Enter your natural language or SQL query..."
                      className="flex-1 w-full p-3 border rounded-lg text-sm min-h-[120px] resize-none"
                      value={selectedQuery}
                      onChange={(e) => setSelectedQuery(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Examples: &ldquo;Show me all retail locations&rdquo;, &ldquo;What&rsquo;s the population density?&rdquo;, &ldquo;SELECT * FROM businesses WHERE type = &rsquo;restaurant&rsquo;&rdquo;
                  </p>
                </div>
              )}

              {workflowState.analysisType === 'infographic' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-2">Select infographic type</label>
                    <select
                      className="w-full p-3 border rounded-lg text-sm"
                      value={selectedInfographicType}
                      onChange={(e) => setSelectedInfographicType(e.target.value as 'strategic' | 'competitive' | 'demographic')}
                    >
                      <option value="strategic">Strategic Analysis</option>
                      <option value="competitive">Competitive Analysis</option>
                      <option value="demographic">Demographic Analysis</option>
                    </select>
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
                onClick={() => handleAnalysisTypeSelected(workflowState.analysisType!)}
                className="w-full h-12"
                disabled={workflowState.isProcessing || (workflowState.analysisType === 'query' && !selectedQuery.trim())}
              >
                {workflowState.isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
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
      <div className="space-y-4">
        {/* Results header with export options */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-semibold">Analysis Results</h3>
            <p className="text-xs text-muted-foreground">
              {metadata.analysisType} • {new Date(metadata.timestamp).toLocaleString()} • 
              {(metadata.processingTime / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetWorkflow}
            >
              New Analysis
            </Button>
          </div>
        </div>

        {/* Results content based on analysis type */}
        <Tabs value="visualization" onValueChange={() => {}} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="mt-4">
            {analysisResult.visualization && (
              <div className="max-h-96 overflow-auto">
                <pre className="text-xs bg-gray-50 p-4 rounded">
                  {JSON.stringify(analysisResult.visualization, null, 2)}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <div className="max-h-96 overflow-auto">
              <pre className="text-xs bg-gray-50 p-4 rounded">
                {JSON.stringify(analysisResult.data, null, 2)}
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            {analysisResult.data?.summary && (
              <div className="space-y-2">
                <Alert>
                  <AlertDescription>{analysisResult.data.summary}</AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-shrink-0 py-2">
          <CardTitle className="flex items-center justify-between text-xs">
            <span>Unified Analysis Workflow</span>
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
        <CardContent className="flex-1 flex flex-col py-3">
          {/* Step indicator */}
          <div className="flex-shrink-0 mb-3">
            {renderStepIndicator()}
          </div>

          {/* Loading indicator */}
          {workflowState.isProcessing && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                <span className="text-sm">Processing analysis...</span>
              </div>
            </div>
          )}

          {/* Step content */}
          {!workflowState.isProcessing && (
            <div className="flex-1 flex flex-col min-h-0">
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
                <div className="flex-1 overflow-auto">
                  {renderResults()}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}