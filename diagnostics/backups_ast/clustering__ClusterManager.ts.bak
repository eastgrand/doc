/* eslint-disable no-case-declarations */
import { Cluster } from './types';
import RBush from 'rbush';
import type { GeospatialFeature } from '../types/geospatial-ai-types';

// Define RBush item type
interface RBushItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  cluster: Cluster;
}

// Clustering configuration interface
export interface ClusterConfig {
  strategy: 'grid' | 'distance' | 'density' | 'adaptive';
  radius: number;
  minPoints: number;
  maxZoomLevel: number;
  gridSize?: number;
  densityThreshold?: number;
}

// Update Point type to handle multi-dimensional coordinates
interface Point {
  x: number;
  y: number;
}

// Helper to get first coordinates from potentially nested array
function getCoordinates(coords: number | number[] | number[][] | number[][][]): [number, number] {
  if (Array.isArray(coords)) {
    if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number' && typeof coords[0][1] === 'number') {
      return [coords[0][0], coords[0][1]];
    }
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      return [coords[0], coords[1]];
    }
  }
  return [0, 0];
}

export class ClusterManager {
  private spatialIndex: RBush<RBushItem>;
  private cache: Map<string, Cluster[]>;

  constructor() {
    this.spatialIndex = new RBush<RBushItem>();
    this.cache = new Map();
  }

  // Main clustering method
  async clusterFeatures(
    features: GeospatialFeature[],
    config: ClusterConfig,
    viewParams: { zoom: number; extent: [number, number, number, number] }
  ): Promise<Cluster[]> {
    const cacheKey = this.generateCacheKey(features, config, viewParams);
    
    // Check cache first
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    // Select clustering strategy based on config and current view
    const strategy = this.determineStrategy(config, viewParams, features);
    
    // Perform clustering based on strategy
    const clusters = await this.performClustering(features, {
      ...config,
      strategy
    }, viewParams);

    // Update spatial index
    this.updateSpatialIndex(clusters);

    // Cache results
    this.cache.set(cacheKey, clusters);

    return clusters;
  }

  // Strategy selection methods
  private determineStrategy(
    config: ClusterConfig,
    viewParams: { zoom: number; extent: [number, number, number, number] },
    features: GeospatialFeature[]
  ): ClusterConfig['strategy'] {
    if (config.strategy !== 'adaptive') {
      return config.strategy;
    }

    const pointDensity = this.calculatePointDensity(features, viewParams.extent);
    const zoom = viewParams.zoom;

    if (zoom < 10) {
      return pointDensity > 1000 ? 'grid' : 'distance';
    } else if (zoom < 15) {
      return pointDensity > 500 ? 'density' : 'distance';
    } else {
      return 'distance';
    }
  }

  private calculatePointDensity(
    features: GeospatialFeature[],
    extent: [number, number, number, number]
  ): number {
    const [minX, minY, maxX, maxY] = extent;
    const area = (maxX - minX) * (maxY - minY);
    return features.length / area;
  }

  // Main clustering orchestration
  private async performClustering(
    features: GeospatialFeature[],
    config: ClusterConfig,
    viewParams: { zoom: number; extent: [number, number, number, number] }
  ): Promise<Cluster[]> {
    switch (config.strategy) {
      case 'grid':
        return this.gridCluster(features, config, viewParams);
      case 'distance':
        return this.distanceCluster(features, config);
      case 'density':
        return this.densityCluster(features, config);
      case 'adaptive':
        const pointDensity = this.calculatePointDensity(features, viewParams.extent);
        if (pointDensity > 1000) {
          return this.gridCluster(features, config, viewParams);
        } else if (pointDensity > 100) {
          return this.densityCluster(features, config);
        } else {
          return this.distanceCluster(features, config);
        }
      default:
        return this.distanceCluster(features, config);
    }
  }

  // Clustering implementations
  private gridCluster(
    features: GeospatialFeature[],
    config: ClusterConfig,
    viewParams: { extent: [number, number, number, number] }
  ): Cluster[] {
    const { gridSize = 50 } = config;
    const [minX, minY, maxX, maxY] = viewParams.extent;
    
    const cellWidth = (maxX - minX) / gridSize;
    const cellHeight = (maxY - minY) / gridSize;
    
    const grid: Record<string, GeospatialFeature[]> = {};
    
    features.forEach(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return;
      
      const [x, y] = getCoordinates(feature.geometry.coordinates);
      const cellX = Math.floor((x - minX) / cellWidth);
      const cellY = Math.floor((y - minY) / cellHeight);
      const cellKey = `${cellX}-${cellY}`;
      
      if (!grid[cellKey]) {
        grid[cellKey] = [];
      }
      grid[cellKey].push(feature);
    });
    
    return Object.entries(grid)
      .filter(([_, features]) => features.length >= (config.minPoints || 1))
      .map(([cellKey, features]) => {
        const centroid = this.calculateCentroid(features);
        const bounds = this.calculateBoundingBox(features);
        const attributes = this.summarizeAttributes(features);
        
        return this.createCluster(
          `grid-${cellKey}`,
          features,
          centroid,
          {
            minX: bounds[0],
            minY: bounds[1],
            maxX: bounds[2],
            maxY: bounds[3]
          },
          attributes
        );
      });
  }

  private distanceCluster(
    features: GeospatialFeature[],
    config: ClusterConfig
  ): Cluster[] {
    const clusters: Cluster[] = [];
    const processed = new Set<number>();
    
    features.forEach((feature, index) => {
      if (processed.has(index) || !feature.geometry) return;
      
      const neighbors = this.findNeighbors(feature, features, config.radius || 100);
      if (neighbors.length < (config.minPoints || 2)) return;
      
      processed.add(index);
      const clusterFeatures: GeospatialFeature[] = [feature, ...neighbors];
      
      neighbors.forEach(neighbor => {
        const neighborIndex = features.indexOf(neighbor);
        processed.add(neighborIndex);
        
        const secondaryNeighbors = this.findNeighbors(neighbor, features, config.radius || 100)
          .filter(n => !clusterFeatures.includes(n));
        
        clusterFeatures.push(...secondaryNeighbors);
        secondaryNeighbors.forEach(n => processed.add(features.indexOf(n)));
      });
      
      const centroid = this.calculateCentroid(clusterFeatures);
      const bounds = this.calculateBoundingBox(clusterFeatures);
      const attributes = this.summarizeAttributes(clusterFeatures);
      
      clusters.push(this.createCluster(
        `distance-${clusters.length}`,
        clusterFeatures,
        centroid,
        {
          minX: bounds[0],
          minY: bounds[1],
          maxX: bounds[2],
          maxY: bounds[3]
        },
        attributes
      ));
    });
    
    return clusters;
  }

  private densityCluster(
    features: GeospatialFeature[],
    config: ClusterConfig
  ): Cluster[] {
    const { densityThreshold = 0.5 } = config;
    const clusters: Cluster[] = [];
    const visited = new Set<number>();
    const noise: GeospatialFeature[] = [];
    
    features.forEach((feature, index) => {
      if (visited.has(index) || !feature.geometry) return;
      
      visited.add(index);
      const neighbors = this.findNeighbors(feature, features, config.radius || 100);
      
      if (neighbors.length < (config.minPoints || 3)) {
        noise.push(feature);
        return;
      }
      
      const clusterFeatures: GeospatialFeature[] = [feature];
      let neighborIndex = 0;
      
      while (neighborIndex < neighbors.length) {
        const currentPoint = neighbors[neighborIndex];
        const currentIndex = features.indexOf(currentPoint);
        
        if (!visited.has(currentIndex)) {
          visited.add(currentIndex);
          const currentNeighbors = this.findNeighbors(currentPoint, features, config.radius || 100);
          
          if (currentNeighbors.length >= (config.minPoints || 3)) {
            neighbors.push(...currentNeighbors.filter(n => !neighbors.includes(n)));
          }
        }
        
        if (!clusterFeatures.includes(currentPoint)) {
          clusterFeatures.push(currentPoint);
        }
        
        neighborIndex++;
      }
      
      if (clusterFeatures.length >= (config.minPoints || 3)) {
        const centroid = this.calculateCentroid(clusterFeatures);
        const bounds = this.calculateBoundingBox(clusterFeatures);
        const attributes = {
          ...this.summarizeAttributes(clusterFeatures),
          density: clusterFeatures.length / (Math.PI * Math.pow(config.radius || 100, 2))
        };
        
        clusters.push(this.createCluster(
          `density-${clusters.length}`,
          clusterFeatures,
          centroid,
          {
            minX: bounds[0],
            minY: bounds[1],
            maxX: bounds[2],
            maxY: bounds[3]
          },
          attributes
        ));
      }
    });
    
    if (noise.length > 0) {
      const noiseDensity = noise.length / (Math.PI * Math.pow((config.radius || 100) * 2, 2));
      if (noiseDensity >= densityThreshold) {
        const centroid = this.calculateCentroid(noise);
        const bounds = this.calculateBoundingBox(noise);
        const attributes = {
          ...this.summarizeAttributes(noise),
          density: noiseDensity
        };
        
        clusters.push(this.createCluster(
          'noise-cluster',
          noise,
          centroid,
          {
            minX: bounds[0],
            minY: bounds[1],
            maxX: bounds[2],
            maxY: bounds[3]
          },
          attributes
        ));
      }
    }
    
    return clusters;
  }

  // Helper methods
  private findNeighbors(
    feature: GeospatialFeature,
    features: GeospatialFeature[],
    radius: number
  ): GeospatialFeature[] {
    if (!feature.geometry) return [];
    const [x1, y1] = getCoordinates(feature.geometry.coordinates);
    
    return features.filter(neighbor => {
      if (!neighbor.geometry || neighbor === feature) return false;
      
      const [x2, y2] = getCoordinates(neighbor.geometry.coordinates);
      const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
      
      return distance <= radius;
    });
  }

  private calculateCentroid(features: GeospatialFeature[]): Point {
    const validFeatures = features.filter(f => f.geometry && f.geometry.coordinates);
    if (validFeatures.length === 0) return { x: 0, y: 0 };
    
    const sum = validFeatures.reduce(
      (acc, feature) => {
        const [x, y] = getCoordinates(feature.geometry!.coordinates);
        return { x: acc.x + x, y: acc.y + y };
      },
      { x: 0, y: 0 }
    );
    
    return {
      x: sum.x / validFeatures.length,
      y: sum.y / validFeatures.length
    };
  }

  private calculateBoundingBox(
    features: GeospatialFeature[]
  ): [number, number, number, number] {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    features.forEach(feature => {
      if (!feature.geometry) return;
      const [x, y] = getCoordinates(feature.geometry.coordinates);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    
    return [minX, minY, maxX, maxY];
  }

  private createCluster(
    id: string,
    features: GeospatialFeature[],
    centroid: Point,
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    attributes: Record<string, any>
  ): Cluster {
    return {
      id,
      centroid,
      count: features.length,
      bounds,
      features,
      attributes,
      properties: attributes
    };
  }

  private summarizeAttributes(features: GeospatialFeature[]): Record<string, any> {
    const summary: Record<string, any> = {};
    if (features.length === 0) return summary;

    const propertyKeys = Object.keys(features[0].properties || {});
    
    propertyKeys.forEach(key => {
      const values = features
        .map(f => f.properties?.[key])
        .filter((v): v is number | string => v !== undefined);
      
      if (values.length === 0) return;

      if (typeof values[0] === 'number') {
        const numberValues = values as number[];
        summary[key] = {
          min: Math.min(...numberValues),
          max: Math.max(...numberValues),
          mean: numberValues.reduce((a, b) => a + b, 0) / numberValues.length,
          median: this.calculateMedian(numberValues)
        };
      } else if (typeof values[0] === 'string') {
        const frequencies = (values as string[]).reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        summary[key] = {
          uniqueValues: Object.keys(frequencies).length,
          mostCommon: Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value, count]) => ({
              value,
              count,
              percentage: (count / values.length) * 100
            }))
        };
      }
    });
    
    return summary;
  }

  private calculateMedian(numbers: number[]): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  // Spatial index and caching methods
  private updateSpatialIndex(clusters: Cluster[]) {
    this.spatialIndex.clear();
    
    const indexItems: RBushItem[] = clusters.map(cluster => ({
      minX: cluster.bounds.minX,
      minY: cluster.bounds.minY,
      maxX: cluster.bounds.maxX,
      maxY: cluster.bounds.maxY,
      cluster
    }));
    
    this.spatialIndex.load(indexItems);
  }

  private generateCacheKey(
    features: GeospatialFeature[],
    config: ClusterConfig,
    viewParams: { zoom: number; extent: [number, number, number, number] }
  ): string {
    const featureIds = features.map(f => f.id).sort().join(',');
    return `${config.strategy}-${viewParams.zoom}-${featureIds}`;
  }

  // Public interaction methods
  expandCluster(clusterId: string): GeospatialFeature[] {
    const cluster = this.findClusterById(clusterId);
    return cluster ? cluster.features : [];
  }

  getClusterPreview(clusterId: string): {
    count: number;
    summary: Record<string, any>;
  } {
    const cluster = this.findClusterById(clusterId);
    if (!cluster) return { count: 0, summary: {} };

    return {
      count: cluster.features.length,
      summary: this.generateClusterSummary(cluster)
    };
  }

  private findClusterById(clusterId: string): Cluster | null {
    const searchResults = this.spatialIndex.search({
      minX: -180,
      minY: -90,
      maxX: 180,
      maxY: 90
    });

    const found = searchResults.find(item => item.cluster.id === clusterId);
    return found ? found.cluster : null;
  }

  private generateClusterSummary(cluster: Cluster): Record<string, any> {
    const summary: Record<string, any> = {};
    
    if (cluster.features.length === 0) return summary;

    const samplePoint = cluster.features[0];
    const propertyKeys = Object.keys(samplePoint.properties || {});

    propertyKeys.forEach(key => {
      const values = cluster.features
        .map(p => p.properties?.[key])
        .filter((v): v is number | string => v !== undefined);
      
      if (values.length === 0) return;

      if (typeof values[0] === 'number') {
        const numberValues = values as number[];
        summary[key] = {
          min: Math.min(...numberValues),
          max: Math.max(...numberValues),
          avg: numberValues.reduce((a, b) => a + b, 0) / numberValues.length,
          median: this.calculateMedian(numberValues)
        };
      } else if (typeof values[0] === 'string') {
        const frequencies = (values as string[]).reduce((acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        summary[key] = {
          uniqueValues: Object.keys(frequencies).length,
          mostCommon: Object.entries(frequencies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([value, count]) => ({
              value,
              count,
              percentage: (count / values.length) * 100
            }))
        };
      }
    });

    return summary;
  }
}

// Export singleton instance
export const clusterManager = new ClusterManager();