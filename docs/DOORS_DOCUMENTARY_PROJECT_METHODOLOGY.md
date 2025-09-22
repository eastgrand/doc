# The Doors Documentary Project Methodology

## Project Overview

**Objective**: Identify optimal markets for distributing and promoting a documentary about The Doors, the iconic 1960s psychedelic rock band.

**Geographic Scope**: Illinois, Indiana, and Wisconsin (3-state region)

**Analysis Approach**: Multi-dimensional audience scoring using composite index methodology to identify areas with high concentrations of likely documentary viewers.

---

## 1. Composite Index Methodology

### 1.1 Doors Documentary Audience Score

Rather than using a single metric, we developed a sophisticated **"Doors Documentary Audience Score"** that combines multiple behavioral and demographic indicators to identify the most receptive markets.

#### Why Composite Index?

Single variables like "classic rock listening" or "documentary viewing" only capture one dimension of audience appeal. The Doors documentary appeals to:
- Classic rock enthusiasts (primary audience)
- Documentary film viewers (format preference)
- Cultural/entertainment seekers (engagement level)
- Music consumers across platforms (behavioral indicator)

### 1.2 Index Components & Weights

```
DOORS AUDIENCE SCORE = 
  (Classic Rock Affinity × 0.40) +
  (Documentary Engagement × 0.25) +
  (Music Consumption × 0.20) +
  (Cultural Engagement × 0.15)
```

#### Component Breakdown:

**Classic Rock Affinity (40% weight)**
- Primary indicator of interest in The Doors' genre
- Fields used:
  - `MP22055A_B_P`: Listened to Classic Rock Music Last 6 Mo (%)
  - Classic Rock Radio Format listeners
  - Attended Rock Music Performance Last 12 Mo
- Rationale: Direct genre alignment with The Doors' music

**Documentary Engagement (25% weight)**  
- Indicates willingness to consume documentary content
- Fields used:
  - `MP20158A_B_P`: Rented/Purchased Documentary Movie Last 30 Days (%)
  - Biography movie viewing behavior
  - Biography book purchases
- Rationale: Format preference is critical for documentary success

**Music Consumption Behavior (20% weight)**
- Shows active music engagement across platforms
- Fields targeted:
  - Spotify, Apple Music, Pandora usage
  - Music purchasing (iTunes, Amazon Music)
  - Music podcast listening
- Rationale: Active music consumers more likely to seek music documentaries

**Entertainment/Cultural Engagement (15% weight)**
- General entertainment-seeking behavior
- Fields used:
  - `MP19180A_B_P`: Used Internet for Entertainment/Celebrity Info (%)
  - `MP22103A_B_P`: Listened to Entertainment/Culture Podcast (%)
  - Theatre/Concert spending
  - Social media music group following
- Rationale: Indicates cultural curiosity and entertainment investment

### 1.3 Score Normalization

All component scores are normalized to a 0-100 percentile scale to ensure comparability across different measurement units. The final score represents a market's relative appeal compared to all other markets in the dataset.

**Score Interpretation**:
- 70-100: Prime markets (highest concentration of target audience)
- 50-70: Strong secondary markets
- 30-50: Moderate potential markets
- 0-30: Lower priority markets

---

## 2. Tapestry Segment Selection Rationale

### 2.1 Selected Tapestry Segments

Based on the available data layers, we identified specific Tapestry segments that align with The Doors' audience:

**Primary Segments**:
- **Segment I1**: Urban, educated, culturally engaged
- **Segment J1**: Suburban professionals with disposable income
- **Segment K1**: Young urban professionals
- **Segment K2**: Established families with entertainment budgets
- **Segment L1**: Affluent retirees (Baby Boomers who lived through The Doors era)

### 2.2 Selection Criteria

Segments were selected based on:
1. **Generational Alignment**: Baby Boomers (lived through the 60s) and Gen X (classic rock revival generation)
2. **Cultural Engagement**: Higher indexes for arts, music, and entertainment
3. **Economic Capacity**: Disposable income for entertainment
4. **Media Consumption**: Above-average documentary and streaming service usage

---

## 3. Field Selection Methodology

### 3.1 Field Discovery Process

From 127 available fields in the merged dataset, we identified entertainment-relevant fields through:

1. **Semantic Analysis**: Pattern matching for keywords (ROCK, MUSIC, DOCUMENTARY, ENTERTAINMENT)
2. **Behavioral Relevance**: Focus on actual consumption behaviors vs. preferences
3. **Temporal Relevance**: Prioritized recent behavior (30 days, 6 months) over annual
4. **Geographic Consistency**: Selected fields available across all three states

### 3.2 Field Prioritization

**Tier 1 - Direct Indicators**:
- Classic rock music listening
- Documentary movie consumption
- Rock concert attendance

**Tier 2 - Correlated Behaviors**:
- Music streaming service usage
- Entertainment information seeking
- Cultural podcast consumption

**Tier 3 - Supporting Demographics**:
- Generation-based populations (Baby Boomers, Gen X)
- Entertainment spending levels
- Media market characteristics

---

## 4. Custom Processors & Algorithms

### 4.1 Doors Audience Score Generator

**Location**: `/scripts/automation/generate_doors_composite_index.py`

**Process**:
1. Loads merged dataset with all 127 fields
2. Auto-discovers relevant entertainment fields
3. Calculates component scores with normalization
4. Applies weighted formula for final score
5. Outputs enhanced dataset with composite score

**Output Files**:
- `doors_audience_composite_data.csv`: Enhanced dataset with scores
- `doors_audience_composite_metadata.json`: Score statistics and component details

### 4.2 Entertainment-Specific SHAP Analysis

The SHAP (SHapley Additive exPlanations) analysis will be customized to:
- Identify which behavioral factors most strongly predict documentary interest
- Reveal geographic patterns in classic rock affinity
- Uncover unexpected correlations with documentary viewing

---

## 5. Visualization Strategy

### 5.1 Primary Visualization: Heat Map

**Doors Audience Score Heat Map**
- Color gradient: Cool (blue) to Hot (red)
- Breakpoints: Quartile-based for even distribution
- Focus areas: Metropolitan regions with high scores

### 5.2 Layer Groupings

**Group 1: Core Audience Metrics**
- Doors Audience Score (composite)
- Classic Rock Affinity Score
- Documentary Engagement Score

**Group 2: Behavioral Indicators**
- Music streaming penetration
- Concert attendance rates
- Entertainment spending levels

**Group 3: Demographic Context**
- Baby Boomer concentration
- Gen X concentration
- Urban cultural centers

### 5.3 Comparative Analysis Layers

- **Radio Market Coverage**: Overlay classic rock radio station coverage
- **Theatre Locations**: Movie theatre density for theatrical release planning
- **Generational Mix**: Baby Boomer + Gen X combined populations

---

## 6. Market Segmentation Strategy

### 6.1 Primary Markets (Score 70+)

Characteristics:
- High classic rock listenership
- Strong documentary viewing habits
- Urban/suburban cultural centers
- Multiple distribution channels available

Strategy:
- Theatrical release consideration
- Heavy marketing investment
- Local media partnerships
- Music venue cross-promotion

### 6.2 Secondary Markets (Score 50-70)

Characteristics:
- Moderate classic rock interest
- Average documentary consumption
- Suburban markets with good infrastructure

Strategy:
- Streaming-first approach
- Targeted digital advertising
- Classic rock radio partnerships

### 6.3 Tertiary Markets (Score 30-50)

Characteristics:
- Lower but present interest indicators
- Rural or smaller urban areas

Strategy:
- Digital-only distribution
- Programmatic advertising
- Social media targeting

---

## 7. Unique Project Considerations

### 7.1 The Doors' Specific Appeal Factors

**Historical Context**:
- 1960s counter-culture movement
- Psychedelic rock pioneers
- Jim Morrison's poetic/rebellious image
- "Light My Fire," "Riders on the Storm," "The End"

**Audience Segments**:
1. **Original Fans**: Baby Boomers who experienced The Doors firsthand
2. **Classic Rock Enthusiasts**: Gen X and older Millennials who discovered them later
3. **Documentary Buffs**: General documentary consumers interested in music history
4. **Cultural Historians**: Academic/intellectual interest in 1960s culture

### 7.2 Distribution Channel Optimization

Based on our composite scoring, we can optimize for:
- **Theatrical**: High-score urban markets with strong documentary attendance
- **Streaming Platforms**: Broad release in all markets score 30+
- **Special Events**: Film festivals and music venues in score 60+ markets
- **Educational**: Universities and libraries in markets with younger demographics

### 7.3 Cross-Promotional Opportunities

Identified through data layers:
- Classic rock radio stations (layers 104-106, 113-115)
- Music festivals and concert venues
- Record stores and music retailers
- Streaming service partnerships

---

## 8. Model Training Specifications

### 8.1 Target Variable

**Primary**: `doors_audience_score` (0-100 composite index)

### 8.2 Feature Engineering

Enhanced features for model training:
- Component scores as individual features
- Generational proportions
- Entertainment spending indices
- Media consumption diversity scores

### 8.3 Expected Model Outputs

The XGBoost model will predict:
1. Doors Audience Score for new/unmeasured markets
2. Feature importance rankings showing key drivers
3. Market cluster identification
4. Revenue potential estimates

---

## 9. Success Metrics

### 9.1 Pre-Launch Indicators

- Number of high-score markets identified (target: 20+ markets with 70+ score)
- Geographic coverage efficiency (population reached per marketing dollar)
- Cross-channel opportunity density

### 9.2 Post-Launch Validation

- Correlation between predicted scores and actual viewership
- ROI by market score tier
- Engagement metrics by audience component

---

## 10. Implementation Timeline

### Phase 1: Data Preparation ✅
- Extract ArcGIS layers
- Generate composite index
- Validate score distribution

### Phase 2: Model Training (Next)
- Run automation with composite target
- Generate SHAP explanations
- Create microservice package

### Phase 3: Visualization
- Deploy enhanced map layers
- Configure score-based rendering
- Add interpretive overlays

### Phase 4: Strategic Analysis
- Generate market reports
- Identify top 20 markets
- Create distribution recommendations

---

## Appendix A: Data Dictionary

### Composite Score Fields

| Field Name | Description | Range | Weight |
|------------|-------------|-------|--------|
| doors_audience_score | Final composite audience appeal score | 0-100 | N/A |
| classic_rock_affinity_score | Classic rock engagement component | 0-100 | 40% |
| documentary_engagement_score | Documentary viewing component | 0-100 | 25% |
| music_consumption_score | Music platform usage component | 0-100 | 20% |
| cultural_engagement_score | Entertainment seeking component | 0-100 | 15% |

### Key Source Fields

| Field Code | Description | Source Layer |
|------------|-------------|--------------|
| MP22055A_B_P | Listened to Classic Rock Music Last 6 Mo (%) | Layer 112 |
| MP20158A_B_P | Rented/Purchased Documentary Movie Last 30 Days (%) | Layer 73 |
| MP19180A_B_P | Used Internet for Entertainment/Celebrity Info (%) | Layer 62 |
| MP22103A_B_P | Listened to Entertainment/Culture Podcast (%) | Layer 95 |

---

## Appendix B: Technical Implementation Notes

### Composite Index Generator Script

```python
# Core formula implementation
doors_score = (
    classic_rock_affinity * 0.40 +
    documentary_engagement * 0.25 +
    music_consumption * 0.20 +
    cultural_engagement * 0.15
)
```

### Data Pipeline

1. **Input**: 120 ArcGIS layers → 11,584 geographic records
2. **Processing**: Composite index calculation with 4 components
3. **Output**: Enhanced dataset with 131 fields including scores
4. **Target Variable**: `doors_audience_score` for model training

### Model Configuration

```python
# XGBoost parameters optimized for geographic/demographic prediction
params = {
    'objective': 'reg:squarederror',
    'max_depth': 6,
    'learning_rate': 0.1,
    'n_estimators': 100,
    'subsample': 0.8,
    'colsample_bytree': 0.8
}
```

---

*Document Version: 1.0*  
*Created: September 2024*  
*Project: The Doors Documentary Market Analysis*  
*Methodology Developer: MPIQ AI Chat Automation Pipeline*