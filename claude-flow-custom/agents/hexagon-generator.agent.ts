/**
 * H3 Hexagon Grid Generator Agent
 * Specialized agent for generating H3 hexagonal grids for The Doors Documentary analysis
 */

import * as h3 from 'h3-js';
import { Feature, FeatureCollection, Polygon } from 'geojson';

export interface HexagonGeneratorConfig {
  resolution: number; // H3 resolution (6 for ~2 mile radius)
  states: string[]; // State codes to include
  outputFormat: 'geojson' | 'esri' | 'wkt';
}

export class HexagonGeneratorAgent {
  private config: HexagonGeneratorConfig;
  
  constructor(config: HexagonGeneratorConfig) {
    this.config = config;
  }

  /**
   * Generate H3 hexagon grid for specified bounding box
   */
  async generateGrid(boundingBox: number[][]): Promise<FeatureCollection> {
    console.log(`[HexagonGenerator] Starting grid generation at resolution ${this.config.resolution}`);
    
    // Convert bounding box to H3 hexagons
    const hexagons = h3.polyfill(boundingBox, this.config.resolution, true);
    
    // Convert H3 indices to GeoJSON features
    const features: Feature[] = hexagons.map((hexIndex, idx) => {
      const boundary = h3.h3ToGeoBoundary(hexIndex, true);
      
      return {
        type: 'Feature',
        properties: {
          h3_index: hexIndex,
          h3_resolution: this.config.resolution,
          center_lat: h3.h3ToGeo(hexIndex)[0],
          center_lng: h3.h3ToGeo(hexIndex)[1],
          feature_id: `HEX_${idx}`,
          radius_miles: 2 // Approximate radius for resolution 6
        },
        geometry: {
          type: 'Polygon',
          coordinates: [boundary]
        }
      };
    });

    console.log(`[HexagonGenerator] Generated ${features.length} hexagons`);
    
    return {
      type: 'FeatureCollection',
      features
    };
  }

  /**
   * Get bounding box for specified states
   */
  async getStateBoundingBox(states: string[]): Promise<number[][]> {
    const stateBounds: Record<string, number[][]> = {
      'CA': [[-124.409, 32.534], [-114.131, 42.009]],
      'NV': [[-120.005, 35.001], [-114.039, 42.002]],
      'AZ': [[-114.814, 31.332], [-109.045, 37.004]],
      'OR': [[-124.704, 41.991], [-116.463, 46.292]],
      'WA': [[-124.763, 45.543], [-116.915, 49.002]]
    };

    // Calculate combined bounding box
    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    states.forEach(state => {
      const bounds = stateBounds[state];
      if (bounds) {
        minLng = Math.min(minLng, bounds[0][0]);
        minLat = Math.min(minLat, bounds[0][1]);
        maxLng = Math.max(maxLng, bounds[1][0]);
        maxLat = Math.max(maxLat, bounds[1][1]);
      }
    });

    return [
      [minLng, minLat],
      [minLng, maxLat],
      [maxLng, maxLat],
      [maxLng, minLat],
      [minLng, minLat]
    ];
  }

  /**
   * Convert to ESRI format for ArcGIS compatibility
   */
  async convertToESRIFormat(geojson: FeatureCollection): Promise<any> {
    return {
      geometryType: 'esriGeometryPolygon',
      spatialReference: { wkid: 4326 },
      features: geojson.features.map((feature, idx) => ({
        attributes: {
          OBJECTID: idx + 1,
          ...feature.properties
        },
        geometry: {
          rings: (feature.geometry as Polygon).coordinates,
          spatialReference: { wkid: 4326 }
        }
      }))
    };
  }

  /**
   * Generate hexagon grid for The Doors Documentary analysis area
   */
  async generateDoorsDocumentaryGrid(): Promise<FeatureCollection> {
    const boundingBox = await this.getStateBoundingBox(this.config.states);
    const grid = await this.generateGrid(boundingBox);
    
    if (this.config.outputFormat === 'esri') {
      return await this.convertToESRIFormat(grid);
    }
    
    return grid;
  }

  /**
   * Calculate hexagon statistics
   */
  getGridStatistics(grid: FeatureCollection): {
    totalHexagons: number;
    approximateCoverage: number; // in square miles
    boundingBox: number[][];
  } {
    const hexagonArea = h3.hexArea(this.config.resolution, h3.UNITS.mi2);
    
    return {
      totalHexagons: grid.features.length,
      approximateCoverage: grid.features.length * hexagonArea,
      boundingBox: this.extractBoundingBox(grid)
    };
  }

  private extractBoundingBox(grid: FeatureCollection): number[][] {
    let minLng = Infinity, minLat = Infinity;
    let maxLng = -Infinity, maxLat = -Infinity;

    grid.features.forEach(feature => {
      const coords = feature.geometry.coordinates[0];
      coords.forEach(coord => {
        minLng = Math.min(minLng, coord[0]);
        minLat = Math.min(minLat, coord[1]);
        maxLng = Math.max(maxLng, coord[0]);
        maxLat = Math.max(maxLat, coord[1]);
      });
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  }
}

// Export agent factory
export function createHexagonGeneratorAgent(): HexagonGeneratorAgent {
  return new HexagonGeneratorAgent({
    resolution: 6, // H3 resolution 6 for ~2 mile radius
    states: ['CA', 'NV', 'AZ', 'OR', 'WA'],
    outputFormat: 'esri'
  });
}