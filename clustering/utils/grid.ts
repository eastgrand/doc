import { Point, Cluster, ClusteringOptions, ClusteringResult } from '../types';
import type { GeospatialFeature } from '../../types/geospatial-ai-types';

export class GridClusterer {
  private gridSize: number;
  private maxFeatures: number;
  private cells: Map<string, GeospatialFeature[]>;

  constructor(options: ClusteringOptions) {
    this.gridSize = options.gridSize || 50;
    this.maxFeatures = options.maxFeatures || 100;
    this.cells = new Map();
  }

  private getCellKey(point: Point): string {
    const cellX = Math.floor(point.x / this.gridSize);
    const cellY = Math.floor(point.y / this.gridSize);
    return `${cellX}:${cellY}`;
  }

  private getCoordinates(coords: number | number[] | number[][] | number[][][]): [number, number] {
    if (Array.isArray(coords)) {
      if (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        return [coords[0][0][0], coords[0][0][1]];
      }
      if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number' && typeof coords[0][1] === 'number') {
        return [coords[0][0], coords[0][1]];
      }
      if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        return [coords[0], coords[1]];
      }
    }
    return [0, 0];
  }

  private calculateCentroid(features: GeospatialFeature[]): Point {
    const sum = features.reduce((acc, feature) => {
      const [x, y] = this.getCoordinates(feature.geometry.coordinates);
      return { x: acc.x + x, y: acc.y + y };
    }, { x: 0, y: 0 });

    return {
      x: sum.x / features.length,
      y: sum.y / features.length
    };
  }

  private calculateBounds(features: GeospatialFeature[]): Cluster['bounds'] {
    return features.reduce((bounds, feature) => {
      const [x, y] = this.getCoordinates(feature.geometry.coordinates);
      return {
        minX: Math.min(bounds.minX, x),
        minY: Math.min(bounds.minY, y),
        maxX: Math.max(bounds.maxX, x),
        maxY: Math.max(bounds.maxY, y)
      };
    }, {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity
    });
  }

  public cluster(features: GeospatialFeature[]): ClusteringResult {
    const startTime = performance.now();
    this.cells.clear();

    // Assign features to grid cells
    features.forEach(feature => {
      const [x, y] = this.getCoordinates(feature.geometry.coordinates);
      const cellKey = this.getCellKey({ x, y });
      
      if (!this.cells.has(cellKey)) {
        this.cells.set(cellKey, []);
      }
      this.cells.get(cellKey)!.push(feature);
    });

    const clusters: Cluster[] = [];
    const unclustered: GeospatialFeature[] = [];
    let maxClusterSize = 0;

    // Create clusters from grid cells
    this.cells.forEach((cellFeatures, cellKey) => {
      if (cellFeatures.length > this.maxFeatures) {
        unclustered.push(...cellFeatures);
      } else if (cellFeatures.length > 1) {
        const centroid = this.calculateCentroid(cellFeatures);
        const bounds = this.calculateBounds(cellFeatures);
        
        const cluster: Cluster = {
          id: `grid-${cellKey}`,
          centroid,
          count: cellFeatures.length,
          bounds,
          features: cellFeatures,
          attributes: {},
          properties: {}
        };

        maxClusterSize = Math.max(maxClusterSize, cellFeatures.length);
        clusters.push(cluster);
      } else {
        unclustered.push(...cellFeatures);
      }
    });

    const processingTime = performance.now() - startTime;

    return {
      clusters,
      unclustered,
      stats: {
        totalFeatures: features.length,
        totalClusters: clusters.length,
        averageClusterSize: clusters.length > 0 
          ? clusters.reduce((sum, c) => sum + c.count, 0) / clusters.length 
          : 0,
        maxClusterSize,
        processingTime
      }
    };
  }
}