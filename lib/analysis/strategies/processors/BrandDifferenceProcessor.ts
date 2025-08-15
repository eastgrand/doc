import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics, ProcessingContext } from '../../types';
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
    'turbotax': 'MP10104A_B_P',
    'h&r block': 'MP10128A_B_P',
    'hrblock': 'MP10128A_B_P',
    'hr block': 'MP10128A_B_P'
  };

  validate(rawData: RawAnalysisResult): boolean {
    console.log('🔍 [BrandDifferenceProcessor] VALIDATE CALLED');
    console.log('🔍 [BrandDifferenceProcessor] Raw data structure:', {
      success: rawData?.success,
      resultsLength: rawData?.results?.length,
      firstRecordKeys: rawData?.results?.[0] ? Object.keys(rawData.results[0]) : []
    });
    
    if (!rawData || typeof rawData !== 'object') {
      console.log('❌ [BrandDifferenceProcessor] VALIDATION FAILED: Invalid rawData object');
      return false;
    }
    if (!rawData.success) {
      console.log('❌ [BrandDifferenceProcessor] VALIDATION FAILED: rawData.success is false');
      return false;
    }
    if (!Array.isArray(rawData.results)) {
      console.log('❌ [BrandDifferenceProcessor] VALIDATION FAILED: rawData.results is not an array');
      return false;
    }
    
    // Brand difference analysis requires brand market share data
    const hasBrandFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.ID || record.area_id || record.id || record.GEOID) &&
        // Look for TurboTax and H&R Block market share fields
        (record.MP10104A_B_P !== undefined || record.MP10128A_B_P !== undefined)
      );
    
    console.log('🔍 [BrandDifferenceProcessor] Brand fields validation result:', hasBrandFields);
    if (!hasBrandFields) {
      console.log('❌ [BrandDifferenceProcessor] VALIDATION FAILED: No brand fields found');
      if (rawData.results.length > 0) {
        console.log('🔍 [BrandDifferenceProcessor] Available fields in first record:', Object.keys(rawData.results[0]));
      }
    } else {
      console.log('✅ [BrandDifferenceProcessor] VALIDATION PASSED: Brand fields found');
    }
    
    return hasBrandFields;
  }

  process(rawData: RawAnalysisResult, context?: ProcessingContext): ProcessedAnalysisData {
    console.log(`[BrandDifferenceProcessor] ===== BRAND DIFFERENCE PROCESSOR CALLED =====`);
    console.log(`[BrandDifferenceProcessor] Processing ${rawData.results?.length || 0} records for brand difference analysis`);
    console.log(`[BrandDifferenceProcessor] Context:`, context);
    
    // Debug: Show available fields in first record
    if (rawData.results && rawData.results.length > 0) {
      const firstRecord = rawData.results[0];
      const brandFields = Object.keys(firstRecord).filter(key => key.includes('MP30') && key.includes('_P'));
      console.log(`[BrandDifferenceProcessor] Available brand fields in data:`, brandFields);
    }
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for BrandDifferenceProcessor');
    }

    // Auto-detect which brand fields are available in the data
    const availableBrandFields = this.detectAvailableBrandFields(rawData);
    console.log(`[BrandDifferenceProcessor] Available brand fields:`, availableBrandFields);
    
    // Extract brand parameters from context if available
    const extractedBrands = context?.extractedBrands || [];
    console.log(`[BrandDifferenceProcessor] Context received:`, { 
      hasContext: !!context,
      extractedBrands,
      query: context?.query
    });
    
    let brand1: string;
    let brand2: string;
    
    // CRITICAL: H&R Block is the target variable (MP10128A_B_P), so it should always be brand1 (primary subject)
    const targetBrand = 'h&r block'; // H&R Block is our target variable
    const competitorBrand = 'turbotax'; // TurboTax is the main competitor
    
    // Determine brand order - H&R Block should always be first (target variable)
    if (extractedBrands.length >= 2) {
      const brands = extractedBrands.map(b => b.toLowerCase());
      if (brands.includes(targetBrand) && brands.includes(competitorBrand)) {
        brand1 = targetBrand; // H&R Block first (target)
        brand2 = competitorBrand; // TurboTax second (competitor)
      } else {
        // Use extracted brands in order, but prefer H&R Block as brand1
        brand1 = brands.includes(targetBrand) ? targetBrand : brands[0];
        brand2 = brands.includes(competitorBrand) ? competitorBrand : brands[1] || brands[0];
      }
    } else if (extractedBrands.length === 1) {
      const extractedBrand = extractedBrands[0].toLowerCase();
      if (extractedBrand === targetBrand) {
        brand1 = targetBrand;
        brand2 = competitorBrand;
      } else {
        brand1 = targetBrand; // Default to H&R Block as primary
        brand2 = extractedBrand;
      }
    } else {
      // No brands from context, use detected brands but prioritize H&R Block
      const detectedBrands = availableBrandFields;
      if (detectedBrands.includes(targetBrand)) {
        brand1 = targetBrand;
        brand2 = detectedBrands.find(b => b !== targetBrand) || competitorBrand;
      } else {
        brand1 = detectedBrands[0] || targetBrand;
        brand2 = detectedBrands[1] || competitorBrand;
      }
    }
    
    console.log(`[BrandDifferenceProcessor] Target-oriented comparison: ${brand1} vs ${brand2} (${brand1} is target variable)`);
    console.log(`[BrandDifferenceProcessor] Calculation will be: ${brand1} - ${brand2}`);
    console.log(`[BrandDifferenceProcessor] Positive values = ${brand1} advantage, Negative values = ${brand2} advantage`);
    
    // No need to validate mappings anymore since detectAvailableBrandFields handles unknown brands
    console.log(`[BrandDifferenceProcessor] Processing comparison for: ${brand1} vs ${brand2}`);

    // Process records with brand difference calculations
    const records = this.processBrandDifferenceRecords(rawData.results, brand1, brand2);
    
    console.log(`[BrandDifferenceProcessor] Processed ${records.length} records for ${brand1} vs ${brand2}`);
    console.log(`[BrandDifferenceProcessor] Sample difference: ${records[0]?.value}%`);
    
    // Debug: Show range of differences
    const differences = records.map(r => r.value).filter(v => !isNaN(v));
    const minDiff = Math.min(...differences);
    const maxDiff = Math.max(...differences);
    const negativeCount = differences.filter(d => d < 0).length;
    const positiveCount = differences.filter(d => d > 0).length;
    const zeroCount = differences.filter(d => d === 0).length;
    
    console.log(`[BrandDifferenceProcessor] Difference range: ${minDiff.toFixed(2)}% to ${maxDiff.toFixed(2)}%`);
    console.log(`[BrandDifferenceProcessor] Distribution: ${negativeCount} negative, ${zeroCount} zero, ${positiveCount} positive`);
    
    if (negativeCount === 0) {
      console.warn(`[BrandDifferenceProcessor] ⚠️ NO NEGATIVE VALUES FOUND - This suggests ${brand2} never has higher market share than ${brand1}`);
    }
    
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

    // Extract the actual field codes used for the brands (capitalize for field lookup)
    const brand1Field = this.extractBrandFieldCode(rawData, brand1.charAt(0).toUpperCase() + brand1.slice(1));
    const brand2Field = this.extractBrandFieldCode(rawData, brand2.charAt(0).toUpperCase() + brand2.slice(1));
    
    // Create renderer and legend with brand names
    const renderer = this.createBrandDifferenceRenderer(records, brand1, brand2);
    const legend = this.createBrandDifferenceLegend(records, brand1, brand2);
    
    console.log(`🔥 [BrandDifferenceProcessor] Created renderer and legend:`, {
      rendererType: renderer?.type,
      rendererField: renderer?.field,
      classBreakCount: renderer?.classBreakInfos?.length,
      firstLabel: renderer?.classBreakInfos?.[0]?.label,
      legendTitle: legend?.title,
      legendItemCount: legend?.items?.length,
      firstLegendLabel: legend?.items?.[0]?.label
    });

    const processedData = {
      type: 'brand_difference',
      records,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'brand_difference_score',
      renderer,
      legend,
      brandAnalysis: {
        ...brandAnalysis,
        relevantFields: [brand1Field, brand2Field], // Add the actual fields being compared
        brandComparison: { brand1, brand2 }
      }
    };
    
    console.log(`[BrandDifferenceProcessor] ===== RETURNING PROCESSED DATA =====`);
    console.log(`[BrandDifferenceProcessor] Brand comparison: ${brand1} (${brand1Field}) vs ${brand2} (${brand2Field})`);
    console.log(`[BrandDifferenceProcessor] Relevant fields for visualization:`, [brand1Field, brand2Field]);
    console.log(`[BrandDifferenceProcessor] Records generated:`, processedData.records?.length || 0);
    
    return processedData;
  }

  /**
   * Extract the actual field code for a brand from the raw data
   */
  private extractBrandFieldCode(rawData: RawAnalysisResult, brandName: string): string {
    // Check the first result record to find which field corresponds to the brand
    if (!rawData.results || rawData.results.length === 0) {
      // Fallback to known brand field mappings
      const brandFieldMap: Record<string, string> = {
        'Nike': 'MP30034A_B_P',
        'Adidas': 'MP30029A_B_P',
        'Puma': 'MP30035A_B_P',
        'Reebok': 'MP30036A_B_P',
        'New Balance': 'MP30033A_B_P',
        'Asics': 'MP30030A_B_P',
        'Converse': 'MP30031A_B_P',
        'Jordan': 'MP30032A_B_P',
        'Skechers': 'MP30037A_B_P'
      };
      return brandFieldMap[brandName] || 'MP30034A_B_P';
    }
    
    // Look through the first record to find fields that might match the brand
    const sampleRecord = rawData.results[0];
    const brandUpper = brandName.toUpperCase();
    
    // Find fields that contain data and might be brand fields
    for (const [key, value] of Object.entries(sampleRecord)) {
      // Check if this is a percentage field for athletic shoes (prefer value_ fields over shap_)
      if (key.includes('MP300') && key.endsWith('_P') && typeof value === 'number' && key.includes('value_')) {
        // Extract just the base field code (e.g., MP30029A_B_P from value_MP30029A_B_P)
        const baseField = key.replace('value_', '');
        // Try to match based on known patterns
        if (brandName === 'Nike' && key.includes('34A_B')) return baseField;
        if (brandName === 'Adidas' && key.includes('29A_B')) return baseField;
        if (brandName === 'Puma' && key.includes('35A_B')) return baseField;
        if (brandName === 'Reebok' && key.includes('36A_B')) return baseField;
        if (brandName === 'New Balance' && key.includes('33A_B')) return baseField;
        if (brandName === 'Asics' && key.includes('30A_B')) return baseField;
        if (brandName === 'Converse' && key.includes('31A_B')) return baseField;
        if (brandName === 'Jordan' && key.includes('32A_B')) return baseField;
        if (brandName === 'Skechers' && key.includes('37A_B')) return baseField;
      }
    }
    
    // Default fallback
    console.warn(`[BrandDifferenceProcessor] Could not find field for brand: ${brandName}`);
    return brandName === 'Nike' ? 'MP30034A_B_P' : 'MP30029A_B_P';
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processBrandDifferenceRecords(rawRecords: any[], brand1: string, brand2: string): GeographicDataPoint[] {
    // Get field codes - either from BRAND_MAPPINGS or detect from data
    const brand1FieldCode = this.getBrandFieldCode(rawRecords[0], brand1);
    const brand2FieldCode = this.getBrandFieldCode(rawRecords[0], brand2);
    
    const brand1Field = brand1FieldCode;
    const brand2Field = brand2FieldCode;
    
    console.log(`[BrandDifferenceProcessor] Using fields: ${brand1Field} vs ${brand2Field}`);

    return rawRecords.map((record, index) => {
      const area_id = record.ID || record.area_id || record.id || record.GEOID || `area_${index}`;
      const area_name = record.DESCRIPTION || record.value_DESCRIPTION || record.area_name || record.name || record.NAME || `Area ${index + 1}`;
      
      // Extract brand market shares
      const brand1Share = record[brand1Field] !== undefined && record[brand1Field] !== null ? Number(record[brand1Field]) : 0;
      const brand2Share = record[brand2Field] !== undefined && record[brand2Field] !== null ? Number(record[brand2Field]) : 0;
      
      // Debug logging for first few records
      if (index < 3) {
        console.log(`[BrandDifferenceProcessor] Record ${index}: ${area_name || 'Unknown'} - ${brand1}:${brand1Share}% vs ${brand2}:${brand2Share}% = ${brand1Share - brand2Share}%`);
      }
      
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
    
    summary += `**Methodology:** This analysis calculates MARKET SHARE DIFFERENCES, not performance rankings. `;
    summary += `Values represent percentage point gaps between ${brand1Name} and ${brand2Name} market share (${brand1Name} % - ${brand2Name} %). `;
    summary += `Positive values = ${brand1Name} competitive advantage, Negative values = ${brand2Name} competitive advantage, Zero values = competitive parity.\n\n`;
    
    // Overall competitive landscape
    summary += `**Overall Competitive Landscape:** `;
    if (avgDifference > 10) {
      summary += `${brand1Name} holds a significant competitive advantage with an average ${avgDifference.toFixed(1)} percentage point market share gap over ${brand2Name}. `;
    } else if (avgDifference > 2) {
      summary += `${brand1Name} maintains a moderate competitive advantage with an average ${avgDifference.toFixed(1)} percentage point gap. `;
    } else if (avgDifference > -2) {
      summary += `Highly competitive markets with near-parity (${Math.abs(avgDifference).toFixed(1)} percentage point average difference). `;
    } else if (avgDifference > -10) {
      summary += `${brand2Name} maintains a moderate competitive advantage with an average ${Math.abs(avgDifference).toFixed(1)} percentage point gap. `;
    } else {
      summary += `${brand2Name} holds a significant competitive advantage with an average ${Math.abs(avgDifference).toFixed(1)} percentage point market share gap over ${brand1Name}. `;
    }
    
    // Market distribution analysis
    const leadership = brandAnalysis.brandLeadership;
    summary += `Market distribution: ${brand1Name} has competitive advantage in ${leadership.brand1Leading} markets (${leadership.brand1LeadingPct.toFixed(1)}%), `;
    summary += `${brand2Name} has competitive advantage in ${leadership.brand2Leading} markets (${leadership.brand2LeadingPct.toFixed(1)}%), `;
    summary += `with ${leadership.competitive} markets in competitive parity (${leadership.competitivePct.toFixed(1)}%).\n\n`;
    
    // Brand strongholds (>10% advantage for clarity)
    const brand1Strongholds = records.filter(r => r.value > 10).slice(0, 5);
    const brand2Strongholds = records.filter(r => r.value < -10).slice(0, 5);
    const competitiveBattlegrounds = records.filter(r => Math.abs(r.value) <= 5).slice(0, 5);
    
    if (brand1Strongholds.length > 0) {
      summary += `**${brand1Name} Strongholds** (>10 percentage point advantage): `;
      brand1Strongholds.forEach((record, index) => {
        const brand1Share = record.properties[`${brand1}_market_share`];
        const brand2Share = record.properties[`${brand2}_market_share`];
        const gap = record.value;
        summary += `${record.area_name} (+${gap.toFixed(1)}pp gap: ${brand1Share.toFixed(1)}% vs ${brand2Share.toFixed(1)}%), `;
      });
      summary = summary.slice(0, -2) + '.\n\n';
    }
    
    if (brand2Strongholds.length > 0) {
      summary += `**${brand2Name} Strongholds** (>10 percentage point advantage): `;
      brand2Strongholds.forEach((record, index) => {
        const brand1Share = record.properties[`${brand1}_market_share`];
        const brand2Share = record.properties[`${brand2}_market_share`];
        const gap = Math.abs(record.value);
        summary += `${record.area_name} (+${gap.toFixed(1)}pp gap: ${brand2Share.toFixed(1)}% vs ${brand1Share.toFixed(1)}%), `;
      });
      summary = summary.slice(0, -2) + '.\n\n';
    }
    
    if (competitiveBattlegrounds.length > 0) {
      summary += `**Competitive Battlegrounds** (≤5 percentage point difference): `;
      competitiveBattlegrounds.forEach((record, index) => {
        const brand1Share = record.properties[`${brand1}_market_share`];
        const brand2Share = record.properties[`${brand2}_market_share`];
        const gap = record.value;
        summary += `${record.area_name} (${gap >= 0 ? '+' : ''}${gap.toFixed(1)}pp: ${brand1Share.toFixed(1)}% vs ${brand2Share.toFixed(1)}%), `;
      });
      summary = summary.slice(0, -2) + '.\n\n';
    }
    
    // Strategic recommendations based on competitive gaps
    summary += `**Strategic Recommendations:** `;
    const competitiveBalance = brandAnalysis.competitiveBalance;
    if (competitiveBalance === 'balanced_competition') {
      summary += `Focus on competitive battlegrounds where small investments can tip market share. `;
    } else if (competitiveBalance.includes('brand1')) {
      summary += `${brand1Name}: Defend strongholds and target ${brand2Name} territories for expansion. `;
    } else if (competitiveBalance.includes('brand2')) {
      summary += `${brand1Name}: Aggressive expansion needed in ${brand2Name} strongholds with differentiated positioning. `;
    }
    
    summary += `Prioritize markets with moderate competitive gaps (5-15 percentage points) for highest conversion potential and ROI.`;
    
    return summary;
  }

  // ============================================================================
  // RENDERING METHODS
  // ============================================================================

  private createBrandDifferenceRenderer(records: any[], brand1: string, brand2: string): any {
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
        label: this.formatDifferenceLabel(i, quartileBreaks, brand1, brand2)
      })),
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [0, 0, 0, 0], width: 0 }
      }
    };
  }

  private createBrandDifferenceLegend(records: any[], brand1: string, brand2: string): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Colors for negative to positive values (TurboTax advantage to H&R Block advantage)
    const colors = [
      'rgba(215, 48, 39, 0.6)',    // Red - Strongest TurboTax advantage (most negative)
      'rgba(253, 174, 97, 0.6)',   // Orange - Moderate TurboTax advantage  
      'rgba(254, 224, 144, 0.6)',  // Light yellow - Competitive parity
      'rgba(166, 217, 106, 0.6)',  // Light green - Moderate H&R Block advantage
      'rgba(26, 152, 80, 0.6)'     // Dark green - Strongest H&R Block advantage (most positive)
    ];
    
    const legendItems = [];
    for (let i = 0; i < quartileBreaks.length; i++) {
      legendItems.push({
        label: this.formatDifferenceLabel(i, quartileBreaks, brand1, brand2),
        color: colors[i],
        minValue: quartileBreaks[i].min,
        maxValue: quartileBreaks[i].max
      });
    }
    
    return {
      title: 'Brand Difference (%)',
      items: legendItems,
      position: 'bottom-right'
    };
  }

  private calculateQuartileBreaks(values: number[]): Array<{min: number, max: number}> {
    if (values.length === 0) return [];
    
    // Use natural breaks for brand difference data that can span negative to positive
    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;
    
    console.log(`[BrandDifferenceProcessor] Value range for breaks: ${min.toFixed(2)} to ${max.toFixed(2)} (range: ${range.toFixed(2)})`);
    
    // If range is very small, create equal intervals
    if (range < 0.1) {
      const step = Math.max(0.01, range / 5);
      return [
        { min: min, max: min + step },
        { min: min + step, max: min + 2 * step },
        { min: min + 2 * step, max: min + 3 * step },
        { min: min + 3 * step, max: min + 4 * step },
        { min: min + 4 * step, max: max }
      ];
    }
    
    // Use quintiles (20th percentiles) but ensure meaningful breaks
    let q1 = values[Math.floor(values.length * 0.2)];
    let q2 = values[Math.floor(values.length * 0.4)];
    let q3 = values[Math.floor(values.length * 0.6)];
    let q4 = values[Math.floor(values.length * 0.8)];
    
    // Ensure breaks are meaningful and non-overlapping
    const minStep = 0.1; // Minimum step between breaks
    
    // Adjust breaks to ensure minimum differences
    if (q1 - min < minStep) q1 = min + minStep;
    if (q2 - q1 < minStep) q2 = q1 + minStep;
    if (q3 - q2 < minStep) q3 = q2 + minStep;
    if (q4 - q3 < minStep) q4 = q3 + minStep;
    if (max - q4 < minStep && q4 < max) q4 = max - minStep;
    
    console.log(`[BrandDifferenceProcessor] Adjusted breaks: ${min.toFixed(2)} | ${q1.toFixed(2)} | ${q2.toFixed(2)} | ${q3.toFixed(2)} | ${q4.toFixed(2)} | ${max.toFixed(2)}`);
    
    return [
      { min: min, max: q1 },
      { min: q1, max: q2 },
      { min: q2, max: q3 },
      { min: q3, max: q4 },
      { min: q4, max: max }
    ];
  }

  private formatDifferenceLabel(classIndex: number, breaks: Array<{min: number, max: number}>, brand1: string, brand2: string): string {
    const range = breaks[classIndex];
    const brand1Name = brand1.charAt(0).toUpperCase() + brand1.slice(1);
    const brand2Name = brand2.charAt(0).toUpperCase() + brand2.slice(1);
    
    // Handle edge case where min equals max
    if (Math.abs(range.max - range.min) < 0.01) {
      if (range.min >= 10) return `${range.min.toFixed(1)}pp+ ${brand1Name} Stronghold`;
      if (range.min >= 5) return `${range.min.toFixed(1)}pp ${brand1Name} Advantage`;
      if (range.min >= 0) return `${range.min.toFixed(1)}pp ${brand1Name} Edge`;
      if (range.min >= -5) return `${Math.abs(range.min).toFixed(1)}pp ${brand2Name} Edge`;
      if (range.min >= -10) return `${Math.abs(range.min).toFixed(1)}pp ${brand2Name} Advantage`;
      return `${Math.abs(range.min).toFixed(1)}pp+ ${brand2Name} Stronghold`;
    }
    
    // Normal range formatting with "pp" (percentage points) for clarity
    if (range.max <= -10) return `${Math.abs(range.max).toFixed(0)}pp+ ${brand2Name} Stronghold`;
    if (range.max <= -5) return `${Math.abs(range.max).toFixed(1)}pp to ${Math.abs(range.min).toFixed(1)}pp ${brand2Name} Advantage`;
    if (range.max <= 0) return `${Math.abs(range.max).toFixed(1)}pp to ${Math.abs(range.min).toFixed(1)}pp ${brand2Name} Edge`;
    if (range.min >= 10) return `${range.min.toFixed(0)}pp+ ${brand1Name} Stronghold`;
    if (range.min >= 5) return `${range.min.toFixed(1)}pp to ${range.max.toFixed(1)}pp ${brand1Name} Advantage`;
    if (range.min >= 0) return `${range.min.toFixed(1)}pp to ${range.max.toFixed(1)}pp ${brand1Name} Edge`;
    
    // Cross-zero ranges (competitive battlegrounds)
    if (Math.abs(range.min) <= 5 && Math.abs(range.max) <= 5) {
      return `Competitive Parity (±${Math.max(Math.abs(range.min), Math.abs(range.max)).toFixed(1)}pp)`;
    }
    
    return `${range.min.toFixed(1)}pp to ${range.max.toFixed(1)}pp`;
  }

  /**
   * Detect which brand fields are actually available in the raw data
   */
  private detectAvailableBrandFields(rawData: RawAnalysisResult): string[] {
    if (!rawData.results || rawData.results.length === 0) {
      return [];
    }

    const brandFieldsFound = new Map<string, string>(); // brand name -> field code
    const sampleRecord = rawData.results[0];
    
    // Look for brand fields in the data (TurboTax and H&R Block)
    for (const [key, value] of Object.entries(sampleRecord)) {
      if ((key === 'MP10104A_B_P' || key === 'MP10128A_B_P') && typeof value === 'number') {
        // Use the field code as-is
        const fieldCode = key;
        
        // Try to find a known brand name from our mappings
        let brandName: string | null = null;
        for (const [brand, code] of Object.entries(this.BRAND_MAPPINGS)) {
          if (code === fieldCode) {
            brandName = brand;
            break;
          }
        }
        
        // If we don't know this brand, create a name from the field code
        if (!brandName) {
          if (key === 'MP10104A_B_P') {
            brandName = 'turbotax';
          } else if (key === 'MP10128A_B_P') {
            brandName = 'h&r block';
          } else {
            brandName = key; // Use field name as brand name if pattern doesn't match
          }
          console.log(`[BrandDifferenceProcessor] Found brand field ${fieldCode}, naming it: ${brandName}`);
        }
        
        brandFieldsFound.set(brandName, fieldCode);
      }
    }
    
    const availableBrands = Array.from(brandFieldsFound.keys());
    console.log(`[BrandDifferenceProcessor] Detected ${availableBrands.length} brands in data:`, availableBrands);
    console.log(`[BrandDifferenceProcessor] Brand field mapping:`, Object.fromEntries(brandFieldsFound));
    return availableBrands;
  }

  /**
   * Get the field code for a brand, handling both known and unknown brands
   */
  private getBrandFieldCode(sampleRecord: any, brandName: string): string {
    // First check if it's a known brand
    const knownCode = this.BRAND_MAPPINGS[brandName as keyof typeof this.BRAND_MAPPINGS];
    if (knownCode) {
      return knownCode;
    }
    
    // Otherwise, search for the field in the data
    for (const [key, value] of Object.entries(sampleRecord)) {
      if ((key === 'MP10104A_B_P' || key === 'MP10128A_B_P') && typeof value === 'number') {
        // Check if this field matches any known brand
        for (const [brand, code] of Object.entries(this.BRAND_MAPPINGS)) {
          if (code === key && brand.toLowerCase() === brandName.toLowerCase()) {
            return key;
          }
        }
      }
    }
    
    console.warn(`[BrandDifferenceProcessor] Could not find field code for brand: ${brandName}, using fallback`);
    return 'MP10104A_B_P';
  }
}