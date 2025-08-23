import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { BrandNameResolver } from '../../utils/BrandNameResolver';

export class BrandAnalysisProcessor implements DataProcessorStrategy {
  private brandResolver: BrandNameResolver;

  constructor() {
    this.brandResolver = new BrandNameResolver();
  }

  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Brand analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      const brandScore = Number((record as any).brand_analysis_score) || Number((record as any).brand_difference_score) || 0;
      
      // Use dynamic brand detection instead of hardcoded fields
      const brandFields = this.brandResolver.detectBrandFields(record);
      const targetBrand = brandFields.find(bf => bf.isTarget);
      const topCompetitor = brandFields.find(bf => !bf.isTarget);
      
      const targetBrandShare = targetBrand?.value || 0;
      const competitorShare = topCompetitor?.value || 0;
      const brandDifference = targetBrandShare - competitorShare;
      
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;

      return {
        area_id: (record as any).area_id || (record as any).ID || `area_${index}`,
        area_name: (record as any).area_name || (record as any).DESCRIPTION || `Area ${index + 1}`,
        value: brandScore || brandDifference,
        rank: index + 1,
        category: this.categorizeBrandStrength(targetBrandShare, competitorShare, targetBrand?.brandName, topCompetitor?.brandName),
        coordinates: this.extractCoordinates(record),
        properties: {
          brand_analysis_score: brandScore,
          brand_difference_score: brandDifference,
          target_brand_share: targetBrandShare,
          target_brand_name: targetBrand?.brandName || 'Unknown',
          competitor_share: competitorShare,
          competitor_name: topCompetitor?.brandName || 'Unknown',
          brand_strength_level: this.getBrandStrengthLevel(targetBrandShare, competitorShare),
          market_position: this.getMarketPosition(strategicScore, demographicScore),
          competitive_landscape: this.getCompetitiveLandscape(competitiveScore),
          brand_opportunity: this.getBrandOpportunity(targetBrandShare, competitorShare, strategicScore),
          strategic_value: strategicScore,
          demographic_alignment: demographicScore
        },
        shapValues: (record as any).shap_values || {}
      };
    });

    records.sort((a, b) => b.value - a.value);
    records.forEach((record, index) => { (record as any).rank = index + 1; });

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

  private categorizeBrandStrength(targetShare: number, competitorShare: number, targetName?: string, competitorName?: string): string {
    const difference = targetShare - competitorShare;
    const target = targetName || 'Target Brand';
    const competitor = competitorName || 'Competitor';
    
    if (difference >= 10) return `${target} Advantage`;
    if (difference >= 5) return `${target} Leading`;
    if (difference <= -10) return `${competitor} Advantage`;
    if (difference <= -5) return `${competitor} Leading`;
    return 'Competitive Parity';
  }

  private getBrandStrengthLevel(targetShare: number, competitorShare: number): string {
    const totalShare = targetShare + competitorShare;
    const difference = targetShare - competitorShare;
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

  private getBrandOpportunity(targetShare: number, competitorShare: number, strategic: number): string {
    const difference = targetShare - competitorShare;
    if (difference >= 10 && strategic >= 70) return 'Defend Leadership';
    if (difference <= -10 && strategic >= 60) return 'Market Penetration';
    if (Math.abs(difference) <= 5 && strategic >= 50) return 'Competitive Battle';
    if (difference >= 5) return 'Brand Strengthening';
    return 'Brand Development';
  }

  private extractCoordinates(record: any): [number, number] {
    if ((record as any).coordinates && Array.isArray((record as any).coordinates)) {
      return [(record as any).coordinates[0] || 0, (record as any).coordinates[1] || 0];
    }
    const lat = Number((record as any).latitude || (record as any).lat || 0);
    const lng = Number((record as any).longitude || (record as any).lng || 0);
    return [lng, lat];
  }

  private generateBrandSummary(records: any[], statistics: any): string {
    const topBrands = records.slice(0, 5);
    const targetAdvantage = records.filter(r => (r.properties as any).brand_difference_score >= 5).length;
    const competitorAdvantage = records.filter(r => (r.properties as any).brand_difference_score <= -5).length;
    const competitive = records.filter(r => Math.abs((r.properties as any).brand_difference_score) < 5).length;
    const avgScore = statistics.mean.toFixed(1);

    const topNames = topBrands.map(r => `${r.area_name} (${r.value.toFixed(1)})`).join(', ');

    // Get brand names from the first record if available
    const targetBrand = records[0]?.properties?.target_brand_name || this.brandResolver.getTargetBrandName();
    const competitorBrand = records[0]?.properties?.competitor_name || 'Competitor';

    return `Brand analysis of ${records.length} markets identified ${targetAdvantage} markets with ${targetBrand} advantage, ${competitorAdvantage} with ${competitorBrand} advantage, and ${competitive} competitive markets. Average brand difference score: ${avgScore}. Top markets: ${topNames}. Analysis considers ${targetBrand} vs ${competitorBrand} market share differences, competitive positioning, and strategic opportunities for market leadership.`;
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