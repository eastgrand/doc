/**
 * Geographic Data Manager - California Edition
 * 
 * Manages geographic data for California.
 * Optimized for the Red Bull Energy Drinks project's specific geographic scope.
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
    console.log('[GeoDataManager] Initializing comprehensive California geographic database...');
    
    // Core geographic entities
    this.loadStates();
    this.loadCaliforniaCounties();
    this.loadCaliforniaCities();
    this.loadCaliforniaMetros();
    this.aggregateZipCodesForHigherLevels();
    
    console.log(`[GeoDataManager] Comprehensive California database initialized with ${this.database.entities.size} entities`);
  }

  private loadStates(): void {
    // Project covers California only
    const states = [
      { name: 'California', abbr: 'CA', aliases: ['CA', 'Golden State', 'Cali', 'Calif'] }
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

  private loadCaliforniaCounties(): void {
    const caCounties = [
      {
        name: 'Los Angeles County',
        aliases: ['Los Angeles', 'LA County', 'LAC'],
        cities: ['Los Angeles', 'Long Beach', 'Pasadena', 'Glendale', 'Santa Monica', 'Burbank', 'Torrance', 'Pomona', 'West Covina', 'Lancaster', 'Palmdale', 'El Monte']
      },
      {
        name: 'San Diego County',
        aliases: ['San Diego', 'SD County'],
        cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon', 'Vista', 'San Marcos', 'Encinitas', 'National City', 'La Mesa']
      },
      {
        name: 'Orange County',
        aliases: ['OC', 'The OC', 'Orange'],
        cities: ['Anaheim', 'Santa Ana', 'Irvine', 'Huntington Beach', 'Garden Grove', 'Fullerton', 'Orange', 'Costa Mesa', 'Mission Viejo', 'Westminster', 'Newport Beach']
      },
      {
        name: 'Riverside County',
        aliases: ['Riverside'],
        cities: ['Riverside', 'Moreno Valley', 'Corona', 'Temecula', 'Murrieta', 'Menifee', 'Hemet', 'Perris', 'Indio', 'Palm Desert', 'Lake Elsinore']
      },
      {
        name: 'San Bernardino County',
        aliases: ['San Bernardino', 'SB County'],
        cities: ['San Bernardino', 'Fontana', 'Rancho Cucamonga', 'Ontario', 'Victorville', 'Rialto', 'Hesperia', 'Chino', 'Chino Hills', 'Upland', 'Apple Valley']
      },
      {
        name: 'Santa Clara County',
        aliases: ['Santa Clara', 'Silicon Valley'],
        cities: ['San Jose', 'Santa Clara', 'Sunnyvale', 'Mountain View', 'Palo Alto', 'Cupertino', 'Milpitas', 'Campbell', 'Los Gatos', 'Saratoga']
      },
      {
        name: 'Alameda County',
        aliases: ['Alameda'],
        cities: ['Oakland', 'Fremont', 'Hayward', 'Berkeley', 'San Leandro', 'Livermore', 'Pleasanton', 'Alameda', 'Union City', 'Dublin']
      },
      {
        name: 'Sacramento County',
        aliases: ['Sacramento', 'Sac County'],
        cities: ['Sacramento', 'Elk Grove', 'Citrus Heights', 'Folsom', 'Rancho Cordova', 'Galt', 'Isleton']
      },
      {
        name: 'Contra Costa County',
        aliases: ['Contra Costa'],
        cities: ['Concord', 'Richmond', 'Antioch', 'Walnut Creek', 'San Ramon', 'Pittsburg', 'Brentwood', 'Danville', 'Martinez', 'Pleasant Hill']
      },
      {
        name: 'Fresno County',
        aliases: ['Fresno'],
        cities: ['Fresno', 'Clovis', 'Sanger', 'Selma', 'Reedley', 'Parlier', 'Coalinga', 'Kingsburg']
      },
      {
        name: 'San Francisco County',
        aliases: ['San Francisco', 'SF County', 'San Francisco City and County'],
        cities: ['San Francisco']
      },
      {
        name: 'Ventura County',
        aliases: ['Ventura'],
        cities: ['Oxnard', 'Thousand Oaks', 'Simi Valley', 'Ventura', 'Camarillo', 'Moorpark', 'Santa Paula', 'Port Hueneme', 'Fillmore', 'Ojai']
      },
      {
        name: 'Kern County',
        aliases: ['Kern'],
        cities: ['Bakersfield', 'Delano', 'Ridgecrest', 'Wasco', 'Shafter', 'Arvin', 'Tehachapi', 'California City']
      },
      {
        name: 'San Mateo County',
        aliases: ['San Mateo'],
        cities: ['Daly City', 'San Mateo', 'Redwood City', 'South San Francisco', 'San Bruno', 'Pacifica', 'Menlo Park', 'Foster City', 'Burlingame', 'Millbrae']
      },
      {
        name: 'San Joaquin County',
        aliases: ['San Joaquin'],
        cities: ['Stockton', 'Tracy', 'Manteca', 'Lodi', 'Lathrop', 'Ripon', 'Escalon']
      },
      {
        name: 'Stanislaus County',
        aliases: ['Stanislaus'],
        cities: ['Modesto', 'Turlock', 'Ceres', 'Oakdale', 'Patterson', 'Riverbank', 'Waterford', 'Hughson']
      },
      {
        name: 'Sonoma County',
        aliases: ['Sonoma'],
        cities: ['Santa Rosa', 'Petaluma', 'Rohnert Park', 'Windsor', 'Healdsburg', 'Sebastopol', 'Sonoma', 'Cloverdale']
      },
      {
        name: 'Tulare County',
        aliases: ['Tulare'],
        cities: ['Visalia', 'Tulare', 'Porterville', 'Dinuba', 'Lindsay', 'Exeter', 'Farmersville']
      },
      {
        name: 'Solano County',
        aliases: ['Solano'],
        cities: ['Vallejo', 'Fairfield', 'Vacaville', 'Suisun City', 'Benicia', 'Dixon', 'Rio Vista']
      },
      {
        name: 'Monterey County',
        aliases: ['Monterey'],
        cities: ['Salinas', 'Seaside', 'Marina', 'Monterey', 'Soledad', 'Greenfield', 'Pacific Grove', 'Carmel-by-the-Sea']
      },
      {
        name: 'Placer County',
        aliases: ['Placer'],
        cities: ['Roseville', 'Rocklin', 'Lincoln', 'Auburn', 'Colfax', 'Loomis']
      },
      {
        name: 'San Luis Obispo County',
        aliases: ['San Luis Obispo', 'SLO County'],
        cities: ['San Luis Obispo', 'Paso Robles', 'Atascadero', 'Arroyo Grande', 'Pismo Beach', 'Morro Bay', 'Grover Beach']
      },
      {
        name: 'Santa Barbara County',
        aliases: ['Santa Barbara'],
        cities: ['Santa Barbara', 'Santa Maria', 'Lompoc', 'Goleta', 'Carpinteria', 'Solvang', 'Guadalupe']
      },
      {
        name: 'Merced County',
        aliases: ['Merced'],
        cities: ['Merced', 'Los Banos', 'Atwater', 'Livingston', 'Dos Palos', 'Gustine']
      },
      {
        name: 'Marin County',
        aliases: ['Marin'],
        cities: ['San Rafael', 'Novato', 'San Anselmo', 'Mill Valley', 'Larkspur', 'Corte Madera', 'Fairfax', 'Sausalito', 'Tiburon']
      },
      {
        name: 'Butte County',
        aliases: ['Butte'],
        cities: ['Chico', 'Oroville', 'Paradise', 'Gridley', 'Biggs']
      },
      {
        name: 'Yolo County',
        aliases: ['Yolo'],
        cities: ['Davis', 'Woodland', 'West Sacramento', 'Winters']
      },
      {
        name: 'El Dorado County',
        aliases: ['El Dorado'],
        cities: ['South Lake Tahoe', 'Placerville']
      },
      {
        name: 'Imperial County',
        aliases: ['Imperial'],
        cities: ['El Centro', 'Calexico', 'Brawley', 'Imperial', 'Calipatria', 'Holtville', 'Westmorland']
      },
      {
        name: 'Shasta County',
        aliases: ['Shasta'],
        cities: ['Redding', 'Anderson', 'Shasta Lake']
      },
      {
        name: 'Madera County',
        aliases: ['Madera'],
        cities: ['Madera', 'Chowchilla']
      },
      {
        name: 'Kings County',
        aliases: ['Kings'],
        cities: ['Hanford', 'Lemoore', 'Corcoran', 'Avenal']
      }
    ];

    caCounties.forEach(county => {
      const entity: GeographicEntity = {
        name: county.name,
        type: 'county',
        aliases: county.aliases,
        parentEntity: 'california',
        childEntities: county.cities.map(city => city.toLowerCase()),
        confidence: 1.0
      };

      this.addEntity(entity);
      
      // Counties will get their ZIP codes aggregated from cities
    });
  }

  private loadCaliforniaCities(): void {
    const caCities = [
      // Major cities with ZIP codes - California's largest metropolitan areas
      {
        name: 'Los Angeles',
        aliases: ['LA', 'L.A.', 'City of Angels', 'LAX'],
        parentCounty: 'los angeles county',
        zipCodes: ['90001', '90002', '90003', '90004', '90005', '90006', '90007', '90008',
                   '90010', '90011', '90012', '90013', '90014', '90015', '90016', '90017',
                   '90018', '90019', '90020', '90021', '90022', '90023', '90024', '90025',
                   '90026', '90027', '90028', '90029', '90031', '90032', '90033', '90034',
                   '90035', '90036', '90037', '90038', '90039', '90040', '90041', '90042',
                   '90043', '90044', '90045', '90046', '90047', '90048', '90049', '90057',
                   '90058', '90059', '90061', '90062', '90063', '90064', '90065', '90066',
                   '90067', '90068', '90069', '90071', '90077', '90089', '90090', '90094',
                   '90095']
      },
      {
        name: 'San Diego',
        aliases: ['SD', 'America\'s Finest City', 'SAN'],
        parentCounty: 'san diego county',
        zipCodes: ['92101', '92102', '92103', '92104', '92105', '92106', '92107', '92108',
                   '92109', '92110', '92111', '92113', '92114', '92115', '92116', '92117',
                   '92118', '92119', '92120', '92121', '92122', '92123', '92124', '92126',
                   '92127', '92128', '92129', '92130', '92131', '92132', '92134', '92135',
                   '92139', '92140', '92145', '92147', '92152', '92154', '92155']
      },
      {
        name: 'San Jose',
        aliases: ['SJ', 'Capital of Silicon Valley'],
        parentCounty: 'santa clara county',
        zipCodes: ['95101', '95103', '95106', '95108', '95109', '95110', '95111', '95112',
                   '95113', '95115', '95116', '95117', '95118', '95119', '95120', '95121',
                   '95122', '95123', '95124', '95125', '95126', '95127', '95128', '95129',
                   '95130', '95131', '95132', '95133', '95134', '95135', '95136', '95138',
                   '95139', '95140', '95141', '95148']
      },
      {
        name: 'San Francisco',
        aliases: ['SF', 'San Fran', 'The City', 'SFO', 'Bay City'],
        parentCounty: 'san francisco county',
        zipCodes: ['94102', '94103', '94104', '94105', '94107', '94108', '94109', '94110',
                   '94111', '94112', '94114', '94115', '94116', '94117', '94118', '94119',
                   '94120', '94121', '94122', '94123', '94124', '94125', '94126', '94127',
                   '94128', '94129', '94130', '94131', '94132', '94133', '94134']
      },
      {
        name: 'Fresno',
        aliases: ['The Raisin Capital'],
        parentCounty: 'fresno county',
        zipCodes: ['93650', '93701', '93702', '93703', '93704', '93705', '93706', '93707',
                   '93708', '93709', '93710', '93711', '93712', '93714', '93715', '93716',
                   '93717', '93718', '93720', '93721', '93722', '93723', '93724', '93725',
                   '93726', '93727', '93728']
      },
      {
        name: 'Sacramento',
        aliases: ['Sac', 'Sactown', 'The Capital'],
        parentCounty: 'sacramento county',
        zipCodes: ['94203', '94204', '94205', '94206', '94207', '94208', '94209', '94211',
                   '94229', '94230', '94232', '94234', '94235', '94236', '94237', '94239',
                   '94240', '94244', '94245', '94247', '94248', '94249', '94250', '94252',
                   '94254', '94256', '94257', '94258', '94259', '94261', '94262', '94263',
                   '95814', '95815', '95816', '95817', '95818', '95819', '95820', '95821',
                   '95822', '95823', '95824', '95825', '95826', '95827', '95828', '95829',
                   '95830', '95831', '95832', '95833', '95834', '95835', '95836', '95837',
                   '95838', '95840', '95841', '95842', '95843']
      },
      {
        name: 'Long Beach',
        aliases: ['LBC', 'The LBC'],
        parentCounty: 'los angeles county',
        zipCodes: ['90801', '90802', '90803', '90804', '90805', '90806', '90807', '90808',
                   '90809', '90810', '90813', '90814', '90815', '90822', '90831', '90832',
                   '90833', '90834', '90835', '90840', '90842', '90844', '90845', '90846',
                   '90847', '90848', '90853']
      },
      {
        name: 'Oakland',
        aliases: ['The Town', 'Oaktown'],
        parentCounty: 'alameda county',
        zipCodes: ['94601', '94602', '94603', '94604', '94605', '94606', '94607', '94608',
                   '94609', '94610', '94611', '94612', '94613', '94614', '94615', '94617',
                   '94618', '94619', '94620', '94621', '94622', '94623', '94624', '94649',
                   '94659', '94660', '94661', '94662']
      },
      {
        name: 'Bakersfield',
        aliases: ['Bako', 'California\'s Country Music Capital'],
        parentCounty: 'kern county',
        zipCodes: ['93301', '93302', '93303', '93304', '93305', '93306', '93307', '93308',
                   '93309', '93311', '93312', '93313', '93314', '93380', '93383', '93384',
                   '93385', '93386', '93387', '93388', '93389', '93390']
      },
      {
        name: 'Anaheim',
        aliases: ['Home of Disneyland'],
        parentCounty: 'orange county',
        zipCodes: ['92801', '92802', '92803', '92804', '92805', '92806', '92807', '92808',
                   '92809', '92812', '92814', '92815', '92816', '92817', '92825', '92850',
                   '92899']
      },
      {
        name: 'Santa Ana',
        aliases: ['Downtown OC'],
        parentCounty: 'orange county',
        zipCodes: ['92701', '92702', '92703', '92704', '92705', '92706', '92707', '92708',
                   '92711', '92712', '92728', '92735', '92799']
      },
      {
        name: 'Riverside',
        aliases: ['City of Arts & Innovation'],
        parentCounty: 'riverside county',
        zipCodes: ['92501', '92502', '92503', '92504', '92505', '92506', '92507', '92508',
                   '92509', '92513', '92514', '92515', '92516', '92517', '92518', '92519',
                   '92521', '92522']
      },
      {
        name: 'Stockton',
        aliases: ['Port City', 'Mudville'],
        parentCounty: 'san joaquin county',
        zipCodes: ['95201', '95202', '95203', '95204', '95205', '95206', '95207', '95208',
                   '95209', '95210', '95211', '95212', '95213', '95214', '95215', '95219',
                   '95267', '95269']
      },
      {
        name: 'Irvine',
        aliases: ['Master-Planned City'],
        parentCounty: 'orange county',
        zipCodes: ['92602', '92603', '92604', '92606', '92612', '92614', '92616', '92617',
                   '92618', '92619', '92620', '92623', '92650', '92697']
      },
      {
        name: 'Chula Vista',
        aliases: ['Beautiful View'],
        parentCounty: 'san diego county',
        zipCodes: ['91909', '91910', '91911', '91912', '91913', '91914', '91915', '91921']
      },
      {
        name: 'Fremont',
        aliases: ['Innovation Capital'],
        parentCounty: 'alameda county',
        zipCodes: ['94536', '94537', '94538', '94539', '94555']
      },
      {
        name: 'San Bernardino',
        aliases: ['SB', 'Gate City'],
        parentCounty: 'san bernardino county',
        zipCodes: ['92401', '92402', '92403', '92404', '92405', '92406', '92407', '92408',
                   '92410', '92411', '92412', '92413', '92414', '92415', '92418', '92423',
                   '92424', '92427']
      },
      {
        name: 'Modesto',
        aliases: ['City of Great Neighbors'],
        parentCounty: 'stanislaus county',
        zipCodes: ['95350', '95351', '95352', '95353', '95354', '95355', '95356', '95357',
                   '95358', '95397']
      },
      {
        name: 'Fontana',
        aliases: ['City of Action'],
        parentCounty: 'san bernardino county',
        zipCodes: ['92335', '92336', '92337']
      },
      {
        name: 'Oxnard',
        aliases: ['Gateway to the Channel Islands'],
        parentCounty: 'ventura county',
        zipCodes: ['93030', '93031', '93032', '93033', '93034', '93035', '93036']
      },
      {
        name: 'Moreno Valley',
        aliases: ['MoVal'],
        parentCounty: 'riverside county',
        zipCodes: ['92551', '92552', '92553', '92554', '92555', '92556', '92557']
      },
      {
        name: 'Glendale',
        aliases: ['Jewel City'],
        parentCounty: 'los angeles county',
        zipCodes: ['91201', '91202', '91203', '91204', '91205', '91206', '91207', '91208',
                   '91209', '91210', '91214', '91221', '91222', '91224', '91225', '91226']
      },
      {
        name: 'Huntington Beach',
        aliases: ['Surf City USA', 'HB'],
        parentCounty: 'orange county',
        zipCodes: ['92605', '92615', '92646', '92647', '92648', '92649']
      },
      {
        name: 'Santa Rosa',
        aliases: ['The City Designed for Living'],
        parentCounty: 'sonoma county',
        zipCodes: ['95401', '95402', '95403', '95404', '95405', '95406', '95407', '95409']
      },
      {
        name: 'Ontario',
        aliases: ['Model Colony'],
        parentCounty: 'san bernardino county',
        zipCodes: ['91758', '91761', '91762', '91764']
      },
      {
        name: 'Rancho Cucamonga',
        aliases: ['RC', 'The Rancho'],
        parentCounty: 'san bernardino county',
        zipCodes: ['91701', '91729', '91730', '91737', '91739']
      },
      {
        name: 'Santa Clarita',
        aliases: ['SCV'],
        parentCounty: 'los angeles county',
        zipCodes: ['91350', '91351', '91354', '91355', '91380', '91381', '91382', '91383',
                   '91384', '91385', '91386', '91387', '91390']
      },
      {
        name: 'Garden Grove',
        aliases: ['GG'],
        parentCounty: 'orange county',
        zipCodes: ['92840', '92841', '92842', '92843', '92844', '92845', '92846']
      },
      {
        name: 'Oceanside',
        aliases: ['O\'side'],
        parentCounty: 'san diego county',
        zipCodes: ['92003', '92049', '92051', '92052', '92054', '92055', '92056', '92057',
                   '92058']
      },
      {
        name: 'Lancaster',
        aliases: ['The Antelope Valley'],
        parentCounty: 'los angeles county',
        zipCodes: ['93534', '93535', '93536', '93539', '93584', '93586']
      },
      {
        name: 'Palmdale',
        aliases: ['Aerospace Capital of America'],
        parentCounty: 'los angeles county',
        zipCodes: ['93550', '93551', '93552', '93590', '93591', '93599']
      },
      {
        name: 'Salinas',
        aliases: ['Salad Bowl of the World'],
        parentCounty: 'monterey county',
        zipCodes: ['93901', '93902', '93905', '93906', '93907', '93908', '93912', '93915']
      },
      {
        name: 'Hayward',
        aliases: ['Heart of the Bay'],
        parentCounty: 'alameda county',
        zipCodes: ['94540', '94541', '94542', '94543', '94544', '94545', '94557']
      },
      {
        name: 'Corona',
        aliases: ['Circle City'],
        parentCounty: 'riverside county',
        zipCodes: ['92877', '92878', '92879', '92880', '92881', '92882', '92883']
      },
      {
        name: 'Sunnyvale',
        aliases: ['Heart of Silicon Valley'],
        parentCounty: 'santa clara county',
        zipCodes: ['94085', '94086', '94087', '94088', '94089']
      },
      {
        name: 'Pasadena',
        aliases: ['Crown City', 'City of Roses'],
        parentCounty: 'los angeles county',
        zipCodes: ['91101', '91102', '91103', '91104', '91105', '91106', '91107', '91108',
                   '91109', '91110', '91114', '91115', '91116', '91117', '91118', '91121',
                   '91123', '91124', '91125', '91126', '91129', '91182', '91184', '91185',
                   '91188', '91189']
      },
      {
        name: 'Pomona',
        aliases: ['P-Town'],
        parentCounty: 'los angeles county',
        zipCodes: ['91766', '91767', '91768', '91769']
      },
      {
        name: 'Escondido',
        aliases: ['Hidden Valley'],
        parentCounty: 'san diego county',
        zipCodes: ['92025', '92026', '92027', '92029', '92030', '92033', '92046']
      },
      {
        name: 'Torrance',
        aliases: ['Balanced City'],
        parentCounty: 'los angeles county',
        zipCodes: ['90501', '90502', '90503', '90504', '90505', '90506', '90507', '90508',
                   '90509', '90510']
      },
      {
        name: 'Roseville',
        aliases: ['Rose-Villa'],
        parentCounty: 'placer county',
        zipCodes: ['95661', '95678', '95746', '95747']
      },
      {
        name: 'Visalia',
        aliases: ['Gateway to the Sequoias'],
        parentCounty: 'tulare county',
        zipCodes: ['93277', '93278', '93279', '93290', '93291', '93292']
      },
      {
        name: 'Fullerton',
        aliases: ['The Education Community'],
        parentCounty: 'orange county',
        zipCodes: ['92831', '92832', '92833', '92834', '92835', '92836', '92837', '92838']
      },
      {
        name: 'Concord',
        aliases: ['The City of Diablo'],
        parentCounty: 'contra costa county',
        zipCodes: ['94518', '94519', '94520', '94521', '94522', '94523', '94524', '94527',
                   '94529']
      },
      {
        name: 'Thousand Oaks',
        aliases: ['T.O.'],
        parentCounty: 'ventura county',
        zipCodes: ['91319', '91320', '91358', '91359', '91360', '91361', '91362']
      },
      {
        name: 'Simi Valley',
        aliases: ['Simi'],
        parentCounty: 'ventura county',
        zipCodes: ['93062', '93063', '93064', '93065', '93094', '93099']
      },
      {
        name: 'Vallejo',
        aliases: ['V-Town'],
        parentCounty: 'solano county',
        zipCodes: ['94589', '94590', '94591', '94592']
      },
      {
        name: 'Victorville',
        aliases: ['VV', 'Victor Valley'],
        parentCounty: 'san bernardino county',
        zipCodes: ['92392', '92393', '92394', '92395']
      },
      {
        name: 'Berkeley',
        aliases: ['Berserkeley', 'Berkeley of the West'],
        parentCounty: 'alameda county',
        zipCodes: ['94701', '94702', '94703', '94704', '94705', '94706', '94707', '94708',
                   '94709', '94710', '94712', '94720']
      },
      {
        name: 'Fairfield',
        aliases: ['Heart of Solano County'],
        parentCounty: 'solano county',
        zipCodes: ['94533', '94534', '94535', '94585']
      },
      {
        name: 'Santa Barbara',
        aliases: ['The American Riviera', 'SB'],
        parentCounty: 'santa barbara county',
        zipCodes: ['93101', '93102', '93103', '93105', '93106', '93107', '93108', '93109',
                   '93110', '93111', '93116', '93117', '93118', '93119', '93120', '93121',
                   '93130', '93140', '93150', '93160', '93190', '93199']
      },
      {
        name: 'Carlsbad',
        aliases: ['Village by the Sea'],
        parentCounty: 'san diego county',
        zipCodes: ['92008', '92009', '92010', '92011', '92013', '92018']
      },
      {
        name: 'Richmond',
        aliases: ['The Iron Triangle'],
        parentCounty: 'contra costa county',
        zipCodes: ['94801', '94802', '94803', '94804', '94805', '94806', '94807', '94808',
                   '94820', '94850']
      },
      {
        name: 'Antioch',
        aliases: ['Gateway to the Delta'],
        parentCounty: 'contra costa county',
        zipCodes: ['94509', '94531']
      },
      {
        name: 'Downey',
        aliases: ['Birthplace of Apollo Space Program'],
        parentCounty: 'los angeles county',
        zipCodes: ['90239', '90240', '90241', '90242']
      },
      {
        name: 'Costa Mesa',
        aliases: ['City of the Arts'],
        parentCounty: 'orange county',
        zipCodes: ['92626', '92627', '92628']
      },
      {
        name: 'Temecula',
        aliases: ['Wine Country'],
        parentCounty: 'riverside county',
        zipCodes: ['92589', '92590', '92591', '92592', '92593']
      },
      {
        name: 'Murrieta',
        aliases: ['Gem of the Valley'],
        parentCounty: 'riverside county',
        zipCodes: ['92562', '92563', '92564']
      },
      {
        name: 'Ventura',
        aliases: ['San Buenaventura'],
        parentCounty: 'ventura county',
        zipCodes: ['93001', '93002', '93003', '93004', '93005', '93006', '93007', '93009']
      },
      {
        name: 'West Covina',
        aliases: ['WestCo'],
        parentCounty: 'los angeles county',
        zipCodes: ['91790', '91791', '91792', '91793']
      },
      {
        name: 'Norwalk',
        aliases: ['City of Norwalk'],
        parentCounty: 'los angeles county',
        zipCodes: ['90650', '90651', '90652']
      },
      {
        name: 'San Mateo',
        aliases: ['City of San Mateo'],
        parentCounty: 'san mateo county',
        zipCodes: ['94401', '94402', '94403', '94404', '94497']
      },
      {
        name: 'Daly City',
        aliases: ['DC', 'Gateway to the Peninsula'],
        parentCounty: 'san mateo county',
        zipCodes: ['94013', '94014', '94015', '94016', '94017']
      },
      {
        name: 'Clovis',
        aliases: ['Gateway to the Sierras'],
        parentCounty: 'fresno county',
        zipCodes: ['93611', '93612', '93613', '93619']
      },
      {
        name: 'Burbank',
        aliases: ['Media Capital of the World'],
        parentCounty: 'los angeles county',
        zipCodes: ['91501', '91502', '91503', '91504', '91505', '91506', '91507', '91508',
                   '91510', '91521', '91522', '91523', '91526']
      },
      {
        name: 'El Monte',
        aliases: ['End of the Santa Fe Trail'],
        parentCounty: 'los angeles county',
        zipCodes: ['91731', '91732', '91733', '91734', '91735']
      },
      {
        name: 'Inglewood',
        aliases: ['City of Champions'],
        parentCounty: 'los angeles county',
        zipCodes: ['90301', '90302', '90303', '90304', '90305', '90306', '90307', '90308',
                   '90309', '90310', '90311', '90312']
      },
      {
        name: 'San Leandro',
        aliases: ['The Cherry City'],
        parentCounty: 'alameda county',
        zipCodes: ['94577', '94578', '94579']
      },
      {
        name: 'Rialto',
        aliases: ['Bridge City'],
        parentCounty: 'san bernardino county',
        zipCodes: ['92376', '92377']
      },
      {
        name: 'Chico',
        aliases: ['City of Roses'],
        parentCounty: 'butte county',
        zipCodes: ['95926', '95927', '95928', '95929', '95973', '95976']
      },
      {
        name: 'Redding',
        aliases: ['Upstate California Hub'],
        parentCounty: 'shasta county',
        zipCodes: ['96001', '96002', '96003', '96049', '96099']
      }
    ];

    caCities.forEach(city => {
      const entity: GeographicEntity = {
        name: city.name,
        type: 'city',
        aliases: city.aliases,
        parentEntity: city.parentCounty || 'california',
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

  private loadCaliforniaMetros(): void {
    const caMetros = [
      {
        name: 'Greater Los Angeles Area',
        aliases: ['LA Metro', 'Los Angeles Metropolitan Area', 'Greater LA', 'Southland'],
        childEntities: ['Los Angeles County', 'Orange County', 'Ventura County']
      },
      {
        name: 'San Francisco Bay Area',
        aliases: ['Bay Area', 'SF Bay Area', 'San Francisco Metro', 'The Bay'],
        childEntities: ['San Francisco County', 'Santa Clara County', 'Alameda County', 'San Mateo County', 'Contra Costa County', 'Marin County', 'Solano County', 'Sonoma County']
      },
      {
        name: 'San Diego Metro',
        aliases: ['Greater San Diego', 'San Diego Metropolitan Area', 'San Diego-Tijuana'],
        childEntities: ['San Diego County']
      },
      {
        name: 'Inland Empire',
        aliases: ['IE', 'Riverside-San Bernardino-Ontario', 'Greater San Bernardino'],
        childEntities: ['Riverside County', 'San Bernardino County']
      },
      {
        name: 'Greater Sacramento',
        aliases: ['Sacramento Metro', 'Sacramento Valley', 'Capital Region'],
        childEntities: ['Sacramento County', 'Placer County', 'El Dorado County', 'Yolo County']
      },
      {
        name: 'Central Valley',
        aliases: ['San Joaquin Valley', 'Central California', 'Great Central Valley'],
        childEntities: ['Fresno County', 'Kern County', 'San Joaquin County', 'Stanislaus County', 'Tulare County', 'Merced County', 'Madera County', 'Kings County']
      },
      {
        name: 'Central Coast',
        aliases: ['California Central Coast', 'SLO Region'],
        childEntities: ['San Luis Obispo County', 'Santa Barbara County', 'Monterey County']
      },
      {
        name: 'North Coast',
        aliases: ['Redwood Empire', 'North Bay'],
        childEntities: ['Sonoma County', 'Marin County']
      },
      {
        name: 'North State',
        aliases: ['Northern California', 'Superior California'],
        childEntities: ['Shasta County', 'Butte County']
      },
      {
        name: 'Imperial Valley',
        aliases: ['Desert Region', 'Colorado Desert'],
        childEntities: ['Imperial County']
      },
      {
        name: 'Antelope Valley',
        aliases: ['High Desert', 'AV'],
        childEntities: ['Los Angeles County'] // Northern LA County
      }
    ];

    caMetros.forEach(metro => {
      const entity: GeographicEntity = {
        name: metro.name,
        type: 'metro',
        aliases: metro.aliases,
        parentEntity: 'california',
        childEntities: metro.childEntities?.map(child => child.toLowerCase()) || [],
        confidence: 1.0
      };

      this.addEntity(entity);
    });
  }

  private aggregateZipCodesForHigherLevels(): void {
    console.log('[GeoDataManager] Aggregating ZIP codes for counties, metros, and state...');

    // Aggregate ZIP codes for counties from their child cities
    for (const [, entity] of this.database.entities) {
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
    for (const [, entity] of this.database.entities) {
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

    // Map all ZIP codes to California state
    for (const [zip] of this.database.zipCodeToCity) {
      this.database.zipCodeToState.set(zip, 'california');
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