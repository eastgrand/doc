#!/usr/bin/env ts-node

// Upload California endpoint data to /energy/ directory in blob storage
// Generate blob-urls-energy.json mapping file

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEnergyEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');
const BLOB_MAPPING_FILE = join(process.cwd(), 'public/data/blob-urls-energy.json');

async function uploadEnergyEndpoints() {
  console.log('🚀 Starting upload of California endpoint data to /energy/ directory...');

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
      console.log('ℹ️  No endpoint files found to upload');
      return;
    }

    console.log(`Found ${jsonFiles.length} endpoint files to upload to /energy/ directory`);
    
    // Process files sorted by size (smaller first)
    const filesSorted = await Promise.all(
      jsonFiles.map(async (file) => {
        const stats = await fs.stat(join(ENDPOINTS_DIR, file));
        return { file, size: stats.size };
      })
    );
    filesSorted.sort((a, b) => a.size - b.size);

    const blobUrlMappings: Record<string, string> = {};
    let uploadedCount = 0;
    let failedCount = 0;

    for (const { file } of filesSorted) {
      const filePath = join(ENDPOINTS_DIR, file);
      const endpoint = file.replace('.json', '');
      
      try {
        const stats = await fs.stat(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        console.log(`📤 Uploading ${endpoint} (${sizeMB}MB) to /energy/...`);
        
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        // Verify this is California data
        if (data.results && data.results.length > 0) {
          const firstRecord = data.results[0];
          const description = firstRecord.DESCRIPTION || firstRecord.description || '';
          console.log(`   📍 Sample location: ${description}`);
        }
        
        const blobUrl = await uploadEnergyEndpointData(endpoint, data);
        
        if (blobUrl) {
          console.log(`   ✅ Successfully uploaded ${endpoint} (${sizeMB}MB)`);
          console.log(`   🔗 URL: ${blobUrl}`);
          blobUrlMappings[endpoint] = blobUrl;
          uploadedCount++;
        } else {
          console.log(`   ❌ Failed to upload ${endpoint}`);
          failedCount++;
        }
      } catch (error) {
        console.error(`❌ Error uploading ${endpoint}:`, error);
        failedCount++;
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save blob URL mappings
    console.log(`\n💾 Creating blob URL mappings file: ${BLOB_MAPPING_FILE}`);
    await fs.writeFile(
      BLOB_MAPPING_FILE, 
      JSON.stringify(blobUrlMappings, null, 2),
      'utf-8'
    );

    console.log('\n🎉 Upload complete!');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    console.log(`📁 All files stored in /energy/ directory in blob storage`);
    console.log(`🗂️  Blob URL mappings saved to: ${BLOB_MAPPING_FILE}`);
    
    if (uploadedCount > 0) {
      console.log('\n📝 Next step: Update the system to use blob-urls-energy.json');
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  uploadEnergyEndpoints();
}

export { uploadEnergyEndpoints };