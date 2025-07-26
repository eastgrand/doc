# Analysis Endpoint Explainer Guide

This document explains all 16 analysis endpoints, their use cases for Nike's strategic planning, example queries, scoring formulas, and practical applications.

---

## 1. General Analysis (`/analyze`)

### **Business Use Case**
Overall strategic market assessment combining multiple factors to identify the highest-value markets for Nike investment. Used for executive-level market prioritization and resource allocation decisions.

### **Example Query**
*"Show me the top strategic markets for Nike expansion in the Northeast region"*

### **Scoring Formula**
**Strategic Value Score = Market Strength (35%) + Demographic Alignment (30%) + Growth Potential (25%) + Competitive Position (10%)**

### **Plain Language Explanation**
This score identifies markets that offer the best overall strategic value by combining market size and demographics (65%) with growth trends and competitive advantages (35%). Higher scores indicate markets where Nike should focus major strategic investments.

---

## 2. Competitive Analysis (`/competitive-analysis`) 

### **Business Use Case**
Identifies markets where Nike has the strongest competitive advantages over Adidas, Jordan, and other brands. Used for competitive strategy development and market share expansion planning.

### **Example Query**
*"Where does Nike have the biggest competitive advantages against Adidas in California?"*

### **Scoring Formula**
**Competitive Advantage Score = Market Dominance (40%) + Demographic Alignment (30%) + Competitive Pressure (20%) + Category Strength (10%)**

### **Plain Language Explanation**
This score measures Nike's competitive positioning strength in each market. It heavily weighs current market dominance and how well the demographics match Nike's target customers, while factoring in competitive pressure and product category performance.

---

## 3. Demographic Analysis (`/demographic-insights`)

### **Business Use Case**
Identifies markets with demographic profiles that best match Nike's target customers. Used for customer acquisition strategies and targeted marketing campaign development.

### **Example Query**
*"Which markets have the best demographic fit for Nike's target customer profile?"*

### **Scoring Formula**
**Demographic Opportunity Score = Age Demographics (30%) + Income Alignment (25%) + Lifestyle Indicators (25%) + Population Growth (20%)**

### **Plain Language Explanation**
This score identifies markets where the population characteristics (age, income, lifestyle) most closely match Nike's ideal customers. Higher scores indicate markets with the most promising customer demographics for Nike products.

---

## 4. Spatial Clustering (`/spatial-clusters`)

### **Business Use Case**
Groups geographically similar markets to identify regional patterns and optimize distribution strategies. Used for supply chain planning and regional market segmentation.

### **Example Query**
*"Show me geographic clusters of similar markets for regional distribution planning"*

### **Scoring Formula**
**Cluster Performance Score = Intra-cluster Similarity (40%) + Geographic Coherence (30%) + Market Potential (20%) + Cluster Size (10%)**

### **Plain Language Explanation**
This score measures how well markets group together geographically based on similar characteristics. High-performing clusters represent regions where Nike can apply similar strategies across multiple nearby markets.

---

## 5. Correlation Analysis (`/correlation-analysis`)

### **Business Use Case**
Identifies relationships between different market factors to understand what drives Nike's performance. Used for predictive modeling and identifying key performance indicators.

### **Example Query**
*"What market factors are most strongly correlated with Nike's success?"*

### **Scoring Formula**
**Correlation Strength Score = Variable Relationships (50%) + Statistical Significance (25%) + Predictive Value (15%) + Data Quality (10%)**

### **Plain Language Explanation**
This score measures how strongly different market variables relate to each other and to Nike's performance. High scores indicate markets where relationships between factors are clear and reliable for prediction purposes.

---

## 6. Trend Analysis (`/trend-analysis`)

### **Business Use Case**
Identifies markets with the strongest positive trends and growth momentum. Used for timing market entry decisions and investment prioritization.

### **Example Query**
*"Which markets show the strongest upward trends for Nike growth?"*

### **Scoring Formula**
**Trend Strength Score = Growth Momentum (35%) + Trend Consistency (30%) + Market Position (25%) + Volatility Assessment (10%)**

### **Plain Language Explanation**
This score identifies markets with strong, consistent upward trends in Nike-relevant factors. Higher scores indicate markets where Nike is likely to benefit from positive momentum and sustained growth patterns.

---

## 7. Anomaly Detection (`/anomaly-detection`)

### **Business Use Case**
Identifies unusual market patterns that may indicate data quality issues, unique opportunities, or markets requiring special attention. Used for quality assurance and opportunity identification.

### **Example Query**
*"Show me markets with unusual patterns that need investigation"*

### **Scoring Formula**
**Anomaly Detection Score = Statistical Deviation (40%) + Pattern Anomaly (30%) + Performance Outliers (20%) + Context Inconsistency (10%)**

### **Plain Language Explanation**
This score identifies markets that don't follow normal patterns compared to similar areas. High scores flag markets that are statistical outliers and may represent unique opportunities or data quality issues requiring investigation.

---

## 8. Feature Interactions (`/feature-interactions`)

### **Business Use Case**
Analyzes complex relationships between multiple market variables to identify synergistic effects. Used for understanding multi-factor market dynamics and optimization strategies.

### **Example Query**
*"Which markets have the strongest interactions between demographics, income, and Nike preference?"*

### **Scoring Formula**
**Feature Interaction Score = Correlation Strength (35%) + Synergy Effects (30%) + Interaction Complexity (25%) + Non-linear Patterns (10%)**

### **Plain Language Explanation**
This score measures how different market factors work together to create combined effects stronger than individual factors alone. High scores indicate markets where multiple positive factors amplify each other's impact.

---

## 9. Outlier Detection (`/outlier-detection`)

### **Business Use Case**
Identifies exceptional markets that stand out significantly from typical patterns. Used for identifying unique high-opportunity markets or markets requiring specialized strategies.

### **Example Query**
*"Show me markets that are exceptional outliers with unique characteristics"*

### **Scoring Formula**
**Outlier Detection Score = Statistical Outlier Level (30%) + Performance Extremes (30%) + Contextual Uniqueness (25%) + Rarity Level (15%)**

### **Plain Language Explanation**
This score identifies markets that are genuinely exceptional rather than just statistically different. High scores indicate markets with unique characteristics that may require specialized approaches or represent exceptional opportunities.

---

## 10. Comparative Analysis (`/comparative-analysis`)

### **Business Use Case**
Compares Nike's performance against competitors across different markets to identify relative strengths and weaknesses. Used for competitive positioning and market share strategies.

### **Example Query**
*"Compare Nike's market position against competitors in major metropolitan areas"*

### **Scoring Formula**
**Comparative Analysis Score = Brand Performance Gap (35%) + Market Position Strength (30%) + Competitive Dynamics (25%) + Growth Differential (10%)**

### **Plain Language Explanation**
This score measures Nike's relative performance compared to competitors in each market. Higher scores indicate markets where Nike has significant competitive advantages and strong positioning versus rivals.

---

## 11. Predictive Modeling (`/predictive-modeling`)

### **Business Use Case**
Identifies markets with the most reliable data for forecasting future performance. Used for strategic planning, budget allocation, and long-term investment decisions.

### **Example Query**
*"Which markets have the most predictable outcomes for 3-year planning?"*

### **Scoring Formula**
**Predictive Modeling Score = Model Confidence (40%) + Pattern Stability (30%) + Forecast Reliability (20%) + Data Quality (10%)**

### **Plain Language Explanation**
This score measures how accurately future performance can be predicted in each market based on historical patterns and data quality. High scores indicate markets suitable for confident long-term planning and investment.

---

## 12. Segment Profiling (`/segment-profiling`)

### **Business Use Case**
Identifies markets with clear, distinct customer segments for targeted marketing strategies. Used for customer segmentation and personalized marketing campaign development.

### **Example Query**
*"Which markets have the clearest customer segments for targeted marketing?"*

### **Scoring Formula**
**Segment Profiling Score = Demographic Distinctiveness (35%) + Behavioral Clustering (30%) + Market Segment Strength (25%) + Profiling Clarity (10%)**

### **Plain Language Explanation**
This score measures how well customers in each market can be grouped into clear, actionable segments based on demographics and behavior. High scores indicate markets ideal for targeted marketing and segment-specific strategies.

---

## 13. Scenario Analysis (`/scenario-analysis`)

### **Business Use Case**
Identifies markets that can adapt well to different strategic scenarios and market conditions. Used for strategic planning under uncertainty and risk management.

### **Example Query**
*"Which markets are most adaptable to different economic scenarios?"*

### **Scoring Formula**
**Scenario Analysis Score = Scenario Adaptability (35%) + Market Resilience (30%) + Strategic Flexibility (25%) + Planning Readiness (10%)**

### **Plain Language Explanation**
This score measures how well markets can handle different business scenarios and strategic pivots. High scores indicate markets that remain viable across multiple potential future scenarios, reducing strategic risk.

---

## 14. Market Sizing (`/market-sizing`)

### **Business Use Case**
Identifies markets with the largest total opportunity size and revenue potential. Used for major investment decisions and resource allocation to maximize return on investment.

### **Example Query**
*"Show me the largest market opportunities for major Nike investment"*

### **Scoring Formula**
**Market Sizing Score = Market Opportunity Size (40%) + Growth Potential (30%) + Addressable Market Quality (20%) + Revenue Potential (10%)**

### **Plain Language Explanation**
This score measures the total size of business opportunity in each market, considering both current market size and growth potential. Higher scores indicate markets with the largest addressable opportunities for Nike investment.

---

## 15. Brand Analysis (`/brand-analysis`)

### **Business Use Case**
Analyzes Nike's brand strength and positioning in different markets to optimize brand investment and marketing strategies. Used for brand development and competitive positioning decisions.

### **Example Query**
*"Where is Nike's brand strongest and where does it need development?"*

### **Scoring Formula**
**Brand Analysis Score = Nike Brand Strength (40%) + Market Position Quality (30%) + Competitive Brand Landscape (20%) + Brand Growth Potential (10%)**

### **Plain Language Explanation**
This score measures Nike's brand performance and market position strength. High scores indicate markets where Nike's brand is strong and well-positioned, while lower scores identify markets needing brand development investment.

---

## 16. Real Estate Analysis (`/real-estate-analysis`)

### **Business Use Case**
Identifies optimal locations for Nike retail stores based on demographic fit, foot traffic, and market accessibility. Used for retail expansion and store location planning.

### **Example Query**
*"Which locations are best for new Nike flagship stores?"*

### **Scoring Formula**
**Real Estate Analysis Score = Location Quality (35%) + Demographic Fit (25%) + Market Accessibility (25%) + Growth Trajectory (15%)**

### **Plain Language Explanation**
This score evaluates locations for retail suitability by combining foot traffic potential, demographic alignment with Nike customers, and market accessibility. High scores indicate prime locations for Nike retail investment.

---

## Query Trigger Keywords

Each endpoint can be triggered by specific keywords in user queries:

- **General Analysis**: "strategic", "overall", "priority", "investment"
- **Competitive Analysis**: "competitive", "competition", "versus", "against", "market share"
- **Demographic**: "demographic", "customers", "population", "age", "income"
- **Spatial Clustering**: "geographic", "regional", "clusters", "similar areas"
- **Correlation**: "correlation", "relationships", "factors", "drivers"
- **Trend Analysis**: "trends", "growth", "momentum", "trajectory"
- **Anomaly Detection**: "unusual", "anomalies", "outliers", "investigate"
- **Feature Interactions**: "interactions", "synergy", "combined effects"
- **Outlier Detection**: "exceptional", "unique", "standout", "extraordinary"
- **Comparative**: "compare", "comparison", "relative", "benchmark"
- **Predictive Modeling**: "predict", "forecast", "planning", "future"
- **Segment Profiling**: "segments", "targeting", "customer groups"
- **Scenario Analysis**: "scenarios", "adaptable", "flexible", "uncertainty"
- **Market Sizing**: "opportunity size", "largest markets", "revenue potential"
- **Brand Analysis**: "brand", "Nike strength", "positioning", "brand development"
- **Real Estate**: "locations", "stores", "retail", "real estate", "flagship"

---

*This guide provides Nike stakeholders with clear understanding of when and how to use each analysis endpoint for strategic decision-making.*