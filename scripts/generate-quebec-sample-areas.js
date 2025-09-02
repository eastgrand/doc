#!/usr/bin/env node

/**
 * Generate Quebec housing sample areas data with real FSA geometry
 * Fetches FSA polygon data from ArcGIS feature service and groups by cities
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load real housing data
const housingDataPath = path.join(__dirname, '..', 'public', 'data', 'quebec_housing_sample_areas.json');
let housingData = {};
try {
  const housingDataArray = JSON.parse(fs.readFileSync(housingDataPath, 'utf8'));
  // Convert array to lookup object by FSA code
  housingData = housingDataArray.reduce((acc, area) => {
    acc[area.id] = area;
    return acc;
  }, {});
  console.log(`Loaded housing data for ${Object.keys(housingData).length} FSAs`);
} catch (e) {
  console.warn('Could not load housing data:', e.message);
}

// ArcGIS Feature Service URL for Quebec FSA data
const BASE_URL = 'https://services8.arcgis.com/VhrZdFGa39zmfR47/arcgis/rest/services/Synapse54_BH_QC_layers/FeatureServer/7';

// Define Quebec major cities and their FSA prefixes
const CITY_FSA_MAPPING = {
  'Montreal': {
    fsaPrefixes: ['H1', 'H2', 'H3', 'H4', 'H5', 'H8', 'H9'],
    displayName: 'Montreal'
  },
  'Quebec City': {
    fsaPrefixes: ['G0', 'G1', 'G2', 'G3', 'G5', 'G6'],
    displayName: 'Quebec City'
  },
  'Laval': {
    fsaPrefixes: ['H7'],
    displayName: 'Laval'
  },
  'Gatineau': {
    fsaPrefixes: ['J8', 'J9'],
    displayName: 'Gatineau'
  },
  'Sherbrooke': {
    fsaPrefixes: ['J1'],
    displayName: 'Sherbrooke'
  },
  'Saguenay': {
    fsaPrefixes: ['G7', 'G8'],
    displayName: 'Saguenay'
  },
  'Trois-Rivieres': {
    fsaPrefixes: ['G8', 'G9'],
    displayName: 'Trois-Rivieres'
  }
};

// Sample FSAs to include (from our Quebec housing data)
const SAMPLE_FSAS = ['G0A', 'G0C', 'G0E', 'G0G', 'G0J', 'G0L', 'G0R', 'G0S', 
                     'H1A', 'H2B', 'H3A', 'H4A', 'H7A', 'J8L', 'J1H', 'G1A'];

async function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchFSAGeometry() {
  console.log('Fetching FSA geometry from ArcGIS...');
  
  // Build query for sample FSAs
  const whereClause = SAMPLE_FSAS.map(fsa => `ID='${fsa}'`).join(' OR ');
  
  const queryUrl = `${BASE_URL}/query?` + new URLSearchParams({
    where: whereClause || "ID LIKE 'G%' OR ID LIKE 'H%' OR ID LIKE 'J%'",
    outFields: 'ID,DESCRIPTION,ECYPTAPOP',
    returnGeometry: 'true',
    outSR: '4326',
    f: 'json',
    resultRecordCount: '100'
  });

  console.log('Query URL:', queryUrl);
  const response = await fetchData(queryUrl);
  
  if (!response || !response.features) {
    console.error('Invalid response:', response);
    throw new Error('No features in response');
  }
  
  console.log(`Fetched ${response.features.length} FSA features`);
  
  return response.features;
}

function determineCity(fsaCode) {
  const prefix = fsaCode.substring(0, 2);
  
  for (const [city, config] of Object.entries(CITY_FSA_MAPPING)) {
    if (config.fsaPrefixes.includes(prefix)) {
      return config.displayName;
    }
  }
  
  // Default city based on first letter
  const firstLetter = fsaCode.charAt(0);
  if (firstLetter === 'G') return 'Quebec City';
  if (firstLetter === 'H') return 'Montreal';
  if (firstLetter === 'J') return 'Gatineau';
  
  return 'Other';
}

function convertToSampleAreaFormat(features) {
  const areas = [];
  
  features.forEach(feature => {
    const fsaCode = feature.attributes.ID;
    const description = feature.attributes.DESCRIPTION || fsaCode;
    const city = determineCity(fsaCode);
    
    // Extract geometry bounds
    let bounds = { xmin: Infinity, ymin: Infinity, xmax: -Infinity, ymax: -Infinity };
    let coordinates = [];
    
    if (feature.geometry && feature.geometry.rings) {
      coordinates = feature.geometry.rings;
      
      // Calculate bounds
      coordinates[0].forEach(coord => {
        bounds.xmin = Math.min(bounds.xmin, coord[0]);
        bounds.xmax = Math.max(bounds.xmax, coord[0]);
        bounds.ymin = Math.min(bounds.ymin, coord[1]);
        bounds.ymax = Math.max(bounds.ymax, coord[1]);
      });
    }
    
    // Get real housing data for this FSA
    const realHousingData = housingData[fsaCode];
    
    // Create sample area object
    const area = {
      zipCode: fsaCode,
      city: city,
      county: 'Quebec',
      state: 'Quebec',
      geometry: {
        type: 'Polygon',
        coordinates: coordinates
      },
      bounds: bounds,
      stats: {
        // Population data from ArcGIS
        'Total Population': feature.attributes.ECYPTAPOP || 0,
        
        // Real housing data when available
        ...(realHousingData ? {
          'Population 25-34': realHousingData.metrics?.population_25_34 || 0,
          'Homeownership Rate (%)': realHousingData.metrics?.homeownership_rate || 0,
          'Median Housing Value': realHousingData.metrics?.median_housing_value || 0
        } : {}),
      },
      // Analysis scores for sample area selection
      analysisScores: {
        housingAffordability: realHousingData ? Math.min(100, (300000 - (realHousingData.metrics?.median_housing_value || 300000)) / 3000 + 50) : 50,
        youngProfessional: realHousingData ? Math.min(100, (realHousingData.metrics?.population_25_34 || 1000) / 50) : 50,
        homeownershipOpportunity: realHousingData ? (100 - (realHousingData.metrics?.homeownership_rate || 50)) : 50,
        overallHousing: 75,
        marketPotential: Math.random() * 30 + 60
      },
      dataQuality: realHousingData ? 0.96 : 0.65
    };
    
    areas.push(area);
  });
  
  return areas;
}

async function generateSampleAreasData() {
  try {
    // Fetch FSA data
    const features = await fetchFSAGeometry();
    
    // Convert to sample areas format
    const areas = convertToSampleAreaFormat(features);
    
    // Group by city for summary
    const citySummary = {};
    areas.forEach(area => {
      if (!citySummary[area.city]) {
        citySummary[area.city] = 0;
      }
      citySummary[area.city]++;
    });
    
    console.log('\nCity distribution:');
    Object.entries(citySummary).forEach(([city, count]) => {
      console.log(`  ${city}: ${count} FSAs`);
    });
    
    // Create the complete data structure
    const sampleData = {
      version: '2.0.0',
      generated: new Date().toISOString(),
      dataSource: 'Quebec Housing Market Data',
      project: {
        name: 'Quebec Housing Market Analysis',
        industry: 'Real Estate / Housing',
        primaryBrand: 'Housing Market'
      },
      fieldMappings: {
        'ECYPTAPOP': 'Total Population',
        'population_25_34': 'Population 25-34',
        'homeownership_rate': 'Homeownership Rate (%)',
        'median_housing_value': 'Median Housing Value'
      },
      areas: areas
    };
    
    // Write to file
    const outputPath = path.join(__dirname, '..', 'public', 'data', 'sample_areas_data_real.json');
    fs.writeFileSync(outputPath, JSON.stringify(sampleData, null, 2));
    
    console.log(`\n✅ Generated sample areas data with ${areas.length} FSAs`);
    console.log(`📁 Saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('❌ Error generating sample areas:', error);
    process.exit(1);
  }
}

// Run the script
generateSampleAreasData();