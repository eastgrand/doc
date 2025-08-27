/**
 * EndpointDescriptions - Comprehensive descriptions for semantic routing
 * 
 * Rich descriptions including sample queries, field mappings, use cases,
 * and business context for each analysis endpoint.
 */

export interface EndpointDescription {
  endpoint: string;
  title: string;
  description: string;
  sampleQueries: string[];
  fieldMappings: string[];
  useCases: string[];
  businessContext: string;
  keywords: string[];
  semanticConcepts: string[];
}

export const ENDPOINT_DESCRIPTIONS: Record<string, EndpointDescription> = {
  '/strategic-analysis': {
    endpoint: '/strategic-analysis',
    title: 'Strategic Market Analysis',
    description: 'Comprehensive strategic analysis for market expansion, investment decisions, and high-level business planning. Identifies top strategic opportunities and markets with highest business value.',
    sampleQueries: [
      'Show me the top strategic markets for Red Bull energy drink expansion',
      'Which areas offer the best strategic opportunities for expansion?',
      'Find strategic markets with high investment potential',
      'Where should we focus our strategic business development efforts?',
      'Identify the most promising markets for energy drink growth',
      'Top strategic markets for beverage expansion',
      'Best markets for Red Bull expansion strategy'
    ],
    fieldMappings: ['strategic_value', 'market_opportunity', 'investment_potential', 'business_value'],
    useCases: ['Market expansion planning', 'Investment prioritization', 'Strategic planning', 'Business development'],
    businessContext: 'High-level strategic decision making for expansion and investment allocation',
    keywords: ['strategic', 'expansion', 'investment', 'opportunity', 'business planning', 'growth markets', 'red bull', 'energy drink', 'beverage', 'brand expansion'],
    semanticConcepts: ['strategic planning', 'market expansion', 'business opportunities', 'investment decisions', 'growth strategy', 'energy drink markets', 'beverage industry expansion']
  },

  '/comparative-analysis': {
    endpoint: '/comparative-analysis',
    title: 'Geographic Comparison Analysis',
    description: 'Compare performance, metrics, and characteristics between specific geographic areas, cities, counties, or regions. Side-by-side analysis of different locations.',
    sampleQueries: [
      'Compare Red Bull consumption between Alachua County and Miami-Dade County',
      'Compare performance between Jacksonville and Tampa',
      'How does Miami demographic opportunity compare to Orlando?',
      'Brooklyn vs Manhattan market comparison',
      'Compare customer profiles between different cities'
    ],
    fieldMappings: ['comparative_metrics', 'regional_data', 'geographic_comparison', 'location_performance'],
    useCases: ['City comparisons', 'Regional analysis', 'Location benchmarking', 'Market sizing'],
    businessContext: 'Understanding relative performance and characteristics between specific geographic areas',
    keywords: ['compare', 'comparison', 'between', 'versus', 'vs', 'cities', 'regions', 'counties'],
    semanticConcepts: ['geographic comparison', 'regional analysis', 'location benchmarking', 'area comparison', 'market comparison']
  },

  '/competitive-analysis': {
    endpoint: '/competitive-analysis',
    title: 'Competitive Market Share Analysis',
    description: 'Analyze market share differences, competitive positioning, and quantitative performance comparisons between brands and competitors.',
    sampleQueries: [
      'Show me the market share difference between Red Bull and Monster Energy',
      'What is the competitive landscape for energy drink brands?',
      'How does Red Bull market share compare to competitors?',
      'Analyze competitive positioning in the energy drink market',
      'Market share analysis between major beverage brands'
    ],
    fieldMappings: ['market_share', 'competitive_metrics', 'brand_performance', 'competitive_positioning'],
    useCases: ['Competitive intelligence', 'Market share analysis', 'Brand positioning', 'Competitive benchmarking'],
    businessContext: 'Understanding competitive dynamics and market share performance against rivals',
    keywords: ['market share', 'competitive', 'competitors', 'brands', 'positioning', 'competitive positioning', 'competitive analysis', 'market dynamics', 'competitive landscape', 'market competition'],
    semanticConcepts: ['competitive analysis', 'market share', 'brand competition', 'competitive intelligence', 'market positioning']
  },

  '/demographic-insights': {
    endpoint: '/demographic-insights',
    title: 'Demographic Analysis',
    description: 'Analyze population demographics, age distributions, income levels, ethnicity, and customer characteristics to understand market composition.',
    sampleQueries: [
      'Which areas have the best customer demographics for energy drink sales?',
      'Show me demographic breakdown by income and age',
      'Find areas with high-income young professionals',
      'Demographic analysis of target customer segments',
      'Where are the ideal customer demographics located?'
    ],
    fieldMappings: ['demographics', 'age', 'income', 'population', 'ethnicity', 'customer_characteristics'],
    useCases: ['Customer targeting', 'Market sizing', 'Demographic profiling', 'Location planning'],
    businessContext: 'Understanding who lives where and their demographic characteristics for targeting',
    keywords: ['demographic', 'demographics', 'customer demographics', 'age', 'income', 'population', 'customers', 'ethnicity', 'demographic insights', 'demographic analysis', 'demographic breakdown'],
    semanticConcepts: ['demographic analysis', 'population characteristics', 'customer demographics', 'market composition', 'target audience']
  },

  '/customer-profile': {
    endpoint: '/customer-profile',
    title: 'Customer Profile Analysis',
    description: 'Identify areas with ideal customer personas, target customer characteristics, and customer fit analysis for specific business services.',
    sampleQueries: [
      'Show me areas with ideal customer personas for energy drink consumption',
      'Find markets that match our target customer profile',
      'Where are our ideal customers located?',
      'Customer persona distribution across markets',
      'Areas with best customer fit for our services'
    ],
    fieldMappings: ['customer_personas', 'target_customers', 'customer_fit', 'ideal_customers'],
    useCases: ['Customer targeting', 'Persona mapping', 'Market fit analysis', 'Customer acquisition'],
    businessContext: 'Identifying where ideal customers are located for targeted marketing and service delivery',
    keywords: ['customer persona', 'ideal customers', 'target customers', 'customer fit', 'customer characteristics'],
    semanticConcepts: ['customer profiling', 'target audience', 'customer personas', 'ideal customers', 'customer segmentation']
  },

  '/spatial-clusters': {
    endpoint: '/spatial-clusters',
    title: 'Geographic Clustering Analysis',
    description: 'Identify geographic clusters of similar markets, spatial patterns, and regional groupings based on characteristics and performance.',
    sampleQueries: [
      'Show me geographic clusters of similar energy drink markets',
      'Find spatial patterns in market performance',
      'Identify regional clusters with similar characteristics',
      'Geographic groupings of similar markets',
      'Spatial clustering of customer segments'
    ],
    fieldMappings: ['spatial_clusters', 'geographic_patterns', 'regional_groupings', 'location_similarity'],
    useCases: ['Regional strategy', 'Market segmentation', 'Geographic planning', 'Spatial analysis'],
    businessContext: 'Understanding geographic patterns and spatial relationships between similar markets',
    keywords: ['geographic clusters', 'spatial', 'regional', 'geographic patterns', 'similar markets'],
    semanticConcepts: ['spatial clustering', 'geographic patterns', 'regional analysis', 'location grouping', 'spatial analysis']
  },

  '/correlation-analysis': {
    endpoint: '/correlation-analysis',
    title: 'Correlation and Association Analysis',
    description: 'Analyze correlations, associations, and relationships between different market factors, variables, and performance metrics.',
    sampleQueries: [
      'What market factors are most strongly correlated with Red Bull consumption?',
      'Find correlations between demographics and service usage',
      'Which variables are associated with market performance?',
      'Correlation analysis between income and energy drink consumption',
      'What factors correlate with customer satisfaction?'
    ],
    fieldMappings: ['correlations', 'associations', 'relationships', 'factor_analysis'],
    useCases: ['Factor analysis', 'Relationship discovery', 'Predictive insights', 'Market research'],
    businessContext: 'Understanding which factors drive performance and how variables relate to each other',
    keywords: ['correlation', 'correlated', 'associated', 'relationship', 'factors', 'variables'],
    semanticConcepts: ['correlation analysis', 'factor relationships', 'variable associations', 'statistical relationships', 'factor analysis']
  },

  '/outlier-detection': {
    endpoint: '/outlier-detection',
    title: 'Market Outlier Detection',
    description: 'Identify markets with unique characteristics, unusual patterns, or exceptional properties that deserve special investigation.',
    sampleQueries: [
      'Show me markets that have outliers with unique energy drink consumption patterns',
      'Find unusual markets that need special attention',
      'Identify markets with exceptional characteristics',
      'Markets with unique patterns requiring investigation',
      'Outlying markets with distinctive properties'
    ],
    fieldMappings: ['outliers', 'unique_characteristics', 'unusual_patterns', 'exceptional_markets'],
    useCases: ['Market investigation', 'Exception analysis', 'Special cases', 'Quality assurance'],
    businessContext: 'Identifying markets that behave differently and may require special attention or strategy',
    keywords: ['outliers', 'unique characteristics', 'unusual', 'exceptional', 'distinctive', 'investigation'],
    semanticConcepts: ['outlier detection', 'unusual patterns', 'exceptional markets', 'unique characteristics', 'anomalous behavior']
  },

  '/brand-difference': {
    endpoint: '/brand-difference',
    title: 'Brand Positioning Analysis',
    description: 'Analyze brand strength, positioning differences, and qualitative brand performance across markets and competitors.',
    sampleQueries: [
      'Which markets have the strongest Red Bull brand positioning vs competitors?',
      'Brand strength analysis across different regions',
      'Where is our brand positioning most effective?',
      'Brand differentiation analysis by market',
      'Competitive brand positioning comparison'
    ],
    fieldMappings: ['brand_strength', 'brand_positioning', 'brand_performance', 'brand_differentiation'],
    useCases: ['Brand strategy', 'Market positioning', 'Brand development', 'Competitive branding'],
    businessContext: 'Understanding brand strength and positioning effectiveness across different markets',
    keywords: ['brand positioning', 'brand strength', 'strongest brand', 'brand performance', 'brand differentiation'],
    semanticConcepts: ['brand analysis', 'brand positioning', 'brand strength', 'market positioning', 'brand effectiveness']
  },

  '/scenario-analysis': {
    endpoint: '/scenario-analysis',
    title: 'Scenario Planning and What-If Analysis',
    description: 'Analyze different business scenarios, what-if situations, and market resilience under various conditions and changes.',
    sampleQueries: [
      'What if Red Bull changes its pricing strategy - which markets would be most resilient?',
      'Scenario analysis for different economic conditions',
      'How would markets respond to service changes?',
      'What-if analysis for strategic decisions',
      'Market resilience under different scenarios'
    ],
    fieldMappings: ['scenario_planning', 'market_resilience', 'what_if_analysis', 'strategic_scenarios'],
    useCases: ['Strategic planning', 'Risk assessment', 'Decision support', 'Contingency planning'],
    businessContext: 'Understanding how markets would respond to different business decisions and external changes',
    keywords: ['what if', 'scenario', 'resilient', 'changes', 'conditions', 'strategic decisions'],
    semanticConcepts: ['scenario planning', 'what-if analysis', 'market resilience', 'strategic scenarios', 'contingency planning']
  },

  '/trend-analysis': {
    endpoint: '/trend-analysis',
    title: 'Trend and Growth Analysis',
    description: 'Analyze growth trends, momentum, and temporal patterns in market performance and customer behavior.',
    sampleQueries: [
      'Show me markets with the strongest growth trends for energy drink sales',
      'Trend analysis of market performance over time',
      'Which areas show positive growth momentum?',
      'Growth trends in customer acquisition',
      'Markets with accelerating performance trends'
    ],
    fieldMappings: ['growth_trends', 'momentum', 'temporal_patterns', 'trend_analysis'],
    useCases: ['Growth planning', 'Trend forecasting', 'Performance tracking', 'Market dynamics'],
    businessContext: 'Understanding growth patterns and momentum to identify emerging opportunities',
    keywords: ['trends', 'growth', 'momentum', 'temporal', 'growth patterns', 'market dynamics'],
    semanticConcepts: ['trend analysis', 'growth patterns', 'market momentum', 'temporal analysis', 'performance trends']
  },

  '/feature-interactions': {
    endpoint: '/feature-interactions',
    title: 'Feature Interaction Analysis',
    description: 'Analyze interactions between different factors, variables, and how combinations of features affect outcomes.',
    sampleQueries: [
      'Which markets have the strongest interactions between demographics and energy drink consumption?',
      'Feature interaction analysis for customer behavior',
      'How do income and age interact to predict service usage?',
      'Interaction effects between market factors',
      'Combined influence of multiple variables'
    ],
    fieldMappings: ['feature_interactions', 'variable_interactions', 'factor_combinations', 'interaction_effects'],
    useCases: ['Advanced analytics', 'Predictive modeling', 'Factor analysis', 'Complex relationships'],
    businessContext: 'Understanding how combinations of factors work together to influence outcomes',
    keywords: ['interactions', 'between', 'combined', 'factors', 'variables', 'relationships'],
    semanticConcepts: ['feature interactions', 'variable relationships', 'factor combinations', 'interaction effects', 'complex relationships']
  },

  '/predictive-modeling': {
    endpoint: '/predictive-modeling',
    title: 'Predictive Analytics and Forecasting',
    description: 'Generate predictions, forecasts, and likelihood estimates for future market performance and growth.',
    sampleQueries: [
      'Which markets are most likely to grow for Red Bull in the next year?',
      'Predict future market performance',
      'Forecast customer growth in different regions',
      'Market growth predictions and likelihood',
      'Future performance forecasting'
    ],
    fieldMappings: ['predictions', 'forecasts', 'likelihood', 'future_performance', 'growth_predictions'],
    useCases: ['Business forecasting', 'Growth planning', 'Predictive analytics', 'Future planning'],
    businessContext: 'Predicting future performance and identifying markets with highest growth potential',
    keywords: ['predict', 'forecast', 'likely to grow', 'future', 'predictions', 'growth potential'],
    semanticConcepts: ['predictive modeling', 'forecasting', 'future predictions', 'growth forecasting', 'predictive analytics']
  },

  '/segment-profiling': {
    endpoint: '/segment-profiling',
    title: 'Market Segmentation Profiling',
    description: 'Analyze customer segmentation profiles, market segments, and detailed segment characteristics.',
    sampleQueries: [
      'Which markets have the clearest customer segmentation profiles for energy drinks?',
      'Market segmentation analysis by customer type',
      'Customer segment profiling across regions',
      'Detailed segment characteristics and profiles',
      'Segmentation clarity and definition analysis'
    ],
    fieldMappings: ['market_segments', 'customer_segmentation', 'segment_profiles', 'segmentation_clarity'],
    useCases: ['Customer segmentation', 'Market profiling', 'Targeted marketing', 'Segment strategy'],
    businessContext: 'Understanding how clearly defined customer segments are in different markets',
    keywords: ['segmentation', 'segments', 'customer segments', 'segment profiling', 'clearest segments'],
    semanticConcepts: ['market segmentation', 'customer segments', 'segment profiling', 'segmentation analysis', 'customer profiling']
  },

  '/sensitivity-analysis': {
    endpoint: '/sensitivity-analysis',
    title: 'Sensitivity and Impact Analysis',
    description: 'Analyze sensitivity to changes, impact of adjustments, and how modifications to parameters affect outcomes.',
    sampleQueries: [
      'How do energy drink market rankings change if we adjust income weights by 20%?',
      'Sensitivity analysis for parameter changes',
      'Impact of adjusting market variables',
      'How sensitive are results to input changes?',
      'Effect of modifying weights and parameters'
    ],
    fieldMappings: ['sensitivity', 'impact_analysis', 'parameter_changes', 'variable_adjustments'],
    useCases: ['Parameter tuning', 'Model validation', 'Impact assessment', 'Robustness testing'],
    businessContext: 'Understanding how sensitive results are to changes in assumptions and parameters',
    keywords: ['sensitivity', 'adjust', 'changes', 'weights', 'parameters', 'impact'],
    semanticConcepts: ['sensitivity analysis', 'parameter sensitivity', 'impact analysis', 'variable adjustments', 'model sensitivity']
  },

  '/feature-importance-ranking': {
    endpoint: '/feature-importance-ranking',
    title: 'Feature Importance Analysis',
    description: 'Rank and analyze the importance of different factors, variables, and features in predicting outcomes.',
    sampleQueries: [
      'What are the most important factors predicting Red Bull consumption patterns?',
      'Feature importance ranking for customer behavior',
      'Which variables have the biggest impact on performance?',
      'Importance analysis of market factors',
      'Ranking factors by predictive power'
    ],
    fieldMappings: ['feature_importance', 'factor_ranking', 'variable_importance', 'predictive_power'],
    useCases: ['Factor analysis', 'Model interpretation', 'Variable selection', 'Insight discovery'],
    businessContext: 'Understanding which factors are most important for predicting business outcomes',
    keywords: ['important factors', 'importance', 'ranking', 'most important', 'predictive power'],
    semanticConcepts: ['feature importance', 'factor ranking', 'variable importance', 'predictive factors', 'importance analysis']
  },

  '/model-performance': {
    endpoint: '/model-performance',
    title: 'Model Accuracy and Performance',
    description: 'Evaluate model accuracy, prediction performance, and reliability of analytical models and forecasts.',
    sampleQueries: [
      'How accurate are our predictions for energy drink market performance?',
      'Model performance evaluation and accuracy metrics',
      'Reliability of prediction models',
      'Performance assessment of analytical models',
      'Accuracy analysis of forecasting models'
    ],
    fieldMappings: ['model_accuracy', 'prediction_performance', 'model_reliability', 'performance_metrics'],
    useCases: ['Model validation', 'Quality assurance', 'Performance monitoring', 'Model improvement'],
    businessContext: 'Assessing how well analytical models perform and their reliability for decision making',
    keywords: ['accurate', 'accuracy', 'performance', 'reliable', 'model performance', 'prediction accuracy'],
    semanticConcepts: ['model performance', 'prediction accuracy', 'model reliability', 'performance evaluation', 'model validation']
  },

  '/algorithm-comparison': {
    endpoint: '/algorithm-comparison',
    title: 'Algorithm Performance Comparison',
    description: 'Compare different algorithms, models, and analytical approaches to find the best performing methods.',
    sampleQueries: [
      'Which AI model performs best for predicting energy drink consumption in each area?',
      'Algorithm comparison for market analysis',
      'Best performing models for different regions',
      'Comparative analysis of analytical methods',
      'Model performance comparison across algorithms'
    ],
    fieldMappings: ['algorithm_performance', 'model_comparison', 'method_evaluation', 'algorithm_effectiveness'],
    useCases: ['Algorithm selection', 'Model comparison', 'Method evaluation', 'Performance benchmarking'],
    businessContext: 'Determining which analytical methods work best for different types of analysis',
    keywords: ['algorithm', 'model comparison', 'best performing', 'performs best', 'analytical methods'],
    semanticConcepts: ['algorithm comparison', 'model comparison', 'method evaluation', 'algorithm performance', 'comparative analysis']
  },

  '/ensemble-analysis': {
    endpoint: '/ensemble-analysis',
    title: 'Ensemble Model Analysis',
    description: 'Analyze ensemble model predictions, confidence levels, and combined model performance for robust insights.',
    sampleQueries: [
      'Show me the highest confidence predictions using our best ensemble model',
      'Ensemble model analysis and confidence scores',
      'Combined model predictions and reliability',
      'High-confidence insights from ensemble methods',
      'Robust predictions using multiple models'
    ],
    fieldMappings: ['ensemble_predictions', 'confidence_scores', 'combined_models', 'ensemble_performance'],
    useCases: ['High-confidence predictions', 'Robust analysis', 'Model combination', 'Confidence assessment'],
    businessContext: 'Providing the most reliable predictions by combining multiple analytical approaches',
    keywords: ['ensemble', 'confidence', 'highest confidence', 'combined models', 'robust predictions'],
    semanticConcepts: ['ensemble modeling', 'model combination', 'prediction confidence', 'robust analysis', 'ensemble methods']
  },

  '/model-selection': {
    endpoint: '/model-selection',
    title: 'Optimal Model Selection',
    description: 'Select optimal algorithms, models, and analytical approaches for specific use cases and geographic areas.',
    sampleQueries: [
      'What is the optimal AI algorithm for predictions in each geographic area?',
      'Best model selection for different regions',
      'Optimal analytical approach for specific markets',
      'Algorithm selection by geographic area',
      'Best methods for different market types'
    ],
    fieldMappings: ['optimal_models', 'model_selection', 'algorithm_choice', 'method_optimization'],
    useCases: ['Model optimization', 'Algorithm selection', 'Method choice', 'Analytical optimization'],
    businessContext: 'Choosing the best analytical approach for each specific situation and market',
    keywords: ['optimal', 'best algorithm', 'optimal algorithm', 'selection', 'best methods'],
    semanticConcepts: ['model selection', 'algorithm optimization', 'optimal methods', 'model choice', 'analytical optimization']
  },

  '/dimensionality-insights': {
    endpoint: '/dimensionality-insights',
    title: 'Dimensionality and Variance Analysis',
    description: 'Analyze which factors explain the most variation in data and understand the dimensionality of market characteristics.',
    sampleQueries: [
      'Which factors explain most of the variation in energy drink market performance?',
      'Dimensionality analysis of market factors',
      'What explains the most variance in customer behavior?',
      'Principal factors driving market differences',
      'Key dimensions of market variation'
    ],
    fieldMappings: ['variance_explanation', 'dimensionality', 'principal_factors', 'variation_analysis'],
    useCases: ['Dimensionality reduction', 'Factor analysis', 'Data understanding', 'Variable importance'],
    businessContext: 'Understanding which factors account for the most differences between markets',
    keywords: ['factors explain', 'variation', 'variance', 'dimensionality', 'principal factors'],
    semanticConcepts: ['dimensionality analysis', 'variance explanation', 'factor analysis', 'data dimensionality', 'variation analysis']
  },

  '/consensus-analysis': {
    endpoint: '/consensus-analysis',
    title: 'Model Consensus Analysis',
    description: 'Analyze where multiple models agree, find consensus predictions, and identify high-agreement insights.',
    sampleQueries: [
      'Where do all our AI models agree on energy drink market predictions?',
      'Consensus analysis across multiple models',
      'High-agreement predictions and insights',
      'Where do models converge in their predictions?',
      'Consensus insights from multiple analytical approaches'
    ],
    fieldMappings: ['model_consensus', 'agreement_analysis', 'consensus_predictions', 'model_convergence'],
    useCases: ['Consensus building', 'High-confidence insights', 'Model agreement', 'Robust predictions'],
    businessContext: 'Finding insights where multiple analytical approaches agree for highest confidence',
    keywords: ['consensus', 'models agree', 'all models', 'agreement', 'converge'],
    semanticConcepts: ['model consensus', 'analytical agreement', 'consensus predictions', 'model convergence', 'agreement analysis']
  },

  '/anomaly-insights': {
    endpoint: '/anomaly-insights',
    title: 'Anomaly and Business Opportunity Analysis',
    description: 'Identify unusual patterns, statistical anomalies, and extract business opportunities from anomalous market behavior.',
    sampleQueries: [
      'Which unusual market patterns represent the biggest business opportunities?',
      'Anomaly analysis for business insights',
      'Statistical outliers with business value',
      'Unusual patterns indicating opportunities',
      'Business opportunities from market anomalies'
    ],
    fieldMappings: ['anomalies', 'unusual_patterns', 'business_opportunities', 'statistical_outliers'],
    useCases: ['Opportunity identification', 'Anomaly detection', 'Business intelligence', 'Pattern recognition'],
    businessContext: 'Finding unusual patterns that represent potential business opportunities or require attention',
    keywords: ['anomaly', 'unusual patterns', 'business opportunities', 'statistical outliers', 'opportunities'],
    semanticConcepts: ['anomaly detection', 'unusual patterns', 'business opportunities', 'opportunity identification', 'pattern analysis']
  },

  '/cluster-analysis': {
    endpoint: '/cluster-analysis',
    title: 'Market Clustering and Segmentation Strategy',
    description: 'Analyze how to segment markets for targeted strategies, clustering approaches, and strategic market groupings.',
    sampleQueries: [
      'How should we segment energy drink markets for targeted strategies?',
      'Market clustering for strategic planning',
      'Optimal market segmentation approach',
      'Strategic clustering of customer markets',
      'Market grouping for targeted strategies'
    ],
    fieldMappings: ['market_clustering', 'strategic_segmentation', 'targeted_strategies', 'market_groupings'],
    useCases: ['Strategic segmentation', 'Market clustering', 'Targeted strategy', 'Strategic planning'],
    businessContext: 'Determining how to group markets for most effective targeted strategies and planning',
    keywords: ['how should we segment', 'clustering', 'targeted strategies', 'strategic segmentation', 'market grouping'],
    semanticConcepts: ['market clustering', 'strategic segmentation', 'targeted strategies', 'market grouping', 'segmentation strategy']
  },

  '/analyze': {
    endpoint: '/analyze',
    title: 'Comprehensive Analysis',
    description: 'Comprehensive, general-purpose analysis providing broad insights across multiple dimensions and analytical approaches.',
    sampleQueries: [
      'Provide comprehensive market insights for energy drink industry',
      'Complete analysis of market opportunities',
      'General analysis and insights',
      'Overall market assessment',
      'Comprehensive business intelligence'
    ],
    fieldMappings: ['comprehensive_analysis', 'general_insights', 'broad_analysis', 'overall_assessment'],
    useCases: ['General analysis', 'Comprehensive insights', 'Broad assessment', 'General intelligence'],
    businessContext: 'Providing broad, comprehensive insights when specific analysis type is not specified',
    keywords: ['comprehensive', 'general', 'overall', 'complete', 'broad analysis', 'analyze me', 'general analysis', 'broad assessment'],
    semanticConcepts: ['comprehensive analysis', 'general insights', 'broad assessment', 'overall analysis', 'general intelligence']
  }
};