/* eslint-disable no-case-declarations */
import type { Point, Cluster } from './types';
import type { GeospatialFeature } from '../types/geospatial-ai-types';

export interface ClusterConfig {
  strategy: 'grid' | 'distance' | 'density' | 'adaptive';
  gridSize?: number;
  radius?: number;
  minPoints?: number;
  densityThreshold?: number;
}

// Worker message types
interface ClusterWorkerMessage {
  type: 'cluster';
  features: GeospatialFeature[];
  config: ClusterConfig;
  viewParams: {
    zoom: number;
    extent: [number, number, number, number];
  };
}

function createCluster(
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

// Grid-based clustering implementation
function gridCluster(
  features: GeospatialFeature[],
  config: ClusterConfig,
  viewParams: { extent: [number, number, number, number] }
): Cluster[] {
  const { gridSize = 50 } = config;
  const [minX, minY, maxX, maxY] = viewParams.extent;
  
  const cellWidth = (maxX - minX) / gridSize;
  const cellHeight = (maxY - minY) / gridSize;
  
  // Initialize grid cells
  const grid: Record<string, GeospatialFeature[]> = {};
  
  // Assign points to grid cells
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
  
  // Convert grid cells to clusters
  return Object.entries(grid)
    .filter(([_, features]) => features.length >= (config.minPoints || 1))
    .map(([cellKey, features]) => {
      const centroid = calculateCentroid(features);
      const bounds = calculateBoundingBox(features);
      const attributes = summarizeAttributes(features);
      
      return createCluster(
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

// Distance-based clustering implementation
function distanceCluster(
  features: GeospatialFeature[],
  config: ClusterConfig
): Cluster[] {
  const clusters: Cluster[] = [];
  const processed = new Set<number>();
  
  features.forEach((feature, index) => {
    if (processed.has(index) || !feature.geometry) return;
    
    const neighbors = findNeighbors(feature, features, config.radius || 100);
    if (neighbors.length < (config.minPoints || 2)) return;
    
    processed.add(index);
    const clusterFeatures: GeospatialFeature[] = [feature, ...neighbors];
    
    neighbors.forEach(neighbor => {
      const neighborIndex = features.indexOf(neighbor);
      processed.add(neighborIndex);
      
      const secondaryNeighbors = findNeighbors(neighbor, features, config.radius || 100)
        .filter(n => !clusterFeatures.includes(n));
      
      clusterFeatures.push(...secondaryNeighbors);
      secondaryNeighbors.forEach(n => processed.add(features.indexOf(n)));
    });
    
    const centroid = calculateCentroid(clusterFeatures);
    const bounds = calculateBoundingBox(clusterFeatures);
    const attributes = summarizeAttributes(clusterFeatures);
    
    clusters.push(createCluster(
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

// Density-based clustering implementation
function densityCluster(
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
    const neighbors = findNeighbors(feature, features, config.radius || 100);
    
    if (neighbors.length < (config.minPoints || 3)) {
      noise.push(feature);
      return;
    }
    
    // Start new cluster
    const clusterFeatures: GeospatialFeature[] = [feature];
    let neighborIndex = 0;
    
    while (neighborIndex < neighbors.length) {
      const currentPoint = neighbors[neighborIndex];
      const currentIndex = features.indexOf(currentPoint);
      
      if (!visited.has(currentIndex)) {
        visited.add(currentIndex);
        const currentNeighbors = findNeighbors(currentPoint, features, config.radius || 100);
        
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
      const centroid = calculateCentroid(clusterFeatures);
      const bounds = calculateBoundingBox(clusterFeatures);
      const attributes = {
        ...summarizeAttributes(clusterFeatures),
        density: clusterFeatures.length / (Math.PI * Math.pow(config.radius || 100, 2))
      };
      
      clusters.push(createCluster(
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
  
  // Handle noise points if they exceed density threshold
  if (noise.length > 0) {
    const noiseDensity = noise.length / (Math.PI * Math.pow((config.radius || 100) * 2, 2));
    if (noiseDensity >= densityThreshold) {
      const centroid = calculateCentroid(noise);
      const bounds = calculateBoundingBox(noise);
      const attributes = {
        ...summarizeAttributes(noise),
        density: noiseDensity
      };
      
      clusters.push(createCluster(
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

// Helper functions
function findNeighbors(
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

function calculateCentroid(features: GeospatialFeature[]): Point {
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

function calculateBoundingBox(
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

function summarizeAttributes(features: GeospatialFeature[]): Record<string, any> {
  const summary: Record<string, any> = {};
  if (features.length === 0) return summary;
  
  // Get property keys from first feature
  const propertyKeys = Object.keys(features[0].properties || {});
  
  propertyKeys.forEach(key => {
    const values = features
      .map(f => f.properties?.[key])
      .filter((v): v is number | string => v !== undefined);
    
    if (values.length === 0) return;
    
    if (typeof values[0] === 'number') {
      summary[key] = {
        min: Math.min(...values as number[]),
        max: Math.max(...values as number[]),
        mean: (values as number[]).reduce((a, b) => a + b, 0) / values.length,
        median: calculateMedian(values as number[])
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

function calculateMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
}

function getCoordinates(coords: number | number[] | number[][] | number[][][]): [number, number] {
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

// Worker message handler
self.addEventListener('message', (event: MessageEvent<ClusterWorkerMessage>) => {
  if (event.data.type !== 'cluster') return;
  
  const { features, config, viewParams } = event.data;
  let clusters: Cluster[];
  
  // Select clustering strategy
  switch (config.strategy) {
    case 'grid':
      clusters = gridCluster(features, config, viewParams);
      break;
    case 'distance':
      clusters = distanceCluster(features, config);
      break;
    case 'density':
      clusters = densityCluster(features, config);
      break;
    case 'adaptive':
      // Determine best strategy based on data distribution
      const pointDensity = features.length / (
        (viewParams.extent[2] - viewParams.extent[0]) * 
        (viewParams.extent[3] - viewParams.extent[1])
      );
      
      if (pointDensity > 1000) {
        clusters = gridCluster(features, config, viewParams);
      } else if (pointDensity > 100) {
        clusters = densityCluster(features, config);
      } else {
        clusters = distanceCluster(features, config);
      }
      break;
    default:
      clusters = distanceCluster(features, config);
  }
  
  // Send results back to main thread
  self.postMessage({
    type: 'clusteringComplete',
    clusters
  });
});