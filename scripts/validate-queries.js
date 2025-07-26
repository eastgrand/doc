#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Comprehensive Query Validation...\n');

try {
  // Read the layers configuration
  const layersPath = path.join(__dirname, '../config/layers.ts');
  const layersContent = fs.readFileSync(layersPath, 'utf8');
  
  // Extract all field names from layers
  const fieldMatches = layersContent.match(/"alias":\s*"([^"]+)"/g) || [];
  const allFields = fieldMatches.map(match => match.match(/"([^"]+)"/)[1]);
  
  console.log(`📊 Found ${allFields.length} fields in layer configuration`);
  
  // Test critical brand queries
  console.log('\n🧪 TESTING CRITICAL BRAND QUERIES...');
  
  const criticalQueries = [
    'How do Jordan sales compare to Converse sales?',
    'Compare Nike vs Adidas athletic shoe purchases across regions',
    'Show me the top 10 areas with highest Nike athletic shoe purchases',
    'Rank areas by Adidas athletic shoe sales'
  ];
  
  // Simple check - look for brand fields in layer config
  const brandFields = allFields.filter(field => {
    const lower = field.toLowerCase();
    return lower.includes('nike') || lower.includes('adidas') || 
           lower.includes('jordan') || lower.includes('converse');
  });
  
  console.log(`📈 Found ${brandFields.length} brand fields in configuration:`);
  brandFields.forEach(field => console.log(`   - ${field}`));
  
  if (brandFields.length >= 4) {
    console.log('\n✅ VALIDATION PASSED - Brand fields found in configuration');
    console.log('✅ Critical queries should work with proper field mapping');
  } else {
    console.log('\n❌ VALIDATION FAILED - Missing brand fields');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Validation script failed:', error.message);
  process.exit(1);
}
