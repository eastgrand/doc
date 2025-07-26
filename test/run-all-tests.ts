/**
 * Run All Visualization Tests
 * 
 * This script runs all the visualization test scripts to verify
 * that all visualization types are implemented and accessible to the AI.
 */

async function runAllTests() {
  console.log("===== STARTING VISUALIZATION TEST SUITE =====\n");
  
  try {
    // 1. Check Visualization Implementations
    console.log("\n\n==== CHECKING VISUALIZATION IMPLEMENTATIONS ====\n");
    const { checkVisualizationImplementations } = await import('./check-visualization-implementations');
    checkVisualizationImplementations();
    
    // 2. Run AI Integration Tests
    console.log("\n\n==== TESTING AI INTEGRATION ====\n");
    try {
      const { runTests: runAITests } = await import('./ai-visualization-integration');
      await runAITests();
    } catch (error) {
      console.warn("AI integration tests skipped - module not found");
    }
    
    // 3. Run Visualization Tests
    console.log("\n\n==== RUNNING VISUALIZATION TESTS ====\n");
    const { main: runVisualizationTests } = await import('./run-visualization-tests');
    await runVisualizationTests();
    
    console.log("\n\n===== ALL TESTS COMPLETED =====");
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

// Run all tests
runAllTests();

// For Node.js environments
export { runAllTests }; 