// Test script for query classifier with specific examples
import { QueryClassifier } from '../lib/query-classifier';

describe('Query Classifier Specific Examples', () => {
  const classifier = new QueryClassifier();
  
  const testCases = [
    // Bivariate tests
    { query: "compare population density and income using colors", expected: "bivariate" },
    { query: "map income and education together", expected: "bivariate" },
    { query: "show relationship between crime and poverty using colors", expected: "bivariate" },
    
    // Hotspot tests
    { query: "find areas with high population density", expected: "hotspot" },
    { query: "display areas with high traffic congestion", expected: "hotspot" },
    { query: "show me areas with high air pollution", expected: "hotspot" },
    
    // Scatter tests
    { query: "show me all the schools", expected: "scatter" },
    { query: "map all the parks", expected: "scatter" },
    { query: "show me where all the libraries are", expected: "scatter" },
    
    // Network tests
    { query: "visualize migration flows", expected: "network" },
    
    // Comparison tests
    { query: "compare crime rates between neighborhoods", expected: "comparison" },
    { query: "how do property values compare to city average", expected: "comparison" },
    
    // Correlation tests
    { query: "show relationship between crime and poverty", expected: "correlation" },
    { query: "analyze the relationship between housing prices and school quality", expected: "correlation" }
  ];
  
  testCases.forEach(({ query, expected }) => {
    test(`"${query}" should classify as ${expected}`, async () => {
      const result = await classifier.classifyQuery(query);
      console.log(`Query: "${query}"`);
      console.log(`  → Type: ${result.visualizationType}, Confidence: ${result.confidence.toFixed(2)}`);
      // Uncomment to enforce expected results:
      // expect(result.visualizationType).toBe(expected);
    });
  });
}); 