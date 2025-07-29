/**
 * EnhancedQueryAnalyzer - Dramatically improved natural language query processing
 * 
 * Features:
 * - Field-aware routing based on actual data fields
 * - Lifestyle and activity term recognition (yoga, fitness, gym, etc.)
 * - Smarter endpoint selection avoiding correlation overuse
 * - Brand and demographic term expansion
 * - Context-aware keyword matching
 */

interface FieldMapping {
  keywords: string[];
  fields: string[];
  description: string;
}

interface EndpointScore {
  endpoint: string;
  score: number;
  reasons: string[];
}

export class EnhancedQueryAnalyzer {
  // Comprehensive field mappings based on actual data
  private readonly FIELD_MAPPINGS: Record<string, FieldMapping> = {
    // Brand mappings
    nike: {
      keywords: ['nike', 'swoosh'],
      fields: ['MP30034A_B', 'MP30034A_B_P'],
      description: 'Nike athletic shoes purchased'
    },
    adidas: {
      keywords: ['adidas', 'three stripes'],
      fields: ['MP30029A_B', 'MP30029A_B_P'],
      description: 'Adidas athletic shoes purchased'
    },
    jordan: {
      keywords: ['jordan', 'air jordan', 'jumpman'],
      fields: ['MP30032A_B', 'MP30032A_B_P'],
      description: 'Jordan athletic shoes purchased'
    },
    newBalance: {
      keywords: ['new balance', 'nb'],
      fields: ['MP30033A_B', 'MP30033A_B_P'],
      description: 'New Balance athletic shoes purchased'
    },
    puma: {
      keywords: ['puma'],
      fields: ['MP30035A_B', 'MP30035A_B_P'],
      description: 'Puma athletic shoes purchased'
    },
    converse: {
      keywords: ['converse', 'chuck taylor', 'all star'],
      fields: ['MP30031A_B', 'MP30031A_B_P'],
      description: 'Converse athletic shoes purchased'
    },
    asics: {
      keywords: ['asics'],
      fields: ['MP30030A_B', 'MP30030A_B_P'],
      description: 'ASICS athletic shoes purchased'
    },
    
    // Athletic activity mappings
    running: {
      keywords: ['running', 'jogging', 'marathon', 'runner', 'jog'],
      fields: ['MP30021A_B', 'MP30021A_B_P'],
      description: 'Running or jogging shoes purchased'
    },
    athletic: {
      keywords: ['athletic', 'sports', 'training', 'workout', 'exercise'],
      fields: ['MP30016A_B', 'MP30016A_B_P'],
      description: 'Athletic footwear purchased'
    },

    // === EXPANDED DEMOGRAPHIC MAPPINGS - 100% FIELD COVERAGE ===
    
    // Generational Demographics
    genZ: {
      keywords: ['gen z', 'generation z', 'genz', 'young adults', 'digital natives', 'zoomer', 'zoomers'],
      fields: ['value_GENZ_CY', 'value_GENZ_CY_P'],
      description: 'Generation Z population (born 1997-2012)'
    },
    millennial: {
      keywords: ['millennial', 'millennials', 'gen y', 'generation y', 'echo boomers'],
      fields: ['value_MILLENN_CY', 'value_MILLENN_CY_P'], 
      description: 'Millennial population (born 1981-1996)'
    },
    genAlpha: {
      keywords: ['gen alpha', 'generation alpha', 'alpha generation', 'youngest generation'],
      fields: ['value_GENALPHACY', 'value_GENALPHACY_P'],
      description: 'Generation Alpha population (born 2013+)'
    },

    // Extended Racial/Ethnic Demographics
    americanIndian: {
      keywords: ['american indian', 'native american', 'indigenous', 'tribal', 'first nations'],
      fields: ['value_AMERIND_CY', 'value_AMERIND_CY_P'],
      description: 'American Indian/Alaska Native population'
    },
    pacificIslander: {
      keywords: ['pacific islander', 'hawaiian', 'pacific', 'polynesian', 'micronesian', 'melanesian'],
      fields: ['value_PACIFIC_CY', 'value_PACIFIC_CY_P'],
      description: 'Native Hawaiian and Pacific Islander population'
    },
    multiRace: {
      keywords: ['multi race', 'mixed race', 'biracial', 'multiracial', 'two or more races'],
      fields: ['value_RACE2UP_CY', 'value_RACE2UP_CY_P'],
      description: 'Population of two or more races'
    },
    otherRace: {
      keywords: ['other race', 'some other race', 'other ethnicity'],
      fields: ['value_OTHRACE_CY', 'value_OTHRACE_CY_P'],
      description: 'Population of some other race'
    },

    // Hispanic Subgroups
    hispanicAsian: {
      keywords: ['hispanic asian', 'latino asian', 'hispanic asian american'],
      fields: ['value_HISPAI_CY', 'value_HISPAI_CY_P'],
      description: 'Hispanic or Latino Asian population'
    },
    hispanicBlack: {
      keywords: ['hispanic black', 'afro latino', 'afro hispanic', 'latino black'],
      fields: ['value_HISPBLK_CY', 'value_HISPBLK_CY_P'],
      description: 'Hispanic or Latino Black population'
    },
    hispanicWhite: {
      keywords: ['hispanic white', 'white hispanic', 'white latino'],
      fields: ['value_HISPWHT_CY', 'value_HISPWHT_CY_P'],
      description: 'Hispanic or Latino White population'
    },
    hispanicPacific: {
      keywords: ['hispanic pacific islander', 'latino pacific islander'],
      fields: ['value_HISPPI_CY', 'value_HISPPI_CY_P'],
      description: 'Hispanic or Latino Pacific Islander population'
    },
    hispanicOther: {
      keywords: ['hispanic other race', 'latino other race'],
      fields: ['value_HISPOTH_CY', 'value_HISPOTH_CY_P'],
      description: 'Hispanic or Latino other race population'
    },

    // Economic Indicators  
    medianIncome: {
      keywords: ['median income', 'median household income', 'middle income', 'median earnings'],
      fields: ['value_MEDDI_CY'],
      description: 'Median disposable income'
    },
    wealthIndex: {
      keywords: ['wealth index', 'wealth score', 'affluence index', 'wealth indicator'],
      fields: ['value_WLTHINDXCY'],
      description: 'Wealth index indicator'
    },
    diversityIndex: {
      keywords: ['diversity index', 'diversity score', 'ethnic diversity', 'racial diversity'],
      fields: ['value_DIVINDX_CY'],
      description: 'Diversity index measure'
    },

    // Geographic/Administrative
    zipDescription: {
      keywords: ['zip description', 'area description', 'location description', 'zip code name'],
      fields: ['value_DESCRIPTION'],
      description: 'ZIP code area description'
    },
    surveyData: {
      keywords: ['survey data', 'survey response', 'market research data'],
      fields: ['value_PSIV7UMKVALM'],
      description: 'Survey and market research data'
    },
    locationData: {
      keywords: ['location data', 'geographic data', 'spatial data'],
      fields: ['value_X9051_X', 'value_X9051_X_A'],
      description: 'Geographic location and spatial data'
    },
    
    // Updated Legacy Demographics (using correct field names)
    income: {
      keywords: ['income', 'earnings', 'salary', 'wealth', 'affluent', 'rich', 'poor'],
      fields: ['value_MEDDI_CY', 'value_WLTHINDXCY'],
      description: 'Income and wealth indicators'
    },
    age: {
      keywords: ['age', 'young', 'old', 'elderly', 'senior'],
      fields: ['Age'],
      description: 'Age demographics'
    },
    totalPopulation: {
      keywords: ['total population', 'population total', 'overall population'],
      fields: ['TOTPOP_CY'],
      description: 'Total population count'
    },
    householdPopulation: {
      keywords: ['household population', 'people in households', 'household residents'],
      fields: ['value_HHPOP_CY', 'value_HHPOP_CY_P'],
      description: 'Population living in households'
    },
    familyPopulation: {
      keywords: ['family population', 'people in families', 'family residents'],
      fields: ['value_FAMPOP_CY', 'value_FAMPOP_CY_P'],
      description: 'Population living in family households'
    },
    
    // Brand fields with value_ prefix
    nikeBrand: {
      keywords: ['nike brand data', 'nike value', 'nike field'],
      fields: ['value_MP30034A_B', 'value_MP30034A_B_P'],
      description: 'Nike brand purchase data (value fields)'
    },
    adidasBrand: {
      keywords: ['adidas brand data', 'adidas value', 'adidas field'],
      fields: ['value_MP30029A_B', 'value_MP30029A_B_P'],
      description: 'Adidas brand purchase data (value fields)'
    },
    jordanBrand: {
      keywords: ['jordan brand data', 'jordan value', 'jordan field'],
      fields: ['value_MP30032A_B', 'value_MP30032A_B_P'],
      description: 'Jordan brand purchase data (value fields)'
    },

    // Complete demographic value fields
    asianValue: {
      keywords: ['asian value', 'asian data field', 'asian demographics field'],
      fields: ['value_ASIAN_CY', 'value_ASIAN_CY_P'],
      description: 'Asian population data (value fields)'
    },
    blackValue: {
      keywords: ['black value', 'black data field', 'african american field'],
      fields: ['value_BLACK_CY', 'value_BLACK_CY_P'],
      description: 'Black population data (value fields)'
    },
    whiteValue: {
      keywords: ['white value', 'white data field', 'white demographics field'],
      fields: ['value_WHITE_CY', 'value_WHITE_CY_P'],
      description: 'White population data (value fields)'
    },

    // Administrative fields
    recordId: {
      keywords: ['record id', 'identifier', 'unique id', 'row id'],
      fields: ['ID'],
      description: 'Record identifier'
    },
    
    // Lifestyle indicators (inferred from purchase patterns)
    fitness: {
      keywords: ['fitness', 'fit', 'health', 'healthy', 'wellness', 'active'],
      fields: ['MP30016A_B', 'MP30021A_B'], // Athletic footwear as proxy
      description: 'Fitness and health lifestyle indicators'
    },
    yoga: {
      keywords: ['yoga', 'pilates', 'mindfulness', 'meditation'],
      fields: ['MP30018A_B', 'MP30018A_B_P'], // General athletic participation
      description: 'Yoga and wellness activities'
    },
    gym: {
      keywords: ['gym', 'workout', 'weightlifting', 'crossfit', 'training'],
      fields: ['MP30016A_B', 'MP30019A_B'], // Athletic footwear usage
      description: 'Gym and training activities'
    },

    // === SHAP EXPLANATORY FIELDS - ADVANCED ANALYTICS ===
    
    // SHAP Demographic Explanations
    shapAsian: {
      keywords: ['shap asian', 'asian influence', 'asian factor', 'asian contribution', 'asian impact'],
      fields: ['shap_ASIAN_CY', 'shap_ASIAN_CY_P'],
      description: 'SHAP values for Asian population influence on predictions'
    },
    shapBlack: {
      keywords: ['shap black', 'black influence', 'black factor', 'black contribution', 'african american impact'],
      fields: ['shap_BLACK_CY', 'shap_BLACK_CY_P'],
      description: 'SHAP values for Black population influence on predictions'
    },
    shapWhite: {
      keywords: ['shap white', 'white influence', 'white factor', 'white contribution', 'caucasian impact'],
      fields: ['shap_WHITE_CY', 'shap_WHITE_CY_P'],
      description: 'SHAP values for White population influence on predictions'
    },
    shapHispanic: {
      keywords: ['shap hispanic', 'hispanic influence', 'latino factor', 'hispanic contribution'],
      fields: ['shap_HISPAI_CY', 'shap_HISPAI_CY_P'],
      description: 'SHAP values for Hispanic/Latino population influence'
    },
    shapAmericanIndian: {
      keywords: ['shap american indian', 'native american influence', 'indigenous factor'],
      fields: ['shap_AMERIND_CY', 'shap_AMERIND_CY_P'],
      description: 'SHAP values for American Indian population influence'
    },

    // SHAP Generational Explanations
    shapGenZ: {
      keywords: ['shap gen z', 'gen z influence', 'generation z factor', 'young adult impact'],
      fields: ['shap_GENZ_CY', 'shap_GENZ_CY_P'],
      description: 'SHAP values for Generation Z influence on predictions'
    },
    shapMillennial: {
      keywords: ['shap millennial', 'millennial influence', 'gen y factor', 'millennial impact'],
      fields: ['shap_MILLENN_CY', 'shap_MILLENN_CY_P'],
      description: 'SHAP values for Millennial population influence'
    },
    shapGenAlpha: {
      keywords: ['shap gen alpha', 'generation alpha influence', 'alpha factor'],
      fields: ['shap_GENALPHACY', 'shap_GENALPHACY_P'],
      description: 'SHAP values for Generation Alpha influence'
    },

    // SHAP Population Explanations
    shapHouseholdPop: {
      keywords: ['shap household', 'household influence', 'household factor', 'family impact'],
      fields: ['shap_HHPOP_CY', 'shap_HHPOP_CY_P'],
      description: 'SHAP values for household population influence'
    },
    shapFamilyPop: {
      keywords: ['shap family', 'family influence', 'family factor', 'family structure impact'],
      fields: ['shap_FAMPOP_CY', 'shap_FAMPOP_CY_P'],
      description: 'SHAP values for family population influence'
    },

    // SHAP Economic Explanations
    shapIncome: {
      keywords: ['shap income', 'income influence', 'income factor', 'economic impact'],
      fields: ['shap_MEDDI_CY'],
      description: 'SHAP values for median income influence on predictions'
    },
    shapWealth: {
      keywords: ['shap wealth', 'wealth influence', 'wealth factor', 'affluence impact'],
      fields: ['shap_WLTHINDXCY'],
      description: 'SHAP values for wealth index influence'
    },
    shapDiversity: {
      keywords: ['shap diversity', 'diversity influence', 'diversity factor', 'ethnic diversity impact'],
      fields: ['shap_DIVINDX_CY'],
      description: 'SHAP values for diversity index influence'
    },

    // SHAP Brand Explanations  
    shapNike: {
      keywords: ['shap nike', 'nike influence', 'nike factor', 'nike impact', 'nike shap values'],
      fields: ['shap_MP30034A_B', 'shap_MP30034A_B_P'],
      description: 'SHAP values for Nike brand influence on predictions'
    },
    shapAdidas: {
      keywords: ['shap adidas', 'adidas influence', 'adidas factor', 'adidas impact'],
      fields: ['shap_MP30029A_B', 'shap_MP30029A_B_P'],
      description: 'SHAP values for Adidas brand influence'
    },
    shapJordan: {
      keywords: ['shap jordan', 'jordan influence', 'air jordan factor', 'jordan impact'],
      fields: ['shap_MP30032A_B', 'shap_MP30032A_B_P'],
      description: 'SHAP values for Jordan brand influence'
    },

    // SHAP Metadata (for debugging/technical queries)
    shapAge: {
      keywords: ['shap age', 'age influence', 'age factor', 'age impact on prediction'],
      fields: ['shap_Age'],
      description: 'SHAP values for age influence on predictions'
    },
    shapDescription: {
      keywords: ['shap description', 'location shap', 'area shap', 'geographic shap'],
      fields: ['shap_DESCRIPTION'],
      description: 'SHAP values for geographic description influence'
    },
    shapCreation: {
      keywords: ['shap creation', 'creation date influence', 'temporal factor'],
      fields: ['shap_CreationDate'],
      description: 'SHAP values for data creation date influence'
    },

    // Additional SHAP Hispanic Subgroup Explanations
    shapHispanicBlack: {
      keywords: ['shap hispanic black', 'afro latino influence', 'hispanic black factor'],
      fields: ['shap_HISPBLK_CY', 'shap_HISPBLK_CY_P'],
      description: 'SHAP values for Hispanic Black population influence'
    },
    shapHispanicWhite: {
      keywords: ['shap hispanic white', 'white hispanic influence', 'hispanic white factor'],
      fields: ['shap_HISPWHT_CY', 'shap_HISPWHT_CY_P'],
      description: 'SHAP values for Hispanic White population influence'
    },
    shapHispanicOther: {
      keywords: ['shap hispanic other', 'hispanic other race influence', 'latino other factor'],
      fields: ['shap_HISPOTH_CY', 'shap_HISPOTH_CY_P'],
      description: 'SHAP values for Hispanic Other Race population influence'
    },
    shapHispanicPacific: {
      keywords: ['shap hispanic pacific', 'hispanic pacific islander influence'],
      fields: ['shap_HISPPI_CY', 'shap_HISPPI_CY_P'],
      description: 'SHAP values for Hispanic Pacific Islander influence'
    },

    // Additional SHAP Racial Explanations
    shapOtherRace: {
      keywords: ['shap other race', 'other race influence', 'some other race factor'],
      fields: ['shap_OTHRACE_CY', 'shap_OTHRACE_CY_P'],
      description: 'SHAP values for Other Race population influence'
    },
    shapPacific: {
      keywords: ['shap pacific islander', 'pacific islander influence', 'hawaiian factor'],
      fields: ['shap_PACIFIC_CY', 'shap_PACIFIC_CY_P'],
      description: 'SHAP values for Pacific Islander population influence'
    },
    shapMultiRace: {
      keywords: ['shap multi race', 'multiracial influence', 'two or more races factor'],
      fields: ['shap_RACE2UP_CY', 'shap_RACE2UP_CY_P'],
      description: 'SHAP values for multiracial population influence'
    },

    // SHAP Technical/Administrative Fields
    shapSurvey: {
      keywords: ['shap survey', 'survey influence', 'market research factor'],
      fields: ['shap_PSIV7UMKVALM'],
      description: 'SHAP values for survey data influence'
    },
    shapLocation: {
      keywords: ['shap location', 'geographic shap', 'spatial factor'],
      fields: ['shap_X9051_X', 'shap_X9051_X_A'],
      description: 'SHAP values for geographic location influence'
    },
    shapThematic: {
      keywords: ['shap thematic', 'thematic value influence', 'thematic factor'],
      fields: ['shap_thematic_value'],
      description: 'SHAP values for thematic analysis influence'
    },
    shapIncomeField: {
      keywords: ['shap income field', 'income shap factor', 'earnings influence'],
      fields: ['shap_Income'],
      description: 'SHAP values for income field influence'
    },

    // SHAP Administrative Metadata
    shapCreator: {
      keywords: ['shap creator', 'creator influence', 'data creator factor'],
      fields: ['shap_Creator'],
      description: 'SHAP values for data creator influence'
    },
    shapEditor: {
      keywords: ['shap editor', 'editor influence', 'data editor factor'],
      fields: ['shap_Editor'],
      description: 'SHAP values for data editor influence'
    },
    shapEditDate: {
      keywords: ['shap edit date', 'edit date influence', 'modification factor'],
      fields: ['shap_EditDate'],
      description: 'SHAP values for edit date influence'
    }
  };

  // Enhanced endpoint configurations with better keyword matching
  private readonly ENDPOINT_CONFIGS = {
    '/strategic-analysis': {
      primaryKeywords: ['strategic', 'strategy', 'expansion', 'invest', 'investment', 'growth', 'opportunity', 'best markets', 'top markets'],
      contextKeywords: ['nike expansion', 'market opportunity', 'strategic value'],
      avoidTerms: [],
      weight: 1.0
    },
    '/competitive-analysis': {
      primaryKeywords: ['competitive', 'competition', 'compete', 'market share', 'brand position', 'dominance'],
      contextKeywords: ['nike vs', 'versus', 'against', 'compare to'],
      avoidTerms: ['difference', 'percent'],
      weight: 0.9
    },
    '/brand-difference': {
      primaryKeywords: ['difference', 'percent difference', 'gap', 'lead', 'delta'],
      contextKeywords: ['nike vs adidas', 'brand difference', 'market share difference'],
      avoidTerms: [],
      weight: 1.1
    },
    '/demographic-insights': {
      primaryKeywords: ['demographic', 'demographics', 'population', 'age', 'income', 'race', 'ethnicity'],
      contextKeywords: ['customer demographics', 'demographic opportunity', 'demographic score'],
      avoidTerms: [],
      weight: 1.0
    },
    '/customer-profile': {
      primaryKeywords: ['customer', 'profile', 'persona', 'lifestyle', 'behavior', 'values', 'psychographic'],
      contextKeywords: ['ideal customer', 'target customer', 'customer fit'],
      avoidTerms: [],
      weight: 1.0
    },
    '/comparative-analysis': {
      primaryKeywords: ['compare', 'comparison', 'between', 'cities', 'regions'],
      contextKeywords: ['brooklyn vs', 'compare performance', 'city comparison'],
      avoidTerms: ['correlation'],
      weight: 0.95
    },
    '/trend-analysis': {
      primaryKeywords: ['trend', 'trending', 'growth', 'decline', 'change over time', 'momentum'],
      contextKeywords: ['growth trends', 'market trends', 'trending up'],
      avoidTerms: [],
      weight: 0.9
    },
  };

  /**
   * Analyze query and return the best endpoint with detailed reasoning
   */
  public analyzeQuery(query: string): EndpointScore[] {
    const lowerQuery = query.toLowerCase();
    const scores: EndpointScore[] = [];

    // First, identify what fields/concepts are mentioned
    const mentionedFields = this.identifyMentionedFields(lowerQuery);
    const mentionedBrands = this.identifyBrands(lowerQuery);
    const queryIntent = this.identifyQueryIntent(lowerQuery);

    // Score each endpoint
    for (const [endpoint, config] of Object.entries(this.ENDPOINT_CONFIGS)) {
      let score = 0;
      const reasons: string[] = [];

      // Check primary keywords
      const primaryMatches = config.primaryKeywords.filter(kw => 
        this.smartMatch(lowerQuery, kw)
      );
      if (primaryMatches.length > 0) {
        score += primaryMatches.length * 3 * config.weight;
        reasons.push(`Primary keywords: ${primaryMatches.join(', ')}`);
      }

      // Check context keywords
      const contextMatches = config.contextKeywords.filter(kw => 
        lowerQuery.includes(kw)
      );
      if (contextMatches.length > 0) {
        score += contextMatches.length * 2 * config.weight;
        reasons.push(`Context matches: ${contextMatches.join(', ')}`);
      }

      // Penalty for avoid terms
      const avoidMatches = config.avoidTerms.filter(term => 
        lowerQuery.includes(term)
      );
      if (avoidMatches.length > 0) {
        score -= avoidMatches.length * 2;
        reasons.push(`Avoid terms present: ${avoidMatches.join(', ')}`);
      }

      // Special handling based on query intent
      score += this.applyIntentBonus(endpoint, queryIntent, reasons);

      // Field-specific bonuses
      score += this.applyFieldBonus(endpoint, mentionedFields, mentionedBrands, reasons);

      scores.push({ endpoint, score, reasons });
    }

    // Sort by score descending
    return scores.sort((a, b) => b.score - a.score);
  }

  /**
   * Get the best endpoint for a query
   */
  public getBestEndpoint(query: string): string {
    const scores = this.analyzeQuery(query);
    
    // Default to strategic-analysis if no good match
    if (scores.length === 0 || scores[0].score <= 0) {
      return '/strategic-analysis';
    }

    return scores[0].endpoint;
  }

  /**
   * Identify mentioned fields in the query
   */
  private identifyMentionedFields(query: string): string[] {
    const mentioned: string[] = [];

    for (const [key, mapping] of Object.entries(this.FIELD_MAPPINGS)) {
      if (mapping.keywords.some(kw => query.includes(kw))) {
        mentioned.push(key);
      }
    }

    return mentioned;
  }

  /**
   * Identify mentioned brands
   */
  private identifyBrands(query: string): string[] {
    const brands = ['nike', 'adidas', 'jordan', 'puma', 'newBalance', 'converse', 'asics'];
    return brands.filter(brand => 
      this.FIELD_MAPPINGS[brand].keywords.some(kw => query.includes(kw))
    );
  }

  /**
   * Identify the primary intent of the query
   */
  private identifyQueryIntent(query: string): string {
    // Check for relationship questions first (more specific)
    if (query.includes('relationship') || 
        (query.includes('relate') && !query.includes('unrelated')) ||
        query.includes('influence') ||
        query.includes('affect') ||
        query.includes('factor')) {
      return 'relationship';
    }

    const intents = {
      comparison: ['compare', 'versus', 'vs', 'difference'], // Removed 'between' from here
      ranking: ['top', 'best', 'highest', 'lowest', 'rank'],
      location: ['where', 'which areas', 'which markets', 'which cities'],
      analysis: ['analyze', 'show', 'what', 'how'],
      trend: ['trend', 'growth', 'change', 'momentum'],
      demographic: ['who', 'demographic', 'population', 'age', 'income']
    };

    // Special handling for 'between' - only comparison if it's city vs city
    if (query.includes('between')) {
      // Check if it's comparing specific locations/cities
      const locationPatterns = [
        /between\s+[A-Z][a-z]+\s+and\s+[A-Z][a-z]+/, // "between Boston and NYC"
        /between\s+\w+\s+vs?\s+\w+/  // "between NYC vs Boston"
      ];
      
      if (locationPatterns.some(pattern => pattern.test(query))) {
        return 'comparison';
      } else {
        // "between demographics and preference" = relationship
        return 'relationship';
      }
    }

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(kw => query.includes(kw))) {
        return intent;
      }
    }

    return 'analysis';
  }

  /**
   * Smart keyword matching with word boundaries
   */
  private smartMatch(query: string, keyword: string): boolean {
    // Create word boundary regex for better matching
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(query);
  }

  /**
   * Apply bonus based on query intent
   */
  private applyIntentBonus(endpoint: string, intent: string, reasons: string[]): number {
    const intentBonuses: Record<string, Record<string, number>> = {
      comparison: {
        '/comparative-analysis': 3,
        '/brand-difference': 2,
        '/competitive-analysis': 1
      },
      ranking: {
        '/strategic-analysis': 3,
        '/competitive-analysis': 2,
        '/demographic-insights': 1
      },
      demographic: {
        '/demographic-insights': 3,
        '/customer-profile': 2
      },
      trend: {
        '/trend-analysis': 3
      },
      relationship: {  // New intent for relationship questions
        '/demographic-insights': 3,
        '/strategic-analysis': 2,
        '/customer-profile': 1
      }
    };

    const bonus = intentBonuses[intent]?.[endpoint] || 0;
    if (bonus > 0) {
      reasons.push(`Intent bonus: ${intent} (+${bonus})`);
    }

    return bonus;
  }

  /**
   * Apply bonus based on mentioned fields
   */
  private applyFieldBonus(
    endpoint: string, 
    fields: string[], 
    brands: string[], 
    reasons: string[]
  ): number {
    let bonus = 0;

    // Brand-specific bonuses
    if (brands.length > 0) {
      if (endpoint === '/competitive-analysis' && brands.length >= 2) {
        bonus += 2;
        reasons.push(`Multiple brands mentioned: ${brands.join(', ')}`);
      }
      if (endpoint === '/brand-difference' && brands.length >= 2) {
        bonus += 3;
        reasons.push(`Brand comparison context: ${brands.join(' vs ')}`);
      }
    }

    // Lifestyle/activity bonuses
    const lifestyleFields = ['fitness', 'yoga', 'gym', 'running', 'athletic'];
    const hasLifestyle = fields.some(f => lifestyleFields.includes(f));
    
    if (hasLifestyle) {
      if (endpoint === '/customer-profile') {
        bonus += 2;
        reasons.push('Lifestyle indicators present');
      }
      if (endpoint === '/demographic-insights') {
        bonus += 1;
        reasons.push('Activity demographics mentioned');
      }
    }

    // Expanded demographic bonuses for new fields
    const demographicFields = [
      'income', 'age', 'genZ', 'millennial', 'genAlpha', 'asian', 'black', 'white', 
      'americanIndian', 'pacificIslander', 'multiRace', 'otherRace', 'hispanicAsian', 
      'hispanicBlack', 'hispanicWhite', 'hispanicPacific', 'hispanicOther', 
      'medianIncome', 'wealthIndex', 'diversityIndex', 'totalPopulation', 
      'householdPopulation', 'familyPopulation'
    ];
    const hasDemographics = fields.some(f => demographicFields.includes(f));
    
    if (hasDemographics) {
      if (endpoint === '/demographic-insights') {
        bonus += 2;
        reasons.push('Demographic fields mentioned');
      }
      if (endpoint === '/customer-profile') {
        bonus += 1;
        reasons.push('Demographic profiling relevant');
      }
    }

    // SHAP explanatory field bonuses for advanced analytics
    const shapFields = [
      'shapAsian', 'shapBlack', 'shapWhite', 'shapHispanic', 'shapAmericanIndian',
      'shapGenZ', 'shapMillennial', 'shapGenAlpha', 'shapIncome', 'shapWealth',
      'shapDiversity', 'shapNike', 'shapAdidas', 'shapJordan'
    ];
    const hasShap = fields.some(f => shapFields.includes(f));
    
    if (hasShap) {
      if (endpoint === '/feature-interactions') {
        bonus += 3;
        reasons.push('SHAP explanatory analysis requested');
      }
      if (endpoint === '/demographic-insights') {
        bonus += 2;
        reasons.push('SHAP demographic factors mentioned');
      }
    }

    return bonus;
  }

  /**
   * Get field information for a query
   */
  public getQueryFields(query: string): Array<{field: string, description: string}> {
    const lowerQuery = query.toLowerCase();
    const fields: Array<{field: string, description: string}> = [];

    for (const mapping of Object.values(this.FIELD_MAPPINGS)) {
      if (mapping.keywords.some(kw => lowerQuery.includes(kw))) {
        mapping.fields.forEach(field => {
          fields.push({ field, description: mapping.description });
        });
      }
    }

    return fields;
  }
}