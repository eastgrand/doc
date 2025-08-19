const fs = require('fs');
const path = require('path');

// Load the ZIP boundaries data
const boundariesPath = path.join(__dirname, '../public/data/boundaries/zip_boundaries.json');
const boundaries = JSON.parse(fs.readFileSync(boundariesPath, 'utf8'));

// Create a map of ZIP codes to their boundaries
const zipBoundaryMap = new Map();
boundaries.features.forEach(feature => {
  const zipCode = feature.properties.ID; // ZIP code is stored in the ID property
  if (zipCode) {
    zipBoundaryMap.set(zipCode, feature);
  }
});

// Define cities with more comprehensive ZIP code lists from GeoDataManager
const cityZipCodes = {
  'Jacksonville': [
    '32099', '32201', '32202', '32203', '32204', '32205', '32206', '32207',
    '32208', '32209', '32210', '32211', '32212', '32214', '32216', '32217',
    '32218', '32219', '32220', '32221', '32222', '32223', '32224', '32225',
    '32226', '32227', '32228', '32244', '32246', '32254', '32256', '32257'
  ], // Selected 32 most populated/relevant ZIP codes
  
  'Miami': [
    '33125', '33126', '33127', '33128', '33129', '33130', '33131', '33132',
    '33133', '33134', '33135', '33136', '33137', '33138', '33139', '33140',
    '33141', '33142', '33143', '33144', '33145', '33146', '33147', '33149',
    '33150', '33155', '33156', '33157', '33165', '33166', '33172', '33174'
  ], // Selected 32 core Miami ZIP codes
  
  'Tampa': [
    '33602', '33603', '33604', '33605', '33606', '33607', '33609', '33610',
    '33611', '33612', '33613', '33614', '33615', '33616', '33617', '33618',
    '33619', '33620', '33621', '33624', '33625', '33626', '33629', '33634'
  ], // Selected 24 Tampa ZIP codes
  
  'Orlando': [
    '32801', '32803', '32804', '32805', '32806', '32807', '32808', '32809',
    '32810', '32811', '32812', '32814', '32817', '32818', '32819', '32820',
    '32821', '32822', '32824', '32825', '32826', '32827', '32828', '32829',
    '32832', '32833', '32835', '32836', '32837', '32839'
  ] // Selected 30 Orlando ZIP codes
};

// Generate realistic statistics for each ZIP code
function generateStats(zipCode, city) {
  // Base stats by city
  const cityBaseStats = {
    'Jacksonville': { pop: 45000, income: 58000, genZ: 23, businesses: 850 },
    'Miami': { pop: 55000, income: 65000, genZ: 22, businesses: 1200 },
    'Tampa': { pop: 48000, income: 60000, genZ: 24, businesses: 950 },
    'Orlando': { pop: 50000, income: 59000, genZ: 26, businesses: 1100 }
  };
  
  const base = cityBaseStats[city];
  const variation = () => 0.7 + Math.random() * 0.6; // ±30% variation
  
  return {
    population: Math.round(base.pop * variation()),
    populationDensity: Math.round(3000 + Math.random() * 5000),
    medianIncome: Math.round(base.income * variation()),
    medianAge: Math.round(32 + Math.random() * 10),
    
    genZ_percent: Math.round((base.genZ * variation()) * 10) / 10,
    millennial_percent: Math.round((28 + Math.random() * 8) * 10) / 10,
    genX_percent: Math.round((22 + Math.random() * 6) * 10) / 10,
    boomer_percent: Math.round((18 + Math.random() * 8) * 10) / 10,
    
    creditCardDebt_percent: Math.round((35 + Math.random() * 30) * 10) / 10,
    savingsAccount_percent: Math.round((50 + Math.random() * 30) * 10) / 10,
    investmentAssets_avg: Math.round(15000 + Math.random() * 50000),
    
    applePay_percent: Math.round((30 + Math.random() * 25) * 10) / 10,
    googlePay_percent: Math.round((25 + Math.random() * 20) * 10) / 10,
    onlineTax_percent: Math.round((40 + Math.random() * 30) * 10) / 10,
    
    businessCount: Math.round(base.businesses * variation()),
    marketOpportunity_score: Math.round((60 + Math.random() * 30) * 10) / 10
  };
}

// Calculate bounds from geometry
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

// Create the sample areas data
const sampleAreasData = {
  version: "1.0.0",
  generated: new Date().toISOString(),
  project: {
    name: "H&R Block Market Analysis",
    industry: "Tax Services",
    primaryBrand: "H&R Block"
  },
  areas: []
};

// Process each city
Object.entries(cityZipCodes).forEach(([city, zipCodes]) => {
  console.log(`Processing ${city} with ${zipCodes.length} ZIP codes...`);
  
  zipCodes.forEach(zipCode => {
    const boundary = zipBoundaryMap.get(zipCode);
    
    if (boundary && boundary.geometry) {
      const area = {
        zipCode: zipCode,
        city: city,
        county: city === 'Jacksonville' ? 'Duval County' :
                city === 'Miami' ? 'Miami-Dade County' :
                city === 'Tampa' ? 'Hillsborough County' :
                'Orange County',
        state: 'Florida',
        geometry: boundary.geometry,
        bounds: calculateBounds(boundary.geometry),
        stats: generateStats(zipCode, city),
        analysisScores: {
          youngProfessional: Math.round(Math.random() * 100),
          financialOpportunity: Math.round(Math.random() * 100),
          digitalAdoption: Math.round(Math.random() * 100),
          growthMarket: Math.round(Math.random() * 100),
          investmentActivity: Math.round(Math.random() * 100)
        },
        dataQuality: 0.96 + Math.random() * 0.04 // 96-100% quality
      };
      
      sampleAreasData.areas.push(area);
    } else {
      console.log(`  Warning: No boundary found for ZIP ${zipCode}`);
    }
  });
});

// Write the output file
const outputPath = path.join(__dirname, '../public/data/sample_areas_data.json');
fs.writeFileSync(outputPath, JSON.stringify(sampleAreasData, null, 2));

console.log(`\nGenerated sample areas data:`);
console.log(`- Total areas: ${sampleAreasData.areas.length}`);
console.log(`- Jacksonville: ${sampleAreasData.areas.filter(a => a.city === 'Jacksonville').length} ZIP codes`);
console.log(`- Miami: ${sampleAreasData.areas.filter(a => a.city === 'Miami').length} ZIP codes`);
console.log(`- Tampa: ${sampleAreasData.areas.filter(a => a.city === 'Tampa').length} ZIP codes`);
console.log(`- Orlando: ${sampleAreasData.areas.filter(a => a.city === 'Orlando').length} ZIP codes`);
console.log(`\nSaved to: ${outputPath}`);