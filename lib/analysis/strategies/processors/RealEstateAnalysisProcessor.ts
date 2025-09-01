import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { getTopFieldDefinitions, getPrimaryScoreField } from './HardcodedFieldDefs';

export class RealEstateAnalysisProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Real estate analysis failed');
    }

  const rawResults = rawData.results as unknown[];
  // Respect metadata override for target variable
  const scoreField = getPrimaryScoreField('real_estate_analysis', (rawData as any)?.metadata ?? undefined) || 'real_estate_analysis_score';
    const records = rawResults.map((recordRaw: unknown, index: number) => {
      const record = (recordRaw && typeof recordRaw === 'object') ? recordRaw as Record<string, unknown> : {};
      const realEstateScore = Number((record as any)[scoreField]) || 0;
      const totalPop = Number((record as any).total_population) || 0;
      const medianIncome = Number((record as any).median_income) || 0;
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
      const nikeShare = Number((record as any).mp30034a_b_p) || 0;

      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);

      return {
        area_id: String(record.area_id ?? (record as any).ID ?? `area_${index}`),
        area_name: String((record as any).value_DESCRIPTION ?? (record as any).DESCRIPTION ?? record.area_name ?? `Area ${index + 1}`),
        value: realEstateScore,
        rank: index + 1,
        category: this.categorizeRealEstateOpportunity(realEstateScore),
        coordinates: this.extractCoordinates(record),
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          [scoreField]: realEstateScore,
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
        shapValues: (record.shap_values || {}) as Record<string, number>
      };
    });

    records.sort((a, b) => b.value - a.value);
  records.forEach((record, index) => { (record as any).rank = index + 1; });

    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);
    const summary = this.generateRealEstateSummary(records, statistics);

    return {
      type: 'real_estate_analysis',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: scoreField
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
  private getTopContributingFields(record: Record<string, unknown>): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define field importance weights based on real estate analysis factors
    // Use dynamic field detection instead of hardcoded mappings
  const fieldDefinitions = getTopFieldDefinitions('real_estate_analysis');
  console.log(`[RealEstateAnalysisProcessor] Using hardcoded top field definitions for real_estate_analysis`);
    
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
    
  console.log(`[RealEstateAnalysisProcessor] Top contributing fields for ${(record as any).ID}:`, topFields);
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

  private generateRealEstateSummary(records: Array<Record<string, unknown>>, statistics: Record<string, unknown>): string {
    const topLocations = records.slice(0, 5) as Array<Record<string, unknown>>;
    const primeCount = topLocations.filter(r => (r['value'] as number) >= 80).length;
    const excellentCount = topLocations.filter(r => (r['value'] as number) >= 70 && (r['value'] as number) < 80).length;
    const avgScore = ((statistics['mean'] as number) || 0).toFixed(1);

    const topNames = topLocations.map(r => `${r['area_name']} (${((r['value'] as number) || 0).toFixed(1)})`).join(', ');

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
  /**
   * Extract field value from multiple possible field names
   */
  private extractFieldValue(record: Record<string, unknown>, fieldNames: string[]): number {
    for (const fieldName of fieldNames) {
      const value = Number((record as any)[fieldName]);
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
    return 0;
  }

}