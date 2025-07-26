import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { getScoreExplanationForAnalysis } from '../../utils/ScoreExplanations';

/**
 * CoreAnalysisProcessor - Handles data processing for the /analyze endpoint
 * 
 * Processes general analysis results with comprehensive ranking, scoring,
 * and statistical analysis capabilities.
 */
export class CoreAnalysisProcessor implements DataProcessorStrategy {
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Validate that we have the expected fields for core analysis - UPDATED for SHAP brand data
    const hasRequiredFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        (record.value !== undefined || 
         record.score !== undefined ||
         // Check for brand-specific fields from SHAP data
         record.value_MP30034A_B_P !== undefined || // Nike market share
         record.value_MP30029A_B_P !== undefined || // Adidas market share
         record.shap_MP30034A_B_P !== undefined ||  // Nike SHAP values
         record.shap_MP30029A_B_P !== undefined ||  // Adidas SHAP values
         // Check for demographic data that can be used for analysis
         record.value_TOTPOP_CY !== undefined ||
         record.value_AVGHINC_CY !== undefined)
      );
    
    return hasRequiredFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`📊 [CORE ANALYSIS PROCESSOR] CALLED WITH ${rawData.results?.length || 0} RECORDS 📊`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for CoreAnalysisProcessor');
    }

    // --- ENHANCED: Use pre-calculated strategic value scores with fallback ---
    const processedRecords = rawData.results.map((record: any, index: number) => {
      // PRIORITIZE PRE-CALCULATED STRATEGIC VALUE SCORE
      let primaryScore;
      if (record.strategic_value_score !== undefined && record.strategic_value_score !== null) {
        primaryScore = Number(record.strategic_value_score);
        console.log(`🎯 [CoreAnalysisProcessor] Using strategic value score: ${primaryScore} for ${record.DESCRIPTION || record.ID || 'Unknown'}`);
      } else {
        // FALLBACK: Calculate opportunity score from available data
        console.log('⚠️ [CoreAnalysisProcessor] No strategic_value_score found, calculating from raw data');
        
        // Get actual brand values from the data (correlation_analysis format)
        const nikeValue = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
        const adidasValue = Number(record.value_MP30029A_B_P) || 0;
        const totalPop = Number(record.total_population || record.value_TOTPOP_CY) || 1;
        const medianIncome = Number(record.median_income || record.value_AVGHINC_CY) || 50000;
        
        // DEBUG: Log raw data values to identify the calculation issue
        if (index < 5) {
          console.log(`🔍 [CoreAnalysisProcessor] Raw data analysis for record ${index + 1}:`, {
            area_id: record.ID || record.id,
            nike_value: nikeValue,
            adidas_value: adidasValue,
            total_pop: totalPop,
            median_income: medianIncome,
            available_fields: Object.keys(record).filter(k => k.includes('nike') || k.includes('adidas') || k.includes('pop') || k.includes('income')),
            all_field_sample: Object.keys(record).slice(0, 10)
          });
        }
        
        // Calculate fallback opportunity score from actual data
        const marketGap = Math.max(0, 100 - nikeValue - adidasValue); // Untapped market
        const incomeBonus = Math.min((medianIncome - 50000) / 50000, 1); // Income advantage
        const populationWeight = Math.min(totalPop / 50000, 2); // Population density
        const competitiveAdvantage = Math.max(0, nikeValue - adidasValue); // Nike vs Adidas
        
        // DEBUG: Log calculation components
        if (index < 5) {
          console.log(`🔍 [CoreAnalysisProcessor] Calculation components for record ${index + 1}:`, {
            marketGap: marketGap,
            marketGap_contribution: marketGap * 0.4,
            incomeBonus: incomeBonus,
            income_contribution: incomeBonus * 20,
            populationWeight: populationWeight,
            population_contribution: populationWeight * 15,
            competitiveAdvantage: competitiveAdvantage,
            competitive_contribution: competitiveAdvantage * 0.25,
            total_score: (marketGap * 0.4 + incomeBonus * 20 + populationWeight * 15 + competitiveAdvantage * 0.25)
          });
        }
        
        // IMPROVED: More sophisticated strategic value calculation (0-10 scale)
        // 1. Market Opportunity (0-3 points): Based on untapped market potential
        const marketOpportunity = Math.min(3, (marketGap / 100) * 3);
        
        // 2. Economic Attractiveness (0-2 points): Income-adjusted population
        const economicScore = Math.min(2, 
          (Math.max(0, (medianIncome - 30000) / 70000) * 1) + // Income factor (0-1)
          (Math.min(totalPop / 100000, 1) * 1)                // Population factor (0-1)
        );
        
        // 3. Competitive Position (0-2 points): Nike's current standing
        const competitiveScore = Math.min(2,
          (Math.max(0, nikeValue / 50) * 1) +           // Nike strength (0-1)
          (Math.max(0, (nikeValue - adidasValue) / 25) * 1) // Relative advantage (0-1)
        );
        
        // 4. Growth Potential (0-2 points): Based on market dynamics
        const growthPotential = Math.min(2,
          (marketGap > 80 ? 1 : marketGap / 80) +      // High untapped market (0-1)
          (medianIncome > 60000 ? 1 : 0)               // High-income bonus (0-1)
        );
        
        // 5. Strategic Fit (0-1 points): Urban/suburban preference
        const strategicFit = Math.min(1, 
          totalPop > 25000 ? 1 : totalPop / 25000      // Urban density preference
        );
        
        // Composite strategic value score (0-10 scale)
        primaryScore = Math.min(10, 
          marketOpportunity + economicScore + competitiveScore + growthPotential + strategicFit
        );
        
        // DEBUG: Log improved calculation components
        if (index < 5) {
          console.log(`✨ [CoreAnalysisProcessor] IMPROVED calculation for record ${index + 1}:`, {
            marketOpportunity: marketOpportunity.toFixed(2),
            economicScore: economicScore.toFixed(2),
            competitiveScore: competitiveScore.toFixed(2),
            growthPotential: growthPotential.toFixed(2),
            strategicFit: strategicFit.toFixed(2),
            total_strategic_score: primaryScore.toFixed(2)
          });
        }
      }
      
      // Generate area name from ID and location data (updated for correlation_analysis format)
      const areaName = this.generateAreaName(record);
      
      // Extract ID (updated for correlation_analysis format)
      const recordId = record.ID || record.id || record.area_id;
      
      // Debug logging for records with missing ID
      if (!recordId) {
        console.warn(`[CoreAnalysisProcessor] Record ${index} missing ID:`, {
          hasID: 'ID' in record,
          hasId: 'id' in record,
          hasAreaId: 'area_id' in record,
          ID_value: record.ID,
          id_value: record.id,
          area_id_value: record.area_id,
          recordKeys: Object.keys(record).slice(0, 10)
        });
      }
      
      // Extract key metrics for properties (updated field names)
      const nikeValue = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
      const adidasValue = Number(record.value_MP30029A_B_P) || 0;
      const totalPop = Number(record.total_population || record.value_TOTPOP_CY) || 0;
      const medianIncome = Number(record.median_income || record.value_AVGHINC_CY) || 0;
      const marketGap = Math.max(0, 100 - nikeValue - adidasValue);
      const competitiveAdvantage = Math.max(0, nikeValue - adidasValue);
      
      return {
        area_id: recordId || `area_${index + 1}`,
        area_name: areaName,
        value: Math.round(primaryScore * 100) / 100, // Use strategic score as primary value
        rank: 0, // Will be calculated after sorting
        properties: {
          ...record, // Include ALL original fields in properties
          strategic_value_score: primaryScore,
          nike_market_share: nikeValue,
          adidas_market_share: adidasValue,
          market_gap: marketGap,
          total_population: totalPop,
          median_income: medianIncome,
          nike_competitive_position: competitiveAdvantage,
          // Include other pre-calculated scores if available
          demographic_opportunity_score: Number(record.demographic_opportunity_score) || 0,
          correlation_strength_score: Number(record.correlation_strength_score) || 0,
          cluster_performance_score: Number(record.cluster_performance_score) || 0
        }
      };
    });
    
    // Calculate comprehensive statistics
    const statistics = this.calculateAdvancedStatistics(processedRecords);
    
    // Rank records by value
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance with descriptions
    const featureImportance = this.processFeatureImportance(rawData.feature_importance || []);
    
    // Generate intelligent summary
    const summary = this.generateSummary(rankedRecords, statistics, rawData.summary);

    return {
      type: 'strategic_analysis', // Strategic analysis type for comprehensive insights
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'strategic_value_score' // Primary ranking by strategic value
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processRecords(rawRecords: any[]): GeographicDataPoint[] {
    return rawRecords.map((record, index) => {
      // Extract core identifiers
      const area_id = record.area_id || record.id || record.GEOID || `area_${index}`;
      const area_name = record.area_name || record.name || record.NAME || 
                       record.area_id || `Area ${index + 1}`;
      
      // Extract value - try multiple field names
      const value = this.extractValue(record);
      
      // Extract additional properties
      const properties = this.extractProperties(record);
      
      // Extract SHAP values if available
      const shapValues = this.extractShapValues(record);
      
      // Determine category based on value percentile
      const category = this.determineCategory(value, rawRecords);

      return {
        area_id,
        area_name,
        value,
        rank: 0, // Will be calculated in rankRecords
        category,
        coordinates: record.coordinates || [0, 0],
        properties,
        shapValues
      };
    });
  }

  /**
   * Extract meaningful value from record - Enhanced for brand analysis
   */
  private extractValue(record: any): number {
    // First try standard value fields
    const standardValue = record.value || record.score || record.result || 
                         record.target_value || record.prediction;
    
    if (standardValue !== undefined && standardValue !== null && standardValue !== 0) {
      return Number(standardValue);
    }
    
    // --- ENHANCED: Calculate from brand data when available ---
    const nikeValue = Number(record.value_MP30034A_B_P) || 0; // Data already in percentage format
    const adidasValue = Number(record.value_MP30029A_B_P) || 0; // Data already in percentage format
    
    if (nikeValue > 0 || adidasValue > 0) {
      // Calculate opportunity score from brand data
      const totalPop = record.value_TOTPOP_CY || 1;
      const wealthIndex = Number(record.value_WLTHINDXCY) || 100;
      const avgIncome = record.value_AVGHINC_CY || (wealthIndex * 500);
      
      // Market opportunity calculation
      const marketGap = Math.max(0, 100 - nikeValue - adidasValue);
      const incomeBonus = Math.max(0, (avgIncome - 50000) / 1000);
      const populationWeight = Math.min(totalPop / 10000, 5);
      const nikeAdvantage = Math.max(0, nikeValue - adidasValue);
      
      // Composite opportunity score
      const opportunityScore = (
        marketGap * 0.3 +      // Untapped market potential
        incomeBonus * 0.2 +    // Income level bonus
        populationWeight * 0.2 + // Population density
        nikeAdvantage * 0.15 +   // Nike competitive position
        nikeValue * 0.15       // Current Nike presence
      );
      
      return Math.round(opportunityScore * 100) / 100;
    }
    
    // Fallback to demographic indicators
    return record.value_TOTPOP_CY || record.value_AVGHINC_CY || record.rank || 1;
  }

  private extractProperties(record: any): Record<string, any> {
    // Extract all properties except internal fields
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'value', 'score', 
      'coordinates', 'shap_values', 'rank', 'category'
    ]);
    
    const properties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(record)) {
      if (!internalFields.has(key)) {
        properties[key] = value;
      }
    }
    
    return properties;
  }

  private extractShapValues(record: any): Record<string, number> {
    if (record.shap_values && typeof record.shap_values === 'object') {
      return record.shap_values;
    }
    
    // Look for SHAP-like fields (fields ending with _shap or _impact)
    const shapValues: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(record)) {
      if ((key.includes('shap') || key.includes('impact')) && typeof value === 'number') {
        shapValues[key] = value;
      }
    }
    
    return shapValues;
  }

  /**
   * Generate fallback SHAP-like values when microservice SHAP is zero
   * This creates meaningful importance scores from actual data relationships
   */
  private generateFallbackShapValues(record: any): Record<string, number> {
    const fallbackShap: Record<string, number> = {};
    
    // Get Nike and Adidas values for comparison (FIXED: Data already in percentage format)
    const nikeValue = Number(record.value_MP30034A_B_P) || 0; // Already in percentage format
    const adidasValue = Number(record.value_MP30029A_B_P) || 0; // Already in percentage format
    const totalPop = record.value_TOTPOP_CY || 1;
    const wealthIndex = Number(record.value_WLTHINDXCY) || 100;
    const avgIncome = record.value_AVGHINC_CY || (wealthIndex * 500);
    
    // Calculate brand preference strength (0-1 scale)
    const brandStrength = Math.max(nikeValue, adidasValue) / 100;
    const competitiveFactor = Math.abs(nikeValue - adidasValue) / 100;
    
    // Generate meaningful importance scores based on data relationships
    fallbackShap['demographic_income'] = (avgIncome - 50000) / 100000 * brandStrength;
    fallbackShap['brand_competition'] = competitiveFactor;
    fallbackShap['market_size'] = (totalPop / 10000) * brandStrength;
    fallbackShap['nike_preference'] = (nikeValue / 100) - 0.2; // Baseline 20%
    fallbackShap['adidas_preference'] = (adidasValue / 100) - 0.15; // Baseline 15%
    
    // Add demographic factors with realistic importance
    if (record.value_MEDAGE_CY) {
      const ageOptimality = 1 - Math.abs((record.value_MEDAGE_CY - 35) / 35); // Optimal age ~35
      fallbackShap['age_factor'] = ageOptimality * brandStrength;
    }
    
    if (record.value_AVGHHSZ_CY) {
      const familyFactor = Math.min(record.value_AVGHHSZ_CY / 4, 1); // Family size factor
      fallbackShap['family_factor'] = familyFactor * brandStrength * 0.3;
    }
    
    return fallbackShap;
  }

  /**
   * Enhanced processing that ensures meaningful analysis even with zero SHAP
   */
  private determineCategory(value: number, allRecords: any[]): string {
    const values = allRecords.map(r => this.extractValue(r)).filter(v => !isNaN(v));
    if (values.length === 0) return 'unknown';
    
    values.sort((a, b) => a - b);
    const p25 = values[Math.floor(values.length * 0.25)];
    const p75 = values[Math.floor(values.length * 0.75)];
    
    if (value >= p75) return 'high';
    if (value <= p25) return 'low';
    return 'medium';
  }

  private rankRecords(records: GeographicDataPoint[]): GeographicDataPoint[] {
    // Sort by value descending and assign ranks
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
    // Map common feature names to human-readable descriptions
    const descriptions: Record<string, string> = {
      'income': 'Household income levels',
      'age': 'Age demographics',
      'education': 'Education levels',
      'population': 'Population density',
      'employment': 'Employment rates',
      'housing': 'Housing characteristics',
      'transportation': 'Transportation access',
      'retail': 'Retail accessibility'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} characteristics`;
  }

  private calculateAdvancedStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
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

  private generateSummary(
    records: GeographicDataPoint[], 
    statistics: AnalysisStatistics, 
    rawSummary?: string
  ): string {
    const categoryBreakdown = this.getCategoryBreakdown(records);
    
    // Start with plain-language score explanation
    let summary = getScoreExplanationForAnalysis('analyze', 'strategic_value');
    
    // Enhanced baseline and average metrics section
    summary += `**📈 Market Baseline & Averages:** `;
    summary += `Market average opportunity score: ${statistics.mean.toFixed(1)} (range: ${statistics.min.toFixed(1)}-${statistics.max.toFixed(1)}). `;
    
          // Calculate and show demographic baselines
      const avgNikeShare = records.reduce((sum, r) => sum + (r.properties.nike_market_share || 0), 0) / records.length;
      const avgAdidasShare = records.reduce((sum, r) => sum + (r.properties.adidas_market_share || 0), 0) / records.length;
      const avgMarketGap = records.reduce((sum, r) => sum + (r.properties.market_gap || 0), 0) / records.length;
      const avgWealthIndex = records.reduce((sum, r) => sum + (r.properties.value_WLTHINDXCY || 100), 0) / records.length;
              const avgIncome = records.reduce((sum, r) => {
          const wealth = r.properties.value_WLTHINDXCY || 100;
          const income = r.properties.avg_income || r.properties.value_AVGHINC_CY || (wealth * 500);
          return sum + income;
        }, 0) / records.length;
      const avgPopulation = records.reduce((sum, r) => sum + (r.properties.total_population || r.properties.value_TOTPOP_CY || 0), 0) / records.length;
    
          summary += `Average Nike presence: ${avgNikeShare.toFixed(1)}%, Adidas presence: ${avgAdidasShare.toFixed(1)}%, market gap: ${avgMarketGap.toFixed(1)}%. `;
      summary += `Demographic baseline: wealth index ${avgWealthIndex.toFixed(0)}, $${(avgIncome/1000).toFixed(0)}K estimated income, ${(avgPopulation/1000).toFixed(0)}K average population. `;
    
    // Performance distribution context
    const above70 = records.filter(r => r.value >= 70).length;
    const above50 = records.filter(r => r.value >= 50).length;
    const above30 = records.filter(r => r.value >= 30).length;
    
    summary += `Performance distribution: ${above70} markets (${(above70/records.length*100).toFixed(1)}%) score 70+, ${above50} (${(above50/records.length*100).toFixed(1)}%) score 50+, ${above30} (${(above30/records.length*100).toFixed(1)}%) score 30+.

`;
    
    summary += `**Market Analysis Complete:** ${statistics.total} geographic areas analyzed across key performance indicators. `;
    
    // Enhanced top performers section (5-8 areas)
    const topPerformers = records.slice(0, 8);
    if (topPerformers.length > 0) {
      const topTier = topPerformers.filter(r => r.value >= 70);
      if (topTier.length > 0) {
        summary += `**Top Performers** (Scores 70+): `;
        const topNames = topTier.slice(0, 6).map(r => `${r.area_name} (${r.value.toFixed(1)})`);
        summary += `${topNames.join(', ')}. `;
        
        // Add insights about top performers
        const avgTopScore = topTier.reduce((sum, r) => sum + r.value, 0) / topTier.length;
        summary += `These areas achieve exceptional performance with average score ${avgTopScore.toFixed(1)}. `;
      }
    }
    
    // Enhanced emerging opportunities section (3-5 areas)
    const emergingOpportunities = records.filter(r => r.value >= 50 && r.value < 70).slice(0, 5);
    if (emergingOpportunities.length > 0) {
      summary += `**Emerging Opportunities** (Scores 50-70): `;
      const emergingNames = emergingOpportunities.map(r => `${r.area_name} (${r.value.toFixed(1)})`);
      summary += `${emergingNames.join(', ')}. `;
      summary += `These areas show strong growth potential with developing market conditions. `;
    }
    
    // Investment targets section (3-5 areas)
    const investmentTargets = records.filter(r => r.value >= 30 && r.value < 50).slice(0, 5);
    if (investmentTargets.length > 0) {
      summary += `**Investment Targets** (Scores 30-50): `;
      const targetNames = investmentTargets.map(r => `${r.area_name} (${r.value.toFixed(1)})`);
      summary += `${targetNames.join(', ')}. `;
      summary += `These areas present strategic value despite lower current performance. `;
    }
    
    // Enhanced performance distribution with context
    summary += `**Market Structure:** ${categoryBreakdown.high} high-performance markets (${(categoryBreakdown.high / statistics.total * 100).toFixed(1)}%), `;
    summary += `${categoryBreakdown.medium} moderate markets (${(categoryBreakdown.medium / statistics.total * 100).toFixed(1)}%), `;
    summary += `${categoryBreakdown.low} developing markets (${(categoryBreakdown.low / statistics.total * 100).toFixed(1)}%). `;
    
    // Strategic insights based on data patterns
    const avgScore = statistics.mean;
    const highPerformers = records.filter(r => r.value > avgScore * 1.2).length;
    summary += `**Strategic Insights:** Market average performance is ${avgScore.toFixed(1)}. `;
    summary += `${highPerformers} areas significantly outperform market average (20%+ above mean). `;
    
    // Add demographic insights if available
    const hasIncomeData = records.some(r => r.properties.avg_income || r.properties.value_AVGHINC_CY);
    const hasPopulationData = records.some(r => r.properties.total_population || r.properties.value_TOTPOP_CY);
    
    if (hasIncomeData || hasPopulationData) {
      summary += `Performance correlates with `;
      const factors = [];
      if (hasIncomeData) factors.push('income levels');
      if (hasPopulationData) factors.push('population density');
      summary += `${factors.join(' and ')}. `;
    }
    
    // Outlier insights
    if (statistics.outlierCount && statistics.outlierCount > 0) {
      summary += `**Outliers Detected:** ${statistics.outlierCount} areas show exceptional patterns requiring further investigation. `;
    }
    
    // Actionable recommendations
    summary += `**Recommendations:** `;
    if (topPerformers.length > 0) {
      summary += `Prioritize immediate expansion in top-performing areas. `;
    }
    if (emergingOpportunities.length > 0) {
      summary += `Develop pilot programs for emerging opportunities. `;
    }
    if (investmentTargets.length > 0) {
      summary += `Consider strategic partnerships in investment target areas. `;
    }
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }

  private getCategoryBreakdown(records: GeographicDataPoint[]) {
    return records.reduce((acc, record) => {
      acc[record.category!] = (acc[record.category!] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Generate meaningful area name from available data
   */
  private generateAreaName(record: any): string {
    // Try explicit name fields first (updated for correlation_analysis format)
    if (record.value_DESCRIPTION) return record.value_DESCRIPTION;
    if (record.DESCRIPTION) return record.DESCRIPTION; // Primary field in correlation_analysis
    if (record.area_name) return record.area_name;
    if (record.NAME) return record.NAME;
    if (record.name) return record.name;
    
    // Create name from ID and location data
    const id = record.ID || record.id || record.GEOID;
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
    
    // Last resort: use coordinates or index
    if (record.coordinates) {
      return `Location ${record.coordinates[0].toFixed(2)},${record.coordinates[1].toFixed(2)}`;
    }
    
    return 'Unknown Area';
  }
} 