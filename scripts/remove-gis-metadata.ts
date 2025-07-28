#!/usr/bin/env ts-node

// Remove GIS metadata fields while keeping one DESCRIPTION and one OBJECTID

import { promises as fs } from 'fs';
import { join } from 'path';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints-nike-optimized');
const OPTIMIZED_DIR = join(process.cwd(), 'public/data/endpoints-gis-cleaned');

// GIS metadata patterns to remove (but keep one base field of each type)
const GIS_METADATA_PATTERNS = [
  // Remove all Shape fields
  /^(shap_|value_)?Shape/,
  
  // Remove numbered/variant CreationDate fields (keep base CreationDate)
  /^(shap_|value_)?CreationDate_\d+$/,
  
  // Remove numbered/variant Creator fields (keep base Creator) 
  /^(shap_|value_)?Creator_\d+$/,
  
  // Remove numbered/variant DESCRIPTION fields (keep base DESCRIPTION)
  /^(shap_|value_)?DESCRIPTION_\d+$/,
  
  // Remove numbered/variant EditDate fields (keep base EditDate)
  /^(shap_|value_)?EditDate_\d+$/,
  
  // Remove numbered/variant Editor fields (keep base Editor)
  /^(shap_|value_)?Editor_\d+$/,
  
  // Remove numbered thematic_value variants (keep base thematic_value)
  /^(shap_|value_)?thematic_value_\d+$/,
  
  // Remove numbered/variant OBJECTID fields (keep base OBJECTID)
  /^(shap_|value_)?OBJECTID_\d+$/,
];

function shouldRemoveField(fieldName: string): boolean {
  return GIS_METADATA_PATTERNS.some(pattern => pattern.test(fieldName));
}

async function cleanGISMetadata(filename: string) {
  const inputPath = join(ENDPOINTS_DIR, filename);
  const outputPath = join(OPTIMIZED_DIR, filename);
  
  try {
    console.log(`Processing ${filename}...`);
    
    const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.log(`⚠️  Skipping ${filename} - no results array found`);
      return;
    }
    
    const originalSize = JSON.stringify(data).length;
    const sampleRecord = data.results[0];
    const originalFieldCount = Object.keys(sampleRecord).length;
    
    // Clean each record by removing GIS metadata fields
    const cleanedResults = data.results.map((record: any) => {
      const cleanedRecord: any = {};
      
      for (const [fieldName, value] of Object.entries(record)) {
        if (!shouldRemoveField(fieldName)) {
          cleanedRecord[fieldName] = value;
        }
      }
      
      return cleanedRecord;
    });
    
    // Create cleaned structure
    const cleanedData = {
      ...data,
      results: cleanedResults
    };
    
    const cleanedSize = JSON.stringify(cleanedData).length;
    const cleanedFieldCount = Object.keys(cleanedResults[0] || {}).length;
    const compressionRatio = ((originalSize - cleanedSize) / originalSize * 100).toFixed(1);
    const originalMB = (originalSize / 1024 / 1024).toFixed(1);
    const cleanedMB = (cleanedSize / 1024 / 1024).toFixed(1);
    
    await fs.writeFile(outputPath, JSON.stringify(cleanedData, null, 2));
    
    console.log(`   ✅ GIS metadata cleaned`);
    console.log(`   Fields: ${originalFieldCount} → ${cleanedFieldCount} (removed ${originalFieldCount - cleanedFieldCount})`);
    console.log(`   Size: ${originalMB}MB → ${cleanedMB}MB`);
    console.log(`   Reduction: ${compressionRatio}%`);
    
    // Show some removed fields for verification
    const removedFields = Object.keys(sampleRecord).filter(field => shouldRemoveField(field));
    if (removedFields.length > 0) {
      console.log(`   Sample removed: ${removedFields.slice(0, 3).join(', ')}${removedFields.length > 3 ? `... (+${removedFields.length - 3} more)` : ''}`);
    }
    
    // Verify we kept the base fields
    const keptBaseFields = Object.keys(cleanedResults[0]).filter(field => 
      field === 'DESCRIPTION' || field === 'OBJECTID' || 
      field === 'value_DESCRIPTION' || field === 'value_OBJECTID' ||
      field === 'shap_DESCRIPTION' || field === 'shap_OBJECTID'
    );
    if (keptBaseFields.length > 0) {
      console.log(`   Kept base fields: ${keptBaseFields.join(', ')}`);
    }
    console.log('');
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

async function cleanAllEndpoints() {
  console.log('🚀 Starting GIS metadata cleanup...');
  console.log('🗑️  Removing: Shape, CreationDate_*, Creator_*, EditDate_*, Editor_*, thematic_value_*, OBJECTID_*, DESCRIPTION_*');
  console.log('✅ Keeping: Base DESCRIPTION and OBJECTID fields\n');
  
  // Create cleaned directory
  try {
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
  
  const files = await fs.readdir(ENDPOINTS_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  let totalOriginalSize = 0;  
  let totalCleanedSize = 0;
  let processedFiles = 0;
  
  for (const file of jsonFiles) {
    try {
      const originalStats = await fs.stat(join(ENDPOINTS_DIR, file));
      await cleanGISMetadata(file);
      
      const cleanedStats = await fs.stat(join(OPTIMIZED_DIR, file));
      totalOriginalSize += originalStats.size;
      totalCleanedSize += cleanedStats.size;
      processedFiles++;
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  const totalCompressionRatio = totalOriginalSize > 0 ? 
    ((totalOriginalSize - totalCleanedSize) / totalOriginalSize * 100).toFixed(1) : '0';
  
  console.log('🎉 GIS metadata cleanup complete!');
  console.log(`📊 Total size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB → ${(totalCleanedSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`📈 Total reduction: ${totalCompressionRatio}%`);
  console.log(`📁 Files processed: ${processedFiles}`);
  console.log(`📁 Cleaned files saved to: ${OPTIMIZED_DIR}`);
  console.log(`\n✅ Files should now be significantly smaller for blob migration!`);
}

if (require.main === module) {
  cleanAllEndpoints();
}