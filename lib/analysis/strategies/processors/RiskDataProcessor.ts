import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';

/**
 * RiskDataProcessor - Handles data processing for risk analysis
 * 
 * Processes risk analysis results with risk assessment, volatility measures,
 * uncertainty indicators, and risk mitigation insights across geographic areas.
 */
export class RiskDataProcessor implements DataProcessorStrategy {
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    if (!rawData.success) return false;
    if (!Array.isArray(rawData.results)) return false;
    
    // Validate risk-specific fields
    const hasRiskFields = rawData.results.length === 0 || 
      rawData.results.some(record => 
        record && 
        // Check for risk-related fields
        (record.risk_score !== undefined ||       // Risk score
         record.volatility !== undefined ||       // Volatility measure
         record.uncertainty !== undefined ||      // Uncertainty level
         record.stability !== undefined ||        // Stability indicator
         record.downside_risk !== undefined ||    // Downside risk
         record.value_at_risk !== undefined ||    // Value at Risk (VaR)
         record.confidence_interval !== undefined || // Confidence intervals
         record.risk_category !== undefined ||    // Risk category
         record.mitigation_score !== undefined)   // Risk mitigation score
      );
    
    return hasRiskFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for RiskDataProcessor');
    }

    // Process records with risk information
    const records = this.processRiskRecords(rawData.results);
    
    // Calculate risk statistics
    const statistics = this.calculateRiskStatistics(records);
    
    // Analyze risk patterns
    const riskAnalysis = this.analyzeRiskPatterns(records);
    
    // Process feature importance for risk factors
    const featureImportance = this.processRiskFeatureImportance(rawData.feature_importance || []);
    
    // Generate risk summary
    const summary = this.generateRiskSummary(records, riskAnalysis, rawData.summary);

    return {
      type: 'risk_analysis',
      records,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'risk_adjusted_score',
      riskAssessment: riskAnalysis // Additional metadata for risk visualization
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processRiskRecords(rawRecords: any[]): GeographicDataPoint[] {
    return rawRecords.map((record, index) => {
      const area_id = record.area_id || record.id || record.GEOID || record.ID || `area_${index}`;
      const area_name = record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || record.name || record.NAME || `Area ${index + 1}`;
      
      // Extract risk-adjusted score (higher is better - lower risk, higher opportunity)
      const riskScore = this.extractRiskScore(record);
      
      // Use risk-adjusted score as the primary value
      const value = riskScore;
      
      // Extract risk-specific properties
      const properties = {
        ...this.extractProperties(record),
        risk_score: riskScore,
        volatility: record.volatility || 0,
        uncertainty: record.uncertainty || 0,
        stability: record.stability || 0,
        downside_risk: record.downside_risk || 0,
        value_at_risk: record.value_at_risk || 0,
        risk_category: this.determineRiskCategory(record),
        mitigation_potential: this.calculateMitigationPotential(record),
        risk_confidence: this.calculateRiskConfidence(record)
      };
      
      // Extract SHAP values
      const shapValues = this.extractShapValues(record);
      
      // Category based on risk characteristics
      const category = this.getRiskCategory(riskScore, properties);

      return {
        area_id,
        area_name,
        value,
        rank: 0, // Will be calculated in ranking
        category,
        coordinates: record.coordinates || [0, 0],
        properties,
        shapValues
      };
    }).sort((a, b) => b.value - a.value) // Sort by risk-adjusted score (higher = better)
      .map((record, index) => ({ ...record, rank: index + 1 })); // Assign ranks
  }

  private extractRiskScore(record: any): number {
    // Calculate risk-adjusted score (higher is better)
    const baseValue = record.base_value || record.opportunity_score || 50;
    const volatility = record.volatility || 0.3;
    const uncertainty = record.uncertainty || 0.3;
    const stability = record.stability || 0.7;
    
    // Risk-adjusted score penalizes high volatility and uncertainty
    let riskAdjustedScore = baseValue;
    
    // Volatility penalty (0-20 point reduction)
    const volatilityPenalty = volatility * 20;
    
    // Uncertainty penalty (0-15 point reduction)
    const uncertaintyPenalty = uncertainty * 15;
    
    // Stability bonus (0-10 point addition)
    const stabilityBonus = stability * 10;
    
    riskAdjustedScore = riskAdjustedScore - volatilityPenalty - uncertaintyPenalty + stabilityBonus;
    
    // Try explicit risk score fields as fallback
    const explicitScoreFields = [
      'risk_score', 'risk_adjusted_score', 'safety_score',
      'stability_score', 'security_score', 'confidence_score'
    ];
    
    for (const field of explicitScoreFields) {
      if (record[field] !== undefined && record[field] !== null) {
        const score = Number(record[field]);
        if (!isNaN(score)) {
          return Math.max(0, Math.min(100, score)); // Normalize to 0-100
        }
      }
    }
    
    return Math.max(0, Math.min(100, riskAdjustedScore));
  }

  private determineRiskCategory(record: any): string {
    const volatility = record.volatility || 0.3;
    const uncertainty = record.uncertainty || 0.3;
    
    if (volatility > 0.7 || uncertainty > 0.7) return 'high_risk';
    if (volatility > 0.4 || uncertainty > 0.4) return 'medium_risk';
    return 'low_risk';
  }

  private calculateMitigationPotential(record: any): number {
    // Calculate potential for risk mitigation
    const diversification = record.diversification_potential || 0.5;
    const hedging = record.hedging_opportunities || 0.5;
    const insurance = record.insurance_coverage || 0.5;
    const controlMeasures = record.control_measures || 0.5;
    
    // Average mitigation potential
    const mitigationPotential = (diversification + hedging + insurance + controlMeasures) / 4;
    return Math.min(1, mitigationPotential);
  }

  private calculateRiskConfidence(record: any): number {
    // Calculate confidence in risk assessment
    const dataQuality = record.data_quality || 0.8;
    const sampleSize = Math.min(1, (record.sample_size || 100) / 1000);
    const timeSpan = Math.min(1, (record.time_span || 12) / 60); // months to 5 years
    const modelAccuracy = record.model_accuracy || 0.7;
    
    // Weighted average of confidence factors
    const confidence = (dataQuality * 0.3 + sampleSize * 0.2 + timeSpan * 0.2 + modelAccuracy * 0.3);
    return Math.min(1, confidence);
  }

  private extractProperties(record: any): Record<string, any> {
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'risk_score',
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
      if ((key.includes('shap') || key.includes('impact') || key.includes('contribution')) 
          && typeof value === 'number') {
        shapValues[key] = value;
      }
    }
    
    return shapValues;
  }

  private getRiskCategory(score: number, properties: any): string {
    // Categorize based on risk-adjusted performance
    const riskCategory = properties.risk_category || 'medium_risk';
    
    if (score >= 80) return 'low_risk_high_reward';
    if (score >= 60) return 'moderate_risk_good_reward';
    if (score >= 40) return 'balanced_risk_reward';
    if (score >= 20) return 'high_risk_moderate_reward';
    return 'high_risk_low_reward';
  }

  private calculateRiskStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
    const scores = records.map(r => r.value);
    const volatilities = records.map(r => r.properties.volatility || 0);
    const uncertainties = records.map(r => r.properties.uncertainty || 0);
    
    if (scores.length === 0) {
      return {
        total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0,
        avgVolatility: 0, avgUncertainty: 0, riskLevel: 'medium'
      };
    }
    
    const sorted = [...scores].sort((a, b) => a - b);
    const total = scores.length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const mean = sum / total;
    
    const median = total % 2 === 0 
      ? (sorted[Math.floor(total / 2) - 1] + sorted[Math.floor(total / 2)]) / 2
      : sorted[Math.floor(total / 2)];
    
    const variance = scores.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / total;
    const stdDev = Math.sqrt(variance);
    
    // Risk-specific metrics
    const avgVolatility = volatilities.reduce((a, b) => a + b, 0) / total;
    const avgUncertainty = uncertainties.reduce((a, b) => a + b, 0) / total;
    
    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'medium';
    if (avgVolatility > 0.6 || avgUncertainty > 0.6) riskLevel = 'high';
    else if (avgVolatility < 0.3 && avgUncertainty < 0.3) riskLevel = 'low';
    
    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev,
      avgVolatility,
      avgUncertainty,
      riskLevel
    };
  }

  private analyzeRiskPatterns(records: GeographicDataPoint[]): any {
    // Group by risk categories
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
      const avgVolatility = categoryRecords.reduce((sum, r) => sum + (r.properties.volatility || 0), 0) / categoryRecords.length;
      
      return {
        category,
        size: categoryRecords.length,
        percentage: (categoryRecords.length / records.length) * 100,
        avgRiskScore: avgScore,
        avgVolatility,
        topAreas: categoryRecords
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map(r => ({
            name: r.area_name,
            score: r.value,
            volatility: r.properties.volatility,
            uncertainty: r.properties.uncertainty
          }))
      };
    });
    
    // Identify safe havens and high-risk areas
    const safeHavens = records
      .filter(r => r.category === 'low_risk_high_reward')
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    const highRiskAreas = records
      .filter(r => r.properties.volatility > 0.6)
      .sort((a, b) => b.properties.volatility - a.properties.volatility)
      .slice(0, 5);
    
    return {
      categories: categoryAnalysis,
      safeHavens: safeHavens.map(r => ({
        area: r.area_name,
        score: r.value,
        volatility: r.properties.volatility,
        uncertainty: r.properties.uncertainty,
        confidence: r.properties.risk_confidence
      })),
      highRiskAreas: highRiskAreas.map(r => ({
        area: r.area_name,
        volatility: r.properties.volatility,
        uncertainty: r.properties.uncertainty,
        mitigation: r.properties.mitigation_potential,
        status: 'high_risk'
      })),
      riskProfile: this.analyzeRiskProfile(categoryAnalysis)
    };
  }

  private analyzeRiskProfile(categoryAnalysis: any[]): string {
    const lowRiskPercentage = categoryAnalysis.find(c => c.category === 'low_risk_high_reward')?.percentage || 0;
    const highRiskPercentage = categoryAnalysis.filter(c => c.category.includes('high_risk')).reduce((sum, c) => sum + c.percentage, 0);
    
    if (lowRiskPercentage > 40) return 'conservative_risk_profile';
    if (highRiskPercentage > 40) return 'aggressive_risk_profile';
    if (lowRiskPercentage + highRiskPercentage < 60) return 'balanced_risk_profile';
    return 'mixed_risk_profile';
  }

  private processRiskFeatureImportance(rawFeatureImportance: any[]): any[] {
    return rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getRiskFeatureDescription(item.feature || item.name),
      riskImpact: this.assessRiskImpact(item.importance || 0)
    })).sort((a, b) => b.importance - a.importance);
  }

  private getRiskFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'volatility': 'Market volatility and price fluctuation patterns',
      'uncertainty': 'Uncertainty levels and predictability measures',
      'stability': 'Market stability and consistency indicators',
      'downside': 'Downside risk and loss potential assessment',
      'liquidity': 'Liquidity risk and market depth factors',
      'credit': 'Credit risk and counterparty reliability',
      'operational': 'Operational risk and business continuity',
      'regulatory': 'Regulatory risk and compliance factors'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} risk factor`;
  }

  private assessRiskImpact(importance: number): string {
    if (importance >= 0.8) return 'critical_risk_factor';
    if (importance >= 0.6) return 'significant_risk_factor';
    if (importance >= 0.4) return 'moderate_risk_factor';
    if (importance >= 0.2) return 'minor_risk_factor';
    return 'negligible_risk_factor';
  }

  private generateRiskSummary(
    records: GeographicDataPoint[], 
    riskAnalysis: any, 
    rawSummary?: string
  ): string {
    const totalAreas = records.length;
    const safeHavens = riskAnalysis.safeHavens;
    const highRiskAreas = riskAnalysis.highRiskAreas;
    const riskProfile = riskAnalysis.riskProfile;
    
    // Start with formula explanation
    let summary = `**📊 Risk-Adjusted Score Formula:** Scores start with base opportunity value, then subtract Volatility Penalty (up to -20 points) and Uncertainty Penalty (up to -15 points), plus Stability Bonus (up to +10 points). Higher scores indicate better risk-adjusted opportunities.

`;
    
    // Enhanced baseline and risk metrics section
    const avgScore = records.reduce((sum, r) => sum + r.value, 0) / records.length;
    const avgVolatility = records.reduce((sum, r) => sum + (r.properties.volatility || 0), 0) / records.length;
    const avgUncertainty = records.reduce((sum, r) => sum + (r.properties.uncertainty || 0), 0) / records.length;
    const avgStability = records.reduce((sum, r) => sum + (r.properties.stability || 0), 0) / records.length;
    
    summary += `**⚖️ Risk Baseline & Market Averages:** `;
    summary += `Market average risk-adjusted score: ${avgScore.toFixed(1)} (range: ${records[records.length - 1]?.value.toFixed(1) || '0'}-${records[0]?.value.toFixed(1) || '0'}). `;
    summary += `Risk baseline: ${(avgVolatility * 100).toFixed(1)}% volatility, ${(avgUncertainty * 100).toFixed(1)}% uncertainty, ${(avgStability * 100).toFixed(1)}% stability. `;
    
    // Risk distribution analysis
    const lowRisk = records.filter(r => (r.properties.volatility || 0) < 0.3).length;
    const moderateRisk = records.filter(r => (r.properties.volatility || 0) >= 0.3 && (r.properties.volatility || 0) < 0.6).length;
    const highRisk = records.filter(r => (r.properties.volatility || 0) >= 0.6).length;
    
    summary += `Risk distribution: ${lowRisk} low-risk markets (${(lowRisk/totalAreas*100).toFixed(1)}%), ${moderateRisk} moderate-risk (${(moderateRisk/totalAreas*100).toFixed(1)}%), ${highRisk} high-risk (${(highRisk/totalAreas*100).toFixed(1)}%).

`;
    
    summary += `**Risk Analysis Complete:** ${totalAreas} geographic markets analyzed across key risk indicators. `;
    
    // Enhanced safe havens section with multiple examples
    if (safeHavens.length > 0) {
      const topSafeHaven = safeHavens[0];
      summary += `**Safe Havens:** ${topSafeHaven.area} offers highest security with ${topSafeHaven.score.toFixed(1)} risk-adjusted score, ${(topSafeHaven.volatility * 100).toFixed(1)}% volatility, and ${(topSafeHaven.confidence * 100).toFixed(1)}% confidence. `;
      
      // Add additional safe havens (2-5 areas)
      if (safeHavens.length > 1) {
        const additionalSafeHavens = safeHavens.slice(1, 5);
        const safeHavenNames = additionalSafeHavens.map((haven: any) => 
          `${haven.area} (${haven.score.toFixed(1)} score, ${(haven.volatility * 100).toFixed(1)}% volatility)`
        );
        
        if (safeHavenNames.length > 0) {
          summary += `Other secure markets include ${safeHavenNames.join(', ')}. `;
        }
      }
    }
    
    // Enhanced category breakdown with specific examples
    const categoryBreakdown = riskAnalysis.categories;
    if (categoryBreakdown.length > 0) {
      const lowRiskCategory = categoryBreakdown.find((c: any) => c.category === 'low_risk_high_reward');
      const moderateRiskCategory = categoryBreakdown.find((c: any) => c.category === 'moderate_risk_good_reward');
      const highRiskCategory = categoryBreakdown.find((c: any) => c.category.includes('high_risk'));
      
      if (lowRiskCategory && lowRiskCategory.size > 0) {
        summary += `**${lowRiskCategory.size} Low-Risk Markets** (${lowRiskCategory.percentage.toFixed(1)}%): `;
        const topLowRisk = lowRiskCategory.topAreas.slice(0, 3);
        summary += topLowRisk.map((area: any) => `${area.name} (${(area.volatility * 100).toFixed(1)}% vol)`).join(', ');
        summary += '. ';
      }
      
      if (moderateRiskCategory && moderateRiskCategory.size > 0) {
        summary += `**${moderateRiskCategory.size} Moderate-Risk Markets** (${moderateRiskCategory.percentage.toFixed(1)}%): `;
        const topModerate = moderateRiskCategory.topAreas.slice(0, 3);
        summary += topModerate.map((area: any) => `${area.name} (${(area.volatility * 100).toFixed(1)}% vol)`).join(', ');
        summary += '. ';
      }
    }
    
    // Enhanced high-risk areas with detailed examples
    if (highRiskAreas.length > 0) {
      summary += `**${highRiskAreas.length} High-Risk Areas:** `;
      
      // Detailed first high-risk area
      const topRiskArea = highRiskAreas[0];
      summary += `${topRiskArea.area} requires caution with ${(topRiskArea.volatility * 100).toFixed(1)}% volatility and ${(topRiskArea.mitigation * 100).toFixed(1)}% mitigation potential. `;
      
      // Additional high-risk areas (2-6 areas)
      if (highRiskAreas.length > 1) {
        const additionalRiskAreas = highRiskAreas.slice(1, 6);
        const riskAreaNames = additionalRiskAreas.map((area: any) => 
          `${area.area} (${(area.volatility * 100).toFixed(1)}% volatility)`
        );
        
        if (riskAreaNames.length > 0) {
          summary += `Additional risk zones: ${riskAreaNames.join(', ')}. `;
        }
      }
    }
    
    // Risk profile insights
    summary += `Risk profile: ${riskProfile.replace('_', ' ')}. `;
    
    // Add risk insights (variables already calculated above)
    summary += `**Risk Overview:** Average risk-adjusted score ${avgScore.toFixed(1)}, market volatility ${(avgVolatility * 100).toFixed(1)}%, uncertainty level ${(avgUncertainty * 100).toFixed(1)}%. `;
    
    // Strategic recommendations
    summary += `**Strategic Insights:** Risk environment shows `;
    if (avgVolatility > 0.6) {
      summary += `high volatility requiring defensive strategies and risk mitigation. `;
    } else if (avgVolatility > 0.3) {
      summary += `moderate volatility suggesting balanced risk management approach. `;
    } else {
      summary += `low volatility creating favorable conditions for expansion. `;
    }
    
    summary += `**Recommendations:** Prioritize investment in safe haven markets for security. Implement risk management strategies for moderate-risk areas. Exercise extreme caution or avoid high-risk zones until mitigation measures are in place. `;
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }
} 