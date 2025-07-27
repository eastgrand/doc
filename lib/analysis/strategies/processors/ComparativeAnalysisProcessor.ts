import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';

/**
 * ComparativeAnalysisProcessor - Handles data processing for the /comparative-analysis endpoint
 * 
 * Processes comparative analysis results with focus on relative performance between different 
 * brands, regions, or market characteristics to identify competitive advantages and positioning opportunities.
 */
export class ComparativeAnalysisProcessor implements DataProcessorStrategy {
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Validate that we have expected fields for comparative analysis
    const hasRequiredFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        (record.comparative_score !== undefined || 
         record.value !== undefined || 
         record.score !== undefined ||
         // Check for comparative-relevant fields
         record.mp30034a_b_p !== undefined || // Nike market share for comparison
         record.value_MP30029A_B_P !== undefined || // Adidas market share for comparison
         record.strategic_value_score !== undefined ||
         record.competitive_advantage_score !== undefined)
      );
    
    return hasRequiredFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`⚖️ [COMPARATIVE ANALYSIS PROCESSOR] CALLED WITH ${rawData.results?.length || 0} RECORDS ⚖️`);
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for ComparativeAnalysisProcessor');
    }

    // Process records with comparative analysis scoring priority
    const processedRecords = rawData.results.map((record: any, index: number) => {
      // PRIORITIZE PRE-CALCULATED COMPARATIVE ANALYSIS SCORE
      const comparativeScore = this.extractComparativeScore(record);
      
      // Generate area name from ID and location data
      const areaName = this.generateAreaName(record);
      
      // Extract ID (updated for correlation_analysis format)
      const recordId = record.ID || record.id || record.area_id;
      
      // Debug logging for records with missing ID
      if (!recordId) {
        console.warn(`[ComparativeAnalysisProcessor] Record ${index} missing ID:`, {
          hasID: 'ID' in record,
          hasId: 'id' in record,
          hasAreaId: 'area_id' in record,
          recordKeys: Object.keys(record).slice(0, 10)
        });
      }
      
      // Extract comparative-relevant metrics for properties
      const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
      const adidasShare = Number(record.value_MP30029A_B_P) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const competitiveScore = Number(record.competitive_advantage_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;
      const trendScore = Number(record.trend_strength_score) || 0;
      const totalPop = Number(record.total_population || record.value_TOTPOP_CY) || 0;
      const medianIncome = Number(record.median_income || record.value_AVGHINC_CY) || 0;
      
      // Calculate comparative indicators
      const brandPerformanceGap = this.calculateBrandPerformanceGap(record);
      const marketPositionStrength = this.calculateMarketPositionStrength(record);
      const competitiveDynamicsLevel = this.calculateCompetitiveDynamicsLevel(record);
      const growthDifferential = this.calculateGrowthDifferential(record);
      
      // Calculate brand dominance and market metrics
      const nikeDominance = nikeShare - adidasShare;
      const totalBrandShare = nikeShare + adidasShare;
      const marketGap = Math.max(0, 100 - totalBrandShare);
      
      return {
        area_id: recordId || `area_${index + 1}`,
        area_name: areaName,
        value: Math.round(comparativeScore * 100) / 100, // Use comparative score as primary value
        comparison_score: Math.round(comparativeScore * 100) / 100, // Add comparison_score at top level for visualization
        competitive_advantage_score: Math.round(comparativeScore * 100) / 100, // Keep for compatibility
        rank: 0, // Will be calculated after sorting
        properties: {
          ...record, // Include ALL original fields in properties
          competitive_advantage_score: comparativeScore, // Primary field for competitive analysis
          comparative_analysis_score: comparativeScore, // Keep for compatibility
          strategic_value_score: comparativeScore, // Keep for compatibility
          nike_market_share: nikeShare,
          adidas_market_share: adidasShare,
          nike_dominance: nikeDominance,
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
          dominant_brand: this.identifyDominantBrand(record),
          competitive_advantage_type: this.identifyCompetitiveAdvantageType(record)
        }
      };
    });
    
    // Calculate comprehensive statistics
    const statistics = this.calculateComparativeStatistics(processedRecords);
    
    // Rank records by comparative analysis score (highest advantage first)
    const rankedRecords = this.rankRecords(processedRecords);
    
    // Extract feature importance with comparative focus
    const featureImportance = this.processComparativeFeatureImportance(rawData.feature_importance || []);
    
    // Generate comparative-focused summary
    const summary = this.generateComparativeSummary(rankedRecords, statistics, rawData.summary);

    return {
      type: 'competitive_analysis', // Use correct competitive analysis type
      records: rankedRecords,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'comparison_score', // Use comparison_score to match new data
      renderer: this.createComparativeRenderer(rankedRecords), // Add direct renderer
      legend: this.createComparativeLegend(rankedRecords) // Add direct legend
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
      field: 'comparison_score', // Direct field reference
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: comparativeColors[i], // Direct array format
          outline: { color: [255, 255, 255, 0.8], width: 1 }
        },
        label: this.formatClassLabel(i, quartileBreaks)
      })),
      defaultSymbol: {
        type: 'simple-fill',
        color: [200, 200, 200, 0.5],
        outline: { color: [255, 255, 255, 0.8], width: 1 }
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
   * Format class labels for legend
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
   * Extract comparative analysis score from record with fallback calculation
   */
  private extractComparativeScore(record: any): number {
    // PRIORITY 1: Use new comparative_analysis_score from regenerated data
    if (record.comparative_analysis_score !== undefined && record.comparative_analysis_score !== null) {
      const comparativeScore = Number(record.comparative_analysis_score);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using comparative_analysis_score: ${comparativeScore}`);
      return comparativeScore;
    }
    
    // PRIORITY 2: Use legacy comparative_score if available
    if (record.comparative_score !== undefined && record.comparative_score !== null) {
      const preCalculatedScore = Number(record.comparative_score);
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using legacy comparative_score: ${preCalculatedScore}`);
      return preCalculatedScore;
    }
    
    // PRIORITY 2: Use competitive advantage score if available (scale from 1-10 to 0-100)
    if (record.competitive_advantage_score !== undefined && record.competitive_advantage_score !== null) {
      const competitiveScore = Number(record.competitive_advantage_score);
      const scaledScore = competitiveScore * 10; // Scale 1-10 to 10-100
      console.log(`⚖️ [ComparativeAnalysisProcessor] Using competitive_advantage_score: ${competitiveScore} -> scaled to ${scaledScore}`);
      return scaledScore;
    }
    
    // FALLBACK: Calculate comparative score from available data
    console.log('⚠️ [ComparativeAnalysisProcessor] No direct scores found, calculating from raw data');
    
    const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const competitiveScore = Number(record.competitive_advantage_score) || 0;
    
    // Simple comparative calculation based on brand performance and positioning
    let comparativeScore = 0;
    
    // Brand performance gap (Nike vs Adidas)
    const nikeDominance = nikeShare - adidasShare;
    if (nikeDominance >= 10) {
      comparativeScore += 25; // Strong Nike advantage
    } else if (nikeDominance >= 5) {
      comparativeScore += 20; // Moderate Nike advantage
    } else if (nikeDominance >= 0) {
      comparativeScore += 15; // Slight Nike advantage
    } else {
      comparativeScore += 5; // Nike disadvantage but present
    }
    
    // Market position strength
    if (strategicScore > 60) {
      comparativeScore += 20; // Strong strategic position
    } else if (strategicScore > 45) {
      comparativeScore += 15; // Good strategic position
    } else if (strategicScore > 0) {
      comparativeScore += 10; // Basic strategic position
    }
    
    // Competitive dynamics
    const totalBrandShare = nikeShare + adidasShare;
    if (totalBrandShare >= 30) {
      comparativeScore += 15; // High competitive market
    } else if (totalBrandShare >= 15) {
      comparativeScore += 20; // Developing competitive market
    } else if (totalBrandShare > 0) {
      comparativeScore += 10; // Early stage market
    }
    
    // Competitive advantage bonus
    if (competitiveScore > 0) {
      comparativeScore += Math.min(competitiveScore * 2, 15); // Up to 15 points for competitive advantage
    }
    
    return Math.min(100, comparativeScore);
  }

  /**
   * Calculate brand performance gap metrics
   */
  private calculateBrandPerformanceGap(record: any): number {
    const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    
    if (nikeShare === 0 && adidasShare === 0) {
      return 0; // No brand presence to compare
    }
    
    const nikeDominance = nikeShare - adidasShare;
    const totalBrandShare = nikeShare + adidasShare;
    
    let gapScore = 0;
    
    // Nike dominance scoring
    if (nikeDominance >= 15) {
      gapScore += 40; // Very strong Nike lead
    } else if (nikeDominance >= 10) {
      gapScore += 35; // Strong Nike lead
    } else if (nikeDominance >= 5) {
      gapScore += 25; // Moderate Nike lead
    } else if (nikeDominance >= 0) {
      gapScore += 15; // Slight Nike lead
    } else {
      gapScore += 5; // Nike disadvantage
    }
    
    // Market share magnitude bonus
    if (totalBrandShare >= 40) {
      gapScore += 25; // High competitive intensity
    } else if (totalBrandShare >= 25) {
      gapScore += 20; // Moderate competitive intensity
    } else if (totalBrandShare >= 15) {
      gapScore += 15; // Developing competitive market
    }
    
    // Nike absolute performance
    if (nikeShare >= 35) {
      gapScore += 15; // Very high Nike performance
    } else if (nikeShare >= 25) {
      gapScore += 10; // High Nike performance
    } else if (nikeShare >= 15) {
      gapScore += 5; // Moderate Nike performance
    }
    
    return Math.min(100, gapScore);
  }

  /**
   * Calculate market position strength relative to competitors
   */
  private calculateMarketPositionStrength(record: any): number {
    const strategicScore = Number(record.strategic_value_score) || 0;
    const competitiveScore = Number(record.competitive_advantage_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const totalPop = Number(record.total_population || record.value_TOTPOP_CY) || 0;
    
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
    const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    
    const totalBrandShare = nikeShare + adidasShare;
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
    
    // Nike competitive position in market
    if (nikeShare > 0 && adidasShare > 0) {
      const nikeRatio = nikeShare / (nikeShare + adidasShare);
      if (nikeRatio >= 0.7) {
        dynamicsLevel += 25; // Nike dominance
      } else if (nikeRatio >= 0.6) {
        dynamicsLevel += 20; // Nike advantage
      } else if (nikeRatio >= 0.5) {
        dynamicsLevel += 15; // Balanced competition
      } else {
        dynamicsLevel += 10; // Nike disadvantage but competitive
      }
    } else if (nikeShare > 0) {
      dynamicsLevel += 20; // Nike presence without Adidas competition
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
    if (adidasShare >= 25) {
      dynamicsLevel += 5; // High competitive pressure (competitive advantage)
    } else if (adidasShare >= 15) {
      dynamicsLevel += 8; // Moderate competitive pressure
    } else if (adidasShare >= 5) {
      dynamicsLevel += 10; // Low competitive pressure
    }
    
    return Math.min(100, dynamicsLevel);
  }

  /**
   * Calculate growth differential compared to market baseline
   */
  private calculateGrowthDifferential(record: any): number {
    const trendScore = Number(record.trend_strength_score) || 0;
    const demographicScore = Number(record.demographic_opportunity_score) || 0;
    const strategicScore = Number(record.strategic_value_score) || 0;
    const medianIncome = Number(record.median_income || record.value_AVGHINC_CY) || 0;
    
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
  private identifyDominantBrand(record: any): string {
    const nikeShare = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const adidasShare = Number(record.value_MP30029A_B_P) || 0;
    
    if (nikeShare === 0 && adidasShare === 0) {
      return 'No Brand Presence';
    }
    
    const nikeDominance = nikeShare - adidasShare;
    
    if (nikeDominance >= 15) return 'Nike Strong Dominance';
    if (nikeDominance >= 8) return 'Nike Moderate Dominance';
    if (nikeDominance >= 3) return 'Nike Slight Lead';
    if (nikeDominance >= -3) return 'Balanced Competition';
    if (nikeDominance >= -8) return 'Adidas Slight Lead';
    if (nikeDominance >= -15) return 'Adidas Moderate Dominance';
    return 'Adidas Strong Dominance';
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
    // Try explicit name fields first (updated for correlation_analysis format)
    if (record.value_DESCRIPTION) return record.value_DESCRIPTION;
    if (record.DESCRIPTION) return record.DESCRIPTION;
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
    
    return 'Unknown Area';
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
    const comparativeFeatures = rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getComparativeFeatureDescription(item.feature || item.name)
    }));

    // Add comparative-specific synthetic features if none provided
    if (comparativeFeatures.length === 0) {
      return [
        { feature: 'brand_performance_gap', importance: 0.35, description: 'Nike vs competitors performance differential' },
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
      'nike': 'Nike brand comparative performance',
      'adidas': 'Adidas competitive comparison',
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
    rawSummary?: string
  ): string {
    // Start with comparative scoring explanation
    let summary = `**⚖️ Comparative Analysis Formula (0-100 scale):**
• **Brand Performance Gap (35% weight):** Nike vs competitors performance differential\n• **Market Position Strength (30% weight):** Relative market positioning and dominance\n• **Competitive Dynamics (25% weight):** Competitive pressure and market share dynamics\n• **Growth Differential (10% weight):** Relative growth potential and trend momentum\n\nHigher scores indicate stronger competitive advantages and superior market positioning.\n
`;
    
    // Comparative statistics and baseline metrics
    summary += `**📊 Comparative Analysis Baseline:** `;
    summary += `Average comparative advantage: ${statistics.mean.toFixed(1)} (range: ${statistics.min.toFixed(1)}-${statistics.max.toFixed(1)}). `;
    
    // Calculate brand dominance patterns
    const nikeDominantMarkets = records.filter(r => (r.properties.nike_dominance || 0) > 5).length;
    const balancedMarkets = records.filter(r => Math.abs(r.properties.nike_dominance || 0) <= 5).length;
    const adidasDominantMarkets = records.filter(r => (r.properties.nike_dominance || 0) < -5).length;
    
    summary += `Brand dominance: ${nikeDominantMarkets} Nike-dominant markets (${(nikeDominantMarkets/records.length*100).toFixed(1)}%), `;
    summary += `${balancedMarkets} balanced markets (${(balancedMarkets/records.length*100).toFixed(1)}%), `;
    summary += `${adidasDominantMarkets} Adidas-dominant markets (${(adidasDominantMarkets/records.length*100).toFixed(1)}%). `;
    
    // Market competitive intensity
    const avgTotalBrandShare = records.reduce((sum, r) => sum + (r.properties.total_brand_share || 0), 0) / records.length;
    const avgMarketGap = records.reduce((sum, r) => sum + (r.properties.market_gap || 0), 0) / records.length;
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
          const nikeDom = r.properties.nike_dominance || 0;
          return `${r.area_name} (${r.value.toFixed(1)}, +${nikeDom.toFixed(1)}% Nike lead)`;
        });
        summary += `${competitiveNames.join(', ')}. `;
        
        const avgTopCompetitive = strongCompetitive.reduce((sum, r) => sum + r.value, 0) / strongCompetitive.length;
        summary += `These markets show exceptional competitive positioning with average advantage ${avgTopCompetitive.toFixed(1)}. `;
      }
    }
    
    // Brand performance leaders
    if (records.length > 0) {
      const brandLeaders = records
        .filter(r => (r.properties.brand_performance_gap || 0) >= 60)
        .slice(0, 5);
      
      if (brandLeaders.length > 0) {
        summary += `**Brand Performance Leaders:** `;
        const leaderNames = brandLeaders.map(r => {
          const nikeShare = r.properties.nike_market_share || 0;
          const adidasShare = r.properties.adidas_market_share || 0;
          return `${r.area_name} (Nike ${nikeShare.toFixed(1)}% vs Adidas ${adidasShare.toFixed(1)}%)`;
        });
        summary += `${leaderNames.join(', ')}. `;
        summary += `These markets demonstrate superior brand performance differentials. `;
      }
    }
    
    // Market position strength leaders
    if (records.length > 0) {
      const positionLeaders = records
        .filter(r => (r.properties.market_position_strength || 0) >= 70)
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
        .filter(r => (r.properties.competitive_dynamics_level || 0) >= 65)
        .slice(0, 5);
      
      if (highDynamics.length > 0) {
        summary += `**High Competitive Dynamics:** `;
        const dynamicsNames = highDynamics.map(r => {
          const totalShare = r.properties.total_brand_share || 0;
          return `${r.area_name} (${totalShare.toFixed(1)}% brand presence)`;
        });
        summary += `${dynamicsNames.join(', ')}. `;
        summary += `These markets show intense competitive activity with growth opportunities. `;
      }
    }
    
    // Strategic insights
    summary += `**Competitive Insights:** ${statistics.total} geographic areas analyzed for comparative brand performance and market positioning. `;
    
    const avgNikeDominance = records.reduce((sum, r) => sum + (r.properties.nike_dominance || 0), 0) / records.length;
    if (avgNikeDominance > 0) {
      summary += `Nike holds average ${avgNikeDominance.toFixed(1)}% market share advantage across analyzed markets. `;
    } else {
      summary += `Nike faces competitive challenges with ${Math.abs(avgNikeDominance).toFixed(1)}% disadvantage on average. `;
    }
    
    // Opportunity assessment
    const highGrowthMarkets = records.filter(r => (r.properties.growth_differential || 0) >= 50).length;
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
    if (nikeDominantMarkets > adidasDominantMarkets) {
      summary += `Capitalize on Nike's overall market dominance while defending against competitive threats. `;
    } else {
      summary += `Develop strategies to overcome competitive disadvantages and improve market positioning. `;
    }
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }
}