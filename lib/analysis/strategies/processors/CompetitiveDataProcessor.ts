import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';
import { calculateEqualCountQuintiles } from '../../utils/QuintileUtils';

/**
 * CompetitiveDataProcessor - Handles data processing for the /competitive-analysis endpoint
 * 
 * Processes competitive analysis results comparing multiple brands or entities
 * across geographic areas with market share analysis and competitive positioning.
 */
export class CompetitiveDataProcessor implements DataProcessorStrategy {
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Competitive analysis ONLY requires competitive_advantage_score
    const hasCompetitiveFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        (record.area_id || record.id || record.ID) &&
        record.competitive_advantage_score !== undefined
      );
    
    return hasCompetitiveFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    console.log(`🔥🔥🔥 [COMPETITIVE PROCESSOR] CALLED WITH ${rawData.results?.length || 0} RECORDS 🔥🔥🔥`);
    console.log(`[CompetitiveDataProcessor] Process method called with ${rawData.results?.length || 0} records`);
    
    if (!this.validate(rawData)) {
      console.error(`[CompetitiveDataProcessor] Validation failed`);
      throw new Error('Invalid data format for CompetitiveDataProcessor');
    }

    // Process records with competitive information
    const records = this.processCompetitiveRecords(rawData.results);
    
    console.log(`[CompetitiveDataProcessor] Processed ${records.length} records`);
    console.log(`[CompetitiveDataProcessor] Sample processed record:`, {
      area_name: records[0]?.area_name,
      value: records[0]?.value,
      nike_market_share: records[0]?.properties?.nike_market_share,
      competitive_advantage_score: records[0]?.properties?.competitive_advantage_score
    });
    
    // Calculate competitive statistics
    const statistics = this.calculateCompetitiveStatistics(records);
    
    // Analyze competitive landscape
    const competitiveAnalysis = this.analyzeCompetitiveLandscape(records);
    
    // Process feature importance for competitive factors
    const featureImportance = this.processCompetitiveFeatureImportance(rawData.feature_importance || []);
    
    // Generate competitive summary
    const summary = this.generateCompetitiveSummary(records, competitiveAnalysis, rawData.summary);

    console.log(`[CompetitiveDataProcessor] Final result summary:`, {
      type: 'competitive_analysis',
      recordCount: records.length,
      targetVariable: 'expansion_opportunity_score',
      topRecord: records[0] ? {
        area_name: records[0].area_name,
        value: records[0].value,
        rank: records[0].rank
      } : 'No records'
    });

    return {
      type: 'competitive_analysis',
      records,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'competitive_advantage_score',
      renderer: this.createCompetitiveRenderer(records), // Add direct renderer  
      legend: this.createCompetitiveLegend(records), // Add direct legend
      competitiveAnalysis // Additional metadata for competitive visualization
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processCompetitiveRecords(rawRecords: any[]): GeographicDataPoint[] {
    return rawRecords.map((record, index) => {
      const area_id = record.area_id || record.id || record.GEOID || `area_${index}`;
      const area_name = record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || record.name || record.NAME || `Area ${index + 1}`;
      
      // Extract competitive metrics
      const competitiveScore = this.extractCompetitiveScore(record);
      const marketShare = this.extractMarketShare(record);
      
      // Use competitive score as the primary value
      const value = competitiveScore;
      
      // Extract Nike market share for visualization sizing
      const nikeMarketShare = Number(record.value_MP30034A_B_P) || 0; // Already in percentage format
      
      // Extract competitive-specific properties
      const properties = {
        ...this.extractProperties(record),
        competitive_advantage_score: competitiveScore,
        score_source: 'competitive_advantage_score',
        market_share: marketShare,
        nike_market_share: nikeMarketShare, // For renderer sizing
        adidas_market_share: Number(record.value_MP30029A_B_P) || 0,
        jordan_market_share: Number(record.value_MP30032A_B_P) || 0,
        nike_shap: Number(record.shap_MP30034A_B_P) || 0,
        adidas_shap: Number(record.shap_MP30029A_B_P) || 0,
        brand_strength: record.brand_strength || 0,
        competitive_position: this.determineCompetitivePosition(competitiveScore),
        market_penetration: record.market_penetration || 0,
        brand_awareness: record.brand_awareness || 0,
        price_competitiveness: record.price_competitiveness || 0
      };
      
      // Extract SHAP values
      const shapValues = this.extractShapValues(record);
      
      // Category based on competitive position
      const category = this.getCompetitiveCategory(competitiveScore, marketShare);

      return {
        area_id,
        area_name,
        value,
        competitive_advantage_score: competitiveScore, // Add at top level for visualization
        rank: 0, // Will be calculated in ranking
        category,
        coordinates: record.coordinates || [0, 0],
        properties,
        shapValues
      };
    }).sort((a, b) => b.value - a.value) // Sort by competitive score
      .map((record, index) => ({ ...record, rank: index + 1 })); // Assign ranks
  }

  private extractCompetitiveScore(record: any): number {
    // Competitive analysis ONLY uses competitive_advantage_score - no fallbacks
    const score = Number(record.competitive_advantage_score);
    
    if (isNaN(score)) {
      throw new Error(`Competitive analysis record ${record.ID || 'unknown'} is missing competitive_advantage_score`);
    }
    
    return score;
  }

  private extractMarketShare(record: any): number {
    // FIXED: Extract Nike market share from SHAP data (already in percentage format)
    const nikeShare = Number(record.value_MP30034A_B_P) || 0; // Already in percentage format
    
    if (nikeShare > 0) {
      // Convert to 0-1 range for market share representation
      return nikeShare / 100;
    }
    
    // Try legacy market share fields as fallback
    const shareFields = [
      'market_share', 'share', 'market_penetration', 'penetration_rate'
    ];
    
    for (const field of shareFields) {
      if (record[field] !== undefined && record[field] !== null) {
        const share = Number(record[field]);
        if (!isNaN(share)) {
          // Ensure it's in 0-1 range (convert percentage if needed)
          return share > 1 ? share / 100 : share;
        }
      }
    }
    
    return 0.1; // Default low market share
  }

  private extractProperties(record: any): Record<string, any> {
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'competitive_score', 'market_share',
      'coordinates', 'shap_values'
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
    
    const shapValues: Record<string, number> = {};
    
    for (const [key, value] of Object.entries(record)) {
      if ((key.includes('shap') || key.includes('impact') || key.includes('contribution') || key.includes('factor')) 
          && typeof value === 'number') {
        shapValues[key] = value;
      }
    }
    
    return shapValues;
  }

  private determineCompetitivePosition(score: number): string {
    if (score >= 85) return 'dominant_advantage';
    if (score >= 70) return 'strong_advantage';
    if (score >= 55) return 'competitive_advantage';
    if (score >= 40) return 'moderate_position';
    if (score >= 25) return 'weak_position';
    return 'disadvantaged';
  }

  private getCompetitiveCategory(score: number, marketShare: number): string {
    // Combine score and market share for categorization
    const combinedMetric = (score + marketShare * 100) / 2;
    
    if (combinedMetric >= 75) return 'dominant';
    if (combinedMetric >= 50) return 'competitive';
    if (combinedMetric >= 25) return 'challenged';
    return 'underperforming';
  }

  private calculateCompetitiveStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
    const scores = records.map(r => r.value).filter(v => !isNaN(v));
    const marketShares = records.map(r => r.properties.nike_market_share || 0).filter(v => !isNaN(v));
    
    if (scores.length === 0) {
      return {
        total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0,
        marketConcentration: 0, competitiveIntensity: 0, avgMarketShare: 0,
        quintiles: { competitive: [], marketShare: [] } // Add quintile information
      };
    }
    
    const sorted = [...scores].sort((a, b) => a - b);
    const sortedShares = [...marketShares].sort((a, b) => a - b);
    const total = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const median = total % 2 === 0 
      ? (sorted[Math.floor(total / 2) - 1] + sorted[Math.floor(total / 2)]) / 2
      : sorted[Math.floor(total / 2)];
    
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    // Calculate quintiles (20%, 40%, 60%, 80%, 100%) for competitive scores
    const competitiveQuintiles = this.calculateQuintiles(sorted);
    const marketShareQuintiles = this.calculateQuintiles(sortedShares);
    
    // Competitive-specific metrics
    const avgMarketShare = marketShares.reduce((a, b) => a + b, 0) / marketShares.length;
    const marketConcentration = this.calculateMarketConcentration(marketShares);
    const competitiveIntensity = this.calculateCompetitiveIntensity(scores);
    
    console.log('[CompetitiveDataProcessor] Competitive quintiles calculated:', competitiveQuintiles);
    console.log('[CompetitiveDataProcessor] Market share quintiles calculated:', marketShareQuintiles);
    
    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev,
      marketConcentration,
      competitiveIntensity,
      avgMarketShare,
      quintiles: {
        competitive: competitiveQuintiles,
        marketShare: marketShareQuintiles
      }
    };
  }

  private calculateQuintiles(sortedValues: number[]): number[] {
    // Use the proper equal-count quintile calculation
    const quintileResult = calculateEqualCountQuintiles(sortedValues);
    return quintileResult.quintiles;
  }

  private calculateMarketConcentration(marketShares: number[]): number {
    // Calculate Herfindahl-Hirschman Index (HHI) as a measure of market concentration
    const hhi = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0);
    return Math.min(1, hhi); // Normalize to 0-1 range
  }

  private calculateCompetitiveIntensity(scores: number[]): number {
    // Measure how spread out the competitive scores are (higher spread = more intense competition)
    if (scores.length <= 1) return 0;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / scores.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    return Math.min(1, coefficientOfVariation); // Normalize to 0-1 range
  }

  private analyzeCompetitiveLandscape(records: GeographicDataPoint[]): any {
    // Group by competitive categories
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
      const avgScore = categoryRecords.reduce((sum, r) => sum + r.value, 0) / categoryRecords.length;
      const avgMarketShare = categoryRecords.reduce((sum, r) => sum + (r.properties.market_share || 0), 0) / categoryRecords.length;
      
      return {
        category,
        size: categoryRecords.length,
        percentage: (categoryRecords.length / records.length) * 100,
        avgCompetitiveScore: avgScore,
        avgMarketShare,
        topAreas: categoryRecords
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map(r => ({
            name: r.area_name,
            score: r.value,
            marketShare: r.properties.market_share
          }))
      };
    });
    
    // Identify market leaders and opportunities
    const marketLeaders = records
      .filter(r => r.category === 'dominant')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    const growthOpportunities = records
      .filter(r => r.category === 'challenged' && r.properties.market_share < 0.3)
      .sort((a, b) => (b.properties.brand_awareness || 0) - (a.properties.brand_awareness || 0))
      .slice(0, 5);
    
    return {
      categories: categoryAnalysis,
      marketLeaders: marketLeaders.map(r => ({
        area: r.area_name,
        score: r.value,
        marketShare: r.properties.market_share,
        position: r.properties.competitive_position
      })),
      growthOpportunities: growthOpportunities.map(r => ({
        area: r.area_name,
        currentShare: r.properties.market_share,
        brandAwareness: r.properties.brand_awareness,
        opportunity: 'high'
      })),
      competitiveBalance: this.assessCompetitiveBalance(categoryAnalysis)
    };
  }

  private assessCompetitiveBalance(categoryAnalysis: any[]): string {
    const dominantPercentage = categoryAnalysis.find(c => c.category === 'dominant')?.percentage || 0;
    const competitivePercentage = categoryAnalysis.find(c => c.category === 'competitive')?.percentage || 0;
    
    if (dominantPercentage > 60) return 'market_monopolized';
    if (dominantPercentage + competitivePercentage > 80) return 'oligopolistic';
    if (competitivePercentage > 50) return 'highly_competitive';
    return 'fragmented_market';
  }

  private processCompetitiveFeatureImportance(rawFeatureImportance: any[]): any[] {
    return rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getCompetitiveFeatureDescription(item.feature || item.name),
      competitiveImpact: this.assessCompetitiveImpact(item.importance || 0)
    })).sort((a, b) => b.importance - a.importance);
  }

  private getCompetitiveFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'price': 'Price competitiveness factor',
      'quality': 'Product/service quality impact',
      'brand': 'Brand strength and recognition',
      'distribution': 'Distribution channel effectiveness',
      'marketing': 'Marketing and advertising reach',
      'customer': 'Customer satisfaction and loyalty',
      'innovation': 'Innovation and differentiation',
      'location': 'Geographic and location advantages'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} competitive factor`;
  }

  private assessCompetitiveImpact(importance: number): string {
    if (importance >= 0.8) return 'critical_advantage';
    if (importance >= 0.6) return 'significant_factor';
    if (importance >= 0.4) return 'moderate_influence';
    if (importance >= 0.2) return 'minor_factor';
    return 'negligible_impact';
  }

  private generateCompetitiveSummary(
    records: GeographicDataPoint[], 
    competitiveAnalysis: any, 
    rawSummary?: string
  ): string {
    
    // Enhanced summary with expansion opportunity focus
    const recordCount = records.length;
    const topExpansionTargets = records.slice(0, 10); // Top 10 expansion opportunities
    const avgScore = records.reduce((sum, r) => sum + r.value, 0) / recordCount;
    
    // Check data quality
    const nonZeroRecords = records.filter(r => r.value > 0);
    const dataQualityPercent = (nonZeroRecords.length / recordCount * 100).toFixed(1);
    
    // Start with plain-language explanation of competitive advantage scoring
    let summary = `**🏆 Understanding Competitive Advantage Scores (0-100 scale):**

**What This Score Measures:** How well-positioned Nike is to succeed in each market compared to competitors, especially Adidas. Higher scores indicate markets where Nike has the strongest advantages for growth and expansion.

**How We Calculate It:** The score combines three key factors that determine Nike's competitive strength:
• **Market Position (worth up to 40 points):** How much stronger Nike's market share is compared to Adidas, plus how well Nike's brand characteristics match what drives success in that area
• **Market Fit (worth up to 35 points):** How well the local demographics align with Nike's core customer base - people aged 16-35 with household incomes between $35K-$150K tend to be Nike's strongest markets
• **Competitive Environment (worth up to 25 points):** How fragmented the market is and whether there's room for Nike to grow without intense competition

**Why This Matters:** Markets with scores of 70+ are prime expansion targets, while scores below 40 suggest either strong competition or poor demographic fit.

`;
    
    // Enhanced baseline and competitive metrics section
    summary += `**🏆 Competitive Baseline & Market Averages:** `;
    summary += `Market average competitive advantage: ${avgScore.toFixed(1)} (range: ${records[records.length - 1]?.value.toFixed(1) || '0'}-${records[0]?.value.toFixed(1) || '0'}). `;
    
    // Calculate competitive landscape baselines
    const avgNikeShare = records.reduce((sum, r) => {
      const nike = Number(r.properties?.nike_market_share) || 0;
      return sum + nike;
    }, 0) / recordCount;
    
    const avgAdidasShare = records.reduce((sum, r) => {
      const adidas = Number(r.properties?.adidas_market_share) || 0;
      return sum + adidas;
    }, 0) / recordCount;
    
    const avgMarketGap = 100 - avgNikeShare - avgAdidasShare;
    const avgWealthIndex = records.reduce((sum, r) => sum + (Number(r.properties?.value_WLTHINDXCY) || 100), 0) / recordCount;
          const avgIncome = records.reduce((sum, r) => {
        const wealth = Number(r.properties?.value_WLTHINDXCY) || 100;
        const income = Number(r.properties?.value_AVGHINC_CY) || (wealth * 500);
        return sum + income;
      }, 0) / recordCount;
    const avgPopulation = records.reduce((sum, r) => sum + (Number(r.properties?.value_TOTPOP_CY) || 0), 0) / recordCount;
    
    summary += `Competitive baseline: Nike ${avgNikeShare.toFixed(1)}%, Adidas ${avgAdidasShare.toFixed(1)}%, untapped market ${avgMarketGap.toFixed(1)}%. `;
    summary += `Market demographics: wealth index ${avgWealthIndex.toFixed(0)}, $${(avgIncome/1000).toFixed(0)}K estimated income, ${(avgPopulation/1000).toFixed(0)}K average population. `;
    
    // Expansion opportunity distribution
    const highExpansion = records.filter(r => r.value >= 70).length;
    const moderateExpansion = records.filter(r => r.value >= 50).length;
    const developingExpansion = records.filter(r => r.value >= 30).length;
    
    summary += `Expansion distribution: ${highExpansion} high-opportunity markets (${(highExpansion/recordCount*100).toFixed(1)}%), ${moderateExpansion} moderate+ (${(moderateExpansion/recordCount*100).toFixed(1)}%), ${developingExpansion} developing+ (${(developingExpansion/recordCount*100).toFixed(1)}%).

`;
    
    summary += `**Competitive Advantage Analysis:** Analyzed ${recordCount} markets to identify where Nike has the strongest competitive position. Scoring combines Nike's market position vs Adidas, demographic alignment with Nike's premium brand positioning, and competitive environment favorability. `;
    
    if (nonZeroRecords.length < recordCount * 0.5) {
      summary += `⚠️ **Data Quality Notice:** ${recordCount - nonZeroRecords.length} areas show zero competitive scores, indicating potential data gaps. `;
    }
    
    // Top expansion opportunities - highest scored markets (UNDERSERVED, not dominated)
    if (topExpansionTargets.length > 0) {
      summary += `
\n**🎯 Top Expansion Opportunities** (Markets with GROWTH potential, not current Nike dominance): `;
      
      topExpansionTargets.slice(0, 8).forEach((record, index) => {
        const nikeShare = Number(record.properties?.value_MP30034A_B_P) || 0; // Already in percentage format
        const adidasShare = Number(record.properties?.value_MP30029A_B_P) || 0; // Already in percentage format
        const population = Number(record.properties?.value_TOTPOP_CY) || 0;
        const wealthIndex = Number(record.properties?.value_WLTHINDXCY) || 100;
        const income = Number(record.properties?.value_AVGHINC_CY) || (wealthIndex * 500); // Use wealth index to estimate income
        const marketGap = Math.max(0, 100 - nikeShare - adidasShare);
        
        summary += `${index + 1}. **${record.area_name || 'Unknown Area'}**: ${record.value.toFixed(1)} expansion score`;
        
        if (nikeShare > 0) {
          summary += ` (${nikeShare.toFixed(1)}% current Nike share`;
          if (marketGap > 0) {
            summary += `, ${marketGap.toFixed(1)}% market gap`;
          }
          summary += `)`;
        }
        
        if (population > 0 && income > 0) {
          summary += ` - ${(population/1000).toFixed(0)}K population, wealth index ${wealthIndex.toFixed(0)}, $${(income/1000).toFixed(0)}K estimated income`;
        }
        
        summary += `. `;
      });
    }
    
    // Market segmentation based on expansion opportunity scores (not Nike dominance)
    const topTierMarkets = records.filter(r => r.value >= 80).slice(0, 5);
    const strongMarkets = records.filter(r => r.value >= 60 && r.value < 80).slice(0, 5);
    const emergingMarkets = records.filter(r => r.value >= 40 && r.value < 60).slice(0, 5);
    
    if (topTierMarkets.length > 0) {
      summary += `
\n**🏆 Premium Expansion Targets** (80+ expansion scores - high growth potential): `;
      topTierMarkets.forEach((record, index) => {
        const nikeShare = Number(record.properties?.value_MP30034A_B_P) || 0; // Already in percentage format
        summary += `${record.area_name} (${record.value.toFixed(1)} score, ${nikeShare.toFixed(1)}% Nike share), `;
      });
      summary = summary.slice(0, -2) + '. ';
    }
    
    if (strongMarkets.length > 0) {
      summary += `
\n**📈 Strong Expansion Targets** (60-80 expansion scores - solid growth potential): `;
      strongMarkets.forEach((record, index) => {
        const nikeShare = Number(record.properties?.value_MP30034A_B_P) || 0; // Already in percentage format
        summary += `${record.area_name} (${record.value.toFixed(1)} score, ${nikeShare.toFixed(1)}% Nike share), `;
      });
      summary = summary.slice(0, -2) + '. ';
    }
    
    if (emergingMarkets.length > 0) {
      summary += `
\n**🌱 Developing Expansion Markets** (40-60 expansion scores - moderate growth potential): `;
      emergingMarkets.forEach((record, index) => {
        const nikeShare = Number(record.properties?.value_MP30034A_B_P) || 0; // Already in percentage format
        summary += `${record.area_name} (${record.value.toFixed(1)} score, ${nikeShare.toFixed(1)}% Nike share), `;
      });
      summary = summary.slice(0, -2) + '. ';
    }
    
    // Strategic insights based on expansion methodology
    summary += `
\n**Strategic Expansion Insights:** `;
    
    if (avgScore >= 60) {
      summary += `Strong overall market landscape with average competitive advantage of ${avgScore.toFixed(1)}. `;
    } else if (avgScore >= 40) {
      summary += `Moderate expansion potential with average competitive advantage of ${avgScore.toFixed(1)}. `;
    } else {
      summary += `Challenging market conditions with average competitive advantage of ${avgScore.toFixed(1)}. `;
    }
    
    // High-scoring market concentration
    const highScoreMarkets = records.filter(r => r.value >= 70).length;
    if (highScoreMarkets > 0) {
      summary += `${highScoreMarkets} markets show exceptional expansion potential (70+ scores). `;
    }
    
    // Competitive positioning insights
    const competitiveAnalysisData = competitiveAnalysis?.categoryAnalysis;
    if (competitiveAnalysisData) {
      const dominantMarkets = competitiveAnalysisData.find((cat: any) => cat.category === 'dominant');
      if (dominantMarkets && dominantMarkets.size > 0) {
        summary += `Nike has strong positioning in ${dominantMarkets.size} markets for accelerated expansion. `;
      }
    }
    
    // Recommendation based on expansion focus
    summary += `**Expansion Strategy:** Prioritize markets with scores 60+ for immediate expansion, while developing 40-60 score markets for future opportunities. Focus on demographic alignment and competitive positioning advantages. `;
    
    return summary;
  }

  // ============================================================================
  // DIRECT RENDERING METHODS
  // ============================================================================

  /**
   * Create direct renderer for competitive analysis visualization
   */
  private createCompetitiveRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use same colors as strategic analysis: Red (low) -> Orange -> Light Green -> Dark Green (high)
    const competitiveColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (lowest competitive advantage)
      [253, 174, 97, 0.6],  // #fdae61 - Orange  
      [166, 217, 106, 0.6], // #a6d96a - Light Green
      [26, 152, 80, 0.6]    // #1a9850 - Dark Green (highest competitive advantage)
    ];
    
    return {
      type: 'class-breaks',
      field: 'competitive_advantage_score', // Direct field reference
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: competitiveColors[i], // Direct array format
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
   * Create direct legend for competitive analysis
   */
  private createCompetitiveLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use RGBA format with correct opacity to match features (same as strategic)
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
      title: 'Competitive Advantage Score',
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
} 