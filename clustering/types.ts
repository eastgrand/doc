import type { GeospatialFeature } from '../types/geospatial-ai-types';

export type { GeospatialFeature } from '../types/geospatial-ai-types';

export interface Point {
    x: number;
    y: number;
    id?: string;
  }
  
  export interface Cluster {
    id: string;
    centroid: Point;
    count: number;
    bounds: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
    features: GeospatialFeature[];
    attributes: Record<string, any>;
    properties: Record<string, any>;
  }
  
  export interface ClusteringOptions {
    maxFeatures?: number;        // Maximum features per cluster
    minDistance?: number;        // Minimum distance between clusters
    gridSize?: number;          // Size of grid cells for grid clustering
    densityThreshold?: number;  // Minimum density for density clustering
    maxClusters?: number;       // Maximum number of clusters to generate
  }
  
  export interface ClusteringResult {
    clusters: Cluster[];
    unclustered: GeospatialFeature[];
    stats: {
      totalFeatures: number;
      totalClusters: number;
      averageClusterSize: number;
      maxClusterSize: number;
      processingTime: number;
    };
  }
  
  export type ClusteringStrategy = 'grid' | 'distance' | 'density';
  
  export interface ClusteringError extends Error {
    code: string;
    details?: any;
  }
  
  export interface FilterConfig {
    field: string;
    operator: string;
    value: string | number | boolean;
    enabled: boolean;
  }
  
  export interface LayerState {
    layer: __esri.FeatureLayer | null;
    visible: boolean;
    loading: boolean;
    filters: FilterConfig[];
    queryResults?: {
      features: GeospatialFeature[];
      fields: any[];
    };
  }