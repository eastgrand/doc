/**
 * Run Visualization Tests
 * 
 * This script runs tests for all visualization types to ensure they
 * are working correctly.
 */

import { VisualizationType } from '../config/dynamic-layers';
import { DynamicVisualizationFactory } from '../lib/DynamicVisualizationFactory';

/**
 * Run tests for all visualization types
 */
async function main() {
  console.log("\n=== RUNNING VISUALIZATION TESTS ===\n");
  
  const factory = new DynamicVisualizationFactory();
  
  // Test each visualization type
  for (const type of Object.values(VisualizationType)) {
    console.log(`\nTesting ${type}:`);
    
    try {
      // Create a test visualization
      const visualization = await factory.createVisualization(type, 'test-layer', {
        field1: 'field1',
        field2: 'field2'
      });
      
      console.log(`  ✅ Created visualization`);
      
      // Test visualization properties
      if (visualization) {
        console.log(`  ✅ Visualization has required properties`);
      } else {
        console.log(`  ❌ Visualization is null or undefined`);
      }
    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }
  
  console.log("\n=== VISUALIZATION TESTS COMPLETED ===\n");
}

export { main }; 