// Test script for query classifier with specific examples
const { QueryClassifier } = require('../lib/query-classifier');

async function testQueries() {
  const classifier = new QueryClassifier();
  
  const testCases = [
    // Bivariate tests
    "compare population density and income using colors",
    "map income and education together",
    "show relationship between crime and poverty using colors",
    
    // Hotspot tests
    "find areas with high population density",
    "display areas with high traffic congestion",
    "show me areas with high air pollution",
    
    // Scatter tests
    "show me all the schools",
    "map all the parks",
    "show me where all the libraries are",
    
    // Network tests
    "visualize migration flows",
    
    // Comparison tests
    "compare crime rates between neighborhoods",
    "how do property values compare to city average",
    
    // Correlation tests
    "show relationship between crime and poverty",
    "analyze the relationship between housing prices and school quality"
  ];
  
  for (const query of testCases) {
    const result = await classifier.classifyQuery(query);
    console.log(`Query: "${query}"`);
    console.log(`  → Type: ${result.visualizationType}, Confidence: ${result.confidence.toFixed(2)}`);
    console.log();
  }
}

testQueries().catch(console.error); 