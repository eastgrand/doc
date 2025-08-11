#!/usr/bin/env node
/**
 * Extract all unique field names from all endpoint data files
 * This creates a comprehensive list of all fields used in analysis
 */

const fs = require('fs');
const path = require('path');

const endpointsDir = path.join(__dirname, '../public/data/endpoints');
const allFields = new Set();
const fieldSources = new Map(); // Track which endpoints contain which fields

console.log('🔍 Extracting all unique fields from endpoint datasets...\n');

// Read all JSON files in endpoints directory
const files = fs.readdirSync(endpointsDir).filter(file => file.endsWith('.json'));

let totalRecordsProcessed = 0;
let filesProcessed = 0;

files.forEach(filename => {
  const filepath = path.join(endpointsDir, filename);
  
  try {
    const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      const endpointName = data.endpoint_name || filename.replace('.json', '');
      
      // Get field names from first record (assuming all records have same structure)
      const sampleRecord = data.results[0];
      const fieldsInThisEndpoint = Object.keys(sampleRecord);
      
      console.log(`📄 ${endpointName}: ${fieldsInThisEndpoint.length} fields, ${data.results.length} records`);
      
      // Add all fields to our comprehensive set
      fieldsInThisEndpoint.forEach(field => {
        allFields.add(field);
        
        // Track which endpoints contain this field
        if (!fieldSources.has(field)) {
          fieldSources.set(field, new Set());
        }
        fieldSources.get(field).add(endpointName);
      });
      
      totalRecordsProcessed += data.results.length;
      filesProcessed++;
    } else {
      console.log(`⚠️  ${filename}: No results array or empty results`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log(`\n📊 SUMMARY:`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Total records: ${totalRecordsProcessed}`);
console.log(`   Unique fields found: ${allFields.size}\n`);

// Sort fields and create analysis
const sortedFields = Array.from(allFields).sort();

// Categorize fields
const systemFields = sortedFields.filter(f => 
  ['OBJECTID', 'ID', 'DESCRIPTION', 'Shape__Area', 'Shape__Length', 'CreationDate', 'Creator', 'EditDate', 'Editor', 'thematic_value'].includes(f)
);

const mpFields = sortedFields.filter(f => f.startsWith('MP'));
const xFields = sortedFields.filter(f => f.startsWith('X'));
const generationFields = sortedFields.filter(f => f.includes('GEN'));
const locationFields = sortedFields.filter(f => 
  ['name', 'address', 'locality', 'region', 'postcode', 'country', 'LATITUDE', 'LONGITUDE'].includes(f)
);
const analysisScoreFields = sortedFields.filter(f => f.includes('score'));
const otherFields = sortedFields.filter(f => 
  !systemFields.includes(f) && !mpFields.includes(f) && !xFields.includes(f) && 
  !generationFields.includes(f) && !locationFields.includes(f) && !analysisScoreFields.includes(f)
);

console.log(`🏗️  FIELD CATEGORIES:`);
console.log(`   System fields (${systemFields.length}):`, systemFields.slice(0, 5).join(', ') + (systemFields.length > 5 ? '...' : ''));
console.log(`   MP codes (${mpFields.length}):`, mpFields.slice(0, 5).join(', ') + (mpFields.length > 5 ? '...' : ''));
console.log(`   X codes (${xFields.length}):`, xFields.slice(0, 5).join(', ') + (xFields.length > 5 ? '...' : ''));
console.log(`   Generation fields (${generationFields.length}):`, generationFields.join(', '));
console.log(`   Location fields (${locationFields.length}):`, locationFields.join(', '));
console.log(`   Analysis scores (${analysisScoreFields.length}):`, analysisScoreFields.join(', '));
console.log(`   Other fields (${otherFields.length}):`, otherFields.slice(0, 10).join(', ') + (otherFields.length > 10 ? '...' : ''));

// Write comprehensive field list
const outputData = {
  generated_timestamp: new Date().toISOString(),
  total_fields: allFields.size,
  files_processed: filesProcessed,
  total_records: totalRecordsProcessed,
  field_categories: {
    system: systemFields,
    mp_codes: mpFields,
    x_codes: xFields,
    generation: generationFields,
    location: locationFields,
    analysis_scores: analysisScoreFields,
    other: otherFields
  },
  all_fields_sorted: sortedFields,
  field_sources: Object.fromEntries(
    Array.from(fieldSources.entries()).map(([field, sources]) => [
      field,
      Array.from(sources).sort()
    ])
  )
};

const outputPath = path.join(__dirname, '../public/data/all-fields-analysis.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

console.log(`\n💾 Complete field analysis written to: ${outputPath}`);
console.log('\n✅ Field extraction complete!');