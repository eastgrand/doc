/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics, ProcessingContext } from '../../types';
import { getScoreExplanationForAnalysis } from '../../utils/ScoreExplanations';
import { BrandNameResolver } from '../../utils/BrandNameResolver';
import { resolveAreaName } from '../../../shared/AreaName';

/**
 * StrategicAnalysisProcessor - Handles data processing for the /strategic-analysis endpoint
 * 
 * Processes strategic market analysis with focus on expansion opportunities,
 * market potential, and strategic value scoring.
 */
export class StrategicAnalysisProcessor implements DataProcessorStrategy {
  private brandResolver: BrandNameResolver;

  constructor() {
    this.brandResolver = new BrandNameResolver();
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Strategic analysis requires strategic_analysis_score (primary) with fallbacks
    const hasRequiredFields = rawData.results.length === 0 ||
      (rawData.results as any[]).some((record: any) =>
        record &&
        ((record as any).area_id || (record as any).id || (record as any).ID) &&
        ((record as any).strategic_analysis_score !== undefined || (record as any).strategic_value_score !== undefined || (record as any).strategic_score !== undefined)
      );
    
    return hasRequiredFields;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  process(rawData: RawAnalysisResult, _context?: ProcessingContext): ProcessedAnalysisData {
    console.log(`🎯 [STRATEGIC ANALYSIS PROCESSOR] Processing ${rawData.results?.length || 0} records for strategic expansion analysis`);
    
    // Debug: Check first raw record
    if (rawData.results && rawData.results.length > 0) {
      const first: any = (rawData.results as any[])[0];
      console.log('🚨 [STRATEGIC PROCESSOR] First raw record DESCRIPTION:', first?.DESCRIPTION);
      console.log('🚨 [STRATEGIC PROCESSOR] First raw record keys:', Object.keys(first || {}).slice(0, 10));
    }
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for StrategicAnalysisProcessor');
    }

  const processedRecords = (rawData.results as any[]).map((record: any, index: number) => {
      // Strategic analysis uses strategic_analysis_score as primary field
      const primaryScore = Number((record as any).strategic_analysis_score || (record as any).strategic_value_score || (record as any).strategic_score);
      
      if (isNaN(primaryScore)) {
        throw new Error(`Strategic analysis record ${(record as any).ID || index} is missing strategic_analysis_score`);
      }
      
      // Generate area name
      const areaName = this.generateAreaName(record);
      const recordId = (record as any).ID || (record as any).id || (record as any).area_id || `area_${index + 1}`;
      
      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);
      
      return {
        area_id: recordId,
        area_name: areaName,
        value: Math.round(primaryScore * 100) / 100,
        strategic_analysis_score: Math.round(primaryScore * 100) / 100, // Add at top level for visualization
        rank: 0, // Will be calculated after sorting
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          DESCRIPTION: (record as any).DESCRIPTION, // Pass through original DESCRIPTION
          strategic_analysis_score: primaryScore,
          score_source: 'strategic_analysis_score',
          target_brand_share: this.extractTargetBrandShare(record),
          market_gap: this.calculateRealMarketGap(record),
          total_population: Number((record as any).total_population || (record as any).value_TOTPOP_CY) || 0,
          median_income: Number((record as any).median_income || (record as any).value_AVGHINC_CY) || 0,
          competitive_advantage_score: Number((record as any).competitive_advantage_score) || 0,
          demographic_opportunity_score: Number((record as any).demographic_opportunity_score) || 0
        }
      };
    });
    
    // Calculate statistics
    const statistics = this.calculateStatistics(processedRecords);
    
    // Rank records by strategic value
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Debug: Check if values are being corrupted
    console.log('🚨 [STRATEGIC PROCESSOR] First 5 processed records with area names:');
    rankedRecords.slice(0, 5).forEach((record, i) => {
      console.log(`🚨   ${i+1}. area_name="${(record as any).area_name}", area_id="${(record as any).area_id}", value=${(record as any).value}`);
      console.log(`🚨      Full record keys:`, Object.keys(record as any));
    });
    
    // Extract feature importance
  const featureImportance = this.processFeatureImportance((rawData.feature_importance as any[]) || []);
    
    // Generate strategic summary
    const summary = this.generateStrategicSummary(rankedRecords, statistics);

    const renderer = this.createStrategicRenderer(rankedRecords);
    const legend = this.createStrategicLegend(rankedRecords);
    
    return {
      type: 'strategic_analysis',
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'strategic_analysis_score',
      renderer: renderer, // Add direct renderer
      legend: legend // Add direct legend with correct formatting
    };
  }

  /**
   * Create ArcGIS renderer directly for strategic analysis
   * Simple, focused approach - no complex abstraction layers
   */
  private createStrategicRenderer(records: GeographicDataPoint[]): any {
    console.log(`🎯 [STRATEGIC RENDERER] Creating direct renderer for ${records.length} records`);
    
    // Calculate quartile breaks directly
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    console.log(`🎯 [STRATEGIC RENDERER] Quartile breaks:`, quartileBreaks);
    
    // Strategic colors: Red (low) -> Orange -> Light Green -> Dark Green (high)
    const strategicColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (lowest strategic value)
      [253, 174, 97, 0.6],  // #fdae61 - Orange  
      [166, 217, 106, 0.6], // #a6d96a - Light Green
      [26, 152, 80, 0.6]    // #1a9850 - Dark Green (highest strategic value)
    ];
    
    // Create class break infos
    const classBreakInfos = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      console.log(`🎯 [STRATEGIC RENDERER] Class ${i + 1}: ${quartileBreaks[i]} - ${quartileBreaks[i + 1]} -> [${strategicColors[i].join(', ')}]`);
      
      classBreakInfos.push({
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1],
        symbol: {
          type: 'simple-fill',
          color: strategicColors[i], // Direct array format
          outline: { color: [0, 0, 0, 0], width: 0 }
        },
        label: this.formatClassLabel(i, quartileBreaks)
      });
    }
    
    const renderer = {
      type: 'class-breaks',
      field: 'strategic_analysis_score', // Use the correct scoring field
      classBreakInfos,
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [0, 0, 0, 0], width: 0 }
      }
    };
    
    console.log(`🎯 [STRATEGIC RENDERER] Created renderer:`, {
      type: renderer.type,
      field: renderer.field,
      classCount: classBreakInfos.length,
      firstClassMinValue: classBreakInfos[0]?.minValue,
      firstClassMaxValue: classBreakInfos[0]?.maxValue,
      lastClassMinValue: classBreakInfos[classBreakInfos.length - 1]?.minValue,
      lastClassMaxValue: classBreakInfos[classBreakInfos.length - 1]?.maxValue,
      sampleRecordValue: records[0]?.value,
      sampleRecordStrategicScore: (records[0]?.properties as any)?.strategic_value_score
    });
    
    return renderer;
  }
  
  /**
   * Calculate quartile breaks for strategic value scores
   */
  private calculateQuartileBreaks(sortedValues: number[]): number[] {
    if (sortedValues.length === 0) return [0, 1];
    
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    
    // Calculate quartile positions
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q2 = sortedValues[Math.floor(sortedValues.length * 0.5)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    
    return [min, q1, q2, q3, max];
  }
  
  /**
   * Create legend directly for strategic analysis with correct formatting and opacity
   */
  private createStrategicLegend(records: GeographicDataPoint[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Strategic colors with 0.6 opacity to match features
    const strategicColors = [
      'rgba(215, 48, 39, 0.6)',   // #d73027 - Red (lowest strategic value)
      'rgba(253, 174, 97, 0.6)',  // #fdae61 - Orange  
      'rgba(166, 217, 106, 0.6)', // #a6d96a - Light Green
      'rgba(26, 152, 80, 0.6)'    // #1a9850 - Dark Green (highest strategic value)
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      legendItems.push({
        label: this.formatClassLabel(i, quartileBreaks),
        color: strategicColors[i],
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1]
      });
    }
    
    return {
      title: 'Strategic Analysis Score',
      items: legendItems,
      position: 'bottom-right'
    };
  }
  
  /**
   * Format class labels with < and > for first and last ranges
   */
  private formatClassLabel(classIndex: number, quartileBreaks: number[]): string {
    const totalClasses = quartileBreaks.length - 1;
    
    if (classIndex === 0) {
      // First class: < maxValue
      return `< ${quartileBreaks[classIndex + 1].toFixed(1)}`;
    } else if (classIndex === totalClasses - 1) {
      // Last class: > minValue  
      return `> ${quartileBreaks[classIndex].toFixed(1)}`;
    } else {
      // Middle classes: minValue - maxValue
      return `${quartileBreaks[classIndex].toFixed(1)} - ${quartileBreaks[classIndex + 1].toFixed(1)}`;
    }
  }

  /**
   * Identify top 5 fields that contribute most to the strategic value score
   * Returns them as a flattened object for popup display
   */
  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    // Define field importance weights based on strategic analysis factors
    const fieldDefinitions = [
      { field: 'competitive_advantage_score', source: 'competitive_advantage_score', importance: 25 },
      { field: 'total_population', source: ['total_population', 'value_TOTPOP_CY'], importance: 20 },
      { field: 'median_income', source: ['median_income', 'value_AVGHINC_CY', 'value_MEDDI_CY'], importance: 18 },
      { field: 'demographic_opportunity_score', source: 'demographic_opportunity_score', importance: 15 },
      { field: 'market_gap', source: ['market_gap'], importance: 12, calculated: true },
      { field: 'diversity_index', source: ['diversity_index', 'value_DIVINDX_CY'], importance: 10 }
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
      
      // Handle calculated fields
      if (fieldDef.calculated && fieldDef.field === 'market_gap') {
        value = this.calculateRealMarketGap(record);
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
    
    console.log(`[StrategicAnalysisProcessor] Top contributing fields for ${(record as any).ID}:`, topFields);
    return topFields;
  }

    private generateAreaName(record: any): string {
      const fallbackId = record?.ID || record?.id || record?.area_id || record?.GEOID || record?.OBJECTID || 'Unknown';
      return resolveAreaName(record, { mode: 'cityOnly', neutralFallback: `Area ${fallbackId}` });
    }

  private rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    const sorted = [...records].sort((a, b) => b.value - a.value);
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1
    }));
  }

  private processFeatureImportance(rawFeatureImportance: any[]): any[] {
    return (rawFeatureImportance as any[]).map((item: any) => ({
      feature: String(item?.feature || item?.name || 'unknown'),
      importance: Number(item?.importance ?? item?.value ?? 0),
      description: this.getFeatureDescription(String(item?.feature || item?.name || 'unknown'))
    })).sort((a, b) => b.importance - a.importance);
  }

  private getFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'market_gap': 'Untapped market potential',
      'population': 'Total population size',
      'income': 'Median household income',
      'competitive': 'Competitive landscape',
      'demographic': 'Demographic factors',
      'brand': 'Target brand presence',
      'strategic': 'Strategic positioning'
    };
    
  const lowerName = String(featureName || '').toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} impact`;
  }

  private calculateStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
    const values = records.map(r => r.value).filter(v => !isNaN(v));
    
    if (values.length === 0) {
      return {
        total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0,
        percentile25: 0, percentile75: 0, iqr: 0, outlierCount: 0
      };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const p25Index = Math.floor(total * 0.25);
    const p75Index = Math.floor(total * 0.75);
    const medianIndex = Math.floor(total * 0.5);
    
    const percentile25 = sorted[p25Index];
    const percentile75 = sorted[p75Index];
    const median = total % 2 === 0 
      ? (sorted[medianIndex - 1] + sorted[medianIndex]) / 2
      : sorted[medianIndex];
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    const iqr = percentile75 - percentile25;
    const lowerBound = percentile25 - 1.5 * iqr;
    const upperBound = percentile75 + 1.5 * iqr;
    const outlierCount = values.filter(v => v < lowerBound || v > upperBound).length;
    
    return {
        total,
        mean,
        median,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        stdDev,
        percentile25,
        percentile75,
        iqr,
        outlierCount
      };
    }

    private generateStrategicSummary(
      records: GeographicDataPoint[],
      statistics: AnalysisStatistics
    ): string {
      // Start with score explanation
      let summary = getScoreExplanationForAnalysis('strategic-analysis', 'strategic_value');
    
      // We don't reference BrandNameResolver target brand here to avoid tight coupling in tests
      summary += `**Strategic Market Analysis Complete:** ${statistics.total} geographic areas evaluated for expansion potential. `;
      summary += `Strategic value scores range from ${statistics.min.toFixed(1)} to ${statistics.max.toFixed(1)} (average: ${statistics.mean.toFixed(1)}). `;
    
      // Top strategic markets
      const topMarkets = records.slice(0, 5);
      if (topMarkets.length > 0) {
        summary += `**Top Strategic Markets:** `;
        const topNames = topMarkets.map(r => `${r.area_name} (${r.value.toFixed(1)})`);
        summary += `${topNames.join(', ')}. `;
      
        // Analyze characteristics of top markets
        const avgMarketGap = topMarkets.reduce((sum, r) => {
          const props = (r.properties || {}) as Record<string, unknown>;
          const val = Number((props as any).market_gap) || 0;
          return sum + val;
        }, 0) / topMarkets.length;
        const avgPopulation = topMarkets.reduce((sum, r) => {
          const props = (r.properties || {}) as Record<string, unknown>;
          const val = Number((props as any).total_population) || 0;
          return sum + val;
        }, 0) / topMarkets.length;
      
        if (isFinite(avgMarketGap)) {
          summary += `These markets show average untapped potential of ${avgMarketGap.toFixed(1)}%`;
        }
        if (isFinite(avgPopulation)) {
          summary += ` and serve ${(avgPopulation/1000).toFixed(0)}K population on average.`;
        }
        summary += ' ';
      }
    
      // Expansion opportunities
      const highPotential = records.filter(r => r.value >= (statistics.percentile75 || statistics.mean)).length;
      if (records.length > 0) {
        summary += `**Expansion Opportunities:** ${highPotential} markets (${(highPotential/records.length*100).toFixed(1)}%) show high strategic value for expansion. `;
      }
    
      // Market insights
  const untappedMarkets = records.filter(r => Number((r.properties as any)?.market_gap) > 80).length;
      if (untappedMarkets > 0) {
        summary += `${untappedMarkets} markets have over 80% untapped potential. `;
      }
    
      // Recommendations
      summary += `**Strategic Recommendations:** `;
      if (topMarkets.length > 0 && topMarkets[0].value >= 8) {
        summary += `Prioritize immediate expansion in top-scoring markets. `;
      }
      summary += `Focus on markets with high market gap and favorable demographics. `;
      summary += `Consider pilot programs in emerging markets scoring above ${(statistics.percentile75 || statistics.mean).toFixed(1)}. `;
    
      return summary;
    }

  /**
   * Extract target brand share using BrandNameResolver
   */
  private extractTargetBrandShare(record: any): number {
    const brandFields = this.brandResolver.detectBrandFields(record);
    const targetBrand = brandFields.find(bf => bf.isTarget);
    return targetBrand?.value || 0;
  }

  /**
   * Calculate real market gap using BrandNameResolver
   */
  private calculateRealMarketGap(record: any): number {
    return this.brandResolver.calculateMarketGap(record);
  }
}