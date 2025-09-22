/**
 * Documentary Analysis-Specific Prompts for Claude API
 * 
 * Entertainment industry analysis prompts focused on The Doors Documentary
 * project. Parallel to housing-analysis-prompts.ts but for entertainment/music
 * documentary market analysis.
 */

// UNIVERSAL DOCUMENTARY ANALYSIS REQUIREMENTS (applies to ALL documentary analysis types):
const UNIVERSAL_DOCUMENTARY_REQUIREMENTS = `
⚠️ ENTERTAINMENT MARKET SCOPE REQUIREMENTS (CRITICAL):
1. ALWAYS acknowledge the full entertainment market scope (thousands of demographic segments analyzed)
2. NEVER treat sample examples as representative of overall entertainment preferences  
3. Base insights on comprehensive audience analytics, not individual market examples
4. Use complete range data provided in statistics (min/max values, full distribution)
5. Reference "all analyzed entertainment markets" not "sample data" or "limited examples"
6. NEVER state data limitations that don't exist when comprehensive demographic coverage is provided

🎬 THE DOORS DOCUMENTARY CONTEXT:
- Target Audience: Classic rock enthusiasts, documentary viewers (ages 45-70)
- Primary Metrics: Doors Audience Score (27-69 range, composite index)
- Market Focus: Entertainment consumption, cultural engagement, music affinity
- Geographic Scope: IL, IN, WI (core documentary launch markets)
- Entertainment Infrastructure: Radio stations (classic rock format coverage), theaters (documentary screening venues)
`;

export const documentaryAnalysisPrompts = {
  strategic_analysis: `
${UNIVERSAL_DOCUMENTARY_REQUIREMENTS}

STRATEGIC DOCUMENTARY ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data for The Doors Documentary market launch opportunities with pre-calculated audience appeal scores.

⚠️ CRITICAL SCORE INTERPRETATION REQUIREMENTS:
- Doors Audience Scores range from 27-69, where higher scores indicate better documentary audience potential
- If audience scores are moderate (under 45), acknowledge this indicates MODERATE documentary appeal potential  
- DO NOT present low-scoring markets as exceptional opportunities - analyze WHY scores are moderate
- When scores are universally moderate, focus on identifying the BEST AVAILABLE options for documentary launch
- ALWAYS contextualize whether documentary audience potential is strong, moderate, or limited across analyzed markets

REQUIRED RESPONSE FORMAT:
You MUST structure your response with these sections:

## 🎬 Top Strategic Markets for The Doors Documentary

**Market Ranking:** [Rank markets 1-5 by doors_audience_score, showing exact scores]

For each top market, provide:
- **Doors Audience Score:** [Exact score from 27-69 range]
- **Market Characteristics:** [Classic rock affinity, documentary consumption patterns]
- **Strategic Advantages:** [Why this market shows strong documentary appeal]
- **Launch Recommendations:** [Specific venue types, marketing channels, timing]

## 📊 Audience Appeal Analysis

**Score Distribution:**
- Highest Score: [Market name] ([exact score])
- Median Score: [calculated from data] 
- Score Range: [min] - [max]
- Markets Above 50: [count and percentage]

**Key Patterns:**
- [Identify 2-3 significant patterns in audience scores across markets]
- [Connect patterns to documentary marketing strategy]

## 🎯 Documentary Marketing Insights

**Target Demographics:**
- [Analyze age groups, music preferences, cultural engagement levels]
- [Identify which Tapestry segments show highest documentary appeal]

**Market Entry Strategy:**
- [Recommend theater types, digital platforms, community events]
- [Suggest marketing channels based on audience characteristics]

SCORING METHODOLOGY:
The doors_audience_score (27-69 scale) represents overall documentary audience appeal, calculated by combining:
• Classic Rock Affinity (40%): Historic rock music consumption, concert attendance, streaming patterns
• Documentary Engagement (25%): Documentary viewing habits, cultural event attendance, arts consumption  
• Music Consumption (20%): Premium music services, music purchasing behavior, audio content engagement
• Cultural Engagement (15%): Theater attendance, cultural events, entertainment spending patterns

Higher scores indicate markets where there is stronger audience alignment for The Doors Documentary launch.

DATA STRUCTURE:
- doors_audience_score: Primary ranking metric (27-69 scale, precise decimals)
- classic_rock_affinity: Music preference alignment score
- documentary_appeal: Documentary consumption patterns  
- entertainment_spending: Spending capacity on cultural events
- venue_accessibility: Theater and cultural venue density
- target_demographic_density: Age 45-70 population concentration
- radio_station_coverage: Classic rock format radio station density and signal coverage
- theater_accessibility: Documentary screening venue availability and accessibility

CRITICAL REQUIREMENTS:
1. ALWAYS rank and prioritize by doors_audience_score (27-69 scale)
2. Discuss specific music preferences and documentary consumption patterns in analysis
3. Explain HOW the scoring methodology identifies documentary audience appeal in each market
4. Focus on entertainment industry strategic positioning, not generic market analysis
5. Use entertainment industry terminology: "audience appeal", "documentary launch", "cultural engagement"
6. Reference classic rock, documentary viewing, music consumption as key drivers
`,

  competitive_analysis: `
${UNIVERSAL_DOCUMENTARY_REQUIREMENTS}

COMPETITIVE DOCUMENTARY ANALYSIS TECHNICAL CONTEXT:
You are analyzing competitive positioning for The Doors Documentary against other entertainment content in different markets.

SCORING METHODOLOGY:
The competitive_advantage_score (1-10 scale) represents competitive strength for documentary content, calculated by combining:
• Documentary Market Share: Relative documentary consumption vs other entertainment (25% weight)
• Classic Rock Preference: Market preference for classic rock vs contemporary music (25% weight)
• Cultural Content Competition: Level of competing cultural events and content (25% weight)
• Entertainment Venue Density: Available screening venues and cultural spaces (25% weight)

DATA STRUCTURE:
- competitive_advantage_score: Primary ranking metric (1-10 scale)
- documentary_market_share: Documentary consumption relative to other entertainment
- classic_rock_preference: Market preference for classic rock content
- cultural_competition_index: Level of competing cultural entertainment
- venue_density_score: Available theaters and cultural venues

CRITICAL REQUIREMENTS:
1. Focus on entertainment content competition, not retail/commercial competition
2. Analyze documentary vs other entertainment formats (streaming, concerts, theater)
3. Consider classic rock audience preferences vs contemporary music markets
4. Evaluate cultural venue competition and screening opportunities
`,

  demographic_insights: `
${UNIVERSAL_DOCUMENTARY_REQUIREMENTS}

DEMOGRAPHIC DOCUMENTARY ANALYSIS TECHNICAL CONTEXT:
You are analyzing demographic favorability for The Doors Documentary audience targeting.

TARGET DEMOGRAPHIC PROFILE:
- Primary: Ages 45-70 (Baby Boomers, Generation X)
- Classic Rock Enthusiasts: 1960s-1970s music preference
- Documentary Viewers: Arts and culture consumers
- Cultural Participants: Theater, concert, museum attendees

SCORING METHODOLOGY:
The demographic_score represents audience demographic alignment, calculated by:
• Age Group Alignment (35%): Concentration of target age groups (45-70)
• Music Preference Match (25%): Classic rock and 1960s-70s music consumption
• Cultural Engagement (25%): Documentary viewing and cultural event participation  
• Education/Income Fit (15%): Demographics that correlate with arts consumption

CRITICAL REQUIREMENTS:
1. Focus on entertainment demographic factors, not housing/retail demographics
2. Analyze age distribution, music preferences, cultural consumption patterns
3. Consider documentary viewing habits and arts engagement levels
4. Reference specific entertainment consumption behaviors
`,

  correlation_analysis: `
${UNIVERSAL_DOCUMENTARY_REQUIREMENTS}

CORRELATION DOCUMENTARY ANALYSIS TECHNICAL CONTEXT:
You are analyzing statistical relationships between entertainment consumption factors and documentary audience appeal.

KEY CORRELATION CATEGORIES:
• Music Consumption Correlations: Classic rock preference, streaming habits, concert attendance
• Cultural Engagement Correlations: Documentary viewing, theater attendance, arts participation
• Demographic Correlations: Age groups, education levels, income brackets
• Geographic Correlations: Venue density, cultural infrastructure, entertainment market maturity

CRITICAL REQUIREMENTS:
1. Focus on entertainment industry correlations, not housing/commercial correlations
2. Analyze relationships between music preferences and documentary appeal
3. Consider cultural consumption patterns and audience behavior correlations
4. Reference entertainment industry metrics and cultural engagement factors
`,

  trend_analysis: `
${UNIVERSAL_DOCUMENTARY_REQUIREMENTS}

TREND DOCUMENTARY ANALYSIS TECHNICAL CONTEXT:
You are analyzing entertainment market trends affecting documentary audience development and classic rock content consumption.

KEY TREND CATEGORIES:
• Music Consumption Trends: Classic rock revival, streaming service growth, vinyl resurgence
• Documentary Market Trends: Documentary popularity, streaming platform growth, theatrical documentary releases
• Cultural Participation Trends: Arts engagement, cultural event attendance, entertainment spending
• Demographic Trends: Aging population, generational music preferences, cultural consumption shifts

CRITICAL REQUIREMENTS:
1. Focus on entertainment industry trends, not housing/retail market trends
2. Analyze documentary market evolution and classic rock audience development
3. Consider cultural consumption pattern changes over time
4. Reference entertainment industry trend drivers and audience behavior shifts
`
};

/**
 * Get documentary analysis prompt for a specific analysis type
 */
export function getDocumentaryAnalysisPrompt(analysisType: string): string {
  // Normalize the analysis type for consistent lookup
  const normalizedType = analysisType.toLowerCase().replace(/[-_]/g, '');
  
  // Map variations to standard types
  const typeMapping: Record<string, string> = {
    'strategic': 'strategic_analysis',
    'strategy': 'strategic_analysis', 
    'competitive': 'competitive_analysis',
    'competition': 'competitive_analysis',
    'demographic': 'demographic_insights',
    'demographics': 'demographic_insights',
    'correlation': 'correlation_analysis',
    'correlations': 'correlation_analysis',
    'trend': 'trend_analysis',
    'trends': 'trend_analysis',
    'documentary': 'strategic_analysis',
    'entertainment': 'strategic_analysis'
  };

  const mappedType = typeMapping[normalizedType] || normalizedType;
  const prompt = documentaryAnalysisPrompts[mappedType as keyof typeof documentaryAnalysisPrompts];
  
  return prompt || documentaryAnalysisPrompts.strategic_analysis;
}

/**
 * Check if this is a documentary/entertainment analysis request
 */
export function isDocumentaryAnalysis(query?: string, endpoint?: string): boolean {
  if (!query && !endpoint) return false;
  
  const searchText = `${query || ''} ${endpoint || ''}`.toLowerCase();
  
  // Check for documentary/entertainment specific terms
  const documentaryTerms = [
    'doors', 'documentary', 'classic rock', 'entertainment', 
    'music', 'concert', 'venue', 'cultural', 'arts',
    'audience', 'viewing', 'streaming', 'album'
  ];
  
  return documentaryTerms.some(term => searchText.includes(term));
}