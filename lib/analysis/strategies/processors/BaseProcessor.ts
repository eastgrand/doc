/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { AnalysisConfigurationManager } from '../../AnalysisConfigurationManager';
import { 
  AnalysisContext, 
  FieldMappings, 
  Terminology, 
  ScoreRange,
  SummaryTemplates 
} from '../../../../config/analysis-contexts/base-context';

/**
 * Base class for all analysis processors
 * Provides common functionality and configuration-driven behavior
 */
export abstract class BaseProcessor implements DataProcessorStrategy {
  protected configManager: AnalysisConfigurationManager;
  protected config: AnalysisContext;

  constructor() {
    this.configManager = AnalysisConfigurationManager.getInstance();
    this.config = this.configManager.getCurrentContext();
  }

  /**
   * Abstract method that subclasses must implement
   */
  abstract validate(rawData: RawAnalysisResult): boolean;
  abstract process(rawData: RawAnalysisResult): ProcessedAnalysisData;

  /**
   * Refresh configuration (call when project type changes)
   */
  protected refreshConfig(): void {
    this.config = this.configManager.getCurrentContext();
  }

  /**
   * Extract primary metric from record using configuration
   */
  protected extractPrimaryMetric(record: any): number {
    return this.configManager.extractPrimaryMetric(record);
  }

  /**
   * Extract geographic ID from record using configuration
   */
  protected extractGeographicId(record: any): string {
    return this.configManager.extractGeographicId(record);
  }

  /**
   * Generate area name from record using configuration
   */
  protected generateAreaName(record: any): string {
    return this.configManager.extractDescriptiveName(record);
  }

  /**
   * Get score interpretation for a given score
   */
  protected getScoreInterpretation(score: number): ScoreRange {
    return this.configManager.getScoreInterpretation(score);
  }

  /**
   * Extract field value with fallback options
   */
  protected extractFieldValue(record: any, fieldNames: string[]): any {
    for (const fieldName of fieldNames) {
      if (record[fieldName] !== undefined && record[fieldName] !== null) {
        return record[fieldName];
      }
    }
    return null;
  }

  /**
   * Extract numeric field value with fallback options
   */
  protected extractNumericValue(record: any, fieldNames: string[], defaultValue: number = 0): number {
    const value = this.extractFieldValue(record, fieldNames);
    if (value !== null) {
      const numValue = Number(value);
      return isNaN(numValue) ? defaultValue : numValue;
    }
    return defaultValue;
  }

  /**
   * Calculate statistics for an array of values
   */
  protected calculateStatistics(values: number[]): AnalysisStatistics {
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

    // Calculate percentiles
    const p25Index = Math.floor(total * 0.25);
    const p75Index = Math.floor(total * 0.75);
    const medianIndex = Math.floor(total * 0.5);

    const percentile25 = sorted[p25Index];
    const percentile75 = sorted[p75Index];
    const median = sorted[medianIndex];
    const iqr = percentile75 - percentile25;

    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);

    // Count outliers (values beyond 1.5 * IQR from quartiles)
    const lowerBound = percentile25 - (1.5 * iqr);
    const upperBound = percentile75 + (1.5 * iqr);
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

  /**
   * Rank records by their value (highest first)
   */
  protected rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    return records.sort((a, b) => b.value - a.value).map((record, index) => ({
      ...record,
      rank: index + 1
    }));
  }

  /**
   * Group records by a field value
   */
  protected groupRecordsByField(records: any[], fieldName: string): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    
    records.forEach(record => {
      const value = String(record[fieldName] || 'Unknown');
      if (!groups.has(value)) {
        groups.set(value, []);
      }
      groups.get(value)!.push(record);
    });
    
    return groups;
  }

  /**
   * Apply template substitutions using configuration manager
   */
  protected applyTemplate(template: string, substitutions: Record<string, any>): string {
    return this.configManager.applyTemplate(template, substitutions);
  }

  /**
   * Build summary from template patterns
   */
  protected buildSummaryFromTemplates(
    records: GeographicDataPoint[], 
    statistics: AnalysisStatistics,
    customSubstitutions: Record<string, any> = {}
  ): string {
    const templates = this.configManager.getSummaryTemplates();
    const terminology = this.configManager.getTerminology();
    
    // Basic statistics for substitution
    const baseSubstitutions = {
      totalAreas: records.length,
      avgScore: statistics.mean.toFixed(1),
      minScore: statistics.min.toFixed(1),
      maxScore: statistics.max.toFixed(1),
      scoreRange: (statistics.max - statistics.min).toFixed(1),
      ...customSubstitutions
    };

    // Build title
    let summary = this.applyTemplate(templates.analysisTitle, baseSubstitutions) + '\n\n';
    
    // Add methodology explanation
    summary += this.applyTemplate(templates.methodologyExplanation, baseSubstitutions) + '\n\n';
    
    // Calculate performance distribution
    const scoreRanges = this.configManager.getScoreRanges();
    const excellentCount = records.filter(r => r.value >= scoreRanges.excellent.min).length;
    const goodCount = records.filter(r => r.value >= scoreRanges.good.min && r.value < scoreRanges.excellent.min).length;
    const moderateCount = records.filter(r => r.value >= scoreRanges.moderate.min && r.value < scoreRanges.good.min).length;
    const poorCount = records.filter(r => r.value < scoreRanges.moderate.min).length;

    const distributionSubstitutions = {
      ...baseSubstitutions,
      excellentCount,
      goodCount,
      moderateCount,
      poorCount
    };

    // Add insights
    summary += '**Key Insights:**\n';
    templates.insightPatterns.forEach(pattern => {
      const insight = this.applyTemplate(pattern, distributionSubstitutions);
      summary += `• ${insight}\n`;
    });
    summary += '\n';

    // Add recommendations
    summary += '**Recommendations:**\n';
    templates.recommendationPatterns.forEach(pattern => {
      const recommendation = this.applyTemplate(pattern, distributionSubstitutions);
      summary += `• ${recommendation}\n`;
    });

    return summary;
  }

  /**
   * Create standardized processed data structure
   */
  protected createProcessedData(
    type: string,
    records: GeographicDataPoint[],
    summary: string,
    statistics: AnalysisStatistics,
    additionalData: Partial<ProcessedAnalysisData> = {}
  ): ProcessedAnalysisData {
    return {
      type,
      records,
      summary,
      statistics,
      targetVariable: this.configManager.getFieldMapping('primaryMetric')[0] || 'value',
      featureImportance: [],
      renderer: null,
      legend: null,
      ...additionalData
    };
  }

  /**
   * Log processor activity with configuration context
   */
  protected log(message: string, data?: any): void {
    const projectType = this.configManager.getCurrentProjectType();
    console.log(`[${this.constructor.name}:${projectType}] ${message}`, data || '');
  }

  /**
   * Log warning with configuration context
   */
  protected warn(message: string, data?: any): void {
    const projectType = this.configManager.getCurrentProjectType();
    console.warn(`[${this.constructor.name}:${projectType}] ${message}`, data || '');
  }
}