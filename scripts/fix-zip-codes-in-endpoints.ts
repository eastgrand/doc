#!/usr/bin/env ts-node

// Fix ZIP codes in California endpoint data
// Extract ZIP codes from DESCRIPTION field and update ID field

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEnergyEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');
const BLOB_MAPPING_FILE = join(process.cwd(), 'public/data/blob-urls-energy.json');

interface EndpointRecord {
  OBJECTID: number;
  DESCRIPTION: string;
  ID: string;
  [key: string]: any;
}

interface EndpointData {
  success: boolean;
  total_records: number;
  results: EndpointRecord[];
}

function extractZipFromDescription(description: string): string | null {
  // Match patterns like "00065 (Plumas National Park)" or "92084 (Vista)" 
  const match = description.match(/^(\d{5})\s*\(/);
  return match ? match[1] : null;
}

function fixZipCodesInData(data: EndpointData): { fixed: EndpointData; stats: any } {
  let fixedCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  const fixedResults = data.results.map((record, index) => {
    const zipFromDescription = extractZipFromDescription(record.DESCRIPTION || '');
    
    if (zipFromDescription) {
      fixedCount++;
      return {
        ...record,
        ID: zipFromDescription,
        ZIP: zipFromDescription, // Also update ZIP field if it exists
        // Keep OBJECTID as is - it's the original record identifier
      };
    } else {
      errorCount++;
      errors.push(`Record ${index}: Could not extract ZIP from "${record.DESCRIPTION}"`);
      return record; // Return unchanged if we can't extract ZIP
    }
  });

  return {
    fixed: {
      ...data,
      results: fixedResults
    },
    stats: {
      totalRecords: data.results.length,
      fixedCount,
      errorCount,
      errors: errors.slice(0, 5), // Show first 5 errors
      successRate: ((fixedCount / data.results.length) * 100).toFixed(1)
    }
  };
}

async function fixAllEndpointFiles() {
  console.log('🚀 Starting ZIP code fix for all endpoint files...');

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
    } catch (error) {
      console.error('❌ Endpoints directory not found:', ENDPOINTS_DIR);
      process.exit(1);
    }

    const files = await fs.readdir(ENDPOINTS_DIR);
    const jsonFiles = files.filter(file => 
      file.endsWith('.json') && 
      !file.includes('blob-urls') && 
      !file.includes('all_endpoints') &&
      !file.includes('comprehensive_generation_summary')
    );

    if (jsonFiles.length === 0) {
      console.log('ℹ️  No endpoint files found to fix');
      return;
    }

    console.log(`Found ${jsonFiles.length} endpoint files to fix and re-upload`);
    
    const blobUrlMappings: Record<string, string> = {};
    let processedCount = 0;
    let failedCount = 0;
    const overallStats = {
      totalFiles: jsonFiles.length,
      totalRecords: 0,
      totalFixed: 0,
      totalErrors: 0
    };

    for (const file of jsonFiles) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      try {
        console.log(`\n📝 Processing ${endpoint}...`);
        
        const rawData = await fs.readFile(filePath, 'utf-8');
        const data: EndpointData = JSON.parse(rawData);
        
        // Fix ZIP codes in the data
        const { fixed, stats } = fixZipCodesInData(data);
        
        // Update overall stats
        overallStats.totalRecords += stats.totalRecords;
        overallStats.totalFixed += stats.fixedCount;
        overallStats.totalErrors += stats.errorCount;
        
        console.log(`   📊 Stats: ${stats.fixedCount}/${stats.totalRecords} records fixed (${stats.successRate}%)`);
        
        if (stats.errorCount > 0) {
          console.log(`   ⚠️  ${stats.errorCount} errors - first few:`);
          stats.errors.forEach((error: string) => console.log(`      ${error}`));
        }
        
        // Upload fixed data to blob storage
        console.log(`   📤 Uploading fixed data to /energy/...`);
        const blobUrl = await uploadEnergyEndpointData(endpoint, fixed);
        
        if (blobUrl) {
          console.log(`   ✅ Successfully uploaded ${endpoint}`);
          blobUrlMappings[endpoint] = blobUrl;
          processedCount++;
        } else {
          console.log(`   ❌ Failed to upload ${endpoint}`);
          failedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${endpoint}:`, error);
        failedCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Update blob URL mappings file
    console.log(`\n💾 Updating blob URL mappings file: ${BLOB_MAPPING_FILE}`);
    await fs.writeFile(
      BLOB_MAPPING_FILE, 
      JSON.stringify(blobUrlMappings, null, 2),
      'utf-8'
    );

    console.log('\n🎉 ZIP code fix complete!');
    console.log(`📊 Overall Statistics:`);
    console.log(`   Files processed: ${processedCount}/${overallStats.totalFiles}`);
    console.log(`   Records fixed: ${overallStats.totalFixed}/${overallStats.totalRecords}`);
    console.log(`   Success rate: ${((overallStats.totalFixed / overallStats.totalRecords) * 100).toFixed(1)}%`);
    console.log(`   Failed uploads: ${failedCount}`);
    
    if (overallStats.totalErrors > 0) {
      console.log(`   ⚠️  Total records with errors: ${overallStats.totalErrors}`);
    }
    
  } catch (error) {
    console.error('❌ ZIP code fix failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixAllEndpointFiles();
}

export { fixAllEndpointFiles, extractZipFromDescription };