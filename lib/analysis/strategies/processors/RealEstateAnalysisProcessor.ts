import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

export class RealEstateAnalysisProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Real estate analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      const realEstateScore = Number(record.real_estate_analysis_score) || 0;
      const totalPop = Number(record.total_population) || 0;
      const medianIncome = Number(record.median_income) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;
      const nikeShare = Number(record.mp30034a_b_p) || 0;

      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);
      
      return {
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || `Area ${index + 1}`,
        value: realEstateScore,
        rank: index + 1,
        category: this.categorizeRealEstateOpportunity(realEstateScore),
        coordinates: this.extractCoordinates(record),
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          real_estate_analysis_score: realEstateScore,
          location_quality: this.getLocationQuality(totalPop, strategicScore),
          demographic_fit: this.getDemographicFit(demographicScore),
          market_accessibility: this.getMarketAccessibility(medianIncome, nikeShare),
          foot_traffic_potential: this.getFootTrafficPotential(totalPop),
          retail_suitability: this.getRetailSuitability(realEstateScore),
          investment_priority: this.getInvestmentPriority(realEstateScore, strategicScore),
          population: totalPop,
          median_income: medianIncome,
          nike_presence: nikeShare
        },
        shapValues: record.shap_values || {}
      };
    });

    records.sort((a, b) => b.value - a.value);
    records.forEach((record, index) => { record.rank = index + 1; });

    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);
    const summary = this.generateRealEstateSummary(records, statistics);

    return {
      type: 'real_estate_analysis',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'real_estate_analysis_score'
    };
  }

  private categorizeRealEstateOpportunity(score: number): string {
    if (score >= 80) return 'Prime Real Estate Opportunity';
    if (score >= 70) return 'Excellent Location Potential';
    if (score >= 60) return 'Good Real Estate Opportunity';
    if (score >= 45) return 'Moderate Location Value';
    return 'Limited Real Estate Potential';
  }

  private getLocationQuality(population: number, strategic: number): string {
    if (population >= 75000 && strategic >= 70) return 'Premium Location';
    if (population >= 50000 && strategic >= 60) return 'High-Quality Location';
    if (population >= 25000 || strategic >= 50) return 'Good Location';
    return 'Standard Location';
  }

  private getDemographicFit(demographic: number): string {
    if (demographic >= 80) return 'Excellent Demographic Match';
    if (demographic >= 65) return 'Strong Demographic Fit';
    if (demographic >= 50) return 'Good Demographic Alignment';
    return 'Moderate Demographic Fit';
  }

  private getMarketAccessibility(income: number, nikeShare: number): string {
    if (income >= 80000 && nikeShare >= 15) return 'Highly Accessible Market';
    if (income >= 60000 || nikeShare >= 10) return 'Accessible Market';
    if (income >= 40000) return 'Moderately Accessible';
    return 'Limited Accessibility';
  }

  private getFootTrafficPotential(population: number): string {
    if (population >= 100000) return 'High Foot Traffic';
    if (population >= 50000) return 'Moderate Foot Traffic';
    if (population >= 25000) return 'Limited Foot Traffic';
    return 'Low Foot Traffic';
  }

  private getRetailSuitability(score: number): string {
    if (score >= 75) return 'Ideal for Flagship Store';
    if (score >= 65) return 'Suitable for Full Store';
    if (score >= 55) return 'Good for Standard Store';
    if (score >= 45) return 'Suitable for Outlet';
    return 'Limited Retail Potential';
  }

  private getInvestmentPriority(realEstateScore: number, strategic: number): string {
    if (realEstateScore >= 70 && strategic >= 70) return 'High Priority Investment';
    if (realEstateScore >= 60 || strategic >= 60) return 'Medium Priority';
    if (realEstateScore >= 50) return 'Low Priority';
    return 'Monitor Only';
  }

  /**
   * Identify top 5 fields that contribute most to the real estate analysis score
   * Returns them as a flattened object for popup display
   */
  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define field importance weights based on real estate analysis factors
    const fieldDefinitions = [
      { field: 'real_estate_analysis_score', source: 'real_estate_analysis_score', importance: 30 },
      { field: 'total_population', source: ['total_population', 'population'], importance: 25 },
      { field: 'strategic_value_score', source: 'strategic_value_score', importance: 20 },
      { field: 'median_income', source: 'median_income', importance: 15 },
      { field: 'nike_market_share', source: ['mp30034a_b_p', 'nike_presence'], importance: 10 }
    ];
    
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
    
    console.log(`[RealEstateAnalysisProcessor] Top contributing fields for ${record.ID}:`, topFields);
    return topFields;
  }

  private extractCoordinates(record: any): [number, number] {
    if (record.coordinates && Array.isArray(record.coordinates)) {
      return [record.coordinates[0] || 0, record.coordinates[1] || 0];
    }
    const lat = Number(record.latitude || record.lat || 0);
    const lng = Number(record.longitude || record.lng || 0);
    return [lng, lat];
  }

  private generateRealEstateSummary(records: any[], statistics: any): string {
    const topLocations = records.slice(0, 5);
    const primeCount = records.filter(r => r.value >= 80).length;
    const excellentCount = records.filter(r => r.value >= 70 && r.value < 80).length;
    const avgScore = statistics.mean.toFixed(1);

    const topNames = topLocations.map(r => `${r.area_name} (${r.value.toFixed(1)})`).join(', ');

    return `Real estate analysis of ${records.length} locations identified ${primeCount} prime real estate opportunities (80+) and ${excellentCount} excellent location potential areas (70-79). Average real estate score: ${avgScore}. Top real estate opportunities: ${topNames}. Analysis considers location quality, demographic fit, market accessibility, and growth trajectory for optimal retail location decisions.`;
  }

  private calculateStatistics(values: number[]) {
    if (values.length === 0) return { total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    const sorted = [...values].sort((a, b) => a - b);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    const median = total % 2 === 0 ? (sorted[total / 2 - 1] + sorted[total / 2]) / 2 : sorted[Math.floor(total / 2)];
    return { total, mean, median, min: sorted[0], max: sorted[sorted.length - 1], stdDev };
  }
}