/**
 * Geographic Utilities for Clustering
 * 
 * Provides geographic calculations, distance measurements, and boundary generation
 * for cluster visualization and validation.
 */

import { ClusteringFeature } from '../types';

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in miles
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calculate centroid (center point) of a cluster
 * Returns [longitude, latitude]
 */
export function calculateCentroid(features: ClusteringFeature[]): [number, number] {
  if (features.length === 0) {
    return [-98.5795, 39.8283]; // Center of US as fallback
  }
  
  let totalLat = 0;
  let totalLon = 0;
  let validPoints = 0;
  
  features.forEach(feature => {
    if (typeof feature.latitude === 'number' && typeof feature.longitude === 'number' &&
        !isNaN(feature.latitude) && !isNaN(feature.longitude)) {
      totalLat += feature.latitude;
      totalLon += feature.longitude;
      validPoints++;
    }
  });
  
  if (validPoints === 0) {
    return [-98.5795, 39.8283]; // Fallback to center of US
  }
  
  return [totalLon / validPoints, totalLat / validPoints]; // [lng, lat]
}

/**
 * Generate cluster boundary polygon using convex hull algorithm
 * Returns GeoJSON Polygon
 */
export function generateClusterBoundary(features: ClusteringFeature[]): GeoJSON.Polygon {
  if (features.length === 0) {
    // Return a small polygon around center of US
    return {
      type: 'Polygon',
      coordinates: [[
        [-98.58, 39.82],
        [-98.58, 39.83],
        [-98.57, 39.83],
        [-98.57, 39.82],
        [-98.58, 39.82]
      ]]
    };
  }
  
  if (features.length === 1) {
    // Single point - create small square around it
    const [lon, lat] = [features[0].longitude, features[0].latitude];
    const offset = 0.01; // Small offset for visibility
    return {
      type: 'Polygon',
      coordinates: [[
        [lon - offset, lat - offset],
        [lon - offset, lat + offset],
        [lon + offset, lat + offset],
        [lon + offset, lat - offset],
        [lon - offset, lat - offset]
      ]]
    };
  }
  
  if (features.length === 2) {
    // Two points - create rectangle around them
    const points = features.map(f => [f.longitude, f.latitude]);
    const minLon = Math.min(...points.map(p => p[0]));
    const maxLon = Math.max(...points.map(p => p[0]));
    const minLat = Math.min(...points.map(p => p[1]));
    const maxLat = Math.max(...points.map(p => p[1]));
    const padding = 0.01;
    
    return {
      type: 'Polygon',
      coordinates: [[
        [minLon - padding, minLat - padding],
        [minLon - padding, maxLat + padding],
        [maxLon + padding, maxLat + padding],
        [maxLon + padding, minLat - padding],
        [minLon - padding, minLat - padding]
      ]]
    };
  }
  
  // For 3+ points, use convex hull
  const points = features
    .map(f => [f.longitude, f.latitude] as [number, number])
    .filter(p => !isNaN(p[0]) && !isNaN(p[1]));
    
  if (points.length < 3) {
    // Fallback to bounding box
    return generateBoundingBoxPolygon(points);
  }
  
  const hull = convexHull(points);
  
  // Ensure we have at least 3 points for a valid polygon
  if (hull.length < 3) {
    return generateBoundingBoxPolygon(points);
  }
  
  // Close the polygon by adding the first point at the end
  const closedHull = [...hull, hull[0]];
  
  return {
    type: 'Polygon',
    coordinates: [closedHull]
  };
}

/**
 * Generate a bounding box polygon from points
 */
function generateBoundingBoxPolygon(points: [number, number][]): GeoJSON.Polygon {
  if (points.length === 0) {
    return {
      type: 'Polygon',
      coordinates: [[
        [-98.58, 39.82],
        [-98.58, 39.83],
        [-98.57, 39.83],
        [-98.57, 39.82],
        [-98.58, 39.82]
      ]]
    };
  }
  
  const lons = points.map(p => p[0]);
  const lats = points.map(p => p[1]);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  
  const padding = Math.max(0.01, (maxLon - minLon) * 0.1, (maxLat - minLat) * 0.1);
  
  return {
    type: 'Polygon',
    coordinates: [[
      [minLon - padding, minLat - padding],
      [minLon - padding, maxLat + padding],
      [maxLon + padding, maxLat + padding],
      [maxLon + padding, minLat - padding],
      [minLon - padding, minLat - padding]
    ]]
  };
}

/**
 * Convex Hull implementation using Graham Scan algorithm
 */
function convexHull(points: [number, number][]): [number, number][] {
  if (points.length < 3) return points;
  
  // Remove duplicate points
  const uniquePoints = points.filter((point, index, arr) => 
    arr.findIndex(p => p[0] === point[0] && p[1] === point[1]) === index
  );
  
  if (uniquePoints.length < 3) return uniquePoints;
  
  // Find the bottom-most point (and left-most in case of tie)
  const start = uniquePoints.reduce((lowest, point) => 
    point[1] < lowest[1] || (point[1] === lowest[1] && point[0] < lowest[0]) ? point : lowest
  );
  
  // Sort points by polar angle with respect to start point
  const sortedPoints = uniquePoints
    .filter(p => p !== start)
    .sort((a, b) => {
      const angleA = Math.atan2(a[1] - start[1], a[0] - start[0]);
      const angleB = Math.atan2(b[1] - start[1], b[0] - start[0]);
      if (angleA !== angleB) return angleA - angleB;
      // If angles are equal, sort by distance
      const distA = Math.pow(a[0] - start[0], 2) + Math.pow(a[1] - start[1], 2);
      const distB = Math.pow(b[0] - start[0], 2) + Math.pow(b[1] - start[1], 2);
      return distA - distB;
    });
  
  const hull: [number, number][] = [start];
  
  for (const point of sortedPoints) {
    // Remove points that make clockwise turn
    while (hull.length > 1 && !isCounterClockwise(hull[hull.length - 2], hull[hull.length - 1], point)) {
      hull.pop();
    }
    hull.push(point);
  }
  
  return hull;
}

/**
 * Check if three points make a counter-clockwise turn
 */
function isCounterClockwise(a: [number, number], b: [number, number], c: [number, number]): boolean {
  return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
}

/**
 * Calculate the area of a polygon in square miles (approximate)
 */
export function calculatePolygonArea(polygon: GeoJSON.Polygon): number {
  if (!polygon.coordinates || polygon.coordinates.length === 0) {
    return 0;
  }
  
  const coords = polygon.coordinates[0];
  if (coords.length < 4) return 0; // Need at least 3 points + closing point
  
  let area = 0;
  const numPoints = coords.length - 1; // Exclude closing point
  
  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    area += coords[i][0] * coords[j][1];
    area -= coords[j][0] * coords[i][1];
  }
  
  area = Math.abs(area) / 2;
  
  // Convert from degrees squared to approximate square miles
  // This is a rough approximation - precise calculation would need projection
  const milesPerDegree = 69; // Approximate miles per degree at mid-latitudes
  return area * milesPerDegree * milesPerDegree;
}

/**
 * Check if a point is inside a polygon
 */
export function isPointInPolygon(point: [number, number], polygon: GeoJSON.Polygon): boolean {
  const [x, y] = point;
  const coords = polygon.coordinates[0];
  
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

/**
 * Calculate the bounding box of a set of features
 */
export function calculateBoundingBox(features: ClusteringFeature[]): {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
} {
  if (features.length === 0) {
    return { minLon: -98.58, maxLon: -98.57, minLat: 39.82, maxLat: 39.83 };
  }
  
  const validFeatures = features.filter(f => 
    typeof f.latitude === 'number' && typeof f.longitude === 'number' &&
    !isNaN(f.latitude) && !isNaN(f.longitude)
  );
  
  if (validFeatures.length === 0) {
    return { minLon: -98.58, maxLon: -98.57, minLat: 39.82, maxLat: 39.83 };
  }
  
  const lats = validFeatures.map(f => f.latitude);
  const lons = validFeatures.map(f => f.longitude);
  
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats)
  };
}

/**
 * Generate a circle polygon (approximated with many points)
 */
export function generateCirclePolygon(
  center: [number, number], 
  radiusMiles: number, 
  points: number = 32
): GeoJSON.Polygon {
  const [centerLon, centerLat] = center;
  const coordinates: [number, number][] = [];
  
  // Convert radius from miles to approximate degrees
  const radiusDegrees = radiusMiles / 69; // Rough approximation
  
  for (let i = 0; i < points; i++) {
    const angle = (i / points) * 2 * Math.PI;
    const lon = centerLon + radiusDegrees * Math.cos(angle);
    const lat = centerLat + radiusDegrees * Math.sin(angle);
    coordinates.push([lon, lat]);
  }
  
  // Close the polygon
  coordinates.push(coordinates[0]);
  
  return {
    type: 'Polygon',
    coordinates: [coordinates]
  };
}