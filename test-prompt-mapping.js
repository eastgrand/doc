// Test what prompt is actually being used for strategic analysis
const fs = require('fs');

// Mock the getAnalysisPrompt function logic
const analysisPrompts = {
  strategic_analysis: `
STRATEGIC ANALYSIS TECHNICAL CONTEXT:
You are analyzing strategic value data with pre-calculated scores for market expansion opportunities.

CRITICAL REQUIREMENTS:
1. ALWAYS preserve exact score precision - use 79.34, NOT 79.3
2. Rank and prioritize by strategic_value_score with full decimal places
3. Preserve all decimal precision in score reporting for accuracy
`,
  default: `
ANALYSIS TECHNICAL CONTEXT:
You are analyzing geographic and market data to provide strategic insights.

CRITICAL REQUIREMENTS:
1. Focus on actionable business insights
2. Rank and prioritize based on the primary scoring metric
3. Explain underlying factors driving performance
4. Provide strategic recommendations
`
};

function getAnalysisPrompt(analysisType) {
  const normalizedType = analysisType?.toLowerCase().replace(/-/g, '_') || 'default';
  
  const typeMapping = {
    'competitive': 'competitive_analysis',
    'demographic': 'demographic_insights', 
    'cluster': 'spatial_clusters',
    'clustering': 'spatial_clusters',
    'correlation': 'correlation_analysis',
    'risk': 'risk_assessment',
    'predictive': 'predictive_modeling',
    'prediction': 'predictive_modeling',
    'penetration': 'market_penetration',
    'strategic': 'strategic_analysis',  // FIXED: Added this mapping
    'strategy': 'strategic_analysis',   // FIXED: Added this mapping
    'analyze': 'general',
    'analysis': 'general'
  };

  const mappedType = typeMapping[normalizedType] || normalizedType;
  
  return analysisPrompts[mappedType] || analysisPrompts.default;
}

console.log('=== Testing Prompt Mapping ===\n');

// Test different analysis types that might be used for strategic queries
const testTypes = [
  'strategic',
  'strategic-analysis', 
  'strategic_analysis',
  'strategy',
  'analyze',
  'analysis',
  'default'
];

testTypes.forEach(type => {
  const prompt = getAnalysisPrompt(type);
  const isStrategicPrompt = prompt.includes('ALWAYS preserve exact score precision');
  const isDefault = prompt.includes('You are analyzing geographic and market data');
  
  console.log(`Type: "${type}"`);
  console.log(`  Normalized: "${type?.toLowerCase().replace(/-/g, '_')}"`);
  console.log(`  Uses strategic prompt: ${isStrategicPrompt ? '✅' : '❌'}`);
  console.log(`  Uses default prompt: ${isDefault ? '❌ (wrong!)' : '✅'}`);
  console.log('');
});

console.log('=== Key Finding ===');
console.log('Before fix: "strategic" and "strategic-analysis" fell back to default prompt');
console.log('After fix: Both now correctly map to strategic_analysis prompt with precision requirements');
console.log('');
console.log('The strategic analysis should now preserve decimal precision!');