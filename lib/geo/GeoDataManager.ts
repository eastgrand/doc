/**
 * Geographic Data Manager - Tri-State Area Edition (NY, NJ, PA)
 * 
 * Manages geographic data for New York, New Jersey, and Pennsylvania only.
 * Optimized for the project's specific geographic scope.
 */

export interface GeographicDatabase {
  entities: Map<string, GeographicEntity>;
  zipCodeToCity: Map<string, string>;
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
    console.log('[GeoDataManager] Initializing comprehensive tri-state geographic database...');
    
    // Core geographic entities
    this.loadStates();
    this.loadNewYorkMetros();
    this.loadNewJerseyMetros();
    this.loadPennsylvaniaMetros();
    this.loadNYBoroughsAndNeighborhoods();
    
    // Points of Interest
    this.loadAirports();
    this.loadUniversities();
    this.loadHospitals();
    this.loadSportsVenues();
    this.loadLandmarks();
    this.loadTransportation();
    this.loadShoppingCenters();
    this.loadParks();
    this.loadBusinessDistricts();
    this.loadInfrastructure();
    this.loadMuseumsAndTheaters();
    this.loadGovernmentBuildings();
    
    // Regional data
    this.loadCommonAliases();
    this.loadRegionalGroups();
    this.loadZipCodePrefixes();
    
    console.log(`[GeoDataManager] Comprehensive database initialized with ${this.database.entities.size} entities`);
  }

  private loadStates(): void {
    // Project covers NY, NJ, PA only
    const states = [
      { name: 'New York', abbr: 'NY', aliases: ['NY', 'NY State', 'Empire State', 'New York State'] },
      { name: 'New Jersey', abbr: 'NJ', aliases: ['NJ', 'Jersey', 'Garden State'] },
      { name: 'Pennsylvania', abbr: 'PA', aliases: ['PA', 'Penn', 'Keystone State', 'Commonwealth of Pennsylvania'] }
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

  private loadNewYorkMetros(): void {
    const nyMetros = [
      {
        name: 'New York City',
        aliases: ['NYC', 'New York', 'NY', 'Big Apple', 'New York Metro'],
        zipPrefixes: ['100', '101', '102', '103', '104', '105', '110', '111', '112', '113', '114', '116']
      },
      {
        name: 'Buffalo',
        aliases: ['Queen City', 'City of Good Neighbors', 'BUF'],
        zipPrefixes: ['142']
      },
      {
        name: 'Rochester',
        aliases: ['Flower City', 'ROC'],
        zipPrefixes: ['146']
      },
      {
        name: 'Yonkers',
        aliases: ['City of Hills'],
        zipPrefixes: ['107']
      },
      {
        name: 'Syracuse',
        aliases: ['Salt City', 'SYR'],
        zipPrefixes: ['132']
      },
      {
        name: 'Albany',
        aliases: ['Capital City', 'ALB'],
        zipPrefixes: ['122']
      },
      {
        name: 'New Rochelle',
        aliases: ['Home Town'],
        zipPrefixes: ['108']
      },
      {
        name: 'Mount Vernon',
        aliases: ['City of Homes'],
        zipPrefixes: ['105']
      },
      {
        name: 'Schenectady',
        aliases: ['Electric City'],
        zipPrefixes: ['123']
      },
      {
        name: 'Utica',
        aliases: ['Handshake City'],
        zipPrefixes: ['135']
      },
      {
        name: 'White Plains',
        aliases: ['WP'],
        zipPrefixes: ['106']
      },
      {
        name: 'Troy',
        aliases: ['Collar City'],
        zipPrefixes: ['121']
      },
      {
        name: 'Niagara Falls',
        aliases: ['Honeymoon Capital'],
        zipPrefixes: ['143']
      },
      {
        name: 'Binghamton',
        aliases: ['Parlor City'],
        zipPrefixes: ['139']
      },
      {
        name: 'Long Beach',
        aliases: ['City by the Sea'],
        zipPrefixes: ['115']
      }
    ];

    nyMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'city',
        aliases: metro.aliases,
        parentEntity: 'new york',
        zipCodes: this.generateZipCodesFromPrefixes(metro.zipPrefixes),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Add ZIP code mappings
      entity.zipCodes?.forEach(zip => {
        this.database.zipCodeToCity.set(zip, metro.name.toLowerCase());
      });
    });
  }

  private loadNewJerseyMetros(): void {
    const njMetros = [
      {
        name: 'Newark',
        aliases: ['Brick City', 'EWR'],
        zipPrefixes: ['071']
      },
      {
        name: 'Jersey City',
        aliases: ['JC', 'J.C.'],
        zipPrefixes: ['073']
      },
      {
        name: 'Paterson',
        aliases: ['Silk City'],
        zipPrefixes: ['075']
      },
      {
        name: 'Elizabeth',
        aliases: ['E-Town'],
        zipPrefixes: ['072']
      },
      {
        name: 'Edison',
        aliases: ['Menlo Park'],
        zipPrefixes: ['088']
      },
      {
        name: 'Woodbridge',
        aliases: ['Township of Woodbridge'],
        zipPrefixes: ['078']
      },
      {
        name: 'Lakewood',
        aliases: ['Township of Lakewood'],
        zipPrefixes: ['087']
      },
      {
        name: 'Toms River',
        aliases: ['TR', 'Dover Township'],
        zipPrefixes: ['087']
      },
      {
        name: 'Hamilton',
        aliases: ['Hamilton Township'],
        zipPrefixes: ['086']
      },
      {
        name: 'Trenton',
        aliases: ['Capital City'],
        zipPrefixes: ['086']
      },
      {
        name: 'Clifton',
        aliases: ['City of Clifton'],
        zipPrefixes: ['070']
      },
      {
        name: 'Camden',
        aliases: ['City of Camden'],
        zipPrefixes: ['081']
      },
      {
        name: 'Passaic',
        aliases: ['City of Passaic'],
        zipPrefixes: ['070']
      },
      {
        name: 'Union City',
        aliases: ['Embroidery Capital'],
        zipPrefixes: ['070']
      },
      {
        name: 'Bayonne',
        aliases: ['Peninsula City'],
        zipPrefixes: ['070']
      },
      {
        name: 'East Orange',
        aliases: ['EO'],
        zipPrefixes: ['070']
      },
      {
        name: 'Vineland',
        aliases: ['Cumberland County'],
        zipPrefixes: ['083']
      },
      {
        name: 'New Brunswick',
        aliases: ['Hub City', 'Healthcare City'],
        zipPrefixes: ['089']
      },
      {
        name: 'Hoboken',
        aliases: ['Mile Square City'],
        zipPrefixes: ['070']
      },
      {
        name: 'West New York',
        aliases: ['WNY'],
        zipPrefixes: ['070']
      },
      {
        name: 'Perth Amboy',
        aliases: ['City by the Bay'],
        zipPrefixes: ['088']
      },
      {
        name: 'Plainfield',
        aliases: ['Queen City'],
        zipPrefixes: ['070']
      },
      {
        name: 'Sayreville',
        aliases: ['Borough of Sayreville'],
        zipPrefixes: ['088']
      },
      {
        name: 'Hackensack',
        aliases: ['HK'],
        zipPrefixes: ['076']
      },
      {
        name: 'Kearny',
        aliases: ['Soccer Town USA'],
        zipPrefixes: ['070']
      },
      {
        name: 'Linden',
        aliases: ['City of Linden'],
        zipPrefixes: ['070']
      },
      {
        name: 'Atlantic City',
        aliases: ['AC', 'America\'s Playground'],
        zipPrefixes: ['084']
      }
    ];

    njMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'city',
        aliases: metro.aliases,
        parentEntity: 'new jersey',
        zipCodes: this.generateZipCodesFromPrefixes(metro.zipPrefixes),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Add ZIP code mappings
      entity.zipCodes?.forEach(zip => {
        this.database.zipCodeToCity.set(zip, metro.name.toLowerCase());
      });
    });
  }

  private loadPennsylvaniaMetros(): void {
    const paMetros = [
      {
        name: 'Philadelphia',
        aliases: ['Philly', 'City of Brotherly Love', 'Phila', 'PHL'],
        zipPrefixes: ['190', '191', '192', '193', '194']
      },
      {
        name: 'Pittsburgh',
        aliases: ['Steel City', 'PIT', 'Iron City', 'City of Bridges'],
        zipPrefixes: ['152', '153', '154']
      },
      {
        name: 'Allentown',
        aliases: ['A-Town', 'ABE'],
        zipPrefixes: ['181']
      },
      {
        name: 'Erie',
        aliases: ['Gem City', 'ERI'],
        zipPrefixes: ['165']
      },
      {
        name: 'Reading',
        aliases: ['Pretzel City', 'RDG'],
        zipPrefixes: ['195', '196']
      },
      {
        name: 'Scranton',
        aliases: ['Electric City', 'AVP'],
        zipPrefixes: ['185']
      },
      {
        name: 'Bethlehem',
        aliases: ['Christmas City', 'Steel City'],
        zipPrefixes: ['180']
      },
      {
        name: 'Lancaster',
        aliases: ['Red Rose City', 'LNS'],
        zipPrefixes: ['175', '176']
      },
      {
        name: 'Harrisburg',
        aliases: ['Capital City', 'MDT'],
        zipPrefixes: ['171']
      },
      {
        name: 'York',
        aliases: ['White Rose City'],
        zipPrefixes: ['173', '174']
      },
      {
        name: 'Wilkes-Barre',
        aliases: ['Diamond City', 'WB'],
        zipPrefixes: ['187']
      },
      {
        name: 'Chester',
        aliases: ['City of Chester'],
        zipPrefixes: ['190']
      },
      {
        name: 'Easton',
        aliases: ['Forks of the Delaware'],
        zipPrefixes: ['180']
      },
      {
        name: 'Lebanon',
        aliases: ['Lebanon County'],
        zipPrefixes: ['170']
      },
      {
        name: 'Hazleton',
        aliases: ['Mountain City'],
        zipPrefixes: ['182']
      },
      {
        name: 'New Castle',
        aliases: ['Fireworks Capital'],
        zipPrefixes: ['161']
      },
      {
        name: 'Johnstown',
        aliases: ['Flood City'],
        zipPrefixes: ['159']
      },
      {
        name: 'McKeesport',
        aliases: ['Tube City'],
        zipPrefixes: ['151']
      },
      {
        name: 'Williamsport',
        aliases: ['Lumber Capital'],
        zipPrefixes: ['177']
      },
      {
        name: 'State College',
        aliases: ['Happy Valley', 'PSU'],
        zipPrefixes: ['168']
      }
    ];

    paMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'city',
        aliases: metro.aliases,
        parentEntity: 'pennsylvania',
        zipCodes: this.generateZipCodesFromPrefixes(metro.zipPrefixes),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Add ZIP code mappings
      entity.zipCodes?.forEach(zip => {
        this.database.zipCodeToCity.set(zip, metro.name.toLowerCase());
      });
    });
  }

  private loadNYBoroughsAndNeighborhoods(): void {
    // NYC Boroughs
    const boroughs = [
      {
        name: 'Manhattan',
        aliases: ['New York County', 'The City'],
        zipPrefixes: ['100', '101', '102', '103', '104']
      },
      {
        name: 'Brooklyn',
        aliases: ['Kings County', 'BK'],
        zipPrefixes: ['112']
      },
      {
        name: 'Queens',
        aliases: ['Queens County', 'QNS'],
        zipPrefixes: ['110', '111', '113', '114', '116']
      },
      {
        name: 'Bronx',
        aliases: ['Bronx County', 'BX', 'The Bronx'],
        zipPrefixes: ['104', '105']
      },
      {
        name: 'Staten Island',
        aliases: ['Richmond County', 'SI'],
        zipPrefixes: ['103']
      }
    ];

    boroughs.forEach(borough => {
      const entity: GeographicEntity = {
        name: borough.name,
        type: 'borough',
        aliases: borough.aliases,
        parentEntity: 'new york city',
        zipCodes: this.generateZipCodesFromPrefixes(borough.zipPrefixes),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Add ZIP code mappings
      entity.zipCodes?.forEach(zip => {
        this.database.zipCodeToCity.set(zip, borough.name.toLowerCase());
      });
    });

    // Major NYC Neighborhoods
    const neighborhoods = [
      // Manhattan
      { name: 'Midtown', parent: 'manhattan', aliases: ['Midtown Manhattan'] },
      { name: 'Upper East Side', parent: 'manhattan', aliases: ['UES'] },
      { name: 'Upper West Side', parent: 'manhattan', aliases: ['UWS'] },
      { name: 'Lower East Side', parent: 'manhattan', aliases: ['LES'] },
      { name: 'Greenwich Village', parent: 'manhattan', aliases: ['The Village', 'West Village'] },
      { name: 'SoHo', parent: 'manhattan', aliases: ['South of Houston'] },
      { name: 'TriBeCa', parent: 'manhattan', aliases: ['Triangle Below Canal'] },
      { name: 'Chelsea', parent: 'manhattan', aliases: ['Chelsea Manhattan'] },
      { name: 'Harlem', parent: 'manhattan', aliases: ['Central Harlem'] },
      { name: 'Financial District', parent: 'manhattan', aliases: ['FiDi', 'Wall Street'] },
      
      // Brooklyn
      { name: 'Williamsburg', parent: 'brooklyn', aliases: ['Billyburg'] },
      { name: 'Park Slope', parent: 'brooklyn', aliases: ['The Slope'] },
      { name: 'Brooklyn Heights', parent: 'brooklyn', aliases: ['The Heights'] },
      { name: 'DUMBO', parent: 'brooklyn', aliases: ['Down Under the Manhattan Bridge Overpass'] },
      { name: 'Bushwick', parent: 'brooklyn', aliases: ['East Williamsburg'] },
      { name: 'Bed-Stuy', parent: 'brooklyn', aliases: ['Bedford-Stuyvesant'] },
      
      // Queens
      { name: 'Astoria', parent: 'queens', aliases: ['Astoria Queens'] },
      { name: 'Long Island City', parent: 'queens', aliases: ['LIC'] },
      { name: 'Flushing', parent: 'queens', aliases: ['Downtown Flushing'] },
      { name: 'Jamaica', parent: 'queens', aliases: ['Jamaica Queens'] },
      { name: 'Forest Hills', parent: 'queens', aliases: ['Forest Hills Queens'] },
      
      // Bronx
      { name: 'Riverdale', parent: 'bronx', aliases: ['Riverdale Bronx'] },
      { name: 'Fordham', parent: 'bronx', aliases: ['Fordham Bronx'] },
      { name: 'Pelham Bay', parent: 'bronx', aliases: ['Pelham Bay Bronx'] },
      
      // Staten Island
      { name: 'St. George', parent: 'staten island', aliases: ['Downtown Staten Island'] },
      { name: 'Tottenville', parent: 'staten island', aliases: ['Tottenville SI'] }
    ];

    neighborhoods.forEach(neighborhood => {
      const entity: GeographicEntity = {
        name: neighborhood.name,
        type: 'neighborhood',
        aliases: neighborhood.aliases,
        parentEntity: neighborhood.parent,
        confidence: 1.0
      };

      this.addEntity(entity);
    });
  }

  private loadCommonAliases(): void {
    const aliases = [
      // Tri-state specific aliases
      ['nyc', 'new york city'],
      ['ny', 'new york'],
      ['philly', 'philadelphia'],
      ['phl', 'philadelphia'],
      ['pit', 'pittsburgh'],
      ['pitt', 'pittsburgh'],
      ['jersey', 'new jersey'],
      ['ac', 'atlantic city'],
      ['alb', 'albany'],
      ['buf', 'buffalo'],
      ['roc', 'rochester'],
      ['syr', 'syracuse'],
      
      // Regional terms
      ['tri-state', 'tri-state area'],
      ['tristate', 'tri-state area'],
      ['metro ny', 'new york city'],
      ['metro nyc', 'new york city'],
      ['greater philadelphia', 'philadelphia'],
      ['greater philly', 'philadelphia'],
      ['south jersey', 'southern new jersey'],
      ['north jersey', 'northern new jersey'],
      ['central jersey', 'central new jersey'],
      ['upstate', 'upstate new york'],
      ['western ny', 'western new york'],
      ['eastern pa', 'eastern pennsylvania'],
      ['western pa', 'western pennsylvania']
    ];

    aliases.forEach(([alias, canonical]) => {
      this.database.aliasMap.set(alias, canonical);
    });
  }

  private loadRegionalGroups(): void {
    const regions = [
      {
        name: 'tri-state area',
        cities: ['new york city', 'newark', 'jersey city', 'philadelphia', 'yonkers', 
                 'paterson', 'elizabeth', 'new rochelle', 'mount vernon', 'white plains']
      },
      {
        name: 'new york metro',
        cities: ['manhattan', 'brooklyn', 'queens', 'bronx', 'staten island',
                 'yonkers', 'new rochelle', 'mount vernon', 'white plains']
      },
      {
        name: 'northern new jersey',
        cities: ['newark', 'jersey city', 'paterson', 'elizabeth', 'edison',
                 'woodbridge', 'clifton', 'passaic', 'union city', 'bayonne']
      },
      {
        name: 'southern new jersey',
        cities: ['atlantic city', 'vineland', 'camden', 'toms river']
      },
      {
        name: 'central new jersey',
        cities: ['trenton', 'new brunswick', 'princeton', 'edison', 'woodbridge']
      },
      {
        name: 'eastern pennsylvania',
        cities: ['philadelphia', 'allentown', 'reading', 'bethlehem', 'lancaster',
                 'scranton', 'wilkes-barre', 'easton']
      },
      {
        name: 'western pennsylvania',
        cities: ['pittsburgh', 'erie', 'johnstown', 'new castle', 'mckeesport']
      },
      {
        name: 'upstate new york',
        cities: ['buffalo', 'rochester', 'syracuse', 'albany', 'utica',
                 'schenectady', 'troy', 'binghamton', 'niagara falls']
      },
      {
        name: 'philadelphia metro',
        cities: ['philadelphia', 'camden', 'chester', 'trenton']
      },
      {
        name: 'lehigh valley',
        cities: ['allentown', 'bethlehem', 'easton']
      }
    ];

    regions.forEach(region => {
      this.database.regionalGroups.set(region.name, region.cities);
    });
  }

  private loadZipCodePrefixes(): void {
    // Tri-state ZIP code prefix patterns
    const prefixMappings = [
      // New York - NYC
      ['100', 'manhattan'], ['101', 'manhattan'], ['102', 'manhattan'],
      ['103', 'staten island'], ['104', 'bronx'], ['105', 'bronx'],
      ['110', 'queens'], ['111', 'queens'], ['112', 'brooklyn'],
      ['113', 'queens'], ['114', 'queens'], ['116', 'queens'],
      
      // New York - Other cities
      ['107', 'yonkers'], ['108', 'new rochelle'], ['106', 'white plains'],
      ['142', 'buffalo'], ['143', 'niagara falls'], ['146', 'rochester'],
      ['132', 'syracuse'], ['122', 'albany'], ['121', 'troy'],
      ['123', 'schenectady'], ['135', 'utica'], ['139', 'binghamton'],
      
      // New Jersey
      ['070', 'northern nj'], ['071', 'newark'], ['072', 'elizabeth'],
      ['073', 'jersey city'], ['074', 'northern nj'], ['075', 'paterson'],
      ['076', 'hackensack'], ['077', 'northern nj'], ['078', 'central nj'],
      ['079', 'central nj'], ['080', 'southern nj'], ['081', 'camden'],
      ['082', 'southern nj'], ['083', 'southern nj'], ['084', 'atlantic city'],
      ['085', 'central nj'], ['086', 'trenton'], ['087', 'central nj'],
      ['088', 'central nj'], ['089', 'new brunswick'],
      
      // Pennsylvania
      ['150', 'pittsburgh'], ['151', 'pittsburgh'], ['152', 'pittsburgh'],
      ['153', 'pittsburgh'], ['154', 'pittsburgh'], ['159', 'johnstown'],
      ['161', 'new castle'], ['165', 'erie'], ['168', 'state college'],
      ['170', 'lebanon'], ['171', 'harrisburg'], ['173', 'york'],
      ['174', 'york'], ['175', 'lancaster'], ['176', 'lancaster'],
      ['177', 'williamsport'], ['180', 'lehigh valley'], ['181', 'allentown'],
      ['182', 'hazleton'], ['185', 'scranton'], ['187', 'wilkes-barre'],
      ['190', 'philadelphia'], ['191', 'philadelphia'], ['192', 'philadelphia'],
      ['193', 'philadelphia'], ['194', 'philadelphia'], ['195', 'reading'],
      ['196', 'reading']
    ];

    prefixMappings.forEach(([prefix, city]) => {
      // Generate all ZIP codes for this prefix (00-99)
      for (let i = 0; i < 100; i++) {
        const zipCode = prefix + i.toString().padStart(2, '0');
        this.database.zipCodeToCity.set(zipCode, city);
      }
    });
  }

  private generateZipCodesFromPrefixes(prefixes: string[]): string[] {
    const zipCodes: string[] = [];
    
    prefixes.forEach(prefix => {
      // Generate representative ZIP codes for each prefix
      for (let i = 0; i < 100; i += 10) { // Sample every 10th ZIP
        zipCodes.push(prefix + i.toString().padStart(2, '0'));
      }
    });
    
    return zipCodes;
  }

  // ===== POINTS OF INTEREST LOADERS =====

  private loadAirports(): void {
    const airports = [
      // New York
      { name: 'John F. Kennedy International Airport', aliases: ['JFK', 'JFK Airport', 'Kennedy Airport'], state: 'New York', city: 'queens', code: 'JFK' },
      { name: 'LaGuardia Airport', aliases: ['LGA', 'LaGuardia', 'LGA Airport'], state: 'New York', city: 'queens', code: 'LGA' },
      { name: 'Newark Liberty International Airport', aliases: ['EWR', 'Newark Airport', 'Liberty Airport'], state: 'New Jersey', city: 'newark', code: 'EWR' },
      { name: 'Teterboro Airport', aliases: ['TEB', 'Teterboro'], state: 'New Jersey', city: 'teterboro', code: 'TEB' },
      { name: 'Westchester County Airport', aliases: ['HPN', 'White Plains Airport'], state: 'New York', city: 'white plains', code: 'HPN' },
      { name: 'Long Island MacArthur Airport', aliases: ['ISP', 'MacArthur Airport'], state: 'New York', city: 'islip', code: 'ISP' },
      { name: 'Stewart International Airport', aliases: ['SWF', 'Stewart Airport'], state: 'New York', city: 'newburgh', code: 'SWF' },
      { name: 'Buffalo Niagara International Airport', aliases: ['BUF', 'Buffalo Airport'], state: 'New York', city: 'buffalo', code: 'BUF' },
      { name: 'Greater Rochester International Airport', aliases: ['ROC', 'Rochester Airport'], state: 'New York', city: 'rochester', code: 'ROC' },
      { name: 'Syracuse Hancock International Airport', aliases: ['SYR', 'Syracuse Airport'], state: 'New York', city: 'syracuse', code: 'SYR' },
      { name: 'Albany International Airport', aliases: ['ALB', 'Albany Airport'], state: 'New York', city: 'albany', code: 'ALB' },
      
      // Pennsylvania
      { name: 'Philadelphia International Airport', aliases: ['PHL', 'Philly Airport', 'Philadelphia Airport'], state: 'Pennsylvania', city: 'philadelphia', code: 'PHL' },
      { name: 'Pittsburgh International Airport', aliases: ['PIT', 'Pittsburgh Airport'], state: 'Pennsylvania', city: 'pittsburgh', code: 'PIT' },
      { name: 'Lehigh Valley International Airport', aliases: ['ABE', 'Allentown Airport'], state: 'Pennsylvania', city: 'allentown', code: 'ABE' },
      { name: 'Erie International Airport', aliases: ['ERI', 'Erie Airport'], state: 'Pennsylvania', city: 'erie', code: 'ERI' },
      { name: 'Harrisburg International Airport', aliases: ['MDT', 'Harrisburg Airport'], state: 'Pennsylvania', city: 'harrisburg', code: 'MDT' },
      { name: 'University Park Airport', aliases: ['SCE', 'State College Airport'], state: 'Pennsylvania', city: 'state college', code: 'SCE' },
      { name: 'Wilkes Barre Scranton International Airport', aliases: ['AVP', 'Scranton Airport'], state: 'Pennsylvania', city: 'scranton', code: 'AVP' },
      
      // New Jersey (additional)
      { name: 'Atlantic City International Airport', aliases: ['ACY', 'Atlantic City Airport'], state: 'New Jersey', city: 'atlantic city', code: 'ACY' },
      { name: 'Trenton Mercer Airport', aliases: ['TTN', 'Trenton Airport'], state: 'New Jersey', city: 'trenton', code: 'TTN' }
    ];

    airports.forEach(airport => {
      const entity: GeographicEntity = {
        name: airport.name,
        type: 'airport',
        aliases: [...airport.aliases, airport.code],
        parentEntity: airport.city,
        confidence: 1.0,
        category: 'transportation'
      };

      this.addEntity(entity);
    });
  }

  private loadUniversities(): void {
    const universities = [
      // New York
      { name: 'Columbia University', aliases: ['Columbia', 'CU'], city: 'manhattan', category: 'ivy_league' },
      { name: 'New York University', aliases: ['NYU'], city: 'manhattan', category: 'private' },
      { name: 'Fordham University', aliases: ['Fordham'], city: 'bronx', category: 'private' },
      { name: 'The New School', aliases: ['New School', 'Parsons'], city: 'manhattan', category: 'private' },
      { name: 'Brooklyn College', aliases: ['CUNY Brooklyn'], city: 'brooklyn', category: 'public' },
      { name: 'Queens College', aliases: ['CUNY Queens'], city: 'queens', category: 'public' },
      { name: 'Hunter College', aliases: ['CUNY Hunter'], city: 'manhattan', category: 'public' },
      { name: 'Baruch College', aliases: ['CUNY Baruch'], city: 'manhattan', category: 'public' },
      { name: 'City College of New York', aliases: ['CCNY', 'City College'], city: 'manhattan', category: 'public' },
      { name: 'Brooklyn Law School', aliases: ['BLS'], city: 'brooklyn', category: 'law' },
      { name: 'Yeshiva University', aliases: ['YU'], city: 'manhattan', category: 'private' },
      { name: 'St. John\'s University', aliases: ['St. Johns'], city: 'queens', category: 'private' },
      { name: 'Pace University', aliases: ['Pace'], city: 'manhattan', category: 'private' },
      { name: 'University at Buffalo', aliases: ['SUNY Buffalo', 'UB'], city: 'buffalo', category: 'public' },
      { name: 'University at Albany', aliases: ['SUNY Albany', 'UAlbany'], city: 'albany', category: 'public' },
      { name: 'Syracuse University', aliases: ['SU', 'Cuse'], city: 'syracuse', category: 'private' },
      { name: 'University of Rochester', aliases: ['U of R'], city: 'rochester', category: 'private' },
      { name: 'Rochester Institute of Technology', aliases: ['RIT'], city: 'rochester', category: 'private' },
      { name: 'Cornell University', aliases: ['Cornell'], city: 'ithaca', category: 'ivy_league' },
      { name: 'Rensselaer Polytechnic Institute', aliases: ['RPI'], city: 'troy', category: 'private' },
      { name: 'Skidmore College', aliases: ['Skidmore'], city: 'saratoga springs', category: 'private' },
      { name: 'Colgate University', aliases: ['Colgate'], city: 'hamilton', category: 'private' },
      { name: 'Vassar College', aliases: ['Vassar'], city: 'poughkeepsie', category: 'private' },
      { name: 'Marist College', aliases: ['Marist'], city: 'poughkeepsie', category: 'private' },
      { name: 'Iona College', aliases: ['Iona'], city: 'new rochelle', category: 'private' },

      // New Jersey
      { name: 'Princeton University', aliases: ['Princeton'], city: 'princeton', category: 'ivy_league' },
      { name: 'Rutgers University', aliases: ['Rutgers', 'RU'], city: 'new brunswick', category: 'public' },
      { name: 'Stevens Institute of Technology', aliases: ['Stevens Tech', 'Stevens'], city: 'hoboken', category: 'private' },
      { name: 'New Jersey Institute of Technology', aliases: ['NJIT'], city: 'newark', category: 'public' },
      { name: 'Seton Hall University', aliases: ['Seton Hall'], city: 'south orange', category: 'private' },
      { name: 'Montclair State University', aliases: ['Montclair State', 'MSU'], city: 'montclair', category: 'public' },
      { name: 'Fairleigh Dickinson University', aliases: ['FDU'], city: 'teaneck', category: 'private' },
      { name: 'Rowan University', aliases: ['Rowan'], city: 'glassboro', category: 'public' },
      { name: 'Rider University', aliases: ['Rider'], city: 'lawrenceville', category: 'private' },
      { name: 'The College of New Jersey', aliases: ['TCNJ'], city: 'ewing', category: 'public' },
      { name: 'Stockton University', aliases: ['Stockton'], city: 'galloway', category: 'public' },
      { name: 'Kean University', aliases: ['Kean'], city: 'union', category: 'public' },
      { name: 'William Paterson University', aliases: ['William Paterson', 'WPU'], city: 'wayne', category: 'public' },
      { name: 'Monmouth University', aliases: ['Monmouth'], city: 'west long branch', category: 'private' },
      { name: 'Saint Peter\'s University', aliases: ['Saint Peters'], city: 'jersey city', category: 'private' },

      // Pennsylvania
      { name: 'University of Pennsylvania', aliases: ['UPenn', 'Penn'], city: 'philadelphia', category: 'ivy_league' },
      { name: 'Temple University', aliases: ['Temple', 'TU'], city: 'philadelphia', category: 'public' },
      { name: 'Drexel University', aliases: ['Drexel'], city: 'philadelphia', category: 'private' },
      { name: 'Villanova University', aliases: ['Villanova', 'Nova'], city: 'villanova', category: 'private' },
      { name: 'University of Pittsburgh', aliases: ['Pitt', 'University of Pittsburgh'], city: 'pittsburgh', category: 'public' },
      { name: 'Carnegie Mellon University', aliases: ['CMU', 'Carnegie Mellon'], city: 'pittsburgh', category: 'private' },
      { name: 'Pennsylvania State University', aliases: ['Penn State', 'PSU'], city: 'state college', category: 'public' },
      { name: 'Duquesne University', aliases: ['Duquesne'], city: 'pittsburgh', category: 'private' },
      { name: 'Lehigh University', aliases: ['Lehigh'], city: 'bethlehem', category: 'private' },
      { name: 'Lafayette College', aliases: ['Lafayette'], city: 'easton', category: 'private' },
      { name: 'Swarthmore College', aliases: ['Swarthmore'], city: 'swarthmore', category: 'private' },
      { name: 'Haverford College', aliases: ['Haverford'], city: 'haverford', category: 'private' },
      { name: 'Bryn Mawr College', aliases: ['Bryn Mawr'], city: 'bryn mawr', category: 'private' },
      { name: 'Franklin & Marshall College', aliases: ['F&M', 'Franklin Marshall'], city: 'lancaster', category: 'private' },
      { name: 'Dickinson College', aliases: ['Dickinson'], city: 'carlisle', category: 'private' },
      { name: 'Bucknell University', aliases: ['Bucknell'], city: 'lewisburg', category: 'private' },
      { name: 'Gettysburg College', aliases: ['Gettysburg'], city: 'gettysburg', category: 'private' },
      { name: 'Muhlenberg College', aliases: ['Muhlenberg'], city: 'allentown', category: 'private' },
      { name: 'West Chester University', aliases: ['West Chester'], city: 'west chester', category: 'public' },
      { name: 'La Salle University', aliases: ['La Salle'], city: 'philadelphia', category: 'private' }
    ];

    universities.forEach(university => {
      const entity: GeographicEntity = {
        name: university.name,
        type: 'university',
        aliases: university.aliases,
        parentEntity: university.city,
        confidence: 1.0,
        category: university.category
      };

      this.addEntity(entity);
    });
  }

  private loadHospitals(): void {
    const hospitals = [
      // New York
      { name: 'Mount Sinai Hospital', aliases: ['Mount Sinai', 'Sinai'], city: 'manhattan', category: 'major_medical_center' },
      { name: 'NewYork-Presbyterian Hospital', aliases: ['NYP', 'Presbyterian'], city: 'manhattan', category: 'major_medical_center' },
      { name: 'NYU Langone Health', aliases: ['NYU Langone', 'Langone'], city: 'manhattan', category: 'major_medical_center' },
      { name: 'Memorial Sloan Kettering Cancer Center', aliases: ['Sloan Kettering', 'MSKCC'], city: 'manhattan', category: 'specialty' },
      { name: 'Hospital for Special Surgery', aliases: ['HSS'], city: 'manhattan', category: 'specialty' },
      { name: 'Lenox Hill Hospital', aliases: ['Lenox Hill'], city: 'manhattan', category: 'hospital' },
      { name: 'Mount Sinai Beth Israel', aliases: ['Beth Israel'], city: 'manhattan', category: 'hospital' },
      { name: 'Weill Cornell Medical Center', aliases: ['Cornell Medical'], city: 'manhattan', category: 'medical_center' },
      { name: 'Brooklyn Methodist Hospital', aliases: ['Methodist Brooklyn'], city: 'brooklyn', category: 'hospital' },
      { name: 'Maimonides Medical Center', aliases: ['Maimonides'], city: 'brooklyn', category: 'medical_center' },
      { name: 'NewYork-Presbyterian Brooklyn Methodist', aliases: ['NYP Brooklyn'], city: 'brooklyn', category: 'hospital' },
      { name: 'Montefiore Medical Center', aliases: ['Montefiore'], city: 'bronx', category: 'medical_center' },
      { name: 'Bronx-Lebanon Hospital', aliases: ['Bronx-Lebanon'], city: 'bronx', category: 'hospital' },
      { name: 'Jamaica Hospital Medical Center', aliases: ['Jamaica Hospital'], city: 'queens', category: 'medical_center' },
      { name: 'Elmhurst Hospital Center', aliases: ['Elmhurst Hospital'], city: 'queens', category: 'hospital' },
      { name: 'Staten Island University Hospital', aliases: ['SIUH'], city: 'staten island', category: 'hospital' },
      { name: 'Buffalo General Medical Center', aliases: ['Buffalo General'], city: 'buffalo', category: 'medical_center' },
      { name: 'Rochester General Hospital', aliases: ['Rochester General'], city: 'rochester', category: 'hospital' },
      { name: 'Strong Memorial Hospital', aliases: ['Strong Memorial'], city: 'rochester', category: 'medical_center' },
      { name: 'Syracuse University Hospital', aliases: ['Syracuse Hospital'], city: 'syracuse', category: 'hospital' },
      { name: 'Albany Medical Center', aliases: ['Albany Medical'], city: 'albany', category: 'medical_center' },

      // New Jersey
      { name: 'Newark Beth Israel Medical Center', aliases: ['Beth Israel Newark'], city: 'newark', category: 'medical_center' },
      { name: 'University Hospital Newark', aliases: ['University Hospital'], city: 'newark', category: 'hospital' },
      { name: 'Jersey City Medical Center', aliases: ['JCMC'], city: 'jersey city', category: 'medical_center' },
      { name: 'Hackensack University Medical Center', aliases: ['Hackensack Medical'], city: 'hackensack', category: 'medical_center' },
      { name: 'Robert Wood Johnson University Hospital', aliases: ['RWJ', 'Robert Wood Johnson'], city: 'new brunswick', category: 'hospital' },
      { name: 'Saint Barnabas Medical Center', aliases: ['Saint Barnabas'], city: 'livingston', category: 'medical_center' },
      { name: 'Morristown Medical Center', aliases: ['Morristown Medical'], city: 'morristown', category: 'medical_center' },
      { name: 'Overlook Medical Center', aliases: ['Overlook Medical'], city: 'summit', category: 'medical_center' },
      { name: 'Cooper University Hospital', aliases: ['Cooper Hospital'], city: 'camden', category: 'hospital' },
      { name: 'AtlantiCare Regional Medical Center', aliases: ['AtlantiCare'], city: 'atlantic city', category: 'medical_center' },
      { name: 'Capital Health Medical Center', aliases: ['Capital Health'], city: 'trenton', category: 'medical_center' },
      { name: 'Chilton Medical Center', aliases: ['Chilton Medical'], city: 'pompton plains', category: 'medical_center' },
      { name: 'Valley Hospital', aliases: ['Valley Hospital'], city: 'ridgewood', category: 'hospital' },
      { name: 'Englewood Hospital', aliases: ['Englewood Hospital'], city: 'englewood', category: 'hospital' },
      { name: 'Holy Name Medical Center', aliases: ['Holy Name'], city: 'teaneck', category: 'medical_center' },

      // Pennsylvania
      { name: 'Penn Medicine', aliases: ['Penn Medicine', 'HUP'], city: 'philadelphia', category: 'major_medical_center' },
      { name: 'Jefferson Health', aliases: ['Jefferson Hospital', 'Thomas Jefferson'], city: 'philadelphia', category: 'major_medical_center' },
      { name: 'Children\'s Hospital of Philadelphia', aliases: ['CHOP'], city: 'philadelphia', category: 'specialty' },
      { name: 'Temple University Hospital', aliases: ['Temple Hospital'], city: 'philadelphia', category: 'hospital' },
      { name: 'Hahnemann University Hospital', aliases: ['Hahnemann'], city: 'philadelphia', category: 'hospital' },
      { name: 'Einstein Medical Center', aliases: ['Einstein Medical'], city: 'philadelphia', category: 'medical_center' },
      { name: 'Fox Chase Cancer Center', aliases: ['Fox Chase'], city: 'philadelphia', category: 'specialty' },
      { name: 'UPMC Presbyterian', aliases: ['UPMC', 'Presbyterian Pittsburgh'], city: 'pittsburgh', category: 'major_medical_center' },
      { name: 'Allegheny General Hospital', aliases: ['Allegheny General', 'AGH'], city: 'pittsburgh', category: 'hospital' },
      { name: 'UPMC Children\'s Hospital of Pittsburgh', aliases: ['Children\'s Pittsburgh'], city: 'pittsburgh', category: 'specialty' },
      { name: 'Penn State Hershey Medical Center', aliases: ['Hershey Medical'], city: 'hershey', category: 'medical_center' },
      { name: 'Lehigh Valley Hospital', aliases: ['LVH'], city: 'allentown', category: 'hospital' },
      { name: 'St. Christopher\'s Hospital for Children', aliases: ['St. Christophers'], city: 'philadelphia', category: 'specialty' },
      { name: 'Geisinger Medical Center', aliases: ['Geisinger'], city: 'danville', category: 'medical_center' },
      { name: 'WellSpan York Hospital', aliases: ['York Hospital'], city: 'york', category: 'hospital' },
      { name: 'Lancaster General Hospital', aliases: ['Lancaster General'], city: 'lancaster', category: 'hospital' },
      { name: 'Reading Hospital', aliases: ['Reading Hospital'], city: 'reading', category: 'hospital' },
      { name: 'Scranton Regional Medical Center', aliases: ['Scranton Medical'], city: 'scranton', category: 'medical_center' }
    ];

    hospitals.forEach(hospital => {
      const entity: GeographicEntity = {
        name: hospital.name,
        type: 'hospital',
        aliases: hospital.aliases,
        parentEntity: hospital.city,
        confidence: 1.0,
        category: hospital.category
      };

      this.addEntity(entity);
    });
  }

  private loadSportsVenues(): void {
    const venues = [
      // New York
      { name: 'Madison Square Garden', aliases: ['MSG', 'The Garden'], city: 'manhattan', category: 'arena', teams: ['Knicks', 'Rangers'] },
      { name: 'Yankee Stadium', aliases: ['The Stadium', 'New Yankee Stadium'], city: 'bronx', category: 'stadium', teams: ['Yankees'] },
      { name: 'Citi Field', aliases: ['Citi', 'Shea Stadium replacement'], city: 'queens', category: 'stadium', teams: ['Mets'] },
      { name: 'Barclays Center', aliases: ['Barclays'], city: 'brooklyn', category: 'arena', teams: ['Nets', 'Islanders'] },
      { name: 'UBS Arena', aliases: ['UBS', 'Belmont Arena'], city: 'elmont', category: 'arena', teams: ['Islanders'] },
      { name: 'Red Bull Arena', aliases: ['Red Bull Stadium'], city: 'harrison', category: 'stadium', teams: ['Red Bulls'] },
      { name: 'KeyBank Center', aliases: ['Buffalo Arena', 'First Niagara Center'], city: 'buffalo', category: 'arena', teams: ['Sabres'] },
      { name: 'Highmark Stadium', aliases: ['Bills Stadium', 'New Era Field'], city: 'orchard park', category: 'stadium', teams: ['Bills'] },
      { name: 'Blue Cross Arena', aliases: ['Rochester Arena'], city: 'rochester', category: 'arena', teams: [] },
      { name: 'MVP Arena', aliases: ['Times Union Center', 'Albany Arena'], city: 'albany', category: 'arena', teams: [] },

      // New Jersey  
      { name: 'MetLife Stadium', aliases: ['MetLife', 'New Meadowlands'], city: 'east rutherford', category: 'stadium', teams: ['Giants', 'Jets'] },
      { name: 'Prudential Center', aliases: ['The Rock'], city: 'newark', category: 'arena', teams: ['Devils'] },
      { name: 'SHI Stadium', aliases: ['Rutgers Stadium'], city: 'piscataway', category: 'stadium', teams: ['Rutgers'] },

      // Pennsylvania
      { name: 'Lincoln Financial Field', aliases: ['The Linc', 'Lincoln Financial'], city: 'philadelphia', category: 'stadium', teams: ['Eagles'] },
      { name: 'Citizens Bank Park', aliases: ['Citizens Bank', 'CBP'], city: 'philadelphia', category: 'stadium', teams: ['Phillies'] },
      { name: 'Wells Fargo Center', aliases: ['Wells Fargo', 'The Center'], city: 'philadelphia', category: 'arena', teams: ['76ers', 'Flyers'] },
      { name: 'Subaru Park', aliases: ['Talen Energy Stadium'], city: 'chester', category: 'stadium', teams: ['Union'] },
      { name: 'Heinz Field', aliases: ['Acrisure Stadium'], city: 'pittsburgh', category: 'stadium', teams: ['Steelers'] },
      { name: 'PNC Park', aliases: ['PNC'], city: 'pittsburgh', category: 'stadium', teams: ['Pirates'] },
      { name: 'PPG Paints Arena', aliases: ['PPG Arena', 'Consol Energy Center'], city: 'pittsburgh', category: 'arena', teams: ['Penguins'] },
      { name: 'Beaver Stadium', aliases: ['Penn State Stadium'], city: 'state college', category: 'stadium', teams: ['Penn State'] },
      { name: 'PPL Park', aliases: ['Chester Stadium'], city: 'chester', category: 'stadium', teams: [] },
      { name: 'Giant Center', aliases: ['Hershey Arena'], city: 'hershey', category: 'arena', teams: ['Bears'] }
    ];

    venues.forEach(venue => {
      const entity: GeographicEntity = {
        name: venue.name,
        type: venue.category as any,
        aliases: venue.aliases,
        parentEntity: venue.city,
        confidence: 1.0,
        category: 'sports'
      };

      this.addEntity(entity);
    });
  }

  private loadLandmarks(): void {
    const landmarks = [
      // New York
      { name: 'Statue of Liberty', aliases: ['Liberty Statue', 'Lady Liberty'], city: 'new york harbor', type: 'monument' },
      { name: 'Empire State Building', aliases: ['ESB'], city: 'manhattan', type: 'landmark' },
      { name: 'One World Trade Center', aliases: ['Freedom Tower', '1 WTC'], city: 'manhattan', type: 'landmark' },
      { name: 'Brooklyn Bridge', aliases: ['Brooklyn Bridge'], city: 'manhattan', type: 'bridge' },
      { name: 'Times Square', aliases: ['Times Sq', 'Crossroads of the World'], city: 'manhattan', type: 'attraction' },
      { name: 'Central Park', aliases: ['The Park'], city: 'manhattan', type: 'park' },
      { name: 'High Line', aliases: ['High Line Park'], city: 'manhattan', type: 'park' },
      { name: 'Rockefeller Center', aliases: ['Rock Center', '30 Rock'], city: 'manhattan', type: 'landmark' },
      { name: 'Chrysler Building', aliases: ['Chrysler'], city: 'manhattan', type: 'landmark' },
      { name: 'Flatiron Building', aliases: ['Flatiron'], city: 'manhattan', type: 'landmark' },
      { name: '9/11 Memorial', aliases: ['World Trade Center Memorial', 'Ground Zero'], city: 'manhattan', type: 'monument' },
      { name: 'Wall Street', aliases: ['Financial District'], city: 'manhattan', type: 'business_district' },
      { name: 'Coney Island', aliases: ['Coney'], city: 'brooklyn', type: 'attraction' },
      { name: 'Prospect Park', aliases: ['Prospect'], city: 'brooklyn', type: 'park' },
      { name: 'Flushing Meadows Corona Park', aliases: ['Flushing Meadows'], city: 'queens', type: 'park' },
      { name: 'Niagara Falls', aliases: ['The Falls'], city: 'niagara falls', type: 'attraction' },
      { name: 'Finger Lakes', aliases: ['Finger Lakes Region'], city: 'finger lakes', type: 'attraction' },

      // New Jersey
      { name: 'Atlantic City Boardwalk', aliases: ['AC Boardwalk', 'The Boardwalk'], city: 'atlantic city', type: 'attraction' },
      { name: 'Steel Pier', aliases: ['AC Pier'], city: 'atlantic city', type: 'attraction' },
      { name: 'Liberty State Park', aliases: ['Liberty Park'], city: 'jersey city', type: 'park' },
      { name: 'Princeton University Campus', aliases: ['Princeton Campus'], city: 'princeton', type: 'landmark' },
      { name: 'Grounds For Sculpture', aliases: ['Hamilton Sculpture'], city: 'hamilton', type: 'attraction' },
      { name: 'Delaware Water Gap', aliases: ['Water Gap'], city: 'delaware water gap', type: 'attraction' },
      { name: 'Island Beach State Park', aliases: ['Island Beach'], city: 'seaside park', type: 'park' },
      { name: 'Palisades Interstate Park', aliases: ['Palisades'], city: 'fort lee', type: 'park' },

      // Pennsylvania  
      { name: 'Independence Hall', aliases: ['Independence'], city: 'philadelphia', type: 'monument' },
      { name: 'Liberty Bell', aliases: ['The Bell'], city: 'philadelphia', type: 'monument' },
      { name: 'Philadelphia Museum of Art', aliases: ['Art Museum', 'Rocky Steps'], city: 'philadelphia', type: 'museum' },
      { name: 'Reading Terminal Market', aliases: ['Reading Market'], city: 'philadelphia', type: 'market' },
      { name: 'Eastern State Penitentiary', aliases: ['Eastern State'], city: 'philadelphia', type: 'landmark' },
      { name: 'Betsy Ross House', aliases: ['Betsy Ross'], city: 'philadelphia', type: 'landmark' },
      { name: 'Philly City Hall', aliases: ['City Hall Philadelphia'], city: 'philadelphia', type: 'government_building' },
      { name: 'Love Park', aliases: ['LOVE Statue'], city: 'philadelphia', type: 'park' },
      { name: 'Point State Park', aliases: ['The Point'], city: 'pittsburgh', type: 'park' },
      { name: 'Carnegie Museums', aliases: ['Carnegie Museum'], city: 'pittsburgh', type: 'museum' },
      { name: 'Phipps Conservatory', aliases: ['Phipps'], city: 'pittsburgh', type: 'attraction' },
      { name: 'Fallingwater', aliases: ['Frank Lloyd Wright House'], city: 'mill run', type: 'landmark' },
      { name: 'Gettysburg National Military Park', aliases: ['Gettysburg Battlefield'], city: 'gettysburg', type: 'monument' },
      { name: 'Valley Forge National Historical Park', aliases: ['Valley Forge'], city: 'valley forge', type: 'monument' },
      { name: 'Hersheypark', aliases: ['Hershey Park'], city: 'hershey', type: 'attraction' },
      { name: 'Presque Isle State Park', aliases: ['Presque Isle'], city: 'erie', type: 'park' },
      { name: 'Bushkill Falls', aliases: ['Niagara of Pennsylvania'], city: 'bushkill', type: 'attraction' }
    ];

    landmarks.forEach(landmark => {
      const entity: GeographicEntity = {
        name: landmark.name,
        type: landmark.type as any,
        aliases: landmark.aliases,
        parentEntity: landmark.city,
        confidence: 1.0,
        category: 'landmark'
      };

      this.addEntity(entity);
    });
  }

  private loadTransportation(): void {
    const transportation = [
      // New York Train Stations
      { name: 'Penn Station', aliases: ['Pennsylvania Station', 'NY Penn'], city: 'manhattan', type: 'train_station' },
      { name: 'Grand Central Terminal', aliases: ['Grand Central', 'GCT'], city: 'manhattan', type: 'train_station' },
      { name: 'Jamaica Station', aliases: ['Jamaica LIRR'], city: 'queens', type: 'train_station' },
      { name: 'Atlantic Terminal', aliases: ['Atlantic Ave'], city: 'brooklyn', type: 'train_station' },
      { name: 'Union Station Buffalo', aliases: ['Buffalo Central'], city: 'buffalo', type: 'train_station' },
      { name: 'Syracuse Regional Transportation Center', aliases: ['Syracuse Station'], city: 'syracuse', type: 'train_station' },
      { name: 'Albany-Rensselaer Station', aliases: ['Albany Station'], city: 'rensselaer', type: 'train_station' },

      // Bus Terminals
      { name: 'Port Authority Bus Terminal', aliases: ['Port Authority', 'PABT'], city: 'manhattan', type: 'bus_terminal' },
      { name: 'George Washington Bridge Bus Terminal', aliases: ['GWB Terminal'], city: 'manhattan', type: 'bus_terminal' },

      // Ferry Terminals
      { name: 'Staten Island Ferry Terminal', aliases: ['SI Ferry'], city: 'manhattan', type: 'ferry_terminal' },
      { name: 'NY Waterway Terminal', aliases: ['Waterway Ferry'], city: 'manhattan', type: 'ferry_terminal' },

      // New Jersey Transportation
      { name: 'Newark Penn Station', aliases: ['Newark Penn'], city: 'newark', type: 'train_station' },
      { name: '30th Street Station', aliases: ['Philadelphia 30th Street'], city: 'philadelphia', type: 'train_station' },
      { name: 'Trenton Transit Center', aliases: ['Trenton Station'], city: 'trenton', type: 'train_station' },
      { name: 'Hoboken Terminal', aliases: ['Hoboken Train'], city: 'hoboken', type: 'train_station' },
      { name: 'Secaucus Junction', aliases: ['Secaucus'], city: 'secaucus', type: 'train_station' },

      // Pennsylvania Transportation
      { name: 'Union Station Pittsburgh', aliases: ['Pittsburgh Station'], city: 'pittsburgh', type: 'train_station' },
      { name: 'Harrisburg Transportation Center', aliases: ['Harrisburg Station'], city: 'harrisburg', type: 'train_station' },
      { name: 'Lancaster Amtrak Station', aliases: ['Lancaster Station'], city: 'lancaster', type: 'train_station' },

      // Ports
      { name: 'Port of New York and New Jersey', aliases: ['NY NJ Port', 'Port Newark'], city: 'newark', type: 'port' },
      { name: 'Port of Philadelphia', aliases: ['Philly Port'], city: 'philadelphia', type: 'port' },
      { name: 'Port of Pittsburgh', aliases: ['Pittsburgh Port'], city: 'pittsburgh', type: 'port' }
    ];

    transportation.forEach(transport => {
      const entity: GeographicEntity = {
        name: transport.name,
        type: transport.type as any,
        aliases: transport.aliases,
        parentEntity: transport.city,
        confidence: 1.0,
        category: 'transportation'
      };

      this.addEntity(entity);
    });
  }

  private loadShoppingCenters(): void {
    const shopping = [
      // New York
      { name: 'Herald Square', aliases: ['Macy\'s Herald Square'], city: 'manhattan', type: 'shopping_center' },
      { name: 'Union Square', aliases: ['Union Sq'], city: 'manhattan', type: 'shopping_center' },
      { name: 'SoHo Shopping District', aliases: ['SoHo Shopping'], city: 'manhattan', type: 'shopping_center' },
      { name: 'Fifth Avenue Shopping', aliases: ['Fifth Ave Shopping'], city: 'manhattan', type: 'shopping_center' },
      { name: 'Brooklyn Bridge Park', aliases: ['BBP'], city: 'brooklyn', type: 'shopping_center' },
      { name: 'Atlantic Terminal Mall', aliases: ['Atlantic Mall'], city: 'brooklyn', type: 'shopping_center' },
      { name: 'Queens Center', aliases: ['Queens Mall'], city: 'queens', type: 'shopping_center' },
      { name: 'Staten Island Mall', aliases: ['SI Mall'], city: 'staten island', type: 'shopping_center' },
      { name: 'Walden Galleria', aliases: ['Buffalo Mall'], city: 'buffalo', type: 'shopping_center' },
      { name: 'Eastview Mall', aliases: ['Rochester Mall'], city: 'rochester', type: 'shopping_center' },
      { name: 'Destiny USA', aliases: ['Syracuse Mall'], city: 'syracuse', type: 'shopping_center' },
      { name: 'Crossgates Mall', aliases: ['Albany Mall'], city: 'albany', type: 'shopping_center' },

      // New Jersey
      { name: 'American Dream', aliases: ['American Dream Mall', 'Meadowlands Mall'], city: 'east rutherford', type: 'shopping_center' },
      { name: 'Newport Centre', aliases: ['Newport Mall'], city: 'jersey city', type: 'shopping_center' },
      { name: 'Garden State Plaza', aliases: ['GSP Mall'], city: 'paramus', type: 'shopping_center' },
      { name: 'Willowbrook Mall', aliases: ['Willowbrook'], city: 'wayne', type: 'shopping_center' },
      { name: 'Short Hills Mall', aliases: ['Short Hills'], city: 'short hills', type: 'shopping_center' },
      { name: 'Freehold Raceway Mall', aliases: ['Freehold Mall'], city: 'freehold', type: 'shopping_center' },
      { name: 'Ocean County Mall', aliases: ['Ocean Mall'], city: 'toms river', type: 'shopping_center' },
      { name: 'Hamilton Marketplace', aliases: ['Hamilton Mall'], city: 'hamilton', type: 'shopping_center' },
      { name: 'Cherry Hill Mall', aliases: ['Cherry Hill'], city: 'cherry hill', type: 'shopping_center' },

      // Pennsylvania
      { name: 'King of Prussia Mall', aliases: ['KOP Mall', 'King of Prussia'], city: 'king of prussia', type: 'shopping_center' },
      { name: 'Liberty Place', aliases: ['Shops at Liberty Place'], city: 'philadelphia', type: 'shopping_center' },
      { name: 'Fashion District Philadelphia', aliases: ['Fashion District'], city: 'philadelphia', type: 'shopping_center' },
      { name: 'Franklin Mills', aliases: ['Philadelphia Mills'], city: 'philadelphia', type: 'shopping_center' },
      { name: 'The Waterfront', aliases: ['Waterfront Pittsburgh'], city: 'pittsburgh', type: 'shopping_center' },
      { name: 'SouthSide Works', aliases: ['SouthSide'], city: 'pittsburgh', type: 'shopping_center' },
      { name: 'Ross Park Mall', aliases: ['Ross Park'], city: 'pittsburgh', type: 'shopping_center' },
      { name: 'Lehigh Valley Mall', aliases: ['LV Mall'], city: 'allentown', type: 'shopping_center' },
      { name: 'Park City Center', aliases: ['Lancaster Mall'], city: 'lancaster', type: 'shopping_center' },
      { name: 'Wyoming Valley Mall', aliases: ['Wilkes-Barre Mall'], city: 'wilkes-barre', type: 'shopping_center' },
      { name: 'Capital City Mall', aliases: ['Harrisburg Mall'], city: 'harrisburg', type: 'shopping_center' }
    ];

    shopping.forEach(shop => {
      const entity: GeographicEntity = {
        name: shop.name,
        type: 'shopping_center',
        aliases: shop.aliases,
        parentEntity: shop.city,
        confidence: 1.0,
        category: 'retail'
      };

      this.addEntity(entity);
    });
  }

  private loadParks(): void {
    const parks = [
      // New York Parks (already added some in landmarks, adding more)
      { name: 'Bryant Park', aliases: ['Bryant'], city: 'manhattan', type: 'park' },
      { name: 'Washington Square Park', aliases: ['Washington Square'], city: 'manhattan', type: 'park' },
      { name: 'Madison Square Park', aliases: ['Madison Square'], city: 'manhattan', type: 'park' },
      { name: 'Riverside Park', aliases: ['Riverside'], city: 'manhattan', type: 'park' },
      { name: 'Battery Park', aliases: ['The Battery'], city: 'manhattan', type: 'park' },
      { name: 'Carl Schurz Park', aliases: ['Carl Schurz'], city: 'manhattan', type: 'park' },
      { name: 'Tompkins Square Park', aliases: ['Tompkins Square'], city: 'manhattan', type: 'park' },
      { name: 'Fort Tryon Park', aliases: ['Fort Tryon'], city: 'manhattan', type: 'park' },
      { name: 'Van Cortlandt Park', aliases: ['Van Cortlandt'], city: 'bronx', type: 'park' },
      { name: 'Pelham Bay Park', aliases: ['Pelham Bay'], city: 'bronx', type: 'park' },
      { name: 'Bronx Zoo', aliases: ['The Zoo'], city: 'bronx', type: 'attraction' },
      { name: 'New York Botanical Garden', aliases: ['Botanical Garden'], city: 'bronx', type: 'attraction' },
      { name: 'McCarren Park', aliases: ['McCarren'], city: 'brooklyn', type: 'park' },
      { name: 'Fort Greene Park', aliases: ['Fort Greene'], city: 'brooklyn', type: 'park' },
      { name: 'Marine Park', aliases: ['Marine'], city: 'brooklyn', type: 'park' },
      { name: 'Astoria Park', aliases: ['Astoria'], city: 'queens', type: 'park' },
      { name: 'Forest Park', aliases: ['Forest Park Queens'], city: 'queens', type: 'park' },
      { name: 'Clove Lakes Park', aliases: ['Clove Lakes'], city: 'staten island', type: 'park' },
      { name: 'Great Kills Park', aliases: ['Great Kills'], city: 'staten island', type: 'park' },
      { name: 'Delaware Park', aliases: ['Delaware Park Buffalo'], city: 'buffalo', type: 'park' },
      { name: 'Highland Park', aliases: ['Highland Park Rochester'], city: 'rochester', type: 'park' },
      { name: 'Onondaga Lake Park', aliases: ['Onondaga Lake'], city: 'syracuse', type: 'park' },
      { name: 'Washington Park', aliases: ['Washington Park Albany'], city: 'albany', type: 'park' },

      // New Jersey Parks
      { name: 'Branch Brook Park', aliases: ['Branch Brook'], city: 'newark', type: 'park' },
      { name: 'Liberty Science Center', aliases: ['Liberty Science'], city: 'jersey city', type: 'attraction' },
      { name: 'Duke Farms', aliases: ['Duke Estate'], city: 'hillsborough', type: 'park' },
      { name: 'Great Adventure', aliases: ['Six Flags Great Adventure'], city: 'jackson', type: 'attraction' },
      { name: 'Cape Henlopen State Park', aliases: ['Cape Henlopen'], city: 'lewes', type: 'park' },
      { name: 'High Point State Park', aliases: ['High Point'], city: 'sussex', type: 'park' },
      { name: 'Battleship New Jersey', aliases: ['Battleship'], city: 'camden', type: 'attraction' },
      { name: 'Adventure Aquarium', aliases: ['Camden Aquarium'], city: 'camden', type: 'attraction' },

      // Pennsylvania Parks
      { name: 'Fairmount Park', aliases: ['Fairmount'], city: 'philadelphia', type: 'park' },
      { name: 'Rittenhouse Square', aliases: ['Rittenhouse'], city: 'philadelphia', type: 'park' },
      { name: 'Penn\'s Landing', aliases: ['Penns Landing'], city: 'philadelphia', type: 'attraction' },
      { name: 'Franklin Square', aliases: ['Franklin Sq'], city: 'philadelphia', type: 'park' },
      { name: 'Schuylkill River Trail', aliases: ['Schuylkill Trail'], city: 'philadelphia', type: 'park' },
      { name: 'Frick Park', aliases: ['Frick'], city: 'pittsburgh', type: 'park' },
      { name: 'Schenley Park', aliases: ['Schenley'], city: 'pittsburgh', type: 'park' },
      { name: 'Riverview Park', aliases: ['Riverview'], city: 'pittsburgh', type: 'park' },
      { name: 'Ohiopyle State Park', aliases: ['Ohiopyle'], city: 'ohiopyle', type: 'park' },
      { name: 'Ricketts Glen State Park', aliases: ['Ricketts Glen'], city: 'benton', type: 'park' },
      { name: 'Dorney Park', aliases: ['Dorney'], city: 'allentown', type: 'attraction' },
      { name: 'Knoebels Amusement Resort', aliases: ['Knoebels'], city: 'elysburg', type: 'attraction' }
    ];

    parks.forEach(park => {
      const entity: GeographicEntity = {
        name: park.name,
        type: park.type as any,
        aliases: park.aliases,
        parentEntity: park.city,
        confidence: 1.0,
        category: 'recreation'
      };

      this.addEntity(entity);
    });
  }

  private loadBusinessDistricts(): void {
    const districts = [
      // New York
      { name: 'Financial District', aliases: ['FiDi', 'Wall Street'], city: 'manhattan', type: 'business_district' },
      { name: 'Midtown Manhattan', aliases: ['Midtown'], city: 'manhattan', type: 'business_district' },
      { name: 'Midtown East', aliases: ['Midtown E'], city: 'manhattan', type: 'business_district' },
      { name: 'Midtown West', aliases: ['Midtown W'], city: 'manhattan', type: 'business_district' },
      { name: 'Hudson Yards', aliases: ['Hudson Yards District'], city: 'manhattan', type: 'business_district' },
      { name: 'Long Island City Business District', aliases: ['LIC Business'], city: 'queens', type: 'business_district' },
      { name: 'Brooklyn Heights Promenade', aliases: ['Brooklyn Heights'], city: 'brooklyn', type: 'business_district' },
      { name: 'Downtown Buffalo', aliases: ['Buffalo Downtown'], city: 'buffalo', type: 'business_district' },
      { name: 'Downtown Rochester', aliases: ['Rochester Downtown'], city: 'rochester', type: 'business_district' },
      { name: 'Downtown Syracuse', aliases: ['Syracuse Downtown'], city: 'syracuse', type: 'business_district' },
      { name: 'Downtown Albany', aliases: ['Albany Downtown'], city: 'albany', type: 'business_district' },

      // New Jersey
      { name: 'Newark Downtown', aliases: ['Downtown Newark'], city: 'newark', type: 'business_district' },
      { name: 'Jersey City Financial District', aliases: ['Newport Financial'], city: 'jersey city', type: 'business_district' },
      { name: 'Hoboken Waterfront', aliases: ['Hoboken Business'], city: 'hoboken', type: 'business_district' },
      { name: 'Princeton Business Park', aliases: ['Princeton Business'], city: 'princeton', type: 'business_district' },
      { name: 'Paramus Business District', aliases: ['Paramus Business'], city: 'paramus', type: 'business_district' },
      { name: 'Camden Waterfront', aliases: ['Camden Business'], city: 'camden', type: 'business_district' },
      { name: 'Atlantic City Casino District', aliases: ['AC Casinos'], city: 'atlantic city', type: 'business_district' },
      { name: 'Trenton Government District', aliases: ['Trenton Government'], city: 'trenton', type: 'business_district' },

      // Pennsylvania
      { name: 'Center City Philadelphia', aliases: ['Center City', 'Center City Philly'], city: 'philadelphia', type: 'business_district' },
      { name: 'University City', aliases: ['University City Philadelphia'], city: 'philadelphia', type: 'business_district' },
      { name: 'Northern Liberties', aliases: ['NoLibs'], city: 'philadelphia', type: 'business_district' },
      { name: 'Old City Philadelphia', aliases: ['Old City'], city: 'philadelphia', type: 'business_district' },
      { name: 'Golden Triangle Pittsburgh', aliases: ['Golden Triangle'], city: 'pittsburgh', type: 'business_district' },
      { name: 'Strip District', aliases: ['The Strip'], city: 'pittsburgh', type: 'business_district' },
      { name: 'Lawrenceville', aliases: ['Lawrenceville Pittsburgh'], city: 'pittsburgh', type: 'business_district' },
      { name: 'Shadyside', aliases: ['Shadyside Pittsburgh'], city: 'pittsburgh', type: 'business_district' },
      { name: 'Squirrel Hill', aliases: ['Squirrel Hill Pittsburgh'], city: 'pittsburgh', type: 'business_district' },
      { name: 'Downtown Harrisburg', aliases: ['Harrisburg Downtown'], city: 'harrisburg', type: 'business_district' },
      { name: 'Downtown Lancaster', aliases: ['Lancaster Downtown'], city: 'lancaster', type: 'business_district' },
      { name: 'Downtown Allentown', aliases: ['Allentown Downtown'], city: 'allentown', type: 'business_district' }
    ];

    districts.forEach(district => {
      const entity: GeographicEntity = {
        name: district.name,
        type: 'business_district',
        aliases: district.aliases,
        parentEntity: district.city,
        confidence: 1.0,
        category: 'commercial'
      };

      this.addEntity(entity);
    });
  }

  private loadInfrastructure(): void {
    const infrastructure = [
      // Bridges
      { name: 'George Washington Bridge', aliases: ['GW Bridge', 'GWB'], city: 'manhattan', type: 'bridge' },
      { name: 'Manhattan Bridge', aliases: ['Manhattan Br'], city: 'manhattan', type: 'bridge' },
      { name: 'Williamsburg Bridge', aliases: ['Williamsburg Br'], city: 'manhattan', type: 'bridge' },
      { name: 'Queensboro Bridge', aliases: ['59th Street Bridge', 'Ed Koch Bridge'], city: 'manhattan', type: 'bridge' },
      { name: 'Triborough Bridge', aliases: ['RFK Bridge'], city: 'manhattan', type: 'bridge' },
      { name: 'Verrazzano-Narrows Bridge', aliases: ['Verrazzano', 'VZ Bridge'], city: 'brooklyn', type: 'bridge' },
      { name: 'Ben Franklin Bridge', aliases: ['Ben Franklin'], city: 'philadelphia', type: 'bridge' },
      { name: 'Betsy Ross Bridge', aliases: ['Betsy Ross'], city: 'philadelphia', type: 'bridge' },
      { name: 'Walt Whitman Bridge', aliases: ['Walt Whitman'], city: 'philadelphia', type: 'bridge' },
      { name: 'Tacony-Palmyra Bridge', aliases: ['Tacony Palmyra'], city: 'philadelphia', type: 'bridge' },
      { name: 'Roberto Clemente Bridge', aliases: ['6th Street Bridge'], city: 'pittsburgh', type: 'bridge' },
      { name: 'Andy Warhol Bridge', aliases: ['7th Street Bridge'], city: 'pittsburgh', type: 'bridge' },
      { name: 'Rachel Carson Bridge', aliases: ['9th Street Bridge'], city: 'pittsburgh', type: 'bridge' },
      { name: 'Peace Bridge', aliases: ['Buffalo Peace Bridge'], city: 'buffalo', type: 'bridge' },
      { name: 'Outerbridge Crossing', aliases: ['Outerbridge'], city: 'staten island', type: 'bridge' },
      { name: 'Goethals Bridge', aliases: ['Goethals'], city: 'staten island', type: 'bridge' },
      { name: 'Bayonne Bridge', aliases: ['Bayonne'], city: 'bayonne', type: 'bridge' },

      // Tunnels
      { name: 'Lincoln Tunnel', aliases: ['Lincoln'], city: 'manhattan', type: 'tunnel' },
      { name: 'Holland Tunnel', aliases: ['Holland'], city: 'manhattan', type: 'tunnel' },
      { name: 'Queens-Midtown Tunnel', aliases: ['Queens Midtown'], city: 'manhattan', type: 'tunnel' },
      { name: 'Brooklyn-Battery Tunnel', aliases: ['Battery Tunnel', 'Hugh Carey Tunnel'], city: 'manhattan', type: 'tunnel' },
      { name: 'Lehigh Tunnel', aliases: ['PA Turnpike Tunnel'], city: 'lehigh valley', type: 'tunnel' },
      { name: 'Fort Pitt Tunnel', aliases: ['Fort Pitt'], city: 'pittsburgh', type: 'tunnel' },
      { name: 'Squirrel Hill Tunnel', aliases: ['Squirrel Hill'], city: 'pittsburgh', type: 'tunnel' },

      // Highway Interchanges
      { name: 'Spaghetti Bowl', aliases: ['I-78 I-287 Interchange'], city: 'newark', type: 'highway_interchange' },
      { name: 'Schuylkill Expressway', aliases: ['I-76 Philadelphia', 'Sure-Kill Expressway'], city: 'philadelphia', type: 'highway_interchange' },
      { name: 'Cross Bronx Expressway', aliases: ['I-95 Bronx'], city: 'bronx', type: 'highway_interchange' },
      { name: 'Long Island Expressway', aliases: ['LIE', 'I-495'], city: 'queens', type: 'highway_interchange' },
      { name: 'BQE', aliases: ['Brooklyn Queens Expressway', 'I-278'], city: 'brooklyn', type: 'highway_interchange' },
      { name: 'FDR Drive', aliases: ['FDR Highway'], city: 'manhattan', type: 'highway_interchange' },
      { name: 'West Side Highway', aliases: ['West Side'], city: 'manhattan', type: 'highway_interchange' },

      // Transit Hubs (major subway/rail intersections)
      { name: 'Times Square-42nd Street', aliases: ['Times Square Station'], city: 'manhattan', type: 'transit_hub' },
      { name: '14th Street-Union Square', aliases: ['Union Square Station'], city: 'manhattan', type: 'transit_hub' },
      { name: '59th Street-Columbus Circle', aliases: ['Columbus Circle Station'], city: 'manhattan', type: 'transit_hub' },
      { name: 'Atlantic Avenue-Barclays Center', aliases: ['Atlantic Terminal Station'], city: 'brooklyn', type: 'transit_hub' },
      { name: 'Roosevelt Avenue-Jackson Heights', aliases: ['Roosevelt Jackson Heights'], city: 'queens', type: 'transit_hub' },
      { name: 'Fulton Street', aliases: ['Fulton Center'], city: 'manhattan', type: 'transit_hub' }
    ];

    infrastructure.forEach(infra => {
      const entity: GeographicEntity = {
        name: infra.name,
        type: infra.type as any,
        aliases: infra.aliases,
        parentEntity: infra.city,
        confidence: 1.0,
        category: 'infrastructure'
      };

      this.addEntity(entity);
    });
  }

  private loadMuseumsAndTheaters(): void {
    const cultural = [
      // New York Museums
      { name: 'Metropolitan Museum of Art', aliases: ['The Met', 'Met Museum'], city: 'manhattan', type: 'museum' },
      { name: 'Museum of Modern Art', aliases: ['MoMA'], city: 'manhattan', type: 'museum' },
      { name: 'Guggenheim Museum', aliases: ['Guggenheim'], city: 'manhattan', type: 'museum' },
      { name: 'Whitney Museum', aliases: ['Whitney'], city: 'manhattan', type: 'museum' },
      { name: 'Brooklyn Museum', aliases: ['Brooklyn Museum'], city: 'brooklyn', type: 'museum' },
      { name: 'Queens Museum', aliases: ['Queens Museum'], city: 'queens', type: 'museum' },
      { name: 'Frick Collection', aliases: ['Frick'], city: 'manhattan', type: 'museum' },
      { name: 'Tenement Museum', aliases: ['Tenement'], city: 'manhattan', type: 'museum' },
      { name: 'Intrepid Sea, Air & Space Museum', aliases: ['Intrepid Museum'], city: 'manhattan', type: 'museum' },
      { name: 'American Museum of Natural History', aliases: ['Natural History Museum', 'AMNH'], city: 'manhattan', type: 'museum' },
      { name: 'Albright-Knox Art Gallery', aliases: ['Albright Knox'], city: 'buffalo', type: 'museum' },
      { name: 'Strong National Museum of Play', aliases: ['Strong Museum'], city: 'rochester', type: 'museum' },
      { name: 'Everson Museum of Art', aliases: ['Everson Museum'], city: 'syracuse', type: 'museum' },
      { name: 'New York State Museum', aliases: ['State Museum'], city: 'albany', type: 'museum' },

      // New York Theaters
      { name: 'Broadway Theater District', aliases: ['Broadway', 'Theater District'], city: 'manhattan', type: 'theater' },
      { name: 'Lincoln Center', aliases: ['Lincoln Center'], city: 'manhattan', type: 'theater' },
      { name: 'Radio City Music Hall', aliases: ['Radio City'], city: 'manhattan', type: 'theater' },
      { name: 'Apollo Theater', aliases: ['Apollo'], city: 'manhattan', type: 'theater' },
      { name: 'Brooklyn Academy of Music', aliases: ['BAM'], city: 'brooklyn', type: 'theater' },
      { name: 'Shea\'s Performing Arts Center', aliases: ['Sheas Theater'], city: 'buffalo', type: 'theater' },
      { name: 'Eastman Theatre', aliases: ['Eastman'], city: 'rochester', type: 'theater' },
      { name: 'Landmark Theatre', aliases: ['Landmark Syracuse'], city: 'syracuse', type: 'theater' },
      { name: 'Palace Theatre Albany', aliases: ['Palace Albany'], city: 'albany', type: 'theater' },

      // New Jersey Cultural
      { name: 'Newark Museum', aliases: ['Newark Museum'], city: 'newark', type: 'museum' },
      { name: 'New Jersey Performing Arts Center', aliases: ['NJPAC'], city: 'newark', type: 'theater' },
      { name: 'Princeton University Art Museum', aliases: ['Princeton Art Museum'], city: 'princeton', type: 'museum' },
      { name: 'Grounds For Sculpture', aliases: ['Sculpture Gardens'], city: 'hamilton', type: 'museum' },
      { name: 'Montclair Art Museum', aliases: ['Montclair Museum'], city: 'montclair', type: 'museum' },
      { name: 'Paper Mill Playhouse', aliases: ['Paper Mill'], city: 'millburn', type: 'theater' },
      { name: 'Count Basie Center', aliases: ['Count Basie Theater'], city: 'red bank', type: 'theater' },
      { name: 'State Theatre New Jersey', aliases: ['State Theatre NJ'], city: 'new brunswick', type: 'theater' },

      // Pennsylvania Cultural
      { name: 'Philadelphia Museum of Art', aliases: ['Philly Art Museum', 'Rocky Steps'], city: 'philadelphia', type: 'museum' },
      { name: 'Barnes Foundation', aliases: ['Barnes'], city: 'philadelphia', type: 'museum' },
      { name: 'Franklin Institute', aliases: ['Franklin Institute'], city: 'philadelphia', type: 'museum' },
      { name: 'Pennsylvania Academy of Fine Arts', aliases: ['PAFA'], city: 'philadelphia', type: 'museum' },
      { name: 'Rodin Museum', aliases: ['Rodin'], city: 'philadelphia', type: 'museum' },
      { name: 'National Constitution Center', aliases: ['Constitution Center'], city: 'philadelphia', type: 'museum' },
      { name: 'Kimmel Center', aliases: ['Kimmel'], city: 'philadelphia', type: 'theater' },
      { name: 'Academy of Music', aliases: ['Academy'], city: 'philadelphia', type: 'theater' },
      { name: 'Walnut Street Theatre', aliases: ['Walnut Street'], city: 'philadelphia', type: 'theater' },
      { name: 'Carnegie Museums of Pittsburgh', aliases: ['Carnegie Museums'], city: 'pittsburgh', type: 'museum' },  
      { name: 'Andy Warhol Museum', aliases: ['Warhol Museum'], city: 'pittsburgh', type: 'museum' },
      { name: 'Heinz History Center', aliases: ['History Center'], city: 'pittsburgh', type: 'museum' },
      { name: 'Benedum Center', aliases: ['Benedum'], city: 'pittsburgh', type: 'theater' },
      { name: 'Heinz Hall', aliases: ['Heinz Hall'], city: 'pittsburgh', type: 'theater' },
      { name: 'Allentown Art Museum', aliases: ['Allentown Museum'], city: 'allentown', type: 'museum' },
      { name: 'Hershey Theatre', aliases: ['Hershey Theater'], city: 'hershey', type: 'theater' }
    ];

    cultural.forEach(venue => {
      const entity: GeographicEntity = {
        name: venue.name,
        type: venue.type as any,
        aliases: venue.aliases,
        parentEntity: venue.city,
        confidence: 1.0,
        category: 'cultural'
      };

      this.addEntity(entity);
    });
  }

  private loadGovernmentBuildings(): void {
    const government = [
      // New York
      { name: 'New York City Hall', aliases: ['NYC City Hall'], city: 'manhattan', type: 'government_building' },
      { name: 'New York State Capitol', aliases: ['NY State Capitol'], city: 'albany', type: 'capitol' },
      { name: 'Federal Hall', aliases: ['Federal Hall'], city: 'manhattan', type: 'government_building' },
      { name: 'Brooklyn Borough Hall', aliases: ['Brooklyn City Hall'], city: 'brooklyn', type: 'government_building' },
      { name: 'Queens Borough Hall', aliases: ['Queens City Hall'], city: 'queens', type: 'government_building' },
      { name: 'Bronx Borough Hall', aliases: ['Bronx City Hall'], city: 'bronx', type: 'government_building' },
      { name: 'Staten Island Borough Hall', aliases: ['SI City Hall'], city: 'staten island', type: 'government_building' },
      { name: 'Buffalo City Hall', aliases: ['Buffalo City Hall'], city: 'buffalo', type: 'government_building' },
      { name: 'Rochester City Hall', aliases: ['Rochester City Hall'], city: 'rochester', type: 'government_building' },
      { name: 'Syracuse City Hall', aliases: ['Syracuse City Hall'], city: 'syracuse', type: 'government_building' },
      { name: 'Albany City Hall', aliases: ['Albany City Hall'], city: 'albany', type: 'government_building' },

      // New Jersey
      { name: 'New Jersey State House', aliases: ['NJ State Capitol'], city: 'trenton', type: 'capitol' },
      { name: 'Newark City Hall', aliases: ['Newark City Hall'], city: 'newark', type: 'government_building' },
      { name: 'Jersey City Hall', aliases: ['JC City Hall'], city: 'jersey city', type: 'government_building' },
      { name: 'Paterson City Hall', aliases: ['Paterson City Hall'], city: 'paterson', type: 'government_building' },
      { name: 'Elizabeth City Hall', aliases: ['Elizabeth City Hall'], city: 'elizabeth', type: 'government_building' },
      { name: 'Trenton City Hall', aliases: ['Trenton City Hall'], city: 'trenton', type: 'government_building' },
      { name: 'Camden City Hall', aliases: ['Camden City Hall'], city: 'camden', type: 'government_building' },

      // Pennsylvania
      { name: 'Pennsylvania State Capitol', aliases: ['PA State Capitol'], city: 'harrisburg', type: 'capitol' },
      { name: 'Philadelphia City Hall', aliases: ['Philly City Hall'], city: 'philadelphia', type: 'government_building' },
      { name: 'Pittsburgh City Hall', aliases: ['Pittsburgh City Hall'], city: 'pittsburgh', type: 'government_building' },
      { name: 'Allentown City Hall', aliases: ['Allentown City Hall'], city: 'allentown', type: 'government_building' },
      { name: 'Erie City Hall', aliases: ['Erie City Hall'], city: 'erie', type: 'government_building' },
      { name: 'Reading City Hall', aliases: ['Reading City Hall'], city: 'reading', type: 'government_building' },
      { name: 'Scranton City Hall', aliases: ['Scranton City Hall'], city: 'scranton', type: 'government_building' },
      { name: 'Harrisburg City Hall', aliases: ['Harrisburg City Hall'], city: 'harrisburg', type: 'government_building' },
      { name: 'Lancaster City Hall', aliases: ['Lancaster City Hall'], city: 'lancaster', type: 'government_building' },
      { name: 'York City Hall', aliases: ['York City Hall'], city: 'york', type: 'government_building' },

      // Federal Buildings & Courts
      { name: 'United States District Court SDNY', aliases: ['Federal Court Manhattan'], city: 'manhattan', type: 'government_building' },
      { name: 'Federal Building Newark', aliases: ['Federal Building NJ'], city: 'newark', type: 'government_building' },
      { name: 'Federal Building Philadelphia', aliases: ['Federal Building Philly'], city: 'philadelphia', type: 'government_building' },
      { name: 'Federal Building Pittsburgh', aliases: ['Federal Building Pittsburgh'], city: 'pittsburgh', type: 'government_building' },

      // UN & International
      { name: 'United Nations Headquarters', aliases: ['UN', 'United Nations'], city: 'manhattan', type: 'embassy' }
    ];

    government.forEach(building => {
      const entity: GeographicEntity = {
        name: building.name,
        type: building.type as any,
        aliases: building.aliases,
        parentEntity: building.city,
        confidence: 1.0,
        category: 'government'
      };

      this.addEntity(entity);
    });
  }

  private addEntity(entity: GeographicEntity): void {
    // Add primary name
    this.database.entities.set(entity.name.toLowerCase(), entity);
    
    // Add all aliases
    entity.aliases.forEach(alias => {
      this.database.entities.set(alias.toLowerCase(), entity);
    });
  }
}