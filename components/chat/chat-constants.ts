// Testing utilities for analysis types:
// - test-brand-context.js: Tests EnhancedQueryAnalyzer brand context and routing
// - test-data-loading.js: Tests endpoint JSON data loading and field availability
// Use these when adding/enabling new query types or updating brand context

export const ANALYSIS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for The Doors Documentary launch'
  ],
  'Comparative Analysis': [
    'Compare classic rock audience appeal between Chicago and Milwaukee'
  ],
  'Brand Difference': [
    'Show me the difference between documentary appeal and music streaming preferences'
  ],
  'Demographic Insights': [
    'Which areas have the best demographics for classic rock documentaries?'
  ],
  'Customer Profile': [
    'Show me areas with ideal demographic profiles for Doors fans'
  ],
  'Spatial Clusters': [
    'Show me geographic clusters of similar classic rock audiences'  
  ], 
  'Outlier Detection': [
    'Show me markets that have outliers with unique entertainment preferences'
  ],
  'Competitive Analysis': [
    'Show me areas with the best opportunities for documentary theatrical release'
  ],
  'Scenario Analysis': [
    'What if we focus on streaming vs theatrical - which markets would perform best?'
  ],
  'Feature Interactions': [
    'Which markets have the strongest interactions between age and classic rock affinity?'
  ],
  'Segment Profiling': [
    'Which markets have the clearest audience segmentation for music documentaries?'
  ],
  'Sensitivity Analysis': [
    'How do audience appeal rankings change if we adjust classic rock affinity weights?'
  ],
  'Feature Importance Ranking': [
    'What are the most important factors predicting Doors documentary audience appeal?'
  ],
  'Model Performance': [
    'How accurate are our predictions for documentary audience engagement?'
  ],
  'Algorithm Comparison': [
    'Which AI model performs best for predicting classic rock audience preferences?'
  ],
  'Ensemble Analysis': [
    'Show me the highest confidence predictions for documentary launch success'
  ],
  'Model Selection': [
    'What is the optimal AI algorithm for audience predictions in each market?'
  ],
  'Dimensionality Insights': [
    'Which factors explain most of the variation in documentary audience appeal?'
  ],
  'Consensus Analysis': [
    'Where do all our AI models agree on documentary launch potential?'
  ],
  'Anomaly Insights': [
    'Which unusual audience patterns represent the biggest opportunities?'
  ],
  'Cluster Analysis': [
    'How should we segment classic rock audiences for targeted marketing?'
  ],
  'Analyze': [
    'Provide comprehensive market insights for The Doors Documentary'
  ],
  'Correlation Analysis': [
    'What factors are most strongly correlated with classic rock documentary appeal?'
  ],
  'Trend Analysis': [
    'Show me classic rock audience trend patterns and cultural engagement analysis'
  ],
  'Predictive Modeling': [
    'Which markets are most likely to have strong documentary box office performance?'
  ]
};

export const DISABLED_ANALYSIS_CATEGORIES = {
  'Nonlinear Analysis': [
    'What complex patterns exist in entertainment data that linear models miss?'
  ],
  'Similarity Analysis': [
    'Which markets are most similar to our top-performing documentary locations?'
  ],
  'Feature Selection Analysis': [
    'Which features are truly essential for predicting documentary audience success?'
  ],
  'Interpretability Analysis': [
    'What are the most transparent insights we can provide about classic rock audiences?'
  ],
  'Neural Network Analysis': [
    'What complex patterns can deep learning uncover in entertainment preferences?'
  ],
  'Speed Optimized Analysis': [
    'What insights can we get instantly for time-critical documentary launch decisions?'
  ]
};

export const TRENDS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for housing development in the Quebec region',
    'Which markets have the largest opportunities for major housing investment',
    'Which markets have the most reliable data for housing strategic planning?',
    'Which markets are most adaptable to different housing market scenarios?'
  ],
  'Competitive Intelligence': [
    'Where do ownership rates have the biggest advantages over rental markets in Quebec?',
    'Compare housing market positions across major metropolitan areas',
    'Where is homeownership strongest and where does it need development?',
    'Which markets have the strongest housing market positioning?',
    'Show me the percent difference between homeownership and rental rates',
    'Where does homeownership have the largest market share lead?'
  ],
  'Customer & Demographics': [
    'Which markets have the highest demographic opportunity scores for housing?',
    'Show me markets with the clearest demographic segments for housing development',
    'What market factors are most strongly associated with homeownership rates?',
    'Which markets have the strongest interactions between demographics, income, and housing preference?',
    'Which markets best match ideal housing demographic profiles?',
    'Where are high-income households and young families concentrated?',
    'Show me demographic distribution for housing markets across different regions'
  ],
  'Location & Real Estate': [
    'Show me geographic clusters of similar markets for regional housing planning',
    'Which locations are best for new housing development projects?',
    'Show me markets that are exceptional outliers with unique housing characteristics',
    'Show me markets with unusual housing patterns that need investigation'
  ],
  'Multi-Analysis & Insights': [
    'Compare housing demographic profiles with strategic market opportunities',
    'Show me areas with high demographic scores AND strong housing market positioning',
    'Which markets combine ideal housing demographic fit with growth potential?',
    'Analyze housing demographics alongside market trends and competitive landscape',
    'Where do demographic profiles, income levels, and strategic value align best for housing?'
  ],
  'City & Regional Comparisons': [
    'Compare housing performance between Montreal and Quebec City',
    'How does Laval demographic opportunity compare to Gatineau?',
    'Compare Montreal vs Quebec City for housing market positioning',
    'Montreal vs Quebec City: which city has better demographics for housing?',
    'Compare demographic scores between major Quebec metropolitan areas',
    'Which performs better for housing: Montreal or Quebec City markets?',
    'Compare strategic value between Laval and Gatineau',
    'Montreal vs Quebec City: demographic and housing market opportunity comparison'
  ],
  'Scenario Planning & Adaptability': [
    'Which markets are most adaptable to different housing market strategic scenarios?',
    'What if interest rates change - which housing markets would be most resilient?',
    'Show me markets with the highest flexibility for housing strategic pivots',
    'Which markets can best handle economic downturns for housing demand?',
    'Where should we invest for maximum housing scenario flexibility?',
    'Which markets have proven resilience across multiple economic cycles?',
    'Show me markets that perform well under various what-if housing scenarios',
    'Which areas offer the best strategic pivot opportunities for housing investment?'
  ],
  'Trends & Growth Analysis': [
    'Show me markets with the strongest growth trends for housing demand',
    'Which areas have consistent upward momentum for housing?',
    'Where is homeownership experiencing the fastest growth?',
    'Which markets show accelerating demand for housing?',
    'Identify emerging markets with high growth potential for housing',
    'Show me markets with stable, predictable housing growth patterns'
  ],
  'Data Quality & Anomalies': [
    'Which markets show unusual housing patterns that warrant investigation?',
    'Show me statistical outliers in housing market performance',
    'Where are there data anomalies in housing market metrics?',
    'Identify markets with exceptional housing characteristics needing validation',
    'Which areas have performance metrics that deviate from regional housing norms?',
    'Show me markets with suspicious or inconsistent housing data patterns'
  ],
  'Advanced Analytics': [
    'Which markets have the strongest interactions between demographics and homeownership rates?',
    'Show me where multiple factors synergistically drive housing success',
    'Which markets are most likely to grow for housing in the next year?',
    'Forecast housing performance trends across different Quebec regions',
    'Where do income, age, and family factors combine to predict housing success?',
    'Show me markets where housing preference aligns with demographic clusters'
  ]
}; 