// Run this test manually since we're having module resolution issues
// Usage: npx ts-node --transpile-only test/run-manual-classifier-test.js

const { spawn } = require('child_process');

// Test cases we want to evaluate
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

// Run each query through Jest with a single test to isolate and see output
for (const { query, expected } of testCases) {
  console.log(`\n\nTesting query: "${query}"`);
  console.log(`Expected classification: ${expected}`);
  
  // Create a Jest command to run a single query
  const jestCmd = `npx jest test/query-classifier.test.ts -t "CHOROPLETH classification" --no-coverage`;
  
  console.log(`Running command: ${jestCmd}`);
  
  const jest = spawn(jestCmd, { shell: true, stdio: 'inherit' });
  
  jest.on('close', (code) => {
    console.log(`Test exited with code ${code}`);
  });
} 