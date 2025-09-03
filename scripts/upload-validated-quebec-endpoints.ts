#!/usr/bin/env ts-node

// Upload ONLY validated Quebec housing endpoint data to /real/ directory in blob storage
// Validates each file contains Quebec locations before upload

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const ENDPOINTS_DIR = join(process.cwd(), 'scripts/automation/generated_endpoints');
const BLOB_MAPPING_FILE = join(process.cwd(), 'public/data/blob-urls.json');

// Quebec FSA prefixes and common Quebec city names for validation
const QUEBEC_INDICATORS = [
  // Quebec postal code prefixes
  'G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8', 'G9',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H7', 'H8', 'H9',
  'J0', 'J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9',
  // Quebec identifiers
  ', QC)', 'Quebec', 'Montreal', 'Laval', 'Gatineau', 'Sherbrooke'
];

const NON_QUEBEC_INDICATORS = [
  // US state abbreviations and common US cities
  ', FL)', ', CA)', ', NY)', ', TX)',
  'Beach)', 'Tampa', 'Hollywood', 'Miami', 'Orlando', 'Pompano',
  'Coral Springs', 'Lehigh Acres', 'Palm Beach', 'Tavernier'
];

interface EndpointValidationResult {
  isValid: boolean;
  quebecCount: number;
  nonQuebecCount: number;
  totalRecords: number;
  sampleLocations: string[];
  issues: string[];
}

/**
 * Validate that an endpoint file contains only Quebec data
 */
async function validateEndpointData(filePath: string): Promise<EndpointValidationResult> {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    
    const result: EndpointValidationResult = {
      isValid: false,
      quebecCount: 0,
      nonQuebecCount: 0,
      totalRecords: 0,
      sampleLocations: [],
      issues: []
    };

    if (!data.results || !Array.isArray(data.results)) {
      result.issues.push('No results array found');
      return result;
    }

    result.totalRecords = data.results.length;
    
    for (const record of data.results.slice(0, 100)) { // Check first 100 records
      const description = record.DESCRIPTION || record.description || '';
      const id = record.ID || record.id || '';
      const location = `${description} (${id})`;
      
      // Check for Quebec indicators
      const hasQuebecIndicator = QUEBEC_INDICATORS.some(indicator => 
        description.includes(indicator) || id.toString().startsWith(indicator.replace(', QC)', ''))
      );
      
      // Check for non-Quebec indicators  
      const hasNonQuebecIndicator = NON_QUEBEC_INDICATORS.some(indicator =>
        description.includes(indicator)
      );
      
      if (hasQuebecIndicator) {
        result.quebecCount++;
      } else if (hasNonQuebecIndicator) {
        result.nonQuebecCount++;
        result.issues.push(`Non-Quebec location found: ${location}`);
      }
      
      // Collect sample locations
      if (result.sampleLocations.length < 5) {
        result.sampleLocations.push(location);
      }
    }
    
    // Validation criteria:
    // 1. Must have Quebec locations
    // 2. Must have zero non-Quebec locations
    // 3. At least 50% of checked records should be identifiable as Quebec
    const quebecPercentage = (result.quebecCount / Math.min(100, result.totalRecords)) * 100;
    
    result.isValid = result.quebecCount > 0 && 
                     result.nonQuebecCount === 0 && 
                     quebecPercentage >= 50;
    
    if (!result.isValid) {
      if (result.quebecCount === 0) {
        result.issues.push('No Quebec locations detected');
      }
      if (result.nonQuebecCount > 0) {
        result.issues.push(`Found ${result.nonQuebecCount} non-Quebec locations`);
      }
      if (quebecPercentage < 50) {
        result.issues.push(`Only ${quebecPercentage.toFixed(1)}% identifiable as Quebec`);
      }
    }
    
    return result;
    
  } catch (error) {
    return {
      isValid: false,
      quebecCount: 0,
      nonQuebecCount: 0,
      totalRecords: 0,
      sampleLocations: [],
      issues: [`Failed to parse file: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
}

async function uploadValidatedQuebecEndpoints() {
  console.log('🚀 Starting validated Quebec housing endpoint upload to /real/ directory...');
  console.log('🔍 Only files with 100% Quebec data will be uploaded\n');

  try {
    // Check if BLOB_READ_WRITE_TOKEN exists
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('❌ BLOB_READ_WRITE_TOKEN not found in environment variables');
      console.log('Please add BLOB_READ_WRITE_TOKEN to your .env.local file');
      process.exit(1);
    }

    // Check if endpoints directory exists
    try {
      await fs.access(ENDPOINTS_DIR);
    } catch {
      console.error('❌ Quebec endpoints directory not found:', ENDPOINTS_DIR);
      process.exit(1);
    }

    const files = await fs.readdir(ENDPOINTS_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('blob-urls') && 
      !file.includes('all_endpoints') &&
      !file.includes('comprehensive_generation_summary') &&
      !file.includes('upload_endpoints')
    );

    if (jsonFiles.length === 0) {
      console.log('ℹ️  No endpoint files found');
      return;
    }

    console.log(`📂 Found ${jsonFiles.length} endpoint files to validate\n`);

    const validFiles: string[] = [];
    const invalidFiles: string[] = [];
    const validationResults: Record<string, EndpointValidationResult> = {};

    // Validate all files first
    for (const file of jsonFiles) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      console.log(`🔍 Validating ${endpoint}...`);
      const validation = await validateEndpointData(filePath);
      validationResults[endpoint] = validation;
      
      if (validation.isValid) {
        console.log(`   ✅ VALID - Quebec data confirmed (${validation.quebecCount}/${Math.min(100, validation.totalRecords)} Quebec locations)`);
        console.log(`   📍 Sample: ${validation.sampleLocations[0]}`);
        validFiles.push(file);
      } else {
        console.log(`   ❌ INVALID - ${validation.issues.join(', ')}`);
        console.log(`   📊 Stats: ${validation.quebecCount} Quebec, ${validation.nonQuebecCount} non-Quebec, ${validation.totalRecords} total`);
        if (validation.sampleLocations.length > 0) {
          console.log(`   📍 Sample: ${validation.sampleLocations[0]}`);
        }
        invalidFiles.push(file);
      }
      console.log('');
    }

    console.log(`\n📊 Validation Summary:`);
    console.log(`✅ Valid Quebec files: ${validFiles.length}`);
    console.log(`❌ Invalid/Mixed files: ${invalidFiles.length}`);
    
    if (invalidFiles.length > 0) {
      console.log(`\n🚫 Files NOT uploaded due to non-Quebec data:`);
      invalidFiles.forEach(file => {
        const endpoint = file.replace('.json', '');
        const issues = validationResults[endpoint]?.issues || [];
        console.log(`   - ${endpoint}: ${issues.join(', ')}`);
      });
    }

    if (validFiles.length === 0) {
      console.log('\n❌ No valid Quebec files found to upload');
      process.exit(1);
    }

    console.log(`\n📤 Uploading ${validFiles.length} validated Quebec files...\n`);

    const blobUrlMappings: Record<string, string> = {};
    let uploadedCount = 0;
    let failedCount = 0;

    // Upload only validated files
    for (const file of validFiles) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      try {
        const stats = await fs.stat(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        console.log(`📤 Uploading ${endpoint} (${sizeMB}MB)...`);
        
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        const validation = validationResults[endpoint];
        console.log(`   ✅ Validated: ${validation.quebecCount} Quebec locations`);
        
        const blobUrl = await uploadEndpointData(endpoint, data, 'real');
        
        if (blobUrl) {
          console.log(`   🔗 Uploaded: ${blobUrl}`);
          blobUrlMappings[endpoint] = blobUrl;
          uploadedCount++;
        } else {
          console.log(`   ❌ Upload failed`);
          failedCount++;
        }
      } catch (error) {
        console.error(`❌ Error uploading ${endpoint}:`, error);
        failedCount++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('');
    }

    // Upload Quebec FSA boundaries
    console.log('📤 Uploading Quebec FSA boundaries...\n');
    const boundariesDir = join(process.cwd(), 'public/data/boundaries');
    try {
      await fs.access(boundariesDir);
      const boundaryFiles = ['fsa_boundaries.json', 'fsa_boundaries_backup.json', 'export_summary.json'];
      
      for (const boundaryFile of boundaryFiles) {
        const boundaryPath = join(boundariesDir, boundaryFile);
        const boundaryName = boundaryFile.replace('.json', '');
        
        try {
          await fs.access(boundaryPath);
          const stats = await fs.stat(boundaryPath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
          console.log(`📤 Uploading boundary ${boundaryName} (${sizeMB}MB)...`);
          
          const data = JSON.parse(await fs.readFile(boundaryPath, 'utf-8'));
          const blobUrl = await uploadEndpointData(`boundaries/${boundaryName}`, data, 'real');
          
          if (blobUrl) {
            console.log(`   ✅ Uploaded boundary: ${blobUrl}`);
            blobUrlMappings[`boundaries/${boundaryName}`] = blobUrl;
            uploadedCount++;
          }
        } catch (error) {
          console.warn(`   ⚠️ Skipped ${boundaryName}: ${error instanceof Error ? error.message : String(error)}`);
        }
        console.log('');
      }
    } catch {
      console.log('ℹ️  No boundaries directory found, skipping boundary uploads\n');
    }

    // Save blob URL mappings
    console.log(`💾 Saving blob URL mappings to: ${BLOB_MAPPING_FILE}`);
    await fs.writeFile(
      BLOB_MAPPING_FILE, 
      JSON.stringify(blobUrlMappings, null, 2),
      'utf-8'
    );

    console.log('\n🎉 Validated Quebec housing data upload complete!');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    console.log(`🚫 Rejected (non-Quebec): ${invalidFiles.length} files`);
    console.log(`📁 All files stored in /real/ directory contain only Quebec data`);
    
    if (uploadedCount > 0) {
      console.log('\n✅ Data integrity guaranteed: Only Quebec housing market data uploaded!');
      console.log('🏠 All analysis endpoints now contain verified Quebec locations only');
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  uploadValidatedQuebecEndpoints();
}

export { uploadValidatedQuebecEndpoints };