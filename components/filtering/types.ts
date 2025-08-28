/**
 * Advanced Filtering System Types
 * 
 * Comprehensive type definitions for the multi-tab filtering system
 */

import { ClusterConfig } from '@/lib/clustering/types';

// ============================================================================
// MAIN FILTER CONFIGURATION
// ============================================================================

export interface AdvancedFilterConfig {
  clustering: ClusterConfig; // Existing clustering configuration
  fieldFilters: FieldFilterConfig;
  visualization: VisualizationConfig;
  performance: PerformanceConfig;
}

// ============================================================================
// FIELD FILTERING TYPES
// ============================================================================

export interface FieldFilterConfig {
  numericFilters: Record<string, NumericFilter>;
  categoricalFilters: Record<string, CategoricalFilter>;
  textFilters: Record<string, TextFilter>;
  nullFilters: Record<string, NullFilter>;
}

export interface NumericFilter {
  enabled: boolean;
  min?: number;
  max?: number;
  range?: [number, number];
}

export interface CategoricalFilter {
  enabled: boolean;
  included: string[];
  excluded: string[];
  mode: 'include' | 'exclude';
}

export interface TextFilter {
  enabled: boolean;
  query: string;
  mode: 'contains' | 'exact' | 'startswith' | 'endswith';
  caseSensitive: boolean;
}

export interface NullFilter {
  enabled: boolean;
  mode: 'include' | 'exclude' | 'only';
}

// ============================================================================
// VISUALIZATION CONFIGURATION
// ============================================================================

export interface VisualizationConfig {
  colorScheme: string;
  symbolSize: {
    enabled: boolean;
    min: number;
    max: number;
    field?: string;
  };
  opacity: {
    enabled: boolean;
    value: number;
  };
  labels: {
    enabled: boolean;
    field?: string;
  };
  legend: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'left' | 'right';
  };
}

// ============================================================================
// PERFORMANCE CONFIGURATION
// ============================================================================

export interface PerformanceConfig {
  sampling: {
    enabled: boolean;
    maxSampleSize: number;
    strategy: 'random' | 'systematic' | 'stratified';
  };
  caching: {
    enabled: boolean;
    ttlMinutes: number;
  };
  timeout: {
    enabled: boolean;
    seconds: number;
  };
  quality: {
    enabled: boolean;
    threshold: number;
  };
}

// ============================================================================
// FIELD DISCOVERY TYPES
// ============================================================================

export interface EndpointFieldSchema {
  endpoint: string;
  fields: FieldDefinition[];
  fieldCategories: {
    demographic: string[];
    geographic: string[];
    business: string[];
    calculated: string[];
    other: string[];
  };
  commonFields: string[]; // Fields present across most endpoints
}

export interface FieldDefinition {
  name: string;
  type: 'numeric' | 'categorical' | 'text' | 'boolean' | 'date';
  displayName: string;
  description?: string;
  category: 'demographic' | 'geographic' | 'business' | 'calculated' | 'other';
  
  // Numeric field properties
  range?: {
    min: number;
    max: number;
    step?: number;
  };
  
  // Categorical field properties
  categories?: string[];
  maxCategories?: number;
  
  // General properties
  nullable: boolean;
  common: boolean; // Present across most endpoints
  indexed: boolean; // Supports efficient filtering
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export interface AdvancedFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: AdvancedFilterConfig;
  onConfigChange: (config: AdvancedFilterConfig) => void;
  onApply?: () => void;
  onReset?: () => void;
  
  // Field discovery context
  availableFields?: FieldDefinition[];
  endpoint?: string;
  
  // UI state
  className?: string;
}

export interface FilterTabProps {
  config: AdvancedFilterConfig;
  onConfigChange: (config: AdvancedFilterConfig) => void;
  availableFields?: FieldDefinition[];
  endpoint?: string;
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

export const DEFAULT_FIELD_FILTER_CONFIG: FieldFilterConfig = {
  numericFilters: {},
  categoricalFilters: {},
  textFilters: {},
  nullFilters: {},
};

export const DEFAULT_VISUALIZATION_CONFIG: VisualizationConfig = {
  colorScheme: 'viridis',
  symbolSize: {
    enabled: false,
    min: 4,
    max: 20,
  },
  opacity: {
    enabled: false,
    value: 0.8,
  },
  labels: {
    enabled: false,
  },
  legend: {
    enabled: true,
    position: 'bottom',
  },
};

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceConfig = {
  sampling: {
    enabled: false,
    maxSampleSize: 10000,
    strategy: 'random',
  },
  caching: {
    enabled: true,
    ttlMinutes: 60,
  },
  timeout: {
    enabled: true,
    seconds: 120,
  },
  quality: {
    enabled: true,
    threshold: 0.85,
  },
};

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FilterTabType = 'clustering' | 'fields' | 'visualization' | 'performance';

export interface FilterTabDefinition {
  id: FilterTabType;
  label: string;
  icon: React.ComponentType<{className?: string}>;
  description: string;
  enabled: boolean;
}

export interface FilterSummary {
  totalFilters: number;
  activeFilters: number;
  fieldFilters: number;
  hasClusteringEnabled: boolean;
  hasVisualizationCustomization: boolean;
  hasPerformanceCustomization: boolean;
}