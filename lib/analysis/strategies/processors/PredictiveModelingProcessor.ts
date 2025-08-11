import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

/**
 * PredictiveModelingProcessor - Specialized processor for predictive modeling analysis
 * 
 * Focuses on identifying markets with high predictability and reliable forecasting potential
 * by analyzing model confidence, pattern stability, forecast reliability, and data quality.
 */
export class PredictiveModelingProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && 
           rawData.success && 
           Array.isArray(rawData.results) && 
           rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Predictive modeling analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      // Extract the pre-calculated predictive modeling score
      const predictiveScore = Number(record.predictive_modeling_score || record.predictive_score) || 0;
      
      // Extract related metrics for additional analysis (updated for actual dataset fields)
      const nikeShare = Number(record.value_MP30034A_B_P || record.mp30034a_b_p) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const correlationScore = Number(record.correlation_strength_score) || 0;
      const trendScore = Number(record.trend_strength_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;
      const totalPop = Number(record.value_TOTPOP_CY || record.TOTPOP_CY || record.total_population) || 0;
      const medianIncome = Number(record.value_MEDDI_CY || record.value_AVGHINC_CY || record.median_income) || 0;

      // Calculate additional predictive indicators
      const indicators = this.calculatePredictiveIndicators({
        predictiveScore,
        nikeShare,
        strategicScore,
        correlationScore,
        trendScore,
        demographicScore,
        totalPop,
        medianIncome
      });

      return {
        area_id: record.area_id || record.ID || `area_${index}`,
        area_name: record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || `Area ${index + 1}`,
        value: predictiveScore,
        rank: index + 1, // Will be sorted later
        category: this.categorizePredictiveLevel(predictiveScore),
        coordinates: this.extractCoordinates(record),
        properties: {
          // Core predictive metrics
          predictive_modeling_score: predictiveScore,
          model_confidence_level: indicators.modelConfidenceLevel,
          forecast_reliability: indicators.forecastReliability,
          pattern_stability: indicators.patternStability,
          data_quality_index: indicators.dataQualityIndex,
          
          // Supporting predictive factors
          prediction_confidence: indicators.predictionConfidence,
          prediction_accuracy_potential: indicators.accuracyPotential,
          model_reliability_score: indicators.reliabilityScore,
          forecast_horizon_strength: indicators.forecastHorizonStrength,
          
          // Predictive model components
          correlation_strength: correlationScore,
          trend_consistency: trendScore,
          strategic_predictability: strategicScore,
          demographic_stability: demographicScore,
          
          // Market characteristics affecting predictability
          nike_market_share: nikeShare,
          market_size: totalPop,
          income_stability: medianIncome,
          
          // Data completeness metrics
          data_completeness_score: indicators.dataCompletenessScore,
          variable_availability: indicators.variableAvailability,
          
          // Predictive insights
          prediction_type: indicators.predictionType,
          forecast_confidence: indicators.forecastConfidence,
          model_suitability: indicators.modelSuitability
        },
        shapValues: record.shap_values || {}
      };
    });

    // Sort by predictive modeling score (highest first)
    records.sort((a, b) => b.value - a.value);
    
    // Update ranks after sorting
    records.forEach((record, index) => {
      record.rank = index + 1;
    });

    // Calculate statistics
    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);

    // Generate predictive modeling summary
    const summary = this.generatePredictiveSummary(records, statistics);

    return {
      type: 'predictive_modeling',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'predictive_modeling_score'
    };
  }

  private calculatePredictiveIndicators(metrics: {
    predictiveScore: number;
    nikeShare: number;
    strategicScore: number;
    correlationScore: number;
    trendScore: number;
    demographicScore: number;
    totalPop: number;
    medianIncome: number;
  }) {
    const {
      predictiveScore,
      nikeShare,
      strategicScore,
      correlationScore,
      trendScore,
      demographicScore,
      totalPop,
      medianIncome
    } = metrics;

    // Model confidence level based on correlation and data availability
    const modelConfidenceLevel = correlationScore > 0 ? 
      (correlationScore >= 70 ? 'High' : correlationScore >= 50 ? 'Moderate' : 'Low') :
      (strategicScore > 60 && demographicScore > 60 ? 'Moderate' : 'Low');

    // Forecast reliability based on trend consistency and strategic alignment
    const forecastReliability = trendScore > 0 ?
      (trendScore >= 75 ? 'Excellent' : trendScore >= 60 ? 'Good' : trendScore >= 45 ? 'Fair' : 'Limited') :
      (strategicScore >= 70 ? 'Good' : 'Limited');

    // Pattern stability assessment
    const scores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
    let patternStability = 'Unknown';
    if (scores.length >= 3) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
      const coefficientOfVariation = mean > 0 ? Math.sqrt(variance) / mean : 1;
      
      if (coefficientOfVariation < 0.2) patternStability = 'Very Stable';
      else if (coefficientOfVariation < 0.4) patternStability = 'Stable';
      else if (coefficientOfVariation < 0.6) patternStability = 'Moderate';
      else patternStability = 'Volatile';
    }

    // Data quality index
    const totalFields = 8;
    const availableFields = [nikeShare, strategicScore, correlationScore, trendScore, 
                           demographicScore, totalPop, medianIncome, predictiveScore].filter(v => v > 0).length;
    const dataQualityIndex = Math.round((availableFields / totalFields) * 100);

    // Prediction confidence level
    const predictionConfidence = predictiveScore >= 75 ? 'Very High' :
                               predictiveScore >= 65 ? 'High' :
                               predictiveScore >= 50 ? 'Moderate' :
                               predictiveScore >= 35 ? 'Low' : 'Very Low';

    // Accuracy potential assessment
    const accuracyPotential = (correlationScore > 60 && trendScore > 60) ? 'Excellent' :
                            (correlationScore > 45 || trendScore > 45) ? 'Good' :
                            (strategicScore > 60 && demographicScore > 60) ? 'Moderate' : 'Limited';

    // Model reliability score (0-100)
    const reliabilityScore = Math.round(
      (predictiveScore * 0.4) + 
      (correlationScore * 0.3) + 
      (trendScore * 0.2) + 
      (dataQualityIndex * 0.1)
    );

    // Forecast horizon strength
    const forecastHorizonStrength = predictiveScore >= 70 ? 'Long-term' :
                                  predictiveScore >= 55 ? 'Medium-term' :
                                  predictiveScore >= 40 ? 'Short-term' : 'Limited';

    // Data completeness score
    const dataCompletenessScore = dataQualityIndex;
    
    // Variable availability count
    const variableAvailability = `${availableFields}/${totalFields}`;

    // Prediction type based on strengths
    let predictionType = 'General';
    if (correlationScore >= 70) predictionType = 'Correlation-based';
    else if (trendScore >= 70) predictionType = 'Trend-based';
    else if (strategicScore >= 70 && demographicScore >= 70) predictionType = 'Multi-factor';
    else if (nikeShare >= 20) predictionType = 'Market-based';

    // Forecast confidence percentage
    const forecastConfidence = Math.min(100, Math.round(predictiveScore + (correlationScore * 0.2)));

    // Model suitability assessment
    const modelSuitability = predictiveScore >= 65 ? 'Highly Suitable' :
                           predictiveScore >= 50 ? 'Suitable' :
                           predictiveScore >= 35 ? 'Moderately Suitable' : 'Limited Suitability';

    return {
      modelConfidenceLevel,
      forecastReliability,
      patternStability,
      dataQualityIndex,
      predictionConfidence,
      accuracyPotential,
      reliabilityScore,
      forecastHorizonStrength,
      dataCompletenessScore,
      variableAvailability,
      predictionType,
      forecastConfidence,
      modelSuitability
    };
  }

  private categorizePredictiveLevel(score: number): string {
    if (score >= 80) return 'Excellent Predictability';
    if (score >= 65) return 'Good Predictive Potential';
    if (score >= 50) return 'Moderate Predictability';
    if (score >= 35) return 'Limited Predictive Value';
    return 'Poor Predictive Reliability';
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

  private generatePredictiveSummary(records: any[], statistics: any): string {
    const topPredictive = records.slice(0, 5);
    const excellentCount = records.filter(r => r.value >= 80).length;
    const goodCount = records.filter(r => r.value >= 65 && r.value < 80).length;
    const avgScore = statistics.mean.toFixed(1);

    const topMarkets = topPredictive
      .map(r => `${r.area_name} (${r.value.toFixed(1)})`)
      .join(', ');

    return `Predictive modeling analysis of ${records.length} markets identified ${excellentCount} areas with excellent predictability (80+) and ${goodCount} with good predictive potential (65-79). Average predictive modeling score: ${avgScore}. Top predictable markets: ${topMarkets}. Analysis considers model confidence, pattern stability, forecast reliability, and data quality to identify markets most suitable for accurate predictions and strategic planning.`;
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