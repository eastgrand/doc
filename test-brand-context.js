// Test updated brand context in EnhancedQueryAnalyzer
const { EnhancedQueryAnalyzer } = require('./lib/analysis/EnhancedQueryAnalyzer.ts');

const TEST_QUERIES = {
  'Strategic Analysis (H&R Block expansion)': 'Show me the top strategic markets for H&R Block tax service expansion',
  'Comparative Analysis (Counties)': 'Compare H&R Block usage between Alachua County and Miami-Dade County', 
  'Competitive Analysis (Market Share)': 'Show me the market share difference between H&R Block and TurboTax',
  'Demographic Insights (Tax Services)': 'Which areas have the best customer demographics for tax preparation services?',
  'Brand Recognition Test': 'H&R Block vs TurboTax competitive analysis',
  'H&R Block Specific': 'H&R Block expansion opportunities',
  'TurboTax Specific': 'TurboTax market penetration analysis'
};

const analyzer = new EnhancedQueryAnalyzer();

console.log('=== Testing Updated Brand Context (H&R Block/TurboTax) ===\n');

for (const [testName, query] of Object.entries(TEST_QUERIES)) {
  console.log(`Test: ${testName}`);
  console.log(`Query: "${query}"`);
  
  try {
    const bestEndpoint = analyzer.getBestEndpoint(query);
    const scores = analyzer.analyzeQuery(query);
    
    console.log(`✅ Best Endpoint: ${bestEndpoint}`);
    console.log(`Top 3 Scored Endpoints:`);
    scores.slice(0, 3).forEach((score, index) => {
      console.log(`  ${index + 1}. ${score.endpoint} (${score.score.toFixed(2)}) - ${score.reasons.join(', ')}`);
    });
    
    // Test brand identification
    const mentionedBrands = scores[0].reasons.filter(reason => 
      reason.includes('H&R Block') || reason.includes('TurboTax') || reason.includes('brand')
    );
    
    if (mentionedBrands.length > 0) {
      console.log(`🎯 Brand Context Detected: ${mentionedBrands.join('; ')}`);
    }
    
    // Test field identification
    const fields = analyzer.getQueryFields(query);
    if (fields.length > 0) {
      console.log(`📊 Identified Fields: ${fields.slice(0, 3).map(f => f.field).join(', ')}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  console.log('---\n');
}

// Test specific brand keyword recognition
console.log('=== Brand Keyword Recognition Test ===\n');

const BRAND_TESTS = [
  'h&r block',
  'hr block', 
  'H and R Block',
  'turbotax',
  'turbo tax',
  'TurboTax'
];

BRAND_TESTS.forEach(brandQuery => {
  console.log(`Testing brand keyword: "${brandQuery}"`);
  const fields = analyzer.getQueryFields(brandQuery);
  const relevantFields = fields.filter(f => 
    f.field.includes('MP30034A_B') || f.field.includes('MP30029A_B')
  );
  
  if (relevantFields.length > 0) {
    console.log(`✅ Brand recognized: ${relevantFields[0].description}`);
  } else {
    console.log(`❌ Brand not recognized`);
  }
});