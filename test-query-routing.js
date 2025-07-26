/**
 * Query Routing Test
 * Tests that queries trigger the correct endpoints
 */

const queries = [
  { query: "Show me the top strategic markets for Nike expansion", expectedEndpoint: "/analyze" },
  { query: "Which markets have the largest market opportunities", expectedEndpoint: "/market-sizing" },
  { query: "Where does Nike have the biggest competitive advantages", expectedEndpoint: "/competitive-analysis" },
  { query: "Compare Nike's market position against competitors", expectedEndpoint: "/comparative-analysis" },
  { query: "Which markets have the best demographic fit", expectedEndpoint: "/demographic-insights" },
  { query: "Show me markets with the clearest customer segments", expectedEndpoint: "/segment-profiling" },
  { query: "Show me geographic clusters of similar markets", expectedEndpoint: "/spatial-clusters" },
  { query: "Which locations are best for new Nike flagship stores", expectedEndpoint: "/real-estate-analysis" },
  { query: "What market factors are most strongly correlated", expectedEndpoint: "/correlation-analysis" },
  { query: "Which markets have the strongest interactions", expectedEndpoint: "/feature-interactions" },
  { query: "Which markets are most adaptable to different scenarios", expectedEndpoint: "/scenario-analysis" },
  { query: "Which markets have the most reliable data", expectedEndpoint: "/predictive-modeling" },
  { query: "Show me markets with unusual patterns", expectedEndpoint: "/anomaly-detection" },
  { query: "Show me markets that are exceptional outliers", expectedEndpoint: "/outlier-detection" },
  { query: "Where is Nike's brand strongest", expectedEndpoint: "/brand-analysis" }
];

console.log('🎯 Testing Query → Endpoint Routing...\n');

queries.forEach((test, index) => {
  console.log(`${index + 1}. Query: "${test.query}"`);
  console.log(`   Expected: ${test.expectedEndpoint}`);
  console.log(`   Keywords: ${extractKeywords(test.query)}\n`);
});

function extractKeywords(query) {
  const keywordMap = {
    '/analyze': ['strategic', 'overall', 'priority', 'investment', 'expansion'],
    '/market-sizing': ['largest', 'opportunities', 'market size', 'opportunity'],
    '/competitive-analysis': ['competitive', 'advantages', 'competition'],
    '/comparative-analysis': ['compare', 'comparison', 'position', 'against'],
    '/demographic-insights': ['demographic', 'fit', 'customer profile'],
    '/segment-profiling': ['segments', 'customer segments', 'targeting'],
    '/spatial-clusters': ['geographic', 'clusters', 'similar markets'],
    '/real-estate-analysis': ['locations', 'flagship stores', 'real estate'],
    '/correlation-analysis': ['correlated', 'factors', 'relationships'],
    '/feature-interactions': ['interactions', 'strongest interactions'],
    '/scenario-analysis': ['scenarios', 'adaptable', 'strategic scenarios'],
    '/predictive-modeling': ['predictable', 'reliable data', 'planning'],
    '/anomaly-detection': ['unusual', 'patterns', 'investigate'],
    '/outlier-detection': ['outliers', 'exceptional', 'unique'],
    '/brand-analysis': ['brand', 'Nike brand', 'strongest']
  };
  
  const queryLower = query.toLowerCase();
  const matchedKeywords = [];
  
  Object.entries(keywordMap).forEach(([endpoint, keywords]) => {
    keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    });
  });
  
  return matchedKeywords.join(', ') || 'No keywords matched';
}

console.log('💡 Manual Test Instructions:');
console.log('1. Run a few of these queries in the live app');
console.log('2. Check browser network tab to see which endpoint is called');
console.log('3. Verify the correct processor is used in console logs');
console.log('4. Confirm visualization renders properly');