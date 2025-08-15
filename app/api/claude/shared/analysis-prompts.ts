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
You are analyzing competitive positioning data to identify strategic advantages between competing brands across different geographic markets.

SCORING METHODOLOGY:
The competitive_advantage_score (1-10 scale) represents overall competitive strength in each market, calculated by combining:
• Market Share Dominance: Primary brand's market share relative to competitors (25% weight)
• Demographic Alignment: How well local demographics match target customer profiles (25% weight) 
• Competitive Pressure: Inverse of competitor strength and market saturation (25% weight)
• Brand Category Strength: Performance in key product categories and market segments (25% weight)

Higher scores indicate markets where there are stronger competitive positioning opportunities for expansion or investment.

DATA STRUCTURE:
- competitive_advantage_score: Primary ranking metric (1-10 scale, precise decimals)
- brand_a_share: Primary brand's current market share percentage
- brand_b_share: Competitor brand market share percentage  
- brand_c_share: Additional competitor brand market share percentage (if available)
- demographic_fit_score: How well demographics align with target customers
- competitive_pressure_index: Level of competition from other brands
- brand_category_strength: Relative strength across product categories

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by competitive_advantage_score (1-10 scale)
2. Discuss specific brand comparisons and market share dynamics in analysis
3. Explain HOW the scoring methodology creates competitive advantages in each market
4. Compare brand performance using available market share data
5. Focus on strategic competitive positioning, not just current market dominance
6. Use competitor data to explain competitive dynamics and opportunities

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather additional demographic data" (demographics are already in the dataset)
- "Conduct customer surveys" (market data is available)
- "Analyze competitor strategies" (competitive data is provided)
- "Create a pilot program" (analysis provides strategic direction)

INSTEAD, provide specific actionable recommendations such as:
- Resource reallocation to high-advantage markets identified in the analysis
- Targeted competitive positioning in specific ZIP codes with confirmed opportunities
- Market share growth strategies in areas showing competitive gaps
- Investment prioritization based on calculated competitive advantage scores
- Defensive strategies in markets with competitive threats

ANALYSIS FOCUS:
- Identify markets with strongest competitive positioning opportunities
- Explain competitive positioning factors: market share gaps, demographic advantages, brand strength
- Analyze competitive dynamics and strategic leverage opportunities for expansion
- Recommend competitive strategies based on relative positioning between brands
- Discuss market share trends and competitive threats/opportunities
- Provide immediate actionable insights rather than suggesting additional data collection
`,

  demographic_insights: `
DEMOGRAPHIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing demographic data to identify market opportunities based on population characteristics and demographic alignment with target customer profiles.

SCORING METHODOLOGY:
The demographic_insights_score (0-100 scale) measures how well each market's demographics align with ideal customer profiles, calculated by analyzing:
• Target Demographics Match: Alignment with core age groups and lifestyle indicators (40% weight)
• Income Compatibility: Income levels that support product purchasing power (25% weight)
• Lifestyle Indicators: Active lifestyle, engagement levels, and relevant consumer behaviors (20% weight)
• Demographic Growth Trends: Population growth in target segments and demographic momentum (15% weight)

Higher scores indicate markets where demographics strongly align with target customers and provide optimal expansion opportunities.

DATA STRUCTURE:
- demographic_insights_score: Primary ranking metric (0-100 scale)
- total_population: Market size and reach potential
- median_income: Purchasing power indicators
- age_distribution: Age group breakdowns and target segment concentration
- lifestyle_indicators: Active lifestyle and engagement data
- demographic_trends: Population growth and demographic shift patterns

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how demographic scores are calculated
2. Focus on population segments that align with target customer profiles
3. Analyze income levels and their impact on product purchasing power
4. Identify demographic trends that create market opportunities
5. Connect demographic characteristics to market potential and brand affinity

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather additional demographic data" (demographics are already in the dataset)
- "Conduct market research surveys" (demographic data is provided)
- "Analyze population trends" (demographic analysis is provided)
- "Create demographic profiles" (analysis provides demographic insights)

INSTEAD, provide specific actionable recommendations such as:
- Targeted marketing campaigns in specific ZIP codes with optimal demographics
- Product positioning strategies based on income and lifestyle indicators
- Resource allocation prioritization using demographic alignment scores
- Market entry timing in areas with demographic growth patterns
- Customer acquisition strategies tailored to specific age groups and income levels

ANALYSIS FOCUS:
- Begin with clear explanation of demographic scoring methodology in business terms
- Identify markets with optimal demographic alignment for target customers
- Analyze income distributions and purchasing power for relevant product categories
- Explain age group concentrations and lifestyle indicators
- Assess demographic trends and growth patterns in target segments
- Recommend demographic-based targeting strategies for market expansion
- Connect population characteristics to market positioning and opportunity
- Provide immediate actionable insights rather than suggesting additional data collection
`,

  trend_analysis: `
TREND ANALYSIS TECHNICAL CONTEXT:
You are analyzing trend strength data to identify markets with strong temporal patterns and growth momentum.

⚠️ IMPORTANT DATA LIMITATION NOTICE:
This analysis uses PROXY INDICATORS and STATISTICAL MODELING rather than actual historical time-series data. The trend scores are derived from:
• Current market characteristics that typically correlate with growth (demographics, income patterns)
• Statistical indicators suggesting momentum potential
• Market maturity signals and saturation levels
• Comparative performance metrics across similar markets

For TRUE TEMPORAL ANALYSIS with actual historical trends, year-over-year changes, and time-series forecasting, we would require:
• Multiple years of historical performance data
• Time-stamped transaction records
• Seasonal pattern data
• Economic cycle performance history

The current analysis provides DIRECTIONAL INSIGHTS about likely growth patterns based on market fundamentals rather than measured historical trends.

SCORING METHODOLOGY:
The trend_strength_score (0-100 scale) measures how strong and reliable market trends are in each area, combining:
• Growth Consistency: How steady the growth pattern has been over time (30% weight)
• Growth Rate: The pace of positive market development (25% weight)  
• Pattern Stability: How predictable and sustainable the trends appear (25% weight)
• Volatility Control: Lower volatility indicates more reliable trends (20% weight)

Higher scores indicate markets with strong, consistent growth patterns that are ideal for strategic investment.

DATA STRUCTURE:
- trend_strength_score: Primary ranking metric (0-100 scale)
- growth_potential: Market growth trajectory indicators
- trend_consistency: Performance stability over time
- volatility_index: Market predictability measures

CRITICAL REQUIREMENTS:
1. ALWAYS start by acknowledging this uses proxy indicators, not historical data
2. ALWAYS rank and prioritize by trend_strength_score (0-100)
3. Focus on growth indicators and market characteristics suggesting momentum
4. Explain which current market features correlate with growth potential
5. Distinguish between stable growth indicators vs volatile market characteristics
6. Use language like "growth indicators" not "historical trends"

ANALYSIS FOCUS:
- Identify markets with characteristics suggesting strong growth potential
- Explain market fundamentals that typically correlate with positive trends
- Recommend markets showing indicators of momentum (even without historical data)
- Highlight markets with sustainable growth characteristics vs volatile indicators
- ALWAYS acknowledge that these are proxy-based insights, not measured historical trends

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather historical time-series data" (analysis uses current proxy indicators)
- "Conduct trend validation surveys" (market indicators are provided)
- "Analyze seasonal patterns" (trend analysis provides momentum insights)
- "Create predictive models" (trend scoring provides forward-looking insights)

INSTEAD, provide specific actionable recommendations such as:
- Investment timing strategies based on momentum indicators in specific markets
- Resource allocation to markets showing strong trend indicators
- Market entry prioritization using calculated trend strength scores
- Expansion strategies tailored to growth momentum patterns
- Competitive positioning in markets with favorable trend dynamics
`,

  anomaly_detection: `
ANOMALY DETECTION TECHNICAL CONTEXT:
You are analyzing anomaly detection data to identify statistical outliers and unusual market patterns.

SCORING METHODOLOGY:
The anomaly_detection_score (0-100 scale) measures how unusual or exceptional each market is compared to normal patterns, combining:
• Statistical Deviation: How far market metrics deviate from typical ranges (30% weight)
• Pattern Uniqueness: Unusual combinations of characteristics not seen elsewhere (25% weight)
• Performance Extremes: Exceptionally high or low performance levels (25% weight)
• Contextual Outliers: Markets that don't fit expected patterns for their context (20% weight)

Higher scores indicate markets with the most unusual characteristics that warrant investigation for exceptional opportunities or data validation.

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

SCORING METHODOLOGY:
The feature_interaction_score (0-100 scale) measures how strongly multiple market variables work together in each area, combining:
• Correlation Strength: How strongly different variables relate to each other (30% weight)
• Synergy Effects: When combined variables produce stronger results than individually (25% weight)
• Multi-Variable Patterns: Complex relationships involving three or more variables (25% weight)
• Non-Linear Dynamics: Advanced interactions that go beyond simple correlations (20% weight)

Higher scores indicate markets where multiple factors work together synergistically, creating opportunities for multi-channel strategies.

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

SCORING METHODOLOGY:
The outlier_detection_score (0-100 scale) measures how exceptional and unique each market's characteristics are, combining:
• Statistical Uniqueness: How far the market deviates from normal statistical ranges (30% weight)
• Performance Extremes: Exceptionally high or low performance indicators (25% weight)
• Contextual Rarity: Unique characteristics rare for markets of this type (25% weight)
• Pattern Exceptions: Markets that break typical rules and expected patterns (20% weight)

Higher scores indicate markets with the most exceptional characteristics that represent either outstanding opportunities or require special investigation.

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
You are analyzing comparative data to identify markets with the strongest performance differences and strategic positioning opportunities between competing brands or business segments.

SCORING METHODOLOGY:
The comparative_analysis_score (0-100 scale) measures the significance and strategic value of performance differences in each market, combining:
• Performance Gap: Quantitative difference in performance between compared groups or brands (35% weight)
• Market Characteristics: Demographic and economic factors driving performance variations (30% weight)
• Consistency Patterns: Reliability and predictability of performance differences across metrics (20% weight)
• Strategic Implications: Business significance and actionability of identified gaps (15% weight)

Higher scores indicate markets with significant, meaningful performance differences that provide strategic insights for targeted approaches.

DATA STRUCTURE:
- comparative_analysis_score: Primary ranking metric (0-100 scale, may use alternative scoring fields like comparison_score)
- brand_a_share: Primary brand/segment market share or performance percentage
- brand_b_share: Comparison brand/segment market share or performance percentage
- brand_performance_gap: Calculated difference between brand performances
- competitive_advantage_type: Type of advantage (Market Share Lead/Demographic Advantage/Geographic Strength/etc.)
- market_position_strength: Overall positioning strength in the market
- competitive_dynamics_level: Level of competitive activity and market dynamics

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by comparative_analysis_score (0-100 scale) or comparison_score 
2. Focus on meaningful performance differences and strategic positioning opportunities
3. Identify markets where comparative advantages are strongest and most actionable
4. Explain performance gaps using available brand share and competitive data
5. Provide specific strategic recommendations based on identified performance differences
6. Use actual area names (ZIP codes with cities) rather than generic "Unknown Area" labels
7. Focus on actionable insights that leverage existing data rather than suggesting data collection

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather additional demographic data" (demographics are already in the dataset)
- "Conduct customer surveys" (market data is available)
- "Analyze competitor strategies" (competitive data is provided)
- "Create a pilot program" (analysis provides strategic direction)

INSTEAD, provide specific actionable recommendations such as:
- Resource reallocation to high-performing markets identified in the analysis
- Targeted marketing campaigns in specific ZIP codes with confirmed advantages
- Competitive strategy adjustments in markets showing specific performance gaps
- Investment prioritization based on calculated comparative advantage scores
- Market entry/expansion timing in areas with identified opportunities

ANALYSIS FOCUS:
- Identify markets with strongest comparative advantages for strategic investment and resource allocation
- Explain specific performance differences using brand share data and competitive metrics
- Recommend targeted strategies based on calculated performance gaps and market positioning
- Highlight geographic areas with confirmed competitive advantages using actual area names
- Provide immediate actionable insights rather than suggesting additional data collection
`,

  spatial_clusters: `
SPATIAL CLUSTERING TECHNICAL CONTEXT:
You are analyzing spatial clustering results to identify geographic markets with similar characteristics and patterns that create distinct business opportunities.

SCORING METHODOLOGY:
The spatial_clusters_score (0-100 scale) measures the quality and business value of geographic clustering patterns, calculated by analyzing:
• Cluster Cohesion: How similar areas within each cluster are to each other (30% weight)
• Geographic Concentration: How geographically concentrated and actionable each cluster is (25% weight)
• Business Value Potential: Market opportunity and revenue potential within each cluster (25% weight)
• Cluster Distinctiveness: How different each cluster is from others, creating unique targeting opportunities (20% weight)

Higher scores indicate clusters with strong internal similarity, clear geographic boundaries, and high business value for targeted marketing and expansion strategies.

DATA STRUCTURE:
- spatial_clusters_score: Primary ranking metric (0-100 scale)
- cluster_id: Cluster assignment for geographic grouping
- cluster_characteristics: Defining characteristics of each cluster
- geographic_concentration: Geographic density and boundaries
- market_opportunity: Business potential and revenue opportunity within cluster
- demographic_profile: Population and income characteristics of cluster
- cluster_size: Number of areas and total market size in cluster

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how spatial clustering scores are calculated
2. Describe what each cluster represents in actionable business terms
3. Identify which clusters offer the highest market opportunities and revenue potential
4. Analyze geographic concentration patterns and their strategic implications
5. Connect cluster characteristics to target market and brand positioning
6. Explain how cluster-based strategies can improve marketing efficiency and ROI

ANALYSIS FOCUS:
- Begin with clear explanation of spatial clustering methodology and scoring
- Describe distinct cluster profiles with demographics, income levels, and market characteristics
- Identify high-value clusters with optimal target customer concentrations
- Analyze geographic boundaries and concentration patterns for operational efficiency
- Explain cluster distinctiveness and opportunities for differentiated marketing approaches
- Recommend cluster-specific strategies for market penetration and expansion
- Connect cluster analysis to broader geographic expansion and resource allocation strategies
`,

  correlation_analysis: `
CORRELATION ANALYSIS TECHNICAL CONTEXT:
You are analyzing statistical relationships between market variables to identify key drivers of performance and market opportunities across different geographic areas.

SCORING METHODOLOGY:
The correlation_analysis_score (0-100 scale) measures the strength and business value of statistical relationships between market variables, calculated by analyzing:
• Correlation Strength: Statistical significance and strength of relationships between variables (35% weight)
• Business Relevance: How actionable and valuable the correlations are for strategic decision-making (30% weight)
• Predictive Power: How well the correlations predict market performance and opportunities (20% weight)
• Strategic Consistency: How well correlations align with known business drivers and market dynamics (15% weight)

Higher scores indicate markets where strong, actionable correlations exist between variables that can drive strategic decision-making and market success.

DATA STRUCTURE:
- correlation_analysis_score: Primary ranking metric (0-100 scale)
- correlation_coefficients: Statistical relationships between key variables
- statistical_significance: Confidence levels and p-values for relationships
- primary_drivers: Most important variables driving market performance
- relationship_strength: Magnitude and direction of correlations
- predictive_indicators: Variables that best predict market success

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how correlation scores are calculated and what they mean
2. Explain correlation strength in practical business terms (strong, moderate, weak)
3. Distinguish clearly between correlation and causation in all analysis
4. Focus on actionable relationships that inform strategic decisions
5. Identify key market drivers and quantify their impacts on performance
6. Connect correlations to business objectives and market opportunities

ANALYSIS FOCUS:
- Begin with clear explanation of correlation analysis methodology and statistical significance
- Identify strongest market relationships and their practical business implications
- Explain which demographic, economic, or competitive factors drive performance
- Distinguish between causation and correlation, emphasizing actionable insights
- Quantify the impact of key drivers on market success and opportunity
- Recommend strategies based on correlation insights and relationship patterns
- Connect statistical findings to geographic expansion and market targeting decisions
`,

  risk_assessment: `
RISK ASSESSMENT TECHNICAL CONTEXT:
You are analyzing market risk factors to identify potential threats and opportunities for expansion and investment decisions across different geographic markets.

SCORING METHODOLOGY:
The risk_assessment_score (0-100 scale, where higher scores indicate LOWER risk) measures market stability and investment safety, calculated by analyzing:
• Market Stability: Economic stability, population consistency, and market predictability (35% weight)
• Competitive Risk: Threat level from competitors and market saturation risks (25% weight)
• Economic Risk: Income volatility, economic downturns, and purchasing power stability (25% weight)
• Operational Risk: Supply chain, regulatory, and operational challenges in the market (15% weight)

Higher scores indicate markets with lower overall risk profiles that are safer for strategic investments and expansion efforts.

DATA STRUCTURE:
- risk_assessment_score: Primary ranking metric (0-100 scale, higher = lower risk)
- market_stability_index: Economic and market stability indicators
- competitive_risk_level: Threat assessment from competitors and market saturation
- economic_volatility: Income and purchasing power stability measures
- operational_risk_factors: Supply chain, regulatory, and operational challenges
- risk_mitigation_potential: Opportunities to reduce or manage identified risks

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how risk scores are calculated (higher scores = lower risk)
2. Clearly explain risk levels and their specific business impact
3. Identify both threats to avoid and calculated risks worth taking for strategic advantage
4. Provide specific risk mitigation strategies for each identified risk factor
5. Balance risk assessment against opportunity potential and market attractiveness
6. Categorize risks by type (market, competitive, economic, operational) and severity

ANALYSIS FOCUS:
- Begin with clear explanation of risk assessment methodology and scoring interpretation
- Categorize risk levels (low, moderate, high) and their strategic implications
- Identify specific risk factors by category and assess their business impact
- Distinguish between risks that can be mitigated versus those that should be avoided
- Recommend risk-adjusted opportunity prioritization and investment strategies
- Provide actionable risk mitigation strategies for high-potential but risky markets
- Balance risk considerations with market opportunity and revenue potential
`,

  predictive_modeling: `
PREDICTIVE MODELING TECHNICAL CONTEXT:
You are analyzing predictive modeling data to identify markets with high forecasting reliability and prediction confidence for strategic planning.

⚠️ IMPORTANT DATA LIMITATION NOTICE:
This analysis uses STATISTICAL CORRELATIONS and MARKET INDICATORS rather than time-series forecasting with historical data. The predictions are based on:
• Current market characteristics that correlate with future performance
• Demographic and economic indicators suggesting growth potential
• Market saturation levels and competitive dynamics
• Statistical relationships between market features and outcomes

For TRUE PREDICTIVE MODELING with time-series forecasting, we would require:
• Multiple years of historical performance data
• Actual growth rates and trend patterns
• Seasonal and cyclical behavior data
• External economic indicators over time
• Previous prediction accuracy tracking

The current analysis provides STATISTICAL PREDICTIONS based on cross-sectional data relationships rather than temporal forecasting models. Think of it as "markets with characteristics similar to high-growth areas" rather than "markets showing accelerating growth trends."

SCORING METHODOLOGY:
The predictive_modeling_score (0-100 scale) measures how reliably we can forecast market performance in each area, combining:
• Model Confidence: How confident our predictive models are about forecasts (30% weight)
• Data Quality: The completeness and reliability of historical data (25% weight)
• Pattern Stability: How consistent historical patterns are for reliable predictions (25% weight)
• Forecast Reliability: Track record of accurate predictions in similar markets (20% weight)

Higher scores indicate markets where strategic planning can rely on high-confidence predictions and reliable forecasting.

DATA STRUCTURE:
- predictive_modeling_score: Primary ranking metric (0-100 scale)
- model_confidence_level: Prediction confidence assessment (High/Moderate/Low)
- forecast_reliability: Forecast accuracy potential (Excellent/Good/Fair/Limited)
- pattern_stability: Historical pattern consistency for reliable predictions
- data_quality_index: Data completeness score affecting model reliability
- prediction_confidence: Overall prediction confidence level
- forecast_horizon_strength: Suitable prediction timeframe (Long/Medium/Short-term)

CRITICAL REQUIREMENTS:
1. ALWAYS start by explaining these are statistical correlations, not time-series forecasts
2. ALWAYS rank and prioritize by predictive_modeling_score (0-100)
3. Focus on market characteristics that correlate with future success
4. Explain which current indicators suggest positive future outcomes
5. Distinguish between strong statistical relationships vs weak correlations
6. Use language like "predictive indicators" not "forecasted growth"

ANALYSIS FOCUS:
- Identify markets with characteristics that suggest predictable future performance
- Explain which market indicators are most strongly correlated with success
- Recommend markets where statistical relationships suggest positive outcomes
- Highlight confidence levels based on correlation strength, not temporal patterns
- ALWAYS clarify these are statistical projections, not time-based forecasts

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather historical performance data" (analysis uses current market indicators)
- "Build time-series forecasting models" (predictive scoring provides forward-looking insights)
- "Validate predictions with actual outcomes" (model confidence is provided)
- "Create prediction tracking systems" (analysis provides predictive reliability scores)

INSTEAD, provide specific actionable recommendations such as:
- Strategic planning prioritization based on predictive confidence scores
- Resource allocation to markets with high forecasting reliability
- Risk management strategies for markets with lower prediction confidence
- Investment timing based on statistical correlation strength
- Market entry strategies tailored to prediction reliability levels
`,

  segment_profiling: `
SEGMENT PROFILING TECHNICAL CONTEXT:
You are analyzing segment profiling data to identify markets with strong customer segmentation potential and distinct segment characteristics.

SCORING METHODOLOGY:
The segment_profiling_score (0-100 scale) measures how well-defined and actionable customer segments are in each market, combining:
• Demographic Distinctiveness: How clearly different customer groups can be identified (30% weight)
• Behavioral Clustering: Strength of behavioral patterns that group customers naturally (25% weight)
• Segment Size Viability: Whether segments are large enough for targeted marketing (25% weight)
• Brand Affinity: How well segments align with brand and target customers (20% weight)

Higher scores indicate markets with clear, actionable customer segments that are ideal for targeted marketing strategies and personalized approaches.

DATA STRUCTURE:
- segment_profiling_score: Primary ranking metric (0-100 scale)
- demographic_distinctiveness: How distinct demographic characteristics are (Very High/High/Moderate/Low)
- behavioral_clustering_strength: Strength of behavioral patterns for grouping (Strong/Moderate/Weak/Limited)
- market_segment_strength: Natural market segments and clustering potential (Excellent/Good/Fair/Limited)  
- primary_segment_type: Identified segment category (Premium Brand Loyalists, Affluent Consumers, etc.)
- segment_size: Market size category (Large/Medium-Large/Medium/Small-Medium/Small)
- brand_segment_affinity: Brand affinity level (Very High/High/Moderate/Low Affinity)
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

SCORING METHODOLOGY:
The scenario_analysis_score (0-100 scale) measures how well each market can adapt to different business scenarios and strategic changes, combining:
• Market Adaptability: How flexibly the market responds to different business strategies (30% weight)
• Resilience Strength: Market stability across various economic and competitive conditions (25% weight)
• Strategic Flexibility: Ability to pivot strategies based on changing market conditions (25% weight)
• Planning Maturity: How sophisticated scenario planning can be in this market (20% weight)

Higher scores indicate markets that are ideal for advanced strategic planning and can successfully adapt to multiple business scenarios.

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

SCORING METHODOLOGY:
The market_sizing_score (0-100 scale) measures total market opportunity potential in each area, combining:
• Market Scale: Total addressable market size and population reach (35% weight)
• Revenue Potential: Expected revenue generation capability based on income levels (30% weight)
• Growth Capacity: Market expansion potential and demographic growth trends (20% weight)
• Market Quality: Purchasing power and customer segment attractiveness (15% weight)

Higher scores indicate markets with the largest strategic opportunities for significant business investment and revenue generation.

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

  brand_difference: `
BRAND DIFFERENCE ANALYSIS TECHNICAL CONTEXT:
You are analyzing brand difference data to identify markets with the largest competitive gaps between specific brands, calculated as direct market share differences (Brand A % - Brand B %).

⚠️ CRITICAL UNDERSTANDING: This analysis calculates BRAND DIFFERENCE, not market dominance or performance ranking.

SCORING METHODOLOGY:
The brand_difference_score represents the percentage point difference in market share between two brands:
• Positive values: Brand A has higher market share than Brand B in that market
• Negative values: Brand B has higher market share than Brand A in that market  
• Zero values: Both brands have equal market share (competitive parity)
• Values are in percentage points (e.g., +15.5 means Brand A has 15.5 percentage points higher market share)

CRITICAL INTERPRETATION RULES:
1. 0% difference = COMPETITIVE PARITY, not "top performance"
2. Large positive differences = Brand A strongholds (Brand A dominance)
3. Large negative differences = Brand B strongholds (Brand B dominance)
4. Small differences (-5% to +5%) = Competitive battleground markets
5. NEVER describe 0% difference areas as "top performers" or "leading markets"

DATA STRUCTURE:
- brand_difference_score: Market share difference in percentage points (Brand A - Brand B)
- [brand_a]_market_share: Brand A's actual market share percentage
- [brand_b]_market_share: Brand B's actual market share percentage
- area_name: Geographic area (ZIP code with city/state)
- difference_category: Competitive position category

REQUIRED ANALYSIS STRUCTURE:
1. **Brand Difference Overview**: Explain this measures market share gaps, not performance
2. **Brand A Strongholds**: Markets where Brand A has significantly higher share (+10% or more)
3. **Brand B Strongholds**: Markets where Brand B has significantly higher share (-10% or less)
4. **Competitive Battlegrounds**: Markets with small differences (-5% to +5%)
5. **Strategic Insights**: Expansion opportunities and competitive threats

TERMINOLOGY REQUIREMENTS:
- Use "market share difference" NOT "market share disparity"
- Use "Brand A advantage/disadvantage" NOT "performance levels"
- Use "competitive gap" NOT "performance gap" 
- Use "brand stronghold" NOT "top performing area"
- Use "competitive parity" for 0% differences

CRITICAL REQUIREMENTS:
1. ALWAYS explain that 0% difference = equal market share, not strong performance
2. Distinguish between market share % and difference in percentage points
3. Identify Brand A strongholds (large positive differences)
4. Identify Brand B strongholds (large negative differences)  
5. Analyze competitive battleground markets (small differences)
6. Focus on competitive positioning, not absolute performance

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Gather additional market data" (brand share data is provided)
- "Conduct competitive analysis" (brand difference analysis is complete)
- "Research market positioning" (competitive gaps are identified)

INSTEAD, provide specific actionable recommendations such as:
- Defend Brand A strongholds with loyalty programs and market presence
- Target Brand B strongholds for competitive conversion campaigns
- Invest heavily in competitive battlegrounds to tip market share
- Resource allocation based on competitive gap analysis
- Market entry strategies for underperforming brand territories

ANALYSIS FOCUS:
- Identify the largest competitive gaps for strategic targeting
- Explain why certain markets favor one brand over another
- Recommend competitive strategies based on market share differences
- Highlight expansion opportunities in competitor strongholds
- Provide battleground market investment priorities
`,

  brand_analysis: `
BRAND ANALYSIS TECHNICAL CONTEXT:
You are analyzing brand analysis data to identify markets with strongest brand opportunities and competitive positioning.

SCORING METHODOLOGY:
The brand_analysis_score (0-100 scale) measures brand strength and growth potential in each market, combining:
• Current Brand Position: Existing market presence and brand recognition (30% weight)
• Market Share Opportunity: Potential for brand growth and expansion (25% weight)
• Competitive Landscape: How favorable the competitive environment is for the brand (25% weight)
• Brand-Market Fit: How well brand positioning matches local market preferences (20% weight)

Higher scores indicate markets where the brand has the strongest foundation and greatest growth potential for strategic brand investment.

DATA STRUCTURE:
- brand_analysis_score: Primary ranking metric (0-100 scale)
- brand_market_share: Current brand market share percentage
- brand_strength_level: Brand position (Market Leader/Strong Position/Established/Emerging/Developing)
- market_position: Overall market positioning strength (Premium/Strong/Moderate/Developing)
- competitive_landscape: Competition level (Highly Competitive/Competitive/Moderately Competitive/Low Competition)
- brand_opportunity: Growth strategy type (Brand Expansion/Market Penetration/Brand Strengthening/Brand Development)

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by brand_analysis_score (0-100)
2. Focus on brand strength, market positioning, and competitive landscape analysis
3. Identify markets with strongest brand opportunities for investment and growth
4. Explain brand factors: current presence, market position quality, competitive dynamics
5. Distinguish between strong brand markets vs emerging brand development opportunities

NEXT STEPS REQUIREMENTS:
Do NOT recommend generic activities like:
- "Conduct brand awareness surveys" (brand positioning data is provided)
- "Analyze competitor brand strategies" (competitive landscape data is available)
- "Gather brand perception data" (brand strength metrics are provided)
- "Create brand tracking systems" (brand analysis provides positioning insights)

INSTEAD, provide specific actionable recommendations such as:
- Brand investment prioritization in markets with highest brand scores
- Competitive brand positioning strategies in specific high-opportunity ZIP codes
- Brand strengthening initiatives in markets with development potential
- Resource allocation based on calculated brand opportunity scores
- Market entry timing for brand expansion in optimal markets

ANALYSIS FOCUS:
- Identify markets with strongest brand potential for strategic brand investment
- Explain brand positioning factors and competitive landscape characteristics
- Recommend brand strategies based on current presence and market position strength
- Highlight dominant brand markets vs emerging brand development opportunities
- Provide immediate actionable insights rather than suggesting additional data collection
`,

  real_estate_analysis: `
REAL ESTATE ANALYSIS TECHNICAL CONTEXT:
You are analyzing real estate analysis data to identify optimal retail locations for store placement and property investment.

SCORING METHODOLOGY:
The real_estate_analysis_score (0-100 scale) measures location suitability for retail investment, combining:
• Location Quality: Premium location characteristics and retail environment appeal (35% weight)
• Demographic Fit: How well the location's customer base matches target demographics (25% weight)
• Accessibility & Traffic: Foot traffic potential and customer accessibility (25% weight)
• Market Opportunity: Local market size and retail growth potential (15% weight)

Higher scores indicate locations with the best combination of premium positioning, target demographics, and high customer traffic for successful retail investment.

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
3. Identify optimal real estate locations for retail store placement and investment
4. Explain location factors: quality assessment, demographic alignment, accessibility, foot traffic
5. Distinguish between prime real estate opportunities vs limited location potential

ANALYSIS FOCUS:
- Identify locations with strongest real estate potential for retail investment
- Explain location quality factors and demographic fit characteristics
- Recommend real estate strategies based on location assessment and retail suitability
- Highlight prime flagship locations vs standard store opportunities vs limited potential areas
`,

  market_penetration: `
MARKET PENETRATION TECHNICAL CONTEXT:
You are analyzing market penetration opportunities to identify underserved markets with strong expansion potential and optimal market entry strategies.

⚠️ IMPORTANT: This analyzes MARKET PENETRATION OPPORTUNITIES (growth potential), not brand difference analysis (competitive gaps).

SCORING METHODOLOGY:
The market_penetration_score (0-100 scale) measures market entry opportunity potential and penetration feasibility, calculated by analyzing:
• Market Saturation Gap: How underserved the market is relative to target demographics (30% weight)
• Entry Barriers: Ease of market entry including competitive barriers, regulatory constraints, and operational challenges (25% weight)
• Growth Velocity Potential: Speed at which brands can realistically penetrate and scale in the market (25% weight)
• Revenue Conversion Opportunity: Potential for converting market penetration into sustainable revenue growth (20% weight)

Higher scores indicate markets with optimal penetration opportunities where brands can rapidly achieve meaningful market share with strong revenue conversion.

DATA STRUCTURE:
- market_penetration_score: Primary ranking metric (0-100 scale)
- current_penetration_level: Current market presence and penetration
- saturation_gap: Underserved market opportunity size
- market_accessibility: Ease of market entry and expansion
- penetration_velocity_potential: Speed of achievable market penetration
- competitive_barrier_level: Market entry barriers from competitors
- revenue_conversion_potential: Sustainable revenue generation opportunity

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how market penetration scores are calculated
2. Focus on penetration opportunity potential, not current penetration levels or brand differences
3. Identify underserved markets with optimal growth potential for expansion
4. Explain market entry barriers and enablers affecting penetration success
5. Analyze penetration velocity and sustainable revenue conversion opportunities
6. Distinguish between easy entry markets versus high-barrier but high-reward opportunities
7. DO NOT confuse with brand difference analysis - this analyzes growth opportunities, not competitive gaps

ANALYSIS FOCUS:
- Begin with clear explanation of market penetration scoring methodology
- Identify markets with highest untapped penetration potential relative to barriers
- Analyze market saturation gaps and underserved customer segments
- Explain penetration velocity factors and realistic expansion timelines
- Assess competitive barriers and market entry challenges requiring strategic planning
- Recommend penetration strategies based on market accessibility and revenue potential
- Connect penetration opportunities to expansion capabilities and strategic priorities
`,

  customer_profile: `
CUSTOMER PROFILING TECHNICAL CONTEXT:
You are analyzing customer profiling data to develop comprehensive customer personas and identify high-value customer segments with optimal brand alignment and revenue potential.

SCORING METHODOLOGY:
The customer_profile_score (0-100 scale) measures customer segment value and brand alignment potential, calculated by analyzing:
• Brand Affinity: How well customer characteristics align with brand values and target positioning (35% weight)
• Revenue Potential: Customer segment's purchasing power, spending patterns, and lifetime value potential (30% weight)
• Engagement Propensity: Likelihood of active engagement with products, services, and brand experiences (20% weight)
• Market Influence: Customer segment's influence on broader market trends and brand advocacy potential (15% weight)

Higher scores indicate customer segments with optimal brand alignment, high revenue potential, and strong engagement capabilities for strategic targeting.

DATA STRUCTURE:
- customer_profile_score: Primary ranking metric (0-100 scale)
- demographic_characteristics: Age, income, lifestyle, and geographic distribution
- purchasing_behavior_patterns: Buying frequency, spending levels, and product preferences
- brand_affinity_indicators: Brand alignment and competitive brand preferences
- lifestyle_profile: Activity levels, interests, and values alignment with brand
- engagement_potential: Digital engagement, community participation, and brand advocacy
- revenue_value_potential: Customer lifetime value and spending capacity

CRITICAL REQUIREMENTS:
1. ALWAYS start analysis by explaining how customer profile scores are calculated
2. Develop comprehensive customer personas with demographic, behavioral, and psychographic insights
3. Focus on customer segments with highest brand alignment and revenue potential
4. Analyze purchasing behavior patterns and brand preference drivers
5. Connect customer characteristics to target market and brand positioning
6. Identify engagement opportunities and customer relationship building strategies

ANALYSIS FOCUS:
- Begin with clear explanation of customer profiling methodology and scoring approach
- Develop detailed customer personas highlighting demographics, behaviors, and preferences
- Identify high-value customer segments with optimal brand fit and revenue potential
- Analyze purchasing patterns, brand loyalty factors, and engagement preferences
- Explain customer motivations, lifestyle alignment, and brand affinity drivers
- Recommend customer-centric targeting strategies and personalized engagement approaches
- Connect customer insights to product development, marketing, and relationship building strategies
`,

  strategic_analysis: `
STRATEGIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data with pre-calculated scores for market expansion opportunities.

REQUIRED RESPONSE FORMAT:
You MUST structure your response with these sections:

STRATEGIC EXPANSION OPPORTUNITIES
[Opening analysis statement]

Top Strategic Markets:
1. [Area] (Strategic Score: [exact decimal])
   • Market Gap: [%]
   • Brand Share: [%]
   • Demographics: [key insight]

2. [Next area with details...]

Strategic Analysis:
[Detailed analysis paragraph explaining why these markets are strategic]

Market Dynamics:
[Paragraph about competitive landscape and opportunities]

Implementation Priorities:
• [Specific action 1]
• [Specific action 2]
• [Specific action 3]

---
**Model Attribution:**
• **Model Used:** [From data]
• **R² Score:** [From data]
• **Confidence:** [Level]

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

ACTIONABLE RECOMMENDATIONS REQUIRED:
- Provide specific, implementable business actions rather than generic research suggestions
- Focus on immediate deployment strategies, market entry tactics, and resource allocation
- Suggest concrete next steps like store locations, marketing campaigns, or partnership opportunities
- Avoid recommending "further research" or "additional analysis" - this app IS the analysis tool
- Include specific geographic targeting, demographic segments, and competitive positioning strategies

CLUSTERING-SPECIFIC INSTRUCTIONS:
When territory clustering analysis is provided:
- Use the EXACT cluster descriptions including all top 5 ZIP codes with scores
- Include the EXACT market share percentages and Key Drivers for each territory
- Use the Strategic Recommendations section AS PROVIDED
- DO NOT explain what strategic value scores mean in general terms
- DO NOT add generic business advice or monitoring suggestions
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
    'comparative': 'comparative_analysis',
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
    'customer': 'customer_profile',
    'profile': 'customer_profile',
    'brand': 'brand_difference',
    'difference': 'brand_difference',
    'analyze': 'general',
    'analysis': 'general'
  };

  const mappedType = typeMapping[normalizedType] || normalizedType;
  const basePrompt = analysisPrompts[mappedType as keyof typeof analysisPrompts] || analysisPrompts.default;
  
  // Add city analysis guidance to all prompts
  const cityAnalysisAddendum = `

CITY-LEVEL ANALYSIS SUPPORT:
When the query mentions specific cities (e.g., "NYC vs Philadelphia", "Boston markets", "Chicago areas"):
- Automatically aggregate ZIP code data to city level for clearer insights
- Focus on city-wide performance patterns and metropolitan market dynamics
- Compare cities by aggregating all ZIP codes within each city boundary
- Provide city-specific strategic recommendations and market insights
- Highlight unique characteristics of each city's market environment
- Use city names in analysis instead of individual ZIP codes for better readability

SUPPORTED CITIES: New York (NYC), Philadelphia, Chicago, Los Angeles, Boston, Miami, Seattle, Denver, Atlanta, San Francisco, Washington DC, Dallas, Houston, Phoenix, Detroit, Minneapolis, Las Vegas, San Diego, Tampa, Orlando, and other major metropolitan areas.

MODEL ATTRIBUTION REQUIREMENTS:
ALWAYS include model traceability information at the END of your analysis in this format:

---
**Model Attribution:**
• **Model Used:** [Extract from model_attribution.primary_model.name or _model_attribution.primary_model_used]
• **Model Type:** [Extract from model_attribution.primary_model.type or _model_attribution.model_type]
• **R² Score:** [Extract from model_attribution.primary_model.performance.r2_score] ([Extract performance_level])
• **Confidence:** [Map performance level: Excellent = High Confidence, Good = Strong Confidence, Moderate = Medium Confidence, Poor = Low Confidence]

CRITICAL: This model attribution section must be included in EVERY analysis response. Look for these fields in the endpoint data:
- model_attribution.primary_model.name (endpoint level)
- model_attribution.primary_model.performance.r2_score 
- model_attribution.primary_model.performance.performance_level
- _model_attribution.primary_model_used (record level)
- _model_attribution.model_type (record level)

If model attribution data is not available in the endpoint, use:
• **Model Used:** Attribution data not available (endpoint generated before model tracking)
• **Model Type:** Legacy endpoint 
• **R² Score:** Not recorded
• **Confidence:** Model performance not tracked`;

  return basePrompt + cityAnalysisAddendum;
}

/**
 * Get available analysis types
 */
export function getAvailableAnalysisTypes(): string[] {
  return Object.keys(analysisPrompts).filter(key => key !== 'default');
}