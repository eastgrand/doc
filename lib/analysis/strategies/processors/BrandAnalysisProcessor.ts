import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { DynamicFieldDetector } from './DynamicFieldDetector';
import { BrandNameResolver } from '../../utils/BrandNameResolver';

export class BrandAnalysisProcessor implements DataProcessorStrategy {
  // Prefer canonical; fallback to last numeric field for energy dataset
  private scoreField: string = 'brand_analysis_score';
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

    // Detect dynamic score field (canonical-first, else last numeric field)
    const canonical = 'brand_analysis_score';
    const detectLastNumericField = (records: any[]): string | null => {
      for (const r of (records || []).slice(0, 5)) {
        const keys = Object.keys(r || {});
        for (let i = keys.length - 1; i >= 0; i--) {
          const k = keys[i];
          const v = (r as any)[k];
          const n = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
          if (!Number.isNaN(n)) return k;
        }
      }
      return null;
    };
    const anyHasCanonical = Array.isArray(rawData.results) && rawData.results.some((record: any) => (record?.[canonical] !== undefined));
    this.scoreField = anyHasCanonical ? canonical : (detectLastNumericField(rawData.results as any[]) || canonical);

    const records = rawData.results.map((record: any, index: number) => {
      // Brand analysis requires actual brand scores, not market share differences
      let brandScore = Number((record as any).brand_analysis_score) || Number((record as any).brand_difference_score) || null;
      
      // Use dynamic brand detection instead of hardcoded fields
      const brandFields = this.brandResolver.detectBrandFields(record);
      const targetBrand = brandFields.find(bf => bf.isTarget);
      const topCompetitor = brandFields.find(bf => !bf.isTarget);
      
      const targetBrandShare = targetBrand?.value || 0;
      const competitorShare = topCompetitor?.value || 0;
      const brandDifference = targetBrandShare - competitorShare;
      
      // If no brand score found, calculate a composite brand score
      if (brandScore === null || isNaN(brandScore)) {
        console.warn(`[BrandAnalysisProcessor] No brand score found for record ${(record as any).ID || index}, calculating composite score`);
        brandScore = this.calculateCompositeBrandScore(record, targetBrandShare, competitorShare, brandDifference);
      }
      
      // Ensure brand scores are in proper range (0-100 scale for brand analysis)
      if (brandScore < 1 && brandScore !== 0) {
        // If score is a small decimal, it might need scaling
        console.log(`[BrandAnalysisProcessor] Small brand score detected (${brandScore}), may need review for record ${(record as any).ID || index}`);
      }
      
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;

      return {
        area_id: (record as any).area_id || (record as any).ID || `area_${index}`,
        area_name: (record as any).area_name || (record as any).DESCRIPTION || `Area ${index + 1}`,
        value: brandScore,
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
      targetVariable: this.scoreField
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

  /**
   * Calculate a composite brand score when no direct brand score is available
   * Uses brand positioning, market share dynamics, and strategic factors
   */
  private calculateCompositeBrandScore(record: any, targetBrandShare: number, competitorShare: number, brandDifference: number): number {
    let compositeScore = 0;
    let factorCount = 0;

    // Factor 1: Brand Market Position (0-30 points)
    if (targetBrandShare > 0 || competitorShare > 0) {
      const totalMarketShare = targetBrandShare + competitorShare;
      const positionScore = Math.min(30, (totalMarketShare / 50) * 30); // Normalize to 30 points
      compositeScore += positionScore;
      factorCount++;
    }

    // Factor 2: Brand Competitive Advantage (0-25 points)
    const brandAdvantage = Math.abs(brandDifference);
    if (brandAdvantage > 0) {
      const advantageScore = Math.min(25, (brandAdvantage / 20) * 25); // Normalize to 25 points
      compositeScore += advantageScore;
      factorCount++;
    }

    // Factor 3: Strategic Value (0-25 points)
    const strategicScore = Number((record as any).strategic_value_score) || 0;
    if (strategicScore > 0) {
      const normalizedStrategic = strategicScore <= 10 ? strategicScore * 2.5 : Math.min(25, strategicScore / 4);
      compositeScore += normalizedStrategic;
      factorCount++;
    }

    // Factor 4: Market Size/Population (0-20 points)
    const population = Number((record as any).total_population) || Number((record as any).value_TOTPOP_CY) || 0;
    if (population > 0) {
      const populationScore = Math.min(20, (population / 500000) * 20); // Normalize to 20 points
      compositeScore += populationScore;
      factorCount++;
    }

    // Average the factors if any were found, otherwise use a baseline
    const finalScore = factorCount > 0 ? compositeScore / factorCount * (100/25) : 40; // Scale to 0-100 and provide moderate fallback
    
    console.log(`[BrandAnalysisProcessor] Calculated composite brand score: ${finalScore.toFixed(2)} from ${factorCount} factors for record ${record.ID || 'unknown'}`);
    
    return Math.max(1, Math.min(100, finalScore)); // Ensure score is between 1-100
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
  /**
   * Extract field value from multiple possible field names
   */
  private extractFieldValue(record: any, fieldNames: string[]): number {
    for (const fieldName of fieldNames) {
      const value = Number(record[fieldName]);
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
    return 0;
  }

}