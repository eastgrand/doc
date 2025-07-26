/**
 * Analysis-Specific Prompts for Claude API
 * 
 * These prompts provide technical analysis context and requirements
 * separate from persona perspectives. They ensure Claude understands
 * the specific analysis logic and data structure for each endpoint.
 */

export const analysisPrompts = {
  competitive_analysis: `
COMPETITIVE ANALYSIS TECHNICAL CONTEXT:
You are analyzing competitive advantage data with pre-calculated scores (1-10 scale).

DATA STRUCTURE:
- competitive_advantage_score: Primary ranking metric (1-10 scale)
- market_share_context: Supporting data for explanation only
- Nike, Adidas, Jordan, etc. market share percentages: Context, NOT for ranking

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by competitive_advantage_score (1-10)
2. NEVER rank by raw market share percentages
3. Use market share data only to EXPLAIN WHY certain areas have high competitive scores
4. Focus on expansion opportunities, not current market dominance
5. Scores incorporate: market dominance + demographic alignment + competitive pressure + category strength

ANALYSIS FOCUS:
- Identify markets with high competitive advantage scores for expansion
- Explain the underlying factors driving competitive advantages
- Recommend strategic expansion priorities based on competitive positioning
`,

  demographic_insights: `
DEMOGRAPHIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing demographic data to identify market opportunities based on population characteristics.

DATA STRUCTURE:
- Population segments, age groups, income levels
- Lifestyle and psychographic indicators
- Demographic trend data and projections

CRITICAL REQUIREMENTS:
1. Focus on population segments that align with target customer profiles
2. Identify demographic trends that create market opportunities
3. Analyze income levels, age distributions, and lifestyle factors
4. Consider demographic momentum and growth patterns

ANALYSIS FOCUS:
- Identify optimal demographic markets for expansion
- Explain demographic drivers of market potential
- Recommend targeting strategies based on population characteristics
`,

  trend_analysis: `
TREND ANALYSIS TECHNICAL CONTEXT:
You are analyzing trend strength data to identify markets with strong temporal patterns and growth momentum.

DATA STRUCTURE:
- trend_strength_score: Primary ranking metric (0-100 scale)
- growth_potential: Market growth trajectory indicators
- trend_consistency: Performance stability over time
- volatility_index: Market predictability measures

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by trend_strength_score (0-100)
2. Focus on temporal patterns, growth momentum, and consistency
3. Identify markets with strong upward trends and growth potential
4. Explain trend drivers: consistency, growth rate, market position, volatility
5. Distinguish between strong trends vs volatile/unpredictable markets

ANALYSIS FOCUS:
- Identify markets with strongest trend patterns for strategic investment
- Explain underlying factors driving trend strength and consistency
- Recommend timing strategies based on growth momentum and volatility
- Highlight markets with sustainable vs temporary trend patterns
`,

  anomaly_detection: `
ANOMALY DETECTION TECHNICAL CONTEXT:
You are analyzing anomaly detection data to identify statistical outliers and unusual market patterns.

DATA STRUCTURE:
- anomaly_detection_score: Primary ranking metric (0-100 scale)
- statistical_deviation: Deviation from population statistical norms
- pattern_anomaly_level: Unusual relationships between metrics
- performance_outlier_level: Extreme performance indicators
- context_anomaly_level: Inconsistent contextual patterns

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by anomaly_detection_score (0-100)
2. Focus on identifying unusual patterns, outliers, and exceptions
3. Explain the type and nature of anomalies detected
4. Distinguish between data quality issues vs legitimate market exceptions
5. Provide investigation priorities based on anomaly severity and type

ANALYSIS FOCUS:
- Identify markets with highest anomaly scores for investigation
- Explain underlying factors causing anomalous patterns
- Recommend data validation and investigation priorities
- Highlight exceptional markets that deviate from normal patterns
`,

  feature_interactions: `
FEATURE INTERACTION TECHNICAL CONTEXT:
You are analyzing feature interaction data to identify complex relationships and synergistic effects between multiple market variables.

DATA STRUCTURE:
- feature_interaction_score: Primary ranking metric (0-100 scale)
- correlation_strength: Strength of correlations between variables
- synergy_effect: Combined effects stronger than individual effects
- interaction_complexity: Multi-variable interaction complexity
- non_linear_patterns: Non-linear relationships and threshold effects

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by feature_interaction_score (0-100)
2. Focus on complex relationships and synergistic effects between variables
3. Identify markets where multiple variables interact strongly
4. Explain the types and nature of interactions (correlation, synergy, non-linear)
5. Distinguish between simple correlations vs complex multi-variable interactions

ANALYSIS FOCUS:
- Identify markets with strongest multi-variable interactions
- Explain synergistic effects and variable combinations
- Recommend multi-channel strategies leveraging variable interactions
- Highlight non-linear patterns and threshold effects requiring specialized approaches
`,

  outlier_detection: `
OUTLIER DETECTION TECHNICAL CONTEXT:
You are analyzing outlier detection data to identify geographic areas with exceptional performance or characteristics that stand out significantly from typical patterns.

DATA STRUCTURE:
- outlier_detection_score: Primary ranking metric (0-100 scale)
- statistical_outlier_level: Statistical deviation from population norms
- performance_extreme_level: Exceptional high or low performance levels
- contextual_uniqueness_level: Unique characteristics within context
- rarity_level: Rare combinations of characteristics

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by outlier_detection_score (0-100)
2. Focus on identifying exceptional areas that stand out from typical patterns
3. Distinguish between statistical outliers vs exceptional performance opportunities
4. Explain what makes each outlier unique or exceptional
5. Categorize outliers by type (statistical, performance, contextual, rare combinations)

ANALYSIS FOCUS:
- Identify markets with highest outlier scores for investigation and opportunity assessment
- Explain the specific characteristics that make each area exceptional
- Recommend specialized strategies for outlier markets with unique characteristics
- Highlight statistical outliers requiring data validation vs genuine exceptional markets
`,

  comparative_analysis: `
COMPARATIVE ANALYSIS TECHNICAL CONTEXT:
You are analyzing comparative analysis data to identify relative performance between different brands, regions, or market characteristics and competitive positioning opportunities.

DATA STRUCTURE:
- comparative_analysis_score: Primary ranking metric (0-100 scale)
- brand_performance_gap: Nike vs competitors performance differential
- market_position_strength: Relative market positioning and dominance
- competitive_dynamics_level: Competitive pressure and market share dynamics
- growth_differential: Relative growth potential and trend momentum
- nike_dominance: Nike market share advantage/disadvantage vs competitors

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by comparative_analysis_score (0-100)
2. Focus on relative performance and competitive positioning between brands
3. Analyze Nike vs competitor performance gaps and market dominance patterns
4. Identify competitive advantages and disadvantages in different markets
5. Distinguish between brand performance gaps vs market position strengths

ANALYSIS FOCUS:
- Identify markets with strongest competitive advantages for strategic expansion
- Explain brand performance differentials and competitive positioning
- Recommend competitive strategies based on market dominance patterns
- Highlight markets where Nike leads vs trails competitors and why
`,

  spatial_clusters: `
SPATIAL CLUSTERING TECHNICAL CONTEXT:
You are analyzing geographic clustering results showing areas with similar characteristics.

DATA STRUCTURE:
- Cluster assignments (categorical groupings)
- Cluster characteristics and profiles
- Geographic patterns and concentrations

CRITICAL REQUIREMENTS:
1. Explain what each cluster represents in business terms
2. Identify which clusters offer the best opportunities
3. Analyze geographic patterns within and between clusters
4. Focus on cluster characteristics that drive business value

ANALYSIS FOCUS:
- Describe cluster profiles in actionable business terms
- Identify high-value clusters for strategic focus
- Explain geographic concentration patterns and their implications
`,

  correlation_analysis: `
CORRELATION ANALYSIS TECHNICAL CONTEXT:
You are analyzing statistical relationships between variables to identify market drivers.

DATA STRUCTURE:
- Correlation coefficients between variables
- Relationship strength indicators
- Variable interaction patterns

CRITICAL REQUIREMENTS:
1. Explain correlation strength in practical business terms
2. Distinguish between correlation and causation
3. Focus on actionable relationships that inform strategy
4. Identify key market drivers and their impacts

ANALYSIS FOCUS:
- Identify strongest market relationships and their business implications
- Explain which factors drive performance and how
- Recommend strategies based on correlation insights
`,

  risk_assessment: `
RISK ASSESSMENT TECHNICAL CONTEXT:
You are analyzing risk factors and risk scores to identify market threats and opportunities.

DATA STRUCTURE:
- Risk scores by category and geography
- Risk factor contributions
- Risk mitigation indicators

CRITICAL REQUIREMENTS:
1. Clearly explain risk levels and their business impact
2. Identify both threats to avoid and calculated risks worth taking
3. Provide risk mitigation strategies
4. Balance risk against opportunity potential

ANALYSIS FOCUS:
- Categorize risk levels and their strategic implications
- Identify risk factors that can be mitigated vs. avoided
- Recommend risk-adjusted opportunity prioritization
`,

  predictive_modeling: `
PREDICTIVE MODELING TECHNICAL CONTEXT:
You are analyzing predictive modeling data to identify markets with high forecasting reliability and prediction confidence for strategic planning.

DATA STRUCTURE:
- predictive_modeling_score: Primary ranking metric (0-100 scale)
- model_confidence_level: Prediction confidence assessment (High/Moderate/Low)
- forecast_reliability: Forecast accuracy potential (Excellent/Good/Fair/Limited)
- pattern_stability: Historical pattern consistency for reliable predictions
- data_quality_index: Data completeness score affecting model reliability
- prediction_confidence: Overall prediction confidence level
- forecast_horizon_strength: Suitable prediction timeframe (Long/Medium/Short-term)

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by predictive_modeling_score (0-100)
2. Focus on prediction reliability, model confidence, and forecast accuracy potential
3. Identify markets with highest predictability for strategic planning and investment
4. Explain predictive model components: confidence, reliability, stability, data quality
5. Distinguish between high-confidence predictions vs speculative forecasts

ANALYSIS FOCUS:
- Identify markets with strongest predictive modeling potential for planning
- Explain model confidence levels and forecast reliability factors
- Recommend prediction-based strategies for high-confidence markets
- Highlight data quality and pattern stability affecting prediction accuracy
`,

  segment_profiling: `
SEGMENT PROFILING TECHNICAL CONTEXT:
You are analyzing segment profiling data to identify markets with strong customer segmentation potential and distinct segment characteristics.

DATA STRUCTURE:
- segment_profiling_score: Primary ranking metric (0-100 scale)
- demographic_distinctiveness: How distinct demographic characteristics are (Very High/High/Moderate/Low)
- behavioral_clustering_strength: Strength of behavioral patterns for grouping (Strong/Moderate/Weak/Limited)
- market_segment_strength: Natural market segments and clustering potential (Excellent/Good/Fair/Limited)  
- primary_segment_type: Identified segment category (Premium Nike Loyalists, Affluent Nike Consumers, etc.)
- segment_size: Market size category (Large/Medium-Large/Medium/Small-Medium/Small)
- nike_segment_affinity: Nike brand affinity level (Very High/High/Moderate/Low Affinity)
- recommended_segment_strategy: Strategic approach for this segment type

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by segment_profiling_score (0-100)
2. Focus on segmentation potential, demographic distinctiveness, and behavioral clustering
3. Identify markets with clear, actionable customer segments for targeted marketing
4. Explain segment characteristics: demographics, behaviors, income levels, brand affinity
5. Distinguish between clear segment profiles vs mixed/unclear segmentation potential

ANALYSIS FOCUS:
- Identify markets with strongest segmentation potential for targeted marketing strategies
- Explain primary segment types and their distinctive characteristics
- Recommend segment-specific strategies based on demographic and behavioral patterns
- Highlight markets with clear segment profiles vs those requiring more complex segmentation approaches
`,

  scenario_analysis: `
SCENARIO ANALYSIS TECHNICAL CONTEXT:
You are analyzing scenario analysis data to identify markets with strong scenario planning capabilities and strategic adaptability.

DATA STRUCTURE:
- scenario_analysis_score: Primary ranking metric (0-100 scale)
- scenario_adaptability_level: Market adaptability to different scenarios (Highly/Well/Moderately Adaptable)
- market_resilience_strength: Resilience across market conditions (Very Resilient/Resilient/Moderately Resilient)
- strategic_flexibility_rating: Strategic pivot capability (High/Moderate/Limited/Low Flexibility)
- primary_scenario_type: Scenario category (High-Potential, Trend-Resilient, Market-Stable, etc.)
- scenario_planning_maturity: Planning capability level (Advanced/Intermediate/Basic/Limited)
- strategic_pivot_potential: Ability to change strategies (High/Moderate/Limited/Low Pivot Potential)
- recommended_scenario_approach: Strategic planning method for this market type

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by scenario_analysis_score (0-100)
2. Focus on scenario adaptability, market resilience, and strategic flexibility
3. Identify markets best suited for comprehensive scenario planning and strategic pivots
4. Explain scenario capabilities: adaptability factors, resilience strengths, flexibility dimensions
5. Distinguish between high-adaptability markets vs rigid/inflexible markets

ANALYSIS FOCUS:
- Identify markets with strongest scenario planning potential for strategic decision-making
- Explain adaptability factors and resilience characteristics enabling scenario flexibility
- Recommend scenario-based strategies tailored to each market's adaptability profile
- Highlight markets ready for advanced scenario modeling vs those requiring simpler planning approaches
`,

  market_sizing: `
MARKET SIZING TECHNICAL CONTEXT:
You are analyzing market sizing data to identify markets with the largest strategic opportunities and revenue potential.

DATA STRUCTURE:
- market_sizing_score: Primary ranking metric (0-100 scale)
- market_category: Market size classification (Mega/Large/Medium-Large/Medium/Small Market)
- opportunity_size: Opportunity assessment (Massive/Large/Moderate/Limited Opportunity)
- revenue_potential: Revenue generation potential (High/Moderate/Limited Revenue Potential)
- population: Total market population size
- median_income: Market income levels affecting purchasing power

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by market_sizing_score (0-100)
2. Focus on total market opportunity size, growth potential, and revenue potential
3. Identify markets with largest addressable market opportunities for strategic investment
4. Explain market size factors: population scale, income levels, growth trajectory, market quality
5. Distinguish between large market opportunities vs limited market potential

ANALYSIS FOCUS:
- Identify markets with largest strategic opportunity size for major investment decisions
- Explain market opportunity factors and revenue potential characteristics
- Recommend market entry strategies based on market size and opportunity assessment
- Highlight mega market opportunities vs smaller niche market potential
`,

  brand_analysis: `
BRAND ANALYSIS TECHNICAL CONTEXT:
You are analyzing brand analysis data to identify markets with strongest Nike brand opportunities and competitive positioning.

DATA STRUCTURE:
- brand_analysis_score: Primary ranking metric (0-100 scale)
- nike_market_share: Current Nike market share percentage
- brand_strength_level: Nike brand position (Market Leader/Strong Position/Established/Emerging/Developing)
- market_position: Overall market positioning strength (Premium/Strong/Moderate/Developing)
- competitive_landscape: Competition level (Highly Competitive/Competitive/Moderately Competitive/Low Competition)
- brand_opportunity: Growth strategy type (Brand Expansion/Market Penetration/Brand Strengthening/Brand Development)

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by brand_analysis_score (0-100)
2. Focus on Nike brand strength, market positioning, and competitive landscape analysis
3. Identify markets with strongest brand opportunities for Nike investment and growth
4. Explain brand factors: current Nike presence, market position quality, competitive dynamics
5. Distinguish between strong brand markets vs emerging brand development opportunities

ANALYSIS FOCUS:
- Identify markets with strongest Nike brand potential for strategic brand investment
- Explain brand positioning factors and competitive landscape characteristics
- Recommend brand strategies based on current Nike presence and market position strength
- Highlight dominant brand markets vs emerging brand development opportunities
`,

  real_estate_analysis: `
REAL ESTATE ANALYSIS TECHNICAL CONTEXT:
You are analyzing real estate analysis data to identify optimal retail locations for Nike store placement and property investment.

DATA STRUCTURE:
- real_estate_analysis_score: Primary ranking metric (0-100 scale)
- location_quality: Location assessment (Premium/High-Quality/Good/Standard Location)
- demographic_fit: Target demographic alignment (Excellent/Strong/Good/Moderate Match)
- market_accessibility: Market access level (Highly Accessible/Accessible/Moderately Accessible/Limited)
- foot_traffic_potential: Expected customer traffic (High/Moderate/Limited/Low Foot Traffic)
- retail_suitability: Store type recommendation (Flagship/Full Store/Standard/Outlet/Limited Potential)
- investment_priority: Investment recommendation (High/Medium/Low Priority/Monitor Only)

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by real_estate_analysis_score (0-100)
2. Focus on location quality, demographic fit, market accessibility, and retail suitability
3. Identify optimal real estate locations for Nike retail store placement and investment
4. Explain location factors: quality assessment, demographic alignment, accessibility, foot traffic
5. Distinguish between prime real estate opportunities vs limited location potential

ANALYSIS FOCUS:
- Identify locations with strongest real estate potential for Nike retail investment
- Explain location quality factors and demographic fit characteristics
- Recommend real estate strategies based on location assessment and retail suitability
- Highlight prime flagship locations vs standard store opportunities vs limited potential areas
`,

  market_penetration: `
MARKET PENETRATION TECHNICAL CONTEXT:
You are analyzing market penetration opportunities and penetration scores.

DATA STRUCTURE:
- Current penetration levels
- Penetration opportunity scores
- Market saturation indicators

CRITICAL REQUIREMENTS:
1. Focus on penetration potential, not current penetration levels
2. Identify underserved markets with growth potential
3. Explain factors that enable or limit penetration
4. Prioritize by penetration opportunity scores

ANALYSIS FOCUS:
- Identify markets with highest penetration potential
- Explain barriers and enablers to market penetration
- Recommend penetration strategies by market type
`,

  strategic_analysis: `
STRATEGIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data with pre-calculated scores for market expansion opportunities.

DATA STRUCTURE:
- strategic_value_score: Primary ranking metric (precise decimal values like 79.34, 79.17)
- market_gap: Untapped market potential percentages
- demographic_fit: Population alignment indicators
- expansion_potential: Growth opportunity scores

CRITICAL REQUIREMENTS:
1. ALWAYS preserve exact score precision - use 79.34, NOT 79.3 or 79.30
2. When you see a target_value like 79.34, you MUST report it as 79.34, not 79.30
3. DO NOT round strategic value scores - report them EXACTLY as provided in the data
4. Rank and prioritize by strategic_value_score with full decimal places
5. Use market gap and demographic data to EXPLAIN WHY certain areas have high strategic scores
6. Focus on expansion opportunities, not current market dominance
7. Scores incorporate: market potential + demographic alignment + competitive landscape + growth capacity

IMPORTANT: The data contains precise decimal values. When you see target_value: 79.34, you must write "79.34" in your response, NOT "79.30". This precision is critical for accurate analysis.

ANALYSIS FOCUS:
- Identify markets with highest strategic value scores for expansion
- Explain the underlying factors driving strategic advantages
- Recommend strategic expansion priorities based on precise scoring
- Preserve all decimal precision in score reporting for accuracy
`,

  general: `
GENERAL ANALYSIS TECHNICAL CONTEXT:
You are analyzing geographic data patterns to identify market opportunities and insights.

DATA STRUCTURE:
- Geographic data points with associated metrics
- Performance indicators and rankings
- Market characteristics and attributes

CRITICAL REQUIREMENTS:
1. Focus on actionable business insights from geographic patterns
2. Identify high-potential markets and opportunity areas
3. Explain underlying factors driving performance differences
4. Provide strategic recommendations based on data patterns

ANALYSIS FOCUS:
- Identify markets with highest potential based on data patterns
- Explain geographic trends and their business implications
- Recommend strategies based on geographic insights
`,

  default: `
ANALYSIS TECHNICAL CONTEXT:
You are analyzing geographic and market data to provide strategic insights.

CRITICAL REQUIREMENTS:
1. Focus on actionable business insights
2. Rank and prioritize based on the primary scoring metric
3. Explain underlying factors driving performance
4. Provide strategic recommendations

ANALYSIS FOCUS:
- Identify high-potential opportunities
- Explain key performance drivers
- Recommend strategic actions based on data insights
`
};

/**
 * Get analysis-specific prompt based on analysis type
 */
export function getAnalysisPrompt(analysisType: string): string {
  // Normalize analysis type
  const normalizedType = analysisType?.toLowerCase().replace(/-/g, '_') || 'default';
  
  // Map common analysis type variations
  const typeMapping: Record<string, string> = {
    'competitive': 'competitive_analysis',
    'demographic': 'demographic_insights',
    'cluster': 'spatial_clusters',
    'clustering': 'spatial_clusters',
    'correlation': 'correlation_analysis',
    'risk': 'risk_assessment',
    'predictive': 'predictive_modeling',
    'prediction': 'predictive_modeling',
    'penetration': 'market_penetration',
    'strategic': 'strategic_analysis',
    'strategy': 'strategic_analysis',
    'analyze': 'general',
    'analysis': 'general'
  };

  const mappedType = typeMapping[normalizedType] || normalizedType;
  
  return analysisPrompts[mappedType as keyof typeof analysisPrompts] || analysisPrompts.default;
}

/**
 * Get available analysis types
 */
export function getAvailableAnalysisTypes(): string[] {
  return Object.keys(analysisPrompts).filter(key => key !== 'default');
}