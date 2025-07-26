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
    const checkModule = await import('../check-visualization-implementations.js');
    if (typeof checkModule.default === 'function') {
      checkModule.default();
    } else if (typeof checkModule.checkVisualizationImplementations === 'function') {
      checkModule.checkVisualizationImplementations();
    } else {
      console.log('Using direct function call');
      const checkVisualizationImplementations = require('../check-visualization-implementations');
      checkVisualizationImplementations();
    }
    
    // 2. Run AI Integration Tests
    console.log("\n\n==== TESTING AI INTEGRATION ====\n");
    try {
      const aiModule = await import('../ai-visualization-integration.js');
      if (typeof aiModule.runTests === 'function') {
        await aiModule.runTests();
      } else if (typeof aiModule.default === 'function') {
        await aiModule.default();
      } else {
        console.log('AI tests module found but no runnable function');
      }
    } catch (error) {
      console.error('Error running AI integration tests:', error);
    }
    
    // 3. Test factory integration with all visualization types
    console.log("\n\n==== TESTING FACTORY INTEGRATION ====\n");
    try {
      // Run factory test directly if Jest is not available
      console.log('Running factory test manually...');
      const factoryTest = require('./visualization-factory-test.js');
      if (typeof factoryTest.runTests === 'function') {
        await factoryTest.runTests();
      } else {
        console.log('Factory tests imported but no runnable function found');
      }
    } catch (error) {
      console.error('Error running factory tests:', error);
    }
    
    // 4. Run Visualization Tests
    console.log("\n\n==== RUNNING VISUALIZATION TESTS ====\n");
    try {
      const vizModule = await import('../run-visualization-tests.js');
      if (typeof vizModule.main === 'function') {
        await vizModule.main();
      } else if (typeof vizModule.default === 'function') {
        await vizModule.default();
      } else {
        console.log('Visualization tests module found but no runnable function');
      }
    } catch (error) {
      console.error('Error running visualization tests:', error);
    }
    
    // 5. Run Visualization Output Tests
    console.log("\n\n==== TESTING VISUALIZATION OUTPUTS ====\n");
    try {
      const outputModule = await import('../visualization-output-test.js');
      if (typeof outputModule.runVisualizationOutputTests === 'function') {
        await outputModule.runVisualizationOutputTests();
      } else if (typeof outputModule.default === 'function') {
        await outputModule.default();
      } else {
        console.log('Output tests module found but no runnable function');
      }
    } catch (error) {
      console.error('Error running output tests:', error);
    }
    
    // 6. Test New Visualization Types
    console.log("\n\n==== TESTING NEW VISUALIZATION TYPES ====\n");
    try {
      const newTypesModule = await import('../visualization-new-types-test.js');
      if (typeof newTypesModule.testNewVisualizationTypes === 'function') {
        await newTypesModule.testNewVisualizationTypes();
      } else if (typeof newTypesModule.default === 'function') {
        await newTypesModule.default();
      } else {
        console.log('New types tests module found but no runnable function');
      }
    } catch (error) {
      console.error('Error running new visualization types tests:', error);
    }
    
    console.log("\n\n===== ALL TESTS COMPLETED =====");
  } catch (error) {
    console.error("Error running tests:", error);
  }
}

/**
 * Run Jest tests programmatically
 */
async function runJestTests(testFile) {
  const { run } = require('jest');
  
  return new Promise((resolve) => {
    run(['--silent', testFile])
      .then(result => resolve(result.results.success))
      .catch(error => {
        console.error('Jest error:', error);
        resolve(false);
      });
  });
}

// Run all tests
runAllTests();

// For Node.js environments
if (typeof module !== 'undefined') {
  module.exports = { runAllTests };
} 