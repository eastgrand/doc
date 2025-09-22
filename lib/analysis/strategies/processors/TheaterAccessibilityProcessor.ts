import { RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { getTopFieldDefinitions, getPrimaryScoreField } from './HardcodedFieldDefs';
import { BaseProcessor } from './BaseProcessor';

/**
 * Theater Accessibility Processor for The Doors Documentary
 * Analyzes venue infrastructure and accessibility for documentary screening locations
 * 
 * Assessment Framework:
 * - Venue Density (30%): Theater count within 2-mile radius of hexagon center
 * - Capacity Assessment (25%): Total seating capacity and venue size distribution
 * - Accessibility Scoring (20%): ADA compliance, parking, public transit access
 * - Market Infrastructure (15%): Sales volume, employee count, operational health
 * - Location Suitability (10%): Geographic accessibility, population density match
 * 
 * Venue Types Analyzed:
 * - Traditional movie theaters and multiplexes
 * - Arts centers and cultural venues
 * - Community centers with screening capabilities
 * - Historic theaters and specialty venues
 * - Drive-in theaters (seasonal considerations)
 */
export class TheaterAccessibilityProcessor extends BaseProcessor {
  constructor() {
    super(); // Initialize BaseProcessor with entertainment configuration
  }

  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Theater accessibility analysis failed');
    }

    const rawResults = rawData.results as unknown[];
    const scoreField = getPrimaryScoreField('theater_accessibility_analysis', (rawData as any)?.metadata ?? undefined) || 'theater_accessibility_score';
    
    const records = rawResults.map((recordRaw: unknown, index: number) => {
      const record = (recordRaw && typeof recordRaw === 'object') ? recordRaw as Record<string, unknown> : {};
      
      // Extract theater infrastructure metrics (estimated)
      const theaterDensity = this.extractNumericValue(record, ['theater_density_2mile_radius', 'venue_count_2mile', 'theater_count'], 0);
      const totalCapacity = this.extractNumericValue(record, ['total_theater_capacity_sqft', 'venue_capacity_total', 'seating_capacity'], 0);
      const salesVolume = this.extractNumericValue(record, ['total_annual_sales_volume', 'venue_revenue_annual', 'theater_sales'], 0);
      const employeeCount = this.extractNumericValue(record, ['total_employees', 'venue_staff_count', 'theater_employees'], 0);
      
      // Extract actual point layer theater counts
      const actualTheaterCountIL = this.extractNumericValue(record, ['il_theaters_count', 'IL_theaters_within_area'], 0);
      const actualTheaterCountIN = this.extractNumericValue(record, ['in_theaters_count', 'IN_theaters_within_area'], 0);
      const actualTheaterCountWI = this.extractNumericValue(record, ['wi_theaters_count', 'WI_theaters_within_area'], 0);
      const totalActualTheaters = actualTheaterCountIL + actualTheaterCountIN + actualTheaterCountWI;
      
      // Extract accessibility metrics
      const accessibilityRating = this.extractNumericValue(record, ['venue_accessibility_rating', 'ada_compliance_score', 'accessibility_index'], 0);
      const parkingCapacity = this.extractNumericValue(record, ['parking_spaces_total', 'venue_parking_capacity'], 0);
      const transitAccess = this.extractNumericValue(record, ['public_transit_accessibility', 'transit_score'], 0);
      
      // Extract geographic and demographic context
      const totalPop = this.extractNumericValue(record, this.configManager.getFieldMapping('populationField'), 0);
      const medianIncome = this.extractNumericValue(record, this.configManager.getFieldMapping('incomeField'), 0);
      const populationDensity = totalPop > 0 ? (totalPop / 2.59) : 0; // Approximate density per sq mile for hex area
      
      // Calculate composite theater accessibility score (enhanced with actual counts)
      const theaterScore = this.calculateEnhancedTheaterAccessibilityScore({
        estimatedDensity: theaterDensity,
        actualCount: totalActualTheaters,
        capacity: totalCapacity,
        accessibility: accessibilityRating,
        infrastructure: salesVolume + (employeeCount * 50000), // Convert employees to revenue equivalent
        location: populationDensity
      });
      
      // Geographic context for stakeholder communication
      const zipCode = this.extractFieldValue(record, ['zip_code', 'admin4_name', 'ZIP_CODE']) || 'N/A';
      const county = this.extractFieldValue(record, ['county', 'admin3_name', 'COUNTY']) || 'N/A';
      const state = this.extractFieldValue(record, ['state', 'admin2_name', 'STATE']) || 'N/A';
      
      // Get top contributing theater fields
      const topContributingFields = this.getTopTheaterFields(record);

      return {
        area_id: this.extractGeographicId(record),
        area_name: this.generateAreaName(record),
        value: theaterScore,
        rank: index + 1,
        category: this.categorizeTheaterAccessibility(theaterScore),
        coordinates: this.extractCoordinates(record),
        
        // Flatten top contributing fields for popup access
        ...topContributingFields,
        
        properties: {
          [scoreField]: theaterScore,
          
          // Theater infrastructure metrics (estimated)
          theater_density_2mile: theaterDensity,
          total_theater_capacity: totalCapacity,
          theater_sales_volume_annual: salesVolume,
          theater_employee_count: employeeCount,
          
          // Actual point layer theater data
          actual_theaters_il: actualTheaterCountIL,
          actual_theaters_in: actualTheaterCountIN,
          actual_theaters_wi: actualTheaterCountWI,
          actual_theaters_total: totalActualTheaters,
          theater_data_comparison: this.getTheaterDataComparison(theaterDensity, totalActualTheaters),
          
          // Accessibility assessment
          venue_accessibility_rating: accessibilityRating,
          parking_capacity_total: parkingCapacity,
          public_transit_accessibility: transitAccess,
          
          // Venue analysis results
          venue_infrastructure_strength: this.getVenueInfrastructureStrength(theaterDensity, totalCapacity, salesVolume),
          screening_capacity_assessment: this.getScreeningCapacityAssessment(theaterDensity, totalCapacity),
          venue_type_recommendations: this.getVenueTypeRecommendations(theaterDensity, totalCapacity, accessibilityRating),
          accessibility_compliance_level: this.getAccessibilityComplianceLevel(accessibilityRating),
          
          // Market suitability analysis
          market_size_venue_match: this.getMarketSizeVenueMatch(totalPop, theaterDensity, totalCapacity),
          screening_schedule_recommendations: this.getScreeningScheduleRecommendations(theaterDensity, totalPop),
          venue_partnership_opportunities: this.getVenuePartnershipOpportunities(salesVolume, employeeCount),
          
          // Location and logistics
          logistics_accessibility_score: this.getLogisticsAccessibilityScore(accessibilityRating, parkingCapacity, transitAccess),
          audience_travel_convenience: this.getAudienceTravelConvenience(theaterDensity, populationDensity),
          
          // Geographic context
          zip_code_context: zipCode,
          county_context: county,
          state_context: state,
          hexagon_theater_context: `${theaterDensity} venues within 2mi of ${zipCode}, ${county}, ${state}`,
          
          // Raw infrastructure data
          population: totalPop,
          median_income: medianIncome,
          population_density_per_sqmile: populationDensity,
          venue_revenue_per_capita: totalPop > 0 ? (salesVolume / totalPop) : 0,
          seats_per_1000_residents: totalPop > 0 ? ((totalCapacity / totalPop) * 1000) : 0
        },
        shapValues: (record.shap_values || {}) as Record<string, number>
      };
    });

    // Use BaseProcessor ranking
    const rankedRecords = this.rankRecords(records);
    
    // Calculate statistics using BaseProcessor method
    const statistics = this.calculateStatistics(rankedRecords.map(r => r.value));
    
    // Generate summary with theater-specific insights
    const customSubstitutions = {
      avgScore: statistics.mean.toFixed(1),
      topAreaName: rankedRecords[0]?.area_name || 'N/A',
      topZipCode: rankedRecords[0]?.properties?.zip_code_context || 'N/A',
      totalVenues: this.getTotalVenueCount(rankedRecords),
      totalCapacity: this.getTotalTheaterCapacity(rankedRecords),
      avgVenuesPerArea: this.getAverageVenuesPerArea(rankedRecords),
      highCapacityAreas: this.getHighCapacityAreaCount(rankedRecords),
      premiumVenueAreas: this.getPremiumVenueAreaCount(rankedRecords),
      accessibleVenueCount: this.getAccessibleVenueCount(rankedRecords),
      totalAreas: rankedRecords.length
    };
    
    const summary = this.buildSummaryFromTemplates(rankedRecords, statistics, customSubstitutions);

    return this.createProcessedData(
      'theater_accessibility_analysis',
      rankedRecords,
      summary,
      statistics,
      {
        featureImportance: rawData.feature_importance || []
      }
    );
  }

  /**
   * Calculate enhanced theater accessibility score with actual point layer data
   * Weights: Actual Count (35%), Estimated Density (20%), Capacity (20%), Accessibility (15%), Infrastructure (10%)
   */
  private calculateEnhancedTheaterAccessibilityScore(metrics: {
    estimatedDensity: number, actualCount: number, capacity: number, accessibility: number, infrastructure: number, location: number
  }): number {
    const weights = {
      actualCount: 0.35,      // Actual theater count from point layers (highest weight)
      estimatedDensity: 0.20, // Estimated density within 2-mile radius
      capacity: 0.20,         // Total seating capacity
      accessibility: 0.15,    // ADA compliance and access features
      infrastructure: 0.10    // Sales volume and operational health
    };
    
    // Normalize each metric to 0-100 scale
    const normalizedActual = Math.min((metrics.actualCount / 8) * 100, 100); // Max score at 8+ actual theaters
    const normalizedEstimated = Math.min((metrics.estimatedDensity / 10) * 100, 100); // Max 10 estimated theaters
    const normalizedCapacity = Math.min((metrics.capacity / 100000) * 100, 100); // Max 100k capacity
    const normalizedAccessibility = Math.min(metrics.accessibility, 100);
    const normalizedInfrastructure = Math.min((metrics.infrastructure / 5000000) * 100, 100); // Max $5M infrastructure
    
    const weightedScore = 
      (normalizedActual * weights.actualCount) +
      (normalizedEstimated * weights.estimatedDensity) +
      (normalizedCapacity * weights.capacity) +
      (normalizedAccessibility * weights.accessibility) +
      (normalizedInfrastructure * weights.infrastructure);
    
    return Math.round(weightedScore * 100) / 100;
  }

  /**
   * Legacy method for backward compatibility
   */
  private calculateTheaterAccessibilityScore(metrics: {
    density: number, capacity: number, accessibility: number, infrastructure: number, location: number
  }): number {
    return this.calculateEnhancedTheaterAccessibilityScore({
      estimatedDensity: metrics.density,
      actualCount: 0, // No actual count in legacy calls
      capacity: metrics.capacity,
      accessibility: metrics.accessibility,
      infrastructure: metrics.infrastructure,
      location: metrics.location
    });
  }

  private categorizeTheaterAccessibility(score: number): string {
    const scoreRange = this.getScoreInterpretation(score);
    return scoreRange.description;
  }

  /**
   * Assess venue infrastructure strength
   */
  private getVenueInfrastructureStrength(density: number, capacity: number, sales: number): string {
    const infraScore = ((density * 15) + (capacity / 1000) + (sales / 100000)) / 3;
    
    if (infraScore >= 80) return 'Exceptional Venue Infrastructure - Multiple premium theaters with high capacity';
    if (infraScore >= 65) return 'Strong Theater Market - Good venue selection with adequate capacity';
    if (infraScore >= 50) return 'Moderate Venue Options - Limited but viable screening locations';
    if (infraScore >= 35) return 'Basic Venue Infrastructure - Minimal theater options available';
    return 'Limited Venue Infrastructure - Very few or no suitable theaters';
  }

  /**
   * Assess screening capacity for different release strategies
   */
  private getScreeningCapacityAssessment(density: number, capacity: number): string {
    if (density >= 8 && capacity >= 50000) return 'Wide Release Capable - Support multiple concurrent screenings';
    if (density >= 5 && capacity >= 25000) return 'Limited Release Suitable - Adequate for standard theatrical release';
    if (density >= 3 && capacity >= 10000) return 'Selective Release Appropriate - Best for targeted screenings';
    if (density >= 1 && capacity >= 2000) return 'Special Screening Only - Single venue, limited capacity';
    return 'Not Suitable for Theatrical Release - Consider digital distribution';
  }

  /**
   * Recommend venue types based on infrastructure
   */
  private getVenueTypeRecommendations(density: number, capacity: number, accessibility: number): string {
    if (density >= 6 && accessibility >= 80) {
      return 'Premium theater chains, arts centers, historic venues with full accessibility';
    }
    if (density >= 4 && accessibility >= 60) {
      return 'Standard multiplexes, community theaters with good accessibility';
    }
    if (density >= 2) {
      return 'Community centers, local theaters, alternative screening venues';
    }
    if (density >= 1) {
      return 'Single venue options: community center, library auditorium, or mobile screening';
    }
    return 'Consider outdoor screening, pop-up venues, or digital-only distribution';
  }

  /**
   * Assess accessibility compliance level
   */
  private getAccessibilityComplianceLevel(accessibilityRating: number): string {
    if (accessibilityRating >= 90) return 'Fully ADA Compliant - Excellent accessibility features';
    if (accessibilityRating >= 75) return 'Good Accessibility - Most ADA requirements met';
    if (accessibilityRating >= 60) return 'Basic Accessibility - Minimum compliance standards';
    if (accessibilityRating >= 40) return 'Limited Accessibility - Some barriers may exist';
    return 'Accessibility Concerns - May require venue modifications or alternative options';
  }

  /**
   * Match market size to venue capacity
   */
  private getMarketSizeVenueMatch(population: number, venueCount: number, capacity: number): string {
    const venuesPerThousand = population > 0 ? (venueCount / (population / 1000)) : 0;
    const capacityPerThousand = population > 0 ? (capacity / (population / 1000)) : 0;
    
    if (venuesPerThousand >= 0.5 && capacityPerThousand >= 50) {
      return 'Excellent Market-Venue Match - High venue density and capacity for population';
    }
    if (venuesPerThousand >= 0.3 && capacityPerThousand >= 30) {
      return 'Good Market-Venue Balance - Adequate venues for market size';
    }
    if (venuesPerThousand >= 0.1 && capacityPerThousand >= 15) {
      return 'Moderate Venue Coverage - Limited but proportional to market';
    }
    if (venuesPerThousand >= 0.05) {
      return 'Minimal Venue Options - Under-served market relative to population';
    }
    return 'Venue Desert - Insufficient theater infrastructure for market size';
  }

  /**
   * Recommend screening schedule based on venue availability
   */
  private getScreeningScheduleRecommendations(venueCount: number, population: number): string {
    if (venueCount >= 8) {
      return 'Multiple daily showings across venues - Weekend focus with weekday matinees';
    }
    if (venueCount >= 4) {
      return 'Daily evening screenings - Weekend matinees and special showings';
    }
    if (venueCount >= 2) {
      return 'Weekend focus - Evening and matinee options with limited weekday shows';
    }
    if (venueCount >= 1) {
      return 'Weekend only - Limited showtimes, advance booking recommended';
    }
    return 'Special event screening - Single showing or series, heavy promotion required';
  }

  /**
   * Identify venue partnership opportunities
   */
  private getVenuePartnershipOpportunities(salesVolume: number, employees: number): string {
    const marketStrength = (salesVolume / 1000000) + (employees / 10); // Combined market indicator
    
    if (marketStrength >= 20) {
      return 'Premium Partnership Potential - High-revenue venues, co-marketing opportunities';
    }
    if (marketStrength >= 10) {
      return 'Standard Partnership Options - Revenue sharing, promotional partnerships';
    }
    if (marketStrength >= 5) {
      return 'Community Partnership Focus - Local promotion, community engagement';
    }
    if (marketStrength >= 1) {
      return 'Support-Based Partnership - Minimal revenue sharing, marketing assistance';
    }
    return 'Limited Partnership Potential - Consider direct rental or alternative arrangements';
  }

  /**
   * Calculate logistics and accessibility score
   */
  private getLogisticsAccessibilityScore(accessibility: number, parking: number, transit: number): number {
    const weights = { accessibility: 0.5, parking: 0.3, transit: 0.2 };
    
    return (accessibility * weights.accessibility) + 
           (Math.min(parking / 100, 100) * weights.parking) + 
           (transit * weights.transit);
  }

  /**
   * Assess audience travel convenience
   */
  private getAudienceTravelConvenience(venueCount: number, popDensity: number): string {
    const convenience = (venueCount * 20) + (Math.min(popDensity / 100, 50));
    
    if (convenience >= 80) return 'Excellent Travel Convenience - Multiple nearby options';
    if (convenience >= 60) return 'Good Accessibility - Reasonable travel distances';
    if (convenience >= 40) return 'Moderate Convenience - Some travel required';
    if (convenience >= 20) return 'Limited Convenience - Significant travel distances';
    return 'Poor Accessibility - Long travel times to venues';
  }

  /**
   * Get top contributing theater fields for popup display
   */
  private getTopTheaterFields(record: Record<string, unknown>): Record<string, number> {
    const theaterFields = [
      { field: 'theater_density', value: this.extractNumericValue(record, ['theater_density_2mile_radius', 'venue_count'], 0), importance: 30 },
      { field: 'theater_capacity', value: this.extractNumericValue(record, ['total_theater_capacity_sqft', 'venue_capacity'], 0), importance: 25 },
      { field: 'accessibility_rating', value: this.extractNumericValue(record, ['venue_accessibility_rating', 'accessibility_index'], 0), importance: 20 },
      { field: 'annual_sales', value: this.extractNumericValue(record, ['total_annual_sales_volume', 'theater_sales'], 0), importance: 15 },
      { field: 'employee_count', value: this.extractNumericValue(record, ['total_employees', 'theater_employees'], 0), importance: 10 }
    ];
    
    // Return top 3 by importance, only if they have meaningful values
    return theaterFields
      .filter(field => field.value > 0)
      .sort((a, b) => b.importance - a.importance)
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
  private getTotalVenueCount(records: any[]): number {
    return records.reduce((sum, record) => 
      sum + (Number(record.properties?.theater_density_2mile) || 0)
    , 0);
  }

  private getTotalTheaterCapacity(records: any[]): number {
    return records.reduce((sum, record) => 
      sum + (Number(record.properties?.total_theater_capacity) || 0)
    , 0);
  }

  private getAverageVenuesPerArea(records: any[]): number {
    const avgVenues = records.reduce((sum, record) => 
      sum + (Number(record.properties?.theater_density_2mile) || 0)
    , 0) / records.length;
    
    return Math.round(avgVenues * 10) / 10;
  }

  private getHighCapacityAreaCount(records: any[]): number {
    return records.filter(record => 
      (Number(record.properties?.total_theater_capacity) || 0) >= 25000
    ).length;
  }

  private getPremiumVenueAreaCount(records: any[]): number {
    return records.filter(record => record.value >= 75).length;
  }

  private getAccessibleVenueCount(records: any[]): number {
    return records.filter(record => 
      (Number(record.properties?.venue_accessibility_rating) || 0) >= 75
    ).length;
  }

  /**
   * Compare estimated vs actual theater data
   */
  private getTheaterDataComparison(estimated: number, actual: number): string {
    if (actual === 0 && estimated === 0) {
      return 'No theaters detected in either dataset';
    }
    
    if (actual === 0) {
      return `Estimated ${estimated} theaters, but no actual point data available`;
    }
    
    if (estimated === 0) {
      return `${actual} actual theaters identified, no estimation data`;
    }
    
    const difference = Math.abs(estimated - actual);
    const percentDiff = estimated > 0 ? (difference / estimated) * 100 : 0;
    
    if (percentDiff < 20) {
      return `Good data alignment: ${estimated} estimated vs ${actual} actual theaters`;
    } else if (percentDiff < 50) {
      return `Moderate data variance: ${estimated} estimated vs ${actual} actual theaters`;
    } else {
      return `Significant data variance: ${estimated} estimated vs ${actual} actual theaters - review data sources`;
    }
  }
}