import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

export class MarketSizingProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && rawData.success && Array.isArray(rawData.results) && rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Market sizing analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      const marketSizingScore = Number(record.market_sizing_score) || 0;
      const totalPop = Number(record.total_population) || 0;
      const medianIncome = Number(record.median_income) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;

      return {
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.area_name || record.value_DESCRIPTION || record.DESCRIPTION || `Area ${index + 1}`,
        value: marketSizingScore,
        rank: index + 1,
        category: this.categorizeMarketSize(marketSizingScore, totalPop),
        coordinates: this.extractCoordinates(record),
        properties: {
          market_sizing_score: marketSizingScore,
          population: totalPop,
          median_income: medianIncome,
          strategic_value: strategicScore,
          demographic_opportunity: demographicScore,
          market_category: this.getMarketCategory(totalPop, medianIncome),
          opportunity_size: this.getOpportunitySize(marketSizingScore),
          revenue_potential: this.getRevenuePotential(totalPop, medianIncome)
        },
        shapValues: record.shap_values || {}
      };
    });

    records.sort((a, b) => b.value - a.value);
    records.forEach((record, index) => { record.rank = index + 1; });

    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);
    const summary = this.generateMarketSizingSummary(records, statistics);

    return {
      type: 'market_sizing',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'market_sizing_score'
    };
  }

  private categorizeMarketSize(score: number, population: number): string {
    if (score >= 80) return 'Mega Market Opportunity';
    if (score >= 65) return 'Large Market Potential';
    if (score >= 50) return 'Medium Market Size'; 
    if (score >= 35) return 'Small Market Opportunity';
    return 'Limited Market Size';
  }

  private getMarketCategory(population: number, income: number): string {
    if (population >= 150000 && income >= 80000) return 'Mega Market';
    if (population >= 100000 && income >= 60000) return 'Large Market';
    if (population >= 75000 || income >= 100000) return 'Medium-Large';
    if (population >= 50000 || income >= 80000) return 'Medium Market';
    return 'Small Market';
  }

  private getOpportunitySize(score: number): string {
    if (score >= 70) return 'Massive Opportunity';
    if (score >= 60) return 'Large Opportunity';
    if (score >= 45) return 'Moderate Opportunity';
    return 'Limited Opportunity';
  }

  private getRevenuePotential(population: number, income: number): string {
    const revenueIndex = Math.sqrt((population / 50000) * (income / 80000));
    if (revenueIndex >= 1.5) return 'High Revenue Potential';
    if (revenueIndex >= 1.0) return 'Moderate Revenue Potential';
    return 'Limited Revenue Potential';
  }

  private extractCoordinates(record: any): [number, number] {
    if (record.coordinates && Array.isArray(record.coordinates)) {
      return [record.coordinates[0] || 0, record.coordinates[1] || 0];
    }
    const lat = Number(record.latitude || record.lat || 0);
    const lng = Number(record.longitude || record.lng || 0);
    return [lng, lat];
  }

  private generateMarketSizingSummary(records: any[], statistics: any): string {
    const topMarkets = records.slice(0, 5);
    const megaCount = records.filter(r => r.value >= 80).length;
    const largeCount = records.filter(r => r.value >= 65 && r.value < 80).length;
    const avgScore = statistics.mean.toFixed(1);

    const topNames = topMarkets.map(r => `${r.area_name} (${r.value.toFixed(1)})`).join(', ');

    return `Market sizing analysis of ${records.length} markets identified ${megaCount} mega market opportunities (80+) and ${largeCount} large market potential areas (65-79). Average market sizing score: ${avgScore}. Top market opportunities: ${topNames}. Analysis considers market opportunity size, growth potential, addressable market quality, and revenue potential to identify the largest strategic market opportunities.`;
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