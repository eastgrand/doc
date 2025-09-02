/**
 * Geographic Data Manager - Quebec Province Edition
 * 
 * Manages geographic data for Quebec Province, Canada.
 * Optimized for the Housing Market Analysis project's specific geographic scope.
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
    console.log('[GeoDataManager] Initializing comprehensive Quebec Province geographic database...');
    
    // Core geographic entities
    this.loadProvinces();
    this.loadQuebecRegions();
    this.loadQuebecCities();
    this.loadQuebecMetros();
    this.aggregateFSAForHigherLevels();
    
    console.log(`[GeoDataManager] Comprehensive Quebec Province database initialized with ${this.database.entities.size} entities`);
  }

  private loadProvinces(): void {
    // Project covers Quebec Province only
    const provinces = [
      { name: 'Quebec', abbr: 'QC', aliases: ['QC', 'QUE', 'Québec', 'Province de Québec', 'La Belle Province'] }
    ];

    provinces.forEach(province => {
      const entity: GeographicEntity = {
        name: province.name,
        type: 'state',
        aliases: [province.abbr, ...province.aliases],
        confidence: 1.0
      };

      this.addEntity(entity);
      this.database.stateAbbreviations.set(province.abbr.toLowerCase(), province.name.toLowerCase());
    });
  }

  private loadQuebecRegions(): void {
    const qcRegions = [
      {
        name: 'Montréal',
        aliases: ['Montreal Region', 'Grand Montréal', 'Greater Montreal'],
        cities: ['Montreal', 'Laval', 'Longueuil', 'Terrebonne', 'Brossard', 'Saint-Jean-sur-Richelieu', 'Dollard-Des Ormeaux', 'Repentigny', 'Saint-Jérôme', 'Mirabel']
      },
      {
        name: 'Capitale-Nationale',
        aliases: ['Quebec City Region', 'National Capital Region', 'Région de Québec'],
        cities: ['Quebec City', 'Lévis', 'Sainte-Foy', 'Beauport', 'Charlesbourg', 'Ancienne-Lorette', 'Saint-Augustin-de-Desmaures']
      },
      {
        name: 'Outaouais',
        aliases: ['Outaouais Region', 'National Capital Region (Quebec)'],
        cities: ['Gatineau', 'Hull', 'Aylmer', 'Buckingham', 'Masson-Angers']
      },
      {
        name: 'Laurentides',
        aliases: ['Laurentians', 'The Laurentians'],
        cities: ['Saint-Jérôme', 'Mirabel', 'Boisbriand', 'Sainte-Thérèse', 'Blainville', 'Rosemère', 'Saint-Eustache', 'Deux-Montagnes']
      },
      {
        name: 'Montérégie',
        aliases: ['Montérégie Region', 'South Shore'],
        cities: ['Longueuil', 'Saint-Jean-sur-Richelieu', 'Brossard', 'Châteauguay', 'Granby', 'Saint-Hyacinthe', 'Sorel-Tracy', 'Valleyfield']
      },
      {
        name: 'Lanaudière',
        aliases: ['Lanaudière Region'],
        cities: ['Terrebonne', 'Repentigny', 'Mascouche', 'Joliette', 'L\'Assomption', 'Berthierville']
      }
    ];

    qcRegions.forEach(region => {
      const entity: GeographicEntity = {
        name: region.name,
        type: 'county',
        aliases: region.aliases,
        parentEntity: 'quebec',
        childEntities: region.cities.map(city => city.toLowerCase()),
        confidence: 1.0
      };

      this.addEntity(entity);
    });
  }

  private loadQuebecCities(): void {
    const qcCities = [
      // Major Quebec cities with FSA codes (Forward Sortation Areas - Canadian equivalent of ZIP codes)
      {
        name: 'Montreal',
        aliases: ['Montréal', 'MTL', 'Ville de Montréal'],
        parentRegion: 'montréal',
        fsaCodes: ['H1A', 'H1B', 'H1C', 'H1E', 'H1G', 'H1H', 'H1J', 'H1K', 'H1L', 'H1M',
                   'H1N', 'H1P', 'H1R', 'H1S', 'H1T', 'H1V', 'H1W', 'H1X', 'H1Y', 'H1Z',
                   'H2A', 'H2B', 'H2C', 'H2E', 'H2G', 'H2H', 'H2J', 'H2K', 'H2L', 'H2M',
                   'H2N', 'H2P', 'H2R', 'H2S', 'H2T', 'H2V', 'H2W', 'H2X', 'H2Y', 'H2Z',
                   'H3A', 'H3B', 'H3C', 'H3E', 'H3G', 'H3H', 'H3J', 'H3K', 'H3L', 'H3M',
                   'H3N', 'H3P', 'H3R', 'H3S', 'H3T', 'H3V', 'H3W', 'H3X', 'H3Y', 'H3Z',
                   'H4A', 'H4B', 'H4C', 'H4E', 'H4G', 'H4H', 'H4J', 'H4K', 'H4L', 'H4M',
                   'H4N', 'H4P', 'H4R', 'H4S', 'H4T', 'H4V', 'H4W', 'H4X', 'H4Y', 'H4Z']
      },
      {
        name: 'Quebec City',
        aliases: ['Québec', 'Ville de Québec', 'QC City', 'La Capitale'],
        parentRegion: 'capitale-nationale',
        fsaCodes: ['G1A', 'G1B', 'G1C', 'G1E', 'G1G', 'G1H', 'G1J', 'G1K', 'G1L', 'G1M',
                   'G1N', 'G1P', 'G1R', 'G1S', 'G1T', 'G1V', 'G1W', 'G1X', 'G1Y', 'G1Z',
                   'G2A', 'G2B', 'G2C', 'G2E', 'G2G', 'G2H', 'G2J', 'G2K', 'G2L', 'G2M']
      },
      {
        name: 'Laval',
        aliases: ['Ville de Laval', 'Île Jésus'],
        parentRegion: 'montréal',
        fsaCodes: ['H7A', 'H7B', 'H7C', 'H7E', 'H7G', 'H7H', 'H7J', 'H7K', 'H7L', 'H7M',
                   'H7N', 'H7P', 'H7R', 'H7S', 'H7T', 'H7V', 'H7W', 'H7X', 'H7Y']
      },
      {
        name: 'Gatineau',
        aliases: ['Hull', 'Aylmer', 'Buckingham', 'Masson-Angers'],
        parentRegion: 'outaouais',
        fsaCodes: ['J8A', 'J8B', 'J8C', 'J8E', 'J8G', 'J8H', 'J8J', 'J8K', 'J8L', 'J8M',
                   'J8N', 'J8P', 'J8R', 'J8S', 'J8T', 'J8V', 'J8W', 'J8X', 'J8Y', 'J8Z',
                   'J9A', 'J9B', 'J9H', 'J9J']
      },
      {
        name: 'Longueuil',
        aliases: ['Ville de Longueuil', 'South Shore'],
        parentRegion: 'montérégie',
        fsaCodes: ['J4G', 'J4H', 'J4J', 'J4K', 'J4L', 'J4M', 'J4N', 'J4P', 'J4R', 'J4S',
                   'J4T', 'J4V', 'J4W', 'J4X', 'J4Y', 'J4Z']
      },
      {
        name: 'Sherbrooke',
        aliases: ['Ville de Sherbrooke'],
        parentRegion: 'estrie',
        fsaCodes: ['J1C', 'J1E', 'J1G', 'J1H', 'J1J', 'J1K', 'J1L', 'J1M', 'J1N', 'J1R', 'J1S']
      },
      {
        name: 'Lévis',
        aliases: ['Ville de Lévis'],
        parentRegion: 'capitale-nationale',
        fsaCodes: ['G6A', 'G6B', 'G6C', 'G6E', 'G6G', 'G6H', 'G6J', 'G6K', 'G6L', 'G6P',
                   'G6R', 'G6S', 'G6V', 'G6W', 'G6X', 'G6Y', 'G6Z']
      },
      {
        name: 'Trois-Rivières',
        aliases: ['Ville de Trois-Rivières', 'TR'],
        parentRegion: 'mauricie',
        fsaCodes: ['G8A', 'G8B', 'G8C', 'G8E', 'G8G', 'G8H', 'G8J', 'G8K', 'G8L', 'G8M',
                   'G8N', 'G8P', 'G8T', 'G8V', 'G8W', 'G8X', 'G8Y', 'G8Z', 'G9A', 'G9B']
      },
      {
        name: 'Terrebonne',
        aliases: ['Ville de Terrebonne'],
        parentRegion: 'lanaudière',
        fsaCodes: ['J6W', 'J6X', 'J6Y', 'J6Z', 'J7M']
      },
      {
        name: 'Saint-Jean-sur-Richelieu',
        aliases: ['Saint-Jean', 'SJSR'],
        parentRegion: 'montérégie',
        fsaCodes: ['J2W', 'J2X', 'J2Y', 'J3A', 'J3B']
      },
      {
        name: 'Repentigny',
        aliases: ['Ville de Repentigny'],
        parentRegion: 'lanaudière',
        fsaCodes: ['J5Y', 'J5Z', 'J6A']
      },
      {
        name: 'Brossard',
        aliases: ['Ville de Brossard'],
        parentRegion: 'montérégie',
        fsaCodes: ['J4B', 'J4W', 'J4X', 'J4Y', 'J4Z']
      }
    ];

    qcCities.forEach(city => {
      const entity: GeographicEntity = {
        name: city.name,
        type: 'city',
        aliases: city.aliases,
        parentEntity: city.parentRegion,
        zipCodes: city.fsaCodes,
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Map each FSA to this city
      city.fsaCodes.forEach(fsa => {
        this.database.zipCodeToCity.set(fsa, city.name.toLowerCase());
        this.database.zipCodeToState.set(fsa, 'quebec');
        if (city.parentRegion) {
          this.database.zipCodeToCounty.set(fsa, city.parentRegion.toLowerCase());
        }
      });
    });
  }

  private loadQuebecMetros(): void {
    const qcMetros = [
      {
        name: 'Greater Montreal',
        aliases: ['Grand Montréal', 'Montreal Metropolitan Area', 'CMA Montreal'],
        cities: ['montreal', 'laval', 'longueuil', 'terrebonne', 'brossard', 'saint-jean-sur-richelieu', 
                 'repentigny', 'dollard-des ormeaux', 'saint-jérôme', 'mirabel']
      },
      {
        name: 'Quebec City Metropolitan Area',
        aliases: ['Communauté métropolitaine de Québec', 'CMA Quebec City'],
        cities: ['quebec city', 'lévis', 'sainte-foy', 'beauport', 'charlesbourg']
      },
      {
        name: 'Gatineau-Ottawa Metro',
        aliases: ['National Capital Region', 'NCR', 'Région de la capitale nationale'],
        cities: ['gatineau', 'hull', 'aylmer', 'buckingham']
      }
    ];

    qcMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'metro',
        aliases: metro.aliases,
        parentEntity: 'quebec',
        childEntities: metro.cities,
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Map metro to FSA codes through its cities
      metro.cities.forEach(cityName => {
        const cityEntity = this.database.entities.get(cityName);
        if (cityEntity && cityEntity.zipCodes) {
          cityEntity.zipCodes.forEach(fsa => {
            this.database.zipCodeToMetro.set(fsa, metro.name.toLowerCase());
          });
        }
      });
    });
  }

  private aggregateFSAForHigherLevels(): void {
    // Aggregate FSA codes from cities to regions (counties)
    for (const [fsa, cityName] of this.database.zipCodeToCity) {
      const city = this.database.entities.get(cityName);
      if (city && city.parentEntity) {
        const region = this.database.entities.get(city.parentEntity);
        if (region) {
          if (!region.zipCodes) {
            region.zipCodes = [];
          }
          if (!region.zipCodes.includes(fsa)) {
            region.zipCodes.push(fsa);
          }
        }
      }
    }

    console.log('[GeoDataManager] FSA aggregation complete for Quebec regions');
  }

  private addEntity(entity: GeographicEntity): void {
    const key = entity.name.toLowerCase();
    this.database.entities.set(key, entity);
    
    // Add aliases to the alias map
    entity.aliases.forEach(alias => {
      this.database.aliasMap.set(alias.toLowerCase(), key);
    });
    
    console.log(`[GeoDataManager] Added entity: ${entity.name} (${entity.type}) with ${entity.aliases.length} aliases`);
  }
}