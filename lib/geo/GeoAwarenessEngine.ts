/**
 * Geo-Awareness Engine
 * 
 * Comprehensive geographic query processing and filtering system that works
 * reliably with any endpoint and data format. Provides intelligent geographic
 * entity recognition, hierarchy support, and efficient filtering.
 */

export interface GeographicEntity {
  name: string;
  type: 'country' | 'state' | 'metro' | 'county' | 'city' | 'borough' | 'neighborhood' | 'zipcode' |
        'airport' | 'train_station' | 'bus_terminal' | 'ferry_terminal' | 'port' |
        'university' | 'college' | 'school_district' |
        'hospital' | 'medical_center' | 'clinic' |
        'venue' | 'stadium' | 'arena' | 'theater' | 'museum' |
        'shopping_center' | 'business_district' | 'industrial_zone' | 'market' |
        'landmark' | 'park' | 'monument' | 'attraction' |
        'bridge' | 'tunnel' | 'highway_interchange' | 'transit_hub' |
        'river' | 'bay' | 'mountain' | 'beach' |
        'government_building' | 'capitol' | 'embassy';
  aliases: string[];
  parentEntity?: string;
  childEntities?: string[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  zipCodes?: string[];
  confidence: number;
  address?: string;
  category?: string;
}

export interface GeoQuery {
  originalQuery: string;
  entities: GeographicEntity[];
  queryType: 'single_location' | 'comparison' | 'regional' | 'proximity';
  spatialRelation?: 'within' | 'near' | 'contains' | 'intersects';
  radius?: number; // in miles
}

export interface GeoFilterResult {
  filteredRecords: any[];
  matchedEntities: GeographicEntity[];
  filterStats: {
    totalRecords: number;
    matchedRecords: number;
    filterMethod: string;
    processingTimeMs: number;
  };
  fallbackUsed?: boolean;
  warnings?: string[];
}

/**
 * Main geo-awareness engine that provides reliable geographic filtering
 */
export class GeoAwarenessEngine {
  private static instance: GeoAwarenessEngine | null = null;
  
  // Geographic hierarchy and lookup maps
  private geographicHierarchy: Map<string, GeographicEntity> = new Map();
  private zipCodeToCity: Map<string, string> = new Map();
  private aliasMap: Map<string, string> = new Map();
  
  // Field priority for different data sources
  private fieldPriorities = {
    zipCode: ['ZIP_CODE', 'FSA_ID', 'ID', 'geo_id', 'zipcode'],
    description: ['DESCRIPTION', 'area_name', 'value_DESCRIPTION', 'name'],
    city: ['city', 'admin2_name', 'admin4_name'],
    state: ['state', 'admin1_name'],
    coordinates: ['latitude', 'longitude', 'lat', 'lng', 'centroid']
  };

  private constructor() {
    // Defer initialization to avoid blocking on startup
    // Will initialize on first use
  }

  public static getInstance(): GeoAwarenessEngine {
    if (!GeoAwarenessEngine.instance) {
      GeoAwarenessEngine.instance = new GeoAwarenessEngine();
    }
    return GeoAwarenessEngine.instance;
  }

  /**
   * Main entry point - parse geographic query and filter data
   */
  public async processGeoQuery(
    query: string, 
    records: any[], 
    endpoint?: string
  ): Promise<GeoFilterResult> {
    const startTime = Date.now();
    
    // Initialize geographic data on first use
    if (this.geographicHierarchy.size === 0) {
      this.initializeGeographicData();
    }
    
    try {
      console.log('[GeoAwarenessEngine] Processing geo query:', query);
      
      // Step 1: Parse geographic entities from query
      const geoQuery = await this.parseGeographicQuery(query);
      
      if (geoQuery.entities.length === 0) {
        return {
          filteredRecords: records,
          matchedEntities: [],
          filterStats: {
            totalRecords: records.length,
            matchedRecords: records.length,
            filterMethod: 'no_filter',
            processingTimeMs: Date.now() - startTime
          }
        };
      }

      // Step 2: Apply geographic filtering
      const filterResult = await this.applyGeographicFilter(records, geoQuery);
      
      // Step 3: Enhance with processing metadata
      filterResult.filterStats.processingTimeMs = Date.now() - startTime;
      
      console.log('[GeoAwarenessEngine] Filtering complete:', {
        entities: geoQuery.entities.length,
        originalRecords: records.length,
        filteredRecords: filterResult.filteredRecords.length,
        method: filterResult.filterStats.filterMethod
      });

      return filterResult;
      
    } catch (error) {
      console.error('[GeoAwarenessEngine] Error processing geo query:', error);
      
      // Return original data on error to avoid breaking analysis
      return {
        filteredRecords: records,
        matchedEntities: [],
        filterStats: {
          totalRecords: records.length,
          matchedRecords: records.length,
          filterMethod: 'error_fallback',
          processingTimeMs: Date.now() - startTime
        },
        warnings: [`Geographic filtering failed: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  /**
   * Parse geographic entities from natural language query
   */
  private async parseGeographicQuery(query: string): Promise<GeoQuery> {
    const entities: GeographicEntity[] = [];
    const queryLower = query.toLowerCase();
    
    // Method 1: Direct entity matching with hierarchy
    const directMatches = this.findDirectMatches(queryLower);
    entities.push(...directMatches);
    
    // Method 2: ZIP code pattern matching
    const zipMatches = this.findZipCodeMatches(query);
    entities.push(...zipMatches);
    
    // Method 3: Regional pattern matching
    const regionalMatches = this.findRegionalMatches(queryLower);
    entities.push(...regionalMatches);
    
    // Method 4: Fuzzy matching for typos/variations
    if (entities.length === 0) {
      const fuzzyMatches = this.findFuzzyMatches(queryLower);
      entities.push(...fuzzyMatches);
    }
    
    // Determine query type
    let queryType: GeoQuery['queryType'] = 'single_location';
    if (entities.length >= 2) {
      queryType = 'comparison';
    } else if (this.isRegionalQuery(queryLower)) {
      queryType = 'regional';
    } else if (this.isProximityQuery(queryLower)) {
      queryType = 'proximity';
    }
    
    return {
      originalQuery: query,
      entities: this.deduplicateEntities(entities),
      queryType,
      spatialRelation: this.determineSpatialRelation(queryLower),
      radius: this.extractRadius(query)
    };
  }

  /**
   * Apply geographic filtering using multiple strategies
   */
  private async applyGeographicFilter(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const strategies = [
      { method: 'hierarchical', fn: this.filterByHierarchy.bind(this) },
      { method: 'description_pattern', fn: this.filterByDescriptionPattern.bind(this) },
      { method: 'zipcode_lookup', fn: this.filterByZipCode.bind(this) },
      { method: 'field_scanning', fn: this.filterByFieldScanning.bind(this) },
      { method: 'fuzzy_matching', fn: this.filterByFuzzyMatching.bind(this) }
    ];

    let bestResult: GeoFilterResult | null = null;
    let fallbackUsed = false;

    for (const strategy of strategies) {
      try {
        const result = await strategy.fn(records, geoQuery);
        
        // Use this result if it found matches or if we don't have a result yet
        if (!bestResult || result.filteredRecords.length > 0) {
          bestResult = {
            ...result,
            filterStats: {
              ...result.filterStats,
              filterMethod: strategy.method
            }
          };
          
          // Stop if we found good matches (>5% of total records or >10 records)
          const matchRate = result.filteredRecords.length / records.length;
          if (matchRate > 0.05 || result.filteredRecords.length >= 10) {
            break;
          }
        }
      } catch (error) {
        console.warn(`[GeoAwarenessEngine] Strategy ${strategy.method} failed:`, error);
        fallbackUsed = true;
      }
    }

    // Final fallback - return all records if no strategy worked
    if (!bestResult || bestResult.filteredRecords.length === 0) {
      bestResult = {
        filteredRecords: records,
        matchedEntities: geoQuery.entities,
        filterStats: {
          totalRecords: records.length,
          matchedRecords: records.length,
          filterMethod: 'no_matches_fallback',
          processingTimeMs: 0
        },
        fallbackUsed: true,
        warnings: ['No geographic matches found, showing all data']
      };
    }

    if (bestResult) {
      bestResult.fallbackUsed = fallbackUsed;
      return bestResult;
    }
    
    // This should never happen, but provide a safe fallback
    return {
      filteredRecords: records,
      matchedEntities: [],
      filterStats: {
        totalRecords: records.length,
        matchedRecords: records.length,
        filterMethod: 'error_fallback',
        processingTimeMs: 0
      },
      fallbackUsed: true,
      warnings: ['Unexpected error in filtering strategies']
    };
  }

  /**
   * Filter using geographic hierarchy (most reliable)
   */
  private async filterByHierarchy(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const matchedRecords: any[] = [];
    const matchedEntities: GeographicEntity[] = [];

    for (const entity of geoQuery.entities) {
      // Get all child entities (e.g., if querying "New York", include all boroughs)
      const targetEntities = this.expandEntityHierarchy(entity);
      
      for (const record of records) {
        if (this.recordMatchesEntity(record, targetEntities)) {
          matchedRecords.push(record);
          if (!matchedEntities.find(e => e.name === entity.name)) {
            matchedEntities.push(entity);
          }
        }
      }
    }

    return {
      filteredRecords: this.deduplicateRecords(matchedRecords),
      matchedEntities,
      filterStats: {
        totalRecords: records.length,
        matchedRecords: matchedRecords.length,
        filterMethod: 'hierarchical',
        processingTimeMs: 0
      }
    };
  }

  /**
   * Filter by description field patterns (fallback for current format)
   */
  private async filterByDescriptionPattern(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const matchedRecords: any[] = [];
    const matchedEntities: GeographicEntity[] = [];

    for (const entity of geoQuery.entities) {
      const patterns = this.createDescriptionPatterns(entity);
      
      for (const record of records) {
        const description = this.extractDescription(record);
        
        if (patterns.some(pattern => pattern.test(description))) {
          matchedRecords.push(record);
          if (!matchedEntities.find(e => e.name === entity.name)) {
            matchedEntities.push(entity);
          }
        }
      }
    }

    return {
      filteredRecords: this.deduplicateRecords(matchedRecords),
      matchedEntities,
      filterStats: {
        totalRecords: records.length,
        matchedRecords: matchedRecords.length,
        filterMethod: 'description_pattern',
        processingTimeMs: 0
      }
    };
  }

  /**
   * Filter by ZIP code lookup
   */
  private async filterByZipCode(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const matchedRecords: any[] = [];
    const matchedEntities: GeographicEntity[] = [];

    // Build target ZIP codes from entities
    const targetZipCodes = new Set<string>();
    for (const entity of geoQuery.entities) {
      entity.zipCodes?.forEach(zip => targetZipCodes.add(zip));
    }

    if (targetZipCodes.size === 0) {
      return {
        filteredRecords: [],
        matchedEntities: [],
        filterStats: {
          totalRecords: records.length,
          matchedRecords: 0,
          filterMethod: 'zipcode_lookup',
          processingTimeMs: 0
        }
      };
    }

    for (const record of records) {
      const zipCode = this.extractZipCode(record);
      
      if (zipCode && targetZipCodes.has(zipCode)) {
        matchedRecords.push(record);
      }
    }

    return {
      filteredRecords: matchedRecords,
      matchedEntities: geoQuery.entities,
      filterStats: {
        totalRecords: records.length,
        matchedRecords: matchedRecords.length,
        filterMethod: 'zipcode_lookup',
        processingTimeMs: 0
      }
    };
  }

  /**
   * Filter by scanning all available fields
   */
  private async filterByFieldScanning(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const matchedRecords: any[] = [];
    const matchedEntities: GeographicEntity[] = [];

    for (const entity of geoQuery.entities) {
      const searchTerms = [entity.name, ...entity.aliases].map(term => term.toLowerCase());
      
      for (const record of records) {
        const recordText = this.extractAllTextFields(record).toLowerCase();
        
        if (searchTerms.some(term => recordText.includes(term))) {
          matchedRecords.push(record);
          if (!matchedEntities.find(e => e.name === entity.name)) {
            matchedEntities.push(entity);
          }
        }
      }
    }

    return {
      filteredRecords: this.deduplicateRecords(matchedRecords),
      matchedEntities,
      filterStats: {
        totalRecords: records.length,
        matchedRecords: matchedRecords.length,
        filterMethod: 'field_scanning',
        processingTimeMs: 0
      }
    };
  }

  /**
   * Filter using fuzzy string matching
   */
  private async filterByFuzzyMatching(
    records: any[], 
    geoQuery: GeoQuery
  ): Promise<GeoFilterResult> {
    
    const matchedRecords: any[] = [];
    const matchedEntities: GeographicEntity[] = [];

    for (const entity of geoQuery.entities) {
      for (const record of records) {
        if (this.fuzzyMatchRecord(record, entity)) {
          matchedRecords.push(record);
          if (!matchedEntities.find(e => e.name === entity.name)) {
            matchedEntities.push(entity);
          }
        }
      }
    }

    return {
      filteredRecords: this.deduplicateRecords(matchedRecords),
      matchedEntities,
      filterStats: {
        totalRecords: records.length,
        matchedRecords: matchedRecords.length,
        filterMethod: 'fuzzy_matching',
        processingTimeMs: 0
      }
    };
  }

  // === UTILITY METHODS ===

  private initializeGeographicData(): void {
    try {
      // Load geographic data from GeoDataManager
      const { GeoDataManager } = require('./GeoDataManager');
      const dataManager = GeoDataManager.getInstance();
      const database = dataManager.getDatabase();
      
      this.geographicHierarchy = database.entities;
      this.zipCodeToCity = database.zipCodeToCity;
      this.aliasMap = database.aliasMap;
      
      console.log('[GeoAwarenessEngine] Loaded geographic data:', {
        entities: this.geographicHierarchy.size,
        zipCodes: this.zipCodeToCity.size,
        aliases: this.aliasMap.size
      });
    } catch (error) {
      console.error('[GeoAwarenessEngine] Failed to initialize geographic data:', error);
      // Initialize with empty maps to prevent crashes
      this.geographicHierarchy = new Map();
      this.zipCodeToCity = new Map();
      this.aliasMap = new Map();
    }
  }

  /**
   * Find direct matches in geographic hierarchy
   */
  private findDirectMatches(query: string): GeographicEntity[] {
    const matches: GeographicEntity[] = [];
    
    // Split query into individual words
    const words = query.toLowerCase().split(/\s+/);
    
    // Look for direct entity matches
    for (const word of words) {
      const entity = this.geographicHierarchy.get(word);
      if (entity) {
        matches.push(entity);
      }
    }
    
    // Look for multi-word matches
    const phrases = this.extractPhrases(query);
    for (const phrase of phrases) {
      const entity = this.geographicHierarchy.get(phrase.toLowerCase());
      if (entity) {
        matches.push(entity);
      }
    }
    
    return matches;
  }

  /**
   * Find ZIP code patterns in query
   */
  private findZipCodeMatches(query: string): GeographicEntity[] {
    const matches: GeographicEntity[] = [];
    
    // Look for 5-digit ZIP codes
    const zipPattern = /\b\d{5}\b/g;
    const zipMatches = query.match(zipPattern);
    
    if (zipMatches) {
      for (const zip of zipMatches) {
        const cityName = this.zipCodeToCity.get(zip);
        if (cityName) {
          const entity = this.geographicHierarchy.get(cityName);
          if (entity) {
            matches.push(entity);
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Find regional matches (Northeast, West Coast, etc.)
   */
  private findRegionalMatches(query: string): GeographicEntity[] {
    const matches: GeographicEntity[] = [];
    const lowerQuery = query.toLowerCase();
    
    const regionalPatterns = [
      { pattern: /\b(northeast|northeastern|north east)\b/, region: 'northeastern united states' },
      { pattern: /\b(southeast|southeastern|south east)\b/, region: 'southeastern united states' },
      { pattern: /\b(midwest|midwestern|middle west)\b/, region: 'midwestern united states' },
      { pattern: /\b(southwest|southwestern|south west)\b/, region: 'southwestern united states' },
      { pattern: /\b(west coast|western)\b/, region: 'western united states' },
      { pattern: /\b(east coast|eastern)\b/, region: 'eastern united states' },
      { pattern: /\b(pacific northwest|pnw)\b/, region: 'pacific northwest' },
      { pattern: /\b(new england)\b/, region: 'new england' },
      { pattern: /\b(bay area|sf bay)\b/, region: 'bay area' },
      { pattern: /\b(silicon valley)\b/, region: 'silicon valley' },
      { pattern: /\b(los angeles metro|la metro|greater los angeles)\b/, region: 'los angeles metro' },
      { pattern: /\b(dallas fort worth|dfw|metroplex)\b/, region: 'dfw' },
      { pattern: /\b(south florida|sofla)\b/, region: 'south florida' },
      { pattern: /\b(tampa bay)\b/, region: 'tampa bay' }
    ];
    
    for (const { pattern, region } of regionalPatterns) {
      if (pattern.test(lowerQuery)) {
        // Create a regional entity
        const entity: GeographicEntity = {
          name: region,
          type: 'metro',
          aliases: [],
          confidence: 0.8
        };
        matches.push(entity);
      }
    }
    
    return matches;
  }

  /**
   * Find fuzzy matches for typos and variations
   */
  private findFuzzyMatches(query: string): GeographicEntity[] {
    const matches: GeographicEntity[] = [];
    const words = query.toLowerCase().split(/\s+/);
    
    // Check aliases first
    for (const word of words) {
      const canonical = this.aliasMap.get(word);
      if (canonical) {
        const entity = this.geographicHierarchy.get(canonical);
        if (entity) {
          matches.push(entity);
        }
      }
    }
    
    // Simple fuzzy matching using edit distance
    if (matches.length === 0) {
      for (const word of words) {
        if (word.length >= 4) { // Only fuzzy match longer words
          for (const [entityName, entity] of this.geographicHierarchy) {
            if (this.editDistance(word, entityName) <= 2) {
              matches.push(entity);
              break; // Only take first fuzzy match per word
            }
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Check if query is about a region
   */
  private isRegionalQuery(query: string): boolean {
    const regionalKeywords = [
      'region', 'area', 'coast', 'northeast', 'southeast', 'midwest', 
      'southwest', 'west coast', 'east coast', 'new england', 'pacific northwest'
    ];
    
    const lowerQuery = query.toLowerCase();
    return regionalKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Check if query is about proximity
   */
  private isProximityQuery(query: string): boolean {
    const proximityKeywords = ['near', 'around', 'close to', 'within', 'nearby', 'radius'];
    const lowerQuery = query.toLowerCase();
    return proximityKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * Determine spatial relationship from query
   */
  private determineSpatialRelation(query: string): 'within' | 'near' | 'contains' | 'intersects' | undefined {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('within') || lowerQuery.includes('inside')) return 'within';
    if (lowerQuery.includes('near') || lowerQuery.includes('around') || lowerQuery.includes('close')) return 'near';
    if (lowerQuery.includes('contains') || lowerQuery.includes('including')) return 'contains';
    if (lowerQuery.includes('overlap') || lowerQuery.includes('intersect')) return 'intersects';
    
    return undefined;
  }

  /**
   * Extract radius from query
   */
  private extractRadius(query: string): number | undefined {
    // Look for patterns like "within 5 miles", "10 mile radius"
    const radiusPatterns = [
      /within\s+(\d+)\s+miles?/i,
      /(\d+)\s+miles?\s+radius/i,
      /(\d+)\s*mi\b/i
    ];
    
    for (const pattern of radiusPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    
    return undefined;
  }

  /**
   * Remove duplicate entities
   */
  private deduplicateEntities(entities: GeographicEntity[]): GeographicEntity[] {
    const seen = new Set<string>();
    return entities.filter(entity => {
      const key = entity.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Expand entity to include child entities
   */
  private expandEntityHierarchy(entity: GeographicEntity): GeographicEntity[] {
    const expanded = [entity];
    
    if (entity.childEntities) {
      for (const childName of entity.childEntities) {
        const childEntity = this.geographicHierarchy.get(childName.toLowerCase());
        if (childEntity) {
          expanded.push(childEntity);
        }
      }
    }
    
    return expanded;
  }

  /**
   * Check if record matches any of the target entities
   */
  private recordMatchesEntity(record: any, entities: GeographicEntity[]): boolean {
    for (const entity of entities) {
      // Check ZIP code match
      const recordZip = this.extractZipCode(record);
      if (recordZip && entity.zipCodes?.includes(recordZip)) {
        return true;
      }
      
      // Check description match
      const description = this.extractDescription(record);
      const patterns = this.createDescriptionPatterns(entity);
      if (patterns.some(pattern => pattern.test(description))) {
        return true;
      }
      
      // Check all text fields
      const allText = this.extractAllTextFields(record);
      const searchTerms = [entity.name, ...entity.aliases];
      if (searchTerms.some(term => allText.toLowerCase().includes(term.toLowerCase()))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Remove duplicate records
   */
  private deduplicateRecords(records: any[]): any[] {
    const seen = new Set<string>();
    return records.filter(record => {
      const key = record.area_id || record.id || JSON.stringify(record);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Create regex patterns for description matching
   */
  private createDescriptionPatterns(entity: GeographicEntity): RegExp[] {
    const patterns: RegExp[] = [];
    
    // Main name pattern
    patterns.push(new RegExp(`\\b${this.escapeRegex(entity.name)}\\b`, 'i'));
    
    // Alias patterns
    entity.aliases.forEach(alias => {
      patterns.push(new RegExp(`\\b${this.escapeRegex(alias)}\\b`, 'i'));
    });
    
    // Description format patterns (like "(City)")
    patterns.push(new RegExp(`\\(${this.escapeRegex(entity.name)}\\)`, 'i'));
    entity.aliases.forEach(alias => {
      patterns.push(new RegExp(`\\(${this.escapeRegex(alias)}\\)`, 'i'));
    });
    
    return patterns;
  }

  /**
   * Extract description field from record
   */
  private extractDescription(record: any): string {
    for (const field of this.fieldPriorities.description) {
      if (record[field] && typeof record[field] === 'string') {
        return record[field];
      }
    }
    return '';
  }

  /**
   * Extract ZIP code from record
   */
  private extractZipCode(record: any): string | null {
    for (const field of this.fieldPriorities.zipCode) {
      if (record[field]) {
        const value = String(record[field]);
        // Match 5-digit ZIP codes
        const zipMatch = value.match(/\b\d{5}\b/);
        if (zipMatch) {
          return zipMatch[0];
        }
      }
    }
    return null;
  }

  /**
   * Extract all text fields from record
   */
  private extractAllTextFields(record: any): string {
    const textFields: string[] = [];
    
    for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') {
        textFields.push(value);
      } else if (typeof value === 'number') {
        textFields.push(String(value));
      }
    }
    
    return textFields.join(' ');
  }

  /**
   * Fuzzy match record against entity
   */
  private fuzzyMatchRecord(record: any, entity: GeographicEntity): boolean {
    const allText = this.extractAllTextFields(record).toLowerCase();
    const searchTerms = [entity.name, ...entity.aliases].map(term => term.toLowerCase());
    
    for (const term of searchTerms) {
      // Check for partial matches with edit distance
      const words = allText.split(/\s+/);
      for (const word of words) {
        if (word.length >= 3 && term.length >= 3) {
          if (this.editDistance(word, term) <= Math.min(2, Math.floor(term.length / 3))) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // === HELPER METHODS ===

  /**
   * Extract phrases from query (2-3 word combinations)
   */
  private extractPhrases(query: string): string[] {
    const words = query.toLowerCase().split(/\s+/);
    const phrases: string[] = [];
    
    // 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(`${words[i]} ${words[i + 1]}`);
    }
    
    // 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    
    return phrases;
  }

  /**
   * Calculate edit distance between two strings
   */
  private editDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));
    
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,    // deletion
            matrix[i][j - 1] + 1,    // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }
    
    return matrix[a.length][b.length];
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}