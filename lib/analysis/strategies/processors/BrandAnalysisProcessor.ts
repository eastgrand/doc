import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

export class BrandAnalysisProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Brand analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      const brandScore = Number(record.brand_analysis_score) || 0;
      const nikeShare = Number(record.mp30034a_b_p) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const competitiveScore = Number(record.competitive_advantage_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;

      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);
      
      return {
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.area_name || record.value_DESCRIPTION || record.DESCRIPTION || `Area ${index + 1}`,
        value: brandScore,
        rank: index + 1,
        category: this.categorizeBrandStrength(nikeShare),
        coordinates: this.extractCoordinates(record),
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          brand_analysis_score: brandScore,
          nike_market_share: nikeShare,
          brand_strength_level: this.getBrandStrengthLevel(nikeShare),
          market_position: this.getMarketPosition(strategicScore, demographicScore),
          competitive_landscape: this.getCompetitiveLandscape(competitiveScore),
          brand_opportunity: this.getBrandOpportunity(nikeShare, strategicScore),
          strategic_value: strategicScore,
          demographic_alignment: demographicScore
        },
        shapValues: record.shap_values || {}
      };
    });

    records.sort((a, b) => b.value - a.value);
    records.forEach((record, index) => { record.rank = index + 1; });

    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);
    const summary = this.generateBrandSummary(records, statistics);

    return {
      type: 'brand_analysis',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'brand_analysis_score'
    };
  }

  private categorizeBrandStrength(nikeShare: number): string {
    if (nikeShare >= 35) return 'Dominant Brand Presence';
    if (nikeShare >= 25) return 'Strong Brand Presence';
    if (nikeShare >= 15) return 'Moderate Brand Presence';
    if (nikeShare >= 5) return 'Limited Brand Presence';
    return 'Minimal Brand Presence';
  }

  private getBrandStrengthLevel(nikeShare: number): string {
    if (nikeShare >= 30) return 'Market Leader';
    if (nikeShare >= 20) return 'Strong Position';
    if (nikeShare >= 10) return 'Established Presence';
    if (nikeShare >= 5) return 'Emerging Presence';
    return 'Developing Market';
  }

  private getMarketPosition(strategic: number, demographic: number): string {
    const avgPosition = (strategic + demographic) / 2;
    if (avgPosition >= 80) return 'Premium Market Position';
    if (avgPosition >= 65) return 'Strong Market Position';
    if (avgPosition >= 50) return 'Moderate Market Position';
    return 'Developing Market Position';
  }

  private getCompetitiveLandscape(competitive: number): string {
    if (competitive >= 8) return 'Highly Competitive';
    if (competitive >= 6) return 'Competitive';
    if (competitive >= 4) return 'Moderately Competitive';
    return 'Low Competition';
  }

  private getBrandOpportunity(nikeShare: number, strategic: number): string {
    if (nikeShare >= 25 && strategic >= 70) return 'Brand Expansion';
    if (nikeShare < 15 && strategic >= 60) return 'Market Penetration';
    if (nikeShare >= 15 && strategic >= 50) return 'Brand Strengthening';
    return 'Brand Development';
  }

  /**
   * Identify top 5 fields that contribute most to the brand analysis score
   * Returns them as a flattened object for popup display
   */
  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define field importance weights based on brand analysis factors
    const fieldDefinitions = [
      { field: 'brand_analysis_score', source: 'brand_analysis_score', importance: 30 },
      { field: 'nike_market_share', source: ['mp30034a_b_p', 'nike_market_share'], importance: 25 },
      { field: 'strategic_value_score', source: 'strategic_value_score', importance: 20 },
      { field: 'competitive_advantage_score', source: 'competitive_advantage_score', importance: 15 },
      { field: 'demographic_opportunity_score', source: 'demographic_opportunity_score', importance: 10 }
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
    
    console.log(`[BrandAnalysisProcessor] Top contributing fields for ${record.ID}:`, topFields);
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

  private generateBrandSummary(records: any[], statistics: any): string {
    const topBrands = records.slice(0, 5);
    const dominantCount = records.filter(r => r.properties.nike_market_share >= 25).length;
    const strongCount = records.filter(r => r.properties.nike_market_share >= 15 && r.properties.nike_market_share < 25).length;
    const avgScore = statistics.mean.toFixed(1);

    const topNames = topBrands.map(r => `${r.area_name} (${r.value.toFixed(1)})`).join(', ');

    return `Brand analysis of ${records.length} markets identified ${dominantCount} markets with dominant Nike presence (25%+) and ${strongCount} with strong brand presence (15-24%). Average brand analysis score: ${avgScore}. Top brand markets: ${topNames}. Analysis considers Nike brand strength, market positioning, competitive landscape, and brand growth potential to identify optimal brand investment opportunities.`;
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