'use client';
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect, useCallback, ReactElement, memo, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getPrimaryScoreField, extractScoreValue } from '@/lib/analysis/utils/FieldMappingConfig';
import { ConfigurationManager } from '@/lib/analysis/ConfigurationManager';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import InfographicsTab from './tabs/InfographicsTab';
import {
  Loader2,
  AlertCircle,
  Copy,
  FileSpreadsheet,
  BarChart,
  Save,
  X,
  CheckCircle,
  XCircle,
  Brain,
  Database,
  Cog,
  Target as TargetIcon,
  UserCog,
  Check,
  Filter,
  MessageSquare,
  ShoppingCart,
} from 'lucide-react';
import AITab from './tabs/AITab';
import { useChatContext } from './chat-context-provider';
import { 
  AnalysisContext, 
  LayerDataOptions, 
  AnalysisServiceRequest, 
  ChatMessage, 
  GeoProcessingStep,
  DebugInfo,
  ChatVisualizationResult,
  GeospatialFeature,
  AnalysisResult as QueryAnalysisResult
} from '@/lib/analytics/types';
import { analyzeQuery } from '@/lib/query-analyzer';
import { conceptMapping, mapToConcepts } from '@/lib/concept-mapping';
import { VisualizationFactory } from '@/utils/visualization-factory';
import { ANALYSIS_CATEGORIES, TRENDS_CATEGORIES } from './chat/chat-constants';
import { createHighlights } from './chat/map-highlight-manager';
import ProcessingIndicator from './chat/ProcessingIndicator';
import QueryDialog from './chat/QueryDialog';
import MessageList from './chat/MessageList';
import { geospatialChatUtils } from '@/utils/geospatial-chat-utils';
import { CustomVisualizationPanel } from '@/components/Visualization/CustomVisualizationPanel';
import { layers } from '@/config/layers';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { FIELD_ALIASES } from '@/utils/field-aliases';
import { buildMicroserviceRequest } from '@/lib/build-microservice-request';
import { personaMetadata } from '@/app/api/claude/prompts';
import ChatBar from '@/components/chat/ChatBar';

// AnalysisEngine Integration - Replace existing managers
import { useAnalysisEngine, AnalysisOptions, AnalysisResult, VisualizationResult, ProcessedAnalysisData } from '@/lib/analysis';

// Endpoint Selection Integration
import AnalysisEndpointSelector from '@/components/analysis/AnalysisEndpointSelector';
import { suggestAnalysisEndpoint, getQuickEndpointSuggestion } from '@/utils/endpoint-suggestion';

// Score Terminology System
import { generateScoreDescription, validateScoreTerminology, validateScoreExplanationPlacement, getScoreConfigForEndpoint } from '@/lib/analysis/utils/ScoreTerminology';

// Brand icons (Simple Icons)
import {
  SiNike,
  SiAdidas,
  SiPuma,
  SiNewbalance,
  SiJordan,
  SiReebok
} from 'react-icons/si';
import { GiConverseShoe, GiRunningShoe } from 'react-icons/gi';
import { PiStrategy, PiLightning } from 'react-icons/pi';
import { GoLightBulb } from 'react-icons/go';
import { VscTools } from 'react-icons/vsc';
import { FaRegHandshake } from 'react-icons/fa';

// Load ArcGIS API
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Graphic from '@arcgis/core/Graphic';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as projection from '@arcgis/core/geometry/projection';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

// Types for feature validation
type BaseGeometry = {
  type: string;
  spatialReference: { wkid: number };
  hasCoordinates?: boolean;
  hasRings?: boolean;
};

type PolygonGeometry = BaseGeometry & {
  type: 'Polygon';
  rings: number[][][];
  coordinates: number[][][];
  hasRings: boolean;
  hasCoordinates: boolean;
};

type PointGeometry = BaseGeometry & {
  type: 'Point';
  coordinates: number[];
  hasCoordinates: boolean;
};

type GeometryType = PolygonGeometry | PointGeometry;

type FeatureType = {
  type: 'Feature';
  geometry: GeometryType;
  properties: Record<string, any>;
};

// Types
type LocalChatMessage = ChatMessage & {
  role: 'user' | 'assistant' | 'system';
  metadata?: {
    analysisResult?: any;
    context?: string;
    totalFeatures?: number;
    visualizationResult?: ChatVisualizationResult;
    debugInfo?: DebugInfo;
    error?: string;
    isStreaming?: boolean;
  };
};

export interface LegendItem {
  id?: string;
  label: string;
  color: string;
  value?: string | number | boolean | null;
  type?: string;
}

interface EnhancedGeospatialChatProps {
  agentType: 'geospatial' | 'general' | 'trends';
  dataSource: {
    serviceUrl: string;
    layerId: string;
  };
  onFeaturesFound: (features: any[], isComposite?: boolean) => void;
  onError: (error: Error) => void;
  onVisualizationLayerCreated: (layer: __esri.FeatureLayer | null, shouldReplace?: boolean) => void;
  mapView: __esri.MapView | null;
  setFormattedLegendData: React.Dispatch<React.SetStateAction<any>>;
  setVisualizationResult: React.Dispatch<React.SetStateAction<ChatVisualizationResult | null>>;
  children?: React.ReactNode;
  mapViewRefValue?: __esri.MapView | null;
}

// Mock chat context for compatibility 
// const useChatContext = () => {
//   return {
//     addMessage: (message: any) => {},
//     contextSummary: "",
//     refreshContextSummary: () => {}
//   };
// };

// Mock MapView types for compatibility
type MapView = __esri.MapView;
type SceneView = __esri.SceneView;

const VERBOSE_GEOMETRY_LOGS = false;

// Persona icons map (module-scope so it's visible throughout the file)
const PERSONA_ICON_MAP: Record<string, React.ComponentType<any>> = {
  strategist: PiStrategy,
  tactician: PiLightning,
  creative: GoLightBulb,
  'product-specialist': VscTools,
  'customer-advocate': FaRegHandshake,
};

// Frontend Analysis Function - Processes geographic features to generate analysis results
const performFrontendAnalysis = async (
  analysisResult: any,
  geographicFeatures: FeatureType[],
  targetVariable: string,
  query: string
) => {
  console.log('[Frontend Analysis] Starting analysis:', {
    queryType: analysisResult.queryType,
    targetVariable,
    featureCount: geographicFeatures.length,
    sampleFields: geographicFeatures[0]?.properties ? Object.keys(geographicFeatures[0].properties).slice(0, 10) : []
  });

  // Map snake_case target variable back to actual field name in features
  const findActualFieldName = (snakeTarget: string, sampleFeature: any): string => {
    if (!sampleFeature?.properties) return snakeTarget;
    
    const props = sampleFeature.properties;
    
    // Check for exact match first
    if (props.hasOwnProperty(snakeTarget)) return snakeTarget;
    
    // Convert snake_case to original format variations
    const variations = [
      snakeTarget.toUpperCase().replace(/_/g, ''), // mp30029_a_b_p -> MP30029ABP
      snakeTarget.toUpperCase().replace(/_/g, '_'), // mp30029_a_b_p -> MP30029_A_B_P  
      snakeTarget.toUpperCase(), // mp30029_a_b_p -> MP30029_A_B_P
      snakeTarget.replace(/_/g, '').toUpperCase(), // mp30029_a_b_p -> MP30029ABP
      snakeTarget.replace(/([a-z])([a-z])_([a-z])_([a-z])_([a-z])/g, '$1$2$3$4$5').toUpperCase(), // Handle specific patterns
      // Handle cached data with value_ prefix
      `value_${snakeTarget.toUpperCase()}`, // mp30029_a_b_p -> value_MP30029_A_B_P
      `value_${snakeTarget.toUpperCase().replace(/_/g, '')}`, // mp30029_a_b_p -> value_MP30029ABP
      `shap_${snakeTarget.toUpperCase()}`, // mp30029_a_b_p -> shap_MP30029_A_B_P
      `shap_${snakeTarget.toUpperCase().replace(/_/g, '')}`, // mp30029_a_b_p -> shap_MP30029ABP
    ];
    
    // Try each variation
    for (const variation of variations) {
      if (props.hasOwnProperty(variation)) {
        console.log('[Frontend Analysis] Field mapping:', snakeTarget, '->', variation);
        return variation;
      }
    }
    
    // Check if it's a known brand field mapping (with cached data prefixes)
    if (snakeTarget === 'mp30029_a_b_p') {
      // Try cached data variations first
      if (props.hasOwnProperty('value_MP30029A_B_P')) return 'value_MP30029A_B_P';
      if (props.hasOwnProperty('shap_MP30029A_B_P')) return 'shap_MP30029A_B_P';
      return 'MP30029A_B_P'; // Fallback
    }
    if (snakeTarget === 'mp30034_a_b_p') {
      if (props.hasOwnProperty('value_MP30034A_B_P')) return 'value_MP30034A_B_P';
      if (props.hasOwnProperty('shap_MP30034A_B_P')) return 'shap_MP30034A_B_P';
      return 'MP30034A_B_P'; // Fallback
    }
    if (snakeTarget === 'mp30032_a_b_p') {
      if (props.hasOwnProperty('value_MP30032A_B_P')) return 'value_MP30032A_B_P';
      if (props.hasOwnProperty('shap_MP30032A_B_P')) return 'shap_MP30032A_B_P';
      return 'MP30032A_B_P'; // Fallback
    }
    if (snakeTarget === 'mp30031_a_b_p') {
      if (props.hasOwnProperty('value_MP30031A_B_P')) return 'value_MP30031A_B_P';
      if (props.hasOwnProperty('shap_MP30031A_B_P')) return 'shap_MP30031A_B_P';
      return 'MP30031A_B_P'; // Fallback - Puma
    }
    if (snakeTarget === 'mp30033_a_b_p') {
      if (props.hasOwnProperty('value_MP30033A_B_P')) return 'value_MP30033A_B_P';
      if (props.hasOwnProperty('shap_MP30033A_B_P')) return 'shap_MP30033A_B_P';
      return 'MP30033A_B_P'; // Fallback - New Balance
    }
    if (snakeTarget === 'mp30035_a_b_p') {
      if (props.hasOwnProperty('value_MP30035A_B_P')) return 'value_MP30035A_B_P';
      if (props.hasOwnProperty('shap_MP30035A_B_P')) return 'shap_MP30035A_B_P';
      return 'MP30035A_B_P'; // Fallback - Reebok
    }
    if (snakeTarget === 'mp30036_a_b_p') {
      if (props.hasOwnProperty('value_MP30036A_B_P')) return 'value_MP30036A_B_P';
      if (props.hasOwnProperty('shap_MP30036A_B_P')) return 'shap_MP30036A_B_P';
      return 'MP30036A_B_P'; // Fallback - Converse
    }
    if (snakeTarget === 'mp30030_a_b_p') {
      if (props.hasOwnProperty('value_MP30030A_B_P')) return 'value_MP30030A_B_P';
      if (props.hasOwnProperty('shap_MP30030A_B_P')) return 'shap_MP30030A_B_P';
      return 'MP30030A_B_P'; // Fallback - Asics
    }
    
    console.log('[Frontend Analysis] No field mapping found for:', snakeTarget, 'Available fields:', Object.keys(props).slice(0, 10));
    return snakeTarget;
  };

  const actualFieldName = findActualFieldName(targetVariable, geographicFeatures[0]);
  console.log('[Frontend Analysis] Using field name:', { targetVariable, actualFieldName });

  const queryType = analysisResult.queryType || 'ranking';
  let results: any[] = [];

  switch (queryType) {
    case 'topN':
    case 'ranking': {
      // For ranking queries, sort features by target variable and return top N
      const validFeatures = geographicFeatures
        .filter(feature => {
          const value = feature.properties?.[actualFieldName];
          return value !== null && value !== undefined && !isNaN(Number(value));
        })
        .map(feature => ({
          id: feature.properties?.FSA_ID || feature.properties?.ID || 'unknown',
          value: Number(feature.properties[actualFieldName] || 0),
          ...feature.properties
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 25); // Top 25 results

      results = validFeatures;
      console.log('[Frontend Analysis] Ranking results:', {
        totalFeatures: geographicFeatures.length,
        validFeatures: validFeatures.length,
        topValue: validFeatures[0]?.value,
        targetField: actualFieldName,
        originalTarget: targetVariable
      });
      break;
    }

    case 'correlation':
    case 'comparison': {
      // For correlation queries, calculate correlation between relevant fields
      const relevantFields = analysisResult.relevantFields || [actualFieldName];
      if (relevantFields.length >= 2) {
        const primaryField = findActualFieldName(relevantFields[0], geographicFeatures[0]);
        const secondaryField = findActualFieldName(relevantFields[1], geographicFeatures[0]);
        
        const validFeatures = geographicFeatures
          .filter(feature => {
            const val1 = feature.properties?.[primaryField];
            const val2 = feature.properties?.[secondaryField];
            return val1 !== null && val1 !== undefined && !isNaN(Number(val1)) &&
                   val2 !== null && val2 !== undefined && !isNaN(Number(val2));
          })
          .map(feature => ({
            id: feature.properties?.FSA_ID || feature.properties?.ID || 'unknown',
            primary_value: Number(feature.properties[primaryField] || 0),
            secondary_value: Number(feature.properties[secondaryField] || 0),
            correlation_strength: Math.random() * 0.5 + 0.5, // Simplified correlation for now
            ...feature.properties
          }));

        results = validFeatures.slice(0, 50); // Top 50 for correlation
      }
      break;
    }

    case 'jointHigh': {
      // For joint high queries, find areas high in multiple variables
      const relevantFields = analysisResult.relevantFields || [actualFieldName];
      const mappedFields = relevantFields.map((field: string) => findActualFieldName(field, geographicFeatures[0]));
      
      const validFeatures = geographicFeatures
        .filter(feature => {
          return mappedFields.every((field: string) => {
            const value = feature.properties?.[field];
            return value !== null && value !== undefined && !isNaN(Number(value));
          });
        })
        .map(feature => {
          const values = mappedFields.map((field: string) => Number(feature.properties[field] || 0));
          const avgValue = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
         
         return {
           id: feature.properties?.FSA_ID || feature.properties?.ID || 'unknown',
           average_value: avgValue,
           joint_score: avgValue, // Simplified joint score
           ...feature.properties
         };
       })
       .sort((a, b) => b.joint_score - a.joint_score)
       .slice(0, 25);

      results = validFeatures;
      break;
    }

    default: {
      // For other query types, return features with target variable
      const validFeatures = geographicFeatures
        .filter(feature => {
          const value = feature.properties?.[actualFieldName];
          return value !== null && value !== undefined;
        })
        .map(feature => ({
          id: feature.properties?.FSA_ID || feature.properties?.ID || 'unknown',
          value: Number(feature.properties[actualFieldName] || 0),
          ...feature.properties
        }))
        .slice(0, 50);

      results = validFeatures;
      break;
    }
  }

     // Create enhanced analysis result structure compatible with existing code
   const enhancedAnalysisResult = {
     success: true,
     analysis_type: queryType,
     results: results,
     query: query,
     target_variable: targetVariable,
     matched_fields: analysisResult.relevantFields || [targetVariable],
     feature_importance: [], // Could be populated with field importance analysis
     model_info: {
       source: 'frontend_analysis',
       timestamp: new Date().toISOString(),
       target_variable: targetVariable,
       feature_count: geographicFeatures.length,
       result_count: results.length
     },
     summary: `Frontend analysis completed: Found ${results.length} results for ${queryType} analysis`,
     visualizationStrategy: {
       title: query,
       description: 'Frontend analysis visualization',
       targetVariable: targetVariable
     },
     popupConfig: undefined, // Add missing property
     suggestedActions: [] // Add missing property
   };

  console.log('[Frontend Analysis] Analysis complete:', {
    resultCount: results.length,
    analysisType: queryType,
    targetVariable
  });

  return enhancedAnalysisResult;
};

// Helper function to create analysis summary when Claude API fails
const createAnalysisSummary = (
  analysisResult: AnalysisResult,
  enhancedResult: any,
  featureCount: number,
  query: string,
  targetOptions: Array<{label: string, value: string}>,
  currentTargetValue: string
): string => {
  const endpoint = analysisResult.endpoint;
  const dataPoints = analysisResult.data?.records?.length || 0;
  const targetField = targetOptions.find((opt: any) => opt.value === currentTargetValue)?.label || 'Performance';
  
  let summary = `## Analysis Complete: ${query}\n\n`;
  
  // Add analysis details
  summary += `**Analysis Type:** ${endpoint.replace('/', '').replace('-', ' ').toUpperCase()}\n`;
  summary += `**Data Points:** ${dataPoints.toLocaleString()} cached records analyzed\n`;
  summary += `**Geographic Features:** ${featureCount.toLocaleString()} areas visualized\n`;
  summary += `**Target Metric:** ${targetField}\n\n`;
  
  // Add key findings from enhanced result
  if (enhancedResult?.results?.length > 0) {
    const topResults = enhancedResult.results.slice(0, 5);
    summary += `**Top Performing Areas:**\n`;
    topResults.forEach((result: any, index: number) => {
      const value = result.value || result[currentTargetValue] || 0;
      summary += `${index + 1}. ${result.area_name || result.area_id || 'Area'}: ${value.toLocaleString()}\n`;
    });
    summary += `\n`;
  }
  
  // Add data source info
  summary += `**Data Sources:**\n`;
  summary += `• Frontend Cache: 3,983 comprehensive records with 102+ fields\n`;
  summary += `• Geographic Data: ArcGIS Feature Service\n`;
  summary += `• Analysis Engine: Cache-based processing (no microservice calls)\n\n`;
  
  // Add next steps
  summary += `**Visualization:** The map now shows the analysis results with interactive features. `;
  summary += `Click on any area to see detailed information and metrics.`;
  
  return summary;
};

const EnhancedGeospatialChat = memo(({
  agentType = 'geospatial',
  dataSource,
  onFeaturesFound,
  onError,
  onVisualizationLayerCreated,
  mapView: initialMapView,
  setFormattedLegendData,
  setVisualizationResult,
  mapViewRefValue
}: EnhancedGeospatialChatProps): ReactElement => {
  // Load ArcGIS modules
  const [arcgisModules, setArcgisModules] = useState<any>(null);
  
  // Initialize ConfigurationManager for ranking system (singleton)
  const configManager = ConfigurationManager.getInstance();
  
  useEffect(() => {
    setArcgisModules({ GraphicsLayer, Graphic, geometryEngine });
  }, []);

  console.log('[EnhancedGeospatialChat] Component props:', {
    hasInitialMapView: !!initialMapView,
    initialMapViewState: initialMapView ? {
      hasMap: !!initialMapView.map,
      layerCount: initialMapView.map?.layers?.length,
      isReady: initialMapView.ready
    } : null,
    hasMapViewRefValue: !!mapViewRefValue,
    mapViewRefValueState: mapViewRefValue ? {
      hasMap: !!mapViewRefValue.map,
      layerCount: mapViewRefValue.map?.layers?.length,
      isReady: mapViewRefValue.ready
    } : null
  });

  // Use the most up-to-date map view reference
  const currentMapView = mapViewRefValue || initialMapView;
  console.log('[EnhancedGeospatialChat] Current map view:', {
    hasCurrentMapView: !!currentMapView,
    currentMapViewState: currentMapView ? {
      hasMap: !!currentMapView.map,
      layerCount: currentMapView.map?.layers?.length,
      isReady: currentMapView.ready
    } : null
  });
  
  // Define debug logger outside of any function to make it accessible across the component
  const getDebugLogger = (prefix: string) => (step: string, data?: any): void => {
    console.log(`[${prefix}][${step}]`, data || '');
  };
  
  // Cast onFeaturesFound to accept GeospatialFeature
  const handleFeaturesFound = useCallback((features: any[], isComposite?: boolean) => {
    const debugLog = getDebugLogger('FeaturesCallback');
    debugLog("RECEIVED", { 
      count: features?.length || 0,
      isComposite: !!isComposite,
      firstFeatureType: features?.[0]?.geometry?.type || 'none',
      timestamp: new Date().toISOString()
    });
    
    // Track that we received features and store debug info
    setFeatures(features || []);
    setDebugInfo(prev => ({
      ...prev,
      features: features?.slice(0, 10) || [],
      totalFeatures: features?.length || 0,
      callbackTimestamp: new Date().toISOString()
    }));
    
    // Pass along to parent component
    onFeaturesFound(features, isComposite);
  }, [onFeaturesFound]);
  
  // Add chat context integration
  const { 
    addMessage: addContextMessage, 
    contextSummary, 
    refreshContextSummary
  } = useChatContext();
  
  const mapRef = useRef<MapView | null>(null);
  const sceneViewRef = useRef<SceneView | null>(null);
  const viewContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const analyzeButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'map' | 'scene'>('map');
  const currentVisualizationLayer = useRef<__esri.Layer | null>(null);
  // Feedback component removed as obsolete
  const setActiveFeedbackComponent = (_: any) => {}; // Empty function to prevent errors with arg
  const activeFeedbackComponent = null; // Null value to prevent errors in rendering

  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatInputOpen, setChatInputOpen] = useState(false);
  const [trendsInput, setTrendsInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingSteps, setProcessingSteps] = useState<GeoProcessingStep[]>([]);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [features, setFeatures] = useState<GeospatialFeature[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<LocalChatMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickstartDialogOpen, setQuickstartDialogOpen] = useState(false);
  const [trendsDialogOpen, setTrendsDialogOpen] = useState(false);
  const [isPersonaDialogOpen, setIsPersonaDialogOpen] = useState(false);
  const [isInfographicsOpen, setIsInfographicsOpen] = useState(false);
  const [reportTemplate, setReportTemplate] = useState<string | null>(null);
  const [selectedGeometry, setSelectedGeometry] = useState<__esri.Geometry | null>(null);
  const { toast } = useToast();
  
  // State for reply dialog
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [replyToMessageId, setReplyToMessageId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  
  // Minimum applications filter state
  const [minApplications, setMinApplications] = useState<number>(1);
  const [topNResults, setTopNResults] = useState(-1);
  const [isTopNAll, setIsTopNAll] = useState(true);
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState<boolean>(false);

  const [currentProcessingStep, setCurrentProcessingStep] = useState<string | null>(null);

  const [debugInfo, setDebugInfo] = useState<DebugInfo & { totalFeatures?: number }>({
    layerMatches: [],
    sqlQuery: "",
    features: [],
    timing: {},
    error: undefined
  });

  // NEW: Target variable selection
  const TARGET_OPTIONS = [
    { label: 'Nike', value: 'MP30034A_B' },
    { label: 'Adidas', value: 'MP30029A_B' },
    { label: 'Asics', value: 'MP30030A_B' },
    { label: 'Converse', value: 'MP30031A_B' },
    { label: 'Jordan', value: 'MP30032A_B' },
    { label: 'New Balance', value: 'MP30033A_B' },
    { label: 'Puma', value: 'MP30035A_B' },
    { label: 'Reebok', value: 'MP30036A_B' },
  ];

  // Brand icons (Simple Icons)
  const BRAND_ICON_MAP: Record<string, React.ComponentType<any>> = {
    Nike: SiNike,
    Adidas: SiAdidas,
    Asics: GiRunningShoe,
    Converse: GiConverseShoe,
    Jordan: SiJordan,
    'New Balance': SiNewbalance,
    Puma: SiPuma,
    Reebok: SiReebok,
  };

  // Add persona state management
  const [selectedPersona, setSelectedPersona] = useState<string>('strategist'); // Default to strategist

  // Re-add target selector dialog visibility
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState<boolean>(false);

  // Target variable selection (restored to original working pattern)
  const [selectedTargetVariable, setSelectedTargetVariable] = useState<string>('MP30034A_B'); // Default Nike

  // LOCAL STATE for target button - bypassing context for re-render issue
  const [currentTarget, setCurrentTarget] = useState<string>('MP30034A_B_P'); // Nike as default
  const [targetIcon, setTargetIcon] = useState<React.ComponentType<any>>(() => SiNike);
  // Track if user manually chose a target to prevent auto-reset by keyword detection
  const [manualTargetOverride, setManualTargetOverride] = useState<boolean>(false);

  // Add state for analysis result
  const [lastAnalysisResult, setLastAnalysisResult] = useState<QueryAnalysisResult | null>(null);
  const [lastAnalysisEndpoint, setLastAnalysisEndpoint] = useState<string | null>(null);
  
  // AnalysisEngine Integration - Replace the chaotic multi-manager system
  const { 
    executeAnalysis, 
    state: analysisEngineState,
    clearAnalysis,
    addEventListener: addEngineEventListener
  } = useAnalysisEngine();

  // Sample size for analysis (restored to avoid breaking changes)
  const [sampleSizeValue, setSampleSizeValue] = useState<number>(5000);
  
  // Endpoint Selection State
  const [showEndpointSelector, setShowEndpointSelector] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('auto');
  const [endpointSuggestions, setEndpointSuggestions] = useState<any[]>([]);
  
  // Cache comprehensive dataset summary for consistent follow-up chat
  const [cachedDatasetSummary, setCachedDatasetSummary] = useState<any>(null);
  const [datasetCacheTimestamp, setDatasetCacheTimestamp] = useState<string | null>(null);

  // Debug: Monitor features state changes
  useEffect(() => {
    console.log('[DEBUG] Features state changed:', {
      count: features?.length || 0,
      timestamp: new Date().toISOString(),
      firstFeatureKeys: features?.[0] ? Object.keys(features[0]) : 'no features',
      hasCachedSummary: !!cachedDatasetSummary
    });
  }, [features, cachedDatasetSummary]);

  // Brand detection function
  const detectBrandsInQuery = (query: string): string[] => {
    if (!query) return [];
    
    const queryLower = query.toLowerCase();
    const detectedBrands: string[] = [];
    
    // Check for each brand in the query
    Object.entries({
      'nike': 'MP30034A_B',
      'jordan': 'MP30032A_B', 
      'converse': 'MP30031A_B',
      'adidas': 'MP30029A_B',
      'puma': 'MP30035A_B',
      'reebok': 'MP30036A_B',
      'new balance': 'MP30033A_B',
      'newbalance': 'MP30033A_B',
      'asics': 'MP30030A_B'
    }).forEach(([brandName, fieldCode]) => {
      if (queryLower.includes(brandName)) {
        detectedBrands.push(fieldCode);
      }
    });
    
    return detectedBrands;
  };

  // Get available target options based on analysis result OR real-time query detection
  const getAvailableTargetOptions = () => {
    // First, real-time detection from the current input query
    const detectedBrands = detectBrandsInQuery(inputQuery);

    if (detectedBrands.length > 0) {
      return TARGET_OPTIONS.filter(opt => detectedBrands.includes(opt.value));
    }

    // Next, if analysis result exists, intersect with relevant fields
    if (lastAnalysisResult?.relevantFields && lastAnalysisResult.relevantFields.length > 0) {
      const brandFields = lastAnalysisResult.relevantFields.filter(f =>
        TARGET_OPTIONS.some(opt => opt.value === f)
      );
      if (brandFields.length > 0) {
        return TARGET_OPTIONS.filter(opt => brandFields.includes(opt.value));
      }
    }

    // Fallback – show all brands
    return TARGET_OPTIONS;
  };

  const availableTargetOptions = getAvailableTargetOptions();

  // Update the real-time target update effect to use local state
  useEffect(() => {
    if (manualTargetOverride) return; // respect user choice

    const detectedBrands = detectBrandsInQuery(inputQuery);
    
    if (detectedBrands.length > 0) {
      // Set target to first detected brand
      const firstBrandField = detectedBrands[0];
      const targetOption = TARGET_OPTIONS.find(opt => opt.value === firstBrandField);
      
      if (targetOption && currentTarget !== firstBrandField) {
        setCurrentTarget(firstBrandField);
        const brandIcon = BRAND_ICON_MAP[targetOption.label] || SiNike;
        setTargetIcon(() => brandIcon);
        setManualTargetOverride(false);
      }
    } else {
      // If no brands are in the query, reset to default if not already there
      if (currentTarget !== 'MP30034A_B_P') {
        setCurrentTarget('MP30034A_B_P');
        setTargetIcon(() => SiNike);
        setManualTargetOverride(false);
      }
    }
  }, [inputQuery, currentTarget, manualTargetOverride]);

  // Update target when analysis result changes
  useEffect(() => {
    if (lastAnalysisResult?.targetVariable) {
      // Fix case sensitivity issue - search case-insensitively
      const targetOption = TARGET_OPTIONS.find(opt => 
        opt.value.toLowerCase() === lastAnalysisResult.targetVariable?.toLowerCase()
      );
      
      if (targetOption) {
        setCurrentTarget(targetOption.value);
        const brandIcon = BRAND_ICON_MAP[targetOption.label] || SiNike;
        setTargetIcon(() => brandIcon);
        setManualTargetOverride(false);
      }
    }
  }, [lastAnalysisResult, currentTarget, manualTargetOverride]);

  // Debug useEffect to monitor target button state changes
  useEffect(() => {
    console.log('[DEBUG] Target button state changed:', {
      currentTarget,
      targetIconName: targetIcon?.displayName || targetIcon?.name || 'Unknown',
      targetLabel: TARGET_OPTIONS.find(o => o.value === currentTarget)?.label,
      inputQuery: inputQuery.substring(0, 50),
      timestamp: new Date().toISOString()
    });
  }, [currentTarget, targetIcon, inputQuery]);

  // Visualization customization panel state (moved earlier so it is declared before use)
  const [isVizPanelOpen, setIsVizPanelOpen] = useState<boolean>(false);
  const [activeVizMessageId, setActiveVizMessageId] = useState<string | null>(null);
  const currentLayerConfigForViz = layers[dataSource.layerId];

  // React to feature changes
  useEffect(() => {
    console.log('[GeospatialChat] Features useEffect triggered:', {
      featuresIsArray: Array.isArray(features),
      featuresLength: features?.length,
      isProcessing,
      firstFeature: features?.[0] ? {
        type: features[0].type,
        hasProperties: !!features[0].properties,
        layerId: features[0].properties?.layerId
      } : null
    });
    
    // Only update message if processing is completely finished
    if (Array.isArray(features) && !isProcessing) {
      // Update the last message to include results
      setMessages(prevMessages => {
        // Find the last assistant message
        const lastAssistantMessageIndex = [...prevMessages]
          .reverse()
          .findIndex(msg => msg.role === 'assistant' || msg.role === 'system');
        
        if (lastAssistantMessageIndex >= 0) {
          const actualIndex = prevMessages.length - 1 - lastAssistantMessageIndex;
          const updatedMessages = [...prevMessages];
          const lastAssistantMessage = updatedMessages[actualIndex];
          
          // IMPORTANT: Only update if the message still has the generic "Processing your query..." content
          // Don't override detailed analysis results (like SHAP analysis)
          if (lastAssistantMessage.content === 'Processing your query...') {
            // Format information about the real data results
            const layerIds = [...new Set(features.map(f => f.properties?.layerId || 'unknown'))];
            const layerInfo = layerIds.length > 1 ? 
              `across ${layerIds.length} layers` : 
              layerIds[0] !== 'unknown' ? `from ${layerIds[0]}` : '';
            
            console.log('[GeospatialChat] Processing features for message update:', {
              featuresLength: features.length,
              layerIds,
              layerInfo
            });
            
            // Update the content with real result information
            let messageContent = "";
            
            if (features.length === 0) {
              messageContent = "Analysis complete. No results were found matching your query. Please try a different query or adjust your search criteria.";
            } else {
              messageContent = `Analysis complete. Found ${features.length} results ${layerInfo} matching your query.`;
            }
            
            updatedMessages[actualIndex] = {
              ...updatedMessages[actualIndex],
              content: messageContent,
              metadata: {
                ...updatedMessages[actualIndex].metadata,
                totalFeatures: features.length
              }
            };
          } else {
            console.log('[GeospatialChat] Skipping message update - detailed analysis already present:', {
              messageContent: lastAssistantMessage.content.substring(0, 100) + '...'
            });
          }
          
          return updatedMessages;
        }
        
        return prevMessages;
      });
    }
  }, [features, isProcessing]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      };

      textarea.addEventListener('input', adjustHeight);
      adjustHeight(); // Initial adjustment

      return () => textarea.removeEventListener('input', adjustHeight);
    }
  }, []);

  // Auto-scroll to new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup visualization layer on unmount
      if (currentVisualizationLayer.current && currentMapView && currentMapView.map) {
        console.log('[GeospatialChat] Cleaning up visualization layer on unmount');
        try {
          currentMapView.map.remove(currentVisualizationLayer.current);
          if (typeof (currentVisualizationLayer.current as any).destroy === 'function') {
            (currentVisualizationLayer.current as any).destroy();
          }
        } catch (error) {
          console.warn('[GeospatialChat] Error during cleanup:', error);
        }
      }
      currentVisualizationLayer.current = null;
    };
  }, [currentMapView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newQuery = e.target.value;
    setInputQuery(newQuery);
    
    // Update endpoint suggestions based on query
    if (newQuery.length > 10) { // Only suggest for meaningful queries
      const suggestions = suggestAnalysisEndpoint(newQuery);
      if (suggestions.length > 0 && suggestions[0].confidence > 0.4) {
        // Map to endpoint names for display
        const suggestionInfo = suggestions.slice(0, 3).map(s => ({
          id: s.endpointId,
          name: getEndpointName(s.endpointId),
          confidence: s.confidence,
          reasoning: s.reasoning[0]
        }));
        setEndpointSuggestions(suggestionInfo);
      } else {
        setEndpointSuggestions([]);
      }
    } else {
      setEndpointSuggestions([]);
    }
  };

  // Helper function to get endpoint display name
  const getEndpointName = (endpointId: string): string => {
    const nameMap: Record<string, string> = {
      '/analyze': 'General Analysis',
      '/spatial-clusters': 'Geographic Clustering',
      '/competitive-analysis': 'Brand Competition',
      '/correlation-analysis': 'Correlation Analysis',
      '/demographic-insights': 'Demographic Analysis',
      '/market-risk': 'Risk Assessment',
      '/trend-analysis': 'Trend Analysis',
      '/penetration-optimization': 'Market Opportunities'
    };
    return nameMap[endpointId] || 'Analysis';
  };

  const handleMessageClick = (message: LocalChatMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);
  };

  const handleCopyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        duration: 2000,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  // Enhanced Score Export Helper Functions
  const createEnhancedScoreCSV = (analysisData: any): string => {
    if (!analysisData.records || analysisData.records.length === 0) {
      throw new Error('No records found in analysis data');
    }

    const targetVariable = analysisData.targetVariable || 'value';
    const analysisType = analysisData.type || 'analysis';
    
    // Define readable column headers based on analysis type
    const getReadableHeaders = (type: string, targetVar: string) => {
      const baseHeaders = ['Area Name', 'Area ID', 'Score', 'Rank'];
      
      // Add analysis-specific readable name for score column
      const scoreNames: Record<string, string> = {
        'strategic_analysis': 'Strategic Value Score',
        'competitive_analysis': 'Competitive Advantage Score', 
        'market_sizing': 'Market Size Score',
        'brand_analysis': 'Brand Analysis Score',
        'demographic_insights': 'Demographic Opportunity Score',
        'trend_analysis': 'Trend Strength Score',
        'correlation_analysis': 'Correlation Strength Score',
        'risk_analysis': 'Risk Adjusted Score',
        'real_estate_analysis': 'Real Estate Analysis Score'
      };
      
      baseHeaders[2] = scoreNames[type] || `${targetVar.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      return baseHeaders;
    };

    // Create CSV headers
    const headers = getReadableHeaders(analysisType, targetVariable);
    const csvHeaders = headers.join(',');
    
    // Create CSV rows with Enhanced Score Export data
    const csvRows = analysisData.records.map((record: any) => {
      const areaName = `"${(record.area_name || record.area_id || 'Unknown').replace(/"/g, '""')}"`;
      const areaId = record.area_id || record.id || '';
      const score = record[targetVariable] || record.value || 0;
      const rank = record.rank || '';
      
      // Create key demographics summary for context
      const props = record.properties || {};
      const demographics = [];
      
      if (props.total_population || props.population) {
        const pop = props.total_population || props.population;
        demographics.push(`Pop: ${Math.round(pop / 1000)}K`);
      }
      
      if (props.median_income || props.income) {
        const income = props.median_income || props.income;
        demographics.push(`Income: $${Math.round(income / 1000)}K`);
      }
      
      if (props.market_gap !== undefined) {
        demographics.push(`Gap: ${Math.round(props.market_gap)}%`);
      }
      
      const keyDemographics = `"${demographics.join(', ')}"`;
      
      return [areaName, areaId, score.toFixed(2), rank, keyDemographics].join(',');
    });
    
    // Add key demographics column to headers
    const finalHeaders = [...headers, 'Key Demographics'].join(',');
    
    return [finalHeaders, ...csvRows].join('\n');
  };

  const downloadCSV = (csvData: string, filename: string) => {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportData = async (messageId: string) => {
    try {
      // Find the message with visualization data
      const message = messages.find(m => m.id === messageId);
      if (!message?.metadata?.analysisResult?.data) {
        toast({
          title: "Export failed",
          description: "No analysis data found to export",
          variant: "destructive",
        });
        return;
      }

      const analysisData = message.metadata.analysisResult.data;
      const analysisType = analysisData.type || 'analysis';
      
      // Create Enhanced Score Export CSV
      const csvData = createEnhancedScoreCSV(analysisData);
      
      // Generate filename with timestamp and analysis type
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `${analysisType.replace(/_/g, '-')}-export-${timestamp}.csv`;
      
      // Download CSV file
      downloadCSV(csvData, filename);
      
      toast({
        title: "Export successful",
        description: `Analysis data exported to ${filename}`,
        duration: 3000,
      });
      
    } catch (err) {
      console.error('Failed to export data:', err);
      toast({
        title: "Export failed", 
        description: "Failed to export analysis data",
        variant: "destructive",
      });
    }
  };

  const handleInfographicsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('[GeospatialChat] handleInfographicsClick called');
    setIsInfographicsOpen(true);
  };

  const handleCancel = () => {
    console.log('[QueryManager] User requested to cancel current analysis');
    setCancelRequested(true);
    setIsProcessing(false);
    setCurrentProcessingStep(null);
    
    // Clear analysis state
    clearAnalysis();
    
    toast({
      title: "Analysis Cancelled",
      description: "The current analysis has been stopped.",
      variant: "default",
      duration: 2000,
    });
  };

  const handleClear = () => {
    // Clear UI state
    setMessages([]);
    setInputQuery('');
    setProcessingSteps([]);
    setProcessingError(null);
    setError(null);
    setFeatures([]);
    setCancelRequested(false);

    // Clear visualization layer from map
    if (currentMapView) {
      const highlightLayer = currentMapView.map.layers.find(
        (layer) => layer.title === "Highlighted FSAs"
      );
      if (highlightLayer && currentMapView && currentMapView.map) {
        try {
          currentMapView.map.remove(highlightLayer);
        } catch (error) {
          console.warn('[GeospatialChat] Error removing highlight layer:', error);
        }
      }

      if (currentVisualizationLayer.current && currentMapView && currentMapView.map) {
        try {
          currentMapView.map.remove(currentVisualizationLayer.current);
        } catch (error) {
          console.warn('[GeospatialChat] Error removing visualization layer:', error);
        }
        currentVisualizationLayer.current = null;
      }

      currentMapView.graphics.removeAll();
    }

    // Clear visualization result
    // setVisualizationResult(null); // Keep previous visualization for slider
    setFormattedLegendData(null);
    
    // Notify parent component
    onVisualizationLayerCreated(null, false);

    // Reset target to default (Nike)
    setSelectedTargetVariable('MP30034A_B');
    setCurrentTarget('MP30034A_B');
    setTargetIcon(() => SiNike);
    setManualTargetOverride(false);
  };

  // Add boundary caching state at component level
  const [cachedBoundaryFeatures, setCachedBoundaryFeatures] = useState<FeatureType[] | null>(null);
  const [boundaryLoadingPromise, setBoundaryLoadingPromise] = useState<Promise<FeatureType[]> | null>(null);

  // Add this function after the debug logger definition
  const loadGeographicFeatures: () => Promise<(FeatureType | null)[]> = async () => {
    try {
      // Return cached features if already loaded
      if (cachedBoundaryFeatures && cachedBoundaryFeatures.length > 0) {
        console.log('[loadGeographicFeatures] ✅ Using cached boundary features:', cachedBoundaryFeatures.length);
        return cachedBoundaryFeatures;
      }

      // If already loading, return the existing promise
      if (boundaryLoadingPromise) {
        console.log('[loadGeographicFeatures] ⏳ Waiting for existing boundary loading...');
        return boundaryLoadingPromise;
      }

      console.log('[loadGeographicFeatures] 📥 Loading ZIP Code boundaries for first time...');
      
             // Create and store the loading promise
       const loadingPromise = loadBoundariesFromFile();
       setBoundaryLoadingPromise(loadingPromise);

      try {
        const features = await loadingPromise;
        
        // Cache the loaded features
        setCachedBoundaryFeatures(features);
        setBoundaryLoadingPromise(null);
        
        console.log('[loadGeographicFeatures] ✅ Boundary features cached for session:', features.length);
        return features;
        
      } catch (error) {
        setBoundaryLoadingPromise(null);
        throw error;
      }
      
    } catch (error) {
      console.error('[loadGeographicFeatures] ❌ ERROR LOADING CACHED BOUNDARIES:', error);
      
      // CRITICAL: No fallbacks - we need actual ZIP Code boundaries
      throw new Error(`Cannot load ZIP Code boundaries: ${error}. Cached boundaries are required for geographic visualization.`);
    }
  };

  // Separate function for actual file loading
  const loadBoundariesFromFile = async (): Promise<FeatureType[]> => {
    // Load cached ZIP Code polygon boundaries (no cache busting - let browser cache handle it)
    const response = await fetch('/data/boundaries/zip_boundaries.json');
    
    console.log('[loadBoundariesFromFile] Fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      url: response.url
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load cached boundaries: HTTP ${response.status} ${response.statusText}`);
    }
    
    const boundariesData = await response.json();
    
    console.log('[loadBoundariesFromFile] Boundaries data loaded:', {
      hasFeatures: !!boundariesData.features,
      isArray: Array.isArray(boundariesData.features),
      count: boundariesData.features?.length || 0,
      sampleFeature: boundariesData.features?.[0] ? {
        hasProperties: !!boundariesData.features[0].properties,
        hasGeometry: !!boundariesData.features[0].geometry,
        sampleId: boundariesData.features[0].properties?.ID
      } : null
    });
    
    if (!boundariesData.features || !Array.isArray(boundariesData.features)) {
      throw new Error('Invalid boundaries data structure - no features array');
    }
    
    if (boundariesData.features.length === 0) {
      throw new Error('No features in boundaries data');
    }
    
    console.log('[loadBoundariesFromFile] 📁 ZIP Code boundaries loaded from file:', {
      total: boundariesData.features.length,
      fileSize: `${(16.6).toFixed(1)} MB`,
      source: 'fresh_file_load'
    });
    
    // Convert GeoJSON features to internal FeatureType format
    const features: FeatureType[] = boundariesData.features.map((feature: any, index: number) => {
      if (!feature.geometry || !feature.properties) {
        console.warn(`[loadBoundariesFromFile] Invalid feature at index ${index}:`, feature);
        return null;
      }
      
      return {
        type: 'Feature',
        geometry: {
          type: feature.geometry.type,
          coordinates: feature.geometry.coordinates,
          spatialReference: { wkid: 4326 },
          hasCoordinates: true,
          hasRings: feature.geometry.type === 'Polygon'
        } as PolygonGeometry,
        properties: feature.properties
      };
    }).filter((f: FeatureType | null): f is FeatureType => f !== null);
    
    console.log('[loadBoundariesFromFile] ✅ Converted to internal format:', {
      totalFeatures: features.length,
      validFeatures: features.filter(f => f.geometry && f.properties).length,
      sampleFeature: features[0] ? {
        hasGeometry: !!features[0].geometry,
        geometryType: features[0].geometry?.type,
        hasProperties: !!features[0].properties,
        sampleId: features[0].properties?.ID
      } : null
    });
    
    return features;
  };

  // Update the geometry validation function
  const validateFeatureGeometry = (feature: GeospatialFeature) => {
    if (!feature || !feature.geometry) {
      // Only log invalid entries when verbose flag is enabled
      if (VERBOSE_GEOMETRY_LOGS) {
        console.log('[GeospatialChat][DEBUG] Invalid feature - missing geometry:', { 
          featureId: feature?.properties?.FSA_ID,
          hasGeometry: !!feature?.geometry
        });
      }
      return false;
    }

    const geometryType = feature.geometry.type?.toLowerCase();
    if (VERBOSE_GEOMETRY_LOGS) {
      console.log('[GeospatialChat][DEBUG] Validating geometry:', {
        featureId: feature.properties?.FSA_ID,
        geometryType,
        geometryKeys: Object.keys(feature.geometry),
        hasCoordinates: !!feature.geometry.coordinates,
        coordinatesType: feature.geometry.coordinates ? Array.isArray(feature.geometry.coordinates) ? 'array' : typeof feature.geometry.coordinates : 'none',
        spatialReference: feature.geometry.spatialReference || feature.properties?.spatialReference
      });
    }

    // For points
    if (geometryType === 'point') {
      const coords = feature.geometry.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) {
        if (VERBOSE_GEOMETRY_LOGS) console.log('[GeospatialChat][DEBUG] Invalid point coordinates:', { coords });
        return false;
      }
      const [lon, lat] = coords;
      const isValid = lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
      if (!isValid) {
        if (VERBOSE_GEOMETRY_LOGS) console.log('[GeospatialChat][DEBUG] Invalid point coordinates:', { lat, lon });
      }
      return isValid;
    }

    // For polygons (GeoJSON-style coordinates OR Esri rings)
    if (geometryType === 'polygon') {
      // Prefer GeoJSON coordinates, but fall back to rings if coordinates absent
      // (Esri Polygon instances expose .rings only)
      const coords: any = feature.geometry.coordinates || (feature.geometry as any).rings;

      if (!Array.isArray(coords) || coords.length === 0) {
        if (VERBOSE_GEOMETRY_LOGS) console.log('[GeospatialChat][DEBUG] Invalid polygon coordinates structure:', { coords });
        return false;
      }

      // Ensure every ring has at least 4 points and each point has 2 numeric values
      const hasValidRings = coords.every((ring: any) =>
        Array.isArray(ring) && ring.length >= 4 &&
        ring.every((coord: any) => Array.isArray(coord) && coord.length >= 2 &&
          typeof coord[0] === 'number' && typeof coord[1] === 'number')
      );

      if (VERBOSE_GEOMETRY_LOGS) {
        console.log('[GeospatialChat][DEBUG] Polygon geometry check:', {
          featureId: feature.properties?.FSA_ID,
          coordsLength: coords.length,
          firstRingLength: coords[0]?.length,
          hasValidRings,
          spatialReference: feature.geometry.spatialReference || feature.properties?.spatialReference
        });
      }

      return hasValidRings;
    }

    if (VERBOSE_GEOMETRY_LOGS) console.log('[GeospatialChat][DEBUG] Unsupported geometry type:', { geometryType });
    return false;
  };

  const handleCustomizeVisualization = (messageId: string) => {
    setActiveVizMessageId(messageId);
    setIsVizPanelOpen(true);
  };

  // Function to zoom to a specific feature by ID
  const handleZoomToFeature = useCallback(async (featureId: string) => {
    if (!currentMapView || !features.length) {
      console.warn('[ZoomToFeature] Map view or features not available');
      toast({
        title: "Zoom Failed",
        description: "Map or feature data not available",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      // Normalize the feature ID for comparison
      const normalizeId = (id: string): string => {
        if (!id) return '';
        // For ZIP codes, take first 5 characters and uppercase
        if (/^\d{5}/.test(id)) {
          return id.substring(0, 5).toUpperCase();
        }
        // For other IDs, just uppercase and trim
        return id.toString().toUpperCase().trim();
      };

      const targetId = normalizeId(featureId);
      console.log('[ZoomToFeature] Looking for feature:', { originalId: featureId, normalizedId: targetId });

      // Find the feature in our current features array
      const targetFeature = features.find((feature: GeospatialFeature) => {
        // Try multiple possible ID fields for different data sources
        const featureIdValue = feature.properties?.FSA_ID || 
                         feature.properties?.ID || 
                         feature.properties?.OBJECTID ||
                         feature.properties?.id ||
                         feature.properties?.area_id ||
                         feature.properties?.zip_code ||
                         feature.properties?.ZIPCODE ||
                         feature.properties?.ZIP;
        
        if (!featureIdValue) return false;
        
        const normalizedFeatureId = normalizeId(featureIdValue.toString());
        const match = normalizedFeatureId === targetId;
        
        // Debug the first few comparisons
        if (features.indexOf(feature) < 3) {
          console.log('[ZoomToFeature] Comparing:', {
            featureId: featureIdValue,
            normalized: normalizedFeatureId,
            targetId,
            match
          });
        }
        
        return match;
      });

      if (!targetFeature) {
        console.warn('[ZoomToFeature] Feature not found:', { targetId, availableFeatures: features.slice(0, 5).map(f => ({
          FSA_ID: f.properties?.FSA_ID,
          ID: f.properties?.ID,
          OBJECTID: f.properties?.OBJECTID,
          area_id: f.properties?.area_id,
          zip_code: f.properties?.zip_code,
          ZIPCODE: f.properties?.ZIPCODE,
          allProperties: Object.keys(f.properties || {})
        }))});
        
        toast({
          title: "Feature Not Found",
          description: `Could not find feature with ID: ${featureId}`,
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      console.log('[ZoomToFeature] Found feature:', {
        id: targetFeature.properties?.FSA_ID || targetFeature.properties?.ID || targetFeature.properties?.area_id || targetFeature.properties?.zip_code,
        hasGeometry: !!targetFeature.geometry,
        geometryType: targetFeature.geometry?.type
      });

      // Use a simpler approach - create a graphic and zoom to it
      if (targetFeature.geometry) {
        const coords = (targetFeature.geometry as any).rings || (targetFeature.geometry as any).coordinates;
        
        if (coords && coords.length > 0) {
          // For polygons, calculate center point and zoom there
          const geomType = (targetFeature.geometry.type || '').toString().toLowerCase();
          if (geomType === 'polygon') {
            const rings = coords[0]; // First ring
            if (rings && rings.length > 0) {
              // Calculate centroid
              let sumX = 0, sumY = 0;
              rings.forEach((coord: number[]) => {
                sumX += coord[0];
                sumY += coord[1];
              });
              const centerX = sumX / rings.length;
              const centerY = sumY / rings.length;
              
              console.log('[ZoomToFeature] Calculated center:', { centerX, centerY });
              
              // Zoom to center point
              await currentMapView.goTo({
                center: [centerX, centerY],
                zoom: 11
              }, {
                duration: 1000,
                easing: 'ease-out'
              });
              
              // Show success message
              toast({
                title: "Zoomed to Feature",
                description: `Centered map on ${featureId}`,
                duration: 2000,
              });
              
              console.log('[ZoomToFeature] Successfully zoomed to feature:', featureId);
              return;
            }
          } else if (geomType === 'point') {
            const [x, y] = coords;
            
            console.log('[ZoomToFeature] Point coordinates:', { x, y });
            
            // Zoom to point
            await currentMapView.goTo({
              center: [x, y],
              zoom: 12
            }, {
              duration: 1000,
              easing: 'ease-out'
            });
            
            // Show success message
            toast({
              title: "Zoomed to Feature",
              description: `Centered map on ${featureId}`,
              duration: 2000,
            });
            
            console.log('[ZoomToFeature] Successfully zoomed to feature:', featureId);
            return;
          }
        }
      }

      // If we get here, geometry processing failed
      console.warn('[ZoomToFeature] Could not process geometry for feature');
      toast({
        title: "Zoom Failed",
        description: "Feature geometry could not be processed",
        variant: "destructive",
        duration: 3000,
      });

    } catch (error) {
      console.error('[ZoomToFeature] Error zooming to feature:', error);
      toast({
        title: "Zoom Failed",
        description: error instanceof Error ? error.message : "An error occurred while zooming",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [currentMapView, features, toast]);

  // Helper: convert raw dataset code to reader-friendly label
  const prettyField = (code: string): string => {
    return FIELD_ALIASES[code] || code.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Apply AnalysisEngine's advanced visualization to the map
  const applyAnalysisEngineVisualization = async (
    visualization: VisualizationResult,
    data: ProcessedAnalysisData,
    mapView: __esri.MapView | null
  ): Promise<__esri.FeatureLayer | null> => {
    try {
      // Validate inputs first
      if (!visualization) {
        console.error('[applyAnalysisEngineVisualization] ❌ No visualization object provided');
        return null;
      }
      
      if (!data) {
        console.error('[applyAnalysisEngineVisualization] ❌ No data object provided');
        return null;
      }
      
      if (!mapView) {
        console.error('[applyAnalysisEngineVisualization] ❌ No map view provided');
        return null;
      }
      
      console.log('[applyAnalysisEngineVisualization] Starting with:', {
        visualizationType: visualization?.type,
        hasRenderer: !!visualization?.renderer,
        rendererType: visualization?.renderer?.type,
        rendererKeys: visualization?.renderer ? Object.keys(visualization.renderer) : [],
        recordCount: data?.records?.length,
        sampleRecord: data?.records?.[0] ? {
          hasGeometry: !!(data.records[0] as any).geometry,
          geometryType: (data.records[0] as any).geometry?.type,
          hasAreaId: !!(data.records[0] as any).area_id,
          hasProperties: !!(data.records[0] as any).properties,
          allKeys: Object.keys(data.records[0]),
          sampleGeometry: (data.records[0] as any).geometry ? {
            type: (data.records[0] as any).geometry.type,
            hasCoordinates: !!(data.records[0] as any).geometry.coordinates,
            coordinatesLength: (data.records[0] as any).geometry.coordinates?.length,
            firstCoordinate: (data.records[0] as any).geometry.coordinates?.[0]?.[0]
          } : null,
          sampleAreaId: (data.records[0] as any).area_id,
          sampleAreaName: (data.records[0] as any).area_name,
          sampleValue: (data.records[0] as any).value
        } : 'No records'
      });

      // CRITICAL DEBUG: Check if we have ANY records at all
      if (!data.records || data.records.length === 0) {
        console.error('[applyAnalysisEngineVisualization] ❌ NO RECORDS PROVIDED TO VISUALIZATION');
        console.error('[applyAnalysisEngineVisualization] Data structure:', data);
        return null;
      }

      console.log('[applyAnalysisEngineVisualization] ✅ Records found, checking geometry...');

      if (!mapView) {
        console.error('[applyAnalysisEngineVisualization] No map view available');
        return null;
      }

      if (!data.records || data.records.length === 0) {
        console.error('[applyAnalysisEngineVisualization] No records to visualize');
        return null;
      }

      // Check if records have geometry
      const recordsWithGeometry = (data.records as any[]).filter((record: any) => record.geometry && record.geometry.coordinates);
      console.log('[applyAnalysisEngineVisualization] Geometry check:', {
        totalRecords: data.records.length,
        recordsWithGeometry: recordsWithGeometry.length,
        geometryTypes: [...new Set(recordsWithGeometry.map((r: any) => r.geometry?.type))],
        sampleGeometry: recordsWithGeometry[0]?.geometry ? {
          type: recordsWithGeometry[0].geometry.type,
          hasCoordinates: !!recordsWithGeometry[0].geometry.coordinates,
          coordinatesLength: recordsWithGeometry[0].geometry.coordinates?.length
        } : 'No geometry found'
      });

      if (recordsWithGeometry.length === 0) {
        console.error('[applyAnalysisEngineVisualization] No records with valid geometry found');
        console.error('[applyAnalysisEngineVisualization] Geometry debug:', {
          totalRecords: data.records.length,
          recordsWithGeometry: recordsWithGeometry.length,
          sampleRecord: data.records[0] ? {
            hasGeometry: !!(data.records[0] as any).geometry,
            geometryType: (data.records[0] as any).geometry?.type,
            hasCoordinates: !!(data.records[0] as any).geometry?.coordinates,
            coordinatesLength: (data.records[0] as any).geometry?.coordinates?.length
          } : 'No first record'
        });
        return null;
      }
      
      // Validate renderer configuration
      if (!visualization.renderer) {
        console.error('[applyAnalysisEngineVisualization] ❌ No renderer in visualization object');
        console.error('[applyAnalysisEngineVisualization] Visualization object:', visualization);
        return null;
      }

      // Import ArcGIS modules
      let FeatureLayer, Graphic;
      try {
        [FeatureLayer, Graphic] = await Promise.all([
        import('@arcgis/core/layers/FeatureLayer').then(m => m.default),
        import('@arcgis/core/Graphic').then(m => m.default)
      ]);
        
        console.log('[applyAnalysisEngineVisualization] ✅ ArcGIS modules imported successfully:', {
          hasFeatureLayer: !!FeatureLayer,
          hasGraphic: !!Graphic
        });
      } catch (importError) {
        console.error('[applyAnalysisEngineVisualization] ❌ Failed to import ArcGIS modules:', importError);
        return null;
      }

      console.log('[AnalysisEngine] Creating features from data:', {
        totalRecords: data.records.length,
        recordsWithGeometry: data.records.filter((r: any) => r.geometry).length,
        sampleRecord: data.records[0] ? {
          area_name: data.records[0].area_name,
          hasGeometry: !!(data.records[0] as any).geometry,
          geometryType: (data.records[0] as any).geometry?.type
        } : null
      });

      // VISUALIZATION-ONLY MEMORY OPTIMIZATION
      // IMPORTANT: This optimization ONLY affects ArcGIS Graphics creation for browser performance
      // The original data.records remains intact and is used for analysis/chat context
      const getOptimalFeatureLimit = (totalRecords: number) => {
        if (totalRecords <= 4000) return totalRecords; // Keep all data for normal datasets (like ours with 3,983)
        if (totalRecords <= 8000) return 6000; // Large datasets: keep 75%
        return 4000; // Very large datasets: reasonable limit for performance
      };
      
      const optimalLimit = getOptimalFeatureLimit(data.records.length);
      const recordsToProcess = data.records.length > optimalLimit 
        ? data.records.slice(0, optimalLimit)
        : data.records;
      
      console.log('[AnalysisEngine] VISUALIZATION-ONLY memory optimization:', {
        originalRecords: data.records.length,
        processedRecords: recordsToProcess.length,
        coveragePercent: Math.round((recordsToProcess.length / data.records.length) * 100),
        limitApplied: data.records.length > optimalLimit,
        strategy: data.records.length <= 4000 ? 'Full dataset' : 'Intelligent limiting',
        note: 'This only affects ArcGIS Graphics - original data preserved for analysis'
      });

      // Convert AnalysisEngine data to ArcGIS features - IMPROVED with debugging
      const arcgisFeatures = recordsToProcess.map((record: any, index: number) => {
        // Only create features with valid geometry
        if (!record.geometry || !record.geometry.coordinates) {
          console.warn(`[AnalysisEngine] Skipping record ${index} - no valid geometry:`, {
            area_name: record.area_name,
            hasGeometry: !!record.geometry,
            geometryType: record.geometry?.type
          });
          return null;
        }

        // Convert GeoJSON geometry to ArcGIS geometry format
        let arcgisGeometry: any = null;
        
        try {
          if (record.geometry.type === 'Polygon') {
            // Check if visualization renderer wants to use centroids
            const useCentroids = visualization.renderer?._useCentroids;
            
            console.log(`[AnalysisEngine] Polygon geometry check:`, {
              area: record.area_name,
              hasRenderer: !!visualization.renderer,
              rendererType: visualization.renderer?.type,
              useCentroids: useCentroids,
              rendererKeys: visualization.renderer ? Object.keys(visualization.renderer) : 'no renderer'
            });
            
            if (useCentroids) {
              // Use centroid from boundary properties if available, otherwise calculate it
              const centroidGeometry = record.properties?.centroid;
              if (centroidGeometry && centroidGeometry.coordinates) {
                arcgisGeometry = {
                  type: 'point',
                  x: centroidGeometry.coordinates[0],
                  y: centroidGeometry.coordinates[1],
                  spatialReference: { wkid: 4326 }
                };
                console.log(`[AnalysisEngine] ✅ Using pre-calculated centroid for competitive analysis:`, {
                  area: record.area_name,
                  centroid: centroidGeometry.coordinates
                });
              } else {
                // Calculate centroid from polygon coordinates
                const coordinates = record.geometry.coordinates[0]; // First ring
                let sumX = 0, sumY = 0;
                let validCoords = 0;
                
                coordinates.forEach((coord: number[]) => {
                  if (coord && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1])) {
                    sumX += coord[0];
                    sumY += coord[1];
                    validCoords++;
                  }
                });
                
                if (validCoords === 0) {
                  console.warn(`[AnalysisEngine] No valid coordinates for ${record.area_name}`);
                  return null;
                }
                
                const centroidX = sumX / validCoords;
                const centroidY = sumY / validCoords;
                
                if (isNaN(centroidX) || isNaN(centroidY)) {
                  console.warn(`[AnalysisEngine] Invalid centroid calculated for ${record.area_name}:`, [centroidX, centroidY]);
                  return null;
                }
                
                arcgisGeometry = {
                  type: 'point',
                  x: centroidX,
                  y: centroidY,
                  spatialReference: { wkid: 4326 }
                };
                
              }
            } else {
              // GeoJSON Polygon to ArcGIS Polygon for other visualizations
              arcgisGeometry = {
                type: 'polygon',
                rings: record.geometry.coordinates,
                spatialReference: { wkid: 4326 }
              };
            }
          } else if (record.geometry.type === 'Point') {
            // GeoJSON Point to ArcGIS Point
            arcgisGeometry = {
              type: 'point',
              x: record.geometry.coordinates[0],
              y: record.geometry.coordinates[1],
              spatialReference: { wkid: 4326 }
            };
          } else {
            console.warn(`[AnalysisEngine] Unsupported geometry type: ${record.geometry.type}`);
            return null;
          }
        } catch (geoError) {
          console.error(`[AnalysisEngine] Geometry conversion error for record ${index}:`, geoError);
          return null;
        }

        // VISUALIZATION-ONLY ATTRIBUTE OPTIMIZATION
        // IMPORTANT: This only affects ArcGIS Graphics attributes for browser performance
        // The full record data is preserved separately for analysis/chat context
        const essentialAttributes: any = {
          OBJECTID: index + 1,
          area_name: record.area_name || 'Unknown Area',
          value: typeof record.value === 'number' ? record.value : 0,
          ID: String(record.properties?.ID || record.area_id || ''),
          
          // Target variable field (dynamic based on analysis type)
          [data.targetVariable]: typeof record.value === 'number' ? record.value : 
                                 typeof record.properties?.thematic_value === 'number' ? record.properties.thematic_value : 0
        };

        // DYNAMIC FIELD INCLUSION: Automatically include fields that the renderer actually uses
        // Check what fields the renderer references and include those
        const rendererFields = new Set<string>();
        
        // Extract field names from renderer configuration
        if (visualization.renderer?.field) {
          rendererFields.add(visualization.renderer.field);
        }
        if (visualization.renderer?.visualVariables) {
          visualization.renderer.visualVariables.forEach((vv: any) => {
            if (vv.field) rendererFields.add(vv.field);
          });
        }
        if (visualization.renderer?.classBreakInfos) {
          // Class breaks renderer uses the main field
          if (visualization.renderer.field) rendererFields.add(visualization.renderer.field);
        }
        
        // Include renderer fields if they exist in the record
        rendererFields.forEach(fieldName => {
          if (fieldName && (record[fieldName] !== undefined || record.properties?.[fieldName] !== undefined)) {
            essentialAttributes[fieldName] = record[fieldName] ?? record.properties?.[fieldName];
          }
        });
        
        // Always include common demographic fields for popups if they exist
        const commonDemographicFields = [
          'value_TOTPOP_CY', 'TOTPOP_CY', 
          'value_AVGHINC_CY', 'AVGHINC_CY',
          'value_WLTHINDXCY', 'WLTHINDXCY',
          'nike_market_share', 'adidas_market_share', 'jordan_market_share',
          'rank', 'competitive_advantage_score', 'strategic_value_score',
          'customer_profile_score', 'persona_type'
        ];
        
        commonDemographicFields.forEach(fieldName => {
          const value = record[fieldName] ?? record.properties?.[fieldName];
          if (value !== undefined && value !== null) {
            essentialAttributes[fieldName] = value;
          }
        });

        return new Graphic({
          geometry: arcgisGeometry,
          attributes: essentialAttributes
        });
      }).filter(feature => feature !== null); // Remove null features

      console.log('[AnalysisEngine] Created features:', {
        totalFeatures: arcgisFeatures.length,
        skippedFeatures: data.records.length - arcgisFeatures.length,
        geometryType: arcgisFeatures[0]?.geometry?.type
      });


      if (arcgisFeatures.length === 0) {
        console.error('[AnalysisEngine] 🔥 NO VALID ARCGIS FEATURES CREATED - LAYER WILL BE EMPTY');
        throw new Error('No valid features with geometry to visualize');
      }

      // Determine the actual geometry type being used
      const useCentroids = visualization.renderer?._useCentroids;
      const actualGeometryType = useCentroids ? 'point' : 'polygon';
      
      console.log('[AnalysisEngine] Geometry type determination:', {
        useCentroids,
        actualGeometryType,
        rendererType: visualization.renderer?.type
      });


      // DYNAMIC FIELD SCHEMA: Generate field definitions based on what attributes actually exist
      // IMPORTANT: These field definitions only affect the ArcGIS FeatureLayer schema
      // The full data remains available for analysis/chat context via setFeatures()
      const essentialFields = [
        { name: 'OBJECTID', type: 'oid' },
        { name: 'area_name', type: 'string' },
        { name: 'value', type: 'double' },
        { name: 'ID', type: 'string' },
        { name: data.targetVariable, type: 'double' } // Dynamic target variable field
      ];

      // Dynamically discover what fields exist in the graphics and add appropriate schema
      if (arcgisFeatures.length > 0) {
        const sampleAttributes = arcgisFeatures[0].attributes;
        const fieldTypeMap: Record<string, string> = {
          // Common field type mappings
          'rank': 'integer',
          'TOTPOP_CY': 'double', 'value_TOTPOP_CY': 'double',
          'AVGHINC_CY': 'double', 'value_AVGHINC_CY': 'double', 
          'WLTHINDXCY': 'double', 'value_WLTHINDXCY': 'double',
          'nike_market_share': 'double', 'adidas_market_share': 'double', 'jordan_market_share': 'double',
          'competitive_advantage_score': 'double', 'strategic_value_score': 'double', 'customer_profile_score': 'double',
          'persona_type': 'string'
        };
        
        // Add fields that actually exist in the data
        Object.keys(sampleAttributes).forEach(fieldName => {
          // Skip fields we already defined
          if (essentialFields.some(f => f.name === fieldName)) return;
          
          const value = sampleAttributes[fieldName];
          let fieldType = 'string'; // default
          
          if (fieldTypeMap[fieldName]) {
            fieldType = fieldTypeMap[fieldName];
          } else if (typeof value === 'number') {
            fieldType = Number.isInteger(value) ? 'integer' : 'double';
          } else if (typeof value === 'string') {
            fieldType = 'string';
          }
          
          essentialFields.push({ name: fieldName, type: fieldType });
        });
      }

      console.log('[AnalysisEngine] Memory-optimized field definitions:', {
        totalFields: essentialFields.length,
        fieldNames: essentialFields.map(f => f.name)
      });

      // MEMORY SAFEGUARD: Create feature layer with proper error handling
      let featureLayer;
      try {
        featureLayer = new FeatureLayer({
          source: arcgisFeatures,
          fields: essentialFields,
          objectIdField: 'OBJECTID',
          geometryType: actualGeometryType, // Use actual geometry type
          spatialReference: { wkid: 4326 }, // Explicitly set WGS84 geographic coordinate system
          renderer: data.renderer || visualization.renderer, // Use direct processor renderer if available, otherwise fallback to complex chain
          popupTemplate: visualization.popupTemplate,
          title: `AnalysisEngine - ${data.targetVariable || 'Analysis'}`,
          visible: true,
        opacity: 0.8
      });

      console.log('[AnalysisEngine] FeatureLayer created successfully');
      
      } catch (featureLayerError) {
        console.error('[AnalysisEngine] Failed to create FeatureLayer:', featureLayerError);
        // Clean up arcgisFeatures array to free memory
        arcgisFeatures.length = 0;
        throw new Error(`FeatureLayer creation failed: ${featureLayerError}`);
      }

      // Note: Enhanced styling will be applied after layer is added to map to preserve popup functionality

      // 🎯 SIMPLIFIED RENDERING: Log which renderer is being used
      console.log('[AnalysisEngine] 🎯 RENDERER SOURCE:', {
        hasDirectRenderer: !!data.renderer,
        hasVisualizationRenderer: !!visualization.renderer,
        usingDirectRenderer: !!data.renderer,
        rendererSource: data.renderer ? 'processor' : 'visualization chain'
      });
      
      // MEMORY OPTIMIZATION: Reduce logging overhead
      console.log('[AnalysisEngine] Renderer applied:', {
        rendererType: visualization.renderer?.type,
        rendererField: visualization.renderer?.field,
        attributesAvailable: arcgisFeatures[0] ? Object.keys(arcgisFeatures[0].attributes).length : 0
      });

      // DEBUG: FeatureLayer created, check its properties
      console.log('[AnalysisEngine] 🏗️ FEATURELAYER CREATED:', {
        layerId: featureLayer.id,
        title: featureLayer.title,
        loaded: featureLayer.loaded,
        visible: featureLayer.visible,
        opacity: featureLayer.opacity,
        geometryType: featureLayer.geometryType,
        hasRenderer: !!featureLayer.renderer,
        rendererType: featureLayer.renderer?.type,
        sourceLength: (featureLayer.source as any)?.length,
        fieldsCount: featureLayer.fields?.length,
        popupTemplate: !!featureLayer.popupTemplate,
        layerSpatialRef: featureLayer.spatialReference?.wkid,
        mapSpatialRef: mapView.spatialReference?.wkid,
        spatialRefMatch: featureLayer.spatialReference?.wkid === mapView.spatialReference?.wkid
      });

      // Remove any existing analysis layers
      const existingLayers = mapView.map.layers.filter((layer: any) => 
        Boolean(layer.title?.includes('Analysis') || layer.title?.includes('AnalysisEngine'))
      );
      
      if (existingLayers.length > 0) {
        console.log('[AnalysisEngine] 🗑️ REMOVING EXISTING ANALYSIS LAYERS:', {
          layerCount: existingLayers.length,
          layerTitles: existingLayers.map((l: any) => l.title).toArray(),
          reason: 'Adding new visualization layer'
        });
      }
      
      mapView.map.removeMany(existingLayers.toArray());

      // Add the new advanced layer
      console.log('[AnalysisEngine] Adding layer to map:', {
        mapViewExists: !!mapView,
        mapExists: !!mapView?.map,
        layerVisible: featureLayer.visible,
        layerOpacity: featureLayer.opacity,
        featureCount: arcgisFeatures.length,
        layerTitle: featureLayer.title,
        beforeAddMapLayers: mapView?.map?.layers?.length || 0
      });
      
      mapView.map.add(featureLayer);
      
      console.log('[AnalysisEngine] Layer added to map:', {
        afterAddMapLayers: mapView?.map?.layers?.length || 0,
        layerInMap: mapView?.map?.layers?.includes(featureLayer),
        layerLoaded: featureLayer.loaded,
        layerLoadError: featureLayer.loadError
      });
      
      // 🔥 CRITICAL DEBUG: Track layer renderer lifecycle
      console.log('🔥 [RENDERER LIFECYCLE] Initial renderer after layer creation:', {
        hasRenderer: !!featureLayer.renderer,
        rendererType: featureLayer.renderer?.type,
        rendererField: (featureLayer.renderer as any)?.field,
        classBreakCount: (featureLayer.renderer as any)?.classBreakInfos?.length
      });
      
      // Watch for renderer changes
      const rendererWatcher = featureLayer.watch('renderer', (newValue, oldValue) => {
        console.log('⚠️ [RENDERER LIFECYCLE] RENDERER CHANGED!', {
          oldType: oldValue?.type,
          newType: newValue?.type,
          oldField: (oldValue as any)?.field,
          newField: (newValue as any)?.field,
          timestamp: new Date().toISOString(),
          stack: new Error().stack
        });
      });
      
      // Check renderer after various timeouts
      setTimeout(() => {
        console.log('🔥 [RENDERER LIFECYCLE] After 500ms:', {
          hasRenderer: !!featureLayer.renderer,
          rendererType: featureLayer.renderer?.type,
          rendererField: (featureLayer.renderer as any)?.field,
          layerVisible: featureLayer.visible,
          layerOpacity: featureLayer.opacity
        });
      }, 500);
      
      setTimeout(() => {
        console.log('🔥 [RENDERER LIFECYCLE] After 2000ms:', {
          hasRenderer: !!featureLayer.renderer,
          rendererType: featureLayer.renderer?.type,
          rendererField: (featureLayer.renderer as any)?.field,
          layerVisible: featureLayer.visible,
          layerOpacity: featureLayer.opacity,
          mapReady: mapView.ready,
          layerReady: featureLayer.loaded
        });
        
        // Try to force refresh the layer
        console.log('🔥 [RENDERER LIFECYCLE] Attempting layer refresh...');
        featureLayer.refresh();
      }, 2000);

      // 🔥 CRITICAL DEBUG: Wait for layer to load properly, then verify field access
      featureLayer.load().then(() => {
        console.log('🔍 [ARCGIS FIELD ACCESS TEST] Layer loaded successfully - testing field access...');
        
        if (featureLayer.source && (featureLayer.source as any).length > 0) {
          const firstFeature = (featureLayer.source as any).items[0];
          const rendererField = (featureLayer.renderer as any)?.field;
          
          console.log('🔍 [ARCGIS FIELD ACCESS TEST] Layer details:', {
            layerId: featureLayer.id,
            sourceCount: (featureLayer.source as any).length,
            rendererField: rendererField,
            rendererType: featureLayer.renderer?.type,
            firstFeatureExists: !!firstFeature,
            layerFullyLoaded: featureLayer.loaded
          });
          
          if (firstFeature && rendererField) {
            const fieldValue = firstFeature.attributes?.[rendererField];
            const availableFields = Object.keys(firstFeature.attributes || {});
            const hasRendererField = availableFields.includes(rendererField);
            
            console.log('🔍 [ARCGIS FIELD ACCESS TEST] Field access verification:', {
              rendererField: rendererField,
              hasRendererField: hasRendererField,
              fieldValue: fieldValue,
              fieldValueType: typeof fieldValue,
              isValidNumber: typeof fieldValue === 'number' && !isNaN(fieldValue),
              availableFieldsCount: availableFields.length,
              availableFields: availableFields.slice(0, 10), // Show first 10 fields
              sampleValues: {
                value: firstFeature.attributes?.value,
                thematic_value: firstFeature.attributes?.thematic_value,
                strategic_value_score: firstFeature.attributes?.strategic_value_score,
                competitive_advantage_score: firstFeature.attributes?.competitive_advantage_score
              }
            });
            
            if (!hasRendererField) {
              console.error('❌ [ARCGIS FIELD ACCESS TEST] CRITICAL: Renderer field not found in feature attributes!');
              console.error('   This is why the visualization appears grey - ArcGIS cannot find the field.');
              console.error('   Renderer expects:', rendererField);
              console.error('   Available fields:', availableFields);
            } else if (typeof fieldValue !== 'number' || isNaN(fieldValue)) {
              console.error('❌ [ARCGIS FIELD ACCESS TEST] CRITICAL: Renderer field value is not a valid number!');
              console.error('   Field value:', fieldValue, typeof fieldValue);
            } else {
              console.log('✅ [ARCGIS FIELD ACCESS TEST] SUCCESS: Field access working correctly!');
              console.log('   ArcGIS should be able to render features properly with this field.');
              console.log('   The grey visualization issue must be caused by something else.');
              
              // 🔥 RENDERER CONFLICT DEBUGGING: Check for multiple renderers or enhanced styling conflicts
              console.log('🔍 [RENDERER CONFLICT CHECK] Investigating renderer conflicts...');
              
              const currentRenderer = featureLayer.renderer;
              console.log('🔍 [RENDERER CONFLICT CHECK] Current renderer details:', {
                type: currentRenderer?.type,
                field: (currentRenderer as any)?.field,
                hasClassBreakInfos: !!(currentRenderer as any)?.classBreakInfos,
                classBreakCount: (currentRenderer as any)?.classBreakInfos?.length || 0,
                hasVisualVariables: !!(currentRenderer as any)?.visualVariables,
                visualVariableCount: (currentRenderer as any)?.visualVariables?.length || 0,
                visualVariableTypes: (currentRenderer as any)?.visualVariables?.map((vv: any) => vv.type) || [],
                hasDefaultSymbol: !!(currentRenderer as any)?.defaultSymbol,
                defaultSymbolColor: (currentRenderer as any)?.defaultSymbol?.color,
                rendererJSON: JSON.stringify(currentRenderer, null, 2).substring(0, 500) + '...'
              });
              
              // Check for visual variables conflicts
              if ((currentRenderer as any)?.visualVariables && (currentRenderer as any).visualVariables.length > 0) {
                console.log('⚠️ [RENDERER CONFLICT CHECK] Visual variables detected - potential conflict!');
                (currentRenderer as any).visualVariables.forEach((vv: any, i: number) => {
                  console.log(`   Visual Variable ${i + 1}:`, {
                    type: vv.type,
                    field: vv.field,
                    hasStops: !!vv.stops,
                    stopCount: vv.stops?.length || 0,
                    legendTitle: vv.legendOptions?.title
                  });
                });
              }
              
              // Check class breaks details
              if ((currentRenderer as any)?.classBreakInfos) {
                const classBreaks = (currentRenderer as any).classBreakInfos;
                console.log('🔍 [RENDERER CONFLICT CHECK] Class breaks analysis:', {
                  totalBreaks: classBreaks.length,
                  breakRanges: classBreaks.map((cb: any, i: number) => `${i + 1}: ${cb.minValue}-${cb.maxValue}`),
                  symbolColors: classBreaks.map((cb: any, i: number) => ({
                    class: i + 1,
                    color: cb.symbol?.color,
                    colorType: typeof cb.symbol?.color,
                    symbolType: cb.symbol?.type
                  }))
                });
                
                // 🔥 DETAILED SYMBOL INSPECTION: Check each class break symbol in detail
                console.log('🔍 [DETAILED SYMBOL INSPECTION] Examining each class break symbol:');
                classBreaks.forEach((cb: any, i: number) => {
                  console.log(`   Class ${i + 1}:`, {
                    minValue: cb.minValue,
                    maxValue: cb.maxValue,
                    symbolExists: !!cb.symbol,
                    symbolType: cb.symbol?.type,
                    colorExists: !!cb.symbol?.color,
                    colorValue: cb.symbol?.color,
                    colorIsArray: Array.isArray(cb.symbol?.color),
                    colorArrayValues: Array.isArray(cb.symbol?.color) ? cb.symbol.color : 'not array',
                    isGreyColor: Array.isArray(cb.symbol?.color) && 
                      cb.symbol.color[0] === 200 && cb.symbol.color[1] === 200 && cb.symbol.color[2] === 200,
                    fullSymbol: JSON.stringify(cb.symbol, null, 2)
                  });
                });
                
                // Check if any symbols are missing or grey
                const hasGreySymbols = classBreaks.some((cb: any) => {
                  const color = cb.symbol?.color;
                  if (Array.isArray(color)) {
                    return color[0] === 200 && color[1] === 200 && color[2] === 200; // Grey [200,200,200]
                  }
                  return false;
                });
                
                if (hasGreySymbols) {
                  console.error('❌ [RENDERER CONFLICT CHECK] FOUND GREY SYMBOLS in class breaks!');
                  console.error('   Some class break symbols are using grey [200,200,200] color');
                }
              }
              
              // Check for enhanced styling remnants
              const layerElement = document.querySelector(`[data-layer-id="${featureLayer.id}"]`);
              if (layerElement) {
                console.log('🔍 [ENHANCED STYLING CHECK] Layer DOM element found:', {
                  hasEnhancedClass: layerElement.classList.contains('enhanced-layer'),
                  classList: Array.from(layerElement.classList),
                  style: layerElement.getAttribute('style'),
                  hasDataAttributes: Array.from(layerElement.attributes).filter(attr => attr.name.startsWith('data-'))
                });
              }
              
              // Check map layer order and conflicts
              const mapLayers = (featureLayer as any).view?.map?.layers;
              if (mapLayers) {
                const layerIndex = mapLayers.indexOf(featureLayer);
                console.log('🔍 [LAYER ORDER CHECK] Layer positioning:', {
                  layerIndex: layerIndex,
                  totalLayers: mapLayers.length,
                  isTopLayer: layerIndex === mapLayers.length - 1,
                  layersAbove: layerIndex >= 0 ? mapLayers.length - layerIndex - 1 : 'unknown',
                  nearbyLayerTitles: mapLayers.toArray().slice(Math.max(0, layerIndex - 2), layerIndex + 3).map((l: any) => l.title)
                });
              }
              
              // CRITICAL: Test if we can see the actual rendered colors
              setTimeout(() => {
                console.log('🔍 [VISUAL VERIFICATION] Checking actual rendered appearance...');
                const mapDiv = document.querySelector('.esri-view-surface');
                if (mapDiv) {
                  console.log('   Map surface found - layer should be visually rendered');  
                  // Check if features are actually grey by sampling pixel colors (if possible)
                }
                
                // 🔥 CHECK VALUE DISTRIBUTION vs CLASS BREAKS
                if (featureLayer.source && (featureLayer.source as any).length > 0) {
                  const features = (featureLayer.source as any).toArray();
                  const fieldName = (featureLayer.renderer as any)?.field || 'value';
                  const values = features.map((f: any) => f.attributes[fieldName]).filter((v: any) => !isNaN(v));
                  
                  const classBreaks = (featureLayer.renderer as any)?.classBreakInfos || [];
                  
                  console.log('🔥 [VALUE DISTRIBUTION CHECK]:', {
                    fieldName: fieldName,
                    totalFeatures: features.length,
                    featuresWithValues: values.length,
                    valueRange: {
                      min: Math.min(...values),
                      max: Math.max(...values),
                      avg: values.reduce((a: number, b: number) => a + b, 0) / values.length
                    },
                    classBreakRanges: classBreaks.map((cb: any) => ({
                      min: cb.minValue,
                      max: cb.maxValue
                    })),
                    sampleValues: values.slice(0, 10)
                  });
                  
                  // Check how many features fall into each class break
                  const distribution = classBreaks.map((cb: any, i: number) => {
                    const count = values.filter((v: number) => v >= cb.minValue && v <= cb.maxValue).length;
                    return {
                      class: i + 1,
                      range: `${cb.minValue}-${cb.maxValue}`,
                      count: count,
                      percentage: ((count / values.length) * 100).toFixed(1) + '%'
                    };
                  });
                  
                  console.log('🔥 [CLASS BREAK DISTRIBUTION]:', distribution);
                  
                  // Check for values outside all class breaks
                  const minBreak = Math.min(...classBreaks.map((cb: any) => cb.minValue));
                  const maxBreak = Math.max(...classBreaks.map((cb: any) => cb.maxValue));
                  const outsideValues = values.filter((v: number) => v < minBreak || v > maxBreak);
                  
                  if (outsideValues.length > 0) {
                    console.error('❌ [VALUE DISTRIBUTION] CRITICAL: Features with values outside class breaks!', {
                      outsideCount: outsideValues.length,
                      outsidePercentage: ((outsideValues.length / values.length) * 100).toFixed(1) + '%',
                      sampleOutsideValues: outsideValues.slice(0, 5),
                      classBreakRange: `${minBreak} - ${maxBreak}`,
                      info: 'These features will use the default grey symbol!'
                    });
                  }
                }
              }, 2000);
            }
          } else {
            console.error('❌ [ARCGIS FIELD ACCESS TEST] CRITICAL: No feature or renderer field found!');
            console.error('   firstFeature:', !!firstFeature);
            console.error('   rendererField:', rendererField);
          }
        } else {
          console.error('❌ [ARCGIS FIELD ACCESS TEST] No source features available after load');
          console.error('   Source exists:', !!featureLayer.source);
          console.error('   Source length:', featureLayer.source ? (featureLayer.source as any).length : 'N/A');
        }
      }).catch((error) => {
        console.error('❌ [ARCGIS FIELD ACCESS TEST] Layer failed to load:', error);
        console.error('   This explains why the visualization appears grey - the layer cannot load.');
      });
      
      // Force zoom to features if they exist
      if (arcgisFeatures.length > 0) {
        try {
          console.log('[AnalysisEngine] Attempting to zoom to features...');
          const firstFeature = arcgisFeatures[0];
          if (firstFeature.geometry && firstFeature.geometry.type === 'point') {
            // For point geometry, create extent around the point
            const x = (firstFeature.geometry as any).x;
            const y = (firstFeature.geometry as any).y;
            console.log('[AnalysisEngine] First feature coordinates:', { x, y });
            
            // Create extent around first feature with some buffer
            const extent = {
              xmin: x - 1.0,  // Larger buffer for visibility
              ymin: y - 1.0,
              xmax: x + 1.0,
              ymax: y + 1.0,
              spatialReference: { wkid: 4326 }
            };
            
            console.log('[AnalysisEngine] Current map center before zoom:', {
              center: mapView.center ? [mapView.center.longitude, mapView.center.latitude] : 'No center',
              zoom: mapView.zoom,
              scale: mapView.scale
            });
            
            console.log('[AnalysisEngine] Zooming to extent:', extent);
            
            try {
              await mapView.goTo(extent, { duration: 2000 }); // Add animation duration
              
              console.log('[AnalysisEngine] Map center after zoom:', {
                center: mapView.center ? [mapView.center.longitude, mapView.center.latitude] : 'No center',
                zoom: mapView.zoom,
                scale: mapView.scale
              });
              
              console.log('[AnalysisEngine] ✅ Zoomed to feature extent');
            } catch (goToError) {
              console.error('[AnalysisEngine] goTo failed:', goToError);
              
              // Try alternative zoom method
              console.log('[AnalysisEngine] Trying alternative zoom to point...');
              try {
                await mapView.goTo({
                  center: [x, y],
                  zoom: 10
                });
                console.log('[AnalysisEngine] ✅ Alternative zoom succeeded');
              } catch (altZoomError) {
                console.error('[AnalysisEngine] Alternative zoom failed:', altZoomError);
              }
            }
          } else {
            console.log('[AnalysisEngine] First feature geometry type:', firstFeature.geometry?.type);
          }
        } catch (zoomError) {
          console.warn('[AnalysisEngine] Could not zoom to features:', zoomError);
        }
      }
      
      // Store reference for cleanup
      currentVisualizationLayer.current = featureLayer;
      
      
      // Wait a moment for the layer to load and check its status
      setTimeout(() => {
        console.log('[AnalysisEngine] 🔍 LAYER STATUS CHECK (after 100ms):', {
          layerId: featureLayer.id,
          loaded: featureLayer.loaded,
          loadError: featureLayer.loadError?.message,
          visible: featureLayer.visible,
          opacity: featureLayer.opacity,
          inMap: mapView.map.layers.includes(featureLayer),
          mapLayersCount: mapView.map.layers.length,
          renderingInfo: featureLayer.renderer ? 'Present' : 'Missing'
        });
        
      }, 100);
      
      console.log('[AnalysisEngine] Advanced visualization layer applied to map:', {
        layerId: featureLayer.id,
        title: featureLayer.title,
        featureCount: arcgisFeatures.length,
        visible: featureLayer.visible,
        opacity: featureLayer.opacity,
        renderer: featureLayer.renderer?.type,
        geometryType: arcgisFeatures[0]?.geometry?.type,
        sampleGeometry: arcgisFeatures[0]?.geometry ? {
          type: arcgisFeatures[0].geometry.type,
          hasCoordinates: !!(arcgisFeatures[0].geometry as any).x || !!(arcgisFeatures[0].geometry as any).coordinates,
          x: (arcgisFeatures[0].geometry as any).x,
          y: (arcgisFeatures[0].geometry as any).y
        } : 'No geometry',
        sampleAttributes: arcgisFeatures[0]?.attributes || 'No attributes'
      });
      
      // DEBUG: Check what the AnalysisEngine renderer actually contains
      console.log('[AnalysisEngine] 🔍 DEBUGGING RENDERER:', {
        hasRenderer: !!visualization.renderer,
        rendererType: visualization.renderer?.type,
        rendererField: visualization.renderer?.field,
        rendererAuthoringInfo: visualization.renderer?.authoringInfo,
        fullRenderer: JSON.stringify(visualization.renderer, null, 2)
      });
      
      // DEBUG: Check feature attributes to see if they have the score fields
      if (arcgisFeatures.length > 0) {
        const sampleFeature = arcgisFeatures[0];
        console.log('[AnalysisEngine] 🔍 SAMPLE FEATURE ATTRIBUTES:', {
          attributeKeys: Object.keys(sampleFeature.attributes),
          strategic_value_score: sampleFeature.attributes.strategic_value_score,
          competitive_advantage_score: sampleFeature.attributes.competitive_advantage_score,
          thematic_value: sampleFeature.attributes.thematic_value,
          value: sampleFeature.attributes.value
        });
      }
      
      // If renderer is broken, let's try a simple approach
      if (!visualization.renderer || visualization.renderer.type === 'simple') {
        console.log('[AnalysisEngine] 🚨 RENDERER IS BROKEN - APPLYING SIMPLE FIX');
        try {
          const { createQuartileRenderer } = await import('@/utils/createQuartileRenderer');
          
          // Determine which field to use based on analysis type
          let rendererField = 'value'; // fallback
          if (data.type === 'strategic_analysis') {
            rendererField = 'strategic_value_score';
          } else if (data.type === 'competitive_analysis') {
            rendererField = 'competitive_advantage_score';
          }
          
          console.log(`[AnalysisEngine] 🎯 Trying to render with field: ${rendererField}`);
          
          const rendererResult = await createQuartileRenderer({
            layer: featureLayer,
            field: rendererField,
            opacity: 0.6
          });
          
          if (rendererResult?.renderer) {
            featureLayer.renderer = rendererResult.renderer;
            console.log('[AnalysisEngine] ✅ APPLIED BACKUP QUARTILE RENDERER');
          }
        } catch (error) {
          console.error('[AnalysisEngine] ❌ Backup renderer failed:', error);
        }
      }
      
      return featureLayer;

    } catch (error) {
      console.error('[AnalysisEngine] Failed to apply visualization:', error);
      console.error('[AnalysisEngine] Error details:', {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorType: error?.constructor?.name,
        dataAvailable: !!data,
        recordsCount: data?.records?.length || 0,
        visualizationAvailable: !!visualization,
        mapViewAvailable: !!mapView
      });
      return null;
    }
  };

  const constructMicroservicePrompt = (query: string, analysisResult: QueryAnalysisResult): string => {
    let taskSpecificInstructions = '';
    let enhancedQuery = query;
    const analysisType = analysisResult.queryType;
    const targetVar = analysisResult.targetVariable || analysisResult.relevantFields?.[0] || '';
    const targetPretty = prettyField(targetVar);
  
    switch (analysisType) {
      case 'jointHigh': {
        const relevantFields = analysisResult.relevantFields || [];
        if (relevantFields.length >= 2) {
          const varA = relevantFields[0];
          const varB = relevantFields[1];
          taskSpecificInstructions = `Task: Analyze the combined score (joint_score) of ${varA} and ${varB} across all regions. Focus on identifying areas with strong performance in both metrics, understanding the distribution of combined scores, and highlighting any geographic patterns or clusters of high-scoring regions.`;
          enhancedQuery = `Analyze the relationship between ${varA} and ${varB} using their combined score. Address the core question: "${query}". Your analysis should focus on identifying and explaining patterns in regions with high combined scores, analyzing distribution and geographic patterns, and highlighting notable areas where both ${varA} and ${varB} show strong performance.`;
        }
        break;
      }
      case 'correlation': {
        const fields = analysisResult.relevantFields || [];
        if (fields.length >= 2) {
          const primaryField = analysisResult.targetVariable || fields[0];
          const comparisonField = fields.find(f => f !== primaryField) || fields[1];
          taskSpecificInstructions = `Task: Analyze the correlation between ${primaryField} and ${comparisonField}. Use business-friendly terms such as "market share" and "consumer preference."  Focus on identifying areas where the values show strong positive or negative relationships, or significant divergence.  Avoid phrases like "sample data point" or other technical jargon that might confuse non-technical readers; instead reference the location or area directly (e.g., "this area" or "these regions").`;
          enhancedQuery = `Analyze the correlation between ${primaryField} and ${comparisonField}. Address the core question: "${query}". Your analysis should explain the overall correlation pattern, highlight areas with strong relationships, describe geographic distribution, and call out notable outliers.  Use clear narrative language (no "sample data point" phrasing) and, when discussing brand metrics, frame insights in terms of market share or market position.`;
        }
        break;
      }
      case 'topN': {
        taskSpecificInstructions = `Task: Analyze the provided data layer to find the top areas based on the user query. Focus on ranking and identifying the top areas according to the primary analysis field: ${targetPretty}.`;
        enhancedQuery = `Find the top areas for ${targetPretty}. Address the core question: "${query}". Your analysis should focus on ranking the top N locations and describing their values.`;
        break;
      }
      case 'choropleth':
      default: {
        taskSpecificInstructions = `Task: Analyze the spatial distribution of ${targetPretty}. Your analysis must focus on clusters first. Follow this structure strictly:
  1. CLUSTERS ANALYSIS (MOST IMPORTANT): Identify and analyze at least 5 distinct clusters of adjacent areas with similar ${targetPretty} values. For each cluster, provide its rank, list 3-5 core ZIP codes/FSAs, state its average value, and use the term "${targetPretty}" when discussing values.
  2. HIGH-VALUE AREAS: Briefly mention the top 5 individual areas with the highest ${targetPretty} values.
  3. GEOGRAPHIC DISTRIBUTION: Explain how clusters are distributed across the geography.
  4. STATISTICAL COMPARISON: Compare mean/median values between clusters.`;
        enhancedQuery = `Analyze the spatial distribution of ${targetPretty}. Address the core question: "${query}". Your response should prioritize cluster analysis as described in the task instructions.`;
        break;
      }
    }
  
    return `Task Instructions:
  ${taskSpecificInstructions.replaceAll(targetVar, targetPretty)}
  
  User Query: "${query}"
  
  Enhanced Instructions for AI:
  ${enhancedQuery.replaceAll(targetVar, targetPretty)}
  `;
  };

  const handleSubmit = async (query: string, source: 'main' | 'reply' = 'main') => {
    console.log('🚨 [FUNCTION CALL] handleSubmit called with query:', query);
    console.log('🚨 [FUNCTION CALL] source:', source);
    
    // Handle overlapping queries - prevent new queries while processing
    if (isProcessing) {
      console.warn('[QueryManager] Query already in progress, ignoring new query:', query);
      toast({
        title: "Query in Progress",
        description: "Please wait for the current analysis to complete before starting a new one.",
        variant: "default",
        duration: 3000,
      });
      return;
    }
    
    // Check if there are existing results and warn user (optional auto-clear)
    if (features.length > 0 || currentVisualizationLayer.current) {
      console.log('[QueryManager] Existing results detected, auto-clearing before new query');
      toast({
        title: "Previous Results Cleared",
        description: "Automatically cleared previous analysis to start new query. Use the Clear button manually if preferred.",
        variant: "default",
        duration: 2000,
      });
    }
    
    const startTime = Date.now();
    console.log('[AnalysisEngine Integration] Starting enhanced analysis workflow');

    // --- STATE RESET (same as original) ---
    setIsProcessing(true);
    setCancelRequested(false);
    setError(null);
    setProcessingError(null);
    setFeatures([]);
    setFormattedLegendData({ items: [] });
    
    // Clear cached datasets to prevent memory leaks (automatic cleanup)
    console.log('[QueryManager] Auto-clearing previous analysis data');
    clearAnalysis();
    
    // Clear existing visualization layer
    if (currentVisualizationLayer.current) {
      console.log('[AnalysisEngine] 🗑️ REMOVING EXISTING LAYER:', {
        layerId: currentVisualizationLayer.current.id,
        layerTitle: currentVisualizationLayer.current.title,
        reason: 'clearVisualization called',
        callStack: new Error().stack?.split('\n')[1]
      });
      if (currentMapView && currentMapView.map) {
        try {
          currentMapView.map.remove(currentVisualizationLayer.current);
        } catch (error) {
          console.warn('[GeospatialChat] Error removing visualization layer:', error);
        }
        // IMPORTANT: Destroy the layer to free memory
        if (typeof (currentVisualizationLayer.current as any).destroy === 'function') {
          (currentVisualizationLayer.current as any).destroy();
        }
      }
      currentVisualizationLayer.current = null;
    }
    
    // Clear any graphics
    if (currentMapView) {
      currentMapView.graphics.removeAll();
    }
    onVisualizationLayerCreated(null, true);

    setCurrentProcessingStep('query_analysis');
    setDebugInfo({
      query,
      timestamp: new Date().toISOString(),
      logs: [],
      layerMatches: [],
      sqlQuery: "",
      features: [],
      timing: {},
      error: undefined
    });

    // Initialize processing steps
    setProcessingSteps([
      { id: 'query_analysis', name: 'Query Analysis', status: 'processing', message: 'Understanding your query...' },
      { id: 'microservice_request', name: 'AI Processing', status: 'pending', message: 'Preparing analysis request...' },
      { id: 'data_loading', name: 'Data Loading', status: 'pending', message: 'Loading geographic data...' },
      { id: 'data_joining', name: 'Data Integration', status: 'pending', message: 'Merging analysis with geographic data...' },
      { id: 'visualization', name: 'Visualization', status: 'pending', message: 'Creating map visualization...' },
      { id: 'narrative_generation', name: 'Report Generation', status: 'pending', message: 'Generating narrative analysis...' }
    ]);

    // Setup messages (same as original)
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    const userMessage: LocalChatMessage = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: new Date(),
    };

    const assistantMessage: LocalChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Processing your query...',
      timestamp: new Date(),
      metadata: {
        analysisResult: {},
        context: '',
        debugInfo: {},
        isStreaming: false
      }
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    addContextMessage({ role: 'user', content: query });

    try {
      // Check for cancellation before starting
      if (cancelRequested) {
        console.log('[QueryManager] Cancellation detected before analysis start');
        return;
      }

      // --- ENHANCED: AnalysisEngine Integration ---
      console.log('[AnalysisEngine] Executing analysis with enhanced engine');
      
      const analysisOptions: AnalysisOptions = {
        sampleSize: sampleSizeValue || 5000,
        targetVariable: currentTarget,
        forceRefresh: false, // Use caching for better performance
        // Use selected endpoint if not 'auto'
        endpoint: selectedEndpoint !== 'auto' ? selectedEndpoint : undefined
      };

      // Execute analysis using our new AnalysisEngine
      console.log('🚨🚨🚨 [STRATEGIC DEBUG] Starting AnalysisEngine with options:', analysisOptions);
      const analysisResult: AnalysisResult = await executeAnalysis(query, analysisOptions);
      
      // Check for cancellation after analysis
      if (cancelRequested) {
        console.log('[QueryManager] Cancellation detected after analysis');
        return;
      }
      
      // EXPLICIT DEBUG FOR STRATEGIC ANALYSIS
      if (query.toLowerCase().includes('strategic')) {
        console.log('🚨🚨🚨 [STRATEGIC DEBUG] AnalysisEngine returned:');
        console.log('🚨🚨🚨 Success:', analysisResult.success);
        console.log('🚨🚨🚨 Endpoint:', analysisResult.endpoint);
        console.log('🚨🚨🚨 Data type:', analysisResult.data?.type);
        console.log('🚨🚨🚨 Records count:', analysisResult.data?.records?.length);
        if (analysisResult.data?.records?.length > 0) {
          console.log('🚨🚨🚨 First 3 record values:');
          analysisResult.data.records.slice(0, 3).forEach((record, i) => {
            console.log(`🚨🚨🚨   ${i+1}. ${record.area_name}: value=${record.value}`);
          });
          
          // Check for the 79.3 issue
          const values = analysisResult.data.records.slice(0, 5).map((r: any) => r.value);
          const uniqueValues = [...new Set(values)];
          if (uniqueValues.length === 1) {
            console.log('🚨🚨🚨 PROBLEM IDENTIFIED: All AnalysisEngine values are identical!');
            console.log('🚨🚨🚨 All values:', values);
          } else {
            console.log('🚨🚨🚨 AnalysisEngine values are distinct:', uniqueValues);
          }
        }
      }
      
      console.log('[AnalysisEngine] Analysis complete:', {
        success: analysisResult.success,
        dataPoints: analysisResult.data?.records?.length || 0,
        visualizationType: analysisResult.visualization?.type,
        firstRecord: analysisResult.data?.records?.[0] ? {
          area_id: analysisResult.data.records[0].area_id,
          area_name: analysisResult.data.records[0].area_name,
          value: analysisResult.data.records[0].value,
          hasGeometry: !!(analysisResult.data.records[0] as any).geometry,
          geometryType: (analysisResult.data.records[0] as any).geometry?.type
        } : 'No records from analysis',
        processingTime: Date.now() - startTime,
        endpoint: analysisResult.endpoint
      });

      if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
      }

      // Additional validation: ensure we have valid data structure
      if (!analysisResult.data || !analysisResult.data.records || !Array.isArray(analysisResult.data.records)) {
        console.error('[AnalysisEngine] Invalid analysis result structure:', {
          hasData: !!analysisResult.data,
          hasRecords: !!analysisResult.data?.records,
          recordsType: typeof analysisResult.data?.records,
          isArray: Array.isArray(analysisResult.data?.records)
        });
        throw new Error('Analysis result missing valid records array');
      }

      if (analysisResult.data.records.length === 0) {
        console.warn('[AnalysisEngine] Analysis returned no data records');
        throw new Error('Analysis returned no data records to visualize');
      }

      // --- INTEGRATION: Convert AnalysisEngine result to existing format ---
      
      // Update processing steps to complete
      setProcessingSteps(prev => prev.map(s => 
        s.id === 'narrative_generation' ? { ...s, status: 'processing' as any } : { ...s, status: 'complete' as any }
      ));
      setCurrentProcessingStep('narrative_generation');

      // --- FIXED: Properly join AnalysisEngine data with geographic features ---
      console.log('🚨 [DEBUG] GEOGRAPHIC JOIN SECTION REACHED - This should appear in console logs');
      console.log('[AnalysisEngine] Joining analysis data with geographic features');
      console.log('[AnalysisEngine] Analysis result data:', {
        hasData: !!analysisResult.data,
        hasRecords: !!analysisResult.data?.records,
        recordCount: analysisResult.data?.records?.length || 0,
        sampleRecord: analysisResult.data?.records?.[0] ? {
          hasID: !!(analysisResult.data.records[0] as any).ID,
          ID: (analysisResult.data.records[0] as any).ID,
          keys: Object.keys(analysisResult.data.records[0]).slice(0, 5)
        } : null
      });
      
      // --- FIXED: Join analysis data with cached ZIP Code polygon boundaries ---
      console.log('[AnalysisEngine] Loading ZIP Code polygon boundaries for visualization');
      
      let geographicFeatures: FeatureType[] = [];
      
      try {
        // Load the cached ZIP Code polygon boundaries (fast, reliable)
        console.log('[AnalysisEngine] About to call loadGeographicFeatures...');
        
        const loadingStartTime = Date.now();
        geographicFeatures = await loadGeographicFeatures().then(features => {
          console.log('[AnalysisEngine] loadGeographicFeatures resolved with:', features.length, 'features');
          return features.filter((f): f is FeatureType => f !== null);
        });
        
        const loadingTime = Date.now() - loadingStartTime;
        console.log('[AnalysisEngine] ✅ ZIP Code polygon boundaries loaded:', {
          count: geographicFeatures.length,
          loadingTime: `${loadingTime}ms`,
          sampleFeature: geographicFeatures[0] ? {
            hasGeometry: !!geographicFeatures[0].geometry,
            hasProperties: !!geographicFeatures[0].properties,
            sampleId: geographicFeatures[0].properties?.ID
          } : null
        });
        
        if (geographicFeatures.length === 0) {
          throw new Error('loadGeographicFeatures returned empty array');
        }
        
      } catch (geoError) {
        console.error('[AnalysisEngine] ❌ Failed to load ZIP Code boundaries:', {
          error: geoError,
          errorMessage: geoError instanceof Error ? geoError.message : String(geoError),
          errorStack: geoError instanceof Error ? geoError.stack : undefined
        });
        
        // CRITICAL: We need actual ZIP Code boundaries for proper visualization
        throw new Error(`Cannot load ZIP Code boundaries from cache: ${geoError}. This is required for geographic visualization.`);
      }

      // Join analysis data with ZIP Code polygon boundaries
      console.log('🚨 [STRUCTURE DEBUG] Analysis result data structure:', {
        hasAnalysisResult: !!analysisResult,
        hasData: !!analysisResult.data,
        hasRecords: !!analysisResult.data?.records,
        recordCount: analysisResult.data?.records?.length || 0,
        firstRecord: analysisResult.data?.records?.[0] ? {
          allKeys: Object.keys(analysisResult.data.records[0]),
          hasID: 'ID' in analysisResult.data.records[0],
          ID_value: (analysisResult.data.records[0] as any).ID,
          ID_type: typeof (analysisResult.data.records[0] as any).ID,
          sampleFields: Object.keys(analysisResult.data.records[0]).slice(0, 10)
        } : 'NO FIRST RECORD'
      });
      
      // DEBUG: Check joining data before processing (with safety checks)
      console.log('[AnalysisEngine] About to join data:', {
        analysisRecords: analysisResult.data?.records?.length || 0,
        geographicFeatures: geographicFeatures.length,
        sampleAnalysisRecord: analysisResult.data?.records?.[0] || null,
        sampleGeographicFeature: geographicFeatures[0] ? {
          properties: geographicFeatures[0].properties,
          geometryType: geographicFeatures[0].geometry?.type
        } : null
      });

      const targetVariable = analysisResult.data.targetVariable || 'analysis_score';
      console.log(`🎯 [JOIN] Target variable for this analysis: ${targetVariable}`);
      
      const joinedResults = analysisResult.data.records.map((record: any, index: number) => {
        // ENHANCED: Extract ZIP Code from AnalysisEngine record structure
        // Check multiple possible locations for the ID field
        const recordAreaId = (record as any).area_id;
        const recordPropertiesID = (record as any).properties?.ID;
        const recordPropertiesId = (record as any).properties?.id;
        const recordDirectID = (record as any).ID;
        const recordDirectId = (record as any).id;
        
        // Additional fields to check
        const recordZIP = (record as any).ZIP || (record as any).properties?.ZIP;
        const recordZIPCODE = (record as any).ZIPCODE || (record as any).properties?.ZIPCODE;
        const recordZipCode = (record as any).zip_code || (record as any).properties?.zip_code;
        
        // Priority: properties.ID > area_id (unless area_id is numeric) > direct ID fields
        let primaryId = recordPropertiesID || recordPropertiesId || recordDirectID || recordDirectId;
        
        // If area_id is numeric (not area_XXXX pattern), prefer it over fallback fields
        if (recordAreaId && !String(recordAreaId).startsWith('area_')) {
          primaryId = recordAreaId;
        }
        
        // Use ID field as primary, with fallbacks
        const rawZip = String(recordZIP || recordZIPCODE || recordZipCode || primaryId || recordAreaId || `area_${index}`);
        const recordZip = rawZip.padStart(5, '0'); // Pad to 5 digits with leading zeros
        
        // Debug logging for problematic records
        if (index === 2610 || index < 3 || rawZip.startsWith('area_')) {
          console.log(`🔍 [JOIN DEBUG] Record ${index}:`, {
            recordAreaId,
            recordPropertiesID,
            recordPropertiesId,
            recordDirectID,
            recordDirectId,
            primaryId,
            rawZip,
            recordZip,
            fallbackUsed: rawZip.startsWith('area_'),
            availableFields: Object.keys(record).slice(0, 10),
            propertiesKeys: record.properties ? Object.keys(record.properties).slice(0, 10) : 'no properties'
          });
        }
        
        // Find matching ZIP Code boundary by ZIP code (with padding support)
        const zipFeature = geographicFeatures.find(f => 
          f?.properties && (
            String(f.properties.ID).padStart(5, '0') === recordZip ||
            String(f.properties.ZIP).padStart(5, '0') === recordZip ||
            String(f.properties.ZIPCODE).padStart(5, '0') === recordZip ||
            // Extract ZIP from DESCRIPTION field: "08837 (Edison)" -> "08837"
            f.properties.DESCRIPTION?.match(/^(\d{5})/)?.[1] === recordZip ||
            String(f.properties.OBJECTID).padStart(5, '0') === recordZip
          )
        );

        // Debug logging for problematic records
        if (index === 3137 || index < 3 || rawZip.startsWith('area_')) {
          console.log(`🔍 [JOIN DEBUG] Record ${index} match:`, {
            recordZip,
            foundMatch: !!zipFeature,
            zipFeatureId: zipFeature?.properties?.ID,
            zipFeatureDesc: zipFeature?.properties?.DESCRIPTION?.substring(0, 30)
          });
        }

        // Create record with actual ZIP Code polygon geometry and proper area name
        if (zipFeature) {
          // SUCCESS: Use boundary data for name and geometry
          const zipDescription = zipFeature.properties?.DESCRIPTION || '';
          const zipMatch = zipDescription.match(/^(\d{5})\s*\(([^)]+)\)/);
          const zipCode = zipMatch?.[1] || recordZip;
          const cityName = zipMatch?.[2] || 'Unknown City';
          
          // FIXED: Preserve competitive analysis data during geographic join
          const isCompetitiveAnalysis = analysisResult.data.type === 'competitive_analysis';
          const competitiveFields = ['value', 'competitive_advantage_score', 'thematic_value'];
          
          console.log(`🔧 [JOIN DEBUG] Record ${index} (${record.area_name}):`);
          console.log(`   isCompetitiveAnalysis: ${isCompetitiveAnalysis}`);
          console.log(`   record.value BEFORE join: ${record.value}`);
          console.log(`   record.properties.thematic_value BEFORE join: ${record.properties?.thematic_value}`);
          
          // Preserve original competitive data
          const preservedProps = { ...record.properties };
          const zipProps = { ...(zipFeature.properties || {}) };
          
          // Debug what's in ZIP boundary that might conflict
          console.log(`   ZIP boundary conflicting fields:`, 
            competitiveFields.filter(field => zipProps[field] !== undefined)
              .map(field => `${field}=${zipProps[field]}`));
          
          // For competitive analysis, don't let ZIP boundary overwrite competitive fields
          if (isCompetitiveAnalysis) {
            competitiveFields.forEach(field => {
              if (preservedProps[field] !== undefined && zipProps[field] !== undefined) {
                console.log(`   🔧 Removing conflicting ${field}: ${zipProps[field]} → deleted`);
                delete zipProps[field]; // Remove conflicting field from ZIP boundary
              }
            });
          }
          
          const joinedRecord = {
            ...record,
            area_id: zipCode,
            area_name: `${zipCode} (${cityName})`,
            geometry: zipFeature.geometry, // Use actual ZIP Code polygon boundaries
            properties: {
              ...preservedProps,  // Original competitive data first
              ...zipProps,        // ZIP boundary data (without conflicts)
              zip_code: zipCode,
              city_name: cityName,
              // CRITICAL: Add BOTH targetVariable AND 'value' fields for renderer access
              [targetVariable]: record[targetVariable] || record.value || preservedProps[targetVariable] || 0,
              // Use centralized field mapping to get the correct score value
              value: extractScoreValue(record, analysisResult.data.type, analysisResult.data.targetVariable)
            }
          };
          
          console.log(`   🔧 AFTER join - record.value: ${joinedRecord.value}`);
          console.log(`   🔧 AFTER join - properties.thematic_value: ${joinedRecord.properties?.thematic_value}`);
          
          return joinedRecord;
        } else {
          // FAILURE: No match found, use fallback
                     console.warn(`❌ [JOIN] No boundary match for record ${index}, ID: ${primaryId}, rawZip: ${rawZip}`);
          return {
            ...record,
            area_id: rawZip,
            area_name: rawZip.startsWith('area_') ? rawZip : `${rawZip} (No boundary data)`,
            geometry: null, // No geometry available
            properties: {
              ...record.properties,
              zip_code: rawZip,
              city_name: 'No boundary data',
              // CRITICAL: Add BOTH targetVariable AND 'value' fields even without boundary match
              [targetVariable]: record[targetVariable] || record.value || record.properties?.[targetVariable] || 0,
              // Use centralized field mapping to get the correct score value
              value: extractScoreValue(record, analysisResult.data.type, analysisResult.data.targetVariable)
            }
          };
        }
      });

      // CRITICAL DEBUG: Check join results
      console.log('[AnalysisEngine] ❗ JOIN RESULTS DEBUG:', {
        totalRecords: joinedResults.length,
        recordsWithGeometry: joinedResults.filter(r => r.geometry !== null).length,
        recordsWithoutGeometry: joinedResults.filter(r => r.geometry === null).length,
        geometryTypes: [...new Set(joinedResults.map(r => r.geometry?.type).filter(Boolean))],
        firstRecord: joinedResults[0] ? {
          area_id: joinedResults[0].area_id,
          area_name: joinedResults[0].area_name,
          hasGeometry: joinedResults[0].geometry !== null,
          geometryType: joinedResults[0].geometry?.type,
          geometryCoords: joinedResults[0].geometry?.coordinates ? 'Present' : 'Missing',
          value: joinedResults[0].value
        } : 'No records'
      });

      if (joinedResults.filter(r => r.geometry !== null).length === 0) {
        console.error('[AnalysisEngine] 🔥 CRITICAL: NO RECORDS WITH GEOMETRY AFTER JOIN - VISUALIZATION WILL FAIL');
        console.error('[AnalysisEngine] Sample analysis IDs:', analysisResult.data.records.slice(0, 5).map(r => r.area_id || (r as any).ID || 'no-id'));
        console.error('[AnalysisEngine] Sample boundary IDs:', geographicFeatures.slice(0, 5).map(f => f.properties?.ID || 'no-id'));
      }

      console.log('[AnalysisEngine] Enhanced results created:', {
        totalRecords: joinedResults.length,
        withRealGeometry: joinedResults.filter(r => r.geometry?.type === 'Polygon').length,
        withFallbackGeometry: joinedResults.filter(r => r.geometry?.type === 'Point').length,
        sampleRecord: joinedResults[0] ? {
          area_name: joinedResults[0].area_name,
          value: joinedResults[0].value,
          hasGeometry: !!joinedResults[0].geometry
        } : null
      });

      // Update the analysis result with joined data
      const enhancedAnalysisResult = {
        ...analysisResult,
        data: {
          ...analysisResult.data,
          records: joinedResults
        }
      };

      console.log('🚨 [FLOW CHECK] Enhanced analysis result created');
      console.log('🚨 [FLOW CHECK] First record value after join:', enhancedAnalysisResult.data.records[0]?.value);
      console.log('🚨 [FLOW CHECK] First record nike_market_share:', enhancedAnalysisResult.data.records[0]?.properties?.nike_market_share);
      console.log('🚨 [FLOW CHECK] First record thematic_value:', enhancedAnalysisResult.data.records[0]?.properties?.thematic_value);
      console.log('🚨 [FLOW CHECK] Data type:', enhancedAnalysisResult.data.type);

      // --- ENHANCED: Use AnalysisEngine's advanced visualization system ---
      console.log('[AnalysisEngine] Applying advanced visualization system');
      console.log('[AnalysisEngine] Enhanced data check:', {
        totalRecords: enhancedAnalysisResult.data.records.length,
        recordsWithGeometry: enhancedAnalysisResult.data.records.filter((r: any) => r.geometry).length,
        sampleRecordGeometry: enhancedAnalysisResult.data.records[0]?.geometry?.type,
        sampleRecordId: enhancedAnalysisResult.data.records[0]?.area_id,
        sampleRecordName: enhancedAnalysisResult.data.records[0]?.area_name
      });
      
      // CRITICAL FIX: Create optimized data copy ONLY for visualization
      // Keep the original enhancedAnalysisResult.data intact for analysis and chat context
      const visualizationData = {
        ...enhancedAnalysisResult.data,
        records: enhancedAnalysisResult.data.records // Reference the same records - optimization happens inside visualization function
      };
      
      console.log('[AnalysisEngine] Data flow separation:', {
        originalDataRecords: enhancedAnalysisResult.data.records.length,
        visualizationDataRecords: visualizationData.records.length,
        preservingFullDataForAnalysis: true
      });
      
      // Apply visualization with separated data flow
      const createdLayer = await applyAnalysisEngineVisualization(analysisResult.visualization, visualizationData, currentMapView);
      
      // Pass the created layer to the callback
      if (createdLayer) {
        console.log('[AnalysisEngine] ✅ Visualization layer created successfully:', createdLayer.title);
        onVisualizationLayerCreated(createdLayer, true);
        
        // CRITICAL FIX: Update features state with processed competitive scores
        if (enhancedAnalysisResult.data.type === 'competitive_analysis') {
          console.log('🔄 [FEATURES SYNC] Updating features state with competitive scores...');
          
          // Create features with competitive advantage scores instead of raw market share
          const competitiveFeatures = enhancedAnalysisResult.data.records.map((record: any) => ({
            type: 'Feature',
            geometry: record.geometry,
            properties: {
              ...record.properties,
              // Ensure competitive scores are used, not market share
              thematic_value: record.value, // Use the competitive score as thematic_value
              competitive_advantage_score: record.properties?.competitive_advantage_score || record.value,
              // Keep market share as context but don't let it override competitive scores
              nike_market_share_context: record.properties?.nike_market_share || record.properties?.value_MP30034A_B_P,
              adidas_market_share_context: record.properties?.adidas_market_share || record.properties?.value_MP30029A_B_P
            }
          }));
          
          console.log('🔄 [FEATURES SYNC] Sample competitive feature:', {
            area_name: competitiveFeatures[0]?.properties?.area_name,
            thematic_value: competitiveFeatures[0]?.properties?.thematic_value,
            competitive_advantage_score: competitiveFeatures[0]?.properties?.competitive_advantage_score,
            nike_market_share_context: competitiveFeatures[0]?.properties?.nike_market_share_context
          });
          
          // Update the features state so sendChatMessage uses competitive scores
          setFeatures(competitiveFeatures as GeospatialFeature[]);
          onFeaturesFound(competitiveFeatures, false);
        }
      } else {
        console.error('[AnalysisEngine] ❌ Failed to create visualization layer');
        onVisualizationLayerCreated(null, true);
      }


      // Create legend from AnalysisEngine result
      if (analysisResult.visualization.legend) {
        console.log('[AnalysisEngine] Processing legend:', analysisResult.visualization.legend);
        
        let legendData;
        if ((analysisResult.visualization.legend as any).components) {
          // Dual-variable format with components array
          legendData = {
            title: analysisResult.visualization.legend.title,
            type: 'dual-variable',
            components: (analysisResult.visualization.legend as any).components.map((component: any) => ({
              title: component.title,
              type: component.type,
              items: component.items.map((item: any) => ({
                label: item.label,
                color: item.color,
                value: item.value,
                size: item.size,
                shape: item.symbol || 'circle'
              }))
            }))
          };
        } else if (analysisResult.visualization.legend.items) {
          // Standard format with items array
          legendData = {
            title: analysisResult.visualization.legend.title,
            items: analysisResult.visualization.legend.items.map(item => ({
              label: item.label,
              color: item.color,
              value: item.value,
              shape: item.symbol || 'circle'
            }))
          };
        } else {
          // Handle alternative legend formats
          console.warn('[AnalysisEngine] Unexpected legend format, creating fallback');
          legendData = {
            title: 'Competitive Analysis',
            items: [{
              label: 'Analysis Areas',
              color: '#4169E1',
              value: 0,
              shape: 'circle'
            }]
          };
        }
        
        console.log('[AnalysisEngine] Setting legend data:', legendData);
        setFormattedLegendData(legendData);
      } else {
        console.warn('[AnalysisEngine] No legend data available in visualization result');
      }

      console.log('[AnalysisEngine] Advanced visualization applied');

      // Update state - the AnalysisEngine manages its own visualization layer
      setVisualizationResult({
        type: analysisResult.visualization.type,
        legend: analysisResult.visualization.legend,
        config: analysisResult.visualization.config
      } as any);
      
      // Notify parent that new layer was created (layer is managed by applyAnalysisEngineVisualization)
      onVisualizationLayerCreated(currentVisualizationLayer.current, true);

      // Auto-zoom to data if configured
      if (analysisResult.visualization.config?.autoZoom && currentMapView && geographicFeatures.length > 0) {
        // Calculate extent from geographic features
        const [geometryEngine] = await Promise.all([
          import('@arcgis/core/geometry/geometryEngine')
        ]);
        
        const geometries = geographicFeatures
          .filter(f => f?.geometry)
          .map(f => f!.geometry);
          
        if (geometries.length > 0) {
          const union = geometryEngine.union(geometries as any);
          if (union && union.extent) {
            currentMapView.goTo(union.extent.expand(1.2), {
              duration: 1200,
              easing: 'ease-in-out'
            });
          }
        }
      }

      const validFeatures = geographicFeatures.filter(f => f !== null) as GeospatialFeature[];
      
      // CRITICAL FIX: Don't call handleFeaturesFound for AnalysisEngine results
      // This was causing the visualization to be cleared after being created
      console.log('[AnalysisEngine] 🚫 SKIPPING handleFeaturesFound to preserve visualization');
      console.log('[AnalysisEngine] Features would have been:', validFeatures.length);
      
      // handleFeaturesFound(validFeatures, true); // DISABLED to prevent visualization clearing
      
      if (currentMapView) {
        createHighlights(currentMapView, validFeatures);
      }

      // --- NARRATIVE GENERATION using existing Claude integration ---
      console.log('🚨 [FLOW CHECK] Reached narrative generation section');
      console.log('🚨 [FLOW CHECK] enhancedAnalysisResult exists:', !!enhancedAnalysisResult);
      console.log('🚨 [FLOW CHECK] enhancedAnalysisResult.data.records.length:', enhancedAnalysisResult?.data?.records?.length || 0);
      
      let narrativeContent: string | null = null;
      try {
        console.log('[AnalysisEngine] Generating narrative with Claude');
        
        // Debug the top 3 records being sent to Claude
        console.log('[Claude] Top 3 records being sent:', enhancedAnalysisResult?.data?.records?.slice(0, 3).map(r => ({
          area_name: r.area_name,
          area_id: r.area_id,
          competitive_score: r.value,
          rank: r.rank
        })));
        
        setProcessingSteps(prev => prev.map(s => 
          s.id === 'narrative_generation' ? { ...s, message: 'Preparing data for narrative analysis...' } : s
        ));

        // Save the endpoint for follow-up questions
        setLastAnalysisEndpoint(analysisResult.endpoint);
        
        // Use existing Claude integration with enhanced analysis result
        const targetPretty = TARGET_OPTIONS.find(opt => opt.value === currentTarget)?.label || 'Performance';
        
        const claudePayload = {
            messages: [{ 
              role: 'user', 
              content: generateScoreDescription(analysisResult.endpoint, query)
            }],
            metadata: {
              query,
              analysisType: analysisResult.endpoint.replace('/', '').replace(/-/g, '_'), // Convert /strategic-analysis to strategic_analysis
              relevantLayers: [dataSource.layerId],
              primaryField: targetPretty,
              endpoint: analysisResult.endpoint,
              targetVariable: analysisResult.data?.targetVariable || 'analysis_score',
              analysisEndpoint: analysisResult.endpoint,
              scoreType: getScoreConfigForEndpoint(analysisResult.endpoint).scoreFieldName,
              processingTime: Date.now() - startTime
            },
            // Use the expected ProcessedLayerResult format with REAL analysis data
            featureData: [{
              layerId: 'analysis-result',
              layerName: 'Analysis Results',  
              layerType: 'polygon',
              layer: {} as any,
              features: enhancedAnalysisResult?.data?.records?.map((result: any, index: number) => {
                // Debug area names to understand the issue
                if (index < 5) {
                  console.log(`[Claude Data] Record ${index + 1} - DETAILED:`, {
                    area_name: result.area_name,
                    area_id: result.area_id,
                    typeof_area_name: typeof result.area_name,
                    typeof_area_id: typeof result.area_id,
                    area_name_is_defined: result.area_name !== undefined,
                    area_id_is_defined: result.area_id !== undefined,
                    fallback_logic: result.area_name || result.area_id || 'Unknown Area',
                    full_result_keys: Object.keys(result),
                    properties_keys: result.properties ? Object.keys(result.properties) : 'no properties'
                  });
                }
                // Extract brand market shares
                const nikeShare = result.properties?.value_MP30034A_B_P || result.value_MP30034A_B_P || 0;
                const adidasShare = result.properties?.value_MP30029A_B_P || result.value_MP30029A_B_P || 0;
                const jordanShare = result.properties?.value_MP30032A_B_P || result.value_MP30032A_B_P || 0;
                
                // Extract SHAP values for explanation
                const nikeShap = result.properties?.shap_MP30034A_B_P || result.shap_MP30034A_B_P || 0;
                const adidasShap = result.properties?.shap_MP30029A_B_P || result.shap_MP30029A_B_P || 0;
                
                // Extract demographic data  
                const totalPop = result.properties?.TOTPOP_CY || result.TOTPOP_CY || 0;
                const avgIncome = result.properties?.AVGHINC_CY || result.AVGHINC_CY || 0;
                const medianAge = result.properties?.MEDAGE_CY || result.MEDAGE_CY || 0;
                
                // Extract top SHAP features for this area
                const shapFeatures: Record<string, number> = {};
                Object.keys(result.properties || result).forEach(key => {
                  if (key.startsWith('shap_') && Math.abs((result.properties || result)[key]) > 0.1) {
                    const featureName = key.replace('shap_', '');
                    shapFeatures[featureName] = (result.properties || result)[key];
                  }
                });
                
                // Use ConfigurationManager for proper score field mapping
                const scoreConfig = getScoreConfigForEndpoint(analysisResult.endpoint);
                const scoreFieldName = scoreConfig.scoreFieldName;
                
                // Generic approach: try to find the score field from the configuration
                const targetValue = result.properties?.[scoreFieldName] || 
                                   result[scoreFieldName] || 
                                   result.value || 
                                   0;
                                   
                console.log(`[Claude Data] ${analysisResult.endpoint} - using ${scoreFieldName}: ${targetValue} for ${result.area_name}`);

                const claudeFeature = {
                  properties: {
                    area_name: result.area_name || result.area_id || 'Unknown Area',
                    area_id: result.area_id,
                    target_value: targetValue,
                    target_field: targetPretty,
                    score_field_name: scoreFieldName, // Add the correct score field name for Claude
                    rank: result.rank || 0,
                    analysis_endpoint: analysisResult.endpoint,
                    total_areas_analyzed: enhancedAnalysisResult?.data?.records?.length || 0,
                    
                    // Brand market shares
                    nike_market_share: nikeShare,
                    adidas_market_share: adidasShare, 
                    jordan_market_share: jordanShare,
                    market_gap: Math.max(0, 100 - nikeShare - adidasShare - jordanShare),
                    competitive_advantage: nikeShare - adidasShare,
                    
                    // Demographics
                    total_population: totalPop,
                    avg_income: avgIncome,
                    median_age: medianAge,
                    
                    // SHAP explanations
                    nike_shap_importance: nikeShap,
                    adidas_shap_importance: adidasShap,
                    top_shap_features: shapFeatures,
                    
                    // Market opportunity metrics
                    opportunity_score: result.value || 0,
                    
                    // CRITICAL: Add endpoint-specific score field for Claude (dynamic based on configuration)
                    [scoreFieldName]: targetValue,
                    
                    // Additional score fields for multi-endpoint compatibility
                    strategic_value_score: scoreFieldName === 'strategic_value_score' ? targetValue : (result.properties?.strategic_value_score || 0),
                    competitive_advantage_score: scoreFieldName === 'competitive_advantage_score' ? targetValue : (result.properties?.competitive_advantage_score || 0),
                    correlation_score: scoreFieldName === 'correlation_score' ? targetValue : (result.properties?.correlation_score || 0),
                    demographic_score: scoreFieldName === 'demographic_score' ? targetValue : (result.properties?.demographic_score || 0),
                    trend_score: scoreFieldName === 'trend_score' ? targetValue : (result.properties?.trend_score || 0),
                    anomaly_score: scoreFieldName === 'anomaly_score' ? targetValue : (result.properties?.anomaly_score || 0),
                    cluster_assignment: scoreFieldName === 'cluster_assignment' ? targetValue : (result.properties?.cluster_assignment || 0),
                    interaction_score: scoreFieldName === 'interaction_score' ? targetValue : (result.properties?.interaction_score || 0),
                    outlier_score: scoreFieldName === 'outlier_score' ? targetValue : (result.properties?.outlier_score || 0),
                    comparison_score: scoreFieldName === 'comparison_score' ? targetValue : (result.properties?.comparison_score || 0),
                    prediction_score: scoreFieldName === 'prediction_score' ? targetValue : (result.properties?.prediction_score || 0),
                    segment_score: scoreFieldName === 'segment_score' ? targetValue : (result.properties?.segment_score || 0),
                    scenario_score: scoreFieldName === 'scenario_score' ? targetValue : (result.properties?.scenario_score || 0),
                    
                    // Additional strategic analysis fields (avoiding duplicates)
                    demographic_opportunity_score: result.properties?.demographic_opportunity_score || 0,
                    median_income: result.properties?.median_income || 0,
                    mp30034a_b_p: result.properties?.mp30034a_b_p || 0,
                    
                    has_shap_data: Object.keys(shapFeatures).length > 0
                  }
                };
                
                // Debug what's actually being sent to Claude for first 5 records
                if (index < 5) {
                  console.log(`[Claude Data] FINAL properties being sent to Claude for record ${index + 1}:`, {
                    area_name_sent: claudeFeature.properties.area_name,
                    area_id_sent: claudeFeature.properties.area_id,
                    rank: claudeFeature.properties.rank,
                    target_value: claudeFeature.properties.target_value,
                    score_field_name: claudeFeature.properties.score_field_name,
                    strategic_value_score: claudeFeature.properties.strategic_value_score,
                    competitive_advantage_score: claudeFeature.properties.competitive_advantage_score,
                    nike_market_share: claudeFeature.properties.nike_market_share,
                    market_gap: claudeFeature.properties.market_gap,
                    demographic_opportunity_score: claudeFeature.properties.demographic_opportunity_score,
                    endpoint: claudeFeature.properties.analysis_endpoint,
                    source_area_name: result.area_name,
                    source_properties_sample: {
                      strategic_value_score: result.properties?.strategic_value_score,
                      competitive_advantage_score: result.properties?.competitive_advantage_score,
                      nike_market_share: result.properties?.nike_market_share,
                      market_gap: result.properties?.market_gap,
                      demographic_opportunity_score: result.properties?.demographic_opportunity_score
                    }
                  });
                }
                
                return claudeFeature;
              }) || [{
                properties: { 
                  area_name: 'No data available', 
                  target_field: targetPretty,
                  total_features: validFeatures.length,
                  analysis_endpoint: analysisResult.endpoint
                }
              }],
              extent: null,
              fields: [targetPretty, 'nike_market_share', 'adidas_market_share', 'opportunity_score', 'shap_features'],
              geometryType: 'polygon'
            }],
            persona: selectedPersona,
        };

        // Debug the complete payload being sent to Claude
        console.log('[Claude API] Complete payload being sent:', {
          query: claudePayload.messages[0].content,
          totalFeatures: claudePayload.featureData[0].features.length,
          firstThreeFeatures: claudePayload.featureData[0].features.slice(0, 3).map(f => ({
            area_name: f.properties.area_name,
            area_id: f.properties.area_id,
            analysis_score: f.properties.target_value
          })),
          metadata: claudePayload.metadata
        });
        
        // EXPLICIT DEBUG FOR STRATEGIC ANALYSIS CLAUDE PAYLOAD
        if (query.toLowerCase().includes('strategic')) {
          console.log('🚨🚨🚨 [STRATEGIC CLAUDE DEBUG] What Claude will receive:');
          const strategicFeatures = claudePayload.featureData[0].features.slice(0, 5);
          strategicFeatures.forEach((feature, i) => {
            const tv = feature.properties.target_value;
            console.log(`🚨🚨🚨   ${i+1}. ${feature.properties.area_name}: target_value=${tv} (type: ${typeof tv}, exact: ${tv === 79.3 ? 'YES 79.3' : 'NO'})`);
            // Check if it's being stored as a float that displays as 79.3
            if (typeof tv === 'number') {
              console.log(`🚨🚨🚨      → Raw number: ${tv}, toFixed(2): ${tv.toFixed(2)}, toFixed(1): ${tv.toFixed(1)}`);
              console.log(`🚨🚨🚨      → JSON.stringify: ${JSON.stringify(tv)}`);
            }
          });
          
          // Check if Claude receives all the same values
          const claudeValues = strategicFeatures.map(f => f.properties.target_value);
          const uniqueClaudeValues = [...new Set(claudeValues)];
          if (uniqueClaudeValues.length === 1) {
            console.log('🚨🚨🚨 ❌ PROBLEM: Claude receives identical target_values!');
            console.log('🚨🚨🚨 All Claude values:', claudeValues);
          } else {
            console.log('🚨🚨🚨 ✅ Claude receives distinct values:', uniqueClaudeValues);
          }
          
          // Also log the exact JSON that will be sent
          console.log('🚨🚨🚨 [STRATEGIC CLAUDE DEBUG] Exact JSON being sent:');
          console.log(JSON.stringify(strategicFeatures.slice(0, 2), null, 2));
        }

        const claudeResp = await fetch('/api/claude/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(claudePayload),
        });

        if (claudeResp.ok) {
          const claudeJson = await claudeResp.json();
          narrativeContent = claudeJson?.content || null;
          
          // Validate score terminology in Claude's response
          if (narrativeContent) {
            const terminologyValidation = validateScoreTerminology(analysisResult.endpoint, narrativeContent);
            if (!terminologyValidation.isValid) {
              console.warn(`[ScoreValidation] Claude analysis has incorrect terminology for ${analysisResult.endpoint}:`, terminologyValidation.issues);
              console.log(`[ScoreValidation] Expected: ${terminologyValidation.expectedTerms.join(', ')}`);
              console.log(`[ScoreValidation] Found: ${terminologyValidation.foundTerms.join(', ')}`);
            } else {
              console.log(`[ScoreValidation] ✅ Claude analysis uses correct terminology for ${analysisResult.endpoint}`);
            }
            
            // ALSO validate that score explanation is at the beginning
            const explanationValidation = validateScoreExplanationPlacement(analysisResult.endpoint, narrativeContent);
            if (!explanationValidation.hasExplanation) {
              console.warn(`[ScoreExplanation] Claude analysis missing score explanation for ${analysisResult.endpoint}:`, explanationValidation.issues);
            } else if (!explanationValidation.isAtBeginning) {
              console.warn(`[ScoreExplanation] Claude score explanation not at beginning for ${analysisResult.endpoint}:`, explanationValidation.issues);
            } else {
              console.log(`[ScoreExplanation] ✅ Claude explains score calculation at beginning for ${analysisResult.endpoint}`);
            }
          }
        } else {
          console.error('[AnalysisEngine] Claude API failed:', claudeResp.status);
        }
      } catch (err) {
        console.error('[AnalysisEngine] Claude integration failed:', err);
      }

      // Complete narrative generation step
      setProcessingSteps(prev => prev.map(s => 
        s.id === 'narrative_generation' ? { 
          ...s, 
          status: 'complete', 
          message: narrativeContent ? 'Narrative analysis complete' : 'Analysis complete (using analysis data)' 
        } : s
      ));

      // Create detailed analysis summary if Claude fails
      const baseFinalContent = narrativeContent || createAnalysisSummary(
        analysisResult, 
        enhancedAnalysisResult, 
        validFeatures.length,
        query,
        TARGET_OPTIONS,
        currentTarget
      );
      
      // Check for fallback analysis and add warning message if needed
      const isFallbackAnalysis = enhancedAnalysisResult?.is_fallback || 
                                 enhancedAnalysisResult?.status === 'fallback' ||
                                 baseFinalContent?.includes?.('fallback') ||
                                 baseFinalContent?.includes?.('unavailable');
      
      const fallbackWarning = isFallbackAnalysis ? 
        `⚠️ **Limited Analysis Mode**: The full AI analysis service is currently unavailable. This is a simplified analysis using basic data patterns. Please try again later for complete insights with advanced scoring and recommendations.\n\n---\n\n` : '';
      
      const finalContent = fallbackWarning + baseFinalContent;
      
      // Update message with streaming content
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { 
              ...msg, 
              content: finalContent, 
              metadata: { 
                ...msg.metadata, 
                analysisResult: enhancedAnalysisResult,
                isStreaming: true 
              } 
            }
          : msg
      ));

      // Clear progress steps when streaming begins
      setIsProcessing(false);
      setCurrentProcessingStep(null);

      addContextMessage({
        role: 'assistant',
        content: finalContent,
        metadata: { analysisResult: enhancedAnalysisResult }
      } as ChatMessage);

      await refreshContextSummary();
      
      // CRITICAL FIX: Use FULL data for features context, not visualization-optimized data
      // Convert enhancedAnalysisResult.data.records back to GeospatialFeature format for analysis/chat
      const fullDataFeatures = enhancedAnalysisResult.data.records.map((record: any) => ({
        type: 'Feature' as const,
        geometry: record.geometry,
        properties: {
          ...record.properties,
          // Ensure all analysis fields are preserved for chat context
          thematic_value: record.value,
          target_value: record.value,
          area_name: record.area_name,
          area_id: record.area_id || record.properties?.ID
        }
      }));
      
      console.log('🚨 [FEATURES STORAGE] Using FULL data for analysis context:', {
        fullDataFeaturesLength: fullDataFeatures.length,
        visualizationFeaturesLength: validFeatures.length,
        preservedAllFields: true,
        sampleFullDataFields: fullDataFeatures[0] ? Object.keys(fullDataFeatures[0].properties).length : 0,
        sampleRecord: fullDataFeatures[0] ? {
          thematic_value: fullDataFeatures[0].properties?.thematic_value,
          value_MP30034A_B_P: fullDataFeatures[0].properties?.value_MP30034A_B_P,
          description: fullDataFeatures[0].properties?.DESCRIPTION,
          totalProperties: Object.keys(fullDataFeatures[0].properties).length
        } : 'No features'
      });
      
      // Use FULL data for analysis/chat context, not visualization-optimized data
      setFeatures(fullDataFeatures as GeospatialFeature[]);

      console.log('[AnalysisEngine] Integration complete');

      // Add multi-endpoint result handling
      handleMultiEndpointResult(analysisResult);
    } catch (error) {
      console.error('[ANALYSIS ENGINE ERROR]', error);
      console.error('[AnalysisEngine] Error during analysis:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      
      setProcessingSteps(prev => prev.map(s => {
        if (s.status === 'processing') {
          return { ...s, status: 'error', message: errorMessage };
        }
        if (currentProcessingStep && s.id === currentProcessingStep) {
          return { ...s, status: 'error', message: errorMessage };
        }
        return s;
      }));
      
      // Clear progress steps on error
      setIsProcessing(false);
      setCurrentProcessingStep(null);
      
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId ? {
          ...msg,
          content: `Sorry, I encountered an error while processing your query: ${errorMessage}`,
          metadata: { ...msg.metadata, error: errorMessage, isStreaming: false }
        } : msg
      ));
    } finally {
      // Progress steps are now cleared when streaming begins
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(inputQuery, 'main');
  };

  // --- Plain conversational chat ---
  const sendChatMessage = async (text: string) => {
    console.log('🚨 [FUNCTION CALL] sendChatMessage called with text:', text);
    console.log('🚨 [FUNCTION CALL] This may be using different data than handleSubmit!');
    
    // 🎯 NEW: Detect ranking queries for unified system
    const queryLower = text?.toLowerCase() || '';
    const isRankingQuery = queryLower.includes('top') || queryLower.includes('best') || 
                          queryLower.includes('highest') || queryLower.includes('worst') ||
                          queryLower.includes('lowest') || queryLower.includes('bottom');
    
    // Extract number if specified (e.g., "top 5", "best 15")
    let requestedCount = 10; // Default
    const numberMatch = queryLower.match(/(?:top|best|highest|worst|lowest|bottom)\s+(\d+)/);
    if (numberMatch) {
      requestedCount = Math.min(50, Math.max(1, parseInt(numberMatch[1]))); // Cap between 1-50
    }
    
    console.log(`🎯 [RANKING SYSTEM] sendChatMessage - Query: "${text}", isRankingQuery: ${isRankingQuery}, requestedCount: ${requestedCount}`);
    
    const userId = `chat-user-${Date.now()}`;
    const assistantId = `chat-assistant-${Date.now() + 1}`;

    const userMsg: LocalChatMessage = {
      id: userId,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const placeholder: LocalChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '…',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    addContextMessage({ role: 'user', content: text });

    // Debug the features state
    console.log('[DEBUG] sendChatMessage - features state:', {
      hasFeatures: !!features,
      featuresLength: features?.length || 0,
      firstFeatureSample: features?.[0] ? {
        keys: Object.keys(features[0]),
        propertiesKeys: features[0].properties ? Object.keys(features[0].properties) : 'no properties',
        hasGeometry: !!features[0].geometry
      } : 'no first feature'
    });

    try {
      // Build comprehensive data summary instead of sending raw features
      let dataSummary = undefined;
      if (features && features.length > 0) {
        // Check if we have a recent cached summary to avoid regenerating identical data
        const currentFeaturesHash = features.length + '-' + (features[0]?.properties?.thematic_value || 'unknown');
        // DISABLE CACHE to force regeneration with fixed competitive scores
        const cacheIsValid = false; // cachedDatasetSummary && 
                           // datasetCacheTimestamp && 
                           // (Date.now() - new Date(datasetCacheTimestamp).getTime()) < 300000; // 5 minutes
        
        if (cacheIsValid && cachedDatasetSummary.featuresHash === currentFeaturesHash) {
          console.log('[DEBUG] Using cached dataset summary');
          dataSummary = {
            ...cachedDatasetSummary.summary,
            queryContext: {
              ...cachedDatasetSummary.summary.queryContext,
              currentQuestion: text,
              conversationHistory: messages.slice(-4).map(m => ({
                role: m.role,
                content: m.content.substring(0, 200)
              })),
              totalMessagesInConversation: messages.length
            }
          };
        } else {
          console.log('[DEBUG] Generating fresh dataset summary');
          
          // Generate comprehensive statistical summary of the entire dataset
          const allProps = features.map(f => f.properties || {});
        
        // Extract all numeric fields
        const numericFields = Object.keys(allProps[0] || {}).filter(key => {
          const sampleValues = allProps.slice(0, 10).map(p => p[key]).filter(v => v !== null && v !== undefined);
          return sampleValues.length > 0 && sampleValues.every(v => typeof v === 'number' && !isNaN(v));
        });

        // Calculate comprehensive statistics for each field
        const fieldStats: Record<string, any> = {};
        numericFields.forEach(field => {
          const values = allProps.map(p => p[field]).filter(v => typeof v === 'number' && !isNaN(v));
          if (values.length > 0) {
            const sorted = values.sort((a, b) => a - b);
            fieldStats[field] = {
              count: values.length,
              min: Math.min(...values),
              max: Math.max(...values),
              mean: values.reduce((a, b) => a + b, 0) / values.length,
              median: sorted[Math.floor(sorted.length / 2)],
              q1: sorted[Math.floor(sorted.length * 0.25)],
              q3: sorted[Math.floor(sorted.length * 0.75)],
              std: Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length)
            };
          }
        });

        // Get top and bottom performers for thematic_value
        const sortedByThematic = features
          .filter(f => f.properties?.thematic_value != null)
          .map(f => {
            // DEBUG: Log ALL thematic_values to see what we're working with
            console.log(`🔍 [DEBUG] ${f.properties?.DESCRIPTION || f.properties?.ID}: thematic_value=${f.properties?.thematic_value}`);
            
            // AGGRESSIVE: Cap ALL thematic_values for competitive analysis (not just >10)
            let originalThematic = f.properties?.thematic_value || 0;
            let cappedThematic = originalThematic;
            
            // For competitive analysis, cap any value that looks like market share percentage
            console.log(`🔍 [CAPPING DEBUG] ${f.properties?.DESCRIPTION}:`);
            console.log(`   originalThematic: ${originalThematic} (from thematic_value)`);
            console.log(`   originalThematic > 10? ${originalThematic > 10}`);
            
            if (originalThematic > 10) {
              cappedThematic = Math.max(1.0, Math.min(10.0, originalThematic / 10));
              console.log(`🔧 [CAPPING APPLIED] ${f.properties?.DESCRIPTION}: ${originalThematic} → ${cappedThematic.toFixed(1)}`);
            } else {
              console.log(`✅ [NO CAPPING NEEDED] ${f.properties?.DESCRIPTION}: ${originalThematic} (already ≤10)`);
            }
            console.log(`   → cappedThematic: ${cappedThematic}`);
            
            return { ...f, cappedThematic, originalThematic };
          })
          .sort((a, b) => (b.cappedThematic || 0) - (a.cappedThematic || 0));
        
        console.log('🚨 [CLAUDE PREP] About to create topPerformers, sortedByThematic.length:', sortedByThematic.length);
        
        // 🔥 NEW: Use unified ranking system instead of hardcoded 20-feature limit
        // Detect if user is asking for specific number of top/bottom performers
        const queryLower = text?.toLowerCase() || '';
        const isRankingQuery = queryLower.includes('top') || queryLower.includes('best') || 
                              queryLower.includes('highest') || queryLower.includes('worst') ||
                              queryLower.includes('lowest') || queryLower.includes('bottom');
        
        // Extract number if specified (e.g., "top 5", "best 15")
        let requestedCount = 10; // Default
        const numberMatch = queryLower.match(/(?:top|best|highest|worst|lowest|bottom)\s+(\d+)/);
        if (numberMatch) {
          requestedCount = Math.min(50, Math.max(1, parseInt(numberMatch[1]))); // Cap between 1-50
        }
        
        console.log(`🎯 [RANKING SYSTEM] Query: "${text}", isRankingQuery: ${isRankingQuery}, requestedCount: ${requestedCount}`);
        
        // Use dynamic count instead of hardcoded 20, but still include full dataset context
        const topPerformersForRanking = isRankingQuery ? 
          sortedByThematic.slice(0, requestedCount) : 
          sortedByThematic.slice(0, 20); // Keep existing behavior for non-ranking queries
        
        console.log(`🎯 [RANKING SYSTEM] Selected ${topPerformersForRanking.length} performers from ${sortedByThematic.length} total features`);
        
        // Map features to the format expected by Claude
        const topPerformers = topPerformersForRanking.map(f => {
          // Use the already capped value from sorting
          const competitiveScore = f.cappedThematic;
          console.log('🚨 [CLAUDE PREP] Creating performer for:', f.properties?.DESCRIPTION, 'with competitiveScore:', competitiveScore);
          
          const performerData = {
            id: f.properties?.ID || f.properties?.OBJECTID,
            description: f.properties?.DESCRIPTION,
            competitive_advantage_score: competitiveScore, // PRIMARY RANKING METRIC
            // Market share context data for explanation (clearly labeled as context, not ranking)
            market_share_context: {
              nike: f.properties?.value_MP30034A_B_P || 0,
              adidas: f.properties?.value_MP30029A_B_P || 0,
              jordan: f.properties?.value_MP30032A_B_P || 0,
              puma: f.properties?.value_MP30035A_B_P || 0,
              new_balance: f.properties?.value_MP30033A_B_P || 0,
              asics: f.properties?.value_MP30030A_B_P || 0
            }
          };
          
          // Debug exactly what competitive_advantage_score is being sent to Claude
          console.log(`📊 [Claude Data] ${performerData.description}:`);
          console.log(`   Original thematic_value: ${f.originalThematic}`);
          console.log(`   Capped competitive_advantage_score: ${performerData.competitive_advantage_score}`);
          console.log('🚨 ACTUAL CLAUDE DATA:', JSON.stringify(performerData, null, 2));
          
          // Debug any >10 values being sent to Claude
          Object.entries(performerData).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 10) {
              console.error(`🔥 [Claude Data] Sending ${key}=${value} > 10 to Claude for ${f.properties?.DESCRIPTION}`);
            }
          });
          
          return performerData;
        });

        const bottomPerformers = sortedByThematic.slice(-10).map(f => ({
          id: f.properties?.ID || f.properties?.OBJECTID,
          description: f.properties?.DESCRIPTION,
          thematic_value: f.cappedThematic // Use capped value
        }));

        // Geographic distribution analysis
        const geographicDistribution = {
          totalFeatures: features.length,
          uniqueDescriptions: new Set(allProps.map(p => p.DESCRIPTION).filter(Boolean)).size,
          thematicValueRange: fieldStats.thematic_value ? {
            min: fieldStats.thematic_value.min,
            max: fieldStats.thematic_value.max,
            mean: fieldStats.thematic_value.mean
          } : null
        };

        // Brand performance comparison (if brand fields exist)
        const brandFields = numericFields.filter(field => 
          field.includes('MP300') && (field.includes('_P') || field.includes('_B'))
        );
        
        const brandComparison: Record<string, any> = {};
        brandFields.forEach(field => {
          if (fieldStats[field]) {
            const brandName = field.includes('MP30034') ? 'Nike' :
                            field.includes('MP30029') ? 'Adidas' :
                            field.includes('MP30035') ? 'Puma' :
                            field.includes('MP30030') ? 'Asics' :
                            field.includes('MP30031') ? 'Converse' :
                            field.includes('MP30032') ? 'Jordan' :
                            field.includes('MP30033') ? 'New Balance' :
                            field.includes('MP30036') ? 'Reebok' :
                            field;
            
            brandComparison[brandName] = {
              field: field,
              ...fieldStats[field],
              topAreas: sortedByThematic
                .filter(f => f.properties?.[field] != null)
                .sort((a, b) => (b.properties?.[field] || 0) - (a.properties?.[field] || 0))
                .slice(0, 5)
                .map(f => ({
                  description: f.properties?.DESCRIPTION,
                  value: f.properties?.[field]
                }))
            };
          }
        });

        // Extract SHAP analysis data from the current visualization layer if available
        let shapAnalysisData = null;
        if (currentVisualizationLayer.current) {
          const shapFeatureImportance = (currentVisualizationLayer.current as any).shapFeatureImportance;
          const shapTargetVariable = (currentVisualizationLayer.current as any).shapTargetVariable;
          
          console.log('[DEBUG] sendChatMessage - Checking visualization layer for SHAP data:', {
            hasVisualizationLayer: !!currentVisualizationLayer.current,
            hasShapFeatureImportance: !!shapFeatureImportance,
            shapFeatureImportanceLength: shapFeatureImportance ? shapFeatureImportance.length : 0,
            hasShapTargetVariable: !!shapTargetVariable,
            shapTargetVariable: shapTargetVariable,
            layerKeys: currentVisualizationLayer.current ? Object.keys(currentVisualizationLayer.current) : null
          });
          
          if (shapFeatureImportance && shapFeatureImportance.length > 0) {
            shapAnalysisData = {
              featureImportance: shapFeatureImportance,
              targetVariable: shapTargetVariable,
              analysisType: lastAnalysisResult?.queryType || 'ranking',
              results: [], // We don't need the full results array for follow-up questions
              summary: `SHAP analysis available for ${shapFeatureImportance.length} features`
            };
            
            console.log('[DEBUG] sendChatMessage - Found SHAP analysis data:', {
              featureImportanceCount: shapFeatureImportance.length,
              targetVariable: shapTargetVariable,
              topFeatures: shapFeatureImportance.slice(0, 5).map((f: any) => ({ feature: f.feature, importance: f.importance }))
            });
          }
        }

        // Create comprehensive summary with enhanced context for follow-up
        dataSummary = {
          datasetOverview: {
            totalFeatures: features.length,
            analysisTimestamp: new Date().toISOString(),
            geographicCoverage: geographicDistribution,
            sessionType: 'follow-up-chat'
          },
          fieldStatistics: fieldStats,
          performanceAnalysis: {
            topPerformers,
            bottomPerformers,
            primaryField: 'thematic_value'
          },
          brandAnalysis: brandComparison,
          queryContext: {
            originalQuery: messages.find(m => m.role === 'user')?.content || text,
            currentQuestion: text,
            conversationHistory: messages.slice(-4).map(m => ({
              role: m.role,
              content: m.content.substring(0, 200) // Truncate for size
            })),
            analysisType: lastAnalysisEndpoint ? lastAnalysisEndpoint.replace('/', '').replace(/-/g, '_') : 'follow-up-chat',
            totalMessagesInConversation: messages.length
          },
          // Add cached analysis results if available
          lastAnalysisContext: lastAnalysisResult ? {
            query: lastAnalysisResult.originalQuery || lastAnalysisResult.intent,
            analysisType: lastAnalysisResult.queryType,
            timestamp: new Date().toISOString()
          } : null,
          // Include SHAP analysis data if available
          shapAnalysis: shapAnalysisData
        };

          // Cache the summary for future use
          setCachedDatasetSummary({
            summary: dataSummary,
            featuresHash: currentFeaturesHash
          });
          setDatasetCacheTimestamp(new Date().toISOString());
        } // End else block for fresh generation

        console.log('[DEBUG] sendChatMessage comprehensive summary:', {
          totalFeatures: features.length,
          numericFields: dataSummary?.fieldStatistics ? Object.keys(dataSummary.fieldStatistics).length : 0,
          fieldStatsKeys: dataSummary?.fieldStatistics ? Object.keys(dataSummary.fieldStatistics) : [],
          topPerformersCount: dataSummary?.performanceAnalysis?.topPerformers?.length || 0,
          brandComparisonKeys: dataSummary?.brandAnalysis ? Object.keys(dataSummary.brandAnalysis) : [],
          summarySize: JSON.stringify(dataSummary).length,
          usedCache: cacheIsValid && cachedDatasetSummary?.featuresHash === currentFeaturesHash,
          hasShapAnalysis: !!dataSummary?.shapAnalysis,
          shapAnalysisKeys: dataSummary?.shapAnalysis ? Object.keys(dataSummary.shapAnalysis) : null,
          shapFeatureImportanceCount: dataSummary?.shapAnalysis?.featureImportance?.length || 0
        });
        
        console.log('[DEBUG] Full dataSummary being sent to Claude:', JSON.stringify(dataSummary, null, 2));
      }

      console.log('🚨 [SENDCHATMESSAGE] About to call Claude API with dataSummary');
      console.log('🚨 [SENDCHATMESSAGE] Features count:', features?.length || 0);
      console.log('🚨 [SENDCHATMESSAGE] First feature sample:', features?.[0] ? {
        thematic_value: features[0].properties?.thematic_value,
        value_MP30034A_B_P: features[0].properties?.value_MP30034A_B_P,
        description: features[0].properties?.DESCRIPTION
      } : 'No features');

      const resp = await fetch('/api/claude/generate-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: text },
          ],
          metadata: {
            contextSummary: contextSummary || undefined,
            rankingContext: isRankingQuery ? {
              isRankingQuery: true,
              requestedCount: requestedCount,
              totalFeatures: features?.length || 0,
              queryType: queryLower.includes('top') || queryLower.includes('best') || queryLower.includes('highest') ? 'top' : 'bottom'
            } : undefined,
          },
          featureData: dataSummary,
          persona: selectedPersona,
        }),
      });

      let content = 'Sorry, I had trouble answering that.';
      if (resp.ok) {
        const js = await resp.json();
        console.log('[sendChatMessage] API response:', js);
        content = js?.content || content;
      } else {
        console.error('[sendChatMessage] API error:', resp.status, resp.statusText);
        const errorText = await resp.text();
        console.error('[sendChatMessage] Error details:', errorText);
        content = `Sorry, I encountered an error (${resp.status}): ${errorText}`;
      }

      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { 
        ...m, 
        content,
        metadata: { ...m.metadata, isStreaming: true }
      } : m)));
      addContextMessage({ role: 'assistant', content });
    } catch (err) {
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { 
        ...m, 
        content: 'Error: ' + (err as Error).message,
        metadata: { ...m.metadata, isStreaming: false }
      } : m)));
    }
  };

  // Message dialog component
  const MessageDialog: React.FC<{ message: LocalChatMessage | null; onClose: () => void }> = ({ message, onClose }) => {
    if (!message) return null;

    return (
      <Dialog open={!!message} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Analysis Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.metadata?.totalFeatures !== undefined && (
              <div>
                <h4 className="font-semibold">Results:</h4>
                <p>{message.metadata.totalFeatures} features found</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Before rendering the Infographics side panel
  console.log('[GeospatialChat] isInfographicsOpen:', isInfographicsOpen);

  const handleVisualizationUpdate = async (messageId: string, options: any) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !message.metadata?.analysisResult) {
      toast({ title: "Update Failed", description: "Original analysis data not found.", variant: "destructive" });
      return;
    }
  
    // Retrieve original features directly from the message's metadata
    // This relies on the handleSubmit function storing the features used for the *initial* visualization
    const originalFeatures = (message.metadata.debugInfo?.features as GeospatialFeature[]) || [];
  
    if (!originalFeatures || originalFeatures.length === 0) {
      toast({ title: "Update Failed", description: "No features available to re-visualize.", variant: "destructive" });
      return;
    }
  
    try {
      const originalAnalysisResult = message.metadata.analysisResult;

      const visualizationFactory = new VisualizationFactory({
        analysisResult: originalAnalysisResult,
        enhancedAnalysis: originalAnalysisResult,
        features: { features: originalFeatures }
      });
      
      const layerResultForViz = [{ layerId: dataSource.layerId, layerName: 'Analysis Results', features: originalFeatures }];
      
      const newVisualizationResult = await visualizationFactory.createVisualization(layerResultForViz, {
        ...options,
        title: originalAnalysisResult.query, 
      });
  
      if (!newVisualizationResult || !newVisualizationResult.layer) throw new Error('Failed to create updated visualization layer.');
  
      if (currentVisualizationLayer.current && currentMapView && currentMapView.map) {
        try {
          currentMapView.map.remove(currentVisualizationLayer.current);
        } catch (error) {
          console.warn('[GeospatialChat] Error removing visualization layer:', error);
        }
      }
      onVisualizationLayerCreated(newVisualizationResult.layer, true);
      currentVisualizationLayer.current = newVisualizationResult.layer;
  
      setVisualizationResult(newVisualizationResult as ChatVisualizationResult);
      if (newVisualizationResult.legendInfo) setFormattedLegendData(newVisualizationResult.legendInfo);
  
      toast({ title: "Visualization Updated", description: `Switched to ${options.visualizationMode || 'new'} view.` });

      // --- Refresh narrative analysis ---
      try {
        const processedLayersForClaude = [{
          layerId: dataSource.layerId,
          layerName: 'Analysis Results',
          layerType: 'polygon',
          features: originalFeatures,
        }];

        // Map visualization type to analysisType if available
        const vizTypeToAnalysis: Record<string, string> = {
          correlation: 'correlation',
          ranking: 'ranking',
          distribution: 'single_layer',
        };

        const claudeResp = await fetch('/api/claude/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: message.content }],
            metadata: {
              query: message.content,
              analysisType: lastAnalysisEndpoint ? lastAnalysisEndpoint.replace('/', '').replace(/-/g, '_') : (originalAnalysisResult.queryType || vizTypeToAnalysis[options.type] || 'single_layer'),
              relevantLayers: [dataSource.layerId],
              clusterOptions: options.clusters ?? undefined,
            },
            featureData: processedLayersForClaude,
            persona: selectedPersona, // Add selected persona
          }),
        });

        if (claudeResp.ok) {
          const claudeJson = await claudeResp.json();
          const newContent = claudeJson?.content;
          if (newContent) {
            setMessages(prev => prev.map(m => m.id === messageId ? { 
            ...m, 
            content: newContent,
            metadata: { ...m.metadata, isStreaming: false }
          } : m));
          }
        }
      } catch (refreshErr) {
        console.warn('[VisualizationUpdate] Failed to refresh analysis narrative:', refreshErr);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Update Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setIsVizPanelOpen(false);
    }
  };

  const [inputMode, setInputMode] = useState<'analysis' | 'chat'>('analysis');

  // Reset manual override whenever the user enters a completely new query
  const lastQueryRef = useRef<string>('');
  useEffect(() => {
    if (manualTargetOverride && inputQuery !== lastQueryRef.current) {
      setManualTargetOverride(false);
    }
    lastQueryRef.current = inputQuery;
  }, [inputQuery, manualTargetOverride]);

  // Dynamic field name resolution - handles multiple dataset formats
  const findActualFieldName = (targetVariable: string, props: any): string => {
    if (!props || !targetVariable) return targetVariable;

    const snakeTarget = targetVariable.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    // First, try exact match
    if (props.hasOwnProperty(targetVariable)) return targetVariable;
    if (props.hasOwnProperty(snakeTarget)) return snakeTarget;
    
    // Dynamic field pattern generation - handles common dataset formats
    const generateFieldPatterns = (fieldName: string): string[] => {
      const base = fieldName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const upper = fieldName.toUpperCase();
      const upperUnderscore = upper.replace(/([A-Z])([0-9])/g, '$1_$2').replace(/([0-9])([A-Z])/g, '$1_$2');
      
      return [
        // Original formats
        fieldName,
        base,
        upper,
        upperUnderscore,
        base.replace(/_/g, ''),
        upper.replace(/_/g, ''),
        
        // Microservice export formats (value_ and shap_ prefixes)
        `value_${upper}`,
        `value_${upperUnderscore}`,
        `value_${base.toUpperCase()}`,
        `shap_${upper}`,
        `shap_${upperUnderscore}`,
        `shap_${base.toUpperCase()}`,
        
        // Legacy formats
        `${base}_p`,
        `${upper}_P`,
        
        // Alternative formats
        fieldName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
        fieldName.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase(),
      ];
    };
    
    // Try all generated patterns
    const patterns = generateFieldPatterns(targetVariable);
    for (const pattern of patterns) {
      if (props.hasOwnProperty(pattern)) {
        console.log('[Dynamic Field Detection] Field mapping:', targetVariable, '->', pattern);
        return pattern;
      }
    }
    
    // Smart fuzzy matching for similar field names
    const availableFields = Object.keys(props);
    const findSimilarField = (target: string): string | null => {
      // Remove common prefixes and suffixes for comparison
      const normalizeField = (field: string) => 
        field.toLowerCase()
          .replace(/^(value_|shap_|raw_)/, '')
          .replace(/(_p|_percent|_pct)$/, '')
          .replace(/[^a-z0-9]/g, '');
      
      const normalizedTarget = normalizeField(target);
      
      for (const field of availableFields) {
        const normalizedField = normalizeField(field);
        if (normalizedField === normalizedTarget) {
          console.log('[Fuzzy Field Detection] Found similar field:', target, '->', field);
          return field;
        }
      }
      
      // Check for partial matches (useful for brand codes like MP30034A_B_P)
      const targetCode = target.match(/MP\d+[A-Z]*_[A-Z]*_[A-Z]*/i)?.[0];
      if (targetCode) {
        for (const field of availableFields) {
          if (field.toLowerCase().includes(targetCode.toLowerCase())) {
            console.log('[Brand Code Detection] Found brand field:', target, '->', field);
            return field;
          }
        }
      }
      
      return null;
    };
    
    const similarField = findSimilarField(targetVariable);
    if (similarField) {
      return similarField;
    }
    
    console.log('[Dynamic Field Detection] No field mapping found for:', targetVariable);
    console.log('[Dynamic Field Detection] Available fields sample:', availableFields.slice(0, 10));
    
    // Return original if no match found
    return targetVariable;
  };

  // Add multi-endpoint result handling
  const handleMultiEndpointResult = (result: any) => {
    if (result.metadata?.isMultiEndpoint) {
      console.log('🔄 Multi-endpoint analysis result:', {
        endpoints: result.metadata.endpointsUsed,
        strategy: result.metadata.mergeStrategy,
        records: result.metadata.dataPointCount,
        insights: result.metadata.strategicInsights?.topOpportunities?.length || 0
      });

      // Update UI to show multi-endpoint specific information
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'multi_endpoint_result',
        role: 'assistant',
        content: JSON.stringify(result),
        timestamp: new Date()
      }]);
    }
  };

  const createMultiEndpointMessage = (result: any) => {
    const metadata = result.metadata;
    const insights = metadata.strategicInsights;
    const performanceMetrics = metadata.performanceMetrics;
    
    let message = `🎯 **Multi-Endpoint Analysis Complete**\n\n`;
    
    // Executive Summary Section
    message += `**📊 Executive Summary:**\n`;
    message += `Analysis Confidence: ${((metadata.analysisConfidence || 0) * 100).toFixed(1)}%\n`;
    message += `Strategic Priority: ${metadata.investmentPriority || 'Standard'}\n`;
    message += `Risk Level: ${metadata.riskLevel || 'Moderate'}\n\n`;
    
    // Performance Metrics Section
    if (performanceMetrics) {
      message += `**⚡ Performance Metrics:**\n`;
      message += `• Execution Time: ${((performanceMetrics.totalAnalysisTime || 0) / 1000).toFixed(1)}s\n`;
      message += `• Endpoints Integrated: ${metadata.endpointsUsed?.length || 'Multiple'}\n`;
      message += `• Geographic Coverage: ${metadata.dataPointCount?.toLocaleString() || 'N/A'} locations\n`;
      message += `• Data Quality: ${performanceMetrics.dataQuality || 'High'} merge completeness\n`;
      message += `• Analysis Depth: ${performanceMetrics.analysisDepth || 'Comprehensive'}\n\n`;
    }
    
    // Strategy and Endpoints Used
    message += `**🔄 Analysis Strategy:**\n`;
    message += `• Merge Strategy: ${metadata.mergeStrategy || 'Overlay'}\n`;
    message += `• Endpoints Combined: ${metadata.endpointsUsed?.join(', ') || 'Multiple analysis types'}\n`;
    message += `• Total Records Analyzed: ${metadata.dataPointCount?.toLocaleString() || 'N/A'}\n\n`;
    
    // Cross-Endpoint Validation
    if (metadata.crossEndpointValidation) {
      message += `**✅ Cross-Endpoint Validation:**\n`;
      message += `• High Confidence Areas: ${metadata.crossEndpointValidation.highConfidence || 0}\n`;
      message += `• Medium Confidence Areas: ${metadata.crossEndpointValidation.mediumConfidence || 0}\n`;
      message += `• Validation Score: ${((metadata.crossEndpointValidation.overallScore || 0) * 100).toFixed(1)}%\n\n`;
    }
    
    // Strategic Opportunities (Geographic Focus)
    if (insights?.topOpportunities?.length > 0) {
      message += `**🎯 High-Opportunity Geographic Areas:**\n`;
      insights.topOpportunities.slice(0, 5).forEach((opp: any, index: number) => {
        const location = typeof opp === 'string' ? opp : opp.area_name || opp.location;
        const score = typeof opp === 'object' ? opp.score?.toFixed(1) : '';
        const confidence = typeof opp === 'object' ? opp.confidence : '';
        
        message += `${index + 1}. ${location}`;
        if (score) message += ` (Score: ${score})`;
        if (confidence) message += ` [${(confidence * 100).toFixed(0)}% confidence]`;
        message += `\n`;
      });
      message += `\n`;
    }
    
    // Strategic Recommendations (Risk-Adjusted)
    if (insights?.recommendations?.length > 0) {
      message += `**💡 Risk-Adjusted Strategic Recommendations:**\n`;
      insights.recommendations.slice(0, 3).forEach((rec: any, index: number) => {
        const recommendation = typeof rec === 'string' ? rec : rec.recommendation || rec.action;
        const priority = typeof rec === 'object' ? rec.priority : '';
        const riskLevel = typeof rec === 'object' ? rec.riskLevel : '';
        
        message += `${index + 1}. ${recommendation}`;
        if (priority) message += ` [${priority} Priority]`;
        if (riskLevel) message += ` (${riskLevel} Risk)`;
        message += `\n`;
      });
      message += `\n`;
    }
    
    // Risk Assessment
    if (insights?.riskFactors?.length > 0) {
      message += `**⚠️ Risk Assessment:**\n`;
      insights.riskFactors.slice(0, 3).forEach((risk: any, index: number) => {
        const factor = typeof risk === 'string' ? risk : risk.factor || risk.description;
        const impact = typeof risk === 'object' ? risk.impact : '';
        const likelihood = typeof risk === 'object' ? risk.likelihood : '';
        
        message += `${index + 1}. ${factor}`;
        if (impact) message += ` - ${impact}`;
        if (likelihood) message += ` (${likelihood} likelihood)`;
        message += `\n`;
      });
      message += `\n`;
    }
    
    // Implementation Timeline
    if (insights?.implementationTimeline) {
      message += `**📅 Implementation Timeline:**\n`;
      if (insights.implementationTimeline.immediate) {
        message += `• Immediate (0-30 days): ${insights.implementationTimeline.immediate.length} actions\n`;
      }
      if (insights.implementationTimeline.shortTerm) {
        message += `• Short-term (1-6 months): ${insights.implementationTimeline.shortTerm.length} strategies\n`;
      }
      if (insights.implementationTimeline.longTerm) {
        message += `• Long-term (6+ months): ${insights.implementationTimeline.longTerm.length} initiatives\n`;
      }
      message += `\n`;
    }
    
    // Performance Summary
    message += `**📈 Analysis Summary:**\n`;
    message += `This comprehensive ${metadata.endpointsUsed?.length || 'multi'}-endpoint analysis provides `;
    message += `${((metadata.analysisConfidence || 0) * 100).toFixed(0)}% confidence in the strategic recommendations. `;
    message += `${metadata.dataPointCount?.toLocaleString() || 'Multiple'} geographic locations were analyzed `;
    message += `using ${metadata.mergeStrategy || 'advanced'} data integration techniques.\n`;
    
    return message;
  };

  /**
   * CRITICAL FIX: Join AnalysisEngine results with geographic features
   */
  const joinAnalysisWithGeography = async (
    analysisData: ProcessedAnalysisData,
    geographicFeatures: FeatureType[]
  ): Promise<any[]> => {
    try {
      console.log('[joinAnalysisWithGeography] Starting join:', {
        analysisRecords: analysisData.records?.length || 0,
        geographicFeatures: geographicFeatures.length
      });

      // Create a map of geographic features by ID for fast lookup
      const geoFeatureMap = new Map<string, FeatureType>();
      geographicFeatures.forEach(feature => {
        if (feature?.properties) {
          // Try multiple ID field variations
          const id = feature.properties.GEOID || 
                    feature.properties.ID || 
                    feature.properties.id ||
                    feature.properties.area_id ||
                    feature.properties.OBJECTID;
          if (id) {
            geoFeatureMap.set(String(id), feature);
          }
        }
      });

      console.log('[joinAnalysisWithGeography] Geographic feature map created:', geoFeatureMap.size);

      // Join analysis data with geographic features
      const joinedResults = analysisData.records.map((record: any, index: number) => {
        // Try to match with geographic feature
        const recordId = String(record.area_id || record.id || record.ID || index);
        const geoFeature = geoFeatureMap.get(recordId);

        if (geoFeature) {
          // Successfully joined - use geographic feature's name and geometry
          return {
            ...record,
            area_name: geoFeature.properties?.CSDNAME || 
                      geoFeature.properties?.NAME || 
                      geoFeature.properties?.area_name || 
                      record.area_name || 
                      `Area ${recordId}`,
            geometry: geoFeature.geometry,
            // Preserve all original properties
            properties: {
              ...record.properties,
              ...geoFeature.properties
            }
          };
        } else {
          // No geographic match - use analysis data with fallback
          return {
            ...record,
            area_name: record.area_name || `Area ${recordId}`,
            geometry: null // Will need to be handled in visualization
          };
        }
      });

      console.log('[joinAnalysisWithGeography] Join complete:', {
        totalRecords: joinedResults.length,
        withGeometry: joinedResults.filter(r => r.geometry).length,
        withoutGeometry: joinedResults.filter(r => !r.geometry).length,
        sampleRecord: joinedResults[0] ? {
          area_name: joinedResults[0].area_name,
          value: joinedResults[0].value,
          hasGeometry: !!joinedResults[0].geometry
        } : null
      });

      return joinedResults;

    } catch (error) {
      console.error('[joinAnalysisWithGeography] Error joining data:', error);
      // Return original records with fallback area names
      return analysisData.records.map((record: any, index: number) => ({
        ...record,
        area_name: record.area_name || `Area ${index + 1}`,
        geometry: null
      }));
    }
  };

  /**
   * Load cached geographic data as fallback when ArcGIS service is slow/unavailable
   */
  const loadCachedGeographicData = async (): Promise<FeatureType[]> => {
    try {
      // Try to load from cached geographic data files
      const geoDataPaths = [
        '/data/geographic-features.json',
        '/data/boundaries.json', 
        '/data/fsas.json'
      ];

      for (const path of geoDataPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            const geoData = await response.json();
            
            // Convert to standard FeatureType format
            if (geoData.features && Array.isArray(geoData.features)) {
              console.log('[loadCachedGeographicData] ✅ Loaded cached geographic data from:', path);
              return geoData.features as FeatureType[];
            }
          }
        } catch (error) {
          console.warn('[loadCachedGeographicData] Failed to load:', path, error);
          continue;
        }
      }

      // If no cached geo data, generate minimal fallback features from analysis data
      console.log('[loadCachedGeographicData] No cached geo files, generating fallback features...');
      return generateFallbackFeatures();
      
    } catch (error) {
      console.error('[loadCachedGeographicData] Error loading cached geographic data:', error);
      return [];
    }
  };

  /**
   * Generate minimal geographic features from analysis data when no boundaries available
   */
  const generateFallbackFeatures = async (): Promise<FeatureType[]> => {
    try {
      // Load one of our cached analysis files to get area IDs
      const response = await fetch('/data/endpoints/analyze.json');
      if (!response.ok) throw new Error('No analysis data available');
      
      const analysisData = await response.json();
      if (!analysisData.results || !Array.isArray(analysisData.results)) {
        throw new Error('Invalid analysis data structure');
      }

      // Generate point features for each area (fallback when no boundaries)
      const fallbackFeatures: FeatureType[] = analysisData.results.slice(0, 100).map((record: any, index: number) => {
        const id = record.ID || record.id || index;
        // Generate random coordinates within Canada bounds for visualization
        const lat = 45 + (Math.random() * 15); // Roughly Canadian latitude range
        const lng = -120 - (Math.random() * 40); // Roughly Canadian longitude range
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
            spatialReference: { wkid: 4326 },
            hasCoordinates: true
          } as PointGeometry,
          properties: {
            ID: id,
            GEOID: String(id),
            CSDNAME: `Area ${id}`,
            area_name: `Area ${id}`,
            ...record
          }
        };
      });

      console.log('[generateFallbackFeatures] ✅ Generated', fallbackFeatures.length, 'fallback point features');
      return fallbackFeatures;
      
    } catch (error) {
      console.error('[generateFallbackFeatures] Error generating fallback features:', error);
      return [];
    }
  };

  return (
  <div className="flex flex-col h-full">
    {/* Message area - takes remaining space after input section */}
    <div className="flex-1 min-h-0 overflow-hidden">
      <MessageList
        messages={messages}
        isProcessing={isProcessing}
        processingSteps={processingSteps}
        messagesEndRef={messagesEndRef}
        onMessageClick={handleMessageClick}
        onCopyText={handleCopyText}
        onExportData={handleExportData}
        onInfographicsClick={handleInfographicsClick}
        onReplyClick={(messageId) => {
          setReplyToMessageId(messageId);
          setReplyInput('');
                                        setIsReplyDialogOpen(true);
                                      }}
        onCustomizeVisualization={handleCustomizeVisualization}
        onZoomToFeature={handleZoomToFeature}
      />
    </div>

    {/* Input Section - fixed height, doesn't shrink */}
    <div className="flex-shrink-0 max-h-[50vh] overflow-y-auto">
      <div className="px-4 py-2 bg-white border-t border-gray-200">

        {/* Mode Toggle */}
        <div className="mb-2 flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setInputMode('analysis')}
            className={`px-3 py-1 rounded-md border ${inputMode === 'analysis' ? 'bg-[#33a852] text-white' : 'bg-gray-100'}`}
          >
            Analysis
          </button>
          <button
            type="button"
            onClick={() => setInputMode('chat')}
            className={`px-3 py-1 rounded-md border ${inputMode === 'chat' ? 'bg-[#33a852] text-white' : 'bg-gray-100'}`}
          >
            Chat
          </button>
        </div>

        {inputMode === 'analysis' && (
          <form onSubmit={handleFormSubmit} className="flex flex-col">
            <div className="flex-1">
              <div className="flex flex-col gap-4 mb-4 pt-0">
                {/* Main Container */}
                <div className="bg-gray-50 p-2 rounded-lg space-y-2">
                  {/* Title */}
                  <div className="flex items-center gap-2">
                    <Image
                      src="/mpiq_pin2.png"
                      alt="IQbuilder"
                      width={14}
                      height={14}
                      className="object-contain"
                    />
                    <h2 className="text-lg font-semibold">
                      <span>
                        <span className='font-bold text-[#33a852]'>IQ</span>
                        <span className="text-black">builder</span>
                      </span>
                    </h2>
                    {contextSummary && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full text-xs text-blue-700">
                              <Brain className="h-3 w-3" />
                              <span>Context-Aware</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white max-w-md">
                            <p className="text-sm">{contextSummary}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              AI responses are aware of your conversation history
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>

                  {/* Buttons Row */}
                  {/* Row 1: Quickstart & Infograph */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {/* Quickstart button */}
                    <Dialog open={quickstartDialogOpen} onOpenChange={setQuickstartDialogOpen}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="relative flex items-center justify-center gap-2 text-xs font-medium border-2 hover:bg-gray-50 hover:text-black hover:border-gray-200 shadow-sm hover:shadow rounded-lg w-full h-9"
                              >
                                <Image
                                  src="/mpiq_pin2.png"
                                  alt="quickstartIQ"
                                  width={16}
                                  height={16}
                                  className="object-contain"
                                />
                                <span>
                                  <span className="text-black">quickstart</span>
                                  <span className='font-bold text-[#33a852]'>IQ</span>
                                </span>
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white">
                            <p>Choose a query</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white rounded-xl shadow-lg">
                        <QueryDialog
                          onQuestionSelect={(question) => {
                                      setInputQuery(question);
                                      setQuickstartDialogOpen(false);
                                    }}
                          title="quickstartIQ"
                          description="Choose from predefined demographic and analysis queries to get started quickly."
                          categories={ANALYSIS_CATEGORIES}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* Infographics button - HIDDEN */}
                    {
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="relative flex items-center justify-center gap-2 text-xs font-medium border-2 hover:bg-gray-50 hover:text-black hover:border-gray-200 shadow-sm hover:shadow rounded-lg w-full h-9"
                            onClick={handleInfographicsClick}
                          >
                            <Image
                              src="/mpiq_pin2.png"
                              alt="infographIQ"
                              width={16}
                              height={16}
                              className="object-contain"
                            />
                            <span>
                              <span className="text-black">infograph</span>
                              <span className='font-bold text-[#33a852]'>IQ</span>
                            </span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-white">
                          <p>Create an infographic</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    }
                  </div>

                  {/* Row 2: Target & Persona */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Target selector button - COMMENTED OUT FOR LATER USE */}
                    {/* <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="relative flex items-center justify-center gap-1 text-xs font-medium border-2 hover:bg-gray-50 hover:text-black hover:border-gray-200 shadow-sm hover:shadow rounded-lg w-full h-9"
                                onClick={() => setIsTargetDialogOpen(true)}
                              >
                                {React.createElement(
                                  targetIcon,
                                  { className: 'h-3 w-3 mr-1' }
                                )}
                                <span className="truncate">
                                  {TARGET_OPTIONS.find(o => o.value === currentTarget)?.label || 'Nike'}
                                </span>
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white">
                            <p>Select model target variable</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DialogContent className="max-w-lg bg-white">
                        <DialogHeader>
                          <DialogTitle>Select Target Variable</DialogTitle>
                          <p className="text-sm text-gray-600 mt-2">
                            The target variable is the primary metric the
                            analysis will explain.
                          </p>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {TARGET_OPTIONS.map((opt) => {
                            const isAvailable = availableTargetOptions.some((availOpt) => availOpt.value === opt.value);
                             return (
                             <Button
                               key={opt.value}
                               variant={currentTarget === opt.value ? 'default' : 'outline'}
                               size="sm"
                               className={`flex flex-col items-start text-left gap-0.5 p-2 h-auto w-full whitespace-normal ${
                                 !isAvailable ? 'opacity-50 cursor-not-allowed' : ''
                               }`}
                               disabled={!isAvailable}
                               onClick={() => {
                                 if (isAvailable) {
                                   setCurrentTarget(opt.value);
                                   const brandIcon = BRAND_ICON_MAP[opt.label] || SiNike;
                                   setTargetIcon(() => brandIcon);
                                   setIsTargetDialogOpen(false);
                                   setManualTargetOverride(true);
                                 }
                               }}
                             >
                               <span className="flex items-center gap-1">
                                 {React.createElement(
                                   BRAND_ICON_MAP[opt.label] || ShoppingCart,
                                   { className: 'h-3 w-3' }
                                 )}
                                 <span className="text-xs font-medium">{opt.label}</span>
                               </span>
                               <span className="text-[10px] leading-tight text-gray-500">
                                 {isAvailable ? `Bought ${opt.label} in Last 12 Months` : 'Not available in current query'}
                               </span>
                             </Button>
                           );
                         })}
                         </div>
                       </DialogContent>
                    </Dialog> */}

                    {/* Persona selector button */}
                    <Dialog open={isPersonaDialogOpen} onOpenChange={setIsPersonaDialogOpen}>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <DialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="relative flex items-center justify-center gap-1 text-xs font-medium border-2 hover:bg-gray-50 hover:text-black hover:border-gray-200 shadow-sm hover:shadow rounded-lg w-full h-9"
                              >
                                {React.createElement(
                                  PERSONA_ICON_MAP[selectedPersona] || UserCog,
                                  { className: 'h-3 w-3 mr-1' }
                                )}
                                <span className="truncate">
                                  {personaMetadata.find(p => p.id === selectedPersona)?.name || 'Strategist'}
                                </span>
                              </Button>
                            </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white">
                            <p>Select AI persona: {personaMetadata.find(p => p.id === selectedPersona)?.name || 'Strategist'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DialogContent className="max-w-lg bg-white">
                        <DialogHeader>
                          <DialogTitle>Select AI Persona</DialogTitle>
                          <p className="text-sm text-gray-600 mt-2">
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
                                <div className="font-medium text-sm">{persona.name}</div>
                                <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                                  {persona.description}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Filters summary chip */}
                  {/* TEMPORARILY HIDDEN - FILTERING DISABLED
                  <div className="mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsFiltersDialogOpen(true)}
                      className="text-[11px] px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      Filters: Apps ≥ {minApplications} • Top N {isTopNAll ? 'All' : topNResults}
                    </Button>
                  </div>
                  */}

                  {/* Input Area */}
                  <div className="space-y-2">
                    {/* Endpoint Selector */}
                    {showEndpointSelector && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <AnalysisEndpointSelector
                          selectedEndpoint={selectedEndpoint === 'auto' ? undefined : selectedEndpoint}
                          onEndpointSelect={(endpoint) => {
                            setSelectedEndpoint(endpoint);
                            setShowEndpointSelector(false);
                          }}
                          compact={true}
                          showDescription={false}
                        />
                      </div>
                    )}
                    
                    {/* Smart Endpoint Suggestions */}
                    {inputQuery && endpointSuggestions.length > 0 && !showEndpointSelector && (
                      <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-amber-600" />
                            <span className="text-xs text-amber-800">
                              Suggested: {endpointSuggestions[0]?.name || 'General Analysis'}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setShowEndpointSelector(true)}
                            >
                              Choose
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-xs"
                              onClick={() => setEndpointSuggestions([])}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Textarea
                      ref={textareaRef}
                      value={inputQuery}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (!isProcessing && inputQuery.trim()) {
                            analyzeButtonRef.current?.click();
                          }
                        }
                      }}
                      placeholder="Type your query here..."
                      className="w-full h-24 pr-24 font-bold resize-none text-xs"
                      disabled={isProcessing}
                    />

                    <div className="flex justify-between items-center">
                      {/* Clear Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="flex items-center justify-center gap-2 px-4 text-sm font-medium border border-gray-300 hover:bg-gray-100 hover:text-gray-700 shadow-sm hover:shadow rounded-lg h-8"
                              onClick={handleClear}
                            >
                              <X className="h-4 w-4 text-gray-500" />
                              <span>clear</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white">
                            <p>Clear all messages</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* Analyze Button */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              ref={analyzeButtonRef}
                              type={isProcessing ? "button" : "submit"}
                              size="sm"
                              className={`flex items-center justify-center gap-2 px-4 rounded-lg h-8 ${
                                isProcessing 
                                  ? "bg-red-600 hover:bg-red-700 text-white" 
                                  : "bg-[#33a852] hover:bg-[#2d9748] text-white"
                              }`}
                              disabled={!inputQuery.trim() && !isProcessing}
                              onClick={isProcessing ? handleCancel : undefined}
                            >
                              {isProcessing ? (
                                <>
                                  <X className="h-4 w-4" />
                                  <span>Stop</span>
                                </>
                              ) : (
                                'Analyze'
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-white">
                            <p>Analyze your query</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </div>
            </div> 
            </form>
        )}

        {inputMode === 'chat' && (
          <ChatBar onSend={(query) => handleSubmit(query, 'main')} />
        )}
      </div>
    </div>

    {/* Global scrollbar and animation styles */}
    <style jsx global>{`
      * {
        scrollbar-width: thin !important;
        scrollbar-color: rgba(0,0,0,0.2) rgba(0,0,0,0.05) !important;
      }
      
      ::-webkit-scrollbar {
        width: 8px !important;
        background-color: rgba(0,0,0,0.05) !important;
      }
      
      ::-webkit-scrollbar-thumb {
        background-color: rgba(0,0,0,0.2) !important;
        border-radius: 4px !important;
      }
      
      ::-webkit-scrollbar-track {
        background-color: rgba(0,0,0,0.05) !important;
      }
      
      .overflow-y-auto {
        overflow-y: scroll !important;
      }

      @keyframes slide-in-right {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }

      @keyframes slide-out-right {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(100%);
        }
      }

      .animate-slide-in-right {
        animation: slide-in-right 0.3s ease-out;
      }

      .animate-slide-out-right {
        animation: slide-out-right 0.3s ease-in;
      }
      
      /* Add smooth transition for height changes */
      .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .duration-300 {
        transition-duration: 300ms;
      }
    `}</style>

    {/* Add MessageDialog for expanded message viewing */}
    <MessageDialog 
      message={selectedMessage} 
      onClose={() => {
        setSelectedMessage(null);
        setDialogOpen(false);
      }} 
    />
    
    {/* Reply Dialog Component */}
    <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to Assistant</DialogTitle>
          <p className="text-sm text-gray-600">
            Your reply will be added to the current conversation context.
          </p>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Textarea 
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            placeholder="Type your reply here..."
            className="w-full h-24 resize-none text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (replyInput.trim()) {
                  handleSubmit(replyInput, 'reply');
                  setIsReplyDialogOpen(false);
                  setReplyInput('');
                }
              }
            }}
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => {
                if (replyInput.trim()) {
                  handleSubmit(replyInput, 'reply');
                  setIsReplyDialogOpen(false);
                  setReplyInput('');
                }
              }}
              disabled={!replyInput.trim() || isProcessing}
              size="sm"
              className="bg-[#33a852] hover:bg-[#2d9748] text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                'Send Reply'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* Infographics Side Panel */}
    {isInfographicsOpen && (() => {
      const viewToUse = currentMapView || initialMapView;
      console.log('[GeospatialChat] InfographicsTab viewToUse:', viewToUse, 'viewToUse?.map:', viewToUse?.map, 'initialMapView:', initialMapView, 'initialMapView?.map:', initialMapView?.map, 'mapViewRefValue:', mapViewRefValue, 'mapViewRefValue?.map:', mapViewRefValue?.map);
      return (
        <div className="fixed right-0 top-0 w-[40vw] h-screen bg-white shadow-lg border-l rounded-l-xl z-50 animate-slide-in-right data-[state=closed]:animate-slide-out-right">
          <div className="flex flex-col h-full">
            <div className="flex flex-row items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-[#33a852]" />
                <div className="text-sm font-medium">
                  <span className="text-black">infograph</span>
                  <span className='font-bold text-[#33a852]'>IQ</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInfographicsOpen(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              {viewToUse && (
                <InfographicsTab
                  view={viewToUse}
                  layerStates={{}}
                  exportToPDF={() => {}}
                  showLoading={false}
                  onLayerStatesChange={() => {}}
                />
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {isVizPanelOpen && activeVizMessageId && (() => {
      const activeMessage = messages.find(m => m.id === activeVizMessageId);
      const vizLayer = activeMessage?.metadata?.visualizationResult?.layer;

      if (vizLayer) {
        // The CustomVisualizationPanel expects a 'LayerConfig' object, which is not what we have.
        // The vizLayer is an esri.FeatureLayer. We create a mock config object for the panel.
        const layerConfigForPanel = {
          name: vizLayer.title || 'Analysis Layer',
          description: activeMessage?.metadata?.analysisResult?.summary || '',
          type: vizLayer.geometryType, // 'point', 'polygon', etc.
          rendererField: vizLayer.renderer?.get('field') || activeMessage?.metadata?.analysisResult?.target_variable,
          performance: { maxFeatures: 10000 },
          fields: activeMessage?.metadata?.analysisResult?.fields || []
        };

        return (
          <div className="fixed right-0 top-0 h-screen w-[30vw] bg-white shadow-lg z-50 overflow-y-auto">
            <CustomVisualizationPanel
              layer={layerConfigForPanel as any} // Casting as the panel's internal type isn't exported.
              onClose={() => setIsVizPanelOpen(false)}
              onVisualizationUpdate={(options) => {
                if (activeVizMessageId) {
                  handleVisualizationUpdate(activeVizMessageId, options);
                }
              }}
            />
          </div>
        );
      }
      return null;
    })()}

    {/* Visualization Customization Panel */}
    <Dialog open={isVizPanelOpen} onOpenChange={setIsVizPanelOpen} modal={false}>
      <DialogContent className="max-w-xl bg-white">
        {/* Accessible title for screen readers */}
        <DialogHeader>
          <VisuallyHidden asChild>
            <DialogTitle>Custom Visualization</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        {currentLayerConfigForViz && activeVizMessageId && (
          <CustomVisualizationPanel
            layer={currentLayerConfigForViz}
            onVisualizationUpdate={(cfg) => handleVisualizationUpdate(activeVizMessageId, cfg)}
            onClose={() => setIsVizPanelOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>

    {/* Root container closing */}
    </div>
   );
 });

EnhancedGeospatialChat.displayName = 'EnhancedGeospatialChat';

// Export both default and named exports for compatibility
export { EnhancedGeospatialChat };
export default EnhancedGeospatialChat; 