/**
 * Tapestry Segment Scoring Agent
 * Processes ESRI Tapestry segments with weighted scoring for Doors Documentary audience
 */

export interface TapestrySegment {
  code: string;
  name: string;
  tier: 'primary' | 'secondary' | 'tertiary';
  weight: number;
  characteristics: {
    median_age: number;
    median_income: number;
    education_level: string;
    lifestyle_traits: string[];
  };
}

export interface TapestryScoringConfig {
  segments: TapestrySegment[];
  scoringDimensions: {
    musicAffinity: number;      // 40%
    culturalEngagement: number; // 25%
    spendingCapacity: number;   // 20%
    marketAccessibility: number; // 15%
  };
}

export class TapestryScorerAgent {
  private config: TapestryScoringConfig;
  
  // Doors Documentary target segments with weighted relevance
  private readonly targetSegments: Record<string, TapestrySegment> = {
    // Primary Tier (1.0 weight) - Core Classic Rock Audience
    '1A': {
      code: '1A',
      name: 'Top Tier',
      tier: 'primary',
      weight: 1.0,
      characteristics: {
        median_age: 55,
        median_income: 150000,
        education_level: 'Graduate/Professional',
        lifestyle_traits: ['Arts patrons', 'Music enthusiasts', 'Documentary viewers']
      }
    },
    '1D': {
      code: '1D',
      name: 'Savvy Suburbanites',
      tier: 'primary',
      weight: 1.0,
      characteristics: {
        median_age: 52,
        median_income: 120000,
        education_level: 'Bachelor+',
        lifestyle_traits: ['Entertainment consumers', 'Classic rock fans', 'Streaming subscribers']
      }
    },
    '9A': {
      code: '9A',
      name: 'Urban Chic',
      tier: 'primary',
      weight: 1.0,
      characteristics: {
        median_age: 48,
        median_income: 95000,
        education_level: 'Bachelor+',
        lifestyle_traits: ['Concert goers', 'Music collectors', 'Cultural events']
      }
    },
    '9B': {
      code: '9B',
      name: 'Parks and Rec',
      tier: 'primary',
      weight: 1.0,
      characteristics: {
        median_age: 50,
        median_income: 85000,
        education_level: 'Some College+',
        lifestyle_traits: ['Outdoor concerts', 'Classic rock radio', 'Social gatherings']
      }
    },
    
    // Secondary Tier (0.75 weight) - Likely Documentary Audience
    '1E': {
      code: '1E',
      name: 'Exurbanites',
      tier: 'secondary',
      weight: 0.75,
      characteristics: {
        median_age: 54,
        median_income: 110000,
        education_level: 'Bachelor+',
        lifestyle_traits: ['Streaming services', 'Documentary interest', 'Music nostalgia']
      }
    },
    '5A': {
      code: '5A',
      name: 'Senior Escapes',
      tier: 'secondary',
      weight: 0.75,
      characteristics: {
        median_age: 65,
        median_income: 75000,
        education_level: 'Some College',
        lifestyle_traits: ['Retirement leisure', 'Classic entertainment', 'Theater attendance']
      }
    },
    '5B': {
      code: '5B',
      name: 'Silver and Gold',
      tier: 'secondary',
      weight: 0.75,
      characteristics: {
        median_age: 62,
        median_income: 95000,
        education_level: 'Bachelor',
        lifestyle_traits: ['Cultural activities', 'Music history', 'Documentary films']
      }
    },
    
    // Tertiary Tier (0.5 weight) - Potential Documentary Audience
    '2B': {
      code: '2B',
      name: 'Pleasantville',
      tier: 'tertiary',
      weight: 0.5,
      characteristics: {
        median_age: 49,
        median_income: 70000,
        education_level: 'Some College',
        lifestyle_traits: ['Family entertainment', 'Occasional concerts', 'Local events']
      }
    },
    '3B': {
      code: '3B',
      name: 'Metro Renters',
      tier: 'tertiary',
      weight: 0.5,
      characteristics: {
        median_age: 35,
        median_income: 55000,
        education_level: 'Bachelor',
        lifestyle_traits: ['Urban entertainment', 'Music streaming', 'Social events']
      }
    },
    '9D': {
      code: '9D',
      name: 'College Towns',
      tier: 'tertiary',
      weight: 0.5,
      characteristics: {
        median_age: 28,
        median_income: 45000,
        education_level: 'College/Graduate',
        lifestyle_traits: ['Alternative music', 'Cultural exploration', 'Documentary interest']
      }
    }
  };

  constructor(config?: Partial<TapestryScoringConfig>) {
    this.config = {
      segments: Object.values(this.targetSegments),
      scoringDimensions: {
        musicAffinity: 0.40,
        culturalEngagement: 0.25,
        spendingCapacity: 0.20,
        marketAccessibility: 0.15
      },
      ...config
    };
  }

  /**
   * Calculate composite score for a hexagon based on Tapestry composition
   */
  async calculateHexagonScore(hexagonData: {
    h3_index: string;
    tapestryComposition: { [segmentCode: string]: number }; // percentage of each segment
    theaterCount: number;
    radioStationCoverage: number;
    demographics: {
      population: number;
      medianIncome: number;
      medianAge: number;
    };
  }): Promise<{
    compositeScore: number;
    dimensionScores: Record<string, number>;
    dominantSegment: string;
    audiencePotential: 'high' | 'medium' | 'low';
  }> {
    
    // Calculate Music Affinity Score (40%)
    const musicAffinityScore = this.calculateMusicAffinity(hexagonData.tapestryComposition);
    
    // Calculate Cultural Engagement Score (25%)
    const culturalEngagementScore = this.calculateCulturalEngagement(
      hexagonData.tapestryComposition,
      hexagonData.demographics
    );
    
    // Calculate Spending Capacity Score (20%)
    const spendingCapacityScore = this.calculateSpendingCapacity(
      hexagonData.tapestryComposition,
      hexagonData.demographics
    );
    
    // Calculate Market Accessibility Score (15%)
    const marketAccessibilityScore = this.calculateMarketAccessibility(
      hexagonData.theaterCount,
      hexagonData.radioStationCoverage,
      hexagonData.demographics.population
    );
    
    // Calculate composite score
    const compositeScore = 
      musicAffinityScore * this.config.scoringDimensions.musicAffinity +
      culturalEngagementScore * this.config.scoringDimensions.culturalEngagement +
      spendingCapacityScore * this.config.scoringDimensions.spendingCapacity +
      marketAccessibilityScore * this.config.scoringDimensions.marketAccessibility;
    
    // Determine dominant segment
    const dominantSegment = this.getDominantSegment(hexagonData.tapestryComposition);
    
    // Determine audience potential
    const audiencePotential = compositeScore >= 75 ? 'high' : 
                              compositeScore >= 50 ? 'medium' : 'low';
    
    return {
      compositeScore,
      dimensionScores: {
        musicAffinity: musicAffinityScore,
        culturalEngagement: culturalEngagementScore,
        spendingCapacity: spendingCapacityScore,
        marketAccessibility: marketAccessibilityScore
      },
      dominantSegment,
      audiencePotential
    };
  }

  /**
   * Calculate Music Affinity based on Tapestry segments
   */
  private calculateMusicAffinity(tapestryComposition: { [segmentCode: string]: number }): number {
    let score = 0;
    
    Object.entries(tapestryComposition).forEach(([code, percentage]) => {
      const segment = this.targetSegments[code];
      if (segment) {
        // Weight by segment tier and percentage
        score += (percentage / 100) * segment.weight * 100;
      }
    });
    
    return Math.min(100, score);
  }

  /**
   * Calculate Cultural Engagement Score
   */
  private calculateCulturalEngagement(
    tapestryComposition: { [segmentCode: string]: number },
    demographics: { medianAge: number; medianIncome: number }
  ): number {
    let score = 0;
    
    // Base score from Tapestry segments
    Object.entries(tapestryComposition).forEach(([code, percentage]) => {
      const segment = this.targetSegments[code];
      if (segment && segment.characteristics.lifestyle_traits.includes('Documentary viewers')) {
        score += (percentage / 100) * 80;
      } else if (segment && segment.characteristics.lifestyle_traits.includes('Cultural events')) {
        score += (percentage / 100) * 60;
      }
    });
    
    // Adjust for target age demographic (45-70)
    if (demographics.medianAge >= 45 && demographics.medianAge <= 70) {
      score += 20;
    }
    
    return Math.min(100, score);
  }

  /**
   * Calculate Spending Capacity Score
   */
  private calculateSpendingCapacity(
    tapestryComposition: { [segmentCode: string]: number },
    demographics: { medianIncome: number }
  ): number {
    let score = 0;
    
    // Income-based scoring
    if (demographics.medianIncome >= 100000) {
      score = 90;
    } else if (demographics.medianIncome >= 75000) {
      score = 70;
    } else if (demographics.medianIncome >= 50000) {
      score = 50;
    } else {
      score = 30;
    }
    
    // Adjust based on Tapestry segment spending patterns
    Object.entries(tapestryComposition).forEach(([code, percentage]) => {
      const segment = this.targetSegments[code];
      if (segment && segment.tier === 'primary') {
        score += (percentage / 100) * 10;
      }
    });
    
    return Math.min(100, score);
  }

  /**
   * Calculate Market Accessibility Score
   */
  private calculateMarketAccessibility(
    theaterCount: number,
    radioStationCoverage: number,
    population: number
  ): number {
    let score = 0;
    
    // Theater accessibility (40% of accessibility score)
    if (theaterCount >= 3) score += 40;
    else if (theaterCount >= 2) score += 30;
    else if (theaterCount >= 1) score += 20;
    
    // Radio station coverage (30% of accessibility score)
    score += Math.min(30, radioStationCoverage * 3);
    
    // Population density factor (30% of accessibility score)
    if (population >= 50000) score += 30;
    else if (population >= 25000) score += 20;
    else if (population >= 10000) score += 10;
    
    return Math.min(100, score);
  }

  /**
   * Get dominant Tapestry segment for a hexagon
   */
  private getDominantSegment(tapestryComposition: { [segmentCode: string]: number }): string {
    let maxPercentage = 0;
    let dominantCode = '';
    
    Object.entries(tapestryComposition).forEach(([code, percentage]) => {
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        dominantCode = code;
      }
    });
    
    const segment = this.targetSegments[dominantCode];
    return segment ? segment.name : 'Unknown';
  }

  /**
   * Generate scoring report for development insights
   */
  async generateScoringReport(hexagonScores: any[]): Promise<{
    summary: any;
    topLocations: any[];
    segmentDistribution: any;
  }> {
    const summary = {
      totalHexagons: hexagonScores.length,
      averageScore: hexagonScores.reduce((sum, h) => sum + h.compositeScore, 0) / hexagonScores.length,
      highPotential: hexagonScores.filter(h => h.audiencePotential === 'high').length,
      mediumPotential: hexagonScores.filter(h => h.audiencePotential === 'medium').length,
      lowPotential: hexagonScores.filter(h => h.audiencePotential === 'low').length
    };
    
    const topLocations = hexagonScores
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 20);
    
    const segmentDistribution = this.calculateSegmentDistribution(hexagonScores);
    
    return {
      summary,
      topLocations,
      segmentDistribution
    };
  }

  private calculateSegmentDistribution(hexagonScores: any[]): any {
    const distribution: Record<string, number> = {};
    
    hexagonScores.forEach(hex => {
      const segment = hex.dominantSegment;
      distribution[segment] = (distribution[segment] || 0) + 1;
    });
    
    return distribution;
  }
}

// Export agent factory
export function createTapestryScorerAgent(): TapestryScorerAgent {
  return new TapestryScorerAgent();
}