const { classifyQuery } = require('../lib/query-classifier');
const { VisualizationType } = require('../config/dynamic-layers');

// Test queries for categorical visualization
const categoricalTestQueries = [
  // Basic categorical queries
  "Show me the different types of land use",
  "What are the categories of buildings in this area",
  "Display the distribution of property types",
  "Show me the various types of businesses",
  "What types of facilities exist in each area",
  "Show the dominant land use by area",
  
  // Zoning specific queries
  "Show me the zoning categories",
  "What are the different zoning types",
  "Display zoning by area",
  "Show the distribution of zoning types",
  "Map the zoning categories",
  
  // Building type queries
  "Show different building types",
  "What types of buildings are in this area",
  "Display building types by neighborhood",
  "Show the distribution of building types",
  "Map the building categories",
  
  // Industry queries
  "Show me the different industries",
  "What are the main industries in this area",
  "Display industry types by region",
  "Show the distribution of industries",
  "Map the industry categories",
  
  // Mixed queries
  "Show me the different types of land use and buildings",
  "What are the categories of facilities and their distribution",
  "Display the types of businesses and their locations",
  "Show me the various categories of properties and their distribution",
  "Map the different types of land use and buildings"
];

// Control queries (should not be classified as categorical)
const controlQueries = [
  "Show me the population density",
  "What are the income levels",
  "Display crime rates",
  "Show me the temperature distribution",
  "Map the elevation",
  "Show the correlation between income and education",
  "Find areas with both high income and good schools",
  "Show trends in home prices over time",
  "Create a heatmap of crime incidents",
  "Plot all store locations"
];

async function runCategoricalClassificationTests() {
  console.log("\n=== TESTING CATEGORICAL VISUALIZATION CLASSIFICATION ===\n");
  
  // Test categorical queries
  console.log("Testing categorical queries:");
  let categoricalSuccess = 0;
  for (const query of categoricalTestQueries) {
    const result = await classifyQuery(query);
    const isCorrect = result === VisualizationType.CATEGORICAL;
    categoricalSuccess += isCorrect ? 1 : 0;
    console.log(`  Query: "${query}"`);
    console.log(`  Result: ${result}`);
    console.log(`  Match: ${isCorrect ? '✅' : '❌'}\n`);
  }
  
  // Test control queries
  console.log("\nTesting control queries (should NOT be categorical):");
  let controlSuccess = 0;
  for (const query of controlQueries) {
    const result = await classifyQuery(query);
    const isCorrect = result !== VisualizationType.CATEGORICAL;
    controlSuccess += isCorrect ? 1 : 0;
    console.log(`  Query: "${query}"`);
    console.log(`  Result: ${result}`);
    console.log(`  Correct (not categorical): ${isCorrect ? '✅' : '❌'}\n`);
  }
  
  // Calculate and display results
  const totalCategorical = categoricalTestQueries.length;
  const totalControl = controlQueries.length;
  const categoricalAccuracy = (categoricalSuccess / totalCategorical) * 100;
  const controlAccuracy = (controlSuccess / totalControl) * 100;
  const overallAccuracy = ((categoricalSuccess + controlSuccess) / (totalCategorical + totalControl)) * 100;
  
  console.log("\n=== TEST RESULTS ===");
  console.log(`Categorical queries accuracy: ${categoricalAccuracy.toFixed(2)}%`);
  console.log(`Control queries accuracy: ${controlAccuracy.toFixed(2)}%`);
  console.log(`Overall accuracy: ${overallAccuracy.toFixed(2)}%`);
}

// Run the tests
runCategoricalClassificationTests().catch(console.error); 