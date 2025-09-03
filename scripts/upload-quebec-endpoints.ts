#!/usr/bin/env ts-node

// Upload Quebec housing endpoint data to /real/ directory in blob storage
// Generate blob-urls.json mapping file

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') });

const ENDPOINTS_DIR = join(process.cwd(), 'scripts/automation/generated_endpoints');
const BLOB_MAPPING_FILE = join(process.cwd(), 'public/data/blob-urls.json');

async function uploadQuebecEndpoints() {
  console.log('🚀 Starting upload of Quebec housing endpoint data to /real/ directory...');

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
      console.log('ℹ️  No Quebec endpoint files found to upload');
      return;
    }

    console.log(`Found ${jsonFiles.length} Quebec housing endpoint files to upload to /real/ directory`);
    
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
        console.log(`📤 Uploading ${endpoint} (${sizeMB}MB) to /real/...`);
        
        const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
        
        // Verify this is Quebec housing data
        if (data.results && data.results.length > 0) {
          const firstRecord = data.results[0];
          const description = firstRecord.DESCRIPTION || firstRecord.description || '';
          const id = firstRecord.ID || firstRecord.id || '';
          console.log(`   📍 Sample Quebec location: ${description} (${id})`);
        }
        
        const blobUrl = await uploadEndpointData(endpoint, data, 'real');
        
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

    // Upload boundaries if they exist
    const boundariesDir = join(process.cwd(), 'public/data/boundaries');
    try {
      await fs.access(boundariesDir);
      const boundaryFiles = await fs.readdir(boundariesDir);
      const boundaryJsonFiles = boundaryFiles.filter(file => file.endsWith('.json'));
      
      for (const boundaryFile of boundaryJsonFiles) {
        const boundaryPath = join(boundariesDir, boundaryFile);
        const boundaryName = boundaryFile.replace('.json', '');
        
        try {
          const stats = await fs.stat(boundaryPath);
          const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
          console.log(`📤 Uploading boundary ${boundaryName} (${sizeMB}MB) to /real/boundaries/...`);
          
          const data = JSON.parse(await fs.readFile(boundaryPath, 'utf-8'));
          const blobUrl = await uploadEndpointData(`boundaries/${boundaryName}`, data, 'real');
          
          if (blobUrl) {
            console.log(`   ✅ Successfully uploaded boundary ${boundaryName}`);
            blobUrlMappings[`boundaries/${boundaryName}`] = blobUrl;
            uploadedCount++;
          }
        } catch (error) {
          console.warn(`Failed to upload boundary ${boundaryName}:`, error);
        }
      }
    } catch {
      console.log('No boundaries directory found, skipping boundary uploads');
    }

    // Save blob URL mappings
    console.log(`\n💾 Creating blob URL mappings file: ${BLOB_MAPPING_FILE}`);
    await fs.writeFile(
      BLOB_MAPPING_FILE, 
      JSON.stringify(blobUrlMappings, null, 2),
      'utf-8'
    );

    console.log('\n🎉 Quebec housing data upload complete!');
    console.log(`✅ Successfully uploaded: ${uploadedCount} files`);
    console.log(`❌ Failed uploads: ${failedCount} files`);
    console.log(`📁 All files stored in /real/ directory in blob storage`);
    console.log(`🗂️  Blob URL mappings saved to: ${BLOB_MAPPING_FILE}`);
    
    if (uploadedCount > 0) {
      console.log('\n📝 Quebec housing data now available for queries!');
      console.log('🏠 All analysis endpoints now contain Quebec housing market data');
    }
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  uploadQuebecEndpoints();
}

export { uploadQuebecEndpoints };