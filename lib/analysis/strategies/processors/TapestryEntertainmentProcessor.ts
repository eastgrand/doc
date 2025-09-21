import { RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { getTopFieldDefinitions, getPrimaryScoreField } from './HardcodedFieldDefs';
import { BaseProcessor } from './BaseProcessor';

/**
 * Tapestry Entertainment Processor for The Doors Documentary
 * Specializes in analyzing 5 real 2025 ESRI Tapestry segments for classic rock audience potential
 * 
 * Target Segments (Age 45-70 classic rock demographics):
 * K1 - Established Suburbanites (Group K: Suburban Shine, Age 45+)
 * K2 - Mature Suburban Families (Group K: Suburban Shine, Age 45+)  
 * I1 - Rural Established (Group I: Countryscapes, Age 55+)
 * J1 - Active Seniors (Group J: Mature Reflections, Age 55+)
 * L1 - Savvy Suburbanites (Group L: Premier Estates, Age 45-64)
 * 
 * Analysis Framework:
 * - Segment concentration analysis (% distribution in each hexagon)
 * - Entertainment preference profiling per segment
 * - Cultural engagement patterns and documentary appeal
 * - Spending capacity and premium content willingness
 */
export class TapestryEntertainmentProcessor extends BaseProcessor {
  constructor() {
    super(); // Initialize BaseProcessor with entertainment configuration
  }

  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Tapestry entertainment analysis failed');
    }

    const rawResults = rawData.results as unknown[];
    const scoreField = getPrimaryScoreField('tapestry_entertainment_analysis', (rawData as any)?.metadata ?? undefined) || 'tapestry_entertainment_score';
    
    const records = rawResults.map((recordRaw: unknown, index: number) => {
      const record = (recordRaw && typeof recordRaw === 'object') ? recordRaw as Record<string, unknown> : {};
      
      // Extract 5 real 2025 ESRI Tapestry segments
      const tapestryK1 = this.extractNumericValue(record, ['TAPESTRY_K1_PCT', 'established_suburbanites_pct', 'K1_PCT'], 0);
      const tapestryK2 = this.extractNumericValue(record, ['TAPESTRY_K2_PCT', 'mature_suburban_families_pct', 'K2_PCT'], 0);
      const tapestryI1 = this.extractNumericValue(record, ['TAPESTRY_I1_PCT', 'rural_established_pct', 'I1_PCT'], 0);
      const tapestryJ1 = this.extractNumericValue(record, ['TAPESTRY_J1_PCT', 'active_seniors_pct', 'J1_PCT'], 0);
      const tapestryL1 = this.extractNumericValue(record, ['TAPESTRY_L1_PCT', 'savvy_suburbanites_pct', 'L1_PCT'], 0);
      
      // Calculate composite Tapestry entertainment score
      const tapestryScore = this.calculateTapestryEntertainmentScore({
        k1: tapestryK1, k2: tapestryK2, i1: tapestryI1, j1: tapestryJ1, l1: tapestryL1
      });
      
      // Extract demographic context
      const totalPop = this.extractNumericValue(record, this.configManager.getFieldMapping('populationField'), 0);
      const medianIncome = this.extractNumericValue(record, this.configManager.getFieldMapping('incomeField'), 0);
      
      // Analyze dominant segment and its entertainment characteristics
      const dominantSegment = this.getDominantTapestrySegment({
        k1: tapestryK1, k2: tapestryK2, i1: tapestryI1, j1: tapestryJ1, l1: tapestryL1
      });
      
      // Geographic context for stakeholder communication
      const zipCode = this.extractFieldValue(record, ['zip_code', 'admin4_name', 'ZIP_CODE']) || 'N/A';
      const county = this.extractFieldValue(record, ['county', 'admin3_name', 'COUNTY']) || 'N/A';
      const state = this.extractFieldValue(record, ['state', 'admin2_name', 'STATE']) || 'N/A';
      
      // Get top contributing Tapestry fields
      const topContributingFields = this.getTopTapestryFields(record);

      return {
        area_id: this.extractGeographicId(record),
        area_name: this.generateAreaName(record),
        value: tapestryScore,
        rank: index + 1,
        category: this.categorizeTapestryEntertainmentPotential(tapestryScore),
        coordinates: this.extractCoordinates(record),
        
        // Flatten top contributing fields for popup access
        ...topContributingFields,
        
        properties: {
          [scoreField]: tapestryScore,
          
          // Individual Tapestry segment percentages
          tapestry_k1_established_suburbanites_pct: tapestryK1,
          tapestry_k2_mature_suburban_families_pct: tapestryK2,
          tapestry_i1_rural_established_pct: tapestryI1,
          tapestry_j1_active_seniors_pct: tapestryJ1,
          tapestry_l1_savvy_suburbanites_pct: tapestryL1,
          
          // Segment analysis results
          dominant_tapestry_segment: dominantSegment.segment,
          dominant_segment_percentage: dominantSegment.percentage,
          segment_diversity_index: this.calculateSegmentDiversityIndex({
            k1: tapestryK1, k2: tapestryK2, i1: tapestryI1, j1: tapestryJ1, l1: tapestryL1
          }),
          
          // Entertainment characteristics by segment
          entertainment_profile: this.getSegmentEntertainmentProfile(dominantSegment.segment),
          documentary_appeal_rating: this.getDocumentaryAppealRating(dominantSegment.segment, dominantSegment.percentage),
          music_preference_profile: this.getMusicPreferenceProfile(dominantSegment.segment),
          cultural_engagement_level: this.getCulturalEngagementLevel(dominantSegment.segment),
          spending_capacity_assessment: this.getSpendingCapacityAssessment(dominantSegment.segment, medianIncome),
          
          // Market opportunity assessment
          market_strategy_recommendation: this.getMarketStrategyRecommendation(dominantSegment.segment, tapestryScore),
          screening_venue_preference: this.getScreeningVenuePreference(dominantSegment.segment),
          marketing_channel_recommendations: this.getMarketingChannelRecommendations(dominantSegment.segment),
          
          // Geographic and demographic context
          zip_code_context: zipCode,
          county_context: county,
          state_context: state,
          hexagon_tapestry_context: `${dominantSegment.segment} dominant in ${zipCode}, ${county}, ${state}`,
          
          // Raw demographic data
          population: totalPop,
          median_income: medianIncome,
          total_target_segments_pct: tapestryK1 + tapestryK2 + tapestryI1 + tapestryJ1 + tapestryL1
        },
        shapValues: (record.shap_values || {}) as Record<string, number>
      };
    });

    // Use BaseProcessor ranking
    const rankedRecords = this.rankRecords(records);
    
    // Calculate statistics using BaseProcessor method
    const statistics = this.calculateStatistics(rankedRecords.map(r => r.value));
    
    // Generate summary with Tapestry-specific insights
    const customSubstitutions = {
      avgScore: statistics.mean.toFixed(1),
      topAreaName: rankedRecords[0]?.area_name || 'N/A',
      topZipCode: rankedRecords[0]?.properties?.zip_code_context || 'N/A',
      dominantSegmentAcrossMarkets: this.getMostCommonDominantSegment(rankedRecords),
      avgSegmentConcentration: this.getAverageSegmentConcentration(rankedRecords),
      highConcentrationAreas: this.getHighConcentrationAreaCount(rankedRecords),
      totalTargetPopulation: this.getTotalTargetPopulation(rankedRecords),
      topSegmentCount: this.getTopSegmentAreaCount(rankedRecords),
      totalAreas: rankedRecords.length
    };
    
    const summary = this.buildSummaryFromTemplates(rankedRecords, statistics, customSubstitutions);

    return this.createProcessedData(
      'tapestry_entertainment_analysis',
      rankedRecords,
      summary,
      statistics,
      {
        featureImportance: rawData.feature_importance || []
      }
    );
  }

  /**
   * Calculate composite Tapestry entertainment score using 2025 segment weights
   * Initial equal weighting (1.0) - SHAP analysis will determine optimal weights
   */
  private calculateTapestryEntertainmentScore(segments: {
    k1: number, k2: number, i1: number, j1: number, l1: number
  }): number {
    // Entertainment affinity weights for classic rock audience (to be refined by SHAP)
    // Based on 2025 ESRI Tapestry segment characteristics
    const weights = {
      k1: 1.0, // Established Suburbanites - High entertainment spending, cultural engagement
      k2: 0.9, // Mature Suburban Families - Moderate engagement, family-focused entertainment  
      i1: 0.7, // Rural Established - Traditional entertainment preferences, moderate engagement
      j1: 1.0, // Active Seniors - High cultural engagement, documentary interest
      l1: 1.1  // Savvy Suburbanites - Premium entertainment consumers, tech-savvy
    };
    
    const weightedSum = 
      (segments.k1 * weights.k1) +
      (segments.k2 * weights.k2) +
      (segments.i1 * weights.i1) +
      (segments.j1 * weights.j1) +
      (segments.l1 * weights.l1);
      
    // Normalize to 0-100 scale based on maximum possible concentration
    return Math.min(weightedSum, 100);
  }

  /**
   * Determine the dominant Tapestry segment in the area
   */
  private getDominantTapestrySegment(segments: {
    k1: number, k2: number, i1: number, j1: number, l1: number
  }): { segment: string, percentage: number, description: string } {
    const segmentMap = [
      { code: 'K1', percentage: segments.k1, name: 'Established Suburbanites', description: 'High-income suburban professionals with strong entertainment spending' },
      { code: 'K2', percentage: segments.k2, name: 'Mature Suburban Families', description: 'Family-focused suburban households with moderate entertainment engagement' },
      { code: 'I1', percentage: segments.i1, name: 'Rural Established', description: 'Rural and small-town residents with traditional entertainment preferences' },
      { code: 'J1', percentage: segments.j1, name: 'Active Seniors', description: 'Affluent seniors with high cultural engagement and documentary interest' },
      { code: 'L1', percentage: segments.l1, name: 'Savvy Suburbanites', description: 'Tech-savvy suburban residents who are premium entertainment consumers' }
    ];
    
    const dominant = segmentMap.reduce((prev, current) => 
      prev.percentage > current.percentage ? prev : current
    );
    
    return {
      segment: `${dominant.code} - ${dominant.name}`,
      percentage: dominant.percentage,
      description: dominant.description
    };
  }

  /**
   * Calculate segment diversity index (higher = more diverse audience mix)
   */
  private calculateSegmentDiversityIndex(segments: {
    k1: number, k2: number, i1: number, j1: number, l1: number
  }): number {
    const values = [segments.k1, segments.k2, segments.i1, segments.j1, segments.l1];
    const total = values.reduce((sum, val) => sum + val, 0);
    
    if (total === 0) return 0;
    
    // Shannon diversity index calculation
    const diversity = values.reduce((entropy, val) => {
      if (val === 0) return entropy;
      const proportion = val / total;
      return entropy - (proportion * Math.log(proportion));
    }, 0);
    
    // Normalize to 0-100 scale
    return (diversity / Math.log(5)) * 100; // Log(5) for 5 segments
  }

  /**
   * Get entertainment profile for dominant segment
   */
  private getSegmentEntertainmentProfile(dominantSegment: string): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const profiles = {
      'K1': 'Premium Entertainment Consumers - High spending on concerts, theater, documentaries',
      'K2': 'Family Entertainment Focus - Selective premium content, group activities',
      'I1': 'Traditional Entertainment Preferences - Classic music, local venues, community events',
      'J1': 'Cultural Enthusiasts - High documentary consumption, educational content, arts patronage',
      'L1': 'Digital-First Premium Consumers - Streaming services, tech-enabled experiences, premium content'
    };
    
    return profiles[segmentCode as keyof typeof profiles] || 'Mixed Entertainment Preferences';
  }

  /**
   * Rate documentary appeal based on segment characteristics
   */
  private getDocumentaryAppealRating(dominantSegment: string, percentage: number): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const baseAppeal = {
      'K1': 75, // High cultural engagement
      'K2': 60, // Moderate interest, family-driven
      'I1': 50, // Traditional preferences, moderate appeal
      'J1': 85, // Highest documentary consumption
      'L1': 70  // Tech-savvy, premium content consumers
    }[segmentCode as keyof typeof baseAppeal] || 50;
    
    // Adjust for concentration
    const concentrationMultiplier = Math.min(percentage / 20, 2.0); // Up to 2x boost for high concentration
    const adjustedAppeal = baseAppeal * concentrationMultiplier;
    
    if (adjustedAppeal >= 80) return 'Exceptional Documentary Appeal';
    if (adjustedAppeal >= 65) return 'High Documentary Interest';
    if (adjustedAppeal >= 50) return 'Moderate Documentary Appeal';
    if (adjustedAppeal >= 35) return 'Limited Documentary Interest';
    return 'Minimal Documentary Appeal';
  }

  /**
   * Get music preference profile for segment
   */
  private getMusicPreferenceProfile(dominantSegment: string): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const profiles = {
      'K1': 'Classic Rock Core Audience - High concert attendance, vinyl collectors, music history interest',
      'K2': 'Mainstream Classic Rock - Radio listening, streaming classics, family-friendly concerts',
      'I1': 'Traditional Country/Rock Mix - Local venues, classic radio, community music events',
      'J1': 'Classic Rock Golden Age - Peak demographic, original fans, high nostalgia factor',
      'L1': 'Premium Music Experiences - High-end concerts, streaming subscriptions, music documentaries'
    };
    
    return profiles[segmentCode as keyof typeof profiles] || 'Diverse Music Preferences';
  }

  /**
   * Assess cultural engagement level for segment
   */
  private getCulturalEngagementLevel(dominantSegment: string): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const levels = {
      'K1': 'High Cultural Engagement',
      'K2': 'Moderate Cultural Participation', 
      'I1': 'Traditional Cultural Activities',
      'J1': 'Premium Cultural Participation',
      'L1': 'Digital-First Cultural Engagement'
    };
    
    return levels[segmentCode as keyof typeof levels] || 'Mixed Cultural Engagement';
  }

  /**
   * Assess spending capacity for entertainment
   */
  private getSpendingCapacityAssessment(dominantSegment: string, medianIncome: number): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const baseCapacity = {
      'K1': 'High Spending Capacity',
      'K2': 'Moderate-High Spending Capacity',
      'I1': 'Moderate Spending Capacity',
      'J1': 'High Spending Capacity',
      'L1': 'Premium Spending Capacity'
    }[segmentCode as keyof typeof baseCapacity] || 'Moderate Spending Capacity';
    
    // Adjust based on income
    if (medianIncome >= 80000) return `${baseCapacity} - Affluent Income Level`;
    if (medianIncome >= 60000) return `${baseCapacity} - Above Average Income`;
    if (medianIncome >= 45000) return `${baseCapacity} - Average Income Level`;
    return `${baseCapacity} - Below Average Income`;
  }

  /**
   * Get market strategy recommendation
   */
  private getMarketStrategyRecommendation(dominantSegment: string, score: number): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    if (score >= 75) {
      const strategies = {
        'K1': 'Premium theatrical release with VIP experiences and collector editions',
        'K2': 'Family-friendly theater screenings with group discounts and matinee showings',
        'I1': 'Community theater partnerships with local music venues and radio promotion',
        'J1': 'Premium documentary series with educational components and behind-the-scenes content',
        'L1': 'Multi-platform premium release with streaming exclusives and interactive content'
      };
      return strategies[segmentCode as keyof typeof strategies] || 'Premium market approach';
    }
    
    if (score >= 50) {
      return 'Standard theatrical release with targeted digital marketing';
    }
    
    return 'Streaming-first release with selective community screenings';
  }

  /**
   * Get screening venue preference
   */
  private getScreeningVenuePreference(dominantSegment: string): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const preferences = {
      'K1': 'Premium theaters, arts centers, historic venues',
      'K2': 'Family-friendly multiplexes, suburban theaters',
      'I1': 'Community centers, local theaters, music venues',
      'J1': 'Arts centers, cultural institutions, museum theaters',
      'L1': 'Premium theaters, IMAX, boutique cinema experiences'
    };
    
    return preferences[segmentCode as keyof typeof preferences] || 'Standard theater venues';
  }

  /**
   * Get marketing channel recommendations
   */
  private getMarketingChannelRecommendations(dominantSegment: string): string {
    const segmentCode = dominantSegment.split(' - ')[0];
    
    const channels = {
      'K1': 'Classic rock radio, music magazines, cultural event sponsorships',
      'K2': 'Social media family groups, local event calendars, school partnerships',
      'I1': 'Local radio, community newspapers, venue partnerships',
      'J1': 'Cultural institution newsletters, documentary film societies, arts publications',
      'L1': 'Streaming platform promotions, music apps, premium content channels'
    };
    
    return channels[segmentCode as keyof typeof channels] || 'Multi-channel digital marketing';
  }

  private categorizeTapestryEntertainmentPotential(score: number): string {
    const scoreRange = this.getScoreInterpretation(score);
    return scoreRange.description;
  }

  /**
   * Get top contributing Tapestry fields for popup display
   */
  private getTopTapestryFields(record: Record<string, unknown>): Record<string, number> {
    const tapestryFields = [
      { field: 'tapestry_k1_pct', value: this.extractNumericValue(record, ['TAPESTRY_K1_PCT', 'established_suburbanites_pct'], 0), importance: 1.0 },
      { field: 'tapestry_k2_pct', value: this.extractNumericValue(record, ['TAPESTRY_K2_PCT', 'mature_suburban_families_pct'], 0), importance: 0.9 },
      { field: 'tapestry_i1_pct', value: this.extractNumericValue(record, ['TAPESTRY_I1_PCT', 'rural_established_pct'], 0), importance: 0.7 },
      { field: 'tapestry_j1_pct', value: this.extractNumericValue(record, ['TAPESTRY_J1_PCT', 'active_seniors_pct'], 0), importance: 1.0 },
      { field: 'tapestry_l1_pct', value: this.extractNumericValue(record, ['TAPESTRY_L1_PCT', 'savvy_suburbanites_pct'], 0), importance: 1.1 }
    ];
    
    // Return top 3 by value
    return tapestryFields
      .filter(field => field.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .reduce((acc, item) => {
        acc[item.field] = item.value;
        return acc;
      }, {} as Record<string, number>);
  }

  private extractCoordinates(record: Record<string, unknown>): [number, number] {
    if (record['coordinates'] && Array.isArray(record['coordinates'])) {
      const coords = record['coordinates'] as unknown as number[];
      return [coords[0] || 0, coords[1] || 0];
    }
    const lat = Number((record['latitude'] || record['lat'] || 0) as unknown as number);
    const lng = Number((record['longitude'] || record['lng'] || 0) as unknown as number);
    return [lng, lat];
  }

  // Helper methods for summary generation
  private getMostCommonDominantSegment(records: any[]): string {
    const segmentCounts: { [key: string]: number } = {};
    
    records.forEach(record => {
      const segment = record.properties?.dominant_tapestry_segment || 'Unknown';
      const segmentCode = segment.split(' - ')[0];
      segmentCounts[segmentCode] = (segmentCounts[segmentCode] || 0) + 1;
    });
    
    const mostCommon = Object.entries(segmentCounts).reduce((max, [segment, count]) => 
      count > max.count ? { segment, count } : max
    , { segment: 'K1', count: 0 });
    
    return mostCommon.segment;
  }

  private getAverageSegmentConcentration(records: any[]): number {
    const avgConcentration = records.reduce((sum, record) => 
      sum + (Number(record.properties?.dominant_segment_percentage) || 0)
    , 0) / records.length;
    
    return Math.round(avgConcentration * 10) / 10;
  }

  private getHighConcentrationAreaCount(records: any[]): number {
    return records.filter(record => 
      (Number(record.properties?.dominant_segment_percentage) || 0) >= 25
    ).length;
  }

  private getTotalTargetPopulation(records: any[]): number {
    return records.reduce((sum, record) => 
      sum + (Number(record.properties?.population) || 0)
    , 0);
  }

  private getTopSegmentAreaCount(records: any[]): number {
    return records.filter(record => record.value >= 75).length;
  }
}