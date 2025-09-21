import { AnalysisContext } from './base-context';

/**
 * Entertainment Analysis Configuration
 * Optimized for The Doors Documentary classic rock audience analysis (Age 45-70)
 * Targeting 5 real 2025 ESRI Tapestry segments across Midwest (IL, IN, WI)
 */
export const ENTERTAINMENT_CONTEXT: AnalysisContext = {
  projectType: 'entertainment',
  domain: 'The Doors Documentary Market Analysis',
  
  fieldMappings: {
    primaryMetric: ['entertainment_score', 'doors_documentary_score', 'classic_rock_affinity_score', 'composite_entertainment_score', 'thematic_value'],
    secondaryMetrics: [
      'music_affinity_score', 'cultural_engagement_score', 'spending_capacity_score', 'market_accessibility_score',
      'classic_rock_listening_hours', 'concert_attendance_frequency', 'documentary_consumption_rate'
    ],
    populationField: ['total_population', 'TOTPOP_CY', 'population', 'ECYPTAPOP'],
    incomeField: ['median_household_income', 'AVGHINC_CY', 'household_income', 'ECYHRIAVG', 'thematic_value'],
    
    // Entertainment-specific field mappings
    tapestryFields: [
      'TAPESTRY_K1_PCT', 'TAPESTRY_K2_PCT', 'TAPESTRY_I1_PCT', 'TAPESTRY_J1_PCT', 'TAPESTRY_L1_PCT',
      'established_suburbanites_pct', 'mature_suburban_families_pct', 'rural_established_pct', 'active_seniors_pct', 'savvy_suburbanites_pct'
    ],
    musicFields: [
      'classic_rock_listening_hours', 'concert_attendance_frequency', 'music_streaming_engagement',
      'classic_rock_preference', 'rock_listening_frequency', 'live_music_attendance'
    ],
    culturalFields: [
      'documentary_consumption_rate', 'biography_theater_attendance', 'cultural_event_participation',
      'documentary_viewing_frequency', 'educational_content_preference', 'tv_entertainment_specials'
    ],
    theaterFields: [
      'theater_density_2mile_radius', 'total_theater_capacity_sqft', 'total_annual_sales_volume', 
      'total_employees', 'theater_count', 'venue_accessibility_rating'
    ],
    radioFields: [
      'classic_rock_format_market_share', 'total_listening_hours', 'radio_coverage_strength',
      'broadcast_area_coverage', 'classic_rock_station_count'
    ],
    
    geographicId: ['id', 'h3_index', 'hexagon_id', 'ID', 'GEOID'],
    descriptiveFields: ['area_description', 'zip_code', 'admin4_name', 'county', 'admin3_name', 'state', 'admin2_name', 'DESCRIPTION']
  },
  
  terminology: {
    entityType: 'market areas',
    metricName: 'classic rock documentary appeal',
    scoreDescription: 'audience potential and market viability for The Doors documentary',
    comparisonContext: 'entertainment market analysis for classic rock demographics'
  },
  
  scoreRanges: {
    excellent: { 
      min: 75, 
      description: 'Premium entertainment markets with exceptional classic rock audience potential',
      actionable: 'Ideal for premium documentary screenings, special events, and high-capacity venues'
    },
    good: { 
      min: 60, 
      description: 'Strong entertainment markets with solid classic rock demographics',
      actionable: 'Suitable for standard theatrical release and targeted marketing campaigns'
    },
    moderate: { 
      min: 45, 
      description: 'Developing entertainment markets with moderate audience interest',
      actionable: 'Consider streaming release with selective theater screenings'
    },
    poor: { 
      min: 0, 
      description: 'Challenging markets with limited classic rock audience appeal',
      actionable: 'Focus on digital distribution and niche marketing strategies'
    }
  },
  
  summaryTemplates: {
    analysisTitle: '🎸 The Doors Documentary Market Analysis - Classic Rock Audience Targeting',
    methodologyExplanation: 'This analysis evaluates {metricName} across {entityType} using a composite scoring algorithm targeting classic rock demographics (Age 45-70) with focus on 5 real 2025 ESRI Tapestry segments: K1 (Established Suburbanites), K2 (Mature Suburban Families), I1 (Rural Established), J1 (Active Seniors), and L1 (Savvy Suburbanites).',
    insightPatterns: [
      'Analysis covers {totalAreas} hexagon-based {entityType} across Midwest region (IL, IN, WI)',
      'Average composite entertainment score: {avgScore}/100 across all analyzed areas',
      'Score distribution: {excellentCount} premium markets, {goodCount} strong markets, {moderateCount} moderate markets',
      '{topSegmentName} Tapestry segment shows highest documentary appeal concentration',
      'Theater infrastructure analysis: {theaterCount} venues within 2-mile radius of top markets',
      'Classic rock radio coverage: {radioCoverage}% market penetration in high-scoring areas'
    ],
    recommendationPatterns: [
      '{excellentCount} {entityType} identified for premium documentary screenings and special events',
      '{goodCount} {entityType} suitable for standard theatrical release with targeted marketing',
      '{moderateCount} {entityType} appropriate for streaming-first release with selective screenings',
      'Focus marketing efforts on {primaryTapestrySegment} demographics in {topMarketName} areas',
      'Leverage {theaterVenueCount} high-capacity theaters in premium markets for opening weekend',
      'Coordinate with {classicRockStationCount} classic rock radio stations for promotional campaigns'
    ]
  },
  
  processorConfig: {
    comparative: {
      comparisonType: 'geographic',
      groupingStrategy: 'hexagon',
      normalizationMethod: 'global',
      entityLabels: { primary: 'Chicago Metro', secondary: 'Indianapolis Metro' }
    },
    competitive: {
      competitionType: 'entertainment_venues',
      benchmarkStrategy: 'market_saturation',
      competitorIdentification: 'theater_density'
    },
    demographic: {
      focusMetrics: ['classic_rock_affinity', 'documentary_consumption', 'cultural_engagement', 'spending_capacity'],
      segmentationCriteria: 'tapestry_segments',
      targetSegments: ['K1', 'K2', 'I1', 'J1', 'L1'],
      ageRange: [45, 70]
    },
    strategic: {
      priorityFactors: ['music_affinity', 'cultural_engagement', 'spending_capacity', 'market_accessibility'],
      weightingScheme: 'weighted',
      weights: {
        music_affinity: 0.40,
        cultural_engagement: 0.25, 
        spending_capacity: 0.20,
        market_accessibility: 0.15
      },
      strategicLenses: ['audience_potential', 'market_viability', 'competition_risk']
    },
    trend: {
      timeHorizon: 'seasonal',
      trendMetrics: ['entertainment_spending', 'concert_attendance', 'streaming_consumption'],
      seasonalityAdjustment: true
    },
    spatial: {
      clusteringMethod: 'hexagonal',
      proximityMetric: 'h3_distance',
      clusterSizePreference: 'medium',
      resolution: 'h3_resolution_6'
    },
    ensemble: {
      methodWeights: {
        'music_affinity_analysis': 0.40,
        'cultural_engagement_analysis': 0.25,
        'spending_capacity_analysis': 0.20,
        'market_accessibility_analysis': 0.15
      },
      consensusThreshold: 0.75,
      diversityBonus: true,
      entertainmentSpecific: true
    }
  }
};