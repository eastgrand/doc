import { DataProcessorStrategy, RawAnalysisResult, ProcessedAnalysisData, GeographicDataPoint, AnalysisStatistics } from '../../types';

/**
 * CustomerProfileProcessor - Handles data processing for the /customer-profile endpoint
 * 
 * Processes customer profile analysis results with comprehensive persona analysis,
 * demographic alignment, lifestyle indicators, and behavioral patterns across geographic areas.
 */
export class CustomerProfileProcessor implements DataProcessorStrategy {
  
  validate(rawData: RawAnalysisResult): boolean {
    if (!rawData || typeof rawData !== 'object') return false;
    
    // Handle both formats: direct array or wrapped object
    let dataArray: any[];
    if (Array.isArray(rawData)) {
      // Direct array format: [{...}, {...}]
      dataArray = rawData;
    } else if (rawData.success && Array.isArray(rawData.results)) {
      // Wrapped format: {success: true, results: [{...}, {...}]}
      dataArray = rawData.results;
    } else {
      return false;
    }
    
    // Validate customer profile-specific fields
    const hasCustomerProfileFields = dataArray.length === 0 || 
      dataArray.some(record => 
        record && 
        (record.customer_profile_score !== undefined || // Pre-calculated score
         record.total_population !== undefined ||        // Population for analysis
         record.median_income !== undefined ||          // Income demographics
         record.value_TOTPOP_CY !== undefined ||        // Legacy population
         record.value_AVGHINC_CY !== undefined ||       // Legacy income
         record.value_MEDAGE_CY !== undefined ||        // Age demographics
         record.mp30034a_b_p !== undefined ||           // Nike affinity indicator
         record.demographic_opportunity_score !== undefined) // Demographic base
      );
    
    return hasCustomerProfileFields;
  }

  process(rawData: RawAnalysisResult): ProcessedAnalysisData {
    // Handle both formats: direct array or wrapped object
    let dataArray: any[];
    if (Array.isArray(rawData)) {
      // Direct array format: [{...}, {...}]
      dataArray = rawData;
      console.log(`👤 [CUSTOMER PROFILE PROCESSOR] CALLED WITH ${dataArray.length} RECORDS (direct array) 👤`);
    } else if (rawData.success && Array.isArray(rawData.results)) {
      // Wrapped format: {success: true, results: [{...}, {...}]}
      dataArray = rawData.results;
      console.log(`👤 [CUSTOMER PROFILE PROCESSOR] CALLED WITH ${dataArray.length} RECORDS (wrapped) 👤`);
    } else {
      throw new Error('Invalid data format for CustomerProfileProcessor');
    }
    
    if (!this.validate(rawData)) {
      throw new Error('Invalid data format for CustomerProfileProcessor');
    }

    // Process records with customer profile information
    const records = this.processCustomerProfileRecords(dataArray);
    
    // Calculate customer profile statistics
    const statistics = this.calculateCustomerProfileStatistics(records);
    
    // Analyze customer profile patterns and personas
    const customerProfileAnalysis = this.analyzeCustomerProfilePatterns(records);
    
    // Process feature importance for customer profile factors
    const featureImportance = this.processCustomerProfileFeatureImportance(
      Array.isArray(rawData) ? [] : (rawData.feature_importance || [])
    );
    
    // Generate customer profile summary
    const summary = this.generateCustomerProfileSummary(
      records, 
      customerProfileAnalysis, 
      Array.isArray(rawData) ? undefined : rawData.summary
    );

    return {
      type: 'customer_profile',
      records,
      summary,
      featureImportance,
      statistics,
      targetVariable: 'customer_profile_score',
      renderer: this.createCustomerProfileRenderer(records), // Add direct renderer
      legend: this.createCustomerProfileLegend(records), // Add direct legend
      customerProfileAnalysis // Additional metadata for customer profile visualization
    };
  }

  // ============================================================================
  // PRIVATE PROCESSING METHODS
  // ============================================================================

  private processCustomerProfileRecords(rawRecords: any[]): GeographicDataPoint[] {
    return rawRecords.map((record, index) => {
      const area_id = record.ID || record.area_id || record.id || record.GEOID || `area_${index}`;
      const area_name = record.value_DESCRIPTION || record.DESCRIPTION || record.area_name || record.name || record.NAME || `Area ${index + 1}`;
      
      // Extract customer profile score
      const customerProfileScore = this.extractCustomerProfileScore(record);
      
      // Use customer profile score as the primary value
      const value = customerProfileScore;
      
      // Extract customer profile-specific properties from pre-calculated data
      const properties = {
        ...this.extractProperties(record),
        customer_profile_score: customerProfileScore,
        demographic_alignment: Number(record.demographic_alignment) || 0,
        lifestyle_score: Number(record.lifestyle_score) || 0,
        behavioral_score: Number(record.behavioral_score) || 0,
        market_context_score: Number(record.market_context_score) || 0,
        profile_category: record.profile_category || this.getCustomerProfileCategory(customerProfileScore),
        persona_type: this.identifyPersonaType(record),
        target_confidence: Math.min(100, (customerProfileScore + (Number(record.demographic_alignment) || 0)) / 2),
        population: record.total_population || record.value_TOTPOP_CY || record.population || 0,
        avg_income: record.median_income || record.value_AVGHINC_CY || record.income || 0,
        median_age: record.value_MEDAGE_CY || record.age || 0,
        household_size: record.value_AVGHHSZ_CY || record.household_size || 0,
        wealth_index: record.value_WLTHINDXCY || 100,
        nike_affinity: Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0,
        brand_loyalty_indicator: this.calculateBrandLoyalty(record),
        lifestyle_alignment: this.calculateLifestyleAlignment(record),
        purchase_propensity: this.calculatePurchasePropensity(record)
      };
      
      // Extract SHAP values
      const shapValues = this.extractShapValues(record);
      
      // Category based on customer profile strength
      const category = this.getCustomerProfileCategory(customerProfileScore);

      return {
        area_id,
        area_name,
        value,
        customer_profile_score: customerProfileScore, // Add target variable at top level
        rank: 0, // Will be calculated in ranking
        category,
        coordinates: record.coordinates || [0, 0],
        properties,
        shapValues
      };
    }).sort((a, b) => b.value - a.value) // Sort by customer profile score
      .map((record, index) => ({ ...record, rank: index + 1 })); // Assign ranks
  }

  private extractCustomerProfileScore(record: any): number {
    // Use pre-calculated customer profile score from data
    if (record.customer_profile_score !== undefined && record.customer_profile_score !== null) {
      const score = Number(record.customer_profile_score);
      console.log(`👤 [CustomerProfileProcessor] Using customer_profile_score: ${score} for ${record.DESCRIPTION || record.area_name || 'Unknown'}`);
      return score;
    }
    
    // Fallback to demographic opportunity score if customer profile score not available
    if (record.demographic_opportunity_score !== undefined && record.demographic_opportunity_score !== null) {
      const score = Number(record.demographic_opportunity_score);
      console.log(`👤 [CustomerProfileProcessor] Fallback to demographic_opportunity_score: ${score} for ${record.DESCRIPTION || record.area_name || 'Unknown'}`);
      return score;
    }
    
    console.log('⚠️ [CustomerProfileProcessor] No customer profile or demographic scores found');
    return 0;
  }

  private calculateProfileComponents(record: any): {
    demographic_alignment: number;
    lifestyle_score: number;
    behavioral_score: number;
    market_context_score: number;
  } {
    // Extract available data from customer-profile.json structure
    const population = record.total_population || record.value_TOTPOP_CY || 0;
    const income = record.median_income || record.value_AVGHINC_CY || 0;
    const asianPop = record.asian_population || 0;
    const blackPop = record.black_population || 0;
    const whitePop = record.white_population || 0;
    
    // Behavioral indicators
    const nikeMarketShare = Number(record.mp30034a_b_p || record.target_value) || 0;
    const strategicValue = Number(record.strategic_value_score) || 0;
    const trendStrength = Number(record.trend_strength_score) || 0;
    const correlationStrength = Number(record.correlation_strength_score) || 0;
    
    // Market context
    const demographicOpportunity = Number(record.demographic_opportunity_score) || 0;

    // 1. Demographic Alignment (25% weight) - Use existing demographic opportunity as base
    const demographicAlignment = Math.min(100, demographicOpportunity);
    
    // 2. Behavioral Score (35% weight) - Nike preference and market trends
    let behavioralScore = 0;
    
    // Nike market share indicates actual customer behavior preference
    behavioralScore += Math.min(40, nikeMarketShare * 1.5); // Up to 40 points from market share
    
    // Strategic value indicates market responsiveness to athletic brands
    behavioralScore += Math.min(30, strategicValue * 0.3); // Up to 30 points from strategic value
    
    // Trend strength indicates evolving customer behavior
    behavioralScore += Math.min(30, trendStrength * 0.3); // Up to 30 points from trends
    
    // 3. Spending Patterns (25% weight) - Income-based purchasing power
    let lifestyleScore = 0;
    
    if (income > 0) {
      // Nike's sweet spot: $40K-$120K income range
      if (income >= 40000 && income <= 120000) {
        lifestyleScore += 50; // Optimal spending range
      } else if (income >= 25000 && income <= 200000) {
        lifestyleScore += 30; // Extended range
      } else {
        lifestyleScore += 15; // Some potential
      }
    }
    
    // Population density affects purchasing patterns (urban = more brand conscious)
    if (population > 0) {
      const densityScore = Math.min(25, Math.log10(population) * 5); // Urban areas score higher
      lifestyleScore += densityScore;
    }
    
    // Diversity index (calculated from population mix) affects lifestyle patterns
    const totalPop = asianPop + blackPop + whitePop;
    if (totalPop > 0) {
      const diversity = 1 - Math.pow((asianPop/totalPop), 2) - Math.pow((blackPop/totalPop), 2) - Math.pow((whitePop/totalPop), 2);
      lifestyleScore += diversity * 25; // More diverse = varied lifestyle patterns
    }
    
    // 4. Market Context Score (15% weight) - Overall market health and correlation
    let marketContextScore = 0;
    
    // Correlation strength indicates market predictability and segment clarity
    marketContextScore += Math.min(50, correlationStrength * 0.5);
    
    // Population size indicates market opportunity
    if (population > 0) {
      marketContextScore += Math.min(30, Math.log10(population) * 6);
    }
    
    // Income level indicates market premium potential
    if (income > 0) {
      marketContextScore += Math.min(20, income / 5000);
    }
    
    // Population density factor (larger markets have more potential)
    if (population > 0) {
      demographicAlignment += Math.min(35, Math.log10(population) * 8); // Log scale for population impact
    }

    // 2. Lifestyle Score (25% weight)
    let lifestyleScore = 0;
    
    // Wealth index alignment (Nike targets middle to upper-middle class)
    const wealthScore = Math.min(40, (wealthIndex / 150) * 40); // Scale wealth index to 0-40 points
    lifestyleScore += wealthScore;
    
    // Activity/Lifestyle inference from demographics
    if (age >= 18 && age <= 40 && income >= 40000) {
      lifestyleScore += 25; // Active lifestyle demographic
    }
    
    // Urban/suburban inference (higher income + smaller household often = urban professional)
    if (income > 60000 && householdSize <= 3) {
      lifestyleScore += 20; // Urban professional lifestyle
    }
    
    // Health/fitness potential (prime Nike demographic)
    if (age >= 20 && age <= 50 && income >= 35000) {
      lifestyleScore += 15; // Health-conscious demographic
    }

    // 3. Behavioral Score (25% weight)
    let behavioralScore = 0;
    
    // Nike brand affinity (direct behavioral indicator)
    if (nikeAffinity > 0) {
      behavioralScore += (nikeAffinity / 50) * 40; // Nike market share as behavior proxy
    }
    
    // Purchase propensity based on income and age
    if (income >= 30000 && age >= 16 && age <= 55) {
      const propensity = Math.min(25, (income / 80000) * 25);
      behavioralScore += propensity;
    }
    
    // Early adopter potential (younger, higher income)
    if (age >= 18 && age <= 35 && income >= 50000) {
      behavioralScore += 20;
    }
    
    // Brand loyalty potential (stable income, prime demographic)
    if (income >= 40000 && age >= 25 && age <= 45) {
      behavioralScore += 15;
    }

    // 4. Market Context Score (20% weight)
    let marketContextScore = 0;
    
    // Market size factor
    if (population > 0) {
      marketContextScore += Math.min(30, (population / 100000) * 30); // Larger markets = better context
    }
    
    // Economic stability (income relative to local context)
    if (income > 0 && wealthIndex > 0) {
      const stability = Math.min(25, (wealthIndex / 120) * 25);
      marketContextScore += stability;
    }
    
    // Competitive context (Nike presence indicates viable market)
    if (nikeAffinity > 10) {
      marketContextScore += 25; // Proven Nike market
    } else if (nikeAffinity > 0) {
      marketContextScore += 15; // Some Nike presence
    } else {
      marketContextScore += 10; // Untapped potential
    }
    
    // Growth potential (younger demographics + rising income)
    if (age < 35 && income >= 35000) {
      marketContextScore += 20;
    }

    return {
      demographic_alignment: Math.min(100, demographicAlignment),
      lifestyle_score: Math.min(100, lifestyleScore),
      behavioral_score: Math.min(100, behavioralScore),
      market_context_score: Math.min(100, marketContextScore)
    };
  }

  private getCustomerProfileCategory(score: number): string {
    if (score >= 90) return 'Ideal Customer Profile Match';
    if (score >= 75) return 'Strong Customer Profile Fit';
    if (score >= 60) return 'Good Customer Profile Alignment';
    if (score >= 45) return 'Moderate Customer Profile Potential';
    if (score >= 30) return 'Developing Customer Profile Market';
    return 'Limited Customer Profile Fit';
  }

  private identifyPersonaType(record: any): string {
    const income = record.median_income || record.value_AVGHINC_CY || record.income || 0;
    const nikeAffinity = Number(record.mp30034a_b_p || record.target_value) || 0;
    const behavioralScore = Number(record.behavioral_score) || 0;
    const demographicScore = Number(record.demographic_alignment) || 0;

    // Athletic Enthusiasts: High Nike affinity + strong behavioral score
    if (nikeAffinity >= 25 && behavioralScore >= 70) {
      return 'Athletic Enthusiasts';
    }
    
    // Fashion-Forward Professionals: High income + good lifestyle score
    if (income >= 60000 && Number(record.lifestyle_score) >= 70) {
      return 'Fashion-Forward Professionals';
    }
    
    // Premium Brand Loyalists: High income + Nike affinity + prime age
    if (income >= 75000 && nikeAffinity >= 15 && age >= 25 && age <= 50) {
      return 'Premium Brand Loyalists';
    }
    
    // Emerging Young Adults: Young age + moderate income + high behavioral potential
    if (age >= 16 && age <= 28 && income >= 25000 && components.behavioral_score >= 50) {
      return 'Emerging Young Adults';
    }
    
    // Value-Conscious Families: Moderate income + family household + practical focus
    if (income >= 35000 && income <= 70000 && age >= 30 && age <= 50) {
      return 'Value-Conscious Families';
    }
    
    // Default to mixed profile
    return 'Mixed Customer Profile';
  }

  private calculateTargetConfidence(components: any): number {
    // Confidence based on consistency across components
    const scores = [
      components.demographic_alignment,
      components.lifestyle_score,
      components.behavioral_score,
      components.market_context_score
    ];
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDev = Math.sqrt(variance);
    
    // High confidence when scores are consistently high and have low variance
    const consistency = Math.max(0, 100 - (standardDev * 2)); // Lower std dev = higher confidence
    const strength = mean; // Higher overall scores = higher confidence
    
    return Math.min(100, (consistency * 0.4 + strength * 0.6));
  }

  private calculateBrandLoyalty(record: any): number {
    const nikeAffinity = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const income = record.median_income || record.value_AVGHINC_CY || record.income || 0;
    const age = record.value_MEDAGE_CY || record.age || 0;
    
    let loyaltyScore = 0;
    
    // Nike affinity as primary loyalty indicator
    loyaltyScore += (nikeAffinity / 50) * 40;
    
    // Income stability (higher income = more brand loyal)
    if (income >= 50000) loyaltyScore += 30;
    else if (income >= 35000) loyaltyScore += 20;
    else loyaltyScore += 10;
    
    // Age stability (prime adults are more brand loyal)
    if (age >= 25 && age <= 50) loyaltyScore += 30;
    else if (age >= 18 && age <= 60) loyaltyScore += 20;
    else loyaltyScore += 10;
    
    return Math.min(100, loyaltyScore);
  }

  private calculateLifestyleAlignment(record: any): number {
    const age = record.value_MEDAGE_CY || record.age || 0;
    const income = record.median_income || record.value_AVGHINC_CY || record.income || 0;
    const wealthIndex = record.value_WLTHINDXCY || 100;
    const householdSize = record.value_AVGHHSZ_CY || record.household_size || 0;
    
    let alignmentScore = 0;
    
    // Active lifestyle age range
    if (age >= 18 && age <= 45) alignmentScore += 25;
    else if (age >= 16 && age <= 55) alignmentScore += 15;
    else alignmentScore += 5;
    
    // Lifestyle income (disposable income for athletic/fashion purchases)
    if (income >= 50000) alignmentScore += 25;
    else if (income >= 35000) alignmentScore += 20;
    else if (income >= 25000) alignmentScore += 10;
    else alignmentScore += 5;
    
    // Wealth index lifestyle indicator
    alignmentScore += Math.min(25, (wealthIndex / 150) * 25);
    
    // Household composition (smaller households often more active/trendy)
    if (householdSize <= 2) alignmentScore += 15;
    else if (householdSize <= 4) alignmentScore += 10;
    else alignmentScore += 5;
    
    // Urban/professional lifestyle (higher income + smaller household)
    if (income >= 60000 && householdSize <= 3) alignmentScore += 10;
    
    return Math.min(100, alignmentScore);
  }

  private calculatePurchasePropensity(record: any): number {
    const age = record.value_MEDAGE_CY || record.age || 0;
    const income = record.median_income || record.value_AVGHINC_CY || record.income || 0;
    const nikeAffinity = Number(record.mp30034a_b_p || record.value_MP30034A_B_P) || 0;
    const wealthIndex = record.value_WLTHINDXCY || 100;
    
    let propensityScore = 0;
    
    // Core purchasing age
    if (age >= 16 && age <= 45) propensityScore += 25;
    else if (age >= 12 && age <= 55) propensityScore += 15;
    else propensityScore += 5;
    
    // Purchasing power
    if (income >= 40000) propensityScore += 30;
    else if (income >= 25000) propensityScore += 20;
    else if (income >= 15000) propensityScore += 10;
    else propensityScore += 5;
    
    // Brand preference (existing Nike customers likely to purchase more)
    propensityScore += (nikeAffinity / 50) * 25;
    
    // Wealth-driven propensity
    propensityScore += Math.min(20, (wealthIndex / 150) * 20);
    
    return Math.min(100, propensityScore);
  }

  private extractProperties(record: any): Record<string, any> {
    const internalFields = new Set([
      'area_id', 'id', 'area_name', 'name', 'customer_profile_score',
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

  private calculateCustomerProfileStatistics(records: GeographicDataPoint[]): AnalysisStatistics {
    const scores = records.map(r => r.value);
    const demographicScores = records.map(r => r.properties.demographic_alignment || 0);
    const lifestyleScores = records.map(r => r.properties.lifestyle_score || 0);
    const behavioralScores = records.map(r => r.properties.behavioral_score || 0);
    
    if (scores.length === 0) {
      return {
        total: 0, mean: 0, median: 0, min: 0, max: 0, stdDev: 0,
        avgDemographicAlignment: 0, avgLifestyleScore: 0, avgBehavioralScore: 0,
        avgTargetConfidence: 0
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
    
    // Customer profile-specific metrics
    const avgDemographicAlignment = demographicScores.reduce((a, b) => a + b, 0) / total;
    const avgLifestyleScore = lifestyleScores.reduce((a, b) => a + b, 0) / total;
    const avgBehavioralScore = behavioralScores.reduce((a, b) => a + b, 0) / total;
    const avgTargetConfidence = records.reduce((sum, r) => sum + (r.properties.target_confidence || 0), 0) / total;
    
    return {
      total,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      stdDev,
      avgDemographicAlignment,
      avgLifestyleScore,
      avgBehavioralScore,
      avgTargetConfidence
    };
  }

  private analyzeCustomerProfilePatterns(records: GeographicDataPoint[]): any {
    // Group by persona types
    const personaMap = new Map<string, GeographicDataPoint[]>();
    
    records.forEach(record => {
      const persona = record.properties.persona_type || 'Unknown';
      if (!personaMap.has(persona)) {
        personaMap.set(persona, []);
      }
      personaMap.get(persona)!.push(record);
    });
    
    // Analyze each persona
    const personaAnalysis = Array.from(personaMap.entries()).map(([persona, personaRecords]) => {
      const avgScore = personaRecords.reduce((sum, r) => sum + r.value, 0) / personaRecords.length;
      const avgConfidence = personaRecords.reduce((sum, r) => sum + (r.properties.target_confidence || 0), 0) / personaRecords.length;
      
      return {
        persona,
        size: personaRecords.length,
        percentage: (personaRecords.length / records.length) * 100,
        avgCustomerProfileScore: avgScore,
        avgTargetConfidence: avgConfidence,
        topAreas: personaRecords
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map(r => ({
            name: r.area_name,
            score: r.value,
            confidence: r.properties.target_confidence
          }))
      };
    });
    
    // Identify profile leaders and opportunities
    const profileLeaders = records
      .filter(r => r.value >= 75)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    
    const emergingOpportunities = records
      .filter(r => r.value >= 50 && r.value < 75 && (r.properties.target_confidence || 0) >= 60)
      .sort((a, b) => (b.properties.target_confidence || 0) - (a.properties.target_confidence || 0))
      .slice(0, 5);
    
    return {
      personas: personaAnalysis,
      profileLeaders: profileLeaders.map(r => ({
        area: r.area_name,
        score: r.value,
        persona: r.properties.persona_type,
        confidence: r.properties.target_confidence
      })),
      emergingOpportunities: emergingOpportunities.map(r => ({
        area: r.area_name,
        currentScore: r.value,
        confidence: r.properties.target_confidence,
        persona: r.properties.persona_type
      })),
      marketDominance: this.assessMarketDominance(personaAnalysis)
    };
  }

  private assessMarketDominance(personaAnalysis: any[]): string {
    const athleticPercentage = personaAnalysis.find(p => p.persona === 'Athletic Enthusiasts')?.percentage || 0;
    const professionalPercentage = personaAnalysis.find(p => p.persona === 'Fashion-Forward Professionals')?.percentage || 0;
    const premiumPercentage = personaAnalysis.find(p => p.persona === 'Premium Brand Loyalists')?.percentage || 0;
    
    if (athleticPercentage > 40) return 'Athletic-Dominant Market';
    if (professionalPercentage > 35) return 'Professional-Focused Market';
    if (premiumPercentage > 30) return 'Premium-Oriented Market';
    if (athleticPercentage + professionalPercentage > 50) return 'Active-Professional Mix';
    return 'Diverse Customer Profile Mix';
  }

  private processCustomerProfileFeatureImportance(rawFeatureImportance: any[]): any[] {
    return rawFeatureImportance.map(item => ({
      feature: item.feature || item.name || 'unknown',
      importance: Number(item.importance || item.value || 0),
      description: this.getCustomerProfileFeatureDescription(item.feature || item.name),
      profileImpact: this.assessCustomerProfileImpact(item.importance || 0)
    })).sort((a, b) => b.importance - a.importance);
  }

  private getCustomerProfileFeatureDescription(featureName: string): string {
    const descriptions: Record<string, string> = {
      'age': 'Age demographics and generational characteristics',
      'income': 'Income levels and purchasing power indicators',
      'lifestyle': 'Lifestyle patterns and activity preferences',
      'behavior': 'Purchase behavior and brand affinity patterns',
      'household': 'Household composition and family structure',
      'wealth': 'Wealth indicators and economic status',
      'nike': 'Nike brand affinity and market presence',
      'demographic': 'Core demographic alignment factors',
      'propensity': 'Purchase propensity and buying likelihood',
      'loyalty': 'Brand loyalty and retention indicators'
    };
    
    const lowerName = featureName.toLowerCase();
    for (const [key, desc] of Object.entries(descriptions)) {
      if (lowerName.includes(key)) {
        return desc;
      }
    }
    
    return `${featureName} customer profile characteristic`;
  }

  private assessCustomerProfileImpact(importance: number): string {
    if (importance >= 0.8) return 'Critical Profile Driver';
    if (importance >= 0.6) return 'Significant Profile Factor';
    if (importance >= 0.4) return 'Moderate Profile Influence';
    if (importance >= 0.2) return 'Minor Profile Factor';
    return 'Minimal Profile Impact';
  }

  private generateCustomerProfileSummary(
    records: GeographicDataPoint[], 
    customerProfileAnalysis: any, 
    rawSummary?: string
  ): string {
    const totalAreas = records.length;
    const profileLeaders = customerProfileAnalysis.profileLeaders;
    const emergingOpportunities = customerProfileAnalysis.emergingOpportunities;
    const personas = customerProfileAnalysis.personas;
    const marketDominance = customerProfileAnalysis.marketDominance;
    
    // Calculate baseline metrics
    const avgScore = records.reduce((sum, r) => sum + r.value, 0) / records.length;
    const avgDemographic = records.reduce((sum, r) => sum + (r.properties.demographic_alignment || 0), 0) / records.length;
    const avgLifestyle = records.reduce((sum, r) => sum + (r.properties.lifestyle_score || 0), 0) / records.length;
    const avgBehavioral = records.reduce((sum, r) => sum + (r.properties.behavioral_score || 0), 0) / records.length;
    const avgConfidence = records.reduce((sum, r) => sum + (r.properties.target_confidence || 0), 0) / records.length;
    
    // Start with customer profile scoring explanation
    let summary = `**👤 Customer Profile Formula (0-100 scale):**
• **Demographic Alignment (30% weight):** Age, income, household fit with Nike's target customer (16-45 years, $35K-$150K income)
• **Lifestyle Score (25% weight):** Activity patterns, wealth indicators, and lifestyle characteristics aligned with athletic/fashion brands
• **Behavioral Score (25% weight):** Brand affinity, purchase propensity, and loyalty indicators based on Nike market presence
• **Market Context Score (20% weight):** Market size, economic stability, competitive environment, and growth potential

Higher scores indicate stronger alignment with Nike's ideal customer profile across multiple dimensions.

`;
    
    // Customer profile baseline metrics
    summary += `**📊 Customer Profile Baseline:** `;
    summary += `Market average customer profile score: ${avgScore.toFixed(1)} (range: ${records[records.length - 1]?.value.toFixed(1) || '0'}-${records[0]?.value.toFixed(1) || '0'}). `;
    summary += `Component averages: ${avgDemographic.toFixed(1)} demographic alignment, ${avgLifestyle.toFixed(1)} lifestyle score, ${avgBehavioral.toFixed(1)} behavioral score. `;
    summary += `Average target confidence: ${avgConfidence.toFixed(1)}%.

`;
    
    // Customer profile distribution
    const idealProfile = records.filter(r => r.value >= 90).length;
    const strongProfile = records.filter(r => r.value >= 75).length;
    const goodProfile = records.filter(r => r.value >= 60).length;
    const moderateProfile = records.filter(r => r.value >= 45).length;
    
    summary += `Customer profile distribution: ${idealProfile} ideal matches (${(idealProfile/totalAreas*100).toFixed(1)}%), ${strongProfile} strong fits (${(strongProfile/totalAreas*100).toFixed(1)}%), ${goodProfile} good alignments (${(goodProfile/totalAreas*100).toFixed(1)}%), ${moderateProfile} moderate potential (${(moderateProfile/totalAreas*100).toFixed(1)}%).

`;
    
    summary += `**Customer Profile Analysis:** Analyzed ${totalAreas} geographic markets to identify customer profile strength and persona distribution. `;
    
    // Top customer profile markets
    if (profileLeaders.length > 0) {
      summary += `**Strongest Customer Profile Markets:** ${profileLeaders[0].area} leads with ${profileLeaders[0].score.toFixed(1)} profile score (${profileLeaders[0].persona}, ${profileLeaders[0].confidence.toFixed(1)}% confidence). `;
      
      if (profileLeaders.length > 1) {
        const additionalLeaders = profileLeaders.slice(1, 4);
        const leaderNames = additionalLeaders.map((leader: any) => 
          `${leader.area} (${leader.score.toFixed(1)}, ${leader.persona})`
        );
        summary += `Other top markets: ${leaderNames.join(', ')}. `;
      }
    }
    
    // Persona breakdown
    if (personas.length > 0) {
      const topPersonas = personas.sort((a: any, b: any) => b.percentage - a.percentage).slice(0, 3);
      summary += `**Primary Customer Personas:** `;
      
      topPersonas.forEach((persona: any, index: number) => {
        summary += `${persona.persona} (${persona.size} markets, ${persona.percentage.toFixed(1)}%, avg score ${persona.avgCustomerProfileScore.toFixed(1)})`;
        if (index < topPersonas.length - 1) summary += ', ';
        else summary += '. ';
      });
      
      // Top areas for dominant persona
      if (topPersonas[0] && topPersonas[0].topAreas.length > 0) {
        const topAreas = topPersonas[0].topAreas.slice(0, 3);
        summary += `Top ${topPersonas[0].persona} markets: ${topAreas.map((area: any) => `${area.name} (${area.score.toFixed(1)})`).join(', ')}. `;
      }
    }
    
    // Emerging opportunities
    if (emergingOpportunities.length > 0) {
      summary += `**Emerging Opportunities:** `;
      const topEmergingAreas = emergingOpportunities.slice(0, 4);
      summary += topEmergingAreas.map((opp: any) => 
        `${opp.area} (${opp.currentScore.toFixed(1)} score, ${opp.confidence.toFixed(1)}% confidence, ${opp.persona})`
      ).join(', ');
      summary += '. ';
    }
    
    // Market dominance insights
    summary += `Market structure: ${marketDominance.replace(/-/g, ' ')}. `;
    
    // Component analysis insights
    const strongDemographic = records.filter(r => (r.properties.demographic_alignment || 0) >= 70).length;
    const strongLifestyle = records.filter(r => (r.properties.lifestyle_score || 0) >= 70).length;
    const strongBehavioral = records.filter(r => (r.properties.behavioral_score || 0) >= 70).length;
    
    summary += `**Component Strengths:** ${strongDemographic} markets with strong demographic alignment (${(strongDemographic/totalAreas*100).toFixed(1)}%), ${strongLifestyle} with strong lifestyle scores (${(strongLifestyle/totalAreas*100).toFixed(1)}%), ${strongBehavioral} with strong behavioral indicators (${(strongBehavioral/totalAreas*100).toFixed(1)}%). `;
    
    // Strategic recommendations
    summary += `**Strategic Insights:** `;
    if (avgScore >= 70) {
      summary += `Strong overall customer profile landscape with high alignment across multiple markets. `;
    } else if (avgScore >= 50) {
      summary += `Moderate customer profile strength with significant opportunities for targeted development. `;
    } else {
      summary += `Developing customer profile landscape requiring focused persona-based strategies. `;
    }
    
    summary += `**Recommendations:** Prioritize ${strongProfile} strong-fit markets for immediate expansion. Develop persona-specific strategies for different customer segments. Focus on ${emergingOpportunities.length} emerging opportunity markets with high confidence scores. `;
    
    if (rawSummary) {
      summary += rawSummary;
    }
    
    return summary;
  }

  // ============================================================================
  // DIRECT RENDERING METHODS
  // ============================================================================

  /**
   * Create direct renderer for customer profile visualization
   */
  private createCustomerProfileRenderer(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use categorical colors for customer profile personas: Purple -> Blue -> Teal -> Green (high profile fit)
    const profileColors = [
      [142, 1, 82, 0.6],      // #8e0152 - Dark purple (low profile fit)
      [74, 119, 174, 0.6],    // #4a77ae - Blue  
      [62, 178, 188, 0.6],    // #3eb2bc - Teal
      [35, 139, 69, 0.6]      // #238b45 - Green (high profile fit)
    ];
    
    return {
      type: 'class-breaks',
      field: 'customer_profile_score',
      classBreakInfos: quartileBreaks.map((breakRange, i) => ({
        minValue: breakRange.min,
        maxValue: breakRange.max,
        symbol: {
          type: 'simple-fill',
          color: profileColors[i], // Direct array format
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
   * Create direct legend for customer profile
   */
  private createCustomerProfileLegend(records: any[]): any {
    const values = records.map(r => r.value).filter(v => !isNaN(v)).sort((a, b) => a - b);
    const quartileBreaks = this.calculateQuartileBreaks(values);
    
    // Use RGBA format with correct opacity to match features
    const colors = [
      'rgba(142, 1, 82, 0.6)',    // Low customer profile fit
      'rgba(74, 119, 174, 0.6)',  // Medium-low  
      'rgba(62, 178, 188, 0.6)',  // Medium-high
      'rgba(35, 139, 69, 0.6)'    // High customer profile fit
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
      title: 'Customer Profile Score',
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
}