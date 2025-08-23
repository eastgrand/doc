/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { GeoDataManager } from '../../../geo/GeoDataManager';
import { resolveAreaName } from '../../../shared/AreaName';
interface BrandMetric {
  value: number;
  fieldName: string;
  brandName: string;
}

/**
 * ComparativeAnalysisProcessor - Handles data processing for the /comparative-analysis endpoint
 * 
 * Processes comparative analysis results with focus on relative performance between different 
 * brands, regions, or market characteristics to identify competitive advantages and positioning opportunities.
 */
export class ComparativeAnalysisProcessor implements DataProcessorStrategy {
  private geoDataManager: any = null;
  
  constructor() {
    // No longer using BrandNameResolver since we're using hardcoded fields
  }

  /**
   * Update field aliases for dynamic brand naming (now unused)
   */
  updateFieldAliases(): void {
    // No longer using BrandNameResolver since we're using hardcoded fields
  }
  
  private getGeoDataManager() {
    if (!this.geoDataManager) {
      this.geoDataManager = GeoDataManager.getInstance();
    }
    return this.geoDataManager;
  }
  
  private extractCityFromRecord(record: any): string {
    // First check if there's an explicit city field
    if ((record as any).city) return (record as any).city;
    
    // Extract ZIP code and map to city using GeoDataManager
    const zipCode = (record as any).ID || (record as any).id || (record as any).area_id || (record as any).zipcode;
    if (zipCode) {
      const zipStr = String(zipCode);
      const database = this.getGeoDataManager().getDatabase();
      const city = database.zipCodeToCity.get(zipStr);
      if (city) {
        // Capitalize first letter of each word
        const formattedCity = city.split(' ').map((word: string) => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
        return formattedCity;
      }
    }
    
    return 'Unknown';
  }
  
  validate(rawData: RawAnalysisResult): boolean {
    console.log(`🔍 [ComparativeAnalysisProcessor] Validating data:`, {
      hasRawData: !!rawData,
      isObject: typeof rawData === 'object',
      hasSuccess: rawData?.success,
      hasResults: Array.isArray(rawData?.results),
      resultsLength: rawData?.results?.length,
  firstRecordKeys: rawData?.results?.[0] ? Object.keys(rawData.results[0] as any).slice(0, 15) : []
    });

    if (!rawData || typeof rawData !== 'object') {
      console.log(`❌ [ComparativeAnalysisProcessor] Validation failed: Invalid rawData structure`);
      return false;
    }
    if (!rawData.success) {
      console.log(`❌ [ComparativeAnalysisProcessor] Validation failed: success=false`);
      return false;
    }
    if (!Array.isArray(rawData.results)) {
      console.log(`❌ [ComparativeAnalysisProcessor] Validation failed: results not array`);
      return false;
    }
    
    // Empty results are valid
    if (rawData.results.length === 0) {
      console.log(`✅ [ComparativeAnalysisProcessor] Validation passed: Empty results`);
      return true;
    }

    // Check first few records for required fields - be more flexible with ID fields
  const sampleSize = Math.min(5, rawData.results.length);
  const sampleRecords = (rawData.results as any[]).slice(0, sampleSize);
    
    for (let i = 0; i < sampleRecords.length; i++) {
  const record = sampleRecords[i] as any;
      
      // Check for ID field (flexible naming)
      const hasIdField = record && (
        (record as any).area_id !== undefined || 
        (record as any).id !== undefined || 
        (record as any).ID !== undefined ||
        (record as any).GEOID !== undefined ||
        (record as any).zipcode !== undefined ||
        (record as any).area_name !== undefined
      );
      
      // Check for at least one scoring/value field
      const hasScoringField = record && (
        (record as any).comparative_score !== undefined || 
        (record as any).value !== undefined || 
        (record as any).score !== undefined ||
        (record as any).thematic_value !== undefined ||
        // Be more flexible - accept any field that looks like it contains numeric data
        Object.keys(record as any).some((key: string) => 
          typeof (record as any)[key] === 'number' && 
          !key.toLowerCase().includes('date') &&
          !key.toLowerCase().includes('time') &&
          !key.toLowerCase().includes('area') &&
          !key.toLowerCase().includes('length') &&
          !key.toLowerCase().includes('objectid')
        )
      );
      
      console.log(`🔍 [ComparativeAnalysisProcessor] Record ${i} validation:`, {
        hasIdField,
        hasScoringField,
  recordKeys: Object.keys(record as any).slice(0, 10)
      });
      
      if (hasIdField && hasScoringField) {
        console.log(`✅ [ComparativeAnalysisProcessor] Validation passed: Found valid record structure`);
        return true;
      }
    }
    
    console.log(`❌ [ComparativeAnalysisProcessor] Validation failed: No records with both ID and scoring fields found`);
    return false;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`⚖️ [COMPARATIVE ANALYSIS PROCESSOR] CALLED WITH ${rawData.results?.length || 0} RECORDS ⚖️`);
    
    // DEBUG: Log ALL ZIP codes received by processor
    if (rawData.results && rawData.results.length > 0) {
      const resultsAny = rawData.results as any[];
      const allZips = resultsAny.map(r => r.ID || r.area_name || r.zipcode || 'unknown');
      console.log(`🔍 [COMPARATIVE PROCESSOR] DEBUGGING: ALL ${allZips.length} ZIP codes received:`, allZips);
      
      // Check which cities are represented
      const cityCount = resultsAny.reduce((acc: Record<string, number>, r: any) => {
        const city = this.extractCityFromRecord(r);
        acc[city] = (acc[city] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log(`🔍 [COMPARATIVE PROCESSOR] DEBUGGING: City distribution:`, cityCount);
    }
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for ComparativeAnalysisProcessor');
    }

    // Process records with comparative analysis scoring priority
  const processedRecords = (rawData.results as any[]).map((record: any, index: number) => {
      // PRIORITIZE PRE-CALCULATED COMPARATIVE ANALYSIS SCORE
      const comparativeScore = this.extractComparativeScore(record);
      
      // Generate area name from ID and location data
      const areaName = this.generateAreaName(record);
      
      // Extract ID (updated for correlation_analysis format)
      const recordId = (record as any).ID || (record as any).id || (record as any).area_id;
      
      // Debug logging for records with missing ID
      if (!recordId) {
        console.warn(`[ComparativeAnalysisProcessor] Record ${index} missing ID:`, {
          hasID: 'ID' in record,
          hasId: 'id' in record,
          hasAreaId: 'area_id' in record,
          recordKeys: Object.keys(record as any).slice(0, 10)
        });
      }
      
      // Extract comparative-relevant metrics for properties (generic approach)
      const brandAMetric = this.extractBrandMetric(record, 'brand_a');
      const brandBMetric = this.extractBrandMetric(record, 'brand_b');
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
      const trendScore = Number((record as any).trend_strength_score) || 0;
      const totalPop = Number((record as any).total_population || (record as any).value_TOTPOP_CY) || 0;
      const medianIncome = Number((record as any).median_income || (record as any).value_AVGHINC_CY) || 0;
      
      // Calculate comparative indicators
      const brandPerformanceGap = this.calculateBrandPerformanceGap(record);
      const marketPositionStrength = this.calculateMarketPositionStrength(record);
      const competitiveDynamicsLevel = this.calculateCompetitiveDynamicsLevel(record);
      const growthDifferential = this.calculateGrowthDifferential(record);
      
      // Calculate brand dominance and market metrics (generic)
      const brandDominance = brandAMetric.value - brandBMetric.value;
      const totalBrandShare = brandAMetric.value + brandBMetric.value;
      const marketGap = Math.max(0, 100 - totalBrandShare);
      
      return {
        area_id: recordId || `area_${index + 1}`,
        area_name: areaName,
        value: Math.round(comparativeScore * 100) / 100, // Use comparative score as primary value
        comparison_score: Math.round(comparativeScore * 100) / 100, // Add comparison_score at top level for visualization
        competitive_advantage_score: Math.round(comparativeScore * 100) / 100, // Keep for compatibility
        rank: 0, // Will be calculated after sorting
        properties: {
          DESCRIPTION: (record as any).DESCRIPTION, // Pass through original DESCRIPTION
          competitive_advantage_score: comparativeScore, // Primary field for competitive analysis
          comparative_analysis_score: comparativeScore, // Keep for compatibility
          strategic_value_score: comparativeScore, // Keep for compatibility
          score_source: 'comparative_analysis_score',
          turbotax_market_share: brandAMetric.value, // Legacy field for compatibility
          hrblock_market_share: brandBMetric.value, // Legacy field for compatibility
          brand_dominance: brandDominance, // Legacy field for compatibility
          total_brand_share: totalBrandShare,
          market_gap: marketGap,
          strategic_score: strategicScore,
          competitive_score: competitiveScore,
          demographic_score: demographicScore,
          trend_score: trendScore,
          total_population: totalPop,
          median_income: medianIncome,
          // Comparative-specific calculated properties
          brand_performance_gap: brandPerformanceGap,
          market_position_strength: marketPositionStrength,
          competitive_dynamics_level: competitiveDynamicsLevel,
          growth_differential: growthDifferential,
          comparative_category: this.getComparativeCategory(comparativeScore),
          dominant_brand: this.identifyDominantBrand(brandAMetric.value, brandBMetric.value),
          competitive_advantage_type: this.identifyCompetitiveAdvantageType(record),
          brand_a_share: brandAMetric.value,
          brand_b_share: brandBMetric.value,
          brand_a_name: brandAMetric.brandName,
          brand_b_name: brandBMetric.brandName,
          dominance_score: brandDominance
        }
      };
    });
    
    // Calculate comprehensive statistics
    const statistics = this.calculateComparativeStatistics(processedRecords);
    
    // Rank records by comparative analysis score (highest advantage first)
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance with comparative focus
    const featureImportance = this.processComparativeFeatureImportance(rawData.feature_importance || []);
    
    // Get brand names from first record (all records should have same brand names)
    const firstRecord = rankedRecords[0];
    const brandAName = typeof (firstRecord?.properties as any)?.brand_a_name === 'string'
      ? (firstRecord!.properties as any).brand_a_name as string
      : 'Brand A';
    const brandBName = typeof (firstRecord?.properties as any)?.brand_b_name === 'string'
      ? (firstRecord!.properties as any).brand_b_name as string
      : 'Brand B';

    // Generate comparative-focused summary
    const summary = this.generateComparativeSummary(
      rankedRecords,
      statistics,
      typeof rawData.summary === 'string' ? rawData.summary : undefined,
      brandAName,
      brandBName
    );

    return {
      type: 'competitive_analysis', // Use correct competitive analysis type
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'comparative_analysis_score', // Use exact field name from endpoint mapping
      renderer: this.createComparativeRenderer(rankedRecords), // Add back custom renderer
      legend: this.createComparativeLegend(rankedRecords) // Add back custom legend
    };
  }

  // ============================================================================
  // DIRECT RENDERING METHODS
  // ============================================================================

  /**
   * Create direct renderer for comparative analysis visualization
   */
  private createComparativeRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Comparative colors: Red (low competition) -> Orange -> Light Green -> Dark Green (high competitive advantage)
    const comparativeColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (lowest comparative advantage)
      [253, 174, 97, 0.6],  // #fdae61 - Orange  
      [166, 217, 106, 0.6], // #a6d96a - Light Green
      [26, 152, 80, 0.6]    // #1a9850 - Dark Green (highest comparative advantage)
    ];
    
    return {
      type: 'class-breaks',
      field: 'comparative_analysis_score', // Use correct scoring field
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: comparativeColors[i], // Direct array format
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
   * Create direct legend for comparative analysis
   */
  private createComparativeLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use RGBA format with correct opacity to match features
    const colors = [
      'rgba(215, 48, 39, 0.6)',   // Low competitive advantage
      'rgba(253, 174, 97, 0.6)',  // Medium-low  
      'rgba(166, 217, 106, 0.6)', // Medium-high
      'rgba(26, 152, 80, 0.6)'    // High competitive advantage
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
      title: 'Comparative Advantage Score',
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
   * Format class labels for legend with proper < and > format
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

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  /**
   * Extract brand metric from record using hardcoded TurboTax/H&R Block fields
   */
  private extractBrandMetric(record: any, brandType: 'brand_a' | 'brand_b'): BrandMetric {
    // Use hardcoded TurboTax and H&R Block field mappings
    const turbotaxField = (record as any).value_TURBOTAX_P !== undefined ? 'value_TURBOTAX_P' : 'TURBOTAX_P';
    const hrblockField = (record as any).value_HRBLOCK_P !== undefined ? 'value_HRBLOCK_P' : 'HRBLOCK_P';
    
    let fieldName = '';
    let value = 0;
    let brandName = '';
    
    if (brandType === 'brand_a') {
      // Brand A = TurboTax
      fieldName = turbotaxField;
      value = Number(record[turbotaxField]) || 0;
      brandName = 'TurboTax';
    } else {
      // Brand B = H&R Block
      fieldName = hrblockField;
      value = Number(record[hrblockField]) || 0;
      brandName = 'H&R Block';
    }
    
    console.log(`🔍 [extractBrandMetric] ${brandType} result:`, {
      fieldName,
      value,
      brandName,
      recordHasField: record[fieldName] !== undefined
    });
    
    return {
      value,
      fieldName: fieldName || '',
      brandName
    };
  }

  /**
   * Extract comparative analysis score from record with fallback calculation
   */
  private extractComparativeScore(record: any): number {
    // DEBUG: Log all fields to identify the issue
    const recordId = (record as any).ID || (record as any).id || (record as any).area_id || 'unknown';
    console.log(`🔍 [ComparativeAnalysisProcessor] DEBUG - Record ${recordId} fields:`, {
      comparison_score: (record as any).comparison_score,
      comparative_score: (record as any).comparative_score,
      thematic_value: (record as any).thematic_value,
      value: (record as any).value,
      allNumericFields: Object.keys(record as any).filter((k: string) => typeof (record as any)[k] === 'number').slice(0, 10)
    });
    
    // PRIORITY 1: Use comparison_score if available (this is the ACTUAL field in our data)
    if ((record as any).comparison_score !== undefined && (record as any).comparison_score !== null) {
      const comparisonScore = Number((record as any).comparison_score);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using comparison_score: ${comparisonScore}`);
      return comparisonScore;
    }
    
    // PRIORITY 2: Use comparative_score if available (alternative field name)
    if ((record as any).comparative_score !== undefined && (record as any).comparative_score !== null) {
      const comparativeScore = Number((record as any).comparative_score);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using comparative_score: ${comparativeScore}`);
      return comparativeScore;
    }
    
    // PRIORITY 3: Use thematic_value as fallback (common field in endpoint data)
    if ((record as any).thematic_value !== undefined && (record as any).thematic_value !== null) {
      const thematicScore = Number((record as any).thematic_value);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using thematic_value: ${thematicScore}`);
      return thematicScore;
    }
    
    // PRIORITY 4: Use value field if available
    if ((record as any).value !== undefined && (record as any).value !== null) {
      const valueScore = Number((record as any).value);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using value: ${valueScore}`);
      return valueScore;
    }
    
    // PRIORITY 5: Use competitive advantage score if available (scale from 1-10 to 0-100)
    if ((record as any).competitive_advantage_score !== undefined && (record as any).competitive_advantage_score !== null) {
      const competitiveScore = Number((record as any).competitive_advantage_score);
      const scaledScore = competitiveScore * 10; // Scale 1-10 to 10-100
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using competitive_advantage_score: ${competitiveScore} -> scaled to ${scaledScore}`);
      return scaledScore;
    }
    
    // FALLBACK: Use any available numeric field as comparative score
    console.log('⚠️ [ComparativeAnalysisProcessor] No direct scores found, using first available numeric field');
    
    // Find the first numeric field that's not an ID, date, or geometric field
    const numericFields = Object.keys(record as any).filter((key: string) => {
      const value = (record as any)[key];
      const keyLower = key.toLowerCase();
      return typeof value === 'number' && 
             !isNaN(value) &&
             !keyLower.includes('id') &&
             !keyLower.includes('date') &&
             !keyLower.includes('time') &&
             !keyLower.includes('area') &&
             !keyLower.includes('length') &&
             !keyLower.includes('objectid') &&
             !keyLower.includes('shape') &&
             !keyLower.includes('creation') &&
             !keyLower.includes('edit') &&
             !keyLower.includes('point');
    });
    
    if (numericFields.length > 0) {
      // Use the first suitable numeric field
      const fieldName = numericFields[0];
      const fieldValue = Number(record[fieldName]);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using fallback field '${fieldName}': ${fieldValue}`);
      
      // Normalize to 0-100 range if needed
      if (fieldValue > 100) {
        return Math.min(100, fieldValue / 10); // Scale down large values
      } else if (fieldValue < 0) {
        return 0; // Floor negative values
      }
      return fieldValue;
    }
    
    // Ultimate fallback: return a default score
    console.log(`⚠️ [ComparativeAnalysisProcessor] Record ${recordId} has no suitable numeric fields, using default score`);
    return 50; // Neutral comparative score
  }

  /**
   * Calculate brand performance gap metrics
   */
  private calculateBrandPerformanceGap(record: any): number {
    const brandAMetric = this.extractBrandMetric(record, 'brand_a');
    const brandBMetric = this.extractBrandMetric(record, 'brand_b');
    
    if (brandAMetric.value === 0 && brandBMetric.value === 0) {
      return 0; // No brand presence to compare
    }
    
    const brandDominance = brandAMetric.value - brandBMetric.value;
    const totalBrandShare = brandAMetric.value + brandBMetric.value;
    
    let gapScore = 0;
    
    // Brand dominance scoring
    if (brandDominance >= 15) {
      gapScore += 40; // Very strong brand A lead
    } else if (brandDominance >= 10) {
      gapScore += 35; // Strong brand A lead
    } else if (brandDominance >= 5) {
      gapScore += 25; // Moderate brand A lead
    } else if (brandDominance >= 0) {
      gapScore += 15; // Slight brand A lead
    } else {
      gapScore += 5; // Brand A disadvantage
    }
    
    // Market share magnitude bonus
    if (totalBrandShare >= 40) {
      gapScore += 25; // High competitive intensity
    } else if (totalBrandShare >= 25) {
      gapScore += 20; // Moderate competitive intensity
    } else if (totalBrandShare >= 15) {
      gapScore += 15; // Developing competitive market
    }
    
    // Brand A absolute performance
    if (brandAMetric.value >= 35) {
      gapScore += 15; // Very high brand A performance
    } else if (brandAMetric.value >= 25) {
      gapScore += 10; // High brand A performance
    } else if (brandAMetric.value >= 15) {
      gapScore += 5; // Moderate brand A performance
    }
    
    return Math.min(100, gapScore);
  }

  /**
   * Calculate market position strength relative to competitors
   */
  private calculateMarketPositionStrength(record: any): number {
    const strategicScore = Number((record as any).strategic_value_score) || 0;
    const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    const totalPop = Number((record as any).total_population || (record as any).value_TOTPOP_CY) || 0;
    
    let positionStrength = 0;
    
    // Strategic positioning strength
    if (strategicScore >= 70) {
      positionStrength += 30; // Exceptional strategic position
    } else if (strategicScore >= 60) {
      positionStrength += 25; // Strong strategic position
    } else if (strategicScore >= 50) {
      positionStrength += 20; // Good strategic position
    } else if (strategicScore > 0) {
      positionStrength += 10; // Basic strategic position
    }
    
    // Competitive advantage strength
    if (competitiveScore >= 8) {
      positionStrength += 25; // Very strong competitive position
    } else if (competitiveScore >= 6) {
      positionStrength += 20; // Strong competitive position
    } else if (competitiveScore >= 4) {
      positionStrength += 15; // Moderate competitive position
    } else if (competitiveScore > 0) {
      positionStrength += 10; // Basic competitive position
    }
    
    // Market size advantage
    if (totalPop >= 100000) {
      positionStrength += 20; // Large market advantage
    } else if (totalPop >= 50000) {
      positionStrength += 15; // Medium market advantage
    } else if (totalPop >= 20000) {
      positionStrength += 10; // Small market advantage
    }
    
    // Demographic positioning advantage
    if (demographicScore >= 90) {
      positionStrength += 15; // Exceptional demographic position
    } else if (demographicScore >= 75) {
      positionStrength += 10; // Strong demographic position
    } else if (demographicScore >= 60) {
      positionStrength += 5; // Good demographic position
    }
    
    return Math.min(100, positionStrength);
  }

  /**
   * Calculate competitive dynamics level
   */
  private calculateCompetitiveDynamicsLevel(record: any): number {
    const brandAMetric = this.extractBrandMetric(record, 'brand_a');
    const brandBMetric = this.extractBrandMetric(record, 'brand_b');
    
    const totalBrandShare = brandAMetric.value + brandBMetric.value;
    const marketGap = Math.max(0, 100 - totalBrandShare);
    
    let dynamicsLevel = 0;
    
    // Market competitive intensity
    if (totalBrandShare >= 50) {
      dynamicsLevel += 20; // Very high competitive intensity
    } else if (totalBrandShare >= 35) {
      dynamicsLevel += 25; // High competitive intensity with room for growth
    } else if (totalBrandShare >= 20) {
      dynamicsLevel += 30; // Moderate intensity with good potential
    } else if (totalBrandShare >= 10) {
      dynamicsLevel += 25; // Developing market
    } else if (totalBrandShare > 0) {
      dynamicsLevel += 15; // Early stage market
    }
    
    // Brand competitive position in market
    if (brandAMetric.value > 0 && brandBMetric.value > 0) {
      const brandARatio = brandAMetric.value / (brandAMetric.value + brandBMetric.value);
      if (brandARatio >= 0.7) {
        dynamicsLevel += 25; // Brand A dominance
      } else if (brandARatio >= 0.6) {
        dynamicsLevel += 20; // Brand A advantage
      } else if (brandARatio >= 0.5) {
        dynamicsLevel += 15; // Balanced competition
      } else {
        dynamicsLevel += 10; // Brand A disadvantage but competitive
      }
    } else if (brandAMetric.value > 0) {
      dynamicsLevel += 20; // Brand A presence without Brand B competition
    }
    
    // Market gap opportunity
    if (marketGap >= 70) {
      dynamicsLevel += 15; // High untapped potential
    } else if (marketGap >= 50) {
      dynamicsLevel += 10; // Moderate untapped potential
    } else if (marketGap >= 30) {
      dynamicsLevel += 5; // Some untapped potential
    }
    
    // Competitive pressure assessment
    if (brandBMetric.value >= 25) {
      dynamicsLevel += 5; // High competitive pressure (competitive advantage)
    } else if (brandBMetric.value >= 15) {
      dynamicsLevel += 8; // Moderate competitive pressure
    } else if (brandBMetric.value >= 5) {
      dynamicsLevel += 10; // Low competitive pressure
    }
    
    return Math.min(100, dynamicsLevel);
  }

  /**
   * Calculate growth differential compared to market baseline
   */
  private calculateGrowthDifferential(record: any): number {
    const trendScore = Number((record as any).trend_strength_score) || 0;
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    const strategicScore = Number((record as any).strategic_value_score) || 0;
    const medianIncome = Number((record as any).median_income || (record as any).value_AVGHINC_CY) || 0;
    
    let growthDifferential = 0;
    
    // Trend strength advantage
    if (trendScore >= 55) {
      growthDifferential += 25; // Strong trend advantage
    } else if (trendScore >= 45) {
      growthDifferential += 20; // Moderate trend advantage
    } else if (trendScore >= 35) {
      growthDifferential += 15; // Some trend advantage
    } else if (trendScore > 0) {
      growthDifferential += 5; // Minimal trend advantage
    }
    
    // Demographic growth potential
    if (demographicScore >= 85) {
      growthDifferential += 25; // Exceptional demographic growth potential
    } else if (demographicScore >= 70) {
      growthDifferential += 20; // Strong demographic growth potential
    } else if (demographicScore >= 55) {
      growthDifferential += 15; // Moderate demographic growth potential
    } else if (demographicScore > 0) {
      growthDifferential += 5; // Some demographic growth potential
    }
    
    // Strategic value growth indicator
    if (strategicScore >= 65) {
      growthDifferential += 20; // High strategic growth potential
    } else if (strategicScore >= 55) {
      growthDifferential += 15; // Moderate strategic growth potential
    } else if (strategicScore >= 45) {
      growthDifferential += 10; // Some strategic growth potential
    }
    
    // Income growth indicator (economic strength)
    if (medianIncome >= 80000) {
      growthDifferential += 15; // High income growth market
    } else if (medianIncome >= 60000) {
      growthDifferential += 10; // Moderate income market
    } else if (medianIncome >= 40000) {
      growthDifferential += 5; // Developing income market
    }
    
    return Math.min(100, growthDifferential);
  }

  /**
   * Categorize comparative performance
   */
  private getComparativeCategory(comparativeScore: number): string {
    if (comparativeScore >= 65) return 'Strong Comparative Advantage';
    if (comparativeScore >= 50) return 'Good Comparative Position';  
    if (comparativeScore >= 35) return 'Moderate Comparative Standing';
    return 'Weak Comparative Position';
  }

  /**
   * Identify the dominant brand in the market
   */
  private identifyDominantBrand(brandAShare: number, brandBShare: number): string {
    if (brandAShare === 0 && brandBShare === 0) {
      return 'No Brand Presence';
    }
    
    const brandDominance = brandAShare - brandBShare;
    
    if (brandDominance >= 15) return 'Brand A Strong Dominance';
    if (brandDominance >= 8) return 'Brand A Moderate Dominance';
    if (brandDominance >= 3) return 'Brand A Slight Lead';
    if (brandDominance >= -3) return 'Balanced Competition';
    if (brandDominance >= -8) return 'Brand B Slight Lead';
    if (brandDominance >= -15) return 'Brand B Moderate Dominance';
    return 'Brand B Strong Dominance';
  }

  /**
   * Identify the type of competitive advantage
   */
  private identifyCompetitiveAdvantageType(record: any): string {
    const brandGap = this.calculateBrandPerformanceGap(record);
    const positionStrength = this.calculateMarketPositionStrength(record);
    const dynamics = this.calculateCompetitiveDynamicsLevel(record);
    const growth = this.calculateGrowthDifferential(record);
    
    // Find the highest advantage component
    const maxAdvantage = Math.max(brandGap, positionStrength, dynamics, growth);
    
    if (maxAdvantage === brandGap && brandGap >= 40) return 'Brand Performance Advantage';
    if (maxAdvantage === positionStrength && positionStrength >= 40) return 'Market Position Advantage';
    if (maxAdvantage === dynamics && dynamics >= 40) return 'Competitive Dynamics Advantage';
    if (maxAdvantage === growth && growth >= 40) return 'Growth Differential Advantage';
    
    return 'Mixed Competitive Advantage';
  }

  /**
   * Generate meaningful area name from available data
   */
  private generateAreaName(record: any): string {
  // Centralized resolver: ensures consistent naming and avoids 'Unknown Area'
  const fallbackId = (record as any).ID || (record as any).id || (record as any).area_id || (record as any).GEOID || (record as any).zipcode || '1';
  return resolveAreaName(record, { mode: 'zipCity', neutralFallback: `Area ${fallbackId}` });
  }

  /**
   * Rank records by comparative analysis score (highest advantage first)
   */
  private rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    // Sort by comparative score descending and assign ranks
    const sorted = [...records].sort((a, b) => b.value - a.value);
    
    return sorted.map((record, index) => ({
      ...record,
      rank: index + 1
    }));
  }

  /**
   * Process feature importance with comparative focus
   */
  private processComparativeFeatureImportance(rawFeatureImportance: any[]): any[] {
    const comparativeFeatures = rawFeatureImportance.map((item: any) => {
      const featureName = String((item as any).feature ?? (item as any).name ?? 'unknown');
      return {
        feature: featureName,
        importance: Number((item as any).importance ?? (item as any).value ?? 0),
        description: this.getComparativeFeatureDescription(featureName)
      };
    });

    // Add comparative-specific synthetic features if none provided
    if (comparativeFeatures.length === 0) {
      return [
        { feature: 'brand_performance_gap', importance: 0.35, description: 'Brand A vs competitors performance differential' },
        { feature: 'market_position_strength', importance: 0.30, description: 'Relative market positioning and dominance' },
        { feature: 'competitive_dynamics', importance: 0.25, description: 'Competitive pressure and market share dynamics' },
        { feature: 'growth_differential', importance: 0.10, description: 'Relative growth potential and trend momentum' }
      ];
    }

    return comparativeFeatures.sort((a, b) => b.importance - a.importance);
  }

  /**
   * Get comparative-specific feature descriptions
   */
  private getComparativeFeatureDescription(featureName: string): string {
    const comparativeDescriptions: Record<string, string> = {
      'comparative': 'Comparative analysis patterns and relationships',
      'brand': 'Brand performance comparison metrics',
      'competition': 'Competitive positioning and dynamics',
      'market_share': 'Market share comparative analysis',
      'dominance': 'Brand dominance and market control',
      'advantage': 'Competitive advantage indicators',
      'positioning': 'Market positioning strength',
      'performance': 'Performance comparison metrics',
      'gap': 'Performance gap analysis',
      'differential': 'Growth and performance differentials',
      'brand_a': 'Brand A comparative performance',
      'brand_b': 'Brand B competitive comparison',
      'strategic': 'Strategic comparative advantages',
      'demographic': 'Demographic comparative factors',
      'growth': 'Growth differential analysis'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(comparativeDescriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} comparative characteristics`;
  }

  /**
   * Calculate comparative-specific statistics
   */
  private calculateComparativeStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
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
   * Generate comparative-focused summary
   */
  private generateComparativeSummary(
    records: GeographicDataPoint[], 
    statistics: AnalysisStatistics, 
    rawSummary?: string,
    brandAName: string = 'Brand A',
    brandBName: string = 'Brand B'
  ): string {
    const num = (v: unknown, d = 0) => {
      const n = Number(v as any);
      return isNaN(n) ? d : n;
    };
    // Start with comparative scoring explanation using actual brand names
    let summary = `**⚖️ Comparative Analysis Formula (0-100 scale):**
• **Brand Performance Gap (35% weight):** ${brandAName} vs competitors performance differential\n• **Market Position Strength (30% weight):** Relative market positioning and dominance\n• **Competitive Dynamics (25% weight):** Competitive pressure and market share dynamics\n• **Growth Differential (10% weight):** Relative growth potential and trend momentum\n\nHigher scores indicate stronger competitive advantages and superior market positioning.\n
`;
    
    // Comparative statistics and baseline metrics
    summary += `**📊 Comparative Analysis Baseline:** `;
    summary += `Average comparative advantage: ${statistics.mean.toFixed(1)} (range: ${statistics.min.toFixed(1)}-${statistics.max.toFixed(1)}). `;
    
    // Calculate brand dominance patterns
  const brandADominantMarkets = records.filter(r => num((r.properties as any).brand_dominance) > 5).length;
  const balancedMarkets = records.filter(r => Math.abs(num((r.properties as any).brand_dominance)) <= 5).length;
  const brandBDominantMarkets = records.filter(r => num((r.properties as any).brand_dominance) < -5).length;
    
    summary += `Brand dominance: ${brandADominantMarkets} ${brandAName}-dominant markets (${(brandADominantMarkets/records.length*100).toFixed(1)}%), `;
    summary += `${balancedMarkets} balanced markets (${(balancedMarkets/records.length*100).toFixed(1)}%), `;
    summary += `${brandBDominantMarkets} ${brandBName}-dominant markets (${(brandBDominantMarkets/records.length*100).toFixed(1)}%). `;
    
    // Market competitive intensity
  const avgTotalBrandShare = records.reduce((sum, r) => sum + num((r.properties as any).total_brand_share), 0) / records.length;
  const avgMarketGap = records.reduce((sum, r) => sum + num((r.properties as any).market_gap), 0) / records.length;
    summary += `Market intensity: ${avgTotalBrandShare.toFixed(1)}% average brand presence, ${avgMarketGap.toFixed(1)}% untapped market potential.

`;
    
    // Calculate comparative category distribution
    const strongAdvantage = records.filter(r => r.value >= 65).length;
    const goodPosition = records.filter(r => r.value >= 50 && r.value < 65).length;
    const moderateStanding = records.filter(r => r.value >= 35 && r.value < 50).length;
    const weakPosition = records.filter(r => r.value < 35).length;
    
    summary += `Comparative distribution: ${strongAdvantage} strong advantages (${(strongAdvantage/records.length*100).toFixed(1)}%), `;
    summary += `${goodPosition} good positions (${(goodPosition/records.length*100).toFixed(1)}%), `;
    summary += `${moderateStanding} moderate standings (${(moderateStanding/records.length*100).toFixed(1)}%), `;
    summary += `${weakPosition} weak positions (${(weakPosition/records.length*100).toFixed(1)}%).

`;
    
    // Top competitive advantage markets (5-8 areas)
    const topComparative = records.slice(0, 8);
    if (topComparative.length > 0) {
      const strongCompetitive = topComparative.filter(r => r.value >= 60);
      if (strongCompetitive.length > 0) {
        summary += `**Strongest Competitive Advantages:** `;
        const competitiveNames = strongCompetitive.slice(0, 6).map(r => {
          const brandDom = num((r.properties as any).brand_dominance);
          return `${r.area_name} (${r.value.toFixed(1)}, +${brandDom.toFixed(1)}% brand lead)`;
        });
        summary += `${competitiveNames.join(', ')}. `;
        
        const avgTopCompetitive = strongCompetitive.reduce((sum, r) => sum + r.value, 0) / strongCompetitive.length;
        summary += `These markets show exceptional competitive positioning with average advantage ${avgTopCompetitive.toFixed(1)}. `;
      }
    }
    
    // Brand performance leaders
    if (records.length > 0) {
      const brandLeaders = records
        .filter(r => num((r.properties as any).brand_performance_gap) >= 60)
        .slice(0, 5);
      
      if (brandLeaders.length > 0) {
        summary += `**Brand Performance Leaders:** `;
        const leaderNames = brandLeaders.map(r => {
          const brandAShare = num((r.properties as any).brand_a_share);
          const brandBShare = num((r.properties as any).brand_b_share);
          return `${r.area_name} (${brandAName} ${brandAShare.toFixed(1)}% vs ${brandBName} ${brandBShare.toFixed(1)}%)`;
        });
        summary += `${leaderNames.join(', ')}. `;
        summary += `These markets demonstrate superior brand performance differentials. `;
      }
    }
    
    // Market position strength leaders
    if (records.length > 0) {
      const positionLeaders = records
        .filter(r => num((r.properties as any).market_position_strength) >= 70)
        .slice(0, 5);
      
      if (positionLeaders.length > 0) {
        summary += `**Market Position Strength Leaders:** `;
        const positionNames = positionLeaders.map(r => r.area_name);
        summary += `${positionNames.join(', ')}. `;
        summary += `These markets hold dominant market positioning advantages. `;
      }
    }
    
    // Competitive dynamics insights
    if (records.length > 0) {
      const highDynamics = records
        .filter(r => num((r.properties as any).competitive_dynamics_level) >= 65)
        .slice(0, 5);
      
      if (highDynamics.length > 0) {
        summary += `**High Competitive Dynamics:** `;
        const dynamicsNames = highDynamics.map(r => {
          const totalShare = num((r.properties as any).total_brand_share);
          return `${r.area_name} (${totalShare.toFixed(1)}% brand presence)`;
        });
        summary += `${dynamicsNames.join(', ')}. `;
        summary += `These markets show intense competitive activity with growth opportunities. `;
      }
    }
    
    // Strategic insights
    summary += `**Competitive Insights:** ${statistics.total} geographic areas analyzed for comparative brand performance and market positioning. `;
    
  const avgBrandDominance = records.reduce((sum, r) => sum + num((r.properties as any).brand_dominance), 0) / records.length;
    if (avgBrandDominance > 0) {
      summary += `${brandAName} holds average ${avgBrandDominance.toFixed(1)}% market share advantage across analyzed markets. `;
    } else {
      summary += `${brandAName} faces competitive challenges with ${Math.abs(avgBrandDominance).toFixed(1)}% disadvantage on average. `;
    }
    
    // Opportunity assessment
  const highGrowthMarkets = records.filter(r => num((r.properties as any).growth_differential) >= 50).length;
    if (highGrowthMarkets > 0) {
      summary += `${highGrowthMarkets} markets (${(highGrowthMarkets/records.length*100).toFixed(1)}%) show high growth differentials offering expansion opportunities. `;
    }
    
    // Actionable recommendations
    summary += `**Strategic Recommendations:** `;
    if (strongAdvantage > 0) {
      summary += `Leverage ${strongAdvantage} markets with strong competitive advantages for aggressive expansion. `;
    }
    if (goodPosition > 0) {
      summary += `Strengthen position in ${goodPosition} markets with good competitive standings. `;
    }
    if (brandADominantMarkets > brandBDominantMarkets) {
      summary += `Capitalize on ${brandAName}'s overall market dominance while defending against competitive threats. `;
    } else {
      summary += `Develop strategies to overcome competitive disadvantages and improve market positioning. `;
    }
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }
}