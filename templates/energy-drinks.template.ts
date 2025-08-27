import { ProjectTemplate, BrandDefinition, GeographicScope, DomainVocabulary, EndpointMapping } from '../lib/migration/types';

/**
 * Energy Drinks Project Template
 * 
 * Complete template for Red Bull energy drinks market analysis project.
 * This template generates all necessary configuration files for the
 * energy drinks industry with Red Bull as the primary target brand.
 */

// Brand Definitions
const energyDrinksBrands: BrandDefinition[] = [
  {
    name: 'Red Bull',
    fieldName: 'MP12207A_B_P',
    role: 'target',
    aliases: ['red bull', 'redbull', 'energy drink', 'bull energy'],
    industry: 'Energy Drinks'
  },
  {
    name: '5-Hour Energy',
    fieldName: 'MP12205A_B_P', 
    role: 'competitor',
    aliases: ['5 hour energy', '5-hour', 'five hour energy', 'energy shot'],
    industry: 'Energy Drinks'
  },
  {
    name: 'Monster Energy',
    fieldName: 'MP12206A_B_P',
    role: 'competitor', 
    aliases: ['monster', 'monster energy', 'monster drink', 'energy monster'],
    industry: 'Energy Drinks'
  },
  {
    name: 'All Energy Drinks',
    fieldName: 'MP12097A_B_P',
    role: 'market_category',
    aliases: ['energy drinks', 'energy beverages', 'functional beverages', 'caffeinated drinks'],
    industry: 'Energy Drinks'
  }
];

// Geographic Scope
const energyDrinksGeography: GeographicScope = {
  country: 'United States',
  regions: ['West Coast', 'East Coast', 'Midwest', 'South', 'Southwest'],
  focusAreas: [
    'College towns and universities',
    'Major metropolitan areas', 
    'High convenience store density areas',
    'Fitness and gym concentrated locations',
    'Technology and startup hubs',
    'Sports and entertainment venues'
  ],
  boundaryType: 'zip'
};

// Domain Vocabulary
const energyDrinksVocabulary: DomainVocabulary = {
  primary: [
    'energy', 'drinks', 'red bull', 'monster', '5-hour', 'analysis', 
    'business', 'market', 'customer', 'caffeine', 'functional', 
    'beverage', 'consumption', 'performance'
  ],
  secondary: [
    'brand', 'consumption', 'usage', 'insights', 'patterns', 'behavior', 
    'segments', 'performance', 'models', 'predictions', 'strategy',
    'taurine', 'guarana', 'vitamins', 'sports', 'gaming', 'fitness',
    'convenience', 'retail', 'distribution', 'lifestyle'
  ],
  context: [
    'scenario', 'what if', 'weights', 'rankings', 'AI models', 'regions', 
    'territories', 'dynamics', 'factors', 'characteristics', 'trends', 
    'demographic weights', 'pricing strategy', 'resilient', 'consensus', 
    'sensitivity', 'pre-workout', 'morning energy', 'study fuel',
    'gaming boost', 'workout enhancement', 'focus', 'alertness'
  ],
  synonyms: {
    'energy drink': ['energy beverage', 'functional drink', 'performance drink', 'caffeinated beverage'],
    'red bull': ['redbull', 'red-bull', 'bull energy', 'red bull energy'],
    'monster energy': ['monster', 'monster drink', 'monster beverage'],
    '5-hour energy': ['5 hour', 'five hour energy', 'energy shot', '5-hour'],
    'consumption': ['usage', 'intake', 'drinking', 'purchasing'],
    'market': ['marketplace', 'industry', 'sector', 'segment'],
    'customer': ['consumer', 'user', 'buyer', 'purchaser'],
    'analysis': ['study', 'research', 'examination', 'assessment'],
    'performance': ['effectiveness', 'results', 'success', 'impact'],
    'what if': ['scenario', 'if', 'suppose', 'consider'],
    'pricing strategy': ['pricing approach', 'price changes', 'pricing model'],
    'most resilient': ['strongest', 'most stable', 'best positioned'],
    'adjust demographic weights': ['change weights', 'modify weights', 'weight adjustment'],
    'by 20%': ['by twenty percent', 'percentage adjustment'],
    'AI models': ['models', 'algorithms', 'predictions', 'machine learning'],
    'models agree': ['consensus', 'agreement', 'aligned predictions']
  }
};

// Endpoint Mappings with optimized routing terms
const energyDrinksEndpoints: EndpointMapping[] = [
  {
    endpoint: '/strategic-analysis',
    fields: ['strategic_score', 'MP12207A_B_P', 'GEOID', 'DESCRIPTION'],
    boostTerms: [
      'strategic', 'strategy', 'market', 'red bull', 'energy drink', 
      'business', 'competitive', 'positioning', 'expansion', 'growth',
      'market dynamics', 'business strategy', 'strategic planning'
    ],
    penaltyTerms: [
      'demographic', 'population', 'age', 'income', 'education',
      'predictions', 'accurate', 'accuracy', 'model', 'algorithm'
    ],
    confidenceThreshold: 0.4
  },
  {
    endpoint: '/competitive-analysis', 
    fields: ['competitive_score', 'MP12207A_B_P', 'MP12206A_B_P', 'MP12205A_B_P'],
    boostTerms: [
      'competitive', 'competition', 'competitor', 'red bull', 'monster', 
      '5-hour', 'vs', 'versus', 'compare', 'comparison', 'market share',
      'positioning', 'advantage', 'landscape', 'rivalry'
    ],
    penaltyTerms: [
      'demographic', 'expansion', 'opportunity', 'predictions', 
      'accurate', 'accuracy', 'model', 'performance'
    ],
    confidenceThreshold: 0.35
  },
  {
    endpoint: '/demographic-analysis',
    fields: ['demographic_score', 'MP12207A_B_P', 'population', 'age_groups'],
    boostTerms: [
      'demographic', 'demographics', 'population', 'age', 'income',
      'lifestyle', 'consumers', 'customers', 'segments', 'characteristics',
      'millennials', 'gen z', 'professionals', 'students'
    ],
    penaltyTerms: [
      'competitive', 'strategy', 'expansion', 'predictions', 'models'
    ],
    confidenceThreshold: 0.4
  },
  {
    endpoint: '/expansion-opportunity',
    fields: ['expansion_score', 'MP12207A_B_P', 'market_potential'],
    boostTerms: [
      'expansion', 'opportunity', 'opportunities', 'growth', 'new markets',
      'untapped', 'potential', 'red bull', 'energy drink', 'markets',
      'geographic expansion', 'market development'
    ],
    penaltyTerms: [
      'demographic', 'competitive', 'predictions', 'models', 'accuracy'
    ],
    confidenceThreshold: 0.4
  },
  {
    endpoint: '/market-penetration',
    fields: ['penetration_score', 'MP12207A_B_P', 'market_share'],
    boostTerms: [
      'market penetration', 'penetration', 'market share', 'coverage',
      'saturation', 'red bull', 'energy drink', 'share', 'presence',
      'market coverage', 'brand penetration'
    ],
    penaltyTerms: [
      'expansion', 'opportunity', 'competitive', 'predictions', 'models'
    ],
    confidenceThreshold: 0.4
  },
  {
    endpoint: '/customer-profile',
    fields: ['customer_score', 'MP12207A_B_P', 'customer_segments'],
    boostTerms: [
      'customer', 'customer profile', 'profile', 'profiles', 'persona',
      'personas', 'red bull', 'energy drink', 'consumers', 'users',
      'target audience', 'customer segments', 'buyer personas'
    ],
    penaltyTerms: [
      'competitive', 'expansion', 'market penetration', 'predictions'
    ],
    confidenceThreshold: 0.4
  },
  {
    endpoint: '/scenario-analysis',
    fields: ['scenario_score', 'sensitivity_metrics'],
    boostTerms: [
      'scenario', 'scenarios', 'what if', 'if', 'suppose', 'change',
      'changes', 'impact', 'strategy', 'pricing', 'resilient', 'would',
      'markets would be', 'most resilient', 'pricing strategy'
    ],
    penaltyTerms: [
      'demographic', 'competitive', 'expansion', 'customer profile'
    ],
    confidenceThreshold: 0.3
  },
  {
    endpoint: '/sensitivity-analysis', 
    fields: ['sensitivity_score', 'weight_adjustments'],
    boostTerms: [
      'sensitivity', 'adjust', 'weight', 'weights', 'parameter', 'change',
      'rankings change', 'demographic weights', 'by 20%', 'adjust demographic weights',
      'weight adjustment', 'parameter sensitivity'
    ],
    penaltyTerms: [
      'competitive', 'strategic', 'expansion', 'customer'
    ],
    confidenceThreshold: 0.3
  },
  {
    endpoint: '/consensus-analysis',
    fields: ['consensus_score', 'model_agreement'],
    boostTerms: [
      'consensus', 'agree', 'models', 'agreement', 'all', 'where',
      'AI models', 'all our models', 'models agree', 'predictions',
      'model consensus', 'algorithmic agreement'
    ],
    penaltyTerms: [
      'competitive', 'strategic', 'demographic', 'expansion'
    ],
    confidenceThreshold: 0.3
  },
  {
    endpoint: '/model-performance',
    fields: ['performance_score', 'accuracy_metrics'],
    boostTerms: [
      'performance', 'accuracy', 'accurate', 'model', 'prediction',
      'predictions', 'how accurate', 'are our predictions', 
      'market performance', 'energy drink market performance',
      'model accuracy', 'prediction quality'
    ],
    penaltyTerms: [
      'competitive', 'strategic', 'demographic', 'expansion', 'customer'
    ],
    confidenceThreshold: 0.3
  }
];

// Main Template Definition
export const EnergyDrinksTemplate: ProjectTemplate = {
  name: 'red-bull-energy-drinks',
  domain: 'beverages',
  industry: 'Energy Drinks',
  brands: energyDrinksBrands,
  geographicScope: energyDrinksGeography,
  vocabularyTerms: energyDrinksVocabulary,
  endpointMappings: energyDrinksEndpoints
};

// Template Metadata
export const EnergyDrinksTemplateMetadata = {
  version: '1.0.0',
  created: '2025-08-27',
  author: 'Migration Automation System',
  description: 'Energy drinks market analysis template with Red Bull focus',
  targetIndustry: 'Energy Drinks / Functional Beverages',
  primaryBrand: 'Red Bull',
  competitorCount: 2,
  endpointCount: 10,
  geographicScope: 'United States (ZIP code level)',
  dataFields: [
    'MP12207A_B_P (Red Bull)',
    'MP12206A_B_P (Monster Energy)', 
    'MP12205A_B_P (5-Hour Energy)',
    'MP12097A_B_P (All Energy Drinks)'
  ],
  useCase: 'Market analysis, competitive intelligence, expansion planning',
  validationStatus: 'tested',
  lastUpdated: '2025-08-27'
};

// Export for template registry
export default EnergyDrinksTemplate;

// Template validation function
export function validateEnergyDrinksTemplate(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate brand definitions
  const targetBrands = EnergyDrinksTemplate.brands.filter(b => b.role === 'target');
  if (targetBrands.length !== 1) {
    errors.push('Template must have exactly one target brand');
  }

  // Validate field names
  EnergyDrinksTemplate.brands.forEach(brand => {
    if (!brand.fieldName.match(/^MP\d+[A-Z_]*$/)) {
      warnings.push(`Brand field name '${brand.fieldName}' doesn't match expected pattern`);
    }
  });

  // Validate endpoint mappings
  const requiredEndpoints = [
    '/strategic-analysis', '/competitive-analysis', '/demographic-analysis',
    '/expansion-opportunity', '/market-penetration', '/customer-profile'
  ];
  
  const mappedEndpoints = EnergyDrinksTemplate.endpointMappings.map(m => m.endpoint);
  const missingEndpoints = requiredEndpoints.filter(e => !mappedEndpoints.includes(e));
  
  if (missingEndpoints.length > 0) {
    warnings.push(`Missing endpoint mappings: ${missingEndpoints.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors: errors.map(e => ({ code: 'VALIDATION_ERROR', message: e, severity: 'high' as const })),
    warnings: warnings.map(w => ({ code: 'VALIDATION_WARNING', message: w, impact: 'Template may not work optimally' })),
    recommendations: [
      'Test template generation before deployment',
      'Validate generated configurations against current system',
      'Backup existing configurations before applying template'
    ],
    score: errors.length === 0 ? (warnings.length === 0 ? 1.0 : 0.8) : 0.5
  };
}

interface ValidationResult {
  isValid: boolean;
  errors: Array<{code: string; message: string; severity: 'critical' | 'high' | 'medium' | 'low'}>;
  warnings: Array<{code: string; message: string; impact: string}>;
  recommendations: string[];
  score: number;
}