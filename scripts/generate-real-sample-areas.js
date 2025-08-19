const fs = require('fs');
const path = require('path');

// Field mappings from layers.ts - converting MP codes to human-readable names
const fieldMappings = {
  'MP10104A_B': 'TurboTax Users',
  'MP10104A_B_P': 'TurboTax Users (%)',
  'MP10128A_B': 'H&R Block Online Users', 
  'MP10128A_B_P': 'H&R Block Online Users (%)',
  'MP10120A_B': 'Google Pay Users',
  'MP10120A_B_P': 'Google Pay Users (%)',
  'MP10110A_B': 'Apple Pay Users',
  'MP10110A_B_P': 'Apple Pay Users (%)',
  'MP10002A_B': 'Bank of America Users',
  'MP10002A_B_P': 'Bank of America Users (%)',
  'MP10138A_B': 'Cryptocurrency Investors',
  'MP10138A_B_P': 'Cryptocurrency Investors (%)',
  'MP10028A_B': 'Personal Line of Credit Holders',
  'MP10028A_B_P': 'Personal Line of Credit Holders (%)',
  'MP10020A_B': 'Savings Account Holders',
  'MP10020A_B_P': 'Savings Account Holders (%)',
  'MP10116A_B': 'Credit Card Balance Carriers',
  'MP10116A_B_P': 'Credit Card Balance Carriers (%)',
  'X14068_X': 'Credit Card Debt Value',
  'X14068_X_A': 'Credit Card Debt Value (Avg)',
  'X14060_X': 'Banking Assets Value',
  'X14060_X_A': 'Banking Assets Value (Avg)',
  'X14058_X': 'Investment Assets Value',
  'X14058_X_A': 'Investment Assets Value (Avg)',
  'GENZ_CY': 'Generation Z Population',
  'GENZ_CY_P': 'Generation Z Population (%)',
  'GENALPHACY': 'Generation Alpha Population',
  'GENALPHACY_P': 'Generation Alpha Population (%)'
};

console.log('Loading demographic data and ZIP boundaries...');

// Load the demographic insights data
const demographicPath = path.join(__dirname, '../public/data/endpoints/demographic-insights.json');
const demographicData = JSON.parse(fs.readFileSync(demographicPath, 'utf8'));

// Load the ZIP boundaries data
const boundariesPath = path.join(__dirname, '../public/data/boundaries/zip_boundaries.json');
const boundaries = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));

console.log(`Loaded ${demographicData.results.length} demographic records`);
console.log(`Loaded ${boundaries.features.length} ZIP boundary features`);

// Create a map of ZIP codes to their boundaries
const zipBoundaryMap = new Map();
boundaries.features.forEach(feature => {
  const zipCode = feature.properties.ID;
  if (zipCode) {
    zipBoundaryMap.set(zipCode, feature);
  }
});

// Create a map of ZIP codes to their demographic data
const zipDemographicMap = new Map();
demographicData.results.forEach(record => {
  const zipCode = record.ID?.toString();
  if (zipCode) {
    zipDemographicMap.set(zipCode, record);
  }
});

console.log(`Created boundary map with ${zipBoundaryMap.size} ZIP codes`);
console.log(`Created demographic map with ${zipDemographicMap.size} ZIP codes`);

// Function to calculate bounds from geometry
function calculateBounds(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  const coords = geometry.type === 'Polygon' ? geometry.coordinates[0] : geometry.coordinates[0][0];
  coords.forEach(coord => {
    minX = Math.min(minX, coord[0]);
    maxX = Math.max(maxX, coord[0]);
    minY = Math.min(minY, coord[1]);
    maxY = Math.max(maxY, coord[1]);
  });
  
  return {
    xmin: minX,
    ymin: minY,
    xmax: maxX,
    ymax: maxY
  };
}

// Function to transform demographic data with human-readable field names
function transformDemographicData(rawData) {
  const transformed = {};
  
  // Copy basic fields
  transformed.zipCode = rawData.ID?.toString();
  transformed.description = rawData.DESCRIPTION;
  transformed.latitude = rawData.LATITUDE;
  transformed.longitude = rawData.LONGITUDE;
  transformed.shapeArea = rawData.Shape__Area;
  transformed.shapeLength = rawData.Shape__Length;
  
  // Transform mapped fields with human-readable names
  Object.keys(fieldMappings).forEach(fieldCode => {
    if (rawData[fieldCode] !== undefined) {
      const humanName = fieldMappings[fieldCode];
      transformed[humanName] = rawData[fieldCode];
    }
  });
  
  // Add calculated fields for common demographics
  const financialTechAdoption = (
    (rawData.MP10120A_B_P || 0) + (rawData.MP10110A_B_P || 0)
  ) / 2;
  
  const taxServiceUsage = (
    (rawData.MP10104A_B_P || 0) + (rawData.MP10128A_B_P || 0)
  ) / 2;
  
  const digitalFinancialEngagement = (
    financialTechAdoption + 
    (rawData.MP10138A_B_P || 0) + 
    taxServiceUsage
  ) / 3;
  
  transformed['Financial Tech Adoption Score'] = Math.round(financialTechAdoption * 10) / 10;
  transformed['Tax Service Usage Score'] = Math.round(taxServiceUsage * 10) / 10;
  transformed['Digital Financial Engagement Score'] = Math.round(digitalFinancialEngagement * 10) / 10;
  
  return transformed;
}

// Function to determine city from ZIP code (comprehensive mapping for Florida)
function getCityFromZip(zipCode) {
  const zip = zipCode.toString();
  
  // Jacksonville area (Duval County)
  if (zip.startsWith('320') || zip.startsWith('322')) {
    return 'Jacksonville';
  }
  
  // Miami area (Miami-Dade County)
  if (zip.startsWith('331') || zip.startsWith('330')) {
    return 'Miami';
  }
  
  // Tampa area (Hillsborough County)
  if (zip.startsWith('336') || zip.startsWith('335')) {
    return 'Tampa';
  }
  
  // Orlando area (Orange County)
  if (zip.startsWith('328') || zip.startsWith('327')) {
    return 'Orlando';
  }
  
  // Fort Lauderdale area (Broward County)
  if (zip.startsWith('333')) {
    return 'Fort Lauderdale';
  }
  
  // St. Petersburg area (Pinellas County)
  if (zip.startsWith('337')) {
    return 'St. Petersburg';
  }
  
  // Tallahassee area (Leon County)
  if (zip.startsWith('323')) {
    return 'Tallahassee';
  }
  
  // Gainesville area (Alachua County)
  if (zip.startsWith('326')) {
    return 'Gainesville';
  }
  
  // West Palm Beach area (Palm Beach County)
  if (zip.startsWith('334')) {
    return 'West Palm Beach';
  }
  
  // Cape Coral/Fort Myers area (Lee County)
  if (zip.startsWith('339')) {
    return 'Fort Myers';
  }
  
  // Pensacola area (Escambia County)
  if (zip.startsWith('325')) {
    return 'Pensacola';
  }
  
  // Daytona Beach area (Volusia County)
  if (zip.startsWith('321')) {
    return 'Daytona Beach';
  }
  
  // Naples area (Collier County)
  if (zip.startsWith('341')) {
    return 'Naples';
  }
  
  // Sarasota area (Sarasota County)
  if (zip.startsWith('342')) {
    return 'Sarasota';
  }
  
  // If still no match, assign to the nearest major city based on ZIP code range
  const zipNum = parseInt(zip);
  if (zipNum >= 32000 && zipNum < 32300) {
    return 'Jacksonville'; // North Florida
  } else if (zipNum >= 32700 && zipNum < 32900) {
    return 'Orlando'; // Central Florida
  } else if (zipNum >= 33000 && zipNum < 33500) {
    return 'Miami'; // South Florida
  } else if (zipNum >= 33500 && zipNum < 33800) {
    return 'Tampa'; // West Central Florida
  } else {
    return 'Other Florida Cities'; // Last resort for any remaining codes
  }
}

// Create the sample areas data
const sampleAreasData = {
  version: "2.0.0",
  generated: new Date().toISOString(),
  dataSource: "Real Demographic Data",
  project: {
    name: "H&R Block Market Analysis",
    industry: "Tax Services", 
    primaryBrand: "H&R Block"
  },
  fieldMappings: fieldMappings,
  areas: []
};

console.log('Processing joined data...');

// Find all ZIP codes that have both boundary and demographic data
const joinedZipCodes = [];
for (const zipCode of zipBoundaryMap.keys()) {
  if (zipDemographicMap.has(zipCode)) {
    joinedZipCodes.push(zipCode);
  }
}

console.log(`Found ${joinedZipCodes.length} ZIP codes with both boundary and demographic data`);

// Define the cities we want to include
const allowedCities = ['Jacksonville', 'Miami', 'Tampa', 'St. Petersburg', 'Orlando'];

// Process each joined ZIP code
joinedZipCodes.forEach(zipCode => {
  const boundary = zipBoundaryMap.get(zipCode);
  const demographics = zipDemographicMap.get(zipCode);
  
  if (boundary && demographics && boundary.geometry) {
    const transformedDemo = transformDemographicData(demographics);
    const city = getCityFromZip(zipCode);
    
    // Only include the 5 specified cities
    if (!allowedCities.includes(city)) {
      return;
    }
    
    const area = {
      zipCode: zipCode,
      city: city,
      county: city === 'Jacksonville' ? 'Duval County' :
              city === 'Miami' ? 'Miami-Dade County' :
              city === 'Tampa' ? 'Hillsborough County' :
              city === 'Orlando' ? 'Orange County' : 'Unknown County',
      state: 'Florida',
      geometry: boundary.geometry,
      bounds: calculateBounds(boundary.geometry),
      demographics: transformedDemo,
      analysisScores: {
        youngProfessional: transformedDemo['Generation Z Population (%)'] || 0,
        financialTechAdoption: transformedDemo['Financial Tech Adoption Score'] || 0,
        taxServiceEngagement: transformedDemo['Tax Service Usage Score'] || 0,
        digitalEngagement: transformedDemo['Digital Financial Engagement Score'] || 0,
        investmentActivity: transformedDemo['Cryptocurrency Investors (%)'] || 0
      },
      dataQuality: 1.0 // Real data has 100% quality
    };
    
    sampleAreasData.areas.push(area);
  }
});

// Sort areas by digital engagement score for better sample selection
sampleAreasData.areas.sort((a, b) => 
  (b.analysisScores.digitalEngagement || 0) - (a.analysisScores.digitalEngagement || 0)
);

// Write the output file
const outputPath = path.join(__dirname, '../public/data/sample_areas_data_real.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleAreasData, null, 2));

console.log(`\nGenerated real sample areas data:`);
console.log(`- Total areas: ${sampleAreasData.areas.length}`);
console.log(`- Jacksonville: ${sampleAreasData.areas.filter(a => a.city === 'Jacksonville').length} ZIP codes`);
console.log(`- Miami: ${sampleAreasData.areas.filter(a => a.city === 'Miami').length} ZIP codes`);
console.log(`- Tampa: ${sampleAreasData.areas.filter(a => a.city === 'Tampa').length} ZIP codes`);
console.log(`- Orlando: ${sampleAreasData.areas.filter(a => a.city === 'Orlando').length} ZIP codes`);
console.log(`- Other Florida: ${sampleAreasData.areas.filter(a => a.city === 'Florida').length} ZIP codes`);
console.log(`\nSaved to: ${outputPath}`);

console.log(`\nSample field mappings applied:`);
Object.keys(fieldMappings).slice(0, 5).forEach(code => {
  console.log(`  ${code} -> ${fieldMappings[code]}`);
});
console.log(`  ... and ${Object.keys(fieldMappings).length - 5} more fields`);