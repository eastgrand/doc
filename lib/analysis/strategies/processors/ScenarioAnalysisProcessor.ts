import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

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
      const scenarioScore = Number(record.scenario_analysis_score) || 0;
      
      // Extract related metrics for additional analysis (updated for actual dataset fields)
      const nikeShare = Number(record.value_MP30034A_B_P || record.mp30034a_b_p) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const competitiveScore = Number(record.competitive_advantage_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;
      const trendScore = Number(record.trend_strength_score) || 0;
      const correlationScore = Number(record.correlation_strength_score) || 0;
      const totalPop = Number(record.value_TOTPOP_CY || record.TOTPOP_CY || record.total_population) || 0;
      const medianIncome = Number(record.value_MEDDI_CY || record.value_AVGHINC_CY || record.median_income) || 0;

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
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || `Area ${index + 1}`,
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
        shapValues: record.shap_values || {}
      };
    });

    // Sort by scenario analysis score (highest first)
    records.sort((a, b) => b.value - a.value);
    
    // Update ranks after sorting
    records.forEach((record, index) => {
      record.rank = index + 1;
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
      targetVariable: 'scenario_analysis_score'
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

  private categorizeScenarioReadiness(score: number): string {
    if (score >= 80) return 'Excellent Scenario Readiness';
    if (score >= 65) return 'Good Scenario Potential';
    if (score >= 50) return 'Moderate Scenario Capability';
    if (score >= 35) return 'Limited Scenario Value';
    return 'Poor Scenario Suitability';
  }

  private extractCoordinates(record: any): [number, number] {
    if (record.coordinates && Array.isArray(record.coordinates)) {
      return [record.coordinates[0] || 0, record.coordinates[1] || 0];
    }
    
    // Try to extract from latitude/longitude fields
    const lat = Number(record.latitude || record.lat || record.LATITUDE) || 0;
    const lng = Number(record.longitude || record.lng || record.lon || record.LONGITUDE) || 0;
    
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
    const scenarioTypes = topScenarioReady.map(r => r.properties.primary_scenario_type);
    const dominantScenarioType = this.findMostCommon(scenarioTypes) || 'Mixed scenario capabilities';

    return `Scenario analysis of ${records.length} markets identified ${excellentCount} areas with excellent scenario readiness (80+) and ${goodCount} with good scenario potential (65-79). Average scenario analysis score: ${avgScore}. Top scenario-ready markets: ${topMarkets}. Analysis reveals ${dominantScenarioType.toLowerCase()} as the primary high-value scenario type, considering scenario adaptability, market resilience, strategic flexibility, and planning readiness for comprehensive scenario planning.`;
  }

  private findMostCommon(arr: string[]): string {
    const frequency: Record<string, number> = {};
    arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
    return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
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
}