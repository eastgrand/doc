// Testing utilities for analysis types:
// - test-brand-context.js: Tests EnhancedQueryAnalyzer brand context and routing
// - test-data-loading.js: Tests endpoint JSON data loading and field availability
// Use these when adding/enabling new query types or updating brand context

export const ANALYSIS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for H&R Block tax service expansion'
  ],
  'Comparative Analysis': [
    'Compare H&R Block usage between Alachua County and Miami-Dade County'
  ],
  'Competitive Analysis': [
    'Show me the market share difference between H&R Block and TurboTax'
  ],
  'Demographic Insights': [
    'Which areas have the best customer demographics for tax preparation services?'
  ]
};

export const DISABLED_ANALYSIS_CATEGORIES = {
  'Customer Profile': [
    'Show me areas with ideal customer personas for tax preparation services'
  ],
  'Spatial Clusters': [
    'Show me geographic clusters of similar tax service markets'  
  ], 
  'Correlation Analysis': [
    'What market factors are most strongly correlated with H&R Block online usage?'
  ],
  'Outlier Detection': [
    'Show me markets that have outliers with unique tax service characteristics'
  ],
  'Brand Difference': [
    'Which markets have the strongest H&R Block brand positioning vs competitors?'
  ],
  'Scenario Analysis': [
    'What if H&R Block changes its pricing strategy - which markets would be most resilient?'
  ],
  'Trend Analysis': [
    'Show me markets with the strongest growth trends for online tax preparation'
  ],
  'Anomaly Detection': [
    'Show me statistical outliers in H&R Block market performance'
  ],
  'Feature Interactions': [
    'Which markets have the strongest interactions between demographics and tax service usage?'
  ],
  'Predictive Modeling': [
    'Which markets are most likely to grow for H&R Block in the next year?'
  ],
  'Segment Profiling': [
    'Which markets have the clearest customer segmentation profiles for tax services?'
  ],
  'Sensitivity Analysis': [
    'How do tax service rankings change if we adjust income weights by 20%?'
  ],
  'Feature Importance Ranking': [
    'What are the most important factors predicting H&R Block online usage?'
  ],
  'Model Performance': [
    'How accurate are our predictions for tax service market performance?'
  ],
  'Algorithm Comparison': [
    'Which AI model performs best for predicting tax service usage in each area?'
  ],
  'Ensemble Analysis': [
    'Show me the highest confidence predictions using our best ensemble model'
  ],
  'Model Selection': [
    'What is the optimal AI algorithm for predictions in each geographic area?'
  ],
  'Cluster Analysis': [
    'How should we segment tax service markets for targeted strategies?'
  ],
  'Anomaly Insights': [
    'Which unusual market patterns represent the biggest business opportunities?'
  ],
  'Dimensionality Insights': [
    'Which factors explain most of the variation in tax service market performance?'
  ],
  'Consensus Analysis': [
    'Where do all our AI models agree on tax service predictions?'
  ],
  'Nonlinear Analysis': [
    'What complex patterns exist in tax service data that linear models miss?'
  ],
  'Similarity Analysis': [
    'Which markets are most similar to our top-performing H&R Block locations?'
  ],
  'Feature Selection Analysis': [
    'Which features are truly essential for predicting tax service success?'
  ],
  'Interpretability Analysis': [
    'What are the most transparent insights we can provide about tax service markets?'
  ],
  'Neural Network Analysis': [
    'What complex patterns can deep learning uncover in tax service data?'
  ],
  'Speed Optimized Analysis': [
    'What insights can we get instantly for time-critical tax service decisions?'
  ]
};

export const TRENDS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for H&R Block expansion in the Northeast region',
    'Which markets have the largest opportunities for major H&R Block investment',
    'Which markets have the most reliable data for tax service strategic planning?',
    'Which markets are most adaptable to different tax service scenarios?'
  ],
  'Competitive Intelligence': [
    'Where does H&R Block have the biggest competitive advantages against TurboTax in Florida?',
    'Compare H&R Block\'s market position against competitors in major metropolitan areas',
    'Where is H&R Block\'s brand strongest and where does it need development?',
    'Which markets have the strongest H&R Block brand positioning?',
    'Show me the percent difference in market share between H&R Block and TurboTax',
    'Where does H&R Block have the largest market share lead over competitors?'
  ],
  'Customer & Demographics': [
    'Which markets have the highest demographic opportunity scores for H&R Block?',
    'Show me markets with the clearest customer segments for tax service marketing',
    'What market factors are most strongly associated with H&R Block online usage?',
    'Which markets have the strongest interactions between demographics, income, and tax service preference?',
    'Which markets best match H&R Block\'s target customer profile?',
    'Where are Working Professionals and Small Business Owners concentrated?',
    'Show me customer persona distribution for tax preparation services across different markets'
  ],
  'Location & Real Estate': [
    'Show me geographic clusters of similar markets for regional tax service planning',
    'Which locations are best for new H&R Block offices?',
    'Show me markets that are exceptional outliers with unique tax service characteristics',
    'Show me markets with unusual tax preparation patterns that need investigation'
  ],
  'Multi-Analysis & Insights': [
    'Compare tax service customer profiles with strategic market opportunities',
    'Show me areas with high demographic scores AND strong competitive positioning for tax services',
    'Which markets combine ideal tax customer fit with growth potential?',
    'Analyze tax customer personas alongside market trends and competitive landscape',
    'Where do customer profiles, demographics, and strategic value align best for H&R Block?'
  ],
  'City & Regional Comparisons': [
    'Compare H&R Block performance between Jacksonville and Tampa',
    'How does Miami demographic opportunity compare to Orlando?',
    'Compare Gainesville vs Tallahassee for H&R Block brand positioning',
    'Miami vs Jacksonville: which city has better customer profiles for tax services?',
    'Compare demographic scores between major Florida metropolitan areas',
    'Which performs better for H&R Block: Fort Lauderdale or West Palm Beach markets?',
    'Compare strategic value between Tampa and St. Petersburg',
    'Orlando vs Miami: demographic and tax service market opportunity comparison'
  ],
  'Scenario Planning & Adaptability': [
    'Which markets are most adaptable to different tax service strategic scenarios?',
    'What if H&R Block changes its pricing strategy - which markets would be most resilient?',
    'Show me markets with the highest flexibility for tax service strategic pivots',
    'Which markets can best handle economic downturns for tax preparation services?',
    'Where should H&R Block invest for maximum scenario flexibility?',
    'Which markets have proven resilience across multiple tax seasons?',
    'Show me markets that perform well under various what-if tax scenarios',
    'Which areas offer the best strategic pivot opportunities for H&R Block?'
  ],
  'Trends & Growth Analysis': [
    'Show me markets with the strongest growth trends for H&R Block online usage',
    'Which areas have consistent upward momentum for tax preparation services?',
    'Where is H&R Block experiencing the fastest market share growth?',
    'Which markets show accelerating demand for online tax preparation?',
    'Identify emerging markets with high growth potential for H&R Block',
    'Show me markets with stable, predictable tax service growth patterns'
  ],
  'Data Quality & Anomalies': [
    'Which markets show unusual tax service patterns that warrant investigation?',
    'Show me statistical outliers in H&R Block market performance',
    'Where are there data anomalies in tax service market metrics?',
    'Identify markets with exceptional tax service characteristics needing validation',
    'Which areas have performance metrics that deviate from regional tax service norms?',
    'Show me markets with suspicious or inconsistent tax preparation data patterns'
  ],
  'Advanced Analytics': [
    'Which markets have the strongest interactions between demographics and H&R Block usage?',
    'Show me where multiple factors synergistically drive tax service success',
    'Which markets are most likely to grow for H&R Block in the next year?',
    'Forecast H&R Block performance trends across different Florida regions',
    'Where do income, age, and financial factors combine to predict tax service success?',
    'Show me markets where tax service loyalty aligns with demographic clusters'
  ]
}; 