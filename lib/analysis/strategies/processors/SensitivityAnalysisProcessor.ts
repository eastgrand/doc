/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { getScoreExplanationForAnalysis } from '../../utils/ScoreExplanations';
import { BrandNameResolver } from '../../utils/BrandNameResolver';

/**
 * SensitivityAnalysisProcessor - Handles data processing for sensitivity analysis
 * 
 * Processes sensitivity analysis to understand how changes in key variables
 * affect model predictions and market outcomes.
 */
export class SensitivityAnalysisProcessor implements DataProcessorStrategy {
  private brandResolver: BrandNameResolver;

  constructor() {
    this.brandResolver = new BrandNameResolver();
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Sensitivity analysis requires sensitivity_analysis_score
    const hasRequiredFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        record.sensitivity_analysis_score !== undefined
      );
    
    return hasRequiredFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`🎯 [SENSITIVITY ANALYSIS PROCESSOR] Processing ${rawData.results?.length || 0} records for sensitivity analysis`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for SensitivityAnalysisProcessor');
    }

    const processedRecords = rawData.results.map((record: any, index: number) => {
      const primaryScore = Number(record.sensitivity_analysis_score);
      
      if (isNaN(primaryScore)) {
        throw new Error(`Sensitivity analysis record ${record.ID || index} is missing sensitivity_analysis_score`);
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
        sensitivity_analysis_score: Math.round(primaryScore * 100) / 100,
        rank: 0, // Will be calculated after sorting
        // Flatten top contributing fields to top level for popup access
        ...topContributingFields,
        properties: {
          sensitivity_analysis_score: primaryScore,
          score_source: 'sensitivity_analysis_score',
          target_brand_share: this.extractTargetBrandShare(record),
          total_population: Number(record.total_population || record.value_TOTPOP_CY) || 0,
          median_income: Number(record.median_income || record.value_AVGHINC_CY) || 0
        }
      };
    });
    
    // Calculate statistics
    const statistics = this.calculateStatistics(processedRecords);
    
    // Rank records by sensitivity score
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance
    const featureImportance = this.processFeatureImportance(rawData.feature_importance || []);
    
    // Generate summary
    const summary = this.generateSummary(rankedRecords, statistics);

    const renderer = this.createRenderer(rankedRecords);
    const legend = this.createLegend(rankedRecords);
    
    return {
      type: 'sensitivity_analysis',
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'sensitivity_analysis_score',
      renderer: renderer,
      legend: legend
    };
  }

  private createRenderer(records: GeographicDataPoint[]): any {
    console.log(`🎯 [SENSITIVITY RENDERER] Creating renderer for ${records.length} records`);
    
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Sensitivity colors: Blue (low sensitivity) -> Green -> Yellow -> Red (high sensitivity)
    const sensitivityColors = [
      [49, 130, 189, 0.6],   // Blue (low sensitivity)
      [116, 196, 118, 0.6],  // Green
      [255, 255, 153, 0.6],  // Yellow
      [215, 48, 39, 0.6]     // Red (high sensitivity)
    ];
    
    const classBreakInfos = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      classBreakInfos.push({
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1],
        symbol: {
          type: 'simple-fill',
          color: sensitivityColors[i],
          outline: { color: [0, 0, 0, 0], width: 0 }
        },
        label: this.formatClassLabel(i, quartileBreaks)
      });
    }
    
    return {
      type: 'class-breaks',
      field: 'sensitivity_analysis_score',
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
    
    const sensitivityColors = [
      'rgba(49, 130, 189, 0.6)',   // Blue
      'rgba(116, 196, 118, 0.6)',  // Green
      'rgba(255, 255, 153, 0.6)',  // Yellow
      'rgba(215, 48, 39, 0.6)'     // Red
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length - 1; i++) {
      legendItems.push({
        label: this.formatClassLabel(i, quartileBreaks),
        color: sensitivityColors[i],
        minValue: quartileBreaks[i],
        maxValue: quartileBreaks[i + 1]
      });
    }
    
    return {
      title: 'Sensitivity Score',
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
      { field: 'parameter_sensitivity', source: 'parameter_sensitivity', importance: 25 },
      { field: 'variable_impact', source: 'variable_impact', importance: 20 },
      { field: 'elasticity_measure', source: 'elasticity_measure', importance: 18 },
      { field: 'volatility_index', source: 'volatility_index', importance: 15 },
      { field: 'stability_score', source: 'stability_score', importance: 12 }
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
    // Check for DESCRIPTION field first (common in strategic analysis data)
    if (record.DESCRIPTION && typeof record.DESCRIPTION === 'string') {
      const description = record.DESCRIPTION.trim();
      // Extract city name from parentheses format like "32544 (Hurlburt Field)" -> "Hurlburt Field"
      const nameMatch = description.match(/\(([^)]+)\)/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      // If no parentheses, return the whole description
      return description;
    }
    
    // Try value_DESCRIPTION with same extraction logic
    if (record.value_DESCRIPTION && typeof record.value_DESCRIPTION === 'string') {
      const description = record.value_DESCRIPTION.trim();
      const nameMatch = description.match(/\(([^)]+)\)/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      return description;
    }
    
    // Other name fields
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
    
    return `Area ${record.OBJECTID || 'Unknown'}`;
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
      'sensitivity': 'Parameter sensitivity',
      'elasticity': 'Variable elasticity',
      'volatility': 'Market volatility',
      'stability': 'Model stability',
      'parameter': 'Parameter influence'
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

  private extractTargetBrandShare(record: any): number {
    const brandFields = this.brandResolver.detectBrandFields(record);
    const targetBrand = brandFields.find(bf => bf.isTarget);
    return targetBrand?.value || 0;
  }

  private generateSummary(records: GeographicDataPoint[], statistics: AnalysisStatistics): string {
    let summary = getScoreExplanationForAnalysis('sensitivity-analysis', 'sensitivity_analysis');
    
    const targetBrandName = this.brandResolver.getTargetBrandName();
    summary += `**Sensitivity Analysis Complete:** ${statistics.total} geographic areas analyzed for ${targetBrandName} parameter sensitivity. `;
    summary += `Sensitivity scores range from ${statistics.min.toFixed(1)} to ${statistics.max.toFixed(1)} (average: ${statistics.mean.toFixed(1)}). `;
    
    const topAreas = records.slice(0, 5);
    if (topAreas.length > 0) {
      summary += `**Most Sensitive Areas:** `;
      const topNames = topAreas.map(r => `${r.area_name} (${r.value.toFixed(1)})`);
      summary += `${topNames.join(', ')}. `;
    }
    
    const highSensitivity = records.filter(r => r.value >= (statistics.percentile75 || statistics.mean)).length;
    summary += `**Risk Assessment:** ${highSensitivity} areas (${(highSensitivity/records.length*100).toFixed(1)}%) show high sensitivity to parameter changes. `;
    
    return summary;
  }
}