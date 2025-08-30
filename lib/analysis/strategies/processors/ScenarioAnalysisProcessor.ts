import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { DynamicFieldDetector } from './DynamicFieldDetector';

/**
 * ScenarioAnalysisProcessor - Specialized processor for scenario analysis
 * 
 * Focuses on identifying markets with strong scenario planning capabilities by analyzing
 * scenario adaptability, market resilience, strategic flexibility, and planning readiness.
 */
export class ScenarioAnalysisProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && 
           rawData.success && 
           Array.isArray(rawData.results) && 
           rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Scenario analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      // Extract the pre-calculated scenario analysis score
      let scenarioScore = Number((record as any).scenario_analysis_score || (record as any).scenario_score);
      
      // Check if scenario score looks like market share data (values under 20 are likely market shares)
      if (!isNaN(scenarioScore) && scenarioScore < 20) {
        console.warn(`[ScenarioAnalysisProcessor] Scenario score ${scenarioScore} appears to be market share data for record ${(record as any).ID || index} (valid scenario scores should be 20+), using composite calculation`);
        // Calculate a composite scenario score based on available data
        scenarioScore = this.calculateCompositeScenarioScore(record);
      } else if (isNaN(scenarioScore)) {
        console.warn(`[ScenarioAnalysisProcessor] No scenario score found for record ${(record as any).ID || index}, using composite calculation`);
        scenarioScore = this.calculateCompositeScenarioScore(record);
      }
      
      // Extract related metrics for additional analysis (updated for actual dataset fields)
      const nikeShare = Number((record as any).value_MP30034A_B_P || (record as any).mp30034a_b_p) || 0;
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const competitiveScore = Number((record as any).competitive_advantage_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
      const trendScore = Number((record as any).trend_strength_score) || 0;
      const correlationScore = Number((record as any).correlation_strength_score) || 0;
      const totalPop = Number((record as any).value_TOTPOP_CY || (record as any).TOTPOP_CY || (record as any).total_population) || 0;
      const medianIncome = Number((record as any).value_MEDDI_CY || (record as any).value_AVGHINC_CY || (record as any).median_income) || 0;

      // Calculate additional scenario indicators
      const indicators = this.calculateScenarioIndicators({
        scenarioScore,
        nikeShare,
        strategicScore,
        competitiveScore,
        demographicScore,
        trendScore,
        correlationScore,
        totalPop,
        medianIncome
      });

      return {
        area_id: (record as any).area_id || (record as any).ID || `area_${index}`,
        area_name: (record as any).value_DESCRIPTION || (record as any).DESCRIPTION || (record as any).area_name || `Area ${index + 1}`,
        value: scenarioScore,
        rank: index + 1, // Will be sorted later
        category: this.categorizeScenarioReadiness(scenarioScore),
        coordinates: this.extractCoordinates(record),
        properties: {
          // Core scenario metrics
          scenario_analysis_score: scenarioScore,
          scenario_adaptability_level: indicators.scenarioAdaptability,
          market_resilience_strength: indicators.marketResilience,
          strategic_flexibility_rating: indicators.strategicFlexibility,
          planning_readiness_index: indicators.planningReadiness,
          
          // Scenario readiness characteristics
          primary_scenario_type: indicators.primaryScenarioType,
          adaptability_strength: indicators.adaptabilityStrength,
          resilience_factors: indicators.resilienceFactors,
          flexibility_dimensions: indicators.flexibilityDimensions,
          
          // Scenario planning capabilities
          scenario_planning_maturity: indicators.scenarioPlanningMaturity,
          strategic_pivot_potential: indicators.strategicPivotPotential,
          market_stability_index: indicators.marketStabilityIndex,
          data_reliability_for_planning: indicators.dataReliability,
          
          // Adaptability factors
          demographic_adaptability: indicators.demographicAdaptability,
          market_size_flexibility: indicators.marketSizeFlexibility,
          income_scenario_range: indicators.incomeScenarioRange,
          brand_positioning_flexibility: indicators.brandPositioningFlexibility,
          
          // Resilience indicators
          trend_resilience_factor: indicators.trendResilienceFactor,
          competitive_stability: indicators.competitiveStability,
          correlation_predictability: indicators.correlationPredictability,
          market_share_stability: indicators.marketShareStability,
          
          // Supporting scenario data
          nike_market_share: nikeShare,
          market_population: totalPop,
          median_household_income: medianIncome,
          strategic_position: strategicScore,
          demographic_strength: demographicScore,
          trend_stability: trendScore,
          correlation_reliability: correlationScore,
          
          // Scenario strategy recommendations
          recommended_scenario_approach: indicators.recommendedApproach,
          scenario_priority_level: indicators.scenarioPriority,
          planning_complexity: indicators.planningComplexity,
          scenario_risk_assessment: indicators.scenarioRiskAssessment
        },
        shapValues: (record as any).shap_values || {}
      };
    });

    // Sort by scenario analysis score (highest first)
    records.sort((a, b) => b.value - a.value);
    
    // Update ranks after sorting
    records.forEach((record, index) => {
      (record as any).rank = index + 1;
    });

    // Calculate statistics
    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);

    // Generate scenario analysis summary
    const summary = this.generateScenarioSummary(records, statistics);

    return {
      type: 'scenario_analysis',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'scenario_analysis_score',
      renderer: this.createScenarioRenderer(records),
      legend: this.createScenarioLegend(records)
    };
  }

  private calculateScenarioIndicators(metrics: {
    scenarioScore: number;
    nikeShare: number;
    strategicScore: number;
    competitiveScore: number;
    demographicScore: number;
    trendScore: number;
    correlationScore: number;
    totalPop: number;
    medianIncome: number;
  }) {
    const {
      scenarioScore,
      nikeShare,
      strategicScore,
      competitiveScore,
      demographicScore,
      trendScore,
      correlationScore,
      totalPop,
      medianIncome
    } = metrics;

    // Scenario adaptability assessment
    const scenarioAdaptability = scenarioScore >= 70 ? 'Highly Adaptable' :
                                scenarioScore >= 60 ? 'Well Adaptable' :
                                scenarioScore >= 50 ? 'Moderately Adaptable' :
                                scenarioScore >= 40 ? 'Limited Adaptability' : 'Poor Adaptability';

    // Market resilience strength
    const marketResilience = (trendScore >= 60 && correlationScore >= 50) ? 'Very Resilient' :
                            (trendScore >= 45 || correlationScore >= 40) ? 'Resilient' :
                            (trendScore >= 30 || correlationScore >= 25) ? 'Moderately Resilient' : 'Low Resilience';

    // Strategic flexibility rating
    const activeScores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
    const hasBalance = activeScores.length >= 3 && activeScores.every(s => {
      const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
      return Math.abs(s - mean) <= 30;
    });
    const strategicFlexibility = hasBalance ? 'High Flexibility' :
                               activeScores.length >= 3 ? 'Moderate Flexibility' :
                               activeScores.length >= 2 ? 'Limited Flexibility' : 'Low Flexibility';

    // Planning readiness index
    const dataFields = [nikeShare, strategicScore, competitiveScore, demographicScore, 
                       trendScore, correlationScore, totalPop, medianIncome].filter(v => v > 0).length;
    const planningReadiness = dataFields >= 7 ? 'Excellent Readiness' :
                            dataFields >= 5 ? 'Good Readiness' :
                            dataFields >= 3 ? 'Moderate Readiness' : 'Limited Readiness';

    // Primary scenario type identification
    let primaryScenarioType = 'Balanced Scenario Market';
    if (strategicScore >= 70 && demographicScore >= 70) primaryScenarioType = 'High-Potential Scenario Market';
    else if (trendScore >= 70 && correlationScore >= 60) primaryScenarioType = 'Trend-Resilient Scenario Market';
    else if (totalPop >= 50000 && medianIncome >= 70000) primaryScenarioType = 'Market-Stable Scenario Market';
    else if (nikeShare >= 15 && strategicScore >= 60) primaryScenarioType = 'Brand-Strategic Scenario Market';
    else if (demographicScore >= 80) primaryScenarioType = 'Demographic-Strong Scenario Market';
    else if (scenarioScore >= 65) primaryScenarioType = 'High-Adaptability Scenario Market';

    // Adaptability strength factors
    const adaptabilityFactors = [];
    if (strategicScore >= 60) adaptabilityFactors.push('Strategic');
    if (demographicScore >= 60) adaptabilityFactors.push('Demographic');  
    if (totalPop >= 50000) adaptabilityFactors.push('Market Size');
    if (medianIncome >= 60000 && medianIncome <= 120000) adaptabilityFactors.push('Income Range');
    const adaptabilityStrength = adaptabilityFactors.length >= 3 ? 'Multi-Dimensional' :
                                adaptabilityFactors.length >= 2 ? 'Dual-Factor' :
                                adaptabilityFactors.length >= 1 ? 'Single-Factor' : 'Limited';

    // Resilience factors identification
    const resilienceFactors = [];
    if (trendScore >= 60) resilienceFactors.push('Trend Stability');
    if (correlationScore >= 50) resilienceFactors.push('Predictable Patterns');
    if (competitiveScore >= 4 && competitiveScore <= 8) resilienceFactors.push('Balanced Competition');
    if (nikeShare >= 10 && nikeShare <= 30) resilienceFactors.push('Stable Market Share');
    const resilienceFactorsStr = resilienceFactors.length > 0 ? resilienceFactors.join(', ') : 'Limited Resilience Factors';

    // Flexibility dimensions
    const flexibilityFactors = [];
    if (hasBalance) flexibilityFactors.push('Multi-Score Balance');
    if (medianIncome >= 50000 && totalPop >= 20000) flexibilityFactors.push('Market Segment Flexibility');
    if (strategicScore >= 50 && competitiveScore >= 3) flexibilityFactors.push('Strategic Positioning');
    if (nikeShare >= 12 && nikeShare <= 25) flexibilityFactors.push('Brand Strategy Options');
    const flexibilityDimensions = flexibilityFactors.length > 0 ? flexibilityFactors.join(', ') : 'Limited Flexibility';

    // Scenario planning maturity
    const scenarioPlanningMaturity = (scenarioScore >= 65 && dataFields >= 6) ? 'Advanced Planning Capability' :
                                   (scenarioScore >= 55 && dataFields >= 5) ? 'Intermediate Planning Capability' :
                                   (scenarioScore >= 45 && dataFields >= 4) ? 'Basic Planning Capability' : 'Limited Planning Capability';

    // Strategic pivot potential
    const strategicPivotPotential = (strategicScore >= 60 && hasBalance) ? 'High Pivot Potential' :
                                  (strategicScore >= 45 || hasBalance) ? 'Moderate Pivot Potential' :
                                  (strategicScore >= 30) ? 'Limited Pivot Potential' : 'Low Pivot Potential';

    // Market stability index
    const stabilityFactors = [trendScore >= 50, correlationScore >= 40, 
                            (nikeShare >= 10 && nikeShare <= 30), 
                            (competitiveScore >= 3 && competitiveScore <= 8)].filter(Boolean).length;
    const marketStabilityIndex = stabilityFactors >= 3 ? 'High Stability' :
                               stabilityFactors >= 2 ? 'Moderate Stability' :
                               stabilityFactors >= 1 ? 'Low Stability' : 'Unstable';

    // Data reliability for planning
    const reliabilityScore = Math.round((dataFields / 8) * 100);
    const dataReliability = reliabilityScore >= 80 ? 'Very Reliable' :
                          reliabilityScore >= 65 ? 'Reliable' :
                          reliabilityScore >= 50 ? 'Moderately Reliable' : 'Limited Reliability';

    // Demographic adaptability
    const demographicAdaptability = demographicScore >= 80 ? 'Highly Adaptable Demographics' :
                                  demographicScore >= 65 ? 'Well Adaptable Demographics' :
                                  demographicScore >= 50 ? 'Moderately Adaptable Demographics' : 'Limited Demographic Adaptability';

    // Market size flexibility
    const marketSizeFlexibility = totalPop >= 100000 ? 'Large Market Flexibility' :
                                totalPop >= 50000 ? 'Medium-Large Flexibility' :
                                totalPop >= 25000 ? 'Medium Flexibility' :
                                totalPop >= 10000 ? 'Small-Medium Flexibility' : 'Limited Size Flexibility';

    // Income scenario range
    const incomeScenarioRange = medianIncome >= 100000 ? 'High-Income Scenarios' :
                              medianIncome >= 80000 ? 'Upper-Middle Income Scenarios' :
                              medianIncome >= 60000 ? 'Middle Income Scenarios' :
                              medianIncome >= 40000 ? 'Lower-Middle Income Scenarios' : 'Lower Income Scenarios';

    // Brand positioning flexibility
    const brandPositioningFlexibility = (nikeShare >= 12 && nikeShare <= 25) ? 'High Brand Flexibility' :
                                       (nikeShare >= 8 && nikeShare <= 35) ? 'Moderate Brand Flexibility' :
                                       (nikeShare >= 5) ? 'Limited Brand Flexibility' : 'Minimal Brand Flexibility';

    // Trend resilience factor
    const trendResilienceFactor = trendScore >= 70 ? 'Very Resilient Trends' :
                                trendScore >= 55 ? 'Resilient Trends' :
                                trendScore >= 40 ? 'Moderately Resilient Trends' : 'Volatile Trends';

    // Competitive stability
    const competitiveStability = (competitiveScore >= 4 && competitiveScore <= 8) ? 'Stable Competition' :
                               (competitiveScore >= 2 && competitiveScore <= 10) ? 'Moderate Competition' : 'Unstable Competition';

    // Correlation predictability
    const correlationPredictability = correlationScore >= 70 ? 'Highly Predictable' :
                                    correlationScore >= 50 ? 'Predictable' :
                                    correlationScore >= 30 ? 'Moderately Predictable' : 'Unpredictable';

    // Market share stability
    const marketShareStability = (nikeShare >= 10 && nikeShare <= 30) ? 'Stable Market Share' :
                               (nikeShare >= 5 && nikeShare <= 40) ? 'Moderately Stable' : 'Volatile Market Share';

    // Recommended scenario approach
    let recommendedApproach = 'Standard Scenario Planning';
    if (primaryScenarioType.includes('High-Potential')) recommendedApproach = 'Advanced Multi-Scenario Modeling';
    else if (primaryScenarioType.includes('Trend-Resilient')) recommendedApproach = 'Trend-Based Scenario Planning';
    else if (primaryScenarioType.includes('Market-Stable')) recommendedApproach = 'Stability-Focused Scenarios';
    else if (primaryScenarioType.includes('Brand-Strategic')) recommendedApproach = 'Brand-Centric Scenario Development';
    else if (scenarioScore >= 65) recommendedApproach = 'Comprehensive Scenario Analysis';

    // Scenario priority level
    const scenarioPriority = scenarioScore >= 65 ? 'High Priority' :
                           scenarioScore >= 55 ? 'Medium-High Priority' :
                           scenarioScore >= 45 ? 'Medium Priority' :
                           scenarioScore >= 35 ? 'Low-Medium Priority' : 'Low Priority';

    // Planning complexity
    const planningComplexity = (dataFields >= 7 && activeScores.length >= 4) ? 'High Complexity' :
                             (dataFields >= 5 && activeScores.length >= 3) ? 'Moderate Complexity' :
                             (dataFields >= 3) ? 'Standard Complexity' : 'Simple Planning';

    // Scenario risk assessment
    const riskFactors = [
      trendScore < 40 ? 'Trend Volatility' : null,
      correlationScore < 30 ? 'Unpredictable Patterns' : null,
      competitiveScore > 9 || competitiveScore < 2 ? 'Competitive Instability' : null,
      dataFields < 4 ? 'Insufficient Data' : null
    ].filter(Boolean);
    const scenarioRiskAssessment = riskFactors.length === 0 ? 'Low Risk' :
                                 riskFactors.length <= 1 ? 'Moderate Risk' :
                                 riskFactors.length <= 2 ? 'High Risk' : 'Very High Risk';

    return {
      scenarioAdaptability,
      marketResilience,
      strategicFlexibility,
      planningReadiness,
      primaryScenarioType,
      adaptabilityStrength,
      resilienceFactors: resilienceFactorsStr,
      flexibilityDimensions,
      scenarioPlanningMaturity,
      strategicPivotPotential,
      marketStabilityIndex,
      dataReliability,
      demographicAdaptability,
      marketSizeFlexibility,
      incomeScenarioRange,
      brandPositioningFlexibility,
      trendResilienceFactor,
      competitiveStability,
      correlationPredictability,
      marketShareStability,
      recommendedApproach,
      scenarioPriority,
      planningComplexity,
      scenarioRiskAssessment
    };
  }

  /**
   * Calculate a composite scenario score when no direct scenario score is available
   * Uses strategic factors, demographic stability, and market characteristics
   */
  private calculateCompositeScenarioScore(record: any): number {
    let compositeScore = 0;
    let factorCount = 0;

    // Factor 1: Strategic stability (markets with higher strategic value are better for scenario planning)
    const strategicScore = Number((record as any).strategic_value_score);
    if (strategicScore && strategicScore > 10) { // Only use if it's likely a real strategic score
      const strategicContribution = Math.min(30, strategicScore * 0.3);
      compositeScore += strategicContribution;
      factorCount++;
    }

    // Factor 2: Population Size (larger markets = more scenario planning opportunity)
    const population = Number((record as any).value_TOTPOP_CY) || Number((record as any).TOTPOP_CY) || 0;
    if (population > 0) {
      // Normalize population to 0-25 scale
      const populationScore = Math.min(25, (population / 500000) * 25);
      compositeScore += populationScore;
      factorCount++;
    }

    // Factor 3: Income Stability (higher income = more stable for scenarios)
    const income = Number((record as any).value_AVGHINC_CY) || Number((record as any).AVGHINC_CY) || 0;
    if (income > 0) {
      // Normalize income to 0-25 scale
      const incomeScore = Math.min(25, (income / 100000) * 25);
      compositeScore += incomeScore;
      factorCount++;
    }

    // Factor 4: Demographic Opportunity (areas with better demographics = better scenario potential)
    const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
    if (demographicScore > 10) { // Only use if it's likely a real demographic score
      const demographicContribution = Math.min(20, demographicScore * 0.2);
      compositeScore += demographicContribution;
      factorCount++;
    }

    // Average the factors if any were found, otherwise use moderate baseline
    const finalScore = factorCount > 0 ? compositeScore / factorCount * (100/25) : 40;
    
    console.log(`[ScenarioAnalysisProcessor] Calculated composite scenario score: ${finalScore.toFixed(2)} from ${factorCount} factors`);
    
    return Math.max(15, Math.min(100, finalScore)); // Ensure score is between 15-100
  }

  private categorizeScenarioReadiness(score: number): string {
    if (score >= 80) return 'Excellent Scenario Readiness';
    if (score >= 65) return 'Good Scenario Potential';
    if (score >= 50) return 'Moderate Scenario Capability';
    if (score >= 35) return 'Limited Scenario Value';
    return 'Poor Scenario Suitability';
  }

  private extractCoordinates(record: any): [number, number] {
    if ((record as any).coordinates && Array.isArray((record as any).coordinates)) {
      return [(record as any).coordinates[0] || 0, (record as any).coordinates[1] || 0];
    }
    
    // Try to extract from latitude/longitude fields
    const lat = Number((record as any).latitude || (record as any).lat || (record as any).LATITUDE) || 0;
    const lng = Number((record as any).longitude || (record as any).lng || (record as any).lon || (record as any).LONGITUDE) || 0;
    
    return [lng, lat]; // GeoJSON format [longitude, latitude]
  }

  private generateScenarioSummary(records: any[], statistics: any): string {
    const topScenarioReady = records.slice(0, 5);
    const excellentCount = records.filter(r => r.value >= 80).length;
    const goodCount = records.filter(r => r.value >= 65 && r.value < 80).length;
    const avgScore = statistics.mean.toFixed(1);

    const topMarkets = topScenarioReady
      .map(r => `${r.area_name} (${r.value.toFixed(1)})`)
      .join(', ');

    // Identify dominant scenario types from top markets
    const scenarioTypes = topScenarioReady.map(r => (r.properties as any).primary_scenario_type);
    const dominantScenarioType = this.findMostCommon(scenarioTypes) || 'Mixed scenario capabilities';

    return `Scenario analysis of ${records.length} markets identified ${excellentCount} areas with excellent scenario readiness (80+) and ${goodCount} with good scenario potential (65-79). Average scenario analysis score: ${avgScore}. Top scenario-ready markets: ${topMarkets}. Analysis reveals ${dominantScenarioType.toLowerCase()} as the primary high-value scenario type, considering scenario adaptability, market resilience, strategic flexibility, and planning readiness for comprehensive scenario planning.`;
  }

  private findMostCommon(arr: string[]): string {
    const frequency: Record<string, number> = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    return Object.keys(frequency as any).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
  }

  private calculateStatistics(values: number[]) {
    if (values.length === 0) {
      return { total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const total = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    const median = total % 2 === 0 
      ? (sorted[total / 2 - 1] + sorted[total / 2]) / 2
      : sorted[Math.floor(total / 2)];

    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev
    };
  }

  // ============================================================================
  // RENDERING METHODS
  // ============================================================================

  private createScenarioRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use standard red-to-green color scheme: Red (low) -> Orange -> Light Green -> Dark Green (high)
    const scenarioColors = [
      [215, 48, 39, 0.6],   // #d73027 - Red (low scenario readiness)
      [253, 174, 97, 0.6],  // #fdae61 - Orange  
      [166, 217, 106, 0.6], // #a6d96a - Light Green
      [26, 152, 80, 0.6]    // #1a9850 - Dark Green (high scenario readiness)
    ];
    
    return {
      type: 'class-breaks',
      field: 'scenario_analysis_score',
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: scenarioColors[i],
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

  private createScenarioLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    const colors = [
      'rgba(215, 48, 39, 0.6)',   // Low scenario readiness
      'rgba(253, 174, 97, 0.6)',  // Medium-low  
      'rgba(166, 217, 106, 0.6)', // Medium-high
      'rgba(26, 152, 80, 0.6)'    // High scenario readiness
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
      title: 'Scenario Readiness Score',
      items: legendItems,
      position: 'bottom-right'
    };
  }

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

  private formatClassLabel(classIndex: number, breaks: Array<{min: number, max: number}>): string {
    if (classIndex === 0) {
      return `< ${breaks[classIndex].max.toFixed(1)}`;
    } else if (classIndex === breaks.length - 1) {
      return `> ${breaks[classIndex].min.toFixed(1)}`;
    } else {
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