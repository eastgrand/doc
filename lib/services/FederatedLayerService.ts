/**
 * Federated Layer Service
 * Combines multiple state-specific ArcGIS Feature Services into unified layers
 * Optimized for The Doors Documentary 3-state analysis (IL, IN, WI)
 */

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Graphic from "@arcgis/core/Graphic";
import { Feature } from "@arcgis/core/geometry";

export interface StateServiceConfig {
  url: string;
  identifier: string; // state code (IL, IN, WI)
  layerId?: number;  // specific layer within the service
}

export interface FederatedLayerConfig {
  services: StateServiceConfig[];
  layerName: string;
  cacheTimeout?: number; // milliseconds
  parallelFetch?: boolean;
}

export class FederatedLayerService {
  private cache: Map<string, { layer: __esri.FeatureLayer; timestamp: number }> = new Map();
  private readonly DEFAULT_CACHE_TIMEOUT = 300000; // 5 minutes

  /**
   * Create a unified feature layer from multiple state services
   * Specifically designed for IL, IN, WI hexagon data combination
   */
  async createFederatedLayer(config: FederatedLayerConfig): Promise<__esri.FeatureLayer> {
    console.log(`[FederatedLayer] Creating federated layer for ${config.services.length} state services`);
    console.log(`[FederatedLayer] States: ${config.services.map(s => s.identifier).join(', ')}`);

    try {
      // Check cache first
      const cacheKey = this.getCacheKey(config);
      const cached = this.cache.get(cacheKey);
      
      if (cached && this.isCacheValid(cached, config.cacheTimeout)) {
        console.log(`[FederatedLayer] Using cached layer for ${config.layerName}`);
        return cached.layer;
      }

      // Fetch data from all state services in parallel
      const allFeatures = await this.fetchAllStateData(config);
      
      // Create unified client-side feature layer
      const federatedLayer = await this.createUnifiedLayer(allFeatures, config);
      
      // Cache the result
      this.cache.set(cacheKey, { 
        layer: federatedLayer, 
        timestamp: Date.now() 
      });

      console.log(`[FederatedLayer] Successfully created federated layer with ${allFeatures.length} features`);
      return federatedLayer;

    } catch (error) {
      console.error('[FederatedLayer] Error creating federated layer:', error);
      throw new Error(`Failed to create federated layer: ${error.message}`);
    }
  }

  /**
   * Fetch data from all state services in parallel
   */
  private async fetchAllStateData(config: FederatedLayerConfig): Promise<Graphic[]> {
    const { services, parallelFetch = true } = config;
    
    if (parallelFetch) {
      // Fetch all states in parallel for better performance
      const statePromises = services.map(service => this.fetchStateData(service));
      const stateResults = await Promise.allSettled(statePromises);
      
      const allFeatures: Graphic[] = [];
      let successCount = 0;
      
      stateResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allFeatures.push(...result.value);
          successCount++;
          console.log(`[FederatedLayer] ${services[index].identifier}: ${result.value.length} features`);
        } else {
          console.error(`[FederatedLayer] Failed to fetch ${services[index].identifier}:`, result.reason);
        }
      });
      
      if (successCount === 0) {
        throw new Error('Failed to fetch data from any state service');
      }
      
      return allFeatures;
    } else {
      // Sequential fetch (fallback for debugging)
      const allFeatures: Graphic[] = [];
      
      for (const service of services) {
        try {
          const features = await this.fetchStateData(service);
          allFeatures.push(...features);
          console.log(`[FederatedLayer] ${service.identifier}: ${features.length} features`);
        } catch (error) {
          console.error(`[FederatedLayer] Failed to fetch ${service.identifier}:`, error);
        }
      }
      
      return allFeatures;
    }
  }

  /**
   * Fetch data from a single state service
   */
  private async fetchStateData(service: StateServiceConfig): Promise<Graphic[]> {
    console.log(`[FederatedLayer] Fetching data from ${service.identifier} service...`);
    
    try {
      // Create temporary feature layer to query the service
      const sourceLayer = new FeatureLayer({
        url: service.layerId !== undefined 
          ? `${service.url}/${service.layerId}`
          : service.url
      });
      
      // Load the layer to get its properties
      await sourceLayer.load();
      
      // Create query for all features
      const query = sourceLayer.createQuery();
      query.where = "1=1"; // Get all features
      query.returnGeometry = true;
      query.outFields = ["*"]; // Get all fields
      
      // Execute query
      const results = await sourceLayer.queryFeatures(query);
      
      // Add state identifier to each feature's attributes
      const stateFeatures = results.features.map((feature, index) => {
        const graphic = feature.clone();
        // Add composite ID to ensure uniqueness across states
        graphic.attributes = {
          ...graphic.attributes,
          FEDERATED_ID: `${service.identifier}_${feature.attributes.OBJECTID || index}`,
          SOURCE_STATE: service.identifier,
          SOURCE_SERVICE: service.url
        };
        return graphic;
      });
      
      return stateFeatures;
      
    } catch (error) {
      console.error(`[FederatedLayer] Error fetching from ${service.identifier}:`, error);
      throw new Error(`Failed to fetch data from ${service.identifier}: ${error.message}`);
    }
  }

  /**
   * Create unified client-side feature layer from combined features
   */
  private async createUnifiedLayer(
    features: Graphic[], 
    config: FederatedLayerConfig
  ): Promise<__esri.FeatureLayer> {
    
    if (features.length === 0) {
      throw new Error('No features to create layer from');
    }
    
    // Get fields from the first feature
    const sampleFeature = features[0];
    const fields = this.extractFieldsFromFeature(sampleFeature);
    
    // Add federated fields
    fields.push(
      { name: "FEDERATED_ID", type: "string", alias: "Federated ID" },
      { name: "SOURCE_STATE", type: "string", alias: "Source State" },
      { name: "SOURCE_SERVICE", type: "string", alias: "Source Service" }
    );
    
    // Create the federated layer
    const federatedLayer = new FeatureLayer({
      title: `${config.layerName} (Federated: ${config.services.map(s => s.identifier).join(', ')})`,
      source: features,
      fields: fields,
      objectIdField: "FEDERATED_ID",
      geometryType: "polygon", // H3 hexagons are polygons
      spatialReference: { wkid: 4326 },
      renderer: this.createDefaultRenderer(),
      popupTemplate: this.createPopupTemplate(fields),
      // Performance optimizations
      minScale: 0,
      maxScale: 0,
      labelsVisible: false,
      legendEnabled: true
    });
    
    return federatedLayer;
  }

  /**
   * Extract field definitions from a feature
   */
  private extractFieldsFromFeature(feature: Graphic): any[] {
    const fields = [];
    const attributes = feature.attributes || {};
    
    for (const [key, value] of Object.entries(attributes)) {
      // Skip federated fields as we'll add them separately
      if (key === 'FEDERATED_ID' || key === 'SOURCE_STATE' || key === 'SOURCE_SERVICE') {
        continue;
      }
      
      let fieldType = "string";
      if (typeof value === "number") {
        fieldType = Number.isInteger(value) ? "integer" : "double";
      } else if (typeof value === "boolean") {
        fieldType = "string"; // ArcGIS doesn't have boolean type
      } else if (value instanceof Date) {
        fieldType = "date";
      }
      
      fields.push({
        name: key,
        type: fieldType,
        alias: this.humanizeFieldName(key)
      });
    }
    
    return fields;
  }

  /**
   * Convert field names to human-readable format
   */
  private humanizeFieldName(fieldName: string): string {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Create default renderer for hexagons
   */
  private createDefaultRenderer(): any {
    return {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [51, 122, 183, 0.4], // Semi-transparent blue
        outline: {
          color: [51, 122, 183, 1],
          width: 1
        }
      }
    };
  }

  /**
   * Create popup template for federated features
   */
  private createPopupTemplate(fields: any[]): any {
    const fieldInfos = fields
      .filter(f => f.name !== 'FEDERATED_ID' && f.name !== 'SOURCE_SERVICE')
      .map(field => ({
        fieldName: field.name,
        label: field.alias || field.name
      }));
    
    return {
      title: "{SOURCE_STATE} - Hexagon {OBJECTID}",
      content: [{
        type: "fields",
        fieldInfos: fieldInfos
      }]
    };
  }

  /**
   * Generate cache key for configuration
   */
  private getCacheKey(config: FederatedLayerConfig): string {
    const serviceUrls = config.services.map(s => s.url).sort().join('|');
    return `${config.layerName}:${serviceUrls}`;
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(cached: { timestamp: number }, timeout?: number): boolean {
    const cacheTimeout = timeout || this.DEFAULT_CACHE_TIMEOUT;
    return (Date.now() - cached.timestamp) < cacheTimeout;
  }

  /**
   * Clear cache for a specific layer or all layers
   */
  clearCache(layerName?: string): void {
    if (layerName) {
      for (const [key] of this.cache) {
        if (key.startsWith(layerName)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    console.log(`[FederatedLayer] Cache cleared ${layerName ? `for ${layerName}` : '(all)'}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}