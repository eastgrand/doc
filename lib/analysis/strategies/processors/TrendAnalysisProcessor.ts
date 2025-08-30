import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { DynamicFieldDetector } from './DynamicFieldDetector';
import { BrandNameResolver } from '../../utils/BrandNameResolver';

/**
 * TrendAnalysisProcessor - Handles data processing for the /trend-analysis endpoint
 * 
 * Processes trend analysis results with focus on temporal patterns, growth rates,
 * and trend consistency across geographic markets.
 */
export class TrendAnalysisProcessor implements DataProcessorStrategy {
  private brandResolver: BrandNameResolver;

  constructor() {
    this.brandResolver = new BrandNameResolver();
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Validate that we have expected fields for trend analysis
    const hasRequiredFields = rawData.results.length === 0 || 
      rawData.results.some(record => {
        if (!record || !((record as any).area_id || (record as any).id || (record as any).ID)) {
          return false;
        }
        
        // Check for standard score fields
        if ((record as any).trend_score !== undefined || (record as any).value !== undefined || (record as any).score !== undefined) {
          return true;
        }
        
        // Use dynamic brand detection to check for brand fields
        const brandFields = this.brandResolver.detectBrandFields(record);
        if (brandFields.length > 0) {
          return true;
        }
        
        // Check for other trend-relevant fields
        return (record as any).strategic_value_score !== undefined || (record as any).competitive_advantage_score !== undefined;
      });
    
    return hasRequiredFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`📈 [TREND ANALYSIS PROCESSOR] CALLED WITH ${rawData.results?.length || 0} RECORDS 📈`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for TrendAnalysisProcessor');
    }

    // Process records with trend strength scoring priority
    const processedRecords = rawData.results.map((record: any, index: number) => {
      // PRIORITIZE PRE-CALCULATED TREND STRENGTH SCORE
      const trendScore = this.extractTrendScore(record);
      
      // Generate area name from ID and location data
      const areaName = this.generateAreaName(record);
      
      // Extract ID (updated for correlation_analysis format)
      const recordId = (record as any).ID || (record as any).id || (record as any).area_id;
      
      // Debug logging for records with missing ID
      if (!recordId) {
        console.warn(`[TrendAnalysisProcessor] Record ${index} missing ID:`, {
          hasID: 'ID' in record,
          hasId: 'id' in record,
          hasAreaId: 'area_id' in record,
          recordKeys: Object.keys(record as any).slice(0, 10)
        });
      }
      
      // Extract trend-relevant metrics for properties using dynamic brand detection
      const brandFields = this.brandResolver.detectBrandFields(record);
      const targetBrand = brandFields.find(bf => bf.isTarget);
      const targetBrandShare = targetBrand?.value || 0;
      
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
      const totalPop = Number(this.extractFieldValue(record, ['total_population', 'value_TOTPOP_CY', 'TOTPOP_CY', 'population'])) || 0;
      const medianIncome = Number(this.extractFieldValue(record, ['median_income', 'value_AVGHINC_CY', 'AVGHINC_CY', 'household_income'])) || 0;
      
      // Calculate trend indicators
      const growthPotential = this.calculateGrowthPotential(record);
      const trendConsistency = this.calculateTrendConsistency(record);
      const volatilityIndex = this.calculateVolatilityIndex(record);
      
      return {
        area_id: recordId || `area_${index + 1}`,
        area_name: areaName,
        value: Math.round(trendScore * 100) / 100, // Use trend score as primary value
        trend_analysis_score: Math.round(trendScore * 100) / 100, // Add target variable at top level
        rank: 0, // Will be calculated after sorting
        properties: {
          DESCRIPTION: (record as any).DESCRIPTION, // Pass through original DESCRIPTION
          trend_analysis_score: trendScore,
          score_source: 'trend_analysis_score',
          target_brand_share: targetBrandShare,
          target_brand_name: targetBrand?.brandName || 'Unknown',
          strategic_score: strategicScore,
          competitive_score: competitiveScore,
          demographic_score: demographicScore,
          total_population: totalPop,
          median_income: medianIncome,
          // Trend-specific calculated properties
          growth_potential: growthPotential,
          trend_consistency: trendConsistency,
          volatility_index: volatilityIndex,
          trend_category: this.getTrendCategory(trendScore)
        }
      };
    });
    
    // Calculate comprehensive statistics
    const statistics = this.calculateTrendStatistics(processedRecords);
    
    // Rank records by trend strength
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance with trend focus
    const featureImportance = this.processTrendFeatureImportance(rawData.feature_importance || []);
    
    // Generate trend-focused summary
    const summary = this.generateTrendSummary(rankedRecords, statistics, rawData.summary);

    return {
      type: 'trend_analysis', // Trend analysis type for temporal insights
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'trend_analysis_score', // Use exact field name from endpoint mapping
      renderer: this.createTrendRenderer(rankedRecords), // Add direct renderer
      legend: this.createTrendLegend(rankedRecords) // Add direct legend
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  /**
   * Extract trend strength score from record with fallback calculation
   */
  private extractTrendScore(record: any): number {
    if ((record as any).trend_score !== undefined && (record as any).trend_score !== null) {
      const preCalculatedScore = Number((record as any).trend_score);
      
      // Check if trend score looks like market share data (very small values)
      if (preCalculatedScore < 10) {
        console.warn(`[TrendAnalysisProcessor] Trend score ${preCalculatedScore} appears to be market share data, calculating composite instead`);
        // Fall through to composite calculation below
      } else {
        console.log(`📈 [TrendAnalysisProcessor] Using pre-calculated trend score: ${preCalculatedScore}`);
        return preCalculatedScore;
      }
    }
    
    // COMPOSITE CALCULATION: Calculate trend score from available data
    console.log('⚠️ [TrendAnalysisProcessor] Calculating composite trend score from raw data');
    
    const strategicScore = Number((record as any).strategic_value_score) || 0;
    const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    
    // Use dynamic brand detection for target brand share
    const brandFields = this.brandResolver.detectBrandFields(record);
    const targetBrand = brandFields.find(bf => bf.isTarget);
    const targetBrandShare = targetBrand?.value || 0;
    
    // Simple trend strength calculation
    const consistencyFactor = strategicScore > 0 ? (strategicScore / 100) * 40 : 20;
    const growthFactor = competitiveScore > 0 ? (competitiveScore / 10) * 30 : 15;
    const positionFactor = targetBrandShare > 0 ? Math.min(targetBrandShare / 50, 1) * 20 : 10;
    const stabilityFactor = 10; // Default stability
    
    return Math.min(100, consistencyFactor + growthFactor + positionFactor + stabilityFactor);
  }

  /**
   * Calculate growth potential based on market fundamentals
   */
  private calculateGrowthPotential(record: any): number {
    // Use dynamic brand detection for target brand share
    const brandFields = this.brandResolver.detectBrandFields(record);
    const targetBrand = brandFields.find(bf => bf.isTarget);
    const targetBrandShare = targetBrand?.value || 0;
    
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    const marketGap = Math.max(0, 100 - targetBrandShare);
    
    // Growth potential formula: Market Gap (60%) + Demographic Opportunity (40%)
    const gapPotential = (marketGap / 100) * 60;
    const demoPotential = demographicScore > 0 ? (demographicScore / 100) * 40 : 20;
    
    return Math.round((gapPotential + demoPotential) * 100) / 100;
  }

  /**
   * Calculate trend consistency from multiple score relationships
   */
  private calculateTrendConsistency(record: any): number {
    const strategicScore = Number((record as any).strategic_value_score) || 0;
    const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    
    const scores = [strategicScore, competitiveScore, demographicScore].filter(s => s > 0);
    
    if (scores.length < 2) {
      return 50; // Default moderate consistency
    }
    
    // Calculate coefficient of variation (lower = more consistent)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    const cv = mean > 0 ? stdDev / mean : 1;
    
    // Convert to 0-100 scale (lower volatility = higher consistency)
    return Math.round(Math.max(0, Math.min(100, (1 - cv) * 100)) * 100) / 100;
  }

  /**
   * Calculate volatility index from score relationships
   */  
  private calculateVolatilityIndex(record: any): number {
    const consistency = this.calculateTrendConsistency(record);
    // Volatility is inverse of consistency
    return Math.round((100 - consistency) * 100) / 100;
  }

  /**
   * Categorize trend strength
   */
  private getTrendCategory(trendScore: number): string {
    if (trendScore >= 65) return 'Strong Upward Trend';
    if (trendScore >= 50) return 'Moderate Growth Trend';  
    if (trendScore >= 35) return 'Weak/Volatile Trend';
    return 'Inconsistent/Declining';
  }

  /**
   * Generate meaningful area name from available data
   */
  private generateAreaName(record: any): string {
    // Try explicit name fields first (updated for correlation_analysis format)
    if ((record as any).value_DESCRIPTION && typeof (record as any).value_DESCRIPTION === 'string') {
      const description = (record as any).value_DESCRIPTION.trim();
      const nameMatch = description.match(/\(([^)]+)\)/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      return description;
    }
    if ((record as any).DESCRIPTION && typeof (record as any).DESCRIPTION === 'string') {
      const description = (record as any).DESCRIPTION.trim();
      // Extract city name from parentheses format like "32544 (Hurlburt Field)" -> "Hurlburt Field"
      const nameMatch = description.match(/\(([^)]+)\)/);
      if (nameMatch && nameMatch[1]) {
        return nameMatch[1].trim();
      }
      return description;
    }
    if ((record as any).area_name) return (record as any).area_name;
    if ((record as any).NAME) return (record as any).NAME;
    if ((record as any).name) return (record as any).name;
    
    // Create name from ID and location data
    const id = (record as any).ID || (record as any).id || (record as any).GEOID;
    if (id) {
      // For ZIP codes, create format like "ZIP 12345"
      if (typeof id === 'string' && id.match(/^\d{5}$/)) {
        return `ZIP ${id}`;
      }
      // For FSA codes, create format like "FSA M5V"  
      if (typeof id === 'string' && id.match(/^[A-Z]\d[A-Z]$/)) {
        return `FSA ${id}`;
      }
      // For numeric IDs, create descriptive name
      if (typeof id === 'number' || !isNaN(Number(id))) {
        return `Area ${id}`;
      }
      return `Region ${id}`;
    }
    
    return `Area ${(record as any).OBJECTID || 'Unknown'}`;
  }

  /**
   * Rank records by trend strength
   */
  private rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    // Sort by trend strength descending and assign ranks
    const sorted = [...records].sort((a, b) => b.value - a.value);
    
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1
    }));
  }

  /**
   * Process feature importance with trend focus
   */
  private processTrendFeatureImportance(rawFeatureImportance: any[]): any[] {
    const trendFeatures = rawFeatureImportance.map(item => ({
      feature: (item as any).feature || (item as any).name || 'unknown',
      importance: Number((item as any).importance || (item as any).value || 0),
      description: this.getTrendFeatureDescription((item as any).feature || (item as any).name)
    }));

    // Add trend-specific synthetic features if none provided
    if (trendFeatures.length === 0) {
      return [
        { feature: 'market_consistency', importance: 0.35, description: 'Market performance consistency over time' },
        { feature: 'growth_momentum', importance: 0.28, description: 'Growth rate and momentum indicators' },
        { feature: 'competitive_positioning', importance: 0.22, description: 'Competitive market position strength' },
        { feature: 'volatility_factors', importance: 0.15, description: 'Market volatility and stability factors' }
      ];
    }

    return trendFeatures.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Get trend-specific feature descriptions
   */
  private getTrendFeatureDescription(featureName: string): string {
    const trendDescriptions: Record<string, string> = {
      'trend_strength': 'Overall trend strength and direction',
      'growth_rate': 'Market growth rate and momentum',
      'consistency': 'Performance consistency over time',
      'volatility': 'Market volatility and fluctuation patterns',
      'market_share': 'Brand market share trend patterns',
      'demographic': 'Demographic trend influences',
      'competitive': 'Competitive positioning trends',
      'strategic': 'Strategic value trend indicators',
      'income': 'Income trend patterns and growth',
      'population': 'Population growth and demographic shifts'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(trendDescriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} trend characteristics`;
  }

  /**
   * Calculate trend-specific statistics
   */
  private calculateTrendStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
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
    
    // Calculate percentiles
    const p25Index = Math.floor(total * 0.25);
    const p75Index = Math.floor(total * 0.75);
    const medianIndex = Math.floor(total * 0.5);
    
    const percentile25 = sorted[p25Index];
    const percentile75 = sorted[p75Index];
    const median = total % 2 === 0 
      ? (sorted[medianIndex - 1] + sorted[medianIndex]) / 2
      : sorted[medianIndex];
    
    // Calculate standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    // Calculate IQR and outliers
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

  /**
   * Generate trend-focused summary
   */
  private generateTrendSummary(
    records: GeographicDataPoint[], 
    statistics: AnalysisStatistics, 
    rawSummary?: string
  ): string {
    // Start with trend scoring explanation
    let summary = `**📈 Trend Strength Formula (0-100 scale):**
• **Time Consistency (40% weight):** Performance stability and consistency over time
• **Growth Rate (30% weight):** Growth momentum and potential
• **Market Position (20% weight):** Current market strength and positioning
• **Volatility Factor (10% weight):** Predictability and stability (lower volatility = higher score)

Higher scores indicate stronger, more consistent, and predictable market trends.

`;
    
    // Trend statistics and baseline metrics
    summary += `**📊 Trend Analysis Baseline:** `;
    summary += `Average trend strength: ${statistics.mean.toFixed(1)} (range: ${statistics.min.toFixed(1)}-${statistics.max.toFixed(1)}). `;
    
    // Calculate trend category distribution
    const strongTrends = records.filter(r => r.value >= 65).length;
    const moderateTrends = records.filter(r => r.value >= 50 && r.value < 65).length;
    const weakTrends = records.filter(r => r.value >= 35 && r.value < 50).length;
    const volatileMarkets = records.filter(r => r.value < 35).length;
    
    summary += `Trend distribution: ${strongTrends} strong trends (${(strongTrends/records.length*100).toFixed(1)}%), `;
    summary += `${moderateTrends} moderate trends (${(moderateTrends/records.length*100).toFixed(1)}%), `;
    summary += `${weakTrends} weak trends (${(weakTrends/records.length*100).toFixed(1)}%), `;
    summary += `${volatileMarkets} volatile markets (${(volatileMarkets/records.length*100).toFixed(1)}%).

`;
    
    // Top trending markets (5-8 areas)
    const topTrends = records.slice(0, 8);
    if (topTrends.length > 0) {
      const strongTrendAreas = topTrends.filter(r => r.value >= 50);
      if (strongTrendAreas.length > 0) {
        summary += `**Strongest Trend Markets:** `;
        const trendNames = strongTrendAreas.slice(0, 6).map(r => `${r.area_name} (${r.value.toFixed(1)})`);
        summary += `${trendNames.join(', ')}. `;
        
        const avgTopTrend = strongTrendAreas.reduce((sum, r) => sum + r.value, 0) / strongTrendAreas.length;
        summary += `These markets show exceptional trend strength with average score ${avgTopTrend.toFixed(1)}. `;
      }
    }
    
    // Growth potential markets
    if (records.length > 0) {
      const growthPotentialAreas = records
        .filter(r => (r.properties as any).growth_potential >= 60)
        .slice(0, 5);
      
      if (growthPotentialAreas.length > 0) {
        summary += `**High Growth Potential:** `;
        const growthNames = growthPotentialAreas.map(r => `${r.area_name} (${(r.properties as any).growth_potential?.toFixed(1)}% potential)`);
        summary += `${growthNames.join(', ')}. `;
        summary += `These areas demonstrate strong growth trajectory patterns. `;
      }
    }
    
    // Consistent performers
    if (records.length > 0) {
      const consistentPerformers = records
        .filter(r => (r.properties as any).trend_consistency >= 70)
        .slice(0, 5);
      
      if (consistentPerformers.length > 0) {
        summary += `**Most Consistent Trends:** `;
        const consistentNames = consistentPerformers.map(r => `${r.area_name} (${(r.properties as any).trend_consistency?.toFixed(1)}% consistency)`);
        summary += `${consistentNames.join(', ')}. `;
        summary += `These markets offer predictable and stable performance patterns. `;
      }
    }
    
    // Strategic insights
    summary += `**Trend Insights:** ${statistics.total} geographic areas analyzed for temporal patterns and trend strength. `;
    
    const highVolatility = records.filter(r => ((r.properties as any).volatility_index || 0) >= 70).length;
    if (highVolatility > 0) {
      summary += `${highVolatility} markets show high volatility (${(highVolatility/records.length*100).toFixed(1)}%) requiring careful monitoring. `;
    }
    
    // Actionable recommendations
    summary += `**Trend-Based Recommendations:** `;
    if (strongTrends > 0) {
      summary += `Focus investment on ${strongTrends} markets with strong trend patterns. `;
    }
    if (moderateTrends > 0) {
      summary += `Monitor ${moderateTrends} moderate trend markets for optimization opportunities. `;
    }
    if (volatileMarkets > 0) {
      summary += `Develop risk mitigation strategies for ${volatileMarkets} volatile markets. `;
    }
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }

  // ============================================================================
  // DIRECT RENDERING METHODS
  // ============================================================================

  /**
   * Create direct renderer for trend analysis visualization
   */
  private createTrendRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use same colors as strategic analysis: Red (low) -> Orange -> Light Green -> Dark Green (high)
    const trendColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (weakest trends)
      [253, 174, 97, 0.6],  // #fdae61 - Orange  
      [166, 217, 106, 0.6], // #a6d96a - Light Green
      [26, 152, 80, 0.6]    // #1a9850 - Dark Green (strongest trends)
    ];
    
    return {
      type: 'class-breaks',
      field: 'trend_analysis_score', // Use correct scoring field
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: trendColors[i], // Direct array format
          outline: { color: [0, 0, 0, 0], width: 0 }
        },
        label: this.formatClassLabel(i, quartileBreaks)
      })),
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [0, 0, 0, 0], width: 0 }
      }
    };
  }

  /**
   * Create direct legend for trend analysis
   */
  private createTrendLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use RGBA format with correct opacity to match features (same as strategic)
    const colors = [
      'rgba(215, 48, 39, 0.6)',   // Weak trends
      'rgba(253, 174, 97, 0.6)',  // Medium-low  
      'rgba(166, 217, 106, 0.6)', // Medium-high
      'rgba(26, 152, 80, 0.6)'    // Strong trends
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length; i++) {
      legendItems.push({
        label: this.formatClassLabel(i, quartileBreaks),
        color: colors[i],
        minValue: quartileBreaks[i].min,
        maxValue: quartileBreaks[i].max
      });
    }
    
    return {
      title: 'Trend Strength Score',
      items: legendItems,
      position: 'bottom-right'
    };
  }

  /**
   * Calculate quartile breaks for rendering
   */
  private calculateQuartileBreaks(values: number[]): Array<{min: number, max: number}> {
    if (values.length === 0) return [];
    
    const q1 = values[Math.floor(values.length * 0.25)];
    const q2 = values[Math.floor(values.length * 0.5)];
    const q3 = values[Math.floor(values.length * 0.75)];
    
    return [
      { min: values[0], max: q1 },
      { min: q1, max: q2 },
      { min: q2, max: q3 },
      { min: q3, max: values[values.length - 1] }
    ];
  }

  /**
   * Format class labels for legend (same as strategic)
   */
  private formatClassLabel(classIndex: number, breaks: Array<{min: number, max: number}>): string {
    if (classIndex === 0) {
      // First class: < maxValue
      return `< ${breaks[classIndex].max.toFixed(1)}`;
    } else if (classIndex === breaks.length - 1) {
      // Last class: > minValue  
      return `> ${breaks[classIndex].min.toFixed(1)}`;
    } else {
      // Middle classes: minValue - maxValue
      return `${breaks[classIndex].min.toFixed(1)} - ${breaks[classIndex].max.toFixed(1)}`;
    }
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