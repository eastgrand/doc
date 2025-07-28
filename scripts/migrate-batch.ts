#!/usr/bin/env ts-node

// Batch migration script - migrate files one by one with progress

import { config } from 'dotenv';
import { promises as fs } from 'fs';
import { join } from 'path';
import { uploadEndpointData } from '../utils/blob-data-loader';

// Load environment variables
config({ path: join(process.cwd(), '.env.local') });

const ENDPOINTS_DIR = join(process.cwd(), 'public/data/endpoints');

async function migrateInBatches() {
  console.log('Starting batch migration...');

  const files = await fs.readdir(ENDPOINTS_DIR);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  
  // Sort by file size (smallest first)
  const fileInfo = await Promise.all(
    jsonFiles.map(async (file) => {
      const stats = await fs.stat(join(ENDPOINTS_DIR, file));
      return { file, size: stats.size, sizeMB: (stats.size / (1024 * 1024)).toFixed(1) };
    })
  );
  fileInfo.sort((a, b) => a.size - b.size);

  console.log(`\nFound ${fileInfo.length} files to migrate:`);
  fileInfo.forEach((info, i) => {
    console.log(`${i + 1}. ${info.file} (${info.sizeMB}MB)`);
  });
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < fileInfo.length; i++) {
    const { file, sizeMB } = fileInfo[i];
    const endpoint = file.replace('.json', '');
    const filePath = join(ENDPOINTS_DIR, file);

    try {
      console.log(`[${i + 1}/${fileInfo.length}] Migrating ${endpoint} (${sizeMB}MB)...`);
      
      const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      const success = await uploadEndpointData(endpoint, data);
      
      if (success) {
        successCount++;
        console.log(`✅ ${endpoint} uploaded successfully\n`);
      } else {
        failCount++;
        console.log(`❌ ${endpoint} failed to upload\n`);
      }
    } catch (error) {
      failCount++;
      console.error(`❌ Error with ${endpoint}:`, error?.message || error);
      console.log('');
    }

    // Add small delay between uploads to avoid rate limits
    if (i < fileInfo.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${fileInfo.length}`);
  
  if (successCount === fileInfo.length) {
    console.log(`\n🎉 All files migrated successfully! Ready for deployment.`);
  } else {
    console.log(`\n⚠️  ${failCount} files failed. Retry migration before deployment.`);
  }
}

if (require.main === module) {
  migrateInBatches();
}