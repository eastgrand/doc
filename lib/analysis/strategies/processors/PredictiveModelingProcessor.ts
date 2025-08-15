import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

/**
 * PredictiveModelingProcessor - Specialized processor for predictive modeling analysis
 * 
 * Focuses on identifying markets with high predictability and reliable forecasting potential
 * by analyzing model confidence, pattern stability, forecast reliability, and data quality.
 */
export class PredictiveModelingProcessor implements DataProcessorStrategy {
  
  /**
   * Extract predictive modeling score from record with fallback calculation
   */
  private extractPredictiveScore(record: any): number {
    // PRIORITY 1: Use predictive_modeling_score if available
    if (record.predictive_modeling_score !== undefined && record.predictive_modeling_score !== null) {
      return Number(record.predictive_modeling_score);
    }
    
    // PRIORITY 2: Use predictive_score
    if (record.predictive_score !== undefined && record.predictive_score !== null) {
      return Number(record.predictive_score);
    }
    
    // PRIORITY 3: Use thematic_value (common in endpoint data)
    if (record.thematic_value !== undefined && record.thematic_value !== null) {
      return Number(record.thematic_value);
    }
    
    // PRIORITY 4: Use generic value field
    if (record.value !== undefined && record.value !== null) {
      return Number(record.value);
    }
    
    // FALLBACK: Find first suitable numeric field
    const numericFields = Object.keys(record).filter(key => {
      const value = record[key];
      return typeof value === 'number' && 
             !key.toLowerCase().includes('id') &&
             !key.toLowerCase().includes('date') &&
             !key.toLowerCase().includes('time') &&
             !key.toLowerCase().includes('objectid') &&
             !key.toLowerCase().includes('area') &&
             value > 0;
    });
    
    if (numericFields.length > 0) {
      const fieldValue = Number(record[numericFields[0]]);
      return fieldValue > 100 ? fieldValue / 100 : fieldValue; // Normalize if needed
    }
    
    return 50; // Default neutral score
  }
  validate(rawData: RawAnalysisResult): boolean {
    console.log(`🔍 [PredictiveModelingProcessor] Validating data:`, {
      hasRawData: !!rawData,
      isObject: typeof rawData === 'object',
      hasSuccess: rawData?.success,
      hasResults: Array.isArray(rawData?.results),
      resultsLength: rawData?.results?.length,
      firstRecordKeys: rawData?.results?.[0] ? Object.keys(rawData.results[0]).slice(0, 15) : []
    });

    if (!rawData || typeof rawData !== 'object') {
      console.log(`❌ [PredictiveModelingProcessor] Validation failed: Invalid rawData structure`);
      return false;
    }
    if (!rawData.success) {
      console.log(`❌ [PredictiveModelingProcessor] Validation failed: success=false`);
      return false;
    }
    if (!Array.isArray(rawData.results)) {
      console.log(`❌ [PredictiveModelingProcessor] Validation failed: results not array`);
      return false;
    }
    
    // Empty results are valid
    if (rawData.results.length === 0) {
      console.log(`✅ [PredictiveModelingProcessor] Validation passed: Empty results`);
      return true;
    }

    // Check first few records for required fields - flexible approach
    const sampleSize = Math.min(5, rawData.results.length);
    const sampleRecords = rawData.results.slice(0, sampleSize);
    
    for (let i = 0; i < sampleRecords.length; i++) {
      const record = sampleRecords[i];
      
      // Check for ID field (flexible naming)
      const hasIdField = record && (
        record.area_id !== undefined || 
        record.id !== undefined || 
        record.ID !== undefined ||
        record.GEOID !== undefined ||
        record.zipcode !== undefined ||
        record.area_name !== undefined
      );
      
      // Check for predictive modeling fields or any numeric field
      const hasScoringField = record && (
        record.predictive_modeling_score !== undefined || 
        record.predictive_score !== undefined ||
        record.value !== undefined || 
        record.score !== undefined ||
        record.thematic_value !== undefined ||
        // Accept any numeric field that looks like data
        Object.keys(record).some(key => 
          typeof record[key] === 'number' && 
          !key.toLowerCase().includes('date') &&
          !key.toLowerCase().includes('time') &&
          !key.toLowerCase().includes('area') &&
          !key.toLowerCase().includes('length') &&
          !key.toLowerCase().includes('objectid')
        )
      );
      
      console.log(`🔍 [PredictiveModelingProcessor] Record ${i} validation:`, {
        hasIdField,
        hasScoringField,
        recordKeys: Object.keys(record).slice(0, 10)
      });
      
      if (hasIdField && hasScoringField) {
        console.log(`✅ [PredictiveModelingProcessor] Validation passed: Found valid record structure`);
        return true;
      }
    }
    
    console.log(`❌ [PredictiveModelingProcessor] Validation failed: No records with both ID and scoring fields found`);
    return false;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Predictive modeling analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      // Extract the pre-calculated predictive modeling score with flexible fallback
      const predictiveScore = this.extractPredictiveScore(record);
      
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