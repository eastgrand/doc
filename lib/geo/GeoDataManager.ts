/**
 * Geographic Data Manager - Florida Edition
 * 
 * Manages geographic data for Florida.
 * Optimized for the project's specific geographic scope.
 */

export interface GeographicDatabase {
  entities: Map<string, GeographicEntity>;
  zipCodeToCity: Map<string, string>;
  zipCodeToCounty: Map<string, string>;
  zipCodeToMetro: Map<string, string>;
  zipCodeToState: Map<string, string>;
  aliasMap: Map<string, string>;
  stateAbbreviations: Map<string, string>;
  regionalGroups: Map<string, string[]>;
}

import { GeographicEntity } from './GeoAwarenessEngine';

export class GeoDataManager {
  private static instance: GeoDataManager | null = null;
  private database: GeographicDatabase;

  private constructor() {
    this.database = {
      entities: new Map(),
      zipCodeToCity: new Map(),
      zipCodeToCounty: new Map(),
      zipCodeToMetro: new Map(),
      zipCodeToState: new Map(),
      aliasMap: new Map(),
      stateAbbreviations: new Map(),
      regionalGroups: new Map()
    };
    this.initializeDatabase();
  }

  public static getInstance(): GeoDataManager {
    if (!GeoDataManager.instance) {
      GeoDataManager.instance = new GeoDataManager();
    }
    return GeoDataManager.instance;
  }

  public getDatabase(): GeographicDatabase {
    return this.database;
  }

  private initializeDatabase(): void {
    console.log('[GeoDataManager] Initializing comprehensive Florida geographic database...');
    
    // Core geographic entities
    this.loadStates();
    this.loadFloridaCounties();
    this.loadFloridaCities();
    this.loadFloridaMetros();
    this.aggregateZipCodesForHigherLevels();
    
    console.log(`[GeoDataManager] Comprehensive Florida database initialized with ${this.database.entities.size} entities`);
  }

  private loadStates(): void {
    // Project covers Florida only
    const states = [
      { name: 'Florida', abbr: 'FL', aliases: ['FL', 'Sunshine State', 'Fla', 'Flordia'] }
    ];

    states.forEach(state => {
      const entity: GeographicEntity = {
        name: state.name,
        type: 'state',
        aliases: [state.abbr, ...state.aliases],
        confidence: 1.0
      };

      this.addEntity(entity);
      this.database.stateAbbreviations.set(state.abbr.toLowerCase(), state.name.toLowerCase());
    });
  }

  private loadFloridaCounties(): void {
    const flCounties = [
      {
        name: 'Miami-Dade County',
        aliases: ['Miami-Dade', 'Dade County', 'Dade', 'Miami Dade Co'],
        cities: ['Miami', 'Hialeah', 'Miami Beach', 'Coral Gables', 'Homestead', 'Aventura', 'Miami Gardens']
      },
      {
        name: 'Broward County',
        aliases: ['Broward', 'Broward Co'],
        cities: ['Fort Lauderdale', 'Hollywood', 'Pembroke Pines', 'Coral Springs', 'Pompano Beach', 'Davie', 'Plantation']
      },
      {
        name: 'Palm Beach County',
        aliases: ['Palm Beach', 'Palm Beach Co'],
        cities: ['West Palm Beach', 'Boca Raton', 'Boynton Beach', 'Delray Beach', 'Jupiter', 'Wellington']
      },
      {
        name: 'Hillsborough County',
        aliases: ['Hillsborough', 'Hillsborough Co'],
        cities: ['Tampa', 'Brandon', 'Riverview', 'Plant City']
      },
      {
        name: 'Pinellas County',
        aliases: ['Pinellas', 'Pinellas Co'],
        cities: ['St. Petersburg', 'Clearwater', 'Largo', 'Pinellas Park']
      },
      {
        name: 'Orange County',
        aliases: ['Orange', 'Orange Co'],
        cities: ['Orlando', 'Winter Park', 'Apopka', 'Ocoee']
      },
      {
        name: 'Duval County',
        aliases: ['Duval', 'Duval Co'],
        cities: ['Jacksonville'] // Jacksonville is consolidated with Duval County
      },
      {
        name: 'Alachua County',
        aliases: ['Alachua', 'Alachua Co'],
        cities: ['Gainesville', 'Alachua', 'Newberry', 'High Springs']
      },
      {
        name: 'Leon County',
        aliases: ['Leon', 'Leon Co'],
        cities: ['Tallahassee']
      },
      {
        name: 'Lee County',
        aliases: ['Lee', 'Lee Co'],
        cities: ['Cape Coral', 'Fort Myers', 'Bonita Springs']
      },
      {
        name: 'Collier County',
        aliases: ['Collier', 'Collier Co'],
        cities: ['Naples', 'Marco Island']
      },
      {
        name: 'St. Lucie County',
        aliases: ['St. Lucie', 'St Lucie', 'Saint Lucie'],
        cities: ['Port St. Lucie', 'Fort Pierce']
      }
    ];

    flCounties.forEach(county => {
      const entity: GeographicEntity = {
        name: county.name,
        type: 'county',
        aliases: county.aliases,
        parentEntity: 'florida',
        childEntities: county.cities.map(city => city.toLowerCase()),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Counties will get their ZIP codes aggregated from cities
    });
  }

  private loadFloridaCities(): void {
    const flCities = [
      {
        name: 'Miami',
        aliases: ['Magic City', 'MIA', 'The 305'],
        parentCounty: 'miami-dade county',
        // Miami city proper zip codes
        zipCodes: [
          '33101', '33102', '33109', '33111', '33112', '33114', '33116', '33119', '33122',
          '33124', '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132',
          '33133', '33134', '33135', '33136', '33137', '33138', '33139', '33140', '33141',
          '33142', '33143', '33144', '33145', '33146', '33147', '33149', '33150', '33151',
          '33152', '33153', '33154', '33155', '33156', '33157', '33158', '33160', '33161',
          '33162', '33163', '33164', '33165', '33166', '33167', '33168', '33169', '33170',
          '33172', '33173', '33174', '33175', '33176', '33177', '33178', '33179', '33180',
          '33181', '33182', '33183', '33184', '33185', '33186', '33187', '33188', '33189',
          '33190', '33193', '33194', '33195', '33196', '33197'
        ]
      },
      {
        name: 'Tampa',
        aliases: ['Cigar City', 'TPA', 'Tampa Bay', 'The Big Guava'],
        parentCounty: 'hillsborough county',
        // Tampa city proper zip codes
        zipCodes: ['33602', '33603', '33604', '33605', '33606', '33607', '33608', '33609',
                   '33610', '33611', '33612', '33613', '33614', '33615', '33616', '33617',
                   '33618', '33619', '33620', '33621', '33622', '33623', '33624', '33625',
                   '33626', '33629', '33630', '33631', '33634', '33635', '33637', '33647']
      },
      {
        name: 'Orlando',
        aliases: ['The City Beautiful', 'O-Town', 'MCO', 'Orlando Metro'],
        parentCounty: 'orange county',
        // Orlando city proper zip codes
        zipCodes: ['32801', '32802', '32803', '32804', '32805', '32806', '32807', '32808',
                   '32809', '32810', '32811', '32812', '32814', '32815', '32816', '32817',
                   '32818', '32819', '32820', '32821', '32822', '32824', '32825', '32826',
                   '32827', '32828', '32829', '32830', '32831', '32832', '32833', '32834',
                   '32835', '32836', '32837', '32839']
      },
      {
        name: 'Jacksonville',
        aliases: ['Jax', 'JAX', 'The River City', 'Bold City'],
        parentCounty: 'duval county',
        // Jacksonville city proper zip codes
        zipCodes: ['32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207',
                   '32208', '32209', '32210', '32211', '32212', '32214', '32216', '32217',
                   '32218', '32219', '32220', '32221', '32222', '32223', '32224', '32225',
                   '32226', '32227', '32228', '32229', '32231', '32232', '32233', '32234',
                   '32235', '32236', '32237', '32238', '32239', '32240', '32241', '32244',
                   '32245', '32246', '32247', '32250', '32254', '32255', '32256', '32257',
                   '32258', '32259', '32260', '32266', '32267', '32277']
      },
      {
        name: 'Gainesville',
        aliases: ['GNV', 'Gville', 'The Swamp', 'Hogtown'],
        parentCounty: 'alachua county',
        // Gainesville city proper zip codes
        zipCodes: ['32601', '32602', '32603', '32604', '32605', '32606', '32607', '32608',
                   '32609', '32610', '32611', '32612', '32613', '32614', '32627', '32635',
                   '32640', '32641', '32653']
      },
      {
        name: 'Fort Lauderdale',
        aliases: ['Fort Liquordale', 'FLL', 'Venice of America'],
        parentCounty: 'broward county',
        // Fort Lauderdale city proper zip codes
        zipCodes: ['33301', '33302', '33303', '33304', '33305', '33306', '33307', '33308',
                   '33309', '33310', '33311', '33312', '33313', '33314', '33315', '33316',
                   '33317', '33318', '33319', '33320', '33321', '33322', '33323', '33324',
                   '33325', '33326', '33327', '33328', '33329', '33330', '33331', '33332',
                   '33334', '33335', '33336', '33337', '33338', '33339', '33340', '33345',
                   '33346', '33348', '33349', '33351', '33355', '33359', '33388', '33394']
      },
      {
        name: 'St. Petersburg',
        aliases: ['St. Pete', 'The Sunshine City'],
        parentCounty: 'pinellas county',
        zipCodes: ['33701', '33702', '33703', '33704', '33705', '33706', '33707', '33708',
                   '33709', '33710', '33711', '33712', '33713', '33714', '33715', '33716']
      },
      {
        name: 'Hialeah',
        aliases: ['The City of Progress'],
        parentCounty: 'miami-dade county',
        zipCodes: ['33010', '33011', '33012', '33013', '33014', '33015', '33016', '33017', '33018']
      },
      {
        name: 'Tallahassee',
        aliases: ['Tally', 'TLH', 'Florida Capital'],
        parentCounty: 'leon county',
        zipCodes: ['32301', '32302', '32303', '32304', '32305', '32306', '32307', '32308',
                   '32309', '32310', '32311', '32312', '32313', '32314', '32315', '32316',
                   '32317', '32318', '32395', '32399']
      },
      {
        name: 'Port St. Lucie',
        aliases: ['PSL'],
        parentCounty: 'st. lucie county',
        zipCodes: ['34952', '34953', '34954', '34955', '34956', '34957', '34958', '34983',
                   '34984', '34985', '34986', '34987', '34988']
      },
      {
        name: 'Cape Coral',
        aliases: ['The Cape', 'Cape Coma'],
        parentCounty: 'lee county',
        zipCodes: ['33904', '33909', '33910', '33913', '33914', '33915', '33990', '33991', '33993']
      },
      {
        name: 'West Palm Beach',
        aliases: ['WPB', 'West Palm'],
        parentCounty: 'palm beach county',
        zipCodes: ['33401', '33402', '33403', '33404', '33405', '33406', '33407', '33408',
                   '33409', '33410', '33411', '33412', '33413', '33414', '33415', '33416',
                   '33417', '33418', '33419', '33420', '33421', '33422']
      },
      {
        name: 'Coral Springs',
        aliases: ['City in the Country'],
        parentCounty: 'broward county',
        zipCodes: ['33065', '33067', '33071', '33073', '33075', '33076', '33077']
      },
      {
        name: 'Pembroke Pines',
        aliases: ['PP'],
        parentCounty: 'broward county',
        zipCodes: ['33023', '33024', '33025', '33026', '33027', '33028', '33029', '33082', '33084']
      },
      {
        name: 'Hollywood',
        aliases: ['Hollywood FL'],
        parentCounty: 'broward county',
        zipCodes: ['33019', '33020', '33021', '33022', '33023', '33024', '33025', '33026',
                   '33027', '33028', '33029', '33081', '33083', '33084']
      }
    ];

    flCities.forEach(city => {
      const entity: GeographicEntity = {
        name: city.name,
        type: 'city',
        aliases: city.aliases,
        parentEntity: city.parentCounty || 'florida',
        zipCodes: city.zipCodes || [],
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Add ZIP code mappings
      entity.zipCodes?.forEach(zip => {
        this.database.zipCodeToCity.set(zip, city.name.toLowerCase());
      });
    });
  }

  private loadFloridaMetros(): void {
    const flMetros = [
      {
        name: 'Miami Metro',
        aliases: ['Greater Miami', 'South Florida', 'Miami-Fort Lauderdale-West Palm Beach'],
        childEntities: ['Miami-Dade County', 'Broward County', 'Palm Beach County']
      },
      {
        name: 'Tampa Bay Area',
        aliases: ['Tampa-St. Petersburg-Clearwater', 'Tampa Bay'],
        childEntities: ['Hillsborough County', 'Pinellas County']
      },
      {
        name: 'Central Florida',
        aliases: ['Orlando Metro', 'Greater Orlando'],
        childEntities: ['Orange County']
      },
      {
        name: 'Southwest Florida',
        aliases: ['Fort Myers-Naples', 'SWFL'],
        childEntities: ['Lee County', 'Collier County']
      }
    ];

    flMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'metro',
        aliases: metro.aliases,
        parentEntity: 'florida',
        childEntities: metro.childEntities?.map(child => child.toLowerCase()) || [],
        confidence: 1.0
      };

      this.addEntity(entity);
    });
  }

  private aggregateZipCodesForHigherLevels(): void {
    console.log('[GeoDataManager] Aggregating ZIP codes for counties, metros, and state...');

    // Aggregate ZIP codes for counties from their child cities
    for (const [entityName, entity] of this.database.entities) {
      if (entity.type === 'county' && entity.childEntities) {
        const countyZipCodes = new Set<string>();
        
        entity.childEntities.forEach(cityName => {
          const cityEntity = this.database.entities.get(cityName.toLowerCase());
          if (cityEntity && cityEntity.zipCodes) {
            cityEntity.zipCodes.forEach(zip => {
              countyZipCodes.add(zip);
              // Map ZIP to county
              this.database.zipCodeToCounty.set(zip, entity.name.toLowerCase());
            });
          }
        });

        // Store aggregated ZIP codes on the county entity
        entity.zipCodes = Array.from(countyZipCodes);
      }
    }

    // Aggregate ZIP codes for metros from their constituent counties/cities
    for (const [entityName, entity] of this.database.entities) {
      if (entity.type === 'metro' && entity.childEntities) {
        const metroZipCodes = new Set<string>();
        
        entity.childEntities.forEach(childName => {
          const childEntity = this.database.entities.get(childName.toLowerCase());
          if (childEntity && childEntity.zipCodes) {
            childEntity.zipCodes.forEach(zip => {
              metroZipCodes.add(zip);
              // Map ZIP to metro
              this.database.zipCodeToMetro.set(zip, entity.name.toLowerCase());
            });
          }
        });

        // Store aggregated ZIP codes on the metro entity
        entity.zipCodes = Array.from(metroZipCodes);
      }
    }

    // Map all ZIP codes to Florida state
    for (const [zip, city] of this.database.zipCodeToCity) {
      this.database.zipCodeToState.set(zip, 'florida');
    }

    console.log(`[GeoDataManager] ZIP code mappings created:`, {
      cities: this.database.zipCodeToCity.size,
      counties: this.database.zipCodeToCounty.size,
      metros: this.database.zipCodeToMetro.size,
      state: this.database.zipCodeToState.size
    });
  }

  private addEntity(entity: GeographicEntity): void {
    const key = entity.name.toLowerCase();
    this.database.entities.set(key, entity);
    
    // Add alias mappings
    entity.aliases?.forEach(alias => {
      this.database.aliasMap.set(alias.toLowerCase(), entity.name.toLowerCase());
    });
  }
}