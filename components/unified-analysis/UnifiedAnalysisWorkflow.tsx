/* eslint-disable @typescript-eslint/no-unused-vars */
// UnifiedAnalysisWorkflow.tsx
// Main orchestrator component that unifies the entire analysis workflow
// Combines area selection, analysis type selection, and results viewing

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
  AlertCircle
} from 'lucide-react';

// Import unified components
import UnifiedAreaSelector, { AreaSelection } from './UnifiedAreaSelector';
import { UnifiedAnalysisWrapper, UnifiedAnalysisRequest, UnifiedAnalysisResponse } from './UnifiedAnalysisWrapper';

// Import existing components for analysis
import { QueryInterface } from '@/components/QueryInterface';
import EndpointScoreInfographic from '@/components/EndpointScoreInfographic';
import { CustomVisualizationPanel } from '@/components/Visualization/CustomVisualizationPanel';

// Import chat interface for contextual analysis
import { useChatContext } from '@/components/chat-context-provider';

export interface UnifiedAnalysisWorkflowProps {
  view: __esri.MapView;
  onAnalysisComplete?: (result: UnifiedAnalysisResponse) => void;
  onExport?: (format: string, data: any) => void;
  enableChat?: boolean;
  defaultAnalysisType?: 'query' | 'infographic' | 'comprehensive';
}

type WorkflowStep = 'area' | 'analysis' | 'results';

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
    setWorkflowState(prev => ({
      ...prev,
      areaSelection: area,
      currentStep: 'analysis'
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
        includeChat: enableChat
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
  }, [workflowState.areaSelection, selectedQuery, selectedEndpoint, selectedInfographicType, enableChat, analysisWrapper, onAnalysisComplete]);

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

  // Reset workflow
  const resetWorkflow = useCallback(() => {
    setWorkflowState({
      currentStep: 'area',
      isProcessing: false
    });
    setSelectedQuery('');
    setSelectedEndpoint('');
  }, []);

  // Render workflow steps indicator
  const renderStepIndicator = () => {
    const steps = [
      { id: 'area', label: 'Select Area', icon: MapPin },
      { id: 'analysis', label: 'Choose Analysis', icon: BarChart3 },
      { id: 'results', label: 'View Results', icon: FileText }
    ];

    const currentStepIndex = steps.findIndex(s => s.id === workflowState.currentStep);

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === workflowState.currentStep;
          const isCompleted = currentStepIndex > index;
          const isClickable = isCompleted || (index === 0);

          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                onClick={() => isClickable && goToStep(step.id as WorkflowStep)}
                disabled={!isClickable}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : isCompleted 
                      ? 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
                <span className="font-medium">{step.label}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-2 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render analysis type selection
  const renderAnalysisTypeSelection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Query Analysis */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => !workflowState.isProcessing && handleAnalysisTypeSelected('query')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Query Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Natural language or SQL queries for custom analysis
            </p>
            {workflowState.analysisType === 'query' && (
              <div className="mt-4 space-y-2">
                <input
                  type="text"
                  placeholder="Enter your query..."
                  className="w-full p-2 border rounded"
                  value={selectedQuery}
                  onChange={(e) => setSelectedQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infographic Analysis */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => !workflowState.isProcessing && handleAnalysisTypeSelected('infographic')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Score Infographic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pre-configured score-based reports and insights
            </p>
            {workflowState.analysisType === 'infographic' && (
              <div className="mt-4">
                <select
                  className="w-full p-2 border rounded"
                  value={selectedInfographicType}
                  onChange={(e) => setSelectedInfographicType(e.target.value as any)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="strategic">Strategic Analysis</option>
                  <option value="competitive">Competitive Analysis</option>
                  <option value="demographic">Demographic Analysis</option>
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comprehensive Analysis */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => !workflowState.isProcessing && handleAnalysisTypeSelected('comprehensive')}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Comprehensive Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete analysis with all available data and visualizations
            </p>
          </CardContent>
        </Card>
      </div>

      {workflowState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{workflowState.error}</AlertDescription>
        </Alert>
      )}
    </div>
  );

  // Render results view
  const renderResults = () => {
    if (!workflowState.analysisResult) return null;

    const { analysisResult, metadata } = workflowState.analysisResult;

    return (
      <div className="space-y-4">
        {/* Results header with export options */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <p className="text-sm text-muted-foreground">
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
        <Tabs defaultValue="visualization" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="mt-4">
            {analysisResult.visualization && (
              <CustomVisualizationPanel
                data={analysisResult.data}
                visualization={analysisResult.visualization}
              />
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
            {analysisResult.insights && (
              <div className="space-y-2">
                {analysisResult.insights.map((insight: any, index: number) => (
                  <Alert key={index}>
                    <AlertDescription>{insight}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Unified Analysis Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Loading indicator */}
        {workflowState.isProcessing && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3">Processing analysis...</span>
          </div>
        )}

        {/* Step content */}
        {!workflowState.isProcessing && (
          <>
            {workflowState.currentStep === 'area' && (
              <UnifiedAreaSelector
                view={view}
                onAreaSelected={handleAreaSelected}
                defaultMethod="draw"
              />
            )}

            {workflowState.currentStep === 'analysis' && renderAnalysisTypeSelection()}

            {workflowState.currentStep === 'results' && renderResults()}
          </>
        )}
      </CardContent>
    </Card>
  );
}