#!/usr/bin/env ts-node

// Safe deduplication script - only removes confirmed duplicates between main record and properties

import { promises as fs } from 'fs';
import { join } from 'path';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');
const DEDUPLICATED_DIR = join(process.cwd(), 'public/data/endpoints-deduplicated');

async function deduplicateEndpointFile(filename: string) {
  const inputPath = join(ENDPOINTS_DIR, filename);
  const outputPath = join(DEDUPLICATED_DIR, filename);
  
  try {
    console.log(`Processing ${filename}...`);
    
    const data = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      console.log(`⚠️  Skipping ${filename} - no results array found`);
      return;
    }
    
    const originalSize = JSON.stringify(data).length;
    
    // Analyze duplication in first record
    const sampleRecord = data.results[0];
    const mainKeys = Object.keys(sampleRecord);
    const propKeys = sampleRecord.properties ? Object.keys(sampleRecord.properties) : [];
    
    // Find fields that exist in both main record and properties
    const duplicatedFields = mainKeys.filter(key => 
      sampleRecord.properties && sampleRecord.properties.hasOwnProperty(key)
    );
    
    console.log(`   Main fields: ${mainKeys.length}`);
    console.log(`   Properties fields: ${propKeys.length}`);
    console.log(`   Duplicated fields: ${duplicatedFields.length}`);
    
    if (duplicatedFields.length === 0) {
      console.log(`   ✅ No duplicates found - copying as-is`);
      await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
      return;
    }
    
    // Keep essential fields in properties for visualization/popup
    const essentialFields = [
      'geo_id', 'ZIP_CODE', 'FSA_ID', 'ID', 'area_name', 'DESCRIPTION',
      'target_value', 'value', 'area_id'
    ];
    
    // Deduplicate each record
    const deduplicatedResults = data.results.map((record: any) => {
      if (!record.properties) {
        return record; // No properties to deduplicate
      }
      
      // Create minimal properties object with only essential fields
      const minimalProperties: any = {};
      
      for (const field of essentialFields) {
        if (record.properties[field] !== undefined) {
          minimalProperties[field] = record.properties[field];
        }
      }
      
      // Return record with deduplicated properties
      return {
        ...record,
        properties: minimalProperties
      };
    });
    
    // Create deduplicated structure
    const deduplicatedData = {
      ...data,
      results: deduplicatedResults
    };
    
    const deduplicatedSize = JSON.stringify(deduplicatedData).length;
    const compressionRatio = ((originalSize - deduplicatedSize) / originalSize * 100).toFixed(1);
    const originalMB = (originalSize / 1024 / 1024).toFixed(1);
    const deduplicatedMB = (deduplicatedSize / 1024 / 1024).toFixed(1);
    
    await fs.writeFile(outputPath, JSON.stringify(deduplicatedData, null, 2));
    
    console.log(`   ✅ Deduplicated successfully`);
    console.log(`   Size: ${originalMB}MB → ${deduplicatedMB}MB`);
    console.log(`   Reduction: ${compressionRatio}%\n`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

async function deduplicateAllEndpoints() {
  console.log('🚀 Starting safe deduplication (removing field duplicates only)...\n');
  
  // Create deduplicated directory
  try {
    await fs.mkdir(DEDUPLICATED_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
  
  const files = await fs.readdir(ENDPOINTS_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  let totalOriginalSize = 0;  
  let totalDeduplicatedSize = 0;
  
  for (const file of jsonFiles) {
    const originalSize = (await fs.stat(join(ENDPOINTS_DIR, file))).size;
    await deduplicateEndpointFile(file);
    
    try {
      const deduplicatedSize = (await fs.stat(join(DEDUPLICATED_DIR, file))).size;
      totalOriginalSize += originalSize;
      totalDeduplicatedSize += deduplicatedSize;
    } catch (error) {
      // File might not have been created if skipped
    }
  }
  
  const totalCompressionRatio = ((totalOriginalSize - totalDeduplicatedSize) / totalOriginalSize * 100).toFixed(1);
  
  console.log('🎉 Deduplication complete!');
  console.log(`📊 Total size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB → ${(totalDeduplicatedSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`📈 Total reduction: ${totalCompressionRatio}%`);
  console.log(`📁 Deduplicated files saved to: ${DEDUPLICATED_DIR}`);
}

if (require.main === module) {
  deduplicateAllEndpoints();
}