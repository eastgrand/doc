// Testing utilities for analysis types:
// - test-brand-context.js: Tests EnhancedQueryAnalyzer brand context and routing
// - test-data-loading.js: Tests endpoint JSON data loading and field availability
// Use these when adding/enabling new query types or updating brand context

export const ANALYSIS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for Red Bull energy drink expansion'
  ],
  'Comparative Analysis': [
    'Compare Red Bull usage between Los Angeles County and Orange County'
  ],
  'Brand Difference': [
    'Show me the market share difference between Red Bull and Monster Energy'
  ],
  'Demographic Insights': [
    'Which areas have the best customer demographics for energy drinks?'
  ],
  // Re-enabled categories for comprehensive testing coverage
  'Customer Profile': [
    'Show me areas with ideal customer personas for energy drinks'
  ],
  'Spatial Clusters': [
    'Show me geographic clusters of similar energy drink markets'  
  ], 
  'Outlier Detection': [
    'Show me markets that have outliers with unique energy drink characteristics'
  ],
  'Competitive Analysis': [
    'Show me areas with the best competitive positioning for Red Bull'
  ],
  'Scenario Analysis': [
    'What if Red Bull changes its pricing strategy - which markets would be most resilient?'
  ],
  'Feature Interactions': [
    'Which markets have the strongest interactions between demographics and energy drink usage?'
  ],
  'Segment Profiling': [
    'Which markets have the clearest customer segmentation profiles for energy drinks?'
  ],
  'Sensitivity Analysis': [
    'How do energy drink rankings change if we adjust demographic weights by 20%?'
  ],
  'Feature Importance Ranking': [
    'What are the most important factors predicting Red Bull usage?'
  ],
  'Model Performance': [
    'How accurate are our predictions for energy drink market performance?'
  ],
  'Algorithm Comparison': [
    'Which AI model performs best for predicting energy drink usage in each area?'
  ],
  'Ensemble Analysis': [
    'Show me the highest confidence predictions using our best ensemble model'
  ],
  'Model Selection': [
    'What is the optimal AI algorithm for predictions in each geographic area?'
  ],
  'Dimensionality Insights': [
    'Which factors explain most of the variation in energy drink market performance?'
  ],
  'Consensus Analysis': [
    'Where do all our AI models agree on energy drink predictions?'
  ],
  'Anomaly Insights': [
    'Which unusual market patterns represent the biggest business opportunities?'
  ],
  'Cluster Analysis': [
    'How should we segment energy drink markets for targeted strategies?'
  ],
  'Analyze': [
    'Provide comprehensive market insights for energy drinks'
  ],
  'Correlation Analysis': [
    'What market factors are most strongly correlated with Red Bull usage?'
  ],
  'Trend Analysis': [
    'Show me energy drink trend patterns and temporal analysis'
  ],
  'Predictive Modeling': [
    'Which markets are most likely to grow for Red Bull in the next year?'
  ]
};

export const DISABLED_ANALYSIS_CATEGORIES = {
  'Nonlinear Analysis': [
    'What complex patterns exist in energy drink data that linear models miss?'
  ],
  'Similarity Analysis': [
    'Which markets are most similar to our top-performing Red Bull locations?'
  ],
  'Feature Selection Analysis': [
    'Which features are truly essential for predicting energy drink success?'
  ],
  'Interpretability Analysis': [
    'What are the most transparent insights we can provide about energy drink markets?'
  ],
  'Neural Network Analysis': [
    'What complex patterns can deep learning uncover in energy drink data?'
  ],
  'Speed Optimized Analysis': [
    'What insights can we get instantly for time-critical energy drink decisions?'
  ]
};

export const TRENDS_CATEGORIES = {
  'Strategic Analysis': [
    'Show me the top strategic markets for Red Bull expansion in the West Coast region',
    'Which markets have the largest opportunities for major Red Bull investment',
    'Which markets have the most reliable data for energy drink strategic planning?',
    'Which markets are most adaptable to different energy drink scenarios?'
  ],
  'Competitive Intelligence': [
    'Where does Red Bull have the biggest competitive advantages against Monster Energy in California?',
    'Compare Red Bull\'s market position against competitors in major metropolitan areas',
    'Where is Red Bull\'s brand strongest and where does it need development?',
    'Which markets have the strongest Red Bull brand positioning?',
    'Show me the percent difference in market share between Red Bull and Monster Energy',
    'Where does Red Bull have the largest market share lead over competitors?'
  ],
  'Customer & Demographics': [
    'Which markets have the highest demographic opportunity scores for Red Bull?',
    'Show me markets with the clearest customer segments for energy drink marketing',
    'What market factors are most strongly associated with Red Bull usage?',
    'Which markets have the strongest interactions between demographics, income, and energy drink preference?',
    'Which markets best match Red Bull\'s target customer profile?',
    'Where are Active Lifestyle and Young Professionals concentrated?',
    'Show me customer persona distribution for energy drinks across different markets'
  ],
  'Location & Real Estate': [
    'Show me geographic clusters of similar markets for regional energy drink planning',
    'Which locations are best for new Red Bull marketing campaigns?',
    'Show me markets that are exceptional outliers with unique energy drink characteristics',
    'Show me markets with unusual energy drink consumption patterns that need investigation'
  ],
  'Multi-Analysis & Insights': [
    'Compare energy drink customer profiles with strategic market opportunities',
    'Show me areas with high demographic scores AND strong competitive positioning for energy drinks',
    'Which markets combine ideal energy drink customer fit with growth potential?',
    'Analyze energy drink customer personas alongside market trends and competitive landscape',
    'Where do customer profiles, demographics, and strategic value align best for Red Bull?'
  ],
  'City & Regional Comparisons': [
    'Compare Red Bull performance between Los Angeles and San Francisco',
    'How does San Diego demographic opportunity compare to Sacramento?',
    'Compare Fresno vs Bakersfield for Red Bull brand positioning',
    'Los Angeles vs San Diego: which city has better customer profiles for energy drinks?',
    'Compare demographic scores between major California metropolitan areas',
    'Which performs better for Red Bull: Oakland or San Jose markets?',
    'Compare strategic value between Long Beach and Anaheim',
    'San Francisco vs Los Angeles: demographic and energy drink market opportunity comparison'
  ],
  'Scenario Planning & Adaptability': [
    'Which markets are most adaptable to different energy drink strategic scenarios?',
    'What if Red Bull changes its pricing strategy - which markets would be most resilient?',
    'Show me markets with the highest flexibility for energy drink strategic pivots',
    'Which markets can best handle economic downturns for energy drink consumption?',
    'Where should Red Bull invest for maximum scenario flexibility?',
    'Which markets have proven resilience across multiple seasons?',
    'Show me markets that perform well under various what-if energy drink scenarios',
    'Which areas offer the best strategic pivot opportunities for Red Bull?'
  ],
  'Trends & Growth Analysis': [
    'Show me markets with the strongest growth trends for Red Bull usage',
    'Which areas have consistent upward momentum for energy drinks?',
    'Where is Red Bull experiencing the fastest market share growth?',
    'Which markets show accelerating demand for energy drinks?',
    'Identify emerging markets with high growth potential for Red Bull',
    'Show me markets with stable, predictable energy drink growth patterns'
  ],
  'Data Quality & Anomalies': [
    'Which markets show unusual energy drink patterns that warrant investigation?',
    'Show me statistical outliers in Red Bull market performance',
    'Where are there data anomalies in energy drink market metrics?',
    'Identify markets with exceptional energy drink characteristics needing validation',
    'Which areas have performance metrics that deviate from regional energy drink norms?',
    'Show me markets with suspicious or inconsistent energy drink consumption data patterns'
  ],
  'Advanced Analytics': [
    'Which markets have the strongest interactions between demographics and Red Bull usage?',
    'Show me where multiple factors synergistically drive energy drink success',
    'Which markets are most likely to grow for Red Bull in the next year?',
    'Forecast Red Bull performance trends across different California regions',
    'Where do income, age, and lifestyle factors combine to predict energy drink success?',
    'Show me markets where energy drink loyalty aligns with demographic clusters'
  ]
}; 