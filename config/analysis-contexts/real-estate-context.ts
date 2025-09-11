import { AnalysisContext } from './base-context';

/**
 * Real Estate Analysis Configuration
 * Optimized for Quebec housing market analysis with household income and demographic data
 */
export const REAL_ESTATE_CONTEXT: AnalysisContext = {
  projectType: 'real-estate',
  domain: 'Quebec Housing Market Analysis',
  
  fieldMappings: {
    primaryMetric: ['thematic_value', 'ECYHRIAVG', 'household_income', 'value'],
    secondaryMetrics: ['ECYCDOOWCO', 'ECYPTAPOP', 'population', 'total_population', 'median_income'],
    populationField: ['ECYPTAPOP', 'population', 'total_population'],
    incomeField: ['ECYHRIAVG', 'thematic_value', 'household_income', 'median_income'],
    geographicId: ['ID', 'FSA_ID', 'area_id', 'zipcode'],
    descriptiveFields: ['DESCRIPTION', 'area_name', 'name']
  },
  
  terminology: {
    entityType: 'geographic areas',
    metricName: 'household income levels',
    scoreDescription: 'economic prosperity and housing market strength',
    comparisonContext: 'regional housing market performance'
  },
  
  scoreRanges: {
    excellent: { 
      min: 75, 
      description: 'Premium housing markets with exceptional economic indicators',
      actionable: 'Ideal for luxury developments and high-end investments'
    },
    good: { 
      min: 50, 
      description: 'Strong housing markets with above-average economic performance',
      actionable: 'Suitable for quality residential projects and solid investments'
    },
    moderate: { 
      min: 25, 
      description: 'Developing housing markets with moderate economic activity',
      actionable: 'Opportunities for affordable housing and emerging market strategies'
    },
    poor: { 
      min: 0, 
      description: 'Challenging markets requiring development or revitalization',
      actionable: 'Consider government partnerships or community development initiatives'
    }
  },
  
  summaryTemplates: {
    analysisTitle: '🏠 Real Estate Market Comparative Analysis',
    methodologyExplanation: 'This analysis compares {metricName} across {entityType} using household income and demographic data on a unified 0-100 scale.',
    insightPatterns: [
      'Average household income across analyzed {entityType}: ${avgIncome}',
      '{cityCount} cities analyzed with {totalAreas} total {entityType}',
      'Income distribution shows {distributionPattern} across regions',
      '{excellentCount} {entityType} identified as premium markets',
      '{goodCount} {entityType} show strong investment potential',
      'Market variance: ${incomeRange} across all areas'
    ],
    recommendationPatterns: [
      '{excellentCount} {entityType} identified for premium real estate development',
      '{goodCount} {entityType} suitable for standard residential projects',
      '{moderateCount} {entityType} present affordable housing opportunities',
      '{poorCount} {entityType} may benefit from revitalization initiatives',
      'Focus luxury developments in top {topCityName} areas',
      'Consider affordable housing strategies in developing markets'
    ]
  },
  
  processorConfig: {
    comparative: {
      comparisonType: 'geographic',
      groupingStrategy: 'city',
      normalizationMethod: 'global',
      entityLabels: { primary: 'Montreal', secondary: 'Quebec City' }
    },
    competitive: {
      competitionType: 'performance',
      benchmarkStrategy: 'top_performer',
      competitorIdentification: 'geographic'
    },
    demographic: {
      focusMetrics: ['household_income', 'population_density', 'housing_characteristics'],
      segmentationCriteria: 'income_quintiles',
      incomeQuintiles: [20, 40, 60, 80, 100]
    },
    strategic: {
      priorityFactors: ['household_income', 'population_growth', 'housing_affordability', 'market_accessibility'],
      weightingScheme: 'weighted',
      strategicLenses: ['investment_potential', 'development_opportunity', 'market_risk']
    },
    trend: {
      timeHorizon: 'medium_term',
      trendMetrics: ['income_growth', 'population_change', 'housing_demand'],
      seasonalityAdjustment: false
    },
    spatial: {
      clusteringMethod: 'geographic',
      proximityMetric: 'distance',
      clusterSizePreference: 'medium'
    },
    ensemble: {
      methodWeights: {
        'income_analysis': 0.4,
        'demographic_analysis': 0.3,
        'geographic_analysis': 0.2,
        'market_analysis': 0.1
      },
      consensusThreshold: 0.7,
      diversityBonus: true
    }
  }
};