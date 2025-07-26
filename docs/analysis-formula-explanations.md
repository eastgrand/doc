# Analysis Formula Explanations

## 📊 **Transparency in Scoring**

To help users understand how scores are calculated, each analysis type now includes a formula explanation at the beginning of the results. This ensures transparency and helps users make informed decisions based on the scoring methodology.

## **Formula Breakdown by Analysis Type**

### **🎯 Competitive Analysis Formula**
**Purpose:** Identify optimal expansion opportunities by combining market attractiveness and competitive positioning.

**Formula Components:**
- **Market Size (35% weight)** - Population density indicating market potential
- **Income Level (30% weight)** - Economic attractiveness and purchasing power  
- **Nike Position (20% weight)** - Current Nike market share and competitive position
- **Market Gap (15% weight)** - Untapped market opportunity

**Score Range:** 0-100 (Higher = Better expansion potential)

### **📈 Core Analysis Formula** 
**Purpose:** Assess overall market opportunity potential across multiple factors.

**Formula Components:**
- **Market Gap (40% weight)** - Untapped potential (100% - Nike% - Adidas%)
- **Income Bonus (20% weight)** - Economic strength above baseline ($50K)
- **Population Density (15% weight)** - Market size and density
- **Nike vs Adidas Position (25% weight)** - Competitive advantage

**Score Range:** 0-100+ (Higher = Better opportunity potential)

### **⚠️ Risk Analysis Formula**
**Purpose:** Calculate risk-adjusted scores that account for market volatility and uncertainty.

**Formula Components:**
- **Base Opportunity Value** - Starting score from market potential
- **Volatility Penalty** - Up to -20 points for market instability
- **Uncertainty Penalty** - Up to -15 points for unpredictable conditions
- **Stability Bonus** - Up to +10 points for consistent performance

**Score Range:** 0-100 (Higher = Better risk-adjusted opportunity)

### **👥 Demographic Analysis Formula**
**Purpose:** Measure demographic alignment with athletic brand target markets.

**Formula Components:**
- **Income Score (40% weight)** - Economic capability and purchasing power
- **Age Score (40% weight)** - Target demographics alignment (18-45 optimal)
- **Population Density (20% weight)** - Market size and concentration

**Score Range:** 0-100 (Higher = Better demographic alignment)

### **📊 Trend Analysis Formula**
**Purpose:** Evaluate market momentum and growth trajectory.

**Formula Components:**
- **Growth Rate (40% weight)** - Market expansion velocity
- **Momentum (35% weight)** - Acceleration and increasing trends
- **Trend Strength (15% weight)** - Consistency of directional movement
- **Stability Index (10% weight)** - Predictability and reliability

**Score Range:** 0-100 (Higher = Stronger positive trends)

### **🏘️ Cluster Analysis**
**Purpose:** Group similar markets without calculated scores.

**Methodology:**
- Uses spatial similarity algorithms
- Groups areas by shared characteristics
- No weighted formula - based on pattern recognition
- Focuses on identifying market segments

## **🎯 Benefits of Formula Transparency**

1. **Informed Decision Making** - Users understand what drives high/low scores
2. **Strategy Alignment** - Know which factors to focus on for improvement
3. **Trust Building** - Clear methodology builds confidence in results
4. **Customization Insight** - Understand if weights align with business priorities
5. **Comparative Analysis** - Compare markets knowing the evaluation criteria

## **📋 Implementation**

Each analysis now begins with:
```
📊 [Analysis Type] Formula: [Component breakdown with weights]
Higher scores indicate [what high scores mean for this analysis]
```

This formula explanation appears at the top of every analysis summary that uses calculated scoring, providing immediate transparency before users review the results. 