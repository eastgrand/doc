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
    
    // Demographics
    income: {
      keywords: ['income', 'earnings', 'salary', 'wealth', 'affluent', 'rich', 'poor'],
      fields: ['Income', 'MEDDI_CY', 'AVGHINC_CY', 'WLTHINDXCY'],
      description: 'Income and wealth indicators'
    },
    age: {
      keywords: ['age', 'young', 'old', 'millennial', 'gen z', 'boomer', 'elderly'],
      fields: ['Age', 'MEDAGE_CY'],
      description: 'Age demographics'
    },
    population: {
      keywords: ['population', 'people', 'residents', 'density'],
      fields: ['TOTPOP_CY', 'HHPOP_CY', 'FAMPOP_CY'],
      description: 'Population metrics'
    },
    race: {
      keywords: ['race', 'ethnicity', 'asian', 'black', 'white', 'hispanic', 'latino', 'diverse', 'diversity'],
      fields: ['ASIAN_CY', 'BLACK_CY', 'WHITE_CY', 'HISPAI_CY', 'OTHRACE_CY'],
      description: 'Racial and ethnic demographics'
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
    '/correlation-analysis': {
      primaryKeywords: ['correlation', 'correlate', 'statistical relationship'],
      contextKeywords: ['what relates to', 'statistical correlation'],
      avoidTerms: ['compare', 'versus', 'difference', 'trend', 'demographic'],
      weight: 0.3 // Heavily penalized to avoid overuse
    }
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
    const intents = {
      comparison: ['compare', 'versus', 'vs', 'between', 'difference'],
      ranking: ['top', 'best', 'highest', 'lowest', 'rank'],
      location: ['where', 'which areas', 'which markets', 'which cities'],
      analysis: ['analyze', 'show', 'what', 'how'],
      trend: ['trend', 'growth', 'change', 'momentum'],
      demographic: ['who', 'demographic', 'population', 'age', 'income']
    };

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

    // Income/demographic bonuses
    if (fields.includes('income') || fields.includes('age')) {
      if (endpoint === '/demographic-insights') {
        bonus += 2;
        reasons.push('Demographic fields mentioned');
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

    for (const [key, mapping] of Object.entries(this.FIELD_MAPPINGS)) {
      if (mapping.keywords.some(kw => lowerQuery.includes(kw))) {
        mapping.fields.forEach(field => {
          fields.push({ field, description: mapping.description });
        });
      }
    }

    return fields;
  }
}