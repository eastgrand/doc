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
      const brandScore = Number(record.brand_analysis_score) || Number(record.brand_difference_score) || 0;
      const hrBlockShare = Number(record.MP10128A_B_P) || 0;
      const turboTaxShare = Number(record.MP10104A_B_P) || 0;
      const brandDifference = hrBlockShare - turboTaxShare;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const competitiveScore = Number(record.competitive_advantage_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;

      return {
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.area_name || record.DESCRIPTION || `Area ${index + 1}`,
        value: brandScore || brandDifference,
        rank: index + 1,
        category: this.categorizeBrandStrength(hrBlockShare, turboTaxShare),
        coordinates: this.extractCoordinates(record),
        properties: {
          brand_analysis_score: brandScore,
          brand_difference_score: brandDifference,
          hr_block_market_share: hrBlockShare,
          turbotax_market_share: turboTaxShare,
          brand_strength_level: this.getBrandStrengthLevel(hrBlockShare, turboTaxShare),
          market_position: this.getMarketPosition(strategicScore, demographicScore),
          competitive_landscape: this.getCompetitiveLandscape(competitiveScore),
          brand_opportunity: this.getBrandOpportunity(hrBlockShare, turboTaxShare, strategicScore),
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

  private categorizeBrandStrength(hrBlockShare: number, turboTaxShare: number): string {
    const difference = hrBlockShare - turboTaxShare;
    if (difference >= 10) return 'H&R Block Advantage';
    if (difference >= 5) return 'H&R Block Leading';
    if (difference <= -10) return 'TurboTax Advantage';
    if (difference <= -5) return 'TurboTax Leading';
    return 'Competitive Parity';
  }

  private getBrandStrengthLevel(hrBlockShare: number, turboTaxShare: number): string {
    const totalShare = hrBlockShare + turboTaxShare;
    const difference = hrBlockShare - turboTaxShare;
    if (totalShare >= 30 && Math.abs(difference) >= 10) return 'Clear Market Leader';
    if (totalShare >= 20 && Math.abs(difference) >= 5) return 'Strong Position';
    if (totalShare >= 15) return 'Established Presence';
    if (totalShare >= 10) return 'Emerging Presence';
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

  private getBrandOpportunity(hrBlockShare: number, turboTaxShare: number, strategic: number): string {
    const difference = hrBlockShare - turboTaxShare;
    if (difference >= 10 && strategic >= 70) return 'Defend Leadership';
    if (difference <= -10 && strategic >= 60) return 'Market Penetration';
    if (Math.abs(difference) <= 5 && strategic >= 50) return 'Competitive Battle';
    if (difference >= 5) return 'Brand Strengthening';
    return 'Brand Development';
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
    const hrBlockAdvantage = records.filter(r => r.properties.brand_difference_score >= 5).length;
    const turboTaxAdvantage = records.filter(r => r.properties.brand_difference_score <= -5).length;
    const competitive = records.filter(r => Math.abs(r.properties.brand_difference_score) < 5).length;
    const avgScore = statistics.mean.toFixed(1);

    const topNames = topBrands.map(r => `${r.area_name} (${r.value.toFixed(1)})`).join(', ');

    return `Brand analysis of ${records.length} markets identified ${hrBlockAdvantage} markets with H&R Block advantage, ${turboTaxAdvantage} with TurboTax advantage, and ${competitive} competitive markets. Average brand difference score: ${avgScore}. Top markets: ${topNames}. Analysis considers H&R Block vs TurboTax market share differences, competitive positioning, and strategic opportunities for tax software market leadership.`;
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