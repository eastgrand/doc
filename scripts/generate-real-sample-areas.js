const fs = require('fs');
const path = require('path');

// Field mappings for Red Bull energy drinks data - converting MP codes to human-readable names
const fieldMappings = {
  'MP28591A_B': 'Exercise Regularly Users',
  'MP28591A_B_P': 'Exercise Regularly Users (%)',
  'MP13026A_B': 'Seek Nutrition Info Users',
  'MP13026A_B_P': 'Seek Nutrition Info Users (%)', 
  'MP13023A_B': 'Sugar-Free Foods Buyers',
  'MP13023A_B_P': 'Sugar-Free Foods Buyers (%)',
  'MP13019A_B': 'Trader Joes Shoppers',
  'MP13019A_B_P': 'Trader Joes Shoppers (%)',
  'MP12207A_B': 'Costco Shoppers',
  'MP12207A_B_P': 'Costco Shoppers (%)',
  'MP12206A_B': 'Target Shoppers',
  'MP12206A_B_P': 'Target Shoppers (%)',
  'MP12205A_B': 'Whole Foods Shoppers',
  'MP12205A_B_P': 'Whole Foods Shoppers (%)',
  'MP12097A_B': 'Red Bull Drinkers',
  'MP12097A_B_P': 'Red Bull Drinkers (%)',
  'MP28646A_B': '5-Hour Energy Drinkers',
  'MP28646A_B_P': '5-Hour Energy Drinkers (%)',
  'MP14029A_B': 'Monster Energy Drinkers',
  'MP14029A_B_P': 'Monster Energy Drinkers (%)',
  'MP13029A_B': 'Energy Drink Consumers',
  'MP13029A_B_P': 'Energy Drink Consumers (%)',
  'GENZ_CY': 'Generation Z Population',
  'GENZ_CY_P': 'Generation Z Population (%)',
  'GENALPHACY': 'Generation Alpha Population',
  'GENALPHACY_P': 'Generation Alpha Population (%)',
  'TOTPOP_CY': 'Total Population',
  'MEDAGE_CY': 'Median Age',
  'MEDHINC_CY': 'Median Household Income',
  'DIVINDX_CY': 'Diversity Index'
};

console.log('Loading demographic data and ZIP boundaries...');

// Function to properly parse CSV line handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next character
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget last field
  result.push(current);
  return result;
}

// Load the Red Bull demographic data (California)
const demographicPath = path.join(__dirname, '../projects/red_bull_energy_drinks/merged_dataset.csv');
const fs2 = require('fs');
const csvData = fs2.readFileSync(demographicPath, 'utf8');
const lines = csvData.split('\n');
const headers = parseCSVLine(lines[0]);
const demographicData = {
  results: lines.slice(1).filter(line => line.trim()).map(line => {
    const values = parseCSVLine(line);
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });
    return record;
  })
};

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

// Function to determine city from ZIP code (comprehensive mapping for California)
function getCityFromZip(zipCode) {
  const zip = zipCode.toString();
  
  // Los Angeles area (Los Angeles County)
  if (zip.startsWith('900') || zip.startsWith('901') || zip.startsWith('902') || 
      zip.startsWith('903') || zip.startsWith('904') || zip.startsWith('905')) {
    return 'Los Angeles';
  }
  
  // San Diego area (San Diego County)
  if (zip.startsWith('920') || zip.startsWith('921')) {
    return 'San Diego';
  }
  
  // San Francisco area (San Francisco County)
  if (zip.startsWith('941')) {
    return 'San Francisco';
  }
  
  // San Jose area (Santa Clara County)
  if (zip.startsWith('950') || zip.startsWith('951')) {
    return 'San Jose';
  }
  
  // Fresno area (Fresno County)
  if (zip.startsWith('937')) {
    return 'Fresno';
  }
  
  // Sacramento area (Sacramento County)
  if (zip.startsWith('942') || zip.startsWith('956') || zip.startsWith('957')) {
    return 'Sacramento';
  }
  
  // Oakland area (Alameda County)
  if (zip.startsWith('946')) {
    return 'Oakland';
  }
  
  // Long Beach area (Los Angeles County)
  if (zip.startsWith('908')) {
    return 'Long Beach';
  }
  
  // Bakersfield area (Kern County)
  if (zip.startsWith('933')) {
    return 'Bakersfield';
  }
  
  // Anaheim area (Orange County)
  if (zip.startsWith('926') || zip.startsWith('927') || zip.startsWith('928')) {
    return 'Anaheim';
  }
  
  // Santa Ana area (Orange County)
  if (zip.startsWith('927')) {
    return 'Santa Ana';
  }
  
  // Riverside area (Riverside County)
  if (zip.startsWith('925')) {
    return 'Riverside';
  }
  
  // Stockton area (San Joaquin County)
  if (zip.startsWith('952')) {
    return 'Stockton';
  }
  
  // If still no match, assign to the nearest major city based on ZIP code range
  const zipNum = parseInt(zip);
  if (zipNum >= 90000 && zipNum < 91000) {
    return 'Los Angeles'; // Greater LA area
  } else if (zipNum >= 92000 && zipNum < 93000) {
    return 'San Diego'; // San Diego County
  } else if (zipNum >= 93000 && zipNum < 94000) {
    return 'Fresno'; // Central Valley
  } else if (zipNum >= 94000 && zipNum < 95000) {
    return 'San Francisco'; // Bay Area
  } else if (zipNum >= 95000 && zipNum < 96000) {
    return 'San Jose'; // South Bay
  } else {
    return 'Other California Cities'; // Last resort for any remaining codes
  }
}

// Create the sample areas data
const sampleAreasData = {
  version: "2.0.0",
  generated: new Date().toISOString(),
  dataSource: "Real Demographic Data",
  project: {
    name: "Red Bull Energy Drinks Market Analysis",
    industry: "Energy Drinks", 
    primaryBrand: "Red Bull"
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
const allowedCities = ['Los Angeles', 'San Diego', 'San Francisco', 'San Jose', 'Fresno'];

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
      county: city === 'Los Angeles' ? 'Los Angeles County' :
              city === 'San Diego' ? 'San Diego County' :
              city === 'San Francisco' ? 'San Francisco County' :
              city === 'San Jose' ? 'Santa Clara County' :
              city === 'Fresno' ? 'Fresno County' : 'Unknown County',
      state: 'California',
      geometry: boundary.geometry,
      bounds: calculateBounds(boundary.geometry),
      demographics: transformedDemo,
      analysisScores: {
        youngProfessional: transformedDemo['Generation Z Population (%)'] || 0,
        energyDrinkConsumption: transformedDemo['Energy Drink Consumers (%)'] || 0,
        redBullUsage: transformedDemo['Red Bull Drinkers (%)'] || 0,
        fitnessEngagement: transformedDemo['Exercise Regularly Users (%)'] || 0,
        healthConsciousness: transformedDemo['Sugar-Free Foods Buyers (%)'] || 0,
        premiumShopping: (
          (transformedDemo['Whole Foods Shoppers (%)'] || 0) + 
          (transformedDemo['Trader Joes Shoppers (%)'] || 0)
        ) / 2
      },
      dataQuality: 1.0 // Real data has 100% quality
    };
    
    sampleAreasData.areas.push(area);
  }
});

// Sort areas by Red Bull usage for better sample selection
sampleAreasData.areas.sort((a, b) => 
  (b.analysisScores.redBullUsage || 0) - (a.analysisScores.redBullUsage || 0)
);

// Write the output file
const outputPath = path.join(__dirname, '../public/data/sample_areas_data_real.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleAreasData, null, 2));

console.log(`\nGenerated real sample areas data:`);
console.log(`- Total areas: ${sampleAreasData.areas.length}`);
console.log(`- Los Angeles: ${sampleAreasData.areas.filter(a => a.city === 'Los Angeles').length} ZIP codes`);
console.log(`- San Diego: ${sampleAreasData.areas.filter(a => a.city === 'San Diego').length} ZIP codes`);
console.log(`- San Francisco: ${sampleAreasData.areas.filter(a => a.city === 'San Francisco').length} ZIP codes`);
console.log(`- San Jose: ${sampleAreasData.areas.filter(a => a.city === 'San Jose').length} ZIP codes`);
console.log(`- Fresno: ${sampleAreasData.areas.filter(a => a.city === 'Fresno').length} ZIP codes`);
console.log(`- Other California: ${sampleAreasData.areas.filter(a => a.city === 'Other California Cities').length} ZIP codes`);
console.log(`\nSaved to: ${outputPath}`);

console.log(`\nSample field mappings applied:`);
Object.keys(fieldMappings).slice(0, 5).forEach(code => {
  console.log(`  ${code} -> ${fieldMappings[code]}`);
});
console.log(`  ... and ${Object.keys(fieldMappings).length - 5} more fields`);