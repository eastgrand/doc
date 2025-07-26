import { Point, Cluster, ClusteringOptions, ClusteringResult } from '../types';
import type { GeospatialFeature } from '../../types/geospatial-ai-types';

export class DistanceClusterer {
  private minDistance: number;
  private maxFeatures: number;

  constructor(options: ClusteringOptions) {
    this.minDistance = options.minDistance || 100;
    this.maxFeatures = options.maxFeatures || 100;
  }

  private calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private findNearestCluster(point: Point, clusters: Cluster[]): Cluster | null {
    let nearest: Cluster | null = null;
    let minDistance = this.minDistance;

    for (const cluster of clusters) {
      const distance = this.calculateDistance(point, cluster.centroid);
      if (distance < minDistance && cluster.count < this.maxFeatures) {
        minDistance = distance;
        nearest = cluster;
      }
    }

    return nearest;
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

  private updateCluster(cluster: Cluster, feature: GeospatialFeature): void {
    const [x, y] = this.getCoordinates(feature.geometry.coordinates);
    
    // Update centroid
    const newCount = cluster.count + 1;
    const newX = (cluster.centroid.x * cluster.count + x) / newCount;
    const newY = (cluster.centroid.y * cluster.count + y) / newCount;
    
    cluster.centroid = { x: newX, y: newY };
    cluster.count = newCount;
    cluster.features.push(feature);

    // Update bounds
    cluster.bounds = {
      minX: Math.min(cluster.bounds.minX, x),
      minY: Math.min(cluster.bounds.minY, y),
      maxX: Math.max(cluster.bounds.maxX, x),
      maxY: Math.max(cluster.bounds.maxY, y)
    };
  }

  private createNewCluster(feature: GeospatialFeature): Cluster {
    const [x, y] = this.getCoordinates(feature.geometry.coordinates);
    return {
      id: `distance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      centroid: { x, y },
      count: 1,
      bounds: {
        minX: x,
        minY: y,
        maxX: x,
        maxY: y
      },
      features: [feature],
      attributes: {},
      properties: {}
    };
  }

  public cluster(features: GeospatialFeature[]): ClusteringResult {
    const startTime = performance.now();
    const clusters: Cluster[] = [];
    const unclustered: GeospatialFeature[] = [];
    let maxClusterSize = 0;

    // Sort features by some criteria (e.g., density of surrounding points)
    // This can help create more balanced clusters
    const sortedFeatures = [...features].sort((a, b) => {
      const [ax] = this.getCoordinates(a.geometry.coordinates);
      const [bx] = this.getCoordinates(b.geometry.coordinates);
      return ax - bx;
    });

    for (const feature of sortedFeatures) {
      const [x, y] = this.getCoordinates(feature.geometry.coordinates);
      const point: Point = { x, y };
      
      const nearestCluster = this.findNearestCluster(point, clusters);

      if (nearestCluster) {
        this.updateCluster(nearestCluster, feature);
        maxClusterSize = Math.max(maxClusterSize, nearestCluster.count);
      } else if (clusters.length < (this.maxFeatures || Infinity)) {
        clusters.push(this.createNewCluster(feature));
        maxClusterSize = Math.max(maxClusterSize, 1);
      } else {
        unclustered.push(feature);
      }
    }

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