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
      const marketSizingScore = Number((record as any).market_sizing_score) || 0;
      const totalPop = Number((record as any).total_population) || 0;
      const medianIncome = Number((record as any).median_income) || 0;
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;

      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);
      
      return {
        area_id: (record as any).area_id || (record as any).ID || `area_${index}`,
        area_name: (record as any).area_name || (record as any).value_DESCRIPTION || (record as any).DESCRIPTION || `Area ${index + 1}`,
        value: marketSizingScore,
        rank: index + 1,
        category: this.categorizeMarketSize(marketSizingScore, totalPop),
        coordinates: this.extractCoordinates(record),
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
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
        shapValues: (record as any).shap_values || {}
      };
    });

    records.sort((a, b) => b.value - a.value);
    records.forEach((record, index) => { (record as any).rank = index + 1; });

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

  /**
   * Identify top 5 fields that contribute most to the market sizing score
   * Returns them as a flattened object for popup display
   */
  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define field importance weights based on market sizing factors
    const fieldDefinitions = [
      { field: 'market_sizing_score', source: 'market_sizing_score', importance: 30 },
      { field: 'total_population', source: ['total_population', 'population'], importance: 25 },
      { field: 'median_income', source: 'median_income', importance: 20 },
      { field: 'strategic_value_score', source: ['strategic_value', 'strategic_value_score'], importance: 15 },
      { field: 'demographic_opportunity_score', source: ['demographic_opportunity', 'demographic_opportunity_score'], importance: 10 }
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
        acc[(item as any).field] = (item as any).value;
        return acc;
      }, {} as Record<string, number>);
    
    console.log(`[MarketSizingProcessor] Top contributing fields for ${(record as any).ID}:`, topFields);
    return topFields;
  }

  private extractCoordinates(record: any): [number, number] {
    if ((record as any).coordinates && Array.isArray((record as any).coordinates)) {
      return [(record as any).coordinates[0] || 0, (record as any).coordinates[1] || 0];
    }
    const lat = Number((record as any).latitude || (record as any).lat || 0);
    const lng = Number((record as any).longitude || (record as any).lng || 0);
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