import { Point, Cluster, ClusteringOptions, ClusteringResult } from '../types';
import type { GeospatialFeature } from '../../types/geospatial-ai-types';

export class DensityClusterer {
  private densityThreshold: number;
  private minDistance: number;
  private maxFeatures: number;
  private visited: Set<string>;

  constructor(options: ClusteringOptions) {
    this.densityThreshold = options.densityThreshold || 3;
    this.minDistance = options.minDistance || 100;
    this.maxFeatures = options.maxFeatures || 100;
    this.visited = new Set();
  }

  private calculateDistance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
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

  private findNeighbors(
    feature: GeospatialFeature,
    features: GeospatialFeature[]
  ): GeospatialFeature[] {
    const [x, y] = this.getCoordinates(feature.geometry.coordinates);
    const point: Point = { x, y };
    
    return features.filter(f => {
      if (f.id === feature.id) return false;
      const [fx, fy] = this.getCoordinates(f.geometry.coordinates);
      return this.calculateDistance(point, { x: fx, y: fy }) <= this.minDistance;
    });
  }

  // Helper method to safely get feature ID or generate one
  private getFeatureId(feature: GeospatialFeature): string {
    return feature.id || `spatial-${feature.geometry.coordinates.join('-')}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private expandCluster(
    feature: GeospatialFeature,
    neighbors: GeospatialFeature[],
    cluster: Cluster,
    features: GeospatialFeature[],
    unclustered: GeospatialFeature[]
  ): void {
    cluster.features.push(feature);
    this.visited.add(this.getFeatureId(feature));

    let index = 0;
    while (index < neighbors.length && cluster.count < this.maxFeatures) {
      const current = neighbors[index];
      const currentId = this.getFeatureId(current);
      
      if (!this.visited.has(currentId)) {
        this.visited.add(currentId);
        const currentNeighbors = this.findNeighbors(current, features);
        
        if (currentNeighbors.length >= this.densityThreshold) {
          neighbors.push(...currentNeighbors.filter(n => 
            !neighbors.includes(n) && !this.visited.has(this.getFeatureId(n))
          ));
        }
      }

      if (!cluster.features.includes(current)) {
        cluster.features.push(current);
        cluster.count++;
        
        // Update cluster bounds and centroid
        const [bx, by] = this.getCoordinates(current.geometry.coordinates);
        cluster.bounds = {
          minX: Math.min(cluster.bounds.minX, bx),
          minY: Math.min(cluster.bounds.minY, by),
          maxX: Math.max(cluster.bounds.maxX, bx),
          maxY: Math.max(cluster.bounds.maxY, by)
        };

        // Update centroid
        const [cx, cy] = this.getCoordinates(current.geometry.coordinates);
        const newX = (cluster.centroid.x * (cluster.count - 1) + cx) / cluster.count;
        const newY = (cluster.centroid.y * (cluster.count - 1) + cy) / cluster.count;
        cluster.centroid = { x: newX, y: newY };
      }

      index++;
    }

    // Add remaining neighbors to unclustered if cluster is full
    if (cluster.count >= this.maxFeatures) {
      while (index < neighbors.length) {
        const remaining = neighbors[index];
        const remainingId = this.getFeatureId(remaining);
        if (!this.visited.has(remainingId)) {
          unclustered.push(remaining);
          this.visited.add(remainingId);
        }
        index++;
      }
    }
  }

  public cluster(features: GeospatialFeature[]): ClusteringResult {
    const startTime = performance.now();
    this.visited.clear();
    
    const clusters: Cluster[] = [];
    const unclustered: GeospatialFeature[] = [];
    let maxClusterSize = 0;

    // Process each feature
    for (const feature of features) {
      const featureId = this.getFeatureId(feature);
      if (this.visited.has(featureId)) continue;

      const neighbors = this.findNeighbors(feature, features);

      // If feature has enough neighbors, create a new cluster
      if (neighbors.length >= this.densityThreshold) {
        const [x, y] = this.getCoordinates(feature.geometry.coordinates);
        const newCluster: Cluster = {
          id: `density-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          centroid: { x, y },
          count: 1,
          bounds: {
            minX: x,
            minY: y,
            maxX: x,
            maxY: y
          },
          features: [],
          attributes: {},
          properties: {}
        };

        this.expandCluster(feature, neighbors, newCluster, features, unclustered);
        maxClusterSize = Math.max(maxClusterSize, newCluster.count);
        clusters.push(newCluster);
      } else {
        // Mark as unclustered if not enough neighbors
        unclustered.push(feature);
        this.visited.add(featureId);
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