import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData } from '../../types';

/**
 * SegmentProfilingProcessor - Specialized processor for segment profiling analysis
 * 
 * Focuses on identifying markets with strong segmentation potential by analyzing
 * demographic distinctiveness, behavioral clustering, market segment strength, and profiling clarity.
 */
export class SegmentProfilingProcessor implements DataProcessorStrategy {
  validate(rawData: RawAnalysisResult): boolean {
    return rawData && 
           rawData.success && 
           Array.isArray(rawData.results) && 
           rawData.results.length > 0;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    if (!rawData.success) {
      throw new Error(rawData.error || 'Segment profiling analysis failed');
    }

    const records = rawData.results.map((record: any, index: number) => {
      // Extract the pre-calculated segment profiling score
      const segmentScore = Number(record.segment_profiling_score) || 0;
      
      // Extract related metrics for additional analysis (updated for actual dataset fields)
      const nikeShare = Number(record.value_MP30034A_B_P || record.mp30034a_b_p) || 0;
      const strategicScore = Number(record.strategic_value_score) || 0;
      const competitiveScore = Number(record.competitive_advantage_score) || 0;
      const demographicScore = Number(record.demographic_opportunity_score) || 0;
      const trendScore = Number(record.trend_strength_score) || 0;
      const correlationScore = Number(record.correlation_strength_score) || 0;
      const totalPop = Number(record.value_TOTPOP_CY || record.TOTPOP_CY || record.total_population) || 0;
      const medianIncome = Number(record.value_MEDDI_CY || record.value_AVGHINC_CY || record.median_income) || 0;

      // Calculate additional segmentation indicators
      const indicators = this.calculateSegmentationIndicators({
        segmentScore,
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
        value: segmentScore,
        rank: index + 1, // Will be sorted later
        category: this.categorizeSegmentPotential(segmentScore),
        coordinates: this.extractCoordinates(record),
        properties: {
          // Core segmentation metrics
          segment_profiling_score: segmentScore,
          demographic_distinctiveness: indicators.demographicDistinctiveness,
          behavioral_clustering_strength: indicators.behavioralClustering,
          market_segment_strength: indicators.marketSegmentStrength,
          profiling_clarity: indicators.profilingClarity,
          
          // Segment characteristics
          primary_segment_type: indicators.primarySegmentType,
          segment_size: indicators.segmentSize,
          segment_income_level: indicators.segmentIncomeLevel,
          nike_segment_affinity: indicators.nikeSegmentAffinity,
          
          // Demographic segmentation factors
          income_distinctiveness: indicators.incomeDistinctiveness,
          population_segment_category: indicators.populationSegmentCategory,
          demographic_profile_strength: indicators.demographicProfileStrength,
          
          // Behavioral segmentation factors
          strategic_behavioral_pattern: indicators.strategicBehavioralPattern,
          competitive_behavioral_pattern: indicators.competitiveBehavioralPattern,
          brand_loyalty_segment: indicators.brandLoyaltySegment,
          trend_behavioral_alignment: indicators.trendBehavioralAlignment,
          
          // Supporting segmentation data
          nike_market_share: nikeShare,
          market_population: totalPop,
          median_household_income: medianIncome,
          strategic_alignment: strategicScore,
          demographic_opportunity: demographicScore,
          competitive_position: competitiveScore,
          
          // Segmentation quality metrics
          segment_coherence: indicators.segmentCoherence,
          profile_completeness: indicators.profileCompleteness,
          segmentation_reliability: indicators.segmentationReliability,
          
          // Actionable segment insights
          recommended_segment_strategy: indicators.recommendedStrategy,
          segment_targeting_priority: indicators.targetingPriority,
          segmentation_complexity: indicators.segmentationComplexity
        },
        shapValues: record.shap_values || {}
      };
    });

    // Sort by segment profiling score (highest first)
    records.sort((a, b) => b.value - a.value);
    
    // Update ranks after sorting
    records.forEach((record, index) => {
      record.rank = index + 1;
    });

    // Calculate statistics
    const values = records.map(r => r.value);
    const statistics = this.calculateStatistics(values);

    // Generate segment profiling summary
    const summary = this.generateSegmentSummary(records, statistics);

    return {
      type: 'segment_profiling',
      records,
      summary,
      featureImportance: rawData.feature_importance || [],
      statistics,
      targetVariable: 'segment_profiling_score'
    };
  }

  private calculateSegmentationIndicators(metrics: {
    segmentScore: number;
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
      segmentScore,
      nikeShare,
      strategicScore,
      competitiveScore,
      demographicScore,
      trendScore,
      correlationScore,
      totalPop,
      medianIncome
    } = metrics;

    // Demographic distinctiveness assessment
    const demographicDistinctiveness = demographicScore >= 80 ? 'Very High' :
                                     demographicScore >= 65 ? 'High' :
                                     demographicScore >= 50 ? 'Moderate' :
                                     demographicScore >= 35 ? 'Low' : 'Very Low';

    // Behavioral clustering strength
    const behavioralClustering = (strategicScore >= 70 && nikeShare >= 20) ? 'Strong' :
                               (strategicScore >= 50 || nikeShare >= 15) ? 'Moderate' :
                               (strategicScore >= 30 || nikeShare >= 8) ? 'Weak' : 'Limited';

    // Market segment strength assessment
    const marketSegmentStrength = correlationScore >= 70 ? 'Excellent' :
                                correlationScore >= 50 ? 'Good' :
                                correlationScore >= 35 ? 'Fair' : 'Limited';

    // Profiling clarity assessment  
    const dataFields = [nikeShare, strategicScore, competitiveScore, demographicScore, 
                       trendScore, correlationScore, totalPop, medianIncome].filter(v => v > 0).length;
    const profilingClarity = dataFields >= 7 ? 'Very Clear' :
                           dataFields >= 5 ? 'Clear' :
                           dataFields >= 3 ? 'Moderate' : 'Limited';

    // Primary segment type identification
    let primarySegmentType = 'Mixed Market';
    if (nikeShare >= 25 && medianIncome >= 100000) primarySegmentType = 'Premium Nike Loyalists';
    else if (nikeShare >= 20 && medianIncome >= 80000) primarySegmentType = 'Affluent Nike Consumers';
    else if (nikeShare >= 15 && demographicScore >= 70) primarySegmentType = 'Demographic Nike Segment';
    else if (medianIncome >= 100000) primarySegmentType = 'High-Income Market'; 
    else if (demographicScore >= 80) primarySegmentType = 'High-Demographic Potential';
    else if (strategicScore >= 70) primarySegmentType = 'Strategic Target Market';
    else if (totalPop >= 100000) primarySegmentType = 'Mass Market Segment';
    else if (totalPop >= 50000) primarySegmentType = 'Large Market Segment';
    else primarySegmentType = 'Niche Market Segment';

    // Segment size category
    const segmentSize = totalPop >= 100000 ? 'Large' :
                       totalPop >= 50000 ? 'Medium-Large' :
                       totalPop >= 25000 ? 'Medium' :
                       totalPop >= 10000 ? 'Small-Medium' : 'Small';

    // Segment income level
    const segmentIncomeLevel = medianIncome >= 120000 ? 'Very High Income' :
                              medianIncome >= 100000 ? 'High Income' :
                              medianIncome >= 80000 ? 'Upper-Middle Income' :
                              medianIncome >= 60000 ? 'Middle Income' :
                              medianIncome >= 40000 ? 'Lower-Middle Income' : 'Lower Income';

    // Nike segment affinity
    const nikeSegmentAffinity = nikeShare >= 30 ? 'Very High Affinity' :
                               nikeShare >= 20 ? 'High Affinity' :
                               nikeShare >= 15 ? 'Moderate Affinity' :
                               nikeShare >= 8 ? 'Low Affinity' : 'Very Low Affinity';

    // Income distinctiveness
    const incomeDistinctiveness = medianIncome >= 120000 ? 'Highly Distinctive' :
                                 medianIncome >= 100000 ? 'Very Distinctive' :
                                 medianIncome >= 80000 ? 'Distinctive' :
                                 medianIncome >= 60000 ? 'Moderately Distinctive' : 'Not Distinctive';

    // Population segment category
    const populationSegmentCategory = totalPop >= 100000 ? 'Metro Segment' :
                                    totalPop >= 50000 ? 'Urban Segment' :
                                    totalPop >= 25000 ? 'Suburban Segment' :
                                    totalPop >= 10000 ? 'Community Segment' : 'Local Segment';

    // Demographic profile strength
    const demographicProfileStrength = (demographicScore >= 70 && medianIncome >= 80000) ? 'Very Strong' :
                                     (demographicScore >= 60 || medianIncome >= 70000) ? 'Strong' :
                                     (demographicScore >= 45 || medianIncome >= 50000) ? 'Moderate' : 'Weak';

    // Strategic behavioral pattern
    const strategicBehavioralPattern = strategicScore >= 80 ? 'Highly Strategic' :
                                     strategicScore >= 65 ? 'Strategic' :
                                     strategicScore >= 50 ? 'Moderately Strategic' :
                                     strategicScore >= 35 ? 'Somewhat Strategic' : 'Non-Strategic';

    // Competitive behavioral pattern  
    const competitiveBehavioralPattern = competitiveScore >= 8 ? 'Highly Competitive' :
                                       competitiveScore >= 6 ? 'Competitive' :
                                       competitiveScore >= 4 ? 'Moderately Competitive' : 'Low Competition';

    // Brand loyalty segment
    const brandLoyaltySegment = nikeShare >= 30 ? 'High Loyalty' :
                               nikeShare >= 20 ? 'Moderate Loyalty' :
                               nikeShare >= 10 ? 'Low Loyalty' : 'Minimal Loyalty';

    // Trend behavioral alignment
    const trendBehavioralAlignment = trendScore >= 75 ? 'Strongly Aligned' :
                                   trendScore >= 60 ? 'Well Aligned' :
                                   trendScore >= 45 ? 'Moderately Aligned' : 'Poorly Aligned';

    // Segment coherence
    const activeScores = [strategicScore, demographicScore, trendScore, correlationScore].filter(s => s > 0);
    let segmentCoherence = 'Unknown';
    if (activeScores.length >= 3) {
      const mean = activeScores.reduce((a, b) => a + b, 0) / activeScores.length;
      const coherent = activeScores.every(s => Math.abs(s - mean) <= 25);
      segmentCoherence = coherent ? 'High Coherence' : 'Mixed Coherence';
    }

    // Profile completeness
    const profileCompleteness = Math.round((dataFields / 8) * 100);

    // Segmentation reliability
    const segmentationReliability = segmentScore >= 65 ? 'High Reliability' :
                                   segmentScore >= 50 ? 'Moderate Reliability' :
                                   segmentScore >= 35 ? 'Low Reliability' : 'Poor Reliability';

    // Recommended segment strategy
    let recommendedStrategy = 'General Marketing';
    if (primarySegmentType.includes('Premium')) recommendedStrategy = 'Luxury Positioning';
    else if (primarySegmentType.includes('Affluent')) recommendedStrategy = 'Premium Targeting';
    else if (primarySegmentType.includes('Demographic')) recommendedStrategy = 'Demographic-Focused';
    else if (primarySegmentType.includes('Strategic')) recommendedStrategy = 'Strategic Investment';
    else if (primarySegmentType.includes('Mass')) recommendedStrategy = 'Mass Market Approach';
    else if (primarySegmentType.includes('Niche')) recommendedStrategy = 'Niche Specialization';

    // Targeting priority
    const targetingPriority = (segmentScore >= 60 && (nikeShare >= 15 || medianIncome >= 80000)) ? 'High Priority' :
                            (segmentScore >= 50 || nikeShare >= 12) ? 'Medium Priority' :
                            (segmentScore >= 40) ? 'Low Priority' : 'Minimal Priority';

    // Segmentation complexity
    const segmentationComplexity = (dataFields >= 7 && activeScores.length >= 4) ? 'High Complexity' :
                                 (dataFields >= 5 && activeScores.length >= 3) ? 'Moderate Complexity' :
                                 (dataFields >= 3) ? 'Low Complexity' : 'Simple Segmentation';

    return {
      demographicDistinctiveness,
      behavioralClustering,
      marketSegmentStrength,
      profilingClarity,
      primarySegmentType,
      segmentSize,
      segmentIncomeLevel,
      nikeSegmentAffinity,
      incomeDistinctiveness,
      populationSegmentCategory,
      demographicProfileStrength,
      strategicBehavioralPattern,
      competitiveBehavioralPattern,
      brandLoyaltySegment,
      trendBehavioralAlignment,
      segmentCoherence,
      profileCompleteness,
      segmentationReliability,
      recommendedStrategy,
      targetingPriority,
      segmentationComplexity
    };
  }

  private categorizeSegmentPotential(score: number): string {
    if (score >= 80) return 'Excellent Segmentation';
    if (score >= 65) return 'Good Segment Potential';
    if (score >= 50) return 'Moderate Segmentation';
    if (score >= 35) return 'Limited Segment Value';
    return 'Poor Segmentation';
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

  private generateSegmentSummary(records: any[], statistics: any): string {
    const topSegmentable = records.slice(0, 5);
    const excellentCount = records.filter(r => r.value >= 80).length;
    const goodCount = records.filter(r => r.value >= 65 && r.value < 80).length;
    const avgScore = statistics.mean.toFixed(1);

    const topMarkets = topSegmentable
      .map(r => `${r.area_name} (${r.value.toFixed(1)})`)
      .join(', ');

    // Identify dominant segment types from top markets
    const segmentTypes = topSegmentable.map(r => r.properties.primary_segment_type);
    const dominantSegmentType = this.findMostCommon(segmentTypes) || 'Mixed segments';

    return `Segment profiling analysis of ${records.length} markets identified ${excellentCount} areas with excellent segmentation potential (80+) and ${goodCount} with good segment potential (65-79). Average segment profiling score: ${avgScore}. Top segmentable markets: ${topMarkets}. Analysis reveals ${dominantSegmentType.toLowerCase()} as the primary high-value segment type, considering demographic distinctiveness, behavioral clustering, market segment strength, and profiling clarity.`;
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