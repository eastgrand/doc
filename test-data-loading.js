// Test data loading for the 4 enabled analysis types
const fs = require('fs');
const path = require('path');

const ENABLED_ENDPOINTS = [
  'strategic-analysis',
  'comparative-analysis', 
  'competitive-analysis',
  'demographic-insights',
  'brand-difference'  // Also test this since competitive queries route here
];

console.log('=== Testing Data Loading for Analysis Endpoints ===\n');

ENABLED_ENDPOINTS.forEach(endpoint => {
  const filePath = path.join(__dirname, 'public/data/endpoints', `${endpoint}.json`);
  
  console.log(`Testing: ${endpoint}`);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filePath}`);
      return;
    }
    
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Check data structure
    let records = [];
    if (Array.isArray(data)) {
      records = data;
    } else if (data.results && Array.isArray(data.results)) {
      records = data.results;
    }
    
    if (records.length > 0) {
      const firstRecord = records[0];
      console.log(`✅ Loaded ${records.length} records`);
      console.log(`   Sample fields: ${Object.keys(firstRecord).slice(0, 5).join(', ')}...`);
      
      // Check for H&R Block/TurboTax related fields
      const hrBlockFields = Object.keys(firstRecord).filter(k => k.includes('MP30034A_B'));
      const turboTaxFields = Object.keys(firstRecord).filter(k => k.includes('MP30029A_B'));
      
      if (hrBlockFields.length > 0) {
        console.log(`   🎯 H&R Block fields: ${hrBlockFields.join(', ')}`);
      }
      if (turboTaxFields.length > 0) {
        console.log(`   🎯 TurboTax fields: ${turboTaxFields.join(', ')}`);
      }
      
      // Show some sample values for brand fields
      if (hrBlockFields.length > 0 && firstRecord[hrBlockFields[0]] !== undefined) {
        console.log(`   📊 Sample H&R Block value: ${firstRecord[hrBlockFields[0]]}`);
      }
      if (turboTaxFields.length > 0 && firstRecord[turboTaxFields[0]] !== undefined) {
        console.log(`   📊 Sample TurboTax value: ${firstRecord[turboTaxFields[0]]}`);
      }
    } else {
      console.log(`❌ No records found in data structure`);
    }
    
  } catch (error) {
    console.log(`❌ Error loading data: ${error.message}`);
  }
  
  console.log('---\n');
});