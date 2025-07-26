// src/types/layers.ts

import { LayerField } from './geospatial-ai-types';
import type MapView from '@arcgis/core/views/MapView';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer';
// import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

export type { LayerField };

// Fundamental Type Definitions
export type LayerType = 'point' | 'index' | 'percentage' | 'feature-service' | 'wms' | 'wfs' | 'xyz' | 'geojson' | 'amount';
export type LayerStatus = 'active' | 'inactive' | 'deprecated' | 'pending';
export type UpdateFrequency = 'realtime' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
export type ProcessingStrategy = 'traditional' | 'hybrid' | 'ai' | 'batch';
export type AccessLevel = 'read' | 'write' | 'admin';
export type CacheStrategy = 'memory' | 'redis' | 'hybrid' | 'none';
export type GeographicLevel = 'national' | 'provincial' | 'regional' | 'local' | 'postal';

// Field Formatting and Display Configurations
export interface LayerFieldFormat {
  digitSeparator?: boolean;
  places?: number;
  prefix?: string;
  suffix?: string;
  nullDisplay?: string;
}

// Popup Configuration Interfaces
export interface PopupFieldInfo {
  fieldName: string;
  label: string;
  visible: boolean;
  format?: LayerFieldFormat;
}

export interface PopupContentBase {
  type: 'fields' | 'text' | 'media';
}

export interface PopupContentFields extends PopupContentBase {
  type: 'fields';
  fieldInfos: PopupFieldInfo[];
}

export interface PopupContentText extends PopupContentBase {
  type: 'text';
  text: string;
  format?: {
    bold?: boolean;
    italic?: boolean;
    color?: string;
  };
}

export interface PopupContentMedia extends PopupContentBase {
  type: 'media';
  mediaInfos: {
    type: 'image' | 'chart' | 'video';
    url: string;
    caption?: string;
    altText?: string;
  }[];
}

export type PopupContent = PopupContentFields | PopupContentText | PopupContentMedia;

export interface PopupTemplateConfig {
  title?: string;
  content?: string | string[];
  fieldInfos?: {
    fieldName: string;
    label: string;
    format?: {
      places?: number;
      digitSeparator?: boolean;
      dateFormat?: string;
    };
  }[];
  actions?: {
    title: string;
    id: string;
    className?: string;
  }[];
}

// Metadata Configuration
export interface LayerMetadata {
  provider: string;
  updateFrequency: UpdateFrequency;
  lastUpdate?: Date;
  version?: string;
  tags?: string[];
  accuracy?: number;
  coverage?: {
    spatial?: string;
    temporal?: string;
  };
  sourceSystems?: string[];
  dataQuality?: {
    completeness?: number;
    consistency?: number;
    validationDate?: Date;
  };
  isHidden?: boolean;
  geometryType?: 'point' | 'multipoint' | 'polyline' | 'polygon' | 'multipolygon' | 'extent';
  valueType?: 'percentage' | 'index' | 'count' | 'currency';
  visualizationType?: 'unique-value' | 'choropleth' | 'point';
  rendererConfig?: {
    field: string;
    colors?: Record<string, [number, number, number]>;
  };
  concepts?: Record<string, {
    terms: string[];
    weight?: number;
  }>;
  geographicType: 'census' | 'postal' | 'custom' | 'ZIP' | 'FSA';
  geographicLevel: GeographicLevel;
  description?: string;
  microserviceField?: string;
}

// Symbol Configuration for Point Layers
export interface PointSymbolConfig {
  color: [number, number, number, number];
  size?: number;
  outline?: {
    color: [number, number, number, number];
    width: number;
  };
  opacity?: number;
  shape?: 'circle' | 'square' | 'triangle' | 'diamond';
}

// Clustering Configuration for Point Layers
export interface LayerClusterConfig {
  enabled: boolean;
  radius?: number;
  minSize?: number;
  maxSize?: number;
  colors?: number[][];
  labelingEnabled?: boolean;
  popupTemplate?: PopupTemplateConfig;
}

// Base Layer Configuration
export interface BaseLayerConfig {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: LayerType;
  status: LayerStatus;
  group: string;
  visible?: boolean;
  opacity?: number;
  style?: any;
  params?: Record<string, any>;
  metadata: LayerMetadata;
  processing: Record<string, any>;
  caching: Record<string, any>;
  performance: Record<string, any>;
  security: Record<string, any>;
  analysis?: Partial<LayerAnalysisConfig>;
  definitionExpression?: string;
  queryConfig?: {
    where: string;
    outFields: string[];
    returnGeometry: boolean;
    maxFeatures: number;
  };
  joinConfig?: {
    targetLayer: string;
    joinField: string;
    targetField: string;
    joinType: 'left' | 'right' | 'inner' | 'outer';
    outFields: string[];
  };
  displayField?: string;
  identifierField?: string;
  geometryType?: 'Point' | 'LineString' | 'Polygon';
  permissions?: {
    read?: string[];
    write?: string[];
    delete?: string[];
    roles?: string[];
  };
  fields: LayerField[];
  microserviceField?: string;
  geographicType: 'census' | 'postal' | 'custom' | 'ZIP' | 'FSA';
  geographicLevel: GeographicLevel;
  rendererField?: string;
  filterField?: string;
  filterThreshold?: number;
  linkField?: string;
  sourceSR?: number;
  skipLayerList?: boolean;
  dataStructure?: 'separate' | 'field-based';
  fieldMappings?: Record<string, string>;
}

// Extended Layer Configuration
export interface ExtendedLayerConfig {
  processing: Partial<LayerProcessingConfig>;
  caching: Partial<LayerCachingConfig>;
  performance: Partial<LayerPerformanceConfig>;
  security: Partial<LayerSecurityConfig>;
  errorHandling?: Partial<LayerErrorHandlingConfig>;
  analysis?: Partial<LayerAnalysisConfig>;
  validation?: LayerValidationRule[];
  status: LayerStatus;
  nameField?: string;
  typeField?: string;
  typeValue?: string;
  isPrimary?: boolean;
  skipLayerList?: boolean;
  crossGeoOnly?: boolean;
  isTrends?: boolean;
  joinConfig?: {
    targetLayer: string;
    joinField: string;
    targetField: string;
    joinType: 'left' | 'right' | 'inner' | 'outer';
    outFields: string[];
  };
  description?: string;
  isVisible?: boolean;
  virtualLayers?: { field: string; name: string }[];
}

// Specific Layer Configurations
export interface PointLayerConfig extends BaseLayerConfig {
  type: 'point';
  symbolConfig: PointSymbolConfig;
  rendererField?: string;
  fields: LayerField[];
  cluster?: LayerClusterConfig;
}

export interface IndexLayerConfig extends BaseLayerConfig {
  type: 'index';
  rendererField?: string;
  visualizationMode?: 'distribution' | 'point';
  indexField?: string;
  fields: LayerField[];
  nameField?: string;
  typeField?: string;
  typeValue?: string;
  isPrimary?: boolean;
  crossGeoOnly?: boolean;
  definitionExpression?: string;
  queryConfig?: {
    where: string;
    outFields: string[];
    returnGeometry: boolean;
    maxFeatures: number;
  };
  virtualLayers?: { field: string; name: string }[];
}

export interface PercentageLayerConfig extends BaseLayerConfig {
  type: 'percentage';
  rendererField: string;
  fields: LayerField[];
}

export interface FeatureServiceLayerConfig extends BaseLayerConfig {
  type: 'feature-service';
  rendererField?: string;
  fields: LayerField[];
}

export interface WebServiceLayerConfig extends BaseLayerConfig {
  type: 'wms' | 'wfs' | 'xyz' | 'geojson';
  params?: Record<string, any>;
}

// Amount Layer Configuration
export interface AmountLayerConfig extends BaseLayerConfig {
  type: 'amount';
  rendererField?: string;
  fields: LayerField[];
}

// Consolidated Layer Configuration Type
export type LayerConfig = (PercentageLayerConfig | IndexLayerConfig | PointLayerConfig | FeatureServiceLayerConfig | WebServiceLayerConfig | AmountLayerConfig) & ExtendedLayerConfig;

// Virtual Layer Configuration
export interface VirtualLayerConfig {
  field: string;
  name: string;
}

// Update ProjectLayerConfig to include virtualLayers
export interface ProjectLayerConfig {
  layers: Record<string, LayerConfig>;
  groups: LayerGroup[];
  defaultVisibility: Record<string, boolean>;
  defaultCollapsed: Record<string, boolean>;
  globalSettings: {
    defaultOpacity: number;
    maxVisibleLayers: number;
    performanceMode?: 'standard' | 'optimized';
  };
  virtualLayers?: VirtualLayerConfig[];
}

// Virtual Layer Interface
export interface VirtualLayer {
  id: string;
  name: string;
  sourceLayerId: string;
  rendererField: string;
  visible: boolean;
}

// Layer State Types
export interface LayerState {
  id: string;
  name: string;
  layer: FeatureLayer | null;
  visible: boolean;
  opacity: number;
  order: number;
  group: string;
  loading: boolean;
  filters: any[];
  isVirtual: boolean;
  active: boolean;
}

export interface GroupState {
  id: string;
  expanded: boolean;
  title?: string;
  description?: string;
}

export interface PersistedState {
  layers: Record<string, LayerState>;
  groups: Record<string, GroupState>;
  lastUpdated: string;
}

// Query Types
export interface QueryOptions {
  layers: string[];
  spatialFilter?: {
    type: 'polygon' | 'circle' | 'rectangle';
    coordinates: number[][];
  };
  temporalFilter?: {
    startDate: string;
    endDate: string;
  };
  attributeFilter?: {
    field: string;
    operator: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'like' | 'in';
    value: any;
  }[];
}

export interface QueryResult {
  features: any[];
  total: number;
  time: number;
  extent?: [number, number, number, number];
}

// Layer Group Configuration
export interface LayerGroup {
  id: string;
  title: string;
  description?: string;
  layers?: LayerConfig[];
  subGroups?: LayerGroup[];
  virtualLayers?: { field: string; name: string }[];
}

export interface GlobalSettings {
  defaultOpacity: number;
  maxVisibleLayers: number;
  minZoom?: number;
  maxZoom?: number;
}

export interface LayerProcessingConfig {
  strategy: ProcessingStrategy;
  timeout?: number;
  priority?: number;
  batchSize?: number;
  retryAttempts?: number;
  concurrencyLimit?: number;
  preprocessingSteps?: string[];
}

export interface LayerCachingConfig {
  enabled: boolean;
  ttl: number;
  strategy: CacheStrategy;
  maxEntries?: number;
  prefetch?: boolean;
  stalePeriod?: number;
  invalidationTriggers?: string[];
}

export interface LayerPerformanceConfig {
  maxFeatures?: number;
  maxGeometryComplexity?: number;
  timeoutMs?: number;
  rateLimits?: {
    requestsPerSecond: number;
    burstSize: number;
  };
  optimizationLevel?: 'low' | 'medium' | 'high';
  scalingStrategy?: 'horizontal' | 'vertical';
}

export interface LayerSecurityConfig {
  requiresAuthentication: boolean;
  accessLevels: AccessLevel[];
  ipWhitelist?: string[];
  encryptionRequired?: boolean;
  auditEnabled?: boolean;
  requiredRoles?: string[];
  auditTrail?: {
    enabled: boolean;
    retentionDays?: number;
  };
}

export interface LayerErrorHandlingConfig {
  fallbackStrategy?: ProcessingStrategy;
  retryStrategy?: {
    maxAttempts: number;
    backoffMs: number;
    backoffType?: 'linear' | 'exponential';
  };
  alertThresholds?: {
    errorRate?: number;
    performanceDegradation?: number;
  };
  faultTolerance?: {
    partialResponseAllowed?: boolean;
    degradedModeEnabled?: boolean;
  };
}

export interface LayerAnalysisConfig {
  availableOperations?: string[];
  aggregationMethods?: string[];
  supportedVisualizationTypes?: string[];
  complexityThresholds?: {
    spatialComplexity?: number;
    computationalComplexity?: number;
  };
}

export interface LayerValidationRule {
  field: string;
  type: 'required' | 'min' | 'max' | 'regex' | 'custom';
  value?: any;
  message?: string;
  severity?: 'warning' | 'error' | 'critical';
}

// Helper function to create a layer configuration
function createLayerConfig(
  id: string,
  name: string,
  url: string,
  rendererField: string,
  group: string
): LayerConfig {
  return {
    id,
    name,
    type: 'feature-service',
    url,
    rendererField,
    group,
    status: 'active',
    geographicType: 'census',
    geographicLevel: 'local',
    fields: [
      { name: 'OBJECTID', type: 'oid', alias: 'Object ID', label: 'ID' },
      { name: rendererField, type: 'double', alias: name, label: name }
    ],
    metadata: {
      provider: 'ArcGIS',
      updateFrequency: 'annual',
      geographicType: 'census',
      geographicLevel: 'local'
    },
    processing: {},
    caching: {},
    performance: {},
    security: {},
    description: name,
    isVisible: true
  };
}

export const layers: LayerConfig[] = [
  // Demographics Group
  createLayerConfig(
    'total-population',
    'Total Population',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/7',
    'Total_Population',
    'demographics-group'
  ),
  createLayerConfig(
    'married-common-law',
    'Married or living with a common-law partner',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/8',
    'Married_or_living_with_a_common_law_partner',
    'demographics-group'
  ),
  createLayerConfig(
    'single-never-married',
    'Single (never married)',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/9',
    'Single_never_married',
    'demographics-group'
  ),
  createLayerConfig(
    'separated-divorced-widowed',
    'Separated, divorced or widowed',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/10',
    'Separated_divorced_or_widowed',
    'demographics-group'
  ),
  createLayerConfig(
    'total-private-households',
    'Total private households',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/11',
    'Total_private_households',
    'housing-group'
  ),
  createLayerConfig(
    'household-size-1-person',
    'Household size: 1 person',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/12',
    'Household_size_1_person',
    'housing-group'
  ),
  createLayerConfig(
    'household-size-2-persons',
    'Household size: 2 persons',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/13',
    'Household_size_2_persons',
    'housing-group'
  ),
  createLayerConfig(
    'household-size-3-persons',
    'Household size: 3 persons',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/14',
    'Household_size_3_persons',
    'housing-group'
  ),
  createLayerConfig(
    'household-size-4-persons',
    'Household size: 4 persons',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/15',
    'Household_size_4_persons',
    'housing-group'
  ),
  createLayerConfig(
    'household-size-5-persons',
    'Household size: 5 or more persons',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/16',
    'Household_size_5_or_more_persons',
    'housing-group'
  ),
  createLayerConfig(
    'total-household-income',
    'Total household income',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/17',
    'Total_household_income',
    'income-group'
  ),
  createLayerConfig(
    'household-income-under-50k',
    'Household income: Under $50,000',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/18',
    'Household_income_Under_50_000',
    'income-group'
  ),
  createLayerConfig(
    'household-income-50k-to-100k',
    'Household income: $50,000 to $100,000',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/19',
    'Household_income_50_000_to_100_000',
    'income-group'
  ),
  createLayerConfig(
    'household-income-100k-to-150k',
    'Household income: $100,000 to $150,000',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/20',
    'Household_income_100_000_to_150_000',
    'income-group'
  ),
  createLayerConfig(
    'household-income-150k-to-200k',
    'Household income: $150,000 to $200,000',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/21',
    'Household_income_150_000_to_200_000',
    'income-group'
  ),
  createLayerConfig(
    'household-income-over-200k',
    'Household income: $200,000 and over',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/22',
    'Household_income_200_000_and_over',
    'income-group'
  ),
  createLayerConfig(
    'total-household-spending',
    'Total household spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/23',
    'Total_household_spending',
    'spending-group'
  ),
  createLayerConfig(
    'food-spending',
    'Food spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/24',
    'Food_spending',
    'spending-group'
  ),
  createLayerConfig(
    'shelter-spending',
    'Shelter spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/25',
    'Shelter_spending',
    'spending-group'
  ),
  createLayerConfig(
    'transportation-spending',
    'Transportation spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/26',
    'Transportation_spending',
    'spending-group'
  ),
  createLayerConfig(
    'clothing-spending',
    'Clothing spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/27',
    'Clothing_spending',
    'spending-group'
  ),
  createLayerConfig(
    'healthcare-spending',
    'Healthcare spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/28',
    'Healthcare_spending',
    'spending-group'
  ),
  createLayerConfig(
    'recreation-spending',
    'Recreation spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/29',
    'Recreation_spending',
    'spending-group'
  ),
  createLayerConfig(
    'education-spending',
    'Education spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/30',
    'Education_spending',
    'spending-group'
  ),
  createLayerConfig(
    'personal-care-spending',
    'Personal care spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/31',
    'Personal_care_spending',
    'spending-group'
  ),
  createLayerConfig(
    'reading-spending',
    'Reading spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/32',
    'Reading_spending',
    'spending-group'
  ),
  createLayerConfig(
    'tobacco-alcohol-spending',
    'Tobacco products and alcoholic beverages spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/33',
    'Tobacco_products_and_alcoholic_beverages_spending',
    'spending-group'
  ),
  createLayerConfig(
    'miscellaneous-spending',
    'Miscellaneous spending',
    'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_Nesto_layers/FeatureServer/34',
    'Miscellaneous_spending',
    'spending-group'
  )
];

export const layerGroups: LayerGroup[] = [
  {
    id: 'demographics-group',
    title: 'Demographics',
    description: 'Population and demographic data',
    layers: layers.filter(layer => layer.group === 'demographics-group')
  },
  {
    id: 'housing-group',
    title: 'Housing',
    description: 'Housing and dwelling data',
    layers: layers.filter(layer => layer.group === 'housing-group')
  },
  {
    id: 'income-group',
    title: 'Income',
    description: 'Household income data',
    layers: layers.filter(layer => layer.group === 'income-group')
  },
  {
    id: 'spending-group',
    title: 'Spending',
    description: 'Household spending data',
    layers: layers.filter(layer => layer.group === 'spending-group')
  }
];

export interface LocalLayerState {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  opacity: number;
  order: number;
  group: string;
  loading: boolean;
  error: string | null;
  data: any | null;
  metadata: Record<string, any>;
  filters?: any[];
  isVirtual?: boolean;
  active?: boolean;
}

export interface LayerControllerRef {
  layerStates: { [key: string]: LayerState };
  isInitialized: boolean;
  setVisibleLayers: (layers: string[]) => void;
  setLayerStates: (states: { [key: string]: LayerState }) => void;
  resetLayers: () => void;
}

export interface LayerControllerProps {
  view: MapView;
  config: ProjectLayerConfig;
  onLayerStatesChange?: (states: { [key: string]: LayerState }) => void;
  onLayerInitializationProgress?: (progress: { loaded: number; total: number }) => void;
  onInitializationComplete?: () => void;
  visible?: boolean;
}