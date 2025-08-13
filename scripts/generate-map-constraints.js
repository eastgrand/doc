#!/usr/bin/env node

/**
 * Generate Map Constraints Script
 * 
 * This script fetches the extent from the project's polygon layers and generates
 * map view constraints to prevent users from panning outside the project area.
 * 
 * The constraints preserve zoom functionality while restricting panning.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_FILE = path.join(__dirname, '..', 'config', 'mapConstraints.ts');
const LAYERS_FILE = path.join(__dirname, '..', 'config', 'layers.ts');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Extract the first polygon layer URL from layers.ts
 */
function getPolygonLayerUrl() {
  try {
    const layersContent = fs.readFileSync(LAYERS_FILE, 'utf8');
    
    // Look for the first feature service URL in the layers configuration
    const urlMatch = layersContent.match(/url:\s*'([^']+FeatureServer\/\d+)'/);
    
    if (!urlMatch) {
      throw new Error('No feature service URL found in layers.ts');
    }
    
    return urlMatch[1];
  } catch (error) {
    throw new Error(`Failed to read layers configuration: ${error.message}`);
  }
}

/**
 * Fetch the extent from an ArcGIS Feature Service
 */
async function fetchLayerExtent(serviceUrl) {
  try {
    log(`Fetching layer metadata from: ${serviceUrl}`, 'blue');
    
    const response = await fetch(`${serviceUrl}?f=json`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const layerInfo = await response.json();
    
    if (layerInfo.error) {
      throw new Error(`ArcGIS Service Error: ${layerInfo.error.message}`);
    }
    
    if (!layerInfo.extent) {
      throw new Error('No extent information found in layer metadata');
    }
    
    const extent = layerInfo.extent;
    
    log(`Layer extent retrieved:`, 'green');
    log(`  xmin: ${extent.xmin}`, 'cyan');
    log(`  ymin: ${extent.ymin}`, 'cyan');
    log(`  xmax: ${extent.xmax}`, 'cyan');
    log(`  ymax: ${extent.ymax}`, 'cyan');
    log(`  Spatial Reference: ${extent.spatialReference?.wkid || 'Unknown'}`, 'cyan');
    
    return extent;
    
  } catch (error) {
    throw new Error(`Failed to fetch layer extent: ${error.message}`);
  }
}

/**
 * Calculate appropriate buffer around extent for constraints
 */
function calculateConstraintsExtent(extent, bufferPercent = 10) {
  const width = extent.xmax - extent.xmin;
  const height = extent.ymax - extent.ymin;
  
  const bufferX = (width * bufferPercent) / 100;
  const bufferY = (height * bufferPercent) / 100;
  
  return {
    xmin: extent.xmin - bufferX,
    ymin: extent.ymin - bufferY,
    xmax: extent.xmax + bufferX,
    ymax: extent.ymax + bufferY,
    spatialReference: extent.spatialReference
  };
}

/**
 * Generate TypeScript configuration for map constraints
 */
function generateConstraintsConfig(constraintsExtent, originalExtent) {
  const timestamp = new Date().toISOString();
  
  return `// Map Constraints Configuration
// Auto-generated on ${timestamp}
// This file defines geographic constraints to prevent panning outside project area

export interface MapConstraintsConfig {
  geometry: {
    xmin: number;
    ymin: number;
    xmax: number;
    ymax: number;
    spatialReference: {
      wkid: number;
    };
  };
  minZoom?: number;
  maxZoom?: number;
  snapToZoom?: boolean;
  rotationEnabled?: boolean;
}

// Project extent with 10% buffer to prevent panning outside data area
export const MAP_CONSTRAINTS: MapConstraintsConfig = {
  geometry: {
    xmin: ${constraintsExtent.xmin},
    ymin: ${constraintsExtent.ymin},
    xmax: ${constraintsExtent.xmax},
    ymax: ${constraintsExtent.ymax},
    spatialReference: {
      wkid: ${constraintsExtent.spatialReference?.wkid || 4326}
    }
  },
  // No zoom restrictions - users can zoom in/out freely
  minZoom: undefined,
  maxZoom: undefined,
  snapToZoom: false,
  rotationEnabled: false // Typically disabled for data analysis applications
};

// Original data extent (without buffer) for reference
export const DATA_EXTENT = {
  xmin: ${originalExtent.xmin},
  ymin: ${originalExtent.ymin},
  xmax: ${originalExtent.xmax},
  ymax: ${originalExtent.ymax},
  spatialReference: {
    wkid: ${originalExtent.spatialReference?.wkid || 4326}
  }
};

// Helper function to apply constraints to a MapView
// Note: This only constrains panning boundaries, does not change initial map center
export function applyMapConstraints(view: __esri.MapView): void {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return;
  }
  
  // Create proper Extent object for constraints
  const constraintExtent = {
    type: "extent" as const,
    xmin: MAP_CONSTRAINTS.geometry.xmin,
    ymin: MAP_CONSTRAINTS.geometry.ymin,
    xmax: MAP_CONSTRAINTS.geometry.xmax,
    ymax: MAP_CONSTRAINTS.geometry.ymax,
    spatialReference: MAP_CONSTRAINTS.geometry.spatialReference
  };
  
  view.constraints = {
    geometry: constraintExtent,
    minZoom: MAP_CONSTRAINTS.minZoom,
    maxZoom: MAP_CONSTRAINTS.maxZoom,
    snapToZoom: MAP_CONSTRAINTS.snapToZoom,
    rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
  };
  
  console.log('[MapConstraints] Applied geographic constraints to MapView (panning boundaries only)', {
    extent: constraintExtent,
    rotationEnabled: MAP_CONSTRAINTS.rotationEnabled
  });
}

// Helper function to zoom to data extent
export function zoomToDataExtent(view: __esri.MapView, options?: __esri.MapViewGoToOptions): Promise<any> {
  if (!view) {
    console.warn('[MapConstraints] No MapView provided');
    return Promise.resolve();
  }
  
  // Create proper Extent object for zoom
  const dataExtent = {
    type: "extent" as const,
    xmin: DATA_EXTENT.xmin,
    ymin: DATA_EXTENT.ymin,
    xmax: DATA_EXTENT.xmax,
    ymax: DATA_EXTENT.ymax,
    spatialReference: DATA_EXTENT.spatialReference
  };
  
  return view.goTo(dataExtent, {
    duration: 1000,
    easing: 'ease-in-out',
    ...options
  });
}
`;
}

/**
 * Main execution function
 */
async function main() {
  try {
    log('🗺️  Map Constraints Generator', 'bright');
    log('================================', 'bright');
    
    // Step 1: Get polygon layer URL from layers.ts
    log('\n1. Reading layers configuration...', 'yellow');
    const layerUrl = getPolygonLayerUrl();
    log(`   Found layer URL: ${layerUrl}`, 'green');
    
    // Step 2: Fetch layer extent
    log('\n2. Fetching layer extent from ArcGIS service...', 'yellow');
    const originalExtent = await fetchLayerExtent(layerUrl);
    
    // Step 3: Calculate constraints extent with buffer
    log('\n3. Calculating constraints with buffer...', 'yellow');
    const constraintsExtent = calculateConstraintsExtent(originalExtent, 10);
    log(`   Added 10% buffer around original extent`, 'green');
    
    // Step 4: Generate TypeScript configuration
    log('\n4. Generating TypeScript configuration...', 'yellow');
    const configContent = generateConstraintsConfig(constraintsExtent, originalExtent);
    
    // Step 5: Write to file
    log('\n5. Writing configuration file...', 'yellow');
    fs.writeFileSync(OUTPUT_FILE, configContent, 'utf8');
    log(`   ✅ Configuration written to: ${path.relative(process.cwd(), OUTPUT_FILE)}`, 'green');
    
    // Success summary
    log('\n🎉 Map constraints generated successfully!', 'bright');
    log('\nNext steps:', 'yellow');
    log('1. Import and apply constraints in your MapClient component', 'cyan');
    log('2. Use applyMapConstraints(view) to set the constraints', 'cyan');
    log('3. Use zoomToDataExtent(view) to center on the data', 'cyan');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    log('\nTroubleshooting:', 'yellow');
    log('- Ensure layers.ts exists and contains feature service URLs', 'cyan');
    log('- Check that the feature service is accessible', 'cyan');
    log('- Verify network connectivity', 'cyan');
    process.exit(1);
  }
}

// Add fetch polyfill for Node.js environments that don't have it
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = {
  getPolygonLayerUrl,
  fetchLayerExtent,
  calculateConstraintsExtent,
  generateConstraintsConfig
};