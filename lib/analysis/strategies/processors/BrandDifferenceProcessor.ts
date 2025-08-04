import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { calculateEqualCountQuintiles } from '../../utils/QuintileUtils';

/**
 * BrandDifferenceProcessor - Calculates and visualizes percent difference in market share between any two brands
 * 
 * Processes brand market share data to show competitive positioning differences
 * across geographic areas with contextual analysis.
 */
export class BrandDifferenceProcessor implements DataProcessorStrategy {
  
  // Brand code mappings for market share data
  private readonly BRAND_MAPPINGS = {
    'nike': 'MP30034A_B_P',
    'adidas': 'MP30029A_B_P', 
    'jordan': 'MP30032A_B_P'
  };

  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Brand difference analysis requires brand market share data
    const hasBrandFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        (record.value_MP30034A_B_P !== undefined || // Nike
         record.value_MP30029A_B_P !== undefined || // Adidas
         record.value_MP30032A_B_P !== undefined)   // Jordan
      );
    
    return hasBrandFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`[BrandDifferenceProcessor] Processing ${rawData.results?.length || 0} records for brand difference analysis`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for BrandDifferenceProcessor');
    }

    // Extract brand parameters from analysis (default to Nike vs Adidas)
    const brand1 = 'nike'; // TODO: Extract from query/options
    const brand2 = 'adidas'; // TODO: Extract from query/options

    // Process records with brand difference calculations
    const records = this.processBrandDifferenceRecords(rawData.results, brand1, brand2);
    
    console.log(`[BrandDifferenceProcessor] Processed ${records.length} records for ${brand1} vs ${brand2}`);
    console.log(`[BrandDifferenceProcessor] Sample difference: ${records[0]?.value}%`);
    
    // Calculate difference statistics
    const statistics = this.calculateDifferenceStatistics(records);
    
    // Analyze brand competitive landscape
    const brandAnalysis = this.analyzeBrandDifferences(records, brand1, brand2);
    
    // Process feature importance for brand factors
    const featureImportance = this.processBrandFeatureImportance(rawData.feature_importance || []);
    
    // Generate brand difference summary
    const summary = this.generateBrandDifferenceSummary(records, brandAnalysis, brand1, brand2, rawData.summary);

    console.log(`[BrandDifferenceProcessor] Final result summary:`, {
      type: 'brand_difference',
      recordCount: records.length,
      comparison: `${brand1} vs ${brand2}`,
      avgDifference: statistics.mean
    });

    return {
      type: 'brand_difference',
      records,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'brand_difference_score',
      renderer: this.createBrandDifferenceRenderer(records), 
      legend: this.createBrandDifferenceLegend(records),
      brandAnalysis,
      brandComparison: { brand1, brand2 }
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processBrandDifferenceRecords(rawRecords: any[], brand1: string, brand2: string): GeographicDataPoint[] {
    const brand1Field = `value_${this.BRAND_MAPPINGS[brand1 as keyof typeof this.BRAND_MAPPINGS]}`;
    const brand2Field = `value_${this.BRAND_MAPPINGS[brand2 as keyof typeof this.BRAND_MAPPINGS]}`;

    return rawRecords.map((record, index) => {
      const area_id = record.area_id || record.id || record.GEOID || `area_${index}`;
      const area_name = record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || record.name || record.NAME || `Area ${index + 1}`;
      
      // Extract brand market shares
      const brand1Share = Number(record[brand1Field]) || 0; // Already in percentage format
      const brand2Share = Number(record[brand2Field]) || 0; // Already in percentage format
      
      // Calculate simple difference: brand1 - brand2 (both already in percentage format)
      const difference = brand1Share - brand2Share;
      
      // Use difference as the primary value for visualization
      const value = difference;
      
      // Extract contextual properties
      const properties = {
        ...this.extractProperties(record),
        brand_difference_score: difference,
        [brand1 + '_market_share']: brand1Share,
        [brand2 + '_market_share']: brand2Share,
        absolute_difference: brand1Share - brand2Share,
        competitive_advantage_score: record.competitive_advantage_score || 0,
        total_population: Number(record.value_TOTPOP_CY) || 0,
        wealth_index: Number(record.value_WLTHINDXCY) || 100,
        difference_category: this.categorizeDifference(difference),
        market_dominance: this.determineMarketDominance(brand1Share, brand2Share)
      };
      
      // Extract SHAP values for both brands
      const shapValues = this.extractBrandShapValues(record, brand1, brand2);
      
      // Category based on difference magnitude
      const category = this.getDifferenceCategory(difference);

      return {
        area_id,
        area_name,
        value,
        brand_difference_score: difference,
        rank: 0, // Will be calculated in ranking
        category,
        coordinates: record.coordinates || [0, 0],
        properties,
        shapValues
      };
    }).sort((a, b) => b.value - a.value) // Sort by difference (brand1 advantage first)
      .map((record, index) => ({ ...record, rank: index + 1 })); // Assign ranks
  }

  private extractProperties(record: any): Record<string, any> {
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'coordinates', 'shap_values'
    ]);
    
    const properties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (!internalFields.has(key)) {
        properties[key] = value;
      }
    }
    
    return properties;
  }

  private extractBrandShapValues(record: any, brand1: string, brand2: string): Record<string, number> {
    const brand1ShapField = `shap_${this.BRAND_MAPPINGS[brand1 as keyof typeof this.BRAND_MAPPINGS]}`;
    const brand2ShapField = `shap_${this.BRAND_MAPPINGS[brand2 as keyof typeof this.BRAND_MAPPINGS]}`;
    
    const shapValues: Record<string, number> = {};
    
    // Extract SHAP values for both brands
    if (record[brand1ShapField] !== undefined) {
      shapValues[`${brand1}_shap`] = Number(record[brand1ShapField]);
    }
    if (record[brand2ShapField] !== undefined) {
      shapValues[`${brand2}_shap`] = Number(record[brand2ShapField]);
    }
    
    // Extract general SHAP values
    for (const [key, value] of Object.entries(record)) {
      if (key.startsWith('shap_') && typeof value === 'number') {
        shapValues[key] = value;
      }
    }
    
    return shapValues;
  }

  private categorizeDifference(difference: number): string {
    if (difference >= 50) return 'major_advantage';
    if (difference >= 20) return 'significant_advantage';
    if (difference >= 5) return 'moderate_advantage';
    if (difference >= -5) return 'competitive_parity';
    if (difference >= -20) return 'moderate_disadvantage';
    if (difference >= -50) return 'significant_disadvantage';
    return 'major_disadvantage';
  }

  private determineMarketDominance(share1: number, share2: number): string {
    const total = share1 + share2;
    if (total < 10) return 'low_presence';
    if (share1 > share2 * 2) return 'brand1_dominant';
    if (share2 > share1 * 2) return 'brand2_dominant';
    return 'competitive_market';
  }

  private getDifferenceCategory(difference: number): string {
    if (difference >= 25) return 'strong_brand1';
    if (difference >= 0) return 'brand1_leading';
    if (difference >= -25) return 'brand2_leading';
    return 'strong_brand2';
  }

  private calculateDifferenceStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
    const differences = records.map(r => r.value).filter(v => !isNaN(v));
    
    if (differences.length === 0) {
      return {
        total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0,
        quintiles: { differences: [] } as any
      };
    }
    
    const sorted = [...differences].sort((a, b) => a - b);
    const total = differences.length;
    const sum = differences.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const median = total % 2 === 0 
      ? (sorted[Math.floor(total / 2) - 1] + sorted[Math.floor(total / 2)]) / 2
      : sorted[Math.floor(total / 2)];
    
    const variance = differences.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    // Calculate quintiles for differences
    const quintileResult = calculateEqualCountQuintiles(sorted);
    
    console.log('[BrandDifferenceProcessor] Difference quintiles calculated:', quintileResult.quintiles);
    
    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev,
      quintiles: {
        differences: quintileResult.quintiles
      } as any
    };
  }

  private analyzeBrandDifferences(records: GeographicDataPoint[], brand1: string, brand2: string): any {
    // Group by difference categories
    const categoryMap = new Map<string, GeographicDataPoint[]>();
    
    records.forEach(record => {
      const category = record.category!;
      if (!categoryMap.has(category)) {
        categoryMap.set(category, []);
      }
      categoryMap.get(category)!.push(record);
    });
    
    // Analyze each category
    const categoryAnalysis = Array.from(categoryMap.entries()).map(([category, categoryRecords]) => {
      const avgDifference = categoryRecords.reduce((sum, r) => sum + r.value, 0) / categoryRecords.length;
      const avgBrand1Share = categoryRecords.reduce((sum, r) => sum + (r.properties[`${brand1}_market_share`] || 0), 0) / categoryRecords.length;
      const avgBrand2Share = categoryRecords.reduce((sum, r) => sum + (r.properties[`${brand2}_market_share`] || 0), 0) / categoryRecords.length;
      
      return {
        category,
        size: categoryRecords.length,
        percentage: (categoryRecords.length / records.length) * 100,
        avgDifference,
        avgBrand1Share,
        avgBrand2Share,
        topAreas: categoryRecords
          .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
          .slice(0, 3)
          .map(r => ({
            name: r.area_name,
            difference: r.value,
            brand1Share: r.properties[`${brand1}_market_share`],
            brand2Share: r.properties[`${brand2}_market_share`]
          }))
      };
    });
    
    return {
      categories: categoryAnalysis,
      brandLeadership: this.assessBrandLeadership(records, brand1, brand2),
      competitiveBalance: this.assessCompetitiveBalance(categoryAnalysis)
    };
  }

  private assessBrandLeadership(records: GeographicDataPoint[], brand1: string, brand2: string): any {
    const brand1Leading = records.filter(r => r.value > 0).length;
    const brand2Leading = records.filter(r => r.value < 0).length;
    const competitive = records.filter(r => Math.abs(r.value) <= 5).length;
    
    return {
      brand1Leading,
      brand2Leading,
      competitive,
      brand1LeadingPct: (brand1Leading / records.length) * 100,
      brand2LeadingPct: (brand2Leading / records.length) * 100,
      competitivePct: (competitive / records.length) * 100
    };
  }

  private assessCompetitiveBalance(categoryAnalysis: any[]): string {
    const strongBrand1 = categoryAnalysis.find(c => c.category === 'strong_brand1')?.percentage || 0;
    const strongBrand2 = categoryAnalysis.find(c => c.category === 'strong_brand2')?.percentage || 0;
    
    if (strongBrand1 > 40) return 'brand1_dominance';
    if (strongBrand2 > 40) return 'brand2_dominance';
    if (Math.abs(strongBrand1 - strongBrand2) < 10) return 'balanced_competition';
    return 'fragmented_market';
  }

  private processBrandFeatureImportance(rawFeatureImportance: any[]): any[] {
    return rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getBrandFeatureDescription(item.feature || item.name),
      brandImpact: this.assessBrandImpact(item.importance || 0)
    })).sort((a, b) => b.importance - a.importance);
  }

  private getBrandFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'population': 'Market size and demographic density',
      'income': 'Income levels affecting brand preference',
      'age': 'Age demographics and brand affinity',
      'education': 'Education levels and brand perception',
      'urban': 'Urban vs suburban market characteristics',
      'wealth': 'Wealth distribution and premium brand preference'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} brand preference factor`;
  }

  private assessBrandImpact(importance: number): string {
    if (importance >= 0.8) return 'critical_differentiator';
    if (importance >= 0.6) return 'significant_factor';
    if (importance >= 0.4) return 'moderate_influence';
    if (importance >= 0.2) return 'minor_factor';
    return 'negligible_impact';
  }

  private generateBrandDifferenceSummary(
    records: GeographicDataPoint[], 
    brandAnalysis: any, 
    brand1: string, 
    brand2: string,
    rawSummary?: string
  ): string {
    
    const recordCount = records.length;
    const avgDifference = records.reduce((sum, r) => sum + r.value, 0) / recordCount;
    const brand1Name = brand1.charAt(0).toUpperCase() + brand1.slice(1);
    const brand2Name = brand2.charAt(0).toUpperCase() + brand2.slice(1);
    
    let summary = `**📊 ${brand1Name} vs ${brand2Name} Market Share Difference Analysis**\n\n`;
    
    summary += `**Methodology:** Calculated market share difference between ${brand1Name} and ${brand2Name} across ${recordCount} markets (${brand1Name} % - ${brand2Name} %). `;
    summary += `Positive values indicate ${brand1Name} advantage, negative values indicate ${brand2Name} advantage.\n\n`;
    
    // Overall market comparison
    summary += `**Overall Market Position:** `;
    if (avgDifference > 10) {
      summary += `${brand1Name} holds a significant market advantage with an average ${avgDifference.toFixed(1)}% higher market share than ${brand2Name}. `;
    } else if (avgDifference > 0) {
      summary += `${brand1Name} slightly leads with an average ${avgDifference.toFixed(1)}% market share advantage. `;
    } else if (avgDifference > -10) {
      summary += `${brand2Name} slightly leads with an average ${Math.abs(avgDifference).toFixed(1)}% market share advantage. `;
    } else {
      summary += `${brand2Name} holds a significant market advantage with an average ${Math.abs(avgDifference).toFixed(1)}% higher market share than ${brand1Name}. `;
    }
    
    // Brand leadership distribution
    const leadership = brandAnalysis.brandLeadership;
    summary += `Market distribution: ${brand1Name} leads in ${leadership.brand1Leading} markets (${leadership.brand1LeadingPct.toFixed(1)}%), `;
    summary += `${brand2Name} leads in ${leadership.brand2Leading} markets (${leadership.brand2LeadingPct.toFixed(1)}%), `;
    summary += `with ${leadership.competitive} competitive markets (${leadership.competitivePct.toFixed(1)}%).\n\n`;
    
    // Top performance areas
    const topBrand1Markets = records.filter(r => r.value > 20).slice(0, 5);
    const topBrand2Markets = records.filter(r => r.value < -20).slice(0, 5);
    
    if (topBrand1Markets.length > 0) {
      summary += `**${brand1Name} Strongholds** (>20% advantage): `;
      topBrand1Markets.forEach((record, index) => {
        const brand1Share = record.properties[`${brand1}_market_share`];
        const brand2Share = record.properties[`${brand2}_market_share`];
        summary += `${record.area_name} (${brand1Share.toFixed(1)}% vs ${brand2Share.toFixed(1)}%), `;
      });
      summary = summary.slice(0, -2) + '.\n\n';
    }
    
    if (topBrand2Markets.length > 0) {
      summary += `**${brand2Name} Strongholds** (>20% advantage): `;
      topBrand2Markets.forEach((record, index) => {
        const brand1Share = record.properties[`${brand1}_market_share`];
        const brand2Share = record.properties[`${brand2}_market_share`];
        summary += `${record.area_name} (${brand2Share.toFixed(1)}% vs ${brand1Share.toFixed(1)}%), `;
      });
      summary = summary.slice(0, -2) + '.\n\n';
    }
    
    // Competitive insights
    summary += `**Strategic Insights:** `;
    const competitiveBalance = brandAnalysis.competitiveBalance;
    if (competitiveBalance === 'balanced_competition') {
      summary += `Markets show balanced competition with opportunities for both brands to gain share through targeted strategies. `;
    } else if (competitiveBalance.includes('brand1')) {
      summary += `${brand1Name} shows market dominance with opportunities to defend and expand leading positions. `;
    } else if (competitiveBalance.includes('brand2')) {
      summary += `${brand2Name} shows market dominance with ${brand1Name} needing strategic repositioning to compete effectively. `;
    }
    
    summary += `Focus on markets with moderate differences for highest growth potential and competitive conversion opportunities.`;
    
    return summary;
  }

  // ============================================================================
  // RENDERING METHODS
  // ============================================================================

  private createBrandDifferenceRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use diverging color scheme: red (brand2 advantage) -> white -> blue (brand1 advantage)
    // Use the exact same colors as strategic analysis (red-to-green)
    const differenceColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (Strong brand2 advantage)
      [253, 174, 97, 0.6],  // #fdae61 - Orange (Moderate brand2 advantage)
      [254, 224, 144, 0.6], // #fee090 - Light yellow (Competitive parity)
      [166, 217, 106, 0.6], // #a6d96a - Light green (Moderate brand1 advantage)
      [26, 152, 80, 0.6]    // #1a9850 - Dark green (Strong brand1 advantage)
    ];
    
    return {
      type: 'class-breaks',
      field: 'brand_difference_score',
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: differenceColors[i],
          outline: { color: [0, 0, 0, 0], width: 0 }
        },
        label: this.formatDifferenceLabel(i, quartileBreaks)
      })),
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [0, 0, 0, 0], width: 0 }
      }
    };
  }

  private createBrandDifferenceLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use exact same colors as strategic analysis in rgba format
    const colors = [
      'rgba(215, 48, 39, 0.6)',    // #d73027 - Red (Strong brand2 advantage)
      'rgba(253, 174, 97, 0.6)',   // #fdae61 - Orange (Moderate brand2 advantage)
      'rgba(254, 224, 144, 0.6)',  // #fee090 - Light yellow (Competitive parity)
      'rgba(166, 217, 106, 0.6)',  // Light green - Moderate brand1 advantage  
      'rgba(26, 152, 80, 0.6)'     // Dark green - Strong brand1 advantage
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length; i++) {
      legendItems.push({
        label: this.formatDifferenceLabel(i, quartileBreaks),
        color: colors[i],
        minValue: quartileBreaks[i].min,
        maxValue: quartileBreaks[i].max
      });
    }
    
    return {
      title: 'Brand Market Share Difference (%)',
      items: legendItems,
      position: 'bottom-right'
    };
  }

  private calculateQuartileBreaks(values: number[]): Array<{min: number, max: number}> {
    if (values.length === 0) return [];
    
    const q1 = values[Math.floor(values.length * 0.2)];
    const q2 = values[Math.floor(values.length * 0.4)];
    const q3 = values[Math.floor(values.length * 0.6)];
    const q4 = values[Math.floor(values.length * 0.8)];
    
    return [
      { min: values[0], max: q1 },
      { min: q1, max: q2 },
      { min: q2, max: q3 },
      { min: q3, max: q4 },
      { min: q4, max: values[values.length - 1] }
    ];
  }

  private formatDifferenceLabel(classIndex: number, breaks: Array<{min: number, max: number}>): string {
    const range = breaks[classIndex];
    if (range.max <= -20) return `${range.max.toFixed(0)}%+ Brand 2 Advantage`;
    if (range.max <= 0) return `${range.min.toFixed(0)}% to ${range.max.toFixed(0)}%`;
    if (range.min >= 20) return `${range.min.toFixed(0)}%+ Brand 1 Advantage`;
    if (range.min >= 0) return `${range.min.toFixed(0)}% to ${range.max.toFixed(0)}%`;
    return `${range.min.toFixed(0)}% to ${range.max.toFixed(0)}%`;
  }
}