import { RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { getTopFieldDefinitions, getPrimaryScoreField } from './HardcodedFieldDefs';
import { BaseProcessor } from './BaseProcessor';

/**
 * Entertainment Analysis Processor for The Doors Documentary
 * Analyzes classic rock audience potential (Age 45-70) using composite scoring:
 * - Music Affinity (40%): Classic rock preference, concert attendance, streaming
 * - Cultural Engagement (25%): Documentary consumption, cultural events
 * - Spending Capacity (20%): Entertainment spending, premium content willingness
 * - Market Accessibility (15%): Demographics, theater infrastructure, Tapestry alignment
 * 
 * Targets 5 real 2025 ESRI Tapestry segments:
 * K1 (Established Suburbanites), K2 (Mature Suburban Families), 
 * I1 (Rural Established), J1 (Active Seniors), L1 (Savvy Suburbanites)
 */
export class EntertainmentAnalysisProcessor extends BaseProcessor {
  constructor() {
    super(); // Initialize BaseProcessor with entertainment configuration
  }

  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Entertainment analysis failed');
    }

    const rawResults = rawData.results as unknown[];
    const scoreField = getPrimaryScoreField('entertainment_analysis', (rawData as any)?.metadata ?? undefined) || 'entertainment_score';
    
    const records = rawResults.map((recordRaw: unknown, index: number) => {
      const record = (recordRaw && typeof recordRaw === 'object') ? recordRaw as Record<string, unknown> : {};
      
      // Extract composite entertainment score
      const entertainmentScore = this.extractPrimaryMetric(record);
      const totalPop = this.extractNumericValue(record, this.configManager.getFieldMapping('populationField'), 0);
      const medianIncome = this.extractNumericValue(record, this.configManager.getFieldMapping('incomeField'), 0);
      
      // Extract individual scoring components (4 dimensions)
      const musicAffinityScore = this.extractNumericValue(record, ['music_affinity_score', 'classic_rock_affinity'], 0);
      const culturalEngagementScore = this.extractNumericValue(record, ['cultural_engagement_score', 'documentary_appeal'], 0);
      const spendingCapacityScore = this.extractNumericValue(record, ['spending_capacity_score', 'entertainment_spending'], 0);
      const marketAccessibilityScore = this.extractNumericValue(record, ['market_accessibility_score', 'venue_accessibility'], 0);
      
      // Extract Tapestry segment data (5 real 2025 segments)
      const tapestryK1 = this.extractNumericValue(record, ['TAPESTRY_K1_PCT', 'established_suburbanites_pct'], 0);
      const tapestryK2 = this.extractNumericValue(record, ['TAPESTRY_K2_PCT', 'mature_suburban_families_pct'], 0);
      const tapestryI1 = this.extractNumericValue(record, ['TAPESTRY_I1_PCT', 'rural_established_pct'], 0);
      const tapestryJ1 = this.extractNumericValue(record, ['TAPESTRY_J1_PCT', 'active_seniors_pct'], 0);
      const tapestryL1 = this.extractNumericValue(record, ['TAPESTRY_L1_PCT', 'savvy_suburbanites_pct'], 0);
      
      // Extract entertainment behavior metrics
      const classicRockListening = this.extractNumericValue(record, ['classic_rock_listening_hours', 'rock_music_preference'], 0);
      const concertAttendance = this.extractNumericValue(record, ['concert_attendance_frequency', 'live_music_events'], 0);
      const documentaryConsumption = this.extractNumericValue(record, ['documentary_consumption_rate', 'documentary_viewing'], 0);
      
      // Extract theater infrastructure data
      const theaterDensity = this.extractNumericValue(record, ['theater_density_2mile_radius', 'venue_count'], 0);
      const theaterCapacity = this.extractNumericValue(record, ['total_theater_capacity_sqft', 'venue_capacity'], 0);
      const theaterSales = this.extractNumericValue(record, ['total_annual_sales_volume', 'venue_revenue'], 0);
      
      // Extract ZIP code context for stakeholder communication
      const zipCode = this.extractFieldValue(record, ['zip_code', 'admin4_name', 'ZIP_CODE']) || 'N/A';
      const county = this.extractFieldValue(record, ['county', 'admin3_name', 'COUNTY']) || 'N/A';
      const state = this.extractFieldValue(record, ['state', 'admin2_name', 'STATE']) || 'N/A';
      
      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);

      return {
        area_id: this.extractGeographicId(record),
        area_name: this.generateAreaName(record),
        value: entertainmentScore,
        rank: index + 1,
        category: this.categorizeEntertainmentPotential(entertainmentScore),
        coordinates: this.extractCoordinates(record),
        
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        
        properties: {
          [scoreField]: entertainmentScore,
          
          // Composite scoring breakdown (4 dimensions)
          music_affinity_score: musicAffinityScore,
          cultural_engagement_score: culturalEngagementScore,
          spending_capacity_score: spendingCapacityScore,
          market_accessibility_score: marketAccessibilityScore,
          
          // Tapestry segment analysis (5 real 2025 segments)
          tapestry_k1_established_suburbanites: tapestryK1,
          tapestry_k2_mature_suburban_families: tapestryK2,
          tapestry_i1_rural_established: tapestryI1,
          tapestry_j1_active_seniors: tapestryJ1,
          tapestry_l1_savvy_suburbanites: tapestryL1,
          tapestry_composite_weight: this.calculateTapestryCompositeWeight({
            k1: tapestryK1, k2: tapestryK2, i1: tapestryI1, j1: tapestryJ1, l1: tapestryL1
          }),
          
          // Entertainment behavior profile
          audience_music_profile: this.getAudienceMusicProfile(classicRockListening, concertAttendance),
          documentary_appeal_profile: this.getDocumentaryAppealProfile(documentaryConsumption, culturalEngagementScore),
          market_opportunity_assessment: this.getMarketOpportunityAssessment(entertainmentScore, marketAccessibilityScore),
          
          // Theater infrastructure assessment
          venue_infrastructure_strength: this.getVenueInfrastructureStrength(theaterDensity, theaterCapacity, theaterSales),
          screening_venue_recommendations: this.getScreeningVenueRecommendations(theaterDensity, theaterCapacity),
          
          // Geographic context for stakeholder communication
          zip_code_context: zipCode,
          county_context: county,
          state_context: state,
          hexagon_display_context: `Hexagon ${index + 1} in ${zipCode}, ${county}, ${state}`,
          
          // Raw metrics for analysis
          population: totalPop,
          median_income: medianIncome,
          classic_rock_listening_hours: classicRockListening,
          concert_attendance_frequency: concertAttendance,
          documentary_consumption_rate: documentaryConsumption,
          theater_density_2mile: theaterDensity,
          theater_capacity_total: theaterCapacity,
          theater_sales_annual: theaterSales
        },
        shapValues: (record.shap_values || {}) as Record<string, number>
      };
    });

    // Use BaseProcessor ranking
    const rankedRecords = this.rankRecords(records);
    
    // Calculate statistics using BaseProcessor method
    const statistics = this.calculateStatistics(rankedRecords.map(r => r.value));
    
    // Generate summary using configuration-driven templates
    const customSubstitutions = {
      avgScore: statistics.mean.toFixed(1),
      topAreaName: rankedRecords[0]?.area_name || 'N/A',
      topZipCode: rankedRecords[0]?.properties?.zip_code_context || 'N/A',
      highestTapestrySegment: this.getHighestTapestrySegment(rankedRecords),
      theaterCount: this.getTotalTheaterCount(rankedRecords),
      radioCoverage: this.getRadioCoveragePercentage(rankedRecords),
      primaryTapestrySegment: 'Established Suburbanites (K1)',
      topMarketName: this.getTopMarketName(rankedRecords),
      theaterVenueCount: this.getHighCapacityTheaterCount(rankedRecords),
      classicRockStationCount: this.getClassicRockStationCount(rankedRecords),
      totalAreas: rankedRecords.length,
      topSegmentName: 'K1 (Established Suburbanites)'
    };
    
    const summary = this.buildSummaryFromTemplates(rankedRecords, statistics, customSubstitutions);

    return this.createProcessedData(
      'entertainment_analysis',
      rankedRecords,
      summary,
      statistics,
      {
        featureImportance: rawData.feature_importance || []
      }
    );
  }

  private categorizeEntertainmentPotential(score: number): string {
    const scoreRange = this.getScoreInterpretation(score);
    return scoreRange.description;
  }

  /**
   * Calculate weighted composite score for 5 real 2025 ESRI Tapestry segments
   * Initial equal weighting (1.0) - SHAP analysis will determine actual weights
   */
  private calculateTapestryCompositeWeight(segments: {k1: number, k2: number, i1: number, j1: number, l1: number}): number {
    // Equal weighting initially (1.0 for all segments)
    // SHAP analysis will provide data-driven weights
    const weights = { k1: 1.0, k2: 1.0, i1: 1.0, j1: 1.0, l1: 1.0 };
    
    const weightedSum = 
      (segments.k1 * weights.k1) +
      (segments.k2 * weights.k2) +
      (segments.i1 * weights.i1) +
      (segments.j1 * weights.j1) +
      (segments.l1 * weights.l1);
      
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    
    return Math.min(weightedSum / totalWeight, 100);
  }

  // Entertainment-specific assessment methods
  private getAudienceMusicProfile(rockListening: number, concertAttendance: number): string {
    const musicEngagement = (rockListening + concertAttendance) / 2;
    
    if (musicEngagement >= 80) return 'Highly Engaged Classic Rock Audience';
    if (musicEngagement >= 65) return 'Strong Classic Rock Interest';
    if (musicEngagement >= 50) return 'Moderate Music Engagement';
    if (musicEngagement >= 35) return 'Casual Music Interest';
    return 'Limited Music Engagement';
  }

  private getDocumentaryAppealProfile(documentaryRate: number, culturalScore: number): string {
    const culturalEngagement = (documentaryRate + culturalScore) / 2;
    
    if (culturalEngagement >= 75) return 'Premium Documentary Audience';
    if (culturalEngagement >= 60) return 'Strong Documentary Interest';
    if (culturalEngagement >= 45) return 'Moderate Cultural Engagement';
    if (culturalEngagement >= 30) return 'Casual Documentary Viewers';
    return 'Limited Documentary Interest';
  }

  private getMarketOpportunityAssessment(overallScore: number, accessibilityScore: number): string {
    if (overallScore >= 75 && accessibilityScore >= 70) return 'Premium Market Opportunity';
    if (overallScore >= 65 && accessibilityScore >= 55) return 'Strong Market Potential';
    if (overallScore >= 55 && accessibilityScore >= 40) return 'Moderate Market Opportunity';
    if (overallScore >= 45 && accessibilityScore >= 25) return 'Developing Market Potential';
    return 'Limited Market Opportunity';
  }

  private getVenueInfrastructureStrength(density: number, capacity: number, sales: number): string {
    const infraScore = ((density * 0.4) + (capacity / 1000 * 0.3) + (sales / 1000000 * 0.3));
    
    if (infraScore >= 75) return 'Exceptional Venue Infrastructure';
    if (infraScore >= 60) return 'Strong Theater Market';
    if (infraScore >= 45) return 'Adequate Venue Options';
    if (infraScore >= 30) return 'Limited Venue Infrastructure';
    return 'Minimal Theater Presence';
  }

  private getScreeningVenueRecommendations(density: number, capacity: number): string {
    if (density >= 10 && capacity >= 50000) return 'Multiple premium venues available - recommend opening weekend focus';
    if (density >= 6 && capacity >= 25000) return 'Good venue selection - suitable for standard theatrical release';
    if (density >= 3 && capacity >= 10000) return 'Limited venues - consider selective screening strategy';
    if (density >= 1) return 'Single venue market - streaming-first with special screening';
    return 'No suitable theaters - digital distribution only';
  }

  /**
   * Identify top 5 fields that contribute most to the entertainment analysis score
   * Returns them as a flattened object for popup display
   */
  private getTopContributingFields(record: Record<string, unknown>): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define entertainment-specific field importance weights
    const fieldDefinitions = getTopFieldDefinitions('entertainment_analysis');
    console.log(`[EntertainmentAnalysisProcessor] Using field definitions for entertainment_analysis`);
    
    fieldDefinitions.forEach(fieldDef => {
      let value = 0;
      const sources = Array.isArray(fieldDef.source) ? fieldDef.source : [fieldDef.source];
      
      // Find the first available source field
      for (const source of sources) {
        if (record[source] !== undefined && record[source] !== null) {
          value = Number(record[source]);
          break;
        }
      }
      
      // Only include fields with meaningful values
      if (!isNaN(value) && value > 0) {
        contributingFields.push({
          field: fieldDef.field,
          value: Math.round(value * 100) / 100,
          importance: fieldDef.importance
        });
      }
    });
    
    // Sort by importance and take top 5
    const topFields = contributingFields
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .reduce((acc, item) => {
        acc[item.field] = item.value;
        return acc;
      }, {} as Record<string, number>);
    
    console.log(`[EntertainmentAnalysisProcessor] Top contributing fields for ${(record as any).id}:`, topFields);
    return topFields;
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
  private getHighestTapestrySegment(records: any[]): string {
    // Analyze which Tapestry segment has highest average percentage
    const segments = ['K1', 'K2', 'I1', 'J1', 'L1'];
    let highestSegment = 'K1';
    let highestAvg = 0;
    
    segments.forEach(segment => {
      const fieldName = `tapestry_${segment.toLowerCase()}_${segment === 'K1' ? 'established_suburbanites' : 
                        segment === 'K2' ? 'mature_suburban_families' :
                        segment === 'I1' ? 'rural_established' : 
                        segment === 'J1' ? 'active_seniors' : 'savvy_suburbanites'}`;
      
      const avg = records.reduce((sum, r) => sum + (Number(r.properties?.[fieldName]) || 0), 0) / records.length;
      if (avg > highestAvg) {
        highestAvg = avg;
        highestSegment = segment;
      }
    });
    
    return highestSegment;
  }

  private getTotalTheaterCount(records: any[]): number {
    return records.reduce((sum, r) => sum + (Number(r.properties?.theater_density_2mile) || 0), 0);
  }

  private getRadioCoveragePercentage(records: any[]): number {
    // Estimate radio coverage based on available data
    const avgCoverage = records.reduce((sum, r) => sum + (Number(r.properties?.market_accessibility_score) || 0), 0) / records.length;
    return Math.round(avgCoverage * 0.8); // Approximate conversion
  }

  private getTopMarketName(records: any[]): string {
    return records[0]?.properties?.zip_code_context || 'Top Market';
  }

  private getHighCapacityTheaterCount(records: any[]): number {
    return records.filter(r => (Number(r.properties?.theater_capacity_total) || 0) > 25000).length;
  }

  private getClassicRockStationCount(records: any[]): number {
    // Estimate based on market accessibility scores
    return Math.round(records.length * 0.15); // Approximate 15% of markets have classic rock stations
  }
}