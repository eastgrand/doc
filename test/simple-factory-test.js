/**
 * Simple Factory Test
 * 
 * This is a simplified test to verify the DynamicVisualizationFactory has case handlers
 * for all visualization types.
 */

const fs = require('fs');
const path = require('path');

// List of visualization types
const visualizationTypes = [
  'CHOROPLETH',
  'HEATMAP',
  'SCATTER',
  'CLUSTER',
  'CATEGORICAL',
  'TRENDS',
  'CORRELATION',
  'JOINT_HIGH',
  'PROPORTIONAL_SYMBOL',
  'TOP_N',
  'HEXBIN',
  'BIVARIATE',
  'BUFFER',
  'HOTSPOT',
  'NETWORK',
  'MULTIVARIATE'
];

// Files to check
const factoryFiles = [
  '../lib/DynamicVisualizationFactory.ts',
  '../utils/visualizations/dynamic-visualization-factory.ts',
  '../utils/dynamic-visualization-factory.ts'
];

console.log("=== SIMPLE FACTORY IMPLEMENTATION CHECK ===\n");

// Test each file
for (const factoryFile of factoryFiles) {
  const filePath = path.resolve(__dirname, factoryFile);
  
  try {
    if (fs.existsSync(filePath)) {
      console.log(`Checking ${factoryFile}...`);
      
      const fileContent = fs.readFileSync(filePath, 'utf8');
      
      // Check for case handlers or import statements for each visualization type
      for (const type of visualizationTypes) {
        // Convert to case format used in the switch statements
        const caseType = type.toLowerCase();
        
        // Look for case statement pattern
        const casePatternRegExp = new RegExp(`case\\s+VisualizationType\\.${type}\\s*:|case\\s+['"]${caseType}['"]\\s*:|case\\s+${type}\\s*:|['"]${caseType}['"]\\s*:`);
        
        // Look for import pattern
        const importPatternRegExp = new RegExp(`import.*${type.toLowerCase()}-visualization|${type.toLowerCase().replace(/_/g, '-')}-visualization`);
        
        // Check if either pattern exists
        const hasCaseHandler = casePatternRegExp.test(fileContent);
        const hasImport = importPatternRegExp.test(fileContent);
        
        console.log(`  ${type}: ${hasCaseHandler ? '✅ Case handler found' : '❌ No case handler'} ${hasImport ? '✅ Import found' : '❌ No import found'}`);
      }
      
      console.log('\n');
    } else {
      console.log(`File not found: ${factoryFile}\n`);
    }
  } catch (error) {
    console.error(`Error checking ${factoryFile}:`, error);
  }
}

console.log("=== SIMPLE FACTORY CHECK COMPLETED ==="); 