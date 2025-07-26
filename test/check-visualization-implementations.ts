/**
 * Visualization Implementation Checker
 * 
 * This script verifies that all visualization types defined in the
 * VisualizationType enum have corresponding implementation files.
 */

import { readdirSync, existsSync, readFileSync } from 'fs';
import { resolve, basename, extname } from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Define VisualizationType enum manually since we can't import it
const VisualizationType = {
  CHOROPLETH: 'choropleth',
  HEATMAP: 'heatmap',
  SCATTER: 'scatter',
  CLUSTER: 'cluster',
  CATEGORICAL: 'categorical',
  TRENDS: 'trends',
  CORRELATION: 'correlation',
  JOINT_HIGH: 'joint_high',
  PROPORTIONAL_SYMBOL: 'proportional_symbol',
  COMPARISON: 'comparison',
  TOP_N: 'top_n',
  HEXBIN: 'hexbin',
  BIVARIATE: 'bivariate',
  BUFFER: 'buffer',
  HOTSPOT: 'hotspot',
  NETWORK: 'network',
  MULTIVARIATE: 'multivariate'
};

/**
 * Expected file naming conventions for each visualization type
 */
const filenameConventions = {
  CHOROPLETH: 'choropleth-visualization.ts',
  HEATMAP: 'density-visualization.ts',
  SCATTER: 'point-layer-visualization.ts',
  CLUSTER: 'cluster-visualization.ts',
  CATEGORICAL: 'single-layer-visualization.ts',
  TRENDS: 'trends-visualization.ts',
  CORRELATION: 'correlation-visualization.ts',
  JOINT_HIGH: 'joint-visualization.ts',
  PROPORTIONAL_SYMBOL: 'proportional-symbol-visualization.ts',
  TOP_N: 'top-n-visualization.ts',
  HEXBIN: 'hexbin-visualization.ts',
  BIVARIATE: 'bivariate-visualization.ts',
  BUFFER: 'buffer-visualization.ts',
  HOTSPOT: 'hotspot-visualization.ts',
  NETWORK: 'network-visualization.ts',
  MULTIVARIATE: 'multivariate-visualization.ts',
};

interface VisualizationResult {
  expectedFile: string;
  found: boolean;
  factoryImport?: boolean;
  factoryCase?: boolean;
}

type Results = Record<string, VisualizationResult>;

/**
 * Main function to check visualization implementations
 */
function checkVisualizationImplementations() {
  console.log("=== CHECKING VISUALIZATION IMPLEMENTATIONS ===\n");
  
  const visualizationDir = resolve(__dirname, '../utils/visualizations');
  
  // Check if the directory exists
  if (!existsSync(visualizationDir)) {
    console.error(`❌ Visualization directory not found: ${visualizationDir}`);
    return false;
  }
  
  // Get all files in the visualizations directory
  const files = readdirSync(visualizationDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .map(file => file.toLowerCase());
  
  console.log(`Found ${files.length} visualization files`);
  
  // Check each visualization type
  const results: Results = {};
  let missingFiles = 0;
  
  for (const [type, expectedFile] of Object.entries(filenameConventions)) {
    const found = files.includes(expectedFile.toLowerCase());
    
    results[type] = {
      expectedFile,
      found
    };
    
    if (!found) {
      missingFiles++;
    }
    
    console.log(`${type}: ${found ? '✅ Found' : '❌ Missing'} ${expectedFile}`);
  }
  
  // Check for factory imports
  console.log("\n=== CHECKING DYNAMIC VISUALIZATION FACTORY ===\n");
  
  const factoryPath = resolve(__dirname, '../lib/DynamicVisualizationFactory.ts');
  
  if (!existsSync(factoryPath)) {
    console.error(`❌ Factory file not found: ${factoryPath}`);
    return false;
  }
  
  const factoryContent = readFileSync(factoryPath, 'utf8');
  
  for (const [type, expectedFile] of Object.entries(filenameConventions)) {
    // Extract base name without extension
    const baseName = basename(expectedFile, extname(expectedFile));
    // Convert to PascalCase for class name (e.g., 'top-n-visualization' -> 'TopNVisualization')
    const className = baseName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    
    // Check for import pattern in factory
    const importPattern = new RegExp(`import.*${className}.*from`);
    const found = importPattern.test(factoryContent);
    
    console.log(`${type} import in factory: ${found ? '✅ Found' : '❌ Missing'} "${className}"`);
    
    // Check for case handler
    const casePattern = new RegExp(`case.*${type}[^:]*:`);
    const caseFound = casePattern.test(factoryContent);
    
    console.log(`${type} case in factory: ${caseFound ? '✅ Found' : '❌ Missing'}`);
    
    results[type].factoryImport = found;
    results[type].factoryCase = caseFound;
  }
  
  // Summary
  console.log("\n=== SUMMARY ===\n");
  console.log(`Total visualization types: ${Object.keys(filenameConventions).length}`);
  console.log(`Missing implementation files: ${missingFiles}`);
  
  let missingImports = 0;
  let missingCases = 0;
  
  for (const result of Object.values(results)) {
    if (!result.factoryImport) missingImports++;
    if (!result.factoryCase) missingCases++;
  }
  
  console.log(`Missing factory imports: ${missingImports}`);
  console.log(`Missing factory cases: ${missingCases}`);
  
  if (missingFiles === 0 && missingImports === 0 && missingCases === 0) {
    console.log("\n✅ SUCCESS: All visualization types have implementation files and are properly integrated!");
  } else {
    console.log("\n⚠️ ISSUES FOUND: Some visualization types may not be fully implemented or integrated.");
  }
  
  return results;
}

// Run the check
const results = checkVisualizationImplementations();

// Export for ES modules
export { checkVisualizationImplementations, results }; 