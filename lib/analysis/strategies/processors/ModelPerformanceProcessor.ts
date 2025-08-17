/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { getScoreExplanationForAnalysis } from '../../utils/ScoreExplanations';
import { BrandNameResolver } from '../../utils/BrandNameResolver';

/**
 * ModelPerformanceProcessor - Handles data processing for model performance analysis
 * 
 * Processes model performance metrics to evaluate predictive accuracy
 * and reliability across different geographic areas.
 */
export class ModelPerformanceProcessor implements DataProcessorStrategy {
  private brandResolver: BrandNameResolver;

  constructor() {
    this.brandResolver = new BrandNameResolver();
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Model performance requires model_performance_score
    const hasRequiredFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        record.model_performance_score !== undefined
      );
    
    return hasRequiredFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`🎯 [MODEL PERFORMANCE PROCESSOR] Processing ${rawData.results?.length || 0} records for model performance analysis`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for ModelPerformanceProcessor');
    }

    const processedRecords = rawData.results.map((record: any, index: number) => {
      const primaryScore = Number(record.model_performance_score);
      
      if (isNaN(primaryScore)) {
        throw new Error(`Model performance record ${record.ID || index} is missing model_performance_score`);
      }
      
      // Generate area name
      const areaName = this.generateAreaName(record);
      const recordId = record.ID || record.id || record.area_id || `area_${index + 1}`;
      
      // Get top contributing fields for popup display
      const topContributingFields = this.getTopContributingFields(record);
      
      return {
        area_id: recordId,
        area_name: areaName,
        value: Math.round(primaryScore * 100) / 100,
        model_performance_score: Math.round(primaryScore * 100) / 100,
        rank: 0, // Will be calculated after sorting
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          ...record,
          model_performance_score: primaryScore,
          score_source: 'model_performance_score'
        }
      };
    });
    
    // Calculate statistics
    const statistics = this.calculateStatistics(processedRecords);
    
    // Rank records by performance score
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance
    const featureImportance = this.processFeatureImportance(rawData.feature_importance || []);
    
    // Generate summary
    const summary = this.generateSummary(rankedRecords, statistics);

    const renderer = this.createRenderer(rankedRecords);
    const legend = this.createLegend(rankedRecords);
    
    return {
      type: 'model_performance',
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'model_performance_score',
      renderer: renderer,
      legend: legend
    };
  }

  private createRenderer(records: GeographicDataPoint[]): any {
    console.log(`🎯 [MODEL PERFORMANCE RENDERER] Creating renderer for ${records.length} records`);
    
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Performance colors: Red (poor) -> Orange -> Yellow -> Green (excellent)
    const performanceColors = [
      [215, 48, 39, 0.6],   // Red (poor performance)
      [253, 174, 97, 0.6],  // Orange
      [255, 255, 191, 0.6], // Yellow
      [26, 152, 80, 0.6]    // Green (excellent performance)
    ];
    
    const classBreakInfos = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      classBreakInfos.push({
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1],
        symbol: {
          type: 'simple-fill',
          color: performanceColors[i],
          outline: { color: [0, 0, 0, 0], width: 0 }
        },
        label: this.formatClassLabel(i, quartileBreaks)
      });
    }
    
    return {
      type: 'class-breaks',
      field: 'model_performance_score',
      classBreakInfos,
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [0, 0, 0, 0], width: 0 }
      }
    };
  }

  private createLegend(records: GeographicDataPoint[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    const performanceColors = [
      'rgba(215, 48, 39, 0.6)',   // Red
      'rgba(253, 174, 97, 0.6)',  // Orange
      'rgba(255, 255, 191, 0.6)', // Yellow
      'rgba(26, 152, 80, 0.6)'    // Green
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      legendItems.push({
        label: this.formatClassLabel(i, quartileBreaks),
        color: performanceColors[i],
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1]
      });
    }
    
    return {
      title: 'Model Performance Score',
      items: legendItems,
      position: 'bottom-right'
    };
  }

  private calculateQuartileBreaks(sortedValues: number[]): number[] {
    if (sortedValues.length === 0) return [0, 1];
    
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
    const q2 = sortedValues[Math.floor(sortedValues.length * 0.5)];
    const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
    
    return [min, q1, q2, q3, max];
  }

  private formatClassLabel(classIndex: number, quartileBreaks: number[]): string {
    const totalClasses = quartileBreaks.length - 1;
    
    if (classIndex === 0) {
      return `< ${quartileBreaks[classIndex + 1].toFixed(1)}`;
    } else if (classIndex === totalClasses - 1) {
      return `> ${quartileBreaks[classIndex].toFixed(1)}`;
    } else {
      return `${quartileBreaks[classIndex].toFixed(1)} - ${quartileBreaks[classIndex + 1].toFixed(1)}`;
    }
  }

  private getTopContributingFields(record: any): Record<string, number> {
    const contributingFields: Array<{field: string, value: number, importance: number}> = [];
    
    const fieldDefinitions = [
      { field: 'accuracy_score', source: 'accuracy_score', importance: 25 },
      { field: 'precision_score', source: 'precision_score', importance: 20 },
      { field: 'recall_score', source: 'recall_score', importance: 18 },
      { field: 'f1_score', source: 'f1_score', importance: 15 },
      { field: 'rmse_score', source: 'rmse_score', importance: 12 }
    ];
    
    fieldDefinitions.forEach(fieldDef => {
      const value = Number(record[fieldDef.source]);
      if (!isNaN(value) && value > 0) {
        contributingFields.push({
          field: fieldDef.field,
          value: Math.round(value * 100) / 100,
          importance: fieldDef.importance
        });
      }
    });
    
    return contributingFields
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .reduce((acc, item) => {
        acc[item.field] = item.value;
        return acc;
      }, {} as Record<string, number>);
  }

  private generateAreaName(record: any): string {
    if (record.value_DESCRIPTION) return record.value_DESCRIPTION;
    if (record.DESCRIPTION) return record.DESCRIPTION;
    if (record.area_name) return record.area_name;
    if (record.NAME) return record.NAME;
    if (record.name) return record.name;
    
    const id = record.ID || record.id || record.GEOID;
    if (id) {
      if (typeof id === 'string' && id.match(/^\d{5}$/)) {
        return `ZIP ${id}`;
      }
      if (typeof id === 'string' && id.match(/^[A-Z]\d[A-Z]$/)) {
        return `FSA ${id}`;
      }
      return `Area ${id}`;
    }
    
    return 'Unknown Area';
  }

  private rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    const sorted = [...records].sort((a, b) => b.value - a.value);
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1
    }));
  }

  private processFeatureImportance(rawFeatureImportance: any[]): any[] {
    return rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getFeatureDescription(item.feature || item.name)
    })).sort((a, b) => b.importance - a.importance);
  }

  private getFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'accuracy': 'Model accuracy',
      'precision': 'Prediction precision',
      'recall': 'Model recall',
      'f1': 'F1 score metric',
      'rmse': 'Root mean square error'
    };
    
    const lowerName = featureName.toLowerCase();
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

  private generateSummary(records: GeographicDataPoint[], statistics: AnalysisStatistics): string {
    let summary = getScoreExplanationForAnalysis('model-performance', 'model_performance');
    
    const targetBrandName = this.brandResolver.getTargetBrandName();
    summary += `**Model Performance Analysis Complete:** ${statistics.total} geographic areas evaluated for ${targetBrandName} model accuracy. `;
    summary += `Performance scores range from ${statistics.min.toFixed(1)} to ${statistics.max.toFixed(1)} (average: ${statistics.mean.toFixed(1)}). `;
    
    const topAreas = records.slice(0, 5);
    if (topAreas.length > 0) {
      summary += `**Best Performing Areas:** `;
      const topNames = topAreas.map(r => `${r.area_name} (${r.value.toFixed(1)})`);
      summary += `${topNames.join(', ')}. `;
    }
    
    const highPerformance = records.filter(r => r.value >= (statistics.percentile75 || statistics.mean)).length;
    summary += `**Model Reliability:** ${highPerformance} areas (${(highPerformance/records.length*100).toFixed(1)}%) show high model performance. `;
    
    return summary;
  }
}