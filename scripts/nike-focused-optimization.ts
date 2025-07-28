#!/usr/bin/env ts-node

// Nike-focused optimization script
// Removes SHAP values for non-Nike target variables while keeping all demographic features that affect Nike

import { promises as fs } from 'fs';
import { join } from 'path';

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints-deduplicated');
const OPTIMIZED_DIR = join(process.cwd(), 'public/data/endpoints-nike-optimized');

// Nike-focused target variables to KEEP (Nike + key competitors for analysis)
const NIKE_TARGET_VARIABLES = [
  'MP30034A_B',     // Nike preference (primary target)
  'MP30034A_B_P',   // Nike market share percentage
  'MP30029A_B',     // Adidas preference (key competitor)
  'MP30029A_B_P',   // Adidas market share percentage  
  'MP30032A_B',     // Jordan preference (Nike subsidiary)
  'MP30032A_B_P'    // Jordan market share percentage
];

// Core demographic/economic fields to always keep (these affect Nike preference)
const CORE_DEMOGRAPHIC_FIELDS = [
  // Population demographics
  'TOTPOP_CY', 'ASIAN_CY', 'BLACK_CY', 'WHITE_CY', 'AMERIND_CY', 
  'FAMPOP_CY', 'TOTHH_CY', 'FAMHH_CY',
  
  // Economic indicators
  'AVGHINC_CY', 'MEDDI_CY', 'WLTHINDXCY', 'MEDAGE_CY',
  
  // Geographic identifiers
  'geo_id', 'ZIP_CODE', 'FSA_ID', 'ID', 'GEOID', 'DESCRIPTION',
  'area_id', 'area_name', 'NAME',
  
  // Analysis-specific scores (endpoint-specific)
  'target_value', 'strategic_value_score', 'competitive_advantage_score',
  'demographic_opportunity_score', 'comparative_analysis_score',
  'correlation_strength_score', 'cluster_id', 'cluster_label'
];

function shouldKeepField(fieldName: string): boolean {
  // Always keep non-SHAP, non-value fields (core data)
  if (!fieldName.startsWith('shap_') && !fieldName.startsWith('value_')) {
    return true;
  }
  
  // For SHAP and value fields, check if they're Nike-related or core demographics
  if (fieldName.startsWith('shap_') || fieldName.startsWith('value_')) {
    const baseField = fieldName.replace(/^(shap_|value_)/, '');
    
    // Keep Nike target variables
    if (NIKE_TARGET_VARIABLES.some(target => baseField === target)) {
      return true;
    }
    
    // Keep core demographic fields that influence Nike preference
    if (CORE_DEMOGRAPHIC_FIELDS.some(core => baseField === core)) {
      return true;
    }
    
    // Keep fields that don't look like brand-specific market research codes
    // (MP codes usually indicate specific brand preferences we don't need)
    if (!baseField.match(/^MP\d+/)) {
      return true;
    }
  }
  
  return false;
}

async function optimizeEndpointFile(filename: string) {
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
    
    // Optimize each record by removing non-Nike target variable fields
    const optimizedResults = data.results.map((record: any) => {
      const optimizedRecord: any = {};
      
      for (const [fieldName, value] of Object.entries(record)) {
        if (shouldKeepField(fieldName)) {
          optimizedRecord[fieldName] = value;
        }
      }
      
      return optimizedRecord;
    });
    
    // Create optimized structure
    const optimizedData = {
      ...data,
      results: optimizedResults
    };
    
    const optimizedSize = JSON.stringify(optimizedData).length;
    const optimizedFieldCount = Object.keys(optimizedResults[0] || {}).length;
    const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1);
    const originalMB = (originalSize / 1024 / 1024).toFixed(1);
    const optimizedMB = (optimizedSize / 1024 / 1024).toFixed(1);
    
    await fs.writeFile(outputPath, JSON.stringify(optimizedData, null, 2));
    
    console.log(`   ✅ Optimized successfully`);
    console.log(`   Fields: ${originalFieldCount} → ${optimizedFieldCount}`);
    console.log(`   Size: ${originalMB}MB → ${optimizedMB}MB`);
    console.log(`   Reduction: ${compressionRatio}%`);
    
    // Show some removed fields for verification
    const removedFields = Object.keys(sampleRecord).filter(field => !shouldKeepField(field));
    if (removedFields.length > 0) {
      console.log(`   Sample removed fields: ${removedFields.slice(0, 5).join(', ')}${removedFields.length > 5 ? '...' : ''}`);
    }
    console.log('');
    
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error);
  }
}

async function optimizeAllEndpoints() {
  console.log('🚀 Starting Nike-focused optimization...');
  console.log('📋 Keeping: Nike, Adidas, Jordan targets + all demographic features');  
  console.log('🗑️  Removing: Other brand target variables (Under Armour, Puma, etc.)\n');
  
  // Create optimized directory
  try {
    await fs.mkdir(OPTIMIZED_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
  
  const files = await fs.readdir(ENDPOINTS_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  let totalOriginalSize = 0;  
  let totalOptimizedSize = 0;
  let totalOriginalFields = 0;
  let totalOptimizedFields = 0;
  let processedFiles = 0;
  
  for (const file of jsonFiles) {
    try {
      const originalStats = await fs.stat(join(ENDPOINTS_DIR, file));
      await optimizeEndpointFile(file);
      
      const optimizedStats = await fs.stat(join(OPTIMIZED_DIR, file));
      totalOriginalSize += originalStats.size;
      totalOptimizedSize += optimizedStats.size;
      processedFiles++;
      
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  }
  
  const totalCompressionRatio = totalOriginalSize > 0 ? 
    ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(1) : '0';
  
  console.log('🎉 Nike-focused optimization complete!');
  console.log(`📊 Total size: ${(totalOriginalSize / 1024 / 1024).toFixed(1)}MB → ${(totalOptimizedSize / 1024 / 1024).toFixed(1)}MB`);
  console.log(`📈 Total reduction: ${totalCompressionRatio}%`);
  console.log(`📁 Files processed: ${processedFiles}`);
  console.log(`📁 Optimized files saved to: ${OPTIMIZED_DIR}`);
  console.log(`\n✅ Ready for blob migration with Nike-focused data!`);
}

if (require.main === module) {
  optimizeAllEndpoints();
}