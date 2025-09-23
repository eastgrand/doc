/**
 * Single Service Adapter for The Doors Documentary ArcGIS Feature Service
 * Handles the unified 106-layer service with entertainment and demographic data
 */

interface DoorsLayerMapping {
  // Classic Rock & Music Layers
  classicRock: {
    IL: number;
    IN: number;
    WI: number;
  };
  classicRockRadio: {
    IL: number;
    IN: number;
    WI: number;
  };
  rockRadio: {
    IL: number;
    IN: number;
    WI: number;
  };
  rockPerformance: {
    IL: number;
    IN: number;
    WI: number;
  };
  
  // Tapestry Segments - All 5 segments for complete analysis
  tapestryK1: {
    IL: number;
    IN: number;
    WI: number;
  };
  tapestryK2: {
    IL: number;
    IN: number;
    WI: number;
  };
  tapestryI1: {
    IL: number;
    IN: number;
    WI: number;
  };
  tapestryJ1: {
    IL: number;
    IN: number;
    WI: number;
  };
  tapestryL1: {
    IL?: number;  // May not be available for IL/IN
    IN?: number;
    WI: number;
  };
  
  // Generation Demographics
  babyBoomers: {
    IL: number;
    IN: number;
    WI: number;
  };
  generationX: {
    IL: number;
    IN: number;
    WI: number;
  };
  millennials: {
    IL: number;
    IN: number;
    WI: number;
  };
  
  // Entertainment Spending
  entertainmentSpending: {
    IL: number;
    IN: number;
    WI: number;
  };
  movieSpending: {
    IL: number;
    IN: number;
    WI: number;
  };
  concertSpending: {
    IL: number;
    IN: number;
    WI: number;
  };
  musicPurchaseSpending: {
    IL: number;
    IN: number;
    WI: number;
  };
  
  // Music Streaming
  spotify: {
    IL: number;
    IN: number;
    WI: number;
  };
  pandora: {
    IL: number;
    IN: number;
    WI: number;
  };
  appleMusic: {
    IL: number;
    IN: number;
    WI: number;
  };
  amazonMusic: {
    IL: number;
    IN: number;
    WI: number;
  };
  
  // Infrastructure
  theaters: {
    IL: number;
    IN: number;
    WI: number;
  };
  radioStations: number;
}

interface DoorsFieldMapping {
  hexagonId: string;
  zipCode: string;
  county: string;
  state: string;
  classicRockListeners?: string;
  classicRockPercentage?: string;
  tapestryK1Population?: string;
  tapestryK1Percentage?: string;
  babyBoomerPop?: string;
  genXPop?: string;
  entertainmentSpending?: string;
  thematicValue: string;
}

interface HexagonFeature {
  hexagonId: string;
  zipCode: string;
  county: string;
  state: string;
  geometry: any;
  attributes: Record<string, any>;
  scores?: {
    classicRockAffinity?: number;
    entertainmentSpending?: number;
    generationScore?: number;
    tapestryScore?: number;
    compositeScore?: number;
  };
}

interface QueryResult {
  state: 'IL' | 'IN' | 'WI';
  features: HexagonFeature[];
  layerType: string;
  totalCount: number;
}

export class DoorsDocumentarySingleServiceAdapter {
  private baseUrl: string;
  private layerMapping: DoorsLayerMapping;
  private fieldMapping: DoorsFieldMapping;
  private Query: any; // Will be dynamically loaded
  private FeatureLayer: any; // Will be dynamically loaded
  
  constructor() {
    this.baseUrl = 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54__b1cab1ae067f4359/FeatureServer';
    
    // Layer indices from the updated service
    this.layerMapping = {
      classicRock: {
        IL: 112, // IL Listened to Classic Rock Music 6 Mo
        IN: 111, // IN Listened to Classic Rock Music 6 Mo
        WI: 110  // WI Listened to Classic Rock Music 6 Mo
      },
      classicRockRadio: {
        IL: 113, // IL Listen to Classic Rock Radio Format
        IN: 114, // IN Listen to Classic Rock Radio Format
        WI: 115  // WI Listen to Classic Rock Radio Format
      },
      rockRadio: {
        IL: 106, // IL Listen to Rock Radio Format
        IN: 105, // IN Listen to Rock Radio Format
        WI: 104  // WI Listen to Rock Radio Format
      },
      rockPerformance: {
        IL: 107, // IL Attended Rock Music Performance 12 Mo
        IN: 108, // IN Attended Rock Music Performance 12 Mo
        WI: 109  // WI Attended Rock Music Performance 12 Mo
      },
      tapestryK1: {
        IL: 16,  // IL Total Pop in Tapestry Seg K1
        IN: 15,  // IN Total Pop in Tapestry Seg K1
        WI: 4    // WI Total Pop in Tapestry Seg K1
      },
      tapestryK2: {
        IL: 13,  // IL Total Pop in Tapestry Seg K2
        IN: 14,  // IN Total Pop in Tapestry Seg K2
        WI: 11   // WI Total Pop in Tapestry Seg K2
      },
      tapestryI1: {
        IL: 9,   // IL Total Pop in Tapestry Seg I1
        IN: 12,  // IN Total Pop in Tapestry Seg I1
        WI: 10   // WI Total Pop in Tapestry Seg I1
      },
      tapestryJ1: {
        IL: 8,   // IL Total Pop in Tapestry Seg J1
        IN: 6,   // IN Total Pop in Tapestry Seg J1
        WI: 7    // WI Total Pop in Tapestry Seg J1
      },
      tapestryL1: {
        WI: 5    // WI Total Pop in Tapestry Seg L1 (only WI available)
      },
      babyBoomers: {
        IL: 61,  // IL Baby Boomer Pop
        IN: 60,  // IN Baby Boomer Pop
        WI: 59   // WI Baby Boomer Pop
      },
      generationX: {
        IL: 56,  // IL Generation X Pop
        IN: 57,  // IN Generation X Pop
        WI: 58   // WI Generation X Pop
      },
      millennials: {
        IL: 55,  // IL Millennial Pop
        IN: 54,  // IN Millennial Pop
        WI: 53   // WI Millennial Pop
      },
      entertainmentSpending: {
        IL: 68,  // IL Spending on Entertainment Rec (Avg)
        IN: 69,  // IN Spending on Entertainment Rec (Avg)
        WI: 70   // WI Spending on Entertainment Rec (Avg)
      },
      movieSpending: {
        IL: 23,  // IL Spending on Tickets to Movies (Avg)
        IN: 24,  // IN Spending on Tickets to Movies (Avg)
        WI: 25   // WI Spending on Tickets to Movies (Avg)
      },
      concertSpending: {
        IL: 67,  // IL Spending on Tickets to Theatre Operas Concerts
        IN: 66,  // IN Spending on Tickets to Theatre Operas Concerts
        WI: 65   // WI Spending on Tickets to Theatre Operas Concerts
      },
      musicPurchaseSpending: {
        IL: 59,  // IL Spending on Records CDs Audio Tapes (Avg)
        IN: 60,  // IN Spending on Records CDs Audio Tapes (Avg)
        WI: 61   // WI Spending on Records CDs Audio Tapes (Avg)
      },
      spotify: {
        IL: 79,  // IL Listened to Spotify Audio Svc 30 Days
        IN: 78,  // IN Listened to Spotify Audio Svc 30 Days
        WI: 77   // WI Listened to Spotify Audio Svc 30 Days
      },
      pandora: {
        IL: 74,  // IL Listened to Pandora Audio Svc 30 Days
        IN: 75,  // IN Listened to Pandora Audio Svc 30 Days
        WI: 76   // WI Listened to Pandora Audio Svc 30 Days
      },
      appleMusic: {
        IL: 65,  // IL Listened to Apple Music Audio Svc 30
        IN: 66,  // IN Listened to Apple Music Audio Svc 30
        WI: 67   // WI Listened to Apple Music Audio Svc 30
      },
      amazonMusic: {
        IL: 73,  // IL Listened to Amazon Music Audio Svc 30
        IN: 72,  // IN Listened to Amazon Music Audio Svc 30
        WI: 71   // WI Listened to Amazon Music Audio Svc 30
      },
      theaters: {
        IL: 118, // IL Theatres-Movie, Drive-In Motion Picture Theaters
        IN: 119, // IN Theatres-Movie, Drive-In Motion Picture Theaters
        WI: 117  // WI Theatres-Movie, Drive-In Motion Picture Theaters
      },
      radioStations: 116 // Radio stations - 3 states
    };
    
    // Field name mapping based on service inspection
    this.fieldMapping = {
      hexagonId: 'id',              // Cell ID (H3 hexagon)
      zipCode: 'admin4_name',       // ZIP Code
      county: 'admin3_name',        // County
      state: 'admin2_name',         // State
      thematicValue: 'thematic_value'
    };
  }
  
  async initialize(): Promise<void> {
    console.log('[DoorsAdapter] Initializing single service adapter...');
    
    // Dynamic imports for ArcGIS modules
    const [QueryModule, FeatureLayerModule] = await Promise.all([
      import('@arcgis/core/rest/support/Query'),
      import('@arcgis/core/layers/FeatureLayer')
    ]);
    
    this.Query = QueryModule.default;
    this.FeatureLayer = FeatureLayerModule.default;
    
    console.log('[DoorsAdapter] Service adapter initialized successfully');
  }
  
  /**
   * Query all 5 Tapestry segments across all three states
   */
  async queryAllTapestrySegments(
    geometry?: any,
    states: ('IL' | 'IN' | 'WI')[] = ['IL', 'IN', 'WI']
  ): Promise<Map<string, QueryResult[]>> {
    console.log('[DoorsAdapter] Querying all 5 Tapestry segments...');
    
    const segmentMap = new Map<string, QueryResult[]>();
    
    // Query all 5 segments in parallel
    const segmentTypes = ['tapestryK1', 'tapestryK2', 'tapestryI1', 'tapestryJ1', 'tapestryL1'];
    
    for (const segmentType of segmentTypes) {
      const layerGroup = (this.layerMapping as any)[segmentType];
      if (layerGroup) {
        const queries = states.map(state => {
          const layerId = layerGroup[state];
          if (layerId !== undefined) {
            return this.queryLayer(layerId, segmentType, state, geometry);
          }
          return null;
        }).filter(Boolean) as Promise<QueryResult>[];
        
        const results = await Promise.all(queries);
        segmentMap.set(segmentType, results);
      }
    }
    
    return segmentMap;
  }

  /**
   * Query classic rock audience data across all three states
   */
  async queryClassicRockAudience(
    geometry?: any,
    states: ('IL' | 'IN' | 'WI')[] = ['IL', 'IN', 'WI']
  ): Promise<QueryResult[]> {
    console.log('[DoorsAdapter] Querying classic rock audience data...');
    
    const queries = states.map(state => 
      this.queryLayer(this.layerMapping.classicRock[state], 'classicRock', state, geometry)
    );
    
    return Promise.all(queries);
  }
  
  /**
   * Query all entertainment metrics for comprehensive scoring
   */
  async queryEntertainmentMetrics(
    geometry?: any,
    states: ('IL' | 'IN' | 'WI')[] = ['IL', 'IN', 'WI']
  ): Promise<Map<string, QueryResult[]>> {
    console.log('[DoorsAdapter] Querying comprehensive entertainment metrics...');
    
    const metricsMap = new Map<string, QueryResult[]>();
    
    // Query multiple metric types in parallel
    const metricTypes = [
      'classicRock',
      'classicRockRadio',
      'entertainmentSpending',
      'babyBoomers',
      'generationX',
      'tapestryK1',
      'tapestryK2',
      'tapestryI1',
      'tapestryJ1',
      'tapestryL1'
    ];
    
    for (const metricType of metricTypes) {
      const layerGroup = (this.layerMapping as any)[metricType];
      if (layerGroup) {
        const queries = states.map(state => {
          const layerId = layerGroup[state];
          if (layerId !== undefined) {
            return this.queryLayer(layerId, metricType, state, geometry);
          }
          return null;
        }).filter(Boolean) as Promise<QueryResult>[];
        
        const results = await Promise.all(queries);
        metricsMap.set(metricType, results);
      }
    }
    
    return metricsMap;
  }
  
  /**
   * Query theater infrastructure locations
   */
  async queryTheaterInfrastructure(
    geometry?: any,
    states: ('IL' | 'IN' | 'WI')[] = ['IL', 'IN', 'WI']
  ): Promise<QueryResult[]> {
    console.log('[DoorsAdapter] Querying theater infrastructure...');
    
    const queries = states.map(state =>
      this.queryLayer(this.layerMapping.theaters[state], 'theaters', state, geometry)
    );
    
    return Promise.all(queries);
  }
  
  /**
   * Query radio station coverage (all states combined)
   */
  async queryRadioStations(geometry?: any): Promise<QueryResult> {
    console.log('[DoorsAdapter] Querying radio station coverage...');
    
    return this.queryLayer(
      this.layerMapping.radioStations,
      'radioStations',
      'ALL',
      geometry
    );
  }
  
  /**
   * Core layer query method
   */
  private async queryLayer(
    layerId: number,
    layerType: string,
    state: string,
    geometry?: any
  ): Promise<QueryResult> {
    const layerUrl = `${this.baseUrl}/${layerId}`;
    
    const layer = new this.FeatureLayer({
      url: layerUrl
    });
    
    const query = new this.Query({
      where: '1=1',
      outFields: ['*'],
      returnGeometry: true,
      geometry: geometry,
      spatialRelationship: geometry ? 'intersects' : undefined,
      outSpatialReference: { wkid: 4326 }
    });
    
    try {
      const result = await layer.queryFeatures(query);
      
      const features: HexagonFeature[] = result.features.map((feature: any) => ({
        hexagonId: feature.attributes[this.fieldMapping.hexagonId],
        zipCode: feature.attributes[this.fieldMapping.zipCode],
        county: feature.attributes[this.fieldMapping.county],
        state: feature.attributes[this.fieldMapping.state] || state,
        geometry: feature.geometry,
        attributes: feature.attributes
      }));
      
      console.log(`[DoorsAdapter] Layer ${layerId} (${layerType}/${state}): ${features.length} features`);
      
      return {
        state: state as 'IL' | 'IN' | 'WI',
        features,
        layerType,
        totalCount: features.length
      };
    } catch (error) {
      console.error(`[DoorsAdapter] Error querying layer ${layerId}:`, error);
      return {
        state: state as 'IL' | 'IN' | 'WI',
        features: [],
        layerType,
        totalCount: 0
      };
    }
  }
  
  /**
   * Calculate composite entertainment score for hexagons
   */
  calculateEntertainmentScore(hexagon: HexagonFeature, metrics: Map<string, any>): number {
    let score = 0;
    let weightSum = 0;
    
    // Classic Rock Affinity (40% weight)
    if (metrics.has('classicRock')) {
      const classicRockValue = hexagon.attributes['MP22055A_B_P'] || 
                               hexagon.attributes['thematic_value'] || 0;
      score += classicRockValue * 0.4;
      weightSum += 0.4;
    }
    
    // Generation Score (30% weight) - Baby Boomers & Gen X
    if (metrics.has('babyBoomers') || metrics.has('generationX')) {
      const boomerPop = hexagon.attributes['babyBoomerPop'] || 0;
      const genXPop = hexagon.attributes['genXPop'] || 0;
      const generationScore = (boomerPop * 1.2 + genXPop) / 2; // Slight bias to boomers
      score += generationScore * 0.3;
      weightSum += 0.3;
    }
    
    // Entertainment Spending (20% weight)
    if (metrics.has('entertainmentSpending')) {
      const spendingValue = hexagon.attributes['entertainmentSpending'] || 0;
      score += spendingValue * 0.2;
      weightSum += 0.2;
    }
    
    // Tapestry Segment (10% weight)
    if (metrics.has('tapestryK1')) {
      const tapestryValue = hexagon.attributes['TPOPK1_P'] || 0;
      score += tapestryValue * 0.1;
      weightSum += 0.1;
    }
    
    // Normalize by actual weight sum
    return weightSum > 0 ? score / weightSum : 0;
  }
  
  /**
   * Get service configuration for reporting
   */
  getServiceConfiguration(): {
    url: string;
    totalLayers: number;
    architecture: string;
    primaryLayers: number[];
    tapestrySegments: string[];
    states: string[];
  } {
    return {
      url: this.baseUrl,
      totalLayers: 120,
      architecture: 'Single Unified Service with Complete Tapestry Data',
      primaryLayers: [110, 111, 112, 113, 114, 115], // Classic rock layers
      tapestrySegments: ['K1', 'K2', 'I1', 'J1', 'L1'],
      states: ['IL', 'IN', 'WI']
    };
  }
  
  /**
   * Get layer metadata for a specific layer
   */
  async getLayerMetadata(layerId: number): Promise<any> {
    const url = `${this.baseUrl}/${layerId}?f=json`;
    
    try {
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error(`[DoorsAdapter] Error fetching layer metadata:`, error);
      return null;
    }
  }
  
  /**
   * Check for additional Tapestry segments (K2, I1, J1, L1)
   */
  async checkForAdditionalTapestrySegments(): Promise<{
    available: string[];
    missing: string[];
  }> {
    console.log('[DoorsAdapter] Checking for additional Tapestry segments...');
    
    const targetSegments = ['K1', 'K2', 'I1', 'J1', 'L1'];
    const available: string[] = ['K1']; // We know K1 exists
    const missing: string[] = [];
    
    // Check all layers for segment indicators
    const serviceMetadata = await this.getLayerMetadata(0);
    
    // This would need to be expanded to check all layers
    // For now, we know only K1 is visible in the layer names
    
    for (const segment of targetSegments) {
      if (!available.includes(segment)) {
        missing.push(segment);
      }
    }
    
    return { available, missing };
  }
}

// Export singleton instance
export const doorsServiceAdapter = new DoorsDocumentarySingleServiceAdapter();