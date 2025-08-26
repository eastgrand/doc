import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';
import { DynamicFieldDetector } from './DynamicFieldDetector';

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
    // PRIORITY 1: Use prediction_score (correct endpoint field)
    if ((record as any).prediction_score !== undefined && (record as any).prediction_score !== null) {
      return Number((record as any).prediction_score);
    }
    
    // PRIORITY 2: Use predictive_modeling_score (legacy)
    if ((record as any).predictive_modeling_score !== undefined && (record as any).predictive_modeling_score !== null) {
      return Number((record as any).predictive_modeling_score);
    }
    
    // PRIORITY 3: Use predictive_score (legacy)
    if ((record as any).predictive_score !== undefined && (record as any).predictive_score !== null) {
      return Number((record as any).predictive_score);
    }
    
    // PRIORITY 3: Use thematic_value (common in endpoint data)
    if ((record as any).thematic_value !== undefined && (record as any).thematic_value !== null) {
      return Number((record as any).thematic_value);
    }
    
    // PRIORITY 4: Use generic value field
    if ((record as any).value !== undefined && (record as any).value !== null) {
      return Number((record as any).value);
    }
    
    // FALLBACK: Find first suitable numeric field
    const numericFields = Object.keys(record as any).filter(key => {
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
        (record as any).area_id !== undefined || 
        (record as any).id !== undefined || 
        (record as any).ID !== undefined ||
        (record as any).GEOID !== undefined ||
        (record as any).zipcode !== undefined ||
        (record as any).area_name !== undefined
      );
      
      // Check for predictive modeling fields or any numeric field
      const hasScoringField = record && (
        (record as any).prediction_score !== undefined || 
        (record as any).predictive_modeling_score !== undefined || 
        (record as any).predictive_score !== undefined ||
        (record as any).value !== undefined || 
        (record as any).score !== undefined ||
        (record as any).thematic_value !== undefined ||
        // Accept any numeric field that looks like data
        Object.keys(record as any).some(key => 
          typeof (record as any)[key] === 'number' && 
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
        recordKeys: Object.keys(record as any).slice(0, 10)
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
      const nikeShare = Number((record as any).value_MP30034A_B_P || (record as any).mp30034a_b_p) || 0;
      const strategicScore = Number((record as any).strategic_value_score) || 0;
      const correlationScore = Number((record as any).correlation_strength_score) || 0;
      const trendScore = Number((record as any).trend_strength_score) || 0;
      const demographicScore = Number((record as any).demographic_opportunity_score) || 0;
      const totalPop = Number((record as any).value_TOTPOP_CY || (record as any).TOTPOP_CY || (record as any).total_population) || 0;
      const medianIncome = Number((record as any).value_MEDDI_CY || (record as any).value_AVGHINC_CY || (record as any).median_income) || 0;

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
        area_id: (record as any).area_id || (record as any).ID || `area_${index}`,
        area_name: (record as any).value_DESCRIPTION || (record as any).DESCRIPTION || (record as any).area_name || `Area ${index + 1}`,
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
        shapValues: (record as any).shap_values || {}
      };
    });

    // Sort by predictive modeling score (highest first)
    records.sort((a, b) => b.value - a.value);
    
    // Update ranks after sorting
    records.forEach((record, index) => {
      (record as any).rank = index + 1;
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
    if ((record as any).coordinates && Array.isArray((record as any).coordinates)) {
      return [(record as any).coordinates[0] || 0, (record as any).coordinates[1] || 0];
    }
    
    // Try to extract from latitude/longitude fields
    const lat = Number((record as any).latitude || (record as any).lat || (record as any).LATITUDE) || 0;
    const lng = Number((record as any).longitude || (record as any).lng || (record as any).lon || (record as any).LONGITUDE) || 0;
    
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