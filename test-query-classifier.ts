import { QueryClassifier } from './lib/query-classifier';

// Create an instance of the query classifier
const classifier = new QueryClassifier();

// Define some test queries
const testQueries = [
  "Show me the density of restaurants in New York",
  "Compare education and income using colors",
  "Map all schools in the area",
  "Show me areas with both high income and high education",
  "How has the population changed over time?",
  "Display the top 10 cities by population",
  "Show me the relationship between crime and poverty"
];

// Run the tests
async function runTests() {
  console.log("Testing QueryClassifier...\n");
  
  for (const query of testQueries) {
    try {
      console.log(`Query: "${query}"`);
      const result = await classifier.classifyQuery(query);
      console.log(`Classification: ${result.visualizationType}`);
      console.log(`Confidence: ${result.confidence.toFixed(2)}`);
      console.log("----------------------------");
    } catch (error) {
      console.error(`Error classifying query "${query}":`, error);
    }
  }
}

// Run the tests
runTests().catch(console.error); 