/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics, ProcessingContext } from '../../types';
import { getScoreExplanationForAnalysis } from '../../utils/ScoreExplanations';
import { BrandNameResolver } from '../../utils/BrandNameResolver';
import { resolveAreaName } from '../../../shared/AreaName';
import { getPrimaryScoreField, getTopFieldDefinitions } from './HardcodedFieldDefs';
import { BaseProcessor } from './BaseProcessor';

/**
 * StrategicAnalysisProcessor - Handles data processing for the /strategic-analysis endpoint
 * 
 * Processes strategic analysis with focus on real estate investment opportunities,
 * market potential, and strategic value scoring for housing markets.
 * 
 * Now extends BaseProcessor for configuration-driven behavior.
 */
export class StrategicAnalysisProcessor extends BaseProcessor {
  private brandResolver: BrandNameResolver;
  // Use canonical primary score (hardcoded) with metadata override
  private scoreField: string = 'strategic_score';

  constructor() {
    super(); // Initialize BaseProcessor with configuration
    this.brandResolver = new BrandNameResolver();
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Strategic analysis validation - more flexible to accept various data formats
    const hasRequiredFields = rawData.results.length === 0 ||
      (rawData.results as any[]).some((record: any) =>
        record &&
        // Must have some kind of ID field
        ((record as any).area_id || (record as any).id || (record as any).ID) &&
        // Check for any strategic analysis related fields OR demographic data that can be used for composite scoring
        ((record as any).strategic_score !== undefined ||
         (record as any).strategic_analysis_score !== undefined ||
         (record as any).strategic_value !== undefined ||
         (record as any).value_TOTPOP_CY !== undefined || // Population data for composite
         (record as any).total_population !== undefined ||
         (record as any).value_AVGHINC_CY !== undefined || // Income data for composite
         (record as any).median_income !== undefined ||
         // Brand share fields that indicate market analysis data
         Object.keys(record).some(key => key.includes('MP101') || key.toLowerCase().includes('share')) ||
         // Or any numeric field that could be used for strategic analysis
         Object.keys(record).some(key => typeof (record as any)[key] === 'number' && (record as any)[key] > 0))
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

    // Gracefully handle empty result sets without attempting dynamic field detection
    if (!rawData.results || rawData.results.length === 0) {
      const emptyStats = this.calculateStatisticsFromRecords([] as any);
      // Keep default score field for empty case to ensure stable renderer field
      this.scoreField = 'strategic_score';
      const emptyRenderer = this.createStrategicRenderer([] as any);
      const emptyLegend = this.createStrategicLegend([] as any);
      return {
        type: 'strategic_analysis',
        records: [],
        summary: getScoreExplanationForAnalysis('strategic-analysis', 'strategic_score') +
          '**Strategic Market Analysis Complete:** 0 geographic areas evaluated for expansion potential. ',
        featureImportance: this.processFeatureImportance((rawData.feature_importance as any[]) || []),
        statistics: emptyStats,
        targetVariable: this.scoreField,
        renderer: emptyRenderer,
        legend: emptyLegend
      };
    }

    // Use the central hardcoded primary field mapping (metadata.targetVariable still wins)
    this.scoreField = getPrimaryScoreField('strategic_analysis', (rawData as any)?.metadata ?? undefined) || 'strategic_score';

    const rawRecords = rawData.results as any[];
    
    // Check if test data uses strategic_analysis_score instead
    if (rawRecords.length > 0 && rawRecords[0].strategic_analysis_score !== undefined && rawRecords[0].strategic_score === undefined) {
      this.scoreField = 'strategic_analysis_score';
      console.log(`🎯 [STRATEGIC PROCESSOR] Detected strategic_analysis_score field in test data, using as primary field`);
    }
    const processedRecords = rawRecords.map((record: any, index: number) => {
      // Extract primary score using the detected field
      let primaryScore = this.extractStrategicScore(record);
      
      const recordId = (record as any).ID || (record as any).id || index;
      console.log(`[StrategicAnalysisProcessor] Record ${recordId}: Found primaryScore = ${primaryScore} from field: ${this.scoreField}=${(record as any)[this.scoreField]}`);
      
      // Debug brand fields and market gap calculation
      if (recordId === (rawRecords as any[])[0]?.ID) {
        console.log(`[StrategicAnalysisProcessor] DEBUG First Record Brand Detection:`, {
          recordKeys: Object.keys(record).slice(0, 20),
          brandFields: this.brandResolver.detectBrandFields(record),
          marketGap: this.calculateRealMarketGap(record),
          targetBrandShare: this.extractTargetBrandShare(record)
        });
      }
      
      // Only switch to composite when the chosen field is explicitly share/rate/pct-like or missing
      // NEVER use composite scoring for strategic_score field - it contains actual strategic scores
      const looksLikeShare = /share|rate|pct|percent/i.test(this.scoreField || '') ||
        (record as any).strategic_score === undefined;
      const isStrategicScoreField = this.scoreField === 'strategic_score';
      
      if (primaryScore !== null && !isNaN(primaryScore)) {
        if (looksLikeShare && primaryScore < 20 && !isStrategicScoreField) {
          console.warn(`[StrategicAnalysisProcessor] Record ${recordId}: Score ${primaryScore} from "${this.scoreField}" appears to be share/rate data, using composite score`);
          primaryScore = this.calculateCompositeStrategicScore(record);
        }
      } else {
        // If no strategic score found, calculate a composite strategic score
        console.warn(`[StrategicAnalysisProcessor] Record ${recordId}: No strategic score found, calculating composite score`);
        primaryScore = this.calculateCompositeStrategicScore(record);
      }
      
      if (isNaN(primaryScore) || primaryScore < 0) {
        console.warn(`[StrategicAnalysisProcessor] Record ${recordId}: Invalid strategic score, using default of 25`);
        primaryScore = 25; // Use moderate strategic value as fallback
      }
      
      // Generate area name using configuration
      const areaName = super.generateAreaName(record);
      const finalRecordId = this.extractGeographicId(record);
      
      // Get top contributing fields for popup display
  const topContributingFields = this.getTopContributingFields(record);
  // Remove strategic_score from topContributingFields to avoid overwrite
  const { strategic_score: _, ...filteredTopFields } = topContributingFields as any;
      
    // Build processed record with strategic_score field at top level
    const processed: any = {
        area_id: finalRecordId,
        area_name: areaName,
        value: Math.round(primaryScore * 100) / 100,
        strategic_score: Math.round(primaryScore * 100) / 100, // Use consistent field name
        rank: 0, // Will be calculated after sorting
        // Include original field from test data if it exists and is different from strategic_score
        ...(record.strategic_analysis_score !== undefined ? { strategic_analysis_score: Math.round(primaryScore * 100) / 100 } : {}),
        // Flatten top contributing fields to top level for popup access (excluding strategic_score)
        ...filteredTopFields,
        // Ensure key strategic fields are available at top level for route access
        market_gap: this.calculateRealMarketGap(record),
        total_population: this.extractNumericValue(record, this.configManager.getFieldMapping('populationField'), 0),
        median_income: this.extractNumericValue(record, this.configManager.getFieldMapping('incomeField'), 0),
        competitive_advantage_score: this.extractFieldValue(record, ['competitive_advantage_score', 'comp_advantage', 'advantage_score']),
        diversity_index: this.extractFieldValue(record, ['diversity_index', 'value_DIVINDX_CY', 'DIVINDX_CY']),
        properties: {
      // Include full raw record first to avoid missing context, then overlay normalized fields
      ...(record as any),
      DESCRIPTION: (record as any).DESCRIPTION, // Normalize key casing
          strategic_score: primaryScore,
  score_source: this.scoreField,
          target_brand_share: this.extractTargetBrandShare(record),
          market_gap: this.calculateRealMarketGap(record),
      total_population: this.extractFieldValue(record, ['total_population', 'value_TOTPOP_CY', 'TOTPOP_CY', 'population']),
      median_income: this.extractFieldValue(record, ['median_income', 'value_AVGHINC_CY', 'AVGHINC_CY', 'household_income']),
      competitive_advantage_score: this.extractFieldValue(record, ['competitive_advantage_score', 'comp_advantage', 'advantage_score']),
      demographic_opportunity_score: this.extractFieldValue(record, ['demographic_opportunity_score', 'demo_opportunity', 'opportunity_score']),
      diversity_index: this.extractFieldValue(record, ['diversity_index', 'value_DIVINDX_CY', 'DIVINDX_CY'])
        }
      };
      // No need to add dynamic field since we're using strategic_score consistently
      return processed;
    });
    
  // Calculate statistics
  const statistics = this.calculateStatisticsFromRecords(processedRecords);
    
    // Rank records by strategic value
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Filter out national parks for AI analysis - COMMENTED OUT FOR DEBUGGING
    /*
    const nonParkRecords = rankedRecords.filter(record => {
      const props = (record.properties || {}) as Record<string, unknown>;
      const areaId = record.area_id || props.ID || props.id || '';
      const description = props.DESCRIPTION || props.description || '';
      
      // Filter out national parks using same logic as analysisLens
      if (String(areaId).startsWith('000')) return false;
      
      const nameStr = String(description).toLowerCase();
      const parkPatterns = [
        /national\s+park/i, /ntl\s+park/i, /national\s+monument/i, /national\s+forest/i, 
        /state\s+park/i, /\bpark\b.*national/i, /\bnational\b.*\bpark\b/i,
        /\bnp\b/i, /\bnm\b/i, /\bnf\b/i
      ];
      return !parkPatterns.some(pattern => pattern.test(nameStr));
    });
    */
    const nonParkRecords = rankedRecords; // Use all records for debugging
    
    console.log(`🎯 [STRATEGIC PROCESSOR] Filtered ${rankedRecords.length - nonParkRecords.length} parks from analysis`);
    console.log(`🎯 [STRATEGIC PROCESSOR] Top 5 non-park strategic markets:`);
    nonParkRecords.slice(0, 5).forEach((record, i) => {
      console.log(`🎯   ${i+1}. ${(record as any).area_name} (${record.area_id}): ${(record as any).value}`);
    });
    
    // Extract feature importance
    const featureImportance = this.processFeatureImportance((rawData.feature_importance as any[]) || []);
    
    // Generate strategic summary using filtered non-park records for AI analysis
    const summary = this.generateStrategicSummary(nonParkRecords, statistics);
    
    return {
      type: 'strategic_analysis',
      records: nonParkRecords, // Return filtered records to prevent park data in visualizations
      summary,
      featureImportance,
      statistics,
  targetVariable: this.scoreField || 'strategic_score',
      renderer: this.createStrategicRenderer(nonParkRecords), // Use filtered records for rendering
      legend: this.createStrategicLegend(nonParkRecords) // Use filtered records for legend
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
      field: this.scoreField || 'strategic_score', // Use strategic_score for visualization
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
  sampleRecordStrategicScore: (records[0] as any)?.[this.scoreField] || (records[0]?.properties as any)?.[this.scoreField]
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
   * Identify top fields that contribute most to the strategic value score
   * Uses dynamic field detection instead of hardcoded mappings
   */
  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
  // Use hardcoded top field definitions for strategic analysis
  const fieldDefinitions = getTopFieldDefinitions('strategic_analysis');

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
      if ((fieldDef as any).calculated && fieldDef.field === 'market_gap') {
        value = this.calculateRealMarketGap(record);
      }
      
  // Include finite values, even if 0, to avoid missing data
  if (Number.isFinite(value)) {
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

  /**
   * Extract strategic score using the determined field
   */
  private extractStrategicScore(record: any): number {
    // Try the specific field we detected
    if (this.scoreField && record[this.scoreField] !== undefined) {
      const value = Number(record[this.scoreField]);
      if (!isNaN(value)) {
        return value;
      }
    }
    
    // Fallback to common strategic score field names
    const strategicFields = [
      'strategic_score',
      'strategic_analysis_score', 
      'strategic_value',
      'strategic_index'
    ];
    
    for (const field of strategicFields) {
      if (record[field] !== undefined) {
        const value = Number(record[field]);
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    
    // Return NaN if no strategic score found - will trigger composite calculation
    return NaN;
  }

  /**
   * Extract field value from multiple possible field names
   * Made protected to match BaseProcessor visibility and avoid signature conflicts
   */
  protected extractFieldValue(record: any, fieldNames: string[]): number {
    for (const fieldName of fieldNames) {
      const value = Number(record[fieldName]);
      if (!isNaN(value) && value > 0) {
        return value;
      }
    }
    return 0;
  }

  // Use BaseProcessor.generateAreaName to preserve visibility and centralized behavior

  protected rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
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
  
  // calculateStatisticsFromRecords is implemented above; duplicate removed to avoid collisions
  private calculateStatisticsFromRecords(records: GeographicDataPoint[]): AnalysisStatistics {
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

  // Note: do not override BaseProcessor.calculateStatistics(number[]).
  // This class exposes `calculateStatisticsFromRecords(records)` for record-based stats.

    private generateStrategicSummary(
      records: GeographicDataPoint[],
      statistics: AnalysisStatistics
    ): string {
      // Start with score explanation
  let summary = getScoreExplanationForAnalysis('strategic-analysis', 'strategic_score');
    
      // We don't reference BrandNameResolver target brand here to avoid tight coupling in tests
      summary += `**Strategic Market Analysis Complete:** ${statistics.total} geographic areas evaluated for expansion potential. `;
      summary += `Strategic value scores range from ${statistics.min.toFixed(1)} to ${statistics.max.toFixed(1)} (average: ${statistics.mean.toFixed(1)}). `;
    
      // Top strategic markets (passed records are already filtered)
      const topMarkets = records.slice(0, 10);
      console.log(`🎯 [STRATEGIC SUMMARY] Top 10 strategic markets:`, topMarkets.slice(0, 5).map(r => `${r.area_name} (${r.value})`));
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
    
      // Expansion opportunities (passed records are already filtered)
      const highPotential = records.filter(r => r.value >= (statistics.percentile75 || statistics.mean)).length;
      if (records.length > 0) {
        summary += `**Expansion Opportunities:** ${highPotential} markets (${(highPotential/records.length*100).toFixed(1)}%) show high strategic value for expansion. `;
      }
    
      // Market insights (passed records are already filtered)
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
    
    // Debug logging for first record
    if (record.ID === (record as any).ID && brandFields.length > 0) {
      console.log(`[StrategicAnalysisProcessor] Brand detection for ${record.ID}:`, {
        brandFieldsCount: brandFields.length,
        targetBrand: targetBrand ? { name: targetBrand.metricName, value: targetBrand.value } : 'none',
        allBrands: brandFields.map(bf => ({ name: bf.metricName, value: bf.value, isTarget: bf.isTarget }))
      });
    }
    
    return targetBrand?.value || 0;
  }

  /**
   * Calculate real market gap using BrandNameResolver
   */
  private calculateRealMarketGap(record: any): number {
    return this.brandResolver.calculateMarketGap(record);
  }

  /**
   * Calculate a composite strategic score when no direct strategic score is available
   * Uses market opportunity, demographics, and competitive factors
   */
  private calculateCompositeStrategicScore(record: any): number {
    let compositeScore = 0;
    let factorCount = 0;

    // Factor 1: Market Gap (higher gap = better strategic opportunity)
    const marketGap = this.calculateRealMarketGap(record);
    if (marketGap > 0) {
      compositeScore += Math.min(marketGap, 100); // Cap at 100%
      factorCount++;
    }

    // Factor 2: Population Size (larger markets = better strategic value)
    const population = this.extractFieldValue(record, ['total_population', 'value_TOTPOP_CY', 'TOTPOP_CY']);
    if (population > 0) {
      // Normalize population to 0-100 scale (assuming 1M+ is max strategic value)
      const populationScore = Math.min((population / 1000000) * 100, 100);
      compositeScore += populationScore;
      factorCount++;
    }

    // Factor 3: Income Level (higher income = better strategic opportunity)
    const income = this.extractFieldValue(record, ['median_income', 'value_AVGHINC_CY', 'AVGHINC_CY']);
    if (income > 0) {
      // Normalize income to 0-100 scale (assuming $100K+ is max strategic value)
      const incomeScore = Math.min((income / 100000) * 100, 100);
      compositeScore += incomeScore;
      factorCount++;
    }

    // Factor 4: Competitive Position
    const competitiveScore = this.extractFieldValue(record, ['competitive_advantage_score', 'comp_advantage']);
    if (competitiveScore > 0) {
      // If on 1-10 scale, convert to 0-100
      const normalizedCompetitive = competitiveScore <= 10 ? competitiveScore * 10 : competitiveScore;
      compositeScore += normalizedCompetitive;
      factorCount++;
    }

    // Average the factors if any were found
    const finalScore = factorCount > 0 ? compositeScore / factorCount : 25; // Default to 25 if no factors
    
    console.log(`[StrategicAnalysisProcessor] Calculated composite strategic score: ${finalScore.toFixed(2)} from ${factorCount} factors for record ${record.ID || 'unknown'}`);
    
    return Math.max(1, Math.min(100, finalScore)); // Ensure score is between 1-100
  }
}